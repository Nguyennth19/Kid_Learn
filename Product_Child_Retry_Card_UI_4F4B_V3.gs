/**
 * ================================================================
 * KIDLEARN V3 - CHILD HOME RETRY CARD UI READ-ONLY
 * Step: 4F-4B
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Add "Bài cần làm lại" card on Child Home.
 * - Read from 4F-4A child retry context.
 * - UI is read-only in this step.
 *
 * Safety:
 * - Không ghi DATA_Responses.
 * - Không ghi LOG_Audit.
 * - Không ghi Google Drive.
 * - Không tạo DATA_Assignments.
 * - Không reset DATA_LessonProgress.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4F-4B.
 */


var KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4F4B_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4F4B_LAST_PREVIEW_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4F4B_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4F4B_LAST_RESULT_JSON'
};


var KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  READY_FOR_4F_4C: 'READY_FOR_4F_4C',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG = {
  PHASE: '4F-4B',
  PARENT_PHASE: '4F',
  PREVIOUS_BUNDLE: '4F-4A',
  NEXT_BUNDLE: '4F-4C',
  NEXT_STAGE: 'RETRY_LESSON_ROUTING',
  UI_NAME: 'CHILD_HOME_RETRY_CARD_READ_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Preview UI readiness.
 */
function kidlearnV3_previewChildRetryCardUi4F4BV3() {
  var result =
    kidlearnV3_4f4bBuildReadiness_();

  result.action =
    'PREVIEW_CHILD_RETRY_CARD_UI_4F_4B_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_STATUS.PREVIEWED
      : KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_STATUS.FAILED;

  kidlearnV3_4f4bSaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4F-4B preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready for 4F-4C.
 */
function kidlearnV3_markChildRetryCardUi4F4BReadyV3() {
  var preview =
    kidlearnV3_previewChildRetryCardUi4F4BV3();

  if (!preview.success) {
    throw new Error('Preview 4F-4B chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_CHILD_RETRY_CARD_UI_4F_4B_READY_V3',
    phase:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_STATUS.READY_FOR_4F_4C,
    uiName:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.UI_NAME,
    retryCount:
      preview.retryContext && preview.retryContext.retryQueue
        ? preview.retryContext.retryQueue.retryCount
        : 0,
    uiMode:
      'READ_ONLY',
    routingConnectedNow:
      false,
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    message:
      '4F-4B ready. Có thể qua 4F-4C để nối nút Làm lại bài này vào Lesson Player.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4f4bSaveStatus_(
    result,
    KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_STATUS.READY_FOR_4F_4C,
    KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getChildRetryCardUi4F4BStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_CHILD_RETRY_CARD_UI_4F_4B_STATUS_V3',
    phase:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_KEYS.STATUS
      ) ||
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4f4bReadJsonProperty_(
        KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_KEYS.LAST_RESULT_JSON
      ),
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertChildRetryCardUi4F4BReadyV3() {
  var status =
    kidlearnV3_getChildRetryCardUi4F4BStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_STATUS.READY_FOR_4F_4C
  ) {
    errors.push(
      '4F-4B chưa READY_FOR_4F_4C. Status=' +
      status.status
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_CHILD_RETRY_CARD_UI_4F_4B_READY_V3',
    phase:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.PHASE,
    status:
      status.status,
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.NEXT_STAGE,
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


/**
 * QA batch.
 */
function kidlearnV3_runQaBatch4F4BV3() {
  var preview =
    kidlearnV3_previewChildRetryCardUi4F4BV3();

  var ready =
    kidlearnV3_markChildRetryCardUi4F4BReadyV3();

  var assertReady =
    kidlearnV3_assertChildRetryCardUi4F4BReadyV3();

  var result = {
    success:
      preview.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4F_4B_CHILD_HOME_RETRY_CARD_UI_READ_ONLY',
    phase:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.PHASE,
    status:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_STATUS.READY_FOR_4F_4C,
    uiMode:
      'READ_ONLY',
    retryCount:
      preview.retryContext && preview.retryContext.retryQueue
        ? preview.retryContext.retryQueue.retryCount
        : 0,
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.NEXT_STAGE,
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
    throw new Error('4F-4B QA batch failed.');
  }

  return result;
}


/**
 * Build readiness.
 */
function kidlearnV3_4f4bBuildReadiness_() {
  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4f4bCheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var f4a =
    kidlearnV3_4f4bSafeCall_(
      'kidlearnV3_assertChildRetryContext4F4AReadyV3'
    );

  if (!f4a.success) {
    errors.push(
      '4F-4A chưa READY_FOR_4F_4B: ' +
      f4a.message
    );
  }

  var retryContext =
    kidlearnV3_4f4bSafeCall_(
      'kidlearnV3_getChildRetryContext4F4AV3'
    );

  if (!retryContext.success) {
    errors.push(
      'Không đọc được 4F-4A child retry context: ' +
      retryContext.message
    );
  }

  var markers =
    kidlearnV3_4f4bInspectUiMarkers_();

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
      'BUILD_CHILD_RETRY_CARD_UI_READINESS_4F_4B_V3',
    phase:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.PARENT_PHASE,
    uiName:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.UI_NAME,
    prerequisite: {
      phase4F4AReady:
        f4a.success === true,
      childRetryContextReadable:
        retryContext.success === true
    },
    retryContext:
      retryContext.output || null,
    uiBehavior: {
      childHomeCardEnabled:
        true,
      showOnlyWhenRetryCountGreaterThanZero:
        true,
      emptyRetryQueueIsValid:
        true,
      openLessonRoutingConnectedNow:
        false,
      openLessonRoutingPhase:
        '4F-4C',
      readOnlyNow:
        true
    },
    uiMarkers:
      markers,
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.NEXT_STAGE,
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
      kidlearnV3_4f4bUniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4f4bUniqueArray_(warnings)
  };
}


/**
 * UI marker inspection.
 */
function kidlearnV3_4f4bInspectUiMarkers_() {
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
        .createHtmlOutputFromFile('UI_Product_Client_ChildRetryHome_4F4B')
        .getContent();
  } catch (error2) {
    errors.push(
      'Không đọc được UI_Product_Client_ChildRetryHome_4F4B: ' +
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
    'UI_Product_Client_ChildRetryHome_4F4B'
  ];

  var clientMarkers = [
    'KIDLEARN_CHILD_RETRY_HOME_UI_4F4B',
    'ensureChildRetryHomeCard4F4B',
    'renderChildRetryHomeCard4F4B',
    'openChildRetryPanel4F4B',
    'kidlearnV3_getChildRetryContext4F4AV3',
    'kl-child-retry-entry-4f4b',
    'kl-child-retry-panel-4f4b',
    'kl-child-retry-card-4f4b',
    'kl-child-retry-open-4f4b'
  ];

  var styleMarkers = [
    '.kl-child-retry-entry-4f4b',
    '.kl-child-retry-panel-4f4b',
    '.kl-child-retry-card-4f4b',
    '.kl-child-retry-open-4f4b',
    '.kl-child-retry-empty-4f4b',
    '.kl-child-retry-badge-4f4b'
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
        'Client 4F-4B thiếu marker: ' +
        clientMarkers[j]
      );
    }
  }

  for (var k = 0; k < styleMarkers.length; k++) {
    if (styles.indexOf(styleMarkers[k]) === -1) {
      errors.push(
        'CSS 4F-4B thiếu marker: ' +
        styleMarkers[k]
      );
    }
  }

  return {
    success:
      errors.length === 0,
    action:
      'INSPECT_CHILD_RETRY_HOME_UI_MARKERS_4F_4B_V3',
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


/**
 * DEV safety.
 */
function kidlearnV3_4f4bCheckDevSafety_() {
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


/**
 * Generic helpers.
 */
function kidlearnV3_4f4bSafeCall_(functionName) {
  try {
    var exists =
      eval(
        'typeof ' + functionName + ' === "function"'
      );

    if (!exists) {
      return {
        success: false,
        functionName:
          functionName,
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
          : kidlearnV3_4f4bPreviewValue_(JSON.stringify(output || {})),
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


function kidlearnV3_4f4bPreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 350) {
    return text.substring(0, 350) + '...';
  }

  return text;
}


function kidlearnV3_4f4bUniqueArray_(items) {
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


function kidlearnV3_4f4bSaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.PARENT_PHASE,
      status:
        status,
      uiName:
        KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.UI_NAME,
      retryCount:
        result.retryContext && result.retryContext.retryQueue
          ? result.retryContext.retryQueue.retryCount
          : result.retryCount || 0,
      nextBundle:
        KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_CHILD_RETRY_CARD_UI_4F4B_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4f4bReadJsonProperty_(key) {
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