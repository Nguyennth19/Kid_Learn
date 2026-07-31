/**
 * ================================================================
 * KIDLEARN V3 - SCHEMA GROUP 03
 * CÂU HỎI, ĐÁNH GIÁ, ATTEMPTS VÀ RESPONSES
 * Version: 3.1.0
 * ================================================================
 */


/**
 * Enum của nhóm câu hỏi và đánh giá.
 */
function kidlearnV3_enumGroup03Assessment_() {
  return {
    QUESTION_TYPE: [
      'SINGLE_CHOICE',
      'MULTIPLE_CHOICE',
      'TRUE_FALSE',
      'FILL_BLANK',
      'NUMBER_INPUT',
      'MATCHING',
      'ORDERING',
      'IMAGE_SELECT',
      'WORD_BUILDING',
      'DRAG_DROP',
      'SHORT_ANSWER',
      'FREE_RESPONSE',
      'READ_ALOUD',
      'SPEAKING',
      'DRAWING',
      'FILE_UPLOAD'
    ],

    QUESTION_GRADING_METHOD: [
      'EXACT_MATCH',
      'OPTION_KEY',
      'NUMERIC',
      'ORDER_MATCH',
      'PAIR_MATCH',
      'KEYWORD',
      'RUBRIC',
      'AI_ASSISTED',
      'MANUAL'
    ],

    QUESTION_SOURCE_TYPE: [
      'TEXTBOOK',
      'ADVANCED_MATERIAL',
      'PARENT_CREATED',
      'AI_GENERATED',
      'SYSTEM_TEMPLATE'
    ],

    ASSESSMENT_TYPE: [
      'LESSON_PRACTICE',
      'DAILY_REVIEW',
      'PERIODIC_REVIEW',
      'TOPIC_TEST',
      'DIAGNOSTIC',
      'CHALLENGE',
      'PARENT_ASSIGNED'
    ],

    QUESTION_SELECTION_MODE: [
      'FIXED',
      'RANDOM_FROM_POOL',
      'RANDOM_BY_SKILL',
      'RANDOM_BY_DIFFICULTY',
      'REVIEW_QUEUE'
    ],

    RESULT_POLICY: [
      'LATEST',
      'HIGHEST',
      'FIRST',
      'AVERAGE'
    ],

    ATTEMPT_STATUS: [
      'CREATED',
      'IN_PROGRESS',
      'SUBMITTED',
      'GRADING',
      'GRADED',
      'CANCELLED',
      'EXPIRED'
    ],

    AI_GRADING_STATUS: [
      'NOT_REQUIRED',
      'PENDING',
      'PROCESSING',
      'COMPLETED',
      'FAILED',
      'MANUAL_REVIEW_REQUIRED'
    ],

    RESPONSE_STATUS: [
      'UNANSWERED',
      'ANSWERED',
      'PENDING_GRADING',
      'GRADED',
      'REVIEW_REQUIRED'
    ],

    RESPONSE_GRADING_SOURCE: [
      'NONE',
      'AUTO',
      'AI',
      'FAMILY',
      'MIXED'
    ],

    RESULT_LEVEL: [
      'NOT_PASSED',
      'PASSED',
      'MASTERED'
    ]
  };
}


/**
 * Schema của 6 Sheet nhóm câu hỏi và đánh giá.
 */
function kidlearnV3_schemaGroup03Assessment_() {
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
   * 1. MST_Questions
   * ==============================================================
   */
  schema.MST_Questions = SHEET({
    group: 'ASSESSMENT',

    description:
      'Kho câu hỏi chính thức đã được duyệt hoặc xuất bản.',

    primaryKey: 'questionId',

    uniqueKeys: [
      ['questionId'],
      ['questionCode']
    ],

    logicalIndexes: [
      'questionId',
      'questionCode',
      'subjectId',
      'curriculumId',
      'topicId',
      'lessonId',
      'primarySkillId',
      'questionType',
      'difficultyLevel',
      'status'
    ],

    retentionPolicy:
      'Không sửa trực tiếp câu hỏi đã được sử dụng trong attempt. Tạo câu mới và archive câu cũ.',

    columns: [
      C(
        'Mã câu hỏi',
        'questionId',
        T.ID,
        true,
        '',
        ID('QUE_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Mã câu hỏi ngắn',
        'questionCode',
        T.STRING,
        true,
        '',
        REGEX(
          '^[A-Z0-9_\\-]+$',
          'Mã câu hỏi dùng chữ in hoa, số, gạch dưới hoặc gạch ngang.'
        ),
        {
          unique: true,
          indexed: true,
          maxLength: 120
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
        'Chương trình',
        'curriculumId',
        T.ID,
        true,
        '',
        REF('MST_Curriculums', 'curriculumId'),
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
        'Kỹ năng chính',
        'primarySkillId',
        T.ID,
        true,
        '',
        REF('MST_Skills', 'skillId'),
        {
          indexed: true
        }
      ),

      C(
        'Loại câu hỏi',
        'questionType',
        T.ENUM,
        true,
        'SINGLE_CHOICE',
        E('QUESTION_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Nội dung câu hỏi',
        'questionText',
        T.STRING,
        true,
        '',
        null,
        {
          maxLength: 10000
        }
      ),

      C(
        'Hướng dẫn',
        'instructions',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 3000
        }
      ),

      C(
        'Nội dung ngữ cảnh',
        'contextText',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 10000
        }
      ),

      C(
        'Block ngữ cảnh',
        'contextBlockId',
        T.ID,
        false,
        '',
        REF('MST_LessonBlocks', 'blockId')
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
        'Độ khó',
        'difficultyLevel',
        T.ENUM,
        true,
        'BASIC',
        E('DIFFICULTY_LEVEL'),
        {
          indexed: true
        }
      ),

      C(
        'Điểm mặc định',
        'defaultPoints',
        T.NUMBER,
        true,
        1,
        RANGE(0, 1000)
      ),

      C(
        'Thời gian gợi ý giây',
        'estimatedSeconds',
        T.NUMBER,
        true,
        60,
        INTEGER(0, 36000)
      ),

      C(
        'Kiểu chấm',
        'gradingMethod',
        T.ENUM,
        true,
        'OPTION_KEY',
        E('QUESTION_GRADING_METHOD')
      ),

      C(
        'Đáp án chuẩn',
        'answerKeyJson',
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
        'Đáp án được chấp nhận',
        'acceptedAnswersJson',
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
        'Phân biệt hoa thường',
        'caseSensitive',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Phân biệt dấu tiếng Việt',
        'accentSensitive',
        T.BOOLEAN,
        true,
        true,
        null
      ),

      C(
        'Sai số số học',
        'numericTolerance',
        T.NUMBER,
        false,
        '',
        RANGE(0, 1000000)
      ),

      C(
        'Cho điểm từng phần',
        'allowPartialCredit',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Gợi ý',
        'hintText',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 3000
        }
      ),

      C(
        'Trừ điểm khi xem gợi ý',
        'hintPenaltyPercent',
        T.NUMBER,
        true,
        0,
        RANGE(0, 100)
      ),

      C(
        'Giải thích đáp án',
        'explanationText',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 10000
        }
      ),

      C(
        'Tài nguyên giải thích',
        'explanationMediaAssetId',
        T.ID,
        false,
        '',
        REF('MST_MediaAssets', 'mediaAssetId')
      ),

      C(
        'Rubric chấm',
        'rubricJson',
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
        'Model AI đề xuất',
        'preferredAiModel',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 150
        }
      ),

      C(
        'Ngưỡng tin cậy AI',
        'aiConfidenceThreshold',
        T.NUMBER,
        false,
        '',
        RANGE(0, 1)
      ),

      C(
        'Nguồn câu hỏi',
        'sourceType',
        T.ENUM,
        true,
        'PARENT_CREATED',
        E('QUESTION_SOURCE_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Tham chiếu nguồn',
        'sourceReference',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 1000
        }
      ),

      C(
        'Trang nguồn',
        'sourcePage',
        T.NUMBER,
        false,
        '',
        INTEGER(0, 10000)
      ),

      C(
        'Thay thế câu hỏi',
        'replacesQuestionId',
        T.ID,
        false,
        '',
        REF('MST_Questions', 'questionId')
      ),

      C(
        'Phiên bản nội dung',
        'contentVersion',
        T.STRING,
        true,
        '1.0.0',
        REGEX(
          '^\\d+\\.\\d+\\.\\d+$',
          'Phiên bản phải có dạng x.y.z.'
        )
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'DRAFT',
        E('CONTENT_STATUS'),
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
   * 2. MST_QuestionOptions
   * ==============================================================
   */
  schema.MST_QuestionOptions = SHEET({
    group: 'ASSESSMENT',

    description:
      'Lựa chọn, phần tử ghép đôi, kéo thả hoặc thứ tự của câu hỏi.',

    primaryKey: 'optionId',

    uniqueKeys: [
      ['optionId'],
      ['questionId', 'optionCode']
    ],

    logicalIndexes: [
      'optionId',
      'questionId',
      'optionCode',
      'isCorrect',
      'status',
      'sortOrder'
    ],

    retentionPolicy:
      'Không xóa option đã xuất hiện trong câu trả lời. Archive câu hỏi nếu cần sửa lớn.',

    columns: [
      C(
        'ID lựa chọn',
        'optionId',
        T.ID,
        true,
        '',
        ID('OPT_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Câu hỏi',
        'questionId',
        T.ID,
        true,
        '',
        REF('MST_Questions', 'questionId'),
        {
          indexed: true
        }
      ),

      C(
        'Mã lựa chọn ngắn',
        'optionCode',
        T.STRING,
        true,
        '',
        REGEX(
          '^[A-Z0-9_\\-]+$',
          'Mã lựa chọn dùng chữ in hoa, số, gạch dưới hoặc gạch ngang.'
        ),
        {
          indexed: true,
          maxLength: 50
        }
      ),

      C(
        'Nội dung lựa chọn',
        'optionText',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 5000
        }
      ),

      C(
        'Tài nguyên',
        'mediaAssetId',
        T.ID,
        false,
        '',
        REF('MST_MediaAssets', 'mediaAssetId')
      ),

      C(
        'Giá trị kỹ thuật',
        'optionValue',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 500
        }
      ),

      C(
        'Là đáp án đúng',
        'isCorrect',
        T.BOOLEAN,
        true,
        false,
        null,
        {
          sensitive: true,
          indexed: true
        }
      ),

      C(
        'Điểm riêng',
        'optionPoints',
        T.NUMBER,
        false,
        '',
        RANGE(0, 1000)
      ),

      C(
        'Nhóm',
        'groupKey',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 100
        }
      ),

      C(
        'Khóa ghép đúng',
        'matchKey',
        T.STRING,
        false,
        '',
        null,
        {
          sensitive: true,
          maxLength: 100
        }
      ),

      C(
        'Thứ tự đúng',
        'correctOrder',
        T.NUMBER,
        false,
        '',
        INTEGER(0, 99999),
        {
          sensitive: true
        }
      ),

      C(
        'Giải thích lựa chọn',
        'feedbackText',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 3000
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
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'DRAFT',
        E('CONTENT_STATUS'),
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
   * 3. MST_Assessments
   * ==============================================================
   */
  schema.MST_Assessments = SHEET({
    group: 'ASSESSMENT',

    description:
      'Bài luyện tập, bài ôn tập, kiểm tra chủ đề hoặc thử thách.',

    primaryKey: 'assessmentId',

    uniqueKeys: [
      ['assessmentId'],
      ['assessmentCode']
    ],

    logicalIndexes: [
      'assessmentId',
      'assessmentCode',
      'assessmentType',
      'subjectId',
      'curriculumId',
      'topicId',
      'lessonId',
      'status'
    ],

    retentionPolicy:
      'Không xóa assessment đã có attempt. Archive khi không dùng nữa.',

    columns: [
      C(
        'Mã bài đánh giá',
        'assessmentId',
        T.ID,
        true,
        '',
        ID('ASM_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Mã bài ngắn',
        'assessmentCode',
        T.STRING,
        true,
        '',
        REGEX(
          '^[A-Z0-9_\\-]+$',
          'Mã bài dùng chữ in hoa, số, gạch dưới hoặc gạch ngang.'
        ),
        {
          unique: true,
          indexed: true,
          maxLength: 120
        }
      ),

      C(
        'Tên bài',
        'assessmentTitle',
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
        'Loại bài',
        'assessmentType',
        T.ENUM,
        true,
        'LESSON_PRACTICE',
        E('ASSESSMENT_TYPE'),
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
        'Chương trình',
        'curriculumId',
        T.ID,
        true,
        '',
        REF('MST_Curriculums', 'curriculumId'),
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
        'Hướng dẫn',
        'instructions',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 3000
        }
      ),

      C(
        'Cách chọn câu',
        'questionSelectionMode',
        T.ENUM,
        true,
        'FIXED',
        E('QUESTION_SELECTION_MODE')
      ),

      C(
        'Số câu cần lấy',
        'questionCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 1000)
      ),

      C(
        'Tổng điểm tối đa',
        'maximumScore',
        T.NUMBER,
        true,
        0,
        RANGE(0, 100000)
      ),

      C(
        'Ngưỡng đạt',
        'passingPercent',
        T.NUMBER,
        true,
        70,
        RANGE(0, 100)
      ),

      C(
        'Ngưỡng thành thạo',
        'masteryPercent',
        T.NUMBER,
        true,
        85,
        RANGE(0, 100)
      ),

      C(
        'Giới hạn thời gian phút',
        'timeLimitMinutes',
        T.NUMBER,
        false,
        '',
        INTEGER(1, 1440)
      ),

      C(
        'Số lần làm tối đa',
        'maximumAttempts',
        T.NUMBER,
        false,
        '',
        INTEGER(1, 999)
      ),

      C(
        'Thời gian chờ làm lại phút',
        'retryDelayMinutes',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000)
      ),

      C(
        'Trộn câu hỏi',
        'shuffleQuestions',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Trộn đáp án',
        'shuffleOptions',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Cho phép bỏ qua câu',
        'allowSkipQuestion',
        T.BOOLEAN,
        true,
        true,
        null
      ),

      C(
        'Cho quay lại câu trước',
        'allowBackNavigation',
        T.BOOLEAN,
        true,
        true,
        null
      ),

      C(
        'Tự nộp khi hết giờ',
        'autoSubmitOnTimeout',
        T.BOOLEAN,
        true,
        true,
        null
      ),

      C(
        'Hiện điểm sau nộp',
        'showScoreAfterSubmit',
        T.BOOLEAN,
        true,
        true,
        null
      ),

      C(
        'Hiện đáp án đúng',
        'showCorrectAnswers',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Hiện giải thích',
        'showExplanations',
        T.BOOLEAN,
        true,
        true,
        null
      ),

      C(
        'Cho làm lại câu sai',
        'allowRetryWrongQuestions',
        T.BOOLEAN,
        true,
        true,
        null
      ),

      C(
        'Cách tính điểm đại diện',
        'resultPolicy',
        T.ENUM,
        true,
        'HIGHEST',
        E('RESULT_POLICY')
      ),

      C(
        'Tính vào bảng điểm',
        'includeInGradebook',
        T.BOOLEAN,
        true,
        true,
        null
      ),

      C(
        'Trọng số bảng điểm',
        'gradebookWeight',
        T.NUMBER,
        false,
        '',
        RANGE(0, 1000)
      ),

      C(
        'Điểm thưởng hoàn thành',
        'completionRewardPoints',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000)
      ),

      C(
        'Điểm thưởng thành thạo',
        'masteryRewardPoints',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000)
      ),

      C(
        'Quy tắc mở khóa',
        'unlockRule',
        T.ENUM,
        true,
        'ALWAYS_OPEN',
        E('UNLOCK_RULE')
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
        'Mở đến',
        'availableUntil',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Phiên bản nội dung',
        'contentVersion',
        T.STRING,
        true,
        '1.0.0',
        REGEX(
          '^\\d+\\.\\d+\\.\\d+$',
          'Phiên bản phải có dạng x.y.z.'
        )
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'DRAFT',
        E('CONTENT_STATUS'),
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
   * 4. MST_AssessmentQuestions
   * ==============================================================
   */
  schema.MST_AssessmentQuestions = SHEET({
    group: 'ASSESSMENT',

    description:
      'Liên kết câu hỏi vào bài đánh giá.',

    primaryKey: 'assessmentQuestionId',

    uniqueKeys: [
      ['assessmentQuestionId'],
      ['assessmentId', 'questionId']
    ],

    logicalIndexes: [
      'assessmentQuestionId',
      'assessmentId',
      'questionId',
      'poolGroup',
      'isRequired',
      'status',
      'sortOrder'
    ],

    retentionPolicy:
      'Không xóa liên kết đã có attempt, chỉ archive assessment nếu cần.',

    columns: [
      C(
        'Mã liên kết',
        'assessmentQuestionId',
        T.ID,
        true,
        '',
        ID('ASQ_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Bài đánh giá',
        'assessmentId',
        T.ID,
        true,
        '',
        REF('MST_Assessments', 'assessmentId'),
        {
          indexed: true
        }
      ),

      C(
        'Câu hỏi',
        'questionId',
        T.ID,
        true,
        '',
        REF('MST_Questions', 'questionId'),
        {
          indexed: true
        }
      ),

      C(
        'Mã phần',
        'sectionCode',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 100
        }
      ),

      C(
        'Nhóm chọn ngẫu nhiên',
        'poolGroup',
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
        'Điểm trong bài',
        'points',
        T.NUMBER,
        true,
        1,
        RANGE(0, 1000)
      ),

      C(
        'Bắt buộc',
        'isRequired',
        T.BOOLEAN,
        true,
        true,
        null,
        {
          indexed: true
        }
      ),

      C(
        'Câu neo cố định',
        'isAnchorQuestion',
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
        'Trộn đáp án riêng',
        'shuffleOptionsOverride',
        T.BOOLEAN,
        false,
        '',
        null
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'DRAFT',
        E('CONTENT_STATUS'),
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
   * 5. DATA_Attempts
   * ==============================================================
   */
  schema.DATA_Attempts = SHEET({
    group: 'ASSESSMENT_DATA',

    description:
      'Một lần bé làm một assessment.',

    primaryKey: 'attemptId',

    uniqueKeys: [
      ['attemptId']
    ],

    logicalIndexes: [
      'attemptId',
      'assessmentId',
      'childId',
      'assignmentId',
      'status',
      'startedAt',
      'submittedAt',
      'gradedAt'
    ],

    retentionPolicy:
      'Lưu toàn bộ lịch sử làm bài. Không ghi đè attempt cũ.',

    columns: [
      C(
        'Mã lần làm',
        'attemptId',
        T.ID,
        true,
        '',
        ID('ATT_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Bài đánh giá',
        'assessmentId',
        T.ID,
        true,
        '',
        REF('MST_Assessments', 'assessmentId'),
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
        'Nhiệm vụ liên quan',
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
        'Số lần làm',
        'attemptNumber',
        T.NUMBER,
        true,
        1,
        INTEGER(1, 9999)
      ),

      C(
        'Phiên bản bài',
        'assessmentVersion',
        T.STRING,
        true,
        '1.0.0',
        REGEX(
          '^\\d+\\.\\d+\\.\\d+$',
          'Phiên bản phải có dạng x.y.z.'
        )
      ),

      C(
        'Danh sách câu',
        'questionOrderJson',
        T.JSON,
        true,
        D.EMPTY_JSON_ARRAY,
        JSON_VALUE(),
        {
          maxLength: 10000
        }
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'CREATED',
        E('ATTEMPT_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Bắt đầu lúc',
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
        'Lưu cuối lúc',
        'lastSavedAt',
        T.DATETIME,
        true,
        D.NOW,
        null
      ),

      C(
        'Nộp lúc',
        'submittedAt',
        T.DATETIME,
        false,
        '',
        null,
        {
          indexed: true
        }
      ),

      C(
        'Chấm xong lúc',
        'gradedAt',
        T.DATETIME,
        false,
        '',
        null,
        {
          indexed: true
        }
      ),

      C(
        'Thời lượng giây',
        'durationSeconds',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 86400)
      ),

      C(
        'Điểm đạt',
        'scoreEarned',
        T.NUMBER,
        true,
        0,
        RANGE(0, 100000)
      ),

      C(
        'Điểm tối đa',
        'scoreMaximum',
        T.NUMBER,
        true,
        0,
        RANGE(0, 100000)
      ),

      C(
        'Phần trăm điểm',
        'scorePercent',
        T.NUMBER,
        true,
        0,
        RANGE(0, 100)
      ),

      C(
        'Điểm thang 10',
        'scoreOutOf10',
        T.NUMBER,
        true,
        0,
        RANGE(0, 10)
      ),

      C(
        'Số câu đúng',
        'correctCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000)
      ),

      C(
        'Số câu sai',
        'incorrectCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000)
      ),

      C(
        'Số câu chưa trả lời',
        'unansweredCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000)
      ),

      C(
        'Đạt yêu cầu',
        'isPassed',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Đạt thành thạo',
        'isMastered',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Mức kết quả',
        'resultLevel',
        T.ENUM,
        true,
        'NOT_PASSED',
        E('RESULT_LEVEL')
      ),

      C(
        'Trạng thái chấm AI',
        'aiGradingStatus',
        T.ENUM,
        true,
        'NOT_REQUIRED',
        E('AI_GRADING_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Số câu chờ chấm',
        'pendingGradingCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000)
      ),

      C(
        'Nhận xét tổng hợp',
        'feedbackSummary',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 5000
        }
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
        'Phiên học',
        'studySessionId',
        T.ID,
        false,
        '',
        REF('DATA_StudySessions', 'studySessionId')
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
   * 6. DATA_Responses
   * ==============================================================
   */
  schema.DATA_Responses = SHEET({
    group: 'ASSESSMENT_DATA',

    description:
      'Câu trả lời cụ thể của bé cho từng câu trong một attempt.',

    primaryKey: 'responseId',

    uniqueKeys: [
      ['responseId'],
      ['attemptId', 'questionId']
    ],

    logicalIndexes: [
      'responseId',
      'attemptId',
      'questionId',
      'questionOrder',
      'status',
      'gradingMethod',
      'isCorrect'
    ],

    retentionPolicy:
      'Lưu toàn bộ câu trả lời để đối chiếu, ôn tập và báo cáo.',

    columns: [
      C(
        'Mã câu trả lời',
        'responseId',
        T.ID,
        true,
        '',
        ID('RSP_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Lần làm',
        'attemptId',
        T.ID,
        true,
        '',
        REF('DATA_Attempts', 'attemptId'),
        {
          indexed: true
        }
      ),

      C(
        'Câu hỏi',
        'questionId',
        T.ID,
        true,
        '',
        REF('MST_Questions', 'questionId'),
        {
          indexed: true
        }
      ),

      C(
        'Phiên bản câu hỏi',
        'questionVersion',
        T.STRING,
        true,
        '1.0.0',
        REGEX(
          '^\\d+\\.\\d+\\.\\d+$',
          'Phiên bản phải có dạng x.y.z.'
        )
      ),

      C(
        'Thứ tự câu',
        'questionOrder',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 99999),
        {
          indexed: true
        }
      ),

      C(
        'Lựa chọn đã chọn',
        'selectedOptionIdsJson',
        T.JSON,
        false,
        '',
        JSON_VALUE(),
        {
          maxLength: 5000
        }
      ),

      C(
        'Câu trả lời văn bản',
        'answerText',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 10000
        }
      ),

      C(
        'Câu trả lời số',
        'answerNumber',
        T.NUMBER,
        false,
        '',
        null
      ),

      C(
        'Câu trả lời cấu trúc',
        'answerJson',
        T.JSON,
        false,
        '',
        JSON_VALUE(),
        {
          maxLength: 10000
        }
      ),

      C(
        'Drive ID file trả lời',
        'responseFileId',
        T.FILE_ID,
        false,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Loại file trả lời',
        'responseMimeType',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 200
        }
      ),

      C(
        'Văn bản nhận dạng',
        'transcriptText',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 10000
        }
      ),

      C(
        'Đúng hay sai',
        'isCorrect',
        T.BOOLEAN,
        false,
        '',
        null,
        {
          indexed: true
        }
      ),

      C(
        'Điểm đạt',
        'scoreAwarded',
        T.NUMBER,
        true,
        0,
        RANGE(0, 100000)
      ),

      C(
        'Điểm tối đa',
        'maximumPoints',
        T.NUMBER,
        true,
        0,
        RANGE(0, 100000)
      ),

      C(
        'Phương thức chấm',
        'gradingMethod',
        T.ENUM,
        true,
        'AUTO',
        E('RESPONSE_GRADING_SOURCE'),
        {
          indexed: true
        }
      ),

      C(
        'Nhận xét',
        'feedbackText',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 5000
        }
      ),

      C(
        'Đã hiện giải thích',
        'explanationShown',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Model AI',
        'aiModel',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 150
        }
      ),

      C(
        'Độ tin cậy AI',
        'aiConfidence',
        T.NUMBER,
        false,
        '',
        RANGE(0, 1)
      ),

      C(
        'Chi tiết chấm AI',
        'aiGradingJson',
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
        'Cần phụ huynh duyệt',
        'requiresManualReview',
        T.BOOLEAN,
        true,
        false,
        null,
        {
          indexed: true
        }
      ),

      C(
        'Người duyệt',
        'reviewedBy',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 100
        }
      ),

      C(
        'Duyệt lúc',
        'reviewedAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Trả lời lúc',
        'answeredAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Chấm lúc',
        'gradedAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Đã thêm vào ôn tập',
        'addedToReviewQueue',
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
        'UNANSWERED',
        E('RESPONSE_STATUS'),
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


  return schema;
}