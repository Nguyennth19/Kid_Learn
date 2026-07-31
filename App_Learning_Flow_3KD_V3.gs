/**
 * ================================================================
 * KIDLEARN V3 - LEARNING FLOW REVIEW & CLOSE
 * Bundle: 3K-D
 * Steps:
 * - 3K.10: E2E Learning Flow DRY_RUN Ultra Lite
 * - 3K.11: Post-review Learning Flow
 * - 3K.12: Close Phase 3K
 * Version: 3.1.0
 * ================================================================
 *
 * 3K-D không ghi dữ liệu học tập thật.
 * QA batch 3K-D chỉ chạy đến READY_TO_CLOSE_3K.
 * Close Phase 3K phải chạy riêng bằng hàm close.
 */


var KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3KD_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3KD_LAST_PREVIEW_AT',
  LAST_E2E_AT: 'KIDLEARN_V3_PHASE_3KD_LAST_E2E_AT',
  LAST_REVIEW_AT: 'KIDLEARN_V3_PHASE_3KD_LAST_REVIEW_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3KD_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3KD_LAST_RESULT_JSON',

  PHASE_3K_CLOSE_STATUS: 'KIDLEARN_V3_PHASE_3K_CLOSE_STATUS',
  PHASE_3K_CLOSED_AT: 'KIDLEARN_V3_PHASE_3K_CLOSED_AT',
  PHASE_3K_NEXT_PHASE: 'KIDLEARN_V3_PHASE_3K_NEXT_PHASE',
  PHASE_3K_CLOSE_RESULT_JSON: 'KIDLEARN_V3_PHASE_3K_CLOSE_RESULT_JSON'
};


var KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  E2E_TESTED: 'E2E_TESTED',
  REVIEW_PASSED: 'REVIEW_PASSED',
  READY_TO_CLOSE_3K: 'READY_TO_CLOSE_3K',
  CLOSED: 'CLOSED',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG = {
  VERSION: '3K-D',
  PHASE: '3K.10_3K.11_3K.12',
  NEXT_PHASE: '3L',
  WRITE_MODE: 'DRY_RUN_ONLY',
  CLOSE_STATUS: 'CLOSED_LOCKED'
};


var KIDLEARN_V3_LEARNING_FLOW_3KD_TARGET_SHEETS = [
  'LOG_Audit',
  'DATA_StudySessions',
  'DATA_LessonProgress',
  'DATA_DailyGoals',
  'DATA_Assignments'
];


/**
 * Preview 3K-D.
 */
function kidlearnV3_previewLearningFlow3KDV3() {
  var errors = [];
  var warnings = [];

  var functionChecks =
    kidlearnV3_3kdCheckFunctions_([
      'kidlearnV3_assertLearningActions3KCReadyV3',
      'kidlearnV3_runLearningActionsDryRunUltraLite3KCV3',
      'kidlearnV3_markLearningActions3KCReadyLiteForBatchV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_appGetActiveDatabaseV3_',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors =
    errors.concat(
      functionChecks.errors
    );

  var phase3KC =
    kidlearnV3_3kdSafeAssert3KCReady_();

  if (!phase3KC.success) {
    errors.push(
      '3K-C chưa READY_FOR_3K_D: ' +
      phase3KC.message
    );
  }

  var safeWrite =
    kidlearnV3_3kdSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      '3K-D yêu cầu Safe Write DRY_RUN/enabled=false. Hiện tại mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var sheetCheck =
    kidlearnV3_3kdCheckTargetSheets_();

  errors =
    errors.concat(
      sheetCheck.errors
    );

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_LEARNING_FLOW_3KD_V3',
    bundle: '3K-D',
    phase: KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG.PHASE,
    nextPhase: KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG.NEXT_PHASE,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    closePhaseIncludedInBatch: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3KC: phase3KC,
    safeWriteStatus: safeWrite,
    functionChecks: functionChecks.items,
    targetSheets: sheetCheck.items
  };

  kidlearnV3_3kdSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.PREVIEWED,
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_PREVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Run E2E Learning Flow 3K-D.
 *
 * Bản Ultra Lite:
 * - Không full checksum.
 * - Không refresh dashboard nhiều lần.
 * - Gọi lại 3K-C Ultra Lite để mô phỏng Start/Progress/Finish/DailyGoal.
 * - Kiểm tra row count không đổi.
 */
function kidlearnV3_runLearningFlowE2E3KDV3() {
  var startedAt =
    new Date();

  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewLearningFlow3KDV3();

  if (!preview.success) {
    throw new Error(
      'Không thể chạy 3K-D E2E vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var beforeCounts =
    kidlearnV3_3kdSnapshotRowCountsOnly_(
      KIDLEARN_V3_LEARNING_FLOW_3KD_TARGET_SHEETS
    );

  var flowResult = null;
  var restore3KCReady = null;

  try {
    flowResult =
      kidlearnV3_runLearningActionsDryRunUltraLite3KCV3();

    if (!flowResult.success) {
      errors.push(
        '3K-C Ultra Lite flow không success.'
      );
    }

  } catch (error) {
    errors.push(
      'Lỗi khi chạy 3K-C Ultra Lite flow: ' +
      String(error.message || error)
    );
  }

  try {
    if (
      typeof kidlearnV3_markLearningActions3KCReadyLiteForBatchV3 === 'function'
    ) {
      restore3KCReady =
        kidlearnV3_markLearningActions3KCReadyLiteForBatchV3();

      if (
        restore3KCReady &&
        restore3KCReady.success === false
      ) {
        warnings.push(
          'Không restore được 3K-C READY bằng lite helper.'
        );
      }
    }

  } catch (restoreError) {
    warnings.push(
      'Restore 3K-C READY warning: ' +
      String(restoreError.message || restoreError)
    );
  }

  SpreadsheetApp.flush();

  var afterCounts =
    kidlearnV3_3kdSnapshotRowCountsOnly_(
      KIDLEARN_V3_LEARNING_FLOW_3KD_TARGET_SHEETS
    );

  var noWriteCheck =
    kidlearnV3_3kdCompareRowCountsOnly_(
      beforeCounts,
      afterCounts
    );

  errors =
    errors.concat(
      noWriteCheck.errors || []
    );

  var safeWrite =
    kidlearnV3_3kdSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Sau 3K-D E2E, Safe Write phải ở DRY_RUN/enabled=false.'
    );
  }

  var finishedAt =
    new Date();

  var result = {
    success: errors.length === 0,
    action: 'RUN_LEARNING_FLOW_E2E_3KD_V3',
    bundle: '3K-D',
    phase: '3K.10',
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    startedAt:
      startedAt.toISOString(),
    finishedAt:
      finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    flowResultSummary:
      flowResult
        ? {
            success: flowResult.success,
            action: flowResult.action,
            actionCount: flowResult.actionCount,
            errorCount: flowResult.errorCount,
            noWriteCheck: flowResult.noWriteCheck
          }
        : null,
    restore3KCReady: restore3KCReady,
    noWriteCheck: noWriteCheck,
    safeWriteStatus: safeWrite
  };

  kidlearnV3_3kdSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.E2E_TESTED
      : KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_E2E_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3K-D E2E failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Post-review 3K-D.
 */
function kidlearnV3_runPostLearningFlowReview3KDV3() {
  var startedAt =
    new Date();

  var errors = [];
  var warnings = [];

  var status =
    kidlearnV3_getLearningFlow3KDStatusV3();

  var allowedStatus = {
    E2E_TESTED: true,
    REVIEW_PASSED: true,
    READY_TO_CLOSE_3K: true,
    CLOSED: true
  };

  if (!allowedStatus[status.status]) {
    errors.push(
      '3K-D chưa có trạng thái hợp lệ để post-review. Status=' +
      status.status
    );
  }

  var last =
    status.lastResult || {};

  if (
    last.action !== 'RUN_LEARNING_FLOW_E2E_3KD_V3' &&
    status.status !== 'REVIEW_PASSED' &&
    status.status !== 'READY_TO_CLOSE_3K' &&
    status.status !== 'CLOSED'
  ) {
    errors.push(
      'Last result không phải E2E 3K-D.'
    );
  }

  if (
    last.noWriteCheck &&
    last.noWriteCheck.success !== true
  ) {
    errors.push(
      'No-write check trong E2E 3K-D chưa pass.'
    );
  }

  var safeWrite =
    kidlearnV3_3kdSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Post-review 3K-D yêu cầu Safe Write DRY_RUN/enabled=false.'
    );
  }

  var controlledWrite =
    kidlearnV3_3kdControlledWriteStatus_();

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    errors.push(
      'Controlled Write vẫn ENABLED, không được review pass.'
    );
  }

  var phase3KC =
    kidlearnV3_3kdSafeAssert3KCReady_();

  if (!phase3KC.success) {
    warnings.push(
      '3K-C assert warning trong post-review: ' +
      phase3KC.message
    );
  }

  var finishedAt =
    new Date();

  var result = {
    success: errors.length === 0,
    action: 'RUN_POST_LEARNING_FLOW_REVIEW_3KD_V3',
    bundle: '3K-D',
    phase: '3K.11',
    decision:
      errors.length === 0
        ? 'READY_TO_CLOSE_PHASE_3K'
        : 'HOLD_PHASE_3K',
    canClosePhase3K:
      errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    statusBeforeReview: status.status,
    safeWriteStatus: safeWrite,
    controlledWriteStatus: controlledWrite,
    phase3KC: phase3KC,
    startedAt:
      startedAt.toISOString(),
    finishedAt:
      finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime()
  };

  kidlearnV3_3kdSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.REVIEW_PASSED
      : KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_REVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Post-review 3K-D failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 3K-D ready to close Phase 3K.
 */
function kidlearnV3_markLearningFlow3KDReadyToCloseV3() {
  var review =
    kidlearnV3_runPostLearningFlowReview3KDV3();

  if (!review.success) {
    throw new Error(
      'Không thể mark 3K-D ready vì review chưa pass.'
    );
  }

  var result = {
    success: true,
    action: 'MARK_LEARNING_FLOW_3KD_READY_TO_CLOSE_V3',
    bundle: '3K-D',
    phase: '3K.11',
    status:
      KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.READY_TO_CLOSE_3K,
    nextManualStep:
      'kidlearnV3_closePhase3KV3',
    nextPhase:
      KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG.NEXT_PHASE,
    message:
      '3K-D đã ready. Có thể chạy riêng close Phase 3K.'
  };

  kidlearnV3_3kdSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.READY_TO_CLOSE_3K,
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3K-D ready to close.
 */
function kidlearnV3_assertLearningFlow3KDReadyToCloseV3() {
  var status =
    kidlearnV3_getLearningFlow3KDStatusV3();

  var errors = [];

  if (
    status.status !==
      KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.READY_TO_CLOSE_3K &&
    status.status !==
      KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.CLOSED
  ) {
    errors.push(
      '3K-D chưa READY_TO_CLOSE_3K/CLOSED. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_LEARNING_FLOW_3KD_READY_TO_CLOSE_V3',
    bundle: '3K-D',
    phase: '3K.11',
    status: status.status,
    nextManualStep:
      'kidlearnV3_closePhase3KV3',
    errorCount: errors.length,
    errors: errors
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3K-D chưa ready to close. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Close Phase 3K.
 *
 * Bước này chạy riêng, không đưa vào QA batch tự động.
 */
function kidlearnV3_closePhase3KV3() {
  var ready =
    kidlearnV3_assertLearningFlow3KDReadyToCloseV3();

  if (!ready.success) {
    throw new Error(
      'Không thể close Phase 3K vì 3K-D chưa ready.'
    );
  }

  var safeWrite =
    kidlearnV3_3kdSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    throw new Error(
      'Không thể close Phase 3K khi Safe Write chưa DRY_RUN/enabled=false.'
    );
  }

  var controlledWrite =
    kidlearnV3_3kdControlledWriteStatus_();

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    throw new Error(
      'Không thể close Phase 3K khi Controlled Write còn ENABLED.'
    );
  }

  var now =
    new Date();

  var closeResult = {
    success: true,
    action: 'CLOSE_PHASE_3K_V3',
    phase: '3K.12',
    status:
      KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG.CLOSE_STATUS,
    closedAt:
      now.toISOString(),
    nextPhase:
      KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG.NEXT_PHASE,
    summary: {
      phase3KA:
        'READY_FOR_3K_B',
      phase3KB:
        'READY_FOR_3K_C',
      phase3KC:
        'READY_FOR_3K_D',
      phase3KD:
        'READY_TO_CLOSE_3K',
      safeWriteMode:
        safeWrite.mode,
      safeWriteEnabled:
        safeWrite.enabled,
      controlledWriteStatus:
        controlledWrite.status || '',
      prodTouched:
        false
    }
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.PHASE_3K_CLOSE_STATUS,
    KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG.CLOSE_STATUS
  );

  properties.setProperty(
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.PHASE_3K_CLOSED_AT,
    now.toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.PHASE_3K_NEXT_PHASE,
    KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG.NEXT_PHASE
  );

  properties.setProperty(
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.PHASE_3K_CLOSE_RESULT_JSON,
    JSON.stringify(closeResult)
  );

  properties.setProperty(
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.STATUS,
    KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.CLOSED
  );

  console.log(
    JSON.stringify(closeResult, null, 2)
  );

  return closeResult;
}


/**
 * Get Phase 3K close status.
 */
function kidlearnV3_getPhase3KCloseStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PHASE_3K_CLOSE_STATUS_V3',
    phase: '3K.12',
    status:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.PHASE_3K_CLOSE_STATUS
      ) ||
      'NOT_CLOSED',
    closedAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.PHASE_3K_CLOSED_AT
      ) ||
      '',
    nextPhase:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.PHASE_3K_NEXT_PHASE
      ) ||
      '',
    closeResult:
      kidlearnV3_3kdReadJsonProperty_(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.PHASE_3K_CLOSE_RESULT_JSON
      ),
    learningFlow3KD:
      kidlearnV3_getLearningFlow3KDStatusV3(),
    safeWriteStatus:
      kidlearnV3_3kdSafeWriteStatus_(),
    controlledWriteStatus:
      kidlearnV3_3kdControlledWriteStatus_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert Phase 3K closed.
 */
function kidlearnV3_assertPhase3KClosedV3() {
  var status =
    kidlearnV3_getPhase3KCloseStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG.CLOSE_STATUS
  ) {
    errors.push(
      'Phase 3K chưa CLOSED_LOCKED. Status=' +
      status.status
    );
  }

  if (status.nextPhase !== '3L') {
    errors.push(
      'Next phase phải là 3L. Hiện tại=' +
      status.nextPhase
    );
  }

  var safeWrite =
    status.safeWriteStatus || {};

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Sau khi close 3K, Safe Write phải DRY_RUN/enabled=false.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PHASE_3K_CLOSED_V3',
    phase: '3K.12',
    status: status.status,
    nextPhase: status.nextPhase,
    errorCount: errors.length,
    errors: errors,
    safeWriteStatus: safeWrite
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Phase 3K chưa close đúng. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Get 3K-D status.
 */
function kidlearnV3_getLearningFlow3KDStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_LEARNING_FLOW_3KD_STATUS_V3',
    bundle: '3K-D',
    phase: KIDLEARN_V3_LEARNING_FLOW_3KD_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.STATUS
      ) ||
      KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastE2EAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_E2E_AT
      ) ||
      '',
    lastReviewAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_REVIEW_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3kdReadJsonProperty_(
        KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * QA steps 3K-D.
 *
 * Không chứa close phase.
 */
function kidlearnV3_getQaBatchSteps3KDV3() {
  return [
    {
      label: 'Assert 3K-C ready',
      functionName: 'kidlearnV3_assertLearningActions3KCReadyV3'
    },
    {
      label: 'Preview 3K-D',
      functionName: 'kidlearnV3_previewLearningFlow3KDV3'
    },
    {
      label: 'Run E2E Learning Flow 3K-D',
      functionName: 'kidlearnV3_runLearningFlowE2E3KDV3'
    },
    {
      label: 'Post-review Learning Flow 3K-D',
      functionName: 'kidlearnV3_runPostLearningFlowReview3KDV3'
    },
    {
      label: 'Mark 3K-D ready to close',
      functionName: 'kidlearnV3_markLearningFlow3KDReadyToCloseV3'
    },
    {
      label: 'Assert 3K-D ready to close',
      functionName: 'kidlearnV3_assertLearningFlow3KDReadyToCloseV3'
    }
  ];
}


/**
 * Run QA batch 3K-D.
 */
function kidlearnV3_runQaBatch3KDV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3K_D_LITE',
    kidlearnV3_getQaBatchSteps3KDV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Check target sheets.
 */
function kidlearnV3_3kdCheckTargetSheets_() {
  var errors = [];
  var items = [];

  var spreadsheet =
    kidlearnV3_3kdGetDatabaseSpreadsheet_();

  for (
    var i = 0;
    i < KIDLEARN_V3_LEARNING_FLOW_3KD_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_LEARNING_FLOW_3KD_TARGET_SHEETS[i];

    var sheet =
      kidlearnV3_3kdGetSheet_(
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
function kidlearnV3_3kdSnapshotRowCountsOnly_(
  sheetNames
) {
  var spreadsheet =
    kidlearnV3_3kdGetDatabaseSpreadsheet_();

  var items = [];

  for (var i = 0; i < sheetNames.length; i++) {
    var sheetName =
      sheetNames[i];

    var sheet =
      kidlearnV3_3kdGetSheet_(
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
      lastRow: sheet.getLastRow(),
      lastColumn: sheet.getLastColumn()
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
function kidlearnV3_3kdCompareRowCountsOnly_(
  beforeSnapshot,
  afterSnapshot
) {
  var errors = [];
  var changedSheets = [];

  var beforeMap =
    kidlearnV3_3kdMapSnapshots_(
      beforeSnapshot.items || []
    );

  var afterMap =
    kidlearnV3_3kdMapSnapshots_(
      afterSnapshot.items || []
    );

  for (
    var i = 0;
    i < KIDLEARN_V3_LEARNING_FLOW_3KD_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_LEARNING_FLOW_3KD_TARGET_SHEETS[i];

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
    changedSheetCount: changedSheets.length,
    changedSheets: changedSheets,
    errorCount: errors.length,
    errors: errors
  };
}


/**
 * Map snapshots.
 */
function kidlearnV3_3kdMapSnapshots_(
  items
) {
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
function kidlearnV3_3kdGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3kdResolveSpreadsheet_(
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
function kidlearnV3_3kdResolveSpreadsheet_(
  value
) {
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
function kidlearnV3_3kdGetSheet_(
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
 * Safe assert 3K-C ready.
 */
function kidlearnV3_3kdSafeAssert3KCReady_() {
  try {
    var result =
      kidlearnV3_assertLearningActions3KCReadyV3();

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
function kidlearnV3_3kdSafeWriteStatus_() {
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
 * Controlled Write status.
 */
function kidlearnV3_3kdControlledWriteStatus_() {
  try {
    if (
      typeof kidlearnV3_getControlledWriteDevStatusV3 === 'function'
    ) {
      var result =
        kidlearnV3_getControlledWriteDevStatusV3();

      result.available = true;

      return result;
    }

    return {
      available: false,
      success: false,
      status: '',
      safeWriteMode: '',
      safeWriteEnabled: false,
      error:
        'Missing kidlearnV3_getControlledWriteDevStatusV3'
    };

  } catch (error) {
    return {
      available: false,
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
 * Check functions.
 */
function kidlearnV3_3kdCheckFunctions_(
  names
) {
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
function kidlearnV3_3kdSaveResult_(
  result,
  status,
  dateKey
) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.READY_TO_CLOSE_3K &&
    (
      status === KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.E2E_TESTED ||
      status === KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.REVIEW_PASSED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.READY_TO_CLOSE_3K;
  }

  if (
    currentStatus === KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.CLOSED
  ) {
    finalStatus =
      KIDLEARN_V3_LEARNING_FLOW_3KD_STATUS.CLOSED;
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_FLOW_3KD_KEYS.LAST_RESULT_JSON,
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
      at: new Date().toISOString()
    })
  );
}


/**
 * Read JSON property.
 */
function kidlearnV3_3kdReadJsonProperty_(
  key
) {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(key);

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