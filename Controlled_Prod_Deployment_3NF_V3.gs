/**
 * ================================================================
 * KIDLEARN V3 - CONTROLLED PROD DEPLOYMENT
 * Bundle: 3N-F
 * Version: 3.1.0
 * ================================================================
 *
 * 3N-F:
 * - Có thể tạo PROD file thật bằng cách copy từ backup 3N-B.
 * - Không overwrite PROD cũ.
 * - Không delete file.
 * - Không migration.
 * - Không rollback.
 * - Không real write learning data.
 * - Không sửa DEV database.
 *
 * QA batch 3N-F chỉ package-only, không tạo PROD file.
 */


var KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3NF_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3NF_LAST_PREVIEW_AT',
  LAST_PACKAGE_AT: 'KIDLEARN_V3_PHASE_3NF_LAST_PACKAGE_AT',
  LAST_EXECUTION_AT: 'KIDLEARN_V3_PHASE_3NF_LAST_EXECUTION_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3NF_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3NF_LAST_RESULT_JSON',
  LAST_PACKAGE_JSON: 'KIDLEARN_V3_PHASE_3NF_LAST_PACKAGE_JSON',
  LAST_EXECUTION_JSON: 'KIDLEARN_V3_PHASE_3NF_LAST_EXECUTION_JSON',
  PROD_FILE_ID: 'KIDLEARN_V3_PHASE_3NF_PROD_FILE_ID',
  PROD_FILE_URL: 'KIDLEARN_V3_PHASE_3NF_PROD_FILE_URL',
  PROD_FILE_NAME: 'KIDLEARN_V3_PHASE_3NF_PROD_FILE_NAME',
  DEPLOYMENT_ID: 'KIDLEARN_V3_PHASE_3NF_DEPLOYMENT_ID'
};


var KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  PACKAGE_GENERATED: 'PACKAGE_GENERATED',
  PROD_FILE_CREATED: 'PROD_FILE_CREATED',
  READY_FOR_3N_G: 'READY_FOR_3N_G',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG = {
  VERSION: '3N-F',
  PHASE: '3N-F',
  NEXT_BUNDLE: '3N-G',
  NEXT_STAGE: 'PROD_POST_DEPLOY_VALIDATION',
  EXPECTED_SHEET_COUNT: 44,
  WRITE_MODE: 'CONTROLLED_PROD_FILE_CREATE',
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: true,
  CONFIRM_TEXT: 'EXECUTE_CONTROLLED_PROD_DEPLOYMENT_3N_F'
};


/**
 * Preview 3N-F.
 */
function kidlearnV3_previewControlledProdDeployment3NFV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3nfCheckFunctions_([
      'kidlearnV3_assertProdDeploymentExecutionGate3NEReadyV3',
      'kidlearnV3_getProdDeploymentExecutionGate3NEStatusV3',
      'kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_appGetActiveDatabaseV3_',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3NE =
    kidlearnV3_3nfSafeAssert_(
      'kidlearnV3_assertProdDeploymentExecutionGate3NEReadyV3',
      '3N-E'
    );

  if (!phase3NE.success) {
    errors.push(
      '3N-E chưa READY_FOR_3N_F: ' +
      phase3NE.message
    );
  }

  var safeModes =
    kidlearnV3_3nfCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var backupCheck =
    kidlearnV3_3nfCheckBackupFile_();

  if (!backupCheck.success) {
    errors.push(
      'Backup file từ 3N-B chưa hợp lệ: ' +
      backupCheck.message
    );
  }

  var sourceSummary = null;

  try {
    sourceSummary =
      kidlearnV3_3nfBuildSourceDatabaseSummary_();

    if (sourceSummary.missingSheetCount > 0) {
      errors.push(
        'Source DEV candidate thiếu sheet. Missing=' +
        sourceSummary.missingSheetCount
      );
    }

  } catch (error) {
    errors.push(
      'Không build được source database summary 3N-F: ' +
      String(error.message || error)
    );
  }

  var existingProd =
    kidlearnV3_3nfGetExistingProdInfo_();

  if (existingProd.prodFileId) {
    warnings.push(
      'Đã có PROD file được tạo trước đó trong 3N-F. Mặc định sẽ không tạo bản mới nếu không forceNewProdFile=true.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_CONTROLLED_PROD_DEPLOYMENT_3NF_V3',
    bundle: '3N-F',
    phase: KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.WRITE_MODE,
    prodDeployNow: true,
    willCreateProdFileOnlyWhenExecuteFunctionRuns: true,
    realWriteAllowed: false,
    confirmText:
      KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.CONFIRM_TEXT,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3NE: phase3NE,
    safeModes: safeModes,
    backupCheck: backupCheck,
    sourceSummary: sourceSummary,
    existingProd: existingProd,
    requiredFunctions: requiredFunctions.items,
    note:
      '3N-F có thể tạo PROD file thật, nhưng chỉ khi chạy execute function với confirm text đúng.'
  };

  kidlearnV3_3nfSaveResult_(
    result,
    KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Generate controlled PROD deployment package.
 *
 * Không tạo PROD file.
 */
function kidlearnV3_generateControlledProdDeploymentPackage3NFV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewControlledProdDeployment3NFV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate controlled PROD deployment package 3N-F vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var executionGate =
    kidlearnV3_getProdDeploymentExecutionGate3NEStatusV3();

  var backupStatus =
    kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3();

  var backupCheck =
    kidlearnV3_3nfCheckBackupFile_();

  var sourceSummary =
    kidlearnV3_3nfBuildSourceDatabaseSummary_();

  var safeModes =
    kidlearnV3_3nfCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var finishedAt = new Date();

  var deploymentPackage = {
    success: errors.length === 0,
    action: 'GENERATE_CONTROLLED_PROD_DEPLOYMENT_PACKAGE_3NF_V3',
    bundle: '3N-F',
    phase: KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.PACKAGE_GENERATED
        : KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.FAILED,
    nextBundle:
      KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.NEXT_STAGE,
    confirmText:
      KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.CONFIRM_TEXT,
    prodDeployNow: true,
    prodFileCreatedNow: false,
    realWriteAllowed: false,
    deploymentSource:
      'BACKUP_FILE_FROM_3N_B',
    backup: {
      backupFileId: backupStatus.backupFileId || '',
      backupFileUrl: backupStatus.backupFileUrl || '',
      backupFileAccessible: backupCheck.success,
      backupFileName: backupCheck.backupFileName || ''
    },
    executionGate: {
      status: executionGate.status || '',
      executionGateId: executionGate.executionGateId || '',
      lastArmedAt: executionGate.lastArmedAt || ''
    },
    sourceCandidate: {
      spreadsheetId: sourceSummary.spreadsheetId,
      spreadsheetName: sourceSummary.spreadsheetName,
      spreadsheetUrl: sourceSummary.spreadsheetUrl,
      expectedSheetCount: sourceSummary.expectedSheetCount,
      foundSheetCount: sourceSummary.foundSheetCount,
      missingSheetCount: sourceSummary.missingSheetCount
    },
    safeModes: safeModes.summary,
    deploymentChecklist: [
      {
        item: '3N-E execution gate ready',
        passed: executionGate.status === 'READY_FOR_3N_F'
      },
      {
        item: 'Execution gate ID exists',
        passed: executionGate.executionGateId ? true : false
      },
      {
        item: 'Backup file accessible',
        passed: backupCheck.success
      },
      {
        item: 'Source DEV candidate has expected V3 sheets',
        passed: sourceSummary.missingSheetCount === 0
      },
      {
        item: 'Safe Write remains DRY_RUN/enabled=false before copy',
        passed:
          safeModes.summary.safeWriteMode === 'DRY_RUN' &&
          safeModes.summary.safeWriteEnabled === false
      }
    ],
    executeInstruction:
      'Sau khi review package, chạy kidlearnV3_executeControlledProdDeployment3NFManualConfirmV3 để tạo PROD file thật.',
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() - startedAt.getTime(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_3nfSavePackage_(deploymentPackage);

  kidlearnV3_3nfSaveResult_(
    deploymentPackage,
    deploymentPackage.success
      ? KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.PACKAGE_GENERATED
      : KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.FAILED,
    KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.LAST_PACKAGE_AT
  );

  console.log(JSON.stringify(deploymentPackage, null, 2));

  if (!deploymentPackage.success) {
    throw new Error(
      'Generate controlled PROD deployment package 3N-F failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return deploymentPackage;
}


/**
 * Manual confirm wrapper.
 *
 * Hàm này SẼ tạo PROD file thật nếu chưa có PROD file trong 3N-F.
 * Không dùng Session.getActiveUser để tránh thêm OAuth scope.
 */
function kidlearnV3_executeControlledProdDeployment3NFManualConfirmV3() {
  return kidlearnV3_executeControlledProdDeployment3NFV3({
    confirmText:
      KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.CONFIRM_TEXT,
    executedBy: 'DEV_EXECUTOR_MANUAL_3NF',
    executionNote:
      'Controlled PROD deployment executed in 3N-F by copying backup file from 3N-B.'
  });
}


/**
 * Execute controlled PROD deployment.
 *
 * options:
 * {
 *   confirmText: 'EXECUTE_CONTROLLED_PROD_DEPLOYMENT_3N_F',
 *   executedBy: '...',
 *   executionNote: '...',
 *   forceNewProdFile: false
 * }
 */
function kidlearnV3_executeControlledProdDeployment3NFV3(options) {
  var req =
    kidlearnV3_3nfNormalizeOptions_(options);

  var errors = [];
  var warnings = [];

  if (
    String(req.confirmText || '') !==
    KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.CONFIRM_TEXT
  ) {
    errors.push(
      'Confirm text không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.CONFIRM_TEXT
    );
  }

  var status =
    kidlearnV3_getControlledProdDeployment3NFStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.PACKAGE_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.PROD_FILE_CREATED &&
    status.status !== KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.READY_FOR_3N_G
  ) {
    errors.push(
      '3N-F chưa có deployment package. Status=' +
      status.status
    );
  }

  if (
    !status.lastPackage ||
    status.lastPackage.success !== true
  ) {
    errors.push(
      'Last deployment package chưa success=true.'
    );
  }

  var safeModes =
    kidlearnV3_3nfCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var backupCheck =
    kidlearnV3_3nfCheckBackupFile_();

  if (!backupCheck.success) {
    errors.push(
      'Backup file không còn accessible: ' +
      backupCheck.message
    );
  }

  var existingProd =
    kidlearnV3_3nfGetExistingProdInfo_();

  if (
    existingProd.prodFileId &&
    existingProd.prodFileUrl &&
    req.forceNewProdFile !== true
  ) {
    var reused = {
      success: true,
      action: 'EXECUTE_CONTROLLED_PROD_DEPLOYMENT_3NF_V3',
      bundle: '3N-F',
      phase: KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.PHASE,
      status: KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.PROD_FILE_CREATED,
      reusedExistingProdFile: true,
      prodFileCreatedNow: false,
      prodFileId: existingProd.prodFileId,
      prodFileUrl: existingProd.prodFileUrl,
      prodFileName: existingProd.prodFileName,
      prodDeployNow: true,
      message:
        'Đã có PROD file được tạo trước đó trong 3N-F. Không tạo file mới. Muốn tạo mới, chạy với forceNewProdFile=true.',
      warningCount: warnings.length,
      warnings: warnings
    };

    kidlearnV3_3nfSaveExecution_(reused);

    kidlearnV3_3nfSaveResult_(
      reused,
      KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.PROD_FILE_CREATED,
      KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.LAST_EXECUTION_AT
    );

    console.log(JSON.stringify(reused, null, 2));

    return reused;
  }

  if (errors.length > 0) {
    var failed = {
      success: false,
      action: 'EXECUTE_CONTROLLED_PROD_DEPLOYMENT_3NF_V3',
      bundle: '3N-F',
      phase: KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.PHASE,
      status: status.status,
      prodDeployNow: true,
      prodFileCreatedNow: false,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors: errors,
      warnings: warnings
    };

    console.log(JSON.stringify(failed, null, 2));

    throw new Error(
      'Không thể execute controlled PROD deployment 3N-F. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var deploymentId =
    kidlearnV3_3nfMakeDeploymentId_();

  var backupStatus =
    kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3();

  var backupFile =
    DriveApp.getFileById(
      backupStatus.backupFileId
    );

  var prodFileName =
    kidlearnV3_3nfBuildProdFileName_(
      backupFile.getName(),
      deploymentId
    );

  var prodFile =
    kidlearnV3_3nfMakeCopyInSameFolder_(
      backupFile,
      prodFileName
    );

  var prodValidation =
    kidlearnV3_3nfValidateProdFile_(
      prodFile.getId()
    );

  if (!prodValidation.success) {
    errors =
      errors.concat(
        prodValidation.errors || []
      );
  }

  var execution = {
    success: errors.length === 0,
    action: 'EXECUTE_CONTROLLED_PROD_DEPLOYMENT_3NF_V3',
    bundle: '3N-F',
    phase: KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.PROD_FILE_CREATED
        : KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.FAILED,
    deploymentId: deploymentId,
    executedBy:
      req.executedBy || 'DEV_EXECUTOR_MANUAL_3NF',
    executionNote:
      req.executionNote || '',
    sourceBackup: {
      backupFileId: backupStatus.backupFileId || '',
      backupFileUrl: backupStatus.backupFileUrl || '',
      backupFileName: backupFile.getName()
    },
    prodFileCreatedNow: true,
    prodFileId: prodFile.getId(),
    prodFileName: prodFile.getName(),
    prodFileUrl: prodFile.getUrl(),
    prodDeployNow: true,
    realWriteAllowed: false,
    safeModesBeforeCopy: safeModes.summary,
    prodValidation: prodValidation,
    blockedActionsConfirmed: [
      'No overwrite existing PROD',
      'No delete file',
      'No migration executed',
      'No rollback executed',
      'No learning real write executed',
      'No DEV database modified'
    ],
    nextBundle:
      KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.NEXT_STAGE,
    executedAt:
      new Date().toISOString(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  var properties =
    PropertiesService.getScriptProperties();

  if (execution.success) {
    properties.setProperty(
      KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.DEPLOYMENT_ID,
      deploymentId
    );

    properties.setProperty(
      KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.PROD_FILE_ID,
      execution.prodFileId
    );

    properties.setProperty(
      KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.PROD_FILE_URL,
      execution.prodFileUrl
    );

    properties.setProperty(
      KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.PROD_FILE_NAME,
      execution.prodFileName
    );
  }

  kidlearnV3_3nfSaveExecution_(execution);

  kidlearnV3_3nfSaveResult_(
    execution,
    execution.success
      ? KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.PROD_FILE_CREATED
      : KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.FAILED,
    KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.LAST_EXECUTION_AT
  );

  console.log(JSON.stringify(execution, null, 2));

  if (!execution.success) {
    throw new Error(
      'Controlled PROD deployment 3N-F failed after copy. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return execution;
}


/**
 * Mark 3N-F ready.
 */
function kidlearnV3_markControlledProdDeployment3NFReadyV3() {
  var status =
    kidlearnV3_getControlledProdDeployment3NFStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.PROD_FILE_CREATED &&
    status.status !== KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.READY_FOR_3N_G
  ) {
    errors.push(
      '3N-F chưa PROD_FILE_CREATED. Status=' +
      status.status
    );
  }

  if (!status.prodFileId) {
    errors.push(
      'Thiếu prodFileId.'
    );
  }

  if (!status.prodFileUrl) {
    errors.push(
      'Thiếu prodFileUrl.'
    );
  }

  if (
    !status.lastExecution ||
    status.lastExecution.success !== true
  ) {
    errors.push(
      'Last execution chưa success=true.'
    );
  }

  var prodValidation =
    status.prodFileId
      ? kidlearnV3_3nfValidateProdFile_(status.prodFileId)
      : {
          success: false,
          errors: ['Không validate được vì thiếu prodFileId.']
        };

  if (!prodValidation.success) {
    errors =
      errors.concat(
        prodValidation.errors || []
      );
  }

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3N-F ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_CONTROLLED_PROD_DEPLOYMENT_3NF_READY_V3',
    bundle: '3N-F',
    phase: KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.READY_FOR_3N_G,
    deploymentId: status.deploymentId || '',
    prodFileId: status.prodFileId,
    prodFileName: status.prodFileName || '',
    prodFileUrl: status.prodFileUrl,
    prodValidation: prodValidation,
    nextBundle:
      KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.NEXT_STAGE,
    message:
      '3N-F ready. PROD file đã được tạo và validate. Bước tiếp theo là 3N-G PROD post-deploy validation.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3nfSaveResult_(
    result,
    KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.READY_FOR_3N_G,
    KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3N-F status.
 */
function kidlearnV3_getControlledProdDeployment3NFStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_CONTROLLED_PROD_DEPLOYMENT_3NF_STATUS_V3',
    bundle: '3N-F',
    phase: KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.NOT_RUN,
    deploymentId:
      properties.getProperty(
        KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.DEPLOYMENT_ID
      ) ||
      '',
    prodFileId:
      properties.getProperty(
        KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.PROD_FILE_ID
      ) ||
      '',
    prodFileUrl:
      properties.getProperty(
        KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.PROD_FILE_URL
      ) ||
      '',
    prodFileName:
      properties.getProperty(
        KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.PROD_FILE_NAME
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastPackageAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.LAST_PACKAGE_AT
      ) ||
      '',
    lastExecutionAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.LAST_EXECUTION_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3nfReadJsonProperty_(
        KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.LAST_RESULT_JSON
      ),
    lastPackage:
      kidlearnV3_3nfReadJsonProperty_(
        KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.LAST_PACKAGE_JSON
      ),
    lastExecution:
      kidlearnV3_3nfReadJsonProperty_(
        KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.LAST_EXECUTION_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3N-F ready.
 */
function kidlearnV3_assertControlledProdDeployment3NFReadyV3() {
  var status =
    kidlearnV3_getControlledProdDeployment3NFStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.READY_FOR_3N_G
  ) {
    errors.push(
      '3N-F chưa READY_FOR_3N_G. Status=' +
      status.status
    );
  }

  if (!status.prodFileId) {
    errors.push(
      'Thiếu prodFileId.'
    );
  }

  if (!status.prodFileUrl) {
    errors.push(
      'Thiếu prodFileUrl.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_CONTROLLED_PROD_DEPLOYMENT_3NF_READY_V3',
    bundle: '3N-F',
    phase: KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.PHASE,
    status: status.status,
    deploymentId: status.deploymentId || '',
    prodFileId: status.prodFileId || '',
    prodFileUrl: status.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_DEPLOY_3NF_CONFIG.NEXT_BUNDLE,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3N-F chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA batch 3N-F package-only.
 *
 * Không execute deployment trong QA batch.
 */
function kidlearnV3_getQaBatchSteps3NFV3() {
  return [
    {
      label: 'Assert 3N-E ready',
      functionName: 'kidlearnV3_assertProdDeploymentExecutionGate3NEReadyV3'
    },
    {
      label: 'Preview Controlled PROD Deployment 3N-F',
      functionName: 'kidlearnV3_previewControlledProdDeployment3NFV3'
    },
    {
      label: 'Generate Controlled PROD Deployment Package 3N-F',
      functionName: 'kidlearnV3_generateControlledProdDeploymentPackage3NFV3'
    }
  ];
}


/**
 * QA batch 3N-F package-only.
 */
function kidlearnV3_runQaBatch3NFV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3N_F_CONTROLLED_PROD_DEPLOYMENT_PACKAGE_ONLY',
    kidlearnV3_getQaBatchSteps3NFV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Validate PROD file after copy.
 */
function kidlearnV3_3nfValidateProdFile_(prodFileId) {
  var errors = [];
  var warnings = [];

  try {
    var spreadsheet =
      SpreadsheetApp.openById(prodFileId);

    var expectedSheets =
      kidlearnV3_3nfGetExpectedSheets_();

    var items = [];
    var missing = [];

    for (var i = 0; i < expectedSheets.length; i++) {
      var sheetName =
        expectedSheets[i];

      var sheet =
        kidlearnV3_3nfGetSheet_(
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

    if (missing.length > 0) {
      errors.push(
        'PROD file thiếu V3 sheet: ' +
        missing.join(', ')
      );
    }

    return {
      success: errors.length === 0,
      prodFileId: prodFileId,
      spreadsheetName: spreadsheet.getName(),
      spreadsheetUrl: spreadsheet.getUrl(),
      expectedSheetCount: expectedSheets.length,
      foundSheetCount:
        items.filter(function(item) {
          return item.exists;
        }).length,
      missingSheetCount: missing.length,
      missingSheets: missing,
      items: items,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors: errors,
      warnings: warnings
    };

  } catch (error) {
    return {
      success: false,
      prodFileId: prodFileId || '',
      errorCount: 1,
      warningCount: 0,
      errors: [
        'Không mở/validate được PROD file: ' +
        String(error.message || error)
      ],
      warnings: []
    };
  }
}


/**
 * Check backup file.
 */
function kidlearnV3_3nfCheckBackupFile_() {
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
function kidlearnV3_3nfBuildSourceDatabaseSummary_() {
  var spreadsheet =
    kidlearnV3_3nfGetDatabaseSpreadsheet_();

  var expectedSheets =
    kidlearnV3_3nfGetExpectedSheets_();

  var items = [];
  var missing = [];

  for (var i = 0; i < expectedSheets.length; i++) {
    var sheetName =
      expectedSheets[i];

    var sheet =
      kidlearnV3_3nfGetSheet_(
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
 * Check safe modes before PROD copy.
 */
function kidlearnV3_3nfCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3nfSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Safe Write phải DRY_RUN/enabled=false trước khi deploy PROD. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var controlledWrite =
    kidlearnV3_3nfControlledWriteStatus_();

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
 * Existing PROD info.
 */
function kidlearnV3_3nfGetExistingProdInfo_() {
  var properties =
    PropertiesService.getScriptProperties();

  return {
    deploymentId:
      properties.getProperty(
        KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.DEPLOYMENT_ID
      ) ||
      '',
    prodFileId:
      properties.getProperty(
        KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.PROD_FILE_ID
      ) ||
      '',
    prodFileUrl:
      properties.getProperty(
        KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.PROD_FILE_URL
      ) ||
      '',
    prodFileName:
      properties.getProperty(
        KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.PROD_FILE_NAME
      ) ||
      ''
  };
}


/**
 * Make copy in same folder.
 */
function kidlearnV3_3nfMakeCopyInSameFolder_(sourceFile, newName) {
  var parents =
    sourceFile.getParents();

  if (parents.hasNext()) {
    var parent =
      parents.next();

    return sourceFile.makeCopy(
      newName,
      parent
    );
  }

  return sourceFile.makeCopy(newName);
}


/**
 * Build PROD file name.
 */
function kidlearnV3_3nfBuildProdFileName_(backupFileName, deploymentId) {
  var cleanBackupName =
    String(backupFileName || 'KIDLEARN V3 BACKUP')
      .replace('[KIDLEARN V3 DEV BACKUP]', '')
      .trim();

  return (
    '[KIDLEARN V3 PROD] ' +
    cleanBackupName +
    ' - ' +
    deploymentId
  );
}


/**
 * Get expected sheets.
 */
function kidlearnV3_3nfGetExpectedSheets_() {
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
    typeof kidlearnV3_3neGetExpectedSheets_ === 'function'
  ) {
    return kidlearnV3_3neGetExpectedSheets_();
  }

  throw new Error(
    'Không tìm thấy KIDLEARN_V3_SHEET_ORDER hoặc helper expected sheets.'
  );
}


/**
 * Database spreadsheet.
 */
function kidlearnV3_3nfGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3nfResolveSpreadsheet_(database);

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
function kidlearnV3_3nfResolveSpreadsheet_(value) {
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
function kidlearnV3_3nfGetSheet_(spreadsheet, sheetName) {
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
function kidlearnV3_3nfSafeAssert_(functionName, label) {
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
function kidlearnV3_3nfSafeWriteStatus_() {
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
function kidlearnV3_3nfControlledWriteStatus_() {
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
function kidlearnV3_3nfCheckFunctions_(names) {
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
 * Make deployment ID.
 */
function kidlearnV3_3nfMakeDeploymentId_() {
  return (
    'PROD_DEPLOYMENT_3NF_' +
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
function kidlearnV3_3nfSavePackage_(deploymentPackage) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.LAST_PACKAGE_JSON,
      JSON.stringify(deploymentPackage)
    );
}


/**
 * Save execution.
 */
function kidlearnV3_3nfSaveExecution_(execution) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.LAST_EXECUTION_JSON,
      JSON.stringify(execution)
    );
}


/**
 * Save result.
 */
function kidlearnV3_3nfSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.READY_FOR_3N_G &&
    (
      status === KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.PACKAGE_GENERATED ||
      status === KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.PROD_FILE_CREATED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_DEPLOY_3NF_STATUS.READY_FOR_3N_G;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_DEPLOY_3NF_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      deploymentId: result.deploymentId || '',
      prodFileId: result.prodFileId || '',
      prodFileUrl: result.prodFileUrl || '',
      prodFileName: result.prodFileName || '',
      prodDeployNow: true,
      prodFileCreatedNow: result.prodFileCreatedNow || false,
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
function kidlearnV3_3nfReadJsonProperty_(key) {
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
function kidlearnV3_3nfNormalizeOptions_(options) {
  if (!options) return {};

  if (typeof options !== 'object') {
    return {
      value: options
    };
  }

  return options;
}