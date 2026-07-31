/**
 * ================================================================
 * KIDLEARN V3 - PROD READ-ONLY SUPPORT & CHANGE REQUEST GATE
 * Bundle: 3O-B
 * Version: 3.1.0
 * ================================================================
 *
 * 3O-B:
 * - Tạo support package cho PROD read-only.
 * - Tạo change request gate ở trạng thái CLOSED.
 * - Không ghi vào PROD file.
 * - Không mở PROD write policy.
 * - Không approve change request.
 * - Không migration.
 * - Không rollback.
 * - Chỉ ghi ScriptProperties trong DEV script để lưu support/status.
 */


var KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3OB_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3OB_LAST_PREVIEW_AT',
  LAST_SUPPORT_REVIEW_AT: 'KIDLEARN_V3_PHASE_3OB_LAST_SUPPORT_REVIEW_AT',
  LAST_PACKAGE_AT: 'KIDLEARN_V3_PHASE_3OB_LAST_PACKAGE_AT',
  LAST_GATE_AT: 'KIDLEARN_V3_PHASE_3OB_LAST_GATE_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3OB_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3OB_LAST_RESULT_JSON',
  LAST_SUPPORT_REVIEW_JSON: 'KIDLEARN_V3_PHASE_3OB_LAST_SUPPORT_REVIEW_JSON',
  LAST_PACKAGE_JSON: 'KIDLEARN_V3_PHASE_3OB_LAST_PACKAGE_JSON',
  LAST_GATE_JSON: 'KIDLEARN_V3_PHASE_3OB_LAST_GATE_JSON',
  SUPPORT_PACKAGE_ID: 'KIDLEARN_V3_PHASE_3OB_SUPPORT_PACKAGE_ID',
  CHANGE_GATE_ID: 'KIDLEARN_V3_PHASE_3OB_CHANGE_GATE_ID',
  CHANGE_GATE_STATUS: 'KIDLEARN_V3_PHASE_3OB_CHANGE_GATE_STATUS'
};


var KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  SUPPORT_REVIEW_PASSED: 'SUPPORT_REVIEW_PASSED',
  SUPPORT_PACKAGE_GENERATED: 'SUPPORT_PACKAGE_GENERATED',
  CHANGE_GATE_INITIALIZED: 'CHANGE_GATE_INITIALIZED',
  READY_FOR_3O_C: 'READY_FOR_3O_C',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_SUPPORT_3OB_GATE_STATUS = {
  CLOSED: 'CLOSED',
  OPEN_FOR_INTAKE_ONLY: 'OPEN_FOR_INTAKE_ONLY',
  APPROVAL_REQUIRED: 'APPROVAL_REQUIRED'
};


var KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG = {
  VERSION: '3O-B',
  PHASE: '3O-B',
  NEXT_BUNDLE: '3O-C',
  NEXT_STAGE: 'PROD_CHANGE_REQUEST_REVIEW_WORKFLOW',
  WRITE_MODE: 'PROD_READ_ONLY_SUPPORT_CHANGE_GATE',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  DEFAULT_CHANGE_GATE_STATUS: 'CLOSED',
  MAX_SUPPORT_SAMPLE_ROWS: 50
};


/**
 * Preview 3O-B.
 */
function kidlearnV3_previewProdReadonlySupportChangeGate3OBV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3obCheckFunctions_([
      'kidlearnV3_assertProdReadonlyMonitoringOnboarding3OAReadyV3',
      'kidlearnV3_getProdReadonlyMonitoringOnboarding3OAStatusV3',
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3OA =
    kidlearnV3_3obSafeAssert_(
      'kidlearnV3_assertProdReadonlyMonitoringOnboarding3OAReadyV3',
      '3O-A'
    );

  if (!phase3OA.success) {
    errors.push(
      '3O-A chưa READY_FOR_3O_B: ' +
      phase3OA.message
    );
  }

  var finalLock =
    kidlearnV3_3obSafeCall_(
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
    kidlearnV3_3obGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodFileCheck =
    kidlearnV3_3obCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodFileCheck.success) {
    errors.push(
      'PROD file chưa accessible: ' +
      prodFileCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3obCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_READONLY_SUPPORT_CHANGE_GATE_3OB_V3',
    bundle: '3O-B',
    phase: KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.WRITE_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    defaultChangeGateStatus:
      KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.DEFAULT_CHANGE_GATE_STATUS,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3OA: phase3OA,
    finalLock: finalLock.summary,
    prodInfo: prodInfo,
    prodFileCheck: prodFileCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3O-B chỉ tạo support package và change request gate. Không ghi vào PROD file.'
  };

  kidlearnV3_3obSaveResult_(
    result,
    KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Run support readiness review.
 */
function kidlearnV3_runProdReadonlySupportReview3OBV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdReadonlySupportChangeGate3OBV3();

  if (!preview.success) {
    throw new Error(
      'Không thể chạy support review 3O-B vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var prodInfo =
    kidlearnV3_3obGetProdInfo_();

  var prodSpreadsheet =
    SpreadsheetApp.openById(
      prodInfo.prodFileId
    );

  var prodOverview =
    kidlearnV3_3obBuildProdOverview_(
      prodSpreadsheet
    );

  errors = errors.concat(prodOverview.errors);
  warnings = warnings.concat(prodOverview.warnings);

  var monitoringStatus =
    kidlearnV3_3obSafeCall_(
      'kidlearnV3_getProdReadonlyMonitoringOnboarding3OAStatusV3'
    );

  var finalLockStatus =
    kidlearnV3_3obSafeCall_(
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3'
    );

  var handoverStatus =
    kidlearnV3_3obSafeCall_(
      'kidlearnV3_getProdReleaseHandover3NIStatusV3'
    );

  var runtimeSmokeStatus =
    kidlearnV3_3obSafeCall_(
      'kidlearnV3_getProdRuntimeSmokeTest3NHStatusV3'
    );

  var validationStatus =
    kidlearnV3_3obSafeCall_(
      'kidlearnV3_getProdPostDeployValidation3NGStatusV3'
    );

  var safeModes =
    kidlearnV3_3obCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var currentGate =
    kidlearnV3_3obGetCurrentChangeGate_();

  var finishedAt = new Date();

  var review = {
    success: errors.length === 0,
    action: 'RUN_PROD_READONLY_SUPPORT_REVIEW_3OB_V3',
    bundle: '3O-B',
    phase: KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.SUPPORT_REVIEW_PASSED
        : KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.FAILED,
    nextBundle:
      KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId,
    prodFileUrl: prodInfo.prodFileUrl,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    supportReadiness: {
      prodOverview: prodOverview.summary,
      monitoring3OA: monitoringStatus.summary,
      finalLock3NJ: finalLockStatus.summary,
      handover3NI: handoverStatus.summary,
      runtimeSmoke3NH: runtimeSmokeStatus.summary,
      validation3NG: validationStatus.summary,
      safeModes: safeModes.summary,
      currentChangeGate: currentGate
    },
    supportDecision:
      errors.length === 0
        ? 'READY_TO_GENERATE_SUPPORT_PACKAGE'
        : 'HOLD_SUPPORT_REVIEW_FAILED',
    noSideEffect: {
      prodFileModifiedBy3OB: false,
      prodDataWrittenBy3OB: false,
      prodSheetCreatedBy3OB: false,
      prodSheetDeletedBy3OB: false
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

  kidlearnV3_3obSaveSupportReview_(
    review
  );

  kidlearnV3_3obSaveResult_(
    review,
    review.success
      ? KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.SUPPORT_REVIEW_PASSED
      : KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.FAILED,
    KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.LAST_SUPPORT_REVIEW_AT
  );

  console.log(JSON.stringify(review, null, 2));

  if (!review.success) {
    throw new Error(
      '3O-B support review failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return review;
}


/**
 * Generate support package.
 */
function kidlearnV3_generateProdReadonlySupportPackage3OBV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var status =
    kidlearnV3_getProdReadonlySupportChangeGate3OBStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.SUPPORT_REVIEW_PASSED &&
    status.status !== KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.SUPPORT_PACKAGE_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.CHANGE_GATE_INITIALIZED &&
    status.status !== KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.READY_FOR_3O_C
  ) {
    errors.push(
      '3O-B cần SUPPORT_REVIEW_PASSED trước khi generate support package. Status=' +
      status.status
    );
  }

  if (
    !status.lastSupportReview ||
    status.lastSupportReview.success !== true
  ) {
    errors.push(
      'Last support review chưa success=true.'
    );
  }

  var prodInfo =
    kidlearnV3_3obGetProdInfo_();

  var prodFileCheck =
    kidlearnV3_3obCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodFileCheck.success) {
    errors.push(
      'PROD file không accessible khi generate support package: ' +
      prodFileCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3obCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var supportPackageId =
    kidlearnV3_3obMakeSupportPackageId_();

  var finishedAt = new Date();

  var supportPackage = {
    success: errors.length === 0,
    action: 'GENERATE_PROD_READONLY_SUPPORT_PACKAGE_3OB_V3',
    bundle: '3O-B',
    phase: KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.SUPPORT_PACKAGE_GENERATED
        : KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.FAILED,
    supportPackageId: supportPackageId,
    nextBundle:
      KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,

    prodAccess: {
      prodFileId: prodInfo.prodFileId || '',
      prodFileName: prodInfo.prodFileName || '',
      prodFileUrl: prodInfo.prodFileUrl || '',
      deploymentId: prodInfo.deploymentId || ''
    },

    supportPolicy: {
      currentMode: 'PROD_READ_ONLY',
      writePolicy: 'NOT_ENABLED',
      supportScope: [
        'Kiểm tra truy cập PROD file',
        'Kiểm tra dữ liệu user/child/access',
        'Kiểm tra nội dung bài học',
        'Ghi nhận issue hoặc change request',
        'Phân loại yêu cầu: data/content/ui/bug/write-policy'
      ],
      outOfScopeWithoutNewApproval: [
        'Ghi dữ liệu thật vào PROD',
        'Xóa/sửa sheet cấu trúc',
        'Migration dữ liệu mới',
        'Rollback',
        'Deploy file mới',
        'Mở real write'
      ]
    },

    issueCategories: [
      {
        code: 'ACCESS',
        label: 'Lỗi truy cập hoặc phân quyền'
      },
      {
        code: 'DATA_USER_CHILD',
        label: 'Thiếu hoặc sai user/child/access'
      },
      {
        code: 'CONTENT',
        label: 'Sai hoặc thiếu bài học/câu hỏi'
      },
      {
        code: 'UI_RUNTIME',
        label: 'Lỗi hiển thị hoặc runtime UI'
      },
      {
        code: 'PERFORMANCE',
        label: 'Chậm hoặc timeout'
      },
      {
        code: 'WRITE_POLICY',
        label: 'Yêu cầu mở ghi dữ liệu PROD'
      }
    ],

    changeRequestPolicy: {
      gateStatusAfter3OB:
        KIDLEARN_V3_PROD_SUPPORT_3OB_GATE_STATUS.CLOSED,
      intakeAllowedNow: false,
      approvalRequiredForAllChanges: true,
      nextPhaseForWorkflow:
        KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.NEXT_BUNDLE,
      minimumRequiredFields: [
        'requestType',
        'requestedBy',
        'businessReason',
        'affectedArea',
        'riskLevel',
        'rollbackNeed',
        'approvalOwner'
      ],
      allowedRequestTypes: [
        'DATA_FIX',
        'CONTENT_UPDATE',
        'UI_FIX',
        'PERFORMANCE_FIX',
        'PROD_WRITE_POLICY_REQUEST',
        'NEW_RELEASE_REQUEST'
      ]
    },

    familySupportGuide: {
      title: 'KIDLEARN V3 PROD Support Guide',
      currentStatus: 'PROD locked, read-only monitoring mode',
      familyAdminShouldDo: [
        'Mở PROD file bằng prodFileUrl.',
        'Kiểm tra DATA_Users, DATA_Children, DATA_UserChildAccess.',
        'Kiểm tra MST_Subjects, MST_Lessons, MST_Questions.',
        'Ghi nhận issue nếu dữ liệu hoặc nội dung chưa đúng.',
        'Không tự sửa cấu trúc sheet khi chưa có approval.'
      ],
      childShouldExpect: [
        'Màn hình học có thể chạy ở chế độ đọc.',
        'Tiến độ thật chưa được ghi cho đến khi mở PROD write policy.',
        'Nếu không có bài học/câu hỏi, hệ thống có thể hiển thị empty state.'
      ]
    },

    escalationRules: [
      {
        condition: 'PROD file inaccessible',
        action: 'Stop onboarding and check Drive permission.'
      },
      {
        condition: 'Missing child/access data',
        action: 'Create change request for DATA_USER_CHILD.'
      },
      {
        condition: 'Need real progress tracking',
        action: 'Create PROD_WRITE_POLICY_REQUEST. Do not enable write directly.'
      },
      {
        condition: 'Need content update',
        action: 'Create CONTENT_UPDATE change request and review in 3O-C.'
      }
    ],

    safeModes: safeModes.summary,

    noSideEffect: {
      prodFileModifiedBy3OB: false,
      prodDataWrittenBy3OB: false,
      prodSheetCreatedBy3OB: false,
      prodSheetDeletedBy3OB: false
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

  kidlearnV3_3obSaveSupportPackage_(
    supportPackage
  );

  kidlearnV3_3obSaveResult_(
    supportPackage,
    supportPackage.success
      ? KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.SUPPORT_PACKAGE_GENERATED
      : KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.FAILED,
    KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.LAST_PACKAGE_AT
  );

  console.log(JSON.stringify(supportPackage, null, 2));

  if (!supportPackage.success) {
    throw new Error(
      '3O-B support package failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return supportPackage;
}


/**
 * Initialize change request gate.
 *
 * Gate mặc định CLOSED.
 * Không approve request.
 * Không mở write.
 */
function kidlearnV3_initializeProdChangeRequestGate3OBV3() {
  var status =
    kidlearnV3_getProdReadonlySupportChangeGate3OBStatusV3();

  var errors = [];
  var warnings = [];

  if (
    status.status !== KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.SUPPORT_PACKAGE_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.CHANGE_GATE_INITIALIZED &&
    status.status !== KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.READY_FOR_3O_C
  ) {
    errors.push(
      '3O-B cần SUPPORT_PACKAGE_GENERATED trước khi initialize gate. Status=' +
      status.status
    );
  }

  if (
    !status.lastPackage ||
    status.lastPackage.success !== true
  ) {
    errors.push(
      'Last support package chưa success=true.'
    );
  }

  var safeModes =
    kidlearnV3_3obCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  if (errors.length > 0) {
    throw new Error(
      'Không thể initialize change request gate 3O-B. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var gateId =
    kidlearnV3_3obMakeChangeGateId_();

  var gate = {
    success: true,
    action: 'INITIALIZE_PROD_CHANGE_REQUEST_GATE_3OB_V3',
    bundle: '3O-B',
    phase: KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.CHANGE_GATE_INITIALIZED,
    changeGateId: gateId,
    changeGateStatus:
      KIDLEARN_V3_PROD_SUPPORT_3OB_GATE_STATUS.CLOSED,
    nextBundle:
      KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    approvalRequiredForChanges: true,
    message:
      'Change request gate initialized as CLOSED. 3O-C sẽ thiết kế workflow review request nếu cần.',
    safeModes: safeModes.summary,
    initializedAt:
      new Date().toISOString(),
    warningCount: warnings.length,
    warnings: warnings
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.CHANGE_GATE_ID,
    gateId
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.CHANGE_GATE_STATUS,
    KIDLEARN_V3_PROD_SUPPORT_3OB_GATE_STATUS.CLOSED
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.LAST_GATE_JSON,
    JSON.stringify(gate)
  );

  kidlearnV3_3obSaveResult_(
    gate,
    KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.CHANGE_GATE_INITIALIZED,
    KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.LAST_GATE_AT
  );

  console.log(JSON.stringify(gate, null, 2));

  return gate;
}


/**
 * Mark 3O-B ready.
 */
function kidlearnV3_markProdReadonlySupportChangeGate3OBReadyV3() {
  var status =
    kidlearnV3_getProdReadonlySupportChangeGate3OBStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.CHANGE_GATE_INITIALIZED &&
    status.status !== KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.READY_FOR_3O_C
  ) {
    errors.push(
      '3O-B chưa CHANGE_GATE_INITIALIZED. Status=' +
      status.status
    );
  }

  if (
    !status.lastSupportReview ||
    status.lastSupportReview.success !== true
  ) {
    errors.push(
      'Last support review chưa success=true.'
    );
  }

  if (
    !status.lastPackage ||
    status.lastPackage.success !== true
  ) {
    errors.push(
      'Last support package chưa success=true.'
    );
  }

  if (
    !status.lastGate ||
    status.lastGate.success !== true
  ) {
    errors.push(
      'Last change gate chưa success=true.'
    );
  }

  if (!status.changeGateId) {
    errors.push(
      'Thiếu changeGateId.'
    );
  }

  if (
    status.changeGateStatus !== KIDLEARN_V3_PROD_SUPPORT_3OB_GATE_STATUS.CLOSED
  ) {
    errors.push(
      'Change gate phải CLOSED ở cuối 3O-B. Current=' +
      status.changeGateStatus
    );
  }

  var prodInfo =
    kidlearnV3_3obGetProdInfo_();

  var prodCheck =
    kidlearnV3_3obCheckFileAccessible_(
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
    kidlearnV3_3obCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3O-B ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_READONLY_SUPPORT_CHANGE_GATE_3OB_READY_V3',
    bundle: '3O-B',
    phase: KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.READY_FOR_3O_C,
    supportPackageId: status.supportPackageId || '',
    changeGateId: status.changeGateId || '',
    changeGateStatus: status.changeGateStatus || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    message:
      '3O-B ready. Support package đã tạo và change request gate đang CLOSED. Bước tiếp theo là 3O-C.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3obSaveResult_(
    result,
    KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.READY_FOR_3O_C,
    KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3O-B status.
 */
function kidlearnV3_getProdReadonlySupportChangeGate3OBStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_READONLY_SUPPORT_CHANGE_GATE_3OB_STATUS_V3',
    bundle: '3O-B',
    phase: KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.NOT_RUN,
    supportPackageId:
      properties.getProperty(
        KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.SUPPORT_PACKAGE_ID
      ) ||
      '',
    changeGateId:
      properties.getProperty(
        KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.CHANGE_GATE_ID
      ) ||
      '',
    changeGateStatus:
      properties.getProperty(
        KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.CHANGE_GATE_STATUS
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastSupportReviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.LAST_SUPPORT_REVIEW_AT
      ) ||
      '',
    lastPackageAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.LAST_PACKAGE_AT
      ) ||
      '',
    lastGateAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.LAST_GATE_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3obReadJsonProperty_(
        KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.LAST_RESULT_JSON
      ),
    lastSupportReview:
      kidlearnV3_3obReadJsonProperty_(
        KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.LAST_SUPPORT_REVIEW_JSON
      ),
    lastPackage:
      kidlearnV3_3obReadJsonProperty_(
        KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.LAST_PACKAGE_JSON
      ),
    lastGate:
      kidlearnV3_3obReadJsonProperty_(
        KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.LAST_GATE_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3O-B ready.
 */
function kidlearnV3_assertProdReadonlySupportChangeGate3OBReadyV3() {
  var status =
    kidlearnV3_getProdReadonlySupportChangeGate3OBStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.READY_FOR_3O_C
  ) {
    errors.push(
      '3O-B chưa READY_FOR_3O_C. Status=' +
      status.status
    );
  }

  if (!status.supportPackageId) {
    errors.push(
      'Thiếu supportPackageId.'
    );
  }

  if (!status.changeGateId) {
    errors.push(
      'Thiếu changeGateId.'
    );
  }

  if (
    status.changeGateStatus !== KIDLEARN_V3_PROD_SUPPORT_3OB_GATE_STATUS.CLOSED
  ) {
    errors.push(
      'Change gate chưa CLOSED. Current=' +
      status.changeGateStatus
    );
  }

  var prodInfo =
    kidlearnV3_3obGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_READONLY_SUPPORT_CHANGE_GATE_3OB_READY_V3',
    bundle: '3O-B',
    phase: KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.PHASE,
    status: status.status,
    supportPackageId: status.supportPackageId || '',
    changeGateId: status.changeGateId || '',
    changeGateStatus: status.changeGateStatus || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3O-B chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3O-B.
 */
function kidlearnV3_getQaBatchSteps3OBV3() {
  return [
    {
      label: 'Assert 3O-A ready',
      functionName: 'kidlearnV3_assertProdReadonlyMonitoringOnboarding3OAReadyV3'
    },
    {
      label: 'Preview PROD Support Change Gate 3O-B',
      functionName: 'kidlearnV3_previewProdReadonlySupportChangeGate3OBV3'
    },
    {
      label: 'Run PROD Support Review 3O-B',
      functionName: 'kidlearnV3_runProdReadonlySupportReview3OBV3'
    },
    {
      label: 'Generate PROD Support Package 3O-B',
      functionName: 'kidlearnV3_generateProdReadonlySupportPackage3OBV3'
    },
    {
      label: 'Initialize Change Request Gate 3O-B',
      functionName: 'kidlearnV3_initializeProdChangeRequestGate3OBV3'
    },
    {
      label: 'Mark PROD Support Change Gate 3O-B Ready',
      functionName: 'kidlearnV3_markProdReadonlySupportChangeGate3OBReadyV3'
    },
    {
      label: 'Assert PROD Support Change Gate 3O-B Ready',
      functionName: 'kidlearnV3_assertProdReadonlySupportChangeGate3OBReadyV3'
    }
  ];
}


/**
 * QA batch 3O-B.
 */
function kidlearnV3_runQaBatch3OBV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3O_B_PROD_READONLY_SUPPORT_CHANGE_REQUEST_GATE',
    kidlearnV3_getQaBatchSteps3OBV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build PROD overview.
 */
function kidlearnV3_3obBuildProdOverview_(spreadsheet) {
  var errors = [];
  var warnings = [];

  var requiredSheets = [
    'SYS_Config',
    'SYS_SchemaVersion',
    'DATA_Users',
    'DATA_Children',
    'DATA_UserChildAccess',
    'MST_Subjects',
    'MST_Lessons',
    'MST_Questions',
    'LOG_Audit'
  ];

  var items = [];

  for (var i = 0; i < requiredSheets.length; i++) {
    var sheet =
      kidlearnV3_3obGetSheet_(
        spreadsheet,
        requiredSheets[i]
      );

    var exists =
      sheet ? true : false;

    items.push({
      sheetName: requiredSheets[i],
      exists: exists,
      lastRow: sheet ? sheet.getLastRow() : 0,
      lastColumn: sheet ? sheet.getLastColumn() : 0
    });

    if (!exists) {
      errors.push(
        'PROD thiếu support-critical sheet: ' +
        requiredSheets[i]
      );
    }
  }

  var users =
    kidlearnV3_3obReadSheetObjects_(
      spreadsheet,
      'DATA_Users',
      KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.MAX_SUPPORT_SAMPLE_ROWS
    );

  var children =
    kidlearnV3_3obReadSheetObjects_(
      spreadsheet,
      'DATA_Children',
      KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.MAX_SUPPORT_SAMPLE_ROWS
    );

  var subjects =
    kidlearnV3_3obReadSheetObjects_(
      spreadsheet,
      'MST_Subjects',
      KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.MAX_SUPPORT_SAMPLE_ROWS
    );

  if (!users.success) errors = errors.concat(users.errors);
  if (!children.success) errors = errors.concat(children.errors);
  if (!subjects.success) errors = errors.concat(subjects.errors);

  if (users.records.length < 1) {
    warnings.push(
      'PROD DATA_Users chưa có user data row trong sample.'
    );
  }

  if (children.records.length < 1) {
    warnings.push(
      'PROD DATA_Children chưa có child data row trong sample.'
    );
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    items: items,
    summary: {
      spreadsheetId: spreadsheet.getId(),
      spreadsheetName: spreadsheet.getName(),
      spreadsheetUrl: spreadsheet.getUrl(),
      checkedSheetCount: items.length,
      missingSheetCount:
        items.filter(function(item) {
          return !item.exists;
        }).length,
      userSampleCount: users.records.length,
      childSampleCount: children.records.length,
      subjectSampleCount: subjects.records.length
    }
  };
}


/**
 * Read sheet objects from row 2 keys.
 */
function kidlearnV3_3obReadSheetObjects_(spreadsheet, sheetName, maxRows) {
  var errors = [];
  var warnings = [];
  var records = [];

  var sheet =
    kidlearnV3_3obGetSheet_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return {
      success: false,
      sheetName: sheetName,
      errorCount: 1,
      warningCount: 0,
      errors: [
        'Thiếu sheet: ' + sheetName
      ],
      warnings: [],
      records: []
    };
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (lastRow < 2 || lastColumn < 1) {
    warnings.push(
      sheetName +
      ' chưa có đủ header/key rows.'
    );

    return {
      success: true,
      sheetName: sheetName,
      errorCount: 0,
      warningCount: warnings.length,
      errors: [],
      warnings: warnings,
      records: []
    };
  }

  var keys =
    sheet
      .getRange(2, 1, 1, lastColumn)
      .getDisplayValues()[0];

  var dataRowCount =
    Math.max(
      0,
      Math.min(
        lastRow - 2,
        maxRows || KIDLEARN_V3_PROD_SUPPORT_3OB_CONFIG.MAX_SUPPORT_SAMPLE_ROWS
      )
    );

  if (dataRowCount < 1) {
    return {
      success: true,
      sheetName: sheetName,
      errorCount: 0,
      warningCount: warnings.length,
      errors: [],
      warnings: warnings,
      records: []
    };
  }

  var values =
    sheet
      .getRange(3, 1, dataRowCount, lastColumn)
      .getDisplayValues();

  for (var r = 0; r < values.length; r++) {
    var obj = {};
    var hasValue = false;

    for (var c = 0; c < lastColumn; c++) {
      var key =
        String(keys[c] || '').trim();

      if (!key) {
        continue;
      }

      var value =
        values[r][c];

      if (String(value || '').trim()) {
        hasValue = true;
      }

      obj[key] = value;
    }

    if (hasValue) {
      records.push(obj);
    }
  }

  return {
    success: errors.length === 0,
    sheetName: sheetName,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    records: records
  };
}


/**
 * Current change gate.
 */
function kidlearnV3_3obGetCurrentChangeGate_() {
  var properties =
    PropertiesService.getScriptProperties();

  return {
    changeGateId:
      properties.getProperty(
        KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.CHANGE_GATE_ID
      ) || '',
    changeGateStatus:
      properties.getProperty(
        KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.CHANGE_GATE_STATUS
      ) || ''
  };
}


/**
 * PROD info từ 3N-F.
 */
function kidlearnV3_3obGetProdInfo_() {
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
function kidlearnV3_3obCheckFileAccessible_(fileId, label) {
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
function kidlearnV3_3obCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3obSafeWriteStatus_();

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
    kidlearnV3_3obControlledWriteStatus_();

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
function kidlearnV3_3obGetSheet_(spreadsheet, sheetName) {
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
function kidlearnV3_3obSafeAssert_(functionName, label) {
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
function kidlearnV3_3obSafeCall_(functionName) {
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
        kidlearnV3_3obSummarizeStatusOutput_(
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
function kidlearnV3_3obSummarizeStatusOutput_(output) {
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
    onboardingId: output.onboardingId || '',
    finalLockId: output.finalLockId || '',
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0
  };
}


/**
 * Safe Write status.
 */
function kidlearnV3_3obSafeWriteStatus_() {
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
function kidlearnV3_3obControlledWriteStatus_() {
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
function kidlearnV3_3obCheckFunctions_(names) {
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
function kidlearnV3_3obMakeSupportPackageId_() {
  return (
    'PROD_SUPPORT_3OB_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


function kidlearnV3_3obMakeChangeGateId_() {
  return (
    'PROD_CHANGE_GATE_3OB_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


/**
 * Save support review.
 */
function kidlearnV3_3obSaveSupportReview_(review) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.LAST_SUPPORT_REVIEW_JSON,
      JSON.stringify(review)
    );
}


/**
 * Save support package.
 */
function kidlearnV3_3obSaveSupportPackage_(supportPackage) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.SUPPORT_PACKAGE_ID,
    supportPackage.supportPackageId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.LAST_PACKAGE_JSON,
    JSON.stringify(supportPackage)
  );
}


/**
 * Save result.
 */
function kidlearnV3_3obSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.READY_FOR_3O_C &&
    (
      status === KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.SUPPORT_REVIEW_PASSED ||
      status === KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.SUPPORT_PACKAGE_GENERATED ||
      status === KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.CHANGE_GATE_INITIALIZED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_SUPPORT_3OB_STATUS.READY_FOR_3O_C;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_SUPPORT_3OB_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      supportPackageId: result.supportPackageId || '',
      changeGateId: result.changeGateId || '',
      changeGateStatus: result.changeGateStatus || '',
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
function kidlearnV3_3obReadJsonProperty_(key) {
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