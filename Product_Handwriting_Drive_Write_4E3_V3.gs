/**
 * ================================================================
 * KIDLEARN V3 - CONTROLLED DEV DRIVE WRITE: SAVE CANVAS PNG
 * Step: 4E-3
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Controlled DEV Drive write for handwriting canvas PNG.
 * - Create Drive folders if missing.
 * - Save PNG file to Google Drive.
 * - Append audit row into LOG_Audit.
 * - Store asset write record for 4E-4.
 *
 * Safety:
 * - Chỉ ghi DEV.
 * - Không ghi PROD.
 * - Cần confirm text rõ ràng.
 * - Có tạo Google Drive folder/file thật.
 * - Có ghi LOG_Audit.
 * - Chưa cập nhật DATA_Responses ở 4E-3.
 */


var KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4E3_STATUS',
  LAST_PREFLIGHT_AT: 'KIDLEARN_V3_PHASE_4E3_LAST_PREFLIGHT_AT',
  LAST_WRITE_AT: 'KIDLEARN_V3_PHASE_4E3_LAST_WRITE_AT',
  LAST_VERIFY_AT: 'KIDLEARN_V3_PHASE_4E3_LAST_VERIFY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4E3_LAST_RESULT_JSON',
  LAST_ASSET_JSON: 'KIDLEARN_V3_PHASE_4E3_LAST_ASSET_JSON'
};


var KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREFLIGHT_PASSED: 'PREFLIGHT_PASSED',
  READY_FOR_4E_4: 'READY_FOR_4E_4',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG = {
  PHASE: '4E-3',
  PARENT_PHASE: '4E',
  PREVIOUS_BUNDLE: '4E-2',
  NEXT_BUNDLE: '4E-4',
  NEXT_STAGE: 'LINK_HANDWRITING_ASSET_TO_DATA_RESPONSES',
  WRITE_NAME: 'CONTROLLED_DEV_DRIVE_WRITE_SAVE_CANVAS_PNG',
  CONFIRM_TEXT: 'CONFIRM_SAVE_HANDWRITING_PNG_TO_DRIVE_4E3',
  ROOT_ASSET_FOLDER_NAME: 'KIDLEARN_DEV_ASSETS',
  HANDWRITING_FOLDER_NAME: 'HANDWRITING_RESPONSES',
  DEFAULT_REVIEW_STATUS: 'NEEDS_REVIEW',
  MIME_TYPE: 'image/png',
  FILE_EXTENSION: '.png',
  PROD_WRITE_ALLOWED: false,
  REAL_DRIVE_WRITE_ALLOWED: true,
  DATA_RESPONSES_WRITE_ALLOWED_NOW: false
};


/**
 * Preview Drive write.
 * Không tạo folder/file, không ghi LOG_Audit.
 */
function kidlearnV3_previewHandwritingDriveWrite4E3V3(payload) {
  payload =
    payload ||
    kidlearnV3_4e3BuildSamplePayload_();

  var plan =
    kidlearnV3_4e3BuildDriveWritePlan_(payload);

  plan.action =
    'PREVIEW_HANDWRITING_DRIVE_WRITE_4E_3_V3';

  kidlearnV3_4e3SaveStatus_(
    plan,
    plan.success
      ? KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_STATUS.PREFLIGHT_PASSED
      : KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_STATUS.FAILED,
    KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_KEYS.LAST_PREFLIGHT_AT
  );

  console.log(JSON.stringify({
    success: plan.success,
    action: plan.action,
    phase: plan.phase,
    targetResponseId:
      plan.targetResponse ? plan.targetResponse.responseId : '',
    proposedFileName:
      plan.driveUploadPreview ? plan.driveUploadPreview.proposedFileName : '',
    proposedDrivePath:
      plan.driveUploadPreview ? plan.driveUploadPreview.proposedDrivePath : '',
    actualDriveWritePerformed: false,
    actualSheetWritePerformed: false,
    dataResponsesWritePerformed: false,
    auditWritePerformed: false,
    nextBundle:
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.NEXT_BUNDLE,
    errorCount: plan.errorCount,
    warningCount: plan.warningCount,
    errors: plan.errors,
    warnings: plan.warnings
  }, null, 2));

  if (!plan.success) {
    throw new Error(
      '4E-3 preview failed. Errors=' +
      plan.errors.join(' | ')
    );
  }

  return plan;
}


/**
 * Preflight only.
 */
function kidlearnV3_runHandwritingDriveWritePreflight4E3V3() {
  var result =
    kidlearnV3_previewHandwritingDriveWrite4E3V3(
      kidlearnV3_4e3BuildSamplePayload_()
    );

  result.action =
    'RUN_HANDWRITING_DRIVE_WRITE_PREFLIGHT_4E_3_V3';

  kidlearnV3_4e3SaveStatus_(
    result,
    KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_STATUS.PREFLIGHT_PASSED,
    KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_KEYS.LAST_PREFLIGHT_AT
  );

  console.log(JSON.stringify({
    success: result.success,
    action: result.action,
    phase: result.phase,
    status:
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_STATUS.PREFLIGHT_PASSED,
    nextAction:
      'Run kidlearnV3_saveHandwritingPngToDrive4E3ConfirmV3',
    actualDriveWritePerformed: false,
    actualSheetWritePerformed: false,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    warnings: result.warnings
  }, null, 2));

  return result;
}


/**
 * Public confirm wrapper.
 */
function kidlearnV3_saveHandwritingPngToDrive4E3ConfirmV3() {
  return kidlearnV3_saveHandwritingPngToDrive4E3V3({
    confirm:
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.CONFIRM_TEXT,
    payload:
      kidlearnV3_4e3BuildSamplePayload_(),
    reviewerNote:
      'Controlled DEV Drive write for handwriting PNG. DATA_Responses will be linked in 4E-4.'
  });
}


/**
 * Controlled DEV Drive write.
 */
function kidlearnV3_saveHandwritingPngToDrive4E3V3(options) {
  options = options || {};

  var confirmText =
    String(options.confirm || '')
      .trim()
      .toUpperCase();

  if (
    confirmText !==
    KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm. Cần confirm=' +
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.CONFIRM_TEXT
    );
  }

  var payload =
    options.payload ||
    kidlearnV3_4e3BuildSamplePayload_();

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
      kidlearnV3_4e3BuildDriveWritePlan_(payload);

    if (!plan.success) {
      throw new Error(
        'Preflight 4E-3 chưa pass. Errors=' +
        plan.errors.join(' | ')
      );
    }

    /**
     * IMPORTANT 4E-3P2:
     * Không dùng plan.normalizedPayload trực tiếp vì có thể đã bị redact từ 4E-2.
     * Dùng payload gốc để giữ raw PNG data URL.
     */
    var normalized =
      typeof kidlearnV3_4e3NormalizePayload_ === 'function'
        ? kidlearnV3_4e3NormalizePayload_(payload)
        : payload;

    normalized.canvasDataUrl =
      kidlearnV3_4e3ResolveRawCanvasDataUrl4E3P2_(
        payload,
        normalized,
        plan
      );

    var canvasBlob =
      kidlearnV3_4e3CreatePngBlobFromDataUrl_(
        normalized.canvasDataUrl,
        plan.driveUploadPreview.proposedFileName
      );

    var folders =
      kidlearnV3_4e3GetOrCreateHandwritingFolders_(
        normalized.childId,
        normalized.lessonId
      );

    var file =
      folders.lessonFolder.createFile(canvasBlob);

    var fileId =
      file.getId();

    var fileUrl =
      file.getUrl();

    var now =
      new Date().toISOString();

    var assetId =
      'HW_ASSET_4E3_DEV_' + new Date().getTime();

    var assetRecord = {
      success: true,
      action: 'SAVE_HANDWRITING_PNG_TO_DRIVE_4E_3_V3',
      phase:
        KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.PHASE,
      parentPhase:
        KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.PARENT_PHASE,
      status:
        KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_STATUS.READY_FOR_4E_4,
      assetId: assetId,
      responseId:
        plan.targetResponse.responseId,
      responseRowNumber:
        plan.targetResponse.targetRowNumber,
      childId:
        normalized.childId,
      lessonId:
        normalized.lessonId,
      activityId:
        normalized.activityId,
      subjectCode:
        normalized.subjectCode,
      answerMode:
        normalized.answerMode,
      storage:
        'GOOGLE_DRIVE',
      mimeType:
        KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.MIME_TYPE,
      fileId:
        fileId,
      fileUrl:
        fileUrl,
      fileName:
        plan.driveUploadPreview.proposedFileName,
      drivePath:
        plan.driveUploadPreview.proposedDrivePath,
      fileSizeBytes:
        canvasBlob.getBytes().length,
      reviewStatus:
        KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.DEFAULT_REVIEW_STATUS,
      folderIds: {
        rootFolderId:
          folders.rootFolder.getId(),
        handwritingFolderId:
          folders.handwritingFolder.getId(),
        childFolderId:
          folders.childFolder.getId(),
        lessonFolderId:
          folders.lessonFolder.getId()
      },
      folderUrls: {
        rootFolderUrl:
          folders.rootFolder.getUrl(),
        handwritingFolderUrl:
          folders.handwritingFolder.getUrl(),
        childFolderUrl:
          folders.childFolder.getUrl(),
        lessonFolderUrl:
          folders.lessonFolder.getUrl()
      },
      prodWriteAllowed: false,
      realDriveWriteAllowed: true,
      actualDriveWritePerformed: true,
      dataResponsesWritePerformed: false,
      actualDataResponsesWritePerformed: false,
      createdAt:
        now
    };

    var auditWrite =
      kidlearnV3_4e3AppendAuditRow_(
        assetRecord,
        String(options.reviewerNote || '')
      );

    assetRecord.auditId =
      auditWrite.auditId;

    assetRecord.auditRowNumber =
      auditWrite.auditRowNumber;

    assetRecord.auditWritePerformed = true;
    assetRecord.actualSheetWritePerformed = true;
    assetRecord.logAuditWritePerformed = true;
    assetRecord.nextBundle =
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.NEXT_BUNDLE;
    assetRecord.nextStage =
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.NEXT_STAGE;

    kidlearnV3_4e3SaveAssetRecord_(
      assetRecord
    );

    kidlearnV3_4e3SaveStatus_(
      assetRecord,
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_STATUS.READY_FOR_4E_4,
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_KEYS.LAST_WRITE_AT
    );

    console.log(JSON.stringify(assetRecord, null, 2));

    return assetRecord;

  } finally {
    lock.releaseLock();
  }
}


/**
 * Verify last Drive write.
 */
function kidlearnV3_verifyLastHandwritingDriveWrite4E3V3() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_KEYS.LAST_ASSET_JSON
      );

  if (!text) {
    throw new Error(
      'Không tìm thấy LAST_ASSET_JSON của 4E-3.'
    );
  }

  var asset =
    JSON.parse(text);

  var errors = [];
  var warnings = [];

  var fileCheck = null;
  var auditCheck = null;

  try {
    var file =
      DriveApp.getFileById(asset.fileId);

    fileCheck = {
      success: true,
      fileId:
        file.getId(),
      fileName:
        file.getName(),
      fileUrl:
        file.getUrl(),
      mimeType:
        file.getMimeType(),
      sizeBytes:
        file.getBlob().getBytes().length
    };

    if (
      file.getId() !== asset.fileId
    ) {
      errors.push('Drive fileId verify không khớp.');
    }

    if (
      file.getName() !== asset.fileName
    ) {
      warnings.push(
        'Drive fileName khác record. Expected=' +
        asset.fileName +
        ', Actual=' +
        file.getName()
      );
    }

  } catch (error) {
    errors.push(
      'Không verify được Drive file: ' +
      String(error.message || error)
    );
  }

  try {
    auditCheck =
      kidlearnV3_4e3VerifyAuditRow_(
        asset.auditRowNumber,
        asset.auditId
      );

    if (!auditCheck.success) {
      errors =
        errors.concat(auditCheck.errors || []);
    }
  } catch (error2) {
    errors.push(
      'Không verify được LOG_Audit 4E-3: ' +
      String(error2.message || error2)
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'VERIFY_LAST_HANDWRITING_DRIVE_WRITE_4E_3_V3',
    phase:
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_STATUS.READY_FOR_4E_4
        : KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_STATUS.FAILED,
    assetId:
      asset.assetId,
    responseId:
      asset.responseId,
    fileId:
      asset.fileId,
    fileUrl:
      asset.fileUrl,
    fileCheck:
      fileCheck,
    auditCheck:
      auditCheck,
    prodWriteAllowed: false,
    realDriveWriteAllowed: true,
    actualDriveWritePerformed:
      asset.actualDriveWritePerformed === true,
    dataResponsesWritePerformed:
      asset.dataResponsesWritePerformed === true,
    actualSheetWritePerformed:
      asset.actualSheetWritePerformed === true,
    errorCount:
      errors.length,
    warningCount:
      warnings.length,
    errors:
      errors,
    warnings:
      warnings
  };

  kidlearnV3_4e3SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_KEYS.LAST_VERIFY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      'Verify 4E-3 failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Get 4E-3 status.
 */
function kidlearnV3_getHandwritingDriveWrite4E3StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_HANDWRITING_DRIVE_WRITE_4E_3_STATUS_V3',
    phase:
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_KEYS.STATUS
      ) ||
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_STATUS.NOT_RUN,
    lastPreflightAt:
      properties.getProperty(
        KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_KEYS.LAST_PREFLIGHT_AT
      ) || '',
    lastWriteAt:
      properties.getProperty(
        KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_KEYS.LAST_WRITE_AT
      ) || '',
    lastVerifyAt:
      properties.getProperty(
        KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_KEYS.LAST_VERIFY_AT
      ) || '',
    lastResult:
      kidlearnV3_4e3ReadJsonProperty_(
        KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_KEYS.LAST_RESULT_JSON
      ),
    lastAsset:
      kidlearnV3_4e3ReadJsonProperty_(
        KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_KEYS.LAST_ASSET_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready for 4E-4.
 */
function kidlearnV3_assertHandwritingDriveWrite4E3ReadyV3() {
  var status =
    kidlearnV3_getHandwritingDriveWrite4E3StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_STATUS.READY_FOR_4E_4
  ) {
    errors.push(
      '4E-3 chưa READY_FOR_4E_4. Status=' +
      status.status
    );
  }

  if (
    !status.lastAsset ||
    status.lastAsset.actualDriveWritePerformed !== true
  ) {
    errors.push(
      'Chưa có bằng chứng actualDriveWritePerformed=true cho 4E-3.'
    );
  }

  if (
    !status.lastAsset ||
    !status.lastAsset.fileId
  ) {
    errors.push(
      'Chưa có fileId của handwriting asset.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_HANDWRITING_DRIVE_WRITE_4E_3_READY_V3',
    phase:
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.PHASE,
    status:
      status.status,
    fileId:
      status.lastAsset ? status.lastAsset.fileId : '',
    responseId:
      status.lastAsset ? status.lastAsset.responseId : '',
    nextBundle:
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realDriveWriteAllowed: true,
    dataResponsesWritePerformed: false,
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
 * Build real Drive write plan.
 * Không ghi Drive/Sheet.
 */
function kidlearnV3_4e3BuildDriveWritePlan_(payload) {
  var errors = [];
  var warnings = [];

  var e2 =
    kidlearnV3_4e3SafeCall_(
      'kidlearnV3_assertHandwritingUploadDryRun4E2ReadyV3'
    );

  if (!e2.success) {
    errors.push(
      '4E-2 chưa READY_FOR_4E_3: ' +
      e2.message
    );
  }

  var dev =
    kidlearnV3_4e3CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  warnings =
    warnings.concat(dev.warnings || []);

  var dryRun = null;

  try {
    dryRun =
      kidlearnV3_buildHandwritingUploadDryRunPreview4E2V3(
        payload
      );
  } catch (error) {
    errors.push(
      'Không build được dry-run plan 4E-2 cho 4E-3: ' +
      String(error.message || error)
    );
  }

  if (
    dryRun &&
    dryRun.warnings &&
    dryRun.warnings.length
  ) {
    warnings =
      warnings.concat(dryRun.warnings);
  }

  return {
    success: errors.length === 0,
    action: 'BUILD_HANDWRITING_DRIVE_WRITE_PLAN_4E_3_V3',
    phase:
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.PARENT_PHASE,
    writeName:
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.WRITE_NAME,
    nextBundle:
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realDriveWriteAllowed: true,
    actualDriveWritePerformed: false,
    actualSheetWritePerformed: false,
    dataResponsesWritePerformed: false,
    devSafety: dev,
    normalizedPayload:
      dryRun ? dryRun.normalizedPayload : null,
    canvasCheck:
      dryRun ? dryRun.canvasCheck : null,
    targetResponse:
      dryRun ? dryRun.targetResponse : null,
    driveUploadPreview:
      dryRun ? dryRun.driveUploadPreview : null,
    responseMetadataUpdatePreview:
      dryRun ? dryRun.responseMetadataUpdatePreview : null,
    auditPreview:
      dryRun ? dryRun.auditPreview : null,
    errorCount:
      errors.length,
    warningCount:
      kidlearnV3_4e3UniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4e3UniqueArray_(warnings)
  };
}


function kidlearnV3_4e3BuildSamplePayload_() {
  var responseStatus =
    kidlearnV3_4e3SafeCall_(
      'kidlearnV3_getResponseRealWrite4D3StatusV3'
    );

  var responseId = '';

  if (
    responseStatus.success &&
    responseStatus.output &&
    responseStatus.output.lastWrite &&
    responseStatus.output.lastWrite.responseId
  ) {
    responseId =
      responseStatus.output.lastWrite.responseId;
  }

  return {
    responseId: responseId,
    childId: 'CHD_V2_CHILD_DEFAULT',
    lessonId: 'MATH_L1',
    activityId: 'MATH_L1_ACT_1',
    subjectCode: 'MATH',
    answerMode: 'HANDWRITE_INPUT',

    /**
     * IMPORTANT 4E-3P2:
     * Đây là raw PNG data URL thật.
     * Không lấy từ 4E-2 dry-run vì 4E-2 có redact canvasDataUrl.
     */
    canvasDataUrl:
      'data:image/png;base64,' +
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=',

    source: '4E-3P2_RAW_SAMPLE_HANDWRITING_DRIVE_WRITE'
  };
}


/**
 * Create PNG blob from data URL.
 */
function kidlearnV3_4e3CreatePngBlobFromDataUrl_(dataUrl, fileName) {
  var text =
    String(dataUrl || '').trim();

  if (
    text.indexOf('data:image/png;base64,') !== 0
  ) {
    throw new Error(
      'canvasDataUrl không phải PNG base64 data URL.'
    );
  }

  var base64 =
    text.split(',')[1] || '';

  if (!base64) {
    throw new Error(
      'canvasDataUrl thiếu phần base64.'
    );
  }

  var bytes =
    Utilities.base64Decode(base64);

  return Utilities.newBlob(
    bytes,
    KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.MIME_TYPE,
    fileName
  );
}


function kidlearnV3_4e3GetOrCreateHandwritingFolders_(childId, lessonId) {
  var config =
    kidlearnV3_assertHandwritingDriveFolderConfig4E3PReadyV3();

  var safeChildId =
    kidlearnV3_4e3SafePathPart_(childId);

  var safeLessonId =
    kidlearnV3_4e3SafePathPart_(lessonId || 'UNKNOWN_LESSON');

  /**
   * IMPORTANT:
   * Không tự tạo root folder.
   * Không tự tạo HANDWRITING_RESPONSES.
   * Chỉ dùng folder IDs chị đã register.
   */
  var rootFolder =
    DriveApp.getFolderById(
      config.rootFolderId
    );

  var handwritingFolder =
    DriveApp.getFolderById(
      config.handwritingFolderId
    );

  /**
   * Chỉ tạo folder con trong đúng khu vực dự án.
   */
  var childFolder =
    kidlearnV3_4e3GetOrCreateChildFolder_(
      handwritingFolder,
      safeChildId
    );

  var lessonFolder =
    kidlearnV3_4e3GetOrCreateChildFolder_(
      childFolder,
      safeLessonId
    );

  return {
    rootFolder: rootFolder,
    handwritingFolder: handwritingFolder,
    childFolder: childFolder,
    lessonFolder: lessonFolder
  };
}


function kidlearnV3_4e3GetOrCreateFolderByName_(driveApp, folderName) {
  var iterator =
    driveApp.getFoldersByName(folderName);

  if (iterator.hasNext()) {
    return iterator.next();
  }

  return driveApp.createFolder(folderName);
}


function kidlearnV3_4e3GetOrCreateChildFolder_(parentFolder, folderName) {
  var iterator =
    parentFolder.getFoldersByName(folderName);

  if (iterator.hasNext()) {
    return iterator.next();
  }

  return parentFolder.createFolder(folderName);
}


/**
 * Append audit row.
 */
function kidlearnV3_4e3AppendAuditRow_(assetRecord, reviewerNote) {
  var spreadsheet =
    kidlearnV3_4e3OpenSpreadsheet_();

  var auditSheet =
    kidlearnV3_4e3GetSheetByExactName_(
      spreadsheet,
      'LOG_Audit'
    );

  if (!auditSheet) {
    throw new Error(
      'Không tìm thấy LOG_Audit.'
    );
  }

  var headerInfo =
    kidlearnV3_4e3InspectSheetHeaders_(
      spreadsheet,
      'LOG_Audit',
      []
    );

  var auditId =
    'AUD_4E3_DEV_' + new Date().getTime();

  var details = {
    phase: '4E-3',
    action: 'SAVE_HANDWRITING_PNG_TO_DRIVE',
    assetId:
      assetRecord.assetId,
    responseId:
      assetRecord.responseId,
    responseRowNumber:
      assetRecord.responseRowNumber,
    childId:
      assetRecord.childId,
    lessonId:
      assetRecord.lessonId,
    activityId:
      assetRecord.activityId,
    fileId:
      assetRecord.fileId,
    fileUrl:
      assetRecord.fileUrl,
    fileName:
      assetRecord.fileName,
    drivePath:
      assetRecord.drivePath,
    fileSizeBytes:
      assetRecord.fileSizeBytes,
    reviewStatus:
      assetRecord.reviewStatus,
    actualDriveWritePerformed: true,
    dataResponsesWritePerformed: false,
    note:
      reviewerNote || ''
  };

  var canonicalData = {
    auditId:
      auditId,
    action:
      'SAVE_HANDWRITING_PNG_TO_DRIVE_4E3',
    entityType:
      'HANDWRITING_ASSET',
    entityId:
      assetRecord.assetId,
    detailsJson:
      JSON.stringify(details),
    createdAt:
      new Date().toISOString(),
    actorId:
      assetRecord.childId,
    source:
      '4E-3',
    environment:
      'DEV'
  };

  var aliasMap =
    kidlearnV3_4e3GetAuditFieldAliasMap_();

  var rowValues =
    kidlearnV3_4e3BuildBlankRow_(
      headerInfo.lastColumn
    );

  var auditIdColumnIndex = 0;
  var errors = [];

  for (var key in canonicalData) {
    if (!canonicalData.hasOwnProperty(key)) continue;

    var match =
      kidlearnV3_4e3FindHeaderMatch_(
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

  if (!auditIdColumnIndex) {
    errors.push(
      'LOG_Audit không map được auditId.'
    );
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
      kidlearnV3_4e3FindHeaderMatch_(
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

  if (errors.length > 0) {
    throw new Error(
      'Không append audit 4E-3. Errors=' +
      errors.join(' | ')
    );
  }

  auditSheet.appendRow(rowValues);

  SpreadsheetApp.flush();

  return {
    success: true,
    auditId: auditId,
    auditRowNumber:
      auditSheet.getLastRow(),
    auditIdColumnIndex:
      auditIdColumnIndex
  };
}


/**
 * Verify audit row.
 */
function kidlearnV3_4e3VerifyAuditRow_(rowNumber, auditId) {
  var errors = [];

  var spreadsheet =
    kidlearnV3_4e3OpenSpreadsheet_();

  var sheet =
    kidlearnV3_4e3GetSheetByExactName_(
      spreadsheet,
      'LOG_Audit'
    );

  if (!sheet) {
    errors.push('Không tìm thấy LOG_Audit.');
  }

  if (!rowNumber || rowNumber < 1) {
    errors.push('auditRowNumber không hợp lệ.');
  }

  var headerInfo =
    kidlearnV3_4e3InspectSheetHeaders_(
      spreadsheet,
      'LOG_Audit',
      []
    );

  var auditIdColumn =
    kidlearnV3_4e3FindHeaderMatch_(
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
 * Header helpers.
 */
function kidlearnV3_4e3InspectSheetHeaders_(spreadsheet, sheetName, warnings) {
  warnings = warnings || [];

  if (
    typeof kidlearnV3_4e2InspectSheetHeaders_ === 'function'
  ) {
    return kidlearnV3_4e2InspectSheetHeaders_(
      spreadsheet,
      sheetName,
      warnings
    );
  }

  if (
    typeof kidlearnV3_4e1InspectSheetHeaders_ === 'function'
  ) {
    return kidlearnV3_4e1InspectSheetHeaders_(
      spreadsheet,
      sheetName,
      warnings
    );
  }

  var sheet =
    kidlearnV3_4e3GetSheetByExactName_(
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
    kidlearnV3_4e3HeaderScore_(values[1]) >=
      kidlearnV3_4e3HeaderScore_(values[0]) &&
    kidlearnV3_4e3HeaderScore_(values[1]) >= 3
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
        kidlearnV3_4e3NormalizeLookupKey_(raw)
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


function kidlearnV3_4e3HeaderScore_(row) {
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


function kidlearnV3_4e3FindHeaderMatch_(headers, aliases) {
  var map = {};

  for (var i = 0; i < aliases.length; i++) {
    map[
      kidlearnV3_4e3NormalizeLookupKey_(aliases[i])
    ] = true;
  }

  for (var j = 0; j < headers.length; j++) {
    if (map[headers[j].normalized]) {
      return headers[j];
    }
  }

  return null;
}


function kidlearnV3_4e3GetAuditFieldAliasMap_() {
  if (
    typeof kidlearnV3_4e2GetAuditFieldAliasMap_ === 'function'
  ) {
    return kidlearnV3_4e2GetAuditFieldAliasMap_();
  }

  if (
    typeof kidlearnV3_4d5GetAuditFieldAliasMap_ === 'function'
  ) {
    return kidlearnV3_4d5GetAuditFieldAliasMap_();
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


function kidlearnV3_4e3BuildBlankRow_(length) {
  var row = [];

  for (var i = 0; i < length; i++) {
    row.push('');
  }

  return row;
}


/**
 * Spreadsheet helpers.
 */
function kidlearnV3_4e3OpenSpreadsheet_() {
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


function kidlearnV3_4e3GetSheetByExactName_(spreadsheet, sheetName) {
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
 * DEV safety.
 */
function kidlearnV3_4e3CheckDevSafety_() {
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
    environment:
      environment || 'UNKNOWN',
    prodWriteAllowed: false,
    realDriveWriteAllowed: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Generic helpers.
 */
function kidlearnV3_4e3NormalizeLookupKey_(value) {
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


function kidlearnV3_4e3SafePathPart_(value) {
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


function kidlearnV3_4e3UniqueArray_(items) {
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


function kidlearnV3_4e3SafeCall_(functionName) {
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


function kidlearnV3_4e3SaveAssetRecord_(assetRecord) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_KEYS.LAST_ASSET_JSON,
      JSON.stringify(assetRecord)
    );
}


function kidlearnV3_4e3SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.PARENT_PHASE,
      status: status,
      writeName:
        KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.WRITE_NAME,
      nextBundle:
        KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_HANDWRITING_DRIVE_WRITE_4E3_CONFIG.NEXT_STAGE,
      prodWriteAllowed: false,
      realDriveWriteAllowed: true,
      actualDriveWritePerformed:
        result.actualDriveWritePerformed === true,
      actualSheetWritePerformed:
        result.actualSheetWritePerformed === true,
      dataResponsesWritePerformed:
        result.dataResponsesWritePerformed === true,
      fileId:
        result.fileId || '',
      fileUrl:
        result.fileUrl || '',
      responseId:
        result.responseId || '',
      assetId:
        result.assetId || '',
      auditId:
        result.auditId || '',
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


function kidlearnV3_4e3ReadJsonProperty_(key) {
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

function kidlearnV3_4e3IsRawPngDataUrl4E3P2_(value) {
  return String(value || '')
    .trim()
    .indexOf('data:image/png;base64,') === 0;
}


function kidlearnV3_4e3ResolveRawCanvasDataUrl4E3P2_(payload, normalized, plan) {
  payload = payload || {};
  normalized = normalized || {};
  plan = plan || {};

  var candidates = [
    {
      source: 'payload.canvasDataUrl',
      value: payload.canvasDataUrl
    },
    {
      source: 'normalized.canvasDataUrl',
      value: normalized.canvasDataUrl
    },
    {
      source: 'plan.normalizedPayload.canvasDataUrl',
      value:
        plan.normalizedPayload
          ? plan.normalizedPayload.canvasDataUrl
          : ''
    }
  ];

  for (var i = 0; i < candidates.length; i++) {
    if (
      kidlearnV3_4e3IsRawPngDataUrl4E3P2_(
        candidates[i].value
      )
    ) {
      return String(candidates[i].value).trim();
    }
  }

  throw new Error(
    'canvasDataUrl không phải PNG base64 data URL. ' +
    '4E-3P2 không tìm thấy raw PNG trong payload gốc. ' +
    'Có thể 4E-3 vẫn đang dùng dữ liệu đã redact từ 4E-2.'
  );
}


function kidlearnV3_debugRawCanvasPayload4E3P2V3() {
  var payload =
    kidlearnV3_4e3BuildSamplePayload_();

  var normalized =
    typeof kidlearnV3_4e3NormalizePayload_ === 'function'
      ? kidlearnV3_4e3NormalizePayload_(payload)
      : payload;

  var result = {
    success: true,
    action: 'DEBUG_RAW_CANVAS_PAYLOAD_4E_3P2_V3',
    phase: '4E-3P2',
    payloadCanvasPrefix:
      String(payload.canvasDataUrl || '').substring(0, 30),
    normalizedCanvasPrefix:
      String(normalized.canvasDataUrl || '').substring(0, 30),
    payloadIsRawPng:
      kidlearnV3_4e3IsRawPngDataUrl4E3P2_(payload.canvasDataUrl),
    normalizedIsRawPng:
      kidlearnV3_4e3IsRawPngDataUrl4E3P2_(normalized.canvasDataUrl),
    payloadLength:
      String(payload.canvasDataUrl || '').length,
    normalizedLength:
      String(normalized.canvasDataUrl || '').length
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}