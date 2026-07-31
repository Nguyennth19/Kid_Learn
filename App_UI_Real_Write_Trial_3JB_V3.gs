/**
 * ================================================================
 * KIDLEARN V3 - UI REAL WRITE TRIAL DEV - CLEAN VERSION
 * Bundle: 3J-B
 * Steps:
 * - 3J.12: Run 01 controlled UI real write trial
 * - 3J.13: Post-UI real write review
 * - 3J.14: Close Phase 3J
 * Version: 3.1.0
 * ================================================================
 *
 * Bản CLEAN:
 * - Không cần bấm ARM / ENABLE / RUN riêng lẻ nữa.
 * - Trial chạy atomic trong 1 server execution:
 *   reset -> arm -> enable -> assert -> write -> reset.
 * - Chỉ ghi thật 01 dòng LOG_Audit.
 * - Không ghi StudySessions / LessonProgress / DailyGoals / Assignments.
 * - Không sửa PROD.
 */


var KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3JB_STATUS',
  LAST_RUN_AT: 'KIDLEARN_V3_PHASE_3JB_LAST_RUN_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3JB_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3JB_LAST_RESULT_JSON',
  LAST_TRANSACTION_ID: 'KIDLEARN_V3_PHASE_3JB_LAST_TRANSACTION_ID',
  LAST_REVIEW_AT: 'KIDLEARN_V3_PHASE_3JB_LAST_REVIEW_AT',
  LAST_ROLLBACK_AT: 'KIDLEARN_V3_PHASE_3JB_LAST_ROLLBACK_AT',
  LAST_ROLLBACK_JSON: 'KIDLEARN_V3_PHASE_3JB_LAST_ROLLBACK_JSON',
  PHASE_3J_CLOSE_STATUS: 'KIDLEARN_V3_PHASE_3J_CLOSE_STATUS',
  PHASE_3J_CLOSED_AT: 'KIDLEARN_V3_PHASE_3J_CLOSED_AT',
  PHASE_3J_NEXT_PHASE: 'KIDLEARN_V3_PHASE_3J_NEXT_PHASE',
  PHASE_3J_CLOSE_RESULT_JSON: 'KIDLEARN_V3_PHASE_3J_CLOSE_RESULT_JSON'
};


var KIDLEARN_V3_UI_REAL_TRIAL_3JB_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  ROLLED_BACK: 'ROLLED_BACK',
  REVIEW_PASSED: 'REVIEW_PASSED',
  CLOSED: 'CLOSED'
};


var KIDLEARN_V3_UI_REAL_TRIAL_3JB_CONFIG = {
  VERSION: '3J-B-CLEAN',
  PHASE: '3J.12_3J.13_3J.14',
  TARGET_SHEET: 'LOG_Audit',
  CONFIRM_TRIAL_TEXT: 'CONFIRM_UI_REAL_WRITE_3J_B',
  CONFIRM_ROLLBACK_TEXT: 'CONFIRM_ROLLBACK_UI_3J_B',
  CONFIRM_WRITE_TOKEN: 'CONFIRM_WRITE_V3',
  NEXT_PHASE: '3K'
};


var KIDLEARN_V3_UI_REAL_TRIAL_3JB_TARGET_SHEETS = [
  'LOG_Audit',
  'DATA_StudySessions',
  'DATA_LessonProgress',
  'DATA_DailyGoals',
  'DATA_Assignments'
];


/**
 * Preview Bundle 3J-B.
 */
function kidlearnV3_previewUiRealWriteTrial3JBV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions = [
    'kidlearnV3_assertUiRealWriteGateDryRunReadyV3',
    'kidlearnV3_getControlledWriteDevStatusV3',
    'kidlearnV3_armControlledWriteDevV3',
    'kidlearnV3_enableControlledWriteDevV3',
    'kidlearnV3_assertControlledWriteDevEnabledV3',
    'kidlearnV3_resetControlledWriteDevToDryRunV3',
    'kidlearnV3_getSafeWriteLayerStatusV3',
    'kidlearnV3_writeServiceSubmitV3',
    'kidlearnV3_appGetActiveDatabaseV3_'
  ];

  var functionChecks =
    kidlearnV3_3jbCheckFunctions_(
      requiredFunctions
    );

  errors =
    errors.concat(
      functionChecks.errors
    );

  var gate =
    kidlearnV3_3jbSafeUiGateReady_();

  if (!gate.success) {
    errors.push(
      'UI Real Write Gate 3J-A chưa ready: ' +
      gate.message
    );
  }

  var targetCheck =
    kidlearnV3_3jbCheckTargetSheets_();

  errors =
    errors.concat(
      targetCheck.errors
    );

  warnings =
    warnings.concat(
      targetCheck.warnings
    );

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_UI_REAL_WRITE_TRIAL_3JB_V3',
    bundle: '3J-B',
    version: KIDLEARN_V3_UI_REAL_TRIAL_3JB_CONFIG.VERSION,
    phase: KIDLEARN_V3_UI_REAL_TRIAL_3JB_CONFIG.PHASE,
    targetSheet: 'LOG_Audit',
    trialOperation: 'AUDIT_LOG',
    realWriteScope: 'ONE_LOG_AUDIT_ROW_ONLY',
    mode: 'ATOMIC_RESET_ARM_ENABLE_WRITE_RESET',
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    uiGate3JA: gate,
    safeWriteStatus: kidlearnV3_3jbSafeWriteStatus_(),
    controlledWriteStatus: kidlearnV3_3jbControlledWriteStatus_(),
    targetSheets: targetCheck.items,
    functionChecks: functionChecks.items
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Mở UI trial 3J-B.
 *
 * UI cũ vẫn dùng được, nhưng bản CLEAN khuyến nghị chạy bằng Apps Script.
 */
function kidlearnV3_showUiRealWriteTrial3JBV3() {
  var html =
    HtmlService
      .createTemplateFromFile(
        'UI_Real_Write_Trial_3JB_Dev_V3'
      )
      .evaluate()
      .setTitle(
        'KIDLEARN V3 - UI Real Write Trial 3J-B'
      )
      .setWidth(1200)
      .setHeight(850);

  SpreadsheetApp
    .getUi()
    .showModalDialog(
      html,
      'KIDLEARN V3 - UI Real Write Trial 3J-B'
    );
}


/**
 * Lấy status Bundle 3J-B.
 */
function kidlearnV3_getUiRealWriteTrial3JBStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_UI_REAL_WRITE_TRIAL_3JB_STATUS_V3',
    bundle: '3J-B',
    phase: KIDLEARN_V3_UI_REAL_TRIAL_3JB_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.STATUS
      ) ||
      KIDLEARN_V3_UI_REAL_TRIAL_3JB_STATUS.NOT_RUN,
    lastRunAt:
      properties.getProperty(
        KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.LAST_RUN_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.LAST_READY_AT
      ) ||
      '',
    lastReviewAt:
      properties.getProperty(
        KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.LAST_REVIEW_AT
      ) ||
      '',
    lastTransactionId:
      properties.getProperty(
        KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.LAST_TRANSACTION_ID
      ) ||
      '',
    lastRollbackAt:
      properties.getProperty(
        KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.LAST_ROLLBACK_AT
      ) ||
      '',
    phase3JCloseStatus:
      properties.getProperty(
        KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.PHASE_3J_CLOSE_STATUS
      ) ||
      '',
    safeWriteStatus:
      kidlearnV3_3jbSafeWriteStatus_(),
    controlledWriteStatus:
      kidlearnV3_3jbControlledWriteStatus_(),
    lastResult:
      kidlearnV3_3jbReadLastResult_(),
    lastRollback:
      kidlearnV3_3jbReadLastRollback_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Wrapper cũ: ARM.
 *
 * Bản CLEAN không cần chạy riêng ARM nữa.
 * Hàm vẫn giữ để UI cũ không lỗi.
 */
function kidlearnV3_uiRealWriteTrial3JBArmV3(request) {
  try {
    var reset =
      kidlearnV3_resetControlledWriteDevToDryRunV3();

    var arm =
      kidlearnV3_armControlledWriteDevV3();

    return {
      success: arm.success === true,
      action: 'UI_REAL_WRITE_TRIAL_3JB_ARM_V3',
      bundle: '3J-B',
      phase: '3J.12',
      status: 'ARMED',
      reset: reset,
      arm: arm
    };

  } catch (error) {
    return kidlearnV3_3jbFailure_(
      'UI_REAL_WRITE_TRIAL_3JB_ARM_V3',
      String(error.message || error)
    );
  }
}


/**
 * Wrapper cũ: ENABLE.
 *
 * Bản CLEAN không khuyến nghị chạy riêng ENABLE nữa.
 */
function kidlearnV3_uiRealWriteTrial3JBEnableV3(request) {
  try {
    var enable =
      kidlearnV3_enableControlledWriteDevV3();

    return {
      success: enable.success === true,
      action: 'UI_REAL_WRITE_TRIAL_3JB_ENABLE_V3',
      bundle: '3J-B',
      phase: '3J.12',
      status: 'ENABLED',
      enable: enable
    };

  } catch (error) {
    return kidlearnV3_3jbFailure_(
      'UI_REAL_WRITE_TRIAL_3JB_ENABLE_V3',
      String(error.message || error)
    );
  }
}


/**
 * Helper chạy trial CLEAN từ Apps Script.
 *
 * Chạy hàm này thay vì bấm UI:
 * kidlearnV3_runUiRealWriteTrial3JBCleanV3
 */
function kidlearnV3_runUiRealWriteTrial3JBCleanV3() {
  return kidlearnV3_uiRealWriteTrial3JBExecuteV3({
    confirmText:
      KIDLEARN_V3_UI_REAL_TRIAL_3JB_CONFIG.CONFIRM_TRIAL_TEXT
  });
}


/**
 * Chạy 01 UI real write trial.
 *
 * Bản CLEAN:
 * - Reset DRY_RUN
 * - ARM
 * - ENABLE
 * - Assert ENABLED
 * - Ghi 01 LOG_Audit
 * - Snapshot diff
 * - Auto reset DRY_RUN
 */
function kidlearnV3_uiRealWriteTrial3JBExecuteV3(request) {
  var startedAt =
    new Date();

  var req =
    kidlearnV3_3jbNormalizeRequest_(
      request
    );

  var errors = [];
  var warnings = [];

  var transactionId =
    kidlearnV3_3jbMakeTransactionId_();

  var beforeSnapshot = null;
  var afterSnapshot = null;
  var writeResponse = null;
  var writeInfo = {};
  var diff = {};
  var rollbackPlan = {};
  var resetBefore = null;
  var armResult = null;
  var enableResult = null;
  var assertEnabled = null;
  var autoReset = null;

  try {
    if (
      String(req.confirmText || '').trim() !==
      KIDLEARN_V3_UI_REAL_TRIAL_3JB_CONFIG.CONFIRM_TRIAL_TEXT
    ) {
      throw new Error(
        'Thiếu confirmText=CONFIRM_UI_REAL_WRITE_3J_B.'
      );
    }

    resetBefore =
      kidlearnV3_resetControlledWriteDevToDryRunV3();

    var preview =
      kidlearnV3_previewUiRealWriteTrial3JBV3();

    if (!preview.success) {
      throw new Error(
        'Preview 3J-B chưa đạt. Errors=' +
        preview.errorCount +
        '. ' +
        preview.errors.join(' | ')
      );
    }

    armResult =
      kidlearnV3_armControlledWriteDevV3();

    if (!armResult.success) {
      throw new Error(
        'ARM Controlled Write thất bại.'
      );
    }

    enableResult =
      kidlearnV3_enableControlledWriteDevV3();

    if (!enableResult.success) {
      throw new Error(
        'ENABLE Controlled Write thất bại.'
      );
    }

    assertEnabled =
      kidlearnV3_assertControlledWriteDevEnabledV3();

    if (!assertEnabled.success) {
      throw new Error(
        'Controlled Write chưa ENABLED sau khi enable.'
      );
    }

    beforeSnapshot =
      kidlearnV3_3jbSnapshotSheets_(
        KIDLEARN_V3_UI_REAL_TRIAL_3JB_TARGET_SHEETS
      );

    writeResponse =
      kidlearnV3_writeServiceSubmitV3({
        operation: 'AUDIT_LOG',
        dryRun: false,
        confirmWrite:
          KIDLEARN_V3_UI_REAL_TRIAL_3JB_CONFIG.CONFIRM_WRITE_TOKEN,
        payload: {
          eventType: 'UI_REAL_WRITE_TRIAL_3J_B',
          action: 'UI_REAL_WRITE_TRIAL',
          message:
            '3J-B CLEAN UI real write trial. transactionId=' +
            transactionId,
          entityType: 'UI_REAL_WRITE_TRIAL',
          entityId: transactionId,
          status: 'INFO',
          source: 'UI_REAL_WRITE_TRIAL_3JB_CLEAN',
          transactionId: transactionId,
          referenceId: transactionId,
          notes:
            'Scope=LOG_Audit only; bundle=3J-B; phase=3J.12; transactionId=' +
            transactionId,
          details: {
            bundle: '3J-B',
            version: 'CLEAN',
            phase: '3J.12',
            transactionId: transactionId,
            purpose:
              'Verify one controlled real write through UI DEV gate.',
            scope:
              'LOG_Audit only'
          }
        }
      });

    SpreadsheetApp.flush();
    Utilities.sleep(800);

    afterSnapshot =
      kidlearnV3_3jbSnapshotSheets_(
        KIDLEARN_V3_UI_REAL_TRIAL_3JB_TARGET_SHEETS
      );

    writeInfo =
      kidlearnV3_3jbExtractWriteInfo_(
        writeResponse,
        transactionId
      );

    writeInfo.rowNumber =
      kidlearnV3_3jbFindAuditRowByTransactionId_(
        transactionId
      );

    if (
      writeResponse &&
      writeResponse.success === true &&
      writeInfo.rowNumber >= 3
    ) {
      writeInfo.executed = true;
      writeInfo.dryRun = false;

      if (!writeInfo.targetSheet) {
        writeInfo.targetSheet = 'LOG_Audit';
      }

      if (!writeInfo.writeType) {
        writeInfo.writeType = 'APPEND';
      }
    }

    if (
      !writeResponse ||
      writeResponse.success !== true
    ) {
      errors.push(
        'Write Service submit thất bại: ' +
        kidlearnV3_3jbGetErrorMessage_(
          writeResponse
        )
      );
    }

    if (writeInfo.rowNumber < 3) {
      errors.push(
        'Không tìm thấy row LOG_Audit chứa transactionId sau khi write: ' +
        transactionId
      );
    }

    diff =
      kidlearnV3_3jbCompareTrialDiff_(
        beforeSnapshot,
        afterSnapshot
      );

    errors =
      errors.concat(
        diff.errors || []
      );

    warnings =
      warnings.concat(
        diff.warnings || []
      );

    rollbackPlan =
      kidlearnV3_3jbBuildRollbackPlan_(
        transactionId,
        writeInfo
      );

  } catch (error) {
    errors.push(
      String(error.message || error)
    );
  }

  autoReset =
    kidlearnV3_3jbTryAutoReset_();

  var finishedAt =
    new Date();

  var result = {
    success: errors.length === 0,
    action: 'UI_REAL_WRITE_TRIAL_3JB_EXECUTE_V3',
    bundle: '3J-B',
    version: 'CLEAN',
    phase: '3J.12',
    transactionId: transactionId,
    targetSheet: 'LOG_Audit',
    writeOperation: 'AUDIT_LOG',
    realWriteScope: 'ONE_LOG_AUDIT_ROW_ONLY',
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
    resetBefore: resetBefore,
    armResult: kidlearnV3_3jbCompactActionResult_(armResult),
    enableResult: kidlearnV3_3jbCompactActionResult_(enableResult),
    assertEnabled: kidlearnV3_3jbCompactActionResult_(assertEnabled),
    writeInfo: writeInfo,
    diff: diff,
    rollbackPlan: rollbackPlan,
    autoReset: autoReset,
    checklist:
      kidlearnV3_3jbBuildTrialChecklist_(
        errors,
        warnings,
        diff,
        writeInfo,
        autoReset
      )
  };

  kidlearnV3_3jbSaveTrialResult_(
    result
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Reset sau trial.
 */
function kidlearnV3_resetAfterUiRealWriteTrial3JBV3() {
  var reset =
    kidlearnV3_3jbTryAutoReset_();

  var result = {
    success:
      reset &&
      reset.success === true,
    action: 'RESET_AFTER_UI_REAL_WRITE_TRIAL_3JB_V3',
    bundle: '3J-B',
    phase: '3J.12',
    reset: reset,
    safeWriteStatus:
      kidlearnV3_3jbSafeWriteStatus_(),
    controlledWriteStatus:
      kidlearnV3_3jbControlledWriteStatus_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Post-UI real write review.
 *
 * Không ghi thêm dữ liệu.
 */
function kidlearnV3_runPostUiRealWriteReview3JBV3() {
  var startedAt =
    new Date();

  var errors = [];
  var warnings = [];

  var status =
    kidlearnV3_getUiRealWriteTrial3JBStatusV3();

  var last =
    status.lastResult || {};

  var transactionId =
    status.lastTransactionId ||
    last.transactionId ||
    '';

  if (!transactionId) {
    errors.push(
      'Không tìm thấy transactionId của UI real write trial 3J-B.'
    );
  }

  var safeWrite =
    kidlearnV3_3jbSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Sau UI trial, Safe Write phải ở DRY_RUN/enabled=false. Hiện tại mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var controlledWrite =
    kidlearnV3_3jbControlledWriteStatus_();

  if (controlledWrite.status === 'ENABLED') {
    errors.push(
      'Controlled Write vẫn đang ENABLED sau UI trial.'
    );
  }

  var allowedStatus = {
    PASSED: true,
    REVIEW_PASSED: true,
    CLOSED: true
  };

  if (!allowedStatus[status.status]) {
    errors.push(
      'UI real write trial 3J-B chưa PASSED để review. Status=' +
      status.status
    );
  }

  var dataCheck = {
    success: false,
    skipped: true
  };

  if (transactionId) {
    dataCheck =
      kidlearnV3_3jbCheckTrialDataState_(
        transactionId,
        false
      );

    errors =
      errors.concat(
        dataCheck.errors || []
      );

    warnings =
      warnings.concat(
        dataCheck.warnings || []
      );
  }

  var finishedAt =
    new Date();

  var decision =
    errors.length === 0
      ? 'REVIEW_PASSED_READY_TO_CLOSE_3J'
      : 'HOLD_KEEP_UI_REAL_WRITE_OFF';

  var result = {
    success: errors.length === 0,
    action: 'RUN_POST_UI_REAL_WRITE_REVIEW_3JB_V3',
    bundle: '3J-B',
    phase: '3J.13',
    transactionId: transactionId,
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
    safeWriteStatus: safeWrite,
    controlledWriteStatus: controlledWrite,
    trialStatusBeforeReview: status.status,
    dataCheck: dataCheck,
    decision: {
      decisionCode: decision,
      canClosePhase3J:
        errors.length === 0,
      openUiRealWriteNow: false,
      nextPhase:
        errors.length === 0
          ? '3J.14'
          : ''
    },
    checklist:
      kidlearnV3_3jbBuildPostReviewChecklist_(
        errors,
        warnings,
        dataCheck,
        safeWrite,
        controlledWrite
      )
  };

  kidlearnV3_3jbSaveReviewResult_(
    result
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Mark post review ready.
 */
function kidlearnV3_markPostUiRealWriteReview3JBReadyV3() {
  var review =
    kidlearnV3_runPostUiRealWriteReview3JBV3();

  if (!review.success) {
    throw new Error(
      'Không thể mark 3J-B review ready. Errors: ' +
      review.errorCount +
      '. ' +
      review.errors.join(' | ')
    );
  }

  var now =
    new Date();

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.STATUS,
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_STATUS.REVIEW_PASSED
  );

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.LAST_READY_AT,
    now.toISOString()
  );

  var result = {
    success: true,
    action: 'MARK_POST_UI_REAL_WRITE_REVIEW_3JB_READY_V3',
    bundle: '3J-B',
    phase: '3J.13',
    status: 'REVIEW_PASSED',
    nextStep: '3J.14',
    message:
      '3J-B post-UI real write review đã pass. Có thể close Phase 3J.'
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Rollback UI real write trial 3J-B.
 */
function kidlearnV3_rollbackUiRealWriteTrial3JBV3(request) {
  var req =
    kidlearnV3_3jbNormalizeRequest_(
      request
    );

  if (
    String(req.confirmRollback || '').trim() !==
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_CONFIG.CONFIRM_ROLLBACK_TEXT
  ) {
    throw new Error(
      'Thiếu confirmRollback=CONFIRM_ROLLBACK_UI_3J_B.'
    );
  }

  var status =
    kidlearnV3_getUiRealWriteTrial3JBStatusV3();

  var transactionId =
    status.lastTransactionId ||
    (
      status.lastResult
        ? status.lastResult.transactionId
        : ''
    );

  if (!transactionId) {
    throw new Error(
      'Không tìm thấy transactionId để rollback 3J-B.'
    );
  }

  var spreadsheet =
    kidlearnV3_3jbGetDatabaseSpreadsheet_();

  var sheet =
    kidlearnV3_3jbGetSheet_(
      spreadsheet,
      'LOG_Audit'
    );

  if (!sheet) {
    throw new Error(
      'Không tìm thấy LOG_Audit.'
    );
  }

  var rows =
    kidlearnV3_3jbFindRowsContainingText_(
      sheet,
      transactionId
    );

  if (rows.length < 1) {
    throw new Error(
      'Không tìm thấy row LOG_Audit chứa transactionId: ' +
      transactionId
    );
  }

  for (var i = rows.length - 1; i >= 0; i--) {
    sheet.deleteRow(
      rows[i]
    );
  }

  SpreadsheetApp.flush();
  Utilities.sleep(500);

  var result = {
    success: true,
    action: 'ROLLBACK_UI_REAL_WRITE_TRIAL_3JB_V3',
    bundle: '3J-B',
    phase: '3J.12',
    transactionId: transactionId,
    deletedRows: rows,
    deletedRowCount: rows.length,
    rolledBackAt:
      new Date().toISOString(),
    message:
      'Đã rollback UI real write trial 3J-B bằng cách xóa dòng LOG_Audit test.'
  };

  kidlearnV3_3jbSaveRollback_(
    result
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Helper rollback có confirm sẵn.
 */
function kidlearnV3_confirmRollbackUiRealWriteTrial3JBV3() {
  return kidlearnV3_rollbackUiRealWriteTrial3JBV3({
    confirmRollback:
      KIDLEARN_V3_UI_REAL_TRIAL_3JB_CONFIG.CONFIRM_ROLLBACK_TEXT
  });
}


/**
 * Close Phase 3J.
 */
function kidlearnV3_closePhase3JV3() {
  var assertReview =
    kidlearnV3_assertPostUiRealWriteReview3JBPassedV3();

  if (!assertReview.success) {
    throw new Error(
      'Không thể close Phase 3J. 3J-B review chưa pass.'
    );
  }

  var safeWrite =
    kidlearnV3_3jbSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    throw new Error(
      'Không thể close Phase 3J khi Safe Write chưa ở DRY_RUN.'
    );
  }

  var controlledWrite =
    kidlearnV3_3jbControlledWriteStatus_();

  if (controlledWrite.status === 'ENABLED') {
    throw new Error(
      'Không thể close Phase 3J khi Controlled Write còn ENABLED.'
    );
  }

  var now =
    new Date();

  var closeResult = {
    success: true,
    action: 'CLOSE_PHASE_3J_V3',
    phase: '3J.14',
    status: 'CLOSED_LOCKED',
    closedAt:
      now.toISOString(),
    nextPhase:
      KIDLEARN_V3_UI_REAL_TRIAL_3JB_CONFIG.NEXT_PHASE,
    summary: {
      bundle3JA:
        'UI Real Write Gate designed and tested in DRY_RUN.',
      bundle3JB:
        'One clean atomic UI real write trial completed and reviewed.',
      safeWriteMode:
        safeWrite.mode,
      safeWriteEnabled:
        safeWrite.enabled,
      controlledWriteStatus:
        controlledWrite.status,
      prodTouched:
        false
    }
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.PHASE_3J_CLOSE_STATUS,
    'CLOSED_LOCKED'
  );

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.PHASE_3J_CLOSED_AT,
    now.toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.PHASE_3J_NEXT_PHASE,
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_CONFIG.NEXT_PHASE
  );

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.PHASE_3J_CLOSE_RESULT_JSON,
    JSON.stringify(closeResult)
  );

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.STATUS,
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_STATUS.CLOSED
  );

  console.log(
    JSON.stringify(closeResult, null, 2)
  );

  return closeResult;
}


/**
 * Get Phase 3J close status.
 */
function kidlearnV3_getPhase3JCloseStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PHASE_3J_CLOSE_STATUS_V3',
    phase: '3J.14',
    status:
      properties.getProperty(
        KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.PHASE_3J_CLOSE_STATUS
      ) ||
      '',
    closedAt:
      properties.getProperty(
        KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.PHASE_3J_CLOSED_AT
      ) ||
      '',
    nextPhase:
      properties.getProperty(
        KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.PHASE_3J_NEXT_PHASE
      ) ||
      '',
    closeResult:
      kidlearnV3_3jbReadPhase3JCloseResult_(),
    trial3JBStatus:
      kidlearnV3_getUiRealWriteTrial3JBStatusV3()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert Phase 3J closed.
 */
function kidlearnV3_assertPhase3JClosedV3() {
  var status =
    kidlearnV3_getPhase3JCloseStatusV3();

  var errors = [];

  if (status.status !== 'CLOSED_LOCKED') {
    errors.push(
      'Phase 3J chưa CLOSED_LOCKED. Status=' +
      status.status
    );
  }

  if (status.nextPhase !== '3K') {
    errors.push(
      'Next phase phải là 3K. Hiện tại=' +
      status.nextPhase
    );
  }

  var safeWrite =
    kidlearnV3_3jbSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Sau khi close 3J, Safe Write phải ở DRY_RUN.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PHASE_3J_CLOSED_V3',
    phase: '3J.14',
    errorCount: errors.length,
    errors: errors,
    status: status.status,
    nextPhase: status.nextPhase,
    safeWriteStatus: safeWrite
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Phase 3J chưa close đúng. Errors: ' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Assert post-review pass.
 */
function kidlearnV3_assertPostUiRealWriteReview3JBPassedV3() {
  var status =
    kidlearnV3_getUiRealWriteTrial3JBStatusV3();

  var errors = [];

  if (
    status.status !== 'REVIEW_PASSED' &&
    status.status !== 'CLOSED'
  ) {
    errors.push(
      '3J-B chưa REVIEW_PASSED/CLOSED. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_POST_UI_REAL_WRITE_REVIEW_3JB_PASSED_V3',
    bundle: '3J-B',
    phase: '3J.13',
    errorCount: errors.length,
    errors: errors,
    status: status.status
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3J-B review chưa pass. Errors: ' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Check trial data state.
 */
function kidlearnV3_3jbCheckTrialDataState_(
  transactionId,
  rolledBack
) {
  var errors = [];
  var warnings = [];

  var spreadsheet =
    kidlearnV3_3jbGetDatabaseSpreadsheet_();

  var auditSheet =
    kidlearnV3_3jbGetSheet_(
      spreadsheet,
      'LOG_Audit'
    );

  var auditRows =
    auditSheet
      ? kidlearnV3_3jbFindRowsContainingText_(
          auditSheet,
          transactionId
        )
      : [];

  if (rolledBack) {
    if (auditRows.length > 0) {
      errors.push(
        'Sau rollback, LOG_Audit vẫn còn row transactionId. Found=' +
        auditRows.length
      );
    }

  } else {
    if (auditRows.length < 1) {
      errors.push(
        'LOG_Audit phải có ít nhất 1 row chứa transactionId. Found=0. transactionId=' +
        transactionId
      );
    }

    if (auditRows.length > 1) {
      warnings.push(
        'LOG_Audit có ' +
        auditRows.length +
        ' rows chứa transactionId. Chấp nhận nếu learning sheets không bị tác động.'
      );
    }
  }

  var dataSheetNames = [
    'DATA_StudySessions',
    'DATA_LessonProgress',
    'DATA_DailyGoals',
    'DATA_Assignments'
  ];

  var dataChecks = [];

  for (var i = 0; i < dataSheetNames.length; i++) {
    var sheetName =
      dataSheetNames[i];

    var sheet =
      kidlearnV3_3jbGetSheet_(
        spreadsheet,
        sheetName
      );

    var rows =
      sheet
        ? kidlearnV3_3jbFindRowsContainingText_(
            sheet,
            transactionId
          )
        : [];

    if (rows.length > 0) {
      errors.push(
        sheetName +
        ' không được chứa transactionId của UI audit trial. Found=' +
        rows.length
      );
    }

    dataChecks.push({
      sheetName: sheetName,
      foundTokenCount: rows.length,
      rows: rows
    });
  }

  return {
    success: errors.length === 0,
    transactionId: transactionId,
    rolledBack: rolledBack,
    auditRows: auditRows,
    auditRowCount: auditRows.length,
    dataChecks: dataChecks,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Compare trial diff.
 */
function kidlearnV3_3jbCompareTrialDiff_(
  beforeSnapshot,
  afterSnapshot
) {
  var errors = [];
  var warnings = [];
  var changedSheets = [];
  var rowDeltas = {};

  var beforeMap =
    kidlearnV3_3jbMapSnapshots_(
      beforeSnapshot.items || []
    );

  var afterMap =
    kidlearnV3_3jbMapSnapshots_(
      afterSnapshot.items || []
    );

  for (
    var i = 0;
    i < KIDLEARN_V3_UI_REAL_TRIAL_3JB_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_UI_REAL_TRIAL_3JB_TARGET_SHEETS[i];

    var before =
      beforeMap[sheetName];

    var after =
      afterMap[sheetName];

    if (!before || !after) {
      errors.push(
        'Thiếu snapshot cho sheet: ' +
        sheetName
      );

      continue;
    }

    var rowDelta =
      after.lastRow -
      before.lastRow;

    var checksumChanged =
      after.checksum !== before.checksum;

    rowDeltas[sheetName] = {
      beforeLastRow: before.lastRow,
      afterLastRow: after.lastRow,
      rowDelta: rowDelta,
      checksumChanged: checksumChanged
    };

    if (
      rowDelta !== 0 ||
      checksumChanged
    ) {
      changedSheets.push(
        sheetName
      );
    }

    if (sheetName === 'LOG_Audit') {
      if (rowDelta < 1) {
        errors.push(
          'LOG_Audit phải tăng ít nhất 1 row. Actual=' +
          rowDelta
        );
      }

      if (!checksumChanged) {
        errors.push(
          'LOG_Audit checksum phải đổi.'
        );
      }

      if (rowDelta !== 1) {
        warnings.push(
          'LOG_Audit tăng ' +
          rowDelta +
          ' rows. Chấp nhận nếu learning sheets không bị tác động.'
        );
      }

      continue;
    }

    if (rowDelta !== 0) {
      errors.push(
        sheetName +
        ' không được tăng row. Actual=' +
        rowDelta
      );
    }

    if (checksumChanged) {
      errors.push(
        sheetName +
        ' không được đổi checksum.'
      );
    }
  }

  return {
    success: errors.length === 0,
    changedSheets: changedSheets,
    expectedChangedSheets: ['LOG_Audit'],
    rowDeltas: rowDeltas,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Build trial checklist.
 */
function kidlearnV3_3jbBuildTrialChecklist_(
  errors,
  warnings,
  diff,
  writeInfo,
  autoReset
) {
  return [
    {
      item: 'UI real write trial executed',
      status:
        writeInfo.rowNumber >= 3
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'Only LOG_Audit changed',
      status:
        diff &&
        diff.success === true
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'Auto reset to DRY_RUN',
      status:
        autoReset &&
        autoReset.success === true
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'Rollback plan generated',
      status:
        writeInfo.transactionId
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: '3J.12 result',
      status:
        errors.length === 0
          ? 'PASSED'
          : 'FAILED',
      warningCount:
        warnings.length
    }
  ];
}


/**
 * Build post review checklist.
 */
function kidlearnV3_3jbBuildPostReviewChecklist_(
  errors,
  warnings,
  dataCheck,
  safeWrite,
  controlledWrite
) {
  return [
    {
      item: 'Safe Write reset về DRY_RUN',
      status:
        safeWrite.mode === 'DRY_RUN' &&
        safeWrite.enabled === false
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'Controlled Write không ENABLED',
      status:
        controlledWrite.status !== 'ENABLED'
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'UI trial LOG_Audit traceable',
      status:
        dataCheck.auditRowCount >= 1
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'Không tác động learning data sheets',
      status:
        dataCheck.success
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: '3J.13 result',
      status:
        errors.length === 0
          ? 'PASSED'
          : 'FAILED',
      warningCount:
        warnings.length
    }
  ];
}


/**
 * Snapshot nhiều sheet.
 */
function kidlearnV3_3jbSnapshotSheets_(
  sheetNames
) {
  var spreadsheet =
    kidlearnV3_3jbGetDatabaseSpreadsheet_();

  var items = [];
  var summary = [];

  for (var i = 0; i < sheetNames.length; i++) {
    var item =
      kidlearnV3_3jbSnapshotSheet_(
        spreadsheet,
        sheetNames[i]
      );

    items.push(item);

    summary.push({
      sheetName: item.sheetName,
      exists: item.exists,
      lastRow: item.lastRow,
      lastColumn: item.lastColumn,
      dataRowCount: item.dataRowCount,
      checksum: item.checksum
    });
  }

  return {
    spreadsheetId:
      spreadsheet.getId(),
    spreadsheetName:
      spreadsheet.getName(),
    capturedAt:
      new Date().toISOString(),
    items: items,
    summary: summary
  };
}


/**
 * Snapshot một sheet.
 */
function kidlearnV3_3jbSnapshotSheet_(
  spreadsheet,
  sheetName
) {
  var sheet =
    kidlearnV3_3jbGetSheet_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return {
      sheetName: sheetName,
      exists: false,
      lastRow: 0,
      lastColumn: 0,
      dataRowCount: 0,
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

  var text =
    JSON.stringify({
      sheetName: sheetName,
      lastRow: lastRow,
      lastColumn: lastColumn,
      values: values
    });

  return {
    sheetName: sheetName,
    exists: true,
    lastRow: lastRow,
    lastColumn: lastColumn,
    dataRowCount:
      Math.max(0, lastRow - 2),
    checksum:
      kidlearnV3_3jbMd5_(
        text
      )
  };
}


/**
 * Build rollback plan.
 */
function kidlearnV3_3jbBuildRollbackPlan_(
  transactionId,
  writeInfo
) {
  return {
    rollbackType: 'DELETE_UI_TRIAL_LOG_AUDIT_ROW',
    transactionId: transactionId,
    targetSheet: 'LOG_Audit',
    rowNumber:
      writeInfo.rowNumber || '',
    verifyBeforeDelete: [
      'Row phải chứa transactionId.',
      'Không xóa audit rows khác.',
      'Không xóa learning data.'
    ],
    rollbackFunction:
      'kidlearnV3_rollbackUiRealWriteTrial3JBV3',
    helperRollbackFunction:
      'kidlearnV3_confirmRollbackUiRealWriteTrial3JBV3',
    requiredConfirmRollback:
      KIDLEARN_V3_UI_REAL_TRIAL_3JB_CONFIG.CONFIRM_ROLLBACK_TEXT
  };
}


/**
 * Extract write info.
 */
function kidlearnV3_3jbExtractWriteInfo_(
  response,
  transactionId
) {
  var info = {
    success:
      response &&
      response.success === true,
    executed: false,
    dryRun: true,
    targetSheet: '',
    writeType: '',
    keyField: '',
    keyValue: '',
    rowNumber: '',
    transactionId: transactionId
  };

  try {
    var data =
      response && response.data
        ? response.data
        : {};

    var safeWrite =
      data.safeWrite || {};

    var safeData =
      safeWrite.data || {};

    var plan =
      data.plan ||
      safeData.plan ||
      {};

    var execution =
      safeData.execution || {};

    var executionResult =
      execution.result || {};

    info.executed =
      data.executed === true ||
      safeData.executed === true ||
      execution.executed === true;

    info.dryRun =
      data.dryRun === true ||
      safeData.dryRun === true;

    info.targetSheet =
      plan.targetSheet || '';

    info.writeType =
      plan.writeType || '';

    info.keyField =
      plan.keyField || '';

    info.keyValue =
      plan.keyValue || '';

    info.rowNumber =
      executionResult.rowNumber || '';

  } catch (error) {
    info.extractError =
      String(error.message || error);
  }

  return info;
}


/**
 * Check target sheets.
 */
function kidlearnV3_3jbCheckTargetSheets_() {
  var errors = [];
  var warnings = [];
  var items = [];

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_3jbGetDatabaseSpreadsheet_();

  } catch (error) {
    errors.push(
      'Không mở được Database V3: ' +
      String(error.message || error)
    );

    return {
      errors: errors,
      warnings: warnings,
      items: items
    };
  }

  for (
    var i = 0;
    i < KIDLEARN_V3_UI_REAL_TRIAL_3JB_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_UI_REAL_TRIAL_3JB_TARGET_SHEETS[i];

    var sheet =
      kidlearnV3_3jbGetSheet_(
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
    warnings: warnings,
    items: items
  };
}


/**
 * Auto reset helper.
 */
function kidlearnV3_3jbTryAutoReset_() {
  try {
    var reset =
      kidlearnV3_resetControlledWriteDevToDryRunV3();

    var safeWrite =
      kidlearnV3_3jbSafeWriteStatus_();

    return {
      success:
        safeWrite.mode === 'DRY_RUN' &&
        safeWrite.enabled === false,
      reset: reset,
      safeWriteStatus: safeWrite
    };

  } catch (error) {
    return {
      success: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Save trial result.
 */
function kidlearnV3_3jbSaveTrialResult_(
  result
) {
  var status =
    result.success
      ? KIDLEARN_V3_UI_REAL_TRIAL_3JB_STATUS.PASSED
      : KIDLEARN_V3_UI_REAL_TRIAL_3JB_STATUS.FAILED;

  var compact = {
    success: result.success,
    action: result.action,
    bundle: result.bundle,
    version: result.version,
    phase: result.phase,
    transactionId: result.transactionId,
    targetSheet: result.targetSheet,
    writeOperation: result.writeOperation,
    finishedAt: result.finishedAt,
    durationMs: result.durationMs,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    errors: result.errors,
    warnings: result.warnings,
    armResult: result.armResult,
    enableResult: result.enableResult,
    assertEnabled: result.assertEnabled,
    writeInfo: result.writeInfo,
    diff: result.diff,
    rollbackPlan: result.rollbackPlan,
    autoReset: result.autoReset,
    checklist: result.checklist
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.STATUS,
    status
  );

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.LAST_RUN_AT,
    new Date().toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.LAST_TRANSACTION_ID,
    result.transactionId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.LAST_RESULT_JSON,
    JSON.stringify(compact)
  );
}


/**
 * Save post review result.
 */
function kidlearnV3_3jbSaveReviewResult_(
  result
) {
  var status =
    result.success
      ? KIDLEARN_V3_UI_REAL_TRIAL_3JB_STATUS.REVIEW_PASSED
      : KIDLEARN_V3_UI_REAL_TRIAL_3JB_STATUS.FAILED;

  var compact = {
    success: result.success,
    action: result.action,
    bundle: result.bundle,
    phase: result.phase,
    transactionId: result.transactionId,
    finishedAt: result.finishedAt,
    durationMs: result.durationMs,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    errors: result.errors,
    warnings: result.warnings,
    trialStatusBeforeReview: result.trialStatusBeforeReview,
    dataCheck: result.dataCheck,
    decision: result.decision,
    checklist: result.checklist
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.STATUS,
    status
  );

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.LAST_REVIEW_AT,
    new Date().toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.LAST_RESULT_JSON,
    JSON.stringify(compact)
  );
}


/**
 * Save rollback.
 */
function kidlearnV3_3jbSaveRollback_(
  result
) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.STATUS,
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_STATUS.ROLLED_BACK
  );

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.LAST_ROLLBACK_AT,
    new Date().toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.LAST_ROLLBACK_JSON,
    JSON.stringify(result)
  );
}


/**
 * Read last result.
 */
function kidlearnV3_3jbReadLastResult_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.LAST_RESULT_JSON
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
 * Read last rollback.
 */
function kidlearnV3_3jbReadLastRollback_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.LAST_ROLLBACK_JSON
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
 * Read Phase 3J close result.
 */
function kidlearnV3_3jbReadPhase3JCloseResult_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_UI_REAL_TRIAL_3JB_KEYS.PHASE_3J_CLOSE_RESULT_JSON
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
 * Database spreadsheet.
 */
function kidlearnV3_3jbGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3jbResolveSpreadsheet_(
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
 * Resolve database wrapper.
 */
function kidlearnV3_3jbResolveSpreadsheet_(
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
function kidlearnV3_3jbGetSheet_(
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
 * Find audit row by transactionId.
 */
function kidlearnV3_3jbFindAuditRowByTransactionId_(
  transactionId
) {
  var spreadsheet =
    kidlearnV3_3jbGetDatabaseSpreadsheet_();

  var sheet =
    kidlearnV3_3jbGetSheet_(
      spreadsheet,
      'LOG_Audit'
    );

  if (!sheet) {
    return -1;
  }

  var rows =
    kidlearnV3_3jbFindRowsContainingText_(
      sheet,
      transactionId
    );

  if (rows.length === 0) {
    return -1;
  }

  return rows[rows.length - 1];
}


/**
 * Find all rows containing text.
 */
function kidlearnV3_3jbFindRowsContainingText_(
  sheet,
  text
) {
  var token =
    String(text || '').trim();

  var rows = [];

  if (!token) {
    return rows;
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (
    lastRow < 3 ||
    lastColumn < 1
  ) {
    return rows;
  }

  var values =
    sheet
      .getRange(
        3,
        1,
        lastRow - 2,
        lastColumn
      )
      .getDisplayValues();

  for (var i = 0; i < values.length; i++) {
    var rowText =
      values[i].join(' | ');

    if (rowText.indexOf(token) >= 0) {
      rows.push(
        i + 3
      );
    }
  }

  return rows;
}


/**
 * Map snapshots.
 */
function kidlearnV3_3jbMapSnapshots_(
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
 * Check functions.
 */
function kidlearnV3_3jbCheckFunctions_(
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
 * Safe UI Gate 3J-A assert.
 */
function kidlearnV3_3jbSafeUiGateReady_() {
  try {
    var result =
      kidlearnV3_assertUiRealWriteGateDryRunReadyV3();

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
function kidlearnV3_3jbSafeWriteStatus_() {
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
function kidlearnV3_3jbControlledWriteStatus_() {
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
 * Failure object.
 */
function kidlearnV3_3jbFailure_(
  action,
  message
) {
  var result = {
    success: false,
    action: action,
    bundle: '3J-B',
    phase: KIDLEARN_V3_UI_REAL_TRIAL_3JB_CONFIG.PHASE,
    error: {
      code: 'UI_REAL_WRITE_TRIAL_3JB_ERROR',
      message: message
    }
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Error message helper.
 */
function kidlearnV3_3jbGetErrorMessage_(
  response
) {
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
    response.data &&
    response.data.error &&
    response.data.error.message
  ) {
    return response.data.error.message;
  }

  return JSON.stringify(response);
}


/**
 * Normalize request.
 */
function kidlearnV3_3jbNormalizeRequest_(
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
 * Make transaction ID.
 */
function kidlearnV3_3jbMakeTransactionId_() {
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
    'UI_TX_3JB_CLEAN_' +
    text +
    '_' +
    random
  );
}


/**
 * MD5 checksum.
 */
function kidlearnV3_3jbMd5_(
  text
) {
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
 * Compact result.
 */
function kidlearnV3_3jbCompactActionResult_(
  value
) {
  if (!value) {
    return null;
  }

  return {
    success: value.success === true,
    action: value.action || '',
    status: value.status || '',
    safeWriteMode: value.safeWriteMode || '',
    safeWriteEnabled: value.safeWriteEnabled
  };
}


/**
 * Debug compact 3J-B.
 */
function kidlearnV3_debugPostUiRealWriteReview3JBErrorsCompactV3() {
  var status =
    kidlearnV3_getUiRealWriteTrial3JBStatusV3();

  var last =
    status.lastResult || {};

  var transactionId =
    status.lastTransactionId ||
    last.transactionId ||
    '';

  var dataCheck = null;

  if (transactionId) {
    dataCheck =
      kidlearnV3_3jbCheckTrialDataState_(
        transactionId,
        false
      );
  }

  var result = {
    success: true,
    action: 'DEBUG_POST_UI_REAL_WRITE_REVIEW_3JB_ERRORS_COMPACT_V3',
    bundle: '3J-B',
    currentStatus: status.status,
    transactionId: transactionId,
    safeWriteStatus: {
      mode:
        status.safeWriteStatus
          ? status.safeWriteStatus.mode
          : '',
      enabled:
        status.safeWriteStatus
          ? status.safeWriteStatus.enabled
          : ''
    },
    controlledWriteStatus: {
      status:
        status.controlledWriteStatus
          ? status.controlledWriteStatus.status
          : '',
      safeWriteMode:
        status.controlledWriteStatus
          ? status.controlledWriteStatus.safeWriteMode
          : '',
      safeWriteEnabled:
        status.controlledWriteStatus
          ? status.controlledWriteStatus.safeWriteEnabled
          : ''
    },
    lastResult: {
      success:
        last.success === true,
      action:
        last.action || '',
      phase:
        last.phase || '',
      errorCount:
        last.errorCount || 0,
      warningCount:
        last.warningCount || 0,
      errors:
        last.errors || [],
      warnings:
        last.warnings || [],
      decision:
        last.decision || null,
      writeInfo:
        last.writeInfo || null,
      diff:
        last.diff || null
    },
    dataCheckSummary:
      dataCheck
        ? {
            success: dataCheck.success,
            auditRowCount: dataCheck.auditRowCount,
            auditRows: dataCheck.auditRows,
            errors: dataCheck.errors,
            warnings: dataCheck.warnings,
            dataChecks: dataCheck.dataChecks
          }
        : null
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}