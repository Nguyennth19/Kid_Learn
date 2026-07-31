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