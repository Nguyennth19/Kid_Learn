/**
 * ================================================================
 * KIDLEARN V3 - SCHEMA DEFINITION ENGINE
 * Version: 3.1.0
 * ================================================================
 *
 * File này chỉ khai báo và kiểm tra Data Dictionary.
 * Không tạo, xóa, đổi tên hoặc ghi dữ liệu vào Google Sheets.
 */


/**
 * Các kiểu dữ liệu được hỗ trợ.
 */
var KIDLEARN_V3_DATA_TYPES = {
  STRING: 'STRING',
  ID: 'ID',
  NUMBER: 'NUMBER',
  BOOLEAN: 'BOOLEAN',
  DATE: 'DATE',
  DATETIME: 'DATETIME',
  ENUM: 'ENUM',
  JSON: 'JSON',
  FILE_ID: 'FILE_ID',
  URL: 'URL'
};


/**
 * Các giá trị mặc định đặc biệt.
 *
 * Giá trị thật sẽ được chuyển đổi khi tạo Sheet hoặc ghi dữ liệu.
 */
var KIDLEARN_V3_DEFAULTS = {
  NOW: '@NOW',
  TODAY: '@TODAY',
  SYSTEM: 'SYSTEM',
  MIGRATION: 'MIGRATION',
  SEED_DATA: 'SEED_DATA',
  EMPTY_JSON_OBJECT: '{}',
  EMPTY_JSON_ARRAY: '[]'
};


/**
 * Khai báo một cột trong schema.
 *
 * @param {string} labelVi Tên tiếng Việt.
 * @param {string} key Khóa kỹ thuật camelCase.
 * @param {string} type Kiểu dữ liệu.
 * @param {boolean} required Có bắt buộc hay không.
 * @param {*} defaultValue Giá trị mặc định.
 * @param {Object|null} validation Cấu hình validation.
 * @param {Object=} options Cấu hình bổ sung.
 * @return {Object}
 */
function kidlearnV3_column_(
  labelVi,
  key,
  type,
  required,
  defaultValue,
  validation,
  options
) {
  var extra = options || {};

  return {
    labelVi: String(labelVi || '').trim(),
    key: String(key || '').trim(),
    type: type,
    required: required === true,

    defaultValue:
      typeof defaultValue === 'undefined'
        ? ''
        : defaultValue,

    validation: validation || null,

    description: extra.description || '',
    sensitive: extra.sensitive === true,
    immutable: extra.immutable === true,
    unique: extra.unique === true,
    indexed: extra.indexed === true,

    maxLength:
      typeof extra.maxLength === 'number'
        ? extra.maxLength
        : null
  };
}


/**
 * Validation dựa trên enum.
 */
function kidlearnV3_validationEnum_(enumKey) {
  return {
    kind: 'ENUM',
    enumKey: enumKey
  };
}


/**
 * Validation dựa trên danh sách trực tiếp.
 */
function kidlearnV3_validationList_(values) {
  return {
    kind: 'LIST',
    values: Array.isArray(values) ? values.slice() : []
  };
}


/**
 * Validation ID theo prefix.
 */
function kidlearnV3_validationId_(prefix) {
  return {
    kind: 'ID_PREFIX',
    prefix: prefix
  };
}


/**
 * Validation tham chiếu logic đến Sheet khác.
 */
function kidlearnV3_validationReference_(
  targetSheet,
  targetKey
) {
  return {
    kind: 'REFERENCE',
    targetSheet: targetSheet,
    targetKey: targetKey
  };
}


/**
 * Validation khoảng số.
 */
function kidlearnV3_validationRange_(min, max) {
  return {
    kind: 'NUMBER_RANGE',
    min: min,
    max: max
  };
}


/**
 * Validation số nguyên.
 */
function kidlearnV3_validationInteger_(min, max) {
  return {
    kind: 'INTEGER_RANGE',
    min: min,
    max: max
  };
}


/**
 * Validation email.
 */
function kidlearnV3_validationEmail_() {
  return {
    kind: 'EMAIL'
  };
}


/**
 * Validation URL HTTPS.
 */
function kidlearnV3_validationHttpsUrl_() {
  return {
    kind: 'HTTPS_URL'
  };
}


/**
 * Validation chuỗi JSON.
 */
function kidlearnV3_validationJson_() {
  return {
    kind: 'JSON'
  };
}


/**
 * Validation regex.
 */
function kidlearnV3_validationRegex_(pattern, message) {
  return {
    kind: 'REGEX',
    pattern: pattern,
    message: message || ''
  };
}


/**
 * Tạo định nghĩa một Sheet.
 */
function kidlearnV3_sheetDefinition_(config) {
  config = config || {};

  return {
    group: config.group || 'OTHER',
    description: config.description || '',

    headerViRow: KIDLEARN_V3.HEADER_VI_ROW,
    headerKeyRow: KIDLEARN_V3.HEADER_KEY_ROW,
    dataStartRow: KIDLEARN_V3.DATA_START_ROW,

    frozenRows: 2,
    createFilter: config.createFilter !== false,

    primaryKey: config.primaryKey || '',
    uniqueKeys: config.uniqueKeys || [],
    logicalIndexes: config.logicalIndexes || [],

    retentionPolicy: config.retentionPolicy || '',
    columns: config.columns || []
  };
}


/**
 * Gộp enum của các nhóm schema đã được khai báo.
 */
function kidlearnV3_buildEnums_() {
  var result = {};
  var groups = [];

  if (typeof kidlearnV3_enumGroup01System_ === 'function') {
    groups.push(kidlearnV3_enumGroup01System_());
  }

  if (typeof kidlearnV3_enumGroup02Learning_ === 'function') {
    groups.push(kidlearnV3_enumGroup02Learning_());
  }

  if (typeof kidlearnV3_enumGroup03Assessment_ === 'function') {
    groups.push(kidlearnV3_enumGroup03Assessment_());
  }

  if (typeof kidlearnV3_enumGroup04Progress_ === 'function') {
    groups.push(kidlearnV3_enumGroup04Progress_());
  }

  if (typeof kidlearnV3_enumGroup05Engagement_ === 'function') {
    groups.push(kidlearnV3_enumGroup05Engagement_());
  }

  if (typeof kidlearnV3_enumGroup06AI_ === 'function') {
    groups.push(kidlearnV3_enumGroup06AI_());
  }

  groups.forEach(function (groupEnums) {
    groupEnums = groupEnums || {};

    Object.keys(groupEnums).forEach(function (enumKey) {
      if (
        Object.prototype.hasOwnProperty.call(
          result,
          enumKey
        )
      ) {
        throw new Error(
          'Enum bị khai báo trùng: ' + enumKey
        );
      }

      result[enumKey] = groupEnums[enumKey];
    });
  });

  return result;
}


/**
 * Gộp schema của tất cả nhóm đã được khai báo.
 */
function kidlearnV3_buildSchema_() {
  var schema = {};
  var groups = [];

  if (typeof kidlearnV3_schemaGroup01System_ === 'function') {
    groups.push(kidlearnV3_schemaGroup01System_());
  }

  if (typeof kidlearnV3_schemaGroup02Learning_ === 'function') {
    groups.push(kidlearnV3_schemaGroup02Learning_());
  }

  if (typeof kidlearnV3_schemaGroup03Assessment_ === 'function') {
    groups.push(kidlearnV3_schemaGroup03Assessment_());
  }

  if (typeof kidlearnV3_schemaGroup04Progress_ === 'function') {
    groups.push(kidlearnV3_schemaGroup04Progress_());
  }

  if (typeof kidlearnV3_schemaGroup05Engagement_ === 'function') {
    groups.push(kidlearnV3_schemaGroup05Engagement_());
  }

  if (typeof kidlearnV3_schemaGroup06AI_ === 'function') {
    groups.push(kidlearnV3_schemaGroup06AI_());
  }

  groups.forEach(function (groupSchema) {
    groupSchema = groupSchema || {};

    Object.keys(groupSchema).forEach(function (sheetName) {
      if (
        Object.prototype.hasOwnProperty.call(
          schema,
          sheetName
        )
      ) {
        throw new Error(
          'Schema Sheet bị khai báo trùng: ' +
          sheetName
        );
      }

      schema[sheetName] = groupSchema[sheetName];
    });
  });

  return schema;
}


/**
 * Kiểm tra một định nghĩa cột.
 */
function kidlearnV3_validateColumnDefinition_(
  sheetName,
  column,
  columnNumber,
  enums,
  errors,
  warnings
) {
  var prefix =
    sheetName +
    ' - cột ' +
    columnNumber +
    ': ';

  if (!column || typeof column !== 'object') {
    errors.push(prefix + 'định nghĩa cột không hợp lệ.');
    return;
  }

  if (!column.labelVi) {
    errors.push(prefix + 'thiếu tên tiếng Việt.');
  }

  if (!column.key) {
    errors.push(prefix + 'thiếu key kỹ thuật.');
  }

  if (
    column.key &&
    !/^[a-z][A-Za-z0-9]*$/.test(column.key)
  ) {
    errors.push(
      prefix +
      'key không đúng camelCase: ' +
      column.key
    );
  }

  var validTypes = Object.keys(
    KIDLEARN_V3_DATA_TYPES
  ).map(function (typeKey) {
    return KIDLEARN_V3_DATA_TYPES[typeKey];
  });

  if (validTypes.indexOf(column.type) === -1) {
    errors.push(
      prefix +
      'kiểu dữ liệu không hợp lệ: ' +
      column.type
    );
  }

  if (!column.validation) {
    return;
  }

  if (column.validation.kind === 'ENUM') {
    var enumKey = column.validation.enumKey;

    if (
      !Object.prototype.hasOwnProperty.call(
        enums,
        enumKey
      )
    ) {
      errors.push(
        prefix +
        'không tìm thấy enum: ' +
        enumKey
      );
    }
  }

  if (column.validation.kind === 'REFERENCE') {
    var targetSheet =
      column.validation.targetSheet;

    if (
      KIDLEARN_V3_SHEET_ORDER.indexOf(
        targetSheet
      ) === -1
    ) {
      errors.push(
        prefix +
        'tham chiếu đến Sheet không hợp lệ: ' +
        targetSheet
      );
    }
  }

  if (
    column.validation.kind === 'NUMBER_RANGE' ||
    column.validation.kind === 'INTEGER_RANGE'
  ) {
    if (
      typeof column.validation.min !== 'number' ||
      typeof column.validation.max !== 'number'
    ) {
      errors.push(
        prefix +
        'validation khoảng số không hợp lệ.'
      );
    }

    if (
      typeof column.validation.min === 'number' &&
      typeof column.validation.max === 'number' &&
      column.validation.min > column.validation.max
    ) {
      errors.push(
        prefix +
        'giá trị min lớn hơn max.'
      );
    }
  }

  if (
    column.validation.kind === 'REGEX' &&
    !column.validation.pattern
  ) {
    warnings.push(
      prefix +
      'validation REGEX chưa có pattern.'
    );
  }
}


/**
 * Kiểm tra schema.
 *
 * strict = false:
 * chỉ kiểm tra các nhóm đã khai báo.
 *
 * strict = true:
 * bắt buộc đủ 44 Sheet.
 */
function kidlearnV3_validateSchema_(strict) {
  kidlearnV3_assertDevEnvironment_();

  var schema = kidlearnV3_buildSchema_();
  var enums = kidlearnV3_buildEnums_();

  var errors = [];
  var warnings = [];

  var schemaSheetNames = Object.keys(schema);

  schemaSheetNames.forEach(function (sheetName) {
    if (
      KIDLEARN_V3_SHEET_ORDER.indexOf(
        sheetName
      ) === -1
    ) {
      errors.push(
        'Sheet không nằm trong danh sách V3: ' +
        sheetName
      );
    }

    var definition = schema[sheetName];

    if (
      !definition ||
      !Array.isArray(definition.columns)
    ) {
      errors.push(
        sheetName +
        ': không có danh sách columns hợp lệ.'
      );
      return;
    }

    if (definition.columns.length === 0) {
      errors.push(
        sheetName +
        ': chưa khai báo cột.'
      );
      return;
    }

    var columnKeys = {};
    var labels = {};

    definition.columns.forEach(
      function (column, index) {
        kidlearnV3_validateColumnDefinition_(
          sheetName,
          column,
          index + 1,
          enums,
          errors,
          warnings
        );

        if (!column) {
          return;
        }

        if (column.key) {
          if (columnKeys[column.key]) {
            errors.push(
              sheetName +
              ': key bị trùng: ' +
              column.key
            );
          }

          columnKeys[column.key] = true;
        }

        if (column.labelVi) {
          if (labels[column.labelVi]) {
            warnings.push(
              sheetName +
              ': tên tiếng Việt bị trùng: ' +
              column.labelVi
            );
          }

          labels[column.labelVi] = true;
        }
      }
    );

    if (
      definition.primaryKey &&
      !columnKeys[definition.primaryKey]
    ) {
      errors.push(
        sheetName +
        ': primaryKey không tồn tại: ' +
        definition.primaryKey
      );
    }

    (definition.uniqueKeys || []).forEach(
      function (uniqueGroup) {
        if (!Array.isArray(uniqueGroup)) {
          errors.push(
            sheetName +
            ': uniqueKeys phải là mảng.'
          );
          return;
        }

        uniqueGroup.forEach(function (key) {
          if (!columnKeys[key]) {
            errors.push(
              sheetName +
              ': unique key không tồn tại: ' +
              key
            );
          }
        });
      }
    );

    (definition.logicalIndexes || []).forEach(
      function (key) {
        if (!columnKeys[key]) {
          errors.push(
            sheetName +
            ': logical index không tồn tại: ' +
            key
          );
        }
      }
    );
  });

  var missingSheets =
    KIDLEARN_V3_SHEET_ORDER.filter(
      function (sheetName) {
        return !Object.prototype.hasOwnProperty.call(
          schema,
          sheetName
        );
      }
    );

  if (strict === true && missingSheets.length > 0) {
    errors.push(
      'Schema chưa đủ 44 Sheet. Còn thiếu: ' +
      missingSheets.join(', ')
    );
  }

  if (strict !== true && missingSheets.length > 0) {
    warnings.push(
      'Schema đang ở chế độ từng phần. Còn thiếu ' +
      missingSheets.length +
      ' Sheet.'
    );
  }

  var loadedSheets =
    KIDLEARN_V3_SHEET_ORDER.filter(
      function (sheetName) {
        return Object.prototype.hasOwnProperty.call(
          schema,
          sheetName
        );
      }
    );

  var result = {
    success: errors.length === 0,
    strictMode: strict === true,

    loadedSheetCount: schemaSheetNames.length,
    targetSheetCount: KIDLEARN_V3_SHEET_ORDER.length,
    loadedEnumCount: Object.keys(enums).length,

    loadedSheets: loadedSheets,
    missingSheets: missingSheets,

    errorCount: errors.length,
    warningCount: warnings.length,

    errors: errors,
    warnings: warnings
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (errors.length > 0) {
    throw new Error(
      'Schema V3 có ' +
      errors.length +
      ' lỗi. Xem Execution log.'
    );
  }

  return result;
}


/**
 * Kiểm tra schema từng phần.
 */
function kidlearnV3_validateSchemaPartial() {
  return kidlearnV3_validateSchema_(false);
}


/**
 * Kiểm tra schema cuối cùng.
 *
 * Chỉ chạy sau khi đã khai báo đủ 44 Sheet.
 */
function kidlearnV3_validateSchemaFinal() {
  return kidlearnV3_validateSchema_(true);
}


/**
 * Xem tóm tắt schema hiện tại.
 */
function kidlearnV3_previewSchemaPartial() {
  kidlearnV3_assertDevEnvironment_();

  var schema = kidlearnV3_buildSchema_();
  var enums = kidlearnV3_buildEnums_();

  var sheetSummary = [];

  KIDLEARN_V3_SHEET_ORDER.forEach(
    function (sheetName) {
      if (
        !Object.prototype.hasOwnProperty.call(
          schema,
          sheetName
        )
      ) {
        return;
      }

      var definition = schema[sheetName];

      sheetSummary.push({
        sheetName: sheetName,
        group: definition.group,
        primaryKey: definition.primaryKey,
        columnCount: definition.columns.length,
        uniqueKeyCount:
          definition.uniqueKeys.length,
        indexCount:
          definition.logicalIndexes.length
      });
    }
  );

  var result = {
    success: true,
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,

    loadedSheetCount: sheetSummary.length,
    loadedEnumCount: Object.keys(enums).length,

    sheets: sheetSummary,
    enumKeys: Object.keys(enums).sort()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Lấy schema của một Sheet.
 *
 * Chỉ dùng trong backend.
 */
function kidlearnV3_getSheetSchema_(sheetName) {
  var schema = kidlearnV3_buildSchema_();

  if (!schema[sheetName]) {
    throw new Error(
      'Không tìm thấy schema của Sheet: ' +
      sheetName
    );
  }

  return schema[sheetName];
}