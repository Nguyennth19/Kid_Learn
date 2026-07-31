/**
 * ================================================================
 * KIDLEARN V3 - SCHEMA GROUP 04
 * TIẾN ĐỘ, PHIÊN HỌC, NHIỆM VỤ, MỤC TIÊU NGÀY VÀ ÔN TẬP
 * Version: 3.1.0
 * ================================================================
 */


/**
 * Enum của nhóm tiến độ và nhiệm vụ.
 */
function kidlearnV3_enumGroup04Progress_() {
  return {
    LESSON_PROGRESS_STATUS: [
      'NOT_STARTED',
      'IN_PROGRESS',
      'COMPLETED',
      'NEEDS_REVIEW',
      'LOCKED'
    ],

    LESSON_REVIEW_REASON: [
      'LOW_SCORE',
      'WRONG_QUESTIONS',
      'LOW_SKILL_MASTERY',
      'LONG_TIME_NO_REVIEW',
      'PARENT_REQUEST',
      'SYSTEM_RECOMMENDATION'
    ],

    SKILL_PROGRESS_STATUS: [
      'NOT_ASSESSED',
      'INTRODUCED',
      'PRACTICING',
      'PROFICIENT',
      'MASTERED',
      'NEEDS_REVIEW'
    ],

    PROGRESS_EVIDENCE_TYPE: [
      'LESSON_PRACTICE',
      'DAILY_REVIEW',
      'PERIODIC_REVIEW',
      'TOPIC_TEST',
      'DIAGNOSTIC',
      'PARENT_REVIEW'
    ],

    STUDY_SESSION_TYPE: [
      'LESSON',
      'PRACTICE',
      'ASSESSMENT',
      'REVIEW',
      'LIBRARY',
      'FREE_LEARNING'
    ],

    STUDY_SESSION_STATUS: [
      'ACTIVE',
      'COMPLETED',
      'ABANDONED',
      'TIMEOUT'
    ],

    DEVICE_TYPE: [
      'DESKTOP',
      'TABLET',
      'PHONE',
      'UNKNOWN'
    ],

    ASSIGNMENT_TYPE: [
      'LESSON',
      'PRACTICE',
      'ASSESSMENT',
      'REVIEW',
      'LIBRARY',
      'ACTIVITY',
      'CUSTOM'
    ],

    ASSIGNMENT_SOURCE_TYPE: [
      'FAMILY_ADMIN',
      'SYSTEM_DAILY_PLAN',
      'REVIEW_ENGINE',
      'LEARNING_PATH',
      'MANUAL'
    ],

    PRIORITY_LEVEL: [
      'LOW',
      'NORMAL',
      'HIGH',
      'URGENT'
    ],

    ASSIGNMENT_STATUS: [
      'ASSIGNED',
      'IN_PROGRESS',
      'COMPLETED',
      'OVERDUE',
      'CANCELLED'
    ],

    DAILY_GOAL_TYPE: [
      'STUDY_MINUTES',
      'LESSONS_COMPLETED',
      'QUESTIONS_ANSWERED',
      'ASSIGNMENTS_COMPLETED',
      'REVIEWS_COMPLETED',
      'LIBRARY_ITEMS_COMPLETED',
      'SUBJECT_ACTIVITY',
      'CUSTOM'
    ],

    DAILY_GOAL_UNIT: [
      'MINUTES',
      'LESSONS',
      'QUESTIONS',
      'ASSIGNMENTS',
      'REVIEWS',
      'ITEMS',
      'TIMES'
    ],

    DAILY_GOAL_STATUS: [
      'NOT_STARTED',
      'IN_PROGRESS',
      'COMPLETED',
      'MISSED',
      'CANCELLED'
    ],

    REVIEW_ITEM_TYPE: [
      'QUESTION',
      'SKILL',
      'LESSON',
      'CUSTOM'
    ],

    REVIEW_QUEUE_REASON: [
      'WRONG_ANSWER',
      'REPEATED_ERROR',
      'LOW_SKILL_MASTERY',
      'LONG_TIME_NO_REVIEW',
      'LOW_ASSESSMENT_SCORE',
      'PARENT_REQUEST',
      'SYSTEM_RECOMMENDATION'
    ],

    REVIEW_QUEUE_STATUS: [
      'PENDING',
      'DUE',
      'IN_REVIEW',
      'MASTERED',
      'SNOOZED',
      'REMOVED'
    ],

    REVIEW_QUEUE_SOURCE_TYPE: [
      'RESPONSE',
      'ATTEMPT',
      'SKILL_ENGINE',
      'LESSON_PROGRESS',
      'FAMILY_ADMIN',
      'SYSTEM'
    ]
  };
}


/**
 * Schema của 6 Sheet nhóm tiến độ và nhiệm vụ.
 */
function kidlearnV3_schemaGroup04Progress_() {
  var T = KIDLEARN_V3_DATA_TYPES;
  var D = KIDLEARN_V3_DEFAULTS;

  var C = kidlearnV3_column_;
  var E = kidlearnV3_validationEnum_;
  var ID = kidlearnV3_validationId_;
  var REF = kidlearnV3_validationReference_;
  var INTEGER = kidlearnV3_validationInteger_;
  var RANGE = kidlearnV3_validationRange_;
  var JSON_VALUE = kidlearnV3_validationJson_;
  var REGEX = kidlearnV3_validationRegex_;
  var SHEET = kidlearnV3_sheetDefinition_;

  var schema = {};


  /**
   * ==============================================================
   * 1. DATA_LessonProgress
   * ==============================================================
   */
  schema.DATA_LessonProgress = SHEET({
    group: 'PROGRESS',

    description:
      'Trạng thái hiện tại của bé đối với từng bài học.',

    primaryKey: 'lessonProgressId',

    uniqueKeys: [
      ['lessonProgressId'],
      ['childId', 'lessonId']
    ],

    logicalIndexes: [
      'lessonProgressId',
      'childId',
      'lessonId',
      'subjectId',
      'topicId',
      'status',
      'lastAccessedAt',
      'nextReviewAt'
    ],

    retentionPolicy:
      'Không xóa tiến độ học. Cập nhật trạng thái hiện tại và giữ lịch sử ở StudySessions, Attempts.',

    columns: [
      C(
        'Mã tiến độ',
        'lessonProgressId',
        T.ID,
        true,
        '',
        ID('LPR_'),
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
        'Bài học',
        'lessonId',
        T.ID,
        true,
        '',
        REF('MST_Lessons', 'lessonId'),
        {
          indexed: true
        }
      ),

      C(
        'Môn học',
        'subjectId',
        T.ID,
        true,
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
        true,
        '',
        REF('MST_Topics', 'topicId'),
        {
          indexed: true
        }
      ),

      C(
        'Trạng thái học',
        'status',
        T.ENUM,
        true,
        'NOT_STARTED',
        E('LESSON_PROGRESS_STATUS'),
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
        'Block đang học',
        'currentBlockId',
        T.ID,
        false,
        '',
        REF('MST_LessonBlocks', 'blockId')
      ),

      C(
        'Block cuối đã hoàn thành',
        'lastCompletedBlockId',
        T.ID,
        false,
        '',
        REF('MST_LessonBlocks', 'blockId')
      ),

      C(
        'Danh sách block hoàn thành',
        'completedBlockIdsJson',
        T.JSON,
        false,
        '',
        JSON_VALUE(),
        {
          maxLength: 10000
        }
      ),

      C(
        'Tổng số block',
        'totalBlockCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 10000)
      ),

      C(
        'Số block hoàn thành',
        'completedBlockCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 10000)
      ),

      C(
        'Yêu cầu luyện tập',
        'practiceRequired',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Attempt luyện tập gần nhất',
        'latestPracticeAttemptId',
        T.ID,
        false,
        '',
        REF('DATA_Attempts', 'attemptId')
      ),

      C(
        'Điểm luyện tập gần nhất',
        'latestPracticePercent',
        T.NUMBER,
        false,
        '',
        RANGE(0, 100)
      ),

      C(
        'Điểm luyện tập cao nhất',
        'bestPracticePercent',
        T.NUMBER,
        false,
        '',
        RANGE(0, 100)
      ),

      C(
        'Đã đạt yêu cầu',
        'isPassed',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Đã thành thạo',
        'isMastered',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Bắt đầu lần đầu',
        'firstStartedAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Hoạt động gần nhất',
        'lastAccessedAt',
        T.DATETIME,
        false,
        '',
        null,
        {
          indexed: true
        }
      ),

      C(
        'Hoàn thành lần đầu',
        'firstCompletedAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Hoàn thành gần nhất',
        'lastCompletedAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Tổng thời gian học giây',
        'totalStudySeconds',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000000)
      ),

      C(
        'Số lần mở bài',
        'openCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 1000000)
      ),

      C(
        'Số lần hoàn thành',
        'completionCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 1000000)
      ),

      C(
        'Cần ôn lại',
        'needsReview',
        T.BOOLEAN,
        true,
        false,
        null,
        {
          indexed: true
        }
      ),

      C(
        'Lý do cần ôn',
        'reviewReasonCode',
        T.ENUM,
        false,
        '',
        E('LESSON_REVIEW_REASON')
      ),

      C(
        'Ngày ôn đề xuất',
        'nextReviewAt',
        T.DATETIME,
        false,
        '',
        null,
        {
          indexed: true
        }
      ),

      C(
        'Phiên bản bài đã học',
        'lessonVersion',
        T.STRING,
        true,
        '1.0.0',
        REGEX(
          '^\\d+\\.\\d+\\.\\d+$',
          'Phiên bản phải có dạng x.y.z.'
        )
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
   * 2. DATA_SkillProgress
   * ==============================================================
   */
  schema.DATA_SkillProgress = SHEET({
    group: 'PROGRESS',

    description:
      'Mức độ thành thạo hiện tại của bé với từng kỹ năng.',

    primaryKey: 'skillProgressId',

    uniqueKeys: [
      ['skillProgressId'],
      ['childId', 'skillId']
    ],

    logicalIndexes: [
      'skillProgressId',
      'childId',
      'skillId',
      'subjectId',
      'status',
      'nextReviewAt',
      'reviewPriority'
    ],

    retentionPolicy:
      'Không xóa tiến độ kỹ năng. Cập nhật theo evidence từ responses, attempts và review.',

    columns: [
      C(
        'Mã tiến độ kỹ năng',
        'skillProgressId',
        T.ID,
        true,
        '',
        ID('SPR_'),
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
        'Kỹ năng',
        'skillId',
        T.ID,
        true,
        '',
        REF('MST_Skills', 'skillId'),
        {
          indexed: true
        }
      ),

      C(
        'Môn học',
        'subjectId',
        T.ID,
        true,
        '',
        REF('MST_Subjects', 'subjectId'),
        {
          indexed: true
        }
      ),

      C(
        'Trạng thái kỹ năng',
        'status',
        T.ENUM,
        true,
        'NOT_ASSESSED',
        E('SKILL_PROGRESS_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Điểm thành thạo',
        'masteryPercent',
        T.NUMBER,
        true,
        0,
        RANGE(0, 100)
      ),

      C(
        'Tổng số bằng chứng',
        'evidenceCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 1000000)
      ),

      C(
        'Số câu đúng',
        'correctCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 1000000)
      ),

      C(
        'Số câu sai',
        'incorrectCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 1000000)
      ),

      C(
        'Tỷ lệ đúng',
        'correctRate',
        T.NUMBER,
        true,
        0,
        RANGE(0, 100)
      ),

      C(
        'Điểm trung bình',
        'averageScorePercent',
        T.NUMBER,
        true,
        0,
        RANGE(0, 100)
      ),

      C(
        'Điểm gần nhất',
        'latestScorePercent',
        T.NUMBER,
        false,
        '',
        RANGE(0, 100)
      ),

      C(
        'Điểm tốt nhất',
        'bestScorePercent',
        T.NUMBER,
        false,
        '',
        RANGE(0, 100)
      ),

      C(
        'Chuỗi đúng hiện tại',
        'currentCorrectStreak',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 1000000)
      ),

      C(
        'Chuỗi sai hiện tại',
        'currentIncorrectStreak',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 1000000)
      ),

      C(
        'Số bài có bằng chứng',
        'lessonEvidenceCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 1000000)
      ),

      C(
        'Lần luyện đầu tiên',
        'firstPracticedAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Lần luyện gần nhất',
        'lastPracticedAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Ngày ôn kế tiếp',
        'nextReviewAt',
        T.DATETIME,
        false,
        '',
        null,
        {
          indexed: true
        }
      ),

      C(
        'Mức ưu tiên ôn',
        'reviewPriority',
        T.NUMBER,
        true,
        0,
        RANGE(0, 100),
        {
          indexed: true
        }
      ),

      C(
        'Số lần ôn',
        'reviewCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 1000000)
      ),

      C(
        'Số lần ôn thành công',
        'successfulReviewCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 1000000)
      ),

      C(
        'Loại bằng chứng cuối',
        'lastEvidenceType',
        T.ENUM,
        false,
        '',
        E('PROGRESS_EVIDENCE_TYPE')
      ),

      C(
        'Mã bằng chứng cuối',
        'lastEvidenceId',
        T.ID,
        false,
        '',
        null
      ),

      C(
        'Phiên bản thuật toán',
        'calculationVersion',
        T.STRING,
        true,
        '1.0.0',
        REGEX(
          '^\\d+\\.\\d+\\.\\d+$',
          'Phiên bản phải có dạng x.y.z.'
        )
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
   * 3. DATA_StudySessions
   * ==============================================================
   */
  schema.DATA_StudySessions = SHEET({
    group: 'PROGRESS',

    description:
      'Lịch sử từng phiên học của bé.',

    primaryKey: 'studySessionId',

    uniqueKeys: [
      ['studySessionId']
    ],

    logicalIndexes: [
      'studySessionId',
      'childId',
      'userId',
      'sessionType',
      'subjectId',
      'lessonId',
      'assessmentId',
      'studyDate',
      'status'
    ],

    retentionPolicy:
      'Lưu lịch sử phiên học để tính thời gian học, streak và báo cáo.',

    columns: [
      C(
        'Mã phiên học',
        'studySessionId',
        T.ID,
        true,
        '',
        ID('SSN_'),
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
        'Người dùng đăng nhập',
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
        'Loại phiên học',
        'sessionType',
        T.ENUM,
        true,
        'LESSON',
        E('STUDY_SESSION_TYPE'),
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
        REF('MST_Topics', 'topicId')
      ),

      C(
        'Bài học',
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
        'Bài đánh giá',
        'assessmentId',
        T.ID,
        false,
        '',
        REF('MST_Assessments', 'assessmentId'),
        {
          indexed: true
        }
      ),

      C(
        'Tài liệu thư viện',
        'libraryItemId',
        T.ID,
        false,
        '',
        REF('MST_LibraryItems', 'libraryItemId')
      ),

      C(
        'Bắt đầu lúc',
        'startedAt',
        T.DATETIME,
        true,
        D.NOW,
        null
      ),

      C(
        'Hoạt động cuối lúc',
        'lastActivityAt',
        T.DATETIME,
        true,
        D.NOW,
        null
      ),

      C(
        'Kết thúc lúc',
        'endedAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Tổng thời lượng giây',
        'elapsedSeconds',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 86400)
      ),

      C(
        'Thời gian hoạt động giây',
        'activeSeconds',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 86400)
      ),

      C(
        'Thời gian không hoạt động giây',
        'idleSeconds',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 86400)
      ),

      C(
        'Số tương tác',
        'interactionCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 1000000)
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'ACTIVE',
        E('STUDY_SESSION_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Kết thúc bình thường',
        'endedNormally',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Loại thiết bị',
        'deviceType',
        T.ENUM,
        false,
        'UNKNOWN',
        E('DEVICE_TYPE')
      ),

      C(
        'Thông tin trình duyệt',
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
        'Có tính streak',
        'qualifiesForStreak',
        T.BOOLEAN,
        true,
        false,
        null
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
   * 4. DATA_Assignments
   * ==============================================================
   */
  schema.DATA_Assignments = SHEET({
    group: 'PROGRESS',

    description:
      'Nhiệm vụ được giao cho bé bởi phụ huynh hoặc hệ thống.',

    primaryKey: 'assignmentId',

    uniqueKeys: [
      ['assignmentId']
    ],

    logicalIndexes: [
      'assignmentId',
      'childId',
      'assignmentType',
      'subjectId',
      'lessonId',
      'assessmentId',
      'sourceType',
      'dueAt',
      'status'
    ],

    retentionPolicy:
      'Không xóa nhiệm vụ đã giao, chỉ chuyển CANCELLED hoặc ARCHIVE trong tương lai.',

    columns: [
      C(
        'Mã nhiệm vụ',
        'assignmentId',
        T.ID,
        true,
        '',
        ID('ASG_'),
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
        'Loại nhiệm vụ',
        'assignmentType',
        T.ENUM,
        true,
        'LESSON',
        E('ASSIGNMENT_TYPE'),
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
        'Bài học',
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
        'Bài đánh giá',
        'assessmentId',
        T.ID,
        false,
        '',
        REF('MST_Assessments', 'assessmentId'),
        {
          indexed: true
        }
      ),

      C(
        'Tài liệu thư viện',
        'libraryItemId',
        T.ID,
        false,
        '',
        REF('MST_LibraryItems', 'libraryItemId')
      ),

      C(
        'Hoạt động liên kết',
        'activityId',
        T.ID,
        false,
        '',
        REF('MST_Activities', 'activityId')
      ),

      C(
        'Nguồn tạo',
        'sourceType',
        T.ENUM,
        true,
        'MANUAL',
        E('ASSIGNMENT_SOURCE_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Mã nguồn tạo',
        'sourceId',
        T.ID,
        false,
        '',
        null
      ),

      C(
        'Mức ưu tiên',
        'priority',
        T.ENUM,
        true,
        'NORMAL',
        E('PRIORITY_LEVEL')
      ),

      C(
        'Mở từ',
        'availableFrom',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Hạn hoàn thành',
        'dueAt',
        T.DATETIME,
        false,
        '',
        null,
        {
          indexed: true
        }
      ),

      C(
        'Thời lượng dự kiến phút',
        'estimatedMinutes',
        T.NUMBER,
        false,
        '',
        INTEGER(1, 10000)
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'ASSIGNED',
        E('ASSIGNMENT_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Phần trăm hoàn thành',
        'progressPercent',
        T.NUMBER,
        true,
        0,
        RANGE(0, 100)
      ),

      C(
        'Bắt buộc hoàn thành',
        'isRequired',
        T.BOOLEAN,
        true,
        true,
        null
      ),

      C(
        'Quy tắc lặp',
        'recurrenceRule',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 500
        }
      ),

      C(
        'Attempt gần nhất',
        'latestAttemptId',
        T.ID,
        false,
        '',
        REF('DATA_Attempts', 'attemptId')
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
        'Hoàn thành tự động',
        'autoCompleted',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Điểm thưởng',
        'rewardPoints',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000)
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
        'Giao dịch thưởng',
        'rewardTransactionId',
        T.ID,
        false,
        '',
        REF('DATA_RewardTransactions', 'rewardTransactionId')
      ),

      C(
        'Người giao',
        'assignedBy',
        T.STRING,
        true,
        D.SYSTEM,
        null,
        {
          maxLength: 100
        }
      ),

      C(
        'Ngày giao',
        'assignedAt',
        T.DATETIME,
        true,
        D.NOW,
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
   * 5. DATA_DailyGoals
   * ==============================================================
   */
  schema.DATA_DailyGoals = SHEET({
    group: 'PROGRESS',

    description:
      'Mục tiêu học tập trong ngày của bé.',

    primaryKey: 'dailyGoalId',

    uniqueKeys: [
      ['dailyGoalId']
    ],

    logicalIndexes: [
      'dailyGoalId',
      'childId',
      'goalDate',
      'goalType',
      'subjectId',
      'assignmentId',
      'status'
    ],

    retentionPolicy:
      'Lưu lịch sử mục tiêu ngày để theo dõi thói quen học tập.',

    columns: [
      C(
        'Mã mục tiêu',
        'dailyGoalId',
        T.ID,
        true,
        '',
        ID('DGL_'),
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
        'Ngày áp dụng',
        'goalDate',
        T.DATE,
        true,
        D.TODAY,
        null,
        {
          indexed: true
        }
      ),

      C(
        'Loại mục tiêu',
        'goalType',
        T.ENUM,
        true,
        'STUDY_MINUTES',
        E('DAILY_GOAL_TYPE'),
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
        'Mô tả',
        'description',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 2000
        }
      ),

      C(
        'Giá trị mục tiêu',
        'targetValue',
        T.NUMBER,
        true,
        1,
        RANGE(0, 1000000)
      ),

      C(
        'Giá trị hiện tại',
        'currentValue',
        T.NUMBER,
        true,
        0,
        RANGE(0, 1000000)
      ),

      C(
        'Đơn vị',
        'unit',
        T.ENUM,
        true,
        'TIMES',
        E('DAILY_GOAL_UNIT')
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
        'Nhiệm vụ liên kết',
        'assignmentId',
        T.ID,
        false,
        '',
        REF('DATA_Assignments', 'assignmentId'),
        {
          indexed: true
        }
      ),

      C(
        'Bắt buộc',
        'isRequired',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'NOT_STARTED',
        E('DAILY_GOAL_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Phần trăm hoàn thành',
        'progressPercent',
        T.NUMBER,
        true,
        0,
        RANGE(0, 100)
      ),

      C(
        'Điểm thưởng',
        'rewardPoints',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000)
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
        'Giao dịch thưởng',
        'rewardTransactionId',
        T.ID,
        false,
        '',
        REF('DATA_RewardTransactions', 'rewardTransactionId')
      ),

      C(
        'Nguồn tạo',
        'sourceType',
        T.ENUM,
        true,
        'SYSTEM_DAILY_PLAN',
        E('ASSIGNMENT_SOURCE_TYPE')
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
        'Hoàn thành lúc',
        'completedAt',
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
   * 6. DATA_ReviewQueue
   * ==============================================================
   */
  schema.DATA_ReviewQueue = SHEET({
    group: 'PROGRESS',

    description:
      'Hàng đợi nội dung cần ôn lại theo câu hỏi, kỹ năng hoặc bài học.',

    primaryKey: 'reviewQueueId',

    uniqueKeys: [
      ['reviewQueueId']
    ],

    logicalIndexes: [
      'reviewQueueId',
      'childId',
      'subjectId',
      'skillId',
      'questionId',
      'lessonId',
      'reviewItemType',
      'reasonCode',
      'nextReviewAt',
      'status'
    ],

    retentionPolicy:
      'Không xóa lịch sử ôn tập. Dùng MASTERED, SNOOZED hoặc REMOVED để ngừng hiển thị.',

    columns: [
      C(
        'Mã hàng đợi ôn',
        'reviewQueueId',
        T.ID,
        true,
        '',
        ID('RVQ_'),
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
        'Môn học',
        'subjectId',
        T.ID,
        true,
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
        'Câu hỏi',
        'questionId',
        T.ID,
        false,
        '',
        REF('MST_Questions', 'questionId'),
        {
          indexed: true
        }
      ),

      C(
        'Bài học',
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
        'Loại nội dung ôn',
        'reviewItemType',
        T.ENUM,
        true,
        'QUESTION',
        E('REVIEW_ITEM_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Lý do ôn',
        'reasonCode',
        T.ENUM,
        true,
        'WRONG_ANSWER',
        E('REVIEW_QUEUE_REASON'),
        {
          indexed: true
        }
      ),

      C(
        'Mức ưu tiên',
        'priorityScore',
        T.NUMBER,
        true,
        50,
        RANGE(0, 100)
      ),

      C(
        'Độ khó hiện tại',
        'difficultyLevel',
        T.ENUM,
        false,
        '',
        E('DIFFICULTY_LEVEL')
      ),

      C(
        'Số lần xuất hiện',
        'exposureCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 1000000)
      ),

      C(
        'Số lần sai',
        'incorrectCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 1000000)
      ),

      C(
        'Số lần đúng',
        'correctCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 1000000)
      ),

      C(
        'Chuỗi đúng hiện tại',
        'currentCorrectStreak',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 1000000)
      ),

      C(
        'Sai gần nhất lúc',
        'lastIncorrectAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Đúng gần nhất lúc',
        'lastCorrectAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Ôn gần nhất lúc',
        'lastReviewedAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Ngày ôn tiếp theo',
        'nextReviewAt',
        T.DATETIME,
        true,
        D.NOW,
        null,
        {
          indexed: true
        }
      ),

      C(
        'Khoảng cách ôn ngày',
        'intervalDays',
        T.NUMBER,
        true,
        1,
        INTEGER(0, 10000)
      ),

      C(
        'Hệ số dễ',
        'easeFactor',
        T.NUMBER,
        true,
        2.5,
        RANGE(0, 10)
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'PENDING',
        E('REVIEW_QUEUE_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Nguồn tạo',
        'sourceType',
        T.ENUM,
        true,
        'SYSTEM',
        E('REVIEW_QUEUE_SOURCE_TYPE')
      ),

      C(
        'Mã nguồn',
        'sourceId',
        T.ID,
        false,
        '',
        null
      ),

      C(
        'Attempt ôn gần nhất',
        'latestReviewAttemptId',
        T.ID,
        false,
        '',
        REF('DATA_Attempts', 'attemptId')
      ),

      C(
        'Ghi chú phụ huynh',
        'familyNote',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 2000
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


  return schema;
}