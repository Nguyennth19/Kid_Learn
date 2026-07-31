/**
 * API_Tasks.gs
 * BỘ API QUẢN LÝ CÔNG VIỆC VÀ BÀI TẬP (DATA_TASKS)
 * Tuân thủ Master GAS OS V8.1 Playbooks [FILE 1 - Mục 2.1, 2.2, 4.1 & FILE 4 - Service 08]
 */

/**
 * Lấy danh sách toàn bộ công việc / bài tập có bộ lọc trạng thái
 * @param {Object} payload - { token: "...", status: "Tất cả" }
 */
function api_getTasks(payload) {
  try {
    var authCheck = internal_verifyToken(payload ? payload.token : null);
    if (!authCheck.isValid) {
      return ApiResponse.error(authCheck.message, "", "ERR_UNAUTHORIZED");
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Data_Tasks");
    if (!sheet) {
      return ApiResponse.error("Bảng dữ liệu Data_Tasks chưa được khởi tạo.", "", "ERR_NOT_FOUND");
    }

    var rawData = sheet.getDataRange().getValues();
    var allTasks = Utils_System.sheetValuesToObjects(rawData);
    rawData = null; // Dọn rác RAM

    var filterStatus = payload && payload.status ? payload.status : "Tất cả";
    var resultTasks = [];

    for (var i = 0; i < allTasks.length; i++) {
      var item = allTasks[i];
      if (filterStatus === "Tất cả" || item.status === filterStatus) {
        resultTasks.push(item);
      }
    }

    return ApiResponse.success(resultTasks, "Tải danh sách bài tập thành công.");
  } catch (e) {
    AuditLogger.log(payload && payload.token ? "User" : "Unknown", "GET_TASKS_ERROR", "TASKS", { error: e.toString() });
    return ApiResponse.error("Không thể lấy danh sách bài tập.", e.toString(), "ERR_SYSTEM");
  }
}

/**
 * Tạo mới một công việc / bài tập
 * BẮT BUỘC DÙNG LOCKSERVICE ĐỂ NGHẼN CHỐNG GHI ĐÈ
 * @param {Object} payload - { token: "...", taskData: { task, category, startDate, startTime, dueDate, dueTime, color, status } }
 */
function api_createTask(payload) {
  try {
    var authCheck = internal_verifyToken(payload ? payload.token : null);
    if (!authCheck.isValid) {
      return ApiResponse.error(authCheck.message, "", "ERR_UNAUTHORIZED");
    }

    if (!payload.taskData || !payload.taskData.task) {
      return ApiResponse.error("Vui lòng nhập tên công việc.", "", "ERR_INVALID_INPUT");
    }

    var taskObj = payload.taskData;
    var newTask = {
      id: "TSK_" + new Date().getTime(),
      task: Utils_System.sanitizeHtml(taskObj.task || ""),
      category: Utils_System.sanitizeHtml(taskObj.category || "Chung"),
      startDate: taskObj.startDate || Utils_System.formatDate(new Date(), "yyyy-MM-dd"),
      startTime: taskObj.startTime || "08:00",
      dueDate: taskObj.dueDate || Utils_System.formatDate(new Date(), "yyyy-MM-dd"),
      dueTime: taskObj.dueTime || "23:59",
      color: taskObj.color || "#3b82f6",
      status: taskObj.status || "Chưa bắt đầu"
    };

    var createdItem = LockWrapper.execute("CreateTask", function() {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName("Data_Tasks");
      var rawData = sheet.getDataRange().getValues();
      var headerKeys = rawData[1]; // Dòng 2 chứa keys

      var newRowValues = Utils_System.objectsToSheetValues([newTask], headerKeys);
      
      // Thêm dòng dữ liệu mới vào cuối bảng
      sheet.appendRow(newRowValues[0]);
      return newTask;
    });

    AuditLogger.log(authCheck.user.email, "CREATE_TASK", "TASKS", { taskId: newTask.id, title: newTask.task });

    return ApiResponse.success(createdItem, "Thêm mới công việc thành công!");
  } catch (e) {
    return ApiResponse.error("Có lỗi khi tạo công việc mới.", e.toString(), "ERR_SYSTEM");
  }
}

/**
 * Cập nhật thông tin chi tiết của một công việc
 * @param {Object} payload - { token: "...", taskData: { id: "TSK_...", task: "...", ... } }
 */
function api_updateTask(payload) {
  try {
    var authCheck = internal_verifyToken(payload ? payload.token : null);
    if (!authCheck.isValid) {
      return ApiResponse.error(authCheck.message, "", "ERR_UNAUTHORIZED");
    }

    if (!payload.taskData || !payload.taskData.id) {
      return ApiResponse.error("Mã công việc không hợp lệ.", "", "ERR_INVALID_INPUT");
    }

    var updateObj = payload.taskData;
    var taskId = updateObj.id;

    var updatedItem = LockWrapper.execute("UpdateTask_" + taskId, function() {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName("Data_Tasks");
      var rawData = sheet.getDataRange().getValues();
      var headerKeys = rawData[1];
      
      var idColIndex = headerKeys.indexOf("id");
      var targetRow = -1;

      for (var r = 2; r < rawData.length; r++) {
        if (String(rawData[r][idColIndex]) === String(taskId)) {
          targetRow = r + 1; // Số dòng thực tế trên Sheet (1-indexed)
          break;
        }
      }

      if (targetRow === -1) {
        throw new Error("Không tìm thấy bài tập cần cập nhật.");
      }

      // Làm sạch dữ liệu đầu vào
      updateObj.task = Utils_System.sanitizeHtml(updateObj.task);
      updateObj.category = Utils_System.sanitizeHtml(updateObj.category);

      var updatedRowValues = Utils_System.objectsToSheetValues([updateObj], headerKeys)[0];
      
      // Ghi Batch mảng dữ liệu đè lên dòng tương ứng
      sheet.getRange(targetRow, 1, 1, headerKeys.length).setValues([updatedRowValues]);
      return updateObj;
    });

    AuditLogger.log(authCheck.user.email, "UPDATE_TASK_FULL", "TASKS", { taskId: taskId });

    return ApiResponse.success(updatedItem, "Cập nhật công việc thành công!");
  } catch (e) {
    return ApiResponse.error("Không thể cập nhật thông tin công việc.", e.toString(), "ERR_SYSTEM");
  }
}

/**
 * Xóa một công việc / bài tập khỏi hệ thống
 * @param {Object} payload - { token: "...", taskId: "TSK_..." }
 */
function api_deleteTask(payload) {
  try {
    var authCheck = internal_verifyToken(payload ? payload.token : null);
    if (!authCheck.isValid) {
      return ApiResponse.error(authCheck.message, "", "ERR_UNAUTHORIZED");
    }

    var taskId = payload ? payload.taskId : null;
    if (!taskId) {
      return ApiResponse.error("Thiếu ID bài tập cần xóa.", "", "ERR_INVALID_INPUT");
    }

    LockWrapper.execute("DeleteTask_" + taskId, function() {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var sheet = ss.getSheetByName("Data_Tasks");
      var rawData = sheet.getDataRange().getValues();
      var headerKeys = rawData[1];
      var idColIndex = headerKeys.indexOf("id");
      var targetRow = -1;

      for (var r = 2; r < rawData.length; r++) {
        if (String(rawData[r][idColIndex]) === String(taskId)) {
          targetRow = r + 1;
          break;
        }
      }

      if (targetRow === -1) {
        throw new Error("Bài tập không tồn tại hoặc đã bị xóa trước đó.");
      }

      sheet.deleteRow(targetRow);
    });

    AuditLogger.log(authCheck.user.email, "DELETE_TASK", "TASKS", { taskId: taskId });

    return ApiResponse.success({ id: taskId }, "Xóa bài tập thành công!");
  } catch (e) {
    return ApiResponse.error("Có lỗi xảy ra khi xóa bài tập.", e.toString(), "ERR_SYSTEM");
  }
}