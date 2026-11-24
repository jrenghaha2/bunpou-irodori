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

const JP_CHAR_RE = /[ぁ-んァ-ヶ一-龠]/;

/**
 * Strips Indonesian parenthetical translations/explanations from a formula so
 * `Rumus Penyambungan` choices only show the grammar structure without spoiling the meaning.
 */
export function formatCleanFormula(raw: string): string {
  let s = raw.trim();
  // Remove half-width parenthetical Indonesian explanations/glosses (containing >= 2 lowercase Latin letters)
  s = s.replace(/\s*\([^)]*[a-z]{2,}[^)]*\)/g, '');
  // Remove trailing top-level em-dash / en-dash Indonesian descriptions
  s = s.replace(/\s+[—–]\s+[A-Za-z].*$/, '');
  return s.replace(/\(\s*\)/g, '').replace(/\s{2,}/g, ' ').trim();
}

/**
 * Produces a natural, spoiler-free Indonesian functional description by removing or replacing
 * Japanese script tokens that would otherwise leak the exact pattern or particle answer.
 */
export function sanitizeIndonesianClue(text: string): string {
  const sentences = text
    .trim()
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(Boolean);

  // Prefer sentences that are already pure Indonesian when they give a complete clue (>= 28 chars)
  const cleanSentences = sentences.filter(s => !JP_CHAR_RE.test(s));
  let base = cleanSentences.join(' ').trim();
  if (base.length < 28) {
    base = text.trim();
  }

  if (JP_CHAR_RE.test(base)) {
    base = base
      // Replace `<JP_TOKEN> (<Indonesian gloss>)` with `"<Indonesian gloss>"` (only if parens have no JP)
      .replace(
        /(?:(?:[A-Za-z0-9]+[-・])|(?:[〜～「『【]))*[ぁ-んァ-ヶ一-龠ー]+(?:[A-Za-z0-9ぁ-んァ-ヶ一-龠ー\-・〜～／/→=？！?!」』】])*\s*\(([^()ぁ-んァ-ヶ一-龠]*[a-z]{2,}[^()ぁ-んァ-ヶ一-龠]*)\)/g,
        '"$1"'
      )
      // Remove parenthetical chunks containing Japanese characters (e.g. (です／ます), (辞書形))
      .replace(/[（(][^()（）]*[ぁ-んァ-ヶ一-龠][^()（）]*[）)]/g, '')
      // Replace labeled grammar references like 'Partikel は' -> 'Partikel ini'
      .replace(
        /\b(Partikel|partikel|Kata kerja|kata kerja|Kata keterangan|kata keterangan|Kata bantu|kata bantu|Kata sifat|kata sifat|Pola|pola|Bentuk|bentuk|Akhiran|akhiran|Ungkapan|ungkapan)\s+[A-Za-z0-9\-・〜～／/]*[ぁ-んァ-ヶ一-龠ー][A-Za-z0-9ぁ-んァ-ヶ一-龠ー\-・〜～／/→=？！?!「」『』【】]*/g,
        '$1 ini'
      )
      // Replace any remaining Japanese token sequences
      .replace(
        /(?:(?:[A-Za-z0-9]+[-・])|(?:[〜～「『【]))*[ぁ-んァ-ヶ一-龠ー]+(?:[A-Za-z0-9ぁ-んァ-ヶ一-龠ー\-・〜～／/→=？！?!」』】])*/g,
        'pola ini'
      )
      // Collapse consecutive placeholders and orphaned pronunciation hints
      .replace(/(?:pola ini\s*(?:\/|／|・|→|,|\s+dan\s+|\s+atau\s+)\s*)+pola ini/g, 'pola ini')
      .replace(
        /\b(Partikel|partikel|Kata kerja|kata kerja|Kata keterangan|kata keterangan|Kata bantu|kata bantu|Kata sifat|kata sifat|Pola|pola|Bentuk|bentuk|Akhiran|akhiran|Ungkapan|ungkapan)\s+ini\s*(?:\/|／|→)\s*pola ini/g,
        '$1 ini'
      )
      .replace(/["「]pola ini["」]/g, 'pola ini')
      .replace(/\s*\(dibaca\s+"[^"]+"\)/gi, '')
      .replace(/\bdibaca\s+"[^"]+"\s+dan\s+/gi, '')
      .replace(/\s{2,}/g, ' ')
      .replace(/\s+([.,;:!?])/g, '$1')
      .replace(/\(\s*\)/g, '')
      .trim();
  }

  if (base.length > 0) {
    base = base.charAt(0).toUpperCase() + base.slice(1);
  }
  return base;
}

/**
 * Finds all non-overlapping occurrences of `target` in a sentence containing `{漢字|かな}` ruby markup
 * without slicing halfway through a single ruby token, and blanks either the unique match or all
 * occurrences so the answer never appears unblanked elsewhere in the same prompt.
 */
function blankSentencePreservingRuby(
  rubySentence: string,
  target: string,
  blankAllOccurrences: boolean
): { blankedSentence: string; matchCount: number } | null {
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

  const rawRanges: { start: number; end: number }[] = [];
  let searchFrom = 0;
  while (searchFrom <= plain.length - target.length) {
    const idx = plain.indexOf(target, searchFrom);
    if (idx === -1) break;

    const matchEnd = idx + target.length;
    const startSpan = spans.find(s => s.plainStart === idx);
    const endSpan = spans.find(s => s.plainEnd === matchEnd);

    if (startSpan && endSpan) {
      rawRanges.push({ start: startSpan.rawStart, end: endSpan.rawEnd });
      searchFrom = matchEnd;
    } else {
      searchFrom = idx + 1;
    }
  }

  if (rawRanges.length === 0) return null;

  const rangesToBlank = blankAllOccurrences ? rawRanges : [rawRanges[0]];
  let blankedSentence = '';
  let cursor = 0;
  for (const r of rangesToBlank) {
    blankedSentence += rubySentence.slice(cursor, r.start) + '（　　）';
    cursor = r.end;
  }
  blankedSentence += rubySentence.slice(cursor);

  return { blankedSentence, matchCount: rawRanges.length };
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

  // Pass 1: Prefer an example where the grammar target occurs strictly ONCE (cleanest, zero repetition)
  for (const cand of orderedCandidates) {
    for (const example of pattern.examples) {
      if (!example || !example.japanese) continue;
      const blanked = blankSentencePreservingRuby(example.japanese, cand, false);
      if (blanked && blanked.matchCount === 1) {
        return {
          blankedSentence: blanked.blankedSentence,
          answer: cand,
          fullSentence: example.japanese,
          translation: example.translation,
        };
      }
    }
  }

  // Pass 2: Fallback for patterns whose examples naturally repeat the target (e.g. とか…とか);
  // blank ALL occurrences so the answer is never spoiled elsewhere in the sentence.
  for (const cand of orderedCandidates) {
    for (const example of pattern.examples) {
      if (!example || !example.japanese) continue;
      const blanked = blankSentencePreservingRuby(example.japanese, cand, true);
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

  const basePrompt = 'Lengkapi bagian rumpang pada kalimat berikut sesuai konteks maknanya.';
  const hintText = cloze.translation
    ? `Arti: "${cloze.translation}"`
    : `Fungsi: ${pattern.functionText}`;

  return {
    id: `q-cloze-${pattern.id}-${seed}`,
    type: 'cloze',
    pattern,
    prompt: `${basePrompt} ${hintText}`,
    promptWithoutTranslation: basePrompt,
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
  const rawFormula = pattern.formulas[0]?.trim();
  if (!rawFormula) return null;
  const correctFormula = formatCleanFormula(rawFormula);
  if (!correctFormula) return null;

  const otherFormulas = Array.from(
    new Set(
      allPatterns
        .filter(p => p.id !== pattern.id && p.formulas[0])
        .map(p => formatCleanFormula(p.formulas[0]))
        .filter(f => Boolean(f) && f !== correctFormula)
    )
  );

  const distractors = seededShuffle(otherFormulas, seed + 43).slice(0, 3);
  if (distractors.length < 3) return null;

  const options = seededShuffle([correctFormula, ...distractors], seed + 59);
  const correctIndex = options.indexOf(correctFormula);

  const clue = sanitizeIndonesianClue(pattern.functionText);
  const exampleTranslation = pattern.examples[0]?.translation?.trim();
  const basePrompt = `Manakah rumus penyambungan bunpou yang tepat untuk fungsi berikut? "${clue}"`;
  const promptWithContext = exampleTranslation
    ? `${basePrompt} (Contoh makna: "${exampleTranslation}")`
    : basePrompt;

  return {
    id: `q-formula-${pattern.id}-${seed}`,
    type: 'formula',
    pattern,
    prompt: promptWithContext,
    promptWithoutTranslation: basePrompt,
    japanesePrompt: undefined,
    japaneseFull: pattern.examples[0]?.japanese,
    options,
    correctIndex,
    explanation: `Rumus yang benar untuk pola "${pattern.title}" adalah: ${pattern.formulas.join(' / ')}. ${pattern.functionText}`,
  };
}

function buildFunctionQuestion(
  pattern: BunpouPattern,
  allPatterns: BunpouPattern[],
  seed: number
): QuizQuestion | null {
  const rawFunc = pattern.functionText.trim();
  if (!rawFunc) return null;
  const correctFunc = sanitizeIndonesianClue(rawFunc);
  if (!correctFunc) return null;

  const otherFuncs = Array.from(
    new Set(
      allPatterns
        .filter(p => p.id !== pattern.id && p.functionText.trim())
        .map(p => sanitizeIndonesianClue(p.functionText))
        .filter(f => Boolean(f) && f !== correctFunc)
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
    explanation: `Pola "${pattern.title}" (${pattern.formulas[0]}) berfungsi untuk: ${rawFunc}`,
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
