/** Date labels in the same style as the Journal mock data ("18", "OCT", "18 October 2026", "20:14"). */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export function formatDayNumber(iso: string): string {
  return String(new Date(iso).getDate()).padStart(2, '0');
}

export function formatMonthShort(iso: string): string {
  return MONTHS[new Date(iso).getMonth()].slice(0, 3).toUpperCase();
}

export function formatFullDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** "22 Oct" */
export function formatShortDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()].slice(0, 3)}`;
}
