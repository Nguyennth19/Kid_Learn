/**
 * ================================================================
 * KIDLEARN V3 - PRODUCT WEB APP SHELL
 * Phase: 4A-1C
 * Version: 3.1.0
 * ================================================================
 *
 * File này được Web App Gateway 4A-1A gọi.
 *
 * Safety:
 * - Không tạo doGet mới.
 * - Không ghi PROD.
 * - Không ghi Google Sheet.
 * - Không gọi Safe Write.
 * - Không gọi Gemini/API.
 */


/**
 * Hàm này được Gateway 4A-1A gọi.
 *
 * @param {Object} e Apps Script event object
 * @return {HtmlOutput}
 */
function kidlearnV3_productDoGet4A(e) {
  var request =
    kidlearnV3_productNormalizeRequest4A_(e);

  var context;

  if (
    typeof kidlearnV3_buildInitialProductShellContext4A1CV3 === 'function'
  ) {
    context =
      kidlearnV3_buildInitialProductShellContext4A1CV3(request);
  } else {
    context =
      kidlearnV3_buildFallbackProductShellContext4A_(request);
  }

  var template =
    HtmlService.createTemplateFromFile('UI_Product_Shell_4A');

  template.bootstrapJson =
    JSON.stringify(context)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026');

  return template
    .evaluate()
    .setTitle('KID LEARN - Học vui mỗi ngày')
    .addMetaTag(
      'viewport',
      'width=device-width, initial-scale=1, maximum-scale=1'
    )
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );
}


/**
 * Preview Product Shell.
 */
function kidlearnV3_previewProductShell4A1BV3() {
  var context =
    kidlearnV3_productDoGet4A({
      parameter: {
        app: 'v3'
      }
    });

  var result = {
    success: true,
    action: 'PREVIEW_PRODUCT_SHELL_4A_V3',
    phase: '4A-1C',
    productShellInstalled: true,
    htmlOutputCreated: context ? true : false,
    writeMode: 'READ_ONLY_UI_SHELL',
    prodWriteAllowed: false,
    realWriteAllowed: false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Smoke test Product Shell files.
 */
function kidlearnV3_smokeTestProductShell4A1BV3() {
  var errors = [];
  var warnings = [];

  if (typeof kidlearnV3_productDoGet4A !== 'function') {
    errors.push('Thiếu kidlearnV3_productDoGet4A.');
  }

  var htmlFiles = [
    'UI_Product_Shell_4A',
    'UI_Product_Styles_4A',
    'UI_Product_Client_4A'
  ];

  for (var i = 0; i < htmlFiles.length; i++) {
    try {
      HtmlService
        .createHtmlOutputFromFile(htmlFiles[i])
        .getContent();
    } catch (error) {
      errors.push(
        'Không tải được HTML file: ' +
        htmlFiles[i] +
        '. ' +
        String(error.message || error)
      );
    }
  }

  if (typeof kidlearnV3_webAppGateway4A !== 'function') {
    warnings.push(
      'Không tìm thấy kidlearnV3_webAppGateway4A. Cần kiểm tra lại 4A-1A.'
    );
  }

  if (
    typeof kidlearnV3_buildInitialProductShellContext4A1CV3 !== 'function'
  ) {
    warnings.push(
      'Chưa có Product Auth Context 4A-1C. Sau khi tạo Product_Auth_Context_4A_V3.gs warning này sẽ hết.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_PRODUCT_SHELL_4A_V3',
    phase: '4A-1C',
    productShellInstalled:
      typeof kidlearnV3_productDoGet4A === 'function',
    authContextInstalled:
      typeof kidlearnV3_buildInitialProductShellContext4A1CV3 === 'function',
    htmlFiles: htmlFiles,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      'Product Shell smoke failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Normalize product request.
 *
 * @param {Object} e Apps Script event object
 * @return {Object}
 */
function kidlearnV3_productNormalizeRequest4A_(e) {
  var parameter =
    e && e.parameter
      ? e.parameter
      : {};

  var app =
    String(parameter.app || 'v3')
      .trim()
      .toLowerCase();

  var role =
    String(parameter.role || '')
      .trim()
      .toUpperCase();

  var page =
    String(parameter.page || '')
      .trim()
      .toLowerCase();

  return {
    app: app,
    role: role,
    page: page,
    rawParameter: parameter
  };
}


/**
 * Fallback context khi Auth Context file chưa được cài.
 */
function kidlearnV3_buildFallbackProductShellContext4A_(request) {
  return {
    success: true,
    app: {
      name: 'KID LEARN',
      slogan: 'Học vui - Tiến bộ mỗi ngày',
      version: '4A-1C-FALLBACK',
      environment: 'PRODUCT_SHELL_FALLBACK',
      route: request.app || 'v3',
      generatedAt: new Date().toISOString()
    },
    auth: {
      isAuthenticated: false,
      mode: 'FALLBACK_CONTEXT',
      dataSource: 'DEMO'
    },
    defaultRole:
      request.role === 'FAMILY_ADMIN'
        ? 'FAMILY_ADMIN'
        : 'CHILD',
    defaultPage:
      request.page || 'home',
    demo: {
      child: {
        childId: 'DEMO_CHILD_LICH_KHE',
        displayName: 'Lịch Khê',
        shortName: 'Lịch Khê',
        gradeLabel: 'Lớp 2',
        avatarEmoji: '🧒',
        todayStars: 28,
        streakDays: 5,
        todayGoalText: 'Hoàn thành 2 bài học ngắn',
        nextLessonText: 'Toán học: Cộng trừ trong phạm vi 100'
      },
      parent: {
        displayName: 'Phụ huynh',
        roleLabel: 'Family Admin',
        childDisplayName: 'Lịch Khê'
      }
    },
    subjects: kidlearnV3_getFallbackSubjects4A_(),
    todayPlan: kidlearnV3_getFallbackTodayPlan4A_(),
    parentSummary: kidlearnV3_getFallbackParentSummary4A_(),
    navigation: kidlearnV3_getProductNavigation4A_()
  };
}


function kidlearnV3_getFallbackSubjects4A_() {
  return [
    {
      subjectCode: 'MATH',
      subjectName: 'Toán học',
      icon: '🔢',
      colorClass: 'subject-blue',
      progress: 62,
      lessonCount: 24,
      completedCount: 15,
      nextAction: 'Làm bài toán hôm nay'
    },
    {
      subjectCode: 'VIETNAMESE',
      subjectName: 'Tiếng Việt',
      icon: '📖',
      colorClass: 'subject-purple',
      progress: 48,
      lessonCount: 22,
      completedCount: 10,
      nextAction: 'Đọc đoạn văn ngắn'
    },
    {
      subjectCode: 'ENGLISH',
      subjectName: 'Tiếng Anh',
      icon: '🌟',
      colorClass: 'subject-pink',
      progress: 35,
      lessonCount: 18,
      completedCount: 6,
      nextAction: 'Ôn từ vựng màu sắc'
    },
    {
      subjectCode: 'SCIENCE',
      subjectName: 'Khoa học',
      icon: '🔬',
      colorClass: 'subject-green',
      progress: 25,
      lessonCount: 12,
      completedCount: 3,
      nextAction: 'Khám phá cây cối'
    }
  ];
}


function kidlearnV3_getFallbackTodayPlan4A_() {
  return [
    {
      label: 'Toán học',
      minutes: 10,
      status: 'Sẵn sàng',
      icon: '🔢'
    },
    {
      label: 'Tiếng Việt',
      minutes: 10,
      status: 'Tiếp theo',
      icon: '📖'
    },
    {
      label: 'Tiếng Anh',
      minutes: 5,
      status: 'Ôn nhanh',
      icon: '🌟'
    }
  ];
}


function kidlearnV3_getFallbackParentSummary4A_() {
  return {
    weekStudyDays: 5,
    totalMinutes: 85,
    strongSubject: 'Tiếng Việt',
    reviewSubject: 'Toán có lời văn',
    recommendation:
      'Tuần này nên ôn thêm 3 bài toán có lời văn ngắn.'
  };
}


function kidlearnV3_getProductNavigation4A_() {
  return {
    child: [
      {
        page: 'home',
        label: 'Trang chủ',
        icon: '🏠'
      },
      {
        page: 'courses',
        label: 'Khóa học',
        icon: '🎒'
      },
      {
        page: 'practice',
        label: 'Luyện tập',
        icon: '✏️'
      },
      {
        page: 'rewards',
        label: 'Thưởng',
        icon: '🏆'
      },
      {
        page: 'library',
        label: 'Thư viện',
        icon: '📚'
      }
    ],
    parent: [
      {
        page: 'parent-home',
        label: 'Tổng quan',
        icon: '📊'
      },
      {
        page: 'progress',
        label: 'Tiến độ',
        icon: '📈'
      },
      {
        page: 'wrong-review',
        label: 'Cần ôn',
        icon: '🔁'
      },
      {
        page: 'goals',
        label: 'Mục tiêu',
        icon: '🎯'
      },
      {
        page: 'settings',
        label: 'Cài đặt',
        icon: '⚙️'
      }
    ]
  };
}