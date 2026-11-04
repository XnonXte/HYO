import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type FC,
  type KeyboardEvent,
  type ChangeEvent,
} from "react";
import {
  Send,
  Mic,
  MicOff,
  RotateCcw,
  Plus,
  AlertCircle,
  X,
  Sparkles,
  Square,
} from "lucide-react";
import { useChat } from "../../hooks/useChat";
import { useVoiceToText } from "../../hooks/useVoiceToText";
import { MessageBubbleSkeleton } from "../chat/MessageBubbleSkeleton";
import { ChatMessageBubble } from "../chat/ChatMessageBubble";
import { MascotStage, type MascotMood } from "../chat/MascotStage";
import { QuickMenu } from "../chat/QuickMenu";
import { detectConversationLanguage } from "../../utils/language";

/** Solid microphone glyph for the hero button (lucide's Mic is outline-only). */
const SolidMicIcon: FC<{ className?: string }> = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    aria-hidden="true"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    fill="none"
  >
    <rect
      x="9"
      y="2.5"
      width="6"
      height="11.5"
      rx="3"
      fill="currentColor"
      stroke="none"
    />
    <path d="M5.5 11.5a6.5 6.5 0 0 0 13 0" />
    <path d="M12 18v3M8.5 21h7" />
  </svg>
);

export const AiTalkScreen: FC = () => {
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

  const [inputContent, setInputContent] = useState("");
  const [liveCaption, setLiveCaption] = useState("");
  // In the empty "hero" state the text box is hidden until the user chooses to type
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [isTTSActive, setIsTTSActive] = useState(false);
  const [recentlyReceivedAssistantId, setRecentlyReceivedAssistantId] =
    useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  // Lets the transcript callback stop recording even though it's created before the hook returns
  const stopListeningRef = useRef<() => void>(() => {});

  const isHero = messages.length === 0;
  // Read-aloud uses the conversation's language when a message alone is unclear
  const conversationLanguage = useMemo(
    () => detectConversationLanguage(messages.map((m) => m.content)),
    [messages],
  );
  const showComposer = !isHero || isComposerOpen;

  // Voice-to-text: interim results only drive the live caption; the final result is
  // committed to the text box (so the user can review/edit before sending).
  const handleTranscript = useCallback((text: string, isFinal: boolean) => {
    const clean = text.trim();
    if (!clean) return;

    if (!isFinal) {
      setLiveCaption(clean);
      return;
    }

    setLiveCaption("");
    setInputContent((prev) =>
      prev.trim() ? `${prev.trim()} ${clean}` : clean,
    );
    setIsComposerOpen(true);
    stopListeningRef.current();
  }, []);

  const {
    isListening,
    isTranscribing,
    isSupported: isVoiceSupported,
    error: voiceError,
    toggleListening,
    stopListening,
    clearError: clearVoiceError,
  } = useVoiceToText({
    onTranscript: handleTranscript,
  });

  useEffect(() => {
    stopListeningRef.current = stopListening;
  }, [stopListening]);

  const caption = isListening ? liveCaption : "";

  // Track recent assistant messages to trigger talking state for 4 seconds.
  // Only fresh replies count, so a restored conversation doesn't replay the animation.
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const remainingMs = 4000 - (Date.now() - lastMessage.timestamp.getTime());
      if (
        lastMessage.role === "assistant" &&
        !lastMessage.isError &&
        remainingMs > 0
      ) {
        const id = lastMessage.id;
        const startTimer = setTimeout(() => {
          setRecentlyReceivedAssistantId(id);
        }, 0);
        const endTimer = setTimeout(() => {
          setRecentlyReceivedAssistantId((curr) => (curr === id ? null : curr));
        }, remainingMs);
        return () => {
          clearTimeout(startTimer);
          clearTimeout(endTimer);
        };
      }
    }
  }, [messages]);

  // Derive Mascot State Transitions cleanly: idle -> thinking -> talking -> idle
  const mascotMood: MascotMood =
    isLoading || isTranscribing
      ? "thinking"
      : isTTSActive ||
          (recentlyReceivedAssistantId !== null &&
            messages[messages.length - 1]?.id === recentlyReceivedAssistantId)
        ? "talking"
        : "idle";

  // Auto-scroll to bottom of conversation
  const scrollToBottom = useCallback((smooth = true) => {
    messagesEndRef.current?.scrollIntoView({
      behavior: smooth ? "smooth" : "auto",
      block: "end",
    });
  }, []);

  useEffect(() => {
    scrollToBottom(true);
  }, [messages, isLoading, scrollToBottom]);

  // Auto-size the textarea to its content (max 120px), including voice-filled text
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [inputContent, showComposer]);

  const openComposer = useCallback(() => {
    setIsComposerOpen(true);
    requestAnimationFrame(() => textareaRef.current?.focus());
  }, []);

  // Big hero mic: start/stop recording (falls back to typing if voice is unavailable)
  const handleHeroMic = () => {
    if (!isVoiceSupported) {
      openComposer();
      return;
    }
    toggleListening();
  };

  const handleNewChat = () => {
    stopListening();
    resetConversation();
    setInputContent("");
    setLiveCaption("");
    setIsComposerOpen(false);
  };

  // Handle message submission
  const handleSend = async () => {
    const textToSend = inputContent.trim();
    if (!textToSend || isLoading) return;

    setInputContent("");
    await sendMessage(textToSend);
  };

  // Keyboard navigation: Enter to send, Shift + Enter for newline
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setInputContent(e.target.value);
  };

  const micLabel = isTranscribing
    ? "Transcribing..."
    : isListening
      ? "Listening... tap when you're done"
      : isVoiceSupported
        ? "Tap to speak"
        : "Voice isn't available here";

  return (
    <div
      className={`relative w-full flex flex-col pt-16 ${
        // Empty state grows with its content (scrolls only if the screen is too short);
        // a conversation fills the screen exactly and scrolls its message list.
        isHero ? "flex-1 overflow-x-clip" : "h-full overflow-hidden"
      }`}
    >
      {/* Backgrounds */}
      {isHero ? (
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[380px] pointer-events-none z-0"
          style={{
            background:
              "radial-gradient(ellipse 230px 215px at 50% 70px, rgba(150,200,255,0.6) 0%, rgba(190,222,255,0.45) 45%, rgba(215,235,255,0.18) 75%, rgba(255,255,255,0) 100%)",
          }}
        />
      ) : (
        <>
          <div className="absolute top-10 left-1/2 -translate-x-1/2 size-72 rounded-full bg-blue-300/25 blur-[36px] pointer-events-none" />
          <div className="absolute top-64 -left-16 size-60 rounded-full bg-indigo-200/30 blur-[28px] pointer-events-none" />
          <div className="absolute bottom-28 -right-16 size-56 rounded-full bg-sky-200/35 blur-[28px] pointer-events-none" />
        </>
      )}

      {isHero ? (
        <>
          {/* Floating menu button (top right, under the header): Chat / Video call */}
          <QuickMenu onChat={openComposer} size="lg" />

          {/* Greeting + mascot */}
          <div className="relative z-10 flex-1 min-h-0 flex flex-col items-center px-6 pt-[clamp(24px,7dvh,96px)]">
            <MascotStage mood={mascotMood} />
          </div>
        </>
      ) : (
        <>
          {/* Conversation controls */}
          <div className="w-full flex items-center justify-between px-4 pt-2 pb-1 z-20 shrink-0">
            <button
              onClick={handleNewChat}
              className="h-9 px-3 rounded-full backdrop-blur-md bg-white/80 border border-slate-200/70 shadow-sm flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-[#005ab6] active:scale-95 transition-all"
              title="Start new conversation"
            >
              <Plus className="size-3.5 text-[#005ab6]" />
              <span>New Chat</span>
            </button>

            <MascotStage mood={mascotMood} isCompact />

            <QuickMenu onChat={openComposer} size="sm" />
          </div>

          {/* Scrollable Conversation Viewport */}
          <div className="flex-1 w-full overflow-y-auto px-4 py-2 z-10 flex flex-col no-scrollbar">
            <div className="w-full flex flex-col gap-4 py-2">
              {messages.map((message) => (
                <ChatMessageBubble
                  key={message.id}
                  message={message}
                  onRetry={() => retryMessage(message.id)}
                  onSpeakingStateChange={setIsTTSActive}
                  conversationLanguage={conversationLanguage}
                />
              ))}

              {/* AI Loading Skeleton Silhouette while generating */}
              {isLoading && <MessageBubbleSkeleton />}

              <div ref={messagesEndRef} className="h-2" />
            </div>
          </div>
        </>
      )}

      {/* Chat API Error & Feedback Banner */}
      {error && (
        <div className="z-20 px-4 py-1.5 shrink-0">
          <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs shadow-sm">
            <div className="flex items-center gap-2 truncate">
              <AlertCircle className="size-4 text-rose-600 shrink-0" />
              <span className="truncate">{error}</span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {lastFailedMessage && !isLoading && (
                <button
                  onClick={() => retryLastMessage()}
                  className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1 shadow-sm transition-colors"
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

      {/* Voice-to-Text Notification Toast */}
      {voiceError && !error && (
        <div className="z-20 px-4 py-1 shrink-0 flex justify-center">
          <div className="w-full max-w-[380px] flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs shadow-sm">
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

      {showComposer ? (
        <>
          {/* Listening / Transcribing indicator (the hero mic has its own label) */}
          {(isListening || isTranscribing) && (
            <div className="z-20 px-4 py-1 shrink-0 flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-600 text-white text-xs font-medium shadow-md animate-pulse">
                <span className="size-2 rounded-full bg-white animate-ping" />
                <span>
                  {isTranscribing
                    ? "Transcribing audio with HYO AI..."
                    : "Listening... Tap mic again when finished speaking"}
                </span>
              </div>
              {caption && (
                <p className="max-w-[340px] text-center text-xs italic text-slate-500 line-clamp-2">
                  {caption}
                </p>
              )}
            </div>
          )}

          {/* Bottom Sticky Chat Input Bar (Above BottomNav) */}
          <div className="w-full px-4 pt-1 pb-24 z-20 shrink-0">
            {isHero && (
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="mx-auto mb-2 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-[#005ab6] hover:bg-blue-50/70 active:scale-95 transition-all"
              >
                <Mic className="size-3.5" />
                <span>Back to voice</span>
              </button>
            )}

            <div className="w-full backdrop-blur-xl bg-white/95 border border-slate-200/90 rounded-[24px] p-2 shadow-[0px_8px_24px_-4px_rgba(74,144,226,0.16)] flex items-end gap-1.5">
              {/* Voice to Text Button */}
              <button
                type="button"
                onClick={toggleListening}
                disabled={isTranscribing}
                className={`size-10 rounded-full flex items-center justify-center transition-all shrink-0 ${
                  isListening
                    ? "bg-rose-500 text-white shadow-md ring-2 ring-rose-200 animate-pulse"
                    : isTranscribing
                      ? "bg-blue-100 text-blue-600 animate-spin"
                      : "text-slate-500 hover:text-[#005ab6] hover:bg-blue-50/70"
                }`}
                title={
                  !isVoiceSupported
                    ? "Voice input not supported in this browser"
                    : isListening
                      ? "Stop recording and transcribe"
                      : "Tap to speak (Voice-to-Text)"
                }
                aria-label={
                  isListening ? "Stop voice recording" : "Start voice recording"
                }
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
                    ? "Transcribing voice..."
                    : isListening
                      ? "Listening to your voice..."
                      : "Type a message or tap mic..."
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
                    ? "bg-gradient-to-r from-[#005ab6] to-[#1672df] text-white shadow-[0px_4px_12px_rgba(0,90,182,0.3)] hover:scale-105 active:scale-95"
                    : "bg-slate-100 text-slate-400 cursor-not-allowed"
                }`}
                title="Send message (Enter)"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Sparkles className="size-4 animate-spin text-slate-400" />
                ) : (
                  <Send className="size-[18px]" />
                )}
              </button>
            </div>

            {/* Microcopy Reassurance */}
            <p className="text-[11px] text-center text-slate-400 mt-1.5 font-medium">
              HYO is a supportive AI companion. For medical crises, seek further
              help.
            </p>
          </div>
        </>
      ) : (
        /* Hero voice block: big mic + helper copy (typing lives in the top-right menu) */
        <div className="relative z-10 w-full shrink-0 px-6 pb-[100px] flex flex-col items-center">
          <div className="relative w-full flex justify-center">
            <button
              type="button"
              onClick={handleHeroMic}
              disabled={isTranscribing}
              aria-label={isListening ? "Stop recording" : "Start speaking"}
              aria-pressed={isListening}
              className="relative size-[106px] rounded-full flex items-center justify-center text-white bg-gradient-to-br from-[#005ab6] to-[#1672df] shadow-[0px_18px_36px_-8px_rgba(0,90,182,0.45),0px_6px_14px_rgba(22,114,223,0.25)] active:scale-95 transition-transform disabled:opacity-80"
            >
              {isListening && (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 rounded-full bg-[#1672df]/40 animate-ping"
                />
              )}
              <span className="relative flex items-center justify-center">
                {isTranscribing ? (
                  <Sparkles className="size-9 animate-spin" />
                ) : isListening ? (
                  <Square className="size-8 fill-current" />
                ) : (
                  <SolidMicIcon className="size-11" />
                )}
              </span>
            </button>
          </div>

          <p className="mt-4 font-semibold text-[18px] text-[#475569]">
            {micLabel}
          </p>
          <p
            className={`mt-2 max-w-[280px] min-h-[42px] text-center font-medium text-[14px] leading-[1.45] text-[#475569] ${
              caption ? "italic line-clamp-2" : ""
            }`}
          >
            {caption ||
              "You can share anything. There's no right or wrong way to start."}
          </p>
        </div>
      )}
    </div>
  );
};
