import { useCallback, useEffect, useMemo, useState } from 'react';
import { AbbreviationsView } from './components/AbbreviationsView';
import { AppHeader } from './components/AppHeader';
import { AuthModal } from './components/AuthModal';
import { BunpouListPanel } from './components/BunpouListPanel';
import { FlashcardPanel, type DeckStatusFilter } from './components/FlashcardPanel';
import { IrodoriBookMenu } from './components/IrodoriBookMenu';
import { ProfileModal } from './components/ProfileModal';
import { QuizPanel } from './components/QuizPanel';
import { RestoreModal } from './components/RestoreModal';
import { Sidebar } from './components/Sidebar';
import { ToastBanner } from './components/ToastBanner';
import { IRODORI_DATASET } from './data/irodoriDataset';
import { useAuthActions } from './hooks/useAuthActions';
import { useBackupRestore } from './hooks/useBackupRestore';
import { useCloudProgressSync } from './hooks/useCloudProgressSync';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';
import type {
  AppTab,
  BookId,
  BunpouPattern,
  ChapterFilter,
} from './types/bunpou';
import { shuffled } from './utils/quizGenerator';

const FURIGANA_STORAGE_KEY = 'irodori_bunpou_furigana_v1';

function loadInitialFurigana(): boolean {
  try {
    const saved = window.localStorage.getItem(FURIGANA_STORAGE_KEY);
    if (saved === '0' || saved === 'false') return false;
    return true;
  } catch {
    return true;
  }
}

export default function App() {
  const dataset = IRODORI_DATASET;

  const [activeBookId, setActiveBookId] = useState<BookId>('introductory');
  const [activeTab, setActiveTab] = useState<AppTab>('card');
  const [activeChapter, setActiveChapter] = useState<ChapterFilter>('all');
  const [showFurigana, setShowFurigana] = useState<boolean>(loadInitialFurigana);

  // Flashcard state
  const [deckFilter, setDeckFilter] = useState<DeckStatusFilter>('all');
  const [cardIndex, setCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [shuffleOrder, setShuffleOrder] = useState<string[] | null>(null);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const { isDark, toggleTheme } = useTheme();
  const { toast, showToast, dismissToast } = useToast();

  const toggleFurigana = useCallback(() => {
    setShowFurigana(prev => {
      const next = !prev;
      try {
        window.localStorage.setItem(FURIGANA_STORAGE_KEY, next ? '1' : '0');
      } catch {
        // Ignore storage errors
      }
      return next;
    });
  }, []);

  const validIdsByBook = useMemo<Record<BookId, Set<string>>>(() => {
    const map: Record<BookId, Set<string>> = {
      introductory: new Set(),
      elementary1: new Set(),
      elementary2: new Set(),
    };
    if (dataset) {
      for (const p of dataset.allPatterns) {
        map[p.bookId].add(p.id);
      }
    }
    return map;
  }, [dataset]);

  const patternById = useMemo<Map<string, BunpouPattern>>(() => {
    const map = new Map<string, BunpouPattern>();
    if (dataset) {
      for (const p of dataset.allPatterns) {
        map.set(p.id, p);
      }
    }
    return map;
  }, [dataset]);

  const authActions = useAuthActions({ showToast });

  const cloudSync = useCloudProgressSync({
    user: authActions.user,
    authReady: authActions.authReady,
    authVersion: authActions.authVersion,
    justSignedInRef: authActions.justSignedInRef,
    activeTab,
    activeBookId,
    validIdsByBook,
    patternById,
    datasetReady: Boolean(dataset),
    bumpAuthVersion: authActions.bumpAuthVersion,
    showToast,
  });

  if (cloudSync.fatalError) {
    throw cloudSync.fatalError;
  }

  const activeBook = useMemo(() => {
    return dataset.books.find(b => b.id === activeBookId) ?? dataset.books[0];
  }, [dataset, activeBookId]);

  const activeBucket = cloudSync.booksProgress[activeBookId];
  const activeMastered = activeBucket.mastered;
  const activeHardSet = activeBucket.hard;
  const activeValidIds = validIdsByBook[activeBookId];

  const backupRestore = useBackupRestore({
    bookId: activeBookId,
    activeMastered,
    activeHardSet,
    activeValidIds,
    applyProgressChange: (m, h) => cloudSync.applyProgressChange(m, h, activeBookId),
    onRestoreCommitted: () => {
      setCardIndex(0);
      setIsFlipped(false);
    },
    showToast,
    dismissToast,
  });

  // Patterns in active book & selected chapter
  const scopedPatterns = useMemo<BunpouPattern[]>(() => {
    if (!activeBook) return [];
    if (activeChapter === 'all') {
      return activeBook.chapters.flatMap(ch => ch.patterns);
    }
    const ch = activeBook.chapters.find(c => c.chapterNumber === activeChapter);
    return ch ? ch.patterns : [];
  }, [activeBook, activeChapter]);

  // Flashcard deck (filtered by deckFilter & optional shuffleOrder)
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

  const handleSelectBook = useCallback((nextBookId: BookId) => {
    setActiveBookId(nextBookId);
    setActiveChapter('all');
    setDeckFilter('all');
    setCardIndex(0);
    setIsFlipped(false);
    setShuffleOrder(null);
  }, []);

  const handleSelectChapter = useCallback((nextChapter: ChapterFilter) => {
    setActiveChapter(nextChapter);
    setCardIndex(0);
    setIsFlipped(false);
    setShuffleOrder(null);
  }, []);

  const handleToggleMastered = useCallback(
    (patternId: string) => {
      const nextM = new Set(activeMastered);
      const nextH = new Set(activeHardSet);
      if (nextM.has(patternId)) {
        nextM.delete(patternId);
      } else {
        nextM.add(patternId);
        nextH.delete(patternId);
      }
      cloudSync.applyProgressChange(nextM, nextH, activeBookId);
    },
    [activeMastered, activeHardSet, activeBookId, cloudSync]
  );

  const handleToggleHard = useCallback(
    (patternId: string) => {
      const nextM = new Set(activeMastered);
      const nextH = new Set(activeHardSet);
      if (nextH.has(patternId)) {
        nextH.delete(patternId);
      } else {
        nextH.add(patternId);
        nextM.delete(patternId);
      }
      cloudSync.applyProgressChange(nextM, nextH, activeBookId);
    },
    [activeMastered, activeHardSet, activeBookId, cloudSync]
  );

  const handlePrevCard = useCallback(() => {
    if (flashcardDeck.length < 2) return;
    setIsFlipped(false);
    setCardIndex(prev => (prev - 1 + flashcardDeck.length) % flashcardDeck.length);
  }, [flashcardDeck.length]);

  const handleNextCard = useCallback(() => {
    if (flashcardDeck.length < 2) return;
    setIsFlipped(false);
    setCardIndex(prev => (prev + 1) % flashcardDeck.length);
  }, [flashcardDeck.length]);

  const handleShuffleDeck = useCallback(() => {
    if (flashcardDeck.length < 2) return;
    const ids = shuffled(flashcardDeck.map(p => p.id));
    setShuffleOrder(ids);
    setCardIndex(0);
    setIsFlipped(false);
    showToast('info', 'Kartu Diacak', `Urutan ${ids.length} kartu telah diperbarui.`);
  }, [flashcardDeck, showToast]);

  const handleConfirmResetBook = useCallback(() => {
    cloudSync.applyProgressChange(new Set(), new Set(), activeBookId);
    setDeckFilter('all');
    setCardIndex(0);
    setIsFlipped(false);
    setResetConfirmOpen(false);
    showToast(
      'info',
      'Progres Buku Direset',
      `Status hafal & sulit untuk ${activeBook?.shortTitle ?? 'buku ini'} telah dikosongkan.`
    );
  }, [activeBook?.shortTitle, activeBookId, cloudSync, showToast]);

  const handleSignOut = useCallback(() => {
    void authActions.executeSignOut(() => {
      cloudSync.resetCloudAndLocalProgress();
      backupRestore.clearPendingRestore();
      setCardIndex(0);
      setIsFlipped(false);
    });
  }, [authActions, cloudSync, backupRestore]);

  // Keyboard shortcuts for Flashcard mode
  useEffect(() => {
    if (
      activeTab !== 'card' ||
      authActions.authModalOpen ||
      cloudSync.profileModalOpen ||
      Boolean(backupRestore.pendingRestore) ||
      resetConfirmOpen
    ) {
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
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
        handleToggleMastered(currentCard.id);
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        handleToggleHard(currentCard.id);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    activeTab,
    authActions.authModalOpen,
    cloudSync.profileModalOpen,
    backupRestore.pendingRestore,
    resetConfirmOpen,
    flashcardDeck,
    cardIndex,
    handleNextCard,
    handlePrevCard,
    handleToggleMastered,
    handleToggleHard,
  ]);

  const chapterLabel = useMemo(() => {
    if (!activeBook) return 'Semua Bab';
    if (activeChapter === 'all') {
      const firstCh = activeBook.chapters[0]?.chapterNumber ?? 1;
      const lastCh = activeBook.chapters[activeBook.chapters.length - 1]?.chapterNumber ?? 18;
      return `Semua Bab (${firstCh}–${lastCh})`;
    }
    const ch = activeBook.chapters.find(c => c.chapterNumber === activeChapter);
    return ch ? `Bab ${ch.chapterNumber}: ${ch.titleId}` : `Bab ${activeChapter}`;
  }, [activeBook, activeChapter]);

  const totalChaptersCount = useMemo(
    () => dataset.books.reduce((sum, b) => sum + b.chapters.length, 0),
    [dataset]
  );

  const totalExamplesCount = useMemo(
    () => dataset.allPatterns.reduce((sum, p) => sum + p.examples.length, 0),
    [dataset]
  );

  const resolvedDisplayName =
    cloudSync.customDisplayName ||
    authActions.user?.displayName ||
    authActions.user?.email?.split('@')[0] ||
    '';
  const resolvedAvatarUrl = cloudSync.customAvatarUrl || authActions.user?.photoURL || '';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors">
      <AppHeader
        bookShortTitle={activeBook.shortTitle}
        showFurigana={showFurigana}
        onToggleFurigana={toggleFurigana}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        masteredCount={activeMastered.size}
        totalCount={activeBook.totalPatterns}
        restoreBtnRef={backupRestore.restoreBtnRef}
        fileInputRef={backupRestore.fileInputRef}
        user={authActions.user}
        displayName={resolvedDisplayName}
        avatarUrl={resolvedAvatarUrl}
        authReady={authActions.authReady}
        authBusy={authActions.authBusy}
        syncing={cloudSync.syncing}
        onOpenAuthModal={authActions.handleOpenAuthModal}
        onOpenProfileModal={() => cloudSync.setProfileModalOpen(true)}
        onManualSync={() => void cloudSync.handleManualSync()}
        onResendVerification={() => void authActions.handleResendVerification()}
        onRefreshVerification={() => void authActions.handleRefreshVerification()}
        onSignOut={handleSignOut}
        onExport={backupRestore.handleExport}
        onTriggerImport={backupRestore.handleTriggerImport}
        onFileSelected={backupRestore.handleFileSelected}
      />

      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-5">
        <IrodoriBookMenu
          books={dataset.books}
          activeBookId={activeBookId}
          booksProgress={cloudSync.booksProgress}
          onSelectBook={handleSelectBook}
        />

        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-4 sm:gap-6 items-start">
          <Sidebar
            activeTab={activeTab}
            activeChapter={activeChapter}
            book={activeBook}
            masteredSet={activeMastered}
            hardSet={activeHardSet}
            onSelectTab={setActiveTab}
            onSelectChapter={handleSelectChapter}
          />

          <div className="min-w-0">
            {activeTab === 'card' ? (
              <FlashcardPanel
                deck={flashcardDeck}
                currentIndex={cardIndex}
                isFlipped={isFlipped}
                showFurigana={showFurigana}
                deckFilter={deckFilter}
                masteredSet={activeMastered}
                hardSet={activeHardSet}
                bookShortTitle={activeBook.shortTitle}
                chapterLabel={chapterLabel}
                onChangeDeckFilter={next => {
                  setDeckFilter(next);
                  setCardIndex(0);
                  setIsFlipped(false);
                }}
                onFlip={() => setIsFlipped(f => !f)}
                onPrev={handlePrevCard}
                onNext={handleNextCard}
                onShuffle={handleShuffleDeck}
                onMarkMastered={handleToggleMastered}
                onMarkHard={handleToggleHard}
                onResetBookProgress={() => setResetConfirmOpen(true)}
              />
            ) : activeTab === 'list' ? (
              <BunpouListPanel
                patterns={scopedPatterns}
                showFurigana={showFurigana}
                masteredSet={activeMastered}
                hardSet={activeHardSet}
                bookShortTitle={activeBook.shortTitle}
                chapterLabel={chapterLabel}
                onToggleMastered={handleToggleMastered}
                onToggleHard={handleToggleHard}
              />
            ) : activeTab === 'quiz' ? (
              <QuizPanel
                book={activeBook}
                allPatterns={dataset.allPatterns}
                showFurigana={showFurigana}
                history={cloudSync.quizHistories[activeBookId] ?? []}
                historySyncing={cloudSync.quizHistorySyncing}
                cloudEnabled={Boolean(authActions.user?.emailVerified)}
                onRecordQuizSession={cloudSync.handleRecordQuizSession}
                onClearQuizHistory={() => cloudSync.handleClearQuizHistory(activeBookId)}
              />
            ) : (
              <AbbreviationsView
                abbreviations={dataset.abbreviations}
                books={dataset.books}
                booksProgress={cloudSync.booksProgress}
              />
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 py-4 px-4 text-center text-xs text-slate-500 dark:text-slate-400">
        Irodori Bunpou (Pemula · Dasar 1 · Dasar 2) · {totalChaptersCount} Bab ·{' '}
        {dataset.allPatterns.length} Pola Tata Bahasa · {totalExamplesCount} Contoh Kalimat
      </footer>

      {/* Reset Book Progress Confirmation Modal */}
      {resetConfirmOpen ? (
        <div
          id="resetConfirmModal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="resetConfirmTitle"
          onClick={e => {
            if (e.target === e.currentTarget) setResetConfirmOpen(false);
          }}
          className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-2xl max-w-md w-full p-6 space-y-4">
            <h2
              id="resetConfirmTitle"
              className="text-lg font-bold text-slate-900 dark:text-slate-50"
            >
              Reset Progres {activeBook.shortTitle}?
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Semua tanda <strong>Sudah Hafal ({activeMastered.size})</strong> dan{' '}
              <strong>Sulit ({activeHardSet.size})</strong> untuk buku{' '}
              <strong>{activeBook.shortTitle}</strong> akan dikosongkan. Progres buku lainnya tidak
              terpengaruh.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setResetConfirmOpen(false)}
                className="min-h-[40px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmResetBook}
                className="min-h-[40px] px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold cursor-pointer"
              >
                Ya, Reset Progres
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <AuthModal
        open={authActions.authModalOpen}
        isSwitchingAccount={authActions.authSwitchMode}
        busy={authActions.authBusy}
        errorText={authActions.authErrorText}
        infoText={authActions.authInfoText}
        showConsoleHint={authActions.authConsoleHint}
        onClearNotice={authActions.clearAuthNotices}
        onGoogleLogin={authActions.handleGoogleLogin}
        onGithubLogin={authActions.handleGithubLogin}
        onEmailSignIn={authActions.handleEmailSignIn}
        onEmailSignUp={authActions.handleEmailSignUp}
        onEmailReset={authActions.handleEmailReset}
        onClose={() => authActions.setAuthModalOpen(false)}
      />

      <ProfileModal
        open={cloudSync.profileModalOpen}
        initialName={resolvedDisplayName}
        initialAvatarUrl={resolvedAvatarUrl}
        fallbackAuthPhoto={authActions.user?.photoURL ?? ''}
        saving={cloudSync.profileSaving}
        onSave={cloudSync.handleSaveProfile}
        onClose={() => cloudSync.setProfileModalOpen(false)}
      />

      <RestoreModal
        pending={backupRestore.pendingRestore}
        currentMasteredCount={activeMastered.size}
        currentHardCount={activeHardSet.size}
        mergedMasteredCount={backupRestore.restorePreviews.mergedMastered}
        mergedHardCount={backupRestore.restorePreviews.mergedHard}
        cleanBackupHardCount={backupRestore.restorePreviews.cleanImpHard}
        onConfirm={backupRestore.handleConfirmRestore}
        onClose={backupRestore.handleCloseRestoreModal}
      />

      <ToastBanner toast={toast} onDismiss={dismissToast} />
    </div>
  );
}
