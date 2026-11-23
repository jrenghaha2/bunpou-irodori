import { useCallback, useEffect, useRef } from 'react';
import type { User } from 'firebase/auth';
import {
  checkLiveActivityExists,
  logActivityEvent,
  upsertLiveActivity,
  type UpsertLiveActivityInput,
} from '../services/adminService';
import type {
  AllBooksProgress,
  AllBooksQuizHistory,
  AppTab,
  BookId,
  BunpouPattern,
} from '../types/bunpou';
import { BOOK_ORDER } from '../types/bunpou';
import {
  getBookLabelId,
  getQuizFocusLabelId,
  truncateText,
  type LiveActivityType,
  type LiveQuizSnapshot,
} from '../utils/adminRoles';

const ACTIVITY_DEBOUNCE_MS = 1_200;
const METRIC_URGENT_DEBOUNCE_MS = 200;
const PRESENCE_HEARTBEAT_MS = 90_000;

interface UseLiveActivityTrackerOptions {
  user: User | null;
  offlineFallback: boolean;
  progressReady: boolean;
  quizHistoryReady: boolean;
  displayName: string;
  avatarUrl: string;
  activeBookId: BookId;
  activeTab: AppTab;
  chapterLabel: string;
  currentPattern: BunpouPattern | null;
  booksProgress: AllBooksProgress;
  quizHistories: AllBooksQuizHistory;
  liveQuiz: LiveQuizSnapshot | null;
  ensureUserProfileDoc: (u: User) => Promise<boolean>;
}

function summarizeLatestQuiz(quizHistories: AllBooksQuizHistory): {
  latestScore: number;
  latestSummary: string;
  totalSessions: number;
} {
  let totalSessions = 0;
  let newest: {
    completedAt: string;
    score: number;
    summary: string;
  } | null = null;

  for (const bookId of BOOK_ORDER) {
    const list = quizHistories[bookId] ?? [];
    totalSessions += list.length;
    for (const entry of list) {
      if (!newest || entry.completedAt > newest.completedAt) {
        const bookLabel = getBookLabelId(entry.bookId);
        const focusLabel = getQuizFocusLabelId(entry.focus);
        newest = {
          completedAt: entry.completedAt,
          score: entry.score,
          summary: truncateText(
            `${bookLabel} · ${entry.scopeLabel} · ${focusLabel} · ${entry.correct}/${entry.total} (${entry.score}%)`,
            180
          ),
        };
      }
    }
  }

  return {
    latestScore: newest ? newest.score : -1,
    latestSummary: newest ? newest.summary : '',
    totalSessions,
  };
}

export function useLiveActivityTracker({
  user,
  offlineFallback,
  progressReady,
  quizHistoryReady,
  displayName,
  avatarUrl,
  activeBookId,
  activeTab,
  chapterLabel,
  currentPattern,
  booksProgress,
  quizHistories,
  liveQuiz,
  ensureUserProfileDoc,
}: UseLiveActivityTrackerOptions) {
  const liveDocExistsRef = useRef<Record<string, boolean>>({});
  const lastSignatureRef = useRef<string>('');
  const lastMetricsSignatureRef = useRef<string>('');
  const lastSentAtRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);
  const inFlightRef = useRef<Promise<void>>(Promise.resolve());
  const latestPayloadRef = useRef<UpsertLiveActivityInput | null>(null);
  const activeUidRef = useRef<string | null>(user?.uid ?? null);
  activeUidRef.current = user?.uid ?? null;

  const buildPayload = useCallback((): UpsertLiveActivityInput | null => {
    if (!user || !user.emailVerified || offlineFallback || !progressReady || !quizHistoryReady) {
      return null;
    }

    const bookLabel = getBookLabelId(activeBookId);
    const introMastered = booksProgress.introductory.mastered.size;
    const elem1Mastered = booksProgress.elementary1.mastered.size;
    const elem2Mastered = booksProgress.elementary2.mastered.size;
    const masteredTotal = introMastered + elem1Mastered + elem2Mastered;
    const hardTotal =
      booksProgress.introductory.hard.size +
      booksProgress.elementary1.hard.size +
      booksProgress.elementary2.hard.size;

    const { latestScore, latestSummary, totalSessions } = summarizeLatestQuiz(quizHistories);

    let activityType: LiveActivityType = 'browsing';
    let activitySummary = `Membuka ${bookLabel} (${chapterLabel})`;
    let quizLiveCurrent = 0;
    let quizLiveTotal = 0;
    let quizLiveCorrect = 0;
    let resolvedChapterLabel = chapterLabel;

    if (activeTab === 'quiz' && liveQuiz) {
      resolvedChapterLabel = liveQuiz.scopeLabel || chapterLabel;
      const focusLabel = getQuizFocusLabelId(liveQuiz.focus);
      if (liveQuiz.phase === 'running' && liveQuiz.total > 0) {
        activityType = 'quiz_running';
        quizLiveCurrent = liveQuiz.current;
        quizLiveTotal = liveQuiz.total;
        quizLiveCorrect = liveQuiz.correct;
        activitySummary = `Mengerjakan Kuis ${bookLabel} (${focusLabel}) · Soal ${liveQuiz.current}/${liveQuiz.total} · Benar ${liveQuiz.correct}`;
      } else if (liveQuiz.phase === 'result' && liveQuiz.total > 0) {
        const pct = Math.round((liveQuiz.correct / liveQuiz.total) * 100);
        activityType = 'quiz_finished';
        quizLiveCurrent = liveQuiz.total;
        quizLiveTotal = liveQuiz.total;
        quizLiveCorrect = liveQuiz.correct;
        activitySummary = `Selesai Kuis ${bookLabel} (${focusLabel}): ${liveQuiz.correct}/${liveQuiz.total} (${pct}%)`;
      } else {
        activityType = 'browsing';
        activitySummary = `Menyiapkan Kuis ${bookLabel} (${liveQuiz.scopeLabel || chapterLabel})`;
      }
    } else if (activeTab === 'card') {
      activityType = 'flashcard';
      activitySummary = currentPattern
        ? `Belajar Kartu ${bookLabel} (Bab ${currentPattern.chapterNumber}): ${currentPattern.shortPattern}`
        : `Belajar Kartu Hafalan ${bookLabel} (${chapterLabel})`;
    } else if (activeTab === 'list') {
      activityType = 'list';
      activitySummary = `Membaca Daftar Bunpou ${bookLabel} (${chapterLabel})`;
    } else if (activeTab === 'guide') {
      activityType = 'guide';
      activitySummary = `Melihat Panduan Singkatan & Ringkasan Progres`;
    } else if (activeTab === 'admin') {
      activityType = 'admin';
      activitySummary = `Memantau aktivitas pengguna di Panel Pantau`;
    }

    return {
      uid: user.uid,
      displayName: displayName || user.displayName || user.email?.split('@')[0] || 'Pembelajar',
      email: user.email ?? '',
      avatarUrl,
      activeBookId,
      activeTab,
      activeChapterLabel: truncateText(resolvedChapterLabel, 80),
      activityType,
      activitySummary: truncateText(activitySummary, 180),
      quizLiveCurrent,
      quizLiveTotal,
      quizLiveCorrect,
      masteredTotal,
      hardTotal,
      introMastered,
      elem1Mastered,
      elem2Mastered,
      latestQuizScore: latestScore,
      latestQuizSummary: latestSummary,
      quizSessionCount: totalSessions,
    };
  }, [
    user,
    offlineFallback,
    progressReady,
    quizHistoryReady,
    displayName,
    avatarUrl,
    activeBookId,
    activeTab,
    chapterLabel,
    currentPattern,
    booksProgress,
    quizHistories,
    liveQuiz,
  ]);

  const flushPayload = useCallback(
    (payload: UpsertLiveActivityInput, force: boolean) => {
      if (!user || !user.emailVerified || offlineFallback || !progressReady || !quizHistoryReady) {
        return;
      }
      const signature = JSON.stringify(payload);
      if (!force && signature === lastSignatureRef.current) return;

      lastSignatureRef.current = signature;
      lastSentAtRef.current = Date.now();

      const targetUser = user;
      inFlightRef.current = inFlightRef.current
        .then(async () => {
          if (activeUidRef.current !== targetUser.uid) return;
          const parentOk = await ensureUserProfileDoc(targetUser);
          if (!parentOk || activeUidRef.current !== targetUser.uid) return;

          if (liveDocExistsRef.current[targetUser.uid] === undefined) {
            liveDocExistsRef.current[targetUser.uid] = await checkLiveActivityExists(
              targetUser.uid
            );
          }

          await upsertLiveActivity(payload, Boolean(liveDocExistsRef.current[targetUser.uid]));
          liveDocExistsRef.current[targetUser.uid] = true;
        })
        .catch(() => undefined);
    },
    [user, offlineFallback, progressReady, quizHistoryReady, ensureUserProfileDoc]
  );

  // Publish activity on state changes:
  // - Immediate for live quiz progress & quiz finish
  // - Near-instant (200ms coalesced) whenever hafalan (mastered/hard) or quiz history count changes
  // - Debounced (1.2s) for normal card/tab browsing
  useEffect(() => {
    const payload = buildPayload();
    latestPayloadRef.current = payload;

    if (!payload) {
      lastSignatureRef.current = '';
      lastMetricsSignatureRef.current = '';
      return;
    }

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const metricsSig = `${payload.masteredTotal}:${payload.hardTotal}:${payload.introMastered}:${payload.elem1Mastered}:${payload.elem2Mastered}:${payload.quizSessionCount}:${payload.latestQuizScore}`;
    const metricsChanged =
      lastMetricsSignatureRef.current !== '' && lastMetricsSignatureRef.current !== metricsSig;
    lastMetricsSignatureRef.current = metricsSig;

    const isUrgentQuizUpdate =
      payload.activityType === 'quiz_running' || payload.activityType === 'quiz_finished';

    if (isUrgentQuizUpdate) {
      flushPayload(payload, false);
      return;
    }

    const delayMs = metricsChanged ? METRIC_URGENT_DEBOUNCE_MS : ACTIVITY_DEBOUNCE_MS;
    timerRef.current = window.setTimeout(() => {
      timerRef.current = null;
      if (latestPayloadRef.current) {
        flushPayload(latestPayloadRef.current, false);
      }
    }, delayMs);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [buildPayload, flushPayload]);

  // Visibility-aware presence heartbeat so "Aktif Sekarang" stays live while studying
  useEffect(() => {
    if (!user || !user.emailVerified || offlineFallback || !progressReady || !quizHistoryReady) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      if (!latestPayloadRef.current) return;
      if (Date.now() - lastSentAtRef.current < PRESENCE_HEARTBEAT_MS - 5_000) return;
      flushPayload(latestPayloadRef.current, true);
    }, PRESENCE_HEARTBEAT_MS);

    return () => window.clearInterval(intervalId);
  }, [user, offlineFallback, progressReady, quizHistoryReady, flushPayload]);

  const recordQuizStartedEvent = useCallback(
    (bookId: BookId, scopeLabel: string, focus: LiveQuizSnapshot['focus'], total: number) => {
      if (!user || !user.emailVerified || offlineFallback) return;
      const targetUser = user;
      const resolvedName =
        displayName || targetUser.displayName || targetUser.email?.split('@')[0] || 'Pembelajar';
      const bookLabel = getBookLabelId(bookId);
      const focusLabel = getQuizFocusLabelId(focus);
      void ensureUserProfileDoc(targetUser)
        .then(ok => {
          if (!ok || activeUidRef.current !== targetUser.uid) return;
          return logActivityEvent({
            uid: targetUser.uid,
            displayName: resolvedName,
            email: targetUser.email ?? '',
            eventType: 'quiz_started',
            bookId,
            scopeLabel,
            focus,
            correct: 0,
            total,
            score: -1,
            summary: `Memulai Kuis ${bookLabel} (${scopeLabel} · ${focusLabel} · ${total} soal)`,
          });
        })
        .catch(() => undefined);
    },
    [user, offlineFallback, displayName, ensureUserProfileDoc]
  );

  const recordQuizCompletedEvent = useCallback(
    (
      bookId: BookId,
      scopeLabel: string,
      focus: LiveQuizSnapshot['focus'],
      correct: number,
      total: number
    ) => {
      if (!user || !user.emailVerified || offlineFallback) return;
      const targetUser = user;
      const resolvedName =
        displayName || targetUser.displayName || targetUser.email?.split('@')[0] || 'Pembelajar';
      const bookLabel = getBookLabelId(bookId);
      const focusLabel = getQuizFocusLabelId(focus);
      const score = total > 0 ? Math.round((correct / total) * 100) : 0;
      void ensureUserProfileDoc(targetUser)
        .then(ok => {
          if (!ok || activeUidRef.current !== targetUser.uid) return;
          return logActivityEvent({
            uid: targetUser.uid,
            displayName: resolvedName,
            email: targetUser.email ?? '',
            eventType: 'quiz_completed',
            bookId,
            scopeLabel,
            focus,
            correct,
            total,
            score,
            summary: `Menyelesaikan Kuis ${bookLabel} (${scopeLabel} · ${focusLabel}): ${correct}/${total} (${score}%)`,
          });
        })
        .catch(() => undefined);
    },
    [user, offlineFallback, displayName, ensureUserProfileDoc]
  );

  return {
    recordQuizStartedEvent,
    recordQuizCompletedEvent,
  };
}
