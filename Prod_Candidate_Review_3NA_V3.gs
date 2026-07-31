/**
 * ================================================================
 * KIDLEARN V3 - PROD CANDIDATE REVIEW / FREEZE DEV CANDIDATE
 * Bundle: 3N-A
 * Version: 3.1.0
 * ================================================================
 *
 * 3N-A:
 * - Chỉ freeze DEV candidate bằng manifest.
 * - Không deploy PROD.
 * - Không copy PROD.
 * - Không real write.
 * - Không rollback.
 * - Không migration.
 * - Không create/delete sheet.
 * - Chỉ ghi ScriptProperties để lưu candidate manifest/status.
 */


var KIDLEARN_V3_PROD_REVIEW_3NA_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3NA_STATUS',
  CANDIDATE_ID: 'KIDLEARN_V3_PHASE_3NA_CANDIDATE_ID',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3NA_LAST_PREVIEW_AT',
  LAST_MANIFEST_AT: 'KIDLEARN_V3_PHASE_3NA_LAST_MANIFEST_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3NA_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3NA_LAST_RESULT_JSON',
  LAST_MANIFEST_JSON: 'KIDLEARN_V3_PHASE_3NA_LAST_MANIFEST_JSON'
};


var KIDLEARN_V3_PROD_REVIEW_3NA_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  MANIFEST_GENERATED: 'MANIFEST_GENERATED',
  READY_FOR_3N_B: 'READY_FOR_3N_B',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_REVIEW_3NA_CONFIG = {
  VERSION: '3N-A',
  PHASE: '3N-A',
  NEXT_BUNDLE: '3N-B',
  NEXT_STAGE: 'PROD_BACKUP_AND_DEPLOY_PLAN',
  EXPECTED_SHEET_COUNT: 44,
  WRITE_MODE: 'NO_DB_WRITE',
  REAL_WRITE_ALLOWED: false
};


/**
 * Preview 3N-A.
 */
function kidlearnV3_previewProdCandidateReview3NAV3() {
  var errors = [];
  var warnings = [];

  var functionChecks =
    kidlearnV3_3naCheckFunctions_([
      'kidlearnV3_assertProdCandidateChecklist3MDReadyV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_appGetActiveDatabaseV3_',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors =
    errors.concat(functionChecks.errors);

  var optionalChecks =
    kidlearnV3_3naCheckFunctions_([
      'kidlearnV3_getProdCandidateChecklist3MDStatusV3',
      'kidlearnV3_getQaAsync3MAStatusV3',
      'kidlearnV3_getPerformanceBaseline3MBStatusV3',
      'kidlearnV3_getSecurityRoleGuard3MCStatusV3',
      'kidlearnV3_getPhase3LCloseStatusV3',
      'kidlearnV3_getControlledWriteDevStatusV3'
    ]);

  if (optionalChecks.errors.length > 0) {
    warnings =
      warnings.concat(
        optionalChecks.errors.map(function(item) {
          return 'Optional warning: ' + item;
        })
      );
  }

  var phase3MD =
    kidlearnV3_3naSafeAssert_(
      'kidlearnV3_assertProdCandidateChecklist3MDReadyV3',
      '3M-D'
    );

  if (!phase3MD.success) {
    errors.push(
      '3M-D chưa READY_FOR_PROD_CANDIDATE_REVIEW: ' +
      phase3MD.message
    );
  }

  var safeModes =
    kidlearnV3_3naCheckSafeModes_();

  errors =
    errors.concat(safeModes.errors);

  warnings =
    warnings.concat(safeModes.warnings);

  var dbSummary = null;

  try {
    dbSummary =
      kidlearnV3_3naBuildDatabaseSummary_();

    if (
      dbSummary.expectedSheetCount !==
      KIDLEARN_V3_PROD_REVIEW_3NA_CONFIG.EXPECTED_SHEET_COUNT
    ) {
      warnings.push(
        'Expected sheet count không phải 44. Actual=' +
        dbSummary.expectedSheetCount
      );
    }

    if (dbSummary.missingSheetCount > 0) {
      errors.push(
        'Thiếu V3 sheet trong DEV candidate. Missing=' +
        dbSummary.missingSheetCount
      );
    }

  } catch (error) {
    errors.push(
      'Không build được database summary 3N-A: ' +
      String(error.message || error)
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_CANDIDATE_REVIEW_3NA_V3',
    bundle: '3N-A',
    phase: KIDLEARN_V3_PROD_REVIEW_3NA_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_REVIEW_3NA_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_REVIEW_3NA_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_REVIEW_3NA_CONFIG.WRITE_MODE,
    realWriteAllowed: false,
    prodDeployNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3MD: phase3MD,
    safeModes: safeModes,
    databaseSummary: dbSummary,
    functionChecks: functionChecks.items,
    optionalChecks: optionalChecks.items,
    note:
      '3N-A chỉ tạo manifest và freeze DEV candidate. Chưa deploy PROD.'
  };

  kidlearnV3_3naSaveResult_(
    result,
    KIDLEARN_V3_PROD_REVIEW_3NA_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_REVIEW_3NA_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Generate PROD candidate manifest.
 */
function kidlearnV3_generateProdCandidateManifest3NAV3() {
  var startedAt =
    new Date();

  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdCandidateReview3NAV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate manifest 3N-A vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var candidateId =
    kidlearnV3_3naMakeCandidateId_();

  var spreadsheet =
    kidlearnV3_3naGetDatabaseSpreadsheet_();

  var phaseStatuses =
    kidlearnV3_3naCollectPhaseStatuses_();

  var databaseSummary =
    kidlearnV3_3naBuildDatabaseSummary_();

  var safeModes =
    kidlearnV3_3naCheckSafeModes_();

  errors =
    errors.concat(safeModes.errors);

  warnings =
    warnings.concat(safeModes.warnings);

  var releaseNotes =
    kidlearnV3_3naBuildReleaseNotes_();

  var finishedAt =
    new Date();

  var manifest = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_CANDIDATE_MANIFEST_3NA_V3',
    bundle: '3N-A',
    phase: KIDLEARN_V3_PROD_REVIEW_3NA_CONFIG.PHASE,
    candidateId: candidateId,
    candidateStatus:
      errors.length === 0
        ? 'DEV_CANDIDATE_FROZEN'
        : 'DEV_CANDIDATE_HOLD',
    prodDeployNow: false,
    realWriteAllowed: false,
    writeMode: KIDLEARN_V3_PROD_REVIEW_3NA_CONFIG.WRITE_MODE,
    generatedAt:
      finishedAt.toISOString(),
    generatedFrom: {
      spreadsheetId: spreadsheet.getId(),
      spreadsheetName: spreadsheet.getName(),
      spreadsheetUrl: spreadsheet.getUrl()
    },
    versionInfo:
      kidlearnV3_3naBuildVersionInfo_(),
    phaseStatuses: phaseStatuses,
    databaseSummary: databaseSummary,
    safeModes: safeModes.summary,
    releaseNotes: releaseNotes,
    manualRequirementsBeforeProd: [
      'Tạo backup DEV candidate.',
      'Review DATA_UserChildAccess thật, không dùng DEV fallback.',
      'Review master lesson/question/content.',
      'Chuẩn bị PROD deployment plan riêng.',
      'Không deploy PROD bằng 3N-A.'
    ],
    startedAt:
      startedAt.toISOString(),
    finishedAt:
      finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() - startedAt.getTime(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_3naSaveManifest_(
    manifest
  );

  kidlearnV3_3naSaveResult_(
    manifest,
    manifest.success
      ? KIDLEARN_V3_PROD_REVIEW_3NA_STATUS.MANIFEST_GENERATED
      : KIDLEARN_V3_PROD_REVIEW_3NA_STATUS.FAILED,
    KIDLEARN_V3_PROD_REVIEW_3NA_KEYS.LAST_MANIFEST_AT
  );

  console.log(JSON.stringify(manifest, null, 2));

  if (!manifest.success) {
    throw new Error(
      'Generate PROD candidate manifest 3N-A failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return manifest;
}


/**
 * Mark 3N-A ready.
 */
function kidlearnV3_markProdCandidateReview3NAReadyV3() {
  var status =
    kidlearnV3_getProdCandidateReview3NAStatusV3();

  var errors = [];

  if (
    status.status !==
      KIDLEARN_V3_PROD_REVIEW_3NA_STATUS.MANIFEST_GENERATED &&
    status.status !==
      KIDLEARN_V3_PROD_REVIEW_3NA_STATUS.READY_FOR_3N_B
  ) {
    errors.push(
      '3N-A chưa có manifest generated. Status=' +
      status.status
    );
  }

  if (
    !status.lastManifest ||
    status.lastManifest.success !== true
  ) {
    errors.push(
      'Last manifest chưa success=true.'
    );
  }

  var safeModes =
    kidlearnV3_3naCheckSafeModes_();

  errors =
    errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3N-A ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_CANDIDATE_REVIEW_3NA_READY_V3',
    bundle: '3N-A',
    phase: KIDLEARN_V3_PROD_REVIEW_3NA_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_REVIEW_3NA_STATUS.READY_FOR_3N_B,
    candidateId:
      status.candidateId || '',
    nextBundle:
      KIDLEARN_V3_PROD_REVIEW_3NA_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_REVIEW_3NA_CONFIG.NEXT_STAGE,
    prodDeployNow: false,
    message:
      'DEV V3 candidate đã được freeze bằng manifest. Bước tiếp theo là 3N-B Backup & PROD deployment plan.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3naSaveResult_(
    result,
    KIDLEARN_V3_PROD_REVIEW_3NA_STATUS.READY_FOR_3N_B,
    KIDLEARN_V3_PROD_REVIEW_3NA_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3N-A status.
 */
function kidlearnV3_getProdCandidateReview3NAStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_CANDIDATE_REVIEW_3NA_STATUS_V3',
    bundle: '3N-A',
    phase: KIDLEARN_V3_PROD_REVIEW_3NA_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_REVIEW_3NA_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_REVIEW_3NA_STATUS.NOT_RUN,
    candidateId:
      properties.getProperty(
        KIDLEARN_V3_PROD_REVIEW_3NA_KEYS.CANDIDATE_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_REVIEW_3NA_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastManifestAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_REVIEW_3NA_KEYS.LAST_MANIFEST_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_REVIEW_3NA_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3naReadJsonProperty_(
        KIDLEARN_V3_PROD_REVIEW_3NA_KEYS.LAST_RESULT_JSON
      ),
    lastManifest:
      kidlearnV3_3naReadJsonProperty_(
        KIDLEARN_V3_PROD_REVIEW_3NA_KEYS.LAST_MANIFEST_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3N-A ready.
 */
function kidlearnV3_assertProdCandidateReview3NAReadyV3() {
  var status =
    kidlearnV3_getProdCandidateReview3NAStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_REVIEW_3NA_STATUS.READY_FOR_3N_B
  ) {
    errors.push(
      '3N-A chưa READY_FOR_3N_B. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_CANDIDATE_REVIEW_3NA_READY_V3',
    bundle: '3N-A',
    phase: KIDLEARN_V3_PROD_REVIEW_3NA_CONFIG.PHASE,
    status: status.status,
    candidateId: status.candidateId || '',
    nextBundle:
      KIDLEARN_V3_PROD_REVIEW_3NA_CONFIG.NEXT_BUNDLE,
    prodDeployNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3N-A chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3N-A.
 */
function kidlearnV3_getQaBatchSteps3NAV3() {
  return [
    {
      label: 'Assert 3M-D ready',
      functionName: 'kidlearnV3_assertProdCandidateChecklist3MDReadyV3'
    },
    {
      label: 'Preview PROD Candidate Review 3N-A',
      functionName: 'kidlearnV3_previewProdCandidateReview3NAV3'
    },
    {
      label: 'Generate PROD Candidate Manifest 3N-A',
      functionName: 'kidlearnV3_generateProdCandidateManifest3NAV3'
    },
    {
      label: 'Mark PROD Candidate Review 3N-A Ready',
      functionName: 'kidlearnV3_markProdCandidateReview3NAReadyV3'
    },
    {
      label: 'Assert PROD Candidate Review 3N-A Ready',
      functionName: 'kidlearnV3_assertProdCandidateReview3NAReadyV3'
    }
  ];
}


/**
 * QA batch 3N-A.
 */
function kidlearnV3_runQaBatch3NAV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3N_A_PROD_CANDIDATE_REVIEW',
    kidlearnV3_getQaBatchSteps3NAV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build database summary.
 */
function kidlearnV3_3naBuildDatabaseSummary_() {
  var spreadsheet =
    kidlearnV3_3naGetDatabaseSpreadsheet_();

  var expectedSheets =
    kidlearnV3_3naGetExpectedSheets_();

  var items = [];
  var missing = [];

  for (var i = 0; i < expectedSheets.length; i++) {
    var sheetName =
      expectedSheets[i];

    var sheet =
      kidlearnV3_3naGetSheet_(
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
 * Collect phase statuses.
 */
function kidlearnV3_3naCollectPhaseStatuses_() {
  return {
    phase3J:
      kidlearnV3_3naSafeCall_('kidlearnV3_getPhase3JCloseStatusV3'),
    phase3K:
      kidlearnV3_3naSafeCall_('kidlearnV3_getPhase3KCloseStatusV3'),
    phase3L:
      kidlearnV3_3naSafeCall_('kidlearnV3_getPhase3LCloseStatusV3'),
    phase3MA:
      kidlearnV3_3naSafeCall_('kidlearnV3_getQaAsync3MAStatusV3'),
    phase3MB:
      kidlearnV3_3naSafeCall_('kidlearnV3_getPerformanceBaseline3MBStatusV3'),
    phase3MC:
      kidlearnV3_3naSafeCall_('kidlearnV3_getSecurityRoleGuard3MCStatusV3'),
    phase3MD:
      kidlearnV3_3naSafeCall_('kidlearnV3_getProdCandidateChecklist3MDStatusV3')
  };
}


/**
 * Build version info.
 */
function kidlearnV3_3naBuildVersionInfo_() {
  var info = {
    appVersion: '',
    schemaVersion: '',
    environment: '',
    generatedAt: new Date().toISOString()
  };

  try {
    if (typeof KIDLEARN_V3 !== 'undefined') {
      info.appVersion =
        KIDLEARN_V3.APP_VERSION || '';
      info.schemaVersion =
        KIDLEARN_V3.SCHEMA_VERSION || '';
    }
  } catch (error) {
    info.warning =
      String(error.message || error);
  }

  try {
    var properties =
      PropertiesService.getScriptProperties();

    info.environment =
      properties.getProperty('KIDLEARN_V3_ENVIRONMENT') || '';
  } catch (ignore) {}

  return info;
}


/**
 * Build release notes.
 */
function kidlearnV3_3naBuildReleaseNotes_() {
  return [
    'V3 DEV schema gồm 44 sheets.',
    'Legacy V2 đã được giữ riêng dưới dạng LEGACY_V2_* nếu có.',
    'Safe Write mặc định DRY_RUN.',
    'Real write chỉ được bật bằng controlled gate trong DEV.',
    'UI Shell 3L-A hỗ trợ CHILD và FAMILY_ADMIN.',
    'Lesson content 3L-B render read-only/optimized.',
    'Learning interaction 3L-C chỉ DRY_RUN.',
    'QA Async 3M-A dùng trigger/chunk để tránh timeout.',
    '3N-A không deploy PROD.'
  ];
}


/**
 * Check safe modes.
 */
function kidlearnV3_3naCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3naSafeWriteStatus_();

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
    kidlearnV3_3naControlledWriteStatus_();

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
function kidlearnV3_3naGetExpectedSheets_() {
  try {
    if (
      typeof KIDLEARN_V3_SHEET_ORDER !== 'undefined' &&
      KIDLEARN_V3_SHEET_ORDER &&
      KIDLEARN_V3_SHEET_ORDER.length
    ) {
      return KIDLEARN_V3_SHEET_ORDER.slice();
    }
  } catch (error) {}

  if (typeof kidlearnV3_3mdGetExpectedSheets_ === 'function') {
    return kidlearnV3_3mdGetExpectedSheets_();
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
function kidlearnV3_3naGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3naResolveSpreadsheet_(
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
function kidlearnV3_3naResolveSpreadsheet_(value) {
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
    return SpreadsheetApp.openById(value.spreadsheetId);
  }

  if (value.databaseSpreadsheetId) {
    return SpreadsheetApp.openById(value.databaseSpreadsheetId);
  }

  if (
    value.id &&
    typeof value.id === 'string'
  ) {
    return SpreadsheetApp.openById(value.id);
  }

  return null;
}


/**
 * Get exact sheet.
 */
function kidlearnV3_3naGetSheet_(spreadsheet, sheetName) {
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
function kidlearnV3_3naSafeCall_(functionName) {
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
      output: kidlearnV3_3naSummarizeOutput_(output)
    };

  } catch (error) {
    return {
      success: false,
      available: true,
      functionName: functionName,
      error: String(error.message || error)
    };
  }
}


/**
 * Summarize output.
 */
function kidlearnV3_3naSummarizeOutput_(output) {
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
    nextPhase: output.nextPhase || '',
    nextStage: output.nextStage || '',
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0,
    progressPercent: output.progressPercent || ''
  };
}


/**
 * Safe assert helper.
 */
function kidlearnV3_3naSafeAssert_(functionName, label) {
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

    var result =
      fn();

    return {
      success:
        result && result.success === true,
      label: label,
      message:
        result && result.success === true
          ? ''
          : JSON.stringify(result)
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
function kidlearnV3_3naSafeWriteStatus_() {
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
function kidlearnV3_3naControlledWriteStatus_() {
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
function kidlearnV3_3naCheckFunctions_(names) {
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
 * Make candidate ID.
 */
function kidlearnV3_3naMakeCandidateId_() {
  var text =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    );

  return 'KIDLEARN_V3_PROD_CANDIDATE_' + text;
}


/**
 * Save manifest.
 */
function kidlearnV3_3naSaveManifest_(manifest) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_REVIEW_3NA_KEYS.CANDIDATE_ID,
    manifest.candidateId
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_REVIEW_3NA_KEYS.LAST_MANIFEST_JSON,
    JSON.stringify(manifest)
  );
}


/**
 * Save result.
 */
function kidlearnV3_3naSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_REVIEW_3NA_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_REVIEW_3NA_STATUS.READY_FOR_3N_B &&
    (
      status === KIDLEARN_V3_PROD_REVIEW_3NA_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_REVIEW_3NA_STATUS.MANIFEST_GENERATED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_REVIEW_3NA_STATUS.READY_FOR_3N_B;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_REVIEW_3NA_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_REVIEW_3NA_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      candidateId: result.candidateId || '',
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
function kidlearnV3_3naReadJsonProperty_(key) {
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