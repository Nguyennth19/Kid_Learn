/**
 * ================================================================
 * KIDLEARN V3 - SCHEMA GROUP 02
 * CHƯƠNG TRÌNH HỌC, BÀI HỌC, KỸ NĂNG VÀ MEDIA
 * Version: 3.1.0
 * ================================================================
 */


/**
 * Enum của nhóm chương trình học.
 */
function kidlearnV3_enumGroup02Learning_() {
  return {
    CONTENT_STATUS: [
      'DRAFT',
      'IN_REVIEW',
      'APPROVED',
      'PUBLISHED',
      'ARCHIVED'
    ],

    MASTER_STATUS: [
      'ACTIVE',
      'INACTIVE',
      'ARCHIVED'
    ],

    CURRICULUM_TYPE: [
      'CORE',
      'ADVANCED',
      'SUPPLEMENTARY'
    ],

    RIGHTS_STATUS: [
      'OWNED',
      'LICENSED',
      'PERSONAL_USE',
      'PUBLIC_DOMAIN',
      'REFERENCE_ONLY',
      'UNKNOWN'
    ],

    TOPIC_TYPE: [
      'CORE',
      'ADVANCED',
      'REVIEW'
    ],

    UNLOCK_RULE: [
      'ALWAYS_OPEN',
      'PREVIOUS_TOPIC_COMPLETED',
      'PREVIOUS_LESSON_COMPLETED',
      'MANUAL_BY_FAMILY',
      'DATE_BASED'
    ],

    LESSON_TYPE: [
      'CORE_LESSON',
      'PRACTICE_LESSON',
      'REVIEW_LESSON',
      'ADVANCED_LESSON',
      'PROJECT'
    ],

    DIFFICULTY_LEVEL: [
      'EASY',
      'BASIC',
      'APPLIED',
      'CHALLENGE'
    ],

    LESSON_BLOCK_TYPE: [
      'WARM_UP',
      'TEXT',
      'READING',
      'IMAGE',
      'AUDIO',
      'VIDEO',
      'VOCABULARY',
      'EXAMPLE',
      'FORMULA',
      'TIP',
      'REMEMBER',
      'STORY',
      'FLASHCARD',
      'INTERACTIVE',
      'SUMMARY'
    ],

    ACTIVITY_TYPE: [
      'FLASHCARD',
      'MATCHING',
      'SORTING',
      'DRAG_DROP',
      'LISTEN_REPEAT',
      'READ_ALOUD',
      'IMAGE_SELECT',
      'QUICK_QUIZ',
      'WORD_BUILDING',
      'NUMBER_INPUT',
      'DRAWING',
      'FREE_RESPONSE'
    ],

    SKILL_RELATION_TYPE: [
      'INTRODUCE',
      'PRACTICE',
      'ASSESS',
      'REVIEW'
    ],

    MEDIA_TYPE: [
      'IMAGE',
      'AUDIO',
      'VIDEO',
      'PDF',
      'DOCUMENT',
      'SLIDE',
      'FLASHCARD_IMAGE',
      'THUMBNAIL',
      'RECORDING'
    ],

    MEDIA_PROVIDER: [
      'GOOGLE_DRIVE',
      'GOOGLE_DOCS',
      'YOUTUBE',
      'EXTERNAL',
      'GENERATED_AI'
    ],

    THEME_KEY: [
      'GREEN',
      'BLUE',
      'INDIGO',
      'TEAL',
      'GOLD',
      'PURPLE',
      'PINK',
      'ORANGE',
      'DEFAULT'
    ]
  };
}


/**
 * Schema của 10 Sheet nhóm chương trình học.
 */
function kidlearnV3_schemaGroup02Learning_() {
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
   * 1. MST_Subjects
   * ==============================================================
   */
  schema.MST_Subjects = SHEET({
    group: 'LEARNING',

    description:
      'Danh mục môn học chính thức của KIDLEARN.',

    primaryKey: 'subjectId',

    uniqueKeys: [
      ['subjectId'],
      ['subjectCode']
    ],

    logicalIndexes: [
      'subjectId',
      'subjectCode',
      'status',
      'sortOrder'
    ],

    retentionPolicy:
      'Không xóa vật lý môn học đã có dữ liệu học tập.',

    columns: [
      C(
        'Mã môn học',
        'subjectId',
        T.ID,
        true,
        '',
        ID('SUB_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Mã môn',
        'subjectCode',
        T.STRING,
        true,
        '',
        REGEX(
          '^[A-Z][A-Z0-9_]*$',
          'Mã môn dùng chữ in hoa.'
        ),
        {
          unique: true,
          indexed: true,
          maxLength: 30
        }
      ),

      C(
        'Tên môn học',
        'subjectName',
        T.STRING,
        true,
        '',
        null,
        {
          maxLength: 150
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
        'Mã giao diện',
        'themeKey',
        T.ENUM,
        true,
        'DEFAULT',
        E('THEME_KEY'),
        {
          indexed: true
        }
      ),

      C(
        'Màu chính',
        'primaryColor',
        T.STRING,
        false,
        '',
        REGEX(
          '^#[0-9A-Fa-f]{6}$',
          'Màu phải có dạng HEX, ví dụ #16A34A.'
        ),
        {
          maxLength: 20
        }
      ),

      C(
        'Màu phụ',
        'accentColor',
        T.STRING,
        false,
        '',
        REGEX(
          '^#[0-9A-Fa-f]{6}$',
          'Màu phải có dạng HEX, ví dụ #22C55E.'
        ),
        {
          maxLength: 20
        }
      ),

      C(
        'Thứ tự',
        'sortOrder',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 9999),
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
        E('MASTER_STATUS'),
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
   * 2. MST_Curriculums
   * ==============================================================
   */
  schema.MST_Curriculums = SHEET({
    group: 'LEARNING',

    description:
      'Chương trình học theo khối lớp và loại chương trình.',

    primaryKey: 'curriculumId',

    uniqueKeys: [
      ['curriculumId'],
      ['curriculumCode']
    ],

    logicalIndexes: [
      'curriculumId',
      'curriculumCode',
      'gradeLevel',
      'curriculumType',
      'isDefault',
      'status'
    ],

    retentionPolicy:
      'Archive chương trình cũ, không xóa khi đã có bài học.',

    columns: [
      C(
        'Mã chương trình',
        'curriculumId',
        T.ID,
        true,
        '',
        ID('CUR_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Mã chương trình ngắn',
        'curriculumCode',
        T.STRING,
        true,
        '',
        REGEX(
          '^[A-Z][A-Z0-9_]*$',
          'Mã chương trình dùng chữ in hoa.'
        ),
        {
          unique: true,
          indexed: true,
          maxLength: 100
        }
      ),

      C(
        'Tên chương trình',
        'curriculumName',
        T.STRING,
        true,
        '',
        null,
        {
          maxLength: 250
        }
      ),

      C(
        'Khối lớp',
        'gradeLevel',
        T.NUMBER,
        true,
        2,
        INTEGER(1, 12),
        {
          indexed: true
        }
      ),

      C(
        'Năm học',
        'academicYear',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 30
        }
      ),

      C(
        'Loại chương trình',
        'curriculumType',
        T.ENUM,
        true,
        'CORE',
        E('CURRICULUM_TYPE'),
        {
          indexed: true
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
        'Là mặc định',
        'isDefault',
        T.BOOLEAN,
        true,
        false,
        null,
        {
          indexed: true
        }
      ),

      C(
        'Hiệu lực từ',
        'effectiveFrom',
        T.DATE,
        false,
        '',
        null
      ),

      C(
        'Hiệu lực đến',
        'effectiveTo',
        T.DATE,
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
        'Phiên bản nội dung',
        'contentVersion',
        T.STRING,
        true,
        '1.0.0',
        REGEX(
          '^\\d+\\.\\d+\\.\\d+$',
          'Phiên bản phải có dạng x.y.z.'
        ),
        {
          maxLength: 30
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
   * 3. MST_Books
   * ==============================================================
   */
  schema.MST_Books = SHEET({
    group: 'LEARNING',

    description:
      'Danh mục sách, tập sách hoặc tài liệu nguồn theo chương trình.',

    primaryKey: 'bookId',

    uniqueKeys: [
      ['bookId']
    ],

    logicalIndexes: [
      'bookId',
      'curriculumId',
      'subjectId',
      'gradeLevel',
      'bookSeriesCode',
      'status'
    ],

    retentionPolicy:
      'Không xóa sách/tài liệu đã được dùng làm nguồn nội dung.',

    columns: [
      C(
        'Mã sách',
        'bookId',
        T.ID,
        true,
        '',
        ID('BOOK_'),
        {
          unique: true,
          indexed: true,
          immutable: true
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
        'Mã bộ sách',
        'bookSeriesCode',
        T.STRING,
        false,
        '',
        REGEX(
          '^[A-Z0-9_]*$',
          'Mã bộ sách dùng chữ in hoa, số hoặc gạch dưới.'
        ),
        {
          indexed: true,
          maxLength: 100
        }
      ),

      C(
        'Tên bộ sách',
        'bookSeriesName',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Tên sách',
        'bookTitle',
        T.STRING,
        true,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Khối lớp',
        'gradeLevel',
        T.NUMBER,
        true,
        2,
        INTEGER(1, 12),
        {
          indexed: true
        }
      ),

      C(
        'Tập',
        'volume',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 50
        }
      ),

      C(
        'Nhà xuất bản',
        'publisher',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Năm xuất bản',
        'publicationYear',
        T.NUMBER,
        false,
        '',
        INTEGER(1900, 2100)
      ),

      C(
        'Ấn bản',
        'edition',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 100
        }
      ),

      C(
        'Drive ID file nguồn',
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
        'Drive ID thư mục nguồn',
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
        'Mô tả nguồn',
        'sourceDescription',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 2000
        }
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'ACTIVE',
        E('MASTER_STATUS'),
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
   * 4. MST_Topics
   * ==============================================================
   */
  schema.MST_Topics = SHEET({
    group: 'LEARNING',

    description:
      'Chủ đề học tập trong từng môn và chương trình.',

    primaryKey: 'topicId',

    uniqueKeys: [
      ['topicId'],
      ['curriculumId', 'subjectId', 'topicCode']
    ],

    logicalIndexes: [
      'topicId',
      'curriculumId',
      'subjectId',
      'bookId',
      'gradeLevel',
      'semester',
      'status',
      'sortOrder'
    ],

    retentionPolicy:
      'Archive chủ đề thay vì xóa khi đã có bài học hoặc tiến độ.',

    columns: [
      C(
        'Mã chủ đề',
        'topicId',
        T.ID,
        true,
        '',
        ID('TOP_'),
        {
          unique: true,
          indexed: true,
          immutable: true
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
        'Mã chủ đề ngắn',
        'topicCode',
        T.STRING,
        true,
        '',
        REGEX(
          '^[A-Z0-9_\\-]+$',
          'Mã chủ đề dùng chữ in hoa, số, gạch dưới hoặc gạch ngang.'
        ),
        {
          indexed: true,
          maxLength: 100
        }
      ),

      C(
        'Tên chủ đề',
        'topicTitle',
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
        'Khối lớp',
        'gradeLevel',
        T.NUMBER,
        true,
        2,
        INTEGER(1, 12),
        {
          indexed: true
        }
      ),

      C(
        'Học kỳ',
        'semester',
        T.NUMBER,
        false,
        '',
        INTEGER(1, 3),
        {
          indexed: true
        }
      ),

      C(
        'Loại chủ đề',
        'topicType',
        T.ENUM,
        true,
        'CORE',
        E('TOPIC_TYPE')
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
        'Quy tắc mở khóa',
        'unlockRule',
        T.ENUM,
        true,
        'PREVIOUS_TOPIC_COMPLETED',
        E('UNLOCK_RULE')
      ),

      C(
        'Chủ đề tiên quyết',
        'prerequisiteTopicId',
        T.ID,
        false,
        '',
        REF('MST_Topics', 'topicId')
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
   * 5. MST_Lessons
   * ==============================================================
   */
  schema.MST_Lessons = SHEET({
    group: 'LEARNING',

    description:
      'Bài học thuộc một chủ đề, môn học và chương trình.',

    primaryKey: 'lessonId',

    uniqueKeys: [
      ['lessonId'],
      ['topicId', 'lessonCode']
    ],

    logicalIndexes: [
      'lessonId',
      'topicId',
      'subjectId',
      'curriculumId',
      'bookId',
      'lessonType',
      'difficultyLevel',
      'status',
      'sortOrder'
    ],

    retentionPolicy:
      'Archive bài học thay vì xóa khi đã có tiến độ hoặc attempt.',

    columns: [
      C(
        'Mã bài học',
        'lessonId',
        T.ID,
        true,
        '',
        ID('LES_'),
        {
          unique: true,
          indexed: true,
          immutable: true
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
        'Mã bài học ngắn',
        'lessonCode',
        T.STRING,
        true,
        '',
        REGEX(
          '^[A-Z0-9_\\-]+$',
          'Mã bài học dùng chữ in hoa, số, gạch dưới hoặc gạch ngang.'
        ),
        {
          indexed: true,
          maxLength: 100
        }
      ),

      C(
        'Tên bài học',
        'lessonTitle',
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
        'Mục tiêu học tập',
        'learningObjectives',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 3000
        }
      ),

      C(
        'Loại bài học',
        'lessonType',
        T.ENUM,
        true,
        'CORE_LESSON',
        E('LESSON_TYPE'),
        {
          indexed: true
        }
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
        'Thời lượng phút',
        'estimatedMinutes',
        T.NUMBER,
        true,
        10,
        INTEGER(1, 300)
      ),

      C(
        'Điểm thưởng cơ bản',
        'baseRewardPoints',
        T.NUMBER,
        true,
        0,
        INTEGER(0, 100000)
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
        'Yêu cầu đủ block',
        'requireAllBlocks',
        T.BOOLEAN,
        true,
        true,
        null
      ),

      C(
        'Bài luyện tập',
        'practiceAssessmentId',
        T.ID,
        false,
        '',
        REF('MST_Assessments', 'assessmentId')
      ),

      C(
        'Quy tắc mở khóa',
        'unlockRule',
        T.ENUM,
        true,
        'PREVIOUS_LESSON_COMPLETED',
        E('UNLOCK_RULE')
      ),

      C(
        'Bài tiên quyết',
        'prerequisiteLessonId',
        T.ID,
        false,
        '',
        REF('MST_Lessons', 'lessonId')
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
        'Trang nguồn từ',
        'sourcePageFrom',
        T.NUMBER,
        false,
        '',
        INTEGER(0, 10000)
      ),

      C(
        'Trang nguồn đến',
        'sourcePageTo',
        T.NUMBER,
        false,
        '',
        INTEGER(0, 10000)
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
   * 6. MST_LessonBlocks
   * ==============================================================
   */
  schema.MST_LessonBlocks = SHEET({
    group: 'LEARNING',

    description:
      'Các khối nội dung cấu thành một bài học.',

    primaryKey: 'blockId',

    uniqueKeys: [
      ['blockId']
    ],

    logicalIndexes: [
      'blockId',
      'lessonId',
      'blockType',
      'status',
      'sortOrder'
    ],

    retentionPolicy:
      'Archive block thay vì xóa nếu đã được học hoặc tham chiếu.',

    columns: [
      C(
        'Mã block',
        'blockId',
        T.ID,
        true,
        '',
        ID('BLK_'),
        {
          unique: true,
          indexed: true,
          immutable: true
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
        'Loại block',
        'blockType',
        T.ENUM,
        true,
        'TEXT',
        E('LESSON_BLOCK_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Tiêu đề block',
        'blockTitle',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Nội dung ngắn',
        'contentText',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 10000
        }
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
        'Media',
        'mediaAssetId',
        T.ID,
        false,
        '',
        REF('MST_MediaAssets', 'mediaAssetId')
      ),

      C(
        'Alt text',
        'altText',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 1000
        }
      ),

      C(
        'Cấu hình',
        'configJson',
        T.JSON,
        false,
        '',
        JSON_VALUE(),
        {
          maxLength: 10000
        }
      ),

      C(
        'Bắt buộc',
        'isRequired',
        T.BOOLEAN,
        true,
        true,
        null
      ),

      C(
        'Thời lượng giây',
        'estimatedSeconds',
        T.NUMBER,
        true,
        60,
        INTEGER(0, 36000)
      ),

      C(
        'Tự hoàn thành',
        'autoComplete',
        T.BOOLEAN,
        true,
        true,
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
        'Trang nguồn',
        'sourcePage',
        T.NUMBER,
        false,
        '',
        INTEGER(0, 10000)
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
   * 7. MST_Activities
   * ==============================================================
   */
  schema.MST_Activities = SHEET({
    group: 'LEARNING',

    description:
      'Hoạt động tương tác trong bài học hoặc block.',

    primaryKey: 'activityId',

    uniqueKeys: [
      ['activityId']
    ],

    logicalIndexes: [
      'activityId',
      'lessonId',
      'blockId',
      'activityType',
      'assessmentId',
      'status',
      'sortOrder'
    ],

    retentionPolicy:
      'Archive activity thay vì xóa nếu đã có lịch sử học.',

    columns: [
      C(
        'Mã hoạt động',
        'activityId',
        T.ID,
        true,
        '',
        ID('ACT_'),
        {
          unique: true,
          indexed: true,
          immutable: true
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
        'Block',
        'blockId',
        T.ID,
        false,
        '',
        REF('MST_LessonBlocks', 'blockId'),
        {
          indexed: true
        }
      ),

      C(
        'Loại hoạt động',
        'activityType',
        T.ENUM,
        true,
        'QUICK_QUIZ',
        E('ACTIVITY_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Tên hoạt động',
        'activityTitle',
        T.STRING,
        true,
        '',
        null,
        {
          maxLength: 300
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
        'Cấu hình',
        'configJson',
        T.JSON,
        false,
        '',
        JSON_VALUE(),
        {
          maxLength: 10000
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
        'Bắt buộc',
        'isRequired',
        T.BOOLEAN,
        true,
        false,
        null
      ),

      C(
        'Có chấm điểm',
        'isScored',
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
        'Số lần tối đa',
        'maxAttempts',
        T.NUMBER,
        false,
        '',
        INTEGER(1, 999)
      ),

      C(
        'Thời lượng giây',
        'estimatedSeconds',
        T.NUMBER,
        true,
        60,
        INTEGER(0, 36000)
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
   * 8. MST_Skills
   * ==============================================================
   */
  schema.MST_Skills = SHEET({
    group: 'LEARNING',

    description:
      'Danh mục kỹ năng học tập theo môn và chương trình.',

    primaryKey: 'skillId',

    uniqueKeys: [
      ['skillId'],
      ['subjectId', 'curriculumId', 'skillCode']
    ],

    logicalIndexes: [
      'skillId',
      'subjectId',
      'curriculumId',
      'parentSkillId',
      'skillCode',
      'gradeLevel',
      'status'
    ],

    retentionPolicy:
      'Không xóa kỹ năng đã được dùng trong bài học hoặc kết quả học.',

    columns: [
      C(
        'Mã kỹ năng',
        'skillId',
        T.ID,
        true,
        '',
        ID('SKL_'),
        {
          unique: true,
          indexed: true,
          immutable: true
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
        'Kỹ năng cha',
        'parentSkillId',
        T.ID,
        false,
        '',
        REF('MST_Skills', 'skillId'),
        {
          indexed: true
        }
      ),

      C(
        'Mã kỹ năng ngắn',
        'skillCode',
        T.STRING,
        true,
        '',
        REGEX(
          '^[A-Z0-9_\\-]+$',
          'Mã kỹ năng dùng chữ in hoa, số, gạch dưới hoặc gạch ngang.'
        ),
        {
          indexed: true,
          maxLength: 100
        }
      ),

      C(
        'Tên kỹ năng',
        'skillName',
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
        'Nhóm kỹ năng',
        'skillGroup',
        T.STRING,
        false,
        '',
        REGEX(
          '^[A-Z0-9_\\-]*$',
          'Nhóm kỹ năng dùng chữ in hoa.'
        ),
        {
          maxLength: 100
        }
      ),

      C(
        'Khối lớp',
        'gradeLevel',
        T.NUMBER,
        true,
        2,
        INTEGER(1, 12),
        {
          indexed: true
        }
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
        'Ngưỡng thành thạo',
        'masteryThreshold',
        T.NUMBER,
        true,
        85,
        RANGE(0, 100)
      ),

      C(
        'Số bằng chứng tối thiểu',
        'minimumEvidenceCount',
        T.NUMBER,
        true,
        3,
        INTEGER(1, 999)
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
        'ACTIVE',
        E('MASTER_STATUS'),
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
   * 9. MST_LessonSkills
   * ==============================================================
   */
  schema.MST_LessonSkills = SHEET({
    group: 'LEARNING',

    description:
      'Bảng liên kết bài học với kỹ năng.',

    primaryKey: 'lessonSkillId',

    uniqueKeys: [
      ['lessonSkillId'],
      ['lessonId', 'skillId']
    ],

    logicalIndexes: [
      'lessonSkillId',
      'lessonId',
      'skillId',
      'relationType',
      'status'
    ],

    retentionPolicy:
      'Không xóa liên kết đã dùng trong dữ liệu học, chuyển INACTIVE.',

    columns: [
      C(
        'Mã liên kết bài-kỹ năng',
        'lessonSkillId',
        T.ID,
        true,
        '',
        ID('LSK_'),
        {
          unique: true,
          indexed: true,
          immutable: true
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
        'Loại quan hệ',
        'relationType',
        T.ENUM,
        true,
        'PRACTICE',
        E('SKILL_RELATION_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Trọng số',
        'weight',
        T.NUMBER,
        true,
        100,
        RANGE(0, 100)
      ),

      C(
        'Là kỹ năng chính',
        'isPrimary',
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
        INTEGER(0, 99999)
      ),

      C(
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'ACTIVE',
        E('MASTER_STATUS'),
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
   * 10. MST_MediaAssets
   * ==============================================================
   */
  schema.MST_MediaAssets = SHEET({
    group: 'LEARNING',

    description:
      'Metadata tài nguyên media dùng trong bài học, thư viện và câu hỏi.',

    primaryKey: 'mediaAssetId',

    uniqueKeys: [
      ['mediaAssetId']
    ],

    logicalIndexes: [
      'mediaAssetId',
      'mediaType',
      'provider',
      'rightsStatus',
      'isApproved',
      'status'
    ],

    retentionPolicy:
      'Không xóa media đã được nội dung hoặc attempt tham chiếu.',

    columns: [
      C(
        'Mã media',
        'mediaAssetId',
        T.ID,
        true,
        '',
        ID('MED_'),
        {
          unique: true,
          indexed: true,
          immutable: true
        }
      ),

      C(
        'Loại media',
        'mediaType',
        T.ENUM,
        true,
        'IMAGE',
        E('MEDIA_TYPE'),
        {
          indexed: true
        }
      ),

      C(
        'Nguồn cung cấp',
        'provider',
        T.ENUM,
        true,
        'GOOGLE_DRIVE',
        E('MEDIA_PROVIDER'),
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
        'Drive File ID',
        'driveFileId',
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
        'URL ngoài',
        'externalUrl',
        T.URL,
        false,
        '',
        URL(),
        {
          maxLength: 1000
        }
      ),

      C(
        'Thumbnail File ID',
        'thumbnailFileId',
        T.FILE_ID,
        false,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Alt text',
        'altText',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 1000
        }
      ),

      C(
        'Transcript ngắn',
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
        'Transcript File ID',
        'transcriptFileId',
        T.FILE_ID,
        false,
        '',
        null,
        {
          maxLength: 300
        }
      ),

      C(
        'Thời lượng giây',
        'durationSeconds',
        T.NUMBER,
        false,
        '',
        INTEGER(0, 86400)
      ),

      C(
        'Dung lượng bytes',
        'fileSizeBytes',
        T.NUMBER,
        false,
        '',
        INTEGER(0, 10000000000)
      ),

      C(
        'MIME type',
        'mimeType',
        T.STRING,
        false,
        '',
        null,
        {
          maxLength: 200
        }
      ),

      C(
        'Ngôn ngữ',
        'languageCode',
        T.STRING,
        false,
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
        E('RIGHTS_STATUS'),
        {
          indexed: true
        }
      ),

      C(
        'Đã duyệt',
        'isApproved',
        T.BOOLEAN,
        true,
        false,
        null,
        {
          indexed: true
        }
      ),

      C(
        'Duyệt bởi',
        'approvedBy',
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
        'approvedAt',
        T.DATETIME,
        false,
        '',
        null
      ),

      C(
        'Checksum',
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
        'Trạng thái',
        'status',
        T.ENUM,
        true,
        'ACTIVE',
        E('MASTER_STATUS'),
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