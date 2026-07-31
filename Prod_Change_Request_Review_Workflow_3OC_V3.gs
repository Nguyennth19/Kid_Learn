/**
 * ================================================================
 * KIDLEARN V3 - PROD CHANGE REQUEST REVIEW WORKFLOW
 * Bundle: 3O-C
 * Version: 3.1.0
 * ================================================================
 *
 * 3O-C:
 * - Thiết kế workflow review change request cho PROD read-only.
 * - Không approve request.
 * - Không mở PROD write.
 * - Không ghi vào PROD file.
 * - Không migration.
 * - Không rollback.
 * - Chỉ ghi ScriptProperties trong DEV script để lưu workflow/status.
 */


var KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3OC_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3OC_LAST_PREVIEW_AT',
  LAST_WORKFLOW_AT: 'KIDLEARN_V3_PHASE_3OC_LAST_WORKFLOW_AT',
  LAST_SIMULATION_AT: 'KIDLEARN_V3_PHASE_3OC_LAST_SIMULATION_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3OC_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3OC_LAST_RESULT_JSON',
  LAST_WORKFLOW_JSON: 'KIDLEARN_V3_PHASE_3OC_LAST_WORKFLOW_JSON',
  LAST_SIMULATION_JSON: 'KIDLEARN_V3_PHASE_3OC_LAST_SIMULATION_JSON',
  WORKFLOW_ID: 'KIDLEARN_V3_PHASE_3OC_WORKFLOW_ID'
};


var KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  WORKFLOW_GENERATED: 'WORKFLOW_GENERATED',
  SIMULATION_PASSED: 'SIMULATION_PASSED',
  READY_FOR_3O_D: 'READY_FOR_3O_D',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_CONFIG = {
  VERSION: '3O-C',
  PHASE: '3O-C',
  NEXT_BUNDLE: '3O-D',
  NEXT_STAGE: 'PROD_CHANGE_REQUEST_APPROVAL_GATE',
  WRITE_MODE: 'CHANGE_REQUEST_REVIEW_WORKFLOW_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  REQUIRED_3OB_CHANGE_GATE_STATUS: 'CLOSED',
  SAMPLE_REQUEST_TYPES: [
    'DATA_FIX',
    'CONTENT_UPDATE',
    'UI_FIX',
    'PERFORMANCE_FIX',
    'PROD_WRITE_POLICY_REQUEST',
    'NEW_RELEASE_REQUEST'
  ]
};


/**
 * Preview 3O-C.
 */
function kidlearnV3_previewProdChangeRequestWorkflow3OCV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3ocCheckFunctions_([
      'kidlearnV3_assertProdReadonlySupportChangeGate3OBReadyV3',
      'kidlearnV3_getProdReadonlySupportChangeGate3OBStatusV3',
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3OB =
    kidlearnV3_3ocSafeAssert_(
      'kidlearnV3_assertProdReadonlySupportChangeGate3OBReadyV3',
      '3O-B'
    );

  if (!phase3OB.success) {
    errors.push(
      '3O-B chưa READY_FOR_3O_C: ' +
      phase3OB.message
    );
  }

  var supportGate =
    kidlearnV3_3ocSafeCall_(
      'kidlearnV3_getProdReadonlySupportChangeGate3OBStatusV3'
    );

  if (
    supportGate.summary.changeGateStatus &&
    supportGate.summary.changeGateStatus !==
      KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_CONFIG.REQUIRED_3OB_CHANGE_GATE_STATUS
  ) {
    errors.push(
      'Change gate từ 3O-B phải CLOSED trước khi thiết kế 3O-C. Current=' +
      supportGate.summary.changeGateStatus
    );
  }

  var finalLock =
    kidlearnV3_3ocSafeCall_(
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
    kidlearnV3_3ocGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodCheck =
    kidlearnV3_3ocCheckFileAccessible_(
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
    kidlearnV3_3ocCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_CHANGE_REQUEST_WORKFLOW_3OC_V3',
    bundle: '3O-C',
    phase: KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_CONFIG.WRITE_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    approvalGrantedNow: false,
    changeRequestExecutedNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3OB: phase3OB,
    supportGate: supportGate.summary,
    finalLock: finalLock.summary,
    prodInfo: prodInfo,
    prodCheck: prodCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3O-C chỉ thiết kế workflow review change request. Không approve và không ghi PROD.'
  };

  kidlearnV3_3ocSaveResult_(
    result,
    KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Generate PROD change request review workflow.
 */
function kidlearnV3_generateProdChangeRequestWorkflow3OCV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdChangeRequestWorkflow3OCV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate change request workflow 3O-C vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var workflowId =
    kidlearnV3_3ocMakeWorkflowId_();

  var prodInfo =
    kidlearnV3_3ocGetProdInfo_();

  var supportGate =
    kidlearnV3_3ocSafeCall_(
      'kidlearnV3_getProdReadonlySupportChangeGate3OBStatusV3'
    );

  var handover =
    kidlearnV3_3ocSafeCall_(
      'kidlearnV3_getProdReleaseHandover3NIStatusV3'
    );

  var monitoring =
    kidlearnV3_3ocSafeCall_(
      'kidlearnV3_getProdReadonlyMonitoringOnboarding3OAStatusV3'
    );

  var finalLock =
    kidlearnV3_3ocSafeCall_(
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3'
    );

  var safeModes =
    kidlearnV3_3ocCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var workflow =
    kidlearnV3_3ocBuildWorkflowDefinition_();

  var finishedAt = new Date();

  var workflowPackage = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_CHANGE_REQUEST_WORKFLOW_3OC_V3',
    bundle: '3O-C',
    phase: KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.WORKFLOW_GENERATED
        : KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.FAILED,
    workflowId: workflowId,
    nextBundle:
      KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    approvalGrantedNow: false,
    changeRequestExecutedNow: false,

    prodReference: {
      prodFileId: prodInfo.prodFileId || '',
      prodFileUrl: prodInfo.prodFileUrl || '',
      prodFileName: prodInfo.prodFileName || '',
      deploymentId: prodInfo.deploymentId || ''
    },

    upstreamReadiness: {
      supportGate3OB: supportGate.summary,
      monitoring3OA: monitoring.summary,
      handover3NI: handover.summary,
      finalLock3NJ: finalLock.summary
    },

    workflowDefinition: workflow,

    reviewPrinciples: [
      'Mọi change request chỉ được review, không tự động thực thi.',
      'Mọi thay đổi PROD cần approval gate riêng.',
      'Request liên quan PROD write policy luôn phải qua phase riêng.',
      'Request liên quan content/data cần đánh giá risk và rollback trước.',
      'Không sửa trực tiếp PROD file trong lúc review.'
    ],

    noSideEffect: {
      prodFileModifiedBy3OC: false,
      prodDataWrittenBy3OC: false,
      prodSheetCreatedBy3OC: false,
      prodSheetDeletedBy3OC: false,
      prodWritePolicyOpenedBy3OC: false
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

  kidlearnV3_3ocSaveWorkflow_(
    workflowPackage
  );

  kidlearnV3_3ocSaveResult_(
    workflowPackage,
    workflowPackage.success
      ? KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.WORKFLOW_GENERATED
      : KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.FAILED,
    KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS.LAST_WORKFLOW_AT
  );

  console.log(JSON.stringify(workflowPackage, null, 2));

  if (!workflowPackage.success) {
    throw new Error(
      '3O-C workflow package failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return workflowPackage;
}


/**
 * Run review workflow simulation.
 *
 * Simulation only:
 * - Không tạo request thật.
 * - Không approve.
 * - Không ghi PROD.
 */
function kidlearnV3_runProdChangeRequestWorkflowSimulation3OCV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var status =
    kidlearnV3_getProdChangeRequestWorkflow3OCStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.WORKFLOW_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.SIMULATION_PASSED &&
    status.status !== KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.READY_FOR_3O_D
  ) {
    errors.push(
      '3O-C cần WORKFLOW_GENERATED trước khi chạy simulation. Status=' +
      status.status
    );
  }

  if (
    !status.lastWorkflow ||
    status.lastWorkflow.success !== true
  ) {
    errors.push(
      'Last workflow chưa success=true.'
    );
  }

  var safeModes =
    kidlearnV3_3ocCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var sampleRequests =
    kidlearnV3_3ocBuildSampleChangeRequests_();

  var reviewed = [];

  for (var i = 0; i < sampleRequests.length; i++) {
    var review =
      kidlearnV3_3ocReviewSampleRequest_(
        sampleRequests[i]
      );

    reviewed.push(review);

    if (!review.success) {
      errors =
        errors.concat(
          review.errors || []
        );
    }

    warnings =
      warnings.concat(
        review.warnings || []
      );
  }

  var routeCheck =
    kidlearnV3_3ocValidateReviewRoutes_(
      reviewed
    );

  errors = errors.concat(routeCheck.errors);
  warnings = warnings.concat(routeCheck.warnings);

  var finishedAt = new Date();

  var simulation = {
    success: errors.length === 0,
    action: 'RUN_PROD_CHANGE_REQUEST_WORKFLOW_SIMULATION_3OC_V3',
    bundle: '3O-C',
    phase: KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.SIMULATION_PASSED
        : KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.FAILED,
    workflowId: status.workflowId || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    approvalGrantedNow: false,
    changeRequestExecutedNow: false,
    sampleRequestCount: sampleRequests.length,
    reviewedRequestCount: reviewed.length,
    routeCheck: routeCheck.summary,
    reviewedRequests: reviewed,
    safeModes: safeModes.summary,
    simulationDecision:
      errors.length === 0
        ? 'READY_FOR_CHANGE_REQUEST_APPROVAL_GATE_3O_D'
        : 'HOLD_WORKFLOW_SIMULATION_FAILED',
    noSideEffect: {
      prodFileModifiedBy3OC: false,
      prodDataWrittenBy3OC: false,
      prodSheetCreatedBy3OC: false,
      prodSheetDeletedBy3OC: false,
      requestApprovedBy3OC: false,
      requestExecutedBy3OC: false
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

  kidlearnV3_3ocSaveSimulation_(
    simulation
  );

  kidlearnV3_3ocSaveResult_(
    simulation,
    simulation.success
      ? KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.SIMULATION_PASSED
      : KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.FAILED,
    KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS.LAST_SIMULATION_AT
  );

  console.log(JSON.stringify(simulation, null, 2));

  if (!simulation.success) {
    throw new Error(
      '3O-C workflow simulation failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return simulation;
}


/**
 * Mark 3O-C ready.
 */
function kidlearnV3_markProdChangeRequestWorkflow3OCReadyV3() {
  var status =
    kidlearnV3_getProdChangeRequestWorkflow3OCStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.SIMULATION_PASSED &&
    status.status !== KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.READY_FOR_3O_D
  ) {
    errors.push(
      '3O-C chưa SIMULATION_PASSED. Status=' +
      status.status
    );
  }

  if (
    !status.lastWorkflow ||
    status.lastWorkflow.success !== true
  ) {
    errors.push(
      'Last workflow chưa success=true.'
    );
  }

  if (
    !status.lastSimulation ||
    status.lastSimulation.success !== true
  ) {
    errors.push(
      'Last simulation chưa success=true.'
    );
  }

  var prodInfo =
    kidlearnV3_3ocGetProdInfo_();

  var prodCheck =
    kidlearnV3_3ocCheckFileAccessible_(
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
    kidlearnV3_3ocCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3O-C ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_CHANGE_REQUEST_WORKFLOW_3OC_READY_V3',
    bundle: '3O-C',
    phase: KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.READY_FOR_3O_D,
    workflowId: status.workflowId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    approvalGrantedNow: false,
    message:
      '3O-C ready. Change request review workflow đã pass simulation. Bước tiếp theo là 3O-D approval gate.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3ocSaveResult_(
    result,
    KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.READY_FOR_3O_D,
    KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3O-C status.
 */
function kidlearnV3_getProdChangeRequestWorkflow3OCStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_CHANGE_REQUEST_WORKFLOW_3OC_STATUS_V3',
    bundle: '3O-C',
    phase: KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.NOT_RUN,
    workflowId:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS.WORKFLOW_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastWorkflowAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS.LAST_WORKFLOW_AT
      ) ||
      '',
    lastSimulationAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS.LAST_SIMULATION_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3ocReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS.LAST_RESULT_JSON
      ),
    lastWorkflow:
      kidlearnV3_3ocReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS.LAST_WORKFLOW_JSON
      ),
    lastSimulation:
      kidlearnV3_3ocReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS.LAST_SIMULATION_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3O-C ready.
 */
function kidlearnV3_assertProdChangeRequestWorkflow3OCReadyV3() {
  var status =
    kidlearnV3_getProdChangeRequestWorkflow3OCStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.READY_FOR_3O_D
  ) {
    errors.push(
      '3O-C chưa READY_FOR_3O_D. Status=' +
      status.status
    );
  }

  if (!status.workflowId) {
    errors.push(
      'Thiếu workflowId.'
    );
  }

  var prodInfo =
    kidlearnV3_3ocGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_CHANGE_REQUEST_WORKFLOW_3OC_READY_V3',
    bundle: '3O-C',
    phase: KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_CONFIG.PHASE,
    status: status.status,
    workflowId: status.workflowId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3O-C chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3O-C.
 */
function kidlearnV3_getQaBatchSteps3OCV3() {
  return [
    {
      label: 'Assert 3O-B ready',
      functionName: 'kidlearnV3_assertProdReadonlySupportChangeGate3OBReadyV3'
    },
    {
      label: 'Preview PROD Change Request Workflow 3O-C',
      functionName: 'kidlearnV3_previewProdChangeRequestWorkflow3OCV3'
    },
    {
      label: 'Generate PROD Change Request Workflow 3O-C',
      functionName: 'kidlearnV3_generateProdChangeRequestWorkflow3OCV3'
    },
    {
      label: 'Run PROD Change Request Workflow Simulation 3O-C',
      functionName: 'kidlearnV3_runProdChangeRequestWorkflowSimulation3OCV3'
    },
    {
      label: 'Mark PROD Change Request Workflow 3O-C Ready',
      functionName: 'kidlearnV3_markProdChangeRequestWorkflow3OCReadyV3'
    },
    {
      label: 'Assert PROD Change Request Workflow 3O-C Ready',
      functionName: 'kidlearnV3_assertProdChangeRequestWorkflow3OCReadyV3'
    }
  ];
}


/**
 * QA batch 3O-C.
 */
function kidlearnV3_runQaBatch3OCV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3O_C_PROD_CHANGE_REQUEST_REVIEW_WORKFLOW',
    kidlearnV3_getQaBatchSteps3OCV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build workflow definition.
 */
function kidlearnV3_3ocBuildWorkflowDefinition_() {
  return {
    workflowName: 'KIDLEARN V3 PROD Change Request Review Workflow',
    currentProdMode: 'READ_ONLY',
    prodWriteAllowed: false,
    requestStatuses: [
      'DRAFT',
      'SUBMITTED',
      'TRIAGED',
      'REVIEW_REQUIRED',
      'APPROVAL_REQUIRED',
      'APPROVED_FOR_PLANNING',
      'REJECTED',
      'CLOSED'
    ],
    requestTypes: [
      {
        requestType: 'DATA_FIX',
        reviewPath: 'Data review → risk review → approval gate',
        canExecuteIn3OC: false,
        requiresApproval: true
      },
      {
        requestType: 'CONTENT_UPDATE',
        reviewPath: 'Content review → curriculum check → approval gate',
        canExecuteIn3OC: false,
        requiresApproval: true
      },
      {
        requestType: 'UI_FIX',
        reviewPath: 'UI review → DEV fix → QA → release approval',
        canExecuteIn3OC: false,
        requiresApproval: true
      },
      {
        requestType: 'PERFORMANCE_FIX',
        reviewPath: 'Perf diagnosis → DEV optimization → QA → release approval',
        canExecuteIn3OC: false,
        requiresApproval: true
      },
      {
        requestType: 'PROD_WRITE_POLICY_REQUEST',
        reviewPath: 'Write policy risk review → explicit approval gate → controlled enable phase',
        canExecuteIn3OC: false,
        requiresApproval: true,
        highRisk: true
      },
      {
        requestType: 'NEW_RELEASE_REQUEST',
        reviewPath: 'New release planning → backup → dry-run → approval → deploy',
        canExecuteIn3OC: false,
        requiresApproval: true,
        highRisk: true
      }
    ],
    requiredFields: [
      'requestId',
      'requestType',
      'requestedBy',
      'businessReason',
      'affectedArea',
      'riskLevel',
      'expectedOutcome',
      'rollbackNeed',
      'approvalOwner'
    ],
    reviewChecklist: [
      'Request type hợp lệ',
      'Có business reason',
      'Có affected area',
      'Có risk level',
      'Có rollback need',
      'Có approval owner',
      'Không thực thi trong 3O-C',
      'Không ghi vào PROD khi review'
    ],
    approvalPolicy: {
      approvalGrantedIn3OC: false,
      approvalPhase: '3O-D',
      prodWritePolicyCanOpenIn3OC: false,
      changesRequireNewGate: true
    }
  };
}


/**
 * Build sample change requests.
 */
function kidlearnV3_3ocBuildSampleChangeRequests_() {
  return [
    {
      requestId: 'SAMPLE_CR_3OC_DATA_FIX',
      requestType: 'DATA_FIX',
      requestedBy: 'FAMILY_ADMIN',
      businessReason: 'Cần chỉnh liên kết user-child.',
      affectedArea: 'DATA_UserChildAccess',
      riskLevel: 'MEDIUM',
      expectedOutcome: 'Access mapping đúng.',
      rollbackNeed: 'YES',
      approvalOwner: 'FAMILY_ADMIN_OWNER'
    },
    {
      requestId: 'SAMPLE_CR_3OC_CONTENT_UPDATE',
      requestType: 'CONTENT_UPDATE',
      requestedBy: 'FAMILY_ADMIN',
      businessReason: 'Cần bổ sung nội dung bài học.',
      affectedArea: 'MST_Lessons',
      riskLevel: 'MEDIUM',
      expectedOutcome: 'Lesson content đầy đủ hơn.',
      rollbackNeed: 'YES',
      approvalOwner: 'CONTENT_OWNER'
    },
    {
      requestId: 'SAMPLE_CR_3OC_PROD_WRITE_POLICY',
      requestType: 'PROD_WRITE_POLICY_REQUEST',
      requestedBy: 'FAMILY_ADMIN',
      businessReason: 'Cần ghi tiến độ học thật.',
      affectedArea: 'DATA_LessonProgress/DATA_StudySessions',
      riskLevel: 'HIGH',
      expectedOutcome: 'Có thể ghi progress vào PROD.',
      rollbackNeed: 'YES',
      approvalOwner: 'RELEASE_OWNER'
    },
    {
      requestId: 'SAMPLE_CR_3OC_NEW_RELEASE',
      requestType: 'NEW_RELEASE_REQUEST',
      requestedBy: 'FAMILY_ADMIN',
      businessReason: 'Cần release version mới.',
      affectedArea: 'APP_AND_DATABASE',
      riskLevel: 'HIGH',
      expectedOutcome: 'Có bản PROD mới sau approval.',
      rollbackNeed: 'YES',
      approvalOwner: 'RELEASE_OWNER'
    }
  ];
}


/**
 * Review sample request.
 */
function kidlearnV3_3ocReviewSampleRequest_(request) {
  var errors = [];
  var warnings = [];

  var requiredFields =
    kidlearnV3_3ocBuildWorkflowDefinition_().requiredFields;

  for (var i = 0; i < requiredFields.length; i++) {
    var key =
      requiredFields[i];

    if (!String(request[key] || '').trim()) {
      errors.push(
        'Request ' +
        request.requestId +
        ' thiếu field: ' +
        key
      );
    }
  }

  var requestType =
    String(request.requestType || '').trim();

  var supported =
    KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_CONFIG.SAMPLE_REQUEST_TYPES
      .indexOf(requestType) >= 0;

  if (!supported) {
    errors.push(
      'Request type không hợp lệ: ' +
      requestType
    );
  }

  var highRisk =
    requestType === 'PROD_WRITE_POLICY_REQUEST' ||
    requestType === 'NEW_RELEASE_REQUEST';

  var routedStatus =
    highRisk
      ? 'APPROVAL_REQUIRED'
      : 'REVIEW_REQUIRED';

  var nextPhase =
    highRisk
      ? '3O-D_APPROVAL_GATE_REQUIRED'
      : '3O-D_OR_LATER_APPROVAL_REQUIRED';

  return {
    success: errors.length === 0,
    requestId: request.requestId || '',
    requestType: requestType,
    riskLevel: request.riskLevel || '',
    highRisk: highRisk,
    supported: supported,
    routedStatus: routedStatus,
    nextPhase: nextPhase,
    approvalRequired: true,
    approvedNow: false,
    executedNow: false,
    prodWriteAllowed: false,
    reviewDecision:
      errors.length === 0
        ? 'ACCEPTED_FOR_REVIEW_QUEUE_ONLY'
        : 'REJECTED_IN_SIMULATION',
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Validate review routes.
 */
function kidlearnV3_3ocValidateReviewRoutes_(reviewed) {
  var errors = [];
  var warnings = [];

  for (var i = 0; i < reviewed.length; i++) {
    var item =
      reviewed[i];

    if (item.approvedNow === true) {
      errors.push(
        'Simulation không được approve request trong 3O-C: ' +
        item.requestId
      );
    }

    if (item.executedNow === true) {
      errors.push(
        'Simulation không được execute request trong 3O-C: ' +
        item.requestId
      );
    }

    if (item.prodWriteAllowed === true) {
      errors.push(
        'Simulation không được mở PROD write trong 3O-C: ' +
        item.requestId
      );
    }

    if (item.approvalRequired !== true) {
      errors.push(
        'Mọi request trong 3O-C phải approvalRequired=true: ' +
        item.requestId
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
      reviewedCount: reviewed.length,
      approvalRequiredCount:
        reviewed.filter(function(item) {
          return item.approvalRequired === true;
        }).length,
      approvedNowCount:
        reviewed.filter(function(item) {
          return item.approvedNow === true;
        }).length,
      executedNowCount:
        reviewed.filter(function(item) {
          return item.executedNow === true;
        }).length,
      highRiskCount:
        reviewed.filter(function(item) {
          return item.highRisk === true;
        }).length
    }
  };
}


/**
 * PROD info từ 3N-F.
 */
function kidlearnV3_3ocGetProdInfo_() {
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
function kidlearnV3_3ocCheckFileAccessible_(fileId, label) {
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
function kidlearnV3_3ocCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3ocSafeWriteStatus_();

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
    kidlearnV3_3ocControlledWriteStatus_();

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
 * Safe assert.
 */
function kidlearnV3_3ocSafeAssert_(functionName, label) {
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
function kidlearnV3_3ocSafeCall_(functionName) {
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
        kidlearnV3_3ocSummarizeStatusOutput_(
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
function kidlearnV3_3ocSummarizeStatusOutput_(output) {
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
    supportPackageId: output.supportPackageId || '',
    changeGateId: output.changeGateId || '',
    changeGateStatus: output.changeGateStatus || '',
    finalLockId: output.finalLockId || '',
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0
  };
}


/**
 * Safe Write status.
 */
function kidlearnV3_3ocSafeWriteStatus_() {
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
function kidlearnV3_3ocControlledWriteStatus_() {
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
function kidlearnV3_3ocCheckFunctions_(names) {
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
 * Workflow ID.
 */
function kidlearnV3_3ocMakeWorkflowId_() {
  return (
    'PROD_CR_WORKFLOW_3OC_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


/**
 * Save workflow.
 */
function kidlearnV3_3ocSaveWorkflow_(workflowPackage) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS.WORKFLOW_ID,
    workflowPackage.workflowId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS.LAST_WORKFLOW_JSON,
    JSON.stringify(workflowPackage)
  );
}


/**
 * Save simulation.
 */
function kidlearnV3_3ocSaveSimulation_(simulation) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS.LAST_SIMULATION_JSON,
      JSON.stringify(simulation)
    );
}


/**
 * Save result.
 */
function kidlearnV3_3ocSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.READY_FOR_3O_D &&
    (
      status === KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.WORKFLOW_GENERATED ||
      status === KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.SIMULATION_PASSED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_STATUS.READY_FOR_3O_D;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_WORKFLOW_3OC_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      workflowId: result.workflowId || '',
      prodFileId: result.prodFileId || '',
      prodFileUrl: result.prodFileUrl || '',
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
      approvalGrantedNow: false,
      changeRequestExecutedNow: false,
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
function kidlearnV3_3ocReadJsonProperty_(key) {
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