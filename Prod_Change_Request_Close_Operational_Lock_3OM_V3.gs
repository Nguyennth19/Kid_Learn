/**
 * ================================================================
 * KIDLEARN V3 - PROD CHANGE REQUEST CLOSE AND OPERATIONAL LOCK
 * Bundle: 3O-M
 * Version: 3.1.0
 * ================================================================
 *
 * 3O-M:
 * - Đóng chuỗi PROD change request sau 3O-L.
 * - Operational lock: PROD remains read-only.
 * - Không ghi thêm vào PROD.
 * - Không execute selected request.
 * - Không mở PROD write.
 * - Không migration.
 * - Không rollback.
 * - Không tạo/xóa sheet.
 * - Chỉ ghi ScriptProperties trong DEV script để lưu lock/status.
 */


var KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3OM_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3OM_LAST_PREVIEW_AT',
  LAST_CLOSE_REVIEW_AT: 'KIDLEARN_V3_PHASE_3OM_LAST_CLOSE_REVIEW_AT',
  LAST_LOCK_PACKAGE_AT: 'KIDLEARN_V3_PHASE_3OM_LAST_LOCK_PACKAGE_AT',
  LAST_LOCK_AT: 'KIDLEARN_V3_PHASE_3OM_LAST_LOCK_AT',
  LAST_CLOSED_AT: 'KIDLEARN_V3_PHASE_3OM_LAST_CLOSED_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3OM_LAST_RESULT_JSON',
  LAST_CLOSE_REVIEW_JSON: 'KIDLEARN_V3_PHASE_3OM_LAST_CLOSE_REVIEW_JSON',
  LAST_LOCK_PACKAGE_JSON: 'KIDLEARN_V3_PHASE_3OM_LAST_LOCK_PACKAGE_JSON',
  LAST_LOCK_JSON: 'KIDLEARN_V3_PHASE_3OM_LAST_LOCK_JSON',
  CLOSE_REVIEW_ID: 'KIDLEARN_V3_PHASE_3OM_CLOSE_REVIEW_ID',
  OPERATIONAL_LOCK_ID: 'KIDLEARN_V3_PHASE_3OM_OPERATIONAL_LOCK_ID'
};


var KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  CLOSE_REVIEW_PASSED: 'CLOSE_REVIEW_PASSED',
  LOCK_PACKAGE_GENERATED: 'LOCK_PACKAGE_GENERATED',
  OPERATIONAL_LOCK_RECORDED: 'OPERATIONAL_LOCK_RECORDED',
  CLOSED_LOCKED: 'CLOSED_LOCKED',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG = {
  VERSION: '3O-M',
  PHASE: '3O-M',
  NEXT_BUNDLE: 'OPERATIONAL_MONITORING',
  NEXT_STAGE: 'PROD_READ_ONLY_OPERATIONAL_MONITORING',
  WRITE_MODE: 'CLOSE_AND_OPERATIONAL_LOCK_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  SELECTED_REQUEST_EXECUTION_ALLOWED: false,
  CONFIRM_TEXT: 'LOCK_PROD_CHANGE_REQUEST_CHAIN_3O_M',
  FINAL_STATUS: 'CLOSED_LOCKED',
  FINAL_OPERATIONAL_MODE: 'PROD_READ_ONLY_LOCKED_WITH_HISTORICAL_AUDIT_TRIAL_ROW',
  RELEASE_DECISION_EXPECTED: 'CONTROLLED_AUDIT_TRIAL_ACCEPTED_NO_SELECTED_DATA_EXECUTION'
};


/**
 * Preview 3O-M.
 */
function kidlearnV3_previewProdChangeRequestCloseOperationalLock3OMV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3omCheckFunctions_([
      'kidlearnV3_assertProdSelectedCRPostTrialValidation3OLReadyV3',
      'kidlearnV3_getProdSelectedCRPostTrialValidation3OLStatusV3',
      'kidlearnV3_getProdSelectedCRControlledExecutionTrial3OKStatusV3',
      'kidlearnV3_getProdSelectedCRFinalExecutionApproval3OJStatusV3',
      'kidlearnV3_getProdSelectedChangeRequestExecutionPackage3OIStatusV3',
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3OL =
    kidlearnV3_3omSafeAssert_(
      'kidlearnV3_assertProdSelectedCRPostTrialValidation3OLReadyV3',
      '3O-L'
    );

  if (!phase3OL.success) {
    errors.push(
      '3O-L chưa READY_FOR_3O_M: ' +
      phase3OL.message
    );
  }

  var postTrial =
    kidlearnV3_3omGetPostTrialInfo_();

  if (postTrial.status !== 'READY_FOR_3O_M') {
    errors.push(
      '3O-L status chưa READY_FOR_3O_M. Status=' +
      postTrial.status
    );
  }

  if (
    postTrial.releaseDecision !==
    KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.RELEASE_DECISION_EXPECTED
  ) {
    errors.push(
      'Release decision từ 3O-L không đúng. Expected=' +
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.RELEASE_DECISION_EXPECTED +
      ', Actual=' +
      postTrial.releaseDecision
    );
  }

  if (!postTrial.controlledTrialId) {
    errors.push('Thiếu controlledTrialId từ 3O-K/3O-L.');
  }

  if (!postTrial.auditId) {
    errors.push('Thiếu auditId từ 3O-K/3O-L.');
  }

  if (postTrial.selectedRequestExecutedNow === true) {
    errors.push('Selected request không được execute trong chain này.');
  }

  if (postTrial.selectedDataChangedNow === true) {
    errors.push('Selected data không được changed trong chain này.');
  }

  if (postTrial.fullProdWritePolicyOpenedNow === true) {
    errors.push('Full PROD write policy không được opened trong chain này.');
  }

  var finalLock =
    kidlearnV3_3omSafeCall_(
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3'
    );

  if (
    finalLock.summary.status &&
    finalLock.summary.status !== 'PROD_RELEASE_LOCKED'
  ) {
    errors.push(
      '3N-J chưa PROD_RELEASE_LOCKED. Status=' +
      finalLock.summary.status
    );
  }

  var prodInfo =
    kidlearnV3_3omGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodCheck =
    kidlearnV3_3omCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file chưa accessible: ' +
      prodCheck.message
    );
  }

  var auditRowCheck =
    kidlearnV3_3omFindAuditTrialRow_(
      prodInfo.prodFileId,
      postTrial.controlledTrialId,
      postTrial.auditId
    );

  if (!auditRowCheck.success) {
    errors.push(
      'Không tìm thấy audit trial row khi preview close 3O-M: ' +
      auditRowCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3omCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_CHANGE_REQUEST_CLOSE_OPERATIONAL_LOCK_3OM_V3',
    bundle: '3O-M',
    phase: KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.WRITE_MODE,
    confirmText:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.CONFIRM_TEXT,
    finalOperationalMode:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.FINAL_OPERATIONAL_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    selectedRequestExecutionAllowed: false,
    selectedRequestExecutedNow: false,
    selectedDataChangedNow: false,
    fullProdWritePolicyOpenedNow: false,
    migrationExecutedNow: false,
    rollbackExecutedNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3OL: phase3OL,
    postTrial: postTrial,
    finalLock: finalLock.summary,
    prodInfo: prodInfo,
    prodCheck: prodCheck,
    auditRowCheck: auditRowCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3O-M chỉ close và operational lock. Không ghi thêm vào PROD.'
  };

  kidlearnV3_3omSaveResult_(
    result,
    KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Run close review.
 *
 * Không ghi PROD.
 */
function kidlearnV3_runProdChangeRequestCloseReview3OMV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdChangeRequestCloseOperationalLock3OMV3();

  if (!preview.success) {
    throw new Error(
      'Không thể run close review 3O-M vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var closeReviewId =
    kidlearnV3_3omMakeCloseReviewId_();

  var prodInfo =
    kidlearnV3_3omGetProdInfo_();

  var postTrial =
    kidlearnV3_3omGetPostTrialInfo_();

  var status3OL =
    kidlearnV3_3omSafeCall_(
      'kidlearnV3_getProdSelectedCRPostTrialValidation3OLStatusV3'
    );

  var status3OK =
    kidlearnV3_3omSafeCall_(
      'kidlearnV3_getProdSelectedCRControlledExecutionTrial3OKStatusV3'
    );

  var status3OJ =
    kidlearnV3_3omSafeCall_(
      'kidlearnV3_getProdSelectedCRFinalExecutionApproval3OJStatusV3'
    );

  var status3OI =
    kidlearnV3_3omSafeCall_(
      'kidlearnV3_getProdSelectedChangeRequestExecutionPackage3OIStatusV3'
    );

  var finalLock =
    kidlearnV3_3omSafeCall_(
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3'
    );

  var auditRowCheck =
    kidlearnV3_3omFindAuditTrialRow_(
      prodInfo.prodFileId,
      postTrial.controlledTrialId,
      postTrial.auditId
    );

  if (!auditRowCheck.success) {
    errors.push(
      'Không tìm thấy audit trial row khi close review: ' +
      auditRowCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3omCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var closeChecklist =
    kidlearnV3_3omBuildCloseChecklist_(
      postTrial,
      auditRowCheck,
      safeModes,
      finalLock
    );

  errors = errors.concat(closeChecklist.errors);
  warnings = warnings.concat(closeChecklist.warnings);

  var finishedAt = new Date();

  var review = {
    success: errors.length === 0,
    action: 'RUN_PROD_CHANGE_REQUEST_CLOSE_REVIEW_3OM_V3',
    bundle: '3O-M',
    phase: KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.CLOSE_REVIEW_PASSED
        : KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.FAILED,
    closeReviewId: closeReviewId,
    controlledTrialId: postTrial.controlledTrialId || '',
    auditId: postTrial.auditId || '',
    executionPackageId: postTrial.executionPackageId || '',
    selectedRequestId: postTrial.selectedRequestId || '',
    selectedRequestType: postTrial.selectedRequestType || '',
    releaseDecision:
      postTrial.releaseDecision || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    selectedRequestExecutionAllowed: false,
    selectedRequestExecutedNow: false,
    selectedDataChangedNow: false,
    fullProdWritePolicyOpenedNow: false,
    migrationExecutedNow: false,
    rollbackExecutedNow: false,

    upstreamStatus: {
      phase3OL: status3OL.summary,
      phase3OK: status3OK.summary,
      phase3OJ: status3OJ.summary,
      phase3OI: status3OI.summary,
      finalLock3NJ: finalLock.summary
    },

    closeChecklist: closeChecklist.items,
    auditRowCheck: auditRowCheck,
    safeModes: safeModes.summary,

    closeRecommendation:
      errors.length === 0
        ? 'READY_TO_GENERATE_OPERATIONAL_LOCK_PACKAGE'
        : 'HOLD_CLOSE_REVIEW_FAILED',

    noSideEffectAt3OMReview: {
      prodFileModifiedBy3OMReview: false,
      prodDataWrittenBy3OMReview: false,
      prodSheetCreatedBy3OMReview: false,
      prodSheetDeletedBy3OMReview: false,
      selectedRequestExecutedBy3OMReview: false,
      prodWritePolicyOpenedBy3OMReview: false,
      rollbackExecutedBy3OMReview: false
    },

    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() - startedAt.getTime(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_3omSaveCloseReview_(
    review
  );

  kidlearnV3_3omSaveResult_(
    review,
    review.success
      ? KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.CLOSE_REVIEW_PASSED
      : KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.FAILED,
    KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.LAST_CLOSE_REVIEW_AT
  );

  console.log(JSON.stringify(review, null, 2));

  if (!review.success) {
    throw new Error(
      '3O-M close review failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return review;
}


/**
 * Generate operational lock package.
 *
 * Không ghi PROD.
 */
function kidlearnV3_generateProdChangeRequestOperationalLockPackage3OMV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var status =
    kidlearnV3_getProdChangeRequestCloseOperationalLock3OMStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.CLOSE_REVIEW_PASSED &&
    status.status !== KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.LOCK_PACKAGE_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.OPERATIONAL_LOCK_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.CLOSED_LOCKED
  ) {
    errors.push(
      '3O-M cần CLOSE_REVIEW_PASSED trước khi generate lock package. Status=' +
      status.status
    );
  }

  if (
    !status.lastCloseReview ||
    status.lastCloseReview.success !== true
  ) {
    errors.push(
      'Last close review chưa success=true.'
    );
  }

  var operationalLockId =
    status.operationalLockId ||
    kidlearnV3_3omMakeOperationalLockId_();

  var prodInfo =
    kidlearnV3_3omGetProdInfo_();

  var prodCheck =
    kidlearnV3_3omCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi generate operational lock package: ' +
      prodCheck.message
    );
  }

  var postTrial =
    kidlearnV3_3omGetPostTrialInfo_();

  var safeModes =
    kidlearnV3_3omCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var lockPolicy =
    kidlearnV3_3omBuildOperationalLockPolicy_(
      postTrial
    );

  var finishedAt = new Date();

  var lockPackage = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_CHANGE_REQUEST_OPERATIONAL_LOCK_PACKAGE_3OM_V3',
    bundle: '3O-M',
    phase: KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.LOCK_PACKAGE_GENERATED
        : KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.FAILED,
    closeReviewId: status.closeReviewId || '',
    operationalLockId: operationalLockId,
    controlledTrialId: postTrial.controlledTrialId || '',
    auditId: postTrial.auditId || '',
    executionPackageId: postTrial.executionPackageId || '',
    selectedRequestId: postTrial.selectedRequestId || '',
    selectedRequestType: postTrial.selectedRequestType || '',
    confirmText:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.CONFIRM_TEXT,
    finalOperationalMode:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.FINAL_OPERATIONAL_MODE,
    releaseDecision:
      postTrial.releaseDecision || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    selectedRequestExecutionAllowed: false,
    selectedRequestExecutedNow: false,
    selectedDataChangedNow: false,
    fullProdWritePolicyOpenedNow: false,
    migrationExecutedNow: false,
    rollbackExecutedNow: false,

    prodReference: {
      prodFileId: prodInfo.prodFileId || '',
      prodFileUrl: prodInfo.prodFileUrl || '',
      prodFileName: prodInfo.prodFileName || '',
      deploymentId: prodInfo.deploymentId || '',
      accessible: prodCheck.success
    },

    lockPolicy: lockPolicy,

    lockChecklist: [
      {
        item: '3O-L ready',
        passed:
          postTrial.status === 'READY_FOR_3O_M'
      },
      {
        item: 'Release decision accepted audit-only trial',
        passed:
          postTrial.releaseDecision ===
          KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.RELEASE_DECISION_EXPECTED
      },
      {
        item: 'Controlled trial ID exists',
        passed:
          postTrial.controlledTrialId ? true : false
      },
      {
        item: 'Audit ID exists',
        passed:
          postTrial.auditId ? true : false
      },
      {
        item: 'Selected request not executed',
        passed:
          postTrial.selectedRequestExecutedNow !== true
      },
      {
        item: 'Selected data not changed',
        passed:
          postTrial.selectedDataChangedNow !== true
      },
      {
        item: 'Full PROD write not opened',
        passed:
          postTrial.fullProdWritePolicyOpenedNow !== true
      },
      {
        item: 'PROD file accessible',
        passed:
          prodCheck.success
      },
      {
        item: 'Safe Write remains DRY_RUN/enabled=false',
        passed:
          safeModes.summary.safeWriteMode === 'DRY_RUN' &&
          safeModes.summary.safeWriteEnabled === false
      }
    ],

    noSideEffectAt3OMPackage: {
      prodFileModifiedBy3OMPackage: false,
      prodDataWrittenBy3OMPackage: false,
      prodSheetCreatedBy3OMPackage: false,
      prodSheetDeletedBy3OMPackage: false,
      selectedRequestExecutedBy3OMPackage: false,
      prodWritePolicyOpenedBy3OMPackage: false,
      rollbackExecutedBy3OMPackage: false
    },

    safeModes: safeModes.summary,

    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() - startedAt.getTime(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_3omSaveLockPackage_(
    lockPackage
  );

  kidlearnV3_3omSaveResult_(
    lockPackage,
    lockPackage.success
      ? KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.LOCK_PACKAGE_GENERATED
      : KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.FAILED,
    KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.LAST_LOCK_PACKAGE_AT
  );

  console.log(JSON.stringify(lockPackage, null, 2));

  if (!lockPackage.success) {
    throw new Error(
      '3O-M operational lock package failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return lockPackage;
}


/**
 * Manual confirm wrapper.
 *
 * Không dùng Session.getActiveUser để tránh thêm OAuth scope.
 * Không ghi PROD.
 */
function kidlearnV3_recordProdChangeRequestOperationalLock3OMManualConfirmV3() {
  return kidlearnV3_recordProdChangeRequestOperationalLock3OMV3({
    confirmText:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.CONFIRM_TEXT,
    lockedBy: 'DEV_OPERATIONAL_LOCK_MANAGER_MANUAL_3OM',
    lockNote:
      '3O-M operational lock recorded. PROD remains read-only. No selected request execution.'
  });
}


/**
 * Record operational lock.
 *
 * options:
 * {
 *   confirmText: 'LOCK_PROD_CHANGE_REQUEST_CHAIN_3O_M',
 *   lockedBy: '...',
 *   lockNote: '...'
 * }
 */
function kidlearnV3_recordProdChangeRequestOperationalLock3OMV3(options) {
  var req =
    kidlearnV3_3omNormalizeOptions_(options);

  var errors = [];
  var warnings = [];

  if (
    String(req.confirmText || '') !==
    KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.CONFIRM_TEXT
  ) {
    errors.push(
      'Confirm text không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.CONFIRM_TEXT
    );
  }

  var status =
    kidlearnV3_getProdChangeRequestCloseOperationalLock3OMStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.LOCK_PACKAGE_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.OPERATIONAL_LOCK_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.CLOSED_LOCKED
  ) {
    errors.push(
      '3O-M chưa LOCK_PACKAGE_GENERATED. Status=' +
      status.status
    );
  }

  if (
    !status.lastLockPackage ||
    status.lastLockPackage.success !== true
  ) {
    errors.push(
      'Last operational lock package chưa success=true.'
    );
  }

  var prodInfo =
    kidlearnV3_3omGetProdInfo_();

  var prodCheck =
    kidlearnV3_3omCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi record operational lock: ' +
      prodCheck.message
    );
  }

  var postTrial =
    kidlearnV3_3omGetPostTrialInfo_();

  if (postTrial.selectedRequestExecutedNow === true) {
    errors.push('Không thể lock vì selectedRequestExecutedNow=true.');
  }

  if (postTrial.selectedDataChangedNow === true) {
    errors.push('Không thể lock vì selectedDataChangedNow=true.');
  }

  if (postTrial.fullProdWritePolicyOpenedNow === true) {
    errors.push('Không thể lock vì fullProdWritePolicyOpenedNow=true.');
  }

  var safeModes =
    kidlearnV3_3omCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  if (errors.length > 0) {
    var failed = {
      success: false,
      action: 'RECORD_PROD_CHANGE_REQUEST_OPERATIONAL_LOCK_3OM_V3',
      bundle: '3O-M',
      phase: KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.PHASE,
      status: status.status,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
      selectedRequestExecutionAllowed: false,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors: errors,
      warnings: warnings
    };

    console.log(JSON.stringify(failed, null, 2));

    throw new Error(
      'Không thể record operational lock 3O-M. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var operationalLockId =
    status.operationalLockId ||
    kidlearnV3_3omMakeOperationalLockId_();

  var lock = {
    success: true,
    action: 'RECORD_PROD_CHANGE_REQUEST_OPERATIONAL_LOCK_3OM_V3',
    bundle: '3O-M',
    phase: KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.OPERATIONAL_LOCK_RECORDED,
    closeReviewId: status.closeReviewId || '',
    operationalLockId: operationalLockId,
    controlledTrialId: postTrial.controlledTrialId || '',
    auditId: postTrial.auditId || '',
    executionPackageId: postTrial.executionPackageId || '',
    selectedRequestId: postTrial.selectedRequestId || '',
    selectedRequestType: postTrial.selectedRequestType || '',
    releaseDecision:
      postTrial.releaseDecision || '',
    lockedBy:
      req.lockedBy || 'DEV_OPERATIONAL_LOCK_MANAGER_MANUAL_3OM',
    lockNote:
      req.lockNote || '',
    finalOperationalMode:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.FINAL_OPERATIONAL_MODE,
    lockMeaning:
      'Operational lock recorded. Chain may proceed to CLOSED_LOCKED. PROD remains read-only except historical audit row from 3O-K.',
    nextBundle:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    selectedRequestExecutionAllowed: false,
    selectedRequestExecutedNow: false,
    selectedDataChangedNow: false,
    fullProdWritePolicyOpenedNow: false,
    migrationExecutedNow: false,
    rollbackExecutedNow: false,
    safeModes: safeModes.summary,
    recordedAt:
      new Date().toISOString(),
    warningCount: warnings.length,
    warnings: warnings
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.OPERATIONAL_LOCK_ID,
    operationalLockId
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.LAST_LOCK_JSON,
    JSON.stringify(lock)
  );

  kidlearnV3_3omSaveResult_(
    lock,
    KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.OPERATIONAL_LOCK_RECORDED,
    KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.LAST_LOCK_AT
  );

  console.log(JSON.stringify(lock, null, 2));

  return lock;
}


/**
 * Close chain.
 *
 * Không ghi PROD.
 */
function kidlearnV3_closeProdChangeRequestChain3OMV3() {
  var status =
    kidlearnV3_getProdChangeRequestCloseOperationalLock3OMStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.OPERATIONAL_LOCK_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.CLOSED_LOCKED
  ) {
    errors.push(
      '3O-M chưa OPERATIONAL_LOCK_RECORDED. Status=' +
      status.status
    );
  }

  if (
    !status.lastLock ||
    status.lastLock.success !== true
  ) {
    errors.push(
      'Last operational lock chưa success=true.'
    );
  }

  if (!status.operationalLockId) {
    errors.push('Thiếu operationalLockId.');
  }

  if (!status.closeReviewId) {
    errors.push('Thiếu closeReviewId.');
  }

  var postTrial =
    kidlearnV3_3omGetPostTrialInfo_();

  if (!postTrial.controlledTrialId) {
    errors.push('Thiếu controlledTrialId.');
  }

  if (!postTrial.auditId) {
    errors.push('Thiếu auditId.');
  }

  var prodInfo =
    kidlearnV3_3omGetProdInfo_();

  var prodCheck =
    kidlearnV3_3omCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi close chain: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3omCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể close 3O-M. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'CLOSE_PROD_CHANGE_REQUEST_CHAIN_3OM_V3',
    bundle: '3O-M',
    phase: KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.CLOSED_LOCKED,
    closeReviewId: status.closeReviewId || '',
    operationalLockId: status.operationalLockId || '',
    controlledTrialId: postTrial.controlledTrialId || '',
    auditId: postTrial.auditId || '',
    executionPackageId: postTrial.executionPackageId || '',
    selectedRequestId: postTrial.selectedRequestId || '',
    selectedRequestType: postTrial.selectedRequestType || '',
    releaseDecision:
      postTrial.releaseDecision || '',
    finalOperationalMode:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.FINAL_OPERATIONAL_MODE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    selectedRequestExecutionAllowed: false,
    selectedRequestExecutedNow: false,
    selectedDataChangedNow: false,
    fullProdWritePolicyOpenedNow: false,
    migrationExecutedNow: false,
    rollbackExecutedNow: false,
    message:
      '3O-M CLOSED_LOCKED. PROD change request chain is closed. PROD remains read-only with historical audit row from 3O-K.',
    closedAt:
      new Date().toISOString()
  };

  kidlearnV3_3omSaveResult_(
    result,
    KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.CLOSED_LOCKED,
    KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.LAST_CLOSED_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3O-M status.
 */
function kidlearnV3_getProdChangeRequestCloseOperationalLock3OMStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_CHANGE_REQUEST_CLOSE_OPERATIONAL_LOCK_3OM_STATUS_V3',
    bundle: '3O-M',
    phase: KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.NOT_RUN,
    closeReviewId:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.CLOSE_REVIEW_ID
      ) ||
      '',
    operationalLockId:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.OPERATIONAL_LOCK_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastCloseReviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.LAST_CLOSE_REVIEW_AT
      ) ||
      '',
    lastLockPackageAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.LAST_LOCK_PACKAGE_AT
      ) ||
      '',
    lastLockAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.LAST_LOCK_AT
      ) ||
      '',
    lastClosedAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.LAST_CLOSED_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3omReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.LAST_RESULT_JSON
      ),
    lastCloseReview:
      kidlearnV3_3omReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.LAST_CLOSE_REVIEW_JSON
      ),
    lastLockPackage:
      kidlearnV3_3omReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.LAST_LOCK_PACKAGE_JSON
      ),
    lastLock:
      kidlearnV3_3omReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.LAST_LOCK_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3O-M closed.
 */
function kidlearnV3_assertProdChangeRequestCloseOperationalLock3OMClosedV3() {
  var status =
    kidlearnV3_getProdChangeRequestCloseOperationalLock3OMStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.CLOSED_LOCKED
  ) {
    errors.push(
      '3O-M chưa CLOSED_LOCKED. Status=' +
      status.status
    );
  }

  if (!status.closeReviewId) {
    errors.push('Thiếu closeReviewId.');
  }

  if (!status.operationalLockId) {
    errors.push('Thiếu operationalLockId.');
  }

  var prodInfo =
    kidlearnV3_3omGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_CHANGE_REQUEST_CLOSE_OPERATIONAL_LOCK_3OM_CLOSED_V3',
    bundle: '3O-M',
    phase: KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.PHASE,
    status: status.status,
    closeReviewId: status.closeReviewId || '',
    operationalLockId: status.operationalLockId || '',
    finalOperationalMode:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.FINAL_OPERATIONAL_MODE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    selectedRequestExecutionAllowed: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3O-M chưa closed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3O-M package-only.
 *
 * Không record operational lock trong QA batch.
 * Không close chain trong QA batch.
 */
function kidlearnV3_getQaBatchSteps3OMV3() {
  return [
    {
      label: 'Assert 3O-L ready',
      functionName: 'kidlearnV3_assertProdSelectedCRPostTrialValidation3OLReadyV3'
    },
    {
      label: 'Preview PROD CR Close Operational Lock 3O-M',
      functionName: 'kidlearnV3_previewProdChangeRequestCloseOperationalLock3OMV3'
    },
    {
      label: 'Run PROD CR Close Review 3O-M',
      functionName: 'kidlearnV3_runProdChangeRequestCloseReview3OMV3'
    },
    {
      label: 'Generate PROD CR Operational Lock Package 3O-M',
      functionName: 'kidlearnV3_generateProdChangeRequestOperationalLockPackage3OMV3'
    }
  ];
}


/**
 * QA batch 3O-M package-only.
 */
function kidlearnV3_runQaBatch3OMV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3O_M_PROD_CHANGE_REQUEST_CLOSE_OPERATIONAL_LOCK_PACKAGE_ONLY',
    kidlearnV3_getQaBatchSteps3OMV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build close checklist.
 */
function kidlearnV3_3omBuildCloseChecklist_(postTrial, auditRowCheck, safeModes, finalLock) {
  var errors = [];
  var warnings = [];

  var items = [
    {
      item: '3O-L status READY_FOR_3O_M',
      passed:
        postTrial.status === 'READY_FOR_3O_M'
    },
    {
      item: 'Release decision expected',
      passed:
        postTrial.releaseDecision ===
        KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.RELEASE_DECISION_EXPECTED
    },
    {
      item: 'Audit trial row found',
      passed:
        auditRowCheck.success === true
    },
    {
      item: 'Selected request was not executed',
      passed:
        postTrial.selectedRequestExecutedNow !== true
    },
    {
      item: 'Selected data was not changed',
      passed:
        postTrial.selectedDataChangedNow !== true
    },
    {
      item: 'Full PROD write policy was not opened',
      passed:
        postTrial.fullProdWritePolicyOpenedNow !== true
    },
    {
      item: 'Rollback was not executed',
      passed:
        postTrial.rollbackExecutedNow !== true
    },
    {
      item: '3N-J final release remains locked',
      passed:
        finalLock.summary.status === 'PROD_RELEASE_LOCKED'
    },
    {
      item: 'Safe Write remains DRY_RUN/enabled=false',
      passed:
        safeModes.summary.safeWriteMode === 'DRY_RUN' &&
        safeModes.summary.safeWriteEnabled === false
    }
  ];

  for (var i = 0; i < items.length; i++) {
    if (items[i].passed !== true) {
      errors.push(
        'Close checklist failed: ' +
        items[i].item
      );
    }
  }

  return {
    success: errors.length === 0,
    items: items,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Build operational lock policy.
 */
function kidlearnV3_3omBuildOperationalLockPolicy_(postTrial) {
  return {
    lockName:
      'KIDLEARN V3 PROD Change Request Operational Lock',
    finalOperationalMode:
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.FINAL_OPERATIONAL_MODE,
    closeScope:
      'Close the selected change request chain after audit-only trial and post-trial decision.',
    selectedRequestId:
      postTrial.selectedRequestId || '',
    selectedRequestType:
      postTrial.selectedRequestType || '',
    controlledTrialId:
      postTrial.controlledTrialId || '',
    auditId:
      postTrial.auditId || '',
    releaseDecision:
      postTrial.releaseDecision || '',
    lockedPolicy: {
      prodRuntimeMode: 'READ_ONLY',
      selectedRequestExecutionStatus: 'NOT_EXECUTED',
      fullProdWritePolicyStatus: 'NOT_OPENED',
      migrationStatus: 'NOT_EXECUTED',
      rollbackStatus: 'NOT_EXECUTED',
      prodDeployStatus: 'NO_NEW_DEPLOYMENT_IN_3O_M'
    },
    futureChangesRequire: [
      'New change request intake',
      'New review workflow',
      'New planning package',
      'New approval gate',
      'New dry-run/rehearsal',
      'New controlled execution gate if actual PROD write is needed'
    ],
    lockedIn3OM: [
      'No selected data execution',
      'No PROD write enable',
      'No migration',
      'No rollback',
      'No create/delete sheet',
      'No PROD deploy'
    ],
    historicalException:
      '3O-K appended one audit-only row to PROD LOG_Audit as controlled trial evidence.'
  };
}


/**
 * Get post-trial info from 3O-L.
 */
function kidlearnV3_3omGetPostTrialInfo_() {
  try {
    var status =
      kidlearnV3_getProdSelectedCRPostTrialValidation3OLStatusV3();

    var lastDecision =
      status.lastDecision || {};

    var lastReview =
      status.lastReview || {};

    return {
      status: status.status || '',
      postTrialReviewId:
        status.postTrialReviewId ||
        lastDecision.postTrialReviewId ||
        lastReview.postTrialReviewId ||
        '',
      releaseDecisionId:
        status.releaseDecisionId ||
        lastDecision.releaseDecisionId ||
        '',
      controlledTrialId:
        lastDecision.controlledTrialId ||
        lastReview.controlledTrialId ||
        '',
      auditId:
        lastDecision.auditId ||
        lastReview.auditId ||
        '',
      executionPackageId:
        lastDecision.executionPackageId ||
        lastReview.executionPackageId ||
        '',
      selectedRequestId:
        lastDecision.selectedRequestId ||
        lastReview.selectedRequestId ||
        '',
      selectedRequestType:
        lastDecision.selectedRequestType ||
        lastReview.selectedRequestType ||
        '',
      releaseDecision:
        lastDecision.releaseDecision ||
        lastReview.releaseDecision ||
        '',
      selectedRequestExecutedNow:
        lastDecision.selectedRequestExecutedNow === true ||
        lastReview.selectedRequestExecutedNow === true,
      selectedDataChangedNow:
        lastDecision.selectedDataChangedNow === true ||
        lastReview.selectedDataChangedNow === true,
      fullProdWritePolicyOpenedNow:
        lastDecision.fullProdWritePolicyOpenedNow === true ||
        lastReview.fullProdWritePolicyOpenedNow === true,
      migrationExecutedNow:
        lastDecision.migrationExecutedNow === true ||
        lastReview.migrationExecutedNow === true,
      rollbackExecutedNow:
        lastDecision.rollbackExecutedNow === true ||
        lastReview.rollbackExecutedNow === true,
      decisionSuccess:
        lastDecision.success === true,
      reviewSuccess:
        lastReview.success === true
    };

  } catch (error) {
    return {
      status: '',
      postTrialReviewId: '',
      releaseDecisionId: '',
      controlledTrialId: '',
      auditId: '',
      executionPackageId: '',
      selectedRequestId: '',
      selectedRequestType: '',
      releaseDecision: '',
      selectedRequestExecutedNow: false,
      selectedDataChangedNow: false,
      fullProdWritePolicyOpenedNow: false,
      migrationExecutedNow: false,
      rollbackExecutedNow: false,
      decisionSuccess: false,
      reviewSuccess: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Find audit trial row in PROD LOG_Audit.
 */
function kidlearnV3_3omFindAuditTrialRow_(prodFileId, controlledTrialId, auditId) {
  try {
    if (!prodFileId) {
      return {
        success: false,
        message: 'Thiếu prodFileId.'
      };
    }

    var spreadsheet =
      SpreadsheetApp.openById(prodFileId);

    var sheet =
      kidlearnV3_3omGetSheet_(
        spreadsheet,
        'LOG_Audit'
      );

    if (!sheet) {
      return {
        success: false,
        message: 'Không tìm thấy LOG_Audit.'
      };
    }

    var lastRow =
      sheet.getLastRow();

    var lastColumn =
      sheet.getLastColumn();

    if (lastRow < 3 || lastColumn < 1) {
      return {
        success: false,
        message: 'LOG_Audit chưa có data rows.'
      };
    }

    var startRow =
      Math.max(3, lastRow - 200);

    var numRows =
      lastRow - startRow + 1;

    var values =
      sheet
        .getRange(startRow, 1, numRows, lastColumn)
        .getDisplayValues();

    var needle1 =
      String(controlledTrialId || '');

    var needle2 =
      String(auditId || '');

    for (var r = 0; r < values.length; r++) {
      var joined =
        values[r].join(' | ');

      if (
        joined.indexOf(needle1) >= 0 &&
        joined.indexOf(needle2) >= 0
      ) {
        return {
          success: true,
          rowNumber: startRow + r,
          message: 'Found 3O-K audit trial row.',
          controlledTrialId: controlledTrialId,
          auditId: auditId,
          checkedLastRows: numRows
        };
      }
    }

    return {
      success: false,
      message:
        'Không tìm thấy row chứa controlledTrialId và auditId trong 200 rows cuối LOG_Audit.',
      controlledTrialId: controlledTrialId,
      auditId: auditId,
      checkedLastRows: numRows
    };

  } catch (error) {
    return {
      success: false,
      message:
        String(error.message || error),
      controlledTrialId: controlledTrialId,
      auditId: auditId
    };
  }
}


/**
 * PROD info từ 3N-F.
 */
function kidlearnV3_3omGetProdInfo_() {
  var status =
    kidlearnV3_getControlledProdDeployment3NFStatusV3();

  var lastDeployment =
    status.lastDeployment ||
    status.lastExecution ||
    status.lastResult ||
    {};

  return {
    status: status.status || '',
    deploymentId:
      status.deploymentId ||
      lastDeployment.deploymentId ||
      '',
    prodFileId:
      status.prodFileId ||
      status.prodId ||
      status.fileId ||
      lastDeployment.prodFileId ||
      lastDeployment.prodId ||
      lastDeployment.fileId ||
      '',
    prodFileUrl:
      status.prodFileUrl ||
      status.prodUrl ||
      status.fileUrl ||
      lastDeployment.prodFileUrl ||
      lastDeployment.prodUrl ||
      lastDeployment.fileUrl ||
      '',
    prodFileName:
      status.prodFileName ||
      status.fileName ||
      lastDeployment.prodFileName ||
      lastDeployment.fileName ||
      ''
  };
}


/**
 * Check file accessible.
 */
function kidlearnV3_3omCheckFileAccessible_(fileId, label) {
  try {
    if (!fileId) {
      return {
        success: false,
        label: label || '',
        fileId: '',
        message: 'Thiếu fileId.'
      };
    }

    var file =
      DriveApp.getFileById(fileId);

    return {
      success: true,
      label: label || '',
      fileId: fileId,
      fileName: file.getName(),
      fileUrl: file.getUrl(),
      message: 'File accessible.'
    };

  } catch (error) {
    return {
      success: false,
      label: label || '',
      fileId: fileId || '',
      message:
        String(error.message || error)
    };
  }
}


/**
 * Check safe modes.
 */
function kidlearnV3_3omCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3omSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Safe Write trong DEV script phải DRY_RUN/enabled=false. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var controlledWrite =
    kidlearnV3_3omControlledWriteStatus_();

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    errors.push(
      'Controlled Write DEV đang ENABLED.'
    );
  }

  if (controlledWrite.available === false) {
    warnings.push(
      'Không tìm thấy Controlled Write status function. Bỏ qua check này trong DEV.'
    );
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    summary: {
      safeWriteMode: safeWrite.mode || '',
      safeWriteEnabled: safeWrite.enabled,
      controlledWriteAvailable: controlledWrite.available,
      controlledWriteStatus: controlledWrite.status || ''
    }
  };
}


/**
 * Get exact sheet.
 */
function kidlearnV3_3omGetSheet_(spreadsheet, sheetName) {
  if (
    typeof kidlearnV3_appGetSheetByExactName_ === 'function'
  ) {
    return kidlearnV3_appGetSheetByExactName_(
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


/**
 * Safe assert.
 */
function kidlearnV3_3omSafeAssert_(functionName, label) {
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
        label: label,
        message:
          'Thiếu function ' +
          functionName
      };
    }

    var fn =
      eval(functionName);

    var output =
      fn();

    return {
      success:
        output &&
        output.success === true,
      label: label,
      message:
        output && output.success === true
          ? ''
          : JSON.stringify(output)
    };

  } catch (error) {
    return {
      success: false,
      label: label,
      message:
        String(error.message || error)
    };
  }
}


/**
 * Safe call.
 */
function kidlearnV3_3omSafeCall_(functionName) {
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
        available: false,
        functionName: functionName,
        summary: {
          status: '',
          error: 'Missing function'
        }
      };
    }

    var fn =
      eval(functionName);

    var output =
      fn();

    return {
      success: true,
      available: true,
      functionName: functionName,
      summary:
        kidlearnV3_3omSummarizeStatusOutput_(
          output
        )
    };

  } catch (error) {
    return {
      success: false,
      available: true,
      functionName: functionName,
      summary: {
        status: '',
        error: String(error.message || error)
      }
    };
  }
}


/**
 * Summarize status output.
 */
function kidlearnV3_3omSummarizeStatusOutput_(output) {
  if (!output || typeof output !== 'object') {
    return {
      rawType: typeof output
    };
  }

  return {
    success: output.success,
    action: output.action || '',
    bundle: output.bundle || '',
    phase: output.phase || '',
    status: output.status || '',
    nextBundle: output.nextBundle || '',
    nextStage: output.nextStage || '',
    prodFileId: output.prodFileId || '',
    prodFileUrl: output.prodFileUrl || '',
    postTrialReviewId: output.postTrialReviewId || '',
    releaseDecisionId: output.releaseDecisionId || '',
    controlledTrialId: output.controlledTrialId || '',
    auditId: output.auditId || '',
    finalApprovalId: output.finalApprovalId || '',
    executionPackageId: output.executionPackageId || '',
    selectedRequestId: output.selectedRequestId || '',
    selectedRequestType: output.selectedRequestType || '',
    finalLockId: output.finalLockId || '',
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0
  };
}


/**
 * Safe Write status.
 */
function kidlearnV3_3omSafeWriteStatus_() {
  try {
    return kidlearnV3_getSafeWriteLayerStatusV3();
  } catch (error) {
    return {
      success: false,
      mode: '',
      enabled: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Controlled Write status.
 */
function kidlearnV3_3omControlledWriteStatus_() {
  try {
    if (
      typeof kidlearnV3_getControlledWriteDevStatusV3 === 'function'
    ) {
      var result =
        kidlearnV3_getControlledWriteDevStatusV3();

      result.available = true;

      return result;
    }

    return {
      available: false,
      success: false,
      status: '',
      error:
        'Missing kidlearnV3_getControlledWriteDevStatusV3'
    };

  } catch (error) {
    return {
      available: false,
      success: false,
      status: '',
      error:
        String(error.message || error)
    };
  }
}


/**
 * Check functions.
 */
function kidlearnV3_3omCheckFunctions_(names) {
  var errors = [];
  var items = [];

  for (var i = 0; i < names.length; i++) {
    var exists = false;

    try {
      exists =
        eval(
          'typeof ' +
          names[i] +
          ' === "function"'
        );
    } catch (error) {
      exists = false;
    }

    items.push({
      name: names[i],
      exists: exists
    });

    if (!exists) {
      errors.push(
        'Thiếu function: ' +
        names[i]
      );
    }
  }

  return {
    errors: errors,
    items: items
  };
}


/**
 * IDs.
 */
function kidlearnV3_3omMakeCloseReviewId_() {
  return (
    'PROD_CR_CLOSE_REVIEW_3OM_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


function kidlearnV3_3omMakeOperationalLockId_() {
  return (
    'PROD_CR_OPERATIONAL_LOCK_3OM_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


/**
 * Save close review.
 */
function kidlearnV3_3omSaveCloseReview_(review) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.CLOSE_REVIEW_ID,
    review.closeReviewId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.LAST_CLOSE_REVIEW_JSON,
    JSON.stringify(review)
  );
}


/**
 * Save lock package.
 */
function kidlearnV3_3omSaveLockPackage_(lockPackage) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.OPERATIONAL_LOCK_ID,
    lockPackage.operationalLockId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.LAST_LOCK_PACKAGE_JSON,
    JSON.stringify(lockPackage)
  );
}


/**
 * Save result.
 */
function kidlearnV3_3omSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.CLOSED_LOCKED &&
    (
      status === KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.CLOSE_REVIEW_PASSED ||
      status === KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.LOCK_PACKAGE_GENERATED ||
      status === KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.OPERATIONAL_LOCK_RECORDED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_CR_CLOSE_3OM_STATUS.CLOSED_LOCKED;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_CLOSE_3OM_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      closeReviewId: result.closeReviewId || '',
      operationalLockId: result.operationalLockId || '',
      controlledTrialId: result.controlledTrialId || '',
      auditId: result.auditId || '',
      executionPackageId: result.executionPackageId || '',
      selectedRequestId: result.selectedRequestId || '',
      selectedRequestType: result.selectedRequestType || '',
      prodFileId: result.prodFileId || '',
      prodFileUrl: result.prodFileUrl || '',
      releaseDecision: result.releaseDecision || '',
      finalOperationalMode:
        result.finalOperationalMode ||
        KIDLEARN_V3_PROD_CR_CLOSE_3OM_CONFIG.FINAL_OPERATIONAL_MODE,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
      selectedRequestExecutionAllowed: false,
      selectedRequestExecutedNow: false,
      selectedDataChangedNow: false,
      fullProdWritePolicyOpenedNow: false,
      migrationExecutedNow: false,
      rollbackExecutedNow: false,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      errors: result.errors || [],
      warnings: result.warnings || [],
      at: new Date().toISOString()
    })
  );
}


/**
 * Read JSON property.
 */
function kidlearnV3_3omReadJsonProperty_(key) {
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
 * Normalize options.
 */
function kidlearnV3_3omNormalizeOptions_(options) {
  if (!options) return {};

  if (typeof options !== 'object') {
    return {
      value: options
    };
  }

  return options;
}