/**
 * ================================================================
 * KIDLEARN V3 - CONTROLLED UI WRITE GATE FOR PARENT REVIEW ACTIONS
 * Step: 4F-3
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Connect Parent Review UI buttons to 4E-5C backend.
 * - Provide a controlled DEV gate:
 *   CLOSED_DRY_RUN_ONLY
 *   OPEN_DEV_CONTROLLED
 *
 * Safety:
 * - DEV only.
 * - Gate default closed.
 * - Does not write Drive.
 * - Does not create DATA_Assignments.
 * - Does not reset DATA_LessonProgress.
 * - Real DATA_Responses/LOG_Audit write only when gate is OPEN_DEV_CONTROLLED.
 */


var KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4F3_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4F3_LAST_PREVIEW_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4F3_LAST_READY_AT',
  LAST_GATE_CHANGE_AT: 'KIDLEARN_V3_PHASE_4F3_LAST_GATE_CHANGE_AT',
  LAST_SUBMIT_AT: 'KIDLEARN_V3_PHASE_4F3_LAST_SUBMIT_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4F3_LAST_RESULT_JSON',
  LAST_UI_SUBMISSION_JSON: 'KIDLEARN_V3_PHASE_4F3_LAST_UI_SUBMISSION_JSON'
};


var KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  READY_FOR_4F_4: 'READY_FOR_4F_4',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_MODE = {
  CLOSED_DRY_RUN_ONLY: 'CLOSED_DRY_RUN_ONLY',
  OPEN_DEV_CONTROLLED: 'OPEN_DEV_CONTROLLED'
};


var KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG = {
  PHASE: '4F-3',
  PARENT_PHASE: '4F',
  PREVIOUS_BUNDLE: '4F-2',
  NEXT_BUNDLE: '4F-4',
  NEXT_STAGE: 'RETRY_FLOW_FOR_CHILD_VIEW',
  WRITE_NAME: 'CONTROLLED_UI_WRITE_CONNECT_PARENT_REVIEW_BUTTONS',
  OPEN_CONFIRM_TEXT: 'CONFIRM_OPEN_PARENT_REVIEW_UI_WRITE_GATE_4F3',
  CLOSE_CONFIRM_TEXT: 'CONFIRM_CLOSE_PARENT_REVIEW_UI_WRITE_GATE_4F3',
  PROD_WRITE_ALLOWED: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false,
  DEFAULT_GATE_MODE: 'CLOSED_DRY_RUN_ONLY'
};


/**
 * Preview 4F-3 readiness.
 * No data writes.
 */
function kidlearnV3_previewParentReviewUiWriteGate4F3V3() {
  var result =
    kidlearnV3_4f3BuildReadiness_();

  result.action =
    'PREVIEW_PARENT_REVIEW_UI_WRITE_GATE_4F_3_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_STATUS.PREVIEWED
      : KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_STATUS.FAILED;

  kidlearnV3_4f3SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4F-3 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 4F-3 ready.
 * Gate remains CLOSED_DRY_RUN_ONLY.
 */
function kidlearnV3_markParentReviewUiWriteGate4F3ReadyV3() {
  var preview =
    kidlearnV3_previewParentReviewUiWriteGate4F3V3();

  if (!preview.success) {
    throw new Error('Preview 4F-3 chưa pass.');
  }

  kidlearnV3_4f3EnsureDefaultGateMode_();

  var result = {
    success: true,
    action: 'MARK_PARENT_REVIEW_UI_WRITE_GATE_4F_3_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_STATUS.READY_FOR_4F_4,
    gateMode:
      kidlearnV3_4f3GetCurrentGateMode_(),
    writeAllowedNow:
      kidlearnV3_4f3GetCurrentGateMode_() ===
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_MODE.OPEN_DEV_CONTROLLED,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    message:
      '4F-3 ready. UI buttons can call backend through controlled gate.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4f3SaveStatus_(
    result,
    KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_STATUS.READY_FOR_4F_4,
    KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Open gate wrapper.
 * ScriptProperties only. No DATA_Responses write here.
 */
function kidlearnV3_openParentReviewUiWriteGate4F3ConfirmV3() {
  return kidlearnV3_setParentReviewUiWriteGate4F3V3({
    mode:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_MODE.OPEN_DEV_CONTROLLED,
    confirm:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.OPEN_CONFIRM_TEXT
  });
}


/**
 * Close gate wrapper.
 * ScriptProperties only.
 */
function kidlearnV3_closeParentReviewUiWriteGate4F3ConfirmV3() {
  return kidlearnV3_setParentReviewUiWriteGate4F3V3({
    mode:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_MODE.CLOSED_DRY_RUN_ONLY,
    confirm:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.CLOSE_CONFIRM_TEXT
  });
}


/**
 * Set UI write gate.
 */
function kidlearnV3_setParentReviewUiWriteGate4F3V3(options) {
  options = options || {};

  var targetMode =
    String(options.mode || '')
      .trim()
      .toUpperCase();

  var confirmText =
    String(options.confirm || '')
      .trim()
      .toUpperCase();

  if (
    targetMode !==
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_MODE.CLOSED_DRY_RUN_ONLY &&
    targetMode !==
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_MODE.OPEN_DEV_CONTROLLED
  ) {
    throw new Error(
      'Gate mode không hợp lệ. Current=' + targetMode
    );
  }

  if (
    targetMode ===
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_MODE.OPEN_DEV_CONTROLLED &&
    confirmText !==
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.OPEN_CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm mở gate. Cần confirm=' +
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.OPEN_CONFIRM_TEXT
    );
  }

  if (
    targetMode ===
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_MODE.CLOSED_DRY_RUN_ONLY &&
    confirmText !==
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.CLOSE_CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm đóng gate. Cần confirm=' +
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.CLOSE_CONFIRM_TEXT
    );
  }

  var readiness =
    kidlearnV3_4f3BuildReadiness_();

  if (!readiness.success) {
    throw new Error(
      '4F-3 readiness chưa pass. Errors=' +
      readiness.errors.join(' | ')
    );
  }

  PropertiesService
    .getScriptProperties()
    .setProperty(
      kidlearnV3_4f3GetGatePropertyKey_(),
      targetMode
    );

  var result = {
    success: true,
    action: 'SET_PARENT_REVIEW_UI_WRITE_GATE_4F_3_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_STATUS.READY_FOR_4F_4,
    gateMode:
      targetMode,
    writeAllowedNow:
      targetMode ===
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_MODE.OPEN_DEV_CONTROLLED,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    changedAt:
      new Date().toISOString()
  };

  kidlearnV3_4f3SaveStatus_(
    result,
    KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_STATUS.READY_FOR_4F_4,
    KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_KEYS.LAST_GATE_CHANGE_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get gate status for UI.
 */
function kidlearnV3_getParentReviewUiWriteGate4F3StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var gateMode =
    kidlearnV3_4f3GetCurrentGateMode_();

  var result = {
    success: true,
    action: 'GET_PARENT_REVIEW_UI_WRITE_GATE_4F_3_STATUS_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_STATUS.NOT_RUN,
    gateMode:
      gateMode,
    writeAllowedNow:
      gateMode ===
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_MODE.OPEN_DEV_CONTROLLED,
    defaultMode:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.DEFAULT_GATE_MODE,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_KEYS.LAST_READY_AT
      ) || '',
    lastGateChangeAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_KEYS.LAST_GATE_CHANGE_AT
      ) || '',
    lastSubmitAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_KEYS.LAST_SUBMIT_AT
      ) || '',
    lastResult:
      kidlearnV3_4f3ReadJsonProperty_(
        KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_KEYS.LAST_RESULT_JSON
      ),
    lastUiSubmission:
      kidlearnV3_4f3ReadJsonProperty_(
        KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_KEYS.LAST_UI_SUBMISSION_JSON
      ),
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realDriveWriteAllowedNow: false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Submit review action from UI.
 *
 * payload:
 * {
 *   responseId: '...',
 *   actionType: 'ACCEPT' | 'RETRY',
 *   reviewerId: 'PARENT_UI',
 *   reviewerNote: '...'
 * }
 */
function kidlearnV3_submitParentReviewActionFromUi4F3V3(payload) {
  payload = payload || {};

  var normalized =
    kidlearnV3_4f3NormalizeUiPayload_(payload);

  var dev =
    kidlearnV3_4f3CheckDevSafety_();

  if (!dev.success) {
    throw new Error(
      'DEV safety failed: ' +
      dev.errors.join(' | ')
    );
  }

  var gateMode =
    kidlearnV3_4f3GetCurrentGateMode_();

  var writeAllowed =
    gateMode ===
    KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_MODE.OPEN_DEV_CONTROLLED;

  if (!normalized.responseId) {
    throw new Error('Thiếu responseId từ UI.');
  }

  if (!normalized.actionType) {
    throw new Error('actionType không hợp lệ. Cần ACCEPT hoặc RETRY.');
  }

  if (!writeAllowed) {
    var dryRunResult = {
      success: true,
      action: 'SUBMIT_PARENT_REVIEW_ACTION_FROM_UI_4F_3_DRY_RUN_V3',
      phase:
        KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.PHASE,
      gateMode:
        gateMode,
      dryRunOnly:
        true,
      writeAllowedNow:
        false,
      responseId:
        normalized.responseId,
      reviewAction:
        normalized.actionType,
      reviewerId:
        normalized.reviewerId,
      reviewerNote:
        normalized.reviewerNote,
      message:
        'Gate đang đóng. Dry-run only, chưa ghi DATA_Responses / LOG_Audit.',
      prodWriteAllowed: false,
      actualSheetWritePerformed: false,
      dataResponsesWritePerformed: false,
      logAuditWritePerformed: false,
      actualDriveWritePerformed: false,
      nextStep:
        'Open gate with kidlearnV3_openParentReviewUiWriteGate4F3ConfirmV3 for controlled DEV write.',
      submittedAt:
        new Date().toISOString()
    };

    kidlearnV3_4f3SaveUiSubmission_(dryRunResult);

    kidlearnV3_4f3SaveStatus_(
      dryRunResult,
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_STATUS.READY_FOR_4F_4,
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_KEYS.LAST_SUBMIT_AT
    );

    console.log(JSON.stringify(dryRunResult, null, 2));
    return dryRunResult;
  }

  var backendOptions =
    kidlearnV3_4f3BuildBackendReviewOptions_(normalized);

  var backendResult =
    kidlearnV3_writeHandwritingReviewAction4E5CV3(
      backendOptions
    );

  var result = {
    success:
      backendResult && backendResult.success === true,
    action: 'SUBMIT_PARENT_REVIEW_ACTION_FROM_UI_4F_3_REAL_WRITE_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.PHASE,
    backendPhase:
      backendResult ? backendResult.phase : '',
    gateMode:
      gateMode,
    dryRunOnly:
      false,
    writeAllowedNow:
      true,
    responseId:
      backendResult ? backendResult.responseId : normalized.responseId,
    reviewAction:
      backendResult ? backendResult.reviewAction : normalized.actionType,
    targetReviewStatus:
      backendResult ? backendResult.targetReviewStatus : '',
    reviewerId:
      backendResult ? backendResult.reviewerId : normalized.reviewerId,
    reviewerNote:
      backendResult ? backendResult.reviewerNote : normalized.reviewerNote,
    auditId:
      backendResult ? backendResult.auditId : '',
    auditRowNumber:
      backendResult ? backendResult.auditRowNumber : '',
    prodWriteAllowed: false,
    actualSheetWritePerformed:
      backendResult ? backendResult.actualSheetWritePerformed === true : false,
    dataResponsesWritePerformed:
      backendResult ? backendResult.dataResponsesWritePerformed === true : false,
    logAuditWritePerformed:
      backendResult ? backendResult.logAuditWritePerformed === true : false,
    actualDriveWritePerformed: false,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.NEXT_STAGE,
    submittedAt:
      new Date().toISOString()
  };

  kidlearnV3_4f3SaveUiSubmission_(result);

  kidlearnV3_4f3SaveStatus_(
    result,
    KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_STATUS.READY_FOR_4F_4,
    KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_KEYS.LAST_SUBMIT_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready for 4F-4.
 */
function kidlearnV3_assertParentReviewUiWriteGate4F3ReadyV3() {
  var status =
    kidlearnV3_getParentReviewUiWriteGate4F3StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_STATUS.READY_FOR_4F_4
  ) {
    errors.push(
      '4F-3 chưa READY_FOR_4F_4. Status=' +
      status.status
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_PARENT_REVIEW_UI_WRITE_GATE_4F_3_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.PHASE,
    status:
      status.status,
    gateMode:
      status.gateMode,
    writeAllowedNow:
      status.writeAllowedNow,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realDriveWriteAllowedNow: false,
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
 * Does not open gate and does not write DATA_Responses.
 */
function kidlearnV3_runQaBatch4F3V3() {
  var preview =
    kidlearnV3_previewParentReviewUiWriteGate4F3V3();

  var ready =
    kidlearnV3_markParentReviewUiWriteGate4F3ReadyV3();

  var status =
    kidlearnV3_getParentReviewUiWriteGate4F3StatusV3();

  var assertReady =
    kidlearnV3_assertParentReviewUiWriteGate4F3ReadyV3();

  var result = {
    success:
      preview.success === true &&
      ready.success === true &&
      status.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4F_3_CONTROLLED_UI_WRITE_GATE_PARENT_REVIEW_ACTIONS',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_STATUS.READY_FOR_4F_4,
    gateMode:
      status.gateMode,
    writeAllowedNow:
      status.writeAllowedNow,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    results: {
      preview: preview.success,
      ready: ready.success,
      status: status.success,
      assertReady: assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4F-3 QA batch failed.');
  }

  return result;
}


/**
 * Build readiness.
 */
function kidlearnV3_4f3BuildReadiness_() {
  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4f3CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var f2 =
    kidlearnV3_4f3SafeCall_(
      'kidlearnV3_assertParentReviewActionButtonsUi4F2ReadyV3'
    );

  if (!f2.success) {
    errors.push(
      '4F-2 chưa READY_FOR_4F_3: ' +
      f2.message
    );
  }

  var requiredFunctions = [
    'kidlearnV3_writeHandwritingReviewAction4E5CV3',
    'kidlearnV3_getParentReviewQueueContext4E5AV3',
    'kidlearnV3_getParentReviewActionUiPolicy4F1V3'
  ];

  var functionChecks =
    kidlearnV3_4f3CheckRequiredFunctions_(
      requiredFunctions
    );

  if (!functionChecks.success) {
    errors =
      errors.concat(functionChecks.errors || []);
  }

  var markers =
    kidlearnV3_4f3InspectUiMarkers_();

  if (!markers.success) {
    errors =
      errors.concat(markers.errors || []);
  }

  warnings =
    warnings.concat(markers.warnings || []);

  var gateMode =
    kidlearnV3_4f3GetCurrentGateMode_();

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_PARENT_REVIEW_UI_WRITE_GATE_READINESS_4F_3_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.PARENT_PHASE,
    writeName:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.WRITE_NAME,
    devSafety:
      dev,
    prerequisite: {
      phase4F2Ready:
        f2.success === true,
      requiredFunctionsReady:
        functionChecks.success === true
    },
    functionChecks:
      functionChecks,
    uiMarkers:
      markers,
    gateMode:
      gateMode,
    writeAllowedNow:
      gateMode ===
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_MODE.OPEN_DEV_CONTROLLED,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.NEXT_STAGE,
    prodWriteAllowed:
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
      kidlearnV3_4f3UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4f3UniqueArray_(warnings)
  };
}


/**
 * UI marker inspection.
 */
function kidlearnV3_4f3InspectUiMarkers_() {
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
        .createHtmlOutputFromFile('UI_Product_Client_ParentReviewActions_Write_4F3')
        .getContent();
  } catch (error2) {
    errors.push(
      'Không đọc được UI_Product_Client_ParentReviewActions_Write_4F3: ' +
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
    'UI_Product_Client_ParentReviewActions_Write_4F3'
  ];

  var clientMarkers = [
    'KIDLEARN_PARENT_REVIEW_UI_WRITE_GATE_4F3',
    'submitParentReviewActionFromUi4F3',
    'patchParentReviewActionButtonsForWrite4F3',
    'kidlearnV3_submitParentReviewActionFromUi4F3V3',
    'kl-parent-review-write-gate-4f3',
    'parent-review-accept-4f3',
    'parent-review-retry-4f3'
  ];

  var styleMarkers = [
    '.kl-parent-review-write-gate-4f3',
    '.kl-parent-review-write-feedback-4f3',
    '.kl-parent-review-write-feedback-4f3.is-success',
    '.kl-parent-review-write-feedback-4f3.is-error',
    '.kl-parent-review-realwrite-4f3'
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
        'Client 4F-3 thiếu marker: ' +
        clientMarkers[j]
      );
    }
  }

  for (var k = 0; k < styleMarkers.length; k++) {
    if (styles.indexOf(styleMarkers[k]) === -1) {
      errors.push(
        'CSS 4F-3 thiếu marker: ' +
        styleMarkers[k]
      );
    }
  }

  return {
    success:
      errors.length === 0,
    action:
      'INSPECT_PARENT_REVIEW_UI_WRITE_GATE_MARKERS_4F_3_V3',
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
 * Payload helpers.
 */
function kidlearnV3_4f3NormalizeUiPayload_(payload) {
  payload = payload || {};

  var actionType =
    String(payload.actionType || '')
      .trim()
      .toUpperCase();

  if (
    actionType === 'ACCEPTED' ||
    actionType === 'REVIEWED_ACCEPTED'
  ) {
    actionType = 'ACCEPT';
  }

  if (
    actionType === 'REQUEST_RETRY' ||
    actionType === 'REVIEWED_RETRY'
  ) {
    actionType = 'RETRY';
  }

  if (actionType !== 'ACCEPT' && actionType !== 'RETRY') {
    actionType = '';
  }

  return {
    responseId:
      String(payload.responseId || '').trim(),
    actionType:
      actionType,
    reviewerId:
      String(payload.reviewerId || 'PARENT_UI_4F3').trim(),
    reviewerNote:
      String(payload.reviewerNote || '').trim(),
    source:
      String(payload.source || 'PARENT_REVIEW_UI_4F3').trim()
  };
}


function kidlearnV3_4f3BuildBackendReviewOptions_(normalized) {
  var confirmText =
    normalized.actionType === 'ACCEPT'
      ? 'CONFIRM_ACCEPT_HANDWRITING_REVIEW_4E5C'
      : 'CONFIRM_RETRY_HANDWRITING_REVIEW_4E5C';

  var defaultNote =
    normalized.actionType === 'ACCEPT'
      ? 'Phụ huynh chấp nhận bài viết tay từ UI 4F-3.'
      : 'Phụ huynh yêu cầu bé làm lại từ UI 4F-3.';

  return {
    confirm:
      confirmText,
    responseId:
      normalized.responseId,
    actionType:
      normalized.actionType,
    reviewerId:
      normalized.reviewerId || 'PARENT_UI_4F3',
    reviewerNote:
      normalized.reviewerNote || defaultNote
  };
}


/**
 * Gate helpers.
 */
function kidlearnV3_4f3GetGatePropertyKey_() {
  try {
    if (
      typeof KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_KEYS !== 'undefined' &&
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_KEYS.UI_GATE_MODE
    ) {
      return KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_KEYS.UI_GATE_MODE;
    }
  } catch (error) {
    // ignore
  }

  return 'KIDLEARN_V3_PHASE_4F_REVIEW_ACTION_UI_GATE_MODE';
}


function kidlearnV3_4f3GetCurrentGateMode_() {
  return (
    PropertiesService
      .getScriptProperties()
      .getProperty(
        kidlearnV3_4f3GetGatePropertyKey_()
      ) ||
    KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.DEFAULT_GATE_MODE
  );
}


function kidlearnV3_4f3EnsureDefaultGateMode_() {
  var properties =
    PropertiesService.getScriptProperties();

  var current =
    properties.getProperty(
      kidlearnV3_4f3GetGatePropertyKey_()
    );

  if (!current) {
    properties.setProperty(
      kidlearnV3_4f3GetGatePropertyKey_(),
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_MODE.CLOSED_DRY_RUN_ONLY
    );
  }
}


/**
 * Function existence checks.
 */
function kidlearnV3_4f3CheckRequiredFunctions_(functionNames) {
  var errors = [];
  var results = [];

  for (var i = 0; i < functionNames.length; i++) {
    var name =
      functionNames[i];

    var exists =
      kidlearnV3_4f3FunctionExists_(name);

    results.push({
      functionName:
        name,
      exists:
        exists
    });

    if (!exists) {
      errors.push(
        'Thiếu required function: ' + name
      );
    }
  }

  return {
    success:
      errors.length === 0,
    results:
      results,
    errorCount:
      errors.length,
    errors:
      errors
  };
}


function kidlearnV3_4f3FunctionExists_(functionName) {
  try {
    return eval(
      'typeof ' + functionName + ' === "function"'
    ) === true;
  } catch (error) {
    return false;
  }
}


/**
 * DEV safety.
 */
function kidlearnV3_4f3CheckDevSafety_() {
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
function kidlearnV3_4f3SafeCall_(functionName) {
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
          : kidlearnV3_4f3PreviewValue_(JSON.stringify(output || {})),
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


function kidlearnV3_4f3PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 350) {
    return text.substring(0, 350) + '...';
  }

  return text;
}


function kidlearnV3_4f3UniqueArray_(items) {
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


function kidlearnV3_4f3SaveUiSubmission_(result) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_KEYS.LAST_UI_SUBMISSION_JSON,
      JSON.stringify(result)
    );
}


function kidlearnV3_4f3SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.PARENT_PHASE,
      status:
        status,
      gateMode:
        result.gateMode || kidlearnV3_4f3GetCurrentGateMode_(),
      writeAllowedNow:
        result.writeAllowedNow === true,
      responseId:
        result.responseId || '',
      reviewAction:
        result.reviewAction || '',
      targetReviewStatus:
        result.targetReviewStatus || '',
      nextBundle:
        KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_PARENT_REVIEW_UI_WRITE_GATE_4F3_CONFIG.NEXT_STAGE,
      prodWriteAllowed:
        false,
      actualSheetWritePerformed:
        result.actualSheetWritePerformed === true,
      actualDriveWritePerformed:
        result.actualDriveWritePerformed === true,
      dataResponsesWritePerformed:
        result.dataResponsesWritePerformed === true,
      logAuditWritePerformed:
        result.logAuditWritePerformed === true,
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


function kidlearnV3_4f3ReadJsonProperty_(key) {
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