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
- Real UIDs, PINs, passwords, tokens, and service-account keys are not committed.
- No application write flow is enabled yet.
- The Phase 5G hosted smoke page and Phase 5H application shell remain read-only.
- Phase 5I-C permits a controlled seed only after three guards pass: mode, project ID, and explicit write confirmation.
- The controlled seed uses merge writes, never deletes documents, and never changes Firebase Authentication.

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

## Phase 5I-C dry-run verification

```bash
npm install
npm run setup:dry-run
```

Expected safeguards:

- `phase` is `5I-C`
- `mode` is `DRY_RUN`
- `projectId` is `kidlearn-dev-2026`
- `plannedDocumentCount` is `12`
- `actualFirestoreWritePerformed` is `false`
- `actualAuthenticationWritePerformed` is `false`

## Phase 5F security checkpoint

- Firestore rules version: `2`
- Emulator rules tests include role-aware lesson-catalog coverage.
- Unknown document paths remain denied by the final catch-all rule.
- Roles are limited to `CHILD` and `PARENT`.
- Parent-to-child access uses an ACTIVE `userChildAccess` document.
- CHILD access is bound to the authenticated UID in `children/{childId}.childUserId`.

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

## Phase 5H application-shell checkpoint

- The Phase 5G smoke test is preserved at `/smoke.html`.
- Authentication, Firebase initialization, and profile reads are separated into services.
- Session persistence is limited to the current browser session.
- Every authenticated UID must resolve to an ACTIVE `users/{uid}` profile.
- Only `CHILD` and `PARENT` roles can enter the application shell.
- CHILD and PARENT receive separate read-only shell content.
- The four ACTIVE subjects are rendered from Firestore.
- No application module imports or calls Firestore write functions.

## Phase 5I lesson-catalog checkpoint

- Firestore-only navigation grouping: `courses/{courseId}`.
- Sample course: Tiếng Việt lớp 2.
- PUBLISHED sample lesson: “Bảng chữ cái và nguyên âm” (10 minutes).
- Four ordered blocks under `lessons/{lessonId}/blocks/{blockId}`.
- CHILD and PARENT can read only ACTIVE courses.
- CHILD can read only PUBLISHED lessons and their blocks.
- PARENT can also read draft lessons and their blocks.
- Catalog writes remain denied for both application roles.
- The `courses` collection does not add a fifteenth legacy Google Sheet to the locked 14-sheet MVP mapping.

Detailed schema: [firestore-schema-5i.md](./firestore-schema-5i.md)

## Phase 5I-C controlled DEV seed

Authorized scope: exactly 12 seed document paths in Firebase DEV `kidlearn-dev-2026`.

Run only from an authenticated Google Cloud Shell session after the branch workflow succeeds:

```bash
export KIDLEARN_CONFIRM_PROJECT="kidlearn-dev-2026"
export KIDLEARN_CONFIRM_WRITE="WRITE_12_DEV_DOCUMENTS"
npm run seed:dev
unset KIDLEARN_CONFIRM_PROJECT KIDLEARN_CONFIRM_WRITE
```

Expected result:

- `mode: APPLY`
- `verifiedDocumentCount: 12`
- `actualFirestoreWritePerformed: true`
- `actualAuthenticationWritePerformed: false`
- Existing seed paths are merged; missing seed paths are created.
- No document is deleted.

## Phase 5I-C post-seed verification

- Firebase DEV contains the expected course, lesson, and four lesson-block documents.
- The controlled apply reported 12 verified paths: 6 created and 6 merged.
- Authentication remained unchanged.
- Cloud Shell write-confirmation variables were unset after the operation.

## Phase 5I-D read-only lesson player

- CHILD subject cards open ACTIVE courses for that subject.
- Course selection opens PUBLISHED lessons.
- Lesson selection reads ordered blocks from the lesson subcollection.
- OBJECTIVE, TEXT, EXAMPLE, and MULTIPLE_CHOICE blocks have distinct rendering.
- The sample multiple-choice block remains display-only: no answer, score, or progress is written.
- PARENT remains on the read-only management shell.
- No application module imports or invokes Firestore write functions.

## Next checkpoint: Phase 5I-E

Validate Phase 5I-D in GitHub Actions, deploy a Firebase Hosting preview channel, and test CHILD navigation from Tiếng Việt to the complete sample lesson.