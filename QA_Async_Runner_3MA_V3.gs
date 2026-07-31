/**
 * ================================================================
 * KIDLEARN V3 - QA ASYNC RUNNER
 * Bundle: 3M-A
 * Version: 3.1.0
 * ================================================================
 *
 * Mục tiêu:
 * - Chạy QA nhiều bước nhưng không vượt giới hạn thời gian Apps Script.
 * - Mỗi execution chỉ chạy vài step.
 * - Nếu chưa xong, tự tạo time trigger chạy tiếp.
 * - Không chạy real write.
 * - Không chạy rollback.
 * - Không chạy migration.
 * - Không create/delete sheet.
 * - Không close phase tự động.
 */


var KIDLEARN_V3_QA_ASYNC_3MA_KEYS = {
  STATUS: 'KIDLEARN_V3_QA_ASYNC_3MA_STATUS',
  STATE_JSON: 'KIDLEARN_V3_QA_ASYNC_3MA_STATE_JSON',
  LAST_RESULT_JSON: 'KIDLEARN_V3_QA_ASYNC_3MA_LAST_RESULT_JSON',
  LAST_RUN_ID: 'KIDLEARN_V3_QA_ASYNC_3MA_LAST_RUN_ID',

  PHASE_3MA_STATUS: 'KIDLEARN_V3_PHASE_3MA_STATUS',
  PHASE_3MA_LAST_READY_AT: 'KIDLEARN_V3_PHASE_3MA_LAST_READY_AT',
  PHASE_3MA_LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3MA_LAST_RESULT_JSON'
};


var KIDLEARN_V3_QA_ASYNC_3MA_STATUS = {
  NOT_STARTED: 'NOT_STARTED',
  QUEUED: 'QUEUED',
  RUNNING: 'RUNNING',
  PAUSED: 'PAUSED',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  CANCELLED: 'CANCELLED'
};


var KIDLEARN_V3_PHASE_3MA_STATUS = {
  NOT_RUN: 'NOT_RUN',
  ASYNC_TESTED: 'ASYNC_TESTED',
  READY_FOR_3M_B: 'READY_FOR_3M_B',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_QA_ASYNC_3MA_CONFIG = {
  VERSION: '3M-A',
  NEXT_BUNDLE: '3M-B',
  WORKER_FUNCTION: 'kidlearnV3_runQaAsyncWorker3MAV3',

  /**
   * Mỗi lần worker chỉ chạy tối đa 2 step.
   * Sau này dự án lớn hơn, có thể giảm còn 1.
   */
  DEFAULT_CHUNK_SIZE: 2,

  /**
   * Dừng chunk trước 70 giây để tránh đụng giới hạn execution.
   */
  DEFAULT_CHUNK_MAX_MS: 70000,

  /**
   * Trigger tiếp theo sau 1 phút.
   */
  NEXT_TRIGGER_AFTER_MS: 60 * 1000,

  MAX_ITEMS_TO_KEEP: 120
};


/**
 * Preview QA Async 3M-A.
 */
function kidlearnV3_previewQaAsync3MAV3() {
  var errors = [];
  var warnings = [];

  var functionChecks =
    kidlearnV3_3maCheckFunctions_([
      'kidlearnV3_assertPhase3LClosedV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_appGetActiveDatabaseV3_',
      'kidlearnV3_assertAppShell3LAReadyV3',
      'kidlearnV3_assertLessonContent3LBReadyV3',
      'kidlearnV3_assertLearningInteraction3LCReadyV3'
    ]);

  errors =
    errors.concat(
      functionChecks.errors
    );

  var phase3L =
    kidlearnV3_3maSafeAssert_(
      'kidlearnV3_assertPhase3LClosedV3',
      'Phase 3L'
    );

  if (!phase3L.success) {
    errors.push(
      'Phase 3L chưa CLOSED_LOCKED: ' +
      phase3L.message
    );
  }

  var safeWrite =
    kidlearnV3_3maSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'QA Async yêu cầu Safe Write DRY_RUN/enabled=false. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var controlledWrite =
    kidlearnV3_3maControlledWriteStatus_();

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    errors.push(
      'Controlled Write đang ENABLED. Không được chạy QA Async.'
    );
  }

  var triggerCount =
    kidlearnV3_3maCountWorkerTriggers_();

  if (triggerCount > 0) {
    warnings.push(
      'Đang có ' +
      triggerCount +
      ' trigger QA Async worker. Nếu bị kẹt, chạy kidlearnV3_cancelQaAsync3MAV3.'
    );
  }

  var currentSafeSteps =
    kidlearnV3_3maGetSuiteSteps_(
      'CURRENT_SAFE_ASSERT'
    );

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_QA_ASYNC_3MA_V3',
    bundle: '3M-A',
    version:
      KIDLEARN_V3_QA_ASYNC_3MA_CONFIG.VERSION,
    nextBundle:
      KIDLEARN_V3_QA_ASYNC_3MA_CONFIG.NEXT_BUNDLE,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3L: phase3L,
    safeWriteStatus: safeWrite,
    controlledWriteStatus: controlledWrite,
    workerTriggerCount: triggerCount,
    defaultSuite: {
      suiteName: 'CURRENT_SAFE_ASSERT',
      stepCount: currentSafeSteps.length,
      steps: currentSafeSteps
    },
    functionChecks: functionChecks.items,
    note:
      'QA Async chạy từng chunk bằng trigger. Không chạy real write, rollback, migration, create sheet, close phase.'
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Start QA Async mặc định cho toàn bộ project hiện tại.
 *
 * Đây là hàm chị dùng chính.
 */
function kidlearnV3_startQaAsyncCurrentSafe3MAV3() {
  return kidlearnV3_startQaAsyncSuite3MAV3({
    suiteName: 'CURRENT_SAFE_ASSERT',
    chunkSize:
      KIDLEARN_V3_QA_ASYNC_3MA_CONFIG.DEFAULT_CHUNK_SIZE,
    chunkMaxMs:
      KIDLEARN_V3_QA_ASYNC_3MA_CONFIG.DEFAULT_CHUNK_MAX_MS
  });
}


/**
 * Start QA Async cho regression 3L.
 *
 * Dùng khi sửa UI 3L-A / 3L-B / 3L-C.
 */
function kidlearnV3_startQaAsyncPhase3LRegression3MAV3() {
  return kidlearnV3_startQaAsyncSuite3MAV3({
    suiteName: 'PHASE_3L_REGRESSION',
    chunkSize: 1,
    chunkMaxMs:
      KIDLEARN_V3_QA_ASYNC_3MA_CONFIG.DEFAULT_CHUNK_MAX_MS
  });
}


/**
 * Start QA Async theo suite name.
 */
function kidlearnV3_startQaAsyncSuite3MAV3(options) {
  var req =
    kidlearnV3_3maNormalizeOptions_(
      options
    );

  var suiteName =
    req.suiteName ||
    'CURRENT_SAFE_ASSERT';

  var steps =
    kidlearnV3_3maGetSuiteSteps_(
      suiteName
    );

  if (!steps || steps.length < 1) {
    throw new Error(
      'Không tìm thấy QA Async suite: ' +
      suiteName
    );
  }

  var preview =
    kidlearnV3_previewQaAsync3MAV3();

  if (!preview.success) {
    throw new Error(
      'Không thể start QA Async vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  kidlearnV3_3maDeleteWorkerTriggers_();

  var now =
    new Date();

  var runId =
    kidlearnV3_3maMakeRunId_();

  var state = {
    success: true,
    runId: runId,
    suiteName: suiteName,
    status:
      KIDLEARN_V3_QA_ASYNC_3MA_STATUS.QUEUED,
    startedAt:
      now.toISOString(),
    updatedAt:
      now.toISOString(),
    finishedAt: '',
    nextIndex: 0,
    totalStepCount: steps.length,
    executedStepCount: 0,
    passedStepCount: 0,
    failedStepCount: 0,
    errorCount: 0,
    warningCount: 0,
    errors: [],
    warnings: [],
    chunkSize:
      Number(
        req.chunkSize ||
        KIDLEARN_V3_QA_ASYNC_3MA_CONFIG.DEFAULT_CHUNK_SIZE
      ),
    chunkMaxMs:
      Number(
        req.chunkMaxMs ||
        KIDLEARN_V3_QA_ASYNC_3MA_CONFIG.DEFAULT_CHUNK_MAX_MS
      ),
    steps: steps,
    items: [],
    lastWorkerAt: '',
    nextTriggerScheduledAt: '',
    safeMode: {
      realWriteAllowed: false,
      rollbackAllowed: false,
      migrationAllowed: false,
      createSheetAllowed: false,
      closePhaseAllowed: false
    }
  };

  kidlearnV3_3maSaveState_(
    state
  );

  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_QA_ASYNC_3MA_KEYS.LAST_RUN_ID,
      runId
    );

  /**
   * Chạy chunk đầu tiên ngay.
   * Nếu chưa xong, worker sẽ tự tạo trigger cho chunk tiếp theo.
   */
  return kidlearnV3_runQaAsyncWorker3MAV3();
}


/**
 * Worker function.
 *
 * Hàm này được gọi:
 * - trực tiếp bởi Start
 * - hoặc bởi time trigger
 */
function kidlearnV3_runQaAsyncWorker3MAV3() {
  var lock =
    LockService.getScriptLock();

  var locked =
    lock.tryLock(10000);

  if (!locked) {
    return {
      success: false,
      action: 'RUN_QA_ASYNC_WORKER_3MA_V3',
      status: 'LOCK_BUSY',
      message:
        'QA Async worker đang chạy ở execution khác.'
    };
  }

  try {
    kidlearnV3_3maDeleteWorkerTriggers_();

    var state =
      kidlearnV3_3maReadState_();

    if (!state) {
      throw new Error(
        'Không có QA Async state để worker chạy.'
      );
    }

    if (
      state.status === KIDLEARN_V3_QA_ASYNC_3MA_STATUS.COMPLETED ||
      state.status === KIDLEARN_V3_QA_ASYNC_3MA_STATUS.FAILED ||
      state.status === KIDLEARN_V3_QA_ASYNC_3MA_STATUS.CANCELLED
    ) {
      return kidlearnV3_3maBuildWorkerReturn_(
        state,
        'NO_ACTION_FINAL_STATUS'
      );
    }

    if (
      state.status === KIDLEARN_V3_QA_ASYNC_3MA_STATUS.PAUSED
    ) {
      return kidlearnV3_3maBuildWorkerReturn_(
        state,
        'NO_ACTION_PAUSED'
      );
    }

    var startedAt =
      new Date();

    state.status =
      KIDLEARN_V3_QA_ASYNC_3MA_STATUS.RUNNING;

    state.lastWorkerAt =
      startedAt.toISOString();

    state.updatedAt =
      startedAt.toISOString();

    kidlearnV3_3maSaveState_(
      state
    );

    var stepsThisChunk = 0;
    var chunkSize =
      Number(
        state.chunkSize ||
        KIDLEARN_V3_QA_ASYNC_3MA_CONFIG.DEFAULT_CHUNK_SIZE
      );

    var chunkMaxMs =
      Number(
        state.chunkMaxMs ||
        KIDLEARN_V3_QA_ASYNC_3MA_CONFIG.DEFAULT_CHUNK_MAX_MS
      );

    while (
      state.nextIndex < state.steps.length &&
      stepsThisChunk < chunkSize
    ) {
      var now =
        new Date();

      var elapsedMs =
        now.getTime() -
        startedAt.getTime();

      if (elapsedMs >= chunkMaxMs) {
        break;
      }

      var step =
        state.steps[state.nextIndex];

      var item =
        kidlearnV3_3maRunStep_(
          step,
          state.nextIndex + 1,
          state.steps.length
        );

      state.items.push(
        item
      );

      if (
        state.items.length >
        KIDLEARN_V3_QA_ASYNC_3MA_CONFIG.MAX_ITEMS_TO_KEEP
      ) {
        state.items =
          state.items.slice(
            state.items.length -
            KIDLEARN_V3_QA_ASYNC_3MA_CONFIG.MAX_ITEMS_TO_KEEP
          );
      }

      state.executedStepCount =
        Number(state.executedStepCount || 0) + 1;

      if (item.success) {
        state.passedStepCount =
          Number(state.passedStepCount || 0) + 1;
      } else {
        state.failedStepCount =
          Number(state.failedStepCount || 0) + 1;

        state.errorCount =
          Number(state.errorCount || 0) + 1;

        state.errors.push(
          '[' +
          item.stepNo +
          '] ' +
          item.functionName +
          ': ' +
          item.errorMessage
        );

        state.status =
          KIDLEARN_V3_QA_ASYNC_3MA_STATUS.FAILED;

        state.finishedAt =
          new Date().toISOString();

        state.updatedAt =
          state.finishedAt;

        kidlearnV3_3maSaveState_(
          state
        );

        kidlearnV3_3maSaveLastResult_(
          state
        );

        return kidlearnV3_3maBuildWorkerReturn_(
          state,
          'FAILED'
        );
      }

      if (item.warningCount > 0) {
        state.warningCount =
          Number(state.warningCount || 0) +
          item.warningCount;

        state.warnings =
          state.warnings.concat(
            item.warnings || []
          );
      }

      state.nextIndex =
        Number(state.nextIndex || 0) + 1;

      stepsThisChunk =
        stepsThisChunk + 1;

      state.updatedAt =
        new Date().toISOString();

      kidlearnV3_3maSaveState_(
        state
      );
    }

    if (
      state.nextIndex >= state.steps.length
    ) {
      state.status =
        KIDLEARN_V3_QA_ASYNC_3MA_STATUS.COMPLETED;

      state.finishedAt =
        new Date().toISOString();

      state.updatedAt =
        state.finishedAt;

      kidlearnV3_3maSaveState_(
        state
      );

      kidlearnV3_3maSaveLastResult_(
        state
      );

      return kidlearnV3_3maBuildWorkerReturn_(
        state,
        'COMPLETED'
      );
    }

    state.status =
      KIDLEARN_V3_QA_ASYNC_3MA_STATUS.QUEUED;

    var triggerInfo =
      kidlearnV3_3maScheduleNextWorker_();

    state.nextTriggerScheduledAt =
      triggerInfo.scheduledAt;

    state.updatedAt =
      new Date().toISOString();

    kidlearnV3_3maSaveState_(
      state
    );

    kidlearnV3_3maSaveLastResult_(
      state
    );

    return kidlearnV3_3maBuildWorkerReturn_(
      state,
      'CHUNK_DONE_NEXT_TRIGGER_SCHEDULED'
    );

  } finally {
    lock.releaseLock();
  }
}


/**
 * Chạy tiếp 1 chunk ngay lập tức.
 *
 * Dùng khi chị không muốn đợi trigger hoặc trigger bị delay.
 */
function kidlearnV3_runQaAsyncNextChunkNow3MAV3() {
  return kidlearnV3_runQaAsyncWorker3MAV3();
}


/**
 * Pause QA Async.
 */
function kidlearnV3_pauseQaAsync3MAV3() {
  var state =
    kidlearnV3_3maReadState_();

  if (!state) {
    throw new Error(
      'Không có QA Async state để pause.'
    );
  }

  kidlearnV3_3maDeleteWorkerTriggers_();

  state.status =
    KIDLEARN_V3_QA_ASYNC_3MA_STATUS.PAUSED;

  state.updatedAt =
    new Date().toISOString();

  kidlearnV3_3maSaveState_(
    state
  );

  return kidlearnV3_getQaAsyncStatus3MAV3();
}


/**
 * Resume QA Async.
 */
function kidlearnV3_resumeQaAsync3MAV3() {
  var state =
    kidlearnV3_3maReadState_();

  if (!state) {
    throw new Error(
      'Không có QA Async state để resume.'
    );
  }

  if (
    state.status === KIDLEARN_V3_QA_ASYNC_3MA_STATUS.COMPLETED
  ) {
    return kidlearnV3_getQaAsyncStatus3MAV3();
  }

  if (
    state.status === KIDLEARN_V3_QA_ASYNC_3MA_STATUS.FAILED
  ) {
    throw new Error(
      'QA Async đang FAILED. Hãy xem lỗi, sửa code, rồi start lại suite mới.'
    );
  }

  state.status =
    KIDLEARN_V3_QA_ASYNC_3MA_STATUS.QUEUED;

  state.updatedAt =
    new Date().toISOString();

  kidlearnV3_3maSaveState_(
    state
  );

  return kidlearnV3_runQaAsyncWorker3MAV3();
}


/**
 * Cancel QA Async.
 */
function kidlearnV3_cancelQaAsync3MAV3() {
  var state =
    kidlearnV3_3maReadState_();

  kidlearnV3_3maDeleteWorkerTriggers_();

  if (!state) {
    var emptyResult = {
      success: true,
      action: 'CANCEL_QA_ASYNC_3MA_V3',
      status:
        KIDLEARN_V3_QA_ASYNC_3MA_STATUS.CANCELLED,
      message:
        'Không có state cũ. Đã clear worker triggers.'
    };

    console.log(
      JSON.stringify(emptyResult, null, 2)
    );

    return emptyResult;
  }

  state.status =
    KIDLEARN_V3_QA_ASYNC_3MA_STATUS.CANCELLED;

  state.updatedAt =
    new Date().toISOString();

  state.finishedAt =
    state.updatedAt;

  kidlearnV3_3maSaveState_(
    state
  );

  kidlearnV3_3maSaveLastResult_(
    state
  );

  return kidlearnV3_getQaAsyncStatus3MAV3();
}


/**
 * Clear QA Async state.
 */
function kidlearnV3_clearQaAsyncState3MAV3() {
  kidlearnV3_3maDeleteWorkerTriggers_();

  var properties =
    PropertiesService.getScriptProperties();

  properties.deleteProperty(
    KIDLEARN_V3_QA_ASYNC_3MA_KEYS.STATUS
  );

  properties.deleteProperty(
    KIDLEARN_V3_QA_ASYNC_3MA_KEYS.STATE_JSON
  );

  properties.deleteProperty(
    KIDLEARN_V3_QA_ASYNC_3MA_KEYS.LAST_RESULT_JSON
  );

  var result = {
    success: true,
    action: 'CLEAR_QA_ASYNC_STATE_3MA_V3',
    message:
      'Đã clear QA Async state và worker triggers.'
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Get QA Async status.
 */
function kidlearnV3_getQaAsyncStatus3MAV3() {
  var state =
    kidlearnV3_3maReadState_();

  var triggerCount =
    kidlearnV3_3maCountWorkerTriggers_();

  if (!state) {
    var empty = {
      success: true,
      action: 'GET_QA_ASYNC_STATUS_3MA_V3',
      status:
        KIDLEARN_V3_QA_ASYNC_3MA_STATUS.NOT_STARTED,
      workerTriggerCount: triggerCount,
      lastResult:
        kidlearnV3_3maReadLastResult_()
    };

    console.log(
      JSON.stringify(empty, null, 2)
    );

    return empty;
  }

  var result = {
    success: true,
    action: 'GET_QA_ASYNC_STATUS_3MA_V3',
    runId: state.runId,
    suiteName: state.suiteName,
    status: state.status,
    startedAt: state.startedAt,
    updatedAt: state.updatedAt,
    finishedAt: state.finishedAt || '',
    nextIndex: state.nextIndex,
    totalStepCount: state.totalStepCount,
    executedStepCount: state.executedStepCount,
    passedStepCount: state.passedStepCount,
    failedStepCount: state.failedStepCount,
    errorCount: state.errorCount,
    warningCount: state.warningCount,
    errors: state.errors || [],
    warnings: state.warnings || [],
    workerTriggerCount: triggerCount,
    nextTriggerScheduledAt:
      state.nextTriggerScheduledAt || '',
    progressPercent:
      state.totalStepCount > 0
        ? Math.round(
            Number(state.executedStepCount || 0) /
            Number(state.totalStepCount || 1) *
            100
          )
        : 0,
    lastItems:
      (state.items || []).slice(-8),
    safeMode: state.safeMode
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert QA Async completed.
 */
function kidlearnV3_assertQaAsyncCompleted3MAV3() {
  var status =
    kidlearnV3_getQaAsyncStatus3MAV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_QA_ASYNC_3MA_STATUS.COMPLETED
  ) {
    errors.push(
      'QA Async chưa COMPLETED. Status=' +
      status.status +
      ', progress=' +
      status.progressPercent +
      '%'
    );
  }

  if (Number(status.errorCount || 0) > 0) {
    errors.push(
      'QA Async có errorCount=' +
      status.errorCount
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_QA_ASYNC_COMPLETED_3MA_V3',
    bundle: '3M-A',
    status: status.status,
    suiteName: status.suiteName || '',
    progressPercent: status.progressPercent || 0,
    errorCount: errors.length,
    errors: errors
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'QA Async chưa completed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 3M-A ready.
 */
function kidlearnV3_markQaAsync3MAReadyV3() {
  var completed =
    kidlearnV3_assertQaAsyncCompleted3MAV3();

  if (!completed.success) {
    throw new Error(
      'Không thể mark 3M-A ready vì QA Async chưa completed.'
    );
  }

  var now =
    new Date();

  var result = {
    success: true,
    action: 'MARK_QA_ASYNC_3MA_READY_V3',
    bundle: '3M-A',
    status:
      KIDLEARN_V3_PHASE_3MA_STATUS.READY_FOR_3M_B,
    nextBundle:
      KIDLEARN_V3_QA_ASYNC_3MA_CONFIG.NEXT_BUNDLE,
    markedAt:
      now.toISOString(),
    message:
      '3M-A ready. Có thể chuyển sang 3M-B Performance baseline / cache strategy.'
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_QA_ASYNC_3MA_KEYS.PHASE_3MA_STATUS,
    KIDLEARN_V3_PHASE_3MA_STATUS.READY_FOR_3M_B
  );

  properties.setProperty(
    KIDLEARN_V3_QA_ASYNC_3MA_KEYS.PHASE_3MA_LAST_READY_AT,
    now.toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_QA_ASYNC_3MA_KEYS.PHASE_3MA_LAST_RESULT_JSON,
    JSON.stringify(result)
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Get 3M-A status.
 */
function kidlearnV3_getQaAsync3MAStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_QA_ASYNC_3MA_PHASE_STATUS_V3',
    bundle: '3M-A',
    status:
      properties.getProperty(
        KIDLEARN_V3_QA_ASYNC_3MA_KEYS.PHASE_3MA_STATUS
      ) ||
      KIDLEARN_V3_PHASE_3MA_STATUS.NOT_RUN,
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_QA_ASYNC_3MA_KEYS.PHASE_3MA_LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3maReadJsonProperty_(
        KIDLEARN_V3_QA_ASYNC_3MA_KEYS.PHASE_3MA_LAST_RESULT_JSON
      ),
    qaAsyncStatus:
      kidlearnV3_getQaAsyncStatus3MAV3()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3M-A ready.
 */
function kidlearnV3_assertQaAsync3MAReadyV3() {
  var status =
    kidlearnV3_getQaAsync3MAStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PHASE_3MA_STATUS.READY_FOR_3M_B
  ) {
    errors.push(
      '3M-A chưa READY_FOR_3M_B. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_QA_ASYNC_3MA_READY_V3',
    bundle: '3M-A',
    status: status.status,
    nextBundle:
      KIDLEARN_V3_QA_ASYNC_3MA_CONFIG.NEXT_BUNDLE,
    errorCount: errors.length,
    errors: errors
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3M-A chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Default suite steps.
 */
function kidlearnV3_3maGetSuiteSteps_(suiteName) {
  var name =
    String(suiteName || '').trim();

  if (name === 'CURRENT_SAFE_ASSERT') {
    return [
      {
        label: 'Assert Phase 3J closed',
        functionName: 'kidlearnV3_assertPhase3JClosedV3'
      },
      {
        label: 'Assert Phase 3K closed',
        functionName: 'kidlearnV3_assertPhase3KClosedV3'
      },
      {
        label: 'Assert Phase 3L closed',
        functionName: 'kidlearnV3_assertPhase3LClosedV3'
      },
      {
        label: 'Assert Safe Write DRY_RUN',
        functionName: 'kidlearnV3_asyncQaAssertSafeWriteDryRun3MAV3'
      },
      {
        label: 'Assert Controlled Write disabled',
        functionName: 'kidlearnV3_asyncQaAssertControlledWriteDisabled3MAV3'
      },
      {
        label: 'Assert 3L-A ready',
        functionName: 'kidlearnV3_assertAppShell3LAReadyV3'
      },
      {
        label: 'Assert 3L-B ready',
        functionName: 'kidlearnV3_assertLessonContent3LBReadyV3'
      },
      {
        label: 'Assert 3L-C ready',
        functionName: 'kidlearnV3_assertLearningInteraction3LCReadyV3'
      },
      {
        label: 'Get Phase 3L close status',
        functionName: 'kidlearnV3_getPhase3LCloseStatusV3'
      }
    ];
  }

  if (name === 'PHASE_3L_REGRESSION') {
    var steps = [];

    if (
      typeof kidlearnV3_getQaBatchSteps3LAV3 === 'function'
    ) {
      steps =
        steps.concat(
          kidlearnV3_getQaBatchSteps3LAV3()
        );
    }

    if (
      typeof kidlearnV3_getQaBatchSteps3LBV3 === 'function'
    ) {
      steps =
        steps.concat(
          kidlearnV3_getQaBatchSteps3LBV3()
        );
    }

    if (
      typeof kidlearnV3_getQaBatchSteps3LCV3 === 'function'
    ) {
      steps =
        steps.concat(
          kidlearnV3_getQaBatchSteps3LCV3()
        );
    }

    steps.push({
      label: 'Assert Phase 3L closed',
      functionName: 'kidlearnV3_assertPhase3LClosedV3'
    });

    return steps;
  }

  return [];
}


/**
 * Custom assert: Safe Write phải DRY_RUN.
 */
function kidlearnV3_asyncQaAssertSafeWriteDryRun3MAV3() {
  var safeWrite =
    kidlearnV3_3maSafeWriteStatus_();

  var errors = [];

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Safe Write phải DRY_RUN/enabled=false. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASYNC_QA_ASSERT_SAFE_WRITE_DRY_RUN_3MA_V3',
    bundle: '3M-A',
    errorCount: errors.length,
    errors: errors,
    safeWriteStatus: safeWrite
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Custom assert: Controlled Write không ENABLED.
 */
function kidlearnV3_asyncQaAssertControlledWriteDisabled3MAV3() {
  var controlledWrite =
    kidlearnV3_3maControlledWriteStatus_();

  var errors = [];

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    errors.push(
      'Controlled Write đang ENABLED.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASYNC_QA_ASSERT_CONTROLLED_WRITE_DISABLED_3MA_V3',
    bundle: '3M-A',
    errorCount: errors.length,
    errors: errors,
    controlledWriteStatus: controlledWrite
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Run one step.
 */
function kidlearnV3_3maRunStep_(
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
    kidlearnV3_3maAssertFunctionAllowed_(
      functionName
    );

    var exists =
      eval(
        'typeof ' +
        functionName +
        ' === "function"'
      );

    if (!exists) {
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
      kidlearnV3_3maSummarizeOutput_(
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
        kidlearnV3_3maGetOutputErrorMessage_(
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
 * Guard: chặn hàm nguy hiểm trong QA Async.
 */
function kidlearnV3_3maAssertFunctionAllowed_(functionName) {
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
    kidlearnV3_closePhase3KV3: true,
    kidlearnV3_closePhase3LV3: true,
    kidlearnV3_applyDataValidationAllSheets: true,
    kidlearnV3_clearDataValidationAllSheets: true
  };

  if (blockedExact[name]) {
    throw new Error(
      'QA Async không được chạy hàm nguy hiểm: ' +
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
        'QA Async chặn function theo pattern an toàn: ' +
        name
      );
    }
  }
}


/**
 * Summarize output.
 */
function kidlearnV3_3maSummarizeOutput_(output) {
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

  if (output.progressPercent) {
    summary.progressPercent =
      output.progressPercent;
  }

  if (output.safeWriteStatus) {
    summary.safeWriteStatus = {
      mode:
        output.safeWriteStatus.mode,
      enabled:
        output.safeWriteStatus.enabled
    };
  }

  if (output.controlledWriteStatus) {
    summary.controlledWriteStatus = {
      available:
        output.controlledWriteStatus.available,
      status:
        output.controlledWriteStatus.status
    };
  }

  return summary;
}


/**
 * Output error helper.
 */
function kidlearnV3_3maGetOutputErrorMessage_(output) {
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
 * Save state.
 */
function kidlearnV3_3maSaveState_(state) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_QA_ASYNC_3MA_KEYS.STATUS,
    state.status
  );

  properties.setProperty(
    KIDLEARN_V3_QA_ASYNC_3MA_KEYS.STATE_JSON,
    JSON.stringify(state)
  );
}


/**
 * Read state.
 */
function kidlearnV3_3maReadState_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_QA_ASYNC_3MA_KEYS.STATE_JSON
      );

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    throw new Error(
      'Không parse được QA Async state JSON: ' +
      String(error.message || error)
    );
  }
}


/**
 * Save last result compact.
 */
function kidlearnV3_3maSaveLastResult_(state) {
  var compact = {
    success:
      state.status === KIDLEARN_V3_QA_ASYNC_3MA_STATUS.COMPLETED,
    action: 'QA_ASYNC_3MA_LAST_RESULT',
    runId: state.runId,
    suiteName: state.suiteName,
    status: state.status,
    startedAt: state.startedAt,
    updatedAt: state.updatedAt,
    finishedAt: state.finishedAt,
    totalStepCount: state.totalStepCount,
    executedStepCount: state.executedStepCount,
    passedStepCount: state.passedStepCount,
    failedStepCount: state.failedStepCount,
    errorCount: state.errorCount,
    warningCount: state.warningCount,
    errors: state.errors || [],
    lastItems:
      (state.items || []).slice(-10)
  };

  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_QA_ASYNC_3MA_KEYS.LAST_RESULT_JSON,
      JSON.stringify(compact)
    );
}


/**
 * Read last result.
 */
function kidlearnV3_3maReadLastResult_() {
  return kidlearnV3_3maReadJsonProperty_(
    KIDLEARN_V3_QA_ASYNC_3MA_KEYS.LAST_RESULT_JSON
  );
}


/**
 * Schedule next worker.
 */
function kidlearnV3_3maScheduleNextWorker_() {
  kidlearnV3_3maDeleteWorkerTriggers_();

  var scheduledAt =
    new Date(
      new Date().getTime() +
      KIDLEARN_V3_QA_ASYNC_3MA_CONFIG.NEXT_TRIGGER_AFTER_MS
    );

  var trigger =
    ScriptApp
      .newTrigger(
        KIDLEARN_V3_QA_ASYNC_3MA_CONFIG.WORKER_FUNCTION
      )
      .timeBased()
      .after(
        KIDLEARN_V3_QA_ASYNC_3MA_CONFIG.NEXT_TRIGGER_AFTER_MS
      )
      .create();

  return {
    success: true,
    scheduledAt:
      scheduledAt.toISOString(),
    triggerId:
      trigger.getUniqueId
        ? trigger.getUniqueId()
        : ''
  };
}


/**
 * Delete worker triggers.
 */
function kidlearnV3_3maDeleteWorkerTriggers_() {
  var triggers =
    ScriptApp.getProjectTriggers();

  for (var i = 0; i < triggers.length; i++) {
    if (
      triggers[i].getHandlerFunction &&
      triggers[i].getHandlerFunction() ===
        KIDLEARN_V3_QA_ASYNC_3MA_CONFIG.WORKER_FUNCTION
    ) {
      ScriptApp.deleteTrigger(
        triggers[i]
      );
    }
  }
}


/**
 * Count worker triggers.
 */
function kidlearnV3_3maCountWorkerTriggers_() {
  var triggers =
    ScriptApp.getProjectTriggers();

  var count = 0;

  for (var i = 0; i < triggers.length; i++) {
    if (
      triggers[i].getHandlerFunction &&
      triggers[i].getHandlerFunction() ===
        KIDLEARN_V3_QA_ASYNC_3MA_CONFIG.WORKER_FUNCTION
    ) {
      count++;
    }
  }

  return count;
}


/**
 * Build worker return.
 */
function kidlearnV3_3maBuildWorkerReturn_(
  state,
  workerStatus
) {
  var result = {
    success:
      state.status === KIDLEARN_V3_QA_ASYNC_3MA_STATUS.COMPLETED ||
      state.status === KIDLEARN_V3_QA_ASYNC_3MA_STATUS.QUEUED ||
      state.status === KIDLEARN_V3_QA_ASYNC_3MA_STATUS.RUNNING,
    action: 'RUN_QA_ASYNC_WORKER_3MA_V3',
    workerStatus: workerStatus,
    runId: state.runId,
    suiteName: state.suiteName,
    status: state.status,
    progressPercent:
      state.totalStepCount > 0
        ? Math.round(
            Number(state.executedStepCount || 0) /
            Number(state.totalStepCount || 1) *
            100
          )
        : 0,
    nextIndex: state.nextIndex,
    totalStepCount: state.totalStepCount,
    executedStepCount: state.executedStepCount,
    passedStepCount: state.passedStepCount,
    failedStepCount: state.failedStepCount,
    errorCount: state.errorCount,
    errors: state.errors || [],
    lastItems:
      (state.items || []).slice(-5),
    nextTriggerScheduledAt:
      state.nextTriggerScheduledAt || ''
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Safe assert helper.
 */
function kidlearnV3_3maSafeAssert_(
  functionName,
  label
) {
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

    var result =
      fn();

    return {
      success:
        result && result.success === true,
      label: label,
      message:
        result && result.success === true
          ? ''
          : JSON.stringify(result)
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
function kidlearnV3_3maSafeWriteStatus_() {
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
function kidlearnV3_3maControlledWriteStatus_() {
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
      safeWriteMode: '',
      safeWriteEnabled: false,
      error:
        'Missing kidlearnV3_getControlledWriteDevStatusV3'
    };

  } catch (error) {
    return {
      available: false,
      success: false,
      status: '',
      safeWriteMode: '',
      safeWriteEnabled: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Check functions.
 */
function kidlearnV3_3maCheckFunctions_(names) {
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
 * Make run ID.
 */
function kidlearnV3_3maMakeRunId_() {
  var text =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss_SSS'
    );

  var random =
    Math.floor(
      Math.random() * 100000
    );

  return (
    'QA_ASYNC_3MA_' +
    text +
    '_' +
    random
  );
}


/**
 * Normalize options.
 */
function kidlearnV3_3maNormalizeOptions_(options) {
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


/**
 * Read JSON property.
 */
function kidlearnV3_3maReadJsonProperty_(key) {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(key);

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