import { useEffect, useMemo, useState } from 'react';
import type {
  BookData,
  BunpouPattern,
  ChapterNumber,
  QuizFocus,
  QuizQuestion,
  QuizRecord,
  QuizSessionHistoryEntry,
} from '../types/bunpou';
import {
  countQuizBankSize,
  formatChapterSelectionLabel,
  generateQuizQuestions,
} from '../utils/quizGenerator';
import { buildQuizAnswerSnapshots, type RecordQuizSessionInput } from '../utils/quizStats';
import { QuizAnswerHistoryModal } from './quiz/QuizAnswerHistoryModal';
import type { QuizCountOption } from './quiz/quizHelpers';
import { QuizResultView } from './quiz/QuizResultView';
import { QuizRunView } from './quiz/QuizRunView';
import { QuizSetupView } from './quiz/QuizSetupView';
import { QuizStatsPanel } from './quiz/QuizStatsPanel';

type QuizPhase = 'setup' | 'running' | 'result';

interface QuizPanelProps {
  book: BookData;
  allPatterns: BunpouPattern[];
  showFurigana: boolean;
  showTranslation: boolean;
  history: QuizSessionHistoryEntry[];
  historySyncing: boolean;
  cloudEnabled: boolean;
  onRecordQuizSession: (input: RecordQuizSessionInput) => void;
  onClearQuizHistory: () => void;
}

export function QuizPanel({
  book,
  allPatterns,
  showFurigana,
  showTranslation,
  history,
  historySyncing,
  cloudEnabled,
  onRecordQuizSession,
  onClearQuizHistory,
}: QuizPanelProps) {
  const bookChapterNumbers = useMemo<ChapterNumber[]>(
    () => book.chapters.map(c => c.chapterNumber),
    [book.chapters]
  );

  const [phase, setPhase] = useState<QuizPhase>('setup');
  const [selectedChapters, setSelectedChapters] = useState<ChapterNumber[]>(
    () => book.chapters.map(c => c.chapterNumber)
  );
  const [focus, setFocus] = useState<QuizFocus>('mixed');
  const [questionCount, setQuestionCount] = useState<QuizCountOption>(10);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [chosenIndex, setChosenIndex] = useState<number | null>(null);
  const [records, setRecords] = useState<QuizRecord[]>([]);
  const [inspectedHistory, setInspectedHistory] = useState<QuizSessionHistoryEntry | null>(
    null
  );

  // Reset active run & chapter selection if book changes
  useEffect(() => {
    setPhase('setup');
    setSelectedChapters(book.chapters.map(c => c.chapterNumber));
    setQuestions([]);
    setRecords([]);
    setCurrentIdx(0);
    setChosenIndex(null);
    setInspectedHistory(null);
  }, [book]);

  const bankSize = useMemo(
    () =>
      countQuizBankSize(allPatterns, {
        bookId: book.id,
        chapters: selectedChapters,
        focus,
      }),
    [allPatterns, book.id, selectedChapters, focus]
  );

  const scopeLabel = useMemo(
    () => formatChapterSelectionLabel(selectedChapters, bookChapterNumbers.length),
    [selectedChapters, bookChapterNumbers.length]
  );

  const handleToggleChapter = (ch: ChapterNumber) => {
    setSelectedChapters(prev =>
      prev.includes(ch)
        ? prev.filter(item => item !== ch)
        : [...prev, ch].sort((a, b) => a - b)
    );
  };

  const startQuiz = (overrideCount?: QuizCountOption) => {
    const activeCount = overrideCount ?? questionCount;
    const resolvedCount =
      activeCount === 'all' ? 'all' : Math.max(1, Math.min(activeCount, bankSize));
    const generated = generateQuizQuestions(allPatterns, {
      bookId: book.id,
      chapters: selectedChapters,
      focus,
      count: resolvedCount,
      seed: Date.now(),
    });
    if (generated.length === 0) return;
    setQuestions(generated);
    setCurrentIdx(0);
    setChosenIndex(null);
    setRecords([]);
    setPhase('running');
  };

  const handleSelectOption = (optionIndex: number) => {
    if (chosenIndex !== null) return;
    const q = questions[currentIdx];
    if (!q) return;
    setChosenIndex(optionIndex);
    const isCorrect = optionIndex === q.correctIndex;
    const newRecord: QuizRecord = {
      no: currentIdx + 1,
      question: q,
      chosenIndex: optionIndex,
      chosenLabel: q.options[optionIndex] ?? '',
      correctLabel: q.options[q.correctIndex] ?? '',
      isCorrect,
    };
    setRecords(prev => [...prev, newRecord]);
  };

  const handleNextQuestion = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(idx => idx + 1);
      setChosenIndex(null);
      return;
    }

    // Finish & persist session
    const total = records.length;
    const correct = records.filter(r => r.isCorrect).length;
    onRecordQuizSession({
      bookId: book.id,
      scopeLabel,
      chapters:
        selectedChapters.length > 0 && selectedChapters.length < bookChapterNumbers.length
          ? selectedChapters
          : undefined,
      focus,
      correct,
      total,
      answers: buildQuizAnswerSnapshots(records),
    });
    setPhase('result');
  };

  const correctSoFar = records.filter(r => r.isCorrect).length;

  return (
    <section aria-label="Kuis interaktif Irodori Bunpou" className="space-y-5">
      {phase === 'setup' ? (
        <>
          <QuizSetupView
            book={book}
            selectedChapters={selectedChapters}
            focus={focus}
            questionCount={questionCount}
            bankSize={bankSize}
            onToggleChapter={handleToggleChapter}
            onSetChapters={setSelectedChapters}
            onSelectFocus={setFocus}
            onSelectCount={setQuestionCount}
            onStartQuiz={startQuiz}
          />

          <QuizStatsPanel
            bookShortTitle={book.shortTitle}
            history={history}
            syncing={historySyncing}
            cloudEnabled={cloudEnabled}
            onInspectEntry={setInspectedHistory}
            onClearHistory={onClearQuizHistory}
          />
        </>
      ) : phase === 'running' && questions[currentIdx] ? (
        <QuizRunView
          question={questions[currentIdx]}
          questionIndex={currentIdx}
          totalQuestions={questions.length}
          correctSoFar={correctSoFar}
          chosenIndex={chosenIndex}
          showFurigana={showFurigana}
          showTranslation={showTranslation}
          onSelectOption={handleSelectOption}
          onNext={handleNextQuestion}
          onCancel={() => setPhase('setup')}
        />
      ) : (
        <>
          <QuizResultView
            records={records}
            scopeLabel={scopeLabel}
            focus={focus}
            bookShortTitle={book.shortTitle}
            showFurigana={showFurigana}
            onRetry={() => startQuiz()}
            onBackToSetup={() => setPhase('setup')}
          />

          <QuizStatsPanel
            bookShortTitle={book.shortTitle}
            history={history}
            syncing={historySyncing}
            cloudEnabled={cloudEnabled}
            onInspectEntry={setInspectedHistory}
            onClearHistory={onClearQuizHistory}
          />
        </>
      )}

      <QuizAnswerHistoryModal
        entry={inspectedHistory}
        showFurigana={showFurigana}
        onClose={() => setInspectedHistory(null)}
      />
    </section>
  );
}
