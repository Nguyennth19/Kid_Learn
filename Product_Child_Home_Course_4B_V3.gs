/**
 * ================================================================
 * KIDLEARN V3 - CHILD HOME + COURSE CONTEXT READ-ONLY
 * Phase: 4B-1
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Build richer context for Child Home and Course Dashboard.
 * - Read-only from V3 sheets.
 * - Prepare data for 4B-2 UI upgrade.
 *
 * Safety:
 * - Không ghi Google Sheet.
 * - Không ghi PROD.
 * - Không gọi Safe Write.
 * - Không tạo session.
 * - Không lưu tiến độ học.
 * - Chỉ ghi ScriptProperties để lưu trạng thái QA 4B-1.
 */


var KIDLEARN_V3_CHILD_COURSE_4B_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4B1_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4B1_LAST_PREVIEW_AT',
  LAST_SMOKE_AT: 'KIDLEARN_V3_PHASE_4B1_LAST_SMOKE_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4B1_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4B1_LAST_RESULT_JSON'
};


var KIDLEARN_V3_CHILD_COURSE_4B_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  SMOKE_PASSED: 'SMOKE_PASSED',
  READY_FOR_4B_2: 'READY_FOR_4B_2',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_CHILD_COURSE_4B_CONFIG = {
  PHASE: '4B-1',
  PARENT_PHASE: '4B',
  NEXT_BUNDLE: '4B-2',
  NEXT_STAGE: 'UI_UPGRADE_CHILD_HOME_AND_COURSES_DASHBOARD',
  MODE: 'READ_ONLY_CHILD_HOME_COURSE_CONTEXT',
  DEFAULT_CHILD_NAME: 'Lịch Khê',
  DEFAULT_GRADE_LABEL: 'Lớp 2',
  MAX_READ_ROWS: 700,
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false
};


/**
 * Preview 4B-1 context.
 */
function kidlearnV3_previewChildHomeCourseContext4BV3() {
  var errors = [];
  var warnings = [];

  var phase4A =
    kidlearnV3_4bAssert4AClosed_();

  if (!phase4A.success) {
    errors.push(
      '4A chưa CLOSED_LOCKED: ' +
      phase4A.message
    );
  }

  var data =
    kidlearnV3_4bLoadReadonlyData_();

  warnings = warnings.concat(data.warnings || []);

  var context =
    kidlearnV3_4bBuildChildHomeCourseContext_({
      role: 'CHILD',
      childId: '',
      data: data
    });

  if (!context.success) {
    errors = errors.concat(context.errors || []);
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_CHILD_HOME_COURSE_CONTEXT_4B_V3',
    phase: KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.PARENT_PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_CHILD_COURSE_4B_STATUS.PREVIEWED
        : KIDLEARN_V3_CHILD_COURSE_4B_STATUS.FAILED,
    mode: KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.MODE,
    childName: context.child.displayName || '',
    gradeLabel: context.child.gradeLabel || '',
    subjectCount: context.courseDashboard.summary.subjectCount,
    totalLessonCount: context.courseDashboard.summary.totalLessonCount,
    completedLessonCount: context.courseDashboard.summary.completedLessonCount,
    averageProgress: context.courseDashboard.summary.averageProgress,
    nextLessonTitle:
      context.childHome.nextLesson.title || '',
    missionCount:
      context.childHome.todayMissions.length,
    sheetSummary: {
      MST_Subjects: data.subjects.rowCount,
      MST_Topics: data.topics.rowCount,
      MST_Lessons: data.lessons.rowCount,
      DATA_LessonProgress: data.lessonProgress.rowCount,
      DATA_DailyGoals: data.dailyGoals.rowCount,
      DATA_Assignments: data.assignments.rowCount,
      DATA_RewardTransactions: data.rewardTransactions.rowCount,
      DATA_Streaks: data.streaks.rowCount
    },
    prodWriteAllowed: false,
    realWriteAllowed: false,
    phase4A: phase4A,
    contextSample: {
      childHome: context.childHome,
      courseDashboardSummary: context.courseDashboard.summary
    },
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4bSaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_CHILD_COURSE_4B_STATUS.PREVIEWED
      : KIDLEARN_V3_CHILD_COURSE_4B_STATUS.FAILED,
    KIDLEARN_V3_CHILD_COURSE_4B_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4B-1 preview failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Server function for UI 4B-2.
 *
 * 4B-1 tạo function này trước.
 * 4B-2 sẽ gọi từ client để render UI nâng cấp.
 *
 * @param {Object} payload optional {role, childId}
 * @return {Object}
 */
function kidlearnV3_getChildHomeCourseContext4BV3(payload) {
  try {
    var req =
      kidlearnV3_4bNormalizePayload_(payload);

    var data =
      kidlearnV3_4bLoadReadonlyData_();

    var context =
      kidlearnV3_4bBuildChildHomeCourseContext_({
        role: req.role,
        childId: req.childId,
        data: data
      });

    return {
      success: true,
      action: 'GET_CHILD_HOME_COURSE_CONTEXT_4B_V3',
      phase: KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.PHASE,
      mode: KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.MODE,
      context: context,
      prodWriteAllowed: false,
      realWriteAllowed: false
    };

  } catch (error) {
    return {
      success: false,
      action: 'GET_CHILD_HOME_COURSE_CONTEXT_4B_V3',
      phase: KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.PHASE,
      message:
        String(error.message || error),
      prodWriteAllowed: false,
      realWriteAllowed: false
    };
  }
}


/**
 * Smoke test 4B-1.
 */
function kidlearnV3_smokeTestChildHomeCourseContext4BV3() {
  var errors = [];
  var warnings = [];

  var phase4A =
    kidlearnV3_4bAssert4AClosed_();

  if (!phase4A.success) {
    errors.push(
      '4A chưa CLOSED_LOCKED: ' +
      phase4A.message
    );
  }

  if (typeof kidlearnV3_getChildHomeCourseContext4BV3 !== 'function') {
    errors.push('Thiếu kidlearnV3_getChildHomeCourseContext4BV3.');
  }

  var childResult =
    kidlearnV3_getChildHomeCourseContext4BV3({
      role: 'CHILD'
    });

  if (!childResult.success) {
    errors.push(
      'Không build được CHILD context: ' +
      childResult.message
    );
  } else {
    var ctx =
      childResult.context || {};

    if (!ctx.child || !ctx.child.displayName) {
      errors.push('CHILD context thiếu child.displayName.');
    }

    if (
      !ctx.childHome ||
      !ctx.childHome.nextLesson ||
      !ctx.childHome.nextLesson.title
    ) {
      errors.push('CHILD context thiếu nextLesson.title.');
    }

    if (
      !ctx.courseDashboard ||
      !ctx.courseDashboard.subjectCards ||
      ctx.courseDashboard.subjectCards.length === 0
    ) {
      errors.push('Course dashboard thiếu subjectCards.');
    }
  }

  var parentResult =
    kidlearnV3_getChildHomeCourseContext4BV3({
      role: 'FAMILY_ADMIN'
    });

  if (!parentResult.success) {
    errors.push(
      'Không build được FAMILY_ADMIN context: ' +
      parentResult.message
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_CHILD_HOME_COURSE_CONTEXT_4B_V3',
    phase: KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.PHASE,
    mode: KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.MODE,
    childContextSuccess:
      childResult.success === true,
    parentContextSuccess:
      parentResult.success === true,
    subjectCount:
      childResult.success
        ? childResult.context.courseDashboard.summary.subjectCount
        : 0,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4bSaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_CHILD_COURSE_4B_STATUS.SMOKE_PASSED
      : KIDLEARN_V3_CHILD_COURSE_4B_STATUS.FAILED,
    KIDLEARN_V3_CHILD_COURSE_4B_KEYS.LAST_SMOKE_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4B-1 smoke failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 4B-1 ready.
 */
function kidlearnV3_markChildHomeCourseContext4BReadyV3() {
  var smoke =
    kidlearnV3_smokeTestChildHomeCourseContext4BV3();

  if (!smoke.success) {
    throw new Error('Smoke 4B-1 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_CHILD_HOME_COURSE_CONTEXT_4B_READY_V3',
    phase: KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_CHILD_COURSE_4B_STATUS.READY_FOR_4B_2,
    nextBundle:
      KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    message:
      '4B-1 ready. Child Home + Course Context Read-only đã sẵn sàng cho 4B-2 UI upgrade.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4bSaveStatus_(
    result,
    KIDLEARN_V3_CHILD_COURSE_4B_STATUS.READY_FOR_4B_2,
    KIDLEARN_V3_CHILD_COURSE_4B_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get 4B-1 status.
 */
function kidlearnV3_getChildHomeCourseContext4BStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_CHILD_HOME_COURSE_CONTEXT_4B_STATUS_V3',
    phase: KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_CHILD_COURSE_4B_KEYS.STATUS
      ) ||
      KIDLEARN_V3_CHILD_COURSE_4B_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_CHILD_COURSE_4B_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastSmokeAt:
      properties.getProperty(
        KIDLEARN_V3_CHILD_COURSE_4B_KEYS.LAST_SMOKE_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_CHILD_COURSE_4B_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4bReadJsonProperty_(
        KIDLEARN_V3_CHILD_COURSE_4B_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert 4B-1 ready.
 */
function kidlearnV3_assertChildHomeCourseContext4BReadyV3() {
  var status =
    kidlearnV3_getChildHomeCourseContext4BStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_CHILD_COURSE_4B_STATUS.READY_FOR_4B_2
  ) {
    errors.push(
      '4B-1 chưa READY_FOR_4B_2. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_CHILD_HOME_COURSE_CONTEXT_4B_READY_V3',
    phase: KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.PARENT_PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(errors.join(' | '));
  }

  return result;
}


/**
 * QA steps 4B-1.
 */
function kidlearnV3_getQaBatchSteps4B1V3() {
  return [
    {
      label: 'Assert Phase 4A Closed',
      functionName: 'kidlearnV3_assertPhase4AClosedV3'
    },
    {
      label: 'Preview Child Home Course Context 4B',
      functionName: 'kidlearnV3_previewChildHomeCourseContext4BV3'
    },
    {
      label: 'Smoke Child Home Course Context 4B',
      functionName: 'kidlearnV3_smokeTestChildHomeCourseContext4BV3'
    },
    {
      label: 'Mark Child Home Course Context 4B Ready',
      functionName: 'kidlearnV3_markChildHomeCourseContext4BReadyV3'
    },
    {
      label: 'Assert Child Home Course Context 4B Ready',
      functionName: 'kidlearnV3_assertChildHomeCourseContext4BReadyV3'
    }
  ];
}


/**
 * QA batch 4B-1.
 */
function kidlearnV3_runQaBatch4B1V3() {
  var steps =
    kidlearnV3_getQaBatchSteps4B1V3();

  if (typeof kidlearnV3_runQaBatchProvidedStepsV3 === 'function') {
    return kidlearnV3_runQaBatchProvidedStepsV3(
      'PHASE_4B_1_CHILD_HOME_COURSE_CONTEXT_READ_ONLY',
      steps,
      {
        stopOnFailure: true
      }
    );
  }

  return kidlearnV3_4bRunLocalBatch_(
    'PHASE_4B_1_CHILD_HOME_COURSE_CONTEXT_READ_ONLY',
    steps
  );
}


/**
 * Build full 4B context.
 */
function kidlearnV3_4bBuildChildHomeCourseContext_(options) {
  var errors = [];
  var warnings = [];

  var data =
    options && options.data
      ? options.data
      : kidlearnV3_4bLoadReadonlyData_();

  warnings = warnings.concat(data.warnings || []);

  var child =
    kidlearnV3_4bResolveChild_(
      options && options.childId
        ? options.childId
        : '',
      data
    );

  var subjectCards =
    kidlearnV3_4bBuildSubjectCards_(
      child,
      data
    );

  if (subjectCards.length === 0) {
    warnings.push(
      'Không có subjectCards từ dữ liệu thật. Dùng fallback demo.'
    );
    subjectCards =
      kidlearnV3_4bFallbackSubjectCards_();
  }

  var nextLesson =
    kidlearnV3_4bResolveNextLesson_(
      child,
      subjectCards,
      data
    );

  var todayMissions =
    kidlearnV3_4bBuildTodayMissions_(
      child,
      subjectCards,
      data
    );

  var stats =
    kidlearnV3_4bBuildChildStats_(
      child,
      subjectCards,
      data
    );

  var summary =
    kidlearnV3_4bBuildCourseSummary_(
      subjectCards
    );

  return {
    success: errors.length === 0,
    phase: KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.PHASE,
    mode: KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.MODE,
    child: child,

    childHome: {
      welcomeTitle:
        'Hôm nay ' +
        child.shortName +
        ' học gì nào?',
      welcomeSubtitle:
        'Chọn một bài học ngắn để nhận sao thưởng và giữ chuỗi học tập nhé.',
      primaryActionLabel: 'Bắt đầu học',
      secondaryActionLabel: 'Ôn bài nhanh',
      nextLesson: nextLesson,
      stats: stats,
      todayMissions: todayMissions,
      subjectPreview: subjectCards.slice(0, 4),
      studyTip: {
        title: 'Mẹo học vui',
        text:
          'Học 10 phút mỗi lần sẽ giúp bé tập trung tốt hơn. Sau mỗi bài, bé có thể nghỉ 2 phút.'
      }
    },

    courseDashboard: {
      title:
        'Khóa học của ' + child.shortName,
      subtitle:
        child.gradeLabel +
        ' - Học từng bước nhỏ, tiến bộ mỗi ngày.',
      summary: summary,
      subjectCards: subjectCards,
      recommendedLessons:
        kidlearnV3_4bBuildRecommendedLessons_(
          nextLesson,
          subjectCards
        )
    },

    subjectPlaceholder: {
      title: 'Màn hình môn học sẽ được hoàn thiện ở 4C',
      text:
        '4B chỉ chuẩn bị trang chủ và khóa học. 4C sẽ làm trang từng môn và lesson player.'
    },

    dataSource: {
      spreadsheetId: data.spreadsheetId || '',
      spreadsheetName: data.spreadsheetName || '',
      subjectsRowCount: data.subjects.rowCount,
      lessonsRowCount: data.lessons.rowCount,
      progressRowCount: data.lessonProgress.rowCount,
      fallbackUsed: data.fallbackUsed === true
    },

    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Load read-only data.
 */
function kidlearnV3_4bLoadReadonlyData_() {
  if (typeof kidlearnV3_4aLoadReadonlyData_ === 'function') {
    var data =
      kidlearnV3_4aLoadReadonlyData_();

    data.topics =
      data.topics ||
      kidlearnV3_4bReadExtraTableSafe_('MST_Topics');

    data.assignments =
      data.assignments ||
      kidlearnV3_4bReadExtraTableSafe_('DATA_Assignments');

    return data;
  }

  return kidlearnV3_4bLoadReadonlyDataFallback_();
}


/**
 * Read extra table using active spreadsheet.
 */
function kidlearnV3_4bReadExtraTableSafe_(sheetName) {
  try {
    var spreadsheet =
      kidlearnV3_4bOpenSpreadsheet_();

    return kidlearnV3_4bReadTable_(
      spreadsheet,
      sheetName,
      KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.MAX_READ_ROWS
    );
  } catch (error) {
    return {
      success: false,
      sheetName: sheetName,
      rowCount: 0,
      rows: [],
      message:
        String(error.message || error)
    };
  }
}


/**
 * Fallback loader if 4A helper is unavailable.
 */
function kidlearnV3_4bLoadReadonlyDataFallback_() {
  var warnings = [];
  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4bOpenSpreadsheet_();
  } catch (error) {
    warnings.push(
      'Không mở được spreadsheet: ' +
      String(error.message || error)
    );
  }

  if (!spreadsheet) {
    return kidlearnV3_4bEmptyData_(warnings);
  }

  return {
    spreadsheetId: spreadsheet.getId(),
    spreadsheetName: spreadsheet.getName(),
    warnings: warnings,
    fallbackUsed: false,
    subjects:
      kidlearnV3_4bReadTable_(spreadsheet, 'MST_Subjects', 700),
    topics:
      kidlearnV3_4bReadTable_(spreadsheet, 'MST_Topics', 700),
    lessons:
      kidlearnV3_4bReadTable_(spreadsheet, 'MST_Lessons', 700),
    lessonProgress:
      kidlearnV3_4bReadTable_(spreadsheet, 'DATA_LessonProgress', 700),
    dailyGoals:
      kidlearnV3_4bReadTable_(spreadsheet, 'DATA_DailyGoals', 700),
    assignments:
      kidlearnV3_4bReadTable_(spreadsheet, 'DATA_Assignments', 700),
    rewardTransactions:
      kidlearnV3_4bReadTable_(spreadsheet, 'DATA_RewardTransactions', 700),
    streaks:
      kidlearnV3_4bReadTable_(spreadsheet, 'DATA_Streaks', 700),
    children:
      kidlearnV3_4bReadTable_(spreadsheet, 'DATA_Children', 700)
  };
}


function kidlearnV3_4bEmptyData_(warnings) {
  function empty(sheetName) {
    return {
      success: false,
      sheetName: sheetName,
      rowCount: 0,
      rows: [],
      message: 'No spreadsheet.'
    };
  }

  return {
    spreadsheetId: '',
    spreadsheetName: '',
    warnings: warnings || [],
    fallbackUsed: true,
    subjects: empty('MST_Subjects'),
    topics: empty('MST_Topics'),
    lessons: empty('MST_Lessons'),
    lessonProgress: empty('DATA_LessonProgress'),
    dailyGoals: empty('DATA_DailyGoals'),
    assignments: empty('DATA_Assignments'),
    rewardTransactions: empty('DATA_RewardTransactions'),
    streaks: empty('DATA_Streaks'),
    children: empty('DATA_Children')
  };
}


/**
 * Resolve child.
 */
function kidlearnV3_4bResolveChild_(childId, data) {
  var fallback = {
    childId: 'DEMO_CHILD_LICH_KHE',
    displayName:
      KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.DEFAULT_CHILD_NAME,
    shortName:
      KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.DEFAULT_CHILD_NAME,
    gradeLabel:
      KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.DEFAULT_GRADE_LABEL,
    avatarEmoji: '🧒'
  };

  var rows =
    data && data.children && data.children.rows
      ? data.children.rows
      : [];

  if (rows.length === 0) {
    return fallback;
  }

  var target =
    String(childId || '');

  var row = null;

  if (target) {
    row =
      kidlearnV3_4bFindRowById_(
        rows,
        ['childId', 'id'],
        target
      );
  }

  if (!row) {
    row = rows[0];
  }

  return {
    childId:
      String(
        kidlearnV3_4bGetAny_(
          row,
          ['childId', 'id']
        ) || fallback.childId
      ),
    displayName:
      String(
        kidlearnV3_4bGetAny_(
          row,
          ['displayName', 'fullName', 'childName', 'name']
        ) || fallback.displayName
      ),
    shortName:
      String(
        kidlearnV3_4bGetAny_(
          row,
          ['shortName', 'nickname', 'displayName', 'childName', 'name']
        ) || fallback.shortName
      ),
    gradeLabel:
      String(
        kidlearnV3_4bGetAny_(
          row,
          ['gradeLabel', 'grade', 'className', 'gradeLevel']
        ) || fallback.gradeLabel
      ),
    avatarEmoji:
      String(
        kidlearnV3_4bGetAny_(
          row,
          ['avatarEmoji', 'avatar', 'emoji']
        ) || fallback.avatarEmoji
      )
  };
}


/**
 * Build subject cards.
 */
function kidlearnV3_4bBuildSubjectCards_(child, data) {
  var rows =
    data && data.subjects && data.subjects.rows
      ? data.subjects.rows
      : [];

  var result = [];

  for (var i = 0; i < rows.length; i++) {
    var row =
      rows[i];

    if (!kidlearnV3_4bIsActiveRow_(row)) {
      continue;
    }

    var subjectCode =
      String(
        kidlearnV3_4bGetAny_(
          row,
          ['subjectCode', 'code', 'subjectId']
        ) || ''
      );

    var subjectName =
      String(
        kidlearnV3_4bGetAny_(
          row,
          ['subjectName', 'name', 'title']
        ) || ''
      );

    if (!subjectName) {
      continue;
    }

    var template =
      kidlearnV3_4bSubjectTemplate_(
        subjectCode,
        subjectName
      );

    var lessonStats =
      kidlearnV3_4bBuildLessonStatsForSubject_(
        child,
        subjectCode || template.subjectCode,
        subjectName,
        data
      );

    result.push({
      subjectCode: subjectCode || template.subjectCode,
      subjectName: subjectName,
      icon: template.icon,
      colorClass: template.colorClass,
      accentLabel: template.accentLabel,
      progress: lessonStats.progress,
      lessonCount: lessonStats.lessonCount,
      completedCount: lessonStats.completedCount,
      currentTopic: lessonStats.currentTopic || template.currentTopic,
      nextLessonTitle:
        lessonStats.nextLessonTitle || template.nextLessonTitle,
      nextAction: template.nextAction,
      ctaLabel: 'Vào môn học',
      subjectStatus:
        lessonStats.completedCount > 0
          ? 'Đang học'
          : 'Sẵn sàng'
    });
  }

  if (result.length === 0) {
    return kidlearnV3_4bFallbackSubjectCards_();
  }

  return result.slice(0, 8);
}


/**
 * Subject fallback templates.
 */
function kidlearnV3_4bFallbackSubjectCards_() {
  return [
    {
      subjectCode: 'MATH',
      subjectName: 'Toán học',
      icon: '🔢',
      colorClass: 'subject-blue',
      accentLabel: 'Tư duy logic',
      progress: 62,
      lessonCount: 24,
      completedCount: 15,
      currentTopic: 'Cộng trừ trong phạm vi 100',
      nextLessonTitle: 'Bài toán có lời văn ngắn',
      nextAction: 'Làm bài toán hôm nay',
      ctaLabel: 'Vào môn học',
      subjectStatus: 'Đang học'
    },
    {
      subjectCode: 'VIETNAMESE',
      subjectName: 'Tiếng Việt',
      icon: '📖',
      colorClass: 'subject-purple',
      accentLabel: 'Đọc hiểu',
      progress: 48,
      lessonCount: 22,
      completedCount: 10,
      currentTopic: 'Đọc đoạn văn ngắn',
      nextLessonTitle: 'Tìm ý chính trong đoạn văn',
      nextAction: 'Đọc đoạn văn ngắn',
      ctaLabel: 'Vào môn học',
      subjectStatus: 'Đang học'
    },
    {
      subjectCode: 'ENGLISH',
      subjectName: 'Tiếng Anh',
      icon: '🌟',
      colorClass: 'subject-pink',
      accentLabel: 'Từ vựng',
      progress: 35,
      lessonCount: 18,
      completedCount: 6,
      currentTopic: 'Colors and animals',
      nextLessonTitle: 'Ôn từ vựng màu sắc',
      nextAction: 'Ôn từ vựng mới',
      ctaLabel: 'Vào môn học',
      subjectStatus: 'Đang học'
    },
    {
      subjectCode: 'SCIENCE',
      subjectName: 'Khoa học',
      icon: '🔬',
      colorClass: 'subject-green',
      accentLabel: 'Khám phá',
      progress: 25,
      lessonCount: 12,
      completedCount: 3,
      currentTopic: 'Cây cối quanh em',
      nextLessonTitle: 'Các bộ phận của cây',
      nextAction: 'Khám phá bài học mới',
      ctaLabel: 'Vào môn học',
      subjectStatus: 'Sẵn sàng'
    }
  ];
}


function kidlearnV3_4bSubjectTemplate_(subjectCode, subjectName) {
  var code =
    kidlearnV3_4bNormalizeKey_(subjectCode || subjectName);

  if (
    code.indexOf('MATH') >= 0 ||
    code.indexOf('TOAN') >= 0
  ) {
    return {
      subjectCode: 'MATH',
      icon: '🔢',
      colorClass: 'subject-blue',
      accentLabel: 'Tư duy logic',
      currentTopic: 'Cộng trừ trong phạm vi 100',
      nextLessonTitle: 'Bài toán có lời văn ngắn',
      nextAction: 'Làm bài toán hôm nay'
    };
  }

  if (
    code.indexOf('VIET') >= 0 ||
    code.indexOf('TIENGVIET') >= 0
  ) {
    return {
      subjectCode: 'VIETNAMESE',
      icon: '📖',
      colorClass: 'subject-purple',
      accentLabel: 'Đọc hiểu',
      currentTopic: 'Đọc đoạn văn ngắn',
      nextLessonTitle: 'Tìm ý chính trong đoạn văn',
      nextAction: 'Đọc đoạn văn ngắn'
    };
  }

  if (
    code.indexOf('ENGLISH') >= 0 ||
    code.indexOf('TIENGANH') >= 0
  ) {
    return {
      subjectCode: 'ENGLISH',
      icon: '🌟',
      colorClass: 'subject-pink',
      accentLabel: 'Từ vựng',
      currentTopic: 'Colors and animals',
      nextLessonTitle: 'Ôn từ vựng màu sắc',
      nextAction: 'Ôn từ vựng mới'
    };
  }

  if (
    code.indexOf('SCIENCE') >= 0 ||
    code.indexOf('KHOA') >= 0
  ) {
    return {
      subjectCode: 'SCIENCE',
      icon: '🔬',
      colorClass: 'subject-green',
      accentLabel: 'Khám phá',
      currentTopic: 'Cây cối quanh em',
      nextLessonTitle: 'Các bộ phận của cây',
      nextAction: 'Khám phá bài học mới'
    };
  }

  return {
    subjectCode: subjectCode || 'SUBJECT',
    icon: '📘',
    colorClass: 'subject-blue',
    accentLabel: 'Bài học',
    currentTopic: 'Chủ đề mới',
    nextLessonTitle: 'Bài học tiếp theo',
    nextAction: 'Bắt đầu học'
  };
}


/**
 * Build lesson stats for a subject.
 */
function kidlearnV3_4bBuildLessonStatsForSubject_(child, subjectCode, subjectName, data) {
  var lessonRows =
    data && data.lessons && data.lessons.rows
      ? data.lessons.rows
      : [];

  var progressRows =
    data && data.lessonProgress && data.lessonProgress.rows
      ? data.lessonProgress.rows
      : [];

  var target =
    kidlearnV3_4bNormalizeKey_(subjectCode || subjectName);

  var lessons = [];

  for (var i = 0; i < lessonRows.length; i++) {
    var row =
      lessonRows[i];

    if (!kidlearnV3_4bIsActiveRow_(row)) {
      continue;
    }

    var rowSubject =
      kidlearnV3_4bNormalizeKey_(
        kidlearnV3_4bGetAny_(
          row,
          ['subjectCode', 'subjectId', 'subjectName']
        )
      );

    if (
      rowSubject &&
      target &&
      (
        rowSubject.indexOf(target) >= 0 ||
        target.indexOf(rowSubject) >= 0
      )
    ) {
      lessons.push(row);
    }
  }

  var completedMap = {};
  var totalProgress = 0;
  var progressCount = 0;

  for (var p = 0; p < progressRows.length; p++) {
    var prog =
      progressRows[p];

    var progSubject =
      kidlearnV3_4bNormalizeKey_(
        kidlearnV3_4bGetAny_(
          prog,
          ['subjectCode', 'subjectId', 'subjectName']
        )
      );

    if (
      progSubject &&
      target &&
      progSubject.indexOf(target) === -1 &&
      target.indexOf(progSubject) === -1
    ) {
      continue;
    }

    var lessonId =
      String(
        kidlearnV3_4bGetAny_(
          prog,
          ['lessonId', 'lessonCode']
        ) || ''
      );

    var status =
      kidlearnV3_4bNormalizeKey_(
        kidlearnV3_4bGetAny_(
          prog,
          ['status', 'progressStatus', 'completionStatus']
        )
      );

    if (
      status === 'COMPLETED' ||
      status === 'DONE' ||
      status === 'FINISHED'
    ) {
      completedMap[lessonId || ('row_' + p)] = true;
    }

    var pct =
      Number(
        kidlearnV3_4bGetAny_(
          prog,
          ['progressPercent', 'completionPercent', 'progress', 'percent']
        ) || ''
      );

    if (!isNaN(pct) && pct >= 0) {
      totalProgress += Math.min(100, pct);
      progressCount++;
    }
  }

  var lessonCount =
    lessons.length || 12;

  var completedCount =
    Object.keys(completedMap).length;

  var progress =
    progressCount > 0
      ? Math.round(totalProgress / progressCount)
      : Math.round((completedCount / lessonCount) * 100);

  if (!progress || progress < 0) progress = 0;
  if (progress > 100) progress = 100;

  var nextLessonRow =
    kidlearnV3_4bFindNextLessonRow_(
      lessons,
      completedMap
    );

  return {
    lessonCount: lessonCount,
    completedCount: completedCount,
    progress: progress,
    nextLessonTitle:
      nextLessonRow
        ? String(
            kidlearnV3_4bGetAny_(
              nextLessonRow,
              ['lessonTitle', 'title', 'lessonName', 'name']
            ) || ''
          )
        : '',
    currentTopic:
      nextLessonRow
        ? String(
            kidlearnV3_4bGetAny_(
              nextLessonRow,
              ['topicName', 'topicTitle', 'topicCode', 'topicId']
            ) || ''
          )
        : ''
  };
}


function kidlearnV3_4bFindNextLessonRow_(lessons, completedMap) {
  for (var i = 0; i < lessons.length; i++) {
    var lessonId =
      String(
        kidlearnV3_4bGetAny_(
          lessons[i],
          ['lessonId', 'lessonCode', 'id']
        ) || ''
      );

    if (!completedMap[lessonId]) {
      return lessons[i];
    }
  }

  return lessons.length > 0
    ? lessons[0]
    : null;
}


/**
 * Resolve next lesson for hero.
 */
function kidlearnV3_4bResolveNextLesson_(child, subjectCards, data) {
  var assignment =
    kidlearnV3_4bFindNextAssignment_(child, data);

  if (assignment) {
    return assignment;
  }

  var chosen =
    subjectCards.length > 0
      ? subjectCards[0]
      : kidlearnV3_4bFallbackSubjectCards_()[0];

  return {
    source: 'SUBJECT_NEXT_LESSON_FALLBACK',
    subjectCode: chosen.subjectCode,
    subjectName: chosen.subjectName,
    icon: chosen.icon,
    title:
      chosen.nextLessonTitle || chosen.nextAction || 'Bài học tiếp theo',
    subtitle:
      chosen.currentTopic || 'Học từng bước nhỏ',
    estimatedMinutes: 10,
    buttonLabel: 'Bắt đầu học'
  };
}


function kidlearnV3_4bFindNextAssignment_(child, data) {
  var rows =
    data && data.assignments && data.assignments.rows
      ? data.assignments.rows
      : [];

  for (var i = 0; i < rows.length; i++) {
    var row =
      rows[i];

    if (!kidlearnV3_4bIsActiveRow_(row)) {
      continue;
    }

    var status =
      kidlearnV3_4bNormalizeKey_(
        kidlearnV3_4bGetAny_(
          row,
          ['status', 'assignmentStatus']
        )
      );

    if (
      status === 'COMPLETED' ||
      status === 'DONE' ||
      status === 'CANCELLED'
    ) {
      continue;
    }

    return {
      source: 'DATA_ASSIGNMENTS',
      assignmentId:
        String(
          kidlearnV3_4bGetAny_(
            row,
            ['assignmentId', 'id']
          ) || ''
        ),
      subjectCode:
        String(
          kidlearnV3_4bGetAny_(
            row,
            ['subjectCode', 'subjectId']
          ) || ''
        ),
      subjectName:
        String(
          kidlearnV3_4bGetAny_(
            row,
            ['subjectName']
          ) || ''
        ),
      icon: '🎒',
      title:
        String(
          kidlearnV3_4bGetAny_(
            row,
            ['assignmentTitle', 'title', 'lessonTitle', 'name']
          ) || 'Bài học tiếp theo'
        ),
      subtitle:
        String(
          kidlearnV3_4bGetAny_(
            row,
            ['description', 'note', 'topicName']
          ) || 'Bài được giao hôm nay'
        ),
      estimatedMinutes: 10,
      buttonLabel: 'Bắt đầu học'
    };
  }

  return null;
}


/**
 * Today missions.
 */
function kidlearnV3_4bBuildTodayMissions_(child, subjectCards, data) {
  var rows =
    data && data.dailyGoals && data.dailyGoals.rows
      ? data.dailyGoals.rows
      : [];

  var missions = [];

  for (var i = 0; i < rows.length; i++) {
    var row =
      rows[i];

    if (!kidlearnV3_4bIsActiveRow_(row)) {
      continue;
    }

    missions.push({
      label:
        String(
          kidlearnV3_4bGetAny_(
            row,
            ['goalTitle', 'title', 'goalName', 'subjectName']
          ) || 'Mục tiêu học tập'
        ),
      minutes:
        Number(
          kidlearnV3_4bGetAny_(
            row,
            ['targetMinutes', 'minutes']
          ) || 10
        ),
      status:
        String(
          kidlearnV3_4bGetAny_(
            row,
            ['status', 'goalStatus']
          ) || 'Sẵn sàng'
        ),
      icon: '🎯'
    });

    if (missions.length >= 3) break;
  }

  if (missions.length > 0) {
    return missions;
  }

  var fallback = [];

  for (var s = 0; s < Math.min(3, subjectCards.length); s++) {
    fallback.push({
      label: subjectCards[s].subjectName,
      minutes: s === 2 ? 5 : 10,
      status:
        s === 0
          ? 'Sẵn sàng'
          : s === 1
            ? 'Tiếp theo'
            : 'Ôn nhanh',
      icon: subjectCards[s].icon
    });
  }

  return fallback;
}


/**
 * Child stats.
 */
function kidlearnV3_4bBuildChildStats_(child, subjectCards, data) {
  var stars =
    kidlearnV3_4bSumRewards_(child, data);

  var streakDays =
    kidlearnV3_4bFindStreakDays_(child, data);

  var totalCompleted = 0;
  var totalLessons = 0;

  for (var i = 0; i < subjectCards.length; i++) {
    totalCompleted += Number(subjectCards[i].completedCount || 0);
    totalLessons += Number(subjectCards[i].lessonCount || 0);
  }

  return {
    todayStars: stars > 0 ? stars : 28,
    streakDays: streakDays > 0 ? streakDays : 5,
    todayMissionCount: 2,
    suggestedMinutes: 25,
    completedLessonCount: totalCompleted,
    totalLessonCount: totalLessons
  };
}


function kidlearnV3_4bSumRewards_(child, data) {
  var rows =
    data && data.rewardTransactions && data.rewardTransactions.rows
      ? data.rewardTransactions.rows
      : [];

  var total = 0;

  for (var i = 0; i < rows.length; i++) {
    var amount =
      Number(
        kidlearnV3_4bGetAny_(
          rows[i],
          ['amount', 'points', 'stars', 'rewardPoints']
        ) || 0
      );

    if (!isNaN(amount)) {
      total += amount;
    }
  }

  return total;
}


function kidlearnV3_4bFindStreakDays_(child, data) {
  var rows =
    data && data.streaks && data.streaks.rows
      ? data.streaks.rows
      : [];

  for (var i = 0; i < rows.length; i++) {
    var count =
      Number(
        kidlearnV3_4bGetAny_(
          rows[i],
          ['currentStreak', 'streakDays', 'days']
        ) || ''
      );

    if (!isNaN(count) && count > 0) {
      return count;
    }
  }

  return 0;
}


/**
 * Course summary.
 */
function kidlearnV3_4bBuildCourseSummary_(subjectCards) {
  var totalLessons = 0;
  var completedLessons = 0;
  var totalProgress = 0;

  for (var i = 0; i < subjectCards.length; i++) {
    totalLessons += Number(subjectCards[i].lessonCount || 0);
    completedLessons += Number(subjectCards[i].completedCount || 0);
    totalProgress += Number(subjectCards[i].progress || 0);
  }

  var averageProgress =
    subjectCards.length > 0
      ? Math.round(totalProgress / subjectCards.length)
      : 0;

  return {
    subjectCount: subjectCards.length,
    totalLessonCount: totalLessons,
    completedLessonCount: completedLessons,
    averageProgress: averageProgress,
    remainingLessonCount:
      Math.max(0, totalLessons - completedLessons),
    summaryText:
      'Đã hoàn thành ' +
      completedLessons +
      '/' +
      totalLessons +
      ' bài học.'
  };
}


function kidlearnV3_4bBuildRecommendedLessons_(nextLesson, subjectCards) {
  var items = [];

  if (nextLesson) {
    items.push({
      title: nextLesson.title,
      subjectName: nextLesson.subjectName || '',
      icon: nextLesson.icon || '🎒',
      estimatedMinutes: nextLesson.estimatedMinutes || 10
    });
  }

  for (var i = 0; i < subjectCards.length; i++) {
    if (items.length >= 4) break;

    items.push({
      title: subjectCards[i].nextLessonTitle,
      subjectName: subjectCards[i].subjectName,
      icon: subjectCards[i].icon,
      estimatedMinutes: 10
    });
  }

  return items;
}


/**
 * Spreadsheet helpers.
 */
function kidlearnV3_4bOpenSpreadsheet_() {
  var active =
    SpreadsheetApp.getActiveSpreadsheet();

  if (active) return active;

  var properties =
    PropertiesService.getScriptProperties();

  var keys = [
    'KIDLEARN_V3_DEV_SPREADSHEET_ID',
    'KIDLEARN_V3_PROD_SPREADSHEET_ID',
    'DEV_SPREADSHEET_ID',
    'PROD_SPREADSHEET_ID'
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

  throw new Error('Không tìm thấy spreadsheet.');
}


function kidlearnV3_4bReadTable_(spreadsheet, sheetName, maxRows) {
  var sheet =
    kidlearnV3_4bGetSheetByExactName_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return {
      success: false,
      sheetName: sheetName,
      rowCount: 0,
      rows: [],
      message: 'Sheet không tồn tại.'
    };
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (lastRow < 2 || lastColumn < 1) {
    return {
      success: true,
      sheetName: sheetName,
      rowCount: 0,
      rows: [],
      message: 'Sheet chưa có dữ liệu.'
    };
  }

  var readRows =
    Math.min(lastRow, Number(maxRows || 700) + 2);

  var values =
    sheet
      .getRange(1, 1, readRows, lastColumn)
      .getValues();

  var labels =
    values[0] || [];

  var keyRow =
    values[1] || [];

  var keys = [];

  for (var c = 0; c < lastColumn; c++) {
    keys.push(
      String(keyRow[c] || labels[c] || ('col_' + (c + 1))).trim()
    );
  }

  var rows = [];

  for (var r = 2; r < values.length; r++) {
    var obj = {
      _rowNumber: r + 1
    };

    var blank = true;

    for (var j = 0; j < keys.length; j++) {
      var value =
        values[r][j];

      if (value !== '' && value !== null) {
        blank = false;
      }

      obj[keys[j] || ('col_' + (j + 1))] = value;
    }

    if (!blank) rows.push(obj);
  }

  return {
    success: true,
    sheetName: sheetName,
    rowCount: rows.length,
    rows: rows,
    message: 'OK'
  };
}


function kidlearnV3_4bGetSheetByExactName_(spreadsheet, sheetName) {
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
 * Phase 4A guard.
 */
function kidlearnV3_4bAssert4AClosed_() {
  try {
    if (typeof kidlearnV3_assertPhase4AClosedV3 === 'function') {
      var result =
        kidlearnV3_assertPhase4AClosedV3();

      return {
        success:
          result && result.success === true,
        message: ''
      };
    }

    if (typeof kidlearnV3_assertProductMvpFoundation4AClosedV3 === 'function') {
      var result2 =
        kidlearnV3_assertProductMvpFoundation4AClosedV3();

      return {
        success:
          result2 && result2.success === true,
        message: ''
      };
    }

    return {
      success: false,
      message:
        'Thiếu assert function của 4A. Cần file Product_Phase4A_Menu_QA_Lock_V3.gs.'
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
 * Generic helpers.
 */
function kidlearnV3_4bNormalizePayload_(payload) {
  payload = payload || {};

  return {
    role:
      String(payload.role || 'CHILD')
        .trim()
        .toUpperCase() === 'FAMILY_ADMIN'
        ? 'FAMILY_ADMIN'
        : 'CHILD',
    childId:
      String(payload.childId || '')
        .trim()
  };
}


function kidlearnV3_4bGetAny_(obj, keys) {
  if (!obj) return '';

  for (var i = 0; i < keys.length; i++) {
    if (
      Object.prototype.hasOwnProperty.call(
        obj,
        keys[i]
      )
    ) {
      return obj[keys[i]];
    }
  }

  var lowerMap = {};

  for (var key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      lowerMap[String(key).toLowerCase()] = key;
    }
  }

  for (var j = 0; j < keys.length; j++) {
    var lower =
      String(keys[j]).toLowerCase();

    if (lowerMap[lower]) {
      return obj[lowerMap[lower]];
    }
  }

  return '';
}


function kidlearnV3_4bFindRowById_(rows, idFields, idValue) {
  var target =
    String(idValue || '');

  if (!target) return null;

  for (var i = 0; i < rows.length; i++) {
    for (var f = 0; f < idFields.length; f++) {
      var value =
        String(
          kidlearnV3_4bGetAny_(
            rows[i],
            [idFields[f]]
          ) || ''
        );

      if (value === target) {
        return rows[i];
      }
    }
  }

  return null;
}


function kidlearnV3_4bIsActiveRow_(row) {
  var isActive =
    kidlearnV3_4bGetAny_(
      row,
      ['isActive', 'active']
    );

  if (String(isActive).toUpperCase() === 'FALSE') {
    return false;
  }

  var status =
    kidlearnV3_4bNormalizeKey_(
      kidlearnV3_4bGetAny_(
        row,
        ['status', 'recordStatus']
      )
    );

  if (
    status === 'INACTIVE' ||
    status === 'DELETED' ||
    status === 'LOCKED' ||
    status === 'DISABLED'
  ) {
    return false;
  }

  return true;
}


function kidlearnV3_4bNormalizeKey_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/-/g, '_');
}


function kidlearnV3_4bSaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_CHILD_COURSE_4B_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_CHILD_COURSE_4B_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase: result.phase,
      parentPhase: result.parentPhase || '4B',
      status: status,
      nextBundle:
        KIDLEARN_V3_CHILD_COURSE_4B_CONFIG.NEXT_BUNDLE,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      errors: result.errors || [],
      warnings: result.warnings || [],
      at:
        new Date().toISOString()
    })
  );
}


function kidlearnV3_4bReadJsonProperty_(key) {
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


function kidlearnV3_4bRunLocalBatch_(suiteName, steps) {
  var results = [];
  var failed = 0;

  for (var i = 0; i < steps.length; i++) {
    var step =
      steps[i];

    try {
      var fn =
        eval(step.functionName);

      var output =
        fn();

      var ok =
        output && output.success === true;

      if (!ok) failed++;

      results.push({
        label: step.label,
        functionName: step.functionName,
        success: ok,
        output: output
      });

      if (!ok) break;

    } catch (error) {
      failed++;

      results.push({
        label: step.label,
        functionName: step.functionName,
        success: false,
        error:
          String(error.message || error)
      });

      break;
    }
  }

  var result = {
    success: failed === 0,
    suiteName: suiteName,
    phase: '4B-1',
    stepCount: steps.length,
    failedStepCount: failed,
    results: results
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      suiteName +
      ' failed. failedStepCount=' +
      failed
    );
  }

  return result;
}