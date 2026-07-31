/**
 * ================================================================
 * KIDLEARN V3 - PROD MONITORING INCIDENT TRIAGE AND RESPONSE PLAN
 * Bundle: 3P-D
 * Version: 3.1.0
 * ================================================================
 *
 * 3P-D:
 * - Triage and response plan sau alert/incident intake gate 3P-C.
 * - Chỉ lập kế hoạch response.
 * - Có thể record triage plan trong DEV ScriptProperties.
 * - Không ghi PROD.
 * - Không append LOG_Audit.
 * - Không mở PROD write.
 * - Không rollback.
 * - Không deploy mới.
 */


var KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3PD_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3PD_LAST_PREVIEW_AT',
  LAST_PLAN_AT: 'KIDLEARN_V3_PHASE_3PD_LAST_PLAN_AT',
  LAST_RECORD_AT: 'KIDLEARN_V3_PHASE_3PD_LAST_RECORD_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3PD_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3PD_LAST_RESULT_JSON',
  LAST_PLAN_JSON: 'KIDLEARN_V3_PHASE_3PD_LAST_PLAN_JSON',
  LAST_RECORD_JSON: 'KIDLEARN_V3_PHASE_3PD_LAST_RECORD_JSON',
  TRIAGE_PLAN_ID: 'KIDLEARN_V3_PHASE_3PD_TRIAGE_PLAN_ID',
  RESPONSE_PLAN_ID: 'KIDLEARN_V3_PHASE_3PD_RESPONSE_PLAN_ID'
};


var KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  TRIAGE_RESPONSE_PLAN_GENERATED: 'TRIAGE_RESPONSE_PLAN_GENERATED',
  TRIAGE_RESPONSE_PLAN_RECORDED: 'TRIAGE_RESPONSE_PLAN_RECORDED',
  READY_FOR_3P_E: 'READY_FOR_3P_E',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG = {
  VERSION: '3P-D',
  PHASE: '3P-D',
  NEXT_BUNDLE: '3P-E',
  NEXT_STAGE: 'PROD_MONITORING_INCIDENT_RESPONSE_APPROVAL_GATE',
  WRITE_MODE: 'INCIDENT_TRIAGE_RESPONSE_PLAN_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  MONITORING_MODE: 'READ_ONLY_TRIAGE_RESPONSE_PLAN',
  CONFIRM_TEXT: 'RECORD_PROD_MONITORING_TRIAGE_RESPONSE_PLAN_3P_D',
  DEFAULT_PLAN_DECISION: 'PROCEED_TO_3P_E_RESPONSE_APPROVAL_GATE_ONLY'
};


/**
 * Preview 3P-D.
 */
function kidlearnV3_previewProdMonitoringIncidentTriageResponsePlan3PDV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3pdCheckFunctions_([
      'kidlearnV3_assertProdMonitoringAlertIncidentIntakeGate3PCReadyV3',
      'kidlearnV3_getProdMonitoringAlertIncidentIntakeGate3PCStatusV3',
      'kidlearnV3_getProdMonitoringDailyHealthCheck3PBStatusV3',
      'kidlearnV3_assertProdChangeRequestCloseOperationalLock3OMClosedV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3PC =
    kidlearnV3_3pdSafeAssert_(
      'kidlearnV3_assertProdMonitoringAlertIncidentIntakeGate3PCReadyV3',
      '3P-C'
    );

  if (!phase3PC.success) {
    errors.push(
      '3P-C chưa READY_FOR_3P_D: ' +
      phase3PC.message
    );
  }

  var intakeInfo =
    kidlearnV3_3pdGetIntakeInfo_();

  if (intakeInfo.status !== 'READY_FOR_3P_D') {
    errors.push(
      '3P-C status chưa READY_FOR_3P_D. Status=' +
      intakeInfo.status
    );
  }

  if (!intakeInfo.incidentIntakeId) {
    errors.push('Thiếu incidentIntakeId từ 3P-C.');
  }

  if (!intakeInfo.alertReviewId) {
    errors.push('Thiếu alertReviewId từ 3P-C.');
  }

  if (!intakeInfo.intakeLevel) {
    warnings.push('Không đọc được intakeLevel từ 3P-C.');
  }

  if (!intakeInfo.healthStatus) {
    warnings.push('Không đọc được healthStatus từ 3P-C.');
  }

  var close3OM =
    kidlearnV3_3pdSafeAssert_(
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
    kidlearnV3_3pdGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodCheck =
    kidlearnV3_3pdCheckFileAccessible_(
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
    kidlearnV3_3pdCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var triageClass =
    kidlearnV3_3pdClassifyTriage_(
      intakeInfo
    );

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_MONITORING_INCIDENT_TRIAGE_RESPONSE_PLAN_3PD_V3',
    bundle: '3P-D',
    phase: KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.WRITE_MODE,
    monitoringMode: KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.MONITORING_MODE,
    confirmText:
      KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.CONFIRM_TEXT,
    planDecision:
      KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.DEFAULT_PLAN_DECISION,
    healthStatus: intakeInfo.healthStatus || '',
    intakeLevel: intakeInfo.intakeLevel || '',
    triageClass: triageClass,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    incidentExecutionAllowedNow: false,
    rollbackAllowedNow: false,
    remediationExecutedNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3PC: phase3PC,
    intakeInfo: intakeInfo,
    close3OM: close3OM,
    prodInfo: prodInfo,
    prodCheck: prodCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3P-D chỉ tạo triage/response plan. Không ghi PROD và không remediation thật.'
  };

  kidlearnV3_3pdSaveResult_(
    result,
    KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Generate incident triage and response plan.
 *
 * Không ghi PROD.
 */
function kidlearnV3_generateProdMonitoringIncidentTriageResponsePlan3PDV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdMonitoringIncidentTriageResponsePlan3PDV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate triage response plan 3P-D vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var triagePlanId =
    kidlearnV3_3pdMakeTriagePlanId_();

  var responsePlanId =
    kidlearnV3_3pdMakeResponsePlanId_();

  var prodInfo =
    kidlearnV3_3pdGetProdInfo_();

  var intakeInfo =
    kidlearnV3_3pdGetIntakeInfo_();

  var healthInfo =
    kidlearnV3_3pdGetHealthInfo_();

  var prodCheck =
    kidlearnV3_3pdCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi generate triage plan: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3pdCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var triageClass =
    kidlearnV3_3pdClassifyTriage_(
      intakeInfo
    );

  var triagePlan =
    kidlearnV3_3pdBuildTriagePlan_(
      intakeInfo,
      healthInfo,
      triageClass
    );

  var responsePlan =
    kidlearnV3_3pdBuildResponsePlan_(
      intakeInfo,
      healthInfo,
      triageClass
    );

  var finishedAt = new Date();

  var plan = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_MONITORING_INCIDENT_TRIAGE_RESPONSE_PLAN_3PD_V3',
    bundle: '3P-D',
    phase: KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.TRIAGE_RESPONSE_PLAN_GENERATED
        : KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.FAILED,
    triagePlanId: triagePlanId,
    responsePlanId: responsePlanId,
    incidentIntakeId: intakeInfo.incidentIntakeId || '',
    alertReviewId: intakeInfo.alertReviewId || '',
    dailyHealthCheckId: intakeInfo.dailyHealthCheckId || '',
    dailyHealthReportId: intakeInfo.dailyHealthReportId || '',
    healthStatus: intakeInfo.healthStatus || '',
    intakeLevel: intakeInfo.intakeLevel || '',
    triageClass: triageClass,
    nextBundle:
      KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.NEXT_STAGE,
    confirmText:
      KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.CONFIRM_TEXT,
    planDecision:
      KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.DEFAULT_PLAN_DECISION,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodFileName: prodInfo.prodFileName || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    incidentExecutionAllowedNow: false,
    rollbackAllowedNow: false,
    remediationExecutedNow: false,

    healthInfo: healthInfo,
    triagePlan: triagePlan,
    responsePlan: responsePlan,

    planChecklist: [
      {
        item: '3P-C intake gate ready',
        passed: intakeInfo.status === 'READY_FOR_3P_D'
      },
      {
        item: 'Incident intake ID exists',
        passed: intakeInfo.incidentIntakeId ? true : false
      },
      {
        item: 'Health status available',
        passed: intakeInfo.healthStatus ? true : false
      },
      {
        item: 'Triage plan generated',
        passed:
          triagePlan &&
          triagePlan.triageSteps &&
          triagePlan.triageSteps.length > 0
      },
      {
        item: 'Response plan generated',
        passed:
          responsePlan &&
          responsePlan.responseSteps &&
          responsePlan.responseSteps.length > 0
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
        item: '3P-D does not execute remediation',
        passed: true
      },
      {
        item: '3P-D does not open PROD write',
        passed: true
      }
    ],

    noSideEffectAt3PDPlan: {
      prodFileModifiedBy3PDPlan: false,
      prodDataWrittenBy3PDPlan: false,
      auditRowAppendedBy3PDPlan: false,
      incidentActionExecutedBy3PDPlan: false,
      remediationExecutedBy3PDPlan: false,
      rollbackExecutedBy3PDPlan: false,
      prodDeployExecutedBy3PDPlan: false
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

  kidlearnV3_3pdSavePlan_(
    plan
  );

  kidlearnV3_3pdSaveResult_(
    plan,
    plan.success
      ? KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.TRIAGE_RESPONSE_PLAN_GENERATED
      : KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.FAILED,
    KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.LAST_PLAN_AT
  );

  console.log(JSON.stringify(plan, null, 2));

  if (!plan.success) {
    throw new Error(
      '3P-D triage response plan failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return plan;
}


/**
 * Manual confirm wrapper.
 *
 * Không dùng Session.getActiveUser để tránh thêm OAuth scope.
 * Không ghi PROD.
 */
function kidlearnV3_recordProdMonitoringIncidentTriageResponsePlan3PDManualConfirmV3() {
  return kidlearnV3_recordProdMonitoringIncidentTriageResponsePlan3PDV3({
    confirmText:
      KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.CONFIRM_TEXT,
    planDecision:
      KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.DEFAULT_PLAN_DECISION,
    recordedBy: 'DEV_INCIDENT_TRIAGE_MANAGER_MANUAL_3PD',
    planNote:
      '3P-D triage and response plan recorded. Proceed to 3P-E approval gate only. No PROD write.'
  });
}


/**
 * Record triage response plan.
 *
 * options:
 * {
 *   confirmText: 'RECORD_PROD_MONITORING_TRIAGE_RESPONSE_PLAN_3P_D',
 *   planDecision: 'PROCEED_TO_3P_E_RESPONSE_APPROVAL_GATE_ONLY',
 *   recordedBy: '...',
 *   planNote: '...'
 * }
 */
function kidlearnV3_recordProdMonitoringIncidentTriageResponsePlan3PDV3(options) {
  var req =
    kidlearnV3_3pdNormalizeOptions_(options);

  var errors = [];
  var warnings = [];

  if (
    String(req.confirmText || '') !==
    KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.CONFIRM_TEXT
  ) {
    errors.push(
      'Confirm text không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.CONFIRM_TEXT
    );
  }

  if (
    String(req.planDecision || '') !==
    KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.DEFAULT_PLAN_DECISION
  ) {
    errors.push(
      'planDecision không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.DEFAULT_PLAN_DECISION
    );
  }

  var status =
    kidlearnV3_getProdMonitoringIncidentTriageResponsePlan3PDStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.TRIAGE_RESPONSE_PLAN_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.TRIAGE_RESPONSE_PLAN_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.READY_FOR_3P_E
  ) {
    errors.push(
      '3P-D chưa TRIAGE_RESPONSE_PLAN_GENERATED. Status=' +
      status.status
    );
  }

  if (
    !status.lastPlan ||
    status.lastPlan.success !== true
  ) {
    errors.push(
      'Last triage response plan chưa success=true.'
    );
  }

  var intakeInfo =
    kidlearnV3_3pdGetIntakeInfo_();

  if (intakeInfo.status !== 'READY_FOR_3P_D') {
    errors.push(
      '3P-C không còn READY_FOR_3P_D. Status=' +
      intakeInfo.status
    );
  }

  var prodInfo =
    kidlearnV3_3pdGetProdInfo_();

  var prodCheck =
    kidlearnV3_3pdCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi record triage plan: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3pdCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  if (errors.length > 0) {
    var failed = {
      success: false,
      action: 'RECORD_PROD_MONITORING_INCIDENT_TRIAGE_RESPONSE_PLAN_3PD_V3',
      bundle: '3P-D',
      phase: KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.PHASE,
      status: status.status,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
      incidentExecutionAllowedNow: false,
      rollbackAllowedNow: false,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors: errors,
      warnings: warnings
    };

    console.log(JSON.stringify(failed, null, 2));

    throw new Error(
      'Không thể record triage response plan 3P-D. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var triagePlanId =
    status.triagePlanId ||
    kidlearnV3_3pdMakeTriagePlanId_();

  var responsePlanId =
    status.responsePlanId ||
    kidlearnV3_3pdMakeResponsePlanId_();

  var record = {
    success: true,
    action: 'RECORD_PROD_MONITORING_INCIDENT_TRIAGE_RESPONSE_PLAN_3PD_V3',
    bundle: '3P-D',
    phase: KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.TRIAGE_RESPONSE_PLAN_RECORDED,
    triagePlanId: triagePlanId,
    responsePlanId: responsePlanId,
    incidentIntakeId: intakeInfo.incidentIntakeId || '',
    alertReviewId: intakeInfo.alertReviewId || '',
    healthStatus: intakeInfo.healthStatus || '',
    intakeLevel: intakeInfo.intakeLevel || '',
    triageClass:
      kidlearnV3_3pdClassifyTriage_(intakeInfo),
    planDecision:
      KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.DEFAULT_PLAN_DECISION,
    recordedBy:
      req.recordedBy || 'DEV_INCIDENT_TRIAGE_MANAGER_MANUAL_3PD',
    planNote:
      req.planNote || '',
    nextBundle:
      KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    incidentExecutionAllowedNow: false,
    rollbackAllowedNow: false,
    remediationExecutedNow: false,
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
    KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.TRIAGE_PLAN_ID,
    triagePlanId
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.RESPONSE_PLAN_ID,
    responsePlanId
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.LAST_RECORD_JSON,
    JSON.stringify(record)
  );

  kidlearnV3_3pdSaveResult_(
    record,
    KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.TRIAGE_RESPONSE_PLAN_RECORDED,
    KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.LAST_RECORD_AT
  );

  console.log(JSON.stringify(record, null, 2));

  return record;
}


/**
 * Mark 3P-D ready.
 */
function kidlearnV3_markProdMonitoringIncidentTriageResponsePlan3PDReadyV3() {
  var status =
    kidlearnV3_getProdMonitoringIncidentTriageResponsePlan3PDStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.TRIAGE_RESPONSE_PLAN_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.READY_FOR_3P_E
  ) {
    errors.push(
      '3P-D chưa TRIAGE_RESPONSE_PLAN_RECORDED. Status=' +
      status.status
    );
  }

  if (
    !status.lastRecord ||
    status.lastRecord.success !== true
  ) {
    errors.push(
      'Last triage response record chưa success=true.'
    );
  }

  if (!status.triagePlanId) {
    errors.push('Thiếu triagePlanId.');
  }

  if (!status.responsePlanId) {
    errors.push('Thiếu responsePlanId.');
  }

  var prodInfo =
    kidlearnV3_3pdGetProdInfo_();

  var prodCheck =
    kidlearnV3_3pdCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi mark 3P-D ready: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3pdCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3P-D ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var intakeInfo =
    kidlearnV3_3pdGetIntakeInfo_();

  var result = {
    success: true,
    action: 'MARK_PROD_MONITORING_INCIDENT_TRIAGE_RESPONSE_PLAN_3PD_READY_V3',
    bundle: '3P-D',
    phase: KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.READY_FOR_3P_E,
    triagePlanId: status.triagePlanId || '',
    responsePlanId: status.responsePlanId || '',
    incidentIntakeId: intakeInfo.incidentIntakeId || '',
    alertReviewId: intakeInfo.alertReviewId || '',
    healthStatus: intakeInfo.healthStatus || '',
    intakeLevel: intakeInfo.intakeLevel || '',
    triageClass:
      kidlearnV3_3pdClassifyTriage_(intakeInfo),
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.NEXT_STAGE,
    monitoringMode:
      KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.MONITORING_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    incidentExecutionAllowedNow: false,
    rollbackAllowedNow: false,
    remediationExecutedNow: false,
    message:
      '3P-D ready. Triage and response plan đã record. Bước tiếp theo là 3P-E response approval gate.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3pdSaveResult_(
    result,
    KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.READY_FOR_3P_E,
    KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3P-D status.
 */
function kidlearnV3_getProdMonitoringIncidentTriageResponsePlan3PDStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_MONITORING_INCIDENT_TRIAGE_RESPONSE_PLAN_3PD_STATUS_V3',
    bundle: '3P-D',
    phase: KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.NOT_RUN,
    triagePlanId:
      properties.getProperty(
        KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.TRIAGE_PLAN_ID
      ) ||
      '',
    responsePlanId:
      properties.getProperty(
        KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.RESPONSE_PLAN_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastPlanAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.LAST_PLAN_AT
      ) ||
      '',
    lastRecordAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.LAST_RECORD_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3pdReadJsonProperty_(
        KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.LAST_RESULT_JSON
      ),
    lastPlan:
      kidlearnV3_3pdReadJsonProperty_(
        KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.LAST_PLAN_JSON
      ),
    lastRecord:
      kidlearnV3_3pdReadJsonProperty_(
        KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.LAST_RECORD_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3P-D ready.
 */
function kidlearnV3_assertProdMonitoringIncidentTriageResponsePlan3PDReadyV3() {
  var status =
    kidlearnV3_getProdMonitoringIncidentTriageResponsePlan3PDStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.READY_FOR_3P_E
  ) {
    errors.push(
      '3P-D chưa READY_FOR_3P_E. Status=' +
      status.status
    );
  }

  if (!status.triagePlanId) {
    errors.push('Thiếu triagePlanId.');
  }

  if (!status.responsePlanId) {
    errors.push('Thiếu responsePlanId.');
  }

  var prodInfo =
    kidlearnV3_3pdGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_MONITORING_INCIDENT_TRIAGE_RESPONSE_PLAN_3PD_READY_V3',
    bundle: '3P-D',
    phase: KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.PHASE,
    status: status.status,
    triagePlanId: status.triagePlanId || '',
    responsePlanId: status.responsePlanId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.NEXT_BUNDLE,
    monitoringMode:
      KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.MONITORING_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    incidentExecutionAllowedNow: false,
    rollbackAllowedNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3P-D chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3P-D package-only.
 *
 * Không record triage plan trong QA batch.
 */
function kidlearnV3_getQaBatchSteps3PDV3() {
  return [
    {
      label: 'Assert 3P-C ready',
      functionName: 'kidlearnV3_assertProdMonitoringAlertIncidentIntakeGate3PCReadyV3'
    },
    {
      label: 'Preview PROD Incident Triage Response Plan 3P-D',
      functionName: 'kidlearnV3_previewProdMonitoringIncidentTriageResponsePlan3PDV3'
    },
    {
      label: 'Generate PROD Incident Triage Response Plan 3P-D',
      functionName: 'kidlearnV3_generateProdMonitoringIncidentTriageResponsePlan3PDV3'
    }
  ];
}


/**
 * QA batch 3P-D package-only.
 */
function kidlearnV3_runQaBatch3PDV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3P_D_PROD_MONITORING_INCIDENT_TRIAGE_RESPONSE_PLAN_PACKAGE_ONLY',
    kidlearnV3_getQaBatchSteps3PDV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Get intake info from 3P-C.
 */
function kidlearnV3_3pdGetIntakeInfo_() {
  try {
    var status =
      kidlearnV3_getProdMonitoringAlertIncidentIntakeGate3PCStatusV3();

    var lastIntake =
      status.lastIntake || {};

    var lastPackage =
      status.lastPackage || {};

    var lastResult =
      status.lastResult || {};

    return {
      status: status.status || '',
      incidentIntakeId:
        status.incidentIntakeId ||
        lastIntake.incidentIntakeId ||
        lastPackage.incidentIntakeId ||
        '',
      alertReviewId:
        status.alertReviewId ||
        lastIntake.alertReviewId ||
        lastPackage.alertReviewId ||
        '',
      dailyHealthCheckId:
        lastIntake.dailyHealthCheckId ||
        lastPackage.dailyHealthCheckId ||
        '',
      dailyHealthReportId:
        lastIntake.dailyHealthReportId ||
        lastPackage.dailyHealthReportId ||
        '',
      healthStatus:
        lastIntake.healthStatus ||
        lastPackage.healthStatus ||
        lastResult.healthStatus ||
        '',
      intakeLevel:
        lastIntake.intakeLevel ||
        lastPackage.intakeLevel ||
        lastResult.intakeLevel ||
        '',
      intakeDecision:
        lastIntake.intakeDecision ||
        lastPackage.intakeDecision ||
        '',
      warningCount:
        lastPackage.warningSummary
          ? lastPackage.warningSummary.warningCount || 0
          : 0,
      errorCount:
        lastPackage.errorSummary
          ? lastPackage.errorSummary.errorCount || 0
          : 0,
      warnings:
        lastPackage.warningSummary
          ? lastPackage.warningSummary.warnings || []
          : [],
      errors:
        lastPackage.errorSummary
          ? lastPackage.errorSummary.errors || []
          : []
    };

  } catch (error) {
    return {
      status: '',
      incidentIntakeId: '',
      alertReviewId: '',
      dailyHealthCheckId: '',
      dailyHealthReportId: '',
      healthStatus: '',
      intakeLevel: '',
      intakeDecision: '',
      warningCount: 0,
      errorCount: 0,
      warnings: [],
      errors: [],
      error:
        String(error.message || error)
    };
  }
}


/**
 * Get health info from 3P-B.
 */
function kidlearnV3_3pdGetHealthInfo_() {
  try {
    var status =
      kidlearnV3_getProdMonitoringDailyHealthCheck3PBStatusV3();

    var lastHealthCheck =
      status.lastHealthCheck || {};

    var lastReport =
      status.lastReport || {};

    return {
      status: status.status || '',
      dailyHealthCheckId:
        status.dailyHealthCheckId ||
        lastHealthCheck.dailyHealthCheckId ||
        '',
      dailyHealthReportId:
        status.dailyHealthReportId ||
        lastReport.dailyHealthReportId ||
        '',
      healthStatus:
        lastHealthCheck.healthStatus ||
        lastReport.healthStatus ||
        '',
      healthSummary:
        lastHealthCheck.healthSummary || {},
      reportSummary:
        lastReport.reportSummary || {},
      warningCount:
        lastHealthCheck.warningCount ||
        lastReport.warningCount ||
        0,
      errorCount:
        lastHealthCheck.errorCount ||
        lastReport.errorCount ||
        0,
      warnings:
        lastHealthCheck.warnings ||
        lastReport.warnings ||
        [],
      errors:
        lastHealthCheck.errors ||
        lastReport.errors ||
        []
    };

  } catch (error) {
    return {
      status: '',
      dailyHealthCheckId: '',
      dailyHealthReportId: '',
      healthStatus: '',
      healthSummary: {},
      reportSummary: {},
      warningCount: 0,
      errorCount: 0,
      warnings: [],
      errors: [],
      error:
        String(error.message || error)
    };
  }
}


/**
 * Classify triage.
 */
function kidlearnV3_3pdClassifyTriage_(intakeInfo) {
  var intakeLevel =
    String(intakeInfo.intakeLevel || '').toUpperCase();

  var healthStatus =
    String(intakeInfo.healthStatus || '').toUpperCase();

  if (
    intakeLevel === 'INCIDENT_REQUIRED_REVIEW' ||
    healthStatus === 'RED'
  ) {
    return 'P1_INCIDENT_TRIAGE_REQUIRED';
  }

  if (
    intakeLevel === 'ALERT_REVIEW_REQUIRED' ||
    healthStatus === 'YELLOW'
  ) {
    return 'P2_ALERT_TRIAGE_REQUIRED';
  }

  if (
    intakeLevel === 'NO_INCIDENT_MONITOR_ONLY' ||
    healthStatus === 'GREEN'
  ) {
    return 'P3_MONITOR_ONLY';
  }

  return 'P2_UNKNOWN_REVIEW_REQUIRED';
}


/**
 * Build triage plan.
 */
function kidlearnV3_3pdBuildTriagePlan_(intakeInfo, healthInfo, triageClass) {
  var commonSteps = [
    'Review 3P-B health report.',
    'Confirm PROD file accessibility.',
    'Confirm Safe Write remains DRY_RUN/enabled=false.',
    'Confirm no PROD write or rollback action is being executed.',
    'Document next approval requirements before any action.'
  ];

  var planByClass = {
    P1_INCIDENT_TRIAGE_REQUIRED: {
      severity: 'P1',
      ownerRole: 'PROD_INCIDENT_MANAGER',
      responseWindow: 'IMMEDIATE_REVIEW',
      triageSteps: commonSteps.concat([
        'Identify critical error source.',
        'Classify impact to users/children/learning data.',
        'Decide whether to create emergency read-only incident report.',
        'Prepare dedicated approval gate before any remediation.',
        'Escalate to rollback/deploy gate only if approved later.'
      ])
    },

    P2_ALERT_TRIAGE_REQUIRED: {
      severity: 'P2',
      ownerRole: 'PROD_MONITORING_MANAGER',
      responseWindow: 'SAME_DAY_REVIEW',
      triageSteps: commonSteps.concat([
        'Review warning list.',
        'Check whether warnings are expected baseline differences.',
        'Decide whether this is monitor-only or needs incident response approval.',
        'Prepare response approval gate if action is required.'
      ])
    },

    P3_MONITOR_ONLY: {
      severity: 'P3',
      ownerRole: 'PROD_MONITORING_MANAGER',
      responseWindow: 'NEXT_MONITORING_CYCLE',
      triageSteps: commonSteps.concat([
        'Keep daily monitoring active.',
        'No remediation action required.',
        'Proceed to response approval gate with monitor-only recommendation.'
      ])
    },

    P2_UNKNOWN_REVIEW_REQUIRED: {
      severity: 'P2',
      ownerRole: 'PROD_MONITORING_MANAGER',
      responseWindow: 'SAME_DAY_REVIEW',
      triageSteps: commonSteps.concat([
        'Health status unknown; manually review 3P-B output.',
        'Verify incident intake data from 3P-C.',
        'Do not execute any action until approval gate.'
      ])
    }
  };

  var selected =
    planByClass[triageClass] ||
    planByClass.P2_UNKNOWN_REVIEW_REQUIRED;

  return {
    triageClass: triageClass,
    severity: selected.severity,
    ownerRole: selected.ownerRole,
    responseWindow: selected.responseWindow,
    healthStatus: intakeInfo.healthStatus || '',
    intakeLevel: intakeInfo.intakeLevel || '',
    warningCount: healthInfo.warningCount || intakeInfo.warningCount || 0,
    errorCount: healthInfo.errorCount || intakeInfo.errorCount || 0,
    triageSteps: selected.triageSteps,
    triageDecision:
      'PLAN_ONLY_NO_PROD_ACTION',
    requiresApprovalBeforeAction: true
  };
}


/**
 * Build response plan.
 */
function kidlearnV3_3pdBuildResponsePlan_(intakeInfo, healthInfo, triageClass) {
  var responseSteps = [
    'Prepare response approval gate in 3P-E.',
    'Keep PROD read-only until approval.',
    'Do not append LOG_Audit from 3P-D.',
    'Do not change PROD data from 3P-D.',
    'Do not rollback from 3P-D.'
  ];

  if (triageClass === 'P1_INCIDENT_TRIAGE_REQUIRED') {
    responseSteps = responseSteps.concat([
      'Prepare incident response option list.',
      'Prepare emergency communication note if needed.',
      'Prepare rollback/deployment path only as a future gated option.'
    ]);
  } else if (triageClass === 'P2_ALERT_TRIAGE_REQUIRED') {
    responseSteps = responseSteps.concat([
      'Prepare warning review response.',
      'Prepare no-action monitor option.',
      'Prepare minor investigation option for approval gate.'
    ]);
  } else {
    responseSteps = responseSteps.concat([
      'Recommend continue monitoring.',
      'Prepare monitor-only approval record.'
    ]);
  }

  return {
    responseMode:
      'PLAN_ONLY',
    responseSteps: responseSteps,
    allowedNow: [
      'Generate DEV response plan',
      'Record DEV triage response plan',
      'Proceed to 3P-E approval gate'
    ],
    blockedNow: [
      'PROD_WRITE',
      'LOG_Audit_APPEND',
      'ROLLBACK',
      'DEPLOYMENT',
      'DATA_FIX',
      'CONTENT_UPDATE',
      'USER_DATA_CHANGE'
    ],
    futureGatesRequired: [
      '3P-E response approval gate before any response execution',
      'Dedicated rollback gate before rollback',
      'Dedicated PROD write gate before PROD write',
      'Dedicated deployment gate before deployment'
    ],
    recommendedNextBundle:
      KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.NEXT_BUNDLE
  };
}


/**
 * PROD info from 3N-F.
 */
function kidlearnV3_3pdGetProdInfo_() {
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
function kidlearnV3_3pdCheckFileAccessible_(fileId, label) {
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
function kidlearnV3_3pdCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3pdSafeWriteStatus_();

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
    kidlearnV3_3pdControlledWriteStatus_();

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
function kidlearnV3_3pdSafeAssert_(functionName, label) {
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
function kidlearnV3_3pdSafeCall_(functionName) {
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
        kidlearnV3_3pdSummarizeStatusOutput_(
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
function kidlearnV3_3pdSummarizeStatusOutput_(output) {
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
    incidentIntakeId: output.incidentIntakeId || '',
    alertReviewId: output.alertReviewId || '',
    dailyHealthCheckId: output.dailyHealthCheckId || '',
    dailyHealthReportId: output.dailyHealthReportId || '',
    healthStatus: output.healthStatus || '',
    intakeLevel: output.intakeLevel || '',
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0
  };
}


/**
 * Safe Write status.
 */
function kidlearnV3_3pdSafeWriteStatus_() {
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
function kidlearnV3_3pdControlledWriteStatus_() {
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
function kidlearnV3_3pdCheckFunctions_(names) {
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
function kidlearnV3_3pdMakeTriagePlanId_() {
  return (
    'PROD_INCIDENT_TRIAGE_PLAN_3PD_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


function kidlearnV3_3pdMakeResponsePlanId_() {
  return (
    'PROD_INCIDENT_RESPONSE_PLAN_3PD_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


/**
 * Save plan.
 */
function kidlearnV3_3pdSavePlan_(plan) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.TRIAGE_PLAN_ID,
    plan.triagePlanId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.RESPONSE_PLAN_ID,
    plan.responsePlanId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.LAST_PLAN_JSON,
    JSON.stringify(plan)
  );
}


/**
 * Save result.
 */
function kidlearnV3_3pdSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.READY_FOR_3P_E &&
    (
      status === KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.TRIAGE_RESPONSE_PLAN_GENERATED ||
      status === KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.TRIAGE_RESPONSE_PLAN_RECORDED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_TRIAGE_3PD_STATUS.READY_FOR_3P_E;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_TRIAGE_3PD_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      triagePlanId: result.triagePlanId || '',
      responsePlanId: result.responsePlanId || '',
      incidentIntakeId: result.incidentIntakeId || '',
      alertReviewId: result.alertReviewId || '',
      healthStatus: result.healthStatus || '',
      intakeLevel: result.intakeLevel || '',
      triageClass: result.triageClass || '',
      prodFileId: result.prodFileId || '',
      prodFileUrl: result.prodFileUrl || '',
      monitoringMode:
        KIDLEARN_V3_PROD_TRIAGE_3PD_CONFIG.MONITORING_MODE,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
      incidentExecutionAllowedNow: false,
      rollbackAllowedNow: false,
      remediationExecutedNow: false,
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
function kidlearnV3_3pdReadJsonProperty_(key) {
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
function kidlearnV3_3pdNormalizeOptions_(options) {
  if (!options) return {};

  if (typeof options !== 'object') {
    return {
      value: options
    };
  }

  return options;
}