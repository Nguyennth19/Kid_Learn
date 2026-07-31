/**
 * ================================================================
 * KIDLEARN V3 - PARENT SUBJECT PROGRESS DETAIL
 * Step: 4G-3
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Parent clicks a subject card in 4G-2 dashboard.
 * - Show subject progress detail:
 *   + completed / in-progress lessons
 *   + sessions
 *   + responses
 *   + handwriting review status
 *   + recent subject activities
 *
 * Safety:
 * - Không ghi DATA_StudySessions.
 * - Không ghi DATA_LessonProgress.
 * - Không ghi DATA_Responses.
 * - Không ghi DATA_DailyGoals.
 * - Không ghi LOG_Audit.
 * - Không ghi Google Drive.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4G-3.
 */


var KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4G3_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4G3_LAST_PREVIEW_AT',
  LAST_CHECK_AT: 'KIDLEARN_V3_PHASE_4G3_LAST_CHECK_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4G3_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4G3_LAST_RESULT_JSON'
};


var KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  CHECK_PASSED: 'CHECK_PASSED',
  READY_FOR_4G_4: 'READY_FOR_4G_4',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG = {
  PHASE: '4G-3',
  PARENT_PHASE: '4G',
  PREVIOUS_BUNDLE: '4G-2',
  NEXT_BUNDLE: '4G-4',
  NEXT_STAGE: 'RECENT_ACTIVITY_TIMELINE',
  DETAIL_NAME: 'SUBJECT_PROGRESS_DETAIL_FOR_PARENT',
  DEFAULT_PARENT_ID: 'PARENT',
  DEFAULT_CHILD_ID: 'CHD_V2_CHILD_DEFAULT',
  RECENT_LIMIT: 12,
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Main function for UI.
 *
 * options:
 * {
 *   parentId: 'PARENT',
 *   childId: 'CHD_V2_CHILD_DEFAULT',
 *   subjectCode: 'SUB_TV'
 * }
 */
function kidlearnV3_getParentSubjectProgressDetail4G3V3(options) {
  var result =
    kidlearnV3_4g3BuildSubjectDetail_(options || {});

  result.action =
    'GET_PARENT_SUBJECT_PROGRESS_DETAIL_4G_3_V3';

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4G-3 subject progress detail failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Preview 4G-3.
 */
function kidlearnV3_previewParentSubjectProgressDetail4G3V3() {
  var result =
    kidlearnV3_4g3BuildReadiness_();

  result.action =
    'PREVIEW_PARENT_SUBJECT_PROGRESS_DETAIL_4G_3_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_STATUS.PREVIEWED
      : KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_STATUS.FAILED;

  kidlearnV3_4g3SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4G-3 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Check 4G-3.
 */
function kidlearnV3_checkParentSubjectProgressDetail4G3V3() {
  var result =
    kidlearnV3_4g3BuildReadiness_();

  result.action =
    'CHECK_PARENT_SUBJECT_PROGRESS_DETAIL_4G_3_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_STATUS.CHECK_PASSED
      : KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_STATUS.FAILED;

  kidlearnV3_4g3SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_KEYS.LAST_CHECK_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4G-3 check failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready for 4G-4.
 */
function kidlearnV3_markParentSubjectProgressDetail4G3ReadyV3() {
  var check =
    kidlearnV3_checkParentSubjectProgressDetail4G3V3();

  if (!check.success) {
    throw new Error('4G-3 check chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_PARENT_SUBJECT_PROGRESS_DETAIL_4G_3_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_STATUS.READY_FOR_4G_4,
    detailName:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.DETAIL_NAME,
    testedSubjectCode:
      check.subjectDetail && check.subjectDetail.subject
        ? check.subjectDetail.subject.subjectCode
        : '',
    nextBundle:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    message:
      '4G-3 ready. Có thể qua 4G-4 để làm Recent Activity Timeline.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4g3SaveStatus_(
    result,
    KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_STATUS.READY_FOR_4G_4,
    KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getParentSubjectProgressDetail4G3StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PARENT_SUBJECT_PROGRESS_DETAIL_4G_3_STATUS_V3',
    phase:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastCheckAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_KEYS.LAST_CHECK_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4g3ReadJsonProperty_(
        KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_KEYS.LAST_RESULT_JSON
      ),
    nextBundle:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertParentSubjectProgressDetail4G3ReadyV3() {
  var status =
    kidlearnV3_getParentSubjectProgressDetail4G3StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_STATUS.READY_FOR_4G_4
  ) {
    errors.push(
      '4G-3 chưa READY_FOR_4G_4. Status=' +
      status.status
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_PARENT_SUBJECT_PROGRESS_DETAIL_4G_3_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.PHASE,
    status:
      status.status,
    nextBundle:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.NEXT_STAGE,
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
 * QA batch.
 */
function kidlearnV3_runQaBatch4G3V3() {
  var preview =
    kidlearnV3_previewParentSubjectProgressDetail4G3V3();

  var check =
    kidlearnV3_checkParentSubjectProgressDetail4G3V3();

  var ready =
    kidlearnV3_markParentSubjectProgressDetail4G3ReadyV3();

  var assertReady =
    kidlearnV3_assertParentSubjectProgressDetail4G3ReadyV3();

  var result = {
    success:
      preview.success === true &&
      check.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4G_3_PARENT_SUBJECT_PROGRESS_DETAIL',
    phase:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_STATUS.READY_FOR_4G_4,
    nextBundle:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.NEXT_STAGE,
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
    throw new Error('4G-3 QA batch failed.');
  }

  return result;
}


/**
 * Build readiness.
 */
function kidlearnV3_4g3BuildReadiness_() {
  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4g3CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var g2 =
    kidlearnV3_4g3SafeCall_(
      'kidlearnV3_assertParentDashboardUi4G2ReadyV3'
    );

  if (!g2.success) {
    errors.push(
      '4G-2 chưa READY_FOR_4G_3: ' +
      g2.message
    );
  }

  var dashboardContext =
    kidlearnV3_4g3SafeCall_(
      'kidlearnV3_getParentDashboardContext4G1V3'
    );

  if (!dashboardContext.success) {
    errors.push(
      'Không đọc được Parent Dashboard Context 4G-1: ' +
      dashboardContext.message
    );
  }

  var subjectDetail = null;

  try {
    subjectDetail =
      kidlearnV3_getParentSubjectProgressDetail4G3V3({});
  } catch (errorDetail) {
    errors.push(
      'Không build được subject detail mặc định: ' +
      String(errorDetail.message || errorDetail)
    );
  }

  if (
    subjectDetail &&
    subjectDetail.subjectDetail &&
    subjectDetail.subjectDetail.emptyState &&
    subjectDetail.subjectDetail.emptyState.show === true
  ) {
    warnings.push(
      'Chưa có subject data để hiển thị chi tiết. Đây là hợp lệ nếu DEV chưa có dữ liệu học.'
    );
  }

  var markers =
    kidlearnV3_4g3InspectUiMarkers_();

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
      'BUILD_PARENT_SUBJECT_PROGRESS_DETAIL_READINESS_4G_3_V3',
    phase:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.PARENT_PHASE,
    detailName:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.DETAIL_NAME,
    prerequisite: {
      phase4G2Ready:
        g2.success === true,
      dashboardContextReadable:
        dashboardContext.success === true,
      subjectDetailReadable:
        !!subjectDetail && subjectDetail.success === true
    },
    dashboardContext:
      dashboardContext.output || null,
    subjectDetail:
      subjectDetail,
    uiBehavior: {
      clickSubjectCardEnabled:
        true,
      parentOnly:
        true,
      readOnlyNow:
        true,
      showLessonList:
        true,
      showHandwritingSummary:
        true,
      showSubjectRecentActivities:
        true
    },
    uiMarkers:
      markers,
    nextBundle:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.NEXT_STAGE,
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
      kidlearnV3_4g3UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4g3UniqueArray_(warnings)
  };
}


/**
 * Build subject detail.
 */
function kidlearnV3_4g3BuildSubjectDetail_(options) {
  options = options || {};

  var errors = [];
  var warnings = [];

  var parentId =
    String(
      options.parentId ||
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.DEFAULT_PARENT_ID
    ).trim();

  var childId =
    String(
      options.childId ||
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.DEFAULT_CHILD_ID
    ).trim();

  var subjectCode =
    String(options.subjectCode || '').trim();

  var dev =
    kidlearnV3_4g3CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var g2 =
    kidlearnV3_4g3SafeCall_(
      'kidlearnV3_assertParentDashboardUi4G2ReadyV3'
    );

  if (!g2.success) {
    errors.push(
      '4G-2 chưa READY_FOR_4G_3: ' +
      g2.message
    );
  }

  var dashboardContext = null;

  try {
    dashboardContext =
      kidlearnV3_getParentDashboardContext4G1V3({
        parentId:
          parentId,
        childId:
          childId,
        recentLimit:
          50
      });
  } catch (errorContext) {
    errors.push(
      'Không đọc được dashboard context 4G-1: ' +
      String(errorContext.message || errorContext)
    );
  }

  var dashboard =
    dashboardContext && dashboardContext.parentDashboard
      ? dashboardContext.parentDashboard
      : {};

  var progressItems =
    dashboard.progressBySubject && dashboard.progressBySubject.items
      ? dashboard.progressBySubject.items
      : [];

  if (!subjectCode && progressItems.length > 0) {
    subjectCode =
      String(progressItems[0].subjectCode || '').trim();
  }

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4g3OpenSpreadsheet_();
  } catch (errorOpen) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(errorOpen.message || errorOpen)
    );
  }

  var subjectMap = {};
  var lessonMap = {};
  var lessonProgress = [];
  var sessions = [];
  var responses = [];

  if (spreadsheet) {
    subjectMap =
      kidlearnV3_4g3BuildSubjectMap_(spreadsheet);

    lessonMap =
      kidlearnV3_4g3BuildLessonMap_(spreadsheet);

    if (subjectCode) {
      lessonProgress =
        kidlearnV3_4g3ReadLessonProgress_(
          spreadsheet,
          childId,
          subjectCode,
          warnings
        );

      sessions =
        kidlearnV3_4g3ReadStudySessions_(
          spreadsheet,
          childId,
          subjectCode,
          warnings
        );

      responses =
        kidlearnV3_4g3ReadResponses_(
          spreadsheet,
          childId,
          subjectCode,
          warnings
        );
    }
  }

  var selectedSubject =
    kidlearnV3_4g3ResolveSubject_(
      subjectCode,
      subjectMap,
      progressItems
    );

  var detail =
    kidlearnV3_4g3BuildDetailObject_({
      parentId:
        parentId,
      childId:
        childId,
      subject:
        selectedSubject,
      dashboard:
        dashboard,
      progressItems:
        progressItems,
      lessonMap:
        lessonMap,
      lessonProgress:
        lessonProgress,
      sessions:
        sessions,
      responses:
        responses
    });

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_PARENT_SUBJECT_PROGRESS_DETAIL_4G_3_V3',
    phase:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.PARENT_PHASE,
    detailName:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.DETAIL_NAME,
    parentId:
      parentId,
    child:
      dashboard.child || {
        childId: childId,
        displayName: 'Bé'
      },
    availableSubjects:
      progressItems,
    selectedSubjectCode:
      subjectCode,
    subjectDetail:
      detail,
    uiPolicy: {
      parentOnly:
        true,
      readOnlyNow:
        true,
      openFrom:
        'PARENT_DASHBOARD_SUBJECT_CARD_4G2',
      nextUiStep:
        '4G-4'
    },
    nextBundle:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.NEXT_STAGE,
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
      kidlearnV3_4g3UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4g3UniqueArray_(warnings)
  };
}


/**
 * Build detail object.
 */
function kidlearnV3_4g3BuildDetailObject_(params) {
  var subject =
    params.subject || {};

  var progressItems =
    params.progressItems || [];

  var lessonProgress =
    params.lessonProgress || [];

  var sessions =
    params.sessions || [];

  var responses =
    params.responses || [];

  var lessonMap =
    params.lessonMap || {};

  if (!subject.subjectCode) {
    return {
      subject:
        subject,
      summary: {
        completedLessons: 0,
        inProgressLessons: 0,
        averageProgressPercent: 0,
        sessionCount: 0,
        responseCount: 0,
        handwritingCount: 0,
        pendingReviewCount: 0,
        acceptedCount: 0,
        retryCount: 0
      },
      lessons: {
        itemCount: 0,
        items: []
      },
      handwriting: {
        total: 0,
        pendingReviewCount: 0,
        acceptedCount: 0,
        retryCount: 0,
        statsByStatus: {}
      },
      recentActivities: {
        itemCount: 0,
        items: []
      },
      emptyState: {
        show: true,
        title: 'Chưa có dữ liệu môn học',
        message: 'Khi bé học môn này, chi tiết tiến độ sẽ hiển thị ở đây.'
      }
    };
  }

  var subjectOverview =
    kidlearnV3_4g3FindSubjectOverview_(
      subject.subjectCode,
      progressItems
    );

  var handwriting =
    kidlearnV3_4g3BuildHandwritingDetail_(responses);

  var lessons =
    kidlearnV3_4g3BuildLessonItems_(
      lessonMap,
      lessonProgress,
      sessions,
      responses
    );

  var recent =
    kidlearnV3_4g3BuildRecentActivities_(
      lessonProgress,
      sessions,
      responses
    );

  var summary = {
    completedLessons:
      subjectOverview.completedLessons ||
      kidlearnV3_4g3CountCompletedLessons_(lessonProgress),
    inProgressLessons:
      subjectOverview.inProgressLessons ||
      kidlearnV3_4g3CountInProgressLessons_(lessonProgress),
    averageProgressPercent:
      subjectOverview.averageProgressPercent ||
      kidlearnV3_4g3AverageProgress_(lessonProgress),
    sessionCount:
      subjectOverview.sessionCount || sessions.length,
    responseCount:
      subjectOverview.responseCount || responses.length,
    handwritingCount:
      subjectOverview.handwritingCount || handwriting.total,
    pendingReviewCount:
      handwriting.pendingReviewCount,
    acceptedCount:
      handwriting.acceptedCount,
    retryCount:
      handwriting.retryCount
  };

  return {
    subject:
      subject,
    summary:
      summary,
    lessons:
      lessons,
    handwriting:
      handwriting,
    recentActivities:
      recent,
    emptyState: {
      show:
        lessons.items.length === 0 &&
        sessions.length === 0 &&
        responses.length === 0,
      title:
        'Chưa có dữ liệu chi tiết cho môn này',
      message:
        'Khi bé học hoặc nộp bài ở môn này, dữ liệu sẽ hiển thị ở đây.'
    }
  };
}


/**
 * Lesson items.
 */
function kidlearnV3_4g3BuildLessonItems_(lessonMap, progressRows, sessionRows, responseRows) {
  var map = {};

  function ensureLesson(lessonId) {
    lessonId =
      String(lessonId || '').trim() || 'UNKNOWN_LESSON';

    if (!map[lessonId]) {
      var lesson =
        lessonMap[lessonId] || {};

      map[lessonId] = {
        lessonId:
          lessonId,
        lessonTitle:
          lesson.lessonTitle || lessonId,
        status:
          '',
        progressPercent:
          0,
        sessionCount:
          0,
        responseCount:
          0,
        handwritingCount:
          0,
        lastActivityAt:
          '',
        reviewStatuses: {}
      };
    }

    return map[lessonId];
  }

  for (var i = 0; i < progressRows.length; i++) {
    var p =
      progressRows[i];

    var lesson =
      ensureLesson(p.lessonId);

    lesson.status =
      p.status || lesson.status;

    lesson.progressPercent =
      Math.max(
        Number(lesson.progressPercent || 0),
        Number(p.progressPercent || 0)
      );

    lesson.lastActivityAt =
      kidlearnV3_4g3MaxDateText_(
        lesson.lastActivityAt,
        p.updatedAt
      );
  }

  for (var j = 0; j < sessionRows.length; j++) {
    var s =
      sessionRows[j];

    var sessionLesson =
      ensureLesson(s.lessonId);

    sessionLesson.sessionCount++;

    sessionLesson.lastActivityAt =
      kidlearnV3_4g3MaxDateText_(
        sessionLesson.lastActivityAt,
        s.endedAt || s.startedAt
      );
  }

  for (var k = 0; k < responseRows.length; k++) {
    var r =
      responseRows[k];

    var responseLesson =
      ensureLesson(r.lessonId);

    responseLesson.responseCount++;

    if (r.hasHandwritingAsset) {
      responseLesson.handwritingCount++;
    }

    var status =
      String(r.handwritingReviewStatus || '').trim().toUpperCase();

    if (status) {
      if (!responseLesson.reviewStatuses[status]) {
        responseLesson.reviewStatuses[status] = 0;
      }

      responseLesson.reviewStatuses[status]++;
    }

    responseLesson.lastActivityAt =
      kidlearnV3_4g3MaxDateText_(
        responseLesson.lastActivityAt,
        r.createdAt || r.reviewedAt
      );
  }

  var items = [];

  for (var lessonId in map) {
    if (map.hasOwnProperty(lessonId)) {
      items.push(map[lessonId]);
    }
  }

  items.sort(function (a, b) {
    return kidlearnV3_4g3DateValue_(b.lastActivityAt) -
      kidlearnV3_4g3DateValue_(a.lastActivityAt);
  });

  return {
    itemCount:
      items.length,
    items:
      items
  };
}


/**
 * Handwriting detail.
 */
function kidlearnV3_4g3BuildHandwritingDetail_(responses) {
  var summary = {
    total: 0,
    pendingReviewCount: 0,
    acceptedCount: 0,
    retryCount: 0,
    otherStatusCount: 0,
    statsByStatus: {}
  };

  for (var i = 0; i < responses.length; i++) {
    if (!responses[i].hasHandwritingAsset) {
      continue;
    }

    summary.total++;

    var status =
      String(responses[i].handwritingReviewStatus || '')
        .trim()
        .toUpperCase() || 'UNKNOWN';

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
  }

  return summary;
}


/**
 * Recent activities by subject.
 */
function kidlearnV3_4g3BuildRecentActivities_(progressRows, sessionRows, responseRows) {
  var items = [];

  for (var i = 0; i < progressRows.length; i++) {
    if (
      String(progressRows[i].status || '').toUpperCase() === 'COMPLETED' ||
      Number(progressRows[i].progressPercent || 0) >= 100
    ) {
      items.push({
        type: 'LESSON_COMPLETED',
        title: 'Hoàn thành bài học',
        subtitle: progressRows[i].lessonId || '',
        at: progressRows[i].updatedAt || '',
        icon: '✅'
      });
    }
  }

  for (var j = 0; j < sessionRows.length; j++) {
    items.push({
      type: 'STUDY_SESSION',
      title: 'Bé đã học bài',
      subtitle: sessionRows[j].lessonId || '',
      at: sessionRows[j].endedAt || sessionRows[j].startedAt || '',
      icon: '📘'
    });
  }

  for (var k = 0; k < responseRows.length; k++) {
    items.push({
      type: responseRows[k].hasHandwritingAsset
        ? 'HANDWRITING_RESPONSE'
        : 'RESPONSE',
      title: responseRows[k].hasHandwritingAsset
        ? 'Nộp bài viết tay'
        : 'Nộp câu trả lời',
      subtitle: responseRows[k].handwritingReviewStatus || responseRows[k].lessonId || '',
      at: responseRows[k].createdAt || responseRows[k].reviewedAt || '',
      icon: responseRows[k].hasHandwritingAsset ? '✍️' : '📝'
    });
  }

  items.sort(function (a, b) {
    return kidlearnV3_4g3DateValue_(b.at) -
      kidlearnV3_4g3DateValue_(a.at);
  });

  if (items.length > KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.RECENT_LIMIT) {
    items =
      items.slice(
        0,
        KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.RECENT_LIMIT
      );
  }

  return {
    itemCount:
      items.length,
    items:
      items
  };
}


/**
 * Read sheets.
 */
function kidlearnV3_4g3BuildSubjectMap_(spreadsheet) {
  var map = {};

  var sheet =
    kidlearnV3_4g3GetSheetByExactName_(
      spreadsheet,
      'MST_Subjects'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    return map;
  }

  var headers =
    kidlearnV3_4g3ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var code =
      String(
        kidlearnV3_4g3ReadValueByAliases_(
          row,
          headers,
          ['subjectCode', 'subjectId', 'code', 'id']
        ) || ''
      ).trim();

    var name =
      String(
        kidlearnV3_4g3ReadValueByAliases_(
          row,
          headers,
          ['subjectName', 'name', 'title']
        ) || code
      ).trim();

    if (code) {
      map[code] = {
        subjectCode:
          code,
        subjectName:
          name || code
      };
    }
  }

  return map;
}


function kidlearnV3_4g3BuildLessonMap_(spreadsheet) {
  var map = {};

  var sheet =
    kidlearnV3_4g3GetSheetByExactName_(
      spreadsheet,
      'MST_Lessons'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    return map;
  }

  var headers =
    kidlearnV3_4g3ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var lessonId =
      String(
        kidlearnV3_4g3ReadValueByAliases_(
          row,
          headers,
          ['lessonId', 'id']
        ) || ''
      ).trim();

    var title =
      String(
        kidlearnV3_4g3ReadValueByAliases_(
          row,
          headers,
          ['lessonTitle', 'title', 'name']
        ) || lessonId
      ).trim();

    var subjectCode =
      String(
        kidlearnV3_4g3ReadValueByAliases_(
          row,
          headers,
          ['subjectCode', 'subjectId']
        ) || ''
      ).trim();

    if (lessonId) {
      map[lessonId] = {
        lessonId:
          lessonId,
        lessonTitle:
          title || lessonId,
        subjectCode:
          subjectCode
      };
    }
  }

  return map;
}


function kidlearnV3_4g3ReadLessonProgress_(spreadsheet, childId, subjectCode, warnings) {
  var rows = [];

  var sheet =
    kidlearnV3_4g3GetSheetByExactName_(
      spreadsheet,
      'DATA_LessonProgress'
    );

  if (!sheet) {
    warnings.push('DATA_LessonProgress không tìm thấy.');
    return rows;
  }

  if (sheet.getLastRow() < 2) {
    return rows;
  }

  var headers =
    kidlearnV3_4g3ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var itemChildId =
      String(
        kidlearnV3_4g3ReadValueByAliases_(row, headers, ['childId', 'studentId', 'learnerId']) || ''
      ).trim();

    var itemSubject =
      String(
        kidlearnV3_4g3ReadValueByAliases_(row, headers, ['subjectCode', 'subjectId']) || ''
      ).trim();

    if (childId && itemChildId && itemChildId !== childId) continue;
    if (subjectCode && itemSubject && itemSubject !== subjectCode) continue;

    rows.push({
      progressId:
        String(kidlearnV3_4g3ReadValueByAliases_(row, headers, ['progressId', 'id']) || ''),
      childId:
        itemChildId || childId,
      lessonId:
        String(kidlearnV3_4g3ReadValueByAliases_(row, headers, ['lessonId']) || ''),
      subjectCode:
        itemSubject || subjectCode,
      status:
        String(kidlearnV3_4g3ReadValueByAliases_(row, headers, ['status']) || ''),
      progressPercent:
        kidlearnV3_4g3ToNumber_(
          kidlearnV3_4g3ReadValueByAliases_(row, headers, ['progressPercent', 'percent', 'completionPercent'])
        ),
      updatedAt:
        kidlearnV3_4g3ToIso_(
          kidlearnV3_4g3ReadValueByAliases_(row, headers, ['updatedAt', 'lastUpdatedAt', 'completedAt'])
        ),
      sourceRow:
        i + 2
    });
  }

  return rows;
}


function kidlearnV3_4g3ReadStudySessions_(spreadsheet, childId, subjectCode, warnings) {
  var rows = [];

  var sheet =
    kidlearnV3_4g3GetSheetByExactName_(
      spreadsheet,
      'DATA_StudySessions'
    );

  if (!sheet) {
    warnings.push('DATA_StudySessions không tìm thấy.');
    return rows;
  }

  if (sheet.getLastRow() < 2) {
    return rows;
  }

  var headers =
    kidlearnV3_4g3ReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var itemChildId =
      String(
        kidlearnV3_4g3ReadValueByAliases_(row, headers, ['childId', 'studentId', 'learnerId']) || ''
      ).trim();

    var itemSubject =
      String(
        kidlearnV3_4g3ReadValueByAliases_(row, headers, ['subjectCode', 'subjectId']) || ''
      ).trim();

    if (childId && itemChildId && itemChildId !== childId) continue;
    if (subjectCode && itemSubject && itemSubject !== subjectCode) continue;

    rows.push({
      sessionId:
        String(kidlearnV3_4g3ReadValueByAliases_(row, headers, ['sessionId', 'id']) || ''),
      childId:
        itemChildId || childId,
      lessonId:
        String(kidlearnV3_4g3ReadValueByAliases_(row, headers, ['lessonId']) || ''),
      subjectCode:
        itemSubject || subjectCode,
      status:
        String(kidlearnV3_4g3ReadValueByAliases_(row, headers, ['status']) || ''),
      startedAt:
        kidlearnV3_4g3ToIso_(
          kidlearnV3_4g3ReadValueByAliases_(row, headers, ['startedAt', 'startAt', 'createdAt'])
        ),
      endedAt:
        kidlearnV3_4g3ToIso_(
          kidlearnV3_4g3ReadValueByAliases_(row, headers, ['endedAt', 'endAt'])
        ),
      durationSeconds:
        kidlearnV3_4g3ToNumber_(
          kidlearnV3_4g3ReadValueByAliases_(row, headers, ['durationSeconds', 'durationSec', 'duration'])
        ),
      sourceRow:
        i + 2
    });
  }

  return rows;
}


function kidlearnV3_4g3ReadResponses_(spreadsheet, childId, subjectCode, warnings) {
  var rows = [];

  var sheet =
    kidlearnV3_4g3GetSheetByExactName_(
      spreadsheet,
      'DATA_Responses'
    );

  if (!sheet) {
    warnings.push('DATA_Responses không tìm thấy.');
    return rows;
  }

  if (sheet.getLastRow() < 2) {
    return rows;
  }

  var headers =
    kidlearnV3_4g3ReadHeaders_(sheet);

  var metaIndex =
    kidlearnV3_4g3ResolveMetadataColumnIndex_(sheet, headers);

  if (metaIndex < 0) {
    warnings.push('DATA_Responses chưa tìm được metadata column.');
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
      kidlearnV3_4g3SafeJsonParse_(metaText);

    var meta =
      parsed.success ? parsed.value || {} : {};

    var asset =
      meta.handwritingAsset || {};

    var review =
      meta.handwritingReview || {};

    var itemChildId =
      String(
        kidlearnV3_4g3ReadValueByAliases_(row, headers, ['childId', 'studentId', 'learnerId']) ||
        meta.childId ||
        asset.childId ||
        ''
      ).trim();

    var itemSubject =
      String(
        kidlearnV3_4g3ReadValueByAliases_(row, headers, ['subjectCode', 'subjectId']) ||
        meta.subjectCode ||
        asset.subjectCode ||
        ''
      ).trim();

    if (childId && itemChildId && itemChildId !== childId) continue;
    if (subjectCode && itemSubject && itemSubject !== subjectCode) continue;

    rows.push({
      responseId:
        String(
          kidlearnV3_4g3ReadValueByAliases_(row, headers, ['responseId', 'id']) ||
          meta.responseId ||
          asset.responseId ||
          ''
        ),
      childId:
        itemChildId || childId,
      lessonId:
        String(
          kidlearnV3_4g3ReadValueByAliases_(row, headers, ['lessonId']) ||
          meta.lessonId ||
          asset.lessonId ||
          ''
        ),
      activityId:
        String(
          kidlearnV3_4g3ReadValueByAliases_(row, headers, ['activityId']) ||
          meta.activityId ||
          asset.activityId ||
          ''
        ),
      subjectCode:
        itemSubject || subjectCode,
      answerMode:
        String(
          kidlearnV3_4g3ReadValueByAliases_(row, headers, ['answerMode']) ||
          meta.answerMode ||
          asset.answerMode ||
          ''
        ),
      createdAt:
        kidlearnV3_4g3ToIso_(
          kidlearnV3_4g3ReadValueByAliases_(row, headers, ['createdAt', 'submittedAt', 'updatedAt']) ||
          meta.createdAt ||
          meta.updatedAt ||
          asset.createdAt ||
          review.reviewedAt
        ),
      hasHandwritingAsset:
        !!asset.fileId || !!asset.fileUrl,
      handwritingReviewStatus:
        String(
          review.status ||
          asset.reviewStatus ||
          ''
        ).trim().toUpperCase(),
      reviewedAt:
        String(review.reviewedAt || ''),
      reviewerNote:
        String(review.reviewerNote || ''),
      sourceRow:
        i + 2
    });
  }

  return rows;
}


/**
 * Resolve metadata column.
 */
function kidlearnV3_4g3ResolveMetadataColumnIndex_(sheet, headers) {
  var direct =
    kidlearnV3_4g3FindColumnIndexByAliases_(
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

  return kidlearnV3_4g3ScanMetadataColumnByJson_(sheet);
}


function kidlearnV3_4g3ScanMetadataColumnByJson_(sheet) {
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
        kidlearnV3_4g3SafeJsonParse_(text);

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
 * UI marker inspection.
 */
function kidlearnV3_4g3InspectUiMarkers_() {
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
        .createHtmlOutputFromFile('UI_Product_Client_ParentSubjectProgress_4G3')
        .getContent();
  } catch (error2) {
    errors.push(
      'Không đọc được UI_Product_Client_ParentSubjectProgress_4G3: ' +
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

  kidlearnV3_4g3CheckMarkers_(
    shell,
    [
      'UI_Product_Client_ParentSubjectProgress_4G3'
    ],
    'Shell',
    errors
  );

  kidlearnV3_4g3CheckMarkers_(
    client,
    [
      'KIDLEARN_PARENT_SUBJECT_PROGRESS_DETAIL_UI_4G3',
      'patchParentSubjectCardsForDetail4G3',
      'openParentSubjectProgressDetail4G3',
      'renderParentSubjectProgressPanel4G3',
      'kidlearnV3_getParentSubjectProgressDetail4G3V3',
      'kl-parent-subject-detail-panel-4g3',
      'kl-parent-subject-detail-card-4g3',
      'kl-parent-subject-detail-lesson-4g3'
    ],
    'Client 4G-3',
    errors
  );

  kidlearnV3_4g3CheckMarkers_(
    styles,
    [
      '.kl-parent-subject-detail-panel-4g3',
      '.kl-parent-subject-detail-card-4g3',
      '.kl-parent-subject-detail-lesson-4g3',
      '.kl-parent-subject-detail-activity-4g3',
      '.kl-parent-subject-detail-empty-4g3'
    ],
    'CSS',
    errors
  );

  return {
    success:
      errors.length === 0,
    action:
      'INSPECT_PARENT_SUBJECT_PROGRESS_DETAIL_UI_MARKERS_4G_3_V3',
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


function kidlearnV3_4g3CheckMarkers_(content, markers, label, errors) {
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
 * General helpers.
 */
function kidlearnV3_4g3ResolveSubject_(subjectCode, subjectMap, progressItems) {
  subjectCode =
    String(subjectCode || '').trim();

  var fromMap =
    subjectMap[subjectCode] || {};

  var fromProgress =
    kidlearnV3_4g3FindSubjectOverview_(
      subjectCode,
      progressItems || []
    );

  return {
    subjectCode:
      subjectCode,
    subjectName:
      fromMap.subjectName ||
      fromProgress.subjectName ||
      subjectCode ||
      '',
    hasSubject:
      !!subjectCode
  };
}


function kidlearnV3_4g3FindSubjectOverview_(subjectCode, items) {
  subjectCode =
    String(subjectCode || '').trim();

  items =
    items || [];

  for (var i = 0; i < items.length; i++) {
    if (
      String(items[i].subjectCode || '').trim() === subjectCode
    ) {
      return items[i];
    }
  }

  return {};
}


function kidlearnV3_4g3CountCompletedLessons_(rows) {
  var count = 0;

  for (var i = 0; i < rows.length; i++) {
    if (
      String(rows[i].status || '').toUpperCase() === 'COMPLETED' ||
      Number(rows[i].progressPercent || 0) >= 100
    ) {
      count++;
    }
  }

  return count;
}


function kidlearnV3_4g3CountInProgressLessons_(rows) {
  var count = 0;

  for (var i = 0; i < rows.length; i++) {
    if (
      String(rows[i].status || '').toUpperCase() !== 'COMPLETED' &&
      Number(rows[i].progressPercent || 0) < 100
    ) {
      count++;
    }
  }

  return count;
}


function kidlearnV3_4g3AverageProgress_(rows) {
  if (!rows || rows.length === 0) {
    return 0;
  }

  var sum = 0;

  for (var i = 0; i < rows.length; i++) {
    sum += Number(rows[i].progressPercent || 0);
  }

  return Math.round(sum / rows.length);
}


function kidlearnV3_4g3MaxDateText_(a, b) {
  return kidlearnV3_4g3DateValue_(a) >= kidlearnV3_4g3DateValue_(b)
    ? a
    : b;
}


function kidlearnV3_4g3OpenSpreadsheet_() {
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


function kidlearnV3_4g3GetSheetByExactName_(spreadsheet, sheetName) {
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


function kidlearnV3_4g3ReadHeaders_(sheet) {
  return sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];
}


function kidlearnV3_4g3FindColumnIndexByAliases_(headers, aliases) {
  headers =
    headers || [];

  aliases =
    aliases || [];

  var aliasMap = {};

  for (var i = 0; i < aliases.length; i++) {
    aliasMap[
      kidlearnV3_4g3NormalizeHeader_(aliases[i])
    ] = true;
  }

  for (var j = 0; j < headers.length; j++) {
    if (
      aliasMap[
        kidlearnV3_4g3NormalizeHeader_(headers[j])
      ]
    ) {
      return j;
    }
  }

  return -1;
}


function kidlearnV3_4g3ReadValueByAliases_(row, headers, aliases) {
  var index =
    kidlearnV3_4g3FindColumnIndexByAliases_(
      headers,
      aliases
    );

  if (index < 0) return '';

  return row[index];
}


function kidlearnV3_4g3NormalizeHeader_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .replace(/-/g, '');
}


function kidlearnV3_4g3ToNumber_(value) {
  var number =
    Number(value || 0);

  return isNaN(number) ? 0 : number;
}


function kidlearnV3_4g3ToIso_(value) {
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


function kidlearnV3_4g3DateValue_(value) {
  if (!value) return 0;

  var date =
    new Date(value);

  if (isNaN(date.getTime())) {
    return 0;
  }

  return date.getTime();
}


function kidlearnV3_4g3SafeJsonParse_(text) {
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
function kidlearnV3_4g3CheckDevSafety_() {
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


function kidlearnV3_4g3SafeCall_(functionName) {
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
          : kidlearnV3_4g3PreviewValue_(JSON.stringify(output || {})),
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


function kidlearnV3_4g3PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 350) {
    return text.substring(0, 350) + '...';
  }

  return text;
}


function kidlearnV3_4g3UniqueArray_(items) {
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


function kidlearnV3_4g3SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.PARENT_PHASE,
      status:
        status,
      detailName:
        KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.DETAIL_NAME,
      testedSubjectCode:
        result.subjectDetail && result.subjectDetail.subject
          ? result.subjectDetail.subject.subjectCode
          : '',
      nextBundle:
        KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_PARENT_SUBJECT_DETAIL_4G3_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4g3ReadJsonProperty_(key) {
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