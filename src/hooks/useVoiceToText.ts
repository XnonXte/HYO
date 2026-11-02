import { useState, useEffect, useRef, useCallback } from 'react';
import { chatService } from '../services/chatService';

// SpeechRecognition type definitions for cross-browser Web Speech API
interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
      isFinal: boolean;
    };
    length: number;
  };
}

interface SpeechRecognitionErrorEventLike {
  error: string;
  message?: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export interface UseVoiceToTextOptions {
  onTranscript?: (text: string, isFinal: boolean) => void;
  lang?: string;
}

export interface UseVoiceToTextReturn {
  isListening: boolean;
  isTranscribing: boolean;
  isSupported: boolean;
  error: string | null;
  startListening: () => Promise<void>;
  stopListening: () => void;
  toggleListening: () => void;
  clearError: () => void;
}

export function useVoiceToText({
  onTranscript,
  lang = 'en-US',
}: UseVoiceToTextOptions = {}): UseVoiceToTextReturn {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSupported] = useState<boolean>(() => {
    return (
      typeof window !== 'undefined' &&
      (Boolean(window.SpeechRecognition || window.webkitSpeechRecognition) ||
        Boolean(navigator?.mediaDevices?.getUserMedia))
    );
  });

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const hasReceivedLiveTranscriptRef = useRef(false);
  const isListeningRef = useRef(false);
  const onTranscriptRef = useRef(onTranscript);

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  // Initialize SpeechRecognition if available
  useEffect(() => {
    const SpeechRecognitionClass =
      typeof window !== 'undefined'
        ? window.SpeechRecognition || window.webkitSpeechRecognition
        : undefined;

    if (!SpeechRecognitionClass) {
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onstart = () => {
        setIsListening(true);
        isListeningRef.current = true;
        setError(null);
      };

      recognition.onend = () => {
        // If mediaRecorder is still recording, we let user finish via stopListening
        if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
          setIsListening(false);
          isListeningRef.current = false;
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEventLike) => {
        // Ignore normal silence/abort timeouts
        if (event.error === 'no-speech' || event.error === 'aborted') {
          return;
        }

        // If 'network' occurs (e.g. Google speech server blocked by Brave/uBlock/VPN),
        // we silently let MediaRecorder capture the voice and transcribe via backend!
        if (event.error === 'network') {
          console.info('Browser cloud speech service unreachable. Falling back to in-app audio transcription.');
          return;
        }

        if (event.error === 'not-allowed') {
          setError('Microphone permission was denied. Please allow microphone access in your browser.');
        } else {
          setError(`Speech error: ${event.error}`);
        }
      };

      recognition.onresult = (event: SpeechRecognitionEventLike) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTranscript += item[0].transcript;
          } else {
            interimTranscript += item[0].transcript;
          }
        }

        const transcript = finalTranscript || interimTranscript;
        if (transcript) {
          hasReceivedLiveTranscriptRef.current = true;
          if (onTranscriptRef.current) {
            onTranscriptRef.current(transcript, Boolean(finalTranscript));
          }
        }
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('SpeechRecognition initialization error:', err);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [lang]);

  const stopMediaStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const stopListening = useCallback(() => {
    isListeningRef.current = false;
    setIsListening(false);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    } else {
      stopMediaStream();
    }
  }, [stopMediaStream]);

  const startListening = useCallback(async () => {
    setError(null);
    hasReceivedLiveTranscriptRef.current = false;
    audioChunksRef.current = [];

    // 1. Request microphone access
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('Audio recording is not supported in this browser.');
      return;
    }

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
    } catch (err: unknown) {
      const errorObj = err as Error;
      if (errorObj.name === 'NotAllowedError' || errorObj.name === 'PermissionDeniedError') {
        setError('Microphone permission was denied. Please allow microphone access in your browser or Windows Privacy Settings.');
      } else {
        setError('Unable to access microphone. Please check your audio input device.');
      }
      return;
    }

    setIsListening(true);
    isListeningRef.current = true;

    // 2. Start MediaRecorder for guaranteed audio capture
    try {
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : '';

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        stopMediaStream();

        // If Web Speech API already transcribed live speech, skip backend transcription
        if (hasReceivedLiveTranscriptRef.current) {
          return;
        }

        // If no live transcript was captured (e.g. cloud WebSpeech network blocked), send to backend
        const chunks = audioChunksRef.current;
        if (chunks.length === 0) return;

        const audioBlob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        if (audioBlob.size < 2000) {
          // Recording is too short/silent
          return;
        }

        setIsTranscribing(true);
        try {
          const text = await chatService.transcribeAudio(audioBlob);
          if (text && onTranscriptRef.current) {
            onTranscriptRef.current(text, true);
          }
        } catch (transcribeErr) {
          console.warn('Backend audio transcription notice:', transcribeErr);
        } finally {
          setIsTranscribing(false);
        }
      };

      recorder.start(250); // Collect slices every 250ms
    } catch (recorderErr) {
      console.warn('MediaRecorder error:', recorderErr);
    }

    // 3. Also start client-side SpeechRecognition for instant live streaming where available
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {
        // Recognition already running or failed; MediaRecorder handles it
      }
    }
  }, [stopMediaStream]);

  const toggleListening = useCallback(() => {
    if (isListeningRef.current || isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isListening,
    isTranscribing,
    isSupported,
    error,
    startListening,
    stopListening,
    toggleListening,
    clearError,
  };
}
