import { Check, Play } from 'lucide-react';
import type { BookData, ChapterNumber, QuizFocus } from '../../types/bunpou';
import { formatChapterSelectionLabel } from '../../utils/quizGenerator';
import {
  QUIZ_COUNT_OPTIONS,
  QUIZ_FOCUS_OPTIONS,
  type QuizCountOption,
} from './quizHelpers';

interface QuizSetupViewProps {
  book: BookData;
  selectedChapters: ChapterNumber[];
  focus: QuizFocus;
  questionCount: QuizCountOption;
  bankSize: number;
  onToggleChapter: (ch: ChapterNumber) => void;
  onSetChapters: (chapters: ChapterNumber[]) => void;
  onSelectFocus: (focus: QuizFocus) => void;
  onSelectCount: (count: QuizCountOption) => void;
  onStartQuiz: () => void;
}

export function QuizSetupView({
  book,
  selectedChapters,
  focus,
  questionCount,
  bankSize,
  onToggleChapter,
  onSetChapters,
  onSelectFocus,
  onSelectCount,
  onStartQuiz,
}: QuizSetupViewProps) {
  const allBookChapters = book.chapters.map(c => c.chapterNumber);
  const firstCh = allBookChapters[0] ?? 1;
  const lastCh = allBookChapters[allBookChapters.length - 1] ?? 18;
  const selectedSet = new Set(selectedChapters);
  const scopeLabel = formatChapterSelectionLabel(selectedChapters, allBookChapters.length);
  const effectiveCount =
    questionCount === 'all' ? bankSize : Math.min(questionCount, bankSize);

  const presets: { label: string; chapters: ChapterNumber[] }[] =
    firstCh === 3
      ? [
          { label: `Semua (${firstCh}–${lastCh})`, chapters: allBookChapters },
          { label: 'Bab 3–7', chapters: [3, 4, 5, 6, 7] },
          { label: 'Bab 8–12', chapters: [8, 9, 10, 11, 12] },
          { label: 'Bab 13–18', chapters: [13, 14, 15, 16, 17, 18] },
        ]
      : [
          { label: `Semua (${firstCh}–${lastCh})`, chapters: allBookChapters },
          { label: 'Bab 1–6', chapters: [1, 2, 3, 4, 5, 6] },
          { label: 'Bab 7–12', chapters: [7, 8, 9, 10, 11, 12] },
          { label: 'Bab 13–18', chapters: [13, 14, 15, 16, 17, 18] },
        ];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50">
          Pengaturan Kuis · {book.shortTitle}
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Pilih bab, jenis soal, dan jumlah pertanyaan untuk latihan gaya JFT-Basic / JLPT.
        </p>
      </div>

      {/* Multi-Chapter Selector */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Cakupan Bab ({scopeLabel})
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {presets.map(preset => (
              <button
                key={preset.label}
                type="button"
                onClick={() => onSetChapters(preset.chapters)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => onSetChapters([])}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-[11px] font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 transition-colors cursor-pointer"
            >
              Kosongkan
            </button>
          </div>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {book.chapters.map(ch => {
            const num = ch.chapterNumber;
            const active = selectedSet.has(num);
            return (
              <button
                key={ch.id}
                type="button"
                aria-pressed={active}
                onClick={() => onToggleChapter(num)}
                title={`Bab ${ch.chapterNumber}: ${ch.titleId} (${ch.patterns.length} pola)`}
                className={`min-h-[42px] px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center justify-between gap-1 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                  active
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-600 text-indigo-800 dark:text-indigo-100'
                    : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>Bab {num}</span>
                {active ? (
                  <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" aria-hidden="true" />
                ) : (
                  <span className="text-[10px] font-mono-num opacity-70">{ch.patterns.length}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Focus Selector */}
      <div className="space-y-2.5">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          Jenis Latihan
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {QUIZ_FOCUS_OPTIONS.map(opt => {
            const active = focus === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={active}
                onClick={() => onSelectFocus(opt.id)}
                className={`text-left rounded-xl border p-3 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                  active
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-400 dark:border-indigo-600'
                    : 'bg-slate-50/60 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <p
                  className={`text-sm font-bold ${
                    active
                      ? 'text-indigo-900 dark:text-indigo-100'
                      : 'text-slate-800 dark:text-slate-100'
                  }`}
                >
                  {opt.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {opt.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Question Count Selector + Start CTA */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
            Jumlah Soal
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            {QUIZ_COUNT_OPTIONS.map(opt => {
              const active = questionCount === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onSelectCount(opt.value)}
                  className={`min-h-[38px] px-3.5 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                    active
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Bank soal tersedia:{' '}
            <strong className="font-mono-num text-slate-800 dark:text-slate-200">
              {bankSize}
            </strong>{' '}
            soal {effectiveCount > 0 ? `(akan dimulai ${effectiveCount} soal)` : ''}
          </p>
        </div>

        <button
          type="button"
          id="btnStartQuiz"
          disabled={effectiveCount <= 0}
          onClick={onStartQuiz}
          className="min-h-[48px] px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm inline-flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer disabled:opacity-45 disabled:cursor-not-allowed shrink-0"
        >
          <Play className="w-4 h-4 fill-current" aria-hidden="true" />
          <span>Mulai Kuis ({effectiveCount} Soal)</span>
        </button>
      </div>
    </div>
  );
}
