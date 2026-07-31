/**
 * ================================================================
 * KIDLEARN V3 - PROD MONITORING ALERT AND INCIDENT INTAKE GATE
 * Bundle: 3P-C
 * Version: 3.1.0
 * ================================================================
 *
 * 3P-C:
 * - Alert and incident intake gate sau daily health check 3P-B.
 * - Chỉ review healthStatus, warning/error summary.
 * - Có thể record intake gate trong DEV ScriptProperties.
 * - Không ghi PROD.
 * - Không append LOG_Audit.
 * - Không mở PROD write.
 * - Không rollback.
 * - Không deploy mới.
 */


var KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3PC_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3PC_LAST_PREVIEW_AT',
  LAST_PACKAGE_AT: 'KIDLEARN_V3_PHASE_3PC_LAST_PACKAGE_AT',
  LAST_INTAKE_AT: 'KIDLEARN_V3_PHASE_3PC_LAST_INTAKE_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3PC_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3PC_LAST_RESULT_JSON',
  LAST_PACKAGE_JSON: 'KIDLEARN_V3_PHASE_3PC_LAST_PACKAGE_JSON',
  LAST_INTAKE_JSON: 'KIDLEARN_V3_PHASE_3PC_LAST_INTAKE_JSON',
  INCIDENT_INTAKE_ID: 'KIDLEARN_V3_PHASE_3PC_INCIDENT_INTAKE_ID',
  ALERT_REVIEW_ID: 'KIDLEARN_V3_PHASE_3PC_ALERT_REVIEW_ID'
};


var KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  INTAKE_PACKAGE_GENERATED: 'INTAKE_PACKAGE_GENERATED',
  INTAKE_GATE_RECORDED: 'INTAKE_GATE_RECORDED',
  READY_FOR_3P_D: 'READY_FOR_3P_D',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG = {
  VERSION: '3P-C',
  PHASE: '3P-C',
  NEXT_BUNDLE: '3P-D',
  NEXT_STAGE: 'PROD_MONITORING_INCIDENT_TRIAGE_AND_RESPONSE_PLAN',
  WRITE_MODE: 'ALERT_INCIDENT_INTAKE_GATE_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  MONITORING_MODE: 'READ_ONLY_ALERT_INTAKE',
  CONFIRM_TEXT: 'RECORD_PROD_MONITORING_INCIDENT_INTAKE_GATE_3P_C',
  DEFAULT_INTAKE_DECISION: 'RECORD_INTAKE_AND_PROCEED_TO_3P_D_TRIAGE_PLAN_ONLY'
};


/**
 * Preview 3P-C.
 */
function kidlearnV3_previewProdMonitoringAlertIncidentIntakeGate3PCV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3pcCheckFunctions_([
      'kidlearnV3_assertProdMonitoringDailyHealthCheck3PBReadyV3',
      'kidlearnV3_getProdMonitoringDailyHealthCheck3PBStatusV3',
      'kidlearnV3_assertProdReadonlyOperationalMonitoring3PAReadyV3',
      'kidlearnV3_assertProdChangeRequestCloseOperationalLock3OMClosedV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3PB =
    kidlearnV3_3pcSafeAssert_(
      'kidlearnV3_assertProdMonitoringDailyHealthCheck3PBReadyV3',
      '3P-B'
    );

  if (!phase3PB.success) {
    errors.push(
      '3P-B chưa READY_FOR_3P_C: ' +
      phase3PB.message
    );
  }

  var healthInfo =
    kidlearnV3_3pcGetHealthInfo_();

  if (healthInfo.status !== 'READY_FOR_3P_C') {
    errors.push(
      '3P-B status chưa READY_FOR_3P_C. Status=' +
      healthInfo.status
    );
  }

  if (!healthInfo.dailyHealthCheckId) {
    errors.push('Thiếu dailyHealthCheckId từ 3P-B.');
  }

  if (!healthInfo.dailyHealthReportId) {
    errors.push('Thiếu dailyHealthReportId từ 3P-B.');
  }

  if (!healthInfo.healthStatus) {
    warnings.push('Không đọc được healthStatus từ 3P-B.');
  }

  var close3OM =
    kidlearnV3_3pcSafeAssert_(
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
    kidlearnV3_3pcGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodCheck =
    kidlearnV3_3pcCheckFileAccessible_(
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
    kidlearnV3_3pcCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var intakeLevel =
    kidlearnV3_3pcClassifyIntakeLevel_(
      healthInfo
    );

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_MONITORING_ALERT_INCIDENT_INTAKE_GATE_3PC_V3',
    bundle: '3P-C',
    phase: KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.WRITE_MODE,
    monitoringMode: KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.MONITORING_MODE,
    confirmText:
      KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.CONFIRM_TEXT,
    intakeDecision:
      KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.DEFAULT_INTAKE_DECISION,
    healthStatus: healthInfo.healthStatus || '',
    intakeLevel: intakeLevel,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    incidentExecutionAllowedNow: false,
    rollbackAllowedNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3PB: phase3PB,
    healthInfo: healthInfo,
    close3OM: close3OM,
    prodInfo: prodInfo,
    prodCheck: prodCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3P-C chỉ record intake gate. Không ghi PROD và không xử lý incident thật.'
  };

  kidlearnV3_3pcSaveResult_(
    result,
    KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Generate alert / incident intake package.
 *
 * Không ghi PROD.
 */
function kidlearnV3_generateProdMonitoringAlertIncidentIntakePackage3PCV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdMonitoringAlertIncidentIntakeGate3PCV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate intake package 3P-C vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var incidentIntakeId =
    kidlearnV3_3pcMakeIncidentIntakeId_();

  var alertReviewId =
    kidlearnV3_3pcMakeAlertReviewId_();

  var prodInfo =
    kidlearnV3_3pcGetProdInfo_();

  var healthInfo =
    kidlearnV3_3pcGetHealthInfo_();

  var prodCheck =
    kidlearnV3_3pcCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi generate intake package: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3pcCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var intakeLevel =
    kidlearnV3_3pcClassifyIntakeLevel_(
      healthInfo
    );

  var intakePolicy =
    kidlearnV3_3pcBuildIntakePolicy_(
      healthInfo,
      intakeLevel
    );

  var finishedAt = new Date();

  var pkg = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_MONITORING_ALERT_INCIDENT_INTAKE_PACKAGE_3PC_V3',
    bundle: '3P-C',
    phase: KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.INTAKE_PACKAGE_GENERATED
        : KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.FAILED,
    incidentIntakeId: incidentIntakeId,
    alertReviewId: alertReviewId,
    dailyHealthCheckId: healthInfo.dailyHealthCheckId || '',
    dailyHealthReportId: healthInfo.dailyHealthReportId || '',
    healthStatus: healthInfo.healthStatus || '',
    intakeLevel: intakeLevel,
    nextBundle:
      KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.NEXT_STAGE,
    confirmText:
      KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.CONFIRM_TEXT,
    intakeDecision:
      KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.DEFAULT_INTAKE_DECISION,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodFileName: prodInfo.prodFileName || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    incidentExecutionAllowedNow: false,
    rollbackAllowedNow: false,

    healthSummary: healthInfo.healthSummary || {},
    reportSummary: healthInfo.reportSummary || {},
    warningSummary: {
      warningCount: healthInfo.warningCount || 0,
      warnings: healthInfo.warnings || []
    },
    errorSummary: {
      errorCount: healthInfo.errorCount || 0,
      errors: healthInfo.errors || []
    },

    intakePolicy: intakePolicy,

    intakeChecklist: [
      {
        item: '3P-B ready',
        passed: healthInfo.status === 'READY_FOR_3P_C'
      },
      {
        item: 'Daily health check exists',
        passed: healthInfo.dailyHealthCheckId ? true : false
      },
      {
        item: 'Daily health report exists',
        passed: healthInfo.dailyHealthReportId ? true : false
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
        item: '3P-C does not open PROD write',
        passed: true
      },
      {
        item: '3P-C does not execute rollback',
        passed: true
      }
    ],

    noSideEffectAt3PCPackage: {
      prodFileModifiedBy3PCPackage: false,
      prodDataWrittenBy3PCPackage: false,
      auditRowAppendedBy3PCPackage: false,
      incidentActionExecutedBy3PCPackage: false,
      rollbackExecutedBy3PCPackage: false,
      prodDeployExecutedBy3PCPackage: false
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

  kidlearnV3_3pcSavePackage_(
    pkg
  );

  kidlearnV3_3pcSaveResult_(
    pkg,
    pkg.success
      ? KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.INTAKE_PACKAGE_GENERATED
      : KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.FAILED,
    KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.LAST_PACKAGE_AT
  );

  console.log(JSON.stringify(pkg, null, 2));

  if (!pkg.success) {
    throw new Error(
      '3P-C intake package failed. Errors=' +
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
 * Không dùng Session.getActiveUser để tránh thêm OAuth scope.
 * Không ghi PROD.
 */
function kidlearnV3_recordProdMonitoringAlertIncidentIntakeGate3PCManualConfirmV3() {
  return kidlearnV3_recordProdMonitoringAlertIncidentIntakeGate3PCV3({
    confirmText:
      KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.CONFIRM_TEXT,
    intakeDecision:
      KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.DEFAULT_INTAKE_DECISION,
    recordedBy: 'DEV_MONITORING_INTAKE_MANAGER_MANUAL_3PC',
    intakeNote:
      '3P-C incident intake gate recorded. Proceed to 3P-D triage plan only. No PROD write.'
  });
}


/**
 * Record alert / incident intake gate.
 *
 * options:
 * {
 *   confirmText: 'RECORD_PROD_MONITORING_INCIDENT_INTAKE_GATE_3P_C',
 *   intakeDecision: 'RECORD_INTAKE_AND_PROCEED_TO_3P_D_TRIAGE_PLAN_ONLY',
 *   recordedBy: '...',
 *   intakeNote: '...'
 * }
 */
function kidlearnV3_recordProdMonitoringAlertIncidentIntakeGate3PCV3(options) {
  var req =
    kidlearnV3_3pcNormalizeOptions_(options);

  var errors = [];
  var warnings = [];

  if (
    String(req.confirmText || '') !==
    KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.CONFIRM_TEXT
  ) {
    errors.push(
      'Confirm text không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.CONFIRM_TEXT
    );
  }

  if (
    String(req.intakeDecision || '') !==
    KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.DEFAULT_INTAKE_DECISION
  ) {
    errors.push(
      'intakeDecision không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.DEFAULT_INTAKE_DECISION
    );
  }

  var status =
    kidlearnV3_getProdMonitoringAlertIncidentIntakeGate3PCStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.INTAKE_PACKAGE_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.INTAKE_GATE_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.READY_FOR_3P_D
  ) {
    errors.push(
      '3P-C chưa INTAKE_PACKAGE_GENERATED. Status=' +
      status.status
    );
  }

  if (
    !status.lastPackage ||
    status.lastPackage.success !== true
  ) {
    errors.push(
      'Last intake package chưa success=true.'
    );
  }

  var healthInfo =
    kidlearnV3_3pcGetHealthInfo_();

  if (healthInfo.status !== 'READY_FOR_3P_C') {
    errors.push(
      '3P-B không còn READY_FOR_3P_C. Status=' +
      healthInfo.status
    );
  }

  var prodInfo =
    kidlearnV3_3pcGetProdInfo_();

  var prodCheck =
    kidlearnV3_3pcCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi record intake gate: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3pcCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  if (errors.length > 0) {
    var failed = {
      success: false,
      action: 'RECORD_PROD_MONITORING_ALERT_INCIDENT_INTAKE_GATE_3PC_V3',
      bundle: '3P-C',
      phase: KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.PHASE,
      status: status.status,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors: errors,
      warnings: warnings
    };

    console.log(JSON.stringify(failed, null, 2));

    throw new Error(
      'Không thể record intake gate 3P-C. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var incidentIntakeId =
    status.incidentIntakeId ||
    kidlearnV3_3pcMakeIncidentIntakeId_();

  var alertReviewId =
    status.alertReviewId ||
    kidlearnV3_3pcMakeAlertReviewId_();

  var intakeLevel =
    kidlearnV3_3pcClassifyIntakeLevel_(
      healthInfo
    );

  var intake = {
    success: true,
    action: 'RECORD_PROD_MONITORING_ALERT_INCIDENT_INTAKE_GATE_3PC_V3',
    bundle: '3P-C',
    phase: KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.INTAKE_GATE_RECORDED,
    incidentIntakeId: incidentIntakeId,
    alertReviewId: alertReviewId,
    dailyHealthCheckId: healthInfo.dailyHealthCheckId || '',
    dailyHealthReportId: healthInfo.dailyHealthReportId || '',
    healthStatus: healthInfo.healthStatus || '',
    intakeLevel: intakeLevel,
    intakeDecision:
      KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.DEFAULT_INTAKE_DECISION,
    recordedBy:
      req.recordedBy || 'DEV_MONITORING_INTAKE_MANAGER_MANUAL_3PC',
    intakeNote:
      req.intakeNote || '',
    nextBundle:
      KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    incidentExecutionAllowedNow: false,
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
    KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.INCIDENT_INTAKE_ID,
    incidentIntakeId
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.ALERT_REVIEW_ID,
    alertReviewId
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.LAST_INTAKE_JSON,
    JSON.stringify(intake)
  );

  kidlearnV3_3pcSaveResult_(
    intake,
    KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.INTAKE_GATE_RECORDED,
    KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.LAST_INTAKE_AT
  );

  console.log(JSON.stringify(intake, null, 2));

  return intake;
}


/**
 * Mark 3P-C ready.
 */
function kidlearnV3_markProdMonitoringAlertIncidentIntakeGate3PCReadyV3() {
  var status =
    kidlearnV3_getProdMonitoringAlertIncidentIntakeGate3PCStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.INTAKE_GATE_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.READY_FOR_3P_D
  ) {
    errors.push(
      '3P-C chưa INTAKE_GATE_RECORDED. Status=' +
      status.status
    );
  }

  if (
    !status.lastIntake ||
    status.lastIntake.success !== true
  ) {
    errors.push(
      'Last intake gate chưa success=true.'
    );
  }

  if (!status.incidentIntakeId) {
    errors.push('Thiếu incidentIntakeId.');
  }

  if (!status.alertReviewId) {
    errors.push('Thiếu alertReviewId.');
  }

  var prodInfo =
    kidlearnV3_3pcGetProdInfo_();

  var prodCheck =
    kidlearnV3_3pcCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi mark 3P-C ready: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3pcCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3P-C ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var healthInfo =
    kidlearnV3_3pcGetHealthInfo_();

  var result = {
    success: true,
    action: 'MARK_PROD_MONITORING_ALERT_INCIDENT_INTAKE_GATE_3PC_READY_V3',
    bundle: '3P-C',
    phase: KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.READY_FOR_3P_D,
    incidentIntakeId: status.incidentIntakeId || '',
    alertReviewId: status.alertReviewId || '',
    healthStatus: healthInfo.healthStatus || '',
    intakeLevel:
      kidlearnV3_3pcClassifyIntakeLevel_(healthInfo),
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.NEXT_STAGE,
    monitoringMode:
      KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.MONITORING_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    incidentExecutionAllowedNow: false,
    rollbackAllowedNow: false,
    message:
      '3P-C ready. Alert/incident intake gate đã record. Bước tiếp theo là 3P-D triage and response plan.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3pcSaveResult_(
    result,
    KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.READY_FOR_3P_D,
    KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3P-C status.
 */
function kidlearnV3_getProdMonitoringAlertIncidentIntakeGate3PCStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_MONITORING_ALERT_INCIDENT_INTAKE_GATE_3PC_STATUS_V3',
    bundle: '3P-C',
    phase: KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.NOT_RUN,
    incidentIntakeId:
      properties.getProperty(
        KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.INCIDENT_INTAKE_ID
      ) ||
      '',
    alertReviewId:
      properties.getProperty(
        KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.ALERT_REVIEW_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastPackageAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.LAST_PACKAGE_AT
      ) ||
      '',
    lastIntakeAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.LAST_INTAKE_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3pcReadJsonProperty_(
        KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.LAST_RESULT_JSON
      ),
    lastPackage:
      kidlearnV3_3pcReadJsonProperty_(
        KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.LAST_PACKAGE_JSON
      ),
    lastIntake:
      kidlearnV3_3pcReadJsonProperty_(
        KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.LAST_INTAKE_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3P-C ready.
 */
function kidlearnV3_assertProdMonitoringAlertIncidentIntakeGate3PCReadyV3() {
  var status =
    kidlearnV3_getProdMonitoringAlertIncidentIntakeGate3PCStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.READY_FOR_3P_D
  ) {
    errors.push(
      '3P-C chưa READY_FOR_3P_D. Status=' +
      status.status
    );
  }

  if (!status.incidentIntakeId) {
    errors.push('Thiếu incidentIntakeId.');
  }

  if (!status.alertReviewId) {
    errors.push('Thiếu alertReviewId.');
  }

  var prodInfo =
    kidlearnV3_3pcGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_MONITORING_ALERT_INCIDENT_INTAKE_GATE_3PC_READY_V3',
    bundle: '3P-C',
    phase: KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.PHASE,
    status: status.status,
    incidentIntakeId: status.incidentIntakeId || '',
    alertReviewId: status.alertReviewId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.NEXT_BUNDLE,
    monitoringMode:
      KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.MONITORING_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3P-C chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3P-C package-only.
 *
 * Không record intake gate trong QA batch.
 */
function kidlearnV3_getQaBatchSteps3PCV3() {
  return [
    {
      label: 'Assert 3P-B ready',
      functionName: 'kidlearnV3_assertProdMonitoringDailyHealthCheck3PBReadyV3'
    },
    {
      label: 'Preview PROD Alert Incident Intake 3P-C',
      functionName: 'kidlearnV3_previewProdMonitoringAlertIncidentIntakeGate3PCV3'
    },
    {
      label: 'Generate PROD Alert Incident Intake Package 3P-C',
      functionName: 'kidlearnV3_generateProdMonitoringAlertIncidentIntakePackage3PCV3'
    }
  ];
}


/**
 * QA batch 3P-C package-only.
 */
function kidlearnV3_runQaBatch3PCV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3P_C_PROD_MONITORING_ALERT_INCIDENT_INTAKE_PACKAGE_ONLY',
    kidlearnV3_getQaBatchSteps3PCV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Get health info from 3P-B.
 */
function kidlearnV3_3pcGetHealthInfo_() {
  try {
    var status =
      kidlearnV3_getProdMonitoringDailyHealthCheck3PBStatusV3();

    var lastHealthCheck =
      status.lastHealthCheck || {};

    var lastReport =
      status.lastReport || {};

    var healthStatus =
      status.healthStatus ||
      lastHealthCheck.healthStatus ||
      lastReport.healthStatus ||
      '';

    return {
      status: status.status || '',
      dailyHealthCheckId:
        status.dailyHealthCheckId ||
        lastHealthCheck.dailyHealthCheckId ||
        lastReport.dailyHealthCheckId ||
        '',
      dailyHealthReportId:
        status.dailyHealthReportId ||
        lastReport.dailyHealthReportId ||
        '',
      monitoringBaselineId:
        lastHealthCheck.monitoringBaselineId ||
        lastReport.monitoringBaselineId ||
        '',
      healthStatus: healthStatus,
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
        [],
      healthCheckSuccess:
        lastHealthCheck.success === true,
      reportSuccess:
        lastReport.success === true
    };

  } catch (error) {
    return {
      status: '',
      dailyHealthCheckId: '',
      dailyHealthReportId: '',
      monitoringBaselineId: '',
      healthStatus: '',
      healthSummary: {},
      reportSummary: {},
      warningCount: 0,
      errorCount: 0,
      warnings: [],
      errors: [],
      healthCheckSuccess: false,
      reportSuccess: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Classify intake level.
 */
function kidlearnV3_3pcClassifyIntakeLevel_(healthInfo) {
  var healthStatus =
    String(healthInfo.healthStatus || '').toUpperCase();

  if (healthStatus === 'RED') {
    return 'INCIDENT_REQUIRED_REVIEW';
  }

  if (healthStatus === 'YELLOW') {
    return 'ALERT_REVIEW_REQUIRED';
  }

  if (healthStatus === 'GREEN') {
    return 'NO_INCIDENT_MONITOR_ONLY';
  }

  if (
    Number(healthInfo.errorCount || 0) > 0
  ) {
    return 'INCIDENT_REQUIRED_REVIEW';
  }

  if (
    Number(healthInfo.warningCount || 0) > 0
  ) {
    return 'ALERT_REVIEW_REQUIRED';
  }

  return 'HEALTH_STATUS_UNKNOWN_REVIEW_REQUIRED';
}


/**
 * Build intake policy.
 */
function kidlearnV3_3pcBuildIntakePolicy_(healthInfo, intakeLevel) {
  return {
    gateName:
      'KIDLEARN V3 PROD Monitoring Alert and Incident Intake Gate',
    healthStatus:
      healthInfo.healthStatus || '',
    intakeLevel:
      intakeLevel,
    intakeScope:
      'Review daily health result and decide whether to proceed to triage plan.',
    allowedIn3PC: [
      'Read 3P-B health report from DEV ScriptProperties',
      'Read PROD file accessibility',
      'Classify alert/incident intake level',
      'Record intake gate in DEV ScriptProperties',
      'Proceed to 3P-D triage plan only'
    ],
    notAllowedIn3PC: [
      'No PROD writes',
      'No LOG_Audit append',
      'No PROD write enable',
      'No rollback',
      'No deployment',
      'No direct incident remediation'
    ],
    intakeDecisionOptions: [
      {
        healthStatus: 'GREEN',
        intakeLevel: 'NO_INCIDENT_MONITOR_ONLY',
        decision:
          'Proceed to 3P-D with monitor-only triage plan.'
      },
      {
        healthStatus: 'YELLOW',
        intakeLevel: 'ALERT_REVIEW_REQUIRED',
        decision:
          'Proceed to 3P-D with alert review and response plan.'
      },
      {
        healthStatus: 'RED',
        intakeLevel: 'INCIDENT_REQUIRED_REVIEW',
        decision:
          'Proceed to 3P-D with incident triage plan before any action.'
      }
    ],
    futureActionsRequire: [
      '3P-D triage plan',
      'Dedicated approval gate before any PROD write',
      'Dedicated rollback gate before rollback',
      'Dedicated deployment gate before deploy'
    ]
  };
}


/**
 * PROD info from 3N-F.
 */
function kidlearnV3_3pcGetProdInfo_() {
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
function kidlearnV3_3pcCheckFileAccessible_(fileId, label) {
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
function kidlearnV3_3pcCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3pcSafeWriteStatus_();

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
    kidlearnV3_3pcControlledWriteStatus_();

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
function kidlearnV3_3pcSafeAssert_(functionName, label) {
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
function kidlearnV3_3pcSafeCall_(functionName) {
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
        kidlearnV3_3pcSummarizeStatusOutput_(
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
function kidlearnV3_3pcSummarizeStatusOutput_(output) {
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
    dailyHealthCheckId: output.dailyHealthCheckId || '',
    dailyHealthReportId: output.dailyHealthReportId || '',
    healthStatus: output.healthStatus || '',
    monitoringBaselineId: output.monitoringBaselineId || '',
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0
  };
}


/**
 * Safe Write status.
 */
function kidlearnV3_3pcSafeWriteStatus_() {
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
function kidlearnV3_3pcControlledWriteStatus_() {
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
function kidlearnV3_3pcCheckFunctions_(names) {
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
function kidlearnV3_3pcMakeIncidentIntakeId_() {
  return (
    'PROD_INCIDENT_INTAKE_3PC_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


function kidlearnV3_3pcMakeAlertReviewId_() {
  return (
    'PROD_ALERT_REVIEW_3PC_' +
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
function kidlearnV3_3pcSavePackage_(pkg) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.INCIDENT_INTAKE_ID,
    pkg.incidentIntakeId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.ALERT_REVIEW_ID,
    pkg.alertReviewId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.LAST_PACKAGE_JSON,
    JSON.stringify(pkg)
  );
}


/**
 * Save result.
 */
function kidlearnV3_3pcSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.READY_FOR_3P_D &&
    (
      status === KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.INTAKE_PACKAGE_GENERATED ||
      status === KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.INTAKE_GATE_RECORDED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_INCIDENT_3PC_STATUS.READY_FOR_3P_D;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_INCIDENT_3PC_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      incidentIntakeId: result.incidentIntakeId || '',
      alertReviewId: result.alertReviewId || '',
      dailyHealthCheckId: result.dailyHealthCheckId || '',
      dailyHealthReportId: result.dailyHealthReportId || '',
      healthStatus: result.healthStatus || '',
      intakeLevel: result.intakeLevel || '',
      prodFileId: result.prodFileId || '',
      prodFileUrl: result.prodFileUrl || '',
      monitoringMode:
        KIDLEARN_V3_PROD_INCIDENT_3PC_CONFIG.MONITORING_MODE,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
      incidentExecutionAllowedNow: false,
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
function kidlearnV3_3pcReadJsonProperty_(key) {
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
function kidlearnV3_3pcNormalizeOptions_(options) {
  if (!options) return {};

  if (typeof options !== 'object') {
    return {
      value: options
    };
  }

  return options;
}