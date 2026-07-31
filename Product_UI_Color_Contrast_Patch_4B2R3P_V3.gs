/**
 * ================================================================
 * KIDLEARN V3 - UI COLOR CONTRAST PATCH
 * Step: 4B-2R-3P
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Patch color contrast issues after Blue Design Token Revision.
 * - Improve hero text/buttons contrast.
 * - Add pastel subject card backgrounds.
 *
 * Safety:
 * - Không ghi Google Sheet dữ liệu học.
 * - Không ghi PROD.
 * - Chỉ ghi ScriptProperties trạng thái patch UI.
 */


var KIDLEARN_V3_COLOR_PATCH_4B2R3P_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4B2R3P_STATUS',
  LAST_CHECK_AT: 'KIDLEARN_V3_PHASE_4B2R3P_LAST_CHECK_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4B2R3P_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4B2R3P_LAST_RESULT_JSON'
};


var KIDLEARN_V3_COLOR_PATCH_4B2R3P_STATUS = {
  NOT_RUN: 'NOT_RUN',
  CHECK_PASSED: 'CHECK_PASSED',
  READY_FOR_VISUAL_REVIEW: 'READY_FOR_VISUAL_REVIEW',
  FAILED: 'FAILED'
};


function kidlearnV3_checkColorContrastPatch4B2R3PV3() {
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

  /**
   * Chỉ kiểm tra marker CSS chức năng thật.
   * Không bắt buộc comment marker vì comment có thể bị mất khi copy/paste.
   */
  var requiredMarkers = [
    '.kl-hero-card .kl-hero-kicker',
    '.kl-hero-card .kl-primary-btn',
    '.kl-hero-card .kl-secondary-btn:hover',
    '.kl-subject-card-4b.subject-blue',
    '.kl-subject-card-4b.subject-purple',
    '.kl-subject-card-4b.subject-pink',
    '.kl-subject-card-4b.subject-green',
    '--kl-card-blue-pastel',
    '--kl-card-green-pastel',
    '--kl-card-yellow-pastel',
    '--kl-card-purple-pastel',
    '--kl-contrast-dark',
    '--kl-contrast-white'
  ];

  for (var i = 0; i < requiredMarkers.length; i++) {
    if (styles.indexOf(requiredMarkers[i]) === -1) {
      errors.push(
        'CSS thiếu contrast patch marker: ' +
        requiredMarkers[i]
      );
    }
  }

  if (styles.indexOf('KIDLEARN V3 - Phase 4B-2R-3P') === -1) {
    warnings.push(
      'CSS không thấy comment marker KIDLEARN V3 - Phase 4B-2R-3P, nhưng không ảnh hưởng UI nếu marker chức năng đã đủ.'
    );
  }

  if (styles.indexOf('contrast-pass-4b2r3p') === -1) {
    warnings.push(
      'CSS không thấy comment marker contrast-pass-4b2r3p, nhưng không ảnh hưởng UI nếu marker chức năng đã đủ.'
    );
  }

  if (styles.indexOf('#0F172A') === -1) {
    warnings.push('CSS chưa thấy màu chữ đậm #0F172A.');
  }

  if (styles.indexOf('#FFFFFF') === -1) {
    warnings.push('CSS chưa thấy màu trắng #FFFFFF.');
  }

  var properties =
    PropertiesService.getScriptProperties();

  var statusBefore =
    properties.getProperty(
      KIDLEARN_V3_COLOR_PATCH_4B2R3P_KEYS.STATUS
    ) ||
    KIDLEARN_V3_COLOR_PATCH_4B2R3P_STATUS.NOT_RUN;

  /**
   * Quan trọng:
   * Nếu trước đó đã READY_FOR_VISUAL_REVIEW,
   * thì check lại không được kéo status lùi về CHECK_PASSED.
   */
  var statusAfter;

  if (errors.length > 0) {
    statusAfter =
      KIDLEARN_V3_COLOR_PATCH_4B2R3P_STATUS.FAILED;
  } else if (
    statusBefore ===
    KIDLEARN_V3_COLOR_PATCH_4B2R3P_STATUS.READY_FOR_VISUAL_REVIEW
  ) {
    statusAfter =
      KIDLEARN_V3_COLOR_PATCH_4B2R3P_STATUS.READY_FOR_VISUAL_REVIEW;
  } else {
    statusAfter =
      KIDLEARN_V3_COLOR_PATCH_4B2R3P_STATUS.CHECK_PASSED;
  }

  var result = {
    success: errors.length === 0,
    action: 'CHECK_COLOR_CONTRAST_PATCH_4B_2R_3P_V3',
    phase: '4B-2R-3P',
    patch: 'COLOR_CONTRAST_AND_PASTEL_SUBJECT_CARDS',
    statusBefore: statusBefore,
    statusAfter: statusAfter,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4b2r3pSaveStatus_(
    result,
    statusAfter,
    KIDLEARN_V3_COLOR_PATCH_4B2R3P_KEYS.LAST_CHECK_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      'Color contrast patch check failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


function kidlearnV3_markColorContrastPatch4B2R3PReadyV3() {
  var check =
    kidlearnV3_checkColorContrastPatch4B2R3PV3();

  var blueTokenCheck =
    kidlearnV3_4b2r3pSafeCall_(
      'kidlearnV3_checkBlueDesignTokens4B2R3V3'
    );

  if (!blueTokenCheck.success) {
    throw new Error(
      'Blue token check không pass sau patch: ' +
      blueTokenCheck.message
    );
  }

  var loginCheck =
    kidlearnV3_4b2r3pSafeCall_(
      'kidlearnV3_checkLoginFullScreen4B2RV3'
    );

  if (!loginCheck.success) {
    throw new Error(
      'Login full screen check không pass sau patch: ' +
      loginCheck.message
    );
  }

  var result = {
    success: true,
    action: 'MARK_COLOR_CONTRAST_PATCH_4B_2R_3P_READY_V3',
    phase: '4B-2R-3P',
    status:
      KIDLEARN_V3_COLOR_PATCH_4B2R3P_STATUS.READY_FOR_VISUAL_REVIEW,
    nextReview:
      'Open /exec and visually review hero contrast, button hover, and pastel subject cards.',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    check: check,
    blueTokenCheck: blueTokenCheck.success,
    loginCheck: loginCheck.success,
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4b2r3pSaveStatus_(
    result,
    KIDLEARN_V3_COLOR_PATCH_4B2R3P_STATUS.READY_FOR_VISUAL_REVIEW,
    KIDLEARN_V3_COLOR_PATCH_4B2R3P_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


function kidlearnV3_assertColorContrastPatch4B2R3PReadyV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var status =
    properties.getProperty(
      KIDLEARN_V3_COLOR_PATCH_4B2R3P_KEYS.STATUS
    ) ||
    KIDLEARN_V3_COLOR_PATCH_4B2R3P_STATUS.NOT_RUN;

  var errors = [];

  if (
    status !==
    KIDLEARN_V3_COLOR_PATCH_4B2R3P_STATUS.READY_FOR_VISUAL_REVIEW
  ) {
    errors.push(
      '4B-2R-3P chưa READY_FOR_VISUAL_REVIEW. Status=' +
      status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_COLOR_CONTRAST_PATCH_4B_2R_3P_READY_V3',
    phase: '4B-2R-3P',
    status: status,
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


function kidlearnV3_runQaBatch4B2R3PV3() {
  var check =
    kidlearnV3_checkColorContrastPatch4B2R3PV3();

  var ready =
    kidlearnV3_markColorContrastPatch4B2R3PReadyV3();

  var assertReady =
    kidlearnV3_assertColorContrastPatch4B2R3PReadyV3();

  var result = {
    success:
      check.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4B_2R_3P_COLOR_CONTRAST_AND_PASTEL_CARDS_PATCH',
    phase: '4B-2R-3P',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    results: {
      check: check.success,
      ready: ready.success,
      assertReady: assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4B-2R-3P QA failed.');
  }

  return result;
}


function kidlearnV3_4b2r3pSaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_COLOR_PATCH_4B2R3P_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_COLOR_PATCH_4B2R3P_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase: result.phase,
      status: status,
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


function kidlearnV3_4b2r3pSafeCall_(functionName) {
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