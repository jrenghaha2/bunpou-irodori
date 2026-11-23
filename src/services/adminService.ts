import {
  Timestamp,
  collection,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type Unsubscribe,
} from 'firebase/firestore';
import { OperationType, db, logFirestoreError } from '../firebase';
import type {
  AppTab,
  BookId,
  BunpouPattern,
  QuizFocus,
  QuizSessionHistoryEntry,
  UserRole,
} from '../types/bunpou';
import { BOOK_ORDER } from '../types/bunpou';
import {
  isBootstrapSuperAdminEmail,
  normalizeEmail,
  normalizeStoredRole,
  truncateText,
  type ActivityEventRecord,
  type ActivityEventType,
  type AdminUserRecord,
  type LiveActivityRecord,
  type LiveActivityType,
  type UserMonitorMetrics,
} from '../utils/adminRoles';
import { isValidAvatarUrl, sanitizeDisplayName, sanitizeIdArray } from '../utils/bunpouSync';
import { decodeQuizSessionToken } from '../utils/quizStats';
import {
  fetchBookProgressDoc,
  fetchQuizHistoryDoc,
  subscribeBookProgressDoc,
  subscribeQuizHistoryDoc,
} from './cloudSyncService';

function toMillis(val: unknown): number {
  if (val instanceof Timestamp) return val.toMillis();
  if (val && typeof val === 'object' && 'toMillis' in val && typeof (val as { toMillis: unknown }).toMillis === 'function') {
    return (val as { toMillis: () => number }).toMillis();
  }
  return 0;
}

function normalizeBookId(raw: unknown): BookId {
  if (raw === 'elementary1' || raw === 'elementary2') return raw;
  return 'introductory';
}

function normalizeAppTab(raw: unknown): AppTab {
  if (raw === 'list' || raw === 'quiz' || raw === 'guide' || raw === 'admin') return raw;
  return 'card';
}

function normalizeActivityType(raw: unknown): LiveActivityType {
  if (
    raw === 'browsing' ||
    raw === 'flashcard' ||
    raw === 'list' ||
    raw === 'quiz_running' ||
    raw === 'quiz_finished' ||
    raw === 'guide' ||
    raw === 'admin'
  ) {
    return raw;
  }
  return 'browsing';
}

function normalizeEventType(raw: unknown): ActivityEventType {
  if (raw === 'quiz_started' || raw === 'quiz_completed' || raw === 'progress_milestone') {
    return raw;
  }
  return 'quiz_completed';
}

function normalizeEventFocus(raw: unknown): QuizFocus | 'none' {
  if (raw === 'mixed' || raw === 'cloze' || raw === 'formula' || raw === 'function') return raw;
  return 'none';
}

function clampInt(val: unknown, min: number, max: number): number {
  const n = typeof val === 'number' && Number.isFinite(val) ? Math.trunc(val) : min;
  return Math.max(min, Math.min(max, n));
}

export interface UpsertLiveActivityInput {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  activeBookId: BookId;
  activeTab: AppTab;
  activeChapterLabel: string;
  activityType: LiveActivityType;
  activitySummary: string;
  quizLiveCurrent: number;
  quizLiveTotal: number;
  quizLiveCorrect: number;
  masteredTotal: number;
  hardTotal: number;
  introMastered: number;
  elem1Mastered: number;
  elem2Mastered: number;
  latestQuizScore: number;
  latestQuizSummary: string;
  quizSessionCount: number;
}

export async function checkLiveActivityExists(uid: string): Promise<boolean> {
  const path = `liveActivity/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'liveActivity', uid));
    return snap.exists();
  } catch (err) {
    logFirestoreError(err, OperationType.GET, path);
    return false;
  }
}

export async function upsertLiveActivity(
  input: UpsertLiveActivityInput,
  docExists: boolean
): Promise<boolean> {
  const path = `liveActivity/${input.uid}`;
  const ref = doc(db, 'liveActivity', input.uid);

  const safeTotal = clampInt(input.quizLiveTotal, 0, 300);
  const safeCorrect = clampInt(input.quizLiveCorrect, 0, safeTotal);
  const safeCurrent = clampInt(input.quizLiveCurrent, 0, 300);

  const baseFields = {
    displayName: sanitizeDisplayName(input.displayName || 'Pembelajar'),
    email: normalizeEmail(input.email),
    avatarUrl: isValidAvatarUrl(input.avatarUrl) ? input.avatarUrl : '',
    activeBookId: input.activeBookId,
    activeTab: input.activeTab,
    activeChapterLabel: truncateText(input.activeChapterLabel || 'Semua Bab', 80),
    activityType: input.activityType,
    activitySummary: truncateText(input.activitySummary || 'Sedang belajar Irodori Bunpou', 180),
    quizLiveCurrent: safeCurrent,
    quizLiveTotal: safeTotal,
    quizLiveCorrect: safeCorrect,
    masteredTotal: clampInt(input.masteredTotal, 0, 300),
    hardTotal: clampInt(input.hardTotal, 0, 300),
    introMastered: clampInt(input.introMastered, 0, 150),
    elem1Mastered: clampInt(input.elem1Mastered, 0, 150),
    elem2Mastered: clampInt(input.elem2Mastered, 0, 150),
    latestQuizScore: clampInt(input.latestQuizScore, -1, 100),
    latestQuizSummary: truncateText(input.latestQuizSummary || '', 180),
    quizSessionCount: clampInt(input.quizSessionCount, 0, 9999),
    updatedAt: serverTimestamp(),
  };

  if (docExists) {
    try {
      await updateDoc(ref, baseFields);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes('No document to update') && !msg.includes('not-found')) {
        logFirestoreError(err, OperationType.UPDATE, path);
        throw err;
      }
      // Fall through to create when document does not exist yet
    }
  }

  try {
    await setDoc(ref, {
      uid: input.uid,
      ...baseFields,
      createdAt: serverTimestamp(),
    });
    return true;
  } catch (err) {
    logFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

export interface LogActivityEventInput {
  uid: string;
  displayName: string;
  email: string;
  eventType: ActivityEventType;
  bookId: BookId;
  scopeLabel: string;
  focus: QuizFocus | 'none';
  correct: number;
  total: number;
  score: number;
  summary: string;
}

export async function logActivityEvent(input: LogActivityEventInput): Promise<void> {
  const rand = Math.random().toString(36).slice(2, 8);
  const eventId = `ev_${Date.now()}_${rand}`;
  const path = `activityEvents/${eventId}`;

  const safeTotal = clampInt(input.total, 0, 300);
  const safeCorrect = clampInt(input.correct, 0, safeTotal);

  try {
    await setDoc(doc(db, 'activityEvents', eventId), {
      uid: input.uid,
      displayName: sanitizeDisplayName(input.displayName || 'Pembelajar') || 'Pembelajar',
      email: normalizeEmail(input.email),
      eventType: input.eventType,
      bookId: input.bookId,
      scopeLabel: truncateText(input.scopeLabel || 'Semua Bab', 80),
      focus: input.focus,
      correct: safeCorrect,
      total: safeTotal,
      score: clampInt(input.score, -1, 100),
      summary: truncateText(input.summary || 'Aktivitas belajar', 200),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    logFirestoreError(err, OperationType.CREATE, path);
    throw err;
  }
}

export function subscribeLiveActivities(
  onData: (records: LiveActivityRecord[]) => void,
  onError: (err: unknown) => void
): Unsubscribe {
  const path = 'liveActivity';
  const q = query(collection(db, path), orderBy('updatedAt', 'desc'), limit(100));
  return onSnapshot(
    q,
    snap => {
      const items: LiveActivityRecord[] = snap.docs.map(d => {
        const data = d.data();
        return {
          uid: typeof data.uid === 'string' ? data.uid : d.id,
          displayName:
            typeof data.displayName === 'string' && data.displayName.trim()
              ? data.displayName
              : 'Pembelajar',
          email: typeof data.email === 'string' ? data.email : '',
          avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : '',
          activeBookId: normalizeBookId(data.activeBookId),
          activeTab: normalizeAppTab(data.activeTab),
          activeChapterLabel:
            typeof data.activeChapterLabel === 'string' ? data.activeChapterLabel : 'Semua Bab',
          activityType: normalizeActivityType(data.activityType),
          activitySummary:
            typeof data.activitySummary === 'string'
              ? data.activitySummary
              : 'Sedang belajar Irodori Bunpou',
          quizLiveCurrent: clampInt(data.quizLiveCurrent, 0, 300),
          quizLiveTotal: clampInt(data.quizLiveTotal, 0, 300),
          quizLiveCorrect: clampInt(data.quizLiveCorrect, 0, 300),
          masteredTotal: clampInt(data.masteredTotal, 0, 300),
          hardTotal: clampInt(data.hardTotal, 0, 300),
          introMastered: clampInt(data.introMastered, 0, 150),
          elem1Mastered: clampInt(data.elem1Mastered, 0, 150),
          elem2Mastered: clampInt(data.elem2Mastered, 0, 150),
          latestQuizScore: clampInt(data.latestQuizScore, -1, 100),
          latestQuizSummary:
            typeof data.latestQuizSummary === 'string' ? data.latestQuizSummary : '',
          quizSessionCount: clampInt(data.quizSessionCount, 0, 9999),
          updatedAtMs: toMillis(data.updatedAt),
        };
      });
      onData(items);
    },
    err => {
      logFirestoreError(err, OperationType.LIST, path);
      onError(err);
    }
  );
}

export function subscribeActivityEvents(
  onData: (records: ActivityEventRecord[]) => void,
  onError: (err: unknown) => void
): Unsubscribe {
  const path = 'activityEvents';
  const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(60));
  return onSnapshot(
    q,
    snap => {
      const items: ActivityEventRecord[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          uid: typeof data.uid === 'string' ? data.uid : '',
          displayName:
            typeof data.displayName === 'string' && data.displayName.trim()
              ? data.displayName
              : 'Pembelajar',
          email: typeof data.email === 'string' ? data.email : '',
          eventType: normalizeEventType(data.eventType),
          bookId: normalizeBookId(data.bookId),
          scopeLabel: typeof data.scopeLabel === 'string' ? data.scopeLabel : 'Semua Bab',
          focus: normalizeEventFocus(data.focus),
          correct: clampInt(data.correct, 0, 300),
          total: clampInt(data.total, 0, 300),
          score: clampInt(data.score, -1, 100),
          summary: typeof data.summary === 'string' ? data.summary : '',
          createdAtMs: toMillis(data.createdAt),
        };
      });
      onData(items);
    },
    err => {
      logFirestoreError(err, OperationType.LIST, path);
      onError(err);
    }
  );
}

export function subscribeAdminUsers(
  onData: (users: AdminUserRecord[]) => void,
  onError: (err: unknown) => void
): Unsubscribe {
  const path = 'users';
  const q = query(collection(db, path), limit(100));
  return onSnapshot(
    q,
    snap => {
      const items: AdminUserRecord[] = snap.docs.map(d => {
        const data = d.data();
        const email = typeof data.email === 'string' ? data.email : '';
        const storedRole = normalizeStoredRole(data.role);
        const effectiveRole = isBootstrapSuperAdminEmail(email) ? 'superadmin' : storedRole;
        return {
          uid: typeof data.uid === 'string' ? data.uid : d.id,
          displayName:
            typeof data.displayName === 'string' && data.displayName.trim()
              ? data.displayName
              : email.split('@')[0] || 'Pembelajar',
          email,
          avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : '',
          role: effectiveRole,
          createdAtMs: toMillis(data.createdAt),
          updatedAtMs: toMillis(data.updatedAt),
        };
      });
      onData(items);
    },
    err => {
      logFirestoreError(err, OperationType.LIST, path);
      onError(err);
    }
  );
}

export async function updateTargetUserRole(
  targetUid: string,
  nextRole: UserRole
): Promise<void> {
  const path = `users/${targetUid}`;
  try {
    await updateDoc(doc(db, 'users', targetUid), {
      role: nextRole,
      updatedAt: serverTimestamp(),
    });
  } catch (err) {
    logFirestoreError(err, OperationType.UPDATE, path);
    throw err;
  }
}

function parseTokenMeta(token: string): { completedAtMs: number; score: number } | null {
  const parts = token.split('|');
  if (parts.length < 6) return null;
  const dt = Date.parse(parts[1]);
  const score = Number(parts[5]);
  if (!Number.isFinite(score) || score < 0 || score > 100) return null;
  return {
    completedAtMs: Number.isFinite(dt) ? dt : 0,
    score: Math.round(score),
  };
}

export async function fetchUserSummaryMetrics(
  targetUid: string,
  validIdsByBook: Record<BookId, Set<string>>
): Promise<UserMonitorMetrics> {
  let introMastered = 0;
  let elem1Mastered = 0;
  let elem2Mastered = 0;
  let hardTotal = 0;
  let quizSessionCount = 0;
  let latestQuizScore = -1;
  let latestQuizAtMs = 0;

  await Promise.all(
    BOOK_ORDER.map(async bookId => {
      try {
        const pSnap = await fetchBookProgressDoc(targetUid, bookId);
        if (pSnap.exists) {
          const mCount = sanitizeIdArray(pSnap.mastered, validIdsByBook[bookId]).length;
          const hCount = sanitizeIdArray(pSnap.hard, validIdsByBook[bookId]).length;
          hardTotal += hCount;
          if (bookId === 'introductory') introMastered = mCount;
          else if (bookId === 'elementary1') elem1Mastered = mCount;
          else elem2Mastered = mCount;
        }
      } catch {
        // Non-fatal: keep zero if permission or doc read fails
      }

      try {
        const qSnap = await fetchQuizHistoryDoc(targetUid, bookId);
        if (qSnap.exists && Array.isArray(qSnap.sessions)) {
          const validTokens = qSnap.sessions.filter((t): t is string => typeof t === 'string');
          quizSessionCount += validTokens.length;
          for (const tok of validTokens) {
            const meta = parseTokenMeta(tok);
            if (meta && meta.completedAtMs >= latestQuizAtMs) {
              latestQuizAtMs = meta.completedAtMs;
              latestQuizScore = meta.score;
            }
          }
        }
      } catch {
        // Non-fatal
      }
    })
  );

  return {
    masteredTotal: introMastered + elem1Mastered + elem2Mastered,
    hardTotal,
    introMastered,
    elem1Mastered,
    elem2Mastered,
    quizSessionCount,
    latestQuizScore,
    latestActivityMs: latestQuizAtMs,
  };
}

export interface UserBookDetailedMonitoring {
  bookId: BookId;
  masteredCount: number;
  hardCount: number;
  masteredIds: string[];
  hardIds: string[];
  quizSessions: QuizSessionHistoryEntry[];
}

export interface UserDetailedMonitoring {
  uid: string;
  books: Record<BookId, UserBookDetailedMonitoring>;
  allQuizSessions: QuizSessionHistoryEntry[];
}

export async function fetchUserDetailedMonitoring(
  targetUid: string,
  validIdsByBook: Record<BookId, Set<string>>,
  patternById: Map<string, BunpouPattern>
): Promise<UserDetailedMonitoring> {
  const results = await Promise.all(
    BOOK_ORDER.map(async bookId => {
      const progressPath = `users/${targetUid}/bunpouProgress/${bookId}`;
      const quizPath = `users/${targetUid}/quizHistory/${bookId}`;

      let masteredIds: string[] = [];
      let hardIds: string[] = [];
      let quizSessions: QuizSessionHistoryEntry[] = [];

      try {
        const pSnap = await fetchBookProgressDoc(targetUid, bookId);
        if (pSnap.exists) {
          masteredIds = sanitizeIdArray(pSnap.mastered, validIdsByBook[bookId]);
          hardIds = sanitizeIdArray(pSnap.hard, validIdsByBook[bookId]);
        }
      } catch (err) {
        logFirestoreError(err, OperationType.GET, progressPath);
      }

      try {
        const qSnap = await fetchQuizHistoryDoc(targetUid, bookId);
        if (qSnap.exists) {
          quizSessions = qSnap.sessions
            .filter((t): t is string => typeof t === 'string')
            .map(t => decodeQuizSessionToken(t, bookId, patternById))
            .filter((entry): entry is QuizSessionHistoryEntry => entry !== null);
        }
      } catch (err) {
        logFirestoreError(err, OperationType.GET, quizPath);
      }

      return {
        bookId,
        masteredCount: masteredIds.length,
        hardCount: hardIds.length,
        masteredIds,
        hardIds,
        quizSessions,
      };
    })
  );

  const books = {} as Record<BookId, UserBookDetailedMonitoring>;
  const allQuizSessions: QuizSessionHistoryEntry[] = [];

  for (const item of results) {
    books[item.bookId] = item;
    allQuizSessions.push(...item.quizSessions);
  }

  allQuizSessions.sort((a, b) => b.completedAt.localeCompare(a.completedAt));

  return {
    uid: targetUid,
    books,
    allQuizSessions,
  };
}

export function detailedMonitoringToMetrics(
  detail: UserDetailedMonitoring
): UserMonitorMetrics {
  const introMastered = detail.books.introductory?.masteredCount ?? 0;
  const elem1Mastered = detail.books.elementary1?.masteredCount ?? 0;
  const elem2Mastered = detail.books.elementary2?.masteredCount ?? 0;
  const hardTotal =
    (detail.books.introductory?.hardCount ?? 0) +
    (detail.books.elementary1?.hardCount ?? 0) +
    (detail.books.elementary2?.hardCount ?? 0);

  const newestQuiz = detail.allQuizSessions[0];
  const latestQuizMs = newestQuiz ? Date.parse(newestQuiz.completedAt) : 0;

  return {
    masteredTotal: introMastered + elem1Mastered + elem2Mastered,
    hardTotal,
    introMastered,
    elem1Mastered,
    elem2Mastered,
    quizSessionCount: detail.allQuizSessions.length,
    latestQuizScore: newestQuiz ? newestQuiz.score : -1,
    latestActivityMs: Number.isFinite(latestQuizMs) ? latestQuizMs : 0,
    authoritativeAtMs: Date.now(),
  };
}

/**
 * Attaches 6 real-time Firestore document listeners (3 bunpouProgress + 3 quizHistory)
 * for a target user so Admin/Superadmin sees mastery & quiz updates live without refreshing.
 * Uses individual `doc()` get listeners to remain 100% compliant with `allow list: if false`.
 */
export function subscribeUserDetailedMonitoring(
  targetUid: string,
  validIdsByBook: Record<BookId, Set<string>>,
  patternById: Map<string, BunpouPattern>,
  onData: (detail: UserDetailedMonitoring) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const booksState: Record<BookId, UserBookDetailedMonitoring> = {
    introductory: {
      bookId: 'introductory',
      masteredCount: 0,
      hardCount: 0,
      masteredIds: [],
      hardIds: [],
      quizSessions: [],
    },
    elementary1: {
      bookId: 'elementary1',
      masteredCount: 0,
      hardCount: 0,
      masteredIds: [],
      hardIds: [],
      quizSessions: [],
    },
    elementary2: {
      bookId: 'elementary2',
      masteredCount: 0,
      hardCount: 0,
      masteredIds: [],
      hardIds: [],
      quizSessions: [],
    },
  };

  const settledStreams = new Set<string>();
  const totalStreams = BOOK_ORDER.length * 2;
  let emittedOnce = false;
  let active = true;

  const emitSnapshot = () => {
    if (!active) return;
    if (!emittedOnce && settledStreams.size < totalStreams) return;
    emittedOnce = true;

    const booksCopy: Record<BookId, UserBookDetailedMonitoring> = {
      introductory: { ...booksState.introductory },
      elementary1: { ...booksState.elementary1 },
      elementary2: { ...booksState.elementary2 },
    };
    const allQuizSessions: QuizSessionHistoryEntry[] = [
      ...booksState.introductory.quizSessions,
      ...booksState.elementary1.quizSessions,
      ...booksState.elementary2.quizSessions,
    ].sort((a, b) => b.completedAt.localeCompare(a.completedAt));

    onData({
      uid: targetUid,
      books: booksCopy,
      allQuizSessions,
    });
  };

  const unsubs: Unsubscribe[] = [];

  for (const bookId of BOOK_ORDER) {
    const progressKey = `progress:${bookId}`;
    const progressPath = `users/${targetUid}/bunpouProgress/${bookId}`;

    unsubs.push(
      subscribeBookProgressDoc(
        targetUid,
        bookId,
        snap => {
          if (snap.exists) {
            const masteredIds = sanitizeIdArray(snap.mastered, validIdsByBook[bookId]);
            const hardIds = sanitizeIdArray(snap.hard, validIdsByBook[bookId]);
            booksState[bookId] = {
              ...booksState[bookId],
              masteredCount: masteredIds.length,
              hardCount: hardIds.length,
              masteredIds,
              hardIds,
            };
          } else {
            booksState[bookId] = {
              ...booksState[bookId],
              masteredCount: 0,
              hardCount: 0,
              masteredIds: [],
              hardIds: [],
            };
          }
          settledStreams.add(progressKey);
          emitSnapshot();
        },
        err => {
          logFirestoreError(err, OperationType.GET, progressPath);
          settledStreams.add(progressKey);
          emitSnapshot();
          onError?.(err);
        }
      )
    );

    const quizKey = `quiz:${bookId}`;
    const quizPath = `users/${targetUid}/quizHistory/${bookId}`;

    unsubs.push(
      subscribeQuizHistoryDoc(
        targetUid,
        bookId,
        snap => {
          const decoded = snap.exists
            ? snap.sessions
                .filter((t): t is string => typeof t === 'string')
                .map(t => decodeQuizSessionToken(t, bookId, patternById))
                .filter((entry): entry is QuizSessionHistoryEntry => entry !== null)
            : [];
          booksState[bookId] = {
            ...booksState[bookId],
            quizSessions: decoded,
          };
          settledStreams.add(quizKey);
          emitSnapshot();
        },
        err => {
          logFirestoreError(err, OperationType.GET, quizPath);
          settledStreams.add(quizKey);
          emitSnapshot();
          onError?.(err);
        }
      )
    );
  }

  return () => {
    active = false;
    for (const unsub of unsubs) unsub();
  };
}
