/**
 * ================================================================
 * KIDLEARN V3 - WRITE ROUTER
 * Step: 3J.3
 * Version: 3.1.0
 * ================================================================
 *
 * File này phân loại request ghi từ UI theo hành động học tập.
 *
 * UI DEV gọi Write Router.
 * Write Router gọi Write Service Facade.
 * Write Service Facade gọi Safe Write Layer.
 *
 * 3J.3 chỉ DRY_RUN.
 *
 * KHÔNG sửa PROD.
 * KHÔNG bật ghi thật.
 */


var KIDLEARN_V3_WRITE_ROUTER_CONFIG = {
  VERSION: '3J.3',
  RESPONSE_VERSION: '1.0',
  DRY_RUN_ONLY: true
};


var KIDLEARN_V3_WRITE_ROUTER_ACTIONS = {
  STATUS: {
    action: 'STATUS',
    operation: '',
    description: 'Lấy trạng thái Write Router'
  },

  SAMPLE_CONTEXT: {
    action: 'SAMPLE_CONTEXT',
    operation: '',
    description: 'Lấy dữ liệu mẫu để test ghi'
  },

  AUDIT_EVENT: {
    action: 'AUDIT_EVENT',
    operation: 'AUDIT_LOG',
    description: 'Ghi audit event'
  },

  STUDY_START: {
    action: 'STUDY_START',
    operation: 'START_STUDY_SESSION',
    description: 'Bắt đầu phiên học'
  },

  STUDY_FINISH: {
    action: 'STUDY_FINISH',
    operation: 'FINISH_STUDY_SESSION',
    description: 'Kết thúc phiên học'
  },

  LESSON_PROGRESS_SAVE: {
    action: 'LESSON_PROGRESS_SAVE',
    operation: 'UPSERT_LESSON_PROGRESS',
    description: 'Lưu tiến độ bài học'
  },

  ASSIGNMENT_START: {
    action: 'ASSIGNMENT_START',
    operation: 'UPDATE_ASSIGNMENT_STATUS',
    description: 'Bắt đầu assignment'
  },

  ASSIGNMENT_PROGRESS: {
    action: 'ASSIGNMENT_PROGRESS',
    operation: 'UPDATE_ASSIGNMENT_STATUS',
    description: 'Cập nhật tiến độ assignment'
  },

  ASSIGNMENT_COMPLETE: {
    action: 'ASSIGNMENT_COMPLETE',
    operation: 'UPDATE_ASSIGNMENT_STATUS',
    description: 'Hoàn thành assignment'
  },

  DAILY_GOAL_SAVE: {
    action: 'DAILY_GOAL_SAVE',
    operation: 'UPSERT_DAILY_GOAL',
    description: 'Lưu mục tiêu học trong ngày'
  }
};


/**
 * Preview Write Router V3.
 */
function kidlearnV3_previewWriteRouterV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions = [
    'kidlearnV3_previewWriteServiceFacadeV3',
    'kidlearnV3_writeServiceDispatchV3',
    'kidlearnV3_writeServiceGetStatusV3',
    'kidlearnV3_writeServiceGetSampleContextV3',
    'kidlearnV3_assertPhase3IClosedFor3JV3'
  ];

  var functionChecks =
    kidlearnV3_writeRouterCheckFunctions_(
      requiredFunctions
    );

  errors =
    errors.concat(
      functionChecks.errors
    );

  var htmlChecks =
    kidlearnV3_writeRouterCheckHtmlFiles_([
      'UI_Write_Router_Client_V3',
      'UI_Write_Router_Test_V3'
    ]);

  errors =
    errors.concat(
      htmlChecks.errors
    );

  var phase3I =
    kidlearnV3_writeRouterSafePhase3IAssert_();

  if (!phase3I.success) {
    errors.push(
      'Phase 3I chưa đóng đúng điều kiện cho 3J: ' +
      phase3I.message
    );
  }

  var writeServiceStatus =
    kidlearnV3_writeRouterSafeWriteServiceStatus_();

  if (!writeServiceStatus.success) {
    errors.push(
      'Write Service Facade chưa sẵn sàng.'
    );
  }

  var safeWriteMode =
    writeServiceStatus.success &&
    writeServiceStatus.data &&
    writeServiceStatus.data.safeWriteStatus
      ? writeServiceStatus.data.safeWriteStatus.mode
      : '';

  if (safeWriteMode !== 'DRY_RUN') {
    warnings.push(
      'Safe Write Layer hiện không phải DRY_RUN. Mode hiện tại: ' +
      safeWriteMode +
      '. 3J.3 vẫn sẽ ép DRY_RUN_ONLY.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_WRITE_ROUTER_V3',
    phase: '3J.3',
    routerVersion:
      KIDLEARN_V3_WRITE_ROUTER_CONFIG.VERSION,
    dryRunOnly:
      KIDLEARN_V3_WRITE_ROUTER_CONFIG.DRY_RUN_ONLY,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3I: phase3I,
    writeServiceStatus: {
      success: writeServiceStatus.success,
      safeWriteMode: safeWriteMode
    },
    functionChecks:
      functionChecks.items,
    htmlChecks:
      htmlChecks.items,
    routes:
      kidlearnV3_writeRouterGetRoutes_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Smoke test Write Router V3.
 *
 * Chỉ DRY_RUN.
 */
function kidlearnV3_smokeTestWriteRouterV3() {
  var status =
    kidlearnV3_writeRouterGetStatusV3({});

  var sample =
    kidlearnV3_writeRouterGetSampleContextV3({});

  var context =
    sample.success && sample.data
      ? sample.data.sampleContext || {}
      : {};

  var tests = [];

  tests.push(
    kidlearnV3_writeRouterAuditEventV3({
      payload: {
        eventType: 'WRITE_ROUTER_SMOKE_TEST',
        message: 'Dry-run audit from Write Router 3J.3',
        entityType: 'PHASE',
        entityId: '3J.3'
      },
      dryRun: true
    })
  );

  tests.push(
    kidlearnV3_writeRouterStudyStartV3({
      payload: {
        childId: context.childId || 'DRY_RUN_CHILD_ID',
        subjectId: context.subjectId || '',
        lessonId: context.lessonId || 'DRY_RUN_LESSON_ID'
      },
      dryRun: true
    })
  );

  tests.push(
    kidlearnV3_writeRouterStudyFinishV3({
      payload: {
        studySessionId: 'DRY_RUN_STUDY_SESSION_ID',
        durationSeconds: 300
      },
      dryRun: true
    })
  );

  tests.push(
    kidlearnV3_writeRouterLessonProgressSaveV3({
      payload: {
        childId: context.childId || 'DRY_RUN_CHILD_ID',
        subjectId: context.subjectId || '',
        lessonId: context.lessonId || 'DRY_RUN_LESSON_ID',
        progressPercent: 30
      },
      dryRun: true
    })
  );

  tests.push(
    kidlearnV3_writeRouterDailyGoalSaveV3({
      payload: {
        childId: context.childId || 'DRY_RUN_CHILD_ID',
        goalDate: kidlearnV3_writeRouterToday_(),
        targetMinutes: 20,
        completedMinutes: 5
      },
      dryRun: true
    })
  );

  if (context.assignmentId) {
    tests.push(
      kidlearnV3_writeRouterAssignmentStartV3({
        payload: {
          assignmentId: context.assignmentId
        },
        dryRun: true
      })
    );

    tests.push(
      kidlearnV3_writeRouterAssignmentProgressV3({
        payload: {
          assignmentId: context.assignmentId,
          progressPercent: 45
        },
        dryRun: true
      })
    );

    tests.push(
      kidlearnV3_writeRouterAssignmentCompleteV3({
        payload: {
          assignmentId: context.assignmentId
        },
        dryRun: true
      })
    );
  }

  var errors = [];
  var warnings = [];

  if (!status.success) {
    errors.push(
      'Write Router status thất bại.'
    );
  }

  if (!sample.success) {
    errors.push(
      'Write Router sample context thất bại.'
    );
  }

  for (var i = 0; i < tests.length; i++) {
    if (tests[i].success !== true) {
      errors.push(
        'Write Router dry-run test #' +
        (i + 1) +
        ' failed: ' +
        kidlearnV3_writeRouterGetErrorMessage_(
          tests[i]
        )
      );
    }
  }

  if (!context.assignmentId) {
    warnings.push(
      'Không có assignmentId mẫu nên bỏ qua assignment start/progress/complete.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_WRITE_ROUTER_V3',
    phase: '3J.3',
    dryRunOnly: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    sampleContext: context,
    testCount: tests.length,
    tests: tests
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test Write Router V3 chưa đạt. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Mở UI test Write Router.
 *
 * Chỉ mở qua menu Google Sheet.
 */
function kidlearnV3_showWriteRouterTestUiV3() {
  var preview =
    kidlearnV3_previewWriteRouterV3();

  if (!preview.success) {
    throw new Error(
      'Write Router V3 chưa sẵn sàng. Errors: ' +
      preview.errorCount +
      '. Xem Execution log.'
    );
  }

  var html =
    HtmlService
      .createTemplateFromFile(
        'UI_Write_Router_Test_V3'
      )
      .evaluate()
      .setTitle(
        'KIDLEARN V3 - Write Router Test'
      )
      .setWidth(1200)
      .setHeight(850);

  SpreadsheetApp
    .getUi()
    .showModalDialog(
      html,
      'KIDLEARN V3 - Write Router Test'
    );
}


/**
 * Public: lấy trạng thái router.
 */
function kidlearnV3_writeRouterGetStatusV3(request) {
  return kidlearnV3_writeRouterInvoke_(
    'WRITE_ROUTER_GET_STATUS_V3',
    function() {
      return {
        routerVersion:
          KIDLEARN_V3_WRITE_ROUTER_CONFIG.VERSION,
        responseVersion:
          KIDLEARN_V3_WRITE_ROUTER_CONFIG.RESPONSE_VERSION,
        dryRunOnly:
          KIDLEARN_V3_WRITE_ROUTER_CONFIG.DRY_RUN_ONLY,
        routes:
          kidlearnV3_writeRouterGetRoutes_(),
        writeServiceStatus:
          kidlearnV3_writeServiceGetStatusV3({})
      };
    },
    request
  );
}


/**
 * Public: lấy sample context.
 */
function kidlearnV3_writeRouterGetSampleContextV3(request) {
  return kidlearnV3_writeRouterInvoke_(
    'WRITE_ROUTER_GET_SAMPLE_CONTEXT_V3',
    function() {
      var response =
        kidlearnV3_writeServiceGetSampleContextV3({});

      if (!response.success) {
        throw new Error(
          kidlearnV3_writeRouterGetErrorMessage_(
            response
          )
        );
      }

      return {
        sampleContext:
          response.data.sampleContext || {}
      };
    },
    request
  );
}


/**
 * Public dispatcher chính cho UI.
 *
 * Request mẫu:
 * {
 *   action: 'LESSON_PROGRESS_SAVE',
 *   payload: {...},
 *   dryRun: true
 * }
 */
function kidlearnV3_writeRouterDispatchV3(request) {
  var safeRequest =
    kidlearnV3_writeRouterNormalizeRequest_(
      request
    );

  var action =
    kidlearnV3_writeRouterCanonicalAction_(
      safeRequest.action
    );

  if (action === 'STATUS') {
    return kidlearnV3_writeRouterGetStatusV3(
      safeRequest
    );
  }

  if (action === 'SAMPLE_CONTEXT') {
    return kidlearnV3_writeRouterGetSampleContextV3(
      safeRequest
    );
  }

  return kidlearnV3_writeRouterRunAction_(
    action,
    safeRequest
  );
}


/**
 * Wrapper: audit event.
 */
function kidlearnV3_writeRouterAuditEventV3(request) {
  return kidlearnV3_writeRouterRunAction_(
    'AUDIT_EVENT',
    request
  );
}


/**
 * Wrapper: study start.
 */
function kidlearnV3_writeRouterStudyStartV3(request) {
  return kidlearnV3_writeRouterRunAction_(
    'STUDY_START',
    request
  );
}


/**
 * Wrapper: study finish.
 */
function kidlearnV3_writeRouterStudyFinishV3(request) {
  return kidlearnV3_writeRouterRunAction_(
    'STUDY_FINISH',
    request
  );
}


/**
 * Wrapper: lesson progress save.
 */
function kidlearnV3_writeRouterLessonProgressSaveV3(request) {
  return kidlearnV3_writeRouterRunAction_(
    'LESSON_PROGRESS_SAVE',
    request
  );
}


/**
 * Wrapper: assignment start.
 */
function kidlearnV3_writeRouterAssignmentStartV3(request) {
  return kidlearnV3_writeRouterRunAction_(
    'ASSIGNMENT_START',
    request
  );
}


/**
 * Wrapper: assignment progress.
 */
function kidlearnV3_writeRouterAssignmentProgressV3(request) {
  return kidlearnV3_writeRouterRunAction_(
    'ASSIGNMENT_PROGRESS',
    request
  );
}


/**
 * Wrapper: assignment complete.
 */
function kidlearnV3_writeRouterAssignmentCompleteV3(request) {
  return kidlearnV3_writeRouterRunAction_(
    'ASSIGNMENT_COMPLETE',
    request
  );
}


/**
 * Wrapper: daily goal save.
 */
function kidlearnV3_writeRouterDailyGoalSaveV3(request) {
  return kidlearnV3_writeRouterRunAction_(
    'DAILY_GOAL_SAVE',
    request
  );
}


/**
 * Run action qua route.
 */
function kidlearnV3_writeRouterRunAction_(
  action,
  request
) {
  return kidlearnV3_writeRouterInvoke_(
    'WRITE_ROUTER_' + action + '_V3',
    function(req) {
      var route =
        kidlearnV3_writeRouterGetRoute_(
          action
        );

      if (!route) {
        throw new Error(
          'Write Router action không được hỗ trợ: ' +
          action
        );
      }

      if (
        KIDLEARN_V3_WRITE_ROUTER_CONFIG.DRY_RUN_ONLY &&
        req.dryRun === false
      ) {
        throw new Error(
          '3J.3 đang DRY_RUN_ONLY. Không cho gửi write thật.'
        );
      }

      var payload =
        kidlearnV3_writeRouterBuildPayload_(
          action,
          req.payload || {}
        );

      var writeResponse =
        kidlearnV3_writeServiceDispatchV3({
          action: 'SUBMIT',
          operation: route.operation,
          payload: payload,
          dryRun: true
        });

      if (!writeResponse.success) {
        var error =
          new Error(
            kidlearnV3_writeRouterGetErrorMessage_(
              writeResponse
            )
          );

        error.writeResponse =
          writeResponse;

        throw error;
      }

      return {
        routerAction: action,
        operation: route.operation,
        dryRun: true,
        routedPayload: payload,
        writeService: writeResponse,
        plan:
          writeResponse.data &&
          writeResponse.data.plan
            ? writeResponse.data.plan
            : null
      };
    },
    request
  );
}


/**
 * Canonical action.
 */
function kidlearnV3_writeRouterCanonicalAction_(
  action
) {
  var value =
    String(action || '')
      .trim()
      .toUpperCase();

  if (value === '') {
    return '';
  }

  if (value === 'PING') {
    return 'STATUS';
  }

  if (
    value === 'START_STUDY' ||
    value === 'START_SESSION'
  ) {
    return 'STUDY_START';
  }

  if (
    value === 'FINISH_STUDY' ||
    value === 'END_STUDY' ||
    value === 'END_SESSION'
  ) {
    return 'STUDY_FINISH';
  }

  if (
    value === 'SAVE_LESSON_PROGRESS' ||
    value === 'LESSON_PROGRESS'
  ) {
    return 'LESSON_PROGRESS_SAVE';
  }

  if (
    value === 'START_ASSIGNMENT'
  ) {
    return 'ASSIGNMENT_START';
  }

  if (
    value === 'SAVE_ASSIGNMENT_PROGRESS'
  ) {
    return 'ASSIGNMENT_PROGRESS';
  }

  if (
    value === 'COMPLETE_ASSIGNMENT'
  ) {
    return 'ASSIGNMENT_COMPLETE';
  }

  if (
    value === 'SAVE_DAILY_GOAL' ||
    value === 'DAILY_GOAL'
  ) {
    return 'DAILY_GOAL_SAVE';
  }

  if (
    value === 'AUDIT' ||
    value === 'AUDIT_LOG'
  ) {
    return 'AUDIT_EVENT';
  }

  return value;
}


/**
 * Build payload theo action học tập.
 */
function kidlearnV3_writeRouterBuildPayload_(
  action,
  payload
) {
  var now =
    new Date().toISOString();

  if (action === 'AUDIT_EVENT') {
    return {
      eventType:
        payload.eventType || 'UI_LEARNING_EVENT',
      message:
        payload.message || '',
      entityType:
        payload.entityType || '',
      entityId:
        payload.entityId || '',
      childId:
        payload.childId || '',
      details:
        payload.details || {}
    };
  }

  if (action === 'STUDY_START') {
    return {
      childId:
        payload.childId || '',
      subjectId:
        payload.subjectId || '',
      lessonId:
        payload.lessonId || '',
      activityId:
        payload.activityId || '',
      startedAt:
        payload.startedAt || now,
      status:
        'IN_PROGRESS'
    };
  }

  if (action === 'STUDY_FINISH') {
    return {
      studySessionId:
        payload.studySessionId || '',
      endedAt:
        payload.endedAt || now,
      durationSeconds:
        Number(payload.durationSeconds || 0),
      status:
        payload.status || 'COMPLETED'
    };
  }

  if (action === 'LESSON_PROGRESS_SAVE') {
    return {
      childId:
        payload.childId || '',
      subjectId:
        payload.subjectId || '',
      lessonId:
        payload.lessonId || '',
      status:
        payload.status || 'IN_PROGRESS',
      progressPercent:
        Number(payload.progressPercent || 0)
    };
  }

  if (action === 'ASSIGNMENT_START') {
    return {
      assignmentId:
        payload.assignmentId || '',
      status:
        'IN_PROGRESS',
      progressPercent:
        Number(payload.progressPercent || 0)
    };
  }

  if (action === 'ASSIGNMENT_PROGRESS') {
    return {
      assignmentId:
        payload.assignmentId || '',
      status:
        payload.status || 'IN_PROGRESS',
      progressPercent:
        Number(payload.progressPercent || 0)
    };
  }

  if (action === 'ASSIGNMENT_COMPLETE') {
    return {
      assignmentId:
        payload.assignmentId || '',
      status:
        'COMPLETED',
      progressPercent:
        100,
      completedAt:
        payload.completedAt || now
    };
  }

  if (action === 'DAILY_GOAL_SAVE') {
    return {
      childId:
        payload.childId || '',
      goalDate:
        payload.goalDate ||
        payload.date ||
        kidlearnV3_writeRouterToday_(),
      targetMinutes:
        Number(payload.targetMinutes || 20),
      completedMinutes:
        Number(payload.completedMinutes || 0),
      status:
        payload.status || 'ACTIVE'
    };
  }

  return payload || {};
}


/**
 * Get route.
 */
function kidlearnV3_writeRouterGetRoute_(
  action
) {
  return KIDLEARN_V3_WRITE_ROUTER_ACTIONS[
    action
  ] || null;
}


/**
 * Get routes list.
 */
function kidlearnV3_writeRouterGetRoutes_() {
  var keys =
    Object.keys(
      KIDLEARN_V3_WRITE_ROUTER_ACTIONS
    );

  var result = [];

  for (var i = 0; i < keys.length; i++) {
    result.push(
      KIDLEARN_V3_WRITE_ROUTER_ACTIONS[
        keys[i]
      ]
    );
  }

  return result;
}


/**
 * Core wrapper.
 */
function kidlearnV3_writeRouterInvoke_(
  serviceName,
  handler,
  request
) {
  var startedAt =
    new Date();

  var requestId =
    kidlearnV3_writeRouterRequestId_(
      serviceName,
      startedAt
    );

  var safeRequest =
    kidlearnV3_writeRouterNormalizeRequest_(
      request
    );

  try {
    kidlearnV3_writeRouterAssertReady_();

    var data =
      handler(safeRequest);

    return kidlearnV3_writeRouterSuccess_(
      serviceName,
      requestId,
      startedAt,
      data
    );

  } catch (error) {
    return kidlearnV3_writeRouterFailure_(
      serviceName,
      requestId,
      startedAt,
      error
    );
  }
}


/**
 * Assert ready.
 */
function kidlearnV3_writeRouterAssertReady_() {
  var missing = [];

  if (
    typeof kidlearnV3_writeServiceDispatchV3 !== 'function'
  ) {
    missing.push(
      'kidlearnV3_writeServiceDispatchV3'
    );
  }

  if (
    typeof kidlearnV3_writeServiceGetStatusV3 !== 'function'
  ) {
    missing.push(
      'kidlearnV3_writeServiceGetStatusV3'
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
      'Thiếu dependency cho Write Router: ' +
      missing.join(', ')
    );
  }

  kidlearnV3_assertPhase3IClosedFor3JV3();
}


/**
 * Success response.
 */
function kidlearnV3_writeRouterSuccess_(
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
    phase: '3J.3',
    routerVersion:
      KIDLEARN_V3_WRITE_ROUTER_CONFIG.VERSION,
    responseVersion:
      KIDLEARN_V3_WRITE_ROUTER_CONFIG.RESPONSE_VERSION,
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
      kidlearnV3_writeRouterCloneSafe_(
        data
      )
  };
}


/**
 * Failure response.
 */
function kidlearnV3_writeRouterFailure_(
  serviceName,
  requestId,
  startedAt,
  error
) {
  var finishedAt =
    new Date();

  var result = {
    success: false,
    serviceName: serviceName,
    requestId: requestId,
    phase: '3J.3',
    routerVersion:
      KIDLEARN_V3_WRITE_ROUTER_CONFIG.VERSION,
    responseVersion:
      KIDLEARN_V3_WRITE_ROUTER_CONFIG.RESPONSE_VERSION,
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
      code: 'WRITE_ROUTER_ERROR',
      message:
        String(
          error &&
          error.message
            ? error.message
            : error
        )
    }
  };

  if (
    error &&
    error.writeResponse
  ) {
    result.details = {
      writeResponse:
        error.writeResponse
    };
  }

  console.error(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Normalize request.
 */
function kidlearnV3_writeRouterNormalizeRequest_(
  request
) {
  if (!request) {
    return {
      action: '',
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
      payload: {},
      dryRun: true
    };
  }

  return {
    action:
      request.action || '',
    payload:
      request.payload || {},
    dryRun:
      request.dryRun !== false
  };
}


/**
 * Check functions.
 */
function kidlearnV3_writeRouterCheckFunctions_(
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
function kidlearnV3_writeRouterCheckHtmlFiles_(
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
 * Safe Phase 3I assert.
 */
function kidlearnV3_writeRouterSafePhase3IAssert_() {
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
 * Safe Write Service status.
 */
function kidlearnV3_writeRouterSafeWriteServiceStatus_() {
  try {
    return kidlearnV3_writeServiceGetStatusV3({});
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
 * Error message helper.
 */
function kidlearnV3_writeRouterGetErrorMessage_(
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
    response.details &&
    response.details.writeResponse &&
    response.details.writeResponse.error &&
    response.details.writeResponse.error.message
  ) {
    return response.details.writeResponse.error.message;
  }

  return 'Không rõ lỗi.';
}


/**
 * Request ID.
 */
function kidlearnV3_writeRouterRequestId_(
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
    'WROUTE_' +
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
function kidlearnV3_writeRouterCloneSafe_(
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
function kidlearnV3_writeRouterToday_() {
  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );
}