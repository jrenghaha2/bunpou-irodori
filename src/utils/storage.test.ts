import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildBackupPayload,
  commitScopedProgressTransaction,
  loadGlobalFuriganaPref,
  safeLoadSet,
  saveGlobalFuriganaPref,
  validateAndParseBackup,
  type StorageLike,
} from './storage';

function createMemoryStorage(): StorageLike {
  const store = new Map<string, string>();
  return {
    getItem: key => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: key => {
      store.delete(key);
    },
  };
}

test('buildBackupPayload and validateAndParseBackup round-trip validly, reject wrong bookId, and filter unknown IDs', () => {
  const validIds = new Set(['introductory-bab-3-p1', 'introductory-bab-4-p1']);
  const payload = buildBackupPayload(
    'introductory',
    new Set(['introductory-bab-3-p1']),
    new Set(['introductory-bab-4-p1'])
  );

  const parsed = validateAndParseBackup(JSON.stringify(payload), validIds, 'introductory');
  assert.equal(parsed.formatType, 'v1');
  assert.equal(parsed.bookId, 'introductory');
  assert.deepEqual(parsed.impMastered, ['introductory-bab-3-p1']);
  assert.deepEqual(parsed.impHard, ['introductory-bab-4-p1']);
  assert.equal(parsed.rejectedIds.length, 0);
  assert.equal(parsed.isEmptyBackup, false);

  // Explicit mismatch error when restoring Pemula backup while viewing Dasar 1
  assert.throws(
    () => validateAndParseBackup(JSON.stringify(payload), validIds, 'elementary1'),
    /untuk buku Pemula/
  );

  const dirtyJson = JSON.stringify({
    mastered: ['introductory-bab-3-p1', 'unknown-id'],
    hard: ['introductory-bab-3-p1', 'introductory-bab-4-p1'],
  });
  const legacyParsed = validateAndParseBackup(dirtyJson, validIds, 'introductory');
  assert.equal(legacyParsed.formatType, 'legacy-plain');
  assert.deepEqual(legacyParsed.impMastered, ['introductory-bab-3-p1']);
  assert.deepEqual(legacyParsed.impHard, ['introductory-bab-3-p1', 'introductory-bab-4-p1']);
  assert.deepEqual(legacyParsed.rejectedIds, ['unknown-id']);
});

test('global furigana preference persists cleanly via storage helpers', () => {
  const mem = createMemoryStorage();
  assert.equal(loadGlobalFuriganaPref(mem), true);
  saveGlobalFuriganaPref(false, mem);
  assert.equal(loadGlobalFuriganaPref(mem), false);
  saveGlobalFuriganaPref(true, mem);
  assert.equal(loadGlobalFuriganaPref(mem), true);
});

test('commitScopedProgressTransaction writes atomically and rolls back on write error', () => {
  const mem = createMemoryStorage();
  const validIds = new Set(['introductory-bab-3-p1', 'introductory-bab-4-p1']);

  const first = commitScopedProgressTransaction(
    'm_key',
    'h_key',
    new Set(['introductory-bab-3-p1']),
    new Set(),
    mem
  );
  assert.equal(first.ok, true);
  assert.deepEqual([...safeLoadSet('m_key', validIds, mem)], ['introductory-bab-3-p1']);

  let calls = 0;
  const failingStorage: StorageLike = {
    getItem: k => mem.getItem(k),
    removeItem: k => mem.removeItem(k),
    setItem: (k, v) => {
      calls++;
      if (calls === 2) {
        throw new Error('QuotaExceededError');
      }
      mem.setItem(k, v);
    },
  };

  const failed = commitScopedProgressTransaction(
    'm_key',
    'h_key',
    new Set(['introductory-bab-4-p1']),
    new Set(['introductory-bab-3-p1']),
    failingStorage
  );
  assert.equal(failed.ok, false);
  // Previous mastered state should be restored on rollback
  assert.deepEqual([...safeLoadSet('m_key', validIds, mem)], ['introductory-bab-3-p1']);
});
