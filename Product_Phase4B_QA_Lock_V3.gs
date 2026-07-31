/**
 * ================================================================
 * KIDLEARN V3 - PHASE 4B QA + LOCK
 * Step: 4B-3
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Final QA for Phase 4B.
 * - Lock Child Home + Course Dashboard + UI Revision.
 * - Prepare for Phase 4C.
 *
 * Safety:
 * - Không ghi Google Sheet dữ liệu học.
 * - Không ghi PROD.
 * - Không deploy.
 * - Chỉ ghi ScriptProperties trạng thái lock.
 */


var KIDLEARN_V3_PHASE_4B_LOCK_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4B_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4B_LAST_PREVIEW_AT',
  LAST_QA_AT: 'KIDLEARN_V3_PHASE_4B_LAST_QA_AT',
  LAST_LOCK_AT: 'KIDLEARN_V3_PHASE_4B_LAST_LOCK_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4B_LAST_RESULT_JSON'
};


var KIDLEARN_V3_PHASE_4B_LOCK_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  QA_PASSED: 'QA_PASSED',
  PHASE_4B_CLOSED_LOCKED: 'PHASE_4B_CLOSED_LOCKED',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PHASE_4B_LOCK_CONFIG = {
  PHASE: '4B',
  LOCK_STEP: '4B-3',
  LOCK_NAME: 'CHILD_HOME_AND_COURSE_DASHBOARD_LOCK',
  NEXT_PHASE: '4C',
  NEXT_STAGE: 'SUBJECT_DASHBOARD_AND_LESSON_PLAYER',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false
};


/**
 * Preview 4B lock readiness.
 */
function kidlearnV3_previewPhase4BLockV3() {
  var errors = [];
  var warnings = [];

  var checks = kidlearnV3_4bLockBuildChecks_();

  for (var i = 0; i < checks.length; i++) {
    var check = checks[i];

    if (!check.success && check.required) {
      errors.push(check.label + ': ' + check.message);
    } else if (!check.success) {
      warnings.push(check.label + ': ' + check.message);
    }
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PHASE_4B_LOCK_V3',
    phase: KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.PHASE,
    lockStep: KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.LOCK_STEP,
    lockName: KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.LOCK_NAME,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PHASE_4B_LOCK_STATUS.PREVIEWED
        : KIDLEARN_V3_PHASE_4B_LOCK_STATUS.FAILED,
    nextPhase: KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.NEXT_PHASE,
    nextStage: KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    checkCount: checks.length,
    checks: checks,
    lockedScope: [
      'Child Home dashboard',
      'Course dashboard',
      'Subject cards',
      'Next lesson card',
      'Full screen login',
      'Blue design identity',
      'Color contrast patch',
      'Built-in SVG subject icons',
      'Asset folder and registry plan',
      'UI polish review accepted at 85%'
    ],
    deferredBacklog: [
      'Approved asset loading from Google Drive / MST_MediaAssets',
      'Mascot and hero illustrations',
      'Reward badge visual system',
      'Lesson player UI',
      'Subject detail dashboard',
      'Tablet/mobile polish',
      'Micro-animation polish'
    ],
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4bLockSaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PHASE_4B_LOCK_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4B lock preview failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Run final QA before lock.
 *
 * Revised 4B-3:
 * - Không gọi lại smoke test cũ vì smoke cũ có thể ghi lùi status.
 * - Chỉ dùng preview/assert/marker checks hiện tại.
 * - Phù hợp với trạng thái UI đã được review và accepted ở 4B-2R-6.
 */
function kidlearnV3_runPhase4BFinalQaV3() {
  var preview =
    kidlearnV3_previewPhase4BLockV3();

  var errors = [];
  var warnings = [];

  if (!preview.success) {
    errors.push('Preview 4B lock chưa pass.');
  }

  var stabilityChecks = [
    {
      label: '4B-2R-6 UI Polish Review Ready',
      functionName: 'kidlearnV3_assertUiPolishReview4B2R6ReadyV3',
      required: true
    },
    {
      label: '4B-2 Original UI Markers',
      functionName: 'kidlearnV3_checkUiMarkers4B2V3',
      required: true
    },
    {
      label: 'Login Full Screen Markers',
      functionName: 'kidlearnV3_checkLoginFullScreen4B2RV3',
      required: true
    },
    {
      label: 'Blue Design Token Markers',
      functionName: 'kidlearnV3_checkBlueDesignTokens4B2R3V3',
      required: true
    },
    {
      label: 'Color Contrast Patch Markers',
      functionName: 'kidlearnV3_checkColorContrastPatch4B2R3PV3',
      required: true
    },
    {
      label: 'SVG Subject Icon Markers',
      functionName: 'kidlearnV3_checkSubjectSvgIcons4B2R4V3',
      required: true
    }
  ];

  var stabilityResults = [];

  for (var i = 0; i < stabilityChecks.length; i++) {
    var check =
      kidlearnV3_4bLockSafeCheck_(
        stabilityChecks[i].label,
        stabilityChecks[i].functionName,
        stabilityChecks[i].required
      );

    stabilityResults.push(check);

    if (!check.success && check.required) {
      errors.push(check.label + ': ' + check.message);
    } else if (!check.success) {
      warnings.push(check.label + ': ' + check.message);
    }
  }

  var result = {
    success: errors.length === 0,
    action: 'RUN_PHASE_4B_FINAL_QA_V3',
    phase: KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.PHASE,
    lockStep: KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.LOCK_STEP,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PHASE_4B_LOCK_STATUS.QA_PASSED
        : KIDLEARN_V3_PHASE_4B_LOCK_STATUS.FAILED,
    qaMode:
      'ASSERT_AND_MARKER_ONLY_NO_LEGACY_SMOKE_REPLAY',
    nextPhase: KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.NEXT_PHASE,
    nextStage: KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    preview: {
      success: preview.success,
      errorCount: preview.errorCount,
      warningCount: preview.warningCount
    },
    stabilityResults: stabilityResults,
    skippedLegacySmokeTests: [
      'kidlearnV3_smokeTestProductUiUpgrade4B2V3',
      'kidlearnV3_smokeTestLoginFullScreen4B2RV3',
      'kidlearnV3_smokeTestBlueDesignTokens4B2R3V3',
      'kidlearnV3_smokeTestSubjectSvgIcons4B2R4V3'
    ],
    skipReason:
      'Legacy smoke tests can downgrade historical READY statuses. Final lock uses current asserts and marker checks instead.',
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4bLockSaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PHASE_4B_LOCK_KEYS.LAST_QA_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4B final QA failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Public confirm wrapper.
 * Dùng để lock 4B sau khi QA pass.
 */
function kidlearnV3_lockPhase4BConfirmV3() {
  return kidlearnV3_lockPhase4BV3({
    confirm: 'LOCK_PHASE_4B_CHILD_HOME_COURSE_DASHBOARD',
    acceptedVisualScorePercent: 85,
    reviewerDecision: 'ACCEPT_AND_LOCK_PHASE_4B',
    note:
      'Phase 4B accepted at 85% visual quality. Further polish will continue in future UI backlog.'
  });
}


/**
 * Lock Phase 4B.
 */
function kidlearnV3_lockPhase4BV3(options) {
  options = options || {};

  var confirmText =
    String(options.confirm || '')
      .trim()
      .toUpperCase();

  if (
    confirmText !==
    'LOCK_PHASE_4B_CHILD_HOME_COURSE_DASHBOARD'
  ) {
    throw new Error(
      'Thiếu confirm. Cần confirm=LOCK_PHASE_4B_CHILD_HOME_COURSE_DASHBOARD'
    );
  }

  var qa =
    kidlearnV3_runPhase4BFinalQaV3();

  if (!qa.success) {
    throw new Error('Final QA 4B chưa pass.');
  }

  var score =
    Number(options.acceptedVisualScorePercent || 0);

  if (isNaN(score) || score < 85) {
    throw new Error(
      'Visual score cần >= 85 để lock Phase 4B. Current=' +
      score
    );
  }

  var result = {
    success: true,
    action: 'LOCK_PHASE_4B_V3',
    phase: KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.PHASE,
    lockStep: KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.LOCK_STEP,
    lockName: KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.LOCK_NAME,
    status:
      KIDLEARN_V3_PHASE_4B_LOCK_STATUS.PHASE_4B_CLOSED_LOCKED,
    acceptedVisualScorePercent: score,
    reviewerDecision:
      String(options.reviewerDecision || ''),
    note:
      String(options.note || ''),
    finalMode:
      'PHASE_4B_CHILD_HOME_COURSE_DASHBOARD_CLOSED_LOCKED',
    nextPhase:
      KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    lockedScope: [
      '4B-1 Child Home + Course Context Read-only',
      '4B-2 Product UI Upgrade',
      '4B-2R-2 Full screen login',
      '4B-2R-3 Blue design tokens',
      '4B-2R-3P Color contrast and pastel cards patch',
      '4B-2R-4 Built-in SVG cute subject icons',
      '4B-2R-5 Asset folder and registry plan',
      '4B-2R-6 UI polish review'
    ],
    nextRecommendedAction:
      'Start Phase 4C — Subject Dashboard + Lesson Player.',
    lockedAt:
      new Date().toISOString()
  };

  kidlearnV3_4bLockSaveStatus_(
    result,
    KIDLEARN_V3_PHASE_4B_LOCK_STATUS.PHASE_4B_CLOSED_LOCKED,
    KIDLEARN_V3_PHASE_4B_LOCK_KEYS.LAST_LOCK_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get Phase 4B status.
 */
function kidlearnV3_getPhase4BLockStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PHASE_4B_LOCK_STATUS_V3',
    phase: KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.PHASE,
    lockStep: KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.LOCK_STEP,
    status:
      properties.getProperty(
        KIDLEARN_V3_PHASE_4B_LOCK_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PHASE_4B_LOCK_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE_4B_LOCK_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastQaAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE_4B_LOCK_KEYS.LAST_QA_AT
      ) || '',
    lastLockAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE_4B_LOCK_KEYS.LAST_LOCK_AT
      ) || '',
    lastResult:
      kidlearnV3_4bLockReadJsonProperty_(
        KIDLEARN_V3_PHASE_4B_LOCK_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert Phase 4B closed locked.
 */
function kidlearnV3_assertPhase4BClosedLockedV3() {
  var status =
    kidlearnV3_getPhase4BLockStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PHASE_4B_LOCK_STATUS.PHASE_4B_CLOSED_LOCKED
  ) {
    errors.push(
      'Phase 4B chưa PHASE_4B_CLOSED_LOCKED. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PHASE_4B_CLOSED_LOCKED_V3',
    phase: KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.PHASE,
    status: status.status,
    nextPhase:
      KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(errors.join(' | '));
  }

  return result;
}


/**
 * Alias cho phase sau dùng.
 */
function kidlearnV3_assertPhase4BClosedV3() {
  return kidlearnV3_assertPhase4BClosedLockedV3();
}


/**
 * Full QA batch without final lock.
 */
function kidlearnV3_runQaBatch4B3V3() {
  var preview =
    kidlearnV3_previewPhase4BLockV3();

  var qa =
    kidlearnV3_runPhase4BFinalQaV3();

  var result = {
    success:
      preview.success === true &&
      qa.success === true,
    suiteName:
      'PHASE_4B_3_QA_BEFORE_LOCK',
    phase: '4B-3',
    nextAction:
      'Run kidlearnV3_lockPhase4BConfirmV3 to lock Phase 4B.',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    results: {
      preview: preview.success,
      finalQa: qa.success
    },
    warningCount:
      (preview.warningCount || 0) +
      (qa.warningCount || 0),
    warnings:
      []
        .concat(preview.warnings || [])
        .concat(qa.warnings || [])
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4B-3 QA batch failed.');
  }

  return result;
}


/**
 * Helpers.
 */
function kidlearnV3_4bLockBuildChecks_() {
  return [
    kidlearnV3_4bLockSafeCheck_(
      '4A Product MVP Foundation Closed',
      'kidlearnV3_assertPhase4AClosedV3',
      true
    ),
    kidlearnV3_4bLockSafeCheck_(
      '4B-1 Child Home Course Context Ready',
      'kidlearnV3_assertChildHomeCourseContext4BReadyV3',
      true
    ),
    kidlearnV3_4bLockSafeCheck_(
      '4B-2 Product UI Upgrade Ready',
      'kidlearnV3_assertProductUiUpgrade4B2ReadyV3',
      true
    ),
    kidlearnV3_4bLockSafeCheck_(
      '4B-2R-2 Login Full Screen Ready',
      'kidlearnV3_assertLoginFullScreen4B2RReadyV3',
      true
    ),
    kidlearnV3_4bLockSafeCheck_(
      '4B-2R-3 Blue Design Tokens Ready',
      'kidlearnV3_assertBlueDesignTokens4B2R3ReadyV3',
      true
    ),
    kidlearnV3_4bLockSafeCheck_(
      '4B-2R-3P Color Contrast Patch Ready',
      'kidlearnV3_assertColorContrastPatch4B2R3PReadyV3',
      true
    ),
    kidlearnV3_4bLockSafeCheck_(
      '4B-2R-4 SVG Subject Icons Ready',
      'kidlearnV3_assertSubjectSvgIcons4B2R4ReadyV3',
      true
    ),
    kidlearnV3_4bLockSafeCheck_(
      '4B-2R-5 Asset Folder Registry Plan Ready',
      'kidlearnV3_assertAssetFolderRegistryPlan4B2R5ReadyV3',
      true
    ),
    kidlearnV3_4bLockSafeCheck_(
      '4B-2R-6 UI Polish Review Ready',
      'kidlearnV3_assertUiPolishReview4B2R6ReadyV3',
      true
    ),
    kidlearnV3_4bLockSafeCheck_(
      '4B-2 Original UI Markers',
      'kidlearnV3_checkUiMarkers4B2V3',
      true
    ),
    kidlearnV3_4bLockSafeCheck_(
      'Login Full Screen Markers',
      'kidlearnV3_checkLoginFullScreen4B2RV3',
      true
    ),
    kidlearnV3_4bLockSafeCheck_(
      'Blue Design Token Markers',
      'kidlearnV3_checkBlueDesignTokens4B2R3V3',
      true
    ),
    kidlearnV3_4bLockSafeCheck_(
      'Color Contrast Patch Markers',
      'kidlearnV3_checkColorContrastPatch4B2R3PV3',
      true
    ),
    kidlearnV3_4bLockSafeCheck_(
      'SVG Subject Icon Markers',
      'kidlearnV3_checkSubjectSvgIcons4B2R4V3',
      true
    )
  ];
}


function kidlearnV3_4bLockSafeCheck_(label, functionName, required) {
  try {
    var exists =
      eval(
        'typeof ' +
        functionName +
        ' === "function"'
      );

    if (!exists) {
      return {
        label: label,
        functionName: functionName,
        required: required === true,
        success: false,
        message:
          'Thiếu function ' + functionName
      };
    }

    var fn =
      eval(functionName);

    var output =
      fn();

    return {
      label: label,
      functionName: functionName,
      required: required === true,
      success:
        output && output.success === true,
      message:
        output && output.success === true
          ? 'OK'
          : JSON.stringify(output),
      outputSummary:
        kidlearnV3_4bLockSummarizeOutput_(output)
    };

  } catch (error) {
    return {
      label: label,
      functionName: functionName,
      required: required === true,
      success: false,
      message:
        String(error.message || error)
    };
  }
}


function kidlearnV3_4bLockSummarizeOutput_(output) {
  if (!output) return null;

  return {
    success: output.success === true,
    action: output.action || '',
    phase: output.phase || '',
    status: output.status || '',
    nextBundle: output.nextBundle || '',
    nextPhase: output.nextPhase || '',
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0
  };
}


function kidlearnV3_4bLockSaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PHASE_4B_LOCK_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PHASE_4B_LOCK_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase: result.phase,
      lockStep: result.lockStep || '4B-3',
      status: status,
      lockName:
        KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.LOCK_NAME,
      nextPhase:
        KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.NEXT_PHASE,
      nextStage:
        KIDLEARN_V3_PHASE_4B_LOCK_CONFIG.NEXT_STAGE,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      errors: result.errors || [],
      warnings: result.warnings || [],
      at:
        new Date().toISOString()
    })
  );
}


function kidlearnV3_4bLockReadJsonProperty_(key) {
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