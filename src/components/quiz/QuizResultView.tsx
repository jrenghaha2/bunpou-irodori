import { useState } from 'react';
import { Award, CheckCircle2, RotateCcw, Settings2, XCircle } from 'lucide-react';
import type { QuizFocus, QuizRecord } from '../../types/bunpou';
import { calculateQuizScore } from '../../utils/quizGenerator';
import { AudioButton } from '../AudioButton';
import { FormulaDisplay } from '../FormulaDisplay';
import { JapaneseText } from '../JapaneseText';
import {
  getFocusLabel,
  getQuestionTypeLabel,
  getScoreBadgeClass,
  getScoreMessage,
  getScoreToneClass,
} from './quizHelpers';

interface QuizResultViewProps {
  records: QuizRecord[];
  scopeLabel: string;
  focus: QuizFocus;
  bookShortTitle: string;
  showFurigana: boolean;
  onRetry: () => void;
  onBackToSetup: () => void;
}

export function QuizResultView({
  records,
  scopeLabel,
  focus,
  bookShortTitle,
  showFurigana,
  onRetry,
  onBackToSetup,
}: QuizResultViewProps) {
  const [onlyWrong, setOnlyWrong] = useState(false);

  const total = records.length;
  const correct = records.filter(r => r.isCorrect).length;
  const wrongCount = total - correct;
  const score = calculateQuizScore(correct, total);

  const displayed = onlyWrong ? records.filter(r => !r.isCorrect) : records;

  return (
    <div className="space-y-4">
      {/* Score Summary Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-center space-y-4">
        <div
          className={`w-14 h-14 rounded-2xl border inline-flex items-center justify-center mx-auto ${getScoreBadgeClass(score)}`}
        >
          <Award className="w-7 h-7" aria-hidden="true" />
        </div>

        <div className="space-y-1">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {bookShortTitle} · {scopeLabel} · {getFocusLabel(focus)}
          </p>
          <p className={`text-4xl sm:text-5xl font-extrabold font-mono-num ${getScoreToneClass(score)}`}>
            {score}%
          </p>
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
            Benar <span className="font-mono-num">{correct}</span> dari{' '}
            <span className="font-mono-num">{total}</span> soal
          </p>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto pt-1">
            {getScoreMessage(score)}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
          <button
            type="button"
            id="btnQuizRetry"
            onClick={onRetry}
            className="min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Ulangi Kuis</span>
          </button>
          <button
            type="button"
            id="btnQuizBackSetup"
            onClick={onBackToSetup}
            className="min-h-[44px] px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Settings2 className="w-4 h-4" aria-hidden="true" />
            <span>Atur Kuis Baru</span>
          </button>
        </div>
      </div>

      {/* Review List */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
            Pembahasan Jawaban ({displayed.length})
          </h3>
          {wrongCount > 0 ? (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setOnlyWrong(false)}
                aria-pressed={!onlyWrong}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  !onlyWrong
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Semua ({total})
              </button>
              <button
                type="button"
                onClick={() => setOnlyWrong(true)}
                aria-pressed={onlyWrong}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  onlyWrong
                    ? 'bg-rose-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
              >
                Salah ({wrongCount})
              </button>
            </div>
          ) : null}
        </div>

        <div className="space-y-3">
          {displayed.map(rec => (
            <div
              key={rec.no}
              className={`rounded-xl border p-4 space-y-2.5 ${
                rec.isCorrect
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/70'
                  : 'bg-rose-50/50 dark:bg-rose-950/25 border-rose-200 dark:border-rose-900/70'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  {rec.isCorrect ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
                  )}
                  <span className="text-xs font-mono-num font-bold text-slate-500 dark:text-slate-400">
                    #{rec.no}
                  </span>
                  <span className="font-jp text-sm font-bold text-slate-900 dark:text-slate-50 truncate">
                    {rec.question.pattern.title}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                  Bab {rec.question.pattern.chapterNumber} · {getQuestionTypeLabel(rec.question.type)}
                </span>
              </div>

              {rec.question.japaneseFull ? (
                <div className="flex items-start justify-between gap-2 rounded-lg bg-white/80 dark:bg-slate-900/70 border border-slate-200/70 dark:border-slate-800 p-2.5">
                  <p className="text-sm text-slate-900 dark:text-slate-100">
                    <JapaneseText text={rec.question.japaneseFull} showFurigana={showFurigana} />
                  </p>
                  <AudioButton text={rec.question.japaneseFull} />
                </div>
              ) : null}

              <div className="text-xs space-y-1">
                {!rec.isCorrect ? (
                  <p className="text-rose-700 dark:text-rose-300">
                    Jawaban Anda: <strong className="font-jp">{rec.chosenLabel}</strong>
                  </p>
                ) : null}
                <p className="text-emerald-800 dark:text-emerald-300">
                  Jawaban Benar: <strong className="font-jp">{rec.correctLabel}</strong>
                </p>
              </div>

              <FormulaDisplay formulas={rec.question.pattern.formulas} compact />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
