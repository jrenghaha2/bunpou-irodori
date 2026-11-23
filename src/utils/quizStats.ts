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
import {
  calculateQuizScore,
  findClozeTarget,
  formatChapterSelectionLabel,
} from './quizGenerator';
import { getDefaultStorage, type StorageLike } from './storage';

export const MAX_QUIZ_HISTORY_ENTRIES = 15;
export const MAX_CHOSEN_LABEL_UTF8_BYTES = 180;
export const MAX_QUIZ_TOKEN_LENGTH = 15800;
export const LEGACY_UNRECORDED_CHOICE_LABEL = '(Opsi tidak tercatat di versi lama)';

const LEGACY_PLACEHOLDER_LABELS = new Set<string>([
  LEGACY_UNRECORDED_CHOICE_LABEL,
  '(Jawaban lain)',
]);

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

const BASE64URL_RE = /^[A-Za-z0-9_-]{1,260}$/;

const utf8Encoder = new TextEncoder();
const utf8Decoder = new TextDecoder('utf-8', { fatal: false });

export function isLegacyPlaceholderChoiceLabel(label: string | undefined): boolean {
  const trimmed = (label ?? '').trim();
  return trimmed.length === 0 || LEGACY_PLACEHOLDER_LABELS.has(trimmed);
}

/**
 * Truncates text safely at Unicode code-point boundaries so its UTF-8 byte length
 * never exceeds `maxBytes` (default 180 bytes -> <= 240 Base64URL ASCII chars).
 */
function truncateUtf8Safe(text: string, maxBytes: number): string {
  const normalized = text.trim();
  if (!normalized) return '';
  const fullBytes = utf8Encoder.encode(normalized);
  if (fullBytes.length <= maxBytes) return normalized;

  const ellipsis = '…';
  const ellipsisBytes = utf8Encoder.encode(ellipsis).length; // 3 bytes
  const budget = Math.max(0, maxBytes - ellipsisBytes);

  let out = '';
  let used = 0;
  for (const ch of normalized) {
    const chLen = utf8Encoder.encode(ch).length;
    if (used + chLen > budget) break;
    out += ch;
    used += chLen;
  }
  return out ? `${out.trimEnd()}${ellipsis}` : ellipsis;
}

/**
 * Pure-JS browser & Node compatible Base64URL encoder (no padding `=`, pure `[A-Za-z0-9_-]`).
 * Caps UTF-8 input to 180 bytes so output is guaranteed <= 240 ASCII characters.
 */
export function encodeChosenLabelBase64Url(text: string): string {
  const safe = truncateUtf8Safe(text, MAX_CHOSEN_LABEL_UTF8_BYTES);
  if (!safe) return '';
  const bytes = utf8Encoder.encode(safe);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/**
 * Pure-JS browser & Node compatible Base64URL decoder. Returns empty string on malformed input.
 */
export function decodeChosenLabelBase64Url(encoded: string): string {
  if (!encoded || !BASE64URL_RE.test(encoded)) return '';
  try {
    const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    const padLen = (4 - (base64.length % 4)) % 4;
    const padded = padLen > 0 ? base64 + '='.repeat(padLen) : base64;
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return utf8Decoder.decode(bytes).trim();
  } catch {
    return '';
  }
}

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
    .map(rec => {
      const pat = rec.question.pattern;
      const cloze = rec.question.type === 'cloze' ? findClozeTarget(pat) : null;
      return {
        no: rec.no,
        type: rec.question.type,
        correct: rec.isCorrect,
        patternId: pat.id,
        chapterNumber: pat.chapterNumber,
        patternTitle: pat.title,
        shortPattern: pat.shortPattern,
        formula: pat.formulas[0] ?? '',
        functionText: pat.functionText,
        expectedLabel: rec.correctLabel,
        chosenLabel: rec.chosenLabel,
        promptText: rec.question.promptWithoutTranslation ?? rec.question.prompt,
        clozePromptJp:
          rec.question.type === 'cloze'
            ? rec.question.japanesePrompt ?? cloze?.blankedSentence
            : undefined,
        exampleJp: rec.question.japaneseFull ?? cloze?.fullSentence ?? pat.examples[0]?.japanese,
        translationId: cloze?.translation ?? pat.examples[0]?.translation,
      };
    });
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

function countRichAnswerDetails(entry: QuizSessionHistoryEntry): number {
  const answers = entry.answers ?? [];
  let rich = 0;
  for (const a of answers) {
    if (a.correct || !isLegacyPlaceholderChoiceLabel(a.chosenLabel)) {
      rich += 1;
    }
  }
  return rich;
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
      continue;
    }
    const itemRich = countRichAnswerDetails(item);
    const existingRich = countRichAnswerDetails(existing);
    const itemLen = item.answers?.length ?? 0;
    const existingLen = existing.answers?.length ?? 0;

    if (itemRich > existingRich || (itemRich === existingRich && itemLen > existingLen)) {
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
 *
 * Each answer item uses backward-compatible 4-segment or 5-segment format:
 * - Correct answer: `no:typeCode:patternId:1`
 * - Wrong answer with exact clicked choice: `no:typeCode:patternId:0:chosenB64Url`
 * - Total token length is strictly guarded <= MAX_QUIZ_TOKEN_LENGTH (15800) so Firestore writes
 *   never fail even when a learner completes "Semua Soal".
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

  const safeCorrect = Math.max(0, Math.min(999, Math.round(entry.correct)));
  const safeTotal = Math.max(1, Math.min(999, Math.round(entry.total)));
  const safeScore = Math.max(0, Math.min(100, Math.round(entry.score)));

  const headerPrefix = `${safeId}|${completedAt}|${entry.focus}|${safeCorrect}|${safeTotal}|${safeScore}|${scopeCode}|`;

  const bookPatternRegex = new RegExp(`^${entry.bookId}-bab-([1-9]|1[0-8])-p[1-9][0-9]?$`);
  const validAnswers = (entry.answers ?? [])
    .filter(a => Number.isInteger(a.no) && a.no >= 1 && a.no <= 999 && bookPatternRegex.test(a.patternId))
    .slice(0, 120);

  // Build 4-segment base items first so we know the guaranteed minimum length for all remaining items
  const baseSegments = validAnswers.map(
    a => `${a.no}:${TYPE_TO_CODE[a.type] ?? '0'}:${a.patternId}:${a.correct ? '1' : '0'}`
  );
  // Precompute suffix length needed for all remaining 4-segment items (including ';' separators)
  const suffixBaseLen = new Array<number>(baseSegments.length + 1).fill(0);
  for (let i = baseSegments.length - 1; i >= 0; i--) {
    suffixBaseLen[i] = baseSegments[i].length + (i < baseSegments.length - 1 ? 1 + suffixBaseLen[i + 1] : 0);
  }

  const packedSegments: string[] = [];
  let currentLength = headerPrefix.length;

  for (let i = 0; i < validAnswers.length; i++) {
    const ans = validAnswers[i];
    const baseSeg = baseSegments[i];
    const sepLen = packedSegments.length > 0 ? 1 : 0;
    const remainingMinLen = i < validAnswers.length - 1 ? 1 + suffixBaseLen[i + 1] : 0;

    let chosenSeg = baseSeg;
    if (!ans.correct && !isLegacyPlaceholderChoiceLabel(ans.chosenLabel)) {
      const encodedChoice = encodeChosenLabelBase64Url(ans.chosenLabel);
      if (encodedChoice && BASE64URL_RE.test(encodedChoice)) {
        const candidate = `${baseSeg}:${encodedChoice}`;
        if (currentLength + sepLen + candidate.length + remainingMinLen <= MAX_QUIZ_TOKEN_LENGTH) {
          chosenSeg = candidate;
        }
      }
    }

    if (currentLength + sepLen + chosenSeg.length > MAX_QUIZ_TOKEN_LENGTH) {
      break;
    }

    packedSegments.push(chosenSeg);
    currentLength += sepLen + chosenSeg.length;
  }

  return `${headerPrefix}${packedSegments.join(';')}`;
}

function reconstructQuestionDetails(
  qType: QuizQuestionType,
  pat: BunpouPattern
): {
  promptText: string;
  clozePromptJp?: string;
  exampleJp?: string;
  translationId?: string;
  expectedLabel: string;
} {
  if (qType === 'cloze') {
    const cloze = findClozeTarget(pat);
    return {
      promptText: 'Lengkapi bagian rumpang pada kalimat berikut sesuai konteks maknanya.',
      clozePromptJp: cloze?.blankedSentence,
      exampleJp: cloze?.fullSentence ?? pat.examples[0]?.japanese,
      translationId: cloze?.translation ?? pat.examples[0]?.translation,
      expectedLabel: cloze?.answer ?? pat.shortPattern,
    };
  }

  if (qType === 'formula') {
    return {
      promptText: `Manakah rumus penyambungan yang tepat untuk pola "${pat.title}" (${pat.functionText})?`,
      exampleJp: pat.examples[0]?.japanese,
      translationId: pat.examples[0]?.translation,
      expectedLabel: pat.formulas[0] ?? pat.title,
    };
  }

  return {
    promptText: `Apa fungsi utama dari pola bunpou "${pat.shortPattern}" berikut ini?`,
    exampleJp: pat.examples[0]?.japanese,
    translationId: pat.examples[0]?.translation,
    expectedLabel: pat.functionText,
  };
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
      if (segParts.length !== 4 && segParts.length !== 5) continue;
      const [noStr, typeCode, patternId, bit, chosenB64] = segParts;
      const no = Number(noStr);
      const qType = CODE_TO_TYPE[typeCode];
      const pat = patternById.get(patternId);
      if (!Number.isFinite(no) || !qType || !pat) continue;
      const isCorrect = bit === '1';

      const details = reconstructQuestionDetails(qType, pat);
      let chosenLabel: string;
      if (isCorrect) {
        chosenLabel = details.expectedLabel;
      } else if (chosenB64) {
        const decodedChoice = decodeChosenLabelBase64Url(chosenB64);
        chosenLabel = decodedChoice || LEGACY_UNRECORDED_CHOICE_LABEL;
      } else {
        chosenLabel = LEGACY_UNRECORDED_CHOICE_LABEL;
      }

      answers.push({
        no,
        type: qType,
        correct: isCorrect,
        patternId: pat.id,
        chapterNumber: pat.chapterNumber,
        patternTitle: pat.title,
        shortPattern: pat.shortPattern,
        formula: pat.formulas[0] ?? '',
        functionText: pat.functionText,
        expectedLabel: details.expectedLabel,
        chosenLabel,
        promptText: details.promptText,
        clozePromptJp: details.clozePromptJp,
        exampleJp: details.exampleJp,
        translationId: details.translationId,
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
