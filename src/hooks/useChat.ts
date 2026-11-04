/**
 * Custom React hook for HYO Chat state management.
 * Reads the active Talk session from TalkSessionsProvider, which owns sending,
 * loading/error state and LocalStorage persistence, so the conversation
 * survives tab changes and page refreshes.
 */

import { useMemo } from 'react';
import { useTalkSessions } from './useTalkSessions';
import type { UiMessage } from '../types/chat';

export interface UseChatReturn {
  /** Id of the session being shown; null for a fresh chat that has no messages yet */
  sessionId: string | null;
  messages: UiMessage[];
  isLoading: boolean;
  error: string | null;
  lastFailedMessage: string | null;
  sendMessage: (content: string) => Promise<boolean>;
  retryLastMessage: () => Promise<boolean>;
  retryMessage: (messageId: string) => Promise<boolean>;
  clearError: () => void;
  /** Starts a new, separate session. The current one stays saved in Journal. */
  resetConversation: () => void;
}

export function useChat(): UseChatReturn {
  const {
    activeSessionId,
    activeSession,
    pendingSessionIds,
    errors,
    sendMessage,
    retryLastMessage,
    retryMessage,
    clearError,
    startNewConversation,
  } = useTalkSessions();

  const messages = useMemo<UiMessage[]>(
    () =>
      (activeSession?.messages ?? []).map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp),
        isError: m.isError,
      })),
    [activeSession],
  );

  const sessionError = activeSessionId ? errors[activeSessionId] : undefined;

  return {
    sessionId: activeSessionId,
    messages,
    isLoading: activeSessionId !== null && pendingSessionIds.has(activeSessionId),
    error: sessionError?.message ?? null,
    lastFailedMessage: sessionError?.failedContent ?? null,
    sendMessage,
    retryLastMessage,
    retryMessage,
    clearError,
    resetConversation: startNewConversation,
  };
}
