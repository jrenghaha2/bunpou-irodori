import type { BackupParseResult, BookId, StorageMutationResult } from '../types/bunpou';
import { BOOK_ORDER } from '../types/bunpou';
import { BOOK_STORAGE_KEYS } from './bunpouSync';

export const OWNER_UID_KEY = 'irodori_bunpou_owner_uid_v1';
export const FURIGANA_STORAGE_KEY = 'irodori_bunpou_furigana_v1';
export const TRANSLATION_STORAGE_KEY = 'irodori_bunpou_translation_v1';
export const BACKUP_APP_ID = 'irodori-bunpou';
export const BACKUP_SCHEMA_VERSION = 1;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function getDefaultStorage(): StorageLike | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage;
    }
  } catch {
    return null;
  }
  return null;
}

export function safeLoadSet(
  key: string,
  validIds: Set<string>,
  storage: StorageLike | null = getDefaultStorage()
): Set<string> {
  if (!storage) return new Set();
  try {
    const raw = storage.getItem(key);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === 'string' && validIds.has(id)));
  } catch {
    return new Set();
  }
}

export function loadGlobalFuriganaPref(storage: StorageLike | null = getDefaultStorage()): boolean {
  if (!storage) return true;
  try {
    const raw = storage.getItem(FURIGANA_STORAGE_KEY);
    if (raw === '0' || raw === 'false') return false;
    return true;
  } catch {
    return true;
  }
}

export function saveGlobalFuriganaPref(
  enabled: boolean,
  storage: StorageLike | null = getDefaultStorage()
): void {
  if (!storage) return;
  try {
    storage.setItem(FURIGANA_STORAGE_KEY, enabled ? '1' : '0');
  } catch {
    // Non-fatal
  }
}

export function loadGlobalTranslationPref(
  storage: StorageLike | null = getDefaultStorage()
): boolean {
  if (!storage) return true;
  try {
    const raw = storage.getItem(TRANSLATION_STORAGE_KEY);
    if (raw === '0' || raw === 'false') return false;
    return true;
  } catch {
    return true;
  }
}

export function saveGlobalTranslationPref(
  enabled: boolean,
  storage: StorageLike | null = getDefaultStorage()
): void {
  if (!storage) return;
  try {
    storage.setItem(TRANSLATION_STORAGE_KEY, enabled ? '1' : '0');
  } catch {
    // Non-fatal
  }
}

export function getStoredOwnerUid(
  storage: StorageLike | null = getDefaultStorage()
): string | null {
  if (!storage) return null;
  try {
    const val = storage.getItem(OWNER_UID_KEY);
    return val && val.trim() ? val.trim() : null;
  } catch {
    return null;
  }
}

export function setStoredOwnerUid(
  uid: string | null,
  storage: StorageLike | null = getDefaultStorage()
): void {
  if (!storage) return;
  try {
    if (uid) {
      storage.setItem(OWNER_UID_KEY, uid);
    } else {
      storage.removeItem(OWNER_UID_KEY);
    }
  } catch {
    // Ignore storage lock errors
  }
}

export function clearAllStoredProgress(storage: StorageLike | null = getDefaultStorage()): void {
  if (!storage) return;
  try {
    for (const bookId of BOOK_ORDER) {
      const keys = BOOK_STORAGE_KEYS[bookId];
      storage.removeItem(keys.masteredKey);
      storage.removeItem(keys.hardKey);
      storage.removeItem(keys.quizHistoryKey);
    }
    storage.removeItem(OWNER_UID_KEY);
  } catch {
    // Ignore storage lock errors
  }
}

export function commitScopedProgressTransaction(
  masteredKey: string,
  hardKey: string,
  nextMastered: Set<string>,
  nextHard: Set<string>,
  storage: StorageLike | null = getDefaultStorage()
): StorageMutationResult {
  if (!storage) {
    return {
      ok: false,
      error: 'Penyimpanan browser (localStorage) tidak tersedia atau diblokir.',
    };
  }

  let prevRawM: string | null = null;
  let prevRawH: string | null = null;

  try {
    prevRawM = storage.getItem(masteredKey);
    prevRawH = storage.getItem(hardKey);
  } catch {
    return {
      ok: false,
      error: 'Penyimpanan browser (localStorage) tidak dapat diakses.',
    };
  }

  try {
    const mJson = JSON.stringify([...nextMastered]);
    const hJson = JSON.stringify([...nextHard]);
    storage.setItem(masteredKey, mJson);
    storage.setItem(hardKey, hJson);

    const verifyM = storage.getItem(masteredKey);
    const verifyH = storage.getItem(hardKey);
    if (verifyM !== mJson || verifyH !== hJson) {
      throw new Error('Verification mismatch after write');
    }

    return { ok: true };
  } catch {
    try {
      if (prevRawM === null) storage.removeItem(masteredKey);
      else storage.setItem(masteredKey, prevRawM);
      if (prevRawH === null) storage.removeItem(hardKey);
      else storage.setItem(hardKey, prevRawH);
    } catch {
      // Ignore rollback errors
    }
    return {
      ok: false,
      error:
        'Gagal menyimpan ke penyimpanan browser (memori penuh atau diblokir). Progres sebelumnya tetap aman.',
    };
  }
}

const ALLOWED_V1_KEYS = new Set(['app', 'version', 'bookId', 'exportedAt', 'mastered', 'hard']);
const ALLOWED_LEGACY_PLAIN_KEYS = new Set(['mastered', 'hard', 'exportedAt']);

export function validateAndParseBackup(
  rawText: string,
  validIds: Set<string>,
  expectedBookId?: BookId
): BackupParseResult {
  let data: unknown;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error('File bukan format JSON yang valid atau rusak.');
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Struktur JSON tidak valid (harus berupa objek backup).');
  }

  const obj = data as Record<string, unknown>;
  const keys = Object.keys(obj);

  const hasApp = Object.prototype.hasOwnProperty.call(obj, 'app');
  const hasVersion = Object.prototype.hasOwnProperty.call(obj, 'version');
  const hasMastered = Object.prototype.hasOwnProperty.call(obj, 'mastered');
  const hasHard = Object.prototype.hasOwnProperty.call(obj, 'hard');

  let rawMastered: unknown[] = [];
  let rawHard: unknown[] = [];
  let formatType: BackupParseResult['formatType'] = 'v1';
  let parsedBookId: BookId | undefined;

  if (hasApp || hasVersion) {
    if (obj.app !== BACKUP_APP_ID) {
      throw new Error(`Identitas aplikasi tidak cocok (app: "${String(obj.app ?? '')}").`);
    }
    if (obj.version !== BACKUP_SCHEMA_VERSION) {
      throw new Error(`Versi skema backup tidak didukung (version: ${String(obj.version ?? '')}).`);
    }
    if (!hasMastered || !hasHard) {
      throw new Error('File backup v1 harus memiliki array "mastered" dan "hard".');
    }
    if (!Array.isArray(obj.mastered)) {
      throw new Error('Struktur data "mastered" rusak (harus berupa array).');
    }
    if (!Array.isArray(obj.hard)) {
      throw new Error('Struktur data "hard" rusak (harus berupa array).');
    }
    if (obj.exportedAt !== undefined && typeof obj.exportedAt !== 'string') {
      throw new Error('Format field "exportedAt" tidak valid.');
    }
    if (
      obj.bookId !== undefined &&
      !BOOK_ORDER.includes(obj.bookId as BookId)
    ) {
      throw new Error(`Identitas buku pada backup tidak dikenali ("${String(obj.bookId)}").`);
    }
    parsedBookId = obj.bookId as BookId | undefined;
    if (parsedBookId && expectedBookId && parsedBookId !== expectedBookId) {
      throw new Error(
        `File backup ini untuk buku ${BOOK_STORAGE_KEYS[parsedBookId].shortLabel}, sedangkan buku aktif saat ini ${BOOK_STORAGE_KEYS[expectedBookId].shortLabel}. Pindah ke buku ${BOOK_STORAGE_KEYS[parsedBookId].shortLabel} terlebih dahulu.`
      );
    }
    for (const k of keys) {
      if (!ALLOWED_V1_KEYS.has(k)) {
        throw new Error(`Field tidak dikenali dalam file backup: "${k}".`);
      }
    }
    rawMastered = obj.mastered;
    rawHard = obj.hard;
    formatType = 'v1';
  } else if (hasMastered && hasHard) {
    for (const k of keys) {
      if (!ALLOWED_LEGACY_PLAIN_KEYS.has(k)) {
        throw new Error('File JSON tidak dikenali sebagai backup Irodori Bunpou.');
      }
    }
    if (!Array.isArray(obj.mastered) || !Array.isArray(obj.hard)) {
      throw new Error('Struktur data "mastered" atau "hard" harus berupa array.');
    }
    rawMastered = obj.mastered;
    rawHard = obj.hard;
    formatType = 'legacy-plain';
  } else {
    throw new Error('File tidak memiliki struktur data backup Irodori Bunpou yang valid.');
  }

  const impMasteredSet = new Set<string>();
  const impHardSet = new Set<string>();
  const rejectedSet = new Set<string>();

  const inspectList = (arr: unknown[], targetSet: Set<string>) => {
    for (const entry of arr) {
      if (typeof entry === 'string' && validIds.has(entry)) {
        targetSet.add(entry);
      } else {
        rejectedSet.add(typeof entry === 'string' ? entry : JSON.stringify(entry));
      }
    }
  };

  inspectList(rawMastered, impMasteredSet);
  inspectList(rawHard, impHardSet);

  const impMastered = [...impMasteredSet];
  const impHard = [...impHardSet];
  const rejectedIds = [...rejectedSet];

  if (
    formatType === 'legacy-plain' &&
    rejectedIds.length > 0 &&
    impMastered.length === 0 &&
    impHard.length === 0
  ) {
    throw new Error('File tidak mengandung ID pola bunpou yang valid untuk buku aktif.');
  }

  return {
    formatType,
    exportedAt: typeof obj.exportedAt === 'string' ? obj.exportedAt : '',
    bookId: parsedBookId,
    impMastered,
    impHard,
    rejectedIds,
    isEmptyBackup: impMastered.length === 0 && impHard.length === 0,
  };
}

export function buildBackupPayload(
  bookId: BookId,
  mastered: Set<string>,
  hardSet: Set<string>
) {
  return {
    app: BACKUP_APP_ID,
    version: BACKUP_SCHEMA_VERSION,
    bookId,
    exportedAt: new Date().toISOString(),
    mastered: [...mastered],
    hard: [...hardSet],
  };
}
