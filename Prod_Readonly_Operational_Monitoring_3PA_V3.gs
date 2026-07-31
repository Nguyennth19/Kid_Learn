/**
 * ================================================================
 * KIDLEARN V3 - PROD READ-ONLY OPERATIONAL MONITORING BASELINE
 * Bundle: 3P-A
 * Version: 3.1.0
 * ================================================================
 *
 * 3P-A:
 * - Bắt đầu operational monitoring sau 3O-M CLOSED_LOCKED.
 * - Chỉ đọc PROD file.
 * - Không ghi PROD.
 * - Không mở PROD write.
 * - Không rollback.
 * - Không deploy mới.
 * - Chỉ ghi ScriptProperties trong DEV script để lưu baseline/status.
 */


var KIDLEARN_V3_PROD_MONITOR_3PA_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3PA_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3PA_LAST_PREVIEW_AT',
  LAST_BASELINE_AT: 'KIDLEARN_V3_PHASE_3PA_LAST_BASELINE_AT',
  LAST_SMOKE_AT: 'KIDLEARN_V3_PHASE_3PA_LAST_SMOKE_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3PA_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3PA_LAST_RESULT_JSON',
  LAST_BASELINE_JSON: 'KIDLEARN_V3_PHASE_3PA_LAST_BASELINE_JSON',
  LAST_SMOKE_JSON: 'KIDLEARN_V3_PHASE_3PA_LAST_SMOKE_JSON',
  MONITORING_BASELINE_ID: 'KIDLEARN_V3_PHASE_3PA_MONITORING_BASELINE_ID'
};


var KIDLEARN_V3_PROD_MONITOR_3PA_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  BASELINE_CAPTURED: 'BASELINE_CAPTURED',
  MONITORING_SMOKE_PASSED: 'MONITORING_SMOKE_PASSED',
  READY_FOR_3P_B: 'READY_FOR_3P_B',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG = {
  VERSION: '3P-A',
  PHASE: '3P-A',
  NEXT_BUNDLE: '3P-B',
  NEXT_STAGE: 'PROD_MONITORING_DAILY_HEALTH_CHECK',
  WRITE_MODE: 'PROD_READ_ONLY_MONITORING_BASELINE',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  MONITORING_MODE: 'READ_ONLY',
  TARGET_SHEETS: [
    'SYS_Config',
    'SYS_Categories',
    'SYS_SchemaVersion',
    'LOG_Audit',
    'LOG_Errors',
    'DATA_Users',
    'DATA_Children',
    'DATA_UserChildAccess',
    'DATA_Sessions',
    'MST_Subjects',
    'MST_Curriculums',
    'MST_Books',
    'MST_Topics',
    'MST_Lessons',
    'MST_LessonBlocks',
    'MST_Activities',
    'MST_Skills',
    'MST_LessonSkills',
    'MST_MediaAssets',
    'MST_Questions',
    'MST_QuestionOptions',
    'MST_Assessments',
    'MST_AssessmentQuestions',
    'DATA_Attempts',
    'DATA_Responses',
    'DATA_LessonProgress',
    'DATA_SkillProgress',
    'DATA_StudySessions',
    'DATA_Assignments',
    'DATA_DailyGoals',
    'DATA_ReviewQueue',
    'MST_Achievements',
    'DATA_ChildAchievements',
    'DATA_RewardTransactions',
    'DATA_Streaks',
    'MST_LibraryItems',
    'DATA_LibraryProgress',
    'DATA_Notifications',
    'STG_ContentImports',
    'STG_Questions',
    'STG_ApprovalQueue',
    'DATA_AIJobs',
    'LOG_AI'
  ]
};


/**
 * Preview 3P-A.
 */
function kidlearnV3_previewProdReadonlyOperationalMonitoring3PAV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3paCheckFunctions_([
      'kidlearnV3_assertProdChangeRequestCloseOperationalLock3OMClosedV3',
      'kidlearnV3_getProdChangeRequestCloseOperationalLock3OMStatusV3',
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var close3OM =
    kidlearnV3_3paSafeAssert_(
      'kidlearnV3_assertProdChangeRequestCloseOperationalLock3OMClosedV3',
      '3O-M'
    );

  if (!close3OM.success) {
    errors.push(
      '3O-M chưa CLOSED_LOCKED: ' +
      close3OM.message
    );
  }

  var closeStatus =
    kidlearnV3_3paSafeCall_(
      'kidlearnV3_getProdChangeRequestCloseOperationalLock3OMStatusV3'
    );

  if (
    closeStatus.summary.status &&
    closeStatus.summary.status !== 'CLOSED_LOCKED'
  ) {
    errors.push(
      '3O-M status chưa CLOSED_LOCKED. Status=' +
      closeStatus.summary.status
    );
  }

  var finalLock =
    kidlearnV3_3paSafeCall_(
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
    kidlearnV3_3paGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodCheck =
    kidlearnV3_3paCheckFileAccessible_(
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
    kidlearnV3_3paCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_READONLY_OPERATIONAL_MONITORING_3PA_V3',
    bundle: '3P-A',
    phase: KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.WRITE_MODE,
    monitoringMode: KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.MONITORING_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    changeRequestExecutedNow: false,
    rollbackExecutedNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    close3OM: close3OM,
    closeStatus: closeStatus.summary,
    finalLock: finalLock.summary,
    prodInfo: prodInfo,
    prodCheck: prodCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3P-A chỉ tạo read-only monitoring baseline. Không ghi PROD.'
  };

  kidlearnV3_3paSaveResult_(
    result,
    KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_MONITOR_3PA_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Capture PROD read-only monitoring baseline.
 *
 * Không ghi PROD.
 */
function kidlearnV3_captureProdReadonlyMonitoringBaseline3PAV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdReadonlyOperationalMonitoring3PAV3();

  if (!preview.success) {
    throw new Error(
      'Không thể capture monitoring baseline 3P-A vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var monitoringBaselineId =
    kidlearnV3_3paMakeMonitoringBaselineId_();

  var prodInfo =
    kidlearnV3_3paGetProdInfo_();

  var spreadsheet =
    SpreadsheetApp.openById(
      prodInfo.prodFileId
    );

  var snapshot =
    kidlearnV3_3paSnapshotProdSheets_(
      spreadsheet,
      KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.TARGET_SHEETS
    );

  if (snapshot.missingSheetCount > 0) {
    warnings.push(
      'Một số target sheets không tồn tại trong PROD baseline: ' +
      snapshot.missingSheetCount
    );
  }

  var safeModes =
    kidlearnV3_3paCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var finishedAt = new Date();

  var baseline = {
    success: errors.length === 0,
    action: 'CAPTURE_PROD_READONLY_MONITORING_BASELINE_3PA_V3',
    bundle: '3P-A',
    phase: KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.BASELINE_CAPTURED
        : KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.FAILED,
    monitoringBaselineId: monitoringBaselineId,
    nextBundle:
      KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.NEXT_STAGE,
    monitoringMode: 'READ_ONLY',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodFileName: prodInfo.prodFileName || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    rowSnapshot: snapshot,
    safeModes: safeModes.summary,
    monitoringPolicy: {
      purpose:
        'Use this baseline to compare future PROD read-only health checks.',
      allowedNow: [
        'Read PROD file metadata',
        'Read sheet existence',
        'Read row/column counts',
        'Read recent audit log rows only if needed'
      ],
      notAllowedNow: [
        'No PROD writes',
        'No append audit rows',
        'No selected change execution',
        'No rollback',
        'No migration',
        'No deployment'
      ]
    },
    noSideEffectAt3PA: {
      prodFileModifiedBy3PA: false,
      prodDataWrittenBy3PA: false,
      prodSheetCreatedBy3PA: false,
      prodSheetDeletedBy3PA: false
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

  kidlearnV3_3paSaveBaseline_(
    baseline
  );

  kidlearnV3_3paSaveResult_(
    baseline,
    baseline.success
      ? KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.BASELINE_CAPTURED
      : KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.FAILED,
    KIDLEARN_V3_PROD_MONITOR_3PA_KEYS.LAST_BASELINE_AT
  );

  console.log(JSON.stringify(baseline, null, 2));

  if (!baseline.success) {
    throw new Error(
      '3P-A monitoring baseline failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return baseline;
}


/**
 * Run PROD read-only monitoring smoke.
 *
 * Không ghi PROD.
 */
function kidlearnV3_runProdReadonlyMonitoringSmoke3PAV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var status =
    kidlearnV3_getProdReadonlyOperationalMonitoring3PAStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.BASELINE_CAPTURED &&
    status.status !== KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.MONITORING_SMOKE_PASSED &&
    status.status !== KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.READY_FOR_3P_B
  ) {
    errors.push(
      '3P-A cần BASELINE_CAPTURED trước khi smoke. Status=' +
      status.status
    );
  }

  if (
    !status.lastBaseline ||
    status.lastBaseline.success !== true
  ) {
    errors.push(
      'Last baseline chưa success=true.'
    );
  }

  var prodInfo =
    kidlearnV3_3paGetProdInfo_();

  var prodCheck =
    kidlearnV3_3paCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi monitoring smoke: ' +
      prodCheck.message
    );
  }

  var spreadsheet =
    SpreadsheetApp.openById(
      prodInfo.prodFileId
    );

  var currentSnapshot =
    kidlearnV3_3paSnapshotProdSheets_(
      spreadsheet,
      KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.TARGET_SHEETS
    );

  var baselineSnapshot =
    status.lastBaseline
      ? status.lastBaseline.rowSnapshot
      : null;

  var compare =
    kidlearnV3_3paCompareBaselineToCurrent_(
      baselineSnapshot,
      currentSnapshot
    );

  warnings = warnings.concat(compare.warnings);

  var safeModes =
    kidlearnV3_3paCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var finishedAt = new Date();

  var smoke = {
    success: errors.length === 0,
    action: 'RUN_PROD_READONLY_MONITORING_SMOKE_3PA_V3',
    bundle: '3P-A',
    phase: KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.MONITORING_SMOKE_PASSED
        : KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.FAILED,
    monitoringBaselineId: status.monitoringBaselineId || '',
    nextBundle:
      KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.NEXT_STAGE,
    monitoringMode: 'READ_ONLY',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    smokeSummary: {
      prodAccessible: prodCheck.success,
      currentCheckedSheetCount:
        currentSnapshot.checkedSheetCount,
      missingSheetCount:
        currentSnapshot.missingSheetCount,
      baselineCompareWarningCount:
        compare.warningCount,
      safeWriteMode:
        safeModes.summary.safeWriteMode,
      safeWriteEnabled:
        safeModes.summary.safeWriteEnabled
    },
    currentSnapshot: currentSnapshot,
    compare: compare.summary,
    safeModes: safeModes.summary,
    noSideEffectAt3PA: {
      prodFileModifiedBy3PASmoke: false,
      prodDataWrittenBy3PASmoke: false,
      prodSheetCreatedBy3PASmoke: false,
      prodSheetDeletedBy3PASmoke: false
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

  kidlearnV3_3paSaveSmoke_(
    smoke
  );

  kidlearnV3_3paSaveResult_(
    smoke,
    smoke.success
      ? KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.MONITORING_SMOKE_PASSED
      : KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.FAILED,
    KIDLEARN_V3_PROD_MONITOR_3PA_KEYS.LAST_SMOKE_AT
  );

  console.log(JSON.stringify(smoke, null, 2));

  if (!smoke.success) {
    throw new Error(
      '3P-A monitoring smoke failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return smoke;
}


/**
 * Mark 3P-A ready.
 */
function kidlearnV3_markProdReadonlyOperationalMonitoring3PAReadyV3() {
  var status =
    kidlearnV3_getProdReadonlyOperationalMonitoring3PAStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.MONITORING_SMOKE_PASSED &&
    status.status !== KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.READY_FOR_3P_B
  ) {
    errors.push(
      '3P-A chưa MONITORING_SMOKE_PASSED. Status=' +
      status.status
    );
  }

  if (
    !status.lastBaseline ||
    status.lastBaseline.success !== true
  ) {
    errors.push(
      'Last baseline chưa success=true.'
    );
  }

  if (
    !status.lastSmoke ||
    status.lastSmoke.success !== true
  ) {
    errors.push(
      'Last monitoring smoke chưa success=true.'
    );
  }

  if (!status.monitoringBaselineId) {
    errors.push('Thiếu monitoringBaselineId.');
  }

  var prodInfo =
    kidlearnV3_3paGetProdInfo_();

  var prodCheck =
    kidlearnV3_3paCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi mark 3P-A ready: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3paCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3P-A ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_READONLY_OPERATIONAL_MONITORING_3PA_READY_V3',
    bundle: '3P-A',
    phase: KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.READY_FOR_3P_B,
    monitoringBaselineId: status.monitoringBaselineId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.NEXT_STAGE,
    monitoringMode: 'READ_ONLY',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    message:
      '3P-A ready. PROD read-only operational monitoring baseline đã được tạo.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3paSaveResult_(
    result,
    KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.READY_FOR_3P_B,
    KIDLEARN_V3_PROD_MONITOR_3PA_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3P-A status.
 */
function kidlearnV3_getProdReadonlyOperationalMonitoring3PAStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_READONLY_OPERATIONAL_MONITORING_3PA_STATUS_V3',
    bundle: '3P-A',
    phase: KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_MONITOR_3PA_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.NOT_RUN,
    monitoringBaselineId:
      properties.getProperty(
        KIDLEARN_V3_PROD_MONITOR_3PA_KEYS.MONITORING_BASELINE_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_MONITOR_3PA_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastBaselineAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_MONITOR_3PA_KEYS.LAST_BASELINE_AT
      ) ||
      '',
    lastSmokeAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_MONITOR_3PA_KEYS.LAST_SMOKE_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_MONITOR_3PA_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3paReadJsonProperty_(
        KIDLEARN_V3_PROD_MONITOR_3PA_KEYS.LAST_RESULT_JSON
      ),
    lastBaseline:
      kidlearnV3_3paReadJsonProperty_(
        KIDLEARN_V3_PROD_MONITOR_3PA_KEYS.LAST_BASELINE_JSON
      ),
    lastSmoke:
      kidlearnV3_3paReadJsonProperty_(
        KIDLEARN_V3_PROD_MONITOR_3PA_KEYS.LAST_SMOKE_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3P-A ready.
 */
function kidlearnV3_assertProdReadonlyOperationalMonitoring3PAReadyV3() {
  var status =
    kidlearnV3_getProdReadonlyOperationalMonitoring3PAStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.READY_FOR_3P_B
  ) {
    errors.push(
      '3P-A chưa READY_FOR_3P_B. Status=' +
      status.status
    );
  }

  if (!status.monitoringBaselineId) {
    errors.push('Thiếu monitoringBaselineId.');
  }

  var prodInfo =
    kidlearnV3_3paGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_READONLY_OPERATIONAL_MONITORING_3PA_READY_V3',
    bundle: '3P-A',
    phase: KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.PHASE,
    status: status.status,
    monitoringBaselineId: status.monitoringBaselineId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_MONITOR_3PA_CONFIG.NEXT_BUNDLE,
    monitoringMode: 'READ_ONLY',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3P-A chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3P-A.
 *
 * Không ghi PROD.
 */
function kidlearnV3_getQaBatchSteps3PAV3() {
  return [
    {
      label: 'Assert 3O-M closed',
      functionName: 'kidlearnV3_assertProdChangeRequestCloseOperationalLock3OMClosedV3'
    },
    {
      label: 'Preview PROD Readonly Monitoring 3P-A',
      functionName: 'kidlearnV3_previewProdReadonlyOperationalMonitoring3PAV3'
    },
    {
      label: 'Capture PROD Readonly Monitoring Baseline 3P-A',
      functionName: 'kidlearnV3_captureProdReadonlyMonitoringBaseline3PAV3'
    },
    {
      label: 'Run PROD Readonly Monitoring Smoke 3P-A',
      functionName: 'kidlearnV3_runProdReadonlyMonitoringSmoke3PAV3'
    },
    {
      label: 'Mark PROD Readonly Monitoring 3P-A Ready',
      functionName: 'kidlearnV3_markProdReadonlyOperationalMonitoring3PAReadyV3'
    },
    {
      label: 'Assert PROD Readonly Monitoring 3P-A Ready',
      functionName: 'kidlearnV3_assertProdReadonlyOperationalMonitoring3PAReadyV3'
    }
  ];
}


/**
 * QA batch 3P-A.
 */
function kidlearnV3_runQaBatch3PAV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3P_A_PROD_READONLY_OPERATIONAL_MONITORING_BASELINE',
    kidlearnV3_getQaBatchSteps3PAV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Snapshot PROD sheets.
 */
function kidlearnV3_3paSnapshotProdSheets_(spreadsheet, sheetNames) {
  var items = [];
  var missingSheetCount = 0;
  var existingSheetCount = 0;

  for (var i = 0; i < sheetNames.length; i++) {
    var sheetName =
      sheetNames[i];

    var sheet =
      kidlearnV3_3paGetSheet_(
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
 * Compare baseline to current snapshot.
 *
 * 3P-A chỉ warning khi có khác biệt, không fail.
 */
function kidlearnV3_3paCompareBaselineToCurrent_(baselineSnapshot, currentSnapshot) {
  var warnings = [];

  if (!baselineSnapshot || !baselineSnapshot.items) {
    warnings.push('Không có baselineSnapshot để compare.');
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
    kidlearnV3_3paMapSnapshots_(
      baselineSnapshot.items || []
    );

  var currentMap =
    kidlearnV3_3paMapSnapshots_(
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

    var changed =
      before.exists !== after.exists ||
      before.lastRow !== after.lastRow ||
      before.lastColumn !== after.lastColumn;

    if (changed) {
      changedSheetCount++;
      warnings.push(
        'Monitoring baseline compare changed: ' +
        sheetName +
        '. beforeRow=' +
        before.lastRow +
        ', afterRow=' +
        after.lastRow +
        ', beforeCol=' +
        before.lastColumn +
        ', afterCol=' +
        after.lastColumn
      );
    }

    compared.push({
      sheetName: sheetName,
      beforeLastRow: before.lastRow,
      afterLastRow: after.lastRow,
      beforeLastColumn: before.lastColumn,
      afterLastColumn: after.lastColumn,
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
 * Map snapshots.
 */
function kidlearnV3_3paMapSnapshots_(items) {
  var map = {};

  for (var i = 0; i < items.length; i++) {
    map[items[i].sheetName] = items[i];
  }

  return map;
}


/**
 * PROD info from 3N-F.
 */
function kidlearnV3_3paGetProdInfo_() {
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
function kidlearnV3_3paCheckFileAccessible_(fileId, label) {
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
function kidlearnV3_3paCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3paSafeWriteStatus_();

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
    kidlearnV3_3paControlledWriteStatus_();

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
function kidlearnV3_3paGetSheet_(spreadsheet, sheetName) {
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
function kidlearnV3_3paSafeAssert_(functionName, label) {
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
function kidlearnV3_3paSafeCall_(functionName) {
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
        kidlearnV3_3paSummarizeStatusOutput_(
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
function kidlearnV3_3paSummarizeStatusOutput_(output) {
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
    closeReviewId: output.closeReviewId || '',
    operationalLockId: output.operationalLockId || '',
    finalOperationalMode: output.finalOperationalMode || '',
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0
  };
}


/**
 * Safe Write status.
 */
function kidlearnV3_3paSafeWriteStatus_() {
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
function kidlearnV3_3paControlledWriteStatus_() {
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
function kidlearnV3_3paCheckFunctions_(names) {
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
 * ID.
 */
function kidlearnV3_3paMakeMonitoringBaselineId_() {
  return (
    'PROD_READONLY_MONITORING_BASELINE_3PA_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


/**
 * Save baseline.
 */
function kidlearnV3_3paSaveBaseline_(baseline) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_MONITOR_3PA_KEYS.MONITORING_BASELINE_ID,
    baseline.monitoringBaselineId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_MONITOR_3PA_KEYS.LAST_BASELINE_JSON,
    JSON.stringify(baseline)
  );
}


/**
 * Save smoke.
 */
function kidlearnV3_3paSaveSmoke_(smoke) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PROD_MONITOR_3PA_KEYS.LAST_SMOKE_JSON,
      JSON.stringify(smoke)
    );
}


/**
 * Save result.
 */
function kidlearnV3_3paSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_MONITOR_3PA_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.READY_FOR_3P_B &&
    (
      status === KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.BASELINE_CAPTURED ||
      status === KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.MONITORING_SMOKE_PASSED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_MONITOR_3PA_STATUS.READY_FOR_3P_B;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_MONITOR_3PA_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_MONITOR_3PA_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      monitoringBaselineId: result.monitoringBaselineId || '',
      prodFileId: result.prodFileId || '',
      prodFileUrl: result.prodFileUrl || '',
      monitoringMode: 'READ_ONLY',
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
function kidlearnV3_3paReadJsonProperty_(key) {
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