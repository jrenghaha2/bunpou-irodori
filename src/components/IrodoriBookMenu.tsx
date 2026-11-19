import { BookOpen } from 'lucide-react';
import type { AllBooksProgress, BookData, BookId } from '../types/bunpou';

interface IrodoriBookMenuProps {
  books: BookData[];
  activeBookId: BookId;
  booksProgress: AllBooksProgress;
  onSelectBook: (bookId: BookId) => void;
}

const BOOK_ACCENTS: Record<BookId, { badge: string; activeRing: string; bar: string }> = {
  introductory: {
    badge: 'bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-200',
    activeRing:
      'bg-teal-50 dark:bg-teal-950/60 border-teal-500 dark:border-teal-500/80 text-teal-950 dark:text-teal-50 shadow-sm',
    bar: 'bg-teal-500 dark:bg-teal-400',
  },
  elementary1: {
    badge: 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200',
    activeRing:
      'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 dark:border-indigo-500/80 text-indigo-950 dark:text-indigo-50 shadow-sm',
    bar: 'bg-indigo-500 dark:bg-indigo-400',
  },
  elementary2: {
    badge: 'bg-violet-100 dark:bg-violet-900/60 text-violet-800 dark:text-violet-200',
    activeRing:
      'bg-violet-50 dark:bg-violet-950/60 border-violet-500 dark:border-violet-500/80 text-violet-950 dark:text-violet-50 shadow-sm',
    bar: 'bg-violet-500 dark:bg-violet-400',
  },
};

export function IrodoriBookMenu({
  books,
  activeBookId,
  booksProgress,
  onSelectBook,
}: IrodoriBookMenuProps) {
  return (
    <section
      aria-label="Pilih buku Irodori"
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 sm:p-2.5 shadow-sm"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {books.map(book => {
          const isActive = book.id === activeBookId;
          const bucket = booksProgress[book.id];
          const masteredCount = bucket?.mastered.size ?? 0;
          const total = book.totalPatterns;
          const pct = total > 0 ? Math.round((masteredCount / total) * 100) : 0;
          const accent = BOOK_ACCENTS[book.id];

          return (
            <button
              key={book.id}
              type="button"
              id={`btnBook-${book.id}`}
              aria-pressed={isActive}
              onClick={() => onSelectBook(book.id)}
              className={`w-full text-left rounded-xl border px-3.5 py-2.5 transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500 ${
                isActive
                  ? accent.activeRing
                  : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen
                    className={`w-4 h-4 shrink-0 ${
                      isActive
                        ? 'text-current'
                        : 'text-slate-400 dark:text-slate-500'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="font-bold text-sm truncate">{book.shortTitle}</span>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md text-[11px] font-bold shrink-0 ${accent.badge}`}
                >
                  {book.level}
                </span>
              </div>

              <div className="mt-1 flex items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
                <span className="font-jp truncate">{book.japaneseSubtitle}</span>
                <span className="font-mono-num font-semibold shrink-0 text-slate-700 dark:text-slate-300">
                  {masteredCount}/{total}
                </span>
              </div>

              <div className="mt-2 h-1.5 rounded-full bg-slate-200/80 dark:bg-slate-700/80 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${accent.bar}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
