/**
 * ================================================================
 * KIDLEARN V3 - PHASE 4H QA + LOCK
 * Step: 4H-4
 * Version: 3.1.0
 * ================================================================
 *
 * Phase 4H:
 * - Parent Controls + Learning Plan
 *
 * Bundles:
 * - 4H-1 Learning Plan Policy + Context Read-only
 * - 4H-2 Parent Learning Plan UI Dry-run
 * - 4H-3 Controlled Write + Child Home Visibility
 * - 4H-4 QA + Phase Lock
 *
 * Safety:
 * - No learning data writes.
 * - No Drive writes.
 * - Only ScriptProperties are updated for QA/lock status.
 */


var KIDLEARN_V3_PHASE4H_LOCK_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4H_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4H_LAST_PREVIEW_AT',
  LAST_QA_AT: 'KIDLEARN_V3_PHASE_4H_LAST_QA_AT',
  LAST_LOCK_AT: 'KIDLEARN_V3_PHASE_4H_LAST_LOCK_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4H_LAST_RESULT_JSON',
  LOCKED_BY: 'KIDLEARN_V3_PHASE_4H_LOCKED_BY',
  LOCKED_AT: 'KIDLEARN_V3_PHASE_4H_LOCKED_AT'
};


var KIDLEARN_V3_PHASE4H_LOCK_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  QA_PASSED: 'QA_PASSED',
  PHASE_4H_CLOSED_LOCKED: 'PHASE_4H_CLOSED_LOCKED',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PHASE4H_LOCK_CONFIG = {
  PHASE: '4H',
  LOCK_STEP: '4H-4',
  PHASE_NAME: 'PARENT_CONTROLS_AND_LEARNING_PLAN',
  PREVIOUS_PHASE: '4G',
  NEXT_PHASE: '4I',
  NEXT_STAGE: 'NEXT_PRODUCT_INCREMENT_TO_BE_CONFIRMED',
  CONFIRM_TEXT: 'LOCK_PHASE_4H_PARENT_CONTROLS_LEARNING_PLAN',
  MIN_VISUAL_SCORE: 85,
  DEFAULT_PARENT_ID: 'PARENT',
  DEFAULT_CHILD_ID: 'CHD_V2_CHILD_DEFAULT',
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Preview Phase 4H lock readiness.
 */
function kidlearnV3_previewPhase4HLockV3() {
  var result =
    kidlearnV3_4h4BuildFinalQa_({
      mode: 'PREVIEW'
    });

  result.action =
    'PREVIEW_PHASE_4H_LOCK_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PHASE4H_LOCK_STATUS.PREVIEWED
      : KIDLEARN_V3_PHASE4H_LOCK_STATUS.FAILED;

  kidlearnV3_4h4SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PHASE4H_LOCK_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4H-4 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Run final QA for Phase 4H.
 */
function kidlearnV3_runPhase4HFinalQaV3() {
  var result =
    kidlearnV3_4h4BuildFinalQa_({
      mode: 'FINAL_QA'
    });

  result.action =
    'RUN_PHASE_4H_FINAL_QA_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PHASE4H_LOCK_STATUS.QA_PASSED
      : KIDLEARN_V3_PHASE4H_LOCK_STATUS.FAILED;

  kidlearnV3_4h4SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PHASE4H_LOCK_KEYS.LAST_QA_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4H final QA failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Lock Phase 4H with default confirmation.
 */
function kidlearnV3_lockPhase4HConfirmV3() {
  return kidlearnV3_lockPhase4HV3({
    confirm:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.CONFIRM_TEXT,
    lockedBy:
      'SYSTEM_ADMIN'
  });
}


/**
 * Lock Phase 4H.
 */
function kidlearnV3_lockPhase4HV3(options) {
  options = options || {};

  var confirmText =
    String(options.confirm || '').trim().toUpperCase();

  if (
    confirmText !==
    KIDLEARN_V3_PHASE4H_LOCK_CONFIG.CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm khóa Phase 4H. Cần confirm=' +
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.CONFIRM_TEXT
    );
  }

  var qa =
    kidlearnV3_runPhase4HFinalQaV3();

  if (!qa.success) {
    throw new Error(
      'Không thể lock Phase 4H vì final QA chưa pass.'
    );
  }

  var gateMode =
    kidlearnV3_4h4GetLearningPlanGateMode_();

  if (gateMode !== 'CLOSED_DRY_RUN_ONLY') {
    throw new Error(
      'Không thể lock Phase 4H vì Learning Plan gate chưa đóng. Current=' +
      gateMode
    );
  }

  var lockedAt =
    new Date().toISOString();

  var lockedBy =
    String(options.lockedBy || 'SYSTEM_ADMIN').trim();

  var result = {
    success: true,
    action: 'LOCK_PHASE_4H_CONFIRM_V3',
    phase:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.LOCK_STEP,
    phaseName:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.PHASE_NAME,
    status:
      KIDLEARN_V3_PHASE4H_LOCK_STATUS.PHASE_4H_CLOSED_LOCKED,
    previousPhase:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.PREVIOUS_PHASE,
    nextPhase:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.NEXT_STAGE,
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
      'Phase 4H đã được khóa an toàn. Có thể chuyển sang Phase 4I.',
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
    KIDLEARN_V3_PHASE4H_LOCK_KEYS.STATUS,
    KIDLEARN_V3_PHASE4H_LOCK_STATUS.PHASE_4H_CLOSED_LOCKED
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE4H_LOCK_KEYS.LOCKED_BY,
    lockedBy
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE4H_LOCK_KEYS.LOCKED_AT,
    lockedAt
  );

  kidlearnV3_4h4SaveStatus_(
    result,
    KIDLEARN_V3_PHASE4H_LOCK_STATUS.PHASE_4H_CLOSED_LOCKED,
    KIDLEARN_V3_PHASE4H_LOCK_KEYS.LAST_LOCK_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get Phase 4H lock status.
 */
function kidlearnV3_getPhase4HLockStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PHASE_4H_LOCK_STATUS_V3',
    phase:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.LOCK_STEP,
    phaseName:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.PHASE_NAME,
    status:
      properties.getProperty(
        KIDLEARN_V3_PHASE4H_LOCK_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PHASE4H_LOCK_STATUS.NOT_RUN,
    lockedBy:
      properties.getProperty(
        KIDLEARN_V3_PHASE4H_LOCK_KEYS.LOCKED_BY
      ) || '',
    lockedAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE4H_LOCK_KEYS.LOCKED_AT
      ) || '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE4H_LOCK_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastQaAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE4H_LOCK_KEYS.LAST_QA_AT
      ) || '',
    lastLockAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE4H_LOCK_KEYS.LAST_LOCK_AT
      ) || '',
    lastResult:
      kidlearnV3_4h4ReadJsonProperty_(
        KIDLEARN_V3_PHASE4H_LOCK_KEYS.LAST_RESULT_JSON
      ),
    previousPhase:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.PREVIOUS_PHASE,
    nextPhase:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.NEXT_STAGE,
    gateMode:
      kidlearnV3_4h4GetLearningPlanGateMode_(),
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
 * Assert Phase 4H closed and locked.
 */
function kidlearnV3_assertPhase4HClosedLockedV3() {
  var status =
    kidlearnV3_getPhase4HLockStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PHASE4H_LOCK_STATUS.PHASE_4H_CLOSED_LOCKED
  ) {
    errors.push(
      'Phase 4H chưa PHASE_4H_CLOSED_LOCKED. Current=' +
      status.status
    );
  }

  if (
    status.gateMode !== 'CLOSED_DRY_RUN_ONLY'
  ) {
    errors.push(
      'Learning Plan gate chưa đóng. Current=' +
      status.gateMode
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_PHASE_4H_CLOSED_LOCKED_V3',
    phase:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.PHASE,
    status:
      status.status,
    gateMode:
      status.gateMode,
    nextPhase:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.NEXT_STAGE,
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
function kidlearnV3_assertPhase4HClosedV3() {
  return kidlearnV3_assertPhase4HClosedLockedV3();
}


/**
 * QA batch 4H-4.
 */
function kidlearnV3_runQaBatch4H4V3() {
  var preview =
    kidlearnV3_previewPhase4HLockV3();

  var finalQa =
    kidlearnV3_runPhase4HFinalQaV3();

  var lock =
    kidlearnV3_lockPhase4HConfirmV3();

  var status =
    kidlearnV3_getPhase4HLockStatusV3();

  var assertLocked =
    kidlearnV3_assertPhase4HClosedLockedV3();

  var result = {
    success:
      preview.success === true &&
      finalQa.success === true &&
      lock.success === true &&
      status.success === true &&
      assertLocked.success === true,
    suiteName:
      'PHASE_4H_4_QA_AND_LOCK',
    phase:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.LOCK_STEP,
    status:
      KIDLEARN_V3_PHASE4H_LOCK_STATUS.PHASE_4H_CLOSED_LOCKED,
    nextPhase:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.NEXT_STAGE,
    gateMode:
      kidlearnV3_4h4GetLearningPlanGateMode_(),
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
    throw new Error('4H-4 QA batch failed.');
  }

  return result;
}


/**
 * ================================================================
 * Final QA builder
 * ================================================================
 */

function kidlearnV3_4h4BuildFinalQa_(options) {
  options = options || {};

  var mode =
    String(options.mode || 'FINAL_QA').trim();

  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4h4CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var phase4G =
    kidlearnV3_4h4SafeCall_(
      'kidlearnV3_assertPhase4GClosedLockedV3'
    );

  if (!phase4G.success) {
    errors.push(
      'Phase 4G chưa locked: ' +
      phase4G.message
    );
  }

  var h1 =
    kidlearnV3_4h4SafeCall_(
      'kidlearnV3_assertLearningPlanPolicyContext4H1ReadyV3'
    );

  if (!h1.success) {
    errors.push(
      '4H-1 chưa READY_FOR_4H_2: ' +
      h1.message
    );
  }

  var h2 =
    kidlearnV3_4h4SafeCall_(
      'kidlearnV3_assertLearningPlanUi4H2ReadyV3'
    );

  if (!h2.success) {
    errors.push(
      '4H-2 chưa READY_FOR_4H_3: ' +
      h2.message
    );
  }

  var h3 =
    kidlearnV3_4h4SafeCall_(
      'kidlearnV3_assertLearningPlanWriteChild4H3ReadyV3'
    );

  if (!h3.success) {
    errors.push(
      '4H-3 chưa READY_FOR_4H_4: ' +
      h3.message
    );
  }

  var gateMode =
    kidlearnV3_4h4GetLearningPlanGateMode_();

  if (gateMode !== 'CLOSED_DRY_RUN_ONLY') {
    errors.push(
      'Learning Plan gate phải đóng trước khi lock Phase 4H. Current=' +
      gateMode
    );
  }

  var policy =
    kidlearnV3_4h4SafeCall_(
      'kidlearnV3_getLearningPlanPolicy4H1V3'
    );

  if (!policy.success) {
    errors.push(
      'Không đọc được Learning Plan Policy 4H-1: ' +
      policy.message
    );
  }

  var context =
    kidlearnV3_4h4SafeCall_(
      'kidlearnV3_getLearningPlanContext4H1V3',
      [
        {
          parentId:
            KIDLEARN_V3_PHASE4H_LOCK_CONFIG.DEFAULT_PARENT_ID,
          childId:
            KIDLEARN_V3_PHASE4H_LOCK_CONFIG.DEFAULT_CHILD_ID
        }
      ]
    );

  if (!context.success) {
    errors.push(
      'Không đọc được Learning Plan Context 4H-1: ' +
      context.message
    );
  }

  var childContext =
    kidlearnV3_4h4SafeCall_(
      'kidlearnV3_getChildLearningPlanContext4H3V3',
      [
        {
          childId:
            KIDLEARN_V3_PHASE4H_LOCK_CONFIG.DEFAULT_CHILD_ID
        }
      ]
    );

  if (!childContext.success) {
    errors.push(
      'Không đọc được Child Learning Plan Context 4H-3: ' +
      childContext.message
    );
  }

  var headerQa =
    kidlearnV3_4h4RunHeaderQaIfAvailable_();

  if (!headerQa.success) {
    errors =
      errors.concat(headerQa.errors || []);
  }

  warnings =
    warnings.concat(headerQa.warnings || []);

  var targetQa =
    kidlearnV3_4h4RunTargetMinutesQaIfAvailable_();

  if (!targetQa.success) {
    errors =
      errors.concat(targetQa.errors || []);
  }

  warnings =
    warnings.concat(targetQa.warnings || []);

  var uiMarkers =
    kidlearnV3_4h4InspectUiMarkers_();

  if (!uiMarkers.success) {
    errors =
      errors.concat(uiMarkers.errors || []);
  }

  warnings =
    warnings.concat(uiMarkers.warnings || []);

  var visualScore =
    kidlearnV3_4h4EstimateVisualScore_(
      uiMarkers
    );

  if (
    visualScore <
    KIDLEARN_V3_PHASE4H_LOCK_CONFIG.MIN_VISUAL_SCORE
  ) {
    errors.push(
      'Visual score thấp hơn yêu cầu. Current=' +
      visualScore +
      ', min=' +
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.MIN_VISUAL_SCORE
    );
  }

  var qaSummary = {
    phase4GLocked:
      phase4G.success === true,
    phase4H1Ready:
      h1.success === true,
    phase4H2Ready:
      h2.success === true,
    phase4H3Ready:
      h3.success === true,
    learningPlanGateClosed:
      gateMode === 'CLOSED_DRY_RUN_ONLY',
    policyReadable:
      policy.success === true,
    parentContextReadable:
      context.success === true,
    childContextReadable:
      childContext.success === true,
    headersReady:
      headerQa.success === true,
    targetMinutesQa:
      targetQa,
    uiMarkersReady:
      uiMarkers.success === true,
    visualScore:
      visualScore,
    dryRunUi:
      true,
    controlledWrite:
      true,
    childHomeVisibility:
      true
  };

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_PHASE_4H_FINAL_QA_V3',
    mode:
      mode,
    phase:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.LOCK_STEP,
    phaseName:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.PHASE_NAME,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PHASE4H_LOCK_STATUS.QA_PASSED
        : KIDLEARN_V3_PHASE4H_LOCK_STATUS.FAILED,
    previousPhase:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.PREVIOUS_PHASE,
    nextPhase:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4H_LOCK_CONFIG.NEXT_STAGE,
    gateMode:
      gateMode,
    qaSummary:
      qaSummary,
    prerequisites: {
      phase4G:
        phase4G,
      phase4H1:
        h1,
      phase4H2:
        h2,
      phase4H3:
        h3
    },
    contextChecks: {
      policy:
        kidlearnV3_4h4CompactSafeCall_(policy),
      parentContext:
        kidlearnV3_4h4CompactSafeCall_(context),
      childContext:
        kidlearnV3_4h4CompactSafeCall_(childContext)
    },
    headerQa:
      headerQa,
    targetQa:
      targetQa,
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
      kidlearnV3_4h4UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4h4UniqueArray_(warnings),
    checkedAt:
      new Date().toISOString()
  };
}


/**
 * ================================================================
 * QA helpers
 * ================================================================
 */

function kidlearnV3_4h4RunHeaderQaIfAvailable_() {
  var warnings = [];

  if (
    typeof kidlearnV3_assertLearningPlanHeadersReady4H3P4V3 !== 'function'
  ) {
    return {
      success: true,
      available: false,
      warningCount: 1,
      warnings: [
        'Không tìm thấy kidlearnV3_assertLearningPlanHeadersReady4H3P4V3. Bỏ qua header QA compact.'
      ],
      errors: []
    };
  }

  try {
    var result =
      kidlearnV3_assertLearningPlanHeadersReady4H3P4V3();

    return {
      success:
        result && result.success === true,
      available:
        true,
      DATA_DailyGoals:
        result.DATA_DailyGoals || {},
      DATA_Assignments:
        result.DATA_Assignments || {},
      actualSheetWritePerformed:
        false,
      actualDriveWritePerformed:
        false,
      warnings:
        warnings,
      errors:
        result && result.success === true
          ? []
          : ['Header QA 4H-3P4 chưa pass.']
    };
  } catch (error) {
    return {
      success: false,
      available: true,
      errors: [
        'Header QA 4H-3P4 failed: ' +
        String(error.message || error)
      ],
      warnings:
        warnings
    };
  }
}


function kidlearnV3_4h4RunTargetMinutesQaIfAvailable_() {
  if (
    typeof kidlearnV3_debugTodayDailyGoalTarget4H3P6V3 !== 'function'
  ) {
    return {
      success: true,
      available: false,
      requiredForLock:
        false,
      warnings: [
        'Không tìm thấy kidlearnV3_debugTodayDailyGoalTarget4H3P6V3. Bỏ qua targetMinutes readback QA.'
      ],
      errors: [],
      actualSheetWritePerformed:
        false,
      actualDriveWritePerformed:
        false
    };
  }

  try {
    var result =
      kidlearnV3_debugTodayDailyGoalTarget4H3P6V3();

    var rowValues =
      result.rowValues || {};

    var target =
      Number(rowValues.targetMinutes || 0);

    if (target <= 0) {
      return {
        success: false,
        available: true,
        requiredForLock:
          true,
        targetMinutes:
          target,
        rowIndex:
          result.rowIndex || 0,
        errors: [
          'Daily Goal hôm nay có targetMinutes <= 0. Current=' +
          target +
          '. Cần submit lại 20 phút trước khi lock.'
        ],
        warnings: [],
        actualSheetWritePerformed:
          false,
        actualDriveWritePerformed:
          false
      };
    }

    return {
      success: true,
      available: true,
      requiredForLock:
        true,
      targetMinutes:
        target,
      rowIndex:
        result.rowIndex || 0,
      targetColumn:
        result.resolvedColumns &&
        result.resolvedColumns.targetMinutes
          ? result.resolvedColumns.targetMinutes
          : {},
      actualSheetWritePerformed:
        false,
      actualDriveWritePerformed:
        false,
      errors: [],
      warnings: []
    };

  } catch (error) {
    return {
      success: false,
      available: true,
      requiredForLock:
        true,
      errors: [
        'TargetMinutes QA 4H-3P6 failed: ' +
        String(error.message || error)
      ],
      warnings: [],
      actualSheetWritePerformed:
        false,
      actualDriveWritePerformed:
        false
    };
  }
}


function kidlearnV3_4h4InspectUiMarkers_() {
  var errors = [];
  var warnings = [];

  var shell = '';
  var client4H2 = '';
  var client4H3 = '';
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
    client4H2 =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_LearningPlan_4H2')
        .getContent();
  } catch (error4H2) {
    errors.push(
      'Không đọc được UI_Product_Client_LearningPlan_4H2: ' +
      String(error4H2.message || error4H2)
    );
  }

  try {
    client4H3 =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_LearningPlan_WriteChild_4H3')
        .getContent();
  } catch (error4H3) {
    errors.push(
      'Không đọc được UI_Product_Client_LearningPlan_WriteChild_4H3: ' +
      String(error4H3.message || error4H3)
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

  kidlearnV3_4h4CheckMarkers_(
    shell,
    [
      'UI_Product_Client_LearningPlan_4H2',
      'UI_Product_Client_LearningPlan_WriteChild_4H3'
    ],
    'Shell',
    errors
  );

  kidlearnV3_4h4CheckMarkers_(
    client4H2,
    [
      'KIDLEARN_LEARNING_PLAN_UI_DRY_RUN_4H2',
      'ensureLearningPlanEntry4H2',
      'openLearningPlanPanel4H2',
      'renderLearningPlanPanel4H2',
      'submitLearningPlanDryRun4H2',
      'kidlearnV3_getLearningPlanContext4H1V3',
      'kidlearnV3_previewLearningPlanDraft4H2V3',
      'kl-learning-plan-entry-4h2',
      'kl-learning-plan-panel-4h2'
    ],
    'Client 4H-2',
    errors
  );

  kidlearnV3_4h4CheckMarkers_(
    client4H3,
    [
      'KIDLEARN_LEARNING_PLAN_WRITE_CHILD_UI_4H3',
      'patchLearningPlanWriteButton4H3',
      'submitLearningPlanControlledWrite4H3',
      'renderChildLearningPlanHome4H3',
      'kidlearnV3_submitLearningPlanFromUi4H3V3',
      'kidlearnV3_getChildLearningPlanContext4H3V3',
      'kl-learning-plan-write-gate-4h3',
      'kl-child-learning-plan-entry-4h3'
    ],
    'Client 4H-3',
    errors
  );

  kidlearnV3_4h4CheckMarkers_(
    styles,
    [
      '.kl-learning-plan-entry-4h2',
      '.kl-learning-plan-panel-4h2',
      '.kl-learning-plan-card-4h2',
      '.kl-learning-plan-write-gate-4h3',
      '.kl-learning-plan-realwrite-button-4h3',
      '.kl-child-learning-plan-entry-4h3',
      '.kl-child-learning-plan-assignment-4h3'
    ],
    'CSS',
    errors
  );

  return {
    success:
      errors.length === 0,
    action:
      'INSPECT_PHASE_4H_UI_MARKERS_4H_4_V3',
    shellIncluded:
      shell.indexOf('UI_Product_Client_LearningPlan_4H2') !== -1 &&
      shell.indexOf('UI_Product_Client_LearningPlan_WriteChild_4H3') !== -1,
    client4H2Loaded:
      client4H2 !== '',
    client4H3Loaded:
      client4H3 !== '',
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


function kidlearnV3_4h4CheckMarkers_(content, markers, label, errors) {
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


function kidlearnV3_4h4EstimateVisualScore_(uiMarkers) {
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

function kidlearnV3_4h4GetLearningPlanGateMode_() {
  var key =
    'KIDLEARN_V3_PHASE_4H_LEARNING_PLAN_WRITE_GATE_MODE';

  try {
    if (
      typeof KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS !== 'undefined' &&
      KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS &&
      KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS.WRITE_GATE_MODE
    ) {
      key =
        KIDLEARN_V3_LEARNING_PLAN_4H1_KEYS.WRITE_GATE_MODE;
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


function kidlearnV3_4h4CheckDevSafety_() {
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
      kidlearnV3_4h4UniqueArray_(errors)
  };
}


function kidlearnV3_4h4SafeCall_(functionName, args) {
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
          : kidlearnV3_4h4PreviewValue_(JSON.stringify(output || {})),
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


function kidlearnV3_4h4CompactSafeCall_(safeCallResult) {
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


function kidlearnV3_4h4PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 450) {
    return text.substring(0, 450) + '...';
  }

  return text;
}


function kidlearnV3_4h4UniqueArray_(items) {
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


function kidlearnV3_4h4SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PHASE4H_LOCK_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PHASE4H_LOCK_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_PHASE4H_LOCK_CONFIG.PHASE,
      lockStep:
        result.lockStep ||
        KIDLEARN_V3_PHASE4H_LOCK_CONFIG.LOCK_STEP,
      phaseName:
        KIDLEARN_V3_PHASE4H_LOCK_CONFIG.PHASE_NAME,
      status:
        status,
      gateMode:
        result.gateMode ||
        kidlearnV3_4h4GetLearningPlanGateMode_(),
      previousPhase:
        KIDLEARN_V3_PHASE4H_LOCK_CONFIG.PREVIOUS_PHASE,
      nextPhase:
        KIDLEARN_V3_PHASE4H_LOCK_CONFIG.NEXT_PHASE,
      nextStage:
        KIDLEARN_V3_PHASE4H_LOCK_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4h4ReadJsonProperty_(key) {
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