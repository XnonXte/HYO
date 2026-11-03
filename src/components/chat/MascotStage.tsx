import type { FC } from "react";

export type MascotMood = "idle" | "thinking" | "talking";

interface MascotStageProps {
  mood: MascotMood;
  isCompact?: boolean;
}

/** Small avatar poses used by the compact header pill. */
const MASCOT_IMAGES: Record<MascotMood, string> = {
  idle: "/assets/mascot-new/mascot-idle.png",
  thinking: "/assets/mascot-new/mascot-think.png",
  talking: "/assets/mascot-new/mascot-talk.png",
};

/** Hero poses: the Figma side-view mascot while idle. */
const HERO_IMAGES: Record<MascotMood, string> = {
  idle: "/assets/mascot-new/mascot-idle.png",
  thinking: "/assets/mascot-new/mascot-think.png",
  talking: "/assets/mascot-new/mascot-talk.png",
};

export const MascotStage: FC<MascotStageProps> = ({
  mood,
  isCompact = false,
}) => {
  if (isCompact) {
    const currentImage = MASCOT_IMAGES[mood] || MASCOT_IMAGES.idle;

    return (
      <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white/85 backdrop-blur-md border border-slate-200/60 shadow-sm">
        <div className="relative size-7 rounded-full bg-blue-100/70 overflow-hidden flex items-center justify-center shrink-0">
          <img
            src={currentImage}
            alt={`HYO is ${mood}`}
            className={`size-6 object-contain transition-all duration-300 ${
              mood === "thinking"
                ? "animate-pulse scale-105"
                : mood === "talking"
                  ? "scale-110"
                  : ""
            }`}
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[12px] font-semibold text-slate-800 leading-none">
            HYO Companion
          </span>
          <span className="text-[10px] text-[#005ab6] font-medium leading-tight">
            {mood === "thinking"
              ? "Thinking of response..."
              : mood === "talking"
                ? "Speaking with you..."
                : "Here for you"}
          </span>
        </div>
      </div>
    );
  }

  const heroImage = HERO_IMAGES[mood] || HERO_IMAGES.idle;

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col items-center text-center">
      {/* Greeting */}
      <div className="shrink-0">
        <h1 className="font-bold text-[26px] tracking-tight leading-[1.2] text-black">
          Hey there,
        </h1>
        <h2 className="font-bold text-[26px] tracking-tight leading-[1.2] text-[#005ab6]">
          how are you today?
        </h2>
        <p className="font-medium text-[14px] text-[#475569] max-w-[262px] mx-auto mt-3 leading-[1.45]">
          I'm here to listen, support, and figure things out with you.
        </p>
      </div>

      {/* Mascot stage: fills the height left on the screen, mascot stays centred in it */}
      <div className="relative w-full flex-1 min-h-[96px] mt-4 flex items-center justify-center">
        {/* Soft pastel backdrop */}
        <div
          aria-hidden="true"
          className="absolute -inset-x-6 inset-y-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 55% at 50% 50%, rgba(222,234,255,0.85) 0%, rgba(238,244,255,0.55) 55%, rgba(255,255,255,0) 100%)",
          }}
        />

        <div className="relative w-full h-full max-h-[260px]">
          {/* Floor shadow */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[170px] h-[22px] rounded-full bg-[#9db9e6]/40 blur-[10px]"
          />

          <div className="absolute inset-x-0 top-0 bottom-3">
            <img
              src={heroImage}
              alt={`HYO mascot (${mood})`}
              className={`w-full h-full object-contain transition-all duration-500 ${
                mood === "thinking" ? "scale-105 animate-pulse" : ""
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
