import type { FC } from 'react';
import { X, Phone, MessageSquare, ShieldCheck, Heart } from 'lucide-react';

interface CounselorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CounselorModal: FC<CounselorModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 size-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
          aria-label="Close"
        >
          <X className="size-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="size-12 rounded-2xl bg-blue-50 text-[#005ab6] flex items-center justify-center shrink-0">
            <Heart className="size-6 text-[#005ab6]" />
          </div>
          <div>
            <h3 className="font-['Inter'] font-bold text-lg text-black">
              Counseling Support
            </h3>
            <p className="text-xs text-[#475569]">
              Confidential, professional assistance
            </p>
          </div>
        </div>

        <p className="text-sm text-[#475569] leading-relaxed">
          You don't have to navigate difficult moments alone. Our campus and verified partner counselors are here to listen and help.
        </p>

        <div className="flex flex-col gap-2.5 pt-1">
          <a
            href="tel:119"
            className="w-full h-11 px-4 rounded-2xl bg-[#005ab6] hover:bg-blue-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Phone className="size-4" />
            <span>Call Counselor Hotline (Free)</span>
          </a>

          <button
            onClick={() => {
              alert('Connecting to an online counseling chat session...');
              onClose();
            }}
            className="w-full h-11 px-4 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <MessageSquare className="size-4 text-[#005ab6]" />
            <span>Start Chat Session</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-400 justify-center">
          <ShieldCheck className="size-4 text-emerald-600" />
          <span>All communications are 100% encrypted & private</span>
        </div>
      </div>
    </div>
  );
};
