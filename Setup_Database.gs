/**
 * Setup_Database.gs
 * TỰ ĐỘNG KHỞI TẠO CẤU TRÚC CƠ SỞ DỮ LIỆU
 * Tuân thủ [FILE 1 - Mục 1.1, 1.2, 1.3] của Enterprise Playbook & Master V8.1 OS
 * Bản cập nhật: Đầy đủ các bảng cho toàn bộ hệ thống LMS
 */

function autoSetupDatabase() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Định nghĩa lược đồ CSDL (Schema) chuẩn hóa theo Entity
  var schema = [
    {
      name: "Data_Tasks",
      headersRow1: ["Mã Công Việc", "Tên Công Việc", "Danh Mục", "Ngày Bắt Đầu", "Giờ Bắt Đầu", "Ngày Hạn", "Giờ Hạn", "Màu Sắc", "Trạng Thái"],
      headersRow2: ["id", "task", "category", "startDate", "startTime", "dueDate", "dueTime", "color", "status"]
    },
    {
      name: "Data_Users",
      headersRow1: ["Email Người Dùng", "Mật Khẩu (Hashed/PIN)", "Họ Và Tên", "Vai Trò (Role)", "Trạng Thái", "Đăng Nhập Lần Cuối"],
      headersRow2: ["email", "passwordHash", "fullName", "role", "status", "lastLogin"]
    },
    {
      name: "Data_Scores", // BẢNG: Quản lý điểm số
      headersRow1: ["Mã Điểm", "Email Học Sinh", "Học Kỳ", "Năm Học", "Môn Học", "Điểm Quá Trình (40%)", "Điểm KT Ngắn (20%)", "Điểm Thi (40%)", "Điểm Tổng Kết", "Đánh Giá"],
      headersRow2: ["id", "studentEmail", "semester", "year", "subject", "scoreProcess", "scoreQuiz", "scoreTest", "scoreFinal", "evaluation"]
    },
    {
      name: "Thiet_Lap",
      headersRow1: ["Mã Cấu Hình (Key)", "Giá Trị (Value)", "Mô Tả Chức Năng"],
      headersRow2: ["key", "value", "description"]
    },
    {
      name: "Danh_Muc",
      headersRow1: ["Loại Danh Mục", "Giá Trị", "Trạng Thái Hoạt Động"],
      headersRow2: ["categoryType", "value", "isActive"]
    },
    {
      name: "Log_HeThong",
      headersRow1: ["Thời Gian", "Email Người Dùng", "Hành Động", "Module", "Chi Tiết (JSON)"],
      headersRow2: ["timestamp", "userEmail", "action", "module", "details"]
    }
  ];

  // 2. Khởi tạo từng bảng trong Schema
  schema.forEach(function(config) {
    var sheet = ss.getSheetByName(config.name);
    if (!sheet) {
      sheet = ss.insertSheet(config.name);
    }

    // Nếu sheet mới hoặc chưa có tiêu đề, thiết lập Dòng 1 & Dòng 2
    if (sheet.getLastRow() < 2) {
      sheet.clear();
      sheet.getRange(1, 1, 1, config.headersRow1.length).setValues([config.headersRow1]);
      sheet.getRange(2, 1, 1, config.headersRow2.length).setValues([config.headersRow2]);

      // Định dạng Dòng 1 (Tiêu đề UI cho người dùng)
      var rangeRow1 = sheet.getRange(1, 1, 1, config.headersRow1.length);
      rangeRow1.setFontWeight("bold");
      rangeRow1.setBackground("#1e293b"); // Slate 800
      rangeRow1.setFontColor("#ffffff");

      // Định dạng Dòng 2 (Header Keys - camelCase)
      var rangeRow2 = sheet.getRange(2, 1, 1, config.headersRow2.length);
      rangeRow2.setFontStyle("italic");
      rangeRow2.setBackground("#cbd5e1"); // Slate 300
      rangeRow2.setFontColor("#0f172a");

      // Cố định 2 dòng đầu tiên
      sheet.setFrozenRows(2);
    }
  });

  // 3. Khởi tạo biến môi trường mặc định vào Thiet_Lap
  var thietLapSheet = ss.getSheetByName("Thiet_Lap");
  if (thietLapSheet && thietLapSheet.getLastRow() <= 2) {
    var defaultConfig = [
      ["APP_NAME", "KIDLEARN LMS", "Tên hệ thống Web App"],
      ["SYSTEM_VERSION", "2.0.0", "Phiên bản Enterprise Playbook"],
      ["SESSION_TIMEOUT_MINS", "120", "Thời gian hết hạn phiên đăng nhập"]
    ];
    thietLapSheet.getRange(3, 1, defaultConfig.length, 3).setValues(defaultConfig);
  }

  // 4. Xóa Sheet mặc định "Trang tính 1" / "Sheet1" nếu tồn tại và CSDL đã có sheet khác
  var defaultSheet = ss.getSheetByName("Trang tính 1") || ss.getSheetByName("Sheet1");
  if (defaultSheet && ss.getSheets().length > 1) {
    ss.deleteSheet(defaultSheet);
  }

  // 5. Dữ liệu Mẫu (Dummy Data) cho bảng Data_Scores để test UI trang Bảng điểm
  var scoreSheet = ss.getSheetByName("Data_Scores");
  if (scoreSheet && scoreSheet.getLastRow() <= 2) {
    var dummyScores = [
      ["SC_01", "student1", "Học kỳ II", "2024 - 2025", "Toán học", 8.5, 8.0, 9.0, 8.6, "Tốt"],
      ["SC_02", "student1", "Học kỳ II", "2024 - 2025", "Tiếng Việt", 8.0, 7.5, 8.5, 8.1, "Tốt"],
      ["SC_03", "student1", "Học kỳ II", "2024 - 2025", "Tiếng Anh", 7.5, 8.5, 8.0, 7.9, "Khá"],
      ["SC_04", "student1", "Học kỳ II", "2024 - 2025", "Khoa học", 8.0, 7.0, 7.5, 7.6, "Khá"]
    ];
    scoreSheet.getRange(3, 1, dummyScores.length, dummyScores[0].length).setValues(dummyScores);
  }

  // 6. Ghi Audit Log khởi tạo hệ thống
  AuditLogger.log("SYSTEM", "SETUP_DATABASE", "DATABASE", { status: "Success", timestamp: new Date() });

  // 7. Hiển thị thông báo hoàn tất
  SpreadsheetApp.getUi().alert(
    "Thành công!",
    "Toàn bộ CSDL cho hệ thống KIDLEARN đã được khởi tạo hoàn tất.",
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}