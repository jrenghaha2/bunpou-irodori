import test from 'node:test';
import assert from 'node:assert/strict';
import { IRODORI_DATASET } from '../data/irodoriDataset';
import type { ChapterNumber } from '../types/bunpou';
import { formatCleanFormula, sanitizeIndonesianClue } from './quizGenerator';
import {
  LEGACY_UNRECORDED_CHOICE_LABEL,
  MAX_QUIZ_TOKEN_LENGTH,
  computeQuizPerformanceStats,
  createQuizSessionEntry,
  decodeChosenLabelBase64Url,
  decodeQuizSessionToken,
  encodeChosenLabelBase64Url,
  encodeQuizSessionToken,
  mergeQuizHistories,
} from './quizStats';

const DATASET = IRODORI_DATASET;
const PATTERN_MAP = new Map(DATASET.allPatterns.map(p => [p.id, p]));

// Exact parity with firestore.rules isValidQuizSessionToken per bookId
function buildRulesSessionRegex(bookId: string): RegExp {
  return new RegExp(
    `^[a-zA-Z0-9_\\-]+\\|[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{1,3})?Z\\|(mixed|cloze|formula|function)\\|[0-9]{1,3}\\|[1-9][0-9]{0,2}\\|(100|[0-9]{1,2})\\|(all|([1-9]|1[0-8])(\\.([1-9]|1[0-8]))*)\\|(|[1-9][0-9]{0,2}:[0-2]:${bookId}-bab-([1-9]|1[0-8])-p[1-9][0-9]?:[01](:[A-Za-z0-9_\\-]{1,260})?(;[1-9][0-9]{0,2}:[0-2]:${bookId}-bab-([1-9]|1[0-8])-p[1-9][0-9]?:[01](:[A-Za-z0-9_\\-]{1,260})?)*)$`
  );
}

test('encodeChosenLabelBase64Url / decodeChosenLabelBase64Url round-trips Japanese, formulas, and truncates safely at 180 UTF-8 bytes', () => {
  const samples = [
    '〜てはいけません',
    'V-て + もいいです / N1はN2です',
    'Menyatakan larangan atau aturan yang tidak boleh dilakukan di tempat umum.',
  ];

  for (const sample of samples) {
    const encoded = encodeChosenLabelBase64Url(sample);
    assert.match(encoded, /^[A-Za-z0-9_-]{1,240}$/);
    assert.equal(decodeChosenLabelBase64Url(encoded), sample);
  }

  // Long multi-byte Japanese string (> 180 UTF-8 bytes) must truncate cleanly at code-point boundary + ellipsis
  const longJp = '日本語の文法パターンを正確に覚えるための例文です。'.repeat(6);
  const encodedLong = encodeChosenLabelBase64Url(longJp);
  assert.match(encodedLong, /^[A-Za-z0-9_-]{1,240}$/);
  assert.ok(encodedLong.length <= 240, `Expected <= 240 chars, got ${encodedLong.length}`);
  const decodedLong = decodeChosenLabelBase64Url(encodedLong);
  assert.ok(decodedLong.endsWith('…'));
  assert.ok(new TextEncoder().encode(decodedLong).length <= 180);
  assert.ok(!decodedLong.includes('\uFFFD'), 'Must not produce invalid UTF-8 replacement chars');
});

test('encodeQuizSessionToken produces 4-segment right answers and 5-segment wrong answers matching Firestore rules, with full reconstruction', () => {
  const elem2Patterns = DATASET.allPatterns.filter(p => p.bookId === 'elementary2');
  const pat1 = elem2Patterns[0];
  const pat2 = elem2Patterns[1];
  const pat3 = elem2Patterns[2];

  const wrongFormulaChoice = 'V-ない + なければなりません';
  const wrongFunctionChoice = 'Menyatakan dugaan atau perkiraan pembicara';

  const entry = createQuizSessionEntry({
    bookId: 'elementary2',
    scopeLabel: 'Bab 1–3',
    chapters: [1, 2, 3],
    focus: 'mixed',
    correct: 1,
    total: 3,
    answers: [
      {
        no: 1,
        type: 'cloze',
        correct: true,
        patternId: pat1.id,
        chapterNumber: pat1.chapterNumber,
        patternTitle: pat1.title,
        shortPattern: pat1.shortPattern,
        formula: pat1.formulas[0],
        functionText: pat1.functionText,
        expectedLabel: pat1.shortPattern,
        chosenLabel: pat1.shortPattern,
        exampleJp: pat1.examples[0]?.japanese,
      },
      {
        no: 2,
        type: 'formula',
        correct: false,
        patternId: pat2.id,
        chapterNumber: pat2.chapterNumber,
        patternTitle: pat2.title,
        shortPattern: pat2.shortPattern,
        formula: pat2.formulas[0],
        functionText: pat2.functionText,
        expectedLabel: pat2.formulas[0],
        chosenLabel: wrongFormulaChoice,
        exampleJp: pat2.examples[0]?.japanese,
      },
      {
        no: 3,
        type: 'function',
        correct: false,
        patternId: pat3.id,
        chapterNumber: pat3.chapterNumber,
        patternTitle: pat3.title,
        shortPattern: pat3.shortPattern,
        formula: pat3.formulas[0],
        functionText: pat3.functionText,
        expectedLabel: pat3.functionText,
        chosenLabel: wrongFunctionChoice,
        exampleJp: pat3.examples[0]?.japanese,
      },
    ],
  });

  const token = encodeQuizSessionToken(entry);
  const elem2Regex = buildRulesSessionRegex('elementary2');
  const introRegex = buildRulesSessionRegex('introductory');

  assert.match(token, elem2Regex);
  assert.doesNotMatch(token, introRegex);
  assert.ok(token.length <= MAX_QUIZ_TOKEN_LENGTH);

  const segments = token.split('|')[7].split(';');
  assert.equal(segments[0].split(':').length, 4, 'Correct answer stays compact 4-segment');
  assert.equal(segments[1].split(':').length, 5, 'Wrong answer stores 5th Base64URL segment');
  assert.equal(segments[2].split(':').length, 5, 'Wrong answer stores 5th Base64URL segment');

  const decoded = decodeQuizSessionToken(token, 'elementary2', PATTERN_MAP);
  assert.ok(decoded);
  assert.equal(decoded.id, entry.id);
  assert.equal(decoded.score, 33);
  assert.equal(decoded.correct, 1);
  assert.equal(decoded.total, 3);
  assert.deepEqual(decoded.chapters, [1, 2, 3]);
  assert.equal(decoded.scopeLabel, 'Bab 1–3');
  assert.equal(decoded.answers?.length, 3);

  const d1 = decoded.answers![0];
  assert.equal(d1.correct, true);
  assert.equal(d1.chosenLabel, d1.expectedLabel);
  assert.equal(d1.chapterNumber, pat1.chapterNumber);
  assert.ok(d1.promptText && d1.promptText.length > 0);

  const d2 = decoded.answers![1];
  assert.equal(d2.correct, false);
  assert.equal(d2.chosenLabel, wrongFormulaChoice);
  assert.equal(d2.expectedLabel, formatCleanFormula(pat2.formulas[0]));
  assert.ok(d2.promptText && !d2.promptText.includes(pat2.title));

  const d3 = decoded.answers![2];
  assert.equal(d3.correct, false);
  assert.equal(d3.chosenLabel, wrongFunctionChoice);
  assert.equal(d3.expectedLabel, sanitizeIndonesianClue(pat3.functionText));
  assert.ok(d3.promptText?.includes(pat3.shortPattern));
});

test('decodeQuizSessionToken remains backward-compatible with legacy 4-segment tokens', () => {
  const pat = DATASET.allPatterns.find(p => p.bookId === 'introductory')!;
  const legacyToken = `q1700000000_leg1|2026-11-19T04:00:00.000Z|mixed|0|1|0|all|1:1:${pat.id}:0`;

  assert.match(legacyToken, buildRulesSessionRegex('introductory'));
  const decoded = decodeQuizSessionToken(legacyToken, 'introductory', PATTERN_MAP);
  assert.ok(decoded);
  assert.equal(decoded.answers?.length, 1);
  assert.equal(decoded.answers![0].correct, false);
  assert.equal(decoded.answers![0].chosenLabel, LEGACY_UNRECORDED_CHOICE_LABEL);
  assert.equal(decoded.answers![0].expectedLabel, formatCleanFormula(pat.formulas[0]));
});

test('encodeQuizSessionToken guards total length <= 15800 for 120 wrong answers with long distractors', () => {
  const introPatterns = DATASET.allPatterns.filter(p => p.bookId === 'introductory');
  const longChoice = 'Menyatakan pengalaman atau kegiatan yang pernah dilakukan di masa lalu dengan konteks sangat panjang '.repeat(3);

  const answers = Array.from({ length: 120 }, (_, i) => {
    const pat = introPatterns[i % introPatterns.length];
    return {
      no: i + 1,
      type: 'function' as const,
      correct: false,
      patternId: pat.id,
      chapterNumber: pat.chapterNumber,
      patternTitle: pat.title,
      shortPattern: pat.shortPattern,
      formula: pat.formulas[0] ?? '',
      functionText: pat.functionText,
      expectedLabel: pat.functionText,
      chosenLabel: `${i + 1}: ${longChoice}`,
    };
  });

  const entry = createQuizSessionEntry({
    bookId: 'introductory',
    scopeLabel: 'Semua Bab (3–18)',
    focus: 'function',
    correct: 0,
    total: 120,
    answers,
  });

  const token = encodeQuizSessionToken(entry);
  assert.ok(token.length <= MAX_QUIZ_TOKEN_LENGTH, `Token length ${token.length} exceeded ${MAX_QUIZ_TOKEN_LENGTH}`);
  assert.match(token, buildRulesSessionRegex('introductory'));

  const decoded = decodeQuizSessionToken(token, 'introductory', PATTERN_MAP);
  assert.ok(decoded);
  assert.equal(decoded.answers?.length, 120, 'All 120 answers must be preserved via 4-segment fallback');
  assert.ok(
    decoded.answers!.some(a => a.chosenLabel !== LEGACY_UNRECORDED_CHOICE_LABEL),
    'Early wrong answers should still preserve exact Base64URL clicked choices'
  );
});

test('Pemula 16-chapter scope (Bab 3-18) encodes as all and decodes as Semua Bab (3–18)', () => {
  const allPemulaChapters: ChapterNumber[] = [
    3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18,
  ];
  const entry = createQuizSessionEntry({
    bookId: 'introductory',
    scopeLabel: 'Semua Bab (3–18)',
    chapters: allPemulaChapters,
    focus: 'mixed',
    correct: 9,
    total: 10,
  });

  const token = encodeQuizSessionToken(entry);
  assert.match(token, buildRulesSessionRegex('introductory'));
  assert.equal(token.split('|')[6], 'all');

  const decoded = decodeQuizSessionToken(token, 'introductory', PATTERN_MAP);
  assert.ok(decoded);
  assert.equal(decoded.scopeLabel, 'Semua Bab (3–18)');
  assert.equal(decoded.chapters, undefined);
});

test('mergeQuizHistories prioritizes genuine chosenLabel over legacy placeholders at equal length', () => {
  const pat = DATASET.allPatterns.find(p => p.bookId === 'introductory')!;
  const sharedId = 'q1700000000_same';
  const sharedDate = '2026-11-22T10:00:00.000Z';

  const withRealChoice = {
    id: sharedId,
    completedAt: sharedDate,
    bookId: 'introductory' as const,
    scopeLabel: 'Bab 3',
    focus: 'formula' as const,
    correct: 0,
    total: 1,
    score: 0,
    answers: [
      {
        no: 1,
        type: 'formula' as const,
        correct: false,
        patternId: pat.id,
        patternTitle: pat.title,
        shortPattern: pat.shortPattern,
        formula: pat.formulas[0],
        functionText: pat.functionText,
        expectedLabel: pat.formulas[0],
        chosenLabel: 'N1 の N2',
      },
    ],
  };

  const withLegacyPlaceholder = {
    ...withRealChoice,
    answers: [
      {
        ...withRealChoice.answers[0],
        chosenLabel: LEGACY_UNRECORDED_CHOICE_LABEL,
      },
    ],
  };

  const mergedA = mergeQuizHistories([withRealChoice], [withLegacyPlaceholder]);
  assert.equal(mergedA[0].answers?.[0].chosenLabel, 'N1 の N2');

  const mergedB = mergeQuizHistories([withLegacyPlaceholder], [withRealChoice]);
  assert.equal(mergedB[0].answers?.[0].chosenLabel, 'N1 の N2');
});

test('computeQuizPerformanceStats and mergeQuizHistories calculate accuracy and trends', () => {
  const older = createQuizSessionEntry({
    bookId: 'introductory',
    scopeLabel: 'Bab 3–7',
    focus: 'formula',
    correct: 6,
    total: 10,
  });
  older.completedAt = '2026-01-01T10:00:00.000Z';

  const newer = createQuizSessionEntry({
    bookId: 'introductory',
    scopeLabel: 'Semua Bab (3–18)',
    focus: 'mixed',
    correct: 9,
    total: 10,
  });
  newer.completedAt = '2026-01-02T10:00:00.000Z';

  const merged = mergeQuizHistories([older], [newer, older]);
  assert.equal(merged.length, 2);
  assert.equal(merged[0].id, newer.id);

  const stats = computeQuizPerformanceStats(merged);
  assert.equal(stats.totalSessions, 2);
  assert.equal(stats.totalCorrect, 15);
  assert.equal(stats.totalAnswered, 20);
  assert.equal(stats.overallAccuracyPct, 75);
  assert.equal(stats.bestScore, 90);
  assert.equal(stats.latestScore, 90);
  assert.equal(stats.trendDelta, 30);
});
