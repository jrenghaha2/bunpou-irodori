import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Eye,
  EyeOff,
  Flame,
  GraduationCap,
  Loader2,
  Search,
  X,
  XCircle,
} from 'lucide-react';
import type { UserDetailedMonitoring } from '../../services/adminService';
import type { BookData, BookId, BunpouPattern, ChapterNumber } from '../../types/bunpou';
import { BOOK_CHAPTER_RANGES } from '../../types/bunpou';
import {
  classifyPresenceStatus,
  computeUserDetailStats,
  formatRelativeTimeId,
  getBookLabelId,
  getQuizFocusLabelId,
  getQuizQuestionTypeLabelId,
  getRoleLabelId,
  type AdminUserRecord,
  type LiveActivityRecord,
} from '../../utils/adminRoles';
import { isLegacyPlaceholderChoiceLabel } from '../../utils/quizStats';
import { JapaneseText } from '../JapaneseText';
import { Modal } from '../Modal';

interface UserDetailMonitorModalProps {
  open: boolean;
  user: AdminUserRecord | null;
  liveActivity: LiveActivityRecord | null;
  books: BookData[];
  loading: boolean;
  detail: UserDetailedMonitoring | null;
  nowMs: number;
  onClose: () => void;
}

type BookPatternStatusFilter = 'mastered' | 'hard' | 'unmastered' | 'all';
type QuizAnswerFilter = 'all' | 'correct' | 'wrong';

function getScoreTextClass(score: number): string {
  if (score >= 80) return 'text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'text-amber-600 dark:text-amber-400';
  return 'text-rose-600 dark:text-rose-400';
}

function formatSessionDateId(iso: string): string {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return iso;
  const datePart = dt.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
  });
  const timePart = dt.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${datePart}, ${timePart.replace(':', '.')}`;
}

function getDefaultBookStatusFilter(masteredCount: number, hardCount: number): BookPatternStatusFilter {
  if (masteredCount > 0) return 'mastered';
  if (hardCount > 0) return 'hard';
  return 'unmastered';
}

export function UserDetailMonitorModal({
  open,
  user,
  liveActivity,
  books,
  loading,
  detail,
  nowMs,
  onClose,
}: UserDetailMonitorModalProps) {
  const [expandedSessionKey, setExpandedSessionKey] = useState<string | null>(null);
  const [quizAnswerFilter, setQuizAnswerFilter] = useState<QuizAnswerFilter>('all');
  const [selectedBookId, setSelectedBookId] = useState<BookId | null>(null);
  const [bookStatusFilter, setBookStatusFilter] = useState<BookPatternStatusFilter>('mastered');
  const [bookChapterFilter, setBookChapterFilter] = useState<'all' | ChapterNumber>('all');
  const [bookSearch, setBookSearch] = useState('');
  const [showFurigana, setShowFurigana] = useState(true);

  const targetUid = user?.uid ?? liveActivity?.uid ?? null;

  useEffect(() => {
    setExpandedSessionKey(null);
    setQuizAnswerFilter('all');
    setSelectedBookId(null);
    setBookStatusFilter('mastered');
    setBookChapterFilter('all');
    setBookSearch('');
  }, [targetUid, open]);

  const stats = useMemo(() => {
    if (!detail) return null;
    return computeUserDetailStats(books, detail.books, detail.allQuizSessions);
  }, [books, detail]);

  const selectedBook = useMemo(
    () => (selectedBookId ? books.find(b => b.id === selectedBookId) ?? null : null),
    [books, selectedBookId]
  );

  const selectedBookDetail = useMemo(() => {
    if (!selectedBook || !detail) return null;
    const progress = detail.books[selectedBook.id];
    const masteredSet = new Set(progress?.masteredIds ?? []);
    const hardSet = new Set(progress?.hardIds ?? []);
    const allBookPatterns: BunpouPattern[] = selectedBook.chapters.flatMap(ch => ch.patterns);

    let masteredCount = 0;
    let hardCount = 0;
    let unmasteredCount = 0;
    for (const pat of allBookPatterns) {
      if (masteredSet.has(pat.id)) masteredCount += 1;
      else if (hardSet.has(pat.id)) hardCount += 1;
      else unmasteredCount += 1;
    }

    const q = bookSearch.trim().toLowerCase();
    const filteredPatterns = allBookPatterns.filter(pat => {
      const isMastered = masteredSet.has(pat.id);
      const isHard = hardSet.has(pat.id);

      if (bookStatusFilter === 'mastered' && !isMastered) return false;
      if (bookStatusFilter === 'hard' && !isHard) return false;
      if (bookStatusFilter === 'unmastered' && (isMastered || isHard)) return false;
      if (bookChapterFilter !== 'all' && pat.chapterNumber !== bookChapterFilter) return false;

      if (!q) return true;
      return (
        pat.title.toLowerCase().includes(q) ||
        pat.shortPattern.toLowerCase().includes(q) ||
        pat.functionText.toLowerCase().includes(q) ||
        pat.formulas.some(f => f.toLowerCase().includes(q)) ||
        (pat.itemCode ?? '').toLowerCase().includes(q) ||
        `bab ${pat.chapterNumber}`.includes(q) ||
        pat.examples.some(
          ex =>
            ex.japanese.toLowerCase().includes(q) ||
            ex.translation.toLowerCase().includes(q)
        )
      );
    });

    return {
      masteredSet,
      hardSet,
      masteredCount,
      hardCount,
      unmasteredCount,
      totalCount: allBookPatterns.length,
      filteredPatterns,
    };
  }, [selectedBook, detail, bookStatusFilter, bookChapterFilter, bookSearch]);

  if (!user && !liveActivity) return null;

  const displayName = user?.displayName || liveActivity?.displayName || 'Pembelajar';
  const email = user?.email || liveActivity?.email || 'Email belum tersinkron';
  const avatarUrl = user?.avatarUrl || liveActivity?.avatarUrl || '';
  const initial = displayName.charAt(0).toUpperCase() || 'P';
  const role = user?.role ?? 'user';

  const latestActivityMs = Math.max(liveActivity?.updatedAtMs ?? 0, user?.updatedAtMs ?? 0);
  const presence = classifyPresenceStatus(liveActivity?.updatedAtMs ?? 0, nowMs);
  const presenceLabel =
    presence === 'online'
      ? 'Aktif sekarang'
      : latestActivityMs > 0
        ? `Aktif ${formatRelativeTimeId(latestActivityMs, nowMs).replace(/^Baru saja$/, 'baru saja')}`
        : 'Belum ada aktivitas live';

  const isLiveQuiz =
    presence === 'online' &&
    liveActivity?.activityType === 'quiz_running' &&
    liveActivity.quizLiveTotal > 0;
  const liveQuizPct =
    isLiveQuiz && liveActivity
      ? Math.min(100, Math.round((liveActivity.quizLiveCurrent / liveActivity.quizLiveTotal) * 100))
      : 0;

  const handleToggleBookDetail = (bookId: BookId) => {
    if (selectedBookId === bookId) {
      setSelectedBookId(null);
      return;
    }
    const bookProgress = detail?.books[bookId];
    setSelectedBookId(bookId);
    setBookStatusFilter(
      getDefaultBookStatusFilter(bookProgress?.masteredCount ?? 0, bookProgress?.hardCount ?? 0)
    );
    setBookChapterFilter('all');
    setBookSearch('');
  };

  const handleToggleSession = (sessionKey: string) => {
    setExpandedSessionKey(prev => {
      const next = prev === sessionKey ? null : sessionKey;
      if (next !== prev) {
        setQuizAnswerFilter('all');
      }
      return next;
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      id="userDetailMonitorModal"
      ariaLabelledBy="userDetailMonitorTitle"
      maxWidthClass="max-w-4xl"
      panelClassName="p-5 sm:p-6 space-y-5 max-h-[90vh] overflow-y-auto"
    >
      {/* Header matching unified user monitor layout */}
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={displayName}
                referrerPolicy="no-referrer"
                className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
              />
            ) : (
              <span
                aria-hidden="true"
                className="w-11 h-11 rounded-full bg-indigo-600 dark:bg-sky-700 text-white font-bold text-base inline-flex items-center justify-center shadow-sm"
              >
                {initial}
              </span>
            )}
            <span
              title={presence === 'online' ? 'Online sekarang' : 'Status kehadiran'}
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                presence === 'online'
                  ? 'bg-emerald-500'
                  : presence === 'recent'
                    ? 'bg-amber-400'
                    : 'bg-slate-400'
              }`}
            />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="userDetailMonitorTitle"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50 truncate"
              >
                {displayName}
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {email} · {getRoleLabelId(role)} · {presenceLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowFurigana(prev => !prev)}
            aria-pressed={showFurigana}
            className={`min-h-[38px] px-2.5 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer transition-colors ${
              showFurigana
                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-200'
                : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
            }`}
          >
            Furigana: {showFurigana ? 'ON' : 'OFF'}
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup detail pengguna"
            className="min-h-[38px] min-w-[38px] rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-300 inline-flex items-center justify-center shrink-0 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2.5 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="w-5 h-5 animate-spin text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          <span>Menghubungkan data progres &amp; riwayat kuis real-time...</span>
        </div>
      ) : detail && stats ? (
        <>
          {/* Live in-progress quiz banner if user is currently taking a quiz */}
          {isLiveQuiz && liveActivity ? (
            <div className="rounded-xl border border-amber-300 dark:border-amber-700/80 bg-amber-50/70 dark:bg-amber-950/30 p-3.5 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-amber-900 dark:text-amber-200">
                  Sedang Mengerjakan Kuis Live: {liveActivity.activitySummary}
                </span>
                <span className="font-mono-num font-bold text-amber-800 dark:text-amber-300">
                  Soal {liveActivity.quizLiveCurrent}/{liveActivity.quizLiveTotal} · Benar{' '}
                  {liveActivity.quizLiveCorrect}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-amber-200/80 dark:bg-amber-900/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${liveQuizPct}%` }}
                />
              </div>
            </div>
          ) : null}

          {/* 4 KPI Summary Cards matching reference layout */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 flex flex-col justify-between min-h-[104px]">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Total Hafalan
              </span>
              <p className="text-2xl font-bold font-mono-num text-slate-900 dark:text-slate-50 mt-1">
                {stats.masteredTotal}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-num mt-1 truncate">
                Pml: {stats.masteredByBook.introductory} · D1: {stats.masteredByBook.elementary1} ·
                D2: {stats.masteredByBook.elementary2}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 flex flex-col justify-between min-h-[104px]">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Sesi Kuis
              </span>
              <p className="text-2xl font-bold font-mono-num text-slate-900 dark:text-slate-50 mt-1">
                {stats.totalQuizSessions}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-num mt-1 truncate">
                Pml: {stats.quizCountByBook.introductory} · D1: {stats.quizCountByBook.elementary1}{' '}
                · D2: {stats.quizCountByBook.elementary2}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 flex flex-col justify-between min-h-[104px]">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Rata-rata Skor
              </span>
              <p className="text-2xl font-bold font-mono-num text-indigo-600 dark:text-indigo-400 mt-1">
                {stats.averageScore !== null ? `${stats.averageScore}%` : '—'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                {stats.totalAnswered > 0
                  ? `${stats.totalCorrect}/${stats.totalAnswered} soal benar`
                  : 'Akurasi keseluruhan'}
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 p-3.5 flex flex-col justify-between min-h-[104px]">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 inline-flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" aria-hidden="true" />
                <span>Progres &amp; Sulit</span>
              </span>
              <p className="text-2xl font-bold font-mono-num text-slate-900 dark:text-slate-50 mt-1">
                {stats.masteryPct}%
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono-num mt-1 truncate">
                {stats.masteredTotal}/{stats.totalPatterns} · {stats.hardTotal} sulit
              </p>
            </div>
          </div>

          {/* Interactive 3-Book Mastery Section */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
                <span>Progres 3 Buku Irodori</span>
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Klik buku untuk melihat daftar pola hafal, sulit &amp; belum hafal
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {books.map(book => {
                const bookProgress = detail.books[book.id];
                const mastered = bookProgress?.masteredCount ?? 0;
                const hard = bookProgress?.hardCount ?? 0;
                const pct =
                  book.totalPatterns > 0 ? Math.round((mastered / book.totalPatterns) * 100) : 0;
                const range = BOOK_CHAPTER_RANGES[book.id];
                const isSelected = selectedBookId === book.id;

                return (
                  <button
                    key={book.id}
                    type="button"
                    onClick={() => handleToggleBookDetail(book.id)}
                    aria-expanded={isSelected}
                    aria-label={`${isSelected ? 'Tutup' : 'Lihat'} detail hafalan ${book.shortTitle}`}
                    className={`text-left rounded-2xl border p-3.5 space-y-2.5 transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                      isSelected
                        ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-white dark:hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                        {book.shortTitle}{' '}
                        <span className="font-normal text-slate-500 dark:text-slate-400">
                          (Bab {range.min}–{range.max})
                        </span>
                      </span>
                      <span className="text-xs font-mono-num font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
                        {pct}%
                      </span>
                    </div>

                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-600 dark:bg-indigo-400 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-mono-num">
                      <span>
                        Hafal:{' '}
                        <strong className="text-emerald-700 dark:text-emerald-400">
                          {mastered}/{book.totalPatterns}
                        </strong>
                      </span>
                      <span>
                        Sulit:{' '}
                        <strong
                          className={
                            hard > 0
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-slate-600 dark:text-slate-400'
                          }
                        >
                          {hard}
                        </strong>
                      </span>
                    </div>

                    <div className="pt-1 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-[11px] font-semibold">
                      <span className="text-slate-500 dark:text-slate-400">{book.level}</span>
                      <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-300">
                        <span>{isSelected ? 'Tutup Detail' : 'Lihat Detail'}</span>
                        {isSelected ? (
                          <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Expanded Book Pattern Mastery Detail Panel */}
            {selectedBook && selectedBookDetail ? (
              <div className="rounded-2xl border border-indigo-200 dark:border-indigo-900/80 bg-slate-50/90 dark:bg-slate-900/70 p-4 space-y-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      Detail Hafalan · {selectedBook.title} ({selectedBook.level})
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Menampilkan {selectedBookDetail.filteredPatterns.length} dari{' '}
                      {selectedBookDetail.totalCount} pola tata bahasa secara live
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBookId(null)}
                    className="min-h-[32px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
                  >
                    Tutup Detail
                  </button>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Filter status hafalan">
                  {(
                    [
                      {
                        id: 'mastered',
                        label: `Sudah Hafal (${selectedBookDetail.masteredCount})`,
                        activeCls: 'bg-emerald-600 text-white border-emerald-600',
                      },
                      {
                        id: 'hard',
                        label: `Sulit (${selectedBookDetail.hardCount})`,
                        activeCls: 'bg-amber-600 text-white border-amber-600',
                      },
                      {
                        id: 'unmastered',
                        label: `Belum Hafal (${selectedBookDetail.unmasteredCount})`,
                        activeCls: 'bg-slate-700 text-white border-slate-700 dark:bg-slate-600 dark:border-slate-600',
                      },
                      {
                        id: 'all',
                        label: `Semua Pola (${selectedBookDetail.totalCount})`,
                        activeCls: 'bg-indigo-600 text-white border-indigo-600',
                      },
                    ] as const
                  ).map(tab => {
                    const active = bookStatusFilter === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => setBookStatusFilter(tab.id)}
                        className={`min-h-[32px] px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                          active
                            ? tab.activeCls
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Chapter Dropdown & Search Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-[220px_minmax(0,1fr)] gap-2">
                  <select
                    aria-label="Filter bab buku"
                    value={bookChapterFilter}
                    onChange={e =>
                      setBookChapterFilter(
                        e.target.value === 'all' ? 'all' : (Number(e.target.value) as ChapterNumber)
                      )
                    }
                    className="min-h-[36px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="all">Semua Bab ({selectedBook.chapters.length} bab)</option>
                    {selectedBook.chapters.map(ch => (
                      <option key={ch.chapterNumber} value={ch.chapterNumber}>
                        Bab {ch.chapterNumber} — {ch.titleId}
                      </option>
                    ))}
                  </select>

                  <div className="relative">
                    <Search
                      className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      type="search"
                      value={bookSearch}
                      onChange={e => setBookSearch(e.target.value)}
                      placeholder="Cari pola, rumus, fungsi, atau contoh kalimat..."
                      aria-label="Cari pola bunpou"
                      className="w-full min-h-[36px] pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {/* Pattern Breakdown List */}
                {selectedBookDetail.filteredPatterns.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-950/40 p-5 text-center text-xs text-slate-500 dark:text-slate-400">
                    Tidak ada pola tata bahasa yang cocok dengan filter saat ini.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {selectedBookDetail.filteredPatterns.map(pat => {
                      const isMastered = selectedBookDetail.masteredSet.has(pat.id);
                      const isHard = selectedBookDetail.hardSet.has(pat.id);
                      const firstExample = pat.examples[0];

                      return (
                        <div
                          key={pat.id}
                          className={`rounded-xl border p-3 text-xs space-y-1.5 ${
                            isMastered
                              ? 'border-emerald-200/90 dark:border-emerald-900/70 bg-white dark:bg-slate-950/75'
                              : isHard
                                ? 'border-amber-200/90 dark:border-amber-900/70 bg-amber-50/40 dark:bg-amber-950/20'
                                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/60'
                          }`}
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 font-mono-num font-bold">
                                Bab {pat.chapterNumber}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono-num font-semibold">
                                {pat.itemCode || `Pola #${pat.patternIndex}`}
                              </span>
                              {isMastered ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold">
                                  <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                                  Hafal
                                </span>
                              ) : isHard ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold">
                                  <AlertTriangle className="w-3 h-3" aria-hidden="true" />
                                  Sulit
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-semibold">
                                  <Circle className="w-2.5 h-2.5" aria-hidden="true" />
                                  Belum Hafal
                                </span>
                              )}
                            </div>
                          </div>

                          <p className="font-jp text-sm font-bold text-slate-900 dark:text-slate-100">
                            {pat.title}
                          </p>

                          {pat.formulas.length > 0 ? (
                            <p className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 font-semibold">
                              Rumus: {pat.formulas.join(' / ')}
                            </p>
                          ) : null}

                          <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                              Fungsi:{' '}
                            </span>
                            {pat.functionText}
                          </p>

                          {firstExample ? (
                            <div className="rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 px-2.5 py-2 space-y-1">
                              <p className="text-xs text-slate-800 dark:text-slate-100 leading-relaxed">
                                <JapaneseText
                                  text={firstExample.japanese}
                                  showFurigana={showFurigana}
                                />
                              </p>
                              {firstExample.translation ? (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                  {firstExample.translation}
                                </p>
                              ) : null}
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Quiz History Section with Interactive Per-Question & Exact Clicked Answer Detail */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <GraduationCap
                  className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
                  aria-hidden="true"
                />
                <span>Riwayat Hasil Kuis ({detail.allQuizSessions.length})</span>
              </h3>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Klik sesi untuk melihat detail soal &amp; jawaban yang diklik siswa
              </span>
            </div>

            {detail.allQuizSessions.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-6 text-center text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Pengguna ini belum memiliki riwayat kuis yang tersinkron di cloud. Begitu pengguna
                menyelesaikan kuis, hasilnya akan langsung muncul di sini secara real-time.
              </div>
            ) : (
              <div className="divide-y divide-slate-200 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-slate-950/50">
                {detail.allQuizSessions.slice(0, 30).map(session => {
                  const sessionKey = `${session.bookId}-${session.id}`;
                  const isExpanded = expandedSessionKey === sessionKey;
                  const answers = session.answers ?? [];
                  const correctRecorded = answers.filter(a => a.correct).length;
                  const wrongRecorded = answers.filter(a => !a.correct).length;
                  const filteredAnswers = answers.filter(a => {
                    if (quizAnswerFilter === 'correct') return a.correct;
                    if (quizAnswerFilter === 'wrong') return !a.correct;
                    return true;
                  });

                  return (
                    <div key={sessionKey} className="transition-colors">
                      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <button
                          type="button"
                          onClick={() => handleToggleSession(sessionKey)}
                          aria-expanded={isExpanded}
                          className="flex-1 min-w-0 text-left cursor-pointer focus:outline-none group"
                        >
                          <p className="text-sm font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 transition-colors">
                            {getBookLabelId(session.bookId)} · {getQuizFocusLabelId(session.focus)}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {session.scopeLabel} · {formatSessionDateId(session.completedAt)}
                          </p>
                        </button>

                        <div className="flex items-center gap-3 shrink-0">
                          <span
                            className={`text-sm font-mono-num font-bold ${getScoreTextClass(
                              session.score
                            )}`}
                          >
                            {session.correct}/{session.total} ({session.score}%)
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleSession(sessionKey)}
                            aria-expanded={isExpanded}
                            aria-label={`${isExpanded ? 'Tutup' : 'Lihat'} detail jawaban kuis ${getBookLabelId(
                              session.bookId
                            )}`}
                            className={`min-h-[34px] px-3 py-1.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                              isExpanded
                                ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-200'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {isExpanded ? (
                              <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                            )}
                            <span>{isExpanded ? 'Tutup' : 'Jawaban'}</span>
                          </button>
                        </div>
                      </div>

                      {/* Expanded Per-Question Answer Breakdown */}
                      {isExpanded ? (
                        <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/70 px-4 py-3.5 space-y-3">
                          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                            <span className="font-bold text-slate-700 dark:text-slate-200">
                              Detail Soal &amp; Jawaban ({answers.length} soal terekam)
                            </span>
                            {answers.length > 0 ? (
                              <div className="flex flex-wrap items-center gap-1.5">
                                {(
                                  [
                                    {
                                      id: 'all',
                                      label: `Semua (${answers.length})`,
                                      activeCls: 'bg-indigo-600 text-white border-indigo-600',
                                    },
                                    {
                                      id: 'correct',
                                      label: `Benar (${correctRecorded})`,
                                      activeCls: 'bg-emerald-600 text-white border-emerald-600',
                                    },
                                    {
                                      id: 'wrong',
                                      label: `Salah (${wrongRecorded})`,
                                      activeCls: 'bg-rose-600 text-white border-rose-600',
                                    },
                                  ] as const
                                ).map(f => {
                                  const active = quizAnswerFilter === f.id;
                                  return (
                                    <button
                                      key={f.id}
                                      type="button"
                                      onClick={() => setQuizAnswerFilter(f.id)}
                                      className={`min-h-[28px] px-2.5 py-0.5 rounded-lg border text-[11px] font-semibold cursor-pointer transition-colors ${
                                        active
                                          ? f.activeCls
                                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                      }`}
                                    >
                                      {f.label}
                                    </button>
                                  );
                                })}
                              </div>
                            ) : null}
                          </div>

                          {answers.length === 0 ? (
                            <p className="text-xs text-slate-500 dark:text-slate-400 italic py-2">
                              Sesi kuis ini hanya menyimpan ringkasan skor tanpa rincian nomor soal.
                            </p>
                          ) : filteredAnswers.length === 0 ? (
                            <p className="text-xs text-slate-500 dark:text-slate-400 italic py-2 text-center">
                              Tidak ada soal untuk filter ini.
                            </p>
                          ) : (
                            <div className="space-y-2.5 max-h-[26rem] overflow-y-auto pr-1">
                              {filteredAnswers.map(ans => {
                                const isLegacyChoice = isLegacyPlaceholderChoiceLabel(ans.chosenLabel);
                                return (
                                  <div
                                    key={`${sessionKey}-q${ans.no}-${ans.patternId}`}
                                    className={`rounded-xl border p-3.5 text-xs space-y-2 ${
                                      ans.correct
                                        ? 'border-emerald-200/90 dark:border-emerald-900/70 bg-white dark:bg-slate-950/75'
                                        : 'border-rose-200/90 dark:border-rose-900/80 bg-rose-50/40 dark:bg-rose-950/20'
                                    }`}
                                  >
                                    {/* Question Header */}
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className="flex flex-wrap items-center gap-1.5">
                                        <span className="font-mono-num font-bold text-slate-500 dark:text-slate-400">
                                          #{ans.no}
                                        </span>
                                        <span
                                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold border ${
                                            ans.correct
                                              ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                              : 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                          }`}
                                        >
                                          {ans.correct ? (
                                            <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                                          ) : (
                                            <XCircle className="w-3 h-3" aria-hidden="true" />
                                          )}
                                          {ans.correct ? 'Benar' : 'Salah'}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                                          {getQuizQuestionTypeLabelId(ans.type)}
                                        </span>
                                        {ans.chapterNumber ? (
                                          <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 font-mono-num font-semibold">
                                            Bab {ans.chapterNumber}
                                          </span>
                                        ) : null}
                                      </div>
                                      <span className="font-jp font-bold text-slate-900 dark:text-slate-100">
                                        {ans.patternTitle || ans.shortPattern}
                                      </span>
                                    </div>

                                    {/* Reconstructed Question Prompt & Sentence */}
                                    <div className="rounded-lg bg-slate-50 dark:bg-slate-900/90 border border-slate-200/70 dark:border-slate-800 px-3 py-2 space-y-1.5">
                                      {ans.promptText ? (
                                        <p className="text-[11px] font-medium text-slate-600 dark:text-slate-300">
                                          {ans.promptText}
                                        </p>
                                      ) : null}

                                      {ans.type === 'cloze' && ans.clozePromptJp ? (
                                        <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
                                          <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mr-1.5">
                                            Soal:
                                          </span>
                                          <JapaneseText
                                            text={ans.clozePromptJp}
                                            showFurigana={showFurigana}
                                          />
                                        </p>
                                      ) : null}

                                      {ans.exampleJp ? (
                                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1.5">
                                            {ans.type === 'cloze' ? 'Kalimat Lengkap:' : 'Contoh:'}
                                          </span>
                                          <JapaneseText
                                            text={ans.exampleJp}
                                            showFurigana={showFurigana}
                                          />
                                        </p>
                                      ) : null}

                                      {ans.translationId ? (
                                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                          Arti: &ldquo;{ans.translationId}&rdquo;
                                        </p>
                                      ) : null}
                                    </div>

                                    {/* Exact Learner Answer vs Correct Key */}
                                    {ans.correct ? (
                                      <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/35 px-3 py-2">
                                        <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                                          Jawaban Siswa (Benar):
                                        </p>
                                        <p className="font-jp text-xs font-bold text-emerald-900 dark:text-emerald-100 mt-0.5 break-words">
                                          {ans.chosenLabel || ans.expectedLabel}
                                        </p>
                                      </div>
                                    ) : (
                                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        <div className="rounded-lg border border-rose-200 dark:border-rose-800/80 bg-rose-50/80 dark:bg-rose-950/40 px-3 py-2">
                                          <p className="text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                                            Jawaban Diklik Siswa:
                                          </p>
                                          <p
                                            className={`mt-0.5 break-words ${
                                              isLegacyChoice
                                                ? 'text-[11px] italic text-rose-700/80 dark:text-rose-300/80'
                                                : 'font-jp text-xs font-bold text-rose-900 dark:text-rose-100'
                                            }`}
                                          >
                                            {ans.chosenLabel}
                                          </p>
                                        </div>

                                        <div className="rounded-lg border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/70 dark:bg-emerald-950/35 px-3 py-2">
                                          <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                                            Kunci Jawaban Benar:
                                          </p>
                                          <p className="font-jp text-xs font-bold text-emerald-900 dark:text-emerald-100 mt-0.5 break-words">
                                            {ans.expectedLabel}
                                          </p>
                                        </div>
                                      </div>
                                    )}

                                    {/* Formula & Function Coaching Metadata */}
                                    <div className="pt-1 border-t border-slate-200/70 dark:border-slate-800/80 space-y-0.5 text-[11px]">
                                      {ans.formula ? (
                                        <p className="font-mono text-indigo-700 dark:text-indigo-300">
                                          <span className="font-semibold">Rumus:</span> {ans.formula}
                                        </p>
                                      ) : null}
                                      {ans.functionText ? (
                                        <p className="text-slate-600 dark:text-slate-400">
                                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                                            Fungsi:{' '}
                                          </span>
                                          {ans.functionText}
                                        </p>
                                      ) : null}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-sm text-slate-500 dark:text-slate-400 py-8 text-center">
          Tidak dapat memuat detail pengguna.
        </p>
      )}
    </Modal>
  );
}
