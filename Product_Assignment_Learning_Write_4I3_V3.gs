/**
 * ================================================================
 * KIDLEARN V3 - ASSIGNMENT LEARNING CONTROLLED WRITE + COMPLETION SYNC
 * Step: 4I-3
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Controlled DEV write for Assignment Learning.
 * - Update DATA_Assignments status safely.
 * - Sync completion only when DATA_LessonProgress has completion evidence.
 *
 * Safety:
 * - DEV only.
 * - Gate default: CLOSED_DRY_RUN_ONLY.
 * - No DATA_Responses write.
 * - No DATA_DailyGoals write.
 * - No DATA_LessonProgress write/reset.
 * - No LOG_Audit write.
 * - No Drive write.
 * - No PROD write.
 */


var KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4I3_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4I3_LAST_PREVIEW_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4I3_LAST_READY_AT',
  LAST_GATE_CHANGE_AT: 'KIDLEARN_V3_PHASE_4I3_LAST_GATE_CHANGE_AT',
  LAST_SUBMIT_AT: 'KIDLEARN_V3_PHASE_4I3_LAST_SUBMIT_AT',
  LAST_SYNC_AT: 'KIDLEARN_V3_PHASE_4I3_LAST_SYNC_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4I3_LAST_RESULT_JSON',
  LAST_SUBMISSION_JSON: 'KIDLEARN_V3_PHASE_4I3_LAST_SUBMISSION_JSON',
  LAST_SYNC_JSON: 'KIDLEARN_V3_PHASE_4I3_LAST_SYNC_JSON'
};


var KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  READY_FOR_4I_4: 'READY_FOR_4I_4',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_GATE_MODE = {
  CLOSED_DRY_RUN_ONLY: 'CLOSED_DRY_RUN_ONLY',
  OPEN_DEV_CONTROLLED: 'OPEN_DEV_CONTROLLED'
};


var KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG = {
  PHASE: '4I-3',
  PARENT_PHASE: '4I',
  PREVIOUS_BUNDLE: '4I-2',
  NEXT_BUNDLE: '4I-4',
  NEXT_STAGE: 'QA_AND_PHASE_4I_LOCK',
  WRITE_NAME: 'CONTROLLED_ASSIGNMENT_STATUS_WRITE_AND_COMPLETION_SYNC',
  DEFAULT_CHILD_ID: 'CHD_V2_CHILD_DEFAULT',
  DEFAULT_PARENT_ID: 'PARENT',
  OPEN_CONFIRM_TEXT: 'CONFIRM_OPEN_ASSIGNMENT_WRITE_GATE_4I3',
  CLOSE_CONFIRM_TEXT: 'CONFIRM_CLOSE_ASSIGNMENT_WRITE_GATE_4I3',
  DEFAULT_GATE_MODE: 'CLOSED_DRY_RUN_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Preview 4I-3 readiness.
 */
function kidlearnV3_previewAssignmentWriteCompletion4I3V3() {
  var result =
    kidlearnV3_4i3BuildReadiness_();

  result.action =
    'PREVIEW_ASSIGNMENT_WRITE_COMPLETION_4I_3_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_STATUS.PREVIEWED
      : KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_STATUS.FAILED;

  kidlearnV3_4i3SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4I-3 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Open Assignment write gate.
 */
function kidlearnV3_openAssignmentWriteGate4I3ConfirmV3() {
  return kidlearnV3_setAssignmentWriteGate4I3V3({
    confirm:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.OPEN_CONFIRM_TEXT,
    gateMode:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_GATE_MODE.OPEN_DEV_CONTROLLED
  });
}


/**
 * Close Assignment write gate.
 */
function kidlearnV3_closeAssignmentWriteGate4I3ConfirmV3() {
  return kidlearnV3_setAssignmentWriteGate4I3V3({
    confirm:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.CLOSE_CONFIRM_TEXT,
    gateMode:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_GATE_MODE.CLOSED_DRY_RUN_ONLY
  });
}


/**
 * Set Assignment write gate.
 */
function kidlearnV3_setAssignmentWriteGate4I3V3(options) {
  options = options || {};

  var targetMode =
    String(options.gateMode || '').trim();

  var confirmText =
    String(options.confirm || '').trim().toUpperCase();

  if (
    targetMode !== KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_GATE_MODE.CLOSED_DRY_RUN_ONLY &&
    targetMode !== KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_GATE_MODE.OPEN_DEV_CONTROLLED
  ) {
    throw new Error('Invalid gateMode=' + targetMode);
  }

  if (
    targetMode === KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_GATE_MODE.OPEN_DEV_CONTROLLED &&
    confirmText !== KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.OPEN_CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm mở gate. Cần confirm=' +
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.OPEN_CONFIRM_TEXT
    );
  }

  if (
    targetMode === KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_GATE_MODE.CLOSED_DRY_RUN_ONLY &&
    confirmText !== KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.CLOSE_CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm đóng gate. Cần confirm=' +
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.CLOSE_CONFIRM_TEXT
    );
  }

  kidlearnV3_4i3AssertDev_();

  PropertiesService
    .getScriptProperties()
    .setProperty(
      kidlearnV3_4i3WriteGatePropertyKey_(),
      targetMode
    );

  var result = {
    success: true,
    action: 'SET_ASSIGNMENT_WRITE_GATE_4I_3_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.PHASE,
    gateMode:
      targetMode,
    writeAllowedNow:
      targetMode === KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_GATE_MODE.OPEN_DEV_CONTROLLED,
    prodWriteAllowed:
      false,
    realDriveWriteAllowedNow:
      false,
    changedAt:
      new Date().toISOString()
  };

  kidlearnV3_4i3SaveStatus_(
    result,
    KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_STATUS.PREVIEWED,
    KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_KEYS.LAST_GATE_CHANGE_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get 4I-3 status.
 */
function kidlearnV3_getAssignmentWriteCompletion4I3StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var gateMode =
    kidlearnV3_4i3GetGateMode_();

  var result = {
    success: true,
    action: 'GET_ASSIGNMENT_WRITE_COMPLETION_4I_3_STATUS_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_KEYS.STATUS
      ) ||
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_STATUS.NOT_RUN,
    gateMode:
      gateMode,
    writeAllowedNow:
      gateMode === KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_GATE_MODE.OPEN_DEV_CONTROLLED,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_KEYS.LAST_READY_AT
      ) || '',
    lastGateChangeAt:
      properties.getProperty(
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_KEYS.LAST_GATE_CHANGE_AT
      ) || '',
    lastSubmitAt:
      properties.getProperty(
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_KEYS.LAST_SUBMIT_AT
      ) || '',
    lastSyncAt:
      properties.getProperty(
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_KEYS.LAST_SYNC_AT
      ) || '',
    lastResult:
      kidlearnV3_4i3ReadJsonProperty_(
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_KEYS.LAST_RESULT_JSON
      ),
    lastSubmission:
      kidlearnV3_4i3ReadJsonProperty_(
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_KEYS.LAST_SUBMISSION_JSON
      ),
    lastSync:
      kidlearnV3_4i3ReadJsonProperty_(
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_KEYS.LAST_SYNC_JSON
      ),
    nextBundle:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.NEXT_STAGE,
    prodWriteAllowed:
      false,
    realSheetWriteAllowedNow:
      false,
    actualSheetWritePerformed:
      false,
    actualDriveWritePerformed:
      false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Submit Assignment action from UI.
 *
 * payload:
 * {
 *   actionType: 'START' | 'COMPLETE',
 *   childId,
 *   assignmentId,
 *   lessonId
 * }
 */
function kidlearnV3_submitAssignmentActionFromUi4I3V3(payload) {
  payload = payload || {};

  kidlearnV3_4i3AssertDev_();

  var gateMode =
    kidlearnV3_4i3GetGateMode_();

  if (
    gateMode !== KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_GATE_MODE.OPEN_DEV_CONTROLLED
  ) {
    var dry =
      kidlearnV3_4i3BuildAssignmentActionPlan_(payload, {
        dryRunOnly: true
      });

    var dryResult = {
      success:
        dry.success,
      action:
        'SUBMIT_ASSIGNMENT_ACTION_FROM_UI_4I_3_DRY_RUN_ONLY_V3',
      phase:
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.PHASE,
      gateMode:
        gateMode,
      dryRunOnly:
        true,
      writeAllowedNow:
        false,
      assignmentActionPlan:
        dry,
      prodWriteAllowed:
        false,
      realSheetWriteAllowedNow:
        false,
      actualSheetWritePerformed:
        false,
      actualDriveWritePerformed:
        false,
      message:
        'Gate đang đóng. Chỉ dry-run, chưa ghi DATA_Assignments.',
      errorCount:
        dry.errorCount || 0,
      warningCount:
        dry.warningCount || 0,
      errors:
        dry.errors || [],
      warnings:
        dry.warnings || []
    };

    kidlearnV3_4i3SaveSubmission_(dryResult);

    console.log(JSON.stringify(dryResult, null, 2));

    if (!dryResult.success) {
      throw new Error(
        '4I-3 dry-run action failed. Errors=' +
        dryResult.errors.join(' | ')
      );
    }

    return dryResult;
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
    return kidlearnV3_4i3WriteAssignmentActionControlled_(payload);
  } finally {
    lock.releaseLock();
  }
}


/**
 * Sync completed assignments from DATA_LessonProgress.
 *
 * options:
 * {
 *   childId,
 *   dryRunOnly
 * }
 */
function kidlearnV3_syncCompletedAssignmentsFromLessonProgress4I3V3(options) {
  options = options || {};

  kidlearnV3_4i3AssertDev_();

  var gateMode =
    kidlearnV3_4i3GetGateMode_();

  var forceDryRun =
    options.dryRunOnly === true ||
    gateMode !== KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_GATE_MODE.OPEN_DEV_CONTROLLED;

  var result =
    kidlearnV3_4i3SyncCompletedAssignments_(options, forceDryRun);

  result.gateMode =
    gateMode;

  kidlearnV3_4i3SaveSync_(result);

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4I-3 completion sync failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 4I-3 ready.
 * Yêu cầu gate đã đóng.
 */
function kidlearnV3_markAssignmentWriteCompletion4I3ReadyV3() {
  var preview =
    kidlearnV3_previewAssignmentWriteCompletion4I3V3();

  if (!preview.success) {
    throw new Error('Preview 4I-3 chưa pass.');
  }

  var gateMode =
    kidlearnV3_4i3GetGateMode_();

  if (
    gateMode !== KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_GATE_MODE.CLOSED_DRY_RUN_ONLY
  ) {
    throw new Error(
      'Trước khi mark ready 4I-3, cần đóng gate. Current=' +
      gateMode +
      '. Chạy kidlearnV3_closeAssignmentWriteGate4I3ConfirmV3.'
    );
  }

  var result = {
    success: true,
    action: 'MARK_ASSIGNMENT_WRITE_COMPLETION_4I_3_READY_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_STATUS.READY_FOR_4I_4,
    writeName:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.WRITE_NAME,
    gateMode:
      gateMode,
    nextBundle:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.NEXT_STAGE,
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
    message:
      '4I-3 ready. Có thể qua 4I-4 để QA và khóa Phase 4I.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4i3SaveStatus_(
    result,
    KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_STATUS.READY_FOR_4I_4,
    KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert 4I-3 ready.
 */
function kidlearnV3_assertAssignmentWriteCompletion4I3ReadyV3() {
  var status =
    kidlearnV3_getAssignmentWriteCompletion4I3StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_STATUS.READY_FOR_4I_4
  ) {
    errors.push(
      '4I-3 chưa READY_FOR_4I_4. Current=' +
      status.status
    );
  }

  if (
    status.gateMode !==
    KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_GATE_MODE.CLOSED_DRY_RUN_ONLY
  ) {
    errors.push(
      '4I Assignment write gate chưa đóng. Current=' +
      status.gateMode
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_ASSIGNMENT_WRITE_COMPLETION_4I_3_READY_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.PHASE,
    status:
      status.status,
    gateMode:
      status.gateMode,
    nextBundle:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.NEXT_STAGE,
    prodWriteAllowed:
      false,
    realSheetWriteAllowedNow:
      false,
    actualSheetWritePerformed:
      false,
    actualDriveWritePerformed:
      false,
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
 * QA batch 4I-3.
 * Không tự mở gate, không ghi DATA.
 */
function kidlearnV3_runQaBatch4I3V3() {
  var preview =
    kidlearnV3_previewAssignmentWriteCompletion4I3V3();

  var sampleDryRun =
    kidlearnV3_submitAssignmentActionFromUi4I3V3({
      actionType: 'START',
      childId:
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.DEFAULT_CHILD_ID
    });

  var syncDryRun =
    kidlearnV3_syncCompletedAssignmentsFromLessonProgress4I3V3({
      childId:
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.DEFAULT_CHILD_ID,
      dryRunOnly:
        true
    });

  var closeGate =
    kidlearnV3_closeAssignmentWriteGate4I3ConfirmV3();

  var ready =
    kidlearnV3_markAssignmentWriteCompletion4I3ReadyV3();

  var assertReady =
    kidlearnV3_assertAssignmentWriteCompletion4I3ReadyV3();

  var result = {
    success:
      preview.success === true &&
      sampleDryRun.success === true &&
      syncDryRun.success === true &&
      closeGate.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4I_3_ASSIGNMENT_WRITE_COMPLETION_SYNC',
    phase:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.PHASE,
    status:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_STATUS.READY_FOR_4I_4,
    gateMode:
      kidlearnV3_4i3GetGateMode_(),
    nextBundle:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.NEXT_STAGE,
    prodWriteAllowed:
      false,
    realSheetWriteAllowedNow:
      false,
    actualSheetWritePerformed:
      false,
    actualDriveWritePerformed:
      false,
    results: {
      preview:
        preview.success,
      sampleDryRun:
        sampleDryRun.success,
      syncDryRun:
        syncDryRun.success,
      closeGate:
        closeGate.success,
      ready:
        ready.success,
      assertReady:
        assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4I-3 QA batch failed.');
  }

  return result;
}


/**
 * ================================================================
 * Controlled write implementation
 * ================================================================
 */

function kidlearnV3_4i3WriteAssignmentActionControlled_(payload) {
  payload = payload || {};

  var plan =
    kidlearnV3_4i3BuildAssignmentActionPlan_(payload, {
      dryRunOnly: false
    });

  if (!plan.success) {
    throw new Error(
      'Assignment action plan không pass: ' +
      plan.errors.join(' | ')
    );
  }

  if (plan.noAssignmentAvailable === true) {
    var noAssignmentResult = {
      success: true,
      action:
        'SUBMIT_ASSIGNMENT_ACTION_FROM_UI_4I_3_NO_ASSIGNMENT_AVAILABLE_V3',
      phase:
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.PHASE,
      gateMode:
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_GATE_MODE.OPEN_DEV_CONTROLLED,
      dryRunOnly:
        false,
      writeAllowedNow:
        true,
      noAssignmentAvailable:
        true,
      assignmentActionPlan:
        plan,
      prodWriteAllowed:
        false,
      realSheetWriteAllowedNow:
        true,
      actualSheetWritePerformed:
        false,
      actualDriveWritePerformed:
        false,
      message:
        'Hiện chưa có Assignment để cập nhật. Không ghi DATA_Assignments.',
      warnings:
        ['Không có Assignment. Đây là trạng thái hợp lệ nếu phụ huynh chưa giao bài.'],
      errors:
        [],
      errorCount:
        0,
      warningCount:
        1,
      submittedAt:
        new Date().toISOString()
    };

    kidlearnV3_4i3SaveSubmission_(noAssignmentResult);

    console.log(JSON.stringify(noAssignmentResult, null, 2));
    return noAssignmentResult;
  }

  var spreadsheet =
    kidlearnV3_4i3OpenSpreadsheet_();

  var sheet =
    kidlearnV3_4i3GetSheetByExactName_(
      spreadsheet,
      'DATA_Assignments'
    );

  if (!sheet) {
    throw new Error('Thiếu sheet DATA_Assignments.');
  }

  var headers =
    kidlearnV3_4i3ReadHeaders_(sheet);

  var rowIndex =
    plan.assignment.sourceRow;

  var rowValues =
    sheet
      .getRange(rowIndex, 1, 1, sheet.getLastColumn())
      .getValues()[0];

  var actionType =
    String(plan.actionType || 'START').trim().toUpperCase();

  var statusCandidates =
    actionType === 'COMPLETE'
      ? kidlearnV3_4i3CompleteStatusCandidates_()
      : kidlearnV3_4i3StartStatusCandidates_();

  var statusIndex =
    kidlearnV3_4i3FindColumnIndexByAliases_(
      headers,
      ['status']
    );

  if (statusIndex < 0) {
    throw new Error('DATA_Assignments thiếu cột status.');
  }

  var statusCell =
    sheet.getRange(rowIndex, statusIndex + 1);

  var enumDecision =
    kidlearnV3_4i3ResolveEnumSafeStatus_(
      statusCell,
      statusCandidates
    );

  if (!enumDecision.success) {
    var enumSkip = {
      success: false,
      action:
        'SUBMIT_ASSIGNMENT_ACTION_FROM_UI_4I_3_ENUM_BLOCKED_V3',
      phase:
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.PHASE,
      gateMode:
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_GATE_MODE.OPEN_DEV_CONTROLLED,
      dryRunOnly:
        false,
      writeAllowedNow:
        true,
      assignmentActionPlan:
        plan,
      enumDecision:
        enumDecision,
      actualSheetWritePerformed:
        false,
      actualDriveWritePerformed:
        false,
      prodWriteAllowed:
        false,
      errors: [
        'Không tìm được status hợp lệ theo enum validation của DATA_Assignments.'
      ],
      warnings:
        enumDecision.warnings || [],
      errorCount:
        1,
      warningCount:
        enumDecision.warnings ? enumDecision.warnings.length : 0
    };

    kidlearnV3_4i3SaveSubmission_(enumSkip);

    console.log(JSON.stringify(enumSkip, null, 2));

    throw new Error(enumSkip.errors.join(' | '));
  }

  rowValues[statusIndex] =
    enumDecision.value;

  var now =
    new Date().toISOString();

  if (actionType === 'START') {
    kidlearnV3_4i3SetByAliases_(
      rowValues,
      headers,
      ['startedAt', 'startAt'],
      now
    );
  }

  if (actionType === 'COMPLETE') {
    if (!plan.completionEvidence || plan.completionEvidence.hasEvidence !== true) {
      throw new Error(
        'Không thể COMPLETE vì chưa có completion evidence từ DATA_LessonProgress.'
      );
    }

    kidlearnV3_4i3SetByAliases_(
      rowValues,
      headers,
      ['completedAt', 'finishedAt'],
      now
    );
  }

  kidlearnV3_4i3SetByAliases_(
    rowValues,
    headers,
    ['updatedAt', 'lastUpdatedAt'],
    now
  );

  sheet
    .getRange(rowIndex, 1, 1, sheet.getLastColumn())
    .setValues([rowValues]);

  SpreadsheetApp.flush();

  var readBack =
    sheet
      .getRange(rowIndex, 1, 1, sheet.getLastColumn())
      .getValues()[0];

  var readBackStatus =
    readBack[statusIndex];

  var result = {
    success: true,
    action:
      'SUBMIT_ASSIGNMENT_ACTION_FROM_UI_4I_3_REAL_WRITE_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.PHASE,
    gateMode:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_GATE_MODE.OPEN_DEV_CONTROLLED,
    dryRunOnly:
      false,
    writeAllowedNow:
      true,
    actionType:
      actionType,
    assignmentId:
      plan.assignment.assignmentId,
    lessonId:
      plan.assignment.lessonId,
    childId:
      plan.assignment.childId,
    sourceRow:
      rowIndex,
    statusWrite: {
      columnNumber:
        statusIndex + 1,
      previousStatus:
        plan.assignment.status,
      writtenStatus:
        enumDecision.value,
      readBackStatus:
        readBackStatus,
      enumValidationFound:
        enumDecision.validationFound === true,
      allowedValues:
        enumDecision.allowedValues || []
    },
    completionEvidence:
      plan.completionEvidence || null,
    prodWriteAllowed:
      false,
    realSheetWriteAllowedNow:
      true,
    actualSheetWritePerformed:
      true,
    actualDriveWritePerformed:
      false,
    errorCount:
      0,
    warningCount:
      enumDecision.warnings ? enumDecision.warnings.length : 0,
    errors:
      [],
    warnings:
      enumDecision.warnings || [],
    submittedAt:
      now
  };

  kidlearnV3_4i3SaveSubmission_(result);

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Build action plan.
 */
function kidlearnV3_4i3BuildAssignmentActionPlan_(payload, options) {
  payload = payload || {};
  options = options || {};

  var errors = [];
  var warnings = [];

  var actionType =
    String(payload.actionType || 'START').trim().toUpperCase();

  if (
    actionType !== 'START' &&
    actionType !== 'COMPLETE'
  ) {
    errors.push(
      'actionType không hợp lệ. Chỉ nhận START hoặc COMPLETE. Current=' +
      actionType
    );
  }

  var childId =
    String(
      payload.childId ||
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.DEFAULT_CHILD_ID
    ).trim();

  var assignmentId =
    String(payload.assignmentId || '').trim();

  var lessonId =
    String(payload.lessonId || '').trim();

  var context = null;

  try {
    context =
      kidlearnV3_getAssignmentLearningContext4I1V3({
        childId:
          childId,
        parentId:
          KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.DEFAULT_PARENT_ID
      });
  } catch (errorContext) {
    errors.push(
      'Không đọc được Assignment Learning Context 4I-1: ' +
      String(errorContext.message || errorContext)
    );
  }

  var primary =
    context &&
    context.assignmentLearningContext
      ? context.assignmentLearningContext.primaryAssignment
      : null;

  if (!assignmentId && !lessonId && primary) {
    assignmentId =
      primary.assignmentId || '';

    lessonId =
      primary.lessonId || '';

    warnings.push(
      'Payload không có assignmentId/lessonId. Dùng primaryAssignment từ 4I-1 context.'
    );
  }

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4i3OpenSpreadsheet_();
  } catch (errorOpen) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(errorOpen.message || errorOpen)
    );
  }

  var assignmentLookup = null;

  if (spreadsheet) {
    try {
      assignmentLookup =
        kidlearnV3_4i3FindAssignment_(
          spreadsheet,
          childId,
          assignmentId,
          lessonId
        );
    } catch (errorFind) {
      errors.push(
        'Không tìm được Assignment: ' +
        String(errorFind.message || errorFind)
      );
    }
  }

  var assignment =
    assignmentLookup && assignmentLookup.found
      ? assignmentLookup.assignment
      : null;

  var noAssignmentAvailable =
    false;

  if (!assignment) {
    if (!assignmentId && !lessonId) {
      noAssignmentAvailable =
        true;

      warnings.push(
        'Hiện chưa có Assignment để xử lý. Trạng thái này hợp lệ nếu phụ huynh chưa giao bài.'
      );
    } else {
      errors.push(
        'Không tìm thấy Assignment theo assignmentId=' +
        assignmentId +
        ', lessonId=' +
        lessonId
      );
    }
  }

  var completionEvidence = null;

  if (
    actionType === 'COMPLETE' &&
    assignment &&
    spreadsheet
  ) {
    completionEvidence =
      kidlearnV3_4i3BuildCompletionEvidence_(
        spreadsheet,
        childId,
        assignment.lessonId
      );

    if (!completionEvidence.hasEvidence) {
      errors.push(
        'Chưa có completion evidence từ DATA_LessonProgress cho lessonId=' +
        assignment.lessonId
      );
    }
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'BUILD_ASSIGNMENT_ACTION_PLAN_4I_3_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.PHASE,
    dryRunOnly:
      options.dryRunOnly === true,
    actionType:
      actionType,
    childId:
      childId,
    requested: {
      assignmentId:
        assignmentId,
      lessonId:
        lessonId
    },
    assignment:
      assignment,
    noAssignmentAvailable:
      noAssignmentAvailable,
    completionEvidence:
      completionEvidence,
    plannedWrite: {
      sheetName:
        'DATA_Assignments',
      statusUpdate:
        noAssignmentAvailable ? false : true,
      startTimestamp:
        actionType === 'START' && !noAssignmentAvailable,
      completeTimestamp:
        actionType === 'COMPLETE' && !noAssignmentAvailable,
      requireCompletionEvidence:
        actionType === 'COMPLETE'
    },
    prodWriteAllowed:
      false,
    realSheetWriteAllowedNow:
      false,
    actualSheetWritePerformed:
      false,
    actualDriveWritePerformed:
      false,
    errorCount:
      errors.length,
    warningCount:
      kidlearnV3_4i3UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4i3UniqueArray_(warnings)
  };

  return result;
}


/**
 * Sync completed assignments.
 */
function kidlearnV3_4i3SyncCompletedAssignments_(options, dryRunOnly) {
  options = options || {};

  var errors = [];
  var warnings = [];

  var childId =
    String(
      options.childId ||
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.DEFAULT_CHILD_ID
    ).trim();

  var spreadsheet =
    kidlearnV3_4i3OpenSpreadsheet_();

  var assignments =
    kidlearnV3_4i3ReadAllAssignmentsForChild_(
      spreadsheet,
      childId
    );

  var candidates = [];
  var updated = [];
  var skipped = [];

  for (var i = 0; i < assignments.length; i++) {
    var item =
      assignments[i];

    if (kidlearnV3_4i3IsCompletedStatus_(item.status)) {
      skipped.push({
        assignmentId:
          item.assignmentId,
        lessonId:
          item.lessonId,
        reason:
          'ALREADY_COMPLETED'
      });
      continue;
    }

    var evidence =
      kidlearnV3_4i3BuildCompletionEvidence_(
        spreadsheet,
        childId,
        item.lessonId
      );

    if (!evidence.hasEvidence) {
      skipped.push({
        assignmentId:
          item.assignmentId,
        lessonId:
          item.lessonId,
        reason:
          'NO_COMPLETION_EVIDENCE'
      });
      continue;
    }

    candidates.push({
      assignment:
        item,
      evidence:
        evidence
    });
  }

  if (dryRunOnly) {
    return {
      success: true,
      action:
        'SYNC_COMPLETED_ASSIGNMENTS_FROM_LESSON_PROGRESS_4I_3_DRY_RUN_V3',
      phase:
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.PHASE,
      childId:
        childId,
      dryRunOnly:
        true,
      candidateCount:
        candidates.length,
      skippedCount:
        skipped.length,
      candidates:
        candidates,
      skipped:
        skipped,
      prodWriteAllowed:
        false,
      realSheetWriteAllowedNow:
        false,
      actualSheetWritePerformed:
        false,
      actualDriveWritePerformed:
        false,
      errorCount:
        0,
      warningCount:
        warnings.length,
      errors:
        [],
      warnings:
        warnings,
      syncedAt:
        new Date().toISOString()
    };
  }

  var sheet =
    kidlearnV3_4i3GetSheetByExactName_(
      spreadsheet,
      'DATA_Assignments'
    );

  if (!sheet) {
    throw new Error('Thiếu sheet DATA_Assignments.');
  }

  var headers =
    kidlearnV3_4i3ReadHeaders_(sheet);

  for (var c = 0; c < candidates.length; c++) {
    var candidate =
      candidates[c];

    var rowIndex =
      candidate.assignment.sourceRow;

    var rowValues =
      sheet
        .getRange(rowIndex, 1, 1, sheet.getLastColumn())
        .getValues()[0];

    var statusIndex =
      kidlearnV3_4i3FindColumnIndexByAliases_(
        headers,
        ['status']
      );

    if (statusIndex < 0) {
      errors.push('DATA_Assignments thiếu cột status.');
      continue;
    }

    var statusCell =
      sheet.getRange(rowIndex, statusIndex + 1);

    var enumDecision =
      kidlearnV3_4i3ResolveEnumSafeStatus_(
        statusCell,
        kidlearnV3_4i3CompleteStatusCandidates_()
      );

    if (!enumDecision.success) {
      skipped.push({
        assignmentId:
          candidate.assignment.assignmentId,
        lessonId:
          candidate.assignment.lessonId,
        reason:
          'NO_VALID_COMPLETED_STATUS_FOR_ENUM',
        allowedValues:
          enumDecision.allowedValues || []
      });
      continue;
    }

    rowValues[statusIndex] =
      enumDecision.value;

    var now =
      new Date().toISOString();

    kidlearnV3_4i3SetByAliases_(
      rowValues,
      headers,
      ['completedAt', 'finishedAt'],
      now
    );

    kidlearnV3_4i3SetByAliases_(
      rowValues,
      headers,
      ['updatedAt', 'lastUpdatedAt'],
      now
    );

    sheet
      .getRange(rowIndex, 1, 1, sheet.getLastColumn())
      .setValues([rowValues]);

    updated.push({
      assignmentId:
        candidate.assignment.assignmentId,
      lessonId:
        candidate.assignment.lessonId,
      rowIndex:
        rowIndex,
      writtenStatus:
        enumDecision.value,
      evidence:
        candidate.evidence
    });
  }

  SpreadsheetApp.flush();

  return {
    success:
      errors.length === 0,
    action:
      'SYNC_COMPLETED_ASSIGNMENTS_FROM_LESSON_PROGRESS_4I_3_REAL_WRITE_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.PHASE,
    childId:
      childId,
    dryRunOnly:
      false,
    candidateCount:
      candidates.length,
    updatedCount:
      updated.length,
    skippedCount:
      skipped.length,
    updated:
      updated,
    skipped:
      skipped,
    prodWriteAllowed:
      false,
    realSheetWriteAllowedNow:
      true,
    actualSheetWritePerformed:
      updated.length > 0,
    actualDriveWritePerformed:
      false,
    errorCount:
      errors.length,
    warningCount:
      warnings.length,
    errors:
      errors,
    warnings:
      warnings,
    syncedAt:
      new Date().toISOString()
  };
}


/**
 * ================================================================
 * Readiness + UI markers
 * ================================================================
 */

function kidlearnV3_4i3BuildReadiness_() {
  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4i3CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var phase4I2 =
    kidlearnV3_4i3SafeCall_(
      'kidlearnV3_assertAssignmentLearningUi4I2ReadyV3'
    );

  if (!phase4I2.success) {
    errors.push(
      '4I-2 chưa READY_FOR_4I_3: ' +
      phase4I2.message
    );
  }

  var context =
    kidlearnV3_4i3SafeCall_(
      'kidlearnV3_getAssignmentLearningContext4I1V3',
      [
        {
          childId:
            KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.DEFAULT_CHILD_ID,
          parentId:
            KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.DEFAULT_PARENT_ID
        }
      ]
    );

  if (!context.success) {
    errors.push(
      'Không đọc được Assignment Learning Context 4I-1: ' +
      context.message
    );
  }

  var headers =
    kidlearnV3_4i3DebugAssignmentHeaders_();

  if (!headers.success) {
    errors =
      errors.concat(headers.errors || []);
  }

  var markers =
    kidlearnV3_4i3InspectUiMarkers_();

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
      'BUILD_ASSIGNMENT_WRITE_COMPLETION_READINESS_4I_3_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.PARENT_PHASE,
    writeName:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.WRITE_NAME,
    prerequisite: {
      phase4I2Ready:
        phase4I2.success === true,
      contextReadable:
        context.success === true,
      assignmentHeadersReady:
        headers.success === true,
      uiMarkersReady:
        markers.success === true
    },
    contextSummary:
      context.output && context.output.contextSummary
        ? context.output.contextSummary
        : null,
    assignmentHeaders:
      headers,
    uiMarkers:
      markers,
    gateMode:
      kidlearnV3_4i3GetGateMode_(),
    nextBundle:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.NEXT_STAGE,
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
      kidlearnV3_4i3UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4i3UniqueArray_(warnings)
  };
}


function kidlearnV3_4i3InspectUiMarkers_() {
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
  } catch (errorShell) {
    errors.push(
      'Không đọc được UI_Product_Shell_4A: ' +
      String(errorShell.message || errorShell)
    );
  }

  try {
    client =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_AssignmentLearning_Write_4I3')
        .getContent();
  } catch (errorClient) {
    errors.push(
      'Không đọc được UI_Product_Client_AssignmentLearning_Write_4I3: ' +
      String(errorClient.message || errorClient)
    );
  }

  try {
    styles =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Styles_4A')
        .getContent();
  } catch (errorStyles) {
    errors.push(
      'Không đọc được UI_Product_Styles_4A: ' +
      String(errorStyles.message || errorStyles)
    );
  }

  kidlearnV3_4i3CheckMarkers_(
    shell,
    [
      'UI_Product_Client_AssignmentLearning_Write_4I3'
    ],
    'Shell',
    errors
  );

  kidlearnV3_4i3CheckMarkers_(
    client,
    [
      'KIDLEARN_ASSIGNMENT_WRITE_UI_4I3',
      'patchAssignmentLearningWriteControls4I3',
      'submitAssignmentStartWrite4I3',
      'submitAssignmentCompleteWrite4I3',
      'kidlearnV3_submitAssignmentActionFromUi4I3V3',
      'kl-assignment-write-control-4i3',
      'kl-assignment-write-result-4i3'
    ],
    'Client 4I-3',
    errors
  );

  kidlearnV3_4i3CheckMarkers_(
    styles,
    [
      '.kl-assignment-write-control-4i3',
      '.kl-assignment-write-button-4i3',
      '.kl-assignment-write-result-4i3',
      '.kl-assignment-write-gate-4i3'
    ],
    'CSS',
    errors
  );

  return {
    success:
      errors.length === 0,
    action:
      'INSPECT_ASSIGNMENT_WRITE_UI_MARKERS_4I_3_V3',
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


function kidlearnV3_4i3CheckMarkers_(content, markers, label, errors) {
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


/**
 * ================================================================
 * Assignment readers
 * ================================================================
 */

function kidlearnV3_4i3FindAssignment_(spreadsheet, childId, assignmentId, lessonId) {
  var sheet =
    kidlearnV3_4i3GetSheetByExactName_(
      spreadsheet,
      'DATA_Assignments'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    return {
      found: false,
      reason:
        'DATA_Assignments_EMPTY_OR_MISSING'
    };
  }

  var headers =
    kidlearnV3_4i3ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  var fallback = null;

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var rowAssignmentId =
      String(kidlearnV3_4i3ReadValueByAliases_(row, headers, ['assignmentId', 'id']) || '').trim();

    var rowChildId =
      String(kidlearnV3_4i3ReadValueByAliases_(row, headers, ['childId', 'studentId', 'learnerId']) || '').trim();

    var rowLessonId =
      String(kidlearnV3_4i3ReadValueByAliases_(row, headers, ['lessonId']) || '').trim();

    var status =
      String(kidlearnV3_4i3ReadValueByAliases_(row, headers, ['status']) || '').trim().toUpperCase();

    var item = {
      assignmentId:
        rowAssignmentId,
      childId:
        rowChildId || childId,
      lessonId:
        rowLessonId,
      status:
        status || 'ASSIGNED',
      sourceRow:
        i + 2
    };

    if (
      assignmentId &&
      rowAssignmentId === assignmentId
    ) {
      return {
        found: true,
        assignment:
          item
      };
    }

    if (
      !assignmentId &&
      lessonId &&
      rowLessonId === lessonId &&
      (!rowChildId || rowChildId === childId)
    ) {
      return {
        found: true,
        assignment:
          item
      };
    }

    if (
      !assignmentId &&
      !lessonId &&
      (!rowChildId || rowChildId === childId) &&
      !kidlearnV3_4i3IsCompletedStatus_(status)
    ) {
      if (!fallback) {
        fallback = item;
      }
    }
  }

  if (fallback) {
    return {
      found: true,
      assignment:
        fallback,
      fallbackUsed:
        true
    };
  }

  return {
    found: false,
    reason:
      'ASSIGNMENT_NOT_FOUND'
  };
}


function kidlearnV3_4i3ReadAllAssignmentsForChild_(spreadsheet, childId) {
  var sheet =
    kidlearnV3_4i3GetSheetByExactName_(
      spreadsheet,
      'DATA_Assignments'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    return [];
  }

  var headers =
    kidlearnV3_4i3ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  var items = [];

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var rowChildId =
      String(kidlearnV3_4i3ReadValueByAliases_(row, headers, ['childId', 'studentId', 'learnerId']) || '').trim();

    if (rowChildId && rowChildId !== childId) {
      continue;
    }

    var lessonId =
      String(kidlearnV3_4i3ReadValueByAliases_(row, headers, ['lessonId']) || '').trim();

    if (!lessonId) continue;

    items.push({
      assignmentId:
        String(kidlearnV3_4i3ReadValueByAliases_(row, headers, ['assignmentId', 'id']) || ''),
      childId:
        rowChildId || childId,
      lessonId:
        lessonId,
      status:
        String(kidlearnV3_4i3ReadValueByAliases_(row, headers, ['status']) || '').trim().toUpperCase(),
      sourceRow:
        i + 2
    });
  }

  return items;
}


function kidlearnV3_4i3BuildCompletionEvidence_(spreadsheet, childId, lessonId) {
  var sheet =
    kidlearnV3_4i3GetSheetByExactName_(
      spreadsheet,
      'DATA_LessonProgress'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    return {
      hasEvidence: false,
      reason:
        'DATA_LessonProgress_EMPTY_OR_MISSING',
      lessonId:
        lessonId
    };
  }

  var headers =
    kidlearnV3_4i3ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  var latest = null;

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var rowChildId =
      String(kidlearnV3_4i3ReadValueByAliases_(row, headers, ['childId', 'studentId', 'learnerId']) || '').trim();

    if (rowChildId && rowChildId !== childId) continue;

    var rowLessonId =
      String(kidlearnV3_4i3ReadValueByAliases_(row, headers, ['lessonId']) || '').trim();

    if (rowLessonId !== lessonId) continue;

    var progress =
      kidlearnV3_4i3ToNumber_(
        kidlearnV3_4i3ReadValueByAliases_(
          row,
          headers,
          ['progressPercent', 'completionPercent', 'percentComplete']
        )
      );

    var status =
      String(kidlearnV3_4i3ReadValueByAliases_(row, headers, ['status']) || '').trim().toUpperCase();

    var evidence = {
      hasEvidence:
        progress >= 100 ||
        kidlearnV3_4i3IsCompletedStatus_(status),
      childId:
        rowChildId || childId,
      lessonId:
        rowLessonId,
      progressPercent:
        progress,
      progressStatus:
        status,
      sourceRow:
        i + 2,
      reason:
        progress >= 100
          ? 'PROGRESS_PERCENT_100'
          : (
            kidlearnV3_4i3IsCompletedStatus_(status)
              ? 'PROGRESS_STATUS_COMPLETED'
              : 'NOT_COMPLETED_YET'
          )
    };

    latest =
      evidence;
  }

  return latest || {
    hasEvidence: false,
    reason:
      'NO_LESSON_PROGRESS_ROW_FOR_ASSIGNMENT',
    childId:
      childId,
    lessonId:
      lessonId
  };
}


/**
 * ================================================================
 * Enum-safe status helpers
 * ================================================================
 */

function kidlearnV3_4i3StartStatusCandidates_() {
  return [
    'IN_PROGRESS',
    'STARTED',
    'ASSIGNED',
    'OPEN',
    'PENDING',
    'ASSIGNMENT_STATUS_IN_PROGRESS',
    'ASSIGNMENT_STATUS_STARTED',
    'ASSIGNMENT_STATUS_ASSIGNED'
  ];
}


function kidlearnV3_4i3CompleteStatusCandidates_() {
  return [
    'COMPLETED',
    'DONE',
    'FINISHED',
    'ASSIGNMENT_STATUS_COMPLETED',
    'ASSIGNMENT_STATUS_DONE',
    'ASSIGNMENT_STATUS_FINISHED'
  ];
}


function kidlearnV3_4i3ResolveEnumSafeStatus_(cell, candidates) {
  candidates =
    candidates || [];

  var warnings = [];

  var allowedValues =
    kidlearnV3_4i3GetAllowedValuesFromValidation_(cell);

  if (allowedValues.length === 0) {
    return {
      success: true,
      value:
        candidates[0],
      validationFound:
        false,
      allowedValues:
        [],
      warnings:
        [
          'Không thấy data validation/enum ở status cell. Dùng candidate mặc định: ' +
          candidates[0]
        ]
    };
  }

  for (var i = 0; i < candidates.length; i++) {
    var candidate =
      String(candidates[i] || '').trim();

    var normalizedCandidate =
      kidlearnV3_4i3NormalizeStatusValue_(candidate);

    for (var j = 0; j < allowedValues.length; j++) {
      var allowed =
        String(allowedValues[j] || '').trim();

      var normalizedAllowed =
        kidlearnV3_4i3NormalizeStatusValue_(allowed);

      if (
        normalizedAllowed === normalizedCandidate ||
        normalizedAllowed.indexOf(normalizedCandidate) !== -1 ||
        normalizedCandidate.indexOf(normalizedAllowed) !== -1
      ) {
        return {
          success: true,
          value:
            allowed,
          validationFound:
            true,
          allowedValues:
            allowedValues,
          matchedCandidate:
            candidate,
          warnings:
            warnings
        };
      }
    }
  }

  return {
    success: false,
    value:
      '',
    validationFound:
      true,
    allowedValues:
      allowedValues,
    candidates:
      candidates,
    warnings:
      [
        'Không có status candidate nào khớp với enum validation của DATA_Assignments.'
      ]
  };
}


function kidlearnV3_4i3GetAllowedValuesFromValidation_(cell) {
  var result = [];

  try {
    var validation =
      cell.getDataValidation();

    if (!validation) {
      return [];
    }

    var type =
      validation.getCriteriaType();

    var values =
      validation.getCriteriaValues();

    if (
      type === SpreadsheetApp.DataValidationCriteria.VALUE_IN_LIST
    ) {
      var list =
        values && values[0]
          ? values[0]
          : [];

      for (var i = 0; i < list.length; i++) {
        if (list[i] !== '') {
          result.push(String(list[i]));
        }
      }
    }

    if (
      type === SpreadsheetApp.DataValidationCriteria.VALUE_IN_RANGE
    ) {
      var range =
        values && values[0]
          ? values[0]
          : null;

      if (range) {
        var rangeValues =
          range.getValues();

        for (var r = 0; r < rangeValues.length; r++) {
          for (var c = 0; c < rangeValues[r].length; c++) {
            if (rangeValues[r][c] !== '') {
              result.push(String(rangeValues[r][c]));
            }
          }
        }
      }
    }

  } catch (error) {
    return [];
  }

  return kidlearnV3_4i3UniqueArray_(result);
}


function kidlearnV3_4i3NormalizeStatusValue_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .replace(/-/g, '')
    .replace(/\./g, '')
    .replace(/\//g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '');
}


function kidlearnV3_4i3IsCompletedStatus_(status) {
  status =
    kidlearnV3_4i3NormalizeStatusValue_(status);

  return (
    status === 'COMPLETED' ||
    status === 'DONE' ||
    status === 'FINISHED' ||
    status.indexOf('COMPLETED') !== -1 ||
    status.indexOf('DONE') !== -1 ||
    status.indexOf('FINISHED') !== -1
  );
}


/**
 * ================================================================
 * Header debug
 * ================================================================
 */

function kidlearnV3_debugAssignmentHeaders4I3V3() {
  var result =
    kidlearnV3_4i3DebugAssignmentHeaders_();

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      'DATA_Assignments headers chưa pass: ' +
      result.errors.join(' | ')
    );
  }

  return result;
}


function kidlearnV3_4i3DebugAssignmentHeaders_() {
  var errors = [];

  var spreadsheet =
    kidlearnV3_4i3OpenSpreadsheet_();

  var sheet =
    kidlearnV3_4i3GetSheetByExactName_(
      spreadsheet,
      'DATA_Assignments'
    );

  if (!sheet) {
    return {
      success: false,
      sheetName:
        'DATA_Assignments',
      exists:
        false,
      errors:
        ['Thiếu sheet DATA_Assignments']
    };
  }

  var headers =
    kidlearnV3_4i3ReadHeaders_(sheet);

  var required = [
    {
      field:
        'childId',
      aliases:
        ['childId', 'studentId', 'learnerId']
    },
    {
      field:
        'lessonId',
      aliases:
        ['lessonId']
    },
    {
      field:
        'status',
      aliases:
        ['status']
    }
  ];

  var resolved = [];

  for (var i = 0; i < required.length; i++) {
    var index =
      kidlearnV3_4i3FindColumnIndexByAliases_(
        headers,
        required[i].aliases
      );

    resolved.push({
      field:
        required[i].field,
      success:
        index >= 0,
      columnNumber:
        index >= 0 ? index + 1 : null,
      headerName:
        index >= 0 ? headers[index] : ''
    });

    if (index < 0) {
      errors.push(
        'DATA_Assignments chưa resolve được field ' +
        required[i].field
      );
    }
  }

  return {
    success:
      errors.length === 0,
    action:
      'DEBUG_ASSIGNMENT_HEADERS_4I_3_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.PHASE,
    sheetName:
      'DATA_Assignments',
    exists:
      true,
    lastRow:
      sheet.getLastRow(),
    lastColumn:
      sheet.getLastColumn(),
    resolved:
      resolved,
    actualSheetWritePerformed:
      false,
    actualDriveWritePerformed:
      false,
    errors:
      errors
  };
}


/**
 * ================================================================
 * Spreadsheet helpers
 * ================================================================
 */

function kidlearnV3_4i3OpenSpreadsheet_() {
  var active =
    SpreadsheetApp.getActiveSpreadsheet();

  if (active) {
    return active;
  }

  var properties =
    PropertiesService.getScriptProperties();

  var keys = [
    'KIDLEARN_V3_DEV_SPREADSHEET_ID',
    'DEV_SPREADSHEET_ID'
  ];

  try {
    if (
      typeof KIDLEARN_V3 !== 'undefined' &&
      KIDLEARN_V3 &&
      KIDLEARN_V3.SCRIPT_PROPERTIES &&
      KIDLEARN_V3.SCRIPT_PROPERTIES.DEV_SPREADSHEET_ID
    ) {
      keys.unshift(
        KIDLEARN_V3.SCRIPT_PROPERTIES.DEV_SPREADSHEET_ID
      );
    }
  } catch (error) {
    // ignore
  }

  for (var i = 0; i < keys.length; i++) {
    var id =
      properties.getProperty(keys[i]);

    if (id) {
      return SpreadsheetApp.openById(id);
    }
  }

  throw new Error('Không tìm thấy DEV spreadsheet id.');
}


function kidlearnV3_4i3GetSheetByExactName_(spreadsheet, sheetName) {
  if (
    typeof kidlearnV3_getSheetByExactName_ === 'function'
  ) {
    return kidlearnV3_getSheetByExactName_(
      spreadsheet,
      sheetName
    );
  }

  var sheets =
    spreadsheet.getSheets();

  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() === sheetName) {
      return sheets[i];
    }
  }

  return null;
}


function kidlearnV3_4i3ReadHeaders_(sheet) {
  return sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];
}


function kidlearnV3_4i3ReadValueByAliases_(row, headers, aliases) {
  var index =
    kidlearnV3_4i3FindColumnIndexByAliases_(
      headers,
      aliases
    );

  if (index < 0) return '';

  return row[index];
}


function kidlearnV3_4i3SetByAliases_(row, headers, aliases, value) {
  var index =
    kidlearnV3_4i3FindColumnIndexByAliases_(
      headers,
      aliases
    );

  if (index >= 0) {
    row[index] = value;
  }
}


function kidlearnV3_4i3FindColumnIndexByAliases_(headers, aliases) {
  headers =
    headers || [];

  aliases =
    kidlearnV3_4i3ExpandAliases_(aliases || []);

  for (var a = 0; a < aliases.length; a++) {
    var target =
      kidlearnV3_4i3NormalizeHeader_(aliases[a]);

    if (!target) continue;

    for (var j = 0; j < headers.length; j++) {
      var current =
        kidlearnV3_4i3NormalizeHeader_(headers[j]);

      if (current === target) {
        return j;
      }
    }
  }

  return -1;
}


function kidlearnV3_4i3ExpandAliases_(aliases) {
  var dictionary =
    kidlearnV3_4i3AliasDictionary_();

  var seen = {};
  var result = [];

  function add(value) {
    value =
      String(value || '').trim();

    if (!value) return;

    var key =
      kidlearnV3_4i3NormalizeHeader_(value);

    if (!seen[key]) {
      seen[key] = true;
      result.push(value);
    }
  }

  for (var i = 0; i < aliases.length; i++) {
    var alias =
      String(aliases[i] || '').trim();

    add(alias);

    var normalized =
      kidlearnV3_4i3NormalizeHeader_(alias);

    var extra =
      dictionary[normalized] || [];

    for (var j = 0; j < extra.length; j++) {
      add(extra[j]);
    }
  }

  return result;
}


function kidlearnV3_4i3AliasDictionary_() {
  var dictionary = {};

  function set(key, values) {
    dictionary[
      kidlearnV3_4i3NormalizeHeader_(key)
    ] = values;
  }

  set('assignmentId', [
    'assignmentId',
    'id',
    'Mã bài giao',
    'Mã assignment',
    'Mã giao bài',
    'Mã nhiệm vụ',
    'Mã phân công'
  ]);

  set('childId', [
    'childId',
    'studentId',
    'learnerId',
    'Mã bé',
    'Mã trẻ',
    'Mã học sinh',
    'Mã người học',
    'Hồ sơ bé'
  ]);

  set('studentId', dictionary[kidlearnV3_4i3NormalizeHeader_('childId')]);
  set('learnerId', dictionary[kidlearnV3_4i3NormalizeHeader_('childId')]);

  set('lessonId', [
    'lessonId',
    'Mã bài học',
    'Mã lesson',
    'Mã bài',
    'Mã học liệu'
  ]);

  set('status', [
    'status',
    'Trạng thái',
    'Tình trạng'
  ]);

  set('startedAt', [
    'startedAt',
    'startAt',
    'Bắt đầu lúc',
    'Ngày bắt đầu',
    'Thời điểm bắt đầu'
  ]);

  set('completedAt', [
    'completedAt',
    'finishedAt',
    'Hoàn thành lúc',
    'Ngày hoàn thành',
    'Thời điểm hoàn thành'
  ]);

  set('updatedAt', [
    'updatedAt',
    'lastUpdatedAt',
    'Ngày cập nhật',
    'Cập nhật lúc',
    'Thời điểm cập nhật'
  ]);

  set('lastUpdatedAt', dictionary[kidlearnV3_4i3NormalizeHeader_('updatedAt')]);

  set('progressPercent', [
    'progressPercent',
    'completionPercent',
    'percentComplete',
    'Tiến độ',
    'Tỷ lệ hoàn thành'
  ]);

  return dictionary;
}


function kidlearnV3_4i3NormalizeHeader_(value) {
  var text =
    String(value || '')
      .trim()
      .toLowerCase();

  text =
    kidlearnV3_4i3StripVietnameseDiacritics_(text);

  return text
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .replace(/-/g, '')
    .replace(/\./g, '')
    .replace(/\//g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '');
}


function kidlearnV3_4i3StripVietnameseDiacritics_(text) {
  text =
    String(text || '');

  try {
    text =
      text.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
  } catch (error) {
    // ignore
  }

  return text
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}


/**
 * ================================================================
 * Generic helpers
 * ================================================================
 */

function kidlearnV3_4i3WriteGatePropertyKey_() {
  try {
    if (
      typeof KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS !== 'undefined' &&
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS &&
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS.WRITE_GATE_MODE
    ) {
      return KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS.WRITE_GATE_MODE;
    }
  } catch (error) {
    // ignore
  }

  return 'KIDLEARN_V3_PHASE_4I_ASSIGNMENT_WRITE_GATE_MODE';
}


function kidlearnV3_4i3GetGateMode_() {
  var mode =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        kidlearnV3_4i3WriteGatePropertyKey_()
      ) ||
    KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.DEFAULT_GATE_MODE;

  if (
    mode !== KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_GATE_MODE.CLOSED_DRY_RUN_ONLY &&
    mode !== KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_GATE_MODE.OPEN_DEV_CONTROLLED
  ) {
    return KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_GATE_MODE.CLOSED_DRY_RUN_ONLY;
  }

  return mode;
}


function kidlearnV3_4i3AssertDev_() {
  var dev =
    kidlearnV3_4i3CheckDevSafety_();

  if (!dev.success) {
    throw new Error(dev.errors.join(' | '));
  }
}


function kidlearnV3_4i3CheckDevSafety_() {
  var errors = [];

  try {
    if (typeof kidlearnV3_assertDevEnvironment_ === 'function') {
      kidlearnV3_assertDevEnvironment_();

      return {
        success: true,
        environment: 'DEV',
        prodWriteAllowed: false,
        errors: []
      };
    }
  } catch (errorAssertDev) {
    errors.push(
      String(errorAssertDev.message || errorAssertDev)
    );
  }

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
      kidlearnV3_4i3UniqueArray_(errors)
  };
}


function kidlearnV3_4i3SafeCall_(functionName, args) {
  args =
    args || [];

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
        output:
          null
      };
    }

    var fn =
      eval(functionName);

    var output =
      fn.apply(null, args);

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
          : kidlearnV3_4i3PreviewValue_(JSON.stringify(output || {})),
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


function kidlearnV3_4i3ToNumber_(value) {
  var number =
    Number(value || 0);

  return isNaN(number) ? 0 : number;
}


function kidlearnV3_4i3PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 450) {
    return text.substring(0, 450) + '...';
  }

  return text;
}


function kidlearnV3_4i3UniqueArray_(items) {
  var map = {};
  var result = [];

  items =
    items || [];

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


function kidlearnV3_4i3SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.PHASE,
      status:
        status,
      gateMode:
        result.gateMode || kidlearnV3_4i3GetGateMode_(),
      nextBundle:
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_CONFIG.NEXT_STAGE,
      prodWriteAllowed:
        false,
      realSheetWriteAllowedNow:
        result.realSheetWriteAllowedNow === true,
      actualSheetWritePerformed:
        result.actualSheetWritePerformed === true,
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


function kidlearnV3_4i3SaveSubmission_(result) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_KEYS.LAST_SUBMIT_AT,
    new Date().toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_KEYS.LAST_SUBMISSION_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase,
      gateMode:
        result.gateMode,
      dryRunOnly:
        result.dryRunOnly === true,
      actionType:
        result.actionType || '',
      assignmentId:
        result.assignmentId || '',
      lessonId:
        result.lessonId || '',
      writeAllowedNow:
        result.writeAllowedNow === true,
      actualSheetWritePerformed:
        result.actualSheetWritePerformed === true,
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


function kidlearnV3_4i3SaveSync_(result) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_KEYS.LAST_SYNC_AT,
    new Date().toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_ASSIGNMENT_WRITE_4I3_KEYS.LAST_SYNC_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase,
      gateMode:
        result.gateMode || kidlearnV3_4i3GetGateMode_(),
      dryRunOnly:
        result.dryRunOnly === true,
      candidateCount:
        result.candidateCount || 0,
      updatedCount:
        result.updatedCount || 0,
      skippedCount:
        result.skippedCount || 0,
      actualSheetWritePerformed:
        result.actualSheetWritePerformed === true,
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


function kidlearnV3_4i3ReadJsonProperty_(key) {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(key);

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      raw:
        text
    };
  }
}