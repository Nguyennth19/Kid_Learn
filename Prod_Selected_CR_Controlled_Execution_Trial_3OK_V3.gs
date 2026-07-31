/**
 * ================================================================
 * KIDLEARN V3 - PROD SELECTED CHANGE REQUEST CONTROLLED EXECUTION TRIAL
 * Bundle: 3O-K
 * Version: 3.1.0
 * ================================================================
 *
 * 3O-K:
 * - Controlled execution trial sau final approval 3O-J.
 * - Trial mặc định chỉ append 01 dòng vào PROD LOG_Audit.
 * - Không execute selected DATA_FIX thật.
 * - Không sửa DATA_Users/DATA_Children/DATA_UserChildAccess.
 * - Không mở full PROD write policy.
 * - Không migration.
 * - Không rollback.
 * - Không tạo/xóa sheet.
 *
 * CẢNH BÁO:
 * - Hàm manual confirm trong file này có ghi 01 row vào PROD LOG_Audit.
 * - QA batch 3O-K KHÔNG chạy actual trial.
 */


var KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3OK_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3OK_LAST_PREVIEW_AT',
  LAST_PACKAGE_AT: 'KIDLEARN_V3_PHASE_3OK_LAST_PACKAGE_AT',
  LAST_TRIAL_AT: 'KIDLEARN_V3_PHASE_3OK_LAST_TRIAL_AT',
  LAST_VALIDATION_AT: 'KIDLEARN_V3_PHASE_3OK_LAST_VALIDATION_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3OK_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3OK_LAST_RESULT_JSON',
  LAST_PACKAGE_JSON: 'KIDLEARN_V3_PHASE_3OK_LAST_PACKAGE_JSON',
  LAST_TRIAL_JSON: 'KIDLEARN_V3_PHASE_3OK_LAST_TRIAL_JSON',
  LAST_VALIDATION_JSON: 'KIDLEARN_V3_PHASE_3OK_LAST_VALIDATION_JSON',
  CONTROLLED_TRIAL_ID: 'KIDLEARN_V3_PHASE_3OK_CONTROLLED_TRIAL_ID',
  AUDIT_ID: 'KIDLEARN_V3_PHASE_3OK_AUDIT_ID'
};


var KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  PACKAGE_GENERATED: 'PACKAGE_GENERATED',
  AUDIT_TRIAL_EXECUTED: 'AUDIT_TRIAL_EXECUTED',
  TRIAL_VALIDATED: 'TRIAL_VALIDATED',
  READY_FOR_3O_L: 'READY_FOR_3O_L',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG = {
  VERSION: '3O-K',
  PHASE: '3O-K',
  NEXT_BUNDLE: '3O-L',
  NEXT_STAGE: 'PROD_SELECTED_CHANGE_REQUEST_POST_TRIAL_VALIDATION_AND_RELEASE_DECISION',
  WRITE_MODE: 'CONTROLLED_AUDIT_TRIAL_ONLY',
  PROD_WRITE_ALLOWED_IN_QA: false,
  PROD_AUDIT_WRITE_ALLOWED_WITH_CONFIRM: true,
  REAL_SELECTED_REQUEST_EXECUTION_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  CONFIRM_TEXT: 'EXECUTE_SELECTED_CR_CONTROLLED_AUDIT_TRIAL_3O_K',
  TRIAL_MODE: 'AUDIT_LOG_ONLY',
  AUDIT_SHEET: 'LOG_Audit',
  EXPECTED_AUDIT_ROW_DELTA: 1,
  TARGET_NO_UNEXPECTED_CHANGE_SHEETS: [
    'LOG_Audit',
    'DATA_Users',
    'DATA_Children',
    'DATA_UserChildAccess',
    'MST_Lessons',
    'MST_LessonBlocks',
    'MST_Activities',
    'MST_Questions',
    'MST_QuestionOptions',
    'DATA_StudySessions',
    'DATA_LessonProgress',
    'DATA_DailyGoals',
    'DATA_Responses'
  ]
};


/**
 * Preview 3O-K.
 */
function kidlearnV3_previewProdSelectedCRControlledExecutionTrial3OKV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3okCheckFunctions_([
      'kidlearnV3_assertProdSelectedCRFinalExecutionApproval3OJReadyV3',
      'kidlearnV3_getProdSelectedCRFinalExecutionApproval3OJStatusV3',
      'kidlearnV3_getProdSelectedChangeRequestExecutionPackage3OIStatusV3',
      'kidlearnV3_getProdChangeRequestExecutionDryRun3OGStatusV3',
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3OJ =
    kidlearnV3_3okSafeAssert_(
      'kidlearnV3_assertProdSelectedCRFinalExecutionApproval3OJReadyV3',
      '3O-J'
    );

  if (!phase3OJ.success) {
    errors.push(
      '3O-J chưa READY_FOR_3O_K: ' +
      phase3OJ.message
    );
  }

  var finalApproval =
    kidlearnV3_3okSafeCall_(
      'kidlearnV3_getProdSelectedCRFinalExecutionApproval3OJStatusV3'
    );

  if (
    finalApproval.summary.status &&
    finalApproval.summary.status !== 'READY_FOR_3O_K'
  ) {
    errors.push(
      '3O-J final approval chưa READY_FOR_3O_K. Status=' +
      finalApproval.summary.status
    );
  }

  var selectedPackage =
    kidlearnV3_3okGetSelectedPackageInfo_();

  if (!selectedPackage.executionPackageId) {
    errors.push('Thiếu executionPackageId từ 3O-I.');
  }

  if (!selectedPackage.selectedRequestId) {
    errors.push('Thiếu selectedRequestId từ 3O-I.');
  }

  if (!selectedPackage.selectedRequestType) {
    errors.push('Thiếu selectedRequestType từ 3O-I.');
  }

  var finalLock =
    kidlearnV3_3okSafeCall_(
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3'
    );

  if (
    finalLock.summary.status &&
    finalLock.summary.status !== 'PROD_RELEASE_LOCKED'
  ) {
    errors.push(
      '3N-J chưa PROD_RELEASE_LOCKED. Status=' +
      finalLock.summary.status
    );
  }

  var prodInfo =
    kidlearnV3_3okGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodCheck =
    kidlearnV3_3okCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file chưa accessible: ' +
      prodCheck.message
    );
  }

  var auditSheetCheck =
    kidlearnV3_3okCheckAuditSheetReady_(
      prodInfo.prodFileId
    );

  if (!auditSheetCheck.success) {
    errors.push(
      'PROD LOG_Audit chưa sẵn sàng: ' +
      auditSheetCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3okCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_SELECTED_CR_CONTROLLED_EXECUTION_TRIAL_3OK_V3',
    bundle: '3O-K',
    phase: KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.WRITE_MODE,
    confirmText:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.CONFIRM_TEXT,
    trialMode:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.TRIAL_MODE,
    prodWriteAllowedInQa: false,
    prodAuditWriteAllowedWithConfirm: true,
    realSelectedRequestExecutionAllowed: false,
    prodDeployNow: false,
    selectedDataChangedNow: false,
    fullProdWritePolicyOpenedNow: false,
    migrationExecutedNow: false,
    rollbackExecutedNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3OJ: phase3OJ,
    finalApproval: finalApproval.summary,
    selectedPackage: selectedPackage,
    finalLock: finalLock.summary,
    prodInfo: prodInfo,
    prodCheck: prodCheck,
    auditSheetCheck: auditSheetCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3O-K package/preview không ghi PROD. Actual trial chỉ append 01 row vào PROD LOG_Audit khi chạy manual confirm.'
  };

  kidlearnV3_3okSaveResult_(
    result,
    KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Generate controlled trial package.
 *
 * Không ghi PROD trong hàm này.
 */
function kidlearnV3_generateProdSelectedCRControlledExecutionTrialPackage3OKV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdSelectedCRControlledExecutionTrial3OKV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate controlled trial package 3O-K vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var controlledTrialId =
    kidlearnV3_3okMakeControlledTrialId_();

  var prodInfo =
    kidlearnV3_3okGetProdInfo_();

  var selectedPackage =
    kidlearnV3_3okGetSelectedPackageInfo_();

  var finalApproval =
    kidlearnV3_3okSafeCall_(
      'kidlearnV3_getProdSelectedCRFinalExecutionApproval3OJStatusV3'
    );

  var selectedPackageStatus =
    kidlearnV3_3okSafeCall_(
      'kidlearnV3_getProdSelectedChangeRequestExecutionPackage3OIStatusV3'
    );

  var dryRun =
    kidlearnV3_3okSafeCall_(
      'kidlearnV3_getProdChangeRequestExecutionDryRun3OGStatusV3'
    );

  var finalLock =
    kidlearnV3_3okSafeCall_(
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3'
    );

  var prodCheck =
    kidlearnV3_3okCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi generate trial package: ' +
      prodCheck.message
    );
  }

  var auditSheetCheck =
    kidlearnV3_3okCheckAuditSheetReady_(
      prodInfo.prodFileId
    );

  if (!auditSheetCheck.success) {
    errors.push(
      'LOG_Audit chưa ready: ' +
      auditSheetCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3okCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var trialPolicy =
    kidlearnV3_3okBuildTrialPolicy_(
      selectedPackage
    );

  var finishedAt = new Date();

  var packageResult = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_SELECTED_CR_CONTROLLED_EXECUTION_TRIAL_PACKAGE_3OK_V3',
    bundle: '3O-K',
    phase: KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.PACKAGE_GENERATED
        : KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.FAILED,
    controlledTrialId: controlledTrialId,
    nextBundle:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.NEXT_STAGE,
    confirmText:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.CONFIRM_TEXT,
    trialMode:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.TRIAL_MODE,
    expectedProdWrite: 'APPEND_1_ROW_TO_LOG_Audit_ONLY',
    expectedAuditRowDelta:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.EXPECTED_AUDIT_ROW_DELTA,
    prodWriteAllowedInQa: false,
    prodAuditWriteAllowedWithConfirm: true,
    realSelectedRequestExecutionAllowed: false,
    prodDeployNow: false,
    selectedDataChangedNow: false,
    fullProdWritePolicyOpenedNow: false,
    migrationExecutedNow: false,
    rollbackExecutedNow: false,

    prodReference: {
      prodFileId: prodInfo.prodFileId || '',
      prodFileUrl: prodInfo.prodFileUrl || '',
      prodFileName: prodInfo.prodFileName || '',
      deploymentId: prodInfo.deploymentId || '',
      accessible: prodCheck.success
    },

    selectedPackage: selectedPackage,

    upstreamReadiness: {
      finalApproval3OJ: finalApproval.summary,
      selectedPackage3OI: selectedPackageStatus.summary,
      dryRun3OG: dryRun.summary,
      finalLock3NJ: finalLock.summary
    },

    auditSheetCheck: auditSheetCheck,
    trialPolicy: trialPolicy,

    trialChecklist: [
      {
        item: '3O-J final approval ready',
        passed:
          finalApproval.summary.status === 'READY_FOR_3O_K'
      },
      {
        item: '3O-I selected package ready',
        passed:
          selectedPackageStatus.summary.status === 'READY_FOR_3O_J'
      },
      {
        item: '3O-G dry-run rehearsal ready',
        passed:
          dryRun.summary.status === 'READY_FOR_3O_H'
      },
      {
        item: 'PROD release remains locked',
        passed:
          finalLock.summary.status === 'PROD_RELEASE_LOCKED'
      },
      {
        item: 'PROD file accessible',
        passed: prodCheck.success
      },
      {
        item: 'LOG_Audit exists and has row 2 keys',
        passed: auditSheetCheck.success
      },
      {
        item: 'Safe Write remains DRY_RUN/enabled=false',
        passed:
          safeModes.summary.safeWriteMode === 'DRY_RUN' &&
          safeModes.summary.safeWriteEnabled === false
      },
      {
        item: 'Trial is audit-only',
        passed: true
      },
      {
        item: 'Selected data will not be changed in 3O-K',
        passed: true
      }
    ],

    noSideEffectAtPackageStage: {
      prodFileModifiedBy3OKPackage: false,
      prodDataWrittenBy3OKPackage: false,
      prodSheetCreatedBy3OKPackage: false,
      prodSheetDeletedBy3OKPackage: false,
      selectedRequestExecutedBy3OKPackage: false,
      fullProdWritePolicyOpenedBy3OKPackage: false,
      rollbackExecutedBy3OKPackage: false
    },

    safeModes: safeModes.summary,

    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() - startedAt.getTime(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_3okSavePackage_(
    packageResult
  );

  kidlearnV3_3okSaveResult_(
    packageResult,
    packageResult.success
      ? KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.PACKAGE_GENERATED
      : KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.FAILED,
    KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.LAST_PACKAGE_AT
  );

  console.log(JSON.stringify(packageResult, null, 2));

  if (!packageResult.success) {
    throw new Error(
      '3O-K controlled trial package failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return packageResult;
}


/**
 * Manual confirm wrapper.
 *
 * CẢNH BÁO:
 * - Hàm này ghi 01 dòng vào PROD LOG_Audit.
 * - Không sửa selected data thật.
 */
function kidlearnV3_executeProdSelectedCRControlledAuditTrial3OKManualConfirmV3() {
  return kidlearnV3_executeProdSelectedCRControlledAuditTrial3OKV3({
    confirmText:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.CONFIRM_TEXT,
    executedBy: 'DEV_CONTROLLED_TRIAL_MANAGER_MANUAL_3OK',
    trialNote:
      '3O-K controlled audit-only trial. Append 1 row to PROD LOG_Audit only. No selected data change.'
  });
}


/**
 * Execute controlled audit-only trial.
 *
 * options:
 * {
 *   confirmText: 'EXECUTE_SELECTED_CR_CONTROLLED_AUDIT_TRIAL_3O_K',
 *   executedBy: '...',
 *   trialNote: '...',
 *   allowRepeatTrial: false
 * }
 */
function kidlearnV3_executeProdSelectedCRControlledAuditTrial3OKV3(options) {
  var startedAt = new Date();
  var req =
    kidlearnV3_3okNormalizeOptions_(options);

  var errors = [];
  var warnings = [];

  if (
    String(req.confirmText || '') !==
    KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.CONFIRM_TEXT
  ) {
    errors.push(
      'Confirm text không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.CONFIRM_TEXT
    );
  }

  var status =
    kidlearnV3_getProdSelectedCRControlledExecutionTrial3OKStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.PACKAGE_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.AUDIT_TRIAL_EXECUTED &&
    status.status !== KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.TRIAL_VALIDATED &&
    status.status !== KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.READY_FOR_3O_L
  ) {
    errors.push(
      '3O-K cần PACKAGE_GENERATED trước khi execute audit trial. Status=' +
      status.status
    );
  }

  if (
    (
      status.status === KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.AUDIT_TRIAL_EXECUTED ||
      status.status === KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.TRIAL_VALIDATED ||
      status.status === KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.READY_FOR_3O_L
    ) &&
    req.allowRepeatTrial !== true
  ) {
    errors.push(
      '3O-K audit trial đã chạy rồi. Không chạy lại để tránh append nhiều audit rows. Muốn chạy lại phải gọi options allowRepeatTrial=true có kiểm soát.'
    );
  }

  if (
    !status.lastPackage ||
    status.lastPackage.success !== true
  ) {
    errors.push(
      'Last controlled trial package chưa success=true.'
    );
  }

  var prodInfo =
    kidlearnV3_3okGetProdInfo_();

  var prodCheck =
    kidlearnV3_3okCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi execute trial: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3okCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var selectedPackage =
    kidlearnV3_3okGetSelectedPackageInfo_();

  if (!selectedPackage.selectedRequestId) {
    errors.push('Thiếu selectedRequestId.');
  }

  if (!selectedPackage.selectedRequestType) {
    errors.push('Thiếu selectedRequestType.');
  }

  if (errors.length > 0) {
    var failedBeforeWrite = {
      success: false,
      action: 'EXECUTE_PROD_SELECTED_CR_CONTROLLED_AUDIT_TRIAL_3OK_V3',
      bundle: '3O-K',
      phase: KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.PHASE,
      status: status.status,
      prodAuditWriteAttempted: false,
      prodAuditWriteExecuted: false,
      selectedDataChangedNow: false,
      selectedRequestExecutedNow: false,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors: errors,
      warnings: warnings
    };

    console.log(JSON.stringify(failedBeforeWrite, null, 2));

    throw new Error(
      'Không thể execute controlled audit trial 3O-K. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var prodSpreadsheet =
    SpreadsheetApp.openById(
      prodInfo.prodFileId
    );

  var beforeSnapshot =
    kidlearnV3_3okSnapshotRowCounts_(
      prodSpreadsheet,
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.TARGET_NO_UNEXPECTED_CHANGE_SHEETS
    );

  var controlledTrialId =
    status.controlledTrialId ||
    kidlearnV3_3okMakeControlledTrialId_();

  var appendResult =
    kidlearnV3_3okAppendAuditTrialRow_(
      prodSpreadsheet,
      controlledTrialId,
      selectedPackage,
      prodInfo,
      req
    );

  SpreadsheetApp.flush();

  var afterSnapshot =
    kidlearnV3_3okSnapshotRowCounts_(
      prodSpreadsheet,
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.TARGET_NO_UNEXPECTED_CHANGE_SHEETS
    );

  var compare =
    kidlearnV3_3okCompareExpectedAuditOnlyChange_(
      beforeSnapshot,
      afterSnapshot
    );

  errors = errors.concat(compare.errors);
  warnings = warnings.concat(compare.warnings);

  var finishedAt = new Date();

  var trial = {
    success: errors.length === 0,
    action: 'EXECUTE_PROD_SELECTED_CR_CONTROLLED_AUDIT_TRIAL_3OK_V3',
    bundle: '3O-K',
    phase: KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.AUDIT_TRIAL_EXECUTED
        : KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.FAILED,
    controlledTrialId: controlledTrialId,
    auditId: appendResult.auditId || '',
    auditRowNumber: appendResult.rowNumber || 0,
    executionPackageId: selectedPackage.executionPackageId || '',
    selectedRequestId: selectedPackage.selectedRequestId || '',
    selectedRequestType: selectedPackage.selectedRequestType || '',
    trialMode:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.TRIAL_MODE,
    nextBundle:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',

    prodAuditWriteAttempted: true,
    prodAuditWriteExecuted:
      appendResult.success === true,
    prodAuditWriteSheet:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.AUDIT_SHEET,
    prodAuditRowDeltaExpected: 1,
    realSelectedRequestExecutionAllowed: false,
    selectedRequestExecutedNow: false,
    selectedDataChangedNow: false,
    fullProdWritePolicyOpenedNow: false,
    migrationExecutedNow: false,
    rollbackExecutedNow: false,
    prodDeployNow: false,

    appendResult: appendResult,
    beforeSnapshot: beforeSnapshot,
    afterSnapshot: afterSnapshot,
    compare: compare.summary,
    safeModes: safeModes.summary,

    noSideEffectExceptAuditRow: {
      logAuditRowAppendedBy3OK: appendResult.success === true,
      prodFileModifiedBy3OK: appendResult.success === true,
      selectedDataModifiedBy3OK: false,
      prodSheetCreatedBy3OK: false,
      prodSheetDeletedBy3OK: false,
      selectedRequestExecutedBy3OK: false,
      fullProdWritePolicyOpenedBy3OK: false,
      rollbackExecutedBy3OK: false
    },

    executedBy:
      req.executedBy || 'DEV_CONTROLLED_TRIAL_MANAGER_MANUAL_3OK',
    trialNote:
      req.trialNote || '',
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() - startedAt.getTime(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_3okSaveTrial_(
    trial
  );

  kidlearnV3_3okSaveResult_(
    trial,
    trial.success
      ? KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.AUDIT_TRIAL_EXECUTED
      : KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.FAILED,
    KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.LAST_TRIAL_AT
  );

  console.log(JSON.stringify(trial, null, 2));

  if (!trial.success) {
    throw new Error(
      '3O-K controlled audit trial failed sau khi write attempt. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return trial;
}


/**
 * Validate controlled audit trial.
 *
 * Không ghi PROD.
 */
function kidlearnV3_validateProdSelectedCRControlledExecutionTrial3OKV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var status =
    kidlearnV3_getProdSelectedCRControlledExecutionTrial3OKStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.AUDIT_TRIAL_EXECUTED &&
    status.status !== KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.TRIAL_VALIDATED &&
    status.status !== KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.READY_FOR_3O_L
  ) {
    errors.push(
      '3O-K cần AUDIT_TRIAL_EXECUTED trước khi validate. Status=' +
      status.status
    );
  }

  if (
    !status.lastTrial ||
    status.lastTrial.success !== true
  ) {
    errors.push(
      'Last trial chưa success=true.'
    );
  }

  var trial =
    status.lastTrial || {};

  if (!trial.controlledTrialId) {
    errors.push('Thiếu controlledTrialId trong lastTrial.');
  }

  if (!trial.auditId) {
    errors.push('Thiếu auditId trong lastTrial.');
  }

  if (trial.prodAuditWriteExecuted !== true) {
    errors.push('prodAuditWriteExecuted chưa true.');
  }

  if (trial.selectedRequestExecutedNow === true) {
    errors.push('3O-K không được selectedRequestExecutedNow=true.');
  }

  if (trial.selectedDataChangedNow === true) {
    errors.push('3O-K không được selectedDataChangedNow=true.');
  }

  if (trial.fullProdWritePolicyOpenedNow === true) {
    errors.push('3O-K không được fullProdWritePolicyOpenedNow=true.');
  }

  var prodInfo =
    kidlearnV3_3okGetProdInfo_();

  var prodCheck =
    kidlearnV3_3okCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi validate trial: ' +
      prodCheck.message
    );
  }

  var findAudit =
    kidlearnV3_3okFindAuditTrialRow_(
      prodInfo.prodFileId,
      trial.controlledTrialId,
      trial.auditId
    );

  if (!findAudit.success) {
    errors.push(
      'Không tìm thấy audit trial row trong PROD LOG_Audit: ' +
      findAudit.message
    );
  }

  var compareOk =
    trial.compare &&
    trial.compare.expectedAuditOnlyChangeConfirmed === true;

  if (!compareOk) {
    errors.push(
      'Trial compare chưa xác nhận expectedAuditOnlyChangeConfirmed=true.'
    );
  }

  var safeModes =
    kidlearnV3_3okCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var finishedAt = new Date();

  var validation = {
    success: errors.length === 0,
    action: 'VALIDATE_PROD_SELECTED_CR_CONTROLLED_EXECUTION_TRIAL_3OK_V3',
    bundle: '3O-K',
    phase: KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.TRIAL_VALIDATED
        : KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.FAILED,
    controlledTrialId: trial.controlledTrialId || '',
    auditId: trial.auditId || '',
    auditRowNumber: trial.auditRowNumber || 0,
    executionPackageId: trial.executionPackageId || '',
    selectedRequestId: trial.selectedRequestId || '',
    selectedRequestType: trial.selectedRequestType || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',

    validationSummary: {
      auditRowFound: findAudit.success,
      auditRowNumberFound: findAudit.rowNumber || 0,
      expectedAuditOnlyChangeConfirmed: compareOk,
      selectedRequestExecutedNow: false,
      selectedDataChangedNow: false,
      fullProdWritePolicyOpenedNow: false,
      safeModes: safeModes.summary
    },

    findAudit: findAudit,

    noSideEffectExceptAuditRow: {
      logAuditRowAppendedBy3OK: true,
      selectedDataModifiedBy3OK: false,
      selectedRequestExecutedBy3OK: false,
      fullProdWritePolicyOpenedBy3OK: false,
      rollbackExecutedBy3OK: false
    },

    validationDecision:
      errors.length === 0
        ? 'READY_FOR_POST_TRIAL_VALIDATION_AND_RELEASE_DECISION_3O_L'
        : 'HOLD_TRIAL_VALIDATION_FAILED',

    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() - startedAt.getTime(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_3okSaveValidation_(
    validation
  );

  kidlearnV3_3okSaveResult_(
    validation,
    validation.success
      ? KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.TRIAL_VALIDATED
      : KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.FAILED,
    KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.LAST_VALIDATION_AT
  );

  console.log(JSON.stringify(validation, null, 2));

  if (!validation.success) {
    throw new Error(
      '3O-K controlled trial validation failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return validation;
}


/**
 * Mark 3O-K ready.
 */
function kidlearnV3_markProdSelectedCRControlledExecutionTrial3OKReadyV3() {
  var status =
    kidlearnV3_getProdSelectedCRControlledExecutionTrial3OKStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.TRIAL_VALIDATED &&
    status.status !== KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.READY_FOR_3O_L
  ) {
    errors.push(
      '3O-K chưa TRIAL_VALIDATED. Status=' +
      status.status
    );
  }

  if (
    !status.lastTrial ||
    status.lastTrial.success !== true
  ) {
    errors.push(
      'Last trial chưa success=true.'
    );
  }

  if (
    !status.lastValidation ||
    status.lastValidation.success !== true
  ) {
    errors.push(
      'Last validation chưa success=true.'
    );
  }

  if (!status.controlledTrialId) {
    errors.push(
      'Thiếu controlledTrialId.'
    );
  }

  if (!status.auditId) {
    errors.push(
      'Thiếu auditId.'
    );
  }

  var prodInfo =
    kidlearnV3_3okGetProdInfo_();

  var prodCheck =
    kidlearnV3_3okCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi mark ready: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3okCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3O-K ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var selectedPackage =
    kidlearnV3_3okGetSelectedPackageInfo_();

  var result = {
    success: true,
    action: 'MARK_PROD_SELECTED_CR_CONTROLLED_EXECUTION_TRIAL_3OK_READY_V3',
    bundle: '3O-K',
    phase: KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.READY_FOR_3O_L,
    controlledTrialId: status.controlledTrialId || '',
    auditId: status.auditId || '',
    executionPackageId: selectedPackage.executionPackageId || '',
    selectedRequestId: selectedPackage.selectedRequestId || '',
    selectedRequestType: selectedPackage.selectedRequestType || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.NEXT_STAGE,

    prodAuditWriteExecuted: true,
    selectedRequestExecutedNow: false,
    selectedDataChangedNow: false,
    fullProdWritePolicyOpenedNow: false,
    migrationExecutedNow: false,
    rollbackExecutedNow: false,
    prodDeployNow: false,

    message:
      '3O-K ready. Controlled audit-only trial đã pass. Bước tiếp theo là 3O-L post-trial validation and release decision.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3okSaveResult_(
    result,
    KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.READY_FOR_3O_L,
    KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3O-K status.
 */
function kidlearnV3_getProdSelectedCRControlledExecutionTrial3OKStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_SELECTED_CR_CONTROLLED_EXECUTION_TRIAL_3OK_STATUS_V3',
    bundle: '3O-K',
    phase: KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.NOT_RUN,
    controlledTrialId:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.CONTROLLED_TRIAL_ID
      ) ||
      '',
    auditId:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.AUDIT_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastPackageAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.LAST_PACKAGE_AT
      ) ||
      '',
    lastTrialAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.LAST_TRIAL_AT
      ) ||
      '',
    lastValidationAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.LAST_VALIDATION_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3okReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.LAST_RESULT_JSON
      ),
    lastPackage:
      kidlearnV3_3okReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.LAST_PACKAGE_JSON
      ),
    lastTrial:
      kidlearnV3_3okReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.LAST_TRIAL_JSON
      ),
    lastValidation:
      kidlearnV3_3okReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.LAST_VALIDATION_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3O-K ready.
 */
function kidlearnV3_assertProdSelectedCRControlledExecutionTrial3OKReadyV3() {
  var status =
    kidlearnV3_getProdSelectedCRControlledExecutionTrial3OKStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.READY_FOR_3O_L
  ) {
    errors.push(
      '3O-K chưa READY_FOR_3O_L. Status=' +
      status.status
    );
  }

  if (!status.controlledTrialId) {
    errors.push(
      'Thiếu controlledTrialId.'
    );
  }

  if (!status.auditId) {
    errors.push(
      'Thiếu auditId.'
    );
  }

  var prodInfo =
    kidlearnV3_3okGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_SELECTED_CR_CONTROLLED_EXECUTION_TRIAL_3OK_READY_V3',
    bundle: '3O-K',
    phase: KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.PHASE,
    status: status.status,
    controlledTrialId: status.controlledTrialId || '',
    auditId: status.auditId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.NEXT_BUNDLE,
    prodAuditWriteExecuted: true,
    selectedRequestExecutedNow: false,
    selectedDataChangedNow: false,
    fullProdWritePolicyOpenedNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3O-K chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3O-K package-only.
 *
 * KHÔNG execute controlled audit trial trong QA batch.
 */
function kidlearnV3_getQaBatchSteps3OKV3() {
  return [
    {
      label: 'Assert 3O-J ready',
      functionName: 'kidlearnV3_assertProdSelectedCRFinalExecutionApproval3OJReadyV3'
    },
    {
      label: 'Preview PROD Selected CR Controlled Trial 3O-K',
      functionName: 'kidlearnV3_previewProdSelectedCRControlledExecutionTrial3OKV3'
    },
    {
      label: 'Generate PROD Selected CR Controlled Trial Package 3O-K',
      functionName: 'kidlearnV3_generateProdSelectedCRControlledExecutionTrialPackage3OKV3'
    }
  ];
}


/**
 * QA batch 3O-K package-only.
 */
function kidlearnV3_runQaBatch3OKV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3O_K_PROD_SELECTED_CR_CONTROLLED_EXECUTION_TRIAL_PACKAGE_ONLY',
    kidlearnV3_getQaBatchSteps3OKV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build trial policy.
 */
function kidlearnV3_3okBuildTrialPolicy_(selectedPackage) {
  return {
    trialName:
      'KIDLEARN V3 PROD Selected CR Controlled Audit-only Trial',
    trialScope:
      'Append exactly 1 row to PROD LOG_Audit to verify controlled execution path.',
    selectedRequestId:
      selectedPackage.selectedRequestId || '',
    selectedRequestType:
      selectedPackage.selectedRequestType || '',
    actualSelectedRequestExecution:
      false,
    trialMode:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.TRIAL_MODE,
    allowedIn3OKWithManualConfirm: [
      'Append 01 row to PROD LOG_Audit only.',
      'Capture before/after row counts.',
      'Validate LOG_Audit row delta = +1.',
      'Validate selected data sheets have no row/column count changes.'
    ],
    blockedIn3OK: [
      'DATA_Users modification',
      'DATA_Children modification',
      'DATA_UserChildAccess modification',
      'MST content modification',
      'DATA progress modification',
      'Full PROD write enable',
      'Migration',
      'Rollback',
      'Sheet create/delete',
      'New PROD deploy'
    ],
    requiredBeforeRunningManualTrial: [
      '3O-J READY_FOR_3O_K',
      '3O-K package generated',
      'Manual confirm text',
      'PROD LOG_Audit accessible',
      'Safe Write DEV layer remains DRY_RUN/enabled=false'
    ],
    validationAfterTrial: [
      'Find audit row by controlledTrialId and auditId',
      'Check LOG_Audit row delta +1',
      'Check no unexpected row/column changes in monitored sheets',
      'Mark ready only after validation'
    ],
    rollbackPolicy:
      '3O-K không tự rollback. Audit row là trace log của trial. Nếu cần xoá/revert audit row phải tạo rollback phase riêng.'
  };
}


/**
 * Append 1 row to PROD LOG_Audit.
 */
function kidlearnV3_3okAppendAuditTrialRow_(spreadsheet, controlledTrialId, selectedPackage, prodInfo, req) {
  var sheet =
    kidlearnV3_3okGetSheet_(
      spreadsheet,
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.AUDIT_SHEET
    );

  if (!sheet) {
    throw new Error('Không tìm thấy LOG_Audit trong PROD file.');
  }

  var lastColumn =
    sheet.getLastColumn();

  if (lastColumn < 1) {
    throw new Error('LOG_Audit không có cột.');
  }

  var keys =
    sheet
      .getRange(2, 1, 1, lastColumn)
      .getDisplayValues()[0];

  var nonBlankKeyCount = 0;

  for (var k = 0; k < keys.length; k++) {
    if (String(keys[k] || '').trim()) {
      nonBlankKeyCount++;
    }
  }

  if (nonBlankKeyCount < 1) {
    throw new Error('LOG_Audit row 2 chưa có field keys.');
  }

  var now =
    new Date().toISOString();

  var auditId =
    'AUDIT_3OK_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    ) +
    '_' +
    Math.floor(Math.random() * 100000);

  var metadata = {
    bundle: '3O-K',
    phase: '3O-K',
    controlledTrialId: controlledTrialId,
    auditId: auditId,
    trialMode:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.TRIAL_MODE,
    selectedRequestId:
      selectedPackage.selectedRequestId || '',
    selectedRequestType:
      selectedPackage.selectedRequestType || '',
    executionPackageId:
      selectedPackage.executionPackageId || '',
    prodFileId:
      prodInfo.prodFileId || '',
    selectedRequestExecutedNow: false,
    selectedDataChangedNow: false,
    fullProdWritePolicyOpenedNow: false,
    note:
      req.trialNote ||
      '3O-K audit-only controlled trial.'
  };

  var valuesByKey =
    kidlearnV3_3okBuildAuditValueMap_({
      auditId: auditId,
      controlledTrialId: controlledTrialId,
      now: now,
      selectedPackage: selectedPackage,
      prodInfo: prodInfo,
      req: req,
      metadata: metadata
    });

  var row = [];

  for (var c = 0; c < keys.length; c++) {
    row.push(
      kidlearnV3_3okValueForAuditKey_(
        keys[c],
        valuesByKey
      )
    );
  }

  sheet.appendRow(row);

  var rowNumber =
    sheet.getLastRow();

  return {
    success: true,
    auditId: auditId,
    controlledTrialId: controlledTrialId,
    rowNumber: rowNumber,
    sheetName:
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.AUDIT_SHEET,
    message:
      'Appended 1 audit-only trial row to PROD LOG_Audit.',
    metadata: metadata
  };
}


/**
 * Build audit value map.
 */
function kidlearnV3_3okBuildAuditValueMap_(input) {
  var metadataJson =
    JSON.stringify(input.metadata || {});

  var selected =
    input.selectedPackage || {};

  var req =
    input.req || {};

  var common = {
    auditId: input.auditId,
    logId: input.auditId,
    eventId: input.auditId,
    id: input.auditId,

    eventType: 'PROD_CR_CONTROLLED_AUDIT_TRIAL_3OK',
    eventCode: 'PROD_CR_CONTROLLED_AUDIT_TRIAL_3OK',
    action: 'APPEND_AUDIT_TRIAL_ONLY',
    eventAction: 'APPEND_AUDIT_TRIAL_ONLY',
    operation: 'CONTROLLED_AUDIT_TRIAL',

    entityType: 'CHANGE_REQUEST_TRIAL',
    entityId: selected.selectedRequestId || '',
    referenceId: input.controlledTrialId,
    transactionId: input.controlledTrialId,
    trialId: input.controlledTrialId,
    controlledTrialId: input.controlledTrialId,

    source: '3O-K',
    sourcePhase: '3O-K',
    sourceBundle: '3O-K',
    module: 'PROD_CHANGE_REQUEST',

    actorRole: 'DEV_CONTROLLED_TRIAL_MANAGER',
    createdBy:
      req.executedBy ||
      'DEV_CONTROLLED_TRIAL_MANAGER_MANUAL_3OK',
    updatedBy:
      req.executedBy ||
      'DEV_CONTROLLED_TRIAL_MANAGER_MANUAL_3OK',

    message:
      '3O-K controlled audit-only trial. selectedRequestId=' +
      (selected.selectedRequestId || '') +
      ', selectedRequestType=' +
      (selected.selectedRequestType || '') +
      ', controlledTrialId=' +
      input.controlledTrialId +
      '. No selected data changed.',
    description:
      '3O-K controlled audit-only trial. No selected data changed.',

    status: 'ACTIVE',
    isDeleted: false,

    oldValueJson: '{}',
    newValueJson: metadataJson,
    metadataJson: metadataJson,
    payloadJson: metadataJson,
    detailsJson: metadataJson,

    createdAt: input.now,
    updatedAt: input.now,
    eventAt: input.now,
    timestamp: input.now
  };

  var map = {};

  for (var key in common) {
    if (common.hasOwnProperty(key)) {
      map[key] = common[key];
      map[kidlearnV3_3okNormalizeKey_(key)] = common[key];
    }
  }

  return map;
}


/**
 * Value by audit key.
 */
function kidlearnV3_3okValueForAuditKey_(key, valuesByKey) {
  var exact =
    String(key || '').trim();

  if (!exact) {
    return '';
  }

  if (valuesByKey.hasOwnProperty(exact)) {
    return valuesByKey[exact];
  }

  var normalized =
    kidlearnV3_3okNormalizeKey_(exact);

  if (valuesByKey.hasOwnProperty(normalized)) {
    return valuesByKey[normalized];
  }

  return '';
}


/**
 * Normalize key.
 */
function kidlearnV3_3okNormalizeKey_(key) {
  return String(key || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}


/**
 * Snapshot row counts.
 */
function kidlearnV3_3okSnapshotRowCounts_(spreadsheet, sheetNames) {
  var items = [];

  for (var i = 0; i < sheetNames.length; i++) {
    var sheetName =
      sheetNames[i];

    var sheet =
      kidlearnV3_3okGetSheet_(
        spreadsheet,
        sheetName
      );

    items.push({
      sheetName: sheetName,
      exists: sheet ? true : false,
      lastRow: sheet ? sheet.getLastRow() : 0,
      lastColumn: sheet ? sheet.getLastColumn() : 0
    });
  }

  return {
    capturedAt:
      new Date().toISOString(),
    items: items
  };
}


/**
 * Compare expected audit-only change.
 */
function kidlearnV3_3okCompareExpectedAuditOnlyChange_(beforeSnapshot, afterSnapshot) {
  var errors = [];
  var warnings = [];

  var beforeMap =
    kidlearnV3_3okMapSnapshots_(
      beforeSnapshot.items || []
    );

  var afterMap =
    kidlearnV3_3okMapSnapshots_(
      afterSnapshot.items || []
    );

  var compared = [];
  var changedSheetCount = 0;
  var auditDelta = null;

  for (var sheetName in beforeMap) {
    if (!beforeMap.hasOwnProperty(sheetName)) {
      continue;
    }

    var before =
      beforeMap[sheetName];

    var after =
      afterMap[sheetName] || {
        exists: false,
        lastRow: 0,
        lastColumn: 0
      };

    var rowDelta =
      after.lastRow - before.lastRow;

    var columnDelta =
      after.lastColumn - before.lastColumn;

    var changed =
      before.exists !== after.exists ||
      rowDelta !== 0 ||
      columnDelta !== 0;

    if (changed) {
      changedSheetCount++;
    }

    if (
      sheetName ===
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.AUDIT_SHEET
    ) {
      auditDelta = rowDelta;

      if (
        before.exists !== true ||
        after.exists !== true
      ) {
        errors.push('LOG_Audit phải tồn tại trước và sau trial.');
      }

      if (
        rowDelta !==
        KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.EXPECTED_AUDIT_ROW_DELTA
      ) {
        errors.push(
          'LOG_Audit rowDelta không đúng. Expected=1, Actual=' +
          rowDelta
        );
      }

      if (columnDelta !== 0) {
        errors.push(
          'LOG_Audit không được đổi số cột trong 3O-K. columnDelta=' +
          columnDelta
        );
      }

    } else {
      if (changed) {
        errors.push(
          'Sheet không được thay đổi trong 3O-K: ' +
          sheetName +
          '. rowDelta=' +
          rowDelta +
          ', columnDelta=' +
          columnDelta
        );
      }
    }

    compared.push({
      sheetName: sheetName,
      beforeLastRow: before.lastRow,
      afterLastRow: after.lastRow,
      rowDelta: rowDelta,
      beforeLastColumn: before.lastColumn,
      afterLastColumn: after.lastColumn,
      columnDelta: columnDelta,
      changed: changed
    });
  }

  var expectedAuditOnly =
    errors.length === 0 &&
    auditDelta ===
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.EXPECTED_AUDIT_ROW_DELTA;

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    compared: compared,
    summary: {
      checkedSheetCount: compared.length,
      changedSheetCount: changedSheetCount,
      auditRowDelta: auditDelta,
      expectedAuditOnlyChangeConfirmed: expectedAuditOnly
    }
  };
}


/**
 * Map snapshots.
 */
function kidlearnV3_3okMapSnapshots_(items) {
  var map = {};

  for (var i = 0; i < items.length; i++) {
    map[items[i].sheetName] = items[i];
  }

  return map;
}


/**
 * Find audit trial row.
 */
function kidlearnV3_3okFindAuditTrialRow_(prodFileId, controlledTrialId, auditId) {
  try {
    var spreadsheet =
      SpreadsheetApp.openById(prodFileId);

    var sheet =
      kidlearnV3_3okGetSheet_(
        spreadsheet,
        KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.AUDIT_SHEET
      );

    if (!sheet) {
      return {
        success: false,
        message: 'Không tìm thấy LOG_Audit.'
      };
    }

    var lastRow =
      sheet.getLastRow();

    var lastColumn =
      sheet.getLastColumn();

    if (lastRow < 3 || lastColumn < 1) {
      return {
        success: false,
        message: 'LOG_Audit chưa có data rows.'
      };
    }

    var startRow =
      Math.max(3, lastRow - 100);

    var numRows =
      lastRow - startRow + 1;

    var values =
      sheet
        .getRange(startRow, 1, numRows, lastColumn)
        .getDisplayValues();

    var needle1 =
      String(controlledTrialId || '');

    var needle2 =
      String(auditId || '');

    for (var r = 0; r < values.length; r++) {
      var joined =
        values[r].join(' | ');

      if (
        joined.indexOf(needle1) >= 0 &&
        joined.indexOf(needle2) >= 0
      ) {
        return {
          success: true,
          rowNumber: startRow + r,
          message: 'Found audit trial row.',
          controlledTrialId: controlledTrialId,
          auditId: auditId
        };
      }
    }

    return {
      success: false,
      message:
        'Không tìm thấy row chứa controlledTrialId và auditId trong 100 rows cuối LOG_Audit.',
      controlledTrialId: controlledTrialId,
      auditId: auditId
    };

  } catch (error) {
    return {
      success: false,
      message:
        String(error.message || error),
      controlledTrialId: controlledTrialId,
      auditId: auditId
    };
  }
}


/**
 * Check LOG_Audit ready.
 */
function kidlearnV3_3okCheckAuditSheetReady_(prodFileId) {
  try {
    if (!prodFileId) {
      return {
        success: false,
        message: 'Thiếu prodFileId.'
      };
    }

    var spreadsheet =
      SpreadsheetApp.openById(prodFileId);

    var sheet =
      kidlearnV3_3okGetSheet_(
        spreadsheet,
        KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.AUDIT_SHEET
      );

    if (!sheet) {
      return {
        success: false,
        message: 'Không tìm thấy LOG_Audit.'
      };
    }

    var lastColumn =
      sheet.getLastColumn();

    if (sheet.getLastRow() < 2 || lastColumn < 1) {
      return {
        success: false,
        message: 'LOG_Audit chưa có row 2 keys.'
      };
    }

    var keys =
      sheet
        .getRange(2, 1, 1, lastColumn)
        .getDisplayValues()[0];

    var nonBlank = 0;

    for (var i = 0; i < keys.length; i++) {
      if (String(keys[i] || '').trim()) {
        nonBlank++;
      }
    }

    return {
      success: nonBlank > 0,
      sheetName:
        KIDLEARN_V3_PROD_CR_TRIAL_3OK_CONFIG.AUDIT_SHEET,
      lastRow: sheet.getLastRow(),
      lastColumn: lastColumn,
      nonBlankKeyCount: nonBlank,
      message:
        nonBlank > 0
          ? 'LOG_Audit ready.'
          : 'LOG_Audit row 2 không có key.'
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
 * Get selected package info from 3O-I.
 */
function kidlearnV3_3okGetSelectedPackageInfo_() {
  try {
    var status =
      kidlearnV3_getProdSelectedChangeRequestExecutionPackage3OIStatusV3();

    var lastPackage =
      status.lastPackage || {};

    var selectedRequest =
      lastPackage.selectedRequest || {};

    var executionPlan =
      lastPackage.executionPlan || {};

    return {
      status: status.status || '',
      executionPackageId:
        status.executionPackageId ||
        lastPackage.executionPackageId ||
        '',
      selectedRequestId:
        status.selectedRequestId ||
        lastPackage.selectedRequestId ||
        selectedRequest.selectedRequestId ||
        '',
      selectedRequestType:
        status.selectedRequestType ||
        lastPackage.selectedRequestType ||
        selectedRequest.selectedRequestType ||
        '',
      prodWriteRequiredForActual:
        selectedRequest.prodWriteRequiredForActual === true ||
        (
          lastPackage.packagePolicy &&
          lastPackage.packagePolicy.prodWritePolicyRequiredForActualWrite === true
        ),
      executionMode:
        executionPlan.executionMode || '',
      packageSuccess:
        lastPackage.success === true
    };

  } catch (error) {
    return {
      status: '',
      executionPackageId: '',
      selectedRequestId: '',
      selectedRequestType: '',
      prodWriteRequiredForActual: false,
      executionMode: '',
      packageSuccess: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * PROD info từ 3N-F.
 */
function kidlearnV3_3okGetProdInfo_() {
  var status =
    kidlearnV3_getControlledProdDeployment3NFStatusV3();

  return {
    status: status.status || '',
    deploymentId: status.deploymentId || '',
    prodFileId: status.prodFileId || '',
    prodFileUrl: status.prodFileUrl || '',
    prodFileName: status.prodFileName || ''
  };
}


/**
 * Check file accessible.
 */
function kidlearnV3_3okCheckFileAccessible_(fileId, label) {
  try {
    if (!fileId) {
      return {
        success: false,
        label: label || '',
        fileId: '',
        message: 'Thiếu fileId.'
      };
    }

    var file =
      DriveApp.getFileById(fileId);

    return {
      success: true,
      label: label || '',
      fileId: fileId,
      fileName: file.getName(),
      fileUrl: file.getUrl(),
      message: 'File accessible.'
    };

  } catch (error) {
    return {
      success: false,
      label: label || '',
      fileId: fileId || '',
      message:
        String(error.message || error)
    };
  }
}


/**
 * Check safe modes.
 */
function kidlearnV3_3okCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3okSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Safe Write trong DEV script phải DRY_RUN/enabled=false trước và sau 3O-K. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var controlledWrite =
    kidlearnV3_3okControlledWriteStatus_();

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    errors.push(
      'Controlled Write DEV đang ENABLED. 3O-K trial phải độc lập và không mở full write.'
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
    summary: {
      safeWriteMode: safeWrite.mode || '',
      safeWriteEnabled: safeWrite.enabled,
      controlledWriteAvailable: controlledWrite.available,
      controlledWriteStatus: controlledWrite.status || ''
    }
  };
}


/**
 * Get exact sheet.
 */
function kidlearnV3_3okGetSheet_(spreadsheet, sheetName) {
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
 * Safe assert.
 */
function kidlearnV3_3okSafeAssert_(functionName, label) {
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
          'Thiếu function ' +
          functionName
      };
    }

    var fn =
      eval(functionName);

    var output =
      fn();

    return {
      success:
        output &&
        output.success === true,
      label: label,
      message:
        output && output.success === true
          ? ''
          : JSON.stringify(output)
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
 * Safe call.
 */
function kidlearnV3_3okSafeCall_(functionName) {
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
        available: false,
        functionName: functionName,
        summary: {
          status: '',
          error: 'Missing function'
        }
      };
    }

    var fn =
      eval(functionName);

    var output =
      fn();

    return {
      success: true,
      available: true,
      functionName: functionName,
      summary:
        kidlearnV3_3okSummarizeStatusOutput_(
          output
        )
    };

  } catch (error) {
    return {
      success: false,
      available: true,
      functionName: functionName,
      summary: {
        status: '',
        error: String(error.message || error)
      }
    };
  }
}


/**
 * Summarize status output.
 */
function kidlearnV3_3okSummarizeStatusOutput_(output) {
  if (!output || typeof output !== 'object') {
    return {
      rawType: typeof output
    };
  }

  return {
    success: output.success,
    action: output.action || '',
    bundle: output.bundle || '',
    phase: output.phase || '',
    status: output.status || '',
    nextBundle: output.nextBundle || '',
    nextStage: output.nextStage || '',
    prodFileId: output.prodFileId || '',
    prodFileUrl: output.prodFileUrl || '',
    finalApprovalId: output.finalApprovalId || '',
    executionPackageId: output.executionPackageId || '',
    selectedRequestId: output.selectedRequestId || '',
    selectedRequestType: output.selectedRequestType || '',
    dryRunId: output.dryRunId || '',
    finalLockId: output.finalLockId || '',
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0
  };
}


/**
 * Safe Write status.
 */
function kidlearnV3_3okSafeWriteStatus_() {
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
function kidlearnV3_3okControlledWriteStatus_() {
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
      error:
        'Missing kidlearnV3_getControlledWriteDevStatusV3'
    };

  } catch (error) {
    return {
      available: false,
      success: false,
      status: '',
      error:
        String(error.message || error)
    };
  }
}


/**
 * Check functions.
 */
function kidlearnV3_3okCheckFunctions_(names) {
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
 * IDs.
 */
function kidlearnV3_3okMakeControlledTrialId_() {
  return (
    'PROD_SELECTED_CR_CONTROLLED_TRIAL_3OK_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


/**
 * Save package.
 */
function kidlearnV3_3okSavePackage_(packageResult) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.CONTROLLED_TRIAL_ID,
    packageResult.controlledTrialId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.LAST_PACKAGE_JSON,
    JSON.stringify(packageResult)
  );
}


/**
 * Save trial.
 */
function kidlearnV3_3okSaveTrial_(trial) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.CONTROLLED_TRIAL_ID,
    trial.controlledTrialId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.AUDIT_ID,
    trial.auditId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.LAST_TRIAL_JSON,
    JSON.stringify(trial)
  );
}


/**
 * Save validation.
 */
function kidlearnV3_3okSaveValidation_(validation) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.LAST_VALIDATION_JSON,
      JSON.stringify(validation)
    );
}


/**
 * Save result.
 */
function kidlearnV3_3okSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.READY_FOR_3O_L &&
    (
      status === KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.PACKAGE_GENERATED ||
      status === KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.AUDIT_TRIAL_EXECUTED ||
      status === KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.TRIAL_VALIDATED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.READY_FOR_3O_L;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_TRIAL_3OK_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      controlledTrialId: result.controlledTrialId || '',
      auditId: result.auditId || '',
      executionPackageId: result.executionPackageId || '',
      selectedRequestId: result.selectedRequestId || '',
      selectedRequestType: result.selectedRequestType || '',
      prodFileId: result.prodFileId || '',
      prodFileUrl: result.prodFileUrl || '',
      prodAuditWriteExecuted: result.prodAuditWriteExecuted === true,
      selectedRequestExecutedNow: result.selectedRequestExecutedNow === true,
      selectedDataChangedNow: result.selectedDataChangedNow === true,
      fullProdWritePolicyOpenedNow: result.fullProdWritePolicyOpenedNow === true,
      rollbackExecutedNow: result.rollbackExecutedNow === true,
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
function kidlearnV3_3okReadJsonProperty_(key) {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(key);

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      raw: text
    };
  }
}


/**
 * Normalize options.
 */
function kidlearnV3_3okNormalizeOptions_(options) {
  if (!options) return {};

  if (typeof options !== 'object') {
    return {
      value: options
    };
  }

  return options;
}

/**
 * Continue 3O-K after audit trial already executed.
 *
 * Không execute lại audit trial.
 * Không append thêm LOG_Audit.
 */
function kidlearnV3_continueAfter3OKAuditTrialAlreadyRunV3() {
  var status =
    kidlearnV3_getProdSelectedCRControlledExecutionTrial3OKStatusV3();

  var currentStatus =
    status.status || '';

  if (
    currentStatus ===
    KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.READY_FOR_3O_L
  ) {
    return kidlearnV3_assertProdSelectedCRControlledExecutionTrial3OKReadyV3();
  }

  if (
    currentStatus ===
    KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.TRIAL_VALIDATED
  ) {
    kidlearnV3_markProdSelectedCRControlledExecutionTrial3OKReadyV3();
    return kidlearnV3_assertProdSelectedCRControlledExecutionTrial3OKReadyV3();
  }

  if (
    currentStatus ===
    KIDLEARN_V3_PROD_CR_TRIAL_3OK_STATUS.AUDIT_TRIAL_EXECUTED
  ) {
    kidlearnV3_validateProdSelectedCRControlledExecutionTrial3OKV3();
    kidlearnV3_markProdSelectedCRControlledExecutionTrial3OKReadyV3();
    return kidlearnV3_assertProdSelectedCRControlledExecutionTrial3OKReadyV3();
  }

  throw new Error(
    'Không thể continue 3O-K. Status hiện tại=' +
    currentStatus +
    '. Cần PACKAGE_GENERATED rồi execute audit trial một lần, hoặc status AUDIT_TRIAL_EXECUTED/TRIAL_VALIDATED/READY_FOR_3O_L.'
  );
}