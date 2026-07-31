/**
 * ================================================================
 * KIDLEARN V3 - LESSON PLAYER UI
 * Step: 4C-4
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Validate Lesson Player UI with answer input modes.
 * - Validate client, CSS, and shell integration.
 *
 * Safety:
 * - Không ghi Google Sheet dữ liệu học.
 * - Không ghi PROD.
 * - Không submit answer thật.
 * - Không complete lesson thật.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4C-4.
 */


var KIDLEARN_V3_LESSON_PLAYER_UI_4C4_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4C4_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4C4_LAST_PREVIEW_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4C4_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4C4_LAST_RESULT_JSON'
};


var KIDLEARN_V3_LESSON_PLAYER_UI_4C4_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  READY_FOR_4C_5: 'READY_FOR_4C_5',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG = {
  PHASE: '4C-4',
  PARENT_PHASE: '4C',
  PREVIOUS_BUNDLE: '4C-3',
  NEXT_BUNDLE: '4C-5',
  NEXT_STAGE: 'LESSON_ACTIVITY_INTERACTION_DRY_RUN',
  UI_NAME: 'LESSON_PLAYER_UI_WITH_ANSWER_INPUT_MODES',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false
};


function kidlearnV3_previewLessonPlayerUi4C4V3() {
  var errors = [];
  var warnings = [];

  var c3 =
    kidlearnV3_4c4SafeCall_(
      'kidlearnV3_assertLessonPlayerContext4C3ReadyV3'
    );

  if (!c3.success) {
    errors.push(
      '4C-3 chưa READY_FOR_4C_4: ' +
      c3.message
    );
  }

  var context =
    kidlearnV3_4c4SafeCallWithPayload_(
      'kidlearnV3_getLessonPlayerContext4C3V3',
      {
        subjectCode: 'MATH'
      }
    );

  if (!context.success) {
    errors.push(
      'Không lấy được lesson player context 4C-3: ' +
      context.message
    );
  }

  var marker =
    kidlearnV3_4c4InspectUiMarkers_();

  if (!marker.success) {
    errors =
      errors.concat(marker.errors || []);
  }

  warnings =
    warnings.concat(marker.warnings || []);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_LESSON_PLAYER_UI_4C_4_V3',
    phase:
      KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.PARENT_PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_LESSON_PLAYER_UI_4C4_STATUS.PREVIEWED
        : KIDLEARN_V3_LESSON_PLAYER_UI_4C4_STATUS.FAILED,
    uiName:
      KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.UI_NAME,
    nextBundle:
      KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.NEXT_BUNDLE,
    answerModes: [
      'MULTIPLE_CHOICE',
      'BUTTON_INPUT',
      'TEXT_INPUT',
      'HANDWRITE_INPUT'
    ],
    prodWriteAllowed: false,
    realWriteAllowed: false,
    markerCheck: marker,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4c4SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_LESSON_PLAYER_UI_4C4_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4C-4 preview failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


function kidlearnV3_checkLessonPlayerUi4C4V3() {
  var result =
    kidlearnV3_4c4InspectUiMarkers_();

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4C-4 UI marker check failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


function kidlearnV3_markLessonPlayerUi4C4ReadyV3() {
  var preview =
    kidlearnV3_previewLessonPlayerUi4C4V3();

  if (!preview.success) {
    throw new Error('Preview 4C-4 chưa pass.');
  }

  var check =
    kidlearnV3_checkLessonPlayerUi4C4V3();

  if (!check.success) {
    throw new Error('Marker check 4C-4 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_LESSON_PLAYER_UI_4C_4_READY_V3',
    phase:
      KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_LESSON_PLAYER_UI_4C4_STATUS.READY_FOR_4C_5,
    nextBundle:
      KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    message:
      'Lesson Player UI 4C-4 ready. Có thể qua 4C-5 Lesson Activity Interaction Dry-run.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4c4SaveStatus_(
    result,
    KIDLEARN_V3_LESSON_PLAYER_UI_4C4_STATUS.READY_FOR_4C_5,
    KIDLEARN_V3_LESSON_PLAYER_UI_4C4_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


function kidlearnV3_getLessonPlayerUi4C4StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_LESSON_PLAYER_UI_4C_4_STATUS_V3',
    phase:
      KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_LESSON_PLAYER_UI_4C4_KEYS.STATUS
      ) ||
      KIDLEARN_V3_LESSON_PLAYER_UI_4C4_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_LESSON_PLAYER_UI_4C4_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_LESSON_PLAYER_UI_4C4_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4c4ReadJsonProperty_(
        KIDLEARN_V3_LESSON_PLAYER_UI_4C4_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


function kidlearnV3_assertLessonPlayerUi4C4ReadyV3() {
  var status =
    kidlearnV3_getLessonPlayerUi4C4StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_LESSON_PLAYER_UI_4C4_STATUS.READY_FOR_4C_5
  ) {
    errors.push(
      '4C-4 chưa READY_FOR_4C_5. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_LESSON_PLAYER_UI_4C_4_READY_V3',
    phase:
      KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.PARENT_PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.NEXT_BUNDLE,
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


function kidlearnV3_runQaBatch4C4V3() {
  var preview =
    kidlearnV3_previewLessonPlayerUi4C4V3();

  var check =
    kidlearnV3_checkLessonPlayerUi4C4V3();

  var ready =
    kidlearnV3_markLessonPlayerUi4C4ReadyV3();

  var assertReady =
    kidlearnV3_assertLessonPlayerUi4C4ReadyV3();

  var result = {
    success:
      preview.success === true &&
      check.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4C_4_LESSON_PLAYER_UI_WITH_ANSWER_INPUT_MODES',
    phase:
      KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.PHASE,
    nextBundle:
      KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    results: {
      preview: preview.success,
      check: check.success,
      ready: ready.success,
      assertReady: assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4C-4 QA batch failed.');
  }

  return result;
}


function kidlearnV3_4c4InspectUiMarkers_() {
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
        .createHtmlOutputFromFile('UI_Product_Client_LessonPlayer_4C4')
        .getContent();
  } catch (error2) {
    errors.push(
      'Không đọc được UI_Product_Client_LessonPlayer_4C4: ' +
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
    'UI_Product_Client_LessonPlayer_4C4'
  ];

  var clientMarkers = [
    'KIDLEARN_LESSON_PLAYER_UI_4C4',
    'openLessonPlayer4C4',
    'renderLessonPlayer4C4',
    'kidlearnV3_getLessonPlayerContext4C3V3',
    'renderMultipleChoice4C4',
    'renderButtonInput4C4',
    'renderTextInput4C4',
    'renderHandwritingInput4C4',
    'lessonHandwritingCanvas4C4',
    'pointerdown',
    'demoSubmitAnswer4C4',
    'openLessonFromSubjectDashboard4C2'
  ];

  var styleMarkers = [
    '.kl-lesson-player-4c4',
    '.kl-lesson-header-4c4',
    '.kl-lesson-step-card-4c4',
    '.kl-answer-option-4c4',
    '.kl-button-pad-4c4',
    '.kl-text-answer-4c4',
    '.kl-handwriting-canvas-4c4',
    '.kl-lesson-feedback-4c4',
    '.kl-lesson-theme-blue-4c4',
    '.kl-lesson-theme-orange-4c4',
    '.kl-lesson-theme-green-4c4',
    '.kl-lesson-theme-red-4c4'
  ];

  for (var i = 0; i < shellMarkers.length; i++) {
    if (shell.indexOf(shellMarkers[i]) === -1) {
      errors.push('Shell thiếu marker: ' + shellMarkers[i]);
    }
  }

  for (var j = 0; j < clientMarkers.length; j++) {
    if (client.indexOf(clientMarkers[j]) === -1) {
      errors.push('Client 4C-4 thiếu marker: ' + clientMarkers[j]);
    }
  }

  for (var k = 0; k < styleMarkers.length; k++) {
    if (styles.indexOf(styleMarkers[k]) === -1) {
      errors.push('CSS 4C-4 thiếu marker: ' + styleMarkers[k]);
    }
  }

  return {
    success: errors.length === 0,
    action: 'INSPECT_LESSON_PLAYER_UI_4C_4_MARKERS_V3',
    phase:
      KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.PHASE,
    uiName:
      KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.UI_NAME,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


function kidlearnV3_4c4SafeCall_(functionName) {
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


function kidlearnV3_4c4SafeCallWithPayload_(functionName, payload) {
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
      fn(payload || {});

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


function kidlearnV3_4c4SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_LESSON_PLAYER_UI_4C4_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_LESSON_PLAYER_UI_4C4_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase: result.phase,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.PARENT_PHASE,
      status: status,
      nextBundle:
        KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_LESSON_PLAYER_UI_4C4_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4c4ReadJsonProperty_(key) {
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