/**
 * ================================================================
 * KIDLEARN V3 - INITIAL SEED DATA
 * Step: 3H.7
 * Version: 3.1.0
 * ================================================================
 *
 * File này seed dữ liệu hệ thống ban đầu.
 *
 * KHÔNG xóa Sheet.
 * KHÔNG đổi tên Sheet.
 * KHÔNG migration dữ liệu V2.
 */


/**
 * Preview dữ liệu seed trước khi ghi.
 */
function kidlearnV3_previewInitialSeedV3() {
  var context =
    kidlearnV3_assertDevEnvironment_();

  kidlearnV3_validateCreatedSheets();

  var spreadsheet =
    context.spreadsheet;

  var schema =
    kidlearnV3_buildSchema_();

  var seedMap =
    kidlearnV3_getInitialSeedRows_();

  var report = [];

  var sheetNames =
    Object.keys(seedMap);

  for (
    var i = 0;
    i < sheetNames.length;
    i++
  ) {
    var sheetName =
      sheetNames[i];

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
        reason: 'Sheet hoặc schema không tồn tại.'
      });

      continue;
    }

    var rows =
      seedMap[sheetName];

    var existingKeys =
      kidlearnV3_getExistingPrimaryKeys_(
        sheet,
        definition
      );

    var insertCount = 0;
    var updateCount = 0;

    for (
      var r = 0;
      r < rows.length;
      r++
    ) {
      var primaryValue =
        kidlearnV3_getSeedPrimaryValue_(
          definition,
          rows[r]
        );

      if (existingKeys[primaryValue]) {
        updateCount++;
      } else {
        insertCount++;
      }
    }

    report.push({
      sheetName: sheetName,
      status: 'READY',
      seedRowCount: rows.length,
      insertCount: insertCount,
      updateCount: updateCount,
      primaryKey: definition.primaryKey
    });
  }

  var result = {
    success: true,
    environment: context.environment,
    spreadsheetName: context.spreadsheetName,
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    targetSeedSheetCount: sheetNames.length,
    report: report
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Seed dữ liệu hệ thống ban đầu.
 *
 * Có thể chạy lại an toàn.
 * Nếu primary key đã tồn tại thì update row đó.
 */
function kidlearnV3_seedInitialDataV3() {
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
      'Không lấy được document lock. Có thể tiến trình khác đang chạy.'
    );
  }

  try {
    var spreadsheet =
      context.spreadsheet;

    var schema =
      kidlearnV3_buildSchema_();

    var seedMap =
      kidlearnV3_getInitialSeedRows_();

    var report = [];
    var totalInserted = 0;
    var totalUpdated = 0;
    var totalSkipped = 0;

    var sheetNames =
      Object.keys(seedMap);

    for (
      var i = 0;
      i < sheetNames.length;
      i++
    ) {
      var sheetName =
        sheetNames[i];

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
          insertedCount: 0,
          updatedCount: 0,
          skippedCount: 1
        });

        totalSkipped++;
        continue;
      }

      var result =
        kidlearnV3_seedSheetRows_(
          sheet,
          definition,
          seedMap[sheetName]
        );

      report.push(result);

      totalInserted +=
        result.insertedCount;

      totalUpdated +=
        result.updatedCount;

      totalSkipped +=
        result.skippedCount;
    }

    SpreadsheetApp.flush();

    kidlearnV3_markSeedAppliedSafe_();

    var finalResult = {
      success: true,
      environment: context.environment,
      spreadsheetName: context.spreadsheetName,
      schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
      insertedCount: totalInserted,
      updatedCount: totalUpdated,
      skippedCount: totalSkipped,
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
 * Kiểm tra seed sau khi ghi.
 */
function kidlearnV3_verifyInitialSeedV3() {
  var context =
    kidlearnV3_assertDevEnvironment_();

  var spreadsheet =
    context.spreadsheet;

  var schema =
    kidlearnV3_buildSchema_();

  var seedMap =
    kidlearnV3_getInitialSeedRows_();

  var errors = [];
  var report = [];

  var sheetNames =
    Object.keys(seedMap);

  for (
    var i = 0;
    i < sheetNames.length;
    i++
  ) {
    var sheetName =
      sheetNames[i];

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
      errors.push(
        sheetName +
        ': không tìm thấy Sheet hoặc schema.'
      );

      continue;
    }

    var existingKeys =
      kidlearnV3_getExistingPrimaryKeys_(
        sheet,
        definition
      );

    var rows =
      seedMap[sheetName];

    var missing = [];

    for (
      var r = 0;
      r < rows.length;
      r++
    ) {
      var primaryValue =
        kidlearnV3_getSeedPrimaryValue_(
          definition,
          rows[r]
        );

      if (!existingKeys[primaryValue]) {
        missing.push(primaryValue);
      }
    }

    if (missing.length > 0) {
      errors.push(
        sheetName +
        ': thiếu seed rows: ' +
        missing.join(', ')
      );
    }

    report.push({
      sheetName: sheetName,
      expectedCount: rows.length,
      missingCount: missing.length,
      missing: missing
    });
  }

  var result = {
    success: errors.length === 0,
    errorCount: errors.length,
    errors: errors,
    report: report
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Seed verification chưa đạt. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Dữ liệu seed ban đầu.
 */
function kidlearnV3_getInitialSeedRows_() {
  var now = new Date();

  return {
    SYS_Config: [
      {
        _id: 'APP_NAME',
        configKey: 'APP_NAME',
        configValue: 'KIDLEARN',
        valueType: 'STRING',
        configType: 'STRING',
        categoryCode: 'SYSTEM',
        description: 'Tên ứng dụng.',
        isActive: true,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        updatedBy: 'SYSTEM'
      },
      {
        _id: 'APP_VERSION',
        configKey: 'APP_VERSION',
        configValue: KIDLEARN_V3.APP_VERSION,
        valueType: 'STRING',
        configType: 'STRING',
        categoryCode: 'SYSTEM',
        description: 'Phiên bản ứng dụng hiện tại.',
        isActive: true,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        updatedBy: 'SYSTEM'
      },
      {
        _id: 'SCHEMA_VERSION',
        configKey: 'SCHEMA_VERSION',
        configValue: KIDLEARN_V3.SCHEMA_VERSION,
        valueType: 'STRING',
        configType: 'STRING',
        categoryCode: 'SYSTEM',
        description: 'Phiên bản schema hiện tại.',
        isActive: true,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        updatedBy: 'SYSTEM'
      },
      {
        _id: 'DEFAULT_GRADE_LEVEL',
        configKey: 'DEFAULT_GRADE_LEVEL',
        configValue: '2',
        valueType: 'NUMBER',
        configType: 'NUMBER',
        categoryCode: 'LEARNING',
        description: 'Khối lớp mặc định ban đầu.',
        isActive: true,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        updatedBy: 'SYSTEM'
      },
      {
        _id: 'DEFAULT_LANGUAGE',
        configKey: 'DEFAULT_LANGUAGE',
        configValue: 'vi-VN',
        valueType: 'STRING',
        configType: 'STRING',
        categoryCode: 'SYSTEM',
        description: 'Ngôn ngữ mặc định.',
        isActive: true,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now,
        updatedBy: 'SYSTEM'
      }
    ],

    SYS_Categories: [
      {
        _id: 'CAT_SYSTEM',
        categoryId: 'CAT_SYSTEM',
        categoryCode: 'SYSTEM',
        categoryName: 'Hệ thống',
        categoryType: 'SYSTEM',
        description: 'Nhóm cấu hình hệ thống.',
        sortOrder: 1,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'CAT_LEARNING',
        categoryId: 'CAT_LEARNING',
        categoryCode: 'LEARNING',
        categoryName: 'Chương trình học',
        categoryType: 'SYSTEM',
        description: 'Nhóm dữ liệu chương trình học.',
        sortOrder: 2,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'CAT_ASSESSMENT',
        categoryId: 'CAT_ASSESSMENT',
        categoryCode: 'ASSESSMENT',
        categoryName: 'Câu hỏi và đánh giá',
        categoryType: 'SYSTEM',
        description: 'Nhóm câu hỏi, bài luyện tập và kết quả.',
        sortOrder: 3,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'CAT_AI',
        categoryId: 'CAT_AI',
        categoryCode: 'AI',
        categoryName: 'AI và nhập nội dung',
        categoryType: 'SYSTEM',
        description: 'Nhóm staging, AI job và approval.',
        sortOrder: 4,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now
      }
    ],

    SYS_SchemaVersion: [
      {
        _id: 'SCHEMA_3_1_0',
        schemaVersionId: 'SCHEMA_3_1_0',
        schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
        appVersion: KIDLEARN_V3.APP_VERSION,
        description: 'KIDLEARN V3 initial schema.',
        isCurrent: true,
        status: 'ACTIVE',
        appliedAt: now,
        createdAt: now,
        updatedAt: now
      }
    ],

    MST_Subjects: [
      {
        _id: 'SUB_TV',
        subjectId: 'SUB_TV',
        subjectCode: 'TV',
        subjectName: 'Tiếng Việt',
        description: 'Môn Tiếng Việt.',
        icon: '📖',
        themeKey: 'GREEN',
        primaryColor: '#16A34A',
        accentColor: '#22C55E',
        sortOrder: 1,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'SUB_TOAN',
        subjectId: 'SUB_TOAN',
        subjectCode: 'TOAN',
        subjectName: 'Toán học',
        description: 'Môn Toán học.',
        icon: '🔢',
        themeKey: 'BLUE',
        primaryColor: '#2563EB',
        accentColor: '#60A5FA',
        sortOrder: 2,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'SUB_TA',
        subjectId: 'SUB_TA',
        subjectCode: 'TA',
        subjectName: 'Tiếng Anh',
        description: 'Môn Tiếng Anh.',
        icon: '🔤',
        themeKey: 'INDIGO',
        primaryColor: '#4F46E5',
        accentColor: '#818CF8',
        sortOrder: 3,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now
      },
      {
        _id: 'SUB_KH',
        subjectId: 'SUB_KH',
        subjectCode: 'KH',
        subjectName: 'Khoa học',
        description: 'Môn Khoa học.',
        icon: '🔬',
        themeKey: 'TEAL',
        primaryColor: '#0D9488',
        accentColor: '#2DD4BF',
        sortOrder: 4,
        status: 'ACTIVE',
        createdAt: now,
        updatedAt: now
      }
    ],

    MST_Curriculums: [
      {
        _id: 'CUR_GRADE2_CORE_2026',
        curriculumId: 'CUR_GRADE2_CORE_2026',
        curriculumCode: 'GRADE2_CORE_2026',
        curriculumName: 'Chương trình cơ bản lớp 2',
        gradeLevel: 2,
        academicYear: '2026',
        curriculumType: 'CORE',
        description: 'Chương trình học cơ bản ban đầu cho lớp 2.',
        isDefault: true,
        status: 'DRAFT',
        contentVersion: '1.0.0',
        createdAt: now,
        createdBy: 'SYSTEM',
        updatedAt: now,
        updatedBy: 'SYSTEM'
      }
    ]
  };
}


/**
 * Seed các dòng của một Sheet.
 */
function kidlearnV3_seedSheetRows_(
  sheet,
  definition,
  rows
) {
  var inserted = [];
  var updated = [];
  var skipped = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    var result =
      kidlearnV3_upsertSeedRow_(
        sheet,
        definition,
        rows[i]
      );

    if (result.action === 'INSERTED') {
      inserted.push(result.primaryValue);
    } else if (result.action === 'UPDATED') {
      updated.push(result.primaryValue);
    } else {
      skipped.push(result.primaryValue);
    }
  }

  return {
    sheetName: sheet.getName(),
    status: 'DONE',
    insertedCount: inserted.length,
    updatedCount: updated.length,
    skippedCount: skipped.length,
    inserted: inserted,
    updated: updated,
    skipped: skipped
  };
}


/**
 * Upsert một dòng seed theo primary key.
 */
function kidlearnV3_upsertSeedRow_(
  sheet,
  definition,
  seedRow
) {
  var primaryKey =
    definition.primaryKey;

  var primaryValue =
    kidlearnV3_getSeedPrimaryValue_(
      definition,
      seedRow
    );

  if (!primaryValue) {
    return {
      action: 'SKIPPED',
      primaryValue: '',
      reason: 'PRIMARY_VALUE_EMPTY'
    };
  }

  seedRow[primaryKey] =
    primaryValue;

  var rowValues =
    kidlearnV3_buildSeedRowValues_(
      definition,
      seedRow
    );

  var rowNumber =
    kidlearnV3_findRowNumberByPrimaryKey_(
      sheet,
      definition,
      primaryValue
    );

  if (rowNumber > 0) {
    sheet
      .getRange(
        rowNumber,
        1,
        1,
        rowValues.length
      )
      .setValues([
        rowValues
      ]);

    return {
      action: 'UPDATED',
      primaryValue: primaryValue,
      rowNumber: rowNumber
    };
  }

  var nextRow =
    sheet.getLastRow() + 1;

  if (nextRow < 3) {
    nextRow = 3;
  }

  sheet
    .getRange(
      nextRow,
      1,
      1,
      rowValues.length
    )
    .setValues([
      rowValues
    ]);

  return {
    action: 'INSERTED',
    primaryValue: primaryValue,
    rowNumber: nextRow
  };
}


/**
 * Lấy primary value từ seed row.
 */
function kidlearnV3_getSeedPrimaryValue_(
  definition,
  seedRow
) {
  var primaryKey =
    definition.primaryKey;

  if (
    seedRow[primaryKey] !== undefined &&
    seedRow[primaryKey] !== ''
  ) {
    return String(seedRow[primaryKey]);
  }

  if (
    seedRow._id !== undefined &&
    seedRow._id !== ''
  ) {
    return String(seedRow._id);
  }

  return '';
}


/**
 * Build array values theo đúng thứ tự schema columns.
 */
function kidlearnV3_buildSeedRowValues_(
  definition,
  seedRow
) {
  var values = [];

  for (
    var i = 0;
    i < definition.columns.length;
    i++
  ) {
    var column =
      definition.columns[i];

    if (
      seedRow[column.key] !== undefined
    ) {
      values.push(
        seedRow[column.key]
      );

      continue;
    }

    values.push(
      kidlearnV3_getSeedDefaultValue_(
        column
      )
    );
  }

  return values;
}


/**
 * Lấy default value từ schema.
 */
function kidlearnV3_getSeedDefaultValue_(
  column
) {
  var D =
    KIDLEARN_V3_DEFAULTS;

  var value =
    column.defaultValue;

  if (
    value === undefined ||
    value === null
  ) {
    return '';
  }

  if (
    D &&
    value === D.NOW
  ) {
    return new Date();
  }

  if (
    D &&
    value === D.TODAY
  ) {
    return kidlearnV3_todayDateOnly_();
  }

  if (
    D &&
    value === D.SYSTEM
  ) {
    return 'SYSTEM';
  }

  if (
    D &&
    value === D.EMPTY_JSON_ARRAY
  ) {
    return '[]';
  }

  if (
    D &&
    value === D.EMPTY_JSON_OBJECT
  ) {
    return '{}';
  }

  return value;
}


/**
 * Lấy danh sách primary keys hiện có.
 */
function kidlearnV3_getExistingPrimaryKeys_(
  sheet,
  definition
) {
  var result = {};

  var primaryColumnIndex =
    kidlearnV3_findColumnIndexByKeyForSeed_(
      definition,
      definition.primaryKey
    );

  if (primaryColumnIndex < 1) {
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
        primaryColumnIndex,
        lastRow - 2,
        1
      )
      .getDisplayValues();

  for (
    var i = 0;
    i < values.length;
    i++
  ) {
    var key =
      String(values[i][0] || '').trim();

    if (key !== '') {
      result[key] = true;
    }
  }

  return result;
}


/**
 * Tìm row number theo primary key.
 */
function kidlearnV3_findRowNumberByPrimaryKey_(
  sheet,
  definition,
  primaryValue
) {
  var primaryColumnIndex =
    kidlearnV3_findColumnIndexByKeyForSeed_(
      definition,
      definition.primaryKey
    );

  if (primaryColumnIndex < 1) {
    return 0;
  }

  var lastRow =
    sheet.getLastRow();

  if (lastRow < 3) {
    return 0;
  }

  var values =
    sheet
      .getRange(
        3,
        primaryColumnIndex,
        lastRow - 2,
        1
      )
      .getDisplayValues();

  for (
    var i = 0;
    i < values.length;
    i++
  ) {
    var currentValue =
      String(values[i][0] || '').trim();

    if (
      currentValue ===
      String(primaryValue)
    ) {
      return i + 3;
    }
  }

  return 0;
}


/**
 * Tìm vị trí cột theo key.
 */
function kidlearnV3_findColumnIndexByKeyForSeed_(
  definition,
  key
) {
  var columns =
    definition.columns || [];

  for (
    var i = 0;
    i < columns.length; i++
  ) {
    if (
      columns[i].key === key
    ) {
      return i + 1;
    }
  }

  return 0;
}


/**
 * Tạo date chỉ có ngày.
 */
function kidlearnV3_todayDateOnly_() {
  var now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
}


/**
 * Đánh dấu đã seed.
 */
function kidlearnV3_markSeedAppliedSafe_() {
  try {
    kidlearnV3_setSetupStatus_(
      'INITIAL_SEED_APPLIED'
    );
  } catch (error) {
    console.warn(
      'Không cập nhật được setup status INITIAL_SEED_APPLIED: ' +
      String(error.message || error)
    );
  }
}