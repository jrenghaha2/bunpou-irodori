import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import type { User } from 'firebase/auth';
import type { Unsubscribe } from 'firebase/firestore';
import { OperationType, isFirestoreQuotaError, logFirestoreError } from '../firebase';
import {
  fetchBookProgressDoc,
  saveBookProgressDoc,
  subscribeBookProgressDoc,
} from '../services/cloudSyncService';
import type { AllBooksProgress, AppTab, BookId, BunpouPattern } from '../types/bunpou';
import { BOOK_ORDER } from '../types/bunpou';
import {
  BOOK_STORAGE_KEYS,
  areSetsEqual,
  createBookRecord,
  mergeProgressSets,
  normalizeDisjointSets,
  sanitizeIdArray,
} from '../utils/bunpouSync';
import {
  clearAllStoredProgress,
  commitScopedProgressTransaction,
  getStoredOwnerUid,
  safeLoadSet,
  setStoredOwnerUid,
} from '../utils/storage';
import { useQuizHistorySync } from './useQuizHistorySync';
import type { ShowToastFn } from './useToast';
import { useUserProfile } from './useUserProfile';

const PROGRESS_WRITE_DEBOUNCE_MS = 250;
const SYNC_ERROR_TOAST_COOLDOWN_MS = 10_000;

function createEmptyAllBooksProgress(): AllBooksProgress {
  return createBookRecord(() => ({ mastered: new Set<string>(), hard: new Set<string>() }));
}

interface UseCloudProgressSyncOptions {
  user: User | null;
  authReady: boolean;
  authVersion: number;
  justSignedInRef: MutableRefObject<boolean>;
  activeTab: AppTab;
  activeBookId: BookId;
  validIdsByBook: Record<BookId, Set<string>>;
  patternById: Map<string, BunpouPattern>;
  datasetReady: boolean;
  showToast: ShowToastFn;
}

export function useCloudProgressSync({
  user,
  authReady,
  authVersion,
  justSignedInRef,
  activeTab,
  activeBookId,
  validIdsByBook,
  patternById,
  datasetReady,
  showToast,
}: UseCloudProgressSyncOptions) {
  const [booksProgress, setBooksProgress] = useState<AllBooksProgress>(createEmptyAllBooksProgress);
  const [syncing, setSyncing] = useState(false);
  const [fatalError, setFatalError] = useState<Error | null>(null);
  const [offlineFallback, setOfflineFallback] = useState(false);
  const [realtimeReadyUid, setRealtimeReadyUid] = useState<string | null>(null);

  const offlineFallbackRef = useRef(false);
  offlineFallbackRef.current = offlineFallback;

  const activeUidRef = useRef<string | null>(user?.uid ?? null);
  activeUidRef.current = user?.uid ?? null;

  const syncEpochRef = useRef(0);
  const localMutationVersionRef = useRef<Record<BookId, number>>(createBookRecord(() => 0));

  const progressDocExistsRef = useRef<Record<BookId, boolean>>(createBookRecord(() => false));
  const progressWriteQueuesRef = useRef<Record<BookId, Promise<void>>>(
    createBookRecord(() => Promise.resolve())
  );
  const progressWriteTimersRef = useRef<Record<BookId, number | null>>(
    createBookRecord(() => null)
  );
  const lastSyncWarnToastAtRef = useRef(0);

  const booksProgressRef = useRef(booksProgress);
  booksProgressRef.current = booksProgress;

  const clearPendingWriteTimers = useCallback(() => {
    for (const bookId of BOOK_ORDER) {
      const t = progressWriteTimersRef.current[bookId];
      if (t !== null) {
        window.clearTimeout(t);
        progressWriteTimersRef.current[bookId] = null;
      }
    }
  }, []);

  useEffect(() => clearPendingWriteTimers, [clearPendingWriteTimers]);

  const notifyCloudWriteWarning = useCallback(
    (title: string, message: string) => {
      const now = Date.now();
      if (now - lastSyncWarnToastAtRef.current < SYNC_ERROR_TOAST_COOLDOWN_MS) return;
      lastSyncWarnToastAtRef.current = now;
      showToast('error', title, message);
    },
    [showToast]
  );

  const handleQuotaOrLog = useCallback(
    (err: unknown, op: OperationType, path: string, notifyUser: boolean) => {
      if (isFirestoreQuotaError(err)) {
        if (!offlineFallbackRef.current) {
          setFatalError(err instanceof Error ? err : new Error(String(err)));
        }
        return true;
      }
      logFirestoreError(err, op, path);
      if (notifyUser) {
        notifyCloudWriteWarning(
          'Sinkronisasi Cloud Tertunda',
          'Perubahan tetap tersimpan lokal di perangkat ini. Klik Sinkronkan saat koneksi kembali normal.'
        );
      }
      return false;
    },
    [notifyCloudWriteWarning]
  );

  const profile = useUserProfile({
    user,
    offlineFallbackRef,
    handleQuotaOrLog,
    showToast,
  });

  const quizSync = useQuizHistorySync({
    user,
    activeTab,
    activeBookId,
    datasetReady,
    progressReady: Boolean(user && realtimeReadyUid === user.uid),
    patternById,
    offlineFallback,
    offlineFallbackRef,
    ensureUserProfileDoc: profile.ensureUserProfileDoc,
    handleQuotaOrLog,
    showToast,
  });

  const enableOfflineFallback = useCallback(() => {
    offlineFallbackRef.current = true;
    setOfflineFallback(true);
    setFatalError(null);
    clearPendingWriteTimers();
    showToast(
      'info',
      'Mode Offline Aktif',
      'Progres tetap tersimpan di perangkat ini. Anda dapat menyinkronkan ulang ke cloud kapan saja.'
    );
  }, [clearPendingWriteTimers, showToast]);

  // Hydrate local storage once dataset valid IDs are parsed
  useEffect(() => {
    if (!datasetReady) return;
    const loadedProgress: AllBooksProgress = createBookRecord(bookId =>
      normalizeDisjointSets(
        safeLoadSet(BOOK_STORAGE_KEYS[bookId].masteredKey, validIdsByBook[bookId]),
        safeLoadSet(BOOK_STORAGE_KEYS[bookId].hardKey, validIdsByBook[bookId]),
        validIdsByBook[bookId]
      )
    );
    booksProgressRef.current = loadedProgress;
    setBooksProgress(loadedProgress);
    quizSync.hydrateLocalQuizHistories();
  }, [datasetReady, validIdsByBook, quizSync.hydrateLocalQuizHistories]);

  const enqueueBookProgressWrite = useCallback(
    (
      u: User,
      bookId: BookId,
      getSnapshot: () => { mastered: Set<string>; hard: Set<string> },
      notifyOnFailure: boolean
    ): Promise<void> => {
      const task = progressWriteQueuesRef.current[bookId].then(async () => {
        if (!u.emailVerified || offlineFallbackRef.current || activeUidRef.current !== u.uid) {
          return;
        }
        const parentOk = await profile.ensureUserProfileDoc(u);
        if (!parentOk || activeUidRef.current !== u.uid) return;

        const path = `users/${u.uid}/bunpouProgress/${bookId}`;
        const validIds = validIdsByBook[bookId];
        const snap = getSnapshot();
        const clean = normalizeDisjointSets(snap.mastered, snap.hard, validIds);

        try {
          await saveBookProgressDoc(
            u.uid,
            bookId,
            [...clean.mastered],
            [...clean.hard],
            progressDocExistsRef.current[bookId]
          );
          progressDocExistsRef.current[bookId] = true;
        } catch (err) {
          handleQuotaOrLog(err, OperationType.WRITE, path, notifyOnFailure);
        }
      });

      progressWriteQueuesRef.current[bookId] = task.catch(() => undefined);
      return task;
    },
    [profile.ensureUserProfileDoc, validIdsByBook, handleQuotaOrLog]
  );

  const scheduleBookProgressWrite = useCallback(
    (u: User, bookId: BookId) => {
      if (offlineFallbackRef.current) return;
      const existingTimer = progressWriteTimersRef.current[bookId];
      if (existingTimer !== null) {
        window.clearTimeout(existingTimer);
      }
      progressWriteTimersRef.current[bookId] = window.setTimeout(() => {
        progressWriteTimersRef.current[bookId] = null;
        if (activeUidRef.current !== u.uid) return;
        void enqueueBookProgressWrite(u, bookId, () => booksProgressRef.current[bookId], true);
      }, PROGRESS_WRITE_DEBOUNCE_MS);
    },
    [enqueueBookProgressWrite]
  );

  const syncAllFromCloud = useCallback(
    async (u: User, announce: boolean) => {
      if (offlineFallbackRef.current) return;
      const myEpoch = ++syncEpochRef.current;
      const isCancelled = () =>
        syncEpochRef.current !== myEpoch ||
        activeUidRef.current !== u.uid ||
        offlineFallbackRef.current;

      setSyncing(true);
      try {
        const previousOwner = getStoredOwnerUid();
        const isSwitchingUser = Boolean(previousOwner && previousOwner !== u.uid);

        if (isSwitchingUser) {
          clearPendingWriteTimers();
          clearAllStoredProgress();
          const empty = createEmptyAllBooksProgress();
          booksProgressRef.current = empty;
          setBooksProgress(empty);
          quizSync.resetQuizHistories();
          profile.resetProfileState(true);
          progressDocExistsRef.current = createBookRecord(() => false);
        }
        setStoredOwnerUid(u.uid);

        const parentOk = await profile.ensureUserProfileDoc(u);
        if (!parentOk || isCancelled()) return;

        const startMutationVersions = createBookRecord(
          bookId => localMutationVersionRef.current[bookId]
        );

        let hitQuota = false;

        const results = await Promise.all(
          BOOK_ORDER.map(async bookId => {
            const validIds = validIdsByBook[bookId];
            const keys = BOOK_STORAGE_KEYS[bookId];
            const localM = isSwitchingUser
              ? new Set<string>()
              : safeLoadSet(keys.masteredKey, validIds);
            const localH = isSwitchingUser
              ? new Set<string>()
              : safeLoadSet(keys.hardKey, validIds);

            const path = `users/${u.uid}/bunpouProgress/${bookId}`;
            try {
              const snap = await fetchBookProgressDoc(u.uid, bookId);
              if (isCancelled()) return null;

              const mutatedMidSync =
                localMutationVersionRef.current[bookId] !== startMutationVersions[bookId];
              const baseLocalM = mutatedMidSync ? booksProgressRef.current[bookId].mastered : localM;
              const baseLocalH = mutatedMidSync ? booksProgressRef.current[bookId].hard : localH;

              if (snap.exists) {
                progressDocExistsRef.current[bookId] = true;
                const cloudM = new Set(sanitizeIdArray(snap.mastered, validIds));
                const cloudH = new Set(sanitizeIdArray(snap.hard, validIds));
                const merged = mergeProgressSets(baseLocalM, baseLocalH, cloudM, cloudH, validIds);

                commitScopedProgressTransaction(
                  keys.masteredKey,
                  keys.hardKey,
                  merged.mastered,
                  merged.hard
                );

                if (
                  u.emailVerified &&
                  !mutatedMidSync &&
                  (!areSetsEqual(merged.mastered, cloudM) || !areSetsEqual(merged.hard, cloudH))
                ) {
                  await enqueueBookProgressWrite(u, bookId, () => merged, false);
                }
                return { bookId, progress: merged, cloudM, cloudH };
              }

              progressDocExistsRef.current[bookId] = false;
              const cleanLocal = normalizeDisjointSets(baseLocalM, baseLocalH, validIds);
              commitScopedProgressTransaction(
                keys.masteredKey,
                keys.hardKey,
                cleanLocal.mastered,
                cleanLocal.hard
              );
              if (
                u.emailVerified &&
                !mutatedMidSync &&
                (cleanLocal.mastered.size > 0 || cleanLocal.hard.size > 0)
              ) {
                await enqueueBookProgressWrite(u, bookId, () => cleanLocal, false);
              }
              return { bookId, progress: cleanLocal, cloudM: null, cloudH: null };
            } catch (err) {
              const isQuota = handleQuotaOrLog(err, OperationType.GET, path, false);
              if (isQuota) {
                hitQuota = true;
                return null;
              }
              const fallbackLocal = normalizeDisjointSets(localM, localH, validIds);
              return { bookId, progress: fallbackLocal, cloudM: null, cloudH: null };
            }
          })
        );

        if (hitQuota || isCancelled()) return;

        // Re-check local mutation versions after Promise.all completes so user clicks
        // on Book A while Books B/C were still fetching are never overwritten by stale snapshots.
        const nextBooks: AllBooksProgress = createEmptyAllBooksProgress();
        for (const item of results) {
          if (!item) continue;
          const { bookId, progress, cloudM, cloudH } = item;
          if (localMutationVersionRef.current[bookId] !== startMutationVersions[bookId]) {
            const latestLocal = booksProgressRef.current[bookId];
            const validIds = validIdsByBook[bookId];
            const keys = BOOK_STORAGE_KEYS[bookId];
            const reMerged =
              cloudM && cloudH
                ? mergeProgressSets(latestLocal.mastered, latestLocal.hard, cloudM, cloudH, validIds)
                : normalizeDisjointSets(latestLocal.mastered, latestLocal.hard, validIds);
            commitScopedProgressTransaction(
              keys.masteredKey,
              keys.hardKey,
              reMerged.mastered,
              reMerged.hard
            );
            nextBooks[bookId] = reMerged;
            if (
              u.emailVerified &&
              (!areSetsEqual(reMerged.mastered, latestLocal.mastered) ||
                !areSetsEqual(reMerged.hard, latestLocal.hard))
            ) {
              scheduleBookProgressWrite(u, bookId);
            }
          } else {
            nextBooks[bookId] = progress;
          }
        }
        booksProgressRef.current = nextBooks;
        setBooksProgress(nextBooks);
        setRealtimeReadyUid(u.uid);

        if (announce) {
          const totalMastered = BOOK_ORDER.reduce(
            (sum, id) => sum + nextBooks[id].mastered.size,
            0
          );
          showToast(
            'success',
            'Sinkronisasi Cloud Aktif',
            `Progres Irodori Bunpou tersinkron (${totalMastered} pola hafal di 3 buku).`
          );
        }
      } finally {
        if (syncEpochRef.current === myEpoch) {
          setSyncing(false);
        }
      }
    },
    [
      clearPendingWriteTimers,
      quizSync.resetQuizHistories,
      profile.resetProfileState,
      profile.ensureUserProfileDoc,
      validIdsByBook,
      enqueueBookProgressWrite,
      scheduleBookProgressWrite,
      handleQuotaOrLog,
      showToast,
    ]
  );

  // Trigger initial sync when auth state settles & dataset is ready
  useEffect(() => {
    if (!authReady || !datasetReady) return;
    if (!user) {
      syncEpochRef.current += 1;
      clearPendingWriteTimers();
      profile.resetProfileState(true);
      quizSync.clearQuizCloudCache(true);
      progressDocExistsRef.current = createBookRecord(() => false);
      setOfflineFallback(false);
      setRealtimeReadyUid(null);
      return;
    }

    const announce = justSignedInRef.current;
    justSignedInRef.current = false;
    setRealtimeReadyUid(null);
    void syncAllFromCloud(user, announce);
  }, [
    authReady,
    datasetReady,
    user,
    authVersion,
    justSignedInRef,
    syncAllFromCloud,
    clearPendingWriteTimers,
    profile.resetProfileState,
    quizSync.clearQuizCloudCache,
  ]);

  // 100% Real-Time Firestore listeners for bunpouProgress across all 3 books once initial merge settles
  useEffect(() => {
    if (!user || !user.emailVerified || !datasetReady || offlineFallback) return;
    if (realtimeReadyUid !== user.uid) return;

    let cancelled = false;
    const unsubs: Unsubscribe[] = [];

    for (const bookId of BOOK_ORDER) {
      const path = `users/${user.uid}/bunpouProgress/${bookId}`;
      const unsub = subscribeBookProgressDoc(
        user.uid,
        bookId,
        snap => {
          if (cancelled || activeUidRef.current !== user.uid) return;
          progressDocExistsRef.current[bookId] = snap.exists;
          // Skip local echoes or snapshots arriving while a local debounced write is still pending
          if (snap.hasPendingWrites || progressWriteTimersRef.current[bookId] !== null) return;

          const validIds = validIdsByBook[bookId];
          const cloudM = new Set(sanitizeIdArray(snap.mastered, validIds));
          const cloudH = new Set(sanitizeIdArray(snap.hard, validIds));
          const cleanCloud = normalizeDisjointSets(cloudM, cloudH, validIds);
          const current = booksProgressRef.current[bookId];

          if (
            areSetsEqual(cleanCloud.mastered, current.mastered) &&
            areSetsEqual(cleanCloud.hard, current.hard)
          ) {
            return;
          }

          const keys = BOOK_STORAGE_KEYS[bookId];
          commitScopedProgressTransaction(
            keys.masteredKey,
            keys.hardKey,
            cleanCloud.mastered,
            cleanCloud.hard
          );

          const nextState: AllBooksProgress = {
            ...booksProgressRef.current,
            [bookId]: cleanCloud,
          };
          booksProgressRef.current = nextState;
          setBooksProgress(nextState);
        },
        err => {
          if (!cancelled) {
            handleQuotaOrLog(err, OperationType.GET, path, false);
          }
        }
      );
      unsubs.push(unsub);
    }

    return () => {
      cancelled = true;
      for (const unsub of unsubs) unsub();
    };
  }, [user, datasetReady, offlineFallback, realtimeReadyUid, validIdsByBook, handleQuotaOrLog]);

  const applyProgressChange = useCallback(
    (nextMastered: Set<string>, nextHard: Set<string>, targetBookId?: BookId): boolean => {
      const bId = targetBookId ?? activeBookId;
      const validIds = validIdsByBook[bId];
      const clean = normalizeDisjointSets(nextMastered, nextHard, validIds);
      const keys = BOOK_STORAGE_KEYS[bId];
      const tx = commitScopedProgressTransaction(
        keys.masteredKey,
        keys.hardKey,
        clean.mastered,
        clean.hard
      );
      if (!tx.ok) {
        showToast('error', 'Gagal Menyimpan Progres', tx.error);
        return false;
      }

      localMutationVersionRef.current[bId] += 1;
      const nextState = {
        ...booksProgressRef.current,
        [bId]: clean,
      };
      booksProgressRef.current = nextState;
      setBooksProgress(nextState);

      if (user && user.emailVerified && !offlineFallbackRef.current) {
        scheduleBookProgressWrite(user, bId);
      }
      return true;
    },
    [activeBookId, validIdsByBook, user, scheduleBookProgressWrite, showToast]
  );

  const handleManualSync = useCallback(async () => {
    if (!user || !user.emailVerified) return;
    offlineFallbackRef.current = false;
    setOfflineFallback(false);
    quizSync.triggerQuizHistoryResync();
    await syncAllFromCloud(user, true);
  }, [user, quizSync.triggerQuizHistoryResync, syncAllFromCloud]);

  const resetCloudAndLocalProgress = useCallback(() => {
    syncEpochRef.current += 1;
    clearPendingWriteTimers();
    clearAllStoredProgress();
    const empty = createEmptyAllBooksProgress();
    booksProgressRef.current = empty;
    setBooksProgress(empty);
    profile.resetProfileState(false);
    quizSync.resetQuizHistories();
    progressDocExistsRef.current = createBookRecord(() => false);
    setRealtimeReadyUid(null);
    return { emptyM: new Set<string>(), emptyH: new Set<string>() };
  }, [clearPendingWriteTimers, profile.resetProfileState, quizSync.resetQuizHistories]);

  const detachUnverifiedCloudSession = useCallback(() => {
    syncEpochRef.current += 1;
    clearPendingWriteTimers();
    setStoredOwnerUid(null);
    profile.resetProfileState(false);
    quizSync.clearQuizCloudCache(true);
    progressDocExistsRef.current = createBookRecord(() => false);
    setRealtimeReadyUid(null);
  }, [clearPendingWriteTimers, profile.resetProfileState, quizSync.clearQuizCloudCache]);

  const progressReady = Boolean(user && realtimeReadyUid === user.uid);

  return {
    booksProgress,
    quizHistories: quizSync.quizHistories,
    syncing,
    quizHistorySyncing: quizSync.quizHistorySyncing,
    progressReady,
    quizHistoryReady: quizSync.quizHistoryReady,
    fatalError,
    offlineFallback,
    enableOfflineFallback,
    customDisplayName: profile.customDisplayName,
    customAvatarUrl: profile.customAvatarUrl,
    userRole: profile.userRole,
    ensureUserProfileDoc: profile.ensureUserProfileDoc,
    profileModalOpen: profile.profileModalOpen,
    setProfileModalOpen: profile.setProfileModalOpen,
    profileSaving: profile.profileSaving,
    applyProgressChange,
    handleRecordQuizSession: quizSync.handleRecordQuizSession,
    handleClearQuizHistory: quizSync.handleClearQuizHistory,
    handleManualSync,
    handleSaveProfile: profile.handleSaveProfile,
    resetCloudAndLocalProgress,
    detachUnverifiedCloudSession,
  };
}
