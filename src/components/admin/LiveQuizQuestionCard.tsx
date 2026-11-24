import { CheckCircle2, Clock, Eye, EyeOff, Radio, XCircle } from 'lucide-react';
import {
  computeLiveQuizWrongCount,
  getBookLabelId,
  getLiveOptionVisualState,
  getQuizQuestionTypeLabelId,
  hasLiveQuizQuestion,
  type LiveActivityRecord,
} from '../../utils/adminRoles';
import { JapaneseText } from '../JapaneseText';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

interface LiveQuizQuestionCardProps {
  activity: LiveActivityRecord;
  showCorrectAnswer: boolean;
  onToggleShowCorrectAnswer: () => void;
  showFurigana: boolean;
  onToggleFurigana?: () => void;
  compact?: boolean;
}

export function LiveQuizQuestionCard({
  activity,
  showCorrectAnswer,
  onToggleShowCorrectAnswer,
  showFurigana,
  onToggleFurigana,
  compact = false,
}: LiveQuizQuestionCardProps) {
  const hasQuestion = hasLiveQuizQuestion(activity);
  const chosenIndex = activity.quizLiveChosenIndex;
  const correctIndex = activity.quizLiveCorrectIndex;
  const hasAnswered = chosenIndex >= 0 && chosenIndex <= 3;
  const answeredCorrectly = hasAnswered && chosenIndex === correctIndex;
  const chosenLetter = hasAnswered ? OPTION_LETTERS[chosenIndex] : '';
  const wrongCount = computeLiveQuizWrongCount(
    activity.quizLiveCurrent,
    activity.quizLiveCorrect,
    chosenIndex
  );

  return (
    <div
      className={`rounded-2xl border border-amber-400/75 dark:border-amber-600/55 bg-amber-50/55 dark:bg-slate-950/90 ${
        compact ? 'p-3 space-y-3' : 'p-3.5 sm:p-4 space-y-3.5'
      }`}
    >
      {/* Top Bar: Pantauan Soal Kuis Real-Time · Scope | Soal X/Y · Z benar · W salah | [Kunci Jawaban switch] */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span
            className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)] animate-pulse shrink-0"
            aria-hidden="true"
          />
          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-50">
            Pantauan Soal Kuis Real-Time
          </span>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            · {getBookLabelId(activity.activeBookId)} · {activity.activeChapterLabel}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono-num font-bold">
            <span className="text-slate-900 dark:text-slate-100">
              Soal {activity.quizLiveCurrent}/{activity.quizLiveTotal}
            </span>
            <span className="text-slate-400 dark:text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              {activity.quizLiveCorrect} benar
            </span>
            <span className="text-slate-400 dark:text-slate-600" aria-hidden="true">
              ·
            </span>
            <span className="text-rose-600 dark:text-rose-400">{wrongCount} salah</span>
          </div>

          <button
            type="button"
            role="switch"
            aria-checked={showCorrectAnswer}
            onClick={onToggleShowCorrectAnswer}
            title={
              showCorrectAnswer
                ? 'Matikan untuk menyembunyikan penanda kunci jawaban benar'
                : 'Aktifkan untuk menampilkan penanda kunci jawaban benar'
            }
            className={`min-h-[32px] px-2.5 py-1 rounded-xl border text-xs font-semibold inline-flex items-center gap-2 transition-colors cursor-pointer ${
              showCorrectAnswer
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400/80 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50'
                : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {showCorrectAnswer ? (
              <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            ) : (
              <EyeOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            )}
            <span>Kunci Jawaban</span>
            <span
              aria-hidden="true"
              className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${
                showCorrectAnswer
                  ? 'bg-emerald-500'
                  : 'bg-slate-300 dark:bg-slate-600'
              }`}
            >
              <span
                className={`inline-block h-3 w-3 rounded-full bg-white shadow-xs transform transition-transform ${
                  showCorrectAnswer ? 'translate-x-3.5' : 'translate-x-0.5'
                }`}
              />
            </span>
          </button>

          {onToggleFurigana ? (
            <button
              type="button"
              onClick={onToggleFurigana}
              aria-pressed={showFurigana}
              className={`min-h-[32px] px-2.5 py-1 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                showFurigana
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-200'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              Furigana: {showFurigana ? 'ON' : 'OFF'}
            </button>
          ) : null}
        </div>
      </div>

      {/* Inner question card */}
      {hasQuestion ? (
        <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3.5 sm:p-4 space-y-3 shadow-xs">
          {/* Sub-header: Soal #N · Type · Bab | Live learner answer status */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-bold font-mono-num">
                <Radio className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Soal #{activity.quizLiveCurrent}</span>
              </span>
              {activity.quizLiveType ? (
                <>
                  <span className="text-slate-400 dark:text-slate-600" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-indigo-700 dark:text-indigo-300">
                    {getQuizQuestionTypeLabelId(activity.quizLiveType)}
                  </span>
                </>
              ) : null}
              {activity.quizLiveChapter > 0 ? (
                <>
                  <span className="text-slate-400 dark:text-slate-600" aria-hidden="true">
                    ·
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    Bab {activity.quizLiveChapter}
                  </span>
                </>
              ) : null}
            </div>

            {!hasAnswered ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Menunggu pilihan jawaban...</span>
              </span>
            ) : answeredCorrectly ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Dijawab Benar ({chosenLetter})</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                <XCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span>Dijawab Salah ({chosenLetter})</span>
              </span>
            )}
          </div>

          {/* Prompt & Japanese sentence box */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/55 border border-slate-200/80 dark:border-slate-700/70 p-3.5 space-y-1.5">
            {activity.quizLivePrompt ? (
              <p className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                {activity.quizLivePrompt}
              </p>
            ) : null}

            {activity.quizLiveJapanese ? (
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50 leading-relaxed pt-0.5">
                <JapaneseText text={activity.quizLiveJapanese} showFurigana={showFurigana} />
              </div>
            ) : null}
          </div>

          {/* 2x2 Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {activity.quizLiveOptions.map((optionText, idx) => {
              const visual = getLiveOptionVisualState(
                idx,
                correctIndex,
                chosenIndex,
                showCorrectAnswer
              );
              const letter = OPTION_LETTERS[idx] ?? String(idx + 1);

              const boxStyle =
                visual.tone === 'correct'
                  ? 'border-emerald-400/80 dark:border-emerald-600/80 bg-emerald-50/75 dark:bg-emerald-950/35 text-emerald-950 dark:text-emerald-50'
                  : visual.tone === 'wrong'
                    ? 'border-rose-400/80 dark:border-rose-600/80 bg-rose-50/75 dark:bg-rose-950/35 text-rose-950 dark:text-rose-50'
                    : 'border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-900/70 text-slate-800 dark:text-slate-100';

              const letterStyle =
                visual.tone === 'correct'
                  ? 'bg-emerald-600/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/60 dark:border-emerald-600/60'
                  : visual.tone === 'wrong'
                    ? 'bg-rose-600/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border-rose-400/60 dark:border-rose-600/60'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700';

              const badgeStyle =
                visual.tone === 'correct'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : visual.tone === 'wrong'
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-500 dark:text-slate-400';

              return (
                <div
                  key={`${letter}-${idx}`}
                  className={`rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-2.5 transition-colors ${boxStyle}`}
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className={`w-7 h-7 rounded-lg border text-xs font-bold inline-flex items-center justify-center shrink-0 mt-0.5 ${letterStyle}`}
                    >
                      {letter}
                    </span>
                    <span className="text-xs sm:text-sm font-bold leading-snug break-words pt-1">
                      <JapaneseText text={optionText} showFurigana={showFurigana} />
                    </span>
                  </div>

                  {visual.badge ? (
                    <span className={`text-xs font-bold shrink-0 whitespace-nowrap ${badgeStyle}`}>
                      {visual.badge}
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-amber-300/90 dark:border-amber-800/80 bg-white/80 dark:bg-slate-900/70 p-4 text-center text-xs text-slate-600 dark:text-slate-300">
          Menunggu detail soal kuis dari perangkat siswa. Begitu soal aktif dimuat, pertanyaan dan
          pilihan jawaban akan langsung muncul di sini secara real-time.
        </div>
      )}
    </div>
  );
}
