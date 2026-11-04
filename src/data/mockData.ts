import type { MoodOption, ActivityRecommendation, UserProfile } from '../types';

export const MOOD_OPTIONS: MoodOption[] = [
  {
    id: 'great',
    label: 'Great',
    bgColor: '#dcfce7',
    borderColor: '#bbf7d0',
    textColor: '#15803d',
    icon: '/assets/mood-great.svg',
  },
  {
    id: 'good',
    label: 'Good',
    bgColor: '#e0f2fe',
    borderColor: '#bae6fd',
    textColor: '#0369a1',
    icon: '/assets/mood-good.svg',
  },
  {
    id: 'okay',
    label: 'Okay',
    bgColor: '#fef9c3',
    borderColor: '#fef08a',
    textColor: '#a16207',
    icon: '/assets/mood-okay.svg',
  },
  {
    id: 'tired',
    label: 'Tired',
    bgColor: '#ffedd5',
    borderColor: '#fed7aa',
    textColor: '#c2410c',
    icon: '/assets/mood-tired.svg',
  },
  {
    id: 'stressed',
    label: 'Stressed',
    bgColor: '#ffe4e6',
    borderColor: '#fecdd3',
    textColor: '#be123c',
    icon: '/assets/mood-stressed.svg',
  },
];

export const TODAY_RECOMMENDATION: ActivityRecommendation = {
  id: 'act-1',
  title: 'Free Swimming Class',
  location: 'Batu, Malang',
  description: 'A relaxing activity to refresh your mind and reduce burnout.',
  date: 'Sat, 17 October 2026',
  image: '/assets/pool.png',
  tag: 'Recommended for You',
};

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Sthefany Sheanmoulia',
  membership: 'Free Member',
  avatar: '/assets/avatar.png',
  journalEntries: 124,
  talkSessions: 18,
  moodProgress: '92%',
  aboutMe:
    "I'm a student trying to find balance between academics and personal growth. I love journaling and talking to Hyo when I need a fresh perspective.",
  currentMood: 'okay',
};
