/**
 * ================================================================
 * KIDLEARN V3 - PHASE 3J COMPAT STATUS
 * Purpose:
 * - Khôi phục hàm get/assert Phase 3J closed nếu file 3J-B bị thiếu hàm
 * - Không ghi DB
 * - Chỉ đọc/ghi ScriptProperties khi chạy close compat
 * ================================================================
 */


/**
 * Get Phase 3J close status.
 */
function kidlearnV3_getPhase3JCloseStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PHASE_3J_CLOSE_STATUS_V3',
    phase: '3J.14',
    status:
      properties.getProperty(
        'KIDLEARN_V3_PHASE_3J_CLOSE_STATUS'
      ) ||
      'NOT_CLOSED',
    closedAt:
      properties.getProperty(
        'KIDLEARN_V3_PHASE_3J_CLOSED_AT'
      ) ||
      '',
    nextPhase:
      properties.getProperty(
        'KIDLEARN_V3_PHASE_3J_NEXT_PHASE'
      ) ||
      '',
    closeResult:
      kidlearnV3_3jCompatParseJson_(
        properties.getProperty(
          'KIDLEARN_V3_PHASE_3J_CLOSE_RESULT_JSON'
        )
      ),
    phase3JBStatus:
      properties.getProperty(
        'KIDLEARN_V3_PHASE_3JB_STATUS'
      ) ||
      '',
    last3JBRunAt:
      properties.getProperty(
        'KIDLEARN_V3_PHASE_3JB_LAST_RUN_AT'
      ) ||
      '',
    last3JBReviewAt:
      properties.getProperty(
        'KIDLEARN_V3_PHASE_3JB_LAST_REVIEW_AT'
      ) ||
      '',
    last3JBTransactionId:
      properties.getProperty(
        'KIDLEARN_V3_PHASE_3JB_LAST_TRANSACTION_ID'
      ) ||
      '',
    last3JBResult:
      kidlearnV3_3jCompatParseJson_(
        properties.getProperty(
          'KIDLEARN_V3_PHASE_3JB_LAST_RESULT_JSON'
        )
      ),
    safeWriteStatus:
      kidlearnV3_3jCompatSafeWriteStatus_(),
    controlledWriteStatus:
      kidlearnV3_3jCompatControlledWriteStatus_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert Phase 3J closed.
 */
function kidlearnV3_assertPhase3JClosedV3() {
  var status =
    kidlearnV3_getPhase3JCloseStatusV3();

  var errors = [];
  var warnings = [];

  if (status.status !== 'CLOSED_LOCKED') {
    errors.push(
      'Phase 3J chưa CLOSED_LOCKED. Status=' +
      status.status
    );
  }

  if (status.nextPhase !== '3K') {
    errors.push(
      'Next phase phải là 3K. Hiện tại=' +
      status.nextPhase
    );
  }

  var safeWrite =
    status.safeWriteStatus || {};

  if (safeWrite.available === true) {
    if (
      safeWrite.mode !== 'DRY_RUN' ||
      safeWrite.enabled !== false
    ) {
      errors.push(
        'Safe Write chưa ở DRY_RUN/enabled=false. mode=' +
        safeWrite.mode +
        ', enabled=' +
        safeWrite.enabled
      );
    }
  } else {
    warnings.push(
      'Không kiểm tra được Safe Write status vì thiếu hàm kidlearnV3_getSafeWriteLayerStatusV3.'
    );
  }

  var controlledWrite =
    status.controlledWriteStatus || {};

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    errors.push(
      'Controlled Write vẫn đang ENABLED.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PHASE_3J_CLOSED_V3',
    phase: '3J.14',
    status: status.status,
    nextPhase: status.nextPhase,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    safeWriteStatus: safeWrite,
    controlledWriteStatus: controlledWrite,
    phase3JBStatus: status.phase3JBStatus,
    last3JBTransactionId: status.last3JBTransactionId
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Phase 3J chưa close đúng. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Close Phase 3J bằng compat.
 *
 * Chỉ dùng khi:
 * - 3J-B đã REVIEW_PASSED hoặc CLOSED
 * - Safe Write đã DRY_RUN/enabled=false
 * - Controlled Write không ENABLED
 */
function kidlearnV3_closePhase3JCompatV3() {
  var status =
    kidlearnV3_getPhase3JCloseStatusV3();

  if (
    status.status === 'CLOSED_LOCKED' &&
    status.nextPhase === '3K'
  ) {
    return {
      success: true,
      action: 'CLOSE_PHASE_3J_COMPAT_V3',
      phase: '3J.14',
      status: 'CLOSED_LOCKED',
      nextPhase: '3K',
      message:
        'Phase 3J đã CLOSED_LOCKED từ trước.'
    };
  }

  var errors = [];

  if (
    status.phase3JBStatus !== 'REVIEW_PASSED' &&
    status.phase3JBStatus !== 'CLOSED'
  ) {
    errors.push(
      'Không thể close compat vì 3J-B chưa REVIEW_PASSED/CLOSED. phase3JBStatus=' +
      status.phase3JBStatus
    );
  }

  var safeWrite =
    status.safeWriteStatus || {};

  if (safeWrite.available === true) {
    if (
      safeWrite.mode !== 'DRY_RUN' ||
      safeWrite.enabled !== false
    ) {
      errors.push(
        'Safe Write phải ở DRY_RUN/enabled=false trước khi close 3J.'
      );
    }
  }

  var controlledWrite =
    status.controlledWriteStatus || {};

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    errors.push(
      'Controlled Write vẫn ENABLED, không được close 3J.'
    );
  }

  if (errors.length > 0) {
    throw new Error(
      'Không thể close Phase 3J bằng compat. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var now =
    new Date();

  var closeResult = {
    success: true,
    action: 'CLOSE_PHASE_3J_COMPAT_V3',
    phase: '3J.14',
    status: 'CLOSED_LOCKED',
    closedAt:
      now.toISOString(),
    nextPhase: '3K',
    source:
      'Phase_3J_Compat_Status_V3',
    summary: {
      phase3JBStatus:
        status.phase3JBStatus,
      last3JBTransactionId:
        status.last3JBTransactionId,
      safeWriteMode:
        safeWrite.mode || '',
      safeWriteEnabled:
        safeWrite.enabled,
      controlledWriteStatus:
        controlledWrite.status || '',
      prodTouched: false
    }
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    'KIDLEARN_V3_PHASE_3J_CLOSE_STATUS',
    'CLOSED_LOCKED'
  );

  properties.setProperty(
    'KIDLEARN_V3_PHASE_3J_CLOSED_AT',
    now.toISOString()
  );

  properties.setProperty(
    'KIDLEARN_V3_PHASE_3J_NEXT_PHASE',
    '3K'
  );

  properties.setProperty(
    'KIDLEARN_V3_PHASE_3J_CLOSE_RESULT_JSON',
    JSON.stringify(closeResult)
  );

  properties.setProperty(
    'KIDLEARN_V3_PHASE_3JB_STATUS',
    'CLOSED'
  );

  console.log(
    JSON.stringify(closeResult, null, 2)
  );

  return closeResult;
}


/**
 * Debug function availability.
 */
function kidlearnV3_debugPhase3JFunctionAvailabilityV3() {
  var names = [
    'kidlearnV3_getPhase3JCloseStatusV3',
    'kidlearnV3_assertPhase3JClosedV3',
    'kidlearnV3_closePhase3JV3',
    'kidlearnV3_closePhase3JCompatV3',
    'kidlearnV3_getUiRealWriteTrial3JBStatusV3',
    'kidlearnV3_runUiRealWriteTrial3JBCleanV3',
    'kidlearnV3_runPostUiRealWriteReview3JBV3',
    'kidlearnV3_markPostUiRealWriteReview3JBReadyV3',
    'kidlearnV3_getSafeWriteLayerStatusV3',
    'kidlearnV3_getControlledWriteDevStatusV3'
  ];

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
  }

  var result = {
    success: true,
    action: 'DEBUG_PHASE_3J_FUNCTION_AVAILABILITY_V3',
    items: items
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Safe Write status helper.
 */
function kidlearnV3_3jCompatSafeWriteStatus_() {
  try {
    if (
      typeof kidlearnV3_getSafeWriteLayerStatusV3 === 'function'
    ) {
      var result =
        kidlearnV3_getSafeWriteLayerStatusV3();

      result.available = true;

      return result;
    }

    return {
      available: false,
      success: false,
      mode: '',
      enabled: false,
      error:
        'Missing kidlearnV3_getSafeWriteLayerStatusV3'
    };

  } catch (error) {
    return {
      available: false,
      success: false,
      mode: '',
      enabled: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Controlled Write status helper.
 */
function kidlearnV3_3jCompatControlledWriteStatus_() {
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
 * Parse JSON safely.
 */
function kidlearnV3_3jCompatParseJson_(
  text
) {
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