import { prepareAuth, observeSession, signInWithAccountCode, signOutCurrentUser } from "./services/auth-service.js";
import { getActiveProfile, getActiveSubjects, getRoleContext } from "./services/profile-service.js";

const views = {
  loading: document.querySelector("#loading-view"),
  login: document.querySelector("#login-view"),
  shell: document.querySelector("#shell-view")
};
const form = document.querySelector("#login-form");
const accountCodeInput = document.querySelector("#account-code");
const pinInput = document.querySelector("#pin");
const loginButton = document.querySelector("#login-button");
const logoutButton = document.querySelector("#logout-button");
const loginStatus = document.querySelector("#login-status");
const shellStatus = document.querySelector("#shell-status");

function showView(name) {
  Object.entries(views).forEach(([key, view]) => {
    view.hidden = key !== name;
  });
  logoutButton.hidden = name !== "shell";
}

function setMessage(target, message, kind = "") {
  target.textContent = message;
  target.className = `status ${kind}`.trim();
}

function friendlyError(error) {
  const messages = {
    "auth/invalid-credential": "Mã tài khoản hoặc PIN không đúng.",
    "auth/too-many-requests": "Đăng nhập sai quá nhiều lần. Hãy chờ rồi thử lại.",
    "kidlearn/account-code-not-found": "Mã tài khoản không tồn tại.",
    "permission-denied": "Tài khoản không có quyền đọc dữ liệu này."
  };
  return messages[error?.code] || error?.message || "Không thể hoàn tất yêu cầu.";
}

function renderSubjects(subjects) {
  const icons = { VI: "Aa", MATH: "123", EN: "ABC", SCI: "⚗" };
  const colors = { VI: "coral", MATH: "violet", EN: "blue", SCI: "green" };
  const grid = document.querySelector("#subject-grid");
  grid.replaceChildren();

  subjects.forEach((subject) => {
    const card = document.createElement("article");
    card.className = `subject-card ${colors[subject.subjectCode] || "blue"}`;
    const icon = document.createElement("span");
    icon.className = "subject-icon";
    icon.textContent = icons[subject.subjectCode] || "★";
    const name = document.createElement("strong");
    name.textContent = subject.subjectName;
    const state = document.createElement("span");
    state.textContent = "Sẵn sàng";
    card.append(icon, name, state);
    grid.append(card);
  });
}

function renderShell(profile, context, subjects) {
  const isChild = profile.role === "CHILD";
  document.querySelector("#role-label").textContent = isChild ? "GIAO DIỆN CỦA BÉ" : "GIAO DIỆN PHỤ HUYNH";
  document.querySelector("#greeting").textContent = `Xin chào, ${profile.displayName}!`;
  document.querySelector("#shell-message").textContent = isChild
    ? "Hôm nay mình cùng khám phá điều mới nhé."
    : `Đang quản lý hồ sơ học tập của ${context.child.displayName}.`;
  document.querySelector("#primary-card-title").textContent = isChild ? "Bài học của con" : "Bài được giao";
  document.querySelector("#primary-card-text").textContent = isChild
    ? "Khung bài học đã sẵn sàng để kết nối ở bước tiếp theo."
    : "Khu vực giao và theo dõi bài sẽ được xây sau khi duyệt khung.";
  document.querySelector("#secondary-card-title").textContent = isChild ? "Tiến độ của con" : "Tổng quan tiến độ";
  document.querySelector("#secondary-card-text").textContent = isChild
    ? `Hồ sơ ${context.child.id} đã liên kết an toàn.`
    : `Liên kết ${context.access.accessType} đang ${context.access.status}.`;
  renderSubjects(subjects);
  setMessage(shellStatus, "Phiên đăng nhập hợp lệ. Chưa bật bất kỳ thao tác ghi dữ liệu nào.", "success");
  showView("shell");
}

async function loadShell(user) {
  showView("loading");
  try {
    const [profile, subjects] = await Promise.all([
      getActiveProfile(user.uid),
      getActiveSubjects()
    ]);
    const context = await getRoleContext(profile);
    renderShell(profile, context, subjects);
  } catch (error) {
    await signOutCurrentUser();
    showView("login");
    setMessage(loginStatus, friendlyError(error), "error");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  loginButton.disabled = true;
  setMessage(loginStatus, "Đang xác thực…");

  try {
    await signInWithAccountCode(accountCodeInput.value, pinInput.value);
    pinInput.value = "";
  } catch (error) {
    setMessage(loginStatus, friendlyError(error), "error");
  } finally {
    loginButton.disabled = false;
  }
});

logoutButton.addEventListener("click", async () => {
  logoutButton.disabled = true;
  await signOutCurrentUser();
  logoutButton.disabled = false;
});

await prepareAuth();
observeSession((user) => {
  if (user) {
    loadShell(user);
  } else {
    showView("login");
    setMessage(loginStatus, "Sẵn sàng đăng nhập.", "success");
  }
});
