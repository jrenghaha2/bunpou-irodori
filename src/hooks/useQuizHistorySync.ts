import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { User } from 'firebase/auth';
import type { Unsubscribe } from 'firebase/firestore';
import { OperationType } from '../firebase';
import { saveQuizHistoryDoc, subscribeQuizHistoryDoc } from '../services/cloudSyncService';
import type {
  AllBooksQuizHistory,
  AppTab,
  BookId,
  BunpouPattern,
  QuizSessionHistoryEntry,
} from '../types/bunpou';
import { BOOK_ORDER } from '../types/bunpou';
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
  progressReady: boolean;
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
  datasetReady,
  progressReady,
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
  const [quizHistoryReadyUid, setQuizHistoryReadyUid] = useState<string | null>(null);
  const [syncNonce, setSyncNonce] = useState(0);

  const quizHistoriesRef = useRef(quizHistories);
  quizHistoriesRef.current = quizHistories;

  const quizDocExistsRef = useRef<Record<BookId, boolean>>(createBookRecord(() => false));
  const initialSyncedBooksRef = useRef<Set<string>>(new Set());
  const quizWriteQueuesRef = useRef<Record<BookId, Promise<void>>>(
    createBookRecord(() => Promise.resolve())
  );

  const hydrateLocalQuizHistories = useCallback(() => {
    const loaded = createBookRecord(bookId => loadQuizHistory(bookId));
    quizHistoriesRef.current = loaded;
    setQuizHistories(loaded);
  }, []);

  const clearQuizCloudCache = useCallback((resetDocFlags = false) => {
    initialSyncedBooksRef.current.clear();
    if (resetDocFlags) {
      quizDocExistsRef.current = createBookRecord(() => false);
      setQuizHistoryReadyUid(null);
    }
  }, []);

  const triggerQuizHistoryResync = useCallback(() => {
    initialSyncedBooksRef.current.clear();
    setQuizHistoryReadyUid(null);
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

  // 100% Real-Time Firestore subscription across all 3 books as soon as user signs in
  // and user-switch storage cleanup has settled, so cross-device & local-to-cloud sync are live.
  useEffect(() => {
    if (!user || !user.emailVerified || !datasetReady || !progressReady) {
      setQuizHistorySyncing(false);
      setQuizHistoryReadyUid(null);
      return;
    }
    if (offlineFallback || offlineFallbackRef.current) {
      setQuizHistorySyncing(false);
      setQuizHistoryReadyUid(null);
      return;
    }

    let cancelled = false;
    const unsubs: Unsubscribe[] = [];
    const settledBooks = new Set<BookId>();
    setQuizHistoryReadyUid(null);

    const markSettled = (bookId: BookId) => {
      settledBooks.add(bookId);
      if (!cancelled && settledBooks.size >= BOOK_ORDER.length) {
        setQuizHistorySyncing(false);
        setQuizHistoryReadyUid(user.uid);
      }
    };

    const startRealtimeStreams = async () => {
      setQuizHistorySyncing(true);
      const parentOk = await ensureUserProfileDoc(user);
      if (!parentOk || cancelled) {
        if (!cancelled) setQuizHistorySyncing(false);
        return;
      }

      for (const bookId of BOOK_ORDER) {
        const path = `users/${user.uid}/quizHistory/${bookId}`;
        const syncKey = `${user.uid}:${bookId}`;

        const unsub = subscribeQuizHistoryDoc(
          user.uid,
          bookId,
          snap => {
            if (cancelled) return;
            quizDocExistsRef.current[bookId] = snap.exists;

            const decoded: QuizSessionHistoryEntry[] = [];
            if (snap.exists) {
              for (const tok of snap.sessions) {
                if (typeof tok === 'string') {
                  const entry = decodeQuizSessionToken(tok, bookId, patternById);
                  if (entry) decoded.push(entry);
                }
              }
            }

            const isFirstForBook = !initialSyncedBooksRef.current.has(syncKey);
            if (isFirstForBook) {
              initialSyncedBooksRef.current.add(syncKey);
              const localList = loadQuizHistory(bookId);
              const merged = mergeQuizHistories(localList, decoded);
              saveQuizHistory(bookId, merged);
              setQuizHistories(prev => ({ ...prev, [bookId]: merged }));
              const encodedMerged = merged.map(encodeQuizSessionToken);
              const rawCloudTokens = snap.exists
                ? snap.sessions.filter((t): t is string => typeof t === 'string')
                : [];
              const cloudNeedsUpgrade =
                merged.length > decoded.length ||
                (encodedMerged.length > 0 &&
                  encodedMerged.some((tok, idx) => tok !== rawCloudTokens[idx]));
              if (!snap.hasPendingWrites && cloudNeedsUpgrade) {
                void enqueueQuizHistoryWrite(user, bookId, merged, false);
              }
            } else if (!snap.hasPendingWrites) {
              // Authoritative real-time cloud push from another tab/device or confirmed write
              const sorted = [...decoded]
                .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
                .slice(0, MAX_QUIZ_HISTORY_ENTRIES);
              saveQuizHistory(bookId, sorted);
              setQuizHistories(prev => ({ ...prev, [bookId]: sorted }));
            }

            markSettled(bookId);
          },
          err => {
            if (cancelled) return;
            handleQuotaOrLog(err, OperationType.GET, path, false);
            markSettled(bookId);
          }
        );

        unsubs.push(unsub);
      }
    };

    void startRealtimeStreams();

    return () => {
      cancelled = true;
      for (const unsub of unsubs) unsub();
    };
  }, [
    user,
    datasetReady,
    progressReady,
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
    quizHistoryReady: Boolean(user && quizHistoryReadyUid === user.uid),
    handleRecordQuizSession,
    handleClearQuizHistory,
    hydrateLocalQuizHistories,
    clearQuizCloudCache,
    triggerQuizHistoryResync,
    resetQuizHistories,
  };
}
