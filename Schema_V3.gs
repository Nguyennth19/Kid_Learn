/**
 * ================================================================
 * KIDLEARN V3 — DATABASE SCHEMA CONFIGURATION
 * Version: 3.1.0
 * Environment: DEV
 * ================================================================
 *
 * File này chứa:
 * - Thông tin phiên bản
 * - Danh sách Sheet V3
 * - Mapping Sheet V2 sang Legacy
 * - Quy tắc nhận diện môi trường DEV
 *
 * Chưa chứa logic tạo hoặc sửa Sheet.
 */

/**
 * Cấu hình lõi KIDLEARN V3.
 */
const KIDLEARN_V3 = Object.freeze({
  APP_NAME: 'KIDLEARN',
  APP_VERSION: '3.1.0',
  SCHEMA_VERSION: '3.1.0',

  ENVIRONMENT_DEV: 'DEV',

  HEADER_VI_ROW: 1,
  HEADER_KEY_ROW: 2,
  DATA_START_ROW: 3,

  LEGACY_PREFIX: 'LEGACY_V2_',

  SYSTEM_ACTOR: 'SYSTEM',
  MIGRATION_ACTOR: 'MIGRATION',
  SEED_ACTOR: 'SEED_DATA',

  LOCK_TIMEOUT_MS: 30000,

  SCRIPT_PROPERTIES: Object.freeze({
    ENVIRONMENT: 'KIDLEARN_ENVIRONMENT',
    DEV_SPREADSHEET_ID: 'KIDLEARN_DEV_SPREADSHEET_ID',
    SCHEMA_VERSION: 'KIDLEARN_SCHEMA_VERSION',
    APP_VERSION: 'KIDLEARN_APP_VERSION',
    SETUP_STATUS: 'KIDLEARN_SETUP_STATUS',
    LAST_MIGRATION_ID: 'KIDLEARN_LAST_MIGRATION_ID',
    LAST_BACKUP_FILE_ID: 'KIDLEARN_LAST_BACKUP_FILE_ID'
  }),

  SETUP_STATUS: Object.freeze({
    NOT_STARTED: 'NOT_STARTED',
    ENVIRONMENT_REGISTERED: 'ENVIRONMENT_REGISTERED',
    BACKUP_COMPLETED: 'BACKUP_COMPLETED',
    LEGACY_RENAMED: 'LEGACY_RENAMED',
    SHEETS_CREATED: 'SHEETS_CREATED',
    DATA_MIGRATED: 'DATA_MIGRATED',
    SEEDED: 'SEEDED',
    VALIDATED: 'VALIDATED',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED'
  })
});


/**
 * Danh sách 44 Sheet V3 theo đúng thứ tự tạo.
 */
const KIDLEARN_V3_SHEET_ORDER = Object.freeze([
  // Nhóm 1 — Hệ thống và tài khoản
  'SYS_Config',
  'SYS_Categories',
  'SYS_SchemaVersion',
  'SYS_MigrationLog',
  'LOG_Audit',
  'LOG_Errors',

  'DATA_Users',
  'DATA_Children',
  'DATA_UserChildAccess',
  'DATA_Sessions',

  // Nhóm 2 — Chương trình học
  'MST_Subjects',
  'MST_Curriculums',
  'MST_Books',
  'MST_Topics',
  'MST_Lessons',
  'MST_LessonBlocks',
  'MST_Activities',
  'MST_Skills',
  'MST_LessonSkills',
  'MST_MediaAssets',

  // Nhóm 3 — Câu hỏi và đánh giá
  'MST_Questions',
  'MST_QuestionOptions',
  'MST_Assessments',
  'MST_AssessmentQuestions',
  'DATA_Attempts',
  'DATA_Responses',

  // Nhóm 4 — Tiến độ và nhiệm vụ
  'DATA_LessonProgress',
  'DATA_SkillProgress',
  'DATA_StudySessions',
  'DATA_Assignments',
  'DATA_DailyGoals',
  'DATA_ReviewQueue',

  // Nhóm 5 — Thành tích, thư viện và thông báo
  'MST_Achievements',
  'DATA_ChildAchievements',
  'DATA_RewardTransactions',
  'DATA_Streaks',
  'MST_LibraryItems',
  'DATA_LibraryProgress',
  'DATA_Notifications',

  // Nhóm 6 — AI, staging và nhập nội dung
  'STG_ContentImports',
  'STG_Questions',
  'STG_ApprovalQueue',
  'DATA_AIJobs',
  'LOG_AI'
]);


/**
 * Mapping các Sheet V2 sang tên Legacy.
 *
 * Không xóa Sheet V2.
 * Migration chỉ đổi tên để bảo toàn dữ liệu.
 */
const KIDLEARN_V2_LEGACY_SHEET_MAP = Object.freeze({
  Data_Tasks: 'LEGACY_V2_Data_Tasks',
  Data_Users: 'LEGACY_V2_Data_Users',
  Data_Scores: 'LEGACY_V2_Data_Scores',
  Thiet_Lap: 'LEGACY_V2_Thiet_Lap',
  Danh_Muc: 'LEGACY_V2_Danh_Muc',
  Log_HeThong: 'LEGACY_V2_Log_HeThong'
});


/**
 * Hai vai trò chính thức của KIDLEARN V3.
 */
const KIDLEARN_V3_ROLES = Object.freeze({
  CHILD: 'CHILD',
  FAMILY_ADMIN: 'FAMILY_ADMIN'
});


/**
 * Bốn môn học chính thức.
 */
const KIDLEARN_V3_SUBJECTS = Object.freeze([
  Object.freeze({
    subjectId: 'SUB_TV',
    subjectCode: 'TV',
    subjectName: 'Tiếng Việt',
    icon: '📖',
    themeKey: 'GREEN',
    primaryColor: '#16A34A',
    accentColor: '#22C55E',
    sortOrder: 1
  }),

  Object.freeze({
    subjectId: 'SUB_TOAN',
    subjectCode: 'TOAN',
    subjectName: 'Toán học',
    icon: '🧮',
    themeKey: 'BLUE',
    primaryColor: '#2563EB',
    accentColor: '#3B82F6',
    sortOrder: 2
  }),

  Object.freeze({
    subjectId: 'SUB_TA',
    subjectCode: 'TA',
    subjectName: 'Tiếng Anh',
    icon: '🔤',
    themeKey: 'INDIGO',
    primaryColor: '#4F46E5',
    accentColor: '#6366F1',
    sortOrder: 3
  }),

  Object.freeze({
    subjectId: 'SUB_KH',
    subjectCode: 'KH',
    subjectName: 'Khoa học',
    icon: '🔬',
    themeKey: 'TEAL',
    primaryColor: '#0D9488',
    accentColor: '#14B8A6',
    sortOrder: 4
  })
]);


/**
 * Đăng ký Spreadsheet hiện tại là môi trường DEV V3.
 *
 * Chỉ chạy hàm này một lần trên KIDLEARN_DEV_V3.
 */
function kidlearnV3_registerDevEnvironment() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error(
      'Không tìm thấy Spreadsheet đang liên kết với Apps Script.'
    );
  }

  const spreadsheetName = String(spreadsheet.getName() || '');
  const normalizedName = spreadsheetName.toUpperCase();

  if (normalizedName.indexOf('DEV') === -1) {
    throw new Error(
      'DỪNG THỰC THI: Tên Spreadsheet không chứa chữ DEV. ' +
      'Không được đăng ký môi trường V3 trên PROD. ' +
      'Spreadsheet hiện tại: ' + spreadsheetName
    );
  }

  const ui = SpreadsheetApp.getUi();

  const response = ui.alert(
    'Đăng ký môi trường KIDLEARN DEV V3',
    'Spreadsheet hiện tại:\n\n' +
      spreadsheetName +
      '\n\nID:\n' +
      spreadsheet.getId() +
      '\n\n' +
      'Hành động này chỉ lưu cấu hình môi trường. ' +
      'Chưa tạo, xóa hoặc đổi tên bất kỳ Sheet nào.\n\n' +
      'Xác nhận đây là database DEV V3?',
    ui.ButtonSet.YES_NO
  );

  if (response !== ui.Button.YES) {
    return {
      success: false,
      cancelled: true,
      message: 'Người dùng đã hủy đăng ký môi trường DEV.'
    };
  }

  const properties = PropertiesService.getScriptProperties();

  properties.setProperties({
    [KIDLEARN_V3.SCRIPT_PROPERTIES.ENVIRONMENT]:
      KIDLEARN_V3.ENVIRONMENT_DEV,

    [KIDLEARN_V3.SCRIPT_PROPERTIES.DEV_SPREADSHEET_ID]:
      spreadsheet.getId(),

    [KIDLEARN_V3.SCRIPT_PROPERTIES.SCHEMA_VERSION]:
      KIDLEARN_V3.SCHEMA_VERSION,

    [KIDLEARN_V3.SCRIPT_PROPERTIES.APP_VERSION]:
      KIDLEARN_V3.APP_VERSION,

    [KIDLEARN_V3.SCRIPT_PROPERTIES.SETUP_STATUS]:
      KIDLEARN_V3.SETUP_STATUS.ENVIRONMENT_REGISTERED
  }, false);

  const result = {
    success: true,
    environment: KIDLEARN_V3.ENVIRONMENT_DEV,
    spreadsheetName: spreadsheetName,
    spreadsheetId: spreadsheet.getId(),
    appVersion: KIDLEARN_V3.APP_VERSION,
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    setupStatus:
      KIDLEARN_V3.SETUP_STATUS.ENVIRONMENT_REGISTERED,
    sheetCountCurrent: spreadsheet.getSheets().length,
    sheetCountTarget: KIDLEARN_V3_SHEET_ORDER.length
  };

  console.log(JSON.stringify(result, null, 2));

  ui.alert(
    'Đăng ký thành công',
    'Đã khóa Apps Script này với database DEV V3.\n\n' +
      'Schema version: ' +
      KIDLEARN_V3.SCHEMA_VERSION +
      '\n' +
      'Trạng thái: ' +
      KIDLEARN_V3.SETUP_STATUS.ENVIRONMENT_REGISTERED,
    ui.ButtonSet.OK
  );

  return result;
}


/**
 * Kiểm tra Apps Script có đang chạy đúng database DEV đã đăng ký hay không.
 *
 * Hàm này sẽ được gọi trước mọi thao tác:
 * - backup
 * - đổi tên legacy
 * - tạo Sheet
 * - migration
 * - seed dữ liệu
 */
function kidlearnV3_assertDevEnvironment_() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error(
      'Không tìm thấy Spreadsheet đang liên kết với Apps Script.'
    );
  }

  const properties = PropertiesService.getScriptProperties();

  const environment = properties.getProperty(
    KIDLEARN_V3.SCRIPT_PROPERTIES.ENVIRONMENT
  );

  const registeredSpreadsheetId = properties.getProperty(
    KIDLEARN_V3.SCRIPT_PROPERTIES.DEV_SPREADSHEET_ID
  );

  if (environment !== KIDLEARN_V3.ENVIRONMENT_DEV) {
    throw new Error(
      'DỪNG THỰC THI: Apps Script chưa được đăng ký là môi trường DEV.'
    );
  }

  if (!registeredSpreadsheetId) {
    throw new Error(
      'DỪNG THỰC THI: Chưa có DEV Spreadsheet ID trong Script Properties.'
    );
  }

  if (registeredSpreadsheetId !== spreadsheet.getId()) {
    throw new Error(
      'DỪNG THỰC THI: Spreadsheet hiện tại không khớp với database DEV ' +
      'đã đăng ký.\n' +
      'Registered ID: ' +
      registeredSpreadsheetId +
      '\n' +
      'Current ID: ' +
      spreadsheet.getId()
    );
  }

  const spreadsheetName = String(spreadsheet.getName() || '');

  if (spreadsheetName.toUpperCase().indexOf('DEV') === -1) {
    throw new Error(
      'DỪNG THỰC THI: Spreadsheet đã đăng ký nhưng tên hiện tại không còn ' +
      'chứa chữ DEV. Kiểm tra lại trước khi tiếp tục.'
    );
  }

  return {
    spreadsheet: spreadsheet,
    spreadsheetId: spreadsheet.getId(),
    spreadsheetName: spreadsheetName,
    environment: environment,
    schemaVersion: properties.getProperty(
      KIDLEARN_V3.SCRIPT_PROPERTIES.SCHEMA_VERSION
    ),
    setupStatus: properties.getProperty(
      KIDLEARN_V3.SCRIPT_PROPERTIES.SETUP_STATUS
    )
  };
}


/**
 * Xem trước trạng thái môi trường và các Sheet hiện tại.
 *
 * Hàm chỉ đọc dữ liệu, không thay đổi Spreadsheet.
 */
function kidlearnV3_previewEnvironment() {
  const context = kidlearnV3_assertDevEnvironment_();
  const spreadsheet = context.spreadsheet;

  const currentSheetNames = spreadsheet
    .getSheets()
    .map(function (sheet) {
      return sheet.getName();
    });

  const existingV3Sheets = KIDLEARN_V3_SHEET_ORDER.filter(function (name) {
    return currentSheetNames.indexOf(name) !== -1;
  });

  const missingV3Sheets = KIDLEARN_V3_SHEET_ORDER.filter(function (name) {
    return currentSheetNames.indexOf(name) === -1;
  });

  const legacySourceStatus = Object.keys(
    KIDLEARN_V2_LEGACY_SHEET_MAP
  ).map(function (sourceName) {
    const targetName = KIDLEARN_V2_LEGACY_SHEET_MAP[sourceName];

    return {
      sourceName: sourceName,
      sourceExists: currentSheetNames.indexOf(sourceName) !== -1,
      legacyName: targetName,
      legacyExists: currentSheetNames.indexOf(targetName) !== -1
    };
  });

  const report = {
    success: true,
    environment: context.environment,
    spreadsheetName: context.spreadsheetName,
    spreadsheetId: context.spreadsheetId,
    schemaVersion: context.schemaVersion,
    setupStatus: context.setupStatus,

    currentSheetCount: currentSheetNames.length,
    targetV3SheetCount: KIDLEARN_V3_SHEET_ORDER.length,

    currentSheetNames: currentSheetNames,
    existingV3Sheets: existingV3Sheets,
    missingV3Sheets: missingV3Sheets,
    legacySourceStatus: legacySourceStatus
  };

  console.log(JSON.stringify(report, null, 2));

  return report;
}


/**
 * Đọc trạng thái setup hiện tại.
 */
function kidlearnV3_getSetupStatus() {
  const context = kidlearnV3_assertDevEnvironment_();

  return {
    success: true,
    environment: context.environment,
    spreadsheetName: context.spreadsheetName,
    spreadsheetId: context.spreadsheetId,
    appVersion: KIDLEARN_V3.APP_VERSION,
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    setupStatus: context.setupStatus
  };
}


/**
 * Cập nhật trạng thái setup.
 *
 * Chỉ dùng nội bộ.
 */
function kidlearnV3_setSetupStatus_(status) {
  const allowedStatuses = Object.keys(
    KIDLEARN_V3.SETUP_STATUS
  ).map(function (key) {
    return KIDLEARN_V3.SETUP_STATUS[key];
  });

  if (allowedStatuses.indexOf(status) === -1) {
    throw new Error('Setup status không hợp lệ: ' + status);
  }

  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3.SCRIPT_PROPERTIES.SETUP_STATUS,
      status
    );

  return status;
}

/**
 * Đăng ký môi trường DEV V3 không dùng popup UI.
 *
 * Dùng khi chạy từ Apps Script Editor và không muốn dùng Spreadsheet UI alert.
 * Hàm này KHÔNG tạo Sheet, KHÔNG đổi tên Sheet, KHÔNG ghi dữ liệu vào database.
 */
function kidlearnV3_registerDevEnvironmentNoUi() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();

  if (!spreadsheet) {
    throw new Error(
      'Không tìm thấy Spreadsheet đang liên kết với Apps Script.'
    );
  }

  const spreadsheetName = String(spreadsheet.getName() || '');
  const normalizedName = spreadsheetName.toUpperCase();

  if (normalizedName.indexOf('DEV') === -1) {
    throw new Error(
      'DỪNG THỰC THI: Tên Spreadsheet không chứa chữ DEV. ' +
      'Không được đăng ký môi trường V3 trên PROD. ' +
      'Spreadsheet hiện tại: ' + spreadsheetName
    );
  }

  const properties = PropertiesService.getScriptProperties();

  properties.setProperties({
    [KIDLEARN_V3.SCRIPT_PROPERTIES.ENVIRONMENT]:
      KIDLEARN_V3.ENVIRONMENT_DEV,

    [KIDLEARN_V3.SCRIPT_PROPERTIES.DEV_SPREADSHEET_ID]:
      spreadsheet.getId(),

    [KIDLEARN_V3.SCRIPT_PROPERTIES.SCHEMA_VERSION]:
      KIDLEARN_V3.SCHEMA_VERSION,

    [KIDLEARN_V3.SCRIPT_PROPERTIES.APP_VERSION]:
      KIDLEARN_V3.APP_VERSION,

    [KIDLEARN_V3.SCRIPT_PROPERTIES.SETUP_STATUS]:
      KIDLEARN_V3.SETUP_STATUS.ENVIRONMENT_REGISTERED
  }, false);

  const result = {
    success: true,
    message: 'Đã đăng ký môi trường DEV V3 thành công.',
    environment: KIDLEARN_V3.ENVIRONMENT_DEV,
    spreadsheetName: spreadsheetName,
    spreadsheetId: spreadsheet.getId(),
    appVersion: KIDLEARN_V3.APP_VERSION,
    schemaVersion: KIDLEARN_V3.SCHEMA_VERSION,
    setupStatus:
      KIDLEARN_V3.SETUP_STATUS.ENVIRONMENT_REGISTERED,
    currentSheetCount: spreadsheet.getSheets().length,
    targetV3SheetCount: KIDLEARN_V3_SHEET_ORDER.length
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}