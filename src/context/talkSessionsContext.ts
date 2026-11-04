import { createContext } from 'react';
import type { TalkSession } from '../services/talkStorage';

export interface TalkSessionError {
  message: string;
  /** Text of the user message that failed, so it can be retried */
  failedContent: string;
}

export interface TalkSessionsContextValue {
  /** All saved sessions, newest activity first */
  sessions: TalkSession[];
  /** Session shown on the Talk screen; null means a fresh, not-yet-saved chat */
  activeSessionId: string | null;
  activeSession: TalkSession | undefined;
  /** Sessions currently waiting for a reply from HYO */
  pendingSessionIds: ReadonlySet<string>;
  /** Last send error per session id */
  errors: Readonly<Record<string, TalkSessionError>>;

  /** Sends a message in the active session (creates the session on the first message). */
  sendMessage: (content: string) => Promise<boolean>;
  retryLastMessage: () => Promise<boolean>;
  retryMessage: (messageId: string) => Promise<boolean>;
  clearError: () => void;
  /** Leaves the current session saved and shows a fresh chat on Talk. */
  startNewConversation: () => void;
  getSession: (sessionId: string) => TalkSession | undefined;
  deleteSession: (sessionId: string) => void;
}

export const TalkSessionsContext = createContext<TalkSessionsContextValue | null>(null);
