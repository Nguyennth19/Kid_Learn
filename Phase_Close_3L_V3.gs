/**
 * ================================================================
 * KIDLEARN V3 - PHASE 3L POST REVIEW & CLOSE
 * Bundle: 3L-D
 * Step:
 * - 3L-D: Post-review and close Phase 3L
 * Version: 3.1.0
 * ================================================================
 *
 * 3L-D:
 * - Không ghi dữ liệu học tập thật
 * - Không real write
 * - Không rollback
 * - Không migration
 * - QA batch không tự close phase
 * - Close Phase 3L phải chạy riêng
 */


var KIDLEARN_V3_PHASE_3LD_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3LD_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3LD_LAST_PREVIEW_AT',
  LAST_REVIEW_AT: 'KIDLEARN_V3_PHASE_3LD_LAST_REVIEW_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3LD_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3LD_LAST_RESULT_JSON',

  PHASE_3L_CLOSE_STATUS: 'KIDLEARN_V3_PHASE_3L_CLOSE_STATUS',
  PHASE_3L_CLOSED_AT: 'KIDLEARN_V3_PHASE_3L_CLOSED_AT',
  PHASE_3L_NEXT_PHASE: 'KIDLEARN_V3_PHASE_3L_NEXT_PHASE',
  PHASE_3L_CLOSE_RESULT_JSON: 'KIDLEARN_V3_PHASE_3L_CLOSE_RESULT_JSON'
};


var KIDLEARN_V3_PHASE_3LD_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  REVIEW_PASSED: 'REVIEW_PASSED',
  READY_TO_CLOSE_3L: 'READY_TO_CLOSE_3L',
  CLOSED: 'CLOSED',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PHASE_3LD_CONFIG = {
  VERSION: '3L-D',
  PHASE: '3L-D',
  PHASE_GROUP: '3L',
  NEXT_PHASE: '3M',
  CLOSE_STATUS: 'CLOSED_LOCKED',
  WRITE_MODE: 'DRY_RUN_ONLY'
};


var KIDLEARN_V3_PHASE_3LD_TARGET_SHEETS = [
  'LOG_Audit',
  'DATA_StudySessions',
  'DATA_LessonProgress',
  'DATA_DailyGoals',
  'DATA_Assignments'
];


/**
 * Preview 3L-D.
 */
function kidlearnV3_previewPhase3LClose3LDV3() {
  var errors = [];
  var warnings = [];

  var functionChecks =
    kidlearnV3_3ldCheckFunctions_([
      'kidlearnV3_assertAppShell3LAReadyV3',
      'kidlearnV3_assertLessonContent3LBReadyV3',
      'kidlearnV3_assertLearningInteraction3LCReadyV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_appGetActiveDatabaseV3_',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors =
    errors.concat(
      functionChecks.errors
    );

  var phase3LA =
    kidlearnV3_3ldSafeAssert_(
      'kidlearnV3_assertAppShell3LAReadyV3',
      '3L-A'
    );

  var phase3LB =
    kidlearnV3_3ldSafeAssert_(
      'kidlearnV3_assertLessonContent3LBReadyV3',
      '3L-B'
    );

  var phase3LC =
    kidlearnV3_3ldSafeAssert_(
      'kidlearnV3_assertLearningInteraction3LCReadyV3',
      '3L-C'
    );

  if (!phase3LA.success) {
    errors.push(
      '3L-A chưa READY_FOR_3L_B: ' +
      phase3LA.message
    );
  }

  if (!phase3LB.success) {
    errors.push(
      '3L-B chưa READY_FOR_3L_C: ' +
      phase3LB.message
    );
  }

  if (!phase3LC.success) {
    errors.push(
      '3L-C chưa READY_FOR_3L_D: ' +
      phase3LC.message
    );
  }

  var safeWrite =
    kidlearnV3_3ldSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      '3L-D yêu cầu Safe Write DRY_RUN/enabled=false. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var controlledWrite =
    kidlearnV3_3ldControlledWriteStatus_();

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    errors.push(
      'Controlled Write vẫn ENABLED. Không được close Phase 3L.'
    );
  }

  var sheetSummary = null;

  try {
    sheetSummary =
      kidlearnV3_3ldGetTargetSheetRowSummary_();
  } catch (error) {
    warnings.push(
      'Không lấy được target sheet summary: ' +
      String(error.message || error)
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PHASE_3L_CLOSE_3LD_V3',
    bundle: '3L-D',
    phase: KIDLEARN_V3_PHASE_3LD_CONFIG.PHASE,
    phaseGroup: KIDLEARN_V3_PHASE_3LD_CONFIG.PHASE_GROUP,
    nextPhase: KIDLEARN_V3_PHASE_3LD_CONFIG.NEXT_PHASE,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    closeIncludedInBatch: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3LA: phase3LA,
    phase3LB: phase3LB,
    phase3LC: phase3LC,
    safeWriteStatus: safeWrite,
    controlledWriteStatus: controlledWrite,
    functionChecks: functionChecks.items,
    targetSheetSummary: sheetSummary
  };

  kidlearnV3_3ldSaveResult_(
    result,
    KIDLEARN_V3_PHASE_3LD_STATUS.PREVIEWED,
    KIDLEARN_V3_PHASE_3LD_KEYS.LAST_PREVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Post-review Phase 3L.
 */
function kidlearnV3_runPostReviewPhase3L3LDV3() {
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewPhase3LClose3LDV3();

  if (!preview.success) {
    throw new Error(
      'Không thể post-review 3L-D vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var status3LA =
    kidlearnV3_3ldReadStatusProperty_(
      'KIDLEARN_V3_PHASE_3LA_STATUS'
    );

  var status3LB =
    kidlearnV3_3ldReadStatusProperty_(
      'KIDLEARN_V3_PHASE_3LB_STATUS'
    );

  var status3LC =
    kidlearnV3_3ldReadStatusProperty_(
      'KIDLEARN_V3_PHASE_3LC_STATUS'
    );

  if (status3LA !== 'READY_FOR_3L_B') {
    errors.push(
      'Property 3L-A status phải READY_FOR_3L_B. Hiện tại=' +
      status3LA
    );
  }

  if (status3LB !== 'READY_FOR_3L_C') {
    errors.push(
      'Property 3L-B status phải READY_FOR_3L_C. Hiện tại=' +
      status3LB
    );
  }

  if (status3LC !== 'READY_FOR_3L_D') {
    errors.push(
      'Property 3L-C status phải READY_FOR_3L_D. Hiện tại=' +
      status3LC
    );
  }

  var safeWrite =
    kidlearnV3_3ldSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Post-review Phase 3L yêu cầu Safe Write DRY_RUN/enabled=false.'
    );
  }

  var controlledWrite =
    kidlearnV3_3ldControlledWriteStatus_();

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    errors.push(
      'Controlled Write vẫn ENABLED trong post-review Phase 3L.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'RUN_POST_REVIEW_PHASE_3L_3LD_V3',
    bundle: '3L-D',
    phase: KIDLEARN_V3_PHASE_3LD_CONFIG.PHASE,
    decision:
      errors.length === 0
        ? 'READY_TO_CLOSE_PHASE_3L'
        : 'HOLD_PHASE_3L',
    canClosePhase3L:
      errors.length === 0,
    writeMode: 'DRY_RUN_ONLY',
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phaseStatuses: {
      phase3LA: status3LA,
      phase3LB: status3LB,
      phase3LC: status3LC
    },
    safeWriteStatus: safeWrite,
    controlledWriteStatus: controlledWrite,
    reviewedAt:
      new Date().toISOString()
  };

  kidlearnV3_3ldSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_PHASE_3LD_STATUS.REVIEW_PASSED
      : KIDLEARN_V3_PHASE_3LD_STATUS.FAILED,
    KIDLEARN_V3_PHASE_3LD_KEYS.LAST_REVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Post-review Phase 3L failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 3L-D ready to close Phase 3L.
 */
function kidlearnV3_markPhase3LReadyToClose3LDV3() {
  var review =
    kidlearnV3_runPostReviewPhase3L3LDV3();

  if (!review.success) {
    throw new Error(
      'Không thể mark READY_TO_CLOSE_3L vì post-review chưa pass.'
    );
  }

  var result = {
    success: true,
    action: 'MARK_PHASE_3L_READY_TO_CLOSE_3LD_V3',
    bundle: '3L-D',
    phase: KIDLEARN_V3_PHASE_3LD_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PHASE_3LD_STATUS.READY_TO_CLOSE_3L,
    nextManualStep:
      'kidlearnV3_closePhase3LV3',
    nextPhase:
      KIDLEARN_V3_PHASE_3LD_CONFIG.NEXT_PHASE,
    message:
      'Phase 3L đã ready to close. Hãy chạy close riêng bằng kidlearnV3_closePhase3LV3.'
  };

  kidlearnV3_3ldSaveResult_(
    result,
    KIDLEARN_V3_PHASE_3LD_STATUS.READY_TO_CLOSE_3L,
    KIDLEARN_V3_PHASE_3LD_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3L-D ready to close.
 */
function kidlearnV3_assertPhase3LReadyToClose3LDV3() {
  var status =
    kidlearnV3_getPhase3LDStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PHASE_3LD_STATUS.READY_TO_CLOSE_3L &&
    status.status !== KIDLEARN_V3_PHASE_3LD_STATUS.CLOSED
  ) {
    errors.push(
      '3L-D chưa READY_TO_CLOSE_3L/CLOSED. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PHASE_3L_READY_TO_CLOSE_3LD_V3',
    bundle: '3L-D',
    phase: KIDLEARN_V3_PHASE_3LD_CONFIG.PHASE,
    status: status.status,
    nextManualStep:
      'kidlearnV3_closePhase3LV3',
    errorCount: errors.length,
    errors: errors
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3L-D chưa ready to close. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Close Phase 3L.
 *
 * Chạy riêng, không đưa vào QA batch.
 */
function kidlearnV3_closePhase3LV3() {
  var ready =
    kidlearnV3_assertPhase3LReadyToClose3LDV3();

  if (!ready.success) {
    throw new Error(
      'Không thể close Phase 3L vì 3L-D chưa ready.'
    );
  }

  var safeWrite =
    kidlearnV3_3ldSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    throw new Error(
      'Không thể close Phase 3L khi Safe Write chưa DRY_RUN/enabled=false.'
    );
  }

  var controlledWrite =
    kidlearnV3_3ldControlledWriteStatus_();

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    throw new Error(
      'Không thể close Phase 3L khi Controlled Write còn ENABLED.'
    );
  }

  var now =
    new Date();

  var closeResult = {
    success: true,
    action: 'CLOSE_PHASE_3L_V3',
    phase: '3L',
    closedByBundle: '3L-D',
    status:
      KIDLEARN_V3_PHASE_3LD_CONFIG.CLOSE_STATUS,
    closedAt:
      now.toISOString(),
    nextPhase:
      KIDLEARN_V3_PHASE_3LD_CONFIG.NEXT_PHASE,
    summary: {
      phase3LA: 'READY_FOR_3L_B',
      phase3LB: 'READY_FOR_3L_C',
      phase3LC: 'READY_FOR_3L_D',
      phase3LD: 'READY_TO_CLOSE_3L',
      safeWriteMode:
        safeWrite.mode,
      safeWriteEnabled:
        safeWrite.enabled,
      controlledWriteStatus:
        controlledWrite.status || '',
      realWriteAllowed:
        false,
      prodTouched:
        false
    }
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PHASE_3LD_KEYS.PHASE_3L_CLOSE_STATUS,
    KIDLEARN_V3_PHASE_3LD_CONFIG.CLOSE_STATUS
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE_3LD_KEYS.PHASE_3L_CLOSED_AT,
    now.toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE_3LD_KEYS.PHASE_3L_NEXT_PHASE,
    KIDLEARN_V3_PHASE_3LD_CONFIG.NEXT_PHASE
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE_3LD_KEYS.PHASE_3L_CLOSE_RESULT_JSON,
    JSON.stringify(closeResult)
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE_3LD_KEYS.STATUS,
    KIDLEARN_V3_PHASE_3LD_STATUS.CLOSED
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE_3LD_KEYS.LAST_RESULT_JSON,
    JSON.stringify(closeResult)
  );

  console.log(
    JSON.stringify(closeResult, null, 2)
  );

  return closeResult;
}


/**
 * Get Phase 3L close status.
 */
function kidlearnV3_getPhase3LCloseStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PHASE_3L_CLOSE_STATUS_V3',
    phase: '3L',
    status:
      properties.getProperty(
        KIDLEARN_V3_PHASE_3LD_KEYS.PHASE_3L_CLOSE_STATUS
      ) ||
      'NOT_CLOSED',
    closedAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE_3LD_KEYS.PHASE_3L_CLOSED_AT
      ) ||
      '',
    nextPhase:
      properties.getProperty(
        KIDLEARN_V3_PHASE_3LD_KEYS.PHASE_3L_NEXT_PHASE
      ) ||
      '',
    closeResult:
      kidlearnV3_3ldReadJsonProperty_(
        KIDLEARN_V3_PHASE_3LD_KEYS.PHASE_3L_CLOSE_RESULT_JSON
      ),
    phase3LD:
      kidlearnV3_getPhase3LDStatusV3(),
    safeWriteStatus:
      kidlearnV3_3ldSafeWriteStatus_(),
    controlledWriteStatus:
      kidlearnV3_3ldControlledWriteStatus_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert Phase 3L closed.
 */
function kidlearnV3_assertPhase3LClosedV3() {
  var status =
    kidlearnV3_getPhase3LCloseStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PHASE_3LD_CONFIG.CLOSE_STATUS
  ) {
    errors.push(
      'Phase 3L chưa CLOSED_LOCKED. Status=' +
      status.status
    );
  }

  if (status.nextPhase !== '3M') {
    errors.push(
      'Next phase phải là 3M. Hiện tại=' +
      status.nextPhase
    );
  }

  var safeWrite =
    status.safeWriteStatus || {};

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Sau khi close 3L, Safe Write phải DRY_RUN/enabled=false.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PHASE_3L_CLOSED_V3',
    phase: '3L',
    status: status.status,
    nextPhase: status.nextPhase,
    errorCount: errors.length,
    errors: errors,
    safeWriteStatus: safeWrite
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Phase 3L chưa close đúng. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Get 3L-D status.
 */
function kidlearnV3_getPhase3LDStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PHASE_3LD_STATUS_V3',
    bundle: '3L-D',
    phase: KIDLEARN_V3_PHASE_3LD_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PHASE_3LD_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PHASE_3LD_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE_3LD_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastReviewAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE_3LD_KEYS.LAST_REVIEW_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE_3LD_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3ldReadJsonProperty_(
        KIDLEARN_V3_PHASE_3LD_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * QA steps 3L-D.
 *
 * Không chứa close phase.
 */
function kidlearnV3_getQaBatchSteps3LDV3() {
  return [
    {
      label: 'Assert 3L-C ready',
      functionName: 'kidlearnV3_assertLearningInteraction3LCReadyV3'
    },
    {
      label: 'Preview Phase 3L Close 3L-D',
      functionName: 'kidlearnV3_previewPhase3LClose3LDV3'
    },
    {
      label: 'Post-review Phase 3L 3L-D',
      functionName: 'kidlearnV3_runPostReviewPhase3L3LDV3'
    },
    {
      label: 'Mark Phase 3L Ready To Close 3L-D',
      functionName: 'kidlearnV3_markPhase3LReadyToClose3LDV3'
    },
    {
      label: 'Assert Phase 3L Ready To Close 3L-D',
      functionName: 'kidlearnV3_assertPhase3LReadyToClose3LDV3'
    }
  ];
}


/**
 * QA batch 3L-D.
 */
function kidlearnV3_runQaBatch3LDV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3L_D_CLOSE_READY',
    kidlearnV3_getQaBatchSteps3LDV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Target sheet row summary.
 */
function kidlearnV3_3ldGetTargetSheetRowSummary_() {
  var spreadsheet =
    kidlearnV3_3ldGetDatabaseSpreadsheet_();

  var items = [];

  for (
    var i = 0;
    i < KIDLEARN_V3_PHASE_3LD_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_PHASE_3LD_TARGET_SHEETS[i];

    var sheet =
      kidlearnV3_3ldGetSheet_(
        spreadsheet,
        sheetName
      );

    items.push({
      sheetName: sheetName,
      exists: sheet ? true : false,
      lastRow:
        sheet ? sheet.getLastRow() : 0,
      lastColumn:
        sheet ? sheet.getLastColumn() : 0
    });
  }

  return {
    success: true,
    capturedAt:
      new Date().toISOString(),
    items: items
  };
}


/**
 * Database spreadsheet.
 */
function kidlearnV3_3ldGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3ldResolveSpreadsheet_(
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
function kidlearnV3_3ldResolveSpreadsheet_(value) {
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
function kidlearnV3_3ldGetSheet_(
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
 * Safe assert helper.
 */
function kidlearnV3_3ldSafeAssert_(
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
function kidlearnV3_3ldSafeWriteStatus_() {
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
function kidlearnV3_3ldControlledWriteStatus_() {
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
      safeWriteMode: '',
      safeWriteEnabled: false,
      error:
        'Missing kidlearnV3_getControlledWriteDevStatusV3'
    };

  } catch (error) {
    return {
      available: false,
      success: false,
      status: '',
      safeWriteMode: '',
      safeWriteEnabled: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Check functions.
 */
function kidlearnV3_3ldCheckFunctions_(names) {
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
 * Save result.
 */
function kidlearnV3_3ldSaveResult_(
  result,
  status,
  dateKey
) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PHASE_3LD_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus === KIDLEARN_V3_PHASE_3LD_STATUS.READY_TO_CLOSE_3L &&
    (
      status === KIDLEARN_V3_PHASE_3LD_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PHASE_3LD_STATUS.REVIEW_PASSED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PHASE_3LD_STATUS.READY_TO_CLOSE_3L;
  }

  if (
    currentStatus === KIDLEARN_V3_PHASE_3LD_STATUS.CLOSED
  ) {
    finalStatus =
      KIDLEARN_V3_PHASE_3LD_STATUS.CLOSED;
  }

  properties.setProperty(
    KIDLEARN_V3_PHASE_3LD_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PHASE_3LD_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      decision: result.decision || '',
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      errors: result.errors || [],
      warnings: result.warnings || [],
      at: new Date().toISOString()
    })
  );
}


/**
 * Read status property.
 */
function kidlearnV3_3ldReadStatusProperty_(key) {
  return (
    PropertiesService
      .getScriptProperties()
      .getProperty(key) ||
    ''
  );
}


/**
 * Read JSON property.
 */
function kidlearnV3_3ldReadJsonProperty_(key) {
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