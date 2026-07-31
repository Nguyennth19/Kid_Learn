/**
 * ================================================================
 * KIDLEARN V3 - LEARNING UI DEV
 * Bundle: 3K-B
 * Steps:
 * - 3K.4: Attach subject / lesson / assignment into UI
 * - 3K.5: Create basic Lesson Player DEV
 * Version: 3.1.0
 * ================================================================
 *
 * 3K-B chỉ đọc dữ liệu.
 * KHÔNG ghi progress.
 * KHÔNG mở real write.
 * KHÔNG sửa PROD.
 */


var KIDLEARN_V3_LEARNING_UI_3KB_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3KB_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3KB_LAST_PREVIEW_AT',
  LAST_SCREEN_BUILD_AT: 'KIDLEARN_V3_PHASE_3KB_LAST_SCREEN_BUILD_AT',
  LAST_SMOKE_TEST_AT: 'KIDLEARN_V3_PHASE_3KB_LAST_SMOKE_TEST_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3KB_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3KB_LAST_RESULT_JSON'
};


var KIDLEARN_V3_LEARNING_UI_3KB_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  SCREEN_BUILT: 'SCREEN_BUILT',
  SMOKE_TESTED: 'SMOKE_TESTED',
  READY_FOR_3K_C: 'READY_FOR_3K_C',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_LEARNING_UI_3KB_CONFIG = {
  VERSION: '3K-B',
  PHASE: '3K.4_3K.5',
  NEXT_BUNDLE: '3K-C',
  READ_ONLY: true,
  SCREEN_ID: 'LEARNING_DEV_3KB',
  DEFAULT_VIEW: 'LESSON_PLAYER_DEV'
};


/**
 * Preview 3K-B.
 */
function kidlearnV3_previewLearningUi3KBV3() {
  var errors = [];
  var warnings = [];

  var functionChecks =
    kidlearnV3_3kbCheckFunctions_([
      'kidlearnV3_assertLearningUiCore3KAReadyV3',
      'kidlearnV3_buildLearningUiState3KAV3',
      'kidlearnV3_buildLearningScreenPayload3KAV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_uiInclude_'
    ]);

  errors =
    errors.concat(
      functionChecks.errors
    );

  var htmlChecks =
    kidlearnV3_3kbCheckHtmlFiles_([
      'UI_Learning_Dev_3KB_Client_V3',
      'UI_Learning_Dev_3KB'
    ]);

  errors =
    errors.concat(
      htmlChecks.errors
    );

  var phase3KA =
    kidlearnV3_3kbSafeAssert3KAReady_();

  if (!phase3KA.success) {
    errors.push(
      '3K-A chưa READY_FOR_3K_B: ' +
      phase3KA.message
    );
  }

  var safeWrite =
    kidlearnV3_3kbSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    warnings.push(
      'Safe Write nên ở DRY_RUN/enabled=false trong 3K-B. Hiện tại mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var samplePayload = null;

  try {
    if (errors.length === 0) {
      samplePayload =
        kidlearnV3_buildLearningScreenPayload3KAV3({});
    }
  } catch (error) {
    errors.push(
      'Không build được payload mẫu từ 3K-A: ' +
      String(error.message || error)
    );
  }

  if (
    samplePayload &&
    samplePayload.diagnostics &&
    samplePayload.diagnostics.lessonsCount < 1
  ) {
    warnings.push(
      'Hiện chưa có lesson trong MST_Lessons. 3K-B vẫn tạo UI shell và Lesson Player empty state.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_LEARNING_UI_3KB_V3',
    bundle: '3K-B',
    phase: KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.NEXT_BUNDLE,
    readOnly: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3KA: phase3KA,
    safeWriteStatus: safeWrite,
    functionChecks: functionChecks.items,
    htmlChecks: htmlChecks.items,
    sampleDiagnostics:
      samplePayload
        ? samplePayload.diagnostics
        : null
  };

  kidlearnV3_3kbSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_UI_3KB_STATUS.PREVIEWED,
    KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_PREVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Build Learning UI DEV screen 3K-B.
 */
function kidlearnV3_buildLearningScreen3KBV3(request) {
  var req =
    kidlearnV3_3kbNormalizeRequest_(
      request
    );

  var assert3KA =
    kidlearnV3_assertLearningUiCore3KAReadyV3();

  if (!assert3KA.success) {
    throw new Error(
      'Không thể build 3K-B vì 3K-A chưa ready.'
    );
  }

  var basePayload =
    kidlearnV3_buildLearningScreenPayload3KAV3(
      req
    );

  var lessonPlayer =
    kidlearnV3_buildLessonPlayerPayload3KBV3(
      req,
      basePayload
    );

  var screen = {
    success: true,
    action: 'BUILD_LEARNING_SCREEN_3KB_V3',
    bundle: '3K-B',
    phase: '3K.4_3K.5',
    screenId:
      KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.SCREEN_ID,
    readOnly: true,
    writeEnabled: false,
    generatedAt:
      new Date().toISOString(),
    layout: {
      title: 'KIDLEARN V3 - Learning DEV',
      subtitle: '3K-B Read-only Learning UI and basic Lesson Player',
      currentView:
        req.currentView ||
        KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.DEFAULT_VIEW
    },
    header:
      basePayload.header || {},
    subjectRail:
      basePayload.subjectRail || {
        selectedSubjectId: '',
        items: []
      },
    lessonList:
      basePayload.lessonList || {
        selectedLessonId: '',
        items: []
      },
    assignmentPanel:
      basePayload.assignmentPanel || {
        items: []
      },
    topicList:
      basePayload.topicList || {
        items: []
      },
    lessonPlayer:
      lessonPlayer,
    guards: {
      phase3KAReady: true,
      readOnly: true,
      writeEnabled: false,
      safeWriteExpectedMode: 'DRY_RUN',
      nextWriteBundle: '3K-C',
      prodTouched: false
    },
    diagnostics: {
      subjectsCount:
        basePayload.diagnostics
          ? basePayload.diagnostics.subjectsCount
          : 0,
      lessonsCount:
        basePayload.diagnostics
          ? basePayload.diagnostics.lessonsCount
          : 0,
      assignmentsCount:
        basePayload.diagnostics
          ? basePayload.diagnostics.assignmentsCount
          : 0,
      lessonBlocksCount:
        lessonPlayer.blocks.length,
      activitiesCount:
        lessonPlayer.activities.length,
      hasLesson:
        lessonPlayer.hasLesson
    }
  };

  kidlearnV3_3kbSaveResult_(
    {
      success: true,
      action: screen.action,
      bundle: screen.bundle,
      phase: screen.phase,
      errorCount: 0,
      warningCount: lessonPlayer.warningCount || 0,
      warnings: lessonPlayer.warnings || [],
      diagnostics: screen.diagnostics
    },
    KIDLEARN_V3_LEARNING_UI_3KB_STATUS.SCREEN_BUILT,
    KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_SCREEN_BUILD_AT
  );

  console.log(
    JSON.stringify(screen, null, 2)
  );

  return screen;
}


/**
 * Build basic Lesson Player payload.
 */
function kidlearnV3_buildLessonPlayerPayload3KBV3(
  request,
  basePayload
) {
  var req =
    kidlearnV3_3kbNormalizeRequest_(
      request
    );

  var warnings = [];

  var state =
    kidlearnV3_buildLearningUiState3KAV3(
      req
    );

  var data =
    kidlearnV3_3kbReadLearningData_();

  var selectedLesson =
    state.selectedLesson || {
      lessonId: '',
      lessonTitle: ''
    };

  var lessonId =
    String(
      req.lessonId ||
      selectedLesson.lessonId ||
      ''
    ).trim();

  var blocks =
    kidlearnV3_3kbBuildLessonBlocks_(
      data.lessonBlocks,
      lessonId
    );

  var activities =
    kidlearnV3_3kbBuildLessonActivities_(
      data.activities,
      lessonId,
      blocks
    );

  if (!lessonId) {
    warnings.push(
      'Chưa có selected lesson. Lesson Player hiển thị empty state.'
    );
  }

  if (lessonId && blocks.length < 1) {
    warnings.push(
      'Lesson đang chọn chưa có lesson blocks. 3K-B vẫn pass với player shell.'
    );
  }

  if (lessonId && activities.length < 1) {
    warnings.push(
      'Lesson đang chọn chưa có activities. 3K-B vẫn pass với player shell.'
    );
  }

  var player = {
    success: true,
    action: 'BUILD_LESSON_PLAYER_PAYLOAD_3KB_V3',
    bundle: '3K-B',
    phase: '3K.5',
    readOnly: true,
    writeEnabled: false,
    hasLesson:
      lessonId ? true : false,
    lesson: {
      lessonId: lessonId,
      lessonTitle:
        selectedLesson.lessonTitle ||
        selectedLesson.title ||
        '',
      subjectId:
        selectedLesson.subjectId || '',
      topicId:
        selectedLesson.topicId || '',
      lessonType:
        selectedLesson.lessonType || '',
      estimatedMinutes:
        Number(
          selectedLesson.estimatedMinutes || 0
        ),
      progressPercent:
        Number(
          selectedLesson.progressPercent || 0
        ),
      raw:
        selectedLesson.raw || {}
    },
    blocks: blocks,
    activities: activities,
    controls: {
      showStartButton: true,
      showFinishButton: true,
      showProgressButton: true,
      buttonsAreDryRunOnly: true,
      note:
        '3K-B chỉ render button layout. Gắn hành động DRY_RUN/real write ở 3K-C.'
    },
    emptyState: {
      noLesson:
        !lessonId,
      noBlocks:
        lessonId && blocks.length < 1,
      noActivities:
        lessonId && activities.length < 1,
      message:
        !lessonId
          ? 'Chưa có bài học để hiển thị.'
          : blocks.length < 1
            ? 'Bài học chưa có nội dung block.'
            : ''
    },
    warningCount:
      warnings.length,
    warnings: warnings
  };

  console.log(
    JSON.stringify(player, null, 2)
  );

  return player;
}


/**
 * Open Learning UI DEV 3K-B.
 */
function kidlearnV3_showLearningDev3KBV3() {
  var preview =
    kidlearnV3_previewLearningUi3KBV3();

  if (!preview.success) {
    throw new Error(
      'Learning UI 3K-B chưa sẵn sàng. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var html =
    HtmlService
      .createTemplateFromFile(
        'UI_Learning_Dev_3KB'
      )
      .evaluate()
      .setTitle(
        'KIDLEARN V3 - Learning DEV 3K-B'
      )
      .setWidth(1300)
      .setHeight(900);

  SpreadsheetApp
    .getUi()
    .showModalDialog(
      html,
      'KIDLEARN V3 - Learning DEV 3K-B'
    );
}


/**
 * UI function: get initial payload.
 */
function kidlearnV3_uiLearning3KBGetInitialPayloadV3(request) {
  return kidlearnV3_buildLearningScreen3KBV3(
    request || {}
  );
}


/**
 * Smoke test 3K-B.
 */
function kidlearnV3_smokeTestLearningUi3KBV3() {
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewLearningUi3KBV3();

  if (!preview.success) {
    throw new Error(
      'Không thể smoke test 3K-B vì preview chưa đạt. Errors=' +
      preview.errorCount
    );
  }

  var screen =
    kidlearnV3_buildLearningScreen3KBV3({});

  if (!screen.success) {
    errors.push(
      'Build screen 3K-B không success.'
    );
  }

  if (screen.readOnly !== true) {
    errors.push(
      '3K-B screen phải readOnly=true.'
    );
  }

  if (screen.writeEnabled !== false) {
    errors.push(
      '3K-B screen phải writeEnabled=false.'
    );
  }

  if (
    !screen.subjectRail ||
    !screen.subjectRail.items ||
    screen.subjectRail.items.length < 1
  ) {
    errors.push(
      '3K-B UI thiếu subjectRail.items.'
    );
  }

  if (!screen.lessonList || !screen.lessonList.items) {
    errors.push(
      '3K-B UI thiếu lessonList.items.'
    );
  }

  if (!screen.lessonPlayer) {
    errors.push(
      '3K-B UI thiếu lessonPlayer.'
    );
  }

  if (
    screen.lessonPlayer &&
    screen.lessonPlayer.warningCount > 0
  ) {
    warnings =
      warnings.concat(
        screen.lessonPlayer.warnings || []
      );
  }

  if (
    screen.diagnostics &&
    screen.diagnostics.lessonsCount < 1
  ) {
    warnings.push(
      'Chưa có lesson trong DB. UI shell vẫn pass, content seed sẽ xử lý ở phase sau.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_LEARNING_UI_3KB_V3',
    bundle: '3K-B',
    phase: KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.NEXT_BUNDLE,
    readOnly: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    diagnostics:
      screen.diagnostics || {},
    guards:
      screen.guards || {}
  };

  kidlearnV3_3kbSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LEARNING_UI_3KB_STATUS.SMOKE_TESTED
      : KIDLEARN_V3_LEARNING_UI_3KB_STATUS.FAILED,
    KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_SMOKE_TEST_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test 3K-B chưa đạt. Errors=' +
      result.errorCount +
      '. ' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 3K-B ready.
 */
function kidlearnV3_markLearningUi3KBReadyV3() {
  var smoke =
    kidlearnV3_smokeTestLearningUi3KBV3();

  if (!smoke.success) {
    throw new Error(
      'Không thể mark 3K-B ready vì smoke test chưa pass.'
    );
  }

  var result = {
    success: true,
    action: 'MARK_LEARNING_UI_3KB_READY_V3',
    bundle: '3K-B',
    phase: KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.PHASE,
    status:
      KIDLEARN_V3_LEARNING_UI_3KB_STATUS.READY_FOR_3K_C,
    nextBundle:
      KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.NEXT_BUNDLE,
    message:
      '3K-B đã ready. Có thể chuyển sang 3K-C để gắn action Start/Finish/Progress/Daily Goal ở DRY_RUN gate.'
  };

  kidlearnV3_3kbSaveResult_(
    result,
    KIDLEARN_V3_LEARNING_UI_3KB_STATUS.READY_FOR_3K_C,
    KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Get 3K-B status.
 */
function kidlearnV3_getLearningUi3KBStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_LEARNING_UI_3KB_STATUS_V3',
    bundle: '3K-B',
    phase: KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_UI_3KB_KEYS.STATUS
      ) ||
      KIDLEARN_V3_LEARNING_UI_3KB_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastScreenBuildAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_SCREEN_BUILD_AT
      ) ||
      '',
    lastSmokeTestAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_SMOKE_TEST_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3kbReadLastResult_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3K-B ready.
 */
function kidlearnV3_assertLearningUi3KBReadyV3() {
  var status =
    kidlearnV3_getLearningUi3KBStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_LEARNING_UI_3KB_STATUS.READY_FOR_3K_C
  ) {
    errors.push(
      '3K-B chưa READY_FOR_3K_C. Status hiện tại=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_LEARNING_UI_3KB_READY_V3',
    bundle: '3K-B',
    phase: KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_LEARNING_UI_3KB_CONFIG.NEXT_BUNDLE,
    errorCount: errors.length,
    errors: errors
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3K-B chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Build lesson blocks.
 */
function kidlearnV3_3kbBuildLessonBlocks_(
  rows,
  lessonId
) {
  var result = [];

  if (!lessonId) {
    return result;
  }

  for (var i = 0; i < rows.length; i++) {
    var row =
      rows[i];

    if (
      row.lessonId &&
      String(row.lessonId) !== String(lessonId)
    ) {
      continue;
    }

    var blockId =
      row.lessonBlockId ||
      row.blockId ||
      row.id ||
      '';

    if (!blockId) {
      blockId =
        'BLOCK_' +
        lessonId +
        '_' +
        (i + 1);
    }

    result.push({
      blockId: blockId,
      lessonId: lessonId,
      blockType:
        row.blockType ||
        row.type ||
        'TEXT',
      title:
        row.title ||
        row.blockTitle ||
        '',
      contentText:
        row.contentText ||
        row.blockContent ||
        row.bodyText ||
        row.instruction ||
        '',
      mediaAssetId:
        row.mediaAssetId || '',
      displayOrder:
        Number(row.displayOrder || row.order || i + 1),
      raw:
        row
    });
  }

  result.sort(
    function(a, b) {
      return a.displayOrder - b.displayOrder;
    }
  );

  return result;
}


/**
 * Build lesson activities.
 */
function kidlearnV3_3kbBuildLessonActivities_(
  rows,
  lessonId,
  blocks
) {
  var result = [];

  if (!lessonId) {
    return result;
  }

  var blockIds = {};

  for (var b = 0; b < blocks.length; b++) {
    blockIds[blocks[b].blockId] = true;
  }

  for (var i = 0; i < rows.length; i++) {
    var row =
      rows[i];

    if (
      row.lessonId &&
      String(row.lessonId) !== String(lessonId)
    ) {
      continue;
    }

    if (
      row.lessonBlockId &&
      blocks.length > 0 &&
      !blockIds[row.lessonBlockId]
    ) {
      continue;
    }

    var activityId =
      row.activityId ||
      row.id ||
      '';

    if (!activityId) {
      activityId =
        'ACT_' +
        lessonId +
        '_' +
        (i + 1);
    }

    result.push({
      activityId: activityId,
      lessonId: lessonId,
      lessonBlockId:
        row.lessonBlockId ||
        row.blockId ||
        '',
      activityType:
        row.activityType ||
        row.type ||
        'READ',
      prompt:
        row.prompt ||
        row.questionText ||
        row.instruction ||
        row.title ||
        '',
      options:
        kidlearnV3_3kbParseOptions_(
          row.options ||
          row.optionJson ||
          ''
        ),
      expectedAnswer:
        row.expectedAnswer ||
        row.answer ||
        '',
      displayOrder:
        Number(row.displayOrder || row.order || i + 1),
      raw:
        row
    });
  }

  result.sort(
    function(a, b) {
      return a.displayOrder - b.displayOrder;
    }
  );

  return result;
}


/**
 * Read learning data from 3K-A helper.
 */
function kidlearnV3_3kbReadLearningData_() {
  if (
    typeof kidlearnV3_3kaReadLearningData_ === 'function'
  ) {
    return kidlearnV3_3kaReadLearningData_();
  }

  return {
    lessonBlocks: [],
    activities: []
  };
}


/**
 * Parse options.
 */
function kidlearnV3_3kbParseOptions_(
  value
) {
  var text =
    String(value || '').trim();

  if (!text) {
    return [];
  }

  try {
    var parsed =
      JSON.parse(text);

    if (Array.isArray(parsed)) {
      return parsed;
    }

    return [parsed];

  } catch (error) {
    return text
      .split('|')
      .map(function(item) {
        return String(item || '').trim();
      })
      .filter(function(item) {
        return item;
      });
  }
}


/**
 * Check function availability.
 */
function kidlearnV3_3kbCheckFunctions_(
  names
) {
  var errors = [];
  var items = [];

  for (var i = 0; i < names.length; i++) {
    var exists = false;

    try {
      exists =
        eval(
          'typeof ' +
          names[i] +
          ' === "function"'
        );
    } catch (error) {
      exists = false;
    }

    items.push({
      name: names[i],
      exists: exists
    });

    if (!exists) {
      errors.push(
        'Thiếu function: ' +
        names[i]
      );
    }
  }

  return {
    errors: errors,
    items: items
  };
}


/**
 * Check HTML files.
 */
function kidlearnV3_3kbCheckHtmlFiles_(
  filenames
) {
  var errors = [];
  var items = [];

  for (var i = 0; i < filenames.length; i++) {
    try {
      var content =
        HtmlService
          .createHtmlOutputFromFile(
            filenames[i]
          )
          .getContent();

      items.push({
        name: filenames[i],
        exists: true,
        length: content.length
      });

    } catch (error) {
      errors.push(
        'Thiếu HTML file: ' +
        filenames[i]
      );

      items.push({
        name: filenames[i],
        exists: false,
        error:
          String(error.message || error)
      });
    }
  }

  return {
    errors: errors,
    items: items
  };
}


/**
 * Safe assert 3K-A ready.
 */
function kidlearnV3_3kbSafeAssert3KAReady_() {
  try {
    var result =
      kidlearnV3_assertLearningUiCore3KAReadyV3();

    return {
      success: result.success === true,
      message: ''
    };

  } catch (error) {
    return {
      success: false,
      message:
        String(error.message || error)
    };
  }
}


/**
 * Safe Write status.
 */
function kidlearnV3_3kbSafeWriteStatus_() {
  try {
    return kidlearnV3_getSafeWriteLayerStatusV3();
  } catch (error) {
    return {
      success: false,
      mode: '',
      enabled: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Save result.
 *
 * Nếu 3K-B đã READY_FOR_3K_C thì preview/build/smoke
 * không được downgrade status.
 */
function kidlearnV3_3kbSaveResult_(
  result,
  status,
  dateKey
) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_LEARNING_UI_3KB_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_LEARNING_UI_3KB_STATUS.READY_FOR_3K_C &&
    (
      status === KIDLEARN_V3_LEARNING_UI_3KB_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_LEARNING_UI_3KB_STATUS.SCREEN_BUILT ||
      status === KIDLEARN_V3_LEARNING_UI_3KB_STATUS.SMOKE_TESTED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_LEARNING_UI_3KB_STATUS.READY_FOR_3K_C;
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_UI_3KB_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      errors: result.errors || [],
      warnings: result.warnings || [],
      diagnostics: result.diagnostics || null,
      at: new Date().toISOString()
    })
  );
}


/**
 * Read last result.
 */
function kidlearnV3_3kbReadLastResult_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_LEARNING_UI_3KB_KEYS.LAST_RESULT_JSON
      );

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch (error) {
    return {
      raw: text
    };
  }
}


/**
 * Normalize request.
 */
function kidlearnV3_3kbNormalizeRequest_(
  request
) {
  if (!request) {
    return {};
  }

  if (typeof request !== 'object') {
    return {
      value: request
    };
  }

  return request;
}