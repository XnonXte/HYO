import { useState, type FC } from 'react';
import { Search, SlidersHorizontal, ChevronRight, MessageSquareText } from 'lucide-react';
import type { JournalEntry } from '../../types';

interface JournalScreenProps {
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
}

export const JournalScreen: FC<JournalScreenProps> = ({
  entries,
  onSelectEntry,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = entries.filter((entry) => {
    const q = searchQuery.toLowerCase();
    return (
      entry.title.toLowerCase().includes(q) ||
      entry.preview.toLowerCase().includes(q) ||
      entry.fullDate.toLowerCase().includes(q) ||
      entry.moodLabel.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full flex flex-col gap-5 pb-28 px-4 pt-1">
      {/* Top Greeting & Mascot Header */}
      <section
        aria-label="Journal Greeting"
        className="relative overflow-hidden rounded-[26px] bg-gradient-to-b from-[#eaf2fc] via-[#f3f7fd] to-white border border-blue-100/60 p-5 shadow-[0px_10px_28px_-6px_rgba(74,144,226,0.1)] flex items-center justify-between"
      >
        {/* Glow blobs */}
        <div className="absolute top-0 right-0 size-36 rounded-full bg-blue-200/40 blur-[28px] pointer-events-none" />
        <div className="absolute -bottom-4 -left-4 size-28 rounded-full bg-sky-200/40 blur-[20px] pointer-events-none" />

        <div className="flex-1 pr-3 z-10">
          <h1 className="font-['Inter'] font-bold text-[24px] sm:text-[26px] text-black tracking-tight leading-tight">
            Journaling
          </h1>
          <p className="font-['Inter'] font-medium text-[13.5px] sm:text-[14px] text-[#475569] mt-1.5 leading-relaxed">
            Your thoughts, progress, and little steps along the way. You're doing great!
          </p>
        </div>

        {/* Mascot holding heart */}
        <div className="relative size-24 shrink-0 z-10 flex items-center justify-center">
          <img
            src="/assets/mascot-heart.png"
            alt="Mascot holding heart"
            className="w-full h-full object-contain drop-shadow-[0px_8px_12px_rgba(0,90,182,0.18)]"
          />
        </div>
      </section>

      {/* Search & Filter Controls */}
      <section aria-label="Search and Filter" className="w-full">
        <div className="relative w-full h-12 backdrop-blur-md bg-white/85 border border-slate-200/80 rounded-full shadow-[0px_8px_20px_-4px_rgba(74,144,226,0.08)] flex items-center px-4 gap-2.5">
          <Search className="size-5 text-[#005ab6] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your journal..."
            className="w-full bg-transparent border-none text-[14.5px] text-slate-800 placeholder-[#727785] focus:outline-none"
          />
          <button
            title="Filter entries"
            aria-label="Filter entries"
            className="text-slate-500 hover:text-[#005ab6] transition-colors shrink-0"
          >
            <SlidersHorizontal className="size-4.5" />
          </button>
        </div>
      </section>

      {/* Feed Section: Recent Journals */}
      <section aria-label="Recent Journals Feed" className="flex flex-col gap-3">
        <div className="px-1">
          <h2 className="font-['Inter'] font-bold text-[20px] text-black tracking-tight">
            Recent Journals
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {filteredEntries.length === 0 ? (
            <div className="w-full py-12 text-center text-slate-500 font-medium text-sm">
              No journal entries found matching "{searchQuery}"
            </div>
          ) : (
            filteredEntries.map((entry) => (
              <div
                key={entry.id}
                onClick={() => onSelectEntry(entry)}
                className="group relative w-full backdrop-blur-md bg-[rgba(197,219,246,0.3)] hover:bg-[rgba(197,219,246,0.45)] border border-white/70 rounded-[28px] p-3.5 shadow-[0px_10px_28px_-6px_rgba(74,144,226,0.08)] cursor-pointer transition-all hover:shadow-md flex items-center gap-3.5"
              >
                {/* Squircle Date Badge */}
                <div className="size-14 rounded-[16px] bg-white shadow-sm border border-slate-100 flex flex-col items-center justify-center shrink-0">
                  <span className="font-['Plus_Jakarta_Sans'] font-bold text-[17px] leading-tight text-[#005ab6]">
                    {entry.dayNumber}
                  </span>
                  <span className="font-['Plus_Jakarta_Sans'] font-medium text-[10.5px] tracking-wider text-[#414753] uppercase">
                    {entry.month}
                  </span>
                </div>

                {/* Body Content */}
                <div className="flex-1 min-w-0 pr-1 flex flex-col justify-center">
                  <h3 className="font-['Inter'] font-semibold text-[15px] text-black truncate group-hover:text-[#005ab6] transition-colors">
                    {entry.title}
                  </h3>

                  {/* Meta: Companion info */}
                  <div className="flex items-center gap-2 text-[12.5px] mt-1 mb-1 text-[#005ab6] font-medium">
                    <span className="size-4 rounded-full bg-blue-100/70 flex items-center justify-center shrink-0">
                      <MessageSquareText className="size-2.5 text-[#005ab6]" />
                    </span>
                    <span className="truncate">{entry.sessionType}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-[#414753]">{entry.sessionTime}</span>
                  </div>

                  {/* Summary preview */}
                  <p className="font-['Inter'] text-[12.5px] text-[#475569] line-clamp-1 leading-snug">
                    {entry.preview}
                  </p>
                </div>

                {/* Chevron Action */}
                <div className="size-7 rounded-full flex items-center justify-center text-slate-400 group-hover:text-[#005ab6] group-hover:translate-x-0.5 transition-all shrink-0">
                  <ChevronRight className="size-5" />
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
