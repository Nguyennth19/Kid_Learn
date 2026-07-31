/**
 * ================================================================
 * KIDLEARN V3 - UI REAL WRITE GATE DEV
 * Bundle: 3J-A
 * Steps:
 * - 3J.10: Design UI Real Write Gate DEV
 * - 3J.11: Test UI Real Write Gate in DRY_RUN
 * Version: 3.1.0
 * ================================================================
 *
 * Gate này chuẩn bị UI cho real write sau này,
 * nhưng ở Bundle 3J-A vẫn chỉ DRY_RUN.
 *
 * KHÔNG mở ghi thật qua UI ở 3J.10/3J.11.
 * KHÔNG bật Safe Write ENABLED.
 * KHÔNG sửa PROD.
 */


var KIDLEARN_V3_UI_REAL_GATE_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3J_A_UI_REAL_GATE_STATUS',
  INITIALIZED_AT: 'KIDLEARN_V3_PHASE_3J_A_UI_REAL_GATE_INITIALIZED_AT',
  LAST_TEST_AT: 'KIDLEARN_V3_PHASE_3J_A_UI_REAL_GATE_LAST_TEST_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3J_A_UI_REAL_GATE_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3J_A_UI_REAL_GATE_LAST_RESULT_JSON'
};


var KIDLEARN_V3_UI_REAL_GATE_STATUS = {
  NOT_INITIALIZED: 'NOT_INITIALIZED',
  DESIGNED_DRY_RUN: 'DESIGNED_DRY_RUN',
  DRY_RUN_TESTED: 'DRY_RUN_TESTED',
  READY_FOR_UI_REAL_WRITE_TRIAL: 'READY_FOR_UI_REAL_WRITE_TRIAL'
};


var KIDLEARN_V3_UI_REAL_GATE_CONFIG = {
  VERSION: '3J-A',
  PHASE: '3J.10_3J.11',
  CONFIRM_DRY_RUN_TEXT: 'DRY_RUN_ONLY',
  REAL_WRITE_ALLOWED_NOW: false,
  NEXT_BUNDLE: '3J-B'
};


/**
 * Preview Bundle 3J-A.
 */
function kidlearnV3_previewUiRealWriteGateDevV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions = [
    'kidlearnV3_assertReadyToDesignUiRealWriteGateV3',
    'kidlearnV3_getPostRealWriteReviewStatusV3',
    'kidlearnV3_getControlledWriteDevStatusV3',
    'kidlearnV3_getSafeWriteLayerStatusV3',
    'kidlearnV3_writeRouterGetStatusV3',
    'kidlearnV3_writeRouterDispatchV3',
    'kidlearnV3_writeRouterGetSampleContextV3',
    'kidlearnV3_uiInclude_'
  ];

  var functionChecks =
    kidlearnV3_uiRealGateCheckFunctions_(
      requiredFunctions
    );

  errors =
    errors.concat(
      functionChecks.errors
    );

  var htmlChecks =
    kidlearnV3_uiRealGateCheckHtmlFiles_([
      'UI_Real_Write_Gate_Client_V3',
      'UI_Real_Write_Gate_Dev_V3'
    ]);

  errors =
    errors.concat(
      htmlChecks.errors
    );

  var phase3J9 =
    kidlearnV3_uiRealGateSafe3J9Assert_();

  if (!phase3J9.success) {
    errors.push(
      '3J.9 chưa READY để thiết kế UI Real Write Gate: ' +
      phase3J9.message
    );
  }

  var safeWrite =
    kidlearnV3_uiRealGateSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Bundle 3J-A yêu cầu Safe Write ở DRY_RUN và enabled=false. Hiện tại mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var controlledWrite =
    kidlearnV3_uiRealGateControlledWriteStatus_();

  if (controlledWrite.status === 'ENABLED') {
    errors.push(
      'Controlled Write đang ENABLED. Cần reset về DRY_RUN trước khi chạy Bundle 3J-A.'
    );
  }

  if (controlledWrite.status === 'ARMED') {
    warnings.push(
      'Controlled Write đang ARMED. Nên reset về DRY_RUN trước khi test UI Gate.'
    );
  }

  var router =
    kidlearnV3_uiRealGateRouterStatus_();

  var routerDryRunOnly =
    router.success &&
    router.data
      ? router.data.dryRunOnly
      : null;

  if (routerDryRunOnly !== true) {
    errors.push(
      'Write Router phải còn DRY_RUN_ONLY=true trong Bundle 3J-A.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_UI_REAL_WRITE_GATE_DEV_V3',
    bundle: '3J-A',
    phase: '3J.10_3J.11',
    realWriteAllowedNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3J9: phase3J9,
    safeWriteStatus: safeWrite,
    controlledWriteStatus: controlledWrite,
    routerStatus: {
      success: router.success === true,
      dryRunOnly: routerDryRunOnly
    },
    functionChecks: functionChecks.items,
    htmlChecks: htmlChecks.items
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Khởi tạo UI Real Write Gate ở chế độ DRY_RUN.
 */
function kidlearnV3_initializeUiRealWriteGateDevV3() {
  var preview =
    kidlearnV3_previewUiRealWriteGateDevV3();

  if (!preview.success) {
    throw new Error(
      'Không thể initialize UI Real Write Gate. Preview chưa đạt. Errors: ' +
      preview.errorCount
    );
  }

  var now =
    new Date();

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_GATE_KEYS.STATUS,
    KIDLEARN_V3_UI_REAL_GATE_STATUS.DESIGNED_DRY_RUN
  );

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_GATE_KEYS.INITIALIZED_AT,
    now.toISOString()
  );

  var result = {
    success: true,
    action: 'INITIALIZE_UI_REAL_WRITE_GATE_DEV_V3',
    bundle: '3J-A',
    phase: '3J.10',
    status: 'DESIGNED_DRY_RUN',
    realWriteAllowedNow: false,
    confirmDryRunText:
      KIDLEARN_V3_UI_REAL_GATE_CONFIG.CONFIRM_DRY_RUN_TEXT,
    message:
      'UI Real Write Gate đã được thiết kế ở chế độ DRY_RUN.'
  };

  kidlearnV3_uiRealGateSaveResult_(
    result
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Xem trạng thái UI Real Write Gate.
 */
function kidlearnV3_getUiRealWriteGateDevStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_UI_REAL_WRITE_GATE_DEV_STATUS_V3',
    bundle: '3J-A',
    phase: '3J.10_3J.11',
    status:
      properties.getProperty(
        KIDLEARN_V3_UI_REAL_GATE_KEYS.STATUS
      ) ||
      KIDLEARN_V3_UI_REAL_GATE_STATUS.NOT_INITIALIZED,
    initializedAt:
      properties.getProperty(
        KIDLEARN_V3_UI_REAL_GATE_KEYS.INITIALIZED_AT
      ) ||
      '',
    lastTestAt:
      properties.getProperty(
        KIDLEARN_V3_UI_REAL_GATE_KEYS.LAST_TEST_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_UI_REAL_GATE_KEYS.LAST_READY_AT
      ) ||
      '',
    realWriteAllowedNow: false,
    confirmDryRunText:
      KIDLEARN_V3_UI_REAL_GATE_CONFIG.CONFIRM_DRY_RUN_TEXT,
    safeWriteStatus:
      kidlearnV3_uiRealGateSafeWriteStatus_(),
    controlledWriteStatus:
      kidlearnV3_uiRealGateControlledWriteStatus_(),
    routerStatus:
      kidlearnV3_uiRealGateRouterStatus_(),
    lastResult:
      kidlearnV3_uiRealGateReadLastResult_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Mở UI Real Write Gate DEV.
 *
 * Chạy từ Google Sheet menu.
 */
function kidlearnV3_showUiRealWriteGateDevV3() {
  var preview =
    kidlearnV3_previewUiRealWriteGateDevV3();

  if (!preview.success) {
    throw new Error(
      'UI Real Write Gate chưa sẵn sàng. Errors: ' +
      preview.errorCount
    );
  }

  var html =
    HtmlService
      .createTemplateFromFile(
        'UI_Real_Write_Gate_Dev_V3'
      )
      .evaluate()
      .setTitle(
        'KIDLEARN V3 - UI Real Write Gate DEV'
      )
      .setWidth(1200)
      .setHeight(850);

  SpreadsheetApp
    .getUi()
    .showModalDialog(
      html,
      'KIDLEARN V3 - UI Real Write Gate DEV'
    );
}


/**
 * Lấy sample context cho UI Gate.
 */
function kidlearnV3_uiRealWriteGateGetSampleContextV3() {
  var status =
    kidlearnV3_getUiRealWriteGateDevStatusV3();

  var sample =
    kidlearnV3_writeRouterGetSampleContextV3({});

  var result = {
    success:
      sample.success === true,
    action: 'UI_REAL_WRITE_GATE_GET_SAMPLE_CONTEXT_V3',
    bundle: '3J-A',
    phase: '3J.10_3J.11',
    realWriteAllowedNow: false,
    gateStatus: status.status,
    data:
      sample.data || {},
    error:
      sample.error || null
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Dispatch từ UI Gate.
 *
 * Bundle 3J-A luôn force dryRun=true.
 * Nếu UI gửi dryRun=false hoặc realWriteRequested=true thì block.
 */
function kidlearnV3_uiRealWriteGateDispatchV3(request) {
  var startedAt =
    new Date();

  var req =
    kidlearnV3_uiRealGateNormalizeRequest_(
      request
    );

  try {
    kidlearnV3_uiRealGateAssertReadyForDryRun_(
      req
    );

    var action =
      kidlearnV3_uiRealGateCanonicalAction_(
        req.action
      );

    var payload =
      kidlearnV3_uiRealGateBuildPayload_(
        action,
        req.payload || {}
      );

    var routerResponse =
      kidlearnV3_writeRouterDispatchV3({
        action: action,
        payload: payload,
        dryRun: true,
        source: 'UI_REAL_WRITE_GATE_DEV_3J_A'
      });

    var finishedAt =
      new Date();

    var result = {
      success:
        routerResponse.success === true,
      action: 'UI_REAL_WRITE_GATE_DISPATCH_V3',
      bundle: '3J-A',
      phase: '3J.11',
      gateAction: action,
      dryRun: true,
      realWriteAllowedNow: false,
      executed: false,
      startedAt:
        startedAt.toISOString(),
      finishedAt:
        finishedAt.toISOString(),
      durationMs:
        finishedAt.getTime() -
        startedAt.getTime(),
      routerResponse:
        routerResponse
    };

    return result;

  } catch (error) {
    var failedAt =
      new Date();

    return {
      success: false,
      action: 'UI_REAL_WRITE_GATE_DISPATCH_V3',
      bundle: '3J-A',
      phase: '3J.11',
      dryRun: true,
      realWriteAllowedNow: false,
      executed: false,
      startedAt:
        startedAt.toISOString(),
      finishedAt:
        failedAt.toISOString(),
      durationMs:
        failedAt.getTime() -
        startedAt.getTime(),
      error: {
        code: 'UI_REAL_WRITE_GATE_BLOCKED',
        message:
          String(error.message || error)
      }
    };
  }
}


/**
 * Smoke test UI Real Write Gate ở DRY_RUN.
 */
function kidlearnV3_smokeTestUiRealWriteGateDryRunV3() {
  var errors = [];
  var warnings = [];
  var tests = [];

  var preview =
    kidlearnV3_previewUiRealWriteGateDevV3();

  if (!preview.success) {
    throw new Error(
      'Không thể smoke test UI Real Write Gate. Preview chưa đạt. Errors: ' +
      preview.errorCount
    );
  }

  var sample =
    kidlearnV3_writeRouterGetSampleContextV3({});

  var context =
    sample.success &&
    sample.data
      ? sample.data.sampleContext || {}
      : {};

  var childId =
    context.childId || 'DRY_RUN_CHILD_ID';

  var subjectId =
    context.subjectId || 'SUB_TV';

  var lessonId =
    'DRY_RUN_UI_GATE_LESSON_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMddHHmmss'
    );

  var sessionId =
    'DRY_RUN_UI_GATE_SESSION_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMddHHmmss'
    );

  tests.push(
    kidlearnV3_uiRealWriteGateDispatchV3({
      action: 'AUDIT_EVENT',
      confirmText: 'DRY_RUN_ONLY',
      payload: {
        eventType: 'UI_REAL_GATE_DRY_RUN_TEST',
        message: 'Dry-run test from UI Real Write Gate 3J-A',
        entityType: 'BUNDLE',
        entityId: '3J-A',
        childId: childId
      }
    })
  );

  tests.push(
    kidlearnV3_uiRealWriteGateDispatchV3({
      action: 'STUDY_START',
      confirmText: 'DRY_RUN_ONLY',
      payload: {
        studySessionId: sessionId,
        childId: childId,
        subjectId: subjectId,
        lessonId: lessonId
      }
    })
  );

  tests.push(
    kidlearnV3_uiRealWriteGateDispatchV3({
      action: 'LESSON_PROGRESS_SAVE',
      confirmText: 'DRY_RUN_ONLY',
      payload: {
        childId: childId,
        subjectId: subjectId,
        lessonId: lessonId,
        progressPercent: 30
      }
    })
  );

  tests.push(
    kidlearnV3_uiRealWriteGateDispatchV3({
      action: 'DAILY_GOAL_SAVE',
      confirmText: 'DRY_RUN_ONLY',
      payload: {
        childId: childId,
        goalDate: kidlearnV3_uiRealGateToday_(),
        targetMinutes: 20,
        completedMinutes: 10
      }
    })
  );

  tests.push(
    kidlearnV3_uiRealWriteGateDispatchV3({
      action: 'STUDY_FINISH',
      confirmText: 'DRY_RUN_ONLY',
      payload: {
        studySessionId: sessionId,
        durationSeconds: 300
      }
    })
  );

  for (var i = 0; i < tests.length; i++) {
    if (tests[i].success !== true) {
      errors.push(
        'UI Gate dry-run test #' +
        (i + 1) +
        ' failed: ' +
        kidlearnV3_uiRealGateGetErrorMessage_(
          tests[i]
        )
      );
    }
  }

  var safeWrite =
    kidlearnV3_uiRealGateSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Sau smoke test, Safe Write phải vẫn là DRY_RUN/enabled=false.'
    );
  }

  var controlledWrite =
    kidlearnV3_uiRealGateControlledWriteStatus_();

  if (controlledWrite.status === 'ENABLED') {
    errors.push(
      'Sau smoke test, Controlled Write không được ENABLED.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_UI_REAL_WRITE_GATE_DRY_RUN_V3',
    bundle: '3J-A',
    phase: '3J.11',
    dryRunOnly: true,
    realWriteAllowedNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    sampleContext: context,
    testCount: tests.length,
    tests: tests
  };

  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_UI_REAL_GATE_KEYS.LAST_TEST_AT,
      new Date().toISOString()
    );

  if (result.success) {
    PropertiesService
      .getScriptProperties()
      .setProperty(
        KIDLEARN_V3_UI_REAL_GATE_KEYS.STATUS,
        KIDLEARN_V3_UI_REAL_GATE_STATUS.DRY_RUN_TESTED
      );
  }

  kidlearnV3_uiRealGateSaveResult_(
    result
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'UI Real Write Gate dry-run smoke test chưa đạt. Errors: ' +
      result.errorCount
    );
  }

  return result;
}


/**
 * Mark Bundle 3J-A ready cho Bundle 3J-B.
 */
function kidlearnV3_markUiRealWriteGateDryRunReadyV3() {
  var smoke =
    kidlearnV3_smokeTestUiRealWriteGateDryRunV3();

  if (!smoke.success) {
    throw new Error(
      'Không thể mark 3J-A ready vì smoke test chưa pass.'
    );
  }

  var now =
    new Date();

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_GATE_KEYS.STATUS,
    KIDLEARN_V3_UI_REAL_GATE_STATUS.READY_FOR_UI_REAL_WRITE_TRIAL
  );

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_GATE_KEYS.LAST_READY_AT,
    now.toISOString()
  );

  var result = {
    success: true,
    action: 'MARK_UI_REAL_WRITE_GATE_DRY_RUN_READY_V3',
    bundle: '3J-A',
    phase: '3J.11',
    status: 'READY_FOR_UI_REAL_WRITE_TRIAL',
    nextBundle:
      KIDLEARN_V3_UI_REAL_GATE_CONFIG.NEXT_BUNDLE,
    realWriteAllowedNow: false,
    message:
      'Bundle 3J-A đã pass. Có thể chuyển sang 3J-B để chạy 01 UI real write trial có kiểm soát.'
  };

  kidlearnV3_uiRealGateSaveResult_(
    result
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert dùng cho Bundle 3J-B.
 */
function kidlearnV3_assertUiRealWriteGateDryRunReadyV3() {
  var status =
    kidlearnV3_getUiRealWriteGateDevStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_UI_REAL_GATE_STATUS.READY_FOR_UI_REAL_WRITE_TRIAL
  ) {
    errors.push(
      'UI Real Write Gate chưa READY_FOR_UI_REAL_WRITE_TRIAL. Status hiện tại: ' +
      status.status
    );
  }

  if (
    status.safeWriteStatus.mode !== 'DRY_RUN' ||
    status.safeWriteStatus.enabled !== false
  ) {
    errors.push(
      'Safe Write phải ở DRY_RUN trước khi sang 3J-B.'
    );
  }

  var routerDryRunOnly =
    status.routerStatus &&
    status.routerStatus.data
      ? status.routerStatus.data.dryRunOnly
      : null;

  if (routerDryRunOnly !== true) {
    errors.push(
      'Write Router vẫn phải DRY_RUN_ONLY=true trước khi 3J-B thiết kế trial riêng.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_UI_REAL_WRITE_GATE_DRY_RUN_READY_V3',
    bundle: '3J-A',
    phase: '3J.11',
    errorCount: errors.length,
    errors: errors,
    status: status.status,
    realWriteAllowedNow: false
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'UI Real Write Gate chưa đủ điều kiện sang 3J-B. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Assert gate sẵn sàng cho DRY_RUN dispatch.
 */
function kidlearnV3_uiRealGateAssertReadyForDryRun_(
  request
) {
  var confirmText =
    String(request.confirmText || '').trim();

  if (
    confirmText !==
    KIDLEARN_V3_UI_REAL_GATE_CONFIG.CONFIRM_DRY_RUN_TEXT
  ) {
    throw new Error(
      'Thiếu confirmText=DRY_RUN_ONLY.'
    );
  }

  if (request.dryRun === false) {
    throw new Error(
      'Bundle 3J-A không cho phép dryRun=false.'
    );
  }

  if (request.realWriteRequested === true) {
    throw new Error(
      'Bundle 3J-A không cho phép realWriteRequested=true.'
    );
  }

  var phase3J9 =
    kidlearnV3_uiRealGateSafe3J9Assert_();

  if (!phase3J9.success) {
    throw new Error(
      '3J.9 chưa ready: ' +
      phase3J9.message
    );
  }

  var safeWrite =
    kidlearnV3_uiRealGateSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    throw new Error(
      'Safe Write phải ở DRY_RUN/enabled=false cho UI Gate dry-run.'
    );
  }

  var controlledWrite =
    kidlearnV3_uiRealGateControlledWriteStatus_();

  if (controlledWrite.status === 'ENABLED') {
    throw new Error(
      'Controlled Write đang ENABLED. Bundle 3J-A chỉ DRY_RUN.'
    );
  }

  var router =
    kidlearnV3_uiRealGateRouterStatus_();

  var dryRunOnly =
    router.success &&
    router.data
      ? router.data.dryRunOnly
      : null;

  if (dryRunOnly !== true) {
    throw new Error(
      'Write Router không còn DRY_RUN_ONLY=true.'
    );
  }
}


/**
 * Canonical action.
 */
function kidlearnV3_uiRealGateCanonicalAction_(
  action
) {
  var value =
    String(action || '')
      .trim()
      .toUpperCase();

  var allowed = {
    AUDIT_EVENT: true,
    STUDY_START: true,
    STUDY_FINISH: true,
    LESSON_PROGRESS_SAVE: true,
    DAILY_GOAL_SAVE: true,
    ASSIGNMENT_START: true,
    ASSIGNMENT_PROGRESS: true,
    ASSIGNMENT_COMPLETE: true
  };

  if (!allowed[value]) {
    throw new Error(
      'UI Real Write Gate action không hợp lệ: ' +
      value
    );
  }

  return value;
}


/**
 * Build payload an toàn.
 */
function kidlearnV3_uiRealGateBuildPayload_(
  action,
  payload
) {
  var object =
    payload && typeof payload === 'object'
      ? payload
      : {};

  var safe = {};

  var keys =
    Object.keys(object);

  for (var i = 0; i < keys.length; i++) {
    safe[keys[i]] =
      object[keys[i]];
  }

  safe.source =
    'UI_REAL_WRITE_GATE_DEV_3J_A';

  safe.gateAction =
    action;

  safe.realWriteAllowedNow =
    false;

  return safe;
}


/**
 * Normalize request.
 */
function kidlearnV3_uiRealGateNormalizeRequest_(
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


/**
 * Check functions.
 */
function kidlearnV3_uiRealGateCheckFunctions_(
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
    errorCount: errors.length,
    errors: errors,
    items: items
  };
}


/**
 * Check HTML files.
 */
function kidlearnV3_uiRealGateCheckHtmlFiles_(
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
    errorCount: errors.length,
    errors: errors,
    items: items
  };
}


/**
 * Safe 3J.9 assert.
 */
function kidlearnV3_uiRealGateSafe3J9Assert_() {
  try {
    var result =
      kidlearnV3_assertReadyToDesignUiRealWriteGateV3();

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
 * Safe SafeWrite status.
 */
function kidlearnV3_uiRealGateSafeWriteStatus_() {
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
 * Safe Controlled Write status.
 */
function kidlearnV3_uiRealGateControlledWriteStatus_() {
  try {
    return kidlearnV3_getControlledWriteDevStatusV3();
  } catch (error) {
    return {
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
 * Safe Router status.
 */
function kidlearnV3_uiRealGateRouterStatus_() {
  try {
    return kidlearnV3_writeRouterGetStatusV3({});
  } catch (error) {
    return {
      success: false,
      error: {
        message:
          String(error.message || error)
      }
    };
  }
}


/**
 * Save compact result.
 */
function kidlearnV3_uiRealGateSaveResult_(
  result
) {
  try {
    PropertiesService
      .getScriptProperties()
      .setProperty(
        KIDLEARN_V3_UI_REAL_GATE_KEYS.LAST_RESULT_JSON,
        JSON.stringify({
          success: result.success,
          action: result.action,
          bundle: result.bundle,
          phase: result.phase,
          status: result.status || '',
          realWriteAllowedNow: result.realWriteAllowedNow,
          at: new Date().toISOString(),
          errorCount: result.errorCount || 0,
          warningCount: result.warningCount || 0
        })
      );
  } catch (error) {
    console.warn(
      'Không lưu được UI Real Gate result: ' +
      String(error.message || error)
    );
  }
}


/**
 * Read last result.
 */
function kidlearnV3_uiRealGateReadLastResult_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_UI_REAL_GATE_KEYS.LAST_RESULT_JSON
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
 * Error message helper.
 */
function kidlearnV3_uiRealGateGetErrorMessage_(
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
    response.routerResponse &&
    response.routerResponse.error &&
    response.routerResponse.error.message
  ) {
    return response.routerResponse.error.message;
  }

  return 'Không rõ lỗi.';
}


/**
 * Today yyyy-MM-dd.
 */
function kidlearnV3_uiRealGateToday_() {
  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );
}