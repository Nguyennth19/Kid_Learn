/**
 * ================================================================
 * KIDLEARN V3 - UI SCREEN MAPPER
 * Step: 3I.6
 * Version: 3.1.0
 * ================================================================
 *
 * File này map payload V3 thành format dễ dùng cho UI cũ DEV.
 *
 * KHÔNG sửa PROD.
 * KHÔNG ghi dữ liệu.
 * KHÔNG xóa dữ liệu.
 * KHÔNG migration dữ liệu.
 */


var KIDLEARN_V3_SCREEN_KEYS = {
  HOME: 'HOME',
  DASHBOARD: 'DASHBOARD',
  SUBJECTS: 'SUBJECTS',
  CHILDREN: 'CHILDREN',
  ASSIGNMENTS: 'ASSIGNMENTS',
  CONFIG: 'CONFIG'
};


/**
 * Preview UI Screen Mapper V3.
 */
function kidlearnV3_previewUiScreenMapperV3() {
  var checks =
    kidlearnV3_uiScreenCheckDependencies_();

  var result = {
    success: checks.errorCount === 0,
    action: 'PREVIEW_UI_SCREEN_MAPPER_V3',
    errorCount: checks.errorCount,
    warningCount: checks.warningCount,
    errors: checks.errors,
    warnings: checks.warnings,
    availableScreens: [
      KIDLEARN_V3_SCREEN_KEYS.HOME,
      KIDLEARN_V3_SCREEN_KEYS.DASHBOARD,
      KIDLEARN_V3_SCREEN_KEYS.SUBJECTS,
      KIDLEARN_V3_SCREEN_KEYS.CHILDREN,
      KIDLEARN_V3_SCREEN_KEYS.ASSIGNMENTS,
      KIDLEARN_V3_SCREEN_KEYS.CONFIG
    ],
    publicFunctions: [
      'kidlearnV3_uiGetScreenPayloadV3',
      'kidlearnV3_uiGetHomePayloadV3',
      'kidlearnV3_uiGetDashboardPayloadV3',
      'kidlearnV3_uiGetSubjectsPayloadV3',
      'kidlearnV3_uiGetChildrenPayloadV3',
      'kidlearnV3_uiGetAssignmentsPayloadV3'
    ]
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Smoke test UI Screen Mapper V3.
 */
function kidlearnV3_smokeTestUiScreenMapperV3() {
  var home =
    kidlearnV3_uiGetHomePayloadV3({});

  var dashboard =
    kidlearnV3_uiGetDashboardPayloadV3({});

  var subjects =
    kidlearnV3_uiGetSubjectsPayloadV3({});

  var children =
    kidlearnV3_uiGetChildrenPayloadV3({});

  var assignments =
    kidlearnV3_uiGetAssignmentsPayloadV3({});

  var errors = [];
  var warnings = [];

  kidlearnV3_uiScreenAssertResponse_(
    home,
    'HOME',
    errors
  );

  kidlearnV3_uiScreenAssertResponse_(
    dashboard,
    'DASHBOARD',
    errors
  );

  kidlearnV3_uiScreenAssertResponse_(
    subjects,
    'SUBJECTS',
    errors
  );

  kidlearnV3_uiScreenAssertResponse_(
    children,
    'CHILDREN',
    errors
  );

  kidlearnV3_uiScreenAssertResponse_(
    assignments,
    'ASSIGNMENTS',
    errors
  );

  if (
    subjects.success &&
    subjects.data.count < 4
  ) {
    errors.push(
      'SUBJECTS phải có ít nhất 4 môn học.'
    );
  }

  if (
    children.success &&
    children.data.count < 1
  ) {
    errors.push(
      'CHILDREN phải có ít nhất 1 child.'
    );
  }

  if (
    assignments.success &&
    assignments.data.count < 1
  ) {
    warnings.push(
      'ASSIGNMENTS đang trống hoặc chưa gắn với child hiện tại.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_UI_SCREEN_MAPPER_V3',
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    counts: {
      subjects:
        subjects.success
          ? subjects.data.count
          : 0,
      children:
        children.success
          ? children.data.count
          : 0,
      assignments:
        assignments.success
          ? assignments.data.count
          : 0
    }
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test UI Screen Mapper V3 chưa đạt. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Public API chính cho UI cũ DEV.
 *
 * UI gọi:
 * kidlearnV3_uiGetScreenPayloadV3({
 *   screen: 'HOME',
 *   childId: '',
 *   userId: ''
 * })
 */
function kidlearnV3_uiGetScreenPayloadV3(request) {
  var safeRequest =
    kidlearnV3_uiScreenNormalizeRequest_(
      request
    );

  var screen =
    String(safeRequest.screen || '')
      .trim()
      .toUpperCase();

  if (
    screen === '' ||
    screen === KIDLEARN_V3_SCREEN_KEYS.HOME
  ) {
    return kidlearnV3_uiGetHomePayloadV3(
      safeRequest
    );
  }

  if (
    screen === KIDLEARN_V3_SCREEN_KEYS.DASHBOARD
  ) {
    return kidlearnV3_uiGetDashboardPayloadV3(
      safeRequest
    );
  }

  if (
    screen === KIDLEARN_V3_SCREEN_KEYS.SUBJECTS
  ) {
    return kidlearnV3_uiGetSubjectsPayloadV3(
      safeRequest
    );
  }

  if (
    screen === KIDLEARN_V3_SCREEN_KEYS.CHILDREN
  ) {
    return kidlearnV3_uiGetChildrenPayloadV3(
      safeRequest
    );
  }

  if (
    screen === KIDLEARN_V3_SCREEN_KEYS.ASSIGNMENTS
  ) {
    return kidlearnV3_uiGetAssignmentsPayloadV3(
      safeRequest
    );
  }

  if (
    screen === KIDLEARN_V3_SCREEN_KEYS.CONFIG
  ) {
    return kidlearnV3_uiGetConfigPayloadV3(
      safeRequest
    );
  }

  return kidlearnV3_uiScreenFailure_(
    screen,
    'UNKNOWN_SCREEN',
    'Screen không được hỗ trợ: ' + screen
  );
}


/**
 * Home payload cho UI cũ.
 */
function kidlearnV3_uiGetHomePayloadV3(request) {
  var response =
    kidlearnV3_uiApiDispatchV3({
      action: 'BOOTSTRAP',
      payload: request || {}
    });

  if (!response.success) {
    return kidlearnV3_uiScreenFromServiceError_(
      'HOME',
      response
    );
  }

  var data =
    response.data || {};

  var mapped =
    kidlearnV3_uiScreenMapHome_(
      data
    );

  return kidlearnV3_uiScreenSuccess_(
    'HOME',
    mapped
  );
}


/**
 * Dashboard payload cho UI cũ.
 */
function kidlearnV3_uiGetDashboardPayloadV3(request) {
  var safeRequest =
    kidlearnV3_uiScreenNormalizeRequest_(
      request
    );

  var response =
    kidlearnV3_uiApiDispatchV3({
      action: 'DASHBOARD',
      payload: {
        childId: safeRequest.childId || ''
      }
    });

  if (!response.success) {
    return kidlearnV3_uiScreenFromServiceError_(
      'DASHBOARD',
      response
    );
  }

  var mapped =
    kidlearnV3_uiScreenMapDashboard_(
      response.data || {}
    );

  return kidlearnV3_uiScreenSuccess_(
    'DASHBOARD',
    mapped
  );
}


/**
 * Subjects payload cho UI cũ.
 */
function kidlearnV3_uiGetSubjectsPayloadV3(request) {
  var response =
    kidlearnV3_uiApiDispatchV3({
      action: 'SUBJECTS',
      payload: {}
    });

  if (!response.success) {
    return kidlearnV3_uiScreenFromServiceError_(
      'SUBJECTS',
      response
    );
  }

  var mapped =
    kidlearnV3_uiScreenMapSubjects_(
      response.data || {}
    );

  return kidlearnV3_uiScreenSuccess_(
    'SUBJECTS',
    mapped
  );
}


/**
 * Children payload cho UI cũ.
 */
function kidlearnV3_uiGetChildrenPayloadV3(request) {
  var safeRequest =
    kidlearnV3_uiScreenNormalizeRequest_(
      request
    );

  var response =
    kidlearnV3_uiApiDispatchV3({
      action: 'CHILDREN',
      payload: {
        userId: safeRequest.userId || ''
      }
    });

  if (!response.success) {
    return kidlearnV3_uiScreenFromServiceError_(
      'CHILDREN',
      response
    );
  }

  var mapped =
    kidlearnV3_uiScreenMapChildren_(
      response.data || {}
    );

  return kidlearnV3_uiScreenSuccess_(
    'CHILDREN',
    mapped
  );
}


/**
 * Assignments payload cho UI cũ.
 */
function kidlearnV3_uiGetAssignmentsPayloadV3(request) {
  var safeRequest =
    kidlearnV3_uiScreenNormalizeRequest_(
      request
    );

  var response =
    kidlearnV3_uiApiDispatchV3({
      action: 'ASSIGNMENTS',
      payload: {
        childId: safeRequest.childId || '',
        limit: safeRequest.limit || 100
      }
    });

  if (!response.success) {
    return kidlearnV3_uiScreenFromServiceError_(
      'ASSIGNMENTS',
      response
    );
  }

  var mapped =
    kidlearnV3_uiScreenMapAssignments_(
      response.data || {}
    );

  return kidlearnV3_uiScreenSuccess_(
    'ASSIGNMENTS',
    mapped
  );
}


/**
 * Config payload cho UI cũ.
 */
function kidlearnV3_uiGetConfigPayloadV3(request) {
  var response =
    kidlearnV3_uiApiDispatchV3({
      action: 'CONFIG',
      payload: {}
    });

  if (!response.success) {
    return kidlearnV3_uiScreenFromServiceError_(
      'CONFIG',
      response
    );
  }

  var mapped = {
    count:
      response.data.count || 0,
    config:
      response.data.config || {}
  };

  return kidlearnV3_uiScreenSuccess_(
    'CONFIG',
    mapped
  );
}


/**
 * Map Home.
 */
function kidlearnV3_uiScreenMapHome_(
  data
) {
  var selectedChild =
    data.selectedChild || null;

  var dashboard =
    data.dashboard || {};

  return {
    app: {
      databaseMode:
        data.databaseMode || 'V3',
      schemaVersion:
        data.schemaVersion || '',
      appVersion:
        data.appVersion || ''
    },

    counts:
      data.counts || {},

    currentChild:
      kidlearnV3_uiScreenMapChildItem_(
        selectedChild
      ),

    dashboard: {
      subjectCount:
        dashboard.subjectCount || 0,
      assignmentCount:
        dashboard.assignmentCount || 0,
      activeAssignmentCount:
        dashboard.activeAssignmentCount || 0,
      completedAssignmentCount:
        dashboard.completedAssignmentCount || 0,
      overdueAssignmentCount:
        dashboard.overdueAssignmentCount || 0,
      completionPercent:
        dashboard.completionPercent || 0
    },

    subjects:
      kidlearnV3_uiScreenMapSubjectList_(
        data.subjects || []
      ),

    children:
      kidlearnV3_uiScreenMapChildList_(
        data.children || []
      ),

    assignments:
      kidlearnV3_uiScreenMapAssignmentList_(
        data.assignments || []
      ),

    config:
      data.config || {}
  };
}


/**
 * Map Dashboard.
 */
function kidlearnV3_uiScreenMapDashboard_(
  data
) {
  return {
    child:
      kidlearnV3_uiScreenMapChildItem_(
        data.selectedChild || null
      ),

    dashboard:
      data.dashboard || {},

    subjects:
      kidlearnV3_uiScreenMapSubjectList_(
        data.subjects || []
      ),

    assignments:
      kidlearnV3_uiScreenMapAssignmentList_(
        data.assignments || []
      )
  };
}


/**
 * Map Subjects.
 */
function kidlearnV3_uiScreenMapSubjects_(
  data
) {
  return {
    count:
      data.count || 0,
    rows:
      kidlearnV3_uiScreenMapSubjectList_(
        data.rows || []
      )
  };
}


/**
 * Map Children.
 */
function kidlearnV3_uiScreenMapChildren_(
  data
) {
  return {
    count:
      data.count || 0,
    rows:
      kidlearnV3_uiScreenMapChildList_(
        data.rows || []
      )
  };
}


/**
 * Map Assignments.
 */
function kidlearnV3_uiScreenMapAssignments_(
  data
) {
  return {
    childId:
      data.childId || '',
    count:
      data.count || 0,
    rows:
      kidlearnV3_uiScreenMapAssignmentList_(
        data.rows || []
      )
  };
}


/**
 * Map subject list.
 */
function kidlearnV3_uiScreenMapSubjectList_(
  rows
) {
  var result = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    result.push(
      kidlearnV3_uiScreenMapSubjectItem_(
        rows[i]
      )
    );
  }

  return result;
}


/**
 * Map subject item.
 */
function kidlearnV3_uiScreenMapSubjectItem_(
  row
) {
  if (!row) {
    return null;
  }

  return {
    id:
      row.subjectId || '',
    code:
      row.subjectCode || '',
    name:
      row.subjectName || '',
    title:
      row.subjectName || '',
    description:
      row.description || '',
    icon:
      row.icon || '',
    theme:
      row.themeKey || '',
    color:
      row.primaryColor || '',
    accentColor:
      row.accentColor || '',
    sortOrder:
      Number(row.sortOrder || 999),
    status:
      row.status || ''
  };
}


/**
 * Map child list.
 */
function kidlearnV3_uiScreenMapChildList_(
  rows
) {
  var result = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    result.push(
      kidlearnV3_uiScreenMapChildItem_(
        rows[i]
      )
    );
  }

  return result;
}


/**
 * Map child item.
 */
function kidlearnV3_uiScreenMapChildItem_(
  row
) {
  if (!row) {
    return null;
  }

  return {
    id:
      row.childId || '',
    childId:
      row.childId || '',
    name:
      row.displayName ||
      row.childName ||
      '',
    title:
      row.displayName ||
      row.childName ||
      '',
    displayName:
      row.displayName || '',
    nickname:
      row.nickname || '',
    gradeLevel:
      Number(row.gradeLevel || 2),
    status:
      row.status || ''
  };
}


/**
 * Map assignment list.
 */
function kidlearnV3_uiScreenMapAssignmentList_(
  rows
) {
  var result = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    result.push(
      kidlearnV3_uiScreenMapAssignmentItem_(
        rows[i]
      )
    );
  }

  return result;
}


/**
 * Map assignment item.
 */
function kidlearnV3_uiScreenMapAssignmentItem_(
  row
) {
  if (!row) {
    return null;
  }

  return {
    id:
      row.assignmentId || '',
    assignmentId:
      row.assignmentId || '',
    childId:
      row.childId || '',
    type:
      row.assignmentType || '',
    title:
      row.title || '',
    description:
      row.description || '',
    status:
      row.status || '',
    priority:
      row.priority || '',
    progress:
      Number(row.progressPercent || 0),
    progressPercent:
      Number(row.progressPercent || 0),
    required:
      row.isRequired === true,
    isRequired:
      row.isRequired === true,
    assignedAt:
      row.assignedAt || '',
    dueAt:
      row.dueAt || '',
    updatedAt:
      row.updatedAt || ''
  };
}


/**
 * Response success cho UI screen.
 */
function kidlearnV3_uiScreenSuccess_(
  screen,
  data
) {
  return {
    success: true,
    screen: screen,
    databaseMode: 'V3',
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    appVersion: KIDLEARN_V3.APP_VERSION,
    data: data
  };
}


/**
 * Response failure.
 */
function kidlearnV3_uiScreenFailure_(
  screen,
  code,
  message
) {
  return {
    success: false,
    screen: screen,
    databaseMode: 'V3',
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    error: {
      code: code,
      message: message
    }
  };
}


/**
 * Convert service error sang screen error.
 */
function kidlearnV3_uiScreenFromServiceError_(
  screen,
  response
) {
  var message =
    response &&
    response.error &&
    response.error.message
      ? response.error.message
      : 'Service trả về lỗi.';

  var code =
    response &&
    response.error &&
    response.error.code
      ? response.error.code
      : 'SERVICE_ERROR';

  return kidlearnV3_uiScreenFailure_(
    screen,
    code,
    message
  );
}


/**
 * Normalize request.
 */
function kidlearnV3_uiScreenNormalizeRequest_(
  request
) {
  if (!request) {
    return {};
  }

  if (
    typeof request !== 'object'
  ) {
    return {
      value: request
    };
  }

  return request;
}


/**
 * Kiểm tra dependency.
 */
function kidlearnV3_uiScreenCheckDependencies_() {
  var errors = [];
  var warnings = [];

  kidlearnV3_uiScreenRequireFunction_(
    'kidlearnV3_uiApiDispatchV3',
    errors
  );

  kidlearnV3_uiScreenRequireFunction_(
    'kidlearnV3_serviceGetBootstrapV3',
    errors
  );

  kidlearnV3_uiScreenRequireFunction_(
    'kidlearnV3_serviceGetDashboardV3',
    errors
  );

  kidlearnV3_uiScreenRequireFunction_(
    'kidlearnV3_serviceGetSubjectsV3',
    errors
  );

  var mode =
    '';

  try {
    mode =
      kidlearnV3_uiSwitchGetModeV3();
  } catch (error) {
    errors.push(
      'Không đọc được DEV_SWITCH mode: ' +
      String(error.message || error)
    );
  }

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
function kidlearnV3_uiScreenRequireFunction_(
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
 * Check response cho smoke test.
 */
function kidlearnV3_uiScreenAssertResponse_(
  response,
  screen,
  errors
) {
  if (!response) {
    errors.push(
      screen + ': response trống.'
    );
    return;
  }

  if (!response.success) {
    var message =
      response.error && response.error.message
        ? response.error.message
        : 'Không rõ lỗi.';

    errors.push(
      screen + ': ' + message
    );
  }
}