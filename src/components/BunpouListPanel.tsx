import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Search,
  X,
} from 'lucide-react';
import type { BunpouPattern } from '../types/bunpou';
import { extractFuriganaReading, stripFuriganaMarkup } from '../utils/furiganaConverter';
import { AudioButton } from './AudioButton';
import { FormulaDisplay, FormulaLegend } from './FormulaDisplay';
import { JapaneseText } from './JapaneseText';

type ListStatusFilter = 'all' | 'unmastered' | 'mastered' | 'hard';

interface BunpouListPanelProps {
  patterns: BunpouPattern[];
  showFurigana: boolean;
  showTranslation: boolean;
  masteredSet: Set<string>;
  hardSet: Set<string>;
  bookShortTitle: string;
  chapterLabel: string;
  onToggleMastered: (patternId: string) => void;
  onToggleHard: (patternId: string) => void;
}

export function BunpouListPanel({
  patterns,
  showFurigana,
  showTranslation,
  masteredSet,
  hardSet,
  bookShortTitle,
  chapterLabel,
  onToggleMastered,
  onToggleHard,
}: BunpouListPanelProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ListStatusFilter>('all');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setQuery('');
    setStatusFilter('all');
    setExpandedIds(new Set());
  }, [bookShortTitle]);

  const indexedPatterns = useMemo(
    () =>
      patterns.map(p => ({
        pattern: p,
        haystack: [
          p.title,
          p.shortPattern,
          p.itemCode ?? '',
          p.topicJp ?? '',
          p.topicId ?? '',
          p.marugotoRef ?? '',
          p.functionText,
          p.chapterTitleId,
          p.chapterTitleJp,
          `bab ${p.chapterNumber}`,
          `第${p.chapterNumber}課`,
          ...p.formulas,
          ...p.notes,
          ...p.examples.map(
            e =>
              `${stripFuriganaMarkup(e.japanese)} ${extractFuriganaReading(e.japanese)} ${e.translation}`
          ),
        ]
          .join(' ')
          .toLowerCase(),
      })),
    [patterns]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return indexedPatterns
      .filter(({ pattern: p, haystack }) => {
        if (statusFilter === 'mastered' && !masteredSet.has(p.id)) return false;
        if (statusFilter === 'hard' && !hardSet.has(p.id)) return false;
        if (statusFilter === 'unmastered' && masteredSet.has(p.id)) return false;
        if (!q) return true;
        return haystack.includes(q);
      })
      .map(item => item.pattern);
  }, [indexedPatterns, query, statusFilter, masteredSet, hardSet]);

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const allExpanded =
    filtered.length > 0 && filtered.every(p => expandedIds.has(p.id));

  const handleToggleAll = () => {
    if (allExpanded) {
      setExpandedIds(new Set());
    } else {
      setExpandedIds(new Set(filtered.map(p => p.id)));
    }
  };

  return (
    <section aria-label="Daftar pola tata bahasa Irodori" className="space-y-4">
      {/* Search + Filters Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search
              className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              aria-hidden="true"
            />
            <label htmlFor="bunpouSearchInput" className="sr-only">
              Cari pola bunpou, rumus, fungsi, atau contoh kalimat
            </label>
            <input
              id="bunpouSearchInput"
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cari pola, rumus, fungsi, atau contoh (mis. たいです, izin, Bab 5)..."
              className="w-full min-h-[42px] pl-10 pr-9 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Hapus pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleToggleAll}
            disabled={filtered.length === 0}
            className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-45 shrink-0"
          >
            {allExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" aria-hidden="true" />
                <span>Tutup Semua</span>
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
                <span>Buka Semua</span>
              </>
            )}
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter status">
            {(
              [
                { id: 'all', label: 'Semua' },
                { id: 'unmastered', label: 'Belum Hafal' },
                { id: 'mastered', label: 'Sudah Hafal' },
                { id: 'hard', label: 'Perlu Review' },
              ] as const
            ).map(opt => {
              const active = statusFilter === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setStatusFilter(opt.id)}
                  aria-pressed={active}
                  className={`min-h-[34px] px-3 py-1 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    active
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Menampilkan{' '}
            <strong className="text-slate-900 dark:text-slate-100 font-mono-num">
              {filtered.length}
            </strong>{' '}
            dari{' '}
            <span className="font-mono-num">{patterns.length}</span> pola ({bookShortTitle} ·{' '}
            {chapterLabel})
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <FormulaLegend />
        </div>
      </div>

      {/* Results List */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm space-y-2">
          <p className="text-base font-bold text-slate-900 dark:text-slate-50">
            Tidak ada pola yang cocok
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Coba ubah kata kunci pencarian atau reset filter status.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setStatusFilter('all');
            }}
            className="mt-2 min-h-[38px] px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold cursor-pointer"
          >
            Reset Filter
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map(pattern => {
            const isMastered = masteredSet.has(pattern.id);
            const isHard = hardSet.has(pattern.id);
            const isOpen = expandedIds.has(pattern.id);

            return (
              <article
                key={pattern.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl transition-colors shadow-sm ${
                  isMastered
                    ? 'border-emerald-200 dark:border-emerald-800/70'
                    : isHard
                      ? 'border-amber-200 dark:border-amber-800/70'
                      : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => toggleExpand(pattern.id)}
                      aria-expanded={isOpen}
                      className="text-left flex-1 min-w-0 group cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500 rounded-lg"
                    >
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-bold">
                          Bab {pattern.chapterNumber} · #{pattern.itemCode ?? pattern.patternIndex}
                        </span>
                        {pattern.topicJp ? (
                          <span className="font-jp px-2 py-0.5 rounded-md bg-indigo-50/70 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 text-[11px] font-semibold truncate max-w-[160px]">
                            {pattern.topicJp}
                          </span>
                        ) : null}
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[240px]">
                          {pattern.chapterTitleJp} · {pattern.chapterTitleId}
                        </span>
                      </div>
                      <h3 className="font-jp text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 transition-colors">
                        {pattern.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                        {pattern.functionText}
                      </p>
                    </button>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onToggleHard(pattern.id)}
                        aria-pressed={isHard}
                        title={isHard ? 'Hapus tanda Sulit' : 'Tandai Perlu Review'}
                        className={`min-h-[36px] min-w-[36px] px-2.5 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                          isHard
                            ? 'bg-amber-500 border-amber-500 text-white'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-300 hover:text-amber-700 dark:hover:text-amber-300'
                        }`}
                      >
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span className="hidden sm:inline">Sulit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onToggleMastered(pattern.id)}
                        aria-pressed={isMastered}
                        title={isMastered ? 'Batalkan status Hafal' : 'Tandai Sudah Hafal'}
                        className={`min-h-[36px] min-w-[36px] px-2.5 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer ${
                          isMastered
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-emerald-300 hover:text-emerald-700 dark:hover:text-emerald-300'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                        <span className="hidden sm:inline">Hafal</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleExpand(pattern.id)}
                        aria-expanded={isOpen}
                        aria-label={isOpen ? 'Tutup detail pola' : 'Buka detail pola'}
                        className="min-h-[36px] min-w-[36px] p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 inline-flex items-center justify-center transition-colors cursor-pointer"
                      >
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4" aria-hidden="true" />
                        ) : (
                          <ChevronDown className="w-4 h-4" aria-hidden="true" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Compact Formula Preview always visible */}
                  <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 px-3 py-2">
                    <FormulaDisplay formulas={pattern.formulas} compact />
                  </div>

                  {/* Expanded Detail: Notes + Examples with Furigana & Audio */}
                  {isOpen ? (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                      {pattern.notes.length > 0 ? (
                        <div className="rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 p-3">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-1">
                            Catatan Penting
                          </p>
                          <ul className="space-y-1 text-xs sm:text-sm text-slate-700 dark:text-slate-200 list-disc pl-4">
                            {pattern.notes.map((note, idx) => (
                              <li key={idx}>{note}</li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                          Contoh Kalimat ({pattern.examples.length})
                        </p>
                        {pattern.examples.map((ex, idx) => (
                          <div
                            key={idx}
                            className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/70 p-3 flex items-start justify-between gap-3"
                          >
                            <div className="min-w-0 space-y-1">
                              <p className="text-sm sm:text-base text-slate-900 dark:text-slate-50 font-medium">
                                <JapaneseText text={ex.japanese} showFurigana={showFurigana} />
                              </p>
                              {showTranslation && ex.translation ? (
                                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                                  {ex.translation}
                                </p>
                              ) : null}
                            </div>
                            <AudioButton text={ex.japanese} label="Dengar" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
