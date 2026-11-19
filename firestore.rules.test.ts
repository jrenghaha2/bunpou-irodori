import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const RULES_PATH = path.resolve(process.cwd(), 'firestore.rules');
const rulesText = fs.readFileSync(RULES_PATH, 'utf8');

const INTRO_ITEM_RE = /^introductory-bab-([1-9]|1[0-8])-p[1-9][0-9]?$/;
const ELEM1_ITEM_RE = /^elementary1-bab-([1-9]|1[0-8])-p[1-9][0-9]?$/;
const ELEM2_ITEM_RE = /^elementary2-bab-([1-9]|1[0-8])-p[1-9][0-9]?$/;
const QUIZ_TOKEN_RE =
  /^[a-zA-Z0-9_\-]+\|[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(\.[0-9]{1,3})?Z\|(mixed|cloze|formula|function)\|[0-9]{1,3}\|[1-9][0-9]{0,2}\|(100|[0-9]{1,2})\|(all|([1-9]|1[0-8])(\.([1-9]|1[0-8]))*)\|(|[1-9][0-9]{0,2}:[0-2]:(introductory|elementary1|elementary2)-bab-([1-9]|1[0-8])-p[1-9][0-9]?:[01](;[1-9][0-9]{0,2}:[0-2]:(introductory|elementary1|elementary2)-bab-([1-9]|1[0-8])-p[1-9][0-9]?:[01])*)$/;

interface MockAuth {
  uid: string;
  emailVerified: boolean;
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

function validateSessions(arr: unknown): boolean {
  if (!Array.isArray(arr) || arr.length > 15) return false;
  if (new Set(arr).size !== arr.length) return false;
  if (arr.length === 0) return true;
  if (!arr.every(v => typeof v === 'string')) return false;
  const joinedComma = arr.join(',');
  const joinedTilde = arr.join('~');
  if (joinedComma.length > 120000) return false;
  const src = QUIZ_TOKEN_RE.source.slice(1, -1);
  const commaRe = new RegExp(`^${src}(,${src})*$`);
  const tildeRe = new RegExp(`^${src}(~${src})*$`);
  return (
    arr[0].length >= 24 &&
    arr[0].length <= 8000 &&
    QUIZ_TOKEN_RE.test(arr[0]) &&
    commaRe.test(joinedComma) &&
    tildeRe.test(joinedTilde)
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

test('firestore.rules structural security invariants (Eight Pillars)', () => {
  assert.match(rulesText, /rules_version = '2';/);
  assert.match(rulesText, /match \/\{document=\*\*\} \{\s*allow read, write: if false;\s*\}/);
  assert.match(rulesText, /request\.auth\.token\.email_verified == true/);
  assert.match(rulesText, /allow list: if false;/);
  assert.match(rulesText, /exists\(\/databases\/\$\(database\)\/documents\/users\/\$\(userId\)\)/);
  assert.match(rulesText, /incoming\(\)\.createdAt == request\.time/);
  assert.match(rulesText, /incoming\(\)\.updatedAt == request\.time/);
  assert.match(rulesText, /incoming\(\)\.diff\(existing\(\)\)\.affectedKeys\(\)\.hasOnly/);
  assert.match(rulesText, /match \/bunpouProgress\/\{bookId\}/);
  assert.match(rulesText, /match \/quizHistory\/\{bookId\}/);
});

test('Dirty Dozen adversarial payloads return PERMISSION_DENIED', () => {
  const validAuth: MockAuth = { uid: 'userA', emailVerified: true };
  const baseValid: Record<string, unknown> = {
    uid: 'userA',
    bookId: 'introductory',
    mastered: ['introductory-bab-1-p1', 'introductory-bab-2-p3'],
    hard: ['introductory-bab-3-p1'],
    createdAt: 'SERVER_TIME',
    updatedAt: 'SERVER_TIME',
  };

  assert.equal(canWriteProgress(validAuth, 'userA', 'introductory', true, baseValid), true);

  // 1. Unauthenticated access
  assert.equal(canWriteProgress(null, 'userA', 'introductory', true, baseValid), false);

  // 2. Unverified email write
  assert.equal(
    canWriteProgress({ uid: 'userA', emailVerified: false }, 'userA', 'introductory', true, baseValid),
    false
  );

  // 3. Cross-user access
  assert.equal(
    canWriteProgress({ uid: 'userB', emailVerified: true }, 'userA', 'introductory', true, baseValid),
    false
  );

  // 4. Identity & BookId spoofing
  assert.equal(
    canWriteProgress(validAuth, 'userA', 'advanced1', true, { ...baseValid, bookId: 'advanced1' }),
    false
  );
  assert.equal(
    canWriteProgress(validAuth, 'userA', 'introductory', true, { ...baseValid, bookId: 'elementary1' }),
    false
  );

  // 5. Master Gate bypass (parent /users/userA missing)
  assert.equal(canWriteProgress(validAuth, 'userA', 'introductory', false, baseValid), false);

  // 6. Shadow / Ghost field injection
  assert.equal(
    canWriteProgress(validAuth, 'userA', 'introductory', true, { ...baseValid, isAdmin: true }),
    false
  );

  // 7. Forged client timestamp
  assert.equal(
    canWriteProgress(validAuth, 'userA', 'introductory', true, {
      ...baseValid,
      updatedAt: '2026-01-01T00:00:00Z',
    }),
    false
  );

  // 8. Full-array XSS & separator smuggling at index > 0
  assert.equal(
    canWriteProgress(validAuth, 'userA', 'introductory', true, {
      ...baseValid,
      mastered: ['introductory-bab-1-p1', '<script>alert(1)</script>'],
    }),
    false
  );
  assert.equal(
    canWriteProgress(validAuth, 'userA', 'introductory', true, {
      ...baseValid,
      mastered: ['introductory-bab-1-p1', 'introductory-bab-1-p2,introductory-bab-1-p3'],
    }),
    false
  );
  assert.equal(
    canWriteProgress(validAuth, 'userA', 'introductory', true, {
      ...baseValid,
      mastered: ['introductory-bab-1-p1', 'introductory-bab-1-p2|introductory-bab-1-p3'],
    }),
    false
  );

  // 9. Cross-book prefix spoofing & out-of-range chapter
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
      mastered: ['introductory-bab-19-p1'],
    }),
    false
  );

  // 10. Duplicates & mastered/hard overlap
  assert.equal(
    canWriteProgress(validAuth, 'userA', 'introductory', true, {
      ...baseValid,
      mastered: ['introductory-bab-1-p1', 'introductory-bab-1-p1'],
    }),
    false
  );
  assert.equal(
    canWriteProgress(validAuth, 'userA', 'introductory', true, {
      ...baseValid,
      mastered: ['introductory-bab-1-p1'],
      hard: ['introductory-bab-1-p1'],
    }),
    false
  );

  // 11. Quiz history token validation & separator smuggling
  const validToken =
    'q1700000000_ab12|2026-11-19T04:00:00.000Z|mixed|8|10|80|1.2.3|1:0:introductory-bab-1-p1:1;2:1:introductory-bab-2-p1:0';
  assert.equal(validateSessions([validToken]), true);
  assert.equal(validateSessions([validToken, `${validToken},${validToken}`]), false);
  assert.equal(validateSessions([validToken, `${validToken}~${validToken}`]), false);
  assert.equal(
    validateSessions([
      'q1|2026-11-19T04:00:00.000Z|mixed|8|10|105|all|1:0:introductory-bab-1-p1:1',
    ]),
    false
  );
  assert.equal(
    validateSessions(Array.from({ length: 16 }, (_, i) => `q${i}|2026-11-19T04:00:00.000Z|mixed|1|1|100|all|`)),
    false
  );

  // 12. Unsafe avatar URLs
  const avatarHttpsRe = /^https:\/\/[^\s]+$/;
  const avatarDataRe = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/;
  assert.equal(avatarHttpsRe.test('javascript:alert(1)'), false);
  assert.equal(avatarDataRe.test('data:image/svg+xml;base64,PHN2Zz4='), false);
  assert.equal(avatarDataRe.test('data:image/jpeg;base64,/9j/4AAQSkZJRg=='), true);
});
