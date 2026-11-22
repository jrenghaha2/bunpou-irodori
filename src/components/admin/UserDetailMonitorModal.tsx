import { BookOpen, ClipboardCheck, Loader2, X } from 'lucide-react';
import type { UserDetailedMonitoring } from '../../services/adminService';
import type { BookData } from '../../types/bunpou';
import {
  getBookLabelId,
  getQuizFocusLabelId,
  getRoleLabelId,
  type AdminUserRecord,
  type LiveActivityRecord,
} from '../../utils/adminRoles';
import { Modal } from '../Modal';

interface UserDetailMonitorModalProps {
  open: boolean;
  user: AdminUserRecord | null;
  liveActivity: LiveActivityRecord | null;
  books: BookData[];
  loading: boolean;
  detail: UserDetailedMonitoring | null;
  onClose: () => void;
}

function getScoreBadgeClass(score: number): string {
  if (score >= 80) {
    return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  }
  if (score >= 60) {
    return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  }
  return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
}

export function UserDetailMonitorModal({
  open,
  user,
  liveActivity,
  books,
  loading,
  detail,
  onClose,
}: UserDetailMonitorModalProps) {
  if (!user && !liveActivity) return null;

  const displayName = user?.displayName || liveActivity?.displayName || 'Pembelajar';
  const email = user?.email || liveActivity?.email || 'Email tidak tercatat';
  const role = user?.role ?? 'user';

  return (
    <Modal
      open={open}
      onClose={onClose}
      id="userDetailMonitorModal"
      ariaLabelledBy="userDetailMonitorTitle"
      panelClassName="max-w-2xl p-5 sm:p-6 space-y-5 max-h-[88vh] overflow-y-auto"
    >
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2
              id="userDetailMonitorTitle"
              className="text-lg font-bold text-slate-900 dark:text-slate-50 truncate"
            >
              {displayName}
            </h2>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                role === 'superadmin'
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                  : role === 'admin'
                    ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {getRoleLabelId(role)}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{email}</p>
          {liveActivity ? (
            <p className="text-xs font-medium text-indigo-700 dark:text-indigo-300 mt-1.5">
              Aktivitas terakhir: {liveActivity.activitySummary}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup detail pengguna"
          className="min-h-[36px] min-w-[36px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 inline-flex items-center justify-center shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      {loading ? (
        <div className="py-10 flex flex-col items-center justify-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" aria-hidden="true" />
          <span>Memuat progres buku dan riwayat kuis pengguna...</span>
        </div>
      ) : detail ? (
        <>
          {/* Per-book progress */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              Progres 3 Buku Irodori
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {books.map(book => {
                const stats = detail.books[book.id];
                const mastered = stats?.masteredCount ?? 0;
                const hard = stats?.hardCount ?? 0;
                const pct =
                  book.totalPatterns > 0 ? Math.round((mastered / book.totalPatterns) * 100) : 0;
                return (
                  <div
                    key={book.id}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        {book.shortTitle}
                      </span>
                      <span className="text-xs font-mono-num font-bold text-emerald-700 dark:text-emerald-400">
                        {pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-mono-num">
                      <span>
                        Hafal: <strong>{mastered}</strong>/{book.totalPatterns}
                      </span>
                      <span>
                        Sulit: <strong className="text-amber-700 dark:text-amber-400">{hard}</strong>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quiz History */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <ClipboardCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Riwayat Hasil Kuis ({detail.allQuizSessions.length} sesi terbaru)
            </h3>
            {detail.allQuizSessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-5 text-center text-xs text-slate-500 dark:text-slate-400">
                Pengguna ini belum memiliki riwayat kuis yang tersinkron di cloud.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {detail.allQuizSessions.slice(0, 20).map(session => {
                  const dt = new Date(session.completedAt);
                  const dateLabel = Number.isNaN(dt.getTime())
                    ? session.completedAt
                    : dt.toLocaleString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      });
                  return (
                    <div
                      key={`${session.bookId}-${session.id}`}
                      className="px-3.5 py-2.5 bg-white dark:bg-slate-900 flex flex-wrap items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          {getBookLabelId(session.bookId)} · {session.scopeLabel}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {getQuizFocusLabelId(session.focus)} · {dateLabel}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono-num text-slate-600 dark:text-slate-300">
                          {session.correct}/{session.total} benar
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md border text-xs font-mono-num font-bold ${getScoreBadgeClass(
                            session.score
                          )}`}
                        >
                          {session.score}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-6 text-center">
          Tidak dapat memuat detail pengguna.
        </p>
      )}
    </Modal>
  );
}
