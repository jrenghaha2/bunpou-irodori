import type {
  BookId,
  BunpouPattern,
  ChapterNumber,
  QuizAnswerSnapshot,
  QuizFocus,
  QuizQuestionType,
  QuizRecord,
  QuizSessionHistoryEntry,
} from '../types/bunpou';
import { BOOK_CHAPTER_RANGES } from '../types/bunpou';
import { BOOK_STORAGE_KEYS } from './bunpouSync';
import { calculateQuizScore, formatChapterSelectionLabel } from './quizGenerator';
import { getDefaultStorage, type StorageLike } from './storage';

export const MAX_QUIZ_HISTORY_ENTRIES = 15;

const TYPE_TO_CODE: Record<QuizQuestionType, string> = {
  cloze: '0',
  formula: '1',
  function: '2',
};

const CODE_TO_TYPE: Record<string, QuizQuestionType> = {
  '0': 'cloze',
  '1': 'formula',
  '2': 'function',
};

export interface QuizPerformanceStats {
  totalSessions: number;
  totalAnswered: number;
  totalCorrect: number;
  overallAccuracyPct: number;
  latestScore: number | null;
  bestScore: number;
  trendDelta: number | null;
}

export function computeQuizPerformanceStats(
  history: readonly QuizSessionHistoryEntry[]
): QuizPerformanceStats {
  if (history.length === 0) {
    return {
      totalSessions: 0,
      totalAnswered: 0,
      totalCorrect: 0,
      overallAccuracyPct: 0,
      latestScore: null,
      bestScore: 0,
      trendDelta: null,
    };
  }

  let totalAnswered = 0;
  let totalCorrect = 0;
  let bestScore = 0;

  for (const entry of history) {
    totalAnswered += entry.total;
    totalCorrect += entry.correct;
    if (entry.score > bestScore) bestScore = entry.score;
  }

  const latestScore = history[0].score;
  const prevScore = history.length >= 2 ? history[1].score : null;
  const trendDelta = prevScore !== null ? latestScore - prevScore : null;

  return {
    totalSessions: history.length,
    totalAnswered,
    totalCorrect,
    overallAccuracyPct: calculateQuizScore(totalCorrect, totalAnswered),
    latestScore,
    bestScore,
    trendDelta,
  };
}

export function buildQuizAnswerSnapshots(records: readonly QuizRecord[]): QuizAnswerSnapshot[] {
  return [...records]
    .sort((a, b) => a.no - b.no)
    .map(rec => ({
      no: rec.no,
      type: rec.question.type,
      correct: rec.isCorrect,
      patternId: rec.question.pattern.id,
      patternTitle: rec.question.pattern.title,
      shortPattern: rec.question.pattern.shortPattern,
      formula: rec.question.pattern.formulas[0] ?? '',
      functionText: rec.question.pattern.functionText,
      expectedLabel: rec.correctLabel,
      chosenLabel: rec.chosenLabel,
      exampleJp: rec.question.japaneseFull ?? rec.question.pattern.examples[0]?.japanese,
    }));
}

export function loadQuizHistory(
  bookId: BookId,
  storage: StorageLike | null = getDefaultStorage()
): QuizSessionHistoryEntry[] {
  if (!storage) return [];
  const storageKey = BOOK_STORAGE_KEYS[bookId].quizHistoryKey;
  try {
    const raw = storage.getItem(storageKey);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry): entry is QuizSessionHistoryEntry => {
        if (!entry || typeof entry !== 'object') return false;
        const e = entry as Partial<QuizSessionHistoryEntry>;
        return (
          typeof e.id === 'string' &&
          typeof e.completedAt === 'string' &&
          typeof e.correct === 'number' &&
          typeof e.total === 'number' &&
          e.total > 0 &&
          typeof e.score === 'number' &&
          (e.focus === 'mixed' || e.focus === 'cloze' || e.focus === 'formula' || e.focus === 'function')
        );
      })
      .slice(0, MAX_QUIZ_HISTORY_ENTRIES);
  } catch {
    return [];
  }
}

export function saveQuizHistory(
  bookId: BookId,
  history: readonly QuizSessionHistoryEntry[],
  storage: StorageLike | null = getDefaultStorage()
): void {
  if (!storage) return;
  const storageKey = BOOK_STORAGE_KEYS[bookId].quizHistoryKey;
  try {
    storage.setItem(storageKey, JSON.stringify(history.slice(0, MAX_QUIZ_HISTORY_ENTRIES)));
  } catch {
    // Non-fatal
  }
}

export interface RecordQuizSessionInput {
  bookId: BookId;
  scopeLabel: string;
  chapters?: ChapterNumber[];
  focus: QuizFocus;
  correct: number;
  total: number;
  answers?: QuizAnswerSnapshot[];
}

export function createQuizSessionEntry(input: RecordQuizSessionInput): QuizSessionHistoryEntry {
  const now = new Date();
  const suffix = Math.random().toString(36).slice(2, 6);
  const id = `q${now.getTime()}_${suffix}`;
  const score = calculateQuizScore(input.correct, input.total);
  return {
    id,
    completedAt: now.toISOString(),
    bookId: input.bookId,
    scopeLabel: input.scopeLabel,
    chapters: input.chapters,
    focus: input.focus,
    correct: Math.max(0, Math.min(input.correct, input.total)),
    total: Math.max(1, input.total),
    score: Math.max(0, Math.min(100, score)),
    answers: input.answers,
  };
}

export function mergeQuizHistories(
  a: readonly QuizSessionHistoryEntry[],
  b: readonly QuizSessionHistoryEntry[]
): QuizSessionHistoryEntry[] {
  const byId = new Map<string, QuizSessionHistoryEntry>();
  for (const item of [...a, ...b]) {
    const existing = byId.get(item.id);
    if (!existing) {
      byId.set(item.id, item);
    } else if ((item.answers?.length ?? 0) > (existing.answers?.length ?? 0)) {
      byId.set(item.id, item);
    }
  }
  return [...byId.values()]
    .sort((x, y) => y.completedAt.localeCompare(x.completedAt))
    .slice(0, MAX_QUIZ_HISTORY_ENTRIES);
}

/**
 * Encodes a QuizSessionHistoryEntry into a compact pure-ASCII token matching firestore.rules:
 * id|completedAt|focus|correct|total|score|scopeCode|answersPacked
 */
export function encodeQuizSessionToken(entry: QuizSessionHistoryEntry): string {
  const safeId = entry.id.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || `q${Date.now()}`;
  const isoDate = new Date(entry.completedAt);
  const completedAt = Number.isNaN(isoDate.getTime())
    ? new Date().toISOString()
    : isoDate.toISOString();

  const range = BOOK_CHAPTER_RANGES[entry.bookId];
  const validChapters = entry.chapters
    ? [...new Set(entry.chapters)]
        .filter(ch => ch >= range.min && ch <= range.max)
        .sort((a, b) => a - b)
    : [];
  const sortedChapters =
    validChapters.length > 0 && validChapters.length < range.count ? validChapters : null;

  const scopeCode = sortedChapters ? sortedChapters.join('.') : 'all';

  const bookPatternRegex = new RegExp(`^${entry.bookId}-bab-([1-9]|1[0-8])-p[1-9][0-9]?$`);
  const answersPacked = (entry.answers ?? [])
    .filter(a => bookPatternRegex.test(a.patternId))
    .slice(0, 120)
    .map(a => `${a.no}:${TYPE_TO_CODE[a.type] ?? '0'}:${a.patternId}:${a.correct ? '1' : '0'}`)
    .join(';');

  const safeCorrect = Math.max(0, Math.min(999, Math.round(entry.correct)));
  const safeTotal = Math.max(1, Math.min(999, Math.round(entry.total)));
  const safeScore = Math.max(0, Math.min(100, Math.round(entry.score)));

  return `${safeId}|${completedAt}|${entry.focus}|${safeCorrect}|${safeTotal}|${safeScore}|${scopeCode}|${answersPacked}`;
}

export function decodeQuizSessionToken(
  token: string,
  bookId: BookId,
  patternById: Map<string, BunpouPattern>
): QuizSessionHistoryEntry | null {
  if (typeof token !== 'string') return null;
  const parts = token.split('|');
  if (parts.length !== 8) return null;
  const [id, completedAt, focusRaw, correctStr, totalStr, scoreStr, scopeCode, answersPacked] = parts;

  if (
    focusRaw !== 'mixed' &&
    focusRaw !== 'cloze' &&
    focusRaw !== 'formula' &&
    focusRaw !== 'function'
  ) {
    return null;
  }

  const correct = Number(correctStr);
  const total = Number(totalStr);
  const score = Number(scoreStr);
  if (!Number.isFinite(correct) || !Number.isFinite(total) || total <= 0 || !Number.isFinite(score)) {
    return null;
  }

  const range = BOOK_CHAPTER_RANGES[bookId];
  let chapters: ChapterNumber[] | undefined;
  let scopeLabel = `Semua Bab (${range.min}–${range.max})`;
  if (scopeCode !== 'all' && scopeCode.length > 0) {
    const parsedCh = scopeCode
      .split('.')
      .map(Number)
      .filter((n): n is ChapterNumber => Number.isInteger(n) && n >= range.min && n <= range.max);
    if (parsedCh.length > 0) {
      chapters = parsedCh;
      scopeLabel = formatChapterSelectionLabel(parsedCh, range.count);
    }
  }

  const answers: QuizAnswerSnapshot[] = [];
  if (answersPacked) {
    for (const seg of answersPacked.split(';')) {
      const segParts = seg.split(':');
      if (segParts.length !== 4) continue;
      const [noStr, typeCode, patternId, bit] = segParts;
      const no = Number(noStr);
      const qType = CODE_TO_TYPE[typeCode];
      const pat = patternById.get(patternId);
      if (!Number.isFinite(no) || !qType || !pat) continue;
      const isCorrect = bit === '1';
      const expectedLabel =
        qType === 'formula'
          ? pat.formulas[0] ?? pat.title
          : qType === 'function'
            ? pat.functionText
            : pat.shortPattern;
      answers.push({
        no,
        type: qType,
        correct: isCorrect,
        patternId: pat.id,
        patternTitle: pat.title,
        shortPattern: pat.shortPattern,
        formula: pat.formulas[0] ?? '',
        functionText: pat.functionText,
        expectedLabel,
        chosenLabel: isCorrect ? expectedLabel : '(Jawaban lain)',
        exampleJp: pat.examples[0]?.japanese,
      });
    }
  }

  return {
    id,
    completedAt,
    bookId,
    scopeLabel,
    chapters,
    focus: focusRaw,
    correct,
    total,
    score,
    answers,
  };
}
