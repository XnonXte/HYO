/**
 * Turns a saved Talk session into a Journal entry (mood, reflection, roadmap)
 * using local keyword rules. Nothing is sent to the backend.
 */

import type { JournalEntry, MoodType, RoadmapItem } from '../types';
import { MOOD_OPTIONS } from '../data/mockData';
import { getSessionPreview, type TalkSession } from './talkStorage';
import {
  formatDayNumber,
  formatFullDate,
  formatMonthShort,
  formatShortDate,
  formatTime,
} from '../utils/dateFormat';

interface MoodRule {
  moodType: MoodType;
  label: string;
  reflection: string;
  counselorHelpText: string;
  /** Word starts, Indonesian and English; matched case-insensitively at a word boundary */
  keywords: string[];
}

// Order matters on a tie: earlier rules win, so heavier feelings are not hidden by light ones.
const MOOD_RULES: MoodRule[] = [
  {
    moodType: 'stressed',
    label: 'Overwhelmed',
    reflection:
      "You've been carrying a lot lately, but you're still here and you took time to talk it through — that's something to be proud of. 🤍",
    counselorHelpText:
      "If you're feeling overwhelmed, consider reaching out to a counselor who can listen.",
    keywords: [
      'stres', 'stress', 'overwhelm', 'tertekan', 'beban', 'deadline', 'tugas', 'ujian', 'exam',
      'pressure', 'burnout', 'kewalahan', 'pusing', 'marah', 'angry', 'kesal', 'frustrat',
    ],
  },
  {
    moodType: 'stressed',
    label: 'Anxious',
    reflection:
      'Anxiety can feel loud, but you gave yourself space to breathe and slow down.',
    counselorHelpText: 'Practice grounding exercises whenever thoughts begin racing.',
    keywords: [
      'cemas', 'anxi', 'panik', 'panic', 'khawatir', 'worr', 'overthink', 'takut', 'afraid',
      'scared', 'nervous', 'gugup', 'deg-degan', 'gelisah', 'restless',
    ],
  },
  {
    moodType: 'tired',
    label: 'Feeling low',
    reflection:
      "Some days feel heavier than others. Naming what hurts is a brave first step, and you don't have to go through it alone.",
    counselorHelpText: 'Talking to someone you trust can make heavy feelings lighter.',
    keywords: [
      'sedih', 'sad', 'nangis', 'menangis', 'cry', 'kesepian', 'lonely', 'sendirian', 'alone',
      'kecewa', 'disappoint', 'galau', 'hopeless', 'putus asa', 'hampa', 'empty',
    ],
  },
  {
    moodType: 'tired',
    label: 'Tired',
    reflection:
      'Your body and mind are asking for rest. Slowing down is not falling behind — it helps you recharge.',
    counselorHelpText: 'Try a steady sleep routine and short breaks during the day.',
    keywords: [
      'capek', 'cape', 'lelah', 'tired', 'exhaust', 'ngantuk', 'sleepy', 'insomnia',
      'susah tidur', 'gak bisa tidur', "can't sleep", 'cant sleep', 'kurang tidur', 'letih',
    ],
  },
  {
    moodType: 'great',
    label: 'Grateful',
    reflection: 'Gratitude opens the heart to simple joys and restores inner balance.',
    counselorHelpText: 'Continue noting down 3 things you appreciate every evening.',
    keywords: [
      'senang', 'seneng', 'happy', 'bahagia', 'bersyukur', 'grateful', 'thankful', 'excited',
      'bangga', 'proud', 'berhasil', 'success', 'gembira', 'joy',
    ],
  },
  {
    moodType: 'good',
    label: 'A little better',
    reflection:
      'You noticed moments of calm today. Small steps like these add up over time.',
    counselorHelpText: 'Keeping up positive routines and conversations supports your well-being.',
    keywords: [
      'lega', 'relieved', 'better', 'membaik', 'lebih baik', 'tenang', 'calm', 'santai',
      'relax', 'peaceful', 'damai',
    ],
  },
];

const FALLBACK_REFLECTION: Record<MoodType, string> = {
  great: "You're in a bright place today. Keep noticing what brings you joy.",
  good: 'Things feel steady today. Keep looking after yourself in small ways.',
  okay: "Not every day has to be great — checking in with yourself is already a good step.",
  tired: 'Your energy is low today. Be gentle with yourself and take time to rest.',
  stressed: "There's a lot on your mind. Taking time to talk about it was a good choice.",
};

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const COMPILED_RULES = MOOD_RULES.map((rule) => ({
  rule,
  pattern: new RegExp(`(^|[^\\p{L}])(${rule.keywords.map(escapeRegex).join('|')})`, 'giu'),
}));

export interface SessionMood {
  moodType: MoodType;
  moodLabel: string;
  moodReflection: string;
  counselorHelpText: string;
}

/** Picks the mood whose keywords appear most often in the user's messages. */
export function detectSessionMood(session: TalkSession, fallbackMood: MoodType): SessionMood {
  const text = session.messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join('\n');

  let best: MoodRule | null = null;
  let bestScore = 0;
  for (const { rule, pattern } of COMPILED_RULES) {
    const score = text.match(pattern)?.length ?? 0;
    if (score > bestScore) {
      best = rule;
      bestScore = score;
    }
  }

  if (best) {
    return {
      moodType: best.moodType,
      moodLabel: best.label,
      moodReflection: best.reflection,
      counselorHelpText: best.counselorHelpText,
    };
  }

  // Nothing matched: use the mood picked on Home
  return {
    moodType: fallbackMood,
    moodLabel: MOOD_OPTIONS.find((m) => m.id === fallbackMood)?.label ?? 'Okay',
    moodReflection: FALLBACK_REFLECTION[fallbackMood],
    counselorHelpText:
      "If you're feeling overwhelmed, consider reaching out to a counselor who can listen.",
  };
}

// ---------------------------------------------------------------------------
// Roadmap
// ---------------------------------------------------------------------------

type ActivityTemplate = Omit<RoadmapItem, 'id' | 'day' | 'date' | 'isActive'>;

const ACTIVITIES = {
  walk: {
    title: 'Take a 20-minute walk',
    location: 'Jalan Ijen, Malang',
    description: 'Enjoy the fresh air and clear your mind.',
    image: '/assets/roadmap-1.png',
  },
  nature: {
    title: 'Visit Kebun Jeruk Batu',
    location: 'Kebun Jeruk, Batu',
    description: 'Spend time in nature and get some sunlight.',
    image: '/assets/roadmap-2.png',
  },
  journal: {
    title: 'Journal at a cozy café',
    location: 'Dailydose Coffee, Malang (Jl. Bandung No. 7)',
    description: "Write about what's on your mind.",
    image: '/assets/roadmap-3.png',
  },
  yoga: {
    title: 'Light yoga in the park',
    location: 'Taman Singha Merjosari, Malang',
    description: 'Move your body and take a deep breath.',
    image: '/assets/roadmap-4.png',
  },
  swim: {
    title: 'Free Swimming Class',
    location: 'Batu, Malang',
    description: 'A relaxing activity to refresh your mind and reduce burnout.',
    image: '/assets/pool.png',
  },
} satisfies Record<string, ActivityTemplate>;

const ROADMAP_BY_MOOD: Record<MoodType, ActivityTemplate[]> = {
  stressed: [ACTIVITIES.yoga, ACTIVITIES.walk, ACTIVITIES.journal, ACTIVITIES.nature],
  tired: [ACTIVITIES.journal, ACTIVITIES.yoga, ACTIVITIES.nature, ACTIVITIES.walk],
  okay: [ACTIVITIES.walk, ACTIVITIES.yoga, ACTIVITIES.journal, ACTIVITIES.nature],
  good: [ACTIVITIES.walk, ACTIVITIES.journal, ACTIVITIES.swim, ACTIVITIES.nature],
  great: [ACTIVITIES.swim, ACTIVITIES.nature, ACTIVITIES.journal, ACTIVITIES.walk],
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Four activities on the four days after the session, first one highlighted. */
export function buildSessionRoadmap(session: TalkSession, moodType: MoodType): RoadmapItem[] {
  const start = new Date(session.createdAt);
  return ROADMAP_BY_MOOD[moodType].map((activity, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index + 1);
    return {
      ...activity,
      id: `${session.id}-road-${index + 1}`,
      day: WEEKDAYS[day.getDay()],
      date: formatShortDate(day.toISOString()),
      isActive: index === 0,
    };
  });
}

/** Builds a Journal entry in the same shape as the existing ones. */
export function sessionToJournalEntry(session: TalkSession, fallbackMood: MoodType): JournalEntry {
  const mood = detectSessionMood(session, fallbackMood);
  return {
    id: session.id,
    title: session.title,
    dayNumber: formatDayNumber(session.createdAt),
    month: formatMonthShort(session.createdAt),
    fullDate: formatFullDate(session.createdAt),
    sessionTime: formatTime(session.updatedAt),
    sessionType: 'AI Talk with Hyo',
    preview: getSessionPreview(session),
    ...mood,
    roadmap: buildSessionRoadmap(session, mood.moodType),
  };
}
