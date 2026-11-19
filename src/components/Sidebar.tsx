import { BookMarked, CheckCircle2, ClipboardCheck, Layers, List } from 'lucide-react';
import type { AppTab, BookData, ChapterFilter } from '../types/bunpou';

interface SidebarProps {
  activeTab: AppTab;
  activeChapter: ChapterFilter;
  book: BookData;
  masteredSet: Set<string>;
  hardSet: Set<string>;
  onSelectTab: (tab: AppTab) => void;
  onSelectChapter: (chapter: ChapterFilter) => void;
}

const MODE_ITEMS: { id: AppTab; label: string; shortLabel: string; icon: typeof Layers }[] = [
  { id: 'card', label: 'Kartu Hafalan', shortLabel: 'Kartu', icon: Layers },
  { id: 'list', label: 'Daftar Bunpou', shortLabel: 'Daftar', icon: List },
  { id: 'quiz', label: 'Kuis Latihan', shortLabel: 'Kuis', icon: ClipboardCheck },
  { id: 'guide', label: 'Singkatan & Info', shortLabel: 'Singkatan', icon: BookMarked },
];

export function Sidebar({
  activeTab,
  activeChapter,
  book,
  masteredSet,
  hardSet,
  onSelectTab,
  onSelectChapter,
}: SidebarProps) {
  const totalBookPatterns = book.totalPatterns;
  const totalBookMastered = book.chapters.reduce(
    (sum, ch) => sum + ch.patterns.filter(p => masteredSet.has(p.id)).length,
    0
  );
  const totalBookHard = book.chapters.reduce(
    (sum, ch) => sum + ch.patterns.filter(p => hardSet.has(p.id)).length,
    0
  );
  const bookPct =
    totalBookPatterns > 0 ? Math.round((totalBookMastered / totalBookPatterns) * 100) : 0;
  const firstCh = book.chapters[0]?.chapterNumber ?? 1;
  const lastCh = book.chapters[book.chapters.length - 1]?.chapterNumber ?? 18;
  const allChaptersLabel = `Semua Bab (${firstCh}–${lastCh})`;

  return (
    <aside aria-label="Navigasi mode dan bab" className="space-y-4">
      {/* Mode Navigation Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-sm">
        <div
          role="tablist"
          aria-label="Mode belajar"
          className="grid grid-cols-4 lg:grid-cols-1 gap-1.5"
        >
          {MODE_ITEMS.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={isActive}
                onClick={() => onSelectTab(item.id)}
                className={`min-h-[42px] px-2.5 lg:px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-1 lg:gap-2.5 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="lg:hidden leading-tight">{item.shortLabel}</span>
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chapter Filter — visible for Kartu & Daftar */}
      {activeTab === 'card' || activeTab === 'list' ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Filter Bab ({book.shortTitle})
            </h2>
            <span className="text-xs font-mono-num font-bold text-emerald-700 dark:text-emerald-400">
              {bookPct}%
            </span>
          </div>

          {/* Mobile select dropdown */}
          <div className="lg:hidden">
            <label htmlFor="mobileChapterSelect" className="sr-only">
              Pilih Bab
            </label>
            <select
              id="mobileChapterSelect"
              value={activeChapter === 'all' ? 'all' : String(activeChapter)}
              onChange={e => {
                const val = e.target.value;
                onSelectChapter(val === 'all' ? 'all' : (Number(val) as ChapterFilter));
              }}
              className="w-full min-h-[42px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-semibold px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">
                {allChaptersLabel} · {totalBookMastered}/{totalBookPatterns} hafal
              </option>
              {book.chapters.map(ch => {
                const chMastered = ch.patterns.filter(p => masteredSet.has(p.id)).length;
                return (
                  <option key={ch.id} value={ch.chapterNumber}>
                    Bab {ch.chapterNumber}: {ch.titleJp} — {ch.titleId} ({chMastered}/
                    {ch.patterns.length})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Desktop vertical chapter list */}
          <div className="hidden lg:block space-y-1">
            <button
              type="button"
              id="btnChapter-all"
              onClick={() => onSelectChapter('all')}
              className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between gap-2 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                activeChapter === 'all'
                  ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <span>{allChaptersLabel}</span>
              <span className="font-mono-num text-[11px] font-bold">
                {totalBookMastered}/{totalBookPatterns}
              </span>
            </button>

            <div className="max-h-[460px] overflow-y-auto pr-1 space-y-1 pt-1">
              {book.chapters.map(ch => {
                const isSelected = activeChapter === ch.chapterNumber;
                const chMastered = ch.patterns.filter(p => masteredSet.has(p.id)).length;
                const chTotal = ch.patterns.length;
                const isComplete = chTotal > 0 && chMastered === chTotal;

                return (
                  <button
                    key={ch.id}
                    type="button"
                    id={`btnChapter-${ch.chapterNumber}`}
                    onClick={() => onSelectChapter(ch.chapterNumber as ChapterFilter)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500 border ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-900 dark:text-indigo-100 border-indigo-200 dark:border-indigo-800'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold flex items-center gap-1.5 min-w-0">
                        <span className="shrink-0">Bab {ch.chapterNumber}</span>
                        {isComplete ? (
                          <CheckCircle2
                            className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                            aria-label="Bab selesai"
                          />
                        ) : null}
                      </span>
                      <span className="text-[11px] font-mono-num font-semibold text-slate-500 dark:text-slate-400 shrink-0">
                        {chMastered}/{chTotal}
                      </span>
                    </div>
                    <p className="font-jp text-[11px] text-slate-700 dark:text-slate-300 truncate mt-0.5">
                      {ch.titleJp}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {ch.titleId}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>
              Hafal:{' '}
              <strong className="text-emerald-700 dark:text-emerald-400 font-mono-num">
                {totalBookMastered}
              </strong>
            </span>
            <span>
              Sulit:{' '}
              <strong className="text-amber-700 dark:text-amber-400 font-mono-num">
                {totalBookHard}
              </strong>
            </span>
            <span>
              Total:{' '}
              <strong className="text-slate-700 dark:text-slate-200 font-mono-num">
                {totalBookPatterns}
              </strong>
            </span>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
