import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { updateProfile, type User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import {
  OperationType,
  db,
  isFirestoreQuotaError,
  logFirestoreError,
} from '../firebase';
import type {
  AllBooksProgress,
  AllBooksQuizHistory,
  AppTab,
  BookId,
  BunpouPattern,
  QuizSessionHistoryEntry,
} from '../types/bunpou';
import { BOOK_ORDER } from '../types/bunpou';
import {
  BOOK_STORAGE_KEYS,
  areSetsEqual,
  createBookRecord,
  isValidAvatarUrl,
  mergeProgressSets,
  normalizeDisjointSets,
  sanitizeDisplayName,
  sanitizeIdArray,
} from '../utils/bunpouSync';
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
import {
  clearAllStoredProgress,
  commitScopedProgressTransaction,
  getStoredOwnerUid,
  safeLoadSet,
  setStoredOwnerUid,
} from '../utils/storage';
import type { ShowToastFn } from './useToast';

const PROGRESS_WRITE_DEBOUNCE_MS = 250;
const SYNC_ERROR_TOAST_COOLDOWN_MS = 10_000;

function createEmptyAllBooksProgress(): AllBooksProgress {
  return createBookRecord(() => ({ mastered: new Set<string>(), hard: new Set<string>() }));
}

function createEmptyAllBooksQuizHistory(): AllBooksQuizHistory {
  return createBookRecord(() => [] as QuizSessionHistoryEntry[]);
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
  const [quizHistories, setQuizHistories] = useState<AllBooksQuizHistory>(
    createEmptyAllBooksQuizHistory
  );

  const [syncing, setSyncing] = useState(false);
  const [quizHistorySyncing, setQuizHistorySyncing] = useState(false);
  const [fatalError, setFatalError] = useState<Error | null>(null);
  const [offlineFallback, setOfflineFallback] = useState(false);

  const [customDisplayName, setCustomDisplayName] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const offlineFallbackRef = useRef(false);
  offlineFallbackRef.current = offlineFallback;

  const userProfileDocExistsRef = useRef(false);
  const profileInitPromiseRef = useRef<{ uid: string; promise: Promise<boolean> } | null>(null);

  const progressDocExistsRef = useRef<Record<BookId, boolean>>(createBookRecord(() => false));
  const quizDocExistsRef = useRef<Record<BookId, boolean>>(createBookRecord(() => false));
  const loadedQuizCloudBooksRef = useRef<Set<string>>(new Set());

  // Per-book serialized write queues and debounce timers to prevent parallel setDoc races
  const progressWriteQueuesRef = useRef<Record<BookId, Promise<void>>>(
    createBookRecord(() => Promise.resolve())
  );
  const progressWriteTimersRef = useRef<Record<BookId, number | null>>(
    createBookRecord(() => null)
  );
  const quizWriteQueuesRef = useRef<Record<BookId, Promise<void>>>(
    createBookRecord(() => Promise.resolve())
  );
  const lastSyncWarnToastAtRef = useRef(0);

  const booksProgressRef = useRef(booksProgress);
  booksProgressRef.current = booksProgress;

  const quizHistoriesRef = useRef(quizHistories);
  quizHistoriesRef.current = quizHistories;

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
    setBooksProgress(loadedProgress);
    setQuizHistories(createBookRecord(bookId => loadQuizHistory(bookId)));
  }, [datasetReady, validIdsByBook]);

  // Deduplicated profile doc initialization so parallel sync & quiz-history loads never race
  const ensureUserProfileDoc = useCallback(
    async (u: User): Promise<boolean> => {
      if (offlineFallbackRef.current) return false;
      if (userProfileDocExistsRef.current) return true;
      if (profileInitPromiseRef.current?.uid === u.uid) {
        return profileInitPromiseRef.current.promise;
      }

      const path = `users/${u.uid}`;
      const ref = doc(db, 'users', u.uid);

      const initPromise = (async () => {
        try {
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            if (typeof data.displayName === 'string') setCustomDisplayName(data.displayName);
            if (typeof data.avatarUrl === 'string') setCustomAvatarUrl(data.avatarUrl);
            userProfileDocExistsRef.current = true;
            return true;
          }
          if (!u.emailVerified) return false;

          const defaultName = sanitizeDisplayName(
            u.displayName || u.email?.split('@')[0] || 'Pembelajar'
          );
          const defaultAvatar =
            u.photoURL && isValidAvatarUrl(u.photoURL) ? u.photoURL : '';

          const payload: Record<string, unknown> = {
            uid: u.uid,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          if (defaultName) payload.displayName = defaultName;
          if (defaultAvatar) payload.avatarUrl = defaultAvatar;

          await setDoc(ref, payload);
          setCustomDisplayName(defaultName);
          setCustomAvatarUrl(defaultAvatar);
          userProfileDocExistsRef.current = true;
          return true;
        } catch (err) {
          handleQuotaOrLog(err, OperationType.WRITE, path, false);
          return false;
        } finally {
          if (profileInitPromiseRef.current?.uid === u.uid) {
            profileInitPromiseRef.current = null;
          }
        }
      })();

      profileInitPromiseRef.current = { uid: u.uid, promise: initPromise };
      return initPromise;
    },
    [handleQuotaOrLog]
  );

  const enqueueBookProgressWrite = useCallback(
    (
      u: User,
      bookId: BookId,
      getSnapshot: () => { mastered: Set<string>; hard: Set<string> },
      notifyOnFailure: boolean
    ): Promise<void> => {
      const task = progressWriteQueuesRef.current[bookId].then(async () => {
        if (!u.emailVerified || offlineFallbackRef.current) return;
        const parentOk = await ensureUserProfileDoc(u);
        if (!parentOk) return;

        const path = `users/${u.uid}/bunpouProgress/${bookId}`;
        const ref = doc(db, 'users', u.uid, 'bunpouProgress', bookId);
        const validIds = validIdsByBook[bookId];
        const snap = getSnapshot();
        const clean = normalizeDisjointSets(snap.mastered, snap.hard, validIds);
        const mArr = [...clean.mastered];
        const hArr = [...clean.hard];

        try {
          if (progressDocExistsRef.current[bookId]) {
            await updateDoc(ref, {
              mastered: mArr,
              hard: hArr,
              updatedAt: serverTimestamp(),
            });
          } else {
            await setDoc(ref, {
              uid: u.uid,
              bookId,
              mastered: mArr,
              hard: hArr,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            progressDocExistsRef.current[bookId] = true;
          }
        } catch (err) {
          handleQuotaOrLog(err, OperationType.WRITE, path, notifyOnFailure);
        }
      });

      progressWriteQueuesRef.current[bookId] = task.catch(() => undefined);
      return task;
    },
    [ensureUserProfileDoc, validIdsByBook, handleQuotaOrLog]
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
        void enqueueBookProgressWrite(u, bookId, () => booksProgressRef.current[bookId], true);
      }, PROGRESS_WRITE_DEBOUNCE_MS);
    },
    [enqueueBookProgressWrite]
  );

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
        const ref = doc(db, 'users', u.uid, 'quizHistory', bookId);
        const uniqueTokens = Array.from(
          new Set(entries.slice(0, MAX_QUIZ_HISTORY_ENTRIES).map(encodeQuizSessionToken))
        );

        try {
          if (quizDocExistsRef.current[bookId]) {
            await updateDoc(ref, {
              sessions: uniqueTokens,
              updatedAt: serverTimestamp(),
            });
          } else {
            await setDoc(ref, {
              uid: u.uid,
              bookId,
              sessions: uniqueTokens,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            quizDocExistsRef.current[bookId] = true;
          }
        } catch (err) {
          handleQuotaOrLog(err, OperationType.WRITE, path, notifyOnFailure);
        }
      });

      quizWriteQueuesRef.current[bookId] = task.catch(() => undefined);
      return task;
    },
    [ensureUserProfileDoc, handleQuotaOrLog]
  );

  const syncAllFromCloud = useCallback(
    async (u: User, announce: boolean) => {
      if (offlineFallbackRef.current) return;
      setSyncing(true);
      try {
        const previousOwner = getStoredOwnerUid();
        const isSwitchingUser = Boolean(previousOwner && previousOwner !== u.uid);

        if (isSwitchingUser) {
          clearAllStoredProgress();
          setBooksProgress(createEmptyAllBooksProgress());
          setQuizHistories(createEmptyAllBooksQuizHistory());
        }
        setStoredOwnerUid(u.uid);

        const parentOk = await ensureUserProfileDoc(u);
        if (!parentOk) return;

        const nextBooks: AllBooksProgress = createEmptyAllBooksProgress();

        for (const bookId of BOOK_ORDER) {
          const validIds = validIdsByBook[bookId];
          const keys = BOOK_STORAGE_KEYS[bookId];
          const localM = isSwitchingUser
            ? new Set<string>()
            : safeLoadSet(keys.masteredKey, validIds);
          const localH = isSwitchingUser
            ? new Set<string>()
            : safeLoadSet(keys.hardKey, validIds);

          const path = `users/${u.uid}/bunpouProgress/${bookId}`;
          const ref = doc(db, 'users', u.uid, 'bunpouProgress', bookId);
          try {
            const snap = await getDoc(ref);
            if (snap.exists()) {
              progressDocExistsRef.current[bookId] = true;
              const data = snap.data();
              const cloudM = new Set(sanitizeIdArray(data.mastered, validIds));
              const cloudH = new Set(sanitizeIdArray(data.hard, validIds));
              const merged = mergeProgressSets(localM, localH, cloudM, cloudH, validIds);
              nextBooks[bookId] = merged;
              commitScopedProgressTransaction(
                keys.masteredKey,
                keys.hardKey,
                merged.mastered,
                merged.hard
              );

              if (
                u.emailVerified &&
                (!areSetsEqual(merged.mastered, cloudM) || !areSetsEqual(merged.hard, cloudH))
              ) {
                await enqueueBookProgressWrite(u, bookId, () => merged, false);
              }
            } else {
              progressDocExistsRef.current[bookId] = false;
              const cleanLocal = normalizeDisjointSets(localM, localH, validIds);
              nextBooks[bookId] = cleanLocal;
              commitScopedProgressTransaction(
                keys.masteredKey,
                keys.hardKey,
                cleanLocal.mastered,
                cleanLocal.hard
              );
              if (u.emailVerified && (cleanLocal.mastered.size > 0 || cleanLocal.hard.size > 0)) {
                await enqueueBookProgressWrite(u, bookId, () => cleanLocal, false);
              }
            }
          } catch (err) {
            const isQuota = handleQuotaOrLog(err, OperationType.GET, path, false);
            if (isQuota) return;
            nextBooks[bookId] = normalizeDisjointSets(localM, localH, validIds);
          }
        }

        setBooksProgress(nextBooks);

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
        setSyncing(false);
      }
    },
    [ensureUserProfileDoc, validIdsByBook, enqueueBookProgressWrite, handleQuotaOrLog, showToast]
  );

  // Trigger initial sync when auth state settles & dataset is ready
  useEffect(() => {
    if (!authReady || !datasetReady) return;
    if (!user) {
      clearPendingWriteTimers();
      userProfileDocExistsRef.current = false;
      profileInitPromiseRef.current = null;
      progressDocExistsRef.current = createBookRecord(() => false);
      quizDocExistsRef.current = createBookRecord(() => false);
      loadedQuizCloudBooksRef.current.clear();
      setCustomDisplayName('');
      setCustomAvatarUrl('');
      setOfflineFallback(false);
      return;
    }

    const announce = justSignedInRef.current;
    justSignedInRef.current = false;
    void syncAllFromCloud(user, announce);
  }, [
    authReady,
    datasetReady,
    user,
    authVersion,
    justSignedInRef,
    syncAllFromCloud,
    clearPendingWriteTimers,
  ]);

  // Lazy-load quiz history from cloud only when user opens Quiz tab for a book
  useEffect(() => {
    if (!user || !user.emailVerified || !datasetReady || activeTab !== 'quiz') return;
    if (offlineFallbackRef.current) return;
    const cacheKey = `${user.uid}:${activeBookId}`;
    if (loadedQuizCloudBooksRef.current.has(cacheKey)) return;

    let cancelled = false;
    const run = async () => {
      setQuizHistorySyncing(true);
      try {
        const parentOk = await ensureUserProfileDoc(user);
        if (!parentOk || cancelled) return;

        const path = `users/${user.uid}/quizHistory/${activeBookId}`;
        const ref = doc(db, 'users', user.uid, 'quizHistory', activeBookId);
        const snap = await getDoc(ref);
        if (cancelled) return;

        const localList = loadQuizHistory(activeBookId);
        if (snap.exists()) {
          quizDocExistsRef.current[activeBookId] = true;
          const data = snap.data();
          const rawTokens = Array.isArray(data.sessions) ? data.sessions : [];
          const decoded: QuizSessionHistoryEntry[] = [];
          for (const tok of rawTokens) {
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
        handleQuotaOrLog(
          err,
          OperationType.GET,
          `users/${user.uid}/quizHistory/${activeBookId}`,
          false
        );
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
    ensureUserProfileDoc,
    patternById,
    enqueueQuizHistoryWrite,
    handleQuotaOrLog,
  ]);

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
    [user, enqueueQuizHistoryWrite]
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
    [user, enqueueQuizHistoryWrite, showToast]
  );

  const handleManualSync = useCallback(async () => {
    if (!user || !user.emailVerified) return;
    offlineFallbackRef.current = false;
    setOfflineFallback(false);
    loadedQuizCloudBooksRef.current.clear();
    await syncAllFromCloud(user, true);
  }, [user, syncAllFromCloud]);

  const handleSaveProfile = useCallback(
    async (displayName: string, avatarUrl: string): Promise<boolean> => {
      if (!user) return false;
      const cleanName = sanitizeDisplayName(displayName);
      if (!cleanName) return false;
      if (!isValidAvatarUrl(avatarUrl)) {
        showToast('error', 'URL Foto Tidak Valid', 'Gunakan gambar unggahan atau tautan https://.');
        return false;
      }

      setProfileSaving(true);
      try {
        await updateProfile(user, { displayName: cleanName });
        if (user.emailVerified && !offlineFallbackRef.current) {
          const parentOk = await ensureUserProfileDoc(user);
          if (parentOk) {
            const ref = doc(db, 'users', user.uid);
            await updateDoc(ref, {
              displayName: cleanName,
              avatarUrl,
              updatedAt: serverTimestamp(),
            });
          }
        }
        setCustomDisplayName(cleanName);
        setCustomAvatarUrl(avatarUrl);
        showToast('success', 'Profil Diperbarui', 'Nama dan foto profil Anda telah disimpan.');
        return true;
      } catch (err) {
        showToast(
          'error',
          'Gagal Memperbarui Profil',
          err instanceof Error ? err.message : 'Tidak dapat menyimpan profil saat ini.'
        );
        return false;
      } finally {
        setProfileSaving(false);
      }
    },
    [user, ensureUserProfileDoc, showToast]
  );

  const resetCloudAndLocalProgress = useCallback(() => {
    clearPendingWriteTimers();
    clearAllStoredProgress();
    const empty = createEmptyAllBooksProgress();
    booksProgressRef.current = empty;
    setBooksProgress(empty);
    setQuizHistories(createEmptyAllBooksQuizHistory());
    userProfileDocExistsRef.current = false;
    profileInitPromiseRef.current = null;
    progressDocExistsRef.current = createBookRecord(() => false);
    quizDocExistsRef.current = createBookRecord(() => false);
    loadedQuizCloudBooksRef.current.clear();
    return { emptyM: new Set<string>(), emptyH: new Set<string>() };
  }, [clearPendingWriteTimers]);

  return {
    booksProgress,
    quizHistories,
    syncing,
    quizHistorySyncing,
    fatalError,
    offlineFallback,
    enableOfflineFallback,
    customDisplayName,
    customAvatarUrl,
    profileModalOpen,
    setProfileModalOpen,
    profileSaving,
    applyProgressChange,
    handleRecordQuizSession,
    handleClearQuizHistory,
    handleManualSync,
    handleSaveProfile,
    resetCloudAndLocalProgress,
  };
}
