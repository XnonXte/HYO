/**
 * TypeScript types for HYO Chat Integration
 * Source of truth: backend/app/schemas/chat.py
 */

export type ChatRole = 'user' | 'assistant';

/** Single message in conversation history matching backend schema */
export interface ChatMessage {
  role: ChatRole;
  content: string;
}

/** Request payload for POST /api/chat matching backend ChatRequest schema */
export interface ChatRequest {
  message: string;
  history?: ChatMessage[];
}

/** Response payload from POST /api/chat matching backend ChatResponse schema */
export interface ChatResponse {
  reply: string;
}

/** Response payload from GET /api/health matching backend HealthResponse schema */
export interface HealthResponse {
  status: string;
  service: string;
}

/** UI-level chat message with metadata for rendering, animations, and error handling */
export interface UiMessage {
  id: string;
  role: ChatRole;
  content: string;
  timestamp: Date;
  isError?: boolean;
}

/** Structured API Error */
export interface ApiError {
  message: string;
  statusCode?: number;
  detail?: string | unknown;
}
