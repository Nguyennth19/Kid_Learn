/**
 * ================================================================
 * KIDLEARN V3 - PARENT DASHBOARD UI OVERVIEW
 * Step: 4G-2
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Add Parent Dashboard Overview UI.
 * - Display 5 blocks:
 *   1. Tổng quan hôm nay
 *   2. Tiến độ theo môn học
 *   3. Bài cần phụ huynh duyệt
 *   4. Bài bé cần làm lại
 *   5. Hoạt động gần đây
 *
 * Safety:
 * - Không ghi DATA_StudySessions.
 * - Không ghi DATA_LessonProgress.
 * - Không ghi DATA_Responses.
 * - Không ghi DATA_DailyGoals.
 * - Không ghi LOG_Audit.
 * - Không ghi Google Drive.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4G-2.
 */


var KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4G2_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4G2_LAST_PREVIEW_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4G2_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4G2_LAST_RESULT_JSON'
};


var KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  READY_FOR_4G_3: 'READY_FOR_4G_3',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG = {
  PHASE: '4G-2',
  PARENT_PHASE: '4G',
  PREVIOUS_BUNDLE: '4G-1',
  NEXT_BUNDLE: '4G-3',
  NEXT_STAGE: 'SUBJECT_PROGRESS_DETAIL_FOR_PARENT',
  UI_NAME: 'PARENT_DASHBOARD_UI_OVERVIEW',
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Preview 4G-2 readiness.
 */
function kidlearnV3_previewParentDashboardUi4G2V3() {
  var result =
    kidlearnV3_4g2BuildReadiness_();

  result.action =
    'PREVIEW_PARENT_DASHBOARD_UI_4G_2_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_STATUS.PREVIEWED
      : KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_STATUS.FAILED;

  kidlearnV3_4g2SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4G-2 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready for 4G-3.
 */
function kidlearnV3_markParentDashboardUi4G2ReadyV3() {
  var preview =
    kidlearnV3_previewParentDashboardUi4G2V3();

  if (!preview.success) {
    throw new Error('Preview 4G-2 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_PARENT_DASHBOARD_UI_4G_2_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_STATUS.READY_FOR_4G_3,
    uiName:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.UI_NAME,
    uiBlocks: [
      'OVERVIEW_TODAY',
      'PROGRESS_BY_SUBJECT',
      'PENDING_REVIEW',
      'RETRY_SUMMARY',
      'RECENT_ACTIVITIES'
    ],
    dashboardSummary:
      preview.dashboardContext &&
      preview.dashboardContext.dashboardSummary
        ? preview.dashboardContext.dashboardSummary
        : {},
    nextBundle:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    message:
      '4G-2 ready. Parent Dashboard UI Overview đã sẵn sàng.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4g2SaveStatus_(
    result,
    KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_STATUS.READY_FOR_4G_3,
    KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get 4G-2 status.
 */
function kidlearnV3_getParentDashboardUi4G2StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PARENT_DASHBOARD_UI_4G_2_STATUS_V3',
    phase:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4g2ReadJsonProperty_(
        KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_KEYS.LAST_RESULT_JSON
      ),
    nextBundle:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert 4G-2 ready.
 */
function kidlearnV3_assertParentDashboardUi4G2ReadyV3() {
  var status =
    kidlearnV3_getParentDashboardUi4G2StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_STATUS.READY_FOR_4G_3
  ) {
    errors.push(
      '4G-2 chưa READY_FOR_4G_3. Status=' +
      status.status
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_PARENT_DASHBOARD_UI_4G_2_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.PHASE,
    status:
      status.status,
    nextBundle:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.NEXT_STAGE,
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
 * QA batch 4G-2.
 */
function kidlearnV3_runQaBatch4G2V3() {
  var preview =
    kidlearnV3_previewParentDashboardUi4G2V3();

  var ready =
    kidlearnV3_markParentDashboardUi4G2ReadyV3();

  var assertReady =
    kidlearnV3_assertParentDashboardUi4G2ReadyV3();

  var result = {
    success:
      preview.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4G_2_PARENT_DASHBOARD_UI_OVERVIEW',
    phase:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_STATUS.READY_FOR_4G_3,
    nextBundle:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    results: {
      preview:
        preview.success,
      ready:
        ready.success,
      assertReady:
        assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4G-2 QA batch failed.');
  }

  return result;
}


/**
 * Build readiness.
 */
function kidlearnV3_4g2BuildReadiness_() {
  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4g2CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var g1 =
    kidlearnV3_4g2SafeCall_(
      'kidlearnV3_assertParentDashboardContext4G1ReadyV3'
    );

  if (!g1.success) {
    errors.push(
      '4G-1 chưa READY_FOR_4G_2: ' +
      g1.message
    );
  }

  var dashboardContext =
    kidlearnV3_4g2SafeCall_(
      'kidlearnV3_getParentDashboardContext4G1V3'
    );

  if (!dashboardContext.success) {
    errors.push(
      'Không đọc được 4G-1 Parent Dashboard Context: ' +
      dashboardContext.message
    );
  }

  var markers =
    kidlearnV3_4g2InspectUiMarkers_();

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
      'BUILD_PARENT_DASHBOARD_UI_READINESS_4G_2_V3',
    phase:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.PARENT_PHASE,
    uiName:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.UI_NAME,
    prerequisite: {
      phase4G1Ready:
        g1.success === true,
      dashboardContextReadable:
        dashboardContext.success === true
    },
    dashboardContext:
      dashboardContext.output || null,
    uiBehavior: {
      parentDashboardEntryEnabled:
        true,
      parentOnly:
        true,
      readOnlyNow:
        true,
      showOverviewToday:
        true,
      showProgressBySubject:
        true,
      showPendingReview:
        true,
      showRetrySummary:
        true,
      showRecentActivities:
        true
    },
    uiMarkers:
      markers,
    nextBundle:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.NEXT_STAGE,
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
      kidlearnV3_4g2UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4g2UniqueArray_(warnings)
  };
}


/**
 * UI marker inspection.
 */
function kidlearnV3_4g2InspectUiMarkers_() {
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
        .createHtmlOutputFromFile('UI_Product_Client_ParentDashboard_4G2')
        .getContent();
  } catch (error2) {
    errors.push(
      'Không đọc được UI_Product_Client_ParentDashboard_4G2: ' +
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

  var shellMarkers = [
    'UI_Product_Client_ParentDashboard_4G2'
  ];

  var clientMarkers = [
    'KIDLEARN_PARENT_DASHBOARD_UI_4G2',
    'ensureParentDashboardEntry4G2',
    'renderParentDashboardPanel4G2',
    'openParentDashboard4G2',
    'kidlearnV3_getParentDashboardContext4G1V3',
    'kl-parent-dashboard-entry-4g2',
    'kl-parent-dashboard-panel-4g2',
    'kl-parent-dashboard-card-4g2',
    'kl-parent-dashboard-subject-4g2',
    'kl-parent-dashboard-activity-4g2'
  ];

  var styleMarkers = [
    '.kl-parent-dashboard-entry-4g2',
    '.kl-parent-dashboard-panel-4g2',
    '.kl-parent-dashboard-card-4g2',
    '.kl-parent-dashboard-subject-4g2',
    '.kl-parent-dashboard-activity-4g2',
    '.kl-parent-dashboard-empty-4g2'
  ];

  kidlearnV3_4g2CheckMarkers_(
    shell,
    shellMarkers,
    'Shell',
    errors
  );

  kidlearnV3_4g2CheckMarkers_(
    client,
    clientMarkers,
    'Client 4G-2',
    errors
  );

  kidlearnV3_4g2CheckMarkers_(
    styles,
    styleMarkers,
    'CSS',
    errors
  );

  return {
    success:
      errors.length === 0,
    action:
      'INSPECT_PARENT_DASHBOARD_UI_MARKERS_4G_2_V3',
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


function kidlearnV3_4g2CheckMarkers_(content, markers, label, errors) {
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
 * DEV safety.
 */
function kidlearnV3_4g2CheckDevSafety_() {
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
function kidlearnV3_4g2SafeCall_(functionName) {
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
          : kidlearnV3_4g2PreviewValue_(JSON.stringify(output || {})),
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


function kidlearnV3_4g2PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 350) {
    return text.substring(0, 350) + '...';
  }

  return text;
}


function kidlearnV3_4g2UniqueArray_(items) {
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


function kidlearnV3_4g2SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.PARENT_PHASE,
      status:
        status,
      uiName:
        KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.UI_NAME,
      dashboardSummary:
        result.dashboardContext &&
        result.dashboardContext.dashboardSummary
          ? result.dashboardContext.dashboardSummary
          : result.dashboardSummary || {},
      nextBundle:
        KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_PARENT_DASHBOARD_UI_4G2_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4g2ReadJsonProperty_(key) {
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