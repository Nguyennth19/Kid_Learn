# KIDLEARN Firebase MVP clean rebuild

## Environment

- Firebase project: `kidlearn-dev-2026`
- Web app: `kidlearn-web-dev`
- Firestore database: `(default)`
- Firestore location: `asia-southeast1`
- Billing plan: Spark
- Roles: `PARENT`, `CHILD`
- Login method: family account code + PIN backed by Firebase Email/Password
- Active rebuild branch: `rebuild/firebase-mvp`

## Safety state

- Existing Google Apps Script V3 files remain preserved for reference.
- Role-aware Firestore rules are deployed to the DEV project.
- Unauthenticated access is denied.
- The Phase 5I-B setup script only supports `DRY_RUN`.
- Real UIDs, PINs, passwords, tokens, and service-account keys are not committed.
- No application write flow is enabled yet.
- The Phase 5G hosted smoke page is read-only.

## MVP data mapping

| V3 sheet | Firestore target |
| --- | --- |
| SYS_Config | system/config |
| SYS_SchemaVersion | system/schema |
| LOG_Audit | auditLogs/{logId} |
| LOG_Errors | errorLogs/{errorId} |
| DATA_Users | users/{uid} |
| DATA_Children | children/{childId} |
| DATA_UserChildAccess | userChildAccess/{accessId} |
| DATA_Sessions | sessions/{sessionId} |
| MST_Subjects | subjects/{subjectId} |
| MST_Lessons | lessons/{lessonId} |
| MST_LessonBlocks | lessons/{lessonId}/blocks/{blockId} |
| DATA_Assignments | assignments/{assignmentId} |
| DATA_LessonProgress | lessonProgress/{progressId} |
| DATA_StudySessions | studySessions/{studySessionId} |

## Phase 5I-B local verification

```bash
npm install
npm run setup:dry-run
```

Expected safeguards:

- `mode` is `DRY_RUN`
- `projectId` is `kidlearn-dev-2026`
- `plannedDocumentCount` is `12`
- `actualFirestoreWritePerformed` is `false`
- `actualAuthenticationWritePerformed` is `false`

## Phase 5F security checkpoint

- Firestore rules version: `2`
- Emulator rules tests: `13/13` passed
- Unknown document paths remain denied by the final catch-all rule
- Roles are limited to `CHILD` and `PARENT`
- Parent-to-child access uses an ACTIVE `userChildAccess` document
- CHILD access is bound to the authenticated UID in `children/{childId}.childUserId`

## Phase 5G hosted read-only smoke checkpoint

Verified on the Firebase Hosting preview channel on 2026-08-04.

| Scenario | Result |
| --- | --- |
| Unauthenticated Firestore access denied | PASS |
| CHILD authentication and user profile | PASS |
| CHILD reads own linked child profile | PASS |
| CHILD smoke total | `5/5` |
| PARENT authentication and user profile | PASS |
| PARENT reads ACTIVE MANAGE link | PASS |
| PARENT reads linked child profile | PASS |
| PARENT smoke total | `6/6` |
| Firestore application writes | OFF |

The temporary preview channel is verification-only and must not be treated as the production app.

## Phase 5H application-shell checkpoint

- The Phase 5G smoke test is preserved at `/smoke.html`.
- Authentication, Firebase initialization, and profile reads are separated into services.
- Session persistence is limited to the current browser session.
- Every authenticated UID must resolve to an ACTIVE `users/{uid}` profile.
- Only `CHILD` and `PARENT` roles can enter the application shell.
- CHILD and PARENT receive separate read-only shell content.
- The four ACTIVE subjects are rendered from Firestore.
- No application module imports or calls Firestore write functions.

## Phase 5I-B lesson-catalog checkpoint

- Added the Firestore-only catalog grouping `courses/{courseId}`.
- Added one sample course: Tiếng Việt lớp 2.
- Added one PUBLISHED sample lesson: “Bảng chữ cái và nguyên âm” (10 minutes).
- Added four ordered blocks under `lessons/{lessonId}/blocks/{blockId}`.
- CHILD and PARENT can read only ACTIVE courses.
- CHILD can read only PUBLISHED lessons and their blocks.
- PARENT can also read draft lessons and their blocks.
- Catalog writes remain denied for both roles.
- The `courses` collection is a Firestore navigation grouping derived from subject and grade metadata. It does not add a fifteenth legacy Google Sheet to the locked 14-sheet MVP mapping.

Detailed schema: [firestore-schema-5i.md](./firestore-schema-5i.md)

## Next checkpoint: Phase 5I-C

Review the final dry-run result and approve or reject a controlled seed deployment to Firebase DEV. No real seed deployment is part of Phase 5I-B.
