/**
 * ================================================================
 * KIDLEARN V3 - PARENT LEARNING PLAN UI DRY-RUN
 * Step: 4H-2
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Add Parent Learning Plan UI.
 * - Parent can preview:
 *   + Daily goal minutes
 *   + Priority subject
 *   + Lesson assignments
 * - Dry-run only. No learning data write.
 *
 * Safety:
 * - Không ghi DATA_DailyGoals.
 * - Không ghi DATA_Assignments.
 * - Không ghi DATA_LessonProgress.
 * - Không ghi DATA_Responses.
 * - Không ghi LOG_Audit.
 * - Không ghi Google Drive.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4H-2.
 */


var KIDLEARN_V3_LEARNING_PLAN_UI_4H2_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4H2_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4H2_LAST_PREVIEW_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4H2_LAST_READY_AT',
  LAST_DRY_RUN_AT: 'KIDLEARN_V3_PHASE_4H2_LAST_DRY_RUN_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4H2_LAST_RESULT_JSON',
  LAST_DRY_RUN_JSON: 'KIDLEARN_V3_PHASE_4H2_LAST_DRY_RUN_JSON'
};


var KIDLEARN_V3_LEARNING_PLAN_UI_4H2_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  READY_FOR_4H_3: 'READY_FOR_4H_3',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG = {
  PHASE: '4H-2',
  PARENT_PHASE: '4H',
  PREVIOUS_BUNDLE: '4H-1',
  NEXT_BUNDLE: '4H-3',
  NEXT_STAGE: 'CONTROLLED_WRITE_AND_CHILD_HOME_VISIBILITY',
  UI_NAME: 'PARENT_LEARNING_PLAN_UI_DRY_RUN',
  DRY_RUN_NAME: 'PARENT_LEARNING_PLAN_DRAFT_PREVIEW',
  DEFAULT_PARENT_ID: 'PARENT',
  DEFAULT_CHILD_ID: 'CHD_V2_CHILD_DEFAULT',
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Preview 4H-2 readiness.
 */
function kidlearnV3_previewLearningPlanUi4H2V3() {
  var result =
    kidlearnV3_4h2BuildReadiness_();

  result.action =
    'PREVIEW_LEARNING_PLAN_UI_4H_2_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_LEARNING_PLAN_UI_4H2_STATUS.PREVIEWED
      : KIDLEARN_V3_LEARNING_PLAN_UI_4H2_STATUS.FAILED;

  kidlearnV3_4h2SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_LEARNING_PLAN_UI_4H2_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4H-2 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Dry-run preview from UI.
 *
 * payload:
 * {
 *   parentId,
 *   childId,
 *   dailyGoalMinutes,
 *   prioritySubjectCode,
 *   selectedLessonIds: []
 * }
 */
function kidlearnV3_previewLearningPlanDraft4H2V3(payload) {
  payload = payload || {};

  var result =
    kidlearnV3_4h2BuildDraftPreview_(payload);

  result.action =
    'PREVIEW_LEARNING_PLAN_DRAFT_4H_2_V3';

  kidlearnV3_4h2SaveDryRun_(result);

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4H-2 draft preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 4H-2 ready.
 */
function kidlearnV3_markLearningPlanUi4H2ReadyV3() {
  var preview =
    kidlearnV3_previewLearningPlanUi4H2V3();

  if (!preview.success) {
    throw new Error('Preview 4H-2 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_LEARNING_PLAN_UI_4H_2_READY_V3',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_STATUS.READY_FOR_4H_3,
    uiName:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.UI_NAME,
    gateMode:
      preview.gateMode || 'CLOSED_DRY_RUN_ONLY',
    uiBlocks: [
      'DAILY_GOAL_MINUTES',
      'PRIORITY_SUBJECT',
      'LESSON_ASSIGNMENTS',
      'DRY_RUN_SUMMARY'
    ],
    nextBundle:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    message:
      '4H-2 ready. Parent Learning Plan UI dry-run đã sẵn sàng.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4h2SaveStatus_(
    result,
    KIDLEARN_V3_LEARNING_PLAN_UI_4H2_STATUS.READY_FOR_4H_3,
    KIDLEARN_V3_LEARNING_PLAN_UI_4H2_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getLearningPlanUi4H2StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_LEARNING_PLAN_UI_4H_2_STATUS_V3',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_PLAN_UI_4H2_KEYS.STATUS
      ) ||
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_PLAN_UI_4H2_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_PLAN_UI_4H2_KEYS.LAST_READY_AT
      ) || '',
    lastDryRunAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_PLAN_UI_4H2_KEYS.LAST_DRY_RUN_AT
      ) || '',
    lastResult:
      kidlearnV3_4h2ReadJsonProperty_(
        KIDLEARN_V3_LEARNING_PLAN_UI_4H2_KEYS.LAST_RESULT_JSON
      ),
    lastDryRun:
      kidlearnV3_4h2ReadJsonProperty_(
        KIDLEARN_V3_LEARNING_PLAN_UI_4H2_KEYS.LAST_DRY_RUN_JSON
      ),
    nextBundle:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertLearningPlanUi4H2ReadyV3() {
  var status =
    kidlearnV3_getLearningPlanUi4H2StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_LEARNING_PLAN_UI_4H2_STATUS.READY_FOR_4H_3
  ) {
    errors.push(
      '4H-2 chưa READY_FOR_4H_3. Status=' +
      status.status
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_LEARNING_PLAN_UI_4H_2_READY_V3',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.PHASE,
    status:
      status.status,
    nextBundle:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.NEXT_STAGE,
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
 * QA batch 4H-2.
 */
function kidlearnV3_runQaBatch4H2V3() {
  var preview =
    kidlearnV3_previewLearningPlanUi4H2V3();

  var dryRun =
    kidlearnV3_4h2RunSampleDryRun_();

  var ready =
    kidlearnV3_markLearningPlanUi4H2ReadyV3();

  var assertReady =
    kidlearnV3_assertLearningPlanUi4H2ReadyV3();

  var result = {
    success:
      preview.success === true &&
      dryRun.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4H_2_PARENT_LEARNING_PLAN_UI_DRY_RUN',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.PHASE,
    status:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_STATUS.READY_FOR_4H_3,
    nextBundle:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    results: {
      preview:
        preview.success,
      dryRun:
        dryRun.success,
      ready:
        ready.success,
      assertReady:
        assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4H-2 QA batch failed.');
  }

  return result;
}


/**
 * Readiness.
 */
function kidlearnV3_4h2BuildReadiness_() {
  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4h2CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var h1 =
    kidlearnV3_4h2SafeCall_(
      'kidlearnV3_assertLearningPlanPolicyContext4H1ReadyV3'
    );

  if (!h1.success) {
    errors.push(
      '4H-1 chưa READY_FOR_4H_2: ' +
      h1.message
    );
  }

  var context =
    kidlearnV3_4h2SafeCall_(
      'kidlearnV3_getLearningPlanContext4H1V3'
    );

  if (!context.success) {
    errors.push(
      'Không đọc được Learning Plan Context 4H-1: ' +
      context.message
    );
  }

  var gateMode =
    '';

  if (
    context.output &&
    context.output.gateMode
  ) {
    gateMode =
      context.output.gateMode;
  }

  if (
    gateMode &&
    gateMode !== 'CLOSED_DRY_RUN_ONLY'
  ) {
    errors.push(
      '4H-2 yêu cầu gate CLOSED_DRY_RUN_ONLY. Current=' +
      gateMode
    );
  }

  var markers =
    kidlearnV3_4h2InspectUiMarkers_();

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
      'BUILD_LEARNING_PLAN_UI_READINESS_4H_2_V3',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.PARENT_PHASE,
    uiName:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.UI_NAME,
    gateMode:
      gateMode || 'CLOSED_DRY_RUN_ONLY',
    prerequisite: {
      phase4H1Ready:
        h1.success === true,
      learningPlanContextReadable:
        context.success === true
    },
    learningPlanContext:
      context.output || null,
    uiBehavior: {
      parentOnly:
        true,
      dryRunOnly:
        true,
      realWriteAllowedNow:
        false,
      showDailyGoalMinutes:
        true,
      showPrioritySubject:
        true,
      showLessonAssignments:
        true,
      saveButtonDryRun:
        true,
      nextControlledWriteStep:
        '4H-3'
    },
    uiMarkers:
      markers,
    nextBundle:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.NEXT_STAGE,
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
      kidlearnV3_4h2UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4h2UniqueArray_(warnings)
  };
}


/**
 * Build draft preview, no real write.
 */
function kidlearnV3_4h2BuildDraftPreview_(payload) {
  payload = payload || {};

  var errors = [];
  var warnings = [];

  var parentId =
    String(
      payload.parentId ||
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.DEFAULT_PARENT_ID
    ).trim();

  var childId =
    String(
      payload.childId ||
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.DEFAULT_CHILD_ID
    ).trim();

  var dailyGoalMinutes =
    Number(payload.dailyGoalMinutes || 0);

  var prioritySubjectCode =
    String(payload.prioritySubjectCode || '').trim();

  var selectedLessonIds =
    kidlearnV3_4h2NormalizeStringArray_(
      payload.selectedLessonIds || []
    );

  var h1 =
    kidlearnV3_4h2SafeCall_(
      'kidlearnV3_assertLearningPlanPolicyContext4H1ReadyV3'
    );

  if (!h1.success) {
    errors.push(
      '4H-1 chưa ready: ' +
      h1.message
    );
  }

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
    kidlearnV3_4h2BuildSubjectMap_(subjectOptions);

  if (prioritySubjectCode && !subjectMap[prioritySubjectCode]) {
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
    kidlearnV3_4h2BuildLessonMap_(lessonItems);

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
      'Chưa chọn lesson nào. 4H-3 có thể chỉ ghi Daily Goal nếu phụ huynh muốn.'
    );
  }

  var todayKey =
    learningPlanContext.todayKey ||
    (
      context && context.todayKey
        ? context.todayKey
        : kidlearnV3_4h2TodayKey_()
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
        true
    });
  }

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_LEARNING_PLAN_DRAFT_PREVIEW_4H_2_V3',
    phase:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.PARENT_PHASE,
    dryRunName:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.DRY_RUN_NAME,
    dryRunOnly:
      true,
    writeAllowedNow:
      false,
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
    dryRunOperations: {
      DATA_DailyGoals: {
        allowedIn4H3:
          true,
        operation:
          dailyGoalOperation,
        targetMinutes:
          dailyGoalMinutes,
        goalDate:
          todayKey,
        dryRunOnly:
          true
      },
      DATA_Assignments: {
        allowedIn4H3:
          true,
        operationCount:
          assignmentOperations.length,
        operations:
          assignmentOperations,
        dryRunOnly:
          true
      }
    },
    nextRealWriteStep:
      '4H-3',
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
      kidlearnV3_4h2UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4h2UniqueArray_(warnings)
  };
}


/**
 * Sample dry-run for QA.
 */
function kidlearnV3_4h2RunSampleDryRun_() {
  var context =
    kidlearnV3_getLearningPlanContext4H1V3({
      parentId:
        KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.DEFAULT_PARENT_ID,
      childId:
        KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.DEFAULT_CHILD_ID
    });

  var learningPlanContext =
    context.learningPlanContext || {};

  var defaultPlan =
    learningPlanContext.defaultPlan || {};

  return kidlearnV3_previewLearningPlanDraft4H2V3({
    parentId:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.DEFAULT_PARENT_ID,
    childId:
      KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.DEFAULT_CHILD_ID,
    dailyGoalMinutes:
      defaultPlan.dailyGoalMinutes || 20,
    prioritySubjectCode:
      defaultPlan.prioritySubjectCode || '',
    selectedLessonIds:
      defaultPlan.selectedLessonIds || []
  });
}


/**
 * UI marker inspection.
 */
function kidlearnV3_4h2InspectUiMarkers_() {
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
        .createHtmlOutputFromFile('UI_Product_Client_LearningPlan_4H2')
        .getContent();
  } catch (error2) {
    errors.push(
      'Không đọc được UI_Product_Client_LearningPlan_4H2: ' +
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

  kidlearnV3_4h2CheckMarkers_(
    shell,
    [
      'UI_Product_Client_LearningPlan_4H2'
    ],
    'Shell',
    errors
  );

  kidlearnV3_4h2CheckMarkers_(
    client,
    [
      'KIDLEARN_LEARNING_PLAN_UI_DRY_RUN_4H2',
      'ensureLearningPlanEntry4H2',
      'openLearningPlanPanel4H2',
      'renderLearningPlanPanel4H2',
      'submitLearningPlanDryRun4H2',
      'kidlearnV3_getLearningPlanContext4H1V3',
      'kidlearnV3_previewLearningPlanDraft4H2V3',
      'kl-learning-plan-entry-4h2',
      'kl-learning-plan-panel-4h2',
      'kl-learning-plan-card-4h2',
      'kl-learning-plan-lesson-4h2'
    ],
    'Client 4H-2',
    errors
  );

  kidlearnV3_4h2CheckMarkers_(
    styles,
    [
      '.kl-learning-plan-entry-4h2',
      '.kl-learning-plan-panel-4h2',
      '.kl-learning-plan-card-4h2',
      '.kl-learning-plan-lesson-4h2',
      '.kl-learning-plan-dryrun-result-4h2',
      '.kl-learning-plan-empty-4h2'
    ],
    'CSS',
    errors
  );

  return {
    success:
      errors.length === 0,
    action:
      'INSPECT_LEARNING_PLAN_UI_MARKERS_4H_2_V3',
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


function kidlearnV3_4h2CheckMarkers_(content, markers, label, errors) {
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
 * Helpers.
 */
function kidlearnV3_4h2BuildSubjectMap_(subjects) {
  var map = {};

  subjects =
    subjects || [];

  for (var i = 0; i < subjects.length; i++) {
    if (subjects[i].subjectCode) {
      map[subjects[i].subjectCode] = subjects[i];
    }
  }

  return map;
}


function kidlearnV3_4h2BuildLessonMap_(lessons) {
  var map = {};

  lessons =
    lessons || [];

  for (var i = 0; i < lessons.length; i++) {
    if (lessons[i].lessonId) {
      map[lessons[i].lessonId] = lessons[i];
    }
  }

  return map;
}


function kidlearnV3_4h2NormalizeStringArray_(value) {
  if (!value) return [];

  var raw =
    Array.isArray(value)
      ? value
      : String(value).split(',');

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


function kidlearnV3_4h2TodayKey_() {
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


/**
 * DEV safety.
 */
function kidlearnV3_4h2CheckDevSafety_() {
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


function kidlearnV3_4h2SafeCall_(functionName) {
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
          : kidlearnV3_4h2PreviewValue_(JSON.stringify(output || {})),
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


function kidlearnV3_4h2PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 350) {
    return text.substring(0, 350) + '...';
  }

  return text;
}


function kidlearnV3_4h2UniqueArray_(items) {
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


function kidlearnV3_4h2SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_LEARNING_PLAN_UI_4H2_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_PLAN_UI_4H2_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.PARENT_PHASE,
      status:
        status,
      uiName:
        KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.UI_NAME,
      gateMode:
        result.gateMode || '',
      nextBundle:
        KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4h2SaveDryRun_(result) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_LEARNING_PLAN_UI_4H2_KEYS.LAST_DRY_RUN_AT,
    new Date().toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_LEARNING_PLAN_UI_4H2_KEYS.LAST_DRY_RUN_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_LEARNING_PLAN_UI_4H2_CONFIG.PHASE,
      dryRunOnly:
        true,
      writeAllowedNow:
        false,
      draftPlan:
        result.draftPlan || {},
      dryRunOperations:
        result.dryRunOperations || {},
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


function kidlearnV3_4h2ReadJsonProperty_(key) {
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