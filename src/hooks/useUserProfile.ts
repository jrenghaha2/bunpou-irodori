import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { updateProfile, type User } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { OperationType, db } from '../firebase';
import {
  createUserProfileDoc,
  fetchUserProfileDoc,
  healUserProfileMetadataDoc,
  updateUserProfileDoc,
} from '../services/cloudSyncService';
import type { UserRole } from '../types/bunpou';
import {
  isBootstrapSuperAdminEmail,
  normalizeEmail,
  normalizeStoredRole,
  resolveEffectiveRole,
} from '../utils/adminRoles';
import { isValidAvatarUrl, sanitizeDisplayName } from '../utils/bunpouSync';
import type { ShowToastFn } from './useToast';

interface UseUserProfileOptions {
  user: User | null;
  offlineFallbackRef: MutableRefObject<boolean>;
  handleQuotaOrLog: (
    err: unknown,
    op: OperationType,
    path: string,
    notifyUser: boolean
  ) => boolean;
  showToast: ShowToastFn;
}

export function useUserProfile({
  user,
  offlineFallbackRef,
  handleQuotaOrLog,
  showToast,
}: UseUserProfileOptions) {
  const [customDisplayName, setCustomDisplayName] = useState('');
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [storedRole, setStoredRole] = useState<UserRole>('user');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const userProfileDocExistsRef = useRef(false);
  const profileInitPromiseRef = useRef<{ uid: string; promise: Promise<boolean> } | null>(null);
  const metadataHealedUidRef = useRef<string | null>(null);

  const resetProfileState = useCallback((clearDisplayValues = false) => {
    userProfileDocExistsRef.current = false;
    profileInitPromiseRef.current = null;
    metadataHealedUidRef.current = null;
    if (clearDisplayValues) {
      setCustomDisplayName('');
      setCustomAvatarUrl('');
      setStoredRole('user');
    }
  }, []);

  // Listen to own profile doc in real time so role promotions/revocations take effect immediately
  useEffect(() => {
    if (!user || !user.emailVerified || offlineFallbackRef.current) {
      setStoredRole('user');
      return;
    }
    const path = `users/${user.uid}`;
    const cleanEmail = normalizeEmail(user.email);
    const isBootstrapSuper = isBootstrapSuperAdminEmail(cleanEmail);

    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      snap => {
        if (!snap.exists()) return;
        const data = snap.data();
        if (typeof data.displayName === 'string' && data.displayName.trim()) {
          setCustomDisplayName(data.displayName);
        }
        if (typeof data.avatarUrl === 'string') {
          setCustomAvatarUrl(data.avatarUrl);
        }
        const docRole = normalizeStoredRole(data.role);
        setStoredRole(isBootstrapSuper ? 'superadmin' : docRole);
        userProfileDocExistsRef.current = true;

        // Auto-heal email or bootstrap superadmin role on legacy profile documents
        if (metadataHealedUidRef.current !== user.uid) {
          const storedEmail = typeof data.email === 'string' ? data.email : '';
          const needsEmailHeal = Boolean(cleanEmail && storedEmail !== cleanEmail);
          const needsSuperRoleHeal = Boolean(isBootstrapSuper && docRole !== 'superadmin');
          if (needsEmailHeal || needsSuperRoleHeal) {
            metadataHealedUidRef.current = user.uid;
            void healUserProfileMetadataDoc(user.uid, {
              ...(needsEmailHeal ? { email: cleanEmail } : {}),
              ...(needsSuperRoleHeal ? { role: 'superadmin' } : {}),
            }).catch(healErr => {
              metadataHealedUidRef.current = null;
              handleQuotaOrLog(healErr, OperationType.UPDATE, path, false);
            });
          } else {
            metadataHealedUidRef.current = user.uid;
          }
        }
      },
      err => {
        handleQuotaOrLog(err, OperationType.GET, path, false);
      }
    );
    return unsubscribe;
  }, [user, offlineFallbackRef, handleQuotaOrLog]);

  // Deduplicated profile doc initialization so parallel sync & quiz-history loads never race
  const ensureUserProfileDoc = useCallback(
    async (u: User): Promise<boolean> => {
      if (offlineFallbackRef.current) return false;
      if (userProfileDocExistsRef.current) return true;
      if (profileInitPromiseRef.current?.uid === u.uid) {
        return profileInitPromiseRef.current.promise;
      }

      const path = `users/${u.uid}`;

      const initPromise = (async () => {
        try {
          const snap = await fetchUserProfileDoc(u.uid);
          const cleanEmail = normalizeEmail(u.email);
          const isBootstrapSuper = u.emailVerified && isBootstrapSuperAdminEmail(cleanEmail);

          if (snap.exists) {
            if (snap.displayName) setCustomDisplayName(snap.displayName);
            if (snap.avatarUrl) setCustomAvatarUrl(snap.avatarUrl);
            setStoredRole(isBootstrapSuper ? 'superadmin' : snap.role);
            userProfileDocExistsRef.current = true;

            // Auto-heal email or bootstrap superadmin role on legacy profile documents
            if (u.emailVerified) {
              const needsEmailHeal = Boolean(cleanEmail && snap.email !== cleanEmail);
              const needsSuperRoleHeal = Boolean(isBootstrapSuper && snap.role !== 'superadmin');
              if (needsEmailHeal || needsSuperRoleHeal) {
                try {
                  await healUserProfileMetadataDoc(u.uid, {
                    ...(needsEmailHeal ? { email: cleanEmail } : {}),
                    ...(needsSuperRoleHeal ? { role: 'superadmin' } : {}),
                  });
                } catch (healErr) {
                  handleQuotaOrLog(healErr, OperationType.UPDATE, path, false);
                }
              }
            }
            return true;
          }
          if (!u.emailVerified) return false;

          const defaultName = sanitizeDisplayName(
            u.displayName || u.email?.split('@')[0] || 'Pembelajar'
          );
          const defaultAvatar =
            u.photoURL && isValidAvatarUrl(u.photoURL) ? u.photoURL : '';
          const initialRole: UserRole = isBootstrapSuper ? 'superadmin' : 'user';

          await createUserProfileDoc(u.uid, defaultName, defaultAvatar, cleanEmail, initialRole);
          setCustomDisplayName(defaultName);
          setCustomAvatarUrl(defaultAvatar);
          setStoredRole(initialRole);
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
    [offlineFallbackRef, handleQuotaOrLog]
  );

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
            await updateUserProfileDoc(user.uid, cleanName, avatarUrl, user.email ?? '');
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
    [user, offlineFallbackRef, ensureUserProfileDoc, showToast]
  );

  const userRole = useMemo<UserRole>(
    () => resolveEffectiveRole(user?.email, storedRole, Boolean(user?.emailVerified)),
    [user?.email, user?.emailVerified, storedRole]
  );

  return {
    customDisplayName,
    customAvatarUrl,
    userRole,
    profileModalOpen,
    setProfileModalOpen,
    profileSaving,
    ensureUserProfileDoc,
    handleSaveProfile,
    resetProfileState,
  };
}
