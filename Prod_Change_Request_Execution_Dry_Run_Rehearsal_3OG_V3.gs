/**
 * ================================================================
 * KIDLEARN V3 - PROD CHANGE REQUEST EXECUTION DRY-RUN REHEARSAL
 * Bundle: 3O-G
 * Version: 3.1.0
 * ================================================================
 *
 * 3O-G:
 * - Diễn tập controlled execution ở chế độ DRY_RUN.
 * - Không execute request thật.
 * - Không mở PROD write.
 * - Không ghi vào PROD file.
 * - Không migration.
 * - Không rollback.
 * - Không tạo/xóa sheet.
 * - Chỉ ghi ScriptProperties trong DEV script để lưu rehearsal/status.
 */


var KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3OG_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3OG_LAST_PREVIEW_AT',
  LAST_PACKAGE_AT: 'KIDLEARN_V3_PHASE_3OG_LAST_PACKAGE_AT',
  LAST_REHEARSAL_AT: 'KIDLEARN_V3_PHASE_3OG_LAST_REHEARSAL_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3OG_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3OG_LAST_RESULT_JSON',
  LAST_PACKAGE_JSON: 'KIDLEARN_V3_PHASE_3OG_LAST_PACKAGE_JSON',
  LAST_REHEARSAL_JSON: 'KIDLEARN_V3_PHASE_3OG_LAST_REHEARSAL_JSON',
  DRYRUN_ID: 'KIDLEARN_V3_PHASE_3OG_DRYRUN_ID'
};


var KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  PACKAGE_GENERATED: 'PACKAGE_GENERATED',
  REHEARSAL_PASSED: 'REHEARSAL_PASSED',
  READY_FOR_3O_H: 'READY_FOR_3O_H',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_CR_DRYRUN_3OG_CONFIG = {
  VERSION: '3O-G',
  PHASE: '3O-G',
  NEXT_BUNDLE: '3O-H',
  NEXT_STAGE: 'PROD_CHANGE_REQUEST_EXECUTION_DECISION_GATE',
  WRITE_MODE: 'CHANGE_REQUEST_EXECUTION_DRY_RUN_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  DRY_RUN_ONLY: true,
  TARGET_NO_WRITE_SHEETS: [
    'LOG_Audit',
    'DATA_Users',
    'DATA_Children',
    'DATA_UserChildAccess',
    'MST_Lessons',
    'MST_LessonBlocks',
    'MST_Activities',
    'MST_Questions',
    'MST_QuestionOptions',
    'DATA_StudySessions',
    'DATA_LessonProgress',
    'DATA_DailyGoals',
    'DATA_Responses'
  ]
};


/**
 * Preview 3O-G.
 */
function kidlearnV3_previewProdChangeRequestExecutionDryRun3OGV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3ogCheckFunctions_([
      'kidlearnV3_assertProdChangeRequestControlledExecutionGate3OFReadyV3',
      'kidlearnV3_getProdChangeRequestControlledExecutionGate3OFStatusV3',
      'kidlearnV3_getProdChangeRequestImplementationPlanning3OEStatusV3',
      'kidlearnV3_getProdChangeRequestApprovalGate3ODStatusV3',
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3OF =
    kidlearnV3_3ogSafeAssert_(
      'kidlearnV3_assertProdChangeRequestControlledExecutionGate3OFReadyV3',
      '3O-F'
    );

  if (!phase3OF.success) {
    errors.push(
      '3O-F chưa READY_FOR_3O_G: ' +
      phase3OF.message
    );
  }

  var executionGate =
    kidlearnV3_3ogSafeCall_(
      'kidlearnV3_getProdChangeRequestControlledExecutionGate3OFStatusV3'
    );

  if (
    executionGate.summary.status &&
    executionGate.summary.status !== 'READY_FOR_3O_G'
  ) {
    errors.push(
      '3O-F controlled execution gate chưa READY_FOR_3O_G. Status=' +
      executionGate.summary.status
    );
  }

  var planning =
    kidlearnV3_3ogSafeCall_(
      'kidlearnV3_getProdChangeRequestImplementationPlanning3OEStatusV3'
    );

  if (
    planning.summary.status &&
    planning.summary.status !== 'READY_FOR_3O_F'
  ) {
    errors.push(
      '3O-E planning chưa READY_FOR_3O_F. Status=' +
      planning.summary.status
    );
  }

  var finalLock =
    kidlearnV3_3ogSafeCall_(
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3'
    );

  if (
    finalLock.summary.status &&
    finalLock.summary.status !== 'PROD_RELEASE_LOCKED'
  ) {
    errors.push(
      '3N-J chưa PROD_RELEASE_LOCKED. Status=' +
      finalLock.summary.status
    );
  }

  var prodInfo =
    kidlearnV3_3ogGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodCheck =
    kidlearnV3_3ogCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file chưa accessible: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3ogCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_CHANGE_REQUEST_EXECUTION_DRY_RUN_3OG_V3',
    bundle: '3O-G',
    phase: KIDLEARN_V3_PROD_CR_DRYRUN_3OG_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_CR_DRYRUN_3OG_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_CR_DRYRUN_3OG_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_CR_DRYRUN_3OG_CONFIG.WRITE_MODE,
    dryRunOnly: true,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    changeRequestExecutedNow: false,
    prodWritePolicyOpenedNow: false,
    rollbackExecutedNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3OF: phase3OF,
    executionGate: executionGate.summary,
    planning: planning.summary,
    finalLock: finalLock.summary,
    prodInfo: prodInfo,
    prodCheck: prodCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3O-G chỉ diễn tập execution dry-run. Không ghi PROD và không execute request thật.'
  };

  kidlearnV3_3ogSaveResult_(
    result,
    KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Generate execution dry-run package.
 */
function kidlearnV3_generateProdChangeRequestExecutionDryRunPackage3OGV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdChangeRequestExecutionDryRun3OGV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate dry-run package 3O-G vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var dryRunId =
    kidlearnV3_3ogMakeDryRunId_();

  var prodInfo =
    kidlearnV3_3ogGetProdInfo_();

  var executionGate =
    kidlearnV3_3ogSafeCall_(
      'kidlearnV3_getProdChangeRequestControlledExecutionGate3OFStatusV3'
    );

  var planning =
    kidlearnV3_3ogSafeCall_(
      'kidlearnV3_getProdChangeRequestImplementationPlanning3OEStatusV3'
    );

  var approvalGate =
    kidlearnV3_3ogSafeCall_(
      'kidlearnV3_getProdChangeRequestApprovalGate3ODStatusV3'
    );

  var workflow =
    kidlearnV3_3ogSafeCall_(
      'kidlearnV3_getProdChangeRequestWorkflow3OCStatusV3'
    );

  var finalLock =
    kidlearnV3_3ogSafeCall_(
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3'
    );

  var prodCheck =
    kidlearnV3_3ogCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi generate dry-run package: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3ogCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var scenarios =
    kidlearnV3_3ogBuildDryRunScenarios_();

  var finishedAt = new Date();

  var dryRunPackage = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_CHANGE_REQUEST_EXECUTION_DRY_RUN_PACKAGE_3OG_V3',
    bundle: '3O-G',
    phase: KIDLEARN_V3_PROD_CR_DRYRUN_3OG_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.PACKAGE_GENERATED
        : KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.FAILED,
    dryRunId: dryRunId,
    nextBundle:
      KIDLEARN_V3_PROD_CR_DRYRUN_3OG_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_DRYRUN_3OG_CONFIG.NEXT_STAGE,
    dryRunOnly: true,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    changeRequestExecutedNow: false,
    prodWritePolicyOpenedNow: false,
    rollbackExecutedNow: false,

    prodReference: {
      prodFileId: prodInfo.prodFileId || '',
      prodFileUrl: prodInfo.prodFileUrl || '',
      prodFileName: prodInfo.prodFileName || '',
      deploymentId: prodInfo.deploymentId || '',
      accessible: prodCheck.success
    },

    upstreamReadiness: {
      executionGate3OF: executionGate.summary,
      planning3OE: planning.summary,
      approvalGate3OD: approvalGate.summary,
      workflow3OC: workflow.summary,
      finalLock3NJ: finalLock.summary
    },

    dryRunPolicy: {
      mode: 'DRY_RUN_ONLY',
      allowProdWrite: false,
      allowRequestExecution: false,
      allowRollback: false,
      allowMigration: false,
      allowSheetCreateDelete: false,
      selectedRequestRequiredBeforeActualExecution: true,
      actualExecutionRequiresNextGate: true
    },

    rehearsalScenarios: scenarios,

    dryRunChecklist: [
      {
        item: '3O-F execution gate ready',
        passed:
          executionGate.summary.status === 'READY_FOR_3O_G'
      },
      {
        item: '3O-E planning ready',
        passed:
          planning.summary.status === 'READY_FOR_3O_F'
      },
      {
        item: 'PROD release remains locked',
        passed:
          finalLock.summary.status === 'PROD_RELEASE_LOCKED'
      },
      {
        item: 'PROD file accessible',
        passed: prodCheck.success
      },
      {
        item: 'Safe Write remains DRY_RUN/enabled=false',
        passed:
          safeModes.summary.safeWriteMode === 'DRY_RUN' &&
          safeModes.summary.safeWriteEnabled === false
      },
      {
        item: 'Dry-run scenarios available',
        passed:
          scenarios.scenarioCount > 0
      },
      {
        item: 'No PROD write in 3O-G',
        passed: true
      },
      {
        item: 'No request execution in 3O-G',
        passed: true
      }
    ],

    noSideEffect: {
      prodFileModifiedBy3OG: false,
      prodDataWrittenBy3OG: false,
      prodSheetCreatedBy3OG: false,
      prodSheetDeletedBy3OG: false,
      requestExecutedBy3OG: false,
      prodWritePolicyOpenedBy3OG: false,
      rollbackExecutedBy3OG: false
    },

    safeModes: safeModes.summary,

    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() - startedAt.getTime(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_3ogSavePackage_(
    dryRunPackage
  );

  kidlearnV3_3ogSaveResult_(
    dryRunPackage,
    dryRunPackage.success
      ? KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.PACKAGE_GENERATED
      : KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.FAILED,
    KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS.LAST_PACKAGE_AT
  );

  console.log(JSON.stringify(dryRunPackage, null, 2));

  if (!dryRunPackage.success) {
    throw new Error(
      '3O-G dry-run package failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return dryRunPackage;
}


/**
 * Run execution dry-run rehearsal.
 *
 * Chỉ simulation:
 * - Không ghi PROD.
 * - Không execute request.
 * - Không mở PROD write.
 */
function kidlearnV3_runProdChangeRequestExecutionDryRunRehearsal3OGV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var status =
    kidlearnV3_getProdChangeRequestExecutionDryRun3OGStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.PACKAGE_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.REHEARSAL_PASSED &&
    status.status !== KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.READY_FOR_3O_H
  ) {
    errors.push(
      '3O-G cần PACKAGE_GENERATED trước khi chạy rehearsal. Status=' +
      status.status
    );
  }

  if (
    !status.lastPackage ||
    status.lastPackage.success !== true
  ) {
    errors.push(
      'Last dry-run package chưa success=true.'
    );
  }

  var prodInfo =
    kidlearnV3_3ogGetProdInfo_();

  var prodCheck =
    kidlearnV3_3ogCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi rehearsal: ' +
      prodCheck.message
    );
  }

  var prodSpreadsheet = null;

  if (prodInfo.prodFileId) {
    prodSpreadsheet =
      SpreadsheetApp.openById(
        prodInfo.prodFileId
      );
  }

  var beforeSnapshot =
    prodSpreadsheet
      ? kidlearnV3_3ogSnapshotRowCounts_(
          prodSpreadsheet,
          KIDLEARN_V3_PROD_CR_DRYRUN_3OG_CONFIG.TARGET_NO_WRITE_SHEETS
        )
      : {
          items: []
        };

  var safeModes =
    kidlearnV3_3ogCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var scenarios =
    kidlearnV3_3ogBuildDryRunScenarios_();

  var rehearsalItems = [];

  for (var i = 0; i < scenarios.items.length; i++) {
    var item =
      kidlearnV3_3ogRehearseScenario_(
        scenarios.items[i]
      );

    rehearsalItems.push(item);

    errors =
      errors.concat(
        item.errors || []
      );

    warnings =
      warnings.concat(
        item.warnings || []
      );
  }

  var policyCheck =
    kidlearnV3_3ogValidateDryRunPolicy_(
      rehearsalItems
    );

  errors = errors.concat(policyCheck.errors);
  warnings = warnings.concat(policyCheck.warnings);

  SpreadsheetApp.flush();

  var afterSnapshot =
    prodSpreadsheet
      ? kidlearnV3_3ogSnapshotRowCounts_(
          prodSpreadsheet,
          KIDLEARN_V3_PROD_CR_DRYRUN_3OG_CONFIG.TARGET_NO_WRITE_SHEETS
        )
      : {
          items: []
        };

  var noWriteCheck =
    kidlearnV3_3ogCompareRowCountSnapshots_(
      beforeSnapshot,
      afterSnapshot
    );

  errors = errors.concat(noWriteCheck.errors);
  warnings = warnings.concat(noWriteCheck.warnings);

  var finishedAt = new Date();

  var rehearsal = {
    success: errors.length === 0,
    action: 'RUN_PROD_CHANGE_REQUEST_EXECUTION_DRY_RUN_REHEARSAL_3OG_V3',
    bundle: '3O-G',
    phase: KIDLEARN_V3_PROD_CR_DRYRUN_3OG_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.REHEARSAL_PASSED
        : KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.FAILED,
    dryRunId: status.dryRunId || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_DRYRUN_3OG_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_DRYRUN_3OG_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    dryRunOnly: true,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    changeRequestExecutedNow: false,
    prodWritePolicyOpenedNow: false,
    rollbackExecutedNow: false,

    rehearsalSummary: {
      scenarioCount: scenarios.scenarioCount,
      rehearsedCount: rehearsalItems.length,
      policyCheck: policyCheck.summary,
      noWriteCheck: noWriteCheck.summary,
      safeModes: safeModes.summary
    },

    rehearsalItems: rehearsalItems,

    rehearsalDecision:
      errors.length === 0
        ? 'READY_FOR_EXECUTION_DECISION_GATE_3O_H'
        : 'HOLD_DRY_RUN_REHEARSAL_FAILED',

    noSideEffect: {
      prodFileModifiedBy3OG: false,
      prodDataWrittenBy3OG: false,
      prodSheetCreatedBy3OG: false,
      prodSheetDeletedBy3OG: false,
      requestExecutedBy3OG: false,
      prodWritePolicyOpenedBy3OG: false,
      rollbackExecutedBy3OG: false
    },

    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() - startedAt.getTime(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_3ogSaveRehearsal_(
    rehearsal
  );

  kidlearnV3_3ogSaveResult_(
    rehearsal,
    rehearsal.success
      ? KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.REHEARSAL_PASSED
      : KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.FAILED,
    KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS.LAST_REHEARSAL_AT
  );

  console.log(JSON.stringify(rehearsal, null, 2));

  if (!rehearsal.success) {
    throw new Error(
      '3O-G dry-run rehearsal failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return rehearsal;
}


/**
 * Mark 3O-G ready.
 */
function kidlearnV3_markProdChangeRequestExecutionDryRun3OGReadyV3() {
  var status =
    kidlearnV3_getProdChangeRequestExecutionDryRun3OGStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.REHEARSAL_PASSED &&
    status.status !== KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.READY_FOR_3O_H
  ) {
    errors.push(
      '3O-G chưa REHEARSAL_PASSED. Status=' +
      status.status
    );
  }

  if (
    !status.lastPackage ||
    status.lastPackage.success !== true
  ) {
    errors.push(
      'Last dry-run package chưa success=true.'
    );
  }

  if (
    !status.lastRehearsal ||
    status.lastRehearsal.success !== true
  ) {
    errors.push(
      'Last rehearsal chưa success=true.'
    );
  }

  if (!status.dryRunId) {
    errors.push(
      'Thiếu dryRunId.'
    );
  }

  var prodInfo =
    kidlearnV3_3ogGetProdInfo_();

  var prodCheck =
    kidlearnV3_3ogCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi mark ready: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3ogCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3O-G ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_CHANGE_REQUEST_EXECUTION_DRY_RUN_3OG_READY_V3',
    bundle: '3O-G',
    phase: KIDLEARN_V3_PROD_CR_DRYRUN_3OG_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.READY_FOR_3O_H,
    dryRunId: status.dryRunId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_DRYRUN_3OG_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_DRYRUN_3OG_CONFIG.NEXT_STAGE,
    dryRunOnly: true,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    changeRequestExecutedNow: false,
    prodWritePolicyOpenedNow: false,
    rollbackExecutedNow: false,
    message:
      '3O-G ready. Execution dry-run rehearsal đã pass. Bước tiếp theo là 3O-H execution decision gate.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3ogSaveResult_(
    result,
    KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.READY_FOR_3O_H,
    KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3O-G status.
 */
function kidlearnV3_getProdChangeRequestExecutionDryRun3OGStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_CHANGE_REQUEST_EXECUTION_DRY_RUN_3OG_STATUS_V3',
    bundle: '3O-G',
    phase: KIDLEARN_V3_PROD_CR_DRYRUN_3OG_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.NOT_RUN,
    dryRunId:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS.DRYRUN_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastPackageAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS.LAST_PACKAGE_AT
      ) ||
      '',
    lastRehearsalAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS.LAST_REHEARSAL_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3ogReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS.LAST_RESULT_JSON
      ),
    lastPackage:
      kidlearnV3_3ogReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS.LAST_PACKAGE_JSON
      ),
    lastRehearsal:
      kidlearnV3_3ogReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS.LAST_REHEARSAL_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3O-G ready.
 */
function kidlearnV3_assertProdChangeRequestExecutionDryRun3OGReadyV3() {
  var status =
    kidlearnV3_getProdChangeRequestExecutionDryRun3OGStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.READY_FOR_3O_H
  ) {
    errors.push(
      '3O-G chưa READY_FOR_3O_H. Status=' +
      status.status
    );
  }

  if (!status.dryRunId) {
    errors.push(
      'Thiếu dryRunId.'
    );
  }

  var prodInfo =
    kidlearnV3_3ogGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_CHANGE_REQUEST_EXECUTION_DRY_RUN_3OG_READY_V3',
    bundle: '3O-G',
    phase: KIDLEARN_V3_PROD_CR_DRYRUN_3OG_CONFIG.PHASE,
    status: status.status,
    dryRunId: status.dryRunId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_DRYRUN_3OG_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3O-G chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3O-G.
 */
function kidlearnV3_getQaBatchSteps3OGV3() {
  return [
    {
      label: 'Assert 3O-F ready',
      functionName: 'kidlearnV3_assertProdChangeRequestControlledExecutionGate3OFReadyV3'
    },
    {
      label: 'Preview PROD CR Execution Dry-run 3O-G',
      functionName: 'kidlearnV3_previewProdChangeRequestExecutionDryRun3OGV3'
    },
    {
      label: 'Generate PROD CR Execution Dry-run Package 3O-G',
      functionName: 'kidlearnV3_generateProdChangeRequestExecutionDryRunPackage3OGV3'
    },
    {
      label: 'Run PROD CR Execution Dry-run Rehearsal 3O-G',
      functionName: 'kidlearnV3_runProdChangeRequestExecutionDryRunRehearsal3OGV3'
    },
    {
      label: 'Mark PROD CR Execution Dry-run 3O-G Ready',
      functionName: 'kidlearnV3_markProdChangeRequestExecutionDryRun3OGReadyV3'
    },
    {
      label: 'Assert PROD CR Execution Dry-run 3O-G Ready',
      functionName: 'kidlearnV3_assertProdChangeRequestExecutionDryRun3OGReadyV3'
    }
  ];
}


/**
 * QA batch 3O-G.
 */
function kidlearnV3_runQaBatch3OGV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3O_G_PROD_CHANGE_REQUEST_EXECUTION_DRY_RUN_REHEARSAL',
    kidlearnV3_getQaBatchSteps3OGV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build dry-run scenarios.
 */
function kidlearnV3_3ogBuildDryRunScenarios_() {
  var items = [
    {
      scenarioId: 'DRYRUN_3OG_DATA_FIX',
      requestType: 'DATA_FIX',
      riskLevel: 'MEDIUM',
      executionMode: 'DRY_RUN_VALIDATE_ROWS_ONLY',
      impactedSheets: [
        'DATA_Users',
        'DATA_Children',
        'DATA_UserChildAccess'
      ],
      prodWriteRequiredForActual: true,
      allowActualExecutionNow: false,
      allowProdWriteNow: false,
      allowRollbackNow: false,
      requiredBeforeActual: [
        'Selected requestId',
        'Affected row list',
        'Backup affected rows',
        'Reference validation',
        'Explicit execution approval'
      ]
    },
    {
      scenarioId: 'DRYRUN_3OG_CONTENT_UPDATE',
      requestType: 'CONTENT_UPDATE',
      riskLevel: 'MEDIUM',
      executionMode: 'DRY_RUN_CONTENT_PATCH_PLAN_ONLY',
      impactedSheets: [
        'MST_Lessons',
        'MST_LessonBlocks',
        'MST_Activities',
        'MST_Questions',
        'MST_QuestionOptions'
      ],
      prodWriteRequiredForActual: false,
      allowActualExecutionNow: false,
      allowProdWriteNow: false,
      allowRollbackNow: false,
      requiredBeforeActual: [
        'DEV content update',
        'Content QA',
        'New release or content patch gate',
        'Explicit execution approval'
      ]
    },
    {
      scenarioId: 'DRYRUN_3OG_UI_FIX',
      requestType: 'UI_FIX',
      riskLevel: 'MEDIUM',
      executionMode: 'DRY_RUN_UI_RELEASE_PLAN_ONLY',
      impactedSheets: [],
      prodWriteRequiredForActual: false,
      allowActualExecutionNow: false,
      allowProdWriteNow: false,
      allowRollbackNow: false,
      requiredBeforeActual: [
        'DEV UI fix',
        'UI QA',
        'Deployment package',
        'Release approval'
      ]
    },
    {
      scenarioId: 'DRYRUN_3OG_PERFORMANCE_FIX',
      requestType: 'PERFORMANCE_FIX',
      riskLevel: 'MEDIUM',
      executionMode: 'DRY_RUN_PERFORMANCE_RELEASE_PLAN_ONLY',
      impactedSheets: [],
      prodWriteRequiredForActual: false,
      allowActualExecutionNow: false,
      allowProdWriteNow: false,
      allowRollbackNow: false,
      requiredBeforeActual: [
        'Performance baseline',
        'Optimization QA',
        'Runtime smoke',
        'Release approval'
      ]
    },
    {
      scenarioId: 'DRYRUN_3OG_PROD_WRITE_POLICY_REQUEST',
      requestType: 'PROD_WRITE_POLICY_REQUEST',
      riskLevel: 'HIGH',
      executionMode: 'DRY_RUN_WRITE_POLICY_RISK_REVIEW_ONLY',
      impactedSheets: [
        'LOG_Audit',
        'DATA_StudySessions',
        'DATA_LessonProgress',
        'DATA_DailyGoals',
        'DATA_Responses'
      ],
      prodWriteRequiredForActual: true,
      allowActualExecutionNow: false,
      allowProdWriteNow: false,
      allowRollbackNow: false,
      requiredBeforeActual: [
        'Dedicated PROD write policy approval',
        'One-row write trial plan',
        'Rollback token',
        'Post-write validation plan',
        'Explicit execution approval'
      ]
    },
    {
      scenarioId: 'DRYRUN_3OG_NEW_RELEASE_REQUEST',
      requestType: 'NEW_RELEASE_REQUEST',
      riskLevel: 'HIGH',
      executionMode: 'DRY_RUN_NEW_RELEASE_PIPELINE_ONLY',
      impactedSheets: [
        'MULTIPLE'
      ],
      prodWriteRequiredForActual: false,
      allowActualExecutionNow: false,
      allowProdWriteNow: false,
      allowRollbackNow: false,
      requiredBeforeActual: [
        'New DEV candidate',
        'Backup candidate',
        'Dry-run deployment rehearsal',
        'Approval gate',
        'Controlled deployment'
      ]
    }
  ];

  return {
    scenarioCount: items.length,
    items: items
  };
}


/**
 * Rehearse one scenario.
 */
function kidlearnV3_3ogRehearseScenario_(scenario) {
  var errors = [];
  var warnings = [];

  if (!scenario.scenarioId) {
    errors.push('Scenario thiếu scenarioId.');
  }

  if (!scenario.requestType) {
    errors.push('Scenario thiếu requestType.');
  }

  if (!scenario.executionMode) {
    errors.push(
      'Scenario thiếu executionMode: ' +
      scenario.scenarioId
    );
  }

  if (scenario.allowActualExecutionNow === true) {
    errors.push(
      '3O-G không được allowActualExecutionNow=true: ' +
      scenario.scenarioId
    );
  }

  if (scenario.allowProdWriteNow === true) {
    errors.push(
      '3O-G không được allowProdWriteNow=true: ' +
      scenario.scenarioId
    );
  }

  if (scenario.allowRollbackNow === true) {
    errors.push(
      '3O-G không được allowRollbackNow=true: ' +
      scenario.scenarioId
    );
  }

  if (
    !scenario.requiredBeforeActual ||
    !Array.isArray(scenario.requiredBeforeActual) ||
    scenario.requiredBeforeActual.length < 1
  ) {
    errors.push(
      'Scenario thiếu requiredBeforeActual: ' +
      scenario.scenarioId
    );
  }

  if (
    scenario.riskLevel === 'HIGH' &&
    scenario.requiredBeforeActual.length < 4
  ) {
    errors.push(
      'High-risk scenario cần requiredBeforeActual chi tiết hơn: ' +
      scenario.scenarioId
    );
  }

  return {
    success: errors.length === 0,
    scenarioId: scenario.scenarioId || '',
    requestType: scenario.requestType || '',
    riskLevel: scenario.riskLevel || '',
    executionMode: scenario.executionMode || '',
    dryRunOnly: true,
    prodWriteRequiredForActual:
      scenario.prodWriteRequiredForActual === true,
    allowActualExecutionNow:
      scenario.allowActualExecutionNow === true,
    allowProdWriteNow:
      scenario.allowProdWriteNow === true,
    allowRollbackNow:
      scenario.allowRollbackNow === true,
    rehearsalDecision:
      errors.length === 0
        ? 'DRY_RUN_REHEARSAL_ACCEPTED'
        : 'DRY_RUN_REHEARSAL_REJECTED',
    nextRequiredBeforeActual:
      scenario.requiredBeforeActual || [],
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Validate dry-run policy.
 */
function kidlearnV3_3ogValidateDryRunPolicy_(items) {
  var errors = [];
  var warnings = [];

  for (var i = 0; i < items.length; i++) {
    var item =
      items[i];

    if (item.dryRunOnly !== true) {
      errors.push(
        'Policy violation: dryRunOnly phải true. Scenario=' +
        item.scenarioId
      );
    }

    if (item.allowActualExecutionNow === true) {
      errors.push(
        'Policy violation: scenario đang cho execute thật. Scenario=' +
        item.scenarioId
      );
    }

    if (item.allowProdWriteNow === true) {
      errors.push(
        'Policy violation: scenario đang cho mở PROD write. Scenario=' +
        item.scenarioId
      );
    }

    if (item.allowRollbackNow === true) {
      errors.push(
        'Policy violation: scenario đang cho rollback. Scenario=' +
        item.scenarioId
      );
    }
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    summary: {
      checkedScenarioCount: items.length,
      dryRunOnlyCount:
        items.filter(function(item) {
          return item.dryRunOnly === true;
        }).length,
      actualExecutionAllowedCount:
        items.filter(function(item) {
          return item.allowActualExecutionNow === true;
        }).length,
      prodWriteAllowedCount:
        items.filter(function(item) {
          return item.allowProdWriteNow === true;
        }).length,
      rollbackAllowedCount:
        items.filter(function(item) {
          return item.allowRollbackNow === true;
        }).length
    }
  };
}


/**
 * Snapshot row counts.
 */
function kidlearnV3_3ogSnapshotRowCounts_(spreadsheet, sheetNames) {
  var items = [];

  for (var i = 0; i < sheetNames.length; i++) {
    var sheetName =
      sheetNames[i];

    var sheet =
      kidlearnV3_3ogGetSheet_(
        spreadsheet,
        sheetName
      );

    items.push({
      sheetName: sheetName,
      exists: sheet ? true : false,
      lastRow: sheet ? sheet.getLastRow() : 0,
      lastColumn: sheet ? sheet.getLastColumn() : 0
    });
  }

  return {
    capturedAt:
      new Date().toISOString(),
    items: items
  };
}


/**
 * Compare row count snapshots.
 */
function kidlearnV3_3ogCompareRowCountSnapshots_(beforeSnapshot, afterSnapshot) {
  var errors = [];
  var warnings = [];

  var beforeMap =
    kidlearnV3_3ogMapSnapshots_(
      beforeSnapshot.items || []
    );

  var afterMap =
    kidlearnV3_3ogMapSnapshots_(
      afterSnapshot.items || []
    );

  var compared = [];

  for (var sheetName in beforeMap) {
    if (!beforeMap.hasOwnProperty(sheetName)) {
      continue;
    }

    var before =
      beforeMap[sheetName];

    var after =
      afterMap[sheetName] || {
        exists: false,
        lastRow: 0,
        lastColumn: 0
      };

    var changed =
      before.exists !== after.exists ||
      before.lastRow !== after.lastRow ||
      before.lastColumn !== after.lastColumn;

    compared.push({
      sheetName: sheetName,
      beforeLastRow: before.lastRow,
      afterLastRow: after.lastRow,
      beforeLastColumn: before.lastColumn,
      afterLastColumn: after.lastColumn,
      changed: changed
    });

    if (changed) {
      errors.push(
        'PROD sheet thay đổi trong 3O-G dry-run rehearsal: ' +
        sheetName +
        '. beforeRow=' +
        before.lastRow +
        ', afterRow=' +
        after.lastRow +
        ', beforeCol=' +
        before.lastColumn +
        ', afterCol=' +
        after.lastColumn
      );
    }
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    compared: compared,
    summary: {
      checkedSheetCount: compared.length,
      changedSheetCount:
        compared.filter(function(item) {
          return item.changed;
        }).length,
      readOnlyConfirmed:
        errors.length === 0
    }
  };
}


/**
 * Map snapshots.
 */
function kidlearnV3_3ogMapSnapshots_(items) {
  var map = {};

  for (var i = 0; i < items.length; i++) {
    map[items[i].sheetName] = items[i];
  }

  return map;
}


/**
 * PROD info từ 3N-F.
 */
function kidlearnV3_3ogGetProdInfo_() {
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
 * Check file accessible.
 */
function kidlearnV3_3ogCheckFileAccessible_(fileId, label) {
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
function kidlearnV3_3ogCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3ogSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Safe Write trong DEV script phải DRY_RUN/enabled=false. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var controlledWrite =
    kidlearnV3_3ogControlledWriteStatus_();

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
 * Get exact sheet.
 */
function kidlearnV3_3ogGetSheet_(spreadsheet, sheetName) {
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
function kidlearnV3_3ogSafeAssert_(functionName, label) {
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
 * Safe call.
 */
function kidlearnV3_3ogSafeCall_(functionName) {
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
        kidlearnV3_3ogSummarizeStatusOutput_(
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
function kidlearnV3_3ogSummarizeStatusOutput_(output) {
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
    executionGateId: output.executionGateId || '',
    planId: output.planId || '',
    approvalGateId: output.approvalGateId || '',
    workflowId: output.workflowId || '',
    finalLockId: output.finalLockId || '',
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0
  };
}


/**
 * Safe Write status.
 */
function kidlearnV3_3ogSafeWriteStatus_() {
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
function kidlearnV3_3ogControlledWriteStatus_() {
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
function kidlearnV3_3ogCheckFunctions_(names) {
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
 * Dry-run ID.
 */
function kidlearnV3_3ogMakeDryRunId_() {
  return (
    'PROD_CR_DRYRUN_3OG_' +
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
function kidlearnV3_3ogSavePackage_(dryRunPackage) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS.DRYRUN_ID,
    dryRunPackage.dryRunId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS.LAST_PACKAGE_JSON,
    JSON.stringify(dryRunPackage)
  );
}


/**
 * Save rehearsal.
 */
function kidlearnV3_3ogSaveRehearsal_(rehearsal) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS.LAST_REHEARSAL_JSON,
      JSON.stringify(rehearsal)
    );
}


/**
 * Save result.
 */
function kidlearnV3_3ogSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.READY_FOR_3O_H &&
    (
      status === KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.PACKAGE_GENERATED ||
      status === KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.REHEARSAL_PASSED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_CR_DRYRUN_3OG_STATUS.READY_FOR_3O_H;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_DRYRUN_3OG_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      dryRunId: result.dryRunId || '',
      prodFileId: result.prodFileId || '',
      prodFileUrl: result.prodFileUrl || '',
      dryRunOnly: true,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
      changeRequestExecutedNow: false,
      prodWritePolicyOpenedNow: false,
      rollbackExecutedNow: false,
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
function kidlearnV3_3ogReadJsonProperty_(key) {
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