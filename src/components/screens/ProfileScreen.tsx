import type { FC } from 'react';
import { ChevronRight } from 'lucide-react';
import { MoodSelector } from '../common/MoodSelector';
import type { UserProfile, MoodType, RoadmapItem } from '../../types';

interface ProfileScreenProps {
  user: UserProfile;
  currentMood: MoodType;
  onSelectMood: (mood: MoodType) => void;
  roadmapPreviewItem?: RoadmapItem;
  onSelectRoadmapItem?: (item: RoadmapItem) => void;
}

export const ProfileScreen: FC<ProfileScreenProps> = ({
  user,
  currentMood,
  onSelectMood,
  roadmapPreviewItem,
  onSelectRoadmapItem,
}) => {
  return (
    <div className="w-full flex flex-col gap-5 pb-28 px-4 pt-1">
      {/* Hero Card with Mascot peek */}
      <div className="relative pt-6">
        {/* Mascot Peeking at top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-14 overflow-hidden z-10 flex items-center justify-center">
          <img
            src="/assets/mascot-peek.png"
            alt="Mascot Peek"
            className="w-28 h-auto object-contain -translate-y-2 opacity-90"
          />
        </div>

        {/* Hero Card */}
        <section
          aria-label="Profile Card"
          className="relative overflow-hidden rounded-[26px] bg-gradient-to-b from-[#e8f1fc] via-[#f1f6ff] to-white border border-blue-100/60 p-5 shadow-[0px_10px_28px_-6px_rgba(37,99,235,0.08)] flex flex-col gap-5"
        >
          {/* Ambient Glows */}
          <div className="absolute -top-6 -right-6 size-48 rounded-full bg-blue-200/40 blur-[28px] pointer-events-none" />
          <div className="absolute -bottom-6 -left-6 size-36 rounded-full bg-sky-200/40 blur-[20px] pointer-events-none" />

          {/* Profile Identity */}
          <div className="flex items-center gap-4 z-10">
            <div className="size-20 rounded-full overflow-hidden border-2 border-white shadow-md bg-blue-100 shrink-0">
              <img
                src={user.avatar}
                alt={user.name}
                className="size-full object-cover"
              />
            </div>

            <div className="flex flex-col min-w-0">
              <h1 className="font-['Inter'] font-bold text-[20px] sm:text-[22px] text-[#1e293b] truncate">
                {user.name}
              </h1>
              <span className="font-['Inter'] font-medium text-[14px] text-[#475569] mt-0.5">
                {user.membership}
              </span>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-2.5 z-10">
            <div className="bg-white/70 backdrop-blur-sm rounded-[16px] p-3 flex flex-col border border-white/60 shadow-sm">
              <span className="font-['Inter'] font-bold text-[18px] text-[#1e293b]">
                {user.journalEntries}
              </span>
              <span className="font-['Inter'] font-medium text-[11px] text-[#475569] mt-0.5">
                Journal Entries
              </span>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-[16px] p-3 flex flex-col border border-white/60 shadow-sm">
              <span className="font-['Inter'] font-bold text-[18px] text-[#1e293b]">
                {user.talkSessions}
              </span>
              <span className="font-['Inter'] font-medium text-[11px] text-[#475569] mt-0.5">
                Talk Sessions
              </span>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-[16px] p-3 flex flex-col border border-white/60 shadow-sm">
              <span className="font-['Inter'] font-bold text-[18px] text-[#1e293b]">
                {user.moodProgress}
              </span>
              <span className="font-['Inter'] font-medium text-[11px] text-[#475569] mt-0.5">
                Mood Progress
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* About Card */}
      <section
        aria-label="About Me"
        className="w-full backdrop-blur-md bg-[rgba(197,219,246,0.35)] border border-white/70 rounded-[28px] p-5 shadow-[0px_8px_20px_-4px_rgba(74,144,226,0.06)] flex flex-col gap-2"
      >
        <h2 className="font-['Inter'] font-semibold text-[18px] text-[#1e293b] tracking-tight">
          About Me
        </h2>
        <p className="font-['Inter'] font-medium text-[13.5px] leading-relaxed text-[#475569]">
          {user.aboutMe}
        </p>
      </section>

      {/* Current Mood Check-in Card */}
      <section
        aria-label="Current Mood Selector"
        className="w-full backdrop-blur-md bg-[rgba(197,219,246,0.35)] border border-white/70 rounded-[28px] p-5 shadow-[0px_8px_20px_-4px_rgba(74,144,226,0.06)] flex flex-col gap-3"
      >
        <h2 className="font-['Inter'] font-semibold text-[18px] text-[#1e293b] tracking-tight">
          Current Mood
        </h2>
        <MoodSelector
          selectedMood={currentMood}
          onSelectMood={onSelectMood}
        />
      </section>

      {/* Personalized Roadmap Card */}
      {roadmapPreviewItem && (
        <section
          aria-label="Personalized Roadmap Preview"
          className="w-full backdrop-blur-md bg-[rgba(197,219,246,0.35)] border border-white/70 rounded-[28px] p-5 shadow-[0px_8px_20px_-4px_rgba(74,144,226,0.06)] flex flex-col gap-3"
        >
          <h2 className="font-['Inter'] font-semibold text-[18px] text-[#1e293b] tracking-tight">
            Personalized Roadmap
          </h2>

          <div
            onClick={() => onSelectRoadmapItem?.(roadmapPreviewItem)}
            className="flex items-center gap-3 cursor-pointer group bg-white/40 hover:bg-white/70 p-2 rounded-2xl transition-all"
          >
            {/* Date */}
            <div className="w-11 shrink-0 flex flex-col font-['Inter'] text-[12px] leading-tight">
              <span className="font-semibold text-[#005ab6]">
                {roadmapPreviewItem.day}
              </span>
              <span className="text-[#475569] text-[11px] mt-0.5">
                {roadmapPreviewItem.date}
              </span>
            </div>

            {/* Thumbnail */}
            <div className="w-20 h-14 rounded-[14px] overflow-hidden bg-slate-100 shrink-0 shadow-sm">
              <img
                src={roadmapPreviewItem.image}
                alt={roadmapPreviewItem.title}
                className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col min-w-0 pr-1">
              <h3 className="font-['Inter'] font-medium text-[13.5px] text-black truncate group-hover:text-[#005ab6] transition-colors">
                {roadmapPreviewItem.title}
              </h3>
              <p className="font-['Inter'] text-[11px] text-[#475569] truncate mt-0.5">
                {roadmapPreviewItem.location}
              </p>
              <p className="font-['Inter'] text-[10.5px] text-[#475569] line-clamp-1 mt-0.5 leading-snug">
                {roadmapPreviewItem.description}
              </p>
            </div>

            {/* View */}
            <div className="size-6 rounded-full flex items-center justify-center text-slate-400 group-hover:text-[#005ab6] group-hover:translate-x-0.5 transition-all shrink-0">
              <ChevronRight className="size-4" />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
