/**
 * ================================================================
 * KIDLEARN V3 - HANDWRITING UPLOAD DRY-RUN PREVIEW
 * Step: 4E-2
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Build dry-run preview for saving handwriting canvas PNG to Google Drive.
 * - Build dry-run preview for updating DATA_Responses.answerMetaJson.
 * - Build dry-run preview for LOG_Audit.
 *
 * Safety:
 * - Không tạo Google Drive folder.
 * - Không tạo Google Drive file.
 * - Không ghi DATA_Responses.
 * - Không ghi LOG_Audit.
 * - Không ghi PROD.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4E-2.
 */


var KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4E2_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4E2_LAST_PREVIEW_AT',
  LAST_CHECK_AT: 'KIDLEARN_V3_PHASE_4E2_LAST_CHECK_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4E2_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4E2_LAST_RESULT_JSON'
};


var KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  CHECK_PASSED: 'CHECK_PASSED',
  READY_FOR_4E_3: 'READY_FOR_4E_3',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG = {
  PHASE: '4E-2',
  PARENT_PHASE: '4E',
  PREVIOUS_BUNDLE: '4E-1',
  NEXT_BUNDLE: '4E-3',
  NEXT_STAGE: 'CONTROLLED_DEV_DRIVE_WRITE_SAVE_CANVAS_PNG',
  DRY_RUN_NAME: 'HANDWRITING_UPLOAD_DRY_RUN_PREVIEW',
  ROOT_ASSET_FOLDER_NAME: 'KIDLEARN_DEV_ASSETS',
  HANDWRITING_FOLDER_NAME: 'HANDWRITING_RESPONSES',
  DEFAULT_REVIEW_STATUS: 'NEEDS_REVIEW',
  MIME_TYPE: 'image/png',
  FILE_EXTENSION: '.png',
  PROD_WRITE_ALLOWED: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false
};


/**
 * Main dry-run preview.
 * Không ghi Drive, không ghi Sheet.
 */
function kidlearnV3_buildHandwritingUploadDryRunPreview4E2V3(payload) {
  payload = payload || {};

  var errors = [];
  var warnings = [];

  var e1 =
    kidlearnV3_4e2SafeCall_(
      'kidlearnV3_assertHandwritingStorageReadiness4E1ReadyV3'
    );

  if (!e1.success) {
    errors.push(
      '4E-1 chưa READY_FOR_4E_2: ' +
      e1.message
    );
  }

  var devSafety =
    kidlearnV3_4e2CheckDevSafety_();

  if (!devSafety.success) {
    errors =
      errors.concat(devSafety.errors || []);
  }

  warnings =
    warnings.concat(devSafety.warnings || []);

  var normalized =
    kidlearnV3_4e2NormalizePayload_(payload);

  var canvasCheck =
    kidlearnV3_4e2ValidateCanvasDataUrl_(
      normalized.canvasDataUrl
    );

  if (!canvasCheck.success) {
    errors =
      errors.concat(canvasCheck.errors || []);
  }

  warnings =
    warnings.concat(canvasCheck.warnings || []);

  var targetResponse =
    kidlearnV3_4e2ResolveTargetResponse_(
      normalized,
      warnings
    );

  if (!targetResponse.success) {
    errors =
      errors.concat(targetResponse.errors || []);
  }

  var drivePlan =
    kidlearnV3_4e2BuildDriveUploadPlan_(
      normalized,
      targetResponse,
      canvasCheck,
      warnings
    );

  if (!drivePlan.success) {
    errors =
      errors.concat(drivePlan.errors || []);
  }

  warnings =
    warnings.concat(drivePlan.warnings || []);

  var metadataPlan =
    kidlearnV3_4e2BuildResponseMetadataUpdatePlan_(
      normalized,
      targetResponse,
      drivePlan,
      canvasCheck,
      warnings
    );

  if (!metadataPlan.success) {
    errors =
      errors.concat(metadataPlan.errors || []);
  }

  warnings =
    warnings.concat(metadataPlan.warnings || []);

  var auditPlan =
    kidlearnV3_4e2BuildAuditPreviewPlan_(
      normalized,
      targetResponse,
      drivePlan,
      metadataPlan,
      warnings
    );

  if (!auditPlan.success) {
    errors =
      errors.concat(auditPlan.errors || []);
  }

  warnings =
    warnings.concat(auditPlan.warnings || []);

  var result = {
    success: errors.length === 0,
    action: 'BUILD_HANDWRITING_UPLOAD_DRY_RUN_PREVIEW_4E_2_V3',
    phase:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.PARENT_PHASE,
    dryRunName:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.DRY_RUN_NAME,
    nextBundle:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realDriveWriteAllowedNow: false,
    realSheetWriteAllowedNow: false,
    actualDriveWritePerformed: false,
    actualSheetWritePerformed: false,
    actualAuditWritePerformed: false,
    normalizedPayload:
      kidlearnV3_4e2RedactPayloadForLog_(normalized),
    canvasCheck: canvasCheck,
    targetResponse: targetResponse,
    driveUploadPreview: drivePlan,
    responseMetadataUpdatePreview: metadataPlan,
    auditPreview: auditPlan,
    writePlanFor4E3: {
      operation: 'CONTROLLED_DEV_DRIVE_CREATE_FILE',
      targetMimeType:
        KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.MIME_TYPE,
      willCreateFoldersIn4E3IfMissing: true,
      willCreatePngFileIn4E3: true,
      willUpdateDataResponsesIn4E3: false,
      willUpdateLogAuditIn4E3: true,
      requiresConfirmText:
        'CONFIRM_SAVE_HANDWRITING_PNG_TO_DRIVE_4E3',
      prodWriteAllowed: false
    },
    readinessSummary: {
      e1Ready:
        e1.success === true,
      devEnvironmentOk:
        devSafety.success === true,
      canvasPngValid:
        canvasCheck.success === true,
      targetResponseResolved:
        targetResponse.success === true,
      drivePlanBuilt:
        drivePlan.success === true,
      metadataPlanBuilt:
        metadataPlan.success === true,
      auditPlanBuilt:
        auditPlan.success === true,
      readyFor4E3ControlledDriveWrite:
        errors.length === 0
    },
    errorCount: errors.length,
    warningCount:
      kidlearnV3_4e2UniqueArray_(warnings).length,
    errors: errors,
    warnings:
      kidlearnV3_4e2UniqueArray_(warnings)
  };

  console.log(JSON.stringify({
    success: result.success,
    action: result.action,
    phase: result.phase,
    dryRunName: result.dryRunName,
    targetResponseId:
      targetResponse.responseId || '',
    proposedFileName:
      drivePlan.proposedFileName || '',
    proposedDrivePath:
      drivePlan.proposedDrivePath || '',
    canvasBytes:
      canvasCheck.bytes || 0,
    actualDriveWritePerformed: false,
    actualSheetWritePerformed: false,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    errors: result.errors,
    warnings: result.warnings
  }, null, 2));

  if (!result.success) {
    throw new Error(
      '4E-2 handwriting upload dry-run preview failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Preview with sample payload.
 */
function kidlearnV3_previewHandwritingUploadDryRun4E2V3() {
  var result =
    kidlearnV3_buildHandwritingUploadDryRunPreview4E2V3(
      kidlearnV3_4e2BuildSamplePayload_()
    );

  var statusBefore =
    kidlearnV3_4e2GetCurrentStatus_();

  var statusAfter =
    kidlearnV3_4e2ResolveStatusAfterCheck_(
      statusBefore,
      result.success
        ? KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_STATUS.PREVIEWED
        : KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_STATUS.FAILED
    );

  result.action =
    'PREVIEW_HANDWRITING_UPLOAD_DRY_RUN_4E_2_V3';

  result.statusBefore =
    statusBefore;

  result.statusAfter =
    statusAfter;

  kidlearnV3_4e2SaveStatus_(
    result,
    statusAfter,
    KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify({
    success: result.success,
    action: result.action,
    phase: result.phase,
    statusAfter: statusAfter,
    nextBundle: result.nextBundle,
    actualDriveWritePerformed: false,
    actualSheetWritePerformed: false,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    warnings: result.warnings
  }, null, 2));

  return result;
}


/**
 * Check dry-run preview.
 */
function kidlearnV3_checkHandwritingUploadDryRun4E2V3() {
  var result =
    kidlearnV3_buildHandwritingUploadDryRunPreview4E2V3(
      kidlearnV3_4e2BuildSamplePayload_()
    );

  var statusBefore =
    kidlearnV3_4e2GetCurrentStatus_();

  var statusAfter =
    kidlearnV3_4e2ResolveStatusAfterCheck_(
      statusBefore,
      result.success
        ? KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_STATUS.CHECK_PASSED
        : KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_STATUS.FAILED
    );

  result.action =
    'CHECK_HANDWRITING_UPLOAD_DRY_RUN_4E_2_V3';

  result.statusBefore =
    statusBefore;

  result.statusAfter =
    statusAfter;

  kidlearnV3_4e2SaveStatus_(
    result,
    statusAfter,
    KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_KEYS.LAST_CHECK_AT
  );

  console.log(JSON.stringify({
    success: result.success,
    action: result.action,
    phase: result.phase,
    statusAfter: statusAfter,
    nextBundle: result.nextBundle,
    actualDriveWritePerformed: false,
    actualSheetWritePerformed: false,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    warnings: result.warnings
  }, null, 2));

  if (!result.success) {
    throw new Error(
      '4E-2 check failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready for 4E-3.
 */
function kidlearnV3_markHandwritingUploadDryRun4E2ReadyV3() {
  var check =
    kidlearnV3_checkHandwritingUploadDryRun4E2V3();

  if (!check.success) {
    throw new Error('Check 4E-2 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_HANDWRITING_UPLOAD_DRY_RUN_4E_2_READY_V3',
    phase:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_STATUS.READY_FOR_4E_3,
    dryRunName:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.DRY_RUN_NAME,
    nextBundle:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realDriveWriteAllowedNow: false,
    realSheetWriteAllowedNow: false,
    actualDriveWritePerformed: false,
    actualSheetWritePerformed: false,
    message:
      '4E-2 ready. Có thể qua 4E-3 Controlled DEV Drive Write: Save Canvas PNG.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4e2SaveStatus_(
    result,
    KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_STATUS.READY_FOR_4E_3,
    KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get 4E-2 status.
 */
function kidlearnV3_getHandwritingUploadDryRun4E2StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_HANDWRITING_UPLOAD_DRY_RUN_4E_2_STATUS_V3',
    phase:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_KEYS.STATUS
      ) ||
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastCheckAt:
      properties.getProperty(
        KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_KEYS.LAST_CHECK_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4e2ReadJsonProperty_(
        KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready for 4E-3.
 */
function kidlearnV3_assertHandwritingUploadDryRun4E2ReadyV3() {
  var status =
    kidlearnV3_getHandwritingUploadDryRun4E2StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_STATUS.READY_FOR_4E_3
  ) {
    errors.push(
      '4E-2 chưa READY_FOR_4E_3. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_HANDWRITING_UPLOAD_DRY_RUN_4E_2_READY_V3',
    phase:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.PARENT_PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realDriveWriteAllowedNow: false,
    realSheetWriteAllowedNow: false,
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
 * QA batch.
 */
function kidlearnV3_runQaBatch4E2V3() {
  var preview =
    kidlearnV3_previewHandwritingUploadDryRun4E2V3();

  var check =
    kidlearnV3_checkHandwritingUploadDryRun4E2V3();

  var ready =
    kidlearnV3_markHandwritingUploadDryRun4E2ReadyV3();

  var assertReady =
    kidlearnV3_assertHandwritingUploadDryRun4E2ReadyV3();

  var result = {
    success:
      preview.success === true &&
      check.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4E_2_HANDWRITING_UPLOAD_DRY_RUN_PREVIEW',
    phase:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.PHASE,
    nextBundle:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realDriveWriteAllowedNow: false,
    realSheetWriteAllowedNow: false,
    actualDriveWritePerformed: false,
    actualSheetWritePerformed: false,
    results: {
      preview: preview.success,
      check: check.success,
      ready: ready.success,
      assertReady: assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4E-2 QA batch failed.');
  }

  return result;
}


/**
 * Sample handwriting payload.
 */
function kidlearnV3_4e2BuildSamplePayload_() {
  var responseStatus =
    kidlearnV3_4e2SafeCall_(
      'kidlearnV3_getResponseRealWrite4D3StatusV3'
    );

  var responseId = '';
  var childId = 'CHD_V2_CHILD_DEFAULT';
  var lessonId = 'MATH_L1';
  var activityId = 'MATH_L1_ACT_1';

  if (
    responseStatus.success &&
    responseStatus.output &&
    responseStatus.output.lastWrite
  ) {
    responseId =
      responseStatus.output.lastWrite.responseId || responseId;
  }

  return {
    responseId: responseId,
    childId: childId,
    lessonId: lessonId,
    activityId: activityId,
    subjectCode: 'MATH',
    answerMode: 'HANDWRITE_INPUT',
    canvasDataUrl:
      kidlearnV3_4e2BuildTinyPngDataUrl_(),
    source: '4E-2_SAMPLE_HANDWRITING_DRY_RUN'
  };
}


/**
 * Tiny PNG data URL for dry-run validation only.
 */
function kidlearnV3_4e2BuildTinyPngDataUrl_() {
  return 'data:image/png;base64,' +
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=';
}


/**
 * Normalize payload.
 */
function kidlearnV3_4e2NormalizePayload_(payload) {
  payload = payload || {};

  return {
    responseId:
      String(payload.responseId || '').trim(),
    childId:
      String(payload.childId || 'CHD_V2_CHILD_DEFAULT').trim(),
    lessonId:
      String(payload.lessonId || '').trim(),
    activityId:
      String(payload.activityId || '').trim(),
    subjectCode:
      String(payload.subjectCode || payload.subjectKey || '').trim(),
    answerMode:
      String(payload.answerMode || 'HANDWRITE_INPUT').trim().toUpperCase(),
    canvasDataUrl:
      String(payload.canvasDataUrl || '').trim(),
    source:
      String(payload.source || 'HANDWRITING_UPLOAD_DRY_RUN_PREVIEW').trim()
  };
}


/**
 * Validate PNG data URL.
 * Không tạo Blob/file.
 */
function kidlearnV3_4e2ValidateCanvasDataUrl_(dataUrl) {
  var errors = [];
  var warnings = [];

  var text =
    String(dataUrl || '').trim();

  if (!text) {
    errors.push('canvasDataUrl trống.');
  }

  if (
    text &&
    text.indexOf('data:image/png;base64,') !== 0
  ) {
    errors.push(
      'canvasDataUrl không phải PNG base64 data URL.'
    );
  }

  var base64 = '';

  if (text.indexOf(',') > -1) {
    base64 =
      text.split(',')[1] || '';
  }

  if (!base64) {
    errors.push('Không đọc được phần base64 của canvasDataUrl.');
  }

  var bytes = 0;

  if (base64) {
    try {
      var decoded =
        Utilities.base64Decode(base64);

      bytes =
        decoded.length;

      if (bytes < 20) {
        warnings.push(
          'PNG data khá nhỏ. Với bài viết tay thật, dung lượng thường lớn hơn.'
        );
      }

      if (bytes > 5 * 1024 * 1024) {
        errors.push(
          'PNG data vượt 5MB. Cần nén hoặc giảm kích thước canvas trước khi lưu.'
        );
      }
    } catch (error) {
      errors.push(
        'Không decode được base64 PNG: ' +
        String(error.message || error)
      );
    }
  }

  return {
    success: errors.length === 0,
    mimeType:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.MIME_TYPE,
    dataUrlPrefixOk:
      text.indexOf('data:image/png;base64,') === 0,
    base64Length:
      base64.length,
    bytes: bytes,
    willCreateBlobNow: false,
    willCreateFileNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Resolve target response.
 */
function kidlearnV3_4e2ResolveTargetResponse_(payload, warnings) {
  var errors = [];
  warnings = warnings || [];

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4e2OpenSpreadsheet_();
  } catch (error) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(error.message || error)
    );
  }

  var responseId =
    payload.responseId;

  if (!responseId) {
    var responseStatus =
      kidlearnV3_4e2SafeCall_(
        'kidlearnV3_getResponseRealWrite4D3StatusV3'
      );

    if (
      responseStatus.success &&
      responseStatus.output &&
      responseStatus.output.lastWrite &&
      responseStatus.output.lastWrite.responseId
    ) {
      responseId =
        responseStatus.output.lastWrite.responseId;
      warnings.push(
        'payload không có responseId. Dùng lastWrite.responseId từ 4D-3.'
      );
    }
  }

  if (!responseId) {
    errors.push(
      'Không xác định được responseId để gắn handwriting asset.'
    );
  }

  var headerInfo = null;
  var responseIdColumn = null;
  var metadataColumn = null;
  var targetRowNumber = 0;
  var existingMetaText = '';

  if (spreadsheet) {
    headerInfo =
      kidlearnV3_4e2InspectSheetHeaders_(
        spreadsheet,
        'DATA_Responses',
        warnings
      );

    if (!headerInfo.exists) {
      errors.push('Không tìm thấy DATA_Responses.');
    } else {
      responseIdColumn =
        kidlearnV3_4e2FindHeaderMatch_(
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

      metadataColumn =
        kidlearnV3_4e2FindHeaderMatch_(
          headerInfo.headers || [],
          [
            'answerMetaJson',
            'detailsJson',
            'metaJson',
            'payloadJson',
            'metadataJson'
          ]
        );

      if (!responseIdColumn) {
        errors.push('DATA_Responses không map được responseId/id.');
      }

      if (!metadataColumn) {
        errors.push(
          'DATA_Responses chưa có metadata column để gắn handwritingAsset.'
        );
      }

      if (responseId && responseIdColumn) {
        var sheet =
          kidlearnV3_4e2GetSheetByExactName_(
            spreadsheet,
            'DATA_Responses'
          );

        targetRowNumber =
          kidlearnV3_4e2FindRowById_(
            sheet,
            headerInfo,
            responseIdColumn.columnIndex,
            responseId
          );

        if (!targetRowNumber) {
          errors.push(
            'Không tìm thấy responseId trong DATA_Responses: ' +
            responseId
          );
        } else if (metadataColumn) {
          existingMetaText =
            String(
              sheet
                .getRange(
                  targetRowNumber,
                  metadataColumn.columnIndex
                )
                .getValue() || ''
            );
        }
      }
    }
  }

  return {
    success: errors.length === 0,
    responseId: responseId,
    childId: payload.childId,
    lessonId: payload.lessonId,
    activityId: payload.activityId,
    subjectCode: payload.subjectCode,
    answerMode: payload.answerMode,
    sheetName: 'DATA_Responses',
    targetRowNumber: targetRowNumber,
    responseIdColumnDetected: responseIdColumn,
    metadataColumnDetected: metadataColumn,
    existingMetaPreview:
      kidlearnV3_4e2PreviewValue_(existingMetaText),
    existingMetaParsed:
      kidlearnV3_4e2SafeJsonParse_(existingMetaText),
    willUpdateSheetNow: false,
    actualSheetWritePerformed: false,
    errorCount: errors.length,
    errors: errors
  };
}


/**
 * Build Drive upload plan.
 * Không tạo folder/file.
 */
function kidlearnV3_4e2BuildDriveUploadPlan_(
  payload,
  targetResponse,
  canvasCheck,
  warnings
) {
  var errors = [];
  var localWarnings = [];
  warnings = warnings || [];

  var timestamp =
    kidlearnV3_4e2FormatTimestamp_(new Date());

  var safeChildId =
    kidlearnV3_4e2SafePathPart_(payload.childId);

  var safeLessonId =
    kidlearnV3_4e2SafePathPart_(payload.lessonId || 'UNKNOWN_LESSON');

  var safeResponseId =
    kidlearnV3_4e2SafePathPart_(
      targetResponse.responseId || 'UNKNOWN_RESPONSE'
    );

  var proposedFileName =
    'HW_' +
    timestamp +
    '_' +
    safeResponseId +
    KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.FILE_EXTENSION;

  var folderPlan =
    kidlearnV3_4e2BuildFolderPlan_(
      safeChildId,
      safeLessonId,
      localWarnings
    );

  if (!folderPlan.success) {
    errors =
      errors.concat(folderPlan.errors || []);
  }

  return {
    success: errors.length === 0,
    action: 'BUILD_DRIVE_UPLOAD_PLAN_4E_2_V3',
    storage: 'GOOGLE_DRIVE',
    mimeType:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.MIME_TYPE,
    proposedFileName: proposedFileName,
    proposedDrivePath:
      [
        KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.ROOT_ASSET_FOLDER_NAME,
        KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.HANDWRITING_FOLDER_NAME,
        safeChildId,
        safeLessonId,
        proposedFileName
      ].join('/'),
    folderPlan: folderPlan,
    canvasBytes:
      canvasCheck.bytes || 0,
    createPlan: {
      createRootFolderIfMissing:
        folderPlan.rootFolder.exists !== true,
      createHandwritingFolderIfMissing:
        folderPlan.handwritingFolder.exists !== true,
      createChildFolderIfMissing:
        folderPlan.childFolder.exists !== true,
      createLessonFolderIfMissing:
        folderPlan.lessonFolder.exists !== true,
      createPngFile:
        true
    },
    futureAssetPreview: {
      fileId: '<created in 4E-3>',
      fileUrl: '<created in 4E-3>',
      fileName: proposedFileName,
      mimeType:
        KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.MIME_TYPE,
      reviewStatus:
        KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.DEFAULT_REVIEW_STATUS
    },
    willCreateFolderNow: false,
    willCreateFileNow: false,
    actualDriveWritePerformed: false,
    errorCount: errors.length,
    warningCount:
      kidlearnV3_4e2UniqueArray_(localWarnings).length,
    errors: errors,
    warnings:
      kidlearnV3_4e2UniqueArray_(localWarnings)
  };
}


/**
 * Build folder plan.
 */
function kidlearnV3_4e2BuildFolderPlan_(safeChildId, safeLessonId, warnings) {
  var errors = [];
  warnings = warnings || [];

  var rootFolder =
    kidlearnV3_4e2FindFirstFolderByName_(
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.ROOT_ASSET_FOLDER_NAME
    );

  var handwritingFolder = null;
  var childFolder = null;
  var lessonFolder = null;

  if (!rootFolder) {
    warnings.push(
      'Root folder chưa tồn tại. 4E-3 sẽ cần tạo KIDLEARN_DEV_ASSETS.'
    );
  } else {
    handwritingFolder =
      kidlearnV3_4e2FindFirstChildFolderByName_(
        rootFolder.folder,
        KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.HANDWRITING_FOLDER_NAME
      );

    if (!handwritingFolder) {
      warnings.push(
        'HANDWRITING_RESPONSES chưa tồn tại trong root folder. 4E-3 sẽ cần tạo.'
      );
    }
  }

  if (handwritingFolder) {
    childFolder =
      kidlearnV3_4e2FindFirstChildFolderByName_(
        handwritingFolder.folder,
        safeChildId
      );

    if (!childFolder) {
      warnings.push(
        'Child folder chưa tồn tại: ' + safeChildId + '. 4E-3 sẽ cần tạo.'
      );
    }
  }

  if (childFolder) {
    lessonFolder =
      kidlearnV3_4e2FindFirstChildFolderByName_(
        childFolder.folder,
        safeLessonId
      );

    if (!lessonFolder) {
      warnings.push(
        'Lesson folder chưa tồn tại: ' + safeLessonId + '. 4E-3 sẽ cần tạo.'
      );
    }
  }

  return {
    success: errors.length === 0,
    rootFolder:
      kidlearnV3_4e2FolderInfo_(rootFolder),
    handwritingFolder:
      kidlearnV3_4e2FolderInfo_(handwritingFolder),
    childFolder:
      kidlearnV3_4e2FolderInfo_(childFolder),
    lessonFolder:
      kidlearnV3_4e2FolderInfo_(lessonFolder),
    willCreateFolderNow: false,
    errorCount: errors.length,
    errors: errors
  };
}


/**
 * Build DATA_Responses metadata update preview.
 */
function kidlearnV3_4e2BuildResponseMetadataUpdatePlan_(
  payload,
  targetResponse,
  drivePlan,
  canvasCheck,
  warnings
) {
  var errors = [];
  var localWarnings = [];
  warnings = warnings || [];

  if (!targetResponse.success) {
    errors.push(
      'Không thể build metadata update vì targetResponse chưa hợp lệ.'
    );
  }

  var existingMeta =
    targetResponse.existingMetaParsed &&
    targetResponse.existingMetaParsed.success
      ? targetResponse.existingMetaParsed.value
      : {};

  if (
    targetResponse.existingMetaParsed &&
    targetResponse.existingMetaParsed.raw &&
    !targetResponse.existingMetaParsed.success
  ) {
    localWarnings.push(
      'Metadata hiện tại không phải JSON hợp lệ. 4E-3/4E-4 cần xử lý merge cẩn thận.'
    );
  }

  var proposedMeta =
    kidlearnV3_4e2DeepClone_(existingMeta || {});

  proposedMeta.handwritingAsset = {
    storage: 'GOOGLE_DRIVE',
    fileId: '<created in 4E-3>',
    fileUrl: '<created in 4E-3>',
    mimeType:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.MIME_TYPE,
    fileName:
      drivePlan.proposedFileName || '',
    drivePath:
      drivePlan.proposedDrivePath || '',
    reviewStatus:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.DEFAULT_REVIEW_STATUS,
    sourcePhase: '4E-2_DRY_RUN_PREVIEW',
    canvasBytes:
      canvasCheck.bytes || 0,
    createdAt:
      new Date().toISOString()
  };

  proposedMeta.handwritingReview = {
    status:
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.DEFAULT_REVIEW_STATUS,
    autoOcrEnabled: false,
    aiAutoGradingEnabled: false,
    parentReviewRequired: true
  };

  proposedMeta.answerMode =
    payload.answerMode || 'HANDWRITE_INPUT';

  var proposedMetaJson =
    JSON.stringify(proposedMeta);

  return {
    success: errors.length === 0,
    action: 'BUILD_RESPONSE_METADATA_UPDATE_PLAN_4E_2_V3',
    targetSheet: 'DATA_Responses',
    targetRowNumber:
      targetResponse.targetRowNumber,
    responseId:
      targetResponse.responseId,
    metadataColumn:
      targetResponse.metadataColumnDetected,
    existingMetaPreview:
      targetResponse.existingMetaPreview,
    proposedMetaPreview:
      kidlearnV3_4e2PreviewValue_(proposedMetaJson),
    proposedMetaJsonLength:
      proposedMetaJson.length,
    proposedMetaShape: proposedMeta,
    updateOperationFor4E4:
      'MERGE_HANDWRITING_ASSET_IN_ANSWER_META_JSON',
    willUpdateSheetNow: false,
    actualSheetWritePerformed: false,
    errorCount: errors.length,
    warningCount:
      kidlearnV3_4e2UniqueArray_(localWarnings).length,
    errors: errors,
    warnings:
      kidlearnV3_4e2UniqueArray_(localWarnings)
  };
}


/**
 * Build audit preview.
 */
function kidlearnV3_4e2BuildAuditPreviewPlan_(
  payload,
  targetResponse,
  drivePlan,
  metadataPlan,
  warnings
) {
  var errors = [];
  var localWarnings = [];
  warnings = warnings || [];

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4e2OpenSpreadsheet_();
  } catch (error) {
    errors.push(
      'Không mở được DEV spreadsheet để build audit preview: ' +
      String(error.message || error)
    );
  }

  var headerInfo = null;
  var rowValues = [];
  var matched = [];
  var unmapped = [];
  var auditId =
    'AUD_4E2_DRY_' + new Date().getTime();

  if (spreadsheet) {
    headerInfo =
      kidlearnV3_4e2InspectSheetHeaders_(
        spreadsheet,
        'LOG_Audit',
        warnings
      );

    if (!headerInfo.exists) {
      errors.push('Không tìm thấy LOG_Audit.');
    } else {
      var details = {
        phase: '4E-2',
        dryRunOnly: true,
        action: 'PREVIEW_HANDWRITING_UPLOAD',
        targetSheet: 'DATA_Responses',
        responseId: targetResponse.responseId,
        proposedDrivePath: drivePlan.proposedDrivePath,
        proposedFileName: drivePlan.proposedFileName,
        metadataColumn:
          targetResponse.metadataColumnDetected
            ? targetResponse.metadataColumnDetected.raw
            : '',
        actualDriveWritePerformed: false,
        actualSheetWritePerformed: false,
        note:
          'Dry-run only. No Drive file and no Sheet update in 4E-2.'
      };

      var canonicalData = {
        auditId: auditId,
        action: 'PREVIEW_HANDWRITING_UPLOAD_4E2',
        entityType: 'DATA_Responses',
        entityId: targetResponse.responseId,
        detailsJson: JSON.stringify(details),
        createdAt: new Date().toISOString(),
        actorId: payload.childId,
        source: '4E-2',
        environment: 'DEV'
      };

      var aliasMap =
        kidlearnV3_4e2GetAuditFieldAliasMap_();

      rowValues =
        kidlearnV3_4e2BuildBlankRow_(
          headerInfo.lastColumn
        );

      for (var key in canonicalData) {
        if (!canonicalData.hasOwnProperty(key)) continue;

        var match =
          kidlearnV3_4e2FindHeaderMatch_(
            headerInfo.headers || [],
            aliasMap[key] || [key]
          );

        if (match) {
          rowValues[match.columnIndex - 1] =
            canonicalData[key];

          matched.push({
            canonical: key,
            matchedHeader: match.raw,
            columnIndex: match.columnIndex
          });
        } else {
          unmapped.push({
            canonical: key
          });
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
        if (
          kidlearnV3_4e2IsUnmapped_(
            unmapped,
            required[i]
          )
        ) {
          errors.push(
            'LOG_Audit không map được required field: ' +
            required[i]
          );
        }
      }
    }
  }

  return {
    success: errors.length === 0,
    action: 'BUILD_AUDIT_PREVIEW_PLAN_4E_2_V3',
    targetSheet: 'LOG_Audit',
    operation: 'DRY_RUN_AUDIT_APPEND_PREVIEW',
    auditId: auditId,
    targetNextRow:
      headerInfo ? headerInfo.lastRow + 1 : '',
    rowValues: rowValues,
    rowObjectByHeader:
      headerInfo
        ? kidlearnV3_4e2BuildRowObjectByHeader_(
            headerInfo,
            rowValues
          )
        : {},
    matchedFields: matched,
    unmappedFields: unmapped,
    willAppendAuditNow: false,
    actualAuditWritePerformed: false,
    errorCount: errors.length,
    warningCount:
      kidlearnV3_4e2UniqueArray_(localWarnings).length,
    errors: errors,
    warnings:
      kidlearnV3_4e2UniqueArray_(localWarnings)
  };
}


/**
 * Drive search helpers.
 */
function kidlearnV3_4e2FindFirstFolderByName_(folderName) {
  var iterator =
    DriveApp.getFoldersByName(folderName);

  if (!iterator.hasNext()) return null;

  var folder =
    iterator.next();

  return {
    folder: folder,
    id: folder.getId(),
    name: folder.getName(),
    url: folder.getUrl(),
    exists: true
  };
}


function kidlearnV3_4e2FindFirstChildFolderByName_(parentFolder, folderName) {
  if (!parentFolder) return null;

  var iterator =
    parentFolder.getFoldersByName(folderName);

  if (!iterator.hasNext()) return null;

  var folder =
    iterator.next();

  return {
    folder: folder,
    id: folder.getId(),
    name: folder.getName(),
    url: folder.getUrl(),
    exists: true
  };
}


function kidlearnV3_4e2FolderInfo_(folderWrapper) {
  if (!folderWrapper) {
    return {
      exists: false,
      id: '',
      name: '',
      url: ''
    };
  }

  return {
    exists: true,
    id: folderWrapper.id,
    name: folderWrapper.name,
    url: folderWrapper.url
  };
}


/**
 * Sheet helpers.
 */
function kidlearnV3_4e2InspectSheetHeaders_(spreadsheet, sheetName, warnings) {
  warnings = warnings || [];

  if (
    typeof kidlearnV3_4e1InspectSheetHeaders_ === 'function'
  ) {
    return kidlearnV3_4e1InspectSheetHeaders_(
      spreadsheet,
      sheetName,
      warnings
    );
  }

  if (
    typeof kidlearnV3_4d1InspectSheetHeaders_ === 'function'
  ) {
    return kidlearnV3_4d1InspectSheetHeaders_(
      spreadsheet,
      sheetName,
      warnings
    );
  }

  var sheet =
    kidlearnV3_4e2GetSheetByExactName_(
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
    kidlearnV3_4e2HeaderScore_(values[1]) >=
      kidlearnV3_4e2HeaderScore_(values[0]) &&
    kidlearnV3_4e2HeaderScore_(values[1]) >= 3
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
        kidlearnV3_4e2NormalizeLookupKey_(raw)
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


function kidlearnV3_4e2HeaderScore_(row) {
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


function kidlearnV3_4e2FindHeaderMatch_(headers, aliases) {
  var map = {};

  for (var i = 0; i < aliases.length; i++) {
    map[
      kidlearnV3_4e2NormalizeLookupKey_(aliases[i])
    ] = true;
  }

  for (var j = 0; j < headers.length; j++) {
    if (map[headers[j].normalized]) {
      return headers[j];
    }
  }

  return null;
}


function kidlearnV3_4e2FindRowById_(
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


function kidlearnV3_4e2OpenSpreadsheet_() {
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


function kidlearnV3_4e2GetSheetByExactName_(spreadsheet, sheetName) {
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
 * Alias helpers.
 */
function kidlearnV3_4e2GetAuditFieldAliasMap_() {
  if (
    typeof kidlearnV3_4d5GetAuditFieldAliasMap_ === 'function'
  ) {
    return kidlearnV3_4d5GetAuditFieldAliasMap_();
  }

  if (
    typeof kidlearnV3_4d4GetAuditFieldAliasMap_ === 'function'
  ) {
    return kidlearnV3_4d4GetAuditFieldAliasMap_();
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


function kidlearnV3_4e2IsUnmapped_(unmapped, canonical) {
  for (var i = 0; i < unmapped.length; i++) {
    if (unmapped[i].canonical === canonical) {
      return true;
    }
  }

  return false;
}


function kidlearnV3_4e2BuildBlankRow_(length) {
  var row = [];

  for (var i = 0; i < length; i++) {
    row.push('');
  }

  return row;
}


function kidlearnV3_4e2BuildRowObjectByHeader_(headerInfo, rowValues) {
  var obj = {};
  var headers = headerInfo.headers || [];

  for (var i = 0; i < headers.length; i++) {
    obj[headers[i].raw] =
      rowValues[headers[i].columnIndex - 1] || '';
  }

  return obj;
}


/**
 * DEV safety.
 */
function kidlearnV3_4e2CheckDevSafety_() {
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
    action: 'CHECK_DEV_SAFETY_4E_2_V3',
    environment:
      environment || 'UNKNOWN',
    prodWriteAllowed: false,
    realDriveWriteAllowedNow: false,
    realSheetWriteAllowedNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Generic helpers.
 */
function kidlearnV3_4e2NormalizeLookupKey_(value) {
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


function kidlearnV3_4e2SafePathPart_(value) {
  var text =
    String(value || '')
      .trim()
      .replace(/[\\\/:*?"<>|#%\{\}\[\]~&]/g, '_')
      .replace(/\s+/g, '_');

  if (!text) return 'UNKNOWN';

  if (text.length > 80) {
    return text.substring(0, 80);
  }

  return text;
}


function kidlearnV3_4e2FormatTimestamp_(date) {
  var tz =
    Session.getScriptTimeZone() || 'Asia/Ho_Chi_Minh';

  return Utilities.formatDate(
    date,
    tz,
    'yyyyMMdd_HHmmss'
  );
}


function kidlearnV3_4e2PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 180) {
    return text.substring(0, 180) + '...';
  }

  return text;
}


function kidlearnV3_4e2SafeJsonParse_(text) {
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


function kidlearnV3_4e2DeepClone_(obj) {
  try {
    return JSON.parse(JSON.stringify(obj || {}));
  } catch (error) {
    return {};
  }
}


function kidlearnV3_4e2RedactPayloadForLog_(payload) {
  var copy =
    kidlearnV3_4e2DeepClone_(payload);

  if (copy.canvasDataUrl) {
    copy.canvasDataUrl =
      '[PNG_DATA_URL_REDACTED_LENGTH_' +
      String(payload.canvasDataUrl || '').length +
      ']';
  }

  return copy;
}


function kidlearnV3_4e2UniqueArray_(items) {
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


function kidlearnV3_4e2SafeCall_(functionName) {
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


function kidlearnV3_4e2GetCurrentStatus_() {
  return (
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_KEYS.STATUS
      ) ||
    KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_STATUS.NOT_RUN
  );
}


function kidlearnV3_4e2ResolveStatusAfterCheck_(statusBefore, proposedStatus) {
  if (
    statusBefore ===
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_STATUS.READY_FOR_4E_3 &&
    proposedStatus !==
      KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_STATUS.FAILED
  ) {
    return KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_STATUS.READY_FOR_4E_3;
  }

  return proposedStatus;
}


function kidlearnV3_4e2SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.PARENT_PHASE,
      status: status,
      dryRunName:
        KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.DRY_RUN_NAME,
      nextBundle:
        KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_HANDWRITING_UPLOAD_DRYRUN_4E2_CONFIG.NEXT_STAGE,
      prodWriteAllowed: false,
      realDriveWriteAllowedNow: false,
      realSheetWriteAllowedNow: false,
      actualDriveWritePerformed: false,
      actualSheetWritePerformed: false,
      targetResponseId:
        result.targetResponse
          ? result.targetResponse.responseId
          : '',
      proposedDrivePath:
        result.driveUploadPreview
          ? result.driveUploadPreview.proposedDrivePath
          : '',
      readinessSummary:
        result.readinessSummary || null,
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


function kidlearnV3_4e2ReadJsonProperty_(key) {
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