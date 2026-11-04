/**
 * LocalStorage persistence for Talk sessions.
 *
 * Two keys are used:
 * - "talk_sessions": array of sessions, each with its own messages
 * - "active_talk_session_id": id of the session the Talk screen shows, or absent
 *
 * Every function that changes data is pure: it takes a store and returns a new one
 * (or the same object when nothing changed), so callers decide when to save.
 */

import type { ChatRole } from '../types/chat';

export const TALK_SESSIONS_KEY = 'talk_sessions';
export const ACTIVE_TALK_SESSION_KEY = 'active_talk_session_id';

const TITLE_MAX_LENGTH = 48;
const PREVIEW_MAX_LENGTH = 120;

export interface StoredTalkMessage {
  id: string;
  role: ChatRole;
  content: string;
  /** ISO-8601 timestamp */
  timestamp: string;
  /** True when the message failed to reach HYO (kept so the user can retry it). */
  isError?: boolean;
}

export interface TalkSession {
  id: string;
  title: string;
  /** ISO-8601 timestamp */
  createdAt: string;
  /** ISO-8601 timestamp */
  updatedAt: string;
  messages: StoredTalkMessage[];
}

export interface TalkStore {
  /** Newest activity first */
  sessions: TalkSession[];
  /** Always the id of a session in `sessions`, or null when Talk shows a fresh chat */
  activeSessionId: string | null;
}

export const EMPTY_TALK_STORE: TalkStore = { sessions: [], activeSessionId: null };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function generateId(prefix: string): string {
  const random =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${random}`;
}

export function createMessage(
  role: ChatRole,
  content: string,
  now: Date = new Date(),
): StoredTalkMessage {
  return {
    id: generateId(role === 'user' ? 'user' : 'assistant'),
    role,
    content,
    timestamp: now.toISOString(),
  };
}

function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

/** Title comes from the first user message. */
export function deriveSessionTitle(messages: StoredTalkMessage[]): string {
  const firstUser = messages.find((m) => m.role === 'user' && m.content.trim());
  return firstUser ? truncate(firstUser.content, TITLE_MAX_LENGTH) : 'New conversation';
}

/** Short preview of the latest message, used on Journal cards. */
export function getSessionPreview(session: TalkSession): string {
  const last = [...session.messages].reverse().find((m) => m.content.trim());
  if (!last) return 'No messages yet';
  const prefix = last.role === 'user' ? 'You: ' : 'HYO: ';
  return prefix + truncate(last.content, PREVIEW_MAX_LENGTH);
}

function isValidIsoDate(value: unknown): value is string {
  return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

function sortByRecent(sessions: TalkSession[]): TalkSession[] {
  return [...sessions].sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
}

// ---------------------------------------------------------------------------
// Validation of data read from LocalStorage
// ---------------------------------------------------------------------------

function sanitizeMessage(raw: unknown): StoredTalkMessage | null {
  if (!raw || typeof raw !== 'object') return null;
  const m = raw as Record<string, unknown>;
  if (typeof m.id !== 'string' || !m.id) return null;
  if (m.role !== 'user' && m.role !== 'assistant') return null;
  if (typeof m.content !== 'string' || !m.content.trim()) return null;
  if (!isValidIsoDate(m.timestamp)) return null;
  const message: StoredTalkMessage = {
    id: m.id,
    role: m.role,
    content: m.content,
    timestamp: m.timestamp,
  };
  if (m.isError === true) message.isError = true;
  return message;
}

function sanitizeSession(raw: unknown): TalkSession | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Record<string, unknown>;
  if (typeof s.id !== 'string' || !s.id) return null;
  if (!Array.isArray(s.messages)) return null;

  const seen = new Set<string>();
  const messages: StoredTalkMessage[] = [];
  for (const item of s.messages) {
    const message = sanitizeMessage(item);
    if (message && !seen.has(message.id)) {
      seen.add(message.id);
      messages.push(message);
    }
  }
  // A session without any messages is useless on Journal; drop it.
  if (messages.length === 0) return null;

  const createdAt = isValidIsoDate(s.createdAt) ? s.createdAt : messages[0].timestamp;
  const updatedAt = isValidIsoDate(s.updatedAt)
    ? s.updatedAt
    : messages[messages.length - 1].timestamp;
  const title =
    typeof s.title === 'string' && s.title.trim() ? s.title : deriveSessionTitle(messages);

  return { id: s.id, title, createdAt, updatedAt, messages };
}

/** Turns anything into a valid store: drops bad entries, removes duplicate ids, fixes the active id. */
export function sanitizeTalkStore(rawSessions: unknown, rawActiveId: unknown): TalkStore {
  const byId = new Map<string, TalkSession>();
  if (Array.isArray(rawSessions)) {
    for (const item of rawSessions) {
      const session = sanitizeSession(item);
      if (!session) continue;
      const existing = byId.get(session.id);
      // On duplicate ids keep the copy that was updated last
      if (!existing || Date.parse(session.updatedAt) > Date.parse(existing.updatedAt)) {
        byId.set(session.id, session);
      }
    }
  }
  const activeSessionId =
    typeof rawActiveId === 'string' && byId.has(rawActiveId) ? rawActiveId : null;
  return { sessions: sortByRecent([...byId.values()]), activeSessionId };
}

// ---------------------------------------------------------------------------
// Reading and writing LocalStorage
// ---------------------------------------------------------------------------

function getStorage(): Storage | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage : null;
  } catch {
    // Access can throw in private mode or when site data is blocked
    return null;
  }
}

function parseJson(text: string | null): unknown {
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

// Last values written, so identical saves are skipped
let lastWrittenSessions: string | null = null;
let lastWrittenActiveId: string | null = null;

export function loadTalkStore(): TalkStore {
  const storage = getStorage();
  if (!storage) return EMPTY_TALK_STORE;
  try {
    const rawSessions = storage.getItem(TALK_SESSIONS_KEY);
    const rawActive = storage.getItem(ACTIVE_TALK_SESSION_KEY);
    lastWrittenSessions = rawSessions;
    lastWrittenActiveId = rawActive;
    return sanitizeTalkStore(parseJson(rawSessions), rawActive);
  } catch {
    return EMPTY_TALK_STORE;
  }
}

/** Saves the store. Returns false if the browser refused the write (e.g. storage full). */
export function saveTalkStore(store: TalkStore): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    const sessionsJson = JSON.stringify(store.sessions);
    if (sessionsJson !== lastWrittenSessions) {
      storage.setItem(TALK_SESSIONS_KEY, sessionsJson);
      lastWrittenSessions = sessionsJson;
    }
    if (store.activeSessionId !== lastWrittenActiveId) {
      if (store.activeSessionId) {
        storage.setItem(ACTIVE_TALK_SESSION_KEY, store.activeSessionId);
      } else {
        storage.removeItem(ACTIVE_TALK_SESSION_KEY);
      }
      lastWrittenActiveId = store.activeSessionId;
    }
    return true;
  } catch (err) {
    console.warn('HYO: could not save Talk sessions to LocalStorage.', err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Session operations (pure)
// ---------------------------------------------------------------------------

export function getSession(store: TalkStore, sessionId: string | null): TalkSession | undefined {
  if (!sessionId) return undefined;
  return store.sessions.find((s) => s.id === sessionId);
}

/** Adds a new session that starts with `firstMessage`. Does nothing if the id already exists. */
export function createSession(
  store: TalkStore,
  sessionId: string,
  firstMessage: StoredTalkMessage,
): TalkStore {
  if (getSession(store, sessionId)) return store;
  const session: TalkSession = {
    id: sessionId,
    title: deriveSessionTitle([firstMessage]),
    createdAt: firstMessage.timestamp,
    updatedAt: firstMessage.timestamp,
    messages: [firstMessage],
  };
  return { ...store, sessions: [session, ...store.sessions] };
}

/** Applies `updater` to one session's messages and refreshes its title and updatedAt. */
export function updateSessionMessages(
  store: TalkStore,
  sessionId: string,
  updater: (messages: StoredTalkMessage[]) => StoredTalkMessage[],
  now: Date = new Date(),
): TalkStore {
  const session = getSession(store, sessionId);
  if (!session) return store;
  const messages = updater(session.messages);
  if (messages === session.messages) return store;

  // Removing the last message leaves nothing worth keeping
  if (messages.length === 0) return deleteSession(store, sessionId);

  const updated: TalkSession = {
    ...session,
    messages,
    title: deriveSessionTitle(messages),
    updatedAt: now.toISOString(),
  };
  return {
    ...store,
    sessions: sortByRecent(store.sessions.map((s) => (s.id === sessionId ? updated : s))),
  };
}

export function appendMessage(
  store: TalkStore,
  sessionId: string,
  message: StoredTalkMessage,
): TalkStore {
  return updateSessionMessages(
    store,
    sessionId,
    (messages) => (messages.some((m) => m.id === message.id) ? messages : [...messages, message]),
    new Date(message.timestamp),
  );
}

export function patchMessage(
  store: TalkStore,
  sessionId: string,
  messageId: string,
  patch: Partial<Omit<StoredTalkMessage, 'id'>>,
): TalkStore {
  return updateSessionMessages(store, sessionId, (messages) =>
    messages.some((m) => m.id === messageId)
      ? messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m))
      : messages,
  );
}

export function removeMessage(store: TalkStore, sessionId: string, messageId: string): TalkStore {
  return updateSessionMessages(store, sessionId, (messages) =>
    messages.some((m) => m.id === messageId) ? messages.filter((m) => m.id !== messageId) : messages,
  );
}

export function deleteSession(store: TalkStore, sessionId: string): TalkStore {
  if (!getSession(store, sessionId)) return store;
  return {
    sessions: store.sessions.filter((s) => s.id !== sessionId),
    activeSessionId: store.activeSessionId === sessionId ? null : store.activeSessionId,
  };
}

/** Sets which session Talk shows. Unknown ids are treated as null (fresh chat). */
export function setActiveSession(store: TalkStore, sessionId: string | null): TalkStore {
  const next = sessionId && getSession(store, sessionId) ? sessionId : null;
  return next === store.activeSessionId ? store : { ...store, activeSessionId: next };
}
