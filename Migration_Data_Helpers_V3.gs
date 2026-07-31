/**
 * ================================================================
 * KIDLEARN V3 - MIGRATION DATA HELPERS
 * Step: 3H.8
 * Version: 3.1.0
 * ================================================================
 */


/**
 * Danh sách nguồn Legacy V2.
 */
function kidlearnV3_v2m_getLegacySources_() {
  return [
    {
      sheetName: 'LEGACY_V2_Data_Users',
      targetSheets: [
        'DATA_Users',
        'DATA_Children',
        'DATA_UserChildAccess'
      ],
      optional: false
    },
    {
      sheetName: 'LEGACY_V2_Data_Tasks',
      targetSheets: [
        'DATA_Assignments'
      ],
      optional: false
    },
    {
      sheetName: 'LEGACY_V2_Thiet_Lap',
      targetSheets: [
        'SYS_Config'
      ],
      optional: false
    },
    {
      sheetName: 'LEGACY_V2_Danh_Muc',
      targetSheets: [
        'SYS_Categories'
      ],
      optional: false
    },
    {
      sheetName: 'LEGACY_V2_Log_HeThong',
      targetSheets: [
        'LOG_Audit'
      ],
      optional: false
    },
    {
      sheetName: 'LEGACY_V2_Data_Scores',
      targetSheets: [
        'DATA_Attempts',
        'DATA_Responses'
      ],
      optional: true
    }
  ];
}


/**
 * Đọc dữ liệu Legacy thành object theo header.
 */
function kidlearnV3_v2m_readLegacyRows_(
  sheet
) {
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();

  if (
    lastRow < 1 ||
    lastColumn < 1
  ) {
    return {
      headerRow: 0,
      headers: [],
      rows: []
    };
  }

  var values =
    sheet
      .getRange(
        1,
        1,
        lastRow,
        lastColumn
      )
      .getDisplayValues();

  var headerRowIndex =
    kidlearnV3_v2m_findHeaderRowIndex_(
      values
    );

  if (headerRowIndex < 0) {
    return {
      headerRow: 0,
      headers: [],
      rows: []
    };
  }

  var headers =
    values[headerRowIndex];

  var normalizedHeaders = [];

  for (
    var h = 0;
    h < headers.length;
    h++
  ) {
    normalizedHeaders.push(
      kidlearnV3_v2m_normalizeHeader_(
        headers[h]
      )
    );
  }

  var rows = [];

  for (
    var r = headerRowIndex + 1;
    r < values.length;
    r++
  ) {
    if (
      !kidlearnV3_v2m_hasData_(
        values[r]
      )
    ) {
      continue;
    }

    var row = {
      _rowNumber: r + 1,
      _raw: {}
    };

    for (
      var c = 0;
      c < headers.length;
      c++
    ) {
      var label =
        String(headers[c] || '').trim();

      var normalized =
        normalizedHeaders[c];

      var value =
        values[r][c];

      if (label !== '') {
        row[label] = value;
      }

      if (normalized !== '') {
        row[normalized] = value;
      }

      row._raw[
        label || ('COL_' + (c + 1))
      ] = value;
    }

    rows.push(row);
  }

  return {
    headerRow: headerRowIndex + 1,
    headers: headers,
    rows: rows
  };
}


/**
 * Tìm dòng header.
 */
function kidlearnV3_v2m_findHeaderRowIndex_(
  values
) {
  var maxRows =
    Math.min(
      values.length,
      5
    );

  for (
    var r = 0;
    r < maxRows;
    r++
  ) {
    var count = 0;

    for (
      var c = 0;
      c < values[r].length;
      c++
    ) {
      if (
        String(values[r][c] || '').trim() !== ''
      ) {
        count++;
      }
    }

    if (count >= 2) {
      return r;
    }
  }

  return -1;
}


/**
 * Kiểm tra một dòng có dữ liệu.
 */
function kidlearnV3_v2m_hasData_(
  rowValues
) {
  for (
    var i = 0;
    i < rowValues.length;
    i++
  ) {
    if (
      String(rowValues[i] || '').trim() !== ''
    ) {
      return true;
    }
  }

  return false;
}


/**
 * Normalize header.
 */
function kidlearnV3_v2m_normalizeHeader_(
  value
) {
  var text =
    String(value || '')
      .trim()
      .toLowerCase();

  try {
    text =
      text
        .normalize('NFD')
        .replace(
          /[\u0300-\u036f]/g,
          ''
        );
  } catch (error) {
    // Ignore normalize errors.
  }

  text =
    text.replace(
      /đ/g,
      'd'
    );

  text =
    text.replace(
      /[^a-z0-9]+/g,
      ''
    );

  return text;
}


/**
 * Lấy giá trị từ legacy row theo nhiều tên cột có thể có.
 */
function kidlearnV3_v2m_pick_(
  legacyRow,
  candidates
) {
  for (
    var i = 0;
    i < candidates.length;
    i++
  ) {
    var candidate =
      candidates[i];

    if (
      legacyRow[candidate] !== undefined &&
      String(legacyRow[candidate]).trim() !== ''
    ) {
      return String(legacyRow[candidate]).trim();
    }

    var normalized =
      kidlearnV3_v2m_normalizeHeader_(
        candidate
      );

    if (
      legacyRow[normalized] !== undefined &&
      String(legacyRow[normalized]).trim() !== ''
    ) {
      return String(legacyRow[normalized]).trim();
    }
  }

  return '';
}


/**
 * Tạo ID hợp lệ theo prefix primary key trong schema.
 */
function kidlearnV3_v2m_makeId_(
  definition,
  suffix
) {
  var prefix =
    kidlearnV3_v2m_getPrimaryPrefix_(
      definition
    );

  var cleanSuffix =
    kidlearnV3_v2m_code_(
      suffix
    );

  return prefix + cleanSuffix;
}


/**
 * Lấy prefix của primary key.
 */
function kidlearnV3_v2m_getPrimaryPrefix_(
  definition
) {
  var primaryColumn =
    kidlearnV3_v2m_findColumn_(
      definition,
      definition.primaryKey
    );

  if (
    primaryColumn &&
    primaryColumn.validation &&
    primaryColumn.validation.prefix
  ) {
    return primaryColumn.validation.prefix;
  }

  var sheetName =
    definition.sheetName || '';

  var fallback = {
    DATA_Users: 'USR_',
    DATA_Children: 'CHILD_',
    DATA_UserChildAccess: 'UCA_',
    DATA_Assignments: 'ASG_',
    SYS_Categories: 'CAT_',
    LOG_Audit: 'AUD_',
    SYS_MigrationLog: 'MIG_'
  };

  return fallback[sheetName] || 'ID_';
}


/**
 * Chuẩn hóa code.
 */
function kidlearnV3_v2m_code_(
  value
) {
  var text =
    String(value || '')
      .trim()
      .toUpperCase();

  try {
    text =
      text
        .normalize('NFD')
        .replace(
          /[\u0300-\u036f]/g,
          ''
        );
  } catch (error) {
    // Ignore normalize errors.
  }

  text =
    text.replace(
      /Đ/g,
      'D'
    );

  text =
    text.replace(
      /[^A-Z0-9]+/g,
      '_'
    );

  text =
    text.replace(
      /^_+|_+$/g,
      ''
    );

  if (text === '') {
    text = 'UNKNOWN';
  }

  return text;
}


/**
 * Tìm column definition.
 */
function kidlearnV3_v2m_findColumn_(
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
      return columns[i];
    }
  }

  return null;
}


/**
 * Kiểm tra Sheet có column key không.
 */
function kidlearnV3_v2m_hasColumn_(
  definition,
  key
) {
  return (
    kidlearnV3_v2m_findColumn_(
      definition,
      key
    ) !== null
  );
}


/**
 * Set field nếu schema có cột đó.
 */
function kidlearnV3_v2m_set_(
  definition,
  row,
  key,
  value
) {
  if (
    kidlearnV3_v2m_hasColumn_(
      definition,
      key
    )
  ) {
    row[key] = value;
  }
}


/**
 * Build DATA_Users row.
 */
function kidlearnV3_v2m_buildUserRow_(
  definition,
  legacyRow,
  userId,
  role
) {
  var now = new Date();
  var row = {};

  row[definition.primaryKey] =
    userId;

  var displayName =
    kidlearnV3_v2m_pick_(
      legacyRow,
      [
        'displayName',
        'fullName',
        'name',
        'ten',
        'ho ten',
        'ten nguoi dung',
        'username',
        'userName'
      ]
    );

  if (!displayName) {
    displayName =
      'Legacy User ' +
      legacyRow._rowNumber;
  }

  var email =
    kidlearnV3_v2m_pick_(
      legacyRow,
      [
        'email',
        'mail',
        'gmail'
      ]
    );

  var username =
    kidlearnV3_v2m_pick_(
      legacyRow,
      [
        'username',
        'userName',
        'account',
        'tai khoan'
      ]
    );

  if (!username) {
    username =
      'legacy_user_' +
      legacyRow._rowNumber;
  }

  kidlearnV3_v2m_set_(
    definition,
    row,
    'userId',
    userId
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'username',
    username
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'email',
    email
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'displayName',
    displayName
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'fullName',
    displayName
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'role',
    role
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'userRole',
    role
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'credentialHash',
    'MIGRATED_LEGACY_NO_CREDENTIAL'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'credentialSalt',
    'MIGRATED'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'status',
    'ACTIVE'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'createdAt',
    now
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'updatedAt',
    now
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'createdBy',
    'MIGRATION_V2'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'updatedBy',
    'MIGRATION_V2'
  );

  return row;
}


/**
 * Build DATA_Children row.
 */
function kidlearnV3_v2m_buildChildRow_(
  definition,
  legacyRow,
  childId
) {
  var now = new Date();
  var row = {};

  row[definition.primaryKey] =
    childId;

  var childName =
    kidlearnV3_v2m_pick_(
      legacyRow,
      [
        'childName',
        'studentName',
        'displayName',
        'fullName',
        'name',
        'ten be',
        'ten hoc sinh',
        'ho ten',
        'ten'
      ]
    );

  if (!childName) {
    childName =
      'Bé V2 ' +
      legacyRow._rowNumber;
  }

  var grade =
    kidlearnV3_v2m_pick_(
      legacyRow,
      [
        'gradeLevel',
        'grade',
        'class',
        'lop',
        'khoi lop'
      ]
    );

  if (!grade) {
    grade = '2';
  }

  kidlearnV3_v2m_set_(
    definition,
    row,
    'childId',
    childId
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'childName',
    childName
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'displayName',
    childName
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'nickname',
    childName
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'gradeLevel',
    Number(grade) || 2
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'status',
    'ACTIVE'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'createdAt',
    now
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'updatedAt',
    now
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'createdBy',
    'MIGRATION_V2'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'updatedBy',
    'MIGRATION_V2'
  );

  return row;
}


/**
 * Default child nếu V2 không có child rõ ràng.
 */
function kidlearnV3_v2m_buildDefaultChildRow_(
  definition,
  childId
) {
  var now = new Date();
  var row = {};

  row[definition.primaryKey] =
    childId;

  kidlearnV3_v2m_set_(
    definition,
    row,
    'childId',
    childId
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'childName',
    'Bé mặc định từ V2'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'displayName',
    'Bé mặc định từ V2'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'nickname',
    'Bé'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'gradeLevel',
    2
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'status',
    'ACTIVE'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'createdAt',
    now
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'updatedAt',
    now
  );

  return row;
}


/**
 * Default family admin nếu V2 không có admin rõ ràng.
 */
function kidlearnV3_v2m_buildDefaultAdminRow_(
  definition,
  userId
) {
  var now = new Date();
  var row = {};

  row[definition.primaryKey] =
    userId;

  kidlearnV3_v2m_set_(
    definition,
    row,
    'userId',
    userId
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'username',
    'legacy_family_admin'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'displayName',
    'Family Admin từ V2'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'fullName',
    'Family Admin từ V2'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'role',
    'FAMILY_ADMIN'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'userRole',
    'FAMILY_ADMIN'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'credentialHash',
    'MIGRATED_LEGACY_NO_CREDENTIAL'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'credentialSalt',
    'MIGRATED'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'status',
    'ACTIVE'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'createdAt',
    now
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'updatedAt',
    now
  );

  return row;
}


/**
 * Tạo access giữa family admin và child.
 */
function kidlearnV3_v2m_createUserChildAccess_(
  sheet,
  definition,
  runtime
) {
  var count = 0;
  var now = new Date();

  for (
    var i = 0;
    i < runtime.familyAdminUserIds.length;
    i++
  ) {
    for (
      var j = 0;
      j < runtime.childIds.length;
      j++
    ) {
      var userId =
        runtime.familyAdminUserIds[i];

      var childId =
        runtime.childIds[j];

      var accessId =
        kidlearnV3_v2m_makeId_(
          definition,
          'V2_ACCESS_' +
          kidlearnV3_v2m_code_(userId) +
          '_' +
          kidlearnV3_v2m_code_(childId)
        );

      var row = {};

      row[definition.primaryKey] =
        accessId;

      kidlearnV3_v2m_set_(
        definition,
        row,
        'accessId',
        accessId
      );

      kidlearnV3_v2m_set_(
        definition,
        row,
        'userChildAccessId',
        accessId
      );

      kidlearnV3_v2m_set_(
        definition,
        row,
        'userId',
        userId
      );

      kidlearnV3_v2m_set_(
        definition,
        row,
        'childId',
        childId
      );

      kidlearnV3_v2m_set_(
        definition,
        row,
        'role',
        'FAMILY_ADMIN'
      );

      kidlearnV3_v2m_set_(
        definition,
        row,
        'accessRole',
        'FAMILY_ADMIN'
      );

      kidlearnV3_v2m_set_(
        definition,
        row,
        'isPrimary',
        true
      );

      kidlearnV3_v2m_set_(
        definition,
        row,
        'status',
        'ACTIVE'
      );

      kidlearnV3_v2m_set_(
        definition,
        row,
        'createdAt',
        now
      );

      kidlearnV3_v2m_set_(
        definition,
        row,
        'updatedAt',
        now
      );

      kidlearnV3_v2m_upsertRow_(
        sheet,
        definition,
        row
      );

      count++;
    }
  }

  return count;
}


/**
 * Build DATA_Assignments row.
 */
function kidlearnV3_v2m_buildAssignmentRow_(
  definition,
  legacyRow,
  assignmentId,
  defaultChildId
) {
  var now = new Date();
  var row = {};

  row[definition.primaryKey] =
    assignmentId;

  var title =
    kidlearnV3_v2m_pick_(
      legacyRow,
      [
        'title',
        'taskTitle',
        'taskName',
        'ten nhiem vu',
        'noi dung',
        'bai tap',
        'name'
      ]
    );

  if (!title) {
    title =
      'Nhiệm vụ V2 dòng ' +
      legacyRow._rowNumber;
  }

  var status =
    kidlearnV3_v2m_inferAssignmentStatus_(
      legacyRow
    );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'assignmentId',
    assignmentId
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'childId',
    defaultChildId
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'assignmentType',
    'CUSTOM'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'title',
    title
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'description',
    kidlearnV3_v2m_jsonSummary_(
      legacyRow._raw
    )
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'sourceType',
    'MANUAL'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'sourceId',
    'LEGACY_V2_ROW_' +
    legacyRow._rowNumber
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'priority',
    'NORMAL'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'status',
    status
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'progressPercent',
    status === 'COMPLETED' ? 100 : 0
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'isRequired',
    true
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'assignedBy',
    'MIGRATION_V2'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'assignedAt',
    now
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'createdAt',
    now
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'updatedAt',
    now
  );

  return row;
}


/**
 * Build SYS_Config row.
 */
function kidlearnV3_v2m_buildConfigRow_(
  definition,
  legacyRow,
  configKey
) {
  var now = new Date();
  var row = {};

  row[definition.primaryKey] =
    configKey;

  var value =
    kidlearnV3_v2m_pick_(
      legacyRow,
      [
        'configValue',
        'value',
        'gia tri',
        'noi dung',
        'settingValue'
      ]
    );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'configKey',
    configKey
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'configValue',
    value
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'valueType',
    'STRING'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'configType',
    'STRING'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'categoryCode',
    'MIGRATION_V2'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'description',
    'Migrated from LEGACY_V2_Thiet_Lap row ' +
    legacyRow._rowNumber
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'isActive',
    true
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'status',
    'ACTIVE'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'createdAt',
    now
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'updatedAt',
    now
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'updatedBy',
    'MIGRATION_V2'
  );

  return row;
}


/**
 * Build SYS_Categories row.
 */
function kidlearnV3_v2m_buildCategoryRow_(
  definition,
  legacyRow,
  categoryId
) {
  var now = new Date();
  var row = {};

  row[definition.primaryKey] =
    categoryId;

  var name =
    kidlearnV3_v2m_pick_(
      legacyRow,
      [
        'categoryName',
        'name',
        'ten danh muc',
        'danh muc',
        'label'
      ]
    );

  if (!name) {
    name =
      'Danh mục V2 ' +
      legacyRow._rowNumber;
  }

  var code =
    kidlearnV3_v2m_pick_(
      legacyRow,
      [
        'categoryCode',
        'code',
        'ma danh muc',
        'ma'
      ]
    );

  if (!code) {
    code =
      'V2_CATEGORY_' +
      legacyRow._rowNumber;
  }

  kidlearnV3_v2m_set_(
    definition,
    row,
    'categoryId',
    categoryId
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'categoryCode',
    kidlearnV3_v2m_code_(code)
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'categoryName',
    name
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'categoryType',
    'MIGRATION'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'description',
    kidlearnV3_v2m_jsonSummary_(
      legacyRow._raw
    )
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'sortOrder',
    legacyRow._rowNumber
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'status',
    'ACTIVE'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'createdAt',
    now
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'updatedAt',
    now
  );

  return row;
}


/**
 * Build LOG_Audit row.
 */
function kidlearnV3_v2m_buildAuditRow_(
  definition,
  legacyRow,
  auditId
) {
  var now = new Date();
  var row = {};

  row[definition.primaryKey] =
    auditId;

  var message =
    kidlearnV3_v2m_pick_(
      legacyRow,
      [
        'message',
        'noi dung',
        'log',
        'description',
        'mo ta',
        'event'
      ]
    );

  if (!message) {
    message =
      kidlearnV3_v2m_jsonSummary_(
        legacyRow._raw
      );
  }

  kidlearnV3_v2m_set_(
    definition,
    row,
    'auditId',
    auditId
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'timestamp',
    now
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'eventType',
    'MIGRATION'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'actorType',
    'SYSTEM'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'actorId',
    'MIGRATION_V2'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'action',
    'MIGRATE_LEGACY_LOG'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'entityType',
    'LEGACY_V2_Log_HeThong'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'entityId',
    'ROW_' + legacyRow._rowNumber
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'message',
    message
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'payloadSummary',
    kidlearnV3_v2m_jsonSummary_(
      legacyRow._raw
    )
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'createdAt',
    now
  );

  return row;
}


/**
 * Upsert row theo primary key.
 */
function kidlearnV3_v2m_upsertRow_(
  sheet,
  definition,
  rowObject
) {
  if (
    !sheet ||
    !definition
  ) {
    return {
      action: 'SKIPPED',
      reason: 'SHEET_OR_SCHEMA_MISSING'
    };
  }

  var primaryKey =
    definition.primaryKey;

  var primaryValue =
    String(rowObject[primaryKey] || '').trim();

  if (!primaryValue) {
    return {
      action: 'SKIPPED',
      reason: 'PRIMARY_VALUE_EMPTY'
    };
  }

  var rowValues =
    kidlearnV3_v2m_buildRowValues_(
      definition,
      rowObject
    );

  var rowNumber =
    kidlearnV3_v2m_findRowByPrimary_(
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
    rowNumber: nextRow
  };
}


/**
 * Build row values theo schema.
 */
function kidlearnV3_v2m_buildRowValues_(
  definition,
  rowObject
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
      rowObject[column.key] !== undefined
    ) {
      values.push(
        rowObject[column.key]
      );
    } else {
      values.push(
        kidlearnV3_v2m_defaultValue_(
          column
        )
      );
    }
  }

  return values;
}


/**
 * Default value theo schema.
 */
function kidlearnV3_v2m_defaultValue_(
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
    return kidlearnV3_v2m_today_();
  }

  if (
    D &&
    value === D.SYSTEM
  ) {
    return 'MIGRATION_V2';
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
 * Tìm dòng theo primary key.
 */
function kidlearnV3_v2m_findRowByPrimary_(
  sheet,
  definition,
  primaryValue
) {
  var columnIndex =
    kidlearnV3_v2m_columnIndex_(
      definition,
      definition.primaryKey
    );

  if (columnIndex < 1) {
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
        columnIndex,
        lastRow - 2,
        1
      )
      .getDisplayValues();

  for (
    var i = 0;
    i < values.length;
    i++
  ) {
    if (
      String(values[i][0] || '').trim() ===
      String(primaryValue)
    ) {
      return i + 3;
    }
  }

  return 0;
}


/**
 * Tìm index cột.
 */
function kidlearnV3_v2m_columnIndex_(
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
      return i + 1;
    }
  }

  return 0;
}


/**
 * Infer role từ V2.
 */
function kidlearnV3_v2m_inferRole_(
  legacyRow
) {
  var role =
    kidlearnV3_v2m_pick_(
      legacyRow,
      [
        'role',
        'userRole',
        'vai tro',
        'loai nguoi dung',
        'type'
      ]
    );

  var normalized =
    kidlearnV3_v2m_normalizeHeader_(
      role
    );

  if (
    normalized.indexOf('child') !== -1 ||
    normalized.indexOf('student') !== -1 ||
    normalized.indexOf('hocsinh') !== -1 ||
    normalized.indexOf('be') !== -1
  ) {
    return 'CHILD';
  }

  return 'FAMILY_ADMIN';
}


/**
 * Có nên tạo child từ legacy row không.
 */
function kidlearnV3_v2m_shouldCreateChild_(
  legacyRow,
  role
) {
  if (role === 'CHILD') {
    return true;
  }

  var childName =
    kidlearnV3_v2m_pick_(
      legacyRow,
      [
        'childName',
        'studentName',
        'ten be',
        'ten hoc sinh',
        'lop',
        'grade',
        'gradeLevel'
      ]
    );

  return childName !== '';
}


/**
 * Infer assignment status.
 */
function kidlearnV3_v2m_inferAssignmentStatus_(
  legacyRow
) {
  var status =
    kidlearnV3_v2m_pick_(
      legacyRow,
      [
        'status',
        'trang thai',
        'done',
        'completed',
        'isDone'
      ]
    );

  var normalized =
    kidlearnV3_v2m_normalizeHeader_(
      status
    );

  if (
    normalized === 'true' ||
    normalized.indexOf('done') !== -1 ||
    normalized.indexOf('complete') !== -1 ||
    normalized.indexOf('hoanthanh') !== -1
  ) {
    return 'COMPLETED';
  }

  if (
    normalized.indexOf('cancel') !== -1 ||
    normalized.indexOf('huy') !== -1
  ) {
    return 'CANCELLED';
  }

  if (
    normalized.indexOf('overdue') !== -1 ||
    normalized.indexOf('trehan') !== -1
  ) {
    return 'OVERDUE';
  }

  return 'ASSIGNED';
}


/**
 * JSON summary ngắn.
 */
function kidlearnV3_v2m_jsonSummary_(
  objectValue
) {
  var text = '';

  try {
    text =
      JSON.stringify(objectValue);
  } catch (error) {
    text =
      String(objectValue || '');
  }

  if (text.length > 2500) {
    text =
      text.substring(0, 2500);
  }

  return text;
}


/**
 * Date hôm nay.
 */
function kidlearnV3_v2m_today_() {
  var now = new Date();

  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
}


/**
 * Report missing source.
 */
function kidlearnV3_v2m_reportMissing_(
  sourceSheetName,
  optional
) {
  return {
    sourceSheet: sourceSheetName,
    status: optional ? 'OPTIONAL_MISSING' : 'MISSING',
    sourceRowCount: 0,
    message: optional
      ? 'Sheet Legacy tùy chọn không tồn tại.'
      : 'Thiếu Sheet Legacy bắt buộc.'
  };
}


/**
 * Tóm tắt report.
 */
function kidlearnV3_v2m_summarizeReport_(
  report
) {
  var summary = {
    sourceCount: report.length,
    missingCount: 0,
    optionalMissingCount: 0,
    doneCount: 0,
    skippedCount: 0
  };

  for (
    var i = 0;
    i < report.length;
    i++
  ) {
    if (
      report[i].status === 'MISSING'
    ) {
      summary.missingCount++;
    }

    if (
      report[i].status === 'OPTIONAL_MISSING'
    ) {
      summary.optionalMissingCount++;
    }

    if (
      report[i].status === 'DONE'
    ) {
      summary.doneCount++;
    }

    if (
      String(report[i].status).indexOf('SKIPPED') === 0
    ) {
      summary.skippedCount++;
    }
  }

  return summary;
}


/**
 * Ghi summary vào SYS_MigrationLog.
 */
function kidlearnV3_v2m_writeMigrationSummary_(
  spreadsheet,
  schema,
  summary
) {
  var sheet =
    kidlearnV3_getSheetByExactName_(
      spreadsheet,
      'SYS_MigrationLog'
    );

  var definition =
    schema.SYS_MigrationLog;

  if (
    !sheet ||
    !definition
  ) {
    return;
  }

  var now = new Date();

  var migrationId =
    kidlearnV3_v2m_makeId_(
      definition,
      'V2_TO_V3_' +
      Utilities.formatDate(
        now,
        Session.getScriptTimeZone(),
        'yyyyMMdd_HHmmss'
      )
    );

  var row = {};

  row[definition.primaryKey] =
    migrationId;

  kidlearnV3_v2m_set_(
    definition,
    row,
    'migrationId',
    migrationId
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'migrationName',
    'V2_TO_V3_DATA_MIGRATION'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'sourceVersion',
    'V2'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'targetVersion',
    KIDLEARN_V3.SCHEMA_VERSION
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'status',
    summary.missingCount === 0
      ? 'COMPLETED'
      : 'PARTIAL'
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'message',
    kidlearnV3_v2m_jsonSummary_(
      summary
    )
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'startedAt',
    now
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'completedAt',
    now
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'createdAt',
    now
  );

  kidlearnV3_v2m_set_(
    definition,
    row,
    'createdBy',
    'MIGRATION_V2'
  );

  kidlearnV3_v2m_upsertRow_(
    sheet,
    definition,
    row
  );
}


/**
 * Mark setup status sau migration.
 * Ghi trực tiếp vào ScriptProperties để không bị chặn bởi enum setup status cũ.
 */
function kidlearnV3_v2m_markMigratedSafe_() {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3.SCRIPT_PROPERTIES.SETUP_STATUS,
    'V2_DATA_MIGRATED'
  );

  properties.setProperty(
    'KIDLEARN_V3_DATA_MIGRATED_AT',
    new Date().toISOString()
  );
}