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