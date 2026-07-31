/**
 * ================================================================
 * KIDLEARN V3 - DEV CANDIDATE BACKUP & PROD DEPLOYMENT PLAN
 * Bundle: 3N-B
 * Version: 3.1.0
 * ================================================================
 *
 * 3N-B:
 * - Generate PROD deployment plan.
 * - Create DEV candidate backup on Google Drive.
 * - Không deploy PROD.
 * - Không real write.
 * - Không migration.
 * - Không rollback.
 * - Không create/delete sheet.
 */


var KIDLEARN_V3_PROD_PLAN_3NB_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3NB_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3NB_LAST_PREVIEW_AT',
  LAST_PLAN_AT: 'KIDLEARN_V3_PHASE_3NB_LAST_PLAN_AT',
  LAST_BACKUP_AT: 'KIDLEARN_V3_PHASE_3NB_LAST_BACKUP_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3NB_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3NB_LAST_RESULT_JSON',
  LAST_PLAN_JSON: 'KIDLEARN_V3_PHASE_3NB_LAST_PLAN_JSON',
  LAST_BACKUP_JSON: 'KIDLEARN_V3_PHASE_3NB_LAST_BACKUP_JSON',
  BACKUP_FILE_ID: 'KIDLEARN_V3_PHASE_3NB_BACKUP_FILE_ID',
  BACKUP_FILE_URL: 'KIDLEARN_V3_PHASE_3NB_BACKUP_FILE_URL'
};


var KIDLEARN_V3_PROD_PLAN_3NB_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  PLAN_GENERATED: 'PLAN_GENERATED',
  BACKUP_CREATED: 'BACKUP_CREATED',
  READY_FOR_3N_C: 'READY_FOR_3N_C',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_PLAN_3NB_CONFIG = {
  VERSION: '3N-B',
  PHASE: '3N-B',
  NEXT_BUNDLE: '3N-C',
  NEXT_STAGE: 'PROD_DRY_RUN_DEPLOYMENT_REHEARSAL',
  EXPECTED_SHEET_COUNT: 44,
  WRITE_MODE: 'DRIVE_BACKUP_ONLY',
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false
};


/**
 * Preview 3N-B.
 */
function kidlearnV3_previewDevBackupDeploymentPlan3NBV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3nbCheckFunctions_([
      'kidlearnV3_assertProdCandidateReview3NAReadyV3',
      'kidlearnV3_getProdCandidateReview3NAStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_appGetActiveDatabaseV3_',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors =
    errors.concat(
      requiredFunctions.errors
    );

  var phase3NA =
    kidlearnV3_3nbSafeAssert_(
      'kidlearnV3_assertProdCandidateReview3NAReadyV3',
      '3N-A'
    );

  if (!phase3NA.success) {
    errors.push(
      '3N-A chưa READY_FOR_3N_B: ' +
      phase3NA.message
    );
  }

  var safeModes =
    kidlearnV3_3nbCheckSafeModes_();

  errors =
    errors.concat(
      safeModes.errors
    );

  warnings =
    warnings.concat(
      safeModes.warnings
    );

  var candidateStatus =
    kidlearnV3_3nbSafeCall_(
      'kidlearnV3_getProdCandidateReview3NAStatusV3'
    );

  var dbSummary = null;

  try {
    dbSummary =
      kidlearnV3_3nbBuildDatabaseSummary_();

    if (dbSummary.missingSheetCount > 0) {
      errors.push(
        'DEV candidate thiếu V3 sheet. Missing=' +
        dbSummary.missingSheetCount
      );
    }

  } catch (error) {
    errors.push(
      'Không build được database summary 3N-B: ' +
      String(error.message || error)
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_DEV_BACKUP_DEPLOYMENT_PLAN_3NB_V3',
    bundle: '3N-B',
    phase: KIDLEARN_V3_PROD_PLAN_3NB_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_PLAN_3NB_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_PLAN_3NB_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_PLAN_3NB_CONFIG.WRITE_MODE,
    realWriteAllowed: false,
    prodDeployNow: false,
    driveBackupWillBeCreatedOnlyByManualFunction: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3NA: phase3NA,
    candidateStatus: candidateStatus,
    safeModes: safeModes,
    databaseSummary: dbSummary,
    requiredFunctions: requiredFunctions.items
  };

  kidlearnV3_3nbSaveResult_(
    result,
    KIDLEARN_V3_PROD_PLAN_3NB_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_PLAN_3NB_KEYS.LAST_PREVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Generate PROD deployment plan.
 *
 * Không deploy PROD.
 */
function kidlearnV3_generateProdDeploymentPlan3NBV3() {
  var startedAt =
    new Date();

  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewDevBackupDeploymentPlan3NBV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate PROD deployment plan 3N-B vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var candidateStatus =
    kidlearnV3_getProdCandidateReview3NAStatusV3();

  var candidateId =
    candidateStatus.candidateId || '';

  var spreadsheet =
    kidlearnV3_3nbGetDatabaseSpreadsheet_();

  var dbSummary =
    kidlearnV3_3nbBuildDatabaseSummary_();

  var finishedAt =
    new Date();

  var plan = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_DEPLOYMENT_PLAN_3NB_V3',
    bundle: '3N-B',
    phase: KIDLEARN_V3_PROD_PLAN_3NB_CONFIG.PHASE,
    candidateId: candidateId,
    nextBundle: KIDLEARN_V3_PROD_PLAN_3NB_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_PLAN_3NB_CONFIG.NEXT_STAGE,
    prodDeployNow: false,
    realWriteAllowed: false,
    sourceDevCandidate: {
      spreadsheetId: spreadsheet.getId(),
      spreadsheetName: spreadsheet.getName(),
      spreadsheetUrl: spreadsheet.getUrl()
    },
    databaseSummary: dbSummary,
    deploymentPlan: {
      stage1: 'Create DEV candidate backup.',
      stage2: 'Review backup file and manifest.',
      stage3: 'Prepare PROD target separately.',
      stage4: 'Run PROD dry-run deployment rehearsal in 3N-C.',
      stage5: 'Only after manual approval, create actual PROD deployment phase.',
      prodSheetTouchedNow: false,
      backupRequiredBeforeProd: true,
      manualApprovalRequired: true
    },
    blockedActionsIn3NB: [
      'No PROD copy',
      'No PROD deploy',
      'No migration',
      'No rollback',
      'No real write',
      'No create/delete sheet'
    ],
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_3nbSavePlan_(
    plan
  );

  kidlearnV3_3nbSaveResult_(
    plan,
    plan.success
      ? KIDLEARN_V3_PROD_PLAN_3NB_STATUS.PLAN_GENERATED
      : KIDLEARN_V3_PROD_PLAN_3NB_STATUS.FAILED,
    KIDLEARN_V3_PROD_PLAN_3NB_KEYS.LAST_PLAN_AT
  );

  console.log(
    JSON.stringify(plan, null, 2)
  );

  if (!plan.success) {
    throw new Error(
      'Generate PROD deployment plan 3N-B failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return plan;
}


/**
 * Create DEV candidate backup.
 *
 * Chạy riêng, không đưa vào QA batch để tránh tạo nhiều backup.
 *
 * options:
 * {
 *   forceNewBackup: true / false
 * }
 */
function kidlearnV3_createDevCandidateBackup3NBV3(options) {
  var req =
    kidlearnV3_3nbNormalizeOptions_(
      options
    );

  var properties =
    PropertiesService.getScriptProperties();

  var existingBackupId =
    properties.getProperty(
      KIDLEARN_V3_PROD_PLAN_3NB_KEYS.BACKUP_FILE_ID
    ) || '';

  var existingBackupUrl =
    properties.getProperty(
      KIDLEARN_V3_PROD_PLAN_3NB_KEYS.BACKUP_FILE_URL
    ) || '';

  if (
    existingBackupId &&
    existingBackupUrl &&
    req.forceNewBackup !== true
  ) {
    var reused = {
      success: true,
      action: 'CREATE_DEV_CANDIDATE_BACKUP_3NB_V3',
      bundle: '3N-B',
      status: KIDLEARN_V3_PROD_PLAN_3NB_STATUS.BACKUP_CREATED,
      reusedExistingBackup: true,
      backupFileId: existingBackupId,
      backupFileUrl: existingBackupUrl,
      message:
        'Đã có backup cũ của 3N-B. Không tạo bản copy mới. Muốn tạo mới, chạy với {forceNewBackup:true}.'
    };

    kidlearnV3_3nbSaveResult_(
      reused,
      KIDLEARN_V3_PROD_PLAN_3NB_STATUS.BACKUP_CREATED,
      KIDLEARN_V3_PROD_PLAN_3NB_KEYS.LAST_BACKUP_AT
    );

    console.log(
      JSON.stringify(reused, null, 2)
    );

    return reused;
  }

  var preview =
    kidlearnV3_previewDevBackupDeploymentPlan3NBV3();

  if (!preview.success) {
    throw new Error(
      'Không thể tạo backup 3N-B vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var plan =
    kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3().lastPlan;

  if (!plan || plan.success !== true) {
    plan =
      kidlearnV3_generateProdDeploymentPlan3NBV3();
  }

  var candidateStatus =
    kidlearnV3_getProdCandidateReview3NAStatusV3();

  var candidateId =
    candidateStatus.candidateId ||
    kidlearnV3_3nbMakeBackupTimestamp_();

  var spreadsheet =
    kidlearnV3_3nbGetDatabaseSpreadsheet_();

  var sourceFile =
    DriveApp.getFileById(
      spreadsheet.getId()
    );

  var backupName =
    '[KIDLEARN V3 DEV BACKUP] ' +
    spreadsheet.getName() +
    ' - ' +
    candidateId +
    ' - ' +
    kidlearnV3_3nbMakeBackupTimestamp_();

  var backupFile =
    kidlearnV3_3nbMakeCopyInSameFolder_(
      sourceFile,
      backupName
    );

  var backupResult = {
    success: true,
    action: 'CREATE_DEV_CANDIDATE_BACKUP_3NB_V3',
    bundle: '3N-B',
    phase: KIDLEARN_V3_PROD_PLAN_3NB_CONFIG.PHASE,
    status: KIDLEARN_V3_PROD_PLAN_3NB_STATUS.BACKUP_CREATED,
    candidateId: candidateId,
    sourceSpreadsheetId: spreadsheet.getId(),
    sourceSpreadsheetName: spreadsheet.getName(),
    backupFileId: backupFile.getId(),
    backupFileName: backupFile.getName(),
    backupFileUrl: backupFile.getUrl(),
    prodDeployNow: false,
    realWriteAllowed: false,
    createdAt:
      new Date().toISOString(),
    note:
      'Backup đã được tạo trên Google Drive. Chưa copy/deploy sang PROD.'
  };

  properties.setProperty(
    KIDLEARN_V3_PROD_PLAN_3NB_KEYS.BACKUP_FILE_ID,
    backupResult.backupFileId
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_PLAN_3NB_KEYS.BACKUP_FILE_URL,
    backupResult.backupFileUrl
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_PLAN_3NB_KEYS.LAST_BACKUP_JSON,
    JSON.stringify(backupResult)
  );

  kidlearnV3_3nbSaveResult_(
    backupResult,
    KIDLEARN_V3_PROD_PLAN_3NB_STATUS.BACKUP_CREATED,
    KIDLEARN_V3_PROD_PLAN_3NB_KEYS.LAST_BACKUP_AT
  );

  console.log(
    JSON.stringify(backupResult, null, 2)
  );

  return backupResult;
}


/**
 * Mark 3N-B ready.
 */
function kidlearnV3_markDevBackupDeploymentPlan3NBReadyV3() {
  var status =
    kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3();

  var errors = [];

  if (
    !status.lastPlan ||
    status.lastPlan.success !== true
  ) {
    errors.push(
      '3N-B chưa có deployment plan success=true.'
    );
  }

  if (
    !status.backupFileId ||
    !status.backupFileUrl
  ) {
    errors.push(
      '3N-B chưa có backupFileId/backupFileUrl. Cần chạy kidlearnV3_createDevCandidateBackup3NBV3.'
    );
  }

  var safeModes =
    kidlearnV3_3nbCheckSafeModes_();

  errors =
    errors.concat(
      safeModes.errors
    );

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3N-B ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_DEV_BACKUP_DEPLOYMENT_PLAN_3NB_READY_V3',
    bundle: '3N-B',
    phase: KIDLEARN_V3_PROD_PLAN_3NB_CONFIG.PHASE,
    status: KIDLEARN_V3_PROD_PLAN_3NB_STATUS.READY_FOR_3N_C,
    backupFileId: status.backupFileId,
    backupFileUrl: status.backupFileUrl,
    nextBundle: KIDLEARN_V3_PROD_PLAN_3NB_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_PLAN_3NB_CONFIG.NEXT_STAGE,
    prodDeployNow: false,
    message:
      '3N-B ready. DEV candidate đã có backup và deployment plan. Bước tiếp theo là 3N-C PROD dry-run deployment rehearsal.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3nbSaveResult_(
    result,
    KIDLEARN_V3_PROD_PLAN_3NB_STATUS.READY_FOR_3N_C,
    KIDLEARN_V3_PROD_PLAN_3NB_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Get 3N-B status.
 */
function kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_DEV_BACKUP_DEPLOYMENT_PLAN_3NB_STATUS_V3',
    bundle: '3N-B',
    phase: KIDLEARN_V3_PROD_PLAN_3NB_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_PLAN_3NB_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_PLAN_3NB_STATUS.NOT_RUN,
    backupFileId:
      properties.getProperty(
        KIDLEARN_V3_PROD_PLAN_3NB_KEYS.BACKUP_FILE_ID
      ) ||
      '',
    backupFileUrl:
      properties.getProperty(
        KIDLEARN_V3_PROD_PLAN_3NB_KEYS.BACKUP_FILE_URL
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_PLAN_3NB_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastPlanAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_PLAN_3NB_KEYS.LAST_PLAN_AT
      ) ||
      '',
    lastBackupAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_PLAN_3NB_KEYS.LAST_BACKUP_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_PLAN_3NB_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3nbReadJsonProperty_(
        KIDLEARN_V3_PROD_PLAN_3NB_KEYS.LAST_RESULT_JSON
      ),
    lastPlan:
      kidlearnV3_3nbReadJsonProperty_(
        KIDLEARN_V3_PROD_PLAN_3NB_KEYS.LAST_PLAN_JSON
      ),
    lastBackup:
      kidlearnV3_3nbReadJsonProperty_(
        KIDLEARN_V3_PROD_PLAN_3NB_KEYS.LAST_BACKUP_JSON
      )
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3N-B ready.
 */
function kidlearnV3_assertDevBackupDeploymentPlan3NBReadyV3() {
  var status =
    kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_PLAN_3NB_STATUS.READY_FOR_3N_C
  ) {
    errors.push(
      '3N-B chưa READY_FOR_3N_C. Status=' +
      status.status
    );
  }

  if (!status.backupFileId) {
    errors.push(
      'Thiếu backupFileId.'
    );
  }

  if (!status.backupFileUrl) {
    errors.push(
      'Thiếu backupFileUrl.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_DEV_BACKUP_DEPLOYMENT_PLAN_3NB_READY_V3',
    bundle: '3N-B',
    phase: KIDLEARN_V3_PROD_PLAN_3NB_CONFIG.PHASE,
    status: status.status,
    backupFileId: status.backupFileId,
    backupFileUrl: status.backupFileUrl,
    nextBundle: KIDLEARN_V3_PROD_PLAN_3NB_CONFIG.NEXT_BUNDLE,
    prodDeployNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3N-B chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA batch plan-only.
 *
 * Không tạo backup trong QA batch để tránh tạo nhiều Drive copies.
 */
function kidlearnV3_getQaBatchSteps3NBV3() {
  return [
    {
      label: 'Assert 3N-A ready',
      functionName: 'kidlearnV3_assertProdCandidateReview3NAReadyV3'
    },
    {
      label: 'Preview DEV Backup Deployment Plan 3N-B',
      functionName: 'kidlearnV3_previewDevBackupDeploymentPlan3NBV3'
    },
    {
      label: 'Generate PROD Deployment Plan 3N-B',
      functionName: 'kidlearnV3_generateProdDeploymentPlan3NBV3'
    }
  ];
}


/**
 * QA batch 3N-B plan-only.
 */
function kidlearnV3_runQaBatch3NBV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3N_B_BACKUP_DEPLOYMENT_PLAN_ONLY',
    kidlearnV3_getQaBatchSteps3NBV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build database summary.
 */
function kidlearnV3_3nbBuildDatabaseSummary_() {
  var spreadsheet =
    kidlearnV3_3nbGetDatabaseSpreadsheet_();

  var expectedSheets =
    kidlearnV3_3nbGetExpectedSheets_();

  var items = [];
  var missing = [];

  for (var i = 0; i < expectedSheets.length; i++) {
    var sheetName =
      expectedSheets[i];

    var sheet =
      kidlearnV3_3nbGetSheet_(
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
 * Make copy in same folder.
 */
function kidlearnV3_3nbMakeCopyInSameFolder_(
  sourceFile,
  backupName
) {
  var parents =
    sourceFile.getParents();

  if (parents.hasNext()) {
    var parent =
      parents.next();

    return sourceFile.makeCopy(
      backupName,
      parent
    );
  }

  return sourceFile.makeCopy(
    backupName
  );
}


/**
 * Check safe modes.
 */
function kidlearnV3_3nbCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3nbSafeWriteStatus_();

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
    kidlearnV3_3nbControlledWriteStatus_();

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
function kidlearnV3_3nbGetExpectedSheets_() {
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
    typeof kidlearnV3_3naGetExpectedSheets_ === 'function'
  ) {
    return kidlearnV3_3naGetExpectedSheets_();
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
function kidlearnV3_3nbGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3nbResolveSpreadsheet_(
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
function kidlearnV3_3nbResolveSpreadsheet_(value) {
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
function kidlearnV3_3nbGetSheet_(
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
 * Safe call.
 */
function kidlearnV3_3nbSafeCall_(functionName) {
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
        error: 'Missing function'
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
      output:
        kidlearnV3_3nbSummarizeOutput_(
          output
        )
    };

  } catch (error) {
    return {
      success: false,
      available: true,
      functionName: functionName,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Safe assert.
 */
function kidlearnV3_3nbSafeAssert_(
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
          'Thiếu function ' + functionName
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
function kidlearnV3_3nbSafeWriteStatus_() {
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
function kidlearnV3_3nbControlledWriteStatus_() {
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
function kidlearnV3_3nbCheckFunctions_(names) {
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
 * Summarize output.
 */
function kidlearnV3_3nbSummarizeOutput_(output) {
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
    candidateId: output.candidateId || '',
    nextBundle: output.nextBundle || '',
    nextStage: output.nextStage || '',
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0
  };
}


/**
 * Save plan.
 */
function kidlearnV3_3nbSavePlan_(plan) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PROD_PLAN_3NB_KEYS.LAST_PLAN_JSON,
      JSON.stringify(plan)
    );
}


/**
 * Save result.
 */
function kidlearnV3_3nbSaveResult_(
  result,
  status,
  dateKey
) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_PLAN_3NB_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_PLAN_3NB_STATUS.READY_FOR_3N_C &&
    (
      status === KIDLEARN_V3_PROD_PLAN_3NB_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_PLAN_3NB_STATUS.PLAN_GENERATED ||
      status === KIDLEARN_V3_PROD_PLAN_3NB_STATUS.BACKUP_CREATED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_PLAN_3NB_STATUS.READY_FOR_3N_C;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_PLAN_3NB_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_PLAN_3NB_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      candidateId: result.candidateId || '',
      backupFileId: result.backupFileId || '',
      backupFileUrl: result.backupFileUrl || '',
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
function kidlearnV3_3nbReadJsonProperty_(key) {
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


/**
 * Normalize options.
 */
function kidlearnV3_3nbNormalizeOptions_(options) {
  if (!options) {
    return {};
  }

  if (typeof options !== 'object') {
    return {
      value: options
    };
  }

  return options;
}


/**
 * Backup timestamp.
 */
function kidlearnV3_3nbMakeBackupTimestamp_() {
  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyyMMdd_HHmmss'
  );
}