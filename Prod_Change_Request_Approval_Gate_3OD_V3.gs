/**
 * ================================================================
 * KIDLEARN V3 - PROD CHANGE REQUEST APPROVAL GATE
 * Bundle: 3O-D
 * Version: 3.1.0
 * ================================================================
 *
 * 3O-D:
 * - Tạo approval gate cho PROD change request workflow.
 * - Ghi nhận approval để đi tiếp sang phase planning.
 * - Không approve request cụ thể.
 * - Không execute request.
 * - Không mở PROD write.
 * - Không ghi vào PROD file.
 * - Không migration.
 * - Không rollback.
 * - Chỉ ghi ScriptProperties trong DEV script để lưu approval gate/status.
 */


var KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3OD_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3OD_LAST_PREVIEW_AT',
  LAST_PACKAGE_AT: 'KIDLEARN_V3_PHASE_3OD_LAST_PACKAGE_AT',
  LAST_APPROVAL_AT: 'KIDLEARN_V3_PHASE_3OD_LAST_APPROVAL_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3OD_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3OD_LAST_RESULT_JSON',
  LAST_PACKAGE_JSON: 'KIDLEARN_V3_PHASE_3OD_LAST_PACKAGE_JSON',
  LAST_APPROVAL_JSON: 'KIDLEARN_V3_PHASE_3OD_LAST_APPROVAL_JSON',
  APPROVAL_GATE_ID: 'KIDLEARN_V3_PHASE_3OD_APPROVAL_GATE_ID'
};


var KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  PACKAGE_GENERATED: 'PACKAGE_GENERATED',
  APPROVAL_GATE_RECORDED: 'APPROVAL_GATE_RECORDED',
  READY_FOR_3O_E: 'READY_FOR_3O_E',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG = {
  VERSION: '3O-D',
  PHASE: '3O-D',
  NEXT_BUNDLE: '3O-E',
  NEXT_STAGE: 'PROD_CHANGE_REQUEST_IMPLEMENTATION_PLANNING',
  WRITE_MODE: 'CHANGE_REQUEST_APPROVAL_GATE_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  CONFIRM_TEXT: 'APPROVE_CHANGE_REQUEST_GATE_3O_D'
};


/**
 * Preview 3O-D.
 */
function kidlearnV3_previewProdChangeRequestApprovalGate3ODV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3odCheckFunctions_([
      'kidlearnV3_assertProdChangeRequestWorkflow3OCReadyV3',
      'kidlearnV3_getProdChangeRequestWorkflow3OCStatusV3',
      'kidlearnV3_getProdReadonlySupportChangeGate3OBStatusV3',
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3OC =
    kidlearnV3_3odSafeAssert_(
      'kidlearnV3_assertProdChangeRequestWorkflow3OCReadyV3',
      '3O-C'
    );

  if (!phase3OC.success) {
    errors.push(
      '3O-C chưa READY_FOR_3O_D: ' +
      phase3OC.message
    );
  }

  var workflowStatus =
    kidlearnV3_3odSafeCall_(
      'kidlearnV3_getProdChangeRequestWorkflow3OCStatusV3'
    );

  if (
    workflowStatus.summary.status &&
    workflowStatus.summary.status !== 'READY_FOR_3O_D'
  ) {
    errors.push(
      '3O-C workflow chưa READY_FOR_3O_D. Status=' +
      workflowStatus.summary.status
    );
  }

  var supportGate =
    kidlearnV3_3odSafeCall_(
      'kidlearnV3_getProdReadonlySupportChangeGate3OBStatusV3'
    );

  if (
    supportGate.summary.changeGateStatus &&
    supportGate.summary.changeGateStatus !== 'CLOSED'
  ) {
    errors.push(
      'Change gate từ 3O-B phải CLOSED trước approval gate. Current=' +
      supportGate.summary.changeGateStatus
    );
  }

  var finalLock =
    kidlearnV3_3odSafeCall_(
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
    kidlearnV3_3odGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodCheck =
    kidlearnV3_3odCheckFileAccessible_(
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
    kidlearnV3_3odCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_CHANGE_REQUEST_APPROVAL_GATE_3OD_V3',
    bundle: '3O-D',
    phase: KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.WRITE_MODE,
    confirmText:
      KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.CONFIRM_TEXT,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    approvalGateOnly: true,
    specificChangeApprovedNow: false,
    changeRequestExecutedNow: false,
    prodWritePolicyOpenedNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3OC: phase3OC,
    workflowStatus: workflowStatus.summary,
    supportGate: supportGate.summary,
    finalLock: finalLock.summary,
    prodInfo: prodInfo,
    prodCheck: prodCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3O-D chỉ là approval gate để đi tiếp sang planning. Không approve request cụ thể và không ghi PROD.'
  };

  kidlearnV3_3odSaveResult_(
    result,
    KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Generate approval gate package.
 *
 * Không record approval trong hàm này.
 */
function kidlearnV3_generateProdChangeRequestApprovalGatePackage3ODV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdChangeRequestApprovalGate3ODV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate approval gate package 3O-D vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var approvalGateId =
    kidlearnV3_3odMakeApprovalGateId_();

  var prodInfo =
    kidlearnV3_3odGetProdInfo_();

  var workflow =
    kidlearnV3_3odSafeCall_(
      'kidlearnV3_getProdChangeRequestWorkflow3OCStatusV3'
    );

  var supportGate =
    kidlearnV3_3odSafeCall_(
      'kidlearnV3_getProdReadonlySupportChangeGate3OBStatusV3'
    );

  var monitoring =
    kidlearnV3_3odSafeCall_(
      'kidlearnV3_getProdReadonlyMonitoringOnboarding3OAStatusV3'
    );

  var finalLock =
    kidlearnV3_3odSafeCall_(
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3'
    );

  var handover =
    kidlearnV3_3odSafeCall_(
      'kidlearnV3_getProdReleaseHandover3NIStatusV3'
    );

  var prodCheck =
    kidlearnV3_3odCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi generate package: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3odCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var approvalPolicy =
    kidlearnV3_3odBuildApprovalPolicy_();

  var finishedAt = new Date();

  var approvalPackage = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_CHANGE_REQUEST_APPROVAL_GATE_PACKAGE_3OD_V3',
    bundle: '3O-D',
    phase: KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.PACKAGE_GENERATED
        : KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.FAILED,
    approvalGateId: approvalGateId,
    nextBundle:
      KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.NEXT_STAGE,
    confirmText:
      KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.CONFIRM_TEXT,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    approvalGateOnly: true,
    specificChangeApprovedNow: false,
    changeRequestExecutedNow: false,
    prodWritePolicyOpenedNow: false,

    prodReference: {
      prodFileId: prodInfo.prodFileId || '',
      prodFileUrl: prodInfo.prodFileUrl || '',
      prodFileName: prodInfo.prodFileName || '',
      deploymentId: prodInfo.deploymentId || '',
      accessible: prodCheck.success
    },

    upstreamReadiness: {
      workflow3OC: workflow.summary,
      supportGate3OB: supportGate.summary,
      monitoring3OA: monitoring.summary,
      handover3NI: handover.summary,
      finalLock3NJ: finalLock.summary
    },

    approvalPolicy: approvalPolicy,

    approvalChecklist: [
      {
        item: '3O-C workflow ready',
        passed:
          workflow.summary.status === 'READY_FOR_3O_D'
      },
      {
        item: '3O-B change gate remains CLOSED',
        passed:
          supportGate.summary.changeGateStatus === 'CLOSED'
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
        item: 'No request executed in 3O-D',
        passed: true
      },
      {
        item: 'No PROD write policy opened in 3O-D',
        passed: true
      }
    ],

    approvalMeaning:
      'Approval gate này chỉ cho phép đi tiếp sang 3O-E implementation planning. Nó không approve request cụ thể và không mở PROD write.',

    noSideEffect: {
      prodFileModifiedBy3OD: false,
      prodDataWrittenBy3OD: false,
      prodSheetCreatedBy3OD: false,
      prodSheetDeletedBy3OD: false,
      requestApprovedBy3OD: false,
      requestExecutedBy3OD: false,
      prodWritePolicyOpenedBy3OD: false
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

  kidlearnV3_3odSavePackage_(
    approvalPackage
  );

  kidlearnV3_3odSaveResult_(
    approvalPackage,
    approvalPackage.success
      ? KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.PACKAGE_GENERATED
      : KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.FAILED,
    KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.LAST_PACKAGE_AT
  );

  console.log(JSON.stringify(approvalPackage, null, 2));

  if (!approvalPackage.success) {
    throw new Error(
      '3O-D approval gate package failed. Errors=' +
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
 * Không ghi vào PROD.
 * Không approve request cụ thể.
 */
function kidlearnV3_recordProdChangeRequestApprovalGate3ODManualConfirmV3() {
  return kidlearnV3_recordProdChangeRequestApprovalGate3ODV3({
    confirmText:
      KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.CONFIRM_TEXT,
    approvedBy: 'DEV_APPROVER_MANUAL_3OD',
    approvalNote:
      'Change request approval gate recorded in 3O-D. This approves moving to planning only. No specific request approved or executed.'
  });
}


/**
 * Record approval gate.
 *
 * options:
 * {
 *   confirmText: 'APPROVE_CHANGE_REQUEST_GATE_3O_D',
 *   approvedBy: '...',
 *   approvalNote: '...'
 * }
 */
function kidlearnV3_recordProdChangeRequestApprovalGate3ODV3(options) {
  var req =
    kidlearnV3_3odNormalizeOptions_(options);

  var errors = [];
  var warnings = [];

  if (
    String(req.confirmText || '') !==
    KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.CONFIRM_TEXT
  ) {
    errors.push(
      'Confirm text không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.CONFIRM_TEXT
    );
  }

  var status =
    kidlearnV3_getProdChangeRequestApprovalGate3ODStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.PACKAGE_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.APPROVAL_GATE_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.READY_FOR_3O_E
  ) {
    errors.push(
      '3O-D chưa PACKAGE_GENERATED. Status=' +
      status.status
    );
  }

  if (
    !status.lastPackage ||
    status.lastPackage.success !== true
  ) {
    errors.push(
      'Last approval gate package chưa success=true.'
    );
  }

  var prodInfo =
    kidlearnV3_3odGetProdInfo_();

  var prodCheck =
    kidlearnV3_3odCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi record approval: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3odCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  if (errors.length > 0) {
    var failed = {
      success: false,
      action: 'RECORD_PROD_CHANGE_REQUEST_APPROVAL_GATE_3OD_V3',
      bundle: '3O-D',
      phase: KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.PHASE,
      status: status.status,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
      specificChangeApprovedNow: false,
      changeRequestExecutedNow: false,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors: errors,
      warnings: warnings
    };

    console.log(JSON.stringify(failed, null, 2));

    throw new Error(
      'Không thể record approval gate 3O-D. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var approvalGateId =
    status.approvalGateId ||
    kidlearnV3_3odMakeApprovalGateId_();

  var approval = {
    success: true,
    action: 'RECORD_PROD_CHANGE_REQUEST_APPROVAL_GATE_3OD_V3',
    bundle: '3O-D',
    phase: KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.APPROVAL_GATE_RECORDED,
    approvalGateId: approvalGateId,
    approvedBy:
      req.approvedBy || 'DEV_APPROVER_MANUAL_3OD',
    approvalNote:
      req.approvalNote || '',
    approvalMeaning:
      'Approval gate recorded to proceed to 3O-E planning only. No specific change request is approved or executed in 3O-D.',
    nextBundle:
      KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    approvalGateOnly: true,
    specificChangeApprovedNow: false,
    changeRequestExecutedNow: false,
    prodWritePolicyOpenedNow: false,
    safeModes: safeModes.summary,
    recordedAt:
      new Date().toISOString(),
    warningCount: warnings.length,
    warnings: warnings
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.APPROVAL_GATE_ID,
    approvalGateId
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.LAST_APPROVAL_JSON,
    JSON.stringify(approval)
  );

  kidlearnV3_3odSaveResult_(
    approval,
    KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.APPROVAL_GATE_RECORDED,
    KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.LAST_APPROVAL_AT
  );

  console.log(JSON.stringify(approval, null, 2));

  return approval;
}


/**
 * Mark 3O-D ready.
 */
function kidlearnV3_markProdChangeRequestApprovalGate3ODReadyV3() {
  var status =
    kidlearnV3_getProdChangeRequestApprovalGate3ODStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.APPROVAL_GATE_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.READY_FOR_3O_E
  ) {
    errors.push(
      '3O-D chưa APPROVAL_GATE_RECORDED. Status=' +
      status.status
    );
  }

  if (
    !status.lastApproval ||
    status.lastApproval.success !== true
  ) {
    errors.push(
      'Last approval chưa success=true.'
    );
  }

  if (!status.approvalGateId) {
    errors.push(
      'Thiếu approvalGateId.'
    );
  }

  var prodInfo =
    kidlearnV3_3odGetProdInfo_();

  var prodCheck =
    kidlearnV3_3odCheckFileAccessible_(
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
    kidlearnV3_3odCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3O-D ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_CHANGE_REQUEST_APPROVAL_GATE_3OD_READY_V3',
    bundle: '3O-D',
    phase: KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.READY_FOR_3O_E,
    approvalGateId: status.approvalGateId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    specificChangeApprovedNow: false,
    changeRequestExecutedNow: false,
    message:
      '3O-D ready. Approval gate đã được ghi nhận để đi tiếp sang 3O-E planning. Không có request cụ thể nào được approve hoặc execute.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3odSaveResult_(
    result,
    KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.READY_FOR_3O_E,
    KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3O-D status.
 */
function kidlearnV3_getProdChangeRequestApprovalGate3ODStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_CHANGE_REQUEST_APPROVAL_GATE_3OD_STATUS_V3',
    bundle: '3O-D',
    phase: KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.NOT_RUN,
    approvalGateId:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.APPROVAL_GATE_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastPackageAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.LAST_PACKAGE_AT
      ) ||
      '',
    lastApprovalAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.LAST_APPROVAL_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3odReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.LAST_RESULT_JSON
      ),
    lastPackage:
      kidlearnV3_3odReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.LAST_PACKAGE_JSON
      ),
    lastApproval:
      kidlearnV3_3odReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.LAST_APPROVAL_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3O-D ready.
 */
function kidlearnV3_assertProdChangeRequestApprovalGate3ODReadyV3() {
  var status =
    kidlearnV3_getProdChangeRequestApprovalGate3ODStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.READY_FOR_3O_E
  ) {
    errors.push(
      '3O-D chưa READY_FOR_3O_E. Status=' +
      status.status
    );
  }

  if (!status.approvalGateId) {
    errors.push(
      'Thiếu approvalGateId.'
    );
  }

  var prodInfo =
    kidlearnV3_3odGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_CHANGE_REQUEST_APPROVAL_GATE_3OD_READY_V3',
    bundle: '3O-D',
    phase: KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.PHASE,
    status: status.status,
    approvalGateId: status.approvalGateId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_APPROVAL_3OD_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3O-D chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3O-D package-only.
 *
 * Không record approval trong QA batch.
 */
function kidlearnV3_getQaBatchSteps3ODV3() {
  return [
    {
      label: 'Assert 3O-C ready',
      functionName: 'kidlearnV3_assertProdChangeRequestWorkflow3OCReadyV3'
    },
    {
      label: 'Preview PROD CR Approval Gate 3O-D',
      functionName: 'kidlearnV3_previewProdChangeRequestApprovalGate3ODV3'
    },
    {
      label: 'Generate PROD CR Approval Gate Package 3O-D',
      functionName: 'kidlearnV3_generateProdChangeRequestApprovalGatePackage3ODV3'
    }
  ];
}


/**
 * QA batch 3O-D package-only.
 */
function kidlearnV3_runQaBatch3ODV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3O_D_PROD_CHANGE_REQUEST_APPROVAL_GATE_PACKAGE_ONLY',
    kidlearnV3_getQaBatchSteps3ODV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build approval policy.
 */
function kidlearnV3_3odBuildApprovalPolicy_() {
  return {
    approvalGateName:
      'KIDLEARN V3 PROD Change Request Approval Gate',
    approvalScope:
      'Approve moving from review workflow to implementation planning only.',
    whatThisApproves: [
      'Cho phép đi tiếp sang 3O-E implementation planning.',
      'Cho phép phân tích request type, risk, rollback, impacted sheets.',
      'Cho phép chuẩn bị plan cho DEV fix hoặc PROD planning phase.'
    ],
    whatThisDoesNotApprove: [
      'Không approve một change request cụ thể.',
      'Không execute thay đổi trên PROD.',
      'Không mở PROD write policy.',
      'Không tạo release mới.',
      'Không migration.',
      'Không rollback.'
    ],
    requiredBeforeSpecificRequestApproval: [
      'Request ID cụ thể.',
      'Request type.',
      'Business reason.',
      'Affected sheets/modules.',
      'Risk level.',
      'Rollback plan.',
      'Testing plan.',
      'Named approval owner.',
      'Explicit approval phase.'
    ],
    highRiskRequestTypes: [
      'PROD_WRITE_POLICY_REQUEST',
      'NEW_RELEASE_REQUEST'
    ],
    defaultDecisionFor3OD:
      'APPROVE_PLANNING_ONLY',
    prodRuntimePolicyAfter3OD:
      'READ_ONLY',
    prodWriteAllowedAfter3OD:
      false
  };
}


/**
 * PROD info từ 3N-F.
 */
function kidlearnV3_3odGetProdInfo_() {
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
function kidlearnV3_3odCheckFileAccessible_(fileId, label) {
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
function kidlearnV3_3odCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3odSafeWriteStatus_();

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
    kidlearnV3_3odControlledWriteStatus_();

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
function kidlearnV3_3odSafeAssert_(functionName, label) {
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
function kidlearnV3_3odSafeCall_(functionName) {
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
        kidlearnV3_3odSummarizeStatusOutput_(
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
function kidlearnV3_3odSummarizeStatusOutput_(output) {
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
    workflowId: output.workflowId || '',
    supportPackageId: output.supportPackageId || '',
    changeGateId: output.changeGateId || '',
    changeGateStatus: output.changeGateStatus || '',
    finalLockId: output.finalLockId || '',
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0
  };
}


/**
 * Safe Write status.
 */
function kidlearnV3_3odSafeWriteStatus_() {
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
function kidlearnV3_3odControlledWriteStatus_() {
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
function kidlearnV3_3odCheckFunctions_(names) {
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
 * Approval gate ID.
 */
function kidlearnV3_3odMakeApprovalGateId_() {
  return (
    'PROD_CR_APPROVAL_GATE_3OD_' +
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
function kidlearnV3_3odSavePackage_(approvalPackage) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.APPROVAL_GATE_ID,
    approvalPackage.approvalGateId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.LAST_PACKAGE_JSON,
    JSON.stringify(approvalPackage)
  );
}


/**
 * Save result.
 */
function kidlearnV3_3odSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.READY_FOR_3O_E &&
    (
      status === KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.PACKAGE_GENERATED ||
      status === KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.APPROVAL_GATE_RECORDED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_CR_APPROVAL_3OD_STATUS.READY_FOR_3O_E;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_APPROVAL_3OD_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      approvalGateId: result.approvalGateId || '',
      prodFileId: result.prodFileId || '',
      prodFileUrl: result.prodFileUrl || '',
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
      specificChangeApprovedNow: false,
      changeRequestExecutedNow: false,
      prodWritePolicyOpenedNow: false,
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
function kidlearnV3_3odReadJsonProperty_(key) {
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
function kidlearnV3_3odNormalizeOptions_(options) {
  if (!options) return {};

  if (typeof options !== 'object') {
    return {
      value: options
    };
  }

  return options;
}