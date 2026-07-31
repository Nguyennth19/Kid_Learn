/**
 * ================================================================
 * KIDLEARN V3 - PARENT REVIEW QA READY FOR 4E-6
 * Step: 4E-5D
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Final QA readiness check after Parent Review Action Write.
 * - Confirm 4E-1 to 4E-5C are ready.
 * - Confirm last review action was verified.
 * - Prepare for 4E-6 phase lock.
 *
 * Safety:
 * - Không ghi DATA_Responses.
 * - Không ghi LOG_Audit.
 * - Không ghi Google Drive.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4E-5D.
 */


var KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4E5D_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4E5D_LAST_PREVIEW_AT',
  LAST_CHECK_AT: 'KIDLEARN_V3_PHASE_4E5D_LAST_CHECK_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4E5D_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4E5D_LAST_RESULT_JSON'
};


var KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  CHECK_PASSED: 'CHECK_PASSED',
  READY_FOR_4E_6: 'READY_FOR_4E_6',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG = {
  PHASE: '4E-5D',
  PARENT_PHASE: '4E',
  PREVIOUS_BUNDLE: '4E-5C',
  NEXT_BUNDLE: '4E-6',
  NEXT_STAGE: 'QA_AND_PHASE_4E_LOCK',
  QA_NAME: 'PARENT_REVIEW_QA_READY_FOR_4E_6',
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


function kidlearnV3_previewParentReviewQaReady4E5DV3() {
  var result =
    kidlearnV3_4e5dBuildReadiness_();

  result.action =
    'PREVIEW_PARENT_REVIEW_QA_READY_4E_5D_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_STATUS.PREVIEWED
      : KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_STATUS.FAILED;

  kidlearnV3_4e5dSaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4E-5D preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


function kidlearnV3_runParentReviewQaReady4E5DV3() {
  var result =
    kidlearnV3_4e5dBuildReadiness_();

  result.action =
    'RUN_PARENT_REVIEW_QA_READY_4E_5D_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_STATUS.CHECK_PASSED
      : KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_STATUS.FAILED;

  kidlearnV3_4e5dSaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_KEYS.LAST_CHECK_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4E-5D QA check failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready for 4E-6.
 */
function kidlearnV3_markParentReviewQaReady4E5DReadyV3() {
  var check =
    kidlearnV3_runParentReviewQaReady4E5DV3();

  if (!check.success) {
    throw new Error('4E-5D check chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_PARENT_REVIEW_QA_READY_4E_5D_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_STATUS.READY_FOR_4E_6,
    qaName:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.QA_NAME,
    componentSummary:
      check.componentSummary,
    reviewActionSummary:
      check.reviewActionSummary,
    currentQueueSnapshot:
      check.currentQueueSnapshot,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    message:
      '4E-5D ready. Có thể qua 4E-6 QA + Phase 4E Lock.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4e5dSaveStatus_(
    result,
    KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_STATUS.READY_FOR_4E_6,
    KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get 4E-5D status.
 */
function kidlearnV3_getParentReviewQaReady4E5DStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PARENT_REVIEW_QA_READY_4E_5D_STATUS_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastCheckAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_KEYS.LAST_CHECK_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4e5dReadJsonProperty_(
        KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready for 4E-6.
 */
function kidlearnV3_assertParentReviewQaReady4E5DReadyV3() {
  var status =
    kidlearnV3_getParentReviewQaReady4E5DStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_STATUS.READY_FOR_4E_6
  ) {
    errors.push(
      '4E-5D chưa READY_FOR_4E_6. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PARENT_REVIEW_QA_READY_4E_5D_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.PHASE,
    status:
      status.status,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.NEXT_STAGE,
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
 * QA batch 4E-5D.
 */
function kidlearnV3_runQaBatch4E5DV3() {
  var preview =
    kidlearnV3_previewParentReviewQaReady4E5DV3();

  var check =
    kidlearnV3_runParentReviewQaReady4E5DV3();

  var ready =
    kidlearnV3_markParentReviewQaReady4E5DReadyV3();

  var assertReady =
    kidlearnV3_assertParentReviewQaReady4E5DReadyV3();

  var result = {
    success:
      preview.success === true &&
      check.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4E_5D_PARENT_REVIEW_QA_READY_FOR_4E_6',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_STATUS.READY_FOR_4E_6,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.NEXT_STAGE,
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
    throw new Error('4E-5D QA batch failed.');
  }

  return result;
}


/**
 * Build readiness.
 */
function kidlearnV3_4e5dBuildReadiness_() {
  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4e5dCheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var componentChecks = [
    {
      key: '4E-1',
      label: 'Handwriting Storage Policy + Drive Readiness',
      required: true,
      check:
        kidlearnV3_4e5dSafeCall_(
          'kidlearnV3_assertHandwritingStorageReadiness4E1ReadyV3'
        )
    },
    {
      key: '4E-2',
      label: 'Handwriting Upload Dry-run Preview',
      required: true,
      check:
        kidlearnV3_4e5dSafeCall_(
          'kidlearnV3_assertHandwritingUploadDryRun4E2ReadyV3'
        )
    },
    {
      key: '4E-3',
      label: 'Controlled DEV Drive Write',
      required: true,
      check:
        kidlearnV3_4e5dSafeCall_(
          'kidlearnV3_assertHandwritingDriveWrite4E3ReadyV3'
        )
    },
    {
      key: '4E-4',
      label: 'Link Handwriting Asset to DATA_Responses',
      required: true,
      check:
        kidlearnV3_4e5dSafeCall_(
          'kidlearnV3_assertHandwritingAssetLink4E4ReadyV3'
        )
    },
    {
      key: '4E-5A',
      label: 'Parent Review Queue Context Read-only',
      required: true,
      check:
        kidlearnV3_4e5dSafeCall_(
          'kidlearnV3_assertParentReviewQueueContext4E5AReadyV3'
        )
    },
    {
      key: '4E-5B',
      label: 'Parent Review Queue UI Read-only',
      required: true,
      check:
        kidlearnV3_4e5dSafeCall_(
          'kidlearnV3_assertParentReviewQueueUi4E5BReadyV3'
        )
    },
    {
      key: '4E-5C',
      label: 'Controlled Review Action Write',
      required: true,
      check:
        kidlearnV3_4e5dSafeCall_(
          'kidlearnV3_assertHandwritingReviewAction4E5CReadyV3'
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

  var reviewVerify =
    kidlearnV3_4e5dSafeCall_(
      'kidlearnV3_verifyLastHandwritingReviewAction4E5CV3'
    );

  if (!reviewVerify.success) {
    errors.push(
      'Verify last 4E-5C review action chưa pass: ' +
      reviewVerify.message
    );
  }

  var reviewActionStatus =
    kidlearnV3_4e5dSafeCall_(
      'kidlearnV3_getHandwritingReviewAction4E5CStatusV3'
    );

  if (!reviewActionStatus.success) {
    warnings.push(
      'Không đọc được 4E-5C status summary: ' +
      reviewActionStatus.message
    );
  }

  var queueSnapshot =
    kidlearnV3_4e5dInspectCurrentQueue_();

  if (!queueSnapshot.success) {
    warnings.push(
      'Không đọc được current review queue snapshot: ' +
      queueSnapshot.message
    );
  }

  var uiMarkerCheck =
    kidlearnV3_4e5dSafeCall_(
      'kidlearnV3_4e5bInspectUiMarkers_'
    );

  if (!uiMarkerCheck.success) {
    warnings.push(
      'Không inspect được UI markers 4E-5B trực tiếp: ' +
      uiMarkerCheck.message
    );
  }

  var componentSummary =
    kidlearnV3_4e5dBuildComponentSummary_(
      componentChecks
    );

  var reviewActionSummary =
    kidlearnV3_4e5dBuildReviewActionSummary_(
      reviewActionStatus,
      reviewVerify
    );

  return {
    success: errors.length === 0,
    action: 'BUILD_PARENT_REVIEW_QA_READY_4E_5D_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.PARENT_PHASE,
    qaName:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.QA_NAME,
    devSafety:
      dev,
    componentSummary:
      componentSummary,
    reviewActionSummary:
      reviewActionSummary,
    currentQueueSnapshot:
      queueSnapshot,
    uiMarkerCheck:
      {
        success:
          uiMarkerCheck.success === true,
        phase:
          uiMarkerCheck.phase || '',
        errorCount:
          uiMarkerCheck.errorCount || 0,
        warningCount:
          uiMarkerCheck.warningCount || 0
      },
    readyForPhaseLock:
      errors.length === 0,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    errorCount:
      errors.length,
    warningCount:
      kidlearnV3_4e5dUniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4e5dUniqueArray_(warnings)
  };
}


function kidlearnV3_4e5dBuildComponentSummary_(componentChecks) {
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


function kidlearnV3_4e5dBuildReviewActionSummary_(
  statusCall,
  verifyCall
) {
  var summary = {
    statusReadable:
      statusCall.success === true,
    verifyPassed:
      verifyCall.success === true,
    status:
      statusCall.status || '',
    responseId:
      statusCall.responseId || '',
    reviewAction:
      statusCall.reviewAction || '',
    targetReviewStatus:
      statusCall.targetReviewStatus || '',
    nextBundle:
      statusCall.nextBundle || '',
    verifyStatus:
      verifyCall.status || '',
    verifyMessage:
      verifyCall.success === true ? 'OK' : verifyCall.message
  };

  if (
    statusCall.outputSummary &&
    statusCall.outputSummary.lastReviewAction
  ) {
    summary.responseId =
      statusCall.outputSummary.lastReviewAction.responseId || summary.responseId;

    summary.reviewAction =
      statusCall.outputSummary.lastReviewAction.reviewAction || summary.reviewAction;

    summary.targetReviewStatus =
      statusCall.outputSummary.lastReviewAction.targetReviewStatus || summary.targetReviewStatus;
  }

  return summary;
}


function kidlearnV3_4e5dInspectCurrentQueue_() {
  try {
    if (
      typeof kidlearnV3_getParentReviewQueueContext4E5AV3 !== 'function'
    ) {
      return {
        success: false,
        message:
          'Thiếu function kidlearnV3_getParentReviewQueueContext4E5AV3'
      };
    }

    var context =
      kidlearnV3_getParentReviewQueueContext4E5AV3({
        limit: 100
      });

    var queue =
      context.reviewQueue || {};

    return {
      success:
        context.success === true,
      phase:
        '4E-5D',
      sourcePhase:
        context.phase || '4E-5A',
      itemCount:
        queue.itemCount || 0,
      pendingCount:
        queue.pendingCount || 0,
      statsByStatus:
        queue.statsByStatus || {},
      note:
        'pendingCount có thể bằng 0 sau khi 4E-5C đã ACCEPT/RETRY item đầu tiên. Đây là trạng thái hợp lệ.',
      message:
        context.success === true ? 'OK' : JSON.stringify(context)
    };

  } catch (error) {
    return {
      success: false,
      phase: '4E-5D',
      message:
        String(error.message || error)
    };
  }
}


/**
 * DEV safety.
 */
function kidlearnV3_4e5dCheckDevSafety_() {
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
function kidlearnV3_4e5dSafeCall_(functionName) {
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
        outputSummary: null
      };
    }

    var output =
      eval(functionName)();

    var summary =
      kidlearnV3_4e5dSummarizeOutput_(
        output
      );

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
      responseId:
        output && output.responseId ? output.responseId : '',
      reviewAction:
        output && output.reviewAction ? output.reviewAction : '',
      targetReviewStatus:
        output && output.targetReviewStatus ? output.targetReviewStatus : '',
      errorCount:
        output && output.errorCount ? output.errorCount : 0,
      warningCount:
        output && output.warningCount ? output.warningCount : 0,
      message:
        output && output.success === true
          ? 'OK'
          : kidlearnV3_4e5dPreviewValue_(
              JSON.stringify(summary)
            ),
      outputSummary:
        summary
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


function kidlearnV3_4e5dSummarizeOutput_(output) {
  output = output || {};

  var summary = {
    success:
      output.success === true,
    action:
      output.action || '',
    phase:
      output.phase || '',
    status:
      output.status || '',
    nextBundle:
      output.nextBundle || '',
    nextStage:
      output.nextStage || '',
    responseId:
      output.responseId || '',
    reviewAction:
      output.reviewAction || '',
    targetReviewStatus:
      output.targetReviewStatus || '',
    actualSheetWritePerformed:
      output.actualSheetWritePerformed === true,
    actualDriveWritePerformed:
      output.actualDriveWritePerformed === true,
    errorCount:
      output.errorCount || 0,
    warningCount:
      output.warningCount || 0,
    errors:
      output.errors || [],
    warnings:
      output.warnings || []
  };

  if (output.lastReviewAction) {
    summary.lastReviewAction = {
      responseId:
        output.lastReviewAction.responseId || '',
      reviewAction:
        output.lastReviewAction.reviewAction || '',
      targetReviewStatus:
        output.lastReviewAction.targetReviewStatus || '',
      dataResponsesWritePerformed:
        output.lastReviewAction.dataResponsesWritePerformed === true,
      logAuditWritePerformed:
        output.lastReviewAction.logAuditWritePerformed === true
    };
  }

  if (output.lastResult) {
    summary.lastResult = {
      status:
        output.lastResult.status || '',
      responseId:
        output.lastResult.responseId || '',
      reviewAction:
        output.lastResult.reviewAction || '',
      targetReviewStatus:
        output.lastResult.targetReviewStatus || ''
    };
  }

  return summary;
}


function kidlearnV3_4e5dPreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 350) {
    return text.substring(0, 350) + '...';
  }

  return text;
}


function kidlearnV3_4e5dUniqueArray_(items) {
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


function kidlearnV3_4e5dSaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.PARENT_PHASE,
      status:
        status,
      qaName:
        KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.QA_NAME,
      readyForPhaseLock:
        result.readyForPhaseLock === true ||
        status === KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_STATUS.READY_FOR_4E_6,
      componentSummary:
        result.componentSummary || [],
      reviewActionSummary:
        result.reviewActionSummary || {},
      currentQueueSnapshot:
        result.currentQueueSnapshot || {},
      nextBundle:
        KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_PARENT_REVIEW_QA_4E5D_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4e5dReadJsonProperty_(key) {
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