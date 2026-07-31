/**
 * ================================================================
 * KIDLEARN V3 - SUBJECT DASHBOARD CONTEXT
 * Step: 4C-1
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Build read-only context for Subject Dashboard.
 * - Prepare subject theme colors.
 * - Prepare answer modes for future Lesson Player.
 *
 * Safety:
 * - Không ghi Google Sheet dữ liệu học.
 * - Không ghi PROD.
 * - Không deploy.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4C-1.
 */


var KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4C1_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4C1_LAST_PREVIEW_AT',
  LAST_SMOKE_AT: 'KIDLEARN_V3_PHASE_4C1_LAST_SMOKE_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4C1_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4C1_LAST_RESULT_JSON'
};


var KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  SMOKE_PASSED: 'SMOKE_PASSED',
  READY_FOR_4C_2: 'READY_FOR_4C_2',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG = {
  PHASE: '4C-1',
  PARENT_PHASE: '4C',
  PREVIOUS_PHASE: '4B',
  NEXT_BUNDLE: '4C-2',
  NEXT_STAGE: 'SUBJECT_THEME_MAP_AND_SUBJECT_DASHBOARD_UI',
  CONTEXT_NAME: 'SUBJECT_DASHBOARD_CONTEXT_READ_ONLY',
  MAX_ROWS_PER_SHEET: 700,
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false
};


/**
 * Main public context function.
 * Future UI 4C-2 can call this through google.script.run.
 */
function kidlearnV3_getSubjectDashboardContext4C1V3(payload) {
  payload = payload || {};

  var startedAt =
    new Date();

  var errors = [];
  var warnings = [];

  var phase4B =
    kidlearnV3_4c1SafeCall_(
      'kidlearnV3_assertPhase4BClosedLockedV3'
    );

  if (!phase4B.success) {
    errors.push(
      'Phase 4B chưa closed locked: ' +
      phase4B.message
    );
  }

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4c1OpenSpreadsheet_();
  } catch (error) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(error.message || error)
    );
  }

  var tables = {};

  if (spreadsheet) {
    tables =
      kidlearnV3_4c1ReadSubjectDashboardTables_(
        spreadsheet,
        warnings
      );
  }

  var child =
    kidlearnV3_4c1ResolveChild_(
      payload,
      tables.DATA_Children || []
    );

  var subjects =
    kidlearnV3_4c1NormalizeSubjects_(
      tables.MST_Subjects || []
    );

  if (subjects.length === 0) {
    warnings.push(
      'MST_Subjects không có dữ liệu usable. Dùng fallback 4 môn mặc định.'
    );

    subjects =
      kidlearnV3_4c1BuildFallbackSubjects_();
  }

  var selectedSubject =
    kidlearnV3_4c1ResolveSelectedSubject_(
      payload,
      subjects
    );

  var topics =
    kidlearnV3_4c1NormalizeTopics_(
      tables.MST_Topics || [],
      selectedSubject
    );

  var lessons =
    kidlearnV3_4c1NormalizeLessons_(
      tables.MST_Lessons || [],
      selectedSubject,
      topics
    );

  if (lessons.length === 0) {
    warnings.push(
      'Không tìm thấy lessons cho subject hiện tại. Dùng fallback lesson demo.'
    );

    lessons =
      kidlearnV3_4c1BuildFallbackLessons_(
        selectedSubject
      );
  }

  var progressRows =
    kidlearnV3_4c1NormalizeLessonProgress_(
      tables.DATA_LessonProgress || [],
      child
    );

  var skillRows =
    kidlearnV3_4c1NormalizeSkills_(
      tables.MST_Skills || [],
      selectedSubject
    );

  var lessonSkillRows =
    kidlearnV3_4c1NormalizeLessonSkills_(
      tables.MST_LessonSkills || []
    );

  var skillProgressRows =
    kidlearnV3_4c1NormalizeSkillProgress_(
      tables.DATA_SkillProgress || [],
      child
    );

  var assignments =
    kidlearnV3_4c1NormalizeAssignments_(
      tables.DATA_Assignments || [],
      child,
      selectedSubject
    );

  var reviewQueue =
    kidlearnV3_4c1NormalizeReviewQueue_(
      tables.DATA_ReviewQueue || [],
      child,
      selectedSubject
    );

  var lessonCards =
    kidlearnV3_4c1BuildLessonCards_(
      lessons,
      topics,
      progressRows,
      assignments,
      reviewQueue
    );

  var progressSummary =
    kidlearnV3_4c1BuildProgressSummary_(
      lessonCards
    );

  var nextLesson =
    kidlearnV3_4c1PickNextLesson_(
      lessonCards
    );

  var lessonGroups =
    kidlearnV3_4c1BuildLessonGroups_(
      lessonCards
    );

  var skills =
    kidlearnV3_4c1BuildSkillCards_(
      skillRows,
      lessonSkillRows,
      skillProgressRows,
      lessonCards,
      selectedSubject
    );

  var reviewItems =
    kidlearnV3_4c1BuildReviewItems_(
      reviewQueue,
      lessonCards,
      selectedSubject
    );

  var themeMap =
    kidlearnV3_getSubjectThemeMap4C1V3();

  var theme =
    kidlearnV3_4c1ResolveSubjectTheme_(
      selectedSubject,
      themeMap
    );

  var context = {
    child: child,
    selectedSubject: selectedSubject,
    subjectThemeMap: themeMap,
    selectedTheme: theme,
    supportedAnswerModes:
      kidlearnV3_getSupportedAnswerModes4C1V3(),
    subjectDashboard: {
      subject: selectedSubject,
      theme: theme,
      hero:
        kidlearnV3_4c1BuildHero_(
          child,
          selectedSubject,
          theme,
          progressSummary,
          nextLesson
        ),
      nextLesson: nextLesson,
      lessonGroups: lessonGroups,
      lessonCards: lessonCards,
      skills: skills,
      reviewItems: reviewItems,
      progressSummary: progressSummary,
      uiPolicy: {
        primaryAction: 'Học tiếp',
        secondaryAction: 'Ôn tập nhanh',
        showOneMainAction: true,
        childFriendlyFeedback: true,
        handwritingSupportedLater: true
      }
    },
    sourceInfo: {
      mode: 'READ_ONLY',
      tableNames: Object.keys(tables),
      generatedAt:
        new Date().toISOString(),
      durationMs:
        new Date().getTime() - startedAt.getTime()
    }
  };

  var result = {
    success: errors.length === 0,
    action: 'GET_SUBJECT_DASHBOARD_CONTEXT_4C_1_V3',
    phase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.PARENT_PHASE,
    contextName:
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.CONTEXT_NAME,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    selectedSubjectCode:
      selectedSubject.subjectCode,
    selectedSubjectName:
      selectedSubject.subjectName,
    lessonCount:
      lessonCards.length,
    skillCount:
      skills.length,
    reviewItemCount:
      reviewItems.length,
    context: context,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  console.log(JSON.stringify({
    success: result.success,
    action: result.action,
    phase: result.phase,
    selectedSubjectCode: result.selectedSubjectCode,
    selectedSubjectName: result.selectedSubjectName,
    lessonCount: result.lessonCount,
    skillCount: result.skillCount,
    reviewItemCount: result.reviewItemCount,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    errors: result.errors,
    warnings: result.warnings
  }, null, 2));

  if (!result.success) {
    throw new Error(
      '4C-1 context failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Preview 4C-1.
 */
function kidlearnV3_previewSubjectDashboardContext4C1V3() {
  var result =
    kidlearnV3_getSubjectDashboardContext4C1V3({
      subjectCode: 'MATH'
    });

  var status =
    result.success
      ? KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_STATUS.PREVIEWED
      : KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_STATUS.FAILED;

  kidlearnV3_4c1SaveStatus_(
    result,
    status,
    KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify({
    success: result.success,
    action: 'PREVIEW_SUBJECT_DASHBOARD_CONTEXT_4C_1_V3',
    phase: '4C-1',
    status: status,
    nextBundle:
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.NEXT_BUNDLE,
    selectedSubjectCode: result.selectedSubjectCode,
    lessonCount: result.lessonCount,
    skillCount: result.skillCount,
    reviewItemCount: result.reviewItemCount,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    warnings: result.warnings
  }, null, 2));

  return {
    success: result.success,
    action: 'PREVIEW_SUBJECT_DASHBOARD_CONTEXT_4C_1_V3',
    phase: '4C-1',
    status: status,
    nextBundle:
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.NEXT_BUNDLE,
    selectedSubjectCode: result.selectedSubjectCode,
    lessonCount: result.lessonCount,
    skillCount: result.skillCount,
    reviewItemCount: result.reviewItemCount,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    warnings: result.warnings
  };
}


/**
 * Smoke test all 4 subjects.
 */
function kidlearnV3_smokeTestSubjectDashboardContext4C1V3() {
  var subjects = [
    'MATH',
    'VIETNAMESE',
    'ENGLISH',
    'SCIENCE'
  ];

  var errors = [];
  var warnings = [];
  var results = [];

  for (var i = 0; i < subjects.length; i++) {
    try {
      var output =
        kidlearnV3_getSubjectDashboardContext4C1V3({
          subjectCode: subjects[i]
        });

      results.push({
        subjectCode: subjects[i],
        success: output.success === true,
        subjectName: output.selectedSubjectName,
        lessonCount: output.lessonCount,
        skillCount: output.skillCount,
        warningCount: output.warningCount
      });

      warnings =
        warnings.concat(output.warnings || []);

      if (!output.success) {
        errors.push(
          subjects[i] + ' context returned success=false.'
        );
      }

    } catch (error) {
      errors.push(
        subjects[i] + ': ' +
        String(error.message || error)
      );

      results.push({
        subjectCode: subjects[i],
        success: false,
        error: String(error.message || error)
      });
    }
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_SUBJECT_DASHBOARD_CONTEXT_4C_1_V3',
    phase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.PARENT_PHASE,
    subjectCount: subjects.length,
    results: results,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4c1SaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_STATUS.SMOKE_PASSED
      : KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_STATUS.FAILED,
    KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_KEYS.LAST_SMOKE_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4C-1 smoke failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready for 4C-2.
 */
function kidlearnV3_markSubjectDashboardContext4C1ReadyV3() {
  var smoke =
    kidlearnV3_smokeTestSubjectDashboardContext4C1V3();

  if (!smoke.success) {
    throw new Error('Smoke 4C-1 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_SUBJECT_DASHBOARD_CONTEXT_4C_1_READY_V3',
    phase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_STATUS.READY_FOR_4C_2,
    nextBundle:
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    message:
      'Subject Dashboard Context 4C-1 ready. Có thể qua 4C-2 Subject Theme Map + Subject Dashboard UI.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4c1SaveStatus_(
    result,
    KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_STATUS.READY_FOR_4C_2,
    KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get 4C-1 status.
 */
function kidlearnV3_getSubjectDashboardContext4C1StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_SUBJECT_DASHBOARD_CONTEXT_4C_1_STATUS_V3',
    phase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_KEYS.STATUS
      ) ||
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastSmokeAt:
      properties.getProperty(
        KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_KEYS.LAST_SMOKE_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4c1ReadJsonProperty_(
        KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert 4C-1 ready.
 */
function kidlearnV3_assertSubjectDashboardContext4C1ReadyV3() {
  var status =
    kidlearnV3_getSubjectDashboardContext4C1StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_STATUS.READY_FOR_4C_2
  ) {
    errors.push(
      '4C-1 chưa READY_FOR_4C_2. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_SUBJECT_DASHBOARD_CONTEXT_4C_1_READY_V3',
    phase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.PARENT_PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.NEXT_BUNDLE,
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
 * QA batch 4C-1.
 */
function kidlearnV3_runQaBatch4C1V3() {
  var preview =
    kidlearnV3_previewSubjectDashboardContext4C1V3();

  var smoke =
    kidlearnV3_smokeTestSubjectDashboardContext4C1V3();

  var ready =
    kidlearnV3_markSubjectDashboardContext4C1ReadyV3();

  var assertReady =
    kidlearnV3_assertSubjectDashboardContext4C1ReadyV3();

  var result = {
    success:
      preview.success === true &&
      smoke.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4C_1_SUBJECT_DASHBOARD_CONTEXT_READ_ONLY',
    phase:
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.PHASE,
    nextBundle:
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    results: {
      preview: preview.success,
      smoke: smoke.success,
      ready: ready.success,
      assertReady: assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4C-1 QA batch failed.');
  }

  return result;
}


/**
 * Subject theme map.
 * Theo quyết định mới của chị:
 * - Toán: xanh dương
 * - Tiếng Việt: cam
 * - Tiếng Anh: xanh lá
 * - Khoa học: đỏ
 */
function kidlearnV3_getSubjectThemeMap4C1V3() {
  return {
    MATH: {
      subjectKey: 'MATH',
      subjectName: 'Toán học',
      colorName: 'blue',
      primary: '#2F80ED',
      pastel: '#EFF6FF',
      border: '#BFDBFE',
      text: '#1D4ED8',
      softText: '#334155',
      gradient: 'linear-gradient(135deg, #2F80ED, #38BDF8)',
      iconAssetId: 'subject_math_builtin_svg'
    },
    VIETNAMESE: {
      subjectKey: 'VIETNAMESE',
      subjectName: 'Tiếng Việt',
      colorName: 'orange',
      primary: '#F97316',
      pastel: '#FFF7ED',
      border: '#FED7AA',
      text: '#C2410C',
      softText: '#334155',
      gradient: 'linear-gradient(135deg, #F97316, #FDBA74)',
      iconAssetId: 'subject_vietnamese_builtin_svg'
    },
    ENGLISH: {
      subjectKey: 'ENGLISH',
      subjectName: 'Tiếng Anh',
      colorName: 'green',
      primary: '#22C55E',
      pastel: '#F0FDF4',
      border: '#BBF7D0',
      text: '#15803D',
      softText: '#334155',
      gradient: 'linear-gradient(135deg, #22C55E, #86EFAC)',
      iconAssetId: 'subject_english_builtin_svg'
    },
    SCIENCE: {
      subjectKey: 'SCIENCE',
      subjectName: 'Khoa học',
      colorName: 'red',
      primary: '#EF4444',
      pastel: '#FEF2F2',
      border: '#FECACA',
      text: '#B91C1C',
      softText: '#334155',
      gradient: 'linear-gradient(135deg, #EF4444, #FB7185)',
      iconAssetId: 'subject_science_builtin_svg'
    },
    DEFAULT: {
      subjectKey: 'DEFAULT',
      subjectName: 'Môn học',
      colorName: 'blue',
      primary: '#2F80ED',
      pastel: '#EFF6FF',
      border: '#BFDBFE',
      text: '#1D4ED8',
      softText: '#334155',
      gradient: 'linear-gradient(135deg, #2F80ED, #38BDF8)',
      iconAssetId: 'subject_default_builtin_svg'
    }
  };
}


/**
 * Supported answer modes for future Lesson Player.
 */
function kidlearnV3_getSupportedAnswerModes4C1V3() {
  return [
    {
      answerMode: 'MULTIPLE_CHOICE',
      label: 'Chọn đáp án',
      description: 'Bé chọn một hoặc nhiều đáp án có sẵn.',
      inputDevice: ['mouse', 'touch'],
      suitableSubjects: ['MATH', 'VIETNAMESE', 'ENGLISH', 'SCIENCE'],
      enabledIn4C1: false,
      plannedFor: '4C-4'
    },
    {
      answerMode: 'BUTTON_INPUT',
      label: 'Bấm nút nhập đáp án',
      description: 'Bé nhập số, phép tính hoặc từ bằng các nút lớn.',
      inputDevice: ['mouse', 'touch'],
      suitableSubjects: ['MATH', 'VIETNAMESE', 'ENGLISH'],
      enabledIn4C1: false,
      plannedFor: '4C-4'
    },
    {
      answerMode: 'TEXT_INPUT',
      label: 'Gõ câu trả lời',
      description: 'Bé gõ đáp án bằng bàn phím máy tính, điện thoại hoặc iPad.',
      inputDevice: ['keyboard', 'touch-keyboard'],
      suitableSubjects: ['MATH', 'VIETNAMESE', 'ENGLISH', 'SCIENCE'],
      enabledIn4C1: false,
      plannedFor: '4C-4'
    },
    {
      answerMode: 'HANDWRITE_INPUT',
      label: 'Viết bằng tay / pen',
      description: 'Bé viết hoặc vẽ đáp án trên bảng canvas.',
      inputDevice: ['touch', 'pen', 'mouse'],
      suitableSubjects: ['MATH', 'VIETNAMESE'],
      autoGradeInMvp: false,
      enabledIn4C1: false,
      plannedFor: '4C-4'
    }
  ];
}


/**
 * Data readers.
 */
function kidlearnV3_4c1ReadSubjectDashboardTables_(spreadsheet, warnings) {
  var names = [
    'DATA_Children',
    'MST_Subjects',
    'MST_Topics',
    'MST_Lessons',
    'MST_LessonBlocks',
    'MST_Activities',
    'MST_Skills',
    'MST_LessonSkills',
    'DATA_LessonProgress',
    'DATA_SkillProgress',
    'DATA_Assignments',
    'DATA_ReviewQueue',
    'DATA_DailyGoals'
  ];

  var tables = {};

  for (var i = 0; i < names.length; i++) {
    tables[names[i]] =
      kidlearnV3_4c1ReadSheetObjects_(
        spreadsheet,
        names[i],
        warnings
      );
  }

  return tables;
}


function kidlearnV3_4c1ReadSheetObjects_(spreadsheet, sheetName, warnings) {
  var sheet =
    kidlearnV3_4c1GetSheetByExactName_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    warnings.push(
      'Không tìm thấy sheet ' + sheetName + '.'
    );
    return [];
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (lastRow < 2 || lastColumn < 1) {
    return [];
  }

  var rowCount =
    Math.min(
      lastRow,
      KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.MAX_ROWS_PER_SHEET
    );

  var values =
    sheet.getRange(1, 1, rowCount, lastColumn).getValues();

  var headers =
    kidlearnV3_4c1BuildHeaders_(values);

  var startRowIndex =
    headers.startRowIndex;

  var objects = [];

  for (var r = startRowIndex; r < values.length; r++) {
    var row =
      values[r];

    if (kidlearnV3_4c1IsBlankRow_(row)) continue;

    var obj = {};

    for (var c = 0; c < headers.keys.length; c++) {
      var key =
        headers.keys[c];

      if (!key) {
        key = 'col' + (c + 1);
      }

      obj[key] =
        row[c];
    }

    obj.__rowNumber =
      r + 1;

    objects.push(obj);
  }

  return objects;
}


function kidlearnV3_4c1BuildHeaders_(values) {
  var row1 =
    values[0] || [];

  var row2 =
    values.length > 1 ? values[1] || [] : [];

  var row2LooksLikeFieldKeys =
    kidlearnV3_4c1RowLooksLikeFieldKeys_(row2);

  var source =
    row2LooksLikeFieldKeys ? row2 : row1;

  var startRowIndex =
    row2LooksLikeFieldKeys ? 2 : 1;

  var keys = [];

  for (var i = 0; i < source.length; i++) {
    keys.push(
      kidlearnV3_4c1NormalizeKey_(source[i])
    );
  }

  return {
    keys: keys,
    startRowIndex: startRowIndex
  };
}


function kidlearnV3_4c1RowLooksLikeFieldKeys_(row) {
  var score = 0;

  for (var i = 0; i < row.length; i++) {
    var value =
      String(row[i] || '');

    if (
      /^[a-zA-Z][a-zA-Z0-9_]*$/.test(value) ||
      value.indexOf('Id') >= 0 ||
      value.indexOf('Code') >= 0 ||
      value.indexOf('Name') >= 0
    ) {
      score++;
    }
  }

  return score >= 3;
}


function kidlearnV3_4c1NormalizeKey_(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/_/g, '')
    .replace(/[^\wÀ-ỹ]/g, '');
}


/**
 * Normalizers.
 */
function kidlearnV3_4c1NormalizeSubjects_(rows) {
  var result = [];

  for (var i = 0; i < rows.length; i++) {
    var row =
      rows[i];

    var subjectId =
      kidlearnV3_4c1GetAny_(row, [
        'subjectId',
        'subjectid',
        'mamondb',
        'mamonhoc',
        'Mãmônhọc',
        'Mamonhoc',
        'id'
      ]);

    var subjectCode =
      kidlearnV3_4c1GetAny_(row, [
        'subjectCode',
        'subjectcode',
        'code',
        'mamondb',
        'mamonhoc',
        'Mãmônhọc',
        'Mamonhoc'
      ]);

    var subjectName =
      kidlearnV3_4c1GetAny_(row, [
        'subjectName',
        'subjectname',
        'name',
        'tenmonhoc',
        'Tênmônhọc',
        'Tenmonhoc',
        'title'
      ]);

    if (!subjectName && !subjectCode) continue;

    var key =
      kidlearnV3_4c1ResolveSubjectKey_(
        subjectCode,
        subjectName
      );

    result.push({
      subjectId:
        String(subjectId || subjectCode || key),
      subjectCode:
        String(subjectCode || key),
      subjectKey: key,
      subjectName:
        String(subjectName || kidlearnV3_4c1SubjectNameFromKey_(key)),
      order:
        kidlearnV3_4c1ToNumber_(
          kidlearnV3_4c1GetAny_(row, [
            'displayOrder',
            'order',
            'sortOrder',
            'thutu',
            'Thứtự'
          ]),
          i + 1
        ),
      isActive:
        kidlearnV3_4c1ToBool_(
          kidlearnV3_4c1GetAny_(row, [
            'isActive',
            'active',
            'trangthai',
            'status'
          ]),
          true
        )
    });
  }

  result =
    result.filter(function (item) {
      return item.isActive !== false;
    });

  result.sort(function (a, b) {
    return a.order - b.order;
  });

  return result;
}


function kidlearnV3_4c1NormalizeTopics_(rows, subject) {
  var result = [];
  var subjectKey =
    subject.subjectKey;

  for (var i = 0; i < rows.length; i++) {
    var row =
      rows[i];

    var rowSubjectKey =
      kidlearnV3_4c1ResolveSubjectKey_(
        kidlearnV3_4c1GetAny_(row, [
          'subjectCode',
          'subjectId',
          'mamonhoc',
          'Mãmônhọc'
        ]),
        ''
      );

    if (
      rowSubjectKey !== 'DEFAULT' &&
      rowSubjectKey !== subjectKey
    ) {
      continue;
    }

    var topicId =
      kidlearnV3_4c1GetAny_(row, [
        'topicId',
        'topicid',
        'machude',
        'Mãchủđề',
        'id'
      ]);

    var topicName =
      kidlearnV3_4c1GetAny_(row, [
        'topicName',
        'topicname',
        'tenchude',
        'Tênchủđề',
        'name',
        'title'
      ]);

    if (!topicId && !topicName) continue;

    result.push({
      topicId:
        String(topicId || 'TOPIC_' + (i + 1)),
      topicName:
        String(topicName || 'Chủ đề ' + (i + 1)),
      subjectKey: subjectKey,
      order:
        kidlearnV3_4c1ToNumber_(
          kidlearnV3_4c1GetAny_(row, [
            'displayOrder',
            'order',
            'sortOrder',
            'thutu'
          ]),
          i + 1
        )
    });
  }

  result.sort(function (a, b) {
    return a.order - b.order;
  });

  return result;
}


function kidlearnV3_4c1NormalizeLessons_(rows, subject, topics) {
  var result = [];
  var subjectKey =
    subject.subjectKey;

  for (var i = 0; i < rows.length; i++) {
    var row =
      rows[i];

    var rowSubjectKey =
      kidlearnV3_4c1ResolveSubjectKey_(
        kidlearnV3_4c1GetAny_(row, [
          'subjectCode',
          'subjectId',
          'mamonhoc',
          'Mãmônhọc'
        ]),
        ''
      );

    if (
      rowSubjectKey !== 'DEFAULT' &&
      rowSubjectKey !== subjectKey
    ) {
      continue;
    }

    var lessonId =
      kidlearnV3_4c1GetAny_(row, [
        'lessonId',
        'lessonid',
        'mabaihoc',
        'Mãbàihọc',
        'id'
      ]);

    var lessonTitle =
      kidlearnV3_4c1GetAny_(row, [
        'lessonTitle',
        'lessonName',
        'lessonname',
        'title',
        'name',
        'tenbaihoc',
        'Tênbàihọc'
      ]);

    if (!lessonId && !lessonTitle) continue;

    var topicId =
      String(
        kidlearnV3_4c1GetAny_(row, [
          'topicId',
          'topicid',
          'machude',
          'Mãchủđề'
        ]) ||
        (
          topics[0]
            ? topics[0].topicId
            : 'TOPIC_GENERAL'
        )
      );

    var topic =
      kidlearnV3_4c1FindBy_(
        topics,
        'topicId',
        topicId
      );

    result.push({
      lessonId:
        String(lessonId || 'LESSON_' + subjectKey + '_' + (i + 1)),
      lessonTitle:
        String(lessonTitle || 'Bài học ' + (i + 1)),
      subjectKey: subjectKey,
      subjectCode: subject.subjectCode,
      topicId: topicId,
      topicName:
        topic ? topic.topicName : 'Chủ đề chung',
      estimatedMinutes:
        kidlearnV3_4c1ToNumber_(
          kidlearnV3_4c1GetAny_(row, [
            'estimatedMinutes',
            'durationMinutes',
            'minutes',
            'thoiluong',
            'Thờilượng'
          ]),
          8
        ),
      order:
        kidlearnV3_4c1ToNumber_(
          kidlearnV3_4c1GetAny_(row, [
            'displayOrder',
            'order',
            'sortOrder',
            'thutu'
          ]),
          i + 1
        ),
      difficulty:
        String(
          kidlearnV3_4c1GetAny_(row, [
            'difficulty',
            'level',
            'mucdo',
            'Mứcđộ'
          ]) || 'Dễ'
        )
    });
  }

  result.sort(function (a, b) {
    return a.order - b.order;
  });

  return result;
}


function kidlearnV3_4c1NormalizeLessonProgress_(rows, child) {
  var result = [];

  for (var i = 0; i < rows.length; i++) {
    var row =
      rows[i];

    var childId =
      String(
        kidlearnV3_4c1GetAny_(row, [
          'childId',
          'childid',
          'machild',
          'child'
        ]) || ''
      );

    if (
      child.childId &&
      childId &&
      childId !== child.childId
    ) {
      continue;
    }

    result.push({
      lessonId:
        String(
          kidlearnV3_4c1GetAny_(row, [
            'lessonId',
            'lessonid',
            'mabaihoc'
          ]) || ''
        ),
      status:
        String(
          kidlearnV3_4c1GetAny_(row, [
            'status',
            'progressStatus',
            'trangthai'
          ]) || ''
        ),
      progressPercent:
        kidlearnV3_4c1ToNumber_(
          kidlearnV3_4c1GetAny_(row, [
            'progressPercent',
            'percent',
            'completionPercent',
            'tiendo'
          ]),
          0
        ),
      lastStudiedAt:
        String(
          kidlearnV3_4c1GetAny_(row, [
            'lastStudiedAt',
            'updatedAt',
            'modifiedAt'
          ]) || ''
        )
    });
  }

  return result;
}


function kidlearnV3_4c1NormalizeSkills_(rows, subject) {
  var result = [];

  for (var i = 0; i < rows.length; i++) {
    var row =
      rows[i];

    var rowSubjectKey =
      kidlearnV3_4c1ResolveSubjectKey_(
        kidlearnV3_4c1GetAny_(row, [
          'subjectCode',
          'subjectId',
          'mamonhoc'
        ]),
        ''
      );

    if (
      rowSubjectKey !== 'DEFAULT' &&
      rowSubjectKey !== subject.subjectKey
    ) {
      continue;
    }

    var skillId =
      kidlearnV3_4c1GetAny_(row, [
        'skillId',
        'skillid',
        'makynang',
        'Mãkỹnăng',
        'id'
      ]);

    var skillName =
      kidlearnV3_4c1GetAny_(row, [
        'skillName',
        'skillname',
        'tenkynang',
        'Tênkỹnăng',
        'name',
        'title'
      ]);

    if (!skillId && !skillName) continue;

    result.push({
      skillId:
        String(skillId || 'SKILL_' + (i + 1)),
      skillName:
        String(skillName || 'Kỹ năng ' + (i + 1)),
      subjectKey:
        subject.subjectKey,
      order:
        kidlearnV3_4c1ToNumber_(
          kidlearnV3_4c1GetAny_(row, [
            'displayOrder',
            'order',
            'sortOrder',
            'thutu'
          ]),
          i + 1
        )
    });
  }

  if (result.length === 0) {
    result =
      kidlearnV3_4c1BuildFallbackSkills_(
        subject
      );
  }

  result.sort(function (a, b) {
    return a.order - b.order;
  });

  return result;
}


function kidlearnV3_4c1NormalizeLessonSkills_(rows) {
  var result = [];

  for (var i = 0; i < rows.length; i++) {
    var row =
      rows[i];

    var lessonId =
      String(
        kidlearnV3_4c1GetAny_(row, [
          'lessonId',
          'lessonid',
          'mabaihoc'
        ]) || ''
      );

    var skillId =
      String(
        kidlearnV3_4c1GetAny_(row, [
          'skillId',
          'skillid',
          'makynang'
        ]) || ''
      );

    if (!lessonId || !skillId) continue;

    result.push({
      lessonId: lessonId,
      skillId: skillId
    });
  }

  return result;
}


function kidlearnV3_4c1NormalizeSkillProgress_(rows, child) {
  var result = [];

  for (var i = 0; i < rows.length; i++) {
    var row =
      rows[i];

    var childId =
      String(
        kidlearnV3_4c1GetAny_(row, [
          'childId',
          'childid',
          'machild'
        ]) || ''
      );

    if (
      child.childId &&
      childId &&
      childId !== child.childId
    ) {
      continue;
    }

    result.push({
      skillId:
        String(
          kidlearnV3_4c1GetAny_(row, [
            'skillId',
            'skillid',
            'makynang'
          ]) || ''
        ),
      masteryPercent:
        kidlearnV3_4c1ToNumber_(
          kidlearnV3_4c1GetAny_(row, [
            'masteryPercent',
            'percent',
            'tiendo'
          ]),
          0
        )
    });
  }

  return result;
}


function kidlearnV3_4c1NormalizeAssignments_(rows, child, subject) {
  var result = [];

  for (var i = 0; i < rows.length; i++) {
    var row =
      rows[i];

    var childId =
      String(
        kidlearnV3_4c1GetAny_(row, [
          'childId',
          'childid',
          'machild'
        ]) || ''
      );

    if (
      child.childId &&
      childId &&
      childId !== child.childId
    ) {
      continue;
    }

    var rowSubjectKey =
      kidlearnV3_4c1ResolveSubjectKey_(
        kidlearnV3_4c1GetAny_(row, [
          'subjectCode',
          'subjectId',
          'mamonhoc'
        ]),
        ''
      );

    if (
      rowSubjectKey !== 'DEFAULT' &&
      rowSubjectKey !== subject.subjectKey
    ) {
      continue;
    }

    result.push({
      lessonId:
        String(
          kidlearnV3_4c1GetAny_(row, [
            'lessonId',
            'lessonid',
            'mabaihoc'
          ]) || ''
        ),
      assignmentId:
        String(
          kidlearnV3_4c1GetAny_(row, [
            'assignmentId',
            'assignmentid',
            'id'
          ]) || ''
        ),
      dueDate:
        String(
          kidlearnV3_4c1GetAny_(row, [
            'dueDate',
            'deadline',
            'hannop'
          ]) || ''
        )
    });
  }

  return result;
}


function kidlearnV3_4c1NormalizeReviewQueue_(rows, child, subject) {
  var result = [];

  for (var i = 0; i < rows.length; i++) {
    var row =
      rows[i];

    var childId =
      String(
        kidlearnV3_4c1GetAny_(row, [
          'childId',
          'childid',
          'machild'
        ]) || ''
      );

    if (
      child.childId &&
      childId &&
      childId !== child.childId
    ) {
      continue;
    }

    var rowSubjectKey =
      kidlearnV3_4c1ResolveSubjectKey_(
        kidlearnV3_4c1GetAny_(row, [
          'subjectCode',
          'subjectId',
          'mamonhoc'
        ]),
        ''
      );

    if (
      rowSubjectKey !== 'DEFAULT' &&
      rowSubjectKey !== subject.subjectKey
    ) {
      continue;
    }

    result.push({
      lessonId:
        String(
          kidlearnV3_4c1GetAny_(row, [
            'lessonId',
            'lessonid',
            'mabaihoc'
          ]) || ''
        ),
      reviewReason:
        String(
          kidlearnV3_4c1GetAny_(row, [
            'reviewReason',
            'reason',
            'lydo'
          ]) || 'Ôn lại để nhớ lâu hơn'
        ),
      priority:
        kidlearnV3_4c1ToNumber_(
          kidlearnV3_4c1GetAny_(row, [
            'priority',
            'douutien'
          ]),
          1
        )
    });
  }

  return result;
}


/**
 * Context builders.
 */
function kidlearnV3_4c1ResolveChild_(payload, childRows) {
  var childId =
    String(payload.childId || '');

  if (childId) {
    for (var i = 0; i < childRows.length; i++) {
      var row =
        childRows[i];

      var rowChildId =
        String(
          kidlearnV3_4c1GetAny_(row, [
            'childId',
            'childid',
            'machild',
            'id'
          ]) || ''
        );

      if (rowChildId === childId) {
        return {
          childId: rowChildId,
          childName:
            String(
              kidlearnV3_4c1GetAny_(row, [
                'childName',
                'childname',
                'tenbe',
                'name'
              ]) || 'Lịch Khê'
            ),
          grade:
            String(
              kidlearnV3_4c1GetAny_(row, [
                'grade',
                'lop',
                'class'
              ]) || '2'
            )
        };
      }
    }
  }

  if (childRows.length > 0) {
    var first =
      childRows[0];

    return {
      childId:
        String(
          kidlearnV3_4c1GetAny_(first, [
            'childId',
            'childid',
            'machild',
            'id'
          ]) || 'CHD_V2_CHILD_DEFAULT'
        ),
      childName:
        String(
          kidlearnV3_4c1GetAny_(first, [
            'childName',
            'childname',
            'tenbe',
            'name'
          ]) || 'Lịch Khê'
        ),
      grade:
        String(
          kidlearnV3_4c1GetAny_(first, [
            'grade',
            'lop',
            'class'
          ]) || '2'
        )
    };
  }

  return {
    childId: 'CHD_V2_CHILD_DEFAULT',
    childName: 'Lịch Khê',
    grade: '2'
  };
}


function kidlearnV3_4c1ResolveSelectedSubject_(payload, subjects) {
  var requestedKey =
    kidlearnV3_4c1ResolveSubjectKey_(
      payload.subjectCode || payload.subjectId || '',
      payload.subjectName || ''
    );

  for (var i = 0; i < subjects.length; i++) {
    if (subjects[i].subjectKey === requestedKey) {
      return subjects[i];
    }
  }

  return subjects[0] || kidlearnV3_4c1BuildFallbackSubjects_()[0];
}


function kidlearnV3_4c1BuildLessonCards_(
  lessons,
  topics,
  progressRows,
  assignments,
  reviewQueue
) {
  var cards = [];

  for (var i = 0; i < lessons.length; i++) {
    var lesson =
      lessons[i];

    var progress =
      kidlearnV3_4c1FindBy_(
        progressRows,
        'lessonId',
        lesson.lessonId
      );

    var assignment =
      kidlearnV3_4c1FindBy_(
        assignments,
        'lessonId',
        lesson.lessonId
      );

    var review =
      kidlearnV3_4c1FindBy_(
        reviewQueue,
        'lessonId',
        lesson.lessonId
      );

    var percent =
      progress
        ? kidlearnV3_4c1Clamp_(
            progress.progressPercent,
            0,
            100
          )
        : 0;

    var status =
      kidlearnV3_4c1ResolveLessonStatus_(
        progress,
        percent
      );

    cards.push({
      lessonId: lesson.lessonId,
      lessonTitle: lesson.lessonTitle,
      subjectKey: lesson.subjectKey,
      subjectCode: lesson.subjectCode,
      topicId: lesson.topicId,
      topicName: lesson.topicName,
      estimatedMinutes: lesson.estimatedMinutes,
      difficulty: lesson.difficulty,
      order: lesson.order,
      status: status,
      statusLabel:
        kidlearnV3_4c1StatusLabel_(status),
      progressPercent: percent,
      isAssigned: assignment !== null,
      isReviewDue: review !== null,
      reviewReason:
        review ? review.reviewReason : '',
      primaryAction:
        status === 'COMPLETED'
          ? 'Ôn lại'
          : status === 'IN_PROGRESS'
            ? 'Học tiếp'
            : 'Vào học'
    });
  }

  return cards;
}


function kidlearnV3_4c1BuildProgressSummary_(lessonCards) {
  var total =
    lessonCards.length;

  var completed = 0;
  var inProgress = 0;
  var notStarted = 0;
  var sum = 0;

  for (var i = 0; i < lessonCards.length; i++) {
    var card =
      lessonCards[i];

    sum +=
      kidlearnV3_4c1ToNumber_(
        card.progressPercent,
        0
      );

    if (card.status === 'COMPLETED') {
      completed++;
    } else if (card.status === 'IN_PROGRESS') {
      inProgress++;
    } else {
      notStarted++;
    }
  }

  return {
    totalLessons: total,
    completedLessons: completed,
    inProgressLessons: inProgress,
    notStartedLessons: notStarted,
    overallProgressPercent:
      total > 0
        ? Math.round(sum / total)
        : 0
  };
}


function kidlearnV3_4c1PickNextLesson_(lessonCards) {
  if (lessonCards.length === 0) {
    return null;
  }

  for (var i = 0; i < lessonCards.length; i++) {
    if (lessonCards[i].status === 'IN_PROGRESS') {
      return lessonCards[i];
    }
  }

  for (var j = 0; j < lessonCards.length; j++) {
    if (lessonCards[j].status !== 'COMPLETED') {
      return lessonCards[j];
    }
  }

  return lessonCards[0];
}


function kidlearnV3_4c1BuildLessonGroups_(lessonCards) {
  var map = {};

  for (var i = 0; i < lessonCards.length; i++) {
    var card =
      lessonCards[i];

    var key =
      card.topicId || 'TOPIC_GENERAL';

    if (!map[key]) {
      map[key] = {
        topicId: key,
        topicName: card.topicName || 'Chủ đề chung',
        lessons: []
      };
    }

    map[key].lessons.push(card);
  }

  var groups = [];

  for (var topicId in map) {
    if (map.hasOwnProperty(topicId)) {
      groups.push(map[topicId]);
    }
  }

  return groups;
}


function kidlearnV3_4c1BuildSkillCards_(
  skills,
  lessonSkillRows,
  skillProgressRows,
  lessonCards,
  subject
) {
  var result = [];

  for (var i = 0; i < skills.length; i++) {
    var skill =
      skills[i];

    var progress =
      kidlearnV3_4c1FindBy_(
        skillProgressRows,
        'skillId',
        skill.skillId
      );

    var relatedLessonCount = 0;

    for (var j = 0; j < lessonSkillRows.length; j++) {
      if (lessonSkillRows[j].skillId === skill.skillId) {
        relatedLessonCount++;
      }
    }

    result.push({
      skillId: skill.skillId,
      skillName: skill.skillName,
      subjectKey: subject.subjectKey,
      masteryPercent:
        progress
          ? kidlearnV3_4c1Clamp_(
              progress.masteryPercent,
              0,
              100
            )
          : 0,
      relatedLessonCount: relatedLessonCount,
      label:
        progress && progress.masteryPercent >= 80
          ? 'Rất tốt'
          : progress && progress.masteryPercent > 0
            ? 'Đang luyện'
            : 'Sắp học'
    });
  }

  return result;
}


function kidlearnV3_4c1BuildReviewItems_(
  reviewQueue,
  lessonCards,
  subject
) {
  var result = [];

  for (var i = 0; i < reviewQueue.length; i++) {
    var item =
      reviewQueue[i];

    var lesson =
      kidlearnV3_4c1FindBy_(
        lessonCards,
        'lessonId',
        item.lessonId
      );

    result.push({
      lessonId: item.lessonId,
      lessonTitle:
        lesson ? lesson.lessonTitle : 'Bài cần ôn',
      subjectKey: subject.subjectKey,
      reviewReason: item.reviewReason,
      priority: item.priority,
      actionLabel: 'Ôn tập'
    });
  }

  if (result.length === 0 && lessonCards.length > 0) {
    result.push({
      lessonId: lessonCards[0].lessonId,
      lessonTitle: lessonCards[0].lessonTitle,
      subjectKey: subject.subjectKey,
      reviewReason: 'Ôn nhẹ để nhớ lâu hơn',
      priority: 1,
      actionLabel: 'Ôn nhanh'
    });
  }

  return result;
}


function kidlearnV3_4c1BuildHero_(
  child,
  subject,
  theme,
  progressSummary,
  nextLesson
) {
  return {
    title:
      subject.subjectName,
    greeting:
      'Mình học ' + subject.subjectName + ' nhé, ' + child.childName + '!',
    subtitle:
      progressSummary.completedLessons > 0
        ? 'Con đã hoàn thành ' +
          progressSummary.completedLessons +
          '/' +
          progressSummary.totalLessons +
          ' bài.'
        : 'Bắt đầu từ bài đầu tiên và học từng bước thật vui.',
    primaryAction:
      nextLesson
        ? nextLesson.primaryAction
        : 'Bắt đầu học',
    primaryLessonId:
      nextLesson ? nextLesson.lessonId : '',
    progressPercent:
      progressSummary.overallProgressPercent,
    themeColor:
      theme.primary,
    themeGradient:
      theme.gradient
  };
}


/**
 * Fallback demo builders.
 */
function kidlearnV3_4c1BuildFallbackSubjects_() {
  return [
    {
      subjectId: 'SUB_MATH',
      subjectCode: 'MATH',
      subjectKey: 'MATH',
      subjectName: 'Toán học',
      order: 1,
      isActive: true
    },
    {
      subjectId: 'SUB_VIETNAMESE',
      subjectCode: 'VIETNAMESE',
      subjectKey: 'VIETNAMESE',
      subjectName: 'Tiếng Việt',
      order: 2,
      isActive: true
    },
    {
      subjectId: 'SUB_ENGLISH',
      subjectCode: 'ENGLISH',
      subjectKey: 'ENGLISH',
      subjectName: 'Tiếng Anh',
      order: 3,
      isActive: true
    },
    {
      subjectId: 'SUB_SCIENCE',
      subjectCode: 'SCIENCE',
      subjectKey: 'SCIENCE',
      subjectName: 'Khoa học',
      order: 4,
      isActive: true
    }
  ];
}


function kidlearnV3_4c1BuildFallbackLessons_(subject) {
  var key =
    subject.subjectKey;

  var data = {
    MATH: [
      ['MATH_L1', 'Cộng trong phạm vi 20', 'Phép cộng'],
      ['MATH_L2', 'Trừ trong phạm vi 20', 'Phép trừ'],
      ['MATH_L3', 'Giải toán có lời văn', 'Toán ứng dụng']
    ],
    VIETNAMESE: [
      ['TV_L1', 'Đọc hiểu đoạn văn ngắn', 'Đọc hiểu'],
      ['TV_L2', 'Viết câu đơn giản', 'Tập viết'],
      ['TV_L3', 'Từ chỉ sự vật', 'Luyện từ']
    ],
    ENGLISH: [
      ['ENG_L1', 'My family', 'Từ vựng'],
      ['ENG_L2', 'Colors and animals', 'Từ vựng'],
      ['ENG_L3', 'Simple sentences', 'Câu đơn giản']
    ],
    SCIENCE: [
      ['SCI_L1', 'Cây cần gì để sống?', 'Thực vật'],
      ['SCI_L2', 'Con vật quanh em', 'Động vật'],
      ['SCI_L3', 'Thời tiết mỗi ngày', 'Quan sát']
    ]
  };

  var list =
    data[key] || data.MATH;

  var result = [];

  for (var i = 0; i < list.length; i++) {
    result.push({
      lessonId: list[i][0],
      lessonTitle: list[i][1],
      subjectKey: key,
      subjectCode: subject.subjectCode,
      topicId: key + '_TOPIC_' + (i + 1),
      topicName: list[i][2],
      estimatedMinutes: 8,
      order: i + 1,
      difficulty: 'Dễ'
    });
  }

  return result;
}


function kidlearnV3_4c1BuildFallbackSkills_(subject) {
  var key =
    subject.subjectKey;

  var skillNames = {
    MATH: ['Tính nhẩm', 'Hiểu đề bài', 'So sánh số'],
    VIETNAMESE: ['Đọc hiểu', 'Viết câu', 'Dùng từ'],
    ENGLISH: ['Từ vựng', 'Nghe hiểu', 'Câu đơn giản'],
    SCIENCE: ['Quan sát', 'Phân loại', 'Giải thích']
  };

  var names =
    skillNames[key] || skillNames.MATH;

  var result = [];

  for (var i = 0; i < names.length; i++) {
    result.push({
      skillId: key + '_SKILL_' + (i + 1),
      skillName: names[i],
      subjectKey: key,
      order: i + 1
    });
  }

  return result;
}


/**
 * Utility helpers.
 */
function kidlearnV3_4c1ResolveSubjectTheme_(subject, themeMap) {
  var key =
    subject.subjectKey || 'DEFAULT';

  return themeMap[key] || themeMap.DEFAULT;
}


function kidlearnV3_4c1ResolveSubjectKey_(code, name) {
  var text =
    String(code || '') +
    ' ' +
    String(name || '');

  text =
    text
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .replace(/-/g, '_');

  if (
    text.indexOf('MATH') >= 0 ||
    text.indexOf('TOAN') >= 0 ||
    text.indexOf('SUB_T') >= 0
  ) {
    return 'MATH';
  }

  if (
    text.indexOf('VIET') >= 0 ||
    text.indexOf('TIENGVIET') >= 0 ||
    text.indexOf('SUB_TV') >= 0
  ) {
    return 'VIETNAMESE';
  }

  if (
    text.indexOf('ENGLISH') >= 0 ||
    text.indexOf('TIENGANH') >= 0 ||
    text.indexOf('SUB_E') >= 0
  ) {
    return 'ENGLISH';
  }

  if (
    text.indexOf('SCIENCE') >= 0 ||
    text.indexOf('KHOAHOC') >= 0 ||
    text.indexOf('SUB_K') >= 0 ||
    text.indexOf('SUB_S') >= 0
  ) {
    return 'SCIENCE';
  }

  return 'DEFAULT';
}


function kidlearnV3_4c1SubjectNameFromKey_(key) {
  var map = {
    MATH: 'Toán học',
    VIETNAMESE: 'Tiếng Việt',
    ENGLISH: 'Tiếng Anh',
    SCIENCE: 'Khoa học',
    DEFAULT: 'Môn học'
  };

  return map[key] || map.DEFAULT;
}


function kidlearnV3_4c1ResolveLessonStatus_(progress, percent) {
  if (!progress && percent <= 0) {
    return 'NOT_STARTED';
  }

  var raw =
    String(progress ? progress.status : '')
      .trim()
      .toUpperCase();

  if (
    raw.indexOf('COMPLETE') >= 0 ||
    raw.indexOf('DONE') >= 0 ||
    raw.indexOf('HOANTHANH') >= 0 ||
    percent >= 100
  ) {
    return 'COMPLETED';
  }

  if (
    raw.indexOf('PROGRESS') >= 0 ||
    raw.indexOf('DANGHOC') >= 0 ||
    percent > 0
  ) {
    return 'IN_PROGRESS';
  }

  return 'NOT_STARTED';
}


function kidlearnV3_4c1StatusLabel_(status) {
  if (status === 'COMPLETED') return 'Hoàn thành';
  if (status === 'IN_PROGRESS') return 'Đang học';
  return 'Chưa học';
}


function kidlearnV3_4c1OpenSpreadsheet_() {
  var active =
    SpreadsheetApp.getActiveSpreadsheet();

  if (active) return active;

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

  throw new Error('Không tìm thấy DEV spreadsheet.');
}


function kidlearnV3_4c1GetSheetByExactName_(spreadsheet, sheetName) {
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


function kidlearnV3_4c1GetAny_(row, keys) {
  if (!row) return '';

  for (var i = 0; i < keys.length; i++) {
    var key =
      keys[i];

    if (
      row.hasOwnProperty(key) &&
      row[key] !== null &&
      row[key] !== undefined &&
      String(row[key]).trim() !== ''
    ) {
      return row[key];
    }

    var normalized =
      kidlearnV3_4c1NormalizeLookupKey_(key);

    for (var actual in row) {
      if (!row.hasOwnProperty(actual)) continue;

      if (
        kidlearnV3_4c1NormalizeLookupKey_(actual) ===
        normalized
      ) {
        if (
          row[actual] !== null &&
          row[actual] !== undefined &&
          String(row[actual]).trim() !== ''
        ) {
          return row[actual];
        }
      }
    }
  }

  return '';
}


function kidlearnV3_4c1NormalizeLookupKey_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .replace(/-/g, '')
    .replace(/[^\w]/g, '');
}


function kidlearnV3_4c1IsBlankRow_(row) {
  for (var i = 0; i < row.length; i++) {
    if (
      row[i] !== null &&
      row[i] !== undefined &&
      String(row[i]).trim() !== ''
    ) {
      return false;
    }
  }

  return true;
}


function kidlearnV3_4c1FindBy_(items, field, value) {
  for (var i = 0; i < items.length; i++) {
    if (String(items[i][field]) === String(value)) {
      return items[i];
    }
  }

  return null;
}


function kidlearnV3_4c1ToNumber_(value, fallback) {
  var number =
    Number(value);

  if (isNaN(number)) {
    return fallback || 0;
  }

  return number;
}


function kidlearnV3_4c1ToBool_(value, fallback) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ''
  ) {
    return fallback;
  }

  var text =
    String(value)
      .trim()
      .toUpperCase();

  if (
    text === 'TRUE' ||
    text === 'YES' ||
    text === 'ACTIVE' ||
    text === '1' ||
    text === 'ĐÚNG' ||
    text === 'DUNG'
  ) {
    return true;
  }

  if (
    text === 'FALSE' ||
    text === 'NO' ||
    text === 'INACTIVE' ||
    text === '0' ||
    text === 'SAI'
  ) {
    return false;
  }

  return fallback;
}


function kidlearnV3_4c1Clamp_(value, min, max) {
  var number =
    kidlearnV3_4c1ToNumber_(value, min);

  if (number < min) return min;
  if (number > max) return max;

  return number;
}


function kidlearnV3_4c1SafeCall_(functionName) {
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
        output: null
      };
    }

    var fn =
      eval(functionName);

    var output =
      fn();

    return {
      success:
        output && output.success === true,
      functionName: functionName,
      message:
        output && output.success === true
          ? ''
          : JSON.stringify(output),
      output: output
    };

  } catch (error) {
    return {
      success: false,
      functionName: functionName,
      message:
        String(error.message || error),
      output: null
    };
  }
}


function kidlearnV3_4c1SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase: result.phase,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.PARENT_PHASE,
      status: status,
      nextBundle:
        KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_SUBJECT_DASHBOARD_4C1_CONFIG.NEXT_STAGE,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      selectedSubjectCode:
        result.selectedSubjectCode || '',
      lessonCount:
        result.lessonCount || 0,
      skillCount:
        result.skillCount || 0,
      reviewItemCount:
        result.reviewItemCount || 0,
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


function kidlearnV3_4c1ReadJsonProperty_(key) {
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