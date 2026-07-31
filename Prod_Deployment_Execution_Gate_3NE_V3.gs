/**
 * ================================================================
 * KIDLEARN V3 - PROD DEPLOYMENT EXECUTION GATE
 * Bundle: 3N-E
 * Version: 3.1.0
 * ================================================================
 *
 * 3N-E:
 * - Execution gate only.
 * - Không deploy PROD.
 * - Không tạo PROD file.
 * - Không copy DEV sang PROD.
 * - Không real write.
 * - Không migration.
 * - Không rollback.
 * - Chỉ ghi ScriptProperties để lưu execution gate/status.
 */


var KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3NE_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3NE_LAST_PREVIEW_AT',
  LAST_PACKAGE_AT: 'KIDLEARN_V3_PHASE_3NE_LAST_PACKAGE_AT',
  LAST_ARMED_AT: 'KIDLEARN_V3_PHASE_3NE_LAST_ARMED_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3NE_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3NE_LAST_RESULT_JSON',
  LAST_PACKAGE_JSON: 'KIDLEARN_V3_PHASE_3NE_LAST_PACKAGE_JSON',
  LAST_ARMED_JSON: 'KIDLEARN_V3_PHASE_3NE_LAST_ARMED_JSON',
  EXECUTION_GATE_ID: 'KIDLEARN_V3_PHASE_3NE_EXECUTION_GATE_ID'
};


var KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  PACKAGE_GENERATED: 'PACKAGE_GENERATED',
  EXECUTION_GATE_ARMED: 'EXECUTION_GATE_ARMED',
  READY_FOR_3N_F: 'READY_FOR_3N_F',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG = {
  VERSION: '3N-E',
  PHASE: '3N-E',
  NEXT_BUNDLE: '3N-F',
  NEXT_STAGE: 'CONTROLLED_PROD_DEPLOYMENT',
  EXPECTED_SHEET_COUNT: 44,
  WRITE_MODE: 'EXECUTION_GATE_ONLY',
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  CONFIRM_TEXT: 'ARM_PROD_DEPLOYMENT_EXECUTION_3N_E'
};


/**
 * Preview 3N-E.
 */
function kidlearnV3_previewProdDeploymentExecutionGate3NEV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3neCheckFunctions_([
      'kidlearnV3_assertProdDeploymentApprovalGate3NDReadyV3',
      'kidlearnV3_getProdDeploymentApprovalGate3NDStatusV3',
      'kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_appGetActiveDatabaseV3_',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3ND =
    kidlearnV3_3neSafeAssert_(
      'kidlearnV3_assertProdDeploymentApprovalGate3NDReadyV3',
      '3N-D'
    );

  if (!phase3ND.success) {
    errors.push(
      '3N-D chưa READY_FOR_3N_E: ' +
      phase3ND.message
    );
  }

  var safeModes =
    kidlearnV3_3neCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var backupCheck =
    kidlearnV3_3neCheckBackupFile_();

  if (!backupCheck.success) {
    errors.push(
      'Backup file chưa hợp lệ: ' +
      backupCheck.message
    );
  }

  var sourceSummary = null;

  try {
    sourceSummary =
      kidlearnV3_3neBuildSourceDatabaseSummary_();

    if (sourceSummary.missingSheetCount > 0) {
      errors.push(
        'Source DEV candidate thiếu sheet. Missing=' +
        sourceSummary.missingSheetCount
      );
    }

  } catch (error) {
    errors.push(
      'Không build được source database summary 3N-E: ' +
      String(error.message || error)
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_DEPLOYMENT_EXECUTION_GATE_3NE_V3',
    bundle: '3N-E',
    phase: KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.WRITE_MODE,
    prodDeployNow: false,
    prodFileCreated: false,
    realWriteAllowed: false,
    confirmText:
      KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.CONFIRM_TEXT,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3ND: phase3ND,
    safeModes: safeModes,
    backupCheck: backupCheck,
    sourceSummary: sourceSummary,
    requiredFunctions: requiredFunctions.items,
    note:
      '3N-E chỉ arm execution gate. Không deploy PROD trong bước này.'
  };

  kidlearnV3_3neSaveResult_(
    result,
    KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Generate execution package.
 */
function kidlearnV3_generateProdDeploymentExecutionPackage3NEV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdDeploymentExecutionGate3NEV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate execution package 3N-E vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var approvalStatus =
    kidlearnV3_getProdDeploymentApprovalGate3NDStatusV3();

  var backupStatus =
    kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3();

  var backupCheck =
    kidlearnV3_3neCheckBackupFile_();

  var sourceSummary =
    kidlearnV3_3neBuildSourceDatabaseSummary_();

  var safeModes =
    kidlearnV3_3neCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var finishedAt = new Date();

  var executionPackage = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_DEPLOYMENT_EXECUTION_PACKAGE_3NE_V3',
    bundle: '3N-E',
    phase: KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.PACKAGE_GENERATED
        : KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.FAILED,
    nextBundle:
      KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.NEXT_STAGE,
    confirmText:
      KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.CONFIRM_TEXT,
    prodDeployNow: false,
    prodFileCreated: false,
    realWriteAllowed: false,
    sourceCandidate: {
      spreadsheetId: sourceSummary.spreadsheetId,
      spreadsheetName: sourceSummary.spreadsheetName,
      spreadsheetUrl: sourceSummary.spreadsheetUrl,
      expectedSheetCount: sourceSummary.expectedSheetCount,
      foundSheetCount: sourceSummary.foundSheetCount,
      missingSheetCount: sourceSummary.missingSheetCount
    },
    backup: {
      backupFileId: backupStatus.backupFileId || '',
      backupFileUrl: backupStatus.backupFileUrl || '',
      backupFileAccessible: backupCheck.success,
      backupFileName: backupCheck.backupFileName || ''
    },
    approval: {
      status: approvalStatus.status || '',
      approvalId: approvalStatus.approvalId || '',
      lastApprovalAt: approvalStatus.lastApprovalAt || ''
    },
    safeModes: safeModes.summary,
    executionChecklist: [
      {
        item: '3N-D approval gate ready',
        passed: approvalStatus.status === 'READY_FOR_3N_E'
      },
      {
        item: 'Approval ID exists',
        passed: approvalStatus.approvalId ? true : false
      },
      {
        item: 'Backup file accessible',
        passed: backupCheck.success
      },
      {
        item: 'Source DEV candidate has 44 V3 sheets',
        passed: sourceSummary.missingSheetCount === 0
      },
      {
        item: 'Safe Write remains DRY_RUN/enabled=false',
        passed:
          safeModes.summary.safeWriteMode === 'DRY_RUN' &&
          safeModes.summary.safeWriteEnabled === false
      },
      {
        item: 'No PROD deployment in 3N-E',
        passed: true
      }
    ],
    blockedActionsConfirmed: [
      'No PROD file created',
      'No PROD copy executed',
      'No real write executed',
      'No migration executed',
      'No rollback executed',
      'No sheet create/delete executed'
    ],
    nextInstruction:
      'Sau khi review package này, chạy kidlearnV3_armProdDeploymentExecutionGate3NEManualConfirmV3 để arm execution gate. Việc này vẫn chưa deploy PROD.',
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() - startedAt.getTime(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_3neSavePackage_(executionPackage);

  kidlearnV3_3neSaveResult_(
    executionPackage,
    executionPackage.success
      ? KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.PACKAGE_GENERATED
      : KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.FAILED,
    KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS.LAST_PACKAGE_AT
  );

  console.log(JSON.stringify(executionPackage, null, 2));

  if (!executionPackage.success) {
    throw new Error(
      'Generate execution package 3N-E failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return executionPackage;
}


/**
 * Manual confirm wrapper.
 *
 * Không dùng Session.getActiveUser để tránh thêm OAuth scope.
 * Hàm này KHÔNG deploy PROD.
 */
function kidlearnV3_armProdDeploymentExecutionGate3NEManualConfirmV3() {
  return kidlearnV3_armProdDeploymentExecutionGate3NEV3({
    confirmText:
      KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.CONFIRM_TEXT,
    armedBy: 'DEV_EXECUTOR_MANUAL_3NE',
    armNote:
      'Execution gate armed in 3N-E. No PROD deployment executed.'
  });
}


/**
 * Arm execution gate.
 *
 * options:
 * {
 *   confirmText: 'ARM_PROD_DEPLOYMENT_EXECUTION_3N_E',
 *   armedBy: '...',
 *   armNote: '...'
 * }
 */
function kidlearnV3_armProdDeploymentExecutionGate3NEV3(options) {
  var req =
    kidlearnV3_3neNormalizeOptions_(options);

  var errors = [];
  var warnings = [];

  if (
    String(req.confirmText || '') !==
    KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.CONFIRM_TEXT
  ) {
    errors.push(
      'Confirm text không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.CONFIRM_TEXT
    );
  }

  var status =
    kidlearnV3_getProdDeploymentExecutionGate3NEStatusV3();

  if (
    status.status !==
      KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.PACKAGE_GENERATED &&
    status.status !==
      KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.EXECUTION_GATE_ARMED &&
    status.status !==
      KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.READY_FOR_3N_F
  ) {
    errors.push(
      '3N-E chưa có execution package. Status=' +
      status.status
    );
  }

  if (
    !status.lastPackage ||
    status.lastPackage.success !== true
  ) {
    errors.push(
      'Last execution package chưa success=true.'
    );
  }

  var safeModes =
    kidlearnV3_3neCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var backupCheck =
    kidlearnV3_3neCheckBackupFile_();

  if (!backupCheck.success) {
    errors.push(
      'Backup file không còn accessible: ' +
      backupCheck.message
    );
  }

  if (errors.length > 0) {
    var failed = {
      success: false,
      action: 'ARM_PROD_DEPLOYMENT_EXECUTION_GATE_3NE_V3',
      bundle: '3N-E',
      status: status.status,
      prodDeployNow: false,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors: errors,
      warnings: warnings
    };

    console.log(JSON.stringify(failed, null, 2));

    throw new Error(
      'Không thể arm execution gate 3N-E. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var gateId =
    kidlearnV3_3neMakeExecutionGateId_();

  var armed = {
    success: true,
    action: 'ARM_PROD_DEPLOYMENT_EXECUTION_GATE_3NE_V3',
    bundle: '3N-E',
    phase: KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.EXECUTION_GATE_ARMED,
    executionGateId: gateId,
    armedBy:
      req.armedBy || 'DEV_EXECUTOR_MANUAL_3NE',
    armNote:
      req.armNote || '',
    armMeaning:
      'Approve to proceed to next controlled PROD deployment phase. This does not deploy PROD.',
    nextBundle:
      KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.NEXT_STAGE,
    prodDeployNow: false,
    prodFileCreated: false,
    realWriteAllowed: false,
    safeModes: safeModes.summary,
    backupCheck: backupCheck,
    recordedAt:
      new Date().toISOString(),
    warningCount: warnings.length,
    warnings: warnings
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS.EXECUTION_GATE_ID,
    gateId
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS.LAST_ARMED_JSON,
    JSON.stringify(armed)
  );

  kidlearnV3_3neSaveResult_(
    armed,
    KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.EXECUTION_GATE_ARMED,
    KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS.LAST_ARMED_AT
  );

  console.log(JSON.stringify(armed, null, 2));

  return armed;
}


/**
 * Mark 3N-E ready.
 */
function kidlearnV3_markProdDeploymentExecutionGate3NEReadyV3() {
  var status =
    kidlearnV3_getProdDeploymentExecutionGate3NEStatusV3();

  var errors = [];

  if (
    status.status !==
      KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.EXECUTION_GATE_ARMED &&
    status.status !==
      KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.READY_FOR_3N_F
  ) {
    errors.push(
      '3N-E chưa EXECUTION_GATE_ARMED. Status=' +
      status.status
    );
  }

  if (
    !status.lastArmed ||
    status.lastArmed.success !== true
  ) {
    errors.push(
      'Last armed gate chưa success=true.'
    );
  }

  var safeModes =
    kidlearnV3_3neCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3N-E ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_DEPLOYMENT_EXECUTION_GATE_3NE_READY_V3',
    bundle: '3N-E',
    phase: KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.READY_FOR_3N_F,
    executionGateId: status.executionGateId || '',
    nextBundle:
      KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.NEXT_STAGE,
    prodDeployNow: false,
    message:
      '3N-E ready. Execution gate đã được arm. Bước tiếp theo là 3N-F controlled PROD deployment.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3neSaveResult_(
    result,
    KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.READY_FOR_3N_F,
    KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3N-E status.
 */
function kidlearnV3_getProdDeploymentExecutionGate3NEStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_DEPLOYMENT_EXECUTION_GATE_3NE_STATUS_V3',
    bundle: '3N-E',
    phase: KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.NOT_RUN,
    executionGateId:
      properties.getProperty(
        KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS.EXECUTION_GATE_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastPackageAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS.LAST_PACKAGE_AT
      ) ||
      '',
    lastArmedAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS.LAST_ARMED_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3neReadJsonProperty_(
        KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS.LAST_RESULT_JSON
      ),
    lastPackage:
      kidlearnV3_3neReadJsonProperty_(
        KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS.LAST_PACKAGE_JSON
      ),
    lastArmed:
      kidlearnV3_3neReadJsonProperty_(
        KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS.LAST_ARMED_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3N-E ready.
 */
function kidlearnV3_assertProdDeploymentExecutionGate3NEReadyV3() {
  var status =
    kidlearnV3_getProdDeploymentExecutionGate3NEStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.READY_FOR_3N_F
  ) {
    errors.push(
      '3N-E chưa READY_FOR_3N_F. Status=' +
      status.status
    );
  }

  if (!status.executionGateId) {
    errors.push(
      'Thiếu executionGateId.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_DEPLOYMENT_EXECUTION_GATE_3NE_READY_V3',
    bundle: '3N-E',
    phase: KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.PHASE,
    status: status.status,
    executionGateId: status.executionGateId || '',
    nextBundle:
      KIDLEARN_V3_PROD_EXECUTION_3NE_CONFIG.NEXT_BUNDLE,
    prodDeployNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3N-E chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA batch 3N-E package-only.
 *
 * Không arm execution gate trong QA batch.
 */
function kidlearnV3_getQaBatchSteps3NEV3() {
  return [
    {
      label: 'Assert 3N-D ready',
      functionName: 'kidlearnV3_assertProdDeploymentApprovalGate3NDReadyV3'
    },
    {
      label: 'Preview PROD Execution Gate 3N-E',
      functionName: 'kidlearnV3_previewProdDeploymentExecutionGate3NEV3'
    },
    {
      label: 'Generate PROD Execution Package 3N-E',
      functionName: 'kidlearnV3_generateProdDeploymentExecutionPackage3NEV3'
    }
  ];
}


/**
 * QA batch 3N-E package-only.
 */
function kidlearnV3_runQaBatch3NEV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3N_E_PROD_EXECUTION_GATE_PACKAGE_ONLY',
    kidlearnV3_getQaBatchSteps3NEV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Check backup file.
 */
function kidlearnV3_3neCheckBackupFile_() {
  try {
    var backupStatus =
      kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3();

    var backupFileId =
      backupStatus.backupFileId || '';

    if (!backupFileId) {
      return {
        success: false,
        backupFileId: '',
        message:
          'Thiếu backupFileId từ 3N-B.'
      };
    }

    var file =
      DriveApp.getFileById(backupFileId);

    return {
      success: true,
      backupFileId: backupFileId,
      backupFileName: file.getName(),
      backupFileUrl: file.getUrl(),
      message:
        'Backup file accessible.'
    };

  } catch (error) {
    return {
      success: false,
      backupFileId: '',
      message:
        String(error.message || error)
    };
  }
}


/**
 * Build source DB summary.
 */
function kidlearnV3_3neBuildSourceDatabaseSummary_() {
  var spreadsheet =
    kidlearnV3_3neGetDatabaseSpreadsheet_();

  var expectedSheets =
    kidlearnV3_3neGetExpectedSheets_();

  var items = [];
  var missing = [];

  for (var i = 0; i < expectedSheets.length; i++) {
    var sheetName =
      expectedSheets[i];

    var sheet =
      kidlearnV3_3neGetSheet_(
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

    items.push({
      sheetName: sheetName,
      exists: true,
      lastRow: sheet.getLastRow(),
      lastColumn: sheet.getLastColumn()
    });
  }

  return {
    spreadsheetId: spreadsheet.getId(),
    spreadsheetName: spreadsheet.getName(),
    spreadsheetUrl: spreadsheet.getUrl(),
    expectedSheetCount: expectedSheets.length,
    foundSheetCount:
      items.filter(function(item) {
        return item.exists;
      }).length,
    missingSheetCount: missing.length,
    missingSheets: missing,
    items: items
  };
}


/**
 * Check safe modes.
 */
function kidlearnV3_3neCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3neSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Safe Write phải DRY_RUN/enabled=false. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var controlledWrite =
    kidlearnV3_3neControlledWriteStatus_();

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
function kidlearnV3_3neGetExpectedSheets_() {
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
    typeof kidlearnV3_3ndGetExpectedSheets_ === 'function'
  ) {
    return kidlearnV3_3ndGetExpectedSheets_();
  }

  throw new Error(
    'Không tìm thấy KIDLEARN_V3_SHEET_ORDER hoặc helper expected sheets.'
  );
}


/**
 * Database spreadsheet.
 */
function kidlearnV3_3neGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3neResolveSpreadsheet_(
      database
    );

  if (!spreadsheet) {
    throw new Error(
      'Không resolve được Spreadsheet object từ Database V3.'
    );
  }

  return spreadsheet;
}


/**
 * Resolve Spreadsheet.
 */
function kidlearnV3_3neResolveSpreadsheet_(value) {
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
function kidlearnV3_3neGetSheet_(spreadsheet, sheetName) {
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
function kidlearnV3_3neSafeAssert_(functionName, label) {
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
          'Thiếu function ' + functionName
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
function kidlearnV3_3neSafeWriteStatus_() {
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
function kidlearnV3_3neControlledWriteStatus_() {
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
function kidlearnV3_3neCheckFunctions_(names) {
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
 * Make execution gate ID.
 */
function kidlearnV3_3neMakeExecutionGateId_() {
  return (
    'PROD_EXECUTION_GATE_3NE_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


/**
 * Save package.
 */
function kidlearnV3_3neSavePackage_(executionPackage) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS.LAST_PACKAGE_JSON,
      JSON.stringify(executionPackage)
    );
}


/**
 * Save result.
 */
function kidlearnV3_3neSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.READY_FOR_3N_F &&
    (
      status === KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.PACKAGE_GENERATED ||
      status === KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.EXECUTION_GATE_ARMED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_EXECUTION_3NE_STATUS.READY_FOR_3N_F;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_EXECUTION_3NE_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      executionGateId: result.executionGateId || '',
      prodDeployNow: false,
      prodFileCreated: false,
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
function kidlearnV3_3neReadJsonProperty_(key) {
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
function kidlearnV3_3neNormalizeOptions_(options) {
  if (!options) return {};

  if (typeof options !== 'object') {
    return {
      value: options
    };
  }

  return options;
}