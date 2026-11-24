import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BOOTSTRAP_SUPERADMIN_EMAIL,
  canAccessAdminPanel,
  canChangeTargetRole,
  canManageUserRoles,
  classifyPresenceStatus,
  computeLiveQuizWrongCount,
  computeMonitoringKpis,
  computeUserDetailStats,
  filterActivities,
  filterAdminUsers,
  formatRelativeTimeId,
  getLiveOptionVisualState,
  getQuizQuestionTypeLabelId,
  hasLiveQuizQuestion,
  resolveEffectiveRole,
  resolveUserMetrics,
  truncateText,
  type AdminUserRecord,
  type LiveActivityRecord,
  type UserMonitorMetrics,
} from './adminRoles';

test('resolveEffectiveRole enforces verified bootstrap superadmin and 3-tier roles', () => {
  assert.equal(resolveEffectiveRole('JrengHaha2@gmail.com', 'user', true), 'superadmin');
  assert.equal(resolveEffectiveRole(BOOTSTRAP_SUPERADMIN_EMAIL, undefined, true), 'superadmin');
  // Unverified email spoofing must NEVER receive elevated role
  assert.equal(resolveEffectiveRole(BOOTSTRAP_SUPERADMIN_EMAIL, 'superadmin', false), 'user');
  assert.equal(resolveEffectiveRole('admin@example.com', 'admin', false), 'user');
  // Verified admin and regular user
  assert.equal(resolveEffectiveRole('admin@example.com', 'admin', true), 'admin');
  assert.equal(resolveEffectiveRole('learner@example.com', 'user', true), 'user');
  assert.equal(resolveEffectiveRole('learner@example.com', 'invalid-role', true), 'user');
});

test('RBAC permission helpers allow Superadmin to promote/revoke Admin & Superadmin while protecting primary Superadmin and self', () => {
  assert.equal(canAccessAdminPanel('superadmin'), true);
  assert.equal(canAccessAdminPanel('admin'), true);
  assert.equal(canAccessAdminPanel('user'), false);

  assert.equal(canManageUserRoles('superadmin'), true);
  assert.equal(canManageUserRoles('admin'), false);
  assert.equal(canManageUserRoles('user'), false);

  const regularTarget = { uid: 'u2', role: 'user' as const, email: 'budi@example.com' };
  const adminTarget = { uid: 'u3', role: 'admin' as const, email: 'siti@example.com' };
  const coSuperTarget = { uid: 'u4', role: 'superadmin' as const, email: 'co@example.com' };
  const bootstrapSuperTarget = {
    uid: 'u1',
    role: 'superadmin' as const,
    email: BOOTSTRAP_SUPERADMIN_EMAIL,
  };

  // Superadmin can change role of regular users, admins, and other promoted superadmins
  assert.equal(canChangeTargetRole('u1', 'superadmin', regularTarget), true);
  assert.equal(canChangeTargetRole('u1', 'superadmin', adminTarget), true);
  assert.equal(canChangeTargetRole('u1', 'superadmin', coSuperTarget), true);
  // Superadmin cannot change own role or primary bootstrap superadmin
  assert.equal(canChangeTargetRole('u1', 'superadmin', bootstrapSuperTarget), false);
  assert.equal(canChangeTargetRole('u4', 'superadmin', bootstrapSuperTarget), false);
  assert.equal(canChangeTargetRole('u4', 'superadmin', coSuperTarget), false);
  // Admin and regular user can NEVER change anyone's role
  assert.equal(canChangeTargetRole('u3', 'admin', regularTarget), false);
  assert.equal(canChangeTargetRole('u2', 'user', adminTarget), false);
});

test('classifyPresenceStatus and formatRelativeTimeId handle online/recent/offline windows', () => {
  const now = 1_700_000_000_000;
  assert.equal(classifyPresenceStatus(now - 30_000, now), 'online');
  assert.equal(classifyPresenceStatus(now - 2 * 60_000, now), 'online');
  assert.equal(classifyPresenceStatus(now - 10 * 60_000, now), 'recent');
  assert.equal(classifyPresenceStatus(now - 45 * 60_000, now), 'offline');
  assert.equal(classifyPresenceStatus(0, now), 'offline');

  assert.equal(formatRelativeTimeId(now - 5_000, now), 'Baru saja');
  assert.equal(formatRelativeTimeId(now - 42_000, now), '42 dtk lalu');
  assert.equal(formatRelativeTimeId(now - 12 * 60_000, now), '12 mnt lalu');
  assert.equal(formatRelativeTimeId(now - 3 * 3600_000, now), '3 jam lalu');
  assert.equal(truncateText('abcdef', 4), 'abc…');
});

test('sorting by time, alphabet, mastered count, and quiz count works accurately across users and live activities', () => {
  const now = 1_700_000_000_000;
  const users: AdminUserRecord[] = [
    {
      uid: 'u1',
      displayName: 'Zara',
      email: 'zara@example.com',
      avatarUrl: '',
      role: 'user',
      createdAtMs: now - 50_000,
      updatedAtMs: now - 5_000, // newest
    },
    {
      uid: 'u2',
      displayName: 'Abel',
      email: 'abel@example.com',
      avatarUrl: '',
      role: 'admin',
      createdAtMs: now - 40_000,
      updatedAtMs: now - 30_000,
    },
    {
      uid: 'u3',
      displayName: 'Nur Aini',
      email: 'nur@example.com',
      avatarUrl: '',
      role: 'user',
      createdAtMs: now - 30_000,
      updatedAtMs: now - 15_000,
    },
  ];

  const metricsMap = new Map<string, UserMonitorMetrics>([
    [
      'u1',
      {
        masteredTotal: 10,
        hardTotal: 1,
        introMastered: 10,
        elem1Mastered: 0,
        elem2Mastered: 0,
        quizSessionCount: 1,
        latestQuizScore: 70,
        latestActivityMs: now - 5_000,
      },
    ],
    [
      'u2',
      {
        masteredTotal: 80,
        hardTotal: 2,
        introMastered: 50,
        elem1Mastered: 30,
        elem2Mastered: 0,
        quizSessionCount: 2,
        latestQuizScore: 85,
        latestActivityMs: now - 30_000,
      },
    ],
    [
      'u3',
      {
        masteredTotal: 35,
        hardTotal: 4,
        introMastered: 35,
        elem1Mastered: 0,
        elem2Mastered: 0,
        quizSessionCount: 9,
        latestQuizScore: 95,
        latestActivityMs: now - 15_000,
      },
    ],
  ]);

  assert.deepEqual(
    filterAdminUsers(users, '', 'all', 'recent', metricsMap).map(u => u.displayName),
    ['Zara', 'Nur Aini', 'Abel']
  );
  assert.deepEqual(
    filterAdminUsers(users, '', 'all', 'name_asc', metricsMap).map(u => u.displayName),
    ['Abel', 'Nur Aini', 'Zara']
  );
  assert.deepEqual(
    filterAdminUsers(users, '', 'all', 'name_desc', metricsMap).map(u => u.displayName),
    ['Zara', 'Nur Aini', 'Abel']
  );
  assert.deepEqual(
    filterAdminUsers(users, '', 'all', 'mastered_desc', metricsMap).map(u => u.displayName),
    ['Abel', 'Nur Aini', 'Zara']
  );
  assert.deepEqual(
    filterAdminUsers(users, '', 'all', 'quizzes_desc', metricsMap).map(u => u.displayName),
    ['Nur Aini', 'Abel', 'Zara']
  );

  // KPIs merge hydrated historical quiz sessions even when liveActivity is empty
  const kpis = computeMonitoringKpis(users, [], now, metricsMap);
  assert.equal(kpis.totalUsers, 3);
  assert.equal(kpis.totalQuizSessions, 12);

  // Activities sorting matches same options
  const activities: LiveActivityRecord[] = [
    {
      uid: 'u1',
      displayName: 'Zara',
      email: 'zara@example.com',
      avatarUrl: '',
      activeBookId: 'introductory',
      activeTab: 'card',
      activeChapterLabel: 'Bab 3',
      activityType: 'flashcard',
      activitySummary: 'Belajar Flashcard',
      quizLiveCurrent: 0,
      quizLiveTotal: 0,
      quizLiveCorrect: 0,
      quizLiveType: '',
      quizLiveChapter: 0,
      quizLivePatternTitle: '',
      quizLivePrompt: '',
      quizLiveJapanese: '',
      quizLiveOptions: [],
      quizLiveCorrectIndex: -1,
      quizLiveChosenIndex: -1,
      masteredTotal: 10,
      hardTotal: 1,
      introMastered: 10,
      elem1Mastered: 0,
      elem2Mastered: 0,
      latestQuizScore: 70,
      latestQuizSummary: 'Pemula 70%',
      quizSessionCount: 1,
      updatedAtMs: now - 5_000,
    },
    {
      uid: 'u3',
      displayName: 'Nur Aini',
      email: 'nur@example.com',
      avatarUrl: '',
      activeBookId: 'elementary1',
      activeTab: 'quiz',
      activeChapterLabel: 'Bab 5',
      activityType: 'quiz_running',
      activitySummary: 'Sedang Kuis',
      quizLiveCurrent: 3,
      quizLiveTotal: 10,
      quizLiveCorrect: 2,
      quizLiveType: 'cloze',
      quizLiveChapter: 5,
      quizLivePatternTitle: 'N を V',
      quizLivePrompt: 'Pilih isian yang tepat',
      quizLiveJapanese: 'パン（　　）食べます。',
      quizLiveOptions: ['を', 'に', 'で', 'へ'],
      quizLiveCorrectIndex: 0,
      quizLiveChosenIndex: -1,
      masteredTotal: 35,
      hardTotal: 4,
      introMastered: 35,
      elem1Mastered: 0,
      elem2Mastered: 0,
      latestQuizScore: 95,
      latestQuizSummary: 'Dasar 1 95%',
      quizSessionCount: 9,
      updatedAtMs: now - 15_000,
    },
  ];
  assert.deepEqual(
    filterActivities(activities, '', 'all', now, 'name_asc', metricsMap).map(a => a.displayName),
    ['Nur Aini', 'Zara']
  );
  assert.deepEqual(
    filterActivities(activities, '', 'all', now, 'quizzes_desc', metricsMap).map(
      a => a.displayName
    ),
    ['Nur Aini', 'Zara']
  );

  const merged = resolveUserMetrics(users[2], activities[1], metricsMap.get('u3'));
  assert.equal(merged.quizSessionCount, 9);
  assert.equal(merged.masteredTotal, 35);
});

test('computeUserDetailStats and real-time authoritative resolveUserMetrics work accurately', () => {
  const books = [
    { id: 'introductory' as const, totalPatterns: 82 },
    { id: 'elementary1' as const, totalPatterns: 95 },
    { id: 'elementary2' as const, totalPatterns: 87 },
  ];

  const sessions = [
    {
      id: 'q1',
      completedAt: '2026-11-22T09:17:00.000Z',
      bookId: 'introductory' as const,
      scopeLabel: 'Bab 3–10',
      focus: 'mixed' as const,
      correct: 5,
      total: 5,
      score: 100,
    },
    {
      id: 'q2',
      completedAt: '2026-11-21T15:10:00.000Z',
      bookId: 'elementary1' as const,
      scopeLabel: 'Semua Bab (1–18)',
      focus: 'cloze' as const,
      correct: 3,
      total: 5,
      score: 60,
    },
  ];

  const stats = computeUserDetailStats(
    books,
    {
      introductory: { masteredCount: 20, hardCount: 2, quizSessions: [sessions[0]] },
      elementary1: { masteredCount: 6, hardCount: 1, quizSessions: [sessions[1]] },
      elementary2: { masteredCount: 0, hardCount: 0, quizSessions: [] },
    },
    sessions
  );

  assert.equal(stats.masteredTotal, 26);
  assert.equal(stats.hardTotal, 3);
  assert.equal(stats.totalPatterns, 264);
  assert.equal(stats.masteryPct, Math.round((26 / 264) * 100));
  assert.equal(stats.totalQuizSessions, 2);
  assert.equal(stats.quizCountByBook.introductory, 1);
  assert.equal(stats.quizCountByBook.elementary1, 1);
  assert.equal(stats.quizCountByBook.elementary2, 0);
  assert.equal(stats.totalCorrect, 8);
  assert.equal(stats.totalAnswered, 10);
  assert.equal(stats.averageScore, 80);
  assert.equal(stats.bestScore, 100);

  assert.equal(getQuizQuestionTypeLabelId('cloze'), 'Isian Rumpang');
  assert.equal(getQuizQuestionTypeLabelId('formula'), 'Rumus Penyambungan');
  assert.equal(getQuizQuestionTypeLabelId('function'), 'Fungsi & Makna');

  // Authoritative real-time modal snapshot overrides stale liveActivity (even when user un-marks Hafal)
  const now = 1_700_000_000_000;
  const resolved = resolveUserMetrics(
    { uid: 'u1', updatedAtMs: now - 10_000 },
    {
      uid: 'u1',
      displayName: 'Test',
      email: 't@example.com',
      avatarUrl: '',
      activeBookId: 'introductory',
      activeTab: 'card',
      activeChapterLabel: 'Bab 3',
      activityType: 'flashcard',
      activitySummary: 'Belajar',
      quizLiveCurrent: 0,
      quizLiveTotal: 0,
      quizLiveCorrect: 0,
      quizLiveType: '',
      quizLiveChapter: 0,
      quizLivePatternTitle: '',
      quizLivePrompt: '',
      quizLiveJapanese: '',
      quizLiveOptions: [],
      quizLiveCorrectIndex: -1,
      quizLiveChosenIndex: -1,
      masteredTotal: 10,
      hardTotal: 2,
      introMastered: 10,
      elem1Mastered: 0,
      elem2Mastered: 0,
      latestQuizScore: 80,
      latestQuizSummary: '',
      quizSessionCount: 1,
      updatedAtMs: now - 5_000,
    },
    {
      masteredTotal: 9,
      hardTotal: 1,
      introMastered: 9,
      elem1Mastered: 0,
      elem2Mastered: 0,
      quizSessionCount: 2,
      latestQuizScore: 100,
      latestActivityMs: now - 1_000,
      authoritativeAtMs: now,
    }
  );
  assert.equal(resolved.masteredTotal, 9);
  assert.equal(resolved.quizSessionCount, 2);
  assert.equal(resolved.latestQuizScore, 100);
});

test('hasLiveQuizQuestion and getLiveOptionVisualState handle show/hide correct answer toggle accurately', () => {
  assert.equal(
    hasLiveQuizQuestion({
      activityType: 'quiz_running',
      quizLiveTotal: 10,
      quizLiveOptions: ['A', 'B', 'C', 'D'],
      quizLiveCorrectIndex: 1,
    }),
    true
  );
  assert.equal(
    hasLiveQuizQuestion({
      activityType: 'browsing',
      quizLiveTotal: 10,
      quizLiveOptions: ['A', 'B', 'C', 'D'],
      quizLiveCorrectIndex: 1,
    }),
    false
  );
  assert.equal(
    hasLiveQuizQuestion({
      activityType: 'quiz_running',
      quizLiveTotal: 10,
      quizLiveOptions: [],
      quizLiveCorrectIndex: -1,
    }),
    false
  );

  // Waiting for learner answer with showCorrectAnswer = ON -> highlights key as "Kunci"
  assert.deepEqual(getLiveOptionVisualState(1, 1, -1, true), {
    tone: 'correct',
    badge: 'Kunci',
    isChosen: false,
    isKeyVisible: true,
  });
  assert.deepEqual(getLiveOptionVisualState(0, 1, -1, true), {
    tone: 'neutral',
    badge: '',
    isChosen: false,
    isKeyVisible: false,
  });

  // Waiting for learner answer with showCorrectAnswer = OFF -> hides key completely
  assert.deepEqual(getLiveOptionVisualState(1, 1, -1, false), {
    tone: 'neutral',
    badge: '',
    isChosen: false,
    isKeyVisible: false,
  });

  // Learner chose WRONG (index 2, correct is 1):
  // - showCorrectAnswer = ON -> index 2 is wrong ("Dipilih · Salah"), index 1 is correct ("Kunci")
  assert.deepEqual(getLiveOptionVisualState(2, 1, 2, true), {
    tone: 'wrong',
    badge: 'Dipilih · Salah',
    isChosen: true,
    isKeyVisible: false,
  });
  assert.deepEqual(getLiveOptionVisualState(1, 1, 2, true), {
    tone: 'correct',
    badge: 'Kunci',
    isChosen: false,
    isKeyVisible: true,
  });
  // - showCorrectAnswer = OFF -> index 2 is wrong ("Dipilih · Salah"), index 1 stays neutral (no spoiler!)
  assert.deepEqual(getLiveOptionVisualState(2, 1, 2, false), {
    tone: 'wrong',
    badge: 'Dipilih · Salah',
    isChosen: true,
    isKeyVisible: false,
  });
  assert.deepEqual(getLiveOptionVisualState(1, 1, 2, false), {
    tone: 'neutral',
    badge: '',
    isChosen: false,
    isKeyVisible: false,
  });

  // Learner chose RIGHT (index 1, correct is 1) -> shows "Dipilih · Benar" regardless of toggle
  assert.deepEqual(getLiveOptionVisualState(1, 1, 1, true), {
    tone: 'correct',
    badge: 'Dipilih · Benar',
    isChosen: true,
    isKeyVisible: true,
  });
  assert.deepEqual(getLiveOptionVisualState(1, 1, 1, false), {
    tone: 'correct',
    badge: 'Dipilih · Benar',
    isChosen: true,
    isKeyVisible: false,
  });

  // Live wrong count calculation (waiting vs answered right/wrong)
  assert.equal(computeLiveQuizWrongCount(9, 7, -1), 1); // 8 answered before #9, 7 correct -> 1 wrong
  assert.equal(computeLiveQuizWrongCount(9, 7, 2), 2); // answered #9 wrong -> 2 wrong
  assert.equal(computeLiveQuizWrongCount(9, 8, 1), 1); // answered #9 right -> 1 wrong
  assert.equal(computeLiveQuizWrongCount(1, 0, -1), 0); // waiting on #1 -> 0 wrong
});
