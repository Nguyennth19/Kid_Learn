/**
 * ================================================================
 * KIDLEARN V3 - PRODUCT UI UPGRADE 4B
 * Phase: 4B-2
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Upgrade Child Home + Courses Dashboard UI.
 * - Validate HTML/CSS/JS markers for 4B.
 *
 * Safety:
 * - Không ghi Google Sheet dữ liệu học.
 * - Không ghi PROD.
 * - Không gọi Safe Write.
 * - Chỉ ghi ScriptProperties để lưu trạng thái QA 4B-2.
 */


var KIDLEARN_V3_UI_UPGRADE_4B2_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4B2_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4B2_LAST_PREVIEW_AT',
  LAST_SMOKE_AT: 'KIDLEARN_V3_PHASE_4B2_LAST_SMOKE_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4B2_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4B2_LAST_RESULT_JSON'
};


var KIDLEARN_V3_UI_UPGRADE_4B2_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  SMOKE_PASSED: 'SMOKE_PASSED',
  READY_FOR_4B_3: 'READY_FOR_4B_3',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_UI_UPGRADE_4B2_CONFIG = {
  PHASE: '4B-2',
  PARENT_PHASE: '4B',
  NEXT_BUNDLE: '4B-3',
  NEXT_STAGE: 'QA_AND_4B_LOCK',
  UI_MODE: 'CHILD_HOME_AND_COURSES_DASHBOARD_UPGRADE',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false
};


/**
 * Preview UI upgrade 4B-2.
 */
function kidlearnV3_previewProductUiUpgrade4B2V3() {
  var errors = [];
  var warnings = [];

  var phase4B1 =
    kidlearnV3_4b2SafeCall_(
      'kidlearnV3_assertChildHomeCourseContext4BReadyV3'
    );

  if (!phase4B1.success) {
    errors.push(
      '4B-1 chưa READY_FOR_4B_2: ' +
      phase4B1.message
    );
  }

  var markerCheck =
    kidlearnV3_4b2CheckUiMarkers_();

  errors = errors.concat(markerCheck.errors);
  warnings = warnings.concat(markerCheck.warnings);

  var contextCheck =
    kidlearnV3_4b2SafeCall_(
      'kidlearnV3_getChildHomeCourseContext4BV3',
      {
        role: 'CHILD'
      }
    );

  if (!contextCheck.success) {
    errors.push(
      'Không lấy được 4B context: ' +
      contextCheck.message
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PRODUCT_UI_UPGRADE_4B2_V3',
    phase: KIDLEARN_V3_UI_UPGRADE_4B2_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_UPGRADE_4B2_CONFIG.PARENT_PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_UI_UPGRADE_4B2_STATUS.PREVIEWED
        : KIDLEARN_V3_UI_UPGRADE_4B2_STATUS.FAILED,
    uiMode:
      KIDLEARN_V3_UI_UPGRADE_4B2_CONFIG.UI_MODE,
    nextBundle:
      KIDLEARN_V3_UI_UPGRADE_4B2_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    checks: {
      phase4B1Ready: phase4B1.success,
      uiMarkers: markerCheck.success,
      contextAvailable: contextCheck.success
    },
    markerCheck: markerCheck,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4b2SaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_UI_UPGRADE_4B2_STATUS.PREVIEWED
      : KIDLEARN_V3_UI_UPGRADE_4B2_STATUS.FAILED,
    KIDLEARN_V3_UI_UPGRADE_4B2_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4B-2 preview failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Smoke test UI upgrade.
 */
function kidlearnV3_smokeTestProductUiUpgrade4B2V3() {
  var errors = [];
  var warnings = [];

  var markerCheck =
    kidlearnV3_4b2CheckUiMarkers_();

  errors = errors.concat(markerCheck.errors);
  warnings = warnings.concat(markerCheck.warnings);

  var phase4B1 =
    kidlearnV3_4b2SafeCall_(
      'kidlearnV3_assertChildHomeCourseContext4BReadyV3'
    );

  if (!phase4B1.success) {
    errors.push(
      '4B-1 chưa ready: ' +
      phase4B1.message
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_PRODUCT_UI_UPGRADE_4B2_V3',
    phase: KIDLEARN_V3_UI_UPGRADE_4B2_CONFIG.PHASE,
    uiMode:
      KIDLEARN_V3_UI_UPGRADE_4B2_CONFIG.UI_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    markerCheck: markerCheck,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4b2SaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_UI_UPGRADE_4B2_STATUS.SMOKE_PASSED
      : KIDLEARN_V3_UI_UPGRADE_4B2_STATUS.FAILED,
    KIDLEARN_V3_UI_UPGRADE_4B2_KEYS.LAST_SMOKE_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4B-2 smoke failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 4B-2 ready.
 */
function kidlearnV3_markProductUiUpgrade4B2ReadyV3() {
  var smoke =
    kidlearnV3_smokeTestProductUiUpgrade4B2V3();

  if (!smoke.success) {
    throw new Error('Smoke 4B-2 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_PRODUCT_UI_UPGRADE_4B2_READY_V3',
    phase: KIDLEARN_V3_UI_UPGRADE_4B2_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_UPGRADE_4B2_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_UI_UPGRADE_4B2_STATUS.READY_FOR_4B_3,
    nextBundle:
      KIDLEARN_V3_UI_UPGRADE_4B2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_UI_UPGRADE_4B2_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    message:
      '4B-2 ready. Child Home + Courses Dashboard UI đã nâng cấp.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4b2SaveStatus_(
    result,
    KIDLEARN_V3_UI_UPGRADE_4B2_STATUS.READY_FOR_4B_3,
    KIDLEARN_V3_UI_UPGRADE_4B2_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get 4B-2 status.
 */
function kidlearnV3_getProductUiUpgrade4B2StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PRODUCT_UI_UPGRADE_4B2_STATUS_V3',
    phase: KIDLEARN_V3_UI_UPGRADE_4B2_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_UPGRADE_4B2_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_UI_UPGRADE_4B2_KEYS.STATUS
      ) ||
      KIDLEARN_V3_UI_UPGRADE_4B2_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_UI_UPGRADE_4B2_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastSmokeAt:
      properties.getProperty(
        KIDLEARN_V3_UI_UPGRADE_4B2_KEYS.LAST_SMOKE_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_UI_UPGRADE_4B2_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4b2ReadJsonProperty_(
        KIDLEARN_V3_UI_UPGRADE_4B2_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert 4B-2 ready.
 */
function kidlearnV3_assertProductUiUpgrade4B2ReadyV3() {
  var status =
    kidlearnV3_getProductUiUpgrade4B2StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_UI_UPGRADE_4B2_STATUS.READY_FOR_4B_3
  ) {
    errors.push(
      '4B-2 chưa READY_FOR_4B_3. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PRODUCT_UI_UPGRADE_4B2_READY_V3',
    phase: KIDLEARN_V3_UI_UPGRADE_4B2_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_UI_UPGRADE_4B2_CONFIG.PARENT_PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_UI_UPGRADE_4B2_CONFIG.NEXT_BUNDLE,
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
 * QA steps 4B-2.
 */
function kidlearnV3_getQaBatchSteps4B2V3() {
  return [
    {
      label: 'Assert 4B-1 Ready',
      functionName: 'kidlearnV3_assertChildHomeCourseContext4BReadyV3'
    },
    {
      label: 'Preview Product UI Upgrade 4B-2',
      functionName: 'kidlearnV3_previewProductUiUpgrade4B2V3'
    },
    {
      label: 'Smoke Product UI Upgrade 4B-2',
      functionName: 'kidlearnV3_smokeTestProductUiUpgrade4B2V3'
    },
    {
      label: 'Mark Product UI Upgrade 4B-2 Ready',
      functionName: 'kidlearnV3_markProductUiUpgrade4B2ReadyV3'
    },
    {
      label: 'Assert Product UI Upgrade 4B-2 Ready',
      functionName: 'kidlearnV3_assertProductUiUpgrade4B2ReadyV3'
    }
  ];
}


/**
 * QA batch 4B-2.
 */
function kidlearnV3_runQaBatch4B2V3() {
  var steps =
    kidlearnV3_getQaBatchSteps4B2V3();

  if (typeof kidlearnV3_runQaBatchProvidedStepsV3 === 'function') {
    return kidlearnV3_runQaBatchProvidedStepsV3(
      'PHASE_4B_2_PRODUCT_UI_UPGRADE_CHILD_HOME_COURSES',
      steps,
      {
        stopOnFailure: true
      }
    );
  }

  return kidlearnV3_4b2RunLocalBatch_(
    'PHASE_4B_2_PRODUCT_UI_UPGRADE_CHILD_HOME_COURSES',
    steps
  );
}


/**
 * Check UI markers.
 */
function kidlearnV3_4b2CheckUiMarkers_() {
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

  var requiredShellMarkers = [
    'nextLessonCard',
    'courseSummaryGrid',
    'recommendedLessonsList',
    'subjectDetailScreen',
    'subjectDetailTitle'
  ];

  var requiredClientMarkers = [
    'kidlearnV3_getChildHomeCourseContext4BV3',
    'renderChildHome4B',
    'renderCourses4B',
    'openSubjectDetail4B'
  ];

  var requiredStyleMarkers = [
    'kl-next-lesson-card',
    'kl-course-summary-grid',
    'kl-recommended-list',
    'kl-subject-detail-hero'
  ];

  for (var i = 0; i < requiredShellMarkers.length; i++) {
    if (shell.indexOf(requiredShellMarkers[i]) === -1) {
      errors.push(
        'Shell thiếu marker: ' +
        requiredShellMarkers[i]
      );
    }
  }

  for (var j = 0; j < requiredClientMarkers.length; j++) {
    if (client.indexOf(requiredClientMarkers[j]) === -1) {
      errors.push(
        'Client thiếu marker: ' +
        requiredClientMarkers[j]
      );
    }
  }

  for (var k = 0; k < requiredStyleMarkers.length; k++) {
    if (styles.indexOf(requiredStyleMarkers[k]) === -1) {
      errors.push(
        'CSS thiếu marker: ' +
        requiredStyleMarkers[k]
      );
    }
  }

  if (styles.indexOf('Be Vietnam Pro') === -1) {
    warnings.push('CSS không thấy Be Vietnam Pro.');
  }

  if (styles.indexOf('Nunito Sans') === -1) {
    warnings.push('CSS không thấy Nunito Sans.');
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Safe call.
 */
function kidlearnV3_4b2SafeCall_(functionName, arg) {
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
      typeof arg === 'undefined'
        ? fn()
        : fn(arg);

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


/**
 * Save status.
 */
function kidlearnV3_4b2SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_UI_UPGRADE_4B2_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_UI_UPGRADE_4B2_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase: result.phase,
      parentPhase: result.parentPhase || '4B',
      status: status,
      nextBundle:
        KIDLEARN_V3_UI_UPGRADE_4B2_CONFIG.NEXT_BUNDLE,
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


function kidlearnV3_4b2ReadJsonProperty_(key) {
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


function kidlearnV3_4b2RunLocalBatch_(suiteName, steps) {
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
    phase: '4B-2',
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

/**
 * Public wrapper để kiểm tra UI markers 4B-2.
 * Dùng để chạy trực tiếp trong Apps Script editor.
 */
function kidlearnV3_checkUiMarkers4B2V3() {
  var result = kidlearnV3_4b2CheckUiMarkers_();
  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4B-2 UI markers check failed. Errors=' +
      result.errorCount +
      '. ' +
      result.errors.join(' | ')
    );
  }

  return result;
}