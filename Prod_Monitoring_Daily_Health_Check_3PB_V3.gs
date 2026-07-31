/**
 * ================================================================
 * KIDLEARN V3 - PROD MONITORING DAILY HEALTH CHECK
 * Bundle: 3P-B
 * Version: 3.1.0
 * ================================================================
 *
 * 3P-B:
 * - Daily health check cho PROD ở chế độ read-only.
 * - Không ghi PROD.
 * - Không append LOG_Audit.
 * - Không mở PROD write.
 * - Không rollback.
 * - Không deploy mới.
 * - Chỉ ghi ScriptProperties trong DEV script để lưu health report/status.
 */


var KIDLEARN_V3_PROD_HEALTH_3PB_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3PB_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3PB_LAST_PREVIEW_AT',
  LAST_HEALTH_CHECK_AT: 'KIDLEARN_V3_PHASE_3PB_LAST_HEALTH_CHECK_AT',
  LAST_REPORT_AT: 'KIDLEARN_V3_PHASE_3PB_LAST_REPORT_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3PB_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3PB_LAST_RESULT_JSON',
  LAST_HEALTH_CHECK_JSON: 'KIDLEARN_V3_PHASE_3PB_LAST_HEALTH_CHECK_JSON',
  LAST_REPORT_JSON: 'KIDLEARN_V3_PHASE_3PB_LAST_REPORT_JSON',
  DAILY_HEALTH_CHECK_ID: 'KIDLEARN_V3_PHASE_3PB_DAILY_HEALTH_CHECK_ID',
  DAILY_HEALTH_REPORT_ID: 'KIDLEARN_V3_PHASE_3PB_DAILY_HEALTH_REPORT_ID'
};


var KIDLEARN_V3_PROD_HEALTH_3PB_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  HEALTH_CHECK_PASSED: 'HEALTH_CHECK_PASSED',
  HEALTH_REPORT_GENERATED: 'HEALTH_REPORT_GENERATED',
  READY_FOR_3P_C: 'READY_FOR_3P_C',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG = {
  VERSION: '3P-B',
  PHASE: '3P-B',
  NEXT_BUNDLE: '3P-C',
  NEXT_STAGE: 'PROD_MONITORING_ALERT_AND_INCIDENT_INTAKE_GATE',
  WRITE_MODE: 'PROD_DAILY_HEALTH_CHECK_READ_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  MONITORING_MODE: 'READ_ONLY_DAILY_HEALTH_CHECK',
  RECENT_AUDIT_ROWS: 10,
  CRITICAL_SHEETS: [
    'SYS_Config',
    'LOG_Audit',
    'DATA_Users',
    'DATA_Children',
    'DATA_UserChildAccess',
    'MST_Subjects',
    'MST_Lessons'
  ]
};


/**
 * Preview 3P-B.
 */
function kidlearnV3_previewProdMonitoringDailyHealthCheck3PBV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3pbCheckFunctions_([
      'kidlearnV3_assertProdReadonlyOperationalMonitoring3PAReadyV3',
      'kidlearnV3_getProdReadonlyOperationalMonitoring3PAStatusV3',
      'kidlearnV3_assertProdChangeRequestCloseOperationalLock3OMClosedV3',
      'kidlearnV3_getProdChangeRequestCloseOperationalLock3OMStatusV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3PA =
    kidlearnV3_3pbSafeAssert_(
      'kidlearnV3_assertProdReadonlyOperationalMonitoring3PAReadyV3',
      '3P-A'
    );

  if (!phase3PA.success) {
    errors.push(
      '3P-A chưa READY_FOR_3P_B: ' +
      phase3PA.message
    );
  }

  var status3PA =
    kidlearnV3_3pbSafeCall_(
      'kidlearnV3_getProdReadonlyOperationalMonitoring3PAStatusV3'
    );

  if (
    status3PA.summary.status &&
    status3PA.summary.status !== 'READY_FOR_3P_B'
  ) {
    errors.push(
      '3P-A status chưa READY_FOR_3P_B. Status=' +
      status3PA.summary.status
    );
  }

  var close3OM =
    kidlearnV3_3pbSafeAssert_(
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
    kidlearnV3_3pbGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodCheck =
    kidlearnV3_3pbCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file chưa accessible: ' +
      prodCheck.message
    );
  }

  var baselineInfo =
    kidlearnV3_3pbGet3PABaseline_();

  if (!baselineInfo.success) {
    warnings.push(
      'Không lấy được baseline 3P-A: ' +
      baselineInfo.message
    );
  }

  var safeModes =
    kidlearnV3_3pbCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_MONITORING_DAILY_HEALTH_CHECK_3PB_V3',
    bundle: '3P-B',
    phase: KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.WRITE_MODE,
    monitoringMode: KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.MONITORING_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3PA: phase3PA,
    status3PA: status3PA.summary,
    close3OM: close3OM,
    prodInfo: prodInfo,
    prodCheck: prodCheck,
    baselineInfo: baselineInfo.summary,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3P-B chỉ daily health check read-only. Không ghi PROD.'
  };

  kidlearnV3_3pbSaveResult_(
    result,
    KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Run daily health check.
 *
 * Không ghi PROD.
 */
function kidlearnV3_runProdMonitoringDailyHealthCheck3PBV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdMonitoringDailyHealthCheck3PBV3();

  if (!preview.success) {
    throw new Error(
      'Không thể run daily health check 3P-B vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var dailyHealthCheckId =
    kidlearnV3_3pbMakeDailyHealthCheckId_();

  var prodInfo =
    kidlearnV3_3pbGetProdInfo_();

  var spreadsheet =
    SpreadsheetApp.openById(
      prodInfo.prodFileId
    );

  var targetSheets =
    kidlearnV3_3pbGetTargetSheets_();

  var currentSnapshot =
    kidlearnV3_3pbSnapshotProdSheets_(
      spreadsheet,
      targetSheets
    );

  var criticalCheck =
    kidlearnV3_3pbCheckCriticalSheets_(
      currentSnapshot
    );

  errors = errors.concat(criticalCheck.errors);
  warnings = warnings.concat(criticalCheck.warnings);

  var baselineInfo =
    kidlearnV3_3pbGet3PABaseline_();

  var compare =
    kidlearnV3_3pbCompareBaselineToCurrent_(
      baselineInfo.rowSnapshot,
      currentSnapshot
    );

  warnings = warnings.concat(compare.warnings);

  var recentAudit =
    kidlearnV3_3pbReadRecentAuditRows_(
      spreadsheet,
      KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.RECENT_AUDIT_ROWS
    );

  if (!recentAudit.success) {
    warnings.push(
      'Không đọc được recent LOG_Audit rows: ' +
      recentAudit.message
    );
  }

  var safeModes =
    kidlearnV3_3pbCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var healthStatus =
    kidlearnV3_3pbClassifyHealth_(
      errors,
      warnings,
      currentSnapshot,
      compare,
      criticalCheck
    );

  var finishedAt = new Date();

  var healthCheck = {
    success: errors.length === 0,
    action: 'RUN_PROD_MONITORING_DAILY_HEALTH_CHECK_3PB_V3',
    bundle: '3P-B',
    phase: KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.HEALTH_CHECK_PASSED
        : KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.FAILED,
    dailyHealthCheckId: dailyHealthCheckId,
    monitoringBaselineId:
      baselineInfo.monitoringBaselineId || '',
    nextBundle:
      KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.NEXT_STAGE,
    monitoringMode:
      KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.MONITORING_MODE,
    healthStatus: healthStatus,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodFileName: prodInfo.prodFileName || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,

    healthSummary: {
      checkedSheetCount:
        currentSnapshot.checkedSheetCount,
      existingSheetCount:
        currentSnapshot.existingSheetCount,
      missingSheetCount:
        currentSnapshot.missingSheetCount,
      criticalMissingSheetCount:
        criticalCheck.missingCriticalSheets.length,
      changedSheetCount:
        compare.summary.changedSheetCount || 0,
      recentAuditRead:
        recentAudit.success === true,
      safeWriteMode:
        safeModes.summary.safeWriteMode,
      safeWriteEnabled:
        safeModes.summary.safeWriteEnabled,
      healthStatus: healthStatus
    },

    currentSnapshot: currentSnapshot,
    baselineCompare: compare.summary,
    criticalSheetCheck: criticalCheck,
    recentAudit: recentAudit.summary,
    safeModes: safeModes.summary,

    noSideEffectAt3PB: {
      prodFileModifiedBy3PB: false,
      prodDataWrittenBy3PB: false,
      prodSheetCreatedBy3PB: false,
      prodSheetDeletedBy3PB: false,
      auditRowAppendedBy3PB: false
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

  kidlearnV3_3pbSaveHealthCheck_(
    healthCheck
  );

  kidlearnV3_3pbSaveResult_(
    healthCheck,
    healthCheck.success
      ? KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.HEALTH_CHECK_PASSED
      : KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.FAILED,
    KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.LAST_HEALTH_CHECK_AT
  );

  console.log(JSON.stringify(healthCheck, null, 2));

  if (!healthCheck.success) {
    throw new Error(
      '3P-B daily health check failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return healthCheck;
}


/**
 * Generate daily health report.
 *
 * Không ghi PROD.
 */
function kidlearnV3_generateProdMonitoringDailyHealthReport3PBV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var status =
    kidlearnV3_getProdMonitoringDailyHealthCheck3PBStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.HEALTH_CHECK_PASSED &&
    status.status !== KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.HEALTH_REPORT_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.READY_FOR_3P_C
  ) {
    errors.push(
      '3P-B cần HEALTH_CHECK_PASSED trước khi generate report. Status=' +
      status.status
    );
  }

  if (
    !status.lastHealthCheck ||
    status.lastHealthCheck.success !== true
  ) {
    errors.push(
      'Last health check chưa success=true.'
    );
  }

  var dailyHealthReportId =
    status.dailyHealthReportId ||
    kidlearnV3_3pbMakeDailyHealthReportId_();

  var prodInfo =
    kidlearnV3_3pbGetProdInfo_();

  var prodCheck =
    kidlearnV3_3pbCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi generate health report: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3pbCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var lastHealth =
    status.lastHealthCheck || {};

  var reportPolicy =
    kidlearnV3_3pbBuildDailyHealthReportPolicy_(
      lastHealth
    );

  var finishedAt = new Date();

  var report = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_MONITORING_DAILY_HEALTH_REPORT_3PB_V3',
    bundle: '3P-B',
    phase: KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.HEALTH_REPORT_GENERATED
        : KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.FAILED,
    dailyHealthCheckId:
      status.dailyHealthCheckId || '',
    dailyHealthReportId: dailyHealthReportId,
    monitoringBaselineId:
      lastHealth.monitoringBaselineId || '',
    healthStatus:
      lastHealth.healthStatus || '',
    nextBundle:
      KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,

    reportSummary: {
      healthStatus:
        lastHealth.healthStatus || '',
      checkedSheetCount:
        lastHealth.healthSummary
          ? lastHealth.healthSummary.checkedSheetCount
          : 0,
      missingSheetCount:
        lastHealth.healthSummary
          ? lastHealth.healthSummary.missingSheetCount
          : 0,
      changedSheetCount:
        lastHealth.healthSummary
          ? lastHealth.healthSummary.changedSheetCount
          : 0,
      warningCount:
        lastHealth.warningCount || 0,
      errorCount:
        lastHealth.errorCount || 0,
      recommendation:
        kidlearnV3_3pbHealthRecommendation_(
          lastHealth.healthStatus,
          lastHealth.warningCount || 0
        )
    },

    reportPolicy: reportPolicy,

    dailyHealthDecision: {
      decision:
        lastHealth.healthStatus === 'GREEN'
          ? 'CONTINUE_READ_ONLY_OPERATIONAL_MONITORING'
          : 'CONTINUE_MONITORING_WITH_WARNINGS',
      openIncidentNow: false,
      openProdWriteNow: false,
      rollbackNow: false,
      deployNow: false
    },

    noSideEffectAt3PBReport: {
      prodFileModifiedBy3PBReport: false,
      prodDataWrittenBy3PBReport: false,
      prodSheetCreatedBy3PBReport: false,
      prodSheetDeletedBy3PBReport: false,
      auditRowAppendedBy3PBReport: false
    },

    safeModes: safeModes.summary,

    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() - startedAt.getTime(),
    errorCount: errors.length,
    warningCount:
      warnings.length + (lastHealth.warningCount || 0),
    errors: errors,
    warnings:
      warnings.concat(lastHealth.warnings || [])
  };

  kidlearnV3_3pbSaveReport_(
    report
  );

  kidlearnV3_3pbSaveResult_(
    report,
    report.success
      ? KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.HEALTH_REPORT_GENERATED
      : KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.FAILED,
    KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.LAST_REPORT_AT
  );

  console.log(JSON.stringify(report, null, 2));

  if (!report.success) {
    throw new Error(
      '3P-B daily health report failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return report;
}


/**
 * Mark 3P-B ready.
 */
function kidlearnV3_markProdMonitoringDailyHealthCheck3PBReadyV3() {
  var status =
    kidlearnV3_getProdMonitoringDailyHealthCheck3PBStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.HEALTH_REPORT_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.READY_FOR_3P_C
  ) {
    errors.push(
      '3P-B chưa HEALTH_REPORT_GENERATED. Status=' +
      status.status
    );
  }

  if (
    !status.lastHealthCheck ||
    status.lastHealthCheck.success !== true
  ) {
    errors.push(
      'Last health check chưa success=true.'
    );
  }

  if (
    !status.lastReport ||
    status.lastReport.success !== true
  ) {
    errors.push(
      'Last report chưa success=true.'
    );
  }

  if (!status.dailyHealthCheckId) {
    errors.push('Thiếu dailyHealthCheckId.');
  }

  if (!status.dailyHealthReportId) {
    errors.push('Thiếu dailyHealthReportId.');
  }

  var prodInfo =
    kidlearnV3_3pbGetProdInfo_();

  var prodCheck =
    kidlearnV3_3pbCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi mark 3P-B ready: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3pbCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3P-B ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var healthStatus =
    status.lastHealthCheck
      ? status.lastHealthCheck.healthStatus
      : '';

  var result = {
    success: true,
    action: 'MARK_PROD_MONITORING_DAILY_HEALTH_CHECK_3PB_READY_V3',
    bundle: '3P-B',
    phase: KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.READY_FOR_3P_C,
    dailyHealthCheckId: status.dailyHealthCheckId || '',
    dailyHealthReportId: status.dailyHealthReportId || '',
    healthStatus: healthStatus || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.NEXT_STAGE,
    monitoringMode:
      KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.MONITORING_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    message:
      '3P-B ready. Daily health check và report đã hoàn tất ở chế độ read-only.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3pbSaveResult_(
    result,
    KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.READY_FOR_3P_C,
    KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3P-B status.
 */
function kidlearnV3_getProdMonitoringDailyHealthCheck3PBStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_MONITORING_DAILY_HEALTH_CHECK_3PB_STATUS_V3',
    bundle: '3P-B',
    phase: KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.NOT_RUN,
    dailyHealthCheckId:
      properties.getProperty(
        KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.DAILY_HEALTH_CHECK_ID
      ) ||
      '',
    dailyHealthReportId:
      properties.getProperty(
        KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.DAILY_HEALTH_REPORT_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastHealthCheckAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.LAST_HEALTH_CHECK_AT
      ) ||
      '',
    lastReportAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.LAST_REPORT_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3pbReadJsonProperty_(
        KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.LAST_RESULT_JSON
      ),
    lastHealthCheck:
      kidlearnV3_3pbReadJsonProperty_(
        KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.LAST_HEALTH_CHECK_JSON
      ),
    lastReport:
      kidlearnV3_3pbReadJsonProperty_(
        KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.LAST_REPORT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3P-B ready.
 */
function kidlearnV3_assertProdMonitoringDailyHealthCheck3PBReadyV3() {
  var status =
    kidlearnV3_getProdMonitoringDailyHealthCheck3PBStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.READY_FOR_3P_C
  ) {
    errors.push(
      '3P-B chưa READY_FOR_3P_C. Status=' +
      status.status
    );
  }

  if (!status.dailyHealthCheckId) {
    errors.push('Thiếu dailyHealthCheckId.');
  }

  if (!status.dailyHealthReportId) {
    errors.push('Thiếu dailyHealthReportId.');
  }

  var prodInfo =
    kidlearnV3_3pbGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_MONITORING_DAILY_HEALTH_CHECK_3PB_READY_V3',
    bundle: '3P-B',
    phase: KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.PHASE,
    status: status.status,
    dailyHealthCheckId: status.dailyHealthCheckId || '',
    dailyHealthReportId: status.dailyHealthReportId || '',
    healthStatus:
      status.lastHealthCheck
        ? status.lastHealthCheck.healthStatus || ''
        : '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.NEXT_BUNDLE,
    monitoringMode:
      KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.MONITORING_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3P-B chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3P-B.
 *
 * Không ghi PROD.
 */
function kidlearnV3_getQaBatchSteps3PBV3() {
  return [
    {
      label: 'Assert 3P-A ready',
      functionName: 'kidlearnV3_assertProdReadonlyOperationalMonitoring3PAReadyV3'
    },
    {
      label: 'Preview PROD Daily Health Check 3P-B',
      functionName: 'kidlearnV3_previewProdMonitoringDailyHealthCheck3PBV3'
    },
    {
      label: 'Run PROD Daily Health Check 3P-B',
      functionName: 'kidlearnV3_runProdMonitoringDailyHealthCheck3PBV3'
    },
    {
      label: 'Generate PROD Daily Health Report 3P-B',
      functionName: 'kidlearnV3_generateProdMonitoringDailyHealthReport3PBV3'
    },
    {
      label: 'Mark PROD Daily Health Check 3P-B Ready',
      functionName: 'kidlearnV3_markProdMonitoringDailyHealthCheck3PBReadyV3'
    },
    {
      label: 'Assert PROD Daily Health Check 3P-B Ready',
      functionName: 'kidlearnV3_assertProdMonitoringDailyHealthCheck3PBReadyV3'
    }
  ];
}


/**
 * QA batch 3P-B.
 */
function kidlearnV3_runQaBatch3PBV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3P_B_PROD_MONITORING_DAILY_HEALTH_CHECK',
    kidlearnV3_getQaBatchSteps3PBV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Target sheets.
 */
function kidlearnV3_3pbGetTargetSheets_() {
  if (
    typeof KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG !== 'undefined' &&
    KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.TARGET_SHEETS
  ) {
    return KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.TARGET_SHEETS.slice();
  }

  if (
    typeof KIDLEARN_V3_SHEET_ORDER !== 'undefined' &&
    KIDLEARN_V3_SHEET_ORDER &&
    KIDLEARN_V3_SHEET_ORDER.length
  ) {
    return KIDLEARN_V3_SHEET_ORDER.slice();
  }

  return [
    'SYS_Config',
    'LOG_Audit',
    'DATA_Users',
    'DATA_Children',
    'DATA_UserChildAccess',
    'MST_Subjects',
    'MST_Lessons',
    'DATA_StudySessions',
    'DATA_LessonProgress',
    'DATA_DailyGoals'
  ];
}


/**
 * Snapshot PROD sheets.
 */
function kidlearnV3_3pbSnapshotProdSheets_(spreadsheet, sheetNames) {
  var items = [];
  var missingSheetCount = 0;
  var existingSheetCount = 0;

  for (var i = 0; i < sheetNames.length; i++) {
    var sheetName =
      sheetNames[i];

    var sheet =
      kidlearnV3_3pbGetSheet_(
        spreadsheet,
        sheetName
      );

    if (sheet) {
      existingSheetCount++;
    } else {
      missingSheetCount++;
    }

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
    checkedSheetCount:
      sheetNames.length,
    existingSheetCount:
      existingSheetCount,
    missingSheetCount:
      missingSheetCount,
    items: items
  };
}


/**
 * Compare baseline to current.
 *
 * Khác biệt chỉ là warning trong 3P-B.
 */
function kidlearnV3_3pbCompareBaselineToCurrent_(baselineSnapshot, currentSnapshot) {
  var warnings = [];

  if (!baselineSnapshot || !baselineSnapshot.items) {
    warnings.push('Không có baselineSnapshot 3P-A để compare.');
    return {
      success: true,
      warningCount: warnings.length,
      warnings: warnings,
      summary: {
        comparedSheetCount: 0,
        changedSheetCount: 0
      }
    };
  }

  var baselineMap =
    kidlearnV3_3pbMapSnapshots_(
      baselineSnapshot.items || []
    );

  var currentMap =
    kidlearnV3_3pbMapSnapshots_(
      currentSnapshot.items || []
    );

  var compared = [];
  var changedSheetCount = 0;

  for (var sheetName in baselineMap) {
    if (!baselineMap.hasOwnProperty(sheetName)) {
      continue;
    }

    var before =
      baselineMap[sheetName];

    var after =
      currentMap[sheetName] || {
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
      warnings.push(
        'Daily health baseline difference: ' +
        sheetName +
        '. rowDelta=' +
        rowDelta +
        ', columnDelta=' +
        columnDelta
      );
    }

    compared.push({
      sheetName: sheetName,
      beforeExists: before.exists,
      afterExists: after.exists,
      beforeLastRow: before.lastRow,
      afterLastRow: after.lastRow,
      rowDelta: rowDelta,
      beforeLastColumn: before.lastColumn,
      afterLastColumn: after.lastColumn,
      columnDelta: columnDelta,
      changed: changed
    });
  }

  return {
    success: true,
    warningCount: warnings.length,
    warnings: warnings,
    compared: compared,
    summary: {
      comparedSheetCount: compared.length,
      changedSheetCount: changedSheetCount
    }
  };
}


/**
 * Critical sheet check.
 */
function kidlearnV3_3pbCheckCriticalSheets_(snapshot) {
  var errors = [];
  var warnings = [];
  var missing = [];

  var map =
    kidlearnV3_3pbMapSnapshots_(
      snapshot.items || []
    );

  for (
    var i = 0;
    i < KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.CRITICAL_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.CRITICAL_SHEETS[i];

    if (
      !map[sheetName] ||
      map[sheetName].exists !== true
    ) {
      missing.push(sheetName);
    }
  }

  if (missing.length > 0) {
    errors.push(
      'Thiếu critical sheets trong PROD: ' +
      missing.join(', ')
    );
  }

  return {
    success: errors.length === 0,
    missingCriticalSheets: missing,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Read recent LOG_Audit rows.
 */
function kidlearnV3_3pbReadRecentAuditRows_(spreadsheet, limit) {
  try {
    var sheet =
      kidlearnV3_3pbGetSheet_(
        spreadsheet,
        'LOG_Audit'
      );

    if (!sheet) {
      return {
        success: false,
        message: 'Không tìm thấy LOG_Audit.',
        summary: {
          rowsRead: 0
        }
      };
    }

    var lastRow =
      sheet.getLastRow();

    var lastColumn =
      sheet.getLastColumn();

    if (lastRow < 3 || lastColumn < 1) {
      return {
        success: true,
        message: 'LOG_Audit chưa có data rows.',
        summary: {
          rowsRead: 0,
          lastRow: lastRow
        }
      };
    }

    var safeLimit =
      Math.max(1, Math.min(Number(limit || 10), 20));

    var startRow =
      Math.max(3, lastRow - safeLimit + 1);

    var numRows =
      lastRow - startRow + 1;

    var keys =
      sheet
        .getRange(2, 1, 1, lastColumn)
        .getDisplayValues()[0];

    var values =
      sheet
        .getRange(startRow, 1, numRows, lastColumn)
        .getDisplayValues();

    var rows = [];

    for (var r = 0; r < values.length; r++) {
      var item = {
        rowNumber: startRow + r,
        nonBlankCellCount: 0,
        preview: {}
      };

      var previewCount = 0;

      for (var c = 0; c < values[r].length; c++) {
        var value =
          String(values[r][c] || '');

        if (value) {
          item.nonBlankCellCount++;
        }

        if (
          value &&
          previewCount < 12
        ) {
          item.preview[
            String(keys[c] || ('COL_' + (c + 1)))
          ] = value;
          previewCount++;
        }
      }

      rows.push(item);
    }

    return {
      success: true,
      message: 'Recent LOG_Audit rows read.',
      summary: {
        lastRow: lastRow,
        lastColumn: lastColumn,
        rowsRead: rows.length,
        startRow: startRow
      },
      rows: rows
    };

  } catch (error) {
    return {
      success: false,
      message:
        String(error.message || error),
      summary: {
        rowsRead: 0
      }
    };
  }
}


/**
 * Classify health.
 */
function kidlearnV3_3pbClassifyHealth_(errors, warnings, snapshot, compare, criticalCheck) {
  if (
    errors.length > 0 ||
    criticalCheck.missingCriticalSheets.length > 0
  ) {
    return 'RED';
  }

  if (
    warnings.length > 0 ||
    snapshot.missingSheetCount > 0 ||
    compare.summary.changedSheetCount > 0
  ) {
    return 'YELLOW';
  }

  return 'GREEN';
}


/**
 * Recommendation.
 */
function kidlearnV3_3pbHealthRecommendation_(healthStatus, warningCount) {
  if (healthStatus === 'GREEN') {
    return 'Tiếp tục vận hành read-only monitoring bình thường.';
  }

  if (healthStatus === 'YELLOW') {
    return 'Có warning. Cần review health report trước khi mở incident.';
  }

  return 'Health status RED. Cần chuyển sang 3P-C incident intake gate.';
}


/**
 * Daily health report policy.
 */
function kidlearnV3_3pbBuildDailyHealthReportPolicy_(lastHealth) {
  return {
    reportName:
      'KIDLEARN V3 PROD Daily Read-only Health Report',
    monitoringMode:
      'READ_ONLY',
    healthStatus:
      lastHealth.healthStatus || '',
    allowedIn3PB: [
      'Read PROD file metadata',
      'Read sheet row/column counts',
      'Read recent LOG_Audit rows',
      'Compare with 3P-A baseline',
      'Generate DEV ScriptProperties report'
    ],
    notAllowedIn3PB: [
      'No PROD writes',
      'No audit append',
      'No selected request execution',
      'No PROD write enable',
      'No rollback',
      'No deployment'
    ],
    escalationPolicy: {
      green: 'Continue daily monitoring',
      yellow: 'Review warnings and decide whether to open incident intake in 3P-C',
      red: 'Move to incident intake gate before any action'
    },
    nextPhase:
      KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.NEXT_BUNDLE
  };
}


/**
 * Get 3P-A baseline.
 */
function kidlearnV3_3pbGet3PABaseline_() {
  try {
    var status =
      kidlearnV3_getProdReadonlyOperationalMonitoring3PAStatusV3();

    var baseline =
      status.lastBaseline || {};

    if (
      !baseline ||
      baseline.success !== true ||
      !baseline.rowSnapshot
    ) {
      return {
        success: false,
        message: '3P-A lastBaseline không hợp lệ.',
        monitoringBaselineId:
          status.monitoringBaselineId || '',
        rowSnapshot: null,
        summary: {
          status: status.status || '',
          monitoringBaselineId:
            status.monitoringBaselineId || ''
        }
      };
    }

    return {
      success: true,
      message: '3P-A baseline loaded.',
      monitoringBaselineId:
        status.monitoringBaselineId || '',
      rowSnapshot:
        baseline.rowSnapshot,
      summary: {
        status: status.status || '',
        monitoringBaselineId:
          status.monitoringBaselineId || '',
        checkedSheetCount:
          baseline.rowSnapshot.checkedSheetCount || 0,
        capturedAt:
          baseline.rowSnapshot.capturedAt || ''
      }
    };

  } catch (error) {
    return {
      success: false,
      message:
        String(error.message || error),
      monitoringBaselineId: '',
      rowSnapshot: null,
      summary: {}
    };
  }
}


/**
 * Map snapshots.
 */
function kidlearnV3_3pbMapSnapshots_(items) {
  var map = {};

  for (var i = 0; i < items.length; i++) {
    map[items[i].sheetName] = items[i];
  }

  return map;
}


/**
 * PROD info from 3N-F.
 */
function kidlearnV3_3pbGetProdInfo_() {
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
function kidlearnV3_3pbCheckFileAccessible_(fileId, label) {
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
function kidlearnV3_3pbCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3pbSafeWriteStatus_();

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
    kidlearnV3_3pbControlledWriteStatus_();

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
 * Get exact sheet.
 */
function kidlearnV3_3pbGetSheet_(spreadsheet, sheetName) {
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
function kidlearnV3_3pbSafeAssert_(functionName, label) {
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
function kidlearnV3_3pbSafeCall_(functionName) {
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
        kidlearnV3_3pbSummarizeStatusOutput_(
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
function kidlearnV3_3pbSummarizeStatusOutput_(output) {
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
    monitoringBaselineId: output.monitoringBaselineId || '',
    closeReviewId: output.closeReviewId || '',
    operationalLockId: output.operationalLockId || '',
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0
  };
}


/**
 * Safe Write status.
 */
function kidlearnV3_3pbSafeWriteStatus_() {
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
function kidlearnV3_3pbControlledWriteStatus_() {
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
function kidlearnV3_3pbCheckFunctions_(names) {
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
function kidlearnV3_3pbMakeDailyHealthCheckId_() {
  return (
    'PROD_DAILY_HEALTH_CHECK_3PB_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


function kidlearnV3_3pbMakeDailyHealthReportId_() {
  return (
    'PROD_DAILY_HEALTH_REPORT_3PB_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


/**
 * Save health check.
 */
function kidlearnV3_3pbSaveHealthCheck_(healthCheck) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.DAILY_HEALTH_CHECK_ID,
    healthCheck.dailyHealthCheckId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.LAST_HEALTH_CHECK_JSON,
    JSON.stringify(healthCheck)
  );
}


/**
 * Save report.
 */
function kidlearnV3_3pbSaveReport_(report) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.DAILY_HEALTH_REPORT_ID,
    report.dailyHealthReportId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.LAST_REPORT_JSON,
    JSON.stringify(report)
  );
}


/**
 * Save result.
 */
function kidlearnV3_3pbSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.READY_FOR_3P_C &&
    (
      status === KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.HEALTH_CHECK_PASSED ||
      status === KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.HEALTH_REPORT_GENERATED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_HEALTH_3PB_STATUS.READY_FOR_3P_C;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_HEALTH_3PB_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      dailyHealthCheckId: result.dailyHealthCheckId || '',
      dailyHealthReportId: result.dailyHealthReportId || '',
      monitoringBaselineId: result.monitoringBaselineId || '',
      healthStatus: result.healthStatus || '',
      prodFileId: result.prodFileId || '',
      prodFileUrl: result.prodFileUrl || '',
      monitoringMode:
        KIDLEARN_V3_PROD_HEALTH_3PB_CONFIG.MONITORING_MODE,
      prodWriteAllowed: false,
      realWriteAllowed: false,
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
function kidlearnV3_3pbReadJsonProperty_(key) {
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