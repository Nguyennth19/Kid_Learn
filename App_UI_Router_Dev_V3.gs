/**
 * ================================================================
 * KIDLEARN V3 - UI ROUTER DEV
 * Step: 3I.7
 * Version: 3.1.0
 * ================================================================
 *
 * File này tạo router DEV cho các màn hình:
 * - HOME
 * - SUBJECTS
 * - CHILDREN
 * - ASSIGNMENTS
 *
 * KHÔNG sửa PROD.
 * KHÔNG ghi dữ liệu.
 * KHÔNG xóa dữ liệu.
 */


var KIDLEARN_V3_UI_ROUTER_SCREENS = {
  HOME: 'HOME',
  SUBJECTS: 'SUBJECTS',
  CHILDREN: 'CHILDREN',
  ASSIGNMENTS: 'ASSIGNMENTS'
};


/**
 * Preview UI Router DEV V3.
 */
function kidlearnV3_previewUiRouterDevV3() {
  var checks =
    kidlearnV3_uiRouterCheckDependencies_();

  var result = {
    success: checks.errorCount === 0,
    action: 'PREVIEW_UI_ROUTER_DEV_V3',
    errorCount: checks.errorCount,
    warningCount: checks.warningCount,
    errors: checks.errors,
    warnings: checks.warnings,
    mode: kidlearnV3_uiRouterSafeSwitchMode_(),
    navigation: kidlearnV3_uiRouterBuildNavigation_(),
    publicFunctions: [
      'kidlearnV3_uiRouterGetInitialStateV3',
      'kidlearnV3_uiRouterLoadScreenV3',
      'kidlearnV3_showUiRouterDevV3'
    ]
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Smoke test UI Router DEV V3.
 */
function kidlearnV3_smokeTestUiRouterDevV3() {
  var initial =
    kidlearnV3_uiRouterGetInitialStateV3({});

  var home =
    kidlearnV3_uiRouterLoadScreenV3({
      screen: 'HOME'
    });

  var subjects =
    kidlearnV3_uiRouterLoadScreenV3({
      screen: 'SUBJECTS'
    });

  var children =
    kidlearnV3_uiRouterLoadScreenV3({
      screen: 'CHILDREN'
    });

  var assignments =
    kidlearnV3_uiRouterLoadScreenV3({
      screen: 'ASSIGNMENTS'
    });

  var errors = [];
  var warnings = [];

  kidlearnV3_uiRouterAssertResponse_(
    initial,
    'INITIAL',
    errors
  );

  kidlearnV3_uiRouterAssertResponse_(
    home,
    'HOME',
    errors
  );

  kidlearnV3_uiRouterAssertResponse_(
    subjects,
    'SUBJECTS',
    errors
  );

  kidlearnV3_uiRouterAssertResponse_(
    children,
    'CHILDREN',
    errors
  );

  kidlearnV3_uiRouterAssertResponse_(
    assignments,
    'ASSIGNMENTS',
    errors
  );

  if (
    subjects.success &&
    subjects.data &&
    subjects.data.count < 4
  ) {
    errors.push(
      'SUBJECTS phải có ít nhất 4 môn học.'
    );
  }

  if (
    children.success &&
    children.data &&
    children.data.count < 1
  ) {
    errors.push(
      'CHILDREN phải có ít nhất 1 child.'
    );
  }

  if (
    assignments.success &&
    assignments.data &&
    assignments.data.count < 1
  ) {
    warnings.push(
      'ASSIGNMENTS đang trống hoặc chưa gắn với child hiện tại.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_UI_ROUTER_DEV_V3',
    mode: kidlearnV3_uiRouterSafeSwitchMode_(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    checks: {
      initial: initial.success,
      home: home.success,
      subjects: subjects.success,
      children: children.success,
      assignments: assignments.success
    },
    counts: {
      subjects:
        subjects.success && subjects.data
          ? subjects.data.count
          : 0,
      children:
        children.success && children.data
          ? children.data.count
          : 0,
      assignments:
        assignments.success && assignments.data
          ? assignments.data.count
          : 0
    }
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test UI Router DEV V3 chưa đạt. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Mở UI Router DEV trong modal.
 *
 * Chỉ mở qua menu Google Sheet.
 */
function kidlearnV3_showUiRouterDevV3() {
  var preview =
    kidlearnV3_previewUiRouterDevV3();

  if (!preview.success) {
    throw new Error(
      'UI Router DEV V3 chưa sẵn sàng. Errors: ' +
      preview.errorCount +
      '. Xem Execution log.'
    );
  }

  var html =
    HtmlService
      .createTemplateFromFile(
        'UI_Router_Dev_Shell_V3'
      )
      .evaluate()
      .setTitle(
        'KIDLEARN V3 - UI Router DEV'
      )
      .setWidth(1200)
      .setHeight(850);

  SpreadsheetApp
    .getUi()
    .showModalDialog(
      html,
      'KIDLEARN V3 - UI Router DEV'
    );
}


/**
 * Public API: lấy initial state cho UI Router.
 */
function kidlearnV3_uiRouterGetInitialStateV3(request) {
  var safeRequest =
    kidlearnV3_uiRouterNormalizeRequest_(
      request
    );

  var screen =
    kidlearnV3_uiRouterCanonicalScreen_(
      safeRequest.screen || 'HOME'
    );

  var loaded =
    kidlearnV3_uiRouterLoadScreenV3({
      screen: screen,
      childId: safeRequest.childId || '',
      userId: safeRequest.userId || '',
      limit: safeRequest.limit || 100
    });

  if (!loaded.success) {
    return loaded;
  }

  return {
    success: true,
    action: 'UI_ROUTER_INITIAL_STATE_V3',
    mode: kidlearnV3_uiRouterSafeSwitchMode_(),
    currentScreen: loaded.screen,
    navigation: kidlearnV3_uiRouterBuildNavigation_(),
    data: loaded.data,
    route: loaded.route
  };
}


/**
 * Public API: load payload theo màn hình.
 */
function kidlearnV3_uiRouterLoadScreenV3(request) {
  var safeRequest =
    kidlearnV3_uiRouterNormalizeRequest_(
      request
    );

  var screen =
    kidlearnV3_uiRouterCanonicalScreen_(
      safeRequest.screen
    );

  if (!screen) {
    return kidlearnV3_uiRouterFailure_(
      'UNKNOWN',
      'UNKNOWN_SCREEN',
      'Screen không được hỗ trợ: ' +
      String(safeRequest.screen || '')
    );
  }

  var checks =
    kidlearnV3_uiRouterCheckDependencies_();

  if (checks.errorCount > 0) {
    return kidlearnV3_uiRouterFailure_(
      screen,
      'ROUTER_NOT_READY',
      checks.errors.join(' | ')
    );
  }

  var screenResponse =
    kidlearnV3_uiGetScreenPayloadV3({
      screen: screen,
      childId: safeRequest.childId || '',
      userId: safeRequest.userId || '',
      limit: safeRequest.limit || 100
    });

  if (!screenResponse.success) {
    return kidlearnV3_uiRouterFromScreenError_(
      screen,
      screenResponse
    );
  }

  return kidlearnV3_uiRouterSuccess_(
    screen,
    screenResponse.data,
    safeRequest
  );
}


/**
 * Canonical screen name.
 */
function kidlearnV3_uiRouterCanonicalScreen_(
  screen
) {
  var value =
    String(screen || 'HOME')
      .trim()
      .toUpperCase();

  if (
    value === '' ||
    value === 'INDEX' ||
    value === 'MAIN'
  ) {
    return KIDLEARN_V3_UI_ROUTER_SCREENS.HOME;
  }

  if (
    value === KIDLEARN_V3_UI_ROUTER_SCREENS.HOME ||
    value === 'DASHBOARD'
  ) {
    return KIDLEARN_V3_UI_ROUTER_SCREENS.HOME;
  }

  if (
    value === KIDLEARN_V3_UI_ROUTER_SCREENS.SUBJECTS ||
    value === 'SUBJECT'
  ) {
    return KIDLEARN_V3_UI_ROUTER_SCREENS.SUBJECTS;
  }

  if (
    value === KIDLEARN_V3_UI_ROUTER_SCREENS.CHILDREN ||
    value === 'CHILD' ||
    value === 'KIDS'
  ) {
    return KIDLEARN_V3_UI_ROUTER_SCREENS.CHILDREN;
  }

  if (
    value === KIDLEARN_V3_UI_ROUTER_SCREENS.ASSIGNMENTS ||
    value === 'TASKS' ||
    value === 'TASK'
  ) {
    return KIDLEARN_V3_UI_ROUTER_SCREENS.ASSIGNMENTS;
  }

  return '';
}


/**
 * Navigation config cho UI.
 */
function kidlearnV3_uiRouterBuildNavigation_() {
  return [
    {
      screen: 'HOME',
      title: 'Home',
      icon: '🏠',
      description: 'Tổng quan học tập'
    },
    {
      screen: 'SUBJECTS',
      title: 'Subjects',
      icon: '📚',
      description: 'Danh sách môn học'
    },
    {
      screen: 'CHILDREN',
      title: 'Children',
      icon: '👧',
      description: 'Danh sách trẻ em'
    },
    {
      screen: 'ASSIGNMENTS',
      title: 'Assignments',
      icon: '📝',
      description: 'Nhiệm vụ học tập'
    }
  ];
}


/**
 * Metadata theo screen.
 */
function kidlearnV3_uiRouterGetRouteMeta_(
  screen
) {
  var navigation =
    kidlearnV3_uiRouterBuildNavigation_();

  for (
    var i = 0;
    i < navigation.length;
    i++
  ) {
    if (navigation[i].screen === screen) {
      return navigation[i];
    }
  }

  return {
    screen: screen,
    title: screen,
    icon: '',
    description: ''
  };
}


/**
 * Response success.
 */
function kidlearnV3_uiRouterSuccess_(
  screen,
  data,
  request
) {
  return {
    success: true,
    action: 'UI_ROUTER_LOAD_SCREEN_V3',
    mode: kidlearnV3_uiRouterSafeSwitchMode_(),
    screen: screen,
    route: kidlearnV3_uiRouterGetRouteMeta_(screen),
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    appVersion: KIDLEARN_V3.APP_VERSION,
    request: {
      childId: request.childId || '',
      userId: request.userId || '',
      limit: request.limit || 100
    },
    data: data || {}
  };
}


/**
 * Response failure.
 */
function kidlearnV3_uiRouterFailure_(
  screen,
  code,
  message
) {
  return {
    success: false,
    action: 'UI_ROUTER_LOAD_SCREEN_V3',
    mode: kidlearnV3_uiRouterSafeSwitchMode_(),
    screen: screen,
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    error: {
      code: code,
      message: message
    }
  };
}


/**
 * Convert screen mapper error.
 */
function kidlearnV3_uiRouterFromScreenError_(
  screen,
  response
) {
  var code =
    response &&
    response.error &&
    response.error.code
      ? response.error.code
      : 'SCREEN_MAPPER_ERROR';

  var message =
    response &&
    response.error &&
    response.error.message
      ? response.error.message
      : 'Screen Mapper trả về lỗi.';

  return kidlearnV3_uiRouterFailure_(
    screen,
    code,
    message
  );
}


/**
 * Normalize request.
 */
function kidlearnV3_uiRouterNormalizeRequest_(
  request
) {
  if (!request) {
    return {};
  }

  if (
    typeof request !== 'object'
  ) {
    return {
      screen: String(request || '')
    };
  }

  return request;
}


/**
 * Check dependencies.
 */
function kidlearnV3_uiRouterCheckDependencies_() {
  var errors = [];
  var warnings = [];

  kidlearnV3_uiRouterRequireFunction_(
    'kidlearnV3_uiGetScreenPayloadV3',
    errors
  );

  kidlearnV3_uiRouterRequireFunction_(
    'kidlearnV3_uiGetHomePayloadV3',
    errors
  );

  kidlearnV3_uiRouterRequireFunction_(
    'kidlearnV3_uiGetSubjectsPayloadV3',
    errors
  );

  kidlearnV3_uiRouterRequireFunction_(
    'kidlearnV3_uiGetChildrenPayloadV3',
    errors
  );

  kidlearnV3_uiRouterRequireFunction_(
    'kidlearnV3_uiGetAssignmentsPayloadV3',
    errors
  );

  kidlearnV3_uiRouterRequireFunction_(
    'kidlearnV3_uiSwitchGetModeV3',
    errors
  );

  var mode =
    kidlearnV3_uiRouterSafeSwitchMode_();

  if (mode !== 'V3') {
    errors.push(
      'DEV_SWITCH chưa bật V3. Mode hiện tại: ' +
      mode
    );
  }

  return {
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Require function.
 */
function kidlearnV3_uiRouterRequireFunction_(
  functionName,
  errors
) {
  var exists = false;

  try {
    exists =
      eval(
        'typeof ' +
        functionName +
        ' === "function"'
      );
  } catch (error) {
    exists = false;
  }

  if (!exists) {
    errors.push(
      'Thiếu function: ' +
      functionName
    );
  }
}


/**
 * Safe get switch mode.
 */
function kidlearnV3_uiRouterSafeSwitchMode_() {
  try {
    return kidlearnV3_uiSwitchGetModeV3();
  } catch (error) {
    return 'UNKNOWN';
  }
}


/**
 * Assert response cho smoke test.
 */
function kidlearnV3_uiRouterAssertResponse_(
  response,
  label,
  errors
) {
  if (!response) {
    errors.push(
      label + ': response trống.'
    );

    return;
  }

  if (response.success !== true) {
    var message =
      response.error && response.error.message
        ? response.error.message
        : 'Không rõ lỗi.';

    errors.push(
      label + ': ' + message
    );
  }
}