import type { FC } from 'react';
import { X, MapPin, Calendar, Clock, CheckCircle2 } from 'lucide-react';
import type { RoadmapItem, ActivityRecommendation } from '../../types';

interface ActivityDetailModalProps {
  activity: RoadmapItem | ActivityRecommendation | null;
  onClose: () => void;
}

export const ActivityDetailModal: FC<ActivityDetailModalProps> = ({
  activity,
  onClose,
}) => {
  if (!activity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Cover Image */}
        <div className="relative h-48 w-full bg-slate-100 shrink-0">
          <img
            src={activity.image}
            alt={activity.title}
            className="size-full object-cover"
          />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 size-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-3.5 overflow-y-auto no-scrollbar">
          <div>
            {'date' in activity && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#005ab6] bg-blue-50 px-2.5 py-1 rounded-full mb-2">
                <Calendar className="size-3.5" />
                {'day' in activity ? `${activity.day}, ${activity.date}` : activity.date}
              </span>
            )}
            <h3 className="font-['Inter'] font-bold text-xl text-black">
              {activity.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs text-[#475569] mt-1.5">
              <MapPin className="size-3.5 text-[#005ab6] shrink-0" />
              <span>{activity.location}</span>
            </div>
          </div>

          <p className="text-sm text-[#475569] leading-relaxed">
            {activity.description}
          </p>

          <div className="bg-slate-50 rounded-2xl p-3 flex items-center gap-3 text-xs text-slate-600">
            <Clock className="size-4 text-[#005ab6] shrink-0" />
            <span>Recommended duration: 30–45 mins to clear thoughts and recharge.</span>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => {
                alert(`Added "${activity.title}" to your active calendar!`);
                onClose();
              }}
              className="w-full h-11 rounded-2xl bg-[#005ab6] hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <CheckCircle2 className="size-4" />
              <span>Mark as Planned</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
