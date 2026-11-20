import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  AppTab,
  BookData,
  BookId,
  BunpouPattern,
  ChapterFilter,
  DeckStatusFilter,
} from '../types/bunpou';
import { shuffled } from '../utils/quizGenerator';
import { stopSpeaking } from '../utils/speech';
import type { ShowToastFn } from './useToast';

const INTERACTIVE_SHORTCUT_EXCLUSION_SELECTOR =
  'input, textarea, select, button, a, summary, [contenteditable="true"], [role="button"], [role="menuitem"], [role="tab"]';

interface UseFlashcardDeckOptions {
  activeBookId: BookId;
  activeBook: BookData;
  activeTab: AppTab;
  activeChapter: ChapterFilter;
  activeMastered: Set<string>;
  activeHardSet: Set<string>;
  shortcutsDisabled: boolean;
  onToggleMastered: (patternId: string) => void;
  onToggleHard: (patternId: string) => void;
  showToast: ShowToastFn;
}

export function useFlashcardDeck({
  activeBookId,
  activeBook,
  activeTab,
  activeChapter,
  activeMastered,
  activeHardSet,
  shortcutsDisabled,
  onToggleMastered,
  onToggleHard,
  showToast,
}: UseFlashcardDeckOptions) {
  const [deckFilter, setDeckFilter] = useState<DeckStatusFilter>('all');
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffleOrder, setShuffleOrder] = useState<string[] | null>(null);

  const scopedPatterns = useMemo<BunpouPattern[]>(() => {
    if (activeChapter === 'all') {
      return activeBook.chapters.flatMap(ch => ch.patterns);
    }
    const ch = activeBook.chapters.find(c => c.chapterNumber === activeChapter);
    return ch ? ch.patterns : [];
  }, [activeBook, activeChapter]);

  const flashcardDeck = useMemo<BunpouPattern[]>(() => {
    const base = scopedPatterns.filter(p => {
      if (deckFilter === 'unmastered') return !activeMastered.has(p.id);
      if (deckFilter === 'hard') return activeHardSet.has(p.id);
      return true;
    });
    if (!shuffleOrder) return base;
    const rank = new Map(shuffleOrder.map((id, i) => [id, i]));
    return [...base].sort((a, b) => (rank.get(a.id) ?? 9999) - (rank.get(b.id) ?? 9999));
  }, [scopedPatterns, deckFilter, activeMastered, activeHardSet, shuffleOrder]);

  useEffect(() => {
    if (cardIndex >= flashcardDeck.length && flashcardDeck.length > 0) {
      setCardIndex(flashcardDeck.length - 1);
    }
  }, [cardIndex, flashcardDeck.length]);

  // Stop any playing TTS utterance when changing book, tab, chapter, or card
  useEffect(() => {
    stopSpeaking();
  }, [activeBookId, activeTab, activeChapter, cardIndex]);

  const handleChangeDeckFilter = useCallback((next: DeckStatusFilter) => {
    stopSpeaking();
    setDeckFilter(next);
    setCardIndex(0);
    setIsFlipped(false);
  }, []);

  const handleFlipCard = useCallback(() => {
    setIsFlipped(f => !f);
  }, []);

  const handlePrevCard = useCallback(() => {
    if (flashcardDeck.length < 2) return;
    stopSpeaking();
    setIsFlipped(false);
    setCardIndex(prev => (prev - 1 + flashcardDeck.length) % flashcardDeck.length);
  }, [flashcardDeck.length]);

  const handleNextCard = useCallback(() => {
    if (flashcardDeck.length < 2) return;
    stopSpeaking();
    setIsFlipped(false);
    setCardIndex(prev => (prev + 1) % flashcardDeck.length);
  }, [flashcardDeck.length]);

  const handleShuffleDeck = useCallback(() => {
    if (flashcardDeck.length < 2) return;
    stopSpeaking();
    const ids = shuffled(flashcardDeck.map(p => p.id));
    setShuffleOrder(ids);
    setCardIndex(0);
    setIsFlipped(false);
    showToast('info', 'Kartu Diacak', `Urutan ${ids.length} kartu telah diperbarui.`);
  }, [flashcardDeck, showToast]);

  const resetDeckForBook = useCallback(() => {
    setDeckFilter('all');
    setCardIndex(0);
    setIsFlipped(false);
    setShuffleOrder(null);
  }, []);

  const resetDeckForChapter = useCallback(() => {
    setCardIndex(0);
    setIsFlipped(false);
    setShuffleOrder(null);
  }, []);

  const resetDeckToFirst = useCallback(() => {
    setCardIndex(0);
    setIsFlipped(false);
  }, []);

  const resetDeckAfterBookReset = useCallback(() => {
    setDeckFilter('all');
    setCardIndex(0);
    setIsFlipped(false);
  }, []);

  // Keyboard shortcuts for Flashcard mode (ignores inputs, buttons, links, and interactive controls)
  useEffect(() => {
    if (activeTab !== 'card' || shortcutsDisabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          Boolean(target.closest(INTERACTIVE_SHORTCUT_EXCLUSION_SELECTOR)))
      ) {
        return;
      }

      const currentCard = flashcardDeck[Math.min(cardIndex, Math.max(0, flashcardDeck.length - 1))];
      if (!currentCard) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsFlipped(f => !f);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextCard();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevCard();
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        onToggleMastered(currentCard.id);
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        onToggleHard(currentCard.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeTab,
    shortcutsDisabled,
    flashcardDeck,
    cardIndex,
    handleNextCard,
    handlePrevCard,
    onToggleMastered,
    onToggleHard,
  ]);

  return {
    deckFilter,
    cardIndex,
    isFlipped,
    scopedPatterns,
    flashcardDeck,
    handleChangeDeckFilter,
    handleFlipCard,
    handlePrevCard,
    handleNextCard,
    handleShuffleDeck,
    resetDeckForBook,
    resetDeckForChapter,
    resetDeckToFirst,
    resetDeckAfterBookReset,
  };
}
