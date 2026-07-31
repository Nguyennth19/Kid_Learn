/**
 * ================================================================
 * KIDLEARN V3 - UI BRIDGE TO SERVICE FACADE
 * Step: 3I.4
 * Version: 3.1.0
 * ================================================================
 *
 * File này tạo cầu nối UI DEV với App Service Facade V3.
 *
 * KHÔNG sửa PROD.
 * KHÔNG override doGet cũ.
 * KHÔNG ghi dữ liệu học tập.
 */


/**
 * Preview UI Bridge V3.
 */
function kidlearnV3_previewUiServiceBridgeV3() {
  var requiredServerFunctions = [
    'kidlearnV3_servicePingV3',
    'kidlearnV3_serviceGetBootstrapV3',
    'kidlearnV3_serviceGetDashboardV3',
    'kidlearnV3_serviceGetSubjectsV3',
    'kidlearnV3_serviceGetChildrenV3',
    'kidlearnV3_serviceGetAssignmentsV3',
    'kidlearnV3_serviceGetConfigV3'
  ];

  var requiredHtmlFiles = [
    'UI_Service_Client_V3',
    'UI_Dev_Shell_V3'
  ];

  var functionChecks = [];
  var htmlChecks = [];
  var errors = [];

  for (
    var i = 0;
    i < requiredServerFunctions.length;
    i++
  ) {
    var check =
      kidlearnV3_uiCheckFunction_(
        requiredServerFunctions[i]
      );

    functionChecks.push(check);

    if (!check.exists) {
      errors.push(
        'Thiếu server function: ' +
        check.name
      );
    }
  }

  for (
    var h = 0;
    h < requiredHtmlFiles.length;
    h++
  ) {
    var htmlCheck =
      kidlearnV3_uiCheckHtmlFile_(
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

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_UI_SERVICE_BRIDGE_V3',
    errorCount: errors.length,
    errors: errors,
    connection: connection,
    functionChecks: functionChecks,
    htmlChecks: htmlChecks
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Mở UI DEV Shell trong modal dialog.
 *
 * Chạy hàm này từ Apps Script để test UI.
 */
function kidlearnV3_showUiDevShellV3() {
  var preview =
    kidlearnV3_previewUiServiceBridgeV3();

  if (!preview.success) {
    throw new Error(
      'UI Bridge V3 chưa sẵn sàng. Errors: ' +
      preview.errorCount +
      '. Xem Execution log.'
    );
  }

  var html =
    HtmlService
      .createTemplateFromFile(
        'UI_Dev_Shell_V3'
      )
      .evaluate()
      .setTitle(
        'KIDLEARN V3 - DEV Shell'
      )
      .setWidth(1200)
      .setHeight(800);

  SpreadsheetApp
    .getUi()
    .showModalDialog(
      html,
      'KIDLEARN V3 - DEV Shell'
    );
}


/**
 * Trả về HTML DEV Shell.
 *
 * Dùng cho bước sau nếu cần gắn vào doGet DEV.
 */
function kidlearnV3_getUiDevShellHtmlV3() {
  return HtmlService
    .createTemplateFromFile(
      'UI_Dev_Shell_V3'
    )
    .evaluate()
    .setTitle(
      'KIDLEARN V3 - DEV Shell'
    )
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );
}


/**
 * Smoke test server-side cho UI Bridge.
 */
function kidlearnV3_uiDevShellSmokeTestV3() {
  var preview =
    kidlearnV3_previewUiServiceBridgeV3();

  var ping =
    kidlearnV3_servicePingV3({});

  var bootstrap =
    kidlearnV3_serviceGetBootstrapV3({});

  var subjects =
    kidlearnV3_serviceGetSubjectsV3({});

  var children =
    kidlearnV3_serviceGetChildrenV3({});

  var errors = [];
  var warnings = [];

  if (!preview.success) {
    errors.push(
      'Preview UI Bridge chưa đạt.'
    );
  }

  if (!ping.success) {
    errors.push(
      'Service ping thất bại.'
    );
  }

  if (!bootstrap.success) {
    errors.push(
      'Service bootstrap thất bại.'
    );
  }

  if (!subjects.success) {
    errors.push(
      'Service subjects thất bại.'
    );
  }

  if (!children.success) {
    errors.push(
      'Service children thất bại.'
    );
  }

  if (
    subjects.success &&
    subjects.data.count < 4
  ) {
    errors.push(
      'Subjects phải có ít nhất 4 môn học.'
    );
  }

  if (
    children.success &&
    children.data.count < 1
  ) {
    errors.push(
      'Children chưa có dữ liệu.'
    );
  }

  if (
    bootstrap.success &&
    bootstrap.data.counts.assignments < 1
  ) {
    warnings.push(
      'Assignments đang trống hoặc chưa có bài gắn với child hiện tại.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_UI_DEV_SHELL_V3',
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    checks: {
      preview: preview.success,
      ping: ping.success,
      bootstrap: bootstrap.success,
      subjects: subjects.success,
      children: children.success
    },
    counts: {
      subjects:
        subjects.success
          ? subjects.data.count
          : 0,
      children:
        children.success
          ? children.data.count
          : 0,
      assignments:
        bootstrap.success
          ? bootstrap.data.counts.assignments
          : 0
    }
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'UI DEV Shell smoke test chưa đạt. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Include HTML partial.
 */
function kidlearnV3_uiInclude_(
  filename
) {
  return HtmlService
    .createHtmlOutputFromFile(
      filename
    )
    .getContent();
}


/**
 * Kiểm tra function có tồn tại.
 */
function kidlearnV3_uiCheckFunction_(
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
 * Kiểm tra HTML file có tồn tại.
 */
function kidlearnV3_uiCheckHtmlFile_(
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
      error: String(
        error.message || error
      )
    };
  }
}

/**
 * Mở UI Legacy DEV đã gắn DEV_SWITCH V3.
 */
function kidlearnV3_showLegacyDevUiWithV3Switch() {
  var html =
    HtmlService
      .createTemplateFromFile(
        'UI_Legacy_Dev_V3'
      )
      .evaluate()
      .setTitle(
        'KIDLEARN Legacy DEV + V3 Switch'
      )
      .setWidth(1200)
      .setHeight(850);

  SpreadsheetApp
    .getUi()
    .showModalDialog(
      html,
      'KIDLEARN Legacy DEV + V3 Switch'
    );
}