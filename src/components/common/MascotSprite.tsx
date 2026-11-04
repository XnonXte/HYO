import type { CSSProperties, FC } from "react";

/** Poses cropped from the Figma mascot sprite sheet (/assets/splash/mascot-sprite.png). */
export type MascotPose = "peek" | "front" | "wave";

interface Crop {
  width: number;
  height: number;
  /** Image placement inside the box, in % of the box (values from Figma) */
  image: Pick<CSSProperties, "width" | "height" | "left" | "top">;
}

const CROPS: Record<MascotPose, Crop> = {
  peek: {
    width: 206,
    height: 163,
    image: { width: "501.96%", height: "421.4%", left: "-401.96%", top: "-179.01%" },
  },
  front: {
    width: 203,
    height: 224,
    image: { width: "510.3%", height: "307.51%", left: "-17.28%", top: "-207.51%" },
  },
  wave: {
    width: 174,
    height: 233,
    image: { width: "581.82%", height: "290.08%", left: "-261.36%", top: "-11.05%" },
  },
};

interface MascotSpriteProps {
  pose: MascotPose;
  className?: string;
  alt?: string;
}

export const MascotSprite: FC<MascotSpriteProps> = ({ pose, className = "", alt = "" }) => {
  const crop = CROPS[pose];
  return (
    <div
      className={`relative overflow-hidden pointer-events-none select-none ${className}`}
      style={{ width: crop.width, height: crop.height }}
      role={alt ? "img" : undefined}
      aria-label={alt || undefined}
      aria-hidden={alt ? undefined : true}
    >
      <img
        src="/assets/splash/mascot-sprite.png"
        alt=""
        draggable={false}
        className="absolute max-w-none"
        style={crop.image}
      />
    </div>
  );
};
