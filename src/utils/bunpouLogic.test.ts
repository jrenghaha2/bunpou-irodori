import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
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
  findClozeTarget,
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
  assert.equal(DATASET.allPatterns.length, 264);
  assert.equal(DATASET.abbreviations.length, 16);
});

test('every pattern has valid Firestore pattern ID, clean formulas, 0 bare Kanji, 0 Katakana ruby, and fixed dataset typos', () => {
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

      // Verify zero bare Kanji outside {漢字|かな}
      const withoutRuby = ex.japanese.replace(/\{[^{}|]+\|[^{}|]+\}/g, '');
      assert.ok(
        !/[\u4e00-\u9faf\u3400-\u4dbf]/.test(withoutRuby),
        `Bare kanji without furigana in ${p.id}: ${ex.japanese}`
      );

      // Verify zero Katakana-only bases wrapped in ruby
      const rubyTokens = [...ex.japanese.matchAll(/\{([^{}|]+)\|([^{}|]+)\}/g)];
      for (const m of rubyTokens) {
        assert.ok(
          !/^[\u30a0-\u30ffー]+$/.test(m[1]),
          `Katakana should not have furigana ruby in ${p.id}: ${m[0]}`
        );
      }
    }
  }

  // Regression checks for the 3 fixed dataset typos
  const pemulaBab16P2 = DATASET.allPatterns.find(p => p.id === 'introductory-bab-16-p2');
  assert.ok(pemulaBab16P2);
  assert.ok(!pemulaBab16P2.marugotoRef?.includes('可能①'));

  const dasar2Bab11P2 = DATASET.allPatterns.find(p => p.id === 'elementary2-bab-11-p2');
  assert.ok(dasar2Bab11P2);
  assert.equal(dasar2Bab11P2.title, 'ナA-すぎます');

  const dasar2Bab16P1 = DATASET.allPatterns.find(p => p.id === 'elementary2-bab-16-p1');
  assert.ok(dasar2Bab16P1);
  assert.ok(dasar2Bab16P1.formulas[0].includes('急げ・集まれ'));
  assert.ok(dasar2Bab16P1.formulas[0].includes('逃げろ・見ろ'));
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

test('furigana converter parses inline {漢字|かな} ruby markup without homonym corruption', () => {
  const raw = '{東京|とうきょう}に {住|す}んでいます。';
  const segments = buildRubySegments(raw);
  assert.deepEqual(segments, [
    { text: '東京', reading: 'とうきょう' },
    { text: 'に ' },
    { text: '住', reading: 'す' },
    { text: 'んでいます。' },
  ]);

  // Plain hiragana must stay plain hiragana (no legacy dictionary homonym replacement)
  assert.deepEqual(buildRubySegments('あついですね'), [{ text: 'あついですね' }]);

  assert.equal(stripFuriganaMarkup(raw), '東京に 住んでいます。');
  assert.equal(extractFuriganaReading(raw), 'とうきょうに すんでいます。');
  assert.equal(getPlainSpeechText(raw), '東京に住んでいます。');
});

test('quiz generator preserves Furigana in cloze, matches exact example translation, and does not leak pattern title', () => {
  const clozeQuestions = generateQuizQuestions(DATASET.allPatterns, {
    bookId: 'elementary1',
    chapters: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    focus: 'cloze',
    count: 15,
    seed: 2026,
  });

  assert.ok(clozeQuestions.length >= 10);
  let sawRubyPreserved = false;

  for (const q of clozeQuestions) {
    assert.equal(q.type, 'cloze');
    assert.ok(q.japanesePrompt?.includes('（　　）'), `Missing blank in ${q.id}`);
    // Prompt must not leak pattern.title directly
    assert.ok(
      !q.prompt.includes(`pola "${q.pattern.title}"`),
      `Cloze prompt leaked pattern title on ${q.id}: ${q.prompt}`
    );

    const matchedExample = q.pattern.examples.find(ex => ex.japanese === q.japaneseFull);
    assert.ok(matchedExample, `Could not find matched example for ${q.id}`);
    assert.ok(
      q.prompt.includes(matchedExample.translation),
      `Cloze translation hint did not match blanked example on ${q.id}`
    );
    assert.ok(
      q.promptWithoutTranslation && !q.promptWithoutTranslation.includes(matchedExample.translation),
      `Cloze promptWithoutTranslation should hide Indonesian translation on ${q.id}`
    );

    if (q.japanesePrompt && /\{[^{}|]+\|[^{}|]+\}/.test(q.japanesePrompt)) {
      sawRubyPreserved = true;
    }
  }
  assert.ok(sawRubyPreserved, 'Expected cloze sentences to preserve {漢字|かな} ruby furigana');

  // Verify findClozeTarget returns the exact matched example translation when matching example index > 0
  const syntheticPattern = {
    ...DATASET.allPatterns[0],
    formulas: ['V-て + みます'],
    examples: [
      { japanese: '{今日|きょう}は{休|やす}みです。', translation: 'Hari ini libur.', raw: '' },
      {
        japanese: 'この{料理|りょうり}を{食|た}べてみます。',
        translation: 'Saya coba makan masakan ini.',
        raw: '',
      },
    ],
  };
  const target = findClozeTarget(syntheticPattern);
  assert.ok(target);
  assert.equal(target.answer, 'みます');
  assert.equal(target.translation, 'Saya coba makan masakan ini.');
  assert.ok(target.blankedSentence.includes('{料理|りょうり}'));
  assert.ok(target.blankedSentence.includes('（　　）'));
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

test('Flashcard 3D flip CSS classes match FlashcardPanel and Space key stops propagation', () => {
  const css = fs.readFileSync(path.resolve(process.cwd(), 'src/index.css'), 'utf8');
  const panel = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/FlashcardPanel.tsx'),
    'utf8'
  );

  for (const cls of ['perspective-1200', 'card-flip-inner', 'is-flipped', 'card-face', 'card-face-back']) {
    assert.ok(css.includes(`.${cls}`), `src/index.css missing .${cls}`);
    assert.ok(panel.includes(cls), `FlashcardPanel.tsx missing class ${cls}`);
  }
  assert.match(css, /transform-style:\s*preserve-3d;/);
  assert.match(css, /backface-visibility:\s*hidden;/);
  assert.match(css, /transform:\s*rotateY\(180deg\);/);
  assert.match(panel, /e\.stopPropagation\(\);/);
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

test('Modal focus effect depends only on [open], Flashcard Space shortcut excludes buttons/links, and cloud sync guards races', () => {
  const modalSrc = fs.readFileSync(path.resolve(process.cwd(), 'src/components/Modal.tsx'), 'utf8');
  assert.match(modalSrc, /onCloseRef\.current = onClose;/);
  assert.match(modalSrc, /\}, \[open\]\);/);

  const deckSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/hooks/useFlashcardDeck.ts'),
    'utf8'
  );
  assert.match(deckSrc, /button, a, summary/);
  assert.match(deckSrc, /\[role="button"\]/);

  const syncSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/hooks/useCloudProgressSync.ts'),
    'utf8'
  );
  assert.match(syncSrc, /if \(isSwitchingUser\)\s*\{\s*clearPendingWriteTimers\(\);/);
  assert.match(syncSrc, /Promise\.all\(/);
  assert.match(syncSrc, /syncEpochRef\.current !== myEpoch/);
  assert.match(syncSrc, /triggerQuizHistoryResync/);
  assert.match(syncSrc, /const latestLocal = booksProgressRef\.current\[bookId\];/);

  const quizSyncSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/hooks/useQuizHistorySync.ts'),
    'utf8'
  );
  assert.match(quizSyncSrc, /syncNonce/);

  const panelSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/FlashcardPanel.tsx'),
    'utf8'
  );
  assert.match(panelSrc, /if \(e\.target !== e\.currentTarget\) return;/);

  const setupSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/quiz/QuizSetupView.tsx'),
    'utf8'
  );
  assert.match(setupSrc, /id="inputManualQuizCount"/);
  assert.match(setupSrc, /type="text"/);
  assert.match(setupSrc, /onStartQuiz\(resolved\)/);
  assert.match(syncSrc, /scheduleBookProgressWrite\(u, bookId\);/);

  const headerSrc = fs.readFileSync(
    path.resolve(process.cwd(), 'src/components/AppHeader.tsx'),
    'utf8'
  );
  assert.match(headerSrc, /id="btnToggleTranslation"/);
});

