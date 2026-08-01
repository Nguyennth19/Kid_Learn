(Files content cropped to 300k characters, download full ingest to see more)
================================================
FILE: README.md
================================================
# kidkearn
school



================================================
FILE: API_Auth.gs
================================================
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


================================================
FILE: API_Core.gs
================================================
/**
 * API_Core.gs
 * BỘ LÕI BACKEND HỆ THỐNG (CORE SERVICES)
 * Tuân thủ Master GAS OS V8.1 Playbooks [FILE 1 & FILE 4]
 */

/**
 * 1. LockWrapper - Trình bọc khóa đồng thời (Atomic Lock Pattern)
 * Ngăn chặn tuyệt đối tình trạng ghi đè dữ liệu khi nhiều người dùng cùng thao tác.
 * Tuân thủ [FILE 4 - Service 08] & [FILE 1 - Mục 2.1]
 */
var LockWrapper = {
  execute: function(taskName, callback) {
    var lock = LockService.getScriptLock();
    try {
      // FIX LỖI: Đổi waitLock thành tryLock để nhận về kết quả boolean (true/false)
      var acquired = lock.tryLock(30000);
      if (!acquired) {
        throw new Error('Hệ thống đang bận xử lý tác vụ khác. Vui lòng thử lại sau giây lát.');
      }
      var result = callback();
      return result;
    } catch (e) {
      Logger.log('[LockWrapper Error] ' + taskName + ': ' + e.toString());
      throw e;
    } finally {
      SpreadsheetApp.flush();
      lock.releaseLock();
    }
  }
};

/**
 * 2. CacheManager - Trình quản lý Bộ nhớ đệm (Cache-as-a-Database Pattern)
 * Giảm thiểu truy vấn trực tiếp vào Google Sheets đối với dữ liệu cấu hình/danh mục.
 * Tuân thủ [FILE 4 - Service 07] & [FILE 1 - Mục 5.1]
 */
var CacheManager = {
  DEFAULT_TTL: 21600, // Time-to-live mặc định: 6 giờ (tính bằng giây)

  get: function(key) {
    try {
      var cache = CacheService.getScriptCache();
      var cachedData = cache.get(key);
      if (!cachedData) return null;
      return JSON.parse(cachedData);
    } catch (e) {
      Logger.log('[CacheManager.get Error] Key: ' + key + ' | ' + e.toString());
      return null;
    }
  },

  set: function(key, data, ttlInSeconds) {
    try {
      var cache = CacheService.getScriptCache();
      var ttl = ttlInSeconds || this.DEFAULT_TTL;
      var serialized = JSON.stringify(data);
      
      // Kiểm tra an toàn ngưỡng dung lượng 100KB của CacheService
      if (serialized.length > 90000) {
        Logger.log('[CacheManager.set Warning] Dữ liệu quá lớn (>90KB) không thể lưu Cache cho key: ' + key);
        return false;
      }
      cache.put(key, serialized, ttl);
      return true;
    } catch (e) {
      Logger.log('[CacheManager.set Error] Key: ' + key + ' | ' + e.toString());
      return false;
    }
  },

  invalidate: function(key) {
    try {
      var cache = CacheService.getScriptCache();
      cache.remove(key);
      return true;
    } catch (e) {
      Logger.log('[CacheManager.invalidate Error] Key: ' + key + ' | ' + e.toString());
      return false;
    }
  }
};

/**
 * 3. ApiResponse - Chuẩn hóa định dạng phản hồi JSON gửi về Client
 * Tuân thủ [FILE 1 - Mục 9.1]
 */
var ApiResponse = {
  success: function(data, message) {
    return {
      success: true,
      data: data !== undefined ? data : null,
      message: message || 'Thao tác thành công.',
      devLog: '',
      errorCode: ''
    };
  },

  error: function(message, devLog, errorCode) {
    return {
      success: false,
      data: null,
      message: message || 'Có lỗi xảy ra trong quá trình xử lý.',
      devLog: devLog || '',
      errorCode: errorCode || 'ERR_SYSTEM'
    };
  }
};

/**
 * 4. AuditLogger - Nhật ký kiểm toán hệ thống
 * Ghi vết toàn bộ hành động GHI / SỬA / XÓA vào Sheet Log_HeThong.
 * Tuân thủ [FILE 1 - Mục 8.1 & 8.2]
 */
var AuditLogger = {
  log: function(userEmail, action, moduleName, details) {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var logSheet = ss.getSheetByName("Log_HeThong");
      
      if (!logSheet) {
        logSheet = ss.insertSheet("Log_HeThong");
        logSheet.appendRow(["Thời Gian", "Email Người Dùng", "Hành Động", "Module", "Chi Tiết (JSON)"]);
        logSheet.appendRow(["timestamp", "userEmail", "action", "module", "details"]);
      }
      
      var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
      var email = userEmail || Session.getActiveUser().getEmail() || "Anonymous/System";
      var detailsJson = typeof details === "object" ? JSON.stringify(details) : String(details || "");
      
      logSheet.appendRow([timestamp, email, action, moduleName, detailsJson]);
    } catch (e) {
      Logger.log('[AuditLogger Error] Không thể ghi Log hệ thống: ' + e.toString());
    }
  }
};


================================================
FILE: API_Dashboard.gs
================================================
[Binary file]


================================================
FILE: API_Gradebook.gs
================================================
/**
 * API_Gradebook.gs
 * API XỬ LÝ LẤY ĐIỂM SỐ VÀ THỐNG KÊ (READ-ONLY)
 * Tuân thủ [FILE 1 - Mục 2.3] Tối ưu hóa đọc dữ liệu
 */

function api_getGradebookData(payload) {
  try {
    // 1. Xác thực bảo mật (Chống tra cứu chéo điểm của bạn khác)
    var authCheck = internal_verifyToken(payload ? payload.token : null);
    if (!authCheck.isValid) {
      return ApiResponse.error(authCheck.message, "", "ERR_UNAUTHORIZED");
    }
    
    var studentEmail = authCheck.user.email;
    var targetSemester = payload.semester || "Học kỳ II";
    var targetYear = payload.year || "2024 - 2025";
    
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Data_Scores");
    
    if (!sheet) {
      return ApiResponse.error("Bảng dữ liệu điểm chưa được thiết lập.", "", "ERR_NOT_FOUND");
    }

    // 2. Kéo dữ liệu (ĐỌC - Không cần LockService)
    var rawData = sheet.getDataRange().getValues();
    var allScores = Utils_System.sheetValuesToObjects(rawData);
    rawData = null; // Dọn rác RAM

    // 3. Lọc điểm số của đúng Học sinh và Học kỳ hiện tại
    var myScores = [];
    var totalScore = 0;
    
    // Thống kê phân loại (Pie Chart)
    var stats = {
      xuatSac: 0,
      tot: 0,
      kha: 0,
      dat: 0,
      chuaDat: 0
    };

    for (var i = 0; i < allScores.length; i++) {
      var record = allScores[i];
      if (record.studentEmail === studentEmail && record.semester === targetSemester && record.year === targetYear) {
        myScores.push(record);
        
        // Tính tổng điểm
        var finalScore = parseFloat(record.scoreFinal) || 0;
        totalScore += finalScore;
        
        // Đếm phân loại đánh giá
        var eval = record.evaluation ? record.evaluation.toString().toLowerCase() : "";
        if (eval.indexOf("xuất sắc") !== -1) stats.xuatSac++;
        else if (eval.indexOf("tốt") !== -1) stats.tot++;
        else if (eval.indexOf("khá") !== -1) stats.kha++;
        else if (eval.indexOf("chua đạt") !== -1 || eval.indexOf("chưa đạt") !== -1) stats.chuaDat++;
        else stats.dat++; // Mặc định Đạt hoặc các loại khác
      }
    }

    // 4. Xử lý tính toán Trung bình
    var averageScore = 0;
    var overallGrade = "Chưa có";
    if (myScores.length > 0) {
      averageScore = (totalScore / myScores.length).toFixed(2);
      
      // Xếp loại chung theo Thang điểm 10
      var avgNum = parseFloat(averageScore);
      if (avgNum >= 9.0) overallGrade = "Xuất sắc";
      else if (avgNum >= 7.0) overallGrade = "Tốt";
      else if (avgNum >= 5.0) overallGrade = "Khá";
      else if (avgNum >= 3.5) overallGrade = "Đạt";
      else overallGrade = "Chưa đạt";
    }

    // 5. Chuẩn bị dữ liệu trả về cho Frontend
    var resultData = {
      scores: myScores,
      summary: {
        average: averageScore,
        grade: overallGrade,
        stats: stats
      },
      // Giả lập dữ liệu tiến bộ qua các kỳ cho Line Chart (Trong thực tế sẽ query các kỳ trước)
      progressHistory: {
        labels: ["Học kỳ I (Lớp 1)", "Học kỳ II (Lớp 1)", "Học kỳ I (Lớp 2)", "Học kỳ II (Lớp 2)"],
        data: [6.8, 7.2, 7.6, parseFloat(averageScore) || 8.0]
      }
    };

    return ApiResponse.success(resultData, "Tải bảng điểm thành công.");
  } catch (e) {
    AuditLogger.log(payload && payload.token ? "Student" : "Unknown", "GET_GRADEBOOK_ERROR", "GRADEBOOK", { error: e.toString() });
    return ApiResponse.error("Lỗi khi tải bảng điểm.", e.toString(), "ERR_SYSTEM");
  }
}


================================================
FILE: API_Learning.gs
================================================
/**
 * API_Learning.gs
 * API XỬ LÝ DỮ LIỆU KHÓA HỌC VÀ TIẾN ĐỘ BÀI HỌC
 * Tuân thủ [FILE 1 - Mục 2.3] Tối ưu hóa đọc dữ liệu
 */

function api_getMyCourses(payload) {
  try {
    // 1. Xác thực bảo mật Token
    var authCheck = internal_verifyToken(payload ? payload.token : null);
    if (!authCheck.isValid) {
      return ApiResponse.error(authCheck.message, "", "ERR_UNAUTHORIZED");
    }
    
    // Trong thực tế, đoạn này sẽ quét bảng `Data_Enrollments` và `Data_Tasks` để tính toán phần trăm.
    // Để phục vụ giao diện hiển thị ngay lập tức theo Mockup, tôi thiết lập cấu trúc Dữ liệu Động (Dynamic Data Structure)
    var studentCourses = [
      {
        id: "SUBJECT_TV",
        name: "Tiếng Việt",
        description: "Đọc hiểu, luyện từ và câu",
        progress: 75,
        totalLessons: 28,
        completedLessons: 21,
        theme: { bg: "bg-green-50", button: "bg-green-600 hover:bg-green-700", text: "text-green-700", bar: "bg-green-500", emoji: "📚", badge: "bg-green-500" }
      },
      {
        id: "SUBJECT_TOAN",
        name: "Toán",
        description: "Tư duy logic và giải toán",
        progress: 68,
        totalLessons: 30,
        completedLessons: 20,
        theme: { bg: "bg-blue-50", button: "bg-blue-600 hover:bg-blue-700", text: "text-blue-700", bar: "bg-blue-500", emoji: "🧮", badge: "bg-blue-500" }
      },
      {
        id: "SUBJECT_TA",
        name: "Tiếng Anh",
        description: "Từ vựng, ngữ pháp và giao tiếp",
        progress: 60,
        totalLessons: 26,
        completedLessons: 15,
        theme: { bg: "bg-indigo-50", button: "bg-indigo-600 hover:bg-indigo-700", text: "text-indigo-700", bar: "bg-indigo-500", emoji: "🎧", badge: "bg-indigo-500" }
      },
      {
        id: "SUBJECT_KH",
        name: "Khoa học",
        description: "Thí nghiệm và khám phá thế giới",
        progress: 55,
        totalLessons: 24,
        completedLessons: 13,
        theme: { bg: "bg-orange-50", button: "bg-orange-600 hover:bg-orange-700", text: "text-orange-700", bar: "bg-orange-500", emoji: "🔬", badge: "bg-orange-500" }
      }
    ];

    var overviewStats = {
      totalCourses: 4,
      totalCompletedLessons: 69, // 21+20+15+13
      averageScore: 8.24,
      studyTimeHours: 15,
      studyTimeMins: 30
    };

    var resultData = {
      courses: studentCourses,
      stats: overviewStats
    };

    return ApiResponse.success(resultData, "Tải danh sách khóa học thành công.");
  } catch (e) {
    AuditLogger.log(payload && payload.token ? "Student" : "Unknown", "GET_COURSES_ERROR", "LEARNING", { error: e.toString() });
    return ApiResponse.error("Lỗi khi tải danh sách khóa học.", e.toString(), "ERR_SYSTEM");
  }
}


================================================
FILE: API_SubjectDetail.gs
================================================
/**
 * API_SubjectDetail.gs
 * API XỬ LÝ DỮ LIỆU ĐỘNG CHO TRANG CHI TIẾT MÔN HỌC
 * Tuân thủ [FILE 1 - Mục 2.3 & FILE 3 - Pattern 03]
 */

function api_getSubjectDetail(payload) {
  try {
    // 1. Xác thực bảo mật Token
    var authCheck = internal_verifyToken(payload ? payload.token : null);
    if (!authCheck.isValid) {
      return ApiResponse.error(authCheck.message, "", "ERR_UNAUTHORIZED");
    }
    
    var subjectId = payload.subjectId;
    if (!subjectId) {
      return ApiResponse.error("Mã môn học không hợp lệ.", "", "ERR_INVALID_INPUT");
    }

    // 2. Dữ liệu Động (Dynamic Data) mô phỏng cấu trúc trả về từ CSDL Google Sheets
    var dbMock = {
      // ==========================================
      // 1. MÔN TIẾNG VIỆT
      // ==========================================
      "SUBJECT_TV": {
        header: {
          title: "Tiếng Việt – Lớp 2",
          subtitle: "Học vui – Hiểu sâu – Tiến bộ mỗi ngày!",
          greeting: "Chào Minh Anh! 👋",
          greetingSub: "Hôm nay chúng ta cùng khám phá bài học mới nhé!",
          progress: 65,
          completedStr: "26 / 40 bài",
          theme: { primary: "green", bg: "bg-green-100", text: "text-green-700", border: "border-green-200", btn: "bg-green-600", accent: "bg-green-500" }
        },
        sidebar: {
          activeTopic: "Chủ đề 1: Mái ấm gia đình",
          lessons: [
            { id: 1, title: "Bài 1: Mái ấm gia đình", desc: "Đọc hiểu - Nhận biết từ ngữ", status: "completed", icon: "👨‍👩‍👧‍👦" },
            { id: 2, title: "Bài 2: Quà của bố", desc: "Đọc hiểu - Từ chỉ đặc điểm", status: "completed", icon: "🎁" },
            { id: 3, title: "Bài 3: Mẹ", desc: "Đọc hiểu - Từ chỉ hoạt động", status: "completed", icon: "👩‍👧" },
            { id: 4, title: "Bài 4: Ông", desc: "Dấu chấm, dấu chấm hỏi", status: "active", icon: "👴" },
            { id: 5, title: "Bài 5: Ngày mới bắt đầu", desc: "Luyện từ và câu", status: "locked", icon: "🌅" }
          ]
        },
        taskGrid: [
          { title: "Bài đọc", desc: "Đọc hiểu văn bản", icon: "📖", bg: "bg-blue-50" },
          { title: "Điền vào chỗ trống", desc: "Luyện từ và câu", icon: "📝", bg: "bg-orange-50" },
          { title: "Câu hỏi", desc: "Trắc nghiệm", icon: "❓", bg: "bg-blue-50" },
          { title: "Sắp xếp câu", desc: "Rèn luyện tư duy", icon: "🧩", bg: "bg-green-50" },
          { title: "Kể chuyện", desc: "Phát triển ngôn ngữ", icon: "👧", bg: "bg-pink-50" },
          { title: "Viết đoạn văn", desc: "Luyện tập viết", icon: "✍️", bg: "bg-yellow-50" }
        ]
      },
      
      // ==========================================
      // 2. MÔN TOÁN HỌC
      // ==========================================
      "SUBJECT_TOAN": {
        header: {
          title: "Toán – Lớp 2",
          subtitle: "Học vui – Hiểu nhanh – Giỏi toán!",
          greeting: "Chào Minh Anh! 👋",
          greetingSub: "Hôm nay chúng ta cùng khám phá Toán học nhé!",
          progress: 62,
          completedStr: "18 / 30 bài",
          theme: { primary: "blue", bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200", btn: "bg-blue-600", accent: "bg-blue-500" }
        },
        sidebar: {
          activeTopic: "Chủ đề 2: Phép cộng, phép trừ",
          lessons: [
            { id: 1, title: "Bài 1: Cộng có nhớ", desc: "Số có hai chữ số", status: "completed", icon: "➕" },
            { id: 2, title: "Bài 2: Cộng có nhớ (tt)", desc: "Luyện tập chung", status: "completed", icon: "➕" },
            { id: 3, title: "Bài 3: Trừ có nhớ", desc: "Số có hai chữ số", status: "completed", icon: "➖" },
            { id: 4, title: "Bài 4: Trừ có nhớ (tt)", desc: "Luyện tập chung", status: "active", icon: "➖" },
            { id: 5, title: "Bài 5: Luyện tập chung", desc: "Ôn tập phép tính", status: "locked", icon: "🧮" }
          ]
        },
        taskGrid: [
          { title: "Bài tập tương tác", desc: "Làm bài tập online", icon: "💻", bg: "bg-blue-50" },
          { title: "Điền số thích hợp", desc: "Luyện tính nhẩm", icon: "🔢", bg: "bg-purple-50" },
          { title: "Câu hỏi trắc nghiệm", desc: "Chọn đáp án đúng", icon: "A", bg: "bg-green-50" },
          { title: "Kéo thả đáp án", desc: "Kéo thả để hoàn thành", icon: "👆", bg: "bg-orange-50" },
          { title: "Giải toán có lời văn", desc: "Rèn tư duy logic", icon: "📝", bg: "bg-yellow-50" },
          { title: "Thử thách nhanh", desc: "Trả lời trong thời gian ngắn", icon: "⏱️", bg: "bg-indigo-50" }
        ]
      },

      // ==========================================
      // 3. MÔN TIẾNG ANH
      // ==========================================
      "SUBJECT_TA": {
        header: {
          title: "Tiếng Anh – Lớp 2",
          subtitle: "Học tiếng Anh thật vui – Nghe, nói, đọc, viết mỗi ngày!",
          greeting: "Hello, Minh Anh! 👋",
          greetingSub: "Hôm nay chúng ta cùng học tiếng Anh nào!",
          progress: 60,
          completedStr: "18 / 36 bài",
          theme: { primary: "indigo", bg: "bg-indigo-100", text: "text-indigo-700", border: "border-indigo-200", btn: "bg-indigo-600", accent: "bg-indigo-500" }
        },
        sidebar: {
          activeTopic: "Chủ đề 1: My school",
          lessons: [
            { id: 1, title: "Lesson 1: Classroom objects", desc: "Từ vựng: book, pencil...", status: "completed", icon: "🎒" },
            { id: 2, title: "Lesson 2: My classroom", desc: "Hội thoại cơ bản", status: "completed", icon: "🏫" },
            { id: 3, title: "Lesson 3: Colors", desc: "Từ vựng: red, blue...", status: "completed", icon: "🎨" },
            { id: 4, title: "Lesson 4: Numbers (1-10)", desc: "Từ vựng: one, two...", status: "active", icon: "🔢" },
            { id: 5, title: "Lesson 5: Review 1", desc: "Ôn tập chủ đề 1", status: "locked", icon: "📝" }
          ]
        },
        taskGrid: [
          { title: "Từ vựng", desc: "Học từ mới qua hình ảnh", icon: "📚", bg: "bg-blue-50" },
          { title: "Nghe - Nói", desc: "Nghe và nhắc lại", icon: "🎧", bg: "bg-indigo-50" },
          { title: "Đọc hiểu", desc: "Đọc và chọn đáp án", icon: "A", bg: "bg-green-50" },
          { title: "Điền vào chỗ trống", desc: "Điền từ còn thiếu", icon: "✍️", bg: "bg-orange-50" },
          { title: "Sắp xếp câu", desc: "Sắp xếp thành câu", icon: "🧩", bg: "bg-yellow-50" },
          { title: "Trò chơi", desc: "Học mà chơi", icon: "🎮", bg: "bg-purple-50" }
        ]
      },

      // ==========================================
      // 4. MÔN KHOA HỌC
      // ==========================================
      "SUBJECT_KH": {
        header: {
          title: "Khoa học – Lớp 2",
          subtitle: "Khám phá thế giới quanh ta – Hiểu biết để bảo vệ thiên nhiên!",
          greeting: "Chào Minh Anh! 👋",
          greetingSub: "Hôm nay chúng ta cùng khám phá khoa học nhé!",
          progress: 62,
          completedStr: "16 / 30 bài",
          theme: { primary: "teal", bg: "bg-teal-100", text: "text-teal-700", border: "border-teal-200", btn: "bg-teal-600", accent: "bg-teal-500" }
        },
        sidebar: {
          activeTopic: "Chủ đề 1: Cơ thể người",
          lessons: [
            { id: 1, title: "Bài 1: Các bộ phận bên ngoài", desc: "Nhận biết và gọi tên", status: "completed", icon: "✋" },
            { id: 2, title: "Bài 2: Giữ vệ sinh cơ thể", desc: "Vì sao cần giữ vệ sinh?", status: "completed", icon: "🧼" },
            { id: 3, title: "Bài 3: Phòng tránh bệnh tật", desc: "Một số bệnh thường gặp", status: "completed", icon: "🛡️" },
            { id: 4, title: "Bài 4: Thực vật và động vật", desc: "Nhận biết sự đa dạng", status: "active", icon: "🦌" },
            { id: 5, title: "Bài 5: Môi trường sống", desc: "Nơi sống và nhu cầu", status: "locked", icon: "🌍" }
          ]
        },
        taskGrid: [
          { title: "Khám phá kiến thức", desc: "Đọc, xem tranh và video", icon: "📖", bg: "bg-blue-50" },
          { title: "Thí nghiệm ảo", desc: "Thực hành khoa học", icon: "🧪", bg: "bg-teal-50" },
          { title: "Câu hỏi", desc: "Trắc nghiệm, đúng/sai", icon: "❓", bg: "bg-purple-50" },
          { title: "Điền vào chỗ trống", desc: "Hoàn thành kiến thức", icon: "📝", bg: "bg-orange-50" },
          { title: "Ghép đôi", desc: "Rèn luyện ghi nhớ", icon: "🧩", bg: "bg-green-50" },
          { title: "Tình huống", desc: "Vận dụng vào đời sống", icon: "🌍", bg: "bg-yellow-50" }
        ]
      }
    };

    // Fallback nếu gọi mã môn chưa được thiết lập chi tiết
    var subjectData = dbMock[subjectId] || dbMock["SUBJECT_TV"];

    // 3. Dữ liệu Widget dùng chung
    subjectData.widgets = {
      dailyGoals: [
        { task: "Học 1 bài mới", done: true },
        { task: "Làm bài tập cuối ngày", done: true },
        { task: "Xem 1 video hướng dẫn", done: false },
        { task: "Trả lời 5 câu hỏi", done: false }
      ],
      streak: 5,
      fact: "Cây xanh giúp lọc không khí và mang lại oxy cho chúng ta."
    };

    return ApiResponse.success(subjectData, "Tải dữ liệu môn học thành công.");
  } catch (e) {
    AuditLogger.log(payload && payload.token ? "Student" : "Unknown", "GET_SUBJECT_DETAIL_ERROR", "LEARNING", { error: e.toString() });
    return ApiResponse.error("Lỗi khi tải dữ liệu môn học.", e.toString(), "ERR_SYSTEM");
  }
}


================================================
FILE: API_SystemConfig.gs
================================================
/**
 * API_SystemConfig.gs
 * XỬ LÝ CẤU HÌNH HỆ THỐNG VÀ DANH MỤC ĐỘNG (THIET_LAP & DANH_MUC)
 * Tuân thủ Master GAS OS V8.1 Playbooks [FILE 1 - Mục 5.1 & FILE 4 - Service 07]
 */

/**
 * Lấy cấu hình hệ thống từ Sheet Thiet_Lap (Sử dụng CacheManager)
 * Cache dữ liệu trong 6 giờ để tăng tốc độ tải ứng dụng
 */
function api_getSystemSettings() {
  try {
    var cacheKey = "SYSTEM_SETTINGS_CACHE";
    var cachedSettings = CacheManager.get(cacheKey);

    if (cachedSettings) {
      return ApiResponse.success(cachedSettings, "Tải cấu hình từ Cache thành công.");
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Thiet_Lap");
    if (!sheet) {
      return ApiResponse.error("Sheet Thiet_Lap chưa tồn tại.", "", "ERR_NOT_FOUND");
    }

    var rawData = sheet.getDataRange().getValues();
    var configObjects = Utils_System.sheetValuesToObjects(rawData);
    rawData = null;

    var configMap = {};
    for (var i = 0; i < configObjects.length; i++) {
      var item = configObjects[i];
      if (item.key) {
        configMap[item.key] = item.value;
      }
    }

    // Lưu vào bộ nhớ đệm
    CacheManager.set(cacheKey, configMap, 21600);

    return ApiResponse.success(configMap, "Tải cấu hình hệ thống thành công.");
  } catch (e) {
    return ApiResponse.error("Lỗi khi tải cấu hình hệ thống.", e.toString(), "ERR_SYSTEM");
  }
}

/**
 * Lấy danh sách Dropdown danh mục động cho Frontend từ Sheet Danh_Muc
 * @param {Object} payload - { categoryType: "Môn học" } (Tùy chọn)
 */
function api_getCategories(payload) {
  try {
    var categoryType = payload && payload.categoryType ? payload.categoryType : null;
    var cacheKey = "CATEGORIES_CACHE_" + (categoryType || "ALL");
    
    var cachedData = CacheManager.get(cacheKey);
    if (cachedData) {
      return ApiResponse.success(cachedData, "Tải danh mục từ Cache.");
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Danh_Muc");
    if (!sheet) {
      return ApiResponse.error("Sheet Danh_Muc không tồn tại.", "", "ERR_NOT_FOUND");
    }

    var rawData = sheet.getDataRange().getValues();
    var allCategories = Utils_System.sheetValuesToObjects(rawData);
    rawData = null;

    var filteredList = [];
    for (var i = 0; i < allCategories.length; i++) {
      var cat = allCategories[i];
      if (cat.isActive === true || cat.isActive === "TRUE" || cat.isActive === "Active") {
        if (!categoryType || cat.categoryType === categoryType) {
          filteredList.push(cat);
        }
      }
    }

    // Cache kết quả trong 6 giờ
    CacheManager.set(cacheKey, filteredList, 21600);

    return ApiResponse.success(filteredList, "Tải danh sách danh mục thành công.");
  } catch (e) {
    return ApiResponse.error("Lỗi khi truy xuất danh mục.", e.toString(), "ERR_SYSTEM");
  }
}

/**
 * Làm mới (Clear) Cache của Cấu hình và Danh mục khi Admin cập nhật dữ liệu gốc
 * @param {Object} payload - { token: "..." }
 */
function api_refreshSystemCache(payload) {
  try {
    var authCheck = internal_verifyToken(payload ? payload.token : null, "Admin");
    if (!authCheck.isValid) {
      return ApiResponse.error(authCheck.message, "", "ERR_UNAUTHORIZED");
    }

    CacheManager.invalidate("SYSTEM_SETTINGS_CACHE");
    CacheManager.invalidate("CATEGORIES_CACHE_ALL");

    AuditLogger.log(authCheck.user.email, "REFRESH_CACHE", "SYSTEM", { status: "Cache Invalidated" });

    return ApiResponse.success(null, "Đã làm mới bộ nhớ đệm hệ thống thành công!");
  } catch (e) {
    return ApiResponse.error("Lỗi khi xóa Cache.", e.toString(), "ERR_SYSTEM");
  }
}


================================================
FILE: API_Tasks.gs
================================================
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


================================================
FILE: App_Data_Adapter_V3.gs
================================================
/**
 * ================================================================
 * KIDLEARN V3 - APP DATA ADAPTER
 * Step: 3I.2
 * Version: 3.1.0
 * ================================================================
 *
 * Adapter này là lớp đọc dữ liệu V3 cho App DEV.
 *
 * KHÔNG sửa PROD.
 * KHÔNG ghi dữ liệu.
 * KHÔNG xóa dữ liệu.
 * KHÔNG migration dữ liệu.
 */


var KIDLEARN_V3_ADAPTER_CONFIG = {
  DEFAULT_LIMIT: 5000,
  SAMPLE_LIMIT: 20
};


/**
 * Preview adapter V3.
 */
function kidlearnV3_previewAppDataAdapterV3() {
  var database =
    kidlearnV3_adapterGetDatabase_();

  var subjects =
    kidlearnV3_adapterGetSubjectsV3();

  var users =
    kidlearnV3_adapterGetUsersV3();

  var children =
    kidlearnV3_adapterGetChildrenV3();

  var assignments =
    kidlearnV3_adapterGetAssignmentsV3();

  var config =
    kidlearnV3_adapterGetConfigMapV3();

  var result = {
    success: true,
    action: 'PREVIEW_APP_DATA_ADAPTER_V3',
    databaseSpreadsheetId: database.spreadsheetId,
    databaseSpreadsheetName: database.spreadsheet.getName(),
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    counts: {
      subjects: subjects.length,
      users: users.length,
      children: children.length,
      assignments: assignments.length,
      configKeys: Object.keys(config).length
    },
    availableFunctions: [
      'kidlearnV3_adapterGetBootstrapPayloadV3',
      'kidlearnV3_adapterGetDashboardPayloadV3',
      'kidlearnV3_adapterGetSubjectsV3',
      'kidlearnV3_adapterGetUsersV3',
      'kidlearnV3_adapterGetChildrenV3',
      'kidlearnV3_adapterGetAssignmentsForChildV3',
      'kidlearnV3_adapterReadSheetV3',
      'kidlearnV3_adapterFindByIdV3'
    ]
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Smoke test App Data Adapter V3.
 */
function kidlearnV3_smokeTestAppDataAdapterV3() {
  var bootstrap =
    kidlearnV3_adapterGetBootstrapPayloadV3();

  var errors = [];
  var warnings = [];

  if (bootstrap.subjects.length < 4) {
    errors.push(
      'Adapter phải đọc được ít nhất 4 môn học.'
    );
  }

  if (bootstrap.children.length < 1) {
    errors.push(
      'Adapter chưa đọc được dữ liệu DATA_Children.'
    );
  }

  if (bootstrap.users.length < 1) {
    errors.push(
      'Adapter chưa đọc được dữ liệu DATA_Users.'
    );
  }

  if (bootstrap.assignments.length < 1) {
    warnings.push(
      'DATA_Assignments chưa có dữ liệu hoặc chưa có bài giao cho child hiện tại.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_APP_DATA_ADAPTER_V3',
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    counts: bootstrap.counts,
    selectedChild: bootstrap.selectedChild,
    dashboard: bootstrap.dashboard
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test App Data Adapter V3 chưa đạt. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Payload khởi tạo cho App DEV.
 */
function kidlearnV3_adapterGetBootstrapPayloadV3() {
  var config =
    kidlearnV3_adapterGetConfigMapV3();

  var subjects =
    kidlearnV3_adapterGetSubjectsV3();

  var users =
    kidlearnV3_adapterGetUsersV3();

  var children =
    kidlearnV3_adapterGetChildrenV3();

  var access =
    kidlearnV3_adapterGetUserChildAccessV3();

  var selectedChild =
    kidlearnV3_adapterPickDefaultChild_(
      children
    );

  var selectedChildId =
    selectedChild
      ? selectedChild.childId
      : '';

  var assignments =
    kidlearnV3_adapterGetAssignmentsForChildV3(
      selectedChildId
    );

  var dashboard =
    kidlearnV3_adapterBuildDashboard_(
      selectedChild,
      subjects,
      assignments
    );

  var result = {
    success: true,
    databaseMode: 'V3',
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    appVersion: KIDLEARN_V3.APP_VERSION,
    config: config,
    subjects: subjects,
    users: users,
    children: children,
    access: access,
    selectedChild: selectedChild,
    assignments: assignments,
    dashboard: dashboard,
    counts: {
      subjects: subjects.length,
      users: users.length,
      children: children.length,
      access: access.length,
      assignments: assignments.length,
      configKeys: Object.keys(config).length
    }
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Payload dashboard theo childId.
 */
function kidlearnV3_adapterGetDashboardPayloadV3(
  childId
) {
  var subjects =
    kidlearnV3_adapterGetSubjectsV3();

  var children =
    kidlearnV3_adapterGetChildrenV3();

  var selectedChild =
    kidlearnV3_adapterFindChild_(
      children,
      childId
    );

  if (!selectedChild) {
    selectedChild =
      kidlearnV3_adapterPickDefaultChild_(
        children
      );
  }

  var selectedChildId =
    selectedChild
      ? selectedChild.childId
      : '';

  var assignments =
    kidlearnV3_adapterGetAssignmentsForChildV3(
      selectedChildId
    );

  var dashboard =
    kidlearnV3_adapterBuildDashboard_(
      selectedChild,
      subjects,
      assignments
    );

  var result = {
    success: true,
    childId: selectedChildId,
    selectedChild: selectedChild,
    subjects: subjects,
    assignments: assignments,
    dashboard: dashboard
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Lấy danh sách môn học.
 */
function kidlearnV3_adapterGetSubjectsV3() {
  var rows =
    kidlearnV3_adapterReadRows_(
      'MST_Subjects',
      KIDLEARN_V3_ADAPTER_CONFIG.DEFAULT_LIMIT
    );

  rows =
    kidlearnV3_adapterFilterVisibleRows_(
      rows
    );

  rows =
    kidlearnV3_adapterSortByNumberField_(
      rows,
      'sortOrder'
    );

  var result = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    result.push(
      kidlearnV3_adapterNormalizeSubject_(
        rows[i]
      )
    );
  }

  return result;
}


/**
 * Lấy danh sách user an toàn, không trả credential.
 */
function kidlearnV3_adapterGetUsersV3() {
  var rows =
    kidlearnV3_adapterReadRows_(
      'DATA_Users',
      KIDLEARN_V3_ADAPTER_CONFIG.DEFAULT_LIMIT
    );

  rows =
    kidlearnV3_adapterFilterVisibleRows_(
      rows
    );

  var result = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    result.push(
      kidlearnV3_adapterNormalizeUser_(
        rows[i]
      )
    );
  }

  return result;
}


/**
 * Lấy danh sách trẻ em.
 */
function kidlearnV3_adapterGetChildrenV3() {
  var rows =
    kidlearnV3_adapterReadRows_(
      'DATA_Children',
      KIDLEARN_V3_ADAPTER_CONFIG.DEFAULT_LIMIT
    );

  rows =
    kidlearnV3_adapterFilterVisibleRows_(
      rows
    );

  var result = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    result.push(
      kidlearnV3_adapterNormalizeChild_(
        rows[i]
      )
    );
  }

  return result;
}


/**
 * Lấy quyền truy cập User - Child.
 */
function kidlearnV3_adapterGetUserChildAccessV3() {
  var rows =
    kidlearnV3_adapterReadRows_(
      'DATA_UserChildAccess',
      KIDLEARN_V3_ADAPTER_CONFIG.DEFAULT_LIMIT
    );

  rows =
    kidlearnV3_adapterFilterVisibleRows_(
      rows
    );

  var result = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    result.push(
      kidlearnV3_adapterNormalizeAccess_(
        rows[i]
      )
    );
  }

  return result;
}


/**
 * Lấy toàn bộ assignments.
 */
function kidlearnV3_adapterGetAssignmentsV3() {
  var rows =
    kidlearnV3_adapterReadRows_(
      'DATA_Assignments',
      KIDLEARN_V3_ADAPTER_CONFIG.DEFAULT_LIMIT
    );

  var result = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    result.push(
      kidlearnV3_adapterNormalizeAssignment_(
        rows[i]
      )
    );
  }

  return result;
}


/**
 * Lấy assignments theo childId.
 */
function kidlearnV3_adapterGetAssignmentsForChildV3(
  childId
) {
  var rows =
    kidlearnV3_adapterGetAssignmentsV3();

  var result = [];
  var selectedChildId =
    String(childId || '').trim();

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    if (
      selectedChildId !== '' &&
      String(rows[i].childId || '') !== selectedChildId
    ) {
      continue;
    }

    if (
      kidlearnV3_adapterIsHiddenStatus_(
        rows[i].status
      )
    ) {
      continue;
    }

    result.push(rows[i]);
  }

  return kidlearnV3_adapterSortAssignments_(
    result
  );
}


/**
 * Lấy context family theo userId.
 */
function kidlearnV3_adapterGetFamilyContextV3(
  userId
) {
  var users =
    kidlearnV3_adapterGetUsersV3();

  var children =
    kidlearnV3_adapterGetChildrenV3();

  var access =
    kidlearnV3_adapterGetUserChildAccessV3();

  var currentUser =
    kidlearnV3_adapterFindUser_(
      users,
      userId
    );

  if (!currentUser) {
    currentUser =
      kidlearnV3_adapterPickDefaultUser_(
        users
      );
  }

  var visibleChildren =
    kidlearnV3_adapterChildrenForUser_(
      children,
      access,
      currentUser
    );

  return {
    success: true,
    currentUser: currentUser,
    children: visibleChildren,
    access: access
  };
}


/**
 * Lấy config map.
 */
function kidlearnV3_adapterGetConfigMapV3() {
  var rows =
    kidlearnV3_adapterReadRows_(
      'SYS_Config',
      KIDLEARN_V3_ADAPTER_CONFIG.DEFAULT_LIMIT
    );

  var map = {};

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    var key =
      kidlearnV3_adapterString_(
        rows[i],
        [
          'configKey'
        ],
        ''
      );

    if (key === '') {
      continue;
    }

    var rawValue =
      kidlearnV3_adapterString_(
        rows[i],
        [
          'configValue'
        ],
        ''
      );

    var valueType =
      kidlearnV3_adapterString_(
        rows[i],
        [
          'valueType',
          'configType'
        ],
        'STRING'
      );

    map[key] =
      kidlearnV3_adapterParseConfigValue_(
        rawValue,
        valueType
      );
  }

  return map;
}


/**
 * Generic read API cho UI DEV.
 */
function kidlearnV3_adapterReadSheetV3(
  sheetName,
  options
) {
  var safeOptions =
    options || {};

  var limit =
    Number(
      safeOptions.limit ||
      KIDLEARN_V3_ADAPTER_CONFIG.DEFAULT_LIMIT
    );

  var rows =
    kidlearnV3_adapterReadRows_(
      sheetName,
      limit
    );

  if (safeOptions.activeOnly === true) {
    rows =
      kidlearnV3_adapterFilterVisibleRows_(
        rows
      );
  }

  if (safeOptions.status) {
    rows =
      kidlearnV3_adapterFilterByStatus_(
        rows,
        safeOptions.status
      );
  }

  var result = {
    success: true,
    sheetName: sheetName,
    count: rows.length,
    rows: rows
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Generic find by id/key.
 */
function kidlearnV3_adapterFindByIdV3(
  sheetName,
  key,
  value
) {
  var rows =
    kidlearnV3_adapterReadRows_(
      sheetName,
      KIDLEARN_V3_ADAPTER_CONFIG.DEFAULT_LIMIT
    );

  var expected =
    String(value || '').trim();

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    if (
      String(rows[i][key] || '').trim() === expected
    ) {
      return {
        success: true,
        found: true,
        sheetName: sheetName,
        key: key,
        value: value,
        row: rows[i]
      };
    }
  }

  return {
    success: true,
    found: false,
    sheetName: sheetName,
    key: key,
    value: value,
    row: null
  };
}


/**
 * Lấy database runtime từ 3I.1.
 */
function kidlearnV3_adapterGetDatabase_() {
  if (
    typeof kidlearnV3_appGetActiveDatabaseV3_ !== 'function'
  ) {
    throw new Error(
      'Thiếu 3I.1: kidlearnV3_appGetActiveDatabaseV3_ chưa tồn tại.'
    );
  }

  return kidlearnV3_appGetActiveDatabaseV3_();
}


/**
 * Đọc rows từ một Sheet V3.
 */
function kidlearnV3_adapterReadRows_(
  sheetName,
  limit
) {
  var database =
    kidlearnV3_adapterGetDatabase_();

  return kidlearnV3_appReadSheetObjectsFromDb_(
    database.spreadsheet,
    database.schema,
    sheetName,
    limit || KIDLEARN_V3_ADAPTER_CONFIG.DEFAULT_LIMIT
  );
}


/**
 * Normalize subject.
 */
function kidlearnV3_adapterNormalizeSubject_(
  row
) {
  return {
    subjectId:
      kidlearnV3_adapterString_(
        row,
        ['subjectId'],
        ''
      ),
    subjectCode:
      kidlearnV3_adapterString_(
        row,
        ['subjectCode'],
        ''
      ),
    subjectName:
      kidlearnV3_adapterString_(
        row,
        ['subjectName'],
        ''
      ),
    description:
      kidlearnV3_adapterString_(
        row,
        ['description'],
        ''
      ),
    icon:
      kidlearnV3_adapterString_(
        row,
        ['icon'],
        ''
      ),
    themeKey:
      kidlearnV3_adapterString_(
        row,
        ['themeKey'],
        ''
      ),
    primaryColor:
      kidlearnV3_adapterString_(
        row,
        ['primaryColor'],
        ''
      ),
    accentColor:
      kidlearnV3_adapterString_(
        row,
        ['accentColor'],
        ''
      ),
    sortOrder:
      kidlearnV3_adapterNumber_(
        row,
        ['sortOrder'],
        999
      ),
    status:
      kidlearnV3_adapterString_(
        row,
        ['status'],
        ''
      )
  };
}


/**
 * Normalize user, không trả credential.
 */
function kidlearnV3_adapterNormalizeUser_(
  row
) {
  var role =
    kidlearnV3_adapterString_(
      row,
      ['role', 'userRole'],
      ''
    );

  return {
    userId:
      kidlearnV3_adapterString_(
        row,
        ['userId'],
        ''
      ),
    username:
      kidlearnV3_adapterString_(
        row,
        ['username'],
        ''
      ),
    email:
      kidlearnV3_adapterString_(
        row,
        ['email'],
        ''
      ),
    displayName:
      kidlearnV3_adapterString_(
        row,
        ['displayName', 'fullName'],
        ''
      ),
    fullName:
      kidlearnV3_adapterString_(
        row,
        ['fullName', 'displayName'],
        ''
      ),
    role: role,
    userRole: role,
    status:
      kidlearnV3_adapterString_(
        row,
        ['status'],
        ''
      )
  };
}


/**
 * Normalize child.
 */
function kidlearnV3_adapterNormalizeChild_(
  row
) {
  var name =
    kidlearnV3_adapterString_(
      row,
      ['childName', 'displayName', 'nickname'],
      ''
    );

  return {
    childId:
      kidlearnV3_adapterString_(
        row,
        ['childId'],
        ''
      ),
    childName: name,
    displayName:
      kidlearnV3_adapterString_(
        row,
        ['displayName', 'childName'],
        name
      ),
    nickname:
      kidlearnV3_adapterString_(
        row,
        ['nickname'],
        ''
      ),
    gradeLevel:
      kidlearnV3_adapterNumber_(
        row,
        ['gradeLevel'],
        2
      ),
    status:
      kidlearnV3_adapterString_(
        row,
        ['status'],
        ''
      )
  };
}


/**
 * Normalize user-child access.
 */
function kidlearnV3_adapterNormalizeAccess_(
  row
) {
  var accessId =
    kidlearnV3_adapterString_(
      row,
      [
        'userChildAccessId',
        'accessId'
      ],
      ''
    );

  var role =
    kidlearnV3_adapterString_(
      row,
      [
        'role',
        'accessRole'
      ],
      ''
    );

  return {
    accessId: accessId,
    userChildAccessId: accessId,
    userId:
      kidlearnV3_adapterString_(
        row,
        ['userId'],
        ''
      ),
    childId:
      kidlearnV3_adapterString_(
        row,
        ['childId'],
        ''
      ),
    role: role,
    accessRole: role,
    isPrimary:
      kidlearnV3_adapterBoolean_(
        row,
        ['isPrimary'],
        false
      ),
    status:
      kidlearnV3_adapterString_(
        row,
        ['status'],
        ''
      )
  };
}


/**
 * Normalize assignment.
 */
function kidlearnV3_adapterNormalizeAssignment_(
  row
) {
  return {
    assignmentId:
      kidlearnV3_adapterString_(
        row,
        ['assignmentId'],
        ''
      ),
    childId:
      kidlearnV3_adapterString_(
        row,
        ['childId'],
        ''
      ),
    assignmentType:
      kidlearnV3_adapterString_(
        row,
        ['assignmentType'],
        ''
      ),
    title:
      kidlearnV3_adapterString_(
        row,
        ['title'],
        ''
      ),
    description:
      kidlearnV3_adapterString_(
        row,
        ['description'],
        ''
      ),
    sourceType:
      kidlearnV3_adapterString_(
        row,
        ['sourceType'],
        ''
      ),
    sourceId:
      kidlearnV3_adapterString_(
        row,
        ['sourceId'],
        ''
      ),
    priority:
      kidlearnV3_adapterString_(
        row,
        ['priority'],
        'NORMAL'
      ),
    status:
      kidlearnV3_adapterString_(
        row,
        ['status'],
        ''
      ),
    progressPercent:
      kidlearnV3_adapterNumber_(
        row,
        ['progressPercent'],
        0
      ),
    isRequired:
      kidlearnV3_adapterBoolean_(
        row,
        ['isRequired'],
        false
      ),
    assignedAt:
      kidlearnV3_adapterDateText_(
        row,
        ['assignedAt', 'createdAt']
      ),
    dueAt:
      kidlearnV3_adapterDateText_(
        row,
        ['dueAt', 'dueDate']
      ),
    updatedAt:
      kidlearnV3_adapterDateText_(
        row,
        ['updatedAt']
      )
  };
}


/**
 * Build dashboard đơn giản cho App DEV.
 */
function kidlearnV3_adapterBuildDashboard_(
  selectedChild,
  subjects,
  assignments
) {
  var completed = 0;
  var active = 0;
  var overdue = 0;
  var cancelled = 0;

  for (
    var i = 0;
    i < assignments.length;
    i++
  ) {
    var status =
      String(assignments[i].status || '')
        .toUpperCase();

    if (status === 'COMPLETED') {
      completed++;
      continue;
    }

    if (status === 'OVERDUE') {
      overdue++;
      continue;
    }

    if (
      status === 'CANCELLED' ||
      status === 'ARCHIVED' ||
      status === 'DELETED'
    ) {
      cancelled++;
      continue;
    }

    active++;
  }

  var total =
    assignments.length;

  var completionPercent =
    total > 0
      ? Math.round((completed / total) * 100)
      : 0;

  return {
    childId:
      selectedChild
        ? selectedChild.childId
        : '',
    childName:
      selectedChild
        ? selectedChild.displayName
        : '',
    gradeLevel:
      selectedChild
        ? selectedChild.gradeLevel
        : '',
    subjectCount:
      subjects.length,
    assignmentCount:
      total,
    activeAssignmentCount:
      active,
    completedAssignmentCount:
      completed,
    overdueAssignmentCount:
      overdue,
    cancelledAssignmentCount:
      cancelled,
    completionPercent:
      completionPercent,
    latestAssignments:
      kidlearnV3_adapterTake_(
        assignments,
        10
      )
  };
}


/**
 * Tìm child theo ID.
 */
function kidlearnV3_adapterFindChild_(
  children,
  childId
) {
  var expected =
    String(childId || '').trim();

  if (expected === '') {
    return null;
  }

  for (
    var i = 0;
    i < children.length;
    i++
  ) {
    if (
      String(children[i].childId || '') === expected
    ) {
      return children[i];
    }
  }

  return null;
}


/**
 * Tìm user theo ID.
 */
function kidlearnV3_adapterFindUser_(
  users,
  userId
) {
  var expected =
    String(userId || '').trim();

  if (expected === '') {
    return null;
  }

  for (
    var i = 0;
    i < users.length;
    i++
  ) {
    if (
      String(users[i].userId || '') === expected
    ) {
      return users[i];
    }
  }

  return null;
}


/**
 * Chọn child mặc định.
 */
function kidlearnV3_adapterPickDefaultChild_(
  children
) {
  if (
    !children ||
    children.length === 0
  ) {
    return null;
  }

  return children[0];
}


/**
 * Chọn user mặc định.
 */
function kidlearnV3_adapterPickDefaultUser_(
  users
) {
  if (
    !users ||
    users.length === 0
  ) {
    return null;
  }

  for (
    var i = 0;
    i < users.length;
    i++
  ) {
    var role =
      String(users[i].role || '')
        .toUpperCase();

    if (role === 'FAMILY_ADMIN') {
      return users[i];
    }
  }

  return users[0];
}


/**
 * Lọc children theo quyền user.
 */
function kidlearnV3_adapterChildrenForUser_(
  children,
  access,
  currentUser
) {
  if (!currentUser) {
    return children;
  }

  var userId =
    String(currentUser.userId || '').trim();

  if (userId === '') {
    return children;
  }

  var allowed = {};

  for (
    var i = 0;
    i < access.length;
    i++
  ) {
    if (
      String(access[i].userId || '') === userId
    ) {
      allowed[String(access[i].childId || '')] = true;
    }
  }

  var result = [];

  for (
    var c = 0;
    c < children.length;
    c++
  ) {
    if (
      allowed[String(children[c].childId || '')]
    ) {
      result.push(children[c]);
    }
  }

  if (result.length === 0) {
    return children;
  }

  return result;
}


/**
 * Filter visible rows.
 */
function kidlearnV3_adapterFilterVisibleRows_(
  rows
) {
  var result = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    var status =
      kidlearnV3_adapterString_(
        rows[i],
        ['status'],
        ''
      );

    if (
      kidlearnV3_adapterIsHiddenStatus_(
        status
      )
    ) {
      continue;
    }

    result.push(rows[i]);
  }

  return result;
}


/**
 * Filter status.
 */
function kidlearnV3_adapterFilterByStatus_(
  rows,
  status
) {
  var expected =
    String(status || '').toUpperCase();

  var result = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    var actual =
      String(rows[i].status || '')
        .toUpperCase();

    if (actual === expected) {
      result.push(rows[i]);
    }
  }

  return result;
}


/**
 * Hidden status.
 */
function kidlearnV3_adapterIsHiddenStatus_(
  status
) {
  var value =
    String(status || '')
      .toUpperCase();

  return (
    value === 'INACTIVE' ||
    value === 'DELETED' ||
    value === 'ARCHIVED'
  );
}


/**
 * Sort theo number field.
 */
function kidlearnV3_adapterSortByNumberField_(
  rows,
  field
) {
  rows.sort(function(a, b) {
    var av =
      Number(a[field] || 999999);

    var bv =
      Number(b[field] || 999999);

    return av - bv;
  });

  return rows;
}


/**
 * Sort assignments.
 */
function kidlearnV3_adapterSortAssignments_(
  rows
) {
  rows.sort(function(a, b) {
    var ap =
      kidlearnV3_adapterPriorityWeight_(
        a.priority
      );

    var bp =
      kidlearnV3_adapterPriorityWeight_(
        b.priority
      );

    if (ap !== bp) {
      return bp - ap;
    }

    return String(b.assignedAt || '')
      .localeCompare(
        String(a.assignedAt || '')
      );
  });

  return rows;
}


/**
 * Priority weight.
 */
function kidlearnV3_adapterPriorityWeight_(
  priority
) {
  var value =
    String(priority || '')
      .toUpperCase();

  if (value === 'URGENT') {
    return 4;
  }

  if (value === 'HIGH') {
    return 3;
  }

  if (value === 'NORMAL') {
    return 2;
  }

  if (value === 'LOW') {
    return 1;
  }

  return 0;
}


/**
 * Lấy string từ row theo nhiều key.
 */
function kidlearnV3_adapterString_(
  row,
  keys,
  fallback
) {
  for (
    var i = 0;
    i < keys.length;
    i++
  ) {
    var key =
      keys[i];

    if (
      row[key] !== undefined &&
      row[key] !== null &&
      String(row[key]).trim() !== ''
    ) {
      return String(row[key]).trim();
    }
  }

  return fallback || '';
}


/**
 * Lấy number từ row.
 */
function kidlearnV3_adapterNumber_(
  row,
  keys,
  fallback
) {
  var text =
    kidlearnV3_adapterString_(
      row,
      keys,
      ''
    );

  if (text === '') {
    return fallback;
  }

  var number =
    Number(text);

  if (isNaN(number)) {
    return fallback;
  }

  return number;
}


/**
 * Lấy boolean từ row.
 */
function kidlearnV3_adapterBoolean_(
  row,
  keys,
  fallback
) {
  for (
    var i = 0;
    i < keys.length;
    i++
  ) {
    var value =
      row[keys[i]];

    if (value === true) {
      return true;
    }

    if (value === false) {
      return false;
    }

    var text =
      String(value || '')
        .trim()
        .toUpperCase();

    if (
      text === 'TRUE' ||
      text === 'YES' ||
      text === '1'
    ) {
      return true;
    }

    if (
      text === 'FALSE' ||
      text === 'NO' ||
      text === '0'
    ) {
      return false;
    }
  }

  return fallback === true;
}


/**
 * Date text safe.
 */
function kidlearnV3_adapterDateText_(
  row,
  keys
) {
  for (
    var i = 0;
    i < keys.length;
    i++
  ) {
    var value =
      row[keys[i]];

    if (!value) {
      continue;
    }

    if (
      Object.prototype.toString.call(value) === '[object Date]'
    ) {
      return Utilities.formatDate(
        value,
        Session.getScriptTimeZone(),
        'yyyy-MM-dd HH:mm:ss'
      );
    }

    var text =
      String(value).trim();

    if (text !== '') {
      return text;
    }
  }

  return '';
}


/**
 * Parse config value theo type.
 */
function kidlearnV3_adapterParseConfigValue_(
  rawValue,
  valueType
) {
  var type =
    String(valueType || 'STRING')
      .toUpperCase();

  if (type === 'NUMBER') {
    var number =
      Number(rawValue);

    if (!isNaN(number)) {
      return number;
    }

    return 0;
  }

  if (type === 'BOOLEAN') {
    var text =
      String(rawValue || '')
        .toUpperCase();

    return (
      text === 'TRUE' ||
      text === 'YES' ||
      text === '1'
    );
  }

  if (type === 'JSON') {
    try {
      return JSON.parse(
        String(rawValue || '{}')
      );
    } catch (error) {
      return {};
    }
  }

  return rawValue;
}


/**
 * Take N items.
 */
function kidlearnV3_adapterTake_(
  rows,
  limit
) {
  var result = [];
  var max =
    Math.min(
      rows.length,
      Number(limit || 10)
    );

  for (
    var i = 0;
    i < max;
    i++
  ) {
    result.push(rows[i]);
  }

  return result;
}


================================================
FILE: App_Dev_Connection_V3.gs
================================================
/**
 * ================================================================
 * KIDLEARN V3 - APP DEV CONNECTION TO DATABASE V3
 * Step: 3I.1
 * Version: 3.1.0
 * ================================================================
 *
 * File này chuẩn bị App DEV kết nối Database V3.
 *
 * KHÔNG sửa PROD.
 * KHÔNG đổi tên Sheet.
 * KHÔNG xóa dữ liệu.
 * KHÔNG migration dữ liệu.
 */


var KIDLEARN_V3_APP_PROPERTY_KEYS = {
  ENVIRONMENT: 'KIDLEARN_APP_ENVIRONMENT',
  DATABASE_MODE: 'KIDLEARN_APP_DATABASE_MODE',
  DATABASE_SPREADSHEET_ID: 'KIDLEARN_APP_DATABASE_SPREADSHEET_ID',
  DATABASE_SPREADSHEET_NAME: 'KIDLEARN_APP_DATABASE_SPREADSHEET_NAME',
  SCHEMA_VERSION: 'KIDLEARN_APP_SCHEMA_VERSION',
  CONNECTION_STATUS: 'KIDLEARN_APP_CONNECTION_STATUS',
  CONNECTED_AT: 'KIDLEARN_APP_CONNECTED_AT',
  LAST_SMOKE_TEST_AT: 'KIDLEARN_APP_LAST_SMOKE_TEST_AT'
};


/**
 * Preview kết nối App DEV với Database V3.
 * Hàm này không ghi ScriptProperties.
 */
function kidlearnV3_previewAppDevConnectionV3() {
  var databaseId =
    kidlearnV3_appResolveDatabaseId_();

  var spreadsheet =
    kidlearnV3_appOpenSpreadsheetById_(
      databaseId
    );

  var schema =
    kidlearnV3_buildSchema_();

  var structure =
    kidlearnV3_appCheckDatabaseStructure_(
      spreadsheet,
      schema
    );

  var minimumData =
    kidlearnV3_appCheckMinimumData_(
      spreadsheet
    );

  var success =
    structure.errorCount === 0 &&
    minimumData.errorCount === 0;

  var result = {
    success: success,
    action: 'PREVIEW_APP_DEV_CONNECTION_V3',
    environment: KIDLEARN_V3.ENVIRONMENT_DEV,
    databaseMode: 'V3',
    databaseSpreadsheetId: databaseId,
    databaseSpreadsheetName: spreadsheet.getName(),
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    appVersion: KIDLEARN_V3.APP_VERSION,
    structure: structure,
    minimumData: minimumData
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Kết nối App DEV với Database V3.
 * Hàm này ghi ScriptProperties để App runtime dùng DB V3.
 */
function kidlearnV3_prepareAppDevConnectionV3() {
  var preview =
    kidlearnV3_previewAppDevConnectionV3();

  if (!preview.success) {
    throw new Error(
      'App DEV chưa thể kết nối Database V3. ' +
      'Structure errors=' +
      preview.structure.errorCount +
      ', data errors=' +
      preview.minimumData.errorCount +
      '. Xem Execution log.'
    );
  }

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperties({
    KIDLEARN_APP_ENVIRONMENT:
      KIDLEARN_V3.ENVIRONMENT_DEV,

    KIDLEARN_APP_DATABASE_MODE:
      'V3',

    KIDLEARN_APP_DATABASE_SPREADSHEET_ID:
      preview.databaseSpreadsheetId,

    KIDLEARN_APP_DATABASE_SPREADSHEET_NAME:
      preview.databaseSpreadsheetName,

    KIDLEARN_APP_SCHEMA_VERSION:
      KIDLEARN_V3.SCHEMA_VERSION,

    KIDLEARN_APP_CONNECTION_STATUS:
      'CONNECTED',

    KIDLEARN_APP_CONNECTED_AT:
      new Date().toISOString()
  }, false);

  var result = {
    success: true,
    action: 'APP_DEV_CONNECTED_TO_DATABASE_V3',
    environment: KIDLEARN_V3.ENVIRONMENT_DEV,
    databaseMode: 'V3',
    databaseSpreadsheetId: preview.databaseSpreadsheetId,
    databaseSpreadsheetName: preview.databaseSpreadsheetName,
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    connectionStatus: 'CONNECTED'
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Xem trạng thái kết nối App DEV hiện tại.
 */
function kidlearnV3_getAppDevConnectionV3Status() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    environment:
      properties.getProperty(
        KIDLEARN_V3_APP_PROPERTY_KEYS.ENVIRONMENT
      ),
    databaseMode:
      properties.getProperty(
        KIDLEARN_V3_APP_PROPERTY_KEYS.DATABASE_MODE
      ),
    databaseSpreadsheetId:
      properties.getProperty(
        KIDLEARN_V3_APP_PROPERTY_KEYS.DATABASE_SPREADSHEET_ID
      ),
    databaseSpreadsheetName:
      properties.getProperty(
        KIDLEARN_V3_APP_PROPERTY_KEYS.DATABASE_SPREADSHEET_NAME
      ),
    schemaVersion:
      properties.getProperty(
        KIDLEARN_V3_APP_PROPERTY_KEYS.SCHEMA_VERSION
      ),
    connectionStatus:
      properties.getProperty(
        KIDLEARN_V3_APP_PROPERTY_KEYS.CONNECTION_STATUS
      ),
    connectedAt:
      properties.getProperty(
        KIDLEARN_V3_APP_PROPERTY_KEYS.CONNECTED_AT
      ),
    lastSmokeTestAt:
      properties.getProperty(
        KIDLEARN_V3_APP_PROPERTY_KEYS.LAST_SMOKE_TEST_AT
      )
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Smoke test đọc dữ liệu V3 giống App runtime.
 */
function kidlearnV3_smokeTestAppDevReadV3() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var subjects =
    kidlearnV3_appReadSheetObjectsFromDb_(
      database.spreadsheet,
      database.schema,
      'MST_Subjects',
      20
    );

  var users =
    kidlearnV3_appReadSheetObjectsFromDb_(
      database.spreadsheet,
      database.schema,
      'DATA_Users',
      10
    );

  var children =
    kidlearnV3_appReadSheetObjectsFromDb_(
      database.spreadsheet,
      database.schema,
      'DATA_Children',
      10
    );

  var assignments =
    kidlearnV3_appReadSheetObjectsFromDb_(
      database.spreadsheet,
      database.schema,
      'DATA_Assignments',
      10
    );

  var config =
    kidlearnV3_appReadSheetObjectsFromDb_(
      database.spreadsheet,
      database.schema,
      'SYS_Config',
      20
    );

  var errors = [];

  if (subjects.length < 4) {
    errors.push(
      'MST_Subjects phải có ít nhất 4 môn học.'
    );
  }

  if (users.length < 1) {
    errors.push(
      'DATA_Users chưa có dữ liệu.'
    );
  }

  if (children.length < 1) {
    errors.push(
      'DATA_Children chưa có dữ liệu.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_APP_DEV_READ_V3',
    databaseSpreadsheetName: database.spreadsheet.getName(),
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    errorCount: errors.length,
    errors: errors,
    counts: {
      MST_Subjects: subjects.length,
      DATA_Users: users.length,
      DATA_Children: children.length,
      DATA_Assignments: assignments.length,
      SYS_Config: config.length
    },
    samples: {
      subjects:
        kidlearnV3_appPickFields_(
          subjects,
          [
            'subjectId',
            'subjectCode',
            'subjectName',
            'status'
          ]
        ),
      users:
        kidlearnV3_appPickFields_(
          users,
          [
            'userId',
            'username',
            'email',
            'displayName',
            'role',
            'userRole',
            'status'
          ]
        ),
      children:
        kidlearnV3_appPickFields_(
          children,
          [
            'childId',
            'childName',
            'displayName',
            'gradeLevel',
            'status'
          ]
        )
    }
  };

  if (result.success) {
    PropertiesService
      .getScriptProperties()
      .setProperty(
        KIDLEARN_V3_APP_PROPERTY_KEYS.LAST_SMOKE_TEST_AT,
        new Date().toISOString()
      );
  }

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test App DEV đọc V3 chưa đạt. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Public helper cho App DEV đọc object từ một Sheet V3.
 * Dùng cho các bước 3I tiếp theo.
 */
function kidlearnV3_appReadSheetObjectsV3(
  sheetName,
  limit
) {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var rows =
    kidlearnV3_appReadSheetObjectsFromDb_(
      database.spreadsheet,
      database.schema,
      sheetName,
      limit || 100
    );

  return rows;
}


/**
 * Resolve database id cho App DEV.
 */
function kidlearnV3_appResolveDatabaseId_() {
  var properties =
    PropertiesService.getScriptProperties();

  var devPropertyKey =
    KIDLEARN_V3.SCRIPT_PROPERTIES.DEV_SPREADSHEET_ID;

  var devDatabaseId =
    properties.getProperty(
      devPropertyKey
    );

  if (devDatabaseId) {
    return devDatabaseId;
  }

  var appDatabaseId =
    properties.getProperty(
      KIDLEARN_V3_APP_PROPERTY_KEYS.DATABASE_SPREADSHEET_ID
    );

  if (appDatabaseId) {
    return appDatabaseId;
  }

  var activeSpreadsheet =
    SpreadsheetApp.getActiveSpreadsheet();

  if (activeSpreadsheet) {
    return activeSpreadsheet.getId();
  }

  throw new Error(
    'Không tìm thấy Database Spreadsheet ID cho App DEV.'
  );
}


/**
 * Open spreadsheet bằng ID.
 */
function kidlearnV3_appOpenSpreadsheetById_(
  spreadsheetId
) {
  if (!spreadsheetId) {
    throw new Error(
      'Spreadsheet ID trống.'
    );
  }

  return SpreadsheetApp.openById(
    spreadsheetId
  );
}


/**
 * Lấy active database V3 cho App runtime.
 */
function kidlearnV3_appGetActiveDatabaseV3_() {
  var databaseId =
    kidlearnV3_appResolveDatabaseId_();

  var spreadsheet =
    kidlearnV3_appOpenSpreadsheetById_(
      databaseId
    );

  var schema =
    kidlearnV3_buildSchema_();

  return {
    spreadsheetId: databaseId,
    spreadsheet: spreadsheet,
    schema: schema
  };
}


/**
 * Kiểm tra cấu trúc 44 Sheet V3 cho App runtime.
 */
function kidlearnV3_appCheckDatabaseStructure_(
  spreadsheet,
  schema
) {
  var errors = [];
  var warnings = [];
  var items = [];

  var spreadsheetName =
    spreadsheet.getName();

  if (
    String(spreadsheetName)
      .toUpperCase()
      .indexOf('DEV') === -1
  ) {
    errors.push(
      'Tên Spreadsheet không chứa DEV: ' +
      spreadsheetName
    );
  }

  for (
    var i = 0;
    i < KIDLEARN_V3_SHEET_ORDER.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_SHEET_ORDER[i];

    var definition =
      schema[sheetName];

    var sheet =
      kidlearnV3_appGetSheetByExactName_(
        spreadsheet,
        sheetName
      );

    if (!definition) {
      errors.push(
        sheetName + ': thiếu schema.'
      );

      items.push({
        order: i + 1,
        sheetName: sheetName,
        status: 'SCHEMA_MISSING'
      });

      continue;
    }

    if (!sheet) {
      errors.push(
        sheetName + ': thiếu Sheet.'
      );

      items.push({
        order: i + 1,
        sheetName: sheetName,
        status: 'SHEET_MISSING'
      });

      continue;
    }

    var headerCheck =
      kidlearnV3_appCheckSheetHeaderKeys_(
        sheet,
        definition
      );

    errors =
      errors.concat(
        headerCheck.errors
      );

    warnings =
      warnings.concat(
        headerCheck.warnings
      );

    items.push({
      order: i + 1,
      sheetName: sheetName,
      status:
        headerCheck.errorCount === 0
          ? 'MATCH'
          : 'HEADER_ERROR',
      columnCount:
        definition.columns.length,
      dataRowCount:
        kidlearnV3_appCountDataRows_(
          sheet
        )
    });
  }

  return {
    success: errors.length === 0,
    targetSheetCount: KIDLEARN_V3_SHEET_ORDER.length,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    items: items
  };
}


/**
 * Kiểm tra row 2 technical keys khớp schema.
 */
function kidlearnV3_appCheckSheetHeaderKeys_(
  sheet,
  definition
) {
  var errors = [];
  var warnings = [];
  var columnCount =
    definition.columns.length;

  var keys =
    sheet
      .getRange(
        2,
        1,
        1,
        columnCount
      )
      .getDisplayValues()[0];

  for (
    var i = 0;
    i < columnCount;
    i++
  ) {
    var expected =
      definition.columns[i].key;

    var actual =
      String(keys[i] || '').trim();

    if (actual !== expected) {
      errors.push(
        sheet.getName() +
        ': key dòng 2 khác schema tại cột ' +
        (i + 1) +
        '. Expected=' +
        expected +
        ', actual=' +
        actual
      );
    }
  }

  return {
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Kiểm tra dữ liệu tối thiểu để App DEV chạy được.
 */
function kidlearnV3_appCheckMinimumData_(
  spreadsheet
) {
  var checks = [
    {
      sheetName: 'SYS_Config',
      minRows: 1,
      level: 'ERROR'
    },
    {
      sheetName: 'SYS_SchemaVersion',
      minRows: 1,
      level: 'ERROR'
    },
    {
      sheetName: 'MST_Subjects',
      minRows: 4,
      level: 'ERROR'
    },
    {
      sheetName: 'DATA_Users',
      minRows: 1,
      level: 'ERROR'
    },
    {
      sheetName: 'DATA_Children',
      minRows: 1,
      level: 'ERROR'
    },
    {
      sheetName: 'DATA_UserChildAccess',
      minRows: 1,
      level: 'WARNING'
    },
    {
      sheetName: 'DATA_Assignments',
      minRows: 1,
      level: 'WARNING'
    },
    {
      sheetName: 'SYS_MigrationLog',
      minRows: 1,
      level: 'WARNING'
    }
  ];

  var errors = [];
  var warnings = [];
  var items = [];

  for (
    var i = 0;
    i < checks.length;
    i++
  ) {
    var check = checks[i];

    var sheet =
      kidlearnV3_appGetSheetByExactName_(
        spreadsheet,
        check.sheetName
      );

    var rowCount =
      sheet
        ? kidlearnV3_appCountDataRows_(sheet)
        : 0;

    var passed =
      rowCount >= check.minRows;

    if (!passed) {
      var message =
        check.sheetName +
        ': cần tối thiểu ' +
        check.minRows +
        ' dòng dữ liệu, hiện có ' +
        rowCount +
        '.';

      if (check.level === 'ERROR') {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    }

    items.push({
      sheetName: check.sheetName,
      minRows: check.minRows,
      actualRows: rowCount,
      level: check.level,
      status: passed ? 'PASS' : 'NOT_ENOUGH_DATA'
    });
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    items: items
  };
}


/**
 * App runtime đọc object từ Sheet V3.
 */
function kidlearnV3_appReadSheetObjectsFromDb_(
  spreadsheet,
  schema,
  sheetName,
  limit
) {
  var definition =
    schema[sheetName];

  if (!definition) {
    throw new Error(
      'Không tìm thấy schema cho Sheet: ' +
      sheetName
    );
  }

  var sheet =
    kidlearnV3_appGetSheetByExactName_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    throw new Error(
      'Không tìm thấy Sheet: ' +
      sheetName
    );
  }

  var lastRow =
    sheet.getLastRow();

  if (lastRow < 3) {
    return [];
  }

  var maxRows =
    Math.max(
      1,
      Number(limit || 100)
    );

  var rowCount =
    Math.min(
      lastRow - 2,
      maxRows
    );

  var columnCount =
    definition.columns.length;

  var values =
    sheet
      .getRange(
        3,
        1,
        rowCount,
        columnCount
      )
      .getValues();

  var displayValues =
    sheet
      .getRange(
        3,
        1,
        rowCount,
        columnCount
      )
      .getDisplayValues();

  var rows = [];

  for (
    var r = 0;
    r < values.length;
    r++
  ) {
    if (
      kidlearnV3_appIsBlankDisplayRow_(
        displayValues[r]
      )
    ) {
      continue;
    }

    var objectRow = {};

    for (
      var c = 0;
      c < definition.columns.length;
      c++
    ) {
      var key =
        definition.columns[c].key;

      objectRow[key] =
        values[r][c];
    }

    objectRow._sheetName =
      sheetName;

    objectRow._rowNumber =
      r + 3;

    rows.push(objectRow);
  }

  return rows;
}


/**
 * Tìm Sheet theo tên chính xác tuyệt đối.
 */
function kidlearnV3_appGetSheetByExactName_(
  spreadsheet,
  exactName
) {
  var sheets =
    spreadsheet.getSheets();

  for (
    var i = 0;
    i < sheets.length;
    i++
  ) {
    if (
      sheets[i].getName() === exactName
    ) {
      return sheets[i];
    }
  }

  return null;
}


/**
 * Đếm dòng dữ liệu từ dòng 3.
 */
function kidlearnV3_appCountDataRows_(
  sheet
) {
  if (!sheet) {
    return 0;
  }

  return Math.max(
    0,
    sheet.getLastRow() - 2
  );
}


/**
 * Kiểm tra row display trống.
 */
function kidlearnV3_appIsBlankDisplayRow_(
  row
) {
  for (
    var i = 0;
    i < row.length;
    i++
  ) {
    if (
      String(row[i] || '').trim() !== ''
    ) {
      return false;
    }
  }

  return true;
}


/**
 * Chỉ lấy các field an toàn để log mẫu.
 */
function kidlearnV3_appPickFields_(
  rows,
  fields
) {
  var result = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    var item = {};

    for (
      var f = 0;
      f < fields.length;
      f++
    ) {
      var field =
        fields[f];

      if (
        rows[i][field] !== undefined &&
        rows[i][field] !== ''
      ) {
        item[field] =
          rows[i][field];
      }
    }

    result.push(item);
  }

  return result;
}


================================================
FILE: App_Dev_Menu_V3.gs
================================================
/**
 * ================================================================
 * KIDLEARN V3 - DEV MENU
 * Step: 3I.4 Fix
 * Version: 3.1.0
 * ================================================================
 *
 * Dùng menu trong Google Sheet để mở UI DEV Shell.
 *
 * Không chạy kidlearnV3_showUiDevShellV3 trực tiếp từ Apps Script editor.
 */


/**
 * Cài installable onOpen trigger để tự thêm menu DEV khi mở Google Sheet.
 *
 * Hàm này có thể chạy từ Apps Script editor.
 */
function kidlearnV3_installUiDevMenuTriggerV3() {
  var spreadsheetId =
    kidlearnV3_appResolveDatabaseId_();

  var spreadsheet =
    SpreadsheetApp.openById(
      spreadsheetId
    );

  var triggers =
    ScriptApp.getProjectTriggers();

  for (
    var i = 0;
    i < triggers.length;
    i++
  ) {
    if (
      triggers[i].getHandlerFunction() ===
      'kidlearnV3_addDevMenuV3'
    ) {
      ScriptApp.deleteTrigger(
        triggers[i]
      );
    }
  }

  ScriptApp
    .newTrigger(
      'kidlearnV3_addDevMenuV3'
    )
    .forSpreadsheet(
      spreadsheet
    )
    .onOpen()
    .create();

  var result = {
    success: true,
    action: 'INSTALL_UI_DEV_MENU_TRIGGER_V3',
    spreadsheetId: spreadsheetId,
    spreadsheetName: spreadsheet.getName(),
    triggerHandler: 'kidlearnV3_addDevMenuV3',
    message:
      'Đã cài trigger. Hãy reload Google Sheet để thấy menu KIDLEARN V3 DEV.'
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Thêm menu DEV vào Google Sheet.
 *
 * Hàm này được gọi bởi onOpen trigger.
 * Không chạy trực tiếp từ Apps Script editor.
 */


/**
 * Thêm menu DEV vào Google Sheet.
 */
function kidlearnV3_addDevMenuV3() {
  var ui =
    SpreadsheetApp.getUi();

  ui
    .createMenu(
      'KIDLEARN V3 DEV'
    )
    .addItem(
      'Open DEV Shell V3',
      'kidlearnV3_showUiDevShellV3'
    )
    .addItem(
      'Open DEV App Router V3',
      'kidlearnV3_showDevAppRouterV3'
    )
    .addSeparator()
    .addItem(
      'Open UI Real Write Gate DEV',
      'kidlearnV3_showUiRealWriteGateDevV3'
    )
    .addItem(
      'Open UI Real Write Trial 3J-B',
      'kidlearnV3_showUiRealWriteTrial3JBV3'
    )
    .addSeparator()
    .addItem(
      'Assert UI Gate DRY RUN Ready',
      'kidlearnV3_assertUiRealWriteGateDryRunReadyV3'
    )
    .addItem(
      'Preview UI Real Write Trial 3J-B',
      'kidlearnV3_previewUiRealWriteTrial3JBV3'
    )
    .addItem(
      'Get UI Real Write Trial 3J-B Status',
      'kidlearnV3_getUiRealWriteTrial3JBStatusV3'
    )
    .addSeparator()
    .addItem(
      'Reset Controlled Write to DRY RUN',
      'kidlearnV3_resetControlledWriteDevToDryRunV3'
    )
    .addItem(
      'Reset After UI Trial 3J-B',
      'kidlearnV3_resetAfterUiRealWriteTrial3JBV3'
    )
    .addItem(
      'Run Post-UI Review 3J-B',
      'kidlearnV3_runPostUiRealWriteReview3JBV3'
    )
    .addItem(
      'Mark Post-UI Review 3J-B Ready',
      'kidlearnV3_markPostUiRealWriteReview3JBReadyV3'
    )
    .addItem(
      'Assert Post-UI Review 3J-B Passed',
      'kidlearnV3_assertPostUiRealWriteReview3JBPassedV3'
    )
    .addSeparator()
    .addItem(
      'Close Phase 3J',
      'kidlearnV3_closePhase3JV3'
    )
    .addItem(
      'Get Phase 3J Close Status',
      'kidlearnV3_getPhase3JCloseStatusV3'
    )
    .addItem(
      'Assert Phase 3J Closed',
      'kidlearnV3_assertPhase3JClosedV3'
    )
    .addSeparator()
    .addItem(
      'Get Safe Write Status',
      'kidlearnV3_getSafeWriteLayerStatusV3'
    )
    .addItem(
      'Get Controlled Write Status',
      'kidlearnV3_getControlledWriteDevStatusV3'
    )
    .addItem(
      'Ping Service V3',
      'kidlearnV3_servicePingV3'
    )
    .addSeparator()
    .addItem(
      'Preview Learning UI Core 3K-A',
      'kidlearnV3_previewLearningUiCore3KAV3'
    )
    .addItem(
      'Build Learning UI State 3K-A',
      'kidlearnV3_buildLearningUiState3KAV3'
    )
    .addItem(
      'Build Learning Screen Payload 3K-A',
      'kidlearnV3_buildLearningScreenPayload3KAV3'
    )
    .addItem(
      'Smoke Test Learning UI Core 3K-A',
      'kidlearnV3_smokeTestLearningUiCore3KAV3'
    )
    .addItem(
      'Mark Learning UI Core 3K-A Ready',
      'kidlearnV3_markLearningUiCore3KAReadyV3'
    )
    .addItem(
      'Get Learning UI Core 3K-A Status',
      'kidlearnV3_getLearningUiCore3KAStatusV3'
    )
    .addItem(
      'Assert Learning UI Core 3K-A Ready',
      'kidlearnV3_assertLearningUiCore3KAReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview Learning UI 3K-B',
      'kidlearnV3_previewLearningUi3KBV3'
    )
    .addItem(
      'Open Learning DEV 3K-B',
      'kidlearnV3_showLearningDev3KBV3'
    )
    .addItem(
      'Build Learning Screen 3K-B',
      'kidlearnV3_buildLearningScreen3KBV3'
    )
    .addItem(
      'Smoke Test Learning UI 3K-B',
      'kidlearnV3_smokeTestLearningUi3KBV3'
    )
    .addItem(
      'Mark Learning UI 3K-B Ready',
      'kidlearnV3_markLearningUi3KBReadyV3'
    )
    .addItem(
      'Get Learning UI 3K-B Status',
      'kidlearnV3_getLearningUi3KBStatusV3'
    )
    .addItem(
      'Assert Learning UI 3K-B Ready',
      'kidlearnV3_assertLearningUi3KBReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview App Shell 3L-A',
      'kidlearnV3_previewAppShell3LAV3'
    )
    .addItem(
      'Open App Shell 3L-A',
      'kidlearnV3_showAppShell3LAV3'
    )
    .addItem(
      'QA Batch 3L-A',
      'kidlearnV3_runQaBatch3LAV3'
    )
    .addItem(
      'Status App Shell 3L-A',
      'kidlearnV3_getAppShell3LAStatusV3'
    )
    .addItem(
      'Assert App Shell 3L-A Ready',
      'kidlearnV3_assertAppShell3LAReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview Lesson Content 3L-B',
      'kidlearnV3_previewLessonContent3LBV3'
    )
    .addItem(
      'Open Lesson Content 3L-B',
      'kidlearnV3_showLessonContent3LBV3'
    )
    .addItem(
      'QA Batch 3L-B',
      'kidlearnV3_runQaBatch3LBV3'
    )
    .addItem(
      'Status Lesson Content 3L-B',
      'kidlearnV3_getLessonContent3LBStatusV3'
    )
    .addItem(
      'Assert Lesson Content 3L-B Ready',
      'kidlearnV3_assertLessonContent3LBReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview Learning Interaction 3L-C',
      'kidlearnV3_previewLearningInteraction3LCV3'
    )
    .addItem(
      'Open Learning Interaction 3L-C',
      'kidlearnV3_showLearningInteraction3LCV3'
    )
    .addItem(
      'QA Batch 3L-C',
      'kidlearnV3_runQaBatch3LCV3'
    )
    .addItem(
      'Status Learning Interaction 3L-C',
      'kidlearnV3_getLearningInteraction3LCStatusV3'
    )
    .addItem(
      'Assert Learning Interaction 3L-C Ready',
      'kidlearnV3_assertLearningInteraction3LCReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview Phase 3L Close 3L-D',
      'kidlearnV3_previewPhase3LClose3LDV3'
    )
    .addItem(
      'QA Batch 3L-D',
      'kidlearnV3_runQaBatch3LDV3'
    )
    .addItem(
      'Status 3L-D',
      'kidlearnV3_getPhase3LDStatusV3'
    )
    .addItem(
      'Assert 3L Ready To Close',
      'kidlearnV3_assertPhase3LReadyToClose3LDV3'
    )
    .addItem(
      'Close Phase 3L',
      'kidlearnV3_closePhase3LV3'
    )
    .addItem(
      'Assert Phase 3L Closed',
      'kidlearnV3_assertPhase3LClosedV3'
    )
    .addSeparator()
    .addItem(
      'Preview QA Async 3M-A',
      'kidlearnV3_previewQaAsync3MAV3'
    )
    .addItem(
      'Start QA Async Current Safe 3M-A',
      'kidlearnV3_startQaAsyncCurrentSafe3MAV3'
    )
    .addItem(
      'Start QA Async 3L Regression',
      'kidlearnV3_startQaAsyncPhase3LRegression3MAV3'
    )
    .addItem(
      'QA Async Status 3M-A',
      'kidlearnV3_getQaAsyncStatus3MAV3'
    )
    .addItem(
      'Run QA Async Next Chunk Now',
      'kidlearnV3_runQaAsyncNextChunkNow3MAV3'
    )
    .addItem(
      'Pause QA Async 3M-A',
      'kidlearnV3_pauseQaAsync3MAV3'
    )
    .addItem(
      'Resume QA Async 3M-A',
      'kidlearnV3_resumeQaAsync3MAV3'
    )
    .addItem(
      'Cancel QA Async 3M-A',
      'kidlearnV3_cancelQaAsync3MAV3'
    )
    .addItem(
      'Mark QA Async 3M-A Ready',
      'kidlearnV3_markQaAsync3MAReadyV3'
    )
    .addItem(
      'Assert QA Async 3M-A Ready',
      'kidlearnV3_assertQaAsync3MAReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview Performance 3M-B',
      'kidlearnV3_previewPerformanceBaseline3MBV3'
    )
    .addItem(
      'Run Performance Baseline 3M-B',
      'kidlearnV3_runPerformanceBaseline3MBV3'
    )
    .addItem(
      'Clear Performance Caches 3M-B',
      'kidlearnV3_clearPerformanceCaches3MBV3'
    )
    .addItem(
      'Status Performance 3M-B',
      'kidlearnV3_getPerformanceBaseline3MBStatusV3'
    )
    .addItem(
      'QA Batch 3M-B',
      'kidlearnV3_runQaBatch3MBV3'
    )
    .addItem(
      'Assert Performance 3M-B Ready',
      'kidlearnV3_assertPerformanceBaseline3MBReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Candidate 3M-D',
      'kidlearnV3_previewProdCandidateChecklist3MDV3'
    )
    .addItem(
      'Run PROD Candidate Checklist 3M-D',
      'kidlearnV3_runProdCandidateChecklist3MDV3'
    )
    .addItem(
      'QA Batch 3M-D',
      'kidlearnV3_runQaBatch3MDV3'
    )
    .addItem(
      'Status PROD Candidate 3M-D',
      'kidlearnV3_getProdCandidateChecklist3MDStatusV3'
    )
    .addItem(
      'Assert PROD Candidate 3M-D Ready',
      'kidlearnV3_assertProdCandidateChecklist3MDReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Candidate Review 3N-A',
      'kidlearnV3_previewProdCandidateReview3NAV3'
    )
    .addItem(
      'Generate PROD Candidate Manifest 3N-A',
      'kidlearnV3_generateProdCandidateManifest3NAV3'
    )
    .addItem(
      'QA Batch 3N-A',
      'kidlearnV3_runQaBatch3NAV3'
    )
    .addItem(
      'Status PROD Candidate Review 3N-A',
      'kidlearnV3_getProdCandidateReview3NAStatusV3'
    )
    .addItem(
      'Assert PROD Candidate Review 3N-A Ready',
      'kidlearnV3_assertProdCandidateReview3NAReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview Backup Plan 3N-B',
      'kidlearnV3_previewDevBackupDeploymentPlan3NBV3'
    )
    .addItem(
      'Generate PROD Deployment Plan 3N-B',
      'kidlearnV3_generateProdDeploymentPlan3NBV3'
    )
    .addItem(
      'Create DEV Candidate Backup 3N-B',
      'kidlearnV3_createDevCandidateBackup3NBV3'
    )
    .addItem(
      'QA Batch 3N-B Plan Only',
      'kidlearnV3_runQaBatch3NBV3'
    )
    .addItem(
      'Status Backup Plan 3N-B',
      'kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3'
    )
    .addItem(
      'Mark Backup Plan 3N-B Ready',
      'kidlearnV3_markDevBackupDeploymentPlan3NBReadyV3'
    )
    .addItem(
      'Assert Backup Plan 3N-B Ready',
      'kidlearnV3_assertDevBackupDeploymentPlan3NBReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Dry-run 3N-C',
      'kidlearnV3_previewProdDryRunRehearsal3NCV3'
    )
    .addItem(
      'Run PROD Dry-run Rehearsal 3N-C',
      'kidlearnV3_runProdDryRunRehearsal3NCV3'
    )
    .addItem(
      'QA Batch 3N-C',
      'kidlearnV3_runQaBatch3NCV3'
    )
    .addItem(
      'Status PROD Dry-run 3N-C',
      'kidlearnV3_getProdDryRunRehearsal3NCStatusV3'
    )
    .addItem(
      'Assert PROD Dry-run 3N-C Ready',
      'kidlearnV3_assertProdDryRunRehearsal3NCReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Approval Gate 3N-D',
      'kidlearnV3_previewProdDeploymentApprovalGate3NDV3'
    )
    .addItem(
      'Generate PROD Approval Package 3N-D',
      'kidlearnV3_generateProdDeploymentApprovalPackage3NDV3'
    )
    .addItem(
      'QA Batch 3N-D Package Only',
      'kidlearnV3_runQaBatch3NDV3'
    )
    .addItem(
      'Record PROD Approval Gate 3N-D',
      'kidlearnV3_recordProdDeploymentApprovalGate3NDManualConfirmV3'
    )
    .addItem(
      'Status PROD Approval Gate 3N-D',
      'kidlearnV3_getProdDeploymentApprovalGate3NDStatusV3'
    )
    .addItem(
      'Mark PROD Approval Gate 3N-D Ready',
      'kidlearnV3_markProdDeploymentApprovalGate3NDReadyV3'
    )
    .addItem(
      'Assert PROD Approval Gate 3N-D Ready',
      'kidlearnV3_assertProdDeploymentApprovalGate3NDReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Execution Gate 3N-E',
      'kidlearnV3_previewProdDeploymentExecutionGate3NEV3'
    )
    .addItem(
      'Generate PROD Execution Package 3N-E',
      'kidlearnV3_generateProdDeploymentExecutionPackage3NEV3'
    )
    .addItem(
      'QA Batch 3N-E Package Only',
      'kidlearnV3_runQaBatch3NEV3'
    )
    .addItem(
      'Arm PROD Execution Gate 3N-E',
      'kidlearnV3_armProdDeploymentExecutionGate3NEManualConfirmV3'
    )
    .addItem(
      'Status PROD Execution Gate 3N-E',
      'kidlearnV3_getProdDeploymentExecutionGate3NEStatusV3'
    )
    .addItem(
      'Mark PROD Execution Gate 3N-E Ready',
      'kidlearnV3_markProdDeploymentExecutionGate3NEReadyV3'
    )
    .addItem(
      'Assert PROD Execution Gate 3N-E Ready',
      'kidlearnV3_assertProdDeploymentExecutionGate3NEReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview Controlled PROD 3N-F',
      'kidlearnV3_previewControlledProdDeployment3NFV3'
    )
    .addItem(
      'Generate Controlled PROD Package 3N-F',
      'kidlearnV3_generateControlledProdDeploymentPackage3NFV3'
    )
    .addItem(
      'QA Batch 3N-F Package Only',
      'kidlearnV3_runQaBatch3NFV3'
    )
    .addItem(
      'EXECUTE Controlled PROD Deployment 3N-F',
      'kidlearnV3_executeControlledProdDeployment3NFManualConfirmV3'
    )
    .addItem(
      'Status Controlled PROD 3N-F',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3'
    )
    .addItem(
      'Mark Controlled PROD 3N-F Ready',
      'kidlearnV3_markControlledProdDeployment3NFReadyV3'
    )
    .addItem(
      'Assert Controlled PROD 3N-F Ready',
      'kidlearnV3_assertControlledProdDeployment3NFReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Post-deploy 3N-G',
      'kidlearnV3_previewProdPostDeployValidation3NGV3'
    )
    .addItem(
      'Run PROD Post-deploy Validation 3N-G',
      'kidlearnV3_runProdPostDeployValidation3NGV3'
    )
    .addItem(
      'QA Batch 3N-G',
      'kidlearnV3_runQaBatch3NGV3'
    )
    .addItem(
      'Status PROD Post-deploy 3N-G',
      'kidlearnV3_getProdPostDeployValidation3NGStatusV3'
    )
    .addItem(
      'Assert PROD Post-deploy 3N-G Ready',
      'kidlearnV3_assertProdPostDeployValidation3NGReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Runtime Smoke 3N-H',
      'kidlearnV3_previewProdRuntimeSmokeTest3NHV3'
    )
    .addItem(
      'Run PROD Runtime Smoke 3N-H',
      'kidlearnV3_runProdRuntimeSmokeTest3NHV3'
    )
    .addItem(
      'QA Batch 3N-H',
      'kidlearnV3_runQaBatch3NHV3'
    )
    .addItem(
      'Status PROD Runtime Smoke 3N-H',
      'kidlearnV3_getProdRuntimeSmokeTest3NHStatusV3'
    )
    .addItem(
      'Assert PROD Runtime Smoke 3N-H Ready',
      'kidlearnV3_assertProdRuntimeSmokeTest3NHReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Handover 3N-I',
      'kidlearnV3_previewProdReleaseHandover3NIV3'
    )
    .addItem(
      'Generate PROD Handover Package 3N-I',
      'kidlearnV3_generateProdReleaseHandoverPackage3NIV3'
    )
    .addItem(
      'QA Batch 3N-I',
      'kidlearnV3_runQaBatch3NIV3'
    )
    .addItem(
      'Status PROD Handover 3N-I',
      'kidlearnV3_getProdReleaseHandover3NIStatusV3'
    )
    .addItem(
      'Assert PROD Handover 3N-I Ready',
      'kidlearnV3_assertProdReleaseHandover3NIReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Final Lock 3N-J',
      'kidlearnV3_previewProdReleaseFinalLock3NJV3'
    )
    .addItem(
      'Generate PROD Final Lock Package 3N-J',
      'kidlearnV3_generateProdReleaseFinalLockPackage3NJV3'
    )
    .addItem(
      'QA Batch 3N-J Package Only',
      'kidlearnV3_runQaBatch3NJV3'
    )
    .addItem(
      'Record PROD Final Lock 3N-J',
      'kidlearnV3_recordProdReleaseFinalLock3NJManualConfirmV3'
    )
    .addItem(
      'Status PROD Final Lock 3N-J',
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3'
    )
    .addItem(
      'Mark PROD Final Lock 3N-J Ready',
      'kidlearnV3_markProdReleaseFinalLock3NJReadyV3'
    )
    .addItem(
      'Assert PROD Final Lock 3N-J Ready',
      'kidlearnV3_assertProdReleaseFinalLock3NJReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Monitoring 3O-A',
      'kidlearnV3_previewProdReadonlyMonitoringOnboarding3OAV3'
    )
    .addItem(
      'Run PROD Read-only Monitoring 3O-A',
      'kidlearnV3_runProdReadonlyMonitoring3OAV3'
    )
    .addItem(
      'Generate Family Onboarding 3O-A',
      'kidlearnV3_generateFamilyOnboardingPackage3OAV3'
    )
    .addItem(
      'QA Batch 3O-A',
      'kidlearnV3_runQaBatch3OAV3'
    )
    .addItem(
      'Status PROD Monitoring 3O-A',
      'kidlearnV3_getProdReadonlyMonitoringOnboarding3OAStatusV3'
    )
    .addItem(
      'Assert PROD Monitoring 3O-A Ready',
      'kidlearnV3_assertProdReadonlyMonitoringOnboarding3OAReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Support Gate 3O-B',
      'kidlearnV3_previewProdReadonlySupportChangeGate3OBV3'
    )
    .addItem(
      'Run PROD Support Review 3O-B',
      'kidlearnV3_runProdReadonlySupportReview3OBV3'
    )
    .addItem(
      'Generate PROD Support Package 3O-B',
      'kidlearnV3_generateProdReadonlySupportPackage3OBV3'
    )
    .addItem(
      'Initialize Change Gate 3O-B',
      'kidlearnV3_initializeProdChangeRequestGate3OBV3'
    )
    .addItem(
      'QA Batch 3O-B',
      'kidlearnV3_runQaBatch3OBV3'
    )
    .addItem(
      'Status PROD Support Gate 3O-B',
      'kidlearnV3_getProdReadonlySupportChangeGate3OBStatusV3'
    )
    .addItem(
      'Assert PROD Support Gate 3O-B Ready',
      'kidlearnV3_assertProdReadonlySupportChangeGate3OBReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD CR Workflow 3O-C',
      'kidlearnV3_previewProdChangeRequestWorkflow3OCV3'
    )
    .addItem(
      'Generate PROD CR Workflow 3O-C',
      'kidlearnV3_generateProdChangeRequestWorkflow3OCV3'
    )
    .addItem(
      'Run PROD CR Workflow Simulation 3O-C',
      'kidlearnV3_runProdChangeRequestWorkflowSimulation3OCV3'
    )
    .addItem(
      'QA Batch 3O-C',
      'kidlearnV3_runQaBatch3OCV3'
    )
    .addItem(
      'Status PROD CR Workflow 3O-C',
      'kidlearnV3_getProdChangeRequestWorkflow3OCStatusV3'
    )
    .addItem(
      'Assert PROD CR Workflow 3O-C Ready',
      'kidlearnV3_assertProdChangeRequestWorkflow3OCReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD CR Approval Gate 3O-D',
      'kidlearnV3_previewProdChangeRequestApprovalGate3ODV3'
    )
    .addItem(
      'Generate PROD CR Approval Package 3O-D',
      'kidlearnV3_generateProdChangeRequestApprovalGatePackage3ODV3'
    )
    .addItem(
      'QA Batch 3O-D Package Only',
      'kidlearnV3_runQaBatch3ODV3'
    )
    .addItem(
      'Record PROD CR Approval Gate 3O-D',
      'kidlearnV3_recordProdChangeRequestApprovalGate3ODManualConfirmV3'
    )
    .addItem(
      'Status PROD CR Approval Gate 3O-D',
      'kidlearnV3_getProdChangeRequestApprovalGate3ODStatusV3'
    )
    .addItem(
      'Assert PROD CR Approval Gate 3O-D Ready',
      'kidlearnV3_assertProdChangeRequestApprovalGate3ODReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD CR Planning 3O-E',
      'kidlearnV3_previewProdChangeRequestImplementationPlanning3OEV3'
    )
    .addItem(
      'Generate PROD CR Plan 3O-E',
      'kidlearnV3_generateProdChangeRequestImplementationPlan3OEV3'
    )
    .addItem(
      'Run PROD CR Planning Simulation 3O-E',
      'kidlearnV3_runProdChangeRequestImplementationPlanningSimulation3OEV3'
    )
    .addItem(
      'QA Batch 3O-E',
      'kidlearnV3_runQaBatch3OEV3'
    )
    .addItem(
      'Status PROD CR Planning 3O-E',
      'kidlearnV3_getProdChangeRequestImplementationPlanning3OEStatusV3'
    )
    .addItem(
      'Assert PROD CR Planning 3O-E Ready',
      'kidlearnV3_assertProdChangeRequestImplementationPlanning3OEReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD CR Execution Gate 3O-F',
      'kidlearnV3_previewProdChangeRequestControlledExecutionGate3OFV3'
    )
    .addItem(
      'Generate PROD CR Execution Gate Package 3O-F',
      'kidlearnV3_generateProdChangeRequestControlledExecutionGatePackage3OFV3'
    )
    .addItem(
      'QA Batch 3O-F Package Only',
      'kidlearnV3_runQaBatch3OFV3'
    )
    .addItem(
      'Record PROD CR Execution Gate 3O-F',
      'kidlearnV3_recordProdChangeRequestControlledExecutionGate3OFManualConfirmV3'
    )
    .addItem(
      'Status PROD CR Execution Gate 3O-F',
      'kidlearnV3_getProdChangeRequestControlledExecutionGate3OFStatusV3'
    )
    .addItem(
      'Assert PROD CR Execution Gate 3O-F Ready',
      'kidlearnV3_assertProdChangeRequestControlledExecutionGate3OFReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD CR Dry-run 3O-G',
      'kidlearnV3_previewProdChangeRequestExecutionDryRun3OGV3'
    )
    .addItem(
      'Generate PROD CR Dry-run Package 3O-G',
      'kidlearnV3_generateProdChangeRequestExecutionDryRunPackage3OGV3'
    )
    .addItem(
      'Run PROD CR Dry-run Rehearsal 3O-G',
      'kidlearnV3_runProdChangeRequestExecutionDryRunRehearsal3OGV3'
    )
    .addItem(
      'QA Batch 3O-G',
      'kidlearnV3_runQaBatch3OGV3'
    )
    .addItem(
      'Status PROD CR Dry-run 3O-G',
      'kidlearnV3_getProdChangeRequestExecutionDryRun3OGStatusV3'
    )
    .addItem(
      'Assert PROD CR Dry-run 3O-G Ready',
      'kidlearnV3_assertProdChangeRequestExecutionDryRun3OGReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD CR Decision Gate 3O-H',
      'kidlearnV3_previewProdChangeRequestExecutionDecisionGate3OHV3'
    )
    .addItem(
      'Generate PROD CR Decision Package 3O-H',
      'kidlearnV3_generateProdChangeRequestExecutionDecisionGatePackage3OHV3'
    )
    .addItem(
      'QA Batch 3O-H Package Only',
      'kidlearnV3_runQaBatch3OHV3'
    )
    .addItem(
      'Record PROD CR Decision Gate 3O-H',
      'kidlearnV3_recordProdChangeRequestExecutionDecisionGate3OHManualConfirmV3'
    )
    .addItem(
      'Status PROD CR Decision Gate 3O-H',
      'kidlearnV3_getProdChangeRequestExecutionDecisionGate3OHStatusV3'
    )
    .addItem(
      'Assert PROD CR Decision Gate 3O-H Ready',
      'kidlearnV3_assertProdChangeRequestExecutionDecisionGate3OHReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Selected CR Package 3O-I',
      'kidlearnV3_previewProdSelectedChangeRequestExecutionPackage3OIV3'
    )
    .addItem(
      'Generate PROD Selected CR Package 3O-I',
      'kidlearnV3_generateProdSelectedChangeRequestExecutionPackage3OIV3'
    )
    .addItem(
      'Validate PROD Selected CR Package 3O-I',
      'kidlearnV3_validateProdSelectedChangeRequestExecutionPackage3OIV3'
    )
    .addItem(
      'QA Batch 3O-I',
      'kidlearnV3_runQaBatch3OIV3'
    )
    .addItem(
      'Status PROD Selected CR Package 3O-I',
      'kidlearnV3_getProdSelectedChangeRequestExecutionPackage3OIStatusV3'
    )
    .addItem(
      'Assert PROD Selected CR Package 3O-I Ready',
      'kidlearnV3_assertProdSelectedChangeRequestExecutionPackage3OIReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Selected CR Final Approval 3O-J',
      'kidlearnV3_previewProdSelectedCRFinalExecutionApprovalGate3OJV3'
    )
    .addItem(
      'Generate PROD Selected CR Final Approval Package 3O-J',
      'kidlearnV3_generateProdSelectedCRFinalExecutionApprovalPackage3OJV3'
    )
    .addItem(
      'QA Batch 3O-J Package Only',
      'kidlearnV3_runQaBatch3OJV3'
    )
    .addItem(
      'Record PROD Selected CR Final Approval 3O-J',
      'kidlearnV3_recordProdSelectedCRFinalExecutionApproval3OJManualConfirmV3'
    )
    .addItem(
      'Status PROD Selected CR Final Approval 3O-J',
      'kidlearnV3_getProdSelectedCRFinalExecutionApproval3OJStatusV3'
    )
    .addItem(
      'Assert PROD Selected CR Final Approval 3O-J Ready',
      'kidlearnV3_assertProdSelectedCRFinalExecutionApproval3OJReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Selected CR Trial 3O-K',
      'kidlearnV3_previewProdSelectedCRControlledExecutionTrial3OKV3'
    )
    .addItem(
      'Generate PROD Selected CR Trial Package 3O-K',
      'kidlearnV3_generateProdSelectedCRControlledExecutionTrialPackage3OKV3'
    )
    .addItem(
      'QA Batch 3O-K Package Only',
      'kidlearnV3_runQaBatch3OKV3'
    )
    .addItem(
      'EXECUTE PROD Audit Trial 3O-K',
      'kidlearnV3_executeProdSelectedCRControlledAuditTrial3OKManualConfirmV3'
    )
    .addItem(
      'Validate PROD Audit Trial 3O-K',
      'kidlearnV3_validateProdSelectedCRControlledExecutionTrial3OKV3'
    )
    .addItem(
      'Status PROD Selected CR Trial 3O-K',
      'kidlearnV3_getProdSelectedCRControlledExecutionTrial3OKStatusV3'
    )
    .addItem(
      'Assert PROD Selected CR Trial 3O-K Ready',
      'kidlearnV3_assertProdSelectedCRControlledExecutionTrial3OKReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Selected CR Post-trial 3O-L',
      'kidlearnV3_previewProdSelectedCRPostTrialValidation3OLV3'
    )
    .addItem(
      'Run PROD Selected CR Post-trial Review 3O-L',
      'kidlearnV3_runProdSelectedCRPostTrialValidationReview3OLV3'
    )
    .addItem(
      'Generate PROD Selected CR Release Decision 3O-L',
      'kidlearnV3_generateProdSelectedCRReleaseDecision3OLV3'
    )
    .addItem(
      'QA Batch 3O-L',
      'kidlearnV3_runQaBatch3OLV3'
    )
    .addItem(
      'Status PROD Selected CR Post-trial 3O-L',
      'kidlearnV3_getProdSelectedCRPostTrialValidation3OLStatusV3'
    )
    .addItem(
      'Assert PROD Selected CR Post-trial 3O-L Ready',
      'kidlearnV3_assertProdSelectedCRPostTrialValidation3OLReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD CR Close Lock 3O-M',
      'kidlearnV3_previewProdChangeRequestCloseOperationalLock3OMV3'
    )
    .addItem(
      'Run PROD CR Close Review 3O-M',
      'kidlearnV3_runProdChangeRequestCloseReview3OMV3'
    )
    .addItem(
      'Generate PROD CR Operational Lock Package 3O-M',
      'kidlearnV3_generateProdChangeRequestOperationalLockPackage3OMV3'
    )
    .addItem(
      'QA Batch 3O-M Package Only',
      'kidlearnV3_runQaBatch3OMV3'
    )
    .addItem(
      'Record PROD CR Operational Lock 3O-M',
      'kidlearnV3_recordProdChangeRequestOperationalLock3OMManualConfirmV3'
    )
    .addItem(
      'Close PROD CR Chain 3O-M',
      'kidlearnV3_closeProdChangeRequestChain3OMV3'
    )
    .addItem(
      'Status PROD CR Close Lock 3O-M',
      'kidlearnV3_getProdChangeRequestCloseOperationalLock3OMStatusV3'
    )
    .addItem(
      'Assert PROD CR Close Lock 3O-M Closed',
      'kidlearnV3_assertProdChangeRequestCloseOperationalLock3OMClosedV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Readonly Monitoring 3P-A',
      'kidlearnV3_previewProdReadonlyOperationalMonitoring3PAV3'
    )
    .addItem(
      'Capture PROD Monitoring Baseline 3P-A',
      'kidlearnV3_captureProdReadonlyMonitoringBaseline3PAV3'
    )
    .addItem(
      'Run PROD Monitoring Smoke 3P-A',
      'kidlearnV3_runProdReadonlyMonitoringSmoke3PAV3'
    )
    .addItem(
      'QA Batch 3P-A',
      'kidlearnV3_runQaBatch3PAV3'
    )
    .addItem(
      'Status PROD Monitoring 3P-A',
      'kidlearnV3_getProdReadonlyOperationalMonitoring3PAStatusV3'
    )
    .addItem(
      'Assert PROD Monitoring 3P-A Ready',
      'kidlearnV3_assertProdReadonlyOperationalMonitoring3PAReadyV3'
    ).addSeparator()
    .addItem(
      'Preview PROD Daily Health 3P-B',
      'kidlearnV3_previewProdMonitoringDailyHealthCheck3PBV3'
    )
    .addItem(
      'Run PROD Daily Health Check 3P-B',
      'kidlearnV3_runProdMonitoringDailyHealthCheck3PBV3'
    )
    .addItem(
      'Generate PROD Daily Health Report 3P-B',
      'kidlearnV3_generateProdMonitoringDailyHealthReport3PBV3'
    )
    .addItem(
      'QA Batch 3P-B',
      'kidlearnV3_runQaBatch3PBV3'
    )
    .addItem(
      'Status PROD Daily Health 3P-B',
      'kidlearnV3_getProdMonitoringDailyHealthCheck3PBStatusV3'
    )
    .addItem(
      'Assert PROD Daily Health 3P-B Ready',
      'kidlearnV3_assertProdMonitoringDailyHealthCheck3PBReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Alert Incident 3P-C',
      'kidlearnV3_previewProdMonitoringAlertIncidentIntakeGate3PCV3'
    )
    .addItem(
      'Generate PROD Alert Incident Package 3P-C',
      'kidlearnV3_generateProdMonitoringAlertIncidentIntakePackage3PCV3'
    )
    .addItem(
      'QA Batch 3P-C Package Only',
      'kidlearnV3_runQaBatch3PCV3'
    )
    .addItem(
      'Record PROD Alert Incident Intake 3P-C',
      'kidlearnV3_recordProdMonitoringAlertIncidentIntakeGate3PCManualConfirmV3'
    )
    .addItem(
      'Status PROD Alert Incident 3P-C',
      'kidlearnV3_getProdMonitoringAlertIncidentIntakeGate3PCStatusV3'
    )
    .addItem(
      'Assert PROD Alert Incident 3P-C Ready',
      'kidlearnV3_assertProdMonitoringAlertIncidentIntakeGate3PCReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Incident Triage 3P-D',
      'kidlearnV3_previewProdMonitoringIncidentTriageResponsePlan3PDV3'
    )
    .addItem(
      'Generate PROD Incident Triage Plan 3P-D',
      'kidlearnV3_generateProdMonitoringIncidentTriageResponsePlan3PDV3'
    )
    .addItem(
      'QA Batch 3P-D Package Only',
      'kidlearnV3_runQaBatch3PDV3'
    )
    .addItem(
      'Record PROD Incident Triage Plan 3P-D',
      'kidlearnV3_recordProdMonitoringIncidentTriageResponsePlan3PDManualConfirmV3'
    )
    .addItem(
      'Status PROD Incident Triage 3P-D',
      'kidlearnV3_getProdMonitoringIncidentTriageResponsePlan3PDStatusV3'
    )
    .addItem(
      'Assert PROD Incident Triage 3P-D Ready',
      'kidlearnV3_assertProdMonitoringIncidentTriageResponsePlan3PDReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Response 3P-EF',
      'kidlearnV3_previewProdMonitoringResponseApprovalDryRun3PEFV3'
    )
    .addItem(
      'Generate PROD Response Package 3P-EF',
      'kidlearnV3_generateProdMonitoringResponseApprovalPackage3PEFV3'
    )
    .addItem(
      'QA Batch 3P-EF Package Only',
      'kidlearnV3_runQaBatch3PEFV3'
    )
    .addItem(
      'Record PROD Response Approval 3P-EF',
      'kidlearnV3_recordProdMonitoringResponseApproval3PEFManualConfirmV3'
    )
    .addItem(
      'Run PROD Response Dry-run 3P-EF',
      'kidlearnV3_runProdMonitoringResponseDryRunRehearsal3PEFV3'
    )
    .addItem(
      'Status PROD Response 3P-EF',
      'kidlearnV3_getProdMonitoringResponseApprovalDryRun3PEFStatusV3'
    )
    .addItem(
      'Assert PROD Response 3P-EF Ready',
      'kidlearnV3_assertProdMonitoringResponseApprovalDryRun3PEFReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Decision Close 3P-GH',
      'kidlearnV3_previewProdMonitoringResponseDecisionClose3PGHV3'
    )
    .addItem(
      'Generate PROD Decision Package 3P-GH',
      'kidlearnV3_generateProdMonitoringResponseDecisionPackage3PGHV3'
    )
    .addItem(
      'QA Batch 3P-GH Package Only',
      'kidlearnV3_runQaBatch3PGHV3'
    )
    .addItem(
      'Record PROD Response Decision 3P-GH',
      'kidlearnV3_recordProdMonitoringResponseDecision3PGHManualConfirmV3'
    )
    .addItem(
      'Close PROD Incident Cycle 3P-GH',
      'kidlearnV3_closeProdMonitoringIncidentCycle3PGHV3'
    )
    .addItem(
      'Status PROD Decision Close 3P-GH',
      'kidlearnV3_getProdMonitoringResponseDecisionClose3PGHStatusV3'
    )
    .addItem(
      'Assert PROD Decision Close 3P-GH Closed',
      'kidlearnV3_assertProdMonitoringResponseDecisionClose3PGHClosedV3'
    )
    .addSeparator()
    .addItem(
      'Open Product Web App Preview 4A',
      'kidlearnV3_openProductWebAppPreview4AV3'
    )
    .addItem(
      'Preview Product MVP Foundation 4A',
      'kidlearnV3_previewProductMvpFoundation4AV3'
    )
    .addItem(
      'QA Batch 4A-1D Package Only',
      'kidlearnV3_runQaBatch4A1DV3'
    )
    .addItem(
      'Record Product MVP Foundation 4A Lock',
      'kidlearnV3_recordProductMvpFoundation4ALockConfirmV3'
    )
    .addItem(
      'Close Product MVP Foundation 4A',
      'kidlearnV3_closeProductMvpFoundation4AV3'
    )
    .addItem(
      'Status Product MVP Foundation 4A',
      'kidlearnV3_getProductMvpFoundation4AStatusV3'
    )
    .addItem(
      'Assert Product MVP Foundation 4A Closed',
      'kidlearnV3_assertProductMvpFoundation4AClosedV3'
    )
    .addToUi();
}


/**
 * Xem danh sách trigger UI DEV menu.
 */
function kidlearnV3_previewUiDevMenuTriggersV3() {
  var triggers =
    ScriptApp.getProjectTriggers();

  var items = [];

  for (
    var i = 0;
    i < triggers.length;
    i++
  ) {
    if (
      triggers[i].getHandlerFunction() ===
      'kidlearnV3_addDevMenuV3'
    ) {
      items.push({
        handlerFunction:
          triggers[i].getHandlerFunction(),
        eventType:
          String(triggers[i].getEventType()),
        triggerSource:
          String(triggers[i].getTriggerSource())
      });
    }
  }

  var result = {
    success: true,
    triggerCount: items.length,
    triggers: items
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Gỡ trigger menu DEV nếu cần.
 */
function kidlearnV3_uninstallUiDevMenuTriggerV3() {
  var triggers =
    ScriptApp.getProjectTriggers();

  var deletedCount = 0;

  for (
    var i = 0;
    i < triggers.length;
    i++
  ) {
    if (
      triggers[i].getHandlerFunction() ===
      'kidlearnV3_addDevMenuV3'
    ) {
      ScriptApp.deleteTrigger(
        triggers[i]
      );

      deletedCount++;
    }
  }

  var result = {
    success: true,
    deletedCount: deletedCount
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


================================================
FILE: App_Learning_Actions_3KC_V3.gs
================================================
/**
 * ================================================================
 * KIDLEARN V3 - LEARNING ACTIONS DRY RUN
 * Bundle: 3K-C
 * Steps:
 * - 3K.6: Start Lesson DRY_RUN
 * - 3K.7: Update Progress DRY_RUN
 * - 3K.8: Finish Lesson DRY_RUN
 * - 3K.9: Refresh Learning Dashboard
 * Version: 3.1.0
 * ================================================================
 *
 * 3K-C chỉ chạy DRY_RUN.
 * KHÔNG ghi thật DB.
 * KHÔNG mở real write.
 * KHÔNG sửa PROD.
 */


var KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3KC_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3KC_LAST_PREVIEW_AT',
  LAST_DRY_RUN_AT: 'KIDLEARN_V3_PHASE_3KC_LAST_DRY_RUN_AT',
  LAST_SMOKE_TEST_AT: 'KIDLEARN_V3_PHASE_3KC_LAST_SMOKE_TEST_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3KC_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3KC_LAST_RESULT_JSON'
};


var KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  DRY_RUN_TESTED: 'DRY_RUN_TESTED',
  SMOKE_TESTED: 'SMOKE_TESTED',
  READY_FOR_3K_D: 'READY_FOR_3K_D',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG = {
  VERSION: '3K-C',
  PHASE: '3K.6_3K.7_3K.8_3K.9',
  NEXT_BUNDLE: '3K-D',
  WRITE_MODE: 'DRY_RUN_ONLY',
  CONFIRM_TEXT: 'DRY_RUN_ONLY'
};


var KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS = [
  'LOG_Audit',
  'DATA_StudySessions',
  'DATA_LessonProgress',
  'DATA_DailyGoals',
  'DATA_Assignments'
];


var KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS = {
  START_LESSON: 'START_LESSON',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  FINISH_LESSON: 'FINISH_LESSON',
  UPSERT_DAILY_GOAL: 'UPSERT_DAILY_GOAL'
};


/**
 * Preview 3K-C.
 */
function kidlearnV3_previewLearningActions3KCV3() {
  var errors = [];
  var warnings = [];

  var functionChecks =
    kidlearnV3_3kcCheckFunctions_([
      'kidlearnV3_assertLearningUi3KBReadyV3',
      'kidlearnV3_buildLearningScreen3KBV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_writeServiceSubmitV3',
      'kidlearnV3_appGetActiveDatabaseV3_'
    ]);

  errors =
    errors.concat(
      functionChecks.errors
    );

  var phase3KB =
    kidlearnV3_3kcSafeAssert3KBReady_();

  if (!phase3KB.success) {
    errors.push(
      '3K-B chưa READY_FOR_3K_C: ' +
      phase3KB.message
    );
  }

  var safeWrite =
    kidlearnV3_3kcSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      '3K-C yêu cầu Safe Write ở DRY_RUN/enabled=false. Hiện tại mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var sheetCheck =
    kidlearnV3_3kcCheckTargetSheets_();

  errors =
    errors.concat(
      sheetCheck.errors
    );

  var gateAvailable =
    typeof kidlearnV3_uiRealWriteGateDispatchV3 === 'function';

  if (!gateAvailable) {
    warnings.push(
      'Không thấy kidlearnV3_uiRealWriteGateDispatchV3. 3K-C sẽ fallback qua Write Service DRY_RUN.'
    );
  }

  var sampleContext = null;

  try {
    if (errors.length === 0) {
      sampleContext =
        kidlearnV3_3kcBuildActionContext_({});
    }
  } catch (error) {
    errors.push(
      'Không build được action context 3K-C: ' +
      String(error.message || error)
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_LEARNING_ACTIONS_3KC_V3',
    bundle: '3K-C',
    phase: KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.NEXT_BUNDLE,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3KB: phase3KB,
    safeWriteStatus: safeWrite,
    gateAvailable: gateAvailable,
    functionChecks: functionChecks.items,
    targetSheets: sheetCheck.items,
    sampleContext: sampleContext
  };

  kidlearnV3_3kcSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.PREVIEWED,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_PREVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Run one learning action in DRY_RUN.
 */
function kidlearnV3_runLearningActionDryRun3KCV3(request) {
  var req =
    kidlearnV3_3kcNormalizeRequest_(
      request
    );

  var actionCode =
    String(req.actionCode || '').trim();

  if (!actionCode) {
    throw new Error(
      'Thiếu actionCode cho 3K-C.'
    );
  }

  var beforeSnapshot =
    kidlearnV3_3kcSnapshotSheets_(
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS
    );

  var context =
    kidlearnV3_3kcBuildActionContext_(
      req
    );

  var operationPayload =
    kidlearnV3_3kcBuildOperationPayload_(
      actionCode,
      context,
      req
    );

  var dispatch =
    kidlearnV3_3kcDispatchDryRunWrite_(
      operationPayload.operation,
      operationPayload.payload
    );

  SpreadsheetApp.flush();
  Utilities.sleep(300);

  var afterSnapshot =
    kidlearnV3_3kcSnapshotSheets_(
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS
    );

  var noWriteCheck =
    kidlearnV3_3kcCompareNoWrite_(
      beforeSnapshot,
      afterSnapshot
    );

  var errors = [];

  if (!dispatch.success) {
    errors.push(
      'DRY_RUN dispatch thất bại: ' +
      kidlearnV3_3kcGetErrorMessage_(
        dispatch
      )
    );
  }

  errors =
    errors.concat(
      noWriteCheck.errors || []
    );

  var result = {
    success: errors.length === 0,
    action: 'RUN_LEARNING_ACTION_DRY_RUN_3KC_V3',
    bundle: '3K-C',
    phase: '3K.6_3K.7_3K.8',
    actionCode: actionCode,
    operation:
      operationPayload.operation,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    transactionId:
      context.transactionId,
    errorCount: errors.length,
    errors: errors,
    context: context,
    operationPayload: operationPayload,
    dispatch: dispatch,
    noWriteCheck: noWriteCheck,
    refreshedDashboard:
      kidlearnV3_refreshLearningDashboard3KCV3(
        req
      )
  };

  kidlearnV3_3kcSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.DRY_RUN_TESTED
      : KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_DRY_RUN_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Learning action DRY_RUN 3K-C lỗi. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Start lesson DRY_RUN.
 */
function kidlearnV3_startLessonDryRun3KCV3() {
  return kidlearnV3_runLearningActionDryRun3KCV3({
    actionCode:
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.START_LESSON
  });
}


/**
 * Update progress DRY_RUN.
 */
function kidlearnV3_updateProgressDryRun3KCV3() {
  return kidlearnV3_runLearningActionDryRun3KCV3({
    actionCode:
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.UPDATE_PROGRESS,
    progressPercent: 35
  });
}


/**
 * Finish lesson DRY_RUN.
 */
function kidlearnV3_finishLessonDryRun3KCV3() {
  return kidlearnV3_runLearningActionDryRun3KCV3({
    actionCode:
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.FINISH_LESSON
  });
}


/**
 * Daily goal DRY_RUN.
 */
function kidlearnV3_dailyGoalDryRun3KCV3() {
  return kidlearnV3_runLearningActionDryRun3KCV3({
    actionCode:
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.UPSERT_DAILY_GOAL
  });
}


/**
 * Run all learning actions in DRY_RUN.
 */
function kidlearnV3_runAllLearningActionsDryRun3KCV3() {
  var preview =
    kidlearnV3_previewLearningActions3KCV3();

  if (!preview.success) {
    throw new Error(
      'Không thể chạy all DRY_RUN 3K-C vì preview chưa đạt. Errors=' +
      preview.errorCount
    );
  }

  var beforeSnapshot =
    kidlearnV3_3kcSnapshotSheets_(
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS
    );

  var actions = [
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.START_LESSON,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.UPDATE_PROGRESS,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.FINISH_LESSON,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.UPSERT_DAILY_GOAL
  ];

  var items = [];
  var errors = [];

  for (var i = 0; i < actions.length; i++) {
    try {
      var item =
        kidlearnV3_3kcRunActionDryRunNoSnapshot_(
          actions[i],
          {}
        );

      items.push(item);

      if (!item.success) {
        errors.push(
          actions[i] +
          ': ' +
          kidlearnV3_3kcGetErrorMessage_(item)
        );
      }

    } catch (error) {
      errors.push(
        actions[i] +
        ': ' +
        String(error.message || error)
      );

      items.push({
        success: false,
        actionCode: actions[i],
        error:
          String(error.message || error)
      });
    }
  }

  SpreadsheetApp.flush();
  Utilities.sleep(500);

  var afterSnapshot =
    kidlearnV3_3kcSnapshotSheets_(
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS
    );

  var noWriteCheck =
    kidlearnV3_3kcCompareNoWrite_(
      beforeSnapshot,
      afterSnapshot
    );

  errors =
    errors.concat(
      noWriteCheck.errors || []
    );

  var result = {
    success: errors.length === 0,
    action: 'RUN_ALL_LEARNING_ACTIONS_DRY_RUN_3KC_V3',
    bundle: '3K-C',
    phase: KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.PHASE,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    actionCount: actions.length,
    errorCount: errors.length,
    errors: errors,
    items: items,
    noWriteCheck: noWriteCheck,
    refreshedDashboard:
      kidlearnV3_refreshLearningDashboard3KCV3({})
  };

  kidlearnV3_3kcSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.DRY_RUN_TESTED
      : KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_DRY_RUN_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Run all learning actions DRY_RUN 3K-C lỗi. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Refresh Learning Dashboard after action.
 */
function kidlearnV3_refreshLearningDashboard3KCV3(request) {
  var req =
    kidlearnV3_3kcNormalizeRequest_(
      request
    );

  var screen =
    kidlearnV3_buildLearningScreen3KBV3(
      req
    );

  var result = {
    success: true,
    action: 'REFRESH_LEARNING_DASHBOARD_3KC_V3',
    bundle: '3K-C',
    phase: '3K.9',
    readOnly: true,
    writeMode: 'DRY_RUN_ONLY',
    refreshedAt:
      new Date().toISOString(),
    dashboard: {
      screenId:
        screen.screenId || '',
      childName:
        screen.header &&
        screen.header.child
          ? screen.header.child.childName
          : '',
      selectedSubjectId:
        screen.subjectRail
          ? screen.subjectRail.selectedSubjectId
          : '',
      selectedLessonId:
        screen.lessonList
          ? screen.lessonList.selectedLessonId
          : '',
      subjectsCount:
        screen.diagnostics
          ? screen.diagnostics.subjectsCount
          : 0,
      lessonsCount:
        screen.diagnostics
          ? screen.diagnostics.lessonsCount
          : 0,
      assignmentsCount:
        screen.diagnostics
          ? screen.diagnostics.assignmentsCount
          : 0,
      hasLesson:
        screen.lessonPlayer
          ? screen.lessonPlayer.hasLesson
          : false
    },
    safeWriteStatus:
      kidlearnV3_3kcSafeWriteStatus_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Smoke test 3K-C.
 */
function kidlearnV3_smokeTestLearningActions3KCV3() {
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewLearningActions3KCV3();

  if (!preview.success) {
    throw new Error(
      'Không thể smoke test 3K-C vì preview chưa đạt. Errors=' +
      preview.errorCount
    );
  }

  var runAll =
    kidlearnV3_runAllLearningActionsDryRun3KCV3();

  if (!runAll.success) {
    errors.push(
      'Run all DRY_RUN 3K-C không success.'
    );
  }

  if (
    runAll.noWriteCheck &&
    runAll.noWriteCheck.success !== true
  ) {
    errors =
      errors.concat(
        runAll.noWriteCheck.errors || []
      );
  }

  var dashboard =
    kidlearnV3_refreshLearningDashboard3KCV3({});

  if (!dashboard.success) {
    errors.push(
      'Refresh dashboard 3K-C không success.'
    );
  }

  var safeWrite =
    kidlearnV3_3kcSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Sau smoke test 3K-C, Safe Write phải ở DRY_RUN/enabled=false.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_LEARNING_ACTIONS_3KC_V3',
    bundle: '3K-C',
    phase: KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.NEXT_BUNDLE,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    runAllSummary: {
      success: runAll.success,
      actionCount: runAll.actionCount,
      errorCount: runAll.errorCount
    },
    dashboard: dashboard.dashboard,
    safeWriteStatus: safeWrite
  };

  kidlearnV3_3kcSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.SMOKE_TESTED
      : KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_SMOKE_TEST_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test 3K-C chưa đạt. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 3K-C ready.
 */
function kidlearnV3_markLearningActions3KCReadyV3() {
  var smoke =
    kidlearnV3_smokeTestLearningActions3KCV3();

  if (!smoke.success) {
    throw new Error(
      'Không thể mark 3K-C ready vì smoke test chưa pass.'
    );
  }

  var result = {
    success: true,
    action: 'MARK_LEARNING_ACTIONS_3KC_READY_V3',
    bundle: '3K-C',
    phase: KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.PHASE,
    status:
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.READY_FOR_3K_D,
    nextBundle:
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.NEXT_BUNDLE,
    message:
      '3K-C đã ready. Có thể chuyển sang 3K-D để test UI learning flow end-to-end.'
  };

  kidlearnV3_3kcSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.READY_FOR_3K_D,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Get 3K-C status.
 */
function kidlearnV3_getLearningActions3KCStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_LEARNING_ACTIONS_3KC_STATUS_V3',
    bundle: '3K-C',
    phase: KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.STATUS
      ) ||
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastDryRunAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_DRY_RUN_AT
      ) ||
      '',
    lastSmokeTestAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_SMOKE_TEST_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3kcReadLastResult_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3K-C ready.
 */
function kidlearnV3_assertLearningActions3KCReadyV3() {
  var status =
    kidlearnV3_getLearningActions3KCStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.READY_FOR_3K_D
  ) {
    errors.push(
      '3K-C chưa READY_FOR_3K_D. Status hiện tại=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_LEARNING_ACTIONS_3KC_READY_V3',
    bundle: '3K-C',
    phase: KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.NEXT_BUNDLE,
    errorCount: errors.length,
    errors: errors
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3K-C chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Internal run action without snapshot.
 */
function kidlearnV3_3kcRunActionDryRunNoSnapshot_(
  actionCode,
  request
) {
  var req =
    kidlearnV3_3kcNormalizeRequest_(
      request
    );

  var context =
    kidlearnV3_3kcBuildActionContext_(
      req
    );

  var operationPayload =
    kidlearnV3_3kcBuildOperationPayload_(
      actionCode,
      context,
      req
    );

  var dispatch =
    kidlearnV3_3kcDispatchDryRunWrite_(
      operationPayload.operation,
      operationPayload.payload
    );

  return {
    success: dispatch.success === true,
    actionCode: actionCode,
    operation:
      operationPayload.operation,
    transactionId:
      context.transactionId,
    dispatch: dispatch
  };
}


/**
 * Build action context from 3K-B screen.
 */
function kidlearnV3_3kcBuildActionContext_(request) {
  var req =
    kidlearnV3_3kcNormalizeRequest_(
      request
    );

  var screen =
    kidlearnV3_buildLearningScreen3KBV3(
      req
    );

  var child =
    screen.header && screen.header.child
      ? screen.header.child
      : {};

  var lesson =
    screen.lessonPlayer && screen.lessonPlayer.lesson
      ? screen.lessonPlayer.lesson
      : {};

  var selectedSubjectId =
    screen.subjectRail
      ? screen.subjectRail.selectedSubjectId
      : '';

  var transactionId =
    kidlearnV3_3kcMakeTransactionId_();

  var today =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );

  return {
    transactionId: transactionId,
    childId:
      req.childId ||
      child.childId ||
      'DEV_CHILD_3KC',
    childName:
      child.childName || '',
    lessonId:
      req.lessonId ||
      lesson.lessonId ||
      'DEV_SAMPLE_LESSON_3KC',
    lessonTitle:
      lesson.lessonTitle || '',
    subjectId:
      req.subjectId ||
      lesson.subjectId ||
      selectedSubjectId ||
      'DEV_SAMPLE_SUBJECT_3KC',
    topicId:
      lesson.topicId || '',
    studySessionId:
      req.studySessionId ||
      'DRYRUN_SESSION_' + transactionId,
    progressPercent:
      Number(req.progressPercent || 35),
    goalDate:
      req.goalDate || today,
    targetMinutes:
      Number(req.targetMinutes || 20),
    completedMinutes:
      Number(req.completedMinutes || 5),
    source:
      'LEARNING_ACTIONS_3KC_DRY_RUN'
  };
}


/**
 * Build operation payload.
 */
function kidlearnV3_3kcBuildOperationPayload_(
  actionCode,
  context,
  request
) {
  var now =
    new Date().toISOString();

  if (
    actionCode ===
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.START_LESSON
  ) {
    return {
      operation: 'START_STUDY_SESSION',
      payload: {
        childId: context.childId,
        lessonId: context.lessonId,
        subjectId: context.subjectId,
        topicId: context.topicId,
        startedAt: now,
        status: 'IN_PROGRESS',
        source: context.source,
        transactionId: context.transactionId,
        notes:
          '3K-C DRY_RUN Start Lesson. Không ghi thật DB.'
      }
    };
  }

  if (
    actionCode ===
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.UPDATE_PROGRESS
  ) {
    return {
      operation: 'UPSERT_LESSON_PROGRESS',
      payload: {
        childId: context.childId,
        lessonId: context.lessonId,
        subjectId: context.subjectId,
        status: 'IN_PROGRESS',
        progressPercent: context.progressPercent,
        lastStudiedAt: now,
        source: context.source,
        transactionId: context.transactionId,
        notes:
          '3K-C DRY_RUN Update Progress. Không ghi thật DB.'
      }
    };
  }

  if (
    actionCode ===
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.FINISH_LESSON
  ) {
    return {
      operation: 'FINISH_STUDY_SESSION',
      payload: {
        studySessionId: context.studySessionId,
        childId: context.childId,
        lessonId: context.lessonId,
        subjectId: context.subjectId,
        finishedAt: now,
        status: 'COMPLETED',
        source: context.source,
        transactionId: context.transactionId,
        notes:
          '3K-C DRY_RUN Finish Lesson. Không ghi thật DB.'
      }
    };
  }

  if (
    actionCode ===
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.UPSERT_DAILY_GOAL
  ) {
    return {
      operation: 'UPSERT_DAILY_GOAL',
      payload: {
        childId: context.childId,
        goalDate: context.goalDate,
        targetMinutes: context.targetMinutes,
        completedMinutes: context.completedMinutes,
        status: 'ACTIVE',
        source: context.source,
        transactionId: context.transactionId,
        notes:
          '3K-C DRY_RUN Daily Goal. Không ghi thật DB.'
      }
    };
  }

  throw new Error(
    'ActionCode không hỗ trợ ở 3K-C: ' +
    actionCode
  );
}


/**
 * Dispatch DRY_RUN write.
 *
 * Bản sửa 3K-C:
 * - Không đi qua UI Real Write Gate 3J-A nữa.
 * - Gọi trực tiếp Write Service ở dryRun=true.
 * - Vẫn kiểm tra Safe Write đang ở DRY_RUN/enabled=false.
 */
function kidlearnV3_3kcDispatchDryRunWrite_(
  operation,
  payload
) {
  try {
    var safeWrite =
      kidlearnV3_3kcSafeWriteStatus_();

    if (
      safeWrite.mode !== 'DRY_RUN' ||
      safeWrite.enabled !== false
    ) {
      return {
        success: false,
        method: 'WRITE_SERVICE_DRY_RUN_DIRECT',
        operation: operation,
        error:
          'Safe Write phải ở DRY_RUN/enabled=false trước khi chạy 3K-C. mode=' +
          safeWrite.mode +
          ', enabled=' +
          safeWrite.enabled,
        safeWriteStatus: safeWrite
      };
    }

    var writeResponse =
      kidlearnV3_writeServiceSubmitV3({
        operation: operation,
        dryRun: true,
        payload: payload,
        source: 'LEARNING_ACTIONS_3KC_DRY_RUN_DIRECT'
      });

    return {
      success:
        writeResponse &&
        writeResponse.success === true,
      method: 'WRITE_SERVICE_DRY_RUN_DIRECT',
      operation: operation,
      response: writeResponse,
      safeWriteStatus: safeWrite
    };

  } catch (error) {
    return {
      success: false,
      method: 'WRITE_SERVICE_DRY_RUN_DIRECT',
      operation: operation,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Check target sheets.
 */
function kidlearnV3_3kcCheckTargetSheets_() {
  var errors = [];
  var items = [];

  var spreadsheet =
    kidlearnV3_3kcGetDatabaseSpreadsheet_();

  for (
    var i = 0;
    i < KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS[i];

    var sheet =
      kidlearnV3_3kcGetSheet_(
        spreadsheet,
        sheetName
      );

    if (!sheet) {
      errors.push(
        'Thiếu target sheet: ' +
        sheetName
      );

      items.push({
        sheetName: sheetName,
        exists: false
      });

      continue;
    }

    items.push({
      sheetName: sheetName,
      exists: true,
      lastRow: sheet.getLastRow(),
      lastColumn: sheet.getLastColumn()
    });
  }

  return {
    errors: errors,
    items: items
  };
}


/**
 * Snapshot sheets.
 */
function kidlearnV3_3kcSnapshotSheets_(sheetNames) {
  var spreadsheet =
    kidlearnV3_3kcGetDatabaseSpreadsheet_();

  var items = [];

  for (var i = 0; i < sheetNames.length; i++) {
    items.push(
      kidlearnV3_3kcSnapshotSheet_(
        spreadsheet,
        sheetNames[i]
      )
    );
  }

  return {
    capturedAt:
      new Date().toISOString(),
    items: items
  };
}


/**
 * Snapshot one sheet.
 */
function kidlearnV3_3kcSnapshotSheet_(
  spreadsheet,
  sheetName
) {
  var sheet =
    kidlearnV3_3kcGetSheet_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return {
      sheetName: sheetName,
      exists: false,
      lastRow: 0,
      lastColumn: 0,
      checksum: ''
    };
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  var values = [];

  if (
    lastRow > 0 &&
    lastColumn > 0
  ) {
    values =
      sheet
        .getRange(
          1,
          1,
          lastRow,
          lastColumn
        )
        .getDisplayValues();
  }

  return {
    sheetName: sheetName,
    exists: true,
    lastRow: lastRow,
    lastColumn: lastColumn,
    checksum:
      kidlearnV3_3kcMd5_(
        JSON.stringify(values)
      )
  };
}


/**
 * Compare no-write.
 */
function kidlearnV3_3kcCompareNoWrite_(
  beforeSnapshot,
  afterSnapshot
) {
  var errors = [];
  var changedSheets = [];

  var beforeMap =
    kidlearnV3_3kcMapSnapshots_(
      beforeSnapshot.items || []
    );

  var afterMap =
    kidlearnV3_3kcMapSnapshots_(
      afterSnapshot.items || []
    );

  for (
    var i = 0;
    i < KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS[i];

    var before =
      beforeMap[sheetName];

    var after =
      afterMap[sheetName];

    if (!before || !after) {
      errors.push(
        'Thiếu snapshot no-write cho sheet: ' +
        sheetName
      );

      continue;
    }

    if (
      before.lastRow !== after.lastRow ||
      before.checksum !== after.checksum
    ) {
      changedSheets.push(sheetName);

      errors.push(
        'DRY_RUN không được làm thay đổi sheet ' +
        sheetName +
        '. beforeLastRow=' +
        before.lastRow +
        ', afterLastRow=' +
        after.lastRow
      );
    }
  }

  return {
    success: errors.length === 0,
    changedSheetCount: changedSheets.length,
    changedSheets: changedSheets,
    errorCount: errors.length,
    errors: errors
  };
}


/**
 * Map snapshots.
 */
function kidlearnV3_3kcMapSnapshots_(items) {
  var map = {};

  for (var i = 0; i < items.length; i++) {
    map[items[i].sheetName] =
      items[i];
  }

  return map;
}


/**
 * Database spreadsheet.
 */
function kidlearnV3_3kcGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3kcResolveSpreadsheet_(
      database
    );

  if (!spreadsheet) {
    throw new Error(
      'Không resolve được Spreadsheet object từ Database V3.'
    );
  }

  return spreadsheet;
}


/**
 * Resolve Spreadsheet.
 */
function kidlearnV3_3kcResolveSpreadsheet_(value) {
  if (!value) {
    return null;
  }

  if (
    typeof value.getSheets === 'function' &&
    typeof value.getId === 'function'
  ) {
    return value;
  }

  if (
    value.spreadsheet &&
    typeof value.spreadsheet.getSheets === 'function'
  ) {
    return value.spreadsheet;
  }

  if (
    value.database &&
    typeof value.database.getSheets === 'function'
  ) {
    return value.database;
  }

  if (
    value.db &&
    typeof value.db.getSheets === 'function'
  ) {
    return value.db;
  }

  if (
    value.spreadsheetObject &&
    typeof value.spreadsheetObject.getSheets === 'function'
  ) {
    return value.spreadsheetObject;
  }

  if (
    value.activeSpreadsheet &&
    typeof value.activeSpreadsheet.getSheets === 'function'
  ) {
    return value.activeSpreadsheet;
  }

  if (value.spreadsheetId) {
    return SpreadsheetApp.openById(value.spreadsheetId);
  }

  if (value.databaseSpreadsheetId) {
    return SpreadsheetApp.openById(value.databaseSpreadsheetId);
  }

  if (
    value.id &&
    typeof value.id === 'string'
  ) {
    return SpreadsheetApp.openById(value.id);
  }

  return null;
}


/**
 * Get exact sheet.
 */
function kidlearnV3_3kcGetSheet_(
  spreadsheet,
  sheetName
) {
  if (
    typeof kidlearnV3_appGetSheetByExactName_ === 'function'
  ) {
    return kidlearnV3_appGetSheetByExactName_(
      spreadsheet,
      sheetName
    );
  }

  var sheets =
    spreadsheet.getSheets();

  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() === sheetName) {
      return sheets[i];
    }
  }

  return null;
}


/**
 * Safe assert 3K-B ready.
 */
function kidlearnV3_3kcSafeAssert3KBReady_() {
  try {
    var result =
      kidlearnV3_assertLearningUi3KBReadyV3();

    return {
      success: result.success === true,
      message: ''
    };

  } catch (error) {
    return {
      success: false,
      message:
        String(error.message || error)
    };
  }
}


/**
 * Safe Write status.
 */
function kidlearnV3_3kcSafeWriteStatus_() {
  try {
    return kidlearnV3_getSafeWriteLayerStatusV3();
  } catch (error) {
    return {
      success: false,
      mode: '',
      enabled: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Check functions.
 */
function kidlearnV3_3kcCheckFunctions_(names) {
  var errors = [];
  var items = [];

  for (var i = 0; i < names.length; i++) {
    var exists = false;

    try {
      exists =
        eval(
          'typeof ' +
          names[i] +
          ' === "function"'
        );
    } catch (error) {
      exists = false;
    }

    items.push({
      name: names[i],
      exists: exists
    });

    if (!exists) {
      errors.push(
        'Thiếu function: ' +
        names[i]
      );
    }
  }

  return {
    errors: errors,
    items: items
  };
}


/**
 * Save result.
 */
function kidlearnV3_3kcSaveResult_(
  result,
  status,
  dateKey
) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.READY_FOR_3K_D &&
    (
      status === KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.DRY_RUN_TESTED ||
      status === KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.SMOKE_TESTED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.READY_FOR_3K_D;
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      errors: result.errors || [],
      warnings: result.warnings || [],
      at: new Date().toISOString()
    })
  );
}


/**
 * Read last result.
 */
function kidlearnV3_3kcReadLastResult_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_RESULT_JSON
      );

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      raw: text
    };
  }
}


/**
 * Normalize request.
 */
function kidlearnV3_3kcNormalizeRequest_(request) {
  if (!request) {
    return {};
  }

  if (typeof request !== 'object') {
    return {
      value: request
    };
  }

  return request;
}


/**
 * Error message helper.
 */
function kidlearnV3_3kcGetErrorMessage_(response) {
  if (!response) {
    return 'Không có response.';
  }

  if (
    response.errors &&
    response.errors.length
  ) {
    return response.errors.join(' | ');
  }

  if (
    response.error &&
    response.error.message
  ) {
    return response.error.message;
  }

  if (
    response.response &&
    response.response.error &&
    response.response.error.message
  ) {
    return response.response.error.message;
  }

  if (response.error) {
    return String(response.error);
  }

  return JSON.stringify(response);
}


/**
 * Make transaction ID.
 */
function kidlearnV3_3kcMakeTransactionId_() {
  var text =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss_SSS'
    );

  var random =
    Math.floor(
      Math.random() * 100000
    );

  return (
    'UI_TX_3KC_DRYRUN_' +
    text +
    '_' +
    random
  );
}


/**
 * MD5 checksum.
 */
function kidlearnV3_3kcMd5_(text) {
  var digest =
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.MD5,
      text,
      Utilities.Charset.UTF_8
    );

  var result = '';

  for (var i = 0; i < digest.length; i++) {
    var value =
      digest[i];

    if (value < 0) {
      value += 256;
    }

    result +=
      ('0' + value.toString(16)).slice(-2);
  }

  return result;
}

/**
 * ================================================================
 * 3K-C ULTRA LITE DRY RUN
 * Purpose:
 * - Chạy 4 learning actions DRY_RUN thật nhanh.
 * - Không snapshot full sheet.
 * - Không checksum toàn bộ sheet.
 * - Không build dashboard lặp lại.
 * ================================================================
 */


/**
 * Run all 3K-C learning actions in DRY_RUN - ULTRA LITE.
 */
function kidlearnV3_runLearningActionsDryRunUltraLite3KCV3() {
  var startedAt =
    new Date();

  var errors = [];
  var warnings = [];

  var assert3KB =
    kidlearnV3_assertLearningUi3KBReadyV3();

  if (!assert3KB.success) {
    throw new Error(
      '3K-B chưa ready, không thể chạy 3K-C Ultra Lite.'
    );
  }

  var safeWrite =
    kidlearnV3_3kcSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    throw new Error(
      '3K-C Ultra Lite yêu cầu Safe Write DRY_RUN/enabled=false. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var beforeCounts =
    kidlearnV3_3kcSnapshotRowCountsOnly_(
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS
    );

  var context =
    kidlearnV3_3kcBuildActionContext_({});

  var actions = [
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.START_LESSON,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.UPDATE_PROGRESS,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.FINISH_LESSON,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.UPSERT_DAILY_GOAL
  ];

  var items = [];

  for (var i = 0; i < actions.length; i++) {
    var actionCode =
      actions[i];

    try {
      var operationPayload =
        kidlearnV3_3kcBuildOperationPayload_(
          actionCode,
          context,
          {}
        );

      var dispatch =
        kidlearnV3_3kcDispatchDryRunWrite_(
          operationPayload.operation,
          operationPayload.payload
        );

      var item = {
        success:
          dispatch.success === true,
        actionCode: actionCode,
        operation:
          operationPayload.operation,
        method:
          dispatch.method || '',
        error:
          dispatch.success === true
            ? ''
            : kidlearnV3_3kcGetErrorMessage_(
                dispatch
              )
      };

      items.push(item);

      if (!item.success) {
        errors.push(
          actionCode +
          ': ' +
          item.error
        );
      }

    } catch (error) {
      errors.push(
        actionCode +
        ': ' +
        String(error.message || error)
      );

      items.push({
        success: false,
        actionCode: actionCode,
        error:
          String(error.message || error)
      });
    }
  }

  SpreadsheetApp.flush();

  var afterCounts =
    kidlearnV3_3kcSnapshotRowCountsOnly_(
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS
    );

  var noWriteCheck =
    kidlearnV3_3kcCompareRowCountsOnly_(
      beforeCounts,
      afterCounts
    );

  errors =
    errors.concat(
      noWriteCheck.errors || []
    );

  var finishedAt =
    new Date();

  var result = {
    success: errors.length === 0,
    action: 'RUN_LEARNING_ACTIONS_DRY_RUN_ULTRA_LITE_3KC_V3',
    bundle: '3K-C',
    phase: KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.PHASE,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    transactionId:
      context.transactionId,
    startedAt:
      startedAt.toISOString(),
    finishedAt:
      finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    actionCount:
      actions.length,
    errorCount:
      errors.length,
    warningCount:
      warnings.length,
    errors: errors,
    warnings: warnings,
    items: items,
    noWriteCheck:
      noWriteCheck,
    safeWriteStatus:
      kidlearnV3_3kcSafeWriteStatus_()
  };

  kidlearnV3_3kcSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.DRY_RUN_TESTED
      : KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_DRY_RUN_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3K-C Ultra Lite failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Snapshot row counts only.
 */
function kidlearnV3_3kcSnapshotRowCountsOnly_(
  sheetNames
) {
  var spreadsheet =
    kidlearnV3_3kcGetDatabaseSpreadsheet_();

  var items = [];

  for (var i = 0; i < sheetNames.length; i++) {
    var sheetName =
      sheetNames[i];

    var sheet =
      kidlearnV3_3kcGetSheet_(
        spreadsheet,
        sheetName
      );

    if (!sheet) {
      items.push({
        sheetName: sheetName,
        exists: false,
        lastRow: 0,
        lastColumn: 0
      });

      continue;
    }

    items.push({
      sheetName: sheetName,
      exists: true,
      lastRow:
        sheet.getLastRow(),
      lastColumn:
        sheet.getLastColumn()
    });
  }

  return {
    capturedAt:
      new Date().toISOString(),
    items: items
  };
}


/**
 * Compare row counts only.
 */
function kidlearnV3_3kcCompareRowCountsOnly_(
  beforeSnapshot,
  afterSnapshot
) {
  var errors = [];
  var changedSheets = [];

  var beforeMap =
    kidlearnV3_3kcMapSnapshots_(
      beforeSnapshot.items || []
    );

  var afterMap =
    kidlearnV3_3kcMapSnapshots_(
      afterSnapshot.items || []
    );

  for (
    var i = 0;
    i < KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS[i];

    var before =
      beforeMap[sheetName];

    var after =
      afterMap[sheetName];

    if (!before || !after) {
      errors.push(
        'Thiếu row-count snapshot cho sheet: ' +
        sheetName
      );

      continue;
    }

    if (before.exists !== after.exists) {
      changedSheets.push(sheetName);

      errors.push(
        sheetName +
        ' thay đổi trạng thái exists trong DRY_RUN.'
      );

      continue;
    }

    if (
      before.lastRow !== after.lastRow ||
      before.lastColumn !== after.lastColumn
    ) {
      changedSheets.push(sheetName);

      errors.push(
        'DRY_RUN không được đổi row/column count của ' +
        sheetName +
        '. before=' +
        before.lastRow +
        'x' +
        before.lastColumn +
        ', after=' +
        after.lastRow +
        'x' +
        after.lastColumn
      );
    }
  }

  return {
    success: errors.length === 0,
    changedSheetCount:
      changedSheets.length,
    changedSheets:
      changedSheets,
    errorCount:
      errors.length,
    errors:
      errors
  };
}


================================================
FILE: App_Learning_Flow_3KD_V3.gs
================================================
/**
 * ================================================================
 * KIDLEARN V3 - LEARNING FLOW REVIEW & CLOSE
 * Bundle: 3K-D
 * Steps:
 * - 3K.10: E2E Learning Flow DRY_RUN Ultra Lite
 * - 3K.11: Post-review Learning Flow
 * - 3K.12: Close Phase 3K
 * Version: 3.1.0
 * ================================================================
 *
 * 3K-D không ghi dữ liệu học tập thật.
 * QA batch 3K-D chỉ chạy đến READY_TO_CLOSE_3K.
 * Close Phase 3K phải chạy riêng bằng hàm close.
 */


var KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3KD_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3KD_LAST_PREVIEW_AT',
  LAST_E2E_AT: 'KIDLEARN_V3_PHASE_3KD_LAST_E2E_AT',
  LAST_REVIEW_AT: 'KIDLEARN_V3_PHASE_3KD_LAST_REVIEW_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3KD_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3KD_LAST_RESULT_JSON',

  PHASE_3K_CLOSE_STATUS: 'KIDLEARN_V3_PHASE_3K_CLOSE_STATUS',
  PHASE_3K_CLOSED_AT: 'KIDLEARN_V3_PHASE_3K_CLOSED_AT',
  PHASE_3K_NEXT_PHASE: 'KIDLEARN_V3_PHASE_3K_NEXT_PHASE',
  PHASE_3K_CLOSE_RESULT_JSON: 'KIDLEARN_V3_PHASE_3K_CLOSE_RESULT_JSON'
};


var KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  E2E_TESTED: 'E2E_TESTED',
  REVIEW_PASSED: 'REVIEW_PASSED',
  READY_TO_CLOSE_3K: 'READY_TO_CLOSE_3K',
  CLOSED: 'CLOSED',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG = {
  VERSION: '3K-D',
  PHASE: '3K.10_3K.11_3K.12',
  NEXT_PHASE: '3L',
  WRITE_MODE: 'DRY_RUN_ONLY',
  CLOSE_STATUS: 'CLOSED_LOCKED'
};


var KIDLEARN_V3_LEARNING_FLOW_3KD_TARGET_SHEETS = [
  'LOG_Audit',
  'DATA_StudySessions',
  'DATA_LessonProgress',
  'DATA_DailyGoals',
  'DATA_Assignments'
];


/**
 * Preview 3K-D.
 */
function kidlearnV3_previewLearningFlow3KDV3() {
  var errors = [];
  var warnings = [];

  var functionChecks =
    kidlearnV3_3kdCheckFunctions_([
      'kidlearnV3_assertLearningActions3KCReadyV3',
      'kidlearnV3_runLearningActionsDryRunUltraLite3KCV3',
      'kidlearnV3_markLearningActions3KCReadyLiteForBatchV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_appGetActiveDatabaseV3_',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors =
    errors.concat(
      functionChecks.errors
    );

  var phase3KC =
    kidlearnV3_3kdSafeAssert3KCReady_();

  if (!phase3KC.success) {
    errors.push(
      '3K-C chưa READY_FOR_3K_D: ' +
      phase3KC.message
    );
  }

  var safeWrite =
    kidlearnV3_3kdSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      '3K-D yêu cầu Safe Write DRY_RUN/enabled=false. Hiện tại mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var sheetCheck =
    kidlearnV3_3kdCheckTargetSheets_();

  errors =
    errors.concat(
      sheetCheck.errors
    );

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_LEARNING_FLOW_3KD_V3',
    bundle: '3K-D',
    phase: KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG.PHASE,
    nextPhase: KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG.NEXT_PHASE,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    closePhaseIncludedInBatch: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3KC: phase3KC,
    safeWriteStatus: safeWrite,
    functionChecks: functionChecks.items,
    targetSheets: sheetCheck.items
  };

  kidlearnV3_3kdSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.PREVIEWED,
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_PREVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Run E2E Learning Flow 3K-D.
 *
 * Bản Ultra Lite:
 * - Không full checksum.
 * - Không refresh dashboard nhiều lần.
 * - Gọi lại 3K-C Ultra Lite để mô phỏng Start/Progress/Finish/DailyGoal.
 * - Kiểm tra row count không đổi.
 */
function kidlearnV3_runLearningFlowE2E3KDV3() {
  var startedAt =
    new Date();

  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewLearningFlow3KDV3();

  if (!preview.success) {
    throw new Error(
      'Không thể chạy 3K-D E2E vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var beforeCounts =
    kidlearnV3_3kdSnapshotRowCountsOnly_(
      KIDLEARN_V3_LEARNING_FLOW_3KD_TARGET_SHEETS
    );

  var flowResult = null;
  var restore3KCReady = null;

  try {
    flowResult =
      kidlearnV3_runLearningActionsDryRunUltraLite3KCV3();

    if (!flowResult.success) {
      errors.push(
        '3K-C Ultra Lite flow không success.'
      );
    }

  } catch (error) {
    errors.push(
      'Lỗi khi chạy 3K-C Ultra Lite flow: ' +
      String(error.message || error)
    );
  }

  try {
    if (
      typeof kidlearnV3_markLearningActions3KCReadyLiteForBatchV3 === 'function'
    ) {
      restore3KCReady =
        kidlearnV3_markLearningActions3KCReadyLiteForBatchV3();

      if (
        restore3KCReady &&
        restore3KCReady.success === false
      ) {
        warnings.push(
          'Không restore được 3K-C READY bằng lite helper.'
        );
      }
    }

  } catch (restoreError) {
    warnings.push(
      'Restore 3K-C READY warning: ' +
      String(restoreError.message || restoreError)
    );
  }

  SpreadsheetApp.flush();

  var afterCounts =
    kidlearnV3_3kdSnapshotRowCountsOnly_(
      KIDLEARN_V3_LEARNING_FLOW_3KD_TARGET_SHEETS
    );

  var noWriteCheck =
    kidlearnV3_3kdCompareRowCountsOnly_(
      beforeCounts,
      afterCounts
    );

  errors =
    errors.concat(
      noWriteCheck.errors || []
    );

  var safeWrite =
    kidlearnV3_3kdSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Sau 3K-D E2E, Safe Write phải ở DRY_RUN/enabled=false.'
    );
  }

  var finishedAt =
    new Date();

  var result = {
    success: errors.length === 0,
    action: 'RUN_LEARNING_FLOW_E2E_3KD_V3',
    bundle: '3K-D',
    phase: '3K.10',
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    startedAt:
      startedAt.toISOString(),
    finishedAt:
      finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    flowResultSummary:
      flowResult
        ? {
            success: flowResult.success,
            action: flowResult.action,
            actionCount: flowResult.actionCount,
            errorCount: flowResult.errorCount,
            noWriteCheck: flowResult.noWriteCheck
          }
        : null,
    restore3KCReady: restore3KCReady,
    noWriteCheck: noWriteCheck,
    safeWriteStatus: safeWrite
  };

  kidlearnV3_3kdSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.E2E_TESTED
      : KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_E2E_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3K-D E2E failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Post-review 3K-D.
 */
function kidlearnV3_runPostLearningFlowReview3KDV3() {
  var startedAt =
    new Date();

  var errors = [];
  var warnings = [];

  var status =
    kidlearnV3_getLearningFlow3KDStatusV3();

  var allowedStatus = {
    E2E_TESTED: true,
    REVIEW_PASSED: true,
    READY_TO_CLOSE_3K: true,
    CLOSED: true
  };

  if (!allowedStatus[status.status]) {
    errors.push(
      '3K-D chưa có trạng thái hợp lệ để post-review. Status=' +
      status.status
    );
  }

  var last =
    status.lastResult || {};

  if (
    last.action !== 'RUN_LEARNING_FLOW_E2E_3KD_V3' &&
    status.status !== 'REVIEW_PASSED' &&
    status.status !== 'READY_TO_CLOSE_3K' &&
    status.status !== 'CLOSED'
  ) {
    errors.push(
      'Last result không phải E2E 3K-D.'
    );
  }

  if (
    last.noWriteCheck &&
    last.noWriteCheck.success !== true
  ) {
    errors.push(
      'No-write check trong E2E 3K-D chưa pass.'
    );
  }

  var safeWrite =
    kidlearnV3_3kdSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Post-review 3K-D yêu cầu Safe Write DRY_RUN/enabled=false.'
    );
  }

  var controlledWrite =
    kidlearnV3_3kdControlledWriteStatus_();

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    errors.push(
      'Controlled Write vẫn ENABLED, không được review pass.'
    );
  }

  var phase3KC =
    kidlearnV3_3kdSafeAssert3KCReady_();

  if (!phase3KC.success) {
    warnings.push(
      '3K-C assert warning trong post-review: ' +
      phase3KC.message
    );
  }

  var finishedAt =
    new Date();

  var result = {
    success: errors.length === 0,
    action: 'RUN_POST_LEARNING_FLOW_REVIEW_3KD_V3',
    bundle: '3K-D',
    phase: '3K.11',
    decision:
      errors.length === 0
        ? 'READY_TO_CLOSE_PHASE_3K'
        : 'HOLD_PHASE_3K',
    canClosePhase3K:
      errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    statusBeforeReview: status.status,
    safeWriteStatus: safeWrite,
    controlledWriteStatus: controlledWrite,
    phase3KC: phase3KC,
    startedAt:
      startedAt.toISOString(),
    finishedAt:
      finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime()
  };

  kidlearnV3_3kdSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.REVIEW_PASSED
      : KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_REVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Post-review 3K-D failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 3K-D ready to close Phase 3K.
 */
function kidlearnV3_markLearningFlow3KDReadyToCloseV3() {
  var review =
    kidlearnV3_runPostLearningFlowReview3KDV3();

  if (!review.success) {
    throw new Error(
      'Không thể mark 3K-D ready vì review chưa pass.'
    );
  }

  var result = {
    success: true,
    action: 'MARK_LEARNING_FLOW_3KD_READY_TO_CLOSE_V3',
    bundle: '3K-D',
    phase: '3K.11',
    status:
      KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.READY_TO_CLOSE_3K,
    nextManualStep:
      'kidlearnV3_closePhase3KV3',
    nextPhase:
      KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG.NEXT_PHASE,
    message:
      '3K-D đã ready. Có thể chạy riêng close Phase 3K.'
  };

  kidlearnV3_3kdSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.READY_TO_CLOSE_3K,
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3K-D ready to close.
 */
function kidlearnV3_assertLearningFlow3KDReadyToCloseV3() {
  var status =
    kidlearnV3_getLearningFlow3KDStatusV3();

  var errors = [];

  if (
    status.status !==
      KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.READY_TO_CLOSE_3K &&
    status.status !==
      KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.CLOSED
  ) {
    errors.push(
      '3K-D chưa READY_TO_CLOSE_3K/CLOSED. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_LEARNING_FLOW_3KD_READY_TO_CLOSE_V3',
    bundle: '3K-D',
    phase: '3K.11',
    status: status.status,
    nextManualStep:
      'kidlearnV3_closePhase3KV3',
    errorCount: errors.length,
    errors: errors
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3K-D chưa ready to close. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Close Phase 3K.
 *
 * Bước này chạy riêng, không đưa vào QA batch tự động.
 */
function kidlearnV3_closePhase3KV3() {
  var ready =
    kidlearnV3_assertLearningFlow3KDReadyToCloseV3();

  if (!ready.success) {
    throw new Error(
      'Không thể close Phase 3K vì 3K-D chưa ready.'
    );
  }

  var safeWrite =
    kidlearnV3_3kdSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    throw new Error(
      'Không thể close Phase 3K khi Safe Write chưa DRY_RUN/enabled=false.'
    );
  }

  var controlledWrite =
    kidlearnV3_3kdControlledWriteStatus_();

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    throw new Error(
      'Không thể close Phase 3K khi Controlled Write còn ENABLED.'
    );
  }

  var now =
    new Date();

  var closeResult = {
    success: true,
    action: 'CLOSE_PHASE_3K_V3',
    phase: '3K.12',
    status:
      KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG.CLOSE_STATUS,
    closedAt:
      now.toISOString(),
    nextPhase:
      KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG.NEXT_PHASE,
    summary: {
      phase3KA:
        'READY_FOR_3K_B',
      phase3KB:
        'READY_FOR_3K_C',
      phase3KC:
        'READY_FOR_3K_D',
      phase3KD:
        'READY_TO_CLOSE_3K',
      safeWriteMode:
        safeWrite.mode,
      safeWriteEnabled:
        safeWrite.enabled,
      controlledWriteStatus:
        controlledWrite.status || '',
      prodTouched:
        false
    }
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.PHASE_3K_CLOSE_STATUS,
    KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG.CLOSE_STATUS
  );

  properties.setProperty(
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.PHASE_3K_CLOSED_AT,
    now.toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.PHASE_3K_NEXT_PHASE,
    KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG.NEXT_PHASE
  );

  properties.setProperty(
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.PHASE_3K_CLOSE_RESULT_JSON,
    JSON.stringify(closeResult)
  );

  properties.setProperty(
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.STATUS,
    KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.CLOSED
  );

  console.log(
    JSON.stringify(closeResult, null, 2)
  );

  return closeResult;
}


/**
 * Get Phase 3K close status.
 */
function kidlearnV3_getPhase3KCloseStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PHASE_3K_CLOSE_STATUS_V3',
    phase: '3K.12',
    status:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.PHASE_3K_CLOSE_STATUS
      ) ||
      'NOT_CLOSED',
    closedAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.PHASE_3K_CLOSED_AT
      ) ||
      '',
    nextPhase:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.PHASE_3K_NEXT_PHASE
      ) ||
      '',
    closeResult:
      kidlearnV3_3kdReadJsonProperty_(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.PHASE_3K_CLOSE_RESULT_JSON
      ),
    learningFlow3KD:
      kidlearnV3_getLearningFlow3KDStatusV3(),
    safeWriteStatus:
      kidlearnV3_3kdSafeWriteStatus_(),
    controlledWriteStatus:
      kidlearnV3_3kdControlledWriteStatus_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert Phase 3K closed.
 */
function kidlearnV3_assertPhase3KClosedV3() {
  var status =
    kidlearnV3_getPhase3KCloseStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG.CLOSE_STATUS
  ) {
    errors.push(
      'Phase 3K chưa CLOSED_LOCKED. Status=' +
      status.status
    );
  }

  if (status.nextPhase !== '3L') {
    errors.push(
      'Next phase phải là 3L. Hiện tại=' +
      status.nextPhase
    );
  }

  var safeWrite =
    status.safeWriteStatus || {};

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Sau khi close 3K, Safe Write phải DRY_RUN/enabled=false.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PHASE_3K_CLOSED_V3',
    phase: '3K.12',
    status: status.status,
    nextPhase: status.nextPhase,
    errorCount: errors.length,
    errors: errors,
    safeWriteStatus: safeWrite
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Phase 3K chưa close đúng. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Get 3K-D status.
 */
function kidlearnV3_getLearningFlow3KDStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_LEARNING_FLOW_3KD_STATUS_V3',
    bundle: '3K-D',
    phase: KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.STATUS
      ) ||
      KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastE2EAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_E2E_AT
      ) ||
      '',
    lastReviewAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_REVIEW_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3kdReadJsonProperty_(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * QA steps 3K-D.
 *
 * Không chứa close phase.
 */
function kidlearnV3_getQaBatchSteps3KDV3() {
  return [
    {
      label: 'Assert 3K-C ready',
      functionName: 'kidlearnV3_assertLearningActions3KCReadyV3'
    },
    {
      label: 'Preview 3K-D',
      functionName: 'kidlearnV3_previewLearningFlow3KDV3'
    },
    {
      label: 'Run E2E Learning Flow 3K-D',
      functionName: 'kidlearnV3_runLearningFlowE2E3KDV3'
    },
    {
      label: 'Post-review Learning Flow 3K-D',
      functionName: 'kidlearnV3_runPostLearningFlowReview3KDV3'
    },
    {
      label: 'Mark 3K-D ready to close',
      functionName: 'kidlearnV3_markLearningFlow3KDReadyToCloseV3'
    },
    {
      label: 'Assert 3K-D ready to close',
      functionName: 'kidlearnV3_assertLearningFlow3KDReadyToCloseV3'
    }
  ];
}


/**
 * Run QA batch 3K-D.
 */
function kidlearnV3_runQaBatch3KDV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3K_D_LITE',
    kidlearnV3_getQaBatchSteps3KDV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Check target sheets.
 */
function kidlearnV3_3kdCheckTargetSheets_() {
  var errors = [];
  var items = [];

  var spreadsheet =
    kidlearnV3_3kdGetDatabaseSpreadsheet_();

  for (
    var i = 0;
    i < KIDLEARN_V3_LEARNING_FLOW_3KD_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_LEARNING_FLOW_3KD_TARGET_SHEETS[i];

    var sheet =
      kidlearnV3_3kdGetSheet_(
        spreadsheet,
        sheetName
      );

    if (!sheet) {
      errors.push(
        'Thiếu target sheet: ' +
        sheetName
      );

      items.push({
        sheetName: sheetName,
        exists: false
      });

      continue;
    }

    items.push({
      sheetName: sheetName,
      exists: true,
      lastRow: sheet.getLastRow(),
      lastColumn: sheet.getLastColumn()
    });
  }

  return {
    errors: errors,
    items: items
  };
}


/**
 * Snapshot row counts only.
 */
function kidlearnV3_3kdSnapshotRowCountsOnly_(
  sheetNames
) {
  var spreadsheet =
    kidlearnV3_3kdGetDatabaseSpreadsheet_();

  var items = [];

  for (var i = 0; i < sheetNames.length; i++) {
    var sheetName =
      sheetNames[i];

    var sheet =
      kidlearnV3_3kdGetSheet_(
        spreadsheet,
        sheetName
      );

    if (!sheet) {
      items.push({
        sheetName: sheetName,
        exists: false,
        lastRow: 0,
        lastColumn: 0
      });

      continue;
    }

    items.push({
      sheetName: sheetName,
      exists: true,
      lastRow: sheet.getLastRow(),
      lastColumn: sheet.getLastColumn()
    });
  }

  return {
    capturedAt:
      new Date().toISOString(),
    items: items
  };
}


/**
 * Compare row counts only.
 */
function kidlearnV3_3kdCompareRowCountsOnly_(
  beforeSnapshot,
  afterSnapshot
) {
  var errors = [];
  var changedSheets = [];

  var beforeMap =
    kidlearnV3_3kdMapSnapshots_(
      beforeSnapshot.items || []
    );

  var afterMap =
    kidlearnV3_3kdMapSnapshots_(
      afterSnapshot.items || []
    );

  for (
    var i = 0;
    i < KIDLEARN_V3_LEARNING_FLOW_3KD_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_LEARNING_FLOW_3KD_TARGET_SHEETS[i];

    var before =
      beforeMap[sheetName];

    var after =
      afterMap[sheetName];

    if (!before || !after) {
      errors.push(
        'Thiếu row-count snapshot cho sheet: ' +
        sheetName
      );

      continue;
    }

    if (before.exists !== after.exists) {
      changedSheets.push(sheetName);

      errors.push(
        sheetName +
        ' thay đổi trạng thái exists trong DRY_RUN.'
      );

      continue;
    }

    if (
      before.lastRow !== after.lastRow ||
      before.lastColumn !== after.lastColumn
    ) {
      changedSheets.push(sheetName);

      errors.push(
        'DRY_RUN không được đổi row/column count của ' +
        sheetName +
        '. before=' +
        before.lastRow +
        'x' +
        before.lastColumn +
        ', after=' +
        after.lastRow +
        'x' +
        after.lastColumn
      );
    }
  }

  return {
    success: errors.length === 0,
    changedSheetCount: changedSheets.length,
    changedSheets: changedSheets,
    errorCount: errors.length,
    errors: errors
  };
}


/**
 * Map snapshots.
 */
function kidlearnV3_3kdMapSnapshots_(
  items
) {
  var map = {};

  for (var i = 0; i < items.length; i++) {
    map[items[i].sheetName] =
      items[i];
  }

  return map;
}


/**
 * Database spreadsheet.
 */
function kidlearnV3_3kdGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3kdResolveSpreadsheet_(
      database
    );

  if (!spreadsheet) {
    throw new Error(
      'Không resolve được Spreadsheet object từ Database V3.'
    );
  }

  return spreadsheet;
}


/**
 * Resolve Spreadsheet.
 */
function kidlearnV3_3kdResolveSpreadsheet_(
  value
) {
  if (!value) {
    return null;
  }

  if (
    typeof value.getSheets === 'function' &&
    typeof value.getId === 'function'
  ) {
    return value;
  }

  if (
    value.spreadsheet &&
    typeof value.spreadsheet.getSheets === 'function'
  ) {
    return value.spreadsheet;
  }

  if (
    value.database &&
    typeof value.database.getSheets === 'function'
  ) {
    return value.database;
  }

  if (
    value.db &&
    typeof value.db.getSheets === 'function'
  ) {
    return value.db;
  }

  if (
    value.spreadsheetObject &&
    typeof value.spreadsheetObject.getSheets === 'function'
  ) {
    return value.spreadsheetObject;
  }

  if (
    value.activeSpreadsheet &&
    typeof value.activeSpreadsheet.getSheets === 'function'
  ) {
    return value.activeSpreadsheet;
  }

  if (value.spreadsheetId) {
    return SpreadsheetApp.openById(
      value.spreadsheetId
    );
  }

  if (value.databaseSpreadsheetId) {
    return SpreadsheetApp.openById(
      value.databaseSpreadsheetId
    );
  }

  if (
    value.id &&
    typeof value.id === 'string'
  ) {
    return SpreadsheetApp.openById(
      value.id
    );
  }

  return null;
}


/**
 * Get exact sheet.
 */
function kidlearnV3_3kdGetSheet_(
  spreadsheet,
  sheetName
) {
  if (
    typeof kidlearnV3_appGetSheetByExactName_ === 'function'
  ) {
    return kidlearnV3_appGetSheetByExactName_(
      spreadsheet,
      sheetName
    );
  }

  var sheets =
    spreadsheet.getSheets();

  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() === sheetName) {
      return sheets[i];
    }
  }

  return null;
}


/**
 * Safe assert 3K-C ready.
 */
function kidlearnV3_3kdSafeAssert3KCReady_() {
  try {
    var result =
      kidlearnV3_assertLearningActions3KCReadyV3();

    return {
      success: result.success === true,
      message: ''
    };

  } catch (error) {
    return {
      success: false,
      message:
        String(error.message || error)
    };
  }
}


/**
 * Safe Write status.
 */
function kidlearnV3_3kdSafeWriteStatus_() {
  try {
    return kidlearnV3_getSafeWriteLayerStatusV3();
  } catch (error) {
    return {
      success: false,
      mode: '',
      enabled: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Controlled Write status.
 */
function kidlearnV3_3kdControlledWriteStatus_() {
  try {
    if (
      typeof kidlearnV3_getControlledWriteDevStatusV3 === 'function'
    ) {
      var result =
        kidlearnV3_getControlledWriteDevStatusV3();

      result.available = true;

      return result;
    }

    return {
      available: false,
      success: false,
      status: '',
      safeWriteMode: '',
      safeWriteEnabled: false,
      error:
        'Missing kidlearnV3_getControlledWriteDevStatusV3'
    };

  } catch (error) {
    return {
      available: false,
      success: false,
      status: '',
      safeWriteMode: '',
      safeWriteEnabled: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Check functions.
 */
function kidlearnV3_3kdCheckFunctions_(
  names
) {
  var errors = [];
  var items = [];

  for (var i = 0; i < names.length; i++) {
    var exists = false;

    try {
      exists =
        eval(
          'typeof ' +
          names[i] +
          ' === "function"'
        );
    } catch (error) {
      exists = false;
    }

    items.push({
      name: names[i],
      exists: exists
    });

    if (!exists) {
      errors.push(
        'Thiếu function: ' +
        names[i]
      );
    }
  }

  return {
    errors: errors,
    items: items
  };
}


/**
 * Save result.
 */
function kidlearnV3_3kdSaveResult_(
  result,
  status,
  dateKey
) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.READY_TO_CLOSE_3K &&
    (
      status === KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.E2E_TESTED ||
      status === KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.REVIEW_PASSED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.READY_TO_CLOSE_3K;
  }

  if (
    currentStatus === KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.CLOSED
  ) {
    finalStatus =
      KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.CLOSED;
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      errors: result.errors || [],
      warnings: result.warnings || [],
      noWriteCheck: result.noWriteCheck || null,
      at: new Date().toISOString()
    })
  );
}


/**
 * Read JSON property.
 */
function kidlearnV3_3kdReadJsonProperty_(
  key
) {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(key);

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      raw: text
    };
  }
}


================================================
FILE: App_Learning_Interaction_3LC_V3.gs
================================================
/**
 * ================================================================
 * KIDLEARN V3 - LEARNING INTERACTION DRY RUN UI
 * Bundle: 3L-C
 * Step:
 * - 3L-C: Learning Interaction DRY_RUN UI
 * Version: 3.1.0
 * ================================================================
 *
 * 3L-C:
 * - DRY_RUN ONLY
 * - Không ghi DB thật
 * - Không real write
 * - Không rollback
 * - Không migration
 * - Không close phase
 */


var KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3LC_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3LC_LAST_PREVIEW_AT',
  LAST_BUILD_AT: 'KIDLEARN_V3_PHASE_3LC_LAST_BUILD_AT',
  LAST_DRY_RUN_AT: 'KIDLEARN_V3_PHASE_3LC_LAST_DRY_RUN_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3LC_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3LC_LAST_RESULT_JSON'
};


var KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  PAYLOAD_BUILT: 'PAYLOAD_BUILT',
  DRY_RUN_TESTED: 'DRY_RUN_TESTED',
  READY_FOR_3L_D: 'READY_FOR_3L_D',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG = {
  VERSION: '3L-C',
  PHASE: '3L-C',
  NEXT_BUNDLE: '3L-D',
  SCREEN_ID: 'LEARNING_INTERACTION_3LC',
  WRITE_MODE: 'DRY_RUN_ONLY',
  READ_ONLY: false,
  WRITE_ENABLED: false,
  REAL_WRITE_ALLOWED: false
};


var KIDLEARN_V3_LEARNING_INTERACTION_3LC_ACTIONS = {
  START_LESSON: 'START_LESSON',
  COMPLETE_BLOCK: 'COMPLETE_BLOCK',
  SUBMIT_ANSWER: 'SUBMIT_ANSWER',
  FINISH_LESSON: 'FINISH_LESSON'
};


var KIDLEARN_V3_LEARNING_INTERACTION_3LC_TARGET_SHEETS = [
  'LOG_Audit',
  'DATA_StudySessions',
  'DATA_LessonProgress',
  'DATA_DailyGoals',
  'DATA_Assignments'
];


/**
 * Preview 3L-C.
 */
function kidlearnV3_previewLearningInteraction3LCV3() {
  var errors = [];
  var warnings = [];

  var functionChecks =
    kidlearnV3_3lcCheckFunctions_([
      'kidlearnV3_assertLessonContent3LBReadyV3',
      'kidlearnV3_buildLessonContentUltraLite3LBV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_writeServiceSubmitV3',
      'kidlearnV3_appGetActiveDatabaseV3_',
      'kidlearnV3_runQaBatchProvidedStepsV3',
      'kidlearnV3_uiInclude_'
    ]);

  errors =
    errors.concat(
      functionChecks.errors
    );

  var htmlChecks =
    kidlearnV3_3lcCheckHtmlFiles_([
      'UI_Learning_Interaction_3LC_Client_V3',
      'UI_Learning_Interaction_3LC'
    ]);

  errors =
    errors.concat(
      htmlChecks.errors
    );

  var phase3LB =
    kidlearnV3_3lcSafeAssert3LBReady_();

  if (!phase3LB.success) {
    errors.push(
      '3L-B chưa READY_FOR_3L_C: ' +
      phase3LB.message
    );
  }

  var safeWrite =
    kidlearnV3_3lcSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      '3L-C yêu cầu Safe Write DRY_RUN/enabled=false. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var sheetCheck =
    kidlearnV3_3lcCheckTargetSheets_();

  errors =
    errors.concat(
      sheetCheck.errors
    );

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_LEARNING_INTERACTION_3LC_V3',
    bundle: '3L-C',
    phase: KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.NEXT_BUNDLE,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3LB: phase3LB,
    safeWriteStatus: safeWrite,
    functionChecks: functionChecks.items,
    htmlChecks: htmlChecks.items,
    targetSheets: sheetCheck.items
  };

  kidlearnV3_3lcSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.PREVIEWED,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_PREVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Build interaction payload.
 */
function kidlearnV3_buildLearningInteractionPayload3LCV3(request) {
  var req =
    kidlearnV3_3lcNormalizeRequest_(
      request
    );

  var preview =
    kidlearnV3_previewLearningInteraction3LCV3();

  if (!preview.success) {
    throw new Error(
      'Không thể build interaction 3L-C vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var payload =
    kidlearnV3_buildLearningInteractionPayloadUltraLite3LCV3(
      req
    );

  kidlearnV3_3lcSaveResult_(
    {
      success: true,
      action: 'BUILD_LEARNING_INTERACTION_PAYLOAD_3LC_V3',
      bundle: '3L-C',
      phase: KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.PHASE,
      errorCount: 0,
      warningCount: payload.warningCount || 0,
      warnings: payload.warnings || [],
      diagnostics: payload.diagnostics || {}
    },
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.PAYLOAD_BUILT,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_BUILD_AT
  );

  console.log(
    JSON.stringify(payload, null, 2)
  );

  return payload;
}


/**
 * Build interaction payload Ultra Lite.
 *
 * Không gọi preview để tránh lặp nặng.
 */
function kidlearnV3_buildLearningInteractionPayloadUltraLite3LCV3(request) {
  var req =
    kidlearnV3_3lcNormalizeRequest_(
      request
    );

  var errors = [];
  var warnings = [];

  var lessonContent =
    kidlearnV3_buildLessonContentUltraLite3LBV3(
      req
    );

  if (!lessonContent.success) {
    errors.push(
      'Lesson Content 3L-B trả success=false.'
    );
  }

  if (
    lessonContent.emptyState &&
    lessonContent.emptyState.noLesson
  ) {
    warnings.push(
      'Chưa có lesson thật. 3L-C dùng DEV fallback để test interaction DRY_RUN.'
    );
  }

  var context =
    kidlearnV3_3lcBuildInteractionContext_(
      lessonContent,
      req
    );

  var payload = {
    success: errors.length === 0,
    action: 'BUILD_LEARNING_INTERACTION_PAYLOAD_ULTRA_LITE_3LC_V3',
    bundle: '3L-C',
    phase: KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.PHASE,
    screenId:
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.SCREEN_ID,
    generatedAt:
      new Date().toISOString(),
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    lessonContent: lessonContent,
    interactionContext: context,
    interactionButtons:
      kidlearnV3_3lcBuildInteractionButtons_(
        context
      ),
    guards: {
      dryRunOnly: true,
      safeWriteExpectedMode: 'DRY_RUN',
      realWriteAllowed: false,
      prodTouched: false
    },
    diagnostics: {
      lessonId: context.lessonId,
      childId: context.childId,
      blockCount:
        lessonContent.blocks
          ? lessonContent.blocks.length
          : 0,
      actionCount: 4
    },
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  console.log(
    JSON.stringify(payload, null, 2)
  );

  return payload;
}


/**
 * UI dispatch one interaction in DRY_RUN.
 */
function kidlearnV3_runLearningInteractionDryRun3LCV3(request) {
  var req =
    kidlearnV3_3lcNormalizeRequest_(
      request
    );

  var actionCode =
    String(req.actionCode || '').trim();

  if (!actionCode) {
    throw new Error(
      'Thiếu actionCode cho 3L-C.'
    );
  }

  var safeWrite =
    kidlearnV3_3lcSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    throw new Error(
      '3L-C chỉ cho phép DRY_RUN khi Safe Write mode=DRY_RUN/enabled=false.'
    );
  }

  var beforeCounts =
    kidlearnV3_3lcSnapshotRowCountsOnly_(
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_TARGET_SHEETS
    );

  var payload =
    kidlearnV3_buildLearningInteractionPayloadUltraLite3LCV3(
      req
    );

  var operationPayload =
    kidlearnV3_3lcBuildOperationPayload_(
      actionCode,
      payload.interactionContext,
      req
    );

  var dispatch =
    kidlearnV3_3lcDispatchDryRunWrite_(
      operationPayload.operation,
      operationPayload.payload
    );

  SpreadsheetApp.flush();

  var afterCounts =
    kidlearnV3_3lcSnapshotRowCountsOnly_(
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_TARGET_SHEETS
    );

  var noWriteCheck =
    kidlearnV3_3lcCompareRowCountsOnly_(
      beforeCounts,
      afterCounts
    );

  var errors = [];

  if (!dispatch.success) {
    errors.push(
      'DRY_RUN dispatch thất bại: ' +
      kidlearnV3_3lcGetErrorMessage_(
        dispatch
      )
    );
  }

  errors =
    errors.concat(
      noWriteCheck.errors || []
    );

  var result = {
    success: errors.length === 0,
    action: 'RUN_LEARNING_INTERACTION_DRY_RUN_3LC_V3',
    bundle: '3L-C',
    phase: KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.PHASE,
    actionCode: actionCode,
    operation:
      operationPayload.operation,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    transactionId:
      payload.interactionContext.transactionId,
    errorCount: errors.length,
    errors: errors,
    dispatch: dispatch,
    noWriteCheck: noWriteCheck,
    uiState:
      kidlearnV3_3lcBuildUiStateAfterAction_(
        actionCode,
        payload.interactionContext,
        dispatch
      )
  };

  kidlearnV3_3lcSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.DRY_RUN_TESTED
      : KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_DRY_RUN_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3L-C interaction DRY_RUN failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Run all interactions DRY_RUN Ultra Lite.
 */
function kidlearnV3_runAllLearningInteractionsDryRunUltraLite3LCV3() {
  var startedAt =
    new Date();

  var errors = [];
  var items = [];

  var phase3LB =
    kidlearnV3_3lcSafeAssert3LBReady_();

  if (!phase3LB.success) {
    throw new Error(
      '3L-B chưa ready: ' +
      phase3LB.message
    );
  }

  var safeWrite =
    kidlearnV3_3lcSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    throw new Error(
      '3L-C yêu cầu Safe Write DRY_RUN/enabled=false.'
    );
  }

  var beforeCounts =
    kidlearnV3_3lcSnapshotRowCountsOnly_(
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_TARGET_SHEETS
    );

  var payload =
    kidlearnV3_buildLearningInteractionPayloadUltraLite3LCV3({});

  var context =
    payload.interactionContext;

  var actions = [
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_ACTIONS.START_LESSON,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_ACTIONS.COMPLETE_BLOCK,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_ACTIONS.SUBMIT_ANSWER,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_ACTIONS.FINISH_LESSON
  ];

  for (var i = 0; i < actions.length; i++) {
    var actionCode =
      actions[i];

    try {
      var operationPayload =
        kidlearnV3_3lcBuildOperationPayload_(
          actionCode,
          context,
          {}
        );

      var dispatch =
        kidlearnV3_3lcDispatchDryRunWrite_(
          operationPayload.operation,
          operationPayload.payload
        );

      var item = {
        success:
          dispatch.success === true,
        actionCode: actionCode,
        operation:
          operationPayload.operation,
        method:
          dispatch.method || '',
        error:
          dispatch.success === true
            ? ''
            : kidlearnV3_3lcGetErrorMessage_(dispatch)
      };

      items.push(item);

      if (!item.success) {
        errors.push(
          actionCode +
          ': ' +
          item.error
        );
      }

    } catch (error) {
      errors.push(
        actionCode +
        ': ' +
        String(error.message || error)
      );

      items.push({
        success: false,
        actionCode: actionCode,
        error:
          String(error.message || error)
      });
    }
  }

  SpreadsheetApp.flush();

  var afterCounts =
    kidlearnV3_3lcSnapshotRowCountsOnly_(
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_TARGET_SHEETS
    );

  var noWriteCheck =
    kidlearnV3_3lcCompareRowCountsOnly_(
      beforeCounts,
      afterCounts
    );

  errors =
    errors.concat(
      noWriteCheck.errors || []
    );

  var finishedAt =
    new Date();

  var result = {
    success: errors.length === 0,
    action: 'RUN_ALL_LEARNING_INTERACTIONS_DRY_RUN_ULTRA_LITE_3LC_V3',
    bundle: '3L-C',
    phase: KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.PHASE,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    startedAt:
      startedAt.toISOString(),
    finishedAt:
      finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    actionCount: actions.length,
    errorCount: errors.length,
    errors: errors,
    items: items,
    noWriteCheck: noWriteCheck,
    safeWriteStatus:
      kidlearnV3_3lcSafeWriteStatus_()
  };

  kidlearnV3_3lcSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.DRY_RUN_TESTED
      : KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_DRY_RUN_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3L-C run all interactions failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 3L-C ready.
 */
function kidlearnV3_markLearningInteraction3LCReadyV3() {
  var status =
    kidlearnV3_getLearningInteraction3LCStatusV3();

  var allowed = {
    DRY_RUN_TESTED: true,
    READY_FOR_3L_D: true
  };

  if (!allowed[status.status]) {
    throw new Error(
      'Không thể mark 3L-C ready. Status hiện tại=' +
      status.status +
      '. Cần chạy kidlearnV3_runAllLearningInteractionsDryRunUltraLite3LCV3 pass trước.'
    );
  }

  var result = {
    success: true,
    action: 'MARK_LEARNING_INTERACTION_3LC_READY_V3',
    bundle: '3L-C',
    phase: KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.PHASE,
    status:
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.READY_FOR_3L_D,
    nextBundle:
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.NEXT_BUNDLE,
    message:
      '3L-C ready. Có thể chuyển sang 3L-D để post-review và close Phase 3L.'
  };

  kidlearnV3_3lcSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.READY_FOR_3L_D,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Get 3L-C status.
 */
function kidlearnV3_getLearningInteraction3LCStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_LEARNING_INTERACTION_3LC_STATUS_V3',
    bundle: '3L-C',
    phase: KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.STATUS
      ) ||
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastBuildAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_BUILD_AT
      ) ||
      '',
    lastDryRunAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_DRY_RUN_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3lcReadLastResult_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3L-C ready.
 */
function kidlearnV3_assertLearningInteraction3LCReadyV3() {
  var status =
    kidlearnV3_getLearningInteraction3LCStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.READY_FOR_3L_D
  ) {
    errors.push(
      '3L-C chưa READY_FOR_3L_D. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_LEARNING_INTERACTION_3LC_READY_V3',
    bundle: '3L-C',
    phase: KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.NEXT_BUNDLE,
    errorCount: errors.length,
    errors: errors
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3L-C chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Open UI 3L-C.
 */
function kidlearnV3_showLearningInteraction3LCV3() {
  var preview =
    kidlearnV3_previewLearningInteraction3LCV3();

  if (!preview.success) {
    throw new Error(
      'Learning Interaction 3L-C chưa sẵn sàng. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var html =
    HtmlService
      .createTemplateFromFile(
        'UI_Learning_Interaction_3LC'
      )
      .evaluate()
      .setTitle(
        'KIDLEARN V3 - Learning Interaction 3L-C'
      )
      .setWidth(1250)
      .setHeight(880);

  SpreadsheetApp
    .getUi()
    .showModalDialog(
      html,
      'KIDLEARN V3 - Learning Interaction 3L-C'
    );
}


/**
 * UI get payload.
 */
function kidlearnV3_uiLearningInteraction3LCGetPayloadV3(request) {
  return kidlearnV3_buildLearningInteractionPayloadUltraLite3LCV3(
    request || {}
  );
}


/**
 * UI run action.
 */
function kidlearnV3_uiLearningInteraction3LCRunActionV3(request) {
  return kidlearnV3_runLearningInteractionDryRun3LCV3(
    request || {}
  );
}


/**
 * QA steps 3L-C.
 */
function kidlearnV3_getQaBatchSteps3LCV3() {
  return [
    {
      label: 'Assert 3L-B ready',
      functionName: 'kidlearnV3_assertLessonContent3LBReadyV3'
    },
    {
      label: 'Preview Learning Interaction 3L-C',
      functionName: 'kidlearnV3_previewLearningInteraction3LCV3'
    },
    {
      label: 'Build Interaction Payload Ultra Lite 3L-C',
      functionName: 'kidlearnV3_buildLearningInteractionPayloadUltraLite3LCV3'
    },
    {
      label: 'Run All Interactions DRY_RUN Ultra Lite 3L-C',
      functionName: 'kidlearnV3_runAllLearningInteractionsDryRunUltraLite3LCV3'
    },
    {
      label: 'Mark Learning Interaction 3L-C Ready',
      functionName: 'kidlearnV3_markLearningInteraction3LCReadyV3'
    },
    {
      label: 'Assert Learning Interaction 3L-C Ready',
      functionName: 'kidlearnV3_assertLearningInteraction3LCReadyV3'
    }
  ];
}


/**
 * QA batch 3L-C.
 */
function kidlearnV3_runQaBatch3LCV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3L_C_ULTRA_LITE',
    kidlearnV3_getQaBatchSteps3LCV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build interaction context.
 */
function kidlearnV3_3lcBuildInteractionContext_(lessonContent, request) {
  var req =
    kidlearnV3_3lcNormalizeRequest_(
      request
    );

  var lesson =
    lessonContent.lesson || {};

  var firstBlock =
    lessonContent.blocks && lessonContent.blocks.length > 0
      ? lessonContent.blocks[0]
      : {};

  var firstActivity =
    firstBlock.activities && firstBlock.activities.length > 0
      ? firstBlock.activities[0]
      : {};

  var transactionId =
    kidlearnV3_3lcMakeTransactionId_();

  return {
    transactionId: transactionId,
    childId:
      req.childId ||
      'DEV_CHILD_3LC',
    lessonId:
      req.lessonId ||
      lesson.lessonId ||
      'DEV_LESSON_3LC',
    lessonTitle:
      lesson.lessonTitle || 'DEV Lesson 3L-C',
    subjectId:
      lesson.subjectId ||
      req.subjectId ||
      'DEV_SUBJECT_3LC',
    topicId:
      lesson.topicId ||
      req.topicId ||
      '',
    blockId:
      req.blockId ||
      firstBlock.blockId ||
      'DEV_BLOCK_3LC',
    activityId:
      req.activityId ||
      firstActivity.activityId ||
      'DEV_ACTIVITY_3LC',
    answerText:
      req.answerText ||
      'Đáp án thử nghiệm DRY_RUN',
    studySessionId:
      req.studySessionId ||
      'DRYRUN_SESSION_' + transactionId,
    progressPercent:
      Number(req.progressPercent || 50),
    source:
      'LEARNING_INTERACTION_3LC_DRY_RUN'
  };
}


/**
 * Build interaction buttons.
 */
function kidlearnV3_3lcBuildInteractionButtons_(context) {
  return [
    {
      actionCode: 'START_LESSON',
      label: 'Start Lesson',
      operation: 'START_STUDY_SESSION',
      enabled: true,
      dryRunOnly: true
    },
    {
      actionCode: 'COMPLETE_BLOCK',
      label: 'Complete Block',
      operation: 'UPSERT_LESSON_PROGRESS',
      enabled: true,
      dryRunOnly: true
    },
    {
      actionCode: 'SUBMIT_ANSWER',
      label: 'Submit Answer',
      operation: 'AUDIT_LOG',
      enabled: true,
      dryRunOnly: true
    },
    {
      actionCode: 'FINISH_LESSON',
      label: 'Finish Lesson',
      operation: 'FINISH_STUDY_SESSION',
      enabled: true,
      dryRunOnly: true
    }
  ];
}


/**
 * Build operation payload.
 */
function kidlearnV3_3lcBuildOperationPayload_(
  actionCode,
  context,
  request
) {
  var now =
    new Date().toISOString();

  if (
    actionCode ===
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_ACTIONS.START_LESSON
  ) {
    return {
      operation: 'START_STUDY_SESSION',
      payload: {
        childId: context.childId,
        lessonId: context.lessonId,
        subjectId: context.subjectId,
        topicId: context.topicId,
        startedAt: now,
        status: 'IN_PROGRESS',
        source: context.source,
        transactionId: context.transactionId,
        notes:
          '3L-C DRY_RUN UI Start Lesson. Không ghi thật DB.'
      }
    };
  }

  if (
    actionCode ===
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_ACTIONS.COMPLETE_BLOCK
  ) {
    return {
      operation: 'UPSERT_LESSON_PROGRESS',
      payload: {
        childId: context.childId,
        lessonId: context.lessonId,
        subjectId: context.subjectId,
        status: 'IN_PROGRESS',
        progressPercent: context.progressPercent,
        lastStudiedAt: now,
        source: context.source,
        transactionId: context.transactionId,
        notes:
          '3L-C DRY_RUN UI Complete Block=' +
          context.blockId
      }
    };
  }

  if (
    actionCode ===
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_ACTIONS.SUBMIT_ANSWER
  ) {
    return {
      operation: 'AUDIT_LOG',
      payload: {
        eventType: 'SUBMIT_ACTIVITY_ANSWER_DRY_RUN',
        eventSource: context.source,
        userId: 'DEV_USER_3LC',
        childId: context.childId,
        entityType: 'MST_Activities',
        entityId: context.activityId,
        action: 'SUBMIT_ANSWER_DRY_RUN',
        status: 'DRY_RUN',
        message:
          '3L-C DRY_RUN UI Submit Answer. Không ghi DATA_Responses thật.',
        transactionId: context.transactionId,
        detailsJson:
          JSON.stringify({
            lessonId: context.lessonId,
            blockId: context.blockId,
            activityId: context.activityId,
            answerText: context.answerText
          })
      }
    };
  }

  if (
    actionCode ===
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_ACTIONS.FINISH_LESSON
  ) {
    return {
      operation: 'FINISH_STUDY_SESSION',
      payload: {
        studySessionId: context.studySessionId,
        childId: context.childId,
        lessonId: context.lessonId,
        subjectId: context.subjectId,
        finishedAt: now,
        status: 'COMPLETED',
        source: context.source,
        transactionId: context.transactionId,
        notes:
          '3L-C DRY_RUN UI Finish Lesson. Không ghi thật DB.'
      }
    };
  }

  throw new Error(
    'ActionCode không hỗ trợ ở 3L-C: ' +
    actionCode
  );
}


/**
 * Dispatch DRY_RUN write.
 */
function kidlearnV3_3lcDispatchDryRunWrite_(
  operation,
  payload
) {
  try {
    var safeWrite =
      kidlearnV3_3lcSafeWriteStatus_();

    if (
      safeWrite.mode !== 'DRY_RUN' ||
      safeWrite.enabled !== false
    ) {
      return {
        success: false,
        method: 'WRITE_SERVICE_DRY_RUN_DIRECT_3LC',
        operation: operation,
        error:
          'Safe Write phải ở DRY_RUN/enabled=false.',
        safeWriteStatus: safeWrite
      };
    }

    var writeResponse =
      kidlearnV3_writeServiceSubmitV3({
        operation: operation,
        dryRun: true,
        payload: payload,
        source: 'LEARNING_INTERACTION_3LC_DRY_RUN'
      });

    return {
      success:
        writeResponse &&
        writeResponse.success === true,
      method: 'WRITE_SERVICE_DRY_RUN_DIRECT_3LC',
      operation: operation,
      response: writeResponse,
      safeWriteStatus: safeWrite
    };

  } catch (error) {
    return {
      success: false,
      method: 'WRITE_SERVICE_DRY_RUN_DIRECT_3LC',
      operation: operation,
      error:
        String(error.message || error)
    };
  }
}


/**
 * UI state after action.
 */
function kidlearnV3_3lcBuildUiStateAfterAction_(
  actionCode,
  context,
  dispatch
) {
  return {
    actionCode: actionCode,
    dryRunSuccess:
      dispatch.success === true,
    message:
      dispatch.success === true
        ? 'DRY_RUN thành công. Không có dữ liệu thật được ghi.'
        : 'DRY_RUN lỗi.',
    lessonId:
      context.lessonId,
    blockId:
      context.blockId,
    activityId:
      context.activityId,
    progressPercent:
      actionCode === 'COMPLETE_BLOCK'
        ? context.progressPercent
        : 0
  };
}


/**
 * Check target sheets.
 */
function kidlearnV3_3lcCheckTargetSheets_() {
  var errors = [];
  var items = [];

  var spreadsheet =
    kidlearnV3_3lcGetDatabaseSpreadsheet_();

  for (
    var i = 0;
    i < KIDLEARN_V3_LEARNING_INTERACTION_3LC_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_TARGET_SHEETS[i];

    var sheet =
      kidlearnV3_3lcGetSheet_(
        spreadsheet,
        sheetName
      );

    if (!sheet) {
      errors.push(
        'Thiếu target sheet: ' +
        sheetName
      );

      items.push({
        sheetName: sheetName,
        exists: false
      });

      continue;
    }

    items.push({
      sheetName: sheetName,
      exists: true,
      lastRow: sheet.getLastRow(),
      lastColumn: sheet.getLastColumn()
    });
  }

  return {
    errors: errors,
    items: items
  };
}


/**
 * Snapshot row counts only.
 */
function kidlearnV3_3lcSnapshotRowCountsOnly_(
  sheetNames
) {
  var spreadsheet =
    kidlearnV3_3lcGetDatabaseSpreadsheet_();

  var items = [];

  for (var i = 0; i < sheetNames.length; i++) {
    var sheetName =
      sheetNames[i];

    var sheet =
      kidlearnV3_3lcGetSheet_(
        spreadsheet,
        sheetName
      );

    if (!sheet) {
      items.push({
        sheetName: sheetName,
        exists: false,
        lastRow: 0,
        lastColumn: 0
      });

      continue;
    }

    items.push({
      sheetName: sheetName,
      exists: true,
      lastRow:
        sheet.getLastRow(),
      lastColumn:
        sheet.getLastColumn()
    });
  }

  return {
    capturedAt:
      new Date().toISOString(),
    items: items
  };
}


/**
 * Compare row counts only.
 */
function kidlearnV3_3lcCompareRowCountsOnly_(
  beforeSnapshot,
  afterSnapshot
) {
  var errors = [];
  var changedSheets = [];

  var beforeMap =
    kidlearnV3_3lcMapSnapshots_(
      beforeSnapshot.items || []
    );

  var afterMap =
    kidlearnV3_3lcMapSnapshots_(
      afterSnapshot.items || []
    );

  for (
    var i = 0;
    i < KIDLEARN_V3_LEARNING_INTERACTION_3LC_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_TARGET_SHEETS[i];

    var before =
      beforeMap[sheetName];

    var after =
      afterMap[sheetName];

    if (!before || !after) {
      errors.push(
        'Thiếu row-count snapshot cho sheet: ' +
        sheetName
      );

      continue;
    }

    if (before.exists !== after.exists) {
      changedSheets.push(sheetName);

      errors.push(
        sheetName +
        ' thay đổi trạng thái exists trong DRY_RUN.'
      );

      continue;
    }

    if (
      before.lastRow !== after.lastRow ||
      before.lastColumn !== after.lastColumn
    ) {
      changedSheets.push(sheetName);

      errors.push(
        'DRY_RUN không được đổi row/column count của ' +
        sheetName +
        '. before=' +
        before.lastRow +
        'x' +
        before.lastColumn +
        ', after=' +
        after.lastRow +
        'x' +
        after.lastColumn
      );
    }
  }

  return {
    success: errors.length === 0,
    changedSheetCount:
      changedSheets.length,
    changedSheets:
      changedSheets,
    errorCount:
      errors.length,
    errors:
      errors
  };
}


/**
 * Map snapshots.
 */
function kidlearnV3_3lcMapSnapshots_(items) {
  var map = {};

  for (var i = 0; i < items.length; i++) {
    map[items[i].sheetName] =
      items[i];
  }

  return map;
}


/**
 * Database spreadsheet.
 */
function kidlearnV3_3lcGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3lcResolveSpreadsheet_(
      database
    );

  if (!spreadsheet) {
    throw new Error(
      'Không resolve được Spreadsheet object từ Database V3.'
    );
  }

  return spreadsheet;
}


/**
 * Resolve Spreadsheet.
 */
function kidlearnV3_3lcResolveSpreadsheet_(value) {
  if (!value) {
    return null;
  }

  if (
    typeof value.getSheets === 'function' &&
    typeof value.getId === 'function'
  ) {
    return value;
  }

  if (
    value.spreadsheet &&
    typeof value.spreadsheet.getSheets === 'function'
  ) {
    return value.spreadsheet;
  }

  if (
    value.database &&
    typeof value.database.getSheets === 'function'
  ) {
    return value.database;
  }

  if (
    value.db &&
    typeof value.db.getSheets === 'function'
  ) {
    return value.db;
  }

  if (
    value.spreadsheetObject &&
    typeof value.spreadsheetObject.getSheets === 'function'
  ) {
    return value.spreadsheetObject;
  }

  if (
    value.activeSpreadsheet &&
    typeof value.activeSpreadsheet.getSheets === 'function'
  ) {
    return value.activeSpreadsheet;
  }

  if (value.spreadsheetId) {
    return SpreadsheetApp.openById(
      value.spreadsheetId
    );
  }

  if (value.databaseSpreadsheetId) {
    return SpreadsheetApp.openById(
      value.databaseSpreadsheetId
    );
  }

  if (
    value.id &&
    typeof value.id === 'string'
  ) {
    return SpreadsheetApp.openById(
      value.id
    );
  }

  return null;
}


/**
 * Get exact sheet.
 */
function kidlearnV3_3lcGetSheet_(
  spreadsheet,
  sheetName
) {
  if (
    typeof kidlearnV3_appGetSheetByExactName_ === 'function'
  ) {
    return kidlearnV3_appGetSheetByExactName_(
      spreadsheet,
      sheetName
    );
  }

  var sheets =
    spreadsheet.getSheets();

  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() === sheetName) {
      return sheets[i];
    }
  }

  return null;
}


/**
 * Safe assert 3L-B ready.
 */
function kidlearnV3_3lcSafeAssert3LBReady_() {
  try {
    var result =
      kidlearnV3_assertLessonContent3LBReadyV3();

    return {
      success: result.success === true,
      message: ''
    };

  } catch (error) {
    return {
      success: false,
      message:
        String(error.message || error)
    };
  }
}


/**
 * Safe Write status.
 */
function kidlearnV3_3lcSafeWriteStatus_() {
  try {
    return kidlearnV3_getSafeWriteLayerStatusV3();
  } catch (error) {
    return {
      success: false,
      mode: '',
      enabled: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Check functions.
 */
function kidlearnV3_3lcCheckFunctions_(names) {
  var errors = [];
  var items = [];

  for (var i = 0; i < names.length; i++) {
    var exists = false;

    try {
      exists =
        eval(
          'typeof ' +
          names[i] +
          ' === "function"'
        );
    } catch (error) {
      exists = false;
    }

    items.push({
      name: names[i],
      exists: exists
    });

    if (!exists) {
      errors.push(
        'Thiếu function: ' +
        names[i]
      );
    }
  }

  return {
    errors: errors,
    items: items
  };
}


/**
 * Check HTML files.
 */
function kidlearnV3_3lcCheckHtmlFiles_(filenames) {
  var errors = [];
  var items = [];

  for (var i = 0; i < filenames.length; i++) {
    try {
      var content =
        HtmlService
          .createHtmlOutputFromFile(
            filenames[i]
          )
          .getContent();

      items.push({
        name: filenames[i],
        exists: true,
        length: content.length
      });

    } catch (error) {
      errors.push(
        'Thiếu HTML file: ' +
        filenames[i]
      );

      items.push({
        name: filenames[i],
        exists: false,
        error:
          String(error.message || error)
      });
    }
  }

  return {
    errors: errors,
    items: items
  };
}


/**
 * Save result.
 */
function kidlearnV3_3lcSaveResult_(
  result,
  status,
  dateKey
) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.READY_FOR_3L_D &&
    (
      status === KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.PAYLOAD_BUILT ||
      status === KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.DRY_RUN_TESTED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.READY_FOR_3L_D;
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      errors: result.errors || [],
      warnings: result.warnings || [],
      noWriteCheck: result.noWriteCheck || null,
      diagnostics: result.diagnostics || null,
      at: new Date().toISOString()
    })
  );
}


/**
 * Read last result.
 */
function kidlearnV3_3lcReadLastResult_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_RESULT_JSON
      );

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      raw: text
    };
  }
}


/**
 * Normalize request.
 */
function kidlearnV3_3lcNormalizeRequest_(request) {
  if (!request) {
    return {};
  }

  if (typeof request !== 'object') {
    return {
      value: request
    };
  }

  return request;
}


/**
 * Error message helper.
 */
function kidlearnV3_3lcGetErrorMessage_(response) {
  if (!response) {
    return 'Không có response.';
  }

  if (
    response.errors &&
    response.errors.length
  ) {
    return response.errors.join(' | ');
  }

  if (
    response.error &&
    response.error.message
  ) {
    return response.error.message;
  }

  if (
    response.response &&
    response.response.error &&
    response.response.error.message
  ) {
    return response.response.error.message;
  }

  if (response.error) {
    return String(response.error);
  }

  return JSON.stringify(response);
}


/**
 * Make transaction ID.
 */
function kidlearnV3_3lcMakeTransactionId_() {
  var text =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss_SSS'
    );

  var random =
    Math.floor(
      Math.random() * 100000
    );

  return (
    'UI_TX_3LC_DRYRUN_' +
    text +
    '_' +
    random
  );
}


================================================
FILE: App_Learning_UI_3KB_V3.gs
================================================
/**
 * ================================================================
 * KIDLEARN V3 - LEARNING UI DEV
 * Bundle: 3K-B
 * Steps:
 * - 3K.4: Attach subject / lesson / assignment into UI
 * - 3K.5: Create basic Lesson Player DEV
 * Version: 3.1.0
 * ================================================================
 *
 * 3K-B chỉ đọc dữ liệu.
 * KHÔNG ghi progress.
 * KHÔNG mở real write.
 * KHÔNG sửa PROD.
 */


var KIDLEARN_V3_LEARNING_UI_3KB_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3KB_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3KB_LAST_PREVIEW_AT',
  LAST_SCREEN_BUILD_AT: 'KIDLEARN_V3_PHASE_3KB_LAST_SCREEN_BUILD_AT',
  LAST_SMOKE_TEST_AT: 'KIDLEARN_V3_PHASE_3KB_LAST_SMOKE_TEST_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3KB_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3KB_LAST_RESULT_JSON'
};


var KIDLEARN_V3_LEARNING_UI_3KB_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  SCREEN_BUILT: 'SCREEN_BUILT',
  SMOKE_TESTED: 'SMOKE_TESTED',
  READY_FOR_3K_C: 'READY_FOR_3K_C',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_LEARNING_UI_3KB_CONFIG = {
  VERSION: '3K-B',
  PHASE: '3K.4_3K.5',
  NEXT_BUNDLE: '3K-C',
  READ_ONLY: true,
  SCREEN_ID: 'LEARNING_DEV_3KB',
  DEFAULT_VIEW: 'LESSON_PLAYER_DEV'
};


/**
 * Preview 3K-B.
 */
function kidlearnV3_previewLearningUi3KBV3() {
  var errors = [];
  var warnings = [];

  var functionChecks =
    kidlearnV3_3kbCheckFunctions_([
      'kidlearnV3_assertLearningUiCore3KAReadyV3',
      'kidlearnV3_buildLearningUiState3KAV3',
      'kidlearnV3_buildLearningScreenPayload3KAV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_uiInclude_'
    ]);

  errors =
    errors.concat(
      functionChecks.errors
    );

  var htmlChecks =
    kidlearnV3_3kbCheckHtmlFiles_([
      'UI_Learning_Dev_3KB_Client_V3',
      'UI_Learning_Dev_3KB'
    ]);

  errors =
    errors.concat(
      htmlChecks.errors
    );

  var phase3KA =
    kidlearnV3_3kbSafeAssert3KAReady_();

  if (!phase3KA.success) {
    errors.push(
      '3K-A chưa READY_FOR_3K_B: ' +
      phase3KA.message
    );
  }

  var safeWrite =
    kidlearnV3_3kbSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    warnings.push(
      'Safe Write nên ở DRY_RUN/enabled=false trong 3K-B. Hiện tại mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var samplePayload = null;

  try {
    if (errors.length === 0) {
      samplePayload =
        kidlearnV3_buildLearningScreenPayload3KAV3({});
    }
  } catch (error) {
    errors.push(
      'Không build được payload mẫu từ 3K-A: ' +
      String(error.message || error)
    );
  }

  if (
    samplePayload &&
    samplePayload.diagnostics &&
    samplePayload.diagnostics.lessonsCount < 1
  ) {
    warnings.push(
      'Hiện chưa có lesson trong MST_Lessons. 3K-B vẫn tạo UI shell và Lesson Player empty state.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_LEARNING_UI_3KB_V3',
    bundle: '3K-B',
    phase: KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.NEXT_BUNDLE,
    readOnly: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3KA: phase3KA,
    safeWriteStatus: safeWrite,
    functionChecks: functionChecks.items,
    htmlChecks: htmlChecks.items,
    sampleDiagnostics:
      samplePayload
        ? samplePayload.diagnostics
        : null
  };

  kidlearnV3_3kbSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_UI_3KB_STATUS.PREVIEWED,
    KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_PREVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Build Learning UI DEV screen 3K-B.
 */
function kidlearnV3_buildLearningScreen3KBV3(request) {
  var req =
    kidlearnV3_3kbNormalizeRequest_(
      request
    );

  var assert3KA =
    kidlearnV3_assertLearningUiCore3KAReadyV3();

  if (!assert3KA.success) {
    throw new Error(
      'Không thể build 3K-B vì 3K-A chưa ready.'
    );
  }

  var basePayload =
    kidlearnV3_buildLearningScreenPayload3KAV3(
      req
    );

  var lessonPlayer =
    kidlearnV3_buildLessonPlayerPayload3KBV3(
      req,
      basePayload
    );

  var screen = {
    success: true,
    action: 'BUILD_LEARNING_SCREEN_3KB_V3',
    bundle: '3K-B',
    phase: '3K.4_3K.5',
    screenId:
      KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.SCREEN_ID,
    readOnly: true,
    writeEnabled: false,
    generatedAt:
      new Date().toISOString(),
    layout: {
      title: 'KIDLEARN V3 - Learning DEV',
      subtitle: '3K-B Read-only Learning UI and basic Lesson Player',
      currentView:
        req.currentView ||
        KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.DEFAULT_VIEW
    },
    header:
      basePayload.header || {},
    subjectRail:
      basePayload.subjectRail || {
        selectedSubjectId: '',
        items: []
      },
    lessonList:
      basePayload.lessonList || {
        selectedLessonId: '',
        items: []
      },
    assignmentPanel:
      basePayload.assignmentPanel || {
        items: []
      },
    topicList:
      basePayload.topicList || {
        items: []
      },
    lessonPlayer:
      lessonPlayer,
    guards: {
      phase3KAReady: true,
      readOnly: true,
      writeEnabled: false,
      safeWriteExpectedMode: 'DRY_RUN',
      nextWriteBundle: '3K-C',
      prodTouched: false
    },
    diagnostics: {
      subjectsCount:
        basePayload.diagnostics
          ? basePayload.diagnostics.subjectsCount
          : 0,
      lessonsCount:
        basePayload.diagnostics
          ? basePayload.diagnostics.lessonsCount
          : 0,
      assignmentsCount:
        basePayload.diagnostics
          ? basePayload.diagnostics.assignmentsCount
          : 0,
      lessonBlocksCount:
        lessonPlayer.blocks.length,
      activitiesCount:
        lessonPlayer.activities.length,
      hasLesson:
        lessonPlayer.hasLesson
    }
  };

  kidlearnV3_3kbSaveResult_(
    {
      success: true,
      action: screen.action,
      bundle: screen.bundle,
      phase: screen.phase,
      errorCount: 0,
      warningCount: lessonPlayer.warningCount || 0,
      warnings: lessonPlayer.warnings || [],
      diagnostics: screen.diagnostics
    },
    KIDLEARN_V3_LEARNING_UI_3KB_STATUS.SCREEN_BUILT,
    KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_SCREEN_BUILD_AT
  );

  console.log(
    JSON.stringify(screen, null, 2)
  );

  return screen;
}


/**
 * Build basic Lesson Player payload.
 */
function kidlearnV3_buildLessonPlayerPayload3KBV3(
  request,
  basePayload
) {
  var req =
    kidlearnV3_3kbNormalizeRequest_(
      request
    );

  var warnings = [];

  var state =
    kidlearnV3_buildLearningUiState3KAV3(
      req
    );

  var data =
    kidlearnV3_3kbReadLearningData_();

  var selectedLesson =
    state.selectedLesson || {
      lessonId: '',
      lessonTitle: ''
    };

  var lessonId =
    String(
      req.lessonId ||
      selectedLesson.lessonId ||
      ''
    ).trim();

  var blocks =
    kidlearnV3_3kbBuildLessonBlocks_(
      data.lessonBlocks,
      lessonId
    );

  var activities =
    kidlearnV3_3kbBuildLessonActivities_(
      data.activities,
      lessonId,
      blocks
    );

  if (!lessonId) {
    warnings.push(
      'Chưa có selected lesson. Lesson Player hiển thị empty state.'
    );
  }

  if (lessonId && blocks.length < 1) {
    warnings.push(
      'Lesson đang chọn chưa có lesson blocks. 3K-B vẫn pass với player shell.'
    );
  }

  if (lessonId && activities.length < 1) {
    warnings.push(
      'Lesson đang chọn chưa có activities. 3K-B vẫn pass với player shell.'
    );
  }

  var player = {
    success: true,
    action: 'BUILD_LESSON_PLAYER_PAYLOAD_3KB_V3',
    bundle: '3K-B',
    phase: '3K.5',
    readOnly: true,
    writeEnabled: false,
    hasLesson:
      lessonId ? true : false,
    lesson: {
      lessonId: lessonId,
      lessonTitle:
        selectedLesson.lessonTitle ||
        selectedLesson.title ||
        '',
      subjectId:
        selectedLesson.subjectId || '',
      topicId:
        selectedLesson.topicId || '',
      lessonType:
        selectedLesson.lessonType || '',
      estimatedMinutes:
        Number(
          selectedLesson.estimatedMinutes || 0
        ),
      progressPercent:
        Number(
          selectedLesson.progressPercent || 0
        ),
      raw:
        selectedLesson.raw || {}
    },
    blocks: blocks,
    activities: activities,
    controls: {
      showStartButton: true,
      showFinishButton: true,
      showProgressButton: true,
      buttonsAreDryRunOnly: true,
      note:
        '3K-B chỉ render button layout. Gắn hành động DRY_RUN/real write ở 3K-C.'
    },
    emptyState: {
      noLesson:
        !lessonId,
      noBlocks:
        lessonId && blocks.length < 1,
      noActivities:
        lessonId && activities.length < 1,
      message:
        !lessonId
          ? 'Chưa có bài học để hiển thị.'
          : blocks.length < 1
            ? 'Bài học chưa có nội dung block.'
            : ''
    },
    warningCount:
      warnings.length,
    warnings: warnings
  };

  console.log(
    JSON.stringify(player, null, 2)
  );

  return player;
}


/**
 * Open Learning UI DEV 3K-B.
 */
function kidlearnV3_showLearningDev3KBV3() {
  var preview =
    kidlearnV3_previewLearningUi3KBV3();

  if (!preview.success) {
    throw new Error(
      'Learning UI 3K-B chưa sẵn sàng. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var html =
    HtmlService
      .createTemplateFromFile(
        'UI_Learning_Dev_3KB'
      )
      .evaluate()
      .setTitle(
        'KIDLEARN V3 - Learning DEV 3K-B'
      )
      .setWidth(1300)
      .setHeight(900);

  SpreadsheetApp
    .getUi()
    .showModalDialog(
      html,
      'KIDLEARN V3 - Learning DEV 3K-B'
    );
}


/**
 * UI function: get initial payload.
 */
function kidlearnV3_uiLearning3KBGetInitialPayloadV3(request) {
  return kidlearnV3_buildLearningScreen3KBV3(
    request || {}
  );
}


/**
 * Smoke test 3K-B.
 */
function kidlearnV3_smokeTestLearningUi3KBV3() {
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewLearningUi3KBV3();

  if (!preview.success) {
    throw new Error(
      'Không thể smoke test 3K-B vì preview chưa đạt. Errors=' +
      preview.errorCount
    );
  }

  var screen =
    kidlearnV3_buildLearningScreen3KBV3({});

  if (!screen.success) {
    errors.push(
      'Build screen 3K-B không success.'
    );
  }

  if (screen.readOnly !== true) {
    errors.push(
      '3K-B screen phải readOnly=true.'
    );
  }

  if (screen.writeEnabled !== false) {
    errors.push(
      '3K-B screen phải writeEnabled=false.'
    );
  }

  if (
    !screen.subjectRail ||
    !screen.subjectRail.items ||
    screen.subjectRail.items.length < 1
  ) {
    errors.push(
      '3K-B UI thiếu subjectRail.items.'
    );
  }

  if (!screen.lessonList || !screen.lessonList.items) {
    errors.push(
      '3K-B UI thiếu lessonList.items.'
    );
  }

  if (!screen.lessonPlayer) {
    errors.push(
      '3K-B UI thiếu lessonPlayer.'
    );
  }

  if (
    screen.lessonPlayer &&
    screen.lessonPlayer.warningCount > 0
  ) {
    warnings =
      warnings.concat(
        screen.lessonPlayer.warnings || []
      );
  }

  if (
    screen.diagnostics &&
    screen.diagnostics.lessonsCount < 1
  ) {
    warnings.push(
      'Chưa có lesson trong DB. UI shell vẫn pass, content seed sẽ xử lý ở phase sau.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_LEARNING_UI_3KB_V3',
    bundle: '3K-B',
    phase: KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.NEXT_BUNDLE,
    readOnly: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    diagnostics:
      screen.diagnostics || {},
    guards:
      screen.guards || {}
  };

  kidlearnV3_3kbSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_UI_3KB_STATUS.SMOKE_TESTED
      : KIDLEARN_V3_LEARNING_UI_3KB_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_SMOKE_TEST_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test 3K-B chưa đạt. Errors=' +
      result.errorCount +
      '. ' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 3K-B ready.
 */
function kidlearnV3_markLearningUi3KBReadyV3() {
  var smoke =
    kidlearnV3_smokeTestLearningUi3KBV3();

  if (!smoke.success) {
    throw new Error(
      'Không thể mark 3K-B ready vì smoke test chưa pass.'
    );
  }

  var result = {
    success: true,
    action: 'MARK_LEARNING_UI_3KB_READY_V3',
    bundle: '3K-B',
    phase: KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.PHASE,
    status:
      KIDLEARN_V3_LEARNING_UI_3KB_STATUS.READY_FOR_3K_C,
    nextBundle:
      KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.NEXT_BUNDLE,
    message:
      '3K-B đã ready. Có thể chuyển sang 3K-C để gắn action Start/Finish/Progress/Daily Goal ở DRY_RUN gate.'
  };

  kidlearnV3_3kbSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_UI_3KB_STATUS.READY_FOR_3K_C,
    KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Get 3K-B status.
 */
function kidlearnV3_getLearningUi3KBStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_LEARNING_UI_3KB_STATUS_V3',
    bundle: '3K-B',
    phase: KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_UI_3KB_KEYS.STATUS
      ) ||
      KIDLEARN_V3_LEARNING_UI_3KB_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastScreenBuildAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_SCREEN_BUILD_AT
      ) ||
      '',
    lastSmokeTestAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_SMOKE_TEST_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3kbReadLastResult_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3K-B ready.
 */
function kidlearnV3_assertLearningUi3KBReadyV3() {
  var status =
    kidlearnV3_getLearningUi3KBStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_LEARNING_UI_3KB_STATUS.READY_FOR_3K_C
  ) {
    errors.push(
      '3K-B chưa READY_FOR_3K_C. Status hiện tại=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_LEARNING_UI_3KB_READY_V3',
    bundle: '3K-B',
    phase: KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.NEXT_BUNDLE,
    errorCount: errors.length,
    errors: errors
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3K-B chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Build lesson blocks.
 */
function kidlearnV3_3kbBuildLessonBlocks_(
  rows,
  lessonId
) {
  var result = [];

  if (!lessonId) {
    return result;
  }

  for (var i = 0; i < rows.length; i++) {
    var row =
      rows[i];

    if (
      row.lessonId &&
      String(row.lessonId) !== String(lessonId)
    ) {
      continue;
    }

    var blockId =
      row.lessonBlockId ||
      row.blockId ||
      row.id ||
      '';

    if (!blockId) {
      blockId =
        'BLOCK_' +
        lessonId +
        '_' +
        (i + 1);
    }

    result.push({
      blockId: blockId,
      lessonId: lessonId,
      blockType:
        row.blockType ||
        row.type ||
        'TEXT',
      title:
        row.title ||
        row.blockTitle ||
        '',
      contentText:
        row.contentText ||
        row.blockContent ||
        row.bodyText ||
        row.instruction ||
        '',
      mediaAssetId:
        row.mediaAssetId || '',
      displayOrder:
        Number(row.displayOrder || row.order || i + 1),
      raw:
        row
    });
  }

  result.sort(
    function(a, b) {
      return a.displayOrder - b.displayOrder;
    }
  );

  return result;
}


/**
 * Build lesson activities.
 */
function kidlearnV3_3kbBuildLessonActivities_(
  rows,
  lessonId,
  blocks
) {
  var result = [];

  if (!lessonId) {
    return result;
  }

  var blockIds = {};

  for (var b = 0; b < blocks.length; b++) {
    blockIds[blocks[b].blockId] = true;
  }

  for (var i = 0; i < rows.length; i++) {
    var row =
      rows[i];

    if (
      row.lessonId &&
      String(row.lessonId) !== String(lessonId)
    ) {
      continue;
    }

    if (
      row.lessonBlockId &&
      blocks.length > 0 &&
      !blockIds[row.lessonBlockId]
    ) {
      continue;
    }

    var activityId =
      row.activityId ||
      row.id ||
      '';

    if (!activityId) {
      activityId =
        'ACT_' +
        lessonId +
        '_' +
        (i + 1);
    }

    result.push({
      activityId: activityId,
      lessonId: lessonId,
      lessonBlockId:
        row.lessonBlockId ||
        row.blockId ||
        '',
      activityType:
        row.activityType ||
        row.type ||
        'READ',
      prompt:
        row.prompt ||
        row.questionText ||
        row.instruction ||
        row.title ||
        '',
      options:
        kidlearnV3_3kbParseOptions_(
          row.options ||
          row.optionJson ||
          ''
        ),
      expectedAnswer:
        row.expectedAnswer ||
        row.answer ||
        '',
      displayOrder:
        Number(row.displayOrder || row.order || i + 1),
      raw:
        row
    });
  }

  result.sort(
    function(a, b) {
      return a.displayOrder - b.displayOrder;
    }
  );

  return result;
}


/**
 * Read learning data from 3K-A helper.
 */
function kidlearnV3_3kbReadLearningData_() {
  if (
    typeof kidlearnV3_3kaReadLearningData_ === 'function'
  ) {
    return kidlearnV3_3kaReadLearningData_();
  }

  return {
    lessonBlocks: [],
    activities: []
  };
}


/**
 * Parse options.
 */
function kidlearnV3_3kbParseOptions_(
  value
) {
  var text =
    String(value || '').trim();

  if (!text) {
    return [];
  }

  try {
    var parsed =
      JSON.parse(text);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    return [parsed];

  } catch (error) {
    return text
      .split('|')
      .map(function(item) {
        return String(item || '').trim();
      })
      .filter(function(item) {
        return item;
      });
  }
}


/**
 * Check function availability.
 */
function kidlearnV3_3kbCheckFunctions_(
  names
) {
  var errors = [];
  var items = [];

  for (var i = 0; i < names.length; i++) {
    var exists = false;

    try {
      exists =
        eval(
          'typeof ' +
          names[i] +
          ' === "function"'
        );
    } catch (error) {
      exists = false;
    }

    items.push({
      name: names[i],
      exists: exists
    });

    if (!exists) {
      errors.push(
        'Thiếu function: ' +
        names[i]
      );
    }
  }

  return {
    errors: errors,
    items: items
  };
}


/**
 * Check HTML files.
 */
function kidlearnV3_3kbCheckHtmlFiles_(
  filenames
) {
  var errors = [];
  var items = [];

  for (var i = 0; i < filenames.length; i++) {
    try {
      var content =
        HtmlService
          .createHtmlOutputFromFile(
            filenames[i]
          )
          .getContent();

      items.push({
        name: filenames[i],
        exists: true,
        length: content.length
      });

    } catch (error) {
      errors.push(
        'Thiếu HTML file: ' +
        filenames[i]
      );

      items.push({
        name: filenames[i],
        exists: false,
        error:
          String(error.message || error)
      });
    }
  }

  return {
    errors: errors,
    items: items
  };
}


/**
 * Safe assert 3K-A ready.
 */
function kidlearnV3_3kbSafeAssert3KAReady_() {
  try {
    var result =
      kidlearnV3_assertLearningUiCore3KAReadyV3();

    return {
      success: result.success === true,
      message: ''
    };

  } catch (error) {
    return {
      success: false,
      message:
        String(error.message || error)
    };
  }
}


/**
 * Safe Write status.
 */
function kidlearnV3_3kbSafeWriteStatus_() {
  try {
    return kidlearnV3_getSafeWriteLayerStatusV3();
  } catch (error) {
    return {
      success: false,
      mode: '',
      enabled: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Save result.
 *
 * Nếu 3K-B đã READY_FOR_3K_C thì preview/build/smoke
 * không được downgrade status.
 */
function kidlearnV3_3kbSaveResult_(
  result,
  status,
  dateKey
) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_LEARNING_UI_3KB_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_LEARNING_UI_3KB_STATUS.READY_FOR_3K_C &&
    (
      status === KIDLEARN_V3_LEARNING_UI_3KB_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_LEARNING_UI_3KB_STATUS.SCREEN_BUILT ||
      status === KIDLEARN_V3_LEARNING_UI_3KB_STATUS.SMOKE_TESTED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_LEARNING_UI_3KB_STATUS.READY_FOR_3K_C;
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_UI_3KB_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      errors: result.errors || [],
      warnings: result.warnings || [],
      diagnostics: result.diagnostics || null,
      at: new Date().toISOString()
    })
  );
}


/**
 * Read last result.
 */
function kidlearnV3_3kbReadLastResult_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_RESULT_JSON
      );

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      raw: text
    };
  }
}


/**
 * Normalize request.
 */
function kidlearnV3_3kbNormalizeRequest_(
  request
) {
  if (!request) {
    return {};
  }

  if (typeof request !== 'object') {
    return {
      value: request
    };
  }

  return request;
}


================================================
FILE: App_Learning_UI_Core_3KA_V3.gs
================================================
/**
 * ================================================================
 * KIDLEARN V3 - LEARNING UI CORE
 * Bundle: 3K-A
 * Steps:
 * - 3K.1: Review existing learning UI readiness
 * - 3K.2: Design Learning UI State Model
 * - 3K.3: Build Learning Screen Payload from DB V3
 * Version: 3.1.0
 * ================================================================
 *
 * Bundle 3K-A chỉ đọc DB V3.
 * KHÔNG ghi learning progress.
 * KHÔNG mở real write.
 * KHÔNG sửa PROD.
 */


var KIDLEARN_V3_LEARNING_UI_3KA_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3KA_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3KA_LAST_PREVIEW_AT',
  LAST_SMOKE_TEST_AT: 'KIDLEARN_V3_PHASE_3KA_LAST_SMOKE_TEST_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3KA_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3KA_LAST_RESULT_JSON'
};


var KIDLEARN_V3_LEARNING_UI_3KA_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  SMOKE_TESTED: 'SMOKE_TESTED',
  READY_FOR_3K_B: 'READY_FOR_3K_B',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_LEARNING_UI_3KA_CONFIG = {
  VERSION: '3K-A',
  PHASE: '3K.1_3K.2_3K.3',
  NEXT_BUNDLE: '3K-B',
  DEFAULT_GRADE_LEVEL: 2,
  DEFAULT_VIEW: 'LEARNING_HOME',
  READ_ONLY: true
};


var KIDLEARN_V3_LEARNING_UI_3KA_SHEETS = [
  'DATA_Children',
  'MST_Subjects',
  'MST_Topics',
  'MST_Lessons',
  'MST_LessonBlocks',
  'MST_Activities',
  'DATA_Assignments',
  'DATA_LessonProgress',
  'DATA_StudySessions',
  'DATA_DailyGoals'
];


/**
 * Preview Bundle 3K-A.
 */
function kidlearnV3_previewLearningUiCore3KAV3() {
  var errors = [];
  var warnings = [];

  var functionChecks =
    kidlearnV3_3kaCheckFunctions_([
      'kidlearnV3_assertPhase3JClosedV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_appGetActiveDatabaseV3_'
    ]);

  errors =
    errors.concat(
      functionChecks.errors
    );

  var phase3J =
    kidlearnV3_3kaSafePhase3JClosed_();

  if (!phase3J.success) {
    errors.push(
      'Phase 3J chưa CLOSED_LOCKED: ' +
      phase3J.message
    );
  }

  var safeWrite =
    kidlearnV3_3kaSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    warnings.push(
      'Safe Write nên ở DRY_RUN/enabled=false khi vào 3K-A. Hiện tại mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var sheetCheck =
    kidlearnV3_3kaCheckSheets_();

  errors =
    errors.concat(
      sheetCheck.errors
    );

  warnings =
    warnings.concat(
      sheetCheck.warnings
    );

  var dataSummary =
    kidlearnV3_3kaBuildDataSummary_();

  if (dataSummary.childrenCount < 1) {
    errors.push(
      'DATA_Children chưa có child để build Learning UI payload.'
    );
  }

  if (dataSummary.subjectsCount < 1) {
    errors.push(
      'MST_Subjects chưa có subject để build Learning UI payload.'
    );
  }

  if (dataSummary.lessonsCount < 1) {
    warnings.push(
      'MST_Lessons chưa có lesson. 3K-A vẫn pass nhưng 3K-B Lesson Player sẽ cần lesson seed ở phase sau.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_LEARNING_UI_CORE_3KA_V3',
    bundle: '3K-A',
    phase: KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.NEXT_BUNDLE,
    readOnly: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3J: phase3J,
    safeWriteStatus: safeWrite,
    dataSummary: dataSummary,
    sheetChecks: sheetCheck.items,
    functionChecks: functionChecks.items
  };

  kidlearnV3_3kaSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_UI_3KA_STATUS.PREVIEWED,
    KIDLEARN_V3_LEARNING_UI_3KA_KEYS.LAST_PREVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Build Learning UI State Model.
 */
function kidlearnV3_buildLearningUiState3KAV3(request) {
  var req =
    kidlearnV3_3kaNormalizeRequest_(
      request
    );

  var preview =
    kidlearnV3_previewLearningUiCore3KAV3();

  if (!preview.success) {
    throw new Error(
      'Không thể build Learning UI State vì preview 3K-A chưa đạt. Errors=' +
      preview.errorCount
    );
  }

  var data =
    kidlearnV3_3kaReadLearningData_();

  var child =
    kidlearnV3_3kaPickChild_(
      data.children,
      req.childId
    );

  var gradeLevel =
    Number(
      req.gradeLevel ||
      child.gradeLevel ||
      KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.DEFAULT_GRADE_LEVEL
    );

  var subjects =
    kidlearnV3_3kaBuildSubjectCards_(
      data.subjects,
      gradeLevel
    );

  var selectedSubject =
    kidlearnV3_3kaPickSubject_(
      subjects,
      req.subjectId
    );

  var topics =
    kidlearnV3_3kaBuildTopicsForSubject_(
      data.topics,
      selectedSubject.subjectId
    );

  var lessons =
    kidlearnV3_3kaBuildLessonsForSubject_(
      data.lessons,
      selectedSubject.subjectId,
      gradeLevel
    );

  var selectedLesson =
    kidlearnV3_3kaPickLesson_(
      lessons,
      req.lessonId
    );

  var assignments =
    kidlearnV3_3kaBuildAssignmentsForChild_(
      data.assignments,
      child.childId
    );

  var progress =
    kidlearnV3_3kaBuildProgressMap_(
      data.lessonProgress,
      child.childId
    );

  var dailyGoal =
    kidlearnV3_3kaPickDailyGoal_(
      data.dailyGoals,
      child.childId
    );

  var recentSessions =
    kidlearnV3_3kaBuildRecentSessions_(
      data.studySessions,
      child.childId
    );

  var state = {
    success: true,
    action: 'BUILD_LEARNING_UI_STATE_3KA_V3',
    bundle: '3K-A',
    phase: '3K.2',
    readOnly: true,
    writeEnabled: false,
    currentView:
      req.currentView ||
      KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.DEFAULT_VIEW,
    generatedAt:
      new Date().toISOString(),
    child: child,
    gradeLevel: gradeLevel,
    selectedSubject: selectedSubject,
    selectedLesson: selectedLesson,
    subjects: subjects,
    topics: topics,
    lessons: lessons,
    assignments: assignments,
    progressByLesson: progress,
    dailyGoal: dailyGoal,
    recentSessions: recentSessions,
    uiFlags: {
      canStartLesson: selectedLesson.lessonId ? true : false,
      canShowLessonPlayer: selectedLesson.lessonId ? true : false,
      canWriteProgressNow: false,
      writeMode: 'READ_ONLY_3K_A',
      nextWriteGate: '3K-C'
    },
    emptyStates:
      kidlearnV3_3kaBuildEmptyStates_(
        subjects,
        lessons,
        assignments
      )
  };

  console.log(
    JSON.stringify(state, null, 2)
  );

  return state;
}


/**
 * Build Learning Screen Payload.
 */
function kidlearnV3_buildLearningScreenPayload3KAV3(request) {
  var state =
    kidlearnV3_buildLearningUiState3KAV3(
      request || {}
    );

  var payload = {
    success: true,
    action: 'BUILD_LEARNING_SCREEN_PAYLOAD_3KA_V3',
    bundle: '3K-A',
    phase: '3K.3',
    readOnly: true,
    generatedAt:
      new Date().toISOString(),
    screen: {
      screenId: 'LEARNING_HOME_V3',
      title: 'KIDLEARN V3 - Learning Home',
      currentView: state.currentView,
      childName:
        state.child.childName ||
        state.child.name ||
        '',
      gradeLevel:
        state.gradeLevel
    },
    header: {
      child: state.child,
      dailyGoal: state.dailyGoal,
      recentSessionCount:
        state.recentSessions.length
    },
    subjectRail: {
      selectedSubjectId:
        state.selectedSubject.subjectId || '',
      items:
        state.subjects
    },
    lessonList: {
      selectedLessonId:
        state.selectedLesson.lessonId || '',
      items:
        kidlearnV3_3kaAttachProgressToLessons_(
          state.lessons,
          state.progressByLesson
        )
    },
    topicList: {
      items:
        state.topics
    },
    assignmentPanel: {
      items:
        state.assignments
    },
    lessonPlayerSeed: {
      lesson:
        state.selectedLesson,
      readOnly: true,
      blocks: [],
      activities: [],
      note:
        '3K-A chỉ tạo payload seed. Lesson blocks/activities sẽ gắn ở Bundle 3K-B/3L.'
    },
    uiFlags:
      state.uiFlags,
    emptyStates:
      state.emptyStates,
    diagnostics: {
      subjectsCount:
        state.subjects.length,
      lessonsCount:
        state.lessons.length,
      assignmentsCount:
        state.assignments.length,
      topicsCount:
        state.topics.length,
      progressCount:
        Object.keys(state.progressByLesson).length
    }
  };

  console.log(
    JSON.stringify(payload, null, 2)
  );

  return payload;
}


/**
 * Smoke test 3K-A.
 */
function kidlearnV3_smokeTestLearningUiCore3KAV3() {
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewLearningUiCore3KAV3();

  if (!preview.success) {
    throw new Error(
      'Không thể smoke test 3K-A vì preview chưa đạt. Errors=' +
      preview.errorCount
    );
  }

  var state =
    kidlearnV3_buildLearningUiState3KAV3({});

  var payload =
    kidlearnV3_buildLearningScreenPayload3KAV3({});

  if (!state.child || !state.child.childId) {
    errors.push(
      'Learning UI State thiếu child.childId.'
    );
  }

  if (!state.subjects || state.subjects.length < 1) {
    errors.push(
      'Learning UI State thiếu subjects.'
    );
  }

  if (!payload.screen || !payload.screen.screenId) {
    errors.push(
      'Learning Screen Payload thiếu screen.screenId.'
    );
  }

  if (!payload.subjectRail || payload.subjectRail.items.length < 1) {
    errors.push(
      'Learning Screen Payload thiếu subjectRail items.'
    );
  }

  if (payload.lessonList.items.length < 1) {
    warnings.push(
      'Learning Screen Payload chưa có lessonList items. Chấp nhận ở 3K-A nếu content lesson chưa seed.'
    );
  }

  if (payload.readOnly !== true) {
    errors.push(
      '3K-A payload phải readOnly=true.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_LEARNING_UI_CORE_3KA_V3',
    bundle: '3K-A',
    phase: KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.NEXT_BUNDLE,
    readOnly: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    stateSummary: {
      childId: state.child.childId || '',
      childName: state.child.childName || '',
      gradeLevel: state.gradeLevel,
      selectedSubjectId:
        state.selectedSubject.subjectId || '',
      selectedLessonId:
        state.selectedLesson.lessonId || '',
      subjectsCount:
        state.subjects.length,
      lessonsCount:
        state.lessons.length,
      assignmentsCount:
        state.assignments.length
    },
    payloadDiagnostics:
      payload.diagnostics
  };

  kidlearnV3_3kaSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_UI_3KA_STATUS.SMOKE_TESTED
      : KIDLEARN_V3_LEARNING_UI_3KA_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_UI_3KA_KEYS.LAST_SMOKE_TEST_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test 3K-A chưa đạt. Errors=' +
      result.errorCount
    );
  }

  return result;
}


/**
 * Mark 3K-A ready cho 3K-B.
 */
function kidlearnV3_markLearningUiCore3KAReadyV3() {
  var smoke =
    kidlearnV3_smokeTestLearningUiCore3KAV3();

  if (!smoke.success) {
    throw new Error(
      'Không thể mark 3K-A ready vì smoke test chưa pass.'
    );
  }

  var result = {
    success: true,
    action: 'MARK_LEARNING_UI_CORE_3KA_READY_V3',
    bundle: '3K-A',
    phase: KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.PHASE,
    status: KIDLEARN_V3_LEARNING_UI_3KA_STATUS.READY_FOR_3K_B,
    nextBundle: KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.NEXT_BUNDLE,
    message:
      '3K-A đã sẵn sàng. Có thể chuyển sang 3K-B để tạo Learning Screen / Lesson Player DEV cơ bản.'
  };

  kidlearnV3_3kaSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_UI_3KA_STATUS.READY_FOR_3K_B,
    KIDLEARN_V3_LEARNING_UI_3KA_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Get status 3K-A.
 */
function kidlearnV3_getLearningUiCore3KAStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_LEARNING_UI_CORE_3KA_STATUS_V3',
    bundle: '3K-A',
    phase: KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_UI_3KA_KEYS.STATUS
      ) ||
      KIDLEARN_V3_LEARNING_UI_3KA_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_UI_3KA_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastSmokeTestAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_UI_3KA_KEYS.LAST_SMOKE_TEST_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_UI_3KA_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3kaReadLastResult_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3K-A ready.
 */
function kidlearnV3_assertLearningUiCore3KAReadyV3() {
  var status =
    kidlearnV3_getLearningUiCore3KAStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_LEARNING_UI_3KA_STATUS.READY_FOR_3K_B
  ) {
    errors.push(
      '3K-A chưa READY_FOR_3K_B. Status hiện tại=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_LEARNING_UI_CORE_3KA_READY_V3',
    bundle: '3K-A',
    phase: KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.PHASE,
    errorCount: errors.length,
    errors: errors,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.NEXT_BUNDLE
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3K-A chưa ready. Errors=' +
      errors.length
    );
  }

  return result;
}


/**
 * Read learning data from DB V3.
 */
function kidlearnV3_3kaReadLearningData_() {
  return {
    children:
      kidlearnV3_3kaReadSheetObjects_(
        'DATA_Children',
        200
      ),
    subjects:
      kidlearnV3_3kaReadSheetObjects_(
        'MST_Subjects',
        100
      ),
    topics:
      kidlearnV3_3kaReadSheetObjects_(
        'MST_Topics',
        500
      ),
    lessons:
      kidlearnV3_3kaReadSheetObjects_(
        'MST_Lessons',
        500
      ),
    lessonBlocks:
      kidlearnV3_3kaReadSheetObjects_(
        'MST_LessonBlocks',
        1000
      ),
    activities:
      kidlearnV3_3kaReadSheetObjects_(
        'MST_Activities',
        1000
      ),
    assignments:
      kidlearnV3_3kaReadSheetObjects_(
        'DATA_Assignments',
        500
      ),
    lessonProgress:
      kidlearnV3_3kaReadSheetObjects_(
        'DATA_LessonProgress',
        1000
      ),
    studySessions:
      kidlearnV3_3kaReadSheetObjects_(
        'DATA_StudySessions',
        1000
      ),
    dailyGoals:
      kidlearnV3_3kaReadSheetObjects_(
        'DATA_DailyGoals',
        200
      )
  };
}


/**
 * Build data summary.
 */
function kidlearnV3_3kaBuildDataSummary_() {
  var data =
    kidlearnV3_3kaReadLearningData_();

  return {
    childrenCount:
      data.children.length,
    subjectsCount:
      data.subjects.length,
    topicsCount:
      data.topics.length,
    lessonsCount:
      data.lessons.length,
    lessonBlocksCount:
      data.lessonBlocks.length,
    activitiesCount:
      data.activities.length,
    assignmentsCount:
      data.assignments.length,
    lessonProgressCount:
      data.lessonProgress.length,
    studySessionsCount:
      data.studySessions.length,
    dailyGoalsCount:
      data.dailyGoals.length
  };
}


/**
 * Pick child.
 */
function kidlearnV3_3kaPickChild_(
  children,
  requestedChildId
) {
  var id =
    String(requestedChildId || '').trim();

  for (var i = 0; i < children.length; i++) {
    if (
      id &&
      String(children[i].childId || '').trim() === id
    ) {
      return kidlearnV3_3kaNormalizeChild_(
        children[i]
      );
    }
  }

  for (var j = 0; j < children.length; j++) {
    if (
      kidlearnV3_3kaIsActive_(
        children[j]
      )
    ) {
      return kidlearnV3_3kaNormalizeChild_(
        children[j]
      );
    }
  }

  if (children.length > 0) {
    return kidlearnV3_3kaNormalizeChild_(
      children[0]
    );
  }

  return {
    childId: '',
    childName: '',
    gradeLevel:
      KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.DEFAULT_GRADE_LEVEL
  };
}


/**
 * Normalize child.
 */
function kidlearnV3_3kaNormalizeChild_(
  row
) {
  return {
    childId:
      row.childId || row.id || '',
    childName:
      row.childName ||
      row.name ||
      row.fullName ||
      'Child',
    gradeLevel:
      Number(
        row.gradeLevel ||
        row.grade ||
        KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.DEFAULT_GRADE_LEVEL
      ),
    status:
      row.status || '',
    raw:
      row
  };
}


/**
 * Build subject cards.
 */
function kidlearnV3_3kaBuildSubjectCards_(
  subjects,
  gradeLevel
) {
  var result = [];

  for (var i = 0; i < subjects.length; i++) {
    var row =
      subjects[i];

    if (
      !kidlearnV3_3kaIsActive_(
        row
      )
    ) {
      continue;
    }

    var subjectId =
      row.subjectId ||
      row.id ||
      '';

    if (!subjectId) {
      continue;
    }

    result.push({
      subjectId: subjectId,
      subjectCode:
        row.subjectCode ||
        row.code ||
        '',
      subjectName:
        row.subjectName ||
        row.name ||
        subjectId,
      gradeLevel:
        gradeLevel,
      displayOrder:
        Number(row.displayOrder || row.order || i + 1),
      icon:
        row.icon || '',
      color:
        row.color || '',
      raw:
        row
    });
  }

  result.sort(
    function(a, b) {
      return a.displayOrder - b.displayOrder;
    }
  );

  return result;
}


/**
 * Pick subject.
 */
function kidlearnV3_3kaPickSubject_(
  subjects,
  requestedSubjectId
) {
  var id =
    String(requestedSubjectId || '').trim();

  for (var i = 0; i < subjects.length; i++) {
    if (
      id &&
      subjects[i].subjectId === id
    ) {
      return subjects[i];
    }
  }

  if (subjects.length > 0) {
    return subjects[0];
  }

  return {
    subjectId: '',
    subjectName: '',
    subjectCode: ''
  };
}


/**
 * Build topics by subject.
 */
function kidlearnV3_3kaBuildTopicsForSubject_(
  topics,
  subjectId
) {
  var result = [];

  for (var i = 0; i < topics.length; i++) {
    var row =
      topics[i];

    if (
      subjectId &&
      row.subjectId &&
      row.subjectId !== subjectId
    ) {
      continue;
    }

    if (
      !kidlearnV3_3kaIsActive_(
        row
      )
    ) {
      continue;
    }

    result.push({
      topicId:
        row.topicId || row.id || '',
      subjectId:
        row.subjectId || '',
      topicName:
        row.topicName ||
        row.name ||
        row.title ||
        '',
      displayOrder:
        Number(row.displayOrder || row.order || i + 1),
      raw:
        row
    });
  }

  result.sort(
    function(a, b) {
      return a.displayOrder - b.displayOrder;
    }
  );

  return result;
}


/**
 * Build lessons by subject.
 */
function kidlearnV3_3kaBuildLessonsForSubject_(
  lessons,
  subjectId,
  gradeLevel
) {
  var result = [];

  for (var i = 0; i < lessons.length; i++) {
    var row =
      lessons[i];

    if (
      subjectId &&
      row.subjectId &&
      row.subjectId !== subjectId
    ) {
      continue;
    }

    if (
      !kidlearnV3_3kaIsActive_(
        row
      )
    ) {
      continue;
    }

    var lessonGrade =
      Number(row.gradeLevel || row.grade || gradeLevel);

    if (
      lessonGrade &&
      gradeLevel &&
      lessonGrade !== gradeLevel
    ) {
      continue;
    }

    var lessonId =
      row.lessonId ||
      row.id ||
      '';

    if (!lessonId) {
      continue;
    }

    result.push({
      lessonId: lessonId,
      subjectId:
        row.subjectId || subjectId || '',
      topicId:
        row.topicId || '',
      lessonTitle:
        row.lessonTitle ||
        row.lessonName ||
        row.title ||
        row.name ||
        lessonId,
      lessonType:
        row.lessonType || '',
      gradeLevel:
        lessonGrade || gradeLevel,
      estimatedMinutes:
        Number(row.estimatedMinutes || row.durationMinutes || 0),
      displayOrder:
        Number(row.displayOrder || row.order || i + 1),
      status:
        row.status || '',
      raw:
        row
    });
  }

  result.sort(
    function(a, b) {
      return a.displayOrder - b.displayOrder;
    }
  );

  return result;
}


/**
 * Pick lesson.
 */
function kidlearnV3_3kaPickLesson_(
  lessons,
  requestedLessonId
) {
  var id =
    String(requestedLessonId || '').trim();

  for (var i = 0; i < lessons.length; i++) {
    if (
      id &&
      lessons[i].lessonId === id
    ) {
      return lessons[i];
    }
  }

  if (lessons.length > 0) {
    return lessons[0];
  }

  return {
    lessonId: '',
    lessonTitle: '',
    subjectId: ''
  };
}


/**
 * Build assignments for child.
 */
function kidlearnV3_3kaBuildAssignmentsForChild_(
  assignments,
  childId
) {
  var result = [];

  for (var i = 0; i < assignments.length; i++) {
    var row =
      assignments[i];

    if (
      childId &&
      row.childId &&
      row.childId !== childId
    ) {
      continue;
    }

    result.push({
      assignmentId:
        row.assignmentId || row.id || '',
      childId:
        row.childId || '',
      lessonId:
        row.lessonId || '',
      subjectId:
        row.subjectId || '',
      status:
        row.status || '',
      dueDate:
        row.dueDate || '',
      title:
        row.title ||
        row.assignmentTitle ||
        row.lessonTitle ||
        '',
      raw:
        row
    });
  }

  return result;
}


/**
 * Build progress map.
 */
function kidlearnV3_3kaBuildProgressMap_(
  progressRows,
  childId
) {
  var map = {};

  for (var i = 0; i < progressRows.length; i++) {
    var row =
      progressRows[i];

    if (
      childId &&
      row.childId &&
      row.childId !== childId
    ) {
      continue;
    }

    var lessonId =
      row.lessonId || '';

    if (!lessonId) {
      continue;
    }

    map[lessonId] = {
      lessonProgressId:
        row.lessonProgressId || row.id || '',
      lessonId:
        lessonId,
      status:
        row.status || '',
      progressPercent:
        Number(row.progressPercent || row.percentComplete || 0),
      lastStudiedAt:
        row.lastStudiedAt || row.updatedAt || '',
      raw:
        row
    };
  }

  return map;
}


/**
 * Pick daily goal.
 */
function kidlearnV3_3kaPickDailyGoal_(
  dailyGoals,
  childId
) {
  var today =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );

  for (var i = 0; i < dailyGoals.length; i++) {
    var row =
      dailyGoals[i];

    if (
      childId &&
      row.childId &&
      row.childId !== childId
    ) {
      continue;
    }

    if (
      row.goalDate &&
      String(row.goalDate).indexOf(today) >= 0
    ) {
      return {
        dailyGoalId:
          row.dailyGoalId || row.id || '',
        goalDate:
          row.goalDate || today,
        targetMinutes:
          Number(row.targetMinutes || 0),
        completedMinutes:
          Number(row.completedMinutes || 0),
        raw:
          row
      };
    }
  }

  return {
    dailyGoalId: '',
    goalDate: today,
    targetMinutes: 20,
    completedMinutes: 0,
    raw: {}
  };
}


/**
 * Recent sessions.
 */
function kidlearnV3_3kaBuildRecentSessions_(
  sessions,
  childId
) {
  var result = [];

  for (var i = 0; i < sessions.length; i++) {
    var row =
      sessions[i];

    if (
      childId &&
      row.childId &&
      row.childId !== childId
    ) {
      continue;
    }

    result.push({
      studySessionId:
        row.studySessionId || row.id || '',
      childId:
        row.childId || '',
      lessonId:
        row.lessonId || '',
      subjectId:
        row.subjectId || '',
      startedAt:
        row.startedAt || '',
      finishedAt:
        row.finishedAt || '',
      durationSeconds:
        Number(row.durationSeconds || 0),
      status:
        row.status || '',
      raw:
        row
    });
  }

  result.reverse();

  return result.slice(0, 5);
}


/**
 * Attach progress to lessons.
 */
function kidlearnV3_3kaAttachProgressToLessons_(
  lessons,
  progressMap
) {
  var result = [];

  for (var i = 0; i < lessons.length; i++) {
    var lesson =
      lessons[i];

    var progress =
      progressMap[lesson.lessonId] || {
        progressPercent: 0,
        status: ''
      };

    var item = {};

    var keys =
      Object.keys(lesson);

    for (var k = 0; k < keys.length; k++) {
      item[keys[k]] =
        lesson[keys[k]];
    }

    item.progress =
      progress;

    item.progressPercent =
      Number(progress.progressPercent || 0);

    result.push(item);
  }

  return result;
}


/**
 * Empty states.
 */
function kidlearnV3_3kaBuildEmptyStates_(
  subjects,
  lessons,
  assignments
) {
  return {
    noSubjects:
      subjects.length === 0,
    noLessons:
      lessons.length === 0,
    noAssignments:
      assignments.length === 0,
    messages: {
      noSubjects:
        'Chưa có môn học.',
      noLessons:
        'Chưa có bài học cho môn đang chọn.',
      noAssignments:
        'Chưa có assignment.'
    }
  };
}


/**
 * Read sheet objects using app helper or fallback.
 */
function kidlearnV3_3kaReadSheetObjects_(
  sheetName,
  limit
) {
  if (
    typeof kidlearnV3_appReadSheetObjectsV3 === 'function'
  ) {
    var response =
      kidlearnV3_appReadSheetObjectsV3(
        sheetName,
        limit || 500
      );

    if (Array.isArray(response)) {
      return response;
    }

    if (
      response &&
      Array.isArray(response.data)
    ) {
      return response.data;
    }

    if (
      response &&
      Array.isArray(response.items)
    ) {
      return response.items;
    }
  }

  return kidlearnV3_3kaReadSheetObjectsFallback_(
    sheetName,
    limit || 500
  );
}


/**
 * Fallback read sheet.
 */
function kidlearnV3_3kaReadSheetObjectsFallback_(
  sheetName,
  limit
) {
  var spreadsheet =
    kidlearnV3_3kaGetDatabaseSpreadsheet_();

  var sheet =
    kidlearnV3_3kaGetSheet_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return [];
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (
    lastRow < 3 ||
    lastColumn < 1
  ) {
    return [];
  }

  var rowCount =
    Math.min(
      lastRow - 2,
      Number(limit || 500)
    );

  var keys =
    sheet
      .getRange(
        2,
        1,
        1,
        lastColumn
      )
      .getDisplayValues()[0];

  var values =
    sheet
      .getRange(
        3,
        1,
        rowCount,
        lastColumn
      )
      .getDisplayValues();

  var result = [];

  for (var r = 0; r < values.length; r++) {
    var object = {};

    for (var c = 0; c < keys.length; c++) {
      var key =
        String(keys[c] || '').trim();

      if (key) {
        object[key] =
          values[r][c];
      }
    }

    result.push(object);
  }

  return result;
}


/**
 * Check sheets.
 */
function kidlearnV3_3kaCheckSheets_() {
  var errors = [];
  var warnings = [];
  var items = [];

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_3kaGetDatabaseSpreadsheet_();

  } catch (error) {
    errors.push(
      'Không mở được Database V3: ' +
      String(error.message || error)
    );

    return {
      errors: errors,
      warnings: warnings,
      items: items
    };
  }

  for (
    var i = 0;
    i < KIDLEARN_V3_LEARNING_UI_3KA_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_LEARNING_UI_3KA_SHEETS[i];

    var sheet =
      kidlearnV3_3kaGetSheet_(
        spreadsheet,
        sheetName
      );

    if (!sheet) {
      errors.push(
        'Thiếu sheet: ' +
        sheetName
      );

      items.push({
        sheetName: sheetName,
        exists: false
      });

      continue;
    }

    items.push({
      sheetName: sheetName,
      exists: true,
      lastRow: sheet.getLastRow(),
      dataRowCount:
        Math.max(0, sheet.getLastRow() - 2)
    });
  }

  return {
    errors: errors,
    warnings: warnings,
    items: items
  };
}


/**
 * Get database spreadsheet.
 */
function kidlearnV3_3kaGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3kaResolveSpreadsheet_(
      database
    );

  if (!spreadsheet) {
    throw new Error(
      'Không resolve được Spreadsheet object từ Database V3.'
    );
  }

  return spreadsheet;
}


/**
 * Resolve Spreadsheet object.
 */
function kidlearnV3_3kaResolveSpreadsheet_(
  value
) {
  if (!value) {
    return null;
  }

  if (
    typeof value.getSheets === 'function' &&
    typeof value.getId === 'function'
  ) {
    return value;
  }

  if (
    value.spreadsheet &&
    typeof value.spreadsheet.getSheets === 'function'
  ) {
    return value.spreadsheet;
  }

  if (
    value.database &&
    typeof value.database.getSheets === 'function'
  ) {
    return value.database;
  }

  if (
    value.db &&
    typeof value.db.getSheets === 'function'
  ) {
    return value.db;
  }

  if (
    value.spreadsheetObject &&
    typeof value.spreadsheetObject.getSheets === 'function'
  ) {
    return value.spreadsheetObject;
  }

  if (
    value.activeSpreadsheet &&
    typeof value.activeSpreadsheet.getSheets === 'function'
  ) {
    return value.activeSpreadsheet;
  }

  if (value.spreadsheetId) {
    return SpreadsheetApp.openById(
      value.spreadsheetId
    );
  }

  if (value.databaseSpreadsheetId) {
    return SpreadsheetApp.openById(
      value.databaseSpreadsheetId
    );
  }

  if (
    value.id &&
    typeof value.id === 'string'
  ) {
    return SpreadsheetApp.openById(
      value.id
    );
  }

  return null;
}


/**
 * Get exact sheet.
 */
function kidlearnV3_3kaGetSheet_(
  spreadsheet,
  sheetName
) {
  if (
    typeof kidlearnV3_appGetSheetByExactName_ === 'function'
  ) {
    return kidlearnV3_appGetSheetByExactName_(
      spreadsheet,
      sheetName
    );
  }

  var sheets =
    spreadsheet.getSheets();

  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() === sheetName) {
      return sheets[i];
    }
  }

  return null;
}


/**
 * Is active.
 */
function kidlearnV3_3kaIsActive_(
  row
) {
  var status =
    String(
      row.status ||
      row.isActive ||
      row.active ||
      ''
    )
      .trim()
      .toUpperCase();

  if (!status) {
    return true;
  }

  if (
    status === 'FALSE' ||
    status === 'NO' ||
    status === 'N' ||
    status === 'INACTIVE' ||
    status === 'DISABLED' ||
    status === '0'
  ) {
    return false;
  }

  return true;
}


/**
 * Check functions.
 */
function kidlearnV3_3kaCheckFunctions_(
  functionNames
) {
  var errors = [];
  var items = [];

  for (var i = 0; i < functionNames.length; i++) {
    var exists = false;

    try {
      exists =
        eval(
          'typeof ' +
          functionNames[i] +
          ' === "function"'
        );
    } catch (error) {
      exists = false;
    }

    items.push({
      name: functionNames[i],
      exists: exists
    });

    if (!exists) {
      errors.push(
        'Thiếu function: ' +
        functionNames[i]
      );
    }
  }

  return {
    errors: errors,
    items: items
  };
}


/**
 * Safe Phase 3J closed.
 */
function kidlearnV3_3kaSafePhase3JClosed_() {
  try {
    var result =
      kidlearnV3_assertPhase3JClosedV3();

    return {
      success: result.success === true,
      message: ''
    };

  } catch (error) {
    return {
      success: false,
      message:
        String(error.message || error)
    };
  }
}


/**
 * Safe Write status.
 */
function kidlearnV3_3kaSafeWriteStatus_() {
  try {
    return kidlearnV3_getSafeWriteLayerStatusV3();
  } catch (error) {
    return {
      success: false,
      mode: '',
      enabled: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Save result.
 *
 * Bản sửa:
 * - Nếu 3K-A đã READY_FOR_3K_B thì các lệnh preview/build/smoke
 *   không được downgrade status về PREVIEWED hoặc SMOKE_TESTED.
 */
function kidlearnV3_3kaSaveResult_(
  result,
  status,
  dateKey
) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_LEARNING_UI_3KA_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_LEARNING_UI_3KA_STATUS.READY_FOR_3K_B &&
    (
      status === KIDLEARN_V3_LEARNING_UI_3KA_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_LEARNING_UI_3KA_STATUS.SMOKE_TESTED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_LEARNING_UI_3KA_STATUS.READY_FOR_3K_B;
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_UI_3KA_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_UI_3KA_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      errors: result.errors || [],
      warnings: result.warnings || [],
      at: new Date().toISOString()
    })
  );
}


/**
 * Read last result.
 */
function kidlearnV3_3kaReadLastResult_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_LEARNING_UI_3KA_KEYS.LAST_RESULT_JSON
      );

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      raw: text
    };
  }
}


/**
 * Normalize request.
 */
function kidlearnV3_3kaNormalizeRequest_(
  request
) {
  if (!request) {
    return {};
  }

  if (typeof request !== 'object') {
    return {
      value: request
    };
  }

  return request;
}


================================================
FILE: App_Lesson_Content_3LB_V3.gs
================================================
/**
 * ================================================================
 * KIDLEARN V3 - LESSON CONTENT RENDERER
 * Bundle: 3L-B
 * Step:
 * - 3L-B: Optimized Lesson Content Rendering
 * Version: 3.1.0
 * ================================================================
 *
 * 3L-B:
 * - READ ONLY
 * - Không ghi DB
 * - Không real write
 * - Không rollback
 * - Không migration
 * - Không close phase
 */


var KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3LB_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3LB_LAST_PREVIEW_AT',
  LAST_BUILD_AT: 'KIDLEARN_V3_PHASE_3LB_LAST_BUILD_AT',
  LAST_SMOKE_TEST_AT: 'KIDLEARN_V3_PHASE_3LB_LAST_SMOKE_TEST_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3LB_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3LB_LAST_RESULT_JSON'
};


var KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  CONTENT_BUILT: 'CONTENT_BUILT',
  SMOKE_TESTED: 'SMOKE_TESTED',
  READY_FOR_3L_C: 'READY_FOR_3L_C',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG = {
  VERSION: '3L-B',
  PHASE: '3L-B',
  NEXT_BUNDLE: '3L-C',
  SCREEN_ID: 'LESSON_CONTENT_3LB',
  READ_ONLY: true,
  WRITE_ENABLED: false,
  MAX_ROWS_PER_SHEET: 250,
  CACHE_SECONDS: 120
};


/**
 * Preview 3L-B.
 */
function kidlearnV3_previewLessonContent3LBV3() {
  var errors = [];
  var warnings = [];

  var functionChecks =
    kidlearnV3_3lbCheckFunctions_([
      'kidlearnV3_assertAppShell3LAReadyV3',
      'kidlearnV3_appGetActiveDatabaseV3_',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3',
      'kidlearnV3_uiInclude_'
    ]);

  errors =
    errors.concat(
      functionChecks.errors
    );

  var htmlChecks =
    kidlearnV3_3lbCheckHtmlFiles_([
      'UI_Lesson_Content_3LB_Client_V3',
      'UI_Lesson_Content_3LB'
    ]);

  errors =
    errors.concat(
      htmlChecks.errors
    );

  var phase3LA =
    kidlearnV3_3lbSafeAssert3LAReady_();

  if (!phase3LA.success) {
    errors.push(
      '3L-A chưa READY_FOR_3L_B: ' +
      phase3LA.message
    );
  }

  var safeWrite =
    kidlearnV3_3lbSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      '3L-B yêu cầu Safe Write DRY_RUN/enabled=false. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var dataSummary = null;

  try {
    if (errors.length === 0) {
      dataSummary =
        kidlearnV3_3lbGetLessonDataSummary_();

      if (dataSummary.lessonsCount < 1) {
        warnings.push(
          'MST_Lessons chưa có lesson. 3L-B vẫn pass với empty state.'
        );
      }

      if (dataSummary.lessonBlocksCount < 1) {
        warnings.push(
          'MST_LessonBlocks chưa có block. 3L-B vẫn pass với shell renderer.'
        );
      }

      if (dataSummary.activitiesCount < 1) {
        warnings.push(
          'MST_Activities chưa có activity. 3L-B vẫn pass.'
        );
      }
    }
  } catch (error) {
    errors.push(
      'Không đọc được lesson data summary 3L-B: ' +
      String(error.message || error)
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_LESSON_CONTENT_3LB_V3',
    bundle: '3L-B',
    phase: KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.NEXT_BUNDLE,
    readOnly: true,
    writeEnabled: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3LA: phase3LA,
    safeWriteStatus: safeWrite,
    functionChecks: functionChecks.items,
    htmlChecks: htmlChecks.items,
    dataSummary: dataSummary
  };

  kidlearnV3_3lbSaveResult_(
    result,
    KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.PREVIEWED,
    KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.LAST_PREVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Build lesson content payload.
 */
function kidlearnV3_buildLessonContent3LBV3(request) {
  var req =
    kidlearnV3_3lbNormalizeRequest_(
      request
    );

  var preview =
    kidlearnV3_previewLessonContent3LBV3();

  if (!preview.success) {
    throw new Error(
      'Không thể build Lesson Content 3L-B vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var payload =
    kidlearnV3_buildLessonContentUltraLite3LBV3(
      req
    );

  kidlearnV3_3lbSaveResult_(
    {
      success: true,
      action: 'BUILD_LESSON_CONTENT_3LB_V3',
      bundle: '3L-B',
      phase: KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.PHASE,
      errorCount: 0,
      warningCount: payload.warningCount || 0,
      warnings: payload.warnings || [],
      diagnostics: payload.diagnostics || {}
    },
    KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.CONTENT_BUILT,
    KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.LAST_BUILD_AT
  );

  console.log(
    JSON.stringify(payload, null, 2)
  );

  return payload;
}


/**
 * Build lesson content Ultra Lite.
 *
 * Không gọi preview để tránh lặp nặng.
 */
function kidlearnV3_buildLessonContentUltraLite3LBV3(request) {
  var req =
    kidlearnV3_3lbNormalizeRequest_(
      request
    );

  var errors = [];
  var warnings = [];

  var data =
    kidlearnV3_3lbReadLessonDataCached_();

  var lesson =
    kidlearnV3_3lbResolveLesson_(
      req,
      data.lessons
    );

  var lessonId =
    String(
      req.lessonId ||
      lesson.lessonId ||
      ''
    ).trim();

  var blocks =
    kidlearnV3_3lbBuildRenderableBlocks_(
      lessonId,
      data.lessonBlocks,
      data.activities,
      data.mediaAssets
    );

  if (!lessonId) {
    warnings.push(
      'Không có lessonId. Lesson Content hiển thị empty state.'
    );
  }

  if (lessonId && blocks.length < 1) {
    warnings.push(
      'Lesson đang chọn chưa có block. Renderer hiển thị empty state.'
    );
  }

  var payload = {
    success: errors.length === 0,
    action: 'BUILD_LESSON_CONTENT_ULTRA_LITE_3LB_V3',
    bundle: '3L-B',
    phase: KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.PHASE,
    screenId:
      KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.SCREEN_ID,
    generatedAt:
      new Date().toISOString(),
    readOnly: true,
    writeEnabled: false,
    lesson: {
      lessonId: lessonId,
      lessonTitle:
        lesson.lessonTitle ||
        lesson.title ||
        'Bài học',
      subjectId:
        lesson.subjectId || '',
      topicId:
        lesson.topicId || '',
      lessonType:
        lesson.lessonType || '',
      estimatedMinutes:
        Number(lesson.estimatedMinutes || 0),
      raw:
        lesson
    },
    renderer: {
      version: '3L-B',
      mode: 'READ_ONLY_RENDER',
      lazyLoadEnabled: true,
      supportedBlockTypes:
        kidlearnV3_3lbSupportedBlockTypes_()
    },
    blocks: blocks,
    emptyState: {
      noLesson:
        !lessonId,
      noBlocks:
        lessonId && blocks.length < 1,
      message:
        !lessonId
          ? 'Chưa có bài học để hiển thị.'
          : blocks.length < 1
            ? 'Bài học chưa có nội dung.'
            : ''
    },
    guards: {
      readOnly: true,
      writeEnabled: false,
      realWriteAllowed: false,
      safeWriteExpectedMode: 'DRY_RUN',
      prodTouched: false
    },
    diagnostics: {
      lessonsCount: data.lessons.length,
      lessonBlocksCount: data.lessonBlocks.length,
      activitiesCount: data.activities.length,
      mediaAssetsCount: data.mediaAssets.length,
      selectedLessonId: lessonId,
      renderableBlockCount: blocks.length
    },
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  console.log(
    JSON.stringify(payload, null, 2)
  );

  return payload;
}


/**
 * Open Lesson Content UI 3L-B.
 */
function kidlearnV3_showLessonContent3LBV3() {
  var preview =
    kidlearnV3_previewLessonContent3LBV3();

  if (!preview.success) {
    throw new Error(
      'Lesson Content 3L-B chưa sẵn sàng. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var html =
    HtmlService
      .createTemplateFromFile(
        'UI_Lesson_Content_3LB'
      )
      .evaluate()
      .setTitle(
        'KIDLEARN V3 - Lesson Content 3L-B'
      )
      .setWidth(1220)
      .setHeight(860);

  SpreadsheetApp
    .getUi()
    .showModalDialog(
      html,
      'KIDLEARN V3 - Lesson Content 3L-B'
    );
}


/**
 * UI get lesson content.
 */
function kidlearnV3_uiLessonContent3LBGetPayloadV3(request) {
  return kidlearnV3_buildLessonContentUltraLite3LBV3(
    request || {}
  );
}


/**
 * Smoke test 3L-B Ultra Lite.
 */
function kidlearnV3_smokeTestLessonContent3LBUltraLiteV3() {
  var errors = [];
  var warnings = [];

  var phase3LA =
    kidlearnV3_3lbSafeAssert3LAReady_();

  if (!phase3LA.success) {
    errors.push(
      '3L-A chưa READY_FOR_3L_B: ' +
      phase3LA.message
    );
  }

  var safeWrite =
    kidlearnV3_3lbSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      '3L-B yêu cầu Safe Write DRY_RUN/enabled=false.'
    );
  }

  var payload = null;

  try {
    payload =
      kidlearnV3_buildLessonContentUltraLite3LBV3({});

    if (!payload.success) {
      errors.push(
        'Build lesson content Ultra Lite trả success=false.'
      );
    }

    if (payload.readOnly !== true) {
      errors.push(
        'Lesson Content 3L-B phải readOnly=true.'
      );
    }

    if (payload.writeEnabled !== false) {
      errors.push(
        'Lesson Content 3L-B phải writeEnabled=false.'
      );
    }

    if (!payload.renderer) {
      errors.push(
        'Thiếu renderer config.'
      );
    }

    if (!payload.blocks) {
      errors.push(
        'Thiếu blocks array.'
      );
    }

    if (payload.warningCount > 0) {
      warnings =
        warnings.concat(
          payload.warnings || []
        );
    }

  } catch (error) {
    errors.push(
      'Không build được Lesson Content Ultra Lite: ' +
      String(error.message || error)
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_LESSON_CONTENT_3LB_ULTRA_LITE_V3',
    bundle: '3L-B',
    phase: KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.NEXT_BUNDLE,
    readOnly: true,
    writeEnabled: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    diagnostics:
      payload
        ? payload.diagnostics
        : {}
  };

  kidlearnV3_3lbSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.SMOKE_TESTED
      : KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.FAILED,
    KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.LAST_SMOKE_TEST_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3L-B Ultra Lite smoke failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 3L-B ready.
 */
function kidlearnV3_markLessonContent3LBReadyV3() {
  var smoke =
    kidlearnV3_smokeTestLessonContent3LBUltraLiteV3();

  if (!smoke.success) {
    throw new Error(
      'Không thể mark 3L-B ready vì smoke chưa pass.'
    );
  }

  var result = {
    success: true,
    action: 'MARK_LESSON_CONTENT_3LB_READY_V3',
    bundle: '3L-B',
    phase: KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.PHASE,
    status:
      KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.READY_FOR_3L_C,
    nextBundle:
      KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.NEXT_BUNDLE,
    message:
      '3L-B ready. Có thể chuyển sang 3L-C để gắn learning interaction DRY_RUN UI.'
  };

  kidlearnV3_3lbSaveResult_(
    result,
    KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.READY_FOR_3L_C,
    KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Get 3L-B status.
 */
function kidlearnV3_getLessonContent3LBStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_LESSON_CONTENT_3LB_STATUS_V3',
    bundle: '3L-B',
    phase: KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.STATUS
      ) ||
      KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastBuildAt:
      properties.getProperty(
        KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.LAST_BUILD_AT
      ) ||
      '',
    lastSmokeTestAt:
      properties.getProperty(
        KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.LAST_SMOKE_TEST_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3lbReadLastResult_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3L-B ready.
 */
function kidlearnV3_assertLessonContent3LBReadyV3() {
  var status =
    kidlearnV3_getLessonContent3LBStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.READY_FOR_3L_C
  ) {
    errors.push(
      '3L-B chưa READY_FOR_3L_C. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_LESSON_CONTENT_3LB_READY_V3',
    bundle: '3L-B',
    phase: KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.NEXT_BUNDLE,
    errorCount: errors.length,
    errors: errors
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3L-B chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3L-B.
 */
function kidlearnV3_getQaBatchSteps3LBV3() {
  return [
    {
      label: 'Assert 3L-A ready',
      functionName: 'kidlearnV3_assertAppShell3LAReadyV3'
    },
    {
      label: 'Preview Lesson Content 3L-B',
      functionName: 'kidlearnV3_previewLessonContent3LBV3'
    },
    {
      label: 'Build Lesson Content Ultra Lite 3L-B',
      functionName: 'kidlearnV3_buildLessonContentUltraLite3LBV3'
    },
    {
      label: 'Smoke Test Lesson Content 3L-B Ultra Lite',
      functionName: 'kidlearnV3_smokeTestLessonContent3LBUltraLiteV3'
    },
    {
      label: 'Mark Lesson Content 3L-B Ready',
      functionName: 'kidlearnV3_markLessonContent3LBReadyV3'
    },
    {
      label: 'Assert Lesson Content 3L-B Ready',
      functionName: 'kidlearnV3_assertLessonContent3LBReadyV3'
    }
  ];
}


/**
 * QA batch 3L-B.
 */
function kidlearnV3_runQaBatch3LBV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3L_B_ULTRA_LITE',
    kidlearnV3_getQaBatchSteps3LBV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build renderable blocks.
 */
function kidlearnV3_3lbBuildRenderableBlocks_(
  lessonId,
  lessonBlocks,
  activities,
  mediaAssets
) {
  var blocks = [];

  if (!lessonId) {
    return blocks;
  }

  var activityMap =
    kidlearnV3_3lbMapActivitiesByBlock_(
      activities,
      lessonId
    );

  var mediaMap =
    kidlearnV3_3lbMapByKey_(
      mediaAssets,
      'mediaAssetId'
    );

  for (var i = 0; i < lessonBlocks.length; i++) {
    var row =
      lessonBlocks[i];

    if (
      row.lessonId &&
      String(row.lessonId) !== String(lessonId)
    ) {
      continue;
    }

    var blockId =
      row.lessonBlockId ||
      row.blockId ||
      'BLOCK_' + lessonId + '_' + (i + 1);

    var blockType =
      String(
        row.blockType ||
        row.type ||
        'TEXT'
      ).trim().toUpperCase();

    var mediaAssetId =
      row.mediaAssetId || '';

    var media =
      mediaAssetId && mediaMap[mediaAssetId]
        ? mediaMap[mediaAssetId]
        : null;

    blocks.push({
      blockId: blockId,
      lessonId: lessonId,
      blockType: blockType,
      displayOrder:
        Number(row.displayOrder || row.order || i + 1),
      title:
        row.title ||
        row.blockTitle ||
        kidlearnV3_3lbDefaultBlockTitle_(blockType),
      body:
        row.contentText ||
        row.blockContent ||
        row.bodyText ||
        row.instruction ||
        '',
      mediaAssetId: mediaAssetId,
      media: media,
      activities:
        activityMap[blockId] || [],
      renderModel:
        kidlearnV3_3lbBuildRenderModel_(
          blockType,
          row,
          media,
          activityMap[blockId] || []
        ),
      raw:
        row
    });
  }

  blocks.sort(
    function(a, b) {
      return a.displayOrder - b.displayOrder;
    }
  );

  return blocks;
}


/**
 * Build render model.
 */
function kidlearnV3_3lbBuildRenderModel_(
  blockType,
  row,
  media,
  activities
) {
  var type =
    String(blockType || 'TEXT').toUpperCase();

  var base = {
    type: type,
    layout:
      kidlearnV3_3lbLayoutForBlockType_(type),
    title:
      row.title ||
      row.blockTitle ||
      kidlearnV3_3lbDefaultBlockTitle_(type),
    body:
      row.contentText ||
      row.blockContent ||
      row.bodyText ||
      row.instruction ||
      '',
    hasMedia:
      media ? true : false,
    mediaUrl:
      media
        ? String(media.url || media.mediaUrl || '')
        : '',
    activityCount:
      activities.length,
    readOnly: true
  };

  if (type === 'QUESTION' || type === 'PRACTICE') {
    base.interactionMode =
      'READ_ONLY_PREVIEW';

    base.note =
      'Interaction sẽ được nối ở 3L-C bằng DRY_RUN UI.';
  }

  if (type === 'VOCABULARY') {
    base.layout =
      'VOCAB_CARD';
  }

  if (type === 'SUMMARY') {
    base.layout =
      'SUMMARY_BOX';
  }

  return base;
}


/**
 * Supported block types.
 */
function kidlearnV3_3lbSupportedBlockTypes_() {
  return [
    'TEXT',
    'VOCABULARY',
    'EXAMPLE',
    'PRACTICE',
    'QUESTION',
    'MEDIA',
    'SUMMARY'
  ];
}


/**
 * Layout for block type.
 */
function kidlearnV3_3lbLayoutForBlockType_(type) {
  var map = {
    TEXT: 'TEXT_BLOCK',
    VOCABULARY: 'VOCAB_CARD',
    EXAMPLE: 'EXAMPLE_BOX',
    PRACTICE: 'PRACTICE_PREVIEW',
    QUESTION: 'QUESTION_PREVIEW',
    MEDIA: 'MEDIA_BLOCK',
    SUMMARY: 'SUMMARY_BOX'
  };

  return map[type] || 'TEXT_BLOCK';
}


/**
 * Default block title.
 */
function kidlearnV3_3lbDefaultBlockTitle_(type) {
  var map = {
    TEXT: 'Nội dung',
    VOCABULARY: 'Từ vựng',
    EXAMPLE: 'Ví dụ',
    PRACTICE: 'Luyện tập',
    QUESTION: 'Câu hỏi',
    MEDIA: 'Hình ảnh / Video',
    SUMMARY: 'Ghi nhớ'
  };

  return map[type] || 'Nội dung';
}


/**
 * Resolve lesson.
 */
function kidlearnV3_3lbResolveLesson_(
  request,
  lessons
) {
  var lessonId =
    String(request.lessonId || '').trim();

  for (var i = 0; i < lessons.length; i++) {
    if (
      lessonId &&
      String(lessons[i].lessonId || '') === lessonId
    ) {
      return lessons[i];
    }
  }

  return lessons[0] || {
    lessonId: '',
    lessonTitle: '',
    subjectId: '',
    topicId: ''
  };
}


/**
 * Read lesson data with short cache.
 */
function kidlearnV3_3lbReadLessonDataCached_() {
  var cacheKey =
    'KIDLEARN_V3_3LB_LESSON_DATA_CACHE';

  var cache =
    CacheService.getScriptCache();

  try {
    var cached =
      cache.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    // ignore cache read error
  }

  var spreadsheet =
    kidlearnV3_3lbGetDatabaseSpreadsheet_();

  var data = {
    lessons:
      kidlearnV3_3lbReadRowsLimited_(
        spreadsheet,
        'MST_Lessons',
        KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.MAX_ROWS_PER_SHEET
      ),
    lessonBlocks:
      kidlearnV3_3lbReadRowsLimited_(
        spreadsheet,
        'MST_LessonBlocks',
        KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.MAX_ROWS_PER_SHEET
      ),
    activities:
      kidlearnV3_3lbReadRowsLimited_(
        spreadsheet,
        'MST_Activities',
        KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.MAX_ROWS_PER_SHEET
      ),
    mediaAssets:
      kidlearnV3_3lbReadRowsLimited_(
        spreadsheet,
        'MST_MediaAssets',
        KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.MAX_ROWS_PER_SHEET
      )
  };

  try {
    cache.put(
      cacheKey,
      JSON.stringify(data),
      KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.CACHE_SECONDS
    );
  } catch (cacheError) {
    // ignore cache write error
  }

  return data;
}


/**
 * Get lesson data summary.
 */
function kidlearnV3_3lbGetLessonDataSummary_() {
  var data =
    kidlearnV3_3lbReadLessonDataCached_();

  return {
    lessonsCount: data.lessons.length,
    lessonBlocksCount: data.lessonBlocks.length,
    activitiesCount: data.activities.length,
    mediaAssetsCount: data.mediaAssets.length,
    maxRowsPerSheet:
      KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.MAX_ROWS_PER_SHEET
  };
}


/**
 * Read rows limited using row 2 as keys.
 */
function kidlearnV3_3lbReadRowsLimited_(
  spreadsheet,
  sheetName,
  maxRows
) {
  var sheet =
    kidlearnV3_3lbGetSheet_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return [];
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (
    lastRow < 3 ||
    lastColumn < 1
  ) {
    return [];
  }

  var limit =
    Math.min(
      Number(maxRows || 100),
      lastRow - 2
    );

  var keys =
    sheet
      .getRange(
        2,
        1,
        1,
        lastColumn
      )
      .getDisplayValues()[0];

  var values =
    sheet
      .getRange(
        3,
        1,
        limit,
        lastColumn
      )
      .getDisplayValues();

  var rows = [];

  for (var r = 0; r < values.length; r++) {
    var row = {};
    var hasValue = false;

    for (var c = 0; c < keys.length; c++) {
      var key =
        String(keys[c] || '').trim();

      if (!key) {
        continue;
      }

      row[key] =
        values[r][c];

      if (values[r][c] !== '') {
        hasValue = true;
      }
    }

    if (hasValue) {
      rows.push(row);
    }
  }

  return rows;
}


/**
 * Map activities by block.
 */
function kidlearnV3_3lbMapActivitiesByBlock_(
  activities,
  lessonId
) {
  var map = {};

  for (var i = 0; i < activities.length; i++) {
    var row =
      activities[i];

    if (
      row.lessonId &&
      String(row.lessonId) !== String(lessonId)
    ) {
      continue;
    }

    var blockId =
      row.lessonBlockId ||
      row.blockId ||
      '_NO_BLOCK';

    if (!map[blockId]) {
      map[blockId] = [];
    }

    map[blockId].push({
      activityId:
        row.activityId ||
        'ACT_' + lessonId + '_' + (i + 1),
      activityType:
        row.activityType ||
        row.type ||
        'READ',
      prompt:
        row.prompt ||
        row.questionText ||
        row.instruction ||
        row.title ||
        '',
      displayOrder:
        Number(row.displayOrder || row.order || i + 1),
      readOnly: true,
      raw:
        row
    });
  }

  Object.keys(map).forEach(
    function(key) {
      map[key].sort(
        function(a, b) {
          return a.displayOrder - b.displayOrder;
        }
      );
    }
  );

  return map;
}


/**
 * Map rows by key.
 */
function kidlearnV3_3lbMapByKey_(
  rows,
  key
) {
  var map = {};

  for (var i = 0; i < rows.length; i++) {
    var value =
      String(rows[i][key] || '').trim();

    if (value) {
      map[value] =
        rows[i];
    }
  }

  return map;
}


/**
 * Database spreadsheet.
 */
function kidlearnV3_3lbGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3lbResolveSpreadsheet_(
      database
    );

  if (!spreadsheet) {
    throw new Error(
      'Không resolve được Spreadsheet object từ Database V3.'
    );
  }

  return spreadsheet;
}


/**
 * Resolve Spreadsheet.
 */
function kidlearnV3_3lbResolveSpreadsheet_(value) {
  if (!value) {
    return null;
  }

  if (
    typeof value.getSheets === 'function' &&
    typeof value.getId === 'function'
  ) {
    return value;
  }

  if (
    value.spreadsheet &&
    typeof value.spreadsheet.getSheets === 'function'
  ) {
    return value.spreadsheet;
  }

  if (
    value.database &&
    typeof value.database.getSheets === 'function'
  ) {
    return value.database;
  }

  if (
    value.db &&
    typeof value.db.getSheets === 'function'
  ) 
