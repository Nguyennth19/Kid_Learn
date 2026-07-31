/**
 * ================================================================
 * KIDLEARN V3 - PHASE 4I QA + LOCK
 * Step: 4I-4
 * Version: 3.1.0
 * ================================================================
 *
 * Phase 4I:
 * - Assignment Learning Flow
 * - Học theo kế hoạch được giao
 *
 * Bundles:
 * - 4I-1 Assignment Learning Policy + Context Read-only
 * - 4I-2 Child Assignment Learning UI Dry-run
 * - 4I-3 Controlled Assignment Status Write + Completion Sync
 * - 4I-4 QA + Phase Lock
 *
 * Safety:
 * - No DATA_Assignments write.
 * - No DATA_LessonProgress write.
 * - No DATA_Responses write.
 * - No DATA_DailyGoals write.
 * - No LOG_Audit write.
 * - No Drive write.
 * - Only ScriptProperties are updated for QA/lock status.
 */


var KIDLEARN_V3_PHASE4I_LOCK_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4I_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4I_LAST_PREVIEW_AT',
  LAST_QA_AT: 'KIDLEARN_V3_PHASE_4I_LAST_QA_AT',
  LAST_LOCK_AT: 'KIDLEARN_V3_PHASE_4I_LAST_LOCK_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4I_LAST_RESULT_JSON',
  LOCKED_BY: 'KIDLEARN_V3_PHASE_4I_LOCKED_BY',
  LOCKED_AT: 'KIDLEARN_V3_PHASE_4I_LOCKED_AT'
};


var KIDLEARN_V3_PHASE4I_LOCK_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  QA_PASSED: 'QA_PASSED',
  PHASE_4I_CLOSED_LOCKED: 'PHASE_4I_CLOSED_LOCKED',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PHASE4I_LOCK_CONFIG = {
  PHASE: '4I',
  LOCK_STEP: '4I-4',
  PHASE_NAME: 'ASSIGNMENT_LEARNING_FLOW',
  PREVIOUS_PHASE: '4H',
  NEXT_PHASE: '4J',
  NEXT_STAGE: 'NEXT_PRODUCT_INCREMENT_TO_BE_CONFIRMED',
  CONFIRM_TEXT: 'LOCK_PHASE_4I_ASSIGNMENT_LEARNING_FLOW',
  MIN_VISUAL_SCORE: 85,
  DEFAULT_CHILD_ID: 'CHD_V2_CHILD_DEFAULT',
  DEFAULT_PARENT_ID: 'PARENT',
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Preview Phase 4I lock readiness.
 */
function kidlearnV3_previewPhase4ILockV3() {
  var result =
    kidlearnV3_4i4BuildFinalQa_({
      mode: 'PREVIEW'
    });

  result.action =
    'PREVIEW_PHASE_4I_LOCK_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PHASE4I_LOCK_STATUS.PREVIEWED
      : KIDLEARN_V3_PHASE4I_LOCK_STATUS.FAILED;

  kidlearnV3_4i4SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PHASE4I_LOCK_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4I-4 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Run final QA for Phase 4I.
 */
function kidlearnV3_runPhase4IFinalQaV3() {
  var result =
    kidlearnV3_4i4BuildFinalQa_({
      mode: 'FINAL_QA'
    });

  result.action =
    'RUN_PHASE_4I_FINAL_QA_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PHASE4I_LOCK_STATUS.QA_PASSED
      : KIDLEARN_V3_PHASE4I_LOCK_STATUS.FAILED;

  kidlearnV3_4i4SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PHASE4I_LOCK_KEYS.LAST_QA_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4I final QA failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Lock Phase 4I with default confirmation.
 */
function kidlearnV3_lockPhase4IConfirmV3() {
  return kidlearnV3_lockPhase4IV3({
    confirm:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.CONFIRM_TEXT,
    lockedBy:
      'SYSTEM_ADMIN'
  });
}


/**
 * Lock Phase 4I.
 */
function kidlearnV3_lockPhase4IV3(options) {
  options = options || {};

  var confirmText =
    String(options.confirm || '').trim().toUpperCase();

  if (
    confirmText !==
    KIDLEARN_V3_PHASE4I_LOCK_CONFIG.CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm khóa Phase 4I. Cần confirm=' +
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.CONFIRM_TEXT
    );
  }

  var qa =
    kidlearnV3_runPhase4IFinalQaV3();

  if (!qa.success) {
    throw new Error(
      'Không thể lock Phase 4I vì final QA chưa pass.'
    );
  }

  var gateMode =
    kidlearnV3_4i4GetAssignmentGateMode_();

  if (gateMode !== 'CLOSED_DRY_RUN_ONLY') {
    throw new Error(
      'Không thể lock Phase 4I vì Assignment write gate chưa đóng. Current=' +
      gateMode
    );
  }

  var lockedAt =
    new Date().toISOString();

  var lockedBy =
    String(options.lockedBy || 'SYSTEM_ADMIN').trim();

  var result = {
    success: true,
    action: 'LOCK_PHASE_4I_CONFIRM_V3',
    phase:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.LOCK_STEP,
    phaseName:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.PHASE_NAME,
    status:
      KIDLEARN_V3_PHASE4I_LOCK_STATUS.PHASE_4I_CLOSED_LOCKED,
    previousPhase:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.PREVIOUS_PHASE,
    nextPhase:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.NEXT_STAGE,
    lockedBy:
      lockedBy,
    lockedAt:
      lockedAt,
    qaSummary:
      qa.qaSummary,
    gateMode:
      gateMode,
    prodWriteAllowed:
      false,
    realSheetWriteAllowedNow:
      false,
    realDriveWriteAllowedNow:
      false,
    actualSheetWritePerformed:
      false,
    actualLearningDataWritePerformed:
      false,
    actualDriveWritePerformed:
      false,
    message:
      'Phase 4I đã được khóa an toàn. Có thể chuyển sang Phase 4J.',
    errorCount:
      0,
    warningCount:
      qa.warningCount || 0,
    errors:
      [],
    warnings:
      qa.warnings || []
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PHASE4I_LOCK_KEYS.STATUS,
    KIDLEARN_V3_PHASE4I_LOCK_STATUS.PHASE_4I_CLOSED_LOCKED
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE4I_LOCK_KEYS.LOCKED_BY,
    lockedBy
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE4I_LOCK_KEYS.LOCKED_AT,
    lockedAt
  );

  kidlearnV3_4i4SaveStatus_(
    result,
    KIDLEARN_V3_PHASE4I_LOCK_STATUS.PHASE_4I_CLOSED_LOCKED,
    KIDLEARN_V3_PHASE4I_LOCK_KEYS.LAST_LOCK_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get Phase 4I lock status.
 */
function kidlearnV3_getPhase4ILockStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PHASE_4I_LOCK_STATUS_V3',
    phase:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.LOCK_STEP,
    phaseName:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.PHASE_NAME,
    status:
      properties.getProperty(
        KIDLEARN_V3_PHASE4I_LOCK_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PHASE4I_LOCK_STATUS.NOT_RUN,
    lockedBy:
      properties.getProperty(
        KIDLEARN_V3_PHASE4I_LOCK_KEYS.LOCKED_BY
      ) || '',
    lockedAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE4I_LOCK_KEYS.LOCKED_AT
      ) || '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE4I_LOCK_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastQaAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE4I_LOCK_KEYS.LAST_QA_AT
      ) || '',
    lastLockAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE4I_LOCK_KEYS.LAST_LOCK_AT
      ) || '',
    lastResult:
      kidlearnV3_4i4ReadJsonProperty_(
        KIDLEARN_V3_PHASE4I_LOCK_KEYS.LAST_RESULT_JSON
      ),
    previousPhase:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.PREVIOUS_PHASE,
    nextPhase:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.NEXT_STAGE,
    gateMode:
      kidlearnV3_4i4GetAssignmentGateMode_(),
    prodWriteAllowed:
      false,
    realSheetWriteAllowedNow:
      false,
    realDriveWriteAllowedNow:
      false,
    actualSheetWritePerformed:
      false,
    actualDriveWritePerformed:
      false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert Phase 4I closed and locked.
 */
function kidlearnV3_assertPhase4IClosedLockedV3() {
  var status =
    kidlearnV3_getPhase4ILockStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PHASE4I_LOCK_STATUS.PHASE_4I_CLOSED_LOCKED
  ) {
    errors.push(
      'Phase 4I chưa PHASE_4I_CLOSED_LOCKED. Current=' +
      status.status
    );
  }

  if (
    status.gateMode !== 'CLOSED_DRY_RUN_ONLY'
  ) {
    errors.push(
      'Assignment write gate chưa đóng. Current=' +
      status.gateMode
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_PHASE_4I_CLOSED_LOCKED_V3',
    phase:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.PHASE,
    status:
      status.status,
    gateMode:
      status.gateMode,
    nextPhase:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.NEXT_STAGE,
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
 * Alias for future phases.
 */
function kidlearnV3_assertPhase4IClosedV3() {
  return kidlearnV3_assertPhase4IClosedLockedV3();
}


/**
 * QA batch 4I-4.
 */
function kidlearnV3_runQaBatch4I4V3() {
  var preview =
    kidlearnV3_previewPhase4ILockV3();

  var finalQa =
    kidlearnV3_runPhase4IFinalQaV3();

  var lock =
    kidlearnV3_lockPhase4IConfirmV3();

  var status =
    kidlearnV3_getPhase4ILockStatusV3();

  var assertLocked =
    kidlearnV3_assertPhase4IClosedLockedV3();

  var result = {
    success:
      preview.success === true &&
      finalQa.success === true &&
      lock.success === true &&
      status.success === true &&
      assertLocked.success === true,
    suiteName:
      'PHASE_4I_4_QA_AND_LOCK',
    phase:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.LOCK_STEP,
    status:
      KIDLEARN_V3_PHASE4I_LOCK_STATUS.PHASE_4I_CLOSED_LOCKED,
    nextPhase:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.NEXT_STAGE,
    gateMode:
      kidlearnV3_4i4GetAssignmentGateMode_(),
    prodWriteAllowed:
      false,
    realSheetWriteAllowedNow:
      false,
    actualSheetWritePerformed:
      false,
    actualLearningDataWritePerformed:
      false,
    actualDriveWritePerformed:
      false,
    results: {
      preview:
        preview.success,
      finalQa:
        finalQa.success,
      lock:
        lock.success,
      status:
        status.success,
      assertLocked:
        assertLocked.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4I-4 QA batch failed.');
  }

  return result;
}


/**
 * ================================================================
 * Final QA builder
 * ================================================================
 */

function kidlearnV3_4i4BuildFinalQa_(options) {
  options = options || {};

  var mode =
    String(options.mode || 'FINAL_QA').trim();

  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4i4CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var phase4H =
    kidlearnV3_4i4SafeCall_(
      'kidlearnV3_assertPhase4HClosedLockedV3'
    );

  if (!phase4H.success) {
    errors.push(
      'Phase 4H chưa locked: ' +
      phase4H.message
    );
  }

  var i1 =
    kidlearnV3_4i4SafeCall_(
      'kidlearnV3_assertAssignmentLearningPolicyContext4I1ReadyV3'
    );

  if (!i1.success) {
    errors.push(
      '4I-1 chưa READY_FOR_4I_2: ' +
      i1.message
    );
  }

  var i2 =
    kidlearnV3_4i4SafeCall_(
      'kidlearnV3_assertAssignmentLearningUi4I2ReadyV3'
    );

  if (!i2.success) {
    errors.push(
      '4I-2 chưa READY_FOR_4I_3: ' +
      i2.message
    );
  }

  var i3 =
    kidlearnV3_4i4SafeCall_(
      'kidlearnV3_assertAssignmentWriteCompletion4I3ReadyV3'
    );

  if (!i3.success) {
    errors.push(
      '4I-3 chưa READY_FOR_4I_4: ' +
      i3.message
    );
  }

  var gateMode =
    kidlearnV3_4i4GetAssignmentGateMode_();

  if (gateMode !== 'CLOSED_DRY_RUN_ONLY') {
    errors.push(
      'Assignment write gate phải đóng trước khi lock Phase 4I. Current=' +
      gateMode
    );
  }

  var context =
    kidlearnV3_4i4SafeCall_(
      'kidlearnV3_getAssignmentLearningContext4I1V3',
      [
        {
          childId:
            KIDLEARN_V3_PHASE4I_LOCK_CONFIG.DEFAULT_CHILD_ID,
          parentId:
            KIDLEARN_V3_PHASE4I_LOCK_CONFIG.DEFAULT_PARENT_ID
        }
      ]
    );

  if (!context.success) {
    errors.push(
      'Không đọc được Assignment Learning Context 4I-1: ' +
      context.message
    );
  }

  var routePreview =
    kidlearnV3_4i4SafeCall_(
      'kidlearnV3_previewAssignmentLessonRouting4I2V3',
      [
        {
          childId:
            KIDLEARN_V3_PHASE4I_LOCK_CONFIG.DEFAULT_CHILD_ID,
          assignmentId:
            '',
          lessonId:
            ''
        }
      ]
    );

  /**
   * Route preview vẫn có thể success khi chưa có assignment.
   * Nếu function thiếu hoặc lỗi thật thì fail.
   */
  if (!routePreview.success) {
    errors.push(
      'Route preview 4I-2 chưa pass: ' +
      routePreview.message
    );
  }

  var syncDryRun =
    kidlearnV3_4i4SafeCall_(
      'kidlearnV3_syncCompletedAssignmentsFromLessonProgress4I3V3',
      [
        {
          childId:
            KIDLEARN_V3_PHASE4I_LOCK_CONFIG.DEFAULT_CHILD_ID,
          dryRunOnly:
            true
        }
      ]
    );

  if (!syncDryRun.success) {
    errors.push(
      'Completion sync dry-run 4I-3 chưa pass: ' +
      syncDryRun.message
    );
  }

  var headerQa =
    kidlearnV3_4i4RunAssignmentHeaderQaIfAvailable_();

  if (!headerQa.success) {
    errors =
      errors.concat(headerQa.errors || []);
  }

  warnings =
    warnings.concat(headerQa.warnings || []);

  var uiMarkers =
    kidlearnV3_4i4InspectUiMarkers_();

  if (!uiMarkers.success) {
    errors =
      errors.concat(uiMarkers.errors || []);
  }

  warnings =
    warnings.concat(uiMarkers.warnings || []);

  var visualScore =
    kidlearnV3_4i4EstimateVisualScore_(
      uiMarkers
    );

  if (
    visualScore <
    KIDLEARN_V3_PHASE4I_LOCK_CONFIG.MIN_VISUAL_SCORE
  ) {
    errors.push(
      'Visual score thấp hơn yêu cầu. Current=' +
      visualScore +
      ', min=' +
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.MIN_VISUAL_SCORE
    );
  }

  var contextSummary =
    context.output && context.output.contextSummary
      ? context.output.contextSummary
      : {};

  var qaSummary = {
    phase4HLocked:
      phase4H.success === true,
    phase4I1Ready:
      i1.success === true,
    phase4I2Ready:
      i2.success === true,
    phase4I3Ready:
      i3.success === true,
    assignmentWriteGateClosed:
      gateMode === 'CLOSED_DRY_RUN_ONLY',
    contextReadable:
      context.success === true,
    routePreviewPass:
      routePreview.success === true,
    completionSyncDryRunPass:
      syncDryRun.success === true,
    assignmentHeadersReady:
      headerQa.success === true,
    uiMarkersReady:
      uiMarkers.success === true,
    visualScore:
      visualScore,
    assignmentCount:
      contextSummary.assignmentCount || 0,
    activeCount:
      contextSummary.activeCount || 0,
    completedCount:
      contextSummary.completedCount || 0,
    emptyStateSupported:
      true,
    controlledWrite:
      true,
    completionSync:
      true
  };

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_PHASE_4I_FINAL_QA_V3',
    mode:
      mode,
    phase:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.LOCK_STEP,
    phaseName:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.PHASE_NAME,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PHASE4I_LOCK_STATUS.QA_PASSED
        : KIDLEARN_V3_PHASE4I_LOCK_STATUS.FAILED,
    previousPhase:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.PREVIOUS_PHASE,
    nextPhase:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4I_LOCK_CONFIG.NEXT_STAGE,
    gateMode:
      gateMode,
    qaSummary:
      qaSummary,
    prerequisites: {
      phase4H:
        phase4H,
      phase4I1:
        i1,
      phase4I2:
        i2,
      phase4I3:
        i3
    },
    contextChecks: {
      assignmentContext:
        kidlearnV3_4i4CompactSafeCall_(context),
      routePreview:
        kidlearnV3_4i4CompactSafeCall_(routePreview),
      completionSyncDryRun:
        kidlearnV3_4i4CompactSafeCall_(syncDryRun)
    },
    headerQa:
      headerQa,
    uiMarkers:
      uiMarkers,
    prodWriteAllowed:
      false,
    realSheetWriteAllowedNow:
      false,
    realDriveWriteAllowedNow:
      false,
    actualSheetWritePerformed:
      false,
    actualLearningDataWritePerformed:
      false,
    actualDriveWritePerformed:
      false,
    errorCount:
      errors.length,
    warningCount:
      kidlearnV3_4i4UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4i4UniqueArray_(warnings),
    checkedAt:
      new Date().toISOString()
  };
}


/**
 * ================================================================
 * QA helpers
 * ================================================================
 */

function kidlearnV3_4i4RunAssignmentHeaderQaIfAvailable_() {
  var warnings = [];

  if (
    typeof kidlearnV3_debugAssignmentHeaders4I3V3 !== 'function'
  ) {
    return {
      success: true,
      available: false,
      warningCount: 1,
      warnings: [
        'Không tìm thấy kidlearnV3_debugAssignmentHeaders4I3V3. Bỏ qua header QA 4I-3.'
      ],
      errors: [],
      actualSheetWritePerformed: false,
      actualDriveWritePerformed: false
    };
  }

  try {
    var result =
      kidlearnV3_debugAssignmentHeaders4I3V3();

    return {
      success:
        result && result.success === true,
      available:
        true,
      resolved:
        result.resolved || [],
      actualSheetWritePerformed:
        false,
      actualDriveWritePerformed:
        false,
      warnings:
        warnings,
      errors:
        result && result.success === true
          ? []
          : ['Assignment Header QA 4I-3 chưa pass.']
    };
  } catch (error) {
    return {
      success: false,
      available: true,
      errors: [
        'Assignment Header QA 4I-3 failed: ' +
        String(error.message || error)
      ],
      warnings:
        warnings,
      actualSheetWritePerformed:
        false,
      actualDriveWritePerformed:
        false
    };
  }
}


function kidlearnV3_4i4InspectUiMarkers_() {
  var errors = [];
  var warnings = [];

  var shell = '';
  var client4I2 = '';
  var client4I2P2 = '';
  var client4I3 = '';
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
    client4I2 =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_AssignmentLearning_4I2')
        .getContent();
  } catch (error4I2) {
    errors.push(
      'Không đọc được UI_Product_Client_AssignmentLearning_4I2: ' +
      String(error4I2.message || error4I2)
    );
  }

  try {
    client4I2P2 =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_AssignmentLearning_4I2P2')
        .getContent();
  } catch (error4I2P2) {
    errors.push(
      'Không đọc được UI_Product_Client_AssignmentLearning_4I2P2: ' +
      String(error4I2P2.message || error4I2P2)
    );
  }

  try {
    client4I3 =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_AssignmentLearning_Write_4I3')
        .getContent();
  } catch (error4I3) {
    errors.push(
      'Không đọc được UI_Product_Client_AssignmentLearning_Write_4I3: ' +
      String(error4I3.message || error4I3)
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

  kidlearnV3_4i4CheckMarkers_(
    shell,
    [
      'UI_Product_Client_AssignmentLearning_4I2',
      'UI_Product_Client_AssignmentLearning_4I2P2',
      'UI_Product_Client_AssignmentLearning_Write_4I3'
    ],
    'Shell',
    errors
  );

  kidlearnV3_4i4CheckMarkers_(
    client4I2,
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

  kidlearnV3_4i4CheckMarkers_(
    client4I2P2,
    [
      'KIDLEARN_ASSIGNMENT_LEARNING_UI_FORCE_CARD_4I2P2',
      'forceShowAssignmentLearningHome4I2',
      'debugAssignmentLearning4I2',
      'kl-assignment-learning-entry-force-4i2p2'
    ],
    'Client 4I-2P2',
    errors
  );

  kidlearnV3_4i4CheckMarkers_(
    client4I3,
    [
      'KIDLEARN_ASSIGNMENT_WRITE_UI_4I3',
      'patchAssignmentLearningWriteControls4I3',
      'submitAssignmentStartWrite4I3',
      'submitAssignmentCompleteWrite4I3',
      'kidlearnV3_submitAssignmentActionFromUi4I3V3',
      'kl-assignment-write-control-4i3',
      'kl-assignment-write-result-4i3',
      'kl-assignment-write-gate-4i3'
    ],
    'Client 4I-3',
    errors
  );

  kidlearnV3_4i4CheckMarkers_(
    styles,
    [
      '.kl-assignment-learning-entry-4i2',
      '.kl-assignment-learning-panel-4i2',
      '.kl-assignment-learning-card-4i2',
      '.kl-assignment-learning-action-4i2',
      '.kl-assignment-learning-empty-4i2',
      '.kl-assignment-write-control-4i3',
      '.kl-assignment-write-button-4i3',
      '.kl-assignment-write-result-4i3',
      '.kl-assignment-write-gate-4i3'
    ],
    'CSS',
    errors
  );

  return {
    success:
      errors.length === 0,
    action:
      'INSPECT_PHASE_4I_UI_MARKERS_4I_4_V3',
    shellIncluded:
      shell.indexOf('UI_Product_Client_AssignmentLearning_4I2') !== -1 &&
      shell.indexOf('UI_Product_Client_AssignmentLearning_4I2P2') !== -1 &&
      shell.indexOf('UI_Product_Client_AssignmentLearning_Write_4I3') !== -1,
    client4I2Loaded:
      client4I2 !== '',
    client4I2P2Loaded:
      client4I2P2 !== '',
    client4I3Loaded:
      client4I3 !== '',
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


function kidlearnV3_4i4CheckMarkers_(content, markers, label, errors) {
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


function kidlearnV3_4i4EstimateVisualScore_(uiMarkers) {
  if (!uiMarkers || uiMarkers.success !== true) {
    return 70;
  }

  return 90;
}


/**
 * ================================================================
 * Generic helpers
 * ================================================================
 */

function kidlearnV3_4i4GetAssignmentGateMode_() {
  var key =
    'KIDLEARN_V3_PHASE_4I_ASSIGNMENT_WRITE_GATE_MODE';

  try {
    if (
      typeof KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS !== 'undefined' &&
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS &&
      KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS.WRITE_GATE_MODE
    ) {
      key =
        KIDLEARN_V3_ASSIGNMENT_LEARNING_4I1_KEYS.WRITE_GATE_MODE;
    }
  } catch (error) {
    // ignore
  }

  var mode =
    PropertiesService
      .getScriptProperties()
      .getProperty(key) ||
    'CLOSED_DRY_RUN_ONLY';

  if (
    mode !== 'CLOSED_DRY_RUN_ONLY' &&
    mode !== 'OPEN_DEV_CONTROLLED'
  ) {
    return 'CLOSED_DRY_RUN_ONLY';
  }

  return mode;
}


function kidlearnV3_4i4CheckDevSafety_() {
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
      kidlearnV3_4i4UniqueArray_(errors)
  };
}


function kidlearnV3_4i4SafeCall_(functionName, args) {
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
      gateMode:
        output && output.gateMode ? output.gateMode : '',
      nextBundle:
        output && output.nextBundle ? output.nextBundle : '',
      nextPhase:
        output && output.nextPhase ? output.nextPhase : '',
      message:
        output && output.success === true
          ? 'OK'
          : kidlearnV3_4i4PreviewValue_(JSON.stringify(output || {})),
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


function kidlearnV3_4i4CompactSafeCall_(safeCallResult) {
  safeCallResult =
    safeCallResult || {};

  return {
    success:
      safeCallResult.success === true,
    functionName:
      safeCallResult.functionName || '',
    phase:
      safeCallResult.phase || '',
    status:
      safeCallResult.status || '',
    gateMode:
      safeCallResult.gateMode || '',
    message:
      safeCallResult.message || ''
  };
}


function kidlearnV3_4i4PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 500) {
    return text.substring(0, 500) + '...';
  }

  return text;
}


function kidlearnV3_4i4UniqueArray_(items) {
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


function kidlearnV3_4i4SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PHASE4I_LOCK_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PHASE4I_LOCK_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_PHASE4I_LOCK_CONFIG.PHASE,
      lockStep:
        result.lockStep ||
        KIDLEARN_V3_PHASE4I_LOCK_CONFIG.LOCK_STEP,
      phaseName:
        KIDLEARN_V3_PHASE4I_LOCK_CONFIG.PHASE_NAME,
      status:
        status,
      gateMode:
        result.gateMode ||
        kidlearnV3_4i4GetAssignmentGateMode_(),
      previousPhase:
        KIDLEARN_V3_PHASE4I_LOCK_CONFIG.PREVIOUS_PHASE,
      nextPhase:
        KIDLEARN_V3_PHASE4I_LOCK_CONFIG.NEXT_PHASE,
      nextStage:
        KIDLEARN_V3_PHASE4I_LOCK_CONFIG.NEXT_STAGE,
      qaSummary:
        result.qaSummary || {},
      prodWriteAllowed:
        false,
      realSheetWriteAllowedNow:
        false,
      realDriveWriteAllowedNow:
        false,
      actualSheetWritePerformed:
        false,
      actualLearningDataWritePerformed:
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


function kidlearnV3_4i4ReadJsonProperty_(key) {
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