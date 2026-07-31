/**
 * ================================================================
 * KIDLEARN V3 - LEARNING PLAN POLICY + CONTEXT READ-ONLY
 * Step: 4H-1
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Define safety policy for Parent Controls + Learning Plan.
 * - Build read-only context for Parent Learning Plan UI.
 * - Prepare data for:
 *   + Daily Goal suggestion
 *   + Subject priority suggestion
 *   + Lesson assignment suggestion
 *
 * Safety:
 * - Không ghi DATA_DailyGoals.
 * - Không ghi DATA_Assignments.
 * - Không ghi DATA_LessonProgress.
 * - Không ghi DATA_Responses.
 * - Không ghi LOG_Audit.
 * - Không ghi Google Drive.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4H-1.
 */


var KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4H1_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4H1_LAST_PREVIEW_AT',
  LAST_CHECK_AT: 'KIDLEARN_V3_PHASE_4H1_LAST_CHECK_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4H1_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4H1_LAST_RESULT_JSON',
  POLICY_JSON: 'KIDLEARN_V3_PHASE_4H1_POLICY_JSON',
  WRITE_GATE_MODE: 'KIDLEARN_V3_PHASE_4H_LEARNING_PLAN_WRITE_GATE_MODE'
};


var KIDLEARN_V3_LEARNING_PLAN_4H1_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  CHECK_PASSED: 'CHECK_PASSED',
  READY_FOR_4H_2: 'READY_FOR_4H_2',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_LEARNING_PLAN_4H1_GATE_MODE = {
  CLOSED_DRY_RUN_ONLY: 'CLOSED_DRY_RUN_ONLY',
  OPEN_DEV_CONTROLLED: 'OPEN_DEV_CONTROLLED'
};


var KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG = {
  PHASE: '4H-1',
  PARENT_PHASE: '4H',
  PREVIOUS_PHASE: '4G',
  NEXT_BUNDLE: '4H-2',
  NEXT_STAGE: 'PARENT_LEARNING_PLAN_UI_DRY_RUN',
  CONTEXT_NAME: 'LEARNING_PLAN_POLICY_CONTEXT_READ_ONLY',
  DEFAULT_PARENT_ID: 'PARENT',
  DEFAULT_CHILD_ID: 'CHD_V2_CHILD_DEFAULT',
  DEFAULT_DAILY_GOAL_MINUTES: 20,
  MIN_DAILY_GOAL_MINUTES: 10,
  MAX_DAILY_GOAL_MINUTES: 60,
  MAX_LESSON_SUGGESTIONS: 24,
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Public: get policy only.
 */
function kidlearnV3_getLearningPlanPolicy4H1V3() {
  var policy =
    kidlearnV3_4h1BuildPolicy_();

  console.log(JSON.stringify(policy, null, 2));
  return policy;
}


/**
 * Public: get learning plan context for UI.
 *
 * options:
 * {
 *   parentId: 'PARENT',
 *   childId: 'CHD_V2_CHILD_DEFAULT'
 * }
 */
function kidlearnV3_getLearningPlanContext4H1V3(options) {
  var result =
    kidlearnV3_4h1BuildLearningPlanContext_(options || {});

  result.action =
    'GET_LEARNING_PLAN_CONTEXT_4H_1_V3';

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4H-1 learning plan context failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Preview 4H-1.
 */
function kidlearnV3_previewLearningPlanPolicyContext4H1V3() {
  var result =
    kidlearnV3_4h1BuildLearningPlanContext_({});

  result.action =
    'PREVIEW_LEARNING_PLAN_POLICY_CONTEXT_4H_1_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_LEARNING_PLAN_4H1_STATUS.PREVIEWED
      : KIDLEARN_V3_LEARNING_PLAN_4H1_STATUS.FAILED;

  kidlearnV3_4h1SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS.LAST_PREVIEW_AT
  );

  kidlearnV3_4h1SavePolicy_(result.policy);

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4H-1 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Check 4H-1.
 */
function kidlearnV3_checkLearningPlanPolicyContext4H1V3() {
  var result =
    kidlearnV3_4h1BuildLearningPlanContext_({});

  result.action =
    'CHECK_LEARNING_PLAN_POLICY_CONTEXT_4H_1_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_LEARNING_PLAN_4H1_STATUS.CHECK_PASSED
      : KIDLEARN_V3_LEARNING_PLAN_4H1_STATUS.FAILED;

  kidlearnV3_4h1SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS.LAST_CHECK_AT
  );

  kidlearnV3_4h1SavePolicy_(result.policy);

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4H-1 check failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready for 4H-2.
 */
function kidlearnV3_markLearningPlanPolicyContext4H1ReadyV3() {
  var check =
    kidlearnV3_checkLearningPlanPolicyContext4H1V3();

  if (!check.success) {
    throw new Error('4H-1 check chưa pass.');
  }

  kidlearnV3_4h1EnsureDefaultGateMode_();

  var result = {
    success: true,
    action: 'MARK_LEARNING_PLAN_POLICY_CONTEXT_4H_1_READY_V3',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_LEARNING_PLAN_4H1_STATUS.READY_FOR_4H_2,
    contextName:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.CONTEXT_NAME,
    gateMode:
      kidlearnV3_4h1GetCurrentGateMode_(),
    childId:
      check.child ? check.child.childId : '',
    planSummary:
      check.planSummary || {},
    nextBundle:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    message:
      '4H-1 ready. Có thể qua 4H-2 để tạo Parent Learning Plan UI dry-run.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4h1SaveStatus_(
    result,
    KIDLEARN_V3_LEARNING_PLAN_4H1_STATUS.READY_FOR_4H_2,
    KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get 4H-1 status.
 */
function kidlearnV3_getLearningPlanPolicyContext4H1StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_LEARNING_PLAN_POLICY_CONTEXT_4H_1_STATUS_V3',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS.STATUS
      ) ||
      KIDLEARN_V3_LEARNING_PLAN_4H1_STATUS.NOT_RUN,
    gateMode:
      kidlearnV3_4h1GetCurrentGateMode_(),
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastCheckAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS.LAST_CHECK_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4h1ReadJsonProperty_(
        KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS.LAST_RESULT_JSON
      ),
    policy:
      kidlearnV3_4h1ReadJsonProperty_(
        KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS.POLICY_JSON
      ),
    nextBundle:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertLearningPlanPolicyContext4H1ReadyV3() {
  var status =
    kidlearnV3_getLearningPlanPolicyContext4H1StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_LEARNING_PLAN_4H1_STATUS.READY_FOR_4H_2
  ) {
    errors.push(
      '4H-1 chưa READY_FOR_4H_2. Status=' +
      status.status
    );
  }

  if (
    status.gateMode !==
    KIDLEARN_V3_LEARNING_PLAN_4H1_GATE_MODE.CLOSED_DRY_RUN_ONLY
  ) {
    errors.push(
      '4H learning plan gate không ở CLOSED_DRY_RUN_ONLY. Current=' +
      status.gateMode
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_LEARNING_PLAN_POLICY_CONTEXT_4H_1_READY_V3',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.PHASE,
    status:
      status.status,
    gateMode:
      status.gateMode,
    nextBundle:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.NEXT_STAGE,
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
 * QA batch 4H-1.
 */
function kidlearnV3_runQaBatch4H1V3() {
  var preview =
    kidlearnV3_previewLearningPlanPolicyContext4H1V3();

  var check =
    kidlearnV3_checkLearningPlanPolicyContext4H1V3();

  var ready =
    kidlearnV3_markLearningPlanPolicyContext4H1ReadyV3();

  var assertReady =
    kidlearnV3_assertLearningPlanPolicyContext4H1ReadyV3();

  var result = {
    success:
      preview.success === true &&
      check.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4H_1_LEARNING_PLAN_POLICY_CONTEXT_READ_ONLY',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.PHASE,
    status:
      KIDLEARN_V3_LEARNING_PLAN_4H1_STATUS.READY_FOR_4H_2,
    gateMode:
      kidlearnV3_4h1GetCurrentGateMode_(),
    nextBundle:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
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
    throw new Error('4H-1 QA batch failed.');
  }

  return result;
}


/**
 * Build Policy.
 */
function kidlearnV3_4h1BuildPolicy_() {
  return {
    success: true,
    action: 'BUILD_LEARNING_PLAN_POLICY_4H_1_V3',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.PARENT_PHASE,
    policyName:
      'PARENT_CONTROLS_LEARNING_PLAN_POLICY',
    gateMode:
      kidlearnV3_4h1GetCurrentGateMode_(),
    defaultGateMode:
      KIDLEARN_V3_LEARNING_PLAN_4H1_GATE_MODE.CLOSED_DRY_RUN_ONLY,
    gateModes: [
      KIDLEARN_V3_LEARNING_PLAN_4H1_GATE_MODE.CLOSED_DRY_RUN_ONLY,
      KIDLEARN_V3_LEARNING_PLAN_4H1_GATE_MODE.OPEN_DEV_CONTROLLED
    ],
    allowedWritesFrom4H3: {
      DATA_DailyGoals: {
        allowed: true,
        operations: [
          'CREATE_TODAY_GOAL',
          'UPDATE_TODAY_GOAL'
        ]
      },
      DATA_Assignments: {
        allowed: true,
        operations: [
          'CREATE_ASSIGNMENT'
        ]
      }
    },
    forbiddenWritesIn4H: {
      DATA_Responses: true,
      DATA_LessonProgressReset: true,
      DATA_StudySessions: true,
      LOG_AuditIn4H1: true,
      GoogleDrive: true,
      PROD: true,
      deleteAssignments: true,
      autoAssignByAI: true,
      gradingOrScoreChange: true
    },
    currentStepWritePolicy: {
      step:
        '4H-1',
      readOnlyNow:
        true,
      realSheetWriteAllowedNow:
        false,
      realDriveWriteAllowedNow:
        false,
      actualSheetWritePerformed:
        false,
      actualDriveWritePerformed:
        false
    },
    dailyGoalPolicy: {
      minMinutes:
        KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.MIN_DAILY_GOAL_MINUTES,
      maxMinutes:
        KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.MAX_DAILY_GOAL_MINUTES,
      defaultMinutes:
        KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.DEFAULT_DAILY_GOAL_MINUTES,
      allowedPresetMinutes: [
        10,
        20,
        30,
        45,
        60
      ]
    },
    assignmentPolicy: {
      createOnlyInMvp:
        true,
      noDeleteInMvp:
        true,
      noResetProgress:
        true,
      assignmentStatusOnCreate:
        'ASSIGNED',
      assignmentSource:
        'PARENT_LEARNING_PLAN_4H'
    },
    nextBundle:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.NEXT_STAGE,
    prodWriteAllowed:
      false
  };
}


/**
 * Build Learning Plan Context.
 */
function kidlearnV3_4h1BuildLearningPlanContext_(options) {
  options = options || {};

  var errors = [];
  var warnings = [];

  var parentId =
    String(
      options.parentId ||
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.DEFAULT_PARENT_ID
    ).trim();

  var childId =
    String(
      options.childId ||
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.DEFAULT_CHILD_ID
    ).trim();

  var todayKey =
    kidlearnV3_4h1TodayKey_();

  var dev =
    kidlearnV3_4h1CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var phase4G =
    kidlearnV3_4h1SafeCall_(
      'kidlearnV3_assertPhase4GClosedLockedV3'
    );

  if (!phase4G.success) {
    errors.push(
      'Phase 4G chưa closed locked: ' +
      phase4G.message
    );
  }

  kidlearnV3_4h1EnsureDefaultGateMode_();

  var policy =
    kidlearnV3_4h1BuildPolicy_();

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4h1OpenSpreadsheet_();
  } catch (errorOpen) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(errorOpen.message || errorOpen)
    );
  }

  var availability = {};
  var data = {
    childMap: {},
    subjects: [],
    lessons: [],
    dailyGoals: [],
    assignments: [],
    lessonProgress: [],
    studySessions: []
  };

  if (spreadsheet) {
    data.childMap =
      kidlearnV3_4h1BuildChildMap_(spreadsheet, availability, errors);

    data.subjects =
      kidlearnV3_4h1ReadSubjects_(spreadsheet, availability, errors);

    data.lessons =
      kidlearnV3_4h1ReadLessons_(spreadsheet, availability, errors);

    data.dailyGoals =
      kidlearnV3_4h1ReadDailyGoals_(spreadsheet, childId, availability, errors);

    data.assignments =
      kidlearnV3_4h1ReadAssignments_(spreadsheet, childId, availability, errors);

    data.lessonProgress =
      kidlearnV3_4h1ReadLessonProgress_(spreadsheet, childId, availability, warnings);

    data.studySessions =
      kidlearnV3_4h1ReadStudySessions_(spreadsheet, childId, availability, warnings);
  }

  var dashboardContext = null;

  try {
    if (typeof kidlearnV3_getParentDashboardContext4G1V3 === 'function') {
      dashboardContext =
        kidlearnV3_getParentDashboardContext4G1V3({
          parentId:
            parentId,
          childId:
            childId,
          recentLimit:
            20
        });
    }
  } catch (errorDashboard) {
    warnings.push(
      'Không đọc được dashboard context 4G-1 để gợi ý kế hoạch: ' +
      String(errorDashboard.message || errorDashboard)
    );
  }

  var child =
    kidlearnV3_4h1ResolveChild_(
      childId,
      data.childMap,
      dashboardContext
    );

  var todayGoal =
    kidlearnV3_4h1FindTodayGoal_(
      data.dailyGoals,
      todayKey
    );

  var activeAssignments =
    kidlearnV3_4h1FindActiveAssignments_(
      data.assignments,
      todayKey
    );

  var subjectRecommendations =
    kidlearnV3_4h1BuildSubjectRecommendations_(
      data.subjects,
      data.lessonProgress,
      data.studySessions,
      dashboardContext
    );

  var lessonSuggestions =
    kidlearnV3_4h1BuildLessonSuggestions_(
      data.lessons,
      data.lessonProgress,
      data.assignments,
      subjectRecommendations
    );

  var defaultPlan =
    kidlearnV3_4h1BuildDefaultPlan_(
      todayGoal,
      subjectRecommendations,
      lessonSuggestions
    );

  var planSummary = {
    todayKey:
      todayKey,
    hasTodayGoal:
      !!todayGoal,
    todayGoalMinutes:
      todayGoal ? todayGoal.targetMinutes : 0,
    activeAssignmentCount:
      activeAssignments.length,
    subjectOptionCount:
      data.subjects.length,
    subjectRecommendationCount:
      subjectRecommendations.items.length,
    lessonSuggestionCount:
      lessonSuggestions.items.length,
    defaultDailyGoalMinutes:
      defaultPlan.dailyGoalMinutes
  };

  var learningPlanContext = {
    title:
      'Lập kế hoạch học',
    subtitle:
      'Phụ huynh đặt mục tiêu và giao bài cho bé',
    parentId:
      parentId,
    child:
      child,
    todayKey:
      todayKey,
    policy:
      policy,
    existingPlan: {
      todayGoal:
        todayGoal,
      activeAssignments:
        activeAssignments
    },
    subjectOptions:
      data.subjects,
    subjectRecommendations:
      subjectRecommendations,
    lessonSuggestions:
      lessonSuggestions,
    defaultPlan:
      defaultPlan,
    planSummary:
      planSummary,
    dataAvailability:
      availability,
    uiPolicy: {
      readOnlyNow:
        true,
      dryRunInNextStep:
        true,
      controlledWriteStep:
        '4H-3',
      parentOnly:
        true,
      childVisibilityStep:
        '4H-3',
      showDailyGoalMinutes:
        true,
      showSubjectPriority:
        true,
      showLessonAssignment:
        true
    }
  };

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_LEARNING_PLAN_POLICY_CONTEXT_4H_1_V3',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.PARENT_PHASE,
    contextName:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.CONTEXT_NAME,
    gateMode:
      kidlearnV3_4h1GetCurrentGateMode_(),
    parentId:
      parentId,
    child:
      child,
    todayKey:
      todayKey,
    policy:
      policy,
    planSummary:
      planSummary,
    learningPlanContext:
      learningPlanContext,
    nextBundle:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.NEXT_STAGE,
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
      kidlearnV3_4h1UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4h1UniqueArray_(warnings)
  };
}


/**
 * Read DATA_Children.
 */
function kidlearnV3_4h1BuildChildMap_(spreadsheet, availability, errors) {
  availability.DATA_Children = {
    exists: false,
    rows: 0
  };

  var map = {};

  var sheet =
    kidlearnV3_4h1GetSheetByExactName_(
      spreadsheet,
      'DATA_Children'
    );

  if (!sheet) {
    errors.push('Thiếu sheet DATA_Children.');
    return map;
  }

  availability.DATA_Children.exists = true;
  availability.DATA_Children.rows =
    Math.max(0, sheet.getLastRow() - 1);

  if (sheet.getLastRow() < 2) {
    return map;
  }

  var headers =
    kidlearnV3_4h1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var id =
      String(
        kidlearnV3_4h1ReadValueByAliases_(
          row,
          headers,
          ['childId', 'id']
        ) || ''
      ).trim();

    if (!id) continue;

    map[id] = {
      childId:
        id,
      name:
        String(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['childName', 'fullName', 'name', 'displayName']
          ) || 'Bé'
        ).trim(),
      grade:
        String(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['grade', 'class', 'level']
          ) || ''
        ).trim()
    };
  }

  return map;
}


/**
 * Read MST_Subjects.
 */
function kidlearnV3_4h1ReadSubjects_(spreadsheet, availability, errors) {
  availability.MST_Subjects = {
    exists: false,
    rows: 0
  };

  var rows = [];

  var sheet =
    kidlearnV3_4h1GetSheetByExactName_(
      spreadsheet,
      'MST_Subjects'
    );

  if (!sheet) {
    errors.push('Thiếu sheet MST_Subjects.');
    return rows;
  }

  availability.MST_Subjects.exists = true;
  availability.MST_Subjects.rows =
    Math.max(0, sheet.getLastRow() - 1);

  if (sheet.getLastRow() < 2) {
    return rows;
  }

  var headers =
    kidlearnV3_4h1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var code =
      String(
        kidlearnV3_4h1ReadValueByAliases_(
          row,
          headers,
          ['subjectCode', 'subjectId', 'code', 'id']
        ) || ''
      ).trim();

    if (!code) continue;

    rows.push({
      subjectCode:
        code,
      subjectName:
        String(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['subjectName', 'name', 'title']
          ) || code
        ).trim(),
      sortOrder:
        kidlearnV3_4h1ToNumber_(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['sortOrder', 'order', 'displayOrder']
          )
        )
    });
  }

  rows.sort(function (a, b) {
    return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
  });

  return rows;
}


/**
 * Read MST_Lessons.
 */
function kidlearnV3_4h1ReadLessons_(spreadsheet, availability, errors) {
  availability.MST_Lessons = {
    exists: false,
    rows: 0
  };

  var rows = [];

  var sheet =
    kidlearnV3_4h1GetSheetByExactName_(
      spreadsheet,
      'MST_Lessons'
    );

  if (!sheet) {
    errors.push('Thiếu sheet MST_Lessons.');
    return rows;
  }

  availability.MST_Lessons.exists = true;
  availability.MST_Lessons.rows =
    Math.max(0, sheet.getLastRow() - 1);

  if (sheet.getLastRow() < 2) {
    return rows;
  }

  var headers =
    kidlearnV3_4h1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var lessonId =
      String(
        kidlearnV3_4h1ReadValueByAliases_(
          row,
          headers,
          ['lessonId', 'id']
        ) || ''
      ).trim();

    if (!lessonId) continue;

    var status =
      String(
        kidlearnV3_4h1ReadValueByAliases_(
          row,
          headers,
          ['status', 'isActive']
        ) || ''
      ).trim().toUpperCase();

    if (
      status === 'INACTIVE' ||
      status === 'ARCHIVED' ||
      status === 'FALSE'
    ) {
      continue;
    }

    rows.push({
      lessonId:
        lessonId,
      lessonTitle:
        String(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['lessonTitle', 'title', 'name']
          ) || lessonId
        ).trim(),
      subjectCode:
        String(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['subjectCode', 'subjectId']
          ) || ''
        ).trim(),
      topicId:
        String(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['topicId']
          ) || ''
        ).trim(),
      grade:
        String(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['grade', 'level', 'class']
          ) || ''
        ).trim(),
      sortOrder:
        kidlearnV3_4h1ToNumber_(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['sortOrder', 'order', 'lessonOrder']
          )
        )
    });
  }

  rows.sort(function (a, b) {
    if (String(a.subjectCode) !== String(b.subjectCode)) {
      return String(a.subjectCode).localeCompare(String(b.subjectCode));
    }

    return Number(a.sortOrder || 0) - Number(b.sortOrder || 0);
  });

  return rows;
}


/**
 * Read DATA_DailyGoals.
 */
function kidlearnV3_4h1ReadDailyGoals_(spreadsheet, childId, availability, errors) {
  availability.DATA_DailyGoals = {
    exists: false,
    rows: 0
  };

  var rows = [];

  var sheet =
    kidlearnV3_4h1GetSheetByExactName_(
      spreadsheet,
      'DATA_DailyGoals'
    );

  if (!sheet) {
    errors.push('Thiếu sheet DATA_DailyGoals.');
    return rows;
  }

  availability.DATA_DailyGoals.exists = true;
  availability.DATA_DailyGoals.rows =
    Math.max(0, sheet.getLastRow() - 1);

  if (sheet.getLastRow() < 2) {
    return rows;
  }

  var headers =
    kidlearnV3_4h1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var itemChildId =
      String(
        kidlearnV3_4h1ReadValueByAliases_(
          row,
          headers,
          ['childId', 'studentId', 'learnerId']
        ) || ''
      ).trim();

    if (childId && itemChildId && itemChildId !== childId) {
      continue;
    }

    rows.push({
      goalId:
        String(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['goalId', 'dailyGoalId', 'id']
          ) || ''
        ).trim(),
      childId:
        itemChildId || childId,
      goalDate:
        kidlearnV3_4h1ToDateKey_(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['goalDate', 'date', 'planDate', 'createdAt']
          )
        ),
      targetMinutes:
        kidlearnV3_4h1ToNumber_(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['targetMinutes', 'targetMinute', 'minutes']
          )
        ),
      completedMinutes:
        kidlearnV3_4h1ToNumber_(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['completedMinutes', 'actualMinutes', 'doneMinutes']
          )
        ),
      status:
        String(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['status']
          ) || ''
        ).trim(),
      sourceRow:
        i + 2
    });
  }

  return rows;
}


/**
 * Read DATA_Assignments.
 */
function kidlearnV3_4h1ReadAssignments_(spreadsheet, childId, availability, errors) {
  availability.DATA_Assignments = {
    exists: false,
    rows: 0
  };

  var rows = [];

  var sheet =
    kidlearnV3_4h1GetSheetByExactName_(
      spreadsheet,
      'DATA_Assignments'
    );

  if (!sheet) {
    errors.push('Thiếu sheet DATA_Assignments.');
    return rows;
  }

  availability.DATA_Assignments.exists = true;
  availability.DATA_Assignments.rows =
    Math.max(0, sheet.getLastRow() - 1);

  if (sheet.getLastRow() < 2) {
    return rows;
  }

  var headers =
    kidlearnV3_4h1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var itemChildId =
      String(
        kidlearnV3_4h1ReadValueByAliases_(
          row,
          headers,
          ['childId', 'studentId', 'learnerId']
        ) || ''
      ).trim();

    if (childId && itemChildId && itemChildId !== childId) {
      continue;
    }

    rows.push({
      assignmentId:
        String(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['assignmentId', 'id']
          ) || ''
        ).trim(),
      childId:
        itemChildId || childId,
      lessonId:
        String(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['lessonId']
          ) || ''
        ).trim(),
      subjectCode:
        String(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['subjectCode', 'subjectId']
          ) || ''
        ).trim(),
      status:
        String(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['status']
          ) || ''
        ).trim().toUpperCase(),
      dueDate:
        kidlearnV3_4h1ToDateKey_(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['dueDate', 'planDate', 'assignedDate', 'date']
          )
        ),
      assignedAt:
        kidlearnV3_4h1ToIso_(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['assignedAt', 'createdAt', 'updatedAt']
          )
        ),
      source:
        String(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['source', 'assignmentSource']
          ) || ''
        ).trim(),
      sourceRow:
        i + 2
    });
  }

  return rows;
}


/**
 * Read DATA_LessonProgress.
 */
function kidlearnV3_4h1ReadLessonProgress_(spreadsheet, childId, availability, warnings) {
  availability.DATA_LessonProgress = {
    exists: false,
    rows: 0
  };

  var rows = [];

  var sheet =
    kidlearnV3_4h1GetSheetByExactName_(
      spreadsheet,
      'DATA_LessonProgress'
    );

  if (!sheet) {
    warnings.push('DATA_LessonProgress không tìm thấy. Gợi ý bài học có thể ít chính xác.');
    return rows;
  }

  availability.DATA_LessonProgress.exists = true;
  availability.DATA_LessonProgress.rows =
    Math.max(0, sheet.getLastRow() - 1);

  if (sheet.getLastRow() < 2) {
    return rows;
  }

  var headers =
    kidlearnV3_4h1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var itemChildId =
      String(
        kidlearnV3_4h1ReadValueByAliases_(
          row,
          headers,
          ['childId', 'studentId', 'learnerId']
        ) || ''
      ).trim();

    if (childId && itemChildId && itemChildId !== childId) {
      continue;
    }

    rows.push({
      childId:
        itemChildId || childId,
      lessonId:
        String(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['lessonId']
          ) || ''
        ).trim(),
      subjectCode:
        String(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['subjectCode', 'subjectId']
          ) || ''
        ).trim(),
      status:
        String(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['status']
          ) || ''
        ).trim().toUpperCase(),
      progressPercent:
        kidlearnV3_4h1ToNumber_(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['progressPercent', 'percent', 'completionPercent']
          )
        ),
      updatedAt:
        kidlearnV3_4h1ToIso_(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['updatedAt', 'lastUpdatedAt', 'completedAt']
          )
        )
    });
  }

  return rows;
}


/**
 * Read DATA_StudySessions.
 */
function kidlearnV3_4h1ReadStudySessions_(spreadsheet, childId, availability, warnings) {
  availability.DATA_StudySessions = {
    exists: false,
    rows: 0
  };

  var rows = [];

  var sheet =
    kidlearnV3_4h1GetSheetByExactName_(
      spreadsheet,
      'DATA_StudySessions'
    );

  if (!sheet) {
    warnings.push('DATA_StudySessions không tìm thấy. Gợi ý thời lượng có thể dùng mặc định.');
    return rows;
  }

  availability.DATA_StudySessions.exists = true;
  availability.DATA_StudySessions.rows =
    Math.max(0, sheet.getLastRow() - 1);

  if (sheet.getLastRow() < 2) {
    return rows;
  }

  var headers =
    kidlearnV3_4h1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var itemChildId =
      String(
        kidlearnV3_4h1ReadValueByAliases_(
          row,
          headers,
          ['childId', 'studentId', 'learnerId']
        ) || ''
      ).trim();

    if (childId && itemChildId && itemChildId !== childId) {
      continue;
    }

    rows.push({
      childId:
        itemChildId || childId,
      lessonId:
        String(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['lessonId']
          ) || ''
        ).trim(),
      subjectCode:
        String(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['subjectCode', 'subjectId']
          ) || ''
        ).trim(),
      startedAt:
        kidlearnV3_4h1ToIso_(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['startedAt', 'startAt', 'createdAt']
          )
        ),
      endedAt:
        kidlearnV3_4h1ToIso_(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['endedAt', 'endAt']
          )
        ),
      durationSeconds:
        kidlearnV3_4h1ToNumber_(
          kidlearnV3_4h1ReadValueByAliases_(
            row,
            headers,
            ['durationSeconds', 'durationSec', 'duration']
          )
        )
    });
  }

  return rows;
}


/**
 * Build context components.
 */
function kidlearnV3_4h1ResolveChild_(childId, childMap, dashboardContext) {
  childMap =
    childMap || {};

  var fromMap =
    childMap[childId] || {};

  var dashboard =
    dashboardContext && dashboardContext.parentDashboard
      ? dashboardContext.parentDashboard
      : {};

  var fromDashboard =
    dashboard.child || {};

  return {
    childId:
      childId,
    name:
      fromMap.name ||
      fromDashboard.name ||
      fromDashboard.displayName ||
      'Bé',
    displayName:
      fromMap.name ||
      fromDashboard.displayName ||
      fromDashboard.name ||
      'Bé',
    grade:
      fromMap.grade ||
      fromDashboard.grade ||
      ''
  };
}


function kidlearnV3_4h1FindTodayGoal_(dailyGoals, todayKey) {
  for (var i = 0; i < dailyGoals.length; i++) {
    if (dailyGoals[i].goalDate === todayKey) {
      return dailyGoals[i];
    }
  }

  return null;
}


function kidlearnV3_4h1FindActiveAssignments_(assignments, todayKey) {
  var rows = [];

  for (var i = 0; i < assignments.length; i++) {
    var status =
      String(assignments[i].status || '').trim().toUpperCase();

    var dueDate =
      assignments[i].dueDate || '';

    var active =
      status === '' ||
      status === 'ASSIGNED' ||
      status === 'OPEN' ||
      status === 'IN_PROGRESS' ||
      status === 'PENDING';

    if (!active) {
      continue;
    }

    if (dueDate && dueDate < todayKey) {
      continue;
    }

    rows.push(assignments[i]);
  }

  return rows;
}


function kidlearnV3_4h1BuildSubjectRecommendations_(subjects, lessonProgress, sessions, dashboardContext) {
  var map = {};

  for (var i = 0; i < subjects.length; i++) {
    map[subjects[i].subjectCode] = {
      subjectCode:
        subjects[i].subjectCode,
      subjectName:
        subjects[i].subjectName,
      reason:
        'Môn học trong chương trình',
      priorityScore:
        50,
      completedLessons:
        0,
      inProgressLessons:
        0,
      sessionCount:
        0,
      averageProgressPercent:
        0
    };
  }

  var percentSum = {};
  var progressCount = {};

  for (var j = 0; j < lessonProgress.length; j++) {
    var p =
      lessonProgress[j];

    var code =
      String(p.subjectCode || '').trim();

    if (!code) continue;

    if (!map[code]) {
      map[code] = {
        subjectCode:
          code,
        subjectName:
          code,
        reason:
          'Có dữ liệu tiến độ',
        priorityScore:
          60,
        completedLessons:
          0,
        inProgressLessons:
          0,
        sessionCount:
          0,
        averageProgressPercent:
          0
      };
    }

    var percent =
      Number(p.progressPercent || 0);

    if (
      String(p.status || '').toUpperCase() === 'COMPLETED' ||
      percent >= 100
    ) {
      map[code].completedLessons++;
    } else {
      map[code].inProgressLessons++;
      map[code].priorityScore += 12;
      map[code].reason = 'Có bài đang học dở';
    }

    if (!percentSum[code]) percentSum[code] = 0;
    if (!progressCount[code]) progressCount[code] = 0;

    percentSum[code] += percent;
    progressCount[code]++;
  }

  for (var k = 0; k < sessions.length; k++) {
    var sessionCode =
      String(sessions[k].subjectCode || '').trim();

    if (!sessionCode) continue;

    if (!map[sessionCode]) {
      map[sessionCode] = {
        subjectCode:
          sessionCode,
        subjectName:
          sessionCode,
        reason:
          'Có hoạt động học gần đây',
        priorityScore:
          55,
        completedLessons:
          0,
        inProgressLessons:
          0,
        sessionCount:
          0,
        averageProgressPercent:
          0
      };
    }

    map[sessionCode].sessionCount++;
  }

  for (var code in map) {
    if (map.hasOwnProperty(code)) {
      if (progressCount[code]) {
        map[code].averageProgressPercent =
          Math.round(percentSum[code] / progressCount[code]);
      }

      if (map[code].averageProgressPercent > 0 && map[code].averageProgressPercent < 70) {
        map[code].priorityScore += 8;
        map[code].reason = 'Nên củng cố thêm';
      }
    }
  }

  var dashboard =
    dashboardContext && dashboardContext.parentDashboard
      ? dashboardContext.parentDashboard
      : {};

  var progressBySubject =
    dashboard.progressBySubject && dashboard.progressBySubject.items
      ? dashboard.progressBySubject.items
      : [];

  for (var d = 0; d < progressBySubject.length; d++) {
    var item =
      progressBySubject[d];

    var dashboardCode =
      String(item.subjectCode || '').trim();

    if (!dashboardCode) continue;

    if (!map[dashboardCode]) {
      map[dashboardCode] = {
        subjectCode:
          dashboardCode,
        subjectName:
          item.subjectName || dashboardCode,
        reason:
          'Có dữ liệu dashboard',
        priorityScore:
          50,
        completedLessons:
          0,
        inProgressLessons:
          0,
        sessionCount:
          0,
        averageProgressPercent:
          0
      };
    }

    map[dashboardCode].completedLessons =
      Math.max(
        map[dashboardCode].completedLessons || 0,
        Number(item.completedLessons || 0)
      );

    map[dashboardCode].inProgressLessons =
      Math.max(
        map[dashboardCode].inProgressLessons || 0,
        Number(item.inProgressLessons || 0)
      );

    map[dashboardCode].sessionCount =
      Math.max(
        map[dashboardCode].sessionCount || 0,
        Number(item.sessionCount || 0)
      );

    map[dashboardCode].averageProgressPercent =
      Math.max(
        map[dashboardCode].averageProgressPercent || 0,
        Number(item.averageProgressPercent || 0)
      );
  }

  var items = [];

  for (var subjectCode in map) {
    if (map.hasOwnProperty(subjectCode)) {
      items.push(map[subjectCode]);
    }
  }

  items.sort(function (a, b) {
    return Number(b.priorityScore || 0) - Number(a.priorityScore || 0);
  });

  return {
    itemCount:
      items.length,
    items:
      items,
    recommendedSubjectCode:
      items.length > 0 ? items[0].subjectCode : '',
    emptyState: {
      show:
        items.length === 0,
      title:
        'Chưa có môn học để gợi ý',
      message:
        'Khi có dữ liệu môn học, hệ thống sẽ gợi ý môn ưu tiên.'
    }
  };
}


function kidlearnV3_4h1BuildLessonSuggestions_(lessons, lessonProgress, assignments, subjectRecommendations) {
  var progressMap = {};
  var assignedMap = {};

  for (var i = 0; i < lessonProgress.length; i++) {
    if (lessonProgress[i].lessonId) {
      progressMap[lessonProgress[i].lessonId] = lessonProgress[i];
    }
  }

  for (var j = 0; j < assignments.length; j++) {
    if (assignments[j].lessonId) {
      var status =
        String(assignments[j].status || '').toUpperCase();

      if (
        status === '' ||
        status === 'ASSIGNED' ||
        status === 'OPEN' ||
        status === 'IN_PROGRESS' ||
        status === 'PENDING'
      ) {
        assignedMap[assignments[j].lessonId] = true;
      }
    }
  }

  var prioritySubject =
    subjectRecommendations.recommendedSubjectCode || '';

  var items = [];

  for (var k = 0; k < lessons.length; k++) {
    var lesson =
      lessons[k];

    var progress =
      progressMap[lesson.lessonId] || null;

    var alreadyAssigned =
      assignedMap[lesson.lessonId] === true;

    var score = 50;
    var reason = 'Bài học có thể giao cho bé';

    if (lesson.subjectCode === prioritySubject) {
      score += 25;
      reason = 'Thuộc môn ưu tiên';
    }

    if (!progress) {
      score += 15;
      reason = 'Bài mới chưa học';
    } else if (
      String(progress.status || '').toUpperCase() !== 'COMPLETED' &&
      Number(progress.progressPercent || 0) < 100
    ) {
      score += 20;
      reason = 'Bài đang học dở';
    } else {
      score -= 20;
      reason = 'Bài đã hoàn thành';
    }

    if (alreadyAssigned) {
      score -= 60;
      reason = 'Đã có assignment đang mở';
    }

    items.push({
      lessonId:
        lesson.lessonId,
      lessonTitle:
        lesson.lessonTitle,
      subjectCode:
        lesson.subjectCode,
      topicId:
        lesson.topicId,
      grade:
        lesson.grade,
      progressStatus:
        progress ? progress.status : '',
      progressPercent:
        progress ? progress.progressPercent : 0,
      alreadyAssigned:
        alreadyAssigned,
      suggestionScore:
        score,
      reason:
        reason
    });
  }

  items.sort(function (a, b) {
    return Number(b.suggestionScore || 0) - Number(a.suggestionScore || 0);
  });

  if (items.length > KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.MAX_LESSON_SUGGESTIONS) {
    items =
      items.slice(
        0,
        KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.MAX_LESSON_SUGGESTIONS
      );
  }

  return {
    itemCount:
      items.length,
    items:
      items,
    recommendedLessonId:
      items.length > 0 ? items[0].lessonId : '',
    emptyState: {
      show:
        items.length === 0,
      title:
        'Chưa có bài học để gợi ý',
      message:
        'Khi có danh sách bài học, phụ huynh có thể chọn bài giao cho bé.'
    }
  };
}


function kidlearnV3_4h1BuildDefaultPlan_(todayGoal, subjectRecommendations, lessonSuggestions) {
  var goalMinutes =
    todayGoal && todayGoal.targetMinutes
      ? Number(todayGoal.targetMinutes)
      : KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.DEFAULT_DAILY_GOAL_MINUTES;

  if (
    goalMinutes < KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.MIN_DAILY_GOAL_MINUTES
  ) {
    goalMinutes =
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.MIN_DAILY_GOAL_MINUTES;
  }

  if (
    goalMinutes > KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.MAX_DAILY_GOAL_MINUTES
  ) {
    goalMinutes =
      KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.MAX_DAILY_GOAL_MINUTES;
  }

  return {
    dailyGoalMinutes:
      goalMinutes,
    prioritySubjectCode:
      subjectRecommendations.recommendedSubjectCode || '',
    selectedLessonIds:
      lessonSuggestions.recommendedLessonId
        ? [lessonSuggestions.recommendedLessonId]
        : [],
    dryRunOnly:
      true,
    message:
      'Đây là kế hoạch gợi ý read-only. 4H-2 sẽ cho phụ huynh preview dry-run.'
  };
}


/**
 * Gate helpers.
 */
function kidlearnV3_4h1EnsureDefaultGateMode_() {
  var properties =
    PropertiesService.getScriptProperties();

  var current =
    properties.getProperty(
      KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS.WRITE_GATE_MODE
    );

  if (!current) {
    properties.setProperty(
      KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS.WRITE_GATE_MODE,
      KIDLEARN_V3_LEARNING_PLAN_4H1_GATE_MODE.CLOSED_DRY_RUN_ONLY
    );
  }
}


function kidlearnV3_4h1GetCurrentGateMode_() {
  var mode =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS.WRITE_GATE_MODE
      ) ||
    KIDLEARN_V3_LEARNING_PLAN_4H1_GATE_MODE.CLOSED_DRY_RUN_ONLY;

  if (
    mode !== KIDLEARN_V3_LEARNING_PLAN_4H1_GATE_MODE.CLOSED_DRY_RUN_ONLY &&
    mode !== KIDLEARN_V3_LEARNING_PLAN_4H1_GATE_MODE.OPEN_DEV_CONTROLLED
  ) {
    return KIDLEARN_V3_LEARNING_PLAN_4H1_GATE_MODE.CLOSED_DRY_RUN_ONLY;
  }

  return mode;
}


/**
 * Spreadsheet helpers.
 */
function kidlearnV3_4h1OpenSpreadsheet_() {
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


function kidlearnV3_4h1GetSheetByExactName_(spreadsheet, sheetName) {
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


function kidlearnV3_4h1ReadHeaders_(sheet) {
  if (!sheet || sheet.getLastColumn() < 1) {
    return [];
  }

  return sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];
}


function kidlearnV3_4h1FindColumnIndexByAliases_(headers, aliases) {
  headers =
    headers || [];

  aliases =
    aliases || [];

  var aliasMap = {};

  for (var i = 0; i < aliases.length; i++) {
    aliasMap[
      kidlearnV3_4h1NormalizeHeader_(aliases[i])
    ] = true;
  }

  for (var j = 0; j < headers.length; j++) {
    var normalized =
      kidlearnV3_4h1NormalizeHeader_(headers[j]);

    if (aliasMap[normalized]) {
      return j;
    }
  }

  return -1;
}


function kidlearnV3_4h1ReadValueByAliases_(row, headers, aliases) {
  var index =
    kidlearnV3_4h1FindColumnIndexByAliases_(
      headers,
      aliases
    );

  if (index < 0) return '';

  return row[index];
}


function kidlearnV3_4h1NormalizeHeader_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .replace(/-/g, '');
}


/**
 * Date and value helpers.
 */
function kidlearnV3_4h1TodayKey_() {
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


function kidlearnV3_4h1ToDateKey_(value) {
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


function kidlearnV3_4h1ToIso_(value) {
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


function kidlearnV3_4h1ToNumber_(value) {
  var number =
    Number(value || 0);

  return isNaN(number) ? 0 : number;
}


function kidlearnV3_4h1SafeJsonParse_(text) {
  text =
    String(text || '').trim();

  if (!text) {
    return {
      success: true,
      value: {},
      raw: ''
    };
  }

  try {
    return {
      success: true,
      value: JSON.parse(text),
      raw: text
    };
  } catch (error) {
    return {
      success: false,
      value: {},
      raw: text,
      error:
        String(error.message || error)
    };
  }
}


/**
 * DEV safety.
 */
function kidlearnV3_4h1CheckDevSafety_() {
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
 * Safe call helper.
 */
function kidlearnV3_4h1SafeCall_(functionName) {
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
      message:
        output && output.success === true
          ? 'OK'
          : kidlearnV3_4h1PreviewValue_(JSON.stringify(output || {})),
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


function kidlearnV3_4h1PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 350) {
    return text.substring(0, 350) + '...';
  }

  return text;
}


function kidlearnV3_4h1UniqueArray_(items) {
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


/**
 * Save helpers.
 */
function kidlearnV3_4h1SavePolicy_(policy) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS.POLICY_JSON,
      JSON.stringify(policy || {})
    );
}


function kidlearnV3_4h1SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.PARENT_PHASE,
      status:
        status,
      contextName:
        KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.CONTEXT_NAME,
      gateMode:
        result.gateMode ||
        kidlearnV3_4h1GetCurrentGateMode_(),
      childId:
        result.child ? result.child.childId : '',
      planSummary:
        result.planSummary || {},
      nextBundle:
        KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_LEARNING_PLAN_4H1_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4h1ReadJsonProperty_(key) {
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