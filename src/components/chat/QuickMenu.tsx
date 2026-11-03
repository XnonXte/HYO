import { useEffect, useRef, useState, type FC } from "react";
import { LayoutGrid, MessageSquare, Video, Lock } from "lucide-react";

interface QuickMenuProps {
  /** Opens the text box so the user can chat by typing. */
  onChat: () => void;
  /** 'lg' is the floating button on the empty Talk screen, 'sm' sits in the conversation toolbar. */
  size?: "lg" | "sm";
}

/**
 * The four-squares button and its dropdown of ways to talk to HYO:
 * Chat (available) and Video call (locked for now).
 */
export const QuickMenu: FC<QuickMenuProps> = ({ onChat, size = "lg" }) => {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Escape closes the menu and returns focus to the trigger
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const isLarge = size === "lg";

  return (
    <div
      className={
        isLarge ? "absolute right-4 top-[104px] z-20" : "relative z-20"
      }
    >
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Talk options"
        title="Talk options"
        className={`rounded-full flex items-center justify-center active:scale-95 transition-all ${
          isLarge
            ? "size-[50px] bg-white border border-white/80 shadow-[0px_6px_18px_rgba(74,144,226,0.18)]"
            : "size-9 backdrop-blur-md bg-white/80 border border-white/70 shadow-sm"
        } ${isOpen ? "text-[#005ab6]" : isLarge ? "text-[#414753]" : "text-slate-700"} hover:text-[#005ab6]`}
      >
        <LayoutGrid className={isLarge ? "size-5" : "size-4"} />
      </button>

      {isOpen && (
        <>
          {/* Tap anywhere outside to dismiss */}
          <button
            type="button"
            aria-hidden="true"
            tabIndex={-1}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 z-20 cursor-default"
          />

          <div
            role="menu"
            aria-label="Talk options"
            className="absolute right-0 top-full mt-2 z-30 w-[236px] rounded-2xl bg-white border border-slate-100 shadow-[0px_16px_40px_-8px_rgba(30,64,120,0.25)] p-1.5 flex flex-col gap-0.5"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setIsOpen(false);
                onChat();
              }}
              className="w-full flex items-center gap-3 rounded-xl px-2.5 py-2 text-left hover:bg-blue-50/70 active:scale-[0.99] transition-colors"
            >
              <span className="size-10 rounded-xl bg-blue-50 text-[#005ab6] flex items-center justify-center shrink-0">
                <MessageSquare className="size-5" />
              </span>
              <span className="flex flex-col min-w-0">
                <span className="text-sm font-semibold text-slate-800">
                  Chat
                </span>
                <span className="text-xs text-slate-500">Type a message</span>
              </span>
            </button>

            {/* Locked: visible but not available yet */}
            <button
              type="button"
              role="menuitem"
              aria-disabled="true"
              onClick={(e) => e.preventDefault()}
              className="w-full flex items-center gap-3 rounded-xl px-2.5 py-2 text-left cursor-not-allowed"
            >
              <span className="size-10 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center shrink-0">
                <Video className="size-5" />
              </span>
              <span className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-slate-400">
                  Video call
                </span>
                <span className="text-xs text-slate-400">
                  Subscribe to unlock
                </span>
              </span>
              <span className="size-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shrink-0">
                <Lock className="size-3.5" aria-hidden="true" />
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};
