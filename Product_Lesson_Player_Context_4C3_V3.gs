/**
 * ================================================================
 * KIDLEARN V3 - LESSON PLAYER CONTEXT
 * Step: 4C-3
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Build read-only context for Lesson Player.
 * - Prepare lesson blocks, activities, answer modes.
 * - Prepare handwriting canvas metadata for 4C-4.
 *
 * Safety:
 * - Không ghi Google Sheet dữ liệu học.
 * - Không ghi PROD.
 * - Không submit answer.
 * - Không complete lesson.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4C-3.
 */


var KIDLEARN_V3_LESSON_PLAYER_4C3_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4C3_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4C3_LAST_PREVIEW_AT',
  LAST_SMOKE_AT: 'KIDLEARN_V3_PHASE_4C3_LAST_SMOKE_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4C3_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4C3_LAST_RESULT_JSON'
};


var KIDLEARN_V3_LESSON_PLAYER_4C3_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  SMOKE_PASSED: 'SMOKE_PASSED',
  READY_FOR_4C_4: 'READY_FOR_4C_4',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG = {
  PHASE: '4C-3',
  PARENT_PHASE: '4C',
  PREVIOUS_BUNDLE: '4C-2',
  NEXT_BUNDLE: '4C-4',
  NEXT_STAGE: 'LESSON_PLAYER_UI_WITH_ANSWER_INPUT_MODES',
  CONTEXT_NAME: 'LESSON_PLAYER_CONTEXT_READ_ONLY',
  MAX_ROWS_PER_SHEET: 900,
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false
};


/**
 * Main public context function.
 * Future 4C-4 UI will call this.
 */
function kidlearnV3_getLessonPlayerContext4C3V3(payload) {
  payload = payload || {};

  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var phase4C2 =
    kidlearnV3_4c3SafeCall_(
      'kidlearnV3_assertSubjectDashboardUi4C2ReadyV3'
    );

  if (!phase4C2.success) {
    errors.push(
      '4C-2 chưa READY_FOR_4C_3: ' +
      phase4C2.message
    );
  }

  /**
   * 4C-2P là patch UI, không bắt buộc cho context.
   * Nhưng nếu có thì kiểm tra để cảnh báo.
   */
  var phase4C2P =
    kidlearnV3_4c3SafeCall_(
      'kidlearnV3_assertSubjectDashboardUiPatch4C2PReadyV3'
    );

  if (!phase4C2P.success) {
    warnings.push(
      '4C-2P patch chưa ready hoặc chưa có assert. Context vẫn có thể chạy. Chi tiết: ' +
      phase4C2P.message
    );
  }

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4c3OpenSpreadsheet_();
  } catch (error) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(error.message || error)
    );
  }

  var tables = {};

  if (spreadsheet) {
    tables =
      kidlearnV3_4c3ReadLessonPlayerTables_(
        spreadsheet,
        warnings
      );
  }

  var child =
    kidlearnV3_4c3ResolveChild_(
      payload,
      tables.DATA_Children || []
    );

  var subjectKey =
    kidlearnV3_4c3ResolveSubjectKey_(
      payload.subjectCode ||
        payload.subjectKey ||
        payload.subjectId ||
        '',
      payload.subjectName || ''
    );

  if (subjectKey === 'DEFAULT') {
    subjectKey = 'MATH';
  }

  var lesson =
    kidlearnV3_4c3ResolveLesson_(
      payload,
      subjectKey,
      tables.MST_Lessons || [],
      tables.MST_Topics || []
    );

  if (!lesson) {
    warnings.push(
      'Không tìm thấy lesson thật. Dùng fallback lesson demo cho ' +
      subjectKey +
      '.'
    );

    lesson =
      kidlearnV3_4c3BuildFallbackLesson_(subjectKey);
  }

  subjectKey =
    lesson.subjectKey || subjectKey;

  var theme =
    kidlearnV3_4c3ResolveTheme_(subjectKey);

  var blocks =
    kidlearnV3_4c3BuildLessonBlocks_(
      lesson,
      subjectKey,
      tables.MST_LessonBlocks || []
    );

  var activities =
    kidlearnV3_4c3BuildActivities_(
      lesson,
      subjectKey,
      tables.MST_Activities || [],
      tables.MST_Questions || [],
      tables.MST_QuestionOptions || []
    );

  if (blocks.length === 0 && activities.length === 0) {
    warnings.push(
      'Không có lesson blocks/activities thật. Dùng fallback lesson content.'
    );

    var fallback =
      kidlearnV3_4c3BuildFallbackLessonContent_(lesson, subjectKey);

    blocks =
      fallback.blocks;

    activities =
      fallback.activities;
  }

  var playerSteps =
    kidlearnV3_4c3BuildPlayerSteps_(
      blocks,
      activities
    );

  var progress =
    kidlearnV3_4c3ResolveLessonProgress_(
      lesson,
      child,
      tables.DATA_LessonProgress || []
    );

  var context = {
    child: child,
    lesson: lesson,
    subjectKey: subjectKey,
    subjectTheme: theme,
    player: {
      lessonId: lesson.lessonId,
      title: lesson.lessonTitle,
      subtitle:
        lesson.topicName +
        ' · ' +
        lesson.estimatedMinutes +
        ' phút',
      breadcrumb: [
        {
          label: lesson.subjectName,
          type: 'SUBJECT',
          value: subjectKey
        },
        {
          label: lesson.topicName,
          type: 'TOPIC',
          value: lesson.topicId
        },
        {
          label: lesson.lessonTitle,
          type: 'LESSON',
          value: lesson.lessonId
        }
      ],
      progress: progress,
      blocks: blocks,
      activities: activities,
      playerSteps: playerSteps,
      supportedAnswerModes:
        kidlearnV3_4c3GetSupportedAnswerModes_(),
      handwritingPolicy: {
        enabledIn4C4: true,
        autoGradeInMvp: false,
        saveAsImageLater: true,
        saveStrokeDataLater: true,
        childFriendlyMessage:
          'Con có thể viết bằng tay hoặc dùng bút cảm ứng.',
        plannedStorage:
          'DATA_Responses or Drive asset in later write phase'
      },
      safetyPolicy: {
        readOnlyContext: true,
        submitAnswerAllowedNow: false,
        saveProgressAllowedNow: false,
        completeLessonAllowedNow: false,
        dryRunStartsIn: '4C-5'
      }
    },
    sourceInfo: {
      mode: 'READ_ONLY',
      tableNames: Object.keys(tables),
      generatedAt:
        new Date().toISOString(),
      durationMs:
        new Date().getTime() - startedAt.getTime()
    }
  };

  var result = {
    success: errors.length === 0,
    action: 'GET_LESSON_PLAYER_CONTEXT_4C_3_V3',
    phase:
      KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.PARENT_PHASE,
    contextName:
      KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.CONTEXT_NAME,
    selectedSubjectKey: subjectKey,
    lessonId: lesson.lessonId,
    lessonTitle: lesson.lessonTitle,
    blockCount: blocks.length,
    activityCount: activities.length,
    playerStepCount: playerSteps.length,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    context: context,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  console.log(JSON.stringify({
    success: result.success,
    action: result.action,
    phase: result.phase,
    selectedSubjectKey: result.selectedSubjectKey,
    lessonId: result.lessonId,
    lessonTitle: result.lessonTitle,
    blockCount: result.blockCount,
    activityCount: result.activityCount,
    playerStepCount: result.playerStepCount,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    errors: result.errors,
    warnings: result.warnings
  }, null, 2));

  if (!result.success) {
    throw new Error(
      '4C-3 lesson player context failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Preview.
 */
function kidlearnV3_previewLessonPlayerContext4C3V3() {
  var result =
    kidlearnV3_getLessonPlayerContext4C3V3({
      subjectCode: 'MATH'
    });

  var status =
    result.success
      ? KIDLEARN_V3_LESSON_PLAYER_4C3_STATUS.PREVIEWED
      : KIDLEARN_V3_LESSON_PLAYER_4C3_STATUS.FAILED;

  kidlearnV3_4c3SaveStatus_(
    result,
    status,
    KIDLEARN_V3_LESSON_PLAYER_4C3_KEYS.LAST_PREVIEW_AT
  );

  var output = {
    success: result.success,
    action: 'PREVIEW_LESSON_PLAYER_CONTEXT_4C_3_V3',
    phase: '4C-3',
    status: status,
    nextBundle:
      KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.NEXT_BUNDLE,
    selectedSubjectKey: result.selectedSubjectKey,
    lessonId: result.lessonId,
    lessonTitle: result.lessonTitle,
    blockCount: result.blockCount,
    activityCount: result.activityCount,
    playerStepCount: result.playerStepCount,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    warnings: result.warnings
  };

  console.log(JSON.stringify(output, null, 2));
  return output;
}


/**
 * Smoke test 4 subject contexts.
 */
function kidlearnV3_smokeTestLessonPlayerContext4C3V3() {
  var subjects = [
    'MATH',
    'VIETNAMESE',
    'ENGLISH',
    'SCIENCE'
  ];

  var errors = [];
  var warnings = [];
  var results = [];

  for (var i = 0; i < subjects.length; i++) {
    try {
      var output =
        kidlearnV3_getLessonPlayerContext4C3V3({
          subjectCode: subjects[i]
        });

      results.push({
        subjectCode: subjects[i],
        success: output.success === true,
        lessonId: output.lessonId,
        lessonTitle: output.lessonTitle,
        blockCount: output.blockCount,
        activityCount: output.activityCount,
        playerStepCount: output.playerStepCount,
        warningCount: output.warningCount
      });

      warnings =
        warnings.concat(output.warnings || []);

      if (!output.success) {
        errors.push(
          subjects[i] + ' context returned success=false.'
        );
      }

    } catch (error) {
      errors.push(
        subjects[i] + ': ' +
        String(error.message || error)
      );

      results.push({
        subjectCode: subjects[i],
        success: false,
        error: String(error.message || error)
      });
    }
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_LESSON_PLAYER_CONTEXT_4C_3_V3',
    phase:
      KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.PARENT_PHASE,
    subjectCount: subjects.length,
    results: results,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4c3SaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_LESSON_PLAYER_4C3_STATUS.SMOKE_PASSED
      : KIDLEARN_V3_LESSON_PLAYER_4C3_STATUS.FAILED,
    KIDLEARN_V3_LESSON_PLAYER_4C3_KEYS.LAST_SMOKE_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4C-3 smoke failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready for 4C-4.
 */
function kidlearnV3_markLessonPlayerContext4C3ReadyV3() {
  var smoke =
    kidlearnV3_smokeTestLessonPlayerContext4C3V3();

  if (!smoke.success) {
    throw new Error('Smoke 4C-3 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_LESSON_PLAYER_CONTEXT_4C_3_READY_V3',
    phase:
      KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_LESSON_PLAYER_4C3_STATUS.READY_FOR_4C_4,
    nextBundle:
      KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    message:
      'Lesson Player Context 4C-3 ready. Có thể qua 4C-4 Lesson Player UI.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4c3SaveStatus_(
    result,
    KIDLEARN_V3_LESSON_PLAYER_4C3_STATUS.READY_FOR_4C_4,
    KIDLEARN_V3_LESSON_PLAYER_4C3_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getLessonPlayerContext4C3StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_LESSON_PLAYER_CONTEXT_4C_3_STATUS_V3',
    phase:
      KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_LESSON_PLAYER_4C3_KEYS.STATUS
      ) ||
      KIDLEARN_V3_LESSON_PLAYER_4C3_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_LESSON_PLAYER_4C3_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastSmokeAt:
      properties.getProperty(
        KIDLEARN_V3_LESSON_PLAYER_4C3_KEYS.LAST_SMOKE_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_LESSON_PLAYER_4C3_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4c3ReadJsonProperty_(
        KIDLEARN_V3_LESSON_PLAYER_4C3_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertLessonPlayerContext4C3ReadyV3() {
  var status =
    kidlearnV3_getLessonPlayerContext4C3StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_LESSON_PLAYER_4C3_STATUS.READY_FOR_4C_4
  ) {
    errors.push(
      '4C-3 chưa READY_FOR_4C_4. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_LESSON_PLAYER_CONTEXT_4C_3_READY_V3',
    phase:
      KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.PARENT_PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(errors.join(' | '));
  }

  return result;
}


/**
 * QA batch.
 */
function kidlearnV3_runQaBatch4C3V3() {
  var preview =
    kidlearnV3_previewLessonPlayerContext4C3V3();

  var smoke =
    kidlearnV3_smokeTestLessonPlayerContext4C3V3();

  var ready =
    kidlearnV3_markLessonPlayerContext4C3ReadyV3();

  var assertReady =
    kidlearnV3_assertLessonPlayerContext4C3ReadyV3();

  var result = {
    success:
      preview.success === true &&
      smoke.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4C_3_LESSON_PLAYER_CONTEXT_READ_ONLY',
    phase:
      KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.PHASE,
    nextBundle:
      KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    results: {
      preview: preview.success,
      smoke: smoke.success,
      ready: ready.success,
      assertReady: assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4C-3 QA batch failed.');
  }

  return result;
}


/**
 * Data readers.
 */
function kidlearnV3_4c3ReadLessonPlayerTables_(spreadsheet, warnings) {
  var names = [
    'DATA_Children',
    'MST_Subjects',
    'MST_Topics',
    'MST_Lessons',
    'MST_LessonBlocks',
    'MST_Activities',
    'MST_Questions',
    'MST_QuestionOptions',
    'DATA_LessonProgress'
  ];

  var tables = {};

  for (var i = 0; i < names.length; i++) {
    tables[names[i]] =
      kidlearnV3_4c3ReadSheetObjects_(
        spreadsheet,
        names[i],
        warnings
      );
  }

  return tables;
}


function kidlearnV3_4c3ReadSheetObjects_(spreadsheet, sheetName, warnings) {
  var sheet =
    kidlearnV3_4c3GetSheetByExactName_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    warnings.push(
      'Không tìm thấy sheet ' + sheetName + '.'
    );
    return [];
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (lastRow < 2 || lastColumn < 1) {
    return [];
  }

  var rowCount =
    Math.min(
      lastRow,
      KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.MAX_ROWS_PER_SHEET
    );

  var values =
    sheet.getRange(1, 1, rowCount, lastColumn).getValues();

  var headers =
    kidlearnV3_4c3BuildHeaders_(values);

  var objects = [];

  for (var r = headers.startRowIndex; r < values.length; r++) {
    var row = values[r];

    if (kidlearnV3_4c3IsBlankRow_(row)) continue;

    var obj = {};

    for (var c = 0; c < headers.keys.length; c++) {
      var key = headers.keys[c] || 'col' + (c + 1);
      obj[key] = row[c];
    }

    obj.__rowNumber = r + 1;
    objects.push(obj);
  }

  return objects;
}


function kidlearnV3_4c3BuildHeaders_(values) {
  var row1 = values[0] || [];
  var row2 = values.length > 1 ? values[1] || [] : [];

  var useRow2 =
    kidlearnV3_4c3RowLooksLikeFieldKeys_(row2);

  var source =
    useRow2 ? row2 : row1;

  var keys = [];

  for (var i = 0; i < source.length; i++) {
    keys.push(
      kidlearnV3_4c3NormalizeKey_(source[i])
    );
  }

  return {
    keys: keys,
    startRowIndex: useRow2 ? 2 : 1
  };
}


function kidlearnV3_4c3RowLooksLikeFieldKeys_(row) {
  var score = 0;

  for (var i = 0; i < row.length; i++) {
    var value = String(row[i] || '');

    if (
      /^[a-zA-Z][a-zA-Z0-9_]*$/.test(value) ||
      value.indexOf('Id') >= 0 ||
      value.indexOf('Code') >= 0 ||
      value.indexOf('Name') >= 0
    ) {
      score++;
    }
  }

  return score >= 3;
}


function kidlearnV3_4c3NormalizeKey_(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/-/g, '')
    .replace(/_/g, '')
    .replace(/[^\wÀ-ỹ]/g, '');
}


/**
 * Context builders.
 */
function kidlearnV3_4c3ResolveChild_(payload, childRows) {
  var childId =
    String(payload.childId || '');

  if (childId) {
    for (var i = 0; i < childRows.length; i++) {
      var row = childRows[i];

      var rowChildId =
        String(
          kidlearnV3_4c3GetAny_(row, [
            'childId',
            'childid',
            'machild',
            'id'
          ]) || ''
        );

      if (rowChildId === childId) {
        return {
          childId: rowChildId,
          childName:
            String(
              kidlearnV3_4c3GetAny_(row, [
                'childName',
                'childname',
                'tenbe',
                'name'
              ]) || 'Lịch Khê'
            ),
          grade:
            String(
              kidlearnV3_4c3GetAny_(row, [
                'grade',
                'lop',
                'class'
              ]) || '2'
            )
        };
      }
    }
  }

  if (childRows.length > 0) {
    var first = childRows[0];

    return {
      childId:
        String(
          kidlearnV3_4c3GetAny_(first, [
            'childId',
            'childid',
            'machild',
            'id'
          ]) || 'CHD_V2_CHILD_DEFAULT'
        ),
      childName:
        String(
          kidlearnV3_4c3GetAny_(first, [
            'childName',
            'childname',
            'tenbe',
            'name'
          ]) || 'Lịch Khê'
        ),
      grade:
        String(
          kidlearnV3_4c3GetAny_(first, [
            'grade',
            'lop',
            'class'
          ]) || '2'
        )
    };
  }

  return {
    childId: 'CHD_V2_CHILD_DEFAULT',
    childName: 'Lịch Khê',
    grade: '2'
  };
}


function kidlearnV3_4c3ResolveLesson_(payload, subjectKey, lessonRows, topicRows) {
  var requestedLessonId =
    String(payload.lessonId || '');

  var lessons =
    kidlearnV3_4c3NormalizeLessons_(
      lessonRows,
      topicRows
    );

  if (requestedLessonId) {
    for (var i = 0; i < lessons.length; i++) {
      if (lessons[i].lessonId === requestedLessonId) {
        return lessons[i];
      }
    }
  }

  for (var j = 0; j < lessons.length; j++) {
    if (lessons[j].subjectKey === subjectKey) {
      return lessons[j];
    }
  }

  return null;
}


function kidlearnV3_4c3NormalizeLessons_(lessonRows, topicRows) {
  var topics =
    kidlearnV3_4c3NormalizeTopics_(topicRows);

  var result = [];

  for (var i = 0; i < lessonRows.length; i++) {
    var row = lessonRows[i];

    var lessonId =
      kidlearnV3_4c3GetAny_(row, [
        'lessonId',
        'lessonid',
        'mabaihoc',
        'Mãbàihọc',
        'id'
      ]);

    var lessonTitle =
      kidlearnV3_4c3GetAny_(row, [
        'lessonTitle',
        'lessonName',
        'lessonname',
        'title',
        'name',
        'tenbaihoc',
        'Tênbàihọc'
      ]);

    if (!lessonId && !lessonTitle) continue;

    var subjectKey =
      kidlearnV3_4c3ResolveSubjectKey_(
        kidlearnV3_4c3GetAny_(row, [
          'subjectCode',
          'subjectId',
          'mamonhoc',
          'Mãmônhọc'
        ]),
        ''
      );

    if (subjectKey === 'DEFAULT') {
      subjectKey = 'MATH';
    }

    var topicId =
      String(
        kidlearnV3_4c3GetAny_(row, [
          'topicId',
          'topicid',
          'machude',
          'Mãchủđề'
        ]) || ''
      );

    var topic =
      kidlearnV3_4c3FindBy_(
        topics,
        'topicId',
        topicId
      );

    result.push({
      lessonId:
        String(lessonId || 'LESSON_' + subjectKey + '_' + (i + 1)),
      lessonTitle:
        String(lessonTitle || 'Bài học ' + (i + 1)),
      subjectKey: subjectKey,
      subjectName:
        kidlearnV3_4c3SubjectNameFromKey_(subjectKey),
      subjectCode: subjectKey,
      topicId:
        topicId || subjectKey + '_TOPIC_GENERAL',
      topicName:
        topic ? topic.topicName : 'Chủ đề chung',
      estimatedMinutes:
        kidlearnV3_4c3ToNumber_(
          kidlearnV3_4c3GetAny_(row, [
            'estimatedMinutes',
            'durationMinutes',
            'minutes',
            'thoiluong',
            'Thờilượng'
          ]),
          8
        ),
      order:
        kidlearnV3_4c3ToNumber_(
          kidlearnV3_4c3GetAny_(row, [
            'displayOrder',
            'order',
            'sortOrder',
            'thutu'
          ]),
          i + 1
        ),
      difficulty:
        String(
          kidlearnV3_4c3GetAny_(row, [
            'difficulty',
            'level',
            'mucdo'
          ]) || 'Dễ'
        )
    });
  }

  result.sort(function (a, b) {
    return a.order - b.order;
  });

  return result;
}


function kidlearnV3_4c3NormalizeTopics_(rows) {
  var result = [];

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];

    var topicId =
      kidlearnV3_4c3GetAny_(row, [
        'topicId',
        'topicid',
        'machude',
        'Mãchủđề',
        'id'
      ]);

    var topicName =
      kidlearnV3_4c3GetAny_(row, [
        'topicName',
        'topicname',
        'tenchude',
        'Tênchủđề',
        'name',
        'title'
      ]);

    if (!topicId && !topicName) continue;

    result.push({
      topicId:
        String(topicId || 'TOPIC_' + (i + 1)),
      topicName:
        String(topicName || 'Chủ đề ' + (i + 1))
    });
  }

  return result;
}


function kidlearnV3_4c3BuildLessonBlocks_(lesson, subjectKey, rows) {
  var result = [];

  for (var i = 0; i < rows.length; i++) {
    var row = rows[i];

    var lessonId =
      String(
        kidlearnV3_4c3GetAny_(row, [
          'lessonId',
          'lessonid',
          'mabaihoc'
        ]) || ''
      );

    if (lessonId && lessonId !== lesson.lessonId) continue;

    var blockId =
      kidlearnV3_4c3GetAny_(row, [
        'blockId',
        'blockid',
        'lessonBlockId',
        'id'
      ]);

    var blockType =
      String(
        kidlearnV3_4c3GetAny_(row, [
          'blockType',
          'type',
          'contentType'
        ]) || 'CONTENT'
      )
        .trim()
        .toUpperCase();

    var title =
      kidlearnV3_4c3GetAny_(row, [
        'title',
        'blockTitle',
        'name',
        'tieude'
      ]);

    var content =
      kidlearnV3_4c3GetAny_(row, [
        'content',
        'text',
        'body',
        'noidung'
      ]);

    if (!blockId && !title && !content) continue;

    result.push({
      blockId:
        String(blockId || lesson.lessonId + '_BLOCK_' + (i + 1)),
      lessonId: lesson.lessonId,
      blockType: blockType,
      title:
        String(title || 'Nội dung bài học'),
      content:
        String(content || ''),
      illustrationHint:
        kidlearnV3_4c3IllustrationHint_(subjectKey),
      order:
        kidlearnV3_4c3ToNumber_(
          kidlearnV3_4c3GetAny_(row, [
            'displayOrder',
            'order',
            'sortOrder',
            'thutu'
          ]),
          i + 1
        )
    });
  }

  result.sort(function (a, b) {
    return a.order - b.order;
  });

  return result;
}


function kidlearnV3_4c3BuildActivities_(
  lesson,
  subjectKey,
  activityRows,
  questionRows,
  optionRows
) {
  var activities = [];

  for (var i = 0; i < activityRows.length; i++) {
    var row = activityRows[i];

    var lessonId =
      String(
        kidlearnV3_4c3GetAny_(row, [
          'lessonId',
          'lessonid',
          'mabaihoc'
        ]) || ''
      );

    if (lessonId && lessonId !== lesson.lessonId) continue;

    var activityId =
      kidlearnV3_4c3GetAny_(row, [
        'activityId',
        'activityid',
        'id'
      ]);

    var activityType =
      String(
        kidlearnV3_4c3GetAny_(row, [
          'activityType',
          'type',
          'questionType'
        ]) || ''
      )
        .trim()
        .toUpperCase();

    var prompt =
      kidlearnV3_4c3GetAny_(row, [
        'prompt',
        'question',
        'title',
        'content',
        'noidung'
      ]);

    if (!activityId && !prompt) continue;

    var answerMode =
      kidlearnV3_4c3ResolveAnswerMode_(
        activityType,
        subjectKey,
        prompt
      );

    activities.push({
      activityId:
        String(activityId || lesson.lessonId + '_ACT_' + (i + 1)),
      lessonId: lesson.lessonId,
      activityType:
        activityType || answerMode.activityType,
      answerMode: answerMode.answerMode,
      title:
        String(
          kidlearnV3_4c3GetAny_(row, [
            'activityTitle',
            'title',
            'name'
          ]) || answerMode.title
        ),
      prompt:
        String(prompt || answerMode.prompt),
      instruction:
        answerMode.instruction,
      options:
        kidlearnV3_4c3BuildActivityOptions_(
          row,
          questionRows,
          optionRows
        ),
      buttonInput:
        kidlearnV3_4c3BuildButtonInputConfig_(answerMode.answerMode, subjectKey),
      textInput:
        kidlearnV3_4c3BuildTextInputConfig_(answerMode.answerMode, subjectKey),
      handwriting:
        kidlearnV3_4c3BuildHandwritingConfig_(answerMode.answerMode, subjectKey),
      autoGrade:
        answerMode.autoGrade,
      expectedAnswer:
        String(
          kidlearnV3_4c3GetAny_(row, [
            'expectedAnswer',
            'answer',
            'correctAnswer',
            'dapan'
          ]) || answerMode.expectedAnswer || ''
        ),
      order:
        kidlearnV3_4c3ToNumber_(
          kidlearnV3_4c3GetAny_(row, [
            'displayOrder',
            'order',
            'sortOrder',
            'thutu'
          ]),
          i + 1
        )
    });
  }

  activities.sort(function (a, b) {
    return a.order - b.order;
  });

  return activities;
}


function kidlearnV3_4c3BuildActivityOptions_(activityRow, questionRows, optionRows) {
  var activityId =
    String(
      kidlearnV3_4c3GetAny_(activityRow, [
        'activityId',
        'activityid',
        'id'
      ]) || ''
    );

  var questionId =
    String(
      kidlearnV3_4c3GetAny_(activityRow, [
        'questionId',
        'questionid',
        'maquestion'
      ]) || ''
    );

  var options = [];

  for (var i = 0; i < optionRows.length; i++) {
    var row = optionRows[i];

    var rowQuestionId =
      String(
        kidlearnV3_4c3GetAny_(row, [
          'questionId',
          'questionid',
          'maquestion'
        ]) || ''
      );

    if (
      questionId &&
      rowQuestionId &&
      rowQuestionId !== questionId
    ) {
      continue;
    }

    var optionText =
      kidlearnV3_4c3GetAny_(row, [
        'optionText',
        'text',
        'label',
        'content',
        'noidung'
      ]);

    if (!optionText) continue;

    options.push({
      optionId:
        String(
          kidlearnV3_4c3GetAny_(row, [
            'optionId',
            'optionid',
            'id'
          ]) || 'OPT_' + (i + 1)
        ),
      label:
        String(optionText),
      isCorrect:
        kidlearnV3_4c3ToBool_(
          kidlearnV3_4c3GetAny_(row, [
            'isCorrect',
            'correct',
            'dung'
          ]),
          false
        )
    });
  }

  if (options.length > 0) return options;

  var inlineOptions =
    String(
      kidlearnV3_4c3GetAny_(activityRow, [
        'options',
        'choices',
        'luaChon',
        'luachon'
      ]) || ''
    );

  if (inlineOptions) {
    var parts =
      inlineOptions.split('|');

    for (var j = 0; j < parts.length; j++) {
      if (!parts[j]) continue;

      options.push({
        optionId:
          activityId + '_OPT_' + (j + 1),
        label:
          String(parts[j]).trim(),
        isCorrect: false
      });
    }
  }

  return options;
}


function kidlearnV3_4c3BuildPlayerSteps_(blocks, activities) {
  var steps = [];

  for (var i = 0; i < blocks.length; i++) {
    steps.push({
      stepId:
        'STEP_BLOCK_' + blocks[i].blockId,
      stepType: 'CONTENT_BLOCK',
      refId: blocks[i].blockId,
      title: blocks[i].title,
      order:
        steps.length + 1
    });
  }

  for (var j = 0; j < activities.length; j++) {
    steps.push({
      stepId:
        'STEP_ACTIVITY_' + activities[j].activityId,
      stepType: 'ACTIVITY',
      refId: activities[j].activityId,
      title: activities[j].title,
      answerMode: activities[j].answerMode,
      order:
        steps.length + 1
    });
  }

  return steps;
}


function kidlearnV3_4c3ResolveLessonProgress_(lesson, child, progressRows) {
  for (var i = 0; i < progressRows.length; i++) {
    var row = progressRows[i];

    var lessonId =
      String(
        kidlearnV3_4c3GetAny_(row, [
          'lessonId',
          'lessonid',
          'mabaihoc'
        ]) || ''
      );

    var childId =
      String(
        kidlearnV3_4c3GetAny_(row, [
          'childId',
          'childid',
          'machild'
        ]) || ''
      );

    if (
      lessonId === lesson.lessonId &&
      (!child.childId || !childId || childId === child.childId)
    ) {
      var percent =
        kidlearnV3_4c3Clamp_(
          kidlearnV3_4c3ToNumber_(
            kidlearnV3_4c3GetAny_(row, [
              'progressPercent',
              'percent',
              'completionPercent',
              'tiendo'
            ]),
            0
          ),
          0,
          100
        );

      return {
        status:
          percent >= 100
            ? 'COMPLETED'
            : percent > 0
              ? 'IN_PROGRESS'
              : 'NOT_STARTED',
        progressPercent: percent,
        currentStepIndex: 0,
        readOnly: true
      };
    }
  }

  return {
    status: 'NOT_STARTED',
    progressPercent: 0,
    currentStepIndex: 0,
    readOnly: true
  };
}


/**
 * Fallbacks.
 */
function kidlearnV3_4c3BuildFallbackLesson_(subjectKey) {
  var map = {
    MATH: {
      lessonId: 'MATH_L1',
      lessonTitle: 'Cộng trong phạm vi 20',
      topicName: 'Phép cộng'
    },
    VIETNAMESE: {
      lessonId: 'TV_L1',
      lessonTitle: 'Đọc hiểu đoạn văn ngắn',
      topicName: 'Đọc hiểu'
    },
    ENGLISH: {
      lessonId: 'ENG_L1',
      lessonTitle: 'My family',
      topicName: 'Từ vựng'
    },
    SCIENCE: {
      lessonId: 'SCI_L1',
      lessonTitle: 'Cây cần gì để sống?',
      topicName: 'Thực vật'
    }
  };

  var item =
    map[subjectKey] || map.MATH;

  return {
    lessonId: item.lessonId,
    lessonTitle: item.lessonTitle,
    subjectKey: subjectKey,
    subjectCode: subjectKey,
    subjectName:
      kidlearnV3_4c3SubjectNameFromKey_(subjectKey),
    topicId: subjectKey + '_TOPIC_1',
    topicName: item.topicName,
    estimatedMinutes: 8,
    order: 1,
    difficulty: 'Dễ'
  };
}


function kidlearnV3_4c3BuildFallbackLessonContent_(lesson, subjectKey) {
  if (subjectKey === 'VIETNAMESE') {
    return {
      blocks: [
        {
          blockId: lesson.lessonId + '_BLOCK_1',
          lessonId: lesson.lessonId,
          blockType: 'CONTENT',
          title: 'Cùng đọc nhé',
          content:
            'Bé đọc đoạn văn ngắn, sau đó trả lời câu hỏi thật nhẹ nhàng.',
          illustrationHint: 'reading_book',
          order: 1
        },
        {
          blockId: lesson.lessonId + '_BLOCK_2',
          lessonId: lesson.lessonId,
          blockType: 'EXAMPLE',
          title: 'Ví dụ',
          content:
            'Mẹ mua hoa. Bé hãy tìm từ chỉ người hoặc vật trong câu.',
          illustrationHint: 'pencil_book',
          order: 2
        }
      ],
      activities: [
        {
          activityId: lesson.lessonId + '_ACT_1',
          lessonId: lesson.lessonId,
          activityType: 'TEXT_INPUT',
          answerMode: 'TEXT_INPUT',
          title: 'Gõ câu trả lời',
          prompt: 'Trong câu “Mẹ mua hoa”, từ nào chỉ người?',
          instruction: 'Con có thể gõ câu trả lời vào ô bên dưới.',
          options: [],
          buttonInput: null,
          textInput:
            kidlearnV3_4c3BuildTextInputConfig_('TEXT_INPUT', subjectKey),
          handwriting: null,
          autoGrade: true,
          expectedAnswer: 'Mẹ',
          order: 1
        },
        {
          activityId: lesson.lessonId + '_ACT_2',
          lessonId: lesson.lessonId,
          activityType: 'HANDWRITE_INPUT',
          answerMode: 'HANDWRITE_INPUT',
          title: 'Viết bằng tay',
          prompt: 'Con viết lại câu: Bé chăm học.',
          instruction: 'Con có thể dùng tay hoặc bút cảm ứng để viết.',
          options: [],
          buttonInput: null,
          textInput: null,
          handwriting:
            kidlearnV3_4c3BuildHandwritingConfig_('HANDWRITE_INPUT', subjectKey),
          autoGrade: false,
          expectedAnswer: '',
          order: 2
        }
      ]
    };
  }

  if (subjectKey === 'ENGLISH') {
    return {
      blocks: [
        {
          blockId: lesson.lessonId + '_BLOCK_1',
          lessonId: lesson.lessonId,
          blockType: 'CONTENT',
          title: 'New words',
          content:
            'Today we learn: father, mother, brother, sister.',
          illustrationHint: 'family',
          order: 1
        }
      ],
      activities: [
        {
          activityId: lesson.lessonId + '_ACT_1',
          lessonId: lesson.lessonId,
          activityType: 'MULTIPLE_CHOICE',
          answerMode: 'MULTIPLE_CHOICE',
          title: 'Choose the word',
          prompt: 'Which word means “mẹ”?',
          instruction: 'Choose one answer.',
          options: [
            { optionId: 'A', label: 'mother', isCorrect: true },
            { optionId: 'B', label: 'father', isCorrect: false },
            { optionId: 'C', label: 'sister', isCorrect: false }
          ],
          buttonInput: null,
          textInput: null,
          handwriting: null,
          autoGrade: true,
          expectedAnswer: 'mother',
          order: 1
        }
      ]
    };
  }

  if (subjectKey === 'SCIENCE') {
    return {
      blocks: [
        {
          blockId: lesson.lessonId + '_BLOCK_1',
          lessonId: lesson.lessonId,
          blockType: 'CONTENT',
          title: 'Quan sát cây',
          content:
            'Cây cần nước, ánh sáng và không khí để sống.',
          illustrationHint: 'plant',
          order: 1
        }
      ],
      activities: [
        {
          activityId: lesson.lessonId + '_ACT_1',
          lessonId: lesson.lessonId,
          activityType: 'MULTIPLE_CHOICE',
          answerMode: 'MULTIPLE_CHOICE',
          title: 'Chọn đáp án',
          prompt: 'Cây cần gì để sống?',
          instruction: 'Con chọn đáp án đúng nhé.',
          options: [
            { optionId: 'A', label: 'Nước', isCorrect: true },
            { optionId: 'B', label: 'Đồ chơi', isCorrect: false },
            { optionId: 'C', label: 'Kẹo', isCorrect: false }
          ],
          buttonInput: null,
          textInput: null,
          handwriting: null,
          autoGrade: true,
          expectedAnswer: 'Nước',
          order: 1
        }
      ]
    };
  }

  return {
    blocks: [
      {
        blockId: lesson.lessonId + '_BLOCK_1',
        lessonId: lesson.lessonId,
        blockType: 'CONTENT',
        title: 'Cùng học phép cộng',
        content:
          'Khi cộng, con gộp các nhóm lại với nhau để biết có tất cả bao nhiêu.',
        illustrationHint: 'math_numbers',
        order: 1
      },
      {
        blockId: lesson.lessonId + '_BLOCK_2',
        lessonId: lesson.lessonId,
        blockType: 'EXAMPLE',
        title: 'Ví dụ',
        content:
          '8 + 5 = 13. Con có thể đếm tiếp từ 8: 9, 10, 11, 12, 13.',
        illustrationHint: 'math_example',
        order: 2
      }
    ],
    activities: [
      {
        activityId: lesson.lessonId + '_ACT_1',
        lessonId: lesson.lessonId,
        activityType: 'BUTTON_INPUT',
        answerMode: 'BUTTON_INPUT',
        title: 'Bấm số trả lời',
        prompt: '8 + 5 = ?',
        instruction: 'Con bấm số để nhập đáp án.',
        options: [],
        buttonInput:
          kidlearnV3_4c3BuildButtonInputConfig_('BUTTON_INPUT', subjectKey),
        textInput: null,
        handwriting: null,
        autoGrade: true,
        expectedAnswer: '13',
        order: 1
      },
      {
        activityId: lesson.lessonId + '_ACT_2',
        lessonId: lesson.lessonId,
        activityType: 'HANDWRITE_INPUT',
        answerMode: 'HANDWRITE_INPUT',
        title: 'Viết phép tính',
        prompt: 'Con viết lại phép tính: 8 + 5 = 13',
        instruction: 'Con có thể dùng tay hoặc bút cảm ứng để viết.',
        options: [],
        buttonInput: null,
        textInput: null,
        handwriting:
          kidlearnV3_4c3BuildHandwritingConfig_('HANDWRITE_INPUT', subjectKey),
        autoGrade: false,
        expectedAnswer: '',
        order: 2
      }
    ]
  };
}


/**
 * Answer mode configs.
 */
function kidlearnV3_4c3GetSupportedAnswerModes_() {
  return [
    {
      answerMode: 'MULTIPLE_CHOICE',
      label: 'Chọn đáp án',
      enabledIn4C4: true,
      autoGradePossible: true
    },
    {
      answerMode: 'BUTTON_INPUT',
      label: 'Bấm nút nhập đáp án',
      enabledIn4C4: true,
      autoGradePossible: true
    },
    {
      answerMode: 'TEXT_INPUT',
      label: 'Gõ câu trả lời',
      enabledIn4C4: true,
      autoGradePossible: true
    },
    {
      answerMode: 'HANDWRITE_INPUT',
      label: 'Viết bằng tay / pen',
      enabledIn4C4: true,
      autoGradePossible: false
    }
  ];
}


function kidlearnV3_4c3ResolveAnswerMode_(activityType, subjectKey, prompt) {
  var type =
    String(activityType || '')
      .trim()
      .toUpperCase();

  if (type.indexOf('HAND') >= 0 || type.indexOf('WRITE') >= 0) {
    return {
      activityType: 'HANDWRITE_INPUT',
      answerMode: 'HANDWRITE_INPUT',
      title: 'Viết bằng tay',
      prompt: prompt || 'Con viết câu trả lời ở đây.',
      instruction: 'Con có thể dùng tay hoặc bút cảm ứng.',
      autoGrade: false,
      expectedAnswer: ''
    };
  }

  if (type.indexOf('TEXT') >= 0 || type.indexOf('TYPING') >= 0) {
    return {
      activityType: 'TEXT_INPUT',
      answerMode: 'TEXT_INPUT',
      title: 'Gõ câu trả lời',
      prompt: prompt || 'Con gõ câu trả lời.',
      instruction: 'Con nhập đáp án bằng bàn phím.',
      autoGrade: true,
      expectedAnswer: ''
    };
  }

  if (type.indexOf('BUTTON') >= 0 || type.indexOf('NUMBER') >= 0) {
    return {
      activityType: 'BUTTON_INPUT',
      answerMode: 'BUTTON_INPUT',
      title: 'Bấm nút nhập đáp án',
      prompt: prompt || 'Con bấm nút để trả lời.',
      instruction: 'Con dùng các nút lớn để nhập đáp án.',
      autoGrade: true,
      expectedAnswer: ''
    };
  }

  return {
    activityType: 'MULTIPLE_CHOICE',
    answerMode: 'MULTIPLE_CHOICE',
    title: 'Chọn đáp án',
    prompt: prompt || 'Con chọn đáp án đúng.',
    instruction: 'Con chọn một đáp án.',
    autoGrade: true,
    expectedAnswer: ''
  };
}


function kidlearnV3_4c3BuildButtonInputConfig_(answerMode, subjectKey) {
  if (answerMode !== 'BUTTON_INPUT') return null;

  if (subjectKey === 'VIETNAMESE') {
    return {
      keypadType: 'WORD_BANK',
      buttons: [
        'con',
        'mèo',
        'mẹ',
        'bé',
        'hoa',
        'đang',
        'ngủ',
        'học'
      ],
      actions: ['Xóa', 'Trả lời']
    };
  }

  return {
    keypadType: 'NUMBER_PAD',
    buttons: [
      '1',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '0',
      '+',
      '-',
      '='
    ],
    actions: ['Xóa', 'Trả lời']
  };
}


function kidlearnV3_4c3BuildTextInputConfig_(answerMode, subjectKey) {
  if (answerMode !== 'TEXT_INPUT') return null;

  return {
    placeholder:
      subjectKey === 'MATH'
        ? 'Con nhập số hoặc phép tính...'
        : 'Con nhập câu trả lời ở đây...',
    maxLength:
      subjectKey === 'MATH'
        ? 30
        : 180,
    multiline:
      subjectKey !== 'MATH',
    submitLabel: 'Trả lời'
  };
}


function kidlearnV3_4c3BuildHandwritingConfig_(answerMode, subjectKey) {
  if (answerMode !== 'HANDWRITE_INPUT') return null;

  return {
    canvasId: 'lessonHandwritingCanvas4C4',
    width: 720,
    height: 280,
    penColor: '#0F172A',
    penSize: 5,
    background: '#FFFFFF',
    guideLines:
      subjectKey === 'VIETNAMESE',
    mathGrid:
      subjectKey === 'MATH',
    tools: [
      'pen',
      'eraser',
      'clear'
    ],
    actions: [
      'Xóa',
      'Hoàn tác',
      'Gửi bài'
    ],
    autoGrade: false,
    storageLater: {
      savePng: true,
      saveStrokeJson: true,
      target: 'DATA_Responses or Drive in later phase'
    }
  };
}


/**
 * Themes.
 */
function kidlearnV3_4c3ResolveTheme_(subjectKey) {
  if (typeof kidlearnV3_getSubjectThemeMap4C1V3 === 'function') {
    var map =
      kidlearnV3_getSubjectThemeMap4C1V3();

    if (map[subjectKey]) {
      return map[subjectKey];
    }

    return map.DEFAULT;
  }

  var fallback = {
    MATH: {
      subjectKey: 'MATH',
      subjectName: 'Toán học',
      colorName: 'blue',
      primary: '#2F80ED',
      pastel: '#EFF6FF',
      border: '#BFDBFE',
      text: '#1D4ED8',
      gradient: 'linear-gradient(135deg, #2F80ED, #38BDF8)'
    },
    VIETNAMESE: {
      subjectKey: 'VIETNAMESE',
      subjectName: 'Tiếng Việt',
      colorName: 'orange',
      primary: '#F97316',
      pastel: '#FFF7ED',
      border: '#FED7AA',
      text: '#C2410C',
      gradient: 'linear-gradient(135deg, #F97316, #FDBA74)'
    },
    ENGLISH: {
      subjectKey: 'ENGLISH',
      subjectName: 'Tiếng Anh',
      colorName: 'green',
      primary: '#22C55E',
      pastel: '#F0FDF4',
      border: '#BBF7D0',
      text: '#15803D',
      gradient: 'linear-gradient(135deg, #22C55E, #86EFAC)'
    },
    SCIENCE: {
      subjectKey: 'SCIENCE',
      subjectName: 'Khoa học',
      colorName: 'red',
      primary: '#EF4444',
      pastel: '#FEF2F2',
      border: '#FECACA',
      text: '#B91C1C',
      gradient: 'linear-gradient(135deg, #EF4444, #FB7185)'
    }
  };

  return fallback[subjectKey] || fallback.MATH;
}


/**
 * Utilities.
 */
function kidlearnV3_4c3OpenSpreadsheet_() {
  var active =
    SpreadsheetApp.getActiveSpreadsheet();

  if (active) return active;

  var properties =
    PropertiesService.getScriptProperties();

  var keys = [
    'KIDLEARN_V3_DEV_SPREADSHEET_ID',
    'DEV_SPREADSHEET_ID'
  ];

  try {
    if (
      typeof KIDLEARN_V3 !== 'undefined' &&
      KIDLEARN_V3 &&
      KIDLEARN_V3.SCRIPT_PROPERTIES &&
      KIDLEARN_V3.SCRIPT_PROPERTIES.DEV_SPREADSHEET_ID
    ) {
      keys.unshift(
        KIDLEARN_V3.SCRIPT_PROPERTIES.DEV_SPREADSHEET_ID
      );
    }
  } catch (error) {
    // ignore
  }

  for (var i = 0; i < keys.length; i++) {
    var id =
      properties.getProperty(keys[i]);

    if (id) {
      return SpreadsheetApp.openById(id);
    }
  }

  throw new Error('Không tìm thấy DEV spreadsheet.');
}


function kidlearnV3_4c3GetSheetByExactName_(spreadsheet, sheetName) {
  if (typeof kidlearnV3_getSheetByExactName_ === 'function') {
    return kidlearnV3_getSheetByExactName_(
      spreadsheet,
      sheetName
    );
  }

  var sheets =
    spreadsheet.getSheets();

  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() === sheetName) {
      return sheets[i];
    }
  }

  return null;
}


function kidlearnV3_4c3ResolveSubjectKey_(code, name) {
  var text =
    String(code || '') +
    ' ' +
    String(name || '');

  text =
    text
      .trim()
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '')
      .replace(/-/g, '_');

  if (
    text.indexOf('MATH') >= 0 ||
    text.indexOf('TOAN') >= 0 ||
    text.indexOf('SUB_T') >= 0
  ) {
    return 'MATH';
  }

  if (
    text.indexOf('VIET') >= 0 ||
    text.indexOf('TIENGVIET') >= 0 ||
    text.indexOf('SUB_TV') >= 0
  ) {
    return 'VIETNAMESE';
  }

  if (
    text.indexOf('ENGLISH') >= 0 ||
    text.indexOf('TIENGANH') >= 0 ||
    text.indexOf('SUB_E') >= 0
  ) {
    return 'ENGLISH';
  }

  if (
    text.indexOf('SCIENCE') >= 0 ||
    text.indexOf('KHOAHOC') >= 0 ||
    text.indexOf('SUB_K') >= 0 ||
    text.indexOf('SUB_S') >= 0
  ) {
    return 'SCIENCE';
  }

  return 'DEFAULT';
}


function kidlearnV3_4c3SubjectNameFromKey_(key) {
  var map = {
    MATH: 'Toán học',
    VIETNAMESE: 'Tiếng Việt',
    ENGLISH: 'Tiếng Anh',
    SCIENCE: 'Khoa học',
    DEFAULT: 'Môn học'
  };

  return map[key] || map.DEFAULT;
}


function kidlearnV3_4c3IllustrationHint_(subjectKey) {
  var map = {
    MATH: 'math_numbers',
    VIETNAMESE: 'book_pencil',
    ENGLISH: 'abc_words',
    SCIENCE: 'science_lab'
  };

  return map[subjectKey] || 'lesson';
}


function kidlearnV3_4c3GetAny_(row, keys) {
  if (!row) return '';

  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];

    if (
      row.hasOwnProperty(key) &&
      row[key] !== null &&
      row[key] !== undefined &&
      String(row[key]).trim() !== ''
    ) {
      return row[key];
    }

    var normalized =
      kidlearnV3_4c3NormalizeLookupKey_(key);

    for (var actual in row) {
      if (!row.hasOwnProperty(actual)) continue;

      if (
        kidlearnV3_4c3NormalizeLookupKey_(actual) ===
        normalized
      ) {
        if (
          row[actual] !== null &&
          row[actual] !== undefined &&
          String(row[actual]).trim() !== ''
        ) {
          return row[actual];
        }
      }
    }
  }

  return '';
}


function kidlearnV3_4c3NormalizeLookupKey_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .replace(/-/g, '')
    .replace(/[^\w]/g, '');
}


function kidlearnV3_4c3IsBlankRow_(row) {
  for (var i = 0; i < row.length; i++) {
    if (
      row[i] !== null &&
      row[i] !== undefined &&
      String(row[i]).trim() !== ''
    ) {
      return false;
    }
  }

  return true;
}


function kidlearnV3_4c3FindBy_(items, field, value) {
  for (var i = 0; i < items.length; i++) {
    if (String(items[i][field]) === String(value)) {
      return items[i];
    }
  }

  return null;
}


function kidlearnV3_4c3ToNumber_(value, fallback) {
  var number = Number(value);

  if (isNaN(number)) {
    return fallback || 0;
  }

  return number;
}


function kidlearnV3_4c3ToBool_(value, fallback) {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ''
  ) {
    return fallback;
  }

  var text =
    String(value)
      .trim()
      .toUpperCase();

  if (
    text === 'TRUE' ||
    text === 'YES' ||
    text === 'ACTIVE' ||
    text === '1' ||
    text === 'ĐÚNG' ||
    text === 'DUNG'
  ) {
    return true;
  }

  if (
    text === 'FALSE' ||
    text === 'NO' ||
    text === 'INACTIVE' ||
    text === '0' ||
    text === 'SAI'
  ) {
    return false;
  }

  return fallback;
}


function kidlearnV3_4c3Clamp_(value, min, max) {
  var number =
    kidlearnV3_4c3ToNumber_(value, min);

  if (number < min) return min;
  if (number > max) return max;

  return number;
}


function kidlearnV3_4c3SafeCall_(functionName) {
  try {
    var exists =
      eval(
        'typeof ' +
        functionName +
        ' === "function"'
      );

    if (!exists) {
      return {
        success: false,
        functionName: functionName,
        message:
          'Thiếu function ' + functionName,
        output: null
      };
    }

    var fn =
      eval(functionName);

    var output =
      fn();

    return {
      success:
        output && output.success === true,
      functionName: functionName,
      message:
        output && output.success === true
          ? ''
          : JSON.stringify(output),
      output: output
    };

  } catch (error) {
    return {
      success: false,
      functionName: functionName,
      message:
        String(error.message || error),
      output: null
    };
  }
}


function kidlearnV3_4c3SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_LESSON_PLAYER_4C3_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_LESSON_PLAYER_4C3_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase: result.phase,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.PARENT_PHASE,
      status: status,
      nextBundle:
        KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_LESSON_PLAYER_4C3_CONFIG.NEXT_STAGE,
      selectedSubjectKey:
        result.selectedSubjectKey || '',
      lessonId:
        result.lessonId || '',
      lessonTitle:
        result.lessonTitle || '',
      blockCount:
        result.blockCount || 0,
      activityCount:
        result.activityCount || 0,
      playerStepCount:
        result.playerStepCount || 0,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      errorCount:
        result.errorCount || 0,
      warningCount:
        result.warningCount || 0,
      errors:
        result.errors || [],
      warnings:
        result.warnings || [],
      at:
        new Date().toISOString()
    })
  );
}


function kidlearnV3_4c3ReadJsonProperty_(key) {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(key);

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      raw: text
    };
  }
}