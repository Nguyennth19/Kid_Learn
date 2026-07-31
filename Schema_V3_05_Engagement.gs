/**
 * ================================================================
 * KIDLEARN V3 - SCHEMA GROUP 05
 * THÀNH TÍCH, ĐIỂM THƯỞNG, STREAK, THƯ VIỆN VÀ THÔNG BÁO
 * Version: 3.1.0
 * ================================================================
 */


/**
 * Enum của nhóm thành tích, thư viện và thông báo.
 */
function kidlearnV3_enumGroup05Engagement_() {
  return {
    ACHIEVEMENT_TYPE: [
      'STREAK',
      'POINTS',
      'LESSON_COMPLETION',
      'SUBJECT_PROGRESS',
      'SKILL_MASTERY',
      'ASSESSMENT',
      'REVIEW',
      'LIBRARY',
      'DAILY_GOAL',
      'SPECIAL'
    ],

    ACHIEVEMENT_CONDITION_TYPE: [
      'STREAK_DAYS',
      'TOTAL_POINTS',
      'LESSONS_COMPLETED',
      'SUBJECT_LESSONS_COMPLETED',
      'SKILL_MASTERED',
      'ASSESSMENTS_PASSED',
      'REVIEWS_COMPLETED',
      'LIBRARY_ITEMS_COMPLETED',
      'DAILY_GOALS_COMPLETED',
      'CUSTOM_RULE'
    ],

    ACHIEVEMENT_RARITY: [
      'COMMON',
      'RARE',
      'EPIC',
      'LEGENDARY'
    ],

    ACHIEVEMENT_STATUS: [
      'ACTIVE',
      'INACTIVE',
      'ARCHIVED'
    ],

    CHILD_ACHIEVEMENT_STATUS: [
      'ACTIVE',
      'REVOKED'
    ],

    ACHIEVEMENT_EARNED_SOURCE_TYPE: [
      'STREAK',
      'LESSON_PROGRESS',
      'SKILL_PROGRESS',
      'ATTEMPT',
      'DAILY_GOAL',
      'ASSIGNMENT',
      'LIBRARY_PROGRESS',
      'MANUAL',
      'SYSTEM'
    ],

    REWARD_TRANSACTION_TYPE: [
      'EARN',
      'SPEND',
      'ADJUST',
      'REVERSE'
    ],

    REWARD_SOURCE_TYPE: [
      'LESSON',
      'ASSESSMENT',
      'REVIEW',
      'DAILY_GOAL',
      'ASSIGNMENT',
      'ACHIEVEMENT',
      'STREAK',
      'LIBRARY',
      'MANUAL',
      'SYSTEM'
    ],

    REWARD_REASON_CODE: [
      'LESSON_COMPLETED',
      'ASSESSMENT_PASSED',
      'ASSESSMENT_MASTERED',
      'REVIEW_COMPLETED',
      'DAILY_GOAL_COMPLETED',
      'ASSIGNMENT_COMPLETED',
      'ACHIEVEMENT_EARNED',
      'STREAK_REACHED',
      'LIBRARY_ITEM_COMPLETED',
      'PARENT_BONUS',
      'PARENT_DEDUCTION',
      'SYSTEM_ADJUSTMENT'
    ],

    REWARD_TRANSACTION_STATUS: [
      'ACTIVE',
      'REVERSED'
    ],

    STREAK_NOT_QUALIFIED_REASON: [
      'NO_STUDY_SESSION',
      'NOT_ENOUGH_ACTIVE_TIME',
      'SESSION_INVALID',
      'MANUAL_VOID'
    ],

    STREAK_CALCULATION_SOURCE: [
      'STUDY_SESSION',
      'MANUAL_ADJUSTMENT',
      'RECALCULATION_JOB'
    ],

    STREAK_STATUS: [
      'ACTIVE',
      'RECALCULATED',
      'VOID'
    ],

    LIBRARY_TYPE: [
      'STORY',
      'READING_TEXT',
      'AUDIO_STORY',
      'VIDEO_LESSON',
      'FLASHCARD_SET',
      'SCIENCE_EXPERIMENT',
      'WORKSHEET',
      'PARENT_GUIDE',
      'REFERENCE',
      'GAME'
    ],

    READING_LEVEL: [
      'BEGINNER',
      'EASY',
      'STANDARD',
      'CHALLENGE'
    ],

    LIBRARY_ITEM_STATUS: [
      'DRAFT',
      'IN_REVIEW',
      'APPROVED',
      'PUBLISHED',
      'ARCHIVED'
    ],

    LIBRARY_PROGRESS_STATUS: [
      'NOT_STARTED',
      'IN_PROGRESS',
      'COMPLETED',
      'ARCHIVED'
    ],

    NOTIFICATION_RECIPIENT_ROLE: [
      'CHILD',
      'FAMILY_ADMIN',
      'ALL'
    ],

    NOTIFICATION_TYPE: [
      'LESSON_COMPLETED',
      'ASSIGNMENT_DUE',
      'ASSIGNMENT_OVERDUE',
      'DAILY_GOAL_COMPLETED',
      'REVIEW_DUE',
      'ACHIEVEMENT_EARNED',
      'REWARD_GRANTED',
      'STREAK_REACHED',
      'LIBRARY_RECOMMENDATION',
      'AI_CONTENT_PENDING',
      'MANUAL_REVIEW_REQUIRED',
      'SYSTEM_ALERT',
      'PARENT_MESSAGE'
    ],

    NOTIFICATION_PRIORITY: [
      'LOW',
      'NORMAL',
      'HIGH',
      'URGENT'
    ],

    NOTIFICATION_ACTION_TYPE: [
      'OPEN_DASHBOARD',
      'OPEN_LESSON',
      'OPEN_ASSIGNMENT',
      'OPEN_REVIEW',
      'OPEN_GRADEBOOK',
      'OPEN_LIBRARY_ITEM',
      'OPEN_ACHIEVEMENT',
      'OPEN_CONTENT_REVIEW',
      'NONE'
    ],

    NOTIFICATION_SOURCE_TYPE: [
      'SYSTEM',
      'FAMILY_ADMIN',
      'LEARNING_ENGINE',
      'REVIEW_ENGINE',
      'REWARD_ENGINE',
      'AI',
      'MANUAL'
    ],

    NOTIFICATION_STATUS: [
      'ACTIVE',
      'DISMISSED',
      'EXPIRED',
      'ARCHIVED'
    ]
  };
}


/**
 * Schema của 7 Sheet nhóm thành tích, thư viện và thông báo.
 */
function kidlearnV3_schemaGroup05Engagement_() {
  var T = KIDLEARN_V3_DATA_TYPES;
  var D = KIDLEARN_V3_DEFAULTS;

  var C = kidlearnV3_column_;
  var E = kidlearnV3_validationEnum_;
  var ID = kidlearnV3_validationId_;
  var REF = kidlearnV3_validationReference_;
  var INTEGER = kidlearnV3_validationInteger_;
  var RANGE = kidlearnV3_validationRange_;
  var JSON_VALUE = kidlearnV3_validationJson_;
  var URL = kidlearnV3_validationHttpsUrl_;
  var REGEX = kidlearnV3_validationRegex_;
  var SHEET = kidlearnV3_sheetDefinition_;

  var schema = {};


  /**
   * ==============================================================
   * 1. MST_Achievements
   * ==============================================================
   */
  schema.MST_Achievements = SHEET({
    group: 'ENGAGEMENT',

    description:
      'Danh mục huy hiệu, thành tích và điều kiện đạt.',

    primaryKey: 'achievementId',

    uniqueKeys: [
      ['achievementId'],
      ['achievementCode']
    ],

    logicalIndexes: [
      'achievementId',
      'achievementCode',
      'achievementType',
      'achievementGroup',
      'subjectId',
      'skillId',
      'conditionType',
      'status',
      'sortOrder'
    ],

    retentionPolicy:
      'Không xóa thành tích đã được bé đạt. Chuyển INACTIVE hoặc ARCHIVED.',

    columns: [
      C(
        'Mã thành tích',
        'achievementId',
        T.ID,
        true,
        '',
        ID('ACH_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Mã ngắn',
        'achievementCode',
        T.STRING,
        true,
        '',
        REGEX(
          '^[A-Z0-9_\\-]+$',
          'Mã thành tích dùng chữ in hoa, số, gạch dưới hoặc gạch ngang.'
        ),
        {
          unique: true,
          indexed: true,
          maxLength: 120
        }
      ),

      C(
        'Tên thành tích',
        'achievementName',
        T.STRING,
        true,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Mô tả',
        'description',
        T.STRING,
        true,
        '',
        null,
        {
          maxLength: 2000
        }
      ),

      C(
        'Loại thành tích',
        'achievementType',
        T.ENUM,
        true,
        'SPECIAL',
        E('ACHIEVEMENT_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Nhóm thành tích',
        'achievementGroup',
        T.STRING,
        true,
        'GENERAL',
        REGEX(
          '^[A-Z0-9_\\-]+$',
          'Nhóm thành tích dùng chữ in hoa, số, gạch dưới hoặc gạch ngang.'
        ),
        {
          indexed: true,
          maxLength: 100
        }
      ),

      C(
        'Môn học',
        'subjectId',
        T.ID,
        false,
        '',
        REF('MST_Subjects', 'subjectId'),
        {
          indexed: true
        }
      ),

      C(
        'Kỹ năng',
        'skillId',
        T.ID,
        false,
        '',
        REF('MST_Skills', 'skillId'),
        {
          indexed: true
        }
      ),

      C(
        'Icon',
        'icon',
        T.STRING,
        true,
        '🏅',
        null,
        {
          maxLength: 50
        }
      ),

      C(
        'Drive ID hình huy hiệu',
        'badgeImageFileId',
        T.FILE_ID,
        false,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Mã giao diện',
        'themeKey',
        T.ENUM,
        false,
        'GOLD',
        E('THEME_KEY')
      ),

      C(
        'Loại điều kiện',
        'conditionType',
        T.ENUM,
        true,
        'CUSTOM_RULE',
        E('ACHIEVEMENT_CONDITION_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Giá trị điều kiện',
        'conditionValue',
        T.NUMBER,
        true,
        1,
        RANGE(0, 100000000)
      ),

      C(
        'Cấu hình điều kiện',
        'conditionJson',
        T.JSON,
        false,
        '',
        JSON_VALUE(),
        {
          maxLength: 10000
        }
      ),

      C(
        'Điểm thưởng khi đạt',
        'rewardPoints',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000)
      ),

      C(
        'Độ hiếm',
        'rarity',
        T.ENUM,
        true,
        'COMMON',
        E('ACHIEVEMENT_RARITY')
      ),

      C(
        'Cho phép đạt nhiều lần',
        'isRepeatable',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Thứ tự',
        'sortOrder',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 99999),
        {
          indexed: true
        }
      ),

      C(
        'Hiển thị cho bé',
        'visibleToChild',
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
        E('ACHIEVEMENT_STATUS'),
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
      )
    ]
  });


  /**
   * ==============================================================
   * 2. DATA_ChildAchievements
   * ==============================================================
   */
  schema.DATA_ChildAchievements = SHEET({
    group: 'ENGAGEMENT_DATA',

    description:
      'Thành tích mà bé đã đạt được.',

    primaryKey: 'childAchievementId',

    uniqueKeys: [
      ['childAchievementId']
    ],

    logicalIndexes: [
      'childAchievementId',
      'childId',
      'achievementId',
      'subjectId',
      'skillId',
      'earnedSourceType',
      'earnedSourceId',
      'earnedAt',
      'status'
    ],

    retentionPolicy:
      'Không xóa thành tích đã đạt. Nếu cần hủy, chuyển trạng thái REVOKED.',

    columns: [
      C(
        'Mã thành tích của bé',
        'childAchievementId',
        T.ID,
        true,
        '',
        ID('CACH_'),
        {
          unique: true,
          indexed: true,
          immutable: true
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
        'Thành tích',
        'achievementId',
        T.ID,
        true,
        '',
        REF('MST_Achievements', 'achievementId'),
        {
          indexed: true
        }
      ),

      C(
        'Môn học',
        'subjectId',
        T.ID,
        false,
        '',
        REF('MST_Subjects', 'subjectId'),
        {
          indexed: true
        }
      ),

      C(
        'Kỹ năng',
        'skillId',
        T.ID,
        false,
        '',
        REF('MST_Skills', 'skillId'),
        {
          indexed: true
        }
      ),

      C(
        'Nguồn đạt thành tích',
        'earnedSourceType',
        T.ENUM,
        true,
        'SYSTEM',
        E('ACHIEVEMENT_EARNED_SOURCE_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Mã nguồn',
        'earnedSourceId',
        T.ID,
        false,
        '',
        null,
        {
          indexed: true
        }
      ),

      C(
        'Giá trị đạt được',
        'earnedValue',
        T.NUMBER,
        false,
        '',
        RANGE(0, 100000000)
      ),

      C(
        'Điểm thưởng đã cấp',
        'rewardPointsGranted',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000)
      ),

      C(
        'Giao dịch điểm',
        'rewardTransactionId',
        T.ID,
        false,
        '',
        REF('DATA_RewardTransactions', 'rewardTransactionId')
      ),

      C(
        'Đã xem bởi bé',
        'seenByChild',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Xem lúc',
        'seenAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Đạt lúc',
        'earnedAt',
        T.DATETIME,
        true,
        D.NOW,
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
        E('CHILD_ACHIEVEMENT_STATUS'),
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
   * 3. DATA_RewardTransactions
   * ==============================================================
   */
  schema.DATA_RewardTransactions = SHEET({
    group: 'ENGAGEMENT_DATA',

    description:
      'Lịch sử cộng, trừ, điều chỉnh và đảo giao dịch điểm thưởng.',

    primaryKey: 'rewardTransactionId',

    uniqueKeys: [
      ['rewardTransactionId']
    ],

    logicalIndexes: [
      'rewardTransactionId',
      'childId',
      'transactionType',
      'sourceType',
      'sourceId',
      'reasonCode',
      'createdAt',
      'status',
      'requestId'
    ],

    retentionPolicy:
      'Không sửa hoặc xóa giao dịch đã active. Dùng giao dịch REVERSE để hoàn tác.',

    columns: [
      C(
        'Mã giao dịch điểm',
        'rewardTransactionId',
        T.ID,
        true,
        '',
        ID('RWD_'),
        {
          unique: true,
          indexed: true,
          immutable: true
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
        'Loại giao dịch',
        'transactionType',
        T.ENUM,
        true,
        'EARN',
        E('REWARD_TRANSACTION_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Nguồn điểm',
        'sourceType',
        T.ENUM,
        true,
        'SYSTEM',
        E('REWARD_SOURCE_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Mã nguồn',
        'sourceId',
        T.ID,
        false,
        '',
        null,
        {
          indexed: true
        }
      ),

      C(
        'Lý do',
        'reasonCode',
        T.ENUM,
        true,
        'SYSTEM_ADJUSTMENT',
        E('REWARD_REASON_CODE'),
        {
          indexed: true
        }
      ),

      C(
        'Mô tả',
        'description',
        T.STRING,
        true,
        '',
        null,
        {
          maxLength: 1000
        }
      ),

      C(
        'Điểm thay đổi',
        'pointsDelta',
        T.NUMBER,
        true,
        0,
        RANGE(-100000000, 100000000)
      ),

      C(
        'Số dư trước',
        'balanceBefore',
        T.NUMBER,
        true,
        0,
        RANGE(0, 100000000)
      ),

      C(
        'Số dư sau',
        'balanceAfter',
        T.NUMBER,
        true,
        0,
        RANGE(0, 100000000)
      ),

      C(
        'Hiển thị cho bé',
        'visibleToChild',
        T.BOOLEAN,
        true,
        true,
        null
      ),

      C(
        'Đã tạo thông báo',
        'notificationCreated',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Người thực hiện',
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
        'Ngày tạo',
        'createdAt',
        T.DATETIME,
        true,
        D.NOW,
        null,
        {
          indexed: true
        }
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
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'ACTIVE',
        E('REWARD_TRANSACTION_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Giao dịch đảo',
        'reversalOfTransactionId',
        T.ID,
        false,
        '',
        REF('DATA_RewardTransactions', 'rewardTransactionId')
      )
    ]
  });


  /**
   * ==============================================================
   * 4. DATA_Streaks
   * ==============================================================
   */
  schema.DATA_Streaks = SHEET({
    group: 'ENGAGEMENT_DATA',

    description:
      'Lịch sử chuỗi ngày học của bé theo ngày.',

    primaryKey: 'streakId',

    uniqueKeys: [
      ['streakId'],
      ['childId', 'studyDate']
    ],

    logicalIndexes: [
      'streakId',
      'childId',
      'studyDate',
      'isQualified',
      'streakCount',
      'status'
    ],

    retentionPolicy:
      'Giữ lịch sử streak theo ngày để audit và tính lại khi cần.',

    columns: [
      C(
        'Mã streak',
        'streakId',
        T.ID,
        true,
        '',
        ID('STR_'),
        {
          unique: true,
          indexed: true,
          immutable: true
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
        'Ngày học',
        'studyDate',
        T.DATE,
        true,
        D.TODAY,
        null,
        {
          indexed: true
        }
      ),

      C(
        'Tổng thời gian hoạt động',
        'activeSeconds',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 86400)
      ),

      C(
        'Tổng phiên học',
        'sessionCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000)
      ),

      C(
        'Có đạt streak',
        'isQualified',
        T.BOOLEAN,
        true,
        false,
        null,
        {
          indexed: true
        }
      ),

      C(
        'Chuỗi ngày tại thời điểm đó',
        'streakCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000),
        {
          indexed: true
        }
      ),

      C(
        'Là ngày ngắt chuỗi',
        'isBreakDay',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Lý do không đạt',
        'notQualifiedReason',
        T.ENUM,
        false,
        '',
        E('STREAK_NOT_QUALIFIED_REASON')
      ),

      C(
        'Nguồn tính',
        'calculationSource',
        T.ENUM,
        true,
        'STUDY_SESSION',
        E('STREAK_CALCULATION_SOURCE')
      ),

      C(
        'Tính toán lúc',
        'calculatedAt',
        T.DATETIME,
        true,
        D.NOW,
        null
      ),

      C(
        'Đã cấp thưởng',
        'rewardGranted',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Giao dịch điểm',
        'rewardTransactionId',
        T.ID,
        false,
        '',
        REF('DATA_RewardTransactions', 'rewardTransactionId')
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'ACTIVE',
        E('STREAK_STATUS'),
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
   * 5. MST_LibraryItems
   * ==============================================================
   */
  schema.MST_LibraryItems = SHEET({
    group: 'LIBRARY',

    description:
      'Danh mục tài liệu thư viện đọc, nghe, xem và học bổ trợ.',

    primaryKey: 'libraryItemId',

    uniqueKeys: [
      ['libraryItemId'],
      ['libraryCode']
    ],

    logicalIndexes: [
      'libraryItemId',
      'libraryCode',
      'libraryType',
      'subjectId',
      'topicId',
      'lessonId',
      'skillId',
      'gradeLevel',
      'status',
      'isFeatured',
      'isRecommended',
      'sortOrder'
    ],

    retentionPolicy:
      'Không xóa tài liệu đã có progress. Archive khi không còn dùng.',

    columns: [
      C(
        'Mã tài liệu',
        'libraryItemId',
        T.ID,
        true,
        '',
        ID('LIB_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Mã ngắn',
        'libraryCode',
        T.STRING,
        true,
        '',
        REGEX(
          '^[A-Z0-9_\\-]+$',
          'Mã thư viện dùng chữ in hoa, số, gạch dưới hoặc gạch ngang.'
        ),
        {
          unique: true,
          indexed: true,
          maxLength: 120
        }
      ),

      C(
        'Tiêu đề',
        'title',
        T.STRING,
        true,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Phụ đề',
        'subtitle',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 300
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
          maxLength: 3000
        }
      ),

      C(
        'Loại tài liệu',
        'libraryType',
        T.ENUM,
        true,
        'READING_TEXT',
        E('LIBRARY_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Môn học',
        'subjectId',
        T.ID,
        false,
        '',
        REF('MST_Subjects', 'subjectId'),
        {
          indexed: true
        }
      ),

      C(
        'Chủ đề',
        'topicId',
        T.ID,
        false,
        '',
        REF('MST_Topics', 'topicId'),
        {
          indexed: true
        }
      ),

      C(
        'Bài học liên quan',
        'lessonId',
        T.ID,
        false,
        '',
        REF('MST_Lessons', 'lessonId'),
        {
          indexed: true
        }
      ),

      C(
        'Kỹ năng liên quan',
        'skillId',
        T.ID,
        false,
        '',
        REF('MST_Skills', 'skillId'),
        {
          indexed: true
        }
      ),

      C(
        'Khối lớp',
        'gradeLevel',
        T.NUMBER,
        false,
        '',
        INTEGER(1, 12),
        {
          indexed: true
        }
      ),

      C(
        'Cấp độ đọc',
        'readingLevel',
        T.ENUM,
        false,
        '',
        E('READING_LEVEL')
      ),

      C(
        'Độ khó',
        'difficultyLevel',
        T.ENUM,
        false,
        '',
        E('DIFFICULTY_LEVEL')
      ),

      C(
        'Tài nguyên chính',
        'mediaAssetId',
        T.ID,
        false,
        '',
        REF('MST_MediaAssets', 'mediaAssetId')
      ),

      C(
        'Google Docs ID',
        'documentFileId',
        T.FILE_ID,
        false,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Audio',
        'audioMediaAssetId',
        T.ID,
        false,
        '',
        REF('MST_MediaAssets', 'mediaAssetId')
      ),

      C(
        'Thumbnail',
        'thumbnailMediaAssetId',
        T.ID,
        false,
        '',
        REF('MST_MediaAssets', 'mediaAssetId')
      ),

      C(
        'YouTube Video ID',
        'youtubeVideoId',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 100
        }
      ),

      C(
        'Thời lượng phút',
        'estimatedMinutes',
        T.NUMBER,
        true,
        5,
        INTEGER(0, 10000)
      ),

      C(
        'Số trang',
        'pageCount',
        T.NUMBER,
        false,
        '',
        INTEGER(0, 10000)
      ),

      C(
        'Ngôn ngữ',
        'languageCode',
        T.STRING,
        true,
        'vi-VN',
        REGEX(
          '^[a-z]{2}(-[A-Z]{2})?$',
          'Mã ngôn ngữ có dạng vi-VN hoặc en-US.'
        ),
        {
          maxLength: 20
        }
      ),

      C(
        'Tác giả',
        'author',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Nguồn',
        'sourceName',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'URL nguồn',
        'sourceUrl',
        T.URL,
        false,
        '',
        URL(),
        {
          maxLength: 1000
        }
      ),

      C(
        'Tình trạng bản quyền',
        'rightsStatus',
        T.ENUM,
        true,
        'UNKNOWN',
        E('RIGHTS_STATUS')
      ),

      C(
        'Có câu hỏi sau đọc',
        'hasComprehensionQuestions',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Assessment liên kết',
        'assessmentId',
        T.ID,
        false,
        '',
        REF('MST_Assessments', 'assessmentId')
      ),

      C(
        'Từ khóa',
        'tags',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 1000
        }
      ),

      C(
        'Nổi bật',
        'isFeatured',
        T.BOOLEAN,
        true,
        false,
        null,
        {
          indexed: true
        }
      ),

      C(
        'Được đề xuất',
        'isRecommended',
        T.BOOLEAN,
        true,
        false,
        null,
        {
          indexed: true
        }
      ),

      C(
        'Thứ tự',
        'sortOrder',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 99999),
        {
          indexed: true
        }
      ),

      C(
        'Trạng thái nội dung',
        'status',
        T.ENUM,
        true,
        'DRAFT',
        E('LIBRARY_ITEM_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Xuất bản lúc',
        'publishedAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Xuất bản bởi',
        'publishedBy',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 100
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
      )
    ]
  });


  /**
   * ==============================================================
   * 6. DATA_LibraryProgress
   * ==============================================================
   */
  schema.DATA_LibraryProgress = SHEET({
    group: 'LIBRARY_DATA',

    description:
      'Tiến độ đọc, nghe, xem hoặc học tài liệu thư viện của bé.',

    primaryKey: 'libraryProgressId',

    uniqueKeys: [
      ['libraryProgressId'],
      ['childId', 'libraryItemId']
    ],

    logicalIndexes: [
      'libraryProgressId',
      'childId',
      'libraryItemId',
      'libraryType',
      'subjectId',
      'status',
      'isFavorite',
      'isCompleted',
      'lastOpenedAt'
    ],

    retentionPolicy:
      'Không xóa progress thư viện khi đã có dữ liệu học hoặc thưởng.',

    columns: [
      C(
        'Mã tiến độ thư viện',
        'libraryProgressId',
        T.ID,
        true,
        '',
        ID('LIP_'),
        {
          unique: true,
          indexed: true,
          immutable: true
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
        'Tài liệu',
        'libraryItemId',
        T.ID,
        true,
        '',
        REF('MST_LibraryItems', 'libraryItemId'),
        {
          indexed: true
        }
      ),

      C(
        'Loại tài liệu',
        'libraryType',
        T.ENUM,
        true,
        'READING_TEXT',
        E('LIBRARY_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Môn học',
        'subjectId',
        T.ID,
        false,
        '',
        REF('MST_Subjects', 'subjectId'),
        {
          indexed: true
        }
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'NOT_STARTED',
        E('LIBRARY_PROGRESS_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Phần trăm tiến độ',
        'progressPercent',
        T.NUMBER,
        true,
        0,
        RANGE(0, 100)
      ),

      C(
        'Vị trí hiện tại',
        'currentPosition',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Trang hiện tại',
        'currentPage',
        T.NUMBER,
        false,
        '',
        INTEGER(0, 10000)
      ),

      C(
        'Giây hiện tại',
        'currentSecond',
        T.NUMBER,
        false,
        '',
        INTEGER(0, 10000000)
      ),

      C(
        'Tổng thời gian tương tác',
        'totalEngagementSeconds',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000000)
      ),

      C(
        'Số lần mở',
        'openCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 1000000)
      ),

      C(
        'Yêu thích',
        'isFavorite',
        T.BOOLEAN,
        true,
        false,
        null,
        {
          indexed: true
        }
      ),

      C(
        'Đã hoàn thành',
        'isCompleted',
        T.BOOLEAN,
        true,
        false,
        null,
        {
          indexed: true
        }
      ),

      C(
        'Hoàn thành lúc',
        'completedAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Lần mở đầu tiên',
        'firstOpenedAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Lần mở gần nhất',
        'lastOpenedAt',
        T.DATETIME,
        false,
        '',
        null,
        {
          indexed: true
        }
      ),

      C(
        'Attempt sau đọc gần nhất',
        'latestAssessmentAttemptId',
        T.ID,
        false,
        '',
        REF('DATA_Attempts', 'attemptId')
      ),

      C(
        'Điểm sau đọc gần nhất',
        'latestAssessmentPercent',
        T.NUMBER,
        false,
        '',
        RANGE(0, 100)
      ),

      C(
        'Điểm thưởng đã cấp',
        'rewardPointsGranted',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000)
      ),

      C(
        'Giao dịch thưởng',
        'rewardTransactionId',
        T.ID,
        false,
        '',
        REF('DATA_RewardTransactions', 'rewardTransactionId')
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
   * 7. DATA_Notifications
   * ==============================================================
   */
  schema.DATA_Notifications = SHEET({
    group: 'NOTIFICATION',

    description:
      'Thông báo trong app cho bé và phụ huynh.',

    primaryKey: 'notificationId',

    uniqueKeys: [
      ['notificationId']
    ],

    logicalIndexes: [
      'notificationId',
      'recipientUserId',
      'childId',
      'recipientRole',
      'notificationType',
      'priority',
      'relatedEntityType',
      'relatedEntityId',
      'isRead',
      'status',
      'createdAt'
    ],

    retentionPolicy:
      'Không xóa thông báo quan trọng ngay. Dùng DISMISSED, EXPIRED hoặc ARCHIVED.',

    columns: [
      C(
        'Mã thông báo',
        'notificationId',
        T.ID,
        true,
        '',
        ID('NTF_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Người nhận',
        'recipientUserId',
        T.ID,
        false,
        '',
        REF('DATA_Users', 'userId'),
        {
          indexed: true
        }
      ),

      C(
        'Hồ sơ bé liên quan',
        'childId',
        T.ID,
        false,
        '',
        REF('DATA_Children', 'childId'),
        {
          indexed: true
        }
      ),

      C(
        'Vai trò nhận',
        'recipientRole',
        T.ENUM,
        true,
        'ALL',
        E('NOTIFICATION_RECIPIENT_ROLE'),
        {
          indexed: true
        }
      ),

      C(
        'Loại thông báo',
        'notificationType',
        T.ENUM,
        true,
        'SYSTEM_ALERT',
        E('NOTIFICATION_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Tiêu đề',
        'title',
        T.STRING,
        true,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Nội dung',
        'message',
        T.STRING,
        true,
        '',
        null,
        {
          maxLength: 3000
        }
      ),

      C(
        'Icon',
        'icon',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 50
        }
      ),

      C(
        'Mức độ ưu tiên',
        'priority',
        T.ENUM,
        true,
        'NORMAL',
        E('NOTIFICATION_PRIORITY'),
        {
          indexed: true
        }
      ),

      C(
        'Loại dữ liệu liên quan',
        'relatedEntityType',
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
        'ID dữ liệu liên quan',
        'relatedEntityId',
        T.ID,
        false,
        '',
        null,
        {
          indexed: true
        }
      ),

      C(
        'Hành động',
        'actionType',
        T.ENUM,
        false,
        'NONE',
        E('NOTIFICATION_ACTION_TYPE')
      ),

      C(
        'Tham số hành động',
        'actionPayloadJson',
        T.JSON,
        false,
        '',
        JSON_VALUE(),
        {
          maxLength: 5000
        }
      ),

      C(
        'Đã đọc',
        'isRead',
        T.BOOLEAN,
        true,
        false,
        null,
        {
          indexed: true
        }
      ),

      C(
        'Đọc lúc',
        'readAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Đã xử lý',
        'isActioned',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Xử lý lúc',
        'actionedAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Hiển thị từ',
        'visibleFrom',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Hiển thị đến',
        'visibleUntil',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Gửi email',
        'sendEmail',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Email đã gửi lúc',
        'emailSentAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Nguồn tạo',
        'sourceType',
        T.ENUM,
        true,
        'SYSTEM',
        E('NOTIFICATION_SOURCE_TYPE')
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
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'ACTIVE',
        E('NOTIFICATION_STATUS'),
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
        null,
        {
          indexed: true
        }
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


  return schema;
}