import type { BookId, BunpouPattern, QuizFocus, QuizQuestion, QuizQuestionType } from '../types/bunpou';

export const ABC_LABELS = ['A', 'B', 'C', 'D'] as const;

export function shuffled<T>(items: readonly T[], rng: () => number = Math.random): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function calculateQuizScore(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

export function formatChapterSelectionLabel(chapters: readonly number[], totalChapters = 18): string {
  const unique = [...new Set(chapters)].sort((a, b) => a - b);
  if (unique.length === 0) return 'Belum pilih bab';
  if (unique.length >= totalChapters) {
    const first = unique[0];
    const last = unique[unique.length - 1];
    return `Semua Bab (${first}–${last})`;
  }
  if (unique.length === 1) return `Bab ${unique[0]}`;

  // Group contiguous ranges cleanly, e.g. Bab 1–3, 5
  const ranges: string[] = [];
  let start = unique[0];
  let prev = unique[0];
  for (let i = 1; i < unique.length; i++) {
    const cur = unique[i];
    if (cur === prev + 1) {
      prev = cur;
    } else {
      ranges.push(start === prev ? `${start}` : `${start}–${prev}`);
      start = cur;
      prev = cur;
    }
  }
  ranges.push(start === prev ? `${start}` : `${start}–${prev}`);
  return `Bab ${ranges.join(', ')}`;
}

function seededShuffle<T>(items: T[], seed?: number): T[] {
  const arr = [...items];
  let s = seed ?? Math.floor(Math.random() * 1_000_000);
  const nextRand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(nextRand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const GENERIC_SINGLE_PARTICLES = new Set([
  'は',
  'が',
  'を',
  'に',
  'で',
  'へ',
  'と',
  'も',
  'の',
  'や',
  'か',
  'ね',
  'よ',
]);

interface RubySpan {
  plainStart: number;
  plainEnd: number;
  rawStart: number;
  rawEnd: number;
}

/**
 * Replaces a matched plain-text substring in a sentence containing `{漢字|かな}` ruby markup
 * without stripping ruby markup from the rest of the sentence.
 * Returns null if the match would slice halfway through a single ruby token.
 */
function blankSentencePreservingRuby(
  rubySentence: string,
  target: string
): { blankedSentence: string } | null {
  const spans: RubySpan[] = [];
  let plain = '';
  const rubyRegex = /\{([^{}|]+)\|([^{}|]+)\}/g;
  let lastRawIdx = 0;
  let match: RegExpExecArray | null;

  const pushPlainChars = (text: string, startRaw: number) => {
    for (let i = 0; i < text.length; i++) {
      spans.push({
        plainStart: plain.length,
        plainEnd: plain.length + 1,
        rawStart: startRaw + i,
        rawEnd: startRaw + i + 1,
      });
      plain += text[i];
    }
  };

  while ((match = rubyRegex.exec(rubySentence)) !== null) {
    if (match.index > lastRawIdx) {
      pushPlainChars(rubySentence.slice(lastRawIdx, match.index), lastRawIdx);
    }
    const base = match[1];
    spans.push({
      plainStart: plain.length,
      plainEnd: plain.length + base.length,
      rawStart: match.index,
      rawEnd: match.index + match[0].length,
    });
    plain += base;
    lastRawIdx = match.index + match[0].length;
  }

  if (lastRawIdx < rubySentence.length) {
    pushPlainChars(rubySentence.slice(lastRawIdx), lastRawIdx);
  }

  if (plain.length <= target.length + 3) return null;

  let searchFrom = 0;
  while (searchFrom <= plain.length - target.length) {
    const idx = plain.indexOf(target, searchFrom);
    if (idx === -1) return null;

    const matchEnd = idx + target.length;
    const startSpan = spans.find(s => s.plainStart === idx);
    const endSpan = spans.find(s => s.plainEnd === matchEnd);

    if (startSpan && endSpan) {
      const blankedSentence =
        rubySentence.slice(0, startSpan.rawStart) +
        '（　　）' +
        rubySentence.slice(endSpan.rawEnd);
      return { blankedSentence };
    }

    searchFrom = idx + 1;
  }

  return null;
}

export function findClozeTarget(pattern: BunpouPattern): {
  blankedSentence: string;
  answer: string;
  fullSentence: string;
  translation: string;
} | null {
  const primaryCandidates: string[] = [];
  const particleCandidates: string[] = [];

  for (const formula of pattern.formulas) {
    const cleaned = formula
      .replace(/\([^)]*\)/g, ' ')
      .replace(/（[^）]*）/g, ' ')
      .replace(/\[[^\]]*\]/g, ' ')
      .replace(/【[^】]*】/g, ' ')
      .replace(/F\.Biasa|イA|ナA|Kel\.I+|V[0-9]*|N[0-9]*|A[0-9]*|S[0-9]*/g, ' ')
      .trim();

    const parts = cleaned
      .split(/[+＋/／、・\s=＝→<>＜＞|｜「」『』]+/)
      .map(p => p.replace(/^[〜～\-－]+|[〜～\-－]+$/g, '').trim())
      .filter(p => p.length >= 1 && p.length <= 12 && /^[ぁ-んァ-ヶ一-龠ー]+$/.test(p));

    for (const part of parts) {
      if (part.length === 1 && GENERIC_SINGLE_PARTICLES.has(part)) {
        particleCandidates.push(part);
      } else {
        primaryCandidates.push(part);
      }
    }
  }

  const sortBySpecificity = (list: string[]) =>
    Array.from(new Set(list)).sort((a, b) => {
      const scoreA = a.length >= 2 && a.length <= 8 ? a.length + 10 : a.length;
      const scoreB = b.length >= 2 && b.length <= 8 ? b.length + 10 : b.length;
      return scoreB - scoreA;
    });

  // Only allow single-character generic particles when the pattern itself has no multi-char grammar stem
  const orderedCandidates =
    primaryCandidates.length > 0
      ? sortBySpecificity(primaryCandidates)
      : sortBySpecificity(particleCandidates);

  for (const example of pattern.examples) {
    if (!example || !example.japanese) continue;

    for (const cand of orderedCandidates) {
      const blanked = blankSentencePreservingRuby(example.japanese, cand);
      if (blanked) {
        return {
          blankedSentence: blanked.blankedSentence,
          answer: cand,
          fullSentence: example.japanese,
          translation: example.translation,
        };
      }
    }
  }

  return null;
}

const FALLBACK_CLOZE_DISTRACTORS = [
  'は',
  'が',
  'を',
  'に',
  'で',
  'へ',
  'と',
  'から',
  'まで',
  'より',
  'も',
  'の',
  'ので',
  'のに',
  'ために',
  'ように',
  'そうです',
  'みたいです',
  'かもしれません',
  'はずです',
  'つもりです',
  'よていです',
  'ことができます',
  'てみます',
  'ておきます',
  'てしまいます',
  'てあります',
  'ながら',
  'ばかり',
  'かわりに',
  'について',
  'によると',
  'おかげで',
  'せいで',
  'ください',
  'ませんか',
  'ましょう',
  'たいです',
  'ほしいです',
];

function pickClozeDistractors(
  correct: string,
  allPatterns: BunpouPattern[],
  seed: number
): string[] {
  const pool: string[] = [];
  const isShortParticle = correct.length <= 2;

  for (const p of allPatterns) {
    for (const f of p.formulas) {
      const parts = f
        .replace(/\([^)]*\)/g, ' ')
        .replace(/（[^）]*）/g, ' ')
        .replace(/\[[^\]]*\]/g, ' ')
        .replace(/【[^】]*】/g, ' ')
        .replace(/F\.Biasa|イA|ナA|V[0-9]*|N[0-9]*|A[0-9]*/g, ' ')
        .split(/[+＋/／、・\s]+/)
        .map(s => s.replace(/^[〜～\-－]+|[〜～\-－]+$/g, '').trim())
        .filter(s => /^[ぁ-んァ-ヶ一-龠ー]+$/.test(s));

      for (const part of parts) {
        if (part === correct) continue;
        if (isShortParticle && part.length <= 3) {
          pool.push(part);
        } else if (!isShortParticle && part.length >= 2 && part.length <= 10) {
          pool.push(part);
        }
      }
    }
  }

  for (const fb of FALLBACK_CLOZE_DISTRACTORS) {
    if (fb !== correct) {
      if ((isShortParticle && fb.length <= 3) || (!isShortParticle && fb.length >= 2)) {
        pool.push(fb);
      }
    }
  }

  const unique = seededShuffle(Array.from(new Set(pool)), seed);
  return unique.slice(0, 3);
}

function buildClozeQuestion(
  pattern: BunpouPattern,
  allPatterns: BunpouPattern[],
  seed: number
): QuizQuestion | null {
  const cloze = findClozeTarget(pattern);
  if (!cloze) return null;

  const distractors = pickClozeDistractors(cloze.answer, allPatterns, seed + 17);
  if (distractors.length < 3) return null;

  const options = seededShuffle([cloze.answer, ...distractors], seed + 31);
  const correctIndex = options.indexOf(cloze.answer);

  const hintText = cloze.translation
    ? `Arti: "${cloze.translation}"`
    : `Fungsi: ${pattern.functionText}`;

  return {
    id: `q-cloze-${pattern.id}-${seed}`,
    type: 'cloze',
    pattern,
    prompt: `Lengkapi bagian rumpang pada kalimat berikut sesuai konteks maknanya. ${hintText}`,
    japanesePrompt: cloze.blankedSentence,
    japaneseFull: cloze.fullSentence,
    options,
    correctIndex,
    explanation: `Jawaban yang tepat adalah "${cloze.answer}" (pola ${pattern.title}). Rumus: ${pattern.formulas[0]}. ${pattern.functionText}`,
  };
}

function buildFormulaQuestion(
  pattern: BunpouPattern,
  allPatterns: BunpouPattern[],
  seed: number
): QuizQuestion | null {
  const correctFormula = pattern.formulas[0]?.trim();
  if (!correctFormula) return null;

  const otherFormulas = Array.from(
    new Set(
      allPatterns
        .filter(p => p.id !== pattern.id && p.formulas[0] && p.formulas[0].trim() !== correctFormula)
        .map(p => p.formulas[0].trim())
    )
  );

  const distractors = seededShuffle(otherFormulas, seed + 43).slice(0, 3);
  if (distractors.length < 3) return null;

  const options = seededShuffle([correctFormula, ...distractors], seed + 59);
  const correctIndex = options.indexOf(correctFormula);

  return {
    id: `q-formula-${pattern.id}-${seed}`,
    type: 'formula',
    pattern,
    prompt: `Manakah rumus penyambungan yang tepat untuk pola "${pattern.title}" (${pattern.functionText})?`,
    japanesePrompt: pattern.examples[0]?.japanese,
    japaneseFull: pattern.examples[0]?.japanese,
    options,
    correctIndex,
    explanation: `Rumus yang benar untuk "${pattern.title}" adalah: ${pattern.formulas.join(' / ')}.`,
  };
}

function buildFunctionQuestion(
  pattern: BunpouPattern,
  allPatterns: BunpouPattern[],
  seed: number
): QuizQuestion | null {
  const correctFunc = pattern.functionText.trim();
  if (!correctFunc) return null;

  const otherFuncs = Array.from(
    new Set(
      allPatterns
        .filter(p => p.id !== pattern.id && p.functionText.trim() !== correctFunc)
        .map(p => p.functionText.trim())
    )
  );

  const distractors = seededShuffle(otherFuncs, seed + 71).slice(0, 3);
  if (distractors.length < 3) return null;

  const options = seededShuffle([correctFunc, ...distractors], seed + 83);
  const correctIndex = options.indexOf(correctFunc);

  return {
    id: `q-function-${pattern.id}-${seed}`,
    type: 'function',
    pattern,
    prompt: `Apa fungsi utama dari pola bunpou "${pattern.shortPattern}" berikut ini?`,
    japanesePrompt: pattern.examples[0]?.japanese,
    japaneseFull: pattern.examples[0]?.japanese,
    options,
    correctIndex,
    explanation: `Pola "${pattern.title}" (${pattern.formulas[0]}) berfungsi untuk: ${correctFunc}`,
  };
}

export interface QuizConfig {
  bookId: BookId | 'all';
  fromChapter?: number;
  toChapter?: number;
  chapters?: readonly number[];
  focus: QuizFocus;
  count?: number | 'all';
  seed?: number;
}

export function filterPatternsForQuiz(
  allPatterns: BunpouPattern[],
  config: Pick<QuizConfig, 'bookId' | 'fromChapter' | 'toChapter' | 'chapters'>
): BunpouPattern[] {
  const chapterSet = config.chapters ? new Set(config.chapters) : null;
  const minCh = Math.min(config.fromChapter ?? 1, config.toChapter ?? 18);
  const maxCh = Math.max(config.fromChapter ?? 1, config.toChapter ?? 18);

  return allPatterns.filter(p => {
    if (config.bookId !== 'all' && p.bookId !== config.bookId) {
      return false;
    }
    if (chapterSet) {
      return chapterSet.has(p.chapterNumber);
    }
    return p.chapterNumber >= minCh && p.chapterNumber <= maxCh;
  });
}

export function countQuizBankSize(
  allPatterns: BunpouPattern[],
  config: Pick<QuizConfig, 'bookId' | 'fromChapter' | 'toChapter' | 'chapters' | 'focus'>
): number {
  const filtered = filterPatternsForQuiz(allPatterns, config);
  if (filtered.length === 0) return 0;

  if (config.focus === 'mixed') {
    let count = 0;
    for (const p of filtered) {
      if (findClozeTarget(p)) count++;
      if (p.formulas[0]?.trim()) count++;
      if (p.functionText.trim()) count++;
    }
    return count;
  }

  if (config.focus === 'cloze') {
    return filtered.filter(p => Boolean(findClozeTarget(p))).length;
  }
  if (config.focus === 'formula') {
    return filtered.filter(p => Boolean(p.formulas[0]?.trim())).length;
  }
  return filtered.filter(p => Boolean(p.functionText.trim())).length;
}

export function generateQuizQuestions(
  allPatterns: BunpouPattern[],
  config: QuizConfig
): QuizQuestion[] {
  const baseSeed = config.seed ?? Date.now();
  const filtered = filterPatternsForQuiz(allPatterns, config);
  if (filtered.length === 0) return [];

  const maxPossible = countQuizBankSize(allPatterns, config);
  const targetCount =
    config.count === 'all' ? maxPossible : Math.min(config.count ?? 10, maxPossible);
  if (targetCount <= 0) return [];

  const shuffledPool = seededShuffle(filtered, baseSeed);
  const questions: QuizQuestion[] = [];
  const typesCycle: QuizQuestionType[] =
    config.focus === 'mixed' ? ['cloze', 'formula', 'function'] : [config.focus];

  let attempt = 0;
  while (questions.length < targetCount && attempt < shuffledPool.length * 4) {
    const pattern = shuffledPool[attempt % shuffledPool.length];
    const desiredType = typesCycle[(questions.length + Math.floor(attempt / shuffledPool.length)) % typesCycle.length];
    const qSeed = baseSeed + attempt * 97;

    const alreadyExists = questions.some(
      q => q.pattern.id === pattern.id && q.type === desiredType
    );

    if (!alreadyExists) {
      let q: QuizQuestion | null = null;
      if (desiredType === 'cloze') {
        q =
          buildClozeQuestion(pattern, allPatterns, qSeed) ??
          (config.focus === 'mixed' ? buildFormulaQuestion(pattern, allPatterns, qSeed) : null);
      } else if (desiredType === 'formula') {
        q = buildFormulaQuestion(pattern, allPatterns, qSeed);
      } else {
        q = buildFunctionQuestion(pattern, allPatterns, qSeed);
      }

      if (q && q.options.length === 4 && q.correctIndex >= 0) {
        const dupAfterFallback = questions.some(
          existing => existing.pattern.id === q!.pattern.id && existing.type === q!.type
        );
        const patternUsed = questions.some(existing => existing.pattern.id === q!.pattern.id);
        if (!dupAfterFallback && (!patternUsed || shuffledPool.length < targetCount)) {
          questions.push(q);
        }
      }
    }

    attempt++;
  }

  return questions.slice(0, targetCount);
}
