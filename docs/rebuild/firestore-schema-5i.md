# Phase 5I lesson catalog schema

Phase 5I-B adds a read-only lesson catalog and one approved sample lesson. No production or DEV write is performed by this checkpoint.

## Paths

| Path | Purpose | Required fields |
| --- | --- | --- |
| `courses/{courseId}` | Groups lessons by subject and grade | `courseId`, `subjectId`, `courseCode`, `courseName`, `gradeLevel`, `sortOrder`, `status` |
| `lessons/{lessonId}` | Lesson catalog record | `lessonId`, `courseId`, `subjectId`, `lessonCode`, `title`, `summary`, `gradeLevel`, `estimatedMinutes`, `sortOrder`, `status` |
| `lessons/{lessonId}/blocks/{blockId}` | Ordered lesson-player content | `blockId`, `blockType`, `sortOrder` plus type-specific content |

## Status and visibility

- Active CHILD and PARENT accounts can read `courses` whose status is `ACTIVE`.
- CHILD accounts can read only lessons whose status is `PUBLISHED` and blocks belonging to those lessons.
- PARENT accounts can read both draft and published lessons and their blocks for review.
- All client writes to courses, lessons and lesson blocks remain denied.

## Sample content

- Course: `COURSE_VI_G2` — Tiếng Việt lớp 2
- Lesson: `LESSON_VI_G2_001` — Bảng chữ cái và nguyên âm
- Player blocks: objective, explanation, example and display-only multiple choice

The multiple-choice answer is included for schema validation only. Phase 5I does not submit answers or save progress.
