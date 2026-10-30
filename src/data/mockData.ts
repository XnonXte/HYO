import type { JournalEntry, MoodOption, ActivityRecommendation, UserProfile } from '../types';

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

export const INITIAL_JOURNAL_ENTRIES: JournalEntry[] = [
  {
    id: 'journal-1',
    title: 'Feeling overwhelmed with assignments',
    dayNumber: '18',
    month: 'OCT',
    fullDate: '18 October 2026',
    sessionTime: '20:14',
    sessionType: 'AI Talk with Hyo',
    preview: 'Talked about academic pressure, time management, and self-doubt. Learned',
    moodType: 'stressed',
    moodLabel: 'Overwhelmed',
    moodReflection:
      "You've been carrying a lot lately, especially with academic pressure and many responsibilities, but you're still here — and that's something to be proud of. 🤍",
    counselorHelpText:
      "If you're feeling overwhelmed, consider reaching out to a counselor who can listen.",
    roadmap: [
      {
        id: 'road-1',
        day: 'Thu',
        date: '22 Oct',
        title: 'Take a 20-minute walk',
        location: 'Jalan Ijen, Malang',
        description: 'Enjoy the fresh air and clear your mind.',
        image: '/assets/roadmap-1.png',
        isActive: true,
      },
      {
        id: 'road-2',
        day: 'Wed',
        date: '21 Oct',
        title: 'Visit Kebun Jeruk Batu',
        location: 'Kebun Jeruk, Batu',
        description: 'Spend time in nature and get some sunlight.',
        image: '/assets/roadmap-2.png',
      },
      {
        id: 'road-3',
        day: 'Tue',
        date: '20 Oct',
        title: 'Journal at a cozy café',
        location: 'Dailydose Coffee, Malang (Jl. Bandung No. 7)',
        description: "Write about what's on your mind.",
        image: '/assets/roadmap-3.png',
      },
      {
        id: 'road-4',
        day: 'Mon',
        date: '19 Oct',
        title: 'Light yoga in the park',
        location: 'Taman Singha Merjosari, Malang',
        description: 'Move your body and take a deep breath.',
        image: '/assets/roadmap-4.png',
      },
    ],
  },
  {
    id: 'journal-2',
    title: 'A little better today',
    dayNumber: '14',
    month: 'OCT',
    fullDate: '14 October 2026',
    sessionTime: '18:30',
    sessionType: 'AI Talk with Hyo',
    preview:
      'Discussed about friendships, feeling lonely, and building routine. Took a…',
    moodType: 'good',
    moodLabel: 'A little better',
    moodReflection:
      'You noticed moments of calmness and felt supported by conversations with friends.',
    counselorHelpText:
      'Keeping up positive social interactions fosters well-being.',
    roadmap: [
      {
        id: 'road-1',
        day: 'Thu',
        date: '22 Oct',
        title: 'Take a 20-minute walk',
        location: 'Jalan Ijen, Malang',
        description: 'Enjoy the fresh air and clear your mind.',
        image: '/assets/roadmap-1.png',
      },
    ],
  },
  {
    id: 'journal-3',
    title: 'Feeling anxious',
    dayNumber: '10',
    month: 'OCT',
    fullDate: '10 October 2026',
    sessionTime: '21:12',
    sessionType: 'AI Talk with Hyo',
    preview:
      'Talked about overthinking and upcoming presentation. Practiced box breathing.',
    moodType: 'tired',
    moodLabel: 'Anxious',
    moodReflection:
      'Anxiety can feel loud, but you gave yourself space to breathe and slow down.',
    counselorHelpText:
      'Practice grounding exercises whenever thoughts begin racing.',
    roadmap: [
      {
        id: 'road-4',
        day: 'Mon',
        date: '19 Oct',
        title: 'Light yoga in the park',
        location: 'Taman Singha Merjosari, Malang',
        description: 'Move your body and take a deep breath.',
        image: '/assets/roadmap-4.png',
      },
    ],
  },
  {
    id: 'journal-4',
    title: 'Grateful moments',
    dayNumber: '07',
    month: 'OCT',
    fullDate: '07 October 2026',
    sessionTime: '16:45',
    sessionType: 'AI Talk with Hyo',
    preview:
      'Reflected on small wins and things that made me happy today. Felt warm cup of tea.',
    moodType: 'great',
    moodLabel: 'Grateful',
    moodReflection:
      'Gratitude opens the heart to simple joys and restores inner balance.',
    counselorHelpText:
      'Continue noting down 3 things you appreciate every evening.',
  },
];

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
