/**
 * ================================================================
 * KIDLEARN V3 - SUBJECT DASHBOARD UI
 * Step: 4C-2
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Validate Subject Dashboard UI integration.
 * - Validate subject theme classes and UI markers.
 *
 * Safety:
 * - Không ghi Google Sheet dữ liệu học.
 * - Không ghi PROD.
 * - Không deploy.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4C-2.
 */


var KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4C2_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4C2_LAST_PREVIEW_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4C2_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4C2_LAST_RESULT_JSON'
};


var KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  READY_FOR_4C_3: 'READY_FOR_4C_3',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG = {
  PHASE: '4C-2',
  PARENT_PHASE: '4C',
  PREVIOUS_BUNDLE: '4C-1',
  NEXT_BUNDLE: '4C-3',
  NEXT_STAGE: 'LESSON_PLAYER_CONTEXT_READ_ONLY',
  UI_NAME: 'SUBJECT_THEME_MAP_AND_SUBJECT_DASHBOARD_UI',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false
};


function kidlearnV3_previewSubjectDashboardUi4C2V3() {
  var errors = [];
  var warnings = [];

  var c1 =
    kidlearnV3_4c2SafeCall_(
      'kidlearnV3_assertSubjectDashboardContext4C1ReadyV3'
    );

  if (!c1.success) {
    errors.push(
      '4C-1 chưa READY_FOR_4C_2: ' +
      c1.message
    );
  }

  var context =
    kidlearnV3_4c2SafeCallWithPayload_(
      'kidlearnV3_getSubjectDashboardContext4C1V3',
      {
        subjectCode: 'MATH'
      }
    );

  if (!context.success) {
    errors.push(
      'Không lấy được context 4C-1 cho MATH: ' +
      context.message
    );
  }

  var marker =
    kidlearnV3_4c2InspectUiMarkers_();

  if (!marker.success) {
    errors =
      errors.concat(marker.errors || []);
  }

  warnings =
    warnings.concat(marker.warnings || []);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_SUBJECT_DASHBOARD_UI_4C_2_V3',
    phase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.PARENT_PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_STATUS.PREVIEWED
        : KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_STATUS.FAILED,
    uiName:
      KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.UI_NAME,
    nextBundle:
      KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.NEXT_BUNDLE,
    subjectThemeDecision: {
      math: 'blue',
      vietnamese: 'orange',
      english: 'green',
      science: 'red'
    },
    prodWriteAllowed: false,
    realWriteAllowed: false,
    markerCheck: marker,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4c2SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4C-2 preview failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


function kidlearnV3_checkSubjectDashboardUi4C2V3() {
  var result =
    kidlearnV3_4c2InspectUiMarkers_();

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4C-2 UI marker check failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


function kidlearnV3_markSubjectDashboardUi4C2ReadyV3() {
  var preview =
    kidlearnV3_previewSubjectDashboardUi4C2V3();

  if (!preview.success) {
    throw new Error('Preview 4C-2 chưa pass.');
  }

  var check =
    kidlearnV3_checkSubjectDashboardUi4C2V3();

  if (!check.success) {
    throw new Error('Marker check 4C-2 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_SUBJECT_DASHBOARD_UI_4C_2_READY_V3',
    phase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_STATUS.READY_FOR_4C_3,
    nextBundle:
      KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    message:
      'Subject Dashboard UI 4C-2 ready. Có thể qua 4C-3 Lesson Player Context Read-only.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4c2SaveStatus_(
    result,
    KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_STATUS.READY_FOR_4C_3,
    KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


function kidlearnV3_getSubjectDashboardUi4C2StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_SUBJECT_DASHBOARD_UI_4C_2_STATUS_V3',
    phase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_KEYS.STATUS
      ) ||
      KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4c2ReadJsonProperty_(
        KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


function kidlearnV3_assertSubjectDashboardUi4C2ReadyV3() {
  var status =
    kidlearnV3_getSubjectDashboardUi4C2StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_STATUS.READY_FOR_4C_3
  ) {
    errors.push(
      '4C-2 chưa READY_FOR_4C_3. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_SUBJECT_DASHBOARD_UI_4C_2_READY_V3',
    phase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.PARENT_PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.NEXT_BUNDLE,
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


function kidlearnV3_runQaBatch4C2V3() {
  var preview =
    kidlearnV3_previewSubjectDashboardUi4C2V3();

  var check =
    kidlearnV3_checkSubjectDashboardUi4C2V3();

  var ready =
    kidlearnV3_markSubjectDashboardUi4C2ReadyV3();

  var assertReady =
    kidlearnV3_assertSubjectDashboardUi4C2ReadyV3();

  var result = {
    success:
      preview.success === true &&
      check.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4C_2_SUBJECT_THEME_MAP_AND_SUBJECT_DASHBOARD_UI',
    phase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.PHASE,
    nextBundle:
      KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    results: {
      preview: preview.success,
      check: check.success,
      ready: ready.success,
      assertReady: assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4C-2 QA batch failed.');
  }

  return result;
}


function kidlearnV3_4c2InspectUiMarkers_() {
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
        .createHtmlOutputFromFile('UI_Product_Client_SubjectDashboard_4C2')
        .getContent();
  } catch (error2) {
    errors.push(
      'Không đọc được UI_Product_Client_SubjectDashboard_4C2: ' +
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
    'UI_Product_Client_SubjectDashboard_4C2'
  ];

  var clientMarkers = [
    'KIDLEARN_SUBJECT_DASHBOARD_UI_4C2',
    'openSubjectDashboard4C2',
    'renderSubjectDashboard4C2',
    'kidlearnV3_getSubjectDashboardContext4C1V3',
    'openLessonFromSubjectDashboard4C2',
    'applySubjectThemeClassesToCourseCards4C2',
    'supportedAnswerModes'
  ];

  var styleMarkers = [
    'kl-subject-dashboard-marker-4c2',
    '.kl-subject-dashboard-4c2',
    '.kl-subject-hero-4c2',
    '.kl-lesson-card-4c2',
    '.kl-skill-card-4c2',
    '.kl-answer-mode-chip-4c2',
    '.kl-subject-theme-blue-4c2',
    '.kl-subject-theme-orange-4c2',
    '.kl-subject-theme-green-4c2',
    '.kl-subject-theme-red-4c2',
    '.kl-subject-card-4b.subject-orange',
    '.kl-subject-card-4b.subject-red'
  ];

  for (var i = 0; i < shellMarkers.length; i++) {
    if (shell.indexOf(shellMarkers[i]) === -1) {
      errors.push('Shell thiếu marker: ' + shellMarkers[i]);
    }
  }

  for (var j = 0; j < clientMarkers.length; j++) {
    if (client.indexOf(clientMarkers[j]) === -1) {
      errors.push('Client 4C-2 thiếu marker: ' + clientMarkers[j]);
    }
  }

  for (var k = 0; k < styleMarkers.length; k++) {
    if (styles.indexOf(styleMarkers[k]) === -1) {
      errors.push('CSS 4C-2 thiếu marker: ' + styleMarkers[k]);
    }
  }

  if (styles.indexOf('#F97316') === -1) {
    warnings.push('CSS chưa thấy màu cam Tiếng Việt #F97316.');
  }

  if (styles.indexOf('#EF4444') === -1) {
    warnings.push('CSS chưa thấy màu đỏ Khoa học #EF4444.');
  }

  return {
    success: errors.length === 0,
    action: 'INSPECT_SUBJECT_DASHBOARD_UI_4C_2_MARKERS_V3',
    phase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.PHASE,
    uiName:
      KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.UI_NAME,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


function kidlearnV3_4c2SafeCall_(functionName) {
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


function kidlearnV3_4c2SafeCallWithPayload_(functionName, payload) {
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
      fn(payload || {});

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


function kidlearnV3_4c2SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase: result.phase,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.PARENT_PHASE,
      status: status,
      nextBundle:
        KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_SUBJECT_DASHBOARD_UI_4C2_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4c2ReadJsonProperty_(key) {
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