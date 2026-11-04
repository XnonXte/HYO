/**
 * Keeps Talk sessions at app level so a conversation survives tab changes,
 * and saves every change to LocalStorage so it survives refreshes.
 *
 * Replies from HYO are written to the session they were sent from, even if the
 * user has meanwhile started a new chat or left the Talk screen.
 */

import { useCallback, useEffect, useMemo, useRef, useState, type FC, type ReactNode } from 'react';
import { chatService } from '../services/chatService';
import { ApiException } from '../services/api';
import type { ChatMessage } from '../types/chat';
import {
  ACTIVE_TALK_SESSION_KEY,
  TALK_SESSIONS_KEY,
  appendMessage,
  createMessage,
  createSession,
  deleteSession as deleteSessionFromStore,
  generateId,
  getSession as getSessionFromStore,
  loadTalkStore,
  patchMessage,
  removeMessage,
  saveTalkStore,
  setActiveSession,
  type TalkStore,
} from '../services/talkStorage';
import {
  TalkSessionsContext,
  type TalkSessionError,
  type TalkSessionsContextValue,
} from './talkSessionsContext';

// The backend accepts at most 50 history items per request
const MAX_HISTORY_ITEMS = 50;

export const TalkSessionsProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<TalkStore>(loadTalkStore);
  const [pendingSessionIds, setPendingSessionIds] = useState<ReadonlySet<string>>(new Set());
  const [errors, setErrors] = useState<Record<string, TalkSessionError>>({});

  // The ref is the source of truth so async callbacks never work on stale data;
  // React state mirrors it for rendering.
  const storeRef = useRef(store);
  const pendingRef = useRef(new Set<string>());

  const commit = useCallback((update: (prev: TalkStore) => TalkStore) => {
    const next = update(storeRef.current);
    if (next === storeRef.current) return;
    storeRef.current = next;
    saveTalkStore(next);
    setStore(next);
  }, []);

  const setPending = useCallback((sessionId: string, pending: boolean) => {
    if (pending) pendingRef.current.add(sessionId);
    else pendingRef.current.delete(sessionId);
    setPendingSessionIds(new Set(pendingRef.current));
  }, []);

  const setSessionError = useCallback((sessionId: string, error: TalkSessionError | null) => {
    setErrors((prev) => {
      if (!error && !(sessionId in prev)) return prev;
      const next = { ...prev };
      if (error) next[sessionId] = error;
      else delete next[sessionId];
      return next;
    });
  }, []);

  // Keep other open tabs of the app in sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== null && e.key !== TALK_SESSIONS_KEY && e.key !== ACTIVE_TALK_SESSION_KEY) {
        return;
      }
      const next = loadTalkStore();
      storeRef.current = next;
      setStore(next);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const sendToSession = useCallback(
    async (sessionId: string, content: string): Promise<boolean> => {
      const trimmed = content.trim();
      if (!trimmed || pendingRef.current.has(sessionId)) return false;

      const existing = getSessionFromStore(storeRef.current, sessionId);
      const history: ChatMessage[] = (existing?.messages ?? [])
        .filter((m) => !m.isError)
        .map((m) => ({ role: m.role, content: m.content }))
        .slice(-MAX_HISTORY_ITEMS);

      const userMessage = createMessage('user', trimmed);
      commit((prev) =>
        getSessionFromStore(prev, sessionId)
          ? appendMessage(prev, sessionId, userMessage)
          : setActiveSession(createSession(prev, sessionId, userMessage), sessionId),
      );
      setSessionError(sessionId, null);
      setPending(sessionId, true);

      try {
        const response = await chatService.sendMessage(trimmed, history);
        commit((prev) => appendMessage(prev, sessionId, createMessage('assistant', response.reply)));
        return true;
      } catch (err) {
        const message =
          err instanceof ApiException || err instanceof Error
            ? err.message
            : 'Unable to communicate with HYO. Please try again.';
        commit((prev) => patchMessage(prev, sessionId, userMessage.id, { isError: true }));
        setSessionError(sessionId, { message, failedContent: trimmed });
        return false;
      } finally {
        setPending(sessionId, false);
      }
    },
    [commit, setPending, setSessionError],
  );

  const sendMessage = useCallback(
    (content: string) =>
      sendToSession(storeRef.current.activeSessionId ?? generateId('talk'), content),
    [sendToSession],
  );

  const retryMessage = useCallback(
    async (messageId: string): Promise<boolean> => {
      const sessionId = storeRef.current.activeSessionId;
      if (!sessionId || pendingRef.current.has(sessionId)) return false;
      const target = getSessionFromStore(storeRef.current, sessionId)?.messages.find(
        (m) => m.id === messageId,
      );
      if (!target) return false;
      commit((prev) => removeMessage(prev, sessionId, messageId));
      return sendToSession(sessionId, target.content);
    },
    [commit, sendToSession],
  );

  const retryLastMessage = useCallback(async (): Promise<boolean> => {
    const sessionId = storeRef.current.activeSessionId;
    if (!sessionId || pendingRef.current.has(sessionId)) return false;
    const failed = errors[sessionId];
    if (!failed) return false;
    const lastErrored = getSessionFromStore(storeRef.current, sessionId)
      ?.messages.filter((m) => m.isError)
      .at(-1);
    if (lastErrored) commit((prev) => removeMessage(prev, sessionId, lastErrored.id));
    return sendToSession(sessionId, failed.failedContent);
  }, [commit, errors, sendToSession]);

  const clearError = useCallback(() => {
    const sessionId = storeRef.current.activeSessionId;
    if (sessionId) setSessionError(sessionId, null);
  }, [setSessionError]);

  const startNewConversation = useCallback(() => {
    commit((prev) => setActiveSession(prev, null));
  }, [commit]);

  const getSession = useCallback(
    (sessionId: string) => getSessionFromStore(storeRef.current, sessionId),
    [],
  );

  const deleteSession = useCallback(
    (sessionId: string) => {
      commit((prev) => deleteSessionFromStore(prev, sessionId));
      setSessionError(sessionId, null);
    },
    [commit, setSessionError],
  );

  const value = useMemo<TalkSessionsContextValue>(
    () => ({
      sessions: store.sessions,
      activeSessionId: store.activeSessionId,
      activeSession: getSessionFromStore(store, store.activeSessionId),
      pendingSessionIds,
      errors,
      sendMessage,
      retryLastMessage,
      retryMessage,
      clearError,
      startNewConversation,
      getSession,
      deleteSession,
    }),
    [
      store,
      pendingSessionIds,
      errors,
      sendMessage,
      retryLastMessage,
      retryMessage,
      clearError,
      startNewConversation,
      getSession,
      deleteSession,
    ],
  );

  return <TalkSessionsContext.Provider value={value}>{children}</TalkSessionsContext.Provider>;
};
