import type { FC } from 'react';

interface StatusBarProps {
  className?: string;
  time?: string;
}

export const StatusBar: FC<StatusBarProps> = ({
  className = '',
  time = '9:41',
}) => {
  return (
    <div
      className={`w-full h-11 px-5 pt-3 pb-1 flex items-center justify-between select-none z-30 shrink-0 ${className}`}
    >
      <span className="font-['Inter'] font-bold text-[15px] text-black tracking-tight">
        {time}
      </span>
      <div className="flex items-center gap-1.5 h-3.5">
        <img
          src="/assets/status-icons.svg"
          alt="System status"
          className="h-3.5 w-auto object-contain"
        />
      </div>
    </div>
  );
};
