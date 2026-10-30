import { useState, type FC } from 'react';
import { X, Bell, Moon, Shield, Info, LogOut, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState(true);
  const [dailyCheckIn, setDailyCheckIn] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 flex flex-col gap-5 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="font-['Inter'] font-bold text-lg text-black">
            Settings & Preferences
          </h3>
          <button
            onClick={onClose}
            className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3 text-sm">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
            <div className="flex items-center gap-3">
              <Bell className="size-4.5 text-[#005ab6]" />
              <span className="font-medium text-slate-700">Push Notifications</span>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`size-6 rounded-full transition-colors flex items-center justify-center ${
                notifications ? 'bg-[#005ab6] text-white' : 'bg-slate-200'
              }`}
            >
              {notifications && <Check className="size-3.5" />}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
            <div className="flex items-center gap-3">
              <Moon className="size-4.5 text-[#005ab6]" />
              <span className="font-medium text-slate-700">Daily Evening Check-in</span>
            </div>
            <button
              onClick={() => setDailyCheckIn(!dailyCheckIn)}
              className={`size-6 rounded-full transition-colors flex items-center justify-center ${
                dailyCheckIn ? 'bg-[#005ab6] text-white' : 'bg-slate-200'
              }`}
            >
              {dailyCheckIn && <Check className="size-3.5" />}
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="size-4.5 text-[#005ab6]" />
              <span className="font-medium text-slate-700">Privacy & Data Security</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors">
            <div className="flex items-center gap-3">
              <Info className="size-4.5 text-[#005ab6]" />
              <div className="flex flex-col">
                <span className="font-medium text-slate-700">About HYO</span>
                <span className="text-[11px] text-slate-400">Version 1.0.0 (BPC Prototype)</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-sm flex items-center justify-center gap-2 transition-colors mt-2"
        >
          <LogOut className="size-4 text-slate-500" />
          <span>Close Settings</span>
        </button>
      </div>
    </div>
  );
};
