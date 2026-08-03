import { readFile } from 'node:fs/promises';
import { after, before, beforeEach, test } from 'node:test';

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment
} from '@firebase/rules-unit-testing';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc
} from 'firebase/firestore';

const PROJECT_ID = 'kidlearn-rules-test';
const PARENT_UID = 'PARENT_TEST';
const CHILD_UID = 'CHILD_TEST';
const OTHER_CHILD_UID = 'OTHER_CHILD_TEST';
const CHILD_ID = 'CHILD_001';
const OTHER_CHILD_ID = 'CHILD_002';

let testEnv;

async function seedFixture() {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();

    await Promise.all([
      setDoc(doc(db, 'users', PARENT_UID), {
        role: 'PARENT',
        status: 'ACTIVE'
      }),
      setDoc(doc(db, 'users', CHILD_UID), {
        role: 'CHILD',
        status: 'ACTIVE'
      }),
      setDoc(doc(db, 'users', OTHER_CHILD_UID), {
        role: 'CHILD',
        status: 'ACTIVE'
      }),
      setDoc(doc(db, 'children', CHILD_ID), {
        childUserId: CHILD_UID,
        displayName: 'Test Child'
      }),
      setDoc(doc(db, 'children', OTHER_CHILD_ID), {
        childUserId: OTHER_CHILD_UID,
        displayName: 'Other Child'
      }),
      setDoc(doc(db, 'userChildAccess', `${PARENT_UID}_${CHILD_ID}`), {
        userId: PARENT_UID,
        childId: CHILD_ID,
        accessType: 'MANAGE',
        status: 'ACTIVE'
      }),
      setDoc(doc(db, 'subjects', 'SUB_MATH'), {
        name: 'Toán',
        status: 'ACTIVE'
      }),
      setDoc(doc(db, 'lessons', 'LESSON_PUBLISHED'), {
        subjectId: 'SUB_MATH',
        title: 'Published lesson',
        status: 'PUBLISHED'
      }),
      setDoc(doc(db, 'lessons', 'LESSON_DRAFT'), {
        subjectId: 'SUB_MATH',
        title: 'Draft lesson',
        status: 'DRAFT'
      }),
      setDoc(doc(db, 'lessons', 'LESSON_PUBLISHED', 'blocks', 'BLOCK_001'), {
        order: 1,
        type: 'TEXT'
      }),
      setDoc(doc(db, 'lessons', 'LESSON_DRAFT', 'blocks', 'BLOCK_002'), {
        order: 1,
        type: 'TEXT'
      })
    ]);
  });
}

before(async () => {
  const rules = await readFile('firestore.rules', 'utf8');
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules }
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
  await seedFixture();
});

after(async () => {
  await testEnv.cleanup();
});

test('unauthenticated request cannot read subjects', async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, 'subjects', 'SUB_MATH')));
});

test('child can read an active subject', async () => {
  const db = testEnv.authenticatedContext(CHILD_UID).firestore();
  await assertSucceeds(getDoc(doc(db, 'subjects', 'SUB_MATH')));
});

test('child can read published lesson and its blocks', async () => {
  const db = testEnv.authenticatedContext(CHILD_UID).firestore();
  await assertSucceeds(getDoc(doc(db, 'lessons', 'LESSON_PUBLISHED')));
  await assertSucceeds(
    getDoc(doc(db, 'lessons', 'LESSON_PUBLISHED', 'blocks', 'BLOCK_001'))
  );
});

test('child cannot read draft lesson or its blocks', async () => {
  const db = testEnv.authenticatedContext(CHILD_UID).firestore();
  await assertFails(getDoc(doc(db, 'lessons', 'LESSON_DRAFT')));
  await assertFails(
    getDoc(doc(db, 'lessons', 'LESSON_DRAFT', 'blocks', 'BLOCK_002'))
  );
});

test('parent can read a draft lesson', async () => {
  const db = testEnv.authenticatedContext(PARENT_UID).firestore();
  await assertSucceeds(getDoc(doc(db, 'lessons', 'LESSON_DRAFT')));
});

test('child can read own profile but not another child profile', async () => {
  const db = testEnv.authenticatedContext(CHILD_UID).firestore();
  await assertSucceeds(getDoc(doc(db, 'children', CHILD_ID)));
  await assertFails(getDoc(doc(db, 'children', OTHER_CHILD_ID)));
});

test('parent can read linked child but not an unlinked child', async () => {
  const db = testEnv.authenticatedContext(PARENT_UID).firestore();
  await assertSucceeds(getDoc(doc(db, 'children', CHILD_ID)));
  await assertFails(getDoc(doc(db, 'children', OTHER_CHILD_ID)));
});

test('parent can create assignment only for linked child', async () => {
  const db = testEnv.authenticatedContext(PARENT_UID).firestore();

  await assertSucceeds(
    setDoc(doc(db, 'assignments', 'ASSIGNMENT_001'), {
      childId: CHILD_ID,
      lessonId: 'LESSON_PUBLISHED',
      status: 'ASSIGNED'
    })
  );

  await assertFails(
    setDoc(doc(db, 'assignments', 'ASSIGNMENT_002'), {
      childId: OTHER_CHILD_ID,
      lessonId: 'LESSON_PUBLISHED',
      status: 'ASSIGNED'
    })
  );
});

test('child cannot create an assignment', async () => {
  const db = testEnv.authenticatedContext(CHILD_UID).firestore();
  await assertFails(
    setDoc(doc(db, 'assignments', 'ASSIGNMENT_003'), {
      childId: CHILD_ID,
      lessonId: 'LESSON_PUBLISHED',
      status: 'ASSIGNED'
    })
  );
});

test('child can write own lesson progress but cannot spoof childId', async () => {
  const db = testEnv.authenticatedContext(CHILD_UID).firestore();

  await assertSucceeds(
    setDoc(doc(db, 'lessonProgress', 'PROGRESS_001'), {
      childId: CHILD_ID,
      lessonId: 'LESSON_PUBLISHED',
      status: 'IN_PROGRESS',
      percent: 25
    })
  );

  await assertFails(
    setDoc(doc(db, 'lessonProgress', 'PROGRESS_002'), {
      childId: OTHER_CHILD_ID,
      lessonId: 'LESSON_PUBLISHED',
      status: 'IN_PROGRESS',
      percent: 25
    })
  );
});

test('child cannot change childId or lessonId on progress update', async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), 'lessonProgress', 'PROGRESS_003'), {
      childId: CHILD_ID,
      lessonId: 'LESSON_PUBLISHED',
      status: 'IN_PROGRESS',
      percent: 25
    });
  });

  const db = testEnv.authenticatedContext(CHILD_UID).firestore();
  await assertFails(
    updateDoc(doc(db, 'lessonProgress', 'PROGRESS_003'), {
      childId: OTHER_CHILD_ID
    })
  );
  await assertFails(
    updateDoc(doc(db, 'lessonProgress', 'PROGRESS_003'), {
      lessonId: 'LESSON_DRAFT'
    })
  );
  await assertSucceeds(
    updateDoc(doc(db, 'lessonProgress', 'PROGRESS_003'), {
      percent: 50
    })
  );
});

test('child can create own study session', async () => {
  const db = testEnv.authenticatedContext(CHILD_UID).firestore();
  await assertSucceeds(
    setDoc(doc(db, 'studySessions', 'STUDY_001'), {
      childId: CHILD_ID,
      startedAt: '2026-08-03T09:00:00+07:00',
      status: 'ACTIVE'
    })
  );
});

test('user can create own app session but cannot spoof userId', async () => {
  const db = testEnv.authenticatedContext(CHILD_UID).firestore();

  await assertSucceeds(
    setDoc(doc(db, 'sessions', 'SESSION_001'), {
      userId: CHILD_UID,
      status: 'ACTIVE'
    })
  );

  await assertFails(
    setDoc(doc(db, 'sessions', 'SESSION_002'), {
      userId: PARENT_UID,
      status: 'ACTIVE'
    })
  );
});
