/**
 * ================================================================
 * KIDLEARN V3 - DATABASE VALIDATION ENGINE
 * Step: 3H.6
 * Version: 3.1.0
 * ================================================================
 *
 * Bản này dùng exact sheet name.
 * Không nhầm Data_Users với DATA_Users.
 */


/**
 * Kiểm tra 44 Sheet V3 đã tồn tại và header khớp schema.
 */
function kidlearnV3_validateCreatedSheets() {
  var context =
    kidlearnV3_assertDevEnvironment_();

  var spreadsheet =
    context.spreadsheet;

  var schema =
    kidlearnV3_buildSchema_();

  var errors = [];
  var warnings = [];
  var items = [];

  for (
    var i = 0;
    i < KIDLEARN_V3_SHEET_ORDER.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_SHEET_ORDER[i];

    var definition =
      schema[sheetName];

    var sheet =
      kidlearnV3_getSheetByExactName_(
        spreadsheet,
        sheetName
      );

    if (!definition) {
      errors.push(
        sheetName + ': thiếu schema.'
      );

      items.push({
        order: i + 1,
        sheetName: sheetName,
        status: 'SCHEMA_MISSING'
      });

      continue;
    }

    if (!sheet) {
      errors.push(
        sheetName +
        ': chưa có Sheet trong Google Sheet.'
      );

      items.push({
        order: i + 1,
        sheetName: sheetName,
        status: 'SHEET_MISSING'
      });

      continue;
    }

    var check =
      kidlearnV3_checkSheetHeaders_(
        sheet,
        definition
      );

    if (
      check.errorCount > 0
    ) {
      errors =
        errors.concat(check.errors);
    }

    if (
      check.warningCount > 0
    ) {
      warnings =
        warnings.concat(check.warnings);
    }

    items.push({
      order: i + 1,
      sheetName: sheetName,
      status:
        check.errorCount === 0
          ? 'MATCH'
          : 'HEADER_ERROR',
      columnCount:
        definition.columns.length,
      maxColumns:
        sheet.getMaxColumns(),
      maxRows:
        sheet.getMaxRows()
    });
  }

  kidlearnV3_checkLegacySourceSheetsGone_(
    spreadsheet,
    errors,
    warnings
  );

  var result = {
    success:
      errors.length === 0,

    environment:
      context.environment,

    spreadsheetName:
      context.spreadsheetName,

    schemaVersion:
      KIDLEARN_V3.SCHEMA_VERSION,

    targetSheetCount:
      KIDLEARN_V3_SHEET_ORDER.length,

    checkedSheetCount:
      items.length,

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

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Kiểm tra 44 Sheet V3 chưa đạt. Errors: ' +
      errors.length +
      '. Xem Execution log.'
    );
  }

  return result;
}


/**
 * Debug lỗi kiểm tra 44 Sheet V3.
 * Hàm này không throw error.
 */
function kidlearnV3_debugCreatedSheetErrors() {
  var context =
    kidlearnV3_assertDevEnvironment_();

  var spreadsheet =
    context.spreadsheet;

  var schema =
    kidlearnV3_buildSchema_();

  var errors = [];
  var warnings = [];
  var items = [];

  for (
    var i = 0;
    i < KIDLEARN_V3_SHEET_ORDER.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_SHEET_ORDER[i];

    var definition =
      schema[sheetName];

    var sheet =
      kidlearnV3_getSheetByExactName_(
        spreadsheet,
        sheetName
      );

    if (!definition) {
      errors.push(
        sheetName + ': thiếu schema.'
      );

      items.push({
        order: i + 1,
        sheetName: sheetName,
        status: 'SCHEMA_MISSING'
      });

      continue;
    }

    if (!sheet) {
      errors.push(
        sheetName +
        ': chưa có Sheet trong Google Sheet.'
      );

      items.push({
        order: i + 1,
        sheetName: sheetName,
        status: 'SHEET_MISSING'
      });

      continue;
    }

    var check =
      kidlearnV3_checkSheetHeaders_(
        sheet,
        definition
      );

    errors =
      errors.concat(check.errors);

    warnings =
      warnings.concat(check.warnings);

    items.push({
      order: i + 1,
      sheetName: sheetName,
      status:
        check.errorCount === 0
          ? 'MATCH'
          : 'HEADER_ERROR',
      errorCount:
        check.errorCount,
      warningCount:
        check.warningCount
    });
  }

  kidlearnV3_checkLegacySourceSheetsGone_(
    spreadsheet,
    errors,
    warnings
  );

  var result = {
    success:
      errors.length === 0,

    errorCount:
      errors.length,

    warningCount:
      warnings.length,

    errors:
      errors,

    warnings:
      warnings,

    errorItems:
      kidlearnV3_filterDebugErrorItems_(
        items
      ),

    items:
      items
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Preview kế hoạch tạo data validation.
 */
function kidlearnV3_previewDataValidationPlan() {
  var context =
    kidlearnV3_assertDevEnvironment_();

  var spreadsheet =
    context.spreadsheet;

  var schema =
    kidlearnV3_buildSchema_();

  var plan = [];
  var totalRuleCount = 0;

  for (
    var i = 0;
    i < KIDLEARN_V3_SHEET_ORDER.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_SHEET_ORDER[i];

    var definition =
      schema[sheetName];

    var sheet =
      kidlearnV3_getSheetByExactName_(
        spreadsheet,
        sheetName
      );

    if (
      !definition ||
      !sheet
    ) {
      plan.push({
        order: i + 1,
        sheetName: sheetName,
        status: 'SKIPPED',
        ruleCount: 0
      });

      continue;
    }

    var rules =
      kidlearnV3_buildValidationPlanForSheet_(
        spreadsheet,
        schema,
        definition
      );

    totalRuleCount +=
      rules.length;

    plan.push({
      order: i + 1,
      sheetName: sheetName,
      status: 'READY',
      ruleCount: rules.length,
      rules: rules
    });
  }

  var result = {
    success: true,
    environment: context.environment,
    spreadsheetName: context.spreadsheetName,
    sheetCount: plan.length,
    totalRuleCount: totalRuleCount,
    plan: plan
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Apply data validation cho 44 Sheet V3.
 */
function kidlearnV3_applyDataValidationAllSheets() {
  var context =
    kidlearnV3_assertDevEnvironment_();

  kidlearnV3_validateCreatedSheets();

  var lock =
    LockService.getDocumentLock();

  var locked =
    lock.tryLock(
      KIDLEARN_V3.LOCK_TIMEOUT_MS
    );

  if (!locked) {
    throw new Error(
      'Không lấy được document lock. ' +
      'Có thể tiến trình khác đang chạy.'
    );
  }

  try {
    var spreadsheet =
      context.spreadsheet;

    var schema =
      kidlearnV3_buildSchema_();

    var enums =
      kidlearnV3_buildEnums_();

    var report = [];
    var totalApplied = 0;
    var totalSkipped = 0;

    for (
      var i = 0;
      i < KIDLEARN_V3_SHEET_ORDER.length;
      i++
    ) {
      var sheetName =
        KIDLEARN_V3_SHEET_ORDER[i];

      var definition =
        schema[sheetName];

      var sheet =
        kidlearnV3_getSheetByExactName_(
          spreadsheet,
          sheetName
        );

      if (
        !definition ||
        !sheet
      ) {
        report.push({
          sheetName: sheetName,
          status: 'SKIPPED',
          appliedCount: 0,
          skippedCount: 1
        });

        totalSkipped++;
        continue;
      }

      var result =
        kidlearnV3_applyValidationToSheet_(
          spreadsheet,
          schema,
          enums,
          sheet,
          definition
        );

      totalApplied +=
        result.appliedCount;

      totalSkipped +=
        result.skippedCount;

      report.push(result);
    }

    SpreadsheetApp.flush();

    kidlearnV3_markValidationAppliedSafe_();

    var finalResult = {
      success: true,
      environment: context.environment,
      spreadsheetName: context.spreadsheetName,
      schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
      totalAppliedCount: totalApplied,
      totalSkippedCount: totalSkipped,
      sheets: report
    };

    console.log(
      JSON.stringify(finalResult, null, 2)
    );

    return finalResult;

  } finally {
    lock.releaseLock();
  }
}


/**
 * Xóa toàn bộ data validation ở vùng dữ liệu V3.
 * Không xóa dữ liệu.
 */
function kidlearnV3_clearDataValidationAllSheets() {
  var context =
    kidlearnV3_assertDevEnvironment_();

  var spreadsheet =
    context.spreadsheet;

  var schema =
    kidlearnV3_buildSchema_();

  var cleared = [];

  for (
    var i = 0;
    i < KIDLEARN_V3_SHEET_ORDER.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_SHEET_ORDER[i];

    var definition =
      schema[sheetName];

    var sheet =
      kidlearnV3_getSheetByExactName_(
        spreadsheet,
        sheetName
      );

    if (
      !definition ||
      !sheet
    ) {
      continue;
    }

    var rowCount =
      sheet.getMaxRows() - 2;

    if (rowCount < 1) {
      continue;
    }

    sheet
      .getRange(
        3,
        1,
        rowCount,
        definition.columns.length
      )
      .clearDataValidations();

    cleared.push(sheetName);
  }

  SpreadsheetApp.flush();

  var result = {
    success: true,
    clearedCount: cleared.length,
    sheets: cleared
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Kiểm tra header của một Sheet.
 */
function kidlearnV3_checkSheetHeaders_(
  sheet,
  definition
) {
  var errors = [];
  var warnings = [];
  var columnCount =
    definition.columns.length;

  var labels =
    sheet
      .getRange(
        1,
        1,
        1,
        columnCount
      )
      .getDisplayValues()[0];

  var keys =
    sheet
      .getRange(
        2,
        1,
        1,
        columnCount
      )
      .getDisplayValues()[0];

  for (
    var i = 0;
    i < columnCount;
    i++
  ) {
    var column =
      definition.columns[i];

    var actualLabel =
      String(labels[i] || '').trim();

    var actualKey =
      String(keys[i] || '').trim();

    if (
      actualLabel !== column.labelVi
    ) {
      warnings.push(
        sheet.getName() +
        ': label dòng 1 khác schema tại cột ' +
        (i + 1) +
        '. Expected=' +
        column.labelVi +
        ', actual=' +
        actualLabel
      );
    }

    if (
      actualKey !== column.key
    ) {
      errors.push(
        sheet.getName() +
        ': key dòng 2 khác schema tại cột ' +
        (i + 1) +
        '. Expected=' +
        column.key +
        ', actual=' +
        actualKey
      );
    }
  }

  return {
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Kiểm tra Sheet V2 nguồn không còn tồn tại.
 * Dùng exact name để không nhầm Data_Users với DATA_Users.
 */
function kidlearnV3_checkLegacySourceSheetsGone_(
  spreadsheet,
  errors,
  warnings
) {
  var map =
    KIDLEARN_V2_LEGACY_SHEET_MAP;

  var sourceNames =
    Object.keys(map);

  for (
    var i = 0;
    i < sourceNames.length;
    i++
  ) {
    var sourceName =
      sourceNames[i];

    var sourceSheet =
      kidlearnV3_getSheetByExactName_(
        spreadsheet,
        sourceName
      );

    if (sourceSheet) {
      errors.push(
        'Sheet V2 nguồn vẫn còn tồn tại: ' +
        sourceName +
        '. Cần đổi tên sang ' +
        map[sourceName]
      );
    }
  }
}


/**
 * Lọc Sheet có lỗi debug.
 */
function kidlearnV3_filterDebugErrorItems_(
  items
) {
  var result = [];

  for (
    var i = 0;
    i < items.length;
    i++
  ) {
    if (
      items[i].status !== 'MATCH'
    ) {
      result.push(
        items[i]
      );
    }
  }

  return result;
}


/**
 * Đánh dấu validation đã apply.
 */
function kidlearnV3_markValidationAppliedSafe_() {
  try {
    kidlearnV3_setSetupStatus_(
      'VALIDATION_APPLIED'
    );
  } catch (error) {
    console.warn(
      'Không cập nhật được setup status VALIDATION_APPLIED: ' +
      String(error.message || error)
    );
  }
}