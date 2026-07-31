/**
 * ================================================================
 * KIDLEARN V3 - CHILD RETRY FLOW QA READY
 * Step: 4F-4D
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Final QA readiness for Child Retry Flow.
 * - Confirm 4F-4A / 4F-4B / 4F-4C are ready.
 * - Prepare for 4F-5 Phase Lock.
 *
 * Safety:
 * - Không ghi DATA_Responses.
 * - Không ghi LOG_Audit.
 * - Không ghi Google Drive.
 * - Không tạo DATA_Assignments.
 * - Không reset DATA_LessonProgress.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4F-4D.
 */


var KIDLEARN_V3_CHILD_RETRY_QA_4F4D_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4F4D_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4F4D_LAST_PREVIEW_AT',
  LAST_CHECK_AT: 'KIDLEARN_V3_PHASE_4F4D_LAST_CHECK_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4F4D_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4F4D_LAST_RESULT_JSON'
};


var KIDLEARN_V3_CHILD_RETRY_QA_4F4D_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  CHECK_PASSED: 'CHECK_PASSED',
  READY_FOR_4F_5: 'READY_FOR_4F_5',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG = {
  PHASE: '4F-4D',
  PARENT_PHASE: '4F',
  PREVIOUS_BUNDLE: '4F-4C',
  NEXT_BUNDLE: '4F-5',
  NEXT_STAGE: 'QA_AND_PHASE_4F_LOCK',
  QA_NAME: 'CHILD_RETRY_FLOW_QA_READY',
  EXPECTED_GATE_MODE: 'CLOSED_DRY_RUN_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Preview 4F-4D readiness.
 */
function kidlearnV3_previewChildRetryQaReady4F4DV3() {
  var result =
    kidlearnV3_4f4dBuildReadiness_();

  result.action =
    'PREVIEW_CHILD_RETRY_QA_READY_4F_4D_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_CHILD_RETRY_QA_4F4D_STATUS.PREVIEWED
      : KIDLEARN_V3_CHILD_RETRY_QA_4F4D_STATUS.FAILED;

  kidlearnV3_4f4dSaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_CHILD_RETRY_QA_4F4D_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4F-4D preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Run QA check 4F-4D.
 */
function kidlearnV3_runChildRetryQaReady4F4DV3() {
  var result =
    kidlearnV3_4f4dBuildReadiness_();

  result.action =
    'RUN_CHILD_RETRY_QA_READY_4F_4D_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_CHILD_RETRY_QA_4F4D_STATUS.CHECK_PASSED
      : KIDLEARN_V3_CHILD_RETRY_QA_4F4D_STATUS.FAILED;

  kidlearnV3_4f4dSaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_CHILD_RETRY_QA_4F4D_KEYS.LAST_CHECK_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4F-4D QA check failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 4F-4D ready for 4F-5.
 */
function kidlearnV3_markChildRetryQaReady4F4DReadyV3() {
  var check =
    kidlearnV3_runChildRetryQaReady4F4DV3();

  if (!check.success) {
    throw new Error('4F-4D check chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_CHILD_RETRY_QA_READY_4F_4D_READY_V3',
    phase:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_STATUS.READY_FOR_4F_5,
    qaName:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.QA_NAME,
    retryCount:
      check.retryContextSummary.retryCount,
    gateMode:
      check.gateSummary.gateMode,
    gateClosed:
      check.gateSummary.gateClosed,
    componentSummary:
      check.componentSummary,
    uiMarkerSummary:
      check.uiMarkerSummary,
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    message:
      '4F-4D ready. Có thể qua 4F-5 để khóa Phase 4F.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4f4dSaveStatus_(
    result,
    KIDLEARN_V3_CHILD_RETRY_QA_4F4D_STATUS.READY_FOR_4F_5,
    KIDLEARN_V3_CHILD_RETRY_QA_4F4D_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getChildRetryQaReady4F4DStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_CHILD_RETRY_QA_READY_4F_4D_STATUS_V3',
    phase:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_CHILD_RETRY_QA_4F4D_KEYS.STATUS
      ) ||
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_CHILD_RETRY_QA_4F4D_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastCheckAt:
      properties.getProperty(
        KIDLEARN_V3_CHILD_RETRY_QA_4F4D_KEYS.LAST_CHECK_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_CHILD_RETRY_QA_4F4D_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4f4dReadJsonProperty_(
        KIDLEARN_V3_CHILD_RETRY_QA_4F4D_KEYS.LAST_RESULT_JSON
      ),
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready for 4F-5.
 */
function kidlearnV3_assertChildRetryQaReady4F4DReadyV3() {
  var status =
    kidlearnV3_getChildRetryQaReady4F4DStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_CHILD_RETRY_QA_4F4D_STATUS.READY_FOR_4F_5
  ) {
    errors.push(
      '4F-4D chưa READY_FOR_4F_5. Status=' +
      status.status
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_CHILD_RETRY_QA_READY_4F_4D_READY_V3',
    phase:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.PHASE,
    status:
      status.status,
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.NEXT_STAGE,
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
 * QA batch 4F-4D.
 */
function kidlearnV3_runQaBatch4F4DV3() {
  var preview =
    kidlearnV3_previewChildRetryQaReady4F4DV3();

  var check =
    kidlearnV3_runChildRetryQaReady4F4DV3();

  var ready =
    kidlearnV3_markChildRetryQaReady4F4DReadyV3();

  var assertReady =
    kidlearnV3_assertChildRetryQaReady4F4DReadyV3();

  var result = {
    success:
      preview.success === true &&
      check.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4F_4D_CHILD_RETRY_FLOW_QA_READY',
    phase:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.PHASE,
    status:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_STATUS.READY_FOR_4F_5,
    retryCount:
      check.retryContextSummary.retryCount,
    gateMode:
      check.gateSummary.gateMode,
    gateClosed:
      check.gateSummary.gateClosed,
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    results: {
      preview: preview.success,
      check: check.success,
      ready: ready.success,
      assertReady: assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4F-4D QA batch failed.');
  }

  return result;
}


/**
 * Build readiness.
 */
function kidlearnV3_4f4dBuildReadiness_() {
  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4f4dCheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var gateSummary =
    kidlearnV3_4f4dInspectGate_();

  if (!gateSummary.success) {
    errors.push(
      'Không kiểm tra được 4F-3 gate: ' +
      gateSummary.message
    );
  } else if (!gateSummary.gateClosed) {
    errors.push(
      '4F-3 gate đang mở. Vui lòng đóng gate trước khi chuẩn bị lock 4F. Current=' +
      gateSummary.gateMode
    );
  }

  var componentChecks = [
    {
      key: '4F-3',
      label: 'Controlled UI Write Gate',
      required: true,
      check:
        kidlearnV3_4f4dSafeCall_(
          'kidlearnV3_assertParentReviewUiWriteGate4F3ReadyV3'
        )
    },
    {
      key: '4F-4A',
      label: 'Child Retry Context Read-only',
      required: true,
      check:
        kidlearnV3_4f4dSafeCall_(
          'kidlearnV3_assertChildRetryContext4F4AReadyV3'
        )
    },
    {
      key: '4F-4B',
      label: 'Child Home Retry Card UI Read-only',
      required: true,
      check:
        kidlearnV3_4f4dSafeCall_(
          'kidlearnV3_assertChildRetryCardUi4F4BReadyV3'
        )
    },
    {
      key: '4F-4C',
      label: 'Retry Lesson Routing',
      required: true,
      check:
        kidlearnV3_4f4dSafeCall_(
          'kidlearnV3_assertChildRetryLessonRouting4F4CReadyV3'
        )
    }
  ];

  for (var i = 0; i < componentChecks.length; i++) {
    if (
      componentChecks[i].required &&
      componentChecks[i].check.success !== true
    ) {
      errors.push(
        componentChecks[i].key +
        ' chưa ready: ' +
        componentChecks[i].check.message
      );
    }
  }

  var retryContextSummary =
    kidlearnV3_4f4dInspectRetryContext_();

  if (!retryContextSummary.success) {
    errors.push(
      'Không đọc được retry context: ' +
      retryContextSummary.message
    );
  }

  if (
    retryContextSummary.success &&
    retryContextSummary.retryCount === 0
  ) {
    warnings.push(
      'retryCount = 0. Đây là hợp lệ nếu chưa có bài REVIEWED_RETRY để test UI thực tế.'
    );
  }

  var routeSummary =
    kidlearnV3_4f4dInspectRouteIfAvailable_(
      retryContextSummary
    );

  if (!routeSummary.success && retryContextSummary.retryCount > 0) {
    errors.push(
      'Có retry item nhưng route không pass: ' +
      routeSummary.message
    );
  }

  if (!routeSummary.success && retryContextSummary.retryCount === 0) {
    warnings.push(
      'Không test route thực tế vì retryCount = 0. Đây là hợp lệ.'
    );
  }

  var uiMarkerSummary =
    kidlearnV3_4f4dInspectUiMarkers_();

  if (!uiMarkerSummary.success) {
    errors =
      errors.concat(uiMarkerSummary.errors || []);
  }

  warnings =
    warnings.concat(uiMarkerSummary.warnings || []);

  var componentSummary =
    kidlearnV3_4f4dBuildComponentSummary_(
      componentChecks
    );

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_CHILD_RETRY_QA_READY_4F_4D_V3',
    phase:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.PARENT_PHASE,
    qaName:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.QA_NAME,
    devSafety:
      dev,
    gateSummary:
      gateSummary,
    componentSummary:
      componentSummary,
    retryContextSummary:
      retryContextSummary,
    routeSummary:
      routeSummary,
    uiMarkerSummary:
      uiMarkerSummary,
    readyForPhaseLock:
      errors.length === 0,
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.NEXT_STAGE,
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
      kidlearnV3_4f4dUniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4f4dUniqueArray_(warnings)
  };
}


/**
 * Gate inspection.
 */
function kidlearnV3_4f4dInspectGate_() {
  try {
    if (
      typeof kidlearnV3_getParentReviewUiWriteGate4F3StatusV3 !== 'function'
    ) {
      return {
        success: false,
        message:
          'Thiếu kidlearnV3_getParentReviewUiWriteGate4F3StatusV3'
      };
    }

    var gate =
      kidlearnV3_getParentReviewUiWriteGate4F3StatusV3();

    var gateMode =
      String(gate.gateMode || '').trim();

    return {
      success:
        gate.success === true,
      gateMode:
        gateMode,
      gateClosed:
        gateMode === KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.EXPECTED_GATE_MODE,
      expectedGateMode:
        KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.EXPECTED_GATE_MODE,
      writeAllowedNow:
        gate.writeAllowedNow === true,
      message:
        gate.success === true ? 'OK' : JSON.stringify(gate)
    };

  } catch (error) {
    return {
      success: false,
      gateMode: '',
      gateClosed: false,
      message:
        String(error.message || error)
    };
  }
}


/**
 * Retry context inspection.
 */
function kidlearnV3_4f4dInspectRetryContext_() {
  try {
    if (
      typeof kidlearnV3_getChildRetryContext4F4AV3 !== 'function'
    ) {
      return {
        success: false,
        retryCount: 0,
        message:
          'Thiếu kidlearnV3_getChildRetryContext4F4AV3'
      };
    }

    var context =
      kidlearnV3_getChildRetryContext4F4AV3({
        childId: 'CHD_V2_CHILD_DEFAULT',
        limit: 100
      });

    var retryQueue =
      context.retryQueue || {};

    var items =
      retryQueue.items || [];

    return {
      success:
        context.success === true,
      retryCount:
        Number(retryQueue.retryCount || items.length || 0),
      itemCount:
        Number(retryQueue.itemCount || items.length || 0),
      targetReviewStatus:
        context.targetReviewStatus || '',
      firstItem:
        items.length > 0
          ? {
              responseId:
                items[0].responseId || '',
              lessonId:
                items[0].lessonId || '',
              subjectCode:
                items[0].subjectCode || '',
              reviewStatus:
                items[0].reviewStatus || ''
            }
          : null,
      emptyStateValid:
        items.length === 0,
      message:
        context.success === true ? 'OK' : JSON.stringify(context)
    };

  } catch (error) {
    return {
      success: false,
      retryCount: 0,
      itemCount: 0,
      firstItem: null,
      message:
        String(error.message || error)
    };
  }
}


/**
 * Test route only if retry item exists.
 */
function kidlearnV3_4f4dInspectRouteIfAvailable_(retryContextSummary) {
  retryContextSummary =
    retryContextSummary || {};

  if (
    !retryContextSummary.firstItem ||
    retryContextSummary.retryCount <= 0
  ) {
    return {
      success: false,
      skipped:
        true,
      reason:
        'NO_RETRY_ITEM',
      message:
        'retryCount = 0, bỏ qua route test thực tế.'
    };
  }

  try {
    if (
      typeof kidlearnV3_getRetryLessonRoute4F4CV3 !== 'function'
    ) {
      return {
        success: false,
        skipped:
          false,
        message:
          'Thiếu kidlearnV3_getRetryLessonRoute4F4CV3'
      };
    }

    var item =
      retryContextSummary.firstItem;

    var routeResult =
      kidlearnV3_getRetryLessonRoute4F4CV3({
        childId:
          'CHD_V2_CHILD_DEFAULT',
        responseId:
          item.responseId,
        lessonId:
          item.lessonId
      });

    var route =
      routeResult.route || {};

    return {
      success:
        routeResult.success === true &&
        !!route.lessonId,
      skipped:
        false,
      responseId:
        route.responseId || item.responseId || '',
      lessonId:
        route.lessonId || item.lessonId || '',
      subjectCode:
        route.subjectCode || item.subjectCode || '',
      openMode:
        route.openMode || '',
      writesNow:
        route.writesNow === true,
      createsAssignmentNow:
        route.createsAssignmentNow === true,
      resetsLessonProgressNow:
        route.resetsLessonProgressNow === true,
      message:
        routeResult.success === true ? 'OK' : JSON.stringify(routeResult)
    };

  } catch (error) {
    return {
      success: false,
      skipped:
        false,
      message:
        String(error.message || error)
    };
  }
}


/**
 * UI markers.
 */
function kidlearnV3_4f4dInspectUiMarkers_() {
  var errors = [];
  var warnings = [];

  var shell = '';
  var client4f4b = '';
  var client4f4c = '';
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
    client4f4b =
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
    client4f4c =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_ChildRetryRouting_4F4C')
        .getContent();
  } catch (error3) {
    errors.push(
      'Không đọc được UI_Product_Client_ChildRetryRouting_4F4C: ' +
      String(error3.message || error3)
    );
  }

  try {
    styles =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Styles_4A')
        .getContent();
  } catch (error4) {
    errors.push(
      'Không đọc được UI_Product_Styles_4A: ' +
      String(error4.message || error4)
    );
  }

  var shellMarkers = [
    'UI_Product_Client_ChildRetryHome_4F4B',
    'UI_Product_Client_ChildRetryRouting_4F4C'
  ];

  var clientMarkers4F4B = [
    'KIDLEARN_CHILD_RETRY_HOME_UI_4F4B',
    'ensureChildRetryHomeCard4F4B',
    'openChildRetryPanel4F4B',
    'kl-child-retry-entry-4f4b',
    'kl-child-retry-card-4f4b'
  ];

  var clientMarkers4F4C = [
    'KIDLEARN_CHILD_RETRY_ROUTING_UI_4F4C',
    'patchChildRetryButtonsForRouting4F4C',
    'openRetryLesson4F4C',
    'kidlearnV3_getRetryLessonRoute4F4CV3',
    'open-retry-lesson-4f4c'
  ];

  var styleMarkers = [
    '.kl-child-retry-entry-4f4b',
    '.kl-child-retry-panel-4f4b',
    '.kl-child-retry-card-4f4b',
    '.kl-child-retry-routing-4f4c',
    '.kl-child-retry-routing-feedback-4f4c'
  ];

  kidlearnV3_4f4dCheckMarkers_(
    shell,
    shellMarkers,
    'Shell',
    errors
  );

  kidlearnV3_4f4dCheckMarkers_(
    client4f4b,
    clientMarkers4F4B,
    'Client 4F-4B',
    errors
  );

  kidlearnV3_4f4dCheckMarkers_(
    client4f4c,
    clientMarkers4F4C,
    'Client 4F-4C',
    errors
  );

  kidlearnV3_4f4dCheckMarkers_(
    styles,
    styleMarkers,
    'CSS',
    errors
  );

  return {
    success:
      errors.length === 0,
    action:
      'INSPECT_CHILD_RETRY_FLOW_UI_MARKERS_4F_4D_V3',
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


function kidlearnV3_4f4dCheckMarkers_(content, markers, label, errors) {
  content =
    String(content || '');

  for (var i = 0; i < markers.length; i++) {
    if (content.indexOf(markers[i]) === -1) {
      errors.push(
        label + ' thiếu marker: ' + markers[i]
      );
    }
  }
}


function kidlearnV3_4f4dBuildComponentSummary_(componentChecks) {
  var summary = [];

  for (var i = 0; i < componentChecks.length; i++) {
    summary.push({
      key:
        componentChecks[i].key,
      label:
        componentChecks[i].label,
      required:
        componentChecks[i].required === true,
      success:
        componentChecks[i].check.success === true,
      phase:
        componentChecks[i].check.phase || '',
      status:
        componentChecks[i].check.status || '',
      nextBundle:
        componentChecks[i].check.nextBundle || '',
      message:
        componentChecks[i].check.success === true
          ? 'OK'
          : componentChecks[i].check.message
    });
  }

  return summary;
}


/**
 * DEV safety.
 */
function kidlearnV3_4f4dCheckDevSafety_() {
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
function kidlearnV3_4f4dSafeCall_(functionName) {
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
          : kidlearnV3_4f4dPreviewValue_(JSON.stringify(output || {})),
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


function kidlearnV3_4f4dPreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 350) {
    return text.substring(0, 350) + '...';
  }

  return text;
}


function kidlearnV3_4f4dUniqueArray_(items) {
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


function kidlearnV3_4f4dSaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_CHILD_RETRY_QA_4F4D_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_CHILD_RETRY_QA_4F4D_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.PARENT_PHASE,
      status:
        status,
      qaName:
        KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.QA_NAME,
      retryCount:
        result.retryContextSummary
          ? result.retryContextSummary.retryCount
          : result.retryCount || 0,
      gateMode:
        result.gateSummary
          ? result.gateSummary.gateMode
          : result.gateMode || '',
      gateClosed:
        result.gateSummary
          ? result.gateSummary.gateClosed === true
          : result.gateClosed === true,
      nextBundle:
        KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_CHILD_RETRY_QA_4F4D_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4f4dReadJsonProperty_(key) {
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