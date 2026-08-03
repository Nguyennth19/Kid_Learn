import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.0/firebase-app.js";
import {
  browserSessionPersistence,
  getAuth,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-auth.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where
} from "https://www.gstatic.com/firebasejs/12.17.0/firebase-firestore.js";

import { firebaseConfig, smokeConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const form = document.querySelector("#login-form");
const accountCodeInput = document.querySelector("#account-code");
const pinInput = document.querySelector("#pin");
const loginButton = document.querySelector("#login-button");
const logoutButton = document.querySelector("#logout-button");
const statusBox = document.querySelector("#status");
const resultsList = document.querySelector("#results");
const summaryBox = document.querySelector("#summary");

const results = [];

function setStatus(message, kind = "") {
  statusBox.textContent = message;
  statusBox.className = `status ${kind}`.trim();
}

function addResult(name, passed, detail) {
  results.push({ name, passed, detail });
  const item = document.createElement("li");
  item.className = `result ${passed ? "pass" : "fail"}`;

  const icon = document.createElement("span");
  icon.className = "result-icon";
  icon.textContent = passed ? "✓" : "✕";

  const text = document.createElement("span");
  const title = document.createElement("strong");
  title.textContent = name;
  const description = document.createElement("div");
  description.textContent = detail;

  text.append(title, description);
  item.append(icon, text);
  resultsList.append(item);
}

function resetResults() {
  results.length = 0;
  resultsList.replaceChildren();
  summaryBox.hidden = true;
  summaryBox.textContent = "";
}

function showSummary() {
  const passed = results.filter((result) => result.passed).length;
  const failed = results.length - passed;
  summaryBox.textContent = `Tổng kiểm tra: ${results.length}\nĐạt: ${passed}\nKhông đạt: ${failed}\nChế độ ghi dữ liệu: TẮT`;
  summaryBox.hidden = false;
}

function friendlyError(error) {
  const messages = {
    "auth/invalid-credential": "Mã tài khoản hoặc PIN không đúng.",
    "auth/too-many-requests": "Đăng nhập sai quá nhiều lần. Hãy chờ rồi thử lại.",
    "permission-denied": "Firestore từ chối quyền truy cập."
  };
  return messages[error?.code] || error?.message || "Đã xảy ra lỗi không xác định.";
}

async function verifyUnauthenticatedAccessIsDenied() {
  await signOut(auth);
  try {
    await getDoc(doc(db, "subjects", "SUB_MATH"));
    addResult(
      "Khóa người chưa đăng nhập",
      false,
      "Người chưa đăng nhập vẫn đọc được dữ liệu."
    );
  } catch (error) {
    addResult(
      "Khóa người chưa đăng nhập",
      error.code === "permission-denied",
      error.code === "permission-denied"
        ? "Firestore đã từ chối đúng như thiết kế."
        : friendlyError(error)
    );
  }
}

async function readActiveSubjects() {
  const snapshot = await getDocs(
    query(collection(db, "subjects"), where("status", "==", "ACTIVE"))
  );
  return snapshot.docs
    .map((subjectDoc) => subjectDoc.data())
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

async function verifyRoleAccess(userProfile) {
  const childId = smokeConfig.childId;

  if (userProfile.role === "CHILD") {
    const childSnapshot = await getDoc(doc(db, "children", childId));
    const child = childSnapshot.data();
    const passed =
      childSnapshot.exists() &&
      child.childUserId === auth.currentUser.uid;

    addResult(
      "CHILD đọc hồ sơ của chính mình",
      passed,
      passed
        ? `Đã đọc ${child.displayName} (${childId}).`
        : "Hồ sơ bé không tồn tại hoặc UID không khớp."
    );
    return;
  }

  if (userProfile.role === "PARENT") {
    const accessId = `${auth.currentUser.uid}_${childId}`;
    const accessSnapshot = await getDoc(
      doc(db, "userChildAccess", accessId)
    );
    const access = accessSnapshot.data();
    const accessPassed =
      accessSnapshot.exists() &&
      access.userId === auth.currentUser.uid &&
      access.childId === childId &&
      access.status === "ACTIVE";

    addResult(
      "PARENT đọc liên kết phụ huynh–bé",
      accessPassed,
      accessPassed
        ? `Liên kết ${access.accessType} đang ACTIVE.`
        : "Không tìm thấy liên kết hợp lệ."
    );

    if (accessPassed) {
      const childSnapshot = await getDoc(doc(db, "children", childId));
      addResult(
        "PARENT đọc hồ sơ bé đã liên kết",
        childSnapshot.exists(),
        childSnapshot.exists()
          ? `Đã đọc ${childSnapshot.data().displayName} (${childId}).`
          : "Không tìm thấy hồ sơ bé."
      );
    }
    return;
  }

  addResult(
    "Xác minh vai trò",
    false,
    `Vai trò không được hỗ trợ: ${userProfile.role || "(trống)"}.`
  );
}

async function runAuthenticatedSmokeTest() {
  const uid = auth.currentUser.uid;
  const userSnapshot = await getDoc(doc(db, "users", uid));

  if (!userSnapshot.exists()) {
    throw new Error("Không tìm thấy hồ sơ users tương ứng UID.");
  }

  const userProfile = userSnapshot.data();
  addResult(
    "Đọc hồ sơ người dùng",
    userProfile.status === "ACTIVE",
    `${userProfile.displayName} · ${userProfile.role} · ${userProfile.status}`
  );

  const configSnapshot = await getDoc(doc(db, "system", "config"));
  addResult(
    "Đọc cấu hình DEV",
    configSnapshot.exists() &&
      configSnapshot.data().environment === "DEV",
    configSnapshot.exists()
      ? `${configSnapshot.data().appName} · schema ${configSnapshot.data().schemaVersion}`
      : "Không tìm thấy system/config."
  );

  const subjects = await readActiveSubjects();
  const expectedCodes = ["VI", "MATH", "EN", "SCI"];
  const actualCodes = subjects.map((subject) => subject.subjectCode);
  const subjectsPassed =
    subjects.length === 4 &&
    expectedCodes.every((code) => actualCodes.includes(code));

  addResult(
    "Đọc bốn môn ACTIVE",
    subjectsPassed,
    subjectsPassed
      ? subjects.map((subject) => subject.subjectName).join(" · ")
      : `Tìm thấy ${subjects.length}/4 môn.`
  );

  await verifyRoleAccess(userProfile);
}

async function initializeSmokePage() {
  await setPersistence(auth, browserSessionPersistence);
  resetResults();
  setStatus("Đang kiểm tra khóa truy cập công khai…");
  await verifyUnauthenticatedAccessIsDenied();
  showSummary();
  setStatus("Sẵn sàng đăng nhập.", "success");
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const accountCode = accountCodeInput.value.trim().toUpperCase();
  const email = smokeConfig.accounts[accountCode];

  if (!email) {
    setStatus("Mã tài khoản chỉ nhận PARENT hoặc LICHKHE.", "error");
    return;
  }

  loginButton.disabled = true;
  resetResults();
  setStatus("Đang đăng nhập và kiểm tra quyền…");

  try {
    await verifyUnauthenticatedAccessIsDenied();
    await signInWithEmailAndPassword(auth, email, pinInput.value);
    await runAuthenticatedSmokeTest();
    showSummary();

    const failed = results.filter((result) => !result.passed).length;
    setStatus(
      failed === 0
        ? "Smoke test hoàn tất: tất cả kiểm tra đều đạt."
        : `Smoke test hoàn tất: có ${failed} kiểm tra chưa đạt.`,
      failed === 0 ? "success" : "error"
    );

    logoutButton.hidden = false;
    pinInput.value = "";
  } catch (error) {
    addResult("Đăng nhập/đọc dữ liệu DEV", false, friendlyError(error));
    showSummary();
    setStatus(friendlyError(error), "error");
  } finally {
    loginButton.disabled = false;
  }
});

logoutButton.addEventListener("click", async () => {
  await signOut(auth);
  logoutButton.hidden = true;
  resetResults();
  await verifyUnauthenticatedAccessIsDenied();
  showSummary();
  setStatus("Đã đăng xuất an toàn.", "success");
});

initializeSmokePage().catch((error) => {
  setStatus(friendlyError(error), "error");
});
