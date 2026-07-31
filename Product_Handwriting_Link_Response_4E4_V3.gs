/**
 * ================================================================
 * KIDLEARN V3 - LINK HANDWRITING ASSET TO DATA_RESPONSES
 * Step: 4E-4
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Link Drive handwriting PNG asset from 4E-3 to DATA_Responses.answerMetaJson.
 * - Set reviewStatus = NEEDS_REVIEW.
 * - Append audit row into LOG_Audit.
 *
 * Safety:
 * - DEV only.
 * - Requires 4E-3 READY_FOR_4E_4.
 * - Requires confirm text.
 * - Does not create Drive folder/file.
 * - Updates only 1 DATA_Responses row.
 */


var KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4E4_STATUS',
  LAST_PREFLIGHT_AT: 'KIDLEARN_V3_PHASE_4E4_LAST_PREFLIGHT_AT',
  LAST_WRITE_AT: 'KIDLEARN_V3_PHASE_4E4_LAST_WRITE_AT',
  LAST_VERIFY_AT: 'KIDLEARN_V3_PHASE_4E4_LAST_VERIFY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4E4_LAST_RESULT_JSON',
  LAST_LINK_JSON: 'KIDLEARN_V3_PHASE_4E4_LAST_LINK_JSON'
};


var KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREFLIGHT_PASSED: 'PREFLIGHT_PASSED',
  READY_FOR_4E_5: 'READY_FOR_4E_5',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG = {
  PHASE: '4E-4',
  PARENT_PHASE: '4E',
  PREVIOUS_BUNDLE: '4E-3',
  NEXT_BUNDLE: '4E-5',
  NEXT_STAGE: 'PARENT_REVIEW_QUEUE_UI',
  WRITE_NAME: 'LINK_HANDWRITING_ASSET_TO_DATA_RESPONSES',
  CONFIRM_TEXT: 'CONFIRM_LINK_HANDWRITING_ASSET_TO_RESPONSE_4E4',
  DEFAULT_REVIEW_STATUS: 'NEEDS_REVIEW',
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED: true,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Preview link operation.
 * Không ghi Sheet.
 */
function kidlearnV3_previewLinkHandwritingAssetToResponse4E4V3() {
  var plan =
    kidlearnV3_4e4BuildLinkPlan_();

  plan.action =
    'PREVIEW_LINK_HANDWRITING_ASSET_TO_RESPONSE_4E_4_V3';

  kidlearnV3_4e4SaveStatus_(
    plan,
    plan.success
      ? KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_STATUS.PREFLIGHT_PASSED
      : KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_STATUS.FAILED,
    KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_KEYS.LAST_PREFLIGHT_AT
  );

  console.log(JSON.stringify({
    success: plan.success,
    action: plan.action,
    phase: plan.phase,
    responseId: plan.responseId,
    assetId: plan.assetId,
    fileId: plan.fileId,
    targetRowNumber: plan.targetRowNumber,
    metadataColumn: plan.metadataColumn ? plan.metadataColumn.raw : '',
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    errorCount: plan.errorCount,
    warningCount: plan.warningCount,
    errors: plan.errors,
    warnings: plan.warnings
  }, null, 2));

  if (!plan.success) {
    throw new Error(
      '4E-4 preview failed. Errors=' +
      plan.errors.join(' | ')
    );
  }

  return plan;
}


/**
 * Preflight only.
 */
function kidlearnV3_runLinkHandwritingAssetToResponsePreflight4E4V3() {
  var result =
    kidlearnV3_previewLinkHandwritingAssetToResponse4E4V3();

  result.action =
    'RUN_LINK_HANDWRITING_ASSET_TO_RESPONSE_PREFLIGHT_4E_4_V3';

  kidlearnV3_4e4SaveStatus_(
    result,
    KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_STATUS.PREFLIGHT_PASSED,
    KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_KEYS.LAST_PREFLIGHT_AT
  );

  console.log(JSON.stringify({
    success: result.success,
    action: result.action,
    phase: result.phase,
    status:
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_STATUS.PREFLIGHT_PASSED,
    nextAction:
      'Run kidlearnV3_linkHandwritingAssetToResponse4E4ConfirmV3',
    actualSheetWritePerformed: false,
    errorCount: result.errorCount,
    warningCount: result.warningCount
  }, null, 2));

  return result;
}


/**
 * Public confirm wrapper.
 */
function kidlearnV3_linkHandwritingAssetToResponse4E4ConfirmV3() {
  return kidlearnV3_linkHandwritingAssetToResponse4E4V3({
    confirm:
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.CONFIRM_TEXT,
    reviewerNote:
      'Controlled DEV Sheet write. Link handwriting Drive asset to DATA_Responses.answerMetaJson.'
  });
}


/**
 * Controlled real Sheet write.
 */
function kidlearnV3_linkHandwritingAssetToResponse4E4V3(options) {
  options = options || {};

  var confirmText =
    String(options.confirm || '')
      .trim()
      .toUpperCase();

  if (
    confirmText !==
    KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm. Cần confirm=' +
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.CONFIRM_TEXT
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
      kidlearnV3_4e4BuildLinkPlan_();

    if (!plan.success) {
      throw new Error(
        'Preflight 4E-4 chưa pass. Errors=' +
        plan.errors.join(' | ')
      );
    }

    var spreadsheet =
      kidlearnV3_4e4OpenSpreadsheet_();

    var responseSheet =
      kidlearnV3_4e4GetSheetByExactName_(
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
      kidlearnV3_4e4AppendAuditRow_(
        plan,
        String(options.reviewerNote || '')
      );

    var result = {
      success: true,
      action: 'LINK_HANDWRITING_ASSET_TO_RESPONSE_4E_4_V3',
      phase:
        KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.PHASE,
      parentPhase:
        KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.PARENT_PHASE,
      status:
        KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_STATUS.READY_FOR_4E_5,
      responseId:
        plan.responseId,
      responseRowNumber:
        plan.targetRowNumber,
      assetId:
        plan.assetId,
      fileId:
        plan.fileId,
      fileUrl:
        plan.fileUrl,
      fileName:
        plan.fileName,
      reviewStatus:
        KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.DEFAULT_REVIEW_STATUS,
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
        KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.NEXT_STAGE,
      linkedAt:
        new Date().toISOString()
    };

    kidlearnV3_4e4SaveLinkRecord_(result);

    kidlearnV3_4e4SaveStatus_(
      result,
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_STATUS.READY_FOR_4E_5,
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_KEYS.LAST_WRITE_AT
    );

    console.log(JSON.stringify(result, null, 2));
    return result;

  } finally {
    lock.releaseLock();
  }
}


/**
 * Verify last link.
 */
function kidlearnV3_verifyLastHandwritingAssetLink4E4V3() {
  var linkRecord =
    kidlearnV3_4e4ReadJsonProperty_(
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_KEYS.LAST_LINK_JSON
    );

  if (!linkRecord) {
    throw new Error(
      'Không tìm thấy LAST_LINK_JSON của 4E-4.'
    );
  }

  var errors = [];
  var warnings = [];

  var spreadsheet =
    kidlearnV3_4e4OpenSpreadsheet_();

  var responseSheet =
    kidlearnV3_4e4GetSheetByExactName_(
      spreadsheet,
      'DATA_Responses'
    );

  if (!responseSheet) {
    errors.push('Không tìm thấy DATA_Responses.');
  }

  var actualMetaText = '';

  if (responseSheet && linkRecord.responseRowNumber) {
    actualMetaText =
      String(
        responseSheet
          .getRange(
            linkRecord.responseRowNumber,
            linkRecord.metadataColumnIndex
          )
          .getValue() || ''
      );
  }

  var parsed =
    kidlearnV3_4e4SafeJsonParse_(
      actualMetaText
    );

  if (!parsed.success) {
    errors.push(
      'answerMetaJson sau khi link không phải JSON hợp lệ.'
    );
  } else {
    var asset =
      parsed.value.handwritingAsset || {};

    if (asset.fileId !== linkRecord.fileId) {
      errors.push(
        'fileId trong answerMetaJson không khớp. Expected=' +
        linkRecord.fileId +
        ', Actual=' +
        asset.fileId
      );
    }

    if (
      asset.reviewStatus !==
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.DEFAULT_REVIEW_STATUS
    ) {
      errors.push(
        'reviewStatus chưa đúng. Expected=NEEDS_REVIEW, Actual=' +
        asset.reviewStatus
      );
    }
  }

  var auditCheck =
    kidlearnV3_4e4VerifyAuditRow_(
      linkRecord.auditRowNumber,
      linkRecord.auditId
    );

  if (!auditCheck.success) {
    errors =
      errors.concat(auditCheck.errors || []);
  }

  var result = {
    success: errors.length === 0,
    action: 'VERIFY_LAST_HANDWRITING_ASSET_LINK_4E_4_V3',
    phase:
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_STATUS.READY_FOR_4E_5
        : KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_STATUS.FAILED,
    responseId:
      linkRecord.responseId,
    assetId:
      linkRecord.assetId,
    fileId:
      linkRecord.fileId,
    reviewStatus:
      parsed.success && parsed.value.handwritingAsset
        ? parsed.value.handwritingAsset.reviewStatus
        : '',
    auditCheck:
      auditCheck,
    actualSheetWritePerformed:
      linkRecord.actualSheetWritePerformed === true,
    dataResponsesWritePerformed:
      linkRecord.dataResponsesWritePerformed === true,
    logAuditWritePerformed:
      linkRecord.logAuditWritePerformed === true,
    actualDriveWritePerformed: false,
    prodWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4e4SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_KEYS.LAST_VERIFY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      'Verify 4E-4 failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Get 4E-4 status.
 */
function kidlearnV3_getHandwritingAssetLink4E4StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_HANDWRITING_ASSET_LINK_4E_4_STATUS_V3',
    phase:
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_KEYS.STATUS
      ) ||
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_STATUS.NOT_RUN,
    lastPreflightAt:
      properties.getProperty(
        KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_KEYS.LAST_PREFLIGHT_AT
      ) || '',
    lastWriteAt:
      properties.getProperty(
        KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_KEYS.LAST_WRITE_AT
      ) || '',
    lastVerifyAt:
      properties.getProperty(
        KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_KEYS.LAST_VERIFY_AT
      ) || '',
    lastResult:
      kidlearnV3_4e4ReadJsonProperty_(
        KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_KEYS.LAST_RESULT_JSON
      ),
    lastLink:
      kidlearnV3_4e4ReadJsonProperty_(
        KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_KEYS.LAST_LINK_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready for 4E-5.
 */
function kidlearnV3_assertHandwritingAssetLink4E4ReadyV3() {
  var status =
    kidlearnV3_getHandwritingAssetLink4E4StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_STATUS.READY_FOR_4E_5
  ) {
    errors.push(
      '4E-4 chưa READY_FOR_4E_5. Status=' +
      status.status
    );
  }

  if (
    !status.lastLink ||
    status.lastLink.dataResponsesWritePerformed !== true
  ) {
    errors.push(
      'Chưa có bằng chứng dataResponsesWritePerformed=true cho 4E-4.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_HANDWRITING_ASSET_LINK_4E_4_READY_V3',
    phase:
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.PHASE,
    status:
      status.status,
    responseId:
      status.lastLink ? status.lastLink.responseId : '',
    fileId:
      status.lastLink ? status.lastLink.fileId : '',
    reviewStatus:
      status.lastLink ? status.lastLink.reviewStatus : '',
    nextBundle:
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    actualDriveWritePerformed: false,
    actualSheetWritePerformed:
      status.lastLink
        ? status.lastLink.actualSheetWritePerformed === true
        : false,
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
 * Build link plan.
 */
function kidlearnV3_4e4BuildLinkPlan_() {
  var errors = [];
  var warnings = [];

  var e3 =
    kidlearnV3_4e4SafeCall_(
      'kidlearnV3_assertHandwritingDriveWrite4E3ReadyV3'
    );

  if (!e3.success) {
    errors.push(
      '4E-3 chưa READY_FOR_4E_4: ' +
      e3.message
    );
  }

  var dev =
    kidlearnV3_4e4CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var asset =
    kidlearnV3_4e4ReadLastAsset4E3_();

  if (!asset) {
    errors.push(
      'Không đọc được LAST_ASSET_JSON từ 4E-3.'
    );
  }

  if (asset && !asset.fileId) {
    errors.push('4E-3 asset thiếu fileId.');
  }

  if (asset && !asset.responseId) {
    errors.push('4E-3 asset thiếu responseId.');
  }

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4e4OpenSpreadsheet_();
  } catch (error) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(error.message || error)
    );
  }

  var headerInfo = null;
  var metadataColumn = null;
  var responseIdColumn = null;
  var targetRowNumber = 0;
  var existingMetaText = '';
  var proposedMetaJson = '';

  if (spreadsheet && asset) {
    headerInfo =
      kidlearnV3_4e4InspectSheetHeaders_(
        spreadsheet,
        'DATA_Responses',
        warnings
      );

    if (!headerInfo.exists) {
      errors.push('Không tìm thấy DATA_Responses.');
    } else {
      metadataColumn =
        kidlearnV3_4e4FindHeaderMatch_(
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
        kidlearnV3_4e4FindHeaderMatch_(
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
        var responseSheet =
          kidlearnV3_4e4GetSheetByExactName_(
            spreadsheet,
            'DATA_Responses'
          );

        targetRowNumber =
          kidlearnV3_4e4FindRowById_(
            responseSheet,
            headerInfo,
            responseIdColumn.columnIndex,
            asset.responseId
          );

        if (!targetRowNumber && asset.responseRowNumber) {
          warnings.push(
            'Không tìm thấy responseId bằng scan. Dùng responseRowNumber từ 4E-3.'
          );

          targetRowNumber =
            Number(asset.responseRowNumber || 0);
        }

        if (!targetRowNumber) {
          errors.push(
            'Không tìm thấy row DATA_Responses cho responseId=' +
            asset.responseId
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

          proposedMetaJson =
            kidlearnV3_4e4BuildMergedMetaJson_(
              existingMetaText,
              asset
            );
        }
      }
    }
  }

  return {
    success: errors.length === 0,
    action: 'BUILD_LINK_HANDWRITING_ASSET_TO_RESPONSE_PLAN_4E_4_V3',
    phase:
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.PARENT_PHASE,
    writeName:
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.WRITE_NAME,
    responseId:
      asset ? asset.responseId : '',
    responseRowNumberFromAsset:
      asset ? asset.responseRowNumber : '',
    targetRowNumber:
      targetRowNumber,
    assetId:
      asset ? asset.assetId : '',
    fileId:
      asset ? asset.fileId : '',
    fileUrl:
      asset ? asset.fileUrl : '',
    fileName:
      asset ? asset.fileName : '',
    metadataColumn:
      metadataColumn,
    responseIdColumn:
      responseIdColumn,
    existingMetaPreview:
      kidlearnV3_4e4PreviewValue_(existingMetaText),
    proposedMetaPreview:
      kidlearnV3_4e4PreviewValue_(proposedMetaJson),
    proposedMetaJson:
      proposedMetaJson,
    proposedReviewStatus:
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.DEFAULT_REVIEW_STATUS,
    nextBundle:
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowed: true,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    dataResponsesWritePerformed: false,
    logAuditWritePerformed: false,
    errorCount: errors.length,
    warningCount:
      kidlearnV3_4e4UniqueArray_(warnings).length,
    errors: errors,
    warnings:
      kidlearnV3_4e4UniqueArray_(warnings)
  };
}


/**
 * Build merged answerMetaJson.
 */
function kidlearnV3_4e4BuildMergedMetaJson_(existingMetaText, asset) {
  var parsed =
    kidlearnV3_4e4SafeJsonParse_(
      existingMetaText
    );

  var meta = {};

  if (parsed.success) {
    meta =
      parsed.value || {};
  } else {
    meta = {
      legacyMetaText:
        existingMetaText,
      legacyMetaParseError:
        parsed.error || 'Invalid JSON before 4E-4 merge'
    };
  }

  meta.answerMode =
    asset.answerMode || 'HANDWRITE_INPUT';

  meta.handwritingAsset = {
    assetId:
      asset.assetId,
    storage:
      'GOOGLE_DRIVE',
    fileId:
      asset.fileId,
    fileUrl:
      asset.fileUrl,
    fileName:
      asset.fileName,
    mimeType:
      asset.mimeType || 'image/png',
    drivePath:
      asset.drivePath,
    fileSizeBytes:
      asset.fileSizeBytes,
    reviewStatus:
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.DEFAULT_REVIEW_STATUS,
    sourcePhase:
      '4E-4',
    createdAt:
      asset.createdAt || '',
    linkedAt:
      new Date().toISOString()
  };

  meta.handwritingReview = {
    status:
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.DEFAULT_REVIEW_STATUS,
    autoOcrEnabled:
      false,
    aiAutoGradingEnabled:
      false,
    parentReviewRequired:
      true,
    reviewedAt:
      '',
    reviewedBy:
      '',
    reviewerNote:
      ''
  };

  meta.updatedAt =
    new Date().toISOString();

  return JSON.stringify(meta);
}


/**
 * Append audit row.
 */
function kidlearnV3_4e4AppendAuditRow_(plan, reviewerNote) {
  var spreadsheet =
    kidlearnV3_4e4OpenSpreadsheet_();

  var auditSheet =
    kidlearnV3_4e4GetSheetByExactName_(
      spreadsheet,
      'LOG_Audit'
    );

  if (!auditSheet) {
    throw new Error('Không tìm thấy LOG_Audit.');
  }

  var headerInfo =
    kidlearnV3_4e4InspectSheetHeaders_(
      spreadsheet,
      'LOG_Audit',
      []
    );

  var auditId =
    'AUD_4E4_DEV_' + new Date().getTime();

  var details = {
    phase: '4E-4',
    action: 'LINK_HANDWRITING_ASSET_TO_DATA_RESPONSES',
    responseId:
      plan.responseId,
    responseRowNumber:
      plan.targetRowNumber,
    assetId:
      plan.assetId,
    fileId:
      plan.fileId,
    fileUrl:
      plan.fileUrl,
    fileName:
      plan.fileName,
    metadataColumn:
      plan.metadataColumn ? plan.metadataColumn.raw : '',
    reviewStatus:
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.DEFAULT_REVIEW_STATUS,
    actualSheetWritePerformed: true,
    actualDriveWritePerformed: false,
    note:
      reviewerNote || ''
  };

  var canonicalData = {
    auditId:
      auditId,
    action:
      'LINK_HANDWRITING_ASSET_TO_RESPONSE_4E4',
    entityType:
      'DATA_Responses',
    entityId:
      plan.responseId,
    detailsJson:
      JSON.stringify(details),
    createdAt:
      new Date().toISOString(),
    actorId:
      'SYSTEM_4E4',
    source:
      '4E-4',
    environment:
      'DEV'
  };

  var aliasMap =
    kidlearnV3_4e4GetAuditFieldAliasMap_();

  var rowValues =
    kidlearnV3_4e4BuildBlankRow_(
      headerInfo.lastColumn
    );

  var auditIdColumnIndex = 0;
  var errors = [];

  for (var key in canonicalData) {
    if (!canonicalData.hasOwnProperty(key)) continue;

    var match =
      kidlearnV3_4e4FindHeaderMatch_(
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
      kidlearnV3_4e4FindHeaderMatch_(
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
      'Không append audit 4E-4. Errors=' +
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
function kidlearnV3_4e4VerifyAuditRow_(rowNumber, auditId) {
  var errors = [];

  var spreadsheet =
    kidlearnV3_4e4OpenSpreadsheet_();

  var sheet =
    kidlearnV3_4e4GetSheetByExactName_(
      spreadsheet,
      'LOG_Audit'
    );

  if (!sheet) {
    errors.push('Không tìm thấy LOG_Audit.');
  }

  var headerInfo =
    kidlearnV3_4e4InspectSheetHeaders_(
      spreadsheet,
      'LOG_Audit',
      []
    );

  var auditIdColumn =
    kidlearnV3_4e4FindHeaderMatch_(
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
 * Read 4E-3 last asset.
 */
function kidlearnV3_4e4ReadLastAsset4E3_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        'KIDLEARN_V3_PHASE_4E3_LAST_ASSET_JSON'
      );

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    return null;
  }
}


/**
 * Header helpers.
 */
function kidlearnV3_4e4InspectSheetHeaders_(spreadsheet, sheetName, warnings) {
  warnings = warnings || [];

  if (
    typeof kidlearnV3_4e3InspectSheetHeaders_ === 'function'
  ) {
    return kidlearnV3_4e3InspectSheetHeaders_(
      spreadsheet,
      sheetName,
      warnings
    );
  }

  if (
    typeof kidlearnV3_4e2InspectSheetHeaders_ === 'function'
  ) {
    return kidlearnV3_4e2InspectSheetHeaders_(
      spreadsheet,
      sheetName,
      warnings
    );
  }

  var sheet =
    kidlearnV3_4e4GetSheetByExactName_(
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

  var values =
    sheet
      .getRange(1, 1, Math.min(2, lastRow), lastColumn)
      .getValues();

  var headerRowIndex = 1;

  if (
    values.length > 1 &&
    kidlearnV3_4e4HeaderScore_(values[1]) >=
      kidlearnV3_4e4HeaderScore_(values[0]) &&
    kidlearnV3_4e4HeaderScore_(values[1]) >= 3
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
      columnIndex: i + 1,
      raw: raw,
      normalized:
        kidlearnV3_4e4NormalizeLookupKey_(raw)
    });
  }

  return {
    exists: true,
    sheetName: sheetName,
    headerRowIndex: headerRowIndex,
    dataStartRowIndex: headerRowIndex + 1,
    lastRow: lastRow,
    lastColumn: lastColumn,
    headers: headers
  };
}


function kidlearnV3_4e4HeaderScore_(row) {
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


function kidlearnV3_4e4FindHeaderMatch_(headers, aliases) {
  var map = {};

  for (var i = 0; i < aliases.length; i++) {
    map[
      kidlearnV3_4e4NormalizeLookupKey_(aliases[i])
    ] = true;
  }

  for (var j = 0; j < headers.length; j++) {
    if (map[headers[j].normalized]) {
      return headers[j];
    }
  }

  return null;
}


function kidlearnV3_4e4FindRowById_(
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
function kidlearnV3_4e4OpenSpreadsheet_() {
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


function kidlearnV3_4e4GetSheetByExactName_(spreadsheet, sheetName) {
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
function kidlearnV3_4e4GetAuditFieldAliasMap_() {
  if (
    typeof kidlearnV3_4e3GetAuditFieldAliasMap_ === 'function'
  ) {
    return kidlearnV3_4e3GetAuditFieldAliasMap_();
  }

  if (
    typeof kidlearnV3_4e2GetAuditFieldAliasMap_ === 'function'
  ) {
    return kidlearnV3_4e2GetAuditFieldAliasMap_();
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


function kidlearnV3_4e4BuildBlankRow_(length) {
  var row = [];

  for (var i = 0; i < length; i++) {
    row.push('');
  }

  return row;
}


/**
 * DEV safety.
 */
function kidlearnV3_4e4CheckDevSafety_() {
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
function kidlearnV3_4e4NormalizeLookupKey_(value) {
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


function kidlearnV3_4e4PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 220) {
    return text.substring(0, 220) + '...';
  }

  return text;
}


function kidlearnV3_4e4SafeJsonParse_(text) {
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


function kidlearnV3_4e4UniqueArray_(items) {
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


function kidlearnV3_4e4SafeCall_(functionName) {
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


function kidlearnV3_4e4SaveLinkRecord_(record) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_KEYS.LAST_LINK_JSON,
      JSON.stringify(record)
    );
}


function kidlearnV3_4e4SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.PARENT_PHASE,
      status: status,
      writeName:
        KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.WRITE_NAME,
      nextBundle:
        KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_HANDWRITING_LINK_RESPONSE_4E4_CONFIG.NEXT_STAGE,
      prodWriteAllowed: false,
      actualSheetWritePerformed:
        result.actualSheetWritePerformed === true,
      actualDriveWritePerformed:
        result.actualDriveWritePerformed === true,
      dataResponsesWritePerformed:
        result.dataResponsesWritePerformed === true,
      logAuditWritePerformed:
        result.logAuditWritePerformed === true,
      responseId:
        result.responseId || '',
      assetId:
        result.assetId || '',
      fileId:
        result.fileId || '',
      reviewStatus:
        result.reviewStatus || '',
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


function kidlearnV3_4e4ReadJsonProperty_(key) {
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