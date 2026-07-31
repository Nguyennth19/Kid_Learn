/**
 * ================================================================
 * KIDLEARN V3 - PROD DRY-RUN DEPLOYMENT REHEARSAL
 * Bundle: 3N-C
 * Version: 3.1.0
 * ================================================================
 *
 * 3N-C:
 * - Diễn tập PROD deployment bằng DRY_RUN.
 * - Không tạo PROD file.
 * - Không copy sang PROD.
 * - Không real write.
 * - Không migration.
 * - Không rollback.
 * - Không create/delete sheet.
 * - Chỉ ghi ScriptProperties để lưu rehearsal/status.
 */


var KIDLEARN_V3_PROD_REHEARSAL_3NC_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3NC_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3NC_LAST_PREVIEW_AT',
  LAST_REHEARSAL_AT: 'KIDLEARN_V3_PHASE_3NC_LAST_REHEARSAL_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3NC_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3NC_LAST_RESULT_JSON',
  LAST_REHEARSAL_JSON: 'KIDLEARN_V3_PHASE_3NC_LAST_REHEARSAL_JSON'
};


var KIDLEARN_V3_PROD_REHEARSAL_3NC_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  REHEARSAL_PASSED: 'REHEARSAL_PASSED',
  READY_FOR_3N_D: 'READY_FOR_3N_D',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_REHEARSAL_3NC_CONFIG = {
  VERSION: '3N-C',
  PHASE: '3N-C',
  NEXT_BUNDLE: '3N-D',
  NEXT_STAGE: 'PROD_DEPLOYMENT_APPROVAL_GATE',
  EXPECTED_SHEET_COUNT: 44,
  WRITE_MODE: 'PROD_DEPLOYMENT_DRY_RUN_ONLY',
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false
};


/**
 * Preview 3N-C.
 */
function kidlearnV3_previewProdDryRunRehearsal3NCV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3ncCheckFunctions_([
      'kidlearnV3_assertDevBackupDeploymentPlan3NBReadyV3',
      'kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_appGetActiveDatabaseV3_',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors =
    errors.concat(
      requiredFunctions.errors
    );

  var phase3NB =
    kidlearnV3_3ncSafeAssert_(
      'kidlearnV3_assertDevBackupDeploymentPlan3NBReadyV3',
      '3N-B'
    );

  if (!phase3NB.success) {
    errors.push(
      '3N-B chưa READY_FOR_3N_C: ' +
      phase3NB.message
    );
  }

  var safeModes =
    kidlearnV3_3ncCheckSafeModes_();

  errors =
    errors.concat(
      safeModes.errors
    );

  warnings =
    warnings.concat(
      safeModes.warnings
    );

  var backupCheck =
    kidlearnV3_3ncCheckBackupFile_();

  if (!backupCheck.success) {
    errors.push(
      'Backup file 3N-B chưa hợp lệ: ' +
      backupCheck.message
    );
  }

  var sourceSummary = null;

  try {
    sourceSummary =
      kidlearnV3_3ncBuildSourceDatabaseSummary_();

    if (sourceSummary.missingSheetCount > 0) {
      errors.push(
        'Source DEV candidate thiếu sheet. Missing=' +
        sourceSummary.missingSheetCount
      );
    }

  } catch (error) {
    errors.push(
      'Không build được source database summary 3N-C: ' +
      String(error.message || error)
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_DRY_RUN_REHEARSAL_3NC_V3',
    bundle: '3N-C',
    phase: KIDLEARN_V3_PROD_REHEARSAL_3NC_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_REHEARSAL_3NC_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_REHEARSAL_3NC_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_REHEARSAL_3NC_CONFIG.WRITE_MODE,
    prodDeployNow: false,
    realWriteAllowed: false,
    dryRunOnly: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3NB: phase3NB,
    safeModes: safeModes,
    backupCheck: backupCheck,
    sourceSummary: sourceSummary,
    requiredFunctions: requiredFunctions.items,
    note:
      '3N-C chỉ diễn tập PROD deployment bằng DRY_RUN. Không tạo PROD file.'
  };

  kidlearnV3_3ncSaveResult_(
    result,
    KIDLEARN_V3_PROD_REHEARSAL_3NC_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_REHEARSAL_3NC_KEYS.LAST_PREVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Run PROD dry-run deployment rehearsal.
 */
function kidlearnV3_runProdDryRunRehearsal3NCV3() {
  var startedAt =
    new Date();

  var errors = [];
  var warnings = [];
  var steps = [];

  var preview =
    kidlearnV3_previewProdDryRunRehearsal3NCV3();

  if (!preview.success) {
    throw new Error(
      'Không thể chạy PROD dry-run rehearsal 3N-C vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var status3NB =
    kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3();

  var backupCheck =
    kidlearnV3_3ncCheckBackupFile_();

  var sourceSummary =
    kidlearnV3_3ncBuildSourceDatabaseSummary_();

  var backupSummary =
    kidlearnV3_3ncBuildBackupSummary_(
      backupCheck.backupFileId
    );

  steps.push(
    kidlearnV3_3ncBuildRehearsalStep_(
      1,
      'Validate DEV candidate readiness',
      true,
      '3N-B ready, backup exists, safe modes checked.'
    )
  );

  steps.push(
    kidlearnV3_3ncBuildRehearsalStep_(
      2,
      'Validate backup accessibility',
      backupCheck.success,
      backupCheck.success
        ? 'Backup file accessible: ' + backupCheck.backupFileName
        : backupCheck.message
    )
  );

  steps.push(
    kidlearnV3_3ncBuildRehearsalStep_(
      3,
      'Simulate PROD target preparation',
      true,
      'DRY_RUN only. No PROD file created.'
    )
  );

  steps.push(
    kidlearnV3_3ncBuildRehearsalStep_(
      4,
      'Simulate schema inventory check',
      sourceSummary.missingSheetCount === 0,
      'Expected=' +
      sourceSummary.expectedSheetCount +
      ', Found=' +
      sourceSummary.foundSheetCount +
      ', Missing=' +
      sourceSummary.missingSheetCount
    )
  );

  steps.push(
    kidlearnV3_3ncBuildRehearsalStep_(
      5,
      'Simulate copy DEV candidate to PROD',
      true,
      'Simulation only. No Drive copy to PROD.'
    )
  );

  steps.push(
    kidlearnV3_3ncBuildRehearsalStep_(
      6,
      'Simulate PROD post-copy validation',
      true,
      'Would validate 44 sheets, headers, safe write DRY_RUN, role guard.'
    )
  );

  steps.push(
    kidlearnV3_3ncBuildRehearsalStep_(
      7,
      'Simulate PROD rollback plan check',
      true,
      'Rollback would use backup file. No rollback executed.'
    )
  );

  steps.push(
    kidlearnV3_3ncBuildRehearsalStep_(
      8,
      'Confirm no PROD side effect',
      true,
      'prodDeployNow=false, prodFileCreated=false, realWriteAllowed=false.'
    )
  );

  for (var i = 0; i < steps.length; i++) {
    if (!steps[i].success) {
      errors.push(
        'Rehearsal step failed: ' +
        steps[i].stepName +
        '. ' +
        steps[i].message
      );
    }
  }

  var safeModes =
    kidlearnV3_3ncCheckSafeModes_();

  errors =
    errors.concat(
      safeModes.errors
    );

  warnings =
    warnings.concat(
      safeModes.warnings
    );

  if (
    backupSummary &&
    backupSummary.warning
  ) {
    warnings.push(
      backupSummary.warning
    );
  }

  var finishedAt =
    new Date();

  var rehearsal = {
    success: errors.length === 0,
    action: 'RUN_PROD_DRY_RUN_REHEARSAL_3NC_V3',
    bundle: '3N-C',
    phase: KIDLEARN_V3_PROD_REHEARSAL_3NC_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_REHEARSAL_3NC_STATUS.REHEARSAL_PASSED
        : KIDLEARN_V3_PROD_REHEARSAL_3NC_STATUS.FAILED,
    nextBundle: KIDLEARN_V3_PROD_REHEARSAL_3NC_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_REHEARSAL_3NC_CONFIG.NEXT_STAGE,
    prodDeployNow: false,
    prodFileCreated: false,
    prodSheetTouched: false,
    realWriteAllowed: false,
    dryRunOnly: true,
    candidate: {
      status3NB: status3NB.status || '',
      backupFileId: status3NB.backupFileId || '',
      backupFileUrl: status3NB.backupFileUrl || ''
    },
    sourceSummary: sourceSummary,
    backupSummary: backupSummary,
    safeModes: safeModes.summary,
    rehearsalSteps: steps,
    rehearsalDecision:
      errors.length === 0
        ? 'READY_FOR_APPROVAL_GATE_3N_D'
        : 'HOLD_BEFORE_APPROVAL_GATE',
    blockedActionsConfirmed: [
      'No PROD file created',
      'No PROD copy executed',
      'No migration executed',
      'No rollback executed',
      'No real write executed',
      'No sheet create/delete executed'
    ],
    manualRequirementsBeforeActualProd: [
      'Review backup file URL.',
      'Review DATA_UserChildAccess before PROD.',
      'Review final lesson/question master data.',
      'Manual approval required in 3N-D.',
      'Actual PROD deployment must be a separate explicitly confirmed phase.'
    ],
    startedAt:
      startedAt.toISOString(),
    finishedAt:
      finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_3ncSaveRehearsal_(
    rehearsal
  );

  kidlearnV3_3ncSaveResult_(
    rehearsal,
    rehearsal.success
      ? KIDLEARN_V3_PROD_REHEARSAL_3NC_STATUS.REHEARSAL_PASSED
      : KIDLEARN_V3_PROD_REHEARSAL_3NC_STATUS.FAILED,
    KIDLEARN_V3_PROD_REHEARSAL_3NC_KEYS.LAST_REHEARSAL_AT
  );

  console.log(
    JSON.stringify(rehearsal, null, 2)
  );

  if (!rehearsal.success) {
    throw new Error(
      '3N-C PROD dry-run rehearsal failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return rehearsal;
}


/**
 * Mark 3N-C ready.
 */
function kidlearnV3_markProdDryRunRehearsal3NCReadyV3() {
  var status =
    kidlearnV3_getProdDryRunRehearsal3NCStatusV3();

  var errors = [];

  if (
    status.status !==
      KIDLEARN_V3_PROD_REHEARSAL_3NC_STATUS.REHEARSAL_PASSED &&
    status.status !==
      KIDLEARN_V3_PROD_REHEARSAL_3NC_STATUS.READY_FOR_3N_D
  ) {
    errors.push(
      '3N-C chưa có rehearsal passed. Status=' +
      status.status
    );
  }

  if (
    !status.lastRehearsal ||
    status.lastRehearsal.success !== true
  ) {
    errors.push(
      'Last rehearsal chưa success=true.'
    );
  }

  var safeModes =
    kidlearnV3_3ncCheckSafeModes_();

  errors =
    errors.concat(
      safeModes.errors
    );

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3N-C ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_DRY_RUN_REHEARSAL_3NC_READY_V3',
    bundle: '3N-C',
    phase: KIDLEARN_V3_PROD_REHEARSAL_3NC_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_REHEARSAL_3NC_STATUS.READY_FOR_3N_D,
    nextBundle:
      KIDLEARN_V3_PROD_REHEARSAL_3NC_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_REHEARSAL_3NC_CONFIG.NEXT_STAGE,
    prodDeployNow: false,
    message:
      '3N-C ready. PROD dry-run deployment rehearsal đã pass. Bước tiếp theo là 3N-D Approval Gate.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3ncSaveResult_(
    result,
    KIDLEARN_V3_PROD_REHEARSAL_3NC_STATUS.READY_FOR_3N_D,
    KIDLEARN_V3_PROD_REHEARSAL_3NC_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Get 3N-C status.
 */
function kidlearnV3_getProdDryRunRehearsal3NCStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_DRY_RUN_REHEARSAL_3NC_STATUS_V3',
    bundle: '3N-C',
    phase: KIDLEARN_V3_PROD_REHEARSAL_3NC_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_REHEARSAL_3NC_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_REHEARSAL_3NC_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_REHEARSAL_3NC_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastRehearsalAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_REHEARSAL_3NC_KEYS.LAST_REHEARSAL_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_REHEARSAL_3NC_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3ncReadJsonProperty_(
        KIDLEARN_V3_PROD_REHEARSAL_3NC_KEYS.LAST_RESULT_JSON
      ),
    lastRehearsal:
      kidlearnV3_3ncReadJsonProperty_(
        KIDLEARN_V3_PROD_REHEARSAL_3NC_KEYS.LAST_REHEARSAL_JSON
      )
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3N-C ready.
 */
function kidlearnV3_assertProdDryRunRehearsal3NCReadyV3() {
  var status =
    kidlearnV3_getProdDryRunRehearsal3NCStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_REHEARSAL_3NC_STATUS.READY_FOR_3N_D
  ) {
    errors.push(
      '3N-C chưa READY_FOR_3N_D. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_DRY_RUN_REHEARSAL_3NC_READY_V3',
    bundle: '3N-C',
    phase: KIDLEARN_V3_PROD_REHEARSAL_3NC_CONFIG.PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_PROD_REHEARSAL_3NC_CONFIG.NEXT_BUNDLE,
    prodDeployNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3N-C chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3N-C.
 */
function kidlearnV3_getQaBatchSteps3NCV3() {
  return [
    {
      label: 'Assert 3N-B ready',
      functionName: 'kidlearnV3_assertDevBackupDeploymentPlan3NBReadyV3'
    },
    {
      label: 'Preview PROD Dry-run Rehearsal 3N-C',
      functionName: 'kidlearnV3_previewProdDryRunRehearsal3NCV3'
    },
    {
      label: 'Run PROD Dry-run Rehearsal 3N-C',
      functionName: 'kidlearnV3_runProdDryRunRehearsal3NCV3'
    },
    {
      label: 'Mark PROD Dry-run Rehearsal 3N-C Ready',
      functionName: 'kidlearnV3_markProdDryRunRehearsal3NCReadyV3'
    },
    {
      label: 'Assert PROD Dry-run Rehearsal 3N-C Ready',
      functionName: 'kidlearnV3_assertProdDryRunRehearsal3NCReadyV3'
    }
  ];
}


/**
 * QA batch 3N-C.
 */
function kidlearnV3_runQaBatch3NCV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3N_C_PROD_DRY_RUN_REHEARSAL',
    kidlearnV3_getQaBatchSteps3NCV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build rehearsal step.
 */
function kidlearnV3_3ncBuildRehearsalStep_(
  stepNo,
  stepName,
  success,
  message
) {
  return {
    stepNo: stepNo,
    stepName: stepName,
    success: success === true,
    message: message || '',
    executedForReal: false,
    dryRunOnly: true,
    checkedAt:
      new Date().toISOString()
  };
}


/**
 * Check backup file from 3N-B.
 */
function kidlearnV3_3ncCheckBackupFile_() {
  try {
    var status3NB =
      kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3();

    var backupFileId =
      status3NB.backupFileId || '';

    if (!backupFileId) {
      return {
        success: false,
        backupFileId: '',
        message:
          'Thiếu backupFileId từ 3N-B.'
      };
    }

    var file =
      DriveApp.getFileById(
        backupFileId
      );

    return {
      success: true,
      backupFileId: backupFileId,
      backupFileName: file.getName(),
      backupFileUrl: file.getUrl(),
      backupFileSize: file.getSize ? file.getSize() : '',
      message:
        'Backup file accessible.'
    };

  } catch (error) {
    return {
      success: false,
      backupFileId: '',
      message:
        String(error.message || error)
    };
  }
}


/**
 * Build source database summary.
 */
function kidlearnV3_3ncBuildSourceDatabaseSummary_() {
  var spreadsheet =
    kidlearnV3_3ncGetDatabaseSpreadsheet_();

  var expectedSheets =
    kidlearnV3_3ncGetExpectedSheets_();

  var items = [];
  var missing = [];

  for (var i = 0; i < expectedSheets.length; i++) {
    var sheetName =
      expectedSheets[i];

    var sheet =
      kidlearnV3_3ncGetSheet_(
        spreadsheet,
        sheetName
      );

    if (!sheet) {
      missing.push(sheetName);

      items.push({
        sheetName: sheetName,
        exists: false
      });

      continue;
    }

    items.push({
      sheetName: sheetName,
      exists: true,
      lastRow: sheet.getLastRow(),
      lastColumn: sheet.getLastColumn()
    });
  }

  return {
    spreadsheetId: spreadsheet.getId(),
    spreadsheetName: spreadsheet.getName(),
    spreadsheetUrl: spreadsheet.getUrl(),
    expectedSheetCount: expectedSheets.length,
    foundSheetCount:
      items.filter(function(item) {
        return item.exists;
      }).length,
    missingSheetCount: missing.length,
    missingSheets: missing,
    items: items
  };
}


/**
 * Build backup summary.
 *
 * Không mở/copy backup như DB. Chỉ kiểm tra file tồn tại.
 */
function kidlearnV3_3ncBuildBackupSummary_(backupFileId) {
  try {
    var file =
      DriveApp.getFileById(
        backupFileId
      );

    return {
      success: true,
      backupFileId: backupFileId,
      backupFileName: file.getName(),
      backupFileUrl: file.getUrl(),
      warning:
        '3N-C không mở backup để scan sâu, chỉ xác nhận backup file truy cập được.'
    };

  } catch (error) {
    return {
      success: false,
      backupFileId: backupFileId || '',
      error:
        String(error.message || error)
    };
  }
}


/**
 * Check safe modes.
 */
function kidlearnV3_3ncCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3ncSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Safe Write phải DRY_RUN/enabled=false. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var controlledWrite =
    kidlearnV3_3ncControlledWriteStatus_();

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
 * Get expected sheets.
 */
function kidlearnV3_3ncGetExpectedSheets_() {
  try {
    if (
      typeof KIDLEARN_V3_SHEET_ORDER !== 'undefined' &&
      KIDLEARN_V3_SHEET_ORDER &&
      KIDLEARN_V3_SHEET_ORDER.length
    ) {
      return KIDLEARN_V3_SHEET_ORDER.slice();
    }
  } catch (error) {}

  if (
    typeof kidlearnV3_3nbGetExpectedSheets_ === 'function'
  ) {
    return kidlearnV3_3nbGetExpectedSheets_();
  }

  return [
    'SYS_Config',
    'SYS_Categories',
    'SYS_SchemaVersion',
    'SYS_MigrationLog',
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
  ];
}


/**
 * Database spreadsheet.
 */
function kidlearnV3_3ncGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3ncResolveSpreadsheet_(
      database
    );

  if (!spreadsheet) {
    throw new Error(
      'Không resolve được Spreadsheet object từ Database V3.'
    );
  }

  return spreadsheet;
}


/**
 * Resolve Spreadsheet.
 */
function kidlearnV3_3ncResolveSpreadsheet_(value) {
  if (!value) {
    return null;
  }

  if (
    typeof value.getSheets === 'function' &&
    typeof value.getId === 'function'
  ) {
    return value;
  }

  if (
    value.spreadsheet &&
    typeof value.spreadsheet.getSheets === 'function'
  ) {
    return value.spreadsheet;
  }

  if (
    value.database &&
    typeof value.database.getSheets === 'function'
  ) {
    return value.database;
  }

  if (
    value.db &&
    typeof value.db.getSheets === 'function'
  ) {
    return value.db;
  }

  if (
    value.spreadsheetObject &&
    typeof value.spreadsheetObject.getSheets === 'function'
  ) {
    return value.spreadsheetObject;
  }

  if (
    value.activeSpreadsheet &&
    typeof value.activeSpreadsheet.getSheets === 'function'
  ) {
    return value.activeSpreadsheet;
  }

  if (value.spreadsheetId) {
    return SpreadsheetApp.openById(
      value.spreadsheetId
    );
  }

  if (value.databaseSpreadsheetId) {
    return SpreadsheetApp.openById(
      value.databaseSpreadsheetId
    );
  }

  if (
    value.id &&
    typeof value.id === 'string'
  ) {
    return SpreadsheetApp.openById(
      value.id
    );
  }

  return null;
}


/**
 * Get exact sheet.
 */
function kidlearnV3_3ncGetSheet_(
  spreadsheet,
  sheetName
) {
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
function kidlearnV3_3ncSafeAssert_(
  functionName,
  label
) {
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
function kidlearnV3_3ncSafeWriteStatus_() {
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
function kidlearnV3_3ncControlledWriteStatus_() {
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
function kidlearnV3_3ncCheckFunctions_(names) {
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
 * Save rehearsal.
 */
function kidlearnV3_3ncSaveRehearsal_(rehearsal) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PROD_REHEARSAL_3NC_KEYS.LAST_REHEARSAL_JSON,
      JSON.stringify(rehearsal)
    );
}


/**
 * Save result.
 */
function kidlearnV3_3ncSaveResult_(
  result,
  status,
  dateKey
) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_REHEARSAL_3NC_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_REHEARSAL_3NC_STATUS.READY_FOR_3N_D &&
    (
      status === KIDLEARN_V3_PROD_REHEARSAL_3NC_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_REHEARSAL_3NC_STATUS.REHEARSAL_PASSED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_REHEARSAL_3NC_STATUS.READY_FOR_3N_D;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_REHEARSAL_3NC_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_REHEARSAL_3NC_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      prodDeployNow: false,
      prodFileCreated: false,
      realWriteAllowed: false,
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
function kidlearnV3_3ncReadJsonProperty_(key) {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(key);

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      raw: text
    };
  }
}