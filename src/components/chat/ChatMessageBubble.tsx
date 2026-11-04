import { useState, type FC } from 'react';
import { Volume2, VolumeX, AlertCircle, RotateCcw } from 'lucide-react';
import type { UiMessage } from '../../types/chat';
import { detectLanguage, type ChatLanguage } from '../../utils/language';
import { pickVoice, SPEECH_LOCALES } from '../../utils/speech';

interface ChatMessageBubbleProps {
  message: UiMessage;
  onRetry?: () => void;
  onSpeakingStateChange?: (speaking: boolean) => void;
  /** Language of the whole conversation, used when this message alone is unclear */
  conversationLanguage?: ChatLanguage | null;
}

export const ChatMessageBubble: FC<ChatMessageBubbleProps> = ({
  message,
  onRetry,
  onSpeakingStateChange,
  conversationLanguage = null,
}) => {
  const isUser = message.role === 'user';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      onSpeakingStateChange?.(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(message.content);
    // Speak in the conversation's language (Indonesian or English)
    const language = detectLanguage(message.content) ?? conversationLanguage ?? 'en';
    utterance.lang = SPEECH_LOCALES[language];
    const voice = pickVoice(language);
    if (voice) utterance.voice = voice;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      setIsSpeaking(true);
      onSpeakingStateChange?.(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      onSpeakingStateChange?.(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      onSpeakingStateChange?.(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isUser) {
    return (
      <div className="flex flex-col items-end max-w-[85%] sm:max-w-[78%] self-end group animate-fade-in">
        <div
          className={`relative px-4 py-3 rounded-2xl rounded-tr-xs shadow-xs text-sm sm:text-[14.5px] leading-relaxed break-words ${
            message.isError
              ? 'bg-rose-50 border border-rose-300 text-rose-900'
              : 'bg-[#005ab6] text-white shadow-[0px_2px_8px_rgba(0,90,182,0.2)]'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content}</p>

          {message.isError && (
            <div className="mt-2 pt-2 border-t border-rose-200/80 flex items-center justify-between gap-3 text-xs text-rose-700">
              <span className="flex items-center gap-1 font-medium">
                <AlertCircle className="size-3.5 shrink-0" />
                Failed to send
              </span>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-2 py-0.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1 shadow-xs transition-colors"
                >
                  <RotateCcw className="size-3" />
                  Retry
                </button>
              )}
            </div>
          )}
        </div>

        <span className="text-[10px] text-slate-400 mt-1 mr-1">
          {formattedTime}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2.5 max-w-[88%] sm:max-w-[82%] self-start group animate-fade-in">
      {/* Mascot / Avatar Area */}
      <div className="shrink-0 size-8 sm:size-9 rounded-full bg-blue-100/70 border border-blue-200/60 flex items-center justify-center overflow-hidden shadow-xs mt-0.5">
        <img
          src="/assets/mascot-new/mascot-idle.png"
          alt="HYO Mascot"
          className="size-7 sm:size-8 object-contain"
        />
      </div>

      {/* Bubble Container */}
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center justify-between ml-1 pr-1">
          <span className="text-[11px] font-semibold text-[#005ab6] tracking-wide">
            HYO Assistant
          </span>

          {typeof window !== 'undefined' && 'speechSynthesis' in window && (
            <button
              onClick={handleSpeak}
              className={`p-1 rounded-full transition-colors ${
                isSpeaking
                  ? 'text-blue-600 bg-blue-100/80'
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100 opacity-60 group-hover:opacity-100'
              }`}
              title={isSpeaking ? 'Stop speaking' : 'Read message aloud'}
              aria-label={isSpeaking ? 'Stop speaking' : 'Read message aloud'}
            >
              {isSpeaking ? (
                <VolumeX className="size-3.5" />
              ) : (
                <Volume2 className="size-3.5" />
              )}
            </button>
          )}
        </div>

        <div className="relative bg-slate-50/95 border border-slate-200/80 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 shadow-xs text-sm sm:text-[14.5px] text-slate-800 leading-relaxed break-words">
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        <span className="text-[10px] text-slate-400 ml-1">
          {formattedTime}
        </span>
      </div>
    </div>
  );
};
