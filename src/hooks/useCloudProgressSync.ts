import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { updateProfile, type User } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import {
  OperationType,
  db,
  handleFirestoreError,
  isFirestoreQuotaError,
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

function createEmptyAllBooksProgress(): AllBooksProgress {
  return {
    introductory: { mastered: new Set(), hard: new Set() },
    elementary1: { mastered: new Set(), hard: new Set() },
    elementary2: { mastered: new Set(), hard: new Set() },
  };
}

function createEmptyAllBooksQuizHistory(): AllBooksQuizHistory {
  return {
    introductory: [],
    elementary1: [],
    elementary2: [],
  };
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
  bumpAuthVersion: () => void;
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
  bumpAuthVersion,
  showToast,
}: UseCloudProgressSyncOptions) {
  const [booksProgress, setBooksProgress] = useState<AllBooksProgress>(createEmptyAllBooksProgress);
  const [quizHistories, setQuizHistories] = useState<AllBooksQuizHistory>(
    createEmptyAllBooksQuizHistory
  );

  const [syncing, setSyncing] = useState(false);
  const [quizHistorySyncing, setQuizHistorySyncing] = useState(false);
  const [fatalError, setFatalError] = useState<Error | null>(null);

  const [customDisplayName, setCustomDisplayName] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const userProfileDocExistsRef = useRef(false);
  const progressDocExistsRef = useRef<Record<BookId, boolean>>({
    introductory: false,
    elementary1: false,
    elementary2: false,
  });
  const quizDocExistsRef = useRef<Record<BookId, boolean>>({
    introductory: false,
    elementary1: false,
    elementary2: false,
  });
  const loadedQuizCloudBooksRef = useRef<Set<string>>(new Set());

  const booksProgressRef = useRef(booksProgress);
  booksProgressRef.current = booksProgress;

  const quizHistoriesRef = useRef(quizHistories);
  quizHistoriesRef.current = quizHistories;

  // Hydrate local storage once dataset valid IDs are parsed
  useEffect(() => {
    if (!datasetReady) return;
    const loadedProgress: AllBooksProgress = {
      introductory: normalizeDisjointSets(
        safeLoadSet(BOOK_STORAGE_KEYS.introductory.masteredKey, validIdsByBook.introductory),
        safeLoadSet(BOOK_STORAGE_KEYS.introductory.hardKey, validIdsByBook.introductory),
        validIdsByBook.introductory
      ),
      elementary1: normalizeDisjointSets(
        safeLoadSet(BOOK_STORAGE_KEYS.elementary1.masteredKey, validIdsByBook.elementary1),
        safeLoadSet(BOOK_STORAGE_KEYS.elementary1.hardKey, validIdsByBook.elementary1),
        validIdsByBook.elementary1
      ),
      elementary2: normalizeDisjointSets(
        safeLoadSet(BOOK_STORAGE_KEYS.elementary2.masteredKey, validIdsByBook.elementary2),
        safeLoadSet(BOOK_STORAGE_KEYS.elementary2.hardKey, validIdsByBook.elementary2),
        validIdsByBook.elementary2
      ),
    };
    setBooksProgress(loadedProgress);

    setQuizHistories({
      introductory: loadQuizHistory('introductory'),
      elementary1: loadQuizHistory('elementary1'),
      elementary2: loadQuizHistory('elementary2'),
    });
  }, [datasetReady, validIdsByBook]);

  const ensureUserProfileDoc = useCallback(async (u: User): Promise<boolean> => {
    if (userProfileDocExistsRef.current) return true;
    const path = `users/${u.uid}`;
    const ref = doc(db, 'users', u.uid);
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
      if (isFirestoreQuotaError(err)) {
        setFatalError(err instanceof Error ? err : new Error(String(err)));
        return false;
      }
      try {
        handleFirestoreError(err, OperationType.WRITE, path);
      } catch (wrapped) {
        console.error(wrapped);
      }
      return false;
    }
  }, []);

  const writeBookProgressToCloud = useCallback(
    async (u: User, bookId: BookId, mastered: Set<string>, hard: Set<string>) => {
      if (!u.emailVerified) return;
      const parentOk = await ensureUserProfileDoc(u);
      if (!parentOk) return;

      const path = `users/${u.uid}/bunpouProgress/${bookId}`;
      const ref = doc(db, 'users', u.uid, 'bunpouProgress', bookId);
      const validIds = validIdsByBook[bookId];
      const clean = normalizeDisjointSets(mastered, hard, validIds);
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
        if (isFirestoreQuotaError(err)) {
          setFatalError(err instanceof Error ? err : new Error(String(err)));
          return;
        }
        try {
          handleFirestoreError(err, OperationType.WRITE, path);
        } catch (wrapped) {
          console.error(wrapped);
        }
      }
    },
    [ensureUserProfileDoc, validIdsByBook]
  );

  const writeQuizHistoryToCloud = useCallback(
    async (u: User, bookId: BookId, entries: readonly QuizSessionHistoryEntry[]) => {
      if (!u.emailVerified) return;
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
        if (isFirestoreQuotaError(err)) {
          setFatalError(err instanceof Error ? err : new Error(String(err)));
          return;
        }
        try {
          handleFirestoreError(err, OperationType.WRITE, path);
        } catch (wrapped) {
          console.error(wrapped);
        }
      }
    },
    [ensureUserProfileDoc]
  );

  const syncAllFromCloud = useCallback(
    async (u: User, announce: boolean) => {
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
                await writeBookProgressToCloud(u, bookId, merged.mastered, merged.hard);
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
                await writeBookProgressToCloud(u, bookId, cleanLocal.mastered, cleanLocal.hard);
              }
            }
          } catch (err) {
            if (isFirestoreQuotaError(err)) {
              setFatalError(err instanceof Error ? err : new Error(String(err)));
              return;
            }
            try {
              handleFirestoreError(err, OperationType.GET, path);
            } catch (wrapped) {
              console.error(wrapped);
            }
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
    [ensureUserProfileDoc, validIdsByBook, writeBookProgressToCloud, showToast]
  );

  // Trigger initial sync when auth state settles & dataset is ready
  useEffect(() => {
    if (!authReady || !datasetReady) return;
    if (!user) {
      userProfileDocExistsRef.current = false;
      progressDocExistsRef.current = {
        introductory: false,
        elementary1: false,
        elementary2: false,
      };
      quizDocExistsRef.current = {
        introductory: false,
        elementary1: false,
        elementary2: false,
      };
      loadedQuizCloudBooksRef.current.clear();
      setCustomDisplayName('');
      setCustomAvatarUrl('');
      return;
    }

    const announce = justSignedInRef.current;
    justSignedInRef.current = false;
    void syncAllFromCloud(user, announce);
  }, [authReady, datasetReady, user, authVersion, justSignedInRef, syncAllFromCloud]);

  // Lazy-load quiz history from cloud only when user opens Quiz tab for a book
  useEffect(() => {
    if (!user || !user.emailVerified || !datasetReady || activeTab !== 'quiz') return;
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
            await writeQuizHistoryToCloud(user, activeBookId, merged);
          }
        } else {
          quizDocExistsRef.current[activeBookId] = false;
          if (localList.length > 0) {
            await writeQuizHistoryToCloud(user, activeBookId, localList);
          }
        }
        loadedQuizCloudBooksRef.current.add(cacheKey);
      } catch (err) {
        if (isFirestoreQuotaError(err)) {
          setFatalError(err instanceof Error ? err : new Error(String(err)));
        } else {
          try {
            handleFirestoreError(
              err,
              OperationType.GET,
              `users/${user.uid}/quizHistory/${activeBookId}`
            );
          } catch (wrapped) {
            console.error(wrapped);
          }
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
    ensureUserProfileDoc,
    patternById,
    writeQuizHistoryToCloud,
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

      setBooksProgress(prev => ({
        ...prev,
        [bId]: clean,
      }));

      if (user && user.emailVerified) {
        void writeBookProgressToCloud(user, bId, clean.mastered, clean.hard);
      }
      return true;
    },
    [activeBookId, validIdsByBook, user, writeBookProgressToCloud, showToast]
  );

  const handleRecordQuizSession = useCallback(
    (input: RecordQuizSessionInput) => {
      const entry = createQuizSessionEntry(input);
      const prev = quizHistoriesRef.current[input.bookId] ?? [];
      const next = [entry, ...prev].slice(0, MAX_QUIZ_HISTORY_ENTRIES);
      saveQuizHistory(input.bookId, next);
      setQuizHistories(curr => ({ ...curr, [input.bookId]: next }));

      if (user && user.emailVerified) {
        void writeQuizHistoryToCloud(user, input.bookId, next);
      }
    },
    [user, writeQuizHistoryToCloud]
  );

  const handleClearQuizHistory = useCallback(
    (bookId: BookId) => {
      saveQuizHistory(bookId, []);
      setQuizHistories(curr => ({ ...curr, [bookId]: [] }));
      if (user && user.emailVerified) {
        void writeQuizHistoryToCloud(user, bookId, []);
      }
      showToast('info', 'Riwayat Kuis Dihapus', `Riwayat skor ${BOOK_STORAGE_KEYS[bookId].label} telah dikosongkan.`);
    },
    [user, writeQuizHistoryToCloud, showToast]
  );

  const handleManualSync = useCallback(async () => {
    if (!user || !user.emailVerified) return;
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
        if (user.emailVerified) {
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
        bumpAuthVersion();
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
    [user, ensureUserProfileDoc, bumpAuthVersion, showToast]
  );

  const resetCloudAndLocalProgress = useCallback(() => {
    clearAllStoredProgress();
    const empty = createEmptyAllBooksProgress();
    setBooksProgress(empty);
    setQuizHistories(createEmptyAllBooksQuizHistory());
    userProfileDocExistsRef.current = false;
    progressDocExistsRef.current = {
      introductory: false,
      elementary1: false,
      elementary2: false,
    };
    quizDocExistsRef.current = {
      introductory: false,
      elementary1: false,
      elementary2: false,
    };
    loadedQuizCloudBooksRef.current.clear();
    return { emptyM: new Set<string>(), emptyH: new Set<string>() };
  }, []);

  return {
    booksProgress,
    quizHistories,
    syncing,
    quizHistorySyncing,
    fatalError,
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
