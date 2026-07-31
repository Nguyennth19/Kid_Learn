/**
 * ================================================================
 * KIDLEARN V3 - MVP FINAL 4J + 4K
 * File: Product_MVP_Final_4J4K_V3.gs
 * Version: 3.1.0
 * ================================================================
 *
 * Combined scope:
 * - 4J: Parent Assignment Management / Quản lý bài đã giao
 * - 4K: MVP Final QA + MVP Lock
 *
 * Safety:
 * - 4J is READ-ONLY.
 * - 4K only writes ScriptProperties for QA/lock status.
 * - No DATA_Assignments write.
 * - No DATA_LessonProgress write.
 * - No DATA_Responses write.
 * - No DATA_DailyGoals write.
 * - No LOG_Audit write.
 * - No Drive write.
 * - No PROD write.
 */


/**
 * ================================================================
 * 4J CONSTANTS
 * ================================================================
 */

var KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4J_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4J_LAST_PREVIEW_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4J_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4J_LAST_RESULT_JSON'
};


var KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  READY_FOR_4K: 'READY_FOR_4K',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG = {
  PHASE: '4J',
  PHASE_NAME: 'PARENT_ASSIGNMENT_MANAGEMENT_READ_ONLY',
  PREVIOUS_PHASE: '4I',
  NEXT_PHASE: '4K',
  NEXT_STAGE: 'MVP_FINAL_QA_AND_LOCK',
  DEFAULT_PARENT_ID: 'PARENT',
  DEFAULT_CHILD_ID: 'CHD_V2_CHILD_DEFAULT',
  DEFAULT_LIMIT: 120,
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * ================================================================
 * 4K CONSTANTS
 * ================================================================
 */

var KIDLEARN_V3_MVP_FINAL_4K_KEYS = {
  STATUS: 'KIDLEARN_V3_MVP_FINAL_4K_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_MVP_FINAL_4K_LAST_PREVIEW_AT',
  LAST_QA_AT: 'KIDLEARN_V3_MVP_FINAL_4K_LAST_QA_AT',
  LAST_LOCK_AT: 'KIDLEARN_V3_MVP_FINAL_4K_LAST_LOCK_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_MVP_FINAL_4K_LAST_RESULT_JSON',
  LOCKED_BY: 'KIDLEARN_V3_MVP_FINAL_4K_LOCKED_BY',
  LOCKED_AT: 'KIDLEARN_V3_MVP_FINAL_4K_LOCKED_AT'
};


var KIDLEARN_V3_MVP_FINAL_4K_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  QA_PASSED: 'QA_PASSED',
  MVP_FINAL_LOCKED: 'MVP_FINAL_LOCKED',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_MVP_FINAL_4K_CONFIG = {
  PHASE: '4K',
  PHASE_NAME: 'KIDLEARN_V3_MVP_FINAL_QA_LOCK',
  PREVIOUS_PHASE: '4J',
  MVP_VERSION: 'KIDLEARN_V3_MVP_3_1_0',
  CONFIRM_TEXT: 'LOCK_KIDLEARN_V3_MVP_FINAL',
  MIN_VISUAL_SCORE: 85,
  DEFAULT_PARENT_ID: 'PARENT',
  DEFAULT_CHILD_ID: 'CHD_V2_CHILD_DEFAULT',
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * ================================================================
 * 4J PUBLIC FUNCTIONS
 * ================================================================
 */


/**
 * Parent Assignment Management Context.
 * Read-only.
 */
function kidlearnV3_getParentAssignmentManagementContext4JV3(options) {
  options = options || {};

  var result =
    kidlearnV3_4jBuildParentAssignmentContext_(options);

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4J Parent Assignment Management context failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Preview 4J.
 *
 * Note:
 * - Preview checks backend context and 4I lock.
 * - UI marker is checked as warning until UI file is added.
 */
function kidlearnV3_previewParentAssignmentManagement4JV3() {
  var result =
    kidlearnV3_4jBuildReadiness_({
      requireUi:
        false
    });

  result.action =
    'PREVIEW_PARENT_ASSIGNMENT_MANAGEMENT_4J_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_STATUS.PREVIEWED
      : KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_STATUS.FAILED;

  kidlearnV3_4jSaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4J preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 4J ready.
 *
 * This requires:
 * - 4I locked
 * - 4J context readable
 * - 4J UI file included in shell
 */
function kidlearnV3_markParentAssignmentManagement4JReadyV3() {
  var result =
    kidlearnV3_4jBuildReadiness_({
      requireUi:
        true
    });

  result.action =
    'MARK_PARENT_ASSIGNMENT_MANAGEMENT_4J_READY_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_STATUS.READY_FOR_4K
      : KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_STATUS.FAILED;

  result.nextPhase =
    KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.NEXT_PHASE;

  result.nextStage =
    KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.NEXT_STAGE;

  result.message =
    result.success
      ? '4J ready. Có thể qua 4K để chạy Final MVP QA và khóa MVP.'
      : '4J chưa ready. Cần xử lý errors trước.';

  kidlearnV3_4jSaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4J mark ready failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Get 4J status.
 */
function kidlearnV3_getParentAssignmentManagement4JStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PARENT_ASSIGNMENT_MANAGEMENT_4J_STATUS_V3',
    phase:
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.PHASE,
    phaseName:
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.PHASE_NAME,
    status:
      properties.getProperty(
        KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4j4kReadJsonProperty_(
        KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_KEYS.LAST_RESULT_JSON
      ),
    previousPhase:
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.PREVIOUS_PHASE,
    nextPhase:
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.NEXT_STAGE,
    prodWriteAllowed:
      false,
    realSheetWriteAllowedNow:
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
 * Assert 4J ready.
 */
function kidlearnV3_assertParentAssignmentManagement4JReadyV3() {
  var status =
    kidlearnV3_getParentAssignmentManagement4JStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_STATUS.READY_FOR_4K
  ) {
    errors.push(
      '4J chưa READY_FOR_4K. Current=' +
      status.status
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_PARENT_ASSIGNMENT_MANAGEMENT_4J_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.PHASE,
    status:
      status.status,
    nextPhase:
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.NEXT_STAGE,
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
 * QA batch 4J.
 */
function kidlearnV3_runQaBatch4JV3() {
  var preview =
    kidlearnV3_previewParentAssignmentManagement4JV3();

  var ready =
    kidlearnV3_markParentAssignmentManagement4JReadyV3();

  var assertReady =
    kidlearnV3_assertParentAssignmentManagement4JReadyV3();

  var result = {
    success:
      preview.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4J_PARENT_ASSIGNMENT_MANAGEMENT_READ_ONLY',
    phase:
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_STATUS.READY_FOR_4K,
    nextPhase:
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.NEXT_STAGE,
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
      ready:
        ready.success,
      assertReady:
        assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4J QA batch failed.');
  }

  return result;
}


/**
 * ================================================================
 * 4K PUBLIC FUNCTIONS
 * ================================================================
 */


/**
 * Preview MVP Final Lock readiness.
 */
function kidlearnV3_previewMvpFinalLock4KV3() {
  var result =
    kidlearnV3_4kBuildFinalQa_({
      mode:
        'PREVIEW'
    });

  result.action =
    'PREVIEW_MVP_FINAL_LOCK_4K_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_MVP_FINAL_4K_STATUS.PREVIEWED
      : KIDLEARN_V3_MVP_FINAL_4K_STATUS.FAILED;

  kidlearnV3_4kSaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_MVP_FINAL_4K_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4K preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Run MVP Final QA.
 */
function kidlearnV3_runMvpFinalQa4KV3() {
  var result =
    kidlearnV3_4kBuildFinalQa_({
      mode:
        'FINAL_QA'
    });

  result.action =
    'RUN_MVP_FINAL_QA_4K_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_MVP_FINAL_4K_STATUS.QA_PASSED
      : KIDLEARN_V3_MVP_FINAL_4K_STATUS.FAILED;

  kidlearnV3_4kSaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_MVP_FINAL_4K_KEYS.LAST_QA_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4K final QA failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Lock MVP with default confirmation.
 */
function kidlearnV3_lockMvpFinalConfirm4KV3() {
  return kidlearnV3_lockMvpFinal4KV3({
    confirm:
      KIDLEARN_V3_MVP_FINAL_4K_CONFIG.CONFIRM_TEXT,
    lockedBy:
      'SYSTEM_ADMIN'
  });
}


/**
 * Lock MVP final.
 */
function kidlearnV3_lockMvpFinal4KV3(options) {
  options = options || {};

  var confirmText =
    String(options.confirm || '').trim().toUpperCase();

  if (
    confirmText !==
    KIDLEARN_V3_MVP_FINAL_4K_CONFIG.CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm khóa MVP. Cần confirm=' +
      KIDLEARN_V3_MVP_FINAL_4K_CONFIG.CONFIRM_TEXT
    );
  }

  var qa =
    kidlearnV3_runMvpFinalQa4KV3();

  if (!qa.success) {
    throw new Error(
      'Không thể lock MVP vì Final QA chưa pass.'
    );
  }

  var lockedAt =
    new Date().toISOString();

  var lockedBy =
    String(options.lockedBy || 'SYSTEM_ADMIN').trim();

  var result = {
    success: true,
    action: 'LOCK_MVP_FINAL_4K_CONFIRM_V3',
    phase:
      KIDLEARN_V3_MVP_FINAL_4K_CONFIG.PHASE,
    phaseName:
      KIDLEARN_V3_MVP_FINAL_4K_CONFIG.PHASE_NAME,
    status:
      KIDLEARN_V3_MVP_FINAL_4K_STATUS.MVP_FINAL_LOCKED,
    mvpVersion:
      KIDLEARN_V3_MVP_FINAL_4K_CONFIG.MVP_VERSION,
    lockedBy:
      lockedBy,
    lockedAt:
      lockedAt,
    qaSummary:
      qa.qaSummary,
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
      'KIDLEARN V3 MVP đã được khóa an toàn.',
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
    KIDLEARN_V3_MVP_FINAL_4K_KEYS.STATUS,
    KIDLEARN_V3_MVP_FINAL_4K_STATUS.MVP_FINAL_LOCKED
  );

  properties.setProperty(
    KIDLEARN_V3_MVP_FINAL_4K_KEYS.LOCKED_BY,
    lockedBy
  );

  properties.setProperty(
    KIDLEARN_V3_MVP_FINAL_4K_KEYS.LOCKED_AT,
    lockedAt
  );

  kidlearnV3_4kSaveStatus_(
    result,
    KIDLEARN_V3_MVP_FINAL_4K_STATUS.MVP_FINAL_LOCKED,
    KIDLEARN_V3_MVP_FINAL_4K_KEYS.LAST_LOCK_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get MVP final lock status.
 */
function kidlearnV3_getMvpFinalLockStatus4KV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_MVP_FINAL_LOCK_STATUS_4K_V3',
    phase:
      KIDLEARN_V3_MVP_FINAL_4K_CONFIG.PHASE,
    phaseName:
      KIDLEARN_V3_MVP_FINAL_4K_CONFIG.PHASE_NAME,
    status:
      properties.getProperty(
        KIDLEARN_V3_MVP_FINAL_4K_KEYS.STATUS
      ) ||
      KIDLEARN_V3_MVP_FINAL_4K_STATUS.NOT_RUN,
    mvpVersion:
      KIDLEARN_V3_MVP_FINAL_4K_CONFIG.MVP_VERSION,
    lockedBy:
      properties.getProperty(
        KIDLEARN_V3_MVP_FINAL_4K_KEYS.LOCKED_BY
      ) || '',
    lockedAt:
      properties.getProperty(
        KIDLEARN_V3_MVP_FINAL_4K_KEYS.LOCKED_AT
      ) || '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_MVP_FINAL_4K_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastQaAt:
      properties.getProperty(
        KIDLEARN_V3_MVP_FINAL_4K_KEYS.LAST_QA_AT
      ) || '',
    lastLockAt:
      properties.getProperty(
        KIDLEARN_V3_MVP_FINAL_4K_KEYS.LAST_LOCK_AT
      ) || '',
    lastResult:
      kidlearnV3_4j4kReadJsonProperty_(
        KIDLEARN_V3_MVP_FINAL_4K_KEYS.LAST_RESULT_JSON
      ),
    prodWriteAllowed:
      false,
    realSheetWriteAllowedNow:
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
 * Assert MVP final locked.
 */
function kidlearnV3_assertMvpFinalLocked4KV3() {
  var status =
    kidlearnV3_getMvpFinalLockStatus4KV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_MVP_FINAL_4K_STATUS.MVP_FINAL_LOCKED
  ) {
    errors.push(
      'MVP chưa MVP_FINAL_LOCKED. Current=' +
      status.status
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_MVP_FINAL_LOCKED_4K_V3',
    phase:
      KIDLEARN_V3_MVP_FINAL_4K_CONFIG.PHASE,
    status:
      status.status,
    mvpVersion:
      KIDLEARN_V3_MVP_FINAL_4K_CONFIG.MVP_VERSION,
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
 * QA batch 4K.
 */
function kidlearnV3_runQaBatch4KV3() {
  var preview =
    kidlearnV3_previewMvpFinalLock4KV3();

  var finalQa =
    kidlearnV3_runMvpFinalQa4KV3();

  var lock =
    kidlearnV3_lockMvpFinalConfirm4KV3();

  var status =
    kidlearnV3_getMvpFinalLockStatus4KV3();

  var assertLocked =
    kidlearnV3_assertMvpFinalLocked4KV3();

  var result = {
    success:
      preview.success === true &&
      finalQa.success === true &&
      lock.success === true &&
      status.success === true &&
      assertLocked.success === true,
    suiteName:
      'PHASE_4K_MVP_FINAL_QA_AND_LOCK',
    phase:
      KIDLEARN_V3_MVP_FINAL_4K_CONFIG.PHASE,
    status:
      KIDLEARN_V3_MVP_FINAL_4K_STATUS.MVP_FINAL_LOCKED,
    mvpVersion:
      KIDLEARN_V3_MVP_FINAL_4K_CONFIG.MVP_VERSION,
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
    throw new Error('4K QA batch failed.');
  }

  return result;
}


/**
 * ================================================================
 * 4J CONTEXT BUILDER
 * ================================================================
 */

function kidlearnV3_4jBuildReadiness_(options) {
  options = options || {};

  var requireUi =
    options.requireUi === true;

  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4j4kCheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var phase4I =
    kidlearnV3_4j4kSafeCall_(
      'kidlearnV3_assertPhase4IClosedLockedV3'
    );

  if (!phase4I.success) {
    errors.push(
      'Phase 4I chưa locked: ' +
      phase4I.message
    );
  }

  var context = null;

  try {
    context =
      kidlearnV3_4jBuildParentAssignmentContext_({
        parentId:
          KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.DEFAULT_PARENT_ID,
        childId:
          KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.DEFAULT_CHILD_ID,
        limit:
          KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.DEFAULT_LIMIT
      });

    if (context.warnings) {
      warnings =
        warnings.concat(context.warnings);
    }
  } catch (errorContext) {
    errors.push(
      'Không build được 4J context: ' +
      String(errorContext.message || errorContext)
    );
  }

  var uiMarkers =
    kidlearnV3_4jInspectUiMarkers_();

  if (!uiMarkers.success) {
    if (requireUi) {
      errors =
        errors.concat(uiMarkers.errors || []);
    } else {
      warnings =
        warnings.concat(uiMarkers.errors || []);
    }
  }

  warnings =
    warnings.concat(uiMarkers.warnings || []);

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_PARENT_ASSIGNMENT_MANAGEMENT_READINESS_4J_V3',
    phase:
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.PHASE,
    phaseName:
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.PHASE_NAME,
    previousPhase:
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.PREVIOUS_PHASE,
    nextPhase:
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.NEXT_STAGE,
    requireUi:
      requireUi,
    prerequisite: {
      dev:
        dev.success === true,
      phase4ILocked:
        phase4I.success === true,
      contextReadable:
        context && context.success === true,
      uiMarkersReady:
        uiMarkers.success === true
    },
    contextSummary:
      context ? context.contextSummary : null,
    dataAvailability:
      context ? context.dataAvailability : null,
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
    actualDriveWritePerformed:
      false,
    errorCount:
      errors.length,
    warningCount:
      kidlearnV3_4j4kUniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4j4kUniqueArray_(warnings),
    checkedAt:
      new Date().toISOString()
  };
}


function kidlearnV3_4jBuildParentAssignmentContext_(options) {
  options = options || {};

  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4j4kCheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var phase4I =
    kidlearnV3_4j4kSafeCall_(
      'kidlearnV3_assertPhase4IClosedLockedV3'
    );

  if (!phase4I.success) {
    errors.push(
      'Phase 4I chưa locked: ' +
      phase4I.message
    );
  }

  var parentId =
    String(
      options.parentId ||
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.DEFAULT_PARENT_ID
    ).trim();

  var childId =
    String(
      options.childId ||
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.DEFAULT_CHILD_ID
    ).trim();

  var limit =
    Number(
      options.limit ||
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.DEFAULT_LIMIT
    );

  if (isNaN(limit) || limit <= 0) {
    limit =
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.DEFAULT_LIMIT;
  }

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4j4kOpenSpreadsheet_();
  } catch (errorOpen) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(errorOpen.message || errorOpen)
    );
  }

  var todayKey =
    kidlearnV3_4j4kTodayKey_();

  var dataAvailability = {
    DATA_Children: false,
    DATA_Assignments: false,
    DATA_LessonProgress: false,
    MST_Lessons: false,
    MST_Subjects: false
  };

  var child = {
    childId:
      childId,
    displayName:
      'Bé'
  };

  var subjectMap = {};
  var lessonMap = {};
  var progressMap = {};
  var assignments = [];

  if (spreadsheet) {
    child =
      kidlearnV3_4jReadChild_(
        spreadsheet,
        childId,
        child,
        dataAvailability,
        warnings
      );

    subjectMap =
      kidlearnV3_4jReadSubjectMap_(
        spreadsheet,
        dataAvailability,
        warnings
      );

    lessonMap =
      kidlearnV3_4jReadLessonMap_(
        spreadsheet,
        dataAvailability,
        warnings
      );

    progressMap =
      kidlearnV3_4jReadLessonProgressMap_(
        spreadsheet,
        childId,
        dataAvailability,
        warnings
      );

    assignments =
      kidlearnV3_4jReadAssignmentsForParent_(
        spreadsheet,
        childId,
        todayKey,
        lessonMap,
        subjectMap,
        progressMap,
        dataAvailability,
        warnings
      );
  }

  var grouped =
    kidlearnV3_4jGroupAssignments_(
      assignments
    );

  var displayItems =
    assignments.slice(0, limit);

  var contextSummary = {
    todayKey:
      todayKey,
    assignmentCount:
      assignments.length,
    displayCount:
      displayItems.length,
    activeCount:
      grouped.active.length,
    inProgressCount:
      grouped.inProgress.length,
    completedCount:
      grouped.completed.length,
    overdueCount:
      grouped.overdue.length,
    noProgressCount:
      grouped.noProgress.length,
    childId:
      childId,
    parentId:
      parentId
  };

  var result = {
    success:
      errors.length === 0,
    action:
      'GET_PARENT_ASSIGNMENT_MANAGEMENT_CONTEXT_4J_V3',
    phase:
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.PHASE,
    phaseName:
      KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.PHASE_NAME,
    child:
      child,
    parentId:
      parentId,
    todayKey:
      todayKey,
    parentAssignmentManagement: {
      title:
        'Quản lý bài đã giao',
      subtitle:
        'Phụ huynh theo dõi bài đã giao, tiến độ và trạng thái hoàn thành.',
      readOnly:
        true,
      emptyState: {
        show:
          assignments.length === 0,
        title:
          'Chưa có bài đã giao',
        message:
          'Khi phụ huynh giao bài trong phần Lập kế hoạch học, bài sẽ xuất hiện tại đây.'
      },
      items:
        displayItems,
      groups:
        grouped,
      uiPolicy: {
        viewOnly:
          true,
        canDeleteAssignment:
          false,
        canCancelAssignment:
          false,
        canResetProgress:
          false,
        canEditResponses:
          false,
        canEditDailyGoals:
          false,
        writeStep:
          'POST_MVP_OPTIONAL'
      }
    },
    contextSummary:
      contextSummary,
    dataAvailability:
      dataAvailability,
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
      kidlearnV3_4j4kUniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4j4kUniqueArray_(warnings),
    builtAt:
      new Date().toISOString()
  };

  return result;
}


/**
 * ================================================================
 * 4J DATA READERS
 * ================================================================
 */

function kidlearnV3_4jReadChild_(spreadsheet, childId, fallbackChild, dataAvailability, warnings) {
  var sheet =
    kidlearnV3_4j4kGetSheetByExactName_(
      spreadsheet,
      'DATA_Children'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    warnings.push('DATA_Children trống hoặc không tồn tại.');
    return fallbackChild;
  }

  dataAvailability.DATA_Children = true;

  var headers =
    kidlearnV3_4j4kReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var rowChildId =
      String(
        kidlearnV3_4j4kReadValueByAliases_(
          row,
          headers,
          ['childId', 'id', 'Mã bé', 'Mã trẻ', 'Hồ sơ bé']
        ) || ''
      ).trim();

    if (rowChildId === childId) {
      return {
        childId:
          childId,
        displayName:
          String(
            kidlearnV3_4j4kReadValueByAliases_(
              row,
              headers,
              ['displayName', 'childName', 'name', 'Tên bé', 'Họ tên']
            ) || 'Bé'
          ),
        grade:
          String(
            kidlearnV3_4j4kReadValueByAliases_(
              row,
              headers,
              ['grade', 'Lớp']
            ) || ''
          ),
        sourceRow:
          i + 2
      };
    }
  }

  return fallbackChild;
}


function kidlearnV3_4jReadSubjectMap_(spreadsheet, dataAvailability, warnings) {
  var map = {};

  var sheet =
    kidlearnV3_4j4kGetSheetByExactName_(
      spreadsheet,
      'MST_Subjects'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    warnings.push('MST_Subjects trống hoặc không tồn tại.');
    return map;
  }

  dataAvailability.MST_Subjects = true;

  var headers =
    kidlearnV3_4j4kReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var subjectCode =
      String(
        kidlearnV3_4j4kReadValueByAliases_(
          row,
          headers,
          ['subjectCode', 'subjectId', 'Mã môn học', 'Mã môn']
        ) || ''
      ).trim();

    if (!subjectCode) continue;

    map[subjectCode] = {
      subjectCode:
        subjectCode,
      subjectName:
        String(
          kidlearnV3_4j4kReadValueByAliases_(
            row,
            headers,
            ['subjectName', 'name', 'Tên môn học', 'Tên môn', 'Môn học']
          ) || subjectCode
        ),
      sourceRow:
        i + 2
    };
  }

  return map;
}


function kidlearnV3_4jReadLessonMap_(spreadsheet, dataAvailability, warnings) {
  var map = {};

  var sheet =
    kidlearnV3_4j4kGetSheetByExactName_(
      spreadsheet,
      'MST_Lessons'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    warnings.push('MST_Lessons trống hoặc không tồn tại.');
    return map;
  }

  dataAvailability.MST_Lessons = true;

  var headers =
    kidlearnV3_4j4kReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var lessonId =
      String(
        kidlearnV3_4j4kReadValueByAliases_(
          row,
          headers,
          ['lessonId', 'id', 'Mã bài học', 'Mã lesson']
        ) || ''
      ).trim();

    if (!lessonId) continue;

    map[lessonId] = {
      lessonId:
        lessonId,
      lessonTitle:
        String(
          kidlearnV3_4j4kReadValueByAliases_(
            row,
            headers,
            ['lessonTitle', 'title', 'name', 'Tên bài học', 'Tên bài']
          ) || lessonId
        ),
      subjectCode:
        String(
          kidlearnV3_4j4kReadValueByAliases_(
            row,
            headers,
            ['subjectCode', 'subjectId', 'Mã môn học', 'Mã môn']
          ) || ''
        ),
      sourceRow:
        i + 2
    };
  }

  return map;
}


function kidlearnV3_4jReadLessonProgressMap_(spreadsheet, childId, dataAvailability, warnings) {
  var map = {};

  var sheet =
    kidlearnV3_4j4kGetSheetByExactName_(
      spreadsheet,
      'DATA_LessonProgress'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    warnings.push('DATA_LessonProgress trống hoặc không tồn tại.');
    return map;
  }

  dataAvailability.DATA_LessonProgress = true;

  var headers =
    kidlearnV3_4j4kReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var rowChildId =
      String(
        kidlearnV3_4j4kReadValueByAliases_(
          row,
          headers,
          ['childId', 'studentId', 'learnerId', 'Mã bé', 'Hồ sơ bé']
        ) || ''
      ).trim();

    if (rowChildId && rowChildId !== childId) continue;

    var lessonId =
      String(
        kidlearnV3_4j4kReadValueByAliases_(
          row,
          headers,
          ['lessonId', 'Mã bài học']
        ) || ''
      ).trim();

    if (!lessonId) continue;

    var progressPercent =
      kidlearnV3_4j4kToNumber_(
        kidlearnV3_4j4kReadValueByAliases_(
          row,
          headers,
          ['progressPercent', 'completionPercent', 'percentComplete', 'Tiến độ']
        )
      );

    var status =
      String(
        kidlearnV3_4j4kReadValueByAliases_(
          row,
          headers,
          ['status', 'Trạng thái']
        ) || ''
      ).trim().toUpperCase();

    map[lessonId] = {
      childId:
        rowChildId || childId,
      lessonId:
        lessonId,
      progressPercent:
        progressPercent,
      status:
        status,
      isCompleted:
        progressPercent >= 100 ||
        kidlearnV3_4j4kIsCompletedStatus_(status),
      updatedAt:
        kidlearnV3_4j4kToIso_(
          kidlearnV3_4j4kReadValueByAliases_(
            row,
            headers,
            ['updatedAt', 'lastUpdatedAt', 'Cập nhật lúc']
          )
        ),
      sourceRow:
        i + 2
    };
  }

  return map;
}


function kidlearnV3_4jReadAssignmentsForParent_(spreadsheet, childId, todayKey, lessonMap, subjectMap, progressMap, dataAvailability, warnings) {
  var sheet =
    kidlearnV3_4j4kGetSheetByExactName_(
      spreadsheet,
      'DATA_Assignments'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    warnings.push('DATA_Assignments trống hoặc không tồn tại.');
    return [];
  }

  dataAvailability.DATA_Assignments = true;

  var headers =
    kidlearnV3_4j4kReadHeaders_(sheet);

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  var items = [];

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var rowChildId =
      String(
        kidlearnV3_4j4kReadValueByAliases_(
          row,
          headers,
          ['childId', 'studentId', 'learnerId', 'Mã bé', 'Hồ sơ bé']
        ) || ''
      ).trim();

    if (childId && rowChildId && rowChildId !== childId) continue;

    var lessonId =
      String(
        kidlearnV3_4j4kReadValueByAliases_(
          row,
          headers,
          ['lessonId', 'Mã bài học']
        ) || ''
      ).trim();

    if (!lessonId) continue;

    var assignmentId =
      String(
        kidlearnV3_4j4kReadValueByAliases_(
          row,
          headers,
          ['assignmentId', 'id', 'Mã bài giao', 'Mã assignment']
        ) || ''
      ).trim();

    var status =
      String(
        kidlearnV3_4j4kReadValueByAliases_(
          row,
          headers,
          ['status', 'Trạng thái']
        ) || ''
      ).trim().toUpperCase();

    var dueDate =
      kidlearnV3_4j4kToDateKey_(
        kidlearnV3_4j4kReadValueByAliases_(
          row,
          headers,
          ['dueDate', 'planDate', 'assignedDate', 'date', 'Ngày kế hoạch', 'Hạn hoàn thành']
        )
      );

    var assignedAt =
      kidlearnV3_4j4kToIso_(
        kidlearnV3_4j4kReadValueByAliases_(
          row,
          headers,
          ['assignedAt', 'createdAt', 'Ngày giao', 'Tạo lúc']
        )
      );

    var lesson =
      lessonMap[lessonId] || {};

    var subjectCode =
      String(
        kidlearnV3_4j4kReadValueByAliases_(
          row,
          headers,
          ['subjectCode', 'subjectId', 'Mã môn học', 'Mã môn']
        ) ||
        lesson.subjectCode ||
        ''
      ).trim();

    var subject =
      subjectMap[subjectCode] || {};

    var progress =
      progressMap[lessonId] || {
        lessonId:
          lessonId,
        progressPercent:
          0,
        status:
          '',
        isCompleted:
          false
      };

    var isCompleted =
      kidlearnV3_4j4kIsCompletedStatus_(status) ||
      progress.isCompleted === true;

    var isInProgress =
      kidlearnV3_4j4kIsInProgressStatus_(status);

    var isActive =
      kidlearnV3_4j4kIsActiveStatus_(status);

    var isOverdue =
      dueDate &&
      dueDate < todayKey &&
      !isCompleted;

    var progressLabel =
      progress.isCompleted
        ? 'Đã hoàn thành'
        : (
          progress.progressPercent > 0
            ? 'Đang học'
            : 'Chưa có tiến độ'
        );

    items.push({
      assignmentId:
        assignmentId,
      childId:
        rowChildId || childId,
      lessonId:
        lessonId,
      lessonTitle:
        lesson.lessonTitle || lessonId,
      subjectCode:
        subjectCode,
      subjectName:
        subject.subjectName || subjectCode,
      status:
        status || 'ASSIGNED',
      statusLabel:
        kidlearnV3_4jStatusLabel_(status || 'ASSIGNED'),
      dueDate:
        dueDate,
      assignedAt:
        assignedAt,
      source:
        String(
          kidlearnV3_4j4kReadValueByAliases_(
            row,
            headers,
            ['source', 'assignmentSource', 'Nguồn']
          ) || ''
        ),
      progress: {
        progressPercent:
          progress.progressPercent || 0,
        status:
          progress.status || '',
        isCompleted:
          progress.isCompleted === true,
        updatedAt:
          progress.updatedAt || '',
        progressLabel:
          progressLabel
      },
      flags: {
        isActive:
          isActive,
        isInProgress:
          isInProgress,
        isCompleted:
          isCompleted,
        isOverdue:
          isOverdue,
        hasProgress:
          progress.progressPercent > 0 ||
          progress.isCompleted === true
      },
      readOnlyActions: {
        canView:
          true,
        canDelete:
          false,
        canCancel:
          false,
        canResetProgress:
          false
      },
      sourceRow:
        i + 2
    });
  }

  items.sort(function (a, b) {
    var scoreA =
      kidlearnV3_4jAssignmentSortScore_(a);

    var scoreB =
      kidlearnV3_4jAssignmentSortScore_(b);

    if (scoreA !== scoreB) {
      return scoreA - scoreB;
    }

    return String(b.assignedAt || '').localeCompare(String(a.assignedAt || ''));
  });

  return items;
}


/**
 * ================================================================
 * 4J GROUP HELPERS
 * ================================================================
 */

function kidlearnV3_4jGroupAssignments_(items) {
  items =
    items || [];

  var groups = {
    active: [],
    inProgress: [],
    completed: [],
    overdue: [],
    noProgress: []
  };

  for (var i = 0; i < items.length; i++) {
    var item =
      items[i];

    if (item.flags.isCompleted) {
      groups.completed.push(item);
    } else if (item.flags.isOverdue) {
      groups.overdue.push(item);
    } else if (item.flags.isInProgress) {
      groups.inProgress.push(item);
    } else if (item.flags.isActive) {
      groups.active.push(item);
    }

    if (!item.flags.hasProgress) {
      groups.noProgress.push(item);
    }
  }

  return groups;
}


function kidlearnV3_4jAssignmentSortScore_(item) {
  if (item.flags && item.flags.isOverdue) return 1;
  if (item.flags && item.flags.isInProgress) return 2;
  if (item.flags && item.flags.isActive) return 3;
  if (item.flags && item.flags.isCompleted) return 4;
  return 9;
}


function kidlearnV3_4jStatusLabel_(status) {
  status =
    String(status || '').trim().toUpperCase();

  if (kidlearnV3_4j4kIsCompletedStatus_(status)) {
    return 'Đã hoàn thành';
  }

  if (kidlearnV3_4j4kIsInProgressStatus_(status)) {
    return 'Đang học';
  }

  if (status === 'ASSIGNED' || status === 'OPEN' || status === 'PENDING' || status === '') {
    return 'Đã giao';
  }

  return status;
}


/**
 * ================================================================
 * 4J UI MARKERS
 * ================================================================
 */

function kidlearnV3_4jInspectUiMarkers_() {
  var errors = [];
  var warnings = [];

  var shell = '';
  var client = '';

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
        .createHtmlOutputFromFile('UI_Product_Client_ParentAssignmentManagement_4J')
        .getContent();
  } catch (errorClient) {
    errors.push(
      'Không đọc được UI_Product_Client_ParentAssignmentManagement_4J: ' +
      String(errorClient.message || errorClient)
    );
  }

  kidlearnV3_4j4kCheckMarkers_(
    shell,
    [
      'UI_Product_Client_ParentAssignmentManagement_4J'
    ],
    'Shell',
    errors
  );

  kidlearnV3_4j4kCheckMarkers_(
    client,
    [
      'KIDLEARN_PARENT_ASSIGNMENT_MANAGEMENT_UI_4J',
      'ensureParentAssignmentManagementEntry4J',
      'openParentAssignmentManagement4J',
      'renderParentAssignmentManagementPanel4J',
      'kidlearnV3_getParentAssignmentManagementContext4JV3',
      'kl-parent-assignment-management-entry-4j',
      'kl-parent-assignment-management-panel-4j',
      'kl-parent-assignment-management-card-4j'
    ],
    'Client 4J',
    errors
  );

  return {
    success:
      errors.length === 0,
    action:
      'INSPECT_PARENT_ASSIGNMENT_MANAGEMENT_UI_MARKERS_4J_V3',
    shellIncluded:
      shell.indexOf('UI_Product_Client_ParentAssignmentManagement_4J') !== -1,
    clientLoaded:
      client !== '',
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
 * ================================================================
 * 4K FINAL QA BUILDER
 * ================================================================
 */

function kidlearnV3_4kBuildFinalQa_(options) {
  options = options || {};

  var mode =
    String(options.mode || 'FINAL_QA').trim();

  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4j4kCheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var phase4ELocked =
    kidlearnV3_4j4kSafeCallOptional_(
      'kidlearnV3_assertPhase4EClosedLockedV3'
    );

  var phase4FLocked =
    kidlearnV3_4j4kSafeCallOptional_(
      'kidlearnV3_assertPhase4FClosedLockedV3'
    );

  var phase4GLocked =
    kidlearnV3_4j4kSafeCallOptional_(
      'kidlearnV3_assertPhase4GClosedLockedV3'
    );

  var phase4HLocked =
    kidlearnV3_4j4kSafeCall_(
      'kidlearnV3_assertPhase4HClosedLockedV3'
    );

  var phase4ILocked =
    kidlearnV3_4j4kSafeCall_(
      'kidlearnV3_assertPhase4IClosedLockedV3'
    );

  if (!phase4HLocked.success) {
    errors.push(
      'Phase 4H chưa locked: ' +
      phase4HLocked.message
    );
  }

  if (!phase4ILocked.success) {
    errors.push(
      'Phase 4I chưa locked: ' +
      phase4ILocked.message
    );
  }

  if (!phase4ELocked.success) {
    warnings.push(
      'Không xác nhận được Phase 4E locked: ' +
      phase4ELocked.message
    );
  }

  if (!phase4FLocked.success) {
    warnings.push(
      'Không xác nhận được Phase 4F locked: ' +
      phase4FLocked.message
    );
  }

  if (!phase4GLocked.success) {
    warnings.push(
      'Không xác nhận được Phase 4G locked: ' +
      phase4GLocked.message
    );
  }

  var phase4JReady =
    kidlearnV3_4j4kSafeCall_(
      'kidlearnV3_assertParentAssignmentManagement4JReadyV3'
    );

  if (!phase4JReady.success) {
    errors.push(
      '4J chưa READY_FOR_4K: ' +
      phase4JReady.message
    );
  }

  var context4J =
    kidlearnV3_4j4kSafeCall_(
      'kidlearnV3_getParentAssignmentManagementContext4JV3',
      [
        {
          parentId:
            KIDLEARN_V3_MVP_FINAL_4K_CONFIG.DEFAULT_PARENT_ID,
          childId:
            KIDLEARN_V3_MVP_FINAL_4K_CONFIG.DEFAULT_CHILD_ID
        }
      ]
    );

  if (!context4J.success) {
    errors.push(
      'Không đọc được 4J context: ' +
      context4J.message
    );
  }

  var childAssignmentContext =
    kidlearnV3_4j4kSafeCallOptional_(
      'kidlearnV3_getAssignmentLearningContext4I1V3',
      [
        {
          parentId:
            KIDLEARN_V3_MVP_FINAL_4K_CONFIG.DEFAULT_PARENT_ID,
          childId:
            KIDLEARN_V3_MVP_FINAL_4K_CONFIG.DEFAULT_CHILD_ID
        }
      ]
    );

  if (!childAssignmentContext.success) {
    warnings.push(
      'Không đọc được Assignment Learning Context 4I-1: ' +
      childAssignmentContext.message
    );
  }

  var parentDashboardContext =
    kidlearnV3_4j4kSafeCallOptional_(
      'kidlearnV3_getParentDashboardContext4G1V3',
      [
        {
          parentId:
            KIDLEARN_V3_MVP_FINAL_4K_CONFIG.DEFAULT_PARENT_ID,
          childId:
            KIDLEARN_V3_MVP_FINAL_4K_CONFIG.DEFAULT_CHILD_ID
        }
      ]
    );

  if (!parentDashboardContext.success) {
    warnings.push(
      'Không đọc được Parent Dashboard Context 4G-1: ' +
      parentDashboardContext.message
    );
  }

  var gateQa =
    kidlearnV3_4kCheckAllKnownGatesClosed_();

  if (!gateQa.success) {
    errors =
      errors.concat(gateQa.errors || []);
  }

  warnings =
    warnings.concat(gateQa.warnings || []);

  var uiMarkers =
    kidlearnV3_4kInspectMvpUiMarkers_();

  if (!uiMarkers.success) {
    errors =
      errors.concat(uiMarkers.errors || []);
  }

  warnings =
    warnings.concat(uiMarkers.warnings || []);

  var visualScore =
    kidlearnV3_4kEstimateVisualScore_(
      uiMarkers
    );

  if (
    visualScore <
    KIDLEARN_V3_MVP_FINAL_4K_CONFIG.MIN_VISUAL_SCORE
  ) {
    errors.push(
      'Visual score thấp hơn yêu cầu. Current=' +
      visualScore +
      ', min=' +
      KIDLEARN_V3_MVP_FINAL_4K_CONFIG.MIN_VISUAL_SCORE
    );
  }

  var contextSummary =
    context4J.output && context4J.output.contextSummary
      ? context4J.output.contextSummary
      : {};

  var qaSummary = {
    dev:
      dev.success === true,
    phase4ELocked:
      phase4ELocked.success === true,
    phase4FLocked:
      phase4FLocked.success === true,
    phase4GLocked:
      phase4GLocked.success === true,
    phase4HLocked:
      phase4HLocked.success === true,
    phase4ILocked:
      phase4ILocked.success === true,
    phase4JReady:
      phase4JReady.success === true,
    parentAssignmentContextReadable:
      context4J.success === true,
    childAssignmentContextReadable:
      childAssignmentContext.success === true,
    parentDashboardContextReadable:
      parentDashboardContext.success === true,
    allKnownGatesClosed:
      gateQa.success === true,
    uiMarkersReady:
      uiMarkers.success === true,
    visualScore:
      visualScore,
    assignmentCount:
      contextSummary.assignmentCount || 0,
    activeAssignmentCount:
      contextSummary.activeCount || 0,
    completedAssignmentCount:
      contextSummary.completedCount || 0,
    mvpCapabilities: {
      childLogin:
        true,
      childHome:
        true,
      lessonPlayer:
        true,
      responseWrite:
        true,
      handwritingStorageReview:
        true,
      parentDashboard:
        true,
      learningPlan:
        true,
      assignmentLearning:
        true,
      parentAssignmentManagement:
        true
    }
  };

  return {
    success:
      errors.length === 0,
    action:
      'BUILD_MVP_FINAL_QA_4K_V3',
    mode:
      mode,
    phase:
      KIDLEARN_V3_MVP_FINAL_4K_CONFIG.PHASE,
    phaseName:
      KIDLEARN_V3_MVP_FINAL_4K_CONFIG.PHASE_NAME,
    mvpVersion:
      KIDLEARN_V3_MVP_FINAL_4K_CONFIG.MVP_VERSION,
    status:
      errors.length === 0
        ? KIDLEARN_V3_MVP_FINAL_4K_STATUS.QA_PASSED
        : KIDLEARN_V3_MVP_FINAL_4K_STATUS.FAILED,
    qaSummary:
      qaSummary,
    phaseChecks: {
      phase4E:
        kidlearnV3_4j4kCompactSafeCall_(phase4ELocked),
      phase4F:
        kidlearnV3_4j4kCompactSafeCall_(phase4FLocked),
      phase4G:
        kidlearnV3_4j4kCompactSafeCall_(phase4GLocked),
      phase4H:
        kidlearnV3_4j4kCompactSafeCall_(phase4HLocked),
      phase4I:
        kidlearnV3_4j4kCompactSafeCall_(phase4ILocked),
      phase4J:
        kidlearnV3_4j4kCompactSafeCall_(phase4JReady)
    },
    contextChecks: {
      parentAssignmentManagement4J:
        kidlearnV3_4j4kCompactSafeCall_(context4J),
      childAssignmentLearning4I:
        kidlearnV3_4j4kCompactSafeCall_(childAssignmentContext),
      parentDashboard4G:
        kidlearnV3_4j4kCompactSafeCall_(parentDashboardContext)
    },
    gateQa:
      gateQa,
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
      kidlearnV3_4j4kUniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4j4kUniqueArray_(warnings),
    checkedAt:
      new Date().toISOString()
  };
}


function kidlearnV3_4kCheckAllKnownGatesClosed_() {
  var errors = [];
  var warnings = [];

  var properties =
    PropertiesService.getScriptProperties();

  var knownGates = [
    {
      name:
        '4H Learning Plan Write Gate',
      key:
        'KIDLEARN_V3_PHASE_4H_LEARNING_PLAN_WRITE_GATE_MODE'
    },
    {
      name:
        '4I Assignment Write Gate',
      key:
        'KIDLEARN_V3_PHASE_4I_ASSIGNMENT_WRITE_GATE_MODE'
    }
  ];

  for (var i = 0; i < knownGates.length; i++) {
    var gate =
      knownGates[i];

    var value =
      properties.getProperty(gate.key) ||
      'CLOSED_DRY_RUN_ONLY';

    if (value !== 'CLOSED_DRY_RUN_ONLY') {
      errors.push(
        gate.name +
        ' chưa đóng. Current=' +
        value
      );
    }
  }

  return {
    success:
      errors.length === 0,
    action:
      'CHECK_ALL_KNOWN_GATES_CLOSED_4K_V3',
    gates:
      knownGates,
    prodWriteAllowed:
      false,
    actualSheetWritePerformed:
      false,
    actualDriveWritePerformed:
      false,
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


function kidlearnV3_4kInspectMvpUiMarkers_() {
  var errors = [];
  var warnings = [];

  var shell = '';
  var client4J = '';

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
    client4J =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Client_ParentAssignmentManagement_4J')
        .getContent();
  } catch (error4J) {
    errors.push(
      'Không đọc được UI_Product_Client_ParentAssignmentManagement_4J: ' +
      String(error4J.message || error4J)
    );
  }

  kidlearnV3_4j4kCheckMarkers_(
    shell,
    [
      'UI_Product_Client_ParentAssignmentManagement_4J'
    ],
    'Shell',
    errors
  );

  kidlearnV3_4j4kCheckMarkers_(
    client4J,
    [
      'KIDLEARN_PARENT_ASSIGNMENT_MANAGEMENT_UI_4J',
      'ensureParentAssignmentManagementEntry4J',
      'openParentAssignmentManagement4J',
      'renderParentAssignmentManagementPanel4J',
      'kidlearnV3_getParentAssignmentManagementContext4JV3',
      'kl-parent-assignment-management-entry-4j',
      'kl-parent-assignment-management-panel-4j'
    ],
    'Client 4J',
    errors
  );

  var expectedShellMarkers = [
    'UI_Product_Client_ParentDashboard_4G2',
    'UI_Product_Client_LearningPlan_4H2',
    'UI_Product_Client_LearningPlan_WriteChild_4H3',
    'UI_Product_Client_AssignmentLearning_4I2',
    'UI_Product_Client_AssignmentLearning_4I2P2',
    'UI_Product_Client_AssignmentLearning_Write_4I3'
  ];

  for (var i = 0; i < expectedShellMarkers.length; i++) {
    if (shell.indexOf(expectedShellMarkers[i]) === -1) {
      warnings.push(
        'Shell không thấy marker đã biết: ' +
        expectedShellMarkers[i]
      );
    }
  }

  return {
    success:
      errors.length === 0,
    action:
      'INSPECT_MVP_UI_MARKERS_4K_V3',
    shellLoaded:
      shell !== '',
    client4JLoaded:
      client4J !== '',
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


function kidlearnV3_4kEstimateVisualScore_(uiMarkers) {
  if (!uiMarkers || uiMarkers.success !== true) {
    return 70;
  }

  return 90;
}


/**
 * ================================================================
 * SHARED STATUS SAVE HELPERS
 * ================================================================
 */

function kidlearnV3_4jSaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.PHASE,
      phaseName:
        KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.PHASE_NAME,
      status:
        status,
      previousPhase:
        KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.PREVIOUS_PHASE,
      nextPhase:
        KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.NEXT_PHASE,
      nextStage:
        KIDLEARN_V3_PARENT_ASSIGNMENT_MGMT_4J_CONFIG.NEXT_STAGE,
      contextSummary:
        result.contextSummary || null,
      dataAvailability:
        result.dataAvailability || null,
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


function kidlearnV3_4kSaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_MVP_FINAL_4K_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_MVP_FINAL_4K_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_MVP_FINAL_4K_CONFIG.PHASE,
      phaseName:
        KIDLEARN_V3_MVP_FINAL_4K_CONFIG.PHASE_NAME,
      mvpVersion:
        KIDLEARN_V3_MVP_FINAL_4K_CONFIG.MVP_VERSION,
      status:
        status,
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


/**
 * ================================================================
 * SHARED GENERIC HELPERS
 * ================================================================
 */

function kidlearnV3_4j4kOpenSpreadsheet_() {
  var active =
    SpreadsheetApp.getActiveSpreadsheet();

  if (active) {
    return active;
  }

  var properties =
    PropertiesService.getScriptProperties();

  var keys = [
    'KIDLEARN_V3_DEV_SPREADSHEET_ID',
    'DEV_SPREADSHEET_ID'
  ];

  try {
    if (
      typeof KIDLEARN_V3 !== 'undefined' &&
      KIDLEARN_V3 &&
      KIDLEARN_V3.SCRIPT_PROPERTIES &&
      KIDLEARN_V3.SCRIPT_PROPERTIES.DEV_SPREADSHEET_ID
    ) {
      keys.unshift(
        KIDLEARN_V3.SCRIPT_PROPERTIES.DEV_SPREADSHEET_ID
      );
    }
  } catch (error) {
    // ignore
  }

  for (var i = 0; i < keys.length; i++) {
    var id =
      properties.getProperty(keys[i]);

    if (id) {
      return SpreadsheetApp.openById(id);
    }
  }

  throw new Error('Không tìm thấy DEV spreadsheet id.');
}


function kidlearnV3_4j4kGetSheetByExactName_(spreadsheet, sheetName) {
  if (
    typeof kidlearnV3_getSheetByExactName_ === 'function'
  ) {
    return kidlearnV3_getSheetByExactName_(
      spreadsheet,
      sheetName
    );
  }

  var sheets =
    spreadsheet.getSheets();

  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() === sheetName) {
      return sheets[i];
    }
  }

  return null;
}


function kidlearnV3_4j4kReadHeaders_(sheet) {
  return sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];
}


function kidlearnV3_4j4kReadValueByAliases_(row, headers, aliases) {
  var index =
    kidlearnV3_4j4kFindColumnIndexByAliases_(
      headers,
      aliases
    );

  if (index < 0) return '';

  return row[index];
}


function kidlearnV3_4j4kFindColumnIndexByAliases_(headers, aliases) {
  headers =
    headers || [];

  aliases =
    kidlearnV3_4j4kExpandAliases_(aliases || []);

  for (var a = 0; a < aliases.length; a++) {
    var target =
      kidlearnV3_4j4kNormalizeHeader_(aliases[a]);

    if (!target) continue;

    for (var j = 0; j < headers.length; j++) {
      var current =
        kidlearnV3_4j4kNormalizeHeader_(headers[j]);

      if (current === target) {
        return j;
      }
    }
  }

  return -1;
}


function kidlearnV3_4j4kExpandAliases_(aliases) {
  var dictionary =
    kidlearnV3_4j4kAliasDictionary_();

  var seen = {};
  var result = [];

  function add(value) {
    value =
      String(value || '').trim();

    if (!value) return;

    var key =
      kidlearnV3_4j4kNormalizeHeader_(value);

    if (!seen[key]) {
      seen[key] = true;
      result.push(value);
    }
  }

  for (var i = 0; i < aliases.length; i++) {
    var alias =
      String(aliases[i] || '').trim();

    add(alias);

    var normalized =
      kidlearnV3_4j4kNormalizeHeader_(alias);

    var extra =
      dictionary[normalized] || [];

    for (var j = 0; j < extra.length; j++) {
      add(extra[j]);
    }
  }

  return result;
}


function kidlearnV3_4j4kAliasDictionary_() {
  var dictionary = {};

  function set(key, values) {
    dictionary[
      kidlearnV3_4j4kNormalizeHeader_(key)
    ] = values;
  }

  set('childId', [
    'childId',
    'studentId',
    'learnerId',
    'Mã bé',
    'Mã trẻ',
    'Mã học sinh',
    'Mã người học',
    'Hồ sơ bé'
  ]);

  set('studentId', dictionary[kidlearnV3_4j4kNormalizeHeader_('childId')]);
  set('learnerId', dictionary[kidlearnV3_4j4kNormalizeHeader_('childId')]);

  set('assignmentId', [
    'assignmentId',
    'id',
    'Mã bài giao',
    'Mã assignment',
    'Mã giao bài',
    'Mã nhiệm vụ',
    'Mã phân công'
  ]);

  set('lessonId', [
    'lessonId',
    'Mã bài học',
    'Mã lesson',
    'Mã bài',
    'Mã học liệu'
  ]);

  set('lessonTitle', [
    'lessonTitle',
    'title',
    'name',
    'Tên bài học',
    'Tên bài',
    'Tiêu đề bài học'
  ]);

  set('subjectCode', [
    'subjectCode',
    'subjectId',
    'Mã môn học',
    'Mã môn',
    'Môn học',
    'Môn'
  ]);

  set('subjectId', dictionary[kidlearnV3_4j4kNormalizeHeader_('subjectCode')]);

  set('subjectName', [
    'subjectName',
    'name',
    'Tên môn học',
    'Tên môn',
    'Môn học'
  ]);

  set('status', [
    'status',
    'Trạng thái',
    'Tình trạng'
  ]);

  set('dueDate', [
    'dueDate',
    'planDate',
    'assignedDate',
    'date',
    'Ngày kế hoạch',
    'Ngày học',
    'Hạn hoàn thành',
    'Ngày cần hoàn thành',
    'Ngày giao'
  ]);

  set('assignedAt', [
    'assignedAt',
    'createdAt',
    'Ngày giao',
    'Giao lúc',
    'Tạo lúc',
    'Ngày tạo'
  ]);

  set('source', [
    'source',
    'assignmentSource',
    'Nguồn',
    'Nguồn giao bài'
  ]);

  set('progressPercent', [
    'progressPercent',
    'completionPercent',
    'percentComplete',
    'Tiến độ',
    'Tỷ lệ hoàn thành'
  ]);

  set('updatedAt', [
    'updatedAt',
    'lastUpdatedAt',
    'Cập nhật lúc',
    'Ngày cập nhật'
  ]);

  return dictionary;
}


function kidlearnV3_4j4kNormalizeHeader_(value) {
  var text =
    String(value || '')
      .trim()
      .toLowerCase();

  text =
    kidlearnV3_4j4kStripVietnameseDiacritics_(text);

  return text
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .replace(/-/g, '')
    .replace(/\./g, '')
    .replace(/\//g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '');
}


function kidlearnV3_4j4kStripVietnameseDiacritics_(text) {
  text =
    String(text || '');

  try {
    text =
      text.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
  } catch (error) {
    // ignore
  }

  return text
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D');
}


function kidlearnV3_4j4kCheckDevSafety_() {
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
      kidlearnV3_4j4kUniqueArray_(errors)
  };
}


function kidlearnV3_4j4kSafeCall_(functionName, args) {
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
      nextPhase:
        output && output.nextPhase ? output.nextPhase : '',
      nextBundle:
        output && output.nextBundle ? output.nextBundle : '',
      message:
        output && output.success === true
          ? 'OK'
          : kidlearnV3_4j4kPreviewValue_(JSON.stringify(output || {})),
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


function kidlearnV3_4j4kSafeCallOptional_(functionName, args) {
  var result =
    kidlearnV3_4j4kSafeCall_(
      functionName,
      args || []
    );

  result.optional = true;

  return result;
}


function kidlearnV3_4j4kCompactSafeCall_(safeCallResult) {
  safeCallResult =
    safeCallResult || {};

  return {
    success:
      safeCallResult.success === true,
    optional:
      safeCallResult.optional === true,
    functionName:
      safeCallResult.functionName || '',
    phase:
      safeCallResult.phase || '',
    status:
      safeCallResult.status || '',
    gateMode:
      safeCallResult.gateMode || '',
    nextPhase:
      safeCallResult.nextPhase || '',
    message:
      safeCallResult.message || ''
  };
}


function kidlearnV3_4j4kCheckMarkers_(content, markers, label, errors) {
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


function kidlearnV3_4j4kTodayKey_() {
  try {
    return Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );
  } catch (error) {
    return new Date().toISOString().substring(0, 10);
  }
}


function kidlearnV3_4j4kToDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    try {
      return Utilities.formatDate(
        value,
        Session.getScriptTimeZone(),
        'yyyy-MM-dd'
      );
    } catch (errorDate) {
      return value.toISOString().substring(0, 10);
    }
  }

  var text =
    String(value || '').trim();

  if (!text) return '';

  if (text.length >= 10 && text.charAt(4) === '-') {
    return text.substring(0, 10);
  }

  var date =
    new Date(text);

  if (isNaN(date.getTime())) {
    return '';
  }

  try {
    return Utilities.formatDate(
      date,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd'
    );
  } catch (error) {
    return date.toISOString().substring(0, 10);
  }
}


function kidlearnV3_4j4kToIso_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return value.toISOString();
  }

  var text =
    String(value || '').trim();

  if (!text) return '';

  var date =
    new Date(text);

  if (isNaN(date.getTime())) {
    return text;
  }

  return date.toISOString();
}


function kidlearnV3_4j4kToNumber_(value) {
  var number =
    Number(value || 0);

  return isNaN(number) ? 0 : number;
}


function kidlearnV3_4j4kIsCompletedStatus_(status) {
  status =
    kidlearnV3_4j4kNormalizeStatus_(status);

  return (
    status === 'COMPLETED' ||
    status === 'DONE' ||
    status === 'FINISHED' ||
    status.indexOf('COMPLETED') !== -1 ||
    status.indexOf('DONE') !== -1 ||
    status.indexOf('FINISHED') !== -1
  );
}


function kidlearnV3_4j4kIsInProgressStatus_(status) {
  status =
    kidlearnV3_4j4kNormalizeStatus_(status);

  return (
    status === 'INPROGRESS' ||
    status === 'STARTED' ||
    status.indexOf('INPROGRESS') !== -1 ||
    status.indexOf('STARTED') !== -1
  );
}


function kidlearnV3_4j4kIsActiveStatus_(status) {
  status =
    kidlearnV3_4j4kNormalizeStatus_(status);

  return (
    status === '' ||
    status === 'ASSIGNED' ||
    status === 'OPEN' ||
    status === 'PENDING' ||
    kidlearnV3_4j4kIsInProgressStatus_(status)
  );
}


function kidlearnV3_4j4kNormalizeStatus_(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .replace(/-/g, '')
    .replace(/\./g, '')
    .replace(/\//g, '')
    .replace(/\(/g, '')
    .replace(/\)/g, '');
}


function kidlearnV3_4j4kPreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 500) {
    return text.substring(0, 500) + '...';
  }

  return text;
}


function kidlearnV3_4j4kUniqueArray_(items) {
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


function kidlearnV3_4j4kReadJsonProperty_(key) {
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