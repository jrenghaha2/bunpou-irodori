import { useRef, type MouseEvent, type PointerEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
  Sparkles,
} from 'lucide-react';
import type { BunpouPattern, DeckStatusFilter } from '../types/bunpou';
import { AudioButton } from './AudioButton';
import { FormulaDisplay } from './FormulaDisplay';
import { JapaneseText } from './JapaneseText';

interface FlashcardPanelProps {
  deck: BunpouPattern[];
  currentIndex: number;
  isFlipped: boolean;
  showFurigana: boolean;
  showTranslation: boolean;
  deckFilter: DeckStatusFilter;
  masteredSet: Set<string>;
  hardSet: Set<string>;
  bookShortTitle: string;
  chapterLabel: string;
  onChangeDeckFilter: (filter: DeckStatusFilter) => void;
  onFlip: () => void;
  onPrev: () => void;
  onNext: () => void;
  onShuffle: () => void;
  onMarkMastered: (patternId: string) => void;
  onMarkHard: (patternId: string) => void;
  onResetBookProgress: () => void;
}

export function FlashcardPanel({
  deck,
  currentIndex,
  isFlipped,
  showFurigana,
  showTranslation,
  deckFilter,
  masteredSet,
  hardSet,
  bookShortTitle,
  chapterLabel,
  onChangeDeckFilter,
  onFlip,
  onPrev,
  onNext,
  onShuffle,
  onMarkMastered,
  onMarkHard,
  onResetBookProgress,
}: FlashcardPanelProps) {
  const safeIdx = deck.length > 0 ? Math.min(currentIndex, deck.length - 1) : 0;
  const current = deck[safeIdx] ?? null;
  const isMastered = current ? masteredSet.has(current.id) : false;
  const isHard = current ? hardSet.has(current.id) : false;

  const pointerDownPosRef = useRef<{ x: number; y: number } | null>(null);
  const didDragSelectRef = useRef(false);

  const handleCardPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    pointerDownPosRef.current = { x: e.clientX, y: e.clientY };
    didDragSelectRef.current = false;
  };

  const handleCardPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const start = pointerDownPosRef.current;
    if (!start) return;
    if (Math.hypot(e.clientX - start.x, e.clientY - start.y) > 5) {
      didDragSelectRef.current = true;
    }
  };

  const handleCardPointerUp = () => {
    pointerDownPosRef.current = null;
  };

  const handleCardPointerCancel = () => {
    pointerDownPosRef.current = null;
    didDragSelectRef.current = false;
  };

  const handleCardClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement | null;
    if (target?.closest('button, a, input, select, textarea')) return;

    const wasDrag = didDragSelectRef.current;
    didDragSelectRef.current = false;
    const selectedText = window.getSelection?.()?.toString().trim() ?? '';
    if (wasDrag || selectedText.length > 0) return;

    onFlip();
  };

  return (
    <section aria-label="Kartu hafalan bunpou" className="space-y-4">
      {/* Top Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter kartu">
          {(
            [
              { id: 'all', label: 'Semua' },
              { id: 'unmastered', label: 'Belum Hafal' },
              { id: 'hard', label: 'Tanda Sulit' },
            ] as const
          ).map(opt => {
            const active = deckFilter === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeDeckFilter(opt.id)}
                aria-pressed={active}
                className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-indigo-500 ${
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

        <div className="flex items-center gap-2 ml-auto">
          <span
            id="cardCounter"
            className="text-xs sm:text-sm font-mono-num font-bold text-slate-600 dark:text-slate-300 px-2"
          >
            {deck.length > 0 ? `${safeIdx + 1} / ${deck.length}` : '0 / 0'}
          </span>

          <button
            type="button"
            id="btnShuffleDeck"
            onClick={onShuffle}
            disabled={deck.length < 2}
            className="min-h-[36px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-45"
          >
            <Shuffle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>Acak</span>
          </button>

          <button
            type="button"
            id="btnResetProgress"
            onClick={onResetBookProgress}
            title={`Reset progres ${bookShortTitle}`}
            className="min-h-[36px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-slate-600 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 hover:border-rose-200 dark:hover:border-rose-800 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {!current ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 sm:p-12 text-center shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 inline-flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" aria-hidden="true" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50">
            {deckFilter === 'hard'
              ? 'Tidak ada pola bertanda Sulit di cakupan ini'
              : deckFilter === 'unmastered'
                ? 'Semua pola di cakupan ini sudah Hafal!'
                : 'Belum ada kartu untuk cakupan ini'}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {chapterLabel} · {bookShortTitle}. Anda bisa menampilkan kembali semua kartu untuk
            mengulang latihan.
          </p>
          <button
            type="button"
            onClick={() => onChangeDeckFilter('all')}
            className="mt-2 min-h-[42px] px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            Tampilkan Semua Kartu
          </button>
        </div>
      ) : (
        <>
          {/* 3D Flip Card */}
          <div className="perspective-1200">
            <div
              id="flashcardContainer"
              role="button"
              tabIndex={0}
              aria-pressed={isFlipped}
              aria-label={
                isFlipped
                  ? `Sisi belakang kartu ${current.title}. Klik untuk membalik ke depan.`
                  : `Sisi depan kartu ${current.title}. Klik untuk melihat rumus dan contoh.`
              }
              onPointerDown={handleCardPointerDown}
              onPointerMove={handleCardPointerMove}
              onPointerUp={handleCardPointerUp}
              onPointerCancel={handleCardPointerCancel}
              onClick={handleCardClick}
              onKeyDown={e => {
                if (e.target !== e.currentTarget) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  onFlip();
                }
              }}
              className={`card-flip-inner relative w-full min-h-[380px] sm:min-h-[420px] cursor-pointer select-text focus-visible:outline-2 focus-visible:outline-indigo-500 rounded-3xl ${
                isFlipped ? 'is-flipped' : ''
              }`}
            >
              {/* FRONT FACE */}
              <div className="card-face absolute inset-0 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-5 sm:p-8 flex flex-col justify-between">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold">
                      {current.bookShortTitle} · Bab {current.chapterNumber}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate max-w-[220px] sm:max-w-[320px]">
                      {current.chapterTitleId}
                    </span>
                  </div>

                  {isMastered ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      Sudah Hafal
                    </span>
                  ) : isHard ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/70 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-bold">
                      <AlertCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      Perlu Review
                    </span>
                  ) : null}
                </div>

                <div className="my-auto py-6 text-center space-y-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
                    Pola Tata Bahasa #{current.itemCode ?? current.patternIndex}
                    {current.topicJp ? ` · ${current.topicJp}` : ''}
                  </p>
                  <h2
                    id="flashcardFrontTitle"
                    className="font-jp text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-slate-50 leading-snug break-words"
                  >
                    {current.shortPattern}
                  </h2>
                  {current.title !== current.shortPattern ? (
                    <p className="text-sm sm:text-base font-medium text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
                      {current.title}
                    </p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-jp truncate">{current.chapterTitleJp}</span>
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 shrink-0">
                    Klik / Spasi untuk balik →
                  </span>
                </div>
              </div>

              {/* BACK FACE */}
              <div className="card-face card-face-back absolute inset-0 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-200 dark:border-indigo-800/80 shadow-sm p-5 sm:p-7 flex flex-col overflow-y-auto">
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                      Bab {current.chapterNumber} · Rumus &amp; Fungsi
                    </span>
                    <h3 className="font-jp text-base sm:text-lg font-bold text-slate-900 dark:text-slate-50 truncate">
                      {current.title}
                    </h3>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-medium shrink-0">
                    Klik untuk tutup
                  </span>
                </div>

                <div className="py-4 space-y-4 flex-1">
                  {/* Formula */}
                  <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/70 p-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                      Rumus Penyambungan
                    </p>
                    <FormulaDisplay formulas={current.formulas} />
                  </div>

                  {/* Function */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                      Fungsi &amp; Makna
                    </p>
                    <p className="text-sm sm:text-[15px] text-slate-800 dark:text-slate-100 leading-relaxed font-medium">
                      {current.functionText}
                    </p>
                    {current.notes.length > 0 ? (
                      <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-300 list-disc pl-4">
                        {current.notes.map((note, idx) => (
                          <li key={idx}>{note}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>

                  {/* Examples */}
                  {current.examples.length > 0 ? (
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Contoh Kalimat ({current.examples.length})
                      </p>
                      <div className="space-y-2">
                        {current.examples.map((ex, idx) => (
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
              </div>
            </div>
          </div>

          {/* Action Controls */}
          <div className="grid grid-cols-2 sm:grid-cols-[auto_1fr_1fr_auto] gap-2.5 items-center">
            <button
              type="button"
              id="btnPrevCard"
              onClick={onPrev}
              disabled={deck.length < 2}
              aria-label="Kartu sebelumnya"
              className="min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-45 order-3 sm:order-1"
            >
              <ChevronLeft className="w-4 h-4" aria-hidden="true" />
              <span>Sebelumnya</span>
            </button>

            <button
              type="button"
              id="btnMarkHard"
              onClick={() => onMarkHard(current.id)}
              aria-pressed={isHard}
              className={`min-h-[46px] px-4 py-2.5 rounded-xl border text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer order-1 sm:order-2 ${
                isHard
                  ? 'bg-amber-500 border-amber-500 text-white shadow-sm'
                  : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 hover:bg-amber-100 dark:hover:bg-amber-900/60'
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{isHard ? 'Ditandai Sulit' : 'Ulangi / Sulit'}</span>
            </button>

            <button
              type="button"
              id="btnMarkMastered"
              onClick={() => onMarkMastered(current.id)}
              aria-pressed={isMastered}
              className={`min-h-[46px] px-4 py-2.5 rounded-xl border text-sm font-bold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer order-2 sm:order-3 ${
                isMastered
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-100 dark:hover:bg-emerald-900/60'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>{isMastered ? 'Sudah Hafal' : 'Tandai Hafal'}</span>
            </button>

            <button
              type="button"
              id="btnNextCard"
              onClick={onNext}
              disabled={deck.length < 2}
              aria-label="Kartu berikutnya"
              className="min-h-[46px] px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-sm inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-45 order-4"
            >
              <span>Berikutnya</span>
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>

          <p className="hidden sm:block text-center text-xs text-slate-400 dark:text-slate-500">
            Pintasan keyboard: <kbd className="font-mono-num px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">Spasi</kbd> Balik ·{' '}
            <kbd className="font-mono-num px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">←</kbd>{' '}
            <kbd className="font-mono-num px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">→</kbd> Pindah ·{' '}
            <kbd className="font-mono-num px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">H</kbd> Hafal ·{' '}
            <kbd className="font-mono-num px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">U</kbd> Sulit
          </p>
        </>
      )}
    </section>
  );
}
