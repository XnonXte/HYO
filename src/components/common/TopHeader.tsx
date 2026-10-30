import type { FC } from 'react';
import { Settings } from 'lucide-react';

interface TopHeaderProps {
  onOpenSettings?: () => void;
  className?: string;
}

export const TopHeader: FC<TopHeaderProps> = ({
  onOpenSettings,
  className = '',
}) => {
  return (
    <header
      className={`w-full h-16 px-4 flex items-center justify-between backdrop-blur-md bg-white/70 z-20 shrink-0 sticky top-0 transition-colors ${className}`}
    >
      <div className="flex items-center">
        <img
          src="/assets/logo.png"
          alt="Hyo"
          className="h-9 w-auto object-contain cursor-pointer transition-transform hover:scale-105 active:scale-95"
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onOpenSettings}
          className="size-11 rounded-full bg-white/90 border border-slate-200/60 shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] flex items-center justify-center text-[#005ab6] hover:bg-blue-50/50 hover:text-blue-700 active:scale-95 transition-all"
          title="Settings"
          aria-label="Settings"
        >
          <Settings className="size-5" />
        </button>
      </div>
    </header>
  );
};
