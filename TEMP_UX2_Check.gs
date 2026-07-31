function TEMP_UX2_checkSpreadsheetName() {
  var spreadsheet =
    SpreadsheetApp.getActive();

  var name =
    spreadsheet.getName();

  var result = {
    success: true,
    action: 'TEMP_UX2_CHECK_SPREADSHEET_NAME',
    spreadsheetName: name,
    hasDEVInName:
      String(name).toUpperCase().indexOf('DEV') !== -1,
    checkedAt:
      new Date().toISOString()
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}

function TEMP_UX2_previewEnvironment() {
  var result =
    kidlearnV3_previewEnvironment();

  console.log(JSON.stringify(result, null, 2));

  return result;
}

/**
 * ================================================================
 * UX2-0C — Baseline Phase Status Audit
 * File: TEMP_UX2_Check.gs
 * ================================================================
 *
 * Purpose:
 * - Audit DEV environment after restore.
 * - Check 4H / 4I / 4J / 4K status safely.
 * - Do not lock, do not write learning data.
 */


function TEMP_UX2_getFunction_(functionName) {
  var root =
    typeof globalThis !== 'undefined'
      ? globalThis
      : this;

  if (
    root &&
    typeof root[functionName] === 'function'
  ) {
    return root[functionName];
  }

  try {
    var fn =
      eval(functionName);

    if (typeof fn === 'function') {
      return fn;
    }
  } catch (error) {
    // Function does not exist.
  }

  return null;
}


function TEMP_UX2_extractStatus_(result) {
  if (!result) {
    return '';
  }

  if (typeof result === 'string') {
    return result;
  }

  var fields = [
    'status',
    'currentStatus',
    'phaseStatus',
    'lockStatus',
    'mvpStatus',
    'phase4HStatus',
    'phase4IStatus',
    'phase4JStatus',
    'phase4KStatus'
  ];

  for (var i = 0; i < fields.length; i++) {
    if (
      result[fields[i]] !== undefined &&
      result[fields[i]] !== null
    ) {
      return String(result[fields[i]]);
    }
  }

  return '';
}


function TEMP_UX2_safeCall_(label, functionName) {
  var fn =
    TEMP_UX2_getFunction_(functionName);

  if (!fn) {
    return {
      label: label,
      functionName: functionName,
      exists: false,
      success: false,
      status: '',
      error: 'FUNCTION_NOT_FOUND'
    };
  }

  try {
    var result =
      fn();

    return {
      label: label,
      functionName: functionName,
      exists: true,
      success: true,
      status: TEMP_UX2_extractStatus_(result),
      result: result
    };

  } catch (error) {
    return {
      label: label,
      functionName: functionName,
      exists: true,
      success: false,
      status: '',
      error:
        String(
          error && error.message
            ? error.message
            : error
        )
    };
  }
}


/**
 * Main audit function.
 * Run this function from Apps Script Editor.
 */
function TEMP_UX2_auditBaselinePhaseStatus() {
  var checks = [
    {
      label: 'ENVIRONMENT',
      functionName: 'kidlearnV3_previewEnvironment'
    },
    {
      label: 'PHASE_4H',
      functionName: 'kidlearnV3_getPhase4HLockStatusV3'
    },
    {
      label: 'PHASE_4I',
      functionName: 'kidlearnV3_getPhase4ILockStatusV3'
    },
    {
      label: 'PHASE_4J',
      functionName: 'kidlearnV3_getParentAssignmentManagement4JStatusV3'
    },
    {
      label: 'PHASE_4K',
      functionName: 'kidlearnV3_getMvpFinalLockStatus4KV3'
    }
  ];

  var results = [];
  var summary = {};
  var errors = [];
  var warnings = [];

  for (var i = 0; i < checks.length; i++) {
    var item =
      checks[i];

    var callResult =
      TEMP_UX2_safeCall_(
        item.label,
        item.functionName
      );

    results.push(callResult);

    summary[item.label] = {
      exists: callResult.exists,
      success: callResult.success,
      status: callResult.status || '',
      error: callResult.error || ''
    };

    if (!callResult.exists) {
      warnings.push(
        item.label +
        ': Không tìm thấy function ' +
        item.functionName
      );
    }

    if (
      callResult.exists &&
      callResult.success === false
    ) {
      warnings.push(
        item.label +
        ': Function chạy lỗi: ' +
        callResult.error
      );
    }
  }

  var result = {
    success: true,
    action: 'TEMP_UX2_AUDIT_BASELINE_PHASE_STATUS',
    phase: 'UX2-0C',
    note:
      'Audit only. No lock. No learning data write. No Drive write.',
    summary: summary,
    results: results,
    warningCount: warnings.length,
    errorCount: errors.length,
    warnings: warnings,
    errors: errors,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    checkedAt: new Date().toISOString()
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Optional: list important phase functions that exist/miss.
 * Run this if we need to know exact function names available in this backup.
 */
function TEMP_UX2_listPhaseFunctions() {
  var knownFunctions = [
    'kidlearnV3_previewEnvironment',
    'kidlearnV3_registerDevEnvironmentNoUi',

    'kidlearnV3_getPhase4HLockStatusV3',
    'kidlearnV3_previewPhase4HLockV3',
    'kidlearnV3_runPhase4HFinalQaV3',
    'kidlearnV3_lockPhase4HConfirmV3',
    'kidlearnV3_assertPhase4HClosedLockedV3',

    'kidlearnV3_getPhase4ILockStatusV3',
    'kidlearnV3_previewPhase4ILockV3',
    'kidlearnV3_runPhase4IFinalQaV3',
    'kidlearnV3_lockPhase4IConfirmV3',
    'kidlearnV3_assertPhase4IClosedLockedV3',

    'kidlearnV3_getParentAssignmentManagement4JStatusV3',
    'kidlearnV3_previewParentAssignmentManagement4JV3',
    'kidlearnV3_markParentAssignmentManagement4JReadyV3',
    'kidlearnV3_assertParentAssignmentManagement4JReadyV3',

    'kidlearnV3_getMvpFinalLockStatus4KV3',
    'kidlearnV3_previewMvpFinalLock4KV3',
    'kidlearnV3_runMvpFinalQa4KV3',
    'kidlearnV3_lockMvpFinalConfirm4KV3',
    'kidlearnV3_assertMvpFinalLocked4KV3'
  ];

  var rows = [];

  for (var i = 0; i < knownFunctions.length; i++) {
    var functionName =
      knownFunctions[i];

    rows.push({
      functionName: functionName,
      exists:
        TEMP_UX2_getFunction_(functionName) ? true : false
    });
  }

  var result = {
    success: true,
    action: 'TEMP_UX2_LIST_PHASE_FUNCTIONS',
    phase: 'UX2-0C',
    rows: rows,
    checkedAt: new Date().toISOString()
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}

/**
 * ================================================================
 * UX2-0D1 — Re-establish Phase 4H Lock
 * File: TEMP_UX2_Check.gs
 * ================================================================
 *
 * Purpose:
 * - Restore Phase 4H status after backup/restore.
 * - Run one phase at a time.
 * - Do not touch UI.
 *
 * Note:
 * - Lock function may write ScriptProperties status only.
 * - It must not write learning data or Drive.
 */


function TEMP_UX2_0D1_callStep_(label, functionName) {
  try {
    var root =
      typeof globalThis !== 'undefined'
        ? globalThis
        : this;

    var fn =
      root && typeof root[functionName] === 'function'
        ? root[functionName]
        : null;

    if (!fn) {
      try {
        fn = eval(functionName);
      } catch (errorEval) {
        fn = null;
      }
    }

    if (typeof fn !== 'function') {
      return {
        success: false,
        label: label,
        functionName: functionName,
        error: 'FUNCTION_NOT_FOUND',
        actualSheetWritePerformed: false,
        actualDriveWritePerformed: false
      };
    }

    var result =
      fn();

    var output = {
      success: true,
      label: label,
      functionName: functionName,
      result: result,
      actualSheetWritePerformed:
        result && result.actualSheetWritePerformed === true,
      actualDriveWritePerformed:
        result && result.actualDriveWritePerformed === true,
      checkedAt: new Date().toISOString()
    };

    console.log(JSON.stringify(output, null, 2));

    return output;

  } catch (error) {
    var failed = {
      success: false,
      label: label,
      functionName: functionName,
      error:
        String(
          error && error.message
            ? error.message
            : error
        ),
      actualSheetWritePerformed: false,
      actualDriveWritePerformed: false,
      checkedAt: new Date().toISOString()
    };

    console.log(JSON.stringify(failed, null, 2));

    return failed;
  }
}


function TEMP_UX2_4H_status_before() {
  return TEMP_UX2_0D1_callStep_(
    '4H_STATUS_BEFORE',
    'kidlearnV3_getPhase4HLockStatusV3'
  );
}


function TEMP_UX2_4H_preview() {
  return TEMP_UX2_0D1_callStep_(
    '4H_PREVIEW',
    'kidlearnV3_previewPhase4HLockV3'
  );
}


function TEMP_UX2_4H_finalQa() {
  return TEMP_UX2_0D1_callStep_(
    '4H_FINAL_QA',
    'kidlearnV3_runPhase4HFinalQaV3'
  );
}


function TEMP_UX2_4H_lockConfirm() {
  return TEMP_UX2_0D1_callStep_(
    '4H_LOCK_CONFIRM',
    'kidlearnV3_lockPhase4HConfirmV3'
  );
}


function TEMP_UX2_4H_status_after() {
  return TEMP_UX2_0D1_callStep_(
    '4H_STATUS_AFTER',
    'kidlearnV3_getPhase4HLockStatusV3'
  );
}

/**
 * ================================================================
 * UX2-0D0 — Audit Phase 4G Restore Path
 * File: TEMP_UX2_Check.gs
 * ================================================================
 *
 * Purpose:
 * - Check if Phase 4G functions exist.
 * - Check 4G current status.
 * - Do not lock.
 * - Do not write learning data.
 */


function TEMP_UX2_4G_safeGetFunction_(functionName) {
  var root =
    typeof globalThis !== 'undefined'
      ? globalThis
      : this;

  if (
    root &&
    typeof root[functionName] === 'function'
  ) {
    return root[functionName];
  }

  try {
    var fn =
      eval(functionName);

    if (typeof fn === 'function') {
      return fn;
    }
  } catch (error) {
    // Function does not exist.
  }

  return null;
}


function TEMP_UX2_4G_safeCall_(label, functionName) {
  var fn =
    TEMP_UX2_4G_safeGetFunction_(functionName);

  if (!fn) {
    var missing = {
      success: false,
      label: label,
      functionName: functionName,
      exists: false,
      error: 'FUNCTION_NOT_FOUND',
      actualSheetWritePerformed: false,
      actualDriveWritePerformed: false
    };

    console.log(JSON.stringify(missing, null, 2));

    return missing;
  }

  try {
    var result =
      fn();

    var output = {
      success: true,
      label: label,
      functionName: functionName,
      exists: true,
      result: result,
      status:
        result && result.status
          ? result.status
          : (
            result && result.currentStatus
              ? result.currentStatus
              : ''
          ),
      actualSheetWritePerformed:
        result && result.actualSheetWritePerformed === true,
      actualDriveWritePerformed:
        result && result.actualDriveWritePerformed === true,
      checkedAt:
        new Date().toISOString()
    };

    console.log(JSON.stringify(output, null, 2));

    return output;

  } catch (error) {
    var failed = {
      success: false,
      label: label,
      functionName: functionName,
      exists: true,
      error:
        String(
          error && error.message
            ? error.message
            : error
        ),
      actualSheetWritePerformed: false,
      actualDriveWritePerformed: false,
      checkedAt:
        new Date().toISOString()
    };

    console.log(JSON.stringify(failed, null, 2));

    return failed;
  }
}


function TEMP_UX2_list4GFunctions() {
  var functionNames = [
    'kidlearnV3_getPhase4GLockStatusV3',
    'kidlearnV3_previewPhase4GLockV3',
    'kidlearnV3_runPhase4GFinalQaV3',
    'kidlearnV3_lockPhase4GConfirmV3',
    'kidlearnV3_assertPhase4GClosedLockedV3',

    'kidlearnV3_getParentDashboard4GStatusV3',
    'kidlearnV3_previewParentDashboard4G2V3',
    'kidlearnV3_markParentDashboard4G2ReadyV3',

    'kidlearnV3_getParentSubjectProgress4GStatusV3',
    'kidlearnV3_previewParentSubjectProgress4G3V3',
    'kidlearnV3_markParentSubjectProgress4G3ReadyV3',

    'kidlearnV3_getParentActivityTimeline4GStatusV3',
    'kidlearnV3_previewParentActivityTimeline4G4V3',
    'kidlearnV3_markParentActivityTimeline4G4ReadyV3'
  ];

  var rows = [];

  for (var i = 0; i < functionNames.length; i++) {
    var name =
      functionNames[i];

    rows.push({
      functionName: name,
      exists:
        TEMP_UX2_4G_safeGetFunction_(name) ? true : false
    });
  }

  var result = {
    success: true,
    action: 'TEMP_UX2_LIST_4G_FUNCTIONS',
    phase: 'UX2-0D0',
    rows: rows,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    checkedAt: new Date().toISOString()
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


function TEMP_UX2_4G_status() {
  return TEMP_UX2_4G_safeCall_(
    '4G_STATUS',
    'kidlearnV3_getPhase4GLockStatusV3'
  );
}


function TEMP_UX2_4G_preview() {
  return TEMP_UX2_4G_safeCall_(
    '4G_PREVIEW',
    'kidlearnV3_previewPhase4GLockV3'
  );
}


/**
 * Optional: check ScriptProperties keys related to 4G/4H.
 * This reads properties only.
 */
function TEMP_UX2_listPhaseProperties_4G_4H() {
  var props =
    PropertiesService
      .getScriptProperties()
      .getProperties();

  var keys =
    Object.keys(props).sort();

  var rows =
    keys
      .filter(function (key) {
        var upper =
          String(key).toUpperCase();

        return (
          upper.indexOf('4G') !== -1 ||
          upper.indexOf('4H') !== -1 ||
          upper.indexOf('PHASE') !== -1 ||
          upper.indexOf('LOCK') !== -1
        );
      })
      .map(function (key) {
        return {
          key: key,
          value: props[key]
        };
      });

  var result = {
    success: true,
    action: 'TEMP_UX2_LIST_PHASE_PROPERTIES_4G_4H',
    phase: 'UX2-0D0',
    count: rows.length,
    rows: rows,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    checkedAt: new Date().toISOString()
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}

/**
 * ================================================================
 * UX2-0D-4EF — Compact Audit Phase 4E / 4F
 * File: TEMP_UX2_Check.gs
 * ================================================================
 *
 * Purpose:
 * - Audit Phase 4E / 4F after restore.
 * - Compact output only.
 * - No lock.
 * - No learning data write.
 * - No Drive write.
 */


function TEMP_UX2_4EF_getFunction_(functionName) {
  var root =
    typeof globalThis !== 'undefined'
      ? globalThis
      : this;

  if (
    root &&
    typeof root[functionName] === 'function'
  ) {
    return root[functionName];
  }

  try {
    var fn =
      eval(functionName);

    if (typeof fn === 'function') {
      return fn;
    }
  } catch (error) {
    // Not found.
  }

  return null;
}


function TEMP_UX2_4EF_extractStatus_(result) {
  if (!result) {
    return '';
  }

  if (typeof result === 'string') {
    return result;
  }

  var fields = [
    'status',
    'currentStatus',
    'phaseStatus',
    'lockStatus',
    'reviewStatus'
  ];

  for (var i = 0; i < fields.length; i++) {
    if (
      result[fields[i]] !== undefined &&
      result[fields[i]] !== null
    ) {
      return String(result[fields[i]]);
    }
  }

  return '';
}


function TEMP_UX2_4EF_compactResult_(result) {
  if (!result) {
    return null;
  }

  return {
    success:
      result.success === true,
    action:
      result.action || '',
    phase:
      result.phase || '',
    status:
      TEMP_UX2_4EF_extractStatus_(result),
    errorCount:
      result.errorCount || 0,
    warningCount:
      result.warningCount || 0,
    errors:
      Array.isArray(result.errors)
        ? result.errors.slice(0, 12)
        : [],
    warnings:
      Array.isArray(result.warnings)
        ? result.warnings.slice(0, 12)
        : [],
    actualSheetWritePerformed:
      result.actualSheetWritePerformed === true,
    actualLearningDataWritePerformed:
      result.actualLearningDataWritePerformed === true,
    actualDriveWritePerformed:
      result.actualDriveWritePerformed === true
  };
}


function TEMP_UX2_4EF_safeCallCompact_(label, functionName) {
  var fn =
    TEMP_UX2_4EF_getFunction_(functionName);

  if (!fn) {
    return {
      label: label,
      functionName: functionName,
      exists: false,
      success: false,
      status: '',
      error: 'FUNCTION_NOT_FOUND',
      actualSheetWritePerformed: false,
      actualDriveWritePerformed: false
    };
  }

  try {
    var result =
      fn();

    return {
      label: label,
      functionName: functionName,
      exists: true,
      success: true,
      status:
        TEMP_UX2_4EF_extractStatus_(result),
      compactResult:
        TEMP_UX2_4EF_compactResult_(result),
      actualSheetWritePerformed:
        result && result.actualSheetWritePerformed === true,
      actualDriveWritePerformed:
        result && result.actualDriveWritePerformed === true,
      checkedAt:
        new Date().toISOString()
    };

  } catch (error) {
    return {
      label: label,
      functionName: functionName,
      exists: true,
      success: false,
      status: '',
      error:
        String(
          error && error.message
            ? error.message
            : error
        ),
      actualSheetWritePerformed: false,
      actualDriveWritePerformed: false,
      checkedAt:
        new Date().toISOString()
    };
  }
}


function TEMP_UX2_audit4E4FCompact() {
  var functions = [
    /**
     * Phase 4E candidates.
     */
    'kidlearnV3_getPhase4ELockStatusV3',
    'kidlearnV3_previewPhase4ELockV3',
    'kidlearnV3_runPhase4EFinalQaV3',
    'kidlearnV3_lockPhase4EConfirmV3',
    'kidlearnV3_assertPhase4EClosedLockedV3',

    /**
     * Phase 4F candidates.
     */
    'kidlearnV3_getPhase4FLockStatusV3',
    'kidlearnV3_previewPhase4FLockV3',
    'kidlearnV3_runPhase4FFinalQaV3',
    'kidlearnV3_lockPhase4FConfirmV3',
    'kidlearnV3_assertPhase4FClosedLockedV3',

    /**
     * Possible 4F sub-step candidates.
     * Some names may not exist in this backup. That is okay.
     */
    'kidlearnV3_getParentReviewActionUi4FStatusV3',
    'kidlearnV3_previewParentReviewActionUi4F2V3',
    'kidlearnV3_markParentReviewActionUi4F2ReadyV3',
    'kidlearnV3_getParentReviewActionWrite4FStatusV3',
    'kidlearnV3_previewParentReviewActionWrite4F3V3',
    'kidlearnV3_markParentReviewActionWrite4F3ReadyV3',
    'kidlearnV3_getChildRetryFlow4FStatusV3',
    'kidlearnV3_previewChildRetryFlow4F4V3',
    'kidlearnV3_markChildRetryFlow4F4ReadyV3'
  ];

  var rows = [];

  for (var i = 0; i < functions.length; i++) {
    rows.push({
      functionName:
        functions[i],
      exists:
        TEMP_UX2_4EF_getFunction_(functions[i]) ? true : false
    });
  }

  var statusChecks = [
    {
      label: '4E_STATUS',
      functionName: 'kidlearnV3_getPhase4ELockStatusV3'
    },
    {
      label: '4F_STATUS',
      functionName: 'kidlearnV3_getPhase4FLockStatusV3'
    }
  ];

  var statusResults = [];

  for (var j = 0; j < statusChecks.length; j++) {
    statusResults.push(
      TEMP_UX2_4EF_safeCallCompact_(
        statusChecks[j].label,
        statusChecks[j].functionName
      )
    );
  }

  var result = {
    success: true,
    action: 'TEMP_UX2_AUDIT_4E_4F_COMPACT',
    phase: 'UX2-0D-4EF',
    functionRows: rows,
    statusResults: statusResults,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    checkedAt: new Date().toISOString()
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


function TEMP_UX2_4F_previewCompact() {
  var result =
    TEMP_UX2_4EF_safeCallCompact_(
      '4F_PREVIEW',
      'kidlearnV3_previewPhase4FLockV3'
    );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


function TEMP_UX2_4E_previewCompact() {
  var result =
    TEMP_UX2_4EF_safeCallCompact_(
      '4E_PREVIEW',
      'kidlearnV3_previewPhase4ELockV3'
    );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


function TEMP_UX2_listPhaseProperties_4E_4F_Compact() {
  var props =
    PropertiesService
      .getScriptProperties()
      .getProperties();

  var keys =
    Object.keys(props).sort();

  var rows =
    keys
      .filter(function (key) {
        var upper =
          String(key).toUpperCase();

        return (
          upper.indexOf('4E') !== -1 ||
          upper.indexOf('4F') !== -1 ||
          upper.indexOf('PHASE') !== -1 ||
          upper.indexOf('LOCK') !== -1
        );
      })
      .map(function (key) {
        var value =
          String(props[key] || '');

        return {
          key: key,
          valuePreview:
            value.length > 600
              ? value.slice(0, 600) + '...TRUNCATED'
              : value
        };
      });

  var result = {
    success: true,
    action: 'TEMP_UX2_LIST_PHASE_PROPERTIES_4E_4F_COMPACT',
    phase: 'UX2-0D-4EF',
    count: rows.length,
    rows: rows,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    checkedAt: new Date().toISOString()
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}