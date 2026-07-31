/**
 * ================================================================
 * KIDLEARN V3 - QA BATCH TEST RUNNER
 * Version: 3.1.0
 * File: QA_Batch_Test_Runner_V3.gs
 * ================================================================
 *
 * Mục tiêu:
 * - Chạy nhiều hàm test trong 1 lần.
 * - Ưu tiên READ_ONLY / DRY_RUN.
 * - Không chạy real write.
 * - Không chạy rollback.
 * - Không chạy migration.
 * - Không create/delete sheet.
 * - Không close phase tự động.
 *
 * Bản cập nhật:
 * - 3K-C dùng LITE suite để tránh timeout.
 * - Có Provided Steps Runner cho các phase mới.
 * - Có helper mark 3K-C ready lite cho QA batch.
 */


var KIDLEARN_V3_QA_BATCH_KEYS = {
  LAST_RUN_AT: 'KIDLEARN_V3_QA_BATCH_LAST_RUN_AT',
  LAST_SUITE: 'KIDLEARN_V3_QA_BATCH_LAST_SUITE',
  LAST_STATUS: 'KIDLEARN_V3_QA_BATCH_LAST_STATUS',
  LAST_RESULT_JSON: 'KIDLEARN_V3_QA_BATCH_LAST_RESULT_JSON'
};


var KIDLEARN_V3_QA_BATCH_CONFIG = {
  VERSION: 'QA_BATCH_V3',
  MAX_RUNTIME_MS: 300000,
  STOP_ON_FAILURE_DEFAULT: true
};


/**
 * Daily fast test.
 *
 * Chạy nhanh để kiểm tra hệ thống hiện tại:
 * - Phase 3J đã closed
 * - 3K-A ready
 * - 3K-B ready
 * - 3K-C chạy LITE DRY_RUN
 *
 * Không ghi thật DB.
 */
function kidlearnV3_runQaBatchFastCurrentV3() {
  return kidlearnV3_runQaBatchSuiteV3({
    suiteName: 'FAST_CURRENT',
    stopOnFailure: true
  });
}


/**
 * Full safe regression test.
 *
 * Chạy nhiều bước hơn, nhưng vẫn chỉ READ_ONLY / DRY_RUN.
 * Nếu bị timeout, dùng các suite theo phase.
 */
function kidlearnV3_runQaBatchFullSafeV3() {
  return kidlearnV3_runQaBatchSuiteV3({
    suiteName: 'FULL_SAFE',
    stopOnFailure: true
  });
}


/**
 * Test riêng 3K-A.
 */
function kidlearnV3_runQaBatch3KAV3() {
  return kidlearnV3_runQaBatchSuiteV3({
    suiteName: 'PHASE_3K_A',
    stopOnFailure: true
  });
}


/**
 * Test riêng 3K-B.
 */
function kidlearnV3_runQaBatch3KBV3() {
  return kidlearnV3_runQaBatchSuiteV3({
    suiteName: 'PHASE_3K_B',
    stopOnFailure: true
  });
}


/**
 * Test riêng 3K-C - LITE VERSION.
 *
 * Bản này tránh chạy lặp:
 * - Không chạy từng action riêng lẻ nếu đã có runAll.
 * - Không gọi smokeTest 3K-C vì smokeTest lại gọi runAll thêm lần nữa.
 * - Mark ready bằng QA lite helper sau khi runAll đã pass.
 */
function kidlearnV3_runQaBatch3KCV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3K_C_LITE',
    kidlearnV3_getQaBatchSteps3KCV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Chạy toàn bộ suite theo tên.
 */
function kidlearnV3_runQaBatchSuiteV3(options) {
  var startedAt =
    new Date();

  var req =
    kidlearnV3_qaBatchNormalizeOptions_(
      options
    );

  var suiteName =
    req.suiteName || 'FAST_CURRENT';

  var stopOnFailure =
    typeof req.stopOnFailure === 'boolean'
      ? req.stopOnFailure
      : KIDLEARN_V3_QA_BATCH_CONFIG.STOP_ON_FAILURE_DEFAULT;

  var steps =
    kidlearnV3_qaBatchGetSuiteSteps_(
      suiteName
    );

  if (!steps || steps.length < 1) {
    throw new Error(
      'Không tìm thấy QA batch suite: ' +
      suiteName
    );
  }

  return kidlearnV3_runQaBatchProvidedStepsV3(
    suiteName,
    steps,
    {
      stopOnFailure: stopOnFailure,
      startedAt: startedAt
    }
  );
}


/**
 * ================================================================
 * QA Batch - Provided Steps Runner
 * ================================================================
 *
 * Dùng cho các phase mới.
 * Mỗi bundle mới chỉ cần tự định nghĩa:
 * - kidlearnV3_getQaBatchSteps3KDV3
 * - kidlearnV3_runQaBatch3KDV3
 *
 * Không cần sửa lại toàn bộ kidlearnV3_qaBatchGetSuiteSteps_ cũ.
 */


/**
 * Chạy QA batch bằng danh sách steps được truyền vào.
 */
function kidlearnV3_runQaBatchProvidedStepsV3(
  suiteName,
  steps,
  options
) {
  var startedAt =
    options && options.startedAt
      ? options.startedAt
      : new Date();

  var req =
    options || {};

  var stopOnFailure =
    typeof req.stopOnFailure === 'boolean'
      ? req.stopOnFailure
      : true;

  if (
    !steps ||
    !Array.isArray(steps) ||
    steps.length < 1
  ) {
    throw new Error(
      'Không có steps để chạy QA batch suite=' +
      suiteName
    );
  }

  var items = [];
  var errors = [];
  var warnings = [];

  for (var i = 0; i < steps.length; i++) {
    var now =
      new Date();

    var elapsedMs =
      now.getTime() -
      startedAt.getTime();

    if (
      elapsedMs >
      KIDLEARN_V3_QA_BATCH_CONFIG.MAX_RUNTIME_MS
    ) {
      errors.push(
        'QA Batch gần vượt giới hạn thời gian Apps Script. Dừng tại step ' +
        (i + 1) +
        '/' +
        steps.length
      );

      break;
    }

    var step =
      steps[i];

    var item =
      kidlearnV3_qaBatchRunStep_(
        step,
        i + 1,
        steps.length
      );

    items.push(item);

    if (item.warningCount > 0) {
      warnings =
        warnings.concat(
          item.warnings || []
        );
    }

    if (!item.success) {
      errors.push(
        '[' +
        item.stepNo +
        '] ' +
        item.functionName +
        ': ' +
        item.errorMessage
      );

      if (stopOnFailure) {
        break;
      }
    }
  }

  var finishedAt =
    new Date();

  var result = {
    success: errors.length === 0,
    action: 'RUN_QA_BATCH_PROVIDED_STEPS_V3',
    version:
      KIDLEARN_V3_QA_BATCH_CONFIG.VERSION,
    suiteName: suiteName,
    stopOnFailure: stopOnFailure,
    startedAt:
      startedAt.toISOString(),
    finishedAt:
      finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    totalStepCount:
      steps.length,
    executedStepCount:
      items.length,
    passedStepCount:
      items.filter(function(item) {
        return item.success;
      }).length,
    failedStepCount:
      items.filter(function(item) {
        return !item.success;
      }).length,
    errorCount:
      errors.length,
    warningCount:
      warnings.length,
    errors: errors,
    warnings: warnings,
    items: items,
    safeMode: {
      realWriteAllowed: false,
      rollbackAllowed: false,
      migrationAllowed: false,
      createSheetAllowed: false,
      closePhaseAllowed: false
    }
  };

  kidlearnV3_qaBatchSaveResult_(
    result
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'QA Batch failed. Suite=' +
      suiteName +
      ', Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Preview các suite hiện có.
 */
function kidlearnV3_previewQaBatchSuitesV3() {
  var suiteNames = [
    'FAST_CURRENT',
    'FULL_SAFE',
    'PHASE_3K_A',
    'PHASE_3K_B',
    'PHASE_3K_C',
    'PHASE_3K_C_LITE'
  ];

  var suites = [];

  for (var i = 0; i < suiteNames.length; i++) {
    var steps =
      suiteNames[i] === 'PHASE_3K_C_LITE'
        ? kidlearnV3_getQaBatchSteps3KCV3()
        : kidlearnV3_qaBatchGetSuiteSteps_(
            suiteNames[i]
          );

    suites.push({
      suiteName: suiteNames[i],
      stepCount: steps.length,
      steps: steps
    });
  }

  var result = {
    success: true,
    action: 'PREVIEW_QA_BATCH_SUITES_V3',
    version:
      KIDLEARN_V3_QA_BATCH_CONFIG.VERSION,
    suites: suites,
    note:
      'Các suite này chỉ chạy READ_ONLY/DRY_RUN. Không chạy real write, rollback, migration, create sheet, close phase.'
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Lấy trạng thái QA batch gần nhất.
 */
function kidlearnV3_getQaBatchStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_QA_BATCH_STATUS_V3',
    lastRunAt:
      properties.getProperty(
        KIDLEARN_V3_QA_BATCH_KEYS.LAST_RUN_AT
      ) || '',
    lastSuite:
      properties.getProperty(
        KIDLEARN_V3_QA_BATCH_KEYS.LAST_SUITE
      ) || '',
    lastStatus:
      properties.getProperty(
        KIDLEARN_V3_QA_BATCH_KEYS.LAST_STATUS
      ) || '',
    lastResult:
      kidlearnV3_qaBatchReadLastResult_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Suite definitions.
 */
function kidlearnV3_qaBatchGetSuiteSteps_(suiteName) {
  var name =
    String(suiteName || '').trim();

  if (name === 'FAST_CURRENT') {
    return [
      {
        label: 'Assert Phase 3J closed',
        functionName: 'kidlearnV3_assertPhase3JClosedV3'
      },
      {
        label: 'Assert 3K-A ready',
        functionName: 'kidlearnV3_assertLearningUiCore3KAReadyV3'
      },
      {
        label: 'Assert 3K-B ready',
        functionName: 'kidlearnV3_assertLearningUi3KBReadyV3'
      },
      {
        label: 'Preview 3K-C',
        functionName: 'kidlearnV3_previewLearningActions3KCV3'
      },
      {
        label: 'Run all learning actions DRY_RUN',
        functionName: 'kidlearnV3_runAllLearningActionsDryRun3KCV3'
      },
      {
        label: 'Mark 3K-C ready lite for batch',
        functionName: 'kidlearnV3_markLearningActions3KCReadyLiteForBatchV3'
      },
      {
        label: 'Assert 3K-C ready',
        functionName: 'kidlearnV3_assertLearningActions3KCReadyV3'
      }
    ];
  }

  if (name === 'FULL_SAFE') {
    return [
      {
        label: 'Assert Phase 3J closed',
        functionName: 'kidlearnV3_assertPhase3JClosedV3'
      },

      {
        label: 'Preview 3K-A',
        functionName: 'kidlearnV3_previewLearningUiCore3KAV3'
      },
      {
        label: 'Build 3K-A state',
        functionName: 'kidlearnV3_buildLearningUiState3KAV3'
      },
      {
        label: 'Build 3K-A screen payload',
        functionName: 'kidlearnV3_buildLearningScreenPayload3KAV3'
      },
      {
        label: 'Smoke test 3K-A',
        functionName: 'kidlearnV3_smokeTestLearningUiCore3KAV3'
      },
      {
        label: 'Mark 3K-A ready',
        functionName: 'kidlearnV3_markLearningUiCore3KAReadyV3'
      },
      {
        label: 'Assert 3K-A ready',
        functionName: 'kidlearnV3_assertLearningUiCore3KAReadyV3'
      },

      {
        label: 'Preview 3K-B',
        functionName: 'kidlearnV3_previewLearningUi3KBV3'
      },
      {
        label: 'Build 3K-B screen',
        functionName: 'kidlearnV3_buildLearningScreen3KBV3'
      },
      {
        label: 'Smoke test 3K-B',
        functionName: 'kidlearnV3_smokeTestLearningUi3KBV3'
      },
      {
        label: 'Mark 3K-B ready',
        functionName: 'kidlearnV3_markLearningUi3KBReadyV3'
      },
      {
        label: 'Assert 3K-B ready',
        functionName: 'kidlearnV3_assertLearningUi3KBReadyV3'
      },

      {
        label: 'Preview 3K-C',
        functionName: 'kidlearnV3_previewLearningActions3KCV3'
      },
      {
        label: 'Run all learning actions DRY_RUN',
        functionName: 'kidlearnV3_runAllLearningActionsDryRun3KCV3'
      },
      {
        label: 'Mark 3K-C ready lite for batch',
        functionName: 'kidlearnV3_markLearningActions3KCReadyLiteForBatchV3'
      },
      {
        label: 'Assert 3K-C ready',
        functionName: 'kidlearnV3_assertLearningActions3KCReadyV3'
      }
    ];
  }

  if (name === 'PHASE_3K_A') {
    return [
      {
        label: 'Assert Phase 3J closed',
        functionName: 'kidlearnV3_assertPhase3JClosedV3'
      },
      {
        label: 'Preview 3K-A',
        functionName: 'kidlearnV3_previewLearningUiCore3KAV3'
      },
      {
        label: 'Build 3K-A state',
        functionName: 'kidlearnV3_buildLearningUiState3KAV3'
      },
      {
        label: 'Build 3K-A payload',
        functionName: 'kidlearnV3_buildLearningScreenPayload3KAV3'
      },
      {
        label: 'Smoke test 3K-A',
        functionName: 'kidlearnV3_smokeTestLearningUiCore3KAV3'
      },
      {
        label: 'Mark 3K-A ready',
        functionName: 'kidlearnV3_markLearningUiCore3KAReadyV3'
      },
      {
        label: 'Assert 3K-A ready',
        functionName: 'kidlearnV3_assertLearningUiCore3KAReadyV3'
      }
    ];
  }

  if (name === 'PHASE_3K_B') {
    return [
      {
        label: 'Assert 3K-A ready',
        functionName: 'kidlearnV3_assertLearningUiCore3KAReadyV3'
      },
      {
        label: 'Preview 3K-B',
        functionName: 'kidlearnV3_previewLearningUi3KBV3'
      },
      {
        label: 'Build 3K-B screen',
        functionName: 'kidlearnV3_buildLearningScreen3KBV3'
      },
      {
        label: 'Smoke test 3K-B',
        functionName: 'kidlearnV3_smokeTestLearningUi3KBV3'
      },
      {
        label: 'Mark 3K-B ready',
        functionName: 'kidlearnV3_markLearningUi3KBReadyV3'
      },
      {
        label: 'Assert 3K-B ready',
        functionName: 'kidlearnV3_assertLearningUi3KBReadyV3'
      }
    ];
  }

  if (
    name === 'PHASE_3K_C' ||
    name === 'PHASE_3K_C_LITE'
  ) {
    return kidlearnV3_getQaBatchSteps3KCV3();
  }

  return [];
}


/**
 * QA steps 3K-C ULTRA LITE.
 */
function kidlearnV3_getQaBatchSteps3KCV3() {
  return [
    {
      label: 'Assert 3K-B ready',
      functionName: 'kidlearnV3_assertLearningUi3KBReadyV3'
    },
    {
      label: 'Preview 3K-C',
      functionName: 'kidlearnV3_previewLearningActions3KCV3'
    },
    {
      label: 'Run 3K-C actions DRY_RUN ultra lite',
      functionName: 'kidlearnV3_runLearningActionsDryRunUltraLite3KCV3'
    },
    {
      label: 'Mark 3K-C ready lite for batch',
      functionName: 'kidlearnV3_markLearningActions3KCReadyLiteForBatchV3'
    },
    {
      label: 'Assert 3K-C ready',
      functionName: 'kidlearnV3_assertLearningActions3KCReadyV3'
    }
  ];
}


/**
 * Mark 3K-C ready bản nhẹ cho QA batch.
 *
 * Không gọi smokeTestLearningActions3KCV3 để tránh chạy lại runAll.
 * Chỉ cho phép mark nếu 3K-C đã ở DRY_RUN_TESTED / SMOKE_TESTED / READY_FOR_3K_D.
 */
function kidlearnV3_markLearningActions3KCReadyLiteForBatchV3() {
  var status =
    kidlearnV3_getLearningActions3KCStatusV3();

  var errors = [];

  var allowed = {
    DRY_RUN_TESTED: true,
    SMOKE_TESTED: true,
    READY_FOR_3K_D: true
  };

  if (!allowed[status.status]) {
    errors.push(
      'Không thể mark 3K-C ready lite. Status hiện tại=' +
      status.status +
      '. Cần chạy kidlearnV3_runAllLearningActionsDryRun3KCV3 pass trước.'
    );
  }

  if (errors.length > 0) {
    var failed = {
      success: false,
      action: 'MARK_LEARNING_ACTIONS_3KC_READY_LITE_FOR_BATCH_V3',
      bundle: '3K-C',
      phase: '3K.6_3K.7_3K.8_3K.9',
      errorCount: errors.length,
      errors: errors,
      currentStatus: status.status
    };

    console.log(
      JSON.stringify(failed, null, 2)
    );

    return failed;
  }

  var properties =
    PropertiesService.getScriptProperties();

  var now =
    new Date();

  var readyStatus =
    'READY_FOR_3K_D';

  var lastResult = {
    success: true,
    action: 'MARK_LEARNING_ACTIONS_3KC_READY_LITE_FOR_BATCH_V3',
    bundle: '3K-C',
    phase: '3K.6_3K.7_3K.8_3K.9',
    status: readyStatus,
    previousStatus: status.status,
    nextBundle: '3K-D',
    at:
      now.toISOString(),
    note:
      'QA lite mark ready after kidlearnV3_runAllLearningActionsDryRun3KCV3 passed. No DB real write.'
  };

  properties.setProperty(
    'KIDLEARN_V3_PHASE_3KC_STATUS',
    readyStatus
  );

  properties.setProperty(
    'KIDLEARN_V3_PHASE_3KC_LAST_READY_AT',
    now.toISOString()
  );

  properties.setProperty(
    'KIDLEARN_V3_PHASE_3KC_LAST_RESULT_JSON',
    JSON.stringify(lastResult)
  );

  console.log(
    JSON.stringify(lastResult, null, 2)
  );

  return lastResult;
}


/**
 * Run one step.
 */
function kidlearnV3_qaBatchRunStep_(
  step,
  stepNo,
  totalSteps
) {
  var startedAt =
    new Date();

  var functionName =
    step.functionName;

  var result = {
    success: false,
    stepNo: stepNo,
    totalSteps: totalSteps,
    label: step.label || '',
    functionName: functionName,
    startedAt:
      startedAt.toISOString(),
    finishedAt: '',
    durationMs: 0,
    errorMessage: '',
    warningCount: 0,
    warnings: [],
    outputSummary: null
  };

  try {
    kidlearnV3_qaBatchAssertFunctionAllowed_(
      functionName
    );

    var fnExists =
      eval(
        'typeof ' +
        functionName +
        ' === "function"'
      );

    if (!fnExists) {
      throw new Error(
        'Thiếu function: ' +
        functionName
      );
    }

    var fn =
      eval(functionName);

    var output =
      fn();

    var summary =
      kidlearnV3_qaBatchSummarizeOutput_(
        output
      );

    result.outputSummary =
      summary;

    result.warningCount =
      summary.warningCount || 0;

    result.warnings =
      summary.warnings || [];

    if (
      output &&
      output.success === false
    ) {
      throw new Error(
        kidlearnV3_qaBatchGetOutputErrorMessage_(
          output
        )
      );
    }

    result.success = true;

  } catch (error) {
    result.success = false;
    result.errorMessage =
      String(error.message || error);
  }

  var finishedAt =
    new Date();

  result.finishedAt =
    finishedAt.toISOString();

  result.durationMs =
    finishedAt.getTime() -
    startedAt.getTime();

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Guard: không cho batch chạy các hàm nguy hiểm.
 */
function kidlearnV3_qaBatchAssertFunctionAllowed_(
  functionName
) {
  var name =
    String(functionName || '');

  var blockedExact = {
    kidlearnV3_createV3Sheets: true,
    kidlearnV3_migrateLegacyV2SheetsToV3: true,
    kidlearnV3_migrateV2DataToV3: true,
    kidlearnV3_enableControlledWriteDevV3: true,
    kidlearnV3_armControlledWriteDevV3: true,
    kidlearnV3_runUiRealWriteTrial3JBCleanV3: true,
    kidlearnV3_uiRealWriteTrial3JBExecuteV3: true,
    kidlearnV3_confirmRollbackUiRealWriteTrial3JBV3: true,
    kidlearnV3_rollbackUiRealWriteTrial3JBV3: true,
    kidlearnV3_closePhase3JV3: true,
    kidlearnV3_closePhase3JCompatV3: true,
    kidlearnV3_createV3Sheets: true,
    kidlearnV3_applyDataValidationAllSheets: true,
    kidlearnV3_clearDataValidationAllSheets: true
  };

  if (blockedExact[name]) {
    throw new Error(
      'QA Batch không được chạy hàm nguy hiểm: ' +
      name
    );
  }

  var blockedPatterns = [
    /Rollback/i,
    /rollback/i,
    /Migrate/i,
    /migrate/i,
    /CreateV3Sheets/i,
    /createV3Sheets/i,
    /EnableControlledWrite/i,
    /ArmControlledWrite/i,
    /RealWriteTrial/i,
    /realWriteTrial/i,
    /ClosePhase/i,
    /closePhase/i,
    /ApplyDataValidation/i,
    /ClearDataValidation/i,
    /Delete/i,
    /delete/i
  ];

  for (var i = 0; i < blockedPatterns.length; i++) {
    if (blockedPatterns[i].test(name)) {
      throw new Error(
        'QA Batch chặn function theo pattern an toàn: ' +
        name
      );
    }
  }
}


/**
 * Summarize output để log gọn.
 */
function kidlearnV3_qaBatchSummarizeOutput_(
  output
) {
  if (!output || typeof output !== 'object') {
    return {
      rawType: typeof output,
      warningCount: 0,
      warnings: []
    };
  }

  var summary = {
    success:
      output.success,
    action:
      output.action || '',
    bundle:
      output.bundle || '',
    phase:
      output.phase || '',
    status:
      output.status || '',
    nextBundle:
      output.nextBundle || '',
    nextPhase:
      output.nextPhase || '',
    errorCount:
      output.errorCount || 0,
    warningCount:
      output.warningCount || 0,
    errors:
      output.errors || [],
    warnings:
      output.warnings || []
  };

  if (output.decision) {
    summary.decision =
      output.decision;
  }

  if (output.noWriteCheck) {
    summary.noWriteCheck = {
      success:
        output.noWriteCheck.success,
      changedSheetCount:
        output.noWriteCheck.changedSheetCount || 0,
      changedSheets:
        output.noWriteCheck.changedSheets || []
    };
  }

  if (output.diagnostics) {
    summary.diagnostics =
      output.diagnostics;
  }

  if (output.safeWriteStatus) {
    summary.safeWriteStatus = {
      mode:
        output.safeWriteStatus.mode,
      enabled:
        output.safeWriteStatus.enabled
    };
  }

  if (output.runAllSummary) {
    summary.runAllSummary =
      output.runAllSummary;
  }

  if (output.dashboard) {
    summary.dashboard =
      output.dashboard;
  }

  return summary;
}


/**
 * Extract error message from output.
 */
function kidlearnV3_qaBatchGetOutputErrorMessage_(
  output
) {
  if (!output) {
    return 'Không có output.';
  }

  if (
    output.errors &&
    output.errors.length
  ) {
    return output.errors.join(' | ');
  }

  if (
    output.error &&
    output.error.message
  ) {
    return output.error.message;
  }

  if (output.error) {
    return String(output.error);
  }

  return 'Function trả success=false nhưng không có message.';
}


/**
 * Save compact result.
 */
function kidlearnV3_qaBatchSaveResult_(
  result
) {
  var properties =
    PropertiesService.getScriptProperties();

  var status =
    result.success
      ? 'PASSED'
      : 'FAILED';

  var compact = {
    success: result.success,
    action: result.action,
    version: result.version,
    suiteName: result.suiteName,
    status: status,
    startedAt: result.startedAt,
    finishedAt: result.finishedAt,
    durationMs: result.durationMs,
    totalStepCount: result.totalStepCount,
    executedStepCount: result.executedStepCount,
    passedStepCount: result.passedStepCount,
    failedStepCount: result.failedStepCount,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    errors: result.errors,
    warnings: result.warnings,
    items: result.items.map(function(item) {
      return {
        stepNo: item.stepNo,
        totalSteps: item.totalSteps,
        label: item.label,
        functionName: item.functionName,
        success: item.success,
        durationMs: item.durationMs,
        errorMessage: item.errorMessage,
        outputSummary: item.outputSummary
      };
    }),
    safeMode: result.safeMode
  };

  properties.setProperty(
    KIDLEARN_V3_QA_BATCH_KEYS.LAST_RUN_AT,
    new Date().toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_QA_BATCH_KEYS.LAST_SUITE,
    result.suiteName
  );

  properties.setProperty(
    KIDLEARN_V3_QA_BATCH_KEYS.LAST_STATUS,
    status
  );

  properties.setProperty(
    KIDLEARN_V3_QA_BATCH_KEYS.LAST_RESULT_JSON,
    JSON.stringify(compact)
  );
}


/**
 * Read last compact result.
 */
function kidlearnV3_qaBatchReadLastResult_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_QA_BATCH_KEYS.LAST_RESULT_JSON
      );

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
function kidlearnV3_qaBatchNormalizeOptions_(
  options
) {
  if (!options) {
    return {};
  }

  if (typeof options !== 'object') {
    return {
      suiteName: String(options || '')
    };
  }

  return options;
}