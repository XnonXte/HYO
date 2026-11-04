import { useCallback, useMemo, useState } from 'react';
import { TopHeader } from './components/common/TopHeader';
import { BottomNav } from './components/common/BottomNav';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { AiTalkScreen } from './components/screens/AiTalkScreen';
import { JournalScreen } from './components/screens/JournalScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { TalkSessionDetailScreen } from './components/screens/TalkSessionDetailScreen';
import { SplashScreen } from './components/screens/SplashScreen';
import { LoginScreen } from './components/screens/LoginScreen';
import { useTalkSessions } from './hooks/useTalkSessions';
import { CounselorModal } from './components/modals/CounselorModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ActivityDetailModal } from './components/modals/ActivityDetailModal';
import {
  INITIAL_USER_PROFILE,
  TODAY_RECOMMENDATION,
} from './data/mockData';
import { sessionToJournalEntry } from './services/journalInsights';
import type { TabType, MoodType, RoadmapItem, ActivityRecommendation } from './types';

type AppPhase = 'splash' | 'login' | 'app';

const FRAME_OUTER_CLASS =
  'h-screen h-[100dvh] w-full bg-slate-900/10 flex items-center justify-center overflow-hidden selection:bg-blue-100 selection:text-blue-700';
const FRAME_INNER_CLASS =
  'relative w-full max-w-[430px] h-screen h-[100dvh] bg-white sm:border-x sm:border-slate-200/80 sm:shadow-2xl flex flex-col overflow-hidden';

export function App() {
  // Splash then login run on every app start; login goes straight to the existing profile
  const [phase, setPhase] = useState<AppPhase>('splash');
  const finishSplash = useCallback(() => setPhase('login'), []);
  const login = useCallback(() => setPhase('app'), []);

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [currentMood, setCurrentMood] = useState<MoodType>('okay');
  const [isCounselorModalOpen, setIsCounselorModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<RoadmapItem | ActivityRecommendation | null>(null);
  const [selectedTalkSessionId, setSelectedTalkSessionId] = useState<string | null>(null);

  const { sessions: talkSessions, activeSessionId } = useTalkSessions();
  const selectedTalkSession = selectedTalkSessionId
    ? talkSessions.find((s) => s.id === selectedTalkSessionId) ?? null
    : null;
  const isDetailView = selectedTalkSession !== null;

  // Handle mood selection with optimistic update
  const handleSelectMood = (mood: MoodType) => {
    setCurrentMood(mood);
  };

  // Handle Tab navigation
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    // Clear detail views when switching main tabs
    setSelectedTalkSessionId(null);
  };

  // Profile roadmap preview: first step of the latest conversation's roadmap
  const latestTalkSession = talkSessions[0];
  const firstRoadmapItem = useMemo(
    () =>
      latestTalkSession
        ? sessionToJournalEntry(latestTalkSession, currentMood).roadmap?.[0]
        : undefined,
    [latestTalkSession, currentMood],
  );

  if (phase !== 'app') {
    return (
      <div className={FRAME_OUTER_CLASS}>
        <div className={FRAME_INNER_CLASS}>
          {phase === 'splash' ? (
            <SplashScreen onFinish={finishSplash} />
          ) : (
            <LoginScreen onLogin={login} />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={FRAME_OUTER_CLASS}>
      {/* Main Mobile Frame Container */}
      <div className={FRAME_INNER_CLASS}>
        {/* Top Header (Hidden when viewing detail journal to allow dedicated back button header).
            On the Talk tab it floats transparently over the screen's glow. */}
        {!isDetailView && (
          <TopHeader
            overlay={activeTab === 'talk'}
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />
        )}

        {/* 3. Screen Viewport */}
        <main className="flex-1 w-full overflow-y-auto no-scrollbar flex flex-col">
          {selectedTalkSession ? (
            <TalkSessionDetailScreen
              session={selectedTalkSession}
              isActive={selectedTalkSession.id === activeSessionId}
              fallbackMood={currentMood}
              onBack={() => setSelectedTalkSessionId(null)}
              onTalkToCounselor={() => setIsCounselorModalOpen(true)}
              onSelectRoadmapItem={(item) => setSelectedActivity(item)}
              onContinue={() => handleTabChange('talk')}
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
                <AiTalkScreen />
              )}

              {activeTab === 'journal' && (
                <JournalScreen
                  talkSessions={talkSessions}
                  activeTalkSessionId={activeSessionId}
                  onSelectTalkSession={(id) => setSelectedTalkSessionId(id)}
                  onStartTalk={() => handleTabChange('talk')}
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
          activeTab={isDetailView ? 'journal' : activeTab}
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
