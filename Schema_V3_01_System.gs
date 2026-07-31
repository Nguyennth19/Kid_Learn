/**
 * ================================================================
 * KIDLEARN V3 - SCHEMA GROUP 01
 * HỆ THỐNG VÀ TÀI KHOẢN
 * Version: 3.1.0
 * ================================================================
 */


/**
 * Enum của nhóm hệ thống và tài khoản.
 */
function kidlearnV3_enumGroup01System_() {
  return {
    CONFIG_VALUE_TYPE: [
      'STRING',
      'NUMBER',
      'BOOLEAN',
      'JSON'
    ],

    CONFIG_STATUS: [
      'ACTIVE',
      'INACTIVE'
    ],

    CATEGORY_STATUS: [
      'ACTIVE',
      'INACTIVE'
    ],

    SCHEMA_STATUS: [
      'ACTIVE',
      'SUPERSEDED'
    ],

    MIGRATION_STATUS: [
      'STARTED',
      'COMPLETED',
      'COMPLETED_WITH_WARNINGS',
      'FAILED',
      'ROLLED_BACK'
    ],

    AUDIT_RESULT_STATUS: [
      'SUCCESS',
      'WARNING',
      'FAILED',
      'DENIED'
    ],

    ERROR_SOURCE: [
      'BACKEND',
      'FRONTEND',
      'MIGRATION',
      'AI',
      'TRIGGER',
      'INTEGRATION'
    ],

    ERROR_SEVERITY: [
      'INFO',
      'WARNING',
      'ERROR',
      'CRITICAL'
    ],

    ERROR_STATUS: [
      'OPEN',
      'INVESTIGATING',
      'RESOLVED',
      'IGNORED'
    ],

    USER_ROLE: [
      'CHILD',
      'FAMILY_ADMIN'
    ],

    USER_STATUS: [
      'ACTIVE',
      'INACTIVE',
      'LOCKED'
    ],

    LOGIN_METHOD: [
      'PIN',
      'PASSWORD'
    ],

    ACCESS_TYPE: [
      'SELF',
      'FAMILY_ADMIN'
    ],

    ACCESS_STATUS: [
      'ACTIVE',
      'INACTIVE'
    ],

    SESSION_STATUS: [
      'ACTIVE',
      'EXPIRED',
      'REVOKED'
    ]
  };
}


/**
 * Schema của 10 Sheet nhóm hệ thống và tài khoản.
 */
function kidlearnV3_schemaGroup01System_() {
  var T = KIDLEARN_V3_DATA_TYPES;
  var D = KIDLEARN_V3_DEFAULTS;

  var C = kidlearnV3_column_;
  var E = kidlearnV3_validationEnum_;
  var ID = kidlearnV3_validationId_;
  var REF = kidlearnV3_validationReference_;
  var INTEGER = kidlearnV3_validationInteger_;
  var EMAIL = kidlearnV3_validationEmail_;
  var JSON_VALUE = kidlearnV3_validationJson_;
  var REGEX = kidlearnV3_validationRegex_;
  var SHEET = kidlearnV3_sheetDefinition_;

  var schema = {};


  /**
   * ==============================================================
   * 1. SYS_Config
   * ==============================================================
   */
  schema.SYS_Config = SHEET({
    group: 'SYSTEM',

    description:
      'Cấu hình hệ thống KIDLEARN V3.',

    primaryKey: 'configKey',

    uniqueKeys: [
      ['configKey']
    ],

    logicalIndexes: [
      'configKey',
      'configGroup',
      'isPublic',
      'status'
    ],

    retentionPolicy:
      'Không xóa vật lý cấu hình đã được sử dụng.',

    columns: [
      C(
        'Mã cấu hình',
        'configKey',
        T.STRING,
        true,
        '',
        REGEX(
          '^[A-Z][A-Z0-9_]*$',
          'Mã cấu hình dùng chữ in hoa và dấu gạch dưới.'
        ),
        {
          unique: true,
          indexed: true,
          immutable: true,
          maxLength: 100
        }
      ),

      C(
        'Giá trị',
        'configValue',
        T.STRING,
        true,
        '',
        null,
        {
          maxLength: 5000
        }
      ),

      C(
        'Kiểu dữ liệu',
        'valueType',
        T.ENUM,
        true,
        'STRING',
        E('CONFIG_VALUE_TYPE')
      ),

      C(
        'Nhóm cấu hình',
        'configGroup',
        T.STRING,
        true,
        'SYSTEM',
        REGEX(
          '^[A-Z][A-Z0-9_]*$',
          'Nhóm cấu hình dùng chữ in hoa.'
        ),
        {
          indexed: true,
          maxLength: 100
        }
      ),

      C(
        'Mô tả',
        'description',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 1000
        }
      ),

      C(
        'Cho phép gửi frontend',
        'isPublic',
        T.BOOLEAN,
        true,
        false,
        null,
        {
          indexed: true
        }
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'ACTIVE',
        E('CONFIG_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Cập nhật lúc',
        'updatedAt',
        T.DATETIME,
        true,
        D.NOW,
        null
      ),

      C(
        'Cập nhật bởi',
        'updatedBy',
        T.STRING,
        true,
        D.SYSTEM,
        null,
        {
          maxLength: 100
        }
      )
    ]
  });


  /**
   * ==============================================================
   * 2. SYS_Categories
   * ==============================================================
   */
  schema.SYS_Categories = SHEET({
    group: 'SYSTEM',

    description:
      'Danh mục và enum dùng chung của hệ thống.',

    primaryKey: 'categoryId',

    uniqueKeys: [
      ['categoryId'],
      ['categoryType', 'code']
    ],

    logicalIndexes: [
      'categoryId',
      'categoryType',
      'code',
      'status'
    ],

    retentionPolicy:
      'Chuyển INACTIVE thay vì xóa giá trị đã được sử dụng.',

    columns: [
      C(
        'Mã danh mục',
        'categoryId',
        T.ID,
        true,
        '',
        ID('CAT_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Loại danh mục',
        'categoryType',
        T.STRING,
        true,
        '',
        REGEX(
          '^[A-Z][A-Z0-9_]*$',
          'Loại danh mục dùng chữ in hoa.'
        ),
        {
          indexed: true,
          maxLength: 100
        }
      ),

      C(
        'Mã giá trị',
        'code',
        T.STRING,
        true,
        '',
        REGEX(
          '^[A-Z][A-Z0-9_]*$',
          'Mã giá trị dùng chữ in hoa.'
        ),
        {
          indexed: true,
          maxLength: 100
        }
      ),

      C(
        'Tên hiển thị',
        'label',
        T.STRING,
        true,
        '',
        null,
        {
          maxLength: 200
        }
      ),

      C(
        'Mô tả',
        'description',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 1000
        }
      ),

      C(
        'Thứ tự',
        'sortOrder',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 99999)
      ),

      C(
        'Dữ liệu bổ sung',
        'metadataJson',
        T.JSON,
        false,
        '',
        JSON_VALUE(),
        {
          maxLength: 5000
        }
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'ACTIVE',
        E('CATEGORY_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Ngày tạo',
        'createdAt',
        T.DATETIME,
        true,
        D.NOW,
        null
      ),

      C(
        'Ngày cập nhật',
        'updatedAt',
        T.DATETIME,
        true,
        D.NOW,
        null
      )
    ]
  });


  /**
   * ==============================================================
   * 3. SYS_SchemaVersion
   * ==============================================================
   */
  schema.SYS_SchemaVersion = SHEET({
    group: 'SYSTEM',

    description:
      'Lịch sử phiên bản cấu trúc database.',

    primaryKey: 'versionId',

    uniqueKeys: [
      ['versionId'],
      ['schemaVersion']
    ],

    logicalIndexes: [
      'versionId',
      'schemaVersion',
      'status',
      'appliedAt'
    ],

    retentionPolicy:
      'Lưu toàn bộ lịch sử phiên bản schema.',

    columns: [
      C(
        'Mã phiên bản',
        'versionId',
        T.ID,
        true,
        '',
        ID('VER_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Phiên bản schema',
        'schemaVersion',
        T.STRING,
        true,
        '',
        REGEX(
          '^\\d+\\.\\d+\\.\\d+$',
          'Phiên bản phải có dạng x.y.z.'
        ),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Ngày áp dụng',
        'appliedAt',
        T.DATETIME,
        true,
        D.NOW,
        null,
        {
          indexed: true
        }
      ),

      C(
        'Người thực hiện',
        'appliedBy',
        T.STRING,
        true,
        D.MIGRATION,
        null,
        {
          maxLength: 100
        }
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'ACTIVE',
        E('SCHEMA_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Mã kiểm tra',
        'checksum',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 256
        }
      ),

      C(
        'Ghi chú',
        'notes',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 2000
        }
      )
    ]
  });


  /**
   * ==============================================================
   * 4. SYS_MigrationLog
   * ==============================================================
   */
  schema.SYS_MigrationLog = SHEET({
    group: 'SYSTEM',

    description:
      'Nhật ký các lần migration database.',

    primaryKey: 'migrationId',

    uniqueKeys: [
      ['migrationId']
    ],

    logicalIndexes: [
      'migrationId',
      'status',
      'fromVersion',
      'toVersion',
      'startedAt'
    ],

    retentionPolicy:
      'Lưu vĩnh viễn lịch sử migration.',

    columns: [
      C(
        'Mã migration',
        'migrationId',
        T.ID,
        true,
        '',
        ID('MIG_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Tên migration',
        'migrationName',
        T.STRING,
        true,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Phiên bản nguồn',
        'fromVersion',
        T.STRING,
        true,
        '',
        null,
        {
          indexed: true,
          maxLength: 30
        }
      ),

      C(
        'Phiên bản đích',
        'toVersion',
        T.STRING,
        true,
        '',
        null,
        {
          indexed: true,
          maxLength: 30
        }
      ),

      C(
        'Thời gian bắt đầu',
        'startedAt',
        T.DATETIME,
        true,
        D.NOW,
        null,
        {
          indexed: true
        }
      ),

      C(
        'Thời gian kết thúc',
        'finishedAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'STARTED',
        E('MIGRATION_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Số bản ghi xử lý',
        'processedCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000000)
      ),

      C(
        'Số bản ghi thành công',
        'successCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000000)
      ),

      C(
        'Số bản ghi lỗi',
        'errorCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000000)
      ),

      C(
        'Chi tiết lỗi',
        'errorMessage',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 5000
        }
      ),

      C(
        'Tham chiếu backup',
        'backupReference',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 500
        }
      ),

      C(
        'Người thực hiện',
        'executedBy',
        T.STRING,
        true,
        D.MIGRATION,
        null,
        {
          maxLength: 100
        }
      )
    ]
  });


  /**
   * ==============================================================
   * 5. LOG_Audit
   * ==============================================================
   */
  schema.LOG_Audit = SHEET({
    group: 'SYSTEM',

    description:
      'Nhật ký thao tác nghiệp vụ quan trọng.',

    primaryKey: 'logId',

    uniqueKeys: [
      ['logId']
    ],

    logicalIndexes: [
      'logId',
      'timestamp',
      'userId',
      'module',
      'entityType',
      'entityId',
      'requestId',
      'resultStatus'
    ],

    retentionPolicy:
      'Lưu tối thiểu 12 tháng hoặc theo cấu hình.',

    columns: [
      C(
        'Mã log',
        'logId',
        T.ID,
        true,
        '',
        ID('AUD_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Thời gian',
        'timestamp',
        T.DATETIME,
        true,
        D.NOW,
        null,
        {
          indexed: true
        }
      ),

      C(
        'Người dùng',
        'userId',
        T.ID,
        false,
        '',
        REF('DATA_Users', 'userId'),
        {
          indexed: true
        }
      ),

      C(
        'Vai trò',
        'role',
        T.ENUM,
        false,
        '',
        E('USER_ROLE')
      ),

      C(
        'Hành động',
        'action',
        T.STRING,
        true,
        '',
        REGEX(
          '^[A-Z][A-Z0-9_]*$',
          'Action dùng chữ in hoa và dấu gạch dưới.'
        ),
        {
          maxLength: 150
        }
      ),

      C(
        'Module',
        'module',
        T.STRING,
        true,
        '',
        REGEX(
          '^[A-Z][A-Z0-9_]*$',
          'Module dùng chữ in hoa.'
        ),
        {
          indexed: true,
          maxLength: 100
        }
      ),

      C(
        'Loại dữ liệu',
        'entityType',
        T.STRING,
        false,
        '',
        null,
        {
          indexed: true,
          maxLength: 100
        }
      ),

      C(
        'Mã dữ liệu',
        'entityId',
        T.ID,
        false,
        '',
        null,
        {
          indexed: true,
          maxLength: 150
        }
      ),

      C(
        'Chi tiết',
        'detailsJson',
        T.JSON,
        false,
        '',
        JSON_VALUE(),
        {
          maxLength: 10000
        }
      ),

      C(
        'Phiên đăng nhập',
        'sessionId',
        T.ID,
        false,
        '',
        REF('DATA_Sessions', 'sessionId')
      ),

      C(
        'Mã request',
        'requestId',
        T.ID,
        false,
        '',
        ID('REQ_'),
        {
          indexed: true
        }
      ),

      C(
        'Kết quả',
        'resultStatus',
        T.ENUM,
        true,
        'SUCCESS',
        E('AUDIT_RESULT_STATUS'),
        {
          indexed: true
        }
      )
    ]
  });


  /**
   * ==============================================================
   * 6. LOG_Errors
   * ==============================================================
   */
  schema.LOG_Errors = SHEET({
    group: 'SYSTEM',

    description:
      'Nhật ký lỗi kỹ thuật của backend, frontend và tích hợp.',

    primaryKey: 'errorId',

    uniqueKeys: [
      ['errorId']
    ],

    logicalIndexes: [
      'errorId',
      'timestamp',
      'source',
      'errorCode',
      'severity',
      'status',
      'requestId'
    ],

    retentionPolicy:
      'Lưu tối thiểu 12 tháng hoặc theo cấu hình.',

    columns: [
      C(
        'Mã bản ghi lỗi',
        'errorId',
        T.ID,
        true,
        '',
        ID('ERR_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Thời gian',
        'timestamp',
        T.DATETIME,
        true,
        D.NOW,
        null,
        {
          indexed: true
        }
      ),

      C(
        'Nguồn lỗi',
        'source',
        T.ENUM,
        true,
        'BACKEND',
        E('ERROR_SOURCE'),
        {
          indexed: true
        }
      ),

      C(
        'Tên hàm',
        'functionName',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 200
        }
      ),

      C(
        'Mã loại lỗi',
        'errorCode',
        T.STRING,
        true,
        '',
        REGEX(
          '^[A-Z][A-Z0-9_\\-]*$',
          'Mã lỗi dùng chữ in hoa.'
        ),
        {
          indexed: true,
          maxLength: 150
        }
      ),

      C(
        'Nội dung lỗi',
        'errorMessage',
        T.STRING,
        true,
        '',
        null,
        {
          maxLength: 5000
        }
      ),

      C(
        'Stack trace',
        'stackTrace',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 20000
        }
      ),

      C(
        'Người dùng',
        'userId',
        T.ID,
        false,
        '',
        REF('DATA_Users', 'userId')
      ),

      C(
        'Phiên đăng nhập',
        'sessionId',
        T.ID,
        false,
        '',
        REF('DATA_Sessions', 'sessionId')
      ),

      C(
        'Mã request',
        'requestId',
        T.ID,
        false,
        '',
        ID('REQ_'),
        {
          indexed: true
        }
      ),

      C(
        'Payload rút gọn',
        'payloadSummary',
        T.JSON,
        false,
        '',
        JSON_VALUE(),
        {
          sensitive: true,
          maxLength: 10000
        }
      ),

      C(
        'Mức độ',
        'severity',
        T.ENUM,
        true,
        'ERROR',
        E('ERROR_SEVERITY'),
        {
          indexed: true
        }
      ),

      C(
        'Trạng thái xử lý',
        'status',
        T.ENUM,
        true,
        'OPEN',
        E('ERROR_STATUS'),
        {
          indexed: true
        }
      )
    ]
  });


  /**
   * ==============================================================
   * 7. DATA_Users
   * ==============================================================
   */
  schema.DATA_Users = SHEET({
    group: 'ACCOUNT',

    description:
      'Tài khoản đăng nhập của bé và gia đình.',

    primaryKey: 'userId',

    uniqueKeys: [
      ['userId'],
      ['username']
    ],

    logicalIndexes: [
      'userId',
      'username',
      'email',
      'role',
      'status'
    ],

    retentionPolicy:
      'Không xóa vật lý tài khoản đã có lịch sử.',

    columns: [
      C(
        'Mã người dùng',
        'userId',
        T.ID,
        true,
        '',
        ID('USR_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Tên đăng nhập',
        'username',
        T.STRING,
        true,
        '',
        REGEX(
          '^[a-z0-9._-]{3,50}$',
          'Username gồm chữ thường, số, dấu chấm, gạch ngang hoặc gạch dưới.'
        ),
        {
          unique: true,
          indexed: true,
          maxLength: 50
        }
      ),

      C(
        'Tên hiển thị',
        'displayName',
        T.STRING,
        true,
        '',
        null,
        {
          maxLength: 150
        }
      ),

      C(
        'Email',
        'email',
        T.STRING,
        false,
        '',
        EMAIL(),
        {
          indexed: true,
          maxLength: 254
        }
      ),

      C(
        'Vai trò',
        'role',
        T.ENUM,
        true,
        'CHILD',
        E('USER_ROLE'),
        {
          indexed: true
        }
      ),

      C(
        'Phương thức đăng nhập',
        'loginMethod',
        T.ENUM,
        true,
        'PIN',
        E('LOGIN_METHOD')
      ),

      C(
        'Credential hash',
        'credentialHash',
        T.STRING,
        true,
        '',
        null,
        {
          sensitive: true,
          maxLength: 1000
        }
      ),

      C(
        'Credential salt',
        'credentialSalt',
        T.STRING,
        true,
        '',
        null,
        {
          sensitive: true,
          maxLength: 500
        }
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'ACTIVE',
        E('USER_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Số lần đăng nhập sai',
        'failedLoginCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 1000)
      ),

      C(
        'Khóa đến',
        'lockedUntil',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Đăng nhập gần nhất',
        'lastLoginAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Ngày tạo',
        'createdAt',
        T.DATETIME,
        true,
        D.NOW,
        null
      ),

      C(
        'Người tạo',
        'createdBy',
        T.STRING,
        true,
        D.SYSTEM,
        null,
        {
          maxLength: 100
        }
      ),

      C(
        'Ngày cập nhật',
        'updatedAt',
        T.DATETIME,
        true,
        D.NOW,
        null
      ),

      C(
        'Người cập nhật',
        'updatedBy',
        T.STRING,
        true,
        D.SYSTEM,
        null,
        {
          maxLength: 100
        }
      ),

      C(
        'Ghi chú',
        'notes',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 2000
        }
      )
    ]
  });


  /**
   * ==============================================================
   * 8. DATA_Children
   * ==============================================================
   */
  schema.DATA_Children = SHEET({
    group: 'ACCOUNT',

    description:
      'Hồ sơ học tập của bé, tách khỏi tài khoản đăng nhập.',

    primaryKey: 'childId',

    uniqueKeys: [
      ['childId'],
      ['childUserId']
    ],

    logicalIndexes: [
      'childId',
      'childUserId',
      'currentGradeLevel',
      'status'
    ],

    retentionPolicy:
      'Không xóa vật lý hồ sơ bé đã có dữ liệu học tập.',

    columns: [
      C(
        'Mã bé',
        'childId',
        T.ID,
        true,
        '',
        ID('CHD_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Tài khoản của bé',
        'childUserId',
        T.ID,
        true,
        '',
        REF('DATA_Users', 'userId'),
        {
          unique: true,
          indexed: true
        }
      ),

      C(
        'Tên hiển thị',
        'displayName',
        T.STRING,
        true,
        '',
        null,
        {
          maxLength: 150
        }
      ),

      C(
        'Họ và tên',
        'fullName',
        T.STRING,
        false,
        '',
        null,
        {
          sensitive: true,
          maxLength: 200
        }
      ),

      C(
        'Ngày sinh',
        'dateOfBirth',
        T.DATE,
        false,
        '',
        null,
        {
          sensitive: true
        }
      ),

      C(
        'Khối lớp hiện tại',
        'currentGradeLevel',
        T.NUMBER,
        true,
        2,
        INTEGER(1, 12),
        {
          indexed: true
        }
      ),

      C(
        'Lớp học',
        'className',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 100
        }
      ),

      C(
        'Drive ID avatar',
        'avatarFileId',
        T.FILE_ID,
        false,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Chủ đề giao diện',
        'themePreference',
        T.STRING,
        false,
        'DEFAULT',
        REGEX(
          '^[A-Z][A-Z0-9_]*$',
          'Theme key dùng chữ in hoa.'
        ),
        {
          maxLength: 100
        }
      ),

      C(
        'Cấp độ hiện tại',
        'currentLevel',
        T.NUMBER,
        true,
        1,
        INTEGER(1, 999)
      ),

      C(
        'Tổng điểm cache',
        'totalPointsCached',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000000)
      ),

      C(
        'Streak cache',
        'currentStreakCached',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000)
      ),

      C(
        'Múi giờ',
        'timeZone',
        T.STRING,
        true,
        'Asia/Ho_Chi_Minh',
        REGEX(
          '^[A-Za-z_]+\\/[A-Za-z_]+$',
          'Múi giờ phải có dạng Region/City.'
        ),
        {
          maxLength: 100
        }
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'ACTIVE',
        E('USER_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Ngày tạo',
        'createdAt',
        T.DATETIME,
        true,
        D.NOW,
        null
      ),

      C(
        'Ngày cập nhật',
        'updatedAt',
        T.DATETIME,
        true,
        D.NOW,
        null
      )
    ]
  });


  /**
   * ==============================================================
   * 9. DATA_UserChildAccess
   * ==============================================================
   */
  schema.DATA_UserChildAccess = SHEET({
    group: 'ACCOUNT',

    description:
      'Liên kết tài khoản với hồ sơ bé.',

    primaryKey: 'accessId',

    uniqueKeys: [
      ['accessId'],
      ['userId', 'childId']
    ],

    logicalIndexes: [
      'accessId',
      'userId',
      'childId',
      'accessType',
      'status'
    ],

    retentionPolicy:
      'Chuyển INACTIVE khi thu hồi quyền truy cập.',

    columns: [
      C(
        'Mã liên kết',
        'accessId',
        T.ID,
        true,
        '',
        ID('UCA_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Người dùng',
        'userId',
        T.ID,
        true,
        '',
        REF('DATA_Users', 'userId'),
        {
          indexed: true
        }
      ),

      C(
        'Hồ sơ bé',
        'childId',
        T.ID,
        true,
        '',
        REF('DATA_Children', 'childId'),
        {
          indexed: true
        }
      ),

      C(
        'Loại truy cập',
        'accessType',
        T.ENUM,
        true,
        'SELF',
        E('ACCESS_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Là hồ sơ mặc định',
        'isDefault',
        T.BOOLEAN,
        true,
        true,
        null
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'ACTIVE',
        E('ACCESS_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Ngày tạo',
        'createdAt',
        T.DATETIME,
        true,
        D.NOW,
        null
      ),

      C(
        'Ngày cập nhật',
        'updatedAt',
        T.DATETIME,
        true,
        D.NOW,
        null
      )
    ]
  });


  /**
   * ==============================================================
   * 10. DATA_Sessions
   * ==============================================================
   */
  schema.DATA_Sessions = SHEET({
    group: 'ACCOUNT',

    description:
      'Phiên đăng nhập và trạng thái thu hồi session.',

    primaryKey: 'sessionId',

    uniqueKeys: [
      ['sessionId'],
      ['tokenHash']
    ],

    logicalIndexes: [
      'sessionId',
      'userId',
      'role',
      'expiresAt',
      'status'
    ],

    retentionPolicy:
      'Session hết hạn được giữ ngắn hạn và archive theo cấu hình.',

    columns: [
      C(
        'Mã phiên',
        'sessionId',
        T.ID,
        true,
        '',
        ID('SES_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Người dùng',
        'userId',
        T.ID,
        true,
        '',
        REF('DATA_Users', 'userId'),
        {
          indexed: true
        }
      ),

      C(
        'Token hash',
        'tokenHash',
        T.STRING,
        true,
        '',
        null,
        {
          sensitive: true,
          unique: true,
          maxLength: 1000
        }
      ),

      C(
        'Vai trò',
        'role',
        T.ENUM,
        true,
        'CHILD',
        E('USER_ROLE'),
        {
          indexed: true
        }
      ),

      C(
        'Tạo lúc',
        'createdAt',
        T.DATETIME,
        true,
        D.NOW,
        null
      ),

      C(
        'Hết hạn lúc',
        'expiresAt',
        T.DATETIME,
        true,
        '',
        null,
        {
          indexed: true
        }
      ),

      C(
        'Hoạt động gần nhất',
        'lastSeenAt',
        T.DATETIME,
        true,
        D.NOW,
        null
      ),

      C(
        'Thu hồi lúc',
        'revokedAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'ACTIVE',
        E('SESSION_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Thông tin thiết bị',
        'clientInfo',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 1000
        }
      ),

      C(
        'Lý do thu hồi',
        'revokeReason',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 1000
        }
      )
    ]
  });


  return schema;
}