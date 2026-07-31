/**
 * ================================================================
 * KIDLEARN V3 - PHASE 4D QA + LOCK
 * Step: 4D-7
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Final QA for Phase 4D.
 * - Confirm controlled DEV writes completed safely.
 * - Confirm UI write gate is closed before lock.
 * - Lock Phase 4D.
 *
 * Safety:
 * - Không ghi thêm DATA_Responses.
 * - Không ghi thêm DATA_LessonProgress.
 * - Không ghi thêm DATA_StudySessions.
 * - Không ghi thêm LOG_Audit.
 * - Không ghi PROD.
 * - Chỉ ghi ScriptProperties trạng thái lock.
 */


var KIDLEARN_V3_PHASE_4D_LOCK_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4D_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4D_LAST_PREVIEW_AT',
  LAST_QA_AT: 'KIDLEARN_V3_PHASE_4D_LAST_QA_AT',
  LAST_LOCK_AT: 'KIDLEARN_V3_PHASE_4D_LAST_LOCK_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4D_LAST_RESULT_JSON',
  LOCK_JSON: 'KIDLEARN_V3_PHASE_4D_LOCK_JSON'
};


var KIDLEARN_V3_PHASE_4D_LOCK_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  FINAL_QA_PASSED: 'FINAL_QA_PASSED',
  PHASE_4D_CLOSED_LOCKED: 'PHASE_4D_CLOSED_LOCKED',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PHASE_4D_LOCK_CONFIG = {
  PHASE: '4D',
  LOCK_STEP: '4D-7',
  PREVIOUS_PHASE: '4C',
  NEXT_PHASE: '4E',
  NEXT_STAGE: 'HANDWRITING_ASSET_STORAGE_AND_REVIEW_WORKFLOW',
  LOCK_NAME: 'CONTROLLED_LESSON_PROGRESS_AND_RESPONSE_WRITES_LOCK',
  CONFIRM_TEXT: 'LOCK_PHASE_4D_CONTROLLED_WRITES',
  REQUIRED_GATE_MODE_FOR_LOCK: 'GATE_CLOSED_DRY_RUN_ONLY',
  MIN_VISUAL_SCORE_PERCENT: 85,
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED_AFTER_LOCK: false
};


/**
 * Preview Phase 4D lock readiness.
 * Không ghi dữ liệu học thật.
 */
function kidlearnV3_previewPhase4DLockV3() {
  var result =
    kidlearnV3_4d7BuildFinalQaReadiness_();

  result.action =
    'PREVIEW_PHASE_4D_LOCK_4D_7_V3';

  kidlearnV3_4d7SaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_PHASE_4D_LOCK_STATUS.PREVIEWED
      : KIDLEARN_V3_PHASE_4D_LOCK_STATUS.FAILED,
    KIDLEARN_V3_PHASE_4D_LOCK_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4D-7 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Run final QA.
 * Không ghi dữ liệu học thật.
 */
function kidlearnV3_runPhase4DFinalQaV3() {
  var result =
    kidlearnV3_4d7BuildFinalQaReadiness_();

  result.action =
    'RUN_PHASE_4D_FINAL_QA_4D_7_V3';

  kidlearnV3_4d7SaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_PHASE_4D_LOCK_STATUS.FINAL_QA_PASSED
      : KIDLEARN_V3_PHASE_4D_LOCK_STATUS.FAILED,
    KIDLEARN_V3_PHASE_4D_LOCK_KEYS.LAST_QA_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4D final QA failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Public lock wrapper.
 */
function kidlearnV3_lockPhase4DConfirmV3() {
  return kidlearnV3_lockPhase4DV3({
    confirm:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.CONFIRM_TEXT,
    acceptedVisualScorePercent: 85,
    reviewerDecision:
      'ACCEPT_AND_LOCK_PHASE_4D',
    gateFinalMode:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.REQUIRED_GATE_MODE_FOR_LOCK,
    note:
      'Phase 4D accepted. Controlled DEV writes for responses, lesson progress, study sessions, and UI write gate are completed. Gate is closed before lock.'
  });
}


/**
 * Lock Phase 4D.
 * Chỉ ghi ScriptProperties.
 */
function kidlearnV3_lockPhase4DV3(options) {
  options = options || {};

  var confirmText =
    String(options.confirm || '')
      .trim()
      .toUpperCase();

  if (
    confirmText !==
    KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm. Cần confirm=' +
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.CONFIRM_TEXT
    );
  }

  var visualScore =
    Number(options.acceptedVisualScorePercent || 0);

  if (
    isNaN(visualScore) ||
    visualScore <
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.MIN_VISUAL_SCORE_PERCENT
  ) {
    throw new Error(
      'Visual score chưa đủ để lock 4D. Cần >= ' +
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.MIN_VISUAL_SCORE_PERCENT +
      '%. Current=' +
      visualScore
    );
  }

  var finalQa =
    kidlearnV3_4d7BuildFinalQaReadiness_();

  if (!finalQa.success) {
    throw new Error(
      'Final QA 4D chưa pass. Errors=' +
      finalQa.errors.join(' | ')
    );
  }

  var gateMode =
    finalQa.gateStatus &&
    finalQa.gateStatus.output
      ? finalQa.gateStatus.output.gateMode
      : '';

  if (
    gateMode !==
    KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.REQUIRED_GATE_MODE_FOR_LOCK
  ) {
    throw new Error(
      'Không lock 4D khi UI gate đang mở. Current gateMode=' +
      gateMode +
      '. Hãy chạy kidlearnV3_closeUiControlledWriteGate4D6ConfirmV3 trước.'
    );
  }

  var lockRecord = {
    success: true,
    action: 'LOCK_PHASE_4D_CONTROLLED_WRITES_V3',
    phase:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.LOCK_STEP,
    status:
      KIDLEARN_V3_PHASE_4D_LOCK_STATUS.PHASE_4D_CLOSED_LOCKED,
    lockName:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.LOCK_NAME,
    reviewerDecision:
      String(options.reviewerDecision || ''),
    acceptedVisualScorePercent:
      visualScore,
    reviewerNote:
      String(options.note || ''),
    gateFinalMode:
      gateMode,
    completedBundles: [
      '4D-1 Write Contract + Schema Readiness Check',
      '4D-2 Response Write Dry-run Row Preview',
      '4D-3 Controlled DEV Real Write DATA_Responses',
      '4D-3P DATA_Responses answerMetaJson Schema Patch',
      '4D-4 Controlled DEV Real Write DATA_LessonProgress',
      '4D-5 Controlled DEV Real Write DATA_StudySessions',
      '4D-6 UI Controlled Write Gate',
      '4D-6P UI Write Gate Stability Patch',
      '4D-7 QA + 4D Lock'
    ],
    finalQaSummary:
      finalQa.finalQaSummary,
    writeEvidence:
      finalQa.writeEvidence,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    actualSheetWritePerformed: false,
    lockOnlyScriptPropertiesWrite: true,
    nextPhase:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.NEXT_STAGE,
    lockedAt:
      new Date().toISOString()
  };

  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PHASE_4D_LOCK_KEYS.LOCK_JSON,
      JSON.stringify(lockRecord)
    );

  kidlearnV3_4d7SaveStatus_(
    lockRecord,
    KIDLEARN_V3_PHASE_4D_LOCK_STATUS.PHASE_4D_CLOSED_LOCKED,
    KIDLEARN_V3_PHASE_4D_LOCK_KEYS.LAST_LOCK_AT
  );

  console.log(JSON.stringify(lockRecord, null, 2));

  return lockRecord;
}


/**
 * Get Phase 4D lock status.
 */
function kidlearnV3_getPhase4DLockStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PHASE_4D_LOCK_STATUS_V3',
    phase:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.LOCK_STEP,
    status:
      properties.getProperty(
        KIDLEARN_V3_PHASE_4D_LOCK_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PHASE_4D_LOCK_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE_4D_LOCK_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastQaAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE_4D_LOCK_KEYS.LAST_QA_AT
      ) || '',
    lastLockAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE_4D_LOCK_KEYS.LAST_LOCK_AT
      ) || '',
    lastResult:
      kidlearnV3_4d7ReadJsonProperty_(
        KIDLEARN_V3_PHASE_4D_LOCK_KEYS.LAST_RESULT_JSON
      ),
    lockRecord:
      kidlearnV3_4d7ReadJsonProperty_(
        KIDLEARN_V3_PHASE_4D_LOCK_KEYS.LOCK_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert Phase 4D closed locked.
 */
function kidlearnV3_assertPhase4DClosedLockedV3() {
  var status =
    kidlearnV3_getPhase4DLockStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PHASE_4D_LOCK_STATUS.PHASE_4D_CLOSED_LOCKED
  ) {
    errors.push(
      'Phase 4D chưa PHASE_4D_CLOSED_LOCKED. Status=' +
      status.status
    );
  }

  if (
    !status.lockRecord ||
    status.lockRecord.gateFinalMode !==
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.REQUIRED_GATE_MODE_FOR_LOCK
  ) {
    errors.push(
      'Gate final mode chưa đúng hoặc thiếu lockRecord.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PHASE_4D_CLOSED_LOCKED_V3',
    phase:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.LOCK_STEP,
    status: status.status,
    gateFinalMode:
      status.lockRecord
        ? status.lockRecord.gateFinalMode
        : '',
    nextPhase:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.NEXT_STAGE,
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
 * Alias.
 */
function kidlearnV3_assertPhase4DClosedV3() {
  return kidlearnV3_assertPhase4DClosedLockedV3();
}


/**
 * QA batch 4D-7.
 * Không lock. Lock chạy riêng bằng kidlearnV3_lockPhase4DConfirmV3.
 */
function kidlearnV3_runQaBatch4D7V3() {
  var preview =
    kidlearnV3_previewPhase4DLockV3();

  var finalQa =
    kidlearnV3_runPhase4DFinalQaV3();

  var result = {
    success:
      preview.success === true &&
      finalQa.success === true,
    suiteName:
      'PHASE_4D_7_QA_AND_LOCK_PRECHECK',
    phase:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.LOCK_STEP,
    status:
      KIDLEARN_V3_PHASE_4D_LOCK_STATUS.FINAL_QA_PASSED,
    nextAction:
      'Run kidlearnV3_lockPhase4DConfirmV3',
    nextPhase:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.NEXT_PHASE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    actualSheetWritePerformed: false,
    results: {
      preview: preview.success,
      finalQa: finalQa.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4D-7 QA batch failed.');
  }

  return result;
}


/**
 * Build final QA readiness.
 */
function kidlearnV3_4d7BuildFinalQaReadiness_() {
  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4d7CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  warnings =
    warnings.concat(dev.warnings || []);

  var prerequisiteChecks =
    kidlearnV3_4d7RunPrerequisiteChecks_();

  if (!prerequisiteChecks.success) {
    errors =
      errors.concat(prerequisiteChecks.errors || []);
  }

  warnings =
    warnings.concat(prerequisiteChecks.warnings || []);

  var writeEvidence =
    kidlearnV3_4d7CollectWriteEvidence_();

  if (!writeEvidence.success) {
    errors =
      errors.concat(writeEvidence.errors || []);
  }

  warnings =
    warnings.concat(writeEvidence.warnings || []);

  var gateStatus =
    kidlearnV3_4d7SafeCall_(
      'kidlearnV3_getUiControlledWriteGate4D6StatusV3'
    );

  if (!gateStatus.success) {
    errors.push(
      'Không đọc được UI write gate status: ' +
      gateStatus.message
    );
  } else {
    var mode =
      gateStatus.output &&
      gateStatus.output.gateMode
        ? gateStatus.output.gateMode
        : '';

    if (
      mode !==
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.REQUIRED_GATE_MODE_FOR_LOCK
    ) {
      errors.push(
        'UI write gate chưa đóng. Current gateMode=' +
        mode +
        '. Cần GATE_CLOSED_DRY_RUN_ONLY trước khi lock.'
      );
    }
  }

  var uiMarkers =
    kidlearnV3_4d7InspectUiMarkers_();

  if (!uiMarkers.success) {
    errors =
      errors.concat(uiMarkers.errors || []);
  }

  warnings =
    warnings.concat(uiMarkers.warnings || []);

  var finalQaSummary = {
    phase4CClosed:
      prerequisiteChecks.results.phase4CClosed === true,
    phase4D1Ready:
      prerequisiteChecks.results.phase4D1Ready === true,
    phase4D2Ready:
      prerequisiteChecks.results.phase4D2Ready === true,
    phase4D3Ready:
      prerequisiteChecks.results.phase4D3Ready === true,
    phase4D4Ready:
      prerequisiteChecks.results.phase4D4Ready === true,
    phase4D5Ready:
      prerequisiteChecks.results.phase4D5Ready === true,
    phase4D6Ready:
      prerequisiteChecks.results.phase4D6Ready === true,
    gateClosed:
      gateStatus.success === true &&
      gateStatus.output &&
      gateStatus.output.gateMode ===
        KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.REQUIRED_GATE_MODE_FOR_LOCK,
    responseWriteEvidence:
      writeEvidence.responseWriteEvidence,
    lessonProgressWriteEvidence:
      writeEvidence.lessonProgressWriteEvidence,
    studySessionWriteEvidence:
      writeEvidence.studySessionWriteEvidence,
    uiWriteGatePatchDetected:
      uiMarkers.uiWriteGatePatchDetected === true
  };

  return {
    success: errors.length === 0,
    action: 'BUILD_PHASE_4D_FINAL_QA_READINESS_V3',
    phase:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.LOCK_STEP,
    lockName:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.LOCK_NAME,
    nextPhase:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    actualSheetWritePerformed: false,
    devSafety: dev,
    prerequisiteChecks: prerequisiteChecks,
    writeEvidence: writeEvidence,
    gateStatus: gateStatus,
    uiMarkers: uiMarkers,
    finalQaSummary: finalQaSummary,
    errorCount: errors.length,
    warningCount:
      kidlearnV3_4d7UniqueArray_(warnings).length,
    errors: errors,
    warnings:
      kidlearnV3_4d7UniqueArray_(warnings)
  };
}


/**
 * Prerequisite checks.
 */
function kidlearnV3_4d7RunPrerequisiteChecks_() {
  var errors = [];
  var warnings = [];

  var checks = {
    phase4CClosed:
      kidlearnV3_4d7SafeCall_(
        'kidlearnV3_assertPhase4CClosedLockedV3'
      ),
    phase4D1Ready:
      kidlearnV3_4d7SafeCall_(
        'kidlearnV3_assertWriteContract4D1ReadyV3'
      ),
    phase4D2Ready:
      kidlearnV3_4d7SafeCall_(
        'kidlearnV3_assertResponseWriteDryRun4D2ReadyV3'
      ),
    phase4D3Ready:
      kidlearnV3_4d7SafeCall_(
        'kidlearnV3_assertResponseRealWrite4D3ReadyV3'
      ),
    phase4D4Ready:
      kidlearnV3_4d7SafeCall_(
        'kidlearnV3_assertLessonProgressRealWrite4D4ReadyV3'
      ),
    phase4D5Ready:
      kidlearnV3_4d7SafeCall_(
        'kidlearnV3_assertStudySessionRealWrite4D5ReadyV3'
      ),
    phase4D6Ready:
      kidlearnV3_4d7SafeCall_(
        'kidlearnV3_assertUiControlledWriteGate4D6ReadyV3'
      )
  };

  var results = {};

  for (var key in checks) {
    if (!checks.hasOwnProperty(key)) continue;

    results[key] =
      checks[key].success === true;

    if (!checks[key].success) {
      errors.push(
        key +
        ' failed: ' +
        checks[key].message
      );
    }
  }

  return {
    success: errors.length === 0,
    action: 'RUN_PHASE_4D_PREREQUISITE_CHECKS_V3',
    results: results,
    rawChecks: checks,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Collect write evidence from 4D-3, 4D-4, 4D-5.
 */
function kidlearnV3_4d7CollectWriteEvidence_() {
  var errors = [];
  var warnings = [];

  var responseStatus =
    kidlearnV3_4d7SafeCall_(
      'kidlearnV3_getResponseRealWrite4D3StatusV3'
    );

  var progressStatus =
    kidlearnV3_4d7SafeCall_(
      'kidlearnV3_getLessonProgressRealWrite4D4StatusV3'
    );

  var sessionStatus =
    kidlearnV3_4d7SafeCall_(
      'kidlearnV3_getStudySessionRealWrite4D5StatusV3'
    );

  var responseEvidence =
    kidlearnV3_4d7ExtractWriteEvidence_(
      responseStatus,
      'DATA_Responses',
      'responseId'
    );

  var progressEvidence =
    kidlearnV3_4d7ExtractWriteEvidence_(
      progressStatus,
      'DATA_LessonProgress',
      'progressId'
    );

  var sessionEvidence =
    kidlearnV3_4d7ExtractWriteEvidence_(
      sessionStatus,
      'DATA_StudySessions',
      'sessionId'
    );

  if (!responseEvidence.success) {
    errors =
      errors.concat(responseEvidence.errors || []);
  }

  if (!progressEvidence.success) {
    errors =
      errors.concat(progressEvidence.errors || []);
  }

  if (!sessionEvidence.success) {
    errors =
      errors.concat(sessionEvidence.errors || []);
  }

  return {
    success: errors.length === 0,
    action: 'COLLECT_PHASE_4D_WRITE_EVIDENCE_V3',
    responseWriteEvidence:
      responseEvidence,
    lessonProgressWriteEvidence:
      progressEvidence,
    studySessionWriteEvidence:
      sessionEvidence,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    actualSheetWritePerformed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


function kidlearnV3_4d7ExtractWriteEvidence_(
  statusCall,
  label,
  idKey
) {
  var errors = [];

  if (!statusCall.success) {
    return {
      success: false,
      label: label,
      errors: [
        'Không đọc được status cho ' +
        label +
        ': ' +
        statusCall.message
      ]
    };
  }

  var output =
    statusCall.output || {};

  var lastWrite =
    output.lastWrite || null;

  if (!lastWrite) {
    errors.push(
      label + ': thiếu lastWrite.'
    );
  } else {
    if (lastWrite.actualSheetWritePerformed !== true) {
      errors.push(
        label +
        ': actualSheetWritePerformed không phải true.'
      );
    }

    if (!lastWrite[idKey]) {
      errors.push(
        label +
        ': thiếu ' +
        idKey +
        ' trong lastWrite.'
      );
    }
  }

  return {
    success: errors.length === 0,
    label: label,
    status:
      output.status || '',
    idKey: idKey,
    idValue:
      lastWrite && lastWrite[idKey]
        ? lastWrite[idKey]
        : '',
    rowNumber:
      lastWrite
        ? (
            lastWrite.responseRowNumber ||
            lastWrite.progressRowNumber ||
            lastWrite.sessionRowNumber ||
            ''
          )
        : '',
    auditId:
      lastWrite && lastWrite.auditId
        ? lastWrite.auditId
        : '',
    actualSheetWritePerformed:
      lastWrite &&
      lastWrite.actualSheetWritePerformed === true,
    rowDelta:
      lastWrite && lastWrite.rowDelta
        ? lastWrite.rowDelta
        : null,
    errors: errors
  };
}


/**
 * Inspect UI markers after 4D-6P.
 */
function kidlearnV3_4d7InspectUiMarkers_() {
  var errors = [];
  var warnings = [];

  var shell = '';
  var client4D6 = '';
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
    client4D6 =
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
    'UI_Product_Client_LessonInteraction_DryRun_4C5',
    'UI_Product_Client_LessonPlayer_4C4'
  ];

  var clientMarkers = [
    'KIDLEARN_UI_CONTROLLED_WRITE_GATE_4D6',
    'Phase 4D-6P',
    'refreshWriteGateStatus4D6',
    'collectAnswerPayloadForWriteGate4D6',
    'submitAnswerThroughWriteGate4D6',
    'completeLessonThroughWriteGate4D6',
    'showWriteGateFeedback4D6',
    'statusLoaded',
    'statusLoading'
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
      errors.push(
        'Shell thiếu marker: ' +
        shellMarkers[i]
      );
    }
  }

  for (var j = 0; j < clientMarkers.length; j++) {
    if (client4D6.indexOf(clientMarkers[j]) === -1) {
      errors.push(
        'Client 4D-6 thiếu marker: ' +
        clientMarkers[j]
      );
    }
  }

  for (var k = 0; k < styleMarkers.length; k++) {
    if (styles.indexOf(styleMarkers[k]) === -1) {
      errors.push(
        'CSS thiếu marker: ' +
        styleMarkers[k]
      );
    }
  }

  return {
    success: errors.length === 0,
    action: 'INSPECT_PHASE_4D_UI_MARKERS_V3',
    uiWriteGatePatchDetected:
      client4D6.indexOf('Phase 4D-6P') !== -1,
    shellIncludeOrderChecked: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * DEV safety.
 */
function kidlearnV3_4d7CheckDevSafety_() {
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
    action: 'CHECK_DEV_SAFETY_4D_7_V3',
    environment: environment || 'UNKNOWN',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Generic helpers.
 */
function kidlearnV3_4d7SafeCall_(functionName) {
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


function kidlearnV3_4d7UniqueArray_(items) {
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


function kidlearnV3_4d7SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PHASE_4D_LOCK_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PHASE_4D_LOCK_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.PHASE,
      lockStep:
        result.lockStep ||
        KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.LOCK_STEP,
      status: status,
      lockName:
        KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.LOCK_NAME,
      nextPhase:
        KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.NEXT_PHASE,
      nextStage:
        KIDLEARN_V3_PHASE_4D_LOCK_CONFIG.NEXT_STAGE,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      actualSheetWritePerformed:
        result.actualSheetWritePerformed === true,
      gateFinalMode:
        result.gateFinalMode || '',
      finalQaSummary:
        result.finalQaSummary || null,
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


function kidlearnV3_4d7ReadJsonProperty_(key) {
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