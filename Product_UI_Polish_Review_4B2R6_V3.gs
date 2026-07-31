/**
 * ================================================================
 * KIDLEARN V3 - UI POLISH REVIEW
 * Step: 4B-2R-6
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Review all 4B-2R UI revisions before 4B lock.
 * - Record visual acceptance at current quality level.
 * - Prepare for 4B-3 QA + Lock.
 *
 * Safety:
 * - Không ghi Google Sheet dữ liệu học.
 * - Không ghi PROD.
 * - Không deploy.
 * - Chỉ ghi ScriptProperties trạng thái review UI.
 */


var KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4B2R6_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4B2R6_LAST_PREVIEW_AT',
  LAST_REVIEW_AT: 'KIDLEARN_V3_PHASE_4B2R6_LAST_REVIEW_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4B2R6_LAST_RESULT_JSON'
};


var KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  READY_FOR_4B_3_LOCK: 'READY_FOR_4B_3_LOCK',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG = {
  PHASE: '4B-2R-6',
  PARENT_PHASE: '4B-2R',
  NEXT_BUNDLE: '4B-3',
  NEXT_STAGE: 'QA_AND_4B_LOCK',
  REVIEW_NAME: 'UI_POLISH_REVIEW_BEFORE_4B_LOCK',
  MIN_ACCEPTED_SCORE_PERCENT: 85,
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false
};


/**
 * Preview UI polish review before recording acceptance.
 */
function kidlearnV3_previewUiPolishReview4B2R6V3() {
  var errors = [];
  var warnings = [];
  var checks = [];

  checks.push(
    kidlearnV3_4b2r6SafeCheck_(
      '4B-1 Child Home Course Context Ready',
      'kidlearnV3_assertChildHomeCourseContext4BReadyV3',
      true
    )
  );

  checks.push(
    kidlearnV3_4b2r6SafeCheck_(
      '4B-2 Product UI Upgrade Ready',
      'kidlearnV3_assertProductUiUpgrade4B2ReadyV3',
      true
    )
  );

  checks.push(
    kidlearnV3_4b2r6SafeCheck_(
      '4B-2R-2 Login Full Screen Ready',
      'kidlearnV3_assertLoginFullScreen4B2RReadyV3',
      true
    )
  );

  checks.push(
    kidlearnV3_4b2r6SafeCheck_(
      '4B-2R-3 Blue Design Tokens Ready',
      'kidlearnV3_assertBlueDesignTokens4B2R3ReadyV3',
      true
    )
  );

  checks.push(
    kidlearnV3_4b2r6SafeCheck_(
      '4B-2R-3P Color Contrast Patch Ready',
      'kidlearnV3_assertColorContrastPatch4B2R3PReadyV3',
      true
    )
  );

  checks.push(
    kidlearnV3_4b2r6SafeCheck_(
      '4B-2R-4 SVG Subject Icons Ready',
      'kidlearnV3_assertSubjectSvgIcons4B2R4ReadyV3',
      true
    )
  );

  checks.push(
    kidlearnV3_4b2r6SafeCheck_(
      '4B-2R-5 Asset Folder Registry Plan Ready',
      'kidlearnV3_assertAssetFolderRegistryPlan4B2R5ReadyV3',
      true
    )
  );

  checks.push(
    kidlearnV3_4b2r6SafeCheck_(
      '4B-2 Original UI Markers',
      'kidlearnV3_checkUiMarkers4B2V3',
      true
    )
  );

  checks.push(
    kidlearnV3_4b2r6SafeCheck_(
      'Login Full Screen Markers',
      'kidlearnV3_checkLoginFullScreen4B2RV3',
      true
    )
  );

  checks.push(
    kidlearnV3_4b2r6SafeCheck_(
      'Blue Design Token Markers',
      'kidlearnV3_checkBlueDesignTokens4B2R3V3',
      true
    )
  );

  checks.push(
    kidlearnV3_4b2r6SafeCheck_(
      'Color Contrast Patch Markers',
      'kidlearnV3_checkColorContrastPatch4B2R3PV3',
      true
    )
  );

  checks.push(
    kidlearnV3_4b2r6SafeCheck_(
      'SVG Subject Icon Markers',
      'kidlearnV3_checkSubjectSvgIcons4B2R4V3',
      true
    )
  );

  for (var i = 0; i < checks.length; i++) {
    if (!checks[i].success && checks[i].required) {
      errors.push(
        checks[i].label + ': ' + checks[i].message
      );
    } else if (!checks[i].success) {
      warnings.push(
        checks[i].label + ': ' + checks[i].message
      );
    }
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_UI_POLISH_REVIEW_4B_2R_6_V3',
    phase: KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.PARENT_PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_STATUS.PREVIEWED
        : KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_STATUS.FAILED,
    reviewName:
      KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.REVIEW_NAME,
    nextBundle:
      KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    checkCount: checks.length,
    checks: checks,
    visualReviewExpectation: {
      loginFullScreen: 'PASS',
      childHome: 'PASS_WITH_COLOR_PATCH',
      courseDashboard: 'PASS',
      subjectCards: 'PASS_WITH_PASTEL_AND_SVG',
      subjectPlaceholder: 'PASS',
      acceptedMinimumScorePercent:
        KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.MIN_ACCEPTED_SCORE_PERCENT
    },
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4b2r6SaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_STATUS.PREVIEWED
      : KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_STATUS.FAILED,
    KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4B-2R-6 preview failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Public wrapper.
 * Dùng để ghi nhận review hiện tại:
 * - 4B-2R-3P đạt 85%
 * - Chấp nhận đi tiếp 4B-3 Lock
 */
function kidlearnV3_recordUiPolishReview4B2R6ConfirmV3() {
  return kidlearnV3_recordUiPolishReview4B2R6V3({
    confirm: 'CONFIRM_UI_POLISH_REVIEW_4B2R6',
    scorePercent: 85,
    decision: 'ACCEPT_CURRENT_PHASE_AND_MOVE_TO_4B_3_LOCK',
    reviewerNote:
      'Visual review accepted at 85%. Further polish will move to future UI backlog after 4B lock.'
  });
}


/**
 * Record UI polish review decision.
 */
function kidlearnV3_recordUiPolishReview4B2R6V3(options) {
  options = options || {};

  var confirmText =
    String(options.confirm || '')
      .trim()
      .toUpperCase();

  if (
    confirmText !==
    'CONFIRM_UI_POLISH_REVIEW_4B2R6'
  ) {
    throw new Error(
      'Thiếu confirm. Cần confirm=CONFIRM_UI_POLISH_REVIEW_4B2R6'
    );
  }

  var score =
    Number(options.scorePercent || 0);

  if (
    isNaN(score) ||
    score <
      KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.MIN_ACCEPTED_SCORE_PERCENT
  ) {
    throw new Error(
      'UI score chưa đạt mức tối thiểu ' +
      KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.MIN_ACCEPTED_SCORE_PERCENT +
      '%. Current=' +
      score
    );
  }

  var preview =
    kidlearnV3_previewUiPolishReview4B2R6V3();

  if (!preview.success) {
    throw new Error('Preview 4B-2R-6 chưa pass.');
  }

  var result = {
    success: true,
    action: 'RECORD_UI_POLISH_REVIEW_4B_2R_6_V3',
    phase: KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_STATUS.READY_FOR_4B_3_LOCK,
    reviewName:
      KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.REVIEW_NAME,
    scorePercent: score,
    decision:
      String(options.decision || ''),
    reviewerNote:
      String(options.reviewerNote || ''),
    acceptedForCurrentPhase: true,
    moveFurtherPolishToFutureBacklog: true,
    futureUiBacklog: [
      'Replace hero emoji/visual with approved mascot or illustration.',
      'Use approved Google Drive assets from MST_MediaAssets.',
      'Create badge reward system with unified visual style.',
      'Improve hover and micro-animation after lesson player is ready.',
      'Review responsive layout on tablet and mobile.',
      'Create subject-specific hero illustrations in 4C or 4E.'
    ],
    nextBundle:
      KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    recordedAt:
      new Date().toISOString()
  };

  kidlearnV3_4b2r6SaveStatus_(
    result,
    KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_STATUS.READY_FOR_4B_3_LOCK,
    KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_KEYS.LAST_REVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getUiPolishReview4B2R6StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_UI_POLISH_REVIEW_4B_2R_6_STATUS_V3',
    phase: KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_KEYS.STATUS
      ) ||
      KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastReviewAt:
      properties.getProperty(
        KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_KEYS.LAST_REVIEW_AT
      ) || '',
    lastResult:
      kidlearnV3_4b2r6ReadJsonProperty_(
        KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready for 4B-3 lock.
 */
function kidlearnV3_assertUiPolishReview4B2R6ReadyV3() {
  var status =
    kidlearnV3_getUiPolishReview4B2R6StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_STATUS.READY_FOR_4B_3_LOCK
  ) {
    errors.push(
      '4B-2R-6 chưa READY_FOR_4B_3_LOCK. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_UI_POLISH_REVIEW_4B_2R_6_READY_V3',
    phase: KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.PARENT_PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.NEXT_BUNDLE,
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
 * QA batch 4B-2R-6.
 */
function kidlearnV3_runQaBatch4B2R6V3() {
  var preview =
    kidlearnV3_previewUiPolishReview4B2R6V3();

  var record =
    kidlearnV3_recordUiPolishReview4B2R6ConfirmV3();

  var assertReady =
    kidlearnV3_assertUiPolishReview4B2R6ReadyV3();

  var result = {
    success:
      preview.success === true &&
      record.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4B_2R_6_UI_POLISH_REVIEW',
    phase:
      KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.PHASE,
    nextBundle:
      KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    results: {
      preview: preview.success,
      record: record.success,
      assertReady: assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4B-2R-6 QA failed.');
  }

  return result;
}


/**
 * Helpers.
 */
function kidlearnV3_4b2r6SafeCheck_(label, functionName, required) {
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
        kidlearnV3_4b2r6SummarizeOutput_(output)
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


function kidlearnV3_4b2r6SummarizeOutput_(output) {
  if (!output) return null;

  return {
    success: output.success === true,
    action: output.action || '',
    phase: output.phase || '',
    status: output.status || '',
    nextBundle: output.nextBundle || '',
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0
  };
}


function kidlearnV3_4b2r6SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase: result.phase,
      parentPhase: result.parentPhase || '4B-2R',
      status: status,
      reviewName:
        KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.REVIEW_NAME,
      scorePercent:
        result.scorePercent || '',
      decision:
        result.decision || '',
      nextBundle:
        KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_UI_POLISH_REVIEW_4B2R6_CONFIG.NEXT_STAGE,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      errors: result.errors || [],
      warnings: result.warnings || [],
      at:
        new Date().toISOString()
    })
  );
}


function kidlearnV3_4b2r6ReadJsonProperty_(key) {
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