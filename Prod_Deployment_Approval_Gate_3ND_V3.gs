/**
 * ================================================================
 * KIDLEARN V3 - PROD DEPLOYMENT APPROVAL GATE
 * Bundle: 3N-D
 * Version: 3.1.0
 * ================================================================
 *
 * 3N-D:
 * - Approval gate only.
 * - Không deploy PROD.
 * - Không tạo PROD file.
 * - Không copy DEV sang PROD.
 * - Không real write.
 * - Không migration.
 * - Không rollback.
 * - Chỉ ghi ScriptProperties để lưu approval/status.
 */


var KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3ND_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3ND_LAST_PREVIEW_AT',
  LAST_PACKAGE_AT: 'KIDLEARN_V3_PHASE_3ND_LAST_PACKAGE_AT',
  LAST_APPROVAL_AT: 'KIDLEARN_V3_PHASE_3ND_LAST_APPROVAL_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3ND_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3ND_LAST_RESULT_JSON',
  LAST_PACKAGE_JSON: 'KIDLEARN_V3_PHASE_3ND_LAST_PACKAGE_JSON',
  LAST_APPROVAL_JSON: 'KIDLEARN_V3_PHASE_3ND_LAST_APPROVAL_JSON',
  APPROVAL_ID: 'KIDLEARN_V3_PHASE_3ND_APPROVAL_ID'
};


var KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  PACKAGE_GENERATED: 'PACKAGE_GENERATED',
  APPROVAL_RECORDED: 'APPROVAL_RECORDED',
  READY_FOR_3N_E: 'READY_FOR_3N_E',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG = {
  VERSION: '3N-D',
  PHASE: '3N-D',
  NEXT_BUNDLE: '3N-E',
  NEXT_STAGE: 'PROD_DEPLOYMENT_EXECUTION_GATE',
  EXPECTED_SHEET_COUNT: 44,
  WRITE_MODE: 'APPROVAL_GATE_ONLY',
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  CONFIRM_TEXT: 'APPROVE_PROD_DEPLOYMENT_GATE_3N_D'
};


/**
 * Preview 3N-D.
 */
function kidlearnV3_previewProdDeploymentApprovalGate3NDV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3ndCheckFunctions_([
      'kidlearnV3_assertProdDryRunRehearsal3NCReadyV3',
      'kidlearnV3_getProdDryRunRehearsal3NCStatusV3',
      'kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_appGetActiveDatabaseV3_',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3NC =
    kidlearnV3_3ndSafeAssert_(
      'kidlearnV3_assertProdDryRunRehearsal3NCReadyV3',
      '3N-C'
    );

  if (!phase3NC.success) {
    errors.push(
      '3N-C chưa READY_FOR_3N_D: ' +
      phase3NC.message
    );
  }

  var safeModes =
    kidlearnV3_3ndCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var backupCheck =
    kidlearnV3_3ndCheckBackupFile_();

  if (!backupCheck.success) {
    errors.push(
      'Backup file chưa hợp lệ: ' +
      backupCheck.message
    );
  }

  var sourceSummary = null;

  try {
    sourceSummary =
      kidlearnV3_3ndBuildSourceDatabaseSummary_();

    if (sourceSummary.missingSheetCount > 0) {
      errors.push(
        'Source DEV candidate thiếu sheet. Missing=' +
        sourceSummary.missingSheetCount
      );
    }

  } catch (error) {
    errors.push(
      'Không build được source database summary 3N-D: ' +
      String(error.message || error)
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_DEPLOYMENT_APPROVAL_GATE_3ND_V3',
    bundle: '3N-D',
    phase: KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.WRITE_MODE,
    prodDeployNow: false,
    prodFileCreated: false,
    realWriteAllowed: false,
    approvalRequired: true,
    confirmText:
      KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.CONFIRM_TEXT,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3NC: phase3NC,
    safeModes: safeModes,
    backupCheck: backupCheck,
    sourceSummary: sourceSummary,
    requiredFunctions: requiredFunctions.items,
    note:
      '3N-D chỉ là approval gate. Không deploy PROD trong bước này.'
  };

  kidlearnV3_3ndSaveResult_(
    result,
    KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Generate approval package.
 */
function kidlearnV3_generateProdDeploymentApprovalPackage3NDV3() {
  var startedAt =
    new Date();

  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdDeploymentApprovalGate3NDV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate approval package 3N-D vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var rehearsalStatus =
    kidlearnV3_getProdDryRunRehearsal3NCStatusV3();

  var backupStatus =
    kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3();

  var backupCheck =
    kidlearnV3_3ndCheckBackupFile_();

  var sourceSummary =
    kidlearnV3_3ndBuildSourceDatabaseSummary_();

  var safeModes =
    kidlearnV3_3ndCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var finishedAt =
    new Date();

  var approvalPackage = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_DEPLOYMENT_APPROVAL_PACKAGE_3ND_V3',
    bundle: '3N-D',
    phase: KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.PACKAGE_GENERATED
        : KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.FAILED,
    nextBundle: KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.NEXT_STAGE,
    prodDeployNow: false,
    prodFileCreated: false,
    realWriteAllowed: false,
    approvalRequired: true,
    confirmText:
      KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.CONFIRM_TEXT,
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
    rehearsal: {
      status: rehearsalStatus.status || '',
      lastRehearsalAt: rehearsalStatus.lastRehearsalAt || '',
      rehearsalPassed:
        rehearsalStatus.status === 'READY_FOR_3N_D'
    },
    safeModes: safeModes.summary,
    approvalChecklist: [
      {
        item: '3N-C PROD dry-run rehearsal passed',
        passed: rehearsalStatus.status === 'READY_FOR_3N_D'
      },
      {
        item: 'DEV candidate backup exists and accessible',
        passed: backupCheck.success
      },
      {
        item: 'Source DEV candidate has expected V3 sheets',
        passed: sourceSummary.missingSheetCount === 0
      },
      {
        item: 'Safe Write remains DRY_RUN/enabled=false',
        passed:
          safeModes.summary.safeWriteMode === 'DRY_RUN' &&
          safeModes.summary.safeWriteEnabled === false
      },
      {
        item: 'No PROD deployment in 3N-D',
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
    approvalInstruction:
      'Sau khi review package này, chạy kidlearnV3_recordProdDeploymentApprovalGate3NDManualConfirmV3 để ghi nhận approval gate.',
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

  kidlearnV3_3ndSavePackage_(approvalPackage);

  kidlearnV3_3ndSaveResult_(
    approvalPackage,
    approvalPackage.success
      ? KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.PACKAGE_GENERATED
      : KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.FAILED,
    KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS.LAST_PACKAGE_AT
  );

  console.log(JSON.stringify(approvalPackage, null, 2));

  if (!approvalPackage.success) {
    throw new Error(
      'Generate approval package 3N-D failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return approvalPackage;
}


/**
 * Manual confirm wrapper.
 *
 * Patch 3N-D:
 * - Không dùng Session.getActiveUser().getEmail()
 * - Tránh yêu cầu thêm scope userinfo.email
 * - Không deploy PROD
 */
function kidlearnV3_recordProdDeploymentApprovalGate3NDManualConfirmV3() {
  return kidlearnV3_recordProdDeploymentApprovalGate3NDV3({
    confirmText:
      KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.CONFIRM_TEXT,
    approvedBy: 'DEV_APPROVER_MANUAL_3ND',
    approvalNote:
      'Manual approval gate recorded in 3N-D. No PROD deployment executed. Active user email was not requested to avoid additional OAuth scope.'
  });
}


/**
 * Record approval gate.
 *
 * options:
 * {
 *   confirmText: 'APPROVE_PROD_DEPLOYMENT_GATE_3N_D',
 *   approvedBy: '...',
 *   approvalNote: '...'
 * }
 */
function kidlearnV3_recordProdDeploymentApprovalGate3NDV3(options) {
  var req =
    kidlearnV3_3ndNormalizeOptions_(options);

  var errors = [];
  var warnings = [];

  if (
    String(req.confirmText || '') !==
    KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.CONFIRM_TEXT
  ) {
    errors.push(
      'Confirm text không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.CONFIRM_TEXT
    );
  }

  var status =
    kidlearnV3_getProdDeploymentApprovalGate3NDStatusV3();

  if (
    status.status !==
      KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.PACKAGE_GENERATED &&
    status.status !==
      KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.APPROVAL_RECORDED &&
    status.status !==
      KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.READY_FOR_3N_E
  ) {
    errors.push(
      '3N-D chưa có approval package. Status=' +
      status.status
    );
  }

  if (
    !status.lastPackage ||
    status.lastPackage.success !== true
  ) {
    errors.push(
      'Last approval package chưa success=true.'
    );
  }

  var safeModes =
    kidlearnV3_3ndCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var backupCheck =
    kidlearnV3_3ndCheckBackupFile_();

  if (!backupCheck.success) {
    errors.push(
      'Backup file không còn accessible: ' +
      backupCheck.message
    );
  }

  if (errors.length > 0) {
    var failed = {
      success: false,
      action: 'RECORD_PROD_DEPLOYMENT_APPROVAL_GATE_3ND_V3',
      bundle: '3N-D',
      status: status.status,
      prodDeployNow: false,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors: errors,
      warnings: warnings
    };

    console.log(JSON.stringify(failed, null, 2));

    throw new Error(
      'Không thể record approval gate 3N-D. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var approvalId =
    kidlearnV3_3ndMakeApprovalId_();

  var approval = {
    success: true,
    action: 'RECORD_PROD_DEPLOYMENT_APPROVAL_GATE_3ND_V3',
    bundle: '3N-D',
    phase: KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.APPROVAL_RECORDED,
    approvalId: approvalId,
    approvedBy:
      req.approvedBy || 'DEV_APPROVER',
    approvalNote:
      req.approvalNote || '',
    approvalMeaning:
      'Approve to proceed to next gated PROD deployment phase. This does not deploy PROD.',
    nextBundle:
      KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.NEXT_STAGE,
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
    KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS.APPROVAL_ID,
    approvalId
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS.LAST_APPROVAL_JSON,
    JSON.stringify(approval)
  );

  kidlearnV3_3ndSaveResult_(
    approval,
    KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.APPROVAL_RECORDED,
    KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS.LAST_APPROVAL_AT
  );

  console.log(JSON.stringify(approval, null, 2));

  return approval;
}


/**
 * Mark 3N-D ready.
 */
function kidlearnV3_markProdDeploymentApprovalGate3NDReadyV3() {
  var status =
    kidlearnV3_getProdDeploymentApprovalGate3NDStatusV3();

  var errors = [];

  if (
    status.status !==
      KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.APPROVAL_RECORDED &&
    status.status !==
      KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.READY_FOR_3N_E
  ) {
    errors.push(
      '3N-D chưa APPROVAL_RECORDED. Status=' +
      status.status
    );
  }

  if (
    !status.lastApproval ||
    status.lastApproval.success !== true
  ) {
    errors.push(
      'Last approval chưa success=true.'
    );
  }

  var safeModes =
    kidlearnV3_3ndCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3N-D ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_DEPLOYMENT_APPROVAL_GATE_3ND_READY_V3',
    bundle: '3N-D',
    phase: KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.READY_FOR_3N_E,
    approvalId: status.approvalId || '',
    nextBundle:
      KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.NEXT_STAGE,
    prodDeployNow: false,
    message:
      '3N-D ready. Approval gate đã được ghi nhận. Bước tiếp theo là 3N-E.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3ndSaveResult_(
    result,
    KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.READY_FOR_3N_E,
    KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3N-D status.
 */
function kidlearnV3_getProdDeploymentApprovalGate3NDStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_DEPLOYMENT_APPROVAL_GATE_3ND_STATUS_V3',
    bundle: '3N-D',
    phase: KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.NOT_RUN,
    approvalId:
      properties.getProperty(
        KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS.APPROVAL_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastPackageAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS.LAST_PACKAGE_AT
      ) ||
      '',
    lastApprovalAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS.LAST_APPROVAL_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3ndReadJsonProperty_(
        KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS.LAST_RESULT_JSON
      ),
    lastPackage:
      kidlearnV3_3ndReadJsonProperty_(
        KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS.LAST_PACKAGE_JSON
      ),
    lastApproval:
      kidlearnV3_3ndReadJsonProperty_(
        KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS.LAST_APPROVAL_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3N-D ready.
 */
function kidlearnV3_assertProdDeploymentApprovalGate3NDReadyV3() {
  var status =
    kidlearnV3_getProdDeploymentApprovalGate3NDStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.READY_FOR_3N_E
  ) {
    errors.push(
      '3N-D chưa READY_FOR_3N_E. Status=' +
      status.status
    );
  }

  if (!status.approvalId) {
    errors.push(
      'Thiếu approvalId.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_DEPLOYMENT_APPROVAL_GATE_3ND_READY_V3',
    bundle: '3N-D',
    phase: KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.PHASE,
    status: status.status,
    approvalId: status.approvalId || '',
    nextBundle:
      KIDLEARN_V3_PROD_APPROVAL_3ND_CONFIG.NEXT_BUNDLE,
    prodDeployNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3N-D chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA batch 3N-D package-only.
 *
 * Không record approval trong QA batch.
 */
function kidlearnV3_getQaBatchSteps3NDV3() {
  return [
    {
      label: 'Assert 3N-C ready',
      functionName: 'kidlearnV3_assertProdDryRunRehearsal3NCReadyV3'
    },
    {
      label: 'Preview PROD Approval Gate 3N-D',
      functionName: 'kidlearnV3_previewProdDeploymentApprovalGate3NDV3'
    },
    {
      label: 'Generate PROD Approval Package 3N-D',
      functionName: 'kidlearnV3_generateProdDeploymentApprovalPackage3NDV3'
    }
  ];
}


/**
 * QA batch 3N-D package-only.
 */
function kidlearnV3_runQaBatch3NDV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3N_D_PROD_APPROVAL_GATE_PACKAGE_ONLY',
    kidlearnV3_getQaBatchSteps3NDV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Check backup file.
 */
function kidlearnV3_3ndCheckBackupFile_() {
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
function kidlearnV3_3ndBuildSourceDatabaseSummary_() {
  var spreadsheet =
    kidlearnV3_3ndGetDatabaseSpreadsheet_();

  var expectedSheets =
    kidlearnV3_3ndGetExpectedSheets_();

  var items = [];
  var missing = [];

  for (var i = 0; i < expectedSheets.length; i++) {
    var sheetName =
      expectedSheets[i];

    var sheet =
      kidlearnV3_3ndGetSheet_(
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
function kidlearnV3_3ndCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3ndSafeWriteStatus_();

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
    kidlearnV3_3ndControlledWriteStatus_();

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
function kidlearnV3_3ndGetExpectedSheets_() {
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
    typeof kidlearnV3_3ncGetExpectedSheets_ === 'function'
  ) {
    return kidlearnV3_3ncGetExpectedSheets_();
  }

  return [
    'SYS_Config',
    'SYS_Categories',
    'SYS_SchemaVersion',
    'SYS_MigrationLog',
    'LOG_Audit',
    'LOG_Errors',
    'DATA_Users',
    'DATA_Children',
    'DATA_UserChildAccess',
    'DATA_Sessions',
    'MST_Subjects',
    'MST_Curriculums',
    'MST_Books',
    'MST_Topics',
    'MST_Lessons',
    'MST_LessonBlocks',
    'MST_Activities',
    'MST_Skills',
    'MST_LessonSkills',
    'MST_MediaAssets',
    'MST_Questions',
    'MST_QuestionOptions',
    'MST_Assessments',
    'MST_AssessmentQuestions',
    'DATA_Attempts',
    'DATA_Responses',
    'DATA_LessonProgress',
    'DATA_SkillProgress',
    'DATA_StudySessions',
    'DATA_Assignments',
    'DATA_DailyGoals',
    'DATA_ReviewQueue',
    'MST_Achievements',
    'DATA_ChildAchievements',
    'DATA_RewardTransactions',
    'DATA_Streaks',
    'MST_LibraryItems',
    'DATA_LibraryProgress',
    'DATA_Notifications',
    'STG_ContentImports',
    'STG_Questions',
    'STG_ApprovalQueue',
    'DATA_AIJobs',
    'LOG_AI'
  ];
}


/**
 * Database spreadsheet.
 */
function kidlearnV3_3ndGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3ndResolveSpreadsheet_(
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
function kidlearnV3_3ndResolveSpreadsheet_(value) {
  if (!value) {
    return null;
  }

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
function kidlearnV3_3ndGetSheet_(
  spreadsheet,
  sheetName
) {
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
function kidlearnV3_3ndSafeAssert_(functionName, label) {
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
function kidlearnV3_3ndSafeWriteStatus_() {
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
function kidlearnV3_3ndControlledWriteStatus_() {
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
function kidlearnV3_3ndCheckFunctions_(names) {
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
 * Make approval ID.
 */
function kidlearnV3_3ndMakeApprovalId_() {
  return (
    'PROD_APPROVAL_3ND_' +
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
function kidlearnV3_3ndSavePackage_(approvalPackage) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS.LAST_PACKAGE_JSON,
      JSON.stringify(approvalPackage)
    );
}


/**
 * Save result.
 */
function kidlearnV3_3ndSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.READY_FOR_3N_E &&
    (
      status === KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.PACKAGE_GENERATED ||
      status === KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.APPROVAL_RECORDED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_APPROVAL_3ND_STATUS.READY_FOR_3N_E;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_APPROVAL_3ND_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      approvalId: result.approvalId || '',
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
function kidlearnV3_3ndReadJsonProperty_(key) {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(key);

  if (!text) {
    return null;
  }

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
function kidlearnV3_3ndNormalizeOptions_(options) {
  if (!options) {
    return {};
  }

  if (typeof options !== 'object') {
    return {
      value: options
    };
  }

  return options;
}