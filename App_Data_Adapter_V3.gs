/**
 * ================================================================
 * KIDLEARN V3 - APP DATA ADAPTER
 * Step: 3I.2
 * Version: 3.1.0
 * ================================================================
 *
 * Adapter này là lớp đọc dữ liệu V3 cho App DEV.
 *
 * KHÔNG sửa PROD.
 * KHÔNG ghi dữ liệu.
 * KHÔNG xóa dữ liệu.
 * KHÔNG migration dữ liệu.
 */


var KIDLEARN_V3_ADAPTER_CONFIG = {
  DEFAULT_LIMIT: 5000,
  SAMPLE_LIMIT: 20
};


/**
 * Preview adapter V3.
 */
function kidlearnV3_previewAppDataAdapterV3() {
  var database =
    kidlearnV3_adapterGetDatabase_();

  var subjects =
    kidlearnV3_adapterGetSubjectsV3();

  var users =
    kidlearnV3_adapterGetUsersV3();

  var children =
    kidlearnV3_adapterGetChildrenV3();

  var assignments =
    kidlearnV3_adapterGetAssignmentsV3();

  var config =
    kidlearnV3_adapterGetConfigMapV3();

  var result = {
    success: true,
    action: 'PREVIEW_APP_DATA_ADAPTER_V3',
    databaseSpreadsheetId: database.spreadsheetId,
    databaseSpreadsheetName: database.spreadsheet.getName(),
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    counts: {
      subjects: subjects.length,
      users: users.length,
      children: children.length,
      assignments: assignments.length,
      configKeys: Object.keys(config).length
    },
    availableFunctions: [
      'kidlearnV3_adapterGetBootstrapPayloadV3',
      'kidlearnV3_adapterGetDashboardPayloadV3',
      'kidlearnV3_adapterGetSubjectsV3',
      'kidlearnV3_adapterGetUsersV3',
      'kidlearnV3_adapterGetChildrenV3',
      'kidlearnV3_adapterGetAssignmentsForChildV3',
      'kidlearnV3_adapterReadSheetV3',
      'kidlearnV3_adapterFindByIdV3'
    ]
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Smoke test App Data Adapter V3.
 */
function kidlearnV3_smokeTestAppDataAdapterV3() {
  var bootstrap =
    kidlearnV3_adapterGetBootstrapPayloadV3();

  var errors = [];
  var warnings = [];

  if (bootstrap.subjects.length < 4) {
    errors.push(
      'Adapter phải đọc được ít nhất 4 môn học.'
    );
  }

  if (bootstrap.children.length < 1) {
    errors.push(
      'Adapter chưa đọc được dữ liệu DATA_Children.'
    );
  }

  if (bootstrap.users.length < 1) {
    errors.push(
      'Adapter chưa đọc được dữ liệu DATA_Users.'
    );
  }

  if (bootstrap.assignments.length < 1) {
    warnings.push(
      'DATA_Assignments chưa có dữ liệu hoặc chưa có bài giao cho child hiện tại.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_APP_DATA_ADAPTER_V3',
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    counts: bootstrap.counts,
    selectedChild: bootstrap.selectedChild,
    dashboard: bootstrap.dashboard
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test App Data Adapter V3 chưa đạt. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Payload khởi tạo cho App DEV.
 */
function kidlearnV3_adapterGetBootstrapPayloadV3() {
  var config =
    kidlearnV3_adapterGetConfigMapV3();

  var subjects =
    kidlearnV3_adapterGetSubjectsV3();

  var users =
    kidlearnV3_adapterGetUsersV3();

  var children =
    kidlearnV3_adapterGetChildrenV3();

  var access =
    kidlearnV3_adapterGetUserChildAccessV3();

  var selectedChild =
    kidlearnV3_adapterPickDefaultChild_(
      children
    );

  var selectedChildId =
    selectedChild
      ? selectedChild.childId
      : '';

  var assignments =
    kidlearnV3_adapterGetAssignmentsForChildV3(
      selectedChildId
    );

  var dashboard =
    kidlearnV3_adapterBuildDashboard_(
      selectedChild,
      subjects,
      assignments
    );

  var result = {
    success: true,
    databaseMode: 'V3',
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    appVersion: KIDLEARN_V3.APP_VERSION,
    config: config,
    subjects: subjects,
    users: users,
    children: children,
    access: access,
    selectedChild: selectedChild,
    assignments: assignments,
    dashboard: dashboard,
    counts: {
      subjects: subjects.length,
      users: users.length,
      children: children.length,
      access: access.length,
      assignments: assignments.length,
      configKeys: Object.keys(config).length
    }
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Payload dashboard theo childId.
 */
function kidlearnV3_adapterGetDashboardPayloadV3(
  childId
) {
  var subjects =
    kidlearnV3_adapterGetSubjectsV3();

  var children =
    kidlearnV3_adapterGetChildrenV3();

  var selectedChild =
    kidlearnV3_adapterFindChild_(
      children,
      childId
    );

  if (!selectedChild) {
    selectedChild =
      kidlearnV3_adapterPickDefaultChild_(
        children
      );
  }

  var selectedChildId =
    selectedChild
      ? selectedChild.childId
      : '';

  var assignments =
    kidlearnV3_adapterGetAssignmentsForChildV3(
      selectedChildId
    );

  var dashboard =
    kidlearnV3_adapterBuildDashboard_(
      selectedChild,
      subjects,
      assignments
    );

  var result = {
    success: true,
    childId: selectedChildId,
    selectedChild: selectedChild,
    subjects: subjects,
    assignments: assignments,
    dashboard: dashboard
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Lấy danh sách môn học.
 */
function kidlearnV3_adapterGetSubjectsV3() {
  var rows =
    kidlearnV3_adapterReadRows_(
      'MST_Subjects',
      KIDLEARN_V3_ADAPTER_CONFIG.DEFAULT_LIMIT
    );

  rows =
    kidlearnV3_adapterFilterVisibleRows_(
      rows
    );

  rows =
    kidlearnV3_adapterSortByNumberField_(
      rows,
      'sortOrder'
    );

  var result = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    result.push(
      kidlearnV3_adapterNormalizeSubject_(
        rows[i]
      )
    );
  }

  return result;
}


/**
 * Lấy danh sách user an toàn, không trả credential.
 */
function kidlearnV3_adapterGetUsersV3() {
  var rows =
    kidlearnV3_adapterReadRows_(
      'DATA_Users',
      KIDLEARN_V3_ADAPTER_CONFIG.DEFAULT_LIMIT
    );

  rows =
    kidlearnV3_adapterFilterVisibleRows_(
      rows
    );

  var result = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    result.push(
      kidlearnV3_adapterNormalizeUser_(
        rows[i]
      )
    );
  }

  return result;
}


/**
 * Lấy danh sách trẻ em.
 */
function kidlearnV3_adapterGetChildrenV3() {
  var rows =
    kidlearnV3_adapterReadRows_(
      'DATA_Children',
      KIDLEARN_V3_ADAPTER_CONFIG.DEFAULT_LIMIT
    );

  rows =
    kidlearnV3_adapterFilterVisibleRows_(
      rows
    );

  var result = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    result.push(
      kidlearnV3_adapterNormalizeChild_(
        rows[i]
      )
    );
  }

  return result;
}


/**
 * Lấy quyền truy cập User - Child.
 */
function kidlearnV3_adapterGetUserChildAccessV3() {
  var rows =
    kidlearnV3_adapterReadRows_(
      'DATA_UserChildAccess',
      KIDLEARN_V3_ADAPTER_CONFIG.DEFAULT_LIMIT
    );

  rows =
    kidlearnV3_adapterFilterVisibleRows_(
      rows
    );

  var result = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    result.push(
      kidlearnV3_adapterNormalizeAccess_(
        rows[i]
      )
    );
  }

  return result;
}


/**
 * Lấy toàn bộ assignments.
 */
function kidlearnV3_adapterGetAssignmentsV3() {
  var rows =
    kidlearnV3_adapterReadRows_(
      'DATA_Assignments',
      KIDLEARN_V3_ADAPTER_CONFIG.DEFAULT_LIMIT
    );

  var result = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    result.push(
      kidlearnV3_adapterNormalizeAssignment_(
        rows[i]
      )
    );
  }

  return result;
}


/**
 * Lấy assignments theo childId.
 */
function kidlearnV3_adapterGetAssignmentsForChildV3(
  childId
) {
  var rows =
    kidlearnV3_adapterGetAssignmentsV3();

  var result = [];
  var selectedChildId =
    String(childId || '').trim();

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    if (
      selectedChildId !== '' &&
      String(rows[i].childId || '') !== selectedChildId
    ) {
      continue;
    }

    if (
      kidlearnV3_adapterIsHiddenStatus_(
        rows[i].status
      )
    ) {
      continue;
    }

    result.push(rows[i]);
  }

  return kidlearnV3_adapterSortAssignments_(
    result
  );
}


/**
 * Lấy context family theo userId.
 */
function kidlearnV3_adapterGetFamilyContextV3(
  userId
) {
  var users =
    kidlearnV3_adapterGetUsersV3();

  var children =
    kidlearnV3_adapterGetChildrenV3();

  var access =
    kidlearnV3_adapterGetUserChildAccessV3();

  var currentUser =
    kidlearnV3_adapterFindUser_(
      users,
      userId
    );

  if (!currentUser) {
    currentUser =
      kidlearnV3_adapterPickDefaultUser_(
        users
      );
  }

  var visibleChildren =
    kidlearnV3_adapterChildrenForUser_(
      children,
      access,
      currentUser
    );

  return {
    success: true,
    currentUser: currentUser,
    children: visibleChildren,
    access: access
  };
}


/**
 * Lấy config map.
 */
function kidlearnV3_adapterGetConfigMapV3() {
  var rows =
    kidlearnV3_adapterReadRows_(
      'SYS_Config',
      KIDLEARN_V3_ADAPTER_CONFIG.DEFAULT_LIMIT
    );

  var map = {};

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    var key =
      kidlearnV3_adapterString_(
        rows[i],
        [
          'configKey'
        ],
        ''
      );

    if (key === '') {
      continue;
    }

    var rawValue =
      kidlearnV3_adapterString_(
        rows[i],
        [
          'configValue'
        ],
        ''
      );

    var valueType =
      kidlearnV3_adapterString_(
        rows[i],
        [
          'valueType',
          'configType'
        ],
        'STRING'
      );

    map[key] =
      kidlearnV3_adapterParseConfigValue_(
        rawValue,
        valueType
      );
  }

  return map;
}


/**
 * Generic read API cho UI DEV.
 */
function kidlearnV3_adapterReadSheetV3(
  sheetName,
  options
) {
  var safeOptions =
    options || {};

  var limit =
    Number(
      safeOptions.limit ||
      KIDLEARN_V3_ADAPTER_CONFIG.DEFAULT_LIMIT
    );

  var rows =
    kidlearnV3_adapterReadRows_(
      sheetName,
      limit
    );

  if (safeOptions.activeOnly === true) {
    rows =
      kidlearnV3_adapterFilterVisibleRows_(
        rows
      );
  }

  if (safeOptions.status) {
    rows =
      kidlearnV3_adapterFilterByStatus_(
        rows,
        safeOptions.status
      );
  }

  var result = {
    success: true,
    sheetName: sheetName,
    count: rows.length,
    rows: rows
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Generic find by id/key.
 */
function kidlearnV3_adapterFindByIdV3(
  sheetName,
  key,
  value
) {
  var rows =
    kidlearnV3_adapterReadRows_(
      sheetName,
      KIDLEARN_V3_ADAPTER_CONFIG.DEFAULT_LIMIT
    );

  var expected =
    String(value || '').trim();

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    if (
      String(rows[i][key] || '').trim() === expected
    ) {
      return {
        success: true,
        found: true,
        sheetName: sheetName,
        key: key,
        value: value,
        row: rows[i]
      };
    }
  }

  return {
    success: true,
    found: false,
    sheetName: sheetName,
    key: key,
    value: value,
    row: null
  };
}


/**
 * Lấy database runtime từ 3I.1.
 */
function kidlearnV3_adapterGetDatabase_() {
  if (
    typeof kidlearnV3_appGetActiveDatabaseV3_ !== 'function'
  ) {
    throw new Error(
      'Thiếu 3I.1: kidlearnV3_appGetActiveDatabaseV3_ chưa tồn tại.'
    );
  }

  return kidlearnV3_appGetActiveDatabaseV3_();
}


/**
 * Đọc rows từ một Sheet V3.
 */
function kidlearnV3_adapterReadRows_(
  sheetName,
  limit
) {
  var database =
    kidlearnV3_adapterGetDatabase_();

  return kidlearnV3_appReadSheetObjectsFromDb_(
    database.spreadsheet,
    database.schema,
    sheetName,
    limit || KIDLEARN_V3_ADAPTER_CONFIG.DEFAULT_LIMIT
  );
}


/**
 * Normalize subject.
 */
function kidlearnV3_adapterNormalizeSubject_(
  row
) {
  return {
    subjectId:
      kidlearnV3_adapterString_(
        row,
        ['subjectId'],
        ''
      ),
    subjectCode:
      kidlearnV3_adapterString_(
        row,
        ['subjectCode'],
        ''
      ),
    subjectName:
      kidlearnV3_adapterString_(
        row,
        ['subjectName'],
        ''
      ),
    description:
      kidlearnV3_adapterString_(
        row,
        ['description'],
        ''
      ),
    icon:
      kidlearnV3_adapterString_(
        row,
        ['icon'],
        ''
      ),
    themeKey:
      kidlearnV3_adapterString_(
        row,
        ['themeKey'],
        ''
      ),
    primaryColor:
      kidlearnV3_adapterString_(
        row,
        ['primaryColor'],
        ''
      ),
    accentColor:
      kidlearnV3_adapterString_(
        row,
        ['accentColor'],
        ''
      ),
    sortOrder:
      kidlearnV3_adapterNumber_(
        row,
        ['sortOrder'],
        999
      ),
    status:
      kidlearnV3_adapterString_(
        row,
        ['status'],
        ''
      )
  };
}


/**
 * Normalize user, không trả credential.
 */
function kidlearnV3_adapterNormalizeUser_(
  row
) {
  var role =
    kidlearnV3_adapterString_(
      row,
      ['role', 'userRole'],
      ''
    );

  return {
    userId:
      kidlearnV3_adapterString_(
        row,
        ['userId'],
        ''
      ),
    username:
      kidlearnV3_adapterString_(
        row,
        ['username'],
        ''
      ),
    email:
      kidlearnV3_adapterString_(
        row,
        ['email'],
        ''
      ),
    displayName:
      kidlearnV3_adapterString_(
        row,
        ['displayName', 'fullName'],
        ''
      ),
    fullName:
      kidlearnV3_adapterString_(
        row,
        ['fullName', 'displayName'],
        ''
      ),
    role: role,
    userRole: role,
    status:
      kidlearnV3_adapterString_(
        row,
        ['status'],
        ''
      )
  };
}


/**
 * Normalize child.
 */
function kidlearnV3_adapterNormalizeChild_(
  row
) {
  var name =
    kidlearnV3_adapterString_(
      row,
      ['childName', 'displayName', 'nickname'],
      ''
    );

  return {
    childId:
      kidlearnV3_adapterString_(
        row,
        ['childId'],
        ''
      ),
    childName: name,
    displayName:
      kidlearnV3_adapterString_(
        row,
        ['displayName', 'childName'],
        name
      ),
    nickname:
      kidlearnV3_adapterString_(
        row,
        ['nickname'],
        ''
      ),
    gradeLevel:
      kidlearnV3_adapterNumber_(
        row,
        ['gradeLevel'],
        2
      ),
    status:
      kidlearnV3_adapterString_(
        row,
        ['status'],
        ''
      )
  };
}


/**
 * Normalize user-child access.
 */
function kidlearnV3_adapterNormalizeAccess_(
  row
) {
  var accessId =
    kidlearnV3_adapterString_(
      row,
      [
        'userChildAccessId',
        'accessId'
      ],
      ''
    );

  var role =
    kidlearnV3_adapterString_(
      row,
      [
        'role',
        'accessRole'
      ],
      ''
    );

  return {
    accessId: accessId,
    userChildAccessId: accessId,
    userId:
      kidlearnV3_adapterString_(
        row,
        ['userId'],
        ''
      ),
    childId:
      kidlearnV3_adapterString_(
        row,
        ['childId'],
        ''
      ),
    role: role,
    accessRole: role,
    isPrimary:
      kidlearnV3_adapterBoolean_(
        row,
        ['isPrimary'],
        false
      ),
    status:
      kidlearnV3_adapterString_(
        row,
        ['status'],
        ''
      )
  };
}


/**
 * Normalize assignment.
 */
function kidlearnV3_adapterNormalizeAssignment_(
  row
) {
  return {
    assignmentId:
      kidlearnV3_adapterString_(
        row,
        ['assignmentId'],
        ''
      ),
    childId:
      kidlearnV3_adapterString_(
        row,
        ['childId'],
        ''
      ),
    assignmentType:
      kidlearnV3_adapterString_(
        row,
        ['assignmentType'],
        ''
      ),
    title:
      kidlearnV3_adapterString_(
        row,
        ['title'],
        ''
      ),
    description:
      kidlearnV3_adapterString_(
        row,
        ['description'],
        ''
      ),
    sourceType:
      kidlearnV3_adapterString_(
        row,
        ['sourceType'],
        ''
      ),
    sourceId:
      kidlearnV3_adapterString_(
        row,
        ['sourceId'],
        ''
      ),
    priority:
      kidlearnV3_adapterString_(
        row,
        ['priority'],
        'NORMAL'
      ),
    status:
      kidlearnV3_adapterString_(
        row,
        ['status'],
        ''
      ),
    progressPercent:
      kidlearnV3_adapterNumber_(
        row,
        ['progressPercent'],
        0
      ),
    isRequired:
      kidlearnV3_adapterBoolean_(
        row,
        ['isRequired'],
        false
      ),
    assignedAt:
      kidlearnV3_adapterDateText_(
        row,
        ['assignedAt', 'createdAt']
      ),
    dueAt:
      kidlearnV3_adapterDateText_(
        row,
        ['dueAt', 'dueDate']
      ),
    updatedAt:
      kidlearnV3_adapterDateText_(
        row,
        ['updatedAt']
      )
  };
}


/**
 * Build dashboard đơn giản cho App DEV.
 */
function kidlearnV3_adapterBuildDashboard_(
  selectedChild,
  subjects,
  assignments
) {
  var completed = 0;
  var active = 0;
  var overdue = 0;
  var cancelled = 0;

  for (
    var i = 0;
    i < assignments.length;
    i++
  ) {
    var status =
      String(assignments[i].status || '')
        .toUpperCase();

    if (status === 'COMPLETED') {
      completed++;
      continue;
    }

    if (status === 'OVERDUE') {
      overdue++;
      continue;
    }

    if (
      status === 'CANCELLED' ||
      status === 'ARCHIVED' ||
      status === 'DELETED'
    ) {
      cancelled++;
      continue;
    }

    active++;
  }

  var total =
    assignments.length;

  var completionPercent =
    total > 0
      ? Math.round((completed / total) * 100)
      : 0;

  return {
    childId:
      selectedChild
        ? selectedChild.childId
        : '',
    childName:
      selectedChild
        ? selectedChild.displayName
        : '',
    gradeLevel:
      selectedChild
        ? selectedChild.gradeLevel
        : '',
    subjectCount:
      subjects.length,
    assignmentCount:
      total,
    activeAssignmentCount:
      active,
    completedAssignmentCount:
      completed,
    overdueAssignmentCount:
      overdue,
    cancelledAssignmentCount:
      cancelled,
    completionPercent:
      completionPercent,
    latestAssignments:
      kidlearnV3_adapterTake_(
        assignments,
        10
      )
  };
}


/**
 * Tìm child theo ID.
 */
function kidlearnV3_adapterFindChild_(
  children,
  childId
) {
  var expected =
    String(childId || '').trim();

  if (expected === '') {
    return null;
  }

  for (
    var i = 0;
    i < children.length;
    i++
  ) {
    if (
      String(children[i].childId || '') === expected
    ) {
      return children[i];
    }
  }

  return null;
}


/**
 * Tìm user theo ID.
 */
function kidlearnV3_adapterFindUser_(
  users,
  userId
) {
  var expected =
    String(userId || '').trim();

  if (expected === '') {
    return null;
  }

  for (
    var i = 0;
    i < users.length;
    i++
  ) {
    if (
      String(users[i].userId || '') === expected
    ) {
      return users[i];
    }
  }

  return null;
}


/**
 * Chọn child mặc định.
 */
function kidlearnV3_adapterPickDefaultChild_(
  children
) {
  if (
    !children ||
    children.length === 0
  ) {
    return null;
  }

  return children[0];
}


/**
 * Chọn user mặc định.
 */
function kidlearnV3_adapterPickDefaultUser_(
  users
) {
  if (
    !users ||
    users.length === 0
  ) {
    return null;
  }

  for (
    var i = 0;
    i < users.length;
    i++
  ) {
    var role =
      String(users[i].role || '')
        .toUpperCase();

    if (role === 'FAMILY_ADMIN') {
      return users[i];
    }
  }

  return users[0];
}


/**
 * Lọc children theo quyền user.
 */
function kidlearnV3_adapterChildrenForUser_(
  children,
  access,
  currentUser
) {
  if (!currentUser) {
    return children;
  }

  var userId =
    String(currentUser.userId || '').trim();

  if (userId === '') {
    return children;
  }

  var allowed = {};

  for (
    var i = 0;
    i < access.length;
    i++
  ) {
    if (
      String(access[i].userId || '') === userId
    ) {
      allowed[String(access[i].childId || '')] = true;
    }
  }

  var result = [];

  for (
    var c = 0;
    c < children.length;
    c++
  ) {
    if (
      allowed[String(children[c].childId || '')]
    ) {
      result.push(children[c]);
    }
  }

  if (result.length === 0) {
    return children;
  }

  return result;
}


/**
 * Filter visible rows.
 */
function kidlearnV3_adapterFilterVisibleRows_(
  rows
) {
  var result = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    var status =
      kidlearnV3_adapterString_(
        rows[i],
        ['status'],
        ''
      );

    if (
      kidlearnV3_adapterIsHiddenStatus_(
        status
      )
    ) {
      continue;
    }

    result.push(rows[i]);
  }

  return result;
}


/**
 * Filter status.
 */
function kidlearnV3_adapterFilterByStatus_(
  rows,
  status
) {
  var expected =
    String(status || '').toUpperCase();

  var result = [];

  for (
    var i = 0;
    i < rows.length;
    i++
  ) {
    var actual =
      String(rows[i].status || '')
        .toUpperCase();

    if (actual === expected) {
      result.push(rows[i]);
    }
  }

  return result;
}


/**
 * Hidden status.
 */
function kidlearnV3_adapterIsHiddenStatus_(
  status
) {
  var value =
    String(status || '')
      .toUpperCase();

  return (
    value === 'INACTIVE' ||
    value === 'DELETED' ||
    value === 'ARCHIVED'
  );
}


/**
 * Sort theo number field.
 */
function kidlearnV3_adapterSortByNumberField_(
  rows,
  field
) {
  rows.sort(function(a, b) {
    var av =
      Number(a[field] || 999999);

    var bv =
      Number(b[field] || 999999);

    return av - bv;
  });

  return rows;
}


/**
 * Sort assignments.
 */
function kidlearnV3_adapterSortAssignments_(
  rows
) {
  rows.sort(function(a, b) {
    var ap =
      kidlearnV3_adapterPriorityWeight_(
        a.priority
      );

    var bp =
      kidlearnV3_adapterPriorityWeight_(
        b.priority
      );

    if (ap !== bp) {
      return bp - ap;
    }

    return String(b.assignedAt || '')
      .localeCompare(
        String(a.assignedAt || '')
      );
  });

  return rows;
}


/**
 * Priority weight.
 */
function kidlearnV3_adapterPriorityWeight_(
  priority
) {
  var value =
    String(priority || '')
      .toUpperCase();

  if (value === 'URGENT') {
    return 4;
  }

  if (value === 'HIGH') {
    return 3;
  }

  if (value === 'NORMAL') {
    return 2;
  }

  if (value === 'LOW') {
    return 1;
  }

  return 0;
}


/**
 * Lấy string từ row theo nhiều key.
 */
function kidlearnV3_adapterString_(
  row,
  keys,
  fallback
) {
  for (
    var i = 0;
    i < keys.length;
    i++
  ) {
    var key =
      keys[i];

    if (
      row[key] !== undefined &&
      row[key] !== null &&
      String(row[key]).trim() !== ''
    ) {
      return String(row[key]).trim();
    }
  }

  return fallback || '';
}


/**
 * Lấy number từ row.
 */
function kidlearnV3_adapterNumber_(
  row,
  keys,
  fallback
) {
  var text =
    kidlearnV3_adapterString_(
      row,
      keys,
      ''
    );

  if (text === '') {
    return fallback;
  }

  var number =
    Number(text);

  if (isNaN(number)) {
    return fallback;
  }

  return number;
}


/**
 * Lấy boolean từ row.
 */
function kidlearnV3_adapterBoolean_(
  row,
  keys,
  fallback
) {
  for (
    var i = 0;
    i < keys.length;
    i++
  ) {
    var value =
      row[keys[i]];

    if (value === true) {
      return true;
    }

    if (value === false) {
      return false;
    }

    var text =
      String(value || '')
        .trim()
        .toUpperCase();

    if (
      text === 'TRUE' ||
      text === 'YES' ||
      text === '1'
    ) {
      return true;
    }

    if (
      text === 'FALSE' ||
      text === 'NO' ||
      text === '0'
    ) {
      return false;
    }
  }

  return fallback === true;
}


/**
 * Date text safe.
 */
function kidlearnV3_adapterDateText_(
  row,
  keys
) {
  for (
    var i = 0;
    i < keys.length;
    i++
  ) {
    var value =
      row[keys[i]];

    if (!value) {
      continue;
    }

    if (
      Object.prototype.toString.call(value) === '[object Date]'
    ) {
      return Utilities.formatDate(
        value,
        Session.getScriptTimeZone(),
        'yyyy-MM-dd HH:mm:ss'
      );
    }

    var text =
      String(value).trim();

    if (text !== '') {
      return text;
    }
  }

  return '';
}


/**
 * Parse config value theo type.
 */
function kidlearnV3_adapterParseConfigValue_(
  rawValue,
  valueType
) {
  var type =
    String(valueType || 'STRING')
      .toUpperCase();

  if (type === 'NUMBER') {
    var number =
      Number(rawValue);

    if (!isNaN(number)) {
      return number;
    }

    return 0;
  }

  if (type === 'BOOLEAN') {
    var text =
      String(rawValue || '')
        .toUpperCase();

    return (
      text === 'TRUE' ||
      text === 'YES' ||
      text === '1'
    );
  }

  if (type === 'JSON') {
    try {
      return JSON.parse(
        String(rawValue || '{}')
      );
    } catch (error) {
      return {};
    }
  }

  return rawValue;
}


/**
 * Take N items.
 */
function kidlearnV3_adapterTake_(
  rows,
  limit
) {
  var result = [];
  var max =
    Math.min(
      rows.length,
      Number(limit || 10)
    );

  for (
    var i = 0;
    i < max;
    i++
  ) {
    result.push(rows[i]);
  }

  return result;
}