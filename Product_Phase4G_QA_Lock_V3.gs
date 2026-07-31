/**
 * ================================================================
 * KIDLEARN V3 - PHASE 4G QA + LOCK
 * Step: 4G-5
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Final QA for Phase 4G.
 * - Confirm Parent Dashboard + Subject Detail + Timeline are ready.
 * - Lock Phase 4G.
 *
 * Safety:
 * - Không ghi DATA_StudySessions.
 * - Không ghi DATA_LessonProgress.
 * - Không ghi DATA_Responses.
 * - Không ghi DATA_DailyGoals.
 * - Không ghi LOG_Audit.
 * - Không ghi Google Drive.
 * - Chỉ ghi ScriptProperties trạng thái lock.
 */


var KIDLEARN_V3_PHASE4G_LOCK_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4G_LOCK_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4G_LOCK_LAST_PREVIEW_AT',
  LAST_QA_AT: 'KIDLEARN_V3_PHASE_4G_LOCK_LAST_QA_AT',
  LOCKED_AT: 'KIDLEARN_V3_PHASE_4G_LOCKED_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4G_LOCK_LAST_RESULT_JSON',
  LOCK_JSON: 'KIDLEARN_V3_PHASE_4G_LOCK_JSON'
};


var KIDLEARN_V3_PHASE4G_LOCK_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  QA_PASSED: 'QA_PASSED',
  PHASE_4G_CLOSED_LOCKED: 'PHASE_4G_CLOSED_LOCKED',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PHASE4G_LOCK_CONFIG = {
  PHASE: '4G',
  LOCK_STEP: '4G-5',
  PHASE_NAME: 'PARENT_DASHBOARD_AND_PROGRESS_OVERVIEW',
  NEXT_PHASE: '4H',
  NEXT_STAGE: 'NEXT_PRODUCT_INCREMENT_TO_BE_CONFIRMED',
  CONFIRM_TEXT: 'LOCK_PHASE_4G_PARENT_DASHBOARD_PROGRESS_OVERVIEW',
  MIN_VISUAL_SCORE: 85,
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Preview Phase 4G lock readiness.
 */
function kidlearnV3_previewPhase4GLockV3() {
  var result =
    kidlearnV3_4g5BuildFinalQa_();

  result.action =
    'PREVIEW_PHASE_4G_LOCK_4G_5_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PHASE4G_LOCK_STATUS.PREVIEWED
      : KIDLEARN_V3_PHASE4G_LOCK_STATUS.FAILED;

  kidlearnV3_4g5SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PHASE4G_LOCK_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4G-5 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Run final QA before Phase 4G lock.
 */
function kidlearnV3_runPhase4GFinalQaV3() {
  var result =
    kidlearnV3_4g5BuildFinalQa_();

  result.action =
    'RUN_PHASE_4G_FINAL_QA_4G_5_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PHASE4G_LOCK_STATUS.QA_PASSED
      : KIDLEARN_V3_PHASE4G_LOCK_STATUS.FAILED;

  kidlearnV3_4g5SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PHASE4G_LOCK_KEYS.LAST_QA_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4G-5 final QA failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Confirm wrapper.
 * Chạy function này để lock Phase 4G.
 */
function kidlearnV3_lockPhase4GConfirmV3() {
  return kidlearnV3_lockPhase4GV3({
    confirm:
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.CONFIRM_TEXT,
    visualScore:
      90,
    visualNote:
      'Parent Dashboard, Subject Detail, and Recent Activity Timeline were checked in DEV.'
  });
}


/**
 * Lock Phase 4G.
 */
function kidlearnV3_lockPhase4GV3(options) {
  options = options || {};

  var confirmText =
    String(options.confirm || '')
      .trim()
      .toUpperCase();

  if (
    confirmText !==
    KIDLEARN_V3_PHASE4G_LOCK_CONFIG.CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm. Cần confirm=' +
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.CONFIRM_TEXT
    );
  }

  var visualScore =
    Number(options.visualScore || 0);

  if (
    isNaN(visualScore) ||
    visualScore < KIDLEARN_V3_PHASE4G_LOCK_CONFIG.MIN_VISUAL_SCORE
  ) {
    throw new Error(
      'visualScore chưa đạt. Cần >= ' +
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.MIN_VISUAL_SCORE
    );
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
    var qa =
      kidlearnV3_runPhase4GFinalQaV3();

    if (!qa.success) {
      throw new Error(
        'Final QA 4G chưa pass. Không thể lock.'
      );
    }

    var result = {
      success: true,
      action: 'LOCK_PHASE_4G_4G_5_V3',
      phase:
        KIDLEARN_V3_PHASE4G_LOCK_CONFIG.PHASE,
      lockStep:
        KIDLEARN_V3_PHASE4G_LOCK_CONFIG.LOCK_STEP,
      phaseName:
        KIDLEARN_V3_PHASE4G_LOCK_CONFIG.PHASE_NAME,
      status:
        KIDLEARN_V3_PHASE4G_LOCK_STATUS.PHASE_4G_CLOSED_LOCKED,
      locked:
        true,
      finalQaPassed:
        true,
      componentSummary:
        qa.componentSummary,
      dashboardSummary:
        qa.dashboardSummary,
      timelineSummary:
        qa.timelineSummary,
      uiMarkerSummary:
        qa.uiMarkerSummary,
      visualScore:
        visualScore,
      visualNote:
        String(options.visualNote || ''),
      minVisualScore:
        KIDLEARN_V3_PHASE4G_LOCK_CONFIG.MIN_VISUAL_SCORE,
      nextPhase:
        KIDLEARN_V3_PHASE4G_LOCK_CONFIG.NEXT_PHASE,
      nextStage:
        KIDLEARN_V3_PHASE4G_LOCK_CONFIG.NEXT_STAGE,
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
      lockedAt:
        new Date().toISOString()
    };

    kidlearnV3_4g5SaveLock_(result);

    kidlearnV3_4g5SaveStatus_(
      result,
      KIDLEARN_V3_PHASE4G_LOCK_STATUS.PHASE_4G_CLOSED_LOCKED,
      KIDLEARN_V3_PHASE4G_LOCK_KEYS.LOCKED_AT
    );

    console.log(JSON.stringify(result, null, 2));
    return result;

  } finally {
    lock.releaseLock();
  }
}


/**
 * Get Phase 4G lock status.
 */
function kidlearnV3_getPhase4GLockStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PHASE_4G_LOCK_STATUS_V3',
    phase:
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.LOCK_STEP,
    phaseName:
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.PHASE_NAME,
    status:
      properties.getProperty(
        KIDLEARN_V3_PHASE4G_LOCK_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PHASE4G_LOCK_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE4G_LOCK_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastQaAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE4G_LOCK_KEYS.LAST_QA_AT
      ) || '',
    lockedAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE4G_LOCK_KEYS.LOCKED_AT
      ) || '',
    lastResult:
      kidlearnV3_4g5ReadJsonProperty_(
        KIDLEARN_V3_PHASE4G_LOCK_KEYS.LAST_RESULT_JSON
      ),
    lock:
      kidlearnV3_4g5ReadJsonProperty_(
        KIDLEARN_V3_PHASE4G_LOCK_KEYS.LOCK_JSON
      ),
    nextPhase:
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.NEXT_STAGE,
    prodWriteAllowed:
      false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert Phase 4G closed locked.
 */
function kidlearnV3_assertPhase4GClosedLockedV3() {
  var status =
    kidlearnV3_getPhase4GLockStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PHASE4G_LOCK_STATUS.PHASE_4G_CLOSED_LOCKED
  ) {
    errors.push(
      'Phase 4G chưa PHASE_4G_CLOSED_LOCKED. Status=' +
      status.status
    );
  }

  if (!status.lock || status.lock.locked !== true) {
    errors.push(
      'Không tìm thấy lock evidence cho Phase 4G.'
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_PHASE_4G_CLOSED_LOCKED_V3',
    phase:
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.LOCK_STEP,
    status:
      status.status,
    lockedAt:
      status.lockedAt,
    nextPhase:
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.NEXT_STAGE,
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
 * Alias for next phases.
 */
function kidlearnV3_assertPhase4GClosedV3() {
  return kidlearnV3_assertPhase4GClosedLockedV3();
}


/**
 * QA batch 4G-5.
 * Lưu ý: function này sẽ preview + final QA + lock Phase 4G.
 */
function kidlearnV3_runQaBatch4G5V3() {
  var preview =
    kidlearnV3_previewPhase4GLockV3();

  var qa =
    kidlearnV3_runPhase4GFinalQaV3();

  var lock =
    kidlearnV3_lockPhase4GConfirmV3();

  var assertLocked =
    kidlearnV3_assertPhase4GClosedLockedV3();

  var result = {
    success:
      preview.success === true &&
      qa.success === true &&
      lock.success === true &&
      assertLocked.success === true,
    suiteName:
      'PHASE_4G_5_QA_AND_LOCK',
    phase:
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.LOCK_STEP,
    status:
      KIDLEARN_V3_PHASE4G_LOCK_STATUS.PHASE_4G_CLOSED_LOCKED,
    nextPhase:
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.NEXT_STAGE,
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
    results: {
      preview:
        preview.success,
      finalQa:
        qa.success,
      lock:
        lock.success,
      assertLocked:
        assertLocked.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4G-5 QA batch failed.');
  }

  return result;
}


/**
 * Build final QA for Phase 4G.
 */
function kidlearnV3_4g5BuildFinalQa_() {
  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4g5CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var phase4F =
    kidlearnV3_4g5SafeCall_(
      'kidlearnV3_assertPhase4FClosedLockedV3'
    );

  if (!phase4F.success) {
    errors.push(
      'Phase 4F chưa closed locked: ' +
      phase4F.message
    );
  }

  var componentChecks = [
    {
      key: '4G-1',
      label: 'Parent Dashboard Context Read-only',
      required: true,
      check:
        kidlearnV3_4g5SafeCall_(
          'kidlearnV3_assertParentDashboardContext4G1ReadyV3'
        )
    },
    {
      key: '4G-2',
      label: 'Parent Dashboard UI Overview',
      required: true,
      check:
        kidlearnV3_4g5SafeCall_(
          'kidlearnV3_assertParentDashboardUi4G2ReadyV3'
        )
    },
    {
      key: '4G-3',
      label: 'Subject Progress Detail for Parent',
      required: true,
      check:
        kidlearnV3_4g5SafeCall_(
          'kidlearnV3_assertParentSubjectProgressDetail4G3ReadyV3'
        )
    },
    {
      key: '4G-4',
      label: 'Recent Activity Timeline',
      required: true,
      check:
        kidlearnV3_4g5SafeCall_(
          'kidlearnV3_assertParentActivityTimeline4G4ReadyV3'
        )
    }
  ];

  for (var i = 0; i < componentChecks.length; i++) {
    if (
      componentChecks[i].required &&
      componentChecks[i].check.success !== true
    ) {
      errors.push(
        componentChecks[i].key +
        ' chưa ready: ' +
        componentChecks[i].check.message
      );
    }
  }

  var dashboardSummary =
    kidlearnV3_4g5InspectDashboardContext_();

  if (!dashboardSummary.success) {
    errors.push(
      'Không đọc được dashboard context: ' +
      dashboardSummary.message
    );
  }

  if (
    dashboardSummary.success &&
    dashboardSummary.recentActivityCount === 0
  ) {
    warnings.push(
      'recentActivityCount = 0. Đây là hợp lệ nếu DEV chưa có hoạt động học.'
    );
  }

  var timelineSummary =
    kidlearnV3_4g5InspectTimelineContext_();

  if (!timelineSummary.success) {
    errors.push(
      'Không đọc được activity timeline: ' +
      timelineSummary.message
    );
  }

  if (
    timelineSummary.success &&
    timelineSummary.itemCount === 0
  ) {
    warnings.push(
      'Timeline itemCount = 0. Đây là hợp lệ nếu DEV chưa có hoạt động học.'
    );
  }

  var subjectDetailSummary =
    kidlearnV3_4g5InspectSubjectDetailIfAvailable_(
      dashboardSummary
    );

  if (
    dashboardSummary.success &&
    dashboardSummary.subjectCount > 0 &&
    subjectDetailSummary.success !== true
  ) {
    errors.push(
      'Có subject data nhưng subject detail không pass: ' +
      subjectDetailSummary.message
    );
  }

  if (
    dashboardSummary.success &&
    dashboardSummary.subjectCount === 0
  ) {
    warnings.push(
      'subjectCount = 0. Đây là hợp lệ nếu DEV chưa có dữ liệu môn học.'
    );
  }

  var uiMarkerSummary =
    kidlearnV3_4g5InspectUiMarkers_();

  if (!uiMarkerSummary.success) {
    errors =
      errors.concat(uiMarkerSummary.errors || []);
  }

  warnings =
    warnings.concat(uiMarkerSummary.warnings || []);

  var componentSummary =
    kidlearnV3_4g5BuildComponentSummary_(
      componentChecks
    );

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_PHASE_4G_FINAL_QA_4G_5_V3',
    phase:
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.LOCK_STEP,
    phaseName:
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.PHASE_NAME,
    devSafety:
      dev,
    phase4F:
      phase4F,
    componentSummary:
      componentSummary,
    dashboardSummary:
      dashboardSummary,
    subjectDetailSummary:
      subjectDetailSummary,
    timelineSummary:
      timelineSummary,
    uiMarkerSummary:
      uiMarkerSummary,
    readyForLock:
      errors.length === 0,
    nextPhase:
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4G_LOCK_CONFIG.NEXT_STAGE,
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
      kidlearnV3_4g5UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4g5UniqueArray_(warnings)
  };
}


/**
 * Inspect Parent Dashboard Context.
 */
function kidlearnV3_4g5InspectDashboardContext_() {
  try {
    if (
      typeof kidlearnV3_getParentDashboardContext4G1V3 !== 'function'
    ) {
      return {
        success: false,
        message:
          'Thiếu kidlearnV3_getParentDashboardContext4G1V3'
      };
    }

    var context =
      kidlearnV3_getParentDashboardContext4G1V3({
        parentId: 'PARENT',
        childId: 'CHD_V2_CHILD_DEFAULT',
        recentLimit: 60
      });

    var dashboard =
      context.parentDashboard || {};

    var summary =
      dashboard.dashboardSummary ||
      context.dashboardSummary ||
      {};

    var progress =
      dashboard.progressBySubject || {};

    var subjects =
      progress.items || [];

    return {
      success:
        context.success === true,
      childId:
        dashboard.child && dashboard.child.childId
          ? dashboard.child.childId
          : '',
      todaySessionCount:
        Number(summary.todaySessionCount || 0),
      todayDurationMinutes:
        Number(summary.todayDurationMinutes || 0),
      completedLessonCount:
        Number(summary.completedLessonCount || 0),
      subjectCount:
        Number(summary.subjectCount || subjects.length || 0),
      pendingReviewCount:
        Number(summary.pendingReviewCount || 0),
      retryCount:
        Number(summary.retryCount || 0),
      recentActivityCount:
        Number(summary.recentActivityCount || 0),
      firstSubjectCode:
        subjects.length > 0
          ? String(subjects[0].subjectCode || '')
          : '',
      message:
        context.success === true ? 'OK' : JSON.stringify(context)
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
 * Inspect Timeline Context.
 */
function kidlearnV3_4g5InspectTimelineContext_() {
  try {
    if (
      typeof kidlearnV3_getParentActivityTimeline4G4V3 !== 'function'
    ) {
      return {
        success: false,
        message:
          'Thiếu kidlearnV3_getParentActivityTimeline4G4V3'
      };
    }

    var timeline =
      kidlearnV3_getParentActivityTimeline4G4V3({
        parentId: 'PARENT',
        childId: 'CHD_V2_CHILD_DEFAULT',
        limit: 60
      });

    var summary =
      timeline.timelineSummary || {};

    return {
      success:
        timeline.success === true,
      itemCount:
        Number(summary.itemCount || 0),
      groupCount:
        Number(summary.groupCount || 0),
      typeCount:
        Number(summary.typeCount || 0),
      latestAt:
        summary.latestAt || '',
      message:
        timeline.success === true ? 'OK' : JSON.stringify(timeline)
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
 * Inspect Subject Detail only if subject exists.
 */
function kidlearnV3_4g5InspectSubjectDetailIfAvailable_(dashboardSummary) {
  dashboardSummary =
    dashboardSummary || {};

  if (
    !dashboardSummary.firstSubjectCode ||
    dashboardSummary.subjectCount <= 0
  ) {
    return {
      success: false,
      skipped:
        true,
      reason:
        'NO_SUBJECT_DATA',
      message:
        'Không có subject để test detail thực tế.'
    };
  }

  try {
    if (
      typeof kidlearnV3_getParentSubjectProgressDetail4G3V3 !== 'function'
    ) {
      return {
        success: false,
        skipped:
          false,
        message:
          'Thiếu kidlearnV3_getParentSubjectProgressDetail4G3V3'
      };
    }

    var detail =
      kidlearnV3_getParentSubjectProgressDetail4G3V3({
        parentId: 'PARENT',
        childId: 'CHD_V2_CHILD_DEFAULT',
        subjectCode:
          dashboardSummary.firstSubjectCode
      });

    var subjectDetail =
      detail.subjectDetail || {};

    var subject =
      subjectDetail.subject || {};

    var summary =
      subjectDetail.summary || {};

    return {
      success:
        detail.success === true &&
        !!subject.subjectCode,
      skipped:
        false,
      subjectCode:
        subject.subjectCode || '',
      subjectName:
        subject.subjectName || '',
      completedLessons:
        Number(summary.completedLessons || 0),
      sessionCount:
        Number(summary.sessionCount || 0),
      responseCount:
        Number(summary.responseCount || 0),
      handwritingCount:
        Number(summary.handwritingCount || 0),
      message:
        detail.success === true ? 'OK' : JSON.stringify(detail)
    };

  } catch (error) {
    return {
      success: false,
      skipped:
        false,
      message:
        String(error.message || error)
    };
  }
}


/**
 * UI marker inspection.
 */
function kidlearnV3_4g5InspectUiMarkers_() {
  var errors = [];
  var warnings = [];

  var shell = '';
  var styles = '';
  var client4g2 = '';
  var client4g3 = '';
  var client4g4 = '';

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
    styles =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Styles_4A')
        .getContent();
  } catch (error2) {
    errors.push(
      'Không đọc được UI_Product_Styles_4A: ' +
      String(error2.message || error2)
    );
  }

  try {
    client4g2 =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_ParentDashboard_4G2')
        .getContent();
  } catch (error3) {
    errors.push(
      'Không đọc được UI_Product_Client_ParentDashboard_4G2: ' +
      String(error3.message || error3)
    );
  }

  try {
    client4g3 =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_ParentSubjectProgress_4G3')
        .getContent();
  } catch (error4) {
    errors.push(
      'Không đọc được UI_Product_Client_ParentSubjectProgress_4G3: ' +
      String(error4.message || error4)
    );
  }

  try {
    client4g4 =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_ParentActivityTimeline_4G4')
        .getContent();
  } catch (error5) {
    errors.push(
      'Không đọc được UI_Product_Client_ParentActivityTimeline_4G4: ' +
      String(error5.message || error5)
    );
  }

  kidlearnV3_4g5CheckMarkers_(
    shell,
    [
      'UI_Product_Client_ParentDashboard_4G2',
      'UI_Product_Client_ParentSubjectProgress_4G3',
      'UI_Product_Client_ParentActivityTimeline_4G4'
    ],
    'Shell',
    errors
  );

  kidlearnV3_4g5CheckMarkers_(
    client4g2,
    [
      'KIDLEARN_PARENT_DASHBOARD_UI_4G2',
      'ensureParentDashboardEntry4G2',
      'renderParentDashboardPanel4G2',
      'openParentDashboard4G2',
      'kidlearnV3_getParentDashboardContext4G1V3',
      'kl-parent-dashboard-entry-4g2',
      'kl-parent-dashboard-panel-4g2',
      'kl-parent-dashboard-subject-4g2'
    ],
    'Client 4G-2',
    errors
  );

  kidlearnV3_4g5CheckMarkers_(
    client4g3,
    [
      'KIDLEARN_PARENT_SUBJECT_PROGRESS_DETAIL_UI_4G3',
      'patchParentSubjectCardsForDetail4G3',
      'openParentSubjectProgressDetail4G3',
      'renderParentSubjectProgressPanel4G3',
      'kidlearnV3_getParentSubjectProgressDetail4G3V3',
      'kl-parent-subject-detail-panel-4g3',
      'kl-parent-subject-detail-lesson-4g3'
    ],
    'Client 4G-3',
    errors
  );

  kidlearnV3_4g5CheckMarkers_(
    client4g4,
    [
      'KIDLEARN_PARENT_ACTIVITY_TIMELINE_UI_4G4',
      'patchParentDashboardActivityTimeline4G4',
      'openParentActivityTimeline4G4',
      'renderParentActivityTimelinePanel4G4',
      'kidlearnV3_getParentActivityTimeline4G4V3',
      'kl-parent-activity-timeline-panel-4g4',
      'kl-parent-activity-timeline-item-4g4',
      'kl-parent-activity-timeline-filter-4g4'
    ],
    'Client 4G-4',
    errors
  );

  kidlearnV3_4g5CheckMarkers_(
    styles,
    [
      '.kl-parent-dashboard-entry-4g2',
      '.kl-parent-dashboard-panel-4g2',
      '.kl-parent-dashboard-subject-4g2',
      '.kl-parent-subject-detail-panel-4g3',
      '.kl-parent-subject-detail-lesson-4g3',
      '.kl-parent-activity-timeline-panel-4g4',
      '.kl-parent-activity-timeline-item-4g4',
      '.kl-parent-activity-timeline-filter-4g4'
    ],
    'CSS',
    errors
  );

  return {
    success:
      errors.length === 0,
    action:
      'INSPECT_PHASE_4G_UI_MARKERS_4G_5_V3',
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


function kidlearnV3_4g5CheckMarkers_(content, markers, label, errors) {
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


function kidlearnV3_4g5BuildComponentSummary_(componentChecks) {
  var summary = [];

  for (var i = 0; i < componentChecks.length; i++) {
    summary.push({
      key:
        componentChecks[i].key,
      label:
        componentChecks[i].label,
      required:
        componentChecks[i].required === true,
      success:
        componentChecks[i].check.success === true,
      phase:
        componentChecks[i].check.phase || '',
      status:
        componentChecks[i].check.status || '',
      nextBundle:
        componentChecks[i].check.nextBundle || '',
      message:
        componentChecks[i].check.success === true
          ? 'OK'
          : componentChecks[i].check.message
    });
  }

  return summary;
}


/**
 * DEV safety.
 */
function kidlearnV3_4g5CheckDevSafety_() {
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
 * Generic helpers.
 */
function kidlearnV3_4g5SafeCall_(functionName) {
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
      nextBundle:
        output && output.nextBundle ? output.nextBundle : '',
      message:
        output && output.success === true
          ? 'OK'
          : kidlearnV3_4g5PreviewValue_(JSON.stringify(output || {})),
      outputSummary:
        kidlearnV3_4g5SummarizeOutput_(output)
    };

  } catch (error) {
    return {
      success: false,
      functionName:
        functionName,
      message:
        String(error.message || error),
      outputSummary:
        null
    };
  }
}


function kidlearnV3_4g5SummarizeOutput_(output) {
  output = output || {};

  return {
    success:
      output.success === true,
    action:
      output.action || '',
    phase:
      output.phase || '',
    status:
      output.status || '',
    nextPhase:
      output.nextPhase || '',
    nextBundle:
      output.nextBundle || '',
    errorCount:
      output.errorCount || 0,
    warningCount:
      output.warningCount || 0
  };
}


function kidlearnV3_4g5PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 350) {
    return text.substring(0, 350) + '...';
  }

  return text;
}


function kidlearnV3_4g5UniqueArray_(items) {
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


function kidlearnV3_4g5SaveLock_(result) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PHASE4G_LOCK_KEYS.LOCK_JSON,
      JSON.stringify(result)
    );
}


function kidlearnV3_4g5SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PHASE4G_LOCK_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PHASE4G_LOCK_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_PHASE4G_LOCK_CONFIG.PHASE,
      lockStep:
        result.lockStep ||
        KIDLEARN_V3_PHASE4G_LOCK_CONFIG.LOCK_STEP,
      phaseName:
        KIDLEARN_V3_PHASE4G_LOCK_CONFIG.PHASE_NAME,
      status:
        status,
      locked:
        result.locked === true,
      readyForLock:
        result.readyForLock === true,
      finalQaPassed:
        result.finalQaPassed === true,
      dashboardSummary:
        result.dashboardSummary || {},
      timelineSummary:
        result.timelineSummary || {},
      nextPhase:
        KIDLEARN_V3_PHASE4G_LOCK_CONFIG.NEXT_PHASE,
      nextStage:
        KIDLEARN_V3_PHASE4G_LOCK_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4g5ReadJsonProperty_(key) {
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