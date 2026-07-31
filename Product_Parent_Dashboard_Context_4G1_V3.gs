/**
 * ================================================================
 * KIDLEARN V3 - PARENT DASHBOARD CONTEXT READ-ONLY
 * Step: 4G-1
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Build read-only context for Parent Dashboard.
 * - Summarize child learning progress, review queue, retry queue,
 *   recent activity, and subject progress.
 *
 * Safety:
 * - Không ghi DATA_StudySessions.
 * - Không ghi DATA_LessonProgress.
 * - Không ghi DATA_Responses.
 * - Không ghi DATA_DailyGoals.
 * - Không ghi LOG_Audit.
 * - Không ghi Google Drive.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4G-1.
 */


var KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4G1_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4G1_LAST_PREVIEW_AT',
  LAST_CHECK_AT: 'KIDLEARN_V3_PHASE_4G1_LAST_CHECK_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4G1_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4G1_LAST_RESULT_JSON'
};


var KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  CHECK_PASSED: 'CHECK_PASSED',
  READY_FOR_4G_2: 'READY_FOR_4G_2',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG = {
  PHASE: '4G-1',
  PARENT_PHASE: '4G',
  PREVIOUS_PHASE: '4F',
  NEXT_BUNDLE: '4G-2',
  NEXT_STAGE: 'PARENT_DASHBOARD_UI_OVERVIEW',
  CONTEXT_NAME: 'PARENT_DASHBOARD_CONTEXT_READ_ONLY',
  DEFAULT_CHILD_ID: 'CHD_V2_CHILD_DEFAULT',
  DEFAULT_PARENT_ID: 'PARENT',
  RECENT_ACTIVITY_LIMIT: 12,
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Main context for Parent Dashboard UI.
 *
 * options:
 * {
 *   parentId: 'PARENT',
 *   childId: 'CHD_V2_CHILD_DEFAULT',
 *   recentLimit: 12
 * }
 */
function kidlearnV3_getParentDashboardContext4G1V3(options) {
  var result =
    kidlearnV3_4g1BuildParentDashboardContext_(options || {});

  result.action =
    'GET_PARENT_DASHBOARD_CONTEXT_4G_1_V3';

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4G-1 parent dashboard context failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Preview 4G-1.
 */
function kidlearnV3_previewParentDashboardContext4G1V3() {
  var result =
    kidlearnV3_4g1BuildParentDashboardContext_({});

  result.action =
    'PREVIEW_PARENT_DASHBOARD_CONTEXT_4G_1_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_STATUS.PREVIEWED
      : KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_STATUS.FAILED;

  kidlearnV3_4g1SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4G-1 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Check 4G-1.
 */
function kidlearnV3_checkParentDashboardContext4G1V3() {
  var result =
    kidlearnV3_4g1BuildParentDashboardContext_({});

  result.action =
    'CHECK_PARENT_DASHBOARD_CONTEXT_4G_1_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_STATUS.CHECK_PASSED
      : KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_STATUS.FAILED;

  kidlearnV3_4g1SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_KEYS.LAST_CHECK_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4G-1 check failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready for 4G-2.
 */
function kidlearnV3_markParentDashboardContext4G1ReadyV3() {
  var check =
    kidlearnV3_checkParentDashboardContext4G1V3();

  if (!check.success) {
    throw new Error('4G-1 check chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_PARENT_DASHBOARD_CONTEXT_4G_1_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_STATUS.READY_FOR_4G_2,
    contextName:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.CONTEXT_NAME,
    childId:
      check.child ? check.child.childId : '',
    dashboardSummary:
      check.dashboardSummary || {},
    nextBundle:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    message:
      '4G-1 ready. Có thể qua 4G-2 để tạo Parent Dashboard UI Overview.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4g1SaveStatus_(
    result,
    KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_STATUS.READY_FOR_4G_2,
    KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get 4G-1 status.
 */
function kidlearnV3_getParentDashboardContext4G1StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PARENT_DASHBOARD_CONTEXT_4G_1_STATUS_V3',
    phase:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastCheckAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_KEYS.LAST_CHECK_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4g1ReadJsonProperty_(
        KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_KEYS.LAST_RESULT_JSON
      ),
    nextBundle:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertParentDashboardContext4G1ReadyV3() {
  var status =
    kidlearnV3_getParentDashboardContext4G1StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_STATUS.READY_FOR_4G_2
  ) {
    errors.push(
      '4G-1 chưa READY_FOR_4G_2. Status=' +
      status.status
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_PARENT_DASHBOARD_CONTEXT_4G_1_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.PHASE,
    status:
      status.status,
    nextBundle:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.NEXT_STAGE,
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
 * QA batch 4G-1.
 */
function kidlearnV3_runQaBatch4G1V3() {
  var preview =
    kidlearnV3_previewParentDashboardContext4G1V3();

  var check =
    kidlearnV3_checkParentDashboardContext4G1V3();

  var ready =
    kidlearnV3_markParentDashboardContext4G1ReadyV3();

  var assertReady =
    kidlearnV3_assertParentDashboardContext4G1ReadyV3();

  var result = {
    success:
      preview.success === true &&
      check.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4G_1_PARENT_DASHBOARD_CONTEXT_READ_ONLY',
    phase:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_STATUS.READY_FOR_4G_2,
    nextBundle:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.NEXT_STAGE,
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
    throw new Error('4G-1 QA batch failed.');
  }

  return result;
}


/**
 * Build Parent Dashboard Context.
 */
function kidlearnV3_4g1BuildParentDashboardContext_(options) {
  options = options || {};

  var errors = [];
  var warnings = [];

  var parentId =
    String(
      options.parentId ||
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.DEFAULT_PARENT_ID
    ).trim();

  var childId =
    String(
      options.childId ||
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.DEFAULT_CHILD_ID
    ).trim();

  var recentLimit =
    Number(
      options.recentLimit ||
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.RECENT_ACTIVITY_LIMIT
    );

  if (isNaN(recentLimit) || recentLimit <= 0) {
    recentLimit = KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.RECENT_ACTIVITY_LIMIT;
  }

  var dev =
    kidlearnV3_4g1CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var phase4F =
    kidlearnV3_4g1SafeCall_(
      'kidlearnV3_assertPhase4FClosedLockedV3'
    );

  if (!phase4F.success) {
    errors.push(
      'Phase 4F chưa closed locked: ' +
      phase4F.message
    );
  }

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4g1OpenSpreadsheet_();
  } catch (errorOpen) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(errorOpen.message || errorOpen)
    );
  }

  var data = {
    childMap: {},
    subjectMap: {},
    sessions: [],
    lessonProgress: [],
    responses: [],
    dailyGoals: [],
    achievements: []
  };

  var dataAvailability = {};

  if (spreadsheet) {
    data.childMap =
      kidlearnV3_4g1BuildChildMap_(spreadsheet, dataAvailability);

    data.subjectMap =
      kidlearnV3_4g1BuildSubjectMap_(spreadsheet, dataAvailability);

    data.sessions =
      kidlearnV3_4g1ReadStudySessions_(spreadsheet, childId, dataAvailability, warnings);

    data.lessonProgress =
      kidlearnV3_4g1ReadLessonProgress_(spreadsheet, childId, dataAvailability, warnings);

    data.responses =
      kidlearnV3_4g1ReadResponses_(spreadsheet, childId, dataAvailability, warnings);

    data.dailyGoals =
      kidlearnV3_4g1ReadDailyGoals_(spreadsheet, childId, dataAvailability, warnings);

    data.achievements =
      kidlearnV3_4g1ReadAchievements_(spreadsheet, childId, dataAvailability, warnings);
  }

  var child =
    kidlearnV3_4g1ResolveChildInfo_(
      childId,
      data.childMap
    );

  var overviewToday =
    kidlearnV3_4g1BuildTodayOverview_(
      data.sessions,
      data.responses,
      data.dailyGoals
    );

  var progressBySubject =
    kidlearnV3_4g1BuildSubjectProgressOverview_(
      data.subjectMap,
      data.lessonProgress,
      data.sessions,
      data.responses
    );

  var handwritingSummary =
    kidlearnV3_4g1BuildHandwritingSummary_(
      data.responses
    );

  var reviewSummary =
    kidlearnV3_4g1BuildReviewSummary_(
      handwritingSummary
    );

  var retrySummary =
    kidlearnV3_4g1BuildRetrySummary_(
      data.responses
    );

  var recentActivities =
    kidlearnV3_4g1BuildRecentActivities_(
      data.sessions,
      data.lessonProgress,
      data.responses,
      data.achievements,
      recentLimit
    );

  var dashboardSummary = {
    todaySessionCount:
      overviewToday.todaySessionCount,
    todayDurationMinutes:
      overviewToday.todayDurationMinutes,
    completedLessonCount:
      kidlearnV3_4g1CountCompletedLessons_(data.lessonProgress),
    subjectCount:
      progressBySubject.subjectCount,
    pendingReviewCount:
      reviewSummary.pendingReviewCount,
    retryCount:
      retrySummary.retryCount,
    recentActivityCount:
      recentActivities.items.length
  };

  var parentDashboard = {
    title:
      'Dashboard phụ huynh',
    subtitle:
      'Theo dõi tiến độ học tập của bé',
    parentId:
      parentId,
    child:
      child,
    dashboardSummary:
      dashboardSummary,
    overviewToday:
      overviewToday,
    progressBySubject:
      progressBySubject,
    handwritingSummary:
      handwritingSummary,
    reviewSummary:
      reviewSummary,
    retrySummary:
      retrySummary,
    recentActivities:
      recentActivities,
    dataAvailability:
      dataAvailability,
    uiPolicy: {
      readOnlyNow:
        true,
      parentOnly:
        true,
      childCanSeeParentDashboard:
        false,
      showTodayOverview:
        true,
      showSubjectProgress:
        true,
      showPendingReview:
        true,
      showRetrySummary:
        true,
      showRecentActivities:
        true,
      nextUiStep:
        '4G-2'
    }
  };

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_PARENT_DASHBOARD_CONTEXT_4G_1_V3',
    phase:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.PARENT_PHASE,
    contextName:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.CONTEXT_NAME,
    parentId:
      parentId,
    child:
      child,
    dashboardSummary:
      dashboardSummary,
    parentDashboard:
      parentDashboard,
    nextBundle:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.NEXT_STAGE,
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
      kidlearnV3_4g1UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4g1UniqueArray_(warnings)
  };
}


/**
 * Child map.
 */
function kidlearnV3_4g1BuildChildMap_(spreadsheet, availability) {
  availability.DATA_Children = {
    exists: false,
    rows: 0
  };

  var map = {};

  var sheet =
    kidlearnV3_4g1GetSheetByExactName_(
      spreadsheet,
      'DATA_Children'
    );

  if (!sheet) {
    return map;
  }

  availability.DATA_Children.exists = true;
  availability.DATA_Children.rows =
    Math.max(0, sheet.getLastRow() - 1);

  if (sheet.getLastRow() < 2) {
    return map;
  }

  var headers =
    kidlearnV3_4g1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var childId =
      kidlearnV3_4g1ReadValueByAliases_(
        row,
        headers,
        ['childId', 'id']
      );

    var name =
      kidlearnV3_4g1ReadValueByAliases_(
        row,
        headers,
        ['childName', 'fullName', 'name', 'displayName']
      );

    var grade =
      kidlearnV3_4g1ReadValueByAliases_(
        row,
        headers,
        ['grade', 'class', 'level']
      );

    childId =
      String(childId || '').trim();

    if (childId) {
      map[childId] = {
        childId:
          childId,
        name:
          String(name || 'Bé').trim() || 'Bé',
        grade:
          String(grade || '').trim()
      };
    }
  }

  return map;
}


/**
 * Subject map.
 */
function kidlearnV3_4g1BuildSubjectMap_(spreadsheet, availability) {
  availability.MST_Subjects = {
    exists: false,
    rows: 0
  };

  var map = {};

  var sheet =
    kidlearnV3_4g1GetSheetByExactName_(
      spreadsheet,
      'MST_Subjects'
    );

  if (!sheet) {
    return map;
  }

  availability.MST_Subjects.exists = true;
  availability.MST_Subjects.rows =
    Math.max(0, sheet.getLastRow() - 1);

  if (sheet.getLastRow() < 2) {
    return map;
  }

  var headers =
    kidlearnV3_4g1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var code =
      kidlearnV3_4g1ReadValueByAliases_(
        row,
        headers,
        ['subjectCode', 'subjectId', 'code', 'id']
      );

    var name =
      kidlearnV3_4g1ReadValueByAliases_(
        row,
        headers,
        ['subjectName', 'name', 'title']
      );

    code =
      String(code || '').trim();

    if (code) {
      map[code] = {
        subjectCode:
          code,
        subjectName:
          String(name || code).trim()
      };
    }
  }

  return map;
}


/**
 * Read DATA_StudySessions.
 */
function kidlearnV3_4g1ReadStudySessions_(spreadsheet, childId, availability, warnings) {
  availability.DATA_StudySessions = {
    exists: false,
    rows: 0
  };

  var rows = [];

  var sheet =
    kidlearnV3_4g1GetSheetByExactName_(
      spreadsheet,
      'DATA_StudySessions'
    );

  if (!sheet) {
    warnings.push('DATA_StudySessions chưa có hoặc không tìm thấy.');
    return rows;
  }

  availability.DATA_StudySessions.exists = true;
  availability.DATA_StudySessions.rows =
    Math.max(0, sheet.getLastRow() - 1);

  if (sheet.getLastRow() < 2) {
    return rows;
  }

  var headers =
    kidlearnV3_4g1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var itemChildId =
      String(
        kidlearnV3_4g1ReadValueByAliases_(
          row,
          headers,
          ['childId', 'studentId', 'learnerId']
        ) || ''
      ).trim();

    if (childId && itemChildId && itemChildId !== childId) {
      continue;
    }

    rows.push({
      sessionId:
        String(kidlearnV3_4g1ReadValueByAliases_(row, headers, ['sessionId', 'id']) || ''),
      childId:
        itemChildId || childId,
      lessonId:
        String(kidlearnV3_4g1ReadValueByAliases_(row, headers, ['lessonId']) || ''),
      subjectCode:
        String(kidlearnV3_4g1ReadValueByAliases_(row, headers, ['subjectCode', 'subjectId']) || ''),
      status:
        String(kidlearnV3_4g1ReadValueByAliases_(row, headers, ['status']) || ''),
      startedAt:
        kidlearnV3_4g1ToIso_(
          kidlearnV3_4g1ReadValueByAliases_(row, headers, ['startedAt', 'startAt', 'createdAt'])
        ),
      endedAt:
        kidlearnV3_4g1ToIso_(
          kidlearnV3_4g1ReadValueByAliases_(row, headers, ['endedAt', 'endAt'])
        ),
      durationSeconds:
        kidlearnV3_4g1ToNumber_(
          kidlearnV3_4g1ReadValueByAliases_(row, headers, ['durationSeconds', 'durationSec', 'duration'])
        ),
      sourceRow:
        i + 2
    });
  }

  return rows;
}


/**
 * Read DATA_LessonProgress.
 */
function kidlearnV3_4g1ReadLessonProgress_(spreadsheet, childId, availability, warnings) {
  availability.DATA_LessonProgress = {
    exists: false,
    rows: 0
  };

  var rows = [];

  var sheet =
    kidlearnV3_4g1GetSheetByExactName_(
      spreadsheet,
      'DATA_LessonProgress'
    );

  if (!sheet) {
    warnings.push('DATA_LessonProgress chưa có hoặc không tìm thấy.');
    return rows;
  }

  availability.DATA_LessonProgress.exists = true;
  availability.DATA_LessonProgress.rows =
    Math.max(0, sheet.getLastRow() - 1);

  if (sheet.getLastRow() < 2) {
    return rows;
  }

  var headers =
    kidlearnV3_4g1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var itemChildId =
      String(
        kidlearnV3_4g1ReadValueByAliases_(
          row,
          headers,
          ['childId', 'studentId', 'learnerId']
        ) || ''
      ).trim();

    if (childId && itemChildId && itemChildId !== childId) {
      continue;
    }

    rows.push({
      progressId:
        String(kidlearnV3_4g1ReadValueByAliases_(row, headers, ['progressId', 'id']) || ''),
      childId:
        itemChildId || childId,
      lessonId:
        String(kidlearnV3_4g1ReadValueByAliases_(row, headers, ['lessonId']) || ''),
      subjectCode:
        String(kidlearnV3_4g1ReadValueByAliases_(row, headers, ['subjectCode', 'subjectId']) || ''),
      status:
        String(kidlearnV3_4g1ReadValueByAliases_(row, headers, ['status']) || ''),
      progressPercent:
        kidlearnV3_4g1ToNumber_(
          kidlearnV3_4g1ReadValueByAliases_(row, headers, ['progressPercent', 'percent', 'completionPercent'])
        ),
      updatedAt:
        kidlearnV3_4g1ToIso_(
          kidlearnV3_4g1ReadValueByAliases_(row, headers, ['updatedAt', 'lastUpdatedAt', 'completedAt'])
        ),
      sourceRow:
        i + 2
    });
  }

  return rows;
}


/**
 * Read DATA_Responses with metadata.
 */
function kidlearnV3_4g1ReadResponses_(spreadsheet, childId, availability, warnings) {
  availability.DATA_Responses = {
    exists: false,
    rows: 0,
    metadataColumn: ''
  };

  var rows = [];

  var sheet =
    kidlearnV3_4g1GetSheetByExactName_(
      spreadsheet,
      'DATA_Responses'
    );

  if (!sheet) {
    warnings.push('DATA_Responses chưa có hoặc không tìm thấy.');
    return rows;
  }

  availability.DATA_Responses.exists = true;
  availability.DATA_Responses.rows =
    Math.max(0, sheet.getLastRow() - 1);

  if (sheet.getLastRow() < 2) {
    return rows;
  }

  var headers =
    kidlearnV3_4g1ReadHeaders_(sheet);

  var metaIndex =
    kidlearnV3_4g1ResolveMetadataColumnIndex_(sheet, headers);

  availability.DATA_Responses.metadataColumn =
    metaIndex >= 0 ? String(headers[metaIndex] || '') : '';

  if (metaIndex < 0) {
    warnings.push(
      'DATA_Responses chưa tìm được metadata column. Handwriting summary có thể bằng 0.'
    );
  }

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var metaText =
      metaIndex >= 0
        ? String(row[metaIndex] || '')
        : '';

    var parsed =
      kidlearnV3_4g1SafeJsonParse_(metaText);

    var meta =
      parsed.success ? parsed.value || {} : {};

    var asset =
      meta.handwritingAsset || {};

    var review =
      meta.handwritingReview || {};

    var itemChildId =
      String(
        kidlearnV3_4g1ReadValueByAliases_(
          row,
          headers,
          ['childId', 'studentId', 'learnerId']
        ) ||
        meta.childId ||
        asset.childId ||
        ''
      ).trim();

    if (childId && itemChildId && itemChildId !== childId) {
      continue;
    }

    var reviewStatus =
      String(
        review.status ||
        asset.reviewStatus ||
        ''
      ).trim().toUpperCase();

    rows.push({
      responseId:
        String(
          kidlearnV3_4g1ReadValueByAliases_(row, headers, ['responseId', 'id']) ||
          meta.responseId ||
          asset.responseId ||
          ''
        ),
      childId:
        itemChildId || childId,
      lessonId:
        String(
          kidlearnV3_4g1ReadValueByAliases_(row, headers, ['lessonId']) ||
          meta.lessonId ||
          asset.lessonId ||
          ''
        ),
      activityId:
        String(
          kidlearnV3_4g1ReadValueByAliases_(row, headers, ['activityId']) ||
          meta.activityId ||
          asset.activityId ||
          ''
        ),
      subjectCode:
        String(
          kidlearnV3_4g1ReadValueByAliases_(row, headers, ['subjectCode', 'subjectId']) ||
          meta.subjectCode ||
          asset.subjectCode ||
          ''
        ),
      answerMode:
        String(
          kidlearnV3_4g1ReadValueByAliases_(row, headers, ['answerMode']) ||
          meta.answerMode ||
          asset.answerMode ||
          ''
        ),
      status:
        String(kidlearnV3_4g1ReadValueByAliases_(row, headers, ['status']) || ''),
      isCorrect:
        kidlearnV3_4g1ToBoolean_(
          kidlearnV3_4g1ReadValueByAliases_(row, headers, ['isCorrect', 'correct'])
        ),
      score:
        kidlearnV3_4g1ToNumber_(
          kidlearnV3_4g1ReadValueByAliases_(row, headers, ['score', 'points'])
        ),
      createdAt:
        kidlearnV3_4g1ToIso_(
          kidlearnV3_4g1ReadValueByAliases_(row, headers, ['createdAt', 'submittedAt', 'updatedAt']) ||
          meta.createdAt ||
          meta.updatedAt ||
          asset.createdAt ||
          review.reviewedAt
        ),
      hasHandwritingAsset:
        !!asset.fileId || !!asset.fileUrl,
      handwritingReviewStatus:
        reviewStatus,
      reviewerNote:
        String(review.reviewerNote || ''),
      reviewedAt:
        String(review.reviewedAt || ''),
      reviewedBy:
        String(review.reviewedBy || ''),
      fileId:
        String(asset.fileId || ''),
      fileUrl:
        String(asset.fileUrl || ''),
      sourceRow:
        i + 2
    });
  }

  return rows;
}


/**
 * Read DATA_DailyGoals.
 */
function kidlearnV3_4g1ReadDailyGoals_(spreadsheet, childId, availability, warnings) {
  availability.DATA_DailyGoals = {
    exists: false,
    rows: 0
  };

  var rows = [];

  var sheet =
    kidlearnV3_4g1GetSheetByExactName_(
      spreadsheet,
      'DATA_DailyGoals'
    );

  if (!sheet) {
    warnings.push('DATA_DailyGoals chưa có hoặc không tìm thấy.');
    return rows;
  }

  availability.DATA_DailyGoals.exists = true;
  availability.DATA_DailyGoals.rows =
    Math.max(0, sheet.getLastRow() - 1);

  if (sheet.getLastRow() < 2) {
    return rows;
  }

  var headers =
    kidlearnV3_4g1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var itemChildId =
      String(
        kidlearnV3_4g1ReadValueByAliases_(
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
        String(kidlearnV3_4g1ReadValueByAliases_(row, headers, ['goalId', 'dailyGoalId', 'id']) || ''),
      childId:
        itemChildId || childId,
      goalDate:
        kidlearnV3_4g1ToDateKey_(
          kidlearnV3_4g1ReadValueByAliases_(row, headers, ['goalDate', 'date', 'createdAt'])
        ),
      targetMinutes:
        kidlearnV3_4g1ToNumber_(
          kidlearnV3_4g1ReadValueByAliases_(row, headers, ['targetMinutes', 'targetMinute', 'minutes'])
        ),
      completedMinutes:
        kidlearnV3_4g1ToNumber_(
          kidlearnV3_4g1ReadValueByAliases_(row, headers, ['completedMinutes', 'actualMinutes', 'doneMinutes'])
        ),
      status:
        String(kidlearnV3_4g1ReadValueByAliases_(row, headers, ['status']) || ''),
      sourceRow:
        i + 2
    });
  }

  return rows;
}


/**
 * Read DATA_ChildAchievements.
 */
function kidlearnV3_4g1ReadAchievements_(spreadsheet, childId, availability, warnings) {
  availability.DATA_ChildAchievements = {
    exists: false,
    rows: 0
  };

  var rows = [];

  var sheet =
    kidlearnV3_4g1GetSheetByExactName_(
      spreadsheet,
      'DATA_ChildAchievements'
    );

  if (!sheet) {
    warnings.push('DATA_ChildAchievements chưa có hoặc không tìm thấy.');
    return rows;
  }

  availability.DATA_ChildAchievements.exists = true;
  availability.DATA_ChildAchievements.rows =
    Math.max(0, sheet.getLastRow() - 1);

  if (sheet.getLastRow() < 2) {
    return rows;
  }

  var headers =
    kidlearnV3_4g1ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var itemChildId =
      String(
        kidlearnV3_4g1ReadValueByAliases_(
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
      achievementId:
        String(kidlearnV3_4g1ReadValueByAliases_(row, headers, ['achievementId', 'id']) || ''),
      title:
        String(kidlearnV3_4g1ReadValueByAliases_(row, headers, ['title', 'name']) || ''),
      earnedAt:
        kidlearnV3_4g1ToIso_(
          kidlearnV3_4g1ReadValueByAliases_(row, headers, ['earnedAt', 'createdAt', 'unlockedAt'])
        ),
      sourceRow:
        i + 2
    });
  }

  return rows;
}


/**
 * Dashboard calculations.
 */
function kidlearnV3_4g1BuildTodayOverview_(sessions, responses, dailyGoals) {
  var todayKey =
    kidlearnV3_4g1TodayKey_();

  var todaySessions = [];
  var todayDurationSeconds = 0;

  for (var i = 0; i < sessions.length; i++) {
    var dateKey =
      kidlearnV3_4g1ToDateKey_(sessions[i].startedAt || sessions[i].endedAt);

    if (dateKey === todayKey) {
      todaySessions.push(sessions[i]);
      todayDurationSeconds += Number(sessions[i].durationSeconds || 0);
    }
  }

  var todayResponses = [];

  for (var j = 0; j < responses.length; j++) {
    if (kidlearnV3_4g1ToDateKey_(responses[j].createdAt) === todayKey) {
      todayResponses.push(responses[j]);
    }
  }

  var todayGoal = null;

  for (var k = 0; k < dailyGoals.length; k++) {
    if (dailyGoals[k].goalDate === todayKey) {
      todayGoal = dailyGoals[k];
      break;
    }
  }

  return {
    date:
      todayKey,
    todaySessionCount:
      todaySessions.length,
    todayDurationMinutes:
      Math.round(todayDurationSeconds / 60),
    todayResponseCount:
      todayResponses.length,
    todayGoal:
      todayGoal,
    goalProgressPercent:
      todayGoal && todayGoal.targetMinutes
        ? Math.min(
            100,
            Math.round(
              Number(todayGoal.completedMinutes || 0) /
              Number(todayGoal.targetMinutes || 1) *
              100
            )
          )
        : 0,
    emptyState: {
      show:
        todaySessions.length === 0 && todayResponses.length === 0,
      title:
        'Hôm nay bé chưa có hoạt động học',
      message:
        'Khi bé học bài hoặc nộp bài, thông tin sẽ hiển thị ở đây.'
    }
  };
}


function kidlearnV3_4g1BuildSubjectProgressOverview_(subjectMap, lessonProgress, sessions, responses) {
  var map = {};

  for (var code in subjectMap) {
    if (subjectMap.hasOwnProperty(code)) {
      map[code] = {
        subjectCode:
          code,
        subjectName:
          subjectMap[code].subjectName || code,
        completedLessons:
          0,
        inProgressLessons:
          0,
        totalProgressItems:
          0,
        averageProgressPercent:
          0,
        sessionCount:
          0,
        responseCount:
          0,
        handwritingCount:
          0
      };
    }
  }

  function ensureSubject(code) {
    code =
      String(code || '').trim() || 'UNKNOWN';

    if (!map[code]) {
      map[code] = {
        subjectCode:
          code,
        subjectName:
          code === 'UNKNOWN' ? 'Chưa rõ môn học' : code,
        completedLessons:
          0,
        inProgressLessons:
          0,
        totalProgressItems:
          0,
        averageProgressPercent:
          0,
        sessionCount:
          0,
        responseCount:
          0,
        handwritingCount:
          0
      };
    }

    return map[code];
  }

  var percentSumBySubject = {};

  for (var i = 0; i < lessonProgress.length; i++) {
    var progress =
      lessonProgress[i];

    var item =
      ensureSubject(progress.subjectCode);

    item.totalProgressItems++;

    var status =
      String(progress.status || '').toUpperCase();

    var percent =
      Number(progress.progressPercent || 0);

    if (
      status === 'COMPLETED' ||
      percent >= 100
    ) {
      item.completedLessons++;
    } else {
      item.inProgressLessons++;
    }

    if (!percentSumBySubject[item.subjectCode]) {
      percentSumBySubject[item.subjectCode] = 0;
    }

    percentSumBySubject[item.subjectCode] += percent;
  }

  for (var j = 0; j < sessions.length; j++) {
    ensureSubject(sessions[j].subjectCode).sessionCount++;
  }

  for (var k = 0; k < responses.length; k++) {
    var responseSubject =
      ensureSubject(responses[k].subjectCode);

    responseSubject.responseCount++;

    if (responses[k].hasHandwritingAsset) {
      responseSubject.handwritingCount++;
    }
  }

  var items = [];

  for (var subjectCode in map) {
    if (map.hasOwnProperty(subjectCode)) {
      var entry =
        map[subjectCode];

      if (entry.totalProgressItems > 0) {
        entry.averageProgressPercent =
          Math.round(
            Number(percentSumBySubject[subjectCode] || 0) /
            entry.totalProgressItems
          );
      }

      items.push(entry);
    }
  }

  items.sort(function (a, b) {
    return String(a.subjectName).localeCompare(String(b.subjectName));
  });

  return {
    subjectCount:
      items.length,
    items:
      items,
    emptyState: {
      show:
        items.length === 0,
      title:
        'Chưa có dữ liệu tiến độ theo môn',
      message:
        'Khi bé học bài, tiến độ theo môn sẽ hiển thị ở đây.'
    }
  };
}


function kidlearnV3_4g1BuildHandwritingSummary_(responses) {
  var summary = {
    totalHandwritingCount: 0,
    pendingReviewCount: 0,
    acceptedCount: 0,
    retryCount: 0,
    capturedCount: 0,
    otherStatusCount: 0,
    statsByStatus: {}
  };

  for (var i = 0; i < responses.length; i++) {
    if (!responses[i].hasHandwritingAsset) {
      continue;
    }

    summary.totalHandwritingCount++;

    var status =
      String(responses[i].handwritingReviewStatus || '')
        .trim()
        .toUpperCase();

    if (!status) {
      status = 'UNKNOWN';
    }

    if (!summary.statsByStatus[status]) {
      summary.statsByStatus[status] = 0;
    }

    summary.statsByStatus[status]++;

    if (
      status === 'NEEDS_REVIEW' ||
      status === 'HANDWRITING_CAPTURED'
    ) {
      summary.pendingReviewCount++;
    } else if (status === 'REVIEWED_ACCEPTED') {
      summary.acceptedCount++;
    } else if (status === 'REVIEWED_RETRY') {
      summary.retryCount++;
    } else {
      summary.otherStatusCount++;
    }

    if (status === 'HANDWRITING_CAPTURED') {
      summary.capturedCount++;
    }
  }

  return summary;
}


function kidlearnV3_4g1BuildReviewSummary_(handwritingSummary) {
  return {
    title:
      'Bài viết tay cần duyệt',
    pendingReviewCount:
      handwritingSummary.pendingReviewCount,
    totalHandwritingCount:
      handwritingSummary.totalHandwritingCount,
    acceptedCount:
      handwritingSummary.acceptedCount,
    retryCount:
      handwritingSummary.retryCount,
    statsByStatus:
      handwritingSummary.statsByStatus,
    hasPendingReview:
      handwritingSummary.pendingReviewCount > 0,
    uiAction:
      'OPEN_PARENT_REVIEW_QUEUE',
    emptyState: {
      show:
        handwritingSummary.pendingReviewCount === 0,
      title:
        'Không có bài viết tay chờ duyệt',
      message:
        'Khi bé nộp bài viết tay mới, bài sẽ xuất hiện trong mục duyệt.'
    }
  };
}


function kidlearnV3_4g1BuildRetrySummary_(responses) {
  var items = [];

  for (var i = 0; i < responses.length; i++) {
    var status =
      String(responses[i].handwritingReviewStatus || '')
        .trim()
        .toUpperCase();

    if (status === 'REVIEWED_RETRY') {
      items.push({
        responseId:
          responses[i].responseId,
        lessonId:
          responses[i].lessonId,
        subjectCode:
          responses[i].subjectCode,
        reviewerNote:
          responses[i].reviewerNote,
        reviewedAt:
          responses[i].reviewedAt
      });
    }
  }

  return {
    title:
      'Bài bé cần làm lại',
    retryCount:
      items.length,
    items:
      items,
    hasRetry:
      items.length > 0,
    uiAction:
      'OPEN_CHILD_RETRY_VIEW',
    emptyState: {
      show:
        items.length === 0,
      title:
        'Bé chưa có bài cần làm lại',
      message:
        'Khi phụ huynh yêu cầu làm lại, bài sẽ xuất hiện trên màn hình bé.'
    }
  };
}


function kidlearnV3_4g1BuildRecentActivities_(sessions, progress, responses, achievements, limit) {
  var items = [];

  for (var i = 0; i < sessions.length; i++) {
    items.push({
      type:
        'STUDY_SESSION',
      title:
        'Bé đã học bài',
      subtitle:
        sessions[i].lessonId || sessions[i].subjectCode || '',
      at:
        sessions[i].endedAt || sessions[i].startedAt || '',
      subjectCode:
        sessions[i].subjectCode || '',
      icon:
        '📘'
    });
  }

  for (var j = 0; j < progress.length; j++) {
    var status =
      String(progress[j].status || '').toUpperCase();

    if (status === 'COMPLETED' || Number(progress[j].progressPercent || 0) >= 100) {
      items.push({
        type:
          'LESSON_COMPLETED',
        title:
          'Hoàn thành bài học',
        subtitle:
          progress[j].lessonId || '',
        at:
          progress[j].updatedAt || '',
        subjectCode:
          progress[j].subjectCode || '',
        icon:
          '✅'
      });
    }
  }

  for (var k = 0; k < responses.length; k++) {
    if (responses[k].hasHandwritingAsset) {
      items.push({
        type:
          'HANDWRITING_RESPONSE',
        title:
          'Nộp bài viết tay',
        subtitle:
          responses[k].handwritingReviewStatus || 'HANDWRITING',
        at:
          responses[k].createdAt || responses[k].reviewedAt || '',
        subjectCode:
          responses[k].subjectCode || '',
        icon:
          '✍️'
      });
    }
  }

  for (var a = 0; a < achievements.length; a++) {
    items.push({
      type:
        'ACHIEVEMENT',
      title:
        achievements[a].title || 'Bé đạt thành tích mới',
      subtitle:
        achievements[a].achievementId || '',
      at:
        achievements[a].earnedAt || '',
      subjectCode:
        '',
      icon:
        '🏆'
    });
  }

  items.sort(function (x, y) {
    return kidlearnV3_4g1DateValue_(y.at) - kidlearnV3_4g1DateValue_(x.at);
  });

  if (items.length > limit) {
    items = items.slice(0, limit);
  }

  return {
    title:
      'Hoạt động gần đây',
    itemCount:
      items.length,
    items:
      items,
    emptyState: {
      show:
        items.length === 0,
      title:
        'Chưa có hoạt động gần đây',
      message:
        'Hoạt động học tập của bé sẽ hiển thị ở đây.'
    }
  };
}


function kidlearnV3_4g1CountCompletedLessons_(lessonProgress) {
  var count = 0;

  for (var i = 0; i < lessonProgress.length; i++) {
    var status =
      String(lessonProgress[i].status || '').toUpperCase();

    if (
      status === 'COMPLETED' ||
      Number(lessonProgress[i].progressPercent || 0) >= 100
    ) {
      count++;
    }
  }

  return count;
}


/**
 * Metadata column helper.
 */
function kidlearnV3_4g1ResolveMetadataColumnIndex_(sheet, headers) {
  var direct =
    kidlearnV3_4g1FindColumnIndexByAliases_(
      headers,
      [
        'answerMetaJson',
        'answerMetaJSON',
        'answerMetadataJson',
        'responseMetaJson',
        'responseMetadataJson',
        'detailsJson',
        'metaJson',
        'payloadJson',
        'metadataJson',
        'metadata',
        'answerMeta',
        'details',
        'payload'
      ]
    );

  if (direct >= 0) {
    return direct;
  }

  var scanned =
    kidlearnV3_4g1ScanMetadataColumnByJson_(sheet, headers);

  if (scanned >= 0) {
    return scanned;
  }

  return -1;
}


function kidlearnV3_4g1ScanMetadataColumnByJson_(sheet, headers) {
  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (lastRow < 2 || lastColumn < 1) {
    return -1;
  }

  var rowCount =
    Math.min(lastRow - 1, 80);

  var values =
    sheet
      .getRange(2, 1, rowCount, lastColumn)
      .getValues();

  var scores = [];

  for (var c = 0; c < lastColumn; c++) {
    scores[c] = 0;
  }

  for (var r = 0; r < values.length; r++) {
    for (var col = 0; col < lastColumn; col++) {
      var text =
        String(values[r][col] || '').trim();

      if (!text) continue;

      if (
        text.indexOf('{') !== 0 &&
        text.indexOf('[') !== 0
      ) {
        continue;
      }

      var parsed =
        kidlearnV3_4g1SafeJsonParse_(text);

      if (!parsed.success) continue;

      var meta =
        parsed.value || {};

      if (
        meta.handwritingAsset ||
        meta.handwritingReview ||
        meta.answerMode ||
        meta.updatedAt
      ) {
        scores[col]++;
      }
    }
  }

  var bestIndex = -1;
  var bestScore = 0;

  for (var i = 0; i < scores.length; i++) {
    if (scores[i] > bestScore) {
      bestScore = scores[i];
      bestIndex = i;
    }
  }

  return bestScore > 0 ? bestIndex : -1;
}


/**
 * Resolve child.
 */
function kidlearnV3_4g1ResolveChildInfo_(childId, childMap) {
  childMap =
    childMap || {};

  var info =
    childMap[childId] || {};

  return {
    childId:
      childId,
    name:
      info.name || 'Bé',
    displayName:
      info.name || 'Bé',
    grade:
      info.grade || ''
  };
}


/**
 * Spreadsheet helpers.
 */
function kidlearnV3_4g1OpenSpreadsheet_() {
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


function kidlearnV3_4g1GetSheetByExactName_(spreadsheet, sheetName) {
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


function kidlearnV3_4g1ReadHeaders_(sheet) {
  if (!sheet || sheet.getLastColumn() < 1) {
    return [];
  }

  return sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];
}


/**
 * Header helpers.
 */
function kidlearnV3_4g1FindColumnIndexByAliases_(headers, aliases) {
  headers =
    headers || [];

  aliases =
    aliases || [];

  var normalizedAliases = {};

  for (var i = 0; i < aliases.length; i++) {
    normalizedAliases[
      kidlearnV3_4g1NormalizeHeader_(aliases[i])
    ] = true;
  }

  for (var j = 0; j < headers.length; j++) {
    var normalized =
      kidlearnV3_4g1NormalizeHeader_(headers[j]);

    if (normalizedAliases[normalized]) {
      return j;
    }
  }

  return -1;
}


function kidlearnV3_4g1ReadValueByAliases_(row, headers, aliases) {
  var index =
    kidlearnV3_4g1FindColumnIndexByAliases_(
      headers,
      aliases
    );

  if (index < 0) return '';

  return row[index];
}


function kidlearnV3_4g1NormalizeHeader_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .replace(/-/g, '');
}


/**
 * Date / value helpers.
 */
function kidlearnV3_4g1ToIso_(value) {
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


function kidlearnV3_4g1ToDateKey_(value) {
  if (!value) return '';

  var iso =
    kidlearnV3_4g1ToIso_(value);

  if (!iso) return '';

  if (iso.length >= 10 && iso.charAt(4) === '-') {
    return iso.substring(0, 10);
  }

  var date =
    new Date(iso);

  if (isNaN(date.getTime())) {
    return '';
  }

  return date.toISOString().substring(0, 10);
}


function kidlearnV3_4g1TodayKey_() {
  return new Date().toISOString().substring(0, 10);
}


function kidlearnV3_4g1DateValue_(value) {
  if (!value) return 0;

  var date =
    new Date(value);

  if (isNaN(date.getTime())) {
    return 0;
  }

  return date.getTime();
}


function kidlearnV3_4g1ToNumber_(value) {
  var number =
    Number(value || 0);

  return isNaN(number) ? 0 : number;
}


function kidlearnV3_4g1ToBoolean_(value) {
  if (value === true) return true;
  if (value === false) return false;

  var text =
    String(value || '').trim().toUpperCase();

  return (
    text === 'TRUE' ||
    text === 'YES' ||
    text === 'Y' ||
    text === '1'
  );
}


function kidlearnV3_4g1SafeJsonParse_(text) {
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
function kidlearnV3_4g1CheckDevSafety_() {
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
function kidlearnV3_4g1SafeCall_(functionName) {
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
          : kidlearnV3_4g1PreviewValue_(JSON.stringify(output || {})),
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


function kidlearnV3_4g1PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 350) {
    return text.substring(0, 350) + '...';
  }

  return text;
}


function kidlearnV3_4g1UniqueArray_(items) {
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
 * Save status.
 */
function kidlearnV3_4g1SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.PARENT_PHASE,
      status:
        status,
      contextName:
        KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.CONTEXT_NAME,
      childId:
        result.child ? result.child.childId : '',
      dashboardSummary:
        result.dashboardSummary || {},
      nextBundle:
        KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_PARENT_DASHBOARD_CONTEXT_4G1_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4g1ReadJsonProperty_(key) {
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