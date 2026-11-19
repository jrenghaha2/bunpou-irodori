import { useState } from 'react';
import { BarChart3, ChevronRight, Cloud, Trash2, TrendingDown, TrendingUp } from 'lucide-react';
import type { QuizSessionHistoryEntry } from '../../types/bunpou';
import { computeQuizPerformanceStats } from '../../utils/quizStats';
import { formatShortDate, getFocusLabel, getScoreToneClass } from './quizHelpers';

interface QuizStatsPanelProps {
  bookShortTitle: string;
  history: QuizSessionHistoryEntry[];
  syncing: boolean;
  cloudEnabled: boolean;
  onInspectEntry: (entry: QuizSessionHistoryEntry) => void;
  onClearHistory: () => void;
}

export function QuizStatsPanel({
  bookShortTitle,
  history,
  syncing,
  cloudEnabled,
  onInspectEntry,
  onClearHistory,
}: QuizStatsPanelProps) {
  const [confirmClear, setConfirmClear] = useState(false);
  const stats = computeQuizPerformanceStats(history);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
            Statistik &amp; Riwayat Kuis ({bookShortTitle})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {cloudEnabled ? (
            <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 inline-flex items-center gap-1">
              <Cloud className="w-3.5 h-3.5" aria-hidden="true" />
              {syncing ? 'Menyinkronkan...' : 'Tersinkron Cloud'}
            </span>
          ) : null}

          {history.length > 0 ? (
            confirmClear ? (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onClearHistory();
                    setConfirmClear(false);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                >
                  Ya, Hapus
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmClear(false)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  Batal
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-300 hover:border-rose-200 dark:hover:border-rose-800 text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Hapus Riwayat</span>
              </button>
            )
          ) : null}
        </div>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-3">
          Belum ada riwayat kuis untuk {bookShortTitle}. Selesaikan satu sesi kuis untuk melihat
          grafik akurasi dan pembahasan riwayat.
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 p-3">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Total Sesi
              </p>
              <p className="text-xl font-extrabold font-mono-num text-slate-900 dark:text-slate-50 mt-0.5">
                {stats.totalSessions}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 p-3">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Akurasi Total
              </p>
              <p
                className={`text-xl font-extrabold font-mono-num mt-0.5 ${getScoreToneClass(
                  stats.overallAccuracyPct
                )}`}
              >
                {stats.overallAccuracyPct}%
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 p-3">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Skor Tertinggi
              </p>
              <p className="text-xl font-extrabold font-mono-num text-emerald-700 dark:text-emerald-400 mt-0.5">
                {stats.bestScore}%
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 p-3">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Skor Terakhir
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p
                  className={`text-xl font-extrabold font-mono-num ${getScoreToneClass(
                    stats.latestScore ?? 0
                  )}`}
                >
                  {stats.latestScore ?? 0}%
                </p>
                {stats.trendDelta !== null && stats.trendDelta !== 0 ? (
                  <span
                    className={`text-[11px] font-mono-num font-bold inline-flex items-center gap-0.5 ${
                      stats.trendDelta > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {stats.trendDelta > 0 ? (
                      <TrendingUp className="w-3 h-3" aria-hidden="true" />
                    ) : (
                      <TrendingDown className="w-3 h-3" aria-hidden="true" />
                    )}
                    {stats.trendDelta > 0 ? `+${stats.trendDelta}` : stats.trendDelta}
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {history.map(entry => (
              <button
                key={entry.id}
                type="button"
                onClick={() => onInspectEntry(entry)}
                className="w-full text-left rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:border-indigo-200 dark:hover:border-indigo-800 px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors cursor-pointer"
              >
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                    {entry.scopeLabel} · {getFocusLabel(entry.focus)}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {formatShortDate(entry.completedAt)} · Benar {entry.correct}/{entry.total}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-sm font-mono-num font-extrabold ${getScoreToneClass(
                      entry.score
                    )}`}
                  >
                    {entry.score}%
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" aria-hidden="true" />
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
