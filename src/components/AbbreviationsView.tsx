import { BookMarked, CheckCircle2, Layers } from 'lucide-react';
import type { AbbreviationItem, AllBooksProgress, BookData } from '../types/bunpou';
import { FormulaLegend } from './FormulaDisplay';

interface AbbreviationsViewProps {
  abbreviations: AbbreviationItem[];
  books: BookData[];
  booksProgress: AllBooksProgress;
}

export function AbbreviationsView({
  abbreviations,
  books,
  booksProgress,
}: AbbreviationsViewProps) {
  const totalAllPatterns = books.reduce((sum, b) => sum + b.totalPatterns, 0);
  const totalAllChapters = books.reduce((sum, b) => sum + b.chapters.length, 0);
  const totalAllMastered = books.reduce(
    (sum, b) => sum + (booksProgress[b.id]?.mastered.size ?? 0),
    0
  );
  const totalAllHard = books.reduce(
    (sum, b) => sum + (booksProgress[b.id]?.hard.size ?? 0),
    0
  );
  const overallPct =
    totalAllPatterns > 0 ? Math.round((totalAllMastered / totalAllPatterns) * 100) : 0;

  return (
    <section aria-label="Panduan singkatan rumus dan ringkasan buku" className="space-y-5">
      {/* Overall Progress Summary across 3 Irodori Books */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 inline-flex items-center justify-center">
              <Layers className="w-5 h-5" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50">
                Ringkasan Progres 3 Buku Irodori (A1–A2)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {totalAllChapters} Bab tata bahasa · {totalAllPatterns} pola bunpou
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold">
            <span className="text-emerald-700 dark:text-emerald-400 font-mono-num">
              {totalAllMastered}/{totalAllPatterns} hafal ({overallPct}%)
            </span>
            <span className="text-amber-700 dark:text-amber-400 font-mono-num">
              {totalAllHard} sulit
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {books.map(book => {
            const bucket = booksProgress[book.id];
            const masteredCount = bucket?.mastered.size ?? 0;
            const hardCount = bucket?.hard.size ?? 0;
            const pct =
              book.totalPatterns > 0 ? Math.round((masteredCount / book.totalPatterns) * 100) : 0;

            return (
              <div
                key={book.id}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 p-3.5 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-50">
                    {book.shortTitle}
                  </span>
                  <span className="text-xs font-mono-num font-bold text-indigo-700 dark:text-indigo-300">
                    {pct}%
                  </span>
                </div>
                <p className="text-xs font-jp text-slate-500 dark:text-slate-400">
                  {book.japaneseSubtitle} · Bab {book.chapters[0]?.chapterNumber ?? 1}–
                  {book.chapters[book.chapters.length - 1]?.chapterNumber ?? 18} (
                  {book.chapters.length} Bab)
                </p>
                <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono-num">
                  <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" aria-hidden="true" />
                    {masteredCount}/{book.totalPatterns} hafal
                  </span>
                  <span>{hardCount} sulit</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Abbreviations Guide */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 inline-flex items-center justify-center">
            <BookMarked className="w-5 h-5" aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50">
              Daftar Singkatan Rumus Tata Bahasa ({abbreviations.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Panduan membaca simbol kelas kata dan konjugasi pada seluruh buku Irodori.
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 p-3">
          <FormulaLegend />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {abbreviations.map((item, idx) => (
            <div
              key={`${item.code}-${idx}`}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 px-3.5 py-2.5 flex items-start gap-3"
            >
              <span className="px-2 py-0.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 font-jp font-bold text-xs shrink-0 mt-0.5">
                {item.code}
              </span>
              <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {item.meaning}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
