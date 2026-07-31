/**
 * ================================================================
 * KIDLEARN V3 - FINAL SCHEMA REVIEW
 * Step: 3H.2G
 * Version: 3.1.0
 * ================================================================
 *
 * File này chỉ rà soát schema trước khi viết engine tạo Sheet.
 *
 * KHÔNG tạo Sheet.
 * KHÔNG xóa Sheet.
 * KHÔNG đổi tên Sheet.
 * KHÔNG ghi dữ liệu vào Google Sheets.
 */


/**
 * Hàm chính: rà soát schema cuối trước khi tạo Sheet V3.
 */
function kidlearnV3_reviewSchemaBeforeCreateSheets() {
  kidlearnV3_assertDevEnvironment_();

  var schemaValidation = kidlearnV3_validateSchema_(true);
  var schema = kidlearnV3_buildSchema_();
  var enums = kidlearnV3_buildEnums_();

  var errors = [];
  var warnings = [];
  var notes = [];

  kidlearnV3_reviewSheetCompleteness_(
    schema,
    errors,
    warnings
  );

  kidlearnV3_reviewOfficialRenames_(
    schema,
    errors,
    warnings
  );

  kidlearnV3_reviewPrimaryKeys_(
    schema,
    errors,
    warnings
  );

  kidlearnV3_reviewColumnLabels_(
    schema,
    errors,
    warnings
  );

  kidlearnV3_reviewEnums_(
    enums,
    errors,
    warnings
  );

  kidlearnV3_reviewSecurityColumns_(
    schema,
    errors,
    warnings
  );

  kidlearnV3_reviewActorColumns_(
    schema,
    errors,
    warnings
  );

  kidlearnV3_reviewJsonColumns_(
    schema,
    errors,
    warnings
  );

  kidlearnV3_reviewLegacyV2Blocked_(
    schema,
    errors,
    warnings
  );

  var creationPlan =
    kidlearnV3_buildSheetCreationPlan_(schema);

  notes.push(
    'Schema validation success: ' +
    schemaValidation.success
  );

  notes.push(
    'Tổng số Sheet trong creation plan: ' +
    creationPlan.length
  );

  notes.push(
    'Google Sheet chưa thay đổi ở bước 3H.2G.'
  );

  var passed =
    errors.length === 0 &&
    warnings.length === 0;

  var result = {
    success: passed,
    finalStatus: passed ? 'PASS' : 'NOT_READY',

    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    appVersion: KIDLEARN_V3.APP_VERSION,

    loadedSheetCount: Object.keys(schema).length,
    targetSheetCount: KIDLEARN_V3_SHEET_ORDER.length,

    schemaValidation: {
      success: schemaValidation.success,
      strictMode: schemaValidation.strictMode,
      missingSheets: schemaValidation.missingSheets,
      errorCount: schemaValidation.errorCount,
      warningCount: schemaValidation.warningCount
    },

    reviewErrorCount: errors.length,
    reviewWarningCount: warnings.length,

    errors: errors,
    warnings: warnings,
    notes: notes,

    creationPlan: creationPlan
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!passed) {
    throw new Error(
      'Schema final review chưa đạt. Errors: ' +
      errors.length +
      ', Warnings: ' +
      warnings.length +
      '. Xem Execution log.'
    );
  }

  return result;
}


/**
 * In kế hoạch tạo Sheet theo đúng thứ tự.
 */
function kidlearnV3_printSheetCreationPlan() {
  kidlearnV3_assertDevEnvironment_();

  var schema = kidlearnV3_buildSchema_();
  var plan = kidlearnV3_buildSheetCreationPlan_(schema);

  console.log(
    JSON.stringify(plan, null, 2)
  );

  return plan;
}


/**
 * Tạo danh sách kế hoạch tạo 44 Sheet.
 */
function kidlearnV3_buildSheetCreationPlan_(schema) {
  var plan = [];

  KIDLEARN_V3_SHEET_ORDER.forEach(
    function (sheetName, index) {
      var definition = schema[sheetName];

      if (!definition) {
        plan.push({
          order: index + 1,
          sheetName: sheetName,
          status: 'MISSING'
        });

        return;
      }

      plan.push({
        order: index + 1,
        sheetName: sheetName,
        group: definition.group,
        primaryKey: definition.primaryKey,
        columnCount: definition.columns.length,
        frozenRows: definition.frozenRows,
        createFilter: definition.createFilter,
        status: 'READY'
      });
    }
  );

  return plan;
}


/**
 * Kiểm tra đủ 44 Sheet.
 */
function kidlearnV3_reviewSheetCompleteness_(
  schema,
  errors,
  warnings
) {
  var loadedSheetNames = Object.keys(schema);
  var expectedCount = KIDLEARN_V3_SHEET_ORDER.length;

  if (loadedSheetNames.length !== expectedCount) {
    errors.push(
      'Số lượng Sheet không khớp. Loaded: ' +
      loadedSheetNames.length +
      ', expected: ' +
      expectedCount
    );
  }

  KIDLEARN_V3_SHEET_ORDER.forEach(
    function (sheetName, index) {
      if (!schema[sheetName]) {
        errors.push(
          'Thiếu Sheet ở thứ tự ' +
          (index + 1) +
          ': ' +
          sheetName
        );
      }
    }
  );

  loadedSheetNames.forEach(
    function (sheetName) {
      if (
        KIDLEARN_V3_SHEET_ORDER.indexOf(sheetName) === -1
      ) {
        errors.push(
          'Sheet không nằm trong danh sách chính thức: ' +
          sheetName
        );
      }
    }
  );
}


/**
 * Kiểm tra các đổi tên bắt buộc ở bước 3G.
 */
function kidlearnV3_reviewOfficialRenames_(
  schema,
  errors,
  warnings
) {
  if (schema.DATA_StudentAchievements) {
    errors.push(
      'Không được dùng DATA_StudentAchievements. ' +
      'Tên chính thức là DATA_ChildAchievements.'
    );
  }

  if (!schema.DATA_ChildAchievements) {
    errors.push(
      'Thiếu Sheet DATA_ChildAchievements.'
    );
  }

  if (schema.MST_BookSeries) {
    errors.push(
      'Không được dùng MST_BookSeries. ' +
      'Tên chính thức là MST_Books.'
    );
  }

  if (!schema.MST_Books) {
    errors.push(
      'Thiếu Sheet MST_Books.'
    );
  }

  kidlearnV3_assertSheetHasColumn_(
    schema,
    'DATA_ChildAchievements',
    'childAchievementId',
    errors
  );

  kidlearnV3_assertSheetNotHasColumn_(
    schema,
    'DATA_ChildAchievements',
    'studentAchievementId',
    errors
  );

  kidlearnV3_assertSheetHasColumn_(
    schema,
    'MST_Books',
    'bookId',
    errors
  );

  kidlearnV3_assertSheetHasColumn_(
    schema,
    'MST_Books',
    'bookSeriesCode',
    errors
  );

  kidlearnV3_assertSheetHasColumn_(
    schema,
    'MST_Books',
    'bookSeriesName',
    errors
  );

  kidlearnV3_assertSheetNotHasColumn_(
    schema,
    'MST_Books',
    'bookSeriesId',
    errors
  );

  kidlearnV3_assertSheetNotHasColumn_(
    schema,
    'MST_Books',
    'seriesCode',
    errors
  );

  kidlearnV3_assertSheetNotHasColumn_(
    schema,
    'MST_Books',
    'seriesName',
    errors
  );
}


/**
 * Kiểm tra primary key.
 */
function kidlearnV3_reviewPrimaryKeys_(
  schema,
  errors,
  warnings
) {
  Object.keys(schema).forEach(
    function (sheetName) {
      var definition = schema[sheetName];
      var columns = definition.columns || [];

      if (!definition.primaryKey) {
        errors.push(
          sheetName + ': thiếu primaryKey.'
        );

        return;
      }

      if (columns.length === 0) {
        errors.push(
          sheetName + ': chưa có cột.'
        );

        return;
      }

      if (columns[0].key !== definition.primaryKey) {
        warnings.push(
          sheetName +
          ': primaryKey không nằm ở cột đầu tiên. primaryKey=' +
          definition.primaryKey +
          ', cột đầu=' +
          columns[0].key
        );
      }

      var primaryColumn =
        kidlearnV3_findColumnByKey_(
          definition,
          definition.primaryKey
        );

      if (!primaryColumn) {
        errors.push(
          sheetName +
          ': primaryKey không tồn tại trong columns: ' +
          definition.primaryKey
        );

        return;
      }

      if (
        sheetName !== 'SYS_Config' &&
        primaryColumn.type !== KIDLEARN_V3_DATA_TYPES.ID
      ) {
        errors.push(
          sheetName +
          ': primaryKey nên có type ID. Key: ' +
          definition.primaryKey
        );
      }

      if (primaryColumn.unique !== true) {
        warnings.push(
          sheetName +
          ': primaryKey chưa đánh dấu unique: ' +
          definition.primaryKey
        );
      }

      if (primaryColumn.immutable !== true) {
        warnings.push(
          sheetName +
          ': primaryKey chưa đánh dấu immutable: ' +
          definition.primaryKey
        );
      }
    }
  );
}


/**
 * Kiểm tra trùng tên tiếng Việt và trùng key kỹ thuật.
 */
function kidlearnV3_reviewColumnLabels_(
  schema,
  errors,
  warnings
) {
  Object.keys(schema).forEach(
    function (sheetName) {
      var definition = schema[sheetName];
      var labels = {};
      var keys = {};

      definition.columns.forEach(
        function (column) {
          if (labels[column.labelVi]) {
            warnings.push(
              sheetName +
              ': tên tiếng Việt bị trùng: ' +
              column.labelVi
            );
          }

          labels[column.labelVi] = true;

          if (keys[column.key]) {
            errors.push(
              sheetName +
              ': key kỹ thuật bị trùng: ' +
              column.key
            );
          }

          keys[column.key] = true;
        }
      );
    }
  );
}


/**
 * Kiểm tra enum quan trọng.
 */
function kidlearnV3_reviewEnums_(
  enums,
  errors,
  warnings
) {
  if (!enums.USER_ROLE) {
    errors.push(
      'Thiếu enum USER_ROLE.'
    );
  } else {
    var roles = enums.USER_ROLE.slice().sort();
    var expectedRoles = [
      'CHILD',
      'FAMILY_ADMIN'
    ].sort();

    if (
      JSON.stringify(roles) !==
      JSON.stringify(expectedRoles)
    ) {
      errors.push(
        'USER_ROLE chỉ được gồm CHILD và FAMILY_ADMIN. Hiện tại: ' +
        roles.join(', ')
      );
    }
  }

  var requiredEnums = [
    'CONTENT_STATUS',
    'QUESTION_TYPE',
    'ASSESSMENT_TYPE',
    'ATTEMPT_STATUS',
    'LESSON_PROGRESS_STATUS',
    'ASSIGNMENT_STATUS',
    'REWARD_SOURCE_TYPE',
    'AI_JOB_STATUS'
  ];

  requiredEnums.forEach(
    function (enumKey) {
      if (!enums[enumKey]) {
        errors.push(
          'Thiếu enum bắt buộc: ' + enumKey
        );
      }
    }
  );
}


/**
 * Kiểm tra các cột bảo mật.
 */
function kidlearnV3_reviewSecurityColumns_(
  schema,
  errors,
  warnings
) {
  var forbiddenKeys = [
    'password',
    'rawPassword',
    'pin',
    'rawPin',
    'token',
    'rawToken',
    'apiKey',
    'secretKey'
  ];

  var sensitiveKeys = [
    'credentialHash',
    'credentialSalt',
    'tokenHash',
    'answerKeyJson',
    'acceptedAnswersJson',
    'rubricJson',
    'payloadSummary',
    'aiGradingJson',
    'draftAnswerKeyJson',
    'draftOptionsJson',
    'draftRubricJson',
    'inputSummary',
    'inputJson'
  ];

  Object.keys(schema).forEach(
    function (sheetName) {
      var definition = schema[sheetName];

      definition.columns.forEach(
        function (column) {
          if (forbiddenKeys.indexOf(column.key) !== -1) {
            errors.push(
              sheetName +
              ': không được khai báo cột nhạy cảm dạng thô: ' +
              column.key
            );
          }

          if (
            sensitiveKeys.indexOf(column.key) !== -1 &&
            column.sensitive !== true
          ) {
            warnings.push(
              sheetName +
              ': cột nên đánh dấu sensitive=true: ' +
              column.key
            );
          }
        }
      );
    }
  );

  kidlearnV3_assertSheetHasColumn_(
    schema,
    'DATA_Users',
    'credentialHash',
    errors
  );

  kidlearnV3_assertSheetHasColumn_(
    schema,
    'DATA_Users',
    'credentialSalt',
    errors
  );

  kidlearnV3_assertSheetHasColumn_(
    schema,
    'DATA_Sessions',
    'tokenHash',
    errors
  );

  kidlearnV3_assertSheetNotHasColumn_(
    schema,
    'DATA_Sessions',
    'token',
    errors
  );
}


/**
 * Kiểm tra các cột actor phải là STRING.
 */
function kidlearnV3_reviewActorColumns_(
  schema,
  errors,
  warnings
) {
  var actorKeys = [
    'createdBy',
    'updatedBy',
    'reviewedBy',
    'publishedBy',
    'assignedBy',
    'requestedBy',
    'executedBy',
    'appliedBy',
    'approvedBy'
  ];

  Object.keys(schema).forEach(
    function (sheetName) {
      var definition = schema[sheetName];

      definition.columns.forEach(
        function (column) {
          if (
            actorKeys.indexOf(column.key) !== -1 &&
            column.type !== KIDLEARN_V3_DATA_TYPES.STRING
          ) {
            errors.push(
              sheetName +
              ': cột actor phải là STRING: ' +
              column.key
            );
          }
        }
      );
    }
  );
}


/**
 * Kiểm tra các cột hậu tố Json phải là type JSON.
 */
function kidlearnV3_reviewJsonColumns_(
  schema,
  errors,
  warnings
) {
  Object.keys(schema).forEach(
    function (sheetName) {
      var definition = schema[sheetName];

      definition.columns.forEach(
        function (column) {
          if (
            /Json$/.test(column.key) &&
            column.type !== KIDLEARN_V3_DATA_TYPES.JSON
          ) {
            errors.push(
              sheetName +
              ': cột có hậu tố Json nhưng type không phải JSON: ' +
              column.key
            );
          }
        }
      );
    }
  );
}


/**
 * Kiểm tra không đưa Sheet V2 hoặc Legacy vào schema V3.
 */
function kidlearnV3_reviewLegacyV2Blocked_(
  schema,
  errors,
  warnings
) {
  var forbiddenSheetNames = [
    'Data_Tasks',
    'Data_Scores',
    'Thiet_Lap',
    'Danh_Muc',
    'Log_HeThong',
    'LEGACY_V2_Data_Tasks',
    'LEGACY_V2_Data_Users',
    'LEGACY_V2_Data_Scores',
    'LEGACY_V2_Thiet_Lap',
    'LEGACY_V2_Danh_Muc',
    'LEGACY_V2_Log_HeThong'
  ];

  Object.keys(schema).forEach(
    function (sheetName) {
      if (forbiddenSheetNames.indexOf(sheetName) !== -1) {
        errors.push(
          'Không được đưa Sheet V2/Legacy vào schema V3 chính thức: ' +
          sheetName
        );
      }

      if (sheetName.indexOf('LEGACY_V2_') === 0) {
        errors.push(
          'Không được khai báo Legacy Sheet trong schema V3: ' +
          sheetName
        );
      }
    }
  );

  if (schema.Data_Scores) {
    errors.push(
      'Không được dùng Data_Scores làm nguồn bảng điểm V3. ' +
      'Nguồn chính thức là DATA_Attempts và DATA_Responses.'
    );
  }
}


/**
 * Tìm cột theo key trong một Sheet definition.
 */
function kidlearnV3_findColumnByKey_(
  definition,
  columnKey
) {
  var columns = definition.columns || [];

  for (var i = 0; i < columns.length; i++) {
    if (columns[i].key === columnKey) {
      return columns[i];
    }
  }

  return null;
}


/**
 * Kiểm tra Sheet phải có cột.
 */
function kidlearnV3_assertSheetHasColumn_(
  schema,
  sheetName,
  columnKey,
  errors
) {
  if (!schema[sheetName]) {
    errors.push(
      'Không tìm thấy Sheet để kiểm tra cột: ' +
      sheetName
    );

    return;
  }

  var column =
    kidlearnV3_findColumnByKey_(
      schema[sheetName],
      columnKey
    );

  if (!column) {
    errors.push(
      sheetName +
      ': thiếu cột bắt buộc: ' +
      columnKey
    );
  }
}


/**
 * Kiểm tra Sheet không được có cột cũ.
 */
function kidlearnV3_assertSheetNotHasColumn_(
  schema,
  sheetName,
  columnKey,
  errors
) {
  if (!schema[sheetName]) {
    return;
  }

  var column =
    kidlearnV3_findColumnByKey_(
      schema[sheetName],
      columnKey
    );

  if (column) {
    errors.push(
      sheetName +
      ': không được còn cột cũ: ' +
      columnKey
    );
  }
}