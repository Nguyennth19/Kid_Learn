/**
 * ================================================================
 * KIDLEARN V3 - PROD CHANGE REQUEST CONTROLLED EXECUTION GATE
 * Bundle: 3O-F
 * Version: 3.1.0
 * ================================================================
 *
 * 3O-F:
 * - Tạo controlled execution gate cho change request.
 * - Chỉ record gate để đi tiếp sang execution dry-run/rehearsal.
 * - Không execute request.
 * - Không mở PROD write.
 * - Không ghi vào PROD file.
 * - Không migration.
 * - Không rollback.
 * - Chỉ ghi ScriptProperties trong DEV script để lưu gate/status.
 */


var KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3OF_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3OF_LAST_PREVIEW_AT',
  LAST_PACKAGE_AT: 'KIDLEARN_V3_PHASE_3OF_LAST_PACKAGE_AT',
  LAST_GATE_AT: 'KIDLEARN_V3_PHASE_3OF_LAST_GATE_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3OF_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3OF_LAST_RESULT_JSON',
  LAST_PACKAGE_JSON: 'KIDLEARN_V3_PHASE_3OF_LAST_PACKAGE_JSON',
  LAST_GATE_JSON: 'KIDLEARN_V3_PHASE_3OF_LAST_GATE_JSON',
  EXECUTION_GATE_ID: 'KIDLEARN_V3_PHASE_3OF_EXECUTION_GATE_ID'
};


var KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  PACKAGE_GENERATED: 'PACKAGE_GENERATED',
  EXECUTION_GATE_RECORDED: 'EXECUTION_GATE_RECORDED',
  READY_FOR_3O_G: 'READY_FOR_3O_G',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG = {
  VERSION: '3O-F',
  PHASE: '3O-F',
  NEXT_BUNDLE: '3O-G',
  NEXT_STAGE: 'PROD_CHANGE_REQUEST_EXECUTION_DRY_RUN_REHEARSAL',
  WRITE_MODE: 'CONTROLLED_EXECUTION_GATE_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  CONFIRM_TEXT: 'ARM_CONTROLLED_EXECUTION_GATE_3O_F'
};


/**
 * Preview 3O-F.
 */
function kidlearnV3_previewProdChangeRequestControlledExecutionGate3OFV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3ofCheckFunctions_([
      'kidlearnV3_assertProdChangeRequestImplementationPlanning3OEReadyV3',
      'kidlearnV3_getProdChangeRequestImplementationPlanning3OEStatusV3',
      'kidlearnV3_getProdChangeRequestApprovalGate3ODStatusV3',
      'kidlearnV3_getProdChangeRequestWorkflow3OCStatusV3',
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3OE =
    kidlearnV3_3ofSafeAssert_(
      'kidlearnV3_assertProdChangeRequestImplementationPlanning3OEReadyV3',
      '3O-E'
    );

  if (!phase3OE.success) {
    errors.push(
      '3O-E chưa READY_FOR_3O_F: ' +
      phase3OE.message
    );
  }

  var planning =
    kidlearnV3_3ofSafeCall_(
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

  var approvalGate =
    kidlearnV3_3ofSafeCall_(
      'kidlearnV3_getProdChangeRequestApprovalGate3ODStatusV3'
    );

  if (
    approvalGate.summary.status &&
    approvalGate.summary.status !== 'READY_FOR_3O_E'
  ) {
    errors.push(
      '3O-D approval gate chưa READY_FOR_3O_E. Status=' +
      approvalGate.summary.status
    );
  }

  var finalLock =
    kidlearnV3_3ofSafeCall_(
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
    kidlearnV3_3ofGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodCheck =
    kidlearnV3_3ofCheckFileAccessible_(
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
    kidlearnV3_3ofCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_CHANGE_REQUEST_CONTROLLED_EXECUTION_GATE_3OF_V3',
    bundle: '3O-F',
    phase: KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.WRITE_MODE,
    confirmText:
      KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.CONFIRM_TEXT,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    gateOnly: true,
    changeRequestExecutedNow: false,
    prodWritePolicyOpenedNow: false,
    rollbackExecutedNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3OE: phase3OE,
    planning: planning.summary,
    approvalGate: approvalGate.summary,
    finalLock: finalLock.summary,
    prodInfo: prodInfo,
    prodCheck: prodCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3O-F chỉ là controlled execution gate. Không execute request và không ghi PROD.'
  };

  kidlearnV3_3ofSaveResult_(
    result,
    KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Generate controlled execution gate package.
 *
 * Không record gate trong hàm này.
 * Không execute request.
 */
function kidlearnV3_generateProdChangeRequestControlledExecutionGatePackage3OFV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdChangeRequestControlledExecutionGate3OFV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate controlled execution gate package 3O-F vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var executionGateId =
    kidlearnV3_3ofMakeExecutionGateId_();

  var prodInfo =
    kidlearnV3_3ofGetProdInfo_();

  var planning =
    kidlearnV3_3ofSafeCall_(
      'kidlearnV3_getProdChangeRequestImplementationPlanning3OEStatusV3'
    );

  var approvalGate =
    kidlearnV3_3ofSafeCall_(
      'kidlearnV3_getProdChangeRequestApprovalGate3ODStatusV3'
    );

  var workflow =
    kidlearnV3_3ofSafeCall_(
      'kidlearnV3_getProdChangeRequestWorkflow3OCStatusV3'
    );

  var supportGate =
    kidlearnV3_3ofSafeCall_(
      'kidlearnV3_getProdReadonlySupportChangeGate3OBStatusV3'
    );

  var finalLock =
    kidlearnV3_3ofSafeCall_(
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3'
    );

  var prodCheck =
    kidlearnV3_3ofCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi generate gate package: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3ofCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var executionGatePolicy =
    kidlearnV3_3ofBuildExecutionGatePolicy_();

  var finishedAt = new Date();

  var gatePackage = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_CHANGE_REQUEST_CONTROLLED_EXECUTION_GATE_PACKAGE_3OF_V3',
    bundle: '3O-F',
    phase: KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.PACKAGE_GENERATED
        : KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.FAILED,
    executionGateId: executionGateId,
    nextBundle:
      KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.NEXT_STAGE,
    confirmText:
      KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.CONFIRM_TEXT,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    gateOnly: true,
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
      planning3OE: planning.summary,
      approvalGate3OD: approvalGate.summary,
      workflow3OC: workflow.summary,
      supportGate3OB: supportGate.summary,
      finalLock3NJ: finalLock.summary
    },

    executionGatePolicy: executionGatePolicy,

    executionGateChecklist: [
      {
        item: '3O-E implementation planning ready',
        passed:
          planning.summary.status === 'READY_FOR_3O_F'
      },
      {
        item: '3O-D approval gate ready',
        passed:
          approvalGate.summary.status === 'READY_FOR_3O_E'
      },
      {
        item: '3O-C workflow ready',
        passed:
          workflow.summary.status === 'READY_FOR_3O_D'
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
        item: 'No change request executed in 3O-F',
        passed: true
      },
      {
        item: 'No PROD write policy opened in 3O-F',
        passed: true
      }
    ],

    gateMeaning:
      'Gate này chỉ cho phép đi tiếp sang 3O-G execution dry-run rehearsal. Nó không execute request và không mở PROD write.',

    noSideEffect: {
      prodFileModifiedBy3OF: false,
      prodDataWrittenBy3OF: false,
      prodSheetCreatedBy3OF: false,
      prodSheetDeletedBy3OF: false,
      requestExecutedBy3OF: false,
      prodWritePolicyOpenedBy3OF: false,
      rollbackExecutedBy3OF: false
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

  kidlearnV3_3ofSavePackage_(
    gatePackage
  );

  kidlearnV3_3ofSaveResult_(
    gatePackage,
    gatePackage.success
      ? KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.PACKAGE_GENERATED
      : KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.FAILED,
    KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.LAST_PACKAGE_AT
  );

  console.log(JSON.stringify(gatePackage, null, 2));

  if (!gatePackage.success) {
    throw new Error(
      '3O-F controlled execution gate package failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return gatePackage;
}


/**
 * Manual confirm wrapper.
 *
 * Không dùng Session.getActiveUser để tránh thêm OAuth scope.
 * Không execute request.
 * Không ghi PROD.
 */
function kidlearnV3_recordProdChangeRequestControlledExecutionGate3OFManualConfirmV3() {
  return kidlearnV3_recordProdChangeRequestControlledExecutionGate3OFV3({
    confirmText:
      KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.CONFIRM_TEXT,
    armedBy: 'DEV_EXECUTION_GATE_MANAGER_MANUAL_3OF',
    gateNote:
      'Controlled execution gate recorded in 3O-F. This only permits moving to 3O-G dry-run rehearsal. No PROD change executed.'
  });
}


/**
 * Record controlled execution gate.
 *
 * options:
 * {
 *   confirmText: 'ARM_CONTROLLED_EXECUTION_GATE_3O_F',
 *   armedBy: '...',
 *   gateNote: '...'
 * }
 */
function kidlearnV3_recordProdChangeRequestControlledExecutionGate3OFV3(options) {
  var req =
    kidlearnV3_3ofNormalizeOptions_(options);

  var errors = [];
  var warnings = [];

  if (
    String(req.confirmText || '') !==
    KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.CONFIRM_TEXT
  ) {
    errors.push(
      'Confirm text không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.CONFIRM_TEXT
    );
  }

  var status =
    kidlearnV3_getProdChangeRequestControlledExecutionGate3OFStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.PACKAGE_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.EXECUTION_GATE_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.READY_FOR_3O_G
  ) {
    errors.push(
      '3O-F chưa PACKAGE_GENERATED. Status=' +
      status.status
    );
  }

  if (
    !status.lastPackage ||
    status.lastPackage.success !== true
  ) {
    errors.push(
      'Last controlled execution gate package chưa success=true.'
    );
  }

  var prodInfo =
    kidlearnV3_3ofGetProdInfo_();

  var prodCheck =
    kidlearnV3_3ofCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi record gate: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3ofCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  if (errors.length > 0) {
    var failed = {
      success: false,
      action: 'RECORD_PROD_CHANGE_REQUEST_CONTROLLED_EXECUTION_GATE_3OF_V3',
      bundle: '3O-F',
      phase: KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.PHASE,
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
      'Không thể record controlled execution gate 3O-F. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var executionGateId =
    status.executionGateId ||
    kidlearnV3_3ofMakeExecutionGateId_();

  var gate = {
    success: true,
    action: 'RECORD_PROD_CHANGE_REQUEST_CONTROLLED_EXECUTION_GATE_3OF_V3',
    bundle: '3O-F',
    phase: KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.EXECUTION_GATE_RECORDED,
    executionGateId: executionGateId,
    armedBy:
      req.armedBy || 'DEV_EXECUTION_GATE_MANAGER_MANUAL_3OF',
    gateNote:
      req.gateNote || '',
    gateMeaning:
      'Controlled execution gate recorded to proceed to 3O-G dry-run rehearsal only. No request executed and no PROD write opened in 3O-F.',
    nextBundle:
      KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    gateOnly: true,
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
    KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.EXECUTION_GATE_ID,
    executionGateId
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.LAST_GATE_JSON,
    JSON.stringify(gate)
  );

  kidlearnV3_3ofSaveResult_(
    gate,
    KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.EXECUTION_GATE_RECORDED,
    KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.LAST_GATE_AT
  );

  console.log(JSON.stringify(gate, null, 2));

  return gate;
}


/**
 * Mark 3O-F ready.
 */
function kidlearnV3_markProdChangeRequestControlledExecutionGate3OFReadyV3() {
  var status =
    kidlearnV3_getProdChangeRequestControlledExecutionGate3OFStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.EXECUTION_GATE_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.READY_FOR_3O_G
  ) {
    errors.push(
      '3O-F chưa EXECUTION_GATE_RECORDED. Status=' +
      status.status
    );
  }

  if (
    !status.lastGate ||
    status.lastGate.success !== true
  ) {
    errors.push(
      'Last controlled execution gate chưa success=true.'
    );
  }

  if (!status.executionGateId) {
    errors.push(
      'Thiếu executionGateId.'
    );
  }

  var prodInfo =
    kidlearnV3_3ofGetProdInfo_();

  var prodCheck =
    kidlearnV3_3ofCheckFileAccessible_(
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
    kidlearnV3_3ofCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3O-F ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_CHANGE_REQUEST_CONTROLLED_EXECUTION_GATE_3OF_READY_V3',
    bundle: '3O-F',
    phase: KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.READY_FOR_3O_G,
    executionGateId: status.executionGateId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    changeRequestExecutedNow: false,
    prodWritePolicyOpenedNow: false,
    rollbackExecutedNow: false,
    message:
      '3O-F ready. Controlled execution gate đã được record. Bước tiếp theo là 3O-G execution dry-run rehearsal.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3ofSaveResult_(
    result,
    KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.READY_FOR_3O_G,
    KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3O-F status.
 */
function kidlearnV3_getProdChangeRequestControlledExecutionGate3OFStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_CHANGE_REQUEST_CONTROLLED_EXECUTION_GATE_3OF_STATUS_V3',
    bundle: '3O-F',
    phase: KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.NOT_RUN,
    executionGateId:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.EXECUTION_GATE_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastPackageAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.LAST_PACKAGE_AT
      ) ||
      '',
    lastGateAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.LAST_GATE_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3ofReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.LAST_RESULT_JSON
      ),
    lastPackage:
      kidlearnV3_3ofReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.LAST_PACKAGE_JSON
      ),
    lastGate:
      kidlearnV3_3ofReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.LAST_GATE_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3O-F ready.
 */
function kidlearnV3_assertProdChangeRequestControlledExecutionGate3OFReadyV3() {
  var status =
    kidlearnV3_getProdChangeRequestControlledExecutionGate3OFStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.READY_FOR_3O_G
  ) {
    errors.push(
      '3O-F chưa READY_FOR_3O_G. Status=' +
      status.status
    );
  }

  if (!status.executionGateId) {
    errors.push(
      'Thiếu executionGateId.'
    );
  }

  var prodInfo =
    kidlearnV3_3ofGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_CHANGE_REQUEST_CONTROLLED_EXECUTION_GATE_3OF_READY_V3',
    bundle: '3O-F',
    phase: KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.PHASE,
    status: status.status,
    executionGateId: status.executionGateId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3O-F chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3O-F package-only.
 *
 * Không record gate trong QA batch.
 */
function kidlearnV3_getQaBatchSteps3OFV3() {
  return [
    {
      label: 'Assert 3O-E ready',
      functionName: 'kidlearnV3_assertProdChangeRequestImplementationPlanning3OEReadyV3'
    },
    {
      label: 'Preview PROD CR Controlled Execution Gate 3O-F',
      functionName: 'kidlearnV3_previewProdChangeRequestControlledExecutionGate3OFV3'
    },
    {
      label: 'Generate PROD CR Controlled Execution Gate Package 3O-F',
      functionName: 'kidlearnV3_generateProdChangeRequestControlledExecutionGatePackage3OFV3'
    }
  ];
}


/**
 * QA batch 3O-F package-only.
 */
function kidlearnV3_runQaBatch3OFV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3O_F_PROD_CHANGE_REQUEST_CONTROLLED_EXECUTION_GATE_PACKAGE_ONLY',
    kidlearnV3_getQaBatchSteps3OFV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build execution gate policy.
 */
function kidlearnV3_3ofBuildExecutionGatePolicy_() {
  return {
    gateName:
      'KIDLEARN V3 PROD Change Request Controlled Execution Gate',
    gateScope:
      'Allow moving to dry-run/rehearsal for controlled change execution only.',
    whatThisGateAllows: [
      'Đi tiếp sang 3O-G dry-run rehearsal.',
      'Chuẩn bị execution dry-run package.',
      'Xác định selected request type trong phase sau.',
      'Kiểm tra risk/test/rollback trước execution thật.'
    ],
    whatThisGateDoesNotAllow: [
      'Không execute change request trong 3O-F.',
      'Không ghi vào PROD file trong 3O-F.',
      'Không mở PROD write policy trong 3O-F.',
      'Không migration trong 3O-F.',
      'Không rollback trong 3O-F.',
      'Không tạo PROD file mới trong 3O-F.'
    ],
    executionModesAllowedInFuturePhase: [
      'DRY_RUN_REHEARSAL',
      'CONTROLLED_ONE_ROW_TRIAL_ONLY_IF_APPROVED',
      'CONTROLLED_PATCH_ONLY_IF_APPROVED'
    ],
    blockedIn3OF: [
      'REAL_PROD_WRITE',
      'PROD_WRITE_ENABLE',
      'DATA_MIGRATION',
      'ROLLBACK',
      'DELETE_SHEET',
      'CREATE_SHEET',
      'NEW_PROD_DEPLOY'
    ],
    requiredBeforeActualExecution: [
      'Selected requestId',
      'Selected requestType',
      'Execution dry-run rehearsal passed',
      'Explicit execution approval',
      'Backup and rollback plan reviewed',
      'Safe Write policy reviewed',
      'Manual confirmation text in execution phase'
    ],
    defaultDecisionFor3OF:
      'ARM_GATE_FOR_DRY_RUN_REHEARSAL_ONLY',
    prodRuntimePolicyAfter3OF:
      'READ_ONLY',
    prodWriteAllowedAfter3OF:
      false
  };
}


/**
 * PROD info từ 3N-F.
 */
function kidlearnV3_3ofGetProdInfo_() {
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
function kidlearnV3_3ofCheckFileAccessible_(fileId, label) {
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
function kidlearnV3_3ofCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3ofSafeWriteStatus_();

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
    kidlearnV3_3ofControlledWriteStatus_();

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
function kidlearnV3_3ofSafeAssert_(functionName, label) {
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
function kidlearnV3_3ofSafeCall_(functionName) {
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
        kidlearnV3_3ofSummarizeStatusOutput_(
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
function kidlearnV3_3ofSummarizeStatusOutput_(output) {
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
    planId: output.planId || '',
    approvalGateId: output.approvalGateId || '',
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
function kidlearnV3_3ofSafeWriteStatus_() {
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
function kidlearnV3_3ofControlledWriteStatus_() {
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
function kidlearnV3_3ofCheckFunctions_(names) {
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
 * Execution gate ID.
 */
function kidlearnV3_3ofMakeExecutionGateId_() {
  return (
    'PROD_CR_EXEC_GATE_3OF_' +
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
function kidlearnV3_3ofSavePackage_(gatePackage) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.EXECUTION_GATE_ID,
    gatePackage.executionGateId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.LAST_PACKAGE_JSON,
    JSON.stringify(gatePackage)
  );
}


/**
 * Save result.
 */
function kidlearnV3_3ofSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.READY_FOR_3O_G &&
    (
      status === KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.PACKAGE_GENERATED ||
      status === KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.EXECUTION_GATE_RECORDED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_STATUS.READY_FOR_3O_G;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_EXEC_GATE_3OF_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      executionGateId: result.executionGateId || '',
      prodFileId: result.prodFileId || '',
      prodFileUrl: result.prodFileUrl || '',
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
function kidlearnV3_3ofReadJsonProperty_(key) {
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
function kidlearnV3_3ofNormalizeOptions_(options) {
  if (!options) return {};

  if (typeof options !== 'object') {
    return {
      value: options
    };
  }

  return options;
}