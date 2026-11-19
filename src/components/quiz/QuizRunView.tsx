import { ArrowRight, CheckCircle2, X, XCircle } from 'lucide-react';
import type { QuizQuestion } from '../../types/bunpou';
import { ABC_LABELS } from '../../utils/quizGenerator';
import { AudioButton } from '../AudioButton';
import { FormulaDisplay } from '../FormulaDisplay';
import { JapaneseText } from '../JapaneseText';
import { getQuestionTypeLabel } from './quizHelpers';

interface QuizRunViewProps {
  question: QuizQuestion;
  questionIndex: number;
  totalQuestions: number;
  correctSoFar: number;
  chosenIndex: number | null;
  showFurigana: boolean;
  onSelectOption: (optionIndex: number) => void;
  onNext: () => void;
  onCancel: () => void;
}

export function QuizRunView({
  question,
  questionIndex,
  totalQuestions,
  correctSoFar,
  chosenIndex,
  showFurigana,
  onSelectOption,
  onNext,
  onCancel,
}: QuizRunViewProps) {
  const answered = chosenIndex !== null;
  const isCorrect = answered && chosenIndex === question.correctIndex;
  const isLast = questionIndex + 1 >= totalQuestions;
  const progressPct = Math.round(((questionIndex + (answered ? 1 : 0)) / totalQuestions) * 100);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header bar */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-bold">
              {getQuestionTypeLabel(question.type)}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Bab {question.pattern.chapterNumber} · {question.pattern.bookShortTitle}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-mono-num font-bold text-slate-700 dark:text-slate-200">
              Soal {questionIndex + 1}/{totalQuestions}
            </span>
            <span className="text-xs font-mono-num font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg">
              Benar: {correctSoFar}
            </span>
            <button
              type="button"
              onClick={onCancel}
              aria-label="Keluar dari kuis"
              title="Batalkan sesi kuis"
              className="min-h-[34px] min-w-[34px] p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-100 inline-flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question Prompt */}
      <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 p-4 sm:p-5 space-y-3">
        <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
          {question.prompt}
        </p>

        {question.japanesePrompt ? (
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-3.5 flex items-start justify-between gap-3">
            <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-slate-50">
              <JapaneseText
                text={answered && question.japaneseFull ? question.japaneseFull : question.japanesePrompt}
                showFurigana={showFurigana}
              />
            </p>
            {answered && question.japaneseFull ? (
              <AudioButton text={question.japaneseFull} label="Dengar" />
            ) : question.type !== 'cloze' && question.japaneseFull ? (
              <AudioButton text={question.japaneseFull} label="Dengar" />
            ) : null}
          </div>
        ) : null}
      </div>

      {/* 4 Options */}
      <div className="grid grid-cols-1 gap-2.5" role="group" aria-label="Pilihan jawaban">
        {question.options.map((opt, idx) => {
          const isSelected = chosenIndex === idx;
          const isRightOption = idx === question.correctIndex;

          let btnStyle =
            'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30';

          if (answered) {
            if (isRightOption) {
              btnStyle =
                'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 dark:border-emerald-500 text-emerald-950 dark:text-emerald-100';
            } else if (isSelected) {
              btnStyle =
                'bg-rose-50 dark:bg-rose-950/60 border-rose-500 dark:border-rose-500 text-rose-950 dark:text-rose-100';
            } else {
              btnStyle =
                'bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 opacity-75';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              id={`quizOption-${idx}`}
              disabled={answered}
              onClick={() => onSelectOption(idx)}
              className={`w-full min-h-[52px] text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 cursor-pointer disabled:cursor-default focus-visible:outline-2 focus-visible:outline-indigo-500 ${btnStyle}`}
            >
              <span
                className={`w-7 h-7 rounded-lg text-xs font-mono-num font-bold inline-flex items-center justify-center shrink-0 ${
                  answered && isRightOption
                    ? 'bg-emerald-600 text-white'
                    : answered && isSelected
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {ABC_LABELS[idx]}
              </span>
              <span
                className={`flex-1 text-sm sm:text-base font-semibold leading-snug ${
                  question.type !== 'function' ? 'font-jp' : ''
                }`}
              >
                {opt}
              </span>
              {answered && isRightOption ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
              ) : answered && isSelected ? (
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
              ) : null}
            </button>
          );
        })}
      </div>

      {/* Feedback & Next */}
      {answered ? (
        <div
          className={`rounded-2xl border p-4 space-y-3 ${
            isCorrect
              ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/80'
              : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/80'
          }`}
        >
          <div className="flex items-start gap-2.5">
            {isCorrect ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden="true" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" aria-hidden="true" />
            )}
            <div className="min-w-0 space-y-1.5 flex-1">
              <p
                className={`text-sm font-bold ${
                  isCorrect
                    ? 'text-emerald-900 dark:text-emerald-200'
                    : 'text-rose-900 dark:text-rose-200'
                }`}
              >
                {isCorrect ? 'Jawaban Benar!' : 'Kurang Tepat'}
              </p>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {question.explanation}
              </p>
              <div className="pt-1">
                <FormulaDisplay formulas={question.pattern.formulas} compact />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              id="btnQuizNext"
              onClick={onNext}
              className="min-h-[42px] px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
            >
              <span>{isLast ? 'Lihat Hasil Kuis' : 'Soal Berikutnya'}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
