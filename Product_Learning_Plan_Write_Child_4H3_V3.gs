/**
 * ================================================================
 * KIDLEARN V3 - LEARNING PLAN CONTROLLED WRITE + CHILD VISIBILITY
 * Step: 4H-3
 * Version: 3.1.0
 * Includes:
 * - PATCH 4H-3P1: Allow draft validation while write gate is open
 * - PATCH 4H-3P2: Vietnamese header alias support
 * ================================================================
 *
 * Purpose:
 * - Controlled DEV write for Parent Learning Plan.
 * - Write only:
 *   + DATA_DailyGoals
 *   + DATA_Assignments
 * - Add Child Home visibility context for today's learning plan.
 *
 * Safety:
 * - DEV only.
 * - Gate default: CLOSED_DRY_RUN_ONLY.
 * - No DATA_LessonProgress reset.
 * - No DATA_Responses write.
 * - No Google Drive write.
 * - No PROD write.
 */


var KIDLEARN_V3_LEARNING_PLAN_4H3_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4H3_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4H3_LAST_PREVIEW_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4H3_LAST_READY_AT',
  LAST_GATE_CHANGE_AT: 'KIDLEARN_V3_PHASE_4H3_LAST_GATE_CHANGE_AT',
  LAST_SUBMIT_AT: 'KIDLEARN_V3_PHASE_4H3_LAST_SUBMIT_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4H3_LAST_RESULT_JSON',
  LAST_SUBMISSION_JSON: 'KIDLEARN_V3_PHASE_4H3_LAST_SUBMISSION_JSON',
  CHILD_CONTEXT_LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4H3_CHILD_CONTEXT_LAST_RESULT_JSON'
};


var KIDLEARN_V3_LEARNING_PLAN_4H3_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  READY_FOR_4H_4: 'READY_FOR_4H_4',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_LEARNING_PLAN_4H3_GATE_MODE = {
  CLOSED_DRY_RUN_ONLY: 'CLOSED_DRY_RUN_ONLY',
  OPEN_DEV_CONTROLLED: 'OPEN_DEV_CONTROLLED'
};


var KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG = {
  PHASE: '4H-3',
  PARENT_PHASE: '4H',
  PREVIOUS_BUNDLE: '4H-2',
  NEXT_BUNDLE: '4H-4',
  NEXT_STAGE: 'QA_AND_PHASE_4H_LOCK',
  WRITE_NAME: 'CONTROLLED_WRITE_DAILY_GOALS_ASSIGNMENTS',
  CHILD_VISIBILITY_NAME: 'CHILD_HOME_LEARNING_PLAN_VISIBILITY',
  DEFAULT_PARENT_ID: 'PARENT',
  DEFAULT_CHILD_ID: 'CHD_V2_CHILD_DEFAULT',
  OPEN_CONFIRM_TEXT: 'CONFIRM_OPEN_LEARNING_PLAN_WRITE_GATE_4H3',
  CLOSE_CONFIRM_TEXT: 'CONFIRM_CLOSE_LEARNING_PLAN_WRITE_GATE_4H3',
  DEFAULT_GATE_MODE: 'CLOSED_DRY_RUN_ONLY',
  ASSIGNMENT_SOURCE: 'PARENT_LEARNING_PLAN_4H',
  PROD_WRITE_ALLOWED: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Preview 4H-3 readiness.
 */
function kidlearnV3_previewLearningPlanWriteChild4H3V3() {
  var result =
    kidlearnV3_4h3BuildReadiness_();

  result.action =
    'PREVIEW_LEARNING_PLAN_WRITE_CHILD_4H_3_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_LEARNING_PLAN_4H3_STATUS.PREVIEWED
      : KIDLEARN_V3_LEARNING_PLAN_4H3_STATUS.FAILED;

  kidlearnV3_4h3SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_LEARNING_PLAN_4H3_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4H-3 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Open write gate.
 */
function kidlearnV3_openLearningPlanWriteGate4H3ConfirmV3() {
  return kidlearnV3_setLearningPlanWriteGate4H3V3({
    confirm:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.OPEN_CONFIRM_TEXT,
    gateMode:
      KIDLEARN_V3_LEARNING_PLAN_4H3_GATE_MODE.OPEN_DEV_CONTROLLED
  });
}


/**
 * Close write gate.
 */
function kidlearnV3_closeLearningPlanWriteGate4H3ConfirmV3() {
  return kidlearnV3_setLearningPlanWriteGate4H3V3({
    confirm:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.CLOSE_CONFIRM_TEXT,
    gateMode:
      KIDLEARN_V3_LEARNING_PLAN_4H3_GATE_MODE.CLOSED_DRY_RUN_ONLY
  });
}


/**
 * Set gate mode.
 */
function kidlearnV3_setLearningPlanWriteGate4H3V3(options) {
  options = options || {};

  var targetMode =
    String(options.gateMode || '').trim();

  var confirmText =
    String(options.confirm || '').trim().toUpperCase();

  if (
    targetMode !== KIDLEARN_V3_LEARNING_PLAN_4H3_GATE_MODE.CLOSED_DRY_RUN_ONLY &&
    targetMode !== KIDLEARN_V3_LEARNING_PLAN_4H3_GATE_MODE.OPEN_DEV_CONTROLLED
  ) {
    throw new Error('Invalid gateMode=' + targetMode);
  }

  if (
    targetMode === KIDLEARN_V3_LEARNING_PLAN_4H3_GATE_MODE.OPEN_DEV_CONTROLLED &&
    confirmText !== KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.OPEN_CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm mở gate. Cần confirm=' +
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.OPEN_CONFIRM_TEXT
    );
  }

  if (
    targetMode === KIDLEARN_V3_LEARNING_PLAN_4H3_GATE_MODE.CLOSED_DRY_RUN_ONLY &&
    confirmText !== KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.CLOSE_CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm đóng gate. Cần confirm=' +
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.CLOSE_CONFIRM_TEXT
    );
  }

  kidlearnV3_4h3AssertDev_();

  PropertiesService
    .getScriptProperties()
    .setProperty(
      kidlearnV3_4h3WriteGatePropertyKey_(),
      targetMode
    );

  var result = {
    success: true,
    action: 'SET_LEARNING_PLAN_WRITE_GATE_4H_3_V3',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.PHASE,
    gateMode:
      targetMode,
    writeAllowedNow:
      targetMode === KIDLEARN_V3_LEARNING_PLAN_4H3_GATE_MODE.OPEN_DEV_CONTROLLED,
    prodWriteAllowed: false,
    realDriveWriteAllowedNow: false,
    changedAt:
      new Date().toISOString()
  };

  kidlearnV3_4h3SaveStatus_(
    result,
    KIDLEARN_V3_LEARNING_PLAN_4H3_STATUS.PREVIEWED,
    KIDLEARN_V3_LEARNING_PLAN_4H3_KEYS.LAST_GATE_CHANGE_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get 4H-3 status.
 */
function kidlearnV3_getLearningPlanWriteChild4H3StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var gateMode =
    kidlearnV3_4h3GetGateMode_();

  var result = {
    success: true,
    action: 'GET_LEARNING_PLAN_WRITE_CHILD_4H_3_STATUS_V3',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_PLAN_4H3_KEYS.STATUS
      ) ||
      KIDLEARN_V3_LEARNING_PLAN_4H3_STATUS.NOT_RUN,
    gateMode:
      gateMode,
    writeAllowedNow:
      gateMode === KIDLEARN_V3_LEARNING_PLAN_4H3_GATE_MODE.OPEN_DEV_CONTROLLED,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_PLAN_4H3_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_PLAN_4H3_KEYS.LAST_READY_AT
      ) || '',
    lastGateChangeAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_PLAN_4H3_KEYS.LAST_GATE_CHANGE_AT
      ) || '',
    lastSubmitAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_PLAN_4H3_KEYS.LAST_SUBMIT_AT
      ) || '',
    lastResult:
      kidlearnV3_4h3ReadJsonProperty_(
        KIDLEARN_V3_LEARNING_PLAN_4H3_KEYS.LAST_RESULT_JSON
      ),
    lastSubmission:
      kidlearnV3_4h3ReadJsonProperty_(
        KIDLEARN_V3_LEARNING_PLAN_4H3_KEYS.LAST_SUBMISSION_JSON
      ),
    childContextLastResult:
      kidlearnV3_4h3ReadJsonProperty_(
        KIDLEARN_V3_LEARNING_PLAN_4H3_KEYS.CHILD_CONTEXT_LAST_RESULT_JSON
      ),
    nextBundle:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Submit learning plan from UI.
 *
 * Gate closed:
 * - dry-run only, no sheet write.
 *
 * Gate open:
 * - write DATA_DailyGoals
 * - write DATA_Assignments
 */
function kidlearnV3_submitLearningPlanFromUi4H3V3(payload) {
  payload = payload || {};

  kidlearnV3_4h3AssertDev_();

  var gateMode =
    kidlearnV3_4h3GetGateMode_();

  if (
    gateMode !== KIDLEARN_V3_LEARNING_PLAN_4H3_GATE_MODE.OPEN_DEV_CONTROLLED
  ) {
    var dry =
      kidlearnV3_previewLearningPlanDraft4H2V3(payload);

    var dryResult = {
      success: true,
      action: 'SUBMIT_LEARNING_PLAN_FROM_UI_4H_3_DRY_RUN_ONLY_V3',
      phase:
        KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.PHASE,
      gateMode:
        gateMode,
      dryRunOnly:
        true,
      writeAllowedNow:
        false,
      actualSheetWritePerformed:
        false,
      actualDriveWritePerformed:
        false,
      dryRunPreview:
        dry,
      message:
        'Gate đang đóng. Chỉ dry-run, chưa ghi Daily Goal hoặc Assignment.',
      nextBundle:
        KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.NEXT_BUNDLE
    };

    kidlearnV3_4h3SaveSubmission_(dryResult);

    console.log(JSON.stringify(dryResult, null, 2));
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
    return kidlearnV3_4h3WriteLearningPlanControlled_(payload);
  } finally {
    lock.releaseLock();
  }
}


/**
 * Child Home context.
 */
function kidlearnV3_getChildLearningPlanContext4H3V3(options) {
  options = options || {};

  var result =
    kidlearnV3_4h3BuildChildLearningPlanContext_(options);

  result.action =
    'GET_CHILD_LEARNING_PLAN_CONTEXT_4H_3_V3';

  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_LEARNING_PLAN_4H3_KEYS.CHILD_CONTEXT_LAST_RESULT_JSON,
      JSON.stringify({
        success:
          result.success,
        phase:
          result.phase,
        todayKey:
          result.todayKey,
        childId:
          result.child ? result.child.childId : '',
        hasTodayGoal:
          result.childLearningPlan &&
          result.childLearningPlan.todayGoal
            ? true
            : false,
        assignmentCount:
          result.childLearningPlan
            ? result.childLearningPlan.assignments.assignmentCount || 0
            : 0,
        errorCount:
          result.errorCount || 0,
        warningCount:
          result.warningCount || 0,
        at:
          new Date().toISOString()
      })
    );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4H-3 child learning plan context failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready for 4H-4.
 * Yêu cầu gate đóng lại trước khi ready.
 */
function kidlearnV3_markLearningPlanWriteChild4H3ReadyV3() {
  var preview =
    kidlearnV3_previewLearningPlanWriteChild4H3V3();

  if (!preview.success) {
    throw new Error('Preview 4H-3 chưa pass.');
  }

  var gateMode =
    kidlearnV3_4h3GetGateMode_();

  if (
    gateMode !== KIDLEARN_V3_LEARNING_PLAN_4H3_GATE_MODE.CLOSED_DRY_RUN_ONLY
  ) {
    throw new Error(
      'Trước khi mark ready 4H-3, cần đóng gate. Current=' +
      gateMode +
      '. Chạy kidlearnV3_closeLearningPlanWriteGate4H3ConfirmV3.'
    );
  }

  var result = {
    success: true,
    action: 'MARK_LEARNING_PLAN_WRITE_CHILD_4H_3_READY_V3',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_LEARNING_PLAN_4H3_STATUS.READY_FOR_4H_4,
    gateMode:
      gateMode,
    writeName:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.WRITE_NAME,
    childVisibilityName:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.CHILD_VISIBILITY_NAME,
    nextBundle:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    message:
      '4H-3 ready. Có thể qua 4H-4 để QA và khóa Phase 4H.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4h3SaveStatus_(
    result,
    KIDLEARN_V3_LEARNING_PLAN_4H3_STATUS.READY_FOR_4H_4,
    KIDLEARN_V3_LEARNING_PLAN_4H3_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertLearningPlanWriteChild4H3ReadyV3() {
  var status =
    kidlearnV3_getLearningPlanWriteChild4H3StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_LEARNING_PLAN_4H3_STATUS.READY_FOR_4H_4
  ) {
    errors.push(
      '4H-3 chưa READY_FOR_4H_4. Status=' +
      status.status
    );
  }

  if (
    status.gateMode !==
    KIDLEARN_V3_LEARNING_PLAN_4H3_GATE_MODE.CLOSED_DRY_RUN_ONLY
  ) {
    errors.push(
      '4H-3 gate chưa đóng. Current=' +
      status.gateMode
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_LEARNING_PLAN_WRITE_CHILD_4H_3_READY_V3',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.PHASE,
    status:
      status.status,
    gateMode:
      status.gateMode,
    nextBundle:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
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
 * QA batch 4H-3.
 * Không tự mở gate, không tự ghi thật.
 */
function kidlearnV3_runQaBatch4H3V3() {
  var preview =
    kidlearnV3_previewLearningPlanWriteChild4H3V3();

  var childContext =
    kidlearnV3_getChildLearningPlanContext4H3V3({
      childId:
        KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.DEFAULT_CHILD_ID
    });

  var closeGate =
    kidlearnV3_closeLearningPlanWriteGate4H3ConfirmV3();

  var ready =
    kidlearnV3_markLearningPlanWriteChild4H3ReadyV3();

  var assertReady =
    kidlearnV3_assertLearningPlanWriteChild4H3ReadyV3();

  var result = {
    success:
      preview.success === true &&
      childContext.success === true &&
      closeGate.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4H_3_CONTROLLED_WRITE_CHILD_VISIBILITY',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.PHASE,
    status:
      KIDLEARN_V3_LEARNING_PLAN_4H3_STATUS.READY_FOR_4H_4,
    gateMode:
      kidlearnV3_4h3GetGateMode_(),
    nextBundle:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    results: {
      preview:
        preview.success,
      childContext:
        childContext.success,
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
    throw new Error('4H-3 QA batch failed.');
  }

  return result;
}


/**
 * Controlled write implementation.
 */
function kidlearnV3_4h3WriteLearningPlanControlled_(payload) {
  payload = payload || {};

  var errors = [];
  var warnings = [];

  var parentId =
    String(
      payload.parentId ||
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.DEFAULT_PARENT_ID
    ).trim();

  var childId =
    String(
      payload.childId ||
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.DEFAULT_CHILD_ID
    ).trim();

  var dailyGoalMinutes =
    Number(payload.dailyGoalMinutes || 0);

  var prioritySubjectCode =
    String(payload.prioritySubjectCode || '').trim();

  var selectedLessonIds =
    kidlearnV3_4h3NormalizeStringArray_(
      payload.selectedLessonIds || []
    );

  var dryPreview =
    kidlearnV3_4h3BuildDraftPreviewAllowOpenGate4H3P1_({
      parentId:
        parentId,
      childId:
        childId,
      dailyGoalMinutes:
        dailyGoalMinutes,
      prioritySubjectCode:
        prioritySubjectCode,
      selectedLessonIds:
        selectedLessonIds
    });

  if (!dryPreview.success) {
    errors.push(
      'Draft validation 4H-3P1 không pass: ' +
      dryPreview.errors.join(' | ')
    );
  }

  var h2 =
    kidlearnV3_4h3SafeCall_(
      'kidlearnV3_assertLearningPlanUi4H2ReadyV3'
    );

  if (!h2.success) {
    errors.push(
      '4H-2 chưa READY_FOR_4H_3: ' +
      h2.message
    );
  }

  if (errors.length > 0) {
    throw new Error(errors.join(' | '));
  }

  var spreadsheet =
    kidlearnV3_4h3OpenSpreadsheet_();

  var now =
    new Date();

  var todayKey =
    kidlearnV3_4h3TodayKey_();

  var dailyGoalResult =
    kidlearnV3_4h3UpsertDailyGoal_({
      spreadsheet:
        spreadsheet,
      childId:
        childId,
      goalDate:
        todayKey,
      targetMinutes:
        dailyGoalMinutes,
      now:
        now
    });

  var assignmentsResult =
    kidlearnV3_4h3CreateAssignments_({
      spreadsheet:
        spreadsheet,
      childId:
        childId,
      parentId:
        parentId,
      selectedLessonIds:
        selectedLessonIds,
      prioritySubjectCode:
        prioritySubjectCode,
      dueDate:
        todayKey,
      now:
        now
    });

  warnings =
    warnings.concat(dailyGoalResult.warnings || []);

  warnings =
    warnings.concat(assignmentsResult.warnings || []);

  var result = {
    success: true,
    action: 'SUBMIT_LEARNING_PLAN_FROM_UI_4H_3_REAL_WRITE_V3',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.PHASE,
    gateMode:
      KIDLEARN_V3_LEARNING_PLAN_4H3_GATE_MODE.OPEN_DEV_CONTROLLED,
    dryRunOnly:
      false,
    writeAllowedNow:
      true,
    parentId:
      parentId,
    childId:
      childId,
    todayKey:
      todayKey,
    dailyGoalResult:
      dailyGoalResult,
    assignmentsResult:
      assignmentsResult,
    dryRunPreview:
      dryPreview,
    writeSummary: {
      dataDailyGoalsWritePerformed:
        dailyGoalResult.writePerformed === true,
      dataDailyGoalsOperation:
        dailyGoalResult.operation || '',
      dataAssignmentsWritePerformed:
        assignmentsResult.writePerformed === true,
      dataAssignmentsCreatedCount:
        assignmentsResult.createdCount || 0,
      dataAssignmentsSkippedCount:
        assignmentsResult.skippedCount || 0
    },
    prodWriteAllowed:
      false,
    realSheetWriteAllowedNow:
      true,
    realDriveWriteAllowedNow:
      false,
    actualSheetWritePerformed:
      dailyGoalResult.writePerformed === true ||
      assignmentsResult.writePerformed === true,
    actualDriveWritePerformed:
      false,
    errorCount:
      0,
    warningCount:
      kidlearnV3_4h3UniqueArray_(warnings).length,
    errors:
      [],
    warnings:
      kidlearnV3_4h3UniqueArray_(warnings),
    submittedAt:
      now.toISOString()
  };

  kidlearnV3_4h3SaveSubmission_(result);

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Upsert DATA_DailyGoals.
 *
 * PATCH 4H-3P6:
 * - Force canonical targetMinutes column if missing.
 * - Always write targetMinutes to canonical/primary target column.
 * - Verify readback after write.
 * - Do not write status to avoid DAILY_GOAL_STATUS enum error.
 */
function kidlearnV3_4h3UpsertDailyGoal_(params) {
  params =
    params || {};

  var warnings = [];

  var spreadsheet =
    params.spreadsheet;

  var sheet =
    kidlearnV3_4h3GetSheetByExactName_(
      spreadsheet,
      'DATA_DailyGoals'
    );

  if (!sheet) {
    throw new Error('Thiếu sheet DATA_DailyGoals.');
  }

  var targetMinutes =
    Number(params.targetMinutes || 0);

  if (isNaN(targetMinutes) || targetMinutes <= 0) {
    targetMinutes = 20;
    warnings.push(
      '4H-3P6: targetMinutes đầu vào không hợp lệ, tự dùng mặc định 20 phút.'
    );
  }

  /**
   * Important:
   * Chỉ force thêm cột targetMinutes.
   * Không force childId / goalDate để tránh làm lệch việc tìm row cũ
   * nếu sheet đang dùng header tiếng Việt.
   */
  kidlearnV3_4h3EnsureExactHeader4H3P6_(
    sheet,
    'targetMinutes'
  );

  var headers =
    kidlearnV3_4h3ReadHeaders_(sheet);

  var required = [
    ['childId', 'studentId', 'learnerId'],
    ['goalDate', 'date', 'planDate'],
    ['targetMinutes', 'targetMinute', 'minutes']
  ];

  kidlearnV3_4h3AssertRequiredColumns_(
    headers,
    required,
    'DATA_DailyGoals'
  );

  var existingRow =
    kidlearnV3_4h3FindDailyGoalRow_(
      sheet,
      headers,
      params.childId,
      params.goalDate
    );

  var operation =
    existingRow > 0
      ? 'UPDATE_TODAY_GOAL'
      : 'CREATE_TODAY_GOAL';

  var rowIndex =
    existingRow > 0
      ? existingRow
      : sheet.getLastRow() + 1;

  if (existingRow <= 0) {
    sheet.insertRowAfter(Math.max(1, sheet.getLastRow()));
  }

  headers =
    kidlearnV3_4h3ReadHeaders_(sheet);

  var rowValues =
    sheet
      .getRange(rowIndex, 1, 1, sheet.getLastColumn())
      .getValues()[0];

  var goalIdIndex =
    kidlearnV3_4h3FindColumnIndexByAliases_(
      headers,
      ['goalId', 'dailyGoalId', 'id']
    );

  var existingGoalId =
    goalIdIndex >= 0
      ? rowValues[goalIdIndex]
      : '';

  kidlearnV3_4h3SetByAliases_(
    rowValues,
    headers,
    ['goalId', 'dailyGoalId', 'id'],
    existingGoalId ||
    'DG_4H3_' + params.childId + '_' + params.goalDate.replace(/-/g, '')
  );

  kidlearnV3_4h3SetByAliases_(
    rowValues,
    headers,
    ['childId', 'studentId', 'learnerId'],
    params.childId
  );

  kidlearnV3_4h3SetByAliases_(
    rowValues,
    headers,
    ['goalDate', 'date', 'planDate'],
    params.goalDate
  );

  /**
   * PATCH 4H-3P6:
   * Ghi targetMinutes vào cột chuẩn.
   */
  var targetMinutesIndex =
    kidlearnV3_4h3FindColumnIndexByAliases_(
      headers,
      ['targetMinutes', 'targetMinute', 'minutes']
    );

  if (targetMinutesIndex < 0) {
    throw new Error(
      'DATA_DailyGoals vẫn chưa tìm được cột targetMinutes sau 4H-3P6.'
    );
  }

  rowValues[targetMinutesIndex] =
    targetMinutes;

  kidlearnV3_4h3SetByAliases_(
    rowValues,
    headers,
    ['updatedAt', 'lastUpdatedAt'],
    params.now.toISOString()
  );

  /**
   * Không ghi status để tránh enum DAILY_GOAL_STATUS.
   */

  if (operation === 'CREATE_TODAY_GOAL') {
    kidlearnV3_4h3SetByAliases_(
      rowValues,
      headers,
      ['completedMinutes', 'actualMinutes', 'doneMinutes'],
      0
    );

    kidlearnV3_4h3SetByAliases_(
      rowValues,
      headers,
      ['createdAt'],
      params.now.toISOString()
    );
  }

  sheet
    .getRange(rowIndex, 1, 1, sheet.getLastColumn())
    .setValues([rowValues]);

  SpreadsheetApp.flush();

  var readBackRow =
    sheet
      .getRange(rowIndex, 1, 1, sheet.getLastColumn())
      .getValues()[0];

  var readBackTargetMinutes =
    Number(readBackRow[targetMinutesIndex] || 0);

  /**
   * Force direct write nếu readback chưa đúng.
   */
  if (readBackTargetMinutes !== targetMinutes) {
    sheet
      .getRange(rowIndex, targetMinutesIndex + 1)
      .setValue(targetMinutes);

    SpreadsheetApp.flush();

    readBackRow =
      sheet
        .getRange(rowIndex, 1, 1, sheet.getLastColumn())
        .getValues()[0];

    readBackTargetMinutes =
      Number(readBackRow[targetMinutesIndex] || 0);

    warnings.push(
      '4H-3P6: Đã force direct write targetMinutes vì readback lần đầu chưa đúng.'
    );
  }

  if (readBackTargetMinutes !== targetMinutes) {
    throw new Error(
      '4H-3P6 ghi targetMinutes chưa thành công. Expected=' +
      targetMinutes +
      ', actual=' +
      readBackTargetMinutes +
      ', row=' +
      rowIndex +
      ', column=' +
      (targetMinutesIndex + 1)
    );
  }

  warnings.push(
    '4H-3P6: Không ghi status Daily Goal để tránh lỗi enum DAILY_GOAL_STATUS.'
  );

  return {
    success: true,
    operation:
      operation,
    sheetName:
      'DATA_DailyGoals',
    rowIndex:
      rowIndex,
    goalDate:
      params.goalDate,
    targetMinutes:
      targetMinutes,
    targetMinutesColumnNumber:
      targetMinutesIndex + 1,
    targetMinutesHeader:
      headers[targetMinutesIndex],
    readBackTargetMinutes:
      readBackTargetMinutes,
    statusWriteSkipped:
      true,
    statusWriteSkippedReason:
      'PATCH_4H_3P6_AVOID_DAILY_GOAL_STATUS_ENUM_ERROR',
    writePerformed:
      true,
    warnings:
      warnings
  };
}


/**
 * Create DATA_Assignments.
 *
 * PATCH 4H-3P5:
 * - Nếu selectedLessonIds rỗng thì bỏ qua toàn bộ DATA_Assignments.
 * - Không đọc header DATA_Assignments khi không có bài cần giao.
 */
function kidlearnV3_4h3CreateAssignments_(params) {
  params =
    params || {};

  params.selectedLessonIds =
    kidlearnV3_4h3NormalizeStringArray_(
      params.selectedLessonIds || []
    );

  if (params.selectedLessonIds.length === 0) {
    return {
      success: true,
      operation:
        'SKIP_ASSIGNMENT_CREATE_NO_SELECTED_LESSON',
      sheetName:
        'DATA_Assignments',
      writePerformed:
        false,
      createdCount:
        0,
      skippedCount:
        0,
      created:
        [],
      skipped:
        [],
      warnings:
        [
          'Không có selectedLessonIds. 4H-3P5 bỏ qua DATA_Assignments và chỉ ghi/cập nhật Daily Goal.'
        ]
    };
  }

  var spreadsheet =
    params.spreadsheet;

  var sheet =
    kidlearnV3_4h3GetSheetByExactName_(
      spreadsheet,
      'DATA_Assignments'
    );

  if (!sheet) {
    throw new Error('Thiếu sheet DATA_Assignments.');
  }

  var headers =
    kidlearnV3_4h3ReadHeaders_(sheet);

  var required = [
    ['childId', 'studentId', 'learnerId'],
    ['lessonId'],
    ['status']
  ];

  kidlearnV3_4h3AssertRequiredColumns_(
    headers,
    required,
    'DATA_Assignments'
  );

  var lessonMap =
    kidlearnV3_4h3BuildLessonMapFromSheet_(spreadsheet);

  var created = [];
  var skipped = [];
  var warnings = [];

  for (var i = 0; i < params.selectedLessonIds.length; i++) {
    var lessonId =
      params.selectedLessonIds[i];

    if (!lessonId) continue;

    var existing =
      kidlearnV3_4h3FindActiveAssignmentByLesson_(
        sheet,
        headers,
        params.childId,
        lessonId
      );

    if (existing > 0) {
      skipped.push({
        lessonId:
          lessonId,
        reason:
          'ACTIVE_ASSIGNMENT_EXISTS',
        rowIndex:
          existing
      });
      continue;
    }

    var lesson =
      lessonMap[lessonId] || {};

    var rowIndex =
      sheet.getLastRow() + 1;

    sheet.insertRowAfter(Math.max(1, sheet.getLastRow()));

    var rowValues =
      kidlearnV3_4h3BlankRow_(sheet.getLastColumn());

    var assignmentId =
      'ASG_4H3_' +
      params.childId +
      '_' +
      lessonId +
      '_' +
      new Date().getTime();

    kidlearnV3_4h3SetByAliases_(
      rowValues,
      headers,
      ['assignmentId', 'id'],
      assignmentId
    );

    kidlearnV3_4h3SetByAliases_(
      rowValues,
      headers,
      ['childId', 'studentId', 'learnerId'],
      params.childId
    );

    kidlearnV3_4h3SetByAliases_(
      rowValues,
      headers,
      ['lessonId'],
      lessonId
    );

    kidlearnV3_4h3SetByAliases_(
      rowValues,
      headers,
      ['subjectCode', 'subjectId'],
      lesson.subjectCode || params.prioritySubjectCode || ''
    );

    /**
     * Assignment status vẫn dùng ASSIGNED.
     * Nếu sau này DATA_Assignments cũng có enum riêng và báo lỗi,
     * mình sẽ patch riêng theo enum của Assignment.
     */
    kidlearnV3_4h3SetByAliases_(
      rowValues,
      headers,
      ['status'],
      'ASSIGNED'
    );

    kidlearnV3_4h3SetByAliases_(
      rowValues,
      headers,
      ['dueDate', 'planDate', 'assignedDate', 'date'],
      params.dueDate
    );

    kidlearnV3_4h3SetByAliases_(
      rowValues,
      headers,
      ['assignedAt', 'createdAt'],
      params.now.toISOString()
    );

    kidlearnV3_4h3SetByAliases_(
      rowValues,
      headers,
      ['updatedAt', 'lastUpdatedAt'],
      params.now.toISOString()
    );

    kidlearnV3_4h3SetByAliases_(
      rowValues,
      headers,
      ['source', 'assignmentSource'],
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.ASSIGNMENT_SOURCE
    );

    kidlearnV3_4h3SetByAliases_(
      rowValues,
      headers,
      ['createdBy', 'parentId'],
      params.parentId
    );

    sheet
      .getRange(rowIndex, 1, 1, sheet.getLastColumn())
      .setValues([rowValues]);

    created.push({
      assignmentId:
        assignmentId,
      lessonId:
        lessonId,
      lessonTitle:
        lesson.lessonTitle || lessonId,
      subjectCode:
        lesson.subjectCode || params.prioritySubjectCode || '',
      rowIndex:
        rowIndex,
      status:
        'ASSIGNED',
      dueDate:
        params.dueDate
    });
  }

  return {
    success: true,
    operation:
      'CREATE_ASSIGNMENT',
    sheetName:
      'DATA_Assignments',
    writePerformed:
      created.length > 0,
    createdCount:
      created.length,
    skippedCount:
      skipped.length,
    created:
      created,
    skipped:
      skipped,
    warnings:
      warnings
  };
}


/**
 * Child Learning Plan Context.
 */
function kidlearnV3_4h3BuildChildLearningPlanContext_(options) {
  options = options || {};

  var errors = [];
  var warnings = [];

  var childId =
    String(
      options.childId ||
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.DEFAULT_CHILD_ID
    ).trim();

  var todayKey =
    kidlearnV3_4h3TodayKey_();

  var dev =
    kidlearnV3_4h3CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4h3OpenSpreadsheet_();
  } catch (errorOpen) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(errorOpen.message || errorOpen)
    );
  }

  var todayGoal = null;
  var assignments = [];

  if (spreadsheet) {
    todayGoal =
      kidlearnV3_4h3ReadTodayGoalForChild_(
        spreadsheet,
        childId,
        todayKey,
        warnings
      );

    assignments =
      kidlearnV3_4h3ReadActiveAssignmentsForChild_(
        spreadsheet,
        childId,
        todayKey,
        warnings
      );
  }

  var childLearningPlan = {
    title:
      'Kế hoạch học hôm nay',
    subtitle:
      'Bé hoàn thành từng việc theo kế hoạch của phụ huynh',
    todayGoal:
      todayGoal,
    assignments: {
      assignmentCount:
        assignments.length,
      items:
        assignments,
      emptyState: {
        show:
          assignments.length === 0,
        title:
          'Hôm nay chưa có bài được giao',
        message:
          'Khi phụ huynh giao bài, bài học sẽ xuất hiện ở đây.'
      }
    },
    emptyState: {
      show:
        !todayGoal && assignments.length === 0,
      title:
        'Chưa có kế hoạch học hôm nay',
      message:
        'Khi phụ huynh lập kế hoạch, bé sẽ thấy mục tiêu và bài cần học ở đây.'
    }
  };

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_CHILD_LEARNING_PLAN_CONTEXT_4H_3_V3',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.PHASE,
    child:
      {
        childId:
          childId,
        displayName:
          'Bé'
      },
    todayKey:
      todayKey,
    childLearningPlan:
      childLearningPlan,
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
      kidlearnV3_4h3UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4h3UniqueArray_(warnings)
  };
}


/**
 * ================================================================
 * Readiness + UI marker helpers
 * ================================================================
 */

function kidlearnV3_4h3BuildReadiness_() {
  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4h3CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var h2 =
    kidlearnV3_4h3SafeCall_(
      'kidlearnV3_assertLearningPlanUi4H2ReadyV3'
    );

  if (!h2.success) {
    errors.push(
      '4H-2 chưa READY_FOR_4H_3: ' +
      h2.message
    );
  }

  var policy =
    kidlearnV3_4h3SafeCall_(
      'kidlearnV3_getLearningPlanPolicy4H1V3'
    );

  if (!policy.success) {
    errors.push(
      'Không đọc được policy 4H-1: ' +
      policy.message
    );
  }

  var childContext = null;

  try {
    childContext =
      kidlearnV3_getChildLearningPlanContext4H3V3({
        childId:
          KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.DEFAULT_CHILD_ID
      });
  } catch (errorChild) {
    errors.push(
      'Không đọc được child learning plan context: ' +
      String(errorChild.message || errorChild)
    );
  }

  var markers =
    kidlearnV3_4h3InspectUiMarkers_();

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
      'BUILD_LEARNING_PLAN_WRITE_CHILD_READINESS_4H_3_V3',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.PARENT_PHASE,
    gateMode:
      kidlearnV3_4h3GetGateMode_(),
    writeAllowedNow:
      kidlearnV3_4h3GetGateMode_() ===
      KIDLEARN_V3_LEARNING_PLAN_4H3_GATE_MODE.OPEN_DEV_CONTROLLED,
    prerequisite: {
      phase4H2Ready:
        h2.success === true,
      policyReadable:
        policy.success === true,
      childContextReadable:
        childContext && childContext.success === true
    },
    childContext:
      childContext,
    uiMarkers:
      markers,
    nextBundle:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.NEXT_STAGE,
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
      kidlearnV3_4h3UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4h3UniqueArray_(warnings)
  };
}


function kidlearnV3_4h3InspectUiMarkers_() {
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
        .createHtmlOutputFromFile('UI_Product_Client_LearningPlan_WriteChild_4H3')
        .getContent();
  } catch (error2) {
    errors.push(
      'Không đọc được UI_Product_Client_LearningPlan_WriteChild_4H3: ' +
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

  kidlearnV3_4h3CheckMarkers_(
    shell,
    [
      'UI_Product_Client_LearningPlan_WriteChild_4H3'
    ],
    'Shell',
    errors
  );

  kidlearnV3_4h3CheckMarkers_(
    client,
    [
      'KIDLEARN_LEARNING_PLAN_WRITE_CHILD_UI_4H3',
      'patchLearningPlanWriteButton4H3',
      'submitLearningPlanControlledWrite4H3',
      'renderChildLearningPlanHome4H3',
      'kidlearnV3_submitLearningPlanFromUi4H3V3',
      'kidlearnV3_getChildLearningPlanContext4H3V3',
      'kl-learning-plan-write-gate-4h3',
      'kl-child-learning-plan-entry-4h3'
    ],
    'Client 4H-3',
    errors
  );

  kidlearnV3_4h3CheckMarkers_(
    styles,
    [
      '.kl-learning-plan-write-gate-4h3',
      '.kl-learning-plan-realwrite-button-4h3',
      '.kl-learning-plan-write-result-4h3',
      '.kl-child-learning-plan-entry-4h3',
      '.kl-child-learning-plan-assignment-4h3'
    ],
    'CSS',
    errors
  );

  return {
    success:
      errors.length === 0,
    action:
      'INSPECT_LEARNING_PLAN_WRITE_CHILD_UI_MARKERS_4H_3_V3',
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


function kidlearnV3_4h3CheckMarkers_(content, markers, label, errors) {
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
 * Child plan read helpers
 * ================================================================
 */

function kidlearnV3_4h3ReadTodayGoalForChild_(spreadsheet, childId, todayKey, warnings) {
  var sheet =
    kidlearnV3_4h3GetSheetByExactName_(
      spreadsheet,
      'DATA_DailyGoals'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    return null;
  }

  var headers =
    kidlearnV3_4h3ReadHeaders_(sheet);

  var row =
    kidlearnV3_4h3FindDailyGoalRow_(
      sheet,
      headers,
      childId,
      todayKey
    );

  if (row <= 0) return null;

  var values =
    sheet
      .getRange(row, 1, 1, sheet.getLastColumn())
      .getValues()[0];

  return {
    goalId:
      String(kidlearnV3_4h3ReadValueByAliases_(values, headers, ['goalId', 'dailyGoalId', 'id']) || ''),
    childId:
      childId,
    goalDate:
      todayKey,
    targetMinutes:
      kidlearnV3_4h3ToNumber_(
        kidlearnV3_4h3ReadValueByAliases_(values, headers, ['targetMinutes', 'targetMinute', 'minutes'])
      ),
    completedMinutes:
      kidlearnV3_4h3ToNumber_(
        kidlearnV3_4h3ReadValueByAliases_(values, headers, ['completedMinutes', 'actualMinutes', 'doneMinutes'])
      ),
    status:
      String(kidlearnV3_4h3ReadValueByAliases_(values, headers, ['status']) || 'ACTIVE'),
    sourceRow:
      row
  };
}


function kidlearnV3_4h3ReadActiveAssignmentsForChild_(spreadsheet, childId, todayKey, warnings) {
  var sheet =
    kidlearnV3_4h3GetSheetByExactName_(
      spreadsheet,
      'DATA_Assignments'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    return [];
  }

  var headers =
    kidlearnV3_4h3ReadHeaders_(sheet);

  var lessonMap =
    kidlearnV3_4h3BuildLessonMapFromSheet_(spreadsheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  var items = [];

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var itemChildId =
      String(kidlearnV3_4h3ReadValueByAliases_(row, headers, ['childId', 'studentId', 'learnerId']) || '').trim();

    if (childId && itemChildId && itemChildId !== childId) continue;

    var status =
      String(kidlearnV3_4h3ReadValueByAliases_(row, headers, ['status']) || '').trim().toUpperCase();

    var dueDate =
      kidlearnV3_4h3ToDateKey_(
        kidlearnV3_4h3ReadValueByAliases_(row, headers, ['dueDate', 'planDate', 'assignedDate', 'date'])
      );

    var active =
      status === '' ||
      status === 'ASSIGNED' ||
      status === 'OPEN' ||
      status === 'IN_PROGRESS' ||
      status === 'PENDING';

    if (!active) continue;

    if (dueDate && dueDate < todayKey) continue;

    var lessonId =
      String(kidlearnV3_4h3ReadValueByAliases_(row, headers, ['lessonId']) || '').trim();

    var lesson =
      lessonMap[lessonId] || {};

    items.push({
      assignmentId:
        String(kidlearnV3_4h3ReadValueByAliases_(row, headers, ['assignmentId', 'id']) || ''),
      childId:
        itemChildId || childId,
      lessonId:
        lessonId,
      lessonTitle:
        lesson.lessonTitle || lessonId,
      subjectCode:
        String(kidlearnV3_4h3ReadValueByAliases_(row, headers, ['subjectCode', 'subjectId']) || lesson.subjectCode || ''),
      status:
        status || 'ASSIGNED',
      dueDate:
        dueDate,
      assignedAt:
        kidlearnV3_4h3ToIso_(
          kidlearnV3_4h3ReadValueByAliases_(row, headers, ['assignedAt', 'createdAt'])
        ),
      sourceRow:
        i + 2
    });
  }

  return items;
}


function kidlearnV3_4h3FindDailyGoalRow_(sheet, headers, childId, dateKey) {
  if (!sheet || sheet.getLastRow() < 2) return -1;

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var itemChildId =
      String(kidlearnV3_4h3ReadValueByAliases_(row, headers, ['childId', 'studentId', 'learnerId']) || '').trim();

    var itemDate =
      kidlearnV3_4h3ToDateKey_(
        kidlearnV3_4h3ReadValueByAliases_(row, headers, ['goalDate', 'date', 'planDate', 'createdAt'])
      );

    if (itemChildId === childId && itemDate === dateKey) {
      return i + 2;
    }
  }

  return -1;
}


function kidlearnV3_4h3FindActiveAssignmentByLesson_(sheet, headers, childId, lessonId) {
  if (!sheet || sheet.getLastRow() < 2) return -1;

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  var todayKey =
    kidlearnV3_4h3TodayKey_();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var itemChildId =
      String(kidlearnV3_4h3ReadValueByAliases_(row, headers, ['childId', 'studentId', 'learnerId']) || '').trim();

    var itemLessonId =
      String(kidlearnV3_4h3ReadValueByAliases_(row, headers, ['lessonId']) || '').trim();

    if (itemChildId !== childId || itemLessonId !== lessonId) continue;

    var status =
      String(kidlearnV3_4h3ReadValueByAliases_(row, headers, ['status']) || '').trim().toUpperCase();

    var dueDate =
      kidlearnV3_4h3ToDateKey_(
        kidlearnV3_4h3ReadValueByAliases_(row, headers, ['dueDate', 'planDate', 'assignedDate', 'date'])
      );

    var active =
      status === '' ||
      status === 'ASSIGNED' ||
      status === 'OPEN' ||
      status === 'IN_PROGRESS' ||
      status === 'PENDING';

    if (active && (!dueDate || dueDate >= todayKey)) {
      return i + 2;
    }
  }

  return -1;
}


function kidlearnV3_4h3BuildLessonMapFromSheet_(spreadsheet) {
  var map = {};

  var sheet =
    kidlearnV3_4h3GetSheetByExactName_(
      spreadsheet,
      'MST_Lessons'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    return map;
  }

  var headers =
    kidlearnV3_4h3ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var lessonId =
      String(kidlearnV3_4h3ReadValueByAliases_(row, headers, ['lessonId', 'id']) || '').trim();

    if (!lessonId) continue;

    map[lessonId] = {
      lessonId:
        lessonId,
      lessonTitle:
        String(kidlearnV3_4h3ReadValueByAliases_(row, headers, ['lessonTitle', 'title', 'name']) || lessonId),
      subjectCode:
        String(kidlearnV3_4h3ReadValueByAliases_(row, headers, ['subjectCode', 'subjectId']) || '')
    };
  }

  return map;
}


/**
 * ================================================================
 * Required columns + spreadsheet helpers
 * ================================================================
 */

function kidlearnV3_4h3AssertRequiredColumns_(headers, requiredGroups, sheetName) {
  var missing = [];

  for (var i = 0; i < requiredGroups.length; i++) {
    if (
      kidlearnV3_4h3FindColumnIndexByAliases_(
        headers,
        requiredGroups[i]
      ) < 0
    ) {
      missing.push(requiredGroups[i].join('/'));
    }
  }

  if (missing.length > 0) {
    throw new Error(
      sheetName +
      ' thiếu required columns: ' +
      missing.join(', ')
    );
  }
}


function kidlearnV3_4h3OpenSpreadsheet_() {
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


function kidlearnV3_4h3GetSheetByExactName_(spreadsheet, sheetName) {
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


function kidlearnV3_4h3ReadHeaders_(sheet) {
  return sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];
}


function kidlearnV3_4h3BlankRow_(length) {
  var row = [];

  for (var i = 0; i < length; i++) {
    row.push('');
  }

  return row;
}


/**
 * PATCH 4H-3P2
 * Header resolver with Vietnamese alias support.
 */
function kidlearnV3_4h3FindColumnIndexByAliases_(headers, aliases) {
  headers =
    headers || [];

  aliases =
    kidlearnV3_4h3ExpandAliases4H3P2_(aliases || []);

  for (var a = 0; a < aliases.length; a++) {
    var target =
      kidlearnV3_4h3NormalizeHeader_(aliases[a]);

    if (!target) continue;

    for (var j = 0; j < headers.length; j++) {
      var current =
        kidlearnV3_4h3NormalizeHeader_(headers[j]);

      if (current === target) {
        return j;
      }
    }
  }

  return -1;
}


function kidlearnV3_4h3ReadValueByAliases_(row, headers, aliases) {
  var index =
    kidlearnV3_4h3FindColumnIndexByAliases_(
      headers,
      aliases
    );

  if (index < 0) return '';

  return row[index];
}


function kidlearnV3_4h3SetByAliases_(row, headers, aliases, value) {
  var index =
    kidlearnV3_4h3FindColumnIndexByAliases_(
      headers,
      aliases
    );

  if (index >= 0) {
    row[index] = value;
  }
}


/**
 * PATCH 4H-3P2
 * Normalize English/Vietnamese headers.
 */
function kidlearnV3_4h3NormalizeHeader_(value) {
  var text =
    String(value || '')
      .trim()
      .toLowerCase();

  text =
    kidlearnV3_4h3StripVietnameseDiacritics4H3P2_(text);

  return text
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .replace(/-/g, '')
    .replace(/\./g, '')
    .replace(/\//g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '');
}


/**
 * ================================================================
 * PATCH 4H-3P1
 * Allow draft validation while write gate is OPEN_DEV_CONTROLLED.
 * ================================================================
 */

function kidlearnV3_4h3BuildDraftPreviewAllowOpenGate4H3P1_(payload) {
  payload = payload || {};

  var errors = [];
  var warnings = [];

  var parentId =
    String(
      payload.parentId ||
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.DEFAULT_PARENT_ID
    ).trim();

  var childId =
    String(
      payload.childId ||
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.DEFAULT_CHILD_ID
    ).trim();

  var dailyGoalMinutes =
    Number(payload.dailyGoalMinutes || 0);

  var prioritySubjectCode =
    String(payload.prioritySubjectCode || '').trim();

  var selectedLessonIds =
    kidlearnV3_4h3NormalizeStringArray_(
      payload.selectedLessonIds || []
    );

  var context = null;

  try {
    context =
      kidlearnV3_getLearningPlanContext4H1V3({
        parentId:
          parentId,
        childId:
          childId
      });
  } catch (errorContext) {
    errors.push(
      'Không đọc được Learning Plan Context 4H-1: ' +
      String(errorContext.message || errorContext)
    );
  }

  var learningPlanContext =
    context && context.learningPlanContext
      ? context.learningPlanContext
      : {};

  var policy =
    learningPlanContext.policy ||
    (
      context && context.policy
        ? context.policy
        : {}
    );

  var dailyPolicy =
    policy.dailyGoalPolicy || {};

  var minMinutes =
    Number(dailyPolicy.minMinutes || 10);

  var maxMinutes =
    Number(dailyPolicy.maxMinutes || 60);

  var defaultMinutes =
    Number(dailyPolicy.defaultMinutes || 20);

  if (!dailyGoalMinutes || isNaN(dailyGoalMinutes)) {
    dailyGoalMinutes = defaultMinutes;
  }

  if (dailyGoalMinutes < minMinutes) {
    errors.push(
      'dailyGoalMinutes thấp hơn minMinutes. Current=' +
      dailyGoalMinutes +
      ', min=' +
      minMinutes
    );
  }

  if (dailyGoalMinutes > maxMinutes) {
    errors.push(
      'dailyGoalMinutes vượt maxMinutes. Current=' +
      dailyGoalMinutes +
      ', max=' +
      maxMinutes
    );
  }

  var subjectOptions =
    learningPlanContext.subjectOptions || [];

  var subjectMap =
    kidlearnV3_4h3BuildMapByKey4H3P1_(
      subjectOptions,
      'subjectCode'
    );

  if (
    prioritySubjectCode &&
    !subjectMap[prioritySubjectCode]
  ) {
    warnings.push(
      'prioritySubjectCode không nằm trong subjectOptions: ' +
      prioritySubjectCode
    );
  }

  var lessonSuggestions =
    learningPlanContext.lessonSuggestions || {};

  var lessonItems =
    lessonSuggestions.items || [];

  var lessonMap =
    kidlearnV3_4h3BuildMapByKey4H3P1_(
      lessonItems,
      'lessonId'
    );

  var selectedLessons = [];

  for (var i = 0; i < selectedLessonIds.length; i++) {
    var lessonId =
      selectedLessonIds[i];

    if (!lessonMap[lessonId]) {
      warnings.push(
        'Lesson không nằm trong lessonSuggestions: ' +
        lessonId
      );

      selectedLessons.push({
        lessonId:
          lessonId,
        lessonTitle:
          lessonId,
        subjectCode:
          prioritySubjectCode,
        knownSuggestion:
          false
      });

      continue;
    }

    selectedLessons.push({
      lessonId:
        lessonId,
      lessonTitle:
        lessonMap[lessonId].lessonTitle || lessonId,
      subjectCode:
        lessonMap[lessonId].subjectCode || '',
      reason:
        lessonMap[lessonId].reason || '',
      progressPercent:
        lessonMap[lessonId].progressPercent || 0,
      alreadyAssigned:
        lessonMap[lessonId].alreadyAssigned === true,
      knownSuggestion:
        true
    });

    if (lessonMap[lessonId].alreadyAssigned === true) {
      warnings.push(
        'Lesson đã có assignment đang mở: ' +
        lessonId
      );
    }
  }

  if (selectedLessons.length === 0) {
    warnings.push(
      'Chưa chọn lesson nào. 4H-3 sẽ chỉ tạo/cập nhật Daily Goal.'
    );
  }

  var todayKey =
    learningPlanContext.todayKey ||
    (
      context && context.todayKey
        ? context.todayKey
        : kidlearnV3_4h3TodayKey_()
    );

  var dailyGoalOperation =
    learningPlanContext.existingPlan &&
    learningPlanContext.existingPlan.todayGoal
      ? 'UPDATE_TODAY_GOAL'
      : 'CREATE_TODAY_GOAL';

  var assignmentOperations = [];

  for (var j = 0; j < selectedLessons.length; j++) {
    assignmentOperations.push({
      operation:
        'CREATE_ASSIGNMENT',
      lessonId:
        selectedLessons[j].lessonId,
      lessonTitle:
        selectedLessons[j].lessonTitle,
      subjectCode:
        selectedLessons[j].subjectCode,
      statusOnCreate:
        'ASSIGNED',
      dueDate:
        todayKey,
      dryRunOnly:
        false
    });
  }

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_DRAFT_PREVIEW_ALLOW_OPEN_GATE_4H_3P1_V3',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.PARENT_PHASE,
    patch:
      '4H-3P1',
    gateMode:
      kidlearnV3_4h3GetGateMode_(),
    allowOpenGate:
      true,
    dryRunOnly:
      false,
    writeAllowedNow:
      kidlearnV3_4h3GetGateMode_() ===
      KIDLEARN_V3_LEARNING_PLAN_4H3_GATE_MODE.OPEN_DEV_CONTROLLED,
    parentId:
      parentId,
    child:
      learningPlanContext.child ||
      {
        childId:
          childId,
        displayName:
          'Bé'
      },
    todayKey:
      todayKey,
    draftPlan: {
      dailyGoalMinutes:
        dailyGoalMinutes,
      prioritySubjectCode:
        prioritySubjectCode,
      prioritySubjectName:
        subjectMap[prioritySubjectCode]
          ? subjectMap[prioritySubjectCode].subjectName
          : prioritySubjectCode,
      selectedLessonCount:
        selectedLessons.length,
      selectedLessons:
        selectedLessons
    },
    plannedOperations: {
      DATA_DailyGoals: {
        allowed:
          true,
        operation:
          dailyGoalOperation,
        targetMinutes:
          dailyGoalMinutes,
        goalDate:
          todayKey
      },
      DATA_Assignments: {
        allowed:
          true,
        operationCount:
          assignmentOperations.length,
        operations:
          assignmentOperations
      }
    },
    prodWriteAllowed:
      false,
    realSheetWriteAllowedNow:
      kidlearnV3_4h3GetGateMode_() ===
      KIDLEARN_V3_LEARNING_PLAN_4H3_GATE_MODE.OPEN_DEV_CONTROLLED,
    realDriveWriteAllowedNow:
      false,
    actualSheetWritePerformed:
      false,
    actualDriveWritePerformed:
      false,
    errorCount:
      errors.length,
    warningCount:
      kidlearnV3_4h3UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4h3UniqueArray_(warnings)
  };
}


function kidlearnV3_4h3BuildMapByKey4H3P1_(items, key) {
  var map = {};

  items =
    items || [];

  for (var i = 0; i < items.length; i++) {
    var value =
      String(items[i][key] || '').trim();

    if (value) {
      map[value] = items[i];
    }
  }

  return map;
}


/**
 * ================================================================
 * PATCH 4H-3P2
 * Vietnamese aliases for DATA_DailyGoals and DATA_Assignments.
 * ================================================================
 */

function kidlearnV3_4h3ExpandAliases4H3P2_(aliases) {
  aliases =
    aliases || [];

  var dictionary =
    kidlearnV3_4h3AliasDictionary4H3P2_();

  var seen = {};
  var result = [];

  function add(value) {
    value =
      String(value || '').trim();

    if (!value) return;

    var key =
      kidlearnV3_4h3NormalizeHeader_(value);

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
      kidlearnV3_4h3NormalizeHeader_(alias);

    var extra =
      dictionary[normalized] || [];

    for (var j = 0; j < extra.length; j++) {
      add(extra[j]);
    }
  }

  return result;
}


function kidlearnV3_4h3AliasDictionary4H3P2_() {
  var dictionary = {};

  function set(key, values) {
    dictionary[
      kidlearnV3_4h3NormalizeHeader_(key)
    ] = values;
  }

  set('childId', [
    'childId',
    'studentId',
    'learnerId',
    'Mã trẻ',
    'Mã bé',
    'Mã học sinh',
    'Mã người học',
    'Mã learner',
    'Mã child'
  ]);

  set('studentId', dictionary[kidlearnV3_4h3NormalizeHeader_('childId')]);
  set('learnerId', dictionary[kidlearnV3_4h3NormalizeHeader_('childId')]);

  set('goalId', [
    'goalId',
    'dailyGoalId',
    'id',
    'Mã mục tiêu',
    'Mã mục tiêu ngày',
    'Mã daily goal',
    'Mã kế hoạch ngày',
    'Mã goal'
  ]);

  set('dailyGoalId', dictionary[kidlearnV3_4h3NormalizeHeader_('goalId')]);

  set('goalDate', [
    'goalDate',
    'date',
    'planDate',
    'Ngày mục tiêu',
    'Ngày kế hoạch',
    'Ngày học',
    'Ngày',
    'Ngày goal',
    'Ngày daily goal'
  ]);

  set('planDate', dictionary[kidlearnV3_4h3NormalizeHeader_('goalDate')]);
  set('date', dictionary[kidlearnV3_4h3NormalizeHeader_('goalDate')]);

  set('targetMinutes', [
    'targetMinutes',
    'targetMinute',
    'minutes',
    'Số phút mục tiêu',
    'Phút mục tiêu',
    'Mục tiêu phút',
    'Mục tiêu học phút',
    'Thời lượng mục tiêu',
    'Số phút học mục tiêu',
    'Số phút học',
    'Phút học'
  ]);

  set('targetMinute', dictionary[kidlearnV3_4h3NormalizeHeader_('targetMinutes')]);
  set('minutes', dictionary[kidlearnV3_4h3NormalizeHeader_('targetMinutes')]);

  set('completedMinutes', [
    'completedMinutes',
    'actualMinutes',
    'doneMinutes',
    'Số phút hoàn thành',
    'Phút hoàn thành',
    'Số phút đã học',
    'Phút đã học',
    'Thời lượng hoàn thành'
  ]);

  set('actualMinutes', dictionary[kidlearnV3_4h3NormalizeHeader_('completedMinutes')]);
  set('doneMinutes', dictionary[kidlearnV3_4h3NormalizeHeader_('completedMinutes')]);

  set('status', [
    'status',
    'Trạng thái',
    'Tình trạng'
  ]);

  set('createdAt', [
    'createdAt',
    'createdDate',
    'Ngày tạo',
    'Tạo lúc',
    'Thời điểm tạo'
  ]);

  set('updatedAt', [
    'updatedAt',
    'lastUpdatedAt',
    'Ngày cập nhật',
    'Cập nhật lúc',
    'Thời điểm cập nhật'
  ]);

  set('lastUpdatedAt', dictionary[kidlearnV3_4h3NormalizeHeader_('updatedAt')]);

  set('assignmentId', [
    'assignmentId',
    'id',
    'Mã bài giao',
    'Mã assignment',
    'Mã giao bài',
    'Mã nhiệm vụ',
    'Mã phân công'
  ]);

  set('lessonId', [
    'lessonId',
    'Mã bài học',
    'Mã lesson',
    'Mã bài',
    'Mã học liệu'
  ]);

  set('subjectCode', [
    'subjectCode',
    'subjectId',
    'Mã môn học',
    'Mã môn',
    'Môn học',
    'Môn'
  ]);

  set('subjectId', dictionary[kidlearnV3_4h3NormalizeHeader_('subjectCode')]);

  set('dueDate', [
    'dueDate',
    'planDate',
    'assignedDate',
    'date',
    'Ngày hết hạn',
    'Hạn hoàn thành',
    'Ngày cần hoàn thành',
    'Ngày giao',
    'Ngày kế hoạch',
    'Ngày học'
  ]);

  set('assignedDate', dictionary[kidlearnV3_4h3NormalizeHeader_('dueDate')]);

  set('assignedAt', [
    'assignedAt',
    'createdAt',
    'Giao lúc',
    'Ngày giao',
    'Thời điểm giao',
    'Ngày tạo',
    'Tạo lúc'
  ]);

  set('source', [
    'source',
    'assignmentSource',
    'Nguồn',
    'Nguồn giao bài',
    'Nguồn assignment'
  ]);

  set('assignmentSource', dictionary[kidlearnV3_4h3NormalizeHeader_('source')]);

  set('createdBy', [
    'createdBy',
    'parentId',
    'Người tạo',
    'Mã người tạo',
    'Mã phụ huynh',
    'Phụ huynh'
  ]);

  set('parentId', dictionary[kidlearnV3_4h3NormalizeHeader_('createdBy')]);

  set('lessonTitle', [
    'lessonTitle',
    'title',
    'name',
    'Tên bài học',
    'Tên bài',
    'Tiêu đề bài học',
    'Tiêu đề'
  ]);

  return dictionary;
}


function kidlearnV3_4h3StripVietnameseDiacritics4H3P2_(text) {
  text =
    String(text || '');

  try {
    text =
      text.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
  } catch (error) {
    // Some runtimes may not support normalize; fallback below still handles đ.
  }

  return text
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}


/**
 * Optional debug helper: no write.
 */
function kidlearnV3_debugLearningPlanSheetHeaders4H3P2V3() {
  var spreadsheet =
    kidlearnV3_4h3OpenSpreadsheet_();

  var result = {
    success: true,
    action: 'DEBUG_LEARNING_PLAN_SHEET_HEADERS_4H_3P2_V3',
    phase: '4H-3P2',
    DATA_DailyGoals:
      kidlearnV3_4h3DebugSheetHeaderResolution4H3P2_(
        spreadsheet,
        'DATA_DailyGoals',
        [
          {
            field: 'childId',
            aliases: ['childId', 'studentId', 'learnerId']
          },
          {
            field: 'goalDate',
            aliases: ['goalDate', 'date', 'planDate']
          },
          {
            field: 'targetMinutes',
            aliases: ['targetMinutes', 'targetMinute', 'minutes']
          }
        ]
      ),
    DATA_Assignments:
      kidlearnV3_4h3DebugSheetHeaderResolution4H3P2_(
        spreadsheet,
        'DATA_Assignments',
        [
          {
            field: 'childId',
            aliases: ['childId', 'studentId', 'learnerId']
          },
          {
            field: 'lessonId',
            aliases: ['lessonId']
          },
          {
            field: 'status',
            aliases: ['status']
          }
        ]
      ),
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    checkedAt: new Date().toISOString()
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


function kidlearnV3_4h3DebugSheetHeaderResolution4H3P2_(spreadsheet, sheetName, requiredFields) {
  var sheet =
    kidlearnV3_4h3GetSheetByExactName_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return {
      success: false,
      sheetName: sheetName,
      exists: false,
      headers: [],
      resolved: [],
      errors: ['Thiếu sheet ' + sheetName]
    };
  }

  var headers =
    kidlearnV3_4h3ReadHeaders_(sheet);

  var resolved = [];
  var errors = [];

  for (var i = 0; i < requiredFields.length; i++) {
    var field =
      requiredFields[i];

    var index =
      kidlearnV3_4h3FindColumnIndexByAliases_(
        headers,
        field.aliases
      );

    resolved.push({
      field: field.field,
      columnIndex: index,
      columnNumber: index >= 0 ? index + 1 : null,
      headerName: index >= 0 ? headers[index] : '',
      success: index >= 0
    });

    if (index < 0) {
      errors.push(
        sheetName + ' chưa resolve được field ' + field.field
      );
    }
  }

  return {
    success: errors.length === 0,
    sheetName: sheetName,
    exists: true,
    lastRow: sheet.getLastRow(),
    lastColumn: sheet.getLastColumn(),
    headers: headers,
    resolved: resolved,
    errors: errors
  };
}


/**
 * ================================================================
 * Generic helpers
 * ================================================================
 */

function kidlearnV3_4h3WriteGatePropertyKey_() {
  try {
    if (
      typeof KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS !== 'undefined' &&
      KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS &&
      KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS.WRITE_GATE_MODE
    ) {
      return KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS.WRITE_GATE_MODE;
    }
  } catch (error) {
    // ignore
  }

  return 'KIDLEARN_V3_PHASE_4H_LEARNING_PLAN_WRITE_GATE_MODE';
}


function kidlearnV3_4h3NormalizeStringArray_(value) {
  var raw =
    Array.isArray(value)
      ? value
      : String(value || '').split(',');

  var map = {};
  var result = [];

  for (var i = 0; i < raw.length; i++) {
    var item =
      String(raw[i] || '').trim();

    if (!item) continue;

    if (!map[item]) {
      map[item] = true;
      result.push(item);
    }
  }

  return result;
}


function kidlearnV3_4h3TodayKey_() {
  try {
    return Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );
  } catch (error) {
    return new Date().toISOString().substring(0, 10);
  }
}


function kidlearnV3_4h3ToDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    try {
      return Utilities.formatDate(
        value,
        Session.getScriptTimeZone(),
        'yyyy-MM-dd'
      );
    } catch (errorDate) {
      return value.toISOString().substring(0, 10);
    }
  }

  var text =
    String(value || '').trim();

  if (!text) return '';

  if (text.length >= 10 && text.charAt(4) === '-') {
    return text.substring(0, 10);
  }

  var date =
    new Date(text);

  if (isNaN(date.getTime())) {
    return '';
  }

  try {
    return Utilities.formatDate(
      date,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );
  } catch (error) {
    return date.toISOString().substring(0, 10);
  }
}


function kidlearnV3_4h3ToIso_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return value.toISOString();
  }

  var text =
    String(value || '').trim();

  if (!text) return '';

  var date =
    new Date(text);

  if (isNaN(date.getTime())) {
    return text;
  }

  return date.toISOString();
}


function kidlearnV3_4h3ToNumber_(value) {
  var number =
    Number(value || 0);

  return isNaN(number) ? 0 : number;
}


function kidlearnV3_4h3GetGateMode_() {
  var mode =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        kidlearnV3_4h3WriteGatePropertyKey_()
      ) ||
    KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.DEFAULT_GATE_MODE;

  if (
    mode !== KIDLEARN_V3_LEARNING_PLAN_4H3_GATE_MODE.CLOSED_DRY_RUN_ONLY &&
    mode !== KIDLEARN_V3_LEARNING_PLAN_4H3_GATE_MODE.OPEN_DEV_CONTROLLED
  ) {
    return KIDLEARN_V3_LEARNING_PLAN_4H3_GATE_MODE.CLOSED_DRY_RUN_ONLY;
  }

  return mode;
}


function kidlearnV3_4h3AssertDev_() {
  var dev =
    kidlearnV3_4h3CheckDevSafety_();

  if (!dev.success) {
    throw new Error(dev.errors.join(' | '));
  }
}


function kidlearnV3_4h3CheckDevSafety_() {
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
    errors.push(String(errorAssertDev.message || errorAssertDev));
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
      kidlearnV3_4h3UniqueArray_(errors)
  };
}


function kidlearnV3_4h3SafeCall_(functionName) {
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
      nextBundle:
        output && output.nextBundle ? output.nextBundle : '',
      message:
        output && output.success === true
          ? 'OK'
          : kidlearnV3_4h3PreviewValue_(JSON.stringify(output || {}))
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


function kidlearnV3_4h3PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 350) {
    return text.substring(0, 350) + '...';
  }

  return text;
}


function kidlearnV3_4h3UniqueArray_(items) {
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


function kidlearnV3_4h3SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_LEARNING_PLAN_4H3_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_PLAN_4H3_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.PHASE,
      status:
        status,
      gateMode:
        result.gateMode || kidlearnV3_4h3GetGateMode_(),
      nextBundle:
        KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4h3SaveSubmission_(result) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_LEARNING_PLAN_4H3_KEYS.LAST_SUBMIT_AT,
    new Date().toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_LEARNING_PLAN_4H3_KEYS.LAST_SUBMISSION_JSON,
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
      writeAllowedNow:
        result.writeAllowedNow === true,
      writeSummary:
        result.writeSummary || {},
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


function kidlearnV3_4h3ReadJsonProperty_(key) {
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

/**
 * ================================================================
 * PATCH 4H-3P3
 * Auto Repair Required Headers for Learning Plan Write.
 *
 * Purpose:
 * - Add missing required columns to DATA_DailyGoals and DATA_Assignments.
 * - Header/schema repair only.
 * - No Daily Goal data write.
 * - No Assignment data write.
 * - No Drive write.
 * ================================================================
 */

function kidlearnV3_repairLearningPlanRequiredHeaders4H3P3ConfirmV3() {
  return kidlearnV3_repairLearningPlanRequiredHeaders4H3P3V3({
    confirm: 'REPAIR_LEARNING_PLAN_HEADERS_4H3P3'
  });
}


function kidlearnV3_repairLearningPlanRequiredHeaders4H3P3V3(options) {
  options = options || {};

  var confirmText =
    String(options.confirm || '').trim().toUpperCase();

  if (confirmText !== 'REPAIR_LEARNING_PLAN_HEADERS_4H3P3') {
    throw new Error(
      'Thiếu confirm. Cần confirm=REPAIR_LEARNING_PLAN_HEADERS_4H3P3'
    );
  }

  kidlearnV3_4h3AssertDev_();

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
    var spreadsheet =
      kidlearnV3_4h3OpenSpreadsheet_();

    var before =
      kidlearnV3_debugLearningPlanSheetHeaders4H3P2V3();

    var dailyGoalsRepair =
      kidlearnV3_4h3RepairSheetHeaders4H3P3_(
        spreadsheet,
        'DATA_DailyGoals',
        [
          {
            canonical: 'goalId',
            aliases: ['goalId', 'dailyGoalId', 'id']
          },
          {
            canonical: 'childId',
            aliases: ['childId', 'studentId', 'learnerId']
          },
          {
            canonical: 'goalDate',
            aliases: ['goalDate', 'date', 'planDate']
          },
          {
            canonical: 'targetMinutes',
            aliases: ['targetMinutes', 'targetMinute', 'minutes']
          },
          {
            canonical: 'completedMinutes',
            aliases: ['completedMinutes', 'actualMinutes', 'doneMinutes']
          },
          {
            canonical: 'status',
            aliases: ['status']
          },
          {
            canonical: 'createdAt',
            aliases: ['createdAt']
          },
          {
            canonical: 'updatedAt',
            aliases: ['updatedAt', 'lastUpdatedAt']
          }
        ]
      );

    var assignmentsRepair =
      kidlearnV3_4h3RepairSheetHeaders4H3P3_(
        spreadsheet,
        'DATA_Assignments',
        [
          {
            canonical: 'assignmentId',
            aliases: ['assignmentId', 'id']
          },
          {
            canonical: 'childId',
            aliases: ['childId', 'studentId', 'learnerId']
          },
          {
            canonical: 'lessonId',
            aliases: ['lessonId']
          },
          {
            canonical: 'subjectCode',
            aliases: ['subjectCode', 'subjectId']
          },
          {
            canonical: 'status',
            aliases: ['status']
          },
          {
            canonical: 'dueDate',
            aliases: ['dueDate', 'planDate', 'assignedDate', 'date']
          },
          {
            canonical: 'assignedAt',
            aliases: ['assignedAt', 'createdAt']
          },
          {
            canonical: 'updatedAt',
            aliases: ['updatedAt', 'lastUpdatedAt']
          },
          {
            canonical: 'source',
            aliases: ['source', 'assignmentSource']
          },
          {
            canonical: 'createdBy',
            aliases: ['createdBy', 'parentId']
          }
        ]
      );

    var after =
      kidlearnV3_debugLearningPlanSheetHeaders4H3P2V3();

    var result = {
      success:
        after.DATA_DailyGoals &&
        after.DATA_DailyGoals.success === true &&
        after.DATA_Assignments &&
        after.DATA_Assignments.success === true,
      action:
        'REPAIR_LEARNING_PLAN_REQUIRED_HEADERS_4H_3P3_V3',
      phase:
        '4H-3P3',
      parentPhase:
        '4H',
      repairSummary: {
        DATA_DailyGoals:
          dailyGoalsRepair,
        DATA_Assignments:
          assignmentsRepair
      },
      debugBefore:
        before,
      debugAfter:
        after,
      prodWriteAllowed:
        false,
      realSheetWriteAllowedNow:
        false,
      actualSheetWritePerformed:
        true,
      actualLearningDataWritePerformed:
        false,
      actualDriveWritePerformed:
        false,
      message:
        'Đã repair header/cột cần thiết. Không ghi Daily Goal hoặc Assignment.',
      repairedAt:
        new Date().toISOString()
    };

    console.log(JSON.stringify(result, null, 2));

    if (!result.success) {
      throw new Error(
        '4H-3P3 repair xong nhưng debug vẫn chưa pass. Vui lòng gửi debugAfter.headers để kiểm tra.'
      );
    }

    return result;

  } finally {
    lock.releaseLock();
  }
}


function kidlearnV3_4h3RepairSheetHeaders4H3P3_(spreadsheet, sheetName, definitions) {
  var sheet =
    kidlearnV3_4h3GetSheetByExactName_(
      spreadsheet,
      sheetName
    );

  var createdSheet = false;

  if (!sheet) {
    sheet =
      spreadsheet.insertSheet(sheetName);

    createdSheet = true;
  }

  var headers =
    sheet.getLastColumn() > 0
      ? kidlearnV3_4h3ReadHeaders_(sheet)
      : [];

  var existing = [];
  var missing = [];

  for (var i = 0; i < definitions.length; i++) {
    var definition =
      definitions[i];

    var index =
      kidlearnV3_4h3FindColumnIndexByAliases_(
        headers,
        definition.aliases
      );

    if (index >= 0) {
      existing.push({
        canonical:
          definition.canonical,
        columnNumber:
          index + 1,
        headerName:
          headers[index]
      });
    } else {
      missing.push(definition.canonical);
    }
  }

  var added = [];

  if (missing.length > 0) {
    var lastColumn =
      sheet.getLastColumn();

    var startColumn =
      lastColumn > 0
        ? lastColumn + 1
        : 1;

    var neededMaxColumn =
      startColumn + missing.length - 1;

    var maxColumns =
      sheet.getMaxColumns();

    if (neededMaxColumn > maxColumns) {
      sheet.insertColumnsAfter(
        maxColumns,
        neededMaxColumn - maxColumns
      );
    }

    sheet
      .getRange(1, startColumn, 1, missing.length)
      .setValues([missing]);

    for (var j = 0; j < missing.length; j++) {
      added.push({
        canonical:
          missing[j],
        columnNumber:
          startColumn + j,
        headerName:
          missing[j]
      });
    }
  }

  var finalHeaders =
    sheet.getLastColumn() > 0
      ? kidlearnV3_4h3ReadHeaders_(sheet)
      : [];

  return {
    success:
      true,
    sheetName:
      sheetName,
    createdSheet:
      createdSheet,
    existingCount:
      existing.length,
    addedCount:
      added.length,
    existing:
      existing,
    added:
      added,
    finalHeaders:
      finalHeaders,
    actualSheetStructureWritePerformed:
      added.length > 0 || createdSheet === true,
    actualLearningDataWritePerformed:
      false
  };
}

/**
 * ================================================================
 * PATCH 4H-3P4
 * Compact debug for Learning Plan required headers.
 * No learning data write.
 * ================================================================
 */

function kidlearnV3_debugAssignmentsHeadersOnly4H3P4V3() {
  var spreadsheet =
    kidlearnV3_4h3OpenSpreadsheet_();

  var result =
    kidlearnV3_4h3DebugSheetHeaderResolution4H3P2_(
      spreadsheet,
      'DATA_Assignments',
      [
        {
          field: 'childId',
          aliases: ['childId', 'studentId', 'learnerId']
        },
        {
          field: 'lessonId',
          aliases: ['lessonId']
        },
        {
          field: 'status',
          aliases: ['status']
        }
      ]
    );

  var compact = {
    success:
      result.success === true,
    action:
      'DEBUG_ASSIGNMENTS_HEADERS_ONLY_4H_3P4_V3',
    phase:
      '4H-3P4',
    sheetName:
      'DATA_Assignments',
    exists:
      result.exists === true,
    lastRow:
      result.lastRow || 0,
    lastColumn:
      result.lastColumn || 0,
    resolved:
      result.resolved || [],
    errors:
      result.errors || [],
    actualSheetWritePerformed:
      false,
    actualDriveWritePerformed:
      false,
    checkedAt:
      new Date().toISOString()
  };

  console.log(JSON.stringify(compact, null, 2));

  if (!compact.success) {
    throw new Error(
      'DATA_Assignments headers chưa pass: ' +
      compact.errors.join(' | ')
    );
  }

  return compact;
}


function kidlearnV3_debugDailyGoalsHeadersOnly4H3P4V3() {
  var spreadsheet =
    kidlearnV3_4h3OpenSpreadsheet_();

  var result =
    kidlearnV3_4h3DebugSheetHeaderResolution4H3P2_(
      spreadsheet,
      'DATA_DailyGoals',
      [
        {
          field: 'childId',
          aliases: ['childId', 'studentId', 'learnerId']
        },
        {
          field: 'goalDate',
          aliases: ['goalDate', 'date', 'planDate']
        },
        {
          field: 'targetMinutes',
          aliases: ['targetMinutes', 'targetMinute', 'minutes']
        }
      ]
    );

  var compact = {
    success:
      result.success === true,
    action:
      'DEBUG_DAILY_GOALS_HEADERS_ONLY_4H_3P4_V3',
    phase:
      '4H-3P4',
    sheetName:
      'DATA_DailyGoals',
    exists:
      result.exists === true,
    lastRow:
      result.lastRow || 0,
    lastColumn:
      result.lastColumn || 0,
    resolved:
      result.resolved || [],
    errors:
      result.errors || [],
    actualSheetWritePerformed:
      false,
    actualDriveWritePerformed:
      false,
    checkedAt:
      new Date().toISOString()
  };

  console.log(JSON.stringify(compact, null, 2));

  if (!compact.success) {
    throw new Error(
      'DATA_DailyGoals headers chưa pass: ' +
      compact.errors.join(' | ')
    );
  }

  return compact;
}


function kidlearnV3_assertLearningPlanHeadersReady4H3P4V3() {
  var daily =
    kidlearnV3_debugDailyGoalsHeadersOnly4H3P4V3();

  var assignments =
    kidlearnV3_debugAssignmentsHeadersOnly4H3P4V3();

  var result = {
    success:
      daily.success === true &&
      assignments.success === true,
    action:
      'ASSERT_LEARNING_PLAN_HEADERS_READY_4H_3P4_V3',
    phase:
      '4H-3P4',
    DATA_DailyGoals: {
      success:
        daily.success,
      resolved:
        daily.resolved
    },
    DATA_Assignments: {
      success:
        assignments.success,
      resolved:
        assignments.resolved
    },
    actualSheetWritePerformed:
      false,
    actualDriveWritePerformed:
      false,
    checkedAt:
      new Date().toISOString()
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      'Learning Plan headers chưa ready.'
    );
  }

  return result;
}

/**
 * ================================================================
 * PATCH 4H-3P6
 * Force targetMinutes header and debug today Daily Goal.
 * ================================================================
 */

function kidlearnV3_4h3EnsureExactHeader4H3P6_(sheet, headerName) {
  var headers =
    sheet.getLastColumn() > 0
      ? kidlearnV3_4h3ReadHeaders_(sheet)
      : [];

  var exactIndex =
    kidlearnV3_4h3FindExactHeaderIndex4H3P6_(
      headers,
      headerName
    );

  if (exactIndex >= 0) {
    return {
      added:
        false,
      columnNumber:
        exactIndex + 1,
      headerName:
        headers[exactIndex]
    };
  }

  var startColumn =
    sheet.getLastColumn() > 0
      ? sheet.getLastColumn() + 1
      : 1;

  if (startColumn > sheet.getMaxColumns()) {
    sheet.insertColumnsAfter(
      sheet.getMaxColumns(),
      1
    );
  }

  sheet
    .getRange(1, startColumn)
    .setValue(headerName);

  SpreadsheetApp.flush();

  return {
    added:
      true,
    columnNumber:
      startColumn,
    headerName:
      headerName
  };
}


function kidlearnV3_4h3FindExactHeaderIndex4H3P6_(headers, headerName) {
  var target =
    kidlearnV3_4h3NormalizeHeader_(headerName);

  for (var i = 0; i < headers.length; i++) {
    if (
      kidlearnV3_4h3NormalizeHeader_(headers[i]) === target
    ) {
      return i;
    }
  }

  return -1;
}


function kidlearnV3_debugTodayDailyGoalTarget4H3P6V3() {
  var spreadsheet =
    kidlearnV3_4h3OpenSpreadsheet_();

  var sheet =
    kidlearnV3_4h3GetSheetByExactName_(
      spreadsheet,
      'DATA_DailyGoals'
    );

  if (!sheet) {
    throw new Error('Thiếu sheet DATA_DailyGoals.');
  }

  var headers =
    kidlearnV3_4h3ReadHeaders_(sheet);

  var childId =
    KIDLEARN_V3_LEARNING_PLAN_4H3_CONFIG.DEFAULT_CHILD_ID;

  var todayKey =
    kidlearnV3_4h3TodayKey_();

  var rowIndex =
    kidlearnV3_4h3FindDailyGoalRow_(
      sheet,
      headers,
      childId,
      todayKey
    );

  var result = {
    success:
      rowIndex > 0,
    action:
      'DEBUG_TODAY_DAILY_GOAL_TARGET_4H_3P6_V3',
    phase:
      '4H-3P6',
    sheetName:
      'DATA_DailyGoals',
    childId:
      childId,
    todayKey:
      todayKey,
    rowIndex:
      rowIndex,
    resolvedColumns:
      {},
    rowValues:
      {},
    actualSheetWritePerformed:
      false,
    actualDriveWritePerformed:
      false,
    checkedAt:
      new Date().toISOString()
  };

  var fields = [
    {
      key: 'goalId',
      aliases: ['goalId', 'dailyGoalId', 'id']
    },
    {
      key: 'childId',
      aliases: ['childId', 'studentId', 'learnerId']
    },
    {
      key: 'goalDate',
      aliases: ['goalDate', 'date', 'planDate']
    },
    {
      key: 'targetMinutes',
      aliases: ['targetMinutes', 'targetMinute', 'minutes']
    },
    {
      key: 'completedMinutes',
      aliases: ['completedMinutes', 'actualMinutes', 'doneMinutes']
    },
    {
      key: 'status',
      aliases: ['status']
    }
  ];

  for (var i = 0; i < fields.length; i++) {
    var index =
      kidlearnV3_4h3FindColumnIndexByAliases_(
        headers,
        fields[i].aliases
      );

    result.resolvedColumns[fields[i].key] = {
      success:
        index >= 0,
      columnNumber:
        index >= 0 ? index + 1 : null,
      headerName:
        index >= 0 ? headers[index] : ''
    };
  }

  if (rowIndex > 0) {
    var row =
      sheet
        .getRange(rowIndex, 1, 1, sheet.getLastColumn())
        .getValues()[0];

    for (var j = 0; j < fields.length; j++) {
      var col =
        result.resolvedColumns[fields[j].key];

      result.rowValues[fields[j].key] =
        col.success
          ? row[col.columnNumber - 1]
          : '';
    }
  }

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      'Không tìm thấy Daily Goal hôm nay cho childId=' +
      childId +
      ', todayKey=' +
      todayKey
    );
  }

  return result;
}