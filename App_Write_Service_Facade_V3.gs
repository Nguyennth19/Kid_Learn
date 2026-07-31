/**
 * ================================================================
 * KIDLEARN V3 - WRITE SERVICE FACADE
 * Step: 3J.2
 * Version: 3.1.0
 * ================================================================
 *
 * File này tạo lớp service trung gian cho UI DEV gửi request ghi.
 *
 * UI DEV KHÔNG gọi trực tiếp Safe Write Layer.
 * UI DEV gọi Write Service Facade.
 *
 * Mặc định vẫn DRY_RUN.
 *
 * KHÔNG sửa PROD.
 * KHÔNG bật ghi thật ở bước 3J.2.
 */


var KIDLEARN_V3_WRITE_SERVICE_CONFIG = {
  VERSION: '3J.2',
  RESPONSE_VERSION: '1.0',
  DEFAULT_DRY_RUN: true,
  CONFIRM_WRITE_TOKEN: 'CONFIRM_WRITE_V3'
};


var KIDLEARN_V3_WRITE_SERVICE_ACTIONS = {
  STATUS: 'STATUS',
  SAMPLE_CONTEXT: 'SAMPLE_CONTEXT',
  DRY_RUN: 'DRY_RUN',
  SUBMIT: 'SUBMIT',
  AUDIT_LOG: 'AUDIT_LOG',
  START_STUDY_SESSION: 'START_STUDY_SESSION',
  FINISH_STUDY_SESSION: 'FINISH_STUDY_SESSION',
  UPSERT_LESSON_PROGRESS: 'UPSERT_LESSON_PROGRESS',
  UPDATE_ASSIGNMENT_STATUS: 'UPDATE_ASSIGNMENT_STATUS',
  UPSERT_DAILY_GOAL: 'UPSERT_DAILY_GOAL'
};


/**
 * Preview Write Service Facade V3.
 */
function kidlearnV3_previewWriteServiceFacadeV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions = [
    'kidlearnV3_getSafeWriteLayerStatusV3',
    'kidlearnV3_previewSafeWriteLayerV3',
    'kidlearnV3_safeWriteV3',
    'kidlearnV3_safeWriteDryRunV3',
    'kidlearnV3_assertPhase3IClosedFor3JV3',
    'kidlearnV3_getAppDevConnectionV3Status',
    'kidlearnV3_serviceGetBootstrapV3'
  ];

  var functionChecks =
    kidlearnV3_writeServiceCheckFunctions_(
      requiredFunctions
    );

  errors =
    errors.concat(
      functionChecks.errors
    );

  var phase3I =
    kidlearnV3_writeServiceSafePhase3IAssert_();

  if (!phase3I.success) {
    errors.push(
      'Phase 3I chưa đóng đúng điều kiện cho 3J: ' +
      phase3I.message
    );
  }

  var connection =
    kidlearnV3_writeServiceSafeConnection_();

  if (
    connection.databaseMode !== 'V3' ||
    connection.connectionStatus !== 'CONNECTED'
  ) {
    errors.push(
      'App DEV chưa CONNECTED với Database V3.'
    );
  }

  var safeWriteStatus =
    kidlearnV3_writeServiceSafeLayerStatus_();

  if (
    safeWriteStatus.mode !== 'DRY_RUN' &&
    safeWriteStatus.mode !== 'ENABLED'
  ) {
    errors.push(
      'Safe Write Layer chưa ở DRY_RUN/ENABLED. Mode hiện tại: ' +
      safeWriteStatus.mode
    );
  }

  var safeWritePreview = {
    success: false,
    skipped: true
  };

  if (errors.length === 0) {
    try {
      safeWritePreview =
        kidlearnV3_previewSafeWriteLayerV3();

      if (!safeWritePreview.success) {
        errors.push(
          'Safe Write Layer preview chưa đạt. Errors: ' +
          safeWritePreview.errorCount
        );
      }

    } catch (error) {
      errors.push(
        'Không chạy được kidlearnV3_previewSafeWriteLayerV3: ' +
        String(error.message || error)
      );
    }
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_WRITE_SERVICE_FACADE_V3',
    phase: '3J.2',
    serviceVersion:
      KIDLEARN_V3_WRITE_SERVICE_CONFIG.VERSION,
    responseVersion:
      KIDLEARN_V3_WRITE_SERVICE_CONFIG.RESPONSE_VERSION,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3I: phase3I,
    connection: connection,
    safeWriteStatus: safeWriteStatus,
    safeWritePreview: {
      success:
        safeWritePreview.success === true,
      skipped:
        safeWritePreview.skipped === true ? true : false
    },
    functionChecks:
      functionChecks.items,
    allowedActions:
      kidlearnV3_writeServiceGetAllowedActions_(),
    allowedOperations:
      kidlearnV3_writeServiceGetAllowedOperations_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Smoke test Write Service Facade V3.
 *
 * Chỉ DRY_RUN.
 * Không ghi thật.
 */
function kidlearnV3_smokeTestWriteServiceFacadeV3() {
  var status =
    kidlearnV3_writeServiceGetStatusV3({});

  var sample =
    kidlearnV3_writeServiceGetSampleContextV3({});

  var context =
    sample.success && sample.data
      ? sample.data.sampleContext || {}
      : {};

  var tests = [];

  tests.push(
    kidlearnV3_writeServiceAuditLogV3({
      payload: {
        eventType: 'WRITE_SERVICE_SMOKE_TEST',
        message: 'Dry-run audit test from Write Service Facade 3J.2',
        entityType: 'PHASE',
        entityId: '3J.2'
      },
      dryRun: true
    })
  );

  tests.push(
    kidlearnV3_writeServiceStartStudySessionV3({
      payload: {
        childId: context.childId || 'DRY_RUN_CHILD_ID',
        subjectId: context.subjectId || '',
        lessonId: context.lessonId || 'DRY_RUN_LESSON_ID'
      },
      dryRun: true
    })
  );

  tests.push(
    kidlearnV3_writeServiceUpsertLessonProgressV3({
      payload: {
        childId: context.childId || 'DRY_RUN_CHILD_ID',
        subjectId: context.subjectId || '',
        lessonId: context.lessonId || 'DRY_RUN_LESSON_ID',
        status: 'IN_PROGRESS',
        progressPercent: 15
      },
      dryRun: true
    })
  );

  tests.push(
    kidlearnV3_writeServiceUpsertDailyGoalV3({
      payload: {
        childId: context.childId || 'DRY_RUN_CHILD_ID',
        goalDate: kidlearnV3_writeServiceToday_(),
        targetMinutes: 20,
        status: 'ACTIVE'
      },
      dryRun: true
    })
  );

  if (context.assignmentId) {
    tests.push(
      kidlearnV3_writeServiceUpdateAssignmentStatusV3({
        payload: {
          assignmentId: context.assignmentId,
          status: 'IN_PROGRESS',
          progressPercent: 5
        },
        dryRun: true
      })
    );
  }

  var errors = [];
  var warnings = [];

  if (!status.success) {
    errors.push(
      'Write Service status thất bại.'
    );
  }

  if (!sample.success) {
    errors.push(
      'Write Service sample context thất bại.'
    );
  }

  for (var i = 0; i < tests.length; i++) {
    if (tests[i].success !== true) {
      errors.push(
        'Write Service dry-run test #' +
        (i + 1) +
        ' failed: ' +
        kidlearnV3_writeServiceGetErrorMessage_(
          tests[i]
        )
      );
    }
  }

  if (!context.assignmentId) {
    warnings.push(
      'Không có assignmentId mẫu nên bỏ qua dry-run UPDATE_ASSIGNMENT_STATUS.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_WRITE_SERVICE_FACADE_V3',
    phase: '3J.2',
    dryRunOnly: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    status: {
      success: status.success,
      mode:
        status.success && status.data
          ? status.data.safeWriteStatus.mode
          : ''
    },
    sampleContext: context,
    testCount: tests.length,
    tests: tests
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test Write Service Facade V3 chưa đạt. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Mở UI test Write Service Facade.
 *
 * Chỉ mở qua menu Google Sheet.
 */
function kidlearnV3_showWriteServiceTestUiV3() {
  var preview =
    kidlearnV3_previewWriteServiceFacadeV3();

  if (!preview.success) {
    throw new Error(
      'Write Service Facade V3 chưa sẵn sàng. Errors: ' +
      preview.errorCount +
      '. Xem Execution log.'
    );
  }

  var html =
    HtmlService
      .createTemplateFromFile(
        'UI_Write_Service_Test_V3'
      )
      .evaluate()
      .setTitle(
        'KIDLEARN V3 - Write Service Test'
      )
      .setWidth(1200)
      .setHeight(850);

  SpreadsheetApp
    .getUi()
    .showModalDialog(
      html,
      'KIDLEARN V3 - Write Service Test'
    );
}


/**
 * UI gọi để lấy trạng thái Write Service.
 */
function kidlearnV3_writeServiceGetStatusV3(request) {
  return kidlearnV3_writeServiceInvoke_(
    'WRITE_SERVICE_GET_STATUS_V3',
    function() {
      return {
        serviceVersion:
          KIDLEARN_V3_WRITE_SERVICE_CONFIG.VERSION,
        responseVersion:
          KIDLEARN_V3_WRITE_SERVICE_CONFIG.RESPONSE_VERSION,
        defaultDryRun:
          KIDLEARN_V3_WRITE_SERVICE_CONFIG.DEFAULT_DRY_RUN,
        safeWriteStatus:
          kidlearnV3_getSafeWriteLayerStatusV3(),
        allowedActions:
          kidlearnV3_writeServiceGetAllowedActions_(),
        allowedOperations:
          kidlearnV3_writeServiceGetAllowedOperations_()
      };
    },
    request
  );
}


/**
 * UI gọi để lấy sample context.
 */
function kidlearnV3_writeServiceGetSampleContextV3(request) {
  return kidlearnV3_writeServiceInvoke_(
    'WRITE_SERVICE_GET_SAMPLE_CONTEXT_V3',
    function() {
      return {
        sampleContext:
          kidlearnV3_writeServiceGetSampleContext_()
      };
    },
    request
  );
}


/**
 * Dispatcher public cho UI DEV.
 *
 * Request mẫu:
 * {
 *   action: 'AUDIT_LOG',
 *   payload: {...},
 *   dryRun: true
 * }
 */
function kidlearnV3_writeServiceDispatchV3(request) {
  var safeRequest =
    kidlearnV3_writeServiceNormalizeRequest_(
      request
    );

  var action =
    String(safeRequest.action || '')
      .trim()
      .toUpperCase();

  if (action === 'STATUS') {
    return kidlearnV3_writeServiceGetStatusV3(
      safeRequest
    );
  }

  if (action === 'SAMPLE_CONTEXT') {
    return kidlearnV3_writeServiceGetSampleContextV3(
      safeRequest
    );
  }

  if (action === 'DRY_RUN') {
    return kidlearnV3_writeServiceDryRunV3(
      safeRequest
    );
  }

  if (action === 'SUBMIT') {
    return kidlearnV3_writeServiceSubmitV3(
      safeRequest
    );
  }

  if (
    kidlearnV3_writeServiceIsAllowedOperation_(
      action
    )
  ) {
    return kidlearnV3_writeServiceRunNamedOperation_(
      action,
      safeRequest,
      true
    );
  }

  return kidlearnV3_writeServiceFailureDirect_(
    'WRITE_SERVICE_DISPATCH_V3',
    'UNKNOWN_WRITE_SERVICE_ACTION',
    'Action không được hỗ trợ: ' + action
  );
}


/**
 * Generic DRY_RUN.
 */
function kidlearnV3_writeServiceDryRunV3(request) {
  return kidlearnV3_writeServiceInvoke_(
    'WRITE_SERVICE_DRY_RUN_V3',
    function(req) {
      var operation =
        String(req.operation || req.action || '')
          .trim()
          .toUpperCase();

      return kidlearnV3_writeServiceRunSafeWrite_(
        operation,
        req.payload || {},
        true
      );
    },
    request
  );
}


/**
 * Generic submit.
 *
 * Ở 3J.2 hàm này đã có sẵn, nhưng chưa dùng ghi thật.
 * Muốn dryRun=false phải có confirmWrite = CONFIRM_WRITE_V3.
 * Safe Write Layer vẫn sẽ chặn nếu chưa ENABLED.
 */
function kidlearnV3_writeServiceSubmitV3(request) {
  return kidlearnV3_writeServiceInvoke_(
    'WRITE_SERVICE_SUBMIT_V3',
    function(req) {
      var operation =
        String(req.operation || req.action || '')
          .trim()
          .toUpperCase();

      var confirmWrite =
        String(req.confirmWrite || '').trim();

      if (
        req.dryRun === false &&
        confirmWrite !==
          KIDLEARN_V3_WRITE_SERVICE_CONFIG.CONFIRM_WRITE_TOKEN
      ) {
        throw new Error(
          'Thiếu confirmWrite=CONFIRM_WRITE_V3 nên không được gửi write thật.'
        );
      }

      return kidlearnV3_writeServiceRunSafeWrite_(
        operation,
        req.payload || {},
        req.dryRun !== false
      );
    },
    request
  );
}


/**
 * Wrapper: audit log.
 */
function kidlearnV3_writeServiceAuditLogV3(request) {
  return kidlearnV3_writeServiceRunNamedOperation_(
    'AUDIT_LOG',
    request,
    true
  );
}


/**
 * Wrapper: start study session.
 */
function kidlearnV3_writeServiceStartStudySessionV3(request) {
  return kidlearnV3_writeServiceRunNamedOperation_(
    'START_STUDY_SESSION',
    request,
    true
  );
}


/**
 * Wrapper: finish study session.
 */
function kidlearnV3_writeServiceFinishStudySessionV3(request) {
  return kidlearnV3_writeServiceRunNamedOperation_(
    'FINISH_STUDY_SESSION',
    request,
    true
  );
}


/**
 * Wrapper: upsert lesson progress.
 */
function kidlearnV3_writeServiceUpsertLessonProgressV3(request) {
  return kidlearnV3_writeServiceRunNamedOperation_(
    'UPSERT_LESSON_PROGRESS',
    request,
    true
  );
}


/**
 * Wrapper: update assignment status.
 */
function kidlearnV3_writeServiceUpdateAssignmentStatusV3(request) {
  return kidlearnV3_writeServiceRunNamedOperation_(
    'UPDATE_ASSIGNMENT_STATUS',
    request,
    true
  );
}


/**
 * Wrapper: upsert daily goal.
 */
function kidlearnV3_writeServiceUpsertDailyGoalV3(request) {
  return kidlearnV3_writeServiceRunNamedOperation_(
    'UPSERT_DAILY_GOAL',
    request,
    true
  );
}


/**
 * Run named operation.
 *
 * forceDryRunDefault = true nghĩa là nếu request không truyền dryRun=false
 * thì luôn chạy dry-run.
 */
function kidlearnV3_writeServiceRunNamedOperation_(
  operation,
  request,
  forceDryRunDefault
) {
  return kidlearnV3_writeServiceInvoke_(
    'WRITE_SERVICE_' + operation + '_V3',
    function(req) {
      var dryRun =
        forceDryRunDefault
          ? req.dryRun !== false
          : true;

      return kidlearnV3_writeServiceRunSafeWrite_(
        operation,
        req.payload || {},
        dryRun
      );
    },
    request
  );
}


/**
 * Run Safe Write Layer qua service.
 */
function kidlearnV3_writeServiceRunSafeWrite_(
  operation,
  payload,
  dryRun
) {
  var operationCode =
    String(operation || '')
      .trim()
      .toUpperCase();

  if (
    !kidlearnV3_writeServiceIsAllowedOperation_(
      operationCode
    )
  ) {
    throw new Error(
      'Operation không được phép qua Write Service: ' +
      operationCode
    );
  }

  var safeWriteStatus =
    kidlearnV3_getSafeWriteLayerStatusV3();

  if (
    safeWriteStatus.mode === 'DISABLED' ||
    !safeWriteStatus.mode
  ) {
    throw new Error(
      'Safe Write Layer đang DISABLED. Hãy chạy kidlearnV3_initializeSafeWriteLayerV3 trước.'
    );
  }

  var safeWriteResponse =
    kidlearnV3_safeWriteV3({
      operation: operationCode,
      payload: payload || {},
      dryRun: dryRun !== false
    });

  if (safeWriteResponse.success !== true) {
    var error =
      new Error(
        kidlearnV3_writeServiceGetErrorMessage_(
          safeWriteResponse
        )
      );

    error.safeWriteResponse =
      safeWriteResponse;

    throw error;
  }

  return {
    operation: operationCode,
    dryRun:
      dryRun !== false,
    executed:
      safeWriteResponse.data &&
      safeWriteResponse.data.executed === true,
    safeWrite:
      safeWriteResponse,
    plan:
      safeWriteResponse.data
        ? safeWriteResponse.data.plan || null
        : null
  };
}


/**
 * Core service wrapper.
 */
function kidlearnV3_writeServiceInvoke_(
  serviceName,
  handler,
  request
) {
  var startedAt =
    new Date();

  var requestId =
    kidlearnV3_writeServiceRequestId_(
      serviceName,
      startedAt
    );

  var safeRequest =
    kidlearnV3_writeServiceNormalizeRequest_(
      request
    );

  try {
    kidlearnV3_writeServiceAssertReady_();

    var data =
      handler(safeRequest);

    return kidlearnV3_writeServiceSuccess_(
      serviceName,
      requestId,
      startedAt,
      data
    );

  } catch (error) {
    return kidlearnV3_writeServiceFailure_(
      serviceName,
      requestId,
      startedAt,
      error
    );
  }
}


/**
 * Assert base ready.
 */
function kidlearnV3_writeServiceAssertReady_() {
  var missing = [];

  if (
    typeof kidlearnV3_getSafeWriteLayerStatusV3 !== 'function'
  ) {
    missing.push(
      'kidlearnV3_getSafeWriteLayerStatusV3'
    );
  }

  if (
    typeof kidlearnV3_safeWriteV3 !== 'function'
  ) {
    missing.push(
      'kidlearnV3_safeWriteV3'
    );
  }

  if (
    typeof kidlearnV3_assertPhase3IClosedFor3JV3 !== 'function'
  ) {
    missing.push(
      'kidlearnV3_assertPhase3IClosedFor3JV3'
    );
  }

  if (missing.length > 0) {
    throw new Error(
      'Thiếu dependency 3J.1/3I.10: ' +
      missing.join(', ')
    );
  }

  kidlearnV3_assertPhase3IClosedFor3JV3();

  var connection =
    kidlearnV3_writeServiceSafeConnection_();

  if (
    connection.databaseMode !== 'V3' ||
    connection.connectionStatus !== 'CONNECTED'
  ) {
    throw new Error(
      'App DEV chưa CONNECTED với Database V3.'
    );
  }
}


/**
 * Success response.
 */
function kidlearnV3_writeServiceSuccess_(
  serviceName,
  requestId,
  startedAt,
  data
) {
  var finishedAt =
    new Date();

  return {
    success: true,
    serviceName: serviceName,
    requestId: requestId,
    phase: '3J.2',
    serviceVersion:
      KIDLEARN_V3_WRITE_SERVICE_CONFIG.VERSION,
    responseVersion:
      KIDLEARN_V3_WRITE_SERVICE_CONFIG.RESPONSE_VERSION,
    schemaVersion:
      KIDLEARN_V3.SCHEMA_VERSION,
    appVersion:
      KIDLEARN_V3.APP_VERSION,
    startedAt:
      startedAt.toISOString(),
    finishedAt:
      finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    data:
      kidlearnV3_writeServiceCloneSafe_(
        data
      )
  };
}


/**
 * Failure response.
 */
function kidlearnV3_writeServiceFailure_(
  serviceName,
  requestId,
  startedAt,
  error
) {
  var finishedAt =
    new Date();

  var message =
    String(
      error &&
      error.message
        ? error.message
        : error
    );

  var result = {
    success: false,
    serviceName: serviceName,
    requestId: requestId,
    phase: '3J.2',
    serviceVersion:
      KIDLEARN_V3_WRITE_SERVICE_CONFIG.VERSION,
    responseVersion:
      KIDLEARN_V3_WRITE_SERVICE_CONFIG.RESPONSE_VERSION,
    schemaVersion:
      KIDLEARN_V3.SCHEMA_VERSION,
    appVersion:
      KIDLEARN_V3.APP_VERSION,
    startedAt:
      startedAt.toISOString(),
    finishedAt:
      finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    error: {
      code: 'WRITE_SERVICE_ERROR',
      message: message
    }
  };

  if (
    error &&
    error.safeWriteResponse
  ) {
    result.details = {
      safeWriteResponse:
        error.safeWriteResponse
    };
  }

  console.error(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Direct failure không cần assert ready.
 */
function kidlearnV3_writeServiceFailureDirect_(
  serviceName,
  code,
  message
) {
  var now =
    new Date();

  return {
    success: false,
    serviceName: serviceName,
    phase: '3J.2',
    serviceVersion:
      KIDLEARN_V3_WRITE_SERVICE_CONFIG.VERSION,
    responseVersion:
      KIDLEARN_V3_WRITE_SERVICE_CONFIG.RESPONSE_VERSION,
    schemaVersion:
      KIDLEARN_V3.SCHEMA_VERSION,
    appVersion:
      KIDLEARN_V3.APP_VERSION,
    startedAt:
      now.toISOString(),
    finishedAt:
      now.toISOString(),
    durationMs:
      0,
    error: {
      code: code,
      message: message
    }
  };
}


/**
 * Normalize request.
 */
function kidlearnV3_writeServiceNormalizeRequest_(
  request
) {
  if (!request) {
    return {
      action: '',
      operation: '',
      payload: {},
      dryRun: true
    };
  }

  if (
    typeof request !== 'object'
  ) {
    return {
      action:
        String(request || ''),
      operation:
        String(request || ''),
      payload: {},
      dryRun: true
    };
  }

  return {
    action:
      request.action || '',
    operation:
      request.operation || '',
    payload:
      request.payload || {},
    dryRun:
      request.dryRun !== false,
    confirmWrite:
      request.confirmWrite || ''
  };
}


/**
 * Allowed actions.
 */
function kidlearnV3_writeServiceGetAllowedActions_() {
  return Object.keys(
    KIDLEARN_V3_WRITE_SERVICE_ACTIONS
  );
}


/**
 * Allowed operations từ Safe Write Layer.
 */
function kidlearnV3_writeServiceGetAllowedOperations_() {
  if (
    typeof KIDLEARN_V3_SAFE_WRITE_OPERATIONS === 'undefined'
  ) {
    return [];
  }

  return Object.keys(
    KIDLEARN_V3_SAFE_WRITE_OPERATIONS
  );
}


/**
 * Check operation allowed.
 */
function kidlearnV3_writeServiceIsAllowedOperation_(
  operation
) {
  var code =
    String(operation || '')
      .trim()
      .toUpperCase();

  var operations =
    kidlearnV3_writeServiceGetAllowedOperations_();

  for (var i = 0; i < operations.length; i++) {
    if (operations[i] === code) {
      return true;
    }
  }

  return false;
}


/**
 * Check functions.
 */
function kidlearnV3_writeServiceCheckFunctions_(
  functionNames
) {
  var errors = [];
  var items = [];

  for (var i = 0; i < functionNames.length; i++) {
    var item =
      kidlearnV3_writeServiceCheckFunction_(
        functionNames[i]
      );

    items.push(item);

    if (!item.exists) {
      errors.push(
        'Thiếu function: ' +
        item.name
      );
    }
  }

  return {
    errorCount:
      errors.length,
    errors:
      errors,
    items:
      items
  };
}


/**
 * Check một function.
 */
function kidlearnV3_writeServiceCheckFunction_(
  functionName
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

  return {
    name: functionName,
    exists: exists
  };
}


/**
 * Safe Phase 3I assert.
 */
function kidlearnV3_writeServiceSafePhase3IAssert_() {
  try {
    var result =
      kidlearnV3_assertPhase3IClosedFor3JV3();

    return {
      success:
        result.success === true,
      message:
        ''
    };

  } catch (error) {
    return {
      success: false,
      message:
        String(
          error &&
          error.message
            ? error.message
            : error
        )
    };
  }
}


/**
 * Safe connection.
 */
function kidlearnV3_writeServiceSafeConnection_() {
  try {
    return kidlearnV3_getAppDevConnectionV3Status();
  } catch (error) {
    return {
      success: false,
      databaseMode: '',
      connectionStatus: '',
      spreadsheetId: '',
      spreadsheetName: '',
      error:
        String(
          error &&
          error.message
            ? error.message
            : error
        )
    };
  }
}


/**
 * Safe SafeWrite status.
 */
function kidlearnV3_writeServiceSafeLayerStatus_() {
  try {
    return kidlearnV3_getSafeWriteLayerStatusV3();
  } catch (error) {
    return {
      success: false,
      mode: '',
      enabled: false,
      error:
        String(
          error &&
          error.message
            ? error.message
            : error
        )
    };
  }
}


/**
 * Sample context.
 */
function kidlearnV3_writeServiceGetSampleContext_() {
  if (
    typeof kidlearnV3_writeGetSampleContext_ === 'function'
  ) {
    return kidlearnV3_writeGetSampleContext_();
  }

  var context = {
    childId: '',
    subjectId: '',
    lessonId: 'DRY_RUN_LESSON_ID',
    assignmentId: ''
  };

  try {
    var bootstrap =
      kidlearnV3_serviceGetBootstrapV3({});

    if (
      bootstrap.success &&
      bootstrap.data
    ) {
      var child =
        bootstrap.data.selectedChild ||
        (
          bootstrap.data.children &&
          bootstrap.data.children.length
            ? bootstrap.data.children[0]
            : null
        );

      if (child) {
        context.childId =
          child.childId || '';
      }

      var subject =
        bootstrap.data.subjects &&
        bootstrap.data.subjects.length
          ? bootstrap.data.subjects[0]
          : null;

      if (subject) {
        context.subjectId =
          subject.subjectId || '';
      }

      var assignment =
        bootstrap.data.assignments &&
        bootstrap.data.assignments.length
          ? bootstrap.data.assignments[0]
          : null;

      if (assignment) {
        context.assignmentId =
          assignment.assignmentId || '';
      }
    }
  } catch (error) {
    context.error =
      String(error.message || error);
  }

  return context;
}


/**
 * Error message helper.
 */
function kidlearnV3_writeServiceGetErrorMessage_(
  response
) {
  if (
    response &&
    response.error &&
    response.error.message
  ) {
    return response.error.message;
  }

  if (
    response &&
    response.data &&
    response.data.plan &&
    response.data.plan.errors &&
    response.data.plan.errors.length
  ) {
    return response.data.plan.errors.join(' | ');
  }

  return 'Không rõ lỗi.';
}


/**
 * Request ID.
 */
function kidlearnV3_writeServiceRequestId_(
  serviceName,
  dateValue
) {
  var text =
    Utilities.formatDate(
      dateValue,
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    );

  var random =
    Math.floor(
      Math.random() * 100000
    );

  return (
    'WREQ_' +
    serviceName +
    '_' +
    text +
    '_' +
    random
  );
}


/**
 * Clone safe.
 */
function kidlearnV3_writeServiceCloneSafe_(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  try {
    return JSON.parse(
      JSON.stringify(value)
    );
  } catch (error) {
    return {
      value:
        String(value)
    };
  }
}


/**
 * Today yyyy-MM-dd.
 */
function kidlearnV3_writeServiceToday_() {
  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );
}