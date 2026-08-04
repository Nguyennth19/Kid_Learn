import { auth, db, firestoreRead } from "./firebase.js";

const ALLOWED_ROLES = new Set(["CHILD", "PARENT"]);

export async function getActiveProfile(uid) {
  const snapshot = await firestoreRead.getDoc(
    firestoreRead.doc(db, "users", uid)
  );

  if (!snapshot.exists()) {
    throw profileError("Không tìm thấy hồ sơ người dùng.", "profile-not-found");
  }

  const profile = { id: snapshot.id, ...snapshot.data() };

  if (profile.status !== "ACTIVE") {
    throw profileError("Tài khoản chưa ở trạng thái ACTIVE.", "profile-inactive");
  }

  if (!ALLOWED_ROLES.has(profile.role)) {
    throw profileError("Vai trò tài khoản không được hỗ trợ.", "role-not-allowed");
  }

  return profile;
}

export async function getActiveSubjects() {
  const snapshot = await firestoreRead.getDocs(
    firestoreRead.query(
      firestoreRead.collection(db, "subjects"),
      firestoreRead.where("status", "==", "ACTIVE")
    )
  );

  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .sort((a, b) => Number(a.sortOrder) - Number(b.sortOrder));
}

export async function getRoleContext(profile) {
  if (profile.role === "CHILD") {
    const child = await findChildForCurrentUser();
    return { child };
  }

  const access = await findParentAccess();
  const childSnapshot = await firestoreRead.getDoc(
    firestoreRead.doc(db, "children", access.childId)
  );

  if (!childSnapshot.exists()) {
    throw profileError("Không tìm thấy hồ sơ bé đã liên kết.", "child-not-found");
  }

  return {
    access,
    child: { id: childSnapshot.id, ...childSnapshot.data() }
  };
}

async function findChildForCurrentUser() {
  const snapshot = await firestoreRead.getDocs(
    firestoreRead.query(
      firestoreRead.collection(db, "children"),
      firestoreRead.where("childUserId", "==", auth.currentUser.uid)
    )
  );

  if (snapshot.size !== 1) {
    throw profileError("Không xác định được hồ sơ bé.", "child-link-invalid");
  }

  const item = snapshot.docs[0];
  return { id: item.id, ...item.data() };
}

async function findParentAccess() {
  const snapshot = await firestoreRead.getDocs(
    firestoreRead.query(
      firestoreRead.collection(db, "userChildAccess"),
      firestoreRead.where("userId", "==", auth.currentUser.uid)
    )
  );

  const activeItems = snapshot.docs.filter(
    (item) => item.data().status === "ACTIVE"
  );

  if (activeItems.length === 0) {
    throw profileError("Không tìm thấy liên kết phụ huynh–bé ACTIVE.", "access-not-found");
  }

  const item = activeItems[0];
  return { id: item.id, ...item.data() };
}

function profileError(message, code) {
  const error = new Error(message);
  error.code = `kidlearn/${code}`;
  return error;
}
