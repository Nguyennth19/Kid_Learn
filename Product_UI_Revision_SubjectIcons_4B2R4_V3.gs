/**
 * ================================================================
 * KIDLEARN V3 - UI REVISION 4B-2R-4
 * Step: Built-in SVG Cute Subject Icons
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Validate built-in SVG cute subject icons revision.
 *
 * Safety:
 * - Không ghi Google Sheet dữ liệu học.
 * - Không ghi PROD.
 * - Không gọi Safe Write.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4B-2R-4.
 */


var KIDLEARN_V3_UI_REVISION_4B2R4_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4B2R4_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4B2R4_LAST_PREVIEW_AT',
  LAST_SMOKE_AT: 'KIDLEARN_V3_PHASE_4B2R4_LAST_SMOKE_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4B2R4_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4B2R4_LAST_RESULT_JSON'
};


var KIDLEARN_V3_UI_REVISION_4B2R4_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  SMOKE_PASSED: 'SMOKE_PASSED',
  READY_FOR_4B_2R_5: 'READY_FOR_4B_2R_5',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG = {
  PHASE: '4B-2R-4',
  PARENT_PHASE: '4B-2R',
  PREVIOUS_BUNDLE: '4B-2R-3',
  NEXT_BUNDLE: '4B-2R-5',
  NEXT_STAGE: 'ASSET_FOLDER_AND_REGISTRY_PLAN',
  UI_REVISION: 'BUILT_IN_SVG_CUTE_SUBJECT_ICONS',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false
};


/**
 * Preview SVG subject icons.
 */
function kidlearnV3_previewSubjectSvgIcons4B2R4V3() {
  var errors = [];
  var warnings = [];

  var previous =
    kidlearnV3_4b2r4SafeCall_(
      'kidlearnV3_assertBlueDesignTokens4B2R3ReadyV3'
    );

  if (!previous.success) {
    errors.push(
      '4B-2R-3 chưa READY_FOR_4B_2R_4: ' +
      previous.message
    );
  }

  var marker =
    kidlearnV3_4b2r4InspectSubjectSvgIcons_();

  errors = errors.concat(marker.errors || []);
  warnings = warnings.concat(marker.warnings || []);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_SUBJECT_SVG_ICONS_4B_2R_4_V3',
    phase: KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.PARENT_PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_UI_REVISION_4B2R4_STATUS.PREVIEWED
        : KIDLEARN_V3_UI_REVISION_4B2R4_STATUS.FAILED,
    uiRevision:
      KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.UI_REVISION,
    nextBundle:
      KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    markerCheck: marker,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4b2r4SaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_UI_REVISION_4B2R4_STATUS.PREVIEWED
      : KIDLEARN_V3_UI_REVISION_4B2R4_STATUS.FAILED,
    KIDLEARN_V3_UI_REVISION_4B2R4_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4B-2R-4 preview failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Public marker check.
 */
function kidlearnV3_checkSubjectSvgIcons4B2R4V3() {
  var result =
    kidlearnV3_4b2r4InspectSubjectSvgIcons_();

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      'Subject SVG icon marker check failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Smoke test.
 */
function kidlearnV3_smokeTestSubjectSvgIcons4B2R4V3() {
  var errors = [];
  var warnings = [];

  var previous =
    kidlearnV3_4b2r4SafeCall_(
      'kidlearnV3_assertBlueDesignTokens4B2R3ReadyV3'
    );

  if (!previous.success) {
    errors.push(
      '4B-2R-3 chưa ready: ' +
      previous.message
    );
  }

  var marker =
    kidlearnV3_4b2r4SafeCall_(
      'kidlearnV3_checkSubjectSvgIcons4B2R4V3'
    );

  if (!marker.success) {
    errors.push(
      'Subject SVG icon marker không pass: ' +
      marker.message
    );
  }

  var loginMarker =
    kidlearnV3_4b2r4SafeCall_(
      'kidlearnV3_checkLoginFullScreen4B2RV3'
    );

  if (!loginMarker.success) {
    errors.push(
      'Login full screen marker không pass sau khi thêm SVG icons: ' +
      loginMarker.message
    );
  }

  var ui4B2Marker =
    kidlearnV3_4b2r4SafeCall_(
      'kidlearnV3_checkUiMarkers4B2V3'
    );

  if (!ui4B2Marker.success) {
    errors.push(
      'Original 4B-2 marker không pass sau khi thêm SVG icons: ' +
      ui4B2Marker.message
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_SUBJECT_SVG_ICONS_4B_2R_4_V3',
    phase: KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.PARENT_PHASE,
    uiRevision:
      KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.UI_REVISION,
    subjectSvgIconMarkerCheck: marker.success,
    loginFullScreenCheck: loginMarker.success,
    original4B2MarkerCheck: ui4B2Marker.success,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4b2r4SaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_UI_REVISION_4B2R4_STATUS.SMOKE_PASSED
      : KIDLEARN_V3_UI_REVISION_4B2R4_STATUS.FAILED,
    KIDLEARN_V3_UI_REVISION_4B2R4_KEYS.LAST_SMOKE_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4B-2R-4 smoke failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready.
 */
function kidlearnV3_markSubjectSvgIcons4B2R4ReadyV3() {
  var smoke =
    kidlearnV3_smokeTestSubjectSvgIcons4B2R4V3();

  if (!smoke.success) {
    throw new Error('Smoke 4B-2R-4 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_SUBJECT_SVG_ICONS_4B_2R_4_READY_V3',
    phase: KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_UI_REVISION_4B2R4_STATUS.READY_FOR_4B_2R_5,
    nextBundle:
      KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    message:
      'Built-in SVG Cute Subject Icons ready. Có thể qua 4B-2R-5 Asset Folder and Registry Plan.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4b2r4SaveStatus_(
    result,
    KIDLEARN_V3_UI_REVISION_4B2R4_STATUS.READY_FOR_4B_2R_5,
    KIDLEARN_V3_UI_REVISION_4B2R4_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getSubjectSvgIcons4B2R4StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_SUBJECT_SVG_ICONS_4B_2R_4_STATUS_V3',
    phase: KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_UI_REVISION_4B2R4_KEYS.STATUS
      ) ||
      KIDLEARN_V3_UI_REVISION_4B2R4_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_UI_REVISION_4B2R4_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastSmokeAt:
      properties.getProperty(
        KIDLEARN_V3_UI_REVISION_4B2R4_KEYS.LAST_SMOKE_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_UI_REVISION_4B2R4_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4b2r4ReadJsonProperty_(
        KIDLEARN_V3_UI_REVISION_4B2R4_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertSubjectSvgIcons4B2R4ReadyV3() {
  var status =
    kidlearnV3_getSubjectSvgIcons4B2R4StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_UI_REVISION_4B2R4_STATUS.READY_FOR_4B_2R_5
  ) {
    errors.push(
      '4B-2R-4 chưa READY_FOR_4B_2R_5. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_SUBJECT_SVG_ICONS_4B_2R_4_READY_V3',
    phase: KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.PARENT_PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.NEXT_BUNDLE,
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
 * QA batch 4B-2R-4.
 */
function kidlearnV3_getQaBatchSteps4B2R4V3() {
  return [
    {
      label: 'Assert 4B-2R-3 Ready',
      functionName: 'kidlearnV3_assertBlueDesignTokens4B2R3ReadyV3'
    },
    {
      label: 'Preview Subject SVG Icons 4B-2R-4',
      functionName: 'kidlearnV3_previewSubjectSvgIcons4B2R4V3'
    },
    {
      label: 'Smoke Subject SVG Icons 4B-2R-4',
      functionName: 'kidlearnV3_smokeTestSubjectSvgIcons4B2R4V3'
    },
    {
      label: 'Mark Subject SVG Icons 4B-2R-4 Ready',
      functionName: 'kidlearnV3_markSubjectSvgIcons4B2R4ReadyV3'
    },
    {
      label: 'Assert Subject SVG Icons 4B-2R-4 Ready',
      functionName: 'kidlearnV3_assertSubjectSvgIcons4B2R4ReadyV3'
    }
  ];
}


function kidlearnV3_runQaBatch4B2R4V3() {
  var steps =
    kidlearnV3_getQaBatchSteps4B2R4V3();

  if (typeof kidlearnV3_runQaBatchProvidedStepsV3 === 'function') {
    return kidlearnV3_runQaBatchProvidedStepsV3(
      'PHASE_4B_2R_4_BUILT_IN_SVG_CUTE_SUBJECT_ICONS',
      steps,
      {
        stopOnFailure: true
      }
    );
  }

  return kidlearnV3_4b2r4RunLocalBatch_(
    'PHASE_4B_2R_4_BUILT_IN_SVG_CUTE_SUBJECT_ICONS',
    steps
  );
}


/**
 * Internal marker inspection.
 * Revised: kiểm tra marker chức năng thật, không bắt buộc comment marker.
 */
function kidlearnV3_4b2r4InspectSubjectSvgIcons_() {
  var errors = [];
  var warnings = [];

  var shell = '';
  var clientAssets = '';
  var styles = '';

  try {
    shell =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Shell_4A')
        .getContent();
  } catch (error) {
    errors.push(
      'Không đọc được UI_Product_Shell_4A: ' +
      String(error.message || error)
    );
  }

  try {
    clientAssets =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_Assets_4B2R4')
        .getContent();
  } catch (error2) {
    errors.push(
      'Không đọc được UI_Product_Client_Assets_4B2R4: ' +
      String(error2.message || error2)
    );
  }

  try {
    styles =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Styles_4A')
        .getContent();
  } catch (error3) {
    errors.push(
      'Không đọc được UI_Product_Styles_4A: ' +
      String(error3.message || error3)
    );
  }

  var shellMarkers = [
    'UI_Product_Client_Assets_4B2R4',
    'UI_Product_Client_4A'
  ];

  var clientMarkers = [
    'KIDLEARN_SUBJECT_ASSETS_4B2R4',
    'subject_math_builtin_svg',
    'subject_vietnamese_builtin_svg',
    'subject_english_builtin_svg',
    'subject_science_builtin_svg',
    'resolveSubjectAsset4B2R4',
    'applySubjectAssets4B2R4',
    'MutationObserver',
    'has-svg-4b2r4'
  ];

  var styleMarkers = [
    'kl-asset-svg-4b2r4',
    'kl-subject-icon.has-svg-4b2r4',
    'kl-next-icon.has-svg-4b2r4',
    'kl-subject-detail-icon.has-svg-4b2r4',
    'kl-svg-subject-icon-4b2r4'
  ];

  for (var i = 0; i < shellMarkers.length; i++) {
    if (shell.indexOf(shellMarkers[i]) === -1) {
      errors.push('Shell thiếu marker: ' + shellMarkers[i]);
    }
  }

  for (var j = 0; j < clientMarkers.length; j++) {
    if (clientAssets.indexOf(clientMarkers[j]) === -1) {
      errors.push('Client asset thiếu marker: ' + clientMarkers[j]);
    }
  }

  for (var k = 0; k < styleMarkers.length; k++) {
    if (styles.indexOf(styleMarkers[k]) === -1) {
      errors.push('CSS thiếu marker: ' + styleMarkers[k]);
    }
  }

  /**
   * Comment marker chỉ là warning.
   * Một số lần copy/paste HTML có thể mất comment,
   * nhưng miễn marker chức năng còn đủ thì icon vẫn hoạt động.
   */
  if (clientAssets.indexOf('KIDLEARN V3 - Phase 4B-2R-4') === -1) {
    warnings.push(
      'Client asset không thấy comment marker 4B-2R-4, nhưng không ảnh hưởng UI nếu các marker chức năng đã đủ.'
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
    action: 'INSPECT_SUBJECT_SVG_ICONS_4B_2R_4_V3',
    phase: KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.PHASE,
    uiRevision:
      KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.UI_REVISION,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    builtInAssets: [
      'subject_math_builtin_svg',
      'subject_vietnamese_builtin_svg',
      'subject_english_builtin_svg',
      'subject_science_builtin_svg'
    ],
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Helpers.
 */
function kidlearnV3_4b2r4SafeCall_(functionName) {
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


function kidlearnV3_4b2r4SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_UI_REVISION_4B2R4_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_UI_REVISION_4B2R4_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase: result.phase,
      parentPhase: result.parentPhase || '4B-2R',
      status: status,
      nextBundle:
        KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_UI_REVISION_4B2R4_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4b2r4ReadJsonProperty_(key) {
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


function kidlearnV3_4b2r4RunLocalBatch_(suiteName, steps) {
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
    phase: '4B-2R-4',
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