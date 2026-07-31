/**
 * ================================================================
 * KIDLEARN V3 - ASSIGNMENT LEARNING POLICY + CONTEXT READ-ONLY
 * Step: 4I-1
 * Version: 3.1.0
 * ================================================================
 *
 * Phase 4I:
 * - Học theo kế hoạch được giao / Assignment Learning Flow
 *
 * Purpose:
 * - Read assignment plan created from 4H.
 * - Build child assignment learning context.
 * - Prepare safe policy for 4I-2 UI and 4I-3 controlled write.
 *
 * Safety:
 * - No DATA writes.
 * - No LOG_Audit writes.
 * - No Drive writes.
 * - Only ScriptProperties for technical status/gate default.
 */


var KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4I1_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4I1_LAST_PREVIEW_AT',
  LAST_CHECK_AT: 'KIDLEARN_V3_PHASE_4I1_LAST_CHECK_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4I1_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4I1_LAST_RESULT_JSON',
  POLICY_JSON: 'KIDLEARN_V3_PHASE_4I1_POLICY_JSON',
  WRITE_GATE_MODE: 'KIDLEARN_V3_PHASE_4I_ASSIGNMENT_WRITE_GATE_MODE'
};


var KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  CHECK_PASSED: 'CHECK_PASSED',
  READY_FOR_4I_2: 'READY_FOR_4I_2',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_GATE_MODE = {
  CLOSED_DRY_RUN_ONLY: 'CLOSED_DRY_RUN_ONLY',
  OPEN_DEV_CONTROLLED: 'OPEN_DEV_CONTROLLED'
};


var KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG = {
  PHASE: '4I-1',
  PARENT_PHASE: '4I',
  PREVIOUS_PHASE: '4H',
  NEXT_BUNDLE: '4I-2',
  NEXT_STAGE: 'CHILD_ASSIGNMENT_LEARNING_UI_DRY_RUN',
  CONTEXT_NAME: 'ASSIGNMENT_LEARNING_POLICY_CONTEXT_READ_ONLY',
  DEFAULT_CHILD_ID: 'CHD_V2_CHILD_DEFAULT',
  DEFAULT_PARENT_ID: 'PARENT',
  DEFAULT_RECENT_LIMIT: 20,
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Policy for Assignment Learning Flow.
 */
function kidlearnV3_getAssignmentLearningPolicy4I1V3() {
  kidlearnV3_4i1EnsureDefaultGateMode_();

  var policy = {
    success: true,
    action: 'GET_ASSIGNMENT_LEARNING_POLICY_4I_1_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.PARENT_PHASE,
    policyName:
      'ASSIGNMENT_LEARNING_FLOW_POLICY',
    gateMode:
      kidlearnV3_4i1GetGateMode_(),
    writeGateDefault:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_GATE_MODE.CLOSED_DRY_RUN_ONLY,
    allowedReadSheets: [
      'DATA_Assignments',
      'DATA_DailyGoals',
      'DATA_LessonProgress',
      'DATA_StudySessions',
      'MST_Lessons',
      'MST_Subjects',
      'DATA_Children'
    ],
    allowedWritesFrom4I3: {
      DATA_Assignments: [
        'MARK_ASSIGNMENT_IN_PROGRESS',
        'MARK_ASSIGNMENT_COMPLETED_WHEN_LESSON_PROGRESS_CONFIRMED'
      ]
    },
    forbiddenWrites: {
      DATA_Responses: true,
      DATA_LessonProgressReset: true,
      DATA_DailyGoalsIncrement: true,
      LOG_Audit: true,
      Drive: true,
      PROD: true,
      ScoreOrGradeChange: true,
      AIGrading: true
    },
    assignmentStatusPolicy: {
      activeStatuses: [
        'ASSIGNED',
        'OPEN',
        'PENDING',
        'IN_PROGRESS',
        'STARTED'
      ],
      completedStatuses: [
        'COMPLETED',
        'DONE',
        'FINISHED'
      ],
      startStatusCandidates: [
        'IN_PROGRESS',
        'STARTED',
        'ASSIGNED'
      ],
      completeStatusCandidates: [
        'COMPLETED',
        'DONE',
        'FINISHED'
      ],
      enumSafeMode:
        true,
      note:
        '4I-3 sẽ đọc validation/enum nếu có. Nếu không tìm được giá trị hợp lệ, sẽ không ghi cứng status.'
    },
    routingPolicy: {
      childCanOpenAssignedLesson:
        true,
      routingDryRunIn4I2:
        true,
      realWriteOnlyIn4I3:
        true,
      useExistingLessonPlayer4C:
        true,
      useExistingResponseWrite4D:
        true
    },
    completionPolicy: {
      autoCompleteOnlyWhenLessonProgressConfirmed:
        true,
      noManualForceCompleteWithoutEvidence:
        true,
      evidenceSheets: [
        'DATA_LessonProgress'
      ],
      acceptedEvidence: [
        'progressPercent >= 100',
        'completionPercent >= 100',
        'status in COMPLETED/DONE/FINISHED'
      ]
    },
    prodWriteAllowed:
      false,
    realSheetWriteAllowedNow:
      false,
    realDriveWriteAllowedNow:
      false,
    actualSheetWritePerformed:
      false,
    actualDriveWritePerformed:
      false
  };

  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS.POLICY_JSON,
      JSON.stringify(policy)
    );

  console.log(JSON.stringify(policy, null, 2));
  return policy;
}


/**
 * Main context for Child Assignment Learning.
 */
function kidlearnV3_getAssignmentLearningContext4I1V3(options) {
  options = options || {};

  var result =
    kidlearnV3_4i1BuildContext_(options);

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4I-1 context failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Preview 4I-1.
 */
function kidlearnV3_previewAssignmentLearningPolicyContext4I1V3() {
  var result =
    kidlearnV3_4i1BuildReadiness_();

  result.action =
    'PREVIEW_ASSIGNMENT_LEARNING_POLICY_CONTEXT_4I_1_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_STATUS.PREVIEWED
      : KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_STATUS.FAILED;

  kidlearnV3_4i1SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4I-1 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Check 4I-1.
 */
function kidlearnV3_checkAssignmentLearningPolicyContext4I1V3() {
  var result =
    kidlearnV3_4i1BuildReadiness_();

  result.action =
    'CHECK_ASSIGNMENT_LEARNING_POLICY_CONTEXT_4I_1_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_STATUS.CHECK_PASSED
      : KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_STATUS.FAILED;

  kidlearnV3_4i1SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS.LAST_CHECK_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4I-1 check failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 4I-1 ready.
 */
function kidlearnV3_markAssignmentLearningPolicyContext4I1ReadyV3() {
  var check =
    kidlearnV3_checkAssignmentLearningPolicyContext4I1V3();

  if (!check.success) {
    throw new Error('4I-1 check chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_ASSIGNMENT_LEARNING_POLICY_CONTEXT_4I_1_READY_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_STATUS.READY_FOR_4I_2,
    contextName:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.CONTEXT_NAME,
    gateMode:
      kidlearnV3_4i1GetGateMode_(),
    nextBundle:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.NEXT_STAGE,
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
      '4I-1 ready. Có thể qua 4I-2 để tạo UI học theo bài được giao.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4i1SaveStatus_(
    result,
    KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_STATUS.READY_FOR_4I_2,
    KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getAssignmentLearningPolicyContext4I1StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_ASSIGNMENT_LEARNING_POLICY_CONTEXT_4I_1_STATUS_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS.STATUS
      ) ||
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_STATUS.NOT_RUN,
    gateMode:
      kidlearnV3_4i1GetGateMode_(),
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastCheckAt:
      properties.getProperty(
        KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS.LAST_CHECK_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4i1ReadJsonProperty_(
        KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS.LAST_RESULT_JSON
      ),
    nextBundle:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.NEXT_STAGE,
    prodWriteAllowed:
      false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertAssignmentLearningPolicyContext4I1ReadyV3() {
  var status =
    kidlearnV3_getAssignmentLearningPolicyContext4I1StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_STATUS.READY_FOR_4I_2
  ) {
    errors.push(
      '4I-1 chưa READY_FOR_4I_2. Current=' +
      status.status
    );
  }

  if (
    status.gateMode !==
    KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_GATE_MODE.CLOSED_DRY_RUN_ONLY
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
      'ASSERT_ASSIGNMENT_LEARNING_POLICY_CONTEXT_4I_1_READY_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.PHASE,
    status:
      status.status,
    gateMode:
      status.gateMode,
    nextBundle:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.NEXT_STAGE,
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
 * QA batch 4I-1.
 */
function kidlearnV3_runQaBatch4I1V3() {
  var preview =
    kidlearnV3_previewAssignmentLearningPolicyContext4I1V3();

  var check =
    kidlearnV3_checkAssignmentLearningPolicyContext4I1V3();

  var ready =
    kidlearnV3_markAssignmentLearningPolicyContext4I1ReadyV3();

  var assertReady =
    kidlearnV3_assertAssignmentLearningPolicyContext4I1ReadyV3();

  var result = {
    success:
      preview.success === true &&
      check.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4I_1_ASSIGNMENT_LEARNING_POLICY_CONTEXT',
    phase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.PHASE,
    status:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_STATUS.READY_FOR_4I_2,
    gateMode:
      kidlearnV3_4i1GetGateMode_(),
    nextBundle:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.NEXT_STAGE,
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
      check:
        check.success,
      ready:
        ready.success,
      assertReady:
        assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4I-1 QA batch failed.');
  }

  return result;
}


/**
 * ================================================================
 * Context builder
 * ================================================================
 */

function kidlearnV3_4i1BuildReadiness_() {
  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4i1CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var phase4H =
    kidlearnV3_4i1SafeCall_(
      'kidlearnV3_assertPhase4HClosedLockedV3'
    );

  if (!phase4H.success) {
    errors.push(
      'Phase 4H chưa locked: ' +
      phase4H.message
    );
  }

  var policy =
    null;

  try {
    policy =
      kidlearnV3_getAssignmentLearningPolicy4I1V3();
  } catch (errorPolicy) {
    errors.push(
      'Không tạo được policy 4I-1: ' +
      String(errorPolicy.message || errorPolicy)
    );
  }

  var context =
    null;

  try {
    context =
      kidlearnV3_4i1BuildContext_({
        childId:
          KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.DEFAULT_CHILD_ID,
        parentId:
          KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.DEFAULT_PARENT_ID,
        recentLimit:
          KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.DEFAULT_RECENT_LIMIT
      });
  } catch (errorContext) {
    errors.push(
      'Không build được Assignment Learning Context: ' +
      String(errorContext.message || errorContext)
    );
  }

  if (context && context.warnings) {
    warnings =
      warnings.concat(context.warnings);
  }

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_ASSIGNMENT_LEARNING_READINESS_4I_1_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.PARENT_PHASE,
    contextName:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.CONTEXT_NAME,
    prerequisite: {
      phase4HLocked:
        phase4H.success === true,
      policyBuilt:
        policy && policy.success === true,
      contextBuilt:
        context && context.success === true
    },
    policy:
      policy,
    contextSummary:
      context
        ? context.contextSummary
        : null,
    dataAvailability:
      context
        ? context.dataAvailability
        : null,
    gateMode:
      kidlearnV3_4i1GetGateMode_(),
    nextBundle:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.NEXT_STAGE,
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
      kidlearnV3_4i1UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4i1UniqueArray_(warnings)
  };
}


function kidlearnV3_4i1BuildContext_(options) {
  options = options || {};

  var errors = [];
  var warnings = [];

  kidlearnV3_4i1EnsureDefaultGateMode_();

  var dev =
    kidlearnV3_4i1CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var phase4H =
    kidlearnV3_4i1SafeCall_(
      'kidlearnV3_assertPhase4HClosedLockedV3'
    );

  if (!phase4H.success) {
    errors.push(
      'Phase 4H chưa locked: ' +
      phase4H.message
    );
  }

  var childId =
    String(
      options.childId ||
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.DEFAULT_CHILD_ID
    ).trim();

  var parentId =
    String(
      options.parentId ||
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.DEFAULT_PARENT_ID
    ).trim();

  var recentLimit =
    Number(
      options.recentLimit ||
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.DEFAULT_RECENT_LIMIT
    );

  if (isNaN(recentLimit) || recentLimit <= 0) {
    recentLimit =
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.DEFAULT_RECENT_LIMIT;
  }

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4i1OpenSpreadsheet_();
  } catch (errorOpen) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(errorOpen.message || errorOpen)
    );
  }

  var todayKey =
    kidlearnV3_4i1TodayKey_();

  var child =
    {
      childId:
        childId,
      displayName:
        'Bé'
    };

  var policy =
    kidlearnV3_getAssignmentLearningPolicy4I1V3();

  var dataAvailability =
    {
      DATA_Children: false,
      DATA_Assignments: false,
      DATA_DailyGoals: false,
      DATA_LessonProgress: false,
      DATA_StudySessions: false,
      MST_Lessons: false,
      MST_Subjects: false
    };

  var assignments = [];
  var lessonMap = {};
  var subjectMap = {};
  var progressMap = {};
  var todayGoal = null;
  var recentStudySessions = [];

  if (spreadsheet) {
    child =
      kidlearnV3_4i1ReadChild_(
        spreadsheet,
        childId,
        child,
        dataAvailability,
        warnings
      );

    subjectMap =
      kidlearnV3_4i1ReadSubjectMap_(
        spreadsheet,
        dataAvailability,
        warnings
      );

    lessonMap =
      kidlearnV3_4i1ReadLessonMap_(
        spreadsheet,
        dataAvailability,
        warnings
      );

    progressMap =
      kidlearnV3_4i1ReadLessonProgressMap_(
        spreadsheet,
        childId,
        dataAvailability,
        warnings
      );

    todayGoal =
      kidlearnV3_4i1ReadTodayGoal_(
        spreadsheet,
        childId,
        todayKey,
        dataAvailability,
        warnings
      );

    assignments =
      kidlearnV3_4i1ReadAssignments_(
        spreadsheet,
        childId,
        todayKey,
        lessonMap,
        subjectMap,
        progressMap,
        dataAvailability,
        warnings
      );

    recentStudySessions =
      kidlearnV3_4i1ReadRecentStudySessions_(
        spreadsheet,
        childId,
        recentLimit,
        dataAvailability,
        warnings
      );
  }

  var grouped =
    kidlearnV3_4i1GroupAssignments_(
      assignments
    );

  var cards =
    kidlearnV3_4i1BuildLearningCards_(
      assignments,
      todayKey
    );

  var primaryAssignment =
    kidlearnV3_4i1PickPrimaryAssignment_(
      cards
    );

  var contextSummary = {
    todayKey:
      todayKey,
    assignmentCount:
      assignments.length,
    activeCount:
      grouped.active.length,
    inProgressCount:
      grouped.inProgress.length,
    completedCount:
      grouped.completed.length,
    overdueCount:
      grouped.overdue.length,
    hasPrimaryAssignment:
      primaryAssignment ? true : false,
    todayGoalExists:
      todayGoal ? true : false,
    gateMode:
      kidlearnV3_4i1GetGateMode_()
  };

  var result = {
    success:
      errors.length === 0,
    action:
      'GET_ASSIGNMENT_LEARNING_CONTEXT_4I_1_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.PARENT_PHASE,
    contextName:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.CONTEXT_NAME,
    child:
      child,
    parentId:
      parentId,
    todayKey:
      todayKey,
    policy:
      policy,
    gateMode:
      kidlearnV3_4i1GetGateMode_(),
    todayGoal:
      todayGoal,
    assignmentLearningContext: {
      title:
        'Bài học được giao',
      subtitle:
        'Con học theo kế hoạch phụ huynh đã lập.',
      primaryAssignment:
        primaryAssignment,
      cards:
        cards,
      groups:
        {
          active:
            grouped.active,
          inProgress:
            grouped.inProgress,
          completed:
            grouped.completed,
          overdue:
            grouped.overdue
        },
      emptyState: {
        show:
          cards.length === 0,
        title:
          'Chưa có bài học được giao',
        message:
          'Khi phụ huynh giao bài, bài học sẽ xuất hiện ở đây.'
      },
      recentStudySessions:
        recentStudySessions
    },
    uiPolicy: {
      step:
        '4I-2',
      childCanSeeAssignments:
        true,
      childCanOpenLesson:
        true,
      dryRunRoutingOnly:
        true,
      realAssignmentStatusWrite:
        false,
      realWriteStep:
        '4I-3',
      useExistingLessonPlayer4C:
        true,
      useExistingAnswerWrite4D:
        true
    },
    contextSummary:
      contextSummary,
    dataAvailability:
      dataAvailability,
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
      kidlearnV3_4i1UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4i1UniqueArray_(warnings),
    builtAt:
      new Date().toISOString()
  };

  return result;
}


/**
 * ================================================================
 * Data readers
 * ================================================================
 */

function kidlearnV3_4i1ReadChild_(spreadsheet, childId, fallbackChild, dataAvailability, warnings) {
  var sheet =
    kidlearnV3_4i1GetSheetByExactName_(
      spreadsheet,
      'DATA_Children'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    warnings.push('DATA_Children trống hoặc không tồn tại.');
    return fallbackChild;
  }

  dataAvailability.DATA_Children = true;

  var headers =
    kidlearnV3_4i1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var rowChildId =
      String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['childId', 'id', 'Mã bé', 'Mã trẻ']) || '').trim();

    if (rowChildId === childId) {
      return {
        childId:
          childId,
        displayName:
          String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['displayName', 'childName', 'name', 'Tên bé', 'Họ tên']) || 'Bé'),
        grade:
          String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['grade', 'Lớp']) || ''),
        sourceRow:
          i + 2
      };
    }
  }

  return fallbackChild;
}


function kidlearnV3_4i1ReadSubjectMap_(spreadsheet, dataAvailability, warnings) {
  var map = {};

  var sheet =
    kidlearnV3_4i1GetSheetByExactName_(
      spreadsheet,
      'MST_Subjects'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    warnings.push('MST_Subjects trống hoặc không tồn tại.');
    return map;
  }

  dataAvailability.MST_Subjects = true;

  var headers =
    kidlearnV3_4i1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var subjectCode =
      String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['subjectCode', 'subjectId', 'Mã môn học', 'Mã môn']) || '').trim();

    if (!subjectCode) continue;

    map[subjectCode] = {
      subjectCode:
        subjectCode,
      subjectName:
        String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['subjectName', 'name', 'Tên môn học', 'Môn học']) || subjectCode),
      color:
        String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['color', 'themeColor', 'Màu']) || ''),
      sourceRow:
        i + 2
    };
  }

  return map;
}


function kidlearnV3_4i1ReadLessonMap_(spreadsheet, dataAvailability, warnings) {
  var map = {};

  var sheet =
    kidlearnV3_4i1GetSheetByExactName_(
      spreadsheet,
      'MST_Lessons'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    warnings.push('MST_Lessons trống hoặc không tồn tại.');
    return map;
  }

  dataAvailability.MST_Lessons = true;

  var headers =
    kidlearnV3_4i1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var lessonId =
      String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['lessonId', 'id', 'Mã bài học', 'Mã lesson']) || '').trim();

    if (!lessonId) continue;

    var subjectCode =
      String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['subjectCode', 'subjectId', 'Mã môn học', 'Mã môn']) || '').trim();

    map[lessonId] = {
      lessonId:
        lessonId,
      lessonTitle:
        String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['lessonTitle', 'title', 'name', 'Tên bài học', 'Tên bài']) || lessonId),
      subjectCode:
        subjectCode,
      topicId:
        String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['topicId', 'Mã chủ đề']) || ''),
      estimatedMinutes:
        kidlearnV3_4i1ToNumber_(
          kidlearnV3_4i1ReadValueByAliases_(row, headers, ['estimatedMinutes', 'durationMinutes', 'Số phút dự kiến'])
        ),
      sourceRow:
        i + 2
    };
  }

  return map;
}


function kidlearnV3_4i1ReadLessonProgressMap_(spreadsheet, childId, dataAvailability, warnings) {
  var map = {};

  var sheet =
    kidlearnV3_4i1GetSheetByExactName_(
      spreadsheet,
      'DATA_LessonProgress'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    warnings.push('DATA_LessonProgress trống hoặc không tồn tại.');
    return map;
  }

  dataAvailability.DATA_LessonProgress = true;

  var headers =
    kidlearnV3_4i1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var rowChildId =
      String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['childId', 'studentId', 'learnerId', 'Mã bé']) || '').trim();

    if (rowChildId && rowChildId !== childId) continue;

    var lessonId =
      String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['lessonId', 'Mã bài học']) || '').trim();

    if (!lessonId) continue;

    var progressPercent =
      kidlearnV3_4i1ToNumber_(
        kidlearnV3_4i1ReadValueByAliases_(row, headers, ['progressPercent', 'completionPercent', 'percentComplete', 'Tiến độ'])
      );

    var status =
      String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['status', 'Trạng thái']) || '').trim().toUpperCase();

    map[lessonId] = {
      lessonId:
        lessonId,
      childId:
        rowChildId || childId,
      progressPercent:
        progressPercent,
      status:
        status,
      isCompleted:
        progressPercent >= 100 ||
        kidlearnV3_4i1IsCompletedStatus_(status),
      updatedAt:
        kidlearnV3_4i1ToIso_(
          kidlearnV3_4i1ReadValueByAliases_(row, headers, ['updatedAt', 'lastUpdatedAt', 'Cập nhật lúc'])
        ),
      sourceRow:
        i + 2
    };
  }

  return map;
}


function kidlearnV3_4i1ReadTodayGoal_(spreadsheet, childId, todayKey, dataAvailability, warnings) {
  var sheet =
    kidlearnV3_4i1GetSheetByExactName_(
      spreadsheet,
      'DATA_DailyGoals'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    warnings.push('DATA_DailyGoals trống hoặc không tồn tại.');
    return null;
  }

  dataAvailability.DATA_DailyGoals = true;

  var headers =
    kidlearnV3_4i1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = values.length - 1; i >= 0; i--) {
    var row =
      values[i];

    var rowChildId =
      String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['childId', 'studentId', 'learnerId', 'Mã bé']) || '').trim();

    var goalDate =
      kidlearnV3_4i1ToDateKey_(
        kidlearnV3_4i1ReadValueByAliases_(row, headers, ['goalDate', 'date', 'planDate', 'Ngày mục tiêu', 'Ngày kế hoạch'])
      );

    if (rowChildId === childId && goalDate === todayKey) {
      return {
        goalId:
          String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['goalId', 'dailyGoalId', 'id', 'Mã mục tiêu']) || ''),
        childId:
          childId,
        goalDate:
          goalDate,
        targetMinutes:
          kidlearnV3_4i1ToNumber_(
            kidlearnV3_4i1ReadValueByAliases_(row, headers, ['targetMinutes', 'targetMinute', 'minutes', 'Số phút mục tiêu'])
          ),
        completedMinutes:
          kidlearnV3_4i1ToNumber_(
            kidlearnV3_4i1ReadValueByAliases_(row, headers, ['completedMinutes', 'actualMinutes', 'doneMinutes', 'Số phút hoàn thành'])
          ),
        status:
          String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['status', 'Trạng thái']) || 'ACTIVE'),
        sourceRow:
          i + 2
      };
    }
  }

  return null;
}


function kidlearnV3_4i1ReadAssignments_(spreadsheet, childId, todayKey, lessonMap, subjectMap, progressMap, dataAvailability, warnings) {
  var sheet =
    kidlearnV3_4i1GetSheetByExactName_(
      spreadsheet,
      'DATA_Assignments'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    warnings.push('DATA_Assignments trống hoặc không tồn tại.');
    return [];
  }

  dataAvailability.DATA_Assignments = true;

  var headers =
    kidlearnV3_4i1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  var items = [];

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var rowChildId =
      String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['childId', 'studentId', 'learnerId', 'Mã bé']) || '').trim();

    if (childId && rowChildId && rowChildId !== childId) continue;

    var lessonId =
      String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['lessonId', 'Mã bài học']) || '').trim();

    if (!lessonId) continue;

    var status =
      String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['status', 'Trạng thái']) || '').trim().toUpperCase();

    var dueDate =
      kidlearnV3_4i1ToDateKey_(
        kidlearnV3_4i1ReadValueByAliases_(row, headers, ['dueDate', 'planDate', 'assignedDate', 'date', 'Ngày kế hoạch', 'Hạn hoàn thành'])
      );

    var lesson =
      lessonMap[lessonId] || {};

    var subjectCode =
      String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['subjectCode', 'subjectId', 'Mã môn']) || lesson.subjectCode || '').trim();

    var subject =
      subjectMap[subjectCode] || {};

    var progress =
      progressMap[lessonId] || {
        lessonId:
          lessonId,
        progressPercent:
          0,
        status:
          '',
        isCompleted:
          false
      };

    var completedByProgress =
      progress.isCompleted === true;

    var completedByStatus =
      kidlearnV3_4i1IsCompletedStatus_(status);

    items.push({
      assignmentId:
        String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['assignmentId', 'id', 'Mã bài giao']) || ''),
      childId:
        rowChildId || childId,
      lessonId:
        lessonId,
      lessonTitle:
        lesson.lessonTitle || lessonId,
      subjectCode:
        subjectCode,
      subjectName:
        subject.subjectName || subjectCode,
      status:
        status || 'ASSIGNED',
      dueDate:
        dueDate,
      assignedAt:
        kidlearnV3_4i1ToIso_(
          kidlearnV3_4i1ReadValueByAliases_(row, headers, ['assignedAt', 'createdAt', 'Ngày giao'])
        ),
      startedAt:
        kidlearnV3_4i1ToIso_(
          kidlearnV3_4i1ReadValueByAliases_(row, headers, ['startedAt', 'startAt', 'Bắt đầu lúc'])
        ),
      completedAt:
        kidlearnV3_4i1ToIso_(
          kidlearnV3_4i1ReadValueByAliases_(row, headers, ['completedAt', 'finishedAt', 'Hoàn thành lúc'])
        ),
      source:
        String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['source', 'assignmentSource', 'Nguồn']) || ''),
      lessonProgress:
        progress,
      isActive:
        kidlearnV3_4i1IsActiveStatus_(status),
      isInProgress:
        kidlearnV3_4i1IsInProgressStatus_(status),
      isCompleted:
        completedByStatus || completedByProgress,
      isOverdue:
        dueDate && dueDate < todayKey && !completedByStatus && !completedByProgress,
      sourceRow:
        i + 2
    });
  }

  return kidlearnV3_4i1SortAssignments_(items);
}


function kidlearnV3_4i1ReadRecentStudySessions_(spreadsheet, childId, limit, dataAvailability, warnings) {
  var sheet =
    kidlearnV3_4i1GetSheetByExactName_(
      spreadsheet,
      'DATA_StudySessions'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    warnings.push('DATA_StudySessions trống hoặc không tồn tại.');
    return [];
  }

  dataAvailability.DATA_StudySessions = true;

  var headers =
    kidlearnV3_4i1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  var items = [];

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var rowChildId =
      String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['childId', 'studentId', 'learnerId', 'Mã bé']) || '').trim();

    if (childId && rowChildId && rowChildId !== childId) continue;

    items.push({
      sessionId:
        String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['sessionId', 'id']) || ''),
      childId:
        rowChildId || childId,
      lessonId:
        String(kidlearnV3_4i1ReadValueByAliases_(row, headers, ['lessonId', 'Mã bài học']) || ''),
      startedAt:
        kidlearnV3_4i1ToIso_(
          kidlearnV3_4i1ReadValueByAliases_(row, headers, ['startedAt', 'startTime', 'createdAt'])
        ),
      endedAt:
        kidlearnV3_4i1ToIso_(
          kidlearnV3_4i1ReadValueByAliases_(row, headers, ['endedAt', 'endTime', 'updatedAt'])
        ),
      durationMinutes:
        kidlearnV3_4i1ToNumber_(
          kidlearnV3_4i1ReadValueByAliases_(row, headers, ['durationMinutes', 'minutes'])
        ),
      sourceRow:
        i + 2
    });
  }

  items.sort(function (a, b) {
    return String(b.startedAt || '').localeCompare(String(a.startedAt || ''));
  });

  return items.slice(0, limit);
}


/**
 * ================================================================
 * Assignment helpers
 * ================================================================
 */

function kidlearnV3_4i1GroupAssignments_(assignments) {
  var grouped = {
    active: [],
    inProgress: [],
    completed: [],
    overdue: []
  };

  assignments =
    assignments || [];

  for (var i = 0; i < assignments.length; i++) {
    var item =
      assignments[i];

    if (item.isCompleted) {
      grouped.completed.push(item);
    } else if (item.isOverdue) {
      grouped.overdue.push(item);
    } else if (item.isInProgress) {
      grouped.inProgress.push(item);
    } else if (item.isActive) {
      grouped.active.push(item);
    }
  }

  return grouped;
}


function kidlearnV3_4i1BuildLearningCards_(assignments, todayKey) {
  var cards = [];

  assignments =
    assignments || [];

  for (var i = 0; i < assignments.length; i++) {
    var item =
      assignments[i];

    if (item.isCompleted) {
      cards.push(
        kidlearnV3_4i1BuildCard_(item, 'COMPLETED')
      );
    } else if (item.isOverdue) {
      cards.push(
        kidlearnV3_4i1BuildCard_(item, 'OVERDUE')
      );
    } else if (item.isInProgress) {
      cards.push(
        kidlearnV3_4i1BuildCard_(item, 'RESUME')
      );
    } else if (item.isActive) {
      cards.push(
        kidlearnV3_4i1BuildCard_(item, 'START')
      );
    }
  }

  return cards;
}


function kidlearnV3_4i1BuildCard_(assignment, mode) {
  var progress =
    assignment.lessonProgress || {};

  return {
    assignmentId:
      assignment.assignmentId,
    lessonId:
      assignment.lessonId,
    lessonTitle:
      assignment.lessonTitle,
    subjectCode:
      assignment.subjectCode,
    subjectName:
      assignment.subjectName,
    status:
      assignment.status,
    dueDate:
      assignment.dueDate,
    mode:
      mode,
    progressPercent:
      progress.progressPercent || 0,
    progressStatus:
      progress.status || '',
    isCompleted:
      assignment.isCompleted === true,
    canOpenLesson:
      mode === 'START' || mode === 'RESUME' || mode === 'OVERDUE',
    canStart:
      mode === 'START' || mode === 'OVERDUE',
    canResume:
      mode === 'RESUME',
    canMarkCompleteIn4I3:
      progress.isCompleted === true,
    actionLabel:
      mode === 'COMPLETED'
        ? 'Đã hoàn thành'
        : (
          mode === 'RESUME'
            ? 'Học tiếp'
            : 'Bắt đầu học'
        ),
    readOnly:
      true,
    writeStep:
      '4I-3',
    sourceRow:
      assignment.sourceRow
  };
}


function kidlearnV3_4i1PickPrimaryAssignment_(cards) {
  cards =
    cards || [];

  for (var i = 0; i < cards.length; i++) {
    if (cards[i].mode === 'RESUME') {
      return cards[i];
    }
  }

  for (var j = 0; j < cards.length; j++) {
    if (cards[j].mode === 'START') {
      return cards[j];
    }
  }

  for (var k = 0; k < cards.length; k++) {
    if (cards[k].mode === 'OVERDUE') {
      return cards[k];
    }
  }

  return cards.length ? cards[0] : null;
}


function kidlearnV3_4i1SortAssignments_(items) {
  items =
    items || [];

  items.sort(function (a, b) {
    var scoreA =
      kidlearnV3_4i1AssignmentSortScore_(a);

    var scoreB =
      kidlearnV3_4i1AssignmentSortScore_(b);

    if (scoreA !== scoreB) {
      return scoreA - scoreB;
    }

    return String(a.dueDate || '').localeCompare(String(b.dueDate || ''));
  });

  return items;
}


function kidlearnV3_4i1AssignmentSortScore_(item) {
  if (item.isInProgress) return 1;
  if (item.isActive && !item.isOverdue) return 2;
  if (item.isOverdue) return 3;
  if (item.isCompleted) return 4;
  return 9;
}


function kidlearnV3_4i1IsActiveStatus_(status) {
  status =
    String(status || '').trim().toUpperCase();

  return (
    status === '' ||
    status === 'ASSIGNED' ||
    status === 'OPEN' ||
    status === 'PENDING' ||
    status === 'IN_PROGRESS' ||
    status === 'STARTED'
  );
}


function kidlearnV3_4i1IsInProgressStatus_(status) {
  status =
    String(status || '').trim().toUpperCase();

  return (
    status === 'IN_PROGRESS' ||
    status === 'STARTED'
  );
}


function kidlearnV3_4i1IsCompletedStatus_(status) {
  status =
    String(status || '').trim().toUpperCase();

  return (
    status === 'COMPLETED' ||
    status === 'DONE' ||
    status === 'FINISHED'
  );
}


/**
 * ================================================================
 * Spreadsheet helpers
 * ================================================================
 */

function kidlearnV3_4i1OpenSpreadsheet_() {
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


function kidlearnV3_4i1GetSheetByExactName_(spreadsheet, sheetName) {
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


function kidlearnV3_4i1ReadHeaders_(sheet) {
  return sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];
}


function kidlearnV3_4i1ReadValueByAliases_(row, headers, aliases) {
  var index =
    kidlearnV3_4i1FindColumnIndexByAliases_(
      headers,
      aliases
    );

  if (index < 0) return '';

  return row[index];
}


function kidlearnV3_4i1FindColumnIndexByAliases_(headers, aliases) {
  headers =
    headers || [];

  aliases =
    aliases || [];

  var expanded =
    kidlearnV3_4i1ExpandAliases_(
      aliases
    );

  for (var i = 0; i < expanded.length; i++) {
    var target =
      kidlearnV3_4i1NormalizeHeader_(
        expanded[i]
      );

    if (!target) continue;

    for (var j = 0; j < headers.length; j++) {
      var current =
        kidlearnV3_4i1NormalizeHeader_(
          headers[j]
        );

      if (current === target) {
        return j;
      }
    }
  }

  return -1;
}


function kidlearnV3_4i1ExpandAliases_(aliases) {
  var dictionary =
    kidlearnV3_4i1AliasDictionary_();

  var seen = {};
  var result = [];

  function add(value) {
    value =
      String(value || '').trim();

    if (!value) return;

    var key =
      kidlearnV3_4i1NormalizeHeader_(
        value
      );

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
      kidlearnV3_4i1NormalizeHeader_(alias);

    var extra =
      dictionary[normalized] || [];

    for (var j = 0; j < extra.length; j++) {
      add(extra[j]);
    }
  }

  return result;
}


function kidlearnV3_4i1AliasDictionary_() {
  var dictionary = {};

  function set(key, values) {
    dictionary[
      kidlearnV3_4i1NormalizeHeader_(key)
    ] = values;
  }

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

  set('studentId', dictionary[kidlearnV3_4i1NormalizeHeader_('childId')]);
  set('learnerId', dictionary[kidlearnV3_4i1NormalizeHeader_('childId')]);

  set('assignmentId', [
    'assignmentId',
    'id',
    'Mã bài giao',
    'Mã assignment',
    'Mã giao bài',
    'Mã nhiệm vụ'
  ]);

  set('lessonId', [
    'lessonId',
    'Mã bài học',
    'Mã lesson',
    'Mã bài'
  ]);

  set('lessonTitle', [
    'lessonTitle',
    'title',
    'name',
    'Tên bài học',
    'Tên bài',
    'Tiêu đề bài học'
  ]);

  set('subjectCode', [
    'subjectCode',
    'subjectId',
    'Mã môn học',
    'Mã môn',
    'Môn học',
    'Môn'
  ]);

  set('subjectId', dictionary[kidlearnV3_4i1NormalizeHeader_('subjectCode')]);

  set('subjectName', [
    'subjectName',
    'name',
    'Tên môn học',
    'Tên môn',
    'Môn học'
  ]);

  set('status', [
    'status',
    'Trạng thái',
    'Tình trạng'
  ]);

  set('dueDate', [
    'dueDate',
    'planDate',
    'assignedDate',
    'date',
    'Ngày kế hoạch',
    'Ngày học',
    'Hạn hoàn thành',
    'Ngày cần hoàn thành',
    'Ngày giao'
  ]);

  set('assignedAt', [
    'assignedAt',
    'createdAt',
    'Ngày giao',
    'Giao lúc',
    'Tạo lúc',
    'Ngày tạo'
  ]);

  set('startedAt', [
    'startedAt',
    'startAt',
    'Bắt đầu lúc',
    'Ngày bắt đầu'
  ]);

  set('completedAt', [
    'completedAt',
    'finishedAt',
    'Hoàn thành lúc',
    'Ngày hoàn thành'
  ]);

  set('source', [
    'source',
    'assignmentSource',
    'Nguồn',
    'Nguồn giao bài'
  ]);

  set('goalId', [
    'goalId',
    'dailyGoalId',
    'id',
    'Mã mục tiêu'
  ]);

  set('goalDate', [
    'goalDate',
    'date',
    'planDate',
    'Ngày mục tiêu',
    'Ngày kế hoạch',
    'Ngày học'
  ]);

  set('targetMinutes', [
    'targetMinutes',
    'targetMinute',
    'minutes',
    'Số phút mục tiêu',
    'Phút mục tiêu',
    'Thời lượng mục tiêu'
  ]);

  set('completedMinutes', [
    'completedMinutes',
    'actualMinutes',
    'doneMinutes',
    'Số phút hoàn thành',
    'Phút hoàn thành',
    'Số phút đã học'
  ]);

  set('progressPercent', [
    'progressPercent',
    'completionPercent',
    'percentComplete',
    'Tiến độ',
    'Tỷ lệ hoàn thành'
  ]);

  set('updatedAt', [
    'updatedAt',
    'lastUpdatedAt',
    'Cập nhật lúc',
    'Ngày cập nhật'
  ]);

  set('createdAt', [
    'createdAt',
    'Ngày tạo',
    'Tạo lúc'
  ]);

  return dictionary;
}


function kidlearnV3_4i1NormalizeHeader_(value) {
  var text =
    String(value || '')
      .trim()
      .toLowerCase();

  text =
    kidlearnV3_4i1StripVietnameseDiacritics_(
      text
    );

  return text
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .replace(/-/g, '')
    .replace(/\./g, '')
    .replace(/\//g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '');
}


function kidlearnV3_4i1StripVietnameseDiacritics_(text) {
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

function kidlearnV3_4i1EnsureDefaultGateMode_() {
  var properties =
    PropertiesService.getScriptProperties();

  var current =
    properties.getProperty(
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS.WRITE_GATE_MODE
    );

  if (!current) {
    properties.setProperty(
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS.WRITE_GATE_MODE,
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_GATE_MODE.CLOSED_DRY_RUN_ONLY
    );
  }
}


function kidlearnV3_4i1GetGateMode_() {
  var mode =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS.WRITE_GATE_MODE
      ) ||
    KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_GATE_MODE.CLOSED_DRY_RUN_ONLY;

  if (
    mode !== KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_GATE_MODE.CLOSED_DRY_RUN_ONLY &&
    mode !== KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_GATE_MODE.OPEN_DEV_CONTROLLED
  ) {
    return KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_GATE_MODE.CLOSED_DRY_RUN_ONLY;
  }

  return mode;
}


function kidlearnV3_4i1CheckDevSafety_() {
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
      kidlearnV3_4i1UniqueArray_(errors)
  };
}


function kidlearnV3_4i1SafeCall_(functionName, args) {
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
      nextPhase:
        output && output.nextPhase ? output.nextPhase : '',
      message:
        output && output.success === true
          ? 'OK'
          : kidlearnV3_4i1PreviewValue_(JSON.stringify(output || {})),
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


function kidlearnV3_4i1ToNumber_(value) {
  var number =
    Number(value || 0);

  return isNaN(number) ? 0 : number;
}


function kidlearnV3_4i1TodayKey_() {
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


function kidlearnV3_4i1ToDateKey_(value) {
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


function kidlearnV3_4i1ToIso_(value) {
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


function kidlearnV3_4i1PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 450) {
    return text.substring(0, 450) + '...';
  }

  return text;
}


function kidlearnV3_4i1UniqueArray_(items) {
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


function kidlearnV3_4i1SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.PHASE,
      parentPhase:
        KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.PARENT_PHASE,
      status:
        status,
      contextName:
        KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.CONTEXT_NAME,
      gateMode:
        kidlearnV3_4i1GetGateMode_(),
      nextBundle:
        KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_CONFIG.NEXT_STAGE,
      contextSummary:
        result.contextSummary || null,
      dataAvailability:
        result.dataAvailability || null,
      prodWriteAllowed:
        false,
      realSheetWriteAllowedNow:
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


function kidlearnV3_4i1ReadJsonProperty_(key) {
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