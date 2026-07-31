/**
 * ================================================================
 * KIDLEARN V3 - PROD READ-ONLY MONITORING & FAMILY ONBOARDING
 * Bundle: 3O-A
 * Version: 3.1.0
 * ================================================================
 *
 * 3O-A:
 * - Monitoring read-only sau khi PROD release final lock.
 * - Tạo family onboarding package.
 * - Không ghi vào PROD file.
 * - Không mở PROD write policy.
 * - Không migration.
 * - Không rollback.
 * - Không real write.
 * - Chỉ ghi ScriptProperties trong DEV script để lưu monitoring/status.
 */


var KIDLEARN_V3_PROD_MONITOR_3OA_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3OA_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3OA_LAST_PREVIEW_AT',
  LAST_MONITORING_AT: 'KIDLEARN_V3_PHASE_3OA_LAST_MONITORING_AT',
  LAST_ONBOARDING_AT: 'KIDLEARN_V3_PHASE_3OA_LAST_ONBOARDING_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3OA_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3OA_LAST_RESULT_JSON',
  LAST_MONITORING_JSON: 'KIDLEARN_V3_PHASE_3OA_LAST_MONITORING_JSON',
  LAST_ONBOARDING_JSON: 'KIDLEARN_V3_PHASE_3OA_LAST_ONBOARDING_JSON',
  ONBOARDING_ID: 'KIDLEARN_V3_PHASE_3OA_ONBOARDING_ID'
};


var KIDLEARN_V3_PROD_MONITOR_3OA_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  MONITORING_PASSED: 'MONITORING_PASSED',
  ONBOARDING_PACKAGE_GENERATED: 'ONBOARDING_PACKAGE_GENERATED',
  READY_FOR_3O_B: 'READY_FOR_3O_B',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG = {
  VERSION: '3O-A',
  PHASE: '3O-A',
  NEXT_BUNDLE: '3O-B',
  NEXT_STAGE: 'PROD_READ_ONLY_SUPPORT_AND_CHANGE_REQUEST_GATE',
  WRITE_MODE: 'PROD_READ_ONLY_MONITORING_ONBOARDING',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false,
  PROD_DEPLOY_NOW: false,
  MAX_READ_ROWS: 100,
  SAMPLE_LIMIT: 10,
  EXPECTED_SHEET_COUNT: 44,
  TARGET_MONITOR_SHEETS: [
    'SYS_Config',
    'SYS_SchemaVersion',
    'DATA_Users',
    'DATA_Children',
    'DATA_UserChildAccess',
    'MST_Subjects',
    'MST_Lessons',
    'MST_Questions',
    'DATA_StudySessions',
    'DATA_LessonProgress',
    'DATA_DailyGoals',
    'LOG_Audit'
  ]
};


/**
 * Preview 3O-A.
 */
function kidlearnV3_previewProdReadonlyMonitoringOnboarding3OAV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3oaCheckFunctions_([
      'kidlearnV3_assertProdReleaseFinalLock3NJReadyV3',
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getProdReleaseHandover3NIStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3NJ =
    kidlearnV3_3oaSafeAssert_(
      'kidlearnV3_assertProdReleaseFinalLock3NJReadyV3',
      '3N-J'
    );

  if (!phase3NJ.success) {
    errors.push(
      '3N-J chưa PROD_RELEASE_LOCKED: ' +
      phase3NJ.message
    );
  }

  var prodInfo =
    kidlearnV3_3oaGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl từ 3N-F.');
  }

  var prodFileCheck =
    kidlearnV3_3oaCheckFileAccessible_(
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
    kidlearnV3_3oaCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_READONLY_MONITORING_ONBOARDING_3OA_V3',
    bundle: '3O-A',
    phase: KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.WRITE_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3NJ: phase3NJ,
    prodInfo: prodInfo,
    prodFileCheck: prodFileCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3O-A chỉ monitoring read-only và tạo onboarding package. Không ghi vào PROD file.'
  };

  kidlearnV3_3oaSaveResult_(
    result,
    KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_MONITOR_3OA_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Run PROD read-only monitoring.
 */
function kidlearnV3_runProdReadonlyMonitoring3OAV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdReadonlyMonitoringOnboarding3OAV3();

  if (!preview.success) {
    throw new Error(
      'Không thể chạy PROD read-only monitoring 3O-A vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var prodInfo =
    kidlearnV3_3oaGetProdInfo_();

  var prodSpreadsheet =
    SpreadsheetApp.openById(
      prodInfo.prodFileId
    );

  var beforeSnapshot =
    kidlearnV3_3oaSnapshotRowCounts_(
      prodSpreadsheet,
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.TARGET_MONITOR_SHEETS
    );

  var inventory =
    kidlearnV3_3oaMonitorSheetInventory_(
      prodSpreadsheet
    );

  errors = errors.concat(inventory.errors);
  warnings = warnings.concat(inventory.warnings);

  var criticalData =
    kidlearnV3_3oaMonitorCriticalData_(
      prodSpreadsheet
    );

  errors = errors.concat(criticalData.errors);
  warnings = warnings.concat(criticalData.warnings);

  var userAccess =
    kidlearnV3_3oaMonitorUserChildAccess_(
      prodSpreadsheet
    );

  errors = errors.concat(userAccess.errors);
  warnings = warnings.concat(userAccess.warnings);

  var learningContent =
    kidlearnV3_3oaMonitorLearningContent_(
      prodSpreadsheet
    );

  errors = errors.concat(learningContent.errors);
  warnings = warnings.concat(learningContent.warnings);

  var runtimePolicy =
    kidlearnV3_3oaMonitorRuntimePolicy_();

  errors = errors.concat(runtimePolicy.errors);
  warnings = warnings.concat(runtimePolicy.warnings);

  SpreadsheetApp.flush();

  var afterSnapshot =
    kidlearnV3_3oaSnapshotRowCounts_(
      prodSpreadsheet,
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.TARGET_MONITOR_SHEETS
    );

  var noWriteCheck =
    kidlearnV3_3oaCompareRowCountSnapshots_(
      beforeSnapshot,
      afterSnapshot
    );

  errors = errors.concat(noWriteCheck.errors);
  warnings = warnings.concat(noWriteCheck.warnings);

  var finishedAt = new Date();

  var monitoring = {
    success: errors.length === 0,
    action: 'RUN_PROD_READONLY_MONITORING_3OA_V3',
    bundle: '3O-A',
    phase: KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.MONITORING_PASSED
        : KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.FAILED,
    nextBundle:
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId,
    prodFileUrl: prodInfo.prodFileUrl,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    monitoringSummary: {
      inventory: inventory.summary,
      criticalData: criticalData.summary,
      userAccess: userAccess.summary,
      learningContent: learningContent.summary,
      runtimePolicy: runtimePolicy.summary,
      noWriteCheck: noWriteCheck.summary
    },
    operationalStatus:
      errors.length === 0
        ? 'PROD_READ_ONLY_OPERATION_OK'
        : 'PROD_READ_ONLY_OPERATION_HOLD',
    noSideEffect: {
      prodFileModifiedBy3OA: false,
      prodDataWrittenBy3OA: false,
      prodSheetCreatedBy3OA: false,
      prodSheetDeletedBy3OA: false
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

  kidlearnV3_3oaSaveMonitoring_(
    monitoring
  );

  kidlearnV3_3oaSaveResult_(
    monitoring,
    monitoring.success
      ? KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.MONITORING_PASSED
      : KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.FAILED,
    KIDLEARN_V3_PROD_MONITOR_3OA_KEYS.LAST_MONITORING_AT
  );

  console.log(JSON.stringify(monitoring, null, 2));

  if (!monitoring.success) {
    throw new Error(
      '3O-A PROD read-only monitoring failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return monitoring;
}


/**
 * Generate family onboarding package.
 */
function kidlearnV3_generateFamilyOnboardingPackage3OAV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var status =
    kidlearnV3_getProdReadonlyMonitoringOnboarding3OAStatusV3();

  if (
    status.status !== KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.MONITORING_PASSED &&
    status.status !== KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.ONBOARDING_PACKAGE_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.READY_FOR_3O_B
  ) {
    errors.push(
      '3O-A cần MONITORING_PASSED trước khi generate onboarding package. Status=' +
      status.status
    );
  }

  var prodInfo =
    kidlearnV3_3oaGetProdInfo_();

  var prodCheck =
    kidlearnV3_3oaCheckFileAccessible_(
      prodInfo.prodFileId,
      'PROD'
    );

  if (!prodCheck.success) {
    errors.push(
      'PROD file không accessible khi generate onboarding: ' +
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

  var familyData =
    prodSpreadsheet
      ? kidlearnV3_3oaBuildFamilyOnboardingData_(
          prodSpreadsheet
        )
      : {
          success: false,
          errors: ['Không mở được PROD spreadsheet để build onboarding data.'],
          warnings: [],
          summary: {}
        };

  errors = errors.concat(familyData.errors || []);
  warnings = warnings.concat(familyData.warnings || []);

  var safeModes =
    kidlearnV3_3oaCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var onboardingId =
    kidlearnV3_3oaMakeOnboardingId_();

  var finishedAt = new Date();

  var onboarding = {
    success: errors.length === 0,
    action: 'GENERATE_FAMILY_ONBOARDING_PACKAGE_3OA_V3',
    bundle: '3O-A',
    phase: KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.ONBOARDING_PACKAGE_GENERATED
        : KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.FAILED,
    onboardingId: onboardingId,
    nextBundle:
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,

    prodAccessInfo: {
      prodFileId: prodInfo.prodFileId || '',
      prodFileName: prodInfo.prodFileName || '',
      prodFileUrl: prodInfo.prodFileUrl || '',
      deploymentId: prodInfo.deploymentId || ''
    },

    familyAdminGuide: {
      title: 'KIDLEARN V3 - Family Admin Onboarding',
      currentPolicy: 'PROD_READ_ONLY',
      supportedRoles: [
        'FAMILY_ADMIN',
        'CHILD'
      ],
      firstUseSteps: [
        'Mở PROD file theo prodFileUrl.',
        'Kiểm tra DATA_Users có FAMILY_ADMIN và CHILD.',
        'Kiểm tra DATA_Children có hồ sơ trẻ.',
        'Kiểm tra DATA_UserChildAccess đã liên kết đúng userId và childId.',
        'Kiểm tra MST_Subjects và MST_Lessons trước khi cho trẻ học.',
        'Không chỉnh sửa dữ liệu nếu chưa có PROD write policy phase riêng.'
      ],
      doNotDoNow: [
        'Không thêm/xóa sheet thủ công.',
        'Không sửa cấu trúc header row 1 và key row 2.',
        'Không bật real write.',
        'Không xóa backup file.',
        'Không thay đổi ScriptProperties deployment nếu chưa có approval mới.'
      ]
    },

    childExperienceGuide: {
      currentMode: 'READ_ONLY_RUNTIME_READY',
      expectedScreens: [
        'Trang học',
        'Bài học',
        'Thư viện',
        'Thành tích'
      ],
      note:
        'Trẻ có thể được kiểm tra màn hình và nội dung ở chế độ đọc. Ghi tiến độ thật chưa mở.'
    },

    readinessData: familyData.summary,

    monitoringReference: {
      lastMonitoringAt: status.lastMonitoringAt || '',
      lastMonitoringStatus: status.status || '',
      monitoringPassed:
        status.lastMonitoring &&
        status.lastMonitoring.success === true
    },

    supportPolicy: {
      issueTracking: 'Ghi nhận lỗi/ý kiến ở phase 3O-B.',
      changeRequest: 'Mọi thay đổi PROD cần change request và approval gate mới.',
      rollback: 'Rollback là phase riêng, không chạy trong 3O-A.',
      prodWrite: 'PROD write chưa mở.'
    },

    safeModes: safeModes.summary,

    noSideEffect: {
      prodFileModifiedBy3OA: false,
      prodDataWrittenBy3OA: false,
      prodSheetCreatedBy3OA: false,
      prodSheetDeletedBy3OA: false
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

  kidlearnV3_3oaSaveOnboarding_(
    onboarding
  );

  kidlearnV3_3oaSaveResult_(
    onboarding,
    onboarding.success
      ? KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.ONBOARDING_PACKAGE_GENERATED
      : KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.FAILED,
    KIDLEARN_V3_PROD_MONITOR_3OA_KEYS.LAST_ONBOARDING_AT
  );

  console.log(JSON.stringify(onboarding, null, 2));

  if (!onboarding.success) {
    throw new Error(
      '3O-A family onboarding package failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return onboarding;
}


/**
 * Mark 3O-A ready.
 */
function kidlearnV3_markProdReadonlyMonitoringOnboarding3OAReadyV3() {
  var status =
    kidlearnV3_getProdReadonlyMonitoringOnboarding3OAStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.ONBOARDING_PACKAGE_GENERATED &&
    status.status !== KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.READY_FOR_3O_B
  ) {
    errors.push(
      '3O-A chưa ONBOARDING_PACKAGE_GENERATED. Status=' +
      status.status
    );
  }

  if (
    !status.lastMonitoring ||
    status.lastMonitoring.success !== true
  ) {
    errors.push(
      'Last monitoring chưa success=true.'
    );
  }

  if (
    !status.lastOnboarding ||
    status.lastOnboarding.success !== true
  ) {
    errors.push(
      'Last onboarding package chưa success=true.'
    );
  }

  var prodInfo =
    kidlearnV3_3oaGetProdInfo_();

  var prodCheck =
    kidlearnV3_3oaCheckFileAccessible_(
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
    kidlearnV3_3oaCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3O-A ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_READONLY_MONITORING_ONBOARDING_3OA_READY_V3',
    bundle: '3O-A',
    phase: KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.READY_FOR_3O_B,
    onboardingId: status.onboardingId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    message:
      '3O-A ready. PROD read-only monitoring và family onboarding package đã pass. Bước tiếp theo là 3O-B support/change request gate.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3oaSaveResult_(
    result,
    KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.READY_FOR_3O_B,
    KIDLEARN_V3_PROD_MONITOR_3OA_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3O-A status.
 */
function kidlearnV3_getProdReadonlyMonitoringOnboarding3OAStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_READONLY_MONITORING_ONBOARDING_3OA_STATUS_V3',
    bundle: '3O-A',
    phase: KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_MONITOR_3OA_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.NOT_RUN,
    onboardingId:
      properties.getProperty(
        KIDLEARN_V3_PROD_MONITOR_3OA_KEYS.ONBOARDING_ID
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_MONITOR_3OA_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastMonitoringAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_MONITOR_3OA_KEYS.LAST_MONITORING_AT
      ) ||
      '',
    lastOnboardingAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_MONITOR_3OA_KEYS.LAST_ONBOARDING_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_MONITOR_3OA_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3oaReadJsonProperty_(
        KIDLEARN_V3_PROD_MONITOR_3OA_KEYS.LAST_RESULT_JSON
      ),
    lastMonitoring:
      kidlearnV3_3oaReadJsonProperty_(
        KIDLEARN_V3_PROD_MONITOR_3OA_KEYS.LAST_MONITORING_JSON
      ),
    lastOnboarding:
      kidlearnV3_3oaReadJsonProperty_(
        KIDLEARN_V3_PROD_MONITOR_3OA_KEYS.LAST_ONBOARDING_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3O-A ready.
 */
function kidlearnV3_assertProdReadonlyMonitoringOnboarding3OAReadyV3() {
  var status =
    kidlearnV3_getProdReadonlyMonitoringOnboarding3OAStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.READY_FOR_3O_B
  ) {
    errors.push(
      '3O-A chưa READY_FOR_3O_B. Status=' +
      status.status
    );
  }

  var prodInfo =
    kidlearnV3_3oaGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_READONLY_MONITORING_ONBOARDING_3OA_READY_V3',
    bundle: '3O-A',
    phase: KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.PHASE,
    status: status.status,
    onboardingId: status.onboardingId || '',
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3O-A chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3O-A.
 */
function kidlearnV3_getQaBatchSteps3OAV3() {
  return [
    {
      label: 'Assert 3N-J final lock ready',
      functionName: 'kidlearnV3_assertProdReleaseFinalLock3NJReadyV3'
    },
    {
      label: 'Preview PROD Read-only Monitoring Onboarding 3O-A',
      functionName: 'kidlearnV3_previewProdReadonlyMonitoringOnboarding3OAV3'
    },
    {
      label: 'Run PROD Read-only Monitoring 3O-A',
      functionName: 'kidlearnV3_runProdReadonlyMonitoring3OAV3'
    },
    {
      label: 'Generate Family Onboarding Package 3O-A',
      functionName: 'kidlearnV3_generateFamilyOnboardingPackage3OAV3'
    },
    {
      label: 'Mark PROD Read-only Monitoring Onboarding 3O-A Ready',
      functionName: 'kidlearnV3_markProdReadonlyMonitoringOnboarding3OAReadyV3'
    },
    {
      label: 'Assert PROD Read-only Monitoring Onboarding 3O-A Ready',
      functionName: 'kidlearnV3_assertProdReadonlyMonitoringOnboarding3OAReadyV3'
    }
  ];
}


/**
 * QA batch 3O-A.
 */
function kidlearnV3_runQaBatch3OAV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3O_A_PROD_READONLY_MONITORING_ONBOARDING',
    kidlearnV3_getQaBatchSteps3OAV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Monitor sheet inventory.
 */
function kidlearnV3_3oaMonitorSheetInventory_(spreadsheet) {
  var errors = [];
  var warnings = [];

  var expectedSheets =
    kidlearnV3_3oaGetExpectedSheets_();

  var items = [];
  var missing = [];

  for (var i = 0; i < expectedSheets.length; i++) {
    var sheetName =
      expectedSheets[i];

    var sheet =
      kidlearnV3_3oaGetSheet_(
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
      'PROD thiếu V3 sheets: ' +
      missing.join(', ')
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
      expectedSheetCount: expectedSheets.length,
      foundSheetCount:
        items.filter(function(item) {
          return item.exists;
        }).length,
      missingSheetCount: missing.length,
      missingSheets: missing
    }
  };
}


/**
 * Monitor critical data.
 */
function kidlearnV3_3oaMonitorCriticalData_(spreadsheet) {
  var errors = [];
  var warnings = [];

  var config =
    kidlearnV3_3oaReadSheetObjects_(
      spreadsheet,
      'SYS_Config',
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.MAX_READ_ROWS
    );

  var schema =
    kidlearnV3_3oaReadSheetObjects_(
      spreadsheet,
      'SYS_SchemaVersion',
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.MAX_READ_ROWS
    );

  var subjects =
    kidlearnV3_3oaReadSheetObjects_(
      spreadsheet,
      'MST_Subjects',
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.MAX_READ_ROWS
    );

  var users =
    kidlearnV3_3oaReadSheetObjects_(
      spreadsheet,
      'DATA_Users',
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.MAX_READ_ROWS
    );

  var children =
    kidlearnV3_3oaReadSheetObjects_(
      spreadsheet,
      'DATA_Children',
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.MAX_READ_ROWS
    );

  if (!config.success) errors = errors.concat(config.errors);
  if (!schema.success) errors = errors.concat(schema.errors);
  if (!subjects.success) errors = errors.concat(subjects.errors);
  if (!users.success) errors = errors.concat(users.errors);
  if (!children.success) errors = errors.concat(children.errors);

  if (subjects.records.length < 1) {
    warnings.push(
      'PROD MST_Subjects chưa có data row. Cần review trước khi onboarding thật.'
    );
  }

  if (users.records.length < 1) {
    warnings.push(
      'PROD DATA_Users chưa có user data row.'
    );
  }

  if (children.records.length < 1) {
    warnings.push(
      'PROD DATA_Children chưa có child data row.'
    );
  }

  var roleSummary =
    kidlearnV3_3oaSummarizeRoles_(
      users.records
    );

  if (roleSummary.unsupportedRoleCount > 0) {
    warnings.push(
      'DATA_Users có role ngoài CHILD/FAMILY_ADMIN: ' +
      roleSummary.unsupportedRoles.join(', ')
    );
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    summary: {
      configRowCount: config.records.length,
      schemaRowCount: schema.records.length,
      subjectRowCount: subjects.records.length,
      userRowCount: users.records.length,
      childRowCount: children.records.length,
      roleSummary: roleSummary
    }
  };
}


/**
 * Monitor user-child access.
 */
function kidlearnV3_3oaMonitorUserChildAccess_(spreadsheet) {
  var errors = [];
  var warnings = [];

  var users =
    kidlearnV3_3oaReadSheetObjects_(
      spreadsheet,
      'DATA_Users',
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.MAX_READ_ROWS
    );

  var children =
    kidlearnV3_3oaReadSheetObjects_(
      spreadsheet,
      'DATA_Children',
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.MAX_READ_ROWS
    );

  var access =
    kidlearnV3_3oaReadSheetObjects_(
      spreadsheet,
      'DATA_UserChildAccess',
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.MAX_READ_ROWS
    );

  if (!users.success) errors = errors.concat(users.errors);
  if (!children.success) errors = errors.concat(children.errors);
  if (!access.success) errors = errors.concat(access.errors);

  var userMap =
    kidlearnV3_3oaMapByKey_(
      users.records,
      'userId'
    );

  var childMap =
    kidlearnV3_3oaMapByKey_(
      children.records,
      'childId'
    );

  var validAccessCount = 0;
  var skippedEmptyRows = 0;
  var missingRefCount = 0;

  for (var i = 0; i < access.records.length; i++) {
    var row =
      access.records[i] || {};

    var userId =
      String(row.userId || '').trim();

    var childId =
      String(row.childId || '').trim();

    if (!userId && !childId) {
      skippedEmptyRows++;
      continue;
    }

    if (!userId || !childId) {
      warnings.push(
        'DATA_UserChildAccess có dòng thiếu userId hoặc childId trong sample.'
      );
      continue;
    }

    if (!userMap[userId] || !childMap[childId]) {
      missingRefCount++;
      warnings.push(
        'DATA_UserChildAccess có reference chưa khớp user/child trong sample. userId=' +
        userId +
        ', childId=' +
        childId
      );
      continue;
    }

    validAccessCount++;
  }

  if (children.records.length > 0 && validAccessCount < 1) {
    warnings.push(
      'Có child data nhưng chưa có access hợp lệ trong sample. Onboarding thật cần kiểm tra DATA_UserChildAccess.'
    );
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    summary: {
      userCount: users.records.length,
      childCount: children.records.length,
      accessRowCount: access.records.length,
      validAccessCount: validAccessCount,
      skippedEmptyRows: skippedEmptyRows,
      missingRefCount: missingRefCount
    }
  };
}


/**
 * Monitor learning content.
 */
function kidlearnV3_3oaMonitorLearningContent_(spreadsheet) {
  var errors = [];
  var warnings = [];

  var subjects =
    kidlearnV3_3oaReadSheetObjects_(
      spreadsheet,
      'MST_Subjects',
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.MAX_READ_ROWS
    );

  var lessons =
    kidlearnV3_3oaReadSheetObjects_(
      spreadsheet,
      'MST_Lessons',
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.MAX_READ_ROWS
    );

  var blocks =
    kidlearnV3_3oaReadSheetObjects_(
      spreadsheet,
      'MST_LessonBlocks',
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.MAX_READ_ROWS
    );

  var activities =
    kidlearnV3_3oaReadSheetObjects_(
      spreadsheet,
      'MST_Activities',
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.MAX_READ_ROWS
    );

  var questions =
    kidlearnV3_3oaReadSheetObjects_(
      spreadsheet,
      'MST_Questions',
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.MAX_READ_ROWS
    );

  if (!subjects.success) errors = errors.concat(subjects.errors);
  if (!lessons.success) errors = errors.concat(lessons.errors);
  if (!blocks.success) errors = errors.concat(blocks.errors);
  if (!activities.success) errors = errors.concat(activities.errors);
  if (!questions.success) errors = errors.concat(questions.errors);

  if (lessons.records.length < 1) {
    warnings.push(
      'PROD chưa có lesson data row trong sample. Trẻ sẽ thấy empty state.'
    );
  }

  if (questions.records.length < 1) {
    warnings.push(
      'PROD chưa có question data row trong sample. Assessment chưa sẵn sàng.'
    );
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    summary: {
      subjectCount: subjects.records.length,
      lessonCount: lessons.records.length,
      blockCount: blocks.records.length,
      activityCount: activities.records.length,
      questionCount: questions.records.length
    }
  };
}


/**
 * Monitor runtime policy.
 */
function kidlearnV3_3oaMonitorRuntimePolicy_() {
  var errors = [];
  var warnings = [];

  var safeModes =
    kidlearnV3_3oaCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    summary: {
      prodRuntimeMode: 'READ_ONLY',
      prodWriteAllowed: false,
      realWriteAllowed: false,
      safeModes: safeModes.summary,
      changesRequireNewApprovalGate: true
    }
  };
}


/**
 * Build family onboarding data.
 */
function kidlearnV3_3oaBuildFamilyOnboardingData_(spreadsheet) {
  var errors = [];
  var warnings = [];

  var users =
    kidlearnV3_3oaReadSheetObjects_(
      spreadsheet,
      'DATA_Users',
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.MAX_READ_ROWS
    );

  var children =
    kidlearnV3_3oaReadSheetObjects_(
      spreadsheet,
      'DATA_Children',
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.MAX_READ_ROWS
    );

  var access =
    kidlearnV3_3oaReadSheetObjects_(
      spreadsheet,
      'DATA_UserChildAccess',
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.MAX_READ_ROWS
    );

  var subjects =
    kidlearnV3_3oaReadSheetObjects_(
      spreadsheet,
      'MST_Subjects',
      KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.MAX_READ_ROWS
    );

  if (!users.success) errors = errors.concat(users.errors);
  if (!children.success) errors = errors.concat(children.errors);
  if (!access.success) errors = errors.concat(access.errors);
  if (!subjects.success) errors = errors.concat(subjects.errors);

  var roleSummary =
    kidlearnV3_3oaSummarizeRoles_(
      users.records
    );

  var familyAdminCount =
    roleSummary.roleCounts.FAMILY_ADMIN || 0;

  var childRoleCount =
    roleSummary.roleCounts.CHILD || 0;

  if (familyAdminCount < 1) {
    warnings.push(
      'Chưa thấy FAMILY_ADMIN trong DATA_Users sample. Cần setup trước onboarding thật.'
    );
  }

  if (childRoleCount < 1) {
    warnings.push(
      'Chưa thấy CHILD trong DATA_Users sample. Cần setup child user trước onboarding thật.'
    );
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    summary: {
      userCount: users.records.length,
      childCount: children.records.length,
      accessRowCount: access.records.length,
      subjectCount: subjects.records.length,
      roleSummary: roleSummary,
      familyAdminCount: familyAdminCount,
      childRoleCount: childRoleCount
    }
  };
}


/**
 * Read sheet objects from row 2 keys.
 */
function kidlearnV3_3oaReadSheetObjects_(spreadsheet, sheetName, maxRows) {
  var errors = [];
  var warnings = [];
  var records = [];

  var sheet =
    kidlearnV3_3oaGetSheet_(
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
        maxRows || KIDLEARN_V3_PROD_MONITOR_3OA_CONFIG.MAX_READ_ROWS
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
 * Summarize roles.
 */
function kidlearnV3_3oaSummarizeRoles_(users) {
  var roleCounts = {};
  var unsupportedRoles = {};

  for (var i = 0; i < users.length; i++) {
    var role =
      kidlearnV3_3oaNormalizeRole_(
        users[i].role ||
        users[i].userRole ||
        ''
      );

    if (!role) {
      role = 'BLANK';
    }

    roleCounts[role] =
      (roleCounts[role] || 0) + 1;

    if (
      role !== 'CHILD' &&
      role !== 'FAMILY_ADMIN' &&
      role !== 'BLANK'
    ) {
      unsupportedRoles[role] = true;
    }
  }

  var unsupportedList = [];

  for (var key in unsupportedRoles) {
    if (unsupportedRoles.hasOwnProperty(key)) {
      unsupportedList.push(key);
    }
  }

  return {
    roleCounts: roleCounts,
    unsupportedRoleCount: unsupportedList.length,
    unsupportedRoles: unsupportedList
  };
}


/**
 * Normalize role.
 */
function kidlearnV3_3oaNormalizeRole_(role) {
  var value =
    String(role || '')
      .trim()
      .toUpperCase()
      .replace(/\s+/g, '_');

  if (
    value === 'CHILD' ||
    value === 'TRE_EM' ||
    value === 'HOC_SINH' ||
    value === 'CON'
  ) {
    return 'CHILD';
  }

  if (
    value === 'FAMILY_ADMIN' ||
    value === 'FAMILY_ADMINISTRATOR' ||
    value === 'PARENT' ||
    value === 'GUARDIAN' ||
    value === 'PHU_HUYNH' ||
    value === 'BO_ME' ||
    value === 'GIA_DINH' ||
    value === 'ADMIN_GIA_DINH'
  ) {
    return 'FAMILY_ADMIN';
  }

  return value;
}


/**
 * Snapshot row counts.
 */
function kidlearnV3_3oaSnapshotRowCounts_(spreadsheet, sheetNames) {
  var items = [];

  for (var i = 0; i < sheetNames.length; i++) {
    var sheetName =
      sheetNames[i];

    var sheet =
      kidlearnV3_3oaGetSheet_(
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
function kidlearnV3_3oaCompareRowCountSnapshots_(beforeSnapshot, afterSnapshot) {
  var errors = [];
  var warnings = [];

  var beforeMap =
    kidlearnV3_3oaMapSnapshots_(
      beforeSnapshot.items || []
    );

  var afterMap =
    kidlearnV3_3oaMapSnapshots_(
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
        'PROD sheet thay đổi trong 3O-A monitoring: ' +
        sheetName +
        '. beforeRow=' +
        before.lastRow +
        ', afterRow=' +
        after.lastRow
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
      readOnlyConfirmed: errors.length === 0
    }
  };
}


/**
 * Map snapshots.
 */
function kidlearnV3_3oaMapSnapshots_(items) {
  var map = {};

  for (var i = 0; i < items.length; i++) {
    map[items[i].sheetName] = items[i];
  }

  return map;
}


/**
 * PROD info từ 3N-F.
 */
function kidlearnV3_3oaGetProdInfo_() {
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
function kidlearnV3_3oaCheckFileAccessible_(fileId, label) {
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
function kidlearnV3_3oaCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3oaSafeWriteStatus_();

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
    kidlearnV3_3oaControlledWriteStatus_();

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
 * Expected sheets.
 */
function kidlearnV3_3oaGetExpectedSheets_() {
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
    typeof kidlearnV3_3ngGetExpectedSheets_ === 'function'
  ) {
    return kidlearnV3_3ngGetExpectedSheets_();
  }

  throw new Error(
    'Không tìm thấy KIDLEARN_V3_SHEET_ORDER hoặc helper expected sheets.'
  );
}


/**
 * Get exact sheet.
 */
function kidlearnV3_3oaGetSheet_(spreadsheet, sheetName) {
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
function kidlearnV3_3oaSafeAssert_(functionName, label) {
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
function kidlearnV3_3oaSafeWriteStatus_() {
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
function kidlearnV3_3oaControlledWriteStatus_() {
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
function kidlearnV3_3oaCheckFunctions_(names) {
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
 * Map by key.
 */
function kidlearnV3_3oaMapByKey_(records, keyName) {
  var map = {};

  for (var i = 0; i < records.length; i++) {
    var key =
      String(records[i][keyName] || '').trim();

    if (key) {
      map[key] = records[i];
    }
  }

  return map;
}


/**
 * Onboarding ID.
 */
function kidlearnV3_3oaMakeOnboardingId_() {
  return (
    'PROD_ONBOARDING_3OA_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


/**
 * Save monitoring.
 */
function kidlearnV3_3oaSaveMonitoring_(monitoring) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PROD_MONITOR_3OA_KEYS.LAST_MONITORING_JSON,
      JSON.stringify(monitoring)
    );
}


/**
 * Save onboarding.
 */
function kidlearnV3_3oaSaveOnboarding_(onboarding) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PROD_MONITOR_3OA_KEYS.ONBOARDING_ID,
    onboarding.onboardingId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_PROD_MONITOR_3OA_KEYS.LAST_ONBOARDING_JSON,
    JSON.stringify(onboarding)
  );
}


/**
 * Save result.
 */
function kidlearnV3_3oaSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_MONITOR_3OA_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.READY_FOR_3O_B &&
    (
      status === KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.MONITORING_PASSED ||
      status === KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.ONBOARDING_PACKAGE_GENERATED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_MONITOR_3OA_STATUS.READY_FOR_3O_B;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_MONITOR_3OA_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_MONITOR_3OA_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      onboardingId: result.onboardingId || '',
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
function kidlearnV3_3oaReadJsonProperty_(key) {
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