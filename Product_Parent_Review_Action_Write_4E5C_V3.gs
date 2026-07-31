/**
 * ================================================================
 * KIDLEARN V3 - CONTROLLED REVIEW ACTION WRITE
 * Step: 4E-5C
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Controlled DEV write for parent/admin handwriting review.
 * - Update DATA_Responses.answerMetaJson.
 * - Set review status:
 *   + REVIEWED_ACCEPTED
 *   + REVIEWED_RETRY
 * - Append LOG_Audit.
 *
 * Safety:
 * - DEV only.
 * - Requires 4E-5B ready.
 * - Requires confirm text.
 * - Updates only 1 DATA_Responses row per call.
 * - Does not create/update Drive files.
 */


var KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4E5C_STATUS',
  LAST_PREFLIGHT_AT: 'KIDLEARN_V3_PHASE_4E5C_LAST_PREFLIGHT_AT',
  LAST_WRITE_AT: 'KIDLEARN_V3_PHASE_4E5C_LAST_WRITE_AT',
  LAST_VERIFY_AT: 'KIDLEARN_V3_PHASE_4E5C_LAST_VERIFY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4E5C_LAST_RESULT_JSON',
  LAST_REVIEW_ACTION_JSON: 'KIDLEARN_V3_PHASE_4E5C_LAST_REVIEW_ACTION_JSON'
};


var KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREFLIGHT_PASSED: 'PREFLIGHT_PASSED',
  READY_FOR_4E_5D: 'READY_FOR_4E_5D',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG = {
  PHASE: '4E-5C',
  PARENT_PHASE: '4E',
  PREVIOUS_BUNDLE: '4E-5B',
  NEXT_BUNDLE: '4E-5D',
  NEXT_STAGE: 'QA_READY_FOR_4E_6',
  WRITE_NAME: 'CONTROLLED_REVIEW_ACTION_WRITE',
  ACCEPT_CONFIRM_TEXT: 'CONFIRM_ACCEPT_HANDWRITING_REVIEW_4E5C',
  RETRY_CONFIRM_TEXT: 'CONFIRM_RETRY_HANDWRITING_REVIEW_4E5C',
  ACTION_ACCEPT: 'ACCEPT',
  ACTION_RETRY: 'RETRY',
  STATUS_ACCEPTED: 'REVIEWED_ACCEPTED',
  STATUS_RETRY: 'REVIEWED_RETRY',
  PENDING_STATUS: 'NEEDS_REVIEW',
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED: true,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Preview review action.
 * Không ghi Sheet.
 *
 * options:
 * {
 *   responseId: '...',
 *   actionType: 'ACCEPT' | 'RETRY',
 *   reviewerNote: '...'
 * }
 */
function kidlearnV3_previewHandwritingReviewAction4E5CV3(options) {
  options = options || {};

  var plan =
    kidlearnV3_4e5cBuildReviewActionPlan_(options);

  plan.action =
    'PREVIEW_HANDWRITING_REVIEW_ACTION_4E_5C_V3';

  kidlearnV3_4e5cSaveStatus_(
    plan,
    plan.success
      ? KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_STATUS.PREFLIGHT_PASSED
      : KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_STATUS.FAILED,
    KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_KEYS.LAST_PREFLIGHT_AT
  );

  console.log(JSON.stringify({
    success: plan.success,
    action: plan.action,
    phase: plan.phase,
    responseId: plan.responseId,
    reviewAction: plan.reviewAction,
    targetReviewStatus: plan.targetReviewStatus,
    targetRowNumber: plan.targetRowNumber,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    errorCount: plan.errorCount,
    warningCount: plan.warningCount,
    errors: plan.errors,
    warnings: plan.warnings
  }, null, 2));

  if (!plan.success) {
    throw new Error(
      '4E-5C preview failed. Errors=' +
      plan.errors.join(' | ')
    );
  }

  return plan;
}


/**
 * Preflight with sample pending item.
 */
function kidlearnV3_runHandwritingReviewActionPreflight4E5CV3() {
  var sample =
    kidlearnV3_4e5cBuildSampleReviewActionOptions_(
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.ACTION_ACCEPT
    );

  var result =
    kidlearnV3_previewHandwritingReviewAction4E5CV3(sample);

  result.action =
    'RUN_HANDWRITING_REVIEW_ACTION_PREFLIGHT_4E_5C_V3';

  kidlearnV3_4e5cSaveStatus_(
    result,
    KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_STATUS.PREFLIGHT_PASSED,
    KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_KEYS.LAST_PREFLIGHT_AT
  );

  console.log(JSON.stringify({
    success: result.success,
    action: result.action,
    phase: result.phase,
    status:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_STATUS.PREFLIGHT_PASSED,
    responseId: result.responseId,
    targetReviewStatus: result.targetReviewStatus,
    nextAction:
      'Run kidlearnV3_acceptFirstPendingHandwritingReview4E5CConfirmV3 or UI action',
    actualSheetWritePerformed: false
  }, null, 2));

  return result;
}


/**
 * Convenience wrapper: accept first pending item.
 */
function kidlearnV3_acceptFirstPendingHandwritingReview4E5CConfirmV3() {
  var options =
    kidlearnV3_4e5cBuildSampleReviewActionOptions_(
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.ACTION_ACCEPT
    );

  options.confirm =
    KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.ACCEPT_CONFIRM_TEXT;

  options.reviewerNote =
    options.reviewerNote ||
    'Parent/admin accepted handwriting response.';

  return kidlearnV3_writeHandwritingReviewAction4E5CV3(options);
}


/**
 * Convenience wrapper: request retry for first pending item.
 */
function kidlearnV3_retryFirstPendingHandwritingReview4E5CConfirmV3() {
  var options =
    kidlearnV3_4e5cBuildSampleReviewActionOptions_(
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.ACTION_RETRY
    );

  options.confirm =
    KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.RETRY_CONFIRM_TEXT;

  options.reviewerNote =
    options.reviewerNote ||
    'Parent/admin requested retry for handwriting response.';

  return kidlearnV3_writeHandwritingReviewAction4E5CV3(options);
}


/**
 * Controlled real write.
 *
 * options:
 * {
 *   confirm: '...',
 *   responseId: '...',
 *   actionType: 'ACCEPT' | 'RETRY',
 *   reviewerId: 'PARENT',
 *   reviewerNote: '...'
 * }
 */
function kidlearnV3_writeHandwritingReviewAction4E5CV3(options) {
  options = options || {};

  var normalizedAction =
    kidlearnV3_4e5cNormalizeActionType_(
      options.actionType
    );

  var confirmText =
    String(options.confirm || '')
      .trim()
      .toUpperCase();

  if (
    normalizedAction ===
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.ACTION_ACCEPT &&
    confirmText !==
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.ACCEPT_CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm accept. Cần confirm=' +
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.ACCEPT_CONFIRM_TEXT
    );
  }

  if (
    normalizedAction ===
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.ACTION_RETRY &&
    confirmText !==
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.RETRY_CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm retry. Cần confirm=' +
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.RETRY_CONFIRM_TEXT
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
    var plan =
      kidlearnV3_4e5cBuildReviewActionPlan_(options);

    if (!plan.success) {
      throw new Error(
        'Preflight 4E-5C chưa pass. Errors=' +
        plan.errors.join(' | ')
      );
    }

    var spreadsheet =
      kidlearnV3_4e5cOpenSpreadsheet_();

    var responseSheet =
      kidlearnV3_4e5cGetSheetByExactName_(
        spreadsheet,
        'DATA_Responses'
      );

    if (!responseSheet) {
      throw new Error('Không tìm thấy DATA_Responses.');
    }

    responseSheet
      .getRange(
        plan.targetRowNumber,
        plan.metadataColumn.columnIndex
      )
      .setValue(plan.proposedMetaJson);

    SpreadsheetApp.flush();

    var auditWrite =
      kidlearnV3_4e5cAppendAuditRow_(
        plan,
        options
      );

    var result = {
      success: true,
      action: 'WRITE_HANDWRITING_REVIEW_ACTION_4E_5C_V3',
      phase:
        KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.PHASE,
      parentPhase:
        KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.PARENT_PHASE,
      status:
        KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_STATUS.READY_FOR_4E_5D,
      responseId:
        plan.responseId,
      responseRowNumber:
        plan.targetRowNumber,
      reviewAction:
        plan.reviewAction,
      targetReviewStatus:
        plan.targetReviewStatus,
      previousReviewStatus:
        plan.previousReviewStatus,
      reviewerId:
        plan.reviewerId,
      reviewerNote:
        plan.reviewerNote,
      fileId:
        plan.fileId,
      fileUrl:
        plan.fileUrl,
      metadataColumn:
        plan.metadataColumn.raw,
      metadataColumnIndex:
        plan.metadataColumn.columnIndex,
      auditId:
        auditWrite.auditId,
      auditRowNumber:
        auditWrite.auditRowNumber,
      prodWriteAllowed: false,
      realSheetWriteAllowed: true,
      realDriveWriteAllowedNow: false,
      actualSheetWritePerformed: true,
      dataResponsesWritePerformed: true,
      logAuditWritePerformed: true,
      actualDriveWritePerformed: false,
      nextBundle:
        KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.NEXT_STAGE,
      writtenAt:
        new Date().toISOString()
    };

    kidlearnV3_4e5cSaveReviewActionRecord_(result);

    kidlearnV3_4e5cSaveStatus_(
      result,
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_STATUS.READY_FOR_4E_5D,
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_KEYS.LAST_WRITE_AT
    );

    console.log(JSON.stringify(result, null, 2));
    return result;

  } finally {
    lock.releaseLock();
  }
}


/**
 * Verify last review action.
 */
function kidlearnV3_verifyLastHandwritingReviewAction4E5CV3() {
  var record =
    kidlearnV3_4e5cReadJsonProperty_(
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_KEYS.LAST_REVIEW_ACTION_JSON
    );

  if (!record) {
    throw new Error(
      'Không tìm thấy LAST_REVIEW_ACTION_JSON của 4E-5C.'
    );
  }

  var errors = [];
  var warnings = [];

  var spreadsheet =
    kidlearnV3_4e5cOpenSpreadsheet_();

  var responseSheet =
    kidlearnV3_4e5cGetSheetByExactName_(
      spreadsheet,
      'DATA_Responses'
    );

  if (!responseSheet) {
    errors.push('Không tìm thấy DATA_Responses.');
  }

  var actualMetaText = '';

  if (
    responseSheet &&
    record.responseRowNumber &&
    record.metadataColumnIndex
  ) {
    actualMetaText =
      String(
        responseSheet
          .getRange(
            record.responseRowNumber,
            record.metadataColumnIndex
          )
          .getValue() || ''
      );
  }

  var parsed =
    kidlearnV3_4e5cSafeJsonParse_(
      actualMetaText
    );

  if (!parsed.success) {
    errors.push(
      'answerMetaJson sau review action không phải JSON hợp lệ.'
    );
  } else {
    var meta =
      parsed.value || {};

    var asset =
      meta.handwritingAsset || {};

    var review =
      meta.handwritingReview || {};

    var assetStatus =
      String(asset.reviewStatus || '').toUpperCase();

    var reviewStatus =
      String(review.status || '').toUpperCase();

    if (
      reviewStatus !== String(record.targetReviewStatus).toUpperCase()
    ) {
      errors.push(
        'handwritingReview.status không khớp. Expected=' +
        record.targetReviewStatus +
        ', Actual=' +
        reviewStatus
      );
    }

    if (
      assetStatus !== String(record.targetReviewStatus).toUpperCase()
    ) {
      errors.push(
        'handwritingAsset.reviewStatus không khớp. Expected=' +
        record.targetReviewStatus +
        ', Actual=' +
        assetStatus
      );
    }

    if (!review.reviewedAt) {
      errors.push('Thiếu handwritingReview.reviewedAt.');
    }

    if (!review.reviewedBy) {
      errors.push('Thiếu handwritingReview.reviewedBy.');
    }
  }

  var auditCheck =
    kidlearnV3_4e5cVerifyAuditRow_(
      record.auditRowNumber,
      record.auditId
    );

  if (!auditCheck.success) {
    errors =
      errors.concat(auditCheck.errors || []);
  }

  var result = {
    success: errors.length === 0,
    action: 'VERIFY_LAST_HANDWRITING_REVIEW_ACTION_4E_5C_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_STATUS.READY_FOR_4E_5D
        : KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_STATUS.FAILED,
    responseId:
      record.responseId,
    reviewAction:
      record.reviewAction,
    targetReviewStatus:
      record.targetReviewStatus,
    auditCheck:
      auditCheck,
    actualSheetWritePerformed:
      record.actualSheetWritePerformed === true,
    dataResponsesWritePerformed:
      record.dataResponsesWritePerformed === true,
    logAuditWritePerformed:
      record.logAuditWritePerformed === true,
    actualDriveWritePerformed: false,
    prodWriteAllowed: false,
    errorCount:
      errors.length,
    warningCount:
      warnings.length,
    errors:
      errors,
    warnings:
      warnings
  };

  kidlearnV3_4e5cSaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_KEYS.LAST_VERIFY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      'Verify 4E-5C failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getHandwritingReviewAction4E5CStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_HANDWRITING_REVIEW_ACTION_4E_5C_STATUS_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_STATUS.NOT_RUN,
    lastPreflightAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_KEYS.LAST_PREFLIGHT_AT
      ) || '',
    lastWriteAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_KEYS.LAST_WRITE_AT
      ) || '',
    lastVerifyAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_KEYS.LAST_VERIFY_AT
      ) || '',
    lastResult:
      kidlearnV3_4e5cReadJsonProperty_(
        KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_KEYS.LAST_RESULT_JSON
      ),
    lastReviewAction:
      kidlearnV3_4e5cReadJsonProperty_(
        KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_KEYS.LAST_REVIEW_ACTION_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertHandwritingReviewAction4E5CReadyV3() {
  var status =
    kidlearnV3_getHandwritingReviewAction4E5CStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_STATUS.READY_FOR_4E_5D
  ) {
    errors.push(
      '4E-5C chưa READY_FOR_4E_5D. Status=' +
      status.status
    );
  }

  if (
    !status.lastReviewAction ||
    status.lastReviewAction.dataResponsesWritePerformed !== true
  ) {
    errors.push(
      'Chưa có bằng chứng dataResponsesWritePerformed=true cho 4E-5C.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_HANDWRITING_REVIEW_ACTION_4E_5C_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.PHASE,
    status:
      status.status,
    responseId:
      status.lastReviewAction ? status.lastReviewAction.responseId : '',
    reviewAction:
      status.lastReviewAction ? status.lastReviewAction.reviewAction : '',
    targetReviewStatus:
      status.lastReviewAction ? status.lastReviewAction.targetReviewStatus : '',
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    actualSheetWritePerformed:
      status.lastReviewAction
        ? status.lastReviewAction.actualSheetWritePerformed === true
        : false,
    actualDriveWritePerformed: false,
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
 * QA batch.
 * Không tự ghi review action.
 * Review action thật chạy bằng confirm wrapper hoặc UI.
 */
function kidlearnV3_runQaBatch4E5CV3() {
  var preflight =
    kidlearnV3_runHandwritingReviewActionPreflight4E5CV3();

  var status =
    kidlearnV3_getHandwritingReviewAction4E5CStatusV3();

  var result = {
    success:
      preflight.success === true &&
      status.success === true,
    suiteName:
      'PHASE_4E_5C_CONTROLLED_REVIEW_ACTION_WRITE_PREFLIGHT',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.PHASE,
    status:
      status.status,
    nextAction:
      'Run accept/retry confirm wrapper or test from UI',
    prodWriteAllowed: false,
    realSheetWriteAllowed: true,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed:
      status.lastReviewAction
        ? status.lastReviewAction.actualSheetWritePerformed === true
        : false,
    actualDriveWritePerformed: false,
    results: {
      preflight: preflight.success,
      statusReadable: status.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4E-5C QA batch failed.');
  }

  return result;
}


/**
 * Build review action plan.
 */
function kidlearnV3_4e5cBuildReviewActionPlan_(options) {
  options = options || {};

  var errors = [];
  var warnings = [];

  var e5b =
    kidlearnV3_4e5cSafeCall_(
      'kidlearnV3_assertParentReviewQueueUi4E5BReadyV3'
    );

  if (!e5b.success) {
    errors.push(
      '4E-5B chưa READY_FOR_4E_5C: ' +
      e5b.message
    );
  }

  var dev =
    kidlearnV3_4e5cCheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var actionType =
    kidlearnV3_4e5cNormalizeActionType_(
      options.actionType
    );

  if (!actionType) {
    errors.push(
      'actionType không hợp lệ. Cần ACCEPT hoặc RETRY.'
    );
  }

  var targetReviewStatus =
    kidlearnV3_4e5cResolveTargetReviewStatus_(
      actionType
    );

  var responseId =
    String(options.responseId || '').trim();

  var reviewerId =
    String(options.reviewerId || 'PARENT').trim();

  var reviewerNote =
    String(options.reviewerNote || '').trim();

  var context = null;

  try {
    context =
      kidlearnV3_getParentReviewQueueContext4E5AV3({
        limit: 100
      });
  } catch (error) {
    errors.push(
      'Không đọc được review queue context: ' +
      String(error.message || error)
    );
  }

  var targetItem = null;

  if (context && context.reviewQueue) {
    var items =
      context.reviewQueue.items || [];

    if (!responseId && items.length > 0) {
      responseId =
        items[0].responseId;

      warnings.push(
        'Không truyền responseId. Dùng pending item đầu tiên: ' +
        responseId
      );
    }

    for (var i = 0; i < items.length; i++) {
      if (
        String(items[i].responseId) === String(responseId)
      ) {
        targetItem =
          items[i];
        break;
      }
    }
  }

  if (!responseId) {
    errors.push(
      'Thiếu responseId và không tìm thấy pending item.'
    );
  }

  if (!targetItem) {
    errors.push(
      'Không tìm thấy responseId trong pending review queue: ' +
      responseId
    );
  }

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4e5cOpenSpreadsheet_();
  } catch (error2) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(error2.message || error2)
    );
  }

  var headerInfo = null;
  var metadataColumn = null;
  var responseIdColumn = null;
  var targetRowNumber = 0;
  var existingMetaText = '';
  var proposedMetaJson = '';
  var previousReviewStatus = '';

  if (spreadsheet && targetItem) {
    var responseSheet =
      kidlearnV3_4e5cGetSheetByExactName_(
        spreadsheet,
        'DATA_Responses'
      );

    if (!responseSheet) {
      errors.push('Không tìm thấy DATA_Responses.');
    } else {
      headerInfo =
        kidlearnV3_4e5cInspectSheetHeaders_(
          spreadsheet,
          'DATA_Responses',
          warnings
        );

      metadataColumn =
        kidlearnV3_4e5cFindHeaderMatch_(
          headerInfo.headers || [],
          [
            'answerMetaJson',
            'detailsJson',
            'metaJson',
            'payloadJson',
            'metadataJson'
          ]
        );

      responseIdColumn =
        kidlearnV3_4e5cFindHeaderMatch_(
          headerInfo.headers || [],
          [
            'responseId',
            'responseid',
            'id',
            'responseKey',
            'maPhanHoi',
            'maTraLoi'
          ]
        );

      if (!metadataColumn) {
        errors.push(
          'DATA_Responses thiếu answerMetaJson/detailsJson/metaJson.'
        );
      }

      if (!responseIdColumn) {
        errors.push(
          'DATA_Responses không map được responseId/id.'
        );
      }

      if (metadataColumn && responseIdColumn) {
        targetRowNumber =
          kidlearnV3_4e5cFindRowById_(
            responseSheet,
            headerInfo,
            responseIdColumn.columnIndex,
            responseId
          );

        if (!targetRowNumber && targetItem.responseRowNumber) {
          targetRowNumber =
            Number(targetItem.responseRowNumber || 0);

          warnings.push(
            'Không tìm thấy bằng scan responseId. Dùng responseRowNumber từ context.'
          );
        }

        if (!targetRowNumber) {
          errors.push(
            'Không tìm thấy row DATA_Responses cho responseId=' +
            responseId
          );
        } else {
          existingMetaText =
            String(
              responseSheet
                .getRange(
                  targetRowNumber,
                  metadataColumn.columnIndex
                )
                .getValue() || ''
            );

          var parsed =
            kidlearnV3_4e5cSafeJsonParse_(
              existingMetaText
            );

          if (!parsed.success) {
            errors.push(
              'answerMetaJson hiện tại không phải JSON hợp lệ.'
            );
          } else {
            previousReviewStatus =
              kidlearnV3_4e5cExtractReviewStatus_(
                parsed.value
              );

            if (
              previousReviewStatus !==
              KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.PENDING_STATUS
            ) {
              warnings.push(
                'Review status hiện tại không phải NEEDS_REVIEW. Current=' +
                previousReviewStatus
              );
            }

            proposedMetaJson =
              kidlearnV3_4e5cBuildReviewedMetaJson_(
                parsed.value,
                targetReviewStatus,
                reviewerId,
                reviewerNote,
                actionType
              );
          }
        }
      }
    }
  }

  return {
    success: errors.length === 0,
    action: 'BUILD_HANDWRITING_REVIEW_ACTION_PLAN_4E_5C_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.PARENT_PHASE,
    writeName:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.WRITE_NAME,
    responseId:
      responseId,
    reviewAction:
      actionType,
    targetReviewStatus:
      targetReviewStatus,
    previousReviewStatus:
      previousReviewStatus,
    reviewerId:
      reviewerId,
    reviewerNote:
      reviewerNote,
    targetRowNumber:
      targetRowNumber,
    metadataColumn:
      metadataColumn,
    responseIdColumn:
      responseIdColumn,
    fileId:
      targetItem && targetItem.handwritingAsset
        ? targetItem.handwritingAsset.fileId
        : '',
    fileUrl:
      targetItem && targetItem.handwritingAsset
        ? targetItem.handwritingAsset.fileUrl
        : '',
    existingMetaPreview:
      kidlearnV3_4e5cPreviewValue_(
        existingMetaText
      ),
    proposedMetaPreview:
      kidlearnV3_4e5cPreviewValue_(
        proposedMetaJson
      ),
    proposedMetaJson:
      proposedMetaJson,
    targetItem:
      targetItem,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowed: true,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    dataResponsesWritePerformed: false,
    logAuditWritePerformed: false,
    errorCount:
      errors.length,
    warningCount:
      kidlearnV3_4e5cUniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4e5cUniqueArray_(warnings)
  };
}


/**
 * Build sample options from first pending item.
 */
function kidlearnV3_4e5cBuildSampleReviewActionOptions_(actionType) {
  var context =
    kidlearnV3_getParentReviewQueueContext4E5AV3({
      limit: 1
    });

  var responseId = '';

  if (
    context &&
    context.reviewQueue &&
    context.reviewQueue.items &&
    context.reviewQueue.items.length > 0
  ) {
    responseId =
      context.reviewQueue.items[0].responseId;
  }

  return {
    responseId:
      responseId,
    actionType:
      actionType,
    reviewerId:
      'PARENT',
    reviewerNote:
      actionType ===
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.ACTION_RETRY
        ? 'Yêu cầu bé làm lại bài viết tay.'
        : 'Chấp nhận bài viết tay của bé.'
  };
}


/**
 * Merge review status into answerMetaJson.
 */
function kidlearnV3_4e5cBuildReviewedMetaJson_(
  meta,
  targetReviewStatus,
  reviewerId,
  reviewerNote,
  actionType
) {
  meta = meta || {};

  if (!meta.handwritingAsset) {
    meta.handwritingAsset = {};
  }

  if (!meta.handwritingReview) {
    meta.handwritingReview = {};
  }

  meta.handwritingAsset.reviewStatus =
    targetReviewStatus;

  meta.handwritingAsset.reviewedAt =
    new Date().toISOString();

  meta.handwritingReview.status =
    targetReviewStatus;

  meta.handwritingReview.reviewAction =
    actionType;

  meta.handwritingReview.reviewedBy =
    reviewerId || 'PARENT';

  meta.handwritingReview.reviewedAt =
    new Date().toISOString();

  meta.handwritingReview.reviewerNote =
    reviewerNote || '';

  meta.handwritingReview.parentReviewRequired =
    false;

  meta.updatedAt =
    new Date().toISOString();

  return JSON.stringify(meta);
}


function kidlearnV3_4e5cExtractReviewStatus_(meta) {
  meta = meta || {};

  var review =
    meta.handwritingReview || {};

  var asset =
    meta.handwritingAsset || {};

  return String(
    review.status ||
    asset.reviewStatus ||
    ''
  ).trim().toUpperCase();
}


/**
 * Append audit row.
 */
function kidlearnV3_4e5cAppendAuditRow_(plan, options) {
  var spreadsheet =
    kidlearnV3_4e5cOpenSpreadsheet_();

  var auditSheet =
    kidlearnV3_4e5cGetSheetByExactName_(
      spreadsheet,
      'LOG_Audit'
    );

  if (!auditSheet) {
    throw new Error('Không tìm thấy LOG_Audit.');
  }

  var headerInfo =
    kidlearnV3_4e5cInspectSheetHeaders_(
      spreadsheet,
      'LOG_Audit',
      []
    );

  var auditId =
    'AUD_4E5C_DEV_' + new Date().getTime();

  var details = {
    phase: '4E-5C',
    action: 'CONTROLLED_HANDWRITING_REVIEW_ACTION',
    responseId:
      plan.responseId,
    responseRowNumber:
      plan.targetRowNumber,
    reviewAction:
      plan.reviewAction,
    previousReviewStatus:
      plan.previousReviewStatus,
    targetReviewStatus:
      plan.targetReviewStatus,
    reviewerId:
      plan.reviewerId,
    reviewerNote:
      plan.reviewerNote,
    fileId:
      plan.fileId,
    fileUrl:
      plan.fileUrl,
    metadataColumn:
      plan.metadataColumn ? plan.metadataColumn.raw : '',
    actualSheetWritePerformed: true,
    actualDriveWritePerformed: false
  };

  var canonicalData = {
    auditId:
      auditId,
    action:
      'HANDWRITING_REVIEW_ACTION_4E5C',
    entityType:
      'DATA_Responses',
    entityId:
      plan.responseId,
    detailsJson:
      JSON.stringify(details),
    createdAt:
      new Date().toISOString(),
    actorId:
      plan.reviewerId || 'PARENT',
    source:
      '4E-5C',
    environment:
      'DEV'
  };

  var aliasMap =
    kidlearnV3_4e5cGetAuditFieldAliasMap_();

  var rowValues =
    kidlearnV3_4e5cBuildBlankRow_(
      headerInfo.lastColumn
    );

  var auditIdColumnIndex = 0;
  var errors = [];

  for (var key in canonicalData) {
    if (!canonicalData.hasOwnProperty(key)) continue;

    var match =
      kidlearnV3_4e5cFindHeaderMatch_(
        headerInfo.headers || [],
        aliasMap[key] || [key]
      );

    if (match) {
      rowValues[match.columnIndex - 1] =
        canonicalData[key];

      if (key === 'auditId') {
        auditIdColumnIndex =
          match.columnIndex;
      }
    }
  }

  var required = [
    'auditId',
    'action',
    'entityType',
    'entityId',
    'detailsJson',
    'createdAt'
  ];

  for (var i = 0; i < required.length; i++) {
    var requiredMatch =
      kidlearnV3_4e5cFindHeaderMatch_(
        headerInfo.headers || [],
        aliasMap[required[i]] || [required[i]]
      );

    if (!requiredMatch) {
      errors.push(
        'LOG_Audit thiếu required field: ' +
        required[i]
      );
    }
  }

  if (!auditIdColumnIndex) {
    errors.push('LOG_Audit không map được auditId.');
  }

  if (errors.length > 0) {
    throw new Error(
      'Không append audit 4E-5C. Errors=' +
      errors.join(' | ')
    );
  }

  auditSheet.appendRow(rowValues);
  SpreadsheetApp.flush();

  return {
    success: true,
    auditId: auditId,
    auditRowNumber:
      auditSheet.getLastRow()
  };
}


/**
 * Verify audit row.
 */
function kidlearnV3_4e5cVerifyAuditRow_(rowNumber, auditId) {
  var errors = [];

  var spreadsheet =
    kidlearnV3_4e5cOpenSpreadsheet_();

  var sheet =
    kidlearnV3_4e5cGetSheetByExactName_(
      spreadsheet,
      'LOG_Audit'
    );

  if (!sheet) {
    errors.push('Không tìm thấy LOG_Audit.');
  }

  var headerInfo =
    kidlearnV3_4e5cInspectSheetHeaders_(
      spreadsheet,
      'LOG_Audit',
      []
    );

  var auditIdColumn =
    kidlearnV3_4e5cFindHeaderMatch_(
      headerInfo.headers || [],
      ['auditId', 'logId', 'id']
    );

  if (!auditIdColumn) {
    errors.push('Không map được auditId column.');
  }

  var actual = '';

  if (
    errors.length === 0 &&
    sheet &&
    rowNumber &&
    auditIdColumn
  ) {
    actual =
      String(
        sheet
          .getRange(rowNumber, auditIdColumn.columnIndex)
          .getValue() || ''
      );

    if (actual !== String(auditId)) {
      errors.push(
        'Audit ID không khớp. Expected=' +
        auditId +
        ', Actual=' +
        actual
      );
    }
  }

  return {
    success: errors.length === 0,
    auditRowNumber: rowNumber,
    auditId: auditId,
    actualAuditId: actual,
    errors: errors
  };
}


/**
 * Action helpers.
 */
function kidlearnV3_4e5cNormalizeActionType_(actionType) {
  var text =
    String(actionType || '')
      .trim()
      .toUpperCase();

  if (
    text === 'ACCEPT' ||
    text === 'ACCEPTED' ||
    text === 'REVIEWED_ACCEPTED'
  ) {
    return KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.ACTION_ACCEPT;
  }

  if (
    text === 'RETRY' ||
    text === 'REQUEST_RETRY' ||
    text === 'REVIEWED_RETRY'
  ) {
    return KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.ACTION_RETRY;
  }

  return '';
}


function kidlearnV3_4e5cResolveTargetReviewStatus_(actionType) {
  if (
    actionType ===
    KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.ACTION_ACCEPT
  ) {
    return KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.STATUS_ACCEPTED;
  }

  if (
    actionType ===
    KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.ACTION_RETRY
  ) {
    return KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.STATUS_RETRY;
  }

  return '';
}


/**
 * Header helpers.
 */
function kidlearnV3_4e5cInspectSheetHeaders_(spreadsheet, sheetName, warnings) {
  warnings = warnings || [];

  if (
    typeof kidlearnV3_4e5aInspectSheetHeaders_ === 'function'
  ) {
    return kidlearnV3_4e5aInspectSheetHeaders_(
      spreadsheet,
      sheetName,
      warnings
    );
  }

  if (
    typeof kidlearnV3_4e4InspectSheetHeaders_ === 'function'
  ) {
    return kidlearnV3_4e4InspectSheetHeaders_(
      spreadsheet,
      sheetName,
      warnings
    );
  }

  var sheet =
    kidlearnV3_4e5cGetSheetByExactName_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return {
      exists: false,
      sheetName: sheetName,
      headerRowIndex: 0,
      dataStartRowIndex: 0,
      lastRow: 0,
      lastColumn: 0,
      headers: []
    };
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (lastRow < 1 || lastColumn < 1) {
    return {
      exists: true,
      sheetName: sheetName,
      headerRowIndex: 1,
      dataStartRowIndex: 2,
      lastRow: lastRow,
      lastColumn: lastColumn,
      headers: []
    };
  }

  var values =
    sheet
      .getRange(1, 1, Math.min(2, lastRow), lastColumn)
      .getValues();

  var headerRowIndex = 1;

  if (
    values.length > 1 &&
    kidlearnV3_4e5cHeaderScore_(values[1]) >=
      kidlearnV3_4e5cHeaderScore_(values[0]) &&
    kidlearnV3_4e5cHeaderScore_(values[1]) >= 3
  ) {
    headerRowIndex = 2;
  }

  var row =
    values[headerRowIndex - 1] || [];

  var headers = [];

  for (var i = 0; i < row.length; i++) {
    var raw =
      String(row[i] || '').trim();

    if (!raw) continue;

    headers.push({
      columnIndex:
        i + 1,
      raw:
        raw,
      normalized:
        kidlearnV3_4e5cNormalizeLookupKey_(raw)
    });
  }

  return {
    exists: true,
    sheetName:
      sheetName,
    headerRowIndex:
      headerRowIndex,
    dataStartRowIndex:
      headerRowIndex + 1,
    lastRow:
      lastRow,
    lastColumn:
      lastColumn,
    headers:
      headers
  };
}


function kidlearnV3_4e5cHeaderScore_(row) {
  var score = 0;

  for (var i = 0; i < row.length; i++) {
    var value =
      String(row[i] || '').trim();

    if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
      score++;
    }
  }

  return score;
}


function kidlearnV3_4e5cFindHeaderMatch_(headers, aliases) {
  var map = {};

  for (var i = 0; i < aliases.length; i++) {
    map[
      kidlearnV3_4e5cNormalizeLookupKey_(aliases[i])
    ] = true;
  }

  for (var j = 0; j < headers.length; j++) {
    if (map[headers[j].normalized]) {
      return headers[j];
    }
  }

  return null;
}


function kidlearnV3_4e5cFindRowById_(
  sheet,
  headerInfo,
  idColumnIndex,
  expectedId
) {
  if (!sheet || !idColumnIndex || !expectedId) return 0;

  var startRow =
    headerInfo.dataStartRowIndex || headerInfo.headerRowIndex + 1;

  var lastRow =
    sheet.getLastRow();

  if (lastRow < startRow) return 0;

  var rowCount =
    lastRow - startRow + 1;

  var values =
    sheet
      .getRange(startRow, idColumnIndex, rowCount, 1)
      .getValues();

  for (var i = 0; i < rowCount; i++) {
    if (
      String(values[i][0]) === String(expectedId)
    ) {
      return startRow + i;
    }
  }

  return 0;
}


/**
 * Spreadsheet helpers.
 */
function kidlearnV3_4e5cOpenSpreadsheet_() {
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


function kidlearnV3_4e5cGetSheetByExactName_(spreadsheet, sheetName) {
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


/**
 * Audit alias.
 */
function kidlearnV3_4e5cGetAuditFieldAliasMap_() {
  if (
    typeof kidlearnV3_4e4GetAuditFieldAliasMap_ === 'function'
  ) {
    return kidlearnV3_4e4GetAuditFieldAliasMap_();
  }

  if (
    typeof kidlearnV3_4e3GetAuditFieldAliasMap_ === 'function'
  ) {
    return kidlearnV3_4e3GetAuditFieldAliasMap_();
  }

  return {
    auditId: ['auditId', 'auditid', 'logId', 'logid', 'id'],
    action: ['action', 'actionType', 'event', 'operation'],
    entityType: ['entityType', 'targetSheet', 'sheetName', 'objectType'],
    entityId: ['entityId', 'targetId', 'objectId', 'recordId'],
    detailsJson: ['detailsJson', 'payloadJson', 'metaJson', 'description'],
    createdAt: ['createdAt', 'timestamp', 'time', 'loggedAt'],
    actorId: ['actorId', 'userId'],
    source: ['source', 'module', 'phase'],
    environment: ['environment', 'env']
  };
}


function kidlearnV3_4e5cBuildBlankRow_(length) {
  var row = [];

  for (var i = 0; i < length; i++) {
    row.push('');
  }

  return row;
}


/**
 * DEV safety.
 */
function kidlearnV3_4e5cCheckDevSafety_() {
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
    success: errors.length === 0,
    environment:
      environment || 'UNKNOWN',
    prodWriteAllowed: false,
    errors: errors
  };
}


/**
 * Generic helpers.
 */
function kidlearnV3_4e5cNormalizeLookupKey_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .replace(/-/g, '')
    .replace(/[^\w]/g, '');
}


function kidlearnV3_4e5cPreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 220) {
    return text.substring(0, 220) + '...';
  }

  return text;
}


function kidlearnV3_4e5cSafeJsonParse_(text) {
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


function kidlearnV3_4e5cUniqueArray_(items) {
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


function kidlearnV3_4e5cSafeCall_(functionName) {
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

    var output =
      eval(functionName)();

    return {
      success:
        output && output.success === true,
      functionName:
        functionName,
      message:
        output && output.success === true
          ? ''
          : JSON.stringify(output),
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


function kidlearnV3_4e5cSaveReviewActionRecord_(record) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_KEYS.LAST_REVIEW_ACTION_JSON,
      JSON.stringify(record)
    );
}


function kidlearnV3_4e5cSaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.PARENT_PHASE,
      status:
        status,
      writeName:
        KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.WRITE_NAME,
      responseId:
        result.responseId || '',
      reviewAction:
        result.reviewAction || '',
      targetReviewStatus:
        result.targetReviewStatus || '',
      nextBundle:
        KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_PARENT_REVIEW_ACTION_4E5C_CONFIG.NEXT_STAGE,
      prodWriteAllowed:
        false,
      actualSheetWritePerformed:
        result.actualSheetWritePerformed === true,
      actualDriveWritePerformed:
        result.actualDriveWritePerformed === true,
      dataResponsesWritePerformed:
        result.dataResponsesWritePerformed === true,
      logAuditWritePerformed:
        result.logAuditWritePerformed === true,
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


function kidlearnV3_4e5cReadJsonProperty_(key) {
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

function kidlearnV3_previewAcceptHandwritingReview4E5COnce() {
  return kidlearnV3_previewHandwritingReviewAction4E5CV3({
    actionType: 'ACCEPT',
    reviewerId: 'PARENT',
    reviewerNote: 'Chấp nhận bài viết tay của bé.'
  });
}


function kidlearnV3_previewRetryHandwritingReview4E5COnce() {
  return kidlearnV3_previewHandwritingReviewAction4E5CV3({
    actionType: 'RETRY',
    reviewerId: 'PARENT',
    reviewerNote: 'Yêu cầu bé làm lại bài viết tay.'
  });
}