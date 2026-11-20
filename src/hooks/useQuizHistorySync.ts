import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { User } from 'firebase/auth';
import { OperationType } from '../firebase';
import { fetchQuizHistoryDoc, saveQuizHistoryDoc } from '../services/cloudSyncService';
import type {
  AllBooksQuizHistory,
  AppTab,
  BookId,
  BunpouPattern,
  QuizSessionHistoryEntry,
} from '../types/bunpou';
import { BOOK_STORAGE_KEYS, createBookRecord } from '../utils/bunpouSync';
import {
  MAX_QUIZ_HISTORY_ENTRIES,
  createQuizSessionEntry,
  decodeQuizSessionToken,
  encodeQuizSessionToken,
  loadQuizHistory,
  mergeQuizHistories,
  saveQuizHistory,
  type RecordQuizSessionInput,
} from '../utils/quizStats';
import type { ShowToastFn } from './useToast';

function createEmptyAllBooksQuizHistory(): AllBooksQuizHistory {
  return createBookRecord(() => [] as QuizSessionHistoryEntry[]);
}

interface UseQuizHistorySyncOptions {
  user: User | null;
  activeTab: AppTab;
  activeBookId: BookId;
  datasetReady: boolean;
  patternById: Map<string, BunpouPattern>;
  offlineFallback: boolean;
  offlineFallbackRef: MutableRefObject<boolean>;
  ensureUserProfileDoc: (u: User) => Promise<boolean>;
  handleQuotaOrLog: (
    err: unknown,
    op: OperationType,
    path: string,
    notifyUser: boolean
  ) => boolean;
  showToast: ShowToastFn;
}

export function useQuizHistorySync({
  user,
  activeTab,
  activeBookId,
  datasetReady,
  patternById,
  offlineFallback,
  offlineFallbackRef,
  ensureUserProfileDoc,
  handleQuotaOrLog,
  showToast,
}: UseQuizHistorySyncOptions) {
  const [quizHistories, setQuizHistories] = useState<AllBooksQuizHistory>(
    createEmptyAllBooksQuizHistory
  );
  const [quizHistorySyncing, setQuizHistorySyncing] = useState(false);
  const [syncNonce, setSyncNonce] = useState(0);

  const quizHistoriesRef = useRef(quizHistories);
  quizHistoriesRef.current = quizHistories;

  const quizDocExistsRef = useRef<Record<BookId, boolean>>(createBookRecord(() => false));
  const loadedQuizCloudBooksRef = useRef<Set<string>>(new Set());
  const quizWriteQueuesRef = useRef<Record<BookId, Promise<void>>>(
    createBookRecord(() => Promise.resolve())
  );

  const hydrateLocalQuizHistories = useCallback(() => {
    const loaded = createBookRecord(bookId => loadQuizHistory(bookId));
    quizHistoriesRef.current = loaded;
    setQuizHistories(loaded);
  }, []);

  const clearQuizCloudCache = useCallback((resetDocFlags = false) => {
    loadedQuizCloudBooksRef.current.clear();
    if (resetDocFlags) {
      quizDocExistsRef.current = createBookRecord(() => false);
    }
  }, []);

  const triggerQuizHistoryResync = useCallback(() => {
    loadedQuizCloudBooksRef.current.clear();
    setSyncNonce(n => n + 1);
  }, []);

  const resetQuizHistories = useCallback(() => {
    const empty = createEmptyAllBooksQuizHistory();
    quizHistoriesRef.current = empty;
    setQuizHistories(empty);
    clearQuizCloudCache(true);
  }, [clearQuizCloudCache]);

  const enqueueQuizHistoryWrite = useCallback(
    (
      u: User,
      bookId: BookId,
      entries: readonly QuizSessionHistoryEntry[],
      notifyOnFailure: boolean
    ): Promise<void> => {
      const task = quizWriteQueuesRef.current[bookId].then(async () => {
        if (!u.emailVerified || offlineFallbackRef.current) return;
        const parentOk = await ensureUserProfileDoc(u);
        if (!parentOk) return;

        const path = `users/${u.uid}/quizHistory/${bookId}`;
        const uniqueTokens = Array.from(
          new Set(entries.slice(0, MAX_QUIZ_HISTORY_ENTRIES).map(encodeQuizSessionToken))
        );

        try {
          await saveQuizHistoryDoc(
            u.uid,
            bookId,
            uniqueTokens,
            quizDocExistsRef.current[bookId]
          );
          quizDocExistsRef.current[bookId] = true;
        } catch (err) {
          handleQuotaOrLog(err, OperationType.WRITE, path, notifyOnFailure);
        }
      });

      quizWriteQueuesRef.current[bookId] = task.catch(() => undefined);
      return task;
    },
    [offlineFallbackRef, ensureUserProfileDoc, handleQuotaOrLog]
  );

  // Lazy-load quiz history from cloud only when user opens Quiz tab for a book (or manually syncs)
  useEffect(() => {
    if (!user || !user.emailVerified || !datasetReady || activeTab !== 'quiz') return;
    if (offlineFallback || offlineFallbackRef.current) return;
    const cacheKey = `${user.uid}:${activeBookId}`;
    if (loadedQuizCloudBooksRef.current.has(cacheKey)) return;

    let cancelled = false;
    const run = async () => {
      setQuizHistorySyncing(true);
      try {
        const parentOk = await ensureUserProfileDoc(user);
        if (!parentOk || cancelled) return;

        const snap = await fetchQuizHistoryDoc(user.uid, activeBookId);
        if (cancelled) return;

        const localList = loadQuizHistory(activeBookId);
        if (snap.exists) {
          quizDocExistsRef.current[activeBookId] = true;
          const decoded: QuizSessionHistoryEntry[] = [];
          for (const tok of snap.sessions) {
            if (typeof tok === 'string') {
              const entry = decodeQuizSessionToken(tok, activeBookId, patternById);
              if (entry) decoded.push(entry);
            }
          }
          const merged = mergeQuizHistories(localList, decoded);
          saveQuizHistory(activeBookId, merged);
          setQuizHistories(prev => ({ ...prev, [activeBookId]: merged }));
          if (merged.length > decoded.length) {
            await enqueueQuizHistoryWrite(user, activeBookId, merged, false);
          }
        } else {
          quizDocExistsRef.current[activeBookId] = false;
          if (localList.length > 0) {
            await enqueueQuizHistoryWrite(user, activeBookId, localList, false);
          }
        }
        loadedQuizCloudBooksRef.current.add(cacheKey);
      } catch (err) {
        if (!cancelled) {
          handleQuotaOrLog(
            err,
            OperationType.GET,
            `users/${user.uid}/quizHistory/${activeBookId}`,
            false
          );
        }
      } finally {
        if (!cancelled) setQuizHistorySyncing(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [
    user,
    datasetReady,
    activeTab,
    activeBookId,
    offlineFallback,
    syncNonce,
    offlineFallbackRef,
    ensureUserProfileDoc,
    patternById,
    enqueueQuizHistoryWrite,
    handleQuotaOrLog,
  ]);

  const handleRecordQuizSession = useCallback(
    (input: RecordQuizSessionInput) => {
      const entry = createQuizSessionEntry(input);
      const prev = quizHistoriesRef.current[input.bookId] ?? [];
      const next = [entry, ...prev].slice(0, MAX_QUIZ_HISTORY_ENTRIES);
      saveQuizHistory(input.bookId, next);
      setQuizHistories(curr => ({ ...curr, [input.bookId]: next }));

      if (user && user.emailVerified && !offlineFallbackRef.current) {
        void enqueueQuizHistoryWrite(user, input.bookId, next, true);
      }
    },
    [user, offlineFallbackRef, enqueueQuizHistoryWrite]
  );

  const handleClearQuizHistory = useCallback(
    (bookId: BookId) => {
      saveQuizHistory(bookId, []);
      setQuizHistories(curr => ({ ...curr, [bookId]: [] }));
      if (user && user.emailVerified && !offlineFallbackRef.current) {
        void enqueueQuizHistoryWrite(user, bookId, [], true);
      }
      showToast(
        'info',
        'Riwayat Kuis Dihapus',
        `Riwayat skor ${BOOK_STORAGE_KEYS[bookId].label} telah dikosongkan.`
      );
    },
    [user, offlineFallbackRef, enqueueQuizHistoryWrite, showToast]
  );

  return {
    quizHistories,
    quizHistorySyncing,
    handleRecordQuizSession,
    handleClearQuizHistory,
    hydrateLocalQuizHistories,
    clearQuizCloudCache,
    triggerQuizHistoryResync,
    resetQuizHistories,
  };
}
