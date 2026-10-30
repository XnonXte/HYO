import type { FC } from 'react';
import { MOOD_OPTIONS } from '../../data/mockData';
import type { MoodType } from '../../types';

interface MoodSelectorProps {
  selectedMood: MoodType;
  onSelectMood: (mood: MoodType) => void;
  className?: string;
}

export const MoodSelector: FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
  className = '',
}) => {
  return (
    <div
      role="radiogroup"
      aria-label="Mood options"
      className={`w-full flex items-center justify-between gap-1.5 ${className}`}
    >
      {MOOD_OPTIONS.map((option) => {
        const isSelected = selectedMood === option.id;

        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelectMood(option.id)}
            className="flex-1 flex flex-col items-center group cursor-pointer focus:outline-none transition-transform active:scale-95"
          >
            <div
              style={{
                backgroundColor: option.bgColor,
                borderColor: option.borderColor,
              }}
              className={`size-12 sm:size-[50px] rounded-full border flex items-center justify-center transition-all duration-200 ${
                isSelected
                  ? 'ring-2 ring-offset-2 ring-[#005ab6] scale-110 shadow-md'
                  : 'group-hover:scale-105'
              }`}
            >
              <img
                src={option.icon}
                alt={option.label}
                className="size-5 sm:size-5.5 object-contain"
              />
            </div>
            <span
              className={`mt-2 text-[13px] sm:text-[14px] leading-tight transition-colors ${
                isSelected
                  ? 'font-bold text-[#005ab6]'
                  : 'font-medium text-[#475569] group-hover:text-black'
              }`}
            >
              {option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
