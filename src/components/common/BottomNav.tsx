import type { FC } from 'react';
import { Home, MessageSquare, BookOpen, User } from 'lucide-react';
import type { TabType } from '../../types';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'talk' as TabType, label: 'Talk', icon: MessageSquare },
    { id: 'journal' as TabType, label: 'Journal', icon: BookOpen },
    { id: 'profile' as TabType, label: 'Profile', icon: User },
  ];

  return (
    <div className="absolute bottom-4 left-0 right-0 z-40 flex justify-center pointer-events-none px-4">
      <nav
        aria-label="Main Navigation"
        className="pointer-events-auto w-full max-w-[408px] h-16 backdrop-blur-[20px] bg-white/85 rounded-full shadow-[0px_12px_32px_-4px_rgba(74,144,226,0.18),0px_4px_12px_-2px_rgba(30,41,59,0.06)] border border-white/60 flex items-center justify-around px-2.5"
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center transition-all duration-300 ${
                isActive
                  ? 'bg-[#005ab6] text-white w-[76px] h-[50px] rounded-full shadow-[0px_4px_12px_rgba(0,90,182,0.3)]'
                  : 'text-[#414753] hover:text-[#005ab6] w-[60px] h-[50px] rounded-full hover:bg-slate-100/50'
              }`}
            >
              <Icon
                className={`transition-transform duration-200 ${
                  isActive ? 'size-5 mb-0.5' : 'size-5 mb-0.5'
                }`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={`text-[12px] leading-[13px] tracking-tight ${
                  isActive ? 'font-semibold text-white' : 'font-medium text-[#414753]'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
