/**
 * ================================================================
 * KIDLEARN V3 - MIGRATE DATA V2 TO V3
 * Step: 3H.8
 * Version: 3.1.0
 * ================================================================
 *
 * File này migrate dữ liệu từ LEGACY_V2_* sang V3.
 *
 * KHÔNG xóa Sheet.
 * KHÔNG xóa dữ liệu Legacy.
 * KHÔNG đổi tên Sheet.
 * Có thể chạy lại an toàn theo primary key.
 */


/**
 * Preview migration V2 sang V3.
 * Hàm này chỉ đọc dữ liệu, không ghi.
 */
function kidlearnV3_previewMigrationV2ToV3() {
  var context =
    kidlearnV3_assertDevEnvironment_();

  kidlearnV3_validateCreatedSheets();

  var spreadsheet =
    context.spreadsheet;

  var schema =
    kidlearnV3_buildSchema_();

  var sources =
    kidlearnV3_v2m_getLegacySources_();

  var report = [];

  for (
    var i = 0;
    i < sources.length;
    i++
  ) {
    var source =
      sources[i];

    var sheet =
      kidlearnV3_getSheetByExactName_(
        spreadsheet,
        source.sheetName
      );

    if (!sheet) {
      report.push({
        sourceSheet: source.sheetName,
        targetSheets: source.targetSheets,
        optional: source.optional,
        status: source.optional ? 'OPTIONAL_MISSING' : 'MISSING',
        rowCount: 0,
        message: source.optional
          ? 'Sheet Legacy tùy chọn không tồn tại.'
          : 'Thiếu Sheet Legacy bắt buộc.'
      });

      continue;
    }

    var rows =
      kidlearnV3_v2m_readLegacyRows_(
        sheet
      );

    report.push({
      sourceSheet: source.sheetName,
      targetSheets: source.targetSheets,
      optional: source.optional,
      status: 'READY',
      headerRow: rows.headerRow,
      rowCount: rows.rows.length,
      headers: rows.headers
    });
  }

  var result = {
    success: true,
    environment: context.environment,
    spreadsheetName: context.spreadsheetName,
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    report: report
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Chạy migration V2 sang V3.
 *
 * Có thể chạy lại an toàn.
 */
function kidlearnV3_migrateV2ToV3() {
  var context =
    kidlearnV3_assertDevEnvironment_();

  kidlearnV3_validateCreatedSheets();
  kidlearnV3_assertValidBackup_();

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

    var runtime = {
      migratedUserIds: [],
      migratedChildIds: [],
      familyAdminUserIds: [],
      childIds: [],
      defaultChildId: '',
      startedAt: new Date()
    };

    var report = [];

    report.push(
      kidlearnV3_v2m_migrateUsersAndChildren_(
        spreadsheet,
        schema,
        runtime
      )
    );

    report.push(
      kidlearnV3_v2m_migrateSettings_(
        spreadsheet,
        schema
      )
    );

    report.push(
      kidlearnV3_v2m_migrateCategories_(
        spreadsheet,
        schema
      )
    );

    report.push(
      kidlearnV3_v2m_migrateTasks_(
        spreadsheet,
        schema,
        runtime
      )
    );

    report.push(
      kidlearnV3_v2m_migrateSystemLogs_(
        spreadsheet,
        schema
      )
    );

    report.push(
      kidlearnV3_v2m_migrateScoresOptional_(
        spreadsheet,
        schema,
        runtime
      )
    );

    var summary =
      kidlearnV3_v2m_summarizeReport_(
        report
      );

    kidlearnV3_v2m_writeMigrationSummary_(
      spreadsheet,
      schema,
      summary
    );

    SpreadsheetApp.flush();

    kidlearnV3_v2m_markMigratedSafe_();

    var result = {
      success: true,
      environment: context.environment,
      spreadsheetName: context.spreadsheetName,
      schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
      summary: summary,
      report: report
    };

    console.log(
      JSON.stringify(result, null, 2)
    );

    return result;

  } finally {
    lock.releaseLock();
  }
}


/**
 * Verify migration sau khi chạy.
 */
function kidlearnV3_verifyMigrationV2ToV3() {
  var context =
    kidlearnV3_assertDevEnvironment_();

  var spreadsheet =
    context.spreadsheet;

  var schema =
    kidlearnV3_buildSchema_();

  var errors = [];
  var report = [];

  var requiredTargets = [
    'DATA_Users',
    'DATA_Children',
    'DATA_UserChildAccess',
    'DATA_Assignments',
    'SYS_Config',
    'SYS_Categories',
    'LOG_Audit',
    'SYS_MigrationLog'
  ];

  for (
    var i = 0;
    i < requiredTargets.length;
    i++
  ) {
    var sheetName =
      requiredTargets[i];

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
        ': thiếu Sheet hoặc schema.'
      );

      continue;
    }

    var dataCount =
      Math.max(
        0,
        sheet.getLastRow() - 2
      );

    report.push({
      sheetName: sheetName,
      dataRowCount: dataCount
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
      'Verify migration chưa đạt. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Migrate LEGACY_V2_Data_Users sang:
 * - DATA_Users
 * - DATA_Children
 * - DATA_UserChildAccess
 */
function kidlearnV3_v2m_migrateUsersAndChildren_(
  spreadsheet,
  schema,
  runtime
) {
  var sourceSheetName =
    'LEGACY_V2_Data_Users';

  var sourceSheet =
    kidlearnV3_getSheetByExactName_(
      spreadsheet,
      sourceSheetName
    );

  if (!sourceSheet) {
    return kidlearnV3_v2m_reportMissing_(
      sourceSheetName,
      false
    );
  }

  var source =
    kidlearnV3_v2m_readLegacyRows_(
      sourceSheet
    );

  var usersSheet =
    kidlearnV3_getSheetByExactName_(
      spreadsheet,
      'DATA_Users'
    );

  var childrenSheet =
    kidlearnV3_getSheetByExactName_(
      spreadsheet,
      'DATA_Children'
    );

  var accessSheet =
    kidlearnV3_getSheetByExactName_(
      spreadsheet,
      'DATA_UserChildAccess'
    );

  var userDef =
    schema.DATA_Users;

  var childDef =
    schema.DATA_Children;

  var accessDef =
    schema.DATA_UserChildAccess;

  var userCount = 0;
  var childCount = 0;
  var accessCount = 0;

  for (
    var i = 0;
    i < source.rows.length;
    i++
  ) {
    var legacyRow =
      source.rows[i];

    var rowNumber =
      legacyRow._rowNumber;

    var role =
      kidlearnV3_v2m_inferRole_(
        legacyRow
      );

    var userId =
      kidlearnV3_v2m_makeId_(
        userDef,
        'V2_USER_' + rowNumber
      );

    var userRow =
      kidlearnV3_v2m_buildUserRow_(
        userDef,
        legacyRow,
        userId,
        role
      );

    kidlearnV3_v2m_upsertRow_(
      usersSheet,
      userDef,
      userRow
    );

    userCount++;

    runtime.migratedUserIds.push(
      userId
    );

    if (role === 'FAMILY_ADMIN') {
      runtime.familyAdminUserIds.push(
        userId
      );
    }

    var shouldCreateChild =
      kidlearnV3_v2m_shouldCreateChild_(
        legacyRow,
        role
      );

    if (shouldCreateChild) {
      var childId =
        kidlearnV3_v2m_makeId_(
          childDef,
          'V2_CHILD_' + rowNumber
        );

      var childRow =
        kidlearnV3_v2m_buildChildRow_(
          childDef,
          legacyRow,
          childId
        );

      kidlearnV3_v2m_upsertRow_(
        childrenSheet,
        childDef,
        childRow
      );

      childCount++;

      runtime.migratedChildIds.push(
        childId
      );

      runtime.childIds.push(
        childId
      );
    }
  }

  if (runtime.childIds.length === 0) {
    var defaultChildId =
      kidlearnV3_v2m_makeId_(
        childDef,
        'V2_CHILD_DEFAULT'
      );

    var defaultChildRow =
      kidlearnV3_v2m_buildDefaultChildRow_(
        childDef,
        defaultChildId
      );

    kidlearnV3_v2m_upsertRow_(
      childrenSheet,
      childDef,
      defaultChildRow
    );

    runtime.childIds.push(
      defaultChildId
    );

    runtime.defaultChildId =
      defaultChildId;

    childCount++;
  } else {
    runtime.defaultChildId =
      runtime.childIds[0];
  }

  if (runtime.familyAdminUserIds.length === 0) {
    var adminId =
      kidlearnV3_v2m_makeId_(
        userDef,
        'V2_ADMIN_DEFAULT'
      );

    var adminRow =
      kidlearnV3_v2m_buildDefaultAdminRow_(
        userDef,
        adminId
      );

    kidlearnV3_v2m_upsertRow_(
      usersSheet,
      userDef,
      adminRow
    );

    runtime.familyAdminUserIds.push(
      adminId
    );

    userCount++;
  }

  accessCount =
    kidlearnV3_v2m_createUserChildAccess_(
      accessSheet,
      accessDef,
      runtime
    );

  return {
    sourceSheet: sourceSheetName,
    status: 'DONE',
    sourceRowCount: source.rows.length,
    insertedOrUpdated: {
      DATA_Users: userCount,
      DATA_Children: childCount,
      DATA_UserChildAccess: accessCount
    }
  };
}


/**
 * Migrate LEGACY_V2_Data_Tasks sang DATA_Assignments.
 */
function kidlearnV3_v2m_migrateTasks_(
  spreadsheet,
  schema,
  runtime
) {
  var sourceSheetName =
    'LEGACY_V2_Data_Tasks';

  var sourceSheet =
    kidlearnV3_getSheetByExactName_(
      spreadsheet,
      sourceSheetName
    );

  if (!sourceSheet) {
    return kidlearnV3_v2m_reportMissing_(
      sourceSheetName,
      false
    );
  }

  var source =
    kidlearnV3_v2m_readLegacyRows_(
      sourceSheet
    );

  var targetSheet =
    kidlearnV3_getSheetByExactName_(
      spreadsheet,
      'DATA_Assignments'
    );

  var targetDef =
    schema.DATA_Assignments;

  var migrated = 0;

  for (
    var i = 0;
    i < source.rows.length;
    i++
  ) {
    var legacyRow =
      source.rows[i];

    var assignmentId =
      kidlearnV3_v2m_makeId_(
        targetDef,
        'V2_TASK_' + legacyRow._rowNumber
      );

    var row =
      kidlearnV3_v2m_buildAssignmentRow_(
        targetDef,
        legacyRow,
        assignmentId,
        runtime.defaultChildId
      );

    kidlearnV3_v2m_upsertRow_(
      targetSheet,
      targetDef,
      row
    );

    migrated++;
  }

  return {
    sourceSheet: sourceSheetName,
    status: 'DONE',
    sourceRowCount: source.rows.length,
    insertedOrUpdated: {
      DATA_Assignments: migrated
    }
  };
}


/**
 * Migrate LEGACY_V2_Thiet_Lap sang SYS_Config.
 */
function kidlearnV3_v2m_migrateSettings_(
  spreadsheet,
  schema
) {
  var sourceSheetName =
    'LEGACY_V2_Thiet_Lap';

  var sourceSheet =
    kidlearnV3_getSheetByExactName_(
      spreadsheet,
      sourceSheetName
    );

  if (!sourceSheet) {
    return kidlearnV3_v2m_reportMissing_(
      sourceSheetName,
      false
    );
  }

  var source =
    kidlearnV3_v2m_readLegacyRows_(
      sourceSheet
    );

  var targetSheet =
    kidlearnV3_getSheetByExactName_(
      spreadsheet,
      'SYS_Config'
    );

  var targetDef =
    schema.SYS_Config;

  var migrated = 0;

  for (
    var i = 0;
    i < source.rows.length;
    i++
  ) {
    var legacyRow =
      source.rows[i];

    var configKey =
      kidlearnV3_v2m_pick_(
        legacyRow,
        [
          'configKey',
          'key',
          'ma cau hinh',
          'ten cau hinh',
          'tham so',
          'setting',
          'name'
        ]
      );

    if (!configKey) {
      configKey =
        'V2_SETTING_' +
        legacyRow._rowNumber;
    }

    configKey =
      kidlearnV3_v2m_code_(
        configKey
      );

    var row =
      kidlearnV3_v2m_buildConfigRow_(
        targetDef,
        legacyRow,
        configKey
      );

    kidlearnV3_v2m_upsertRow_(
      targetSheet,
      targetDef,
      row
    );

    migrated++;
  }

  return {
    sourceSheet: sourceSheetName,
    status: 'DONE',
    sourceRowCount: source.rows.length,
    insertedOrUpdated: {
      SYS_Config: migrated
    }
  };
}


/**
 * Migrate LEGACY_V2_Danh_Muc sang SYS_Categories.
 */
function kidlearnV3_v2m_migrateCategories_(
  spreadsheet,
  schema
) {
  var sourceSheetName =
    'LEGACY_V2_Danh_Muc';

  var sourceSheet =
    kidlearnV3_getSheetByExactName_(
      spreadsheet,
      sourceSheetName
    );

  if (!sourceSheet) {
    return kidlearnV3_v2m_reportMissing_(
      sourceSheetName,
      false
    );
  }

  var source =
    kidlearnV3_v2m_readLegacyRows_(
      sourceSheet
    );

  var targetSheet =
    kidlearnV3_getSheetByExactName_(
      spreadsheet,
      'SYS_Categories'
    );

  var targetDef =
    schema.SYS_Categories;

  var migrated = 0;

  for (
    var i = 0;
    i < source.rows.length;
    i++
  ) {
    var legacyRow =
      source.rows[i];

    var categoryId =
      kidlearnV3_v2m_makeId_(
        targetDef,
        'V2_CATEGORY_' + legacyRow._rowNumber
      );

    var row =
      kidlearnV3_v2m_buildCategoryRow_(
        targetDef,
        legacyRow,
        categoryId
      );

    kidlearnV3_v2m_upsertRow_(
      targetSheet,
      targetDef,
      row
    );

    migrated++;
  }

  return {
    sourceSheet: sourceSheetName,
    status: 'DONE',
    sourceRowCount: source.rows.length,
    insertedOrUpdated: {
      SYS_Categories: migrated
    }
  };
}


/**
 * Migrate LEGACY_V2_Log_HeThong sang LOG_Audit.
 */
function kidlearnV3_v2m_migrateSystemLogs_(
  spreadsheet,
  schema
) {
  var sourceSheetName =
    'LEGACY_V2_Log_HeThong';

  var sourceSheet =
    kidlearnV3_getSheetByExactName_(
      spreadsheet,
      sourceSheetName
    );

  if (!sourceSheet) {
    return kidlearnV3_v2m_reportMissing_(
      sourceSheetName,
      false
    );
  }

  var source =
    kidlearnV3_v2m_readLegacyRows_(
      sourceSheet
    );

  var targetSheet =
    kidlearnV3_getSheetByExactName_(
      spreadsheet,
      'LOG_Audit'
    );

  var targetDef =
    schema.LOG_Audit;

  var migrated = 0;

  for (
    var i = 0;
    i < source.rows.length;
    i++
  ) {
    var legacyRow =
      source.rows[i];

    var auditId =
      kidlearnV3_v2m_makeId_(
        targetDef,
        'V2_LOG_' + legacyRow._rowNumber
      );

    var row =
      kidlearnV3_v2m_buildAuditRow_(
        targetDef,
        legacyRow,
        auditId
      );

    kidlearnV3_v2m_upsertRow_(
      targetSheet,
      targetDef,
      row
    );

    migrated++;
  }

  return {
    sourceSheet: sourceSheetName,
    status: 'DONE',
    sourceRowCount: source.rows.length,
    insertedOrUpdated: {
      LOG_Audit: migrated
    }
  };
}


/**
 * LEGACY_V2_Data_Scores là tùy chọn.
 */
function kidlearnV3_v2m_migrateScoresOptional_(
  spreadsheet,
  schema,
  runtime
) {
  var sourceSheetName =
    'LEGACY_V2_Data_Scores';

  var sourceSheet =
    kidlearnV3_getSheetByExactName_(
      spreadsheet,
      sourceSheetName
    );

  if (!sourceSheet) {
    return kidlearnV3_v2m_reportMissing_(
      sourceSheetName,
      true
    );
  }

  var source =
    kidlearnV3_v2m_readLegacyRows_(
      sourceSheet
    );

  return {
    sourceSheet: sourceSheetName,
    status: 'SKIPPED_FOR_MANUAL_REVIEW',
    sourceRowCount: source.rows.length,
    message:
      'Data_Scores tồn tại nhưng cần mapping riêng sang DATA_Attempts/DATA_Responses.'
  };
}