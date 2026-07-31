/**
 * ================================================================
 * KIDLEARN V3 - APP DEV CONNECTION TO DATABASE V3
 * Step: 3I.1
 * Version: 3.1.0
 * ================================================================
 *
 * File này chuẩn bị App DEV kết nối Database V3.
 *
 * KHÔNG sửa PROD.
 * KHÔNG đổi tên Sheet.
 * KHÔNG xóa dữ liệu.
 * KHÔNG migration dữ liệu.
 */


var KIDLEARN_V3_APP_PROPERTY_KEYS = {
  ENVIRONMENT: 'KIDLEARN_APP_ENVIRONMENT',
  DATABASE_MODE: 'KIDLEARN_APP_DATABASE_MODE',
  DATABASE_SPREADSHEET_ID: 'KIDLEARN_APP_DATABASE_SPREADSHEET_ID',
  DATABASE_SPREADSHEET_NAME: 'KIDLEARN_APP_DATABASE_SPREADSHEET_NAME',
  SCHEMA_VERSION: 'KIDLEARN_APP_SCHEMA_VERSION',
  CONNECTION_STATUS: 'KIDLEARN_APP_CONNECTION_STATUS',
  CONNECTED_AT: 'KIDLEARN_APP_CONNECTED_AT',
  LAST_SMOKE_TEST_AT: 'KIDLEARN_APP_LAST_SMOKE_TEST_AT'
};


/**
 * Preview kết nối App DEV với Database V3.
 * Hàm này không ghi ScriptProperties.
 */
function kidlearnV3_previewAppDevConnectionV3() {
  var databaseId =
    kidlearnV3_appResolveDatabaseId_();

  var spreadsheet =
    kidlearnV3_appOpenSpreadsheetById_(
      databaseId
    );

  var schema =
    kidlearnV3_buildSchema_();

  var structure =
    kidlearnV3_appCheckDatabaseStructure_(
      spreadsheet,
      schema
    );

  var minimumData =
    kidlearnV3_appCheckMinimumData_(
      spreadsheet
    );

  var success =
    structure.errorCount === 0 &&
    minimumData.errorCount === 0;

  var result = {
    success: success,
    action: 'PREVIEW_APP_DEV_CONNECTION_V3',
    environment: KIDLEARN_V3.ENVIRONMENT_DEV,
    databaseMode: 'V3',
    databaseSpreadsheetId: databaseId,
    databaseSpreadsheetName: spreadsheet.getName(),
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    appVersion: KIDLEARN_V3.APP_VERSION,
    structure: structure,
    minimumData: minimumData
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Kết nối App DEV với Database V3.
 * Hàm này ghi ScriptProperties để App runtime dùng DB V3.
 */
function kidlearnV3_prepareAppDevConnectionV3() {
  var preview =
    kidlearnV3_previewAppDevConnectionV3();

  if (!preview.success) {
    throw new Error(
      'App DEV chưa thể kết nối Database V3. ' +
      'Structure errors=' +
      preview.structure.errorCount +
      ', data errors=' +
      preview.minimumData.errorCount +
      '. Xem Execution log.'
    );
  }

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperties({
    KIDLEARN_APP_ENVIRONMENT:
      KIDLEARN_V3.ENVIRONMENT_DEV,

    KIDLEARN_APP_DATABASE_MODE:
      'V3',

    KIDLEARN_APP_DATABASE_SPREADSHEET_ID:
      preview.databaseSpreadsheetId,

    KIDLEARN_APP_DATABASE_SPREADSHEET_NAME:
      preview.databaseSpreadsheetName,

    KIDLEARN_APP_SCHEMA_VERSION:
      KIDLEARN_V3.SCHEMA_VERSION,

    KIDLEARN_APP_CONNECTION_STATUS:
      'CONNECTED',

    KIDLEARN_APP_CONNECTED_AT:
      new Date().toISOString()
  }, false);

  var result = {
    success: true,
    action: 'APP_DEV_CONNECTED_TO_DATABASE_V3',
    environment: KIDLEARN_V3.ENVIRONMENT_DEV,
    databaseMode: 'V3',
    databaseSpreadsheetId: preview.databaseSpreadsheetId,
    databaseSpreadsheetName: preview.databaseSpreadsheetName,
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    connectionStatus: 'CONNECTED'
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Xem trạng thái kết nối App DEV hiện tại.
 */
function kidlearnV3_getAppDevConnectionV3Status() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    environment:
      properties.getProperty(
        KIDLEARN_V3_APP_PROPERTY_KEYS.ENVIRONMENT
      ),
    databaseMode:
      properties.getProperty(
        KIDLEARN_V3_APP_PROPERTY_KEYS.DATABASE_MODE
      ),
    databaseSpreadsheetId:
      properties.getProperty(
        KIDLEARN_V3_APP_PROPERTY_KEYS.DATABASE_SPREADSHEET_ID
      ),
    databaseSpreadsheetName:
      properties.getProperty(
        KIDLEARN_V3_APP_PROPERTY_KEYS.DATABASE_SPREADSHEET_NAME
      ),
    schemaVersion:
      properties.getProperty(
        KIDLEARN_V3_APP_PROPERTY_KEYS.SCHEMA_VERSION
      ),
    connectionStatus:
      properties.getProperty(
        KIDLEARN_V3_APP_PROPERTY_KEYS.CONNECTION_STATUS
      ),
    connectedAt:
      properties.getProperty(
        KIDLEARN_V3_APP_PROPERTY_KEYS.CONNECTED_AT
      ),
    lastSmokeTestAt:
      properties.getProperty(
        KIDLEARN_V3_APP_PROPERTY_KEYS.LAST_SMOKE_TEST_AT
      )
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Smoke test đọc dữ liệu V3 giống App runtime.
 */
function kidlearnV3_smokeTestAppDevReadV3() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var subjects =
    kidlearnV3_appReadSheetObjectsFromDb_(
      database.spreadsheet,
      database.schema,
      'MST_Subjects',
      20
    );

  var users =
    kidlearnV3_appReadSheetObjectsFromDb_(
      database.spreadsheet,
      database.schema,
      'DATA_Users',
      10
    );

  var children =
    kidlearnV3_appReadSheetObjectsFromDb_(
      database.spreadsheet,
      database.schema,
      'DATA_Children',
      10
    );

  var assignments =
    kidlearnV3_appReadSheetObjectsFromDb_(
      database.spreadsheet,
      database.schema,
      'DATA_Assignments',
      10
    );

  var config =
    kidlearnV3_appReadSheetObjectsFromDb_(
      database.spreadsheet,
      database.schema,
      'SYS_Config',
      20
    );

  var errors = [];

  if (subjects.length < 4) {
    errors.push(
      'MST_Subjects phải có ít nhất 4 môn học.'
    );
  }

  if (users.length < 1) {
    errors.push(
      'DATA_Users chưa có dữ liệu.'
    );
  }

  if (children.length < 1) {
    errors.push(
      'DATA_Children chưa có dữ liệu.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_APP_DEV_READ_V3',
    databaseSpreadsheetName: database.spreadsheet.getName(),
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    errorCount: errors.length,
    errors: errors,
    counts: {
      MST_Subjects: subjects.length,
      DATA_Users: users.length,
      DATA_Children: children.length,
      DATA_Assignments: assignments.length,
      SYS_Config: config.length
    },
    samples: {
      subjects:
        kidlearnV3_appPickFields_(
          subjects,
          [
            'subjectId',
            'subjectCode',
            'subjectName',
            'status'
          ]
        ),
      users:
        kidlearnV3_appPickFields_(
          users,
          [
            'userId',
            'username',
            'email',
            'displayName',
            'role',
            'userRole',
            'status'
          ]
        ),
      children:
        kidlearnV3_appPickFields_(
          children,
          [
            'childId',
            'childName',
            'displayName',
            'gradeLevel',
            'status'
          ]
        )
    }
  };

  if (result.success) {
    PropertiesService
      .getScriptProperties()
      .setProperty(
        KIDLEARN_V3_APP_PROPERTY_KEYS.LAST_SMOKE_TEST_AT,
        new Date().toISOString()
      );
  }

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test App DEV đọc V3 chưa đạt. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Public helper cho App DEV đọc object từ một Sheet V3.
 * Dùng cho các bước 3I tiếp theo.
 */
function kidlearnV3_appReadSheetObjectsV3(
  sheetName,
  limit
) {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var rows =
    kidlearnV3_appReadSheetObjectsFromDb_(
      database.spreadsheet,
      database.schema,
      sheetName,
      limit || 100
    );

  return rows;
}


/**
 * Resolve database id cho App DEV.
 */
function kidlearnV3_appResolveDatabaseId_() {
  var properties =
    PropertiesService.getScriptProperties();

  var devPropertyKey =
    KIDLEARN_V3.SCRIPT_PROPERTIES.DEV_SPREADSHEET_ID;

  var devDatabaseId =
    properties.getProperty(
      devPropertyKey
    );

  if (devDatabaseId) {
    return devDatabaseId;
  }

  var appDatabaseId =
    properties.getProperty(
      KIDLEARN_V3_APP_PROPERTY_KEYS.DATABASE_SPREADSHEET_ID
    );

  if (appDatabaseId) {
    return appDatabaseId;
  }

  var activeSpreadsheet =
    SpreadsheetApp.getActiveSpreadsheet();

  if (activeSpreadsheet) {
    return activeSpreadsheet.getId();
  }

  throw new Error(
    'Không tìm thấy Database Spreadsheet ID cho App DEV.'
  );
}


/**
 * Open spreadsheet bằng ID.
 */
function kidlearnV3_appOpenSpreadsheetById_(
  spreadsheetId
) {
  if (!spreadsheetId) {
    throw new Error(
      'Spreadsheet ID trống.'
    );
  }

  return SpreadsheetApp.openById(
    spreadsheetId
  );
}


/**
 * Lấy active database V3 cho App runtime.
 */
function kidlearnV3_appGetActiveDatabaseV3_() {
  var databaseId =
    kidlearnV3_appResolveDatabaseId_();

  var spreadsheet =
    kidlearnV3_appOpenSpreadsheetById_(
      databaseId
    );

  var schema =
    kidlearnV3_buildSchema_();

  return {
    spreadsheetId: databaseId,
    spreadsheet: spreadsheet,
    schema: schema
  };
}


/**
 * Kiểm tra cấu trúc 44 Sheet V3 cho App runtime.
 */
function kidlearnV3_appCheckDatabaseStructure_(
  spreadsheet,
  schema
) {
  var errors = [];
  var warnings = [];
  var items = [];

  var spreadsheetName =
    spreadsheet.getName();

  if (
    String(spreadsheetName)
      .toUpperCase()
      .indexOf('DEV') === -1
  ) {
    errors.push(
      'Tên Spreadsheet không chứa DEV: ' +
      spreadsheetName
    );
  }

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
      kidlearnV3_appGetSheetByExactName_(
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
        sheetName + ': thiếu Sheet.'
      );

      items.push({
        order: i + 1,
        sheetName: sheetName,
        status: 'SHEET_MISSING'
      });

      continue;
    }

    var headerCheck =
      kidlearnV3_appCheckSheetHeaderKeys_(
        sheet,
        definition
      );

    errors =
      errors.concat(
        headerCheck.errors
      );

    warnings =
      warnings.concat(
        headerCheck.warnings
      );

    items.push({
      order: i + 1,
      sheetName: sheetName,
      status:
        headerCheck.errorCount === 0
          ? 'MATCH'
          : 'HEADER_ERROR',
      columnCount:
        definition.columns.length,
      dataRowCount:
        kidlearnV3_appCountDataRows_(
          sheet
        )
    });
  }

  return {
    success: errors.length === 0,
    targetSheetCount: KIDLEARN_V3_SHEET_ORDER.length,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    items: items
  };
}


/**
 * Kiểm tra row 2 technical keys khớp schema.
 */
function kidlearnV3_appCheckSheetHeaderKeys_(
  sheet,
  definition
) {
  var errors = [];
  var warnings = [];
  var columnCount =
    definition.columns.length;

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
    var expected =
      definition.columns[i].key;

    var actual =
      String(keys[i] || '').trim();

    if (actual !== expected) {
      errors.push(
        sheet.getName() +
        ': key dòng 2 khác schema tại cột ' +
        (i + 1) +
        '. Expected=' +
        expected +
        ', actual=' +
        actual
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
 * Kiểm tra dữ liệu tối thiểu để App DEV chạy được.
 */
function kidlearnV3_appCheckMinimumData_(
  spreadsheet
) {
  var checks = [
    {
      sheetName: 'SYS_Config',
      minRows: 1,
      level: 'ERROR'
    },
    {
      sheetName: 'SYS_SchemaVersion',
      minRows: 1,
      level: 'ERROR'
    },
    {
      sheetName: 'MST_Subjects',
      minRows: 4,
      level: 'ERROR'
    },
    {
      sheetName: 'DATA_Users',
      minRows: 1,
      level: 'ERROR'
    },
    {
      sheetName: 'DATA_Children',
      minRows: 1,
      level: 'ERROR'
    },
    {
      sheetName: 'DATA_UserChildAccess',
      minRows: 1,
      level: 'WARNING'
    },
    {
      sheetName: 'DATA_Assignments',
      minRows: 1,
      level: 'WARNING'
    },
    {
      sheetName: 'SYS_MigrationLog',
      minRows: 1,
      level: 'WARNING'
    }
  ];

  var errors = [];
  var warnings = [];
  var items = [];

  for (
    var i = 0;
    i < checks.length;
    i++
  ) {
    var check = checks[i];

    var sheet =
      kidlearnV3_appGetSheetByExactName_(
        spreadsheet,
        check.sheetName
      );

    var rowCount =
      sheet
        ? kidlearnV3_appCountDataRows_(sheet)
        : 0;

    var passed =
      rowCount >= check.minRows;

    if (!passed) {
      var message =
        check.sheetName +
        ': cần tối thiểu ' +
        check.minRows +
        ' dòng dữ liệu, hiện có ' +
        rowCount +
        '.';

      if (check.level === 'ERROR') {
        errors.push(message);
      } else {
        warnings.push(message);
      }
    }

    items.push({
      sheetName: check.sheetName,
      minRows: check.minRows,
      actualRows: rowCount,
      level: check.level,
      status: passed ? 'PASS' : 'NOT_ENOUGH_DATA'
    });
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    items: items
  };
}


/**
 * App runtime đọc object từ Sheet V3.
 */
function kidlearnV3_appReadSheetObjectsFromDb_(
  spreadsheet,
  schema,
  sheetName,
  limit
) {
  var definition =
    schema[sheetName];

  if (!definition) {
    throw new Error(
      'Không tìm thấy schema cho Sheet: ' +
      sheetName
    );
  }

  var sheet =
    kidlearnV3_appGetSheetByExactName_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    throw new Error(
      'Không tìm thấy Sheet: ' +
      sheetName
    );
  }

  var lastRow =
    sheet.getLastRow();

  if (lastRow < 3) {
    return [];
  }

  var maxRows =
    Math.max(
      1,
      Number(limit || 100)
    );

  var rowCount =
    Math.min(
      lastRow - 2,
      maxRows
    );

  var columnCount =
    definition.columns.length;

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

  var rows = [];

  for (
    var r = 0;
    r < values.length;
    r++
  ) {
    if (
      kidlearnV3_appIsBlankDisplayRow_(
        displayValues[r]
      )
    ) {
      continue;
    }

    var objectRow = {};

    for (
      var c = 0;
      c < definition.columns.length;
      c++
    ) {
      var key =
        definition.columns[c].key;

      objectRow[key] =
        values[r][c];
    }

    objectRow._sheetName =
      sheetName;

    objectRow._rowNumber =
      r + 3;

    rows.push(objectRow);
  }

  return rows;
}


/**
 * Tìm Sheet theo tên chính xác tuyệt đối.
 */
function kidlearnV3_appGetSheetByExactName_(
  spreadsheet,
  exactName
) {
  var sheets =
    spreadsheet.getSheets();

  for (
    var i = 0;
    i < sheets.length;
    i++
  ) {
    if (
      sheets[i].getName() === exactName
    ) {
      return sheets[i];
    }
  }

  return null;
}


/**
 * Đếm dòng dữ liệu từ dòng 3.
 */
function kidlearnV3_appCountDataRows_(
  sheet
) {
  if (!sheet) {
    return 0;
  }

  return Math.max(
    0,
    sheet.getLastRow() - 2
  );
}


/**
 * Kiểm tra row display trống.
 */
function kidlearnV3_appIsBlankDisplayRow_(
  row
) {
  for (
    var i = 0;
    i < row.length;
    i++
  ) {
    if (
      String(row[i] || '').trim() !== ''
    ) {
      return false;
    }
  }

  return true;
}


/**
 * Chỉ lấy các field an toàn để log mẫu.
 */
function kidlearnV3_appPickFields_(
  rows,
  fields
) {
  var result = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    var item = {};

    for (
      var f = 0;
      f < fields.length;
      f++
    ) {
      var field =
        fields[f];

      if (
        rows[i][field] !== undefined &&
        rows[i][field] !== ''
      ) {
        item[field] =
          rows[i][field];
      }
    }

    result.push(item);
  }

  return result;
}