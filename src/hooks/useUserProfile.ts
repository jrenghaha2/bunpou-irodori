import { useCallback, useRef, useState, type MutableRefObject } from 'react';
import { updateProfile, type User } from 'firebase/auth';
import { OperationType } from '../firebase';
import {
  createUserProfileDoc,
  fetchUserProfileDoc,
  updateUserProfileDoc,
} from '../services/cloudSyncService';
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
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);

  const userProfileDocExistsRef = useRef(false);
  const profileInitPromiseRef = useRef<{ uid: string; promise: Promise<boolean> } | null>(null);

  const resetProfileState = useCallback((clearDisplayValues = false) => {
    userProfileDocExistsRef.current = false;
    profileInitPromiseRef.current = null;
    if (clearDisplayValues) {
      setCustomDisplayName('');
      setCustomAvatarUrl('');
    }
  }, []);

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
          if (snap.exists) {
            if (snap.displayName) setCustomDisplayName(snap.displayName);
            if (snap.avatarUrl) setCustomAvatarUrl(snap.avatarUrl);
            userProfileDocExistsRef.current = true;
            return true;
          }
          if (!u.emailVerified) return false;

          const defaultName = sanitizeDisplayName(
            u.displayName || u.email?.split('@')[0] || 'Pembelajar'
          );
          const defaultAvatar =
            u.photoURL && isValidAvatarUrl(u.photoURL) ? u.photoURL : '';

          await createUserProfileDoc(u.uid, defaultName, defaultAvatar);
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
            await updateUserProfileDoc(user.uid, cleanName, avatarUrl);
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

  return {
    customDisplayName,
    customAvatarUrl,
    profileModalOpen,
    setProfileModalOpen,
    profileSaving,
    ensureUserProfileDoc,
    handleSaveProfile,
    resetProfileState,
  };
}
