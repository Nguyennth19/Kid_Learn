/**
 * ================================================================
 * KIDLEARN V3 - PROD CANDIDATE CHECKLIST
 * Bundle: 3M-D
 * Version: 3.1.0
 * ================================================================
 *
 * 3M-D:
 * - Chỉ review readiness.
 * - Không deploy PROD.
 * - Không ghi dữ liệu học tập thật.
 * - Không real write.
 * - Không rollback.
 * - Không migration.
 * - Không create/delete sheet.
 * - Chỉ ghi ScriptProperties để lưu checklist/status.
 */


var KIDLEARN_V3_PROD_CANDIDATE_3MD_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3MD_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3MD_LAST_PREVIEW_AT',
  LAST_CHECKLIST_AT: 'KIDLEARN_V3_PHASE_3MD_LAST_CHECKLIST_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3MD_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3MD_LAST_RESULT_JSON',
  LAST_CHECKLIST_JSON: 'KIDLEARN_V3_PHASE_3MD_LAST_CHECKLIST_JSON'
};


var KIDLEARN_V3_PROD_CANDIDATE_3MD_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  CHECKLIST_PASSED: 'CHECKLIST_PASSED',
  READY_FOR_PROD_CANDIDATE_REVIEW: 'READY_FOR_PROD_CANDIDATE_REVIEW',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_CANDIDATE_3MD_CONFIG = {
  VERSION: '3M-D',
  PHASE: '3M-D',
  NEXT_STAGE: 'PROD_CANDIDATE_REVIEW',
  WRITE_MODE: 'NO_DB_WRITE',
  REAL_WRITE_ALLOWED: false,
  EXPECTED_SHEET_COUNT: 44,
  REQUIRED_CLOSE_STATUS: 'CLOSED_LOCKED'
};


/**
 * Preview 3M-D.
 */
function kidlearnV3_previewProdCandidateChecklist3MDV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3mdCheckFunctions_([
      'kidlearnV3_assertSecurityRoleGuard3MCReadyV3',
      'kidlearnV3_assertPhase3JClosedV3',
      'kidlearnV3_assertPhase3KClosedV3',
      'kidlearnV3_assertPhase3LClosedV3',
      'kidlearnV3_assertQaAsync3MAReadyV3',
      'kidlearnV3_assertPerformanceBaseline3MBReadyV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_appGetActiveDatabaseV3_',
      'kidlearnV3_roleGuard3MCV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors =
    errors.concat(
      requiredFunctions.errors
    );

  var optionalFunctions =
    kidlearnV3_3mdCheckFunctions_([
      'kidlearnV3_getControlledWriteDevStatusV3',
      'kidlearnV3_getQaAsyncStatus3MAV3',
      'kidlearnV3_getPerformanceBaseline3MBStatusV3',
      'kidlearnV3_getSecurityRoleGuard3MCStatusV3'
    ]);

  if (optionalFunctions.errors.length > 0) {
    warnings =
      warnings.concat(
        optionalFunctions.errors.map(function(item) {
          return 'Optional function warning: ' + item;
        })
      );
  }

  var phase3MC =
    kidlearnV3_3mdSafeAssert_(
      'kidlearnV3_assertSecurityRoleGuard3MCReadyV3',
      '3M-C'
    );

  if (!phase3MC.success) {
    errors.push(
      '3M-C chưa READY_FOR_3M_D: ' +
      phase3MC.message
    );
  }

  var safeModes =
    kidlearnV3_3mdCheckSafeModes_();

  errors =
    errors.concat(
      safeModes.errors
    );

  warnings =
    warnings.concat(
      safeModes.warnings
    );

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_CANDIDATE_CHECKLIST_3MD_V3',
    bundle: '3M-D',
    phase: KIDLEARN_V3_PROD_CANDIDATE_3MD_CONFIG.PHASE,
    nextStage: KIDLEARN_V3_PROD_CANDIDATE_3MD_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_CANDIDATE_3MD_CONFIG.WRITE_MODE,
    realWriteAllowed: false,
    prodDeployNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3MC: phase3MC,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    optionalFunctions: optionalFunctions.items,
    note:
      '3M-D chỉ xác nhận DEV V3 đủ điều kiện làm PROD candidate. Chưa deploy PROD.'
  };

  kidlearnV3_3mdSaveResult_(
    result,
    KIDLEARN_V3_PROD_CANDIDATE_3MD_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_CANDIDATE_3MD_KEYS.LAST_PREVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Run PROD candidate checklist.
 */
function kidlearnV3_runProdCandidateChecklist3MDV3() {
  var startedAt =
    new Date();

  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdCandidateChecklist3MDV3();

  if (!preview.success) {
    throw new Error(
      'Không thể chạy PROD candidate checklist 3M-D vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var phaseReview =
    kidlearnV3_3mdReviewPhaseReadiness_();

  errors =
    errors.concat(
      phaseReview.errors
    );

  warnings =
    warnings.concat(
      phaseReview.warnings
    );

  var sheetInventory =
    kidlearnV3_3mdReviewSheetInventory_();

  errors =
    errors.concat(
      sheetInventory.errors
    );

  warnings =
    warnings.concat(
      sheetInventory.warnings
    );

  var safeModeReview =
    kidlearnV3_3mdCheckSafeModes_();

  errors =
    errors.concat(
      safeModeReview.errors
    );

  warnings =
    warnings.concat(
      safeModeReview.warnings
    );

  var securityReview =
    kidlearnV3_3mdReviewSecurityGuards_();

  errors =
    errors.concat(
      securityReview.errors
    );

  warnings =
    warnings.concat(
      securityReview.warnings
    );

  var performanceReview =
    kidlearnV3_3mdReviewPerformanceBaseline_();

  errors =
    errors.concat(
      performanceReview.errors
    );

  warnings =
    warnings.concat(
      performanceReview.warnings
    );

  var asyncReview =
    kidlearnV3_3mdReviewQaAsyncState_();

  errors =
    errors.concat(
      asyncReview.errors
    );

  warnings =
    warnings.concat(
      asyncReview.warnings
    );

  var prodRiskReview =
    kidlearnV3_3mdReviewProdRiskGates_();

  errors =
    errors.concat(
      prodRiskReview.errors
    );

  warnings =
    warnings.concat(
      prodRiskReview.warnings
    );

  var decision =
    errors.length === 0
      ? 'READY_FOR_PROD_CANDIDATE_REVIEW'
      : 'HOLD_DEV_V3';

  var finishedAt =
    new Date();

  var result = {
    success: errors.length === 0,
    action: 'RUN_PROD_CANDIDATE_CHECKLIST_3MD_V3',
    bundle: '3M-D',
    phase: KIDLEARN_V3_PROD_CANDIDATE_3MD_CONFIG.PHASE,
    nextStage: KIDLEARN_V3_PROD_CANDIDATE_3MD_CONFIG.NEXT_STAGE,
    decision: decision,
    prodDeployNow: false,
    writeMode: KIDLEARN_V3_PROD_CANDIDATE_3MD_CONFIG.WRITE_MODE,
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
    checklist: {
      phaseReview: phaseReview,
      sheetInventory: sheetInventory.summary,
      safeModeReview: safeModeReview.summary,
      securityReview: securityReview.summary,
      performanceReview: performanceReview.summary,
      asyncReview: asyncReview.summary,
      prodRiskReview: prodRiskReview.summary
    },
    requiredManualBeforeProd: [
      'Tạo backup DEV database trước khi chuẩn bị PROD.',
      'Review lại role/access thật trong DATA_UserChildAccess.',
      'Review dữ liệu master lesson/question trước khi copy sang PROD.',
      'PROD deployment phải là phase riêng, không chạy trong 3M-D.'
    ]
  };

  kidlearnV3_3mdSaveChecklist_(
    result
  );

  kidlearnV3_3mdSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_PROD_CANDIDATE_3MD_STATUS.CHECKLIST_PASSED
      : KIDLEARN_V3_PROD_CANDIDATE_3MD_STATUS.FAILED,
    KIDLEARN_V3_PROD_CANDIDATE_3MD_KEYS.LAST_CHECKLIST_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3M-D PROD candidate checklist failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 3M-D ready.
 */
function kidlearnV3_markProdCandidateChecklist3MDReadyV3() {
  var status =
    kidlearnV3_getProdCandidateChecklist3MDStatusV3();

  var errors = [];

  var allowed = {
    CHECKLIST_PASSED: true,
    READY_FOR_PROD_CANDIDATE_REVIEW: true
  };

  if (!allowed[status.status]) {
    errors.push(
      '3M-D chưa có checklist passed. Status=' +
      status.status
    );
  }

  var lastChecklist =
    status.lastChecklist || {};

  if (
    !lastChecklist ||
    lastChecklist.success !== true
  ) {
    errors.push(
      'Last PROD candidate checklist chưa success=true.'
    );
  }

  var safeModes =
    kidlearnV3_3mdCheckSafeModes_();

  errors =
    errors.concat(
      safeModes.errors
    );

  if (errors.length > 0) {
    var failed = {
      success: false,
      action: 'MARK_PROD_CANDIDATE_CHECKLIST_3MD_READY_V3',
      bundle: '3M-D',
      status: status.status,
      errorCount: errors.length,
      errors: errors
    };

    console.log(
      JSON.stringify(failed, null, 2)
    );

    throw new Error(
      'Không thể mark 3M-D ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_CANDIDATE_CHECKLIST_3MD_READY_V3',
    bundle: '3M-D',
    phase: KIDLEARN_V3_PROD_CANDIDATE_3MD_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_CANDIDATE_3MD_STATUS.READY_FOR_PROD_CANDIDATE_REVIEW,
    nextStage:
      KIDLEARN_V3_PROD_CANDIDATE_3MD_CONFIG.NEXT_STAGE,
    prodDeployNow: false,
    message:
      'DEV V3 đã sẵn sàng cho PROD candidate review. Chưa deploy PROD trong bước này.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3mdSaveResult_(
    result,
    KIDLEARN_V3_PROD_CANDIDATE_3MD_STATUS.READY_FOR_PROD_CANDIDATE_REVIEW,
    KIDLEARN_V3_PROD_CANDIDATE_3MD_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Get 3M-D status.
 */
function kidlearnV3_getProdCandidateChecklist3MDStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_CANDIDATE_CHECKLIST_3MD_STATUS_V3',
    bundle: '3M-D',
    phase: KIDLEARN_V3_PROD_CANDIDATE_3MD_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_CANDIDATE_3MD_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_CANDIDATE_3MD_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CANDIDATE_3MD_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastChecklistAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CANDIDATE_3MD_KEYS.LAST_CHECKLIST_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CANDIDATE_3MD_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3mdReadJsonProperty_(
        KIDLEARN_V3_PROD_CANDIDATE_3MD_KEYS.LAST_RESULT_JSON
      ),
    lastChecklist:
      kidlearnV3_3mdReadJsonProperty_(
        KIDLEARN_V3_PROD_CANDIDATE_3MD_KEYS.LAST_CHECKLIST_JSON
      )
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3M-D ready.
 */
function kidlearnV3_assertProdCandidateChecklist3MDReadyV3() {
  var status =
    kidlearnV3_getProdCandidateChecklist3MDStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_CANDIDATE_3MD_STATUS.READY_FOR_PROD_CANDIDATE_REVIEW
  ) {
    errors.push(
      '3M-D chưa READY_FOR_PROD_CANDIDATE_REVIEW. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_CANDIDATE_CHECKLIST_3MD_READY_V3',
    bundle: '3M-D',
    phase: KIDLEARN_V3_PROD_CANDIDATE_3MD_CONFIG.PHASE,
    status: status.status,
    nextStage:
      KIDLEARN_V3_PROD_CANDIDATE_3MD_CONFIG.NEXT_STAGE,
    prodDeployNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3M-D chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3M-D.
 */
function kidlearnV3_getQaBatchSteps3MDV3() {
  return [
    {
      label: 'Assert 3M-C ready',
      functionName: 'kidlearnV3_assertSecurityRoleGuard3MCReadyV3'
    },
    {
      label: 'Preview PROD Candidate Checklist 3M-D',
      functionName: 'kidlearnV3_previewProdCandidateChecklist3MDV3'
    },
    {
      label: 'Run PROD Candidate Checklist 3M-D',
      functionName: 'kidlearnV3_runProdCandidateChecklist3MDV3'
    },
    {
      label: 'Mark PROD Candidate Checklist 3M-D Ready',
      functionName: 'kidlearnV3_markProdCandidateChecklist3MDReadyV3'
    },
    {
      label: 'Assert PROD Candidate Checklist 3M-D Ready',
      functionName: 'kidlearnV3_assertProdCandidateChecklist3MDReadyV3'
    }
  ];
}


/**
 * QA batch 3M-D.
 */
function kidlearnV3_runQaBatch3MDV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3M_D_PROD_CANDIDATE_CHECKLIST',
    kidlearnV3_getQaBatchSteps3MDV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Review phase readiness.
 */
function kidlearnV3_3mdReviewPhaseReadiness_() {
  var errors = [];
  var warnings = [];
  var items = [];

  var checks = [
    {
      label: 'Phase 3J closed',
      functionName: 'kidlearnV3_assertPhase3JClosedV3'
    },
    {
      label: 'Phase 3K closed',
      functionName: 'kidlearnV3_assertPhase3KClosedV3'
    },
    {
      label: 'Phase 3L closed',
      functionName: 'kidlearnV3_assertPhase3LClosedV3'
    },
    {
      label: '3M-A ready',
      functionName: 'kidlearnV3_assertQaAsync3MAReadyV3'
    },
    {
      label: '3M-B ready',
      functionName: 'kidlearnV3_assertPerformanceBaseline3MBReadyV3'
    },
    {
      label: '3M-C ready',
      functionName: 'kidlearnV3_assertSecurityRoleGuard3MCReadyV3'
    }
  ];

  for (var i = 0; i < checks.length; i++) {
    var item =
      kidlearnV3_3mdSafeAssert_(
        checks[i].functionName,
        checks[i].label
      );

    items.push(item);

    if (!item.success) {
      errors.push(
        checks[i].label +
        ' chưa pass: ' +
        item.message
      );
    }
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    items: items,
    summary: {
      checkedCount: checks.length,
      passedCount:
        items.filter(function(item) {
          return item.success;
        }).length,
      failedCount:
        items.filter(function(item) {
          return !item.success;
        }).length
    }
  };
}


/**
 * Review sheet inventory.
 */
function kidlearnV3_3mdReviewSheetInventory_() {
  var errors = [];
  var warnings = [];
  var items = [];

  var expectedSheets =
    kidlearnV3_3mdGetExpectedSheets_();

  if (
    expectedSheets.length !==
    KIDLEARN_V3_PROD_CANDIDATE_3MD_CONFIG.EXPECTED_SHEET_COUNT
  ) {
    warnings.push(
      'Expected sheet list hiện có ' +
      expectedSheets.length +
      ' sheet. Chuẩn V3 là 44.'
    );
  }

  var spreadsheet =
    kidlearnV3_3mdGetDatabaseSpreadsheet_();

  for (var i = 0; i < expectedSheets.length; i++) {
    var sheetName =
      expectedSheets[i];

    var sheet =
      kidlearnV3_3mdGetSheet_(
        spreadsheet,
        sheetName
      );

    if (!sheet) {
      errors.push(
        'Thiếu V3 sheet: ' +
        sheetName
      );

      items.push({
        sheetName: sheetName,
        exists: false
      });

      continue;
    }

    var lastRow =
      sheet.getLastRow();

    var lastColumn =
      sheet.getLastColumn();

    if (lastRow < 2) {
      warnings.push(
        sheetName +
        ' có ít hơn 2 dòng header/key.'
      );
    }

    items.push({
      sheetName: sheetName,
      exists: true,
      lastRow: lastRow,
      lastColumn: lastColumn
    });
  }

  var activeLegacyNames =
    kidlearnV3_3mdFindActiveLegacySheetNames_(
      spreadsheet
    );

  if (activeLegacyNames.length > 0) {
    warnings.push(
      'Vẫn còn legacy sheet active chưa rename LEGACY_V2_: ' +
      activeLegacyNames.join(', ')
    );
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    items: items,
    summary: {
      expectedSheetCount: expectedSheets.length,
      foundSheetCount:
        items.filter(function(item) {
          return item.exists;
        }).length,
      missingSheetCount:
        items.filter(function(item) {
          return !item.exists;
        }).length,
      activeLegacySheetCount:
        activeLegacyNames.length,
      activeLegacySheets:
        activeLegacyNames
    }
  };
}


/**
 * Check safe modes.
 */
function kidlearnV3_3mdCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3mdSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Safe Write phải DRY_RUN/enabled=false. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var controlledWrite =
    kidlearnV3_3mdControlledWriteStatus_();

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    errors.push(
      'Controlled Write đang ENABLED.'
    );
  }

  if (controlledWrite.available === false) {
    warnings.push(
      'Không tìm thấy Controlled Write status function. Bỏ qua check này trong DEV.'
    );
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    safeWriteStatus: safeWrite,
    controlledWriteStatus: controlledWrite,
    summary: {
      safeWriteMode: safeWrite.mode || '',
      safeWriteEnabled: safeWrite.enabled,
      controlledWriteAvailable: controlledWrite.available,
      controlledWriteStatus: controlledWrite.status || ''
    }
  };
}


/**
 * Review security guards.
 */
function kidlearnV3_3mdReviewSecurityGuards_() {
  var errors = [];
  var warnings = [];
  var tests = [];

  var cases = [
    {
      name: 'CHILD can view learning',
      request: {
        role: 'CHILD',
        screenId: 'LEARNING_HOME_V3',
        actionCode: 'VIEW_LEARNING'
      },
      expectSuccess: true
    },
    {
      name: 'CHILD blocked from settings',
      request: {
        role: 'CHILD',
        screenId: 'SETTINGS_HOME',
        actionCode: 'VIEW_SETTINGS'
      },
      expectSuccess: false
    },
    {
      name: 'FAMILY_ADMIN can view settings',
      request: {
        role: 'FAMILY_ADMIN',
        screenId: 'SETTINGS_HOME',
        actionCode: 'VIEW_SETTINGS'
      },
      expectSuccess: true
    },
    {
      name: 'ADMIN blocked',
      request: {
        role: 'ADMIN',
        screenId: 'SETTINGS_HOME',
        actionCode: 'VIEW_SETTINGS'
      },
      expectSuccess: false
    }
  ];

  for (var i = 0; i < cases.length; i++) {
    var guardResult =
      kidlearnV3_roleGuard3MCV3(
        cases[i].request
      );

    var passed =
      guardResult.success === cases[i].expectSuccess;

    tests.push({
      name: cases[i].name,
      expected: cases[i].expectSuccess,
      actual: guardResult.success,
      passed: passed
    });

    if (!passed) {
      errors.push(
        'Security guard test failed: ' +
        cases[i].name +
        '. Expected=' +
        cases[i].expectSuccess +
        ', actual=' +
        guardResult.success
      );
    }

    if (
      guardResult.warnings &&
      guardResult.warnings.length
    ) {
      warnings =
        warnings.concat(
          guardResult.warnings
        );
    }
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    tests: tests,
    summary: {
      testCount: tests.length,
      passedCount:
        tests.filter(function(item) {
          return item.passed;
        }).length,
      failedCount:
        tests.filter(function(item) {
          return !item.passed;
        }).length
    }
  };
}


/**
 * Review performance baseline.
 */
function kidlearnV3_3mdReviewPerformanceBaseline_() {
  var errors = [];
  var warnings = [];

  var status = null;

  try {
    if (
      typeof kidlearnV3_getPerformanceBaseline3MBStatusV3 === 'function'
    ) {
      status =
        kidlearnV3_getPerformanceBaseline3MBStatusV3();

      if (
        status.status !== 'READY_FOR_3M_C'
      ) {
        errors.push(
          '3M-B performance status chưa READY_FOR_3M_C. Status=' +
          status.status
        );
      }

      if (
        !status.lastBaseline ||
        status.lastBaseline.success !== true
      ) {
        warnings.push(
          'Không tìm thấy last performance baseline success=true.'
        );
      }
    } else {
      warnings.push(
        'Không có function get performance status. Bỏ qua performance detail.'
      );
    }

  } catch (error) {
    warnings.push(
      'Performance review warning: ' +
      String(error.message || error)
    );
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    summary: {
      status:
        status ? status.status : '',
      hasBaseline:
        status && status.lastBaseline ? true : false
    }
  };
}


/**
 * Review QA Async state.
 */
function kidlearnV3_3mdReviewQaAsyncState_() {
  var errors = [];
  var warnings = [];

  var status = null;

  try {
    if (
      typeof kidlearnV3_getQaAsyncStatus3MAV3 === 'function'
    ) {
      status =
        kidlearnV3_getQaAsyncStatus3MAV3();

      if (
        status.status === 'RUNNING' ||
        status.status === 'QUEUED' ||
        status.status === 'PAUSED'
      ) {
        errors.push(
          'QA Async vẫn đang ở trạng thái ' +
          status.status +
          '. Cần COMPLETED hoặc cancel trước PROD candidate.'
        );
      }
    } else {
      warnings.push(
        'Không có function get QA Async status. Bỏ qua async state detail.'
      );
    }

  } catch (error) {
    warnings.push(
      'QA Async review warning: ' +
      String(error.message || error)
    );
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    summary: {
      asyncStatus:
        status ? status.status : '',
      progressPercent:
        status ? status.progressPercent : ''
    }
  };
}


/**
 * Review PROD risk gates.
 */
function kidlearnV3_3mdReviewProdRiskGates_() {
  var errors = [];
  var warnings = [];

  warnings.push(
    '3M-D không deploy PROD. PROD deployment phải chạy trong phase riêng sau khi có backup và xác nhận thủ công.'
  );

  warnings.push(
    'Trước PROD cần review dữ liệu thật trong DATA_UserChildAccess, MST_Lessons, MST_Questions.'
  );

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    summary: {
      prodDeployNow: false,
      backupRequiredBeforeProd: true,
      manualApprovalRequired: true,
      prodSheetTouched: false
    }
  };
}


/**
 * Expected sheets.
 */
function kidlearnV3_3mdGetExpectedSheets_() {
  try {
    if (
      typeof KIDLEARN_V3_SHEET_ORDER !== 'undefined' &&
      KIDLEARN_V3_SHEET_ORDER &&
      KIDLEARN_V3_SHEET_ORDER.length
    ) {
      return KIDLEARN_V3_SHEET_ORDER.slice();
    }
  } catch (error) {
    // fallback below
  }

  return [
    'SYS_Config',
    'SYS_Categories',
    'SYS_SchemaVersion',
    'SYS_MigrationLog',
    'LOG_Audit',
    'LOG_Errors',
    'DATA_Users',
    'DATA_Children',
    'DATA_UserChildAccess',
    'DATA_Sessions',
    'MST_Subjects',
    'MST_Curriculums',
    'MST_Books',
    'MST_Topics',
    'MST_Lessons',
    'MST_LessonBlocks',
    'MST_Activities',
    'MST_Skills',
    'MST_LessonSkills',
    'MST_MediaAssets',
    'MST_Questions',
    'MST_QuestionOptions',
    'MST_Assessments',
    'MST_AssessmentQuestions',
    'DATA_Attempts',
    'DATA_Responses',
    'DATA_LessonProgress',
    'DATA_SkillProgress',
    'DATA_StudySessions',
    'DATA_Assignments',
    'DATA_DailyGoals',
    'DATA_ReviewQueue',
    'MST_Achievements',
    'DATA_ChildAchievements',
    'DATA_RewardTransactions',
    'DATA_Streaks',
    'MST_LibraryItems',
    'DATA_LibraryProgress',
    'DATA_Notifications',
    'STG_ContentImports',
    'STG_Questions',
    'STG_ApprovalQueue',
    'DATA_AIJobs',
    'LOG_AI'
  ];
}


/**
 * Find active legacy sheet names.
 */
function kidlearnV3_3mdFindActiveLegacySheetNames_(
  spreadsheet
) {
  var legacy = {
    Data_Tasks: true,
    Data_Users: true,
    Data_Scores: true,
    Thiet_Lap: true,
    Danh_Muc: true,
    Log_HeThong: true
  };

  var names = [];
  var sheets =
    spreadsheet.getSheets();

  for (var i = 0; i < sheets.length; i++) {
    var name =
      sheets[i].getName();

    if (legacy[name]) {
      names.push(name);
    }
  }

  return names;
}


/**
 * Database spreadsheet.
 */
function kidlearnV3_3mdGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3mdResolveSpreadsheet_(
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
function kidlearnV3_3mdResolveSpreadsheet_(value) {
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
function kidlearnV3_3mdGetSheet_(
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
 * Safe assert helper.
 */
function kidlearnV3_3mdSafeAssert_(
  functionName,
  label
) {
  try {
    var exists =
      eval(
        'typeof ' +
        functionName +
        ' === "function"'
      );

    if (!exists) {
      return {
        success: false,
        label: label,
        message:
          'Thiếu function ' + functionName
      };
    }

    var fn =
      eval(functionName);

    var result =
      fn();

    return {
      success:
        result && result.success === true,
      label: label,
      message:
        result && result.success === true
          ? ''
          : JSON.stringify(result)
    };

  } catch (error) {
    return {
      success: false,
      label: label,
      message:
        String(error.message || error)
    };
  }
}


/**
 * Safe Write status.
 */
function kidlearnV3_3mdSafeWriteStatus_() {
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
function kidlearnV3_3mdControlledWriteStatus_() {
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
function kidlearnV3_3mdCheckFunctions_(names) {
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
 * Save checklist compact.
 */
function kidlearnV3_3mdSaveChecklist_(result) {
  var compact = {
    success: result.success,
    action: result.action,
    bundle: result.bundle,
    phase: result.phase,
    nextStage: result.nextStage,
    decision: result.decision,
    prodDeployNow: false,
    startedAt: result.startedAt,
    finishedAt: result.finishedAt,
    durationMs: result.durationMs,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    errors: result.errors,
    warnings: result.warnings,
    checklist: result.checklist,
    requiredManualBeforeProd: result.requiredManualBeforeProd
  };

  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PROD_CANDIDATE_3MD_KEYS.LAST_CHECKLIST_JSON,
      JSON.stringify(compact)
    );
}


/**
 * Save result compact.
 */
function kidlearnV3_3mdSaveResult_(
  result,
  status,
  dateKey
) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_CANDIDATE_3MD_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_CANDIDATE_3MD_STATUS.READY_FOR_PROD_CANDIDATE_REVIEW &&
    (
      status === KIDLEARN_V3_PROD_CANDIDATE_3MD_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_CANDIDATE_3MD_STATUS.CHECKLIST_PASSED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_CANDIDATE_3MD_STATUS.READY_FOR_PROD_CANDIDATE_REVIEW;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_CANDIDATE_3MD_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_CANDIDATE_3MD_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      decision: result.decision || '',
      prodDeployNow: false,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      errors: result.errors || [],
      warnings: result.warnings || [],
      at: new Date().toISOString()
    })
  );
}


/**
 * Read JSON property.
 */
function kidlearnV3_3mdReadJsonProperty_(key) {
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