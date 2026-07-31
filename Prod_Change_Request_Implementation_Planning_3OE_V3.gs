/**
 * ================================================================
 * KIDLEARN V3 - PROD CHANGE REQUEST IMPLEMENTATION PLANNING
 * Bundle: 3O-E
 * Version: 3.1.0
 * ================================================================
 *
 * 3O-E:
 * - Tạo implementation planning package cho PROD change request.
 * - Không execute request.
 * - Không approve request cụ thể.
 * - Không mở PROD write.
 * - Không ghi vào PROD file.
 * - Không migration.
 * - Không rollback.
 * - Chỉ ghi ScriptProperties trong DEV script để lưu planning/status.
 */


var KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3OE_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3OE_LAST_PREVIEW_AT',
  LAST_PLAN_AT: 'KIDLEARN_V3_PHASE_3OE_LAST_PLAN_AT',
  LAST_SIMULATION_AT: 'KIDLEARN_V3_PHASE_3OE_LAST_SIMULATION_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3OE_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3OE_LAST_RESULT_JSON',
  LAST_PLAN_JSON: 'KIDLEARN_V3_PHASE_3OE_LAST_PLAN_JSON',
  LAST_SIMULATION_JSON: 'KIDLEARN_V3_PHASE_3OE_LAST_SIMULATION_JSON',
  PLAN_ID: 'KIDLEARN_V3_PHASE_3OE_PLAN_ID'
};


var KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  PLAN_GENERATED: 'PLAN_GENERATED',
  SIMULATION_PASSED: 'SIMULATION_PASSED',
  READY_FOR_3O_F: 'READY_FOR_3O_F',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_CR_PLAN_3OE_CONFIG = {
  VERSION: '3O-E',
  PHASE: '3O-E',
  NEXT_BUNDLE: '3O-F',
  NEXT_STAGE: 'PROD_CHANGE_REQUEST_CONTROLLED_EXECUTION_GATE',
  WRITE_MODE: 'CHANGE_REQUEST_IMPLEMENTATION_PLANNING_ONLY',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  REQUEST_TYPES: [
    'DATA_FIX',
    'CONTENT_UPDATE',
    'UI_FIX',
    'PERFORMANCE_FIX',
    'PROD_WRITE_POLICY_REQUEST',
    'NEW_RELEASE_REQUEST'
  ]
};


/**
 * Preview 3O-E.
 */
function kidlearnV3_previewProdChangeRequestImplementationPlanning3OEV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3oeCheckFunctions_([
      'kidlearnV3_assertProdChangeRequestApprovalGate3ODReadyV3',
      'kidlearnV3_getProdChangeRequestApprovalGate3ODStatusV3',
      'kidlearnV3_getProdChangeRequestWorkflow3OCStatusV3',
      'kidlearnV3_getProdReadonlySupportChangeGate3OBStatusV3',
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3OD =
    kidlearnV3_3oeSafeAssert_(
      'kidlearnV3_assertProdChangeRequestApprovalGate3ODReadyV3',
      '3O-D'
    );

  if (!phase3OD.success) {
    errors.push(
      '3O-D chưa READY_FOR_3O_E: ' +
      phase3OD.message
    );
  }

  var approvalGate =
    kidlearnV3_3oeSafeCall_(
      'kidlearnV3_getProdChangeRequestApprovalGate3ODStatusV3'
    );

  if (
    approvalGate.summary.status &&
    approvalGate.summary.status !== 'READY_FOR_3O_E'
  ) {
    errors.push(
      '3O-D approval gate chưa READY_FOR_3O_E. Status=' +
      approvalGate.summary.status
    );
  }

  var workflow =
    kidlearnV3_3oeSafeCall_(
      'kidlearnV3_getProdChangeRequestWorkflow3OCStatusV3'
    );

  if (
    workflow.summary.status &&
    workflow.summary.status !== 'READY_FOR_3O_D'
  ) {
    errors.push(
      '3O-C workflow chưa READY_FOR_3O_D. Status=' +
      workflow.summary.status
    );
  }

  var finalLock =
    kidlearnV3_3oeSafeCall_(
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
    kidlearnV3_3oeGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodCheck =
    kidlearnV3_3oeCheckFileAccessible_(
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
    kidlearnV3_3oeCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_CHANGE_REQUEST_IMPLEMENTATION_PLANNING_3OE_V3',
    bundle: '3O-E',
    phase: KIDLEARN_V3_PROD_CR_PLAN_3OE_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_CR_PLAN_3OE_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_CR_PLAN_3OE_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_CR_PLAN_3OE_CONFIG.WRITE_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    planningOnly: true,
    changeRequestExecutedNow: false,
    prodWritePolicyOpenedNow: false,
    rollbackExecutedNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3OD: phase3OD,
    approvalGate: approvalGate.summary,
    workflow: workflow.summary,
    finalLock: finalLock.summary,
    prodInfo: prodInfo,
    prodCheck: prodCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3O-E chỉ tạo implementation planning. Không execute request và không ghi PROD.'
  };

  kidlearnV3_3oeSaveResult_(
    result,
    KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Generate implementation planning package.
 */
function kidlearnV3_generateProdChangeRequestImplementationPlan3OEV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdChangeRequestImplementationPlanning3OEV3();

  if (!preview.success) {
    throw new Error(
      'Không thể generate implementation plan 3O-E vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var planId =
    kidlearnV3_3oeMakePlanId_();

  var prodInfo =
    kidlearnV3_3oeGetProdInfo_();

  var approvalGate =
    kidlearnV3_3oeSafeCall_(
      'kidlearnV3_getProdChangeRequestApprovalGate3ODStatusV3'
    );

  var workflow =
    kidlearnV3_3oeSafeCall_(
      'kidlearnV3_getProdChangeRequestWorkflow3OCStatusV3'
    );

  var supportGate =
    kidlearnV3_3oeSafeCall_(
      'kidlearnV3_getProdReadonlySupportChangeGate3OBStatusV3'
    );

  var finalLock =
    kidlearnV3_3oeSafeCall_(
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3'
    );

  var prodCheck =
    kidlearnV3_3oeCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi generate plan: ' +
      prodCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3oeCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var templates =
    kidlearnV3_3oeBuildImplementationTemplates_();

  var finishedAt = new Date();

  var planPackage = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_CHANGE_REQUEST_IMPLEMENTATION_PLAN_3OE_V3',
    bundle: '3O-E',
    phase: KIDLEARN_V3_PROD_CR_PLAN_3OE_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.PLAN_GENERATED
        : KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.FAILED,
    planId: planId,
    nextBundle:
      KIDLEARN_V3_PROD_CR_PLAN_3OE_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_PLAN_3OE_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    planningOnly: true,
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
      approvalGate3OD: approvalGate.summary,
      workflow3OC: workflow.summary,
      supportGate3OB: supportGate.summary,
      finalLock3NJ: finalLock.summary
    },

    implementationPlanningPolicy: {
      planningScope:
        'Prepare request-specific implementation plan only.',
      allowedNow: [
        'Phân loại request type',
        'Xác định impacted sheets/modules',
        'Xác định risk level',
        'Xác định required tests',
        'Xác định rollback strategy',
        'Xác định approval owner',
        'Xác định execution phase cần dùng'
      ],
      notAllowedNow: [
        'Không sửa PROD file',
        'Không execute change request',
        'Không mở PROD write',
        'Không migration',
        'Không rollback',
        'Không tạo release mới'
      ],
      minimumPlanFields: [
        'requestId',
        'requestType',
        'implementationMode',
        'impactedSheets',
        'riskLevel',
        'testPlan',
        'rollbackPlan',
        'approvalOwner',
        'executionGateRequired',
        'prodWriteRequired'
      ]
    },

    implementationTemplates: templates,

    executionRouting: {
      DATA_FIX:
        'Route to controlled data fix phase after explicit approval.',
      CONTENT_UPDATE:
        'Route to DEV content update → QA → controlled release phase.',
      UI_FIX:
        'Route to DEV UI fix → QA → deployment cycle.',
      PERFORMANCE_FIX:
        'Route to DEV optimization → performance baseline → release cycle.',
      PROD_WRITE_POLICY_REQUEST:
        'High risk. Route to dedicated PROD write policy gate.',
      NEW_RELEASE_REQUEST:
        'High risk. Route to new release pipeline with backup/dry-run/approval/deploy.'
    },

    planningChecklist: [
      {
        item: '3O-D approval gate ready',
        passed:
          approvalGate.summary.status === 'READY_FOR_3O_E'
      },
      {
        item: '3O-C workflow ready',
        passed:
          workflow.summary.status === 'READY_FOR_3O_D'
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
        item: 'Planning templates available for all request types',
        passed:
          templates.templateCount ===
          KIDLEARN_V3_PROD_CR_PLAN_3OE_CONFIG.REQUEST_TYPES.length
      }
    ],

    noSideEffect: {
      prodFileModifiedBy3OE: false,
      prodDataWrittenBy3OE: false,
      prodSheetCreatedBy3OE: false,
      prodSheetDeletedBy3OE: false,
      requestExecutedBy3OE: false,
      prodWritePolicyOpenedBy3OE: false,
      rollbackExecutedBy3OE: false
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

  kidlearnV3_3oeSavePlan_(
    planPackage
  );

  kidlearnV3_3oeSaveResult_(
    planPackage,
    planPackage.success
      ? KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.PLAN_GENERATED
      : KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.FAILED,
    KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS.LAST_PLAN_AT
  );

  console.log(JSON.stringify(planPackage, null, 2));

  if (!planPackage.success) {
    throw new Error(
      '3O-E implementation plan failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return planPackage;
}


/**
 * Run planning simulation.
 *
 * Simulation only:
 * - Không execute request.
 * - Không ghi PROD.
 * - Không mở PROD write.
 */
function kidlearnV3_runProdChangeRequestImplementationPlanningSimulation3OEV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var status =
    kidlearnV3_getProdChangeRequestImplementationPlanning3OEStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.PLAN_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.SIMULATION_PASSED &&
    status.status !== KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.READY_FOR_3O_F
  ) {
    errors.push(
      '3O-E cần PLAN_GENERATED trước khi chạy simulation. Status=' +
      status.status
    );
  }

  if (
    !status.lastPlan ||
    status.lastPlan.success !== true
  ) {
    errors.push(
      'Last implementation plan chưa success=true.'
    );
  }

  var safeModes =
    kidlearnV3_3oeCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var samplePlans =
    kidlearnV3_3oeBuildSampleImplementationPlans_();

  var reviewedPlans = [];

  for (var i = 0; i < samplePlans.length; i++) {
    var review =
      kidlearnV3_3oeReviewSampleImplementationPlan_(
        samplePlans[i]
      );

    reviewedPlans.push(review);

    errors =
      errors.concat(
        review.errors || []
      );

    warnings =
      warnings.concat(
        review.warnings || []
      );
  }

  var policyCheck =
    kidlearnV3_3oeValidatePlanningPolicy_(
      reviewedPlans
    );

  errors = errors.concat(policyCheck.errors);
  warnings = warnings.concat(policyCheck.warnings);

  var finishedAt = new Date();

  var simulation = {
    success: errors.length === 0,
    action: 'RUN_PROD_CHANGE_REQUEST_IMPLEMENTATION_PLANNING_SIMULATION_3OE_V3',
    bundle: '3O-E',
    phase: KIDLEARN_V3_PROD_CR_PLAN_3OE_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.SIMULATION_PASSED
        : KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.FAILED,
    planId: status.planId || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_PLAN_3OE_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_PLAN_3OE_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    planningOnly: true,
    changeRequestExecutedNow: false,
    prodWritePolicyOpenedNow: false,
    rollbackExecutedNow: false,
    samplePlanCount: samplePlans.length,
    reviewedPlanCount: reviewedPlans.length,
    reviewedPlans: reviewedPlans,
    policyCheck: policyCheck.summary,
    safeModes: safeModes.summary,
    simulationDecision:
      errors.length === 0
        ? 'READY_FOR_CONTROLLED_EXECUTION_GATE_3O_F'
        : 'HOLD_PLANNING_SIMULATION_FAILED',
    noSideEffect: {
      prodFileModifiedBy3OE: false,
      prodDataWrittenBy3OE: false,
      prodSheetCreatedBy3OE: false,
      prodSheetDeletedBy3OE: false,
      requestExecutedBy3OE: false,
      prodWritePolicyOpenedBy3OE: false,
      rollbackExecutedBy3OE: false
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

  kidlearnV3_3oeSaveSimulation_(
    simulation
  );

  kidlearnV3_3oeSaveResult_(
    simulation,
    simulation.success
      ? KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.SIMULATION_PASSED
      : KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.FAILED,
    KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS.LAST_SIMULATION_AT
  );

  console.log(JSON.stringify(simulation, null, 2));

  if (!simulation.success) {
    throw new Error(
      '3O-E planning simulation failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return simulation;
}


/**
 * Mark 3O-E ready.
 */
function kidlearnV3_markProdChangeRequestImplementationPlanning3OEReadyV3() {
  var status =
    kidlearnV3_getProdChangeRequestImplementationPlanning3OEStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.SIMULATION_PASSED &&
    status.status !== KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.READY_FOR_3O_F
  ) {
    errors.push(
      '3O-E chưa SIMULATION_PASSED. Status=' +
      status.status
    );
  }

  if (
    !status.lastPlan ||
    status.lastPlan.success !== true
  ) {
    errors.push(
      'Last plan chưa success=true.'
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

  if (!status.planId) {
    errors.push(
      'Thiếu planId.'
    );
  }

  var prodInfo =
    kidlearnV3_3oeGetProdInfo_();

  var prodCheck =
    kidlearnV3_3oeCheckFileAccessible_(
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
    kidlearnV3_3oeCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3O-E ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_CHANGE_REQUEST_IMPLEMENTATION_PLANNING_3OE_READY_V3',
    bundle: '3O-E',
    phase: KIDLEARN_V3_PROD_CR_PLAN_3OE_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.READY_FOR_3O_F,
    planId: status.planId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_PLAN_3OE_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_CR_PLAN_3OE_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    planningOnly: true,
    changeRequestExecutedNow: false,
    message:
      '3O-E ready. Implementation planning đã pass simulation. Bước tiếp theo là 3O-F controlled execution gate.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3oeSaveResult_(
    result,
    KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.READY_FOR_3O_F,
    KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3O-E status.
 */
function kidlearnV3_getProdChangeRequestImplementationPlanning3OEStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_CHANGE_REQUEST_IMPLEMENTATION_PLANNING_3OE_STATUS_V3',
    bundle: '3O-E',
    phase: KIDLEARN_V3_PROD_CR_PLAN_3OE_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.NOT_RUN,
    planId:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS.PLAN_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastPlanAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS.LAST_PLAN_AT
      ) ||
      '',
    lastSimulationAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS.LAST_SIMULATION_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3oeReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS.LAST_RESULT_JSON
      ),
    lastPlan:
      kidlearnV3_3oeReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS.LAST_PLAN_JSON
      ),
    lastSimulation:
      kidlearnV3_3oeReadJsonProperty_(
        KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS.LAST_SIMULATION_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3O-E ready.
 */
function kidlearnV3_assertProdChangeRequestImplementationPlanning3OEReadyV3() {
  var status =
    kidlearnV3_getProdChangeRequestImplementationPlanning3OEStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.READY_FOR_3O_F
  ) {
    errors.push(
      '3O-E chưa READY_FOR_3O_F. Status=' +
      status.status
    );
  }

  if (!status.planId) {
    errors.push(
      'Thiếu planId.'
    );
  }

  var prodInfo =
    kidlearnV3_3oeGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_CHANGE_REQUEST_IMPLEMENTATION_PLANNING_3OE_READY_V3',
    bundle: '3O-E',
    phase: KIDLEARN_V3_PROD_CR_PLAN_3OE_CONFIG.PHASE,
    status: status.status,
    planId: status.planId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_CR_PLAN_3OE_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3O-E chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3O-E.
 */
function kidlearnV3_getQaBatchSteps3OEV3() {
  return [
    {
      label: 'Assert 3O-D ready',
      functionName: 'kidlearnV3_assertProdChangeRequestApprovalGate3ODReadyV3'
    },
    {
      label: 'Preview PROD CR Implementation Planning 3O-E',
      functionName: 'kidlearnV3_previewProdChangeRequestImplementationPlanning3OEV3'
    },
    {
      label: 'Generate PROD CR Implementation Plan 3O-E',
      functionName: 'kidlearnV3_generateProdChangeRequestImplementationPlan3OEV3'
    },
    {
      label: 'Run PROD CR Implementation Planning Simulation 3O-E',
      functionName: 'kidlearnV3_runProdChangeRequestImplementationPlanningSimulation3OEV3'
    },
    {
      label: 'Mark PROD CR Implementation Planning 3O-E Ready',
      functionName: 'kidlearnV3_markProdChangeRequestImplementationPlanning3OEReadyV3'
    },
    {
      label: 'Assert PROD CR Implementation Planning 3O-E Ready',
      functionName: 'kidlearnV3_assertProdChangeRequestImplementationPlanning3OEReadyV3'
    }
  ];
}


/**
 * QA batch 3O-E.
 */
function kidlearnV3_runQaBatch3OEV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3O_E_PROD_CHANGE_REQUEST_IMPLEMENTATION_PLANNING',
    kidlearnV3_getQaBatchSteps3OEV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build implementation templates.
 */
function kidlearnV3_3oeBuildImplementationTemplates_() {
  var templates = [
    {
      requestType: 'DATA_FIX',
      implementationMode: 'CONTROLLED_DATA_FIX_PLANNING',
      impactedSheets: [
        'DATA_Users',
        'DATA_Children',
        'DATA_UserChildAccess'
      ],
      riskLevel: 'MEDIUM',
      prodWriteRequired: true,
      executionGateRequired: true,
      recommendedNextPhase: 'CONTROLLED_DATA_FIX_GATE',
      testPlan: [
        'Validate row counts before/after',
        'Validate userId/childId references',
        'Run role guard smoke',
        'Run PROD read-only monitoring after change'
      ],
      rollbackPlan: [
        'Backup affected rows',
        'Prepare revert sheet rows',
        'Rollback only through separate rollback gate'
      ]
    },
    {
      requestType: 'CONTENT_UPDATE',
      implementationMode: 'DEV_CONTENT_UPDATE_THEN_RELEASE',
      impactedSheets: [
        'MST_Lessons',
        'MST_LessonBlocks',
        'MST_Activities',
        'MST_Questions',
        'MST_QuestionOptions'
      ],
      riskLevel: 'MEDIUM',
      prodWriteRequired: false,
      executionGateRequired: true,
      recommendedNextPhase: 'NEW_RELEASE_OR_CONTENT_PATCH_GATE',
      testPlan: [
        'Validate lesson content',
        'Validate question references',
        'Run lesson content smoke',
        'Run post-deploy validation'
      ],
      rollbackPlan: [
        'Keep prior PROD file',
        'Create content patch backup',
        'Rollback through manual file switch or controlled release'
      ]
    },
    {
      requestType: 'UI_FIX',
      implementationMode: 'DEV_UI_FIX_THEN_RELEASE',
      impactedSheets: [],
      riskLevel: 'MEDIUM',
      prodWriteRequired: false,
      executionGateRequired: true,
      recommendedNextPhase: 'UI_FIX_RELEASE_GATE',
      testPlan: [
        'Run UI shell smoke',
        'Run learning interaction dry-run',
        'Run runtime smoke',
        'Run regression QA'
      ],
      rollbackPlan: [
        'Revert Apps Script version',
        'Use previous deployment package',
        'Rollback through release gate'
      ]
    },
    {
      requestType: 'PERFORMANCE_FIX',
      implementationMode: 'DEV_PERFORMANCE_OPTIMIZATION_THEN_RELEASE',
      impactedSheets: [],
      riskLevel: 'MEDIUM',
      prodWriteRequired: false,
      executionGateRequired: true,
      recommendedNextPhase: 'PERFORMANCE_FIX_RELEASE_GATE',
      testPlan: [
        'Run performance baseline',
        'Run async QA',
        'Check Apps Script execution time',
        'Run runtime smoke'
      ],
      rollbackPlan: [
        'Revert optimization',
        'Restore previous code version',
        'Run baseline again'
      ]
    },
    {
      requestType: 'PROD_WRITE_POLICY_REQUEST',
      implementationMode: 'DEDICATED_PROD_WRITE_POLICY_GATE',
      impactedSheets: [
        'LOG_Audit',
        'DATA_StudySessions',
        'DATA_LessonProgress',
        'DATA_DailyGoals',
        'DATA_Responses'
      ],
      riskLevel: 'HIGH',
      prodWriteRequired: true,
      executionGateRequired: true,
      recommendedNextPhase: 'PROD_WRITE_POLICY_APPROVAL_AND_TRIAL',
      testPlan: [
        'Run write policy dry-run',
        'Run one-row controlled write trial',
        'Run rollback plan review',
        'Run post-write validation'
      ],
      rollbackPlan: [
        'Disable write immediately',
        'Use rollback token',
        'Restore affected rows only through rollback phase'
      ]
    },
    {
      requestType: 'NEW_RELEASE_REQUEST',
      implementationMode: 'NEW_RELEASE_PIPELINE',
      impactedSheets: [
        'MULTIPLE'
      ],
      riskLevel: 'HIGH',
      prodWriteRequired: false,
      executionGateRequired: true,
      recommendedNextPhase: 'NEW_RELEASE_PLANNING_PIPELINE',
      testPlan: [
        'Create DEV candidate',
        'Backup DEV candidate',
        'Dry-run deployment rehearsal',
        'Approval gate',
        'Controlled PROD deployment',
        'Post-deploy validation'
      ],
      rollbackPlan: [
        'Keep previous PROD file',
        'Document switch-back procedure',
        'Rollback through separate phase'
      ]
    }
  ];

  return {
    templateCount: templates.length,
    templates: templates
  };
}


/**
 * Build sample implementation plans.
 */
function kidlearnV3_3oeBuildSampleImplementationPlans_() {
  var templates =
    kidlearnV3_3oeBuildImplementationTemplates_().templates;

  var samplePlans = [];

  for (var i = 0; i < templates.length; i++) {
    var template =
      templates[i];

    samplePlans.push({
      requestId:
        'SAMPLE_IMPL_3OE_' +
        template.requestType,
      requestType:
        template.requestType,
      implementationMode:
        template.implementationMode,
      impactedSheets:
        template.impactedSheets,
      riskLevel:
        template.riskLevel,
      prodWriteRequired:
        template.prodWriteRequired,
      executionGateRequired:
        template.executionGateRequired,
      recommendedNextPhase:
        template.recommendedNextPhase,
      approvalOwner:
        template.riskLevel === 'HIGH'
          ? 'RELEASE_OWNER'
          : 'FAMILY_ADMIN_OWNER',
      testPlan:
        template.testPlan,
      rollbackPlan:
        template.rollbackPlan,
      executeNow:
        false,
      approveNow:
        false,
      openProdWriteNow:
        false
    });
  }

  return samplePlans;
}


/**
 * Review sample implementation plan.
 */
function kidlearnV3_3oeReviewSampleImplementationPlan_(plan) {
  var errors = [];
  var warnings = [];

  var requiredFields = [
    'requestId',
    'requestType',
    'implementationMode',
    'riskLevel',
    'approvalOwner',
    'recommendedNextPhase'
  ];

  for (var i = 0; i < requiredFields.length; i++) {
    var field =
      requiredFields[i];

    if (!String(plan[field] || '').trim()) {
      errors.push(
        'Plan ' +
        plan.requestId +
        ' thiếu field: ' +
        field
      );
    }
  }

  if (
    KIDLEARN_V3_PROD_CR_PLAN_3OE_CONFIG.REQUEST_TYPES
      .indexOf(plan.requestType) < 0
  ) {
    errors.push(
      'Plan có requestType không hợp lệ: ' +
      plan.requestType
    );
  }

  if (
    !plan.testPlan ||
    !Array.isArray(plan.testPlan) ||
    plan.testPlan.length < 1
  ) {
    errors.push(
      'Plan thiếu testPlan: ' +
      plan.requestId
    );
  }

  if (
    !plan.rollbackPlan ||
    !Array.isArray(plan.rollbackPlan) ||
    plan.rollbackPlan.length < 1
  ) {
    errors.push(
      'Plan thiếu rollbackPlan: ' +
      plan.requestId
    );
  }

  if (plan.executeNow === true) {
    errors.push(
      '3O-E không được execute plan: ' +
      plan.requestId
    );
  }

  if (plan.approveNow === true) {
    errors.push(
      '3O-E không được approve request cụ thể: ' +
      plan.requestId
    );
  }

  if (plan.openProdWriteNow === true) {
    errors.push(
      '3O-E không được mở PROD write: ' +
      plan.requestId
    );
  }

  if (
    plan.riskLevel === 'HIGH' &&
    plan.executionGateRequired !== true
  ) {
    errors.push(
      'High-risk plan phải executionGateRequired=true: ' +
      plan.requestId
    );
  }

  return {
    success: errors.length === 0,
    requestId: plan.requestId || '',
    requestType: plan.requestType || '',
    implementationMode: plan.implementationMode || '',
    riskLevel: plan.riskLevel || '',
    prodWriteRequired: plan.prodWriteRequired === true,
    executionGateRequired: plan.executionGateRequired === true,
    recommendedNextPhase: plan.recommendedNextPhase || '',
    approvalOwner: plan.approvalOwner || '',
    executeNow: plan.executeNow === true,
    approveNow: plan.approveNow === true,
    openProdWriteNow: plan.openProdWriteNow === true,
    planningDecision:
      errors.length === 0
        ? 'PLAN_ACCEPTED_FOR_NEXT_GATE_ONLY'
        : 'PLAN_REJECTED_IN_SIMULATION',
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Validate planning policy.
 */
function kidlearnV3_3oeValidatePlanningPolicy_(reviewedPlans) {
  var errors = [];
  var warnings = [];

  for (var i = 0; i < reviewedPlans.length; i++) {
    var item =
      reviewedPlans[i];

    if (item.executeNow === true) {
      errors.push(
        'Planning policy violation: executeNow=true for ' +
        item.requestId
      );
    }

    if (item.approveNow === true) {
      errors.push(
        'Planning policy violation: approveNow=true for ' +
        item.requestId
      );
    }

    if (item.openProdWriteNow === true) {
      errors.push(
        'Planning policy violation: openProdWriteNow=true for ' +
        item.requestId
      );
    }

    if (
      item.riskLevel === 'HIGH' &&
      item.executionGateRequired !== true
    ) {
      errors.push(
        'High-risk request missing execution gate: ' +
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
      reviewedPlanCount: reviewedPlans.length,
      highRiskPlanCount:
        reviewedPlans.filter(function(item) {
          return item.riskLevel === 'HIGH';
        }).length,
      prodWriteRequiredCount:
        reviewedPlans.filter(function(item) {
          return item.prodWriteRequired === true;
        }).length,
      executeNowCount:
        reviewedPlans.filter(function(item) {
          return item.executeNow === true;
        }).length,
      approveNowCount:
        reviewedPlans.filter(function(item) {
          return item.approveNow === true;
        }).length,
      openProdWriteNowCount:
        reviewedPlans.filter(function(item) {
          return item.openProdWriteNow === true;
        }).length
    }
  };
}


/**
 * PROD info từ 3N-F.
 */
function kidlearnV3_3oeGetProdInfo_() {
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
function kidlearnV3_3oeCheckFileAccessible_(fileId, label) {
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
function kidlearnV3_3oeCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3oeSafeWriteStatus_();

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
    kidlearnV3_3oeControlledWriteStatus_();

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
function kidlearnV3_3oeSafeAssert_(functionName, label) {
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
function kidlearnV3_3oeSafeCall_(functionName) {
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
        kidlearnV3_3oeSummarizeStatusOutput_(
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
function kidlearnV3_3oeSummarizeStatusOutput_(output) {
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
    approvalGateId: output.approvalGateId || '',
    workflowId: output.workflowId || '',
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
function kidlearnV3_3oeSafeWriteStatus_() {
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
function kidlearnV3_3oeControlledWriteStatus_() {
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
function kidlearnV3_3oeCheckFunctions_(names) {
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
 * Plan ID.
 */
function kidlearnV3_3oeMakePlanId_() {
  return (
    'PROD_CR_PLAN_3OE_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


/**
 * Save plan.
 */
function kidlearnV3_3oeSavePlan_(planPackage) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS.PLAN_ID,
    planPackage.planId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS.LAST_PLAN_JSON,
    JSON.stringify(planPackage)
  );
}


/**
 * Save simulation.
 */
function kidlearnV3_3oeSaveSimulation_(simulation) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS.LAST_SIMULATION_JSON,
      JSON.stringify(simulation)
    );
}


/**
 * Save result.
 */
function kidlearnV3_3oeSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.READY_FOR_3O_F &&
    (
      status === KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.PLAN_GENERATED ||
      status === KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.SIMULATION_PASSED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_CR_PLAN_3OE_STATUS.READY_FOR_3O_F;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_CR_PLAN_3OE_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      planId: result.planId || '',
      prodFileId: result.prodFileId || '',
      prodFileUrl: result.prodFileUrl || '',
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
      planningOnly: true,
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
function kidlearnV3_3oeReadJsonProperty_(key) {
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