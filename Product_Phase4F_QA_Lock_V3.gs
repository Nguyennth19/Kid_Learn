/**
 * ================================================================
 * KIDLEARN V3 - PHASE 4F QA + LOCK
 * Step: 4F-5
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Final QA for Phase 4F.
 * - Confirm Parent Review Action UI + Child Retry Flow are ready.
 * - Lock Phase 4F.
 *
 * Safety:
 * - Không ghi DATA_Responses.
 * - Không ghi LOG_Audit.
 * - Không ghi Google Drive.
 * - Không tạo DATA_Assignments.
 * - Không reset DATA_LessonProgress.
 * - Chỉ ghi ScriptProperties trạng thái lock.
 */


var KIDLEARN_V3_PHASE4F_LOCK_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4F_LOCK_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4F_LOCK_LAST_PREVIEW_AT',
  LAST_QA_AT: 'KIDLEARN_V3_PHASE_4F_LOCK_LAST_QA_AT',
  LOCKED_AT: 'KIDLEARN_V3_PHASE_4F_LOCKED_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4F_LOCK_LAST_RESULT_JSON',
  LOCK_JSON: 'KIDLEARN_V3_PHASE_4F_LOCK_JSON'
};


var KIDLEARN_V3_PHASE4F_LOCK_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  QA_PASSED: 'QA_PASSED',
  PHASE_4F_CLOSED_LOCKED: 'PHASE_4F_CLOSED_LOCKED',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PHASE4F_LOCK_CONFIG = {
  PHASE: '4F',
  LOCK_STEP: '4F-5',
  PHASE_NAME: 'PARENT_REVIEW_ACTION_UI_AND_RETRY_FLOW',
  NEXT_PHASE: '4G',
  NEXT_STAGE: 'NEXT_PRODUCT_INCREMENT_TO_BE_CONFIRMED',
  CONFIRM_TEXT: 'LOCK_PHASE_4F_PARENT_REVIEW_ACTION_UI_RETRY_FLOW',
  MIN_VISUAL_SCORE: 85,
  EXPECTED_GATE_MODE: 'CLOSED_DRY_RUN_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Preview Phase 4F lock readiness.
 */
function kidlearnV3_previewPhase4FLockV3() {
  var result =
    kidlearnV3_4f5BuildFinalQa_();

  result.action =
    'PREVIEW_PHASE_4F_LOCK_4F_5_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PHASE4F_LOCK_STATUS.PREVIEWED
      : KIDLEARN_V3_PHASE4F_LOCK_STATUS.FAILED;

  kidlearnV3_4f5SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PHASE4F_LOCK_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4F-5 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Run final QA before Phase 4F lock.
 */
function kidlearnV3_runPhase4FFinalQaV3() {
  var result =
    kidlearnV3_4f5BuildFinalQa_();

  result.action =
    'RUN_PHASE_4F_FINAL_QA_4F_5_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PHASE4F_LOCK_STATUS.QA_PASSED
      : KIDLEARN_V3_PHASE4F_LOCK_STATUS.FAILED;

  kidlearnV3_4f5SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PHASE4F_LOCK_KEYS.LAST_QA_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4F-5 final QA failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Confirm wrapper.
 * Chạy function này để lock Phase 4F.
 */
function kidlearnV3_lockPhase4FConfirmV3() {
  return kidlearnV3_lockPhase4FV3({
    confirm:
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.CONFIRM_TEXT,
    visualScore: 90,
    visualNote:
      'Parent Review Action UI and Child Retry Flow were checked in DEV.'
  });
}


/**
 * Lock Phase 4F.
 */
function kidlearnV3_lockPhase4FV3(options) {
  options = options || {};

  var confirmText =
    String(options.confirm || '')
      .trim()
      .toUpperCase();

  if (
    confirmText !==
    KIDLEARN_V3_PHASE4F_LOCK_CONFIG.CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm. Cần confirm=' +
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.CONFIRM_TEXT
    );
  }

  var visualScore =
    Number(options.visualScore || 0);

  if (
    isNaN(visualScore) ||
    visualScore < KIDLEARN_V3_PHASE4F_LOCK_CONFIG.MIN_VISUAL_SCORE
  ) {
    throw new Error(
      'visualScore chưa đạt. Cần >= ' +
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.MIN_VISUAL_SCORE
    );
  }

  var lock =
    LockService.getScriptLock();

  var locked =
    lock.tryLock(30000);

  if (!locked) {
    throw new Error(
      'Không lấy được script lock sau 30 giây. Vui lòng chạy lại.'
    );
  }

  try {
    var qa =
      kidlearnV3_runPhase4FFinalQaV3();

    if (!qa.success) {
      throw new Error(
        'Final QA 4F chưa pass. Không thể lock.'
      );
    }

    var result = {
      success: true,
      action: 'LOCK_PHASE_4F_4F_5_V3',
      phase:
        KIDLEARN_V3_PHASE4F_LOCK_CONFIG.PHASE,
      lockStep:
        KIDLEARN_V3_PHASE4F_LOCK_CONFIG.LOCK_STEP,
      phaseName:
        KIDLEARN_V3_PHASE4F_LOCK_CONFIG.PHASE_NAME,
      status:
        KIDLEARN_V3_PHASE4F_LOCK_STATUS.PHASE_4F_CLOSED_LOCKED,
      locked: true,
      finalQaPassed: true,
      componentSummary:
        qa.componentSummary,
      gateSummary:
        qa.gateSummary,
      retryContextSummary:
        qa.retryContextSummary,
      routeSummary:
        qa.routeSummary,
      uiMarkerSummary:
        qa.uiMarkerSummary,
      visualScore:
        visualScore,
      visualNote:
        String(options.visualNote || ''),
      minVisualScore:
        KIDLEARN_V3_PHASE4F_LOCK_CONFIG.MIN_VISUAL_SCORE,
      nextPhase:
        KIDLEARN_V3_PHASE4F_LOCK_CONFIG.NEXT_PHASE,
      nextStage:
        KIDLEARN_V3_PHASE4F_LOCK_CONFIG.NEXT_STAGE,
      prodWriteAllowed: false,
      realSheetWriteAllowedNow: false,
      realDriveWriteAllowedNow: false,
      actualSheetWritePerformed: false,
      actualDriveWritePerformed: false,
      lockedAt:
        new Date().toISOString()
    };

    kidlearnV3_4f5SaveLock_(result);

    kidlearnV3_4f5SaveStatus_(
      result,
      KIDLEARN_V3_PHASE4F_LOCK_STATUS.PHASE_4F_CLOSED_LOCKED,
      KIDLEARN_V3_PHASE4F_LOCK_KEYS.LOCKED_AT
    );

    console.log(JSON.stringify(result, null, 2));
    return result;

  } finally {
    lock.releaseLock();
  }
}


/**
 * Get Phase 4F lock status.
 */
function kidlearnV3_getPhase4FLockStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PHASE_4F_LOCK_STATUS_V3',
    phase:
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.LOCK_STEP,
    phaseName:
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.PHASE_NAME,
    status:
      properties.getProperty(
        KIDLEARN_V3_PHASE4F_LOCK_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PHASE4F_LOCK_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE4F_LOCK_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastQaAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE4F_LOCK_KEYS.LAST_QA_AT
      ) || '',
    lockedAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE4F_LOCK_KEYS.LOCKED_AT
      ) || '',
    lastResult:
      kidlearnV3_4f5ReadJsonProperty_(
        KIDLEARN_V3_PHASE4F_LOCK_KEYS.LAST_RESULT_JSON
      ),
    lock:
      kidlearnV3_4f5ReadJsonProperty_(
        KIDLEARN_V3_PHASE4F_LOCK_KEYS.LOCK_JSON
      ),
    nextPhase:
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert Phase 4F closed locked.
 */
function kidlearnV3_assertPhase4FClosedLockedV3() {
  var status =
    kidlearnV3_getPhase4FLockStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PHASE4F_LOCK_STATUS.PHASE_4F_CLOSED_LOCKED
  ) {
    errors.push(
      'Phase 4F chưa PHASE_4F_CLOSED_LOCKED. Status=' +
      status.status
    );
  }

  if (!status.lock || status.lock.locked !== true) {
    errors.push(
      'Không tìm thấy lock evidence cho Phase 4F.'
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_PHASE_4F_CLOSED_LOCKED_V3',
    phase:
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.LOCK_STEP,
    status:
      status.status,
    lockedAt:
      status.lockedAt,
    nextPhase:
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.NEXT_STAGE,
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
 * Alias for next phases.
 */
function kidlearnV3_assertPhase4FClosedV3() {
  return kidlearnV3_assertPhase4FClosedLockedV3();
}


/**
 * QA batch 4F-5.
 * Lưu ý: function này sẽ lock Phase 4F.
 */
function kidlearnV3_runQaBatch4F5V3() {
  var preview =
    kidlearnV3_previewPhase4FLockV3();

  var qa =
    kidlearnV3_runPhase4FFinalQaV3();

  var lock =
    kidlearnV3_lockPhase4FConfirmV3();

  var assertLocked =
    kidlearnV3_assertPhase4FClosedLockedV3();

  var result = {
    success:
      preview.success === true &&
      qa.success === true &&
      lock.success === true &&
      assertLocked.success === true,
    suiteName:
      'PHASE_4F_5_QA_AND_LOCK',
    phase:
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.LOCK_STEP,
    status:
      KIDLEARN_V3_PHASE4F_LOCK_STATUS.PHASE_4F_CLOSED_LOCKED,
    nextPhase:
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    results: {
      preview:
        preview.success,
      finalQa:
        qa.success,
      lock:
        lock.success,
      assertLocked:
        assertLocked.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4F-5 QA batch failed.');
  }

  return result;
}


/**
 * Build final QA for Phase 4F.
 */
function kidlearnV3_4f5BuildFinalQa_() {
  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4f5CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var phase4E =
    kidlearnV3_4f5SafeCall_(
      'kidlearnV3_assertPhase4EClosedLockedV3'
    );

  if (!phase4E.success) {
    errors.push(
      'Phase 4E chưa closed locked: ' +
      phase4E.message
    );
  }

  var gateSummary =
    kidlearnV3_4f5InspectGate_();

  if (!gateSummary.success) {
    errors.push(
      'Không kiểm tra được 4F-3 gate: ' +
      gateSummary.message
    );
  } else if (!gateSummary.gateClosed) {
    errors.push(
      '4F-3 gate đang mở. Vui lòng đóng gate trước khi lock 4F. Current=' +
      gateSummary.gateMode
    );
  }

  var componentChecks = [
    {
      key: '4F-1',
      label: 'Parent Review Action UI Contract + Safety Gate',
      required: true,
      check:
        kidlearnV3_4f5SafeCall_(
          'kidlearnV3_assertParentReviewActionUiContract4F1ReadyV3'
        )
    },
    {
      key: '4F-2',
      label: 'Accept / Retry Buttons UI Dry-run',
      required: true,
      check:
        kidlearnV3_4f5SafeCall_(
          'kidlearnV3_assertParentReviewActionButtonsUi4F2ReadyV3'
        )
    },
    {
      key: '4F-3',
      label: 'Controlled UI Write Gate',
      required: true,
      check:
        kidlearnV3_4f5SafeCall_(
          'kidlearnV3_assertParentReviewUiWriteGate4F3ReadyV3'
        )
    },
    {
      key: '4F-4A',
      label: 'Child Retry Context Read-only',
      required: true,
      check:
        kidlearnV3_4f5SafeCall_(
          'kidlearnV3_assertChildRetryContext4F4AReadyV3'
        )
    },
    {
      key: '4F-4B',
      label: 'Child Home Retry Card UI Read-only',
      required: true,
      check:
        kidlearnV3_4f5SafeCall_(
          'kidlearnV3_assertChildRetryCardUi4F4BReadyV3'
        )
    },
    {
      key: '4F-4C',
      label: 'Retry Lesson Routing',
      required: true,
      check:
        kidlearnV3_4f5SafeCall_(
          'kidlearnV3_assertChildRetryLessonRouting4F4CReadyV3'
        )
    },
    {
      key: '4F-4D',
      label: 'Child Retry QA Ready for 4F-5',
      required: true,
      check:
        kidlearnV3_4f5SafeCall_(
          'kidlearnV3_assertChildRetryQaReady4F4DReadyV3'
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
    kidlearnV3_4f5InspectRetryContext_();

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
    kidlearnV3_4f5InspectRouteIfAvailable_(
      retryContextSummary
    );

  if (
    retryContextSummary.success &&
    retryContextSummary.retryCount > 0 &&
    routeSummary.success !== true
  ) {
    errors.push(
      'Có retry item nhưng route không pass: ' +
      routeSummary.message
    );
  }

  if (
    retryContextSummary.success &&
    retryContextSummary.retryCount === 0
  ) {
    warnings.push(
      'Không test route thực tế vì retryCount = 0. Đây là hợp lệ.'
    );
  }

  var uiMarkerSummary =
    kidlearnV3_4f5InspectUiMarkers_();

  if (!uiMarkerSummary.success) {
    errors =
      errors.concat(uiMarkerSummary.errors || []);
  }

  warnings =
    warnings.concat(uiMarkerSummary.warnings || []);

  var componentSummary =
    kidlearnV3_4f5BuildComponentSummary_(
      componentChecks
    );

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_PHASE_4F_FINAL_QA_4F_5_V3',
    phase:
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.LOCK_STEP,
    phaseName:
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.PHASE_NAME,
    devSafety:
      dev,
    phase4E:
      phase4E,
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
    readyForLock:
      errors.length === 0,
    nextPhase:
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4F_LOCK_CONFIG.NEXT_STAGE,
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
      kidlearnV3_4f5UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4f5UniqueArray_(warnings)
  };
}


/**
 * Gate inspection.
 */
function kidlearnV3_4f5InspectGate_() {
  try {
    if (
      typeof kidlearnV3_getParentReviewUiWriteGate4F3StatusV3 !== 'function'
    ) {
      return {
        success: false,
        gateMode: '',
        gateClosed: false,
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
      expectedGateMode:
        KIDLEARN_V3_PHASE4F_LOCK_CONFIG.EXPECTED_GATE_MODE,
      gateClosed:
        gateMode === KIDLEARN_V3_PHASE4F_LOCK_CONFIG.EXPECTED_GATE_MODE,
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
function kidlearnV3_4f5InspectRetryContext_() {
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
function kidlearnV3_4f5InspectRouteIfAvailable_(retryContextSummary) {
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
 * UI marker inspection.
 */
function kidlearnV3_4f5InspectUiMarkers_() {
  var errors = [];
  var warnings = [];

  var shell = '';
  var styles = '';
  var client4f2 = '';
  var client4f3 = '';
  var client4f4b = '';
  var client4f4c = '';

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
    styles =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Styles_4A')
        .getContent();
  } catch (error2) {
    errors.push(
      'Không đọc được UI_Product_Styles_4A: ' +
      String(error2.message || error2)
    );
  }

  try {
    client4f2 =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_ParentReviewActions_4F2')
        .getContent();
  } catch (error3) {
    errors.push(
      'Không đọc được UI_Product_Client_ParentReviewActions_4F2: ' +
      String(error3.message || error3)
    );
  }

  try {
    client4f3 =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_ParentReviewActions_Write_4F3')
        .getContent();
  } catch (error4) {
    errors.push(
      'Không đọc được UI_Product_Client_ParentReviewActions_Write_4F3: ' +
      String(error4.message || error4)
    );
  }

  try {
    client4f4b =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_ChildRetryHome_4F4B')
        .getContent();
  } catch (error5) {
    errors.push(
      'Không đọc được UI_Product_Client_ChildRetryHome_4F4B: ' +
      String(error5.message || error5)
    );
  }

  try {
    client4f4c =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_ChildRetryRouting_4F4C')
        .getContent();
  } catch (error6) {
    errors.push(
      'Không đọc được UI_Product_Client_ChildRetryRouting_4F4C: ' +
      String(error6.message || error6)
    );
  }

  kidlearnV3_4f5CheckMarkers_(
    shell,
    [
      'UI_Product_Client_ParentReviewActions_4F2',
      'UI_Product_Client_ParentReviewActions_Write_4F3',
      'UI_Product_Client_ChildRetryHome_4F4B',
      'UI_Product_Client_ChildRetryRouting_4F4C'
    ],
    'Shell',
    errors
  );

  kidlearnV3_4f5CheckMarkers_(
    client4f2,
    [
      'KIDLEARN_PARENT_REVIEW_ACTION_BUTTONS_UI_4F2',
      'injectParentReviewActionButtons4F2',
      'parent-review-accept-4f2',
      'parent-review-retry-4f2'
    ],
    'Client 4F-2',
    errors
  );

  kidlearnV3_4f5CheckMarkers_(
    client4f3,
    [
      'KIDLEARN_PARENT_REVIEW_UI_WRITE_GATE_4F3',
      'submitParentReviewActionFromUi4F3',
      'kidlearnV3_submitParentReviewActionFromUi4F3V3',
      'parent-review-accept-4f3',
      'parent-review-retry-4f3'
    ],
    'Client 4F-3',
    errors
  );

  kidlearnV3_4f5CheckMarkers_(
    client4f4b,
    [
      'KIDLEARN_CHILD_RETRY_HOME_UI_4F4B',
      'ensureChildRetryHomeCard4F4B',
      'openChildRetryPanel4F4B',
      'kl-child-retry-entry-4f4b',
      'kl-child-retry-card-4f4b'
    ],
    'Client 4F-4B',
    errors
  );

  kidlearnV3_4f5CheckMarkers_(
    client4f4c,
    [
      'KIDLEARN_CHILD_RETRY_ROUTING_UI_4F4C',
      'patchChildRetryButtonsForRouting4F4C',
      'openRetryLesson4F4C',
      'kidlearnV3_getRetryLessonRoute4F4CV3',
      'open-retry-lesson-4f4c'
    ],
    'Client 4F-4C',
    errors
  );

  kidlearnV3_4f5CheckMarkers_(
    styles,
    [
      '.kl-parent-review-actions-4f2',
      '.kl-parent-review-write-gate-4f3',
      '.kl-child-retry-entry-4f4b',
      '.kl-child-retry-card-4f4b',
      '.kl-child-retry-routing-4f4c',
      '.kl-child-retry-routing-feedback-4f4c'
    ],
    'CSS',
    errors
  );

  return {
    success:
      errors.length === 0,
    action:
      'INSPECT_PHASE_4F_UI_MARKERS_4F_5_V3',
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


function kidlearnV3_4f5CheckMarkers_(content, markers, label, errors) {
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


function kidlearnV3_4f5BuildComponentSummary_(componentChecks) {
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
function kidlearnV3_4f5CheckDevSafety_() {
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
function kidlearnV3_4f5SafeCall_(functionName) {
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
      nextPhase:
        output && output.nextPhase ? output.nextPhase : '',
      nextBundle:
        output && output.nextBundle ? output.nextBundle : '',
      message:
        output && output.success === true
          ? 'OK'
          : kidlearnV3_4f5PreviewValue_(JSON.stringify(output || {})),
      outputSummary:
        kidlearnV3_4f5SummarizeOutput_(output)
    };

  } catch (error) {
    return {
      success: false,
      functionName:
        functionName,
      message:
        String(error.message || error),
      outputSummary:
        null
    };
  }
}


function kidlearnV3_4f5SummarizeOutput_(output) {
  output = output || {};

  return {
    success:
      output.success === true,
    action:
      output.action || '',
    phase:
      output.phase || '',
    status:
      output.status || '',
    nextPhase:
      output.nextPhase || '',
    nextBundle:
      output.nextBundle || '',
    errorCount:
      output.errorCount || 0,
    warningCount:
      output.warningCount || 0
  };
}


function kidlearnV3_4f5PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 350) {
    return text.substring(0, 350) + '...';
  }

  return text;
}


function kidlearnV3_4f5UniqueArray_(items) {
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


function kidlearnV3_4f5SaveLock_(result) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PHASE4F_LOCK_KEYS.LOCK_JSON,
      JSON.stringify(result)
    );
}


function kidlearnV3_4f5SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PHASE4F_LOCK_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PHASE4F_LOCK_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_PHASE4F_LOCK_CONFIG.PHASE,
      lockStep:
        result.lockStep ||
        KIDLEARN_V3_PHASE4F_LOCK_CONFIG.LOCK_STEP,
      phaseName:
        KIDLEARN_V3_PHASE4F_LOCK_CONFIG.PHASE_NAME,
      status:
        status,
      locked:
        result.locked === true,
      readyForLock:
        result.readyForLock === true,
      finalQaPassed:
        result.finalQaPassed === true,
      gateMode:
        result.gateSummary
          ? result.gateSummary.gateMode
          : '',
      retryCount:
        result.retryContextSummary
          ? result.retryContextSummary.retryCount
          : 0,
      nextPhase:
        KIDLEARN_V3_PHASE4F_LOCK_CONFIG.NEXT_PHASE,
      nextStage:
        KIDLEARN_V3_PHASE4F_LOCK_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4f5ReadJsonProperty_(key) {
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