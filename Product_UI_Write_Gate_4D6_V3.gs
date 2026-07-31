/**
 * ================================================================
 * KIDLEARN V3 - UI CONTROLLED WRITE GATE
 * Step: 4D-6
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Connect Lesson Player UI to controlled DEV write services.
 * - Default mode: dry-run only.
 * - Optional mode: controlled DEV real write.
 *
 * Safety:
 * - Không ghi PROD.
 * - Gate mặc định đóng.
 * - Chỉ mở gate bằng confirm text.
 * - Không tự bật real write khi deploy UI.
 */


var KIDLEARN_V3_UI_WRITE_GATE_4D6_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4D6_STATUS',
  GATE_MODE: 'KIDLEARN_V3_PHASE_4D6_GATE_MODE',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4D6_LAST_PREVIEW_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4D6_LAST_READY_AT',
  LAST_GATE_CHANGE_AT: 'KIDLEARN_V3_PHASE_4D6_LAST_GATE_CHANGE_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4D6_LAST_RESULT_JSON'
};


var KIDLEARN_V3_UI_WRITE_GATE_4D6_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  READY_FOR_4D_7: 'READY_FOR_4D_7',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_UI_WRITE_GATE_4D6_MODE = {
  CLOSED_DRY_RUN_ONLY: 'GATE_CLOSED_DRY_RUN_ONLY',
  OPEN_DEV_CONTROLLED: 'OPEN_DEV_CONTROLLED'
};


var KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG = {
  PHASE: '4D-6',
  PARENT_PHASE: '4D',
  PREVIOUS_BUNDLE: '4D-5',
  NEXT_BUNDLE: '4D-7',
  NEXT_STAGE: 'QA_AND_4D_LOCK',
  GATE_NAME: 'UI_CONTROLLED_WRITE_GATE',
  OPEN_CONFIRM_TEXT: 'CONFIRM_OPEN_UI_CONTROLLED_WRITE_GATE_4D6',
  CLOSE_CONFIRM_TEXT: 'CONFIRM_CLOSE_UI_CONTROLLED_WRITE_GATE_4D6',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED_WHEN_GATE_OPEN: true
};


/**
 * Preview UI write gate.
 * Không ghi sheet.
 */
function kidlearnV3_previewUiControlledWriteGate4D6V3() {
  var result =
    kidlearnV3_4d6BuildGateReadiness_();

  result.action =
    'PREVIEW_UI_CONTROLLED_WRITE_GATE_4D_6_V3';

  kidlearnV3_4d6SaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_UI_WRITE_GATE_4D6_STATUS.PREVIEWED
      : KIDLEARN_V3_UI_WRITE_GATE_4D6_STATUS.FAILED,
    KIDLEARN_V3_UI_WRITE_GATE_4D6_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4D-6 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 4D-6 ready.
 * Không mở real write gate.
 */
function kidlearnV3_markUiControlledWriteGate4D6ReadyV3() {
  var preview =
    kidlearnV3_previewUiControlledWriteGate4D6V3();

  if (!preview.success) {
    throw new Error('Preview 4D-6 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_UI_CONTROLLED_WRITE_GATE_4D_6_READY_V3',
    phase:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_STATUS.READY_FOR_4D_7,
    gateMode:
      kidlearnV3_4d6GetGateMode_(),
    gateName:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.GATE_NAME,
    nextBundle:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed:
      kidlearnV3_4d6GetGateMode_() ===
      KIDLEARN_V3_UI_WRITE_GATE_4D6_MODE.OPEN_DEV_CONTROLLED,
    message:
      'UI Controlled Write Gate ready. Gate mặc định có thể vẫn đóng dry-run.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4d6SaveStatus_(
    result,
    KIDLEARN_V3_UI_WRITE_GATE_4D6_STATUS.READY_FOR_4D_7,
    KIDLEARN_V3_UI_WRITE_GATE_4D6_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Open UI controlled write gate.
 * Không ghi sheet ngay tại function này.
 * Sau khi mở, thao tác từ UI mới có thể ghi DEV.
 */
function kidlearnV3_openUiControlledWriteGate4D6ConfirmV3() {
  return kidlearnV3_setUiControlledWriteGate4D6V3({
    confirm:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.OPEN_CONFIRM_TEXT,
    gateMode:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_MODE.OPEN_DEV_CONTROLLED,
    reviewerNote:
      'Open UI controlled write gate for DEV only.'
  });
}


/**
 * Close UI controlled write gate.
 */
function kidlearnV3_closeUiControlledWriteGate4D6ConfirmV3() {
  return kidlearnV3_setUiControlledWriteGate4D6V3({
    confirm:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.CLOSE_CONFIRM_TEXT,
    gateMode:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_MODE.CLOSED_DRY_RUN_ONLY,
    reviewerNote:
      'Close UI controlled write gate. UI returns to dry-run only.'
  });
}


/**
 * Set gate mode.
 */
function kidlearnV3_setUiControlledWriteGate4D6V3(options) {
  options = options || {};

  var requestedMode =
    String(options.gateMode || '').trim();

  var confirmText =
    String(options.confirm || '')
      .trim()
      .toUpperCase();

  if (
    requestedMode ===
    KIDLEARN_V3_UI_WRITE_GATE_4D6_MODE.OPEN_DEV_CONTROLLED
  ) {
    if (
      confirmText !==
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.OPEN_CONFIRM_TEXT
    ) {
      throw new Error(
        'Thiếu confirm mở gate. Cần confirm=' +
        KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.OPEN_CONFIRM_TEXT
      );
    }
  } else if (
    requestedMode ===
    KIDLEARN_V3_UI_WRITE_GATE_4D6_MODE.CLOSED_DRY_RUN_ONLY
  ) {
    if (
      confirmText !==
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.CLOSE_CONFIRM_TEXT
    ) {
      throw new Error(
        'Thiếu confirm đóng gate. Cần confirm=' +
        KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.CLOSE_CONFIRM_TEXT
      );
    }
  } else {
    throw new Error(
      'gateMode không hợp lệ: ' + requestedMode
    );
  }

  var readiness =
    kidlearnV3_4d6BuildGateReadiness_();

  if (!readiness.success) {
    throw new Error(
      '4D-6 readiness chưa pass. Errors=' +
      readiness.errors.join(' | ')
    );
  }

  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_UI_WRITE_GATE_4D6_KEYS.GATE_MODE,
      requestedMode
    );

  var result = {
    success: true,
    action: 'SET_UI_CONTROLLED_WRITE_GATE_4D_6_V3',
    phase:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.PHASE,
    status:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_STATUS.READY_FOR_4D_7,
    gateMode: requestedMode,
    previousGateMode:
      readiness.gateMode,
    reviewerNote:
      String(options.reviewerNote || ''),
    prodWriteAllowed: false,
    realWriteAllowed:
      requestedMode ===
      KIDLEARN_V3_UI_WRITE_GATE_4D6_MODE.OPEN_DEV_CONTROLLED,
    actualSheetWritePerformed: false,
    message:
      requestedMode ===
      KIDLEARN_V3_UI_WRITE_GATE_4D6_MODE.OPEN_DEV_CONTROLLED
        ? 'UI write gate opened for controlled DEV real writes.'
        : 'UI write gate closed. UI is dry-run only.',
    changedAt:
      new Date().toISOString()
  };

  kidlearnV3_4d6SaveStatus_(
    result,
    KIDLEARN_V3_UI_WRITE_GATE_4D6_STATUS.READY_FOR_4D_7,
    KIDLEARN_V3_UI_WRITE_GATE_4D6_KEYS.LAST_GATE_CHANGE_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * UI submits one answer.
 * Gate closed: dry-run only.
 * Gate open: write DATA_Responses + DATA_LessonProgress on DEV.
 */
function kidlearnV3_submitLessonActivityFromUi4D6V3(payload) {
  payload = payload || {};

  var guard =
    kidlearnV3_4d6BuildRuntimeGuard_();

  var normalized =
    kidlearnV3_4d6NormalizeUiAnswerPayload_(payload);

  if (
    guard.gateMode !==
    KIDLEARN_V3_UI_WRITE_GATE_4D6_MODE.OPEN_DEV_CONTROLLED
  ) {
    var dryRun =
      kidlearnV3_dryRunSubmitAnswer4C5V3(normalized);

    return {
      success: true,
      action: 'UI_SUBMIT_LESSON_ACTIVITY_4D_6_DRY_RUN_ONLY_V3',
      phase:
        KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.PHASE,
      gateMode: guard.gateMode,
      mode: 'DRY_RUN_ONLY',
      dryRun: dryRun,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      actualSheetWritePerformed: false,
      childMessage:
        dryRun.childMessage ||
        'Đã nhận câu trả lời thử. Chưa lưu dữ liệu thật.',
      parentMessage:
        'Gate is closed. UI submit used dry-run only.'
    };
  }

  var responseWrite =
    kidlearnV3_realWriteDataResponses4D3V3({
      confirm: 'CONFIRM_REAL_WRITE_DATA_RESPONSES_4D3',
      payload: normalized,
      reviewerNote:
        '4D-6 UI controlled write: submit answer from Lesson Player.'
    });

  var progressPayload =
    kidlearnV3_4d6BuildProgressPayloadFromAnswer_(
      normalized
    );

  var progressWrite =
    kidlearnV3_realWriteDataLessonProgress4D4V3({
      confirm:
        'CONFIRM_REAL_WRITE_DATA_LESSON_PROGRESS_4D4',
      payload:
        progressPayload,
      reviewerNote:
        '4D-6 UI controlled write: update lesson progress after answer submit.'
    });

  var result = {
    success:
      responseWrite.success === true &&
      progressWrite.success === true,
    action: 'UI_SUBMIT_LESSON_ACTIVITY_4D_6_REAL_WRITE_DEV_V3',
    phase:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.PHASE,
    gateMode: guard.gateMode,
    mode: 'OPEN_DEV_CONTROLLED',
    childId: normalized.childId,
    lessonId: normalized.lessonId,
    activityId: normalized.activityId,
    answerMode: normalized.answerMode,
    writes: {
      DATA_Responses: {
        success: responseWrite.success,
        responseId: responseWrite.responseId,
        rowNumber: responseWrite.responseRowNumber,
        rowDelta:
          responseWrite.rowDelta
            ? responseWrite.rowDelta.DATA_Responses
            : ''
      },
      DATA_LessonProgress: {
        success: progressWrite.success,
        progressId: progressWrite.progressId,
        rowNumber: progressWrite.progressRowNumber,
        operationMode: progressWrite.operationMode,
        rowDelta:
          progressWrite.rowDelta
            ? progressWrite.rowDelta.DATA_LessonProgress
            : ''
      },
      LOG_Audit: {
        responseAuditId: responseWrite.auditId,
        progressAuditId: progressWrite.auditId
      }
    },
    prodWriteAllowed: false,
    realWriteAllowed: true,
    actualSheetWritePerformed: true,
    childMessage:
      'Đã lưu câu trả lời vào DEV. Giỏi lắm!',
    parentMessage:
      'UI controlled DEV write completed for response and lesson progress.',
    writtenAt:
      new Date().toISOString()
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * UI completes lesson.
 * Gate closed: dry-run only.
 * Gate open: write DATA_LessonProgress + DATA_StudySessions on DEV.
 */
function kidlearnV3_completeLessonFromUi4D6V3(payload) {
  payload = payload || {};

  var guard =
    kidlearnV3_4d6BuildRuntimeGuard_();

  var normalized =
    kidlearnV3_4d6NormalizeUiCompletePayload_(payload);

  if (
    guard.gateMode !==
    KIDLEARN_V3_UI_WRITE_GATE_4D6_MODE.OPEN_DEV_CONTROLLED
  ) {
    var dryRun =
      kidlearnV3_dryRunCompleteLesson4C5V3(normalized);

    return {
      success: true,
      action: 'UI_COMPLETE_LESSON_4D_6_DRY_RUN_ONLY_V3',
      phase:
        KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.PHASE,
      gateMode: guard.gateMode,
      mode: 'DRY_RUN_ONLY',
      dryRun: dryRun,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      actualSheetWritePerformed: false,
      childMessage:
        dryRun.childMessage ||
        'Con hoàn thành bài học thử. Chưa lưu dữ liệu thật.',
      parentMessage:
        'Gate is closed. UI complete used dry-run only.'
    };
  }

  var progressWrite =
    kidlearnV3_realWriteDataLessonProgress4D4V3({
      confirm:
        'CONFIRM_REAL_WRITE_DATA_LESSON_PROGRESS_4D4',
      payload: {
        childId: normalized.childId,
        lessonId: normalized.lessonId,
        subjectCode: normalized.subjectCode,
        status: 'COMPLETED',
        progressPercent: 100,
        currentStepIndex: normalized.completedStepCount,
        startedAt: normalized.startedAt,
        completedAt: normalized.completedAt,
        updatedAt: normalized.completedAt
      },
      reviewerNote:
        '4D-6 UI controlled write: complete lesson progress.'
    });

  var sessionWrite =
    kidlearnV3_realWriteDataStudySessions4D5V3({
      confirm:
        'CONFIRM_REAL_WRITE_DATA_STUDY_SESSIONS_4D5',
      payload: {
        sessionId: normalized.sessionId,
        childId: normalized.childId,
        lessonId: normalized.lessonId,
        subjectCode: normalized.subjectCode,
        status: 'COMPLETED',
        startedAt: normalized.startedAt,
        endedAt: normalized.completedAt,
        durationSeconds: normalized.durationSeconds,
        updatedAt: normalized.completedAt
      },
      reviewerNote:
        '4D-6 UI controlled write: complete study session.'
    });

  var result = {
    success:
      progressWrite.success === true &&
      sessionWrite.success === true,
    action: 'UI_COMPLETE_LESSON_4D_6_REAL_WRITE_DEV_V3',
    phase:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.PHASE,
    gateMode: guard.gateMode,
    mode: 'OPEN_DEV_CONTROLLED',
    childId: normalized.childId,
    lessonId: normalized.lessonId,
    writes: {
      DATA_LessonProgress: {
        success: progressWrite.success,
        progressId: progressWrite.progressId,
        rowNumber: progressWrite.progressRowNumber,
        operationMode: progressWrite.operationMode
      },
      DATA_StudySessions: {
        success: sessionWrite.success,
        sessionId: sessionWrite.sessionId,
        rowNumber: sessionWrite.sessionRowNumber,
        operationMode: sessionWrite.operationMode
      },
      LOG_Audit: {
        progressAuditId: progressWrite.auditId,
        sessionAuditId: sessionWrite.auditId
      }
    },
    prodWriteAllowed: false,
    realWriteAllowed: true,
    actualSheetWritePerformed: true,
    childMessage:
      'Đã lưu hoàn thành bài học vào DEV. Con rất cố gắng!',
    parentMessage:
      'UI controlled DEV write completed for lesson completion.',
    writtenAt:
      new Date().toISOString()
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get gate status for UI.
 */
function kidlearnV3_getUiControlledWriteGate4D6StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_UI_CONTROLLED_WRITE_GATE_4D_6_STATUS_V3',
    phase:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_UI_WRITE_GATE_4D6_KEYS.STATUS
      ) ||
      KIDLEARN_V3_UI_WRITE_GATE_4D6_STATUS.NOT_RUN,
    gateMode:
      kidlearnV3_4d6GetGateMode_(),
    prodWriteAllowed: false,
    realWriteAllowed:
      kidlearnV3_4d6GetGateMode_() ===
      KIDLEARN_V3_UI_WRITE_GATE_4D6_MODE.OPEN_DEV_CONTROLLED,
    nextBundle:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.NEXT_BUNDLE,
    lastResult:
      kidlearnV3_4d6ReadJsonProperty_(
        KIDLEARN_V3_UI_WRITE_GATE_4D6_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert 4D-6 ready.
 */
function kidlearnV3_assertUiControlledWriteGate4D6ReadyV3() {
  var status =
    kidlearnV3_getUiControlledWriteGate4D6StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_UI_WRITE_GATE_4D6_STATUS.READY_FOR_4D_7
  ) {
    errors.push(
      '4D-6 chưa READY_FOR_4D_7. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_UI_CONTROLLED_WRITE_GATE_4D_6_READY_V3',
    phase:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.PHASE,
    status: status.status,
    gateMode: status.gateMode,
    nextBundle:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: status.realWriteAllowed,
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
 * QA batch 4D-6.
 */
function kidlearnV3_runQaBatch4D6V3() {
  var preview =
    kidlearnV3_previewUiControlledWriteGate4D6V3();

  var ready =
    kidlearnV3_markUiControlledWriteGate4D6ReadyV3();

  var assertReady =
    kidlearnV3_assertUiControlledWriteGate4D6ReadyV3();

  var result = {
    success:
      preview.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4D_6_UI_CONTROLLED_WRITE_GATE',
    phase:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.PHASE,
    gateMode:
      kidlearnV3_4d6GetGateMode_(),
    nextBundle:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed:
      kidlearnV3_4d6GetGateMode_() ===
      KIDLEARN_V3_UI_WRITE_GATE_4D6_MODE.OPEN_DEV_CONTROLLED,
    results: {
      preview: preview.success,
      ready: ready.success,
      assertReady: assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4D-6 QA batch failed.');
  }

  return result;
}


/**
 * Readiness.
 */
function kidlearnV3_4d6BuildGateReadiness_() {
  var errors = [];
  var warnings = [];

  var d5 =
    kidlearnV3_4d6SafeCall_(
      'kidlearnV3_assertStudySessionRealWrite4D5ReadyV3'
    );

  if (!d5.success) {
    errors.push(
      '4D-5 chưa READY_FOR_4D_6: ' +
      d5.message
    );
  }

  var dev =
    kidlearnV3_4d6CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  warnings =
    warnings.concat(dev.warnings || []);

  var marker =
    kidlearnV3_4d6InspectUiMarkers_();

  if (!marker.success) {
    errors =
      errors.concat(marker.errors || []);
  }

  warnings =
    warnings.concat(marker.warnings || []);

  return {
    success: errors.length === 0,
    action: 'BUILD_UI_CONTROLLED_WRITE_GATE_READINESS_4D_6_V3',
    phase:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.PHASE,
    gateName:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.GATE_NAME,
    gateMode:
      kidlearnV3_4d6GetGateMode_(),
    nextBundle:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed:
      kidlearnV3_4d6GetGateMode_() ===
      KIDLEARN_V3_UI_WRITE_GATE_4D6_MODE.OPEN_DEV_CONTROLLED,
    actualSheetWritePerformed: false,
    prerequisite: {
      phase4D5Ready: d5.success
    },
    devSafety: dev,
    uiMarkerCheck: marker,
    errorCount: errors.length,
    warningCount:
      kidlearnV3_4d6UniqueArray_(warnings).length,
    errors: errors,
    warnings:
      kidlearnV3_4d6UniqueArray_(warnings)
  };
}


/**
 * Inspect UI markers.
 */
function kidlearnV3_4d6InspectUiMarkers_() {
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
        .createHtmlOutputFromFile('UI_Product_Client_WriteGate_4D6')
        .getContent();
  } catch (error2) {
    errors.push(
      'Không đọc được UI_Product_Client_WriteGate_4D6: ' +
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
    'UI_Product_Client_WriteGate_4D6',
    'UI_Product_Client_LessonInteraction_DryRun_4C5'
  ];

  var clientMarkers = [
    'KIDLEARN_UI_CONTROLLED_WRITE_GATE_4D6',
    'kidlearnV3_getUiControlledWriteGate4D6StatusV3',
    'kidlearnV3_submitLessonActivityFromUi4D6V3',
    'kidlearnV3_completeLessonFromUi4D6V3',
    'collectAnswerPayloadForWriteGate4D6',
    'submitAnswerThroughWriteGate4D6',
    'completeLessonThroughWriteGate4D6',
    'showWriteGateFeedback4D6'
  ];

  var styleMarkers = [
    '.kl-write-gate-badge-4d6',
    '.kl-write-gate-feedback-4d6',
    '.kl-write-gate-feedback-4d6.is-real',
    '.kl-write-gate-feedback-4d6.is-dryrun',
    '.kl-write-gate-feedback-4d6.is-error'
  ];

  for (var i = 0; i < shellMarkers.length; i++) {
    if (shell.indexOf(shellMarkers[i]) === -1) {
      errors.push('Shell thiếu marker: ' + shellMarkers[i]);
    }
  }

  for (var j = 0; j < clientMarkers.length; j++) {
    if (client.indexOf(clientMarkers[j]) === -1) {
      errors.push('Client 4D-6 thiếu marker: ' + clientMarkers[j]);
    }
  }

  for (var k = 0; k < styleMarkers.length; k++) {
    if (styles.indexOf(styleMarkers[k]) === -1) {
      errors.push('CSS 4D-6 thiếu marker: ' + styleMarkers[k]);
    }
  }

  return {
    success: errors.length === 0,
    action: 'INSPECT_UI_CONTROLLED_WRITE_GATE_MARKERS_4D_6_V3',
    phase: '4D-6',
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Runtime guard.
 */
function kidlearnV3_4d6BuildRuntimeGuard_() {
  var dev =
    kidlearnV3_4d6CheckDevSafety_();

  if (!dev.success) {
    throw new Error(
      'DEV safety failed: ' +
      dev.errors.join(' | ')
    );
  }

  var d5 =
    kidlearnV3_4d6SafeCall_(
      'kidlearnV3_assertStudySessionRealWrite4D5ReadyV3'
    );

  if (!d5.success) {
    throw new Error(
      '4D-5 chưa READY_FOR_4D_6: ' +
      d5.message
    );
  }

  return {
    success: true,
    gateMode:
      kidlearnV3_4d6GetGateMode_(),
    environment:
      dev.environment,
    prodWriteAllowed: false
  };
}


function kidlearnV3_4d6GetGateMode_() {
  var mode =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_UI_WRITE_GATE_4D6_KEYS.GATE_MODE
      );

  if (!mode) {
    mode =
      KIDLEARN_V3_UI_WRITE_GATE_4D6_MODE.CLOSED_DRY_RUN_ONLY;

    PropertiesService
      .getScriptProperties()
      .setProperty(
        KIDLEARN_V3_UI_WRITE_GATE_4D6_KEYS.GATE_MODE,
        mode
      );
  }

  return mode;
}


/**
 * Payload helpers.
 */
function kidlearnV3_4d6NormalizeUiAnswerPayload_(payload) {
  payload = payload || {};

  if (
    typeof kidlearnV3_4d3NormalizeResponsePayload_ === 'function'
  ) {
    var normalized =
      kidlearnV3_4d3NormalizeResponsePayload_(payload);

    normalized.progressPercent =
      Number(payload.progressPercent || 50);

    normalized.currentStepIndex =
      Number(payload.currentStepIndex || 0);

    normalized.startedAt =
      String(payload.startedAt || new Date().toISOString());

    return normalized;
  }

  return {
    childId:
      String(payload.childId || 'CHD_V2_CHILD_DEFAULT'),
    lessonId:
      String(payload.lessonId || ''),
    activityId:
      String(payload.activityId || ''),
    subjectCode:
      String(payload.subjectCode || payload.subjectKey || ''),
    answerMode:
      String(payload.answerMode || 'UNKNOWN').toUpperCase(),
    answerText:
      String(payload.answerText || ''),
    expectedAnswer:
      String(payload.expectedAnswer || ''),
    selectedOptionId:
      String(payload.selectedOptionId || ''),
    selectedOptionLabel:
      String(payload.selectedOptionLabel || ''),
    isCorrect:
      payload.isCorrect === undefined ? '' : payload.isCorrect,
    score:
      payload.score === undefined ? '' : payload.score,
    canvasHasInk:
      payload.canvasHasInk === true,
    canvasDataUrlLength:
      Number(payload.canvasDataUrlLength || 0),
    progressPercent:
      Number(payload.progressPercent || 50),
    currentStepIndex:
      Number(payload.currentStepIndex || 0),
    startedAt:
      String(payload.startedAt || new Date().toISOString())
  };
}


function kidlearnV3_4d6BuildProgressPayloadFromAnswer_(answer) {
  var percent =
    Number(answer.progressPercent || 50);

  if (isNaN(percent)) percent = 50;
  if (percent < 1) percent = 1;
  if (percent > 99) percent = 99;

  return {
    childId:
      answer.childId,
    lessonId:
      answer.lessonId,
    subjectCode:
      answer.subjectCode,
    status:
      'IN_PROGRESS',
    progressPercent:
      percent,
    currentStepIndex:
      Number(answer.currentStepIndex || 0),
    startedAt:
      answer.startedAt || new Date().toISOString(),
    completedAt:
      '',
    updatedAt:
      new Date().toISOString()
  };
}


function kidlearnV3_4d6NormalizeUiCompletePayload_(payload) {
  payload = payload || {};

  var now =
    new Date();

  var startedAt =
    String(
      payload.startedAt ||
      new Date(now.getTime() - 5 * 60 * 1000).toISOString()
    );

  var completedAt =
    String(payload.completedAt || now.toISOString());

  var durationSeconds =
    Number(payload.durationSeconds || 300);

  if (isNaN(durationSeconds) || durationSeconds < 0) {
    durationSeconds = 300;
  }

  return {
    sessionId:
      String(payload.sessionId || ''),
    childId:
      String(payload.childId || 'CHD_V2_CHILD_DEFAULT'),
    lessonId:
      String(payload.lessonId || ''),
    subjectCode:
      String(payload.subjectCode || payload.subjectKey || ''),
    completedStepCount:
      Number(payload.completedStepCount || 0),
    startedAt:
      startedAt,
    completedAt:
      completedAt,
    durationSeconds:
      durationSeconds
  };
}


/**
 * DEV safety.
 */
function kidlearnV3_4d6CheckDevSafety_() {
  var errors = [];
  var warnings = [];

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
    success: errors.length === 0,
    environment: environment || 'UNKNOWN',
    prodWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Generic helpers.
 */
function kidlearnV3_4d6SafeCall_(functionName) {
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
        message:
          'Thiếu function ' + functionName
      };
    }

    var output =
      eval(functionName)();

    return {
      success:
        output && output.success === true,
      message:
        output && output.success === true
          ? ''
          : JSON.stringify(output),
      output: output
    };

  } catch (error) {
    return {
      success: false,
      message:
        String(error.message || error)
    };
  }
}


function kidlearnV3_4d6UniqueArray_(items) {
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


function kidlearnV3_4d6SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_UI_WRITE_GATE_4D6_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_UI_WRITE_GATE_4D6_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.PHASE,
      status: status,
      gateMode:
        result.gateMode || kidlearnV3_4d6GetGateMode_(),
      nextBundle:
        KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_UI_WRITE_GATE_4D6_CONFIG.NEXT_STAGE,
      prodWriteAllowed: false,
      realWriteAllowed:
        kidlearnV3_4d6GetGateMode_() ===
        KIDLEARN_V3_UI_WRITE_GATE_4D6_MODE.OPEN_DEV_CONTROLLED,
      actualSheetWritePerformed:
        result.actualSheetWritePerformed === true,
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


function kidlearnV3_4d6ReadJsonProperty_(key) {
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