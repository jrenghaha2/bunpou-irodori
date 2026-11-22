import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BOOTSTRAP_SUPERADMIN_EMAIL,
  canAccessAdminPanel,
  canChangeTargetRole,
  canManageUserRoles,
  classifyPresenceStatus,
  computeMonitoringKpis,
  filterActivities,
  filterAdminUsers,
  formatRelativeTimeId,
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
