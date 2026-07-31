/**
 * ================================================================
 * KIDLEARN V3 - ADD ACCEPT / RETRY BUTTONS TO PARENT REVIEW UI
 * Step: 4F-2
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Add Accept / Retry buttons to Parent Review Queue UI.
 * - Buttons are visible but dry-run only in 4F-2.
 *
 * Safety:
 * - Không ghi DATA_Responses.
 * - Không ghi LOG_Audit.
 * - Không ghi Google Drive.
 * - Không tạo DATA_Assignments.
 * - Không reset DATA_LessonProgress.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4F-2.
 */


var KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4F2_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4F2_LAST_PREVIEW_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4F2_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4F2_LAST_RESULT_JSON'
};


var KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  READY_FOR_4F_3: 'READY_FOR_4F_3',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG = {
  PHASE: '4F-2',
  PARENT_PHASE: '4F',
  PREVIOUS_BUNDLE: '4F-1',
  NEXT_BUNDLE: '4F-3',
  NEXT_STAGE: 'CONTROLLED_UI_WRITE_CONNECT_BUTTONS_TO_BACKEND',
  UI_NAME: 'PARENT_REVIEW_ACCEPT_RETRY_BUTTONS_DRY_RUN',
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


function kidlearnV3_previewParentReviewActionButtonsUi4F2V3() {
  var result =
    kidlearnV3_4f2BuildReadiness_();

  result.action =
    'PREVIEW_PARENT_REVIEW_ACTION_BUTTONS_UI_4F_2_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_STATUS.PREVIEWED
      : KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_STATUS.FAILED;

  kidlearnV3_4f2SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4F-2 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


function kidlearnV3_markParentReviewActionButtonsUi4F2ReadyV3() {
  var preview =
    kidlearnV3_previewParentReviewActionButtonsUi4F2V3();

  if (!preview.success) {
    throw new Error('Preview 4F-2 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_PARENT_REVIEW_ACTION_BUTTONS_UI_4F_2_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_STATUS.READY_FOR_4F_3,
    uiName:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.UI_NAME,
    buttonMode:
      'DRY_RUN_ONLY',
    acceptButtonVisible:
      true,
    retryButtonVisible:
      true,
    backendWriteConnectedNow:
      false,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    message:
      '4F-2 ready. Accept / Retry buttons are added in dry-run mode.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4f2SaveStatus_(
    result,
    KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_STATUS.READY_FOR_4F_3,
    KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


function kidlearnV3_getParentReviewActionButtonsUi4F2StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PARENT_REVIEW_ACTION_BUTTONS_UI_4F_2_STATUS_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4f2ReadJsonProperty_(
        KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_KEYS.LAST_RESULT_JSON
      ),
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.NEXT_STAGE
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


function kidlearnV3_assertParentReviewActionButtonsUi4F2ReadyV3() {
  var status =
    kidlearnV3_getParentReviewActionButtonsUi4F2StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_STATUS.READY_FOR_4F_3
  ) {
    errors.push(
      '4F-2 chưa READY_FOR_4F_3. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PARENT_REVIEW_ACTION_BUTTONS_UI_4F_2_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.PHASE,
    status:
      status.status,
    buttonMode:
      'DRY_RUN_ONLY',
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    errorCount:
      errors.length,
    errors:
      errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(errors.join(' | '));
  }

  return result;
}


function kidlearnV3_runQaBatch4F2V3() {
  var preview =
    kidlearnV3_previewParentReviewActionButtonsUi4F2V3();

  var ready =
    kidlearnV3_markParentReviewActionButtonsUi4F2ReadyV3();

  var assertReady =
    kidlearnV3_assertParentReviewActionButtonsUi4F2ReadyV3();

  var result = {
    success:
      preview.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4F_2_PARENT_REVIEW_ACCEPT_RETRY_BUTTONS_UI_DRY_RUN',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_STATUS.READY_FOR_4F_3,
    buttonMode:
      'DRY_RUN_ONLY',
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    results: {
      preview: preview.success,
      ready: ready.success,
      assertReady: assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4F-2 QA batch failed.');
  }

  return result;
}


function kidlearnV3_4f2BuildReadiness_() {
  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4f2CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var f1 =
    kidlearnV3_4f2SafeCall_(
      'kidlearnV3_assertParentReviewActionUiContract4F1ReadyV3'
    );

  if (!f1.success) {
    errors.push(
      '4F-1 chưa READY_FOR_4F_2: ' +
      f1.message
    );
  }

  var ui5b =
    kidlearnV3_4f2SafeCall_(
      'kidlearnV3_assertParentReviewQueueUi4E5BReadyV3'
    );

  if (!ui5b.success) {
    errors.push(
      '4E-5B Parent Review Queue UI chưa ready: ' +
      ui5b.message
    );
  }

  var policy =
    kidlearnV3_4f2SafeCall_(
      'kidlearnV3_getParentReviewActionUiPolicy4F1V3'
    );

  if (!policy.success) {
    errors.push(
      'Không đọc được 4F-1 UI policy: ' +
      policy.message
    );
  }

  var markers =
    kidlearnV3_4f2InspectUiMarkers_();

  if (!markers.success) {
    errors =
      errors.concat(markers.errors || []);
  }

  warnings =
    warnings.concat(markers.warnings || []);

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_PARENT_REVIEW_ACTION_BUTTONS_UI_READINESS_4F_2_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.PARENT_PHASE,
    uiName:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.UI_NAME,
    prerequisite: {
      phase4F1Ready:
        f1.success === true,
      parentReviewQueueUiReady:
        ui5b.success === true,
      uiPolicyReadable:
        policy.success === true
    },
    uiBehavior: {
      acceptButtonVisible:
        true,
      retryButtonVisible:
        true,
      buttonMode:
        'DRY_RUN_ONLY',
      backendWriteConnectedNow:
        false,
      backendWritePhase:
        '4F-3',
      childRetryFlowCreatedNow:
        false
    },
    uiMarkers:
      markers,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.NEXT_STAGE,
    prodWriteAllowed:
      false,
    realSheetWriteAllowedNow:
      false,
    realDriveWriteAllowedNow:
      false,
    actualSheetWritePerformed:
      false,
    actualDriveWritePerformed:
      false,
    errorCount:
      errors.length,
    warningCount:
      kidlearnV3_4f2UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4f2UniqueArray_(warnings)
  };
}


function kidlearnV3_4f2InspectUiMarkers_() {
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
        .createHtmlOutputFromFile('UI_Product_Client_ParentReviewActions_4F2')
        .getContent();
  } catch (error2) {
    errors.push(
      'Không đọc được UI_Product_Client_ParentReviewActions_4F2: ' +
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
    'UI_Product_Client_ParentReviewActions_4F2'
  ];

  var clientMarkers = [
    'KIDLEARN_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2',
    'injectParentReviewActionButtons4F2',
    'renderParentReviewDryRunFeedback4F2',
    'kidlearnV3_getParentReviewActionUiPolicy4F1V3',
    'kl-parent-review-actions-4f2',
    'parent-review-accept-4f2',
    'parent-review-retry-4f2'
  ];

  var styleMarkers = [
    '.kl-parent-review-actions-4f2',
    '.kl-parent-review-action-button-4f2',
    '.kl-parent-review-accept-4f2',
    '.kl-parent-review-retry-4f2',
    '.kl-parent-review-feedback-4f2',
    '.kl-parent-review-gate-badge-4f2'
  ];

  for (var i = 0; i < shellMarkers.length; i++) {
    if (shell.indexOf(shellMarkers[i]) === -1) {
      errors.push(
        'Shell thiếu include marker: ' +
        shellMarkers[i]
      );
    }
  }

  for (var j = 0; j < clientMarkers.length; j++) {
    if (client.indexOf(clientMarkers[j]) === -1) {
      errors.push(
        'Client 4F-2 thiếu marker: ' +
        clientMarkers[j]
      );
    }
  }

  for (var k = 0; k < styleMarkers.length; k++) {
    if (styles.indexOf(styleMarkers[k]) === -1) {
      errors.push(
        'CSS 4F-2 thiếu marker: ' +
        styleMarkers[k]
      );
    }
  }

  return {
    success:
      errors.length === 0,
    action:
      'INSPECT_PARENT_REVIEW_ACTION_BUTTONS_UI_MARKERS_4F_2_V3',
    errorCount:
      errors.length,
    warningCount:
      warnings.length,
    errors:
      errors,
    warnings:
      warnings
  };
}


function kidlearnV3_4f2CheckDevSafety_() {
  var errors = [];

  var environment = '';

  try {
    if (
      typeof KIDLEARN_V3 !== 'undefined' &&
      KIDLEARN_V3 &&
      KIDLEARN_V3.SCRIPT_PROPERTIES &&
      KIDLEARN_V3.SCRIPT_PROPERTIES.ENVIRONMENT
    ) {
      environment =
        PropertiesService
          .getScriptProperties()
          .getProperty(
            KIDLEARN_V3.SCRIPT_PROPERTIES.ENVIRONMENT
          ) || '';
    }
  } catch (error) {
    // ignore
  }

  if (!environment) {
    environment =
      PropertiesService
        .getScriptProperties()
        .getProperty('KIDLEARN_V3_ENVIRONMENT') ||
      PropertiesService
        .getScriptProperties()
        .getProperty('ENVIRONMENT') ||
      '';
  }

  if (
    String(environment || '').toUpperCase() !== 'DEV'
  ) {
    errors.push(
      'Environment không phải DEV. Current=' +
      (environment || 'UNKNOWN')
    );
  }

  return {
    success:
      errors.length === 0,
    environment:
      environment || 'UNKNOWN',
    prodWriteAllowed:
      false,
    errors:
      errors
  };
}


function kidlearnV3_4f2SafeCall_(functionName) {
  try {
    var exists =
      eval(
        'typeof ' + functionName + ' === "function"'
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

    var output =
      eval(functionName)();

    return {
      success:
        output && output.success === true,
      functionName:
        functionName,
      phase:
        output && output.phase ? output.phase : '',
      status:
        output && output.status ? output.status : '',
      nextBundle:
        output && output.nextBundle ? output.nextBundle : '',
      message:
        output && output.success === true
          ? 'OK'
          : kidlearnV3_4f2PreviewValue_(JSON.stringify(output || {})),
      output:
        output
    };

  } catch (error) {
    return {
      success: false,
      functionName:
        functionName,
      message:
        String(error.message || error),
      output:
        null
    };
  }
}


function kidlearnV3_4f2PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 350) {
    return text.substring(0, 350) + '...';
  }

  return text;
}


function kidlearnV3_4f2UniqueArray_(items) {
  var map = {};
  var result = [];

  for (var i = 0; i < items.length; i++) {
    var value =
      String(items[i] || '');

    if (!value) continue;

    if (!map[value]) {
      map[value] = true;
      result.push(value);
    }
  }

  return result;
}


function kidlearnV3_4f2SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.PARENT_PHASE,
      status:
        status,
      uiName:
        KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.UI_NAME,
      buttonMode:
        result.buttonMode || 'DRY_RUN_ONLY',
      nextBundle:
        KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2_CONFIG.NEXT_STAGE,
      prodWriteAllowed:
        false,
      realSheetWriteAllowedNow:
        false,
      realDriveWriteAllowedNow:
        false,
      actualSheetWritePerformed:
        false,
      actualDriveWritePerformed:
        false,
      errorCount:
        result.errorCount || 0,
      warningCount:
        result.warningCount || 0,
      errors:
        result.errors || [],
      warnings:
        result.warnings || [],
      at:
        new Date().toISOString()
    })
  );
}


function kidlearnV3_4f2ReadJsonProperty_(key) {
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