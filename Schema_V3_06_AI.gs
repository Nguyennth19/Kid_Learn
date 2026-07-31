/**
 * ================================================================
 * KIDLEARN V3 - SCHEMA GROUP 06
 * AI, STAGING, APPROVAL QUEUE VÀ NHẬP NỘI DUNG
 * Version: 3.1.0
 * ================================================================
 */


/**
 * Enum của nhóm AI, staging và nhập nội dung.
 */
function kidlearnV3_enumGroup06AI_() {
  return {
    AI_CONTENT_SOURCE_TYPE: [
      'TEXTBOOK_PDF',
      'GOOGLE_DOC',
      'WORKSHEET',
      'YOUTUBE',
      'AUDIO',
      'IMAGE',
      'PARENT_CREATED',
      'AI_GENERATED',
      'EXTERNAL_REFERENCE'
    ],

    CONTENT_IMPORT_PROCESSING_STATUS: [
      'NEW',
      'QUEUED',
      'PROCESSING',
      'EXTRACTED',
      'ANALYZED',
      'VALIDATED',
      'FAILED',
      'CANCELLED'
    ],

    STG_APPROVAL_STATUS: [
      'NOT_READY',
      'DRAFT',
      'PENDING',
      'PENDING_REVIEW',
      'IN_REVIEW',
      'APPROVED',
      'REJECTED',
      'NEEDS_REVISION',
      'PUBLISHED',
      'ARCHIVED'
    ],

    STG_VALIDATION_STATUS: [
      'NOT_CHECKED',
      'PASSED',
      'PASSED_WITH_WARNINGS',
      'FAILED'
    ],

    APPROVAL_ENTITY_TYPE: [
      'LESSON_DRAFT',
      'LESSON_BLOCK_DRAFT',
      'QUESTION_DRAFT',
      'ASSESSMENT_DRAFT',
      'LIBRARY_ITEM_DRAFT',
      'MEDIA_ASSET',
      'AI_GRADING_RESULT',
      'CONTENT_IMPORT',
      'FLASHCARD_DRAFT'
    ],

    APPROVAL_DECISION: [
      'APPROVE',
      'REJECT',
      'REQUEST_REVISION',
      'PUBLISH',
      'ARCHIVE'
    ],

    AI_JOB_TYPE: [
      'ANALYZE_DOCUMENT',
      'EXTRACT_LESSONS',
      'GENERATE_LESSON_DRAFT',
      'GENERATE_QUESTIONS',
      'GENERATE_FLASHCARDS',
      'GENERATE_READING_TEXT',
      'GENERATE_SUMMARY',
      'GENERATE_RUBRIC',
      'GRADE_FREE_RESPONSE',
      'TRANSCRIBE_AUDIO',
      'ASSESS_READING_ALOUD',
      'GENERATE_FEEDBACK',
      'VALIDATE_CONTENT',
      'SIMPLIFY_TEXT',
      'TRANSLATE_CONTENT'
    ],

    AI_JOB_STATUS: [
      'QUEUED',
      'PROCESSING',
      'COMPLETED',
      'FAILED',
      'RETRYING',
      'CANCELLED',
      'WAITING_APPROVAL'
    ],

    AI_LOG_EVENT_TYPE: [
      'JOB_CREATED',
      'JOB_STARTED',
      'API_REQUEST_SENT',
      'API_RESPONSE_RECEIVED',
      'OUTPUT_VALIDATED',
      'APPROVAL_CREATED',
      'CONTENT_PUBLISHED',
      'JOB_FAILED',
      'JOB_RETRIED',
      'JOB_CANCELLED'
    ],

    AI_RESULT_STATUS: [
      'SUCCESS',
      'WARNING',
      'FAILED',
      'BLOCKED',
      'REQUIRES_REVIEW'
    ]
  };
}


/**
 * Schema của 5 Sheet nhóm AI, staging và nhập nội dung.
 */
function kidlearnV3_schemaGroup06AI_() {
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
   * 1. STG_ContentImports
   * ==============================================================
   */
  schema.STG_ContentImports = SHEET({
    group: 'AI_STAGING',

    description:
      'Lưu các lần nhập tài liệu nguồn và kết quả phân tích ban đầu.',

    primaryKey: 'contentImportId',

    uniqueKeys: [
      ['contentImportId']
    ],

    logicalIndexes: [
      'contentImportId',
      'sourceType',
      'subjectId',
      'curriculumId',
      'bookId',
      'topicId',
      'lessonId',
      'processingStatus',
      'approvalStatus',
      'latestAiJobId'
    ],

    retentionPolicy:
      'Không xóa import đã dùng để xuất bản nội dung. Archive khi không dùng nữa.',

    columns: [
      C(
        'Mã import',
        'contentImportId',
        T.ID,
        true,
        '',
        ID('IMP_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Tiêu đề import',
        'importTitle',
        T.STRING,
        true,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Loại nguồn',
        'sourceType',
        T.ENUM,
        true,
        'PARENT_CREATED',
        E('AI_CONTENT_SOURCE_TYPE'),
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
        'Chương trình',
        'curriculumId',
        T.ID,
        false,
        '',
        REF('MST_Curriculums', 'curriculumId'),
        {
          indexed: true
        }
      ),

      C(
        'Sách nguồn',
        'bookId',
        T.ID,
        false,
        '',
        REF('MST_Books', 'bookId'),
        {
          indexed: true
        }
      ),

      C(
        'Chủ đề dự kiến',
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
        'Bài học dự kiến',
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
        'Drive File ID',
        'sourceFileId',
        T.FILE_ID,
        false,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Google Docs ID',
        'sourceDocumentId',
        T.FILE_ID,
        false,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Drive Folder ID',
        'sourceFolderId',
        T.FILE_ID,
        false,
        '',
        null,
        {
          maxLength: 300
        }
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
        'Tên nguồn',
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
        'Trang bắt đầu',
        'sourcePageFrom',
        T.NUMBER,
        false,
        '',
        INTEGER(0, 10000)
      ),

      C(
        'Trang kết thúc',
        'sourcePageTo',
        T.NUMBER,
        false,
        '',
        INTEGER(0, 10000)
      ),

      C(
        'Tình trạng bản quyền',
        'rightsStatus',
        T.ENUM,
        true,
        'UNKNOWN',
        E('RIGHTS_STATUS'),
        {
          indexed: true
        }
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
        'Trạng thái xử lý',
        'processingStatus',
        T.ENUM,
        true,
        'NEW',
        E('CONTENT_IMPORT_PROCESSING_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Trạng thái duyệt',
        'approvalStatus',
        T.ENUM,
        true,
        'NOT_READY',
        E('STG_APPROVAL_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Nội dung trích xuất',
        'extractedText',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 10000
        }
      ),

      C(
        'File nội dung trích xuất',
        'extractedDocumentId',
        T.FILE_ID,
        false,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Kết quả phân tích',
        'analysisJson',
        T.JSON,
        false,
        '',
        JSON_VALUE(),
        {
          maxLength: 10000
        }
      ),

      C(
        'Số bài học đề xuất',
        'suggestedLessonCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 10000)
      ),

      C(
        'Số câu hỏi đề xuất',
        'suggestedQuestionCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000)
      ),

      C(
        'Số lỗi kiểm tra',
        'validationErrorCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000)
      ),

      C(
        'Chi tiết lỗi',
        'validationErrorsJson',
        T.JSON,
        false,
        '',
        JSON_VALUE(),
        {
          maxLength: 10000
        }
      ),

      C(
        'Job AI gần nhất',
        'latestAiJobId',
        T.ID,
        false,
        '',
        REF('DATA_AIJobs', 'aiJobId'),
        {
          indexed: true
        }
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
        'Ngày tạo',
        'createdAt',
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
        'Ngày cập nhật',
        'updatedAt',
        T.DATETIME,
        true,
        D.NOW,
        null
      ),

      C(
        'Ghi chú',
        'notes',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 3000
        }
      )
    ]
  });


  /**
   * ==============================================================
   * 2. STG_Questions
   * ==============================================================
   */
  schema.STG_Questions = SHEET({
    group: 'AI_STAGING',

    description:
      'Câu hỏi nháp do AI hoặc phụ huynh tạo trước khi duyệt và xuất bản.',

    primaryKey: 'stagingQuestionId',

    uniqueKeys: [
      ['stagingQuestionId']
    ],

    logicalIndexes: [
      'stagingQuestionId',
      'contentImportId',
      'aiJobId',
      'subjectId',
      'curriculumId',
      'topicId',
      'lessonId',
      'questionType',
      'validationStatus',
      'approvalStatus',
      'publishedQuestionId'
    ],

    retentionPolicy:
      'Không xóa câu hỏi staging đã được duyệt hoặc xuất bản. Archive khi không còn dùng.',

    columns: [
      C(
        'Mã câu hỏi nháp',
        'stagingQuestionId',
        T.ID,
        true,
        '',
        ID('STGQ_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Mã import',
        'contentImportId',
        T.ID,
        false,
        '',
        REF('STG_ContentImports', 'contentImportId'),
        {
          indexed: true
        }
      ),

      C(
        'Job AI',
        'aiJobId',
        T.ID,
        false,
        '',
        REF('DATA_AIJobs', 'aiJobId'),
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
        'Kỹ năng chính',
        'primarySkillId',
        T.ID,
        false,
        '',
        REF('MST_Skills', 'skillId')
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
        'Tài nguyên',
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
        E('DIFFICULTY_LEVEL')
      ),

      C(
        'Điểm đề xuất',
        'suggestedPoints',
        T.NUMBER,
        true,
        1,
        RANGE(0, 1000)
      ),

      C(
        'Thời gian đề xuất giây',
        'estimatedSeconds',
        T.NUMBER,
        true,
        60,
        INTEGER(0, 36000)
      ),

      C(
        'Đáp án nháp',
        'draftAnswerKeyJson',
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
        'Lựa chọn nháp',
        'draftOptionsJson',
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
        'Giải thích nháp',
        'draftExplanationText',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 10000
        }
      ),

      C(
        'Rubric nháp',
        'draftRubricJson',
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
        'Nguồn câu hỏi',
        'sourceType',
        T.ENUM,
        true,
        'AI_GENERATED',
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
        'Điểm chất lượng AI',
        'aiQualityScore',
        T.NUMBER,
        false,
        '',
        RANGE(0, 100)
      ),

      C(
        'Mức tin cậy AI',
        'aiConfidence',
        T.NUMBER,
        false,
        '',
        RANGE(0, 1)
      ),

      C(
        'Cờ cảnh báo',
        'riskFlagsJson',
        T.JSON,
        false,
        '',
        JSON_VALUE(),
        {
          maxLength: 10000
        }
      ),

      C(
        'Trạng thái kiểm tra',
        'validationStatus',
        T.ENUM,
        true,
        'NOT_CHECKED',
        E('STG_VALIDATION_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Lỗi kiểm tra',
        'validationErrorsJson',
        T.JSON,
        false,
        '',
        JSON_VALUE(),
        {
          maxLength: 10000
        }
      ),

      C(
        'Trạng thái duyệt',
        'approvalStatus',
        T.ENUM,
        true,
        'DRAFT',
        E('STG_APPROVAL_STATUS'),
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
        'ID câu hỏi đã xuất bản',
        'publishedQuestionId',
        T.ID,
        false,
        '',
        REF('MST_Questions', 'questionId'),
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
        'Ngày tạo',
        'createdAt',
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
   * 3. STG_ApprovalQueue
   * ==============================================================
   */
  schema.STG_ApprovalQueue = SHEET({
    group: 'AI_STAGING',

    description:
      'Hàng đợi các đối tượng cần phụ huynh duyệt trước khi xuất bản.',

    primaryKey: 'approvalId',

    uniqueKeys: [
      ['approvalId']
    ],

    logicalIndexes: [
      'approvalId',
      'entityType',
      'stagingEntityId',
      'contentImportId',
      'aiJobId',
      'subjectId',
      'topicId',
      'lessonId',
      'priority',
      'approvalStatus',
      'assignedTo',
      'reviewedBy',
      'publishedEntityId'
    ],

    retentionPolicy:
      'Lưu lịch sử duyệt nội dung để đối chiếu. Không xóa approval đã xử lý.',

    columns: [
      C(
        'Mã duyệt',
        'approvalId',
        T.ID,
        true,
        '',
        ID('APR_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Loại đối tượng',
        'entityType',
        T.ENUM,
        true,
        'QUESTION_DRAFT',
        E('APPROVAL_ENTITY_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Mã đối tượng staging',
        'stagingEntityId',
        T.ID,
        true,
        '',
        null,
        {
          indexed: true
        }
      ),

      C(
        'Mã import',
        'contentImportId',
        T.ID,
        false,
        '',
        REF('STG_ContentImports', 'contentImportId'),
        {
          indexed: true
        }
      ),

      C(
        'Job AI',
        'aiJobId',
        T.ID,
        false,
        '',
        REF('DATA_AIJobs', 'aiJobId'),
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
        'Tóm tắt',
        'summary',
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
        'Mức ưu tiên',
        'priority',
        T.ENUM,
        true,
        'NORMAL',
        E('PRIORITY_LEVEL'),
        {
          indexed: true
        }
      ),

      C(
        'Trạng thái duyệt',
        'approvalStatus',
        T.ENUM,
        true,
        'PENDING',
        E('STG_APPROVAL_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Người được giao duyệt',
        'assignedTo',
        T.STRING,
        false,
        'FAMILY_ADMIN',
        null,
        {
          indexed: true,
          maxLength: 100
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
          indexed: true,
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
        'Quyết định duyệt',
        'reviewDecision',
        T.ENUM,
        false,
        '',
        E('APPROVAL_DECISION')
      ),

      C(
        'Ghi chú duyệt',
        'reviewNotes',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 5000
        }
      ),

      C(
        'Số lỗi validation',
        'validationErrorCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000)
      ),

      C(
        'Cờ rủi ro',
        'riskFlagsJson',
        T.JSON,
        false,
        '',
        JSON_VALUE(),
        {
          maxLength: 10000
        }
      ),

      C(
        'Trước khi chỉnh',
        'beforeJson',
        T.JSON,
        false,
        '',
        JSON_VALUE(),
        {
          maxLength: 10000
        }
      ),

      C(
        'Sau khi chỉnh',
        'afterJson',
        T.JSON,
        false,
        '',
        JSON_VALUE(),
        {
          maxLength: 10000
        }
      ),

      C(
        'ID đã xuất bản',
        'publishedEntityId',
        T.ID,
        false,
        '',
        null,
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
        'Hạn duyệt',
        'dueAt',
        T.DATETIME,
        false,
        '',
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
        'Ngày tạo',
        'createdAt',
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
   * 4. DATA_AIJobs
   * ==============================================================
   */
  schema.DATA_AIJobs = SHEET({
    group: 'AI_DATA',

    description:
      'Hàng đợi xử lý AI cho tạo nội dung, phân tích, validation và chấm câu mở.',

    primaryKey: 'aiJobId',

    uniqueKeys: [
      ['aiJobId']
    ],

    logicalIndexes: [
      'aiJobId',
      'jobType',
      'status',
      'priority',
      'requestedBy',
      'childId',
      'contentImportId',
      'sourceEntityType',
      'sourceEntityId',
      'targetEntityType',
      'targetEntityId',
      'requestId',
      'createdAt'
    ],

    retentionPolicy:
      'Lưu lịch sử AI job để audit, tính chi phí và retry khi cần.',

    columns: [
      C(
        'Mã job AI',
        'aiJobId',
        T.ID,
        true,
        '',
        ID('AIJ_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Loại job',
        'jobType',
        T.ENUM,
        true,
        'GENERATE_QUESTIONS',
        E('AI_JOB_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Trạng thái job',
        'status',
        T.ENUM,
        true,
        'QUEUED',
        E('AI_JOB_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Mức ưu tiên',
        'priority',
        T.ENUM,
        true,
        'NORMAL',
        E('PRIORITY_LEVEL'),
        {
          indexed: true
        }
      ),

      C(
        'Người yêu cầu',
        'requestedBy',
        T.STRING,
        true,
        D.SYSTEM,
        null,
        {
          indexed: true,
          maxLength: 100
        }
      ),

      C(
        'Hồ sơ bé',
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
        'Mã import',
        'contentImportId',
        T.ID,
        false,
        '',
        REF('STG_ContentImports', 'contentImportId'),
        {
          indexed: true
        }
      ),

      C(
        'Loại entity nguồn',
        'sourceEntityType',
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
        'ID entity nguồn',
        'sourceEntityId',
        T.ID,
        false,
        '',
        null,
        {
          indexed: true
        }
      ),

      C(
        'Loại entity đích',
        'targetEntityType',
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
        'ID entity đích',
        'targetEntityId',
        T.ID,
        false,
        '',
        null,
        {
          indexed: true
        }
      ),

      C(
        'Model',
        'modelName',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 150
        }
      ),

      C(
        'Phiên bản prompt',
        'promptVersion',
        T.STRING,
        true,
        '1.0.0',
        REGEX(
          '^\\d+\\.\\d+\\.\\d+$',
          'Phiên bản phải có dạng x.y.z.'
        )
      ),

      C(
        'Mục tiêu xử lý',
        'taskInstruction',
        T.STRING,
        true,
        '',
        null,
        {
          maxLength: 3000
        }
      ),

      C(
        'Input rút gọn',
        'inputSummary',
        T.STRING,
        false,
        '',
        null,
        {
          sensitive: true,
          maxLength: 5000
        }
      ),

      C(
        'Input File ID',
        'inputFileId',
        T.FILE_ID,
        false,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Input JSON',
        'inputJson',
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
        'Output JSON',
        'outputJson',
        T.JSON,
        false,
        '',
        JSON_VALUE(),
        {
          maxLength: 10000
        }
      ),

      C(
        'Output File ID',
        'outputFileId',
        T.FILE_ID,
        false,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Số lần thử',
        'attemptCount',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100)
      ),

      C(
        'Số lần thử tối đa',
        'maxAttempts',
        T.NUMBER,
        true,
        3,
        INTEGER(1, 100)
      ),

      C(
        'Lỗi gần nhất',
        'lastErrorMessage',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 5000
        }
      ),

      C(
        'Mã lỗi gần nhất',
        'lastErrorCode',
        T.STRING,
        false,
        '',
        REGEX(
          '^[A-Z0-9_\\-]*$',
          'Mã lỗi dùng chữ in hoa, số, gạch dưới hoặc gạch ngang.'
        ),
        {
          maxLength: 150
        }
      ),

      C(
        'Token input ước tính',
        'inputTokenEstimate',
        T.NUMBER,
        false,
        '',
        INTEGER(0, 100000000)
      ),

      C(
        'Token output ước tính',
        'outputTokenEstimate',
        T.NUMBER,
        false,
        '',
        INTEGER(0, 100000000)
      ),

      C(
        'Chi phí ước tính',
        'estimatedCost',
        T.NUMBER,
        false,
        '',
        RANGE(0, 1000000000)
      ),

      C(
        'Bắt đầu lúc',
        'startedAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Kết thúc lúc',
        'finishedAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Thời gian chạy ms',
        'durationMs',
        T.NUMBER,
        false,
        '',
        INTEGER(0, 100000000)
      ),

      C(
        'Cần duyệt',
        'requiresApproval',
        T.BOOLEAN,
        true,
        true,
        null
      ),

      C(
        'Mã duyệt',
        'approvalId',
        T.ID,
        false,
        '',
        REF('STG_ApprovalQueue', 'approvalId')
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
        null,
        {
          indexed: true
        }
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
   * 5. LOG_AI
   * ==============================================================
   */
  schema.LOG_AI = SHEET({
    group: 'AI_LOG',

    description:
      'Nhật ký tương tác AI, trạng thái, lỗi, token, chi phí và cờ rủi ro.',

    primaryKey: 'aiLogId',

    uniqueKeys: [
      ['aiLogId']
    ],

    logicalIndexes: [
      'aiLogId',
      'aiJobId',
      'timestamp',
      'eventType',
      'jobType',
      'modelName',
      'requestedBy',
      'childId',
      'sourceEntityType',
      'sourceEntityId',
      'targetEntityType',
      'targetEntityId',
      'resultStatus',
      'approvalId'
    ],

    retentionPolicy:
      'Lưu log AI để kiểm tra chi phí, chất lượng, lỗi và audit nội dung.',

    columns: [
      C(
        'Mã log AI',
        'aiLogId',
        T.ID,
        true,
        '',
        ID('AIL_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Job AI',
        'aiJobId',
        T.ID,
        false,
        '',
        REF('DATA_AIJobs', 'aiJobId'),
        {
          indexed: true
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
        'Loại sự kiện',
        'eventType',
        T.ENUM,
        true,
        'JOB_CREATED',
        E('AI_LOG_EVENT_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Loại job',
        'jobType',
        T.ENUM,
        false,
        '',
        E('AI_JOB_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Model',
        'modelName',
        T.STRING,
        false,
        '',
        null,
        {
          indexed: true,
          maxLength: 150
        }
      ),

      C(
        'Phiên bản prompt',
        'promptVersion',
        T.STRING,
        false,
        '',
        REGEX(
          '^(\\d+\\.\\d+\\.\\d+)?$',
          'Phiên bản phải trống hoặc có dạng x.y.z.'
        ),
        {
          maxLength: 30
        }
      ),

      C(
        'Người yêu cầu',
        'requestedBy',
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
        'Hồ sơ bé',
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
        'Loại entity nguồn',
        'sourceEntityType',
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
        'ID entity nguồn',
        'sourceEntityId',
        T.ID,
        false,
        '',
        null,
        {
          indexed: true
        }
      ),

      C(
        'Loại entity đích',
        'targetEntityType',
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
        'ID entity đích',
        'targetEntityId',
        T.ID,
        false,
        '',
        null,
        {
          indexed: true
        }
      ),

      C(
        'Trạng thái kết quả',
        'resultStatus',
        T.ENUM,
        true,
        'SUCCESS',
        E('AI_RESULT_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Mã lỗi',
        'errorCode',
        T.STRING,
        false,
        '',
        REGEX(
          '^[A-Z0-9_\\-]*$',
          'Mã lỗi dùng chữ in hoa, số, gạch dưới hoặc gạch ngang.'
        ),
        {
          maxLength: 150
        }
      ),

      C(
        'Nội dung lỗi',
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
        'Input token',
        'inputTokens',
        T.NUMBER,
        false,
        '',
        INTEGER(0, 100000000)
      ),

      C(
        'Output token',
        'outputTokens',
        T.NUMBER,
        false,
        '',
        INTEGER(0, 100000000)
      ),

      C(
        'Tổng token',
        'totalTokens',
        T.NUMBER,
        false,
        '',
        INTEGER(0, 100000000)
      ),

      C(
        'Chi phí ước tính',
        'estimatedCost',
        T.NUMBER,
        false,
        '',
        RANGE(0, 1000000000)
      ),

      C(
        'Thời gian chạy ms',
        'durationMs',
        T.NUMBER,
        false,
        '',
        INTEGER(0, 100000000)
      ),

      C(
        'Mức tin cậy',
        'confidenceScore',
        T.NUMBER,
        false,
        '',
        RANGE(0, 1)
      ),

      C(
        'Điểm chất lượng',
        'qualityScore',
        T.NUMBER,
        false,
        '',
        RANGE(0, 100)
      ),

      C(
        'Cờ rủi ro',
        'riskFlagsJson',
        T.JSON,
        false,
        '',
        JSON_VALUE(),
        {
          maxLength: 10000
        }
      ),

      C(
        'Cần duyệt',
        'requiresApproval',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Mã duyệt',
        'approvalId',
        T.ID,
        false,
        '',
        REF('STG_ApprovalQueue', 'approvalId'),
        {
          indexed: true
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
          maxLength: 3000
        }
      )
    ]
  });


  return schema;
}