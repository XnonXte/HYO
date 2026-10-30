import { useState } from 'react';
import { TopHeader } from './components/common/TopHeader';
import { BottomNav } from './components/common/BottomNav';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { AiTalkScreen } from './components/screens/AiTalkScreen';
import { JournalScreen } from './components/screens/JournalScreen';
import { DetailJournalScreen } from './components/screens/DetailJournalScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { CounselorModal } from './components/modals/CounselorModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ActivityDetailModal } from './components/modals/ActivityDetailModal';
import {
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_USER_PROFILE,
  TODAY_RECOMMENDATION,
} from './data/mockData';
import type { TabType, MoodType, JournalEntry, RoadmapItem, ActivityRecommendation } from './types';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentMood, setCurrentMood] = useState<MoodType>('okay');
  const [selectedJournalEntry, setSelectedJournalEntry] = useState<JournalEntry | null>(null);
  const [isCounselorModalOpen, setIsCounselorModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<RoadmapItem | ActivityRecommendation | null>(null);

  // Handle mood selection with optimistic update
  const handleSelectMood = (mood: MoodType) => {
    setCurrentMood(mood);
  };

  // Handle Tab navigation
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Clear detail view when switching main tabs
    setSelectedJournalEntry(null);
  };

  // First roadmap item for Profile roadmap preview
  const firstRoadmapItem = INITIAL_JOURNAL_ENTRIES[0]?.roadmap?.[0];

  return (
    <div className="h-screen h-[100dvh] w-full bg-slate-900/10 flex items-center justify-center overflow-hidden selection:bg-blue-100 selection:text-blue-700">
      {/* Main Mobile Frame Container */}
      <div className="relative w-full max-w-[430px] h-screen h-[100dvh] bg-white sm:border-x sm:border-slate-200/80 sm:shadow-2xl flex flex-col overflow-hidden">
        {/* Top Header (Hidden when viewing detail journal to allow dedicated back button header) */}
        {!selectedJournalEntry && (
          <TopHeader onOpenSettings={() => setIsSettingsModalOpen(true)} />
        )}

        {/* 3. Screen Viewport */}
        <main className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col">
          {selectedJournalEntry ? (
            <DetailJournalScreen
              entry={selectedJournalEntry}
              onBack={() => setSelectedJournalEntry(null)}
              onTalkToCounselor={() => setIsCounselorModalOpen(true)}
              onSelectRoadmapItem={(item) => setSelectedActivity(item)}
            />
          ) : (
            <>
              {activeTab === 'home' && (
                <DashboardScreen
                  currentMood={currentMood}
                  onSelectMood={handleSelectMood}
                  onNavigate={handleTabChange}
                  todayActivity={TODAY_RECOMMENDATION}
                  onSelectActivity={(act) => setSelectedActivity(act)}
                />
              )}

              {activeTab === 'talk' && (
                <AiTalkScreen
                  onOpenQuickMenu={() => setIsSettingsModalOpen(true)}
                />
              )}

              {activeTab === 'journal' && (
                <JournalScreen
                  entries={INITIAL_JOURNAL_ENTRIES}
                  onSelectEntry={(entry) => setSelectedJournalEntry(entry)}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileScreen
                  user={INITIAL_USER_PROFILE}
                  currentMood={currentMood}
                  onSelectMood={handleSelectMood}
                  roadmapPreviewItem={firstRoadmapItem}
                  onSelectRoadmapItem={(item) => setSelectedActivity(item)}
                />
              )}
            </>
          )}
        </main>

        {/* 4. Floating Bottom Navigation (Available across all main views) */}
        <BottomNav
          activeTab={selectedJournalEntry ? 'journal' : activeTab}
          onTabChange={handleTabChange}
        />

        {/* Modals */}
        <CounselorModal
          isOpen={isCounselorModalOpen}
          onClose={() => setIsCounselorModalOpen(false)}
        />

        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />

        <ActivityDetailModal
          activity={selectedActivity}
          onClose={() => setSelectedActivity(null)}
        />
      </div>
    </div>
  );
}

export default App;
