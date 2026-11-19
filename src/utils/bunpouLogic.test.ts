import test from 'node:test';
import assert from 'node:assert/strict';
import { IRODORI_DATASET } from '../data/irodoriDataset';
import { tokenizeFormula } from './formulaTokenizer';
import {
  buildRubySegments,
  extractFuriganaReading,
  getPlainSpeechText,
  stripFuriganaMarkup,
} from './furiganaConverter';
import {
  countQuizBankSize,
  formatChapterSelectionLabel,
  generateQuizQuestions,
} from './quizGenerator';
import { mergeProgressSets, normalizeDisjointSets } from './bunpouSync';

const DATASET = IRODORI_DATASET;

test('loads all 3 official Irodori books (Pemula, Dasar 1, Dasar 2) and all 52 grammar chapters with zero truncation', () => {
  assert.equal(DATASET.books.length, 3);
  assert.deepEqual(
    DATASET.books.map(b => b.id),
    ['introductory', 'elementary1', 'elementary2']
  );
  assert.deepEqual(
    DATASET.books.map(b => b.shortTitle),
    ['Pemula', 'Dasar 1', 'Dasar 2']
  );
  assert.deepEqual(
    DATASET.books.map(b => b.japaneseSubtitle),
    ['いろどり 入門', 'いろどり 初級1', 'いろどり 初級2']
  );

  // Pemula: 第3課〜第18課 (16 chapters)
  const pemula = DATASET.books[0];
  assert.equal(pemula.chapters.length, 16);
  for (let ch = 3; ch <= 18; ch++) {
    const found = pemula.chapters.find(c => c.chapterNumber === ch);
    assert.ok(found, `Pemula missing Bab ${ch}`);
    assert.ok(found.patterns.length > 0, `Pemula Bab ${ch} should have at least 1 pattern`);
  }

  // Dasar 1 & Dasar 2: 第1課〜第18課 (18 chapters each)
  for (const book of [DATASET.books[1], DATASET.books[2]]) {
    assert.equal(book.chapters.length, 18, `Book ${book.id} should have 18 chapters`);
    for (let ch = 1; ch <= 18; ch++) {
      const found = book.chapters.find(c => c.chapterNumber === ch);
      assert.ok(found, `Book ${book.id} missing Bab ${ch}`);
      assert.ok(
        found.patterns.length > 0,
        `Book ${book.id} Bab ${ch} should have at least 1 pattern`
      );
    }
  }

  const totalChapters = DATASET.books.reduce((sum, b) => sum + b.chapters.length, 0);
  assert.equal(totalChapters, 52);
  assert.ok(DATASET.allPatterns.length >= 240, `Expected >= 240 patterns, got ${DATASET.allPatterns.length}`);
  assert.equal(DATASET.abbreviations.length, 16);
});

test('every pattern has valid Firestore pattern ID, clean formulas, functionText, and at least 3 reibun with Indonesian translations', () => {
  const idRegex = /^(introductory|elementary1|elementary2)-bab-([1-9]|1[0-8])-p[1-9][0-9]?$/;
  const seenIds = new Set<string>();

  for (const p of DATASET.allPatterns) {
    assert.match(p.id, idRegex, `Invalid pattern ID: ${p.id}`);
    assert.ok(!seenIds.has(p.id), `Duplicate pattern ID: ${p.id}`);
    seenIds.add(p.id);

    assert.ok(p.title.trim().length > 0, `Empty title on ${p.id}`);
    assert.ok(p.formulas.length > 0, `No formulas on ${p.id}`);
    for (const f of p.formulas) {
      assert.ok(
        !f.includes('{') && !f.includes('}'),
        `Unstripped ruby markup in formula on ${p.id}: ${f}`
      );
    }
    assert.ok(p.functionText.trim().length > 0, `Empty functionText on ${p.id}`);
    assert.ok(
      p.examples.length >= 3,
      `Expected >= 3 examples on ${p.id}, got ${p.examples.length}`
    );
    for (const ex of p.examples) {
      assert.ok(ex.japanese.trim().length > 0, `Empty Japanese example on ${p.id}`);
      assert.ok(
        ex.translation.trim().length > 0,
        `Missing Indonesian translation on ${p.id}: ${ex.japanese}`
      );
    }
  }
});

test('formula tokenizer classifies official Irodori notation (N, V, イA, ナA, S（普通形）, slots, particles)', () => {
  const tokens1 = tokenizeFormula('N1 + は + N2 + です (Positif)');
  assert.equal(tokens1.find(t => t.text === 'N1')?.kind, 'noun');
  assert.equal(tokens1.find(t => t.text === 'は')?.kind, 'particle');
  assert.equal(tokens1.find(t => t.text === '(Positif)')?.kind, 'note');

  const tokens2 = tokenizeFormula('V-て + ください');
  assert.equal(tokens2.find(t => t.text === 'V-て')?.kind, 'verb');

  const tokens3 = tokenizeFormula('イA-く + て + ... / ナA + で + ...');
  assert.equal(tokens3.find(t => t.text === 'イA-く')?.kind, 'adj');
  assert.equal(tokens3.find(t => t.text === 'ナA')?.kind, 'adj');

  const tokens4 = tokenizeFormula('S（普通形） + かもしれません');
  assert.equal(tokens4.find(t => t.text === 'S（普通形）')?.kind, 'plain');

  const tokens5 = tokenizeFormula('【場所】 + から + 来ました');
  assert.equal(tokens5.find(t => t.text === '【場所】')?.kind, 'noun');
});

test('furigana converter parses inline {漢字|かな} ruby markup and strips cleanly for speech/search', () => {
  const raw = '{東京|とうきょう}に {住|す}んでいます。';
  const segments = buildRubySegments(raw);
  assert.deepEqual(segments, [
    { text: '東京', reading: 'とうきょう' },
    { text: 'に ' },
    { text: '住', reading: 'す' },
    { text: 'んでいます。' },
  ]);

  assert.equal(stripFuriganaMarkup(raw), '東京に 住んでいます。');
  assert.equal(extractFuriganaReading(raw), 'とうきょうに すんでいます。');
  assert.equal(getPlainSpeechText(raw), '東京に住んでいます。');
});

test('quiz generator builds 10 valid questions across all 3 books including Pemula Bab 3-18', () => {
  const pemulaChapters = [3, 4, 5, 6, 7, 8, 9, 10];
  const pemulaBank = countQuizBankSize(DATASET.allPatterns, {
    bookId: 'introductory',
    chapters: pemulaChapters,
    focus: 'mixed',
  });
  assert.ok(pemulaBank >= 10);

  const pemulaQuestions = generateQuizQuestions(DATASET.allPatterns, {
    bookId: 'introductory',
    chapters: pemulaChapters,
    focus: 'mixed',
    count: 10,
    seed: 42,
  });
  assert.equal(pemulaQuestions.length, 10);
  for (const q of pemulaQuestions) {
    assert.equal(q.pattern.bookId, 'introductory');
    assert.ok(pemulaChapters.includes(q.pattern.chapterNumber));
    assert.equal(q.options.length, 4);
    assert.equal(new Set(q.options).size, 4, `Duplicate options in ${q.id}`);
    assert.ok(q.correctIndex >= 0 && q.correctIndex < 4);
  }

  const dasar1Chapters = [1, 2, 3, 5, 7, 10];
  const dasar1Questions = generateQuizQuestions(DATASET.allPatterns, {
    bookId: 'elementary1',
    chapters: dasar1Chapters,
    focus: 'mixed',
    count: 10,
    seed: 12345,
  });
  assert.equal(dasar1Questions.length, 10);

  assert.equal(formatChapterSelectionLabel([1, 2, 3, 5], 18), 'Bab 1–3, 5');
  assert.equal(
    formatChapterSelectionLabel([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], 16),
    'Semua Bab (3–18)'
  );
  assert.equal(
    formatChapterSelectionLabel(
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
      18
    ),
    'Semua Bab (1–18)'
  );
});

test('progress sets normalize disjointly and merge cloud + local without mastered/hard overlap', () => {
  const validIds = new Set(
    DATASET.allPatterns.filter(p => p.bookId === 'introductory').map(p => p.id)
  );
  const p1 = 'introductory-bab-3-p1';
  const p2 = 'introductory-bab-4-p1';
  const p3 = 'introductory-bab-5-p1';

  const normalized = normalizeDisjointSets([p1, 'invalid-id'], [p1, p2], validIds);
  assert.deepEqual([...normalized.mastered], [p1]);
  assert.deepEqual([...normalized.hard], [p2]);

  const merged = mergeProgressSets(
    new Set([p1]),
    new Set([p2]),
    new Set([p2]),
    new Set([p3]),
    validIds
  );
  assert.ok(merged.mastered.has(p1));
  assert.ok(merged.mastered.has(p2));
  assert.ok(!merged.hard.has(p2));
  assert.ok(merged.hard.has(p3));
});
