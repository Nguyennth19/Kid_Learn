/**
 * ================================================================
 * KIDLEARN V3 - HANDWRITING STORAGE POLICY + DRIVE READINESS CHECK
 * Step: 4E-1
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Check readiness before saving handwriting canvas PNG to Google Drive.
 * - Confirm Phase 4D is locked.
 * - Confirm DEV environment.
 * - Confirm DriveApp access.
 * - Check Drive folder names, without creating folders.
 * - Check DATA_Responses has metadata column.
 * - Check LOG_Audit readiness.
 *
 * Safety:
 * - Không tạo Google Drive folder.
 * - Không tạo Google Drive file.
 * - Không ghi DATA_Responses.
 * - Không ghi LOG_Audit.
 * - Không ghi PROD.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4E-1.
 */


var KIDLEARN_V3_HANDWRITING_STORAGE_4E1_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4E1_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4E1_LAST_PREVIEW_AT',
  LAST_CHECK_AT: 'KIDLEARN_V3_PHASE_4E1_LAST_CHECK_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4E1_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4E1_LAST_RESULT_JSON'
};


var KIDLEARN_V3_HANDWRITING_STORAGE_4E1_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  CHECK_PASSED: 'CHECK_PASSED',
  READY_FOR_4E_2: 'READY_FOR_4E_2',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG = {
  PHASE: '4E-1',
  PARENT_PHASE: '4E',
  PREVIOUS_PHASE: '4D',
  NEXT_BUNDLE: '4E-2',
  NEXT_STAGE: 'HANDWRITING_UPLOAD_DRY_RUN_PREVIEW',
  POLICY_NAME: 'HANDWRITING_ASSET_STORAGE_AND_REVIEW_WORKFLOW',
  ROOT_ASSET_FOLDER_NAME: 'KIDLEARN_DEV_ASSETS',
  HANDWRITING_FOLDER_NAME: 'HANDWRITING_RESPONSES',
  DEFAULT_REVIEW_STATUS: 'NEEDS_REVIEW',
  STORAGE_MODE: 'GOOGLE_DRIVE_PNG',
  PROD_WRITE_ALLOWED: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false
};


/**
 * Preview handwriting storage readiness.
 * Không ghi Drive, không ghi Sheet.
 */
function kidlearnV3_previewHandwritingStorageReadiness4E1V3() {
  var result =
    kidlearnV3_4e1BuildReadiness_();

  var statusBefore =
    kidlearnV3_4e1GetCurrentStatus_();

  var statusAfter =
    kidlearnV3_4e1ResolveStatusAfterCheck_(
      statusBefore,
      result.success
        ? KIDLEARN_V3_HANDWRITING_STORAGE_4E1_STATUS.PREVIEWED
        : KIDLEARN_V3_HANDWRITING_STORAGE_4E1_STATUS.FAILED
    );

  result.action =
    'PREVIEW_HANDWRITING_STORAGE_READINESS_4E_1_V3';

  result.statusBefore =
    statusBefore;

  result.statusAfter =
    statusAfter;

  kidlearnV3_4e1SaveStatus_(
    result,
    statusAfter,
    KIDLEARN_V3_HANDWRITING_STORAGE_4E1_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4E-1 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Check handwriting storage readiness.
 * Không ghi Drive, không ghi Sheet.
 */
function kidlearnV3_checkHandwritingStorageReadiness4E1V3() {
  var result =
    kidlearnV3_4e1BuildReadiness_();

  var statusBefore =
    kidlearnV3_4e1GetCurrentStatus_();

  var statusAfter =
    kidlearnV3_4e1ResolveStatusAfterCheck_(
      statusBefore,
      result.success
        ? KIDLEARN_V3_HANDWRITING_STORAGE_4E1_STATUS.CHECK_PASSED
        : KIDLEARN_V3_HANDWRITING_STORAGE_4E1_STATUS.FAILED
    );

  result.action =
    'CHECK_HANDWRITING_STORAGE_READINESS_4E_1_V3';

  result.statusBefore =
    statusBefore;

  result.statusAfter =
    statusAfter;

  kidlearnV3_4e1SaveStatus_(
    result,
    statusAfter,
    KIDLEARN_V3_HANDWRITING_STORAGE_4E1_KEYS.LAST_CHECK_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4E-1 check failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready for 4E-2.
 */
function kidlearnV3_markHandwritingStorageReadiness4E1ReadyV3() {
  var check =
    kidlearnV3_checkHandwritingStorageReadiness4E1V3();

  if (!check.success) {
    throw new Error('Check 4E-1 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_HANDWRITING_STORAGE_READINESS_4E_1_READY_V3',
    phase:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_STATUS.READY_FOR_4E_2,
    policyName:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.POLICY_NAME,
    storageMode:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.STORAGE_MODE,
    defaultReviewStatus:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.DEFAULT_REVIEW_STATUS,
    nextBundle:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realDriveWriteAllowedNow: false,
    realSheetWriteAllowedNow: false,
    actualDriveWritePerformed: false,
    actualSheetWritePerformed: false,
    message:
      '4E-1 ready. Có thể qua 4E-2 Handwriting Upload Dry-run Preview.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4e1SaveStatus_(
    result,
    KIDLEARN_V3_HANDWRITING_STORAGE_4E1_STATUS.READY_FOR_4E_2,
    KIDLEARN_V3_HANDWRITING_STORAGE_4E1_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get 4E-1 status.
 */
function kidlearnV3_getHandwritingStorageReadiness4E1StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_HANDWRITING_STORAGE_READINESS_4E_1_STATUS_V3',
    phase:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_HANDWRITING_STORAGE_4E1_KEYS.STATUS
      ) ||
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_HANDWRITING_STORAGE_4E1_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastCheckAt:
      properties.getProperty(
        KIDLEARN_V3_HANDWRITING_STORAGE_4E1_KEYS.LAST_CHECK_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_HANDWRITING_STORAGE_4E1_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4e1ReadJsonProperty_(
        KIDLEARN_V3_HANDWRITING_STORAGE_4E1_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready for 4E-2.
 */
function kidlearnV3_assertHandwritingStorageReadiness4E1ReadyV3() {
  var status =
    kidlearnV3_getHandwritingStorageReadiness4E1StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_HANDWRITING_STORAGE_4E1_STATUS.READY_FOR_4E_2
  ) {
    errors.push(
      '4E-1 chưa READY_FOR_4E_2. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_HANDWRITING_STORAGE_READINESS_4E_1_READY_V3',
    phase:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.PARENT_PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.NEXT_STAGE,
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
 * QA batch 4E-1.
 */
function kidlearnV3_runQaBatch4E1V3() {
  var preview =
    kidlearnV3_previewHandwritingStorageReadiness4E1V3();

  var check =
    kidlearnV3_checkHandwritingStorageReadiness4E1V3();

  var ready =
    kidlearnV3_markHandwritingStorageReadiness4E1ReadyV3();

  var assertReady =
    kidlearnV3_assertHandwritingStorageReadiness4E1ReadyV3();

  var result = {
    success:
      preview.success === true &&
      check.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4E_1_HANDWRITING_STORAGE_POLICY_DRIVE_READINESS_CHECK',
    phase:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.PHASE,
    nextBundle:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.NEXT_STAGE,
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
    throw new Error('4E-1 QA batch failed.');
  }

  return result;
}


/**
 * Core readiness builder.
 */
function kidlearnV3_4e1BuildReadiness_() {
  var errors = [];
  var warnings = [];

  var phase4D =
    kidlearnV3_4e1SafeCall_(
      'kidlearnV3_assertPhase4DClosedLockedV3'
    );

  if (!phase4D.success) {
    errors.push(
      'Phase 4D chưa closed locked: ' +
      phase4D.message
    );
  }

  var devSafety =
    kidlearnV3_4e1CheckDevSafety_();

  if (!devSafety.success) {
    errors =
      errors.concat(devSafety.errors || []);
  }

  warnings =
    warnings.concat(devSafety.warnings || []);

  var driveReadiness =
    kidlearnV3_4e1CheckDriveReadiness_();

  if (!driveReadiness.success) {
    errors =
      errors.concat(driveReadiness.errors || []);
  }

  warnings =
    warnings.concat(driveReadiness.warnings || []);

  var sheetReadiness =
    kidlearnV3_4e1CheckSheetReadiness_();

  if (!sheetReadiness.success) {
    errors =
      errors.concat(sheetReadiness.errors || []);
  }

  warnings =
    warnings.concat(sheetReadiness.warnings || []);

  var policy =
    kidlearnV3_4e1BuildStoragePolicy_(
      driveReadiness,
      sheetReadiness
    );

  var result = {
    success: errors.length === 0,
    action: 'BUILD_HANDWRITING_STORAGE_READINESS_4E_1_V3',
    phase:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.PARENT_PHASE,
    policyName:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.POLICY_NAME,
    storageMode:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.STORAGE_MODE,
    defaultReviewStatus:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.DEFAULT_REVIEW_STATUS,
    nextBundle:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realDriveWriteAllowedNow: false,
    realSheetWriteAllowedNow: false,
    actualDriveWritePerformed: false,
    actualSheetWritePerformed: false,
    prerequisite: {
      phase4DClosedLocked:
        phase4D.success === true
    },
    devSafety: devSafety,
    driveReadiness: driveReadiness,
    sheetReadiness: sheetReadiness,
    storagePolicy: policy,
    readinessSummary: {
      phase4DClosedLocked:
        phase4D.success === true,
      devEnvironmentOk:
        devSafety.success === true,
      driveAccessOk:
        driveReadiness.driveAccessOk === true,
      rootAssetFolderExists:
        driveReadiness.rootAssetFolder &&
        driveReadiness.rootAssetFolder.exists === true,
      handwritingFolderExists:
        driveReadiness.handwritingFolder &&
        driveReadiness.handwritingFolder.exists === true,
      dataResponsesHasMetadata:
        sheetReadiness.dataResponses &&
        sheetReadiness.dataResponses.metadataColumnDetected !== null,
      logAuditReady:
        sheetReadiness.logAudit &&
        sheetReadiness.logAudit.success === true,
      readyFor4E2DryRun:
        errors.length === 0
    },
    errorCount: errors.length,
    warningCount:
      kidlearnV3_4e1UniqueArray_(warnings).length,
    errors: errors,
    warnings:
      kidlearnV3_4e1UniqueArray_(warnings)
  };

  return result;
}


/**
 * Build storage policy.
 */
function kidlearnV3_4e1BuildStoragePolicy_(driveReadiness, sheetReadiness) {
  return {
    storageMode:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.STORAGE_MODE,
    mimeType: 'image/png',
    fileExtension: '.png',
    rootAssetFolderName:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.ROOT_ASSET_FOLDER_NAME,
    handwritingFolderName:
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.HANDWRITING_FOLDER_NAME,
    proposedDrivePathTemplate:
      'KIDLEARN_DEV_ASSETS/HANDWRITING_RESPONSES/{childId}/{lessonId}/HW_{yyyyMMdd_HHmmss}_{responseId}.png',
    dataResponsesMetadataColumn:
      sheetReadiness &&
      sheetReadiness.dataResponses &&
      sheetReadiness.dataResponses.metadataColumnDetected
        ? sheetReadiness.dataResponses.metadataColumnDetected.raw
        : '',
    answerMetaJsonShape: {
      handwritingAsset: {
        storage: 'GOOGLE_DRIVE',
        fileId: '<created in 4E-3>',
        fileUrl: '<created in 4E-3>',
        mimeType: 'image/png',
        fileName: 'HW_yyyyMMdd_HHmmss_responseId.png',
        reviewStatus:
          KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.DEFAULT_REVIEW_STATUS,
        createdAt: '<timestamp>'
      }
    },
    reviewWorkflow: {
      defaultStatus:
        KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.DEFAULT_REVIEW_STATUS,
      allowedStatuses: [
        'HANDWRITING_CAPTURED',
        'NEEDS_REVIEW',
        'REVIEWED_ACCEPTED',
        'REVIEWED_RETRY'
      ],
      autoOcrEnabledNow: false,
      aiAutoGradingEnabledNow: false,
      parentReviewRequired: true
    },
    safety: {
      createFolderNow: false,
      createFileNow: false,
      updateDataResponsesNow: false,
      updateLogAuditNow: false,
      prodWriteAllowed: false
    }
  };
}


/**
 * Drive readiness check.
 * Không tạo folder/file.
 */
function kidlearnV3_4e1CheckDriveReadiness_() {
  var errors = [];
  var warnings = [];

  var driveAccessOk = false;
  var rootInfo = null;
  var handwritingInfo = null;

  try {
    var rootDrive =
      DriveApp.getRootFolder();

    var rootName =
      rootDrive.getName();

    driveAccessOk = true;

    var rootFolders =
      kidlearnV3_4e1FindDriveFoldersByName_(
        KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.ROOT_ASSET_FOLDER_NAME
      );

    rootInfo = {
      exists:
        rootFolders.length > 0,
      folderName:
        KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.ROOT_ASSET_FOLDER_NAME,
      matchCount:
        rootFolders.length,
      folders:
        rootFolders
    };

    if (rootFolders.length === 0) {
      warnings.push(
        'Chưa tìm thấy folder KIDLEARN_DEV_ASSETS. 4E-2/4E-3 sẽ cần tạo folder bằng confirm riêng.'
      );
    }

    if (rootFolders.length > 1) {
      warnings.push(
        'Có nhiều hơn 1 folder tên KIDLEARN_DEV_ASSETS. 4E-2 nên chọn folderId rõ ràng.'
      );
    }

    if (rootFolders.length > 0) {
      var selectedRootFolder =
        DriveApp.getFolderById(rootFolders[0].id);

      var childFolders =
        kidlearnV3_4e1FindChildFoldersByName_(
          selectedRootFolder,
          KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.HANDWRITING_FOLDER_NAME
        );

      handwritingInfo = {
        exists:
          childFolders.length > 0,
        folderName:
          KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.HANDWRITING_FOLDER_NAME,
        parentFolderId:
          rootFolders[0].id,
        matchCount:
          childFolders.length,
        folders:
          childFolders
      };

      if (childFolders.length === 0) {
        warnings.push(
          'Chưa tìm thấy folder HANDWRITING_RESPONSES trong KIDLEARN_DEV_ASSETS. 4E-2/4E-3 sẽ cần tạo folder bằng confirm riêng.'
        );
      }

      if (childFolders.length > 1) {
        warnings.push(
          'Có nhiều hơn 1 folder HANDWRITING_RESPONSES trong KIDLEARN_DEV_ASSETS. 4E-2 nên chọn folderId rõ ràng.'
        );
      }
    } else {
      handwritingInfo = {
        exists: false,
        folderName:
          KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.HANDWRITING_FOLDER_NAME,
        parentFolderId: '',
        matchCount: 0,
        folders: []
      };
    }

  } catch (error) {
    errors.push(
      'DriveApp readiness failed: ' +
      String(error.message || error)
    );
  }

  return {
    success: errors.length === 0,
    action: 'CHECK_DRIVE_READINESS_4E_1_V3',
    driveAccessOk: driveAccessOk,
    rootAssetFolder: rootInfo,
    handwritingFolder: handwritingInfo,
    requiredFolders: [
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.ROOT_ASSET_FOLDER_NAME,
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.HANDWRITING_FOLDER_NAME
    ],
    willCreateFolderNow: false,
    willCreateFileNow: false,
    actualDriveWritePerformed: false,
    errorCount: errors.length,
    warningCount:
      kidlearnV3_4e1UniqueArray_(warnings).length,
    errors: errors,
    warnings:
      kidlearnV3_4e1UniqueArray_(warnings)
  };
}


/**
 * Sheet readiness check.
 */
function kidlearnV3_4e1CheckSheetReadiness_() {
  var errors = [];
  var warnings = [];

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4e1OpenSpreadsheet_();
  } catch (error) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(error.message || error)
    );
  }

  var dataResponses = null;
  var logAudit = null;

  if (spreadsheet) {
    dataResponses =
      kidlearnV3_4e1InspectDataResponses_(
        spreadsheet,
        warnings
      );

    logAudit =
      kidlearnV3_4e1InspectLogAudit_(
        spreadsheet,
        warnings
      );

    if (!dataResponses.success) {
      errors =
        errors.concat(dataResponses.errors || []);
    }

    if (!logAudit.success) {
      errors =
        errors.concat(logAudit.errors || []);
    }
  }

  return {
    success: errors.length === 0,
    action: 'CHECK_SHEET_READINESS_4E_1_V3',
    dataResponses: dataResponses,
    logAudit: logAudit,
    willUpdateSheetNow: false,
    actualSheetWritePerformed: false,
    errorCount: errors.length,
    warningCount:
      kidlearnV3_4e1UniqueArray_(warnings).length,
    errors: errors,
    warnings:
      kidlearnV3_4e1UniqueArray_(warnings)
  };
}


function kidlearnV3_4e1InspectDataResponses_(spreadsheet, warnings) {
  var errors = [];

  var headerInfo =
    kidlearnV3_4e1InspectSheetHeaders_(
      spreadsheet,
      'DATA_Responses',
      warnings
    );

  if (!headerInfo.exists) {
    errors.push('Không tìm thấy DATA_Responses.');
  }

  var metadataColumn =
    kidlearnV3_4e1FindHeaderMatch_(
      headerInfo.headers || [],
      [
        'answerMetaJson',
        'detailsJson',
        'metaJson',
        'payloadJson',
        'metadataJson'
      ]
    );

  if (!metadataColumn) {
    errors.push(
      'DATA_Responses chưa có answerMetaJson/detailsJson/metaJson/payloadJson. Cần metadata column trước khi lưu handwriting asset link.'
    );
  }

  var responseIdColumn =
    kidlearnV3_4e1FindHeaderMatch_(
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

  if (!responseIdColumn) {
    errors.push(
      'DATA_Responses chưa map được responseId/id.'
    );
  }

  return {
    success: errors.length === 0,
    sheetName: 'DATA_Responses',
    exists: headerInfo.exists,
    headerRowIndex: headerInfo.headerRowIndex,
    lastRow: headerInfo.lastRow,
    lastColumn: headerInfo.lastColumn,
    metadataColumnDetected: metadataColumn,
    responseIdColumnDetected: responseIdColumn,
    requiredFor4E: {
      metadataColumn: metadataColumn !== null,
      responseIdColumn: responseIdColumn !== null
    },
    errorCount: errors.length,
    errors: errors
  };
}


function kidlearnV3_4e1InspectLogAudit_(spreadsheet, warnings) {
  var errors = [];

  var headerInfo =
    kidlearnV3_4e1InspectSheetHeaders_(
      spreadsheet,
      'LOG_Audit',
      warnings
    );

  if (!headerInfo.exists) {
    errors.push('Không tìm thấy LOG_Audit.');
  }

  var required = [
    {
      key: 'auditId',
      aliases: ['auditId', 'logId', 'id']
    },
    {
      key: 'action',
      aliases: ['action', 'actionType', 'event', 'operation']
    },
    {
      key: 'entityType',
      aliases: ['entityType', 'targetSheet', 'sheetName', 'objectType']
    },
    {
      key: 'entityId',
      aliases: ['entityId', 'targetId', 'objectId', 'recordId']
    },
    {
      key: 'detailsJson',
      aliases: ['detailsJson', 'payloadJson', 'metaJson', 'description']
    },
    {
      key: 'createdAt',
      aliases: ['createdAt', 'timestamp', 'time', 'loggedAt']
    }
  ];

  var matched = [];
  var missing = [];

  for (var i = 0; i < required.length; i++) {
    var match =
      kidlearnV3_4e1FindHeaderMatch_(
        headerInfo.headers || [],
        required[i].aliases
      );

    if (match) {
      matched.push({
        canonical: required[i].key,
        matchedHeader: match.raw,
        columnIndex: match.columnIndex
      });
    } else {
      missing.push(required[i].key);
      errors.push(
        'LOG_Audit thiếu required field: ' +
        required[i].key
      );
    }
  }

  return {
    success: errors.length === 0,
    sheetName: 'LOG_Audit',
    exists: headerInfo.exists,
    headerRowIndex: headerInfo.headerRowIndex,
    lastRow: headerInfo.lastRow,
    lastColumn: headerInfo.lastColumn,
    matchedRequiredFields: matched,
    missingRequiredFields: missing,
    errorCount: errors.length,
    errors: errors
  };
}


/**
 * Drive helper: search by folder name.
 */
function kidlearnV3_4e1FindDriveFoldersByName_(folderName) {
  var iterator =
    DriveApp.getFoldersByName(folderName);

  var result = [];

  while (iterator.hasNext()) {
    var folder =
      iterator.next();

    result.push({
      id:
        folder.getId(),
      name:
        folder.getName(),
      url:
        folder.getUrl()
    });
  }

  return result;
}


/**
 * Drive helper: search child folder by name.
 */
function kidlearnV3_4e1FindChildFoldersByName_(parentFolder, folderName) {
  var iterator =
    parentFolder.getFoldersByName(folderName);

  var result = [];

  while (iterator.hasNext()) {
    var folder =
      iterator.next();

    result.push({
      id:
        folder.getId(),
      name:
        folder.getName(),
      url:
        folder.getUrl()
    });
  }

  return result;
}


/**
 * DEV safety.
 */
function kidlearnV3_4e1CheckDevSafety_() {
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
    action: 'CHECK_DEV_SAFETY_4E_1_V3',
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
 * Sheet header helpers.
 */
function kidlearnV3_4e1InspectSheetHeaders_(spreadsheet, sheetName, warnings) {
  warnings = warnings || [];

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
    kidlearnV3_4e1GetSheetByExactName_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return {
      exists: false,
      sheetName: sheetName,
      headerRowIndex: 0,
      dataStartRowIndex: 0,
      headerCount: 0,
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
    warnings.push(
      sheetName + ': Sheet trống.'
    );

    return {
      exists: true,
      sheetName: sheetName,
      headerRowIndex: 1,
      dataStartRowIndex: 2,
      headerCount: 0,
      lastRow: lastRow,
      lastColumn: lastColumn,
      headers: []
    };
  }

  var values =
    sheet
      .getRange(1, 1, Math.min(2, lastRow), lastColumn)
      .getValues();

  var row1Score =
    kidlearnV3_4e1HeaderScore_(values[0] || []);

  var row2Score =
    values.length > 1
      ? kidlearnV3_4e1HeaderScore_(values[1] || [])
      : 0;

  var headerRowIndex =
    row2Score >= 3 && row2Score >= row1Score
      ? 2
      : 1;

  var headerRow =
    values[headerRowIndex - 1] || [];

  var headers = [];

  for (var i = 0; i < headerRow.length; i++) {
    var raw =
      String(headerRow[i] || '').trim();

    if (!raw) continue;

    headers.push({
      columnIndex: i + 1,
      raw: raw,
      normalized:
        kidlearnV3_4e1NormalizeLookupKey_(raw)
    });
  }

  return {
    exists: true,
    sheetName: sheetName,
    headerRowIndex: headerRowIndex,
    dataStartRowIndex: headerRowIndex + 1,
    headerCount: headers.length,
    lastRow: lastRow,
    lastColumn: lastColumn,
    headers: headers
  };
}


function kidlearnV3_4e1HeaderScore_(row) {
  var score = 0;

  for (var i = 0; i < row.length; i++) {
    var value =
      String(row[i] || '').trim();

    if (!value) continue;

    if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
      score++;
    }
  }

  return score;
}


function kidlearnV3_4e1FindHeaderMatch_(headers, aliases) {
  var map = {};

  for (var i = 0; i < aliases.length; i++) {
    map[
      kidlearnV3_4e1NormalizeLookupKey_(aliases[i])
    ] = true;
  }

  for (var j = 0; j < headers.length; j++) {
    if (map[headers[j].normalized]) {
      return headers[j];
    }
  }

  return null;
}


/**
 * Spreadsheet helpers.
 */
function kidlearnV3_4e1OpenSpreadsheet_() {
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


function kidlearnV3_4e1GetSheetByExactName_(spreadsheet, sheetName) {
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
 * Generic helpers.
 */
function kidlearnV3_4e1NormalizeLookupKey_(value) {
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


function kidlearnV3_4e1UniqueArray_(items) {
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


function kidlearnV3_4e1SafeCall_(functionName) {
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

    var fn =
      eval(functionName);

    var output =
      fn();

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


function kidlearnV3_4e1GetCurrentStatus_() {
  return (
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_HANDWRITING_STORAGE_4E1_KEYS.STATUS
      ) ||
    KIDLEARN_V3_HANDWRITING_STORAGE_4E1_STATUS.NOT_RUN
  );
}


function kidlearnV3_4e1ResolveStatusAfterCheck_(statusBefore, proposedStatus) {
  if (
    statusBefore ===
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_STATUS.READY_FOR_4E_2 &&
    proposedStatus !==
      KIDLEARN_V3_HANDWRITING_STORAGE_4E1_STATUS.FAILED
  ) {
    return KIDLEARN_V3_HANDWRITING_STORAGE_4E1_STATUS.READY_FOR_4E_2;
  }

  return proposedStatus;
}


function kidlearnV3_4e1SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_HANDWRITING_STORAGE_4E1_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_HANDWRITING_STORAGE_4E1_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.PARENT_PHASE,
      status: status,
      policyName:
        KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.POLICY_NAME,
      storageMode:
        KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.STORAGE_MODE,
      nextBundle:
        KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_HANDWRITING_STORAGE_4E1_CONFIG.NEXT_STAGE,
      prodWriteAllowed: false,
      realDriveWriteAllowedNow: false,
      realSheetWriteAllowedNow: false,
      actualDriveWritePerformed: false,
      actualSheetWritePerformed: false,
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


function kidlearnV3_4e1ReadJsonProperty_(key) {
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