/**
 * ================================================================
 * KIDLEARN V3 - PHASE 4C QA + LOCK
 * Step: 4C-6
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Final QA for Phase 4C.
 * - Lock Subject Dashboard + Lesson Player + Dry-run Interaction.
 * - Prepare for Phase 4D.
 *
 * Safety:
 * - Không ghi Google Sheet dữ liệu học.
 * - Không ghi PROD.
 * - Không deploy.
 * - Không gọi lại smoke/check cũ có thể ghi lùi status.
 * - Chỉ ghi ScriptProperties trạng thái lock.
 */


var KIDLEARN_V3_PHASE_4C_LOCK_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4C_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4C_LAST_PREVIEW_AT',
  LAST_QA_AT: 'KIDLEARN_V3_PHASE_4C_LAST_QA_AT',
  LAST_LOCK_AT: 'KIDLEARN_V3_PHASE_4C_LAST_LOCK_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4C_LAST_RESULT_JSON'
};


var KIDLEARN_V3_PHASE_4C_LOCK_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  QA_PASSED: 'QA_PASSED',
  PHASE_4C_CLOSED_LOCKED: 'PHASE_4C_CLOSED_LOCKED',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PHASE_4C_LOCK_CONFIG = {
  PHASE: '4C',
  LOCK_STEP: '4C-6',
  LOCK_NAME: 'SUBJECT_DASHBOARD_AND_LESSON_PLAYER_LOCK',
  NEXT_PHASE: '4D',
  NEXT_STAGE: 'CONTROLLED_LESSON_PROGRESS_AND_RESPONSE_WRITES',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false
};


/**
 * Preview 4C lock readiness.
 */
function kidlearnV3_previewPhase4CLockV3() {
  var errors = [];
  var warnings = [];

  var checks =
    kidlearnV3_4cLockBuildReadinessChecks_();

  for (var i = 0; i < checks.length; i++) {
    var check = checks[i];

    if (!check.success && check.required) {
      errors.push(check.label + ': ' + check.message);
    } else if (!check.success) {
      warnings.push(check.label + ': ' + check.message);
    }
  }

  var markerCheck =
    kidlearnV3_4cLockInspectUiMarkers_();

  if (!markerCheck.success) {
    errors =
      errors.concat(markerCheck.errors || []);
  }

  warnings =
    warnings.concat(markerCheck.warnings || []);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PHASE_4C_LOCK_V3',
    phase: KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.PHASE,
    lockStep: KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.LOCK_STEP,
    lockName: KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.LOCK_NAME,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PHASE_4C_LOCK_STATUS.PREVIEWED
        : KIDLEARN_V3_PHASE_4C_LOCK_STATUS.FAILED,
    nextPhase:
      KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    checkCount: checks.length,
    checks: checks,
    markerCheck: markerCheck,
    lockedScope: [
      '4C-1 Subject Dashboard Context Read-only',
      '4C-2 Subject Theme Map + Subject Dashboard UI',
      '4C-2P Subject Dashboard Routing + Theme Patch',
      '4C-3 Lesson Player Context Read-only',
      '4C-4 Lesson Player UI with Answer Input Modes',
      '4C-5 Lesson Activity Interaction Dry-run'
    ],
    deferredBacklog: [
      'Real write DATA_Responses',
      'Real write DATA_LessonProgress',
      'Real write DATA_StudySessions',
      'Real write reward transactions',
      'Store handwriting image/stroke data',
      'Asset loading from Google Drive / MST_MediaAssets',
      'Advanced AI/OCR handwriting review later'
    ],
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4cLockSaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PHASE_4C_LOCK_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4C lock preview failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Run final QA before lock.
 *
 * Important:
 * - Không gọi lại smoke/check cũ có thể ghi lùi status.
 * - Chỉ dùng assert + marker check + dry-run server test.
 */
function kidlearnV3_runPhase4CFinalQaV3() {
  var preview =
    kidlearnV3_previewPhase4CLockV3();

  var errors = [];
  var warnings = [];

  if (!preview.success) {
    errors.push('Preview 4C lock chưa pass.');
  }

  var dryRun =
    kidlearnV3_4cLockRunServerDryRunExercise_();

  if (!dryRun.success) {
    errors =
      errors.concat(dryRun.errors || []);
  }

  warnings =
    warnings.concat(dryRun.warnings || []);

  var result = {
    success: errors.length === 0,
    action: 'RUN_PHASE_4C_FINAL_QA_V3',
    phase: KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.PHASE,
    lockStep: KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.LOCK_STEP,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PHASE_4C_LOCK_STATUS.QA_PASSED
        : KIDLEARN_V3_PHASE_4C_LOCK_STATUS.FAILED,
    qaMode:
      'ASSERT_MARKER_AND_SERVER_DRY_RUN_ONLY_NO_LEGACY_SMOKE_REPLAY',
    nextPhase:
      KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    preview: {
      success: preview.success,
      errorCount: preview.errorCount,
      warningCount: preview.warningCount
    },
    dryRunExercise: dryRun,
    skippedLegacySmokeTests: [
      'kidlearnV3_smokeTestSubjectDashboardContext4C1V3',
      'kidlearnV3_smokeTestLessonPlayerContext4C3V3',
      'kidlearnV3_checkLessonInteractionDryRun4C5V3'
    ],
    skipReason:
      'Final lock uses current READY asserts and read-only marker checks to avoid downgrading previous statuses.',
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4cLockSaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PHASE_4C_LOCK_KEYS.LAST_QA_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4C final QA failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Public confirm wrapper.
 */
function kidlearnV3_lockPhase4CConfirmV3() {
  return kidlearnV3_lockPhase4CV3({
    confirm: 'LOCK_PHASE_4C_SUBJECT_DASHBOARD_LESSON_PLAYER',
    acceptedVisualScorePercent: 85,
    reviewerDecision: 'ACCEPT_AND_LOCK_PHASE_4C',
    note:
      'Phase 4C accepted. Subject Dashboard, Lesson Player UI, and Dry-run interactions are ready. Real writes will be handled in Phase 4D.'
  });
}


/**
 * Lock Phase 4C.
 */
function kidlearnV3_lockPhase4CV3(options) {
  options = options || {};

  var confirmText =
    String(options.confirm || '')
      .trim()
      .toUpperCase();

  if (
    confirmText !==
    'LOCK_PHASE_4C_SUBJECT_DASHBOARD_LESSON_PLAYER'
  ) {
    throw new Error(
      'Thiếu confirm. Cần confirm=LOCK_PHASE_4C_SUBJECT_DASHBOARD_LESSON_PLAYER'
    );
  }

  var qa =
    kidlearnV3_runPhase4CFinalQaV3();

  if (!qa.success) {
    throw new Error('Final QA 4C chưa pass.');
  }

  var score =
    Number(options.acceptedVisualScorePercent || 0);

  if (isNaN(score) || score < 85) {
    throw new Error(
      'Visual score cần >= 85 để lock Phase 4C. Current=' +
      score
    );
  }

  var result = {
    success: true,
    action: 'LOCK_PHASE_4C_V3',
    phase: KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.PHASE,
    lockStep: KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.LOCK_STEP,
    lockName: KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.LOCK_NAME,
    status:
      KIDLEARN_V3_PHASE_4C_LOCK_STATUS.PHASE_4C_CLOSED_LOCKED,
    acceptedVisualScorePercent: score,
    reviewerDecision:
      String(options.reviewerDecision || ''),
    note:
      String(options.note || ''),
    finalMode:
      'PHASE_4C_SUBJECT_DASHBOARD_LESSON_PLAYER_CLOSED_LOCKED',
    nextPhase:
      KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    lockedScope: [
      'Subject Dashboard Context',
      'Subject Dashboard UI',
      'Subject color map: Math blue, Vietnamese orange, English green, Science red',
      'Subject Dashboard Routing Patch',
      'Lesson Player Context',
      'Lesson Player UI',
      'Multiple choice input',
      'Button input',
      'Text input',
      'Handwriting canvas input',
      'Lesson interaction dry-run server calls',
      'No real learning data writes'
    ],
    nextRecommendedAction:
      'Start Phase 4D — Controlled Lesson Progress and Response Writes.',
    lockedAt:
      new Date().toISOString()
  };

  kidlearnV3_4cLockSaveStatus_(
    result,
    KIDLEARN_V3_PHASE_4C_LOCK_STATUS.PHASE_4C_CLOSED_LOCKED,
    KIDLEARN_V3_PHASE_4C_LOCK_KEYS.LAST_LOCK_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get Phase 4C status.
 */
function kidlearnV3_getPhase4CLockStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PHASE_4C_LOCK_STATUS_V3',
    phase: KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.PHASE,
    lockStep: KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.LOCK_STEP,
    status:
      properties.getProperty(
        KIDLEARN_V3_PHASE_4C_LOCK_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PHASE_4C_LOCK_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE_4C_LOCK_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastQaAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE_4C_LOCK_KEYS.LAST_QA_AT
      ) || '',
    lastLockAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE_4C_LOCK_KEYS.LAST_LOCK_AT
      ) || '',
    lastResult:
      kidlearnV3_4cLockReadJsonProperty_(
        KIDLEARN_V3_PHASE_4C_LOCK_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert Phase 4C closed locked.
 */
function kidlearnV3_assertPhase4CClosedLockedV3() {
  var status =
    kidlearnV3_getPhase4CLockStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PHASE_4C_LOCK_STATUS.PHASE_4C_CLOSED_LOCKED
  ) {
    errors.push(
      'Phase 4C chưa PHASE_4C_CLOSED_LOCKED. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PHASE_4C_CLOSED_LOCKED_V3',
    phase: KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.PHASE,
    status: status.status,
    nextPhase:
      KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.NEXT_STAGE,
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
 * Alias cho phase sau dùng.
 */
function kidlearnV3_assertPhase4CClosedV3() {
  return kidlearnV3_assertPhase4CClosedLockedV3();
}


/**
 * QA batch before final lock.
 */
function kidlearnV3_runQaBatch4C6V3() {
  var preview =
    kidlearnV3_previewPhase4CLockV3();

  var qa =
    kidlearnV3_runPhase4CFinalQaV3();

  var result = {
    success:
      preview.success === true &&
      qa.success === true,
    suiteName:
      'PHASE_4C_6_QA_BEFORE_LOCK',
    phase: '4C-6',
    nextAction:
      'Run kidlearnV3_lockPhase4CConfirmV3 to lock Phase 4C.',
    nextPhase:
      KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.NEXT_PHASE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    results: {
      preview: preview.success,
      finalQa: qa.success
    },
    warningCount:
      (preview.warningCount || 0) +
      (qa.warningCount || 0),
    warnings:
      []
        .concat(preview.warnings || [])
        .concat(qa.warnings || [])
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4C-6 QA batch failed.');
  }

  return result;
}


/**
 * Readiness checks.
 */
function kidlearnV3_4cLockBuildReadinessChecks_() {
  return [
    kidlearnV3_4cLockSafeCheck_(
      '4B Closed Locked',
      'kidlearnV3_assertPhase4BClosedLockedV3',
      true
    ),
    kidlearnV3_4cLockSafeCheck_(
      '4C-1 Subject Dashboard Context Ready',
      'kidlearnV3_assertSubjectDashboardContext4C1ReadyV3',
      true
    ),
    kidlearnV3_4cLockSafeCheck_(
      '4C-2 Subject Dashboard UI Ready',
      'kidlearnV3_assertSubjectDashboardUi4C2ReadyV3',
      true
    ),
    kidlearnV3_4cLockSafeCheck_(
      '4C-2P Subject Dashboard Patch Ready',
      'kidlearnV3_assertSubjectDashboardUiPatch4C2PReadyV3',
      true
    ),
    kidlearnV3_4cLockSafeCheck_(
      '4C-3 Lesson Player Context Ready',
      'kidlearnV3_assertLessonPlayerContext4C3ReadyV3',
      true
    ),
    kidlearnV3_4cLockSafeCheck_(
      '4C-4 Lesson Player UI Ready',
      'kidlearnV3_assertLessonPlayerUi4C4ReadyV3',
      true
    ),
    kidlearnV3_4cLockSafeCheck_(
      '4C-5 Lesson Interaction Dry-run Ready',
      'kidlearnV3_assertLessonInteractionDryRun4C5ReadyV3',
      true
    )
  ];
}


/**
 * Local UI marker inspection.
 * This does not change previous statuses.
 */
function kidlearnV3_4cLockInspectUiMarkers_() {
  var errors = [];
  var warnings = [];

  var shell = '';
  var styles = '';
  var subjectClient = '';
  var subjectPatch = '';
  var lessonPlayer = '';
  var dryRunClient = '';

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
    subjectClient =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_SubjectDashboard_4C2')
        .getContent();
  } catch (error3) {
    errors.push(
      'Không đọc được UI_Product_Client_SubjectDashboard_4C2: ' +
      String(error3.message || error3)
    );
  }

  try {
    subjectPatch =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_SubjectDashboard_Patch_4C2P')
        .getContent();
  } catch (error4) {
    errors.push(
      'Không đọc được UI_Product_Client_SubjectDashboard_Patch_4C2P: ' +
      String(error4.message || error4)
    );
  }

  try {
    lessonPlayer =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_LessonPlayer_4C4')
        .getContent();
  } catch (error5) {
    errors.push(
      'Không đọc được UI_Product_Client_LessonPlayer_4C4: ' +
      String(error5.message || error5)
    );
  }

  try {
    dryRunClient =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_LessonInteraction_DryRun_4C5')
        .getContent();
  } catch (error6) {
    errors.push(
      'Không đọc được UI_Product_Client_LessonInteraction_DryRun_4C5: ' +
      String(error6.message || error6)
    );
  }

  var shellMarkers = [
    'UI_Product_Client_SubjectDashboard_4C2',
    'UI_Product_Client_SubjectDashboard_Patch_4C2P',
    'UI_Product_Client_LessonPlayer_4C4',
    'UI_Product_Client_LessonInteraction_DryRun_4C5'
  ];

  var clientMarkers = [
    {
      source: subjectClient,
      label: 'Subject Dashboard 4C2',
      markers: [
        'KIDLEARN_SUBJECT_DASHBOARD_UI_4C2',
        'openSubjectDashboard4C2',
        'renderSubjectDashboard4C2',
        'supportedAnswerModes'
      ]
    },
    {
      source: subjectPatch,
      label: 'Subject Dashboard Patch 4C2P',
      markers: [
        'KIDLEARN_SUBJECT_DASHBOARD_PATCH_4C2P',
        'applySubjectThemeToAllCards4C2P',
        'routeSubjectClick4C2P',
        'openSubjectDetail4B'
      ]
    },
    {
      source: lessonPlayer,
      label: 'Lesson Player 4C4',
      markers: [
        'KIDLEARN_LESSON_PLAYER_UI_4C4',
        'openLessonPlayer4C4',
        'renderLessonPlayer4C4',
        'renderMultipleChoice4C4',
        'renderButtonInput4C4',
        'renderTextInput4C4',
        'renderHandwritingInput4C4',
        'lessonHandwritingCanvas4C4'
      ]
    },
    {
      source: dryRunClient,
      label: 'Dry-run Interaction 4C5',
      markers: [
        'KIDLEARN_LESSON_INTERACTION_DRY_RUN_4C5',
        'collectAnswerPayload4C5',
        'dryRunSubmitAnswer4C5',
        'dryRunCompleteLesson4C5',
        'showDryRunFeedback4C5'
      ]
    }
  ];

  var styleMarkers = [
    '.kl-subject-dashboard-4c2',
    '.kl-subject-card-4b.subject-orange',
    '.kl-subject-card-4b.subject-red',
    '.kl-lesson-player-4c4',
    '.kl-answer-option-4c4',
    '.kl-button-pad-4c4',
    '.kl-text-answer-4c4',
    '.kl-handwriting-canvas-4c4',
    '.kl-dryrun-badge-4c5',
    '.kl-dryrun-feedback-4c5'
  ];

  for (var i = 0; i < shellMarkers.length; i++) {
    if (shell.indexOf(shellMarkers[i]) === -1) {
      errors.push('Shell thiếu marker: ' + shellMarkers[i]);
    }
  }

  for (var j = 0; j < clientMarkers.length; j++) {
    var group = clientMarkers[j];

    for (var k = 0; k < group.markers.length; k++) {
      if (group.source.indexOf(group.markers[k]) === -1) {
        errors.push(
          group.label + ' thiếu marker: ' + group.markers[k]
        );
      }
    }
  }

  for (var s = 0; s < styleMarkers.length; s++) {
    if (styles.indexOf(styleMarkers[s]) === -1) {
      errors.push('CSS thiếu marker: ' + styleMarkers[s]);
    }
  }

  return {
    success: errors.length === 0,
    action: 'INSPECT_PHASE_4C_UI_MARKERS_V3',
    phase: '4C-6',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Server dry-run exercise.
 * Does not write learning data.
 */
function kidlearnV3_4cLockRunServerDryRunExercise_() {
  var errors = [];
  var warnings = [];
  var results = [];

  var start =
    kidlearnV3_4cLockSafeCallWithPayload_(
      'kidlearnV3_dryRunStartLesson4C5V3',
      {
        childId: 'CHD_V2_CHILD_DEFAULT',
        lessonId: 'MATH_L1',
        subjectCode: 'MATH'
      }
    );

  results.push({
    label: 'Dry-run Start Lesson',
    success: start.success
  });

  if (!start.success) {
    errors.push('Dry-run start lesson failed: ' + start.message);
  }

  var submitButton =
    kidlearnV3_4cLockSafeCallWithPayload_(
      'kidlearnV3_dryRunSubmitAnswer4C5V3',
      {
        childId: 'CHD_V2_CHILD_DEFAULT',
        lessonId: 'MATH_L1',
        activityId: 'MATH_L1_ACT_1',
        subjectCode: 'MATH',
        answerMode: 'BUTTON_INPUT',
        answerText: '13',
        expectedAnswer: '13'
      }
    );

  results.push({
    label: 'Dry-run Submit Button Input',
    success: submitButton.success
  });

  if (!submitButton.success) {
    errors.push('Dry-run submit button input failed: ' + submitButton.message);
  }

  var submitText =
    kidlearnV3_4cLockSafeCallWithPayload_(
      'kidlearnV3_dryRunSubmitAnswer4C5V3',
      {
        childId: 'CHD_V2_CHILD_DEFAULT',
        lessonId: 'TV_L1',
        activityId: 'TV_L1_ACT_1',
        subjectCode: 'VIETNAMESE',
        answerMode: 'TEXT_INPUT',
        answerText: 'Mẹ',
        expectedAnswer: 'Mẹ'
      }
    );

  results.push({
    label: 'Dry-run Submit Text Input',
    success: submitText.success
  });

  if (!submitText.success) {
    errors.push('Dry-run submit text input failed: ' + submitText.message);
  }

  var submitHandwrite =
    kidlearnV3_4cLockSafeCallWithPayload_(
      'kidlearnV3_dryRunSubmitAnswer4C5V3',
      {
        childId: 'CHD_V2_CHILD_DEFAULT',
        lessonId: 'MATH_L1',
        activityId: 'MATH_L1_ACT_2',
        subjectCode: 'MATH',
        answerMode: 'HANDWRITE_INPUT',
        answerText: '[HANDWRITING_CANVAS_DRY_RUN]',
        canvasHasInk: true,
        canvasDataUrlLength: 3000
      }
    );

  results.push({
    label: 'Dry-run Submit Handwriting',
    success: submitHandwrite.success
  });

  if (!submitHandwrite.success) {
    errors.push('Dry-run submit handwriting failed: ' + submitHandwrite.message);
  }

  var complete =
    kidlearnV3_4cLockSafeCallWithPayload_(
      'kidlearnV3_dryRunCompleteLesson4C5V3',
      {
        childId: 'CHD_V2_CHILD_DEFAULT',
        lessonId: 'MATH_L1',
        subjectCode: 'MATH',
        completedStepCount: 4
      }
    );

  results.push({
    label: 'Dry-run Complete Lesson',
    success: complete.success
  });

  if (!complete.success) {
    errors.push('Dry-run complete lesson failed: ' + complete.message);
  }

  return {
    success: errors.length === 0,
    action: 'RUN_PHASE_4C_SERVER_DRY_RUN_EXERCISE_V3',
    phase: '4C-6',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    resultCount: results.length,
    results: results,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Helpers.
 */
function kidlearnV3_4cLockSafeCheck_(label, functionName, required) {
  try {
    var exists =
      eval(
        'typeof ' +
        functionName +
        ' === "function"'
      );

    if (!exists) {
      return {
        label: label,
        functionName: functionName,
        required: required === true,
        success: false,
        message:
          'Thiếu function ' + functionName
      };
    }

    var fn =
      eval(functionName);

    var output =
      fn();

    return {
      label: label,
      functionName: functionName,
      required: required === true,
      success:
        output && output.success === true,
      message:
        output && output.success === true
          ? 'OK'
          : JSON.stringify(output),
      outputSummary:
        kidlearnV3_4cLockSummarizeOutput_(output)
    };

  } catch (error) {
    return {
      label: label,
      functionName: functionName,
      required: required === true,
      success: false,
      message:
        String(error.message || error)
    };
  }
}


function kidlearnV3_4cLockSafeCallWithPayload_(functionName, payload) {
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


function kidlearnV3_4cLockSummarizeOutput_(output) {
  if (!output) return null;

  return {
    success: output.success === true,
    action: output.action || '',
    phase: output.phase || '',
    status: output.status || '',
    nextBundle: output.nextBundle || '',
    nextPhase: output.nextPhase || '',
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0
  };
}


function kidlearnV3_4cLockSaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PHASE_4C_LOCK_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PHASE_4C_LOCK_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase: result.phase,
      lockStep: result.lockStep || '4C-6',
      status: status,
      lockName:
        KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.LOCK_NAME,
      nextPhase:
        KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.NEXT_PHASE,
      nextStage:
        KIDLEARN_V3_PHASE_4C_LOCK_CONFIG.NEXT_STAGE,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      errors: result.errors || [],
      warnings: result.warnings || [],
      at:
        new Date().toISOString()
    })
  );
}


function kidlearnV3_4cLockReadJsonProperty_(key) {
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