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
- The Phase 5C setup script only supports `DRY_RUN`.
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

## Phase 5C local verification

```bash
npm install
npm run setup:dry-run
```

Expected safeguards:

- `mode` is `DRY_RUN`
- `projectId` is `kidlearn-dev-2026`
- `plannedDocumentCount` is `6`
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

## Next checkpoint: Phase 5H

Build the real MVP application shell while preserving the Phase 5G smoke test:

1. Extract authentication into a dedicated service.
2. Restore an existing session safely.
3. Resolve the authenticated profile from `users/{uid}`.
4. Route only to `CHILD` or `PARENT` application shells.
5. Keep every Firestore write path disabled until a separate write-flow test is approved.
