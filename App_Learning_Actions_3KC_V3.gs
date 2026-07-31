/**
 * ================================================================
 * KIDLEARN V3 - LEARNING ACTIONS DRY RUN
 * Bundle: 3K-C
 * Steps:
 * - 3K.6: Start Lesson DRY_RUN
 * - 3K.7: Update Progress DRY_RUN
 * - 3K.8: Finish Lesson DRY_RUN
 * - 3K.9: Refresh Learning Dashboard
 * Version: 3.1.0
 * ================================================================
 *
 * 3K-C chỉ chạy DRY_RUN.
 * KHÔNG ghi thật DB.
 * KHÔNG mở real write.
 * KHÔNG sửa PROD.
 */


var KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3KC_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3KC_LAST_PREVIEW_AT',
  LAST_DRY_RUN_AT: 'KIDLEARN_V3_PHASE_3KC_LAST_DRY_RUN_AT',
  LAST_SMOKE_TEST_AT: 'KIDLEARN_V3_PHASE_3KC_LAST_SMOKE_TEST_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3KC_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3KC_LAST_RESULT_JSON'
};


var KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  DRY_RUN_TESTED: 'DRY_RUN_TESTED',
  SMOKE_TESTED: 'SMOKE_TESTED',
  READY_FOR_3K_D: 'READY_FOR_3K_D',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG = {
  VERSION: '3K-C',
  PHASE: '3K.6_3K.7_3K.8_3K.9',
  NEXT_BUNDLE: '3K-D',
  WRITE_MODE: 'DRY_RUN_ONLY',
  CONFIRM_TEXT: 'DRY_RUN_ONLY'
};


var KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS = [
  'LOG_Audit',
  'DATA_StudySessions',
  'DATA_LessonProgress',
  'DATA_DailyGoals',
  'DATA_Assignments'
];


var KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS = {
  START_LESSON: 'START_LESSON',
  UPDATE_PROGRESS: 'UPDATE_PROGRESS',
  FINISH_LESSON: 'FINISH_LESSON',
  UPSERT_DAILY_GOAL: 'UPSERT_DAILY_GOAL'
};


/**
 * Preview 3K-C.
 */
function kidlearnV3_previewLearningActions3KCV3() {
  var errors = [];
  var warnings = [];

  var functionChecks =
    kidlearnV3_3kcCheckFunctions_([
      'kidlearnV3_assertLearningUi3KBReadyV3',
      'kidlearnV3_buildLearningScreen3KBV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_writeServiceSubmitV3',
      'kidlearnV3_appGetActiveDatabaseV3_'
    ]);

  errors =
    errors.concat(
      functionChecks.errors
    );

  var phase3KB =
    kidlearnV3_3kcSafeAssert3KBReady_();

  if (!phase3KB.success) {
    errors.push(
      '3K-B chưa READY_FOR_3K_C: ' +
      phase3KB.message
    );
  }

  var safeWrite =
    kidlearnV3_3kcSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      '3K-C yêu cầu Safe Write ở DRY_RUN/enabled=false. Hiện tại mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var sheetCheck =
    kidlearnV3_3kcCheckTargetSheets_();

  errors =
    errors.concat(
      sheetCheck.errors
    );

  var gateAvailable =
    typeof kidlearnV3_uiRealWriteGateDispatchV3 === 'function';

  if (!gateAvailable) {
    warnings.push(
      'Không thấy kidlearnV3_uiRealWriteGateDispatchV3. 3K-C sẽ fallback qua Write Service DRY_RUN.'
    );
  }

  var sampleContext = null;

  try {
    if (errors.length === 0) {
      sampleContext =
        kidlearnV3_3kcBuildActionContext_({});
    }
  } catch (error) {
    errors.push(
      'Không build được action context 3K-C: ' +
      String(error.message || error)
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_LEARNING_ACTIONS_3KC_V3',
    bundle: '3K-C',
    phase: KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.NEXT_BUNDLE,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3KB: phase3KB,
    safeWriteStatus: safeWrite,
    gateAvailable: gateAvailable,
    functionChecks: functionChecks.items,
    targetSheets: sheetCheck.items,
    sampleContext: sampleContext
  };

  kidlearnV3_3kcSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.PREVIEWED,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_PREVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Run one learning action in DRY_RUN.
 */
function kidlearnV3_runLearningActionDryRun3KCV3(request) {
  var req =
    kidlearnV3_3kcNormalizeRequest_(
      request
    );

  var actionCode =
    String(req.actionCode || '').trim();

  if (!actionCode) {
    throw new Error(
      'Thiếu actionCode cho 3K-C.'
    );
  }

  var beforeSnapshot =
    kidlearnV3_3kcSnapshotSheets_(
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS
    );

  var context =
    kidlearnV3_3kcBuildActionContext_(
      req
    );

  var operationPayload =
    kidlearnV3_3kcBuildOperationPayload_(
      actionCode,
      context,
      req
    );

  var dispatch =
    kidlearnV3_3kcDispatchDryRunWrite_(
      operationPayload.operation,
      operationPayload.payload
    );

  SpreadsheetApp.flush();
  Utilities.sleep(300);

  var afterSnapshot =
    kidlearnV3_3kcSnapshotSheets_(
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS
    );

  var noWriteCheck =
    kidlearnV3_3kcCompareNoWrite_(
      beforeSnapshot,
      afterSnapshot
    );

  var errors = [];

  if (!dispatch.success) {
    errors.push(
      'DRY_RUN dispatch thất bại: ' +
      kidlearnV3_3kcGetErrorMessage_(
        dispatch
      )
    );
  }

  errors =
    errors.concat(
      noWriteCheck.errors || []
    );

  var result = {
    success: errors.length === 0,
    action: 'RUN_LEARNING_ACTION_DRY_RUN_3KC_V3',
    bundle: '3K-C',
    phase: '3K.6_3K.7_3K.8',
    actionCode: actionCode,
    operation:
      operationPayload.operation,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    transactionId:
      context.transactionId,
    errorCount: errors.length,
    errors: errors,
    context: context,
    operationPayload: operationPayload,
    dispatch: dispatch,
    noWriteCheck: noWriteCheck,
    refreshedDashboard:
      kidlearnV3_refreshLearningDashboard3KCV3(
        req
      )
  };

  kidlearnV3_3kcSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.DRY_RUN_TESTED
      : KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_DRY_RUN_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Learning action DRY_RUN 3K-C lỗi. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Start lesson DRY_RUN.
 */
function kidlearnV3_startLessonDryRun3KCV3() {
  return kidlearnV3_runLearningActionDryRun3KCV3({
    actionCode:
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.START_LESSON
  });
}


/**
 * Update progress DRY_RUN.
 */
function kidlearnV3_updateProgressDryRun3KCV3() {
  return kidlearnV3_runLearningActionDryRun3KCV3({
    actionCode:
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.UPDATE_PROGRESS,
    progressPercent: 35
  });
}


/**
 * Finish lesson DRY_RUN.
 */
function kidlearnV3_finishLessonDryRun3KCV3() {
  return kidlearnV3_runLearningActionDryRun3KCV3({
    actionCode:
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.FINISH_LESSON
  });
}


/**
 * Daily goal DRY_RUN.
 */
function kidlearnV3_dailyGoalDryRun3KCV3() {
  return kidlearnV3_runLearningActionDryRun3KCV3({
    actionCode:
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.UPSERT_DAILY_GOAL
  });
}


/**
 * Run all learning actions in DRY_RUN.
 */
function kidlearnV3_runAllLearningActionsDryRun3KCV3() {
  var preview =
    kidlearnV3_previewLearningActions3KCV3();

  if (!preview.success) {
    throw new Error(
      'Không thể chạy all DRY_RUN 3K-C vì preview chưa đạt. Errors=' +
      preview.errorCount
    );
  }

  var beforeSnapshot =
    kidlearnV3_3kcSnapshotSheets_(
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS
    );

  var actions = [
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.START_LESSON,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.UPDATE_PROGRESS,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.FINISH_LESSON,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.UPSERT_DAILY_GOAL
  ];

  var items = [];
  var errors = [];

  for (var i = 0; i < actions.length; i++) {
    try {
      var item =
        kidlearnV3_3kcRunActionDryRunNoSnapshot_(
          actions[i],
          {}
        );

      items.push(item);

      if (!item.success) {
        errors.push(
          actions[i] +
          ': ' +
          kidlearnV3_3kcGetErrorMessage_(item)
        );
      }

    } catch (error) {
      errors.push(
        actions[i] +
        ': ' +
        String(error.message || error)
      );

      items.push({
        success: false,
        actionCode: actions[i],
        error:
          String(error.message || error)
      });
    }
  }

  SpreadsheetApp.flush();
  Utilities.sleep(500);

  var afterSnapshot =
    kidlearnV3_3kcSnapshotSheets_(
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS
    );

  var noWriteCheck =
    kidlearnV3_3kcCompareNoWrite_(
      beforeSnapshot,
      afterSnapshot
    );

  errors =
    errors.concat(
      noWriteCheck.errors || []
    );

  var result = {
    success: errors.length === 0,
    action: 'RUN_ALL_LEARNING_ACTIONS_DRY_RUN_3KC_V3',
    bundle: '3K-C',
    phase: KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.PHASE,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    actionCount: actions.length,
    errorCount: errors.length,
    errors: errors,
    items: items,
    noWriteCheck: noWriteCheck,
    refreshedDashboard:
      kidlearnV3_refreshLearningDashboard3KCV3({})
  };

  kidlearnV3_3kcSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.DRY_RUN_TESTED
      : KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_DRY_RUN_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Run all learning actions DRY_RUN 3K-C lỗi. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Refresh Learning Dashboard after action.
 */
function kidlearnV3_refreshLearningDashboard3KCV3(request) {
  var req =
    kidlearnV3_3kcNormalizeRequest_(
      request
    );

  var screen =
    kidlearnV3_buildLearningScreen3KBV3(
      req
    );

  var result = {
    success: true,
    action: 'REFRESH_LEARNING_DASHBOARD_3KC_V3',
    bundle: '3K-C',
    phase: '3K.9',
    readOnly: true,
    writeMode: 'DRY_RUN_ONLY',
    refreshedAt:
      new Date().toISOString(),
    dashboard: {
      screenId:
        screen.screenId || '',
      childName:
        screen.header &&
        screen.header.child
          ? screen.header.child.childName
          : '',
      selectedSubjectId:
        screen.subjectRail
          ? screen.subjectRail.selectedSubjectId
          : '',
      selectedLessonId:
        screen.lessonList
          ? screen.lessonList.selectedLessonId
          : '',
      subjectsCount:
        screen.diagnostics
          ? screen.diagnostics.subjectsCount
          : 0,
      lessonsCount:
        screen.diagnostics
          ? screen.diagnostics.lessonsCount
          : 0,
      assignmentsCount:
        screen.diagnostics
          ? screen.diagnostics.assignmentsCount
          : 0,
      hasLesson:
        screen.lessonPlayer
          ? screen.lessonPlayer.hasLesson
          : false
    },
    safeWriteStatus:
      kidlearnV3_3kcSafeWriteStatus_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Smoke test 3K-C.
 */
function kidlearnV3_smokeTestLearningActions3KCV3() {
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewLearningActions3KCV3();

  if (!preview.success) {
    throw new Error(
      'Không thể smoke test 3K-C vì preview chưa đạt. Errors=' +
      preview.errorCount
    );
  }

  var runAll =
    kidlearnV3_runAllLearningActionsDryRun3KCV3();

  if (!runAll.success) {
    errors.push(
      'Run all DRY_RUN 3K-C không success.'
    );
  }

  if (
    runAll.noWriteCheck &&
    runAll.noWriteCheck.success !== true
  ) {
    errors =
      errors.concat(
        runAll.noWriteCheck.errors || []
      );
  }

  var dashboard =
    kidlearnV3_refreshLearningDashboard3KCV3({});

  if (!dashboard.success) {
    errors.push(
      'Refresh dashboard 3K-C không success.'
    );
  }

  var safeWrite =
    kidlearnV3_3kcSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Sau smoke test 3K-C, Safe Write phải ở DRY_RUN/enabled=false.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_LEARNING_ACTIONS_3KC_V3',
    bundle: '3K-C',
    phase: KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.NEXT_BUNDLE,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    runAllSummary: {
      success: runAll.success,
      actionCount: runAll.actionCount,
      errorCount: runAll.errorCount
    },
    dashboard: dashboard.dashboard,
    safeWriteStatus: safeWrite
  };

  kidlearnV3_3kcSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.SMOKE_TESTED
      : KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_SMOKE_TEST_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test 3K-C chưa đạt. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 3K-C ready.
 */
function kidlearnV3_markLearningActions3KCReadyV3() {
  var smoke =
    kidlearnV3_smokeTestLearningActions3KCV3();

  if (!smoke.success) {
    throw new Error(
      'Không thể mark 3K-C ready vì smoke test chưa pass.'
    );
  }

  var result = {
    success: true,
    action: 'MARK_LEARNING_ACTIONS_3KC_READY_V3',
    bundle: '3K-C',
    phase: KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.PHASE,
    status:
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.READY_FOR_3K_D,
    nextBundle:
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.NEXT_BUNDLE,
    message:
      '3K-C đã ready. Có thể chuyển sang 3K-D để test UI learning flow end-to-end.'
  };

  kidlearnV3_3kcSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.READY_FOR_3K_D,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Get 3K-C status.
 */
function kidlearnV3_getLearningActions3KCStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_LEARNING_ACTIONS_3KC_STATUS_V3',
    bundle: '3K-C',
    phase: KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.STATUS
      ) ||
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastDryRunAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_DRY_RUN_AT
      ) ||
      '',
    lastSmokeTestAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_SMOKE_TEST_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3kcReadLastResult_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3K-C ready.
 */
function kidlearnV3_assertLearningActions3KCReadyV3() {
  var status =
    kidlearnV3_getLearningActions3KCStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.READY_FOR_3K_D
  ) {
    errors.push(
      '3K-C chưa READY_FOR_3K_D. Status hiện tại=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_LEARNING_ACTIONS_3KC_READY_V3',
    bundle: '3K-C',
    phase: KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.NEXT_BUNDLE,
    errorCount: errors.length,
    errors: errors
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3K-C chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Internal run action without snapshot.
 */
function kidlearnV3_3kcRunActionDryRunNoSnapshot_(
  actionCode,
  request
) {
  var req =
    kidlearnV3_3kcNormalizeRequest_(
      request
    );

  var context =
    kidlearnV3_3kcBuildActionContext_(
      req
    );

  var operationPayload =
    kidlearnV3_3kcBuildOperationPayload_(
      actionCode,
      context,
      req
    );

  var dispatch =
    kidlearnV3_3kcDispatchDryRunWrite_(
      operationPayload.operation,
      operationPayload.payload
    );

  return {
    success: dispatch.success === true,
    actionCode: actionCode,
    operation:
      operationPayload.operation,
    transactionId:
      context.transactionId,
    dispatch: dispatch
  };
}


/**
 * Build action context from 3K-B screen.
 */
function kidlearnV3_3kcBuildActionContext_(request) {
  var req =
    kidlearnV3_3kcNormalizeRequest_(
      request
    );

  var screen =
    kidlearnV3_buildLearningScreen3KBV3(
      req
    );

  var child =
    screen.header && screen.header.child
      ? screen.header.child
      : {};

  var lesson =
    screen.lessonPlayer && screen.lessonPlayer.lesson
      ? screen.lessonPlayer.lesson
      : {};

  var selectedSubjectId =
    screen.subjectRail
      ? screen.subjectRail.selectedSubjectId
      : '';

  var transactionId =
    kidlearnV3_3kcMakeTransactionId_();

  var today =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );

  return {
    transactionId: transactionId,
    childId:
      req.childId ||
      child.childId ||
      'DEV_CHILD_3KC',
    childName:
      child.childName || '',
    lessonId:
      req.lessonId ||
      lesson.lessonId ||
      'DEV_SAMPLE_LESSON_3KC',
    lessonTitle:
      lesson.lessonTitle || '',
    subjectId:
      req.subjectId ||
      lesson.subjectId ||
      selectedSubjectId ||
      'DEV_SAMPLE_SUBJECT_3KC',
    topicId:
      lesson.topicId || '',
    studySessionId:
      req.studySessionId ||
      'DRYRUN_SESSION_' + transactionId,
    progressPercent:
      Number(req.progressPercent || 35),
    goalDate:
      req.goalDate || today,
    targetMinutes:
      Number(req.targetMinutes || 20),
    completedMinutes:
      Number(req.completedMinutes || 5),
    source:
      'LEARNING_ACTIONS_3KC_DRY_RUN'
  };
}


/**
 * Build operation payload.
 */
function kidlearnV3_3kcBuildOperationPayload_(
  actionCode,
  context,
  request
) {
  var now =
    new Date().toISOString();

  if (
    actionCode ===
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.START_LESSON
  ) {
    return {
      operation: 'START_STUDY_SESSION',
      payload: {
        childId: context.childId,
        lessonId: context.lessonId,
        subjectId: context.subjectId,
        topicId: context.topicId,
        startedAt: now,
        status: 'IN_PROGRESS',
        source: context.source,
        transactionId: context.transactionId,
        notes:
          '3K-C DRY_RUN Start Lesson. Không ghi thật DB.'
      }
    };
  }

  if (
    actionCode ===
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.UPDATE_PROGRESS
  ) {
    return {
      operation: 'UPSERT_LESSON_PROGRESS',
      payload: {
        childId: context.childId,
        lessonId: context.lessonId,
        subjectId: context.subjectId,
        status: 'IN_PROGRESS',
        progressPercent: context.progressPercent,
        lastStudiedAt: now,
        source: context.source,
        transactionId: context.transactionId,
        notes:
          '3K-C DRY_RUN Update Progress. Không ghi thật DB.'
      }
    };
  }

  if (
    actionCode ===
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.FINISH_LESSON
  ) {
    return {
      operation: 'FINISH_STUDY_SESSION',
      payload: {
        studySessionId: context.studySessionId,
        childId: context.childId,
        lessonId: context.lessonId,
        subjectId: context.subjectId,
        finishedAt: now,
        status: 'COMPLETED',
        source: context.source,
        transactionId: context.transactionId,
        notes:
          '3K-C DRY_RUN Finish Lesson. Không ghi thật DB.'
      }
    };
  }

  if (
    actionCode ===
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.UPSERT_DAILY_GOAL
  ) {
    return {
      operation: 'UPSERT_DAILY_GOAL',
      payload: {
        childId: context.childId,
        goalDate: context.goalDate,
        targetMinutes: context.targetMinutes,
        completedMinutes: context.completedMinutes,
        status: 'ACTIVE',
        source: context.source,
        transactionId: context.transactionId,
        notes:
          '3K-C DRY_RUN Daily Goal. Không ghi thật DB.'
      }
    };
  }

  throw new Error(
    'ActionCode không hỗ trợ ở 3K-C: ' +
    actionCode
  );
}


/**
 * Dispatch DRY_RUN write.
 *
 * Bản sửa 3K-C:
 * - Không đi qua UI Real Write Gate 3J-A nữa.
 * - Gọi trực tiếp Write Service ở dryRun=true.
 * - Vẫn kiểm tra Safe Write đang ở DRY_RUN/enabled=false.
 */
function kidlearnV3_3kcDispatchDryRunWrite_(
  operation,
  payload
) {
  try {
    var safeWrite =
      kidlearnV3_3kcSafeWriteStatus_();

    if (
      safeWrite.mode !== 'DRY_RUN' ||
      safeWrite.enabled !== false
    ) {
      return {
        success: false,
        method: 'WRITE_SERVICE_DRY_RUN_DIRECT',
        operation: operation,
        error:
          'Safe Write phải ở DRY_RUN/enabled=false trước khi chạy 3K-C. mode=' +
          safeWrite.mode +
          ', enabled=' +
          safeWrite.enabled,
        safeWriteStatus: safeWrite
      };
    }

    var writeResponse =
      kidlearnV3_writeServiceSubmitV3({
        operation: operation,
        dryRun: true,
        payload: payload,
        source: 'LEARNING_ACTIONS_3KC_DRY_RUN_DIRECT'
      });

    return {
      success:
        writeResponse &&
        writeResponse.success === true,
      method: 'WRITE_SERVICE_DRY_RUN_DIRECT',
      operation: operation,
      response: writeResponse,
      safeWriteStatus: safeWrite
    };

  } catch (error) {
    return {
      success: false,
      method: 'WRITE_SERVICE_DRY_RUN_DIRECT',
      operation: operation,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Check target sheets.
 */
function kidlearnV3_3kcCheckTargetSheets_() {
  var errors = [];
  var items = [];

  var spreadsheet =
    kidlearnV3_3kcGetDatabaseSpreadsheet_();

  for (
    var i = 0;
    i < KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS[i];

    var sheet =
      kidlearnV3_3kcGetSheet_(
        spreadsheet,
        sheetName
      );

    if (!sheet) {
      errors.push(
        'Thiếu target sheet: ' +
        sheetName
      );

      items.push({
        sheetName: sheetName,
        exists: false
      });

      continue;
    }

    items.push({
      sheetName: sheetName,
      exists: true,
      lastRow: sheet.getLastRow(),
      lastColumn: sheet.getLastColumn()
    });
  }

  return {
    errors: errors,
    items: items
  };
}


/**
 * Snapshot sheets.
 */
function kidlearnV3_3kcSnapshotSheets_(sheetNames) {
  var spreadsheet =
    kidlearnV3_3kcGetDatabaseSpreadsheet_();

  var items = [];

  for (var i = 0; i < sheetNames.length; i++) {
    items.push(
      kidlearnV3_3kcSnapshotSheet_(
        spreadsheet,
        sheetNames[i]
      )
    );
  }

  return {
    capturedAt:
      new Date().toISOString(),
    items: items
  };
}


/**
 * Snapshot one sheet.
 */
function kidlearnV3_3kcSnapshotSheet_(
  spreadsheet,
  sheetName
) {
  var sheet =
    kidlearnV3_3kcGetSheet_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return {
      sheetName: sheetName,
      exists: false,
      lastRow: 0,
      lastColumn: 0,
      checksum: ''
    };
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  var values = [];

  if (
    lastRow > 0 &&
    lastColumn > 0
  ) {
    values =
      sheet
        .getRange(
          1,
          1,
          lastRow,
          lastColumn
        )
        .getDisplayValues();
  }

  return {
    sheetName: sheetName,
    exists: true,
    lastRow: lastRow,
    lastColumn: lastColumn,
    checksum:
      kidlearnV3_3kcMd5_(
        JSON.stringify(values)
      )
  };
}


/**
 * Compare no-write.
 */
function kidlearnV3_3kcCompareNoWrite_(
  beforeSnapshot,
  afterSnapshot
) {
  var errors = [];
  var changedSheets = [];

  var beforeMap =
    kidlearnV3_3kcMapSnapshots_(
      beforeSnapshot.items || []
    );

  var afterMap =
    kidlearnV3_3kcMapSnapshots_(
      afterSnapshot.items || []
    );

  for (
    var i = 0;
    i < KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS[i];

    var before =
      beforeMap[sheetName];

    var after =
      afterMap[sheetName];

    if (!before || !after) {
      errors.push(
        'Thiếu snapshot no-write cho sheet: ' +
        sheetName
      );

      continue;
    }

    if (
      before.lastRow !== after.lastRow ||
      before.checksum !== after.checksum
    ) {
      changedSheets.push(sheetName);

      errors.push(
        'DRY_RUN không được làm thay đổi sheet ' +
        sheetName +
        '. beforeLastRow=' +
        before.lastRow +
        ', afterLastRow=' +
        after.lastRow
      );
    }
  }

  return {
    success: errors.length === 0,
    changedSheetCount: changedSheets.length,
    changedSheets: changedSheets,
    errorCount: errors.length,
    errors: errors
  };
}


/**
 * Map snapshots.
 */
function kidlearnV3_3kcMapSnapshots_(items) {
  var map = {};

  for (var i = 0; i < items.length; i++) {
    map[items[i].sheetName] =
      items[i];
  }

  return map;
}


/**
 * Database spreadsheet.
 */
function kidlearnV3_3kcGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3kcResolveSpreadsheet_(
      database
    );

  if (!spreadsheet) {
    throw new Error(
      'Không resolve được Spreadsheet object từ Database V3.'
    );
  }

  return spreadsheet;
}


/**
 * Resolve Spreadsheet.
 */
function kidlearnV3_3kcResolveSpreadsheet_(value) {
  if (!value) {
    return null;
  }

  if (
    typeof value.getSheets === 'function' &&
    typeof value.getId === 'function'
  ) {
    return value;
  }

  if (
    value.spreadsheet &&
    typeof value.spreadsheet.getSheets === 'function'
  ) {
    return value.spreadsheet;
  }

  if (
    value.database &&
    typeof value.database.getSheets === 'function'
  ) {
    return value.database;
  }

  if (
    value.db &&
    typeof value.db.getSheets === 'function'
  ) {
    return value.db;
  }

  if (
    value.spreadsheetObject &&
    typeof value.spreadsheetObject.getSheets === 'function'
  ) {
    return value.spreadsheetObject;
  }

  if (
    value.activeSpreadsheet &&
    typeof value.activeSpreadsheet.getSheets === 'function'
  ) {
    return value.activeSpreadsheet;
  }

  if (value.spreadsheetId) {
    return SpreadsheetApp.openById(value.spreadsheetId);
  }

  if (value.databaseSpreadsheetId) {
    return SpreadsheetApp.openById(value.databaseSpreadsheetId);
  }

  if (
    value.id &&
    typeof value.id === 'string'
  ) {
    return SpreadsheetApp.openById(value.id);
  }

  return null;
}


/**
 * Get exact sheet.
 */
function kidlearnV3_3kcGetSheet_(
  spreadsheet,
  sheetName
) {
  if (
    typeof kidlearnV3_appGetSheetByExactName_ === 'function'
  ) {
    return kidlearnV3_appGetSheetByExactName_(
      spreadsheet,
      sheetName
    );
  }

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
 * Safe assert 3K-B ready.
 */
function kidlearnV3_3kcSafeAssert3KBReady_() {
  try {
    var result =
      kidlearnV3_assertLearningUi3KBReadyV3();

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
 * Safe Write status.
 */
function kidlearnV3_3kcSafeWriteStatus_() {
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
 * Check functions.
 */
function kidlearnV3_3kcCheckFunctions_(names) {
  var errors = [];
  var items = [];

  for (var i = 0; i < names.length; i++) {
    var exists = false;

    try {
      exists =
        eval(
          'typeof ' +
          names[i] +
          ' === "function"'
        );
    } catch (error) {
      exists = false;
    }

    items.push({
      name: names[i],
      exists: exists
    });

    if (!exists) {
      errors.push(
        'Thiếu function: ' +
        names[i]
      );
    }
  }

  return {
    errors: errors,
    items: items
  };
}


/**
 * Save result.
 */
function kidlearnV3_3kcSaveResult_(
  result,
  status,
  dateKey
) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.READY_FOR_3K_D &&
    (
      status === KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.DRY_RUN_TESTED ||
      status === KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.SMOKE_TESTED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.READY_FOR_3K_D;
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      errors: result.errors || [],
      warnings: result.warnings || [],
      at: new Date().toISOString()
    })
  );
}


/**
 * Read last result.
 */
function kidlearnV3_3kcReadLastResult_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_RESULT_JSON
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
 * Normalize request.
 */
function kidlearnV3_3kcNormalizeRequest_(request) {
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
 * Error message helper.
 */
function kidlearnV3_3kcGetErrorMessage_(response) {
  if (!response) {
    return 'Không có response.';
  }

  if (
    response.errors &&
    response.errors.length
  ) {
    return response.errors.join(' | ');
  }

  if (
    response.error &&
    response.error.message
  ) {
    return response.error.message;
  }

  if (
    response.response &&
    response.response.error &&
    response.response.error.message
  ) {
    return response.response.error.message;
  }

  if (response.error) {
    return String(response.error);
  }

  return JSON.stringify(response);
}


/**
 * Make transaction ID.
 */
function kidlearnV3_3kcMakeTransactionId_() {
  var text =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss_SSS'
    );

  var random =
    Math.floor(
      Math.random() * 100000
    );

  return (
    'UI_TX_3KC_DRYRUN_' +
    text +
    '_' +
    random
  );
}


/**
 * MD5 checksum.
 */
function kidlearnV3_3kcMd5_(text) {
  var digest =
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.MD5,
      text,
      Utilities.Charset.UTF_8
    );

  var result = '';

  for (var i = 0; i < digest.length; i++) {
    var value =
      digest[i];

    if (value < 0) {
      value += 256;
    }

    result +=
      ('0' + value.toString(16)).slice(-2);
  }

  return result;
}

/**
 * ================================================================
 * 3K-C ULTRA LITE DRY RUN
 * Purpose:
 * - Chạy 4 learning actions DRY_RUN thật nhanh.
 * - Không snapshot full sheet.
 * - Không checksum toàn bộ sheet.
 * - Không build dashboard lặp lại.
 * ================================================================
 */


/**
 * Run all 3K-C learning actions in DRY_RUN - ULTRA LITE.
 */
function kidlearnV3_runLearningActionsDryRunUltraLite3KCV3() {
  var startedAt =
    new Date();

  var errors = [];
  var warnings = [];

  var assert3KB =
    kidlearnV3_assertLearningUi3KBReadyV3();

  if (!assert3KB.success) {
    throw new Error(
      '3K-B chưa ready, không thể chạy 3K-C Ultra Lite.'
    );
  }

  var safeWrite =
    kidlearnV3_3kcSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    throw new Error(
      '3K-C Ultra Lite yêu cầu Safe Write DRY_RUN/enabled=false. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var beforeCounts =
    kidlearnV3_3kcSnapshotRowCountsOnly_(
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS
    );

  var context =
    kidlearnV3_3kcBuildActionContext_({});

  var actions = [
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.START_LESSON,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.UPDATE_PROGRESS,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.FINISH_LESSON,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_ACTIONS.UPSERT_DAILY_GOAL
  ];

  var items = [];

  for (var i = 0; i < actions.length; i++) {
    var actionCode =
      actions[i];

    try {
      var operationPayload =
        kidlearnV3_3kcBuildOperationPayload_(
          actionCode,
          context,
          {}
        );

      var dispatch =
        kidlearnV3_3kcDispatchDryRunWrite_(
          operationPayload.operation,
          operationPayload.payload
        );

      var item = {
        success:
          dispatch.success === true,
        actionCode: actionCode,
        operation:
          operationPayload.operation,
        method:
          dispatch.method || '',
        error:
          dispatch.success === true
            ? ''
            : kidlearnV3_3kcGetErrorMessage_(
                dispatch
              )
      };

      items.push(item);

      if (!item.success) {
        errors.push(
          actionCode +
          ': ' +
          item.error
        );
      }

    } catch (error) {
      errors.push(
        actionCode +
        ': ' +
        String(error.message || error)
      );

      items.push({
        success: false,
        actionCode: actionCode,
        error:
          String(error.message || error)
      });
    }
  }

  SpreadsheetApp.flush();

  var afterCounts =
    kidlearnV3_3kcSnapshotRowCountsOnly_(
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS
    );

  var noWriteCheck =
    kidlearnV3_3kcCompareRowCountsOnly_(
      beforeCounts,
      afterCounts
    );

  errors =
    errors.concat(
      noWriteCheck.errors || []
    );

  var finishedAt =
    new Date();

  var result = {
    success: errors.length === 0,
    action: 'RUN_LEARNING_ACTIONS_DRY_RUN_ULTRA_LITE_3KC_V3',
    bundle: '3K-C',
    phase: KIDLEARN_V3_LEARNING_ACTIONS_3KC_CONFIG.PHASE,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    transactionId:
      context.transactionId,
    startedAt:
      startedAt.toISOString(),
    finishedAt:
      finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    actionCount:
      actions.length,
    errorCount:
      errors.length,
    warningCount:
      warnings.length,
    errors: errors,
    warnings: warnings,
    items: items,
    noWriteCheck:
      noWriteCheck,
    safeWriteStatus:
      kidlearnV3_3kcSafeWriteStatus_()
  };

  kidlearnV3_3kcSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.DRY_RUN_TESTED
      : KIDLEARN_V3_LEARNING_ACTIONS_3KC_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_ACTIONS_3KC_KEYS.LAST_DRY_RUN_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3K-C Ultra Lite failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Snapshot row counts only.
 */
function kidlearnV3_3kcSnapshotRowCountsOnly_(
  sheetNames
) {
  var spreadsheet =
    kidlearnV3_3kcGetDatabaseSpreadsheet_();

  var items = [];

  for (var i = 0; i < sheetNames.length; i++) {
    var sheetName =
      sheetNames[i];

    var sheet =
      kidlearnV3_3kcGetSheet_(
        spreadsheet,
        sheetName
      );

    if (!sheet) {
      items.push({
        sheetName: sheetName,
        exists: false,
        lastRow: 0,
        lastColumn: 0
      });

      continue;
    }

    items.push({
      sheetName: sheetName,
      exists: true,
      lastRow:
        sheet.getLastRow(),
      lastColumn:
        sheet.getLastColumn()
    });
  }

  return {
    capturedAt:
      new Date().toISOString(),
    items: items
  };
}


/**
 * Compare row counts only.
 */
function kidlearnV3_3kcCompareRowCountsOnly_(
  beforeSnapshot,
  afterSnapshot
) {
  var errors = [];
  var changedSheets = [];

  var beforeMap =
    kidlearnV3_3kcMapSnapshots_(
      beforeSnapshot.items || []
    );

  var afterMap =
    kidlearnV3_3kcMapSnapshots_(
      afterSnapshot.items || []
    );

  for (
    var i = 0;
    i < KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_LEARNING_ACTIONS_3KC_TARGET_SHEETS[i];

    var before =
      beforeMap[sheetName];

    var after =
      afterMap[sheetName];

    if (!before || !after) {
      errors.push(
        'Thiếu row-count snapshot cho sheet: ' +
        sheetName
      );

      continue;
    }

    if (before.exists !== after.exists) {
      changedSheets.push(sheetName);

      errors.push(
        sheetName +
        ' thay đổi trạng thái exists trong DRY_RUN.'
      );

      continue;
    }

    if (
      before.lastRow !== after.lastRow ||
      before.lastColumn !== after.lastColumn
    ) {
      changedSheets.push(sheetName);

      errors.push(
        'DRY_RUN không được đổi row/column count của ' +
        sheetName +
        '. before=' +
        before.lastRow +
        'x' +
        before.lastColumn +
        ', after=' +
        after.lastRow +
        'x' +
        after.lastColumn
      );
    }
  }

  return {
    success: errors.length === 0,
    changedSheetCount:
      changedSheets.length,
    changedSheets:
      changedSheets,
    errorCount:
      errors.length,
    errors:
      errors
  };
}