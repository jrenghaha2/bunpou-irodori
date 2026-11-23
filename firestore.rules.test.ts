import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const RULES_PATH = path.resolve(process.cwd(), 'firestore.rules');
const rulesText = fs.readFileSync(RULES_PATH, 'utf8');

const INTRO_ITEM_RE = /^introductory-bab-([1-9]|1[0-8])-p[1-9][0-9]?$/;
const ELEM1_ITEM_RE = /^elementary1-bab-([1-9]|1[0-8])-p[1-9][0-9]?$/;
const ELEM2_ITEM_RE = /^elementary2-bab-([1-9]|1[0-8])-p[1-9][0-9]?$/;

function buildQuizTokenRegex(bookId: string): RegExp {
  return new RegExp(
    `^[a-zA-Z0-9_\\-]+\\|[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\\.[0-9]{1,3})?Z\\|(mixed|cloze|formula|function)\\|[0-9]{1,3}\\|[1-9][0-9]{0,2}\\|(100|[0-9]{1,2})\\|(all|([1-9]|1[0-8])(\\.([1-9]|1[0-8]))*)\\|(|[1-9][0-9]{0,2}:[0-2]:${bookId}-bab-([1-9]|1[0-8])-p[1-9][0-9]?:[01](:[A-Za-z0-9_\\-]{1,260})?(;[1-9][0-9]{0,2}:[0-2]:${bookId}-bab-([1-9]|1[0-8])-p[1-9][0-9]?:[01](:[A-Za-z0-9_\\-]{1,260})?)*)$`
  );
}

interface MockAuth {
  uid: string;
  email?: string;
  emailVerified: boolean;
}

interface MockUserDoc {
  uid: string;
  displayName?: string;
  avatarUrl?: string;
  email?: string;
  role?: 'user' | 'admin' | 'superadmin';
  createdAt: string;
  updatedAt: string;
}

function isBootstrapSuperAdmin(auth: MockAuth | null): boolean {
  return Boolean(
    auth &&
      auth.emailVerified &&
      typeof auth.email === 'string' &&
      auth.email.toLowerCase() === 'jrenghaha2@gmail.com'
  );
}

function resolveDbRole(auth: MockAuth | null, dbUsers: Record<string, MockUserDoc>): string {
  if (!auth || !auth.emailVerified) return 'user';
  if (isBootstrapSuperAdmin(auth)) return 'superadmin';
  return dbUsers[auth.uid]?.role ?? 'user';
}

function isSuperAdmin(auth: MockAuth | null, dbUsers: Record<string, MockUserDoc>): boolean {
  return resolveDbRole(auth, dbUsers) === 'superadmin';
}

function isAdminOrSuperAdmin(auth: MockAuth | null, dbUsers: Record<string, MockUserDoc>): boolean {
  const role = resolveDbRole(auth, dbUsers);
  return role === 'superadmin' || role === 'admin';
}

function canUpdateUserRole(
  auth: MockAuth | null,
  targetUid: string,
  existingDoc: MockUserDoc,
  incomingDoc: Record<string, unknown>,
  dbUsers: Record<string, MockUserDoc>,
  nowMarker = 'SERVER_TIME'
): boolean {
  if (!auth || !auth.emailVerified) return false;
  if (!/^[a-zA-Z0-9_\-]{1,128}$/.test(targetUid)) return false;
  const allowedKeys = ['uid', 'displayName', 'avatarUrl', 'email', 'role', 'createdAt', 'updatedAt'];
  const keys = Object.keys(incomingDoc);
  if (!['uid', 'createdAt', 'updatedAt'].every(k => keys.includes(k))) return false;
  if (!keys.every(k => allowedKeys.includes(k))) return false;
  if (incomingDoc.uid !== existingDoc.uid || incomingDoc.uid !== targetUid) return false;
  if (incomingDoc.createdAt !== existingDoc.createdAt) return false;
  if (incomingDoc.updatedAt !== nowMarker) return false;

  const affected = new Set<string>();
  for (const k of new Set([...Object.keys(existingDoc), ...keys])) {
    if ((existingDoc as unknown as Record<string, unknown>)[k] !== incomingDoc[k]) {
      affected.add(k);
    }
  }

  // Action 1: Owner profile update (never touches role)
  if (auth.uid === targetUid) {
    const ownerAllowed = new Set(['displayName', 'avatarUrl', 'email', 'updatedAt']);
    if ([...affected].every(k => ownerAllowed.has(k))) return true;
    // Action 2: Bootstrap superadmin self-heal
    const healAllowed = new Set(['displayName', 'avatarUrl', 'email', 'role', 'updatedAt']);
    if (
      isBootstrapSuperAdmin(auth) &&
      incomingDoc.role === 'superadmin' &&
      [...affected].every(k => healAllowed.has(k))
    ) {
      return true;
    }
    return false;
  }

  // Action 3: Superadmin grant/revoke admin or superadmin on another non-bootstrap user
  const roleOnly = new Set(['role', 'updatedAt']);
  return (
    isSuperAdmin(auth, dbUsers) &&
    targetUid !== auth.uid &&
    existingDoc.email !== 'jrenghaha2@gmail.com' &&
    (incomingDoc.role === 'user' || incomingDoc.role === 'admin' || incomingDoc.role === 'superadmin') &&
    [...affected].every(k => roleOnly.has(k))
  );
}

function validateList(arr: unknown, bookId: string): boolean {
  if (!Array.isArray(arr) || arr.length > 150) return false;
  if (new Set(arr).size !== arr.length) return false;
  if (arr.length === 0) return true;
  if (!arr.every(v => typeof v === 'string')) return false;
  const re =
    bookId === 'introductory'
      ? INTRO_ITEM_RE
      : bookId === 'elementary1'
        ? ELEM1_ITEM_RE
        : bookId === 'elementary2'
          ? ELEM2_ITEM_RE
          : null;
  if (!re) return false;
  const joinedComma = arr.join(',');
  const joinedPipe = arr.join('|');
  if (joinedComma.length > 4000) return false;
  const singleSrc = re.source.slice(1, -1);
  const commaRe = new RegExp(`^${singleSrc}(,${singleSrc})*$`);
  const pipeRe = new RegExp(`^${singleSrc}(\\|${singleSrc})*$`);
  return re.test(arr[0]) && commaRe.test(joinedComma) && pipeRe.test(joinedPipe);
}

function validateSessions(arr: unknown, bookId: string): boolean {
  if (!['introductory', 'elementary1', 'elementary2'].includes(bookId)) return false;
  if (!Array.isArray(arr) || arr.length > 15) return false;
  if (new Set(arr).size !== arr.length) return false;
  const tokenRe = buildQuizTokenRegex(bookId);
  return arr.every(
    item =>
      typeof item === 'string' &&
      item.length >= 24 &&
      item.length <= 16000 &&
      tokenRe.test(item)
  );
}

function canWriteProgress(
  auth: MockAuth | null,
  userId: string,
  bookId: string,
  parentExists: boolean,
  data: Record<string, unknown>,
  nowMarker = 'SERVER_TIME'
): boolean {
  if (!auth || !auth.emailVerified) return false;
  if (!/^[a-zA-Z0-9_\-]{1,128}$/.test(userId)) return false;
  if (auth.uid !== userId) return false;
  if (!['introductory', 'elementary1', 'elementary2'].includes(bookId)) return false;
  const keys = Object.keys(data);
  const required = ['uid', 'bookId', 'mastered', 'hard', 'createdAt', 'updatedAt'];
  if (!required.every(k => keys.includes(k))) return false;
  if (!keys.every(k => required.includes(k))) return false;
  if (data.uid !== auth.uid || data.bookId !== bookId) return false;
  if (data.createdAt !== nowMarker || data.updatedAt !== nowMarker) return false;
  if (!validateList(data.mastered, bookId) || !validateList(data.hard, bookId)) return false;
  const mSet = new Set(data.mastered as string[]);
  for (const h of data.hard as string[]) {
    if (mSet.has(h)) return false;
  }
  return parentExists;
}

test('firestore.rules structural security invariants (Eight Pillars + 3-Tier RBAC)', () => {
  assert.match(rulesText, /rules_version = '2';/);
  assert.match(rulesText, /match \/\{document=\*\*\} \{\s*allow read, write: if false;\s*\}/);
  assert.match(rulesText, /request\.auth\.token\.email_verified == true/);
  assert.match(rulesText, /request\.auth\.token\.email\.lower\(\) == 'jrenghaha2@gmail\.com'/);
  assert.match(rulesText, /function isSuperAdmin\(\)/);
  assert.match(rulesText, /function isAdminOrSuperAdmin\(\)/);
  assert.match(rulesText, /request\.query\.limit <= 100/);
  assert.match(rulesText, /allow delete: if false;/);
  assert.match(rulesText, /allow update, delete: if false;/);
  assert.match(rulesText, /exists\(\/databases\/\$\(database\)\/documents\/users\/\$\(userId\)\)/);
  assert.match(rulesText, /incoming\(\)\.createdAt == request\.time/);
  assert.match(rulesText, /incoming\(\)\.updatedAt == request\.time/);
  assert.match(rulesText, /incoming\(\)\.diff\(existing\(\)\)\.affectedKeys\(\)\.hasOnly/);
  assert.match(rulesText, /match \/bunpouProgress\/\{bookId\}/);
  assert.match(rulesText, /match \/quizHistory\/\{bookId\}/);
  assert.match(rulesText, /match \/liveActivity\/\{userId\}/);
  assert.match(rulesText, /match \/activityEvents\/\{eventId\}/);
  assert.match(rulesText, /val\.size\(\) <= 16000/);
  assert.match(rulesText, /\(:?\[A-Za-z0-9_\\\\-\]\{1,260\}\)\?/);
});

test('3-Tier RBAC adversarial tests: Superadmin vs Admin vs User & Email Spoofing', () => {
  const dbUsers: Record<string, MockUserDoc> = {
    rasenUid: {
      uid: 'rasenUid',
      displayName: 'Rasen',
      email: 'jrenghaha2@gmail.com',
      role: 'superadmin',
      createdAt: 'T0',
      updatedAt: 'T0',
    },
    adminUid: {
      uid: 'adminUid',
      displayName: 'Admin Budi',
      email: 'budi@example.com',
      role: 'admin',
      createdAt: 'T0',
      updatedAt: 'T0',
    },
    learnerUid: {
      uid: 'learnerUid',
      displayName: 'Siti',
      email: 'siti@example.com',
      role: 'user',
      createdAt: 'T0',
      updatedAt: 'T0',
    },
  };

  const superAuth: MockAuth = {
    uid: 'rasenUid',
    email: 'jrenghaha2@gmail.com',
    emailVerified: true,
  };
  const spoofedSuperAuth: MockAuth = {
    uid: 'evilUid',
    email: 'jrenghaha2@gmail.com',
    emailVerified: false,
  };
  const adminAuth: MockAuth = {
    uid: 'adminUid',
    email: 'budi@example.com',
    emailVerified: true,
  };
  const learnerAuth: MockAuth = {
    uid: 'learnerUid',
    email: 'siti@example.com',
    emailVerified: true,
  };

  // Monitoring read privileges
  assert.equal(isAdminOrSuperAdmin(superAuth, dbUsers), true);
  assert.equal(isAdminOrSuperAdmin(adminAuth, dbUsers), true);
  assert.equal(isAdminOrSuperAdmin(learnerAuth, dbUsers), false);
  assert.equal(isAdminOrSuperAdmin(spoofedSuperAuth, dbUsers), false);

  // Superadmin CAN promote regular user to admin and revoke admin back to user
  assert.equal(
    canUpdateUserRole(
      superAuth,
      'learnerUid',
      dbUsers.learnerUid,
      { ...dbUsers.learnerUid, role: 'admin', updatedAt: 'SERVER_TIME' },
      dbUsers
    ),
    true
  );
  assert.equal(
    canUpdateUserRole(
      superAuth,
      'adminUid',
      dbUsers.adminUid,
      { ...dbUsers.adminUid, role: 'user', updatedAt: 'SERVER_TIME' },
      dbUsers
    ),
    true
  );

  // Admin CANNOT promote or demote anyone (read-only monitoring only!)
  assert.equal(
    canUpdateUserRole(
      adminAuth,
      'learnerUid',
      dbUsers.learnerUid,
      { ...dbUsers.learnerUid, role: 'admin', updatedAt: 'SERVER_TIME' },
      dbUsers
    ),
    false
  );
  assert.equal(
    canUpdateUserRole(
      adminAuth,
      'rasenUid',
      dbUsers.rasenUid,
      { ...dbUsers.rasenUid, role: 'user', updatedAt: 'SERVER_TIME' },
      dbUsers
    ),
    false
  );

  // Regular user CANNOT self-escalate to admin or superadmin
  assert.equal(
    canUpdateUserRole(
      learnerAuth,
      'learnerUid',
      dbUsers.learnerUid,
      { ...dbUsers.learnerUid, role: 'admin', updatedAt: 'SERVER_TIME' },
      dbUsers
    ),
    false
  );

  // Superadmin CAN promote user/admin to superadmin and revoke another superadmin back to user/admin
  assert.equal(
    canUpdateUserRole(
      superAuth,
      'learnerUid',
      dbUsers.learnerUid,
      { ...dbUsers.learnerUid, role: 'superadmin', updatedAt: 'SERVER_TIME' },
      dbUsers
    ),
    true
  );
  const coSuperDoc: MockUserDoc = {
    uid: 'coSuperUid',
    displayName: 'Co Superadmin',
    email: 'co@example.com',
    role: 'superadmin',
    createdAt: 'T0',
    updatedAt: 'T0',
  };
  const dbWithCoSuper: Record<string, MockUserDoc> = { ...dbUsers, coSuperUid: coSuperDoc };
  const coSuperAuth: MockAuth = {
    uid: 'coSuperUid',
    email: 'co@example.com',
    emailVerified: true,
  };
  // Primary superadmin can revoke co-superadmin access
  assert.equal(
    canUpdateUserRole(
      superAuth,
      'coSuperUid',
      coSuperDoc,
      { ...coSuperDoc, role: 'user', updatedAt: 'SERVER_TIME' },
      dbWithCoSuper
    ),
    true
  );
  // Co-superadmin CANNOT demote primary bootstrap superadmin (jrenghaha2@gmail.com)
  assert.equal(
    canUpdateUserRole(
      coSuperAuth,
      'rasenUid',
      dbUsers.rasenUid,
      { ...dbUsers.rasenUid, role: 'user', updatedAt: 'SERVER_TIME' },
      dbWithCoSuper
    ),
    false
  );
  // Superadmin CANNOT demote self or alter target displayName during role update
  assert.equal(
    canUpdateUserRole(
      superAuth,
      'rasenUid',
      dbUsers.rasenUid,
      { ...dbUsers.rasenUid, role: 'user', updatedAt: 'SERVER_TIME' },
      dbUsers
    ),
    false
  );
  assert.equal(
    canUpdateUserRole(
      superAuth,
      'learnerUid',
      dbUsers.learnerUid,
      { ...dbUsers.learnerUid, role: 'admin', displayName: 'Hacked', updatedAt: 'SERVER_TIME' },
      dbUsers
    ),
    false
  );

  // Spoofed unverified email CANNOT perform role updates
  assert.equal(
    canUpdateUserRole(
      spoofedSuperAuth,
      'learnerUid',
      dbUsers.learnerUid,
      { ...dbUsers.learnerUid, role: 'admin', updatedAt: 'SERVER_TIME' },
      dbUsers
    ),
    false
  );
});

test('Dirty Dozen adversarial payloads on progress & quizHistory return PERMISSION_DENIED', () => {
  const validAuth: MockAuth = { uid: 'userA', email: 'a@example.com', emailVerified: true };
  const baseValid: Record<string, unknown> = {
    uid: 'userA',
    bookId: 'introductory',
    mastered: ['introductory-bab-3-p1', 'introductory-bab-4-p3'],
    hard: ['introductory-bab-5-p1'],
    createdAt: 'SERVER_TIME',
    updatedAt: 'SERVER_TIME',
  };

  assert.equal(canWriteProgress(validAuth, 'userA', 'introductory', true, baseValid), true);
  assert.equal(canWriteProgress(null, 'userA', 'introductory', true, baseValid), false);
  assert.equal(
    canWriteProgress({ uid: 'userA', emailVerified: false }, 'userA', 'introductory', true, baseValid),
    false
  );
  assert.equal(
    canWriteProgress({ uid: 'userB', emailVerified: true }, 'userA', 'introductory', true, baseValid),
    false
  );
  assert.equal(
    canWriteProgress(validAuth, 'userA', 'advanced1', true, { ...baseValid, bookId: 'advanced1' }),
    false
  );
  assert.equal(canWriteProgress(validAuth, 'userA', 'introductory', false, baseValid), false);
  assert.equal(
    canWriteProgress(validAuth, 'userA', 'introductory', true, { ...baseValid, isAdmin: true }),
    false
  );
  assert.equal(
    canWriteProgress(validAuth, 'userA', 'introductory', true, {
      ...baseValid,
      updatedAt: '2026-01-01T00:00:00Z',
    }),
    false
  );
  assert.equal(
    canWriteProgress(validAuth, 'userA', 'introductory', true, {
      ...baseValid,
      mastered: ['introductory-bab-3-p1', '<script>alert(1)</script>'],
    }),
    false
  );
  assert.equal(
    canWriteProgress(validAuth, 'userA', 'introductory', true, {
      ...baseValid,
      mastered: ['elementary1-bab-1-p1'],
    }),
    false
  );
  assert.equal(
    canWriteProgress(validAuth, 'userA', 'introductory', true, {
      ...baseValid,
      mastered: ['introductory-bab-3-p1'],
      hard: ['introductory-bab-3-p1'],
    }),
    false
  );

  const validIntroToken =
    'q1700000000_ab12|2026-11-19T04:00:00.000Z|mixed|8|10|80|3.4.5|1:0:introductory-bab-3-p1:1;2:1:introductory-bab-4-p1:0';
  const validIntro5SegToken =
    'q1700000000_ab13|2026-11-22T04:00:00.000Z|mixed|8|10|80|3.4.5|1:0:introductory-bab-3-p1:1;2:1:introductory-bab-4-p1:0:TjEg44GuIE4y';
  assert.equal(validateSessions([validIntroToken], 'introductory'), true);
  assert.equal(validateSessions([validIntro5SegToken], 'introductory'), true);
  assert.equal(validateSessions([validIntroToken], 'elementary1'), false);
  assert.equal(validateSessions([validIntro5SegToken], 'elementary1'), false);
  // Reject XSS, separator smuggling, padding, spaces, and >260 char overflow in 5th segment
  assert.equal(
    validateSessions(
      ['q1|2026-11-22T04:00:00.000Z|mixed|0|1|0|all|1:1:introductory-bab-3-p1:0:<script>alert(1)</script>'],
      'introductory'
    ),
    false
  );
  assert.equal(
    validateSessions(
      ['q1|2026-11-22T04:00:00.000Z|mixed|0|1|0|all|1:1:introductory-bab-3-p1:0:abc:def'],
      'introductory'
    ),
    false
  );
  assert.equal(
    validateSessions(
      ['q1|2026-11-22T04:00:00.000Z|mixed|0|1|0|all|1:1:introductory-bab-3-p1:0:abc def'],
      'introductory'
    ),
    false
  );
  assert.equal(
    validateSessions(
      [`q1|2026-11-22T04:00:00.000Z|mixed|0|1|0|all|1:1:introductory-bab-3-p1:0:${'A'.repeat(261)}`],
      'introductory'
    ),
    false
  );
  assert.equal(
    validateSessions(
      ['q1|2026-11-19T04:00:00.000Z|mixed|8|10|105|all|1:0:introductory-bab-3-p1:1'],
      'introductory'
    ),
    false
  );
  assert.equal(
    validateSessions(
      Array.from({ length: 16 }, (_, i) => `q${i}|2026-11-19T04:00:00.000Z|mixed|1|1|100|all|`),
      'introductory'
    ),
    false
  );
});
