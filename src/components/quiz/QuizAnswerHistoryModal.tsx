import { useEffect, useState } from 'react';
import { CheckCircle2, X, XCircle } from 'lucide-react';
import type { QuizSessionHistoryEntry } from '../../types/bunpou';
import { AudioButton } from '../AudioButton';
import { JapaneseText } from '../JapaneseText';
import { Modal } from '../Modal';
import {
  formatShortDate,
  getFocusLabel,
  getQuestionTypeLabel,
  getScoreToneClass,
} from './quizHelpers';

interface QuizAnswerHistoryModalProps {
  entry: QuizSessionHistoryEntry | null;
  showFurigana: boolean;
  onClose: () => void;
}

export function QuizAnswerHistoryModal({
  entry,
  showFurigana,
  onClose,
}: QuizAnswerHistoryModalProps) {
  const [onlyWrong, setOnlyWrong] = useState(false);

  useEffect(() => {
    setOnlyWrong(false);
  }, [entry?.id]);

  if (!entry) return null;

  const answers = entry.answers ?? [];
  const wrongCount = answers.filter(a => !a.correct).length;
  const displayed = onlyWrong ? answers.filter(a => !a.correct) : answers;

  return (
    <Modal
      open={Boolean(entry)}
      onClose={onClose}
      id="quizHistoryModal"
      ariaLabelledBy="quizHistoryModalTitle"
      maxWidthClass="max-w-2xl"
      panelClassName="max-h-[85vh] flex flex-col overflow-hidden"
    >
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3
              id="quizHistoryModalTitle"
              className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50"
            >
              Detail Riwayat Kuis ·{' '}
              <span className={`font-mono-num ${getScoreToneClass(entry.score)}`}>
                {entry.score}%
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {entry.scopeLabel} · {getFocusLabel(entry.focus)} · Benar {entry.correct}/{entry.total}{' '}
              · {formatShortDate(entry.completedAt)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail riwayat"
            className="min-h-[36px] min-w-[36px] p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 inline-flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {answers.length > 0 && wrongCount > 0 ? (
          <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <button
              type="button"
              onClick={() => setOnlyWrong(false)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                !onlyWrong
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Semua ({answers.length})
            </button>
            <button
              type="button"
              onClick={() => setOnlyWrong(true)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                onlyWrong
                  ? 'bg-rose-600 text-white'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Salah ({wrongCount})
            </button>
          </div>
        ) : null}

        <div className="p-5 overflow-y-auto space-y-2.5 flex-1">
          {displayed.length === 0 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">
              Detail per soal tidak tersimpan untuk sesi ini.
            </p>
          ) : (
            displayed.map(ans => (
              <div
                key={`${ans.no}-${ans.patternId}`}
                className={`rounded-xl border p-3.5 space-y-1.5 ${
                  ans.correct
                    ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/70'
                    : 'bg-rose-50/50 dark:bg-rose-950/25 border-rose-200 dark:border-rose-900/70'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {ans.correct ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" aria-hidden="true" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" aria-hidden="true" />
                    )}
                    <span className="text-xs font-mono-num font-bold text-slate-500 dark:text-slate-400">
                      #{ans.no}
                    </span>
                    <span className="font-jp text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {ans.patternTitle}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                    {getQuestionTypeLabel(ans.type)}
                  </span>
                </div>

                {ans.formula ? (
                  <p className="text-xs font-jp text-indigo-700 dark:text-indigo-300 font-semibold">
                    Rumus: {ans.formula}
                  </p>
                ) : null}

                {ans.exampleJp ? (
                  <div className="flex items-center justify-between gap-2 pt-0.5">
                    <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      <JapaneseText text={ans.exampleJp} showFurigana={showFurigana} />
                    </p>
                    <AudioButton text={ans.exampleJp} />
                  </div>
                ) : null}

                {!ans.correct ? (
                  <p className="text-xs text-rose-700 dark:text-rose-300">
                    Jawaban dipilih: <strong className="font-jp">{ans.chosenLabel}</strong> · Benar:{' '}
                    <strong className="font-jp text-emerald-800 dark:text-emerald-300">
                      {ans.expectedLabel}
                    </strong>
                  </p>
                ) : null}
              </div>
            ))
          )}
        </div>
    </Modal>
  );
}
