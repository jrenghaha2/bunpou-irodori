import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import type { BookId } from '../types/bunpou';

export interface UserProfileSnapshot {
  exists: boolean;
  displayName: string;
  avatarUrl: string;
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
    return { exists: false, displayName: '', avatarUrl: '' };
  }
  const data = snap.data();
  return {
    exists: true,
    displayName: typeof data.displayName === 'string' ? data.displayName : '',
    avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : '',
  };
}

export async function createUserProfileDoc(
  uid: string,
  displayName: string,
  avatarUrl: string
): Promise<void> {
  const ref = doc(db, 'users', uid);
  const payload: Record<string, unknown> = {
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  if (displayName) payload.displayName = displayName;
  if (avatarUrl) payload.avatarUrl = avatarUrl;
  await setDoc(ref, payload);
}

export async function updateUserProfileDoc(
  uid: string,
  displayName: string,
  avatarUrl: string
): Promise<void> {
  const ref = doc(db, 'users', uid);
  await updateDoc(ref, {
    displayName,
    avatarUrl,
    updatedAt: serverTimestamp(),
  });
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
