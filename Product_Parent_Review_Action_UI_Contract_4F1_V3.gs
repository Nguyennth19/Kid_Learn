/**
 * ================================================================
 * KIDLEARN V3 - PARENT REVIEW ACTION UI CONTRACT + SAFETY GATE
 * Step: 4F-1
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Prepare contract for Parent Review Action UI.
 * - Define Accept / Retry UI behavior.
 * - Define safety gate before UI can write review action.
 * - Confirm Phase 4E is closed locked.
 *
 * Safety:
 * - Không ghi DATA_Responses.
 * - Không ghi LOG_Audit.
 * - Không ghi Google Drive.
 * - Không tạo DATA_Assignments.
 * - Không reset DATA_LessonProgress.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4F-1.
 */


var KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4F1_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4F1_LAST_PREVIEW_AT',
  LAST_CHECK_AT: 'KIDLEARN_V3_PHASE_4F1_LAST_CHECK_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4F1_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4F1_LAST_RESULT_JSON',
  UI_GATE_MODE: 'KIDLEARN_V3_PHASE_4F_REVIEW_ACTION_UI_GATE_MODE',
  CONTRACT_JSON: 'KIDLEARN_V3_PHASE_4F1_CONTRACT_JSON'
};


var KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  CHECK_PASSED: 'CHECK_PASSED',
  READY_FOR_4F_2: 'READY_FOR_4F_2',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PARENT_REVIEW_UI_GATE_4F1_MODE = {
  CLOSED_DRY_RUN_ONLY: 'CLOSED_DRY_RUN_ONLY',
  OPEN_DEV_CONTROLLED: 'OPEN_DEV_CONTROLLED'
};


var KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG = {
  PHASE: '4F-1',
  PARENT_PHASE: '4F',
  PREVIOUS_PHASE: '4E',
  NEXT_BUNDLE: '4F-2',
  NEXT_STAGE: 'ADD_ACCEPT_RETRY_BUTTONS_TO_PARENT_REVIEW_QUEUE_UI',
  CONTRACT_NAME: 'PARENT_REVIEW_ACTION_UI_CONTRACT_SAFETY_GATE',
  RETRY_FLOW_MODE: 'OPTION_A_MVP_STATUS_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false,
  DEFAULT_GATE_MODE: 'CLOSED_DRY_RUN_ONLY'
};


/**
 * Preview 4F-1.
 */
function kidlearnV3_previewParentReviewActionUiContract4F1V3() {
  var result =
    kidlearnV3_4f1BuildReadiness_();

  result.action =
    'PREVIEW_PARENT_REVIEW_ACTION_UI_CONTRACT_4F_1_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_STATUS.PREVIEWED
      : KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_STATUS.FAILED;

  kidlearnV3_4f1SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4F-1 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Check 4F-1.
 */
function kidlearnV3_checkParentReviewActionUiContract4F1V3() {
  var result =
    kidlearnV3_4f1BuildReadiness_();

  result.action =
    'CHECK_PARENT_REVIEW_ACTION_UI_CONTRACT_4F_1_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_STATUS.CHECK_PASSED
      : KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_STATUS.FAILED;

  kidlearnV3_4f1SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_KEYS.LAST_CHECK_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4F-1 check failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready for 4F-2.
 */
function kidlearnV3_markParentReviewActionUiContract4F1ReadyV3() {
  var check =
    kidlearnV3_checkParentReviewActionUiContract4F1V3();

  if (!check.success) {
    throw new Error('4F-1 check chưa pass.');
  }

  kidlearnV3_4f1EnsureDefaultGateMode_();

  var contract =
    kidlearnV3_4f1BuildContract_();

  var result = {
    success: true,
    action: 'MARK_PARENT_REVIEW_ACTION_UI_CONTRACT_4F_1_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_STATUS.READY_FOR_4F_2,
    contractName:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.CONTRACT_NAME,
    gateMode:
      kidlearnV3_4f1GetCurrentGateMode_(),
    retryFlowMode:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.RETRY_FLOW_MODE,
    contract:
      contract,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    message:
      '4F-1 ready. Có thể qua 4F-2 để thêm nút Accept / Retry vào UI.',
    markedAt:
      new Date().toISOString()
  };

  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_KEYS.CONTRACT_JSON,
      JSON.stringify(contract)
    );

  kidlearnV3_4f1SaveStatus_(
    result,
    KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_STATUS.READY_FOR_4F_2,
    KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getParentReviewActionUiContract4F1StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PARENT_REVIEW_ACTION_UI_CONTRACT_4F_1_STATUS_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_STATUS.NOT_RUN,
    gateMode:
      kidlearnV3_4f1GetCurrentGateMode_(),
    retryFlowMode:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.RETRY_FLOW_MODE,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastCheckAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_KEYS.LAST_CHECK_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4f1ReadJsonProperty_(
        KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_KEYS.LAST_RESULT_JSON
      ),
    contract:
      kidlearnV3_4f1ReadJsonProperty_(
        KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_KEYS.CONTRACT_JSON
      ),
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.NEXT_STAGE
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Public UI policy for later UI phases.
 */
function kidlearnV3_getParentReviewActionUiPolicy4F1V3() {
  var contract =
    kidlearnV3_4f1BuildContract_();

  var result = {
    success: true,
    action: 'GET_PARENT_REVIEW_ACTION_UI_POLICY_4F_1_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.PHASE,
    gateMode:
      kidlearnV3_4f1GetCurrentGateMode_(),
    writeAllowedNow:
      kidlearnV3_4f1GetCurrentGateMode_() ===
      KIDLEARN_V3_PARENT_REVIEW_UI_GATE_4F1_MODE.OPEN_DEV_CONTROLLED,
    contract:
      contract,
    prodWriteAllowed: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertParentReviewActionUiContract4F1ReadyV3() {
  var status =
    kidlearnV3_getParentReviewActionUiContract4F1StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_STATUS.READY_FOR_4F_2
  ) {
    errors.push(
      '4F-1 chưa READY_FOR_4F_2. Status=' +
      status.status
    );
  }

  if (
    status.gateMode !==
    KIDLEARN_V3_PARENT_REVIEW_UI_GATE_4F1_MODE.CLOSED_DRY_RUN_ONLY
  ) {
    errors.push(
      '4F-1 gate phải mặc định CLOSED_DRY_RUN_ONLY. Current=' +
      status.gateMode
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PARENT_REVIEW_ACTION_UI_CONTRACT_4F_1_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.PHASE,
    status:
      status.status,
    gateMode:
      status.gateMode,
    retryFlowMode:
      status.retryFlowMode,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.NEXT_STAGE,
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
 * QA batch 4F-1.
 */
function kidlearnV3_runQaBatch4F1V3() {
  var preview =
    kidlearnV3_previewParentReviewActionUiContract4F1V3();

  var check =
    kidlearnV3_checkParentReviewActionUiContract4F1V3();

  var ready =
    kidlearnV3_markParentReviewActionUiContract4F1ReadyV3();

  var assertReady =
    kidlearnV3_assertParentReviewActionUiContract4F1ReadyV3();

  var result = {
    success:
      preview.success === true &&
      check.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4F_1_PARENT_REVIEW_ACTION_UI_CONTRACT_SAFETY_GATE',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_STATUS.READY_FOR_4F_2,
    gateMode:
      kidlearnV3_4f1GetCurrentGateMode_(),
    retryFlowMode:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.RETRY_FLOW_MODE,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.NEXT_STAGE,
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
    throw new Error('4F-1 QA batch failed.');
  }

  return result;
}


/**
 * Build readiness.
 */
function kidlearnV3_4f1BuildReadiness_() {
  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4f1CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var phase4E =
    kidlearnV3_4f1SafeCall_(
      'kidlearnV3_assertPhase4EClosedLockedV3'
    );

  if (!phase4E.success) {
    errors.push(
      'Phase 4E chưa closed locked: ' +
      phase4E.message
    );
  }

  var requiredFunctions = [
    'kidlearnV3_getParentReviewQueueContext4E5AV3',
    'kidlearnV3_assertParentReviewQueueUi4E5BReadyV3',
    'kidlearnV3_writeHandwritingReviewAction4E5CV3',
    'kidlearnV3_previewHandwritingReviewAction4E5CV3',
    'kidlearnV3_assertHandwritingReviewAction4E5CReadyV3'
  ];

  var functionChecks =
    kidlearnV3_4f1CheckRequiredFunctions_(
      requiredFunctions
    );

  if (!functionChecks.success) {
    errors =
      errors.concat(functionChecks.errors || []);
  }

  var queueSnapshot =
    kidlearnV3_4f1InspectQueueSnapshot_();

  if (!queueSnapshot.success) {
    warnings.push(
      'Không đọc được review queue snapshot: ' +
      queueSnapshot.message
    );
  }

  var contract =
    kidlearnV3_4f1BuildContract_();

  var gateMode =
    kidlearnV3_4f1GetCurrentGateMode_();

  if (!gateMode) {
    gateMode =
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.DEFAULT_GATE_MODE;
  }

  return {
    success: errors.length === 0,
    action: 'BUILD_PARENT_REVIEW_ACTION_UI_CONTRACT_READINESS_4F_1_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.PARENT_PHASE,
    contractName:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.CONTRACT_NAME,
    devSafety:
      dev,
    phase4E:
      phase4E,
    functionChecks:
      functionChecks,
    queueSnapshot:
      queueSnapshot,
    gateMode:
      gateMode,
    contract:
      contract,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    errorCount:
      errors.length,
    warningCount:
      kidlearnV3_4f1UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4f1UniqueArray_(warnings)
  };
}


/**
 * Contract for 4F UI.
 */
function kidlearnV3_4f1BuildContract_() {
  return {
    contractVersion: '4F-1.0',
    phase: '4F-1',
    uiScope: {
      parentReviewQueueUi: true,
      childLessonPlayerUi: false,
      parentOnly: true,
      childCanSeeActions: false
    },
    actionButtons: {
      accept: {
        label: 'Chấp nhận bài viết',
        actionType: 'ACCEPT',
        targetReviewStatus: 'REVIEWED_ACCEPTED',
        backendPhase: '4E-5C',
        enabledIn4F2: false,
        enabledIn4F3: true
      },
      retry: {
        label: 'Yêu cầu bé làm lại',
        actionType: 'RETRY',
        targetReviewStatus: 'REVIEWED_RETRY',
        backendPhase: '4E-5C',
        enabledIn4F2: false,
        enabledIn4F3: true
      }
    },
    safetyGate: {
      defaultMode: 'CLOSED_DRY_RUN_ONLY',
      openMode: 'OPEN_DEV_CONTROLLED',
      uiWriteAllowedIn4F1: false,
      uiWriteAllowedIn4F2: false,
      uiWriteAllowedIn4F3: true,
      prodWriteAllowed: false
    },
    retryFlowPolicy: {
      selectedOption: 'OPTION_A_MVP_STATUS_ONLY',
      createsDataAssignmentsNow: false,
      resetsLessonProgressNow: false,
      createsNewLessonAttemptNow: false,
      childRetryVisibilityPhase: '4F-4',
      note:
        '4F-1 to 4F-3 chỉ đổi reviewStatus. Retry flow cho bé xử lý riêng ở 4F-4.'
    },
    dataWritePolicy: {
      targetSheet: 'DATA_Responses',
      targetField: 'answerMetaJson',
      auditSheet: 'LOG_Audit',
      driveWriteAllowedNow: false,
      assignmentWriteAllowedNow: false,
      lessonProgressWriteAllowedNow: false
    },
    uiReadPolicy: {
      sourceContextFunction:
        'kidlearnV3_getParentReviewQueueContext4E5AV3',
      openDriveLinkOnly: true,
      inlineImagePreviewNow: false
    }
  };
}


/**
 * Function existence checks.
 */
function kidlearnV3_4f1CheckRequiredFunctions_(functionNames) {
  var errors = [];
  var results = [];

  for (var i = 0; i < functionNames.length; i++) {
    var name =
      functionNames[i];

    var exists =
      kidlearnV3_4f1FunctionExists_(name);

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


function kidlearnV3_4f1FunctionExists_(functionName) {
  try {
    return eval(
      'typeof ' + functionName + ' === "function"'
    ) === true;
  } catch (error) {
    return false;
  }
}


/**
 * Queue snapshot.
 */
function kidlearnV3_4f1InspectQueueSnapshot_() {
  try {
    if (
      typeof kidlearnV3_getParentReviewQueueContext4E5AV3 !== 'function'
    ) {
      return {
        success: false,
        message:
          'Thiếu kidlearnV3_getParentReviewQueueContext4E5AV3'
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
      sourcePhase:
        context.phase || '4E-5A',
      itemCount:
        queue.itemCount || 0,
      pendingCount:
        queue.pendingCount || 0,
      statsByStatus:
        queue.statsByStatus || {},
      note:
        'pendingCount có thể bằng 0 nếu item test đã được ACCEPT/RETRY ở 4E-5C.',
      message:
        context.success === true ? 'OK' : JSON.stringify(context)
    };

  } catch (error) {
    return {
      success: false,
      message:
        String(error.message || error)
    };
  }
}


/**
 * Gate helpers.
 */
function kidlearnV3_4f1GetCurrentGateMode_() {
  return (
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_KEYS.UI_GATE_MODE
      ) ||
    KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.DEFAULT_GATE_MODE
  );
}


function kidlearnV3_4f1EnsureDefaultGateMode_() {
  var properties =
    PropertiesService.getScriptProperties();

  var current =
    properties.getProperty(
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_KEYS.UI_GATE_MODE
    );

  if (!current) {
    properties.setProperty(
      KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_KEYS.UI_GATE_MODE,
      KIDLEARN_V3_PARENT_REVIEW_UI_GATE_4F1_MODE.CLOSED_DRY_RUN_ONLY
    );
  }
}


/**
 * DEV safety.
 */
function kidlearnV3_4f1CheckDevSafety_() {
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
function kidlearnV3_4f1SafeCall_(functionName) {
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
          'Thiếu function ' + functionName
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
          : kidlearnV3_4f1PreviewValue_(JSON.stringify(output || {})),
      outputSummary:
        kidlearnV3_4f1SummarizeOutput_(output)
    };

  } catch (error) {
    return {
      success: false,
      functionName:
        functionName,
      message:
        String(error.message || error)
    };
  }
}


function kidlearnV3_4f1SummarizeOutput_(output) {
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


function kidlearnV3_4f1PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 350) {
    return text.substring(0, 350) + '...';
  }

  return text;
}


function kidlearnV3_4f1UniqueArray_(items) {
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


function kidlearnV3_4f1SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.PARENT_PHASE,
      status:
        status,
      contractName:
        KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.CONTRACT_NAME,
      gateMode:
        result.gateMode || kidlearnV3_4f1GetCurrentGateMode_(),
      retryFlowMode:
        KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.RETRY_FLOW_MODE,
      nextBundle:
        KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_PARENT_REVIEW_UI_CONTRACT_4F1_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4f1ReadJsonProperty_(key) {
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