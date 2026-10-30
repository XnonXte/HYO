import type { FC } from 'react';
import { Sparkles, MapPin, ChevronRight } from 'lucide-react';
import { MoodSelector } from '../common/MoodSelector';
import type { MoodType, TabType, ActivityRecommendation } from '../../types';

interface DashboardScreenProps {
  currentMood: MoodType;
  onSelectMood: (mood: MoodType) => void;
  onNavigate: (tab: TabType) => void;
  onSelectActivity?: (activity: ActivityRecommendation) => void;
  todayActivity: ActivityRecommendation;
}

export const DashboardScreen: FC<DashboardScreenProps> = ({
  currentMood,
  onSelectMood,
  onNavigate,
  onSelectActivity,
  todayActivity,
}) => {
  return (
    <div className="w-full flex flex-col gap-6 pb-28 px-4 pt-2">
      {/* 1. Hero Mascot Card */}
      <section
        aria-label="Talk to Hyo Banner"
        className="relative overflow-hidden rounded-[26px] bg-gradient-to-b from-[#e8f1fc] via-[#f1f6ff] to-white border border-blue-100/60 p-5 shadow-[0px_10px_28px_-6px_rgba(37,99,235,0.08)] flex flex-col items-center"
      >
        {/* Ambient Glowing Blobs */}
        <div className="absolute -top-6 -right-6 size-40 rounded-full bg-blue-200/40 blur-[24px] pointer-events-none" />
        <div className="absolute -bottom-6 -left-6 size-36 rounded-full bg-sky-200/50 blur-[18px] pointer-events-none" />

        {/* Mascot Character */}
        <div className="relative w-44 h-40 flex items-center justify-center my-1">
          <img
            src="/assets/mascot-talk.png"
            alt="Hyo 3D Mascot"
            className="w-full h-full object-contain drop-shadow-[0px_12px_14px_rgba(0,90,182,0.2)] hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Text and Action Pill Box */}
        <div className="relative w-full backdrop-blur-md bg-white/75 border border-white/80 rounded-[20px] p-4 text-center shadow-[0px_2px_8px_0px_rgba(0,0,0,0.04)] flex flex-col items-center">
          <h2 className="font-['Inter'] font-bold text-[22px] sm:text-[24px] text-black tracking-tight leading-tight">
            Talk to Hyo
          </h2>
          <p className="font-['Inter'] font-medium text-[14px] text-[#64748b] mt-1 mb-3.5">
            What's been on your mind today?
          </p>

          <button
            onClick={() => onNavigate('talk')}
            className="h-11 px-6 rounded-full bg-gradient-to-r from-[#2f80ed] to-[#005ab6] text-white font-semibold text-[14px] sm:text-[15px] flex items-center justify-center gap-2 shadow-[0px_6px_14px_rgba(0,90,182,0.32)] hover:shadow-lg active:scale-95 transition-all"
          >
            <Sparkles className="size-4" />
            <span>Talk With Hyo</span>
          </button>
        </div>
      </section>

      {/* 2. "Your Today" / Mood Check-in Section */}
      <section aria-label="Your Today Mood Check-in" className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-['Inter'] font-bold text-[20px] sm:text-[22px] text-black tracking-tight">
            Your Today
          </h2>
          <button
            onClick={() => onNavigate('journal')}
            className="flex items-center gap-1 font-['Inter'] font-semibold text-[14px] text-[#005ab6] hover:underline"
          >
            <span>See History</span>
            <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Combined Glassmorphic Card */}
        <div className="w-full bg-white border border-[#f1f5f9] rounded-[22px] p-4.5 sm:p-5 shadow-[0px_4px_20px_-2px_rgba(74,144,226,0.06)] flex flex-col gap-4">
          <h3 className="font-['Inter'] font-semibold text-[17px] text-black">
            How are you feeling today?
          </h3>

          <MoodSelector
            selectedMood={currentMood}
            onSelectMood={onSelectMood}
          />
        </div>
      </section>

      {/* 3. "Today's Plan" Section */}
      <section aria-label="Today's Plan" className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-['Inter'] font-bold text-[20px] sm:text-[22px] text-black tracking-tight">
            Today's Plan
          </h2>
          <span className="font-['Inter'] font-medium text-[13px] sm:text-[14px] text-[#475569]">
            {todayActivity.date}
          </span>
        </div>

        <div className="flex items-center justify-between px-1">
          <span className="font-['Inter'] font-bold text-[16px] text-[#005ab6]">
            {todayActivity.tag}
          </span>
          <button
            onClick={() => onNavigate('journal')}
            className="flex items-center gap-0.5 font-['Inter'] font-semibold text-[13px] text-[#005ab6] hover:underline"
          >
            <span>See More</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>

        {/* Activity Card */}
        <div
          onClick={() => onSelectActivity?.(todayActivity)}
          className="w-full bg-white border border-slate-100 rounded-[20px] p-3.5 shadow-sm hover:shadow-md transition-all flex items-center gap-3.5 cursor-pointer group"
        >
          {/* Thumbnail */}
          <div className="size-20 rounded-[16px] overflow-hidden bg-slate-100 shrink-0 shadow-inner">
            <img
              src={todayActivity.image}
              alt={todayActivity.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Details */}
          <div className="flex-1 flex flex-col min-w-0 pr-1">
            <h4 className="font-['Inter'] font-semibold text-[15px] sm:text-[16px] text-black truncate">
              {todayActivity.title}
            </h4>
            <div className="flex items-center gap-1.5 text-[#475569] text-[13px] mt-1 mb-1.5">
              <MapPin className="size-3.5 text-[#005ab6] shrink-0" />
              <span className="truncate">{todayActivity.location}</span>
            </div>
            <p className="font-['Inter'] text-[12.5px] leading-tight text-[#475569] line-clamp-2">
              {todayActivity.description}
            </p>
          </div>

          {/* Action icon */}
          <div className="text-slate-400 group-hover:text-[#005ab6] group-hover:translate-x-0.5 transition-all shrink-0">
            <ChevronRight className="size-5" />
          </div>
        </div>
      </section>
    </div>
  );
};
