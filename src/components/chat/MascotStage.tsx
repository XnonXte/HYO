import type { FC } from 'react';
import { Sparkles, Heart } from 'lucide-react';

export type MascotMood = 'idle' | 'thinking' | 'talking';

interface MascotStageProps {
  mood: MascotMood;
  isCompact?: boolean;
  onSelectPrompt?: (prompt: string) => void;
}

const MASCOT_IMAGES: Record<MascotMood, string> = {
  idle: '/assets/mascot-new/mascot-idle.png',
  thinking: '/assets/mascot-new/mascot-think.png',
  talking: '/assets/mascot-new/mascot-talk.png',
};

const SUGGESTED_PROMPTS = [
  "I'm feeling overwhelmed with college tasks.",
  "I'm having trouble sleeping from overthinking.",
  "Can you suggest a simple mindfulness exercise?",
  "I just need a safe space to vent right now.",
];

export const MascotStage: FC<MascotStageProps> = ({
  mood,
  isCompact = false,
  onSelectPrompt,
}) => {
  const currentImage = MASCOT_IMAGES[mood] || MASCOT_IMAGES.idle;

  if (isCompact) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/60 shadow-xs">
        <div className="relative size-7 rounded-full bg-blue-100/70 overflow-hidden flex items-center justify-center shrink-0">
          <img
            src={currentImage}
            alt={`HYO is ${mood}`}
            className={`size-6 object-contain transition-all duration-300 ${
              mood === 'thinking'
                ? 'animate-pulse scale-105'
                : mood === 'talking'
                ? 'scale-110'
                : ''
            }`}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] font-semibold text-slate-800 leading-none">
            HYO Companion
          </span>
          <span className="text-[10px] text-[#005ab6] font-medium leading-tight">
            {mood === 'thinking'
              ? 'Thinking of response...'
              : mood === 'talking'
              ? 'Speaking with you...'
              : 'Here for you'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center justify-center my-auto py-2 text-center animate-fade-in">
      {/* Dynamic Emotion Title */}
      <h1 className="font-['Inter'] font-bold text-[24px] sm:text-[26px] tracking-tight leading-tight text-slate-900">
        Hey there,
      </h1>
      <h2 className="font-['Inter'] font-bold text-[24px] sm:text-[26px] tracking-tight leading-tight text-[#005ab6]">
        how are you feeling today?
      </h2>
      <p className="font-['Inter'] font-medium text-[13.5px] text-[#475569] max-w-[300px] mt-2 leading-relaxed">
        I'm here to listen without judgment, support you, and figure things out together.
      </p>

      {/* 3D Mascot Character Stage */}
      <div className="relative my-4 flex flex-col items-center justify-center">
        {/* Soft Floor Shadow */}
        <div className="absolute bottom-2 w-44 h-7 rounded-full bg-blue-900/10 blur-[10px] scale-x-90" />

        <div className="relative size-48 sm:size-56 flex items-center justify-center">
          <img
            src={currentImage}
            alt={`HYO Mascot (${mood})`}
            className={`w-full h-full object-contain transition-all duration-500 ${
              mood === 'thinking'
                ? 'scale-105 animate-pulse'
                : mood === 'talking'
                ? 'scale-108 animate-bounce'
                : 'hover:scale-105'
            }`}
          />
        </div>

        {/* Status Pill beneath mascot */}
        <div className="mt-1 px-3 py-1 rounded-full bg-blue-50/80 border border-blue-200/60 flex items-center gap-1.5 shadow-xs">
          {mood === 'thinking' ? (
            <>
              <Sparkles className="size-3 text-blue-600 animate-spin" />
              <span className="text-[11px] font-semibold text-blue-700">
                HYO is processing...
              </span>
            </>
          ) : mood === 'talking' ? (
            <>
              <span className="size-2 rounded-full bg-blue-600 animate-ping" />
              <span className="text-[11px] font-semibold text-blue-700">
                HYO is responding...
              </span>
            </>
          ) : (
            <>
              <Heart className="size-3 text-rose-500 fill-rose-500" />
              <span className="text-[11px] font-semibold text-slate-600">
                Safe, confidential space
              </span>
            </>
          )}
        </div>
      </div>

      {/* Suggested Starters */}
      {onSelectPrompt && (
        <div className="w-full max-w-[360px] flex flex-col gap-2 mt-2 px-2">
          <span className="text-[11.5px] font-semibold uppercase tracking-wider text-slate-400">
            Suggested conversations
          </span>
          <div className="flex flex-col gap-1.5">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => onSelectPrompt(prompt)}
                className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white/90 hover:bg-blue-50/70 border border-slate-200/70 hover:border-blue-300 text-xs sm:text-[13px] text-slate-700 font-medium transition-all shadow-2xs hover:shadow-xs active:scale-[0.99] flex items-center justify-between group"
              >
                <span className="truncate">{prompt}</span>
                <span className="text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity ml-2 shrink-0">
                  →
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
