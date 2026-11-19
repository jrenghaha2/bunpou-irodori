# Security Specification — Irodori Bunpou Cloud Sync

## 1. Data Invariants

### A. `/users/{userId}` (`UserProfile`)
1. **Strict Ownership**: Every document in `/users/{userId}` belongs strictly to the authenticated user where `request.auth.uid == userId` and `data.uid == request.auth.uid`. Cross-user `get`, `list`, `create`, `update`, and `delete` are denied.
2. **Verified Identity**: All mutations (`create`, `update`, `delete`) require `request.auth != null && request.auth.token.email_verified == true`.
3. **Closed Schema & Action-Based Updates**: Only `uid`, `createdAt`, `updatedAt`, and optional `displayName` (`<= 60` chars) / `avatarUrl` (`<= 20,000` chars, strictly `""`, `https://...`, or `data:image/(jpeg|png|webp);base64,...`) are permitted. Shadow fields (`role`, `isAdmin`, `email`, etc.) are rejected.
4. **Immutable Identity & Server Timestamps**: `uid` and `createdAt` can never change after creation; `createdAt` (on create) and `updatedAt` (on create/update) must equal `request.time`.
5. **Zero Listing**: `allow list: if false;` prevents user enumeration.

### B. `/users/{userId}/bunpouProgress/{bookId}` (`BunpouBookProgress`)
1. **Master Gate**: All operations (`get`, `create`, `update`, `delete`) require the parent `/users/{userId}` document to exist (`exists(/databases/$(database)/documents/users/$(userId))`), evaluated after all cheap static checks.
2. **Strict Book Allowlist**: `bookId` path variable and `data.bookId` field must match and be strictly in `['introductory', 'elementary1', 'elementary2']`.
3. **Closed Schema & Immutability**: Only `uid`, `bookId`, `mastered`, `hard`, `createdAt`, and `updatedAt` are permitted. Updates may only mutate `['mastered', 'hard', 'updatedAt']`; `uid`, `bookId`, and `createdAt` are immutable.
4. **Per-Book Full-Array Validation**: Every element of `mastered` and `hard` is validated via uniqueness (`toSet()`), mutual exclusivity (`intersection().size() == 0`), size limit (`<= 80`), and dual-separator join (`','` and `'|'`) against exact per-book pattern ID regexes:
   - `introductory`: `^introductory-bab-([1-9]|1[0-8])-p[1-9][0-9]?$` (`join(',').size() <= 2000`)
   - `elementary1`: `^elementary1-bab-([1-9]|1[0-8])-p[1-9][0-9]?$` (`join(',').size() <= 2000`)
   - `elementary2`: `^elementary2-bab-([1-9]|1[0-8])-p[1-9][0-9]?$` (`join(',').size() <= 2000`)
5. **Zero Listing**: `allow list: if false;` — client reads only the 3 known book IDs directly.

### C. `/users/{userId}/quizHistory/{bookId}` (`BunpouQuizHistory`)
1. **Master Gate**: All operations (`get`, `create`, `update`, `delete`) require `/users/{userId}` to exist (`exists(...)`), evaluated after all cheap static checks.
2. **Strict Book Allowlist**: `bookId` path variable and `data.bookId` must match and be in `['introductory', 'elementary1', 'elementary2']`.
3. **Closed Schema & Immutability**: Only `uid`, `bookId`, `sessions`, `createdAt`, and `updatedAt` are permitted. Updates may only mutate `['sessions', 'updatedAt']`.
4. **Compact Pure-ASCII Full-Array Token Validation**: `sessions` must be a unique list of `<= 15` compact ASCII tokens (`join(',').size() <= 120000`), validated via dual-separator join (`','` and `'~'`) against strict token grammar:
   `id|completedAt|focus|correct|total|score|scopeCode|answersPacked`
   Zero free-form user text, HTML, or JSON strings are stored; full pattern titles, formulas, and explanations are hydrated client-side from the static Irodori Bunpou dataset.
5. **Zero Listing**: `allow list: if false;`.

## 2. The "Dirty Dozen" Adversarial Payloads (`firestore.rules.test.ts`)
1. **Unauthenticated Access**: `auth = null` attempting read/write on `/users/userA` or subcollections -> `PERMISSION_DENIED`.
2. **Unverified Email Write**: `email_verified = false` attempting create/update -> `PERMISSION_DENIED`.
3. **Cross-User Access**: `userB` attempting get/create/update/delete on `userA` documents -> `PERMISSION_DENIED`.
4. **Collection Scraping (`list`)**: Listing `/users`, `/users/{uid}/bunpouProgress`, or `/users/{uid}/quizHistory` -> `PERMISSION_DENIED`.
5. **Identity & BookId Spoofing**: Mismatched `uid`, mismatched `bookId`, or unknown `bookId` (`advanced1`) -> `PERMISSION_DENIED`.
6. **Master Gate Bypass**: Accessing `bunpouProgress` or `quizHistory` when `/users/{uid}` does not exist -> `PERMISSION_DENIED`.
7. **Shadow / Ghost Field Injection**: Adding `role: 'admin'` or `isAdmin: true` -> `PERMISSION_DENIED`.
8. **Immortal Field Tampering & Forged Timestamps**: Modifying `uid`, `bookId`, `createdAt`, or sending client timestamp instead of `request.time` -> `PERMISSION_DENIED`.
9. **Full-Array XSS & Separator Smuggling (Index > 0)**: Injecting `['introductory-bab-1-p1', '<script>alert(1)</script>']` or `['introductory-bab-1-p1', 'introductory-bab-1-p2,introductory-bab-1-p3']` or `~` / `,` smuggling inside `sessions` at index > 0 -> `PERMISSION_DENIED`.
10. **Cross-Book Prefix Spoofing & Out-of-Range Values**: Writing `elementary1-bab-1-p1` inside `introductory`, `bab-19`, `score > 100`, or `> 15` sessions -> `PERMISSION_DENIED`.
11. **Duplicates & Mastered/Hard Overlap**: Duplicate IDs or identical IDs in both `mastered` and `hard` -> `PERMISSION_DENIED`.
12. **Unsafe Profile Inputs**: `javascript:alert(1)`, `data:image/svg+xml`, or `displayName > 60` chars -> `PERMISSION_DENIED`.
