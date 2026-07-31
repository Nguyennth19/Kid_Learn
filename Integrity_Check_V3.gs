/**
 * ================================================================
 * KIDLEARN V3 - POST MIGRATION INTEGRITY CHECK
 * Step: 3H.9
 * Version: 3.1.0
 * ================================================================
 *
 * File này kiểm tra toàn vẹn dữ liệu sau migration V2 -> V3.
 *
 * KHÔNG xóa dữ liệu.
 * KHÔNG sửa dữ liệu.
 * KHÔNG migration thêm.
 */


/**
 * Preview kiểm tra toàn vẹn dữ liệu.
 * Không throw error.
 */
function kidlearnV3_previewPostMigrationIntegrity() {
  var result =
    kidlearnV3_buildPostMigrationIntegrityReport_(
      false
    );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Chạy kiểm tra toàn vẹn dữ liệu.
 * Có throw error nếu có lỗi nghiêm trọng.
 */
function kidlearnV3_runPostMigrationIntegrity() {
  var result =
    kidlearnV3_buildPostMigrationIntegrityReport_(
      true
    );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Post migration integrity chưa đạt. Errors: ' +
      result.errorCount +
      '. Xem Execution log.'
    );
  }

  return result;
}


/**
 * Build báo cáo toàn vẹn dữ liệu sau migration.
 */
function kidlearnV3_buildPostMigrationIntegrityReport_(
  strictMode
) {
  var context =
    kidlearnV3_assertDevEnvironment_();

  kidlearnV3_validateCreatedSheets();

  var spreadsheet =
    context.spreadsheet;

  var schema =
    kidlearnV3_buildSchema_();

  var enums =
    kidlearnV3_buildEnums_();

  var referenceIndexes =
    kidlearnV3_integrityBuildReferenceIndexes_(
      spreadsheet,
      schema
    );

  var errors = [];
  var warnings = [];
  var sheetReports = [];

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

    var sheetReport =
      kidlearnV3_integrityCheckOneSheet_(
        sheet,
        definition,
        enums,
        referenceIndexes
      );

    sheetReports.push(
      sheetReport
    );

    errors =
      errors.concat(
        sheetReport.errors
      );

    warnings =
      warnings.concat(
        sheetReport.warnings
      );
  }

  var migrationTargetReport =
    kidlearnV3_integrityCheckMigrationTargets_(
      spreadsheet
    );

  errors =
    errors.concat(
      migrationTargetReport.errors
    );

  warnings =
    warnings.concat(
      migrationTargetReport.warnings
    );

  var result = {
    success:
      errors.length === 0,

    strictMode:
      strictMode === true,

    environment:
      context.environment,

    spreadsheetName:
      context.spreadsheetName,

    schemaVersion:
      KIDLEARN_V3.SCHEMA_VERSION,

    checkedSheetCount:
      sheetReports.length,

    errorCount:
      errors.length,

    warningCount:
      warnings.length,

    errors:
      errors,

    warnings:
      warnings,

    migrationTargets:
      migrationTargetReport,

    sheets:
      sheetReports
  };

  return result;
}


/**
 * Kiểm tra một Sheet.
 */
function kidlearnV3_integrityCheckOneSheet_(
  sheet,
  definition,
  enums,
  referenceIndexes
) {
  var errors = [];
  var warnings = [];

  if (!definition) {
    return {
      sheetName: '',
      status: 'SCHEMA_MISSING',
      dataRowCount: 0,
      errorCount: 1,
      warningCount: 0,
      errors: ['Thiếu schema.'],
      warnings: []
    };
  }

  var sheetName =
    definition.sheetName;

  if (!sheet) {
    return {
      sheetName: sheetName,
      status: 'SHEET_MISSING',
      dataRowCount: 0,
      errorCount: 1,
      warningCount: 0,
      errors: [
        sheetName +
        ': thiếu Sheet.'
      ],
      warnings: []
    };
  }

  var data =
    kidlearnV3_integrityReadSheetData_(
      sheet,
      definition
    );

  kidlearnV3_integrityCheckPrimaryKeys_(
    definition,
    data,
    errors,
    warnings
  );

  kidlearnV3_integrityCheckRequiredFields_(
    definition,
    data,
    errors,
    warnings
  );

  kidlearnV3_integrityCheckEnumValues_(
    definition,
    data,
    enums,
    errors,
    warnings
  );

  kidlearnV3_integrityCheckReferenceValues_(
    definition,
    data,
    referenceIndexes,
    errors,
    warnings
  );

  var status =
    errors.length === 0
      ? 'PASS'
      : 'FAIL';

  return {
    sheetName:
      sheetName,

    status:
      status,

    dataRowCount:
      data.rowCount,

    primaryKey:
      definition.primaryKey,

    errorCount:
      errors.length,

    warningCount:
      warnings.length,

    errors:
      errors,

    warnings:
      warnings
  };
}


/**
 * Đọc dữ liệu một Sheet từ dòng 3 trở xuống.
 */
function kidlearnV3_integrityReadSheetData_(
  sheet,
  definition
) {
  var lastRow =
    sheet.getLastRow();

  var columnCount =
    definition.columns.length;

  if (lastRow < 3) {
    return {
      rowCount: 0,
      startRow: 3,
      values: [],
      displayValues: []
    };
  }

  var rowCount =
    lastRow - 2;

  var values =
    sheet
      .getRange(
        3,
        1,
        rowCount,
        columnCount
      )
      .getValues();

  var displayValues =
    sheet
      .getRange(
        3,
        1,
        rowCount,
        columnCount
      )
      .getDisplayValues();

  return {
    rowCount: rowCount,
    startRow: 3,
    values: values,
    displayValues: displayValues
  };
}


/**
 * Kiểm tra primary key trống hoặc trùng.
 */
function kidlearnV3_integrityCheckPrimaryKeys_(
  definition,
  data,
  errors,
  warnings
) {
  var primaryKey =
    definition.primaryKey;

  var primaryIndex =
    kidlearnV3_integrityColumnIndex_(
      definition,
      primaryKey
    );

  if (primaryIndex < 0) {
    errors.push(
      definition.sheetName +
      ': schema thiếu primary key column: ' +
      primaryKey
    );

    return;
  }

  var seen = {};

  for (
    var r = 0;
    r < data.rowCount;
    r++
  ) {
    var rowNumber =
      r + data.startRow;

    var value =
      kidlearnV3_integrityValueKey_(
        data.displayValues[r][primaryIndex]
      );

    if (value === '') {
      errors.push(
        definition.sheetName +
        ': primary key trống tại dòng ' +
        rowNumber +
        ', cột ' +
        primaryKey
      );

      continue;
    }

    if (seen[value]) {
      errors.push(
        definition.sheetName +
        ': primary key bị trùng: ' +
        value +
        ' tại dòng ' +
        rowNumber
      );

      continue;
    }

    seen[value] = true;
  }
}


/**
 * Kiểm tra cột bắt buộc.
 */
function kidlearnV3_integrityCheckRequiredFields_(
  definition,
  data,
  errors,
  warnings
) {
  for (
    var c = 0;
    c < definition.columns.length;
    c++
  ) {
    var column =
      definition.columns[c];

    if (
      !kidlearnV3_integrityIsRequiredColumn_(
        column,
        definition
      )
    ) {
      continue;
    }

    for (
      var r = 0;
      r < data.rowCount;
      r++
    ) {
      var value =
        kidlearnV3_integrityValueKey_(
          data.displayValues[r][c]
        );

      if (value !== '') {
        continue;
      }

      errors.push(
        definition.sheetName +
        ': cột bắt buộc bị trống tại dòng ' +
        (r + data.startRow) +
        ', cột ' +
        column.key
      );
    }
  }
}


/**
 * Kiểm tra ENUM.
 */
function kidlearnV3_integrityCheckEnumValues_(
  definition,
  data,
  enums,
  errors,
  warnings
) {
  for (
    var c = 0;
    c < definition.columns.length;
    c++
  ) {
    var column =
      definition.columns[c];

    var enumKey =
      kidlearnV3_integrityGetEnumKey_(
        column
      );

    if (!enumKey) {
      continue;
    }

    var enumValues =
      enums[enumKey];

    if (
      !enumValues ||
      enumValues.length === 0
    ) {
      warnings.push(
        definition.sheetName +
        ': enum không có values: ' +
        enumKey +
        ', cột ' +
        column.key
      );

      continue;
    }

    var allowed =
      kidlearnV3_integrityBuildAllowedMap_(
        enumValues
      );

    for (
      var r = 0;
      r < data.rowCount;
      r++
    ) {
      var value =
        kidlearnV3_integrityValueKey_(
          data.displayValues[r][c]
        );

      if (value === '') {
        continue;
      }

      if (allowed[value]) {
        continue;
      }

      errors.push(
        definition.sheetName +
        ': giá trị ENUM không hợp lệ tại dòng ' +
        (r + data.startRow) +
        ', cột ' +
        column.key +
        '. Value=' +
        value +
        ', enum=' +
        enumKey
      );
    }
  }
}


/**
 * Kiểm tra reference ID.
 */
function kidlearnV3_integrityCheckReferenceValues_(
  definition,
  data,
  referenceIndexes,
  errors,
  warnings
) {
  for (
    var c = 0;
    c < definition.columns.length;
    c++
  ) {
    var column =
      definition.columns[c];

    var validation =
      column.validation || {};

    if (
      !validation.targetSheet ||
      !validation.targetKey
    ) {
      continue;
    }

    var indexKey =
      validation.targetSheet +
      '.' +
      validation.targetKey;

    var targetIndex =
      referenceIndexes[indexKey];

    if (!targetIndex) {
      warnings.push(
        definition.sheetName +
        ': không build được reference index cho ' +
        indexKey +
        ', cột ' +
        column.key
      );

      continue;
    }

    for (
      var r = 0;
      r < data.rowCount;
      r++
    ) {
      var value =
        kidlearnV3_integrityValueKey_(
          data.displayValues[r][c]
        );

      if (value === '') {
        continue;
      }

      if (targetIndex[value]) {
        continue;
      }

      warnings.push(
        definition.sheetName +
        ': reference có thể bị gãy tại dòng ' +
        (r + data.startRow) +
        ', cột ' +
        column.key +
        '. Value=' +
        value +
        ', target=' +
        indexKey
      );
    }
  }
}


/**
 * Build reference index cho các Sheet.
 */
function kidlearnV3_integrityBuildReferenceIndexes_(
  spreadsheet,
  schema
) {
  var indexes = {};

  var sheetNames =
    Object.keys(schema);

  for (
    var i = 0;
    i < sheetNames.length;
    i++
  ) {
    var sheetName =
      sheetNames[i];

    var definition =
      schema[sheetName];

    if (
      !definition ||
      !definition.columns
    ) {
      continue;
    }

    var sheet =
      kidlearnV3_getSheetByExactName_(
        spreadsheet,
        sheetName
      );

    if (!sheet) {
      continue;
    }

    for (
      var c = 0;
      c < definition.columns.length;
      c++
    ) {
      var column =
        definition.columns[c];

      var indexKey =
        sheetName +
        '.' +
        column.key;

      indexes[indexKey] =
        kidlearnV3_integrityBuildColumnValueIndex_(
          sheet,
          definition,
          column.key
        );
    }
  }

  return indexes;
}


/**
 * Build index values cho một cột.
 */
function kidlearnV3_integrityBuildColumnValueIndex_(
  sheet,
  definition,
  key
) {
  var result = {};

  var columnIndex =
    kidlearnV3_integrityColumnIndex_(
      definition,
      key
    );

  if (columnIndex < 0) {
    return result;
  }

  var lastRow =
    sheet.getLastRow();

  if (lastRow < 3) {
    return result;
  }

  var values =
    sheet
      .getRange(
        3,
        columnIndex + 1,
        lastRow - 2,
        1
      )
      .getDisplayValues();

  for (
    var i = 0;
    i < values.length;
    i++
  ) {
    var value =
      kidlearnV3_integrityValueKey_(
        values[i][0]
      );

    if (value !== '') {
      result[value] = true;
    }
  }

  return result;
}


/**
 * Kiểm tra các target chính sau migration có dữ liệu.
 */
function kidlearnV3_integrityCheckMigrationTargets_(
  spreadsheet
) {
  var errors = [];
  var warnings = [];
  var targets = [
    'DATA_Users',
    'DATA_Children',
    'DATA_UserChildAccess',
    'DATA_Assignments',
    'SYS_Config',
    'SYS_Categories',
    'LOG_Audit',
    'SYS_MigrationLog'
  ];

  var report = [];

  for (
    var i = 0;
    i < targets.length;
    i++
  ) {
    var sheetName =
      targets[i];

    var sheet =
      kidlearnV3_getSheetByExactName_(
        spreadsheet,
        sheetName
      );

    if (!sheet) {
      errors.push(
        sheetName +
        ': thiếu target Sheet sau migration.'
      );

      report.push({
        sheetName: sheetName,
        dataRowCount: 0,
        status: 'MISSING'
      });

      continue;
    }

    var count =
      Math.max(
        0,
        sheet.getLastRow() - 2
      );

    var status =
      count > 0
        ? 'HAS_DATA'
        : 'EMPTY';

    if (count === 0) {
      warnings.push(
        sheetName +
        ': chưa có dữ liệu sau migration.'
      );
    }

    report.push({
      sheetName: sheetName,
      dataRowCount: count,
      status: status
    });
  }

  return {
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    targets: report
  };
}


/**
 * Lấy index cột theo key.
 * Trả về zero-based index.
 */
function kidlearnV3_integrityColumnIndex_(
  definition,
  key
) {
  var columns =
    definition.columns || [];

  for (
    var i = 0;
    i < columns.length;
    i++
  ) {
    if (
      columns[i].key === key
    ) {
      return i;
    }
  }

  return -1;
}


/**
 * Kiểm tra cột bắt buộc.
 */
function kidlearnV3_integrityIsRequiredColumn_(
  column,
  definition
) {
  if (
    column.key === definition.primaryKey
  ) {
    return true;
  }

  if (
    column.required === true ||
    column.isRequired === true
  ) {
    return true;
  }

  if (
    column.validation &&
    column.validation.required === true
  ) {
    return true;
  }

  return false;
}


/**
 * Lấy enumKey từ column.
 */
function kidlearnV3_integrityGetEnumKey_(
  column
) {
  if (
    !column ||
    !column.validation
  ) {
    return '';
  }

  if (
    column.validation.enumKey
  ) {
    return column.validation.enumKey;
  }

  return '';
}


/**
 * Build map giá trị hợp lệ.
 */
function kidlearnV3_integrityBuildAllowedMap_(
  values
) {
  var result = {};

  for (
    var i = 0;
    i < values.length;
    i++
  ) {
    var key =
      kidlearnV3_integrityValueKey_(
        values[i]
      );

    if (key !== '') {
      result[key] = true;
    }
  }

  return result;
}


/**
 * Chuẩn hóa value để so sánh.
 */
function kidlearnV3_integrityValueKey_(
  value
) {
  return String(value || '').trim();
}