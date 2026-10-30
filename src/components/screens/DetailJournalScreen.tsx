import type { FC } from 'react';
import { ChevronLeft, CalendarDays, Headphones, ChevronRight } from 'lucide-react';
import type { JournalEntry, RoadmapItem } from '../../types';

interface DetailJournalScreenProps {
  entry: JournalEntry;
  onBack: () => void;
  onTalkToCounselor?: () => void;
  onSelectRoadmapItem?: (item: RoadmapItem) => void;
}

export const DetailJournalScreen: FC<DetailJournalScreenProps> = ({
  entry,
  onBack,
  onTalkToCounselor,
  onSelectRoadmapItem,
}) => {
  const roadmapItems = entry.roadmap || [];

  return (
    <div className="w-full flex flex-col gap-5 pb-28 px-4 pt-1">
      {/* Top Bar Navigation */}
      <div className="w-full flex items-center justify-between z-10 pt-1">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="size-10 rounded-full bg-[#005ab6] text-white flex items-center justify-center shadow-md hover:bg-blue-700 active:scale-95 transition-all"
          title="Back to Journal"
          aria-label="Back"
        >
          <ChevronLeft className="size-5" />
        </button>

        {/* Date Capsule */}
        <div className="h-10 px-4 rounded-full backdrop-blur-md bg-white/70 border border-white/80 shadow-sm flex items-center gap-2">
          <span className="font-['Inter'] font-medium text-[13.5px] text-[#475569]">
            {entry.fullDate}
          </span>
          <CalendarDays className="size-4 text-[#005ab6]" />
        </div>
      </div>

      {/* Journal Introduction Banner */}
      <section
        aria-label="Journal Introduction"
        className="relative overflow-hidden rounded-[26px] bg-gradient-to-b from-[#eaf2fc] via-[#f3f7fd] to-white border border-blue-100/60 p-5 shadow-[0px_10px_28px_-6px_rgba(74,144,226,0.1)] flex items-center justify-between"
      >
        <div className="flex-1 pr-2 z-10">
          <h1 className="font-['Inter'] font-bold text-[22px] sm:text-[24px] tracking-tight leading-tight">
            <span className="text-black block">Here’s how</span>
            <span className="text-[#005ab6]">you’re feeling</span>
          </h1>
          <p className="font-['Inter'] font-normal text-[13.5px] text-[#475569] mt-2 leading-relaxed">
            Thank you for sharing your thoughts today. You did great! ✨
          </p>
        </div>

        {/* Mascot */}
        <div className="relative size-28 shrink-0 z-10 flex items-center justify-center">
          <img
            src="/assets/mascot-happy.png"
            alt="Happy Hyo Mascot"
            className="w-full h-full object-contain drop-shadow-[0px_8px_12px_rgba(0,90,182,0.18)]"
          />
        </div>
      </section>

      {/* Your Mood Today Card */}
      <section
        aria-label="Your Mood Today"
        className="w-full backdrop-blur-md bg-white/60 border-2 border-white/80 rounded-[20px] p-4.5 shadow-[0px_12px_30px_0px_rgba(111,174,226,0.1)] flex flex-col gap-3"
      >
        <h2 className="font-['Inter'] font-bold text-[16px] text-black tracking-tight">
          Your Mood Today
        </h2>

        <div className="flex items-center gap-4">
          {/* Mood Portrait */}
          <div className="size-20 rounded-full border-2 border-white shadow-sm overflow-hidden shrink-0 bg-blue-50 flex items-center justify-center">
            <img
              src="/assets/mascot-portrait.png"
              alt={entry.moodLabel}
              className="size-full object-cover"
            />
          </div>

          {/* Description */}
          <div className="flex-1 flex flex-col min-w-0">
            <span className="font-['Inter'] font-bold text-[22px] leading-tight text-[#005ab6]">
              {entry.moodLabel}
            </span>
            <p className="font-['Inter'] font-normal text-[12.5px] sm:text-[13px] text-[#475569] mt-1.5 leading-relaxed">
              {entry.moodReflection}
            </p>
          </div>
        </div>
      </section>

      {/* Recommendation & Counselor CTA */}
      <section aria-label="Counselor Support" className="flex flex-col gap-2">
        <h2 className="font-['Inter'] font-bold text-[16px] text-black px-1">
          Recommendation
        </h2>

        <div className="w-full bg-white border border-slate-100 rounded-[20px] p-3.5 shadow-sm flex items-center justify-between gap-3">
          <div className="size-11 rounded-full bg-blue-50 text-[#005ab6] flex items-center justify-center shrink-0">
            <Headphones className="size-6" />
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <p className="font-['Inter'] font-medium text-[14px] text-black truncate">
              It’s okay to ask for help.
            </p>
            <p className="font-['Inter'] text-[12px] text-[#475569] leading-tight mt-0.5 line-clamp-2">
              If you’re feeling overwhelmed, consider reaching out to a counselor who can listen.
            </p>
          </div>

          <button
            onClick={onTalkToCounselor}
            className="h-9 px-3.5 rounded-full bg-[#005ab6] text-white flex items-center justify-center gap-1 hover:bg-blue-700 active:scale-95 transition-all shrink-0 text-xs font-semibold shadow-sm"
          >
            <span className="hidden sm:inline">Counselor</span>
            <ChevronRight className="size-4" />
          </button>
        </div>
      </section>

      {/* Personalized Roadmap */}
      {roadmapItems.length > 0 && (
        <section
          aria-label="Personalized Roadmap"
          className="w-full backdrop-blur-md bg-white/60 border-2 border-white/80 rounded-[22px] p-4.5 shadow-[0px_12px_30px_0px_rgba(111,174,226,0.1)] flex flex-col gap-3.5"
        >
          <h2 className="font-['Inter'] font-bold text-[16px] text-black tracking-tight">
            Your Personalized Roadmap
          </h2>

          <div className="flex flex-col gap-4">
            {roadmapItems.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectRoadmapItem?.(item)}
                className="group flex items-center gap-3 cursor-pointer hover:bg-white/60 p-1.5 -mx-1.5 rounded-xl transition-all"
              >
                {/* Date */}
                <div className="w-11 shrink-0 flex flex-col font-['Inter'] text-[12.5px] leading-tight">
                  <span className={`font-semibold ${item.isActive ? 'text-[#005ab6]' : 'text-[#475569]'}`}>
                    {item.day}
                  </span>
                  <span className="text-[#475569] text-[11.5px] mt-0.5">
                    {item.date}
                  </span>
                </div>

                {/* Thumbnail */}
                <div className="w-[84px] h-[56px] rounded-[14px] overflow-hidden bg-slate-100 shrink-0 shadow-sm">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col min-w-0 pr-1">
                  <h3 className="font-['Inter'] font-medium text-[14px] text-black truncate group-hover:text-[#005ab6] transition-colors">
                    {item.title}
                  </h3>
                  <p className="font-['Inter'] text-[11.5px] text-[#475569] truncate mt-0.5">
                    {item.location}
                  </p>
                  <p className="font-['Inter'] text-[11px] text-[#475569] line-clamp-1 mt-0.5 leading-snug">
                    {item.description}
                  </p>
                </div>

                {/* View Chevron */}
                <div className="size-6 rounded-lg bg-[#005ab6] text-white flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <ChevronRight className="size-3.5" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
