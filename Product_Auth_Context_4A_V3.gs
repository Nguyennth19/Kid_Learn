/**
 * ================================================================
 * KIDLEARN V3 - PRODUCT AUTH + CONTEXT READ-ONLY
 * Phase: 4A-1C
 * Version: 3.1.0
 * ================================================================
 *
 * Mục tiêu:
 * - Login CHILD / FAMILY_ADMIN ở mức read-only.
 * - Đọc context từ V3 sheets nếu có.
 * - Fallback demo Lịch Khê - Lớp 2 nếu dữ liệu chưa đủ.
 *
 * Safety:
 * - Không ghi Google Sheet.
 * - Không ghi PROD.
 * - Không append LOG_Audit.
 * - Không tạo DATA_Sessions.
 * - Không lưu tiến độ học.
 */


var KIDLEARN_V3_PRODUCT_AUTH_4A1C_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4A1C_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4A1C_LAST_PREVIEW_AT',
  LAST_SMOKE_AT: 'KIDLEARN_V3_PHASE_4A1C_LAST_SMOKE_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4A1C_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4A1C_LAST_RESULT_JSON'
};


var KIDLEARN_V3_PRODUCT_AUTH_4A1C_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  SMOKE_PASSED: 'SMOKE_PASSED',
  READY_FOR_4A_1D: 'READY_FOR_4A_1D',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG = {
  PHASE: '4A-1C',
  NEXT_BUNDLE: '4A-1D',
  NEXT_STAGE: 'PRODUCT_DEV_MENU_QA_AND_4A_LOCK',
  APP_NAME: 'KID LEARN',
  SLOGAN: 'Học vui - Tiến bộ mỗi ngày',
  DEFAULT_CHILD_NAME: 'Lịch Khê',
  DEFAULT_GRADE_LABEL: 'Lớp 2',
  DEFAULT_DEMO_PIN: '1234',
  MAX_READ_ROWS: 500,
  AUTH_MODE: 'READ_ONLY_SHEET_CONTEXT',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false
};


/**
 * Initial context khi mở web app.
 *
 * Chưa login nên vẫn dùng context hiển thị login + demo UI.
 */
function kidlearnV3_buildInitialProductShellContext4A1CV3(request) {
  return kidlearnV3_4aBuildContext_({
    role:
      request && request.role === 'FAMILY_ADMIN'
        ? 'FAMILY_ADMIN'
        : 'CHILD',
    loginState: 'NOT_AUTHENTICATED',
    authSource: 'INITIAL_READ_ONLY_CONTEXT',
    user: null,
    child: null
  });
}


/**
 * Server login cho Product Web App.
 *
 * Client gọi qua google.script.run.
 *
 * @param {Object} payload {role, loginCode, pin}
 * @return {Object}
 */
function kidlearnV3_productLogin4A1CV3(payload) {
  try {
    var req =
      kidlearnV3_4aNormalizeLoginPayload_(payload);

    if (!req.loginCode) {
      return kidlearnV3_4aLoginFail_(
        'Vui lòng nhập mã tài khoản.',
        'MISSING_LOGIN_CODE'
      );
    }

    if (!req.pin) {
      return kidlearnV3_4aLoginFail_(
        'Vui lòng nhập mã PIN.',
        'MISSING_PIN'
      );
    }

    var data =
      kidlearnV3_4aLoadReadonlyData_();

    var userResult =
      kidlearnV3_4aFindUserByLoginCode_(
        data.users.rows,
        req.loginCode,
        req.role
      );

    if (!userResult.found) {
      if (
        kidlearnV3_4aIsDemoLogin_(
          req.loginCode,
          req.pin,
          req.role
        )
      ) {
        var demoContext =
          kidlearnV3_4aBuildContext_({
            role: req.role,
            loginState: 'AUTHENTICATED',
            authSource: 'DEMO_FALLBACK_LOGIN',
            user: {
              userId:
                req.role === 'FAMILY_ADMIN'
                  ? 'DEMO_PARENT_USER'
                  : 'DEMO_CHILD_USER',
              displayName:
                req.role === 'FAMILY_ADMIN'
                  ? 'Phụ huynh'
                  : KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.DEFAULT_CHILD_NAME,
              role: req.role
            },
            child: null,
            data: data
          });

        return {
          success: true,
          action: 'PRODUCT_LOGIN_4A_1C_V3',
          phase: '4A-1C',
          authSource: 'DEMO_FALLBACK_LOGIN',
          message:
            'Đăng nhập demo thành công. Dữ liệu thật sẽ dùng khi DATA_Users có tài khoản phù hợp.',
          context: demoContext
        };
      }

      return kidlearnV3_4aLoginFail_(
        'Không tìm thấy tài khoản phù hợp trong DATA_Users. Có thể dùng demo LICH_KHE / 1234 để xem giao diện.',
        'USER_NOT_FOUND'
      );
    }

    var pinResult =
      kidlearnV3_4aVerifyPin_(
        userResult.user,
        req.pin
      );

    if (!pinResult.success) {
      return kidlearnV3_4aLoginFail_(
        pinResult.message,
        'PIN_INVALID'
      );
    }

    var context =
      kidlearnV3_4aBuildContext_({
        role: userResult.role || req.role,
        loginState: 'AUTHENTICATED',
        authSource: pinResult.source || 'DATA_USERS_READ_ONLY',
        user: userResult.user,
        child: null,
        data: data,
        warnings: pinResult.warnings || []
      });

    return {
      success: true,
      action: 'PRODUCT_LOGIN_4A_1C_V3',
      phase: '4A-1C',
      authSource: pinResult.source || 'DATA_USERS_READ_ONLY',
      message: 'Đăng nhập thành công.',
      context: context
    };

  } catch (error) {
    return kidlearnV3_4aLoginFail_(
      String(error.message || error),
      'LOGIN_EXCEPTION'
    );
  }
}


/**
 * Dùng cho nút "Xem giao diện demo".
 */
function kidlearnV3_getProductDemoContext4A1CV3(payload) {
  var req =
    kidlearnV3_4aNormalizeLoginPayload_(payload || {});

  var role =
    req.role === 'FAMILY_ADMIN'
      ? 'FAMILY_ADMIN'
      : 'CHILD';

  return {
    success: true,
    action: 'GET_PRODUCT_DEMO_CONTEXT_4A_1C_V3',
    phase: '4A-1C',
    context:
      kidlearnV3_4aBuildContext_({
        role: role,
        loginState: 'AUTHENTICATED',
        authSource: 'DEMO_PREVIEW',
        user: {
          userId:
            role === 'FAMILY_ADMIN'
              ? 'DEMO_PARENT_USER'
              : 'DEMO_CHILD_USER',
          displayName:
            role === 'FAMILY_ADMIN'
              ? 'Phụ huynh'
              : KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.DEFAULT_CHILD_NAME,
          role: role
        },
        child: null
      })
  };
}


/**
 * Preview data sources.
 */
function kidlearnV3_previewProductAuthContext4A1CV3() {
  var errors = [];
  var warnings = [];

  var data =
    kidlearnV3_4aLoadReadonlyData_();

  if (!data.spreadsheetId) {
    errors.push('Không mở được spreadsheet.');
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PRODUCT_AUTH_CONTEXT_4A_1C_V3',
    phase: '4A-1C',
    spreadsheetId: data.spreadsheetId || '',
    spreadsheetName: data.spreadsheetName || '',
    sheetSummary: {
      DATA_Users: data.users.rowCount,
      DATA_Children: data.children.rowCount,
      DATA_UserChildAccess: data.access.rowCount,
      MST_Subjects: data.subjects.rowCount,
      MST_Lessons: data.lessons.rowCount,
      DATA_LessonProgress: data.lessonProgress.rowCount,
      DATA_DailyGoals: data.dailyGoals.rowCount,
      DATA_RewardTransactions: data.rewardTransactions.rowCount,
      DATA_Streaks: data.streaks.rowCount
    },
    authMode:
      KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.AUTH_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    warnings: warnings.concat(data.warnings || []),
    errorCount: errors.length,
    warningCount:
      warnings.length + (data.warnings || []).length,
    errors: errors
  };

  kidlearnV3_4aSaveStatus_(
    result,
    KIDLEARN_V3_PRODUCT_AUTH_4A1C_STATUS.PREVIEWED,
    KIDLEARN_V3_PRODUCT_AUTH_4A1C_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Smoke test 4A-1C.
 */
function kidlearnV3_smokeTestProductAuthContext4A1CV3() {
  var errors = [];
  var warnings = [];

  if (typeof kidlearnV3_productLogin4A1CV3 !== 'function') {
    errors.push('Thiếu kidlearnV3_productLogin4A1CV3.');
  }

  if (typeof kidlearnV3_buildInitialProductShellContext4A1CV3 !== 'function') {
    errors.push('Thiếu kidlearnV3_buildInitialProductShellContext4A1CV3.');
  }

  var data =
    kidlearnV3_4aLoadReadonlyData_();

  if (!data.spreadsheetId) {
    errors.push('Không mở được spreadsheet.');
  }

  warnings = warnings.concat(data.warnings || []);

  var childLogin =
    kidlearnV3_productLogin4A1CV3({
      role: 'CHILD',
      loginCode: 'LICH_KHE',
      pin: '1234'
    });

  if (!childLogin.success) {
    errors.push(
      'Demo CHILD login failed: ' +
      childLogin.message
    );
  }

  var parentLogin =
    kidlearnV3_productLogin4A1CV3({
      role: 'FAMILY_ADMIN',
      loginCode: 'PARENT',
      pin: '1234'
    });

  if (!parentLogin.success) {
    errors.push(
      'Demo FAMILY_ADMIN login failed: ' +
      parentLogin.message
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_PRODUCT_AUTH_CONTEXT_4A_1C_V3',
    phase: '4A-1C',
    authContextInstalled: true,
    childDemoLoginSuccess:
      childLogin.success === true,
    parentDemoLoginSuccess:
      parentLogin.success === true,
    sheetSummary: {
      DATA_Users: data.users.rowCount,
      DATA_Children: data.children.rowCount,
      DATA_UserChildAccess: data.access.rowCount,
      MST_Subjects: data.subjects.rowCount
    },
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4aSaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_PRODUCT_AUTH_4A1C_STATUS.SMOKE_PASSED
      : KIDLEARN_V3_PRODUCT_AUTH_4A1C_STATUS.FAILED,
    KIDLEARN_V3_PRODUCT_AUTH_4A1C_KEYS.LAST_SMOKE_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4A-1C smoke failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Test child demo login.
 */
function kidlearnV3_testProductAuthChildDemoLogin4A1CV3() {
  var result =
    kidlearnV3_productLogin4A1CV3({
      role: 'CHILD',
      loginCode: 'LICH_KHE',
      pin: '1234'
    });

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(result.message);
  }

  return result;
}


/**
 * Test parent demo login.
 */
function kidlearnV3_testProductAuthParentDemoLogin4A1CV3() {
  var result =
    kidlearnV3_productLogin4A1CV3({
      role: 'FAMILY_ADMIN',
      loginCode: 'PARENT',
      pin: '1234'
    });

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(result.message);
  }

  return result;
}


/**
 * Mark ready.
 */
function kidlearnV3_markProductAuthContext4A1CReadyV3() {
  var smoke =
    kidlearnV3_smokeTestProductAuthContext4A1CV3();

  if (!smoke.success) {
    throw new Error('Smoke 4A-1C chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_PRODUCT_AUTH_CONTEXT_4A_1C_READY_V3',
    phase: '4A-1C',
    status:
      KIDLEARN_V3_PRODUCT_AUTH_4A1C_STATUS.READY_FOR_4A_1D,
    nextBundle:
      KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.NEXT_STAGE,
    authMode:
      KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.AUTH_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    message:
      '4A-1C ready. Product Auth + Context Read-only đã sẵn sàng.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4aSaveStatus_(
    result,
    KIDLEARN_V3_PRODUCT_AUTH_4A1C_STATUS.READY_FOR_4A_1D,
    KIDLEARN_V3_PRODUCT_AUTH_4A1C_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getProductAuthContext4A1CStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PRODUCT_AUTH_CONTEXT_4A_1C_STATUS_V3',
    phase: '4A-1C',
    status:
      properties.getProperty(
        KIDLEARN_V3_PRODUCT_AUTH_4A1C_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PRODUCT_AUTH_4A1C_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PRODUCT_AUTH_4A1C_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastSmokeAt:
      properties.getProperty(
        KIDLEARN_V3_PRODUCT_AUTH_4A1C_KEYS.LAST_SMOKE_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PRODUCT_AUTH_4A1C_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4aReadJsonProperty_(
        KIDLEARN_V3_PRODUCT_AUTH_4A1C_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertProductAuthContext4A1CReadyV3() {
  var status =
    kidlearnV3_getProductAuthContext4A1CStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PRODUCT_AUTH_4A1C_STATUS.READY_FOR_4A_1D
  ) {
    errors.push(
      '4A-1C chưa READY_FOR_4A_1D. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PRODUCT_AUTH_CONTEXT_4A_1C_READY_V3',
    phase: '4A-1C',
    status: status.status,
    nextBundle:
      KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(errors.join(' | '));
  }

  return result;
}


/**
 * QA steps.
 */
function kidlearnV3_getQaBatchSteps4A1CV3() {
  return [
    {
      label: 'Smoke Product Shell',
      functionName: 'kidlearnV3_smokeTestProductShell4A1BV3'
    },
    {
      label: 'Preview Product Auth Context',
      functionName: 'kidlearnV3_previewProductAuthContext4A1CV3'
    },
    {
      label: 'Smoke Product Auth Context',
      functionName: 'kidlearnV3_smokeTestProductAuthContext4A1CV3'
    },
    {
      label: 'Test CHILD demo login',
      functionName: 'kidlearnV3_testProductAuthChildDemoLogin4A1CV3'
    },
    {
      label: 'Test FAMILY_ADMIN demo login',
      functionName: 'kidlearnV3_testProductAuthParentDemoLogin4A1CV3'
    },
    {
      label: 'Mark 4A-1C Ready',
      functionName: 'kidlearnV3_markProductAuthContext4A1CReadyV3'
    },
    {
      label: 'Assert 4A-1C Ready',
      functionName: 'kidlearnV3_assertProductAuthContext4A1CReadyV3'
    }
  ];
}


/**
 * QA batch 4A-1C.
 */
function kidlearnV3_runQaBatch4A1CV3() {
  var steps =
    kidlearnV3_getQaBatchSteps4A1CV3();

  if (typeof kidlearnV3_runQaBatchProvidedStepsV3 === 'function') {
    return kidlearnV3_runQaBatchProvidedStepsV3(
      'PHASE_4A_1C_PRODUCT_AUTH_CONTEXT_READ_ONLY',
      steps,
      {
        stopOnFailure: true
      }
    );
  }

  return kidlearnV3_4aRunLocalBatch_(
    'PHASE_4A_1C_PRODUCT_AUTH_CONTEXT_READ_ONLY',
    steps
  );
}


/**
 * Build UI context.
 */
function kidlearnV3_4aBuildContext_(options) {
  var role =
    kidlearnV3_4aNormalizeRole_(
      options && options.role
        ? options.role
        : 'CHILD'
    );

  var data =
    options && options.data
      ? options.data
      : kidlearnV3_4aLoadReadonlyData_();

  var user =
    options && options.user
      ? kidlearnV3_4aPublicUser_(options.user, role)
      : null;

  var child =
    kidlearnV3_4aResolveChildForContext_(
      role,
      user,
      data
    );

  var subjects =
    kidlearnV3_4aBuildSubjectsForChild_(
      child,
      data
    );

  var todayStats =
    kidlearnV3_4aBuildTodayStats_(
      child,
      data
    );

  var parentSummary =
    kidlearnV3_4aBuildParentSummary_(
      child,
      subjects,
      data
    );

  return {
    success: true,
    app: {
      name:
        KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.APP_NAME,
      slogan:
        KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.SLOGAN,
      version: '4A-1C',
      environment: 'PRODUCT_AUTH_CONTEXT_READ_ONLY',
      generatedAt: new Date().toISOString()
    },
    auth: {
      isAuthenticated:
        options && options.loginState === 'AUTHENTICATED',
      loginState:
        options && options.loginState
          ? options.loginState
          : 'NOT_AUTHENTICATED',
      mode:
        KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.AUTH_MODE,
      source:
        options && options.authSource
          ? options.authSource
          : 'INITIAL_READ_ONLY_CONTEXT',
      warnings:
        options && options.warnings
          ? options.warnings
          : []
    },
    currentUser:
      user,
    selectedChild:
      child,
    defaultRole:
      role,
    defaultPage:
      role === 'FAMILY_ADMIN'
        ? 'parent-home'
        : 'home',
    demo: {
      child: {
        childId: child.childId || 'DEMO_CHILD_LICH_KHE',
        displayName: child.displayName || 'Lịch Khê',
        shortName: child.shortName || child.displayName || 'Lịch Khê',
        gradeLabel: child.gradeLabel || 'Lớp 2',
        avatarEmoji: child.avatarEmoji || '🧒',
        todayStars: todayStats.todayStars,
        streakDays: todayStats.streakDays,
        todayGoalText: todayStats.todayGoalText,
        nextLessonText: todayStats.nextLessonText
      },
      parent: {
        displayName:
          user && user.displayName
            ? user.displayName
            : 'Phụ huynh',
        roleLabel: 'Family Admin',
        childDisplayName: child.displayName || 'Lịch Khê'
      }
    },
    subjects: subjects,
    todayPlan:
      kidlearnV3_getFallbackTodayPlan4A_(),
    parentSummary: parentSummary,
    navigation:
      kidlearnV3_getProductNavigation4A_(),
    dataSource: {
      spreadsheetId: data.spreadsheetId || '',
      spreadsheetName: data.spreadsheetName || '',
      usersRowCount: data.users.rowCount,
      childrenRowCount: data.children.rowCount,
      subjectsRowCount: data.subjects.rowCount,
      fallbackUsed: data.fallbackUsed === true
    }
  };
}


/**
 * Load read-only data.
 */
function kidlearnV3_4aLoadReadonlyData_() {
  var warnings = [];
  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4aOpenSpreadsheet_();
  } catch (error) {
    warnings.push(
      'Không mở được spreadsheet: ' +
      String(error.message || error)
    );
  }

  if (!spreadsheet) {
    return {
      spreadsheetId: '',
      spreadsheetName: '',
      warnings: warnings,
      fallbackUsed: true,
      users: kidlearnV3_4aEmptyTable_('DATA_Users'),
      children: kidlearnV3_4aEmptyTable_('DATA_Children'),
      access: kidlearnV3_4aEmptyTable_('DATA_UserChildAccess'),
      subjects: kidlearnV3_4aEmptyTable_('MST_Subjects'),
      lessons: kidlearnV3_4aEmptyTable_('MST_Lessons'),
      lessonProgress: kidlearnV3_4aEmptyTable_('DATA_LessonProgress'),
      dailyGoals: kidlearnV3_4aEmptyTable_('DATA_DailyGoals'),
      rewardTransactions: kidlearnV3_4aEmptyTable_('DATA_RewardTransactions'),
      streaks: kidlearnV3_4aEmptyTable_('DATA_Streaks')
    };
  }

  var data = {
    spreadsheetId: spreadsheet.getId(),
    spreadsheetName: spreadsheet.getName(),
    warnings: warnings,
    fallbackUsed: false,
    users:
      kidlearnV3_4aReadTable_(
        spreadsheet,
        'DATA_Users',
        KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.MAX_READ_ROWS
      ),
    children:
      kidlearnV3_4aReadTable_(
        spreadsheet,
        'DATA_Children',
        KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.MAX_READ_ROWS
      ),
    access:
      kidlearnV3_4aReadTable_(
        spreadsheet,
        'DATA_UserChildAccess',
        KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.MAX_READ_ROWS
      ),
    subjects:
      kidlearnV3_4aReadTable_(
        spreadsheet,
        'MST_Subjects',
        KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.MAX_READ_ROWS
      ),
    lessons:
      kidlearnV3_4aReadTable_(
        spreadsheet,
        'MST_Lessons',
        KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.MAX_READ_ROWS
      ),
    lessonProgress:
      kidlearnV3_4aReadTable_(
        spreadsheet,
        'DATA_LessonProgress',
        KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.MAX_READ_ROWS
      ),
    dailyGoals:
      kidlearnV3_4aReadTable_(
        spreadsheet,
        'DATA_DailyGoals',
        KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.MAX_READ_ROWS
      ),
    rewardTransactions:
      kidlearnV3_4aReadTable_(
        spreadsheet,
        'DATA_RewardTransactions',
        KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.MAX_READ_ROWS
      ),
    streaks:
      kidlearnV3_4aReadTable_(
        spreadsheet,
        'DATA_Streaks',
        KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.MAX_READ_ROWS
      )
  };

  var tables = [
    data.users,
    data.children,
    data.access,
    data.subjects,
    data.lessons,
    data.lessonProgress,
    data.dailyGoals,
    data.rewardTransactions,
    data.streaks
  ];

  for (var i = 0; i < tables.length; i++) {
    if (!tables[i].success) {
      data.warnings.push(
        tables[i].sheetName +
        ': ' +
        tables[i].message
      );
    }
  }

  return data;
}


/**
 * Open spreadsheet.
 */
function kidlearnV3_4aOpenSpreadsheet_() {
  var active =
    SpreadsheetApp.getActiveSpreadsheet();

  if (active) {
    return active;
  }

  var properties =
    PropertiesService.getScriptProperties();

  var candidateKeys = [];

  try {
    if (
      typeof KIDLEARN_V3 !== 'undefined' &&
      KIDLEARN_V3 &&
      KIDLEARN_V3.SCRIPT_PROPERTIES
    ) {
      if (KIDLEARN_V3.SCRIPT_PROPERTIES.DEV_SPREADSHEET_ID) {
        candidateKeys.push(
          KIDLEARN_V3.SCRIPT_PROPERTIES.DEV_SPREADSHEET_ID
        );
      }
      if (KIDLEARN_V3.SCRIPT_PROPERTIES.PROD_SPREADSHEET_ID) {
        candidateKeys.push(
          KIDLEARN_V3.SCRIPT_PROPERTIES.PROD_SPREADSHEET_ID
        );
      }
    }
  } catch (error) {
    // Ignore.
  }

  candidateKeys = candidateKeys.concat([
    'KIDLEARN_V3_DEV_SPREADSHEET_ID',
    'KIDLEARN_V3_PROD_SPREADSHEET_ID',
    'DEV_SPREADSHEET_ID',
    'PROD_SPREADSHEET_ID'
  ]);

  for (var i = 0; i < candidateKeys.length; i++) {
    var id =
      properties.getProperty(candidateKeys[i]);

    if (id) {
      return SpreadsheetApp.openById(id);
    }
  }

  throw new Error('Không tìm thấy active spreadsheet hoặc spreadsheetId trong ScriptProperties.');
}


/**
 * Read table from V3 sheet.
 */
function kidlearnV3_4aReadTable_(spreadsheet, sheetName, maxRows) {
  var sheet =
    kidlearnV3_4aGetSheetByExactName_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return {
      success: false,
      sheetName: sheetName,
      rowCount: 0,
      rows: [],
      message: 'Sheet không tồn tại.'
    };
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (lastRow < 2 || lastColumn < 1) {
    return {
      success: true,
      sheetName: sheetName,
      rowCount: 0,
      rows: [],
      message: 'Sheet chưa có dữ liệu.'
    };
  }

  var readRows =
    Math.min(lastRow, Number(maxRows || 500) + 2);

  var values =
    sheet
      .getRange(1, 1, readRows, lastColumn)
      .getValues();

  var labels =
    values[0] || [];

  var keyRow =
    values[1] || [];

  var keys = [];

  for (var c = 0; c < lastColumn; c++) {
    var key =
      String(keyRow[c] || labels[c] || ('col_' + (c + 1)))
        .trim();

    if (!key) key = 'col_' + (c + 1);

    keys.push(key);
  }

  var rows = [];

  for (var r = 2; r < values.length; r++) {
    var rowValues =
      values[r];

    var isBlank = true;
    var obj = {
      _rowNumber: r + 1
    };

    for (var j = 0; j < keys.length; j++) {
      var value =
        rowValues[j];

      if (value !== '' && value !== null) {
        isBlank = false;
      }

      obj[keys[j]] = value;
    }

    if (!isBlank) {
      rows.push(obj);
    }
  }

  return {
    success: true,
    sheetName: sheetName,
    rowCount: rows.length,
    rows: rows,
    message: 'OK'
  };
}


function kidlearnV3_4aEmptyTable_(sheetName) {
  return {
    success: false,
    sheetName: sheetName,
    rowCount: 0,
    rows: [],
    message: 'No spreadsheet.'
  };
}


/**
 * Exact sheet lookup.
 */
function kidlearnV3_4aGetSheetByExactName_(spreadsheet, sheetName) {
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
 * Normalize login payload.
 */
function kidlearnV3_4aNormalizeLoginPayload_(payload) {
  payload = payload || {};

  return {
    role:
      kidlearnV3_4aNormalizeRole_(
        payload.role || 'CHILD'
      ),
    loginCode:
      String(payload.loginCode || '')
        .trim(),
    pin:
      String(payload.pin || '')
        .trim()
  };
}


function kidlearnV3_4aNormalizeRole_(role) {
  var value =
    String(role || '')
      .trim()
      .toUpperCase();

  if (value === 'FAMILY_ADMIN') return 'FAMILY_ADMIN';
  return 'CHILD';
}


/**
 * Find user.
 */
function kidlearnV3_4aFindUserByLoginCode_(rows, loginCode, requestedRole) {
  var normalizedLogin =
    kidlearnV3_4aNormalizeLoginKey_(loginCode);

  var role =
    kidlearnV3_4aNormalizeRole_(requestedRole);

  var loginFields = [
    'loginCode',
    'userCode',
    'username',
    'email',
    'userEmail',
    'accountCode',
    'code',
    'studentCode',
    'parentCode',
    'displayName',
    'fullName',
    'name'
  ];

  var firstMatch = null;

  for (var i = 0; i < rows.length; i++) {
    var row =
      rows[i];

    if (!kidlearnV3_4aIsActiveRow_(row)) {
      continue;
    }

    var matchesLogin = false;

    for (var f = 0; f < loginFields.length; f++) {
      var value =
        kidlearnV3_4aGetAny_(
          row,
          [loginFields[f]]
        );

      if (
        value !== '' &&
        kidlearnV3_4aNormalizeLoginKey_(value) === normalizedLogin
      ) {
        matchesLogin = true;
        break;
      }
    }

    if (!matchesLogin) {
      continue;
    }

    var rowRole =
      kidlearnV3_4aNormalizeRole_(
        kidlearnV3_4aGetAny_(
          row,
          [
            'role',
            'userRole',
            'roleCode',
            'accountRole'
          ]
        )
      );

    if (!firstMatch) {
      firstMatch = {
        user: row,
        role: rowRole || role
      };
    }

    if (rowRole === role) {
      return {
        found: true,
        user: row,
        role: rowRole
      };
    }
  }

  if (firstMatch) {
    return {
      found: true,
      user: firstMatch.user,
      role: firstMatch.role || role
    };
  }

  return {
    found: false,
    user: null,
    role: role
  };
}


/**
 * Verify PIN.
 */
function kidlearnV3_4aVerifyPin_(user, pin) {
  var warnings = [];

  var pinFields = [
    'pin',
    'loginPin',
    'userPin',
    'accessPin',
    'passcode',
    'password'
  ];

  var storedPin = '';

  for (var i = 0; i < pinFields.length; i++) {
    var value =
      kidlearnV3_4aGetAny_(
        user,
        [pinFields[i]]
      );

    if (value !== '') {
      storedPin = String(value);
      break;
    }
  }

  if (storedPin) {
    if (String(pin) === String(storedPin)) {
      return {
        success: true,
        source: 'DATA_USERS_PIN',
        warnings: warnings
      };
    }

    return {
      success: false,
      message: 'Mã PIN không đúng.',
      warnings: warnings
    };
  }

  if (
    String(pin) ===
    KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.DEFAULT_DEMO_PIN
  ) {
    warnings.push(
      'DATA_Users chưa có cột PIN/password rõ ràng. Tạm cho phép PIN demo 1234 trong 4A-1C.'
    );

    return {
      success: true,
      source: 'DATA_USERS_NO_PIN_DEMO_PIN_ALLOWED_4A1C',
      warnings: warnings
    };
  }

  return {
    success: false,
    message:
      'Tài khoản chưa có PIN trong DATA_Users. Trong 4A-1C có thể dùng PIN demo 1234.',
    warnings: warnings
  };
}


/**
 * Demo login.
 */
function kidlearnV3_4aIsDemoLogin_(loginCode, pin, role) {
  var code =
    kidlearnV3_4aNormalizeLoginKey_(loginCode);

  var pinOk =
    String(pin) ===
    KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.DEFAULT_DEMO_PIN;

  if (!pinOk) return false;

  if (role === 'FAMILY_ADMIN') {
    return (
      code === 'PARENT' ||
      code === 'PHUHUYNH' ||
      code === 'PHU_HUYNH' ||
      code === 'FAMILY' ||
      code === 'ADMIN'
    );
  }

  return (
    code === 'LICHKHE' ||
    code === 'LICH_KHE' ||
    code === 'DEMO' ||
    code === 'CHILD'
  );
}


function kidlearnV3_4aLoginFail_(message, code) {
  return {
    success: false,
    action: 'PRODUCT_LOGIN_4A_1C_V3',
    phase: '4A-1C',
    code: code || 'LOGIN_FAILED',
    message: message || 'Đăng nhập không thành công.',
    prodWriteAllowed: false,
    realWriteAllowed: false
  };
}


/**
 * Public user object. Không trả PIN/password.
 */
function kidlearnV3_4aPublicUser_(row, fallbackRole) {
  if (!row) return null;

  var role =
    kidlearnV3_4aNormalizeRole_(
      kidlearnV3_4aGetAny_(
        row,
        [
          'role',
          'userRole',
          'roleCode',
          'accountRole'
        ]
      ) || fallbackRole
    );

  return {
    userId:
      String(
        kidlearnV3_4aGetAny_(
          row,
          [
            'userId',
            'id',
            'accountId'
          ]
        ) || ''
      ),
    userCode:
      String(
        kidlearnV3_4aGetAny_(
          row,
          [
            'userCode',
            'loginCode',
            'username',
            'accountCode',
            'email'
          ]
        ) || ''
      ),
    displayName:
      String(
        kidlearnV3_4aGetAny_(
          row,
          [
            'displayName',
            'fullName',
            'name',
            'userName',
            'email'
          ]
        ) || ''
      ),
    role: role
  };
}


/**
 * Resolve child.
 */
function kidlearnV3_4aResolveChildForContext_(role, user, data) {
  var fallback =
    kidlearnV3_4aFallbackChild_();

  if (!data || !data.children || data.children.rows.length === 0) {
    return fallback;
  }

  var childId = '';

  if (user && user.userId) {
    if (role === 'CHILD') {
      childId =
        kidlearnV3_4aFindChildIdForChildUser_(
          user,
          data
        );
    } else {
      childId =
        kidlearnV3_4aFindChildIdForFamilyAdmin_(
          user,
          data
        );
    }
  }

  var childRow = null;

  if (childId) {
    childRow =
      kidlearnV3_4aFindRowById_(
        data.children.rows,
        [
          'childId',
          'id'
        ],
        childId
      );
  }

  if (!childRow) {
    childRow =
      data.children.rows[0];
  }

  if (!childRow) {
    return fallback;
  }

  return {
    childId:
      String(
        kidlearnV3_4aGetAny_(
          childRow,
          [
            'childId',
            'id'
          ]
        ) || fallback.childId
      ),
    displayName:
      String(
        kidlearnV3_4aGetAny_(
          childRow,
          [
            'displayName',
            'fullName',
            'childName',
            'name'
          ]
        ) || fallback.displayName
      ),
    shortName:
      String(
        kidlearnV3_4aGetAny_(
          childRow,
          [
            'shortName',
            'nickname',
            'displayName',
            'childName',
            'name'
          ]
        ) || fallback.shortName
      ),
    gradeLabel:
      String(
        kidlearnV3_4aGetAny_(
          childRow,
          [
            'gradeLabel',
            'grade',
            'className',
            'gradeLevel'
          ]
        ) || fallback.gradeLabel
      ),
    avatarEmoji:
      String(
        kidlearnV3_4aGetAny_(
          childRow,
          [
            'avatarEmoji',
            'avatar',
            'emoji'
          ]
        ) || fallback.avatarEmoji
      )
  };
}


function kidlearnV3_4aFindChildIdForChildUser_(user, data) {
  var directChildId =
    kidlearnV3_4aGetAny_(
      user,
      [
        'childId',
        'linkedChildId'
      ]
    );

  if (directChildId) return String(directChildId);

  var userId =
    String(user.userId || '');

  for (var i = 0; i < data.children.rows.length; i++) {
    var row =
      data.children.rows[i];

    var linkedUserId =
      kidlearnV3_4aGetAny_(
        row,
        [
          'userId',
          'linkedUserId',
          'childUserId'
        ]
      );

    if (
      linkedUserId &&
      String(linkedUserId) === userId
    ) {
      return String(
        kidlearnV3_4aGetAny_(
          row,
          [
            'childId',
            'id'
          ]
        )
      );
    }
  }

  return '';
}


function kidlearnV3_4aFindChildIdForFamilyAdmin_(user, data) {
  var userId =
    String(user.userId || '');

  for (var i = 0; i < data.access.rows.length; i++) {
    var row =
      data.access.rows[i];

    if (!kidlearnV3_4aIsActiveRow_(row)) {
      continue;
    }

    var accessUserId =
      String(
        kidlearnV3_4aGetAny_(
          row,
          [
            'userId',
            'familyAdminUserId',
            'parentUserId'
          ]
        ) || ''
      );

    if (accessUserId === userId) {
      return String(
        kidlearnV3_4aGetAny_(
          row,
          [
            'childId',
            'studentId'
          ]
        ) || ''
      );
    }
  }

  return '';
}


function kidlearnV3_4aFallbackChild_() {
  return {
    childId: 'DEMO_CHILD_LICH_KHE',
    displayName:
      KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.DEFAULT_CHILD_NAME,
    shortName:
      KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.DEFAULT_CHILD_NAME,
    gradeLabel:
      KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.DEFAULT_GRADE_LABEL,
    avatarEmoji: '🧒'
  };
}


/**
 * Build subject cards.
 */
function kidlearnV3_4aBuildSubjectsForChild_(child, data) {
  var fallback =
    kidlearnV3_getFallbackSubjects4A_();

  if (
    !data ||
    !data.subjects ||
    data.subjects.rows.length === 0
  ) {
    return fallback;
  }

  var result = [];

  for (var i = 0; i < data.subjects.rows.length; i++) {
    var row =
      data.subjects.rows[i];

    if (!kidlearnV3_4aIsActiveRow_(row)) {
      continue;
    }

    var subjectCode =
      String(
        kidlearnV3_4aGetAny_(
          row,
          [
            'subjectCode',
            'code',
            'subjectId'
          ]
        ) || ''
      );

    var subjectName =
      String(
        kidlearnV3_4aGetAny_(
          row,
          [
            'subjectName',
            'name',
            'title'
          ]
        ) || ''
      );

    if (!subjectName) {
      continue;
    }

    var template =
      kidlearnV3_4aSubjectTemplate_(
        subjectCode,
        subjectName
      );

    var progress =
      kidlearnV3_4aEstimateSubjectProgress_(
        child,
        subjectCode,
        subjectName,
        data
      );

    result.push({
      subjectCode:
        subjectCode || template.subjectCode,
      subjectName: subjectName,
      icon: template.icon,
      colorClass: template.colorClass,
      progress: progress.progress,
      lessonCount: progress.lessonCount,
      completedCount: progress.completedCount,
      nextAction: template.nextAction
    });
  }

  if (result.length === 0) {
    return fallback;
  }

  return result.slice(0, 8);
}


function kidlearnV3_4aSubjectTemplate_(subjectCode, subjectName) {
  var code =
    String(subjectCode || subjectName || '')
      .toUpperCase();

  if (
    code.indexOf('MATH') >= 0 ||
    code.indexOf('TOAN') >= 0 ||
    code.indexOf('TOÁN') >= 0
  ) {
    return {
      subjectCode: 'MATH',
      icon: '🔢',
      colorClass: 'subject-blue',
      nextAction: 'Làm bài toán hôm nay'
    };
  }

  if (
    code.indexOf('VIET') >= 0 ||
    code.indexOf('TIENGVIET') >= 0 ||
    code.indexOf('TIẾNG VIỆT') >= 0
  ) {
    return {
      subjectCode: 'VIETNAMESE',
      icon: '📖',
      colorClass: 'subject-purple',
      nextAction: 'Đọc đoạn văn ngắn'
    };
  }

  if (
    code.indexOf('ENGLISH') >= 0 ||
    code.indexOf('TIENGANH') >= 0 ||
    code.indexOf('TIẾNG ANH') >= 0
  ) {
    return {
      subjectCode: 'ENGLISH',
      icon: '🌟',
      colorClass: 'subject-pink',
      nextAction: 'Ôn từ vựng mới'
    };
  }

  if (
    code.indexOf('SCIENCE') >= 0 ||
    code.indexOf('KHOA') >= 0
  ) {
    return {
      subjectCode: 'SCIENCE',
      icon: '🔬',
      colorClass: 'subject-green',
      nextAction: 'Khám phá bài học mới'
    };
  }

  return {
    subjectCode: subjectCode || 'SUBJECT',
    icon: '📘',
    colorClass: 'subject-blue',
    nextAction: 'Bắt đầu học'
  };
}


function kidlearnV3_4aEstimateSubjectProgress_(child, subjectCode, subjectName, data) {
  var childId =
    child && child.childId
      ? String(child.childId)
      : '';

  var matched = [];
  var completed = 0;
  var totalProgress = 0;
  var progressCount = 0;

  for (var i = 0; i < data.lessonProgress.rows.length; i++) {
    var row =
      data.lessonProgress.rows[i];

    var rowChildId =
      String(
        kidlearnV3_4aGetAny_(
          row,
          [
            'childId',
            'studentId'
          ]
        ) || ''
      );

    if (childId && rowChildId && rowChildId !== childId) {
      continue;
    }

    var rowSubject =
      String(
        kidlearnV3_4aGetAny_(
          row,
          [
            'subjectCode',
            'subjectId',
            'subjectName'
          ]
        ) || ''
      ).toUpperCase();

    var target =
      String(subjectCode || subjectName || '')
        .toUpperCase();

    if (
      rowSubject &&
      target &&
      rowSubject.indexOf(target) === -1 &&
      target.indexOf(rowSubject) === -1
    ) {
      continue;
    }

    matched.push(row);

    var status =
      String(
        kidlearnV3_4aGetAny_(
          row,
          [
            'status',
            'progressStatus',
            'completionStatus'
          ]
        ) || ''
      ).toUpperCase();

    if (
      status === 'COMPLETED' ||
      status === 'DONE' ||
      status === 'FINISHED'
    ) {
      completed++;
    }

    var pct =
      Number(
        kidlearnV3_4aGetAny_(
          row,
          [
            'progressPercent',
            'completionPercent',
            'progress',
            'percent'
          ]
        ) || ''
      );

    if (!isNaN(pct) && pct >= 0) {
      totalProgress += Math.min(100, pct);
      progressCount++;
    }
  }

  var lessonCount =
    kidlearnV3_4aCountLessonsForSubject_(
      subjectCode,
      subjectName,
      data
    );

  if (lessonCount === 0) {
    lessonCount =
      matched.length > 0
        ? matched.length
        : 12;
  }

  var progress =
    progressCount > 0
      ? Math.round(totalProgress / progressCount)
      : Math.round((completed / lessonCount) * 100);

  if (!progress || progress < 0) {
    progress = 0;
  }

  if (progress > 100) {
    progress = 100;
  }

  return {
    progress: progress,
    lessonCount: lessonCount,
    completedCount: completed
  };
}


function kidlearnV3_4aCountLessonsForSubject_(subjectCode, subjectName, data) {
  var target =
    String(subjectCode || subjectName || '')
      .toUpperCase();

  if (!target) return 0;

  var count = 0;

  for (var i = 0; i < data.lessons.rows.length; i++) {
    var row =
      data.lessons.rows[i];

    if (!kidlearnV3_4aIsActiveRow_(row)) {
      continue;
    }

    var value =
      String(
        kidlearnV3_4aGetAny_(
          row,
          [
            'subjectCode',
            'subjectId',
            'subjectName'
          ]
        ) || ''
      ).toUpperCase();

    if (
      value &&
      (
        value.indexOf(target) >= 0 ||
        target.indexOf(value) >= 0
      )
    ) {
      count++;
    }
  }

  return count;
}


/**
 * Today stats.
 */
function kidlearnV3_4aBuildTodayStats_(child, data) {
  var childId =
    child && child.childId
      ? String(child.childId)
      : '';

  var stars = 28;
  var streakDays = 5;

  var rewardSum = 0;

  for (var i = 0; i < data.rewardTransactions.rows.length; i++) {
    var row =
      data.rewardTransactions.rows[i];

    var rowChildId =
      String(
        kidlearnV3_4aGetAny_(
          row,
          [
            'childId',
            'studentId'
          ]
        ) || ''
      );

    if (childId && rowChildId && rowChildId !== childId) {
      continue;
    }

    var amount =
      Number(
        kidlearnV3_4aGetAny_(
          row,
          [
            'amount',
            'points',
            'stars',
            'rewardPoints'
          ]
        ) || 0
      );

    if (!isNaN(amount)) {
      rewardSum += amount;
    }
  }

  if (rewardSum > 0) {
    stars = rewardSum;
  }

  for (var s = 0; s < data.streaks.rows.length; s++) {
    var streakRow =
      data.streaks.rows[s];

    var streakChildId =
      String(
        kidlearnV3_4aGetAny_(
          streakRow,
          [
            'childId',
            'studentId'
          ]
        ) || ''
      );

    if (childId && streakChildId && streakChildId !== childId) {
      continue;
    }

    var count =
      Number(
        kidlearnV3_4aGetAny_(
          streakRow,
          [
            'currentStreak',
            'streakDays',
            'days'
          ]
        ) || ''
      );

    if (!isNaN(count) && count > 0) {
      streakDays = count;
      break;
    }
  }

  return {
    todayStars: stars,
    streakDays: streakDays,
    todayGoalText: 'Hoàn thành 2 bài học ngắn',
    nextLessonText: 'Toán học: Cộng trừ trong phạm vi 100'
  };
}


/**
 * Parent summary.
 */
function kidlearnV3_4aBuildParentSummary_(child, subjects, data) {
  var strongest = '';
  var weakest = '';
  var maxProgress = -1;
  var minProgress = 999;

  for (var i = 0; i < subjects.length; i++) {
    var progress =
      Number(subjects[i].progress || 0);

    if (progress > maxProgress) {
      maxProgress = progress;
      strongest = subjects[i].subjectName;
    }

    if (progress < minProgress) {
      minProgress = progress;
      weakest = subjects[i].subjectName;
    }
  }

  return {
    weekStudyDays: 5,
    totalMinutes: 85,
    strongSubject: strongest || 'Tiếng Việt',
    reviewSubject: weakest || 'Toán có lời văn',
    recommendation:
      'Tuần này nên ôn thêm các bài ngắn ở môn ' +
      (weakest || 'Toán') +
      '.'
  };
}


/**
 * Generic helpers.
 */
function kidlearnV3_4aGetAny_(obj, keys) {
  if (!obj) return '';

  for (var i = 0; i < keys.length; i++) {
    if (
      Object.prototype.hasOwnProperty.call(
        obj,
        keys[i]
      )
    ) {
      return obj[keys[i]];
    }
  }

  var lowerMap = {};

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      lowerMap[String(key).toLowerCase()] = key;
    }
  }

  for (var j = 0; j < keys.length; j++) {
    var lower =
      String(keys[j]).toLowerCase();

    if (lowerMap[lower]) {
      return obj[lowerMap[lower]];
    }
  }

  return '';
}


function kidlearnV3_4aFindRowById_(rows, idFields, idValue) {
  var target =
    String(idValue || '');

  if (!target) return null;

  for (var i = 0; i < rows.length; i++) {
    for (var f = 0; f < idFields.length; f++) {
      var value =
        String(
          kidlearnV3_4aGetAny_(
            rows[i],
            [idFields[f]]
          ) || ''
        );

      if (value === target) {
        return rows[i];
      }
    }
  }

  return null;
}


function kidlearnV3_4aIsActiveRow_(row) {
  var isActive =
    kidlearnV3_4aGetAny_(
      row,
      [
        'isActive',
        'active'
      ]
    );

  if (String(isActive).toUpperCase() === 'FALSE') {
    return false;
  }

  var status =
    String(
      kidlearnV3_4aGetAny_(
        row,
        [
          'status',
          'recordStatus'
        ]
      ) || ''
    ).toUpperCase();

  if (
    status === 'INACTIVE' ||
    status === 'DELETED' ||
    status === 'LOCKED' ||
    status === 'DISABLED'
  ) {
    return false;
  }

  return true;
}


function kidlearnV3_4aNormalizeLoginKey_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/-/g, '_');
}


function kidlearnV3_4aSaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PRODUCT_AUTH_4A1C_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PRODUCT_AUTH_4A1C_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase: result.phase,
      status: status,
      nextBundle:
        KIDLEARN_V3_PRODUCT_AUTH_4A1C_CONFIG.NEXT_BUNDLE,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      errors: result.errors || [],
      warnings: result.warnings || [],
      at: new Date().toISOString()
    })
  );
}


function kidlearnV3_4aReadJsonProperty_(key) {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(key);

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      raw: text
    };
  }
}


function kidlearnV3_4aRunLocalBatch_(suiteName, steps) {
  var results = [];
  var failed = 0;

  for (var i = 0; i < steps.length; i++) {
    var step = steps[i];

    try {
      var fn =
        eval(step.functionName);

      var output =
        fn();

      var ok =
        output && output.success === true;

      if (!ok) failed++;

      results.push({
        label: step.label,
        functionName: step.functionName,
        success: ok,
        output: output
      });

      if (!ok) break;

    } catch (error) {
      failed++;

      results.push({
        label: step.label,
        functionName: step.functionName,
        success: false,
        error:
          String(error.message || error)
      });

      break;
    }
  }

  var result = {
    success: failed === 0,
    suiteName: suiteName,
    phase: '4A-1C',
    stepCount: steps.length,
    failedStepCount: failed,
    results: results
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      suiteName +
      ' failed. failedStepCount=' +
      failed
    );
  }

  return result;
}