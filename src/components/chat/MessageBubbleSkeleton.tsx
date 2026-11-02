import type { FC } from 'react';

export const MessageBubbleSkeleton: FC = () => {
  return (
    <div
      aria-label="AI Assistant is generating response"
      aria-busy="true"
      className="flex items-start gap-2.5 max-w-[88%] sm:max-w-[80%] self-start animate-fade-in"
    >
      {/* Mascot / Avatar Area */}
      <div className="shrink-0 size-8 sm:size-9 rounded-full bg-blue-100/80 border border-blue-200/60 flex items-center justify-center overflow-hidden shadow-xs mt-0.5">
        <img
          src="/assets/mascot-new/mascot-think.png"
          alt="HYO thinking"
          className="size-7 sm:size-8 object-contain animate-pulse"
        />
      </div>

      {/* Bubble Container */}
      <div className="flex flex-col gap-1 w-full min-w-[200px] max-w-[320px]">
        {/* Label */}
        <span className="text-[11px] font-semibold tracking-wide text-[#005ab6] ml-1 flex items-center gap-1.5">
          <span>HYO Assistant</span>
          <span className="size-1.5 rounded-full bg-blue-500 animate-ping inline-block" />
        </span>

        {/* Shimmer Bubble */}
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200/80 rounded-2xl rounded-tl-xs p-3.5 sm:p-4 shadow-sm">
          {/* Shimmer overlay layer */}
          <div className="animate-shimmer absolute inset-0 pointer-events-none" />

          {/* Skeleton lines with varying widths simulating natural text wrapping */}
          <div className="flex flex-col gap-2.5">
            <div className="h-3.5 bg-slate-200/80 rounded-full w-[85%]" />
            <div className="h-3.5 bg-slate-200/80 rounded-full w-[95%]" />
            <div className="h-3.5 bg-slate-200/80 rounded-full w-[60%]" />
          </div>
        </div>
      </div>
    </div>
  );
};
