/**
 * ================================================================
 * KIDLEARN V3 - PROD SELECTED CHANGE REQUEST POST-TRIAL VALIDATION
 * AND RELEASE DECISION
 * Bundle: 3O-L
 * Version: 3.1.0
 * ================================================================
 *
 * 3O-L:
 * - Review sau controlled audit-only trial 3O-K.
 * - Xác nhận audit row tồn tại.
 * - Xác nhận selected request chưa được execute thật.
 * - Generate release decision package.
 * - Không ghi thêm vào PROD.
 * - Không mở PROD write.
 * - Không migration.
 * - Không rollback.
 * - Không tạo/xóa sheet.
 * - Chỉ ghi ScriptProperties trong DEV script để lưu review/status.
 */


var KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3OL_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3OL_LAST_PREVIEW_AT',
  LAST_REVIEW_AT: 'KIDLEARN_V3_PHASE_3OL_LAST_REVIEW_AT',
  LAST_DECISION_AT: 'KIDLEARN_V3_PHASE_3OL_LAST_DECISION_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3OL_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3OL_LAST_RESULT_JSON',
  LAST_REVIEW_JSON: 'KIDLEARN_V3_PHASE_3OL_LAST_REVIEW_JSON',
  LAST_DECISION_JSON: 'KIDLEARN_V3_PHASE_3OL_LAST_DECISION_JSON',
  POST_TRIAL_REVIEW_ID: 'KIDLEARN_V3_PHASE_3OL_POST_TRIAL_REVIEW_ID',
  RELEASE_DECISION_ID: 'KIDLEARN_V3_PHASE_3OL_RELEASE_DECISION_ID'
};


var KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  POST_TRIAL_REVIEW_PASSED: 'POST_TRIAL_REVIEW_PASSED',
  RELEASE_DECISION_GENERATED: 'RELEASE_DECISION_GENERATED',
  READY_FOR_3O_M: 'READY_FOR_3O_M',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG = {
  VERSION: '3O-L',
  PHASE: '3O-L',
  NEXT_BUNDLE: '3O-M',
  NEXT_STAGE: 'PROD_CHANGE_REQUEST_CLOSE_AND_OPERATIONAL_LOCK',
  WRITE_MODE: 'POST_TRIAL_REVIEW_AND_RELEASE_DECISION_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  SELECTED_REQUEST_EXECUTION_ALLOWED: false,
  RELEASE_DECISION: 'CONTROLLED_AUDIT_TRIAL_ACCEPTED_NO_SELECTED_DATA_EXECUTION',
  AUDIT_SHEET: 'LOG_Audit'
};


/**
 * Preview 3O-L.
 */
function kidlearnV3_previewProdSelectedCRPostTrialValidation3OLV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3olCheckFunctions_([
      'kidlearnV3_assertProdSelectedCRControlledExecutionTrial3OKReadyV3',
      'kidlearnV3_getProdSelectedCRControlledExecutionTrial3OKStatusV3',
      'kidlearnV3_getProdSelectedCRFinalExecutionApproval3OJStatusV3',
      'kidlearnV3_getProdSelectedChangeRequestExecutionPackage3OIStatusV3',
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3OK =
    kidlearnV3_3olSafeAssert_(
      'kidlearnV3_assertProdSelectedCRControlledExecutionTrial3OKReadyV3',
      '3O-K'
    );

  if (!phase3OK.success) {
    errors.push(
      '3O-K chưa READY_FOR_3O_L: ' +
      phase3OK.message
    );
  }

  var trialInfo =
    kidlearnV3_3olGetTrialInfo_();

  if (!trialInfo.controlledTrialId) {
    errors.push('Thiếu controlledTrialId từ 3O-K.');
  }

  if (!trialInfo.auditId) {
    errors.push('Thiếu auditId từ 3O-K.');
  }

  if (trialInfo.prodAuditWriteExecuted !== true) {
    errors.push('3O-K chưa xác nhận prodAuditWriteExecuted=true.');
  }

  if (trialInfo.selectedRequestExecutedNow === true) {
    errors.push('3O-K không được selectedRequestExecutedNow=true.');
  }

  if (trialInfo.selectedDataChangedNow === true) {
    errors.push('3O-K không được selectedDataChangedNow=true.');
  }

  var finalLock =
    kidlearnV3_3olSafeCall_(
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
    kidlearnV3_3olGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodCheck =
    kidlearnV3_3olCheckFileAccessible_(
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
    kidlearnV3_3olFindAuditTrialRow_(
      prodInfo.prodFileId,
      trialInfo.controlledTrialId,
      trialInfo.auditId
    );

  if (!auditRowCheck.success) {
    errors.push(
      'Không tìm thấy audit trial row từ 3O-K: ' +
      auditRowCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3olCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_SELECTED_CR_POST_TRIAL_VALIDATION_3OL_V3',
    bundle: '3O-L',
    phase: KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.WRITE_MODE,
    releaseDecision:
      KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.RELEASE_DECISION,
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
    phase3OK: phase3OK,
    trialInfo: trialInfo,
    finalLock: finalLock.summary,
    prodInfo: prodInfo,
    prodCheck: prodCheck,
    auditRowCheck: auditRowCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3O-L chỉ review sau trial và release decision. Không ghi thêm vào PROD.'
  };

  kidlearnV3_3olSaveResult_(
    result,
    KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Run post-trial validation review.
 *
 * Không ghi PROD.
 */
function kidlearnV3_runProdSelectedCRPostTrialValidationReview3OLV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdSelectedCRPostTrialValidation3OLV3();

  if (!preview.success) {
    throw new Error(
      'Không thể run post-trial review 3O-L vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var postTrialReviewId =
    kidlearnV3_3olMakePostTrialReviewId_();

  var prodInfo =
    kidlearnV3_3olGetProdInfo_();

  var trialInfo =
    kidlearnV3_3olGetTrialInfo_();

  var finalApproval =
    kidlearnV3_3olSafeCall_(
      'kidlearnV3_getProdSelectedCRFinalExecutionApproval3OJStatusV3'
    );

  var selectedPackage =
    kidlearnV3_3olSafeCall_(
      'kidlearnV3_getProdSelectedChangeRequestExecutionPackage3OIStatusV3'
    );

  var trialStatus =
    kidlearnV3_3olSafeCall_(
      'kidlearnV3_getProdSelectedCRControlledExecutionTrial3OKStatusV3'
    );

  var finalLock =
    kidlearnV3_3olSafeCall_(
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3'
    );

  var auditRowCheck =
    kidlearnV3_3olFindAuditTrialRow_(
      prodInfo.prodFileId,
      trialInfo.controlledTrialId,
      trialInfo.auditId
    );

  if (!auditRowCheck.success) {
    errors.push(
      'Không tìm thấy audit trial row khi review: ' +
      auditRowCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3olCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var reviewChecklist =
    kidlearnV3_3olBuildPostTrialChecklist_(
      trialInfo,
      auditRowCheck,
      safeModes
    );

  errors =
    errors.concat(
      reviewChecklist.errors
    );

  warnings =
    warnings.concat(
      reviewChecklist.warnings
    );

  var finishedAt = new Date();

  var review = {
    success: errors.length === 0,
    action: 'RUN_PROD_SELECTED_CR_POST_TRIAL_VALIDATION_REVIEW_3OL_V3',
    bundle: '3O-L',
    phase: KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.POST_TRIAL_REVIEW_PASSED
        : KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.FAILED,
    postTrialReviewId: postTrialReviewId,
    controlledTrialId: trialInfo.controlledTrialId || '',
    auditId: trialInfo.auditId || '',
    auditRowNumber: auditRowCheck.rowNumber || 0,
    executionPackageId: trialInfo.executionPackageId || '',
    selectedRequestId: trialInfo.selectedRequestId || '',
    selectedRequestType: trialInfo.selectedRequestType || '',
    nextBundle:
      KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.NEXT_STAGE,
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

    upstreamReadiness: {
      trial3OK: trialStatus.summary,
      finalApproval3OJ: finalApproval.summary,
      selectedPackage3OI: selectedPackage.summary,
      finalLock3NJ: finalLock.summary
    },

    postTrialReview: {
      auditRowFound: auditRowCheck.success,
      auditRowNumber: auditRowCheck.rowNumber || 0,
      prodAuditWriteExecuted:
        trialInfo.prodAuditWriteExecuted === true,
      expectedAuditOnlyChangeConfirmed:
        trialInfo.expectedAuditOnlyChangeConfirmed === true,
      selectedRequestExecutedNow:
        trialInfo.selectedRequestExecutedNow === true,
      selectedDataChangedNow:
        trialInfo.selectedDataChangedNow === true,
      fullProdWritePolicyOpenedNow:
        trialInfo.fullProdWritePolicyOpenedNow === true
    },

    reviewChecklist: reviewChecklist.items,
    safeModes: safeModes.summary,

    releaseRecommendation:
      errors.length === 0
        ? 'ACCEPT_AUDIT_TRIAL_AND_DO_NOT_EXECUTE_SELECTED_DATA'
        : 'HOLD_POST_TRIAL_REVIEW_FAILED',

    noSideEffectAt3OL: {
      prodFileModifiedBy3OL: false,
      prodDataWrittenBy3OL: false,
      prodSheetCreatedBy3OL: false,
      prodSheetDeletedBy3OL: false,
      selectedRequestExecutedBy3OL: false,
      prodWritePolicyOpenedBy3OL: false,
      rollbackExecutedBy3OL: false
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

  kidlearnV3_3olSaveReview_(
    review
  );

  kidlearnV3_3olSaveResult_(
    review,
    review.success
      ? KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.POST_TRIAL_REVIEW_PASSED
      : KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.FAILED,
    KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.LAST_REVIEW_AT
  );

  console.log(JSON.stringify(review, null, 2));

  if (!review.success) {
    throw new Error(
      '3O-L post-trial review failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return review;
}


/**
 * Generate release decision package.
 *
 * Không ghi PROD.
 */
function kidlearnV3_generateProdSelectedCRReleaseDecision3OLV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var status =
    kidlearnV3_getProdSelectedCRPostTrialValidation3OLStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.POST_TRIAL_REVIEW_PASSED &&
    status.status !== KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.RELEASE_DECISION_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.READY_FOR_3O_M
  ) {
    errors.push(
      '3O-L cần POST_TRIAL_REVIEW_PASSED trước khi generate release decision. Status=' +
      status.status
    );
  }

  if (
    !status.lastReview ||
    status.lastReview.success !== true
  ) {
    errors.push(
      'Last post-trial review chưa success=true.'
    );
  }

  var releaseDecisionId =
    kidlearnV3_3olMakeReleaseDecisionId_();

  var prodInfo =
    kidlearnV3_3olGetProdInfo_();

  var prodCheck =
    kidlearnV3_3olCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi generate release decision: ' +
      prodCheck.message
    );
  }

  var trialInfo =
    kidlearnV3_3olGetTrialInfo_();

  var safeModes =
    kidlearnV3_3olCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var decisionPolicy =
    kidlearnV3_3olBuildReleaseDecisionPolicy_(
      trialInfo
    );

  var finishedAt = new Date();

  var decision = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_SELECTED_CR_RELEASE_DECISION_3OL_V3',
    bundle: '3O-L',
    phase: KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.RELEASE_DECISION_GENERATED
        : KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.FAILED,
    releaseDecisionId: releaseDecisionId,
    postTrialReviewId:
      status.postTrialReviewId || '',
    controlledTrialId: trialInfo.controlledTrialId || '',
    auditId: trialInfo.auditId || '',
    executionPackageId: trialInfo.executionPackageId || '',
    selectedRequestId: trialInfo.selectedRequestId || '',
    selectedRequestType: trialInfo.selectedRequestType || '',
    releaseDecision:
      KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.RELEASE_DECISION,
    nextBundle:
      KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.NEXT_STAGE,
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

    decisionPolicy: decisionPolicy,

    decisionChecklist: [
      {
        item: '3O-K trial ready',
        passed:
          trialInfo.status === 'READY_FOR_3O_L'
      },
      {
        item: 'Audit row exists',
        passed:
          trialInfo.auditId ? true : false
      },
      {
        item: 'Audit-only change confirmed',
        passed:
          trialInfo.expectedAuditOnlyChangeConfirmed === true
      },
      {
        item: 'Selected request was not executed',
        passed:
          trialInfo.selectedRequestExecutedNow !== true
      },
      {
        item: 'Selected data was not changed',
        passed:
          trialInfo.selectedDataChangedNow !== true
      },
      {
        item: 'Full PROD write policy was not opened',
        passed:
          trialInfo.fullProdWritePolicyOpenedNow !== true
      },
      {
        item: 'PROD file accessible',
        passed: prodCheck.success
      },
      {
        item: 'Safe Write remains DRY_RUN/enabled=false',
        passed:
          safeModes.summary.safeWriteMode === 'DRY_RUN' &&
          safeModes.summary.safeWriteEnabled === false
      }
    ],

    decisionMeaning:
      '3O-L accepts the audit-only controlled trial and does not approve selected data execution. The system remains read-only except the historical audit row already appended in 3O-K.',

    noSideEffectAt3OL: {
      prodFileModifiedBy3OL: false,
      prodDataWrittenBy3OL: false,
      prodSheetCreatedBy3OL: false,
      prodSheetDeletedBy3OL: false,
      selectedRequestExecutedBy3OL: false,
      prodWritePolicyOpenedBy3OL: false,
      rollbackExecutedBy3OL: false
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

  kidlearnV3_3olSaveDecision_(
    decision
  );

  kidlearnV3_3olSaveResult_(
    decision,
    decision.success
      ? KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.RELEASE_DECISION_GENERATED
      : KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.FAILED,
    KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.LAST_DECISION_AT
  );

  console.log(JSON.stringify(decision, null, 2));

  if (!decision.success) {
    throw new Error(
      '3O-L release decision failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return decision;
}


/**
 * Mark 3O-L ready.
 */
function kidlearnV3_markProdSelectedCRPostTrialValidation3OLReadyV3() {
  var status =
    kidlearnV3_getProdSelectedCRPostTrialValidation3OLStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.RELEASE_DECISION_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.READY_FOR_3O_M
  ) {
    errors.push(
      '3O-L chưa RELEASE_DECISION_GENERATED. Status=' +
      status.status
    );
  }

  if (
    !status.lastReview ||
    status.lastReview.success !== true
  ) {
    errors.push(
      'Last review chưa success=true.'
    );
  }

  if (
    !status.lastDecision ||
    status.lastDecision.success !== true
  ) {
    errors.push(
      'Last decision chưa success=true.'
    );
  }

  if (!status.postTrialReviewId) {
    errors.push('Thiếu postTrialReviewId.');
  }

  if (!status.releaseDecisionId) {
    errors.push('Thiếu releaseDecisionId.');
  }

  var trialInfo =
    kidlearnV3_3olGetTrialInfo_();

  if (!trialInfo.controlledTrialId) {
    errors.push('Thiếu controlledTrialId.');
  }

  if (!trialInfo.auditId) {
    errors.push('Thiếu auditId.');
  }

  var prodInfo =
    kidlearnV3_3olGetProdInfo_();

  var prodCheck =
    kidlearnV3_3olCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi mark ready: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3olCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3O-L ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_SELECTED_CR_POST_TRIAL_VALIDATION_3OL_READY_V3',
    bundle: '3O-L',
    phase: KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.READY_FOR_3O_M,
    postTrialReviewId: status.postTrialReviewId || '',
    releaseDecisionId: status.releaseDecisionId || '',
    controlledTrialId: trialInfo.controlledTrialId || '',
    auditId: trialInfo.auditId || '',
    executionPackageId: trialInfo.executionPackageId || '',
    selectedRequestId: trialInfo.selectedRequestId || '',
    selectedRequestType: trialInfo.selectedRequestType || '',
    releaseDecision:
      KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.RELEASE_DECISION,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.NEXT_STAGE,
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
      '3O-L ready. Post-trial validation và release decision đã hoàn tất. Bước tiếp theo là 3O-M close and operational lock.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3olSaveResult_(
    result,
    KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.READY_FOR_3O_M,
    KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3O-L status.
 */
function kidlearnV3_getProdSelectedCRPostTrialValidation3OLStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_SELECTED_CR_POST_TRIAL_VALIDATION_3OL_STATUS_V3',
    bundle: '3O-L',
    phase: KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.NOT_RUN,
    postTrialReviewId:
      properties.getProperty(
        KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.POST_TRIAL_REVIEW_ID
      ) ||
      '',
    releaseDecisionId:
      properties.getProperty(
        KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.RELEASE_DECISION_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastReviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.LAST_REVIEW_AT
      ) ||
      '',
    lastDecisionAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.LAST_DECISION_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3olReadJsonProperty_(
        KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.LAST_RESULT_JSON
      ),
    lastReview:
      kidlearnV3_3olReadJsonProperty_(
        KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.LAST_REVIEW_JSON
      ),
    lastDecision:
      kidlearnV3_3olReadJsonProperty_(
        KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.LAST_DECISION_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3O-L ready.
 */
function kidlearnV3_assertProdSelectedCRPostTrialValidation3OLReadyV3() {
  var status =
    kidlearnV3_getProdSelectedCRPostTrialValidation3OLStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.READY_FOR_3O_M
  ) {
    errors.push(
      '3O-L chưa READY_FOR_3O_M. Status=' +
      status.status
    );
  }

  if (!status.postTrialReviewId) {
    errors.push('Thiếu postTrialReviewId.');
  }

  if (!status.releaseDecisionId) {
    errors.push('Thiếu releaseDecisionId.');
  }

  var trialInfo =
    kidlearnV3_3olGetTrialInfo_();

  if (!trialInfo.controlledTrialId) {
    errors.push('Thiếu controlledTrialId.');
  }

  if (!trialInfo.auditId) {
    errors.push('Thiếu auditId.');
  }

  var prodInfo =
    kidlearnV3_3olGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_SELECTED_CR_POST_TRIAL_VALIDATION_3OL_READY_V3',
    bundle: '3O-L',
    phase: KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.PHASE,
    status: status.status,
    postTrialReviewId: status.postTrialReviewId || '',
    releaseDecisionId: status.releaseDecisionId || '',
    controlledTrialId: trialInfo.controlledTrialId || '',
    auditId: trialInfo.auditId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.NEXT_BUNDLE,
    releaseDecision:
      KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.RELEASE_DECISION,
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
      '3O-L chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3O-L.
 *
 * Không ghi PROD.
 */
function kidlearnV3_getQaBatchSteps3OLV3() {
  return [
    {
      label: 'Assert 3O-K ready',
      functionName: 'kidlearnV3_assertProdSelectedCRControlledExecutionTrial3OKReadyV3'
    },
    {
      label: 'Preview PROD Selected CR Post-trial 3O-L',
      functionName: 'kidlearnV3_previewProdSelectedCRPostTrialValidation3OLV3'
    },
    {
      label: 'Run PROD Selected CR Post-trial Review 3O-L',
      functionName: 'kidlearnV3_runProdSelectedCRPostTrialValidationReview3OLV3'
    },
    {
      label: 'Generate PROD Selected CR Release Decision 3O-L',
      functionName: 'kidlearnV3_generateProdSelectedCRReleaseDecision3OLV3'
    },
    {
      label: 'Mark PROD Selected CR Post-trial 3O-L Ready',
      functionName: 'kidlearnV3_markProdSelectedCRPostTrialValidation3OLReadyV3'
    },
    {
      label: 'Assert PROD Selected CR Post-trial 3O-L Ready',
      functionName: 'kidlearnV3_assertProdSelectedCRPostTrialValidation3OLReadyV3'
    }
  ];
}


/**
 * QA batch 3O-L.
 */
function kidlearnV3_runQaBatch3OLV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3O_L_PROD_SELECTED_CR_POST_TRIAL_VALIDATION_RELEASE_DECISION',
    kidlearnV3_getQaBatchSteps3OLV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build post-trial checklist.
 */
function kidlearnV3_3olBuildPostTrialChecklist_(trialInfo, auditRowCheck, safeModes) {
  var errors = [];
  var warnings = [];

  var items = [
    {
      item: '3O-K status READY_FOR_3O_L',
      passed:
        trialInfo.status === 'READY_FOR_3O_L'
    },
    {
      item: 'Audit trial row found in PROD LOG_Audit',
      passed:
        auditRowCheck.success === true
    },
    {
      item: 'prodAuditWriteExecuted true',
      passed:
        trialInfo.prodAuditWriteExecuted === true
    },
    {
      item: 'Expected audit-only change confirmed',
      passed:
        trialInfo.expectedAuditOnlyChangeConfirmed === true
    },
    {
      item: 'Selected request was not executed',
      passed:
        trialInfo.selectedRequestExecutedNow !== true
    },
    {
      item: 'Selected data was not changed',
      passed:
        trialInfo.selectedDataChangedNow !== true
    },
    {
      item: 'Full PROD write policy was not opened',
      passed:
        trialInfo.fullProdWritePolicyOpenedNow !== true
    },
    {
      item: 'Rollback was not executed',
      passed:
        trialInfo.rollbackExecutedNow !== true
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
        'Post-trial checklist failed: ' +
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
 * Build release decision policy.
 */
function kidlearnV3_3olBuildReleaseDecisionPolicy_(trialInfo) {
  return {
    decisionName:
      'KIDLEARN V3 PROD Selected CR Post-trial Release Decision',
    decisionScope:
      'Accept controlled audit-only trial result and keep selected request unexecuted.',
    selectedRequestId:
      trialInfo.selectedRequestId || '',
    selectedRequestType:
      trialInfo.selectedRequestType || '',
    controlledTrialId:
      trialInfo.controlledTrialId || '',
    auditId:
      trialInfo.auditId || '',
    releaseDecision:
      KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.RELEASE_DECISION,
    whatThisDecisionAccepts: [
      '3O-K audit-only trial completed.',
      'Audit row exists in PROD LOG_Audit.',
      'No selected data execution occurred.',
      'No full PROD write policy was opened.',
      'No rollback was executed.'
    ],
    whatThisDecisionDoesNotApprove: [
      'Không approve selected DATA_FIX execution thật.',
      'Không mở PROD write.',
      'Không migration.',
      'Không rollback.',
      'Không deploy PROD mới.',
      'Không sửa sheet dữ liệu học.'
    ],
    nextOperationalPolicy: {
      prodRuntimeMode: 'READ_ONLY_WITH_HISTORICAL_AUDIT_TRIAL_ROW',
      selectedRequestExecutionStatus: 'NOT_EXECUTED',
      futureExecutionRequiresNewGate: true,
      futureProdWriteRequiresDedicatedApproval: true,
      rollbackRequiresDedicatedRollbackPhase: true
    },
    recommendedNextPhase:
      KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.NEXT_BUNDLE
  };
}


/**
 * Get trial info from 3O-K.
 */
function kidlearnV3_3olGetTrialInfo_() {
  try {
    var status =
      kidlearnV3_getProdSelectedCRControlledExecutionTrial3OKStatusV3();

    var lastTrial =
      status.lastTrial || {};

    var lastValidation =
      status.lastValidation || {};

    var compare =
      lastTrial.compare || {};

    var validationSummary =
      lastValidation.validationSummary || {};

    return {
      status: status.status || '',
      controlledTrialId:
        status.controlledTrialId ||
        lastTrial.controlledTrialId ||
        lastValidation.controlledTrialId ||
        '',
      auditId:
        status.auditId ||
        lastTrial.auditId ||
        lastValidation.auditId ||
        '',
      auditRowNumber:
        lastTrial.auditRowNumber ||
        lastValidation.auditRowNumber ||
        0,
      executionPackageId:
        lastTrial.executionPackageId ||
        lastValidation.executionPackageId ||
        '',
      selectedRequestId:
        lastTrial.selectedRequestId ||
        lastValidation.selectedRequestId ||
        '',
      selectedRequestType:
        lastTrial.selectedRequestType ||
        lastValidation.selectedRequestType ||
        '',
      prodAuditWriteExecuted:
        lastTrial.prodAuditWriteExecuted === true ||
        validationSummary.auditRowFound === true,
      expectedAuditOnlyChangeConfirmed:
        compare.expectedAuditOnlyChangeConfirmed === true ||
        validationSummary.expectedAuditOnlyChangeConfirmed === true,
      selectedRequestExecutedNow:
        lastTrial.selectedRequestExecutedNow === true ||
        validationSummary.selectedRequestExecutedNow === true,
      selectedDataChangedNow:
        lastTrial.selectedDataChangedNow === true ||
        validationSummary.selectedDataChangedNow === true,
      fullProdWritePolicyOpenedNow:
        lastTrial.fullProdWritePolicyOpenedNow === true ||
        validationSummary.fullProdWritePolicyOpenedNow === true,
      rollbackExecutedNow:
        lastTrial.rollbackExecutedNow === true,
      trialSuccess:
        lastTrial.success === true,
      validationSuccess:
        lastValidation.success === true
    };

  } catch (error) {
    return {
      status: '',
      controlledTrialId: '',
      auditId: '',
      auditRowNumber: 0,
      executionPackageId: '',
      selectedRequestId: '',
      selectedRequestType: '',
      prodAuditWriteExecuted: false,
      expectedAuditOnlyChangeConfirmed: false,
      selectedRequestExecutedNow: false,
      selectedDataChangedNow: false,
      fullProdWritePolicyOpenedNow: false,
      rollbackExecutedNow: false,
      trialSuccess: false,
      validationSuccess: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Find audit trial row in PROD LOG_Audit.
 */
function kidlearnV3_3olFindAuditTrialRow_(prodFileId, controlledTrialId, auditId) {
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
      kidlearnV3_3olGetSheet_(
        spreadsheet,
        KIDLEARN_V3_PROD_POST_TRIAL_3OL_CONFIG.AUDIT_SHEET
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
      Math.max(3, lastRow - 150);

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
        'Không tìm thấy row chứa controlledTrialId và auditId trong 150 rows cuối LOG_Audit.',
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
function kidlearnV3_3olGetProdInfo_() {
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
function kidlearnV3_3olCheckFileAccessible_(fileId, label) {
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
function kidlearnV3_3olCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3olSafeWriteStatus_();

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
    kidlearnV3_3olControlledWriteStatus_();

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
function kidlearnV3_3olGetSheet_(spreadsheet, sheetName) {
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
function kidlearnV3_3olSafeAssert_(functionName, label) {
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
function kidlearnV3_3olSafeCall_(functionName) {
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
        kidlearnV3_3olSummarizeStatusOutput_(
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
function kidlearnV3_3olSummarizeStatusOutput_(output) {
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
function kidlearnV3_3olSafeWriteStatus_() {
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
function kidlearnV3_3olControlledWriteStatus_() {
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
function kidlearnV3_3olCheckFunctions_(names) {
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
function kidlearnV3_3olMakePostTrialReviewId_() {
  return (
    'PROD_SELECTED_CR_POST_TRIAL_REVIEW_3OL_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


function kidlearnV3_3olMakeReleaseDecisionId_() {
  return (
    'PROD_SELECTED_CR_RELEASE_DECISION_3OL_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


/**
 * Save review.
 */
function kidlearnV3_3olSaveReview_(review) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.POST_TRIAL_REVIEW_ID,
    review.postTrialReviewId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.LAST_REVIEW_JSON,
    JSON.stringify(review)
  );
}


/**
 * Save decision.
 */
function kidlearnV3_3olSaveDecision_(decision) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.RELEASE_DECISION_ID,
    decision.releaseDecisionId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.LAST_DECISION_JSON,
    JSON.stringify(decision)
  );
}


/**
 * Save result.
 */
function kidlearnV3_3olSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.READY_FOR_3O_M &&
    (
      status === KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.POST_TRIAL_REVIEW_PASSED ||
      status === KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.RELEASE_DECISION_GENERATED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_POST_TRIAL_3OL_STATUS.READY_FOR_3O_M;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_POST_TRIAL_3OL_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      postTrialReviewId: result.postTrialReviewId || '',
      releaseDecisionId: result.releaseDecisionId || '',
      controlledTrialId: result.controlledTrialId || '',
      auditId: result.auditId || '',
      executionPackageId: result.executionPackageId || '',
      selectedRequestId: result.selectedRequestId || '',
      selectedRequestType: result.selectedRequestType || '',
      prodFileId: result.prodFileId || '',
      prodFileUrl: result.prodFileUrl || '',
      releaseDecision: result.releaseDecision || '',
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
function kidlearnV3_3olReadJsonProperty_(key) {
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