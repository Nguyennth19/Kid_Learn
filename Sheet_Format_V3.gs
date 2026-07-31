/**
 * ================================================================
 * KIDLEARN V3 - SHEET FORMAT UTILITIES
 * Step: 3H.3
 * Version: 3.1.0
 * ================================================================
 *
 * File này chỉ định dạng Sheet.
 * Không tạo hoặc xóa Sheet.
 * Không ghi dữ liệu từ dòng 3 trở đi.
 */


/**
 * Định dạng một Sheet theo schema.
 */
function kidlearnV3_formatSheetFromSchema_(
  sheet,
  definition
) {
  var columnCount =
    definition.columns.length;

  var maxRows =
    sheet.getMaxRows();

  var dataRowCount =
    maxRows - 2;

  sheet.setFrozenRows(
    definition.frozenRows || 2
  );

  sheet.setRowHeight(1, 32);
  sheet.setRowHeight(2, 28);

  sheet.setColumnWidths(
    1,
    columnCount,
    160
  );

  kidlearnV3_formatHeaderRows_(
    sheet,
    columnCount
  );

  kidlearnV3_setHeaderNotes_(
    sheet,
    definition
  );

  kidlearnV3_setWideColumns_(
    sheet,
    definition
  );

  kidlearnV3_applyColumnNumberFormats_(
    sheet,
    definition
  );

  if (dataRowCount > 0) {
    sheet
      .getRange(
        3,
        1,
        dataRowCount,
        columnCount
      )
      .setVerticalAlignment('top')
      .setWrap(true);
  }

  kidlearnV3_createFilterIfNeeded_(
    sheet,
    definition,
    columnCount
  );

  kidlearnV3_setSheetTabColor_(
    sheet,
    definition.group
  );
}


/**
 * Định dạng hai dòng tiêu đề.
 */
function kidlearnV3_formatHeaderRows_(
  sheet,
  columnCount
) {
  var labelRange =
    sheet.getRange(
      1,
      1,
      1,
      columnCount
    );

  labelRange
    .setBackground('#1F4E78')
    .setFontColor('#FFFFFF')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);

  var keyRange =
    sheet.getRange(
      2,
      1,
      1,
      columnCount
    );

  keyRange
    .setBackground('#D9EAF7')
    .setFontColor('#1F1F1F')
    .setFontWeight('bold')
    .setHorizontalAlignment('center')
    .setVerticalAlignment('middle')
    .setWrap(true);

  sheet
    .getRange(
      1,
      1,
      2,
      columnCount
    )
    .setFontFamily('Arial');
}


/**
 * Gắn ghi chú schema vào technical header dòng 2.
 */
function kidlearnV3_setHeaderNotes_(
  sheet,
  definition
) {
  var notes = [];

  for (
    var i = 0;
    i < definition.columns.length;
    i++
  ) {
    notes.push(
      kidlearnV3_buildColumnNote_(
        definition.columns[i]
      )
    );
  }

  sheet
    .getRange(
      2,
      1,
      1,
      definition.columns.length
    )
    .setNotes([
      notes
    ]);
}


/**
 * Tạo nội dung ghi chú cho một cột.
 */
function kidlearnV3_buildColumnNote_(
  column
) {
  var lines = [];

  lines.push(
    'Key: ' + column.key
  );

  lines.push(
    'Type: ' + column.type
  );

  lines.push(
    'Required: ' +
    (column.required ? 'YES' : 'NO')
  );

  if (
    column.defaultValue !== '' &&
    column.defaultValue !== null
  ) {
    lines.push(
      'Default: ' +
      String(column.defaultValue)
    );
  }

  if (column.validation) {
    lines.push(
      'Validation: ' +
      column.validation.kind
    );

    if (column.validation.enumKey) {
      lines.push(
        'Enum: ' +
        column.validation.enumKey
      );
    }

    if (column.validation.prefix) {
      lines.push(
        'Prefix: ' +
        column.validation.prefix
      );
    }

    if (column.validation.targetSheet) {
      lines.push(
        'Reference: ' +
        column.validation.targetSheet +
        '.' +
        column.validation.targetKey
      );
    }

    if (
      typeof column.validation.min === 'number'
    ) {
      lines.push(
        'Min: ' +
        column.validation.min
      );
    }

    if (
      typeof column.validation.max === 'number'
    ) {
      lines.push(
        'Max: ' +
        column.validation.max
      );
    }
  }

  if (column.sensitive === true) {
    lines.push(
      'Sensitive: YES'
    );
  }

  if (column.immutable === true) {
    lines.push(
      'Immutable: YES'
    );
  }

  if (column.unique === true) {
    lines.push(
      'Unique: YES'
    );
  }

  return lines.join('\n');
}


/**
 * Mở rộng các cột chứa nội dung dài.
 */
function kidlearnV3_setWideColumns_(
  sheet,
  definition
) {
  for (
    var i = 0;
    i < definition.columns.length;
    i++
  ) {
    var column =
      definition.columns[i];

    if (
      kidlearnV3_isWideColumn_(column)
    ) {
      sheet.setColumnWidth(
        i + 1,
        280
      );
    }
  }
}


/**
 * Xác định cột cần độ rộng lớn.
 */
function kidlearnV3_isWideColumn_(
  column
) {
  if (
    column.type ===
    KIDLEARN_V3_DATA_TYPES.JSON
  ) {
    return true;
  }

  var key =
    String(column.key).toLowerCase();

  var wideKeywords = [
    'description',
    'summary',
    'text',
    'instructions',
    'message',
    'notes',
    'feedback',
    'transcript',
    'content',
    'rubric',
    'analysis',
    'payload',
    'error'
  ];

  for (
    var i = 0;
    i < wideKeywords.length;
    i++
  ) {
    if (
      key.indexOf(wideKeywords[i]) !== -1
    ) {
      return true;
    }
  }

  return false;
}


/**
 * Định dạng ngày, giờ, số và ID theo kiểu dữ liệu.
 */
function kidlearnV3_applyColumnNumberFormats_(
  sheet,
  definition
) {
  var textRanges = [];
  var dateRanges = [];
  var dateTimeRanges = [];
  var integerRanges = [];
  var decimalRanges = [];

  var lastRow =
    sheet.getMaxRows();

  for (
    var i = 0;
    i < definition.columns.length;
    i++
  ) {
    var column =
      definition.columns[i];

    var columnLetter =
      kidlearnV3_columnNumberToLetter_(
        i + 1
      );

    var rangeA1 =
      columnLetter +
      '3:' +
      columnLetter +
      lastRow;

    if (
      column.type ===
        KIDLEARN_V3_DATA_TYPES.ID ||
      column.type ===
        KIDLEARN_V3_DATA_TYPES.FILE_ID ||
      column.type ===
        KIDLEARN_V3_DATA_TYPES.JSON ||
      column.type ===
        KIDLEARN_V3_DATA_TYPES.URL
    ) {
      textRanges.push(rangeA1);
      continue;
    }

    if (
      column.type ===
      KIDLEARN_V3_DATA_TYPES.DATE
    ) {
      dateRanges.push(rangeA1);
      continue;
    }

    if (
      column.type ===
      KIDLEARN_V3_DATA_TYPES.DATETIME
    ) {
      dateTimeRanges.push(rangeA1);
      continue;
    }

    if (
      column.type ===
      KIDLEARN_V3_DATA_TYPES.NUMBER
    ) {
      if (
        column.validation &&
        column.validation.kind ===
          'INTEGER_RANGE'
      ) {
        integerRanges.push(rangeA1);
      } else {
        decimalRanges.push(rangeA1);
      }
    }
  }

  kidlearnV3_setRangeListFormat_(
    sheet,
    textRanges,
    '@'
  );

  kidlearnV3_setRangeListFormat_(
    sheet,
    dateRanges,
    'yyyy-mm-dd'
  );

  kidlearnV3_setRangeListFormat_(
    sheet,
    dateTimeRanges,
    'yyyy-mm-dd hh:mm:ss'
  );

  kidlearnV3_setRangeListFormat_(
    sheet,
    integerRanges,
    '0'
  );

  kidlearnV3_setRangeListFormat_(
    sheet,
    decimalRanges,
    '0.00'
  );
}


/**
 * Áp dụng format cho một RangeList.
 */
function kidlearnV3_setRangeListFormat_(
  sheet,
  ranges,
  numberFormat
) {
  if (!ranges || ranges.length === 0) {
    return;
  }

  sheet
    .getRangeList(ranges)
    .setNumberFormat(numberFormat);
}


/**
 * Tạo filter bắt đầu từ technical header dòng 2.
 */
function kidlearnV3_createFilterIfNeeded_(
  sheet,
  definition,
  columnCount
) {
  if (definition.createFilter === false) {
    return;
  }

  if (sheet.getFilter()) {
    return;
  }

  var filterRowCount =
    sheet.getMaxRows() - 1;

  if (filterRowCount < 2) {
    return;
  }

  sheet
    .getRange(
      2,
      1,
      filterRowCount,
      columnCount
    )
    .createFilter();
}


/**
 * Đặt màu tab theo nhóm dữ liệu.
 */
function kidlearnV3_setSheetTabColor_(
  sheet,
  group
) {
  var color =
    kidlearnV3_getTabColorByGroup_(group);

  if (!color) {
    return;
  }

  sheet.setTabColor(color);
}


/**
 * Màu tab của từng nhóm.
 */
function kidlearnV3_getTabColorByGroup_(
  group
) {
  var colors = {
    SYSTEM: '#5B6573',
    ACCOUNT: '#7C3AED',

    LEARNING: '#2563EB',

    ASSESSMENT: '#D97706',
    ASSESSMENT_DATA: '#F59E0B',

    PROGRESS: '#059669',

    ENGAGEMENT: '#DB2777',
    ENGAGEMENT_DATA: '#EC4899',

    LIBRARY: '#0891B2',
    LIBRARY_DATA: '#06B6D4',

    NOTIFICATION: '#4F46E5',

    AI_STAGING: '#9333EA',
    AI_DATA: '#7E22CE',
    AI_LOG: '#6B21A8'
  };

  return colors[group] || null;
}


/**
 * Chuyển số cột thành ký tự A1.
 *
 * Ví dụ:
 * 1  -> A
 * 26 -> Z
 * 27 -> AA
 */
function kidlearnV3_columnNumberToLetter_(
  columnNumber
) {
  var result = '';
  var number = columnNumber;

  while (number > 0) {
    var remainder =
      (number - 1) % 26;

    result =
      String.fromCharCode(
        65 + remainder
      ) +
      result;

    number =
      Math.floor(
        (number - 1) / 26
      );
  }

  return result;
}