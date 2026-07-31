/**
 * ================================================================
 * KIDLEARN V3 - PERFORMANCE BASELINE / CACHE STRATEGY
 * Bundle: 3M-B
 * Version: 3.1.0
 * ================================================================
 *
 * 3M-B:
 * - Không ghi dữ liệu học tập thật
 * - Không real write
 * - Không rollback
 * - Không migration
 * - Không create/delete sheet
 * - Chỉ ghi ScriptProperties để lưu baseline/status
 * - Chỉ dùng CacheService để test cache
 */


var KIDLEARN_V3_PERF_3MB_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3MB_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3MB_LAST_PREVIEW_AT',
  LAST_BASELINE_AT: 'KIDLEARN_V3_PHASE_3MB_LAST_BASELINE_AT',
  LAST_CACHE_VERIFY_AT: 'KIDLEARN_V3_PHASE_3MB_LAST_CACHE_VERIFY_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3MB_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3MB_LAST_RESULT_JSON',
  LAST_BASELINE_JSON: 'KIDLEARN_V3_PHASE_3MB_LAST_BASELINE_JSON'
};


var KIDLEARN_V3_PERF_3MB_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  BASELINE_COLLECTED: 'BASELINE_COLLECTED',
  CACHE_VERIFIED: 'CACHE_VERIFIED',
  READY_FOR_3M_C: 'READY_FOR_3M_C',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PERF_3MB_CONFIG = {
  VERSION: '3M-B',
  PHASE: '3M-B',
  NEXT_BUNDLE: '3M-C',
  WRITE_MODE: 'NO_DB_WRITE',
  REAL_WRITE_ALLOWED: false,

  /**
   * Ngưỡng này không dùng để fail ngay.
   * Nếu vượt ngưỡng sẽ warning, để mình biết điểm cần tối ưu.
   */
  BUDGETS_MS: {
    STATUS_FAST: 1500,
    APP_SHELL_ULTRA_LITE: 5000,
    LESSON_CONTENT_COLD: 12000,
    LESSON_CONTENT_CACHED: 4000,
    INTERACTION_PAYLOAD: 15000,
    PHASE_STATUS: 3000
  },

  /**
   * Nếu 1 measurement vượt HARD_LIMIT_MS thì mới fail.
   */
  HARD_LIMIT_MS: 60000,

  CACHE_SECONDS: 180,

  CACHE_KEYS: {
    PERF_PROBE: 'KIDLEARN_V3_3MB_PERF_PROBE',
    LESSON_DATA_3LB: 'KIDLEARN_V3_3LB_LESSON_DATA_CACHE'
  }
};


/**
 * Preview 3M-B.
 */
function kidlearnV3_previewPerformanceBaseline3MBV3() {
  var errors = [];
  var warnings = [];

  var functionChecks =
    kidlearnV3_3mbCheckFunctions_([
      'kidlearnV3_assertQaAsync3MAReadyV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_appGetActiveDatabaseV3_',
      'kidlearnV3_getQaAsyncStatus3MAV3',
      'kidlearnV3_getPhase3LCloseStatusV3',
      'kidlearnV3_buildLessonContentUltraLite3LBV3',
      'kidlearnV3_buildLearningInteractionPayloadUltraLite3LCV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors =
    errors.concat(
      functionChecks.errors
    );

  var phase3MA =
    kidlearnV3_3mbSafeAssert_(
      'kidlearnV3_assertQaAsync3MAReadyV3',
      '3M-A'
    );

  if (!phase3MA.success) {
    errors.push(
      '3M-A chưa READY_FOR_3M_B: ' +
      phase3MA.message
    );
  }

  var safeWrite =
    kidlearnV3_3mbSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      '3M-B yêu cầu Safe Write DRY_RUN/enabled=false. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var controlledWrite =
    kidlearnV3_3mbControlledWriteStatus_();

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    errors.push(
      'Controlled Write đang ENABLED. Không được chạy performance baseline.'
    );
  }

  var cacheProbe =
    kidlearnV3_3mbProbeCacheService_();

  if (!cacheProbe.success) {
    errors.push(
      'CacheService chưa hoạt động đúng: ' +
      cacheProbe.error
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PERFORMANCE_BASELINE_3MB_V3',
    bundle: '3M-B',
    phase: KIDLEARN_V3_PERF_3MB_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PERF_3MB_CONFIG.NEXT_BUNDLE,
    writeMode: KIDLEARN_V3_PERF_3MB_CONFIG.WRITE_MODE,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3MA: phase3MA,
    safeWriteStatus: safeWrite,
    controlledWriteStatus: controlledWrite,
    cacheProbe: cacheProbe,
    functionChecks: functionChecks.items,
    budgetsMs: KIDLEARN_V3_PERF_3MB_CONFIG.BUDGETS_MS,
    hardLimitMs: KIDLEARN_V3_PERF_3MB_CONFIG.HARD_LIMIT_MS
  };

  kidlearnV3_3mbSaveResult_(
    result,
    KIDLEARN_V3_PERF_3MB_STATUS.PREVIEWED,
    KIDLEARN_V3_PERF_3MB_KEYS.LAST_PREVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Run performance baseline.
 *
 * Chỉ đo các hàm trọng yếu, không scan full DB.
 */
function kidlearnV3_runPerformanceBaseline3MBV3() {
  var startedAt =
    new Date();

  var errors = [];
  var warnings = [];
  var measurements = [];

  var preview =
    kidlearnV3_previewPerformanceBaseline3MBV3();

  if (!preview.success) {
    throw new Error(
      'Không thể chạy 3M-B baseline vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  /**
   * Clear cache trước để đo cold path.
   */
  kidlearnV3_clearPerformanceCaches3MBV3();

  measurements.push(
    kidlearnV3_3mbMeasure_(
      'SAFE_WRITE_STATUS',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      null,
      KIDLEARN_V3_PERF_3MB_CONFIG.BUDGETS_MS.STATUS_FAST
    )
  );

  measurements.push(
    kidlearnV3_3mbMeasure_(
      'QA_ASYNC_STATUS',
      'kidlearnV3_getQaAsyncStatus3MAV3',
      null,
      KIDLEARN_V3_PERF_3MB_CONFIG.BUDGETS_MS.STATUS_FAST
    )
  );

  measurements.push(
    kidlearnV3_3mbMeasureAppShell_()
  );

  measurements.push(
    kidlearnV3_3mbMeasure_(
      'LESSON_CONTENT_COLD',
      'kidlearnV3_buildLessonContentUltraLite3LBV3',
      {},
      KIDLEARN_V3_PERF_3MB_CONFIG.BUDGETS_MS.LESSON_CONTENT_COLD
    )
  );

  measurements.push(
    kidlearnV3_3mbMeasure_(
      'LESSON_CONTENT_CACHED',
      'kidlearnV3_buildLessonContentUltraLite3LBV3',
      {},
      KIDLEARN_V3_PERF_3MB_CONFIG.BUDGETS_MS.LESSON_CONTENT_CACHED
    )
  );

  measurements.push(
    kidlearnV3_3mbMeasure_(
      'INTERACTION_PAYLOAD',
      'kidlearnV3_buildLearningInteractionPayloadUltraLite3LCV3',
      {},
      KIDLEARN_V3_PERF_3MB_CONFIG.BUDGETS_MS.INTERACTION_PAYLOAD
    )
  );

  measurements.push(
    kidlearnV3_3mbMeasure_(
      'PHASE_3L_CLOSE_STATUS',
      'kidlearnV3_getPhase3LCloseStatusV3',
      null,
      KIDLEARN_V3_PERF_3MB_CONFIG.BUDGETS_MS.PHASE_STATUS
    )
  );

  for (var i = 0; i < measurements.length; i++) {
    if (!measurements[i].success) {
      errors.push(
        measurements[i].name +
        ': ' +
        measurements[i].error
      );
    }

    if (measurements[i].warning) {
      warnings.push(
        measurements[i].warning
      );
    }

    if (
      measurements[i].durationMs >
      KIDLEARN_V3_PERF_3MB_CONFIG.HARD_LIMIT_MS
    ) {
      errors.push(
        measurements[i].name +
        ' vượt hard limit ' +
        KIDLEARN_V3_PERF_3MB_CONFIG.HARD_LIMIT_MS +
        'ms. Actual=' +
        measurements[i].durationMs +
        'ms'
      );
    }
  }

  var cacheVerify =
    kidlearnV3_verifyCacheStrategy3MBV3();

  if (!cacheVerify.success) {
    errors =
      errors.concat(
        cacheVerify.errors || []
      );
  }

  warnings =
    warnings.concat(
      cacheVerify.warnings || []
    );

  var finishedAt =
    new Date();

  var result = {
    success: errors.length === 0,
    action: 'RUN_PERFORMANCE_BASELINE_3MB_V3',
    bundle: '3M-B',
    phase: KIDLEARN_V3_PERF_3MB_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PERF_3MB_CONFIG.NEXT_BUNDLE,
    startedAt:
      startedAt.toISOString(),
    finishedAt:
      finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    writeMode: KIDLEARN_V3_PERF_3MB_CONFIG.WRITE_MODE,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    measurements: measurements,
    cacheVerify: cacheVerify,
    recommendations:
      kidlearnV3_3mbBuildRecommendations_(
        measurements
      )
  };

  kidlearnV3_3mbSaveBaseline_(
    result
  );

  kidlearnV3_3mbSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_PERF_3MB_STATUS.BASELINE_COLLECTED
      : KIDLEARN_V3_PERF_3MB_STATUS.FAILED,
    KIDLEARN_V3_PERF_3MB_KEYS.LAST_BASELINE_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3M-B performance baseline failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Verify cache strategy.
 */
function kidlearnV3_verifyCacheStrategy3MBV3() {
  var errors = [];
  var warnings = [];

  var cache =
    CacheService.getScriptCache();

  var probeKey =
    KIDLEARN_V3_PERF_3MB_CONFIG.CACHE_KEYS.PERF_PROBE;

  var probeValue =
    JSON.stringify({
      at: new Date().toISOString(),
      random: Math.random()
    });

  try {
    cache.put(
      probeKey,
      probeValue,
      KIDLEARN_V3_PERF_3MB_CONFIG.CACHE_SECONDS
    );

    var got =
      cache.get(probeKey);

    if (got !== probeValue) {
      errors.push(
        'CacheService put/get không khớp.'
      );
    }

  } catch (error) {
    errors.push(
      'CacheService lỗi: ' +
      String(error.message || error)
    );
  }

  var strategy = {
    lessonContent3LB: {
      cacheKey:
        KIDLEARN_V3_PERF_3MB_CONFIG.CACHE_KEYS.LESSON_DATA_3LB,
      ttlSeconds: 120,
      policy:
        'Cache lesson master data short-term. Clear cache when changing MST_Lessons/MST_LessonBlocks/MST_Activities/MST_MediaAssets.'
    },
    appShell3LA: {
      cacheKey:
        'NOT_ENABLED_YET',
      ttlSeconds: 0,
      policy:
        'Hiện tại App Shell đọc users/children nhẹ. Chưa cần cache bắt buộc.'
    },
    interaction3LC: {
      cacheKey:
        'REUSE_3LB_CACHE',
      ttlSeconds: 120,
      policy:
        'Interaction payload dùng lại lesson content cache từ 3L-B.'
    },
    qaAsync3MA: {
      cacheKey:
        'NO_CACHE',
      policy:
        'QA Async dùng ScriptProperties state, không dùng cache để tránh mất state.'
    }
  };

  var result = {
    success: errors.length === 0,
    action: 'VERIFY_CACHE_STRATEGY_3MB_V3',
    bundle: '3M-B',
    phase: KIDLEARN_V3_PERF_3MB_CONFIG.PHASE,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    cacheStrategy: strategy,
    verifiedAt:
      new Date().toISOString()
  };

  kidlearnV3_3mbSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_PERF_3MB_STATUS.CACHE_VERIFIED
      : KIDLEARN_V3_PERF_3MB_STATUS.FAILED,
    KIDLEARN_V3_PERF_3MB_KEYS.LAST_CACHE_VERIFY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Clear known performance caches.
 */
function kidlearnV3_clearPerformanceCaches3MBV3() {
  var cache =
    CacheService.getScriptCache();

  var keys = [
    KIDLEARN_V3_PERF_3MB_CONFIG.CACHE_KEYS.PERF_PROBE,
    KIDLEARN_V3_PERF_3MB_CONFIG.CACHE_KEYS.LESSON_DATA_3LB
  ];

  try {
    cache.removeAll(keys);
  } catch (error) {
    for (var i = 0; i < keys.length; i++) {
      try {
        cache.remove(keys[i]);
      } catch (ignore) {
        // ignore
      }
    }
  }

  var result = {
    success: true,
    action: 'CLEAR_PERFORMANCE_CACHES_3MB_V3',
    bundle: '3M-B',
    clearedKeys: keys,
    clearedAt:
      new Date().toISOString()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Mark 3M-B ready.
 *
 * Không chạy lại baseline để tránh timeout.
 * Chỉ check last baseline đã success.
 */
function kidlearnV3_markPerformanceBaseline3MBReadyV3() {
  var status =
    kidlearnV3_getPerformanceBaseline3MBStatusV3();

  var errors = [];

  var allowed = {
    BASELINE_COLLECTED: true,
    CACHE_VERIFIED: true,
    READY_FOR_3M_C: true
  };

  if (!allowed[status.status]) {
    errors.push(
      '3M-B chưa có baseline/cache verified hợp lệ. Status=' +
      status.status
    );
  }

  var lastBaseline =
    status.lastBaseline || {};

  if (
    !lastBaseline ||
    lastBaseline.success !== true
  ) {
    errors.push(
      'Last baseline chưa success=true.'
    );
  }

  var safeWrite =
    kidlearnV3_3mbSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Khi mark 3M-B ready, Safe Write phải DRY_RUN/enabled=false.'
    );
  }

  if (errors.length > 0) {
    var failed = {
      success: false,
      action: 'MARK_PERFORMANCE_BASELINE_3MB_READY_V3',
      bundle: '3M-B',
      status: status.status,
      errorCount: errors.length,
      errors: errors
    };

    console.log(
      JSON.stringify(failed, null, 2)
    );

    throw new Error(
      'Không thể mark 3M-B ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PERFORMANCE_BASELINE_3MB_READY_V3',
    bundle: '3M-B',
    phase: KIDLEARN_V3_PERF_3MB_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PERF_3MB_STATUS.READY_FOR_3M_C,
    nextBundle:
      KIDLEARN_V3_PERF_3MB_CONFIG.NEXT_BUNDLE,
    message:
      '3M-B ready. Có thể chuyển sang 3M-C Security review / role guard.',
    safeWriteStatus: safeWrite,
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3mbSaveResult_(
    result,
    KIDLEARN_V3_PERF_3MB_STATUS.READY_FOR_3M_C,
    KIDLEARN_V3_PERF_3MB_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Get 3M-B status.
 */
function kidlearnV3_getPerformanceBaseline3MBStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PERFORMANCE_BASELINE_3MB_STATUS_V3',
    bundle: '3M-B',
    phase: KIDLEARN_V3_PERF_3MB_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PERF_3MB_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PERF_3MB_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PERF_3MB_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastBaselineAt:
      properties.getProperty(
        KIDLEARN_V3_PERF_3MB_KEYS.LAST_BASELINE_AT
      ) ||
      '',
    lastCacheVerifyAt:
      properties.getProperty(
        KIDLEARN_V3_PERF_3MB_KEYS.LAST_CACHE_VERIFY_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PERF_3MB_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3mbReadJsonProperty_(
        KIDLEARN_V3_PERF_3MB_KEYS.LAST_RESULT_JSON
      ),
    lastBaseline:
      kidlearnV3_3mbReadJsonProperty_(
        KIDLEARN_V3_PERF_3MB_KEYS.LAST_BASELINE_JSON
      )
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3M-B ready.
 */
function kidlearnV3_assertPerformanceBaseline3MBReadyV3() {
  var status =
    kidlearnV3_getPerformanceBaseline3MBStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PERF_3MB_STATUS.READY_FOR_3M_C
  ) {
    errors.push(
      '3M-B chưa READY_FOR_3M_C. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PERFORMANCE_BASELINE_3MB_READY_V3',
    bundle: '3M-B',
    phase: KIDLEARN_V3_PERF_3MB_CONFIG.PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_PERF_3MB_CONFIG.NEXT_BUNDLE,
    errorCount: errors.length,
    errors: errors
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3M-B chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3M-B.
 */
function kidlearnV3_getQaBatchSteps3MBV3() {
  return [
    {
      label: 'Assert 3M-A ready',
      functionName: 'kidlearnV3_assertQaAsync3MAReadyV3'
    },
    {
      label: 'Preview Performance Baseline 3M-B',
      functionName: 'kidlearnV3_previewPerformanceBaseline3MBV3'
    },
    {
      label: 'Run Performance Baseline 3M-B',
      functionName: 'kidlearnV3_runPerformanceBaseline3MBV3'
    },
    {
      label: 'Mark Performance Baseline 3M-B Ready',
      functionName: 'kidlearnV3_markPerformanceBaseline3MBReadyV3'
    },
    {
      label: 'Assert Performance Baseline 3M-B Ready',
      functionName: 'kidlearnV3_assertPerformanceBaseline3MBReadyV3'
    }
  ];
}


/**
 * QA batch 3M-B.
 */
function kidlearnV3_runQaBatch3MBV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3M_B_PERFORMANCE_BASELINE',
    kidlearnV3_getQaBatchSteps3MBV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Measure generic function.
 */
function kidlearnV3_3mbMeasure_(
  name,
  functionName,
  arg,
  budgetMs
) {
  var startedAt =
    new Date();

  var result = {
    success: false,
    name: name,
    functionName: functionName,
    startedAt:
      startedAt.toISOString(),
    finishedAt: '',
    durationMs: 0,
    budgetMs: budgetMs || 0,
    warning: '',
    error: '',
    outputSummary: null
  };

  try {
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

    var output;

    if (arg === null || typeof arg === 'undefined') {
      output = fn();
    } else {
      output = fn(arg);
    }

    result.outputSummary =
      kidlearnV3_3mbSummarizeOutput_(
        output
      );

    if (
      output &&
      output.success === false
    ) {
      throw new Error(
        kidlearnV3_3mbGetOutputErrorMessage_(
          output
        )
      );
    }

    result.success = true;

  } catch (error) {
    result.success = false;
    result.error =
      String(error.message || error);
  }

  var finishedAt =
    new Date();

  result.finishedAt =
    finishedAt.toISOString();

  result.durationMs =
    finishedAt.getTime() -
    startedAt.getTime();

  if (
    result.success &&
    budgetMs &&
    result.durationMs > budgetMs
  ) {
    result.warning =
      name +
      ' vượt budget ' +
      budgetMs +
      'ms. Actual=' +
      result.durationMs +
      'ms';
  }

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Measure App Shell.
 *
 * Ưu tiên ultra lite nếu có.
 */
function kidlearnV3_3mbMeasureAppShell_() {
  if (
    typeof kidlearnV3_buildAppShellContext3LAUltraLiteV3 === 'function'
  ) {
    return kidlearnV3_3mbMeasure_(
      'APP_SHELL_ULTRA_LITE',
      'kidlearnV3_buildAppShellContext3LAUltraLiteV3',
      {
        role: 'FAMILY_ADMIN'
      },
      KIDLEARN_V3_PERF_3MB_CONFIG.BUDGETS_MS.APP_SHELL_ULTRA_LITE
    );
  }

  return kidlearnV3_3mbMeasure_(
    'APP_SHELL_STANDARD',
    'kidlearnV3_buildAppShellContext3LAV3',
    {
      role: 'FAMILY_ADMIN'
    },
    KIDLEARN_V3_PERF_3MB_CONFIG.BUDGETS_MS.APP_SHELL_ULTRA_LITE
  );
}


/**
 * Cache probe.
 */
function kidlearnV3_3mbProbeCacheService_() {
  try {
    var cache =
      CacheService.getScriptCache();

    var key =
      KIDLEARN_V3_PERF_3MB_CONFIG.CACHE_KEYS.PERF_PROBE;

    var value =
      'CACHE_OK_' + new Date().getTime();

    cache.put(
      key,
      value,
      KIDLEARN_V3_PERF_3MB_CONFIG.CACHE_SECONDS
    );

    var got =
      cache.get(key);

    return {
      success: got === value,
      key: key,
      expected: value,
      actual: got || ''
    };

  } catch (error) {
    return {
      success: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Build recommendations.
 */
function kidlearnV3_3mbBuildRecommendations_(
  measurements
) {
  var recs = [];

  var byName = {};

  for (var i = 0; i < measurements.length; i++) {
    byName[measurements[i].name] =
      measurements[i];

    if (measurements[i].warning) {
      recs.push(
        'Tối ưu ' +
        measurements[i].name +
        ': ' +
        measurements[i].warning
      );
    }
  }

  if (
    byName.LESSON_CONTENT_COLD &&
    byName.LESSON_CONTENT_CACHED &&
    byName.LESSON_CONTENT_CACHED.durationMs <
      byName.LESSON_CONTENT_COLD.durationMs
  ) {
    recs.push(
      'Cache 3L-B đang có hiệu quả: cached nhanh hơn cold.'
    );
  }

  if (
    byName.LESSON_CONTENT_CACHED &&
    byName.LESSON_CONTENT_CACHED.durationMs >=
      byName.LESSON_CONTENT_COLD.durationMs
  ) {
    recs.push(
      'Cache 3L-B chưa thể hiện lợi ích rõ. Sau này cần cache theo lessonId/subjectId.'
    );
  }

  recs.push(
    'Daily QA chỉ dùng assert/status/ultra-lite. Không dùng full checksum.'
  );

  recs.push(
    'Các màn hình lớn nên cache master data 120–180 giây, không cache state ghi dữ liệu.'
  );

  return recs;
}


/**
 * Summarize output.
 */
function kidlearnV3_3mbSummarizeOutput_(
  output
) {
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
    errorCount: output.errorCount || 0,
    warningCount: output.warningCount || 0,
    diagnostics: output.diagnostics || null,
    progressPercent: output.progressPercent || null
  };
}


/**
 * Output error message.
 */
function kidlearnV3_3mbGetOutputErrorMessage_(
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
 * Safe assert helper.
 */
function kidlearnV3_3mbSafeAssert_(
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
function kidlearnV3_3mbSafeWriteStatus_() {
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
function kidlearnV3_3mbControlledWriteStatus_() {
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
function kidlearnV3_3mbCheckFunctions_(
  names
) {
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
 * Save baseline compact.
 */
function kidlearnV3_3mbSaveBaseline_(
  baseline
) {
  var compact = {
    success: baseline.success,
    action: baseline.action,
    bundle: baseline.bundle,
    phase: baseline.phase,
    startedAt: baseline.startedAt,
    finishedAt: baseline.finishedAt,
    durationMs: baseline.durationMs,
    errorCount: baseline.errorCount,
    warningCount: baseline.warningCount,
    errors: baseline.errors,
    warnings: baseline.warnings,
    measurements:
      baseline.measurements.map(function(item) {
        return {
          name: item.name,
          functionName: item.functionName,
          success: item.success,
          durationMs: item.durationMs,
          budgetMs: item.budgetMs,
          warning: item.warning,
          error: item.error,
          outputSummary: item.outputSummary
        };
      }),
    recommendations: baseline.recommendations || []
  };

  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PERF_3MB_KEYS.LAST_BASELINE_JSON,
      JSON.stringify(compact)
    );
}


/**
 * Save result.
 */
function kidlearnV3_3mbSaveResult_(
  result,
  status,
  dateKey
) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PERF_3MB_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus === KIDLEARN_V3_PERF_3MB_STATUS.READY_FOR_3M_C &&
    (
      status === KIDLEARN_V3_PERF_3MB_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PERF_3MB_STATUS.BASELINE_COLLECTED ||
      status === KIDLEARN_V3_PERF_3MB_STATUS.CACHE_VERIFIED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PERF_3MB_STATUS.READY_FOR_3M_C;
  }

  properties.setProperty(
    KIDLEARN_V3_PERF_3MB_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PERF_3MB_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
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
function kidlearnV3_3mbReadJsonProperty_(
  key
) {
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