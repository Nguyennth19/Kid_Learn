import { db, firestoreRead } from "./firebase.js";

function bySortOrder(left, right) {
  return (left.sortOrder ?? 0) - (right.sortOrder ?? 0);
}

async function readQuery(collectionName, constraints) {
  const snapshot = await firestoreRead.getDocs(
    firestoreRead.query(
      firestoreRead.collection(db, collectionName),
      ...constraints
    )
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort(bySortOrder);
}

export async function getActiveCourses(subjectId) {
  return readQuery("courses", [
    firestoreRead.where("subjectId", "==", subjectId),
    firestoreRead.where("status", "==", "ACTIVE")
  ]);
}

export async function getPublishedLessons(courseId) {
  return readQuery("lessons", [
    firestoreRead.where("courseId", "==", courseId),
    firestoreRead.where("status", "==", "PUBLISHED")
  ]);
}

export async function getLessonBlocks(lessonId) {
  const snapshot = await firestoreRead.getDocs(
    firestoreRead.collection(db, "lessons", lessonId, "blocks")
  );
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() })).sort(bySortOrder);
}
