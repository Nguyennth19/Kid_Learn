/**
 * API_Auth.gs
 * XỬ LÝ XÁC THỰC VÀ PHÂN QUYỀN (RBAC & AUTHENTICATION)
 * Tuân thủ Master GAS OS V8.1 Playbooks [FILE 1 - Mục 4.1 & FILE 3 - Pattern 05]
 */

/**
 * Hàm xử lý đăng nhập từ Frontend
 * Được gọi thông qua google.script.run
 * @param {Object} payload - { email: "student1", password: "123" }
 */
function api_loginUser(payload) {
  try {
    if (!payload || !payload.email || !payload.password) {
      return ApiResponse.error("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.", "", "ERR_MISSING_AUTH");
    }

    var emailInput = payload.email.toString().trim();
    var passwordInput = payload.password.toString().trim();

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Data_Users");
    
    // Đọc toàn bộ DB User (Thao tác Đọc không cần LockService để tối ưu tốc độ)
    var rawData = sheet.getDataRange().getValues();
    var users = Utils_System.sheetValuesToObjects(rawData);
    
    var matchedUser = null;
    var userRowIndex = -1;

    // Tìm kiếm thông tin người dùng
    for (var i = 0; i < users.length; i++) {
      if (users[i].email === emailInput && String(users[i].passwordHash) === passwordInput) {
        matchedUser = users[i];
        userRowIndex = i + 3; // +3 vì mảng JSON bắt đầu từ 0, dữ liệu sheet bắt đầu từ Dòng 3
        break;
      }
    }

    if (!matchedUser) {
      return ApiResponse.error("Tên đăng nhập hoặc mật khẩu không chính xác.", "", "ERR_AUTH_FAIL");
    }

    if (matchedUser.status === "Inactive") {
      return ApiResponse.error("Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.", "", "ERR_AUTH_LOCKED");
    }

    // Xác định cột "lastLogin" từ Dòng 2 (Header Keys)
    var headerKeys = rawData[1];
    var lastLoginCol = headerKeys.indexOf("lastLogin") + 1;

    // Cập nhật "Đăng Nhập Lần Cuối" -> Thao tác GHI, BẮT BUỘC dùng LockWrapper
    if (lastLoginCol > 0 && userRowIndex > 0) {
      LockWrapper.execute("UpdateLastLogin", function() {
        var currentTime = Utils_System.formatDate(new Date());
        sheet.getRange(userRowIndex, lastLoginCol).setValue(currentTime);
      });
    }

    // Ghi Log hệ thống
    AuditLogger.log(emailInput, "LOGIN", "AUTH", { status: "Success", role: matchedUser.role });

    // Loại bỏ dữ liệu nhạy cảm trước khi trả về Client
    delete matchedUser.passwordHash;

    // Sinh Token phiên làm việc (Session Token cơ bản base64)
    var sessionToken = Utilities.base64Encode(emailInput + ":" + new Date().getTime());
    matchedUser.token = sessionToken;

    return ApiResponse.success(matchedUser, "Đăng nhập thành công!");
  } catch (e) {
    AuditLogger.log(payload ? payload.email : "Unknown", "LOGIN_ERROR", "AUTH", { error: e.toString() });
    return ApiResponse.error("Lỗi hệ thống trong quá trình xác thực.", e.toString(), "ERR_SYSTEM");
  }
}

/**
 * Hàm kiểm tra quyền (Verify Token/RBAC)
 * Dùng nội bộ cho các API khác trước khi cho phép GHI/XÓA dữ liệu.
 * @param {string} token 
 * @param {string} requiredRole (Tùy chọn)
 */
function internal_verifyToken(token, requiredRole) {
  if (!token) return { isValid: false, message: "Không tìm thấy Token bảo mật." };
  
  try {
    var decoded = Utilities.newBlob(Utilities.base64Decode(token)).getDataAsString();
    var email = decoded.split(":")[0];
    
    // Trong thực tế sẽ đối chiếu thời gian hết hạn (Session Timeout) với Cache/DB
    // Ở đây ta đơn giản hóa việc tra cứu email
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Data_Users");
    var rawData = sheet.getDataRange().getValues();
    var users = Utils_System.sheetValuesToObjects(rawData);
    
    var user = null;
    for (var i = 0; i < users.length; i++) {
      if (users[i].email === email) {
        user = users[i];
        break;
      }
    }
    
    if (!user) return { isValid: false, message: "Token không hợp lệ hoặc user không tồn tại." };
    if (user.status === "Inactive") return { isValid: false, message: "Tài khoản đang bị khóa." };
    if (requiredRole && user.role !== requiredRole && user.role !== "Admin") {
      return { isValid: false, message: "Bạn không có quyền thực hiện hành động này." };
    }
    
    return { isValid: true, user: user };
  } catch (e) {
    return { isValid: false, message: "Lỗi giải mã Token." };
  }
}