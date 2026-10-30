export type TabType = 'home' | 'talk' | 'journal' | 'profile';

export type MoodType = 'great' | 'good' | 'okay' | 'tired' | 'stressed';

export interface MoodOption {
  id: MoodType;
  label: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  icon: string;
}

export interface RoadmapItem {
  id: string;
  day: string;
  date: string;
  title: string;
  location: string;
  description: string;
  image: string;
  isActive?: boolean;
}

export interface JournalEntry {
  id: string;
  title: string;
  dayNumber: string;
  month: string;
  fullDate: string;
  sessionTime: string;
  sessionType: string;
  preview: string;
  moodType: MoodType;
  moodLabel: string;
  moodReflection: string;
  counselorHelpText?: string;
  roadmap?: RoadmapItem[];
}

export interface ActivityRecommendation {
  id: string;
  title: string;
  location: string;
  description: string;
  date: string;
  image: string;
  tag: string;
}

export interface UserProfile {
  name: string;
  membership: string;
  avatar: string;
  journalEntries: number;
  talkSessions: number;
  moodProgress: string;
  aboutMe: string;
  currentMood: MoodType;
}
