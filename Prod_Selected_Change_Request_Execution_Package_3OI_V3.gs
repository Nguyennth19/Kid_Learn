/**
 * ================================================================
 * KIDLEARN V3 - PROD SELECTED CHANGE REQUEST EXECUTION PACKAGE
 * Bundle: 3O-I
 * Version: 3.1.0
 * ================================================================
 *
 * 3O-I:
 * - Tạo selected execution package cho change request.
 * - Validate risk/test/rollback/approval.
 * - Không execute request.
 * - Không mở PROD write.
 * - Không ghi vào PROD file.
 * - Không migration.
 * - Không rollback.
 * - Chỉ ghi ScriptProperties trong DEV script để lưu package/status.
 */


var KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3OI_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3OI_LAST_PREVIEW_AT',
  LAST_PACKAGE_AT: 'KIDLEARN_V3_PHASE_3OI_LAST_PACKAGE_AT',
  LAST_VALIDATION_AT: 'KIDLEARN_V3_PHASE_3OI_LAST_VALIDATION_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3OI_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3OI_LAST_RESULT_JSON',
  LAST_PACKAGE_JSON: 'KIDLEARN_V3_PHASE_3OI_LAST_PACKAGE_JSON',
  LAST_VALIDATION_JSON: 'KIDLEARN_V3_PHASE_3OI_LAST_VALIDATION_JSON',
  EXECUTION_PACKAGE_ID: 'KIDLEARN_V3_PHASE_3OI_EXECUTION_PACKAGE_ID',
  SELECTED_REQUEST_ID: 'KIDLEARN_V3_PHASE_3OI_SELECTED_REQUEST_ID',
  SELECTED_REQUEST_TYPE: 'KIDLEARN_V3_PHASE_3OI_SELECTED_REQUEST_TYPE'
};


var KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  PACKAGE_GENERATED: 'PACKAGE_GENERATED',
  PACKAGE_VALIDATED: 'PACKAGE_VALIDATED',
  READY_FOR_3O_J: 'READY_FOR_3O_J',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG = {
  VERSION: '3O-I',
  PHASE: '3O-I',
  NEXT_BUNDLE: '3O-J',
  NEXT_STAGE: 'PROD_SELECTED_CHANGE_REQUEST_FINAL_EXECUTION_APPROVAL_GATE',
  WRITE_MODE: 'SELECTED_EXECUTION_PACKAGE_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  EXECUTION_ALLOWED_NOW: false,
  DEFAULT_SELECTED_REQUEST_ID: 'SAMPLE_SELECTED_CR_3OI_DATA_FIX',
  DEFAULT_SELECTED_REQUEST_TYPE: 'DATA_FIX',
  ALLOWED_REQUEST_TYPES: [
    'DATA_FIX',
    'CONTENT_UPDATE',
    'UI_FIX',
    'PERFORMANCE_FIX',
    'PROD_WRITE_POLICY_REQUEST',
    'NEW_RELEASE_REQUEST'
  ]
};


/**
 * Preview 3O-I.
 */
function kidlearnV3_previewProdSelectedChangeRequestExecutionPackage3OIV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3oiCheckFunctions_([
      'kidlearnV3_assertProdChangeRequestExecutionDecisionGate3OHReadyV3',
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

  var phase3OH =
    kidlearnV3_3oiSafeAssert_(
      'kidlearnV3_assertProdChangeRequestExecutionDecisionGate3OHReadyV3',
      '3O-H'
    );

  if (!phase3OH.success) {
    errors.push(
      '3O-H chưa READY_FOR_3O_I: ' +
      phase3OH.message
    );
  }

  var decisionGate =
    kidlearnV3_3oiSafeCall_(
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
    kidlearnV3_3oiSafeCall_(
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
    kidlearnV3_3oiSafeCall_(
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
    kidlearnV3_3oiGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodCheck =
    kidlearnV3_3oiCheckFileAccessible_(
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
    kidlearnV3_3oiCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_SELECTED_CHANGE_REQUEST_EXECUTION_PACKAGE_3OI_V3',
    bundle: '3O-I',
    phase: KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.WRITE_MODE,
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
    warnings: warnings,
    phase3OH: phase3OH,
    decisionGate: decisionGate.summary,
    dryRun: dryRun.summary,
    finalLock: finalLock.summary,
    prodInfo: prodInfo,
    prodCheck: prodCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3O-I chỉ tạo selected execution package. Không execute request và không ghi PROD.'
  };

  kidlearnV3_3oiSaveResult_(
    result,
    KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Generate selected execution package với default sample request.
 */
function kidlearnV3_generateProdSelectedChangeRequestExecutionPackage3OIV3() {
  return kidlearnV3_generateProdSelectedChangeRequestExecutionPackage3OIWithOptionsV3({
    selectedRequestId:
      KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.DEFAULT_SELECTED_REQUEST_ID,
    selectedRequestType:
      KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.DEFAULT_SELECTED_REQUEST_TYPE,
    selectedBy: 'DEV_PACKAGE_MANAGER_3OI',
    packageNote:
      'Default selected execution package for 3O-I. Package only. No PROD execution.'
  });
}


/**
 * Generate selected execution package with options.
 *
 * options:
 * {
 *   selectedRequestId: '...',
 *   selectedRequestType: 'DATA_FIX',
 *   selectedBy: '...',
 *   packageNote: '...'
 * }
 */
function kidlearnV3_generateProdSelectedChangeRequestExecutionPackage3OIWithOptionsV3(options) {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var req =
    kidlearnV3_3oiNormalizeOptions_(options);

  var preview =
    kidlearnV3_previewProdSelectedChangeRequestExecutionPackage3OIV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate selected execution package 3O-I vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var selectedRequestId =
    String(
      req.selectedRequestId ||
      KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.DEFAULT_SELECTED_REQUEST_ID
    ).trim();

  var selectedRequestType =
    String(
      req.selectedRequestType ||
      KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.DEFAULT_SELECTED_REQUEST_TYPE
    ).trim();

  if (!selectedRequestId) {
    errors.push('Thiếu selectedRequestId.');
  }

  if (
    KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.ALLOWED_REQUEST_TYPES
      .indexOf(selectedRequestType) < 0
  ) {
    errors.push(
      'selectedRequestType không hợp lệ: ' +
      selectedRequestType
    );
  }

  var executionPackageId =
    kidlearnV3_3oiMakeExecutionPackageId_();

  var prodInfo =
    kidlearnV3_3oiGetProdInfo_();

  var prodCheck =
    kidlearnV3_3oiCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi generate package: ' +
      prodCheck.message
    );
  }

  var decisionGate =
    kidlearnV3_3oiSafeCall_(
      'kidlearnV3_getProdChangeRequestExecutionDecisionGate3OHStatusV3'
    );

  var dryRun =
    kidlearnV3_3oiSafeCall_(
      'kidlearnV3_getProdChangeRequestExecutionDryRun3OGStatusV3'
    );

  var executionGate =
    kidlearnV3_3oiSafeCall_(
      'kidlearnV3_getProdChangeRequestControlledExecutionGate3OFStatusV3'
    );

  var planning =
    kidlearnV3_3oiSafeCall_(
      'kidlearnV3_getProdChangeRequestImplementationPlanning3OEStatusV3'
    );

  var finalLock =
    kidlearnV3_3oiSafeCall_(
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3'
    );

  var safeModes =
    kidlearnV3_3oiCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var selectedRequest =
    kidlearnV3_3oiBuildSelectedRequest_(
      selectedRequestId,
      selectedRequestType,
      req
    );

  var executionPlan =
    kidlearnV3_3oiBuildExecutionPlanForRequest_(
      selectedRequest
    );

  var finishedAt = new Date();

  var packageResult = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_SELECTED_CHANGE_REQUEST_EXECUTION_PACKAGE_3OI_V3',
    bundle: '3O-I',
    phase: KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.PACKAGE_GENERATED
        : KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.FAILED,
    executionPackageId: executionPackageId,
    selectedRequestId: selectedRequestId,
    selectedRequestType: selectedRequestType,
    nextBundle:
      KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    executionAllowedNow: false,
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
      decisionGate3OH: decisionGate.summary,
      dryRun3OG: dryRun.summary,
      executionGate3OF: executionGate.summary,
      planning3OE: planning.summary,
      finalLock3NJ: finalLock.summary
    },

    selectedRequest: selectedRequest,

    executionPlan: executionPlan,

    packagePolicy: {
      packageOnly: true,
      executionPermission: 'NOT_GRANTED',
      finalExecutionApprovalRequired: true,
      selectedRequestApprovalRequired: true,
      backupRequiredBeforeExecution: true,
      rollbackPlanRequiredBeforeExecution: true,
      postExecutionValidationRequired: true,
      prodWritePolicyRequiredForActualWrite:
        selectedRequest.prodWriteRequiredForActual === true,
      prodWritePolicyOpenedNow: false
    },

    packageChecklist: [
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
        item: 'Selected request has ID',
        passed:
          selectedRequestId ? true : false
      },
      {
        item: 'Selected request type is allowed',
        passed:
          KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.ALLOWED_REQUEST_TYPES
            .indexOf(selectedRequestType) >= 0
      },
      {
        item: 'Execution plan has test plan',
        passed:
          executionPlan.testPlan &&
          executionPlan.testPlan.length > 0
      },
      {
        item: 'Execution plan has rollback plan',
        passed:
          executionPlan.rollbackPlan &&
          executionPlan.rollbackPlan.length > 0
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
        item: 'No request executed in 3O-I',
        passed: true
      },
      {
        item: 'No PROD write policy opened in 3O-I',
        passed: true
      }
    ],

    noSideEffect: {
      prodFileModifiedBy3OI: false,
      prodDataWrittenBy3OI: false,
      prodSheetCreatedBy3OI: false,
      prodSheetDeletedBy3OI: false,
      requestExecutedBy3OI: false,
      prodWritePolicyOpenedBy3OI: false,
      rollbackExecutedBy3OI: false
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

  kidlearnV3_3oiSavePackage_(
    packageResult
  );

  kidlearnV3_3oiSaveResult_(
    packageResult,
    packageResult.success
      ? KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.PACKAGE_GENERATED
      : KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.FAILED,
    KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.LAST_PACKAGE_AT
  );

  console.log(JSON.stringify(packageResult, null, 2));

  if (!packageResult.success) {
    throw new Error(
      '3O-I selected execution package failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return packageResult;
}


/**
 * Validate selected execution package.
 *
 * Không execute request.
 */
function kidlearnV3_validateProdSelectedChangeRequestExecutionPackage3OIV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var status =
    kidlearnV3_getProdSelectedChangeRequestExecutionPackage3OIStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.PACKAGE_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.PACKAGE_VALIDATED &&
    status.status !== KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.READY_FOR_3O_J
  ) {
    errors.push(
      '3O-I cần PACKAGE_GENERATED trước khi validate. Status=' +
      status.status
    );
  }

  if (
    !status.lastPackage ||
    status.lastPackage.success !== true
  ) {
    errors.push(
      'Last selected execution package chưa success=true.'
    );
  }

  var pkg =
    status.lastPackage || {};

  var selectedRequest =
    pkg.selectedRequest || {};

  var executionPlan =
    pkg.executionPlan || {};

  var packagePolicy =
    pkg.packagePolicy || {};

  if (!pkg.executionPackageId) {
    errors.push('Package thiếu executionPackageId.');
  }

  if (!selectedRequest.selectedRequestId) {
    errors.push('Package thiếu selectedRequestId.');
  }

  if (!selectedRequest.selectedRequestType) {
    errors.push('Package thiếu selectedRequestType.');
  }

  if (
    KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.ALLOWED_REQUEST_TYPES
      .indexOf(selectedRequest.selectedRequestType) < 0
  ) {
    errors.push(
      'selectedRequestType không hợp lệ: ' +
      selectedRequest.selectedRequestType
    );
  }

  if (
    !executionPlan.executionSteps ||
    !Array.isArray(executionPlan.executionSteps) ||
    executionPlan.executionSteps.length < 1
  ) {
    errors.push('Execution plan thiếu executionSteps.');
  }

  if (
    !executionPlan.testPlan ||
    !Array.isArray(executionPlan.testPlan) ||
    executionPlan.testPlan.length < 1
  ) {
    errors.push('Execution plan thiếu testPlan.');
  }

  if (
    !executionPlan.rollbackPlan ||
    !Array.isArray(executionPlan.rollbackPlan) ||
    executionPlan.rollbackPlan.length < 1
  ) {
    errors.push('Execution plan thiếu rollbackPlan.');
  }

  if (packagePolicy.executionPermission !== 'NOT_GRANTED') {
    errors.push(
      '3O-I package phải có executionPermission=NOT_GRANTED.'
    );
  }

  if (packagePolicy.finalExecutionApprovalRequired !== true) {
    errors.push(
      '3O-I package phải yêu cầu finalExecutionApprovalRequired=true.'
    );
  }

  if (pkg.prodWriteAllowed === true) {
    errors.push(
      '3O-I không được prodWriteAllowed=true.'
    );
  }

  if (pkg.changeRequestExecutedNow === true) {
    errors.push(
      '3O-I không được changeRequestExecutedNow=true.'
    );
  }

  if (pkg.prodWritePolicyOpenedNow === true) {
    errors.push(
      '3O-I không được prodWritePolicyOpenedNow=true.'
    );
  }

  if (pkg.rollbackExecutedNow === true) {
    errors.push(
      '3O-I không được rollbackExecutedNow=true.'
    );
  }

  var prodInfo =
    kidlearnV3_3oiGetProdInfo_();

  var prodCheck =
    kidlearnV3_3oiCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi validate package: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3oiCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var finishedAt = new Date();

  var validation = {
    success: errors.length === 0,
    action: 'VALIDATE_PROD_SELECTED_CHANGE_REQUEST_EXECUTION_PACKAGE_3OI_V3',
    bundle: '3O-I',
    phase: KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.PACKAGE_VALIDATED
        : KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.FAILED,
    executionPackageId: pkg.executionPackageId || '',
    selectedRequestId: selectedRequest.selectedRequestId || '',
    selectedRequestType: selectedRequest.selectedRequestType || '',
    nextBundle:
      KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    executionAllowedNow: false,
    changeRequestExecutedNow: false,
    prodWritePolicyOpenedNow: false,
    rollbackExecutedNow: false,
    validationSummary: {
      packageHasSelectedRequest:
        selectedRequest.selectedRequestId ? true : false,
      packageHasExecutionSteps:
        executionPlan.executionSteps &&
        executionPlan.executionSteps.length > 0,
      packageHasTestPlan:
        executionPlan.testPlan &&
        executionPlan.testPlan.length > 0,
      packageHasRollbackPlan:
        executionPlan.rollbackPlan &&
        executionPlan.rollbackPlan.length > 0,
      finalExecutionApprovalRequired:
        packagePolicy.finalExecutionApprovalRequired === true,
      executionPermission:
        packagePolicy.executionPermission || '',
      safeModes: safeModes.summary
    },
    validationDecision:
      errors.length === 0
        ? 'READY_FOR_FINAL_EXECUTION_APPROVAL_GATE_3O_J'
        : 'HOLD_PACKAGE_VALIDATION_FAILED',
    noSideEffect: {
      prodFileModifiedBy3OI: false,
      prodDataWrittenBy3OI: false,
      prodSheetCreatedBy3OI: false,
      prodSheetDeletedBy3OI: false,
      requestExecutedBy3OI: false,
      prodWritePolicyOpenedBy3OI: false,
      rollbackExecutedBy3OI: false
    },
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() - startedAt.getTime(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_3oiSaveValidation_(
    validation
  );

  kidlearnV3_3oiSaveResult_(
    validation,
    validation.success
      ? KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.PACKAGE_VALIDATED
      : KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.FAILED,
    KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.LAST_VALIDATION_AT
  );

  console.log(JSON.stringify(validation, null, 2));

  if (!validation.success) {
    throw new Error(
      '3O-I selected execution package validation failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return validation;
}


/**
 * Mark 3O-I ready.
 */
function kidlearnV3_markProdSelectedChangeRequestExecutionPackage3OIReadyV3() {
  var status =
    kidlearnV3_getProdSelectedChangeRequestExecutionPackage3OIStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.PACKAGE_VALIDATED &&
    status.status !== KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.READY_FOR_3O_J
  ) {
    errors.push(
      '3O-I chưa PACKAGE_VALIDATED. Status=' +
      status.status
    );
  }

  if (
    !status.lastPackage ||
    status.lastPackage.success !== true
  ) {
    errors.push(
      'Last package chưa success=true.'
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

  if (!status.executionPackageId) {
    errors.push(
      'Thiếu executionPackageId.'
    );
  }

  if (!status.selectedRequestId) {
    errors.push(
      'Thiếu selectedRequestId.'
    );
  }

  var prodInfo =
    kidlearnV3_3oiGetProdInfo_();

  var prodCheck =
    kidlearnV3_3oiCheckFileAccessible_(
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
    kidlearnV3_3oiCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3O-I ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_SELECTED_CHANGE_REQUEST_EXECUTION_PACKAGE_3OI_READY_V3',
    bundle: '3O-I',
    phase: KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.READY_FOR_3O_J,
    executionPackageId: status.executionPackageId || '',
    selectedRequestId: status.selectedRequestId || '',
    selectedRequestType: status.selectedRequestType || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    executionAllowedNow: false,
    changeRequestExecutedNow: false,
    prodWritePolicyOpenedNow: false,
    rollbackExecutedNow: false,
    message:
      '3O-I ready. Selected execution package đã được validate. Bước tiếp theo là 3O-J final execution approval gate.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3oiSaveResult_(
    result,
    KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.READY_FOR_3O_J,
    KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3O-I status.
 */
function kidlearnV3_getProdSelectedChangeRequestExecutionPackage3OIStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_SELECTED_CHANGE_REQUEST_EXECUTION_PACKAGE_3OI_STATUS_V3',
    bundle: '3O-I',
    phase: KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.NOT_RUN,
    executionPackageId:
      properties.getProperty(
        KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.EXECUTION_PACKAGE_ID
      ) ||
      '',
    selectedRequestId:
      properties.getProperty(
        KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.SELECTED_REQUEST_ID
      ) ||
      '',
    selectedRequestType:
      properties.getProperty(
        KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.SELECTED_REQUEST_TYPE
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastPackageAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.LAST_PACKAGE_AT
      ) ||
      '',
    lastValidationAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.LAST_VALIDATION_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3oiReadJsonProperty_(
        KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.LAST_RESULT_JSON
      ),
    lastPackage:
      kidlearnV3_3oiReadJsonProperty_(
        KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.LAST_PACKAGE_JSON
      ),
    lastValidation:
      kidlearnV3_3oiReadJsonProperty_(
        KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.LAST_VALIDATION_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3O-I ready.
 */
function kidlearnV3_assertProdSelectedChangeRequestExecutionPackage3OIReadyV3() {
  var status =
    kidlearnV3_getProdSelectedChangeRequestExecutionPackage3OIStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.READY_FOR_3O_J
  ) {
    errors.push(
      '3O-I chưa READY_FOR_3O_J. Status=' +
      status.status
    );
  }

  if (!status.executionPackageId) {
    errors.push(
      'Thiếu executionPackageId.'
    );
  }

  if (!status.selectedRequestId) {
    errors.push(
      'Thiếu selectedRequestId.'
    );
  }

  if (!status.selectedRequestType) {
    errors.push(
      'Thiếu selectedRequestType.'
    );
  }

  var prodInfo =
    kidlearnV3_3oiGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_SELECTED_CHANGE_REQUEST_EXECUTION_PACKAGE_3OI_READY_V3',
    bundle: '3O-I',
    phase: KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.PHASE,
    status: status.status,
    executionPackageId: status.executionPackageId || '',
    selectedRequestId: status.selectedRequestId || '',
    selectedRequestType: status.selectedRequestType || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_CONFIG.NEXT_BUNDLE,
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
      '3O-I chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3O-I.
 */
function kidlearnV3_getQaBatchSteps3OIV3() {
  return [
    {
      label: 'Assert 3O-H ready',
      functionName: 'kidlearnV3_assertProdChangeRequestExecutionDecisionGate3OHReadyV3'
    },
    {
      label: 'Preview PROD Selected CR Execution Package 3O-I',
      functionName: 'kidlearnV3_previewProdSelectedChangeRequestExecutionPackage3OIV3'
    },
    {
      label: 'Generate PROD Selected CR Execution Package 3O-I',
      functionName: 'kidlearnV3_generateProdSelectedChangeRequestExecutionPackage3OIV3'
    },
    {
      label: 'Validate PROD Selected CR Execution Package 3O-I',
      functionName: 'kidlearnV3_validateProdSelectedChangeRequestExecutionPackage3OIV3'
    },
    {
      label: 'Mark PROD Selected CR Execution Package 3O-I Ready',
      functionName: 'kidlearnV3_markProdSelectedChangeRequestExecutionPackage3OIReadyV3'
    },
    {
      label: 'Assert PROD Selected CR Execution Package 3O-I Ready',
      functionName: 'kidlearnV3_assertProdSelectedChangeRequestExecutionPackage3OIReadyV3'
    }
  ];
}


/**
 * QA batch 3O-I.
 */
function kidlearnV3_runQaBatch3OIV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3O_I_PROD_SELECTED_CHANGE_REQUEST_EXECUTION_PACKAGE',
    kidlearnV3_getQaBatchSteps3OIV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build selected request.
 */
function kidlearnV3_3oiBuildSelectedRequest_(selectedRequestId, selectedRequestType, req) {
  var riskLevel =
    selectedRequestType === 'PROD_WRITE_POLICY_REQUEST' ||
    selectedRequestType === 'NEW_RELEASE_REQUEST'
      ? 'HIGH'
      : 'MEDIUM';

  var prodWriteRequired =
    selectedRequestType === 'DATA_FIX' ||
    selectedRequestType === 'PROD_WRITE_POLICY_REQUEST';

  return {
    selectedRequestId: selectedRequestId,
    selectedRequestType: selectedRequestType,
    selectedBy:
      req.selectedBy || 'DEV_PACKAGE_MANAGER_3OI',
    packageNote:
      req.packageNote || '',
    riskLevel: riskLevel,
    prodWriteRequiredForActual: prodWriteRequired,
    selectedForPackageOnly: true,
    executeNow: false,
    approveExecutionNow: false,
    openProdWriteNow: false,
    rollbackNow: false,
    finalExecutionApprovalRequired: true,
    selectedAt:
      new Date().toISOString()
  };
}


/**
 * Build execution plan for selected request.
 */
function kidlearnV3_3oiBuildExecutionPlanForRequest_(selectedRequest) {
  var type =
    selectedRequest.selectedRequestType;

  var templates =
    {
      DATA_FIX: {
        executionMode: 'CONTROLLED_DATA_FIX_PACKAGE_ONLY',
        impactedSheets: [
          'DATA_Users',
          'DATA_Children',
          'DATA_UserChildAccess'
        ],
        executionSteps: [
          'Identify exact affected rows.',
          'Backup affected rows.',
          'Validate userId/childId references.',
          'Prepare controlled patch payload.',
          'Run final approval gate before any PROD write.'
        ],
        testPlan: [
          'Compare affected row count before/after in execution phase.',
          'Validate user-child references.',
          'Run role guard smoke.',
          'Run PROD read-only monitoring after change.'
        ],
        rollbackPlan: [
          'Use affected-row backup.',
          'Prepare revert payload.',
          'Rollback only through separate rollback gate.',
          'Run post-rollback validation.'
        ]
      },

      CONTENT_UPDATE: {
        executionMode: 'CONTENT_PATCH_OR_NEW_RELEASE_PACKAGE_ONLY',
        impactedSheets: [
          'MST_Lessons',
          'MST_LessonBlocks',
          'MST_Activities',
          'MST_Questions',
          'MST_QuestionOptions'
        ],
        executionSteps: [
          'Prepare DEV content update.',
          'Run content QA.',
          'Prepare content patch or new release package.',
          'Run final approval before deployment.'
        ],
        testPlan: [
          'Validate lesson references.',
          'Validate question/options references.',
          'Run lesson content smoke.',
          'Run runtime smoke.'
        ],
        rollbackPlan: [
          'Keep previous PROD file.',
          'Keep content patch backup.',
          'Rollback through release rollback gate only.'
        ]
      },

      UI_FIX: {
        executionMode: 'UI_FIX_RELEASE_PACKAGE_ONLY',
        impactedSheets: [],
        executionSteps: [
          'Prepare DEV UI fix.',
          'Run UI QA.',
          'Prepare release package.',
          'Run final approval before deployment.'
        ],
        testPlan: [
          'Run UI shell smoke.',
          'Run learning interaction dry-run.',
          'Run runtime smoke.',
          'Run regression QA.'
        ],
        rollbackPlan: [
          'Revert Apps Script version.',
          'Use previous release package.',
          'Run post-rollback smoke.'
        ]
      },

      PERFORMANCE_FIX: {
        executionMode: 'PERFORMANCE_FIX_RELEASE_PACKAGE_ONLY',
        impactedSheets: [],
        executionSteps: [
          'Prepare performance optimization in DEV.',
          'Run performance baseline.',
          'Run async QA.',
          'Prepare release package.'
        ],
        testPlan: [
          'Compare performance baseline.',
          'Run runtime smoke.',
          'Run async QA.',
          'Check no timeout regression.'
        ],
        rollbackPlan: [
          'Revert optimization.',
          'Restore previous code version.',
          'Run baseline again.'
        ]
      },

      PROD_WRITE_POLICY_REQUEST: {
        executionMode: 'PROD_WRITE_POLICY_PACKAGE_ONLY',
        impactedSheets: [
          'LOG_Audit',
          'DATA_StudySessions',
          'DATA_LessonProgress',
          'DATA_DailyGoals',
          'DATA_Responses'
        ],
        executionSteps: [
          'Prepare dedicated PROD write policy approval.',
          'Prepare one-row write trial plan.',
          'Prepare rollback token.',
          'Prepare post-write validation plan.',
          'Run final approval gate before enabling any write.'
        ],
        testPlan: [
          'Run write dry-run.',
          'Run one-row write trial only after approval.',
          'Validate row delta.',
          'Reset write policy immediately after trial.'
        ],
        rollbackPlan: [
          'Disable write immediately.',
          'Use rollback token.',
          'Revert affected rows only through rollback phase.',
          'Run post-rollback validation.'
        ]
      },

      NEW_RELEASE_REQUEST: {
        executionMode: 'NEW_RELEASE_PACKAGE_ONLY',
        impactedSheets: [
          'MULTIPLE'
        ],
        executionSteps: [
          'Create new DEV candidate.',
          'Backup candidate.',
          'Dry-run deployment rehearsal.',
          'Approval gate.',
          'Controlled PROD deployment.'
        ],
        testPlan: [
          'Run full schema validation.',
          'Run post-deploy validation.',
          'Run runtime smoke.',
          'Run handover package.'
        ],
        rollbackPlan: [
          'Keep previous PROD file.',
          'Document switch-back procedure.',
          'Rollback through separate phase only.'
        ]
      }
    };

  var template =
    templates[type] ||
    templates.DATA_FIX;

  return {
    executionMode: template.executionMode,
    impactedSheets: template.impactedSheets,
    executionSteps: template.executionSteps,
    testPlan: template.testPlan,
    rollbackPlan: template.rollbackPlan,
    executionAllowedNow: false,
    packageOnly: true,
    finalExecutionApprovalRequired: true,
    nextRequiredGate: '3O-J_FINAL_EXECUTION_APPROVAL_GATE'
  };
}


/**
 * PROD info từ 3N-F.
 */
function kidlearnV3_3oiGetProdInfo_() {
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
function kidlearnV3_3oiCheckFileAccessible_(fileId, label) {
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
function kidlearnV3_3oiCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3oiSafeWriteStatus_();

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
    kidlearnV3_3oiControlledWriteStatus_();

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
function kidlearnV3_3oiSafeAssert_(functionName, label) {
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
function kidlearnV3_3oiSafeCall_(functionName) {
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
        kidlearnV3_3oiSummarizeStatusOutput_(
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
function kidlearnV3_3oiSummarizeStatusOutput_(output) {
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
function kidlearnV3_3oiSafeWriteStatus_() {
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
function kidlearnV3_3oiControlledWriteStatus_() {
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
function kidlearnV3_3oiCheckFunctions_(names) {
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
 * Execution package ID.
 */
function kidlearnV3_3oiMakeExecutionPackageId_() {
  return (
    'PROD_SELECTED_EXEC_PACKAGE_3OI_' +
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
function kidlearnV3_3oiSavePackage_(packageResult) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.EXECUTION_PACKAGE_ID,
    packageResult.executionPackageId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.SELECTED_REQUEST_ID,
    packageResult.selectedRequestId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.SELECTED_REQUEST_TYPE,
    packageResult.selectedRequestType || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.LAST_PACKAGE_JSON,
    JSON.stringify(packageResult)
  );
}


/**
 * Save validation.
 */
function kidlearnV3_3oiSaveValidation_(validation) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.LAST_VALIDATION_JSON,
      JSON.stringify(validation)
    );
}


/**
 * Save result.
 */
function kidlearnV3_3oiSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.READY_FOR_3O_J &&
    (
      status === KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.PACKAGE_GENERATED ||
      status === KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.PACKAGE_VALIDATED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_STATUS.READY_FOR_3O_J;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_SELECTED_EXEC_3OI_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      executionPackageId: result.executionPackageId || '',
      selectedRequestId: result.selectedRequestId || '',
      selectedRequestType: result.selectedRequestType || '',
      prodFileId: result.prodFileId || '',
      prodFileUrl: result.prodFileUrl || '',
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
function kidlearnV3_3oiReadJsonProperty_(key) {
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
function kidlearnV3_3oiNormalizeOptions_(options) {
  if (!options) return {};

  if (typeof options !== 'object') {
    return {
      value: options
    };
  }

  return options;
}