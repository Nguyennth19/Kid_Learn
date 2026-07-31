/**
 * ================================================================
 * KIDLEARN V3 - PROD POST-DEPLOY VALIDATION
 * Bundle: 3N-G
 * Version: 3.1.0
 * ================================================================
 *
 * 3N-G:
 * - Validate PROD file đã được tạo ở 3N-F.
 * - Không ghi vào PROD file.
 * - Không migration.
 * - Không rollback.
 * - Không real write.
 * - Không create/delete sheet.
 * - Chỉ ghi ScriptProperties trong DEV script để lưu validation/status.
 */


var KIDLEARN_V3_PROD_VALIDATE_3NG_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3NG_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3NG_LAST_PREVIEW_AT',
  LAST_VALIDATION_AT: 'KIDLEARN_V3_PHASE_3NG_LAST_VALIDATION_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3NG_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3NG_LAST_RESULT_JSON',
  LAST_VALIDATION_JSON: 'KIDLEARN_V3_PHASE_3NG_LAST_VALIDATION_JSON'
};


var KIDLEARN_V3_PROD_VALIDATE_3NG_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  VALIDATION_PASSED: 'VALIDATION_PASSED',
  READY_FOR_3N_H: 'READY_FOR_3N_H',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_VALIDATE_3NG_CONFIG = {
  VERSION: '3N-G',
  PHASE: '3N-G',
  NEXT_BUNDLE: '3N-H',
  NEXT_STAGE: 'PROD_RUNTIME_SMOKE_TEST',
  EXPECTED_SHEET_COUNT: 44,
  WRITE_MODE: 'PROD_READ_ONLY_VALIDATION',
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  MAX_SAMPLE_ROWS: 5
};


/**
 * Preview 3N-G.
 */
function kidlearnV3_previewProdPostDeployValidation3NGV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3ngCheckFunctions_([
      'kidlearnV3_assertControlledProdDeployment3NFReadyV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_appGetActiveDatabaseV3_',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3NF =
    kidlearnV3_3ngSafeAssert_(
      'kidlearnV3_assertControlledProdDeployment3NFReadyV3',
      '3N-F'
    );

  if (!phase3NF.success) {
    errors.push(
      '3N-F chưa READY_FOR_3N_G: ' +
      phase3NF.message
    );
  }

  var prodInfo =
    kidlearnV3_3ngGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push(
      'Thiếu prodFileId từ 3N-F.'
    );
  }

  if (!prodInfo.prodFileUrl) {
    errors.push(
      'Thiếu prodFileUrl từ 3N-F.'
    );
  }

  var prodFileCheck =
    kidlearnV3_3ngCheckProdFileAccessible_(
      prodInfo.prodFileId
    );

  if (!prodFileCheck.success) {
    errors.push(
      'PROD file chưa accessible: ' +
      prodFileCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3ngCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var idSafety =
    kidlearnV3_3ngCheckProdFileIdentitySafety_(
      prodInfo.prodFileId
    );

  errors = errors.concat(idSafety.errors);
  warnings = warnings.concat(idSafety.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_POST_DEPLOY_VALIDATION_3NG_V3',
    bundle: '3N-G',
    phase: KIDLEARN_V3_PROD_VALIDATE_3NG_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_VALIDATE_3NG_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_VALIDATE_3NG_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_VALIDATE_3NG_CONFIG.WRITE_MODE,
    prodDeployNow: false,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3NF: phase3NF,
    prodInfo: prodInfo,
    prodFileCheck: prodFileCheck,
    safeModes: safeModes,
    idSafety: idSafety,
    requiredFunctions: requiredFunctions.items,
    note:
      '3N-G chỉ validate PROD file read-only. Không sửa PROD file.'
  };

  kidlearnV3_3ngSaveResult_(
    result,
    KIDLEARN_V3_PROD_VALIDATE_3NG_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_VALIDATE_3NG_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Run PROD post-deploy validation.
 */
function kidlearnV3_runProdPostDeployValidation3NGV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdPostDeployValidation3NGV3();

  if (!preview.success) {
    throw new Error(
      'Không thể chạy PROD post-deploy validation 3N-G vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var prodInfo =
    kidlearnV3_3ngGetProdInfo_();

  var prodSpreadsheet =
    SpreadsheetApp.openById(
      prodInfo.prodFileId
    );

  var fileIdentity =
    kidlearnV3_3ngBuildFileIdentity_(
      prodSpreadsheet
    );

  var idSafety =
    kidlearnV3_3ngCheckProdFileIdentitySafety_(
      prodInfo.prodFileId
    );

  errors = errors.concat(idSafety.errors);
  warnings = warnings.concat(idSafety.warnings);

  var inventory =
    kidlearnV3_3ngValidateSheetInventory_(
      prodSpreadsheet
    );

  errors = errors.concat(inventory.errors);
  warnings = warnings.concat(inventory.warnings);

  var headers =
    kidlearnV3_3ngValidateSheetHeaders_(
      prodSpreadsheet
    );

  errors = errors.concat(headers.errors);
  warnings = warnings.concat(headers.warnings);

  var sampleReads =
    kidlearnV3_3ngRunSampleReadValidation_(
      prodSpreadsheet
    );

  errors = errors.concat(sampleReads.errors);
  warnings = warnings.concat(sampleReads.warnings);

  var legacyCheck =
    kidlearnV3_3ngCheckLegacySheets_(
      prodSpreadsheet
    );

  warnings = warnings.concat(legacyCheck.warnings);

  var safeModes =
    kidlearnV3_3ngCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var noSideEffect =
    kidlearnV3_3ngBuildNoSideEffectStatement_();

  var decision =
    errors.length === 0
      ? 'PROD_POST_DEPLOY_VALIDATION_PASSED'
      : 'HOLD_PROD_VALIDATION_FAILED';

  var finishedAt = new Date();

  var validation = {
    success: errors.length === 0,
    action: 'RUN_PROD_POST_DEPLOY_VALIDATION_3NG_V3',
    bundle: '3N-G',
    phase: KIDLEARN_V3_PROD_VALIDATE_3NG_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_VALIDATE_3NG_STATUS.VALIDATION_PASSED
        : KIDLEARN_V3_PROD_VALIDATE_3NG_STATUS.FAILED,
    nextBundle:
      KIDLEARN_V3_PROD_VALIDATE_3NG_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_VALIDATE_3NG_CONFIG.NEXT_STAGE,
    decision: decision,
    prodDeployNow: false,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    fileIdentity: fileIdentity,
    idSafety: idSafety.summary,
    inventory: inventory.summary,
    headers: headers.summary,
    sampleReads: sampleReads.summary,
    legacyCheck: legacyCheck.summary,
    safeModes: safeModes.summary,
    noSideEffect: noSideEffect,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_3ngSaveValidation_(
    validation
  );

  kidlearnV3_3ngSaveResult_(
    validation,
    validation.success
      ? KIDLEARN_V3_PROD_VALIDATE_3NG_STATUS.VALIDATION_PASSED
      : KIDLEARN_V3_PROD_VALIDATE_3NG_STATUS.FAILED,
    KIDLEARN_V3_PROD_VALIDATE_3NG_KEYS.LAST_VALIDATION_AT
  );

  console.log(JSON.stringify(validation, null, 2));

  if (!validation.success) {
    throw new Error(
      '3N-G PROD post-deploy validation failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return validation;
}


/**
 * Mark 3N-G ready.
 */
function kidlearnV3_markProdPostDeployValidation3NGReadyV3() {
  var status =
    kidlearnV3_getProdPostDeployValidation3NGStatusV3();

  var errors = [];

  if (
    status.status !==
      KIDLEARN_V3_PROD_VALIDATE_3NG_STATUS.VALIDATION_PASSED &&
    status.status !==
      KIDLEARN_V3_PROD_VALIDATE_3NG_STATUS.READY_FOR_3N_H
  ) {
    errors.push(
      '3N-G chưa VALIDATION_PASSED. Status=' +
      status.status
    );
  }

  if (
    !status.lastValidation ||
    status.lastValidation.success !== true
  ) {
    errors.push(
      'Last validation chưa success=true.'
    );
  }

  var prodInfo =
    kidlearnV3_3ngGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push(
      'Thiếu prodFileId.'
    );
  }

  var prodFileCheck =
    kidlearnV3_3ngCheckProdFileAccessible_(
      prodInfo.prodFileId
    );

  if (!prodFileCheck.success) {
    errors.push(
      'PROD file không còn accessible: ' +
      prodFileCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3ngCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3N-G ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_POST_DEPLOY_VALIDATION_3NG_READY_V3',
    bundle: '3N-G',
    phase: KIDLEARN_V3_PROD_VALIDATE_3NG_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_VALIDATE_3NG_STATUS.READY_FOR_3N_H,
    prodFileId: prodInfo.prodFileId,
    prodFileUrl: prodInfo.prodFileUrl,
    nextBundle:
      KIDLEARN_V3_PROD_VALIDATE_3NG_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_VALIDATE_3NG_CONFIG.NEXT_STAGE,
    message:
      '3N-G ready. PROD file đã pass post-deploy validation. Bước tiếp theo là 3N-H PROD runtime smoke test.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3ngSaveResult_(
    result,
    KIDLEARN_V3_PROD_VALIDATE_3NG_STATUS.READY_FOR_3N_H,
    KIDLEARN_V3_PROD_VALIDATE_3NG_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3N-G status.
 */
function kidlearnV3_getProdPostDeployValidation3NGStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_POST_DEPLOY_VALIDATION_3NG_STATUS_V3',
    bundle: '3N-G',
    phase: KIDLEARN_V3_PROD_VALIDATE_3NG_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_VALIDATE_3NG_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_VALIDATE_3NG_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_VALIDATE_3NG_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastValidationAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_VALIDATE_3NG_KEYS.LAST_VALIDATION_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_VALIDATE_3NG_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3ngReadJsonProperty_(
        KIDLEARN_V3_PROD_VALIDATE_3NG_KEYS.LAST_RESULT_JSON
      ),
    lastValidation:
      kidlearnV3_3ngReadJsonProperty_(
        KIDLEARN_V3_PROD_VALIDATE_3NG_KEYS.LAST_VALIDATION_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3N-G ready.
 */
function kidlearnV3_assertProdPostDeployValidation3NGReadyV3() {
  var status =
    kidlearnV3_getProdPostDeployValidation3NGStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_VALIDATE_3NG_STATUS.READY_FOR_3N_H
  ) {
    errors.push(
      '3N-G chưa READY_FOR_3N_H. Status=' +
      status.status
    );
  }

  var prodInfo =
    kidlearnV3_3ngGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push(
      'Thiếu prodFileId.'
    );
  }

  if (!prodInfo.prodFileUrl) {
    errors.push(
      'Thiếu prodFileUrl.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_POST_DEPLOY_VALIDATION_3NG_READY_V3',
    bundle: '3N-G',
    phase: KIDLEARN_V3_PROD_VALIDATE_3NG_CONFIG.PHASE,
    status: status.status,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_VALIDATE_3NG_CONFIG.NEXT_BUNDLE,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3N-G chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3N-G.
 */
function kidlearnV3_getQaBatchSteps3NGV3() {
  return [
    {
      label: 'Assert 3N-F ready',
      functionName: 'kidlearnV3_assertControlledProdDeployment3NFReadyV3'
    },
    {
      label: 'Preview PROD Post-deploy Validation 3N-G',
      functionName: 'kidlearnV3_previewProdPostDeployValidation3NGV3'
    },
    {
      label: 'Run PROD Post-deploy Validation 3N-G',
      functionName: 'kidlearnV3_runProdPostDeployValidation3NGV3'
    },
    {
      label: 'Mark PROD Post-deploy Validation 3N-G Ready',
      functionName: 'kidlearnV3_markProdPostDeployValidation3NGReadyV3'
    },
    {
      label: 'Assert PROD Post-deploy Validation 3N-G Ready',
      functionName: 'kidlearnV3_assertProdPostDeployValidation3NGReadyV3'
    }
  ];
}


/**
 * QA batch 3N-G.
 *
 * Read-only validation với PROD file.
 */
function kidlearnV3_runQaBatch3NGV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3N_G_PROD_POST_DEPLOY_VALIDATION',
    kidlearnV3_getQaBatchSteps3NGV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * PROD info từ 3N-F.
 */
function kidlearnV3_3ngGetProdInfo_() {
  var status =
    kidlearnV3_getControlledProdDeployment3NFStatusV3();

  return {
    status: status.status || '',
    deploymentId: status.deploymentId || '',
    prodFileId: status.prodFileId || '',
    prodFileUrl: status.prodFileUrl || '',
    prodFileName: status.prodFileName || ''
  };
}


/**
 * Check PROD file accessible.
 */
function kidlearnV3_3ngCheckProdFileAccessible_(prodFileId) {
  try {
    if (!prodFileId) {
      return {
        success: false,
        message: 'Thiếu prodFileId.'
      };
    }

    var file =
      DriveApp.getFileById(prodFileId);

    return {
      success: true,
      prodFileId: prodFileId,
      prodFileName: file.getName(),
      prodFileUrl: file.getUrl(),
      message: 'PROD file accessible.'
    };

  } catch (error) {
    return {
      success: false,
      prodFileId: prodFileId || '',
      message:
        String(error.message || error)
    };
  }
}


/**
 * Build file identity.
 */
function kidlearnV3_3ngBuildFileIdentity_(spreadsheet) {
  return {
    spreadsheetId: spreadsheet.getId(),
    spreadsheetName: spreadsheet.getName(),
    spreadsheetUrl: spreadsheet.getUrl(),
    timeZone: spreadsheet.getSpreadsheetTimeZone()
  };
}


/**
 * Check PROD file identity safety.
 */
function kidlearnV3_3ngCheckProdFileIdentitySafety_(prodFileId) {
  var errors = [];
  var warnings = [];

  var devId = '';
  var backupId = '';

  try {
    var devSpreadsheet =
      kidlearnV3_3ngGetDatabaseSpreadsheet_();

    devId =
      devSpreadsheet.getId();

    if (prodFileId === devId) {
      errors.push(
        'prodFileId đang trùng DEV spreadsheetId. Không hợp lệ.'
      );
    }

  } catch (error) {
    warnings.push(
      'Không kiểm tra được DEV spreadsheetId: ' +
      String(error.message || error)
    );
  }

  try {
    var backupStatus =
      kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3();

    backupId =
      backupStatus.backupFileId || '';

    if (backupId && prodFileId === backupId) {
      warnings.push(
        'prodFileId đang trùng backupFileId. Kiểm tra lại: PROD nên là bản copy từ backup, không phải chính backup.'
      );
    }

  } catch (error2) {
    warnings.push(
      'Không kiểm tra được backupFileId: ' +
      String(error2.message || error2)
    );
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    summary: {
      prodFileId: prodFileId || '',
      devSpreadsheetId: devId,
      backupFileId: backupId,
      prodIsDifferentFromDev: prodFileId && devId ? prodFileId !== devId : '',
      prodIsDifferentFromBackup: prodFileId && backupId ? prodFileId !== backupId : ''
    }
  };
}


/**
 * Validate sheet inventory.
 */
function kidlearnV3_3ngValidateSheetInventory_(spreadsheet) {
  var errors = [];
  var warnings = [];

  var expectedSheets =
    kidlearnV3_3ngGetExpectedSheets_();

  var items = [];
  var missing = [];

  for (var i = 0; i < expectedSheets.length; i++) {
    var sheetName =
      expectedSheets[i];

    var sheet =
      kidlearnV3_3ngGetSheet_(
        spreadsheet,
        sheetName
      );

    if (!sheet) {
      missing.push(sheetName);

      items.push({
        sheetName: sheetName,
        exists: false
      });

      continue;
    }

    var lastRow =
      sheet.getLastRow();

    var lastColumn =
      sheet.getLastColumn();

    items.push({
      sheetName: sheetName,
      exists: true,
      lastRow: lastRow,
      lastColumn: lastColumn
    });

    if (lastRow < 2) {
      warnings.push(
        sheetName +
        ' có ít hơn 2 dòng header/key.'
      );
    }

    if (lastColumn < 1) {
      warnings.push(
        sheetName +
        ' không có cột dữ liệu.'
      );
    }
  }

  if (missing.length > 0) {
    errors.push(
      'PROD file thiếu V3 sheets: ' +
      missing.join(', ')
    );
  }

  var actualSheetNames =
    spreadsheet
      .getSheets()
      .map(function(sheet) {
        return sheet.getName();
      });

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    items: items,
    summary: {
      expectedSheetCount: expectedSheets.length,
      actualSheetCount: actualSheetNames.length,
      foundExpectedSheetCount:
        items.filter(function(item) {
          return item.exists;
        }).length,
      missingSheetCount: missing.length,
      missingSheets: missing
    }
  };
}


/**
 * Validate row 1 labels and row 2 keys.
 */
function kidlearnV3_3ngValidateSheetHeaders_(spreadsheet) {
  var errors = [];
  var warnings = [];
  var items = [];

  var expectedSheets =
    kidlearnV3_3ngGetExpectedSheets_();

  for (var i = 0; i < expectedSheets.length; i++) {
    var sheetName =
      expectedSheets[i];

    var sheet =
      kidlearnV3_3ngGetSheet_(
        spreadsheet,
        sheetName
      );

    if (!sheet) {
      continue;
    }

    var lastColumn =
      sheet.getLastColumn();

    if (lastColumn < 1) {
      warnings.push(
        sheetName +
        ' không có column để validate header.'
      );

      continue;
    }

    var labels =
      sheet
        .getRange(1, 1, 1, lastColumn)
        .getDisplayValues()[0];

    var keys =
      sheet
        .getRange(2, 1, 1, lastColumn)
        .getDisplayValues()[0];

    var labelCount = 0;
    var keyCount = 0;
    var blankKeyCount = 0;

    for (var c = 0; c < lastColumn; c++) {
      if (String(labels[c] || '').trim()) {
        labelCount++;
      }

      if (String(keys[c] || '').trim()) {
        keyCount++;
      } else {
        blankKeyCount++;
      }
    }

    items.push({
      sheetName: sheetName,
      lastColumn: lastColumn,
      labelCount: labelCount,
      keyCount: keyCount,
      blankKeyCount: blankKeyCount
    });

    if (labelCount < 1) {
      errors.push(
        sheetName +
        ' thiếu row 1 labels.'
      );
    }

    if (keyCount < 1) {
      errors.push(
        sheetName +
        ' thiếu row 2 keys.'
      );
    }

    if (keyCount < lastColumn) {
      warnings.push(
        sheetName +
        ' có ' +
        blankKeyCount +
        ' cột thiếu key ở row 2.'
      );
    }
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    items: items,
    summary: {
      checkedSheetCount: items.length,
      sheetsWithNoLabels:
        items.filter(function(item) {
          return item.labelCount < 1;
        }).length,
      sheetsWithNoKeys:
        items.filter(function(item) {
          return item.keyCount < 1;
        }).length
    }
  };
}


/**
 * Sample read validation.
 */
function kidlearnV3_3ngRunSampleReadValidation_(spreadsheet) {
  var errors = [];
  var warnings = [];
  var items = [];

  var sampleSheets = [
    'SYS_Config',
    'SYS_SchemaVersion',
    'MST_Subjects',
    'DATA_Users',
    'DATA_Children',
    'DATA_UserChildAccess'
  ];

  for (var i = 0; i < sampleSheets.length; i++) {
    var sheetName =
      sampleSheets[i];

    var sheet =
      kidlearnV3_3ngGetSheet_(
        spreadsheet,
        sheetName
      );

    if (!sheet) {
      errors.push(
        'Sample read thiếu sheet: ' +
        sheetName
      );

      items.push({
        sheetName: sheetName,
        success: false,
        message: 'Missing sheet'
      });

      continue;
    }

    var lastRow =
      sheet.getLastRow();

    var lastColumn =
      sheet.getLastColumn();

    var sampleRowCount =
      Math.min(
        Math.max(lastRow, 1),
        KIDLEARN_V3_PROD_VALIDATE_3NG_CONFIG.MAX_SAMPLE_ROWS
      );

    var values =
      sheet
        .getRange(
          1,
          1,
          sampleRowCount,
          Math.max(lastColumn, 1)
        )
        .getDisplayValues();

    items.push({
      sheetName: sheetName,
      success: true,
      lastRow: lastRow,
      lastColumn: lastColumn,
      sampledRows: values.length
    });
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    items: items,
    summary: {
      sampleSheetCount: sampleSheets.length,
      passedCount:
        items.filter(function(item) {
          return item.success;
        }).length,
      failedCount:
        items.filter(function(item) {
          return !item.success;
        }).length
    }
  };
}


/**
 * Check legacy sheets.
 */
function kidlearnV3_3ngCheckLegacySheets_(spreadsheet) {
  var warnings = [];

  var activeLegacy = {
    Data_Tasks: true,
    Data_Users: true,
    Data_Scores: true,
    Thiet_Lap: true,
    Danh_Muc: true,
    Log_HeThong: true
  };

  var activeFound = [];
  var preservedFound = [];

  var sheets =
    spreadsheet.getSheets();

  for (var i = 0; i < sheets.length; i++) {
    var name =
      sheets[i].getName();

    if (activeLegacy[name]) {
      activeFound.push(name);
    }

    if (name.indexOf('LEGACY_V2_') === 0) {
      preservedFound.push(name);
    }
  }

  if (activeFound.length > 0) {
    warnings.push(
      'PROD file còn active legacy sheets: ' +
      activeFound.join(', ')
    );
  }

  if (preservedFound.length > 0) {
    warnings.push(
      'PROD file có preserved legacy sheets: ' +
      preservedFound.join(', ') +
      '. Đây là warning, không fail.'
    );
  }

  return {
    success: true,
    warningCount: warnings.length,
    warnings: warnings,
    summary: {
      activeLegacySheetCount: activeFound.length,
      activeLegacySheets: activeFound,
      preservedLegacySheetCount: preservedFound.length,
      preservedLegacySheets: preservedFound
    }
  };
}


/**
 * Build no side effect statement.
 */
function kidlearnV3_3ngBuildNoSideEffectStatement_() {
  return {
    prodFileModifiedBy3NG: false,
    prodSheetCreatedBy3NG: false,
    prodSheetDeletedBy3NG: false,
    prodDataWrittenBy3NG: false,
    validationMode: 'READ_ONLY'
  };
}


/**
 * Check safe modes in DEV script.
 */
function kidlearnV3_3ngCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3ngSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Safe Write trong DEV script phải DRY_RUN/enabled=false khi validate PROD. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var controlledWrite =
    kidlearnV3_3ngControlledWriteStatus_();

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    errors.push(
      'Controlled Write đang ENABLED.'
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
 * Get expected sheets.
 */
function kidlearnV3_3ngGetExpectedSheets_() {
  try {
    if (
      typeof KIDLEARN_V3_SHEET_ORDER !== 'undefined' &&
      KIDLEARN_V3_SHEET_ORDER &&
      KIDLEARN_V3_SHEET_ORDER.length
    ) {
      return KIDLEARN_V3_SHEET_ORDER.slice();
    }
  } catch (error) {}

  if (
    typeof kidlearnV3_3nfGetExpectedSheets_ === 'function'
  ) {
    return kidlearnV3_3nfGetExpectedSheets_();
  }

  throw new Error(
    'Không tìm thấy KIDLEARN_V3_SHEET_ORDER hoặc helper expected sheets.'
  );
}


/**
 * DEV database spreadsheet.
 */
function kidlearnV3_3ngGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3ngResolveSpreadsheet_(
      database
    );

  if (!spreadsheet) {
    throw new Error(
      'Không resolve được DEV Spreadsheet object từ Database V3.'
    );
  }

  return spreadsheet;
}


/**
 * Resolve Spreadsheet.
 */
function kidlearnV3_3ngResolveSpreadsheet_(value) {
  if (!value) return null;

  if (
    typeof value.getSheets === 'function' &&
    typeof value.getId === 'function'
  ) {
    return value;
  }

  if (
    value.spreadsheet &&
    typeof value.spreadsheet.getSheets === 'function'
  ) {
    return value.spreadsheet;
  }

  if (
    value.database &&
    typeof value.database.getSheets === 'function'
  ) {
    return value.database;
  }

  if (
    value.db &&
    typeof value.db.getSheets === 'function'
  ) {
    return value.db;
  }

  if (
    value.spreadsheetObject &&
    typeof value.spreadsheetObject.getSheets === 'function'
  ) {
    return value.spreadsheetObject;
  }

  if (
    value.activeSpreadsheet &&
    typeof value.activeSpreadsheet.getSheets === 'function'
  ) {
    return value.activeSpreadsheet;
  }

  if (value.spreadsheetId) {
    return SpreadsheetApp.openById(value.spreadsheetId);
  }

  if (value.databaseSpreadsheetId) {
    return SpreadsheetApp.openById(value.databaseSpreadsheetId);
  }

  if (
    value.id &&
    typeof value.id === 'string'
  ) {
    return SpreadsheetApp.openById(value.id);
  }

  return null;
}


/**
 * Get exact sheet.
 */
function kidlearnV3_3ngGetSheet_(spreadsheet, sheetName) {
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
function kidlearnV3_3ngSafeAssert_(functionName, label) {
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
 * Safe Write status.
 */
function kidlearnV3_3ngSafeWriteStatus_() {
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
function kidlearnV3_3ngControlledWriteStatus_() {
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
function kidlearnV3_3ngCheckFunctions_(names) {
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
 * Save validation.
 */
function kidlearnV3_3ngSaveValidation_(validation) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PROD_VALIDATE_3NG_KEYS.LAST_VALIDATION_JSON,
      JSON.stringify(validation)
    );
}


/**
 * Save result.
 */
function kidlearnV3_3ngSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_VALIDATE_3NG_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_VALIDATE_3NG_STATUS.READY_FOR_3N_H &&
    (
      status === KIDLEARN_V3_PROD_VALIDATE_3NG_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_VALIDATE_3NG_STATUS.VALIDATION_PASSED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_VALIDATE_3NG_STATUS.READY_FOR_3N_H;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_VALIDATE_3NG_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_VALIDATE_3NG_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      prodDeployNow: false,
      prodWriteAllowed: false,
      realWriteAllowed: false,
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
function kidlearnV3_3ngReadJsonProperty_(key) {
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