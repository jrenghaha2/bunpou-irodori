import type { BookId } from '../types/bunpou';

export const DISPLAY_NAME_MAX_LENGTH = 60;
export const AVATAR_URL_MAX_LENGTH = 20000;

export const BOOK_STORAGE_KEYS: Record<
  BookId,
  { masteredKey: string; hardKey: string; quizHistoryKey: string; shortLabel: string; label: string }
> = {
  introductory: {
    masteredKey: 'irodori_bunpou_introductory_mastered_v1',
    hardKey: 'irodori_bunpou_introductory_hard_v1',
    quizHistoryKey: 'irodori_bunpou_introductory_quiz_history_v1',
    shortLabel: 'Pemula',
    label: 'Pemula — いろどり 入門 (A1)',
  },
  elementary1: {
    masteredKey: 'irodori_bunpou_elementary1_mastered_v1',
    hardKey: 'irodori_bunpou_elementary1_hard_v1',
    quizHistoryKey: 'irodori_bunpou_elementary1_quiz_history_v1',
    shortLabel: 'Dasar 1',
    label: 'Dasar 1 — いろどり 初級1 (A2)',
  },
  elementary2: {
    masteredKey: 'irodori_bunpou_elementary2_mastered_v1',
    hardKey: 'irodori_bunpou_elementary2_hard_v1',
    quizHistoryKey: 'irodori_bunpou_elementary2_quiz_history_v1',
    shortLabel: 'Dasar 2',
    label: 'Dasar 2 — いろどり 初級2 (A2)',
  },
};

export const CHAPTER_DOT_COLORS: readonly string[] = [
  '#0d9488',
  '#4f46e5',
  '#0284c7',
  '#059669',
  '#d97706',
  '#e11d48',
  '#7c3aed',
  '#2563eb',
  '#16a34a',
  '#ea580c',
  '#9333ea',
  '#0891b2',
  '#db2777',
  '#65a30d',
  '#ca8a04',
  '#dc2626',
  '#4338ca',
  '#0f766e',
];

export function getChapterDotColor(chapterNumber: number): string {
  const idx = Math.max(0, chapterNumber - 1) % CHAPTER_DOT_COLORS.length;
  return CHAPTER_DOT_COLORS[idx];
}

export function sanitizeDisplayName(input: string): string {
  return input.trim().replace(/\s+/g, ' ').slice(0, DISPLAY_NAME_MAX_LENGTH);
}

export function isValidAvatarUrl(url: string): boolean {
  if (url === '') return true;
  if (url.length > AVATAR_URL_MAX_LENGTH) return false;
  if (/^https:\/\/[^\s]+$/.test(url)) return true;
  if (/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(url)) return true;
  return false;
}

export function sanitizeIdArray(raw: unknown, validIds: Set<string>): string[] {
  if (!Array.isArray(raw)) return [];
  const out = new Set<string>();
  for (const item of raw) {
    if (typeof item === 'string' && validIds.has(item)) {
      out.add(item);
    }
  }
  return [...out];
}

export function normalizeDisjointSets(
  mastered: Iterable<string>,
  hard: Iterable<string>,
  validIds: Set<string>
): { mastered: Set<string>; hard: Set<string> } {
  const nextMastered = new Set<string>();
  const nextHard = new Set<string>();

  for (const id of mastered) {
    if (validIds.has(id)) nextMastered.add(id);
  }
  for (const id of hard) {
    if (validIds.has(id) && !nextMastered.has(id)) {
      nextHard.add(id);
    }
  }

  return { mastered: nextMastered, hard: nextHard };
}

export function markPatternMastered(
  mastered: Set<string>,
  hard: Set<string>,
  patternId: string
): { nextMastered: Set<string>; nextHard: Set<string>; isNewMastered: boolean } {
  const nextMastered = new Set(mastered);
  const nextHard = new Set(hard);
  const isNewMastered = !nextMastered.has(patternId);
  nextMastered.add(patternId);
  nextHard.delete(patternId);
  return { nextMastered, nextHard, isNewMastered };
}

export function markPatternHard(
  mastered: Set<string>,
  hard: Set<string>,
  patternId: string
): { nextMastered: Set<string>; nextHard: Set<string> } {
  const nextMastered = new Set(mastered);
  const nextHard = new Set(hard);
  nextHard.add(patternId);
  nextMastered.delete(patternId);
  return { nextMastered, nextHard };
}

export function mergeProgressSets(
  aMastered: Set<string>,
  aHard: Set<string>,
  bMastered: Set<string>,
  bHard: Set<string>,
  validIds: Set<string>
): { mastered: Set<string>; hard: Set<string> } {
  const combinedMastered = new Set<string>([...aMastered, ...bMastered]);
  const combinedHard = new Set<string>([...aHard, ...bHard]);
  return normalizeDisjointSets(combinedMastered, combinedHard, validIds);
}

export function areSetsEqual(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  for (const val of a) {
    if (!b.has(val)) return false;
  }
  return true;
}
