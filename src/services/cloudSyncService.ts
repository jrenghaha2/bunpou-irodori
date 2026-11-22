import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { BookId, UserRole } from '../types/bunpou';
import { normalizeEmail, normalizeStoredRole } from '../utils/adminRoles';

export interface UserProfileSnapshot {
  exists: boolean;
  displayName: string;
  avatarUrl: string;
  email: string;
  role: UserRole;
  hasRoleField: boolean;
}

export interface BookProgressSnapshot {
  exists: boolean;
  mastered: unknown;
  hard: unknown;
}

export interface QuizHistorySnapshot {
  exists: boolean;
  sessions: unknown[];
}

export async function fetchUserProfileDoc(uid: string): Promise<UserProfileSnapshot> {
  const ref = doc(db, 'users', uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return {
      exists: false,
      displayName: '',
      avatarUrl: '',
      email: '',
      role: 'user',
      hasRoleField: false,
    };
  }
  const data = snap.data();
  return {
    exists: true,
    displayName: typeof data.displayName === 'string' ? data.displayName : '',
    avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : '',
    email: typeof data.email === 'string' ? data.email : '',
    role: normalizeStoredRole(data.role),
    hasRoleField: typeof data.role === 'string',
  };
}

export async function createUserProfileDoc(
  uid: string,
  displayName: string,
  avatarUrl: string,
  email: string,
  role: UserRole
): Promise<void> {
  const ref = doc(db, 'users', uid);
  const cleanEmail = normalizeEmail(email);
  const payload: Record<string, unknown> = {
    uid,
    role,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (displayName) payload.displayName = displayName;
  if (avatarUrl) payload.avatarUrl = avatarUrl;
  if (cleanEmail) payload.email = cleanEmail;
  await setDoc(ref, payload);
}

export async function updateUserProfileDoc(
  uid: string,
  displayName: string,
  avatarUrl: string,
  email?: string
): Promise<void> {
  const ref = doc(db, 'users', uid);
  const patch: Record<string, unknown> = {
    displayName,
    avatarUrl,
    updatedAt: serverTimestamp(),
  };
  if (email !== undefined) {
    patch.email = normalizeEmail(email);
  }
  await updateDoc(ref, patch);
}

export async function healUserProfileMetadataDoc(
  uid: string,
  patchFields: {
    displayName?: string;
    avatarUrl?: string;
    email?: string;
    role?: 'superadmin';
  }
): Promise<void> {
  const ref = doc(db, 'users', uid);
  const patch: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };
  if (patchFields.displayName !== undefined) patch.displayName = patchFields.displayName;
  if (patchFields.avatarUrl !== undefined) patch.avatarUrl = patchFields.avatarUrl;
  if (patchFields.email !== undefined) patch.email = normalizeEmail(patchFields.email);
  if (patchFields.role === 'superadmin') patch.role = 'superadmin';
  await updateDoc(ref, patch);
}

export async function fetchBookProgressDoc(
  uid: string,
  bookId: BookId
): Promise<BookProgressSnapshot> {
  const ref = doc(db, 'users', uid, 'bunpouProgress', bookId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return { exists: false, mastered: [], hard: [] };
  }
  const data = snap.data();
  return {
    exists: true,
    mastered: data.mastered,
    hard: data.hard,
  };
}

export async function saveBookProgressDoc(
  uid: string,
  bookId: BookId,
  mastered: string[],
  hard: string[],
  docExists: boolean
): Promise<void> {
  const ref = doc(db, 'users', uid, 'bunpouProgress', bookId);
  if (docExists) {
    await updateDoc(ref, {
      mastered,
      hard,
      updatedAt: serverTimestamp(),
    });
    return;
  }
  await setDoc(ref, {
    uid,
    bookId,
    mastered,
    hard,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function fetchQuizHistoryDoc(
  uid: string,
  bookId: BookId
): Promise<QuizHistorySnapshot> {
  const ref = doc(db, 'users', uid, 'quizHistory', bookId);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return { exists: false, sessions: [] };
  }
  const data = snap.data();
  return {
    exists: true,
    sessions: Array.isArray(data.sessions) ? data.sessions : [],
  };
}

export async function saveQuizHistoryDoc(
  uid: string,
  bookId: BookId,
  sessions: string[],
  docExists: boolean
): Promise<void> {
  const ref = doc(db, 'users', uid, 'quizHistory', bookId);
  if (docExists) {
    await updateDoc(ref, {
      sessions,
      updatedAt: serverTimestamp(),
    });
    return;
  }
  await setDoc(ref, {
    uid,
    bookId,
    sessions,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
