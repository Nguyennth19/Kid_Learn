/**
 * ================================================================
 * KIDLEARN V3 - LEARNING UI CORE
 * Bundle: 3K-A
 * Steps:
 * - 3K.1: Review existing learning UI readiness
 * - 3K.2: Design Learning UI State Model
 * - 3K.3: Build Learning Screen Payload from DB V3
 * Version: 3.1.0
 * ================================================================
 *
 * Bundle 3K-A chỉ đọc DB V3.
 * KHÔNG ghi learning progress.
 * KHÔNG mở real write.
 * KHÔNG sửa PROD.
 */


var KIDLEARN_V3_LEARNING_UI_3KA_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3KA_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3KA_LAST_PREVIEW_AT',
  LAST_SMOKE_TEST_AT: 'KIDLEARN_V3_PHASE_3KA_LAST_SMOKE_TEST_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3KA_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3KA_LAST_RESULT_JSON'
};


var KIDLEARN_V3_LEARNING_UI_3KA_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  SMOKE_TESTED: 'SMOKE_TESTED',
  READY_FOR_3K_B: 'READY_FOR_3K_B',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_LEARNING_UI_3KA_CONFIG = {
  VERSION: '3K-A',
  PHASE: '3K.1_3K.2_3K.3',
  NEXT_BUNDLE: '3K-B',
  DEFAULT_GRADE_LEVEL: 2,
  DEFAULT_VIEW: 'LEARNING_HOME',
  READ_ONLY: true
};


var KIDLEARN_V3_LEARNING_UI_3KA_SHEETS = [
  'DATA_Children',
  'MST_Subjects',
  'MST_Topics',
  'MST_Lessons',
  'MST_LessonBlocks',
  'MST_Activities',
  'DATA_Assignments',
  'DATA_LessonProgress',
  'DATA_StudySessions',
  'DATA_DailyGoals'
];


/**
 * Preview Bundle 3K-A.
 */
function kidlearnV3_previewLearningUiCore3KAV3() {
  var errors = [];
  var warnings = [];

  var functionChecks =
    kidlearnV3_3kaCheckFunctions_([
      'kidlearnV3_assertPhase3JClosedV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_appGetActiveDatabaseV3_'
    ]);

  errors =
    errors.concat(
      functionChecks.errors
    );

  var phase3J =
    kidlearnV3_3kaSafePhase3JClosed_();

  if (!phase3J.success) {
    errors.push(
      'Phase 3J chưa CLOSED_LOCKED: ' +
      phase3J.message
    );
  }

  var safeWrite =
    kidlearnV3_3kaSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    warnings.push(
      'Safe Write nên ở DRY_RUN/enabled=false khi vào 3K-A. Hiện tại mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var sheetCheck =
    kidlearnV3_3kaCheckSheets_();

  errors =
    errors.concat(
      sheetCheck.errors
    );

  warnings =
    warnings.concat(
      sheetCheck.warnings
    );

  var dataSummary =
    kidlearnV3_3kaBuildDataSummary_();

  if (dataSummary.childrenCount < 1) {
    errors.push(
      'DATA_Children chưa có child để build Learning UI payload.'
    );
  }

  if (dataSummary.subjectsCount < 1) {
    errors.push(
      'MST_Subjects chưa có subject để build Learning UI payload.'
    );
  }

  if (dataSummary.lessonsCount < 1) {
    warnings.push(
      'MST_Lessons chưa có lesson. 3K-A vẫn pass nhưng 3K-B Lesson Player sẽ cần lesson seed ở phase sau.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_LEARNING_UI_CORE_3KA_V3',
    bundle: '3K-A',
    phase: KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.NEXT_BUNDLE,
    readOnly: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3J: phase3J,
    safeWriteStatus: safeWrite,
    dataSummary: dataSummary,
    sheetChecks: sheetCheck.items,
    functionChecks: functionChecks.items
  };

  kidlearnV3_3kaSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_UI_3KA_STATUS.PREVIEWED,
    KIDLEARN_V3_LEARNING_UI_3KA_KEYS.LAST_PREVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Build Learning UI State Model.
 */
function kidlearnV3_buildLearningUiState3KAV3(request) {
  var req =
    kidlearnV3_3kaNormalizeRequest_(
      request
    );

  var preview =
    kidlearnV3_previewLearningUiCore3KAV3();

  if (!preview.success) {
    throw new Error(
      'Không thể build Learning UI State vì preview 3K-A chưa đạt. Errors=' +
      preview.errorCount
    );
  }

  var data =
    kidlearnV3_3kaReadLearningData_();

  var child =
    kidlearnV3_3kaPickChild_(
      data.children,
      req.childId
    );

  var gradeLevel =
    Number(
      req.gradeLevel ||
      child.gradeLevel ||
      KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.DEFAULT_GRADE_LEVEL
    );

  var subjects =
    kidlearnV3_3kaBuildSubjectCards_(
      data.subjects,
      gradeLevel
    );

  var selectedSubject =
    kidlearnV3_3kaPickSubject_(
      subjects,
      req.subjectId
    );

  var topics =
    kidlearnV3_3kaBuildTopicsForSubject_(
      data.topics,
      selectedSubject.subjectId
    );

  var lessons =
    kidlearnV3_3kaBuildLessonsForSubject_(
      data.lessons,
      selectedSubject.subjectId,
      gradeLevel
    );

  var selectedLesson =
    kidlearnV3_3kaPickLesson_(
      lessons,
      req.lessonId
    );

  var assignments =
    kidlearnV3_3kaBuildAssignmentsForChild_(
      data.assignments,
      child.childId
    );

  var progress =
    kidlearnV3_3kaBuildProgressMap_(
      data.lessonProgress,
      child.childId
    );

  var dailyGoal =
    kidlearnV3_3kaPickDailyGoal_(
      data.dailyGoals,
      child.childId
    );

  var recentSessions =
    kidlearnV3_3kaBuildRecentSessions_(
      data.studySessions,
      child.childId
    );

  var state = {
    success: true,
    action: 'BUILD_LEARNING_UI_STATE_3KA_V3',
    bundle: '3K-A',
    phase: '3K.2',
    readOnly: true,
    writeEnabled: false,
    currentView:
      req.currentView ||
      KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.DEFAULT_VIEW,
    generatedAt:
      new Date().toISOString(),
    child: child,
    gradeLevel: gradeLevel,
    selectedSubject: selectedSubject,
    selectedLesson: selectedLesson,
    subjects: subjects,
    topics: topics,
    lessons: lessons,
    assignments: assignments,
    progressByLesson: progress,
    dailyGoal: dailyGoal,
    recentSessions: recentSessions,
    uiFlags: {
      canStartLesson: selectedLesson.lessonId ? true : false,
      canShowLessonPlayer: selectedLesson.lessonId ? true : false,
      canWriteProgressNow: false,
      writeMode: 'READ_ONLY_3K_A',
      nextWriteGate: '3K-C'
    },
    emptyStates:
      kidlearnV3_3kaBuildEmptyStates_(
        subjects,
        lessons,
        assignments
      )
  };

  console.log(
    JSON.stringify(state, null, 2)
  );

  return state;
}


/**
 * Build Learning Screen Payload.
 */
function kidlearnV3_buildLearningScreenPayload3KAV3(request) {
  var state =
    kidlearnV3_buildLearningUiState3KAV3(
      request || {}
    );

  var payload = {
    success: true,
    action: 'BUILD_LEARNING_SCREEN_PAYLOAD_3KA_V3',
    bundle: '3K-A',
    phase: '3K.3',
    readOnly: true,
    generatedAt:
      new Date().toISOString(),
    screen: {
      screenId: 'LEARNING_HOME_V3',
      title: 'KIDLEARN V3 - Learning Home',
      currentView: state.currentView,
      childName:
        state.child.childName ||
        state.child.name ||
        '',
      gradeLevel:
        state.gradeLevel
    },
    header: {
      child: state.child,
      dailyGoal: state.dailyGoal,
      recentSessionCount:
        state.recentSessions.length
    },
    subjectRail: {
      selectedSubjectId:
        state.selectedSubject.subjectId || '',
      items:
        state.subjects
    },
    lessonList: {
      selectedLessonId:
        state.selectedLesson.lessonId || '',
      items:
        kidlearnV3_3kaAttachProgressToLessons_(
          state.lessons,
          state.progressByLesson
        )
    },
    topicList: {
      items:
        state.topics
    },
    assignmentPanel: {
      items:
        state.assignments
    },
    lessonPlayerSeed: {
      lesson:
        state.selectedLesson,
      readOnly: true,
      blocks: [],
      activities: [],
      note:
        '3K-A chỉ tạo payload seed. Lesson blocks/activities sẽ gắn ở Bundle 3K-B/3L.'
    },
    uiFlags:
      state.uiFlags,
    emptyStates:
      state.emptyStates,
    diagnostics: {
      subjectsCount:
        state.subjects.length,
      lessonsCount:
        state.lessons.length,
      assignmentsCount:
        state.assignments.length,
      topicsCount:
        state.topics.length,
      progressCount:
        Object.keys(state.progressByLesson).length
    }
  };

  console.log(
    JSON.stringify(payload, null, 2)
  );

  return payload;
}


/**
 * Smoke test 3K-A.
 */
function kidlearnV3_smokeTestLearningUiCore3KAV3() {
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewLearningUiCore3KAV3();

  if (!preview.success) {
    throw new Error(
      'Không thể smoke test 3K-A vì preview chưa đạt. Errors=' +
      preview.errorCount
    );
  }

  var state =
    kidlearnV3_buildLearningUiState3KAV3({});

  var payload =
    kidlearnV3_buildLearningScreenPayload3KAV3({});

  if (!state.child || !state.child.childId) {
    errors.push(
      'Learning UI State thiếu child.childId.'
    );
  }

  if (!state.subjects || state.subjects.length < 1) {
    errors.push(
      'Learning UI State thiếu subjects.'
    );
  }

  if (!payload.screen || !payload.screen.screenId) {
    errors.push(
      'Learning Screen Payload thiếu screen.screenId.'
    );
  }

  if (!payload.subjectRail || payload.subjectRail.items.length < 1) {
    errors.push(
      'Learning Screen Payload thiếu subjectRail items.'
    );
  }

  if (payload.lessonList.items.length < 1) {
    warnings.push(
      'Learning Screen Payload chưa có lessonList items. Chấp nhận ở 3K-A nếu content lesson chưa seed.'
    );
  }

  if (payload.readOnly !== true) {
    errors.push(
      '3K-A payload phải readOnly=true.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_LEARNING_UI_CORE_3KA_V3',
    bundle: '3K-A',
    phase: KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.NEXT_BUNDLE,
    readOnly: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    stateSummary: {
      childId: state.child.childId || '',
      childName: state.child.childName || '',
      gradeLevel: state.gradeLevel,
      selectedSubjectId:
        state.selectedSubject.subjectId || '',
      selectedLessonId:
        state.selectedLesson.lessonId || '',
      subjectsCount:
        state.subjects.length,
      lessonsCount:
        state.lessons.length,
      assignmentsCount:
        state.assignments.length
    },
    payloadDiagnostics:
      payload.diagnostics
  };

  kidlearnV3_3kaSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_UI_3KA_STATUS.SMOKE_TESTED
      : KIDLEARN_V3_LEARNING_UI_3KA_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_UI_3KA_KEYS.LAST_SMOKE_TEST_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test 3K-A chưa đạt. Errors=' +
      result.errorCount
    );
  }

  return result;
}


/**
 * Mark 3K-A ready cho 3K-B.
 */
function kidlearnV3_markLearningUiCore3KAReadyV3() {
  var smoke =
    kidlearnV3_smokeTestLearningUiCore3KAV3();

  if (!smoke.success) {
    throw new Error(
      'Không thể mark 3K-A ready vì smoke test chưa pass.'
    );
  }

  var result = {
    success: true,
    action: 'MARK_LEARNING_UI_CORE_3KA_READY_V3',
    bundle: '3K-A',
    phase: KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.PHASE,
    status: KIDLEARN_V3_LEARNING_UI_3KA_STATUS.READY_FOR_3K_B,
    nextBundle: KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.NEXT_BUNDLE,
    message:
      '3K-A đã sẵn sàng. Có thể chuyển sang 3K-B để tạo Learning Screen / Lesson Player DEV cơ bản.'
  };

  kidlearnV3_3kaSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_UI_3KA_STATUS.READY_FOR_3K_B,
    KIDLEARN_V3_LEARNING_UI_3KA_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Get status 3K-A.
 */
function kidlearnV3_getLearningUiCore3KAStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_LEARNING_UI_CORE_3KA_STATUS_V3',
    bundle: '3K-A',
    phase: KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_UI_3KA_KEYS.STATUS
      ) ||
      KIDLEARN_V3_LEARNING_UI_3KA_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_UI_3KA_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastSmokeTestAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_UI_3KA_KEYS.LAST_SMOKE_TEST_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_UI_3KA_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3kaReadLastResult_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3K-A ready.
 */
function kidlearnV3_assertLearningUiCore3KAReadyV3() {
  var status =
    kidlearnV3_getLearningUiCore3KAStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_LEARNING_UI_3KA_STATUS.READY_FOR_3K_B
  ) {
    errors.push(
      '3K-A chưa READY_FOR_3K_B. Status hiện tại=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_LEARNING_UI_CORE_3KA_READY_V3',
    bundle: '3K-A',
    phase: KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.PHASE,
    errorCount: errors.length,
    errors: errors,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.NEXT_BUNDLE
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3K-A chưa ready. Errors=' +
      errors.length
    );
  }

  return result;
}


/**
 * Read learning data from DB V3.
 */
function kidlearnV3_3kaReadLearningData_() {
  return {
    children:
      kidlearnV3_3kaReadSheetObjects_(
        'DATA_Children',
        200
      ),
    subjects:
      kidlearnV3_3kaReadSheetObjects_(
        'MST_Subjects',
        100
      ),
    topics:
      kidlearnV3_3kaReadSheetObjects_(
        'MST_Topics',
        500
      ),
    lessons:
      kidlearnV3_3kaReadSheetObjects_(
        'MST_Lessons',
        500
      ),
    lessonBlocks:
      kidlearnV3_3kaReadSheetObjects_(
        'MST_LessonBlocks',
        1000
      ),
    activities:
      kidlearnV3_3kaReadSheetObjects_(
        'MST_Activities',
        1000
      ),
    assignments:
      kidlearnV3_3kaReadSheetObjects_(
        'DATA_Assignments',
        500
      ),
    lessonProgress:
      kidlearnV3_3kaReadSheetObjects_(
        'DATA_LessonProgress',
        1000
      ),
    studySessions:
      kidlearnV3_3kaReadSheetObjects_(
        'DATA_StudySessions',
        1000
      ),
    dailyGoals:
      kidlearnV3_3kaReadSheetObjects_(
        'DATA_DailyGoals',
        200
      )
  };
}


/**
 * Build data summary.
 */
function kidlearnV3_3kaBuildDataSummary_() {
  var data =
    kidlearnV3_3kaReadLearningData_();

  return {
    childrenCount:
      data.children.length,
    subjectsCount:
      data.subjects.length,
    topicsCount:
      data.topics.length,
    lessonsCount:
      data.lessons.length,
    lessonBlocksCount:
      data.lessonBlocks.length,
    activitiesCount:
      data.activities.length,
    assignmentsCount:
      data.assignments.length,
    lessonProgressCount:
      data.lessonProgress.length,
    studySessionsCount:
      data.studySessions.length,
    dailyGoalsCount:
      data.dailyGoals.length
  };
}


/**
 * Pick child.
 */
function kidlearnV3_3kaPickChild_(
  children,
  requestedChildId
) {
  var id =
    String(requestedChildId || '').trim();

  for (var i = 0; i < children.length; i++) {
    if (
      id &&
      String(children[i].childId || '').trim() === id
    ) {
      return kidlearnV3_3kaNormalizeChild_(
        children[i]
      );
    }
  }

  for (var j = 0; j < children.length; j++) {
    if (
      kidlearnV3_3kaIsActive_(
        children[j]
      )
    ) {
      return kidlearnV3_3kaNormalizeChild_(
        children[j]
      );
    }
  }

  if (children.length > 0) {
    return kidlearnV3_3kaNormalizeChild_(
      children[0]
    );
  }

  return {
    childId: '',
    childName: '',
    gradeLevel:
      KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.DEFAULT_GRADE_LEVEL
  };
}


/**
 * Normalize child.
 */
function kidlearnV3_3kaNormalizeChild_(
  row
) {
  return {
    childId:
      row.childId || row.id || '',
    childName:
      row.childName ||
      row.name ||
      row.fullName ||
      'Child',
    gradeLevel:
      Number(
        row.gradeLevel ||
        row.grade ||
        KIDLEARN_V3_LEARNING_UI_3KA_CONFIG.DEFAULT_GRADE_LEVEL
      ),
    status:
      row.status || '',
    raw:
      row
  };
}


/**
 * Build subject cards.
 */
function kidlearnV3_3kaBuildSubjectCards_(
  subjects,
  gradeLevel
) {
  var result = [];

  for (var i = 0; i < subjects.length; i++) {
    var row =
      subjects[i];

    if (
      !kidlearnV3_3kaIsActive_(
        row
      )
    ) {
      continue;
    }

    var subjectId =
      row.subjectId ||
      row.id ||
      '';

    if (!subjectId) {
      continue;
    }

    result.push({
      subjectId: subjectId,
      subjectCode:
        row.subjectCode ||
        row.code ||
        '',
      subjectName:
        row.subjectName ||
        row.name ||
        subjectId,
      gradeLevel:
        gradeLevel,
      displayOrder:
        Number(row.displayOrder || row.order || i + 1),
      icon:
        row.icon || '',
      color:
        row.color || '',
      raw:
        row
    });
  }

  result.sort(
    function(a, b) {
      return a.displayOrder - b.displayOrder;
    }
  );

  return result;
}


/**
 * Pick subject.
 */
function kidlearnV3_3kaPickSubject_(
  subjects,
  requestedSubjectId
) {
  var id =
    String(requestedSubjectId || '').trim();

  for (var i = 0; i < subjects.length; i++) {
    if (
      id &&
      subjects[i].subjectId === id
    ) {
      return subjects[i];
    }
  }

  if (subjects.length > 0) {
    return subjects[0];
  }

  return {
    subjectId: '',
    subjectName: '',
    subjectCode: ''
  };
}


/**
 * Build topics by subject.
 */
function kidlearnV3_3kaBuildTopicsForSubject_(
  topics,
  subjectId
) {
  var result = [];

  for (var i = 0; i < topics.length; i++) {
    var row =
      topics[i];

    if (
      subjectId &&
      row.subjectId &&
      row.subjectId !== subjectId
    ) {
      continue;
    }

    if (
      !kidlearnV3_3kaIsActive_(
        row
      )
    ) {
      continue;
    }

    result.push({
      topicId:
        row.topicId || row.id || '',
      subjectId:
        row.subjectId || '',
      topicName:
        row.topicName ||
        row.name ||
        row.title ||
        '',
      displayOrder:
        Number(row.displayOrder || row.order || i + 1),
      raw:
        row
    });
  }

  result.sort(
    function(a, b) {
      return a.displayOrder - b.displayOrder;
    }
  );

  return result;
}


/**
 * Build lessons by subject.
 */
function kidlearnV3_3kaBuildLessonsForSubject_(
  lessons,
  subjectId,
  gradeLevel
) {
  var result = [];

  for (var i = 0; i < lessons.length; i++) {
    var row =
      lessons[i];

    if (
      subjectId &&
      row.subjectId &&
      row.subjectId !== subjectId
    ) {
      continue;
    }

    if (
      !kidlearnV3_3kaIsActive_(
        row
      )
    ) {
      continue;
    }

    var lessonGrade =
      Number(row.gradeLevel || row.grade || gradeLevel);

    if (
      lessonGrade &&
      gradeLevel &&
      lessonGrade !== gradeLevel
    ) {
      continue;
    }

    var lessonId =
      row.lessonId ||
      row.id ||
      '';

    if (!lessonId) {
      continue;
    }

    result.push({
      lessonId: lessonId,
      subjectId:
        row.subjectId || subjectId || '',
      topicId:
        row.topicId || '',
      lessonTitle:
        row.lessonTitle ||
        row.lessonName ||
        row.title ||
        row.name ||
        lessonId,
      lessonType:
        row.lessonType || '',
      gradeLevel:
        lessonGrade || gradeLevel,
      estimatedMinutes:
        Number(row.estimatedMinutes || row.durationMinutes || 0),
      displayOrder:
        Number(row.displayOrder || row.order || i + 1),
      status:
        row.status || '',
      raw:
        row
    });
  }

  result.sort(
    function(a, b) {
      return a.displayOrder - b.displayOrder;
    }
  );

  return result;
}


/**
 * Pick lesson.
 */
function kidlearnV3_3kaPickLesson_(
  lessons,
  requestedLessonId
) {
  var id =
    String(requestedLessonId || '').trim();

  for (var i = 0; i < lessons.length; i++) {
    if (
      id &&
      lessons[i].lessonId === id
    ) {
      return lessons[i];
    }
  }

  if (lessons.length > 0) {
    return lessons[0];
  }

  return {
    lessonId: '',
    lessonTitle: '',
    subjectId: ''
  };
}


/**
 * Build assignments for child.
 */
function kidlearnV3_3kaBuildAssignmentsForChild_(
  assignments,
  childId
) {
  var result = [];

  for (var i = 0; i < assignments.length; i++) {
    var row =
      assignments[i];

    if (
      childId &&
      row.childId &&
      row.childId !== childId
    ) {
      continue;
    }

    result.push({
      assignmentId:
        row.assignmentId || row.id || '',
      childId:
        row.childId || '',
      lessonId:
        row.lessonId || '',
      subjectId:
        row.subjectId || '',
      status:
        row.status || '',
      dueDate:
        row.dueDate || '',
      title:
        row.title ||
        row.assignmentTitle ||
        row.lessonTitle ||
        '',
      raw:
        row
    });
  }

  return result;
}


/**
 * Build progress map.
 */
function kidlearnV3_3kaBuildProgressMap_(
  progressRows,
  childId
) {
  var map = {};

  for (var i = 0; i < progressRows.length; i++) {
    var row =
      progressRows[i];

    if (
      childId &&
      row.childId &&
      row.childId !== childId
    ) {
      continue;
    }

    var lessonId =
      row.lessonId || '';

    if (!lessonId) {
      continue;
    }

    map[lessonId] = {
      lessonProgressId:
        row.lessonProgressId || row.id || '',
      lessonId:
        lessonId,
      status:
        row.status || '',
      progressPercent:
        Number(row.progressPercent || row.percentComplete || 0),
      lastStudiedAt:
        row.lastStudiedAt || row.updatedAt || '',
      raw:
        row
    };
  }

  return map;
}


/**
 * Pick daily goal.
 */
function kidlearnV3_3kaPickDailyGoal_(
  dailyGoals,
  childId
) {
  var today =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );

  for (var i = 0; i < dailyGoals.length; i++) {
    var row =
      dailyGoals[i];

    if (
      childId &&
      row.childId &&
      row.childId !== childId
    ) {
      continue;
    }

    if (
      row.goalDate &&
      String(row.goalDate).indexOf(today) >= 0
    ) {
      return {
        dailyGoalId:
          row.dailyGoalId || row.id || '',
        goalDate:
          row.goalDate || today,
        targetMinutes:
          Number(row.targetMinutes || 0),
        completedMinutes:
          Number(row.completedMinutes || 0),
        raw:
          row
      };
    }
  }

  return {
    dailyGoalId: '',
    goalDate: today,
    targetMinutes: 20,
    completedMinutes: 0,
    raw: {}
  };
}


/**
 * Recent sessions.
 */
function kidlearnV3_3kaBuildRecentSessions_(
  sessions,
  childId
) {
  var result = [];

  for (var i = 0; i < sessions.length; i++) {
    var row =
      sessions[i];

    if (
      childId &&
      row.childId &&
      row.childId !== childId
    ) {
      continue;
    }

    result.push({
      studySessionId:
        row.studySessionId || row.id || '',
      childId:
        row.childId || '',
      lessonId:
        row.lessonId || '',
      subjectId:
        row.subjectId || '',
      startedAt:
        row.startedAt || '',
      finishedAt:
        row.finishedAt || '',
      durationSeconds:
        Number(row.durationSeconds || 0),
      status:
        row.status || '',
      raw:
        row
    });
  }

  result.reverse();

  return result.slice(0, 5);
}


/**
 * Attach progress to lessons.
 */
function kidlearnV3_3kaAttachProgressToLessons_(
  lessons,
  progressMap
) {
  var result = [];

  for (var i = 0; i < lessons.length; i++) {
    var lesson =
      lessons[i];

    var progress =
      progressMap[lesson.lessonId] || {
        progressPercent: 0,
        status: ''
      };

    var item = {};

    var keys =
      Object.keys(lesson);

    for (var k = 0; k < keys.length; k++) {
      item[keys[k]] =
        lesson[keys[k]];
    }

    item.progress =
      progress;

    item.progressPercent =
      Number(progress.progressPercent || 0);

    result.push(item);
  }

  return result;
}


/**
 * Empty states.
 */
function kidlearnV3_3kaBuildEmptyStates_(
  subjects,
  lessons,
  assignments
) {
  return {
    noSubjects:
      subjects.length === 0,
    noLessons:
      lessons.length === 0,
    noAssignments:
      assignments.length === 0,
    messages: {
      noSubjects:
        'Chưa có môn học.',
      noLessons:
        'Chưa có bài học cho môn đang chọn.',
      noAssignments:
        'Chưa có assignment.'
    }
  };
}


/**
 * Read sheet objects using app helper or fallback.
 */
function kidlearnV3_3kaReadSheetObjects_(
  sheetName,
  limit
) {
  if (
    typeof kidlearnV3_appReadSheetObjectsV3 === 'function'
  ) {
    var response =
      kidlearnV3_appReadSheetObjectsV3(
        sheetName,
        limit || 500
      );

    if (Array.isArray(response)) {
      return response;
    }

    if (
      response &&
      Array.isArray(response.data)
    ) {
      return response.data;
    }

    if (
      response &&
      Array.isArray(response.items)
    ) {
      return response.items;
    }
  }

  return kidlearnV3_3kaReadSheetObjectsFallback_(
    sheetName,
    limit || 500
  );
}


/**
 * Fallback read sheet.
 */
function kidlearnV3_3kaReadSheetObjectsFallback_(
  sheetName,
  limit
) {
  var spreadsheet =
    kidlearnV3_3kaGetDatabaseSpreadsheet_();

  var sheet =
    kidlearnV3_3kaGetSheet_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return [];
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (
    lastRow < 3 ||
    lastColumn < 1
  ) {
    return [];
  }

  var rowCount =
    Math.min(
      lastRow - 2,
      Number(limit || 500)
    );

  var keys =
    sheet
      .getRange(
        2,
        1,
        1,
        lastColumn
      )
      .getDisplayValues()[0];

  var values =
    sheet
      .getRange(
        3,
        1,
        rowCount,
        lastColumn
      )
      .getDisplayValues();

  var result = [];

  for (var r = 0; r < values.length; r++) {
    var object = {};

    for (var c = 0; c < keys.length; c++) {
      var key =
        String(keys[c] || '').trim();

      if (key) {
        object[key] =
          values[r][c];
      }
    }

    result.push(object);
  }

  return result;
}


/**
 * Check sheets.
 */
function kidlearnV3_3kaCheckSheets_() {
  var errors = [];
  var warnings = [];
  var items = [];

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_3kaGetDatabaseSpreadsheet_();

  } catch (error) {
    errors.push(
      'Không mở được Database V3: ' +
      String(error.message || error)
    );

    return {
      errors: errors,
      warnings: warnings,
      items: items
    };
  }

  for (
    var i = 0;
    i < KIDLEARN_V3_LEARNING_UI_3KA_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_LEARNING_UI_3KA_SHEETS[i];

    var sheet =
      kidlearnV3_3kaGetSheet_(
        spreadsheet,
        sheetName
      );

    if (!sheet) {
      errors.push(
        'Thiếu sheet: ' +
        sheetName
      );

      items.push({
        sheetName: sheetName,
        exists: false
      });

      continue;
    }

    items.push({
      sheetName: sheetName,
      exists: true,
      lastRow: sheet.getLastRow(),
      dataRowCount:
        Math.max(0, sheet.getLastRow() - 2)
    });
  }

  return {
    errors: errors,
    warnings: warnings,
    items: items
  };
}


/**
 * Get database spreadsheet.
 */
function kidlearnV3_3kaGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3kaResolveSpreadsheet_(
      database
    );

  if (!spreadsheet) {
    throw new Error(
      'Không resolve được Spreadsheet object từ Database V3.'
    );
  }

  return spreadsheet;
}


/**
 * Resolve Spreadsheet object.
 */
function kidlearnV3_3kaResolveSpreadsheet_(
  value
) {
  if (!value) {
    return null;
  }

  if (
    typeof value.getSheets === 'function' &&
    typeof value.getId === 'function'
  ) {
    return value;
  }

  if (
    value.spreadsheet &&
    typeof value.spreadsheet.getSheets === 'function'
  ) {
    return value.spreadsheet;
  }

  if (
    value.database &&
    typeof value.database.getSheets === 'function'
  ) {
    return value.database;
  }

  if (
    value.db &&
    typeof value.db.getSheets === 'function'
  ) {
    return value.db;
  }

  if (
    value.spreadsheetObject &&
    typeof value.spreadsheetObject.getSheets === 'function'
  ) {
    return value.spreadsheetObject;
  }

  if (
    value.activeSpreadsheet &&
    typeof value.activeSpreadsheet.getSheets === 'function'
  ) {
    return value.activeSpreadsheet;
  }

  if (value.spreadsheetId) {
    return SpreadsheetApp.openById(
      value.spreadsheetId
    );
  }

  if (value.databaseSpreadsheetId) {
    return SpreadsheetApp.openById(
      value.databaseSpreadsheetId
    );
  }

  if (
    value.id &&
    typeof value.id === 'string'
  ) {
    return SpreadsheetApp.openById(
      value.id
    );
  }

  return null;
}


/**
 * Get exact sheet.
 */
function kidlearnV3_3kaGetSheet_(
  spreadsheet,
  sheetName
) {
  if (
    typeof kidlearnV3_appGetSheetByExactName_ === 'function'
  ) {
    return kidlearnV3_appGetSheetByExactName_(
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


/**
 * Is active.
 */
function kidlearnV3_3kaIsActive_(
  row
) {
  var status =
    String(
      row.status ||
      row.isActive ||
      row.active ||
      ''
    )
      .trim()
      .toUpperCase();

  if (!status) {
    return true;
  }

  if (
    status === 'FALSE' ||
    status === 'NO' ||
    status === 'N' ||
    status === 'INACTIVE' ||
    status === 'DISABLED' ||
    status === '0'
  ) {
    return false;
  }

  return true;
}


/**
 * Check functions.
 */
function kidlearnV3_3kaCheckFunctions_(
  functionNames
) {
  var errors = [];
  var items = [];

  for (var i = 0; i < functionNames.length; i++) {
    var exists = false;

    try {
      exists =
        eval(
          'typeof ' +
          functionNames[i] +
          ' === "function"'
        );
    } catch (error) {
      exists = false;
    }

    items.push({
      name: functionNames[i],
      exists: exists
    });

    if (!exists) {
      errors.push(
        'Thiếu function: ' +
        functionNames[i]
      );
    }
  }

  return {
    errors: errors,
    items: items
  };
}


/**
 * Safe Phase 3J closed.
 */
function kidlearnV3_3kaSafePhase3JClosed_() {
  try {
    var result =
      kidlearnV3_assertPhase3JClosedV3();

    return {
      success: result.success === true,
      message: ''
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
 * Safe Write status.
 */
function kidlearnV3_3kaSafeWriteStatus_() {
  try {
    return kidlearnV3_getSafeWriteLayerStatusV3();
  } catch (error) {
    return {
      success: false,
      mode: '',
      enabled: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Save result.
 *
 * Bản sửa:
 * - Nếu 3K-A đã READY_FOR_3K_B thì các lệnh preview/build/smoke
 *   không được downgrade status về PREVIEWED hoặc SMOKE_TESTED.
 */
function kidlearnV3_3kaSaveResult_(
  result,
  status,
  dateKey
) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_LEARNING_UI_3KA_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_LEARNING_UI_3KA_STATUS.READY_FOR_3K_B &&
    (
      status === KIDLEARN_V3_LEARNING_UI_3KA_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_LEARNING_UI_3KA_STATUS.SMOKE_TESTED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_LEARNING_UI_3KA_STATUS.READY_FOR_3K_B;
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_UI_3KA_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_UI_3KA_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      errors: result.errors || [],
      warnings: result.warnings || [],
      at: new Date().toISOString()
    })
  );
}


/**
 * Read last result.
 */
function kidlearnV3_3kaReadLastResult_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_LEARNING_UI_3KA_KEYS.LAST_RESULT_JSON
      );

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      raw: text
    };
  }
}


/**
 * Normalize request.
 */
function kidlearnV3_3kaNormalizeRequest_(
  request
) {
  if (!request) {
    return {};
  }

  if (typeof request !== 'object') {
    return {
      value: request
    };
  }

  return request;
}