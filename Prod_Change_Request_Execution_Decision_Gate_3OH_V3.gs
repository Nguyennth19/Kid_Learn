/**
 * ================================================================
 * KIDLEARN V3 - PROD CHANGE REQUEST EXECUTION DECISION GATE
 * Bundle: 3O-H
 * Version: 3.1.0
 * ================================================================
 *
 * 3O-H:
 * - Quyết định sau execution dry-run rehearsal 3O-G.
 * - Chỉ cho phép đi tiếp sang selected execution package phase.
 * - Không execute request.
 * - Không mở PROD write.
 * - Không ghi vào PROD file.
 * - Không migration.
 * - Không rollback.
 * - Chỉ ghi ScriptProperties trong DEV script để lưu decision/status.
 */


var KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3OH_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3OH_LAST_PREVIEW_AT',
  LAST_PACKAGE_AT: 'KIDLEARN_V3_PHASE_3OH_LAST_PACKAGE_AT',
  LAST_DECISION_AT: 'KIDLEARN_V3_PHASE_3OH_LAST_DECISION_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3OH_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3OH_LAST_RESULT_JSON',
  LAST_PACKAGE_JSON: 'KIDLEARN_V3_PHASE_3OH_LAST_PACKAGE_JSON',
  LAST_DECISION_JSON: 'KIDLEARN_V3_PHASE_3OH_LAST_DECISION_JSON',
  DECISION_GATE_ID: 'KIDLEARN_V3_PHASE_3OH_DECISION_GATE_ID'
};


var KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  PACKAGE_GENERATED: 'PACKAGE_GENERATED',
  DECISION_GATE_RECORDED: 'DECISION_GATE_RECORDED',
  READY_FOR_3O_I: 'READY_FOR_3O_I',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG = {
  VERSION: '3O-H',
  PHASE: '3O-H',
  NEXT_BUNDLE: '3O-I',
  NEXT_STAGE: 'PROD_SELECTED_CHANGE_REQUEST_EXECUTION_PACKAGE',
  WRITE_MODE: 'EXECUTION_DECISION_GATE_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  CONFIRM_TEXT: 'DECIDE_PROCEED_TO_SELECTED_EXECUTION_PACKAGE_3O_H',
  DECISION_RESULT: 'PROCEED_TO_3O_I_PACKAGE_ONLY'
};


/**
 * Preview 3O-H.
 */
function kidlearnV3_previewProdChangeRequestExecutionDecisionGate3OHV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3ohCheckFunctions_([
      'kidlearnV3_assertProdChangeRequestExecutionDryRun3OGReadyV3',
      'kidlearnV3_getProdChangeRequestExecutionDryRun3OGStatusV3',
      'kidlearnV3_getProdChangeRequestControlledExecutionGate3OFStatusV3',
      'kidlearnV3_getProdChangeRequestImplementationPlanning3OEStatusV3',
      'kidlearnV3_getProdChangeRequestApprovalGate3ODStatusV3',
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3OG =
    kidlearnV3_3ohSafeAssert_(
      'kidlearnV3_assertProdChangeRequestExecutionDryRun3OGReadyV3',
      '3O-G'
    );

  if (!phase3OG.success) {
    errors.push(
      '3O-G chưa READY_FOR_3O_H: ' +
      phase3OG.message
    );
  }

  var dryRun =
    kidlearnV3_3ohSafeCall_(
      'kidlearnV3_getProdChangeRequestExecutionDryRun3OGStatusV3'
    );

  if (
    dryRun.summary.status &&
    dryRun.summary.status !== 'READY_FOR_3O_H'
  ) {
    errors.push(
      '3O-G dry-run rehearsal chưa READY_FOR_3O_H. Status=' +
      dryRun.summary.status
    );
  }

  var executionGate =
    kidlearnV3_3ohSafeCall_(
      'kidlearnV3_getProdChangeRequestControlledExecutionGate3OFStatusV3'
    );

  if (
    executionGate.summary.status &&
    executionGate.summary.status !== 'READY_FOR_3O_G'
  ) {
    errors.push(
      '3O-F execution gate chưa READY_FOR_3O_G. Status=' +
      executionGate.summary.status
    );
  }

  var planning =
    kidlearnV3_3ohSafeCall_(
      'kidlearnV3_getProdChangeRequestImplementationPlanning3OEStatusV3'
    );

  if (
    planning.summary.status &&
    planning.summary.status !== 'READY_FOR_3O_F'
  ) {
    errors.push(
      '3O-E planning chưa READY_FOR_3O_F. Status=' +
      planning.summary.status
    );
  }

  var finalLock =
    kidlearnV3_3ohSafeCall_(
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
    kidlearnV3_3ohGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodCheck =
    kidlearnV3_3ohCheckFileAccessible_(
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
    kidlearnV3_3ohCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_CHANGE_REQUEST_EXECUTION_DECISION_GATE_3OH_V3',
    bundle: '3O-H',
    phase: KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.WRITE_MODE,
    confirmText:
      KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.CONFIRM_TEXT,
    decisionResult:
      KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.DECISION_RESULT,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    decisionGateOnly: true,
    changeRequestExecutedNow: false,
    prodWritePolicyOpenedNow: false,
    rollbackExecutedNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3OG: phase3OG,
    dryRun: dryRun.summary,
    executionGate: executionGate.summary,
    planning: planning.summary,
    finalLock: finalLock.summary,
    prodInfo: prodInfo,
    prodCheck: prodCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3O-H chỉ là decision gate sau dry-run rehearsal. Không execute request và không ghi PROD.'
  };

  kidlearnV3_3ohSaveResult_(
    result,
    KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Generate execution decision package.
 *
 * Không record decision trong hàm này.
 * Không execute request.
 */
function kidlearnV3_generateProdChangeRequestExecutionDecisionGatePackage3OHV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdChangeRequestExecutionDecisionGate3OHV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate execution decision package 3O-H vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var decisionGateId =
    kidlearnV3_3ohMakeDecisionGateId_();

  var prodInfo =
    kidlearnV3_3ohGetProdInfo_();

  var dryRun =
    kidlearnV3_3ohSafeCall_(
      'kidlearnV3_getProdChangeRequestExecutionDryRun3OGStatusV3'
    );

  var executionGate =
    kidlearnV3_3ohSafeCall_(
      'kidlearnV3_getProdChangeRequestControlledExecutionGate3OFStatusV3'
    );

  var planning =
    kidlearnV3_3ohSafeCall_(
      'kidlearnV3_getProdChangeRequestImplementationPlanning3OEStatusV3'
    );

  var approvalGate =
    kidlearnV3_3ohSafeCall_(
      'kidlearnV3_getProdChangeRequestApprovalGate3ODStatusV3'
    );

  var workflow =
    kidlearnV3_3ohSafeCall_(
      'kidlearnV3_getProdChangeRequestWorkflow3OCStatusV3'
    );

  var finalLock =
    kidlearnV3_3ohSafeCall_(
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3'
    );

  var prodCheck =
    kidlearnV3_3ohCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi generate decision package: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3ohCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var decisionPolicy =
    kidlearnV3_3ohBuildDecisionPolicy_();

  var finishedAt = new Date();

  var decisionPackage = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_CHANGE_REQUEST_EXECUTION_DECISION_GATE_PACKAGE_3OH_V3',
    bundle: '3O-H',
    phase: KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.PACKAGE_GENERATED
        : KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.FAILED,
    decisionGateId: decisionGateId,
    nextBundle:
      KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.NEXT_STAGE,
    confirmText:
      KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.CONFIRM_TEXT,
    decisionResult:
      KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.DECISION_RESULT,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    decisionGateOnly: true,
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

    upstreamReadiness: {
      dryRun3OG: dryRun.summary,
      executionGate3OF: executionGate.summary,
      planning3OE: planning.summary,
      approvalGate3OD: approvalGate.summary,
      workflow3OC: workflow.summary,
      finalLock3NJ: finalLock.summary
    },

    decisionPolicy: decisionPolicy,

    decisionChecklist: [
      {
        item: '3O-G dry-run rehearsal ready',
        passed:
          dryRun.summary.status === 'READY_FOR_3O_H'
      },
      {
        item: '3O-F execution gate ready',
        passed:
          executionGate.summary.status === 'READY_FOR_3O_G'
      },
      {
        item: '3O-E implementation planning ready',
        passed:
          planning.summary.status === 'READY_FOR_3O_F'
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
        item: 'No change request executed in 3O-H',
        passed: true
      },
      {
        item: 'No PROD write policy opened in 3O-H',
        passed: true
      },
      {
        item: 'No rollback executed in 3O-H',
        passed: true
      }
    ],

    decisionMeaning:
      'Decision gate này chỉ cho phép đi tiếp sang 3O-I để chuẩn bị selected execution package. Nó không execute request và không mở PROD write.',

    noSideEffect: {
      prodFileModifiedBy3OH: false,
      prodDataWrittenBy3OH: false,
      prodSheetCreatedBy3OH: false,
      prodSheetDeletedBy3OH: false,
      requestExecutedBy3OH: false,
      prodWritePolicyOpenedBy3OH: false,
      rollbackExecutedBy3OH: false
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

  kidlearnV3_3ohSavePackage_(
    decisionPackage
  );

  kidlearnV3_3ohSaveResult_(
    decisionPackage,
    decisionPackage.success
      ? KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.PACKAGE_GENERATED
      : KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.FAILED,
    KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.LAST_PACKAGE_AT
  );

  console.log(JSON.stringify(decisionPackage, null, 2));

  if (!decisionPackage.success) {
    throw new Error(
      '3O-H execution decision package failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return decisionPackage;
}


/**
 * Manual confirm wrapper.
 *
 * Không dùng Session.getActiveUser để tránh thêm OAuth scope.
 * Không execute request.
 * Không ghi PROD.
 */
function kidlearnV3_recordProdChangeRequestExecutionDecisionGate3OHManualConfirmV3() {
  return kidlearnV3_recordProdChangeRequestExecutionDecisionGate3OHV3({
    confirmText:
      KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.CONFIRM_TEXT,
    decidedBy: 'DEV_DECISION_MANAGER_MANUAL_3OH',
    decisionResult:
      KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.DECISION_RESULT,
    decisionNote:
      'Execution decision gate recorded in 3O-H. This only permits moving to 3O-I selected execution package. No PROD change executed.'
  });
}


/**
 * Record execution decision gate.
 *
 * options:
 * {
 *   confirmText: 'DECIDE_PROCEED_TO_SELECTED_EXECUTION_PACKAGE_3O_H',
 *   decidedBy: '...',
 *   decisionResult: 'PROCEED_TO_3O_I_PACKAGE_ONLY',
 *   decisionNote: '...'
 * }
 */
function kidlearnV3_recordProdChangeRequestExecutionDecisionGate3OHV3(options) {
  var req =
    kidlearnV3_3ohNormalizeOptions_(options);

  var errors = [];
  var warnings = [];

  if (
    String(req.confirmText || '') !==
    KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.CONFIRM_TEXT
  ) {
    errors.push(
      'Confirm text không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.CONFIRM_TEXT
    );
  }

  if (
    String(req.decisionResult || '') !==
    KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.DECISION_RESULT
  ) {
    errors.push(
      'decisionResult không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.DECISION_RESULT
    );
  }

  var status =
    kidlearnV3_getProdChangeRequestExecutionDecisionGate3OHStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.PACKAGE_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.DECISION_GATE_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.READY_FOR_3O_I
  ) {
    errors.push(
      '3O-H chưa PACKAGE_GENERATED. Status=' +
      status.status
    );
  }

  if (
    !status.lastPackage ||
    status.lastPackage.success !== true
  ) {
    errors.push(
      'Last decision package chưa success=true.'
    );
  }

  var prodInfo =
    kidlearnV3_3ohGetProdInfo_();

  var prodCheck =
    kidlearnV3_3ohCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi record decision: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3ohCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  if (errors.length > 0) {
    var failed = {
      success: false,
      action: 'RECORD_PROD_CHANGE_REQUEST_EXECUTION_DECISION_GATE_3OH_V3',
      bundle: '3O-H',
      phase: KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.PHASE,
      status: status.status,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
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
      'Không thể record execution decision gate 3O-H. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var decisionGateId =
    status.decisionGateId ||
    kidlearnV3_3ohMakeDecisionGateId_();

  var decision = {
    success: true,
    action: 'RECORD_PROD_CHANGE_REQUEST_EXECUTION_DECISION_GATE_3OH_V3',
    bundle: '3O-H',
    phase: KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.DECISION_GATE_RECORDED,
    decisionGateId: decisionGateId,
    decidedBy:
      req.decidedBy || 'DEV_DECISION_MANAGER_MANUAL_3OH',
    decisionResult:
      KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.DECISION_RESULT,
    decisionNote:
      req.decisionNote || '',
    decisionMeaning:
      'Decision recorded to proceed to 3O-I selected execution package only. No request executed and no PROD write opened in 3O-H.',
    nextBundle:
      KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    decisionGateOnly: true,
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
    KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.DECISION_GATE_ID,
    decisionGateId
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.LAST_DECISION_JSON,
    JSON.stringify(decision)
  );

  kidlearnV3_3ohSaveResult_(
    decision,
    KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.DECISION_GATE_RECORDED,
    KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.LAST_DECISION_AT
  );

  console.log(JSON.stringify(decision, null, 2));

  return decision;
}


/**
 * Mark 3O-H ready.
 */
function kidlearnV3_markProdChangeRequestExecutionDecisionGate3OHReadyV3() {
  var status =
    kidlearnV3_getProdChangeRequestExecutionDecisionGate3OHStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.DECISION_GATE_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.READY_FOR_3O_I
  ) {
    errors.push(
      '3O-H chưa DECISION_GATE_RECORDED. Status=' +
      status.status
    );
  }

  if (
    !status.lastDecision ||
    status.lastDecision.success !== true
  ) {
    errors.push(
      'Last decision gate chưa success=true.'
    );
  }

  if (!status.decisionGateId) {
    errors.push(
      'Thiếu decisionGateId.'
    );
  }

  var prodInfo =
    kidlearnV3_3ohGetProdInfo_();

  var prodCheck =
    kidlearnV3_3ohCheckFileAccessible_(
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
    kidlearnV3_3ohCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3O-H ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_CHANGE_REQUEST_EXECUTION_DECISION_GATE_3OH_READY_V3',
    bundle: '3O-H',
    phase: KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.READY_FOR_3O_I,
    decisionGateId: status.decisionGateId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.NEXT_STAGE,
    decisionResult:
      KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.DECISION_RESULT,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    changeRequestExecutedNow: false,
    prodWritePolicyOpenedNow: false,
    rollbackExecutedNow: false,
    message:
      '3O-H ready. Execution decision gate đã được record. Bước tiếp theo là 3O-I selected execution package.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3ohSaveResult_(
    result,
    KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.READY_FOR_3O_I,
    KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3O-H status.
 */
function kidlearnV3_getProdChangeRequestExecutionDecisionGate3OHStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_CHANGE_REQUEST_EXECUTION_DECISION_GATE_3OH_STATUS_V3',
    bundle: '3O-H',
    phase: KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.NOT_RUN,
    decisionGateId:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.DECISION_GATE_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastPackageAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.LAST_PACKAGE_AT
      ) ||
      '',
    lastDecisionAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.LAST_DECISION_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3ohReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.LAST_RESULT_JSON
      ),
    lastPackage:
      kidlearnV3_3ohReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.LAST_PACKAGE_JSON
      ),
    lastDecision:
      kidlearnV3_3ohReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.LAST_DECISION_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3O-H ready.
 */
function kidlearnV3_assertProdChangeRequestExecutionDecisionGate3OHReadyV3() {
  var status =
    kidlearnV3_getProdChangeRequestExecutionDecisionGate3OHStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.READY_FOR_3O_I
  ) {
    errors.push(
      '3O-H chưa READY_FOR_3O_I. Status=' +
      status.status
    );
  }

  if (!status.decisionGateId) {
    errors.push(
      'Thiếu decisionGateId.'
    );
  }

  var prodInfo =
    kidlearnV3_3ohGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_CHANGE_REQUEST_EXECUTION_DECISION_GATE_3OH_READY_V3',
    bundle: '3O-H',
    phase: KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.PHASE,
    status: status.status,
    decisionGateId: status.decisionGateId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3O-H chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3O-H package-only.
 *
 * Không record decision trong QA batch.
 */
function kidlearnV3_getQaBatchSteps3OHV3() {
  return [
    {
      label: 'Assert 3O-G ready',
      functionName: 'kidlearnV3_assertProdChangeRequestExecutionDryRun3OGReadyV3'
    },
    {
      label: 'Preview PROD CR Execution Decision Gate 3O-H',
      functionName: 'kidlearnV3_previewProdChangeRequestExecutionDecisionGate3OHV3'
    },
    {
      label: 'Generate PROD CR Execution Decision Gate Package 3O-H',
      functionName: 'kidlearnV3_generateProdChangeRequestExecutionDecisionGatePackage3OHV3'
    }
  ];
}


/**
 * QA batch 3O-H package-only.
 */
function kidlearnV3_runQaBatch3OHV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3O_H_PROD_CHANGE_REQUEST_EXECUTION_DECISION_GATE_PACKAGE_ONLY',
    kidlearnV3_getQaBatchSteps3OHV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build decision policy.
 */
function kidlearnV3_3ohBuildDecisionPolicy_() {
  return {
    gateName:
      'KIDLEARN V3 PROD Change Request Execution Decision Gate',
    gateScope:
      'Decide whether to move from dry-run rehearsal to selected execution package preparation.',
    allowedDecision:
      KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.DECISION_RESULT,
    whatThisDecisionAllows: [
      'Đi tiếp sang 3O-I selected execution package.',
      'Chuẩn bị selected requestId/requestType trong phase sau.',
      'Chuẩn bị execution checklist chi tiết.',
      'Chuẩn bị backup/rollback/test plan chi tiết.',
      'Chuẩn bị final execution approval nếu cần.'
    ],
    whatThisDecisionDoesNotAllow: [
      'Không execute change request trong 3O-H.',
      'Không ghi vào PROD file trong 3O-H.',
      'Không mở PROD write policy trong 3O-H.',
      'Không migration trong 3O-H.',
      'Không rollback trong 3O-H.',
      'Không tạo/xóa sheet trong 3O-H.'
    ],
    decisionOutcomes: [
      {
        outcome: 'HOLD_NO_EXECUTION',
        meaning: 'Dừng lại, không đi tiếp execution package.'
      },
      {
        outcome: 'PROCEED_TO_3O_I_PACKAGE_ONLY',
        meaning: 'Cho phép tạo selected execution package ở 3O-I, chưa execute.'
      }
    ],
    blockedIn3OH: [
      'REAL_PROD_WRITE',
      'PROD_WRITE_ENABLE',
      'CHANGE_REQUEST_EXECUTION',
      'DATA_MIGRATION',
      'ROLLBACK',
      'DELETE_SHEET',
      'CREATE_SHEET',
      'NEW_PROD_DEPLOY'
    ],
    requiredBeforeActualExecution: [
      'Selected requestId',
      'Selected requestType',
      'Selected execution package',
      'Request-specific approval',
      'Backup/rollback plan',
      'Test plan',
      'Manual execution confirm text',
      'Post-execution validation plan'
    ],
    defaultDecisionFor3OH:
      KIDLEARN_V3_PROD_CR_DECISION_3OH_CONFIG.DECISION_RESULT,
    prodRuntimePolicyAfter3OH:
      'READ_ONLY',
    prodWriteAllowedAfter3OH:
      false
  };
}


/**
 * PROD info từ 3N-F.
 */
function kidlearnV3_3ohGetProdInfo_() {
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
function kidlearnV3_3ohCheckFileAccessible_(fileId, label) {
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
function kidlearnV3_3ohCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3ohSafeWriteStatus_();

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
    kidlearnV3_3ohControlledWriteStatus_();

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
function kidlearnV3_3ohSafeAssert_(functionName, label) {
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
function kidlearnV3_3ohSafeCall_(functionName) {
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
        kidlearnV3_3ohSummarizeStatusOutput_(
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
function kidlearnV3_3ohSummarizeStatusOutput_(output) {
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
    dryRunId: output.dryRunId || '',
    executionGateId: output.executionGateId || '',
    planId: output.planId || '',
    approvalGateId: output.approvalGateId || '',
    workflowId: output.workflowId || '',
    finalLockId: output.finalLockId || '',
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0
  };
}


/**
 * Safe Write status.
 */
function kidlearnV3_3ohSafeWriteStatus_() {
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
function kidlearnV3_3ohControlledWriteStatus_() {
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
function kidlearnV3_3ohCheckFunctions_(names) {
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
 * Decision gate ID.
 */
function kidlearnV3_3ohMakeDecisionGateId_() {
  return (
    'PROD_CR_DECISION_GATE_3OH_' +
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
function kidlearnV3_3ohSavePackage_(decisionPackage) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.DECISION_GATE_ID,
    decisionPackage.decisionGateId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.LAST_PACKAGE_JSON,
    JSON.stringify(decisionPackage)
  );
}


/**
 * Save result.
 */
function kidlearnV3_3ohSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.READY_FOR_3O_I &&
    (
      status === KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.PACKAGE_GENERATED ||
      status === KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.DECISION_GATE_RECORDED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_CR_DECISION_3OH_STATUS.READY_FOR_3O_I;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_DECISION_3OH_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      decisionGateId: result.decisionGateId || '',
      prodFileId: result.prodFileId || '',
      prodFileUrl: result.prodFileUrl || '',
      decisionResult: result.decisionResult || '',
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
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
function kidlearnV3_3ohReadJsonProperty_(key) {
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
function kidlearnV3_3ohNormalizeOptions_(options) {
  if (!options) return {};

  if (typeof options !== 'object') {
    return {
      value: options
    };
  }

  return options;
}