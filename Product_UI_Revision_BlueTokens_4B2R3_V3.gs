/**
 * ================================================================
 * KIDLEARN V3 - UI REVISION 4B-2R-3
 * Step: Blue Design Token Revision
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Validate blue design token revision before 4B lock.
 *
 * Safety:
 * - Không ghi Google Sheet dữ liệu học.
 * - Không ghi PROD.
 * - Không gọi Safe Write.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4B-2R-3.
 */


var KIDLEARN_V3_UI_REVISION_4B2R3_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4B2R3_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4B2R3_LAST_PREVIEW_AT',
  LAST_SMOKE_AT: 'KIDLEARN_V3_PHASE_4B2R3_LAST_SMOKE_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4B2R3_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4B2R3_LAST_RESULT_JSON'
};


var KIDLEARN_V3_UI_REVISION_4B2R3_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  SMOKE_PASSED: 'SMOKE_PASSED',
  READY_FOR_4B_2R_4: 'READY_FOR_4B_2R_4',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG = {
  PHASE: '4B-2R-3',
  PARENT_PHASE: '4B-2R',
  PREVIOUS_BUNDLE: '4B-2R-2',
  NEXT_BUNDLE: '4B-2R-4',
  NEXT_STAGE: 'BUILT_IN_SVG_CUTE_SUBJECT_ICONS',
  UI_REVISION: 'BLUE_DESIGN_TOKEN_REVISION',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false
};


/**
 * Preview blue design token revision.
 */
function kidlearnV3_previewBlueDesignTokens4B2R3V3() {
  var errors = [];
  var warnings = [];

  var previous =
    kidlearnV3_4b2r3SafeCall_(
      'kidlearnV3_assertLoginFullScreen4B2RReadyV3'
    );

  if (!previous.success) {
    errors.push(
      '4B-2R-2 chưa READY_FOR_4B_2R_3: ' +
      previous.message
    );
  }

  var marker =
    kidlearnV3_4b2r3InspectBlueTokens_();

  errors = errors.concat(marker.errors || []);
  warnings = warnings.concat(marker.warnings || []);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_BLUE_DESIGN_TOKENS_4B_2R_3_V3',
    phase: KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.PARENT_PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_UI_REVISION_4B2R3_STATUS.PREVIEWED
        : KIDLEARN_V3_UI_REVISION_4B2R3_STATUS.FAILED,
    uiRevision:
      KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.UI_REVISION,
    nextBundle:
      KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    markerCheck: marker,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4b2r3SaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_UI_REVISION_4B2R3_STATUS.PREVIEWED
      : KIDLEARN_V3_UI_REVISION_4B2R3_STATUS.FAILED,
    KIDLEARN_V3_UI_REVISION_4B2R3_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4B-2R-3 preview failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Public marker check.
 */
function kidlearnV3_checkBlueDesignTokens4B2R3V3() {
  var result =
    kidlearnV3_4b2r3InspectBlueTokens_();

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      'Blue design token marker check failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Smoke test.
 */
function kidlearnV3_smokeTestBlueDesignTokens4B2R3V3() {
  var errors = [];
  var warnings = [];

  var marker =
    kidlearnV3_4b2r3InspectBlueTokens_();

  errors = errors.concat(marker.errors || []);
  warnings = warnings.concat(marker.warnings || []);

  var previous =
    kidlearnV3_4b2r3SafeCall_(
      'kidlearnV3_assertLoginFullScreen4B2RReadyV3'
    );

  if (!previous.success) {
    errors.push(
      '4B-2R-2 chưa ready: ' +
      previous.message
    );
  }

  var loginMarker =
    kidlearnV3_4b2r3SafeCall_(
      'kidlearnV3_checkLoginFullScreen4B2RV3'
    );

  if (!loginMarker.success) {
    errors.push(
      'Login full screen marker không pass sau khi đổi màu: ' +
      loginMarker.message
    );
  }

  var ui4B2Marker =
    kidlearnV3_4b2r3SafeCall_(
      'kidlearnV3_checkUiMarkers4B2V3'
    );

  if (!ui4B2Marker.success) {
    errors.push(
      'Original 4B-2 marker không pass sau khi đổi màu: ' +
      ui4B2Marker.message
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_BLUE_DESIGN_TOKENS_4B_2R_3_V3',
    phase: KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.PARENT_PHASE,
    uiRevision:
      KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.UI_REVISION,
    markerCheck: marker,
    loginFullScreenCheck: loginMarker.success,
    original4B2MarkerCheck: ui4B2Marker.success,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4b2r3SaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_UI_REVISION_4B2R3_STATUS.SMOKE_PASSED
      : KIDLEARN_V3_UI_REVISION_4B2R3_STATUS.FAILED,
    KIDLEARN_V3_UI_REVISION_4B2R3_KEYS.LAST_SMOKE_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4B-2R-3 smoke failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready.
 */
function kidlearnV3_markBlueDesignTokens4B2R3ReadyV3() {
  var smoke =
    kidlearnV3_smokeTestBlueDesignTokens4B2R3V3();

  if (!smoke.success) {
    throw new Error('Smoke 4B-2R-3 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_BLUE_DESIGN_TOKENS_4B_2R_3_READY_V3',
    phase: KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_UI_REVISION_4B2R3_STATUS.READY_FOR_4B_2R_4,
    nextBundle:
      KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    message:
      'Blue Design Token Revision ready. Có thể qua 4B-2R-4 Built-in SVG Cute Subject Icons.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4b2r3SaveStatus_(
    result,
    KIDLEARN_V3_UI_REVISION_4B2R3_STATUS.READY_FOR_4B_2R_4,
    KIDLEARN_V3_UI_REVISION_4B2R3_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getBlueDesignTokens4B2R3StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_BLUE_DESIGN_TOKENS_4B_2R_3_STATUS_V3',
    phase: KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_UI_REVISION_4B2R3_KEYS.STATUS
      ) ||
      KIDLEARN_V3_UI_REVISION_4B2R3_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_UI_REVISION_4B2R3_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastSmokeAt:
      properties.getProperty(
        KIDLEARN_V3_UI_REVISION_4B2R3_KEYS.LAST_SMOKE_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_UI_REVISION_4B2R3_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4b2r3ReadJsonProperty_(
        KIDLEARN_V3_UI_REVISION_4B2R3_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertBlueDesignTokens4B2R3ReadyV3() {
  var status =
    kidlearnV3_getBlueDesignTokens4B2R3StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_UI_REVISION_4B2R3_STATUS.READY_FOR_4B_2R_4
  ) {
    errors.push(
      '4B-2R-3 chưa READY_FOR_4B_2R_4. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_BLUE_DESIGN_TOKENS_4B_2R_3_READY_V3',
    phase: KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.PARENT_PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.NEXT_BUNDLE,
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
 * QA batch 4B-2R-3.
 */
function kidlearnV3_getQaBatchSteps4B2R3V3() {
  return [
    {
      label: 'Assert 4B-2R-2 Ready',
      functionName: 'kidlearnV3_assertLoginFullScreen4B2RReadyV3'
    },
    {
      label: 'Preview Blue Design Tokens 4B-2R-3',
      functionName: 'kidlearnV3_previewBlueDesignTokens4B2R3V3'
    },
    {
      label: 'Smoke Blue Design Tokens 4B-2R-3',
      functionName: 'kidlearnV3_smokeTestBlueDesignTokens4B2R3V3'
    },
    {
      label: 'Mark Blue Design Tokens 4B-2R-3 Ready',
      functionName: 'kidlearnV3_markBlueDesignTokens4B2R3ReadyV3'
    },
    {
      label: 'Assert Blue Design Tokens 4B-2R-3 Ready',
      functionName: 'kidlearnV3_assertBlueDesignTokens4B2R3ReadyV3'
    }
  ];
}


function kidlearnV3_runQaBatch4B2R3V3() {
  var steps =
    kidlearnV3_getQaBatchSteps4B2R3V3();

  if (typeof kidlearnV3_runQaBatchProvidedStepsV3 === 'function') {
    return kidlearnV3_runQaBatchProvidedStepsV3(
      'PHASE_4B_2R_3_BLUE_DESIGN_TOKEN_REVISION',
      steps,
      {
        stopOnFailure: true
      }
    );
  }

  return kidlearnV3_4b2r3RunLocalBatch_(
    'PHASE_4B_2R_3_BLUE_DESIGN_TOKEN_REVISION',
    steps
  );
}


/**
 * Internal marker inspection.
 * Revised: kiểm tra token thật, không bắt buộc comment marker.
 */
function kidlearnV3_4b2r3InspectBlueTokens_() {
  var errors = [];
  var warnings = [];

  var styles = '';

  try {
    styles =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Styles_4A')
        .getContent();
  } catch (error) {
    errors.push(
      'Không đọc được UI_Product_Styles_4A: ' +
      String(error.message || error)
    );
  }

  var requiredMarkers = [
    'kl-blue-identity-token',
    '--kl-primary: #2F80ED',
    '--kl-primary-deep: #1D4ED8',
    '--kl-sky-blue: #38BDF8',
    '--kl-soft-blue-bg: #EAF4FF',
    '--kl-reward-yellow: #FBBF24',
    '--kl-green-accent: #22C55E',
    'linear-gradient(135deg, #2F80ED, #38BDF8)',
    '.kl-login-fullscreen',
    '.kl-primary-btn',
    '.kl-hero-card',
    '.kl-next-lesson-card'
  ];

  for (var i = 0; i < requiredMarkers.length; i++) {
    if (styles.indexOf(requiredMarkers[i]) === -1) {
      errors.push(
        'CSS thiếu blue token marker: ' +
        requiredMarkers[i]
      );
    }
  }

  /**
   * Comment marker chỉ là warning, không phải lỗi.
   * Một số lần copy/paste CSS có thể mất comment,
   * nhưng miễn token màu thật còn đầy đủ thì UI vẫn đúng.
   */
  if (styles.indexOf('KIDLEARN V3 - Phase 4B-2R-3') === -1) {
    warnings.push(
      'CSS không thấy comment marker 4B-2R-3, nhưng không ảnh hưởng UI nếu token màu đã đủ.'
    );
  }

  if (styles.indexOf('Be Vietnam Pro') === -1) {
    warnings.push('CSS không thấy Be Vietnam Pro.');
  }

  if (styles.indexOf('Nunito Sans') === -1) {
    warnings.push('CSS không thấy Nunito Sans.');
  }

  return {
    success: errors.length === 0,
    action: 'INSPECT_BLUE_DESIGN_TOKENS_4B_2R_3_V3',
    phase: KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.PHASE,
    uiRevision:
      KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.UI_REVISION,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    tokenPalette: {
      primaryBlue: '#2F80ED',
      deepBlue: '#1D4ED8',
      skyBlue: '#38BDF8',
      softBlueBackground: '#EAF4FF',
      greenAccent: '#22C55E',
      rewardYellow: '#FBBF24',
      softOrange: '#FDBA74',
      textDark: '#111827',
      mutedText: '#64748B'
    },
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Helpers.
 */
function kidlearnV3_4b2r3SafeCall_(functionName) {
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
        functionName: functionName,
        message:
          'Thiếu function ' + functionName,
        output: null
      };
    }

    var fn =
      eval(functionName);

    var output =
      fn();

    return {
      success:
        output && output.success === true,
      functionName: functionName,
      message:
        output && output.success === true
          ? ''
          : JSON.stringify(output),
      output: output
    };

  } catch (error) {
    return {
      success: false,
      functionName: functionName,
      message:
        String(error.message || error),
      output: null
    };
  }
}


function kidlearnV3_4b2r3SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_UI_REVISION_4B2R3_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_UI_REVISION_4B2R3_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase: result.phase,
      parentPhase: result.parentPhase || '4B-2R',
      status: status,
      nextBundle:
        KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_UI_REVISION_4B2R3_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4b2r3ReadJsonProperty_(key) {
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


function kidlearnV3_4b2r3RunLocalBatch_(suiteName, steps) {
  var results = [];
  var failed = 0;

  for (var i = 0; i < steps.length; i++) {
    var step =
      steps[i];

    try {
      var fn =
        eval(step.functionName);

      var output =
        fn();

      var ok =
        output && output.success === true;

      if (!ok) failed++;

      results.push({
        label: step.label,
        functionName: step.functionName,
        success: ok,
        output: output
      });

      if (!ok) break;

    } catch (error) {
      failed++;

      results.push({
        label: step.label,
        functionName: step.functionName,
        success: false,
        error:
          String(error.message || error)
      });

      break;
    }
  }

  var result = {
    success: failed === 0,
    suiteName: suiteName,
    phase: '4B-2R-3',
    stepCount: steps.length,
    failedStepCount: failed,
    results: results
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      suiteName +
      ' failed. failedStepCount=' +
      failed
    );
  }

  return result;
}