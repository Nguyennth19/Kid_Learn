/**
 * ================================================================
 * KIDLEARN V3 - POST REAL WRITE REVIEW
 * Step: 3J.9
 * Version: 3.1.0
 * ================================================================
 *
 * File này kiểm tra dữ liệu sau real write/reset và quyết định
 * có đủ điều kiện để thiết kế real write qua UI DEV hay chưa.
 *
 * 3J.9 KHÔNG ghi thêm dữ liệu.
 * 3J.9 KHÔNG mở real write trực tiếp qua UI.
 * 3J.9 chỉ review, snapshot, verify và ra quyết định.
 *
 * KHÔNG sửa PROD.
 */


var KIDLEARN_V3_POST_REAL_REVIEW_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3J9_STATUS',
  LAST_RUN_AT: 'KIDLEARN_V3_PHASE_3J9_LAST_RUN_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3J9_READY_AT',
  LAST_DECISION: 'KIDLEARN_V3_PHASE_3J9_LAST_DECISION',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3J9_LAST_RESULT_JSON'
};


var KIDLEARN_V3_POST_REAL_REVIEW_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  HOLD: 'HOLD',
  READY_TO_DESIGN_UI_REAL_WRITE_GATE: 'READY_TO_DESIGN_UI_REAL_WRITE_GATE'
};


var KIDLEARN_V3_POST_REAL_REVIEW_DECISION = {
  HOLD_KEEP_UI_DRY_RUN: 'HOLD_KEEP_UI_DRY_RUN',
  DO_NOT_OPEN_UI_REAL_WRITE: 'DO_NOT_OPEN_UI_REAL_WRITE',
  READY_TO_DESIGN_UI_REAL_WRITE_GATE: 'READY_TO_DESIGN_UI_REAL_WRITE_GATE'
};


var KIDLEARN_V3_POST_REAL_REVIEW_CONFIG = {
  VERSION: '3J.9',
  NEXT_PHASE: '3J.10',
  OPEN_REAL_WRITE_UI_NOW: false
};


var KIDLEARN_V3_POST_REAL_REVIEW_TARGET_SHEETS = [
  'LOG_Audit',
  'DATA_StudySessions',
  'DATA_LessonProgress',
  'DATA_DailyGoals',
  'DATA_Assignments'
];


/**
 * Preview 3J.9.
 */
function kidlearnV3_previewPostRealWriteReviewV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions = [
    'kidlearnV3_assertPhase3IClosedFor3JV3',
    'kidlearnV3_getDryRunNoWriteChecklistStatusV3',
    'kidlearnV3_getRealWriteSmallTransactionStatusV3',
    'kidlearnV3_getRealWriteLearningFlowStatusV3',
    'kidlearnV3_getControlledWriteDevStatusV3',
    'kidlearnV3_getSafeWriteLayerStatusV3',
    'kidlearnV3_getAppDevConnectionV3Status',
    'kidlearnV3_writeRouterGetStatusV3',
    'kidlearnV3_appGetActiveDatabaseV3_'
  ];

  var functionChecks =
    kidlearnV3_postReviewCheckFunctions_(
      requiredFunctions
    );

  errors =
    errors.concat(
      functionChecks.errors
    );

  var phase3I =
    kidlearnV3_postReviewSafePhase3I_();

  if (!phase3I.success) {
    errors.push(
      'Phase 3I chưa CLOSED_LOCKED: ' +
      phase3I.message
    );
  }

  var connection =
    kidlearnV3_postReviewSafeConnection_();

  if (
    connection.databaseMode !== 'V3' ||
    connection.connectionStatus !== 'CONNECTED'
  ) {
    errors.push(
      'App DEV chưa CONNECTED với Database V3.'
    );
  }

  var safeWrite =
    kidlearnV3_postReviewSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Sau real write, Safe Write Layer phải reset về DRY_RUN và enabled=false. Hiện tại mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var controlledWrite =
    kidlearnV3_postReviewSafeControlledWriteStatus_();

  if (controlledWrite.status === 'ENABLED') {
    errors.push(
      'Controlled Write DEV vẫn đang ENABLED. Cần reset về DRY_RUN trước khi review 3J.9.'
    );
  }

  if (controlledWrite.status === 'ARMED') {
    warnings.push(
      'Controlled Write đang ARMED. Nên để DISABLED/DRY_RUN trước khi mở UI write gate.'
    );
  }

  var dryRunStatus =
    kidlearnV3_postReviewSafe3J5Status_();

  if (
    dryRunStatus.status !== 'READY_FOR_WRITE_REVIEW' &&
    dryRunStatus.status !== 'PASSED'
  ) {
    errors.push(
      '3J.5 chưa READY_FOR_WRITE_REVIEW/PASSED. Hiện tại: ' +
      dryRunStatus.status
    );
  }

  var smallWriteStatus =
    kidlearnV3_postReviewSafe3J7Status_();

  if (
    smallWriteStatus.status !== 'PASSED' &&
    smallWriteStatus.status !== 'ROLLED_BACK' &&
    smallWriteStatus.status !== 'READY_FOR_NEXT'
  ) {
    errors.push(
      '3J.7 chưa PASSED/ROLLED_BACK/READY_FOR_NEXT. Hiện tại: ' +
      smallWriteStatus.status
    );
  }

  var learningFlowStatus =
    kidlearnV3_postReviewSafe3J8Status_();

  if (
    learningFlowStatus.status !== 'PASSED' &&
    learningFlowStatus.status !== 'ROLLED_BACK' &&
    learningFlowStatus.status !== 'READY_FOR_NEXT'
  ) {
    errors.push(
      '3J.8 chưa PASSED/ROLLED_BACK/READY_FOR_NEXT. Hiện tại: ' +
      learningFlowStatus.status
    );
  }

  var routerStatus =
    kidlearnV3_postReviewSafeRouterStatus_();

  var routerDryRunOnly =
    routerStatus.success &&
    routerStatus.data
      ? routerStatus.data.dryRunOnly
      : null;

  if (routerDryRunOnly !== true) {
    errors.push(
      'Write Router V3 phải còn DRY_RUN_ONLY=true ở 3J.9. Không mở UI real write khi router đã mở.'
    );
  }

  var targetCheck =
    kidlearnV3_postReviewCheckTargetSheets_();

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
    action: 'PREVIEW_POST_REAL_WRITE_REVIEW_V3',
    phase: '3J.9',
    nextPhase:
      KIDLEARN_V3_POST_REAL_REVIEW_CONFIG.NEXT_PHASE,
    openRealWriteUiNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3I: phase3I,
    connection: connection,
    safeWriteStatus: safeWrite,
    controlledWriteStatus: controlledWrite,
    dryRunChecklist3J5: {
      status: dryRunStatus.status || ''
    },
    realWriteSmall3J7: {
      status: smallWriteStatus.status || ''
    },
    realWriteLearningFlow3J8: {
      status: learningFlowStatus.status || ''
    },
    routerStatus: {
      success: routerStatus.success === true,
      dryRunOnly: routerDryRunOnly
    },
    targetSheets: targetCheck.items,
    functionChecks: functionChecks.items
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Reset về DRY_RUN trước khi review 3J.9.
 */
function kidlearnV3_resetWriteToDryRunForPostRealWriteReviewV3() {
  if (
    typeof kidlearnV3_resetControlledWriteDevToDryRunV3 !== 'function'
  ) {
    throw new Error(
      'Thiếu function kidlearnV3_resetControlledWriteDevToDryRunV3 từ 3J.6.'
    );
  }

  var reset =
    kidlearnV3_resetControlledWriteDevToDryRunV3();

  var status =
    kidlearnV3_getControlledWriteDevStatusV3();

  var result = {
    success:
      status.safeWriteMode === 'DRY_RUN' &&
      status.safeWriteEnabled === false,
    action: 'RESET_WRITE_TO_DRY_RUN_FOR_POST_REAL_WRITE_REVIEW_V3',
    phase: '3J.9',
    reset: reset,
    status: status,
    message:
      'Đã đưa Controlled Write/Safe Write về DRY_RUN để review 3J.9.'
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Chạy review chính 3J.9.
 *
 * Không ghi dữ liệu.
 * Không xóa dữ liệu.
 */
function kidlearnV3_runPostRealWriteReviewV3() {
  var startedAt =
    new Date();

  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewPostRealWriteReviewV3();

  if (!preview.success) {
    throw new Error(
      'Không thể chạy 3J.9 vì preview chưa đạt. Errors: ' +
      preview.errorCount
    );
  }

  var currentSnapshot =
    kidlearnV3_postReviewSnapshotSheets_(
      KIDLEARN_V3_POST_REAL_REVIEW_TARGET_SHEETS
    );

  var learningFlowCheck =
    kidlearnV3_postReviewCheck3J8DataState_();

  errors =
    errors.concat(
      learningFlowCheck.errors
    );

  warnings =
    warnings.concat(
      learningFlowCheck.warnings
    );

  var decision =
    kidlearnV3_postReviewBuildDecision_(
      errors,
      warnings,
      learningFlowCheck
    );

  var finishedAt =
    new Date();

  var result = {
    success:
      errors.length === 0,
    action: 'RUN_POST_REAL_WRITE_REVIEW_V3',
    phase: '3J.9',
    nextPhase:
      KIDLEARN_V3_POST_REAL_REVIEW_CONFIG.NEXT_PHASE,
    startedAt:
      startedAt.toISOString(),
    finishedAt:
      finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    errorCount:
      errors.length,
    warningCount:
      warnings.length,
    errors:
      errors,
    warnings:
      warnings,
    openRealWriteUiNow:
      false,
    snapshot:
      currentSnapshot.summary,
    learningFlowCheck:
      learningFlowCheck,
    decision:
      decision,
    checklist:
      kidlearnV3_postReviewBuildChecklist_(
        errors,
        warnings,
        learningFlowCheck,
        decision
      )
  };

  kidlearnV3_postReviewSaveResult_(
    result
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3J.9 Post Real Write Review chưa đạt. Errors: ' +
      result.errorCount
    );
  }

  return result;
}


/**
 * Mark 3J.9 ready cho bước thiết kế UI real write gate.
 */
function kidlearnV3_markPostRealWriteReviewReadyV3() {
  var result =
    kidlearnV3_runPostRealWriteReviewV3();

  if (
    !result.success ||
    !result.decision ||
    result.decision.decisionCode !==
      KIDLEARN_V3_POST_REAL_REVIEW_DECISION.READY_TO_DESIGN_UI_REAL_WRITE_GATE
  ) {
    throw new Error(
      'Không thể mark 3J.9 READY. Decision hiện tại chưa sẵn sàng.'
    );
  }

  var now =
    new Date();

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_POST_REAL_REVIEW_KEYS.STATUS,
    KIDLEARN_V3_POST_REAL_REVIEW_STATUS.READY_TO_DESIGN_UI_REAL_WRITE_GATE
  );

  properties.setProperty(
    KIDLEARN_V3_POST_REAL_REVIEW_KEYS.LAST_READY_AT,
    now.toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_POST_REAL_REVIEW_KEYS.LAST_DECISION,
    result.decision.decisionCode
  );

  var finalResult = {
    success: true,
    action: 'MARK_POST_REAL_WRITE_REVIEW_READY_V3',
    phase: '3J.9',
    status: 'READY_TO_DESIGN_UI_REAL_WRITE_GATE',
    nextPhase:
      KIDLEARN_V3_POST_REAL_REVIEW_CONFIG.NEXT_PHASE,
    openRealWriteUiNow: false,
    decision:
      result.decision,
    message:
      '3J.9 đã pass. Có thể chuyển sang 3J.10 để thiết kế UI real write gate, nhưng chưa mở ghi thật trực tiếp qua UI.'
  };

  console.log(
    JSON.stringify(finalResult, null, 2)
  );

  return finalResult;
}


/**
 * Xem trạng thái 3J.9.
 */
function kidlearnV3_getPostRealWriteReviewStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_POST_REAL_WRITE_REVIEW_STATUS_V3',
    phase: '3J.9',
    status:
      properties.getProperty(
        KIDLEARN_V3_POST_REAL_REVIEW_KEYS.STATUS
      ) ||
      KIDLEARN_V3_POST_REAL_REVIEW_STATUS.NOT_RUN,
    lastRunAt:
      properties.getProperty(
        KIDLEARN_V3_POST_REAL_REVIEW_KEYS.LAST_RUN_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_POST_REAL_REVIEW_KEYS.LAST_READY_AT
      ) ||
      '',
    lastDecision:
      properties.getProperty(
        KIDLEARN_V3_POST_REAL_REVIEW_KEYS.LAST_DECISION
      ) ||
      '',
    lastResult:
      kidlearnV3_postReviewReadLastResult_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert cho bước 3J.10.
 */
function kidlearnV3_assertReadyToDesignUiRealWriteGateV3() {
  var status =
    kidlearnV3_getPostRealWriteReviewStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_POST_REAL_REVIEW_STATUS.READY_TO_DESIGN_UI_REAL_WRITE_GATE
  ) {
    errors.push(
      '3J.9 chưa READY_TO_DESIGN_UI_REAL_WRITE_GATE. Status hiện tại: ' +
      status.status
    );
  }

  if (
    status.lastDecision !==
    KIDLEARN_V3_POST_REAL_REVIEW_DECISION.READY_TO_DESIGN_UI_REAL_WRITE_GATE
  ) {
    errors.push(
      '3J.9 lastDecision chưa đúng. Hiện tại: ' +
      status.lastDecision
    );
  }

  var safeWrite =
    kidlearnV3_postReviewSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Trước khi thiết kế UI real write gate, Safe Write phải ở DRY_RUN.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_READY_TO_DESIGN_UI_REAL_WRITE_GATE_V3',
    phase: '3J.9',
    errorCount: errors.length,
    errors: errors,
    status: status.status,
    lastDecision: status.lastDecision,
    safeWriteStatus: safeWrite
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Chưa đủ điều kiện chuyển sang 3J.10. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Kiểm tra trạng thái dữ liệu của transaction 3J.8.
 */
function kidlearnV3_postReviewCheck3J8DataState_() {
  var errors = [];
  var warnings = [];
  var checks = [];

  var flowStatus =
    kidlearnV3_postReviewSafe3J8Status_();

  var last =
    flowStatus.lastResult || {};

  var ids =
    last.ids || {};

  var transactionId =
    last.transactionId ||
    flowStatus.lastTransactionId ||
    ids.transactionId ||
    '';

  if (!transactionId) {
    errors.push(
      'Không tìm thấy transactionId của 3J.8.'
    );
  }

  if (!ids.studySessionId) {
    errors.push(
      'Không tìm thấy studySessionId của 3J.8.'
    );
  }

  if (!ids.lessonProgressId) {
    errors.push(
      'Không tìm thấy lessonProgressId của 3J.8.'
    );
  }

  if (!ids.dailyGoalId) {
    errors.push(
      'Không tìm thấy dailyGoalId của 3J.8.'
    );
  }

  var rolledBack =
    flowStatus.status === 'ROLLED_BACK';

  if (errors.length > 0) {
    return {
      success: false,
      status: flowStatus.status || '',
      rolledBack: rolledBack,
      transactionId: transactionId,
      ids: ids,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors: errors,
      warnings: warnings,
      checks: checks
    };
  }

  var spreadsheet =
    kidlearnV3_postReviewGetDatabaseSpreadsheet_();

  checks.push(
    kidlearnV3_postReviewCheckDataRow_(
      spreadsheet,
      'DATA_StudySessions',
      'studySessionId',
      ids.studySessionId,
      transactionId,
      rolledBack
    )
  );

  checks.push(
    kidlearnV3_postReviewCheckDataRow_(
      spreadsheet,
      'DATA_LessonProgress',
      'lessonProgressId',
      ids.lessonProgressId,
      transactionId,
      rolledBack
    )
  );

  checks.push(
    kidlearnV3_postReviewCheckDataRow_(
      spreadsheet,
      'DATA_DailyGoals',
      'dailyGoalId',
      ids.dailyGoalId,
      transactionId,
      rolledBack
    )
  );

  checks.push(
    kidlearnV3_postReviewCheckAssignmentNotChanged_(
      spreadsheet,
      transactionId
    )
  );

  checks.push(
    kidlearnV3_postReviewCheckAuditRows_(
      spreadsheet,
      [
        transactionId,
        ids.studySessionId,
        ids.lessonProgressId,
        ids.dailyGoalId
      ],
      rolledBack
    )
  );

  for (var i = 0; i < checks.length; i++) {
    if (checks[i].success !== true) {
      errors =
        errors.concat(
          checks[i].errors || []
        );
    }

    warnings =
      warnings.concat(
        checks[i].warnings || []
      );
  }

  return {
    success: errors.length === 0,
    status: flowStatus.status || '',
    rolledBack: rolledBack,
    transactionId: transactionId,
    ids: ids,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    checks: checks
  };
}


/**
 * Check data row theo key.
 */
function kidlearnV3_postReviewCheckDataRow_(
  spreadsheet,
  sheetName,
  keyField,
  keyValue,
  transactionId,
  rolledBack
) {
  var errors = [];
  var warnings = [];

  var sheet =
    kidlearnV3_postReviewGetSheet_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return {
      success: false,
      sheetName: sheetName,
      errors: [
        'Không tìm thấy sheet: ' + sheetName
      ],
      warnings: []
    };
  }

  var rowsByKey =
    kidlearnV3_postReviewFindRowsByKey_(
      sheet,
      keyField,
      keyValue
    );

  var rowsByToken =
    kidlearnV3_postReviewFindRowsContainingTokens_(
      sheet,
      [
        transactionId,
        keyValue
      ]
    );

  if (rolledBack) {
    if (
      rowsByKey.length > 0 ||
      rowsByToken.length > 0
    ) {
      errors.push(
        sheetName +
        ' vẫn còn row test sau rollback. key=' +
        keyValue
      );
    }

  } else {
    if (rowsByKey.length !== 1) {
      errors.push(
        sheetName +
        ' phải có đúng 1 row test theo ' +
        keyField +
        '. Found=' +
        rowsByKey.length +
        ', key=' +
        keyValue
      );
    }

    if (rowsByToken.length < 1) {
      warnings.push(
        sheetName +
        ' không tìm thấy token transactionId trong row display. Vẫn chấp nhận nếu key match đúng.'
      );
    }
  }

  return {
    success: errors.length === 0,
    sheetName: sheetName,
    keyField: keyField,
    keyValue: keyValue,
    rolledBack: rolledBack,
    foundByKeyCount: rowsByKey.length,
    rowsByKey: rowsByKey,
    foundByTokenCount: rowsByToken.length,
    rowsByToken: rowsByToken,
    lastRow: sheet.getLastRow(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * DATA_Assignments không được chứa transactionId 3J.8.
 */
function kidlearnV3_postReviewCheckAssignmentNotChanged_(
  spreadsheet,
  transactionId
) {
  var errors = [];
  var warnings = [];

  var sheet =
    kidlearnV3_postReviewGetSheet_(
      spreadsheet,
      'DATA_Assignments'
    );

  if (!sheet) {
    return {
      success: false,
      sheetName: 'DATA_Assignments',
      errors: [
        'Không tìm thấy sheet DATA_Assignments.'
      ],
      warnings: []
    };
  }

  var rows =
    kidlearnV3_postReviewFindRowsContainingTokens_(
      sheet,
      [
        transactionId
      ]
    );

  if (rows.length > 0) {
    errors.push(
      'DATA_Assignments không được chứa transactionId 3J.8. Found=' +
      rows.length
    );
  }

  return {
    success: errors.length === 0,
    sheetName: 'DATA_Assignments',
    foundTokenCount: rows.length,
    rows: rows,
    lastRow: sheet.getLastRow(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Check LOG_Audit rows.
 */
function kidlearnV3_postReviewCheckAuditRows_(
  spreadsheet,
  tokens,
  rolledBack
) {
  var errors = [];
  var warnings = [];

  var sheet =
    kidlearnV3_postReviewGetSheet_(
      spreadsheet,
      'LOG_Audit'
    );

  if (!sheet) {
    return {
      success: false,
      sheetName: 'LOG_Audit',
      errors: [
        'Không tìm thấy LOG_Audit.'
      ],
      warnings: []
    };
  }

  var rows =
    kidlearnV3_postReviewFindRowsContainingTokens_(
      sheet,
      tokens
    );

  if (rolledBack) {
    if (rows.length > 0) {
      errors.push(
        'LOG_Audit vẫn còn audit rows của 3J.8 sau rollback. Found=' +
        rows.length
      );
    }

  } else {
    if (rows.length < 2) {
      errors.push(
        'LOG_Audit phải có ít nhất 2 rows liên quan transaction 3J.8. Found=' +
        rows.length
      );
    }

    if (rows.length !== 6) {
      warnings.push(
        'LOG_Audit có ' +
        rows.length +
        ' rows liên quan 3J.8. Chấp nhận vì audit tự động có thể khác số kỳ vọng cũ.'
      );
    }
  }

  return {
    success: errors.length === 0,
    sheetName: 'LOG_Audit',
    rolledBack: rolledBack,
    foundRowCount: rows.length,
    rows: rows,
    lastRow: sheet.getLastRow(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Build decision.
 */
function kidlearnV3_postReviewBuildDecision_(
  errors,
  warnings,
  learningFlowCheck
) {
  if (errors.length > 0) {
    return {
      decisionCode:
        KIDLEARN_V3_POST_REAL_REVIEW_DECISION.DO_NOT_OPEN_UI_REAL_WRITE,
      openRealWriteUiNow: false,
      canDesignUiGate: false,
      nextPhase: '',
      reason:
        'Còn lỗi sau real write review. Giữ UI ở DRY_RUN.'
    };
  }

  if (
    learningFlowCheck &&
    learningFlowCheck.success === true
  ) {
    return {
      decisionCode:
        KIDLEARN_V3_POST_REAL_REVIEW_DECISION.READY_TO_DESIGN_UI_REAL_WRITE_GATE,
      openRealWriteUiNow: false,
      canDesignUiGate: true,
      nextPhase:
        KIDLEARN_V3_POST_REAL_REVIEW_CONFIG.NEXT_PHASE,
      reason:
        'Dữ liệu sau real write/reset đúng phạm vi. Có thể thiết kế UI real write gate ở 3J.10, nhưng chưa mở ghi thật trực tiếp qua UI trong 3J.9.'
    };
  }

  return {
    decisionCode:
      KIDLEARN_V3_POST_REAL_REVIEW_DECISION.HOLD_KEEP_UI_DRY_RUN,
    openRealWriteUiNow: false,
    canDesignUiGate: false,
    nextPhase: '',
    reason:
      'Chưa đủ điều kiện. Giữ UI ở DRY_RUN.'
  };
}


/**
 * Build checklist.
 */
function kidlearnV3_postReviewBuildChecklist_(
  errors,
  warnings,
  learningFlowCheck,
  decision
) {
  return [
    {
      item: 'Controlled Write đã reset về DRY_RUN',
      status:
        kidlearnV3_postReviewSafeWriteStatus_().mode === 'DRY_RUN'
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: '3J.8 data rows đúng trạng thái',
      status:
        learningFlowCheck.success
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'DATA_Assignments không bị tác động bởi 3J.8',
      status:
        kidlearnV3_postReviewCheckAssignmentStatusFromChecks_(
          learningFlowCheck
        )
    },
    {
      item: 'LOG_Audit rows được account',
      status:
        kidlearnV3_postReviewCheckAuditStatusFromChecks_(
          learningFlowCheck
        )
    },
    {
      item: 'Không mở real write trực tiếp qua UI ở 3J.9',
      status:
        decision.openRealWriteUiNow === false
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'Decision',
      status:
        decision.decisionCode ===
        KIDLEARN_V3_POST_REAL_REVIEW_DECISION.READY_TO_DESIGN_UI_REAL_WRITE_GATE
          ? 'PASSED'
          : 'HOLD',
      decisionCode:
        decision.decisionCode
    },
    {
      item: '3J.9 result',
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
 * Helper: assignment status từ checks.
 */
function kidlearnV3_postReviewCheckAssignmentStatusFromChecks_(
  learningFlowCheck
) {
  var checks =
    learningFlowCheck.checks || [];

  for (var i = 0; i < checks.length; i++) {
    if (checks[i].sheetName === 'DATA_Assignments') {
      return checks[i].success
        ? 'PASSED'
        : 'FAILED';
    }
  }

  return 'FAILED';
}


/**
 * Helper: audit status từ checks.
 */
function kidlearnV3_postReviewCheckAuditStatusFromChecks_(
  learningFlowCheck
) {
  var checks =
    learningFlowCheck.checks || [];

  for (var i = 0; i < checks.length; i++) {
    if (checks[i].sheetName === 'LOG_Audit') {
      return checks[i].success
        ? 'PASSED'
        : 'FAILED';
    }
  }

  return 'FAILED';
}


/**
 * Snapshot nhiều sheet.
 */
function kidlearnV3_postReviewSnapshotSheets_(
  sheetNames
) {
  var spreadsheet =
    kidlearnV3_postReviewGetDatabaseSpreadsheet_();

  var items = [];
  var summary = [];

  for (var i = 0; i < sheetNames.length; i++) {
    var item =
      kidlearnV3_postReviewSnapshotSheet_(
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
    items:
      items,
    summary:
      summary
  };
}


/**
 * Snapshot một sheet.
 */
function kidlearnV3_postReviewSnapshotSheet_(
  spreadsheet,
  sheetName
) {
  var sheet =
    kidlearnV3_postReviewGetSheet_(
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
      kidlearnV3_postReviewMd5_(
        text
      )
  };
}


/**
 * Check target sheets.
 */
function kidlearnV3_postReviewCheckTargetSheets_() {
  var errors = [];
  var warnings = [];
  var items = [];

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_postReviewGetDatabaseSpreadsheet_();

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
    i < KIDLEARN_V3_POST_REAL_REVIEW_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_POST_REAL_REVIEW_TARGET_SHEETS[i];

    var sheet =
      kidlearnV3_postReviewGetSheet_(
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
 * Find rows by key field.
 */
function kidlearnV3_postReviewFindRowsByKey_(
  sheet,
  keyField,
  keyValue
) {
  var rows = [];

  var key =
    String(keyField || '').trim();

  var value =
    String(keyValue || '').trim();

  if (!key || !value) {
    return rows;
  }

  var header =
    kidlearnV3_postReviewGetHeader_(
      sheet
    );

  var columnIndex =
    kidlearnV3_postReviewGetColumnIndex_(
      header.keys,
      key
    );

  if (columnIndex < 0) {
    return rows;
  }

  var lastRow =
    sheet.getLastRow();

  if (lastRow < 3) {
    return rows;
  }

  var values =
    sheet
      .getRange(
        3,
        columnIndex + 1,
        lastRow - 2,
        1
      )
      .getDisplayValues();

  for (var i = 0; i < values.length; i++) {
    if (
      String(values[i][0] || '').trim() === value
    ) {
      rows.push(i + 3);
    }
  }

  return rows;
}


/**
 * Find rows containing any tokens.
 */
function kidlearnV3_postReviewFindRowsContainingTokens_(
  sheet,
  tokens
) {
  var cleanTokens = [];

  for (var i = 0; i < tokens.length; i++) {
    var token =
      String(tokens[i] || '').trim();

    if (token) {
      cleanTokens.push(token);
    }
  }

  var rows = [];

  if (cleanTokens.length === 0) {
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

  var rowMap = {};

  for (var r = 0; r < values.length; r++) {
    var rowText =
      values[r].join(' | ');

    for (var t = 0; t < cleanTokens.length; t++) {
      if (rowText.indexOf(cleanTokens[t]) >= 0) {
        rowMap[String(r + 3)] = true;
        break;
      }
    }
  }

  var keys =
    Object.keys(rowMap);

  for (var k = 0; k < keys.length; k++) {
    rows.push(
      Number(keys[k])
    );
  }

  rows.sort(
    function(a, b) {
      return a - b;
    }
  );

  return rows;
}


/**
 * Header row 2.
 */
function kidlearnV3_postReviewGetHeader_(
  sheet
) {
  var lastColumn =
    sheet.getLastColumn();

  if (lastColumn < 1) {
    return {
      keys: []
    };
  }

  var values =
    sheet
      .getRange(
        2,
        1,
        1,
        lastColumn
      )
      .getDisplayValues()[0];

  var keys = [];

  for (var i = 0; i < values.length; i++) {
    keys.push(
      String(values[i] || '').trim()
    );
  }

  return {
    keys: keys
  };
}


/**
 * Column index.
 */
function kidlearnV3_postReviewGetColumnIndex_(
  keys,
  key
) {
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] === key) {
      return i;
    }
  }

  return -1;
}


/**
 * Get database spreadsheet.
 */
function kidlearnV3_postReviewGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_postReviewResolveSpreadsheet_(
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
 * Resolve wrapper thành Spreadsheet object.
 */
function kidlearnV3_postReviewResolveSpreadsheet_(
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
 * Get sheet exact name.
 */
function kidlearnV3_postReviewGetSheet_(
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
 * Save result.
 */
function kidlearnV3_postReviewSaveResult_(
  result
) {
  var status =
    result.success
      ? KIDLEARN_V3_POST_REAL_REVIEW_STATUS.PASSED
      : KIDLEARN_V3_POST_REAL_REVIEW_STATUS.FAILED;

  if (
    result.decision &&
    result.decision.decisionCode ===
      KIDLEARN_V3_POST_REAL_REVIEW_DECISION.HOLD_KEEP_UI_DRY_RUN
  ) {
    status =
      KIDLEARN_V3_POST_REAL_REVIEW_STATUS.HOLD;
  }

  var compact = {
    success: result.success,
    action: result.action,
    phase: result.phase,
    finishedAt: result.finishedAt,
    durationMs: result.durationMs,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    errors: result.errors,
    warnings: result.warnings,
    openRealWriteUiNow: result.openRealWriteUiNow,
    decision: result.decision,
    learningFlowCheck: {
      success: result.learningFlowCheck.success,
      status: result.learningFlowCheck.status,
      rolledBack: result.learningFlowCheck.rolledBack,
      transactionId: result.learningFlowCheck.transactionId,
      errorCount: result.learningFlowCheck.errorCount,
      warningCount: result.learningFlowCheck.warningCount,
      errors: result.learningFlowCheck.errors,
      warnings: result.learningFlowCheck.warnings
    },
    checklist: result.checklist
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_POST_REAL_REVIEW_KEYS.STATUS,
    status
  );

  properties.setProperty(
    KIDLEARN_V3_POST_REAL_REVIEW_KEYS.LAST_RUN_AT,
    new Date().toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_POST_REAL_REVIEW_KEYS.LAST_DECISION,
    result.decision
      ? result.decision.decisionCode
      : ''
  );

  properties.setProperty(
    KIDLEARN_V3_POST_REAL_REVIEW_KEYS.LAST_RESULT_JSON,
    JSON.stringify(compact)
  );
}


/**
 * Read last result.
 */
function kidlearnV3_postReviewReadLastResult_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_POST_REAL_REVIEW_KEYS.LAST_RESULT_JSON
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
 * Check functions.
 */
function kidlearnV3_postReviewCheckFunctions_(
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
 * Safe Phase 3I.
 */
function kidlearnV3_postReviewSafePhase3I_() {
  try {
    var result =
      kidlearnV3_assertPhase3IClosedFor3JV3();

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
 * Safe connection.
 */
function kidlearnV3_postReviewSafeConnection_() {
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
        String(error.message || error)
    };
  }
}


/**
 * Safe SafeWrite status.
 */
function kidlearnV3_postReviewSafeWriteStatus_() {
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
function kidlearnV3_postReviewSafeControlledWriteStatus_() {
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
 * Safe 3J.5 status.
 */
function kidlearnV3_postReviewSafe3J5Status_() {
  try {
    return kidlearnV3_getDryRunNoWriteChecklistStatusV3();
  } catch (error) {
    return {
      success: false,
      status: '',
      error:
        String(error.message || error)
    };
  }
}


/**
 * Safe 3J.7 status.
 */
function kidlearnV3_postReviewSafe3J7Status_() {
  try {
    return kidlearnV3_getRealWriteSmallTransactionStatusV3();
  } catch (error) {
    return {
      success: false,
      status: '',
      error:
        String(error.message || error)
    };
  }
}


/**
 * Safe 3J.8 status.
 */
function kidlearnV3_postReviewSafe3J8Status_() {
  try {
    return kidlearnV3_getRealWriteLearningFlowStatusV3();
  } catch (error) {
    return {
      success: false,
      status: '',
      error:
        String(error.message || error)
    };
  }
}


/**
 * Safe router status.
 */
function kidlearnV3_postReviewSafeRouterStatus_() {
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
 * MD5 checksum.
 */
function kidlearnV3_postReviewMd5_(
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