import { useState, useEffect, useRef, useCallback, type FC, type KeyboardEvent } from 'react';
import { Send, Mic, MicOff, RotateCcw, Plus, LayoutGrid, AlertCircle, X, Sparkles } from 'lucide-react';
import { useChat } from '../../hooks/useChat';
import { useVoiceToText } from '../../hooks/useVoiceToText';
import { MessageBubbleSkeleton } from '../chat/MessageBubbleSkeleton';
import { ChatMessageBubble } from '../chat/ChatMessageBubble';
import { MascotStage, type MascotMood } from '../chat/MascotStage';

interface AiTalkScreenProps {
  onOpenQuickMenu?: () => void;
}

export const AiTalkScreen: FC<AiTalkScreenProps> = ({ onOpenQuickMenu }) => {
  const {
    messages,
    isLoading,
    error,
    lastFailedMessage,
    sendMessage,
    retryLastMessage,
    retryMessage,
    clearError,
    resetConversation,
  } = useChat();

  const [inputContent, setInputContent] = useState('');
  const [isTTSActive, setIsTTSActive] = useState(false);
  const [recentlyReceivedAssistantId, setRecentlyReceivedAssistantId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Voice to text integration
  const handleTranscript = useCallback((text: string) => {
    setInputContent((prev) => {
      // Append smoothly if text already exists
      if (!prev.trim()) {
        return text;
      }
      return `${prev} ${text}`;
    });
  }, []);

  const {
    isListening,
    isTranscribing,
    isSupported: isVoiceSupported,
    error: voiceError,
    toggleListening,
    clearError: clearVoiceError,
  } = useVoiceToText({
    onTranscript: handleTranscript,
  });

  // Track recent assistant messages to trigger talking state for 4 seconds
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant' && !lastMessage.isError) {
        const id = lastMessage.id;
        const startTimer = setTimeout(() => {
          setRecentlyReceivedAssistantId(id);
        }, 0);
        const endTimer = setTimeout(() => {
          setRecentlyReceivedAssistantId((curr) => (curr === id ? null : curr));
        }, 4000);
        return () => {
          clearTimeout(startTimer);
          clearTimeout(endTimer);
        };
      }
    }
  }, [messages]);

  // Derive Mascot State Transitions cleanly: idle -> thinking -> talking -> idle
  const mascotMood: MascotMood = (isLoading || isTranscribing)
    ? 'thinking'
    : isTTSActive || (recentlyReceivedAssistantId !== null && messages[messages.length - 1]?.id === recentlyReceivedAssistantId)
    ? 'talking'
    : 'idle';

  // Auto-scroll to bottom of conversation
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end',
    });
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isLoading, scrollToBottom]);

  // Handle message submission
  const handleSend = async () => {
    const textToSend = inputContent.trim();
    if (!textToSend || isLoading) return;

    setInputContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    await sendMessage(textToSend);
  };

  // Keyboard navigation: Enter to send, Shift + Enter for newline
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Handle auto-resizing textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  // Handle clicking a suggested prompt starter
  const handleSelectSuggestedPrompt = async (prompt: string) => {
    if (isLoading) return;
    await sendMessage(prompt);
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
      {/* Background Ambient Glow Orbs */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 size-72 rounded-full bg-blue-300/25 blur-[36px] pointer-events-none" />
      <div className="absolute top-64 -left-16 size-60 rounded-full bg-indigo-200/30 blur-[28px] pointer-events-none" />
      <div className="absolute bottom-28 -right-16 size-56 rounded-full bg-sky-200/35 blur-[28px] pointer-events-none" />

      {/* Top Floating Status Pill & Context Controls */}
      <div className="w-full flex items-center justify-between px-4 pt-2 pb-1 z-20 shrink-0">
        {messages.length > 0 ? (
          <button
            onClick={resetConversation}
            className="h-9 px-3 rounded-full backdrop-blur-md bg-white/80 border border-slate-200/70 shadow-xs flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#005ab6] active:scale-95 transition-all"
            title="Start new conversation"
          >
            <Plus className="size-3.5 text-[#005ab6]" />
            <span>New Chat</span>
          </button>
        ) : (
          <div className="w-9" />
        )}

        {/* Dynamic Presence / Compact Mascot Header */}
        {messages.length === 0 ? (
          <div className="backdrop-blur-md bg-white/80 border border-white/70 h-9 px-3.5 rounded-full shadow-[0px_4px_16px_0px_rgba(74,144,226,0.12)] flex items-center gap-2">
            <span className="relative flex size-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full size-2.5 bg-[#005ab6]" />
            </span>
            <span className="font-['Inter'] font-semibold text-[13px] text-[#005ab6]">
              HYO is here
            </span>
          </div>
        ) : (
          <MascotStage mood={mascotMood} isCompact />
        )}

        {/* Quick Menu Action Button */}
        <button
          onClick={onOpenQuickMenu}
          className="size-9 rounded-full backdrop-blur-md bg-white/80 border border-white/70 shadow-xs flex items-center justify-center text-slate-700 hover:text-[#005ab6] active:scale-95 transition-all"
          title="Menu"
          aria-label="Menu"
        >
          <LayoutGrid className="size-4" />
        </button>
      </div>

      {/* Scrollable Conversation Viewport */}
      <div className="flex-1 w-full overflow-y-auto px-4 py-2 z-10 flex flex-col no-scrollbar">
        {messages.length === 0 ? (
          /* Empty State: Interactive Mascot Hero Stage */
          <MascotStage
            mood={mascotMood}
            onSelectPrompt={handleSelectSuggestedPrompt}
          />
        ) : (
          /* Active Conversation: Chat Bubble Flow */
          <div className="w-full flex flex-col gap-4 py-2">
            {messages.map((message) => (
              <ChatMessageBubble
                key={message.id}
                message={message}
                onRetry={() => retryMessage(message.id)}
                onSpeakingStateChange={setIsTTSActive}
              />
            ))}

            {/* AI Loading Skeleton Silhouette while generating */}
            {isLoading && <MessageBubbleSkeleton />}

            <div ref={messagesEndRef} className="h-2" />
          </div>
        )}
      </div>

      {/* Chat API Error & Feedback Banner */}
      {error && (
        <div className="z-20 px-4 py-1.5 animate-fade-in shrink-0">
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs shadow-xs">
            <div className="flex items-center gap-2 truncate">
              <AlertCircle className="size-4 text-rose-600 shrink-0" />
              <span className="truncate">{error}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {lastFailedMessage && !isLoading && (
                <button
                  onClick={() => retryLastMessage()}
                  className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1 shadow-2xs transition-colors"
                >
                  <RotateCcw className="size-3" />
                  Retry
                </button>
              )}
              <button
                onClick={clearError}
                className="p-1 rounded-md text-rose-500 hover:bg-rose-100/60"
                aria-label="Dismiss error"
              >
                <X className="size-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice-to-Text Notification Toast (Auto-dismissing) */}
      {voiceError && !error && (
        <div className="z-20 px-4 py-1 animate-fade-in shrink-0 flex justify-center">
          <div className="w-full max-w-[380px] flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs shadow-2xs">
            <span className="truncate">{voiceError}</span>
            <button
              onClick={clearVoiceError}
              className="p-0.5 text-amber-700 hover:text-amber-900"
              aria-label="Dismiss voice notification"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Voice-to-Text Listening / Transcribing Indicator Pill */}
      {(isListening || isTranscribing) && (
        <div className="z-20 px-4 py-1 shrink-0 flex justify-center">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-medium shadow-md animate-pulse">
            <span className="size-2 rounded-full bg-white animate-ping" />
            <span>
              {isTranscribing
                ? 'Transcribing audio with HYO AI...'
                : 'Listening... Tap mic again when finished speaking'}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Sticky Chat Input Bar (Above BottomNav) */}
      <div className="w-full px-4 pt-1 pb-24 z-20 shrink-0">
        <div className="w-full backdrop-blur-xl bg-white/95 border border-slate-200/90 rounded-[24px] p-2 shadow-[0px_8px_24px_-4px_rgba(74,144,226,0.16)] flex items-end gap-1.5">
          {/* Voice to Text Button */}
          <button
            type="button"
            onClick={toggleListening}
            disabled={isTranscribing}
            className={`size-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
              isListening
                ? 'bg-rose-500 text-white shadow-md ring-2 ring-rose-200 animate-pulse'
                : isTranscribing
                ? 'bg-blue-100 text-blue-600 animate-spin'
                : 'text-slate-500 hover:text-[#005ab6] hover:bg-blue-50/70'
            }`}
            title={
              !isVoiceSupported
                ? 'Voice input not supported in this browser'
                : isListening
                ? 'Stop recording and transcribe'
                : 'Tap to speak (Voice-to-Text)'
            }
            aria-label={isListening ? 'Stop voice recording' : 'Start voice recording'}
          >
            {isListening ? (
              <MicOff className="size-5" />
            ) : isTranscribing ? (
              <Sparkles className="size-4 animate-spin text-blue-600" />
            ) : (
              <Mic className="size-5" />
            )}
          </button>

          {/* Textarea Input */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={inputContent}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={
              isTranscribing
                ? 'Transcribing voice...'
                : isListening
                ? 'Listening to your voice...'
                : 'Type a message or tap mic...'
            }
            disabled={isLoading || isTranscribing}
            aria-label="Chat message"
            className="flex-1 max-h-32 min-h-[40px] py-2 px-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent resize-none focus:outline-none leading-relaxed"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!inputContent.trim() || isLoading}
            className={`size-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
              inputContent.trim() && !isLoading
                ? 'bg-gradient-to-r from-[#005ab6] to-[#1672df] text-white shadow-[0px_4px_12px_rgba(0,90,182,0.3)] hover:scale-105 active:scale-95'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
            }`}
            title="Send message (Enter)"
            aria-label="Send message"
          >
            {isLoading ? (
              <Sparkles className="size-4 animate-spin text-slate-400" />
            ) : (
              <Send className="size-4.5" />
            )}
          </button>
        </div>

        {/* Microcopy Reassurance */}
        <p className="text-[11px] text-center text-slate-400 mt-1.5 font-medium">
          HYO is a supportive AI companion. For medical crises, tap Counselor in the menu.
        </p>
      </div>
    </div>
  );
};
