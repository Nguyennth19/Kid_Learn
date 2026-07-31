/**
 * ================================================================
 * KIDLEARN V3 - PROD SELECTED CHANGE REQUEST FINAL EXECUTION APPROVAL GATE
 * Bundle: 3O-J
 * Version: 3.1.0
 * ================================================================
 *
 * 3O-J:
 * - Final approval gate cho selected change request execution package từ 3O-I.
 * - Chỉ record approval để đi tiếp sang controlled execution phase 3O-K.
 * - Không execute request.
 * - Không mở PROD write.
 * - Không ghi vào PROD file.
 * - Không migration.
 * - Không rollback.
 * - Chỉ ghi ScriptProperties trong DEV script để lưu approval/status.
 */


var KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3OJ_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3OJ_LAST_PREVIEW_AT',
  LAST_PACKAGE_AT: 'KIDLEARN_V3_PHASE_3OJ_LAST_PACKAGE_AT',
  LAST_APPROVAL_AT: 'KIDLEARN_V3_PHASE_3OJ_LAST_APPROVAL_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3OJ_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3OJ_LAST_RESULT_JSON',
  LAST_PACKAGE_JSON: 'KIDLEARN_V3_PHASE_3OJ_LAST_PACKAGE_JSON',
  LAST_APPROVAL_JSON: 'KIDLEARN_V3_PHASE_3OJ_LAST_APPROVAL_JSON',
  FINAL_APPROVAL_ID: 'KIDLEARN_V3_PHASE_3OJ_FINAL_APPROVAL_ID'
};


var KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  PACKAGE_GENERATED: 'PACKAGE_GENERATED',
  FINAL_EXECUTION_APPROVAL_RECORDED: 'FINAL_EXECUTION_APPROVAL_RECORDED',
  READY_FOR_3O_K: 'READY_FOR_3O_K',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG = {
  VERSION: '3O-J',
  PHASE: '3O-J',
  NEXT_BUNDLE: '3O-K',
  NEXT_STAGE: 'PROD_SELECTED_CHANGE_REQUEST_CONTROLLED_EXECUTION_TRIAL',
  WRITE_MODE: 'FINAL_EXECUTION_APPROVAL_GATE_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  EXECUTION_ALLOWED_NOW: false,
  CONFIRM_TEXT: 'APPROVE_SELECTED_CR_FINAL_EXECUTION_GATE_3O_J',
  APPROVAL_RESULT: 'APPROVE_PROCEED_TO_3O_K_CONTROLLED_TRIAL_ONLY'
};


/**
 * Preview 3O-J.
 */
function kidlearnV3_previewProdSelectedCRFinalExecutionApprovalGate3OJV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3ojCheckFunctions_([
      'kidlearnV3_assertProdSelectedChangeRequestExecutionPackage3OIReadyV3',
      'kidlearnV3_getProdSelectedChangeRequestExecutionPackage3OIStatusV3',
      'kidlearnV3_getProdChangeRequestExecutionDecisionGate3OHStatusV3',
      'kidlearnV3_getProdChangeRequestExecutionDryRun3OGStatusV3',
      'kidlearnV3_getProdChangeRequestControlledExecutionGate3OFStatusV3',
      'kidlearnV3_getProdChangeRequestImplementationPlanning3OEStatusV3',
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3OI =
    kidlearnV3_3ojSafeAssert_(
      'kidlearnV3_assertProdSelectedChangeRequestExecutionPackage3OIReadyV3',
      '3O-I'
    );

  if (!phase3OI.success) {
    errors.push(
      '3O-I chưa READY_FOR_3O_J: ' +
      phase3OI.message
    );
  }

  var selectedPackage =
    kidlearnV3_3ojGetSelectedPackageInfo_();

  if (!selectedPackage.executionPackageId) {
    errors.push('Thiếu executionPackageId từ 3O-I.');
  }

  if (!selectedPackage.selectedRequestId) {
    errors.push('Thiếu selectedRequestId từ 3O-I.');
  }

  if (!selectedPackage.selectedRequestType) {
    errors.push('Thiếu selectedRequestType từ 3O-I.');
  }

  var decisionGate =
    kidlearnV3_3ojSafeCall_(
      'kidlearnV3_getProdChangeRequestExecutionDecisionGate3OHStatusV3'
    );

  if (
    decisionGate.summary.status &&
    decisionGate.summary.status !== 'READY_FOR_3O_I'
  ) {
    errors.push(
      '3O-H decision gate chưa READY_FOR_3O_I. Status=' +
      decisionGate.summary.status
    );
  }

  var dryRun =
    kidlearnV3_3ojSafeCall_(
      'kidlearnV3_getProdChangeRequestExecutionDryRun3OGStatusV3'
    );

  if (
    dryRun.summary.status &&
    dryRun.summary.status !== 'READY_FOR_3O_H'
  ) {
    errors.push(
      '3O-G dry-run chưa READY_FOR_3O_H. Status=' +
      dryRun.summary.status
    );
  }

  var finalLock =
    kidlearnV3_3ojSafeCall_(
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
    kidlearnV3_3ojGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodCheck =
    kidlearnV3_3ojCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file chưa accessible: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3ojCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_SELECTED_CR_FINAL_EXECUTION_APPROVAL_GATE_3OJ_V3',
    bundle: '3O-J',
    phase: KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.WRITE_MODE,
    confirmText:
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.CONFIRM_TEXT,
    approvalResult:
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.APPROVAL_RESULT,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    executionAllowedNow: false,
    finalApprovalGateOnly: true,
    changeRequestExecutedNow: false,
    prodWritePolicyOpenedNow: false,
    rollbackExecutedNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3OI: phase3OI,
    selectedPackage: selectedPackage,
    decisionGate: decisionGate.summary,
    dryRun: dryRun.summary,
    finalLock: finalLock.summary,
    prodInfo: prodInfo,
    prodCheck: prodCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3O-J chỉ là final execution approval gate. Không execute request và không ghi PROD.'
  };

  kidlearnV3_3ojSaveResult_(
    result,
    KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Generate final execution approval package.
 *
 * Không record approval trong hàm này.
 * Không execute request.
 */
function kidlearnV3_generateProdSelectedCRFinalExecutionApprovalPackage3OJV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdSelectedCRFinalExecutionApprovalGate3OJV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate final execution approval package 3O-J vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var finalApprovalId =
    kidlearnV3_3ojMakeFinalApprovalId_();

  var prodInfo =
    kidlearnV3_3ojGetProdInfo_();

  var selectedPackage =
    kidlearnV3_3ojGetSelectedPackageInfo_();

  var selectedPackageStatus =
    kidlearnV3_3ojSafeCall_(
      'kidlearnV3_getProdSelectedChangeRequestExecutionPackage3OIStatusV3'
    );

  var decisionGate =
    kidlearnV3_3ojSafeCall_(
      'kidlearnV3_getProdChangeRequestExecutionDecisionGate3OHStatusV3'
    );

  var dryRun =
    kidlearnV3_3ojSafeCall_(
      'kidlearnV3_getProdChangeRequestExecutionDryRun3OGStatusV3'
    );

  var executionGate =
    kidlearnV3_3ojSafeCall_(
      'kidlearnV3_getProdChangeRequestControlledExecutionGate3OFStatusV3'
    );

  var planning =
    kidlearnV3_3ojSafeCall_(
      'kidlearnV3_getProdChangeRequestImplementationPlanning3OEStatusV3'
    );

  var finalLock =
    kidlearnV3_3ojSafeCall_(
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3'
    );

  var prodCheck =
    kidlearnV3_3ojCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi generate final approval package: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3ojCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var approvalPolicy =
    kidlearnV3_3ojBuildFinalApprovalPolicy_(
      selectedPackage
    );

  var finishedAt = new Date();

  var approvalPackage = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_SELECTED_CR_FINAL_EXECUTION_APPROVAL_PACKAGE_3OJ_V3',
    bundle: '3O-J',
    phase: KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.PACKAGE_GENERATED
        : KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.FAILED,
    finalApprovalId: finalApprovalId,
    executionPackageId: selectedPackage.executionPackageId || '',
    selectedRequestId: selectedPackage.selectedRequestId || '',
    selectedRequestType: selectedPackage.selectedRequestType || '',
    nextBundle:
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.NEXT_STAGE,
    confirmText:
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.CONFIRM_TEXT,
    approvalResult:
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.APPROVAL_RESULT,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    executionAllowedNow: false,
    finalApprovalGateOnly: true,
    changeRequestExecutedNow: false,
    prodWritePolicyOpenedNow: false,
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
      selectedPackage3OI: selectedPackageStatus.summary,
      decisionGate3OH: decisionGate.summary,
      dryRun3OG: dryRun.summary,
      executionGate3OF: executionGate.summary,
      planning3OE: planning.summary,
      finalLock3NJ: finalLock.summary
    },

    finalApprovalPolicy: approvalPolicy,

    approvalChecklist: [
      {
        item: '3O-I selected execution package ready',
        passed:
          selectedPackageStatus.summary.status === 'READY_FOR_3O_J'
      },
      {
        item: 'Selected request ID exists',
        passed:
          selectedPackage.selectedRequestId ? true : false
      },
      {
        item: 'Selected request type exists',
        passed:
          selectedPackage.selectedRequestType ? true : false
      },
      {
        item: '3O-H decision gate ready',
        passed:
          decisionGate.summary.status === 'READY_FOR_3O_I'
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
        item: 'Safe Write remains DRY_RUN/enabled=false',
        passed:
          safeModes.summary.safeWriteMode === 'DRY_RUN' &&
          safeModes.summary.safeWriteEnabled === false
      },
      {
        item: 'No request executed in 3O-J',
        passed: true
      },
      {
        item: 'No PROD write policy opened in 3O-J',
        passed: true
      },
      {
        item: 'No rollback executed in 3O-J',
        passed: true
      }
    ],

    approvalMeaning:
      'Final approval gate này chỉ cho phép đi tiếp sang 3O-K controlled execution trial. Nó không execute request, không ghi PROD và không mở PROD write trong 3O-J.',

    noSideEffect: {
      prodFileModifiedBy3OJ: false,
      prodDataWrittenBy3OJ: false,
      prodSheetCreatedBy3OJ: false,
      prodSheetDeletedBy3OJ: false,
      requestExecutedBy3OJ: false,
      prodWritePolicyOpenedBy3OJ: false,
      rollbackExecutedBy3OJ: false
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

  kidlearnV3_3ojSavePackage_(
    approvalPackage
  );

  kidlearnV3_3ojSaveResult_(
    approvalPackage,
    approvalPackage.success
      ? KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.PACKAGE_GENERATED
      : KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.FAILED,
    KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.LAST_PACKAGE_AT
  );

  console.log(JSON.stringify(approvalPackage, null, 2));

  if (!approvalPackage.success) {
    throw new Error(
      '3O-J final execution approval package failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return approvalPackage;
}


/**
 * Manual confirm wrapper.
 *
 * Không dùng Session.getActiveUser để tránh thêm OAuth scope.
 * Không execute request.
 * Không ghi PROD.
 */
function kidlearnV3_recordProdSelectedCRFinalExecutionApproval3OJManualConfirmV3() {
  return kidlearnV3_recordProdSelectedCRFinalExecutionApproval3OJV3({
    confirmText:
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.CONFIRM_TEXT,
    approvalResult:
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.APPROVAL_RESULT,
    approvedBy: 'DEV_FINAL_EXECUTION_APPROVER_MANUAL_3OJ',
    approvalNote:
      'Final execution approval gate recorded in 3O-J. This only permits moving to 3O-K controlled execution trial. No PROD change executed.'
  });
}


/**
 * Record final execution approval gate.
 *
 * options:
 * {
 *   confirmText: 'APPROVE_SELECTED_CR_FINAL_EXECUTION_GATE_3O_J',
 *   approvalResult: 'APPROVE_PROCEED_TO_3O_K_CONTROLLED_TRIAL_ONLY',
 *   approvedBy: '...',
 *   approvalNote: '...'
 * }
 */
function kidlearnV3_recordProdSelectedCRFinalExecutionApproval3OJV3(options) {
  var req =
    kidlearnV3_3ojNormalizeOptions_(options);

  var errors = [];
  var warnings = [];

  if (
    String(req.confirmText || '') !==
    KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.CONFIRM_TEXT
  ) {
    errors.push(
      'Confirm text không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.CONFIRM_TEXT
    );
  }

  if (
    String(req.approvalResult || '') !==
    KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.APPROVAL_RESULT
  ) {
    errors.push(
      'approvalResult không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.APPROVAL_RESULT
    );
  }

  var status =
    kidlearnV3_getProdSelectedCRFinalExecutionApproval3OJStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.PACKAGE_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.FINAL_EXECUTION_APPROVAL_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.READY_FOR_3O_K
  ) {
    errors.push(
      '3O-J chưa PACKAGE_GENERATED. Status=' +
      status.status
    );
  }

  if (
    !status.lastPackage ||
    status.lastPackage.success !== true
  ) {
    errors.push(
      'Last final approval package chưa success=true.'
    );
  }

  var prodInfo =
    kidlearnV3_3ojGetProdInfo_();

  var prodCheck =
    kidlearnV3_3ojCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi record final approval: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3ojCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  if (errors.length > 0) {
    var failed = {
      success: false,
      action: 'RECORD_PROD_SELECTED_CR_FINAL_EXECUTION_APPROVAL_3OJ_V3',
      bundle: '3O-J',
      phase: KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.PHASE,
      status: status.status,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
      executionAllowedNow: false,
      changeRequestExecutedNow: false,
      prodWritePolicyOpenedNow: false,
      rollbackExecutedNow: false,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors: errors,
      warnings: warnings
    };

    console.log(JSON.stringify(failed, null, 2));

    throw new Error(
      'Không thể record final execution approval 3O-J. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var finalApprovalId =
    status.finalApprovalId ||
    kidlearnV3_3ojMakeFinalApprovalId_();

  var selectedPackage =
    kidlearnV3_3ojGetSelectedPackageInfo_();

  var approval = {
    success: true,
    action: 'RECORD_PROD_SELECTED_CR_FINAL_EXECUTION_APPROVAL_3OJ_V3',
    bundle: '3O-J',
    phase: KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.FINAL_EXECUTION_APPROVAL_RECORDED,
    finalApprovalId: finalApprovalId,
    executionPackageId: selectedPackage.executionPackageId || '',
    selectedRequestId: selectedPackage.selectedRequestId || '',
    selectedRequestType: selectedPackage.selectedRequestType || '',
    approvedBy:
      req.approvedBy || 'DEV_FINAL_EXECUTION_APPROVER_MANUAL_3OJ',
    approvalResult:
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.APPROVAL_RESULT,
    approvalNote:
      req.approvalNote || '',
    approvalMeaning:
      'Final execution approval recorded to proceed to 3O-K controlled execution trial only. No request executed and no PROD write opened in 3O-J.',
    nextBundle:
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    executionAllowedNow: false,
    finalApprovalGateOnly: true,
    changeRequestExecutedNow: false,
    prodWritePolicyOpenedNow: false,
    rollbackExecutedNow: false,
    safeModes: safeModes.summary,
    recordedAt:
      new Date().toISOString(),
    warningCount: warnings.length,
    warnings: warnings
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.FINAL_APPROVAL_ID,
    finalApprovalId
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.LAST_APPROVAL_JSON,
    JSON.stringify(approval)
  );

  kidlearnV3_3ojSaveResult_(
    approval,
    KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.FINAL_EXECUTION_APPROVAL_RECORDED,
    KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.LAST_APPROVAL_AT
  );

  console.log(JSON.stringify(approval, null, 2));

  return approval;
}


/**
 * Mark 3O-J ready.
 */
function kidlearnV3_markProdSelectedCRFinalExecutionApproval3OJReadyV3() {
  var status =
    kidlearnV3_getProdSelectedCRFinalExecutionApproval3OJStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.FINAL_EXECUTION_APPROVAL_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.READY_FOR_3O_K
  ) {
    errors.push(
      '3O-J chưa FINAL_EXECUTION_APPROVAL_RECORDED. Status=' +
      status.status
    );
  }

  if (
    !status.lastApproval ||
    status.lastApproval.success !== true
  ) {
    errors.push(
      'Last final approval chưa success=true.'
    );
  }

  if (!status.finalApprovalId) {
    errors.push(
      'Thiếu finalApprovalId.'
    );
  }

  var selectedPackage =
    kidlearnV3_3ojGetSelectedPackageInfo_();

  if (!selectedPackage.executionPackageId) {
    errors.push(
      'Thiếu executionPackageId từ 3O-I.'
    );
  }

  if (!selectedPackage.selectedRequestId) {
    errors.push(
      'Thiếu selectedRequestId từ 3O-I.'
    );
  }

  var prodInfo =
    kidlearnV3_3ojGetProdInfo_();

  var prodCheck =
    kidlearnV3_3ojCheckFileAccessible_(
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
    kidlearnV3_3ojCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3O-J ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_SELECTED_CR_FINAL_EXECUTION_APPROVAL_3OJ_READY_V3',
    bundle: '3O-J',
    phase: KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.READY_FOR_3O_K,
    finalApprovalId: status.finalApprovalId || '',
    executionPackageId: selectedPackage.executionPackageId || '',
    selectedRequestId: selectedPackage.selectedRequestId || '',
    selectedRequestType: selectedPackage.selectedRequestType || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.NEXT_STAGE,
    approvalResult:
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.APPROVAL_RESULT,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    executionAllowedNow: false,
    changeRequestExecutedNow: false,
    prodWritePolicyOpenedNow: false,
    rollbackExecutedNow: false,
    message:
      '3O-J ready. Final execution approval gate đã được record. Bước tiếp theo là 3O-K controlled execution trial.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3ojSaveResult_(
    result,
    KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.READY_FOR_3O_K,
    KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3O-J status.
 */
function kidlearnV3_getProdSelectedCRFinalExecutionApproval3OJStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_SELECTED_CR_FINAL_EXECUTION_APPROVAL_3OJ_STATUS_V3',
    bundle: '3O-J',
    phase: KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.NOT_RUN,
    finalApprovalId:
      properties.getProperty(
        KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.FINAL_APPROVAL_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastPackageAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.LAST_PACKAGE_AT
      ) ||
      '',
    lastApprovalAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.LAST_APPROVAL_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3ojReadJsonProperty_(
        KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.LAST_RESULT_JSON
      ),
    lastPackage:
      kidlearnV3_3ojReadJsonProperty_(
        KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.LAST_PACKAGE_JSON
      ),
    lastApproval:
      kidlearnV3_3ojReadJsonProperty_(
        KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.LAST_APPROVAL_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3O-J ready.
 */
function kidlearnV3_assertProdSelectedCRFinalExecutionApproval3OJReadyV3() {
  var status =
    kidlearnV3_getProdSelectedCRFinalExecutionApproval3OJStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.READY_FOR_3O_K
  ) {
    errors.push(
      '3O-J chưa READY_FOR_3O_K. Status=' +
      status.status
    );
  }

  if (!status.finalApprovalId) {
    errors.push(
      'Thiếu finalApprovalId.'
    );
  }

  var selectedPackage =
    kidlearnV3_3ojGetSelectedPackageInfo_();

  if (!selectedPackage.executionPackageId) {
    errors.push(
      'Thiếu executionPackageId.'
    );
  }

  if (!selectedPackage.selectedRequestId) {
    errors.push(
      'Thiếu selectedRequestId.'
    );
  }

  if (!selectedPackage.selectedRequestType) {
    errors.push(
      'Thiếu selectedRequestType.'
    );
  }

  var prodInfo =
    kidlearnV3_3ojGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_SELECTED_CR_FINAL_EXECUTION_APPROVAL_3OJ_READY_V3',
    bundle: '3O-J',
    phase: KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.PHASE,
    status: status.status,
    finalApprovalId: status.finalApprovalId || '',
    executionPackageId: selectedPackage.executionPackageId || '',
    selectedRequestId: selectedPackage.selectedRequestId || '',
    selectedRequestType: selectedPackage.selectedRequestType || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.NEXT_BUNDLE,
    approvalResult:
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.APPROVAL_RESULT,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    executionAllowedNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3O-J chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3O-J package-only.
 *
 * Không record final approval trong QA batch.
 */
function kidlearnV3_getQaBatchSteps3OJV3() {
  return [
    {
      label: 'Assert 3O-I ready',
      functionName: 'kidlearnV3_assertProdSelectedChangeRequestExecutionPackage3OIReadyV3'
    },
    {
      label: 'Preview PROD Selected CR Final Approval Gate 3O-J',
      functionName: 'kidlearnV3_previewProdSelectedCRFinalExecutionApprovalGate3OJV3'
    },
    {
      label: 'Generate PROD Selected CR Final Approval Package 3O-J',
      functionName: 'kidlearnV3_generateProdSelectedCRFinalExecutionApprovalPackage3OJV3'
    }
  ];
}


/**
 * QA batch 3O-J package-only.
 */
function kidlearnV3_runQaBatch3OJV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3O_J_PROD_SELECTED_CR_FINAL_EXECUTION_APPROVAL_PACKAGE_ONLY',
    kidlearnV3_getQaBatchSteps3OJV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build final approval policy.
 */
function kidlearnV3_3ojBuildFinalApprovalPolicy_(selectedPackage) {
  return {
    gateName:
      'KIDLEARN V3 PROD Selected Change Request Final Execution Approval Gate',
    approvalScope:
      'Approve proceeding to 3O-K controlled execution trial only.',
    selectedRequestId:
      selectedPackage.selectedRequestId || '',
    selectedRequestType:
      selectedPackage.selectedRequestType || '',
    prodWriteRequiredForActual:
      selectedPackage.prodWriteRequiredForActual === true,
    whatThisApprovalAllows: [
      'Đi tiếp sang 3O-K controlled execution trial.',
      'Chuẩn bị trial package có row snapshot, rollback token và validation plan.',
      'Chạy execution trial chỉ trong 3O-K nếu 3O-K có confirm riêng.',
      'Áp dụng giới hạn controlled trial thay vì mở full PROD write.'
    ],
    whatThisApprovalDoesNotAllow: [
      'Không execute change request trong 3O-J.',
      'Không ghi vào PROD file trong 3O-J.',
      'Không mở PROD write policy trong 3O-J.',
      'Không migration trong 3O-J.',
      'Không rollback trong 3O-J.',
      'Không tạo/xóa sheet trong 3O-J.'
    ],
    requiredBefore3OKActualTrial: [
      '3O-J status READY_FOR_3O_K',
      'Selected request package from 3O-I',
      'Explicit 3O-K confirm text',
      'Before/after snapshot plan',
      'Rollback token',
      'Post-trial validation plan',
      'Immediate reset policy after trial'
    ],
    blockedIn3OJ: [
      'REAL_PROD_WRITE',
      'PROD_WRITE_ENABLE',
      'CHANGE_REQUEST_EXECUTION',
      'DATA_MIGRATION',
      'ROLLBACK',
      'DELETE_SHEET',
      'CREATE_SHEET',
      'NEW_PROD_DEPLOY'
    ],
    defaultApprovalResult:
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_CONFIG.APPROVAL_RESULT,
    prodRuntimePolicyAfter3OJ:
      'READ_ONLY',
    prodWriteAllowedAfter3OJ:
      false
  };
}


/**
 * Get selected package info from 3O-I.
 */
function kidlearnV3_3ojGetSelectedPackageInfo_() {
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
      finalExecutionApprovalRequired:
        (
          lastPackage.packagePolicy &&
          lastPackage.packagePolicy.finalExecutionApprovalRequired === true
        ) ||
        executionPlan.finalExecutionApprovalRequired === true,
      packageStatus:
        lastPackage.status || '',
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
      finalExecutionApprovalRequired: false,
      packageStatus: '',
      packageSuccess: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * PROD info từ 3N-F.
 */
function kidlearnV3_3ojGetProdInfo_() {
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
function kidlearnV3_3ojCheckFileAccessible_(fileId, label) {
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
function kidlearnV3_3ojCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3ojSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Safe Write trong DEV script phải DRY_RUN/enabled=false. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var controlledWrite =
    kidlearnV3_3ojControlledWriteStatus_();

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
    summary: {
      safeWriteMode: safeWrite.mode || '',
      safeWriteEnabled: safeWrite.enabled,
      controlledWriteAvailable: controlledWrite.available,
      controlledWriteStatus: controlledWrite.status || ''
    }
  };
}


/**
 * Safe assert.
 */
function kidlearnV3_3ojSafeAssert_(functionName, label) {
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
function kidlearnV3_3ojSafeCall_(functionName) {
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
        kidlearnV3_3ojSummarizeStatusOutput_(
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
function kidlearnV3_3ojSummarizeStatusOutput_(output) {
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
    executionPackageId: output.executionPackageId || '',
    selectedRequestId: output.selectedRequestId || '',
    selectedRequestType: output.selectedRequestType || '',
    decisionGateId: output.decisionGateId || '',
    dryRunId: output.dryRunId || '',
    executionGateId: output.executionGateId || '',
    planId: output.planId || '',
    finalLockId: output.finalLockId || '',
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0
  };
}


/**
 * Safe Write status.
 */
function kidlearnV3_3ojSafeWriteStatus_() {
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
function kidlearnV3_3ojControlledWriteStatus_() {
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
function kidlearnV3_3ojCheckFunctions_(names) {
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
 * Final approval ID.
 */
function kidlearnV3_3ojMakeFinalApprovalId_() {
  return (
    'PROD_SELECTED_CR_FINAL_APPROVAL_3OJ_' +
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
function kidlearnV3_3ojSavePackage_(approvalPackage) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.FINAL_APPROVAL_ID,
    approvalPackage.finalApprovalId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.LAST_PACKAGE_JSON,
    JSON.stringify(approvalPackage)
  );
}


/**
 * Save result.
 */
function kidlearnV3_3ojSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.READY_FOR_3O_K &&
    (
      status === KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.PACKAGE_GENERATED ||
      status === KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.FINAL_EXECUTION_APPROVAL_RECORDED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_STATUS.READY_FOR_3O_K;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_FINAL_EXEC_APPROVAL_3OJ_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      finalApprovalId: result.finalApprovalId || '',
      executionPackageId: result.executionPackageId || '',
      selectedRequestId: result.selectedRequestId || '',
      selectedRequestType: result.selectedRequestType || '',
      prodFileId: result.prodFileId || '',
      prodFileUrl: result.prodFileUrl || '',
      approvalResult: result.approvalResult || '',
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
      executionAllowedNow: false,
      changeRequestExecutedNow: false,
      prodWritePolicyOpenedNow: false,
      rollbackExecutedNow: false,
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
function kidlearnV3_3ojReadJsonProperty_(key) {
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
function kidlearnV3_3ojNormalizeOptions_(options) {
  if (!options) return {};

  if (typeof options !== 'object') {
    return {
      value: options
    };
  }

  return options;
}