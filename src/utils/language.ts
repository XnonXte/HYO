/**
 * Lightweight Indonesian vs English detection for chat text, based on common
 * function words. Good enough to pick a speech voice; not a general classifier.
 */

export type ChatLanguage = 'id' | 'en';

const INDONESIAN_WORDS = new Set([
  'aku', 'saya', 'kamu', 'anda', 'kita', 'kami', 'dia', 'mereka', 'ini', 'itu', 'yang',
  'dan', 'atau', 'tapi', 'tetapi', 'karena', 'dengan', 'untuk', 'dari', 'ke', 'di', 'pada',
  'dalam', 'tidak', 'nggak', 'gak', 'enggak', 'ga', 'bukan', 'sudah', 'udah', 'belum',
  'akan', 'bisa', 'mau', 'ingin', 'pengen', 'lagi', 'sedang', 'juga', 'saja', 'aja',
  'banget', 'sangat', 'lebih', 'kalau', 'kalo', 'jika', 'apa', 'apakah', 'bagaimana',
  'gimana', 'kenapa', 'mengapa', 'kapan', 'dimana', 'siapa', 'ya', 'iya', 'yuk', 'ayo',
  'perasaan', 'merasa', 'rasa', 'hari', 'sekarang', 'nanti', 'semua', 'sama', 'jadi',
  'ada', 'punya', 'boleh', 'harus', 'perlu', 'coba', 'kok', 'sih', 'dong', 'deh', 'nih',
  'terima', 'kasih', 'makasih', 'selamat', 'tenang', 'capek', 'sedih', 'senang', 'baik',
  'dirimu', 'diri', 'sendiri', 'langkah', 'kecil', 'satu', 'per', 'teman',
]);

const ENGLISH_WORDS = new Set([
  'i', "i'm", 'im', 'you', "you're", 'we', 'they', 'he', 'she', 'it', 'is', 'are', 'am',
  'was', 'were', 'be', 'been', 'the', 'a', 'an', 'and', 'or', 'but', 'because', 'with',
  'for', 'from', 'to', 'of', 'in', 'on', 'at', 'not', "don't", 'dont', "can't", 'have',
  'has', 'had', 'do', 'does', 'did', 'will', 'would', 'can', 'could', 'should', 'want',
  'feel', 'feeling', 'today', 'that', 'this', 'what', 'how', 'why', 'when', 'where',
  'who', 'my', 'your', 'me', 'so', 'very', 'really', 'just', 'about', 'it\'s', 'there',
  'here', 'let\'s', 'lets', 'okay', 'yes', 'no', 'thank', 'thanks', 'take', 'time',
]);

/** Returns the detected language, or null when the text gives no clear signal. */
export function detectLanguage(text: string): ChatLanguage | null {
  const words = text.toLowerCase().match(/[a-z']+/g) ?? [];
  let id = 0;
  let en = 0;
  for (const word of words) {
    if (INDONESIAN_WORDS.has(word)) id++;
    if (ENGLISH_WORDS.has(word)) en++;
  }
  if (id === 0 && en === 0) return null;
  if (id === en) return null;
  return id > en ? 'id' : 'en';
}

/** Language of a whole conversation: the majority over its messages, or null. */
export function detectConversationLanguage(texts: string[]): ChatLanguage | null {
  return detectLanguage(texts.join(' '));
}
