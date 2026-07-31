/**
 * ================================================================
 * KIDLEARN V3 - LEARNING INTERACTION DRY RUN UI
 * Bundle: 3L-C
 * Step:
 * - 3L-C: Learning Interaction DRY_RUN UI
 * Version: 3.1.0
 * ================================================================
 *
 * 3L-C:
 * - DRY_RUN ONLY
 * - Không ghi DB thật
 * - Không real write
 * - Không rollback
 * - Không migration
 * - Không close phase
 */


var KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3LC_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3LC_LAST_PREVIEW_AT',
  LAST_BUILD_AT: 'KIDLEARN_V3_PHASE_3LC_LAST_BUILD_AT',
  LAST_DRY_RUN_AT: 'KIDLEARN_V3_PHASE_3LC_LAST_DRY_RUN_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3LC_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3LC_LAST_RESULT_JSON'
};


var KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  PAYLOAD_BUILT: 'PAYLOAD_BUILT',
  DRY_RUN_TESTED: 'DRY_RUN_TESTED',
  READY_FOR_3L_D: 'READY_FOR_3L_D',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG = {
  VERSION: '3L-C',
  PHASE: '3L-C',
  NEXT_BUNDLE: '3L-D',
  SCREEN_ID: 'LEARNING_INTERACTION_3LC',
  WRITE_MODE: 'DRY_RUN_ONLY',
  READ_ONLY: false,
  WRITE_ENABLED: false,
  REAL_WRITE_ALLOWED: false
};


var KIDLEARN_V3_LEARNING_INTERACTION_3LC_ACTIONS = {
  START_LESSON: 'START_LESSON',
  COMPLETE_BLOCK: 'COMPLETE_BLOCK',
  SUBMIT_ANSWER: 'SUBMIT_ANSWER',
  FINISH_LESSON: 'FINISH_LESSON'
};


var KIDLEARN_V3_LEARNING_INTERACTION_3LC_TARGET_SHEETS = [
  'LOG_Audit',
  'DATA_StudySessions',
  'DATA_LessonProgress',
  'DATA_DailyGoals',
  'DATA_Assignments'
];


/**
 * Preview 3L-C.
 */
function kidlearnV3_previewLearningInteraction3LCV3() {
  var errors = [];
  var warnings = [];

  var functionChecks =
    kidlearnV3_3lcCheckFunctions_([
      'kidlearnV3_assertLessonContent3LBReadyV3',
      'kidlearnV3_buildLessonContentUltraLite3LBV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_writeServiceSubmitV3',
      'kidlearnV3_appGetActiveDatabaseV3_',
      'kidlearnV3_runQaBatchProvidedStepsV3',
      'kidlearnV3_uiInclude_'
    ]);

  errors =
    errors.concat(
      functionChecks.errors
    );

  var htmlChecks =
    kidlearnV3_3lcCheckHtmlFiles_([
      'UI_Learning_Interaction_3LC_Client_V3',
      'UI_Learning_Interaction_3LC'
    ]);

  errors =
    errors.concat(
      htmlChecks.errors
    );

  var phase3LB =
    kidlearnV3_3lcSafeAssert3LBReady_();

  if (!phase3LB.success) {
    errors.push(
      '3L-B chưa READY_FOR_3L_C: ' +
      phase3LB.message
    );
  }

  var safeWrite =
    kidlearnV3_3lcSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      '3L-C yêu cầu Safe Write DRY_RUN/enabled=false. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var sheetCheck =
    kidlearnV3_3lcCheckTargetSheets_();

  errors =
    errors.concat(
      sheetCheck.errors
    );

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_LEARNING_INTERACTION_3LC_V3',
    bundle: '3L-C',
    phase: KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.NEXT_BUNDLE,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3LB: phase3LB,
    safeWriteStatus: safeWrite,
    functionChecks: functionChecks.items,
    htmlChecks: htmlChecks.items,
    targetSheets: sheetCheck.items
  };

  kidlearnV3_3lcSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.PREVIEWED,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_PREVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Build interaction payload.
 */
function kidlearnV3_buildLearningInteractionPayload3LCV3(request) {
  var req =
    kidlearnV3_3lcNormalizeRequest_(
      request
    );

  var preview =
    kidlearnV3_previewLearningInteraction3LCV3();

  if (!preview.success) {
    throw new Error(
      'Không thể build interaction 3L-C vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var payload =
    kidlearnV3_buildLearningInteractionPayloadUltraLite3LCV3(
      req
    );

  kidlearnV3_3lcSaveResult_(
    {
      success: true,
      action: 'BUILD_LEARNING_INTERACTION_PAYLOAD_3LC_V3',
      bundle: '3L-C',
      phase: KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.PHASE,
      errorCount: 0,
      warningCount: payload.warningCount || 0,
      warnings: payload.warnings || [],
      diagnostics: payload.diagnostics || {}
    },
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.PAYLOAD_BUILT,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_BUILD_AT
  );

  console.log(
    JSON.stringify(payload, null, 2)
  );

  return payload;
}


/**
 * Build interaction payload Ultra Lite.
 *
 * Không gọi preview để tránh lặp nặng.
 */
function kidlearnV3_buildLearningInteractionPayloadUltraLite3LCV3(request) {
  var req =
    kidlearnV3_3lcNormalizeRequest_(
      request
    );

  var errors = [];
  var warnings = [];

  var lessonContent =
    kidlearnV3_buildLessonContentUltraLite3LBV3(
      req
    );

  if (!lessonContent.success) {
    errors.push(
      'Lesson Content 3L-B trả success=false.'
    );
  }

  if (
    lessonContent.emptyState &&
    lessonContent.emptyState.noLesson
  ) {
    warnings.push(
      'Chưa có lesson thật. 3L-C dùng DEV fallback để test interaction DRY_RUN.'
    );
  }

  var context =
    kidlearnV3_3lcBuildInteractionContext_(
      lessonContent,
      req
    );

  var payload = {
    success: errors.length === 0,
    action: 'BUILD_LEARNING_INTERACTION_PAYLOAD_ULTRA_LITE_3LC_V3',
    bundle: '3L-C',
    phase: KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.PHASE,
    screenId:
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.SCREEN_ID,
    generatedAt:
      new Date().toISOString(),
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    lessonContent: lessonContent,
    interactionContext: context,
    interactionButtons:
      kidlearnV3_3lcBuildInteractionButtons_(
        context
      ),
    guards: {
      dryRunOnly: true,
      safeWriteExpectedMode: 'DRY_RUN',
      realWriteAllowed: false,
      prodTouched: false
    },
    diagnostics: {
      lessonId: context.lessonId,
      childId: context.childId,
      blockCount:
        lessonContent.blocks
          ? lessonContent.blocks.length
          : 0,
      actionCount: 4
    },
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  console.log(
    JSON.stringify(payload, null, 2)
  );

  return payload;
}


/**
 * UI dispatch one interaction in DRY_RUN.
 */
function kidlearnV3_runLearningInteractionDryRun3LCV3(request) {
  var req =
    kidlearnV3_3lcNormalizeRequest_(
      request
    );

  var actionCode =
    String(req.actionCode || '').trim();

  if (!actionCode) {
    throw new Error(
      'Thiếu actionCode cho 3L-C.'
    );
  }

  var safeWrite =
    kidlearnV3_3lcSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    throw new Error(
      '3L-C chỉ cho phép DRY_RUN khi Safe Write mode=DRY_RUN/enabled=false.'
    );
  }

  var beforeCounts =
    kidlearnV3_3lcSnapshotRowCountsOnly_(
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_TARGET_SHEETS
    );

  var payload =
    kidlearnV3_buildLearningInteractionPayloadUltraLite3LCV3(
      req
    );

  var operationPayload =
    kidlearnV3_3lcBuildOperationPayload_(
      actionCode,
      payload.interactionContext,
      req
    );

  var dispatch =
    kidlearnV3_3lcDispatchDryRunWrite_(
      operationPayload.operation,
      operationPayload.payload
    );

  SpreadsheetApp.flush();

  var afterCounts =
    kidlearnV3_3lcSnapshotRowCountsOnly_(
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_TARGET_SHEETS
    );

  var noWriteCheck =
    kidlearnV3_3lcCompareRowCountsOnly_(
      beforeCounts,
      afterCounts
    );

  var errors = [];

  if (!dispatch.success) {
    errors.push(
      'DRY_RUN dispatch thất bại: ' +
      kidlearnV3_3lcGetErrorMessage_(
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
    action: 'RUN_LEARNING_INTERACTION_DRY_RUN_3LC_V3',
    bundle: '3L-C',
    phase: KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.PHASE,
    actionCode: actionCode,
    operation:
      operationPayload.operation,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    transactionId:
      payload.interactionContext.transactionId,
    errorCount: errors.length,
    errors: errors,
    dispatch: dispatch,
    noWriteCheck: noWriteCheck,
    uiState:
      kidlearnV3_3lcBuildUiStateAfterAction_(
        actionCode,
        payload.interactionContext,
        dispatch
      )
  };

  kidlearnV3_3lcSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.DRY_RUN_TESTED
      : KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_DRY_RUN_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3L-C interaction DRY_RUN failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Run all interactions DRY_RUN Ultra Lite.
 */
function kidlearnV3_runAllLearningInteractionsDryRunUltraLite3LCV3() {
  var startedAt =
    new Date();

  var errors = [];
  var items = [];

  var phase3LB =
    kidlearnV3_3lcSafeAssert3LBReady_();

  if (!phase3LB.success) {
    throw new Error(
      '3L-B chưa ready: ' +
      phase3LB.message
    );
  }

  var safeWrite =
    kidlearnV3_3lcSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    throw new Error(
      '3L-C yêu cầu Safe Write DRY_RUN/enabled=false.'
    );
  }

  var beforeCounts =
    kidlearnV3_3lcSnapshotRowCountsOnly_(
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_TARGET_SHEETS
    );

  var payload =
    kidlearnV3_buildLearningInteractionPayloadUltraLite3LCV3({});

  var context =
    payload.interactionContext;

  var actions = [
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_ACTIONS.START_LESSON,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_ACTIONS.COMPLETE_BLOCK,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_ACTIONS.SUBMIT_ANSWER,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_ACTIONS.FINISH_LESSON
  ];

  for (var i = 0; i < actions.length; i++) {
    var actionCode =
      actions[i];

    try {
      var operationPayload =
        kidlearnV3_3lcBuildOperationPayload_(
          actionCode,
          context,
          {}
        );

      var dispatch =
        kidlearnV3_3lcDispatchDryRunWrite_(
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
            : kidlearnV3_3lcGetErrorMessage_(dispatch)
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
    kidlearnV3_3lcSnapshotRowCountsOnly_(
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_TARGET_SHEETS
    );

  var noWriteCheck =
    kidlearnV3_3lcCompareRowCountsOnly_(
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
    action: 'RUN_ALL_LEARNING_INTERACTIONS_DRY_RUN_ULTRA_LITE_3LC_V3',
    bundle: '3L-C',
    phase: KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.PHASE,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    startedAt:
      startedAt.toISOString(),
    finishedAt:
      finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    actionCount: actions.length,
    errorCount: errors.length,
    errors: errors,
    items: items,
    noWriteCheck: noWriteCheck,
    safeWriteStatus:
      kidlearnV3_3lcSafeWriteStatus_()
  };

  kidlearnV3_3lcSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.DRY_RUN_TESTED
      : KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_DRY_RUN_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3L-C run all interactions failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 3L-C ready.
 */
function kidlearnV3_markLearningInteraction3LCReadyV3() {
  var status =
    kidlearnV3_getLearningInteraction3LCStatusV3();

  var allowed = {
    DRY_RUN_TESTED: true,
    READY_FOR_3L_D: true
  };

  if (!allowed[status.status]) {
    throw new Error(
      'Không thể mark 3L-C ready. Status hiện tại=' +
      status.status +
      '. Cần chạy kidlearnV3_runAllLearningInteractionsDryRunUltraLite3LCV3 pass trước.'
    );
  }

  var result = {
    success: true,
    action: 'MARK_LEARNING_INTERACTION_3LC_READY_V3',
    bundle: '3L-C',
    phase: KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.PHASE,
    status:
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.READY_FOR_3L_D,
    nextBundle:
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.NEXT_BUNDLE,
    message:
      '3L-C ready. Có thể chuyển sang 3L-D để post-review và close Phase 3L.'
  };

  kidlearnV3_3lcSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.READY_FOR_3L_D,
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Get 3L-C status.
 */
function kidlearnV3_getLearningInteraction3LCStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_LEARNING_INTERACTION_3LC_STATUS_V3',
    bundle: '3L-C',
    phase: KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.STATUS
      ) ||
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastBuildAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_BUILD_AT
      ) ||
      '',
    lastDryRunAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_DRY_RUN_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3lcReadLastResult_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3L-C ready.
 */
function kidlearnV3_assertLearningInteraction3LCReadyV3() {
  var status =
    kidlearnV3_getLearningInteraction3LCStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.READY_FOR_3L_D
  ) {
    errors.push(
      '3L-C chưa READY_FOR_3L_D. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_LEARNING_INTERACTION_3LC_READY_V3',
    bundle: '3L-C',
    phase: KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_CONFIG.NEXT_BUNDLE,
    errorCount: errors.length,
    errors: errors
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3L-C chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Open UI 3L-C.
 */
function kidlearnV3_showLearningInteraction3LCV3() {
  var preview =
    kidlearnV3_previewLearningInteraction3LCV3();

  if (!preview.success) {
    throw new Error(
      'Learning Interaction 3L-C chưa sẵn sàng. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var html =
    HtmlService
      .createTemplateFromFile(
        'UI_Learning_Interaction_3LC'
      )
      .evaluate()
      .setTitle(
        'KIDLEARN V3 - Learning Interaction 3L-C'
      )
      .setWidth(1250)
      .setHeight(880);

  SpreadsheetApp
    .getUi()
    .showModalDialog(
      html,
      'KIDLEARN V3 - Learning Interaction 3L-C'
    );
}


/**
 * UI get payload.
 */
function kidlearnV3_uiLearningInteraction3LCGetPayloadV3(request) {
  return kidlearnV3_buildLearningInteractionPayloadUltraLite3LCV3(
    request || {}
  );
}


/**
 * UI run action.
 */
function kidlearnV3_uiLearningInteraction3LCRunActionV3(request) {
  return kidlearnV3_runLearningInteractionDryRun3LCV3(
    request || {}
  );
}


/**
 * QA steps 3L-C.
 */
function kidlearnV3_getQaBatchSteps3LCV3() {
  return [
    {
      label: 'Assert 3L-B ready',
      functionName: 'kidlearnV3_assertLessonContent3LBReadyV3'
    },
    {
      label: 'Preview Learning Interaction 3L-C',
      functionName: 'kidlearnV3_previewLearningInteraction3LCV3'
    },
    {
      label: 'Build Interaction Payload Ultra Lite 3L-C',
      functionName: 'kidlearnV3_buildLearningInteractionPayloadUltraLite3LCV3'
    },
    {
      label: 'Run All Interactions DRY_RUN Ultra Lite 3L-C',
      functionName: 'kidlearnV3_runAllLearningInteractionsDryRunUltraLite3LCV3'
    },
    {
      label: 'Mark Learning Interaction 3L-C Ready',
      functionName: 'kidlearnV3_markLearningInteraction3LCReadyV3'
    },
    {
      label: 'Assert Learning Interaction 3L-C Ready',
      functionName: 'kidlearnV3_assertLearningInteraction3LCReadyV3'
    }
  ];
}


/**
 * QA batch 3L-C.
 */
function kidlearnV3_runQaBatch3LCV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3L_C_ULTRA_LITE',
    kidlearnV3_getQaBatchSteps3LCV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build interaction context.
 */
function kidlearnV3_3lcBuildInteractionContext_(lessonContent, request) {
  var req =
    kidlearnV3_3lcNormalizeRequest_(
      request
    );

  var lesson =
    lessonContent.lesson || {};

  var firstBlock =
    lessonContent.blocks && lessonContent.blocks.length > 0
      ? lessonContent.blocks[0]
      : {};

  var firstActivity =
    firstBlock.activities && firstBlock.activities.length > 0
      ? firstBlock.activities[0]
      : {};

  var transactionId =
    kidlearnV3_3lcMakeTransactionId_();

  return {
    transactionId: transactionId,
    childId:
      req.childId ||
      'DEV_CHILD_3LC',
    lessonId:
      req.lessonId ||
      lesson.lessonId ||
      'DEV_LESSON_3LC',
    lessonTitle:
      lesson.lessonTitle || 'DEV Lesson 3L-C',
    subjectId:
      lesson.subjectId ||
      req.subjectId ||
      'DEV_SUBJECT_3LC',
    topicId:
      lesson.topicId ||
      req.topicId ||
      '',
    blockId:
      req.blockId ||
      firstBlock.blockId ||
      'DEV_BLOCK_3LC',
    activityId:
      req.activityId ||
      firstActivity.activityId ||
      'DEV_ACTIVITY_3LC',
    answerText:
      req.answerText ||
      'Đáp án thử nghiệm DRY_RUN',
    studySessionId:
      req.studySessionId ||
      'DRYRUN_SESSION_' + transactionId,
    progressPercent:
      Number(req.progressPercent || 50),
    source:
      'LEARNING_INTERACTION_3LC_DRY_RUN'
  };
}


/**
 * Build interaction buttons.
 */
function kidlearnV3_3lcBuildInteractionButtons_(context) {
  return [
    {
      actionCode: 'START_LESSON',
      label: 'Start Lesson',
      operation: 'START_STUDY_SESSION',
      enabled: true,
      dryRunOnly: true
    },
    {
      actionCode: 'COMPLETE_BLOCK',
      label: 'Complete Block',
      operation: 'UPSERT_LESSON_PROGRESS',
      enabled: true,
      dryRunOnly: true
    },
    {
      actionCode: 'SUBMIT_ANSWER',
      label: 'Submit Answer',
      operation: 'AUDIT_LOG',
      enabled: true,
      dryRunOnly: true
    },
    {
      actionCode: 'FINISH_LESSON',
      label: 'Finish Lesson',
      operation: 'FINISH_STUDY_SESSION',
      enabled: true,
      dryRunOnly: true
    }
  ];
}


/**
 * Build operation payload.
 */
function kidlearnV3_3lcBuildOperationPayload_(
  actionCode,
  context,
  request
) {
  var now =
    new Date().toISOString();

  if (
    actionCode ===
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_ACTIONS.START_LESSON
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
          '3L-C DRY_RUN UI Start Lesson. Không ghi thật DB.'
      }
    };
  }

  if (
    actionCode ===
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_ACTIONS.COMPLETE_BLOCK
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
          '3L-C DRY_RUN UI Complete Block=' +
          context.blockId
      }
    };
  }

  if (
    actionCode ===
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_ACTIONS.SUBMIT_ANSWER
  ) {
    return {
      operation: 'AUDIT_LOG',
      payload: {
        eventType: 'SUBMIT_ACTIVITY_ANSWER_DRY_RUN',
        eventSource: context.source,
        userId: 'DEV_USER_3LC',
        childId: context.childId,
        entityType: 'MST_Activities',
        entityId: context.activityId,
        action: 'SUBMIT_ANSWER_DRY_RUN',
        status: 'DRY_RUN',
        message:
          '3L-C DRY_RUN UI Submit Answer. Không ghi DATA_Responses thật.',
        transactionId: context.transactionId,
        detailsJson:
          JSON.stringify({
            lessonId: context.lessonId,
            blockId: context.blockId,
            activityId: context.activityId,
            answerText: context.answerText
          })
      }
    };
  }

  if (
    actionCode ===
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_ACTIONS.FINISH_LESSON
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
          '3L-C DRY_RUN UI Finish Lesson. Không ghi thật DB.'
      }
    };
  }

  throw new Error(
    'ActionCode không hỗ trợ ở 3L-C: ' +
    actionCode
  );
}


/**
 * Dispatch DRY_RUN write.
 */
function kidlearnV3_3lcDispatchDryRunWrite_(
  operation,
  payload
) {
  try {
    var safeWrite =
      kidlearnV3_3lcSafeWriteStatus_();

    if (
      safeWrite.mode !== 'DRY_RUN' ||
      safeWrite.enabled !== false
    ) {
      return {
        success: false,
        method: 'WRITE_SERVICE_DRY_RUN_DIRECT_3LC',
        operation: operation,
        error:
          'Safe Write phải ở DRY_RUN/enabled=false.',
        safeWriteStatus: safeWrite
      };
    }

    var writeResponse =
      kidlearnV3_writeServiceSubmitV3({
        operation: operation,
        dryRun: true,
        payload: payload,
        source: 'LEARNING_INTERACTION_3LC_DRY_RUN'
      });

    return {
      success:
        writeResponse &&
        writeResponse.success === true,
      method: 'WRITE_SERVICE_DRY_RUN_DIRECT_3LC',
      operation: operation,
      response: writeResponse,
      safeWriteStatus: safeWrite
    };

  } catch (error) {
    return {
      success: false,
      method: 'WRITE_SERVICE_DRY_RUN_DIRECT_3LC',
      operation: operation,
      error:
        String(error.message || error)
    };
  }
}


/**
 * UI state after action.
 */
function kidlearnV3_3lcBuildUiStateAfterAction_(
  actionCode,
  context,
  dispatch
) {
  return {
    actionCode: actionCode,
    dryRunSuccess:
      dispatch.success === true,
    message:
      dispatch.success === true
        ? 'DRY_RUN thành công. Không có dữ liệu thật được ghi.'
        : 'DRY_RUN lỗi.',
    lessonId:
      context.lessonId,
    blockId:
      context.blockId,
    activityId:
      context.activityId,
    progressPercent:
      actionCode === 'COMPLETE_BLOCK'
        ? context.progressPercent
        : 0
  };
}


/**
 * Check target sheets.
 */
function kidlearnV3_3lcCheckTargetSheets_() {
  var errors = [];
  var items = [];

  var spreadsheet =
    kidlearnV3_3lcGetDatabaseSpreadsheet_();

  for (
    var i = 0;
    i < KIDLEARN_V3_LEARNING_INTERACTION_3LC_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_TARGET_SHEETS[i];

    var sheet =
      kidlearnV3_3lcGetSheet_(
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
 * Snapshot row counts only.
 */
function kidlearnV3_3lcSnapshotRowCountsOnly_(
  sheetNames
) {
  var spreadsheet =
    kidlearnV3_3lcGetDatabaseSpreadsheet_();

  var items = [];

  for (var i = 0; i < sheetNames.length; i++) {
    var sheetName =
      sheetNames[i];

    var sheet =
      kidlearnV3_3lcGetSheet_(
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
function kidlearnV3_3lcCompareRowCountsOnly_(
  beforeSnapshot,
  afterSnapshot
) {
  var errors = [];
  var changedSheets = [];

  var beforeMap =
    kidlearnV3_3lcMapSnapshots_(
      beforeSnapshot.items || []
    );

  var afterMap =
    kidlearnV3_3lcMapSnapshots_(
      afterSnapshot.items || []
    );

  for (
    var i = 0;
    i < KIDLEARN_V3_LEARNING_INTERACTION_3LC_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_TARGET_SHEETS[i];

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


/**
 * Map snapshots.
 */
function kidlearnV3_3lcMapSnapshots_(items) {
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
function kidlearnV3_3lcGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3lcResolveSpreadsheet_(
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
function kidlearnV3_3lcResolveSpreadsheet_(value) {
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
    return SpreadsheetApp.openById(
      value.spreadsheetId
    );
  }

  if (value.databaseSpreadsheetId) {
    return SpreadsheetApp.openById(
      value.databaseSpreadsheetId
    );
  }

  if (
    value.id &&
    typeof value.id === 'string'
  ) {
    return SpreadsheetApp.openById(
      value.id
    );
  }

  return null;
}


/**
 * Get exact sheet.
 */
function kidlearnV3_3lcGetSheet_(
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
 * Safe assert 3L-B ready.
 */
function kidlearnV3_3lcSafeAssert3LBReady_() {
  try {
    var result =
      kidlearnV3_assertLessonContent3LBReadyV3();

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
function kidlearnV3_3lcSafeWriteStatus_() {
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
function kidlearnV3_3lcCheckFunctions_(names) {
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
 * Check HTML files.
 */
function kidlearnV3_3lcCheckHtmlFiles_(filenames) {
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
    errors: errors,
    items: items
  };
}


/**
 * Save result.
 */
function kidlearnV3_3lcSaveResult_(
  result,
  status,
  dateKey
) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.READY_FOR_3L_D &&
    (
      status === KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.PAYLOAD_BUILT ||
      status === KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.DRY_RUN_TESTED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_LEARNING_INTERACTION_3LC_STATUS.READY_FOR_3L_D;
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_RESULT_JSON,
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
      noWriteCheck: result.noWriteCheck || null,
      diagnostics: result.diagnostics || null,
      at: new Date().toISOString()
    })
  );
}


/**
 * Read last result.
 */
function kidlearnV3_3lcReadLastResult_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_LEARNING_INTERACTION_3LC_KEYS.LAST_RESULT_JSON
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
function kidlearnV3_3lcNormalizeRequest_(request) {
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
function kidlearnV3_3lcGetErrorMessage_(response) {
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
function kidlearnV3_3lcMakeTransactionId_() {
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
    'UI_TX_3LC_DRYRUN_' +
    text +
    '_' +
    random
  );
}