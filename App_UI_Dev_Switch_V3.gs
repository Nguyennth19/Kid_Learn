/**
 * ================================================================
 * KIDLEARN V3 - UI DEV SWITCH
 * Step: 3I.5
 * Version: 3.1.0
 * ================================================================
 *
 * File này tạo lớp DEV_SWITCH để UI cũ gọi Service Facade V3.
 *
 * KHÔNG sửa PROD.
 * KHÔNG đổi doGet cũ.
 * KHÔNG ghi dữ liệu học tập.
 * KHÔNG xóa dữ liệu.
 */


var KIDLEARN_V3_UI_SWITCH_KEYS = {
  MODE: 'KIDLEARN_UI_DEV_SWITCH_MODE',
  ENABLED_AT: 'KIDLEARN_UI_DEV_SWITCH_ENABLED_AT',
  DISABLED_AT: 'KIDLEARN_UI_DEV_SWITCH_DISABLED_AT',
  LAST_SMOKE_TEST_AT: 'KIDLEARN_UI_DEV_SWITCH_LAST_SMOKE_TEST_AT'
};

var KIDLEARN_V3_UI_SWITCH_MODES = {
  LEGACY: 'LEGACY',
  V3: 'V3'
};


/**
 * Preview DEV_SWITCH V3.
 */
function kidlearnV3_previewUiDevSwitchV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var mode =
    kidlearnV3_uiSwitchGetModeV3();

  var checks =
    kidlearnV3_uiSwitchCheckDependencies_();

  var result = {
    success: checks.errorCount === 0,
    action: 'PREVIEW_UI_DEV_SWITCH_V3',
    mode: mode,
    errorCount: checks.errorCount,
    warningCount: checks.warningCount,
    errors: checks.errors,
    warnings: checks.warnings,
    properties: {
      mode:
        properties.getProperty(
          KIDLEARN_V3_UI_SWITCH_KEYS.MODE
        ),
      enabledAt:
        properties.getProperty(
          KIDLEARN_V3_UI_SWITCH_KEYS.ENABLED_AT
        ),
      disabledAt:
        properties.getProperty(
          KIDLEARN_V3_UI_SWITCH_KEYS.DISABLED_AT
        ),
      lastSmokeTestAt:
        properties.getProperty(
          KIDLEARN_V3_UI_SWITCH_KEYS.LAST_SMOKE_TEST_AT
        )
    }
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Bật UI DEV Switch sang V3.
 */
function kidlearnV3_enableUiDevSwitchV3() {
  var checks =
    kidlearnV3_uiSwitchCheckDependencies_();

  if (checks.errorCount > 0) {
    throw new Error(
      'Không thể bật DEV_SWITCH V3. Errors: ' +
      checks.errorCount +
      '. Xem Execution log.'
    );
  }

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_UI_SWITCH_KEYS.MODE,
    KIDLEARN_V3_UI_SWITCH_MODES.V3
  );

  properties.setProperty(
    KIDLEARN_V3_UI_SWITCH_KEYS.ENABLED_AT,
    new Date().toISOString()
  );

  var result = {
    success: true,
    action: 'ENABLE_UI_DEV_SWITCH_V3',
    mode: KIDLEARN_V3_UI_SWITCH_MODES.V3,
    message: 'UI DEV Switch đã bật sang V3.'
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Tắt UI DEV Switch, quay lại LEGACY.
 */
function kidlearnV3_disableUiDevSwitchV3() {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_UI_SWITCH_KEYS.MODE,
    KIDLEARN_V3_UI_SWITCH_MODES.LEGACY
  );

  properties.setProperty(
    KIDLEARN_V3_UI_SWITCH_KEYS.DISABLED_AT,
    new Date().toISOString()
  );

  var result = {
    success: true,
    action: 'DISABLE_UI_DEV_SWITCH_V3',
    mode: KIDLEARN_V3_UI_SWITCH_MODES.LEGACY,
    message: 'UI DEV Switch đã quay lại LEGACY.'
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Lấy mode hiện tại.
 */
function kidlearnV3_uiSwitchGetModeV3() {
  var mode =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_UI_SWITCH_KEYS.MODE
      );

  if (mode === KIDLEARN_V3_UI_SWITCH_MODES.V3) {
    return KIDLEARN_V3_UI_SWITCH_MODES.V3;
  }

  return KIDLEARN_V3_UI_SWITCH_MODES.LEGACY;
}


/**
 * Smoke test DEV_SWITCH.
 */
function kidlearnV3_smokeTestUiDevSwitchV3() {
  var ping =
    kidlearnV3_uiApiDispatchV3({
      action: 'PING',
      payload: {}
    });

  var bootstrap =
    kidlearnV3_uiApiDispatchV3({
      action: 'BOOTSTRAP',
      payload: {}
    });

  var subjects =
    kidlearnV3_uiApiDispatchV3({
      action: 'SUBJECTS',
      payload: {}
    });

  var children =
    kidlearnV3_uiApiDispatchV3({
      action: 'CHILDREN',
      payload: {}
    });

  var errors = [];
  var warnings = [];

  if (!ping.success) {
    errors.push(
      'PING qua DEV_SWITCH thất bại.'
    );
  }

  if (!bootstrap.success) {
    errors.push(
      'BOOTSTRAP qua DEV_SWITCH thất bại.'
    );
  }

  if (!subjects.success) {
    errors.push(
      'SUBJECTS qua DEV_SWITCH thất bại.'
    );
  }

  if (!children.success) {
    errors.push(
      'CHILDREN qua DEV_SWITCH thất bại.'
    );
  }

  if (
    subjects.success &&
    subjects.data &&
    subjects.data.count < 4
  ) {
    errors.push(
      'SUBJECTS phải có ít nhất 4 môn học.'
    );
  }

  if (
    children.success &&
    children.data &&
    children.data.count < 1
  ) {
    errors.push(
      'CHILDREN chưa có dữ liệu.'
    );
  }

  if (
    bootstrap.success &&
    bootstrap.data &&
    bootstrap.data.counts &&
    bootstrap.data.counts.assignments < 1
  ) {
    warnings.push(
      'Assignments đang trống hoặc chưa gắn với child hiện tại.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_UI_DEV_SWITCH_V3',
    mode: kidlearnV3_uiSwitchGetModeV3(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    checks: {
      ping: ping.success,
      bootstrap: bootstrap.success,
      subjects: subjects.success,
      children: children.success
    }
  };

  if (result.success) {
    PropertiesService
      .getScriptProperties()
      .setProperty(
        KIDLEARN_V3_UI_SWITCH_KEYS.LAST_SMOKE_TEST_AT,
        new Date().toISOString()
      );
  }

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test UI DEV Switch chưa đạt. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Public dispatcher cho UI cũ DEV gọi.
 *
 * UI chỉ cần gọi 1 hàm này:
 * kidlearnV3_uiApiDispatchV3({ action: 'BOOTSTRAP', payload: {} })
 */
function kidlearnV3_uiApiDispatchV3(request) {
  var safeRequest =
    kidlearnV3_uiSwitchNormalizeRequest_(
      request
    );

  var action =
    String(safeRequest.action || '')
      .trim()
      .toUpperCase();

  var payload =
    safeRequest.payload || {};

  var mode =
    kidlearnV3_uiSwitchGetModeV3();

  if (mode !== KIDLEARN_V3_UI_SWITCH_MODES.V3) {
    return {
      success: false,
      serviceName: 'UI_DEV_SWITCH',
      error: {
        code: 'DEV_SWITCH_NOT_V3',
        message:
          'UI DEV Switch chưa bật V3. Mode hiện tại: ' +
          mode
      }
    };
  }

  if (action === 'PING') {
    return kidlearnV3_servicePingV3(
      payload
    );
  }

  if (action === 'BOOTSTRAP') {
    return kidlearnV3_serviceGetBootstrapV3(
      payload
    );
  }

  if (action === 'DASHBOARD') {
    return kidlearnV3_serviceGetDashboardV3(
      payload
    );
  }

  if (action === 'SUBJECTS') {
    return kidlearnV3_serviceGetSubjectsV3(
      payload
    );
  }

  if (action === 'CHILDREN') {
    return kidlearnV3_serviceGetChildrenV3(
      payload
    );
  }

  if (action === 'ASSIGNMENTS') {
    return kidlearnV3_serviceGetAssignmentsV3(
      payload
    );
  }

  if (action === 'FAMILY_CONTEXT') {
    return kidlearnV3_serviceGetFamilyContextV3(
      payload
    );
  }

  if (action === 'CONFIG') {
    return kidlearnV3_serviceGetConfigV3(
      payload
    );
  }

  if (action === 'READ_CORE') {
    return kidlearnV3_serviceReadCoreV3(
      payload
    );
  }

  return {
    success: false,
    serviceName: 'UI_DEV_SWITCH',
    error: {
      code: 'UNKNOWN_UI_ACTION',
      message:
        'Action không được hỗ trợ: ' +
        action
    }
  };
}


/**
 * Wrapper riêng cho Bootstrap.
 * Dùng nếu UI cũ muốn gọi function trực tiếp.
 */
function kidlearnV3_uiApiGetBootstrapV3(request) {
  return kidlearnV3_uiApiDispatchV3({
    action: 'BOOTSTRAP',
    payload: request || {}
  });
}


/**
 * Wrapper riêng cho Dashboard.
 */
function kidlearnV3_uiApiGetDashboardV3(request) {
  return kidlearnV3_uiApiDispatchV3({
    action: 'DASHBOARD',
    payload: request || {}
  });
}


/**
 * Wrapper riêng cho Subjects.
 */
function kidlearnV3_uiApiGetSubjectsV3(request) {
  return kidlearnV3_uiApiDispatchV3({
    action: 'SUBJECTS',
    payload: request || {}
  });
}


/**
 * Wrapper riêng cho Children.
 */
function kidlearnV3_uiApiGetChildrenV3(request) {
  return kidlearnV3_uiApiDispatchV3({
    action: 'CHILDREN',
    payload: request || {}
  });
}


/**
 * Wrapper riêng cho Assignments.
 */
function kidlearnV3_uiApiGetAssignmentsV3(request) {
  return kidlearnV3_uiApiDispatchV3({
    action: 'ASSIGNMENTS',
    payload: request || {}
  });
}


/**
 * Kiểm tra dependency của DEV_SWITCH.
 */
function kidlearnV3_uiSwitchCheckDependencies_() {
  var errors = [];
  var warnings = [];

  kidlearnV3_uiSwitchRequireFunction_(
    'kidlearnV3_servicePingV3',
    errors
  );

  kidlearnV3_uiSwitchRequireFunction_(
    'kidlearnV3_serviceGetBootstrapV3',
    errors
  );

  kidlearnV3_uiSwitchRequireFunction_(
    'kidlearnV3_serviceGetDashboardV3',
    errors
  );

  kidlearnV3_uiSwitchRequireFunction_(
    'kidlearnV3_serviceGetSubjectsV3',
    errors
  );

  kidlearnV3_uiSwitchRequireFunction_(
    'kidlearnV3_serviceGetChildrenV3',
    errors
  );

  kidlearnV3_uiSwitchRequireFunction_(
    'kidlearnV3_serviceGetAssignmentsV3',
    errors
  );

  var connection =
    kidlearnV3_getAppDevConnectionV3Status();

  if (
    connection.databaseMode !== 'V3' ||
    connection.connectionStatus !== 'CONNECTED'
  ) {
    errors.push(
      'App DEV chưa CONNECTED với Database V3.'
    );
  }

  var servicePreview =
    kidlearnV3_previewAppServiceFacadeV3();

  if (!servicePreview.success) {
    errors.push(
      'App Service Facade V3 chưa sẵn sàng.'
    );
  }

  return {
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Kiểm tra function có tồn tại.
 */
function kidlearnV3_uiSwitchRequireFunction_(
  functionName,
  errors
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

  if (!exists) {
    errors.push(
      'Thiếu function: ' +
      functionName
    );
  }
}


/**
 * Normalize request.
 */
function kidlearnV3_uiSwitchNormalizeRequest_(
  request
) {
  if (!request) {
    return {
      action: '',
      payload: {}
    };
  }

  if (
    typeof request === 'string'
  ) {
    return {
      action: request,
      payload: {}
    };
  }

  if (
    typeof request !== 'object'
  ) {
    return {
      action: '',
      payload: {
        value: request
      }
    };
  }

  return {
    action: request.action || '',
    payload: request.payload || {}
  };
}