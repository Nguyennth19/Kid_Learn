/**
 * ================================================================
 * KIDLEARN V3 - END TO END QA FOR UI DEV
 * Step: 3I.9
 * Version: 3.1.0
 * ================================================================
 *
 * File này kiểm thử end-to-end UI DEV với Database V3.
 *
 * KHÔNG sửa PROD.
 * KHÔNG ghi dữ liệu học tập.
 * KHÔNG xóa dữ liệu.
 * Chỉ ghi trạng thái checklist vào ScriptProperties.
 */


var KIDLEARN_V3_E2E_KEYS = {
  PHASE_STATUS: 'KIDLEARN_V3_PHASE_3I_STATUS',
  LAST_RUN_AT: 'KIDLEARN_V3_PHASE_3I_LAST_RUN_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3I_READY_AT',
  LAST_ERROR_COUNT: 'KIDLEARN_V3_PHASE_3I_LAST_ERROR_COUNT',
  LAST_WARNING_COUNT: 'KIDLEARN_V3_PHASE_3I_LAST_WARNING_COUNT',
  LAST_SUMMARY_JSON: 'KIDLEARN_V3_PHASE_3I_LAST_SUMMARY_JSON'
};

var KIDLEARN_V3_E2E_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  READY_TO_CLOSE: 'READY_TO_CLOSE'
};


/**
 * Preview E2E UI DEV V3.
 */
function kidlearnV3_previewEndToEndUiDevV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions = [
    'kidlearnV3_getAppDevConnectionV3Status',
    'kidlearnV3_previewAppServiceFacadeV3',
    'kidlearnV3_previewUiDevSwitchV3',
    'kidlearnV3_previewUiScreenMapperV3',
    'kidlearnV3_previewUiRouterDevV3',
    'kidlearnV3_previewLegacyCallReplacementV3',
    'kidlearnV3_uiSwitchGetModeV3',
    'kidlearnV3_servicePingV3',
    'kidlearnV3_serviceGetBootstrapV3',
    'kidlearnV3_uiRouterGetInitialStateV3',
    'kidlearnV3_uiRouterLoadScreenV3',
    'kidlearnV3_getHomeDataV3',
    'kidlearnV3_getSubjectsDataV3',
    'kidlearnV3_getChildrenDataV3',
    'kidlearnV3_getAssignmentsDataV3'
  ];

  var requiredHtmlFiles = [
    'UI_Legacy_Call_Adapter_V3',
    'UI_Dev_App_Router_V3',
    'UI_Router_Dev_Client_V3',
    'UI_Router_Dev_Shell_V3'
  ];

  var functionChecks = [];
  var htmlChecks = [];

  for (var i = 0; i < requiredFunctions.length; i++) {
    var functionCheck =
      kidlearnV3_e2eCheckFunction_(
        requiredFunctions[i]
      );

    functionChecks.push(functionCheck);

    if (!functionCheck.exists) {
      errors.push(
        'Thiếu function: ' +
        functionCheck.name
      );
    }
  }

  for (var h = 0; h < requiredHtmlFiles.length; h++) {
    var htmlCheck =
      kidlearnV3_e2eCheckHtmlFile_(
        requiredHtmlFiles[h]
      );

    htmlChecks.push(htmlCheck);

    if (!htmlCheck.exists) {
      errors.push(
        'Thiếu HTML file: ' +
        htmlCheck.name
      );
    }
  }

  var mode =
    kidlearnV3_e2eSafeSwitchMode_();

  if (mode !== 'V3') {
    errors.push(
      'DEV_SWITCH chưa bật V3. Mode hiện tại: ' +
      mode
    );
  }

  var connection =
    kidlearnV3_e2eSafeConnectionStatus_();

  if (
    connection.databaseMode !== 'V3' ||
    connection.connectionStatus !== 'CONNECTED'
  ) {
    errors.push(
      'App DEV chưa CONNECTED với Database V3.'
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'PREVIEW_E2E_UI_DEV_V3',
    phase:
      '3I.9',
    mode:
      mode,
    errorCount:
      errors.length,
    warningCount:
      warnings.length,
    errors:
      errors,
    warnings:
      warnings,
    connection:
      connection,
    functionChecks:
      functionChecks,
    htmlChecks:
      htmlChecks
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Run full E2E UI DEV V3.
 */
function kidlearnV3_runEndToEndUiDevV3() {
  var startedAt =
    new Date();

  var steps = [];
  var warnings = [];

  kidlearnV3_e2eStep_(
    steps,
    '01_PREVIEW_E2E_DEPENDENCIES',
    function() {
      var result =
        kidlearnV3_previewEndToEndUiDevV3();

      kidlearnV3_e2eAssert_(
        result.success,
        'Preview E2E chưa đạt. Errors: ' +
        result.errorCount
      );

      return result;
    }
  );

  kidlearnV3_e2eStep_(
    steps,
    '02_SERVICE_PING',
    function() {
      var response =
        kidlearnV3_servicePingV3({});

      kidlearnV3_e2eAssertResponse_(
        response,
        'Service ping thất bại.'
      );

      kidlearnV3_e2eAssert_(
        response.data.databaseMode === 'V3',
        'Service ping không ở databaseMode V3.'
      );

      kidlearnV3_e2eAssert_(
        response.data.connectionStatus === 'CONNECTED',
        'Service ping chưa CONNECTED.'
      );

      return response;
    }
  );

  kidlearnV3_e2eStep_(
    steps,
    '03_SERVICE_BOOTSTRAP',
    function() {
      var response =
        kidlearnV3_serviceGetBootstrapV3({});

      kidlearnV3_e2eAssertResponse_(
        response,
        'Service bootstrap thất bại.'
      );

      var counts =
        response.data.counts || {};

      kidlearnV3_e2eAssert_(
        Number(counts.subjects || 0) >= 4,
        'Bootstrap phải có ít nhất 4 subjects.'
      );

      kidlearnV3_e2eAssert_(
        Number(counts.children || 0) >= 1,
        'Bootstrap phải có ít nhất 1 child.'
      );

      if (Number(counts.assignments || 0) < 1) {
        warnings.push(
          'Bootstrap assignments đang trống hoặc chưa gắn với child hiện tại.'
        );
      }

      return response;
    }
  );

  kidlearnV3_e2eStep_(
    steps,
    '04_ROUTER_INITIAL_HOME',
    function() {
      var response =
        kidlearnV3_uiRouterGetInitialStateV3({
          screen: 'HOME'
        });

      kidlearnV3_e2eAssertResponse_(
        response,
        'Router initial HOME thất bại.'
      );

      kidlearnV3_e2eAssert_(
        response.currentScreen === 'HOME',
        'Initial screen không phải HOME.'
      );

      return response;
    }
  );

  kidlearnV3_e2eStep_(
    steps,
    '05_ROUTER_SUBJECTS',
    function() {
      var response =
        kidlearnV3_uiRouterLoadScreenV3({
          screen: 'SUBJECTS'
        });

      kidlearnV3_e2eAssertResponse_(
        response,
        'Router SUBJECTS thất bại.'
      );

      kidlearnV3_e2eAssert_(
        Number(response.data.count || 0) >= 4,
        'SUBJECTS phải có ít nhất 4 môn học.'
      );

      return response;
    }
  );

  kidlearnV3_e2eStep_(
    steps,
    '06_ROUTER_CHILDREN',
    function() {
      var response =
        kidlearnV3_uiRouterLoadScreenV3({
          screen: 'CHILDREN'
        });

      kidlearnV3_e2eAssertResponse_(
        response,
        'Router CHILDREN thất bại.'
      );

      kidlearnV3_e2eAssert_(
        Number(response.data.count || 0) >= 1,
        'CHILDREN phải có ít nhất 1 child.'
      );

      return response;
    }
  );

  kidlearnV3_e2eStep_(
    steps,
    '07_ROUTER_ASSIGNMENTS',
    function() {
      var response =
        kidlearnV3_uiRouterLoadScreenV3({
          screen: 'ASSIGNMENTS',
          limit: 100
        });

      kidlearnV3_e2eAssertResponse_(
        response,
        'Router ASSIGNMENTS thất bại.'
      );

      if (Number(response.data.count || 0) < 1) {
        warnings.push(
          'Router ASSIGNMENTS đang trống hoặc chưa gắn với child hiện tại.'
        );
      }

      return response;
    }
  );

  kidlearnV3_e2eStep_(
    steps,
    '08_LEGACY_REPLACEMENT_HOME',
    function() {
      var response =
        kidlearnV3_getHomeDataV3({});

      kidlearnV3_e2eAssertResponse_(
        response,
        'Legacy replacement HOME thất bại.'
      );

      var counts =
        response.data.counts || {};

      kidlearnV3_e2eAssert_(
        Number(counts.subjects || 0) >= 4,
        'Legacy HOME phải có ít nhất 4 subjects.'
      );

      return response;
    }
  );

  kidlearnV3_e2eStep_(
    steps,
    '09_LEGACY_REPLACEMENT_SUBJECTS',
    function() {
      var response =
        kidlearnV3_getSubjectsDataV3({});

      kidlearnV3_e2eAssertResponse_(
        response,
        'Legacy replacement SUBJECTS thất bại.'
      );

      kidlearnV3_e2eAssert_(
        Number(response.data.count || 0) >= 4,
        'Legacy SUBJECTS phải có ít nhất 4 subjects.'
      );

      return response;
    }
  );

  kidlearnV3_e2eStep_(
    steps,
    '10_LEGACY_REPLACEMENT_CHILDREN',
    function() {
      var response =
        kidlearnV3_getChildrenDataV3({});

      kidlearnV3_e2eAssertResponse_(
        response,
        'Legacy replacement CHILDREN thất bại.'
      );

      kidlearnV3_e2eAssert_(
        Number(response.data.count || 0) >= 1,
        'Legacy CHILDREN phải có ít nhất 1 child.'
      );

      return response;
    }
  );

  kidlearnV3_e2eStep_(
    steps,
    '11_LEGACY_REPLACEMENT_ASSIGNMENTS',
    function() {
      var response =
        kidlearnV3_getAssignmentsDataV3({
          limit: 100
        });

      kidlearnV3_e2eAssertResponse_(
        response,
        'Legacy replacement ASSIGNMENTS thất bại.'
      );

      if (Number(response.data.count || 0) < 1) {
        warnings.push(
          'Legacy ASSIGNMENTS đang trống hoặc chưa gắn với child hiện tại.'
        );
      }

      return response;
    }
  );

  var errors =
    kidlearnV3_e2eCollectStepErrors_(
      steps
    );

  var finishedAt =
    new Date();

  var result = {
    success:
      errors.length === 0,
    action:
      'RUN_E2E_UI_DEV_V3',
    phase:
      '3I.9',
    mode:
      kidlearnV3_e2eSafeSwitchMode_(),
    startedAt:
      startedAt.toISOString(),
    finishedAt:
      finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    errorCount:
      errors.length,
    warningCount:
      warnings.length,
    errors:
      errors,
    warnings:
      warnings,
    steps:
      steps,
    checklist:
      kidlearnV3_e2eBuildChecklist_(
        steps,
        errors,
        warnings
      )
  };

  kidlearnV3_e2eSaveStatus_(
    result
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'E2E UI DEV V3 chưa đạt. Errors: ' +
      result.errorCount
    );
  }

  return result;
}


/**
 * Đánh dấu Phase 3I đã sẵn sàng đóng.
 *
 * Hàm này sẽ chạy E2E trước.
 * Chỉ khi E2E pass mới đánh dấu READY_TO_CLOSE.
 */
function kidlearnV3_markPhase3IReadyForCloseV3() {
  var result =
    kidlearnV3_runEndToEndUiDevV3();

  if (!result.success) {
    throw new Error(
      'Không thể đóng phase 3I vì E2E chưa pass.'
    );
  }

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_E2E_KEYS.PHASE_STATUS,
    KIDLEARN_V3_E2E_STATUS.READY_TO_CLOSE
  );

  properties.setProperty(
    KIDLEARN_V3_E2E_KEYS.LAST_READY_AT,
    new Date().toISOString()
  );

  var finalResult = {
    success: true,
    action: 'MARK_PHASE_3I_READY_FOR_CLOSE_V3',
    phase: '3I',
    status: KIDLEARN_V3_E2E_STATUS.READY_TO_CLOSE,
    message: 'Phase 3I đã sẵn sàng đóng.',
    e2eSummary: {
      errorCount: result.errorCount,
      warningCount: result.warningCount,
      durationMs: result.durationMs
    }
  };

  console.log(
    JSON.stringify(finalResult, null, 2)
  );

  return finalResult;
}


/**
 * Xem trạng thái Phase 3I.
 */
function kidlearnV3_getPhase3IStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PHASE_3I_STATUS_V3',
    phase: '3I',
    status:
      properties.getProperty(
        KIDLEARN_V3_E2E_KEYS.PHASE_STATUS
      ) ||
      KIDLEARN_V3_E2E_STATUS.NOT_RUN,
    lastRunAt:
      properties.getProperty(
        KIDLEARN_V3_E2E_KEYS.LAST_RUN_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_E2E_KEYS.LAST_READY_AT
      ) ||
      '',
    lastErrorCount:
      Number(
        properties.getProperty(
          KIDLEARN_V3_E2E_KEYS.LAST_ERROR_COUNT
        ) ||
        0
      ),
    lastWarningCount:
      Number(
        properties.getProperty(
          KIDLEARN_V3_E2E_KEYS.LAST_WARNING_COUNT
        ) ||
        0
      ),
    lastSummary:
      kidlearnV3_e2eReadLastSummary_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Step wrapper.
 */
function kidlearnV3_e2eStep_(
  steps,
  name,
  handler
) {
  var startedAt =
    new Date();

  try {
    var output =
      handler();

    var finishedAt =
      new Date();

    steps.push({
      name: name,
      success: true,
      startedAt: startedAt.toISOString(),
      finishedAt: finishedAt.toISOString(),
      durationMs:
        finishedAt.getTime() -
        startedAt.getTime(),
      summary:
        kidlearnV3_e2eSummarizeOutput_(
          output
        )
    });

    return output;

  } catch (error) {
    var failedAt =
      new Date();

    steps.push({
      name: name,
      success: false,
      startedAt: startedAt.toISOString(),
      finishedAt: failedAt.toISOString(),
      durationMs:
        failedAt.getTime() -
        startedAt.getTime(),
      error: {
        message:
          String(
            error &&
            error.message
              ? error.message
              : error
          )
      }
    });

    return null;
  }
}


/**
 * Assert boolean.
 */
function kidlearnV3_e2eAssert_(
  condition,
  message
) {
  if (!condition) {
    throw new Error(message);
  }
}


/**
 * Assert response success.
 */
function kidlearnV3_e2eAssertResponse_(
  response,
  message
) {
  if (!response) {
    throw new Error(
      message + ' Response trống.'
    );
  }

  if (response.success !== true) {
    var errorMessage =
      response.error &&
      response.error.message
        ? response.error.message
        : 'Không rõ lỗi.';

    throw new Error(
      message + ' ' + errorMessage
    );
  }
}


/**
 * Collect step errors.
 */
function kidlearnV3_e2eCollectStepErrors_(
  steps
) {
  var errors = [];

  for (var i = 0; i < steps.length; i++) {
    if (steps[i].success) {
      continue;
    }

    errors.push(
      steps[i].name +
      ': ' +
      steps[i].error.message
    );
  }

  return errors;
}


/**
 * Build checklist.
 */
function kidlearnV3_e2eBuildChecklist_(
  steps,
  errors,
  warnings
) {
  return [
    {
      item: 'Database V3 connection',
      status:
        kidlearnV3_e2eStepPassed_(
          steps,
          '02_SERVICE_PING'
        )
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'Service Facade bootstrap',
      status:
        kidlearnV3_e2eStepPassed_(
          steps,
          '03_SERVICE_BOOTSTRAP'
        )
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'UI Router initial HOME',
      status:
        kidlearnV3_e2eStepPassed_(
          steps,
          '04_ROUTER_INITIAL_HOME'
        )
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'SUBJECTS screen',
      status:
        kidlearnV3_e2eStepPassed_(
          steps,
          '05_ROUTER_SUBJECTS'
        )
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'CHILDREN screen',
      status:
        kidlearnV3_e2eStepPassed_(
          steps,
          '06_ROUTER_CHILDREN'
        )
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'ASSIGNMENTS screen',
      status:
        kidlearnV3_e2eStepPassed_(
          steps,
          '07_ROUTER_ASSIGNMENTS'
        )
          ? 'PASSED_WITH_OPTIONAL_DATA'
          : 'FAILED'
    },
    {
      item: 'Legacy call replacement',
      status:
        kidlearnV3_e2eStepPassed_(
          steps,
          '08_LEGACY_REPLACEMENT_HOME'
        ) &&
        kidlearnV3_e2eStepPassed_(
          steps,
          '09_LEGACY_REPLACEMENT_SUBJECTS'
        ) &&
        kidlearnV3_e2eStepPassed_(
          steps,
          '10_LEGACY_REPLACEMENT_CHILDREN'
        ) &&
        kidlearnV3_e2eStepPassed_(
          steps,
          '11_LEGACY_REPLACEMENT_ASSIGNMENTS'
        )
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'Phase 3I result',
      status:
        errors.length === 0
          ? 'PASSED'
          : 'FAILED',
      warnings:
        warnings.length
    }
  ];
}


/**
 * Check step passed.
 */
function kidlearnV3_e2eStepPassed_(
  steps,
  name
) {
  for (var i = 0; i < steps.length; i++) {
    if (
      steps[i].name === name &&
      steps[i].success === true
    ) {
      return true;
    }
  }

  return false;
}


/**
 * Save compact status.
 */
function kidlearnV3_e2eSaveStatus_(
  result
) {
  var status =
    result.success
      ? KIDLEARN_V3_E2E_STATUS.PASSED
      : KIDLEARN_V3_E2E_STATUS.FAILED;

  var summary = {
    success: result.success,
    action: result.action,
    phase: result.phase,
    mode: result.mode,
    finishedAt: result.finishedAt,
    durationMs: result.durationMs,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    checklist: result.checklist
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_E2E_KEYS.PHASE_STATUS,
    status
  );

  properties.setProperty(
    KIDLEARN_V3_E2E_KEYS.LAST_RUN_AT,
    new Date().toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_E2E_KEYS.LAST_ERROR_COUNT,
    String(result.errorCount)
  );

  properties.setProperty(
    KIDLEARN_V3_E2E_KEYS.LAST_WARNING_COUNT,
    String(result.warningCount)
  );

  properties.setProperty(
    KIDLEARN_V3_E2E_KEYS.LAST_SUMMARY_JSON,
    JSON.stringify(summary)
  );
}


/**
 * Read last summary.
 */
function kidlearnV3_e2eReadLastSummary_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_E2E_KEYS.LAST_SUMMARY_JSON
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
 * Summary output để log gọn.
 */
function kidlearnV3_e2eSummarizeOutput_(
  output
) {
  if (!output) {
    return {};
  }

  var summary = {
    success:
      output.success === true
  };

  if (output.action) {
    summary.action =
      output.action;
  }

  if (output.serviceName) {
    summary.serviceName =
      output.serviceName;
  }

  if (output.screen) {
    summary.screen =
      output.screen;
  }

  if (output.currentScreen) {
    summary.currentScreen =
      output.currentScreen;
  }

  if (output.mode) {
    summary.mode =
      output.mode;
  }

  if (
    output.data &&
    output.data.counts
  ) {
    summary.counts =
      output.data.counts;
  }

  if (
    output.data &&
    output.data.count !== undefined
  ) {
    summary.count =
      output.data.count;
  }

  if (
    output.error &&
    output.error.message
  ) {
    summary.error =
      output.error.message;
  }

  return summary;
}


/**
 * Check function tồn tại.
 */
function kidlearnV3_e2eCheckFunction_(
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
 * Check HTML file tồn tại.
 */
function kidlearnV3_e2eCheckHtmlFile_(
  filename
) {
  try {
    var content =
      HtmlService
        .createHtmlOutputFromFile(
          filename
        )
        .getContent();

    return {
      name: filename,
      exists: true,
      length: content.length
    };

  } catch (error) {
    return {
      name: filename,
      exists: false,
      error:
        String(
          error.message || error
        )
    };
  }
}


/**
 * Safe switch mode.
 */
function kidlearnV3_e2eSafeSwitchMode_() {
  try {
    return kidlearnV3_uiSwitchGetModeV3();
  } catch (error) {
    return 'UNKNOWN';
  }
}


/**
 * Safe connection status.
 */
function kidlearnV3_e2eSafeConnectionStatus_() {
  try {
    return kidlearnV3_getAppDevConnectionV3Status();
  } catch (error) {
    return {
      success: false,
      databaseMode: '',
      connectionStatus: '',
      error:
        String(
          error.message || error
        )
    };
  }
}