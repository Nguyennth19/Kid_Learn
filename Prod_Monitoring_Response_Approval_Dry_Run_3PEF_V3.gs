/**
 * ================================================================
 * KIDLEARN V3 - PROD MONITORING RESPONSE APPROVAL GATE
 * + DRY-RUN REHEARSAL
 * Bundle: 3P-EF
 * Version: 3.1.0
 * ================================================================
 *
 * 3P-EF:
 * - Gộp 3P-E và 3P-F để tối ưu số bước.
 * - 3P-E: response approval gate.
 * - 3P-F: response dry-run rehearsal.
 *
 * Safety:
 * - Không ghi PROD.
 * - Không append LOG_Audit.
 * - Không rollback.
 * - Không deploy.
 * - Không mở PROD write.
 * - Không execute incident remediation thật.
 * - Chỉ ghi DEV ScriptProperties để lưu approval/rehearsal/status.
 */


var KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3PEF_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3PEF_LAST_PREVIEW_AT',
  LAST_PACKAGE_AT: 'KIDLEARN_V3_PHASE_3PEF_LAST_PACKAGE_AT',
  LAST_APPROVAL_AT: 'KIDLEARN_V3_PHASE_3PEF_LAST_APPROVAL_AT',
  LAST_REHEARSAL_AT: 'KIDLEARN_V3_PHASE_3PEF_LAST_REHEARSAL_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3PEF_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3PEF_LAST_RESULT_JSON',
  LAST_PACKAGE_JSON: 'KIDLEARN_V3_PHASE_3PEF_LAST_PACKAGE_JSON',
  LAST_APPROVAL_JSON: 'KIDLEARN_V3_PHASE_3PEF_LAST_APPROVAL_JSON',
  LAST_REHEARSAL_JSON: 'KIDLEARN_V3_PHASE_3PEF_LAST_REHEARSAL_JSON',
  RESPONSE_APPROVAL_ID: 'KIDLEARN_V3_PHASE_3PEF_RESPONSE_APPROVAL_ID',
  RESPONSE_REHEARSAL_ID: 'KIDLEARN_V3_PHASE_3PEF_RESPONSE_REHEARSAL_ID'
};


var KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  APPROVAL_PACKAGE_GENERATED: 'APPROVAL_PACKAGE_GENERATED',
  APPROVAL_GATE_RECORDED: 'APPROVAL_GATE_RECORDED',
  DRY_RUN_REHEARSAL_PASSED: 'DRY_RUN_REHEARSAL_PASSED',
  READY_FOR_3P_GH: 'READY_FOR_3P_GH',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG = {
  VERSION: '3P-EF',
  PHASE: '3P-EF',
  NEXT_BUNDLE: '3P-GH',
  NEXT_STAGE: 'PROD_MONITORING_RESPONSE_DECISION_GATE_AND_INCIDENT_CYCLE_CLOSE_LOCK',
  WRITE_MODE: 'RESPONSE_APPROVAL_GATE_AND_DRY_RUN_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  INCIDENT_REMEDIATION_ALLOWED_NOW: false,
  ROLLBACK_ALLOWED_NOW: false,
  MONITORING_MODE: 'READ_ONLY_RESPONSE_APPROVAL_AND_REHEARSAL',
  CONFIRM_TEXT: 'APPROVE_PROD_MONITORING_RESPONSE_DRY_RUN_3P_EF',
  APPROVAL_DECISION: 'PROCEED_TO_DRY_RUN_REHEARSAL_ONLY',
  WATCH_SHEETS: [
    'SYS_Config',
    'LOG_Audit',
    'LOG_Errors',
    'DATA_Users',
    'DATA_Children',
    'DATA_UserChildAccess',
    'MST_Lessons',
    'DATA_StudySessions',
    'DATA_LessonProgress',
    'DATA_DailyGoals'
  ]
};


/**
 * Preview 3P-EF.
 */
function kidlearnV3_previewProdMonitoringResponseApprovalDryRun3PEFV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3pefCheckFunctions_([
      'kidlearnV3_assertProdMonitoringIncidentTriageResponsePlan3PDReadyV3',
      'kidlearnV3_getProdMonitoringIncidentTriageResponsePlan3PDStatusV3',
      'kidlearnV3_getProdMonitoringAlertIncidentIntakeGate3PCStatusV3',
      'kidlearnV3_getProdMonitoringDailyHealthCheck3PBStatusV3',
      'kidlearnV3_assertProdChangeRequestCloseOperationalLock3OMClosedV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3PD =
    kidlearnV3_3pefSafeAssert_(
      'kidlearnV3_assertProdMonitoringIncidentTriageResponsePlan3PDReadyV3',
      '3P-D'
    );

  if (!phase3PD.success) {
    errors.push(
      '3P-D chưa READY_FOR_3P_E: ' +
      phase3PD.message
    );
  }

  var triageInfo =
    kidlearnV3_3pefGetTriageInfo_();

  if (triageInfo.status !== 'READY_FOR_3P_E') {
    errors.push(
      '3P-D status chưa READY_FOR_3P_E. Status=' +
      triageInfo.status
    );
  }

  if (!triageInfo.triagePlanId) {
    errors.push('Thiếu triagePlanId từ 3P-D.');
  }

  if (!triageInfo.responsePlanId) {
    errors.push('Thiếu responsePlanId từ 3P-D.');
  }

  if (!triageInfo.triageClass) {
    warnings.push('Không đọc được triageClass từ 3P-D.');
  }

  var close3OM =
    kidlearnV3_3pefSafeAssert_(
      'kidlearnV3_assertProdChangeRequestCloseOperationalLock3OMClosedV3',
      '3O-M'
    );

  if (!close3OM.success) {
    errors.push(
      '3O-M chưa CLOSED_LOCKED: ' +
      close3OM.message
    );
  }

  var prodInfo =
    kidlearnV3_3pefGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodCheck =
    kidlearnV3_3pefCheckFileAccessible_(
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
    kidlearnV3_3pefCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_MONITORING_RESPONSE_APPROVAL_DRY_RUN_3PEF_V3',
    bundle: '3P-EF',
    phase: KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.WRITE_MODE,
    monitoringMode: KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.MONITORING_MODE,
    confirmText:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.CONFIRM_TEXT,
    approvalDecision:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.APPROVAL_DECISION,
    healthStatus: triageInfo.healthStatus || '',
    intakeLevel: triageInfo.intakeLevel || '',
    triageClass: triageInfo.triageClass || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    incidentRemediationAllowedNow: false,
    rollbackAllowedNow: false,
    rehearsalOnly: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3PD: phase3PD,
    triageInfo: triageInfo,
    close3OM: close3OM,
    prodInfo: prodInfo,
    prodCheck: prodCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3P-EF gộp approval gate và dry-run rehearsal. QA batch không record approval và không ghi PROD.'
  };

  kidlearnV3_3pefSaveResult_(
    result,
    KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Generate response approval package.
 *
 * Không ghi PROD.
 */
function kidlearnV3_generateProdMonitoringResponseApprovalPackage3PEFV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdMonitoringResponseApprovalDryRun3PEFV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate approval package 3P-EF vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var responseApprovalId =
    kidlearnV3_3pefMakeResponseApprovalId_();

  var responseRehearsalId =
    kidlearnV3_3pefMakeResponseRehearsalId_();

  var triageInfo =
    kidlearnV3_3pefGetTriageInfo_();

  var prodInfo =
    kidlearnV3_3pefGetProdInfo_();

  var prodCheck =
    kidlearnV3_3pefCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi generate approval package: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3pefCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var approvalPolicy =
    kidlearnV3_3pefBuildApprovalPolicy_(
      triageInfo
    );

  var rehearsalPlan =
    kidlearnV3_3pefBuildDryRunRehearsalPlan_(
      triageInfo
    );

  var finishedAt = new Date();

  var pkg = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_MONITORING_RESPONSE_APPROVAL_PACKAGE_3PEF_V3',
    bundle: '3P-EF',
    phase: KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.APPROVAL_PACKAGE_GENERATED
        : KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.FAILED,
    responseApprovalId: responseApprovalId,
    responseRehearsalId: responseRehearsalId,
    triagePlanId: triageInfo.triagePlanId || '',
    responsePlanId: triageInfo.responsePlanId || '',
    incidentIntakeId: triageInfo.incidentIntakeId || '',
    alertReviewId: triageInfo.alertReviewId || '',
    healthStatus: triageInfo.healthStatus || '',
    intakeLevel: triageInfo.intakeLevel || '',
    triageClass: triageInfo.triageClass || '',
    confirmText:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.CONFIRM_TEXT,
    approvalDecision:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.APPROVAL_DECISION,
    nextBundle:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodFileName: prodInfo.prodFileName || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    incidentRemediationAllowedNow: false,
    rollbackAllowedNow: false,

    approvalPolicy: approvalPolicy,
    dryRunRehearsalPlan: rehearsalPlan,

    approvalChecklist: [
      {
        item: '3P-D ready',
        passed: triageInfo.status === 'READY_FOR_3P_E'
      },
      {
        item: 'Triage plan exists',
        passed: triageInfo.triagePlanId ? true : false
      },
      {
        item: 'Response plan exists',
        passed: triageInfo.responsePlanId ? true : false
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
        item: 'Approval only allows dry-run rehearsal',
        passed: true
      },
      {
        item: 'No PROD write in 3P-EF package',
        passed: true
      }
    ],

    noSideEffectAt3PEFPackage: {
      prodFileModifiedBy3PEFPackage: false,
      prodDataWrittenBy3PEFPackage: false,
      auditRowAppendedBy3PEFPackage: false,
      remediationExecutedBy3PEFPackage: false,
      rollbackExecutedBy3PEFPackage: false,
      prodDeployExecutedBy3PEFPackage: false
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

  kidlearnV3_3pefSavePackage_(
    pkg
  );

  kidlearnV3_3pefSaveResult_(
    pkg,
    pkg.success
      ? KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.APPROVAL_PACKAGE_GENERATED
      : KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.FAILED,
    KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.LAST_PACKAGE_AT
  );

  console.log(JSON.stringify(pkg, null, 2));

  if (!pkg.success) {
    throw new Error(
      '3P-EF approval package failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return pkg;
}


/**
 * Manual confirm wrapper.
 *
 * Không ghi PROD.
 */
function kidlearnV3_recordProdMonitoringResponseApproval3PEFManualConfirmV3() {
  return kidlearnV3_recordProdMonitoringResponseApproval3PEFV3({
    confirmText:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.CONFIRM_TEXT,
    approvalDecision:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.APPROVAL_DECISION,
    approvedBy: 'DEV_RESPONSE_APPROVER_MANUAL_3PEF',
    approvalNote:
      '3P-EF approval recorded. Proceed to dry-run rehearsal only. No PROD write.'
  });
}


/**
 * Record response approval.
 *
 * options:
 * {
 *   confirmText: 'APPROVE_PROD_MONITORING_RESPONSE_DRY_RUN_3P_EF',
 *   approvalDecision: 'PROCEED_TO_DRY_RUN_REHEARSAL_ONLY',
 *   approvedBy: '...',
 *   approvalNote: '...'
 * }
 */
function kidlearnV3_recordProdMonitoringResponseApproval3PEFV3(options) {
  var req =
    kidlearnV3_3pefNormalizeOptions_(options);

  var errors = [];
  var warnings = [];

  if (
    String(req.confirmText || '') !==
    KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.CONFIRM_TEXT
  ) {
    errors.push(
      'Confirm text không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.CONFIRM_TEXT
    );
  }

  if (
    String(req.approvalDecision || '') !==
    KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.APPROVAL_DECISION
  ) {
    errors.push(
      'approvalDecision không đúng. Cần đúng: ' +
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.APPROVAL_DECISION
    );
  }

  var status =
    kidlearnV3_getProdMonitoringResponseApprovalDryRun3PEFStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.APPROVAL_PACKAGE_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.APPROVAL_GATE_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.DRY_RUN_REHEARSAL_PASSED &&
    status.status !== KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.READY_FOR_3P_GH
  ) {
    errors.push(
      '3P-EF chưa APPROVAL_PACKAGE_GENERATED. Status=' +
      status.status
    );
  }

  if (
    (
      status.status === KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.APPROVAL_GATE_RECORDED ||
      status.status === KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.DRY_RUN_REHEARSAL_PASSED ||
      status.status === KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.READY_FOR_3P_GH
    ) &&
    req.allowRepeatApproval !== true
  ) {
    errors.push(
      '3P-EF approval gate đã record rồi. Không record lại để tránh chồng trạng thái. Có thể chạy tiếp dry-run/mark ready.'
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

  var triageInfo =
    kidlearnV3_3pefGetTriageInfo_();

  if (triageInfo.status !== 'READY_FOR_3P_E') {
    errors.push(
      '3P-D không còn READY_FOR_3P_E. Status=' +
      triageInfo.status
    );
  }

  var prodInfo =
    kidlearnV3_3pefGetProdInfo_();

  var prodCheck =
    kidlearnV3_3pefCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi record approval: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3pefCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  if (errors.length > 0) {
    var failed = {
      success: false,
      action: 'RECORD_PROD_MONITORING_RESPONSE_APPROVAL_3PEF_V3',
      bundle: '3P-EF',
      phase: KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.PHASE,
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
      'Không thể record response approval 3P-EF. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var responseApprovalId =
    status.responseApprovalId ||
    kidlearnV3_3pefMakeResponseApprovalId_();

  var responseRehearsalId =
    status.responseRehearsalId ||
    kidlearnV3_3pefMakeResponseRehearsalId_();

  var approval = {
    success: true,
    action: 'RECORD_PROD_MONITORING_RESPONSE_APPROVAL_3PEF_V3',
    bundle: '3P-EF',
    phase: KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.APPROVAL_GATE_RECORDED,
    responseApprovalId: responseApprovalId,
    responseRehearsalId: responseRehearsalId,
    triagePlanId: triageInfo.triagePlanId || '',
    responsePlanId: triageInfo.responsePlanId || '',
    incidentIntakeId: triageInfo.incidentIntakeId || '',
    alertReviewId: triageInfo.alertReviewId || '',
    healthStatus: triageInfo.healthStatus || '',
    intakeLevel: triageInfo.intakeLevel || '',
    triageClass: triageInfo.triageClass || '',
    approvalDecision:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.APPROVAL_DECISION,
    approvedBy:
      req.approvedBy || 'DEV_RESPONSE_APPROVER_MANUAL_3PEF',
    approvalNote:
      req.approvalNote || '',
    nextBundle:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    dryRunRehearsalAllowedNow: true,
    incidentRemediationAllowedNow: false,
    rollbackAllowedNow: false,
    prodWriteOpenedNow: false,
    safeModes: safeModes.summary,
    recordedAt:
      new Date().toISOString(),
    warningCount: warnings.length,
    warnings: warnings
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.RESPONSE_APPROVAL_ID,
    responseApprovalId
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.RESPONSE_REHEARSAL_ID,
    responseRehearsalId
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.LAST_APPROVAL_JSON,
    JSON.stringify(approval)
  );

  kidlearnV3_3pefSaveResult_(
    approval,
    KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.APPROVAL_GATE_RECORDED,
    KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.LAST_APPROVAL_AT
  );

  console.log(JSON.stringify(approval, null, 2));
  return approval;
}


/**
 * Run response dry-run rehearsal.
 *
 * Không ghi PROD.
 */
function kidlearnV3_runProdMonitoringResponseDryRunRehearsal3PEFV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var status =
    kidlearnV3_getProdMonitoringResponseApprovalDryRun3PEFStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.APPROVAL_GATE_RECORDED &&
    status.status !== KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.DRY_RUN_REHEARSAL_PASSED &&
    status.status !== KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.READY_FOR_3P_GH
  ) {
    errors.push(
      '3P-EF cần APPROVAL_GATE_RECORDED trước khi dry-run rehearsal. Status=' +
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

  var triageInfo =
    kidlearnV3_3pefGetTriageInfo_();

  var prodInfo =
    kidlearnV3_3pefGetProdInfo_();

  var prodCheck =
    kidlearnV3_3pefCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi dry-run rehearsal: ' +
      prodCheck.message
    );
  }

  var spreadsheet = null;

  if (prodInfo.prodFileId) {
    spreadsheet =
      SpreadsheetApp.openById(
        prodInfo.prodFileId
      );
  }

  var beforeSnapshot =
    spreadsheet
      ? kidlearnV3_3pefSnapshotProdSheets_(
          spreadsheet,
          KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.WATCH_SHEETS
        )
      : null;

  var rehearsalSteps =
    kidlearnV3_3pefBuildDryRunSteps_(
      triageInfo
    );

  var simulatedResult =
    kidlearnV3_3pefSimulateRehearsalSteps_(
      rehearsalSteps
    );

  if (!simulatedResult.success) {
    errors = errors.concat(simulatedResult.errors);
  }

  var afterSnapshot =
    spreadsheet
      ? kidlearnV3_3pefSnapshotProdSheets_(
          spreadsheet,
          KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.WATCH_SHEETS
        )
      : null;

  var noWriteCompare =
    kidlearnV3_3pefCompareNoWriteSnapshots_(
      beforeSnapshot,
      afterSnapshot
    );

  errors = errors.concat(noWriteCompare.errors);
  warnings = warnings.concat(noWriteCompare.warnings);

  var safeModes =
    kidlearnV3_3pefCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var responseRehearsalId =
    status.responseRehearsalId ||
    kidlearnV3_3pefMakeResponseRehearsalId_();

  var finishedAt = new Date();

  var rehearsal = {
    success: errors.length === 0,
    action: 'RUN_PROD_MONITORING_RESPONSE_DRY_RUN_REHEARSAL_3PEF_V3',
    bundle: '3P-EF',
    phase: KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.DRY_RUN_REHEARSAL_PASSED
        : KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.FAILED,
    responseApprovalId: status.responseApprovalId || '',
    responseRehearsalId: responseRehearsalId,
    triagePlanId: triageInfo.triagePlanId || '',
    responsePlanId: triageInfo.responsePlanId || '',
    incidentIntakeId: triageInfo.incidentIntakeId || '',
    alertReviewId: triageInfo.alertReviewId || '',
    healthStatus: triageInfo.healthStatus || '',
    intakeLevel: triageInfo.intakeLevel || '',
    triageClass: triageInfo.triageClass || '',
    nextBundle:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    incidentRemediationExecutedNow: false,
    rollbackExecutedNow: false,
    auditRowAppendedNow: false,

    rehearsalSummary: {
      stepCount: rehearsalSteps.length,
      simulatedStepCount: simulatedResult.simulatedStepCount,
      noWriteConfirmed:
        noWriteCompare.summary.noWriteConfirmed === true,
      changedSheetCount:
        noWriteCompare.summary.changedSheetCount || 0,
      safeWriteMode:
        safeModes.summary.safeWriteMode,
      safeWriteEnabled:
        safeModes.summary.safeWriteEnabled
    },

    rehearsalSteps: rehearsalSteps,
    simulatedResult: simulatedResult.summary,
    noWriteCompare: noWriteCompare.summary,
    safeModes: safeModes.summary,

    noSideEffectAt3PEFRehearsal: {
      prodFileModifiedBy3PEFRehearsal: false,
      prodDataWrittenBy3PEFRehearsal: false,
      auditRowAppendedBy3PEFRehearsal: false,
      remediationExecutedBy3PEFRehearsal: false,
      rollbackExecutedBy3PEFRehearsal: false,
      prodDeployExecutedBy3PEFRehearsal: false
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

  kidlearnV3_3pefSaveRehearsal_(
    rehearsal
  );

  kidlearnV3_3pefSaveResult_(
    rehearsal,
    rehearsal.success
      ? KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.DRY_RUN_REHEARSAL_PASSED
      : KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.FAILED,
    KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.LAST_REHEARSAL_AT
  );

  console.log(JSON.stringify(rehearsal, null, 2));

  if (!rehearsal.success) {
    throw new Error(
      '3P-EF dry-run rehearsal failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return rehearsal;
}


/**
 * Mark 3P-EF ready.
 */
function kidlearnV3_markProdMonitoringResponseApprovalDryRun3PEFReadyV3() {
  var status =
    kidlearnV3_getProdMonitoringResponseApprovalDryRun3PEFStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.DRY_RUN_REHEARSAL_PASSED &&
    status.status !== KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.READY_FOR_3P_GH
  ) {
    errors.push(
      '3P-EF chưa DRY_RUN_REHEARSAL_PASSED. Status=' +
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

  if (
    !status.lastRehearsal ||
    status.lastRehearsal.success !== true
  ) {
    errors.push(
      'Last rehearsal chưa success=true.'
    );
  }

  if (!status.responseApprovalId) {
    errors.push('Thiếu responseApprovalId.');
  }

  if (!status.responseRehearsalId) {
    errors.push('Thiếu responseRehearsalId.');
  }

  var prodInfo =
    kidlearnV3_3pefGetProdInfo_();

  var prodCheck =
    kidlearnV3_3pefCheckFileAccessible_(
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
    kidlearnV3_3pefCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3P-EF ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var triageInfo =
    kidlearnV3_3pefGetTriageInfo_();

  var result = {
    success: true,
    action: 'MARK_PROD_MONITORING_RESPONSE_APPROVAL_DRY_RUN_3PEF_READY_V3',
    bundle: '3P-EF',
    phase: KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.READY_FOR_3P_GH,
    responseApprovalId: status.responseApprovalId || '',
    responseRehearsalId: status.responseRehearsalId || '',
    triagePlanId: triageInfo.triagePlanId || '',
    responsePlanId: triageInfo.responsePlanId || '',
    incidentIntakeId: triageInfo.incidentIntakeId || '',
    alertReviewId: triageInfo.alertReviewId || '',
    healthStatus: triageInfo.healthStatus || '',
    intakeLevel: triageInfo.intakeLevel || '',
    triageClass: triageInfo.triageClass || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.NEXT_STAGE,
    monitoringMode:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.MONITORING_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    incidentRemediationAllowedNow: false,
    rollbackAllowedNow: false,
    message:
      '3P-EF ready. Response approval gate và dry-run rehearsal đã hoàn tất. Bước tiếp theo là 3P-GH.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3pefSaveResult_(
    result,
    KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.READY_FOR_3P_GH,
    KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get 3P-EF status.
 */
function kidlearnV3_getProdMonitoringResponseApprovalDryRun3PEFStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_MONITORING_RESPONSE_APPROVAL_DRY_RUN_3PEF_STATUS_V3',
    bundle: '3P-EF',
    phase: KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.NOT_RUN,
    responseApprovalId:
      properties.getProperty(
        KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.RESPONSE_APPROVAL_ID
      ) ||
      '',
    responseRehearsalId:
      properties.getProperty(
        KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.RESPONSE_REHEARSAL_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastPackageAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.LAST_PACKAGE_AT
      ) ||
      '',
    lastApprovalAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.LAST_APPROVAL_AT
      ) ||
      '',
    lastRehearsalAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.LAST_REHEARSAL_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3pefReadJsonProperty_(
        KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.LAST_RESULT_JSON
      ),
    lastPackage:
      kidlearnV3_3pefReadJsonProperty_(
        KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.LAST_PACKAGE_JSON
      ),
    lastApproval:
      kidlearnV3_3pefReadJsonProperty_(
        KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.LAST_APPROVAL_JSON
      ),
    lastRehearsal:
      kidlearnV3_3pefReadJsonProperty_(
        KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.LAST_REHEARSAL_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert 3P-EF ready.
 */
function kidlearnV3_assertProdMonitoringResponseApprovalDryRun3PEFReadyV3() {
  var status =
    kidlearnV3_getProdMonitoringResponseApprovalDryRun3PEFStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.READY_FOR_3P_GH
  ) {
    errors.push(
      '3P-EF chưa READY_FOR_3P_GH. Status=' +
      status.status
    );
  }

  if (!status.responseApprovalId) {
    errors.push('Thiếu responseApprovalId.');
  }

  if (!status.responseRehearsalId) {
    errors.push('Thiếu responseRehearsalId.');
  }

  var prodInfo =
    kidlearnV3_3pefGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_MONITORING_RESPONSE_APPROVAL_DRY_RUN_3PEF_READY_V3',
    bundle: '3P-EF',
    phase: KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.PHASE,
    status: status.status,
    responseApprovalId: status.responseApprovalId || '',
    responseRehearsalId: status.responseRehearsalId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.NEXT_BUNDLE,
    monitoringMode:
      KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.MONITORING_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    incidentRemediationAllowedNow: false,
    rollbackAllowedNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3P-EF chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3P-EF package-only.
 *
 * Không record approval.
 * Không run rehearsal.
 * Không ghi PROD.
 */
function kidlearnV3_getQaBatchSteps3PEFV3() {
  return [
    {
      label: 'Assert 3P-D ready',
      functionName: 'kidlearnV3_assertProdMonitoringIncidentTriageResponsePlan3PDReadyV3'
    },
    {
      label: 'Preview PROD Response Approval Dry Run 3P-EF',
      functionName: 'kidlearnV3_previewProdMonitoringResponseApprovalDryRun3PEFV3'
    },
    {
      label: 'Generate PROD Response Approval Package 3P-EF',
      functionName: 'kidlearnV3_generateProdMonitoringResponseApprovalPackage3PEFV3'
    }
  ];
}


/**
 * QA batch 3P-EF package-only.
 */
function kidlearnV3_runQaBatch3PEFV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3P_EF_PROD_MONITORING_RESPONSE_APPROVAL_DRY_RUN_PACKAGE_ONLY',
    kidlearnV3_getQaBatchSteps3PEFV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build approval policy.
 */
function kidlearnV3_3pefBuildApprovalPolicy_(triageInfo) {
  return {
    gateName:
      'KIDLEARN V3 PROD Monitoring Response Approval Gate',
    approvalScope:
      'Approve proceeding to dry-run rehearsal only.',
    healthStatus:
      triageInfo.healthStatus || '',
    intakeLevel:
      triageInfo.intakeLevel || '',
    triageClass:
      triageInfo.triageClass || '',
    allowedByThisApproval: [
      'Run dry-run response rehearsal',
      'Read PROD metadata and selected sheet row counts',
      'Record DEV ScriptProperties status',
      'Proceed to 3P-GH decision and close gate'
    ],
    notAllowedByThisApproval: [
      'No PROD write',
      'No LOG_Audit append',
      'No incident remediation execution',
      'No rollback',
      'No deployment',
      'No data fix',
      'No content update'
    ],
    futureActionPolicy: {
      prodWriteRequiresNewGate: true,
      rollbackRequiresNewGate: true,
      deploymentRequiresNewGate: true,
      remediationRequiresNewGate: true
    }
  };
}


/**
 * Build dry-run rehearsal plan.
 */
function kidlearnV3_3pefBuildDryRunRehearsalPlan_(triageInfo) {
  return {
    rehearsalMode:
      'DRY_RUN_ONLY',
    triageClass:
      triageInfo.triageClass || '',
    objective:
      'Verify response path without touching PROD data.',
    requiredBeforeRehearsal: [
      '3P-D READY_FOR_3P_E',
      '3P-EF approval gate recorded',
      'Safe Write DRY_RUN/enabled=false',
      'PROD file accessible'
    ],
    expectedOutput: [
      'No-write snapshot before/after',
      'Simulated response steps',
      'No changed sheets',
      'Ready for 3P-GH decision gate'
    ]
  };
}


/**
 * Build dry-run steps.
 */
function kidlearnV3_3pefBuildDryRunSteps_(triageInfo) {
  var steps = [
    {
      stepCode: 'VERIFY_TRIAGE_INPUT',
      description: 'Verify triage plan and response plan from 3P-D.',
      dryRunOnly: true
    },
    {
      stepCode: 'VERIFY_PROD_READONLY',
      description: 'Verify PROD file is accessible in read-only monitoring mode.',
      dryRunOnly: true
    },
    {
      stepCode: 'VERIFY_SAFE_MODES',
      description: 'Verify Safe Write remains DRY_RUN/enabled=false.',
      dryRunOnly: true
    }
  ];

  var triageClass =
    String(triageInfo.triageClass || '').toUpperCase();

  if (triageClass === 'P1_INCIDENT_TRIAGE_REQUIRED') {
    steps.push({
      stepCode: 'SIMULATE_P1_RESPONSE_PATH',
      description: 'Simulate P1 incident response path without PROD action.',
      dryRunOnly: true
    });
    steps.push({
      stepCode: 'SIMULATE_FUTURE_GATE_SELECTION',
      description: 'Simulate whether future rollback/write/deploy gate would be needed.',
      dryRunOnly: true
    });
  } else if (triageClass === 'P2_ALERT_TRIAGE_REQUIRED') {
    steps.push({
      stepCode: 'SIMULATE_P2_ALERT_REVIEW',
      description: 'Simulate alert review and monitor-only option.',
      dryRunOnly: true
    });
  } else {
    steps.push({
      stepCode: 'SIMULATE_MONITOR_ONLY_RESPONSE',
      description: 'Simulate monitor-only response and continue daily health checks.',
      dryRunOnly: true
    });
  }

  steps.push({
    stepCode: 'CONFIRM_NO_PROD_WRITE',
    description: 'Confirm no PROD write, no LOG_Audit append, no rollback, no deploy.',
    dryRunOnly: true
  });

  return steps;
}


/**
 * Simulate rehearsal steps.
 */
function kidlearnV3_3pefSimulateRehearsalSteps_(steps) {
  var errors = [];
  var simulated = [];

  for (var i = 0; i < steps.length; i++) {
    if (steps[i].dryRunOnly !== true) {
      errors.push(
        'Step không phải dryRunOnly=true: ' +
        steps[i].stepCode
      );
    }

    simulated.push({
      stepCode: steps[i].stepCode,
      simulated: true,
      executedProdAction: false,
      wroteProdData: false,
      appendedAudit: false,
      rollbackExecuted: false,
      deploymentExecuted: false
    });
  }

  return {
    success: errors.length === 0,
    simulatedStepCount: simulated.length,
    errorCount: errors.length,
    errors: errors,
    summary: {
      simulatedStepCount: simulated.length,
      executedProdAction: false,
      wroteProdData: false,
      appendedAudit: false,
      rollbackExecuted: false,
      deploymentExecuted: false
    },
    items: simulated
  };
}


/**
 * Get triage info from 3P-D.
 */
function kidlearnV3_3pefGetTriageInfo_() {
  try {
    var status =
      kidlearnV3_getProdMonitoringIncidentTriageResponsePlan3PDStatusV3();

    var lastPlan =
      status.lastPlan || {};

    var lastRecord =
      status.lastRecord || {};

    var lastResult =
      status.lastResult || {};

    return {
      status: status.status || '',
      triagePlanId:
        status.triagePlanId ||
        lastRecord.triagePlanId ||
        lastPlan.triagePlanId ||
        '',
      responsePlanId:
        status.responsePlanId ||
        lastRecord.responsePlanId ||
        lastPlan.responsePlanId ||
        '',
      incidentIntakeId:
        lastRecord.incidentIntakeId ||
        lastPlan.incidentIntakeId ||
        '',
      alertReviewId:
        lastRecord.alertReviewId ||
        lastPlan.alertReviewId ||
        '',
      healthStatus:
        lastRecord.healthStatus ||
        lastPlan.healthStatus ||
        lastResult.healthStatus ||
        '',
      intakeLevel:
        lastRecord.intakeLevel ||
        lastPlan.intakeLevel ||
        lastResult.intakeLevel ||
        '',
      triageClass:
        lastRecord.triageClass ||
        lastPlan.triageClass ||
        lastResult.triageClass ||
        '',
      planDecision:
        lastRecord.planDecision ||
        lastPlan.planDecision ||
        '',
      planSuccess:
        lastPlan.success === true,
      recordSuccess:
        lastRecord.success === true
    };

  } catch (error) {
    return {
      status: '',
      triagePlanId: '',
      responsePlanId: '',
      incidentIntakeId: '',
      alertReviewId: '',
      healthStatus: '',
      intakeLevel: '',
      triageClass: '',
      planDecision: '',
      planSuccess: false,
      recordSuccess: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Snapshot selected PROD sheets.
 */
function kidlearnV3_3pefSnapshotProdSheets_(spreadsheet, sheetNames) {
  var items = [];

  for (var i = 0; i < sheetNames.length; i++) {
    var sheetName =
      sheetNames[i];

    var sheet =
      kidlearnV3_3pefGetSheet_(
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
    checkedSheetCount:
      sheetNames.length,
    items: items
  };
}


/**
 * Compare snapshots and require no PROD changes.
 */
function kidlearnV3_3pefCompareNoWriteSnapshots_(beforeSnapshot, afterSnapshot) {
  var errors = [];
  var warnings = [];

  if (!beforeSnapshot || !afterSnapshot) {
    errors.push('Thiếu before/after snapshot để verify no-write.');
    return {
      success: false,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors: errors,
      warnings: warnings,
      summary: {
        noWriteConfirmed: false,
        changedSheetCount: 0
      }
    };
  }

  var beforeMap =
    kidlearnV3_3pefMapSnapshots_(
      beforeSnapshot.items || []
    );

  var afterMap =
    kidlearnV3_3pefMapSnapshots_(
      afterSnapshot.items || []
    );

  var changedSheetCount = 0;
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

    var rowDelta =
      after.lastRow - before.lastRow;

    var columnDelta =
      after.lastColumn - before.lastColumn;

    var changed =
      before.exists !== after.exists ||
      rowDelta !== 0 ||
      columnDelta !== 0;

    if (changed) {
      changedSheetCount++;
      errors.push(
        'PROD sheet changed during 3P-EF dry-run: ' +
        sheetName +
        '. rowDelta=' +
        rowDelta +
        ', columnDelta=' +
        columnDelta
      );
    }

    compared.push({
      sheetName: sheetName,
      rowDelta: rowDelta,
      columnDelta: columnDelta,
      changed: changed
    });
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    compared: compared,
    summary: {
      comparedSheetCount: compared.length,
      changedSheetCount: changedSheetCount,
      noWriteConfirmed: errors.length === 0
    }
  };
}


/**
 * Map snapshot items.
 */
function kidlearnV3_3pefMapSnapshots_(items) {
  var map = {};

  for (var i = 0; i < items.length; i++) {
    map[items[i].sheetName] = items[i];
  }

  return map;
}


/**
 * PROD info from 3N-F.
 */
function kidlearnV3_3pefGetProdInfo_() {
  var status =
    kidlearnV3_getControlledProdDeployment3NFStatusV3();

  var lastDeployment =
    status.lastDeployment ||
    status.lastExecution ||
    status.lastResult ||
    {};

  return {
    status: status.status || '',
    deploymentId:
      status.deploymentId ||
      lastDeployment.deploymentId ||
      '',
    prodFileId:
      status.prodFileId ||
      status.prodId ||
      status.fileId ||
      lastDeployment.prodFileId ||
      lastDeployment.prodId ||
      lastDeployment.fileId ||
      '',
    prodFileUrl:
      status.prodFileUrl ||
      status.prodUrl ||
      status.fileUrl ||
      lastDeployment.prodFileUrl ||
      lastDeployment.prodUrl ||
      lastDeployment.fileUrl ||
      '',
    prodFileName:
      status.prodFileName ||
      status.fileName ||
      lastDeployment.prodFileName ||
      lastDeployment.fileName ||
      ''
  };
}


/**
 * Check file accessible.
 */
function kidlearnV3_3pefCheckFileAccessible_(fileId, label) {
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
function kidlearnV3_3pefCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3pefSafeWriteStatus_();

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
    kidlearnV3_3pefControlledWriteStatus_();

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    errors.push(
      'Controlled Write DEV đang ENABLED.'
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
function kidlearnV3_3pefGetSheet_(spreadsheet, sheetName) {
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
function kidlearnV3_3pefSafeAssert_(functionName, label) {
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
function kidlearnV3_3pefSafeCall_(functionName) {
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
        kidlearnV3_3pefSummarizeStatusOutput_(
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
        error:
          String(error.message || error)
      }
    };
  }
}


/**
 * Summarize status output.
 */
function kidlearnV3_3pefSummarizeStatusOutput_(output) {
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
    triagePlanId: output.triagePlanId || '',
    responsePlanId: output.responsePlanId || '',
    incidentIntakeId: output.incidentIntakeId || '',
    alertReviewId: output.alertReviewId || '',
    healthStatus: output.healthStatus || '',
    intakeLevel: output.intakeLevel || '',
    triageClass: output.triageClass || '',
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0
  };
}


/**
 * Safe Write status.
 */
function kidlearnV3_3pefSafeWriteStatus_() {
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
function kidlearnV3_3pefControlledWriteStatus_() {
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
function kidlearnV3_3pefCheckFunctions_(names) {
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
 * IDs.
 */
function kidlearnV3_3pefMakeResponseApprovalId_() {
  return (
    'PROD_RESPONSE_APPROVAL_3PEF_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


function kidlearnV3_3pefMakeResponseRehearsalId_() {
  return (
    'PROD_RESPONSE_DRY_RUN_REHEARSAL_3PEF_' +
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
function kidlearnV3_3pefSavePackage_(pkg) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.RESPONSE_APPROVAL_ID,
    pkg.responseApprovalId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.RESPONSE_REHEARSAL_ID,
    pkg.responseRehearsalId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.LAST_PACKAGE_JSON,
    JSON.stringify(pkg)
  );
}


/**
 * Save rehearsal.
 */
function kidlearnV3_3pefSaveRehearsal_(rehearsal) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.RESPONSE_REHEARSAL_ID,
    rehearsal.responseRehearsalId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.LAST_REHEARSAL_JSON,
    JSON.stringify(rehearsal)
  );
}


/**
 * Save result.
 */
function kidlearnV3_3pefSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.READY_FOR_3P_GH &&
    (
      status === KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.APPROVAL_PACKAGE_GENERATED ||
      status === KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.APPROVAL_GATE_RECORDED ||
      status === KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.DRY_RUN_REHEARSAL_PASSED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_RESPONSE_3PEF_STATUS.READY_FOR_3P_GH;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_RESPONSE_3PEF_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      responseApprovalId: result.responseApprovalId || '',
      responseRehearsalId: result.responseRehearsalId || '',
      triagePlanId: result.triagePlanId || '',
      responsePlanId: result.responsePlanId || '',
      incidentIntakeId: result.incidentIntakeId || '',
      alertReviewId: result.alertReviewId || '',
      healthStatus: result.healthStatus || '',
      intakeLevel: result.intakeLevel || '',
      triageClass: result.triageClass || '',
      prodFileId: result.prodFileId || '',
      prodFileUrl: result.prodFileUrl || '',
      monitoringMode:
        KIDLEARN_V3_PROD_RESPONSE_3PEF_CONFIG.MONITORING_MODE,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
      incidentRemediationAllowedNow: false,
      rollbackAllowedNow: false,
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
function kidlearnV3_3pefReadJsonProperty_(key) {
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
function kidlearnV3_3pefNormalizeOptions_(options) {
  if (!options) return {};

  if (typeof options !== 'object') {
    return {
      value: options
    };
  }

  return options;
}