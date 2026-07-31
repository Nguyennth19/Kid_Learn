/**
 * ================================================================
 * KIDLEARN V3 - PARENT REVIEW QUEUE UI READ-ONLY
 * Step: 4E-5B
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - QA/readiness for Parent Review Queue UI read-only.
 * - Ensure 4E-5A context is ready.
 * - Ensure UI client and CSS markers are included.
 *
 * Safety:
 * - Không ghi DATA_Responses.
 * - Không ghi LOG_Audit.
 * - Không ghi Drive.
 * - Không đổi reviewStatus.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4E-5B.
 */


var KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4E5B_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4E5B_LAST_PREVIEW_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4E5B_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4E5B_LAST_RESULT_JSON'
};


var KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  READY_FOR_4E_5C: 'READY_FOR_4E_5C',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG = {
  PHASE: '4E-5B',
  PARENT_PHASE: '4E',
  PREVIOUS_BUNDLE: '4E-5A',
  NEXT_BUNDLE: '4E-5C',
  NEXT_STAGE: 'CONTROLLED_REVIEW_ACTION_WRITE',
  UI_NAME: 'PARENT_REVIEW_QUEUE_UI_READ_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


function kidlearnV3_previewParentReviewQueueUi4E5BV3() {
  var result =
    kidlearnV3_4e5bBuildReadiness_();

  result.action =
    'PREVIEW_PARENT_REVIEW_QUEUE_UI_4E_5B_V3';

  kidlearnV3_4e5bSaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_STATUS.PREVIEWED
      : KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_STATUS.FAILED,
    KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4E-5B preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


function kidlearnV3_markParentReviewQueueUi4E5BReadyV3() {
  var preview =
    kidlearnV3_previewParentReviewQueueUi4E5BV3();

  if (!preview.success) {
    throw new Error('Preview 4E-5B chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_PARENT_REVIEW_QUEUE_UI_4E_5B_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_STATUS.READY_FOR_4E_5C,
    uiName:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.UI_NAME,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    message:
      '4E-5B ready. Parent Review Queue UI read-only is ready.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4e5bSaveStatus_(
    result,
    KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_STATUS.READY_FOR_4E_5C,
    KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


function kidlearnV3_getParentReviewQueueUi4E5BStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PARENT_REVIEW_QUEUE_UI_4E_5B_STATUS_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4e5bReadJsonProperty_(
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


function kidlearnV3_assertParentReviewQueueUi4E5BReadyV3() {
  var status =
    kidlearnV3_getParentReviewQueueUi4E5BStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_STATUS.READY_FOR_4E_5C
  ) {
    errors.push(
      '4E-5B chưa READY_FOR_4E_5C. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PARENT_REVIEW_QUEUE_UI_4E_5B_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(errors.join(' | '));
  }

  return result;
}


function kidlearnV3_runQaBatch4E5BV3() {
  var preview =
    kidlearnV3_previewParentReviewQueueUi4E5BV3();

  var ready =
    kidlearnV3_markParentReviewQueueUi4E5BReadyV3();

  var assertReady =
    kidlearnV3_assertParentReviewQueueUi4E5BReadyV3();

  var result = {
    success:
      preview.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4E_5B_PARENT_REVIEW_QUEUE_UI_READ_ONLY',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_STATUS.READY_FOR_4E_5C,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.NEXT_STAGE,
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
    throw new Error('4E-5B QA batch failed.');
  }

  return result;
}


function kidlearnV3_4e5bBuildReadiness_() {
  var errors = [];
  var warnings = [];

  var e5a =
    kidlearnV3_4e5bSafeCall_(
      'kidlearnV3_assertParentReviewQueueContext4E5AReadyV3'
    );

  if (!e5a.success) {
    errors.push(
      '4E-5A chưa READY_FOR_4E_5B: ' +
      e5a.message
    );
  }

  var context =
    kidlearnV3_4e5bSafeCall_(
      'kidlearnV3_getParentReviewQueueContext4E5AV3'
    );

  if (!context.success) {
    errors.push(
      'Không đọc được context 4E-5A: ' +
      context.message
    );
  }

  var dev =
    kidlearnV3_4e5bCheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var uiMarkers =
    kidlearnV3_4e5bInspectUiMarkers_();

  if (!uiMarkers.success) {
    errors =
      errors.concat(uiMarkers.errors || []);
  }

  warnings =
    warnings.concat(uiMarkers.warnings || []);

  var itemCount = 0;
  var pendingCount = 0;

  if (
    context.success &&
    context.output &&
    context.output.reviewQueue
  ) {
    itemCount =
      context.output.reviewQueue.itemCount || 0;

    pendingCount =
      context.output.reviewQueue.pendingCount || 0;
  }

  return {
    success: errors.length === 0,
    action: 'BUILD_PARENT_REVIEW_QUEUE_UI_READINESS_4E_5B_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.PARENT_PHASE,
    uiName:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.UI_NAME,
    itemCount: itemCount,
    pendingCount: pendingCount,
    prerequisite: {
      phase4E5AReady:
        e5a.success === true,
      contextReadable:
        context.success === true
    },
    devSafety: dev,
    uiMarkers: uiMarkers,
    rolePolicy: {
      childCanSeeReviewQueue: false,
      familyAdminCanSeeReviewQueue: true,
      reviewActionWriteEnabledNow: false
    },
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    errorCount: errors.length,
    warningCount:
      kidlearnV3_4e5bUniqueArray_(warnings).length,
    errors: errors,
    warnings:
      kidlearnV3_4e5bUniqueArray_(warnings)
  };
}


function kidlearnV3_4e5bInspectUiMarkers_() {
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
        .createHtmlOutputFromFile('UI_Product_Client_ParentReviewQueue_4E5B')
        .getContent();
  } catch (error2) {
    errors.push(
      'Không đọc được UI_Product_Client_ParentReviewQueue_4E5B: ' +
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
    'UI_Product_Client_ParentReviewQueue_4E5B'
  ];

  var clientMarkers = [
    'KIDLEARN_PARENT_REVIEW_QUEUE_UI_4E5B',
    'openParentReviewQueue4E5B',
    'renderParentReviewQueuePanel4E5B',
    'kidlearnV3_getParentReviewQueueContext4E5AV3',
    'kl-parent-review-entry-4e5b',
    'kl-parent-review-panel-4e5b'
  ];

  var styleMarkers = [
    '.kl-parent-review-entry-4e5b',
    '.kl-parent-review-panel-4e5b',
    '.kl-parent-review-card-4e5b',
    '.kl-parent-review-open-link-4e5b',
    '.kl-parent-review-empty-4e5b'
  ];

  for (var i = 0; i < shellMarkers.length; i++) {
    if (shell.indexOf(shellMarkers[i]) === -1) {
      errors.push(
        'Shell thiếu marker/include: ' +
        shellMarkers[i]
      );
    }
  }

  for (var j = 0; j < clientMarkers.length; j++) {
    if (client.indexOf(clientMarkers[j]) === -1) {
      errors.push(
        'Client 4E-5B thiếu marker: ' +
        clientMarkers[j]
      );
    }
  }

  for (var k = 0; k < styleMarkers.length; k++) {
    if (styles.indexOf(styleMarkers[k]) === -1) {
      errors.push(
        'CSS 4E-5B thiếu marker: ' +
        styleMarkers[k]
      );
    }
  }

  return {
    success: errors.length === 0,
    action: 'INSPECT_PARENT_REVIEW_QUEUE_UI_MARKERS_4E_5B_V3',
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


function kidlearnV3_4e5bCheckDevSafety_() {
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
    success: errors.length === 0,
    environment: environment || 'UNKNOWN',
    prodWriteAllowed: false,
    errors: errors
  };
}


function kidlearnV3_4e5bSafeCall_(functionName) {
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

    var output =
      eval(functionName)();

    return {
      success:
        output && output.success === true,
      functionName:
        functionName,
      message:
        output && output.success === true
          ? ''
          : JSON.stringify(output),
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


function kidlearnV3_4e5bUniqueArray_(items) {
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


function kidlearnV3_4e5bSaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.PARENT_PHASE,
      status: status,
      uiName:
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.UI_NAME,
      itemCount:
        result.itemCount || 0,
      pendingCount:
        result.pendingCount || 0,
      nextBundle:
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_UI_4E5B_CONFIG.NEXT_STAGE,
      prodWriteAllowed: false,
      realSheetWriteAllowedNow: false,
      realDriveWriteAllowedNow: false,
      actualSheetWritePerformed: false,
      actualDriveWritePerformed: false,
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


function kidlearnV3_4e5bReadJsonProperty_(key) {
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