/**
 * ================================================================
 * KIDLEARN V3 - LESSON ACTIVITY INTERACTION DRY-RUN
 * Step: 4C-5
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Simulate lesson interaction writes without writing learning data.
 * - Dry-run start lesson, save answer draft, submit answer, complete lesson.
 *
 * Safety:
 * - Không ghi DATA_Responses.
 * - Không ghi DATA_LessonProgress.
 * - Không ghi DATA_StudySessions.
 * - Không ghi Google Sheet dữ liệu học.
 * - Không ghi PROD.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4C-5.
 */


var KIDLEARN_V3_LESSON_INTERACTION_4C5_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4C5_STATUS',
  LAST_CHECK_AT: 'KIDLEARN_V3_PHASE_4C5_LAST_CHECK_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4C5_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4C5_LAST_RESULT_JSON'
};


var KIDLEARN_V3_LESSON_INTERACTION_4C5_STATUS = {
  NOT_RUN: 'NOT_RUN',
  CHECK_PASSED: 'CHECK_PASSED',
  READY_FOR_4C_6: 'READY_FOR_4C_6',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_LESSON_INTERACTION_4C5_CONFIG = {
  PHASE: '4C-5',
  PARENT_PHASE: '4C',
  PREVIOUS_BUNDLE: '4C-4',
  NEXT_BUNDLE: '4C-6',
  NEXT_STAGE: 'QA_AND_4C_LOCK',
  INTERACTION_NAME: 'LESSON_ACTIVITY_INTERACTION_DRY_RUN',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false
};


/**
 * Dry-run: start lesson.
 */
function kidlearnV3_dryRunStartLesson4C5V3(payload) {
  payload = payload || {};

  var guard =
    kidlearnV3_4c5AssertDryRunGuard_();

  var lessonId =
    String(payload.lessonId || '').trim();

  var subjectCode =
    String(payload.subjectCode || payload.subjectKey || '').trim();

  var childId =
    String(payload.childId || 'CHD_V2_CHILD_DEFAULT').trim();

  var result = {
    success: true,
    action: 'DRY_RUN_START_LESSON_4C_5_V3',
    phase: '4C-5',
    mode: 'DRY_RUN_ONLY',
    dryRunId:
      kidlearnV3_4c5BuildDryRunId_('START_LESSON'),
    childId: childId,
    lessonId: lessonId,
    subjectCode: subjectCode,
    simulatedWrites: [
      {
        targetSheet: 'DATA_StudySessions',
        operation: 'INSERT',
        willWriteNow: false,
        rowPreview: {
          sessionId:
            'DRY_SESSION_' + new Date().getTime(),
          childId: childId,
          lessonId: lessonId,
          status: 'STARTED',
          startedAt:
            new Date().toISOString()
        }
      },
      {
        targetSheet: 'DATA_LessonProgress',
        operation: 'UPSERT',
        willWriteNow: false,
        rowPreview: {
          childId: childId,
          lessonId: lessonId,
          status: 'IN_PROGRESS',
          progressPercent: 0,
          updatedAt:
            new Date().toISOString()
        }
      }
    ],
    prodWriteAllowed: false,
    realWriteAllowed: false,
    guard: guard,
    childMessage:
      'Bắt đầu bài học nhé!',
    parentMessage:
      'Dry-run start lesson completed. No sheet write.'
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Dry-run: save answer draft.
 */
function kidlearnV3_dryRunSaveAnswerDraft4C5V3(payload) {
  payload = payload || {};

  var guard =
    kidlearnV3_4c5AssertDryRunGuard_();

  var normalized =
    kidlearnV3_4c5NormalizeAnswerPayload_(payload);

  var result = {
    success: true,
    action: 'DRY_RUN_SAVE_ANSWER_DRAFT_4C_5_V3',
    phase: '4C-5',
    mode: 'DRY_RUN_ONLY',
    dryRunId:
      kidlearnV3_4c5BuildDryRunId_('SAVE_DRAFT'),
    normalizedAnswer: normalized,
    simulatedWrites: [
      {
        targetSheet: 'DATA_Responses',
        operation: 'UPSERT_DRAFT',
        willWriteNow: false,
        rowPreview: {
          responseId:
            'DRY_RESPONSE_' + new Date().getTime(),
          childId: normalized.childId,
          lessonId: normalized.lessonId,
          activityId: normalized.activityId,
          answerMode: normalized.answerMode,
          answerText: normalized.answerText,
          answerMetaJson:
            JSON.stringify(normalized.answerMeta || {}),
          status: 'DRAFT',
          updatedAt:
            new Date().toISOString()
        }
      }
    ],
    prodWriteAllowed: false,
    realWriteAllowed: false,
    guard: guard,
    childMessage:
      'Cô đã nhận bản nháp thử. Bước này chưa lưu thật.',
    parentMessage:
      'Dry-run save draft completed. No sheet write.'
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Dry-run: submit answer.
 */
function kidlearnV3_dryRunSubmitAnswer4C5V3(payload) {
  payload = payload || {};

  var guard =
    kidlearnV3_4c5AssertDryRunGuard_();

  var normalized =
    kidlearnV3_4c5NormalizeAnswerPayload_(payload);

  var validation =
    kidlearnV3_4c5ValidateAnswer_(normalized);

  var evaluation =
    kidlearnV3_4c5EvaluateAnswerDryRun_(normalized);

  var result = {
    success: validation.success,
    action: 'DRY_RUN_SUBMIT_ANSWER_4C_5_V3',
    phase: '4C-5',
    mode: 'DRY_RUN_ONLY',
    dryRunId:
      kidlearnV3_4c5BuildDryRunId_('SUBMIT_ANSWER'),
    normalizedAnswer: normalized,
    validation: validation,
    evaluation: evaluation,
    simulatedWrites: [
      {
        targetSheet: 'DATA_Responses',
        operation: 'INSERT_OR_UPDATE_SUBMITTED_RESPONSE',
        willWriteNow: false,
        rowPreview: {
          responseId:
            'DRY_RESPONSE_' + new Date().getTime(),
          childId: normalized.childId,
          lessonId: normalized.lessonId,
          activityId: normalized.activityId,
          answerMode: normalized.answerMode,
          answerText: normalized.answerText,
          isAutoGradable: evaluation.isAutoGradable,
          isCorrectDryRun: evaluation.isCorrect,
          scoreDryRun: evaluation.score,
          status: 'SUBMITTED_DRY_RUN',
          submittedAt:
            new Date().toISOString()
        }
      }
    ],
    prodWriteAllowed: false,
    realWriteAllowed: false,
    guard: guard,
    childMessage:
      evaluation.childMessage,
    parentMessage:
      validation.success
        ? 'Dry-run submit answer completed. No sheet write.'
        : 'Dry-run submit answer validation failed. No sheet write.',
    errorCount:
      validation.success ? 0 : validation.errors.length,
    errors:
      validation.errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      'Dry-run submit answer failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Dry-run: complete lesson.
 */
function kidlearnV3_dryRunCompleteLesson4C5V3(payload) {
  payload = payload || {};

  var guard =
    kidlearnV3_4c5AssertDryRunGuard_();

  var lessonId =
    String(payload.lessonId || '').trim();

  var childId =
    String(payload.childId || 'CHD_V2_CHILD_DEFAULT').trim();

  var subjectCode =
    String(payload.subjectCode || payload.subjectKey || '').trim();

  var completedStepCount =
    Number(payload.completedStepCount || 0);

  if (isNaN(completedStepCount)) {
    completedStepCount = 0;
  }

  var result = {
    success: true,
    action: 'DRY_RUN_COMPLETE_LESSON_4C_5_V3',
    phase: '4C-5',
    mode: 'DRY_RUN_ONLY',
    dryRunId:
      kidlearnV3_4c5BuildDryRunId_('COMPLETE_LESSON'),
    childId: childId,
    lessonId: lessonId,
    subjectCode: subjectCode,
    completedStepCount: completedStepCount,
    simulatedWrites: [
      {
        targetSheet: 'DATA_LessonProgress',
        operation: 'UPSERT',
        willWriteNow: false,
        rowPreview: {
          childId: childId,
          lessonId: lessonId,
          status: 'COMPLETED',
          progressPercent: 100,
          completedAt:
            new Date().toISOString()
        }
      },
      {
        targetSheet: 'DATA_StudySessions',
        operation: 'UPDATE',
        willWriteNow: false,
        rowPreview: {
          childId: childId,
          lessonId: lessonId,
          status: 'COMPLETED',
          endedAt:
            new Date().toISOString()
        }
      },
      {
        targetSheet: 'DATA_RewardTransactions',
        operation: 'INSERT',
        willWriteNow: false,
        rowPreview: {
          childId: childId,
          rewardType: 'STAR',
          amount: 1,
          reason: 'Complete lesson dry-run',
          createdAt:
            new Date().toISOString()
        }
      }
    ],
    prodWriteAllowed: false,
    realWriteAllowed: false,
    guard: guard,
    childMessage:
      'Con hoàn thành bài học rồi! Đây là bản chạy thử, chưa lưu thật.',
    parentMessage:
      'Dry-run complete lesson completed. No sheet write.'
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Technical check.
 */
function kidlearnV3_checkLessonInteractionDryRun4C5V3() {
  var errors = [];
  var warnings = [];

  var c4 =
    kidlearnV3_4c5SafeCall_(
      'kidlearnV3_assertLessonPlayerUi4C4ReadyV3'
    );

  if (!c4.success) {
    errors.push(
      '4C-4 chưa READY_FOR_4C_5: ' +
      c4.message
    );
  }

  var start =
    kidlearnV3_4c5SafeCallWithPayload_(
      'kidlearnV3_dryRunStartLesson4C5V3',
      {
        lessonId: 'MATH_L1',
        subjectCode: 'MATH',
        childId: 'CHD_V2_CHILD_DEFAULT'
      }
    );

  if (!start.success) {
    errors.push(
      'Dry-run start lesson failed: ' +
      start.message
    );
  }

  var submit =
    kidlearnV3_4c5SafeCallWithPayload_(
      'kidlearnV3_dryRunSubmitAnswer4C5V3',
      {
        lessonId: 'MATH_L1',
        activityId: 'MATH_L1_ACT_1',
        subjectCode: 'MATH',
        childId: 'CHD_V2_CHILD_DEFAULT',
        answerMode: 'BUTTON_INPUT',
        answerText: '13',
        expectedAnswer: '13'
      }
    );

  if (!submit.success) {
    errors.push(
      'Dry-run submit answer failed: ' +
      submit.message
    );
  }

  var complete =
    kidlearnV3_4c5SafeCallWithPayload_(
      'kidlearnV3_dryRunCompleteLesson4C5V3',
      {
        lessonId: 'MATH_L1',
        subjectCode: 'MATH',
        childId: 'CHD_V2_CHILD_DEFAULT',
        completedStepCount: 4
      }
    );

  if (!complete.success) {
    errors.push(
      'Dry-run complete lesson failed: ' +
      complete.message
    );
  }

  var uiMarker =
    kidlearnV3_4c5InspectUiMarkers_();

  if (!uiMarker.success) {
    errors =
      errors.concat(uiMarker.errors || []);
  }

  warnings =
    warnings.concat(uiMarker.warnings || []);

  var result = {
    success: errors.length === 0,
    action: 'CHECK_LESSON_INTERACTION_DRY_RUN_4C_5_V3',
    phase: '4C-5',
    interactionName:
      KIDLEARN_V3_LESSON_INTERACTION_4C5_CONFIG.INTERACTION_NAME,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    serverDryRunChecks: {
      startLesson: start.success,
      submitAnswer: submit.success,
      completeLesson: complete.success
    },
    uiMarkerCheck: uiMarker,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4c5SaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_LESSON_INTERACTION_4C5_STATUS.CHECK_PASSED
      : KIDLEARN_V3_LESSON_INTERACTION_4C5_STATUS.FAILED,
    KIDLEARN_V3_LESSON_INTERACTION_4C5_KEYS.LAST_CHECK_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4C-5 dry-run check failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready.
 */
function kidlearnV3_markLessonInteractionDryRun4C5ReadyV3() {
  var check =
    kidlearnV3_checkLessonInteractionDryRun4C5V3();

  if (!check.success) {
    throw new Error('Check 4C-5 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_LESSON_INTERACTION_DRY_RUN_4C_5_READY_V3',
    phase: '4C-5',
    parentPhase: '4C',
    status:
      KIDLEARN_V3_LESSON_INTERACTION_4C5_STATUS.READY_FOR_4C_6,
    nextBundle:
      KIDLEARN_V3_LESSON_INTERACTION_4C5_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LESSON_INTERACTION_4C5_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    message:
      'Lesson Activity Interaction Dry-run ready. Có thể qua 4C-6 QA + 4C Lock.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4c5SaveStatus_(
    result,
    KIDLEARN_V3_LESSON_INTERACTION_4C5_STATUS.READY_FOR_4C_6,
    KIDLEARN_V3_LESSON_INTERACTION_4C5_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getLessonInteractionDryRun4C5StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_LESSON_INTERACTION_DRY_RUN_4C_5_STATUS_V3',
    phase: '4C-5',
    parentPhase: '4C',
    status:
      properties.getProperty(
        KIDLEARN_V3_LESSON_INTERACTION_4C5_KEYS.STATUS
      ) ||
      KIDLEARN_V3_LESSON_INTERACTION_4C5_STATUS.NOT_RUN,
    lastCheckAt:
      properties.getProperty(
        KIDLEARN_V3_LESSON_INTERACTION_4C5_KEYS.LAST_CHECK_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_LESSON_INTERACTION_4C5_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4c5ReadJsonProperty_(
        KIDLEARN_V3_LESSON_INTERACTION_4C5_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertLessonInteractionDryRun4C5ReadyV3() {
  var status =
    kidlearnV3_getLessonInteractionDryRun4C5StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_LESSON_INTERACTION_4C5_STATUS.READY_FOR_4C_6
  ) {
    errors.push(
      '4C-5 chưa READY_FOR_4C_6. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_LESSON_INTERACTION_DRY_RUN_4C_5_READY_V3',
    phase: '4C-5',
    parentPhase: '4C',
    status: status.status,
    nextBundle:
      KIDLEARN_V3_LESSON_INTERACTION_4C5_CONFIG.NEXT_BUNDLE,
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
 * QA batch.
 */
function kidlearnV3_runQaBatch4C5V3() {
  var check =
    kidlearnV3_checkLessonInteractionDryRun4C5V3();

  var ready =
    kidlearnV3_markLessonInteractionDryRun4C5ReadyV3();

  var assertReady =
    kidlearnV3_assertLessonInteractionDryRun4C5ReadyV3();

  var result = {
    success:
      check.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4C_5_LESSON_ACTIVITY_INTERACTION_DRY_RUN',
    phase: '4C-5',
    nextBundle:
      KIDLEARN_V3_LESSON_INTERACTION_4C5_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    results: {
      check: check.success,
      ready: ready.success,
      assertReady: assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4C-5 QA batch failed.');
  }

  return result;
}


/**
 * UI marker inspection.
 */
function kidlearnV3_4c5InspectUiMarkers_() {
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
        .createHtmlOutputFromFile('UI_Product_Client_LessonInteraction_DryRun_4C5')
        .getContent();
  } catch (error2) {
    errors.push(
      'Không đọc được UI_Product_Client_LessonInteraction_DryRun_4C5: ' +
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
    'UI_Product_Client_LessonInteraction_DryRun_4C5'
  ];

  var clientMarkers = [
    'KIDLEARN_LESSON_INTERACTION_DRY_RUN_4C5',
    'kidlearnV3_dryRunStartLesson4C5V3',
    'kidlearnV3_dryRunSaveAnswerDraft4C5V3',
    'kidlearnV3_dryRunSubmitAnswer4C5V3',
    'kidlearnV3_dryRunCompleteLesson4C5V3',
    'collectAnswerPayload4C5',
    'dryRunSubmitAnswer4C5',
    'dryRunCompleteLesson4C5',
    'showDryRunFeedback4C5'
  ];

  var styleMarkers = [
    '.kl-dryrun-badge-4c5',
    '.kl-dryrun-feedback-4c5',
    '.kl-dryrun-feedback-4c5.is-success',
    '.kl-dryrun-feedback-4c5.is-warning',
    '.kl-dryrun-feedback-4c5.is-info'
  ];

  for (var i = 0; i < shellMarkers.length; i++) {
    if (shell.indexOf(shellMarkers[i]) === -1) {
      errors.push('Shell thiếu marker: ' + shellMarkers[i]);
    }
  }

  for (var j = 0; j < clientMarkers.length; j++) {
    if (client.indexOf(clientMarkers[j]) === -1) {
      errors.push('Client 4C-5 thiếu marker: ' + clientMarkers[j]);
    }
  }

  for (var k = 0; k < styleMarkers.length; k++) {
    if (styles.indexOf(styleMarkers[k]) === -1) {
      errors.push('CSS 4C-5 thiếu marker: ' + styleMarkers[k]);
    }
  }

  return {
    success: errors.length === 0,
    action: 'INSPECT_LESSON_INTERACTION_DRY_RUN_4C_5_MARKERS_V3',
    phase: '4C-5',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Helpers.
 */
function kidlearnV3_4c5AssertDryRunGuard_() {
  return {
    dryRunOnly: true,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    dataResponsesWriteAllowed: false,
    lessonProgressWriteAllowed: false,
    studySessionWriteAllowed: false,
    message:
      '4C-5 is dry-run only. No learning data write is allowed.'
  };
}


function kidlearnV3_4c5NormalizeAnswerPayload_(payload) {
  payload = payload || {};

  var answerMode =
    String(payload.answerMode || 'UNKNOWN')
      .trim()
      .toUpperCase();

  var answerText =
    String(payload.answerText || '').trim();

  var answerMeta =
    payload.answerMeta || {};

  return {
    childId:
      String(payload.childId || 'CHD_V2_CHILD_DEFAULT').trim(),
    lessonId:
      String(payload.lessonId || '').trim(),
    activityId:
      String(payload.activityId || '').trim(),
    subjectCode:
      String(payload.subjectCode || payload.subjectKey || '').trim(),
    answerMode: answerMode,
    answerText: answerText,
    expectedAnswer:
      String(payload.expectedAnswer || '').trim(),
    selectedOptionId:
      String(payload.selectedOptionId || '').trim(),
    selectedOptionLabel:
      String(payload.selectedOptionLabel || '').trim(),
    canvasHasInk:
      payload.canvasHasInk === true,
    canvasDataUrlLength:
      Number(payload.canvasDataUrlLength || 0),
    answerMeta: answerMeta
  };
}


function kidlearnV3_4c5ValidateAnswer_(answer) {
  var errors = [];

  if (!answer.activityId) {
    errors.push('Thiếu activityId.');
  }

  if (!answer.answerMode || answer.answerMode === 'UNKNOWN') {
    errors.push('Thiếu answerMode.');
  }

  if (
    answer.answerMode === 'HANDWRITE_INPUT'
  ) {
    if (!answer.canvasHasInk && answer.canvasDataUrlLength <= 2000) {
      errors.push('Bài viết tay chưa có nét viết.');
    }
  } else {
    if (!answer.answerText) {
      errors.push('Thiếu answerText.');
    }
  }

  return {
    success: errors.length === 0,
    errors: errors
  };
}


function kidlearnV3_4c5EvaluateAnswerDryRun_(answer) {
  if (answer.answerMode === 'HANDWRITE_INPUT') {
    return {
      isAutoGradable: false,
      isCorrect: null,
      score: null,
      childMessage:
        'Cô đã nhận bài viết tay thử. Bước này chưa lưu và chưa chấm tự động.'
    };
  }

  if (!answer.expectedAnswer) {
    return {
      isAutoGradable: true,
      isCorrect: null,
      score: null,
      childMessage:
        'Cô đã nhận câu trả lời thử. Bước sau sẽ lưu dry-run chi tiết hơn.'
    };
  }

  var normalizedAnswer =
    kidlearnV3_4c5NormalizeAnswerText_(answer.answerText);

  var normalizedExpected =
    kidlearnV3_4c5NormalizeAnswerText_(answer.expectedAnswer);

  var isCorrect =
    normalizedAnswer === normalizedExpected;

  return {
    isAutoGradable: true,
    isCorrect: isCorrect,
    score: isCorrect ? 1 : 0,
    childMessage:
      isCorrect
        ? 'Tốt lắm! Câu trả lời của con đúng trong bản dry-run.'
        : 'Con gần đúng rồi. Đây là bản dry-run, mình có thể thử lại nhé.'
  };
}


function kidlearnV3_4c5NormalizeAnswerText_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}


function kidlearnV3_4c5BuildDryRunId_(prefix) {
  return (
    'DRY_' +
    prefix +
    '_' +
    new Date().getTime()
  );
}


function kidlearnV3_4c5SafeCall_(functionName) {
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


function kidlearnV3_4c5SafeCallWithPayload_(functionName, payload) {
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


function kidlearnV3_4c5SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_LESSON_INTERACTION_4C5_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_LESSON_INTERACTION_4C5_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase: result.phase,
      status: status,
      nextBundle:
        KIDLEARN_V3_LESSON_INTERACTION_4C5_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_LESSON_INTERACTION_4C5_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4c5ReadJsonProperty_(key) {
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