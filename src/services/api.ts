/**
 * Centralized API Client and HTTP Handling for HYO
 * Reads VITE_API_BASE_URL with fallback to http://localhost:8000
 */

// Read base URL from Vite environment variables (do not hardcode)
const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// Normalize URL by removing any trailing slash
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

export class ApiException extends Error {
  statusCode?: number;
  detail?: unknown;

  constructor(message: string, statusCode?: number, detail?: unknown) {
    super(message);
    this.name = 'ApiException';
    this.statusCode = statusCode;
    this.detail = detail;
  }
}

/**
 * Generic fetch wrapper with robust error handling, JSON parsing,
 * and user-friendly error translation.
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle non-OK HTTP status codes
    if (!response.ok) {
      let errorMessage = `Request failed with status ${response.status}`;
      let errorDetail: unknown = null;

      try {
        const errorJson = await response.json();
        errorDetail = errorJson?.detail;

        if (typeof errorDetail === 'string' && errorDetail.trim()) {
          errorMessage = errorDetail;
        } else if (Array.isArray(errorDetail)) {
          // Pydantic validation errors array
          const messages = errorDetail
            .map((err) => (typeof err === 'object' && err?.msg ? err.msg : String(err)))
            .filter(Boolean);
          if (messages.length > 0) {
            errorMessage = messages.join('. ');
          }
        }
      } catch {
        // Fallback friendly messages by HTTP status code if JSON parsing fails
        if (response.status === 429) {
          errorMessage = 'HYO is currently experiencing high demand. Please try again in a moment.';
        } else if (response.status === 504) {
          errorMessage = 'HYO took too long to respond. Please try again.';
        } else if (response.status === 503) {
          errorMessage = 'HYO is temporarily unavailable. Please try again shortly.';
        } else if (response.status === 502) {
          errorMessage = 'The AI service encountered an upstream issue. Please try again.';
        } else if (response.status >= 500) {
          errorMessage = 'Something went wrong on the server. Please try again later.';
        }
      }

      throw new ApiException(errorMessage, response.status, errorDetail);
    }

    // Parse JSON response
    return (await response.json()) as T;
  } catch (error) {
    if (error instanceof ApiException) {
      throw error;
    }

    // Handle network / connection errors (e.g. backend server is not running)
    const err = error as Error;
    if (err.name === 'TypeError' && err.message.toLowerCase().includes('fetch')) {
      throw new ApiException(
        'Unable to connect to the HYO backend server. Please verify the server is running.',
        0,
        err.message
      );
    }

    throw new ApiException(
      err.message || 'An unexpected error occurred while communicating with the server.',
      undefined,
      err
    );
  }
}
