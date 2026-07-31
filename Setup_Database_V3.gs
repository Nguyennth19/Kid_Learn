/**
 * ================================================================
 * KIDLEARN V3 - CREATE DATABASE FROM SCHEMA
 * Step: 3H.3
 * Version: 3.1.0
 * ================================================================
 *
 * Chức năng:
 * - Xem trước kế hoạch tạo Sheet.
 * - Tạo 44 Sheet V3 từ schema.
 * - Không xóa hoặc đổi tên Sheet V2.
 * - Không ghi đè Sheet có cấu trúc khác.
 * - Có thể chạy lại an toàn.
 */


/**
 * Xem trước trạng thái trước khi tạo Sheet.
 *
 * Hàm này chỉ đọc dữ liệu.
 * Không thay đổi Google Sheet.
 */
function kidlearnV3_previewCreateV3Sheets() {
  var context = kidlearnV3_assertDevEnvironment_();
  var spreadsheet = context.spreadsheet;
  var schema = kidlearnV3_buildSchema_();

  var items = [];

  for (
    var i = 0;
    i < KIDLEARN_V3_SHEET_ORDER.length;
    i++
  ) {
    var sheetName = KIDLEARN_V3_SHEET_ORDER[i];
    var definition = schema[sheetName];

    if (!definition) {
      items.push({
        order: i + 1,
        sheetName: sheetName,
        status: 'SCHEMA_MISSING',
        message: 'Không tìm thấy schema.'
      });

      continue;
    }

    var exactSheet =
      spreadsheet.getSheetByName(sheetName);

    if (exactSheet) {
      var inspection =
        kidlearnV3_inspectExistingSheet_(
          exactSheet,
          definition
        );

      items.push({
        order: i + 1,
        sheetName: sheetName,
        existingSheetName: exactSheet.getName(),
        status: inspection.status,
        message: inspection.message,
        columnCount: definition.columns.length
      });

      continue;
    }

    var caseConflict =
      kidlearnV3_findSheetIgnoreCase_(
        spreadsheet,
        sheetName
      );

    if (caseConflict) {
      items.push({
        order: i + 1,
        sheetName: sheetName,
        existingSheetName: caseConflict.getName(),
        status: 'CASE_CONFLICT',
        message:
          'Có Sheet trùng tên khi không phân biệt chữ hoa thường.',
        columnCount: definition.columns.length
      });

      continue;
    }

    items.push({
      order: i + 1,
      sheetName: sheetName,
      existingSheetName: '',
      status: 'MISSING',
      message: 'Sẵn sàng tạo mới.',
      columnCount: definition.columns.length
    });
  }

  var result = {
    success: true,
    environment: context.environment,
    spreadsheetName: context.spreadsheetName,
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,

    targetSheetCount:
      KIDLEARN_V3_SHEET_ORDER.length,

    missingCount:
      kidlearnV3_countPreviewStatus_(
        items,
        'MISSING'
      ),

    emptyCount:
      kidlearnV3_countPreviewStatus_(
        items,
        'EMPTY'
      ),

    matchedCount:
      kidlearnV3_countPreviewStatus_(
        items,
        'MATCH'
      ),

    conflictCount:
      kidlearnV3_countPreviewStatus_(
        items,
        'CONFLICT'
      ),

    caseConflictCount:
      kidlearnV3_countPreviewStatus_(
        items,
        'CASE_CONFLICT'
      ),

    schemaMissingCount:
      kidlearnV3_countPreviewStatus_(
        items,
        'SCHEMA_MISSING'
      ),

    items: items
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Tạo toàn bộ Sheet V3 từ schema.
 *
 * Chỉ chạy sau khi:
 * 1. Backup database V2.
 * 2. Đổi tên các Sheet V2 sang LEGACY_V2_*.
 *
 * Hàm không tự đổi tên Sheet V2.
 */
function kidlearnV3_createV3Sheets() {
  var context = kidlearnV3_assertDevEnvironment_();

  kidlearnV3_reviewSchemaBeforeCreateSheets();

  var preview =
    kidlearnV3_previewCreateV3Sheets();

  if (preview.schemaMissingCount > 0) {
    throw new Error(
      'DỪNG THỰC THI: Schema đang thiếu Sheet.'
    );
  }

  if (preview.caseConflictCount > 0) {
    throw new Error(
      'DỪNG THỰC THI: Có Sheet trùng tên khi không ' +
      'phân biệt chữ hoa thường. ' +
      'Cần đổi tên Sheet V2 sang LEGACY_V2_* trước.'
    );
  }

  if (preview.conflictCount > 0) {
    throw new Error(
      'DỪNG THỰC THI: Có Sheet V3 đang tồn tại nhưng ' +
      'technical header không khớp schema.'
    );
  }

  var lock = LockService.getDocumentLock();

  var locked = lock.tryLock(
    KIDLEARN_V3.LOCK_TIMEOUT_MS
  );

  if (!locked) {
    throw new Error(
      'Không lấy được document lock. ' +
      'Có thể một tiến trình khác đang chạy.'
    );
  }

  try {
    var spreadsheet = context.spreadsheet;
    var schema = kidlearnV3_buildSchema_();
    var report = [];

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
        spreadsheet.getSheetByName(sheetName);

      var action = '';

      if (!sheet) {
        sheet =
          spreadsheet.insertSheet(sheetName);

        action = 'CREATED';
      } else {
        var inspection =
          kidlearnV3_inspectExistingSheet_(
            sheet,
            definition
          );

        if (inspection.status === 'CONFLICT') {
          throw new Error(
            sheetName +
            ': technical header không khớp schema.'
          );
        }

        if (inspection.status === 'EMPTY') {
          action = 'INITIALIZED';
        } else {
          action = 'VERIFIED';
        }
      }

      kidlearnV3_ensureSheetCapacity_(
        sheet,
        definition.columns.length
      );

      kidlearnV3_writeSchemaHeaders_(
        sheet,
        definition
      );

      kidlearnV3_formatSheetFromSchema_(
        sheet,
        definition
      );

      report.push({
        order: i + 1,
        sheetName: sheetName,
        action: action,
        columnCount: definition.columns.length
      });
    }

    SpreadsheetApp.flush();

    kidlearnV3_setSetupStatus_(
      KIDLEARN_V3.SETUP_STATUS.SHEETS_CREATED
    );

    var result = {
      success: true,
      environment: context.environment,
      spreadsheetName: context.spreadsheetName,
      schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
      setupStatus:
        KIDLEARN_V3.SETUP_STATUS.SHEETS_CREATED,

      createdCount:
        kidlearnV3_countReportAction_(
          report,
          'CREATED'
        ),

      initializedCount:
        kidlearnV3_countReportAction_(
          report,
          'INITIALIZED'
        ),

      verifiedCount:
        kidlearnV3_countReportAction_(
          report,
          'VERIFIED'
        ),

      totalProcessed: report.length,
      sheets: report
    };

    console.log(
      JSON.stringify(result, null, 2)
    );

    return result;

  } catch (error) {
    try {
      kidlearnV3_setSetupStatus_(
        KIDLEARN_V3.SETUP_STATUS.FAILED
      );
    } catch (statusError) {
      console.error(
        String(statusError)
      );
    }

    throw error;

  } finally {
    lock.releaseLock();
  }
}


/**
 * Cập nhật lại tiêu đề và định dạng cho các Sheet V3.
 *
 * Không tạo Sheet còn thiếu.
 * Không thay đổi dữ liệu từ dòng 3 trở đi.
 */
function kidlearnV3_refreshV3SheetFormatting() {
  var context = kidlearnV3_assertDevEnvironment_();
  var spreadsheet = context.spreadsheet;
  var schema = kidlearnV3_buildSchema_();

  var refreshed = [];

  for (
    var i = 0;
    i < KIDLEARN_V3_SHEET_ORDER.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_SHEET_ORDER[i];

    var sheet =
      spreadsheet.getSheetByName(sheetName);

    if (!sheet) {
      continue;
    }

    var definition =
      schema[sheetName];

    var inspection =
      kidlearnV3_inspectExistingSheet_(
        sheet,
        definition
      );

    if (inspection.status === 'CONFLICT') {
      throw new Error(
        sheetName +
        ': không thể refresh vì header không khớp schema.'
      );
    }

    kidlearnV3_ensureSheetCapacity_(
      sheet,
      definition.columns.length
    );

    kidlearnV3_writeSchemaHeaders_(
      sheet,
      definition
    );

    kidlearnV3_formatSheetFromSchema_(
      sheet,
      definition
    );

    refreshed.push(sheetName);
  }

  SpreadsheetApp.flush();

  var result = {
    success: true,
    refreshedCount: refreshed.length,
    sheets: refreshed
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Kiểm tra một Sheet đang tồn tại.
 */
function kidlearnV3_inspectExistingSheet_(
  sheet,
  definition
) {
  var expectedKeys = [];

  for (
    var i = 0;
    i < definition.columns.length;
    i++
  ) {
    expectedKeys.push(
      definition.columns[i].key
    );
  }

  var checkColumnCount =
    Math.max(
      expectedKeys.length,
      sheet.getLastColumn()
    );

  if (checkColumnCount < 1) {
    checkColumnCount = expectedKeys.length;
  }

  var labelValues =
    sheet
      .getRange(
        1,
        1,
        1,
        checkColumnCount
      )
      .getDisplayValues()[0];

  var keyValues =
    sheet
      .getRange(
        2,
        1,
        1,
        checkColumnCount
      )
      .getDisplayValues()[0];

  var hasLabel =
    kidlearnV3_hasNonEmptyValue_(
      labelValues
    );

  var hasKey =
    kidlearnV3_hasNonEmptyValue_(
      keyValues
    );

  if (!hasKey) {
    if (hasLabel || sheet.getLastRow() > 2) {
      return {
        status: 'CONFLICT',
        message:
          'Sheet có dữ liệu nhưng không có technical header dòng 2.'
      };
    }

    return {
      status: 'EMPTY',
      message: 'Sheet đang trống.'
    };
  }

  for (
    var keyIndex = 0;
    keyIndex < expectedKeys.length;
    keyIndex++
  ) {
    var actualKey =
      String(keyValues[keyIndex] || '').trim();

    var expectedKey =
      expectedKeys[keyIndex];

    if (actualKey !== expectedKey) {
      return {
        status: 'CONFLICT',
        message:
          'Sai technical key tại cột ' +
          (keyIndex + 1) +
          '. Expected=' +
          expectedKey +
          ', actual=' +
          actualKey
      };
    }
  }

  for (
    var extraIndex = expectedKeys.length;
    extraIndex < keyValues.length;
    extraIndex++
  ) {
    var extraKey =
      String(keyValues[extraIndex] || '').trim();

    if (extraKey !== '') {
      return {
        status: 'CONFLICT',
        message:
          'Có technical key ngoài schema tại cột ' +
          (extraIndex + 1) +
          ': ' +
          extraKey
      };
    }
  }

  return {
    status: 'MATCH',
    message: 'Technical header khớp schema.'
  };
}


/**
 * Đảm bảo Sheet có đủ số cột và tối thiểu 3 dòng.
 */
function kidlearnV3_ensureSheetCapacity_(
  sheet,
  requiredColumns
) {
  var currentColumns =
    sheet.getMaxColumns();

  if (currentColumns < requiredColumns) {
    sheet.insertColumnsAfter(
      currentColumns,
      requiredColumns - currentColumns
    );
  }

  var currentRows =
    sheet.getMaxRows();

  if (currentRows < 3) {
    sheet.insertRowsAfter(
      currentRows,
      3 - currentRows
    );
  }
}


/**
 * Ghi tiêu đề tiếng Việt và technical key.
 */
function kidlearnV3_writeSchemaHeaders_(
  sheet,
  definition
) {
  var labels = [];
  var keys = [];

  for (
    var i = 0;
    i < definition.columns.length;
    i++
  ) {
    labels.push(
      definition.columns[i].labelVi
    );

    keys.push(
      definition.columns[i].key
    );
  }

  sheet
    .getRange(
      1,
      1,
      2,
      definition.columns.length
    )
    .setValues([
      labels,
      keys
    ]);
}


/**
 * Tìm Sheet có tên giống nhau nếu bỏ qua chữ hoa thường.
 */
function kidlearnV3_findSheetIgnoreCase_(
  spreadsheet,
  expectedName
) {
  var expected =
    String(expectedName).toLowerCase();

  var sheets =
    spreadsheet.getSheets();

  for (
    var i = 0;
    i < sheets.length;
    i++
  ) {
    var actualName =
      sheets[i].getName();

    if (
      actualName !== expectedName &&
      actualName.toLowerCase() === expected
    ) {
      return sheets[i];
    }
  }

  return null;
}


/**
 * Kiểm tra một mảng có giá trị khác rỗng hay không.
 */
function kidlearnV3_hasNonEmptyValue_(
  values
) {
  for (
    var i = 0;
    i < values.length;
    i++
  ) {
    if (
      String(values[i] || '').trim() !== ''
    ) {
      return true;
    }
  }

  return false;
}


/**
 * Đếm trạng thái trong preview.
 */
function kidlearnV3_countPreviewStatus_(
  items,
  status
) {
  var count = 0;

  for (
    var i = 0;
    i < items.length;
    i++
  ) {
    if (items[i].status === status) {
      count++;
    }
  }

  return count;
}


/**
 * Đếm hành động trong báo cáo tạo Sheet.
 */
function kidlearnV3_countReportAction_(
  report,
  action
) {
  var count = 0;

  for (
    var i = 0;
    i < report.length;
    i++
  ) {
    if (report[i].action === action) {
      count++;
    }
  }

  return count;
}