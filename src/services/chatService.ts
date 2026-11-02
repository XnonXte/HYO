/**
 * Chat Service for communicating with HYO FastAPI backend endpoints
 * Source endpoints:
 * - GET /api/health
 * - POST /api/chat
 */

import { apiRequest } from './api';
import type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  HealthResponse,
} from '../types/chat';

export const chatService = {
  /**
   * Check backend operational status via GET /api/health
   */
  async checkHealth(): Promise<HealthResponse> {
    return apiRequest<HealthResponse>('/api/health', {
      method: 'GET',
    });
  },

  /**
   * Send a chat message to HYO with optional conversation history.
   * Matches backend's ChatRequest schema.
   */
  async sendMessage(
    message: string,
    history: ChatMessage[] = []
  ): Promise<ChatResponse> {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      throw new Error('Message cannot be empty.');
    }

    const payload: ChatRequest = {
      message: trimmedMessage,
      history,
    };

    return apiRequest<ChatResponse>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  /**
   * Transcribe recorded audio blob via backend Gemini endpoint
   */
  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const audio_base64 = btoa(binary);

    const payload = {
      audio_base64,
      mime_type: audioBlob.type || 'audio/webm',
    };

    const response = await apiRequest<{ text: string }>('/api/transcribe', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return response.text || '';
  },
};
