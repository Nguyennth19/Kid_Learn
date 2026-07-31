/**
 * ================================================================
 * KIDLEARN V3 - CONTROLLED WRITE ENABLEMENT FOR DEV
 * Step: 3J.6
 * Version: 3.1.0
 * ================================================================
 *
 * File này tạo cơ chế bật ghi thật có kiểm soát trong DEV.
 *
 * Chỉ cho phép bật khi:
 * - Phase 3I đã CLOSED_LOCKED
 * - 3J.5 đã READY_FOR_WRITE_REVIEW hoặc PASSED
 * - Safe Write Layer đang DRY_RUN
 * - Database mode là V3
 * - Môi trường là DEV
 * - Đã ARM trước khi ENABLE
 *
 * KHÔNG sửa PROD.
 * KHÔNG tự ghi dữ liệu học tập thật.
 */


var KIDLEARN_V3_CONTROLLED_WRITE_KEYS = {
  STATUS: 'KIDLEARN_V3_CONTROLLED_WRITE_STATUS',
  ARMED_AT: 'KIDLEARN_V3_CONTROLLED_WRITE_ARMED_AT',
  ARMED_BY: 'KIDLEARN_V3_CONTROLLED_WRITE_ARMED_BY',
  ARM_EXPIRES_AT: 'KIDLEARN_V3_CONTROLLED_WRITE_ARM_EXPIRES_AT',
  ENABLED_AT: 'KIDLEARN_V3_CONTROLLED_WRITE_ENABLED_AT',
  ENABLED_BY: 'KIDLEARN_V3_CONTROLLED_WRITE_ENABLED_BY',
  DISABLED_AT: 'KIDLEARN_V3_CONTROLLED_WRITE_DISABLED_AT',
  DISABLED_BY: 'KIDLEARN_V3_CONTROLLED_WRITE_DISABLED_BY',
  DISABLE_REASON: 'KIDLEARN_V3_CONTROLLED_WRITE_DISABLE_REASON',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_CONTROLLED_WRITE_LAST_PREVIEW_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_CONTROLLED_WRITE_LAST_RESULT_JSON',
  LAST_ENABLE_SNAPSHOT_JSON: 'KIDLEARN_V3_CONTROLLED_WRITE_LAST_ENABLE_SNAPSHOT_JSON',
  ENABLE_COUNT: 'KIDLEARN_V3_CONTROLLED_WRITE_ENABLE_COUNT'
};

var KIDLEARN_V3_CONTROLLED_WRITE_STATUS = {
  DISABLED: 'DISABLED',
  ARMED: 'ARMED',
  ENABLED: 'ENABLED'
};

var KIDLEARN_V3_CONTROLLED_WRITE_CONFIG = {
  VERSION: '3J.6',
  ARM_TTL_MINUTES: 15,
  NEXT_PHASE: '3J.7'
};


/**
 * Preview trước khi bật ghi thật có kiểm soát.
 */
function kidlearnV3_previewControlledWriteDevV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions = [
    'kidlearnV3_assertPhase3IClosedFor3JV3',
    'kidlearnV3_assertDryRunNoDatabaseChangesV3',
    'kidlearnV3_getDryRunNoWriteChecklistStatusV3',
    'kidlearnV3_getSafeWriteLayerStatusV3',
    'kidlearnV3_getAppDevConnectionV3Status',
    'kidlearnV3_servicePingV3'
  ];

  var functionChecks =
    kidlearnV3_controlWriteCheckFunctions_(
      requiredFunctions
    );

  errors =
    errors.concat(
      functionChecks.errors
    );

  var devCheck =
    kidlearnV3_controlWriteCheckDevEnvironment_();

  if (!devCheck.success) {
    errors.push(
      devCheck.message
    );
  }

  var phase3I =
    kidlearnV3_controlWriteSafePhase3I_();

  if (!phase3I.success) {
    errors.push(
      'Phase 3I chưa CLOSED_LOCKED: ' +
      phase3I.message
    );
  }

  var dryRunCheck =
    kidlearnV3_controlWriteSafe3J5_();

  if (!dryRunCheck.success) {
    errors.push(
      '3J.5 chưa READY_FOR_WRITE_REVIEW: ' +
      dryRunCheck.message
    );
  }

  var connection =
    kidlearnV3_controlWriteSafeConnection_();

  if (
    connection.databaseMode !== 'V3' ||
    connection.connectionStatus !== 'CONNECTED'
  ) {
    errors.push(
      'App DEV chưa CONNECTED với Database V3.'
    );
  }

  var safeWrite =
    kidlearnV3_controlWriteSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' &&
    safeWrite.mode !== 'ENABLED'
  ) {
    errors.push(
      'Safe Write Layer phải ở DRY_RUN hoặc ENABLED. Mode hiện tại: ' +
      safeWrite.mode
    );
  }

  if (
    safeWrite.mode === 'ENABLED' &&
    safeWrite.enabled === true
  ) {
    warnings.push(
      'Safe Write Layer đang ENABLED. Không cần bật lại.'
    );
  }

  var status =
    kidlearnV3_getControlledWriteDevStatusV3();

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_CONTROLLED_WRITE_DEV_V3',
    phase: '3J.6',
    nextPhase:
      KIDLEARN_V3_CONTROLLED_WRITE_CONFIG.NEXT_PHASE,
    canEnable:
      errors.length === 0,
    errorCount:
      errors.length,
    warningCount:
      warnings.length,
    errors:
      errors,
    warnings:
      warnings,
    devCheck:
      devCheck,
    phase3I:
      phase3I,
    dryRunCheck3J5:
      dryRunCheck,
    connection:
      connection,
    safeWriteStatus:
      safeWrite,
    controlledWriteStatus:
      status,
    functionChecks:
      functionChecks.items
  };

  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_CONTROLLED_WRITE_KEYS.LAST_PREVIEW_AT,
      new Date().toISOString()
    );

  kidlearnV3_controlWriteSaveResult_(
    result
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * ARM bước bật ghi thật.
 *
 * Sau khi ARM, chị có 15 phút để chạy enable.
 * Nếu quá hạn phải ARM lại.
 */
function kidlearnV3_armControlledWriteDevV3() {
  var preview =
    kidlearnV3_previewControlledWriteDevV3();

  if (!preview.success) {
    throw new Error(
      'Không thể ARM Controlled Write. Preview chưa đạt. Errors: ' +
      preview.errorCount
    );
  }

  var safeWrite =
    kidlearnV3_controlWriteSafeWriteStatus_();

  if (
    safeWrite.mode === 'ENABLED' &&
    safeWrite.enabled === true
  ) {
    throw new Error(
      'Safe Write Layer đã ENABLED. Không cần ARM lại.'
    );
  }

  var now =
    new Date();

  var expiresAt =
    new Date(
      now.getTime() +
      KIDLEARN_V3_CONTROLLED_WRITE_CONFIG.ARM_TTL_MINUTES *
      60 *
      1000
    );

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_CONTROLLED_WRITE_KEYS.STATUS,
    KIDLEARN_V3_CONTROLLED_WRITE_STATUS.ARMED
  );

  properties.setProperty(
    KIDLEARN_V3_CONTROLLED_WRITE_KEYS.ARMED_AT,
    now.toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_CONTROLLED_WRITE_KEYS.ARMED_BY,
    kidlearnV3_controlWriteGetUserEmail_()
  );

  properties.setProperty(
    KIDLEARN_V3_CONTROLLED_WRITE_KEYS.ARM_EXPIRES_AT,
    expiresAt.toISOString()
  );

  var result = {
    success: true,
    action: 'ARM_CONTROLLED_WRITE_DEV_V3',
    phase: '3J.6',
    status: 'ARMED',
    armTtlMinutes:
      KIDLEARN_V3_CONTROLLED_WRITE_CONFIG.ARM_TTL_MINUTES,
    armedAt:
      now.toISOString(),
    armExpiresAt:
      expiresAt.toISOString(),
    message:
      'Controlled Write đã ARM. Chạy kidlearnV3_enableControlledWriteDevV3 trong thời hạn ARM.'
  };

  kidlearnV3_controlWriteSaveResult_(
    result
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Bật ghi thật có kiểm soát trong DEV.
 *
 * Hàm này chỉ set Safe Write Layer sang ENABLED.
 * Không tự ghi dữ liệu học tập.
 */
function kidlearnV3_enableControlledWriteDevV3() {
  var preview =
    kidlearnV3_previewControlledWriteDevV3();

  if (!preview.success) {
    throw new Error(
      'Không thể ENABLE Controlled Write. Preview chưa đạt. Errors: ' +
      preview.errorCount
    );
  }

  var arm =
    kidlearnV3_controlWriteCheckArm_();

  if (!arm.success) {
    throw new Error(
      'Không thể ENABLE Controlled Write: ' +
      arm.message
    );
  }

  var now =
    new Date();

  var snapshot =
    kidlearnV3_controlWriteBuildEnableSnapshot_();

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_SAFE_WRITE_KEYS.MODE,
    KIDLEARN_V3_SAFE_WRITE_MODES.ENABLED
  );

  properties.setProperty(
    KIDLEARN_V3_SAFE_WRITE_KEYS.ENABLED,
    'TRUE'
  );

  properties.setProperty(
    KIDLEARN_V3_CONTROLLED_WRITE_KEYS.STATUS,
    KIDLEARN_V3_CONTROLLED_WRITE_STATUS.ENABLED
  );

  properties.setProperty(
    KIDLEARN_V3_CONTROLLED_WRITE_KEYS.ENABLED_AT,
    now.toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_CONTROLLED_WRITE_KEYS.ENABLED_BY,
    kidlearnV3_controlWriteGetUserEmail_()
  );

  properties.setProperty(
    KIDLEARN_V3_CONTROLLED_WRITE_KEYS.LAST_ENABLE_SNAPSHOT_JSON,
    JSON.stringify(snapshot)
  );

  properties.setProperty(
    KIDLEARN_V3_CONTROLLED_WRITE_KEYS.ENABLE_COUNT,
    String(
      kidlearnV3_controlWriteGetEnableCount_() + 1
    )
  );

  var status =
    kidlearnV3_getControlledWriteDevStatusV3();

  var result = {
    success: true,
    action: 'ENABLE_CONTROLLED_WRITE_DEV_V3',
    phase: '3J.6',
    status: 'ENABLED',
    safeWriteMode: 'ENABLED',
    safeWriteEnabled: true,
    enabledAt: now.toISOString(),
    enabledBy:
      kidlearnV3_controlWriteGetUserEmail_(),
    nextPhase:
      KIDLEARN_V3_CONTROLLED_WRITE_CONFIG.NEXT_PHASE,
    warning:
      'Ghi thật đã được bật ở DEV. Chỉ dùng các hàm write có confirmWrite token.',
    controlledWriteStatus:
      status
  };

  kidlearnV3_controlWriteSaveResult_(
    result
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Tắt ghi thật và đưa Safe Write Layer về DRY_RUN.
 */
function kidlearnV3_disableControlledWriteDevV3(request) {
  var safeRequest =
    kidlearnV3_controlWriteNormalizeRequest_(
      request
    );

  var reason =
    String(
      safeRequest.reason ||
      'MANUAL_DISABLE_TO_DRY_RUN'
    ).trim();

  var now =
    new Date();

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_SAFE_WRITE_KEYS.MODE,
    KIDLEARN_V3_SAFE_WRITE_MODES.DRY_RUN
  );

  properties.setProperty(
    KIDLEARN_V3_SAFE_WRITE_KEYS.ENABLED,
    'FALSE'
  );

  properties.setProperty(
    KIDLEARN_V3_CONTROLLED_WRITE_KEYS.STATUS,
    KIDLEARN_V3_CONTROLLED_WRITE_STATUS.DISABLED
  );

  properties.setProperty(
    KIDLEARN_V3_CONTROLLED_WRITE_KEYS.DISABLED_AT,
    now.toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_CONTROLLED_WRITE_KEYS.DISABLED_BY,
    kidlearnV3_controlWriteGetUserEmail_()
  );

  properties.setProperty(
    KIDLEARN_V3_CONTROLLED_WRITE_KEYS.DISABLE_REASON,
    reason
  );

  var result = {
    success: true,
    action: 'DISABLE_CONTROLLED_WRITE_DEV_V3',
    phase: '3J.6',
    status: 'DISABLED',
    safeWriteMode: 'DRY_RUN',
    safeWriteEnabled: false,
    disabledAt: now.toISOString(),
    reason: reason,
    message:
      'Controlled Write đã tắt. Safe Write Layer quay về DRY_RUN.'
  };

  kidlearnV3_controlWriteSaveResult_(
    result
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Reset nhanh về DRY_RUN.
 */
function kidlearnV3_resetControlledWriteDevToDryRunV3() {
  return kidlearnV3_disableControlledWriteDevV3({
    reason: 'RESET_TO_DRY_RUN'
  });
}


/**
 * Xem trạng thái Controlled Write DEV.
 */
function kidlearnV3_getControlledWriteDevStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var safeWrite =
    kidlearnV3_controlWriteSafeWriteStatus_();

  var result = {
    success: true,
    action: 'GET_CONTROLLED_WRITE_DEV_STATUS_V3',
    phase: '3J.6',
    status:
      properties.getProperty(
        KIDLEARN_V3_CONTROLLED_WRITE_KEYS.STATUS
      ) ||
      KIDLEARN_V3_CONTROLLED_WRITE_STATUS.DISABLED,
    safeWriteMode:
      safeWrite.mode || '',
    safeWriteEnabled:
      safeWrite.enabled === true,
    armedAt:
      properties.getProperty(
        KIDLEARN_V3_CONTROLLED_WRITE_KEYS.ARMED_AT
      ) ||
      '',
    armExpiresAt:
      properties.getProperty(
        KIDLEARN_V3_CONTROLLED_WRITE_KEYS.ARM_EXPIRES_AT
      ) ||
      '',
    enabledAt:
      properties.getProperty(
        KIDLEARN_V3_CONTROLLED_WRITE_KEYS.ENABLED_AT
      ) ||
      '',
    disabledAt:
      properties.getProperty(
        KIDLEARN_V3_CONTROLLED_WRITE_KEYS.DISABLED_AT
      ) ||
      '',
    enabledBy:
      properties.getProperty(
        KIDLEARN_V3_CONTROLLED_WRITE_KEYS.ENABLED_BY
      ) ||
      '',
    disabledBy:
      properties.getProperty(
        KIDLEARN_V3_CONTROLLED_WRITE_KEYS.DISABLED_BY
      ) ||
      '',
    disableReason:
      properties.getProperty(
        KIDLEARN_V3_CONTROLLED_WRITE_KEYS.DISABLE_REASON
      ) ||
      '',
    enableCount:
      kidlearnV3_controlWriteGetEnableCount_(),
    arm:
      kidlearnV3_controlWriteCheckArm_(),
    lastResult:
      kidlearnV3_controlWriteReadLastResult_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert Controlled Write đã bật.
 *
 * Dùng cho bước 3J.7.
 */
function kidlearnV3_assertControlledWriteDevEnabledV3() {
  var status =
    kidlearnV3_getControlledWriteDevStatusV3();

  var errors = [];

  if (status.status !== 'ENABLED') {
    errors.push(
      'Controlled Write status chưa ENABLED. Hiện tại: ' +
      status.status
    );
  }

  if (status.safeWriteMode !== 'ENABLED') {
    errors.push(
      'Safe Write mode chưa ENABLED. Hiện tại: ' +
      status.safeWriteMode
    );
  }

  if (status.safeWriteEnabled !== true) {
    errors.push(
      'Safe Write enabled chưa bằng true.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_CONTROLLED_WRITE_DEV_ENABLED_V3',
    phase: '3J.6',
    errorCount: errors.length,
    errors: errors,
    status: status
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Controlled Write DEV chưa bật đúng điều kiện. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Assert Controlled Write đang tắt hoặc DRY_RUN.
 */
function kidlearnV3_assertControlledWriteDevDryRunV3() {
  var status =
    kidlearnV3_getControlledWriteDevStatusV3();

  var errors = [];

  if (status.safeWriteMode !== 'DRY_RUN') {
    errors.push(
      'Safe Write mode phải là DRY_RUN. Hiện tại: ' +
      status.safeWriteMode
    );
  }

  if (status.safeWriteEnabled !== false) {
    errors.push(
      'Safe Write enabled phải là false.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_CONTROLLED_WRITE_DEV_DRY_RUN_V3',
    phase: '3J.6',
    errorCount: errors.length,
    errors: errors,
    status: status
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Controlled Write DEV chưa ở DRY_RUN. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Kiểm tra ARM còn hiệu lực.
 */
function kidlearnV3_controlWriteCheckArm_() {
  var properties =
    PropertiesService.getScriptProperties();

  var status =
    properties.getProperty(
      KIDLEARN_V3_CONTROLLED_WRITE_KEYS.STATUS
    ) ||
    KIDLEARN_V3_CONTROLLED_WRITE_STATUS.DISABLED;

  var expiresText =
    properties.getProperty(
      KIDLEARN_V3_CONTROLLED_WRITE_KEYS.ARM_EXPIRES_AT
    ) ||
    '';

  if (status === 'ENABLED') {
    return {
      success: true,
      status: status,
      message: 'Already ENABLED.'
    };
  }

  if (status !== 'ARMED') {
    return {
      success: false,
      status: status,
      message:
        'Controlled Write chưa ARM. Hãy chạy kidlearnV3_armControlledWriteDevV3 trước.'
    };
  }

  if (!expiresText) {
    return {
      success: false,
      status: status,
      message:
        'Không có ARM expiry time.'
    };
  }

  var expiresAt =
    new Date(expiresText);

  var now =
    new Date();

  if (
    isNaN(expiresAt.getTime()) ||
    expiresAt.getTime() < now.getTime()
  ) {
    return {
      success: false,
      status: status,
      armExpiresAt: expiresText,
      message:
        'ARM đã hết hạn. Hãy chạy kidlearnV3_armControlledWriteDevV3 lại.'
    };
  }

  return {
    success: true,
    status: status,
    armExpiresAt: expiresText,
    message: 'ARM còn hiệu lực.'
  };
}


/**
 * Check DEV environment.
 */
function kidlearnV3_controlWriteCheckDevEnvironment_() {
  try {
    if (
      typeof kidlearnV3_assertDevEnvironment_ === 'function'
    ) {
      kidlearnV3_assertDevEnvironment_();
    }

    var connection =
      kidlearnV3_controlWriteSafeConnection_();

    var spreadsheetName =
      String(connection.spreadsheetName || '');

    if (
      spreadsheetName &&
      spreadsheetName.toUpperCase().indexOf('DEV') === -1
    ) {
      return {
        success: false,
        message:
          'Database spreadsheet name không chứa DEV: ' +
          spreadsheetName
      };
    }

    return {
      success: true,
      message: 'DEV environment OK.',
      spreadsheetName: spreadsheetName
    };

  } catch (error) {
    return {
      success: false,
      message:
        'DEV environment check failed: ' +
        String(error.message || error)
    };
  }
}


/**
 * Build snapshot lúc enable.
 */
function kidlearnV3_controlWriteBuildEnableSnapshot_() {
  var snapshot = {
    capturedAt: new Date().toISOString(),
    safeWriteStatus:
      kidlearnV3_controlWriteSafeWriteStatus_(),
    dryRunChecklistStatus:
      kidlearnV3_controlWriteSafe3J5Status_(),
    connection:
      kidlearnV3_controlWriteSafeConnection_()
  };

  try {
    if (
      typeof kidlearnV3_dryRunSnapshotSheets_ === 'function' &&
      typeof KIDLEARN_V3_DRY_RUN_TARGET_SHEETS !== 'undefined'
    ) {
      snapshot.databaseSnapshot =
        kidlearnV3_dryRunSnapshotSheets_(
          KIDLEARN_V3_DRY_RUN_TARGET_SHEETS
        ).summary;
    }
  } catch (error) {
    snapshot.snapshotWarning =
      String(error.message || error);
  }

  return snapshot;
}


/**
 * Check required functions.
 */
function kidlearnV3_controlWriteCheckFunctions_(
  functionNames
) {
  var errors = [];
  var items = [];

  for (var i = 0; i < functionNames.length; i++) {
    var exists = false;

    try {
      exists =
        eval(
          'typeof ' +
          functionNames[i] +
          ' === "function"'
        );
    } catch (error) {
      exists = false;
    }

    items.push({
      name: functionNames[i],
      exists: exists
    });

    if (!exists) {
      errors.push(
        'Thiếu function: ' +
        functionNames[i]
      );
    }
  }

  if (
    typeof KIDLEARN_V3_SAFE_WRITE_KEYS === 'undefined'
  ) {
    errors.push(
      'Thiếu KIDLEARN_V3_SAFE_WRITE_KEYS từ App_Safe_Write_V3.gs.'
    );
  }

  if (
    typeof KIDLEARN_V3_SAFE_WRITE_MODES === 'undefined'
  ) {
    errors.push(
      'Thiếu KIDLEARN_V3_SAFE_WRITE_MODES từ App_Safe_Write_V3.gs.'
    );
  }

  return {
    errorCount: errors.length,
    errors: errors,
    items: items
  };
}


/**
 * Safe Phase 3I.
 */
function kidlearnV3_controlWriteSafePhase3I_() {
  try {
    var result =
      kidlearnV3_assertPhase3IClosedFor3JV3();

    return {
      success: result.success === true,
      message: ''
    };

  } catch (error) {
    return {
      success: false,
      message:
        String(error.message || error)
    };
  }
}


/**
 * Safe 3J.5 assert.
 */
function kidlearnV3_controlWriteSafe3J5_() {
  try {
    var result =
      kidlearnV3_assertDryRunNoDatabaseChangesV3();

    return {
      success: result.success === true,
      message: '',
      status: result.status || ''
    };

  } catch (error) {
    return {
      success: false,
      message:
        String(error.message || error)
    };
  }
}


/**
 * Safe 3J.5 status.
 */
function kidlearnV3_controlWriteSafe3J5Status_() {
  try {
    return kidlearnV3_getDryRunNoWriteChecklistStatusV3();
  } catch (error) {
    return {
      success: false,
      status: '',
      error:
        String(error.message || error)
    };
  }
}


/**
 * Safe connection.
 */
function kidlearnV3_controlWriteSafeConnection_() {
  try {
    return kidlearnV3_getAppDevConnectionV3Status();
  } catch (error) {
    return {
      success: false,
      databaseMode: '',
      connectionStatus: '',
      spreadsheetId: '',
      spreadsheetName: '',
      error:
        String(error.message || error)
    };
  }
}


/**
 * Safe Write status.
 */
function kidlearnV3_controlWriteSafeWriteStatus_() {
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
 * Enable count.
 */
function kidlearnV3_controlWriteGetEnableCount_() {
  return Number(
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_CONTROLLED_WRITE_KEYS.ENABLE_COUNT
      ) ||
      0
  );
}


/**
 * Normalize request.
 */
function kidlearnV3_controlWriteNormalizeRequest_(
  request
) {
  if (!request) {
    return {};
  }

  if (typeof request !== 'object') {
    return {
      value: request
    };
  }

  return request;
}


/**
 * Save compact result.
 */
function kidlearnV3_controlWriteSaveResult_(
  result
) {
  try {
    PropertiesService
      .getScriptProperties()
      .setProperty(
        KIDLEARN_V3_CONTROLLED_WRITE_KEYS.LAST_RESULT_JSON,
        JSON.stringify({
          success: result.success,
          action: result.action,
          phase: result.phase,
          status: result.status || '',
          safeWriteMode: result.safeWriteMode || '',
          at: new Date().toISOString(),
          errorCount: result.errorCount || 0,
          warningCount: result.warningCount || 0
        })
      );
  } catch (error) {
    console.warn(
      'Không lưu được Controlled Write result: ' +
      String(error.message || error)
    );
  }
}


/**
 * Read last result.
 */
function kidlearnV3_controlWriteReadLastResult_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_CONTROLLED_WRITE_KEYS.LAST_RESULT_JSON
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
 * Current user email.
 */
function kidlearnV3_controlWriteGetUserEmail_() {
  try {
    return Session.getActiveUser().getEmail() || '';
  } catch (error) {
    return '';
  }
}