/**
 * ================================================================
 * KIDLEARN V3 - CLOSE PHASE 3I AND LOCK UI DEV CONFIG
 * Step: 3I.10
 * Version: 3.1.0
 * ================================================================
 *
 * File này đóng Phase 3I và khóa cấu hình UI DEV trước khi sang 3J.
 *
 * KHÔNG sửa PROD.
 * KHÔNG ghi dữ liệu học tập.
 * KHÔNG xóa dữ liệu.
 */


var KIDLEARN_V3_PHASE_3I_LOCK_KEYS = {
  CLOSE_STATUS: 'KIDLEARN_V3_PHASE_3I_CLOSE_STATUS',
  LOCK_STATUS: 'KIDLEARN_V3_PHASE_3I_LOCK_STATUS',
  CLOSED_AT: 'KIDLEARN_V3_PHASE_3I_CLOSED_AT',
  LOCKED_AT: 'KIDLEARN_V3_PHASE_3I_LOCKED_AT',
  CLOSED_BY: 'KIDLEARN_V3_PHASE_3I_CLOSED_BY',
  NEXT_PHASE: 'KIDLEARN_V3_PHASE_3I_NEXT_PHASE',
  LOCK_REASON: 'KIDLEARN_V3_PHASE_3I_LOCK_REASON',
  LOCK_SUMMARY_JSON: 'KIDLEARN_V3_PHASE_3I_LOCK_SUMMARY_JSON',
  UNLOCKED_AT: 'KIDLEARN_V3_PHASE_3I_UNLOCKED_AT',
  UNLOCK_REASON: 'KIDLEARN_V3_PHASE_3I_UNLOCK_REASON',
  UI_DEV_LOCKED: 'KIDLEARN_V3_UI_DEV_LOCKED'
};

var KIDLEARN_V3_PHASE_3I_CLOSE_STATUS = {
  OPEN: 'OPEN',
  READY_TO_CLOSE: 'READY_TO_CLOSE',
  CLOSED_LOCKED: 'CLOSED_LOCKED',
  UNLOCKED_FOR_MAINTENANCE: 'UNLOCKED_FOR_MAINTENANCE'
};


/**
 * Preview trước khi đóng Phase 3I.
 */
function kidlearnV3_previewClosePhase3IV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions = [
    'kidlearnV3_enableUiDevSwitchV3',
    'kidlearnV3_uiSwitchGetModeV3',
    'kidlearnV3_getAppDevConnectionV3Status',
    'kidlearnV3_previewEndToEndUiDevV3',
    'kidlearnV3_runEndToEndUiDevV3',
    'kidlearnV3_markPhase3IReadyForCloseV3',
    'kidlearnV3_getPhase3IStatusV3',
    'kidlearnV3_previewLegacyCallReplacementV3',
    'kidlearnV3_smokeTestLegacyCallReplacementV3'
  ];

  var functionChecks =
    kidlearnV3_phase3ICheckFunctions_(
      requiredFunctions
    );

  errors =
    errors.concat(
      functionChecks.errors
    );

  var mode =
    kidlearnV3_phase3ISafeSwitchMode_();

  if (mode !== 'V3') {
    errors.push(
      'DEV_SWITCH chưa bật V3. Mode hiện tại: ' + mode
    );
  }

  var connection =
    kidlearnV3_phase3ISafeConnectionStatus_();

  if (
    connection.databaseMode !== 'V3' ||
    connection.connectionStatus !== 'CONNECTED'
  ) {
    errors.push(
      'App DEV chưa CONNECTED với Database V3.'
    );
  }

  var phaseStatus =
    kidlearnV3_phase3ISafeE2EStatus_();

  if (
    phaseStatus.status !== 'READY_TO_CLOSE' &&
    phaseStatus.status !== 'PASSED' &&
    phaseStatus.status !== 'CLOSED_LOCKED'
  ) {
    warnings.push(
      'Phase 3I chưa có trạng thái READY_TO_CLOSE/PASSED. Hàm close sẽ tự chạy E2E lại trước khi khóa.'
    );
  }

  var currentLock =
    kidlearnV3_getPhase3ICloseStatusV3();

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_CLOSE_PHASE_3I_V3',
    phase: '3I.10',
    nextPhase: '3J',
    mode: mode,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    connection: connection,
    phaseStatus: phaseStatus,
    currentLock: currentLock,
    functionChecks: functionChecks.items
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Đóng Phase 3I và khóa cấu hình UI DEV.
 *
 * Hàm này sẽ:
 * 1. Kiểm tra DEV_SWITCH V3.
 * 2. Chạy lại E2E 3I.
 * 3. Đánh dấu READY_TO_CLOSE.
 * 4. Ghi lock manifest.
 * 5. Set trạng thái CLOSED_LOCKED.
 */
function kidlearnV3_closePhase3IAndLockUiDevV3() {
  var preview =
    kidlearnV3_previewClosePhase3IV3();

  if (!preview.success) {
    throw new Error(
      'Không thể đóng Phase 3I. Preview chưa đạt. Errors: ' +
      preview.errorCount
    );
  }

  var readyResult =
    kidlearnV3_markPhase3IReadyForCloseV3();

  if (!readyResult.success) {
    throw new Error(
      'Không thể đóng Phase 3I vì mark READY_TO_CLOSE thất bại.'
    );
  }

  var now =
    new Date();

  var lockSummary =
    kidlearnV3_phase3IBuildLockSummary_(
      now,
      readyResult
    );

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PHASE_3I_LOCK_KEYS.CLOSE_STATUS,
    KIDLEARN_V3_PHASE_3I_CLOSE_STATUS.CLOSED_LOCKED
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE_3I_LOCK_KEYS.LOCK_STATUS,
    'LOCKED'
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE_3I_LOCK_KEYS.UI_DEV_LOCKED,
    'TRUE'
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE_3I_LOCK_KEYS.CLOSED_AT,
    now.toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE_3I_LOCK_KEYS.LOCKED_AT,
    now.toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE_3I_LOCK_KEYS.CLOSED_BY,
    kidlearnV3_phase3IGetUserEmail_()
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE_3I_LOCK_KEYS.NEXT_PHASE,
    '3J'
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE_3I_LOCK_KEYS.LOCK_REASON,
    'PHASE_3I_COMPLETED_AND_READY_FOR_3J'
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE_3I_LOCK_KEYS.LOCK_SUMMARY_JSON,
    JSON.stringify(lockSummary)
  );

  kidlearnV3_phase3ISetE2EPhaseStatus_(
    'CLOSED_LOCKED'
  );

  var result = {
    success: true,
    action: 'CLOSE_PHASE_3I_AND_LOCK_UI_DEV_V3',
    phase: '3I',
    status: 'CLOSED_LOCKED',
    lockStatus: 'LOCKED',
    uiDevLocked: true,
    nextPhase: '3J',
    closedAt: now.toISOString(),
    summary: lockSummary,
    message: 'Phase 3I đã đóng và UI DEV config đã khóa để chuyển sang Phase 3J.'
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Xem trạng thái khóa Phase 3I.
 */
function kidlearnV3_getPhase3ICloseStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var summaryText =
    properties.getProperty(
      KIDLEARN_V3_PHASE_3I_LOCK_KEYS.LOCK_SUMMARY_JSON
    );

  var result = {
    success: true,
    action: 'GET_PHASE_3I_CLOSE_STATUS_V3',
    phase: '3I',
    closeStatus:
      properties.getProperty(
        KIDLEARN_V3_PHASE_3I_LOCK_KEYS.CLOSE_STATUS
      ) ||
      KIDLEARN_V3_PHASE_3I_CLOSE_STATUS.OPEN,
    lockStatus:
      properties.getProperty(
        KIDLEARN_V3_PHASE_3I_LOCK_KEYS.LOCK_STATUS
      ) ||
      'UNLOCKED',
    uiDevLocked:
      properties.getProperty(
        KIDLEARN_V3_PHASE_3I_LOCK_KEYS.UI_DEV_LOCKED
      ) === 'TRUE',
    closedAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE_3I_LOCK_KEYS.CLOSED_AT
      ) ||
      '',
    lockedAt:
      properties.getProperty(
        KIDLEARN_V3_PHASE_3I_LOCK_KEYS.LOCKED_AT
      ) ||
      '',
    closedBy:
      properties.getProperty(
        KIDLEARN_V3_PHASE_3I_LOCK_KEYS.CLOSED_BY
      ) ||
      '',
    nextPhase:
      properties.getProperty(
        KIDLEARN_V3_PHASE_3I_LOCK_KEYS.NEXT_PHASE
      ) ||
      '',
    lockReason:
      properties.getProperty(
        KIDLEARN_V3_PHASE_3I_LOCK_KEYS.LOCK_REASON
      ) ||
      '',
    summary:
      kidlearnV3_phase3IParseJsonSafe_(
        summaryText
      )
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert cho Phase 3J.
 *
 * Phase 3J chỉ nên bắt đầu khi hàm này success.
 */
function kidlearnV3_assertPhase3IClosedFor3JV3() {
  var status =
    kidlearnV3_getPhase3ICloseStatusV3();

  var errors = [];

  if (status.closeStatus !== 'CLOSED_LOCKED') {
    errors.push(
      'Phase 3I chưa CLOSED_LOCKED. Hiện tại: ' +
      status.closeStatus
    );
  }

  if (status.lockStatus !== 'LOCKED') {
    errors.push(
      'UI DEV config chưa LOCKED. Hiện tại: ' +
      status.lockStatus
    );
  }

  if (status.uiDevLocked !== true) {
    errors.push(
      'KIDLEARN_V3_UI_DEV_LOCKED chưa bằng TRUE.'
    );
  }

  if (status.nextPhase !== '3J') {
    errors.push(
      'Next phase chưa phải 3J. Hiện tại: ' +
      status.nextPhase
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PHASE_3I_CLOSED_FOR_3J_V3',
    phase: '3I',
    nextPhase: '3J',
    errorCount: errors.length,
    errors: errors,
    closeStatus: status.closeStatus,
    lockStatus: status.lockStatus,
    uiDevLocked: status.uiDevLocked
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Phase 3I chưa đủ điều kiện chuyển sang 3J. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Mở khóa bảo trì tạm thời.
 *
 * Chỉ dùng khi cần sửa lỗi DEV.
 */
function kidlearnV3_unlockPhase3IForMaintenanceV3(request) {
  var safeRequest =
    kidlearnV3_phase3INormalizeRequest_(
      request
    );

  var reason =
    String(safeRequest.reason || '').trim();

  if (!reason) {
    throw new Error(
      'Cần nhập reason khi mở khóa maintenance.'
    );
  }

  var now =
    new Date();

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PHASE_3I_LOCK_KEYS.CLOSE_STATUS,
    KIDLEARN_V3_PHASE_3I_CLOSE_STATUS.UNLOCKED_FOR_MAINTENANCE
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE_3I_LOCK_KEYS.LOCK_STATUS,
    'UNLOCKED'
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE_3I_LOCK_KEYS.UI_DEV_LOCKED,
    'FALSE'
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE_3I_LOCK_KEYS.UNLOCKED_AT,
    now.toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_PHASE_3I_LOCK_KEYS.UNLOCK_REASON,
    reason
  );

  var result = {
    success: true,
    action: 'UNLOCK_PHASE_3I_FOR_MAINTENANCE_V3',
    phase: '3I',
    status: 'UNLOCKED_FOR_MAINTENANCE',
    unlockedAt: now.toISOString(),
    reason: reason
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Re-lock sau maintenance.
 */
function kidlearnV3_relockPhase3IAfterMaintenanceV3() {
  return kidlearnV3_closePhase3IAndLockUiDevV3();
}


/**
 * Build lock summary gọn.
 */
function kidlearnV3_phase3IBuildLockSummary_(
  dateValue,
  readyResult
) {
  var connection =
    kidlearnV3_phase3ISafeConnectionStatus_();

  var phaseStatus =
    kidlearnV3_phase3ISafeE2EStatus_();

  var properties =
    PropertiesService.getScriptProperties();

  return {
    phase: '3I',
    closeStatus: 'CLOSED_LOCKED',
    lockStatus: 'LOCKED',
    uiDevLocked: true,
    nextPhase: '3J',
    lockedAt: dateValue.toISOString(),
    lockedBy: kidlearnV3_phase3IGetUserEmail_(),
    schemaVersion:
      KIDLEARN_V3.SCHEMA_VERSION,
    appVersion:
      KIDLEARN_V3.APP_VERSION,
    devSwitchMode:
      kidlearnV3_phase3ISafeSwitchMode_(),
    appConnection: {
      databaseMode:
        connection.databaseMode || '',
      connectionStatus:
        connection.connectionStatus || '',
      spreadsheetId:
        connection.spreadsheetId || '',
      spreadsheetName:
        connection.spreadsheetName || ''
    },
    phaseStatus: {
      status:
        phaseStatus.status || '',
      lastErrorCount:
        phaseStatus.lastErrorCount || 0,
      lastWarningCount:
        phaseStatus.lastWarningCount || 0
    },
    scriptPropertiesSnapshot: {
      databaseMode:
        properties.getProperty(
          'KIDLEARN_APP_DATABASE_MODE'
        ) ||
        '',
      connectionStatus:
        properties.getProperty(
          'KIDLEARN_APP_CONNECTION_STATUS'
        ) ||
        '',
      appSchemaVersion:
        properties.getProperty(
          'KIDLEARN_APP_SCHEMA_VERSION'
        ) ||
        '',
      uiDevSwitchMode:
        properties.getProperty(
          'KIDLEARN_UI_DEV_SWITCH_MODE'
        ) ||
        ''
    },
    readyResult: {
      action:
        readyResult.action || '',
      status:
        readyResult.status || '',
      errorCount:
        readyResult.e2eSummary
          ? readyResult.e2eSummary.errorCount
          : 0,
      warningCount:
        readyResult.e2eSummary
          ? readyResult.e2eSummary.warningCount
          : 0
    }
  };
}


/**
 * Check function list.
 */
function kidlearnV3_phase3ICheckFunctions_(
  functionNames
) {
  var errors = [];
  var items = [];

  for (var i = 0; i < functionNames.length; i++) {
    var item =
      kidlearnV3_phase3ICheckFunction_(
        functionNames[i]
      );

    items.push(item);

    if (!item.exists) {
      errors.push(
        'Thiếu function: ' +
        item.name
      );
    }
  }

  return {
    errorCount: errors.length,
    errors: errors,
    items: items
  };
}


/**
 * Check một function.
 */
function kidlearnV3_phase3ICheckFunction_(
  functionName
) {
  var exists = false;

  try {
    exists =
      eval(
        'typeof ' +
        functionName +
        ' === "function"'
      );
  } catch (error) {
    exists = false;
  }

  return {
    name: functionName,
    exists: exists
  };
}


/**
 * Safe switch mode.
 */
function kidlearnV3_phase3ISafeSwitchMode_() {
  try {
    return kidlearnV3_uiSwitchGetModeV3();
  } catch (error) {
    return 'UNKNOWN';
  }
}


/**
 * Safe connection status.
 */
function kidlearnV3_phase3ISafeConnectionStatus_() {
  try {
    return kidlearnV3_getAppDevConnectionV3Status();
  } catch (error) {
    return {
      success: false,
      databaseMode: '',
      connectionStatus: '',
      spreadsheetId: '',
      spreadsheetName: '',
      error: String(error.message || error)
    };
  }
}


/**
 * Safe E2E status.
 */
function kidlearnV3_phase3ISafeE2EStatus_() {
  try {
    return kidlearnV3_getPhase3IStatusV3();
  } catch (error) {
    return {
      success: false,
      status: '',
      lastErrorCount: 0,
      lastWarningCount: 0,
      error: String(error.message || error)
    };
  }
}


/**
 * Set E2E phase status nếu key tồn tại.
 */
function kidlearnV3_phase3ISetE2EPhaseStatus_(
  status
) {
  try {
    if (
      typeof KIDLEARN_V3_E2E_KEYS !== 'undefined' &&
      KIDLEARN_V3_E2E_KEYS.PHASE_STATUS
    ) {
      PropertiesService
        .getScriptProperties()
        .setProperty(
          KIDLEARN_V3_E2E_KEYS.PHASE_STATUS,
          status
        );
    }
  } catch (error) {
    console.warn(
      'Không cập nhật được E2E phase status: ' +
      String(error.message || error)
    );
  }
}


/**
 * Parse JSON an toàn.
 */
function kidlearnV3_phase3IParseJsonSafe_(
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


/**
 * Normalize request.
 */
function kidlearnV3_phase3INormalizeRequest_(
  request
) {
  if (!request) {
    return {};
  }

  if (
    typeof request !== 'object'
  ) {
    return {
      value: request
    };
  }

  return request;
}


/**
 * Lấy email user nếu Apps Script cho phép.
 */
function kidlearnV3_phase3IGetUserEmail_() {
  try {
    return Session.getActiveUser().getEmail() || '';
  } catch (error) {
    return '';
  }
}