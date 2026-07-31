/**
 * ================================================================
 * KIDLEARN V3 - LESSON CONTENT RENDERER
 * Bundle: 3L-B
 * Step:
 * - 3L-B: Optimized Lesson Content Rendering
 * Version: 3.1.0
 * ================================================================
 *
 * 3L-B:
 * - READ ONLY
 * - Không ghi DB
 * - Không real write
 * - Không rollback
 * - Không migration
 * - Không close phase
 */


var KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3LB_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3LB_LAST_PREVIEW_AT',
  LAST_BUILD_AT: 'KIDLEARN_V3_PHASE_3LB_LAST_BUILD_AT',
  LAST_SMOKE_TEST_AT: 'KIDLEARN_V3_PHASE_3LB_LAST_SMOKE_TEST_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3LB_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3LB_LAST_RESULT_JSON'
};


var KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  CONTENT_BUILT: 'CONTENT_BUILT',
  SMOKE_TESTED: 'SMOKE_TESTED',
  READY_FOR_3L_C: 'READY_FOR_3L_C',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG = {
  VERSION: '3L-B',
  PHASE: '3L-B',
  NEXT_BUNDLE: '3L-C',
  SCREEN_ID: 'LESSON_CONTENT_3LB',
  READ_ONLY: true,
  WRITE_ENABLED: false,
  MAX_ROWS_PER_SHEET: 250,
  CACHE_SECONDS: 120
};


/**
 * Preview 3L-B.
 */
function kidlearnV3_previewLessonContent3LBV3() {
  var errors = [];
  var warnings = [];

  var functionChecks =
    kidlearnV3_3lbCheckFunctions_([
      'kidlearnV3_assertAppShell3LAReadyV3',
      'kidlearnV3_appGetActiveDatabaseV3_',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3',
      'kidlearnV3_uiInclude_'
    ]);

  errors =
    errors.concat(
      functionChecks.errors
    );

  var htmlChecks =
    kidlearnV3_3lbCheckHtmlFiles_([
      'UI_Lesson_Content_3LB_Client_V3',
      'UI_Lesson_Content_3LB'
    ]);

  errors =
    errors.concat(
      htmlChecks.errors
    );

  var phase3LA =
    kidlearnV3_3lbSafeAssert3LAReady_();

  if (!phase3LA.success) {
    errors.push(
      '3L-A chưa READY_FOR_3L_B: ' +
      phase3LA.message
    );
  }

  var safeWrite =
    kidlearnV3_3lbSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      '3L-B yêu cầu Safe Write DRY_RUN/enabled=false. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var dataSummary = null;

  try {
    if (errors.length === 0) {
      dataSummary =
        kidlearnV3_3lbGetLessonDataSummary_();

      if (dataSummary.lessonsCount < 1) {
        warnings.push(
          'MST_Lessons chưa có lesson. 3L-B vẫn pass với empty state.'
        );
      }

      if (dataSummary.lessonBlocksCount < 1) {
        warnings.push(
          'MST_LessonBlocks chưa có block. 3L-B vẫn pass với shell renderer.'
        );
      }

      if (dataSummary.activitiesCount < 1) {
        warnings.push(
          'MST_Activities chưa có activity. 3L-B vẫn pass.'
        );
      }
    }
  } catch (error) {
    errors.push(
      'Không đọc được lesson data summary 3L-B: ' +
      String(error.message || error)
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_LESSON_CONTENT_3LB_V3',
    bundle: '3L-B',
    phase: KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.NEXT_BUNDLE,
    readOnly: true,
    writeEnabled: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3LA: phase3LA,
    safeWriteStatus: safeWrite,
    functionChecks: functionChecks.items,
    htmlChecks: htmlChecks.items,
    dataSummary: dataSummary
  };

  kidlearnV3_3lbSaveResult_(
    result,
    KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.PREVIEWED,
    KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.LAST_PREVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Build lesson content payload.
 */
function kidlearnV3_buildLessonContent3LBV3(request) {
  var req =
    kidlearnV3_3lbNormalizeRequest_(
      request
    );

  var preview =
    kidlearnV3_previewLessonContent3LBV3();

  if (!preview.success) {
    throw new Error(
      'Không thể build Lesson Content 3L-B vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var payload =
    kidlearnV3_buildLessonContentUltraLite3LBV3(
      req
    );

  kidlearnV3_3lbSaveResult_(
    {
      success: true,
      action: 'BUILD_LESSON_CONTENT_3LB_V3',
      bundle: '3L-B',
      phase: KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.PHASE,
      errorCount: 0,
      warningCount: payload.warningCount || 0,
      warnings: payload.warnings || [],
      diagnostics: payload.diagnostics || {}
    },
    KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.CONTENT_BUILT,
    KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.LAST_BUILD_AT
  );

  console.log(
    JSON.stringify(payload, null, 2)
  );

  return payload;
}


/**
 * Build lesson content Ultra Lite.
 *
 * Không gọi preview để tránh lặp nặng.
 */
function kidlearnV3_buildLessonContentUltraLite3LBV3(request) {
  var req =
    kidlearnV3_3lbNormalizeRequest_(
      request
    );

  var errors = [];
  var warnings = [];

  var data =
    kidlearnV3_3lbReadLessonDataCached_();

  var lesson =
    kidlearnV3_3lbResolveLesson_(
      req,
      data.lessons
    );

  var lessonId =
    String(
      req.lessonId ||
      lesson.lessonId ||
      ''
    ).trim();

  var blocks =
    kidlearnV3_3lbBuildRenderableBlocks_(
      lessonId,
      data.lessonBlocks,
      data.activities,
      data.mediaAssets
    );

  if (!lessonId) {
    warnings.push(
      'Không có lessonId. Lesson Content hiển thị empty state.'
    );
  }

  if (lessonId && blocks.length < 1) {
    warnings.push(
      'Lesson đang chọn chưa có block. Renderer hiển thị empty state.'
    );
  }

  var payload = {
    success: errors.length === 0,
    action: 'BUILD_LESSON_CONTENT_ULTRA_LITE_3LB_V3',
    bundle: '3L-B',
    phase: KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.PHASE,
    screenId:
      KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.SCREEN_ID,
    generatedAt:
      new Date().toISOString(),
    readOnly: true,
    writeEnabled: false,
    lesson: {
      lessonId: lessonId,
      lessonTitle:
        lesson.lessonTitle ||
        lesson.title ||
        'Bài học',
      subjectId:
        lesson.subjectId || '',
      topicId:
        lesson.topicId || '',
      lessonType:
        lesson.lessonType || '',
      estimatedMinutes:
        Number(lesson.estimatedMinutes || 0),
      raw:
        lesson
    },
    renderer: {
      version: '3L-B',
      mode: 'READ_ONLY_RENDER',
      lazyLoadEnabled: true,
      supportedBlockTypes:
        kidlearnV3_3lbSupportedBlockTypes_()
    },
    blocks: blocks,
    emptyState: {
      noLesson:
        !lessonId,
      noBlocks:
        lessonId && blocks.length < 1,
      message:
        !lessonId
          ? 'Chưa có bài học để hiển thị.'
          : blocks.length < 1
            ? 'Bài học chưa có nội dung.'
            : ''
    },
    guards: {
      readOnly: true,
      writeEnabled: false,
      realWriteAllowed: false,
      safeWriteExpectedMode: 'DRY_RUN',
      prodTouched: false
    },
    diagnostics: {
      lessonsCount: data.lessons.length,
      lessonBlocksCount: data.lessonBlocks.length,
      activitiesCount: data.activities.length,
      mediaAssetsCount: data.mediaAssets.length,
      selectedLessonId: lessonId,
      renderableBlockCount: blocks.length
    },
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  console.log(
    JSON.stringify(payload, null, 2)
  );

  return payload;
}


/**
 * Open Lesson Content UI 3L-B.
 */
function kidlearnV3_showLessonContent3LBV3() {
  var preview =
    kidlearnV3_previewLessonContent3LBV3();

  if (!preview.success) {
    throw new Error(
      'Lesson Content 3L-B chưa sẵn sàng. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var html =
    HtmlService
      .createTemplateFromFile(
        'UI_Lesson_Content_3LB'
      )
      .evaluate()
      .setTitle(
        'KIDLEARN V3 - Lesson Content 3L-B'
      )
      .setWidth(1220)
      .setHeight(860);

  SpreadsheetApp
    .getUi()
    .showModalDialog(
      html,
      'KIDLEARN V3 - Lesson Content 3L-B'
    );
}


/**
 * UI get lesson content.
 */
function kidlearnV3_uiLessonContent3LBGetPayloadV3(request) {
  return kidlearnV3_buildLessonContentUltraLite3LBV3(
    request || {}
  );
}


/**
 * Smoke test 3L-B Ultra Lite.
 */
function kidlearnV3_smokeTestLessonContent3LBUltraLiteV3() {
  var errors = [];
  var warnings = [];

  var phase3LA =
    kidlearnV3_3lbSafeAssert3LAReady_();

  if (!phase3LA.success) {
    errors.push(
      '3L-A chưa READY_FOR_3L_B: ' +
      phase3LA.message
    );
  }

  var safeWrite =
    kidlearnV3_3lbSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      '3L-B yêu cầu Safe Write DRY_RUN/enabled=false.'
    );
  }

  var payload = null;

  try {
    payload =
      kidlearnV3_buildLessonContentUltraLite3LBV3({});

    if (!payload.success) {
      errors.push(
        'Build lesson content Ultra Lite trả success=false.'
      );
    }

    if (payload.readOnly !== true) {
      errors.push(
        'Lesson Content 3L-B phải readOnly=true.'
      );
    }

    if (payload.writeEnabled !== false) {
      errors.push(
        'Lesson Content 3L-B phải writeEnabled=false.'
      );
    }

    if (!payload.renderer) {
      errors.push(
        'Thiếu renderer config.'
      );
    }

    if (!payload.blocks) {
      errors.push(
        'Thiếu blocks array.'
      );
    }

    if (payload.warningCount > 0) {
      warnings =
        warnings.concat(
          payload.warnings || []
        );
    }

  } catch (error) {
    errors.push(
      'Không build được Lesson Content Ultra Lite: ' +
      String(error.message || error)
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_LESSON_CONTENT_3LB_ULTRA_LITE_V3',
    bundle: '3L-B',
    phase: KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.NEXT_BUNDLE,
    readOnly: true,
    writeEnabled: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    diagnostics:
      payload
        ? payload.diagnostics
        : {}
  };

  kidlearnV3_3lbSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.SMOKE_TESTED
      : KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.FAILED,
    KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.LAST_SMOKE_TEST_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3L-B Ultra Lite smoke failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 3L-B ready.
 */
function kidlearnV3_markLessonContent3LBReadyV3() {
  var smoke =
    kidlearnV3_smokeTestLessonContent3LBUltraLiteV3();

  if (!smoke.success) {
    throw new Error(
      'Không thể mark 3L-B ready vì smoke chưa pass.'
    );
  }

  var result = {
    success: true,
    action: 'MARK_LESSON_CONTENT_3LB_READY_V3',
    bundle: '3L-B',
    phase: KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.PHASE,
    status:
      KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.READY_FOR_3L_C,
    nextBundle:
      KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.NEXT_BUNDLE,
    message:
      '3L-B ready. Có thể chuyển sang 3L-C để gắn learning interaction DRY_RUN UI.'
  };

  kidlearnV3_3lbSaveResult_(
    result,
    KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.READY_FOR_3L_C,
    KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Get 3L-B status.
 */
function kidlearnV3_getLessonContent3LBStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_LESSON_CONTENT_3LB_STATUS_V3',
    bundle: '3L-B',
    phase: KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.STATUS
      ) ||
      KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastBuildAt:
      properties.getProperty(
        KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.LAST_BUILD_AT
      ) ||
      '',
    lastSmokeTestAt:
      properties.getProperty(
        KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.LAST_SMOKE_TEST_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3lbReadLastResult_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3L-B ready.
 */
function kidlearnV3_assertLessonContent3LBReadyV3() {
  var status =
    kidlearnV3_getLessonContent3LBStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.READY_FOR_3L_C
  ) {
    errors.push(
      '3L-B chưa READY_FOR_3L_C. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_LESSON_CONTENT_3LB_READY_V3',
    bundle: '3L-B',
    phase: KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.NEXT_BUNDLE,
    errorCount: errors.length,
    errors: errors
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3L-B chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3L-B.
 */
function kidlearnV3_getQaBatchSteps3LBV3() {
  return [
    {
      label: 'Assert 3L-A ready',
      functionName: 'kidlearnV3_assertAppShell3LAReadyV3'
    },
    {
      label: 'Preview Lesson Content 3L-B',
      functionName: 'kidlearnV3_previewLessonContent3LBV3'
    },
    {
      label: 'Build Lesson Content Ultra Lite 3L-B',
      functionName: 'kidlearnV3_buildLessonContentUltraLite3LBV3'
    },
    {
      label: 'Smoke Test Lesson Content 3L-B Ultra Lite',
      functionName: 'kidlearnV3_smokeTestLessonContent3LBUltraLiteV3'
    },
    {
      label: 'Mark Lesson Content 3L-B Ready',
      functionName: 'kidlearnV3_markLessonContent3LBReadyV3'
    },
    {
      label: 'Assert Lesson Content 3L-B Ready',
      functionName: 'kidlearnV3_assertLessonContent3LBReadyV3'
    }
  ];
}


/**
 * QA batch 3L-B.
 */
function kidlearnV3_runQaBatch3LBV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3L_B_ULTRA_LITE',
    kidlearnV3_getQaBatchSteps3LBV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Build renderable blocks.
 */
function kidlearnV3_3lbBuildRenderableBlocks_(
  lessonId,
  lessonBlocks,
  activities,
  mediaAssets
) {
  var blocks = [];

  if (!lessonId) {
    return blocks;
  }

  var activityMap =
    kidlearnV3_3lbMapActivitiesByBlock_(
      activities,
      lessonId
    );

  var mediaMap =
    kidlearnV3_3lbMapByKey_(
      mediaAssets,
      'mediaAssetId'
    );

  for (var i = 0; i < lessonBlocks.length; i++) {
    var row =
      lessonBlocks[i];

    if (
      row.lessonId &&
      String(row.lessonId) !== String(lessonId)
    ) {
      continue;
    }

    var blockId =
      row.lessonBlockId ||
      row.blockId ||
      'BLOCK_' + lessonId + '_' + (i + 1);

    var blockType =
      String(
        row.blockType ||
        row.type ||
        'TEXT'
      ).trim().toUpperCase();

    var mediaAssetId =
      row.mediaAssetId || '';

    var media =
      mediaAssetId && mediaMap[mediaAssetId]
        ? mediaMap[mediaAssetId]
        : null;

    blocks.push({
      blockId: blockId,
      lessonId: lessonId,
      blockType: blockType,
      displayOrder:
        Number(row.displayOrder || row.order || i + 1),
      title:
        row.title ||
        row.blockTitle ||
        kidlearnV3_3lbDefaultBlockTitle_(blockType),
      body:
        row.contentText ||
        row.blockContent ||
        row.bodyText ||
        row.instruction ||
        '',
      mediaAssetId: mediaAssetId,
      media: media,
      activities:
        activityMap[blockId] || [],
      renderModel:
        kidlearnV3_3lbBuildRenderModel_(
          blockType,
          row,
          media,
          activityMap[blockId] || []
        ),
      raw:
        row
    });
  }

  blocks.sort(
    function(a, b) {
      return a.displayOrder - b.displayOrder;
    }
  );

  return blocks;
}


/**
 * Build render model.
 */
function kidlearnV3_3lbBuildRenderModel_(
  blockType,
  row,
  media,
  activities
) {
  var type =
    String(blockType || 'TEXT').toUpperCase();

  var base = {
    type: type,
    layout:
      kidlearnV3_3lbLayoutForBlockType_(type),
    title:
      row.title ||
      row.blockTitle ||
      kidlearnV3_3lbDefaultBlockTitle_(type),
    body:
      row.contentText ||
      row.blockContent ||
      row.bodyText ||
      row.instruction ||
      '',
    hasMedia:
      media ? true : false,
    mediaUrl:
      media
        ? String(media.url || media.mediaUrl || '')
        : '',
    activityCount:
      activities.length,
    readOnly: true
  };

  if (type === 'QUESTION' || type === 'PRACTICE') {
    base.interactionMode =
      'READ_ONLY_PREVIEW';

    base.note =
      'Interaction sẽ được nối ở 3L-C bằng DRY_RUN UI.';
  }

  if (type === 'VOCABULARY') {
    base.layout =
      'VOCAB_CARD';
  }

  if (type === 'SUMMARY') {
    base.layout =
      'SUMMARY_BOX';
  }

  return base;
}


/**
 * Supported block types.
 */
function kidlearnV3_3lbSupportedBlockTypes_() {
  return [
    'TEXT',
    'VOCABULARY',
    'EXAMPLE',
    'PRACTICE',
    'QUESTION',
    'MEDIA',
    'SUMMARY'
  ];
}


/**
 * Layout for block type.
 */
function kidlearnV3_3lbLayoutForBlockType_(type) {
  var map = {
    TEXT: 'TEXT_BLOCK',
    VOCABULARY: 'VOCAB_CARD',
    EXAMPLE: 'EXAMPLE_BOX',
    PRACTICE: 'PRACTICE_PREVIEW',
    QUESTION: 'QUESTION_PREVIEW',
    MEDIA: 'MEDIA_BLOCK',
    SUMMARY: 'SUMMARY_BOX'
  };

  return map[type] || 'TEXT_BLOCK';
}


/**
 * Default block title.
 */
function kidlearnV3_3lbDefaultBlockTitle_(type) {
  var map = {
    TEXT: 'Nội dung',
    VOCABULARY: 'Từ vựng',
    EXAMPLE: 'Ví dụ',
    PRACTICE: 'Luyện tập',
    QUESTION: 'Câu hỏi',
    MEDIA: 'Hình ảnh / Video',
    SUMMARY: 'Ghi nhớ'
  };

  return map[type] || 'Nội dung';
}


/**
 * Resolve lesson.
 */
function kidlearnV3_3lbResolveLesson_(
  request,
  lessons
) {
  var lessonId =
    String(request.lessonId || '').trim();

  for (var i = 0; i < lessons.length; i++) {
    if (
      lessonId &&
      String(lessons[i].lessonId || '') === lessonId
    ) {
      return lessons[i];
    }
  }

  return lessons[0] || {
    lessonId: '',
    lessonTitle: '',
    subjectId: '',
    topicId: ''
  };
}


/**
 * Read lesson data with short cache.
 */
function kidlearnV3_3lbReadLessonDataCached_() {
  var cacheKey =
    'KIDLEARN_V3_3LB_LESSON_DATA_CACHE';

  var cache =
    CacheService.getScriptCache();

  try {
    var cached =
      cache.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }
  } catch (error) {
    // ignore cache read error
  }

  var spreadsheet =
    kidlearnV3_3lbGetDatabaseSpreadsheet_();

  var data = {
    lessons:
      kidlearnV3_3lbReadRowsLimited_(
        spreadsheet,
        'MST_Lessons',
        KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.MAX_ROWS_PER_SHEET
      ),
    lessonBlocks:
      kidlearnV3_3lbReadRowsLimited_(
        spreadsheet,
        'MST_LessonBlocks',
        KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.MAX_ROWS_PER_SHEET
      ),
    activities:
      kidlearnV3_3lbReadRowsLimited_(
        spreadsheet,
        'MST_Activities',
        KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.MAX_ROWS_PER_SHEET
      ),
    mediaAssets:
      kidlearnV3_3lbReadRowsLimited_(
        spreadsheet,
        'MST_MediaAssets',
        KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.MAX_ROWS_PER_SHEET
      )
  };

  try {
    cache.put(
      cacheKey,
      JSON.stringify(data),
      KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.CACHE_SECONDS
    );
  } catch (cacheError) {
    // ignore cache write error
  }

  return data;
}


/**
 * Get lesson data summary.
 */
function kidlearnV3_3lbGetLessonDataSummary_() {
  var data =
    kidlearnV3_3lbReadLessonDataCached_();

  return {
    lessonsCount: data.lessons.length,
    lessonBlocksCount: data.lessonBlocks.length,
    activitiesCount: data.activities.length,
    mediaAssetsCount: data.mediaAssets.length,
    maxRowsPerSheet:
      KIDLEARN_V3_LESSON_CONTENT_3LB_CONFIG.MAX_ROWS_PER_SHEET
  };
}


/**
 * Read rows limited using row 2 as keys.
 */
function kidlearnV3_3lbReadRowsLimited_(
  spreadsheet,
  sheetName,
  maxRows
) {
  var sheet =
    kidlearnV3_3lbGetSheet_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return [];
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (
    lastRow < 3 ||
    lastColumn < 1
  ) {
    return [];
  }

  var limit =
    Math.min(
      Number(maxRows || 100),
      lastRow - 2
    );

  var keys =
    sheet
      .getRange(
        2,
        1,
        1,
        lastColumn
      )
      .getDisplayValues()[0];

  var values =
    sheet
      .getRange(
        3,
        1,
        limit,
        lastColumn
      )
      .getDisplayValues();

  var rows = [];

  for (var r = 0; r < values.length; r++) {
    var row = {};
    var hasValue = false;

    for (var c = 0; c < keys.length; c++) {
      var key =
        String(keys[c] || '').trim();

      if (!key) {
        continue;
      }

      row[key] =
        values[r][c];

      if (values[r][c] !== '') {
        hasValue = true;
      }
    }

    if (hasValue) {
      rows.push(row);
    }
  }

  return rows;
}


/**
 * Map activities by block.
 */
function kidlearnV3_3lbMapActivitiesByBlock_(
  activities,
  lessonId
) {
  var map = {};

  for (var i = 0; i < activities.length; i++) {
    var row =
      activities[i];

    if (
      row.lessonId &&
      String(row.lessonId) !== String(lessonId)
    ) {
      continue;
    }

    var blockId =
      row.lessonBlockId ||
      row.blockId ||
      '_NO_BLOCK';

    if (!map[blockId]) {
      map[blockId] = [];
    }

    map[blockId].push({
      activityId:
        row.activityId ||
        'ACT_' + lessonId + '_' + (i + 1),
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
      displayOrder:
        Number(row.displayOrder || row.order || i + 1),
      readOnly: true,
      raw:
        row
    });
  }

  Object.keys(map).forEach(
    function(key) {
      map[key].sort(
        function(a, b) {
          return a.displayOrder - b.displayOrder;
        }
      );
    }
  );

  return map;
}


/**
 * Map rows by key.
 */
function kidlearnV3_3lbMapByKey_(
  rows,
  key
) {
  var map = {};

  for (var i = 0; i < rows.length; i++) {
    var value =
      String(rows[i][key] || '').trim();

    if (value) {
      map[value] =
        rows[i];
    }
  }

  return map;
}


/**
 * Database spreadsheet.
 */
function kidlearnV3_3lbGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3lbResolveSpreadsheet_(
      database
    );

  if (!spreadsheet) {
    throw new Error(
      'Không resolve được Spreadsheet object từ Database V3.'
    );
  }

  return spreadsheet;
}


/**
 * Resolve Spreadsheet.
 */
function kidlearnV3_3lbResolveSpreadsheet_(value) {
  if (!value) {
    return null;
  }

  if (
    typeof value.getSheets === 'function' &&
    typeof value.getId === 'function'
  ) {
    return value;
  }

  if (
    value.spreadsheet &&
    typeof value.spreadsheet.getSheets === 'function'
  ) {
    return value.spreadsheet;
  }

  if (
    value.database &&
    typeof value.database.getSheets === 'function'
  ) {
    return value.database;
  }

  if (
    value.db &&
    typeof value.db.getSheets === 'function'
  ) {
    return value.db;
  }

  if (
    value.spreadsheetObject &&
    typeof value.spreadsheetObject.getSheets === 'function'
  ) {
    return value.spreadsheetObject;
  }

  if (
    value.activeSpreadsheet &&
    typeof value.activeSpreadsheet.getSheets === 'function'
  ) {
    return value.activeSpreadsheet;
  }

  if (value.spreadsheetId) {
    return SpreadsheetApp.openById(
      value.spreadsheetId
    );
  }

  if (value.databaseSpreadsheetId) {
    return SpreadsheetApp.openById(
      value.databaseSpreadsheetId
    );
  }

  if (
    value.id &&
    typeof value.id === 'string'
  ) {
    return SpreadsheetApp.openById(
      value.id
    );
  }

  return null;
}


/**
 * Get exact sheet.
 */
function kidlearnV3_3lbGetSheet_(
  spreadsheet,
  sheetName
) {
  if (
    typeof kidlearnV3_appGetSheetByExactName_ === 'function'
  ) {
    return kidlearnV3_appGetSheetByExactName_(
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


/**
 * Check functions.
 */
function kidlearnV3_3lbCheckFunctions_(names) {
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
function kidlearnV3_3lbCheckHtmlFiles_(filenames) {
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
 * Safe assert 3L-A ready.
 */
function kidlearnV3_3lbSafeAssert3LAReady_() {
  try {
    var result =
      kidlearnV3_assertAppShell3LAReadyV3();

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
function kidlearnV3_3lbSafeWriteStatus_() {
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
 */
function kidlearnV3_3lbSaveResult_(
  result,
  status,
  dateKey
) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.READY_FOR_3L_C &&
    (
      status === KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.CONTENT_BUILT ||
      status === KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.SMOKE_TESTED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_LESSON_CONTENT_3LB_STATUS.READY_FOR_3L_C;
  }

  properties.setProperty(
    KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.LAST_RESULT_JSON,
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
function kidlearnV3_3lbReadLastResult_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_LESSON_CONTENT_3LB_KEYS.LAST_RESULT_JSON
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
function kidlearnV3_3lbNormalizeRequest_(request) {
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