/**
 * ================================================================
 * KIDLEARN V3 - CHILD RETRY LESSON ROUTING
 * Step: 4F-4C
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Connect "Làm lại bài này" button to existing Lesson Player.
 * - Read retry item from 4F-4A context.
 * - Build route payload for UI.
 *
 * Safety:
 * - Không ghi DATA_Responses.
 * - Không ghi LOG_Audit.
 * - Không ghi Google Drive.
 * - Không tạo DATA_Assignments.
 * - Không reset DATA_LessonProgress.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4F-4C.
 */


var KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4F4C_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4F4C_LAST_PREVIEW_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4F4C_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4F4C_LAST_RESULT_JSON'
};


var KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  READY_FOR_4F_4D: 'READY_FOR_4F_4D',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG = {
  PHASE: '4F-4C',
  PARENT_PHASE: '4F',
  PREVIOUS_BUNDLE: '4F-4B',
  NEXT_BUNDLE: '4F-4D',
  NEXT_STAGE: 'QA_READY_FOR_4F_5',
  ROUTING_NAME: 'CHILD_RETRY_LESSON_ROUTING',
  DEFAULT_CHILD_ID: 'CHD_V2_CHILD_DEFAULT',
  TARGET_REVIEW_STATUS: 'REVIEWED_RETRY',
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Get retry lesson route for UI.
 *
 * options:
 * {
 *   responseId: '...',
 *   lessonId: '...',
 *   childId: 'CHD_V2_CHILD_DEFAULT'
 * }
 */
function kidlearnV3_getRetryLessonRoute4F4CV3(options) {
  options = options || {};

  var result =
    kidlearnV3_4f4cBuildRetryRoute_(options);

  result.action =
    'GET_RETRY_LESSON_ROUTE_4F_4C_V3';

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4F-4C retry lesson route failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Preview 4F-4C.
 */
function kidlearnV3_previewChildRetryLessonRouting4F4CV3() {
  var result =
    kidlearnV3_4f4cBuildReadiness_();

  result.action =
    'PREVIEW_CHILD_RETRY_LESSON_ROUTING_4F_4C_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_STATUS.PREVIEWED
      : KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_STATUS.FAILED;

  kidlearnV3_4f4cSaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4F-4C preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready for 4F-4D.
 */
function kidlearnV3_markChildRetryLessonRouting4F4CReadyV3() {
  var preview =
    kidlearnV3_previewChildRetryLessonRouting4F4CV3();

  if (!preview.success) {
    throw new Error('Preview 4F-4C chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_CHILD_RETRY_LESSON_ROUTING_4F_4C_READY_V3',
    phase:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_STATUS.READY_FOR_4F_4D,
    routingName:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.ROUTING_NAME,
    routeMode:
      'OPEN_EXISTING_LESSON_PLAYER',
    retryCount:
      preview.retryContext && preview.retryContext.retryQueue
        ? preview.retryContext.retryQueue.retryCount
        : 0,
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    message:
      '4F-4C ready. Nút Làm lại bài này có thể mở Lesson Player hiện có.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4f4cSaveStatus_(
    result,
    KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_STATUS.READY_FOR_4F_4D,
    KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getChildRetryLessonRouting4F4CStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_CHILD_RETRY_LESSON_ROUTING_4F_4C_STATUS_V3',
    phase:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_KEYS.STATUS
      ) ||
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4f4cReadJsonProperty_(
        KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_KEYS.LAST_RESULT_JSON
      ),
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertChildRetryLessonRouting4F4CReadyV3() {
  var status =
    kidlearnV3_getChildRetryLessonRouting4F4CStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_STATUS.READY_FOR_4F_4D
  ) {
    errors.push(
      '4F-4C chưa READY_FOR_4F_4D. Status=' +
      status.status
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_CHILD_RETRY_LESSON_ROUTING_4F_4C_READY_V3',
    phase:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.PHASE,
    status:
      status.status,
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.NEXT_STAGE,
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
function kidlearnV3_runQaBatch4F4CV3() {
  var preview =
    kidlearnV3_previewChildRetryLessonRouting4F4CV3();

  var ready =
    kidlearnV3_markChildRetryLessonRouting4F4CReadyV3();

  var assertReady =
    kidlearnV3_assertChildRetryLessonRouting4F4CReadyV3();

  var result = {
    success:
      preview.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4F_4C_CHILD_RETRY_LESSON_ROUTING',
    phase:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.PHASE,
    status:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_STATUS.READY_FOR_4F_4D,
    routeMode:
      'OPEN_EXISTING_LESSON_PLAYER',
    retryCount:
      preview.retryContext && preview.retryContext.retryQueue
        ? preview.retryContext.retryQueue.retryCount
        : 0,
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    results: {
      preview: preview.success,
      ready: ready.success,
      assertReady: assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4F-4C QA batch failed.');
  }

  return result;
}


/**
 * Build readiness.
 */
function kidlearnV3_4f4cBuildReadiness_() {
  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4f4cCheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var f4b =
    kidlearnV3_4f4cSafeCall_(
      'kidlearnV3_assertChildRetryCardUi4F4BReadyV3'
    );

  if (!f4b.success) {
    errors.push(
      '4F-4B chưa READY_FOR_4F_4C: ' +
      f4b.message
    );
  }

  var retryContextCall =
    kidlearnV3_4f4cSafeCall_(
      'kidlearnV3_getChildRetryContext4F4AV3'
    );

  if (!retryContextCall.success) {
    errors.push(
      'Không đọc được retry context 4F-4A: ' +
      retryContextCall.message
    );
  }

  var requiredFunctions =
    kidlearnV3_4f4cCheckRequiredFunctions_([
      'kidlearnV3_getChildRetryContext4F4AV3',
      'kidlearnV3_getLessonPlayerContext4C3V3'
    ]);

  if (!requiredFunctions.success) {
    errors =
      errors.concat(requiredFunctions.errors || []);
  }

  var markers =
    kidlearnV3_4f4cInspectUiMarkers_();

  if (!markers.success) {
    errors =
      errors.concat(markers.errors || []);
  }

  warnings =
    warnings.concat(markers.warnings || []);

  var retryContext =
    retryContextCall.output || null;

  var retryCount =
    retryContext && retryContext.retryQueue
      ? Number(retryContext.retryQueue.retryCount || 0)
      : 0;

  if (retryCount === 0) {
    warnings.push(
      'retryCount = 0. Đây là hợp lệ nếu chưa có bài REVIEWED_RETRY để test UI.'
    );
  }

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_CHILD_RETRY_LESSON_ROUTING_READINESS_4F_4C_V3',
    phase:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.PARENT_PHASE,
    routingName:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.ROUTING_NAME,
    prerequisite: {
      phase4F4BReady:
        f4b.success === true,
      retryContextReadable:
        retryContextCall.success === true,
      lessonPlayerContextFunctionExists:
        requiredFunctions.success === true
    },
    retryContext:
      retryContext,
    uiBehavior: {
      buttonAction:
        'open-retry-lesson-4f4c',
      opensExistingLessonPlayer:
        true,
      childCanOpenDriveLink:
        false,
      createsAssignmentNow:
        false,
      resetsLessonProgressNow:
        false,
      writesStudySessionNow:
        false
    },
    uiMarkers:
      markers,
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.NEXT_STAGE,
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
      kidlearnV3_4f4cUniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4f4cUniqueArray_(warnings)
  };
}


/**
 * Build actual route for UI.
 */
function kidlearnV3_4f4cBuildRetryRoute_(options) {
  options = options || {};

  var errors = [];
  var warnings = [];

  var childId =
    String(
      options.childId ||
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.DEFAULT_CHILD_ID
    ).trim();

  var responseId =
    String(options.responseId || '').trim();

  var lessonId =
    String(options.lessonId || '').trim();

  var dev =
    kidlearnV3_4f4cCheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var context = null;

  try {
    context =
      kidlearnV3_getChildRetryContext4F4AV3({
        childId:
          childId,
        limit:
          100
      });
  } catch (errorContext) {
    errors.push(
      'Không đọc được child retry context: ' +
      String(errorContext.message || errorContext)
    );
  }

  var item = null;

  if (context && context.retryQueue && context.retryQueue.items) {
    item =
      kidlearnV3_4f4cFindRetryItem_(
        context.retryQueue.items,
        responseId,
        lessonId
      );
  }

  if (!item) {
    errors.push(
      'Không tìm thấy bài REVIEWED_RETRY tương ứng. responseId=' +
      responseId +
      ', lessonId=' +
      lessonId +
      '. Nếu retryCount=0 thì cần có bài được phụ huynh chọn RETRY trước.'
    );
  }

  var lessonPreflight = {
    success: false,
    message: 'NOT_RUN'
  };

  if (item && item.lessonId) {
    lessonPreflight =
      kidlearnV3_4f4cPreflightLessonContext_(
        item
      );

    if (!lessonPreflight.success) {
      warnings.push(
        'Lesson context preflight warning: ' +
        lessonPreflight.message +
        '. UI vẫn thử mở Lesson Player bằng router 4C4.'
      );
    }
  }

  var route = null;

  if (item) {
    route = {
      routeId:
        'RETRY_ROUTE_4F4C_' +
        String(item.responseId || item.lessonId || new Date().getTime()),
      sourcePhase:
        '4F-4C',
      retryMode:
        true,
      childId:
        item.childId || childId,
      responseId:
        item.responseId || '',
      responseRowNumber:
        item.responseRowNumber || '',
      lessonId:
        item.lessonId || '',
      lessonTitle:
        item.lessonTitle || '',
      subjectCode:
        item.subjectCode || '',
      subjectName:
        item.subjectName || '',
      activityId:
        item.activityId || '',
      answerMode:
        item.answerMode || 'HANDWRITE_INPUT',
      reviewStatus:
        item.reviewStatus || 'REVIEWED_RETRY',
      reviewerNote:
        item.reviewerNote || '',
      openMode:
        'OPEN_EXISTING_LESSON_PLAYER',
      targetUiFunction:
        'window.openLessonFromSubjectDashboard4C2',
      childCanOpenDriveLink:
        false,
      writesNow:
        false,
      createsAssignmentNow:
        false,
      resetsLessonProgressNow:
        false,
      uiText: {
        openingMessage:
          'Mở lại bài để con làm lại nhé.',
        lessonButtonLabel:
          'Làm lại bài này'
      }
    };
  }

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_RETRY_LESSON_ROUTE_4F_4C_V3',
    phase:
      KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.PHASE,
    route:
      route,
    lessonPreflight:
      lessonPreflight,
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
      kidlearnV3_4f4cUniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4f4cUniqueArray_(warnings)
  };
}


function kidlearnV3_4f4cFindRetryItem_(items, responseId, lessonId) {
  items = items || [];

  responseId =
    String(responseId || '').trim();

  lessonId =
    String(lessonId || '').trim();

  for (var i = 0; i < items.length; i++) {
    if (
      responseId &&
      String(items[i].responseId || '').trim() === responseId
    ) {
      return items[i];
    }
  }

  for (var j = 0; j < items.length; j++) {
    if (
      lessonId &&
      String(items[j].lessonId || '').trim() === lessonId
    ) {
      return items[j];
    }
  }

  if (!responseId && !lessonId && items.length) {
    return items[0];
  }

  return null;
}


function kidlearnV3_4f4cPreflightLessonContext_(item) {
  try {
    if (
      typeof kidlearnV3_getLessonPlayerContext4C3V3 !== 'function'
    ) {
      return {
        success: false,
        message:
          'Thiếu kidlearnV3_getLessonPlayerContext4C3V3'
      };
    }

    var context =
      kidlearnV3_getLessonPlayerContext4C3V3({
        childId:
          item.childId || KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.DEFAULT_CHILD_ID,
        lessonId:
          item.lessonId || '',
        subjectCode:
          item.subjectCode || '',
        source:
          '4F-4C_RETRY_PREVIEW'
      });

    return {
      success:
        context && context.success === true,
      lessonId:
        item.lessonId || '',
      subjectCode:
        item.subjectCode || '',
      message:
        context && context.success === true
          ? 'OK'
          : JSON.stringify(context || {})
    };

  } catch (error) {
    return {
      success: false,
      lessonId:
        item.lessonId || '',
      subjectCode:
        item.subjectCode || '',
      message:
        String(error.message || error)
    };
  }
}


/**
 * UI marker inspection.
 */
function kidlearnV3_4f4cInspectUiMarkers_() {
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
        .createHtmlOutputFromFile('UI_Product_Client_ChildRetryRouting_4F4C')
        .getContent();
  } catch (error2) {
    errors.push(
      'Không đọc được UI_Product_Client_ChildRetryRouting_4F4C: ' +
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
    'UI_Product_Client_ChildRetryRouting_4F4C'
  ];

  var clientMarkers = [
    'KIDLEARN_CHILD_RETRY_ROUTING_UI_4F4C',
    'patchChildRetryButtonsForRouting4F4C',
    'openRetryLesson4F4C',
    'kidlearnV3_getRetryLessonRoute4F4CV3',
    'kl-child-retry-routing-4f4c',
    'open-retry-lesson-4f4c'
  ];

  var styleMarkers = [
    '.kl-child-retry-routing-4f4c',
    '.kl-child-retry-routing-feedback-4f4c',
    '.kl-child-retry-routing-feedback-4f4c.is-success',
    '.kl-child-retry-routing-feedback-4f4c.is-error'
  ];

  for (var i = 0; i < shellMarkers.length; i++) {
    if (shell.indexOf(shellMarkers[i]) === -1) {
      errors.push(
        'Shell thiếu include marker: ' +
        shellMarkers[i]
      );
    }
  }

  for (var j = 0; j < clientMarkers.length; j++) {
    if (client.indexOf(clientMarkers[j]) === -1) {
      errors.push(
        'Client 4F-4C thiếu marker: ' +
        clientMarkers[j]
      );
    }
  }

  for (var k = 0; k < styleMarkers.length; k++) {
    if (styles.indexOf(styleMarkers[k]) === -1) {
      errors.push(
        'CSS 4F-4C thiếu marker: ' +
        styleMarkers[k]
      );
    }
  }

  return {
    success:
      errors.length === 0,
    action:
      'INSPECT_CHILD_RETRY_ROUTING_UI_MARKERS_4F_4C_V3',
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


/**
 * Function existence checks.
 */
function kidlearnV3_4f4cCheckRequiredFunctions_(functionNames) {
  var errors = [];
  var results = [];

  for (var i = 0; i < functionNames.length; i++) {
    var name =
      functionNames[i];

    var exists =
      kidlearnV3_4f4cFunctionExists_(name);

    results.push({
      functionName:
        name,
      exists:
        exists
    });

    if (!exists) {
      errors.push(
        'Thiếu required function: ' + name
      );
    }
  }

  return {
    success:
      errors.length === 0,
    results:
      results,
    errorCount:
      errors.length,
    errors:
      errors
  };
}


function kidlearnV3_4f4cFunctionExists_(functionName) {
  try {
    return eval(
      'typeof ' + functionName + ' === "function"'
    ) === true;
  } catch (error) {
    return false;
  }
}


/**
 * DEV safety.
 */
function kidlearnV3_4f4cCheckDevSafety_() {
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
function kidlearnV3_4f4cSafeCall_(functionName) {
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
          : kidlearnV3_4f4cPreviewValue_(JSON.stringify(output || {})),
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


function kidlearnV3_4f4cPreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 350) {
    return text.substring(0, 350) + '...';
  }

  return text;
}


function kidlearnV3_4f4cUniqueArray_(items) {
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


function kidlearnV3_4f4cSaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.PARENT_PHASE,
      status:
        status,
      routingName:
        KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.ROUTING_NAME,
      retryCount:
        result.retryContext && result.retryContext.retryQueue
          ? result.retryContext.retryQueue.retryCount
          : result.retryCount || 0,
      nextBundle:
        KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_CHILD_RETRY_ROUTING_4F4C_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4f4cReadJsonProperty_(key) {
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