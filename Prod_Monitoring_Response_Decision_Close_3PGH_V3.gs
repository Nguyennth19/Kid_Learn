/**
 * ================================================================
 * KIDLEARN V3 - PROD MONITORING RESPONSE DECISION GATE
 * + INCIDENT CYCLE CLOSE LOCK
 * Bundle: 3P-GH
 * Version: 3.1.0
 * ================================================================
 *
 * 3P-GH:
 * - Gộp 3P-G và 3P-H để đóng nhanh Phase 3P.
 * - 3P-G: response decision gate sau dry-run rehearsal.
 * - 3P-H: incident cycle close and operational lock.
 *
 * Safety:
 * - Không ghi PROD.
 * - Không append LOG_Audit.
 * - Không rollback.
 * - Không deploy.
 * - Không mở PROD write.
 * - Không remediation thật.
 * - Chỉ ghi DEV ScriptProperties để lưu decision/close/status.
 */


var KIDLEARN_V3_PROD_DECISION_3PGH_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3PGH_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3PGH_LAST_PREVIEW_AT',
  LAST_PACKAGE_AT: 'KIDLEARN_V3_PHASE_3PGH_LAST_PACKAGE_AT',
  LAST_DECISION_AT: 'KIDLEARN_V3_PHASE_3PGH_LAST_DECISION_AT',
  LAST_CLOSE_AT: 'KIDLEARN_V3_PHASE_3PGH_LAST_CLOSE_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3PGH_LAST_RESULT_JSON',
  LAST_PACKAGE_JSON: 'KIDLEARN_V3_PHASE_3PGH_LAST_PACKAGE_JSON',
  LAST_DECISION_JSON: 'KIDLEARN_V3_PHASE_3PGH_LAST_DECISION_JSON',
  LAST_CLOSE_JSON: 'KIDLEARN_V3_PHASE_3PGH_LAST_CLOSE_JSON',
  RESPONSE_DECISION_ID: 'KIDLEARN_V3_PHASE_3PGH_RESPONSE_DECISION_ID',
  INCIDENT_CYCLE_CLOSE_ID: 'KIDLEARN_V3_PHASE_3PGH_INCIDENT_CYCLE_CLOSE_ID'
};


var KIDLEARN_V3_PROD_DECISION_3PGH_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  DECISION_PACKAGE_GENERATED: 'DECISION_PACKAGE_GENERATED',
  RESPONSE_DECISION_RECORDED: 'RESPONSE_DECISION_RECORDED',
  INCIDENT_CYCLE_CLOSED_LOCKED: 'INCIDENT_CYCLE_CLOSED_LOCKED',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG = {
  VERSION: '3P-GH',
  PHASE: '3P-GH',
  NEXT_BUNDLE: 'PHASE_4A',
  NEXT_STAGE: 'PRODUCT_MVP_FOUNDATION_FOR_GRADE_2',
  WRITE_MODE: 'RESPONSE_DECISION_AND_INCIDENT_CYCLE_CLOSE_LOCK_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  INCIDENT_REMEDIATION_ALLOWED_NOW: false,
  ROLLBACK_ALLOWED_NOW: false,
  MONITORING_MODE: 'PROD_READ_ONLY_OPERATIONAL_MONITORING_ACTIVE',
  FINAL_PHASE_STATUS: 'PHASE_3P_CLOSED_LOCKED',
  CONFIRM_TEXT: 'CLOSE_PROD_MONITORING_INCIDENT_CYCLE_3P_GH',
  DECISION_RESULT: 'CLOSE_INCIDENT_CYCLE_AND_CONTINUE_READ_ONLY_MONITORING'
};


/**
 * Preview 3P-GH.
 */
function kidlearnV3_previewProdMonitoringResponseDecisionClose3PGHV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3pghCheckFunctions_([
      'kidlearnV3_assertProdMonitoringResponseApprovalDryRun3PEFReadyV3',
      'kidlearnV3_getProdMonitoringResponseApprovalDryRun3PEFStatusV3',
      'kidlearnV3_assertProdChangeRequestCloseOperationalLock3OMClosedV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3PEF =
    kidlearnV3_3pghSafeAssert_(
      'kidlearnV3_assertProdMonitoringResponseApprovalDryRun3PEFReadyV3',
      '3P-EF'
    );

  if (!phase3PEF.success) {
    errors.push(
      '3P-EF chưa READY_FOR_3P_GH: ' +
      phase3PEF.message
    );
  }

  var responseInfo =
    kidlearnV3_3pghGetResponseInfo_();

  if (responseInfo.status !== 'READY_FOR_3P_GH') {
    errors.push(
      '3P-EF status chưa READY_FOR_3P_GH. Status=' +
      responseInfo.status
    );
  }

  if (!responseInfo.responseApprovalId) {
    errors.push('Thiếu responseApprovalId từ 3P-EF.');
  }

  if (!responseInfo.responseRehearsalId) {
    errors.push('Thiếu responseRehearsalId từ 3P-EF.');
  }

  if (responseInfo.noWriteConfirmed !== true) {
    errors.push('3P-EF chưa xác nhận noWriteConfirmed=true.');
  }

  if (responseInfo.incidentRemediationExecutedNow === true) {
    errors.push('Không được remediation thật trong Phase 3P.');
  }

  if (responseInfo.rollbackExecutedNow === true) {
    errors.push('Không được rollback trong Phase 3P.');
  }

  if (responseInfo.auditRowAppendedNow === true) {
    errors.push('3P-EF không được append LOG_Audit.');
  }

  var close3OM =
    kidlearnV3_3pghSafeAssert_(
      'kidlearnV3_assertProdChangeRequestCloseOperationalLock3OMClosedV3',
      '3O-M'
    );

  if (!close3OM.success) {
    errors.push(
      '3O-M chưa CLOSED_LOCKED: ' +
      close3OM.message
    );
  }

  var prodInfo =
    kidlearnV3_3pghGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodCheck =
    kidlearnV3_3pghCheckFileAccessible_(
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
    kidlearnV3_3pghCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_MONITORING_RESPONSE_DECISION_CLOSE_3PGH_V3',
    bundle: '3P-GH',
    phase: KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.WRITE_MODE,
    monitoringMode: KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.MONITORING_MODE,
    confirmText:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.CONFIRM_TEXT,
    decisionResult:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.DECISION_RESULT,
    finalPhaseStatus:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.FINAL_PHASE_STATUS,
    healthStatus: responseInfo.healthStatus || '',
    intakeLevel: responseInfo.intakeLevel || '',
    triageClass: responseInfo.triageClass || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    incidentRemediationAllowedNow: false,
    rollbackAllowedNow: false,
    closeOnly: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3PEF: phase3PEF,
    responseInfo: responseInfo,
    close3OM: close3OM,
    prodInfo: prodInfo,
    prodCheck: prodCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3P-GH chỉ decision gate và close lock. Không ghi PROD.'
  };

  kidlearnV3_3pghSaveResult_(
    result,
    KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Generate response decision package.
 *
 * Không ghi PROD.
 */
function kidlearnV3_generateProdMonitoringResponseDecisionPackage3PGHV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdMonitoringResponseDecisionClose3PGHV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate decision package 3P-GH vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var responseDecisionId =
    kidlearnV3_3pghMakeResponseDecisionId_();

  var incidentCycleCloseId =
    kidlearnV3_3pghMakeIncidentCycleCloseId_();

  var responseInfo =
    kidlearnV3_3pghGetResponseInfo_();

  var prodInfo =
    kidlearnV3_3pghGetProdInfo_();

  var prodCheck =
    kidlearnV3_3pghCheckFileAccessible_(
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
    kidlearnV3_3pghCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var decisionPolicy =
    kidlearnV3_3pghBuildDecisionPolicy_(
      responseInfo
    );

  var closePolicy =
    kidlearnV3_3pghBuildClosePolicy_(
      responseInfo
    );

  var finishedAt = new Date();

  var pkg = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_MONITORING_RESPONSE_DECISION_PACKAGE_3PGH_V3',
    bundle: '3P-GH',
    phase: KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.DECISION_PACKAGE_GENERATED
        : KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.FAILED,
    responseDecisionId: responseDecisionId,
    incidentCycleCloseId: incidentCycleCloseId,
    responseApprovalId: responseInfo.responseApprovalId || '',
    responseRehearsalId: responseInfo.responseRehearsalId || '',
    triagePlanId: responseInfo.triagePlanId || '',
    responsePlanId: responseInfo.responsePlanId || '',
    incidentIntakeId: responseInfo.incidentIntakeId || '',
    alertReviewId: responseInfo.alertReviewId || '',
    healthStatus: responseInfo.healthStatus || '',
    intakeLevel: responseInfo.intakeLevel || '',
    triageClass: responseInfo.triageClass || '',
    confirmText:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.CONFIRM_TEXT,
    decisionResult:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.DECISION_RESULT,
    finalPhaseStatus:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.FINAL_PHASE_STATUS,
    finalMonitoringMode:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.MONITORING_MODE,
    nextBundle:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodFileName: prodInfo.prodFileName || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    incidentRemediationAllowedNow: false,
    rollbackAllowedNow: false,

    decisionPolicy: decisionPolicy,
    closePolicy: closePolicy,

    decisionChecklist: [
      {
        item: '3P-EF ready',
        passed: responseInfo.status === 'READY_FOR_3P_GH'
      },
      {
        item: 'Response approval exists',
        passed: responseInfo.responseApprovalId ? true : false
      },
      {
        item: 'Response rehearsal exists',
        passed: responseInfo.responseRehearsalId ? true : false
      },
      {
        item: 'Dry-run no-write confirmed',
        passed: responseInfo.noWriteConfirmed === true
      },
      {
        item: 'No incident remediation executed',
        passed: responseInfo.incidentRemediationExecutedNow !== true
      },
      {
        item: 'No rollback executed',
        passed: responseInfo.rollbackExecutedNow !== true
      },
      {
        item: 'No audit append in rehearsal',
        passed: responseInfo.auditRowAppendedNow !== true
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
      }
    ],

    noSideEffectAt3PGHPackage: {
      prodFileModifiedBy3PGHPackage: false,
      prodDataWrittenBy3PGHPackage: false,
      auditRowAppendedBy3PGHPackage: false,
      remediationExecutedBy3PGHPackage: false,
      rollbackExecutedBy3PGHPackage: false,
      prodDeployExecutedBy3PGHPackage: false
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

  kidlearnV3_3pghSavePackage_(
    pkg
  );

  kidlearnV3_3pghSaveResult_(
    pkg,
    pkg.success
      ? KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.DECISION_PACKAGE_GENERATED
      : KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.FAILED,
    KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.LAST_PACKAGE_AT
  );

  console.log(JSON.stringify(pkg, null, 2));

  if (!pkg.success) {
    throw new Error(
      '3P-GH decision package failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return pkg;
}


/**
 * Manual confirm wrapper.
 *
 * Không ghi PROD.
 */
function kidlearnV3_recordProdMonitoringResponseDecision3PGHManualConfirmV3() {
  return kidlearnV3_recordProdMonitoringResponseDecision3PGHV3({
    confirmText:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.CONFIRM_TEXT,
    decisionResult:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.DECISION_RESULT,
    decidedBy: 'DEV_RESPONSE_DECISION_MANAGER_MANUAL_3PGH',
    decisionNote:
      '3P-GH response decision recorded. Close incident cycle and continue PROD read-only monitoring. No PROD write.'
  });
}


/**
 * Record response decision.
 */
function kidlearnV3_recordProdMonitoringResponseDecision3PGHV3(options) {
  var req =
    kidlearnV3_3pghNormalizeOptions_(options);

  var errors = [];
  var warnings = [];

  if (
    String(req.confirmText || '') !==
    KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.CONFIRM_TEXT
  ) {
    errors.push(
      'Confirm text không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.CONFIRM_TEXT
    );
  }

  if (
    String(req.decisionResult || '') !==
    KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.DECISION_RESULT
  ) {
    errors.push(
      'decisionResult không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.DECISION_RESULT
    );
  }

  var status =
    kidlearnV3_getProdMonitoringResponseDecisionClose3PGHStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.DECISION_PACKAGE_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.RESPONSE_DECISION_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.INCIDENT_CYCLE_CLOSED_LOCKED
  ) {
    errors.push(
      '3P-GH chưa DECISION_PACKAGE_GENERATED. Status=' +
      status.status
    );
  }

  if (
    (
      status.status === KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.RESPONSE_DECISION_RECORDED ||
      status.status === KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.INCIDENT_CYCLE_CLOSED_LOCKED
    ) &&
    req.allowRepeatDecision !== true
  ) {
    errors.push(
      '3P-GH response decision đã record rồi. Không record lại. Có thể chạy close/assert tiếp.'
    );
  }

  if (
    !status.lastPackage ||
    status.lastPackage.success !== true
  ) {
    errors.push('Last decision package chưa success=true.');
  }

  var responseInfo =
    kidlearnV3_3pghGetResponseInfo_();

  if (responseInfo.status !== 'READY_FOR_3P_GH') {
    errors.push(
      '3P-EF không còn READY_FOR_3P_GH. Status=' +
      responseInfo.status
    );
  }

  var prodInfo =
    kidlearnV3_3pghGetProdInfo_();

  var prodCheck =
    kidlearnV3_3pghCheckFileAccessible_(
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
    kidlearnV3_3pghCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  if (errors.length > 0) {
    var failed = {
      success: false,
      action: 'RECORD_PROD_MONITORING_RESPONSE_DECISION_3PGH_V3',
      bundle: '3P-GH',
      phase: KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.PHASE,
      status: status.status,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors: errors,
      warnings: warnings
    };

    console.log(JSON.stringify(failed, null, 2));

    throw new Error(
      'Không thể record response decision 3P-GH. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var responseDecisionId =
    status.responseDecisionId ||
    kidlearnV3_3pghMakeResponseDecisionId_();

  var incidentCycleCloseId =
    status.incidentCycleCloseId ||
    kidlearnV3_3pghMakeIncidentCycleCloseId_();

  var decision = {
    success: true,
    action: 'RECORD_PROD_MONITORING_RESPONSE_DECISION_3PGH_V3',
    bundle: '3P-GH',
    phase: KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.RESPONSE_DECISION_RECORDED,
    responseDecisionId: responseDecisionId,
    incidentCycleCloseId: incidentCycleCloseId,
    responseApprovalId: responseInfo.responseApprovalId || '',
    responseRehearsalId: responseInfo.responseRehearsalId || '',
    triagePlanId: responseInfo.triagePlanId || '',
    responsePlanId: responseInfo.responsePlanId || '',
    incidentIntakeId: responseInfo.incidentIntakeId || '',
    alertReviewId: responseInfo.alertReviewId || '',
    healthStatus: responseInfo.healthStatus || '',
    intakeLevel: responseInfo.intakeLevel || '',
    triageClass: responseInfo.triageClass || '',
    decisionResult:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.DECISION_RESULT,
    decidedBy:
      req.decidedBy || 'DEV_RESPONSE_DECISION_MANAGER_MANUAL_3PGH',
    decisionNote:
      req.decisionNote || '',
    finalMonitoringMode:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.MONITORING_MODE,
    nextBundle:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    incidentRemediationAllowedNow: false,
    rollbackAllowedNow: false,
    prodWriteOpenedNow: false,
    safeModes: safeModes.summary,
    recordedAt:
      new Date().toISOString(),
    warningCount: warnings.length,
    warnings: warnings
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.RESPONSE_DECISION_ID,
    responseDecisionId
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.INCIDENT_CYCLE_CLOSE_ID,
    incidentCycleCloseId
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.LAST_DECISION_JSON,
    JSON.stringify(decision)
  );

  kidlearnV3_3pghSaveResult_(
    decision,
    KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.RESPONSE_DECISION_RECORDED,
    KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.LAST_DECISION_AT
  );

  console.log(JSON.stringify(decision, null, 2));
  return decision;
}


/**
 * Close incident cycle.
 *
 * Không ghi PROD.
 */
function kidlearnV3_closeProdMonitoringIncidentCycle3PGHV3() {
  var errors = [];
  var warnings = [];

  var status =
    kidlearnV3_getProdMonitoringResponseDecisionClose3PGHStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.RESPONSE_DECISION_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.INCIDENT_CYCLE_CLOSED_LOCKED
  ) {
    errors.push(
      '3P-GH chưa RESPONSE_DECISION_RECORDED. Status=' +
      status.status
    );
  }

  if (
    !status.lastDecision ||
    status.lastDecision.success !== true
  ) {
    errors.push('Last decision chưa success=true.');
  }

  if (!status.responseDecisionId) {
    errors.push('Thiếu responseDecisionId.');
  }

  if (!status.incidentCycleCloseId) {
    errors.push('Thiếu incidentCycleCloseId.');
  }

  var responseInfo =
    kidlearnV3_3pghGetResponseInfo_();

  if (responseInfo.noWriteConfirmed !== true) {
    errors.push('Dry-run rehearsal chưa noWriteConfirmed=true.');
  }

  var prodInfo =
    kidlearnV3_3pghGetProdInfo_();

  var prodCheck =
    kidlearnV3_3pghCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi close incident cycle: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3pghCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  if (errors.length > 0) {
    throw new Error(
      'Không thể close incident cycle 3P-GH. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var closeResult = {
    success: true,
    action: 'CLOSE_PROD_MONITORING_INCIDENT_CYCLE_3PGH_V3',
    bundle: '3P-GH',
    phase: KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.INCIDENT_CYCLE_CLOSED_LOCKED,
    phase3PStatus:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.FINAL_PHASE_STATUS,
    responseDecisionId: status.responseDecisionId || '',
    incidentCycleCloseId: status.incidentCycleCloseId || '',
    responseApprovalId: responseInfo.responseApprovalId || '',
    responseRehearsalId: responseInfo.responseRehearsalId || '',
    triagePlanId: responseInfo.triagePlanId || '',
    responsePlanId: responseInfo.responsePlanId || '',
    incidentIntakeId: responseInfo.incidentIntakeId || '',
    alertReviewId: responseInfo.alertReviewId || '',
    healthStatus: responseInfo.healthStatus || '',
    intakeLevel: responseInfo.intakeLevel || '',
    triageClass: responseInfo.triageClass || '',
    decisionResult:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.DECISION_RESULT,
    finalMonitoringMode:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.MONITORING_MODE,
    nextBundle:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    incidentRemediationAllowedNow: false,
    rollbackAllowedNow: false,
    prodWriteOpenedNow: false,
    message:
      '3P-GH closed. Phase 3P monitoring incident cycle is closed and PROD remains read-only operational monitoring active.',
    safeModes: safeModes.summary,
    closedAt:
      new Date().toISOString(),
    warningCount: warnings.length,
    warnings: warnings
  };

  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.LAST_CLOSE_JSON,
      JSON.stringify(closeResult)
    );

  kidlearnV3_3pghSaveResult_(
    closeResult,
    KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.INCIDENT_CYCLE_CLOSED_LOCKED,
    KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.LAST_CLOSE_AT
  );

  console.log(JSON.stringify(closeResult, null, 2));
  return closeResult;
}


/**
 * Get 3P-GH status.
 */
function kidlearnV3_getProdMonitoringResponseDecisionClose3PGHStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_MONITORING_RESPONSE_DECISION_CLOSE_3PGH_STATUS_V3',
    bundle: '3P-GH',
    phase: KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.NOT_RUN,
    responseDecisionId:
      properties.getProperty(
        KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.RESPONSE_DECISION_ID
      ) ||
      '',
    incidentCycleCloseId:
      properties.getProperty(
        KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.INCIDENT_CYCLE_CLOSE_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastPackageAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.LAST_PACKAGE_AT
      ) ||
      '',
    lastDecisionAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.LAST_DECISION_AT
      ) ||
      '',
    lastCloseAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.LAST_CLOSE_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3pghReadJsonProperty_(
        KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.LAST_RESULT_JSON
      ),
    lastPackage:
      kidlearnV3_3pghReadJsonProperty_(
        KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.LAST_PACKAGE_JSON
      ),
    lastDecision:
      kidlearnV3_3pghReadJsonProperty_(
        KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.LAST_DECISION_JSON
      ),
    lastClose:
      kidlearnV3_3pghReadJsonProperty_(
        KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.LAST_CLOSE_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert 3P-GH closed.
 */
function kidlearnV3_assertProdMonitoringResponseDecisionClose3PGHClosedV3() {
  var status =
    kidlearnV3_getProdMonitoringResponseDecisionClose3PGHStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.INCIDENT_CYCLE_CLOSED_LOCKED
  ) {
    errors.push(
      '3P-GH chưa INCIDENT_CYCLE_CLOSED_LOCKED. Status=' +
      status.status
    );
  }

  if (!status.responseDecisionId) {
    errors.push('Thiếu responseDecisionId.');
  }

  if (!status.incidentCycleCloseId) {
    errors.push('Thiếu incidentCycleCloseId.');
  }

  var prodInfo =
    kidlearnV3_3pghGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_MONITORING_RESPONSE_DECISION_CLOSE_3PGH_CLOSED_V3',
    bundle: '3P-GH',
    phase: KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.PHASE,
    status: status.status,
    phase3PStatus:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.FINAL_PHASE_STATUS,
    responseDecisionId: status.responseDecisionId || '',
    incidentCycleCloseId: status.incidentCycleCloseId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.NEXT_STAGE,
    finalMonitoringMode:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.MONITORING_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    incidentRemediationAllowedNow: false,
    rollbackAllowedNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3P-GH chưa closed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3P-GH package-only.
 *
 * Không record decision.
 * Không close cycle.
 * Không ghi PROD.
 */
function kidlearnV3_getQaBatchSteps3PGHV3() {
  return [
    {
      label: 'Assert 3P-EF ready',
      functionName: 'kidlearnV3_assertProdMonitoringResponseApprovalDryRun3PEFReadyV3'
    },
    {
      label: 'Preview PROD Response Decision Close 3P-GH',
      functionName: 'kidlearnV3_previewProdMonitoringResponseDecisionClose3PGHV3'
    },
    {
      label: 'Generate PROD Response Decision Package 3P-GH',
      functionName: 'kidlearnV3_generateProdMonitoringResponseDecisionPackage3PGHV3'
    }
  ];
}


/**
 * QA batch 3P-GH package-only.
 */
function kidlearnV3_runQaBatch3PGHV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3P_GH_PROD_MONITORING_RESPONSE_DECISION_CLOSE_PACKAGE_ONLY',
    kidlearnV3_getQaBatchSteps3PGHV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build decision policy.
 */
function kidlearnV3_3pghBuildDecisionPolicy_(responseInfo) {
  return {
    gateName:
      'KIDLEARN V3 PROD Monitoring Response Decision Gate',
    decisionScope:
      'Decide after dry-run rehearsal. This decision only closes the incident cycle and continues read-only monitoring.',
    healthStatus: responseInfo.healthStatus || '',
    intakeLevel: responseInfo.intakeLevel || '',
    triageClass: responseInfo.triageClass || '',
    decisionResult:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.DECISION_RESULT,
    allowedByThisDecision: [
      'Close current monitoring incident cycle',
      'Continue PROD read-only operational monitoring',
      'Proceed to Phase 4A product MVP foundation',
      'Keep future changes behind new approval gates'
    ],
    notAllowedByThisDecision: [
      'No PROD write',
      'No LOG_Audit append',
      'No rollback',
      'No deployment',
      'No incident remediation execution',
      'No direct data/content change'
    ],
    futureActionPolicy: {
      futureIncidentRequiresNewIntake: true,
      prodWriteRequiresDedicatedGate: true,
      rollbackRequiresDedicatedGate: true,
      deploymentRequiresDedicatedGate: true,
      aiContentRequiresPhase5Approval: true
    }
  };
}


/**
 * Build close policy.
 */
function kidlearnV3_3pghBuildClosePolicy_(responseInfo) {
  return {
    closeName:
      'KIDLEARN V3 PROD Monitoring Incident Cycle Close Lock',
    finalPhaseStatus:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.FINAL_PHASE_STATUS,
    finalMonitoringMode:
      KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.MONITORING_MODE,
    responseApprovalId: responseInfo.responseApprovalId || '',
    responseRehearsalId: responseInfo.responseRehearsalId || '',
    closeMeaning:
      'The current alert/incident cycle is closed. PROD remains operational and read-only monitored.',
    lockedItems: [
      'No open response action from 3P cycle',
      'No open rollback action',
      'No open deployment action',
      'No open PROD write action',
      'No remediation executed in this cycle'
    ],
    transitionToNextPhase: {
      nextBundle:
        KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.NEXT_STAGE,
      meaning:
        'Move from infrastructure/safety framework to product MVP for Grade 2 learning experience.'
    }
  };
}


/**
 * Get response info from 3P-EF.
 */
function kidlearnV3_3pghGetResponseInfo_() {
  try {
    var status =
      kidlearnV3_getProdMonitoringResponseApprovalDryRun3PEFStatusV3();

    var lastPackage =
      status.lastPackage || {};

    var lastApproval =
      status.lastApproval || {};

    var lastRehearsal =
      status.lastRehearsal || {};

    var rehearsalSummary =
      lastRehearsal.rehearsalSummary || {};

    return {
      status: status.status || '',
      responseApprovalId:
        status.responseApprovalId ||
        lastApproval.responseApprovalId ||
        lastPackage.responseApprovalId ||
        '',
      responseRehearsalId:
        status.responseRehearsalId ||
        lastRehearsal.responseRehearsalId ||
        lastApproval.responseRehearsalId ||
        lastPackage.responseRehearsalId ||
        '',
      triagePlanId:
        lastRehearsal.triagePlanId ||
        lastApproval.triagePlanId ||
        lastPackage.triagePlanId ||
        '',
      responsePlanId:
        lastRehearsal.responsePlanId ||
        lastApproval.responsePlanId ||
        lastPackage.responsePlanId ||
        '',
      incidentIntakeId:
        lastRehearsal.incidentIntakeId ||
        lastApproval.incidentIntakeId ||
        lastPackage.incidentIntakeId ||
        '',
      alertReviewId:
        lastRehearsal.alertReviewId ||
        lastApproval.alertReviewId ||
        lastPackage.alertReviewId ||
        '',
      healthStatus:
        lastRehearsal.healthStatus ||
        lastApproval.healthStatus ||
        lastPackage.healthStatus ||
        '',
      intakeLevel:
        lastRehearsal.intakeLevel ||
        lastApproval.intakeLevel ||
        lastPackage.intakeLevel ||
        '',
      triageClass:
        lastRehearsal.triageClass ||
        lastApproval.triageClass ||
        lastPackage.triageClass ||
        '',
      noWriteConfirmed:
        rehearsalSummary.noWriteConfirmed === true,
      changedSheetCount:
        rehearsalSummary.changedSheetCount || 0,
      incidentRemediationExecutedNow:
        lastRehearsal.incidentRemediationExecutedNow === true,
      rollbackExecutedNow:
        lastRehearsal.rollbackExecutedNow === true,
      auditRowAppendedNow:
        lastRehearsal.auditRowAppendedNow === true,
      approvalSuccess:
        lastApproval.success === true,
      rehearsalSuccess:
        lastRehearsal.success === true
    };

  } catch (error) {
    return {
      status: '',
      responseApprovalId: '',
      responseRehearsalId: '',
      triagePlanId: '',
      responsePlanId: '',
      incidentIntakeId: '',
      alertReviewId: '',
      healthStatus: '',
      intakeLevel: '',
      triageClass: '',
      noWriteConfirmed: false,
      changedSheetCount: 0,
      incidentRemediationExecutedNow: false,
      rollbackExecutedNow: false,
      auditRowAppendedNow: false,
      approvalSuccess: false,
      rehearsalSuccess: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * PROD info from 3N-F.
 */
function kidlearnV3_3pghGetProdInfo_() {
  var status =
    kidlearnV3_getControlledProdDeployment3NFStatusV3();

  var lastDeployment =
    status.lastDeployment ||
    status.lastExecution ||
    status.lastResult ||
    {};

  return {
    status: status.status || '',
    deploymentId:
      status.deploymentId ||
      lastDeployment.deploymentId ||
      '',
    prodFileId:
      status.prodFileId ||
      status.prodId ||
      status.fileId ||
      lastDeployment.prodFileId ||
      lastDeployment.prodId ||
      lastDeployment.fileId ||
      '',
    prodFileUrl:
      status.prodFileUrl ||
      status.prodUrl ||
      status.fileUrl ||
      lastDeployment.prodFileUrl ||
      lastDeployment.prodUrl ||
      lastDeployment.fileUrl ||
      '',
    prodFileName:
      status.prodFileName ||
      status.fileName ||
      lastDeployment.prodFileName ||
      lastDeployment.fileName ||
      ''
  };
}


/**
 * Check file accessible.
 */
function kidlearnV3_3pghCheckFileAccessible_(fileId, label) {
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
function kidlearnV3_3pghCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3pghSafeWriteStatus_();

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
    kidlearnV3_3pghControlledWriteStatus_();

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    errors.push(
      'Controlled Write DEV đang ENABLED.'
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
function kidlearnV3_3pghSafeAssert_(functionName, label) {
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
 * Safe Write status.
 */
function kidlearnV3_3pghSafeWriteStatus_() {
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
function kidlearnV3_3pghControlledWriteStatus_() {
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
function kidlearnV3_3pghCheckFunctions_(names) {
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
function kidlearnV3_3pghMakeResponseDecisionId_() {
  return (
    'PROD_RESPONSE_DECISION_3PGH_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


function kidlearnV3_3pghMakeIncidentCycleCloseId_() {
  return (
    'PROD_INCIDENT_CYCLE_CLOSE_3PGH_' +
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
function kidlearnV3_3pghSavePackage_(pkg) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.RESPONSE_DECISION_ID,
    pkg.responseDecisionId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.INCIDENT_CYCLE_CLOSE_ID,
    pkg.incidentCycleCloseId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.LAST_PACKAGE_JSON,
    JSON.stringify(pkg)
  );
}


/**
 * Save result.
 */
function kidlearnV3_3pghSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.INCIDENT_CYCLE_CLOSED_LOCKED &&
    (
      status === KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.DECISION_PACKAGE_GENERATED ||
      status === KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.RESPONSE_DECISION_RECORDED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_DECISION_3PGH_STATUS.INCIDENT_CYCLE_CLOSED_LOCKED;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_DECISION_3PGH_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      phase3PStatus:
        result.phase3PStatus ||
        KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.FINAL_PHASE_STATUS,
      responseDecisionId: result.responseDecisionId || '',
      incidentCycleCloseId: result.incidentCycleCloseId || '',
      responseApprovalId: result.responseApprovalId || '',
      responseRehearsalId: result.responseRehearsalId || '',
      triagePlanId: result.triagePlanId || '',
      responsePlanId: result.responsePlanId || '',
      incidentIntakeId: result.incidentIntakeId || '',
      alertReviewId: result.alertReviewId || '',
      healthStatus: result.healthStatus || '',
      intakeLevel: result.intakeLevel || '',
      triageClass: result.triageClass || '',
      prodFileId: result.prodFileId || '',
      prodFileUrl: result.prodFileUrl || '',
      finalMonitoringMode:
        result.finalMonitoringMode ||
        KIDLEARN_V3_PROD_DECISION_3PGH_CONFIG.MONITORING_MODE,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
      incidentRemediationAllowedNow: false,
      rollbackAllowedNow: false,
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
function kidlearnV3_3pghReadJsonProperty_(key) {
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
function kidlearnV3_3pghNormalizeOptions_(options) {
  if (!options) return {};

  if (typeof options !== 'object') {
    return {
      value: options
    };
  }

  return options;
}