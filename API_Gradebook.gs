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