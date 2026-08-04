import { prepareAuth, observeSession, signInWithAccountCode, signOutCurrentUser } from "./services/auth-service.js";
import { getActiveProfile, getActiveSubjects, getRoleContext } from "./services/profile-service.js";
import { getActiveCourses, getPublishedLessons, getLessonBlocks } from "./services/catalog-service.js";

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
const subjectGrid = document.querySelector("#subject-grid");
const dashboardGrid = document.querySelector(".dashboard-grid");
const catalogView = document.querySelector("#catalog-view");
const catalogTitle = document.querySelector("#catalog-title");
const catalogStatus = document.querySelector("#catalog-status");
const courseList = document.querySelector("#course-list");
const lessonList = document.querySelector("#lesson-list");
const lessonPlayer = document.querySelector("#lesson-player");
const lessonBlocks = document.querySelector("#lesson-blocks");
let activeRole = null;

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

function resetCatalog() {
  catalogView.hidden = true;
  subjectGrid.hidden = false;
  dashboardGrid.hidden = false;
  courseList.replaceChildren();
  lessonList.replaceChildren();
  lessonBlocks.replaceChildren();
  lessonPlayer.hidden = true;
  setMessage(catalogStatus, "");
}

function makeCatalogButton(title, detail, onClick) {
  const button = document.createElement("button");
  button.className = "catalog-item";
  button.type = "button";
  const heading = document.createElement("strong");
  heading.textContent = title;
  const description = document.createElement("span");
  description.textContent = detail;
  const arrow = document.createElement("span");
  arrow.className = "catalog-arrow";
  arrow.textContent = "→";
  button.append(heading, description, arrow);
  button.addEventListener("click", onClick);
  return button;
}

async function openSubject(subject) {
  if (activeRole !== "CHILD") return;
  subjectGrid.hidden = true;
  dashboardGrid.hidden = true;
  catalogView.hidden = false;
  catalogTitle.textContent = subject.subjectName;
  courseList.replaceChildren();
  lessonList.replaceChildren();
  lessonPlayer.hidden = true;
  setMessage(catalogStatus, "Đang tải khóa học…");

  try {
    const courses = await getActiveCourses(subject.id);
    if (!courses.length) {
      setMessage(catalogStatus, "Môn học này chưa có bài mẫu.", "success");
      return;
    }
    setMessage(catalogStatus, "");
    courses.forEach((course) => {
      courseList.append(makeCatalogButton(
        course.courseName,
        `Lớp ${course.gradeLevel} · Đang hoạt động`,
        () => openCourse(course)
      ));
    });
  } catch (error) {
    setMessage(catalogStatus, friendlyError(error), "error");
  }
}

async function openCourse(course) {
  courseList.replaceChildren();
  lessonList.replaceChildren();
  lessonPlayer.hidden = true;
  catalogTitle.textContent = course.courseName;
  setMessage(catalogStatus, "Đang tải danh sách bài học…");

  try {
    const lessons = await getPublishedLessons(course.id);
    if (!lessons.length) {
      setMessage(catalogStatus, "Khóa học này chưa có bài đã xuất bản.", "success");
      return;
    }
    setMessage(catalogStatus, "");
    lessons.forEach((lesson) => {
      lessonList.append(makeCatalogButton(
        lesson.title,
        `${lesson.estimatedMinutes} phút · ${lesson.summary}`,
        () => openLesson(lesson)
      ));
    });
  } catch (error) {
    setMessage(catalogStatus, friendlyError(error), "error");
  }
}

function renderBlock(block) {
  const section = document.createElement("section");
  section.className = `lesson-block block-${String(block.blockType || "text").toLowerCase()}`;

  if (block.title) {
    const title = document.createElement("h4");
    title.textContent = block.title;
    section.append(title);
  }
  if (block.content) {
    const content = document.createElement("p");
    content.textContent = block.content;
    section.append(content);
  }
  if (block.blockType === "MULTIPLE_CHOICE") {
    const prompt = document.createElement("h4");
    prompt.textContent = block.prompt;
    const options = document.createElement("div");
    options.className = "choice-list";
    (block.options || []).forEach((option) => {
      const item = document.createElement("div");
      item.className = "choice-item";
      item.textContent = option;
      options.append(item);
    });
    const note = document.createElement("p");
    note.className = "display-only-note";
    note.textContent = "Bài mẫu chỉ hiển thị; chưa ghi câu trả lời hoặc điểm.";
    section.append(prompt, options, note);
  }
  return section;
}

async function openLesson(lesson) {
  lessonList.replaceChildren();
  lessonPlayer.hidden = false;
  lessonBlocks.replaceChildren();
  document.querySelector("#lesson-title").textContent = lesson.title;
  document.querySelector("#lesson-meta").textContent = `BÀI HỌC · ${lesson.estimatedMinutes} PHÚT`;
  document.querySelector("#lesson-summary").textContent = lesson.summary;
  setMessage(catalogStatus, "Đang tải nội dung bài…");

  try {
    const blocks = await getLessonBlocks(lesson.id);
    blocks.forEach((block) => lessonBlocks.append(renderBlock(block)));
    setMessage(catalogStatus, `Đã tải ${blocks.length} phần nội dung. Chế độ chỉ đọc.`, "success");
  } catch (error) {
    setMessage(catalogStatus, friendlyError(error), "error");
  }
}

function renderSubjects(subjects) {
  const icons = { VI: "Aa", MATH: "123", EN: "ABC", SCI: "⚗" };
  const colors = { VI: "coral", MATH: "violet", EN: "blue", SCI: "green" };
  subjectGrid.replaceChildren();

  subjects.forEach((subject) => {
    const card = document.createElement(activeRole === "CHILD" ? "button" : "article");
    card.className = `subject-card ${colors[subject.subjectCode] || "blue"}`;
    if (activeRole === "CHILD") {
      card.type = "button";
      card.addEventListener("click", () => openSubject(subject));
    }
    const icon = document.createElement("span");
    icon.className = "subject-icon";
    icon.textContent = icons[subject.subjectCode] || "★";
    const name = document.createElement("strong");
    name.textContent = subject.subjectName;
    const state = document.createElement("span");
    state.textContent = activeRole === "CHILD" ? "Mở bài học" : "Sẵn sàng";
    card.append(icon, name, state);
    subjectGrid.append(card);
  });
}

function renderShell(profile, context, subjects) {
  const isChild = profile.role === "CHILD";
  activeRole = profile.role;
  resetCatalog();
  document.querySelector("#role-label").textContent = isChild ? "GIAO DIỆN CỦA BÉ" : "GIAO DIỆN PHỤ HUYNH";
  document.querySelector("#greeting").textContent = `Xin chào, ${profile.displayName}!`;
  document.querySelector("#shell-message").textContent = isChild
    ? "Hôm nay mình cùng khám phá điều mới nhé."
    : `Đang quản lý hồ sơ học tập của ${context.child.displayName}.`;
  document.querySelector("#primary-card-title").textContent = isChild ? "Bài học của con" : "Bài được giao";
  document.querySelector("#primary-card-text").textContent = isChild
    ? "Chọn một môn học phía trên để mở bài mẫu."
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

document.querySelector("#catalog-back").addEventListener("click", resetCatalog);
document.querySelector("#lesson-close").addEventListener("click", () => {
  lessonPlayer.hidden = true;
  lessonBlocks.replaceChildren();
  setMessage(catalogStatus, "Đã đóng bài học.", "success");
});

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
    activeRole = null;
    resetCatalog();
    showView("login");
    setMessage(loginStatus, "Sẵn sàng đăng nhập.", "success");
  }
});
