/**
 * API_Dashboard.gs
 * XỬ LÝ DỮ LIỆU TỔNG QUAN CHO SINH VIÊN (DASHBOARD & TASKS)
 * Tuân thủ Master GAS OS V8.1 Playbooks [FILE 1 - Mục 2.3 & 5.2]
 */

/**
 * Lấy dữ liệu tổng quan cho trang chủ Dashboard
 * Đọc dữ liệu không cần LockService để đảm bảo tốc độ phản hồi < 1s
 * @param {Object} payload - { token: "..." }
 */
function api_getDashboardData(payload) {
  try {
    // 1. Xác thực bảo mật chặn XSS/Unauthorized
    var authCheck = internal_verifyToken(payload.token);
    if (!authCheck.isValid) {
      return ApiResponse.error(authCheck.message, "", "ERR_UNAUTHORIZED");
    }
    
    var currentUser = authCheck.user;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // 2. Kéo dữ liệu Công việc / Bài tập (Data_Tasks)
    var taskSheet = ss.getSheetByName("Data_Tasks");
    var taskData = taskSheet.getDataRange().getValues();
    var allTasks = Utils_System.sheetValuesToObjects(taskData);
    
    // Giải phóng mảng nguyên gốc để dọn rác RAM (Garbage Collection - Mục 5.2)
    taskData = null; 

    // 3. Phân loại và lọc dữ liệu (Giả lập logic chỉ lấy task của cá nhân/hệ thống)
    var upcomingTasks = [];
    var completedTasks = [];
    
    // Thuật toán quét nhanh
    for (var i = 0; i < allTasks.length; i++) {
      var t = allTasks[i];
      if (t.status === "Hoàn thành" || t.status === "Done") {
        completedTasks.push(t);
      } else {
        upcomingTasks.push(t);
      }
    }

    // 4. Tổng hợp Object trả về UI
    var dashboardMetrics = {
      userProfile: {
        fullName: currentUser.fullName,
        email: currentUser.email,
        role: currentUser.role
      },
      stats: {
        gpa: "3.8", // Dữ liệu cứng tạm thời, thực tế sẽ map với Data_Scores
        creditsAccumulated: 45,
        creditsThisSemester: 15,
        percentComplete: 60
      },
      tasks: {
        upcoming: upcomingTasks,
        completed: completedTasks,
        pendingCount: upcomingTasks.length
      },
      notifications: [] // Sẵn sàng mảng trống nếu mở rộng Data_Notifications
    };

    return ApiResponse.success(dashboardMetrics, "Tải dữ liệu Dashboard thành công.");
  } catch (e) {
    AuditLogger.log(payload && payload.token ? "Token..." : "Unknown", "LOAD_DASHBOARD_ERROR", "DASHBOARD", { error: e.toString() });
    return ApiResponse.error("Không thể tải dữ liệu Dashboard lúc này.", e.toString(), "ERR_SYSTEM");
  }
}

/**
 * Xử lý cập nhật trạng thái Bài tập (Hành động từ UI Lạc quan)
 * Thao tác SỬA (Update) -> BẮT BUỘC DÙNG LOCK
 * @param {Object} payload - { token: "...", taskId: "T001", newStatus: "Done" }
 */
function api_updateTaskStatus(payload) {
  try {
    // Xác thực
    var authCheck = internal_verifyToken(payload.token);
    if (!authCheck.isValid) {
      return ApiResponse.error(authCheck.message, "", "ERR_UNAUTHORIZED");
    }

    var taskId = Utils_System.sanitizeHtml(payload.taskId);
    var newStatus = Utils_System.sanitizeHtml(payload.newStatus);

    var result = LockWrapper.execute("UpdateTaskStatus_" + taskId, function() {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName("Data_Tasks");
      var rawData = sheet.getDataRange().getValues();
      
      var headerKeys = rawData[1];
      var idCol = headerKeys.indexOf("id") + 1;
      var statusCol = headerKeys.indexOf("status") + 1;
      
      var targetRowIndex = -1;
      
      for (var r = 2; r < rawData.length; r++) { // Bỏ qua 2 dòng header
        if (rawData[r][idCol - 1] === taskId) {
          targetRowIndex = r + 1; // +1 để ra dòng thật trên sheet
          break;
        }
      }
      
      if (targetRowIndex === -1) {
        throw new Error("Không tìm thấy công việc với ID: " + taskId);
      }
      
      // Update cell trực tiếp (không dùng loop update)
      sheet.getRange(targetRowIndex, statusCol).setValue(newStatus);
      return true;
    });

    AuditLogger.log(authCheck.user.email, "UPDATE_TASK", "TASKS", { taskId: taskId, status: newStatus });
    
    return ApiResponse.success(null, "Cập nhật bài tập thành công!");
  } catch (e) {
    return ApiResponse.error("Có lỗi khi cập nhật tiến độ bài tập.", e.toString(), "ERR_SYSTEM");
  }
}