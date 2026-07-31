/**
 * ================================================================
 * KIDLEARN V3 - LEGACY UI CALL REPLACEMENT
 * Step: 3I.8
 * Version: 3.1.0
 * ================================================================
 *
 * File này tạo các hàm thay thế google.script.run cũ.
 *
 * UI cũ DEV có thể gọi:
 * - kidlearnV3_getHomeDataV3
 * - kidlearnV3_getSubjectsDataV3
 * - kidlearnV3_getChildrenDataV3
 * - kidlearnV3_getAssignmentsDataV3
 *
 * Các hàm này đi qua UI Router DEV V3.
 *
 * KHÔNG sửa PROD.
 * KHÔNG ghi dữ liệu.
 * KHÔNG xóa dữ liệu.
 */


/**
 * Preview bước thay thế legacy UI calls.
 */
function kidlearnV3_previewLegacyCallReplacementV3() {
  var errors = [];
  var warnings = [];

  if (
    typeof kidlearnV3_uiRouterLoadScreenV3 !== 'function'
  ) {
    errors.push(
      'Thiếu function: kidlearnV3_uiRouterLoadScreenV3'
    );
  }

  if (
    typeof kidlearnV3_uiRouterGetInitialStateV3 !== 'function'
  ) {
    errors.push(
      'Thiếu function: kidlearnV3_uiRouterGetInitialStateV3'
    );
  }

  if (
    typeof kidlearnV3_uiSwitchGetModeV3 !== 'function'
  ) {
    errors.push(
      'Thiếu function: kidlearnV3_uiSwitchGetModeV3'
    );
  }

  var mode = '';

  try {
    mode =
      kidlearnV3_uiSwitchGetModeV3();
  } catch (error) {
    mode = 'UNKNOWN';
  }

  if (mode !== 'V3') {
    errors.push(
      'DEV_SWITCH chưa bật V3. Mode hiện tại: ' +
      mode
    );
  }

  var htmlChecks =
    kidlearnV3_checkLegacyReplacementHtmlFilesV3_();

  errors =
    errors.concat(
      htmlChecks.errors
    );

  warnings =
    warnings.concat(
      htmlChecks.warnings
    );

  var result = {
    success:
      errors.length === 0,
    action:
      'PREVIEW_LEGACY_CALL_REPLACEMENT_V3',
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
    htmlFiles:
      htmlChecks.items,
    replacementFunctions: [
      'kidlearnV3_getHomeDataV3',
      'kidlearnV3_getSubjectsDataV3',
      'kidlearnV3_getChildrenDataV3',
      'kidlearnV3_getAssignmentsDataV3'
    ]
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Smoke test các hàm thay thế legacy UI calls.
 */
function kidlearnV3_smokeTestLegacyCallReplacementV3() {
  var home =
    kidlearnV3_getHomeDataV3({});

  var subjects =
    kidlearnV3_getSubjectsDataV3({});

  var children =
    kidlearnV3_getChildrenDataV3({});

  var assignments =
    kidlearnV3_getAssignmentsDataV3({});

  var errors = [];
  var warnings = [];

  kidlearnV3_assertLegacyReplacementResponseV3_(
    home,
    'HOME',
    errors
  );

  kidlearnV3_assertLegacyReplacementResponseV3_(
    subjects,
    'SUBJECTS',
    errors
  );

  kidlearnV3_assertLegacyReplacementResponseV3_(
    children,
    'CHILDREN',
    errors
  );

  kidlearnV3_assertLegacyReplacementResponseV3_(
    assignments,
    'ASSIGNMENTS',
    errors
  );

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
      'CHILDREN phải có ít nhất 1 child.'
    );
  }

  if (
    assignments.success &&
    assignments.data &&
    assignments.data.count < 1
  ) {
    warnings.push(
      'ASSIGNMENTS đang trống hoặc chưa gắn với child hiện tại.'
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'SMOKE_TEST_LEGACY_CALL_REPLACEMENT_V3',
    mode:
      kidlearnV3_safeLegacyReplacementModeV3_(),
    errorCount:
      errors.length,
    warningCount:
      warnings.length,
    errors:
      errors,
    warnings:
      warnings,
    checks: {
      home:
        home.success,
      subjects:
        subjects.success,
      children:
        children.success,
      assignments:
        assignments.success
    },
    counts: {
      subjects:
        subjects.success && subjects.data
          ? subjects.data.count
          : 0,
      children:
        children.success && children.data
          ? children.data.count
          : 0,
      assignments:
        assignments.success && assignments.data
          ? assignments.data.count
          : 0
    }
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test legacy call replacement chưa đạt. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Mở DEV App Router UI.
 *
 * Chỉ mở qua menu Google Sheet, không chạy trực tiếp từ Apps Script editor.
 */
function kidlearnV3_showDevAppRouterV3() {
  var preview =
    kidlearnV3_previewLegacyCallReplacementV3();

  if (!preview.success) {
    throw new Error(
      'DEV App Router V3 chưa sẵn sàng. Errors: ' +
      preview.errorCount +
      '. Xem Execution log.'
    );
  }

  var html =
    HtmlService
      .createTemplateFromFile(
        'UI_Dev_App_Router_V3'
      )
      .evaluate()
      .setTitle(
        'KIDLEARN DEV App Router V3'
      )
      .setWidth(1200)
      .setHeight(850);

  SpreadsheetApp
    .getUi()
    .showModalDialog(
      html,
      'KIDLEARN DEV App Router V3'
    );
}


/**
 * Hàm thay thế call cũ cho Home/Dashboard.
 */
function kidlearnV3_getHomeDataV3(request) {
  return kidlearnV3_legacyReplacementLoadScreenV3_(
    'HOME',
    request
  );
}


/**
 * Hàm thay thế call cũ cho Subjects.
 */
function kidlearnV3_getSubjectsDataV3(request) {
  return kidlearnV3_legacyReplacementLoadScreenV3_(
    'SUBJECTS',
    request
  );
}


/**
 * Hàm thay thế call cũ cho Children.
 */
function kidlearnV3_getChildrenDataV3(request) {
  return kidlearnV3_legacyReplacementLoadScreenV3_(
    'CHILDREN',
    request
  );
}


/**
 * Hàm thay thế call cũ cho Assignments/Tasks.
 */
function kidlearnV3_getAssignmentsDataV3(request) {
  return kidlearnV3_legacyReplacementLoadScreenV3_(
    'ASSIGNMENTS',
    request
  );
}


/**
 * Load screen qua UI Router DEV V3.
 */
function kidlearnV3_legacyReplacementLoadScreenV3_(
  screen,
  request
) {
  var safeRequest =
    kidlearnV3_normalizeLegacyReplacementRequestV3_(
      request
    );

  safeRequest.screen =
    screen;

  return kidlearnV3_uiRouterLoadScreenV3(
    safeRequest
  );
}


/**
 * Normalize request.
 */
function kidlearnV3_normalizeLegacyReplacementRequestV3_(
  request
) {
  if (!request) {
    return {
      childId: '',
      userId: '',
      limit: 100
    };
  }

  if (
    typeof request !== 'object'
  ) {
    return {
      value: request,
      childId: '',
      userId: '',
      limit: 100
    };
  }

  return {
    childId:
      request.childId || '',
    userId:
      request.userId || '',
    limit:
      request.limit || 100
  };
}


/**
 * Check HTML files.
 */
function kidlearnV3_checkLegacyReplacementHtmlFilesV3_() {
  var names = [
    'UI_Legacy_Call_Adapter_V3',
    'UI_Dev_App_Router_V3'
  ];

  var errors = [];
  var warnings = [];
  var items = [];

  for (
    var i = 0;
    i < names.length;
    i++
  ) {
    try {
      var content =
        HtmlService
          .createHtmlOutputFromFile(
            names[i]
          )
          .getContent();

      items.push({
        name:
          names[i],
        exists:
          true,
        length:
          content.length
      });

    } catch (error) {
      errors.push(
        'Thiếu HTML file: ' +
        names[i]
      );

      items.push({
        name:
          names[i],
        exists:
          false,
        error:
          String(error.message || error)
      });
    }
  }

  return {
    errorCount:
      errors.length,
    warningCount:
      warnings.length,
    errors:
      errors,
    warnings:
      warnings,
    items:
      items
  };
}


/**
 * Assert response.
 */
function kidlearnV3_assertLegacyReplacementResponseV3_(
  response,
  label,
  errors
) {
  if (!response) {
    errors.push(
      label + ': response trống.'
    );

    return;
  }

  if (response.success !== true) {
    var message =
      response.error && response.error.message
        ? response.error.message
        : 'Không rõ lỗi.';

    errors.push(
      label + ': ' + message
    );
  }
}


/**
 * Safe mode.
 */
function kidlearnV3_safeLegacyReplacementModeV3_() {
  try {
    return kidlearnV3_uiSwitchGetModeV3();
  } catch (error) {
    return 'UNKNOWN';
  }
}