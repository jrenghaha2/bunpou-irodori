import test from 'node:test';
import assert from 'node:assert/strict';
import { IRODORI_DATASET } from '../data/irodoriDataset';
import {
  computeQuizPerformanceStats,
  createQuizSessionEntry,
  decodeQuizSessionToken,
  encodeQuizSessionToken,
  mergeQuizHistories,
} from './quizStats';

const DATASET = IRODORI_DATASET;
const PATTERN_MAP = new Map(DATASET.allPatterns.map(p => [p.id, p]));

const FIRESTORE_SESSION_REGEX =
  /^[a-zA-Z0-9_-]{1,40}\|[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,6})?Z\|(mixed|cloze|formula|function)\|[0-9]{1,3}\|[0-9]{1,3}\|[0-9]{1,3}\|(all|([1-9]|1[0-8])(\.([1-9]|1[0-8]))*)\|([0-9]{1,3}:[0-2]:(introductory|elementary1|elementary2)-bab-([1-9]|1[0-8])-p[1-9][0-9]?:[01](;[0-9]{1,3}:[0-2]:(introductory|elementary1|elementary2)-bab-([1-9]|1[0-8])-p[1-9][0-9]?:[01])*)?$/;

test('encodeQuizSessionToken matches Firestore security rule regex and decodes accurately', () => {
  const pat = DATASET.allPatterns.find(p => p.bookId === 'elementary2')!;
  const entry = createQuizSessionEntry({
    bookId: 'elementary2',
    scopeLabel: 'Bab 1–3',
    chapters: [1, 2, 3],
    focus: 'mixed',
    correct: 8,
    total: 10,
    answers: [
      {
        no: 1,
        type: 'cloze',
        correct: true,
        patternId: pat.id,
        patternTitle: pat.title,
        shortPattern: pat.shortPattern,
        formula: pat.formulas[0],
        functionText: pat.functionText,
        expectedLabel: pat.shortPattern,
        chosenLabel: pat.shortPattern,
        exampleJp: pat.examples[0]?.japanese,
      },
    ],
  });

  const token = encodeQuizSessionToken(entry);
  assert.match(token, FIRESTORE_SESSION_REGEX);

  const decoded = decodeQuizSessionToken(token, 'elementary2', PATTERN_MAP);
  assert.ok(decoded);
  assert.equal(decoded.id, entry.id);
  assert.equal(decoded.score, 80);
  assert.equal(decoded.correct, 8);
  assert.equal(decoded.total, 10);
  assert.deepEqual(decoded.chapters, [1, 2, 3]);
  assert.equal(decoded.scopeLabel, 'Bab 1–3');
  assert.equal(decoded.answers?.length, 1);
  assert.equal(decoded.answers?.[0].patternId, pat.id);
});

test('computeQuizPerformanceStats and mergeQuizHistories calculate accuracy and trends', () => {
  const older = createQuizSessionEntry({
    bookId: 'introductory',
    scopeLabel: 'Bab 1–6',
    focus: 'formula',
    correct: 6,
    total: 10,
  });
  older.completedAt = '2026-01-01T10:00:00.000Z';

  const newer = createQuizSessionEntry({
    bookId: 'introductory',
    scopeLabel: 'Semua Bab (1–18)',
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
