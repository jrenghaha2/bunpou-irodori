# Security Specification — Irodori Bunpou Cloud Sync & Superadmin/Admin Monitoring

## 1. Role-Based Access Control (RBAC) Hierarchy
1. **Bootstrap Superadmin**: Verified Google account `jrenghaha2@gmail.com` (`request.auth.token.email_verified == true && request.auth.token.email.lower() == 'jrenghaha2@gmail.com'`). Always holds `superadmin` privileges even before `/users/{uid}` is updated, and cannot be demoted.
2. **Superadmin (`role == 'superadmin'`)**:
   - Can monitor all users in real time (`get`/`list` `/users`, `/liveActivity`, `/activityEvents`, and `get` any learner's `/users/{uid}/bunpouProgress/{bookId}` and `/users/{uid}/quizHistory/{bookId}`).
   - **Exclusive Role Authority**: Can assign or revoke `'user'`, `'admin'`, or `'superadmin'` on other users via an action-scoped update affecting ONLY `['role', 'updatedAt']`.
   - Cannot modify own role (`userId != request.auth.uid`) and cannot demote the primary bootstrap Superadmin (`jrenghaha2@gmail.com`).
3. **Admin (`role == 'admin'`)**:
   - Read-only real-time monitoring access (`get`/`list` `/users`, `/liveActivity`, `/activityEvents`, and `get` any learner's progress/quizHistory subcollections).
   - **Zero Role Mutation Authority**: Denied from modifying `role` on any user document (including self and others).
4. **Regular User (`role == 'user'` or omitted on legacy docs)**:
   - Strict self-only access to own `/users/{uid}`, `/users/{uid}/bunpouProgress/{bookId}`, `/users/{uid}/quizHistory/{bookId}`, and own `/liveActivity/{uid}`, plus append-only create of own `/activityEvents/{eventId}`.
   - Denied from listing `/users`, `/liveActivity`, or `/activityEvents`, denied from reading any other user's documents, and denied from setting or changing `role` to `'admin'` or `'superadmin'`.

## 2. Data Invariants

### A. `/users/{userId}` (`UserProfile`)
1. **PII Isolation & Ownership**: `get` is strictly limited to `isOwner(userId) || isAdminOrSuperAdmin()`. `list` is strictly limited to `isAdminOrSuperAdmin()` with `request.query.limit <= 100`.
2. **Verified Identity**: All mutations (`create`, `update`) require `request.auth != null && request.auth.token.email_verified == true`.
3. **Closed Schema & Anti-Self-Escalation**: Allowed keys: `['uid', 'displayName', 'avatarUrl', 'email', 'role', 'createdAt', 'updatedAt']`.
   - On `create`: non-bootstrap users may only omit `role` or set `role == 'user'`. Only `isBootstrapSuperAdmin()` may create with `role == 'superadmin'`.
   - On `update` (Action-Based):
     - **Action 1 (Owner Profile Update)**: `isOwner(userId)` may only mutate `['displayName', 'avatarUrl', 'email', 'updatedAt']` (never `role`). If `email` is non-empty, it must match `request.auth.token.email.lower()`.
     - **Action 2 (Bootstrap Superadmin Self-Heal)**: `isOwner(userId) && isBootstrapSuperAdmin()` may additionally set `role == 'superadmin'` on their legacy profile doc.
     - **Action 3 (Superadmin Role Management)**: `isSuperAdmin() && userId != request.auth.uid` may ONLY mutate `['role', 'updatedAt']` on any non-bootstrap user, setting `role in ['user', 'admin', 'superadmin']`.
4. **Immutable Identity & Server Timestamps**: `uid` and `createdAt` can never change; `createdAt` (on create) and `updatedAt` (on create/update) must equal `request.time`.
5. **No Client Delete**: `allow delete: if false;` prevents orphaned subcollections.

### B. `/users/{userId}/bunpouProgress/{bookId}` & `/users/{userId}/quizHistory/{bookId}`
1. **Master Gate**: All operations require `/users/{userId}` to exist (`exists(...)`), evaluated after all cheap static checks.
2. **Read Access**: `get` permitted for `isOwner(userId) || isAdminOrSuperAdmin()`; `list` remains `false`.
3. **Write Access**: Strictly `isVerifiedUser() && isOwner(userId)` — even Admins and Superadmins cannot tamper with another learner's study progress or quiz history!
4. **Strict Validation**: Per-book pattern ID regexes, disjointness, uniqueness, and element-wise quiz session token validation preserved intact.

### C. `/liveActivity/{userId}` (`LiveActivity`)
1. **Master Gate**: Create and update require `/users/{userId}` to exist.
2. **Read Access**: `get` limited to `isOwner(userId) || isAdminOrSuperAdmin()`; `list` strictly limited to `isAdminOrSuperAdmin() && request.query.limit <= 100`.
3. **Write Access**: Strictly `isVerifiedUser() && isOwner(userId)` with full schema/type/range/enum validation, `email` token binding, and server timestamps (`request.time`).
4. **No Client Delete**: `allow delete: if false;`.

### D. `/activityEvents/{eventId}` (`ActivityEvent`)
1. **Master Gate**: Create requires `/users/$(request.auth.uid)` to exist.
2. **Read Access**: `get` and `list` (with `request.query.limit <= 100`) strictly limited to `isAdminOrSuperAdmin()`.
3. **Immutable Append-Only Log**: `create` strictly limited to verified owner (`incoming().uid == request.auth.uid`) with full schema/type/range/enum validation and `createdAt == request.time`. `update` and `delete` are permanently `false`.

## 3. The "Dirty Dozen" + RBAC Adversarial Payloads (`firestore.rules.test.ts`)
1. **Unauthenticated Access**: `auth = null` attempting read/write on `/users`, `/liveActivity`, `/activityEvents`, or subcollections -> `PERMISSION_DENIED`.
2. **Unverified Email & Email Spoofing**: `email: 'jrenghaha2@gmail.com'` with `email_verified: false` attempting Superadmin read or role update -> `PERMISSION_DENIED`.
3. **Cross-User PII & Progress Snooping**: Regular `userB` attempting `get`/`list` on `/users`, `/liveActivity`, `/activityEvents`, or `userA`'s progress/quizHistory -> `PERMISSION_DENIED`.
4. **Self-Role Escalation on Create & Update**: Regular user creating profile with `role: 'admin'` or `'superadmin'`, or updating own `role` -> `PERMISSION_DENIED`.
5. **Admin Privilege Escalation (Role Mutation Denied)**: `admin` attempting to promote `userB` to `'admin'` or demote another `'admin'` -> `PERMISSION_DENIED`.
6. **Superadmin Self-Demotion & Superadmin Escalation Guard**: `superadmin` attempting to change own role, demote `jrenghaha2@gmail.com`, promote another user to `'superadmin'`, or alter target's `displayName` during role update -> `PERMISSION_DENIED`.
7. **Master Gate Bypass**: Writing to `bunpouProgress`, `quizHistory`, `liveActivity`, or `activityEvents` when `/users/{uid}` does not exist -> `PERMISSION_DENIED`.
8. **Shadow / Ghost Field Injection**: Adding `isAdmin: true` or extra fields on any collection -> `PERMISSION_DENIED`.
9. **Immortal Field Tampering & Forged Timestamps**: Modifying `uid`, `bookId`, `createdAt`, or sending client timestamp instead of `request.time` -> `PERMISSION_DENIED`.
10. **Full-Array XSS & Separator Smuggling (Index > 0)**: Injecting XSS or `,`/`|`/`~` separator payloads into `mastered`, `hard`, or `sessions` -> `PERMISSION_DENIED`.
11. **Cross-Book Prefix Spoofing & Out-of-Range Telemetry**: Writing `elementary1` IDs inside `introductory`, `score > 100`, `masteredTotal > 300`, or invalid `activityType` / `eventType` -> `PERMISSION_DENIED`.
12. **Activity Event Tampering & Unbounded List Scrape**: Attempting `update`/`delete` on `/activityEvents/{id}`, or `list` with `limit > 100` -> `PERMISSION_DENIED`.
