/**
 * ================================================================
 * KIDLEARN V3 - DATA VALIDATION RULE HELPERS
 * Step: 3H.6
 * Version: 3.1.0
 * ================================================================
 *
 * File này chứa helper tạo rule validation.
 */


/**
 * Tạo plan rule validation cho một Sheet.
 */
function kidlearnV3_buildValidationPlanForSheet_(
  spreadsheet,
  schema,
  definition
) {
  var rules = [];

  for (
    var i = 0;
    i < definition.columns.length;
    i++
  ) {
    var column = definition.columns[i];

    var ruleType =
      kidlearnV3_getValidationRuleType_(
        column
      );

    if (!ruleType) {
      continue;
    }

    rules.push({
      columnIndex: i + 1,
      key: column.key,
      labelVi: column.labelVi,
      type: column.type,
      ruleType: ruleType
    });
  }

  return rules;
}


/**
 * Apply validation cho một Sheet.
 */
function kidlearnV3_applyValidationToSheet_(
  spreadsheet,
  schema,
  enums,
  sheet,
  definition
) {
  var applied = [];
  var skipped = [];

  var rowCount =
    sheet.getMaxRows() - 2;

  if (rowCount < 1) {
    return {
      sheetName: sheet.getName(),
      status: 'NO_DATA_ROWS',
      appliedCount: 0,
      skippedCount: 0,
      applied: [],
      skipped: []
    };
  }

  for (
    var i = 0;
    i < definition.columns.length;
    i++
  ) {
    var column = definition.columns[i];

    var range =
      sheet.getRange(
        3,
        i + 1,
        rowCount,
        1
      );

    var buildResult =
      kidlearnV3_buildDataValidationRule_(
        spreadsheet,
        schema,
        enums,
        column
      );

    if (!buildResult.rule) {
      skipped.push({
        key: column.key,
        reason: buildResult.reason
      });

      continue;
    }

    range.setDataValidation(
      buildResult.rule
    );

    applied.push({
      key: column.key,
      ruleType: buildResult.ruleType
    });
  }

  return {
    sheetName: sheet.getName(),
    status: 'DONE',
    appliedCount: applied.length,
    skippedCount: skipped.length,
    applied: applied,
    skipped: skipped
  };
}


/**
 * Xác định loại rule dự kiến.
 */
function kidlearnV3_getValidationRuleType_(
  column
) {
  var T = KIDLEARN_V3_DATA_TYPES;

  if (column.type === T.ENUM) {
    return 'ENUM_DROPDOWN';
  }

  if (column.type === T.BOOLEAN) {
    return 'CHECKBOX';
  }

  if (column.type === T.NUMBER) {
    return 'NUMBER';
  }

  if (column.type === T.DATE) {
    return 'DATE';
  }

  if (column.type === T.DATETIME) {
    return 'DATETIME';
  }

  if (column.type === T.URL) {
    return 'URL';
  }

  if (
    column.validation &&
    column.validation.targetSheet
  ) {
    return 'REFERENCE_DROPDOWN';
  }

  return '';
}


/**
 * Tạo DataValidation rule cho một cột.
 */
function kidlearnV3_buildDataValidationRule_(
  spreadsheet,
  schema,
  enums,
  column
) {
  var T = KIDLEARN_V3_DATA_TYPES;

  if (column.type === T.ENUM) {
    return kidlearnV3_buildEnumRule_(
      enums,
      column
    );
  }

  if (column.type === T.BOOLEAN) {
    return kidlearnV3_buildCheckboxRule_(
      column
    );
  }

  if (column.type === T.NUMBER) {
    return kidlearnV3_buildNumberRule_(
      column
    );
  }

  if (column.type === T.DATE) {
    return kidlearnV3_buildDateRule_(
      column,
      'DATE'
    );
  }

  if (column.type === T.DATETIME) {
    return kidlearnV3_buildDateRule_(
      column,
      'DATETIME'
    );
  }

  if (column.type === T.URL) {
    return kidlearnV3_buildUrlRule_(
      column
    );
  }

  if (
    column.validation &&
    column.validation.targetSheet
  ) {
    return kidlearnV3_buildReferenceRule_(
      spreadsheet,
      schema,
      column
    );
  }

  return {
    rule: null,
    ruleType: '',
    reason: 'NO_RULE'
  };
}


/**
 * Dropdown ENUM.
 */
function kidlearnV3_buildEnumRule_(
  enums,
  column
) {
  if (
    !column.validation ||
    !column.validation.enumKey
  ) {
    return {
      rule: null,
      ruleType: 'ENUM_DROPDOWN',
      reason: 'ENUM_KEY_MISSING'
    };
  }

  var enumKey =
    column.validation.enumKey;

  var values =
    enums[enumKey];

  if (!values || values.length === 0) {
    return {
      rule: null,
      ruleType: 'ENUM_DROPDOWN',
      reason:
        'ENUM_VALUES_MISSING: ' +
        enumKey
    };
  }

  var rule =
    SpreadsheetApp
      .newDataValidation()
      .requireValueInList(values, true)
      .setAllowInvalid(false)
      .setHelpText(
        'Chọn một giá trị trong enum: ' +
        enumKey
      )
      .build();

  return {
    rule: rule,
    ruleType: 'ENUM_DROPDOWN',
    reason: ''
  };
}


/**
 * Checkbox BOOLEAN.
 */
function kidlearnV3_buildCheckboxRule_(
  column
) {
  var rule =
    SpreadsheetApp
      .newDataValidation()
      .requireCheckbox()
      .setAllowInvalid(false)
      .setHelpText(
        'Chỉ nhận TRUE hoặc FALSE.'
      )
      .build();

  return {
    rule: rule,
    ruleType: 'CHECKBOX',
    reason: ''
  };
}


/**
 * Number validation.
 */
function kidlearnV3_buildNumberRule_(
  column
) {
  var validation =
    column.validation;

  if (
    validation &&
    typeof validation.min === 'number' &&
    typeof validation.max === 'number'
  ) {
    var rule =
      SpreadsheetApp
        .newDataValidation()
        .requireNumberBetween(
          validation.min,
          validation.max
        )
        .setAllowInvalid(false)
        .setHelpText(
          'Nhập số từ ' +
          validation.min +
          ' đến ' +
          validation.max +
          '.'
        )
        .build();

    return {
      rule: rule,
      ruleType: 'NUMBER_RANGE',
      reason: ''
    };
  }

  var numberRule =
    SpreadsheetApp
      .newDataValidation()
      .requireNumberGreaterThanOrEqualTo(0)
      .setAllowInvalid(true)
      .setHelpText(
        'Nên nhập giá trị dạng số.'
      )
      .build();

  return {
    rule: numberRule,
    ruleType: 'NUMBER_SOFT',
    reason: ''
  };
}


/**
 * Date hoặc DateTime validation.
 */
function kidlearnV3_buildDateRule_(
  column,
  ruleType
) {
  var rule =
    SpreadsheetApp
      .newDataValidation()
      .requireDate()
      .setAllowInvalid(true)
      .setHelpText(
        'Nhập giá trị ngày hoặc ngày giờ hợp lệ.'
      )
      .build();

  return {
    rule: rule,
    ruleType: ruleType,
    reason: ''
  };
}


/**
 * URL validation.
 */
function kidlearnV3_buildUrlRule_(
  column
) {
  var rule =
    SpreadsheetApp
      .newDataValidation()
      .requireTextIsUrl()
      .setAllowInvalid(true)
      .setHelpText(
        'Nhập URL hợp lệ.'
      )
      .build();

  return {
    rule: rule,
    ruleType: 'URL',
    reason: ''
  };
}


/**
 * Dropdown tham chiếu sang Sheet khác.
 */
function kidlearnV3_buildReferenceRule_(
  spreadsheet,
  schema,
  column
) {
  var validation =
    column.validation;

  if (
    !validation ||
    !validation.targetSheet ||
    !validation.targetKey
  ) {
    return {
      rule: null,
      ruleType: 'REFERENCE_DROPDOWN',
      reason: 'REFERENCE_CONFIG_MISSING'
    };
  }

  var targetDefinition =
    schema[validation.targetSheet];

  if (!targetDefinition) {
    return {
      rule: null,
      ruleType: 'REFERENCE_DROPDOWN',
      reason:
        'TARGET_SCHEMA_MISSING: ' +
        validation.targetSheet
    };
  }

  var targetSheet =
    spreadsheet.getSheetByName(
      validation.targetSheet
    );

  if (!targetSheet) {
    return {
      rule: null,
      ruleType: 'REFERENCE_DROPDOWN',
      reason:
        'TARGET_SHEET_MISSING: ' +
        validation.targetSheet
    };
  }

  var targetColumnIndex =
    kidlearnV3_findColumnIndexByKeyForValidation_(
      targetDefinition,
      validation.targetKey
    );

  if (targetColumnIndex < 1) {
    return {
      rule: null,
      ruleType: 'REFERENCE_DROPDOWN',
      reason:
        'TARGET_KEY_MISSING: ' +
        validation.targetSheet +
        '.' +
        validation.targetKey
    };
  }

  var targetRowCount =
    targetSheet.getMaxRows() - 2;

  if (targetRowCount < 1) {
    return {
      rule: null,
      ruleType: 'REFERENCE_DROPDOWN',
      reason: 'TARGET_RANGE_EMPTY'
    };
  }

  var targetRange =
    targetSheet.getRange(
      3,
      targetColumnIndex,
      targetRowCount,
      1
    );

  var rule =
    SpreadsheetApp
      .newDataValidation()
      .requireValueInRange(
        targetRange,
        true
      )
      .setAllowInvalid(true)
      .setHelpText(
        'Nên chọn ID từ ' +
        validation.targetSheet +
        '.' +
        validation.targetKey
      )
      .build();

  return {
    rule: rule,
    ruleType: 'REFERENCE_DROPDOWN',
    reason: ''
  };
}


/**
 * Tìm số thứ tự cột theo technical key.
 */
function kidlearnV3_findColumnIndexByKeyForValidation_(
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
    if (columns[i].key === key) {
      return i + 1;
    }
  }

  return 0;
}