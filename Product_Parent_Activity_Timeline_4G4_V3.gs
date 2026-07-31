/**
 * ================================================================
 * KIDLEARN V3 - PARENT RECENT ACTIVITY TIMELINE
 * Step: 4G-4
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Build full Recent Activity Timeline for Parent Dashboard.
 * - Read from 4G-1 Parent Dashboard Context.
 * - Add expanded timeline UI from Parent Dashboard.
 *
 * Safety:
 * - Không ghi DATA_StudySessions.
 * - Không ghi DATA_LessonProgress.
 * - Không ghi DATA_Responses.
 * - Không ghi DATA_DailyGoals.
 * - Không ghi LOG_Audit.
 * - Không ghi Google Drive.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4G-4.
 */


var KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4G4_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4G4_LAST_PREVIEW_AT',
  LAST_CHECK_AT: 'KIDLEARN_V3_PHASE_4G4_LAST_CHECK_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4G4_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4G4_LAST_RESULT_JSON'
};


var KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  CHECK_PASSED: 'CHECK_PASSED',
  READY_FOR_4G_5: 'READY_FOR_4G_5',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG = {
  PHASE: '4G-4',
  PARENT_PHASE: '4G',
  PREVIOUS_BUNDLE: '4G-3',
  NEXT_BUNDLE: '4G-5',
  NEXT_STAGE: 'QA_AND_PHASE_4G_LOCK',
  TIMELINE_NAME: 'PARENT_RECENT_ACTIVITY_TIMELINE',
  DEFAULT_PARENT_ID: 'PARENT',
  DEFAULT_CHILD_ID: 'CHD_V2_CHILD_DEFAULT',
  DEFAULT_LIMIT: 60,
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
 *   limit: 60
 * }
 */
function kidlearnV3_getParentActivityTimeline4G4V3(options) {
  var result =
    kidlearnV3_4g4BuildTimelineContext_(options || {});

  result.action =
    'GET_PARENT_ACTIVITY_TIMELINE_4G_4_V3';

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4G-4 activity timeline failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Preview 4G-4.
 */
function kidlearnV3_previewParentActivityTimeline4G4V3() {
  var result =
    kidlearnV3_4g4BuildReadiness_();

  result.action =
    'PREVIEW_PARENT_ACTIVITY_TIMELINE_4G_4_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_STATUS.PREVIEWED
      : KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_STATUS.FAILED;

  kidlearnV3_4g4SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4G-4 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Check 4G-4.
 */
function kidlearnV3_checkParentActivityTimeline4G4V3() {
  var result =
    kidlearnV3_4g4BuildReadiness_();

  result.action =
    'CHECK_PARENT_ACTIVITY_TIMELINE_4G_4_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_STATUS.CHECK_PASSED
      : KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_STATUS.FAILED;

  kidlearnV3_4g4SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_KEYS.LAST_CHECK_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4G-4 check failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready for 4G-5.
 */
function kidlearnV3_markParentActivityTimeline4G4ReadyV3() {
  var check =
    kidlearnV3_checkParentActivityTimeline4G4V3();

  if (!check.success) {
    throw new Error('4G-4 check chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_PARENT_ACTIVITY_TIMELINE_4G_4_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_STATUS.READY_FOR_4G_5,
    timelineName:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.TIMELINE_NAME,
    timelineSummary:
      check.timelineContext
        ? check.timelineContext.timelineSummary || {}
        : {},
    nextBundle:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    message:
      '4G-4 ready. Có thể qua 4G-5 để khóa Phase 4G.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4g4SaveStatus_(
    result,
    KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_STATUS.READY_FOR_4G_5,
    KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getParentActivityTimeline4G4StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PARENT_ACTIVITY_TIMELINE_4G_4_STATUS_V3',
    phase:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastCheckAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_KEYS.LAST_CHECK_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4g4ReadJsonProperty_(
        KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_KEYS.LAST_RESULT_JSON
      ),
    nextBundle:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertParentActivityTimeline4G4ReadyV3() {
  var status =
    kidlearnV3_getParentActivityTimeline4G4StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_STATUS.READY_FOR_4G_5
  ) {
    errors.push(
      '4G-4 chưa READY_FOR_4G_5. Status=' +
      status.status
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_PARENT_ACTIVITY_TIMELINE_4G_4_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.PHASE,
    status:
      status.status,
    nextBundle:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.NEXT_STAGE,
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
 * QA batch.
 */
function kidlearnV3_runQaBatch4G4V3() {
  var preview =
    kidlearnV3_previewParentActivityTimeline4G4V3();

  var check =
    kidlearnV3_checkParentActivityTimeline4G4V3();

  var ready =
    kidlearnV3_markParentActivityTimeline4G4ReadyV3();

  var assertReady =
    kidlearnV3_assertParentActivityTimeline4G4ReadyV3();

  var result = {
    success:
      preview.success === true &&
      check.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4G_4_PARENT_RECENT_ACTIVITY_TIMELINE',
    phase:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_STATUS.READY_FOR_4G_5,
    nextBundle:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.NEXT_STAGE,
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
    throw new Error('4G-4 QA batch failed.');
  }

  return result;
}


/**
 * Build readiness.
 */
function kidlearnV3_4g4BuildReadiness_() {
  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4g4CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var g3 =
    kidlearnV3_4g4SafeCall_(
      'kidlearnV3_assertParentSubjectProgressDetail4G3ReadyV3'
    );

  if (!g3.success) {
    errors.push(
      '4G-3 chưa READY_FOR_4G_4: ' +
      g3.message
    );
  }

  var timelineContext = null;

  try {
    timelineContext =
      kidlearnV3_getParentActivityTimeline4G4V3({
        parentId:
          KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.DEFAULT_PARENT_ID,
        childId:
          KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.DEFAULT_CHILD_ID,
        limit:
          KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.DEFAULT_LIMIT
      });
  } catch (errorTimeline) {
    errors.push(
      'Không build được timeline context 4G-4: ' +
      String(errorTimeline.message || errorTimeline)
    );
  }

  if (
    timelineContext &&
    timelineContext.timelineSummary &&
    timelineContext.timelineSummary.itemCount === 0
  ) {
    warnings.push(
      'Timeline itemCount = 0. Đây là hợp lệ nếu DEV chưa có hoạt động học.'
    );
  }

  var markers =
    kidlearnV3_4g4InspectUiMarkers_();

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
      'BUILD_PARENT_ACTIVITY_TIMELINE_READINESS_4G_4_V3',
    phase:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.PARENT_PHASE,
    timelineName:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.TIMELINE_NAME,
    prerequisite: {
      phase4G3Ready:
        g3.success === true,
      timelineContextReadable:
        !!timelineContext && timelineContext.success === true
    },
    timelineContext:
      timelineContext,
    uiBehavior: {
      parentOnly:
        true,
      readOnlyNow:
        true,
      openFromParentDashboard:
        true,
      showGroupedByDate:
        true,
      showTypeFilter:
        true,
      showEmptyState:
        true
    },
    uiMarkers:
      markers,
    nextBundle:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.NEXT_STAGE,
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
      kidlearnV3_4g4UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4g4UniqueArray_(warnings)
  };
}


/**
 * Build timeline context.
 */
function kidlearnV3_4g4BuildTimelineContext_(options) {
  options = options || {};

  var errors = [];
  var warnings = [];

  var parentId =
    String(
      options.parentId ||
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.DEFAULT_PARENT_ID
    ).trim();

  var childId =
    String(
      options.childId ||
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.DEFAULT_CHILD_ID
    ).trim();

  var limit =
    Number(
      options.limit ||
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.DEFAULT_LIMIT
    );

  if (isNaN(limit) || limit <= 0) {
    limit =
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.DEFAULT_LIMIT;
  }

  var dev =
    kidlearnV3_4g4CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var g3 =
    kidlearnV3_4g4SafeCall_(
      'kidlearnV3_assertParentSubjectProgressDetail4G3ReadyV3'
    );

  if (!g3.success) {
    errors.push(
      '4G-3 chưa READY_FOR_4G_4: ' +
      g3.message
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
          limit
      });
  } catch (errorContext) {
    errors.push(
      'Không đọc được Parent Dashboard Context 4G-1: ' +
      String(errorContext.message || errorContext)
    );
  }

  var dashboard =
    dashboardContext && dashboardContext.parentDashboard
      ? dashboardContext.parentDashboard
      : {};

  var recent =
    dashboard.recentActivities || {};

  var rawItems =
    recent.items || [];

  var normalizedItems =
    kidlearnV3_4g4NormalizeTimelineItems_(
      rawItems,
      limit
    );

  var grouped =
    kidlearnV3_4g4GroupItemsByDate_(
      normalizedItems
    );

  var typeSummary =
    kidlearnV3_4g4BuildTypeSummary_(
      normalizedItems
    );

  var timelineSummary = {
    itemCount:
      normalizedItems.length,
    groupCount:
      grouped.groups.length,
    typeCount:
      typeSummary.types.length,
    latestAt:
      normalizedItems.length > 0
        ? normalizedItems[0].at || ''
        : '',
    empty:
      normalizedItems.length === 0
  };

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_PARENT_ACTIVITY_TIMELINE_CONTEXT_4G_4_V3',
    phase:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.PARENT_PHASE,
    timelineName:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.TIMELINE_NAME,
    parentId:
      parentId,
    child:
      dashboard.child || {
        childId: childId,
        displayName: 'Bé'
      },
    timelineSummary:
      timelineSummary,
    timeline: {
      title:
        'Dòng thời gian hoạt động',
      subtitle:
        'Theo dõi các hoạt động học tập gần đây của bé',
      items:
        normalizedItems,
      groupedByDate:
        grouped,
      typeSummary:
        typeSummary,
      emptyState: {
        show:
          normalizedItems.length === 0,
        title:
          'Chưa có hoạt động học tập',
        message:
          'Khi bé học bài, nộp bài hoặc đạt thành tích, hoạt động sẽ hiển thị ở đây.'
      }
    },
    uiPolicy: {
      parentOnly:
        true,
      readOnlyNow:
        true,
      showFilter:
        true,
      showGroupedByDate:
        true,
      showActivityTypeBadge:
        true,
      nextUiStep:
        '4G-5'
    },
    nextBundle:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.NEXT_STAGE,
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
      kidlearnV3_4g4UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4g4UniqueArray_(warnings)
  };
}


function kidlearnV3_4g4NormalizeTimelineItems_(items, limit) {
  items =
    items || [];

  var normalized = [];

  for (var i = 0; i < items.length; i++) {
    var item =
      items[i] || {};

    normalized.push({
      timelineId:
        'TL_4G4_' + i + '_' + String(item.type || 'ACTIVITY'),
      type:
        String(item.type || 'ACTIVITY').trim() || 'ACTIVITY',
      typeLabel:
        kidlearnV3_4g4ActivityTypeLabel_(item.type),
      title:
        String(item.title || 'Hoạt động học tập'),
      subtitle:
        String(item.subtitle || ''),
      subjectCode:
        String(item.subjectCode || ''),
      icon:
        String(item.icon || '📌'),
      at:
        kidlearnV3_4g4ToIso_(item.at || ''),
      dateKey:
        kidlearnV3_4g4ToDateKey_(item.at || ''),
      displayTime:
        kidlearnV3_4g4DisplayDateTime_(item.at || ''),
      source:
        'PARENT_DASHBOARD_CONTEXT_4G1',
      readOnly:
        true
    });
  }

  normalized.sort(function (a, b) {
    return kidlearnV3_4g4DateValue_(b.at) -
      kidlearnV3_4g4DateValue_(a.at);
  });

  if (normalized.length > limit) {
    normalized =
      normalized.slice(0, limit);
  }

  return normalized;
}


function kidlearnV3_4g4GroupItemsByDate_(items) {
  var map = {};
  var groups = [];

  for (var i = 0; i < items.length; i++) {
    var dateKey =
      items[i].dateKey || 'UNKNOWN_DATE';

    if (!map[dateKey]) {
      map[dateKey] = {
        dateKey:
          dateKey,
        dateLabel:
          kidlearnV3_4g4DateLabel_(dateKey),
        itemCount:
          0,
        items:
          []
      };

      groups.push(map[dateKey]);
    }

    map[dateKey].items.push(items[i]);
    map[dateKey].itemCount++;
  }

  groups.sort(function (a, b) {
    return kidlearnV3_4g4DateValue_(b.dateKey) -
      kidlearnV3_4g4DateValue_(a.dateKey);
  });

  return {
    groupCount:
      groups.length,
    groups:
      groups
  };
}


function kidlearnV3_4g4BuildTypeSummary_(items) {
  var map = {};
  var types = [];

  for (var i = 0; i < items.length; i++) {
    var type =
      items[i].type || 'ACTIVITY';

    if (!map[type]) {
      map[type] = {
        type:
          type,
        typeLabel:
          kidlearnV3_4g4ActivityTypeLabel_(type),
        count:
          0
      };

      types.push(map[type]);
    }

    map[type].count++;
  }

  types.sort(function (a, b) {
    return b.count - a.count;
  });

  return {
    types:
      types
  };
}


function kidlearnV3_4g4ActivityTypeLabel_(type) {
  type =
    String(type || '').trim().toUpperCase();

  var labels = {
    STUDY_SESSION: 'Buổi học',
    LESSON_COMPLETED: 'Hoàn thành bài',
    HANDWRITING_RESPONSE: 'Bài viết tay',
    RESPONSE: 'Bài nộp',
    ACHIEVEMENT: 'Thành tích',
    ACTIVITY: 'Hoạt động'
  };

  return labels[type] || type || 'Hoạt động';
}


/**
 * UI marker inspection.
 */
function kidlearnV3_4g4InspectUiMarkers_() {
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
        .createHtmlOutputFromFile('UI_Product_Client_ParentActivityTimeline_4G4')
        .getContent();
  } catch (error2) {
    errors.push(
      'Không đọc được UI_Product_Client_ParentActivityTimeline_4G4: ' +
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

  kidlearnV3_4g4CheckMarkers_(
    shell,
    [
      'UI_Product_Client_ParentActivityTimeline_4G4'
    ],
    'Shell',
    errors
  );

  kidlearnV3_4g4CheckMarkers_(
    client,
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

  kidlearnV3_4g4CheckMarkers_(
    styles,
    [
      '.kl-parent-activity-timeline-panel-4g4',
      '.kl-parent-activity-timeline-item-4g4',
      '.kl-parent-activity-timeline-filter-4g4',
      '.kl-parent-activity-timeline-empty-4g4'
    ],
    'CSS',
    errors
  );

  return {
    success:
      errors.length === 0,
    action:
      'INSPECT_PARENT_ACTIVITY_TIMELINE_UI_MARKERS_4G_4_V3',
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


function kidlearnV3_4g4CheckMarkers_(content, markers, label, errors) {
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
 * Date helpers.
 */
function kidlearnV3_4g4ToIso_(value) {
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


function kidlearnV3_4g4ToDateKey_(value) {
  var iso =
    kidlearnV3_4g4ToIso_(value);

  if (!iso) return '';

  if (iso.length >= 10 && iso.charAt(4) === '-') {
    return iso.substring(0, 10);
  }

  return '';
}


function kidlearnV3_4g4DateValue_(value) {
  if (!value) return 0;

  var date =
    new Date(value);

  if (isNaN(date.getTime())) {
    return 0;
  }

  return date.getTime();
}


function kidlearnV3_4g4DateLabel_(dateKey) {
  if (!dateKey || dateKey === 'UNKNOWN_DATE') {
    return 'Không rõ ngày';
  }

  var today =
    new Date().toISOString().substring(0, 10);

  if (dateKey === today) {
    return 'Hôm nay';
  }

  var date =
    new Date(dateKey + 'T00:00:00');

  if (isNaN(date.getTime())) {
    return dateKey;
  }

  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
}


function kidlearnV3_4g4DisplayDateTime_(value) {
  if (!value) return '';

  var date =
    new Date(value);

  if (isNaN(date.getTime())) {
    return String(value).substring(0, 16);
  }

  return date.toLocaleDateString('vi-VN') +
    ' ' +
    date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
}


/**
 * DEV safety.
 */
function kidlearnV3_4g4CheckDevSafety_() {
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
function kidlearnV3_4g4SafeCall_(functionName) {
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
          : kidlearnV3_4g4PreviewValue_(JSON.stringify(output || {})),
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


function kidlearnV3_4g4PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 350) {
    return text.substring(0, 350) + '...';
  }

  return text;
}


function kidlearnV3_4g4UniqueArray_(items) {
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


function kidlearnV3_4g4SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.PARENT_PHASE,
      status:
        status,
      timelineName:
        KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.TIMELINE_NAME,
      timelineSummary:
        result.timelineSummary ||
        (
          result.timelineContext
            ? result.timelineContext.timelineSummary || {}
            : {}
        ),
      nextBundle:
        KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_PARENT_ACTIVITY_TIMELINE_4G4_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4g4ReadJsonProperty_(key) {
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