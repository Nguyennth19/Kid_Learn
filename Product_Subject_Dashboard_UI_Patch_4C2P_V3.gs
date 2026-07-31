/**
 * ================================================================
 * KIDLEARN V3 - SUBJECT DASHBOARD UI PATCH
 * Step: 4C-2P
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Validate routing patch for Subject Dashboard 4C-2.
 * - Validate Home/Courses subject color remap.
 *
 * Safety:
 * - Không ghi Google Sheet dữ liệu học.
 * - Không ghi PROD.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4C-2P.
 */


var KIDLEARN_V3_SUBJECT_DASHBOARD_PATCH_4C2P_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4C2P_STATUS',
  LAST_CHECK_AT: 'KIDLEARN_V3_PHASE_4C2P_LAST_CHECK_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4C2P_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4C2P_LAST_RESULT_JSON'
};


var KIDLEARN_V3_SUBJECT_DASHBOARD_PATCH_4C2P_STATUS = {
  NOT_RUN: 'NOT_RUN',
  CHECK_PASSED: 'CHECK_PASSED',
  READY_FOR_VISUAL_REVIEW: 'READY_FOR_VISUAL_REVIEW',
  FAILED: 'FAILED'
};


function kidlearnV3_checkSubjectDashboardUiPatch4C2PV3() {
  var errors = [];
  var warnings = [];

  var c1 =
    kidlearnV3_4c2pSafeCall_(
      'kidlearnV3_assertSubjectDashboardContext4C1ReadyV3'
    );

  if (!c1.success) {
    errors.push(
      '4C-1 chưa ready: ' +
      c1.message
    );
  }

  var shell = '';
  var patchClient = '';
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
    patchClient =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_SubjectDashboard_Patch_4C2P')
        .getContent();
  } catch (error2) {
    errors.push(
      'Không đọc được UI_Product_Client_SubjectDashboard_Patch_4C2P: ' +
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
    'UI_Product_Client_SubjectDashboard_4C2',
    'UI_Product_Client_SubjectDashboard_Patch_4C2P'
  ];

  var clientMarkers = [
    'KIDLEARN_SUBJECT_DASHBOARD_PATCH_4C2P',
    'applySubjectThemeToAllCards4C2P',
    'routeSubjectClick4C2P',
    'prepareSubjectDetailScreen4C2P',
    'data-kidlearn-open-subject-4c2p',
    'openSubjectDetail4B',
    'MutationObserver'
  ];

  var styleMarkers = [
    'KIDLEARN V3 - Phase 4C-2P',
    '.kl-subject-card-4b.subject-blue',
    '.kl-subject-card-4b.subject-orange',
    '.kl-subject-card-4b.subject-green',
    '.kl-subject-card-4b.subject-red',
    '.kl-subject-hero-4c2 .kl-subject-primary-btn-4c2',
    '.kl-subject-hero-4c2 .kl-subject-secondary-btn-4c2',
    '#subjectDashboard4C2Root'
  ];

  for (var i = 0; i < shellMarkers.length; i++) {
    if (shell.indexOf(shellMarkers[i]) === -1) {
      errors.push('Shell thiếu marker: ' + shellMarkers[i]);
    }
  }

  for (var j = 0; j < clientMarkers.length; j++) {
    if (patchClient.indexOf(clientMarkers[j]) === -1) {
      errors.push('Patch client thiếu marker: ' + clientMarkers[j]);
    }
  }

  for (var k = 0; k < styleMarkers.length; k++) {
    if (styles.indexOf(styleMarkers[k]) === -1) {
      errors.push('CSS patch thiếu marker: ' + styleMarkers[k]);
    }
  }

  var result = {
    success: errors.length === 0,
    action: 'CHECK_SUBJECT_DASHBOARD_UI_PATCH_4C_2P_V3',
    phase: '4C-2P',
    patch:
      'SUBJECT_DASHBOARD_ROUTING_AND_THEME_PATCH',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4c2pSaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_SUBJECT_DASHBOARD_PATCH_4C2P_STATUS.CHECK_PASSED
      : KIDLEARN_V3_SUBJECT_DASHBOARD_PATCH_4C2P_STATUS.FAILED,
    KIDLEARN_V3_SUBJECT_DASHBOARD_PATCH_4C2P_KEYS.LAST_CHECK_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4C-2P patch check failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


function kidlearnV3_markSubjectDashboardUiPatch4C2PReadyV3() {
  var check =
    kidlearnV3_checkSubjectDashboardUiPatch4C2PV3();

  var result = {
    success: true,
    action: 'MARK_SUBJECT_DASHBOARD_UI_PATCH_4C_2P_READY_V3',
    phase: '4C-2P',
    status:
      KIDLEARN_V3_SUBJECT_DASHBOARD_PATCH_4C2P_STATUS.READY_FOR_VISUAL_REVIEW,
    nextStep:
      'Open /exec and visually test Home cards + Subject Dashboard real rendering.',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    check: check,
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4c2pSaveStatus_(
    result,
    KIDLEARN_V3_SUBJECT_DASHBOARD_PATCH_4C2P_STATUS.READY_FOR_VISUAL_REVIEW,
    KIDLEARN_V3_SUBJECT_DASHBOARD_PATCH_4C2P_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


function kidlearnV3_assertSubjectDashboardUiPatch4C2PReadyV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var status =
    properties.getProperty(
      KIDLEARN_V3_SUBJECT_DASHBOARD_PATCH_4C2P_KEYS.STATUS
    ) ||
    KIDLEARN_V3_SUBJECT_DASHBOARD_PATCH_4C2P_STATUS.NOT_RUN;

  var errors = [];

  if (
    status !==
    KIDLEARN_V3_SUBJECT_DASHBOARD_PATCH_4C2P_STATUS.READY_FOR_VISUAL_REVIEW
  ) {
    errors.push(
      '4C-2P chưa READY_FOR_VISUAL_REVIEW. Status=' +
      status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_SUBJECT_DASHBOARD_UI_PATCH_4C_2P_READY_V3',
    phase: '4C-2P',
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


function kidlearnV3_runQaBatch4C2PV3() {
  var check =
    kidlearnV3_checkSubjectDashboardUiPatch4C2PV3();

  var ready =
    kidlearnV3_markSubjectDashboardUiPatch4C2PReadyV3();

  var assertReady =
    kidlearnV3_assertSubjectDashboardUiPatch4C2PReadyV3();

  var result = {
    success:
      check.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4C_2P_SUBJECT_DASHBOARD_ROUTING_AND_THEME_PATCH',
    phase: '4C-2P',
    nextVisualReview:
      'Home cards colors + real Subject Dashboard rendering.',
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
    throw new Error('4C-2P QA batch failed.');
  }

  return result;
}


function kidlearnV3_4c2pSafeCall_(functionName) {
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


function kidlearnV3_4c2pSaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_SUBJECT_DASHBOARD_PATCH_4C2P_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_SUBJECT_DASHBOARD_PATCH_4C2P_KEYS.LAST_RESULT_JSON,
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