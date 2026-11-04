import { useEffect, useState, type FC } from "react";
import { MascotSprite, type MascotPose } from "../common/MascotSprite";

interface SplashScreenProps {
  onFinish: () => void;
}

interface SplashStep {
  pose: MascotPose;
  /** Vertical offset of the mascot's center from the screen center, in px (from Figma) */
  offsetY: number;
  /** How long the move into this step takes */
  moveMs: number;
  easing: string;
  /** How long to stay on this step before the next one */
  holdMs: number;
}

// Figma frames 159:132 → 159:386: hidden, peek, rise, jump, land, wave
const STEPS: SplashStep[] = [
  { pose: "peek", offsetY: 210.5, moveMs: 0, easing: "linear", holdMs: 350 },
  { pose: "peek", offsetY: 32.5, moveMs: 650, easing: "cubic-bezier(0.22, 1, 0.36, 1)", holdMs: 450 },
  { pose: "front", offsetY: 85, moveMs: 0, easing: "linear", holdMs: 250 },
  { pose: "front", offsetY: -132, moveMs: 420, easing: "cubic-bezier(0.22, 1, 0.36, 1)", holdMs: 80 },
  { pose: "front", offsetY: -14, moveMs: 380, easing: "cubic-bezier(0.55, 0, 0.75, 0.2)", holdMs: 250 },
  { pose: "wave", offsetY: -30.5, moveMs: 160, easing: "ease-out", holdMs: 1100 },
];

// Top edge of the white cover the mascot rises from, relative to screen center (Figma: 573 of 956)
const HORIZON_OFFSET_Y = 95;

function prefersReducedMotion(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}

/** Animated intro: the mascot peeks up from behind the horizon, jumps, lands and waves. */
export const SplashScreen: FC<SplashScreenProps> = ({ onFinish }) => {
  const [reducedMotion] = useState(prefersReducedMotion);
  const [stepIndex, setStepIndex] = useState(reducedMotion ? STEPS.length - 1 : 0);

  useEffect(() => {
    const step = STEPS[stepIndex];
    const isLast = stepIndex === STEPS.length - 1;
    const delay = reducedMotion ? 900 : step.moveMs + step.holdMs;
    const timer = setTimeout(() => {
      if (isLast) onFinish();
      else setStepIndex((i) => i + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [stepIndex, reducedMotion, onFinish]);

  const step = STEPS[stepIndex];

  return (
    <button
      type="button"
      onClick={onFinish}
      aria-label="HYO is starting. Tap to skip."
      className="relative w-full h-full bg-white overflow-hidden cursor-default"
    >
      {/* Mascot */}
      <div
        className="absolute left-1/2 top-1/2"
        style={{
          transform: `translate(-50%, calc(-50% + ${step.offsetY}px))`,
          transition: reducedMotion
            ? "none"
            : `transform ${step.moveMs}ms ${step.easing}`,
        }}
      >
        <MascotSprite pose={step.pose} />
      </div>

      {/* White cover: the "horizon" the mascot rises from */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 bg-white"
        style={{ top: `calc(50% + ${HORIZON_OFFSET_Y}px)` }}
      />
    </button>
  );
};
