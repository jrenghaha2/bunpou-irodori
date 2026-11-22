import type { AppTab, BookId, QuizFocus, UserRole } from '../types/bunpou';

export const BOOTSTRAP_SUPERADMIN_EMAIL = 'jrenghaha2@gmail.com';

export type LiveActivityType =
  | 'browsing'
  | 'flashcard'
  | 'list'
  | 'quiz_running'
  | 'quiz_finished'
  | 'guide'
  | 'admin';

export type ActivityEventType = 'quiz_started' | 'quiz_completed' | 'progress_milestone';

export type PresenceStatus = 'online' | 'recent' | 'offline';

export type MonitorSortOption =
  | 'recent'
  | 'name_asc'
  | 'name_desc'
  | 'mastered_desc'
  | 'quizzes_desc';

export const MONITOR_SORT_OPTIONS: readonly { id: MonitorSortOption; label: string }[] = [
  { id: 'recent', label: 'Waktu Terbaru' },
  { id: 'name_asc', label: 'Abjad (A–Z)' },
  { id: 'name_desc', label: 'Abjad (Z–A)' },
  { id: 'mastered_desc', label: 'Hafalan Terbanyak' },
  { id: 'quizzes_desc', label: 'Tes Terbanyak' },
] as const;

export interface LiveQuizSnapshot {
  phase: 'setup' | 'running' | 'result';
  bookId: BookId;
  scopeLabel: string;
  focus: QuizFocus;
  current: number;
  total: number;
  correct: number;
}

export interface LiveActivityRecord {
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
  updatedAtMs: number;
}

export interface ActivityEventRecord {
  id: string;
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
  createdAtMs: number;
}

export interface AdminUserRecord {
  uid: string;
  displayName: string;
  email: string;
  avatarUrl: string;
  role: UserRole;
  createdAtMs: number;
  updatedAtMs: number;
}

export interface UserMonitorMetrics {
  masteredTotal: number;
  hardTotal: number;
  introMastered: number;
  elem1Mastered: number;
  elem2Mastered: number;
  quizSessionCount: number;
  latestQuizScore: number;
  latestActivityMs: number;
}

export function normalizeEmail(email: string | null | undefined): string {
  return (email ?? '').trim().toLowerCase().slice(0, 120);
}

export function isBootstrapSuperAdminEmail(email: string | null | undefined): boolean {
  return normalizeEmail(email) === BOOTSTRAP_SUPERADMIN_EMAIL;
}

export function normalizeStoredRole(raw: unknown): UserRole {
  if (raw === 'superadmin' || raw === 'admin' || raw === 'user') return raw;
  return 'user';
}

export function resolveEffectiveRole(
  email: string | null | undefined,
  storedRole: unknown,
  emailVerified: boolean
): UserRole {
  if (!emailVerified) return 'user';
  if (isBootstrapSuperAdminEmail(email)) return 'superadmin';
  return normalizeStoredRole(storedRole);
}

export function canAccessAdminPanel(role: UserRole): boolean {
  return role === 'superadmin' || role === 'admin';
}

export function canManageUserRoles(role: UserRole): boolean {
  return role === 'superadmin';
}

export function isProtectedBootstrapSuperAdmin(
  target: Pick<AdminUserRecord, 'email'>
): boolean {
  return isBootstrapSuperAdminEmail(target.email);
}

export function canChangeTargetRole(
  actorUid: string,
  actorRole: UserRole,
  target: Pick<AdminUserRecord, 'uid' | 'role' | 'email'>
): boolean {
  if (actorRole !== 'superadmin') return false;
  if (!actorUid || target.uid === actorUid) return false;
  if (isBootstrapSuperAdminEmail(target.email)) return false;
  return true;
}

export function classifyPresenceStatus(updatedAtMs: number, nowMs: number): PresenceStatus {
  if (!updatedAtMs || updatedAtMs <= 0) return 'offline';
  const diffMs = Math.max(0, nowMs - updatedAtMs);
  if (diffMs <= 3 * 60 * 1000) return 'online';
  if (diffMs <= 30 * 60 * 1000) return 'recent';
  return 'offline';
}

export function formatRelativeTimeId(timestampMs: number, nowMs: number): string {
  if (!timestampMs || timestampMs <= 0) return 'Belum tercatat';
  const diffSec = Math.max(0, Math.floor((nowMs - timestampMs) / 1000));
  if (diffSec < 15) return 'Baru saja';
  if (diffSec < 60) return `${diffSec} dtk lalu`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} mnt lalu`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} jam lalu`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay} hari lalu`;
  return new Date(timestampMs).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function getBookLabelId(bookId: BookId): string {
  if (bookId === 'introductory') return 'Pemula';
  if (bookId === 'elementary1') return 'Dasar 1';
  return 'Dasar 2';
}

export function getQuizFocusLabelId(focus: QuizFocus | 'none'): string {
  if (focus === 'mixed') return 'Campuran';
  if (focus === 'cloze') return 'Isian Rumpang';
  if (focus === 'formula') return 'Rumus Penyambungan';
  if (focus === 'function') return 'Fungsi & Makna';
  return 'Umum';
}

export function getRoleLabelId(role: UserRole): string {
  if (role === 'superadmin') return 'Superadmin';
  if (role === 'admin') return 'Admin';
  return 'Pembelajar';
}

export function truncateText(text: string, maxLen: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return trimmed;
  if (maxLen <= 1) return trimmed.slice(0, maxLen);
  return `${trimmed.slice(0, maxLen - 1).trimEnd()}…`;
}

export function resolveUserMetrics(
  user: Pick<AdminUserRecord, 'uid' | 'updatedAtMs'>,
  live: LiveActivityRecord | undefined,
  hydrated: UserMonitorMetrics | undefined
): UserMonitorMetrics {
  const masteredTotal = Math.max(live?.masteredTotal ?? 0, hydrated?.masteredTotal ?? 0);
  const hardTotal = live ? live.hardTotal : hydrated?.hardTotal ?? 0;
  const introMastered = Math.max(live?.introMastered ?? 0, hydrated?.introMastered ?? 0);
  const elem1Mastered = Math.max(live?.elem1Mastered ?? 0, hydrated?.elem1Mastered ?? 0);
  const elem2Mastered = Math.max(live?.elem2Mastered ?? 0, hydrated?.elem2Mastered ?? 0);
  const quizSessionCount = Math.max(live?.quizSessionCount ?? 0, hydrated?.quizSessionCount ?? 0);
  const latestQuizScore =
    live && live.latestQuizScore >= 0
      ? live.latestQuizScore
      : hydrated && hydrated.latestQuizScore >= 0
        ? hydrated.latestQuizScore
        : -1;
  const latestActivityMs = Math.max(
    live?.updatedAtMs ?? 0,
    hydrated?.latestActivityMs ?? 0,
    user.updatedAtMs ?? 0
  );

  return {
    masteredTotal,
    hardTotal,
    introMastered,
    elem1Mastered,
    elem2Mastered,
    quizSessionCount,
    latestQuizScore,
    latestActivityMs,
  };
}

export interface MonitoringKpis {
  totalUsers: number;
  onlineUsers: number;
  activeQuizzes: number;
  totalAdmins: number;
  totalQuizSessions: number;
}

export function computeMonitoringKpis(
  users: AdminUserRecord[],
  activities: LiveActivityRecord[],
  nowMs: number,
  hydratedMetricsByUid?: ReadonlyMap<string, UserMonitorMetrics>
): MonitoringKpis {
  const uidSet = new Set<string>();
  const liveByUid = new Map<string, LiveActivityRecord>();
  let totalAdmins = 0;

  for (const u of users) {
    uidSet.add(u.uid);
    if (u.role === 'admin' || u.role === 'superadmin') totalAdmins += 1;
  }

  let onlineUsers = 0;
  let activeQuizzes = 0;
  for (const act of activities) {
    uidSet.add(act.uid);
    liveByUid.set(act.uid, act);
    const status = classifyPresenceStatus(act.updatedAtMs, nowMs);
    if (status === 'online') {
      onlineUsers += 1;
      if (act.activityType === 'quiz_running') activeQuizzes += 1;
    }
  }

  let totalQuizSessions = 0;
  for (const uid of uidSet) {
    const liveCount = liveByUid.get(uid)?.quizSessionCount ?? 0;
    const hydratedCount = hydratedMetricsByUid?.get(uid)?.quizSessionCount ?? 0;
    totalQuizSessions += Math.max(0, liveCount, hydratedCount);
  }

  return {
    totalUsers: uidSet.size,
    onlineUsers,
    activeQuizzes,
    totalAdmins,
    totalQuizSessions,
  };
}

function compareDisplayName(a: string, b: string): number {
  return a.localeCompare(b, 'id-ID', { sensitivity: 'base' });
}

export function filterActivities(
  activities: LiveActivityRecord[],
  search: string,
  statusFilter: 'all' | 'online' | 'quiz',
  nowMs: number,
  sortBy: MonitorSortOption = 'recent',
  hydratedMetricsByUid?: ReadonlyMap<string, UserMonitorMetrics>
): LiveActivityRecord[] {
  const q = search.trim().toLowerCase();
  const filtered = activities.filter(act => {
    if (statusFilter === 'online' && classifyPresenceStatus(act.updatedAtMs, nowMs) !== 'online') {
      return false;
    }
    if (statusFilter === 'quiz') {
      const hydratedCount = hydratedMetricsByUid?.get(act.uid)?.quizSessionCount ?? 0;
      const isLiveQuiz =
        act.activityType === 'quiz_running' &&
        classifyPresenceStatus(act.updatedAtMs, nowMs) === 'online';
      if (
        !isLiveQuiz &&
        act.activityType !== 'quiz_finished' &&
        act.latestQuizScore < 0 &&
        act.quizSessionCount <= 0 &&
        hydratedCount <= 0
      ) {
        return false;
      }
    }
    if (!q) return true;
    return (
      act.displayName.toLowerCase().includes(q) ||
      act.email.toLowerCase().includes(q) ||
      act.activitySummary.toLowerCase().includes(q) ||
      act.activeChapterLabel.toLowerCase().includes(q) ||
      getBookLabelId(act.activeBookId).toLowerCase().includes(q)
    );
  });

  return [...filtered].sort((a, b) => {
    const mA = hydratedMetricsByUid?.get(a.uid);
    const mB = hydratedMetricsByUid?.get(b.uid);
    const masteredA = Math.max(a.masteredTotal, mA?.masteredTotal ?? 0);
    const masteredB = Math.max(b.masteredTotal, mB?.masteredTotal ?? 0);
    const quizA = Math.max(a.quizSessionCount, mA?.quizSessionCount ?? 0);
    const quizB = Math.max(b.quizSessionCount, mB?.quizSessionCount ?? 0);

    if (sortBy === 'name_asc') {
      return compareDisplayName(a.displayName, b.displayName) || b.updatedAtMs - a.updatedAtMs;
    }
    if (sortBy === 'name_desc') {
      return compareDisplayName(b.displayName, a.displayName) || b.updatedAtMs - a.updatedAtMs;
    }
    if (sortBy === 'mastered_desc') {
      return (
        masteredB - masteredA ||
        b.updatedAtMs - a.updatedAtMs ||
        compareDisplayName(a.displayName, b.displayName)
      );
    }
    if (sortBy === 'quizzes_desc') {
      return (
        quizB - quizA ||
        b.updatedAtMs - a.updatedAtMs ||
        compareDisplayName(a.displayName, b.displayName)
      );
    }
    return b.updatedAtMs - a.updatedAtMs || compareDisplayName(a.displayName, b.displayName);
  });
}

export function filterAdminUsers(
  users: AdminUserRecord[],
  search: string,
  roleFilter: 'all' | UserRole,
  sortBy: MonitorSortOption = 'recent',
  metricsByUid?: ReadonlyMap<string, UserMonitorMetrics>
): AdminUserRecord[] {
  const q = search.trim().toLowerCase();
  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (!q) return true;
    return (
      u.displayName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.uid.toLowerCase().includes(q)
    );
  });

  return [...filtered].sort((a, b) => {
    const mA = metricsByUid?.get(a.uid);
    const mB = metricsByUid?.get(b.uid);
    const timeA = mA?.latestActivityMs ?? a.updatedAtMs;
    const timeB = mB?.latestActivityMs ?? b.updatedAtMs;
    const masteredA = mA?.masteredTotal ?? 0;
    const masteredB = mB?.masteredTotal ?? 0;
    const quizA = mA?.quizSessionCount ?? 0;
    const quizB = mB?.quizSessionCount ?? 0;

    if (sortBy === 'name_asc') {
      return compareDisplayName(a.displayName, b.displayName) || timeB - timeA;
    }
    if (sortBy === 'name_desc') {
      return compareDisplayName(b.displayName, a.displayName) || timeB - timeA;
    }
    if (sortBy === 'mastered_desc') {
      return (
        masteredB - masteredA ||
        quizB - quizA ||
        compareDisplayName(a.displayName, b.displayName)
      );
    }
    if (sortBy === 'quizzes_desc') {
      return (
        quizB - quizA ||
        masteredB - masteredA ||
        compareDisplayName(a.displayName, b.displayName)
      );
    }
    return timeB - timeA || compareDisplayName(a.displayName, b.displayName);
  });
}
