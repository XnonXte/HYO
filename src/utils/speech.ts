/**
 * Picks a speech-synthesis voice for a language. Voices load asynchronously in
 * some browsers, so the list is cached and refreshed on `voiceschanged`.
 */

import type { ChatLanguage } from './language';

export const SPEECH_LOCALES: Record<ChatLanguage, string> = {
  id: 'id-ID',
  en: 'en-US',
};

let cachedVoices: SpeechSynthesisVoice[] = [];

function loadVoices(): SpeechSynthesisVoice[] {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
  const voices = window.speechSynthesis.getVoices();
  if (voices.length) cachedVoices = voices;
  return cachedVoices;
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  loadVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', loadVoices);
}

/** Lower is better: exact locale, then natural/online voices, then local ones. */
function rankVoice(voice: SpeechSynthesisVoice, locale: string): number {
  const lang = voice.lang.replace('_', '-').toLowerCase();
  const target = locale.toLowerCase();
  const base = target.split('-')[0];
  // Old Android builds report Indonesian as "in-ID"
  const matches = lang === target || lang.startsWith(`${base}-`) || lang === base ||
    (base === 'id' && lang.startsWith('in'));
  if (!matches) return Infinity;
  let score = lang === target ? 0 : 10;
  const name = voice.name.toLowerCase();
  if (/natural|neural|online|google/.test(name)) score -= 5;
  if (voice.default) score -= 1;
  return score;
}

/** Best available voice for the language, or null if the device has none. */
export function pickVoice(language: ChatLanguage): SpeechSynthesisVoice | null {
  const locale = SPEECH_LOCALES[language];
  let best: SpeechSynthesisVoice | null = null;
  let bestRank = Infinity;
  for (const voice of loadVoices()) {
    const rank = rankVoice(voice, locale);
    if (rank < bestRank) {
      best = voice;
      bestRank = rank;
    }
  }
  return best;
}
