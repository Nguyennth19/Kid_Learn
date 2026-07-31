/**
 * ================================================================
 * KIDLEARN V3 - UI REVISION 4B-2R
 * Step: 4B-2R-2 Login Full Screen Revision
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Validate login full screen revision before locking 4B.
 *
 * Safety:
 * - Không ghi Google Sheet dữ liệu học.
 * - Không ghi PROD.
 * - Không gọi Safe Write.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4B-2R-2.
 */


var KIDLEARN_V3_UI_REVISION_4B2R2_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4B2R2_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4B2R2_LAST_PREVIEW_AT',
  LAST_SMOKE_AT: 'KIDLEARN_V3_PHASE_4B2R2_LAST_SMOKE_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4B2R2_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4B2R2_LAST_RESULT_JSON'
};


var KIDLEARN_V3_UI_REVISION_4B2R2_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  SMOKE_PASSED: 'SMOKE_PASSED',
  READY_FOR_4B_2R_3: 'READY_FOR_4B_2R_3',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG = {
  PHASE: '4B-2R-2',
  PARENT_PHASE: '4B-2R',
  NEXT_BUNDLE: '4B-2R-3',
  NEXT_STAGE: 'BLUE_DESIGN_TOKEN_REVISION',
  UI_REVISION: 'LOGIN_FULL_SCREEN',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false
};


/**
 * Preview login full screen revision.
 */
function kidlearnV3_previewLoginFullScreen4B2RV3() {
  var errors = [];
  var warnings = [];

  var phase4B2 =
    kidlearnV3_4b2r2SafeCall_(
      'kidlearnV3_assertProductUiUpgrade4B2ReadyV3'
    );

  if (!phase4B2.success) {
    errors.push(
      '4B-2 chưa READY_FOR_4B_3: ' +
      phase4B2.message
    );
  }

  var marker =
    kidlearnV3_checkLoginFullScreen4B2RV3();

  errors = errors.concat(marker.errors || []);
  warnings = warnings.concat(marker.warnings || []);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_LOGIN_FULL_SCREEN_4B_2R_V3',
    phase: KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.PARENT_PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_UI_REVISION_4B2R2_STATUS.PREVIEWED
        : KIDLEARN_V3_UI_REVISION_4B2R2_STATUS.FAILED,
    uiRevision:
      KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.UI_REVISION,
    nextBundle:
      KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    markerCheck: marker,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4b2r2SaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_UI_REVISION_4B2R2_STATUS.PREVIEWED
      : KIDLEARN_V3_UI_REVISION_4B2R2_STATUS.FAILED,
    KIDLEARN_V3_UI_REVISION_4B2R2_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4B-2R-2 preview failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Public marker check for login full screen.
 */
function kidlearnV3_checkLoginFullScreen4B2RV3() {
  var errors = [];
  var warnings = [];

  var shell = '';
  var client = '';
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
    client =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_4A')
        .getContent();
  } catch (error2) {
    errors.push(
      'Không đọc được UI_Product_Client_4A: ' +
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
    'kl-login-fullscreen',
    'loginRoleCardChild',
    'loginRoleCardParent',
    'kidlearnApp',
    'class="kl-app hidden"',
    'nextLessonCard',
    'courseSummaryGrid',
    'recommendedLessonsList',
    'subjectDetailScreen',
    'subjectDetailTitle'
  ];

  var clientMarkers = [
    'selectLoginRole4B2R',
    'showLoginOnly4B2R',
    'showAppShell4B2R',
    'kidlearnV3_getChildHomeCourseContext4BV3',
    'renderChildHome4B',
    'renderCourses4B',
    'openSubjectDetail4B'
  ];

  var styleMarkers = [
    'kl-login-fullscreen',
    'kl-login-layout',
    'kl-login-role-card',
    'kl-login-brand-panel',
    'kl-login-form-panel'
  ];

  for (var i = 0; i < shellMarkers.length; i++) {
    if (shell.indexOf(shellMarkers[i]) === -1) {
      errors.push('Shell thiếu marker: ' + shellMarkers[i]);
    }
  }

  for (var j = 0; j < clientMarkers.length; j++) {
    if (client.indexOf(clientMarkers[j]) === -1) {
      errors.push('Client thiếu marker: ' + clientMarkers[j]);
    }
  }

  for (var k = 0; k < styleMarkers.length; k++) {
    if (styles.indexOf(styleMarkers[k]) === -1) {
      errors.push('CSS thiếu marker: ' + styleMarkers[k]);
    }
  }

  if (styles.indexOf('Be Vietnam Pro') === -1) {
    warnings.push('CSS không thấy Be Vietnam Pro.');
  }

  if (styles.indexOf('Nunito Sans') === -1) {
    warnings.push('CSS không thấy Nunito Sans.');
  }

  var result = {
    success: errors.length === 0,
    action: 'CHECK_LOGIN_FULL_SCREEN_4B_2R_V3',
    phase: KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.PHASE,
    uiRevision:
      KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.UI_REVISION,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      'Login full screen marker check failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Smoke test.
 */
function kidlearnV3_smokeTestLoginFullScreen4B2RV3() {
  var errors = [];
  var warnings = [];

  var marker;

  try {
    marker =
      kidlearnV3_checkLoginFullScreen4B2RV3();
  } catch (error) {
    errors.push(String(error.message || error));
  }

  var phase4B2 =
    kidlearnV3_4b2r2SafeCall_(
      'kidlearnV3_assertProductUiUpgrade4B2ReadyV3'
    );

  if (!phase4B2.success) {
    errors.push(
      '4B-2 chưa ready: ' +
      phase4B2.message
    );
  }

  var originalMarker =
    kidlearnV3_4b2r2SafeCall_(
      'kidlearnV3_checkUiMarkers4B2V3'
    );

  if (!originalMarker.success) {
    errors.push(
      'Original 4B-2 marker check không pass sau khi sửa login: ' +
      originalMarker.message
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_LOGIN_FULL_SCREEN_4B_2R_V3',
    phase: KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.PARENT_PHASE,
    uiRevision:
      KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.UI_REVISION,
    markerCheck:
      marker || null,
    original4B2MarkerCheck:
      originalMarker.success,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4b2r2SaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_UI_REVISION_4B2R2_STATUS.SMOKE_PASSED
      : KIDLEARN_V3_UI_REVISION_4B2R2_STATUS.FAILED,
    KIDLEARN_V3_UI_REVISION_4B2R2_KEYS.LAST_SMOKE_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4B-2R-2 smoke failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready.
 */
function kidlearnV3_markLoginFullScreen4B2RReadyV3() {
  var smoke =
    kidlearnV3_smokeTestLoginFullScreen4B2RV3();

  if (!smoke.success) {
    throw new Error('Smoke 4B-2R-2 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_LOGIN_FULL_SCREEN_4B_2R_READY_V3',
    phase: KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_UI_REVISION_4B2R2_STATUS.READY_FOR_4B_2R_3,
    nextBundle:
      KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    message:
      'Login Full Screen Revision ready. Có thể qua 4B-2R-3 Blue Design Token Revision.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4b2r2SaveStatus_(
    result,
    KIDLEARN_V3_UI_REVISION_4B2R2_STATUS.READY_FOR_4B_2R_3,
    KIDLEARN_V3_UI_REVISION_4B2R2_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getLoginFullScreen4B2RStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_LOGIN_FULL_SCREEN_4B_2R_STATUS_V3',
    phase: KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_UI_REVISION_4B2R2_KEYS.STATUS
      ) ||
      KIDLEARN_V3_UI_REVISION_4B2R2_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_UI_REVISION_4B2R2_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastSmokeAt:
      properties.getProperty(
        KIDLEARN_V3_UI_REVISION_4B2R2_KEYS.LAST_SMOKE_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_UI_REVISION_4B2R2_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4b2r2ReadJsonProperty_(
        KIDLEARN_V3_UI_REVISION_4B2R2_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertLoginFullScreen4B2RReadyV3() {
  var status =
    kidlearnV3_getLoginFullScreen4B2RStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_UI_REVISION_4B2R2_STATUS.READY_FOR_4B_2R_3
  ) {
    errors.push(
      '4B-2R-2 chưa READY_FOR_4B_2R_3. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_LOGIN_FULL_SCREEN_4B_2R_READY_V3',
    phase: KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.PARENT_PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.NEXT_BUNDLE,
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
 * QA batch 4B-2R-2.
 */
function kidlearnV3_getQaBatchSteps4B2R2V3() {
  return [
    {
      label: 'Assert 4B-2 Ready',
      functionName: 'kidlearnV3_assertProductUiUpgrade4B2ReadyV3'
    },
    {
      label: 'Preview Login Full Screen 4B-2R',
      functionName: 'kidlearnV3_previewLoginFullScreen4B2RV3'
    },
    {
      label: 'Smoke Login Full Screen 4B-2R',
      functionName: 'kidlearnV3_smokeTestLoginFullScreen4B2RV3'
    },
    {
      label: 'Mark Login Full Screen 4B-2R Ready',
      functionName: 'kidlearnV3_markLoginFullScreen4B2RReadyV3'
    },
    {
      label: 'Assert Login Full Screen 4B-2R Ready',
      functionName: 'kidlearnV3_assertLoginFullScreen4B2RReadyV3'
    }
  ];
}


function kidlearnV3_runQaBatch4B2R2V3() {
  var steps =
    kidlearnV3_getQaBatchSteps4B2R2V3();

  if (typeof kidlearnV3_runQaBatchProvidedStepsV3 === 'function') {
    return kidlearnV3_runQaBatchProvidedStepsV3(
      'PHASE_4B_2R_2_LOGIN_FULL_SCREEN_REVISION',
      steps,
      {
        stopOnFailure: true
      }
    );
  }

  return kidlearnV3_4b2r2RunLocalBatch_(
    'PHASE_4B_2R_2_LOGIN_FULL_SCREEN_REVISION',
    steps
  );
}


/**
 * Helpers.
 */
function kidlearnV3_4b2r2SafeCall_(functionName) {
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


function kidlearnV3_4b2r2SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_UI_REVISION_4B2R2_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_UI_REVISION_4B2R2_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase: result.phase,
      parentPhase: result.parentPhase || '4B-2R',
      status: status,
      nextBundle:
        KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_UI_REVISION_4B2R2_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4b2r2ReadJsonProperty_(key) {
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


function kidlearnV3_4b2r2RunLocalBatch_(suiteName, steps) {
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
    phase: '4B-2R-2',
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