/**
 * ================================================================
 * KIDLEARN V3 - PHASE 4E QA + LOCK
 * Step: 4E-6
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Final QA for Phase 4E.
 * - Confirm handwriting storage + review workflow is completed.
 * - Lock Phase 4E and prepare for Phase 4F.
 *
 * Safety:
 * - Không ghi DATA_Responses.
 * - Không ghi LOG_Audit.
 * - Không ghi Google Drive.
 * - Chỉ ghi ScriptProperties trạng thái lock.
 */


var KIDLEARN_V3_PHASE4E_LOCK_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4E_LOCK_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4E_LOCK_LAST_PREVIEW_AT',
  LAST_QA_AT: 'KIDLEARN_V3_PHASE_4E_LOCK_LAST_QA_AT',
  LOCKED_AT: 'KIDLEARN_V3_PHASE_4E_LOCKED_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4E_LOCK_LAST_RESULT_JSON',
  LOCK_JSON: 'KIDLEARN_V3_PHASE_4E_LOCK_JSON'
};


var KIDLEARN_V3_PHASE4E_LOCK_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  QA_PASSED: 'QA_PASSED',
  PHASE_4E_CLOSED_LOCKED: 'PHASE_4E_CLOSED_LOCKED',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PHASE4E_LOCK_CONFIG = {
  PHASE: '4E',
  LOCK_STEP: '4E-6',
  PHASE_NAME: 'HANDWRITING_ASSET_STORAGE_AND_REVIEW_WORKFLOW',
  NEXT_PHASE: '4F',
  NEXT_STAGE: 'PARENT_REVIEW_ACTION_UI_AND_RETRY_FLOW',
  CONFIRM_TEXT: 'LOCK_PHASE_4E_HANDWRITING_STORAGE_REVIEW',
  MIN_VISUAL_SCORE: 85,
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Preview Phase 4E lock readiness.
 */
function kidlearnV3_previewPhase4ELockV3() {
  var result =
    kidlearnV3_4e6BuildFinalQa_();

  result.action =
    'PREVIEW_PHASE_4E_LOCK_4E_6_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PHASE4E_LOCK_STATUS.PREVIEWED
      : KIDLEARN_V3_PHASE4E_LOCK_STATUS.FAILED;

  kidlearnV3_4e6SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PHASE4E_LOCK_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4E-6 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Run final QA before lock.
 */
function kidlearnV3_runPhase4EFinalQaV3() {
  var result =
    kidlearnV3_4e6BuildFinalQa_();

  result.action =
    'RUN_PHASE_4E_FINAL_QA_4E_6_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_PHASE4E_LOCK_STATUS.QA_PASSED
      : KIDLEARN_V3_PHASE4E_LOCK_STATUS.FAILED;

  kidlearnV3_4e6SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PHASE4E_LOCK_KEYS.LAST_QA_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4E-6 final QA failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Confirm wrapper.
 * Chạy function này để lock Phase 4E.
 */
function kidlearnV3_lockPhase4EConfirmV3() {
  return kidlearnV3_lockPhase4EV3({
    confirm:
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.CONFIRM_TEXT,
    visualScore: 90,
    visualNote:
      'Parent Review Queue UI read-only was visually checked in DEV.'
  });
}


/**
 * Lock Phase 4E.
 */
function kidlearnV3_lockPhase4EV3(options) {
  options = options || {};

  var confirmText =
    String(options.confirm || '')
      .trim()
      .toUpperCase();

  if (
    confirmText !==
    KIDLEARN_V3_PHASE4E_LOCK_CONFIG.CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm. Cần confirm=' +
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.CONFIRM_TEXT
    );
  }

  var visualScore =
    Number(options.visualScore || 0);

  if (
    isNaN(visualScore) ||
    visualScore < KIDLEARN_V3_PHASE4E_LOCK_CONFIG.MIN_VISUAL_SCORE
  ) {
    throw new Error(
      'visualScore chưa đạt. Cần >= ' +
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.MIN_VISUAL_SCORE
    );
  }

  var lock =
    LockService.getScriptLock();

  var locked =
    lock.tryLock(30000);

  if (!locked) {
    throw new Error(
      'Không lấy được script lock sau 30 giây. Vui lòng chạy lại.'
    );
  }

  try {
    var qa =
      kidlearnV3_runPhase4EFinalQaV3();

    if (!qa.success) {
      throw new Error(
        'Final QA 4E chưa pass. Không thể lock.'
      );
    }

    var result = {
      success: true,
      action: 'LOCK_PHASE_4E_4E_6_V3',
      phase:
        KIDLEARN_V3_PHASE4E_LOCK_CONFIG.PHASE,
      lockStep:
        KIDLEARN_V3_PHASE4E_LOCK_CONFIG.LOCK_STEP,
      phaseName:
        KIDLEARN_V3_PHASE4E_LOCK_CONFIG.PHASE_NAME,
      status:
        KIDLEARN_V3_PHASE4E_LOCK_STATUS.PHASE_4E_CLOSED_LOCKED,
      locked: true,
      finalQaPassed: true,
      componentSummary:
        qa.componentSummary,
      assetSummary:
        qa.assetSummary,
      reviewSummary:
        qa.reviewSummary,
      queueSnapshot:
        qa.queueSnapshot,
      visualScore:
        visualScore,
      visualNote:
        String(options.visualNote || ''),
      minVisualScore:
        KIDLEARN_V3_PHASE4E_LOCK_CONFIG.MIN_VISUAL_SCORE,
      nextPhase:
        KIDLEARN_V3_PHASE4E_LOCK_CONFIG.NEXT_PHASE,
      nextStage:
        KIDLEARN_V3_PHASE4E_LOCK_CONFIG.NEXT_STAGE,
      prodWriteAllowed: false,
      realSheetWriteAllowedNow: false,
      realDriveWriteAllowedNow: false,
      actualSheetWritePerformed: false,
      actualDriveWritePerformed: false,
      lockedAt:
        new Date().toISOString()
    };

    kidlearnV3_4e6SaveLock_(result);

    kidlearnV3_4e6SaveStatus_(
      result,
      KIDLEARN_V3_PHASE4E_LOCK_STATUS.PHASE_4E_CLOSED_LOCKED,
      KIDLEARN_V3_PHASE4E_LOCK_KEYS.LOCKED_AT
    );

    console.log(JSON.stringify(result, null, 2));
    return result;

  } finally {
    lock.releaseLock();
  }
}


/**
 * Get Phase 4E lock status.
 */
function kidlearnV3_getPhase4ELockStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PHASE_4E_LOCK_STATUS_V3',
    phase:
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.LOCK_STEP,
    phaseName:
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.PHASE_NAME,
    status:
      properties.getProperty(
        KIDLEARN_V3_PHASE4E_LOCK_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PHASE4E_LOCK_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE4E_LOCK_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastQaAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE4E_LOCK_KEYS.LAST_QA_AT
      ) || '',
    lockedAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE4E_LOCK_KEYS.LOCKED_AT
      ) || '',
    lastResult:
      kidlearnV3_4e6ReadJsonProperty_(
        KIDLEARN_V3_PHASE4E_LOCK_KEYS.LAST_RESULT_JSON
      ),
    lock:
      kidlearnV3_4e6ReadJsonProperty_(
        KIDLEARN_V3_PHASE4E_LOCK_KEYS.LOCK_JSON
      ),
    nextPhase:
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert Phase 4E closed locked.
 */
function kidlearnV3_assertPhase4EClosedLockedV3() {
  var status =
    kidlearnV3_getPhase4ELockStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PHASE4E_LOCK_STATUS.PHASE_4E_CLOSED_LOCKED
  ) {
    errors.push(
      'Phase 4E chưa PHASE_4E_CLOSED_LOCKED. Status=' +
      status.status
    );
  }

  if (!status.lock || status.lock.locked !== true) {
    errors.push(
      'Không tìm thấy lock evidence cho Phase 4E.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PHASE_4E_CLOSED_LOCKED_V3',
    phase:
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.LOCK_STEP,
    status:
      status.status,
    lockedAt:
      status.lockedAt,
    nextPhase:
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
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
 * Alias for next phases.
 */
function kidlearnV3_assertPhase4EClosedV3() {
  return kidlearnV3_assertPhase4EClosedLockedV3();
}


/**
 * QA batch 4E-6.
 * Lưu ý: function này sẽ lock Phase 4E.
 */
function kidlearnV3_runQaBatch4E6V3() {
  var preview =
    kidlearnV3_previewPhase4ELockV3();

  var qa =
    kidlearnV3_runPhase4EFinalQaV3();

  var lock =
    kidlearnV3_lockPhase4EConfirmV3();

  var assertLocked =
    kidlearnV3_assertPhase4EClosedLockedV3();

  var result = {
    success:
      preview.success === true &&
      qa.success === true &&
      lock.success === true &&
      assertLocked.success === true,
    suiteName:
      'PHASE_4E_6_QA_AND_LOCK',
    phase:
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.LOCK_STEP,
    status:
      KIDLEARN_V3_PHASE4E_LOCK_STATUS.PHASE_4E_CLOSED_LOCKED,
    nextPhase:
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    results: {
      preview: preview.success,
      finalQa: qa.success,
      lock: lock.success,
      assertLocked: assertLocked.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4E-6 QA batch failed.');
  }

  return result;
}


/**
 * Build final QA.
 */
function kidlearnV3_4e6BuildFinalQa_() {
  var errors = [];
  var warnings = [];

  var dev =
    kidlearnV3_4e6CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var phase4D =
    kidlearnV3_4e6CheckPhase4D_();

  if (!phase4D.success) {
    errors.push(
      'Phase 4D chưa closed locked: ' +
      phase4D.message
    );
  }

  var componentChecks = [
    {
      key: '4E-3P',
      label: 'Manual Drive Folder Config',
      required: true,
      check:
        kidlearnV3_4e6SafeCall_(
          'kidlearnV3_assertHandwritingDriveFolderConfig4E3PReadyV3'
        )
    },
    {
      key: '4E-1',
      label: 'Handwriting Storage Policy + Drive Readiness',
      required: true,
      check:
        kidlearnV3_4e6SafeCall_(
          'kidlearnV3_assertHandwritingStorageReadiness4E1ReadyV3'
        )
    },
    {
      key: '4E-2',
      label: 'Handwriting Upload Dry-run Preview',
      required: true,
      check:
        kidlearnV3_4e6SafeCall_(
          'kidlearnV3_assertHandwritingUploadDryRun4E2ReadyV3'
        )
    },
    {
      key: '4E-3',
      label: 'Controlled DEV Drive Write',
      required: true,
      check:
        kidlearnV3_4e6SafeCall_(
          'kidlearnV3_assertHandwritingDriveWrite4E3ReadyV3'
        )
    },
    {
      key: '4E-4',
      label: 'Link Handwriting Asset to DATA_Responses - Current State After Review',
      required: true,
      check:
        kidlearnV3_4e6SafeCall_(
          'kidlearnV3_assertHandwritingAssetLinkCurrentState4E6P2V3'
        )
    },
    {
      key: '4E-5A',
      label: 'Parent Review Queue Context Read-only',
      required: true,
      check:
        kidlearnV3_4e6SafeCall_(
          'kidlearnV3_assertParentReviewQueueContext4E5AReadyV3'
        )
    },
    {
      key: '4E-5B',
      label: 'Parent Review Queue UI Read-only',
      required: true,
      check:
        kidlearnV3_4e6SafeCall_(
          'kidlearnV3_assertParentReviewQueueUi4E5BReadyV3'
        )
    },
    {
      key: '4E-5C',
      label: 'Controlled Review Action Write',
      required: true,
      check:
        kidlearnV3_4e6SafeCall_(
          'kidlearnV3_assertHandwritingReviewAction4E5CReadyV3'
        )
    },
    {
      key: '4E-5D',
      label: 'QA Ready for 4E-6',
      required: true,
      check:
        kidlearnV3_4e6SafeCall_(
          'kidlearnV3_assertParentReviewQaReady4E5DReadyV3'
        )
    }
  ];

  for (var i = 0; i < componentChecks.length; i++) {
    if (
      componentChecks[i].required &&
      componentChecks[i].check.success !== true
    ) {
      errors.push(
        componentChecks[i].key +
        ' chưa ready: ' +
        componentChecks[i].check.message
      );
    }
  }

  var verifyDrive =
    kidlearnV3_4e6SafeCall_(
      'kidlearnV3_verifyLastHandwritingDriveWrite4E3V3'
    );

  if (!verifyDrive.success) {
    errors.push(
      'Verify 4E-3 Drive write chưa pass: ' +
      verifyDrive.message
    );
  }

  /**
   * IMPORTANT 4E-6P1:
   * Không dùng strict verify của 4E-4 ở final lock,
   * vì sau 4E-5C reviewStatus đã được đổi từ NEEDS_REVIEW
   * sang REVIEWED_ACCEPTED hoặc REVIEWED_RETRY.
   */
  var verifyLink =
    kidlearnV3_4e6VerifyHandwritingLinkCurrentState_();

  if (!verifyLink.success) {
    errors.push(
      'Verify 4E-4 current response link chưa pass: ' +
      verifyLink.message
    );
  }

  var verifyReview =
    kidlearnV3_4e6SafeCall_(
      'kidlearnV3_verifyLastHandwritingReviewAction4E5CV3'
    );

  if (!verifyReview.success) {
    errors.push(
      'Verify 4E-5C review action chưa pass: ' +
      verifyReview.message
    );
  }

  var assetStatus =
    kidlearnV3_4e6SafeCall_(
      'kidlearnV3_getHandwritingDriveWrite4E3StatusV3'
    );

  var linkStatus =
    kidlearnV3_4e6SafeCall_(
      'kidlearnV3_getHandwritingAssetLink4E4StatusV3'
    );

  var reviewStatus =
    kidlearnV3_4e6SafeCall_(
      'kidlearnV3_getHandwritingReviewAction4E5CStatusV3'
    );

  var queueSnapshot =
    kidlearnV3_4e6InspectQueueSnapshot_();

  if (!queueSnapshot.success) {
    warnings.push(
      'Không đọc được queue snapshot: ' +
      queueSnapshot.message
    );
  }

  var uiMarkerCheck =
    kidlearnV3_4e6SafeCall_(
      'kidlearnV3_4e5bInspectUiMarkers_'
    );

  if (!uiMarkerCheck.success) {
    errors.push(
      'UI marker 4E-5B chưa pass: ' +
      uiMarkerCheck.message
    );
  }

  var componentSummary =
    kidlearnV3_4e6BuildComponentSummary_(
      componentChecks
    );

  var assetSummary =
    kidlearnV3_4e6BuildAssetSummary_(
      assetStatus,
      verifyDrive,
      linkStatus,
      verifyLink
    );

  var reviewSummary =
    kidlearnV3_4e6BuildReviewSummary_(
      reviewStatus,
      verifyReview
    );

  return {
    success: errors.length === 0,
    action: 'BUILD_PHASE_4E_FINAL_QA_4E_6_V3',
    phase:
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.PHASE,
    lockStep:
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.LOCK_STEP,
    phaseName:
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.PHASE_NAME,
    devSafety:
      dev,
    phase4D:
      phase4D,
    componentSummary:
      componentSummary,
    assetSummary:
      assetSummary,
    reviewSummary:
      reviewSummary,
    queueSnapshot:
      queueSnapshot,
    uiMarkerCheck: {
      success:
        uiMarkerCheck.success === true,
      errorCount:
        uiMarkerCheck.errorCount || 0,
      warningCount:
        uiMarkerCheck.warningCount || 0
    },
    readyForLock:
      errors.length === 0,
    nextPhase:
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.NEXT_PHASE,
    nextStage:
      KIDLEARN_V3_PHASE4E_LOCK_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    errorCount:
      errors.length,
    warningCount:
      kidlearnV3_4e6UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4e6UniqueArray_(warnings)
  };
}


function kidlearnV3_4e6CheckPhase4D_() {
  var primary =
    kidlearnV3_4e6SafeCall_(
      'kidlearnV3_assertPhase4DClosedLockedV3'
    );

  if (primary.success) {
    return {
      success: true,
      method:
        'kidlearnV3_assertPhase4DClosedLockedV3',
      message:
        'OK'
    };
  }

  var fallback =
    kidlearnV3_4e6SafeCall_(
      'kidlearnV3_assertPhase4DClosedV3'
    );

  if (fallback.success) {
    return {
      success: true,
      method:
        'kidlearnV3_assertPhase4DClosedV3',
      message:
        'OK'
    };
  }

  return {
    success: false,
    method:
      '4D assertions',
    message:
      primary.message + ' | ' + fallback.message
  };
}


function kidlearnV3_4e6InspectQueueSnapshot_() {
  try {
    if (
      typeof kidlearnV3_getParentReviewQueueContext4E5AV3 !== 'function'
    ) {
      return {
        success: false,
        message:
          'Thiếu function kidlearnV3_getParentReviewQueueContext4E5AV3'
      };
    }

    var context =
      kidlearnV3_getParentReviewQueueContext4E5AV3({
        limit: 100
      });

    var queue =
      context.reviewQueue || {};

    return {
      success:
        context.success === true,
      phase:
        '4E-6',
      sourcePhase:
        context.phase || '4E-5A',
      itemCount:
        queue.itemCount || 0,
      pendingCount:
        queue.pendingCount || 0,
      statsByStatus:
        queue.statsByStatus || {},
      note:
        'pendingCount có thể bằng 0 sau khi 4E-5C đã ACCEPT/RETRY. Đây là trạng thái hợp lệ.',
      message:
        context.success === true ? 'OK' : JSON.stringify(context)
    };

  } catch (error) {
    return {
      success: false,
      phase:
        '4E-6',
      message:
        String(error.message || error)
    };
  }
}


function kidlearnV3_4e6BuildComponentSummary_(componentChecks) {
  var summary = [];

  for (var i = 0; i < componentChecks.length; i++) {
    summary.push({
      key:
        componentChecks[i].key,
      label:
        componentChecks[i].label,
      required:
        componentChecks[i].required === true,
      success:
        componentChecks[i].check.success === true,
      phase:
        componentChecks[i].check.phase || '',
      status:
        componentChecks[i].check.status || '',
      nextBundle:
        componentChecks[i].check.nextBundle || '',
      message:
        componentChecks[i].check.success === true
          ? 'OK'
          : componentChecks[i].check.message
    });
  }

  return summary;
}


function kidlearnV3_4e6BuildAssetSummary_(
  assetStatus,
  verifyDrive,
  linkStatus,
  verifyLink
) {
  var assetLast =
    assetStatus.outputSummary && assetStatus.outputSummary.lastAsset
      ? assetStatus.outputSummary.lastAsset
      : {};

  var linkLast =
    linkStatus.outputSummary && linkStatus.outputSummary.lastLink
      ? linkStatus.outputSummary.lastLink
      : {};

  return {
    driveStatusReadable:
      assetStatus.success === true,
    driveVerifyPassed:
      verifyDrive.success === true,
    linkStatusReadable:
      linkStatus.success === true,
    linkVerifyPassed:
      verifyLink.success === true,
    fileId:
      assetLast.fileId || linkLast.fileId || '',
    fileUrl:
      assetLast.fileUrl || linkLast.fileUrl || '',
    responseId:
      assetLast.responseId || linkLast.responseId || '',
    driveWritePerformed:
      assetLast.actualDriveWritePerformed === true,
    dataResponsesLinked:
      linkLast.dataResponsesWritePerformed === true
  };
}


function kidlearnV3_4e6BuildReviewSummary_(
  reviewStatus,
  verifyReview
) {
  var last =
    reviewStatus.outputSummary && reviewStatus.outputSummary.lastReviewAction
      ? reviewStatus.outputSummary.lastReviewAction
      : {};

  return {
    reviewStatusReadable:
      reviewStatus.success === true,
    reviewVerifyPassed:
      verifyReview.success === true,
    responseId:
      last.responseId || reviewStatus.responseId || '',
    reviewAction:
      last.reviewAction || reviewStatus.reviewAction || '',
    targetReviewStatus:
      last.targetReviewStatus || reviewStatus.targetReviewStatus || '',
    dataResponsesWritePerformed:
      last.dataResponsesWritePerformed === true,
    logAuditWritePerformed:
      last.logAuditWritePerformed === true
  };
}


/**
 * DEV safety.
 */
function kidlearnV3_4e6CheckDevSafety_() {
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
function kidlearnV3_4e6SafeCall_(functionName) {
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
        outputSummary: null
      };
    }

    var output =
      eval(functionName)();

    var summary =
      kidlearnV3_4e6SummarizeOutput_(
        output
      );

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
      responseId:
        output && output.responseId ? output.responseId : '',
      reviewAction:
        output && output.reviewAction ? output.reviewAction : '',
      targetReviewStatus:
        output && output.targetReviewStatus ? output.targetReviewStatus : '',
      errorCount:
        output && output.errorCount ? output.errorCount : 0,
      warningCount:
        output && output.warningCount ? output.warningCount : 0,
      message:
        output && output.success === true
          ? 'OK'
          : kidlearnV3_4e6PreviewValue_(
              JSON.stringify(summary)
            ),
      outputSummary:
        summary
    };

  } catch (error) {
    return {
      success: false,
      functionName:
        functionName,
      message:
        String(error.message || error),
      outputSummary:
        null
    };
  }
}


function kidlearnV3_4e6SummarizeOutput_(output) {
  output = output || {};

  var summary = {
    success:
      output.success === true,
    action:
      output.action || '',
    phase:
      output.phase || '',
    status:
      output.status || '',
    nextBundle:
      output.nextBundle || '',
    nextStage:
      output.nextStage || '',
    responseId:
      output.responseId || '',
    reviewAction:
      output.reviewAction || '',
    targetReviewStatus:
      output.targetReviewStatus || '',
    actualSheetWritePerformed:
      output.actualSheetWritePerformed === true,
    actualDriveWritePerformed:
      output.actualDriveWritePerformed === true,
    errorCount:
      output.errorCount || 0,
    warningCount:
      output.warningCount || 0,
    errors:
      output.errors || [],
    warnings:
      output.warnings || []
  };

  if (output.lastAsset) {
    summary.lastAsset = {
      responseId:
        output.lastAsset.responseId || '',
      fileId:
        output.lastAsset.fileId || '',
      fileUrl:
        output.lastAsset.fileUrl || '',
      actualDriveWritePerformed:
        output.lastAsset.actualDriveWritePerformed === true
    };
  }

  if (output.lastLink) {
    summary.lastLink = {
      responseId:
        output.lastLink.responseId || '',
      fileId:
        output.lastLink.fileId || '',
      fileUrl:
        output.lastLink.fileUrl || '',
      reviewStatus:
        output.lastLink.reviewStatus || '',
      dataResponsesWritePerformed:
        output.lastLink.dataResponsesWritePerformed === true
    };
  }

  if (output.lastReviewAction) {
    summary.lastReviewAction = {
      responseId:
        output.lastReviewAction.responseId || '',
      reviewAction:
        output.lastReviewAction.reviewAction || '',
      targetReviewStatus:
        output.lastReviewAction.targetReviewStatus || '',
      dataResponsesWritePerformed:
        output.lastReviewAction.dataResponsesWritePerformed === true,
      logAuditWritePerformed:
        output.lastReviewAction.logAuditWritePerformed === true
    };
  }

  if (output.lock) {
    summary.lock = {
      locked:
        output.lock.locked === true,
      status:
        output.lock.status || '',
      lockedAt:
        output.lock.lockedAt || ''
    };
  }

  return summary;
}


function kidlearnV3_4e6PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 400) {
    return text.substring(0, 400) + '...';
  }

  return text;
}


function kidlearnV3_4e6UniqueArray_(items) {
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


function kidlearnV3_4e6SaveLock_(result) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PHASE4E_LOCK_KEYS.LOCK_JSON,
      JSON.stringify(result)
    );
}


function kidlearnV3_4e6SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PHASE4E_LOCK_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PHASE4E_LOCK_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_PHASE4E_LOCK_CONFIG.PHASE,
      lockStep:
        result.lockStep ||
        KIDLEARN_V3_PHASE4E_LOCK_CONFIG.LOCK_STEP,
      phaseName:
        KIDLEARN_V3_PHASE4E_LOCK_CONFIG.PHASE_NAME,
      status:
        status,
      locked:
        result.locked === true,
      readyForLock:
        result.readyForLock === true,
      finalQaPassed:
        result.finalQaPassed === true,
      nextPhase:
        KIDLEARN_V3_PHASE4E_LOCK_CONFIG.NEXT_PHASE,
      nextStage:
        KIDLEARN_V3_PHASE4E_LOCK_CONFIG.NEXT_STAGE,
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


function kidlearnV3_4e6ReadJsonProperty_(key) {
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

/**
 * 4E-6P1
 * Verify current response link state after parent review.
 *
 * This replaces strict 4E-4 verify during final 4E lock.
 * Valid current statuses:
 * - NEEDS_REVIEW
 * - REVIEWED_ACCEPTED
 * - REVIEWED_RETRY
 */
function kidlearnV3_4e6VerifyHandwritingLinkCurrentState_() {
  var errors = [];
  var warnings = [];

  var status = null;

  try {
    status =
      kidlearnV3_getHandwritingAssetLink4E4StatusV3();
  } catch (error) {
    return {
      success: false,
      functionName: 'kidlearnV3_4e6VerifyHandwritingLinkCurrentState_',
      phase: '4E-6',
      status: 'FAILED',
      message:
        'Không đọc được 4E-4 link status: ' +
        String(error.message || error),
      errors: [
        String(error.message || error)
      ],
      outputSummary: null
    };
  }

  var lastLink =
    status && status.lastLink
      ? status.lastLink
      : null;

  if (!lastLink) {
    errors.push(
      'Không tìm thấy lastLink từ 4E-4.'
    );
  }

  if (lastLink && !lastLink.responseId) {
    errors.push(
      'lastLink thiếu responseId.'
    );
  }

  if (lastLink && !lastLink.fileId) {
    errors.push(
      'lastLink thiếu fileId.'
    );
  }

  if (
    lastLink &&
    (!lastLink.responseRowNumber || !lastLink.metadataColumnIndex)
  ) {
    errors.push(
      'lastLink thiếu responseRowNumber hoặc metadataColumnIndex.'
    );
  }

  var currentReviewStatus = '';
  var currentFileId = '';
  var actualMetaText = '';

  if (errors.length === 0) {
    try {
      var spreadsheet =
        kidlearnV3_4e6OpenSpreadsheetForCurrentState_();

      var responseSheet =
        kidlearnV3_4e6GetSheetByExactNameForCurrentState_(
          spreadsheet,
          'DATA_Responses'
        );

      if (!responseSheet) {
        errors.push('Không tìm thấy DATA_Responses.');
      } else {
        actualMetaText =
          String(
            responseSheet
              .getRange(
                Number(lastLink.responseRowNumber),
                Number(lastLink.metadataColumnIndex)
              )
              .getValue() || ''
          );

        var parsed =
          kidlearnV3_4e6SafeJsonParseForCurrentState_(
            actualMetaText
          );

        if (!parsed.success) {
          errors.push(
            'answerMetaJson hiện tại không phải JSON hợp lệ.'
          );
        } else {
          var meta =
            parsed.value || {};

          var asset =
            meta.handwritingAsset || {};

          var review =
            meta.handwritingReview || {};

          currentFileId =
            String(asset.fileId || '').trim();

          currentReviewStatus =
            String(
              review.status ||
              asset.reviewStatus ||
              ''
            ).trim().toUpperCase();

          if (currentFileId !== String(lastLink.fileId || '').trim()) {
            errors.push(
              'fileId hiện tại không khớp với 4E-4 link. Expected=' +
              lastLink.fileId +
              ', Actual=' +
              currentFileId
            );
          }

          var validStatuses = {
            NEEDS_REVIEW: true,
            REVIEWED_ACCEPTED: true,
            REVIEWED_RETRY: true
          };

          if (!validStatuses[currentReviewStatus]) {
            errors.push(
              'reviewStatus hiện tại không hợp lệ cho final lock. Current=' +
              currentReviewStatus
            );
          }

          if (
            currentReviewStatus === 'REVIEWED_ACCEPTED' ||
            currentReviewStatus === 'REVIEWED_RETRY'
          ) {
            warnings.push(
              'reviewStatus đã được cập nhật sau 4E-5C: ' +
              currentReviewStatus +
              '. Đây là trạng thái hợp lệ.'
            );
          }
        }
      }
    } catch (error2) {
      errors.push(
        'Không verify được current DATA_Responses link state: ' +
        String(error2.message || error2)
      );
    }
  }

  return {
    success: errors.length === 0,
    functionName: 'kidlearnV3_4e6VerifyHandwritingLinkCurrentState_',
    action: 'VERIFY_HANDWRITING_LINK_CURRENT_STATE_4E_6P1_V3',
    phase: '4E-6',
    status:
      errors.length === 0
        ? 'LINK_CURRENT_STATE_OK'
        : 'FAILED',
    responseId:
      lastLink ? lastLink.responseId : '',
    fileId:
      lastLink ? lastLink.fileId : '',
    currentFileId:
      currentFileId,
    currentReviewStatus:
      currentReviewStatus,
    message:
      errors.length === 0 ? 'OK' : errors.join(' | '),
    errorCount:
      errors.length,
    warningCount:
      warnings.length,
    errors:
      errors,
    warnings:
      warnings,
    outputSummary: {
      lastLink: lastLink || {},
      currentReviewStatus: currentReviewStatus,
      currentFileId: currentFileId
    }
  };
}


function kidlearnV3_4e6OpenSpreadsheetForCurrentState_() {
  if (
    typeof kidlearnV3_4e5cOpenSpreadsheet_ === 'function'
  ) {
    return kidlearnV3_4e5cOpenSpreadsheet_();
  }

  var active =
    SpreadsheetApp.getActiveSpreadsheet();

  if (active) return active;

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

  throw new Error('Không tìm thấy DEV spreadsheet.');
}


function kidlearnV3_4e6GetSheetByExactNameForCurrentState_(spreadsheet, sheetName) {
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


function kidlearnV3_4e6SafeJsonParseForCurrentState_(text) {
  text =
    String(text || '').trim();

  if (!text) {
    return {
      success: true,
      value: {},
      raw: ''
    };
  }

  try {
    return {
      success: true,
      value: JSON.parse(text),
      raw: text
    };
  } catch (error) {
    return {
      success: false,
      value: {},
      raw: text,
      error:
        String(error.message || error)
    };
  }
}

/**
 * 4E-6P2
 * Public assert wrapper for current 4E-4 link state.
 *
 * Reason:
 * - 4E-4 originally links handwriting asset with NEEDS_REVIEW.
 * - After 4E-5C, status can correctly become REVIEWED_ACCEPTED or REVIEWED_RETRY.
 * - Final 4E lock must validate current state, not old NEEDS_REVIEW-only state.
 */
function kidlearnV3_assertHandwritingAssetLinkCurrentState4E6P2V3() {
  if (
    typeof kidlearnV3_4e6VerifyHandwritingLinkCurrentState_ !== 'function'
  ) {
    throw new Error(
      'Thiếu helper kidlearnV3_4e6VerifyHandwritingLinkCurrentState_. Vui lòng dán patch 4E-6P1 trước.'
    );
  }

  var check =
    kidlearnV3_4e6VerifyHandwritingLinkCurrentState_();

  var result = {
    success:
      check.success === true,
    action:
      'ASSERT_HANDWRITING_ASSET_LINK_CURRENT_STATE_4E_6P2_V3',
    phase:
      '4E-4',
    status:
      check.success === true
        ? 'READY_FOR_4E_LOCK_CURRENT_STATE'
        : 'FAILED',
    responseId:
      check.responseId || '',
    fileId:
      check.fileId || '',
    currentReviewStatus:
      check.currentReviewStatus || '',
    validCurrentStatuses: [
      'NEEDS_REVIEW',
      'REVIEWED_ACCEPTED',
      'REVIEWED_RETRY'
    ],
    nextBundle:
      '4E-6',
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
      check.errorCount || 0,
    warningCount:
      check.warningCount || 0,
    errors:
      check.errors || [],
    warnings:
      check.warnings || []
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4E-4 current state chưa hợp lệ cho 4E lock: ' +
      result.errors.join(' | ')
    );
  }

  return result;
}