import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity,
  ArrowUpDown,
  Award,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Eye,
  EyeOff,
  Loader2,
  Radio,
  Search,
  Shield,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  detailedMonitoringToMetrics,
  fetchUserSummaryMetrics,
  subscribeActivityEvents,
  subscribeAdminUsers,
  subscribeLiveActivities,
  subscribeUserDetailedMonitoring,
  updateTargetUserRole,
  type UserDetailedMonitoring,
} from '../services/adminService';
import type { BookData, BookId, BunpouPattern, UserRole } from '../types/bunpou';
import {
  MONITOR_SORT_OPTIONS,
  canChangeTargetRole,
  canManageUserRoles,
  classifyPresenceStatus,
  computeMonitoringKpis,
  filterActivities,
  filterAdminUsers,
  formatRelativeTimeId,
  getBookLabelId,
  getQuizFocusLabelId,
  getRoleLabelId,
  isProtectedBootstrapSuperAdmin,
  resolveUserMetrics,
  type ActivityEventRecord,
  type AdminUserRecord,
  type LiveActivityRecord,
  type MonitorSortOption,
  type UserMonitorMetrics,
} from '../utils/adminRoles';
import type { ShowToastFn } from '../hooks/useToast';
import { LiveQuizQuestionCard } from './admin/LiveQuizQuestionCard';
import { UserDetailMonitorModal } from './admin/UserDetailMonitorModal';

type AdminSubTab = 'live' | 'events' | 'users';

interface AdminMonitorPanelProps {
  currentUid: string;
  currentRole: UserRole;
  books: BookData[];
  validIdsByBook: Record<BookId, Set<string>>;
  patternById: Map<string, BunpouPattern>;
  showToast: ShowToastFn;
}

function getScorePillClass(score: number): string {
  if (score >= 80) {
    return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
  }
  if (score >= 60) {
    return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
  }
  return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
}

export function AdminMonitorPanel({
  currentUid,
  currentRole,
  books,
  validIdsByBook,
  patternById,
  showToast,
}: AdminMonitorPanelProps) {
  const [subTab, setSubTab] = useState<AdminSubTab>('live');
  const [activities, setActivities] = useState<LiveActivityRecord[]>([]);
  const [events, setEvents] = useState<ActivityEventRecord[]>([]);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [loadingStreams, setLoadingStreams] = useState(true);
  const [streamError, setStreamError] = useState<string | null>(null);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const [activitySearch, setActivitySearch] = useState('');
  const [activityFilter, setActivityFilter] = useState<'all' | 'online' | 'quiz'>('all');
  const [activitySort, setActivitySort] = useState<MonitorSortOption>('recent');

  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [userSort, setUserSort] = useState<MonitorSortOption>('recent');

  // Historical progress & quiz count hydration for users who haven't created a liveActivity doc yet
  const [hydratedMetrics, setHydratedMetrics] = useState<Map<string, UserMonitorMetrics>>(
    () => new Map()
  );
  const [hydratingProgress, setHydratingProgress] = useState<{ done: number; total: number } | null>(
    null
  );
  const hydratedUidsRef = useRef<Set<string>>(new Set());

  // Role edit pending state: uid -> desired nextRole
  const [pendingRoles, setPendingRoles] = useState<Record<string, UserRole>>({});
  const [updatingRoleUid, setUpdatingRoleUid] = useState<string | null>(null);

  const [inspectedUid, setInspectedUid] = useState<string | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState<UserDetailedMonitoring | null>(null);

  // Live quiz question monitor state (per-user Pantau Soal / Tutup Soal + answer key hidden by default)
  const [expandedLiveQuizUids, setExpandedLiveQuizUids] = useState<string[]>([]);
  const [showLiveCorrectAnswer, setShowLiveCorrectAnswer] = useState(false);
  const [showLiveFurigana, setShowLiveFurigana] = useState(true);

  const toggleLiveQuizMonitor = (uid: string) => {
    setExpandedLiveQuizUids(prev =>
      prev.includes(uid) ? prev.filter(item => item !== uid) : [...prev, uid]
    );
  };

  const isSuperAdmin = canManageUserRoles(currentRole);

  // Tick every 15s so relative timestamps & online/idle badges update smoothly in real time
  useEffect(() => {
    const id = window.setInterval(() => setNowMs(Date.now()), 15_000);
    return () => window.clearInterval(id);
  }, []);

  // Attach real-time Firestore listeners only while Admin Monitor panel is mounted
  useEffect(() => {
    let mounted = true;
    const loadedFlags = { live: false, events: false, users: false };

    const markLoaded = (key: keyof typeof loadedFlags) => {
      loadedFlags[key] = true;
      if (mounted && loadedFlags.live && loadedFlags.users) {
        setLoadingStreams(false);
      }
    };

    const handleStreamErr = (err: unknown) => {
      if (!mounted) return;
      setLoadingStreams(false);
      setStreamError(
        err instanceof Error
          ? err.message
          : 'Gagal terhubung ke aliran data pemantauan real-time.'
      );
    };

    const unsubLive = subscribeLiveActivities(
      items => {
        if (!mounted) return;
        setActivities(items);
        setStreamError(null);
        markLoaded('live');
      },
      handleStreamErr
    );

    const unsubEvents = subscribeActivityEvents(
      items => {
        if (!mounted) return;
        setEvents(items);
        markLoaded('events');
      },
      handleStreamErr
    );

    const unsubUsers = subscribeAdminUsers(
      items => {
        if (!mounted) return;
        setUsers(items);
        setStreamError(null);
        markLoaded('users');
      },
      handleStreamErr
    );

    return () => {
      mounted = false;
      unsubLive();
      unsubEvents();
      unsubUsers();
    };
  }, []);

  // Batch-hydrate real 3-book mastery & quiz counts for all users so sorting by hafalan / tes
  // works accurately even for historical users who have not opened the latest version yet.
  useEffect(() => {
    if (users.length === 0) return;
    const missing = users.filter(u => !hydratedUidsRef.current.has(u.uid));
    if (missing.length === 0) return;

    let cancelled = false;
    const CHUNK_SIZE = 5;

    const run = async () => {
      setHydratingProgress({ done: 0, total: missing.length });
      let completed = 0;

      for (let i = 0; i < missing.length; i += CHUNK_SIZE) {
        if (cancelled) return;
        const batch = missing.slice(i, i + CHUNK_SIZE);
        const batchResults = await Promise.all(
          batch.map(async u => {
            const metrics = await fetchUserSummaryMetrics(u.uid, validIdsByBook);
            return { uid: u.uid, metrics };
          })
        );
        if (cancelled) return;

        setHydratedMetrics(prev => {
          const next = new Map(prev);
          for (const item of batchResults) {
            hydratedUidsRef.current.add(item.uid);
            next.set(item.uid, item.metrics);
          }
          return next;
        });

        completed += batch.length;
        setHydratingProgress({ done: completed, total: missing.length });
      }

      if (!cancelled) {
        setHydratingProgress(null);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [users, validIdsByBook]);

  const userByUid = useMemo(() => {
    const map = new Map<string, AdminUserRecord>();
    for (const u of users) map.set(u.uid, u);
    return map;
  }, [users]);

  const activityByUid = useMemo(() => {
    const map = new Map<string, LiveActivityRecord>();
    for (const act of activities) map.set(act.uid, act);
    return map;
  }, [activities]);

  const mergedMetricsByUid = useMemo(() => {
    const map = new Map<string, UserMonitorMetrics>();
    for (const u of users) {
      map.set(u.uid, resolveUserMetrics(u, activityByUid.get(u.uid), hydratedMetrics.get(u.uid)));
    }
    return map;
  }, [users, activityByUid, hydratedMetrics]);

  const kpis = useMemo(
    () => computeMonitoringKpis(users, activities, nowMs, hydratedMetrics),
    [users, activities, nowMs, hydratedMetrics]
  );

  const filteredActivities = useMemo(
    () =>
      filterActivities(
        activities,
        activitySearch,
        activityFilter,
        nowMs,
        activitySort,
        hydratedMetrics
      ),
    [activities, activitySearch, activityFilter, nowMs, activitySort, hydratedMetrics]
  );

  const filteredUsers = useMemo(
    () => filterAdminUsers(users, userSearch, roleFilter, userSort, mergedMetricsByUid),
    [users, userSearch, roleFilter, userSort, mergedMetricsByUid]
  );

  // Real-time subscription for inspected user detail modal (6 live doc streams: 3 progress + 3 quiz)
  useEffect(() => {
    if (!inspectedUid) {
      setDetailData(null);
      setDetailLoading(false);
      return;
    }

    let active = true;
    setDetailData(null);
    setDetailLoading(true);

    const unsub = subscribeUserDetailedMonitoring(
      inspectedUid,
      validIdsByBook,
      patternById,
      nextDetail => {
        if (!active) return;
        setDetailData(nextDetail);
        setDetailLoading(false);
        // Push authoritative live metrics back into list rows & KPIs immediately
        setHydratedMetrics(prev => {
          const next = new Map(prev);
          next.set(inspectedUid, detailedMonitoringToMetrics(nextDetail));
          return next;
        });
      },
      () => {
        if (!active) return;
        setDetailLoading(false);
        showToast(
          'error',
          'Gagal Memuat Detail',
          'Tidak dapat berlangganan pembaruan progres pengguna saat ini.'
        );
      }
    );

    return () => {
      active = false;
      unsub();
    };
  }, [inspectedUid, validIdsByBook, patternById, showToast]);

  // Whenever a brand-new quiz_completed event streams in real time, refresh that user's metrics
  const seenCompletedEventIdsRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (events.length === 0) return;
    if (seenCompletedEventIdsRef.current.size === 0) {
      for (const ev of events) seenCompletedEventIdsRef.current.add(ev.id);
      return;
    }

    const uidsToRefresh = new Set<string>();
    for (const ev of events) {
      if (!seenCompletedEventIdsRef.current.has(ev.id)) {
        seenCompletedEventIdsRef.current.add(ev.id);
        if (ev.eventType === 'quiz_completed' && ev.uid && ev.uid !== inspectedUid) {
          uidsToRefresh.add(ev.uid);
        }
      }
    }

    if (uidsToRefresh.size === 0) return;
    let cancelled = false;
    void Promise.all(
      [...uidsToRefresh].map(async uid => {
        const metrics = await fetchUserSummaryMetrics(uid, validIdsByBook);
        return { uid, metrics: { ...metrics, authoritativeAtMs: Date.now() } };
      })
    ).then(items => {
      if (cancelled) return;
      setHydratedMetrics(prev => {
        const next = new Map(prev);
        for (const item of items) next.set(item.uid, item.metrics);
        return next;
      });
    });

    return () => {
      cancelled = true;
    };
  }, [events, inspectedUid, validIdsByBook]);

  const handleInspectUser = (uid: string) => {
    setInspectedUid(uid);
  };

  const handleCommitRoleChange = async (target: AdminUserRecord, nextRole: UserRole) => {
    if (!canChangeTargetRole(currentUid, currentRole, target)) return;
    if (nextRole === target.role) {
      setPendingRoles(prev => {
        const copy = { ...prev };
        delete copy[target.uid];
        return copy;
      });
      return;
    }

    setUpdatingRoleUid(target.uid);
    try {
      await updateTargetUserRole(target.uid, nextRole);
      setPendingRoles(prev => {
        const copy = { ...prev };
        delete copy[target.uid];
        return copy;
      });
      showToast(
        'success',
        `Role Diubah ke ${getRoleLabelId(nextRole)}`,
        nextRole === 'superadmin'
          ? `${target.displayName} kini memiliki wewenang penuh sebagai Superadmin.`
          : nextRole === 'admin'
            ? `${target.displayName} kini memiliki akses pantau sebagai Admin.`
            : `Akses pengelola ${target.displayName} telah dicabut (kembali menjadi Pembelajar).`
      );
    } catch (err) {
      showToast(
        'error',
        'Gagal Mengubah Wewenang',
        err instanceof Error ? err.message : 'Pastikan akun Anda memiliki izin Superadmin.'
      );
    } finally {
      setUpdatingRoleUid(null);
    }
  };

  const inspectedUser = inspectedUid ? userByUid.get(inspectedUid) ?? null : null;
  const inspectedActivity = inspectedUid ? activityByUid.get(inspectedUid) ?? null : null;

  return (
    <section aria-label="Panel Pantau Real-Time Superadmin dan Admin" className="space-y-4 sm:space-y-5">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${
                  isSuperAdmin
                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-200 border-indigo-200 dark:border-indigo-800'
                    : 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-200 border-teal-200 dark:border-teal-800'
                }`}
              >
                {isSuperAdmin ? (
                  <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                ) : (
                  <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                )}
                {isSuperAdmin ? 'Superadmin' : 'Admin (Mode Pantau)'}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden="true" />
                Pantau Real-Time Aktif
              </span>
              {hydratingProgress ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                  Memuat statistik ({hydratingProgress.done}/{hydratingProgress.total})
                </span>
              ) : null}
            </div>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-50">
              {isSuperAdmin ? 'Dashboard Superadmin' : 'Dashboard Pantau Admin'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              {isSuperAdmin
                ? 'Pantau siapa yang sedang belajar atau mengerjakan kuis secara langsung beserta hasilnya, serta angkat atau cabut wewenang Admin & Superadmin.'
                : 'Pantau aktivitas belajar dan hasil kuis seluruh pengguna secara langsung. Pengaturan wewenang Admin/Superadmin hanya dapat dilakukan oleh Superadmin.'}
            </p>
          </div>
        </div>
      </div>

      {streamError ? (
        <div
          role="alert"
          className="rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 p-4 text-xs sm:text-sm text-rose-800 dark:text-rose-200"
        >
          <strong>Koneksi pemantauan terganggu:</strong> {streamError}
        </div>
      ) : null}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Total Pengguna</span>
            <Users className="w-4 h-4 text-indigo-500" aria-hidden="true" />
          </div>
          <p className="mt-1.5 text-2xl font-bold font-mono-num text-slate-900 dark:text-slate-50">
            {kpis.totalUsers}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {kpis.totalAdmins} pengelola aktif
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Aktif Sekarang</span>
            <Radio className="w-4 h-4 text-emerald-500" aria-hidden="true" />
          </div>
          <p className="mt-1.5 text-2xl font-bold font-mono-num text-emerald-700 dark:text-emerald-400">
            {kpis.onlineUsers}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Aktif dalam 3 menit terakhir
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Sedang Kuis</span>
            <ClipboardCheck className="w-4 h-4 text-amber-500" aria-hidden="true" />
          </div>
          <p className="mt-1.5 text-2xl font-bold font-mono-num text-amber-700 dark:text-amber-400">
            {kpis.activeQuizzes}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Mengerjakan soal langsung
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Total Sesi Kuis</span>
            <Award className="w-4 h-4 text-violet-500" aria-hidden="true" />
          </div>
          <p className="mt-1.5 text-2xl font-bold font-mono-num text-slate-900 dark:text-slate-50">
            {kpis.totalQuizSessions}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Terekam di seluruh buku
          </p>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-sm flex flex-wrap gap-1.5">
        <button
          type="button"
          id="adminSubTab-live"
          onClick={() => setSubTab('live')}
          className={`flex-1 min-w-[140px] min-h-[40px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            subTab === 'live'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Activity className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Aktivitas Real-Time ({activities.length})</span>
        </button>

        <button
          type="button"
          id="adminSubTab-events"
          onClick={() => setSubTab('events')}
          className={`flex-1 min-w-[140px] min-h-[40px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            subTab === 'events'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ClipboardCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>Aliran Hasil Kuis ({events.length})</span>
        </button>

        <button
          type="button"
          id="adminSubTab-users"
          onClick={() => setSubTab('users')}
          className={`flex-1 min-w-[140px] min-h-[40px] px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer ${
            subTab === 'users'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Shield className="w-4 h-4 shrink-0" aria-hidden="true" />
          <span>
            {isSuperAdmin ? `Kelola Role (${users.length})` : `Daftar Pengguna (${users.length})`}
          </span>
        </button>
      </div>

      {loadingStreams ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center gap-2.5 text-sm text-slate-500 dark:text-slate-400 shadow-sm">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" aria-hidden="true" />
          <span>Menghubungkan pemantauan real-time...</span>
        </div>
      ) : subTab === 'live' ? (
        /* TAB 1: REAL-TIME LIVE ACTIVITY MONITOR */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Search
                  className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={activitySearch}
                  onChange={e => setActivitySearch(e.target.value)}
                  placeholder="Cari nama, email, buku, atau aktivitas..."
                  aria-label="Cari aktivitas pengguna"
                  className="w-full min-h-[40px] pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <label
                  htmlFor="selectActivitySort"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Urutkan:</span>
                </label>
                <select
                  id="selectActivitySort"
                  value={activitySort}
                  onChange={e => setActivitySort(e.target.value as MonitorSortOption)}
                  className="min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {MONITOR_SORT_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { id: 'all', label: 'Semua' },
                    { id: 'online', label: 'Aktif Sekarang' },
                    { id: 'quiz', label: 'Aktivitas Kuis' },
                  ] as const
                ).map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setActivityFilter(f.id)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                      activityFilter === f.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-200'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={showLiveCorrectAnswer}
                onClick={() => setShowLiveCorrectAnswer(prev => !prev)}
                className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold border inline-flex items-center gap-2 transition-colors cursor-pointer ${
                  showLiveCorrectAnswer
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-400/80 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/50'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {showLiveCorrectAnswer ? (
                  <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                ) : (
                  <EyeOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                )}
                <span>Kunci Jawaban</span>
                <span
                  aria-hidden="true"
                  className={`relative inline-flex h-4 w-7 shrink-0 items-center rounded-full transition-colors ${
                    showLiveCorrectAnswer
                      ? 'bg-emerald-500'
                      : 'bg-slate-300 dark:bg-slate-600'
                  }`}
                >
                  <span
                    className={`inline-block h-3 w-3 rounded-full bg-white shadow-xs transform transition-transform ${
                      showLiveCorrectAnswer ? 'translate-x-3.5' : 'translate-x-0.5'
                    }`}
                  />
                </span>
              </button>
            </div>
          </div>

          {filteredActivities.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Belum ada aktivitas pengguna yang cocok dengan filter saat ini.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActivities.map(act => {
                const status = classifyPresenceStatus(act.updatedAtMs, nowMs);
                const role = userByUid.get(act.uid)?.role ?? 'user';
                const hydrated = hydratedMetrics.get(act.uid);
                const masteredTotal = Math.max(act.masteredTotal, hydrated?.masteredTotal ?? 0);
                const quizSessionCount = Math.max(
                  act.quizSessionCount,
                  hydrated?.quizSessionCount ?? 0
                );
                const latestScore =
                  act.latestQuizScore >= 0
                    ? act.latestQuizScore
                    : hydrated && hydrated.latestQuizScore >= 0
                      ? hydrated.latestQuizScore
                      : -1;
                const initial = act.displayName.charAt(0).toUpperCase() || 'P';
                const isLiveQuiz = status === 'online' && act.activityType === 'quiz_running';
                const quizPct =
                  act.quizLiveTotal > 0
                    ? Math.round((act.quizLiveCurrent / act.quizLiveTotal) * 100)
                    : 0;

                return (
                  <div
                    key={act.uid}
                    className={`rounded-2xl border p-4 transition-colors ${
                      isLiveQuiz
                        ? 'border-amber-300 dark:border-amber-700/80 bg-amber-50/40 dark:bg-amber-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="relative shrink-0">
                          {act.avatarUrl ? (
                            <img
                              src={act.avatarUrl}
                              alt={act.displayName}
                              referrerPolicy="no-referrer"
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800"
                            />
                          ) : (
                            <span
                              aria-hidden="true"
                              className="w-10 h-10 rounded-full border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-200 font-bold text-sm inline-flex items-center justify-center"
                            >
                              {initial}
                            </span>
                          )}
                          <span
                            title={
                              status === 'online'
                                ? 'Aktif sekarang'
                                : status === 'recent'
                                  ? 'Baru saja aktif'
                                  : 'Offline'
                            }
                            className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                              status === 'online'
                                ? 'bg-emerald-500'
                                : status === 'recent'
                                  ? 'bg-amber-400'
                                  : 'bg-slate-400'
                            }`}
                          />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-sm font-bold text-slate-900 dark:text-slate-50 truncate">
                              {act.displayName}
                            </span>
                            {role !== 'user' ? (
                              <span
                                className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                                  role === 'superadmin'
                                    ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                                    : 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                                }`}
                              >
                                {getRoleLabelId(role)}
                              </span>
                            ) : null}
                            <span
                              className={`text-[11px] font-semibold ${
                                status === 'online'
                                  ? 'text-emerald-700 dark:text-emerald-400'
                                  : 'text-slate-500 dark:text-slate-400'
                              }`}
                            >
                              · {status === 'online' ? 'Aktif' : formatRelativeTimeId(act.updatedAtMs, nowMs)}
                            </span>
                          </div>

                          {act.email ? (
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                              {act.email}
                            </p>
                          ) : null}

                          <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 pt-0.5">
                            {act.activitySummary}
                          </p>

                          {isLiveQuiz && act.quizLiveTotal > 0 ? (
                            <div className="pt-1 max-w-md space-y-1">
                              <div className="flex items-center justify-between text-[11px] font-mono-num text-amber-800 dark:text-amber-200">
                                <span>
                                  Progres Kuis Live: Soal {act.quizLiveCurrent}/{act.quizLiveTotal}
                                </span>
                                <span>Benar: {act.quizLiveCorrect}</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-amber-200/70 dark:bg-amber-900/50 overflow-hidden">
                                <div
                                  className="h-full bg-amber-500 rounded-full transition-all"
                                  style={{ width: `${Math.min(100, quizPct)}%` }}
                                />
                              </div>
                            </div>
                          ) : null}

                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] text-slate-600 dark:text-slate-400 font-mono-num">
                            <span>
                              Buku: <strong className="font-sans">{getBookLabelId(act.activeBookId)}</strong>
                            </span>
                            <span>
                              Hafal: <strong className="text-emerald-700 dark:text-emerald-400">{masteredTotal}</strong>/264
                            </span>
                            <span>
                              Sulit: <strong className="text-amber-700 dark:text-amber-400">{act.hardTotal}</strong>
                            </span>
                            <span>
                              Tes: <strong>{quizSessionCount}</strong> sesi
                            </span>
                          </div>

                          {act.latestQuizSummary ? (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
                              Hasil kuis terakhir:{' '}
                              <span className="font-medium text-slate-700 dark:text-slate-200">
                                {act.latestQuizSummary}
                              </span>
                            </p>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                        {latestScore >= 0 ? (
                          <span
                            className={`px-2.5 py-1 rounded-lg border text-xs font-mono-num font-bold ${getScorePillClass(
                              latestScore
                            )}`}
                          >
                            Skor Terakhir: {latestScore}%
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                            Belum ada kuis
                          </span>
                        )}

                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {isLiveQuiz && act.quizLiveTotal > 0 ? (
                            <button
                              type="button"
                              onClick={() => toggleLiveQuizMonitor(act.uid)}
                              aria-expanded={expandedLiveQuizUids.includes(act.uid)}
                              className={`min-h-[34px] px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                                expandedLiveQuizUids.includes(act.uid)
                                  ? 'border-amber-400 dark:border-amber-600 bg-amber-100 dark:bg-amber-900/50 text-amber-900 dark:text-amber-100'
                                  : 'border-amber-300 dark:border-amber-700/80 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200'
                              }`}
                            >
                              <Radio className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              <span>
                                {expandedLiveQuizUids.includes(act.uid)
                                  ? 'Tutup Soal'
                                  : 'Pantau Soal'}
                              </span>
                              {expandedLiveQuizUids.includes(act.uid) ? (
                                <ChevronUp className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              ) : (
                                <ChevronDown className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                              )}
                            </button>
                          ) : null}

                          <button
                            type="button"
                            onClick={() => void handleInspectUser(act.uid)}
                            className="min-h-[34px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:border-indigo-300 dark:hover:border-indigo-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                            <span>Detail</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {isLiveQuiz &&
                    act.quizLiveTotal > 0 &&
                    expandedLiveQuizUids.includes(act.uid) ? (
                      <div className="mt-3.5 pt-3.5 border-t border-amber-200/80 dark:border-amber-800/60">
                        <LiveQuizQuestionCard
                          activity={act}
                          showCorrectAnswer={showLiveCorrectAnswer}
                          onToggleShowCorrectAnswer={() =>
                            setShowLiveCorrectAnswer(prev => !prev)
                          }
                          showFurigana={showLiveFurigana}
                          onToggleFurigana={() => setShowLiveFurigana(prev => !prev)}
                        />
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : subTab === 'events' ? (
        /* TAB 2: LIVE CHRONOLOGICAL STREAM OF QUIZ STARTS & RESULTS */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-50">
              Aliran Aktivitas &amp; Hasil Kuis Terbaru (Real-Time)
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono-num">
              {events.length} catatan
            </span>
          </div>

          {events.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Belum ada kejadian kuis yang tercatat. Saat pengguna memulai atau menyelesaikan kuis,
              hasilnya akan langsung muncul di sini.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {events.map(ev => (
                <div
                  key={ev.id}
                  className="p-3.5 bg-white dark:bg-slate-900 hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-50">
                        {ev.displayName}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          ev.eventType === 'quiz_completed'
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                        }`}
                      >
                        {ev.eventType === 'quiz_completed'
                          ? 'Selesai Kuis'
                          : ev.eventType === 'quiz_started'
                            ? 'Mulai Kuis'
                            : 'Progres'}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {formatRelativeTimeId(ev.createdAtMs, nowMs)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200">{ev.summary}</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {getBookLabelId(ev.bookId)} · {ev.scopeLabel} · {getQuizFocusLabelId(ev.focus)}
                      {ev.email ? ` · ${ev.email}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {ev.eventType === 'quiz_completed' && ev.score >= 0 ? (
                      <span
                        className={`px-2.5 py-1 rounded-lg border text-xs font-mono-num font-bold ${getScorePillClass(
                          ev.score
                        )}`}
                      >
                        {ev.correct}/{ev.total} ({ev.score}%)
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono-num text-slate-600 dark:text-slate-300">
                        {ev.total} soal
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => void handleInspectUser(ev.uid)}
                      className="min-h-[32px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                    >
                      Detail
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* TAB 3: USER DIRECTORY, SORTING & FULL ROLE MANAGEMENT (SUPERADMIN ONLY MUTATIONS) */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
          {!isSuperAdmin ? (
            <div className="rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 p-3.5 text-xs sm:text-sm text-teal-900 dark:text-teal-200 flex items-start gap-2.5">
              <Eye className="w-4 h-4 shrink-0 mt-0.5 text-teal-600 dark:text-teal-400" aria-hidden="true" />
              <p>
                Anda masuk sebagai <strong>Admin (Mode Pantau)</strong>. Anda dapat melihat seluruh
                pengguna dan progres belajar mereka secara real-time, namun hanya{' '}
                <strong>Superadmin</strong> yang berwenang memberikan atau mencabut hak Admin maupun
                Superadmin.
              </p>
            </div>
          ) : null}

          <div className="flex flex-col gap-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
              <div className="relative flex-1">
                <Search
                  className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  placeholder="Cari pengguna berdasarkan nama atau email..."
                  aria-label="Cari pengguna"
                  className="w-full min-h-[40px] pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <label
                  htmlFor="selectUserSort"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap"
                >
                  <ArrowUpDown className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Urutkan:</span>
                </label>
                <select
                  id="selectUserSort"
                  value={userSort}
                  onChange={e => setUserSort(e.target.value as MonitorSortOption)}
                  className="min-h-[40px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                >
                  {MONITOR_SORT_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                {(
                  [
                    { id: 'all', label: 'Semua' },
                    { id: 'superadmin', label: 'Superadmin' },
                    { id: 'admin', label: 'Admin' },
                    { id: 'user', label: 'Pembelajar' },
                  ] as const
                ).map(f => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setRoleFilter(f.id)}
                    className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
                      roleFilter === f.id
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-200'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono-num">
                Menampilkan {filteredUsers.length} dari {users.length} pengguna
              </span>
            </div>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center text-sm text-slate-500 dark:text-slate-400">
              Tidak ada pengguna yang cocok dengan pencarian Anda.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              {filteredUsers.map(u => {
                const canEditRole = canChangeTargetRole(currentUid, currentRole, u);
                const isBootstrapPrimary = isProtectedBootstrapSuperAdmin(u);
                const selectedRole = pendingRoles[u.uid] ?? u.role;
                const hasPendingChange = selectedRole !== u.role;
                const isUpdating = updatingRoleUid === u.uid;
                const metrics = mergedMetricsByUid.get(u.uid);
                const initial = u.displayName.charAt(0).toUpperCase() || 'P';

                return (
                  <div
                    key={u.uid}
                    className="p-3.5 sm:p-4 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {u.avatarUrl ? (
                        <img
                          src={u.avatarUrl}
                          alt={u.displayName}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="w-10 h-10 rounded-full border border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-200 font-bold text-sm inline-flex items-center justify-center shrink-0"
                        >
                          {initial}
                        </span>
                      )}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-sm font-bold text-slate-900 dark:text-slate-50 truncate">
                            {u.displayName}
                          </span>
                          {u.uid === currentUid ? (
                            <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                              (Anda)
                            </span>
                          ) : null}
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                              u.role === 'superadmin'
                                ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                                : u.role === 'admin'
                                  ? 'bg-teal-50 dark:bg-teal-950/70 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {getRoleLabelId(u.role)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {u.email || 'Email tersinkron saat login berikutnya'}
                        </p>
                        {metrics ? (
                          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[11px] text-slate-600 dark:text-slate-400 font-mono-num mt-0.5">
                            <span>
                              Hafal:{' '}
                              <strong className="text-emerald-700 dark:text-emerald-400">
                                {metrics.masteredTotal}
                              </strong>
                              /264
                            </span>
                            <span>
                              Tes:{' '}
                              <strong
                                className={
                                  metrics.quizSessionCount > 0
                                    ? 'text-indigo-700 dark:text-indigo-300'
                                    : ''
                                }
                              >
                                {metrics.quizSessionCount}
                              </strong>{' '}
                              sesi
                            </span>
                            {metrics.latestQuizScore >= 0 ? (
                              <span>
                                Skor terakhir: <strong>{metrics.latestQuizScore}%</strong>
                              </span>
                            ) : null}
                            <span className="font-sans text-slate-500 dark:text-slate-400">
                              · {formatRelativeTimeId(metrics.latestActivityMs, nowMs)}
                            </span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => void handleInspectUser(u.uid)}
                        className="min-h-[36px] px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 cursor-pointer"
                      >
                        Detail
                      </button>

                      {isSuperAdmin ? (
                        isBootstrapPrimary ? (
                          <span className="min-h-[36px] px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold text-indigo-700 dark:text-indigo-300 inline-flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
                            Superadmin Utama
                          </span>
                        ) : u.uid === currentUid ? (
                          <span className="min-h-[36px] px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 inline-flex items-center gap-1.5">
                            Akun Anda
                          </span>
                        ) : canEditRole ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              aria-label={`Ubah role untuk ${u.displayName}`}
                              value={selectedRole}
                              disabled={isUpdating}
                              onChange={e =>
                                setPendingRoles(prev => ({
                                  ...prev,
                                  [u.uid]: e.target.value as UserRole,
                                }))
                              }
                              className="min-h-[36px] rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-50"
                            >
                              <option value="user">Pembelajar</option>
                              <option value="admin">Admin (Pantau)</option>
                              <option value="superadmin">Superadmin</option>
                            </select>

                            {hasPendingChange ? (
                              <>
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => void handleCommitRoleChange(u, selectedRole)}
                                  className={`min-h-[36px] px-3 py-1.5 rounded-xl text-xs font-bold text-white inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 ${
                                    selectedRole === 'user'
                                      ? 'bg-rose-600 hover:bg-rose-700'
                                      : 'bg-indigo-600 hover:bg-indigo-700'
                                  }`}
                                >
                                  {isUpdating ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
                                  ) : null}
                                  {selectedRole === 'user' ? 'Cabut Akses' : 'Simpan'}
                                </button>
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() =>
                                    setPendingRoles(prev => {
                                      const copy = { ...prev };
                                      delete copy[u.uid];
                                      return copy;
                                    })
                                  }
                                  className="min-h-[36px] px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300 cursor-pointer"
                                >
                                  Batal
                                </button>
                              </>
                            ) : null}
                          </div>
                        ) : null
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <UserDetailMonitorModal
        open={Boolean(inspectedUid)}
        user={inspectedUser}
        liveActivity={inspectedActivity}
        books={books}
        loading={detailLoading}
        detail={detailData}
        nowMs={nowMs}
        showLiveCorrectAnswer={showLiveCorrectAnswer}
        onToggleShowLiveCorrectAnswer={() => setShowLiveCorrectAnswer(prev => !prev)}
        onClose={() => {
          setInspectedUid(null);
          setDetailData(null);
        }}
      />
    </section>
  );
}
