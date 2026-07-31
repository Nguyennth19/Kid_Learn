/**
 * ================================================================
 * KIDLEARN V3 - PROD RELEASE FINAL LOCK
 * Bundle: 3N-J
 * Version: 3.1.0
 * ================================================================
 *
 * 3N-J:
 * - Final lock release PROD V3.
 * - Không ghi vào PROD file.
 * - Không tạo PROD file mới.
 * - Không migration.
 * - Không rollback.
 * - Không real write.
 * - Chỉ ghi ScriptProperties trong DEV script để lưu final lock/status.
 */


var KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3NJ_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3NJ_LAST_PREVIEW_AT',
  LAST_PACKAGE_AT: 'KIDLEARN_V3_PHASE_3NJ_LAST_PACKAGE_AT',
  LAST_LOCK_AT: 'KIDLEARN_V3_PHASE_3NJ_LAST_LOCK_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3NJ_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3NJ_LAST_RESULT_JSON',
  LAST_PACKAGE_JSON: 'KIDLEARN_V3_PHASE_3NJ_LAST_PACKAGE_JSON',
  LAST_LOCK_JSON: 'KIDLEARN_V3_PHASE_3NJ_LAST_LOCK_JSON',
  FINAL_LOCK_ID: 'KIDLEARN_V3_PHASE_3NJ_FINAL_LOCK_ID'
};


var KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  PACKAGE_GENERATED: 'PACKAGE_GENERATED',
  FINAL_LOCK_RECORDED: 'FINAL_LOCK_RECORDED',
  PROD_RELEASE_LOCKED: 'PROD_RELEASE_LOCKED',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_CONFIG = {
  VERSION: '3N-J',
  PHASE: '3N-J',
  NEXT_STAGE: 'PROD_READ_ONLY_MONITORING_AND_ONBOARDING',
  WRITE_MODE: 'FINAL_LOCK_SCRIPT_PROPERTIES_ONLY',
  REAL_WRITE_ALLOWED: false,
  PROD_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  CONFIRM_TEXT: 'LOCK_PROD_RELEASE_3N_J'
};


/**
 * Preview 3N-J.
 */
function kidlearnV3_previewProdReleaseFinalLock3NJV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3njCheckFunctions_([
      'kidlearnV3_assertProdReleaseHandover3NIReadyV3',
      'kidlearnV3_getProdReleaseHandover3NIStatusV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3',
      'kidlearnV3_getProdPostDeployValidation3NGStatusV3',
      'kidlearnV3_getProdRuntimeSmokeTest3NHStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3NI =
    kidlearnV3_3njSafeAssert_(
      'kidlearnV3_assertProdReleaseHandover3NIReadyV3',
      '3N-I'
    );

  if (!phase3NI.success) {
    errors.push(
      '3N-I chưa READY_FOR_3N_J: ' +
      phase3NI.message
    );
  }

  var prodInfo =
    kidlearnV3_3njGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  var prodCheck =
    kidlearnV3_3njCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file chưa accessible: ' +
      prodCheck.message
    );
  }

  var backupInfo =
    kidlearnV3_3njGetBackupInfo_();

  if (!backupInfo.backupFileId) {
    errors.push('Thiếu backupFileId từ 3N-B.');
  }

  var backupCheck =
    kidlearnV3_3njCheckFileAccessible_(
      backupInfo.backupFileId,
      'BACKUP'
    );

  if (!backupCheck.success) {
    errors.push(
      'Backup file chưa accessible: ' +
      backupCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3njCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_RELEASE_FINAL_LOCK_3NJ_V3',
    bundle: '3N-J',
    phase: KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_CONFIG.PHASE,
    nextStage: KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_CONFIG.WRITE_MODE,
    confirmText:
      KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_CONFIG.CONFIRM_TEXT,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3NI: phase3NI,
    prodInfo: prodInfo,
    prodCheck: prodCheck,
    backupInfo: backupInfo,
    backupCheck: backupCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3N-J chỉ khóa trạng thái release trong ScriptProperties. Không ghi vào PROD file.'
  };

  kidlearnV3_3njSaveResult_(
    result,
    KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Generate final lock package.
 *
 * Không lock thật PROD file bằng protection.
 * Không ghi vào PROD file.
 */
function kidlearnV3_generateProdReleaseFinalLockPackage3NJV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdReleaseFinalLock3NJV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate final lock package 3N-J vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var finalLockId =
    kidlearnV3_3njMakeFinalLockId_();

  var prodInfo =
    kidlearnV3_3njGetProdInfo_();

  var backupInfo =
    kidlearnV3_3njGetBackupInfo_();

  var handoverInfo =
    kidlearnV3_3njSafeCall_(
      'kidlearnV3_getProdReleaseHandover3NIStatusV3'
    );

  var validationInfo =
    kidlearnV3_3njSafeCall_(
      'kidlearnV3_getProdPostDeployValidation3NGStatusV3'
    );

  var smokeInfo =
    kidlearnV3_3njSafeCall_(
      'kidlearnV3_getProdRuntimeSmokeTest3NHStatusV3'
    );

  var deployInfo =
    kidlearnV3_3njSafeCall_(
      'kidlearnV3_getControlledProdDeployment3NFStatusV3'
    );

  var approvalInfo =
    kidlearnV3_3njSafeCall_(
      'kidlearnV3_getProdDeploymentApprovalGate3NDStatusV3'
    );

  var executionGateInfo =
    kidlearnV3_3njSafeCall_(
      'kidlearnV3_getProdDeploymentExecutionGate3NEStatusV3'
    );

  var prodCheck =
    kidlearnV3_3njCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi generate final lock package: ' +
      prodCheck.message
    );
  }

  var backupCheck =
    kidlearnV3_3njCheckFileAccessible_(
      backupInfo.backupFileId,
      'BACKUP'
    );

  if (!backupCheck.success) {
    errors.push(
      'Backup file không accessible khi generate final lock package: ' +
      backupCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3njCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var finishedAt = new Date();

  var finalLockPackage = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_RELEASE_FINAL_LOCK_PACKAGE_3NJ_V3',
    bundle: '3N-J',
    phase: KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.PACKAGE_GENERATED
        : KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.FAILED,
    finalLockId: finalLockId,
    nextStage:
      KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_CONFIG.NEXT_STAGE,
    confirmText:
      KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_CONFIG.CONFIRM_TEXT,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,

    finalReleaseSummary: {
      releaseName: 'KIDLEARN V3 PROD Release',
      releaseStatus:
        errors.length === 0
          ? 'READY_TO_LOCK'
          : 'HOLD_FINAL_LOCK_FAILED',
      appVersion:
        kidlearnV3_3njGetAppVersion_(),
      schemaVersion:
        kidlearnV3_3njGetSchemaVersion_(),
      releaseMode: 'PROD_READ_ONLY_AFTER_DEPLOYMENT',
      supportedRoles: [
        'CHILD',
        'FAMILY_ADMIN'
      ]
    },

    prodFile: {
      prodFileId: prodInfo.prodFileId || '',
      prodFileName: prodInfo.prodFileName || '',
      prodFileUrl: prodInfo.prodFileUrl || '',
      deploymentId: prodInfo.deploymentId || '',
      accessible: prodCheck.success,
      checkedFileName: prodCheck.fileName || '',
      checkedFileUrl: prodCheck.fileUrl || ''
    },

    backupFile: {
      backupFileId: backupInfo.backupFileId || '',
      backupFileUrl: backupInfo.backupFileUrl || '',
      accessible: backupCheck.success,
      checkedFileName: backupCheck.fileName || '',
      checkedFileUrl: backupCheck.fileUrl || ''
    },

    readinessChain: {
      approvalGate3ND: approvalInfo.summary,
      executionGate3NE: executionGateInfo.summary,
      controlledDeployment3NF: deployInfo.summary,
      postDeployValidation3NG: validationInfo.summary,
      runtimeSmoke3NH: smokeInfo.summary,
      handover3NI: handoverInfo.summary
    },

    finalLockChecklist: [
      {
        item: '3N-I handover ready',
        passed:
          handoverInfo.summary.status === 'READY_FOR_3N_J'
      },
      {
        item: '3N-H runtime smoke ready',
        passed:
          smokeInfo.summary.status === 'READY_FOR_3N_I'
      },
      {
        item: '3N-G post-deploy validation ready',
        passed:
          validationInfo.summary.status === 'READY_FOR_3N_H'
      },
      {
        item: '3N-F controlled deployment ready',
        passed:
          deployInfo.summary.status === 'READY_FOR_3N_G'
      },
      {
        item: 'PROD file accessible',
        passed: prodCheck.success
      },
      {
        item: 'Backup file accessible',
        passed: backupCheck.success
      },
      {
        item: 'Safe Write remains DRY_RUN/enabled=false',
        passed:
          safeModes.summary.safeWriteMode === 'DRY_RUN' &&
          safeModes.summary.safeWriteEnabled === false
      }
    ],

    lockedPolicyAfter3NJ: {
      prodWritePolicy: 'NOT_ENABLED',
      prodRuntimeMode: 'READ_ONLY',
      realWriteToProd: false,
      rollbackPolicy: 'MANUAL_SEPARATE_PHASE_ONLY',
      furtherProdChanges: 'REQUIRE_NEW_APPROVAL_GATE'
    },

    noSideEffect: {
      prodFileModifiedBy3NJ: false,
      prodSheetCreatedBy3NJ: false,
      prodSheetDeletedBy3NJ: false,
      prodDataWrittenBy3NJ: false
    },

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

  kidlearnV3_3njSavePackage_(
    finalLockPackage
  );

  kidlearnV3_3njSaveResult_(
    finalLockPackage,
    finalLockPackage.success
      ? KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.PACKAGE_GENERATED
      : KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.FAILED,
    KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.LAST_PACKAGE_AT
  );

  console.log(JSON.stringify(finalLockPackage, null, 2));

  if (!finalLockPackage.success) {
    throw new Error(
      '3N-J final lock package failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return finalLockPackage;
}


/**
 * Manual confirm wrapper.
 *
 * Không dùng Session.getActiveUser để tránh thêm OAuth scope.
 * Không ghi vào PROD file.
 */
function kidlearnV3_recordProdReleaseFinalLock3NJManualConfirmV3() {
  return kidlearnV3_recordProdReleaseFinalLock3NJV3({
    confirmText:
      KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_CONFIG.CONFIRM_TEXT,
    lockedBy: 'DEV_RELEASE_MANAGER_MANUAL_3NJ',
    lockNote:
      'PROD release final lock recorded in 3N-J. PROD file remains read-only by policy.'
  });
}


/**
 * Record final lock.
 *
 * options:
 * {
 *   confirmText: 'LOCK_PROD_RELEASE_3N_J',
 *   lockedBy: '...',
 *   lockNote: '...'
 * }
 */
function kidlearnV3_recordProdReleaseFinalLock3NJV3(options) {
  var req =
    kidlearnV3_3njNormalizeOptions_(options);

  var errors = [];
  var warnings = [];

  if (
    String(req.confirmText || '') !==
    KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_CONFIG.CONFIRM_TEXT
  ) {
    errors.push(
      'Confirm text không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_CONFIG.CONFIRM_TEXT
    );
  }

  var status =
    kidlearnV3_getProdReleaseFinalLock3NJStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.PACKAGE_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.FINAL_LOCK_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.PROD_RELEASE_LOCKED
  ) {
    errors.push(
      '3N-J chưa có final lock package. Status=' +
      status.status
    );
  }

  if (
    !status.lastPackage ||
    status.lastPackage.success !== true
  ) {
    errors.push(
      'Last final lock package chưa success=true.'
    );
  }

  var prodInfo =
    kidlearnV3_3njGetProdInfo_();

  var prodCheck =
    kidlearnV3_3njCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không còn accessible: ' +
      prodCheck.message
    );
  }

  var backupInfo =
    kidlearnV3_3njGetBackupInfo_();

  var backupCheck =
    kidlearnV3_3njCheckFileAccessible_(
      backupInfo.backupFileId,
      'BACKUP'
    );

  if (!backupCheck.success) {
    errors.push(
      'Backup file không còn accessible: ' +
      backupCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3njCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  if (errors.length > 0) {
    var failed = {
      success: false,
      action: 'RECORD_PROD_RELEASE_FINAL_LOCK_3NJ_V3',
      bundle: '3N-J',
      phase: KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_CONFIG.PHASE,
      status: status.status,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors: errors,
      warnings: warnings
    };

    console.log(JSON.stringify(failed, null, 2));

    throw new Error(
      'Không thể record final lock 3N-J. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var finalLockId =
    status.finalLockId ||
    kidlearnV3_3njMakeFinalLockId_();

  var lock = {
    success: true,
    action: 'RECORD_PROD_RELEASE_FINAL_LOCK_3NJ_V3',
    bundle: '3N-J',
    phase: KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.FINAL_LOCK_RECORDED,
    finalLockId: finalLockId,
    lockedBy:
      req.lockedBy || 'DEV_RELEASE_MANAGER_MANUAL_3NJ',
    lockNote:
      req.lockNote || '',
    lockMeaning:
      'PROD release has been finalized. PROD file remains read-only by policy. Future changes require a new approval/deployment phase.',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    backupFileId: backupInfo.backupFileId || '',
    backupFileUrl: backupInfo.backupFileUrl || '',
    safeModes: safeModes.summary,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    recordedAt:
      new Date().toISOString(),
    warningCount: warnings.length,
    warnings: warnings
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.FINAL_LOCK_ID,
    finalLockId
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.LAST_LOCK_JSON,
    JSON.stringify(lock)
  );

  kidlearnV3_3njSaveResult_(
    lock,
    KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.FINAL_LOCK_RECORDED,
    KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.LAST_LOCK_AT
  );

  console.log(JSON.stringify(lock, null, 2));

  return lock;
}


/**
 * Mark 3N-J final locked.
 */
function kidlearnV3_markProdReleaseFinalLock3NJReadyV3() {
  var status =
    kidlearnV3_getProdReleaseFinalLock3NJStatusV3();

  var errors = [];

  if (
    status.status !==
      KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.FINAL_LOCK_RECORDED &&
    status.status !==
      KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.PROD_RELEASE_LOCKED
  ) {
    errors.push(
      '3N-J chưa FINAL_LOCK_RECORDED. Status=' +
      status.status
    );
  }

  if (
    !status.lastLock ||
    status.lastLock.success !== true
  ) {
    errors.push(
      'Last final lock chưa success=true.'
    );
  }

  var prodInfo =
    kidlearnV3_3njGetProdInfo_();

  var prodCheck =
    kidlearnV3_3njCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không còn accessible: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3njCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3N-J locked. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_RELEASE_FINAL_LOCK_3NJ_READY_V3',
    bundle: '3N-J',
    phase: KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.PROD_RELEASE_LOCKED,
    finalLockId: status.finalLockId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextStage:
      KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    message:
      '3N-J completed. PROD release đã được final locked ở chế độ read-only. Future changes require new approval/deployment phase.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3njSaveResult_(
    result,
    KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.PROD_RELEASE_LOCKED,
    KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3N-J status.
 */
function kidlearnV3_getProdReleaseFinalLock3NJStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_RELEASE_FINAL_LOCK_3NJ_STATUS_V3',
    bundle: '3N-J',
    phase: KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.NOT_RUN,
    finalLockId:
      properties.getProperty(
        KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.FINAL_LOCK_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastPackageAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.LAST_PACKAGE_AT
      ) ||
      '',
    lastLockAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.LAST_LOCK_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3njReadJsonProperty_(
        KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.LAST_RESULT_JSON
      ),
    lastPackage:
      kidlearnV3_3njReadJsonProperty_(
        KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.LAST_PACKAGE_JSON
      ),
    lastLock:
      kidlearnV3_3njReadJsonProperty_(
        KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.LAST_LOCK_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3N-J final locked.
 */
function kidlearnV3_assertProdReleaseFinalLock3NJReadyV3() {
  var status =
    kidlearnV3_getProdReleaseFinalLock3NJStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.PROD_RELEASE_LOCKED
  ) {
    errors.push(
      '3N-J chưa PROD_RELEASE_LOCKED. Status=' +
      status.status
    );
  }

  if (!status.finalLockId) {
    errors.push(
      'Thiếu finalLockId.'
    );
  }

  var prodInfo =
    kidlearnV3_3njGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_RELEASE_FINAL_LOCK_3NJ_READY_V3',
    bundle: '3N-J',
    phase: KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_CONFIG.PHASE,
    status: status.status,
    finalLockId: status.finalLockId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextStage:
      KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3N-J chưa final locked. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA batch 3N-J package only.
 *
 * Không record final lock trong QA batch.
 */
function kidlearnV3_getQaBatchSteps3NJV3() {
  return [
    {
      label: 'Assert 3N-I ready',
      functionName: 'kidlearnV3_assertProdReleaseHandover3NIReadyV3'
    },
    {
      label: 'Preview PROD Final Lock 3N-J',
      functionName: 'kidlearnV3_previewProdReleaseFinalLock3NJV3'
    },
    {
      label: 'Generate PROD Final Lock Package 3N-J',
      functionName: 'kidlearnV3_generateProdReleaseFinalLockPackage3NJV3'
    }
  ];
}


/**
 * QA batch 3N-J package only.
 */
function kidlearnV3_runQaBatch3NJV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3N_J_PROD_RELEASE_FINAL_LOCK_PACKAGE_ONLY',
    kidlearnV3_getQaBatchSteps3NJV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * PROD info từ 3N-F.
 */
function kidlearnV3_3njGetProdInfo_() {
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
 * Backup info từ 3N-B.
 */
function kidlearnV3_3njGetBackupInfo_() {
  var status =
    kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3();

  return {
    status: status.status || '',
    backupFileId: status.backupFileId || '',
    backupFileUrl: status.backupFileUrl || '',
    lastBackupAt: status.lastBackupAt || ''
  };
}


/**
 * Check file accessible.
 */
function kidlearnV3_3njCheckFileAccessible_(fileId, label) {
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
function kidlearnV3_3njCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3njSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Safe Write trong DEV script phải DRY_RUN/enabled=false khi final lock. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var controlledWrite =
    kidlearnV3_3njControlledWriteStatus_();

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
 * Safe call.
 */
function kidlearnV3_3njSafeCall_(functionName) {
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
        kidlearnV3_3njSummarizeStatusOutput_(
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
function kidlearnV3_3njSummarizeStatusOutput_(output) {
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
    deploymentId: output.deploymentId || '',
    approvalId: output.approvalId || '',
    executionGateId: output.executionGateId || '',
    handoverId: output.handoverId || '',
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0
  };
}


/**
 * Safe assert.
 */
function kidlearnV3_3njSafeAssert_(functionName, label) {
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
function kidlearnV3_3njSafeWriteStatus_() {
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
function kidlearnV3_3njControlledWriteStatus_() {
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
function kidlearnV3_3njCheckFunctions_(names) {
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
 * App version.
 */
function kidlearnV3_3njGetAppVersion_() {
  try {
    if (
      typeof KIDLEARN_V3 !== 'undefined' &&
      KIDLEARN_V3.APP_VERSION
    ) {
      return KIDLEARN_V3.APP_VERSION;
    }
  } catch (error) {}

  return '';
}


/**
 * Schema version.
 */
function kidlearnV3_3njGetSchemaVersion_() {
  try {
    if (
      typeof KIDLEARN_V3 !== 'undefined' &&
      KIDLEARN_V3.SCHEMA_VERSION
    ) {
      return KIDLEARN_V3.SCHEMA_VERSION;
    }
  } catch (error) {}

  return '';
}


/**
 * Final lock ID.
 */
function kidlearnV3_3njMakeFinalLockId_() {
  return (
    'PROD_FINAL_LOCK_3NJ_' +
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
function kidlearnV3_3njSavePackage_(finalLockPackage) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.FINAL_LOCK_ID,
    finalLockPackage.finalLockId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.LAST_PACKAGE_JSON,
    JSON.stringify(finalLockPackage)
  );
}


/**
 * Save result.
 */
function kidlearnV3_3njSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.PROD_RELEASE_LOCKED &&
    (
      status === KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.PACKAGE_GENERATED ||
      status === KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.FINAL_LOCK_RECORDED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_STATUS.PROD_RELEASE_LOCKED;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_FINAL_LOCK_3NJ_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      finalLockId: result.finalLockId || '',
      prodFileId: result.prodFileId || '',
      prodFileUrl: result.prodFileUrl || '',
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
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
function kidlearnV3_3njReadJsonProperty_(key) {
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
function kidlearnV3_3njNormalizeOptions_(options) {
  if (!options) return {};

  if (typeof options !== 'object') {
    return {
      value: options
    };
  }

  return options;
}