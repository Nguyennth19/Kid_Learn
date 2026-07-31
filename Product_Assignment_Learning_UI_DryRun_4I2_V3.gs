/**
 * ================================================================
 * KIDLEARN V3 - CHILD ASSIGNMENT LEARNING UI DRY-RUN
 * Step: 4I-2
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Add child UI for learning assigned lessons.
 * - Read Assignment Learning Context from 4I-1.
 * - Preview lesson routing.
 *
 * Safety:
 * - No DATA writes.
 * - No LOG_Audit writes.
 * - No Drive writes.
 * - Only ScriptProperties for technical status.
 */


var KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4I2_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4I2_LAST_PREVIEW_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4I2_LAST_READY_AT',
  LAST_ROUTE_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4I2_LAST_ROUTE_PREVIEW_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4I2_LAST_RESULT_JSON',
  LAST_ROUTE_PREVIEW_JSON: 'KIDLEARN_V3_PHASE_4I2_LAST_ROUTE_PREVIEW_JSON'
};


var KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  READY_FOR_4I_3: 'READY_FOR_4I_3',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG = {
  PHASE: '4I-2',
  PARENT_PHASE: '4I',
  PREVIOUS_BUNDLE: '4I-1',
  NEXT_BUNDLE: '4I-3',
  NEXT_STAGE: 'CONTROLLED_ASSIGNMENT_STATUS_WRITE_AND_COMPLETION_SYNC',
  UI_NAME: 'CHILD_ASSIGNMENT_LEARNING_UI_DRY_RUN',
  DEFAULT_CHILD_ID: 'CHD_V2_CHILD_DEFAULT',
  DEFAULT_PARENT_ID: 'PARENT',
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Preview 4I-2 readiness.
 */
function kidlearnV3_previewAssignmentLearningUi4I2V3() {
  var result =
    kidlearnV3_4i2BuildReadiness_();

  result.action =
    'PREVIEW_ASSIGNMENT_LEARNING_UI_4I_2_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_STATUS.PREVIEWED
      : KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_STATUS.FAILED;

  kidlearnV3_4i2SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4I-2 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Preview route from assignment card to lesson player.
 *
 * payload:
 * {
 *   assignmentId,
 *   lessonId,
 *   childId
 * }
 */
function kidlearnV3_previewAssignmentLessonRouting4I2V3(payload) {
  payload = payload || {};

  var result =
    kidlearnV3_4i2BuildRoutePreview_(payload);

  result.action =
    'PREVIEW_ASSIGNMENT_LESSON_ROUTING_4I_2_V3';

  kidlearnV3_4i2SaveRoutePreview_(result);

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4I-2 route preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 4I-2 ready.
 */
function kidlearnV3_markAssignmentLearningUi4I2ReadyV3() {
  var preview =
    kidlearnV3_previewAssignmentLearningUi4I2V3();

  if (!preview.success) {
    throw new Error('Preview 4I-2 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_ASSIGNMENT_LEARNING_UI_4I_2_READY_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_STATUS.READY_FOR_4I_3,
    uiName:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.UI_NAME,
    uiBlocks: [
      'CHILD_ASSIGNMENT_HOME_CARD',
      'ASSIGNMENT_LIST_PANEL',
      'ASSIGNMENT_ROUTE_DRY_RUN',
      'EMPTY_STATE_WHEN_NO_ASSIGNMENT'
    ],
    nextBundle:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.NEXT_STAGE,
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
    message:
      '4I-2 ready. Có thể qua 4I-3 để xử lý controlled write trạng thái Assignment.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4i2SaveStatus_(
    result,
    KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_STATUS.READY_FOR_4I_3,
    KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get 4I-2 status.
 */
function kidlearnV3_getAssignmentLearningUi4I2StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_ASSIGNMENT_LEARNING_UI_4I_2_STATUS_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_KEYS.STATUS
      ) ||
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_KEYS.LAST_READY_AT
      ) || '',
    lastRoutePreviewAt:
      properties.getProperty(
        KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_KEYS.LAST_ROUTE_PREVIEW_AT
      ) || '',
    lastResult:
      kidlearnV3_4i2ReadJsonProperty_(
        KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_KEYS.LAST_RESULT_JSON
      ),
    lastRoutePreview:
      kidlearnV3_4i2ReadJsonProperty_(
        KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_KEYS.LAST_ROUTE_PREVIEW_JSON
      ),
    nextBundle:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.NEXT_STAGE,
    prodWriteAllowed:
      false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert 4I-2 ready.
 */
function kidlearnV3_assertAssignmentLearningUi4I2ReadyV3() {
  var status =
    kidlearnV3_getAssignmentLearningUi4I2StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_STATUS.READY_FOR_4I_3
  ) {
    errors.push(
      '4I-2 chưa READY_FOR_4I_3. Current=' +
      status.status
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_ASSIGNMENT_LEARNING_UI_4I_2_READY_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.PHASE,
    status:
      status.status,
    nextBundle:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.NEXT_STAGE,
    prodWriteAllowed:
      false,
    realSheetWriteAllowedNow:
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
 * QA batch 4I-2.
 */
function kidlearnV3_runQaBatch4I2V3() {
  var preview =
    kidlearnV3_previewAssignmentLearningUi4I2V3();

  var routePreview =
    kidlearnV3_4i2RunSampleRoutePreview_();

  var ready =
    kidlearnV3_markAssignmentLearningUi4I2ReadyV3();

  var assertReady =
    kidlearnV3_assertAssignmentLearningUi4I2ReadyV3();

  var result = {
    success:
      preview.success === true &&
      routePreview.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4I_2_CHILD_ASSIGNMENT_LEARNING_UI_DRY_RUN',
    phase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.PHASE,
    status:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_STATUS.READY_FOR_4I_3,
    nextBundle:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.NEXT_STAGE,
    prodWriteAllowed:
      false,
    realSheetWriteAllowedNow:
      false,
    actualSheetWritePerformed:
      false,
    actualDriveWritePerformed:
      false,
    results: {
      preview:
        preview.success,
      routePreview:
        routePreview.success,
      ready:
        ready.success,
      assertReady:
        assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4I-2 QA batch failed.');
  }

  return result;
}


/**
 * ================================================================
 * Readiness
 * ================================================================
 */

function kidlearnV3_4i2BuildReadiness_() {
  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4i2CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var phase4I1 =
    kidlearnV3_4i2SafeCall_(
      'kidlearnV3_assertAssignmentLearningPolicyContext4I1ReadyV3'
    );

  if (!phase4I1.success) {
    errors.push(
      '4I-1 chưa READY_FOR_4I_2: ' +
      phase4I1.message
    );
  }

  var context =
    kidlearnV3_4i2SafeCall_(
      'kidlearnV3_getAssignmentLearningContext4I1V3',
      [
        {
          childId:
            KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.DEFAULT_CHILD_ID,
          parentId:
            KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.DEFAULT_PARENT_ID
        }
      ]
    );

  if (!context.success) {
    errors.push(
      'Không đọc được Assignment Learning Context 4I-1: ' +
      context.message
    );
  }

  var markers =
    kidlearnV3_4i2InspectUiMarkers_();

  if (!markers.success) {
    errors =
      errors.concat(markers.errors || []);
  }

  warnings =
    warnings.concat(markers.warnings || []);

  var visualScore =
    markers.success ? 90 : 70;

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_ASSIGNMENT_LEARNING_UI_READINESS_4I_2_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.PARENT_PHASE,
    uiName:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.UI_NAME,
    prerequisite: {
      phase4I1Ready:
        phase4I1.success === true,
      contextReadable:
        context.success === true
    },
    contextSummary:
      context.output && context.output.contextSummary
        ? context.output.contextSummary
        : null,
    uiPolicy: {
      childHomeCard:
        true,
      assignmentPanel:
        true,
      emptyStateSupported:
        true,
      routeDryRunOnly:
        true,
      realAssignmentWrite:
        false,
      realWriteStep:
        '4I-3'
    },
    uiMarkers:
      markers,
    visualScore:
      visualScore,
    nextBundle:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.NEXT_STAGE,
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
      kidlearnV3_4i2UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4i2UniqueArray_(warnings)
  };
}


function kidlearnV3_4i2BuildRoutePreview_(payload) {
  payload = payload || {};

  var errors = [];
  var warnings = [];

  var childId =
    String(
      payload.childId ||
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.DEFAULT_CHILD_ID
    ).trim();

  var assignmentId =
    String(payload.assignmentId || '').trim();

  var lessonId =
    String(payload.lessonId || '').trim();

  var context = null;

  try {
    context =
      kidlearnV3_getAssignmentLearningContext4I1V3({
        childId:
          childId,
        parentId:
          KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.DEFAULT_PARENT_ID
      });
  } catch (errorContext) {
    errors.push(
      'Không đọc được Assignment Learning Context 4I-1: ' +
      String(errorContext.message || errorContext)
    );
  }

  var cards =
    context &&
    context.assignmentLearningContext &&
    context.assignmentLearningContext.cards
      ? context.assignmentLearningContext.cards
      : [];

  var matched = null;

  for (var i = 0; i < cards.length; i++) {
    if (
      assignmentId &&
      String(cards[i].assignmentId || '') === assignmentId
    ) {
      matched = cards[i];
      break;
    }

    if (
      !assignmentId &&
      lessonId &&
      String(cards[i].lessonId || '') === lessonId
    ) {
      matched = cards[i];
      break;
    }
  }

  if (!matched && cards.length > 0) {
    matched = cards[0];

    warnings.push(
      'Không tìm thấy assignment theo payload. Dùng primary/first assignment để preview route.'
    );
  }

  if (!matched) {
    warnings.push(
      'Hiện chưa có Assignment. Route preview trả empty state, không ghi dữ liệu.'
    );
  }

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_ASSIGNMENT_ROUTE_PREVIEW_4I_2_V3',
    phase:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.PHASE,
    childId:
      childId,
    requested: {
      assignmentId:
        assignmentId,
      lessonId:
        lessonId
    },
    matchedAssignment:
      matched,
    routePreview: {
      canRoute:
        matched && matched.lessonId ? true : false,
      lessonId:
        matched ? matched.lessonId : '',
      assignmentId:
        matched ? matched.assignmentId : '',
      routeMode:
        matched ? matched.mode : 'EMPTY',
      dryRunOnly:
        true,
      useExistingLessonPlayer4C:
        true,
      realAssignmentStatusWrite:
        false,
      realWriteStep:
        '4I-3'
    },
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
      kidlearnV3_4i2UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4i2UniqueArray_(warnings),
    previewedAt:
      new Date().toISOString()
  };
}


function kidlearnV3_4i2RunSampleRoutePreview_() {
  var context =
    kidlearnV3_getAssignmentLearningContext4I1V3({
      childId:
        KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.DEFAULT_CHILD_ID,
      parentId:
        KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.DEFAULT_PARENT_ID
    });

  var primary =
    context &&
    context.assignmentLearningContext
      ? context.assignmentLearningContext.primaryAssignment
      : null;

  return kidlearnV3_previewAssignmentLessonRouting4I2V3({
    childId:
      KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.DEFAULT_CHILD_ID,
    assignmentId:
      primary ? primary.assignmentId : '',
    lessonId:
      primary ? primary.lessonId : ''
  });
}


/**
 * ================================================================
 * UI marker inspection
 * ================================================================
 */

function kidlearnV3_4i2InspectUiMarkers_() {
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
  } catch (errorShell) {
    errors.push(
      'Không đọc được UI_Product_Shell_4A: ' +
      String(errorShell.message || errorShell)
    );
  }

  try {
    client =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_AssignmentLearning_4I2')
        .getContent();
  } catch (errorClient) {
    errors.push(
      'Không đọc được UI_Product_Client_AssignmentLearning_4I2: ' +
      String(errorClient.message || errorClient)
    );
  }

  try {
    styles =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Styles_4A')
        .getContent();
  } catch (errorStyles) {
    errors.push(
      'Không đọc được UI_Product_Styles_4A: ' +
      String(errorStyles.message || errorStyles)
    );
  }

  kidlearnV3_4i2CheckMarkers_(
    shell,
    [
      'UI_Product_Client_AssignmentLearning_4I2'
    ],
    'Shell',
    errors
  );

  kidlearnV3_4i2CheckMarkers_(
    client,
    [
      'KIDLEARN_ASSIGNMENT_LEARNING_UI_DRY_RUN_4I2',
      'ensureAssignmentLearningHome4I2',
      'openAssignmentLearningPanel4I2',
      'renderAssignmentLearningPanel4I2',
      'previewAssignmentRoute4I2',
      'kidlearnV3_getAssignmentLearningContext4I1V3',
      'kidlearnV3_previewAssignmentLessonRouting4I2V3',
      'kl-assignment-learning-entry-4i2',
      'kl-assignment-learning-panel-4i2',
      'kl-assignment-learning-card-4i2'
    ],
    'Client 4I-2',
    errors
  );

  kidlearnV3_4i2CheckMarkers_(
    styles,
    [
      '.kl-assignment-learning-entry-4i2',
      '.kl-assignment-learning-panel-4i2',
      '.kl-assignment-learning-card-4i2',
      '.kl-assignment-learning-action-4i2',
      '.kl-assignment-learning-empty-4i2'
    ],
    'CSS',
    errors
  );

  return {
    success:
      errors.length === 0,
    action:
      'INSPECT_ASSIGNMENT_LEARNING_UI_MARKERS_4I_2_V3',
    shellIncluded:
      shell.indexOf('UI_Product_Client_AssignmentLearning_4I2') !== -1,
    clientLoaded:
      client !== '',
    cssLoaded:
      styles !== '',
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


function kidlearnV3_4i2CheckMarkers_(content, markers, label, errors) {
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
 * ================================================================
 * Generic helpers
 * ================================================================
 */

function kidlearnV3_4i2CheckDevSafety_() {
  var errors = [];

  try {
    if (typeof kidlearnV3_assertDevEnvironment_ === 'function') {
      kidlearnV3_assertDevEnvironment_();

      return {
        success: true,
        environment: 'DEV',
        prodWriteAllowed: false,
        errors: []
      };
    }
  } catch (errorAssertDev) {
    errors.push(
      String(errorAssertDev.message || errorAssertDev)
    );
  }

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
      kidlearnV3_4i2UniqueArray_(errors)
  };
}


function kidlearnV3_4i2SafeCall_(functionName, args) {
  args =
    args || [];

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
        output:
          null
      };
    }

    var fn =
      eval(functionName);

    var output =
      fn.apply(null, args);

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
          : kidlearnV3_4i2PreviewValue_(JSON.stringify(output || {})),
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


function kidlearnV3_4i2PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 450) {
    return text.substring(0, 450) + '...';
  }

  return text;
}


function kidlearnV3_4i2UniqueArray_(items) {
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


function kidlearnV3_4i2SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.PHASE,
      parentPhase:
        KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.PARENT_PHASE,
      status:
        status,
      uiName:
        KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.UI_NAME,
      contextSummary:
        result.contextSummary || null,
      nextBundle:
        KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4i2SaveRoutePreview_(result) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_KEYS.LAST_ROUTE_PREVIEW_AT,
    new Date().toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_ASSIGNMENT_LEARNING_UI_4I2_KEYS.LAST_ROUTE_PREVIEW_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase,
      routePreview:
        result.routePreview || {},
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


function kidlearnV3_4i2ReadJsonProperty_(key) {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(key);

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      raw:
        text
    };
  }
}