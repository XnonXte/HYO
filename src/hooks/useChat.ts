/**
 * Custom React hook for HYO Chat state management
 * Handles conversational state, history formatting, loading, and error recovery
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { chatService } from '../services/chatService';
import { ApiException } from '../services/api';
import type { ChatMessage, UiMessage } from '../types/chat';

export interface UseChatReturn {
  messages: UiMessage[];
  isLoading: boolean;
  error: string | null;
  lastFailedMessage: string | null;
  sendMessage: (content: string) => Promise<boolean>;
  retryLastMessage: () => Promise<boolean>;
  retryMessage: (messageId: string) => Promise<boolean>;
  clearError: () => void;
  resetConversation: () => void;
}

export function useChat(initialMessages: UiMessage[] = []): UseChatReturn {
  const [messages, setMessages] = useState<UiMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);

  // Keep a ref of messages to access the latest state in async callbacks without closures issues
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const resetConversation = useCallback(() => {
    setMessages([]);
    setError(null);
    setLastFailedMessage(null);
    setIsLoading(false);
  }, []);

  const sendMessage = useCallback(
    async (content: string): Promise<boolean> => {
      const trimmed = content.trim();
      if (!trimmed || isLoading) {
        return false;
      }

      setError(null);
      setLastFailedMessage(null);

      // Create stable UI message for user
      const userMessageId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const userMessage: UiMessage = {
        id: userMessageId,
        role: 'user',
        content: trimmed,
        timestamp: new Date(),
      };

      // Format current history for backend schema (excluding any errored messages)
      const currentHistory: ChatMessage[] = messagesRef.current
        .filter((m) => !m.isError)
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // Optimistically append user message to local state
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await chatService.sendMessage(trimmed, currentHistory);

        // Append assistant response
        const assistantMessageId = `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const assistantMessage: UiMessage = {
          id: assistantMessageId,
          role: 'assistant',
          content: response.reply,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
        setIsLoading(false);
        return true;
      } catch (err) {
        setIsLoading(false);
        setLastFailedMessage(trimmed);

        const errorMessage =
          err instanceof ApiException
            ? err.message
            : err instanceof Error
            ? err.message
            : 'Unable to communicate with HYO. Please try again.';

        setError(errorMessage);

        // Mark user message with error state if desirable or keep it in history
        setMessages((prev) =>
          prev.map((m) =>
            m.id === userMessageId ? { ...m, isError: true } : m
          )
        );

        return false;
      }
    },
    [isLoading]
  );

  const retryLastMessage = useCallback(async (): Promise<boolean> => {
    if (!lastFailedMessage || isLoading) {
      return false;
    }

    // Remove the failed user message before re-sending to avoid duplicate display
    setMessages((prev) => {
      const lastIndex = prev.findLastIndex((m) => m.isError);
      if (lastIndex !== -1) {
        return prev.filter((_, idx) => idx !== lastIndex);
      }
      return prev;
    });

    const messageToRetry = lastFailedMessage;
    setLastFailedMessage(null);
    setError(null);
    return sendMessage(messageToRetry);
  }, [lastFailedMessage, isLoading, sendMessage]);

  const retryMessage = useCallback(
    async (messageId: string): Promise<boolean> => {
      if (isLoading) return false;
      const target = messagesRef.current.find((m) => m.id === messageId);
      if (!target) return false;

      // Remove target message from state
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      setError(null);
      setLastFailedMessage(null);
      return sendMessage(target.content);
    },
    [isLoading, sendMessage]
  );

  return {
    messages,
    isLoading,
    error,
    lastFailedMessage,
    sendMessage,
    retryLastMessage,
    retryMessage,
    clearError,
    resetConversation,
  };
}
