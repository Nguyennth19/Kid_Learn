/**
 * ================================================================
 * KIDLEARN V3 - PROD RELEASE HANDOVER PACKAGE
 * Bundle: 3N-I
 * Version: 3.1.0
 * ================================================================
 *
 * 3N-I:
 * - Tạo PROD release handover package.
 * - Tổng hợp PROD file, backup, approval, execution, validation, smoke.
 * - Không ghi vào PROD file.
 * - Không tạo PROD file mới.
 * - Không migration.
 * - Không rollback.
 * - Không real write.
 * - Chỉ ghi ScriptProperties trong DEV script để lưu handover/status.
 */


var KIDLEARN_V3_PROD_HANDOVER_3NI_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3NI_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3NI_LAST_PREVIEW_AT',
  LAST_PACKAGE_AT: 'KIDLEARN_V3_PHASE_3NI_LAST_PACKAGE_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3NI_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3NI_LAST_RESULT_JSON',
  LAST_PACKAGE_JSON: 'KIDLEARN_V3_PHASE_3NI_LAST_PACKAGE_JSON',
  HANDOVER_ID: 'KIDLEARN_V3_PHASE_3NI_HANDOVER_ID'
};


var KIDLEARN_V3_PROD_HANDOVER_3NI_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  PACKAGE_GENERATED: 'PACKAGE_GENERATED',
  READY_FOR_3N_J: 'READY_FOR_3N_J',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_HANDOVER_3NI_CONFIG = {
  VERSION: '3N-I',
  PHASE: '3N-I',
  NEXT_BUNDLE: '3N-J',
  NEXT_STAGE: 'PROD_RELEASE_FINAL_LOCK',
  WRITE_MODE: 'RELEASE_HANDOVER_PACKAGE_ONLY',
  REAL_WRITE_ALLOWED: false,
  PROD_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false
};


/**
 * Preview 3N-I.
 */
function kidlearnV3_previewProdReleaseHandover3NIV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3niCheckFunctions_([
      'kidlearnV3_assertProdRuntimeSmokeTest3NHReadyV3',
      'kidlearnV3_getProdRuntimeSmokeTest3NHStatusV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getProdPostDeployValidation3NGStatusV3',
      'kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3NH =
    kidlearnV3_3niSafeAssert_(
      'kidlearnV3_assertProdRuntimeSmokeTest3NHReadyV3',
      '3N-H'
    );

  if (!phase3NH.success) {
    errors.push(
      '3N-H chưa READY_FOR_3N_I: ' +
      phase3NH.message
    );
  }

  var prodInfo =
    kidlearnV3_3niGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodFileCheck =
    kidlearnV3_3niCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodFileCheck.success) {
    errors.push(
      'PROD file chưa accessible: ' +
      prodFileCheck.message
    );
  }

  var backupInfo =
    kidlearnV3_3niGetBackupInfo_();

  if (!backupInfo.backupFileId) {
    errors.push('Thiếu backupFileId từ 3N-B.');
  }

  var backupCheck =
    kidlearnV3_3niCheckFileAccessible_(
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
    kidlearnV3_3niCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_RELEASE_HANDOVER_3NI_V3',
    bundle: '3N-I',
    phase: KIDLEARN_V3_PROD_HANDOVER_3NI_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_HANDOVER_3NI_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_HANDOVER_3NI_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_HANDOVER_3NI_CONFIG.WRITE_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3NH: phase3NH,
    prodInfo: prodInfo,
    prodFileCheck: prodFileCheck,
    backupInfo: backupInfo,
    backupCheck: backupCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3N-I chỉ tạo release handover package. Không ghi vào PROD file.'
  };

  kidlearnV3_3niSaveResult_(
    result,
    KIDLEARN_V3_PROD_HANDOVER_3NI_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_HANDOVER_3NI_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Generate PROD release handover package.
 */
function kidlearnV3_generateProdReleaseHandoverPackage3NIV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdReleaseHandover3NIV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate PROD release handover package 3N-I vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var handoverId =
    kidlearnV3_3niMakeHandoverId_();

  var prodInfo =
    kidlearnV3_3niGetProdInfo_();

  var backupInfo =
    kidlearnV3_3niGetBackupInfo_();

  var approvalInfo =
    kidlearnV3_3niGetApprovalInfo_();

  var executionGateInfo =
    kidlearnV3_3niGetExecutionGateInfo_();

  var validationStatus =
    kidlearnV3_3niSafeCall_(
      'kidlearnV3_getProdPostDeployValidation3NGStatusV3'
    );

  var smokeStatus =
    kidlearnV3_3niSafeCall_(
      'kidlearnV3_getProdRuntimeSmokeTest3NHStatusV3'
    );

  var deployStatus =
    kidlearnV3_3niSafeCall_(
      'kidlearnV3_getControlledProdDeployment3NFStatusV3'
    );

  var prodFileCheck =
    kidlearnV3_3niCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodFileCheck.success) {
    errors.push(
      'PROD file không accessible khi generate handover: ' +
      prodFileCheck.message
    );
  }

  var backupCheck =
    kidlearnV3_3niCheckFileAccessible_(
      backupInfo.backupFileId,
      'BACKUP'
    );

  if (!backupCheck.success) {
    errors.push(
      'Backup file không accessible khi generate handover: ' +
      backupCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3niCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var finishedAt = new Date();

  var handover = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_RELEASE_HANDOVER_PACKAGE_3NI_V3',
    bundle: '3N-I',
    phase: KIDLEARN_V3_PROD_HANDOVER_3NI_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_HANDOVER_3NI_STATUS.PACKAGE_GENERATED
        : KIDLEARN_V3_PROD_HANDOVER_3NI_STATUS.FAILED,
    handoverId: handoverId,
    nextBundle:
      KIDLEARN_V3_PROD_HANDOVER_3NI_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_HANDOVER_3NI_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,

    releaseSummary: {
      releaseName: 'KIDLEARN V3 PROD Release Candidate',
      releaseStatus:
        errors.length === 0
          ? 'READY_FOR_FINAL_LOCK'
          : 'HOLD_HANDOVER_FAILED',
      appVersion:
        kidlearnV3_3niGetAppVersion_(),
      schemaVersion:
        kidlearnV3_3niGetSchemaVersion_(),
      environmentSource: 'DEV_CANDIDATE_TO_PROD_FILE',
      handoverMode: 'PACKAGE_ONLY'
    },

    prodFile: {
      prodFileId: prodInfo.prodFileId || '',
      prodFileName: prodInfo.prodFileName || '',
      prodFileUrl: prodInfo.prodFileUrl || '',
      deploymentId: prodInfo.deploymentId || '',
      accessible: prodFileCheck.success,
      checkedFileName: prodFileCheck.fileName || '',
      checkedFileUrl: prodFileCheck.fileUrl || ''
    },

    backupFile: {
      backupFileId: backupInfo.backupFileId || '',
      backupFileUrl: backupInfo.backupFileUrl || '',
      accessible: backupCheck.success,
      checkedFileName: backupCheck.fileName || '',
      checkedFileUrl: backupCheck.fileUrl || ''
    },

    approvals: {
      approvalId: approvalInfo.approvalId || '',
      approvalStatus: approvalInfo.status || '',
      lastApprovalAt: approvalInfo.lastApprovalAt || '',
      executionGateId: executionGateInfo.executionGateId || '',
      executionGateStatus: executionGateInfo.status || '',
      lastArmedAt: executionGateInfo.lastArmedAt || ''
    },

    validationAndSmoke: {
      deployment: deployStatus.summary,
      postDeployValidation: validationStatus.summary,
      runtimeSmoke: smokeStatus.summary
    },

    operationalReadiness: {
      safeWriteMode: safeModes.summary.safeWriteMode,
      safeWriteEnabled: safeModes.summary.safeWriteEnabled,
      controlledWriteStatus: safeModes.summary.controlledWriteStatus,
      prodRuntimeMode: 'READ_ONLY_UNTIL_PROD_WRITE_POLICY_DEFINED',
      childRolesSupported: [
        'CHILD',
        'FAMILY_ADMIN'
      ],
      prodFileTouchedBy3NI: false
    },

    handoverChecklist: [
      {
        item: '3N-H runtime smoke ready',
        passed:
          smokeStatus.summary.status === 'READY_FOR_3N_I'
      },
      {
        item: 'PROD file accessible',
        passed: prodFileCheck.success
      },
      {
        item: 'Backup file accessible',
        passed: backupCheck.success
      },
      {
        item: 'Post-deploy validation ready',
        passed:
          validationStatus.summary.status === 'READY_FOR_3N_H'
      },
      {
        item: 'Controlled deployment ready',
        passed:
          deployStatus.summary.status === 'READY_FOR_3N_G'
      },
      {
        item: 'Safe Write remains DRY_RUN/enabled=false',
        passed:
          safeModes.summary.safeWriteMode === 'DRY_RUN' &&
          safeModes.summary.safeWriteEnabled === false
      }
    ],

    releaseNotesForFamilyAdmin: [
      'KIDLEARN V3 PROD file đã được tạo từ DEV candidate backup.',
      'PROD file đã pass post-deploy validation.',
      'PROD runtime smoke test đã pass ở chế độ read-only.',
      'Hiện tại PROD write vẫn chưa mở.',
      'Vai trò hỗ trợ: CHILD và FAMILY_ADMIN.',
      'Bước tiếp theo là final lock 3N-J.'
    ],

    requiredBeforeRealProdUsage: [
      'Review URL PROD file.',
      'Xác nhận ai là FAMILY_ADMIN chính.',
      'Review dữ liệu thật trong DATA_Users, DATA_Children, DATA_UserChildAccess.',
      'Review master lessons/questions/content.',
      'Chỉ mở PROD write policy trong phase riêng sau khi có quyết định rõ ràng.'
    ],

    noSideEffect: {
      prodFileModifiedBy3NI: false,
      prodSheetCreatedBy3NI: false,
      prodSheetDeletedBy3NI: false,
      prodDataWrittenBy3NI: false
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

  kidlearnV3_3niSavePackage_(
    handover
  );

  kidlearnV3_3niSaveResult_(
    handover,
    handover.success
      ? KIDLEARN_V3_PROD_HANDOVER_3NI_STATUS.PACKAGE_GENERATED
      : KIDLEARN_V3_PROD_HANDOVER_3NI_STATUS.FAILED,
    KIDLEARN_V3_PROD_HANDOVER_3NI_KEYS.LAST_PACKAGE_AT
  );

  console.log(JSON.stringify(handover, null, 2));

  if (!handover.success) {
    throw new Error(
      '3N-I PROD release handover package failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return handover;
}


/**
 * Mark 3N-I ready.
 */
function kidlearnV3_markProdReleaseHandover3NIReadyV3() {
  var status =
    kidlearnV3_getProdReleaseHandover3NIStatusV3();

  var errors = [];

  if (
    status.status !==
      KIDLEARN_V3_PROD_HANDOVER_3NI_STATUS.PACKAGE_GENERATED &&
    status.status !==
      KIDLEARN_V3_PROD_HANDOVER_3NI_STATUS.READY_FOR_3N_J
  ) {
    errors.push(
      '3N-I chưa PACKAGE_GENERATED. Status=' +
      status.status
    );
  }

  if (
    !status.lastPackage ||
    status.lastPackage.success !== true
  ) {
    errors.push(
      'Last handover package chưa success=true.'
    );
  }

  var prodInfo =
    kidlearnV3_3niGetProdInfo_();

  var prodFileCheck =
    kidlearnV3_3niCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodFileCheck.success) {
    errors.push(
      'PROD file không còn accessible: ' +
      prodFileCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3niCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3N-I ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_RELEASE_HANDOVER_3NI_READY_V3',
    bundle: '3N-I',
    phase: KIDLEARN_V3_PROD_HANDOVER_3NI_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_HANDOVER_3NI_STATUS.READY_FOR_3N_J,
    handoverId: status.handoverId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_HANDOVER_3NI_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_HANDOVER_3NI_CONFIG.NEXT_STAGE,
    message:
      '3N-I ready. PROD release handover package đã được tạo. Bước tiếp theo là 3N-J final lock.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3niSaveResult_(
    result,
    KIDLEARN_V3_PROD_HANDOVER_3NI_STATUS.READY_FOR_3N_J,
    KIDLEARN_V3_PROD_HANDOVER_3NI_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3N-I status.
 */
function kidlearnV3_getProdReleaseHandover3NIStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_RELEASE_HANDOVER_3NI_STATUS_V3',
    bundle: '3N-I',
    phase: KIDLEARN_V3_PROD_HANDOVER_3NI_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_HANDOVER_3NI_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_HANDOVER_3NI_STATUS.NOT_RUN,
    handoverId:
      properties.getProperty(
        KIDLEARN_V3_PROD_HANDOVER_3NI_KEYS.HANDOVER_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_HANDOVER_3NI_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastPackageAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_HANDOVER_3NI_KEYS.LAST_PACKAGE_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_HANDOVER_3NI_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3niReadJsonProperty_(
        KIDLEARN_V3_PROD_HANDOVER_3NI_KEYS.LAST_RESULT_JSON
      ),
    lastPackage:
      kidlearnV3_3niReadJsonProperty_(
        KIDLEARN_V3_PROD_HANDOVER_3NI_KEYS.LAST_PACKAGE_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3N-I ready.
 */
function kidlearnV3_assertProdReleaseHandover3NIReadyV3() {
  var status =
    kidlearnV3_getProdReleaseHandover3NIStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_HANDOVER_3NI_STATUS.READY_FOR_3N_J
  ) {
    errors.push(
      '3N-I chưa READY_FOR_3N_J. Status=' +
      status.status
    );
  }

  var prodInfo =
    kidlearnV3_3niGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_RELEASE_HANDOVER_3NI_READY_V3',
    bundle: '3N-I',
    phase: KIDLEARN_V3_PROD_HANDOVER_3NI_CONFIG.PHASE,
    status: status.status,
    handoverId: status.handoverId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_HANDOVER_3NI_CONFIG.NEXT_BUNDLE,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3N-I chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3N-I.
 */
function kidlearnV3_getQaBatchSteps3NIV3() {
  return [
    {
      label: 'Assert 3N-H ready',
      functionName: 'kidlearnV3_assertProdRuntimeSmokeTest3NHReadyV3'
    },
    {
      label: 'Preview PROD Release Handover 3N-I',
      functionName: 'kidlearnV3_previewProdReleaseHandover3NIV3'
    },
    {
      label: 'Generate PROD Release Handover Package 3N-I',
      functionName: 'kidlearnV3_generateProdReleaseHandoverPackage3NIV3'
    },
    {
      label: 'Mark PROD Release Handover 3N-I Ready',
      functionName: 'kidlearnV3_markProdReleaseHandover3NIReadyV3'
    },
    {
      label: 'Assert PROD Release Handover 3N-I Ready',
      functionName: 'kidlearnV3_assertProdReleaseHandover3NIReadyV3'
    }
  ];
}


/**
 * QA batch 3N-I.
 */
function kidlearnV3_runQaBatch3NIV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3N_I_PROD_RELEASE_HANDOVER_PACKAGE',
    kidlearnV3_getQaBatchSteps3NIV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * PROD info từ 3N-F.
 */
function kidlearnV3_3niGetProdInfo_() {
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
function kidlearnV3_3niGetBackupInfo_() {
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
 * Approval info từ 3N-D.
 */
function kidlearnV3_3niGetApprovalInfo_() {
  if (
    typeof kidlearnV3_getProdDeploymentApprovalGate3NDStatusV3 !== 'function'
  ) {
    return {
      status: '',
      approvalId: '',
      lastApprovalAt: ''
    };
  }

  var status =
    kidlearnV3_getProdDeploymentApprovalGate3NDStatusV3();

  return {
    status: status.status || '',
    approvalId: status.approvalId || '',
    lastApprovalAt: status.lastApprovalAt || ''
  };
}


/**
 * Execution gate info từ 3N-E.
 */
function kidlearnV3_3niGetExecutionGateInfo_() {
  if (
    typeof kidlearnV3_getProdDeploymentExecutionGate3NEStatusV3 !== 'function'
  ) {
    return {
      status: '',
      executionGateId: '',
      lastArmedAt: ''
    };
  }

  var status =
    kidlearnV3_getProdDeploymentExecutionGate3NEStatusV3();

  return {
    status: status.status || '',
    executionGateId: status.executionGateId || '',
    lastArmedAt: status.lastArmedAt || ''
  };
}


/**
 * Check file accessible.
 */
function kidlearnV3_3niCheckFileAccessible_(fileId, label) {
  try {
    if (!fileId) {
      return {
        success: false,
        fileId: '',
        label: label || '',
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
function kidlearnV3_3niCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3niSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Safe Write trong DEV script phải DRY_RUN/enabled=false khi tạo handover. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var controlledWrite =
    kidlearnV3_3niControlledWriteStatus_();

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
function kidlearnV3_3niSafeCall_(functionName) {
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
        kidlearnV3_3niSummarizeStatusOutput_(
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
function kidlearnV3_3niSummarizeStatusOutput_(output) {
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
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0
  };
}


/**
 * Safe assert.
 */
function kidlearnV3_3niSafeAssert_(functionName, label) {
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
function kidlearnV3_3niSafeWriteStatus_() {
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
function kidlearnV3_3niControlledWriteStatus_() {
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
function kidlearnV3_3niCheckFunctions_(names) {
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
function kidlearnV3_3niGetAppVersion_() {
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
function kidlearnV3_3niGetSchemaVersion_() {
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
 * Handover ID.
 */
function kidlearnV3_3niMakeHandoverId_() {
  return (
    'PROD_HANDOVER_3NI_' +
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
function kidlearnV3_3niSavePackage_(handover) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_HANDOVER_3NI_KEYS.HANDOVER_ID,
    handover.handoverId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_HANDOVER_3NI_KEYS.LAST_PACKAGE_JSON,
    JSON.stringify(handover)
  );
}


/**
 * Save result.
 */
function kidlearnV3_3niSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_HANDOVER_3NI_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_HANDOVER_3NI_STATUS.READY_FOR_3N_J &&
    (
      status === KIDLEARN_V3_PROD_HANDOVER_3NI_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_HANDOVER_3NI_STATUS.PACKAGE_GENERATED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_HANDOVER_3NI_STATUS.READY_FOR_3N_J;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_HANDOVER_3NI_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_HANDOVER_3NI_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      handoverId: result.handoverId || '',
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
function kidlearnV3_3niReadJsonProperty_(key) {
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