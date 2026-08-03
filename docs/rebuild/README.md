# KIDLEARN Firebase MVP clean rebuild

## Environment

- Firebase project: `kidlearn-dev-2026`
- Web app: `kidlearn-web-dev`
- Firestore database: `(default)`
- Firestore location: `asia-southeast1`
- Billing plan: Spark
- Roles: `PARENT`, `CHILD`

## Safety state

- Existing V3 files remain untouched.
- Deployed Firestore rules remain deny-all.
- The Phase 5C setup script only supports `DRY_RUN`.
- Real UIDs, PINs, passwords, tokens, and service-account keys are not committed.
- No Firestore or Authentication write is performed by the setup script.

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

Do not deploy rules or run a live seed until emulator tests and role-aware rules are approved.
