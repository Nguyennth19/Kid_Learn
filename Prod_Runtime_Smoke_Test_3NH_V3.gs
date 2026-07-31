/**
 * ================================================================
 * KIDLEARN V3 - PROD RUNTIME SMOKE TEST
 * Bundle: 3N-H
 * Version: 3.1.0
 * ================================================================
 *
 * 3N-H:
 * - Runtime smoke test trên PROD file đã tạo ở 3N-F.
 * - Chỉ đọc PROD file.
 * - Không ghi vào PROD file.
 * - Không migration.
 * - Không rollback.
 * - Không real write.
 * - Không create/delete sheet.
 * - Chỉ ghi ScriptProperties trong DEV script để lưu smoke/status.
 */


var KIDLEARN_V3_PROD_SMOKE_3NH_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3NH_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3NH_LAST_PREVIEW_AT',
  LAST_SMOKE_AT: 'KIDLEARN_V3_PHASE_3NH_LAST_SMOKE_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3NH_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3NH_LAST_RESULT_JSON',
  LAST_SMOKE_JSON: 'KIDLEARN_V3_PHASE_3NH_LAST_SMOKE_JSON'
};


var KIDLEARN_V3_PROD_SMOKE_3NH_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  SMOKE_PASSED: 'SMOKE_PASSED',
  READY_FOR_3N_I: 'READY_FOR_3N_I',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG = {
  VERSION: '3N-H',
  PHASE: '3N-H',
  NEXT_BUNDLE: '3N-I',
  NEXT_STAGE: 'PROD_RELEASE_HANDOVER_PACKAGE',
  WRITE_MODE: 'PROD_RUNTIME_READ_ONLY_SMOKE',
  REAL_WRITE_ALLOWED: false,
  PROD_WRITE_ALLOWED: false,
  MAX_READ_ROWS: 50,
  SAMPLE_RECORD_LIMIT: 5,
  TARGET_NO_WRITE_SHEETS: [
    'LOG_Audit',
    'DATA_StudySessions',
    'DATA_LessonProgress',
    'DATA_DailyGoals',
    'DATA_Assignments',
    'DATA_Responses'
  ]
};


/**
 * Preview 3N-H.
 */
function kidlearnV3_previewProdRuntimeSmokeTest3NHV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions =
    kidlearnV3_3nhCheckFunctions_([
      'kidlearnV3_assertProdPostDeployValidation3NGReadyV3',
      'kidlearnV3_getProdPostDeployValidation3NGStatusV3',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors = errors.concat(requiredFunctions.errors);

  var phase3NG =
    kidlearnV3_3nhSafeAssert_(
      'kidlearnV3_assertProdPostDeployValidation3NGReadyV3',
      '3N-G'
    );

  if (!phase3NG.success) {
    errors.push(
      '3N-G chưa READY_FOR_3N_H: ' +
      phase3NG.message
    );
  }

  var prodInfo =
    kidlearnV3_3nhGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId từ 3N-F.');
  }

  var prodFileCheck =
    kidlearnV3_3nhCheckProdFileAccessible_(
      prodInfo.prodFileId
    );

  if (!prodFileCheck.success) {
    errors.push(
      'PROD file chưa accessible: ' +
      prodFileCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3nhCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_PROD_RUNTIME_SMOKE_TEST_3NH_V3',
    bundle: '3N-H',
    phase: KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.NEXT_BUNDLE,
    nextStage: KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.NEXT_STAGE,
    writeMode: KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.WRITE_MODE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3NG: phase3NG,
    prodInfo: prodInfo,
    prodFileCheck: prodFileCheck,
    safeModes: safeModes,
    requiredFunctions: requiredFunctions.items,
    note:
      '3N-H chỉ smoke test runtime read-only trên PROD file. Không ghi vào PROD.'
  };

  kidlearnV3_3nhSaveResult_(
    result,
    KIDLEARN_V3_PROD_SMOKE_3NH_STATUS.PREVIEWED,
    KIDLEARN_V3_PROD_SMOKE_3NH_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Run PROD runtime smoke test.
 */
function kidlearnV3_runProdRuntimeSmokeTest3NHV3() {
  var startedAt = new Date();
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewProdRuntimeSmokeTest3NHV3();

  if (!preview.success) {
    throw new Error(
      'Không thể chạy PROD runtime smoke test 3N-H vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var prodInfo =
    kidlearnV3_3nhGetProdInfo_();

  var prodSpreadsheet =
    SpreadsheetApp.openById(
      prodInfo.prodFileId
    );

  var beforeSnapshot =
    kidlearnV3_3nhSnapshotRowCounts_(
      prodSpreadsheet,
      KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.TARGET_NO_WRITE_SHEETS
    );

  var runtimeConnection =
    kidlearnV3_3nhSmokeRuntimeConnection_(
      prodSpreadsheet
    );

  errors = errors.concat(runtimeConnection.errors);
  warnings = warnings.concat(runtimeConnection.warnings);

  var bootstrapSmoke =
    kidlearnV3_3nhSmokeBootstrapData_(
      prodSpreadsheet
    );

  errors = errors.concat(bootstrapSmoke.errors);
  warnings = warnings.concat(bootstrapSmoke.warnings);

  var roleSmoke =
    kidlearnV3_3nhSmokeRoleGuard_();

  errors = errors.concat(roleSmoke.errors);
  warnings = warnings.concat(roleSmoke.warnings);

  var learningSmoke =
    kidlearnV3_3nhSmokeLearningPayload_(
      prodSpreadsheet
    );

  errors = errors.concat(learningSmoke.errors);
  warnings = warnings.concat(learningSmoke.warnings);

  var lessonContentSmoke =
    kidlearnV3_3nhSmokeLessonContentPayload_(
      prodSpreadsheet
    );

  errors = errors.concat(lessonContentSmoke.errors);
  warnings = warnings.concat(lessonContentSmoke.warnings);

  SpreadsheetApp.flush();

  var afterSnapshot =
    kidlearnV3_3nhSnapshotRowCounts_(
      prodSpreadsheet,
      KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.TARGET_NO_WRITE_SHEETS
    );

  var noWriteCheck =
    kidlearnV3_3nhCompareRowCountSnapshots_(
      beforeSnapshot,
      afterSnapshot
    );

  errors = errors.concat(noWriteCheck.errors);
  warnings = warnings.concat(noWriteCheck.warnings);

  var safeModes =
    kidlearnV3_3nhCheckSafeModes_();

  errors = errors.concat(safeModes.errors);
  warnings = warnings.concat(safeModes.warnings);

  var finishedAt = new Date();

  var smoke = {
    success: errors.length === 0,
    action: 'RUN_PROD_RUNTIME_SMOKE_TEST_3NH_V3',
    bundle: '3N-H',
    phase: KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PROD_SMOKE_3NH_STATUS.SMOKE_PASSED
        : KIDLEARN_V3_PROD_SMOKE_3NH_STATUS.FAILED,
    nextBundle:
      KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.NEXT_STAGE,
    prodFileId: prodInfo.prodFileId,
    prodFileUrl: prodInfo.prodFileUrl,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    prodDeployNow: false,
    smokeTests: {
      runtimeConnection: runtimeConnection.summary,
      bootstrapSmoke: bootstrapSmoke.summary,
      roleSmoke: roleSmoke.summary,
      learningSmoke: learningSmoke.summary,
      lessonContentSmoke: lessonContentSmoke.summary,
      noWriteCheck: noWriteCheck.summary,
      safeModes: safeModes.summary
    },
    noSideEffect: {
      prodDataWrittenBy3NH: false,
      prodSheetCreatedBy3NH: false,
      prodSheetDeletedBy3NH: false,
      prodRuntimeMode: 'READ_ONLY'
    },
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_3nhSaveSmoke_(
    smoke
  );

  kidlearnV3_3nhSaveResult_(
    smoke,
    smoke.success
      ? KIDLEARN_V3_PROD_SMOKE_3NH_STATUS.SMOKE_PASSED
      : KIDLEARN_V3_PROD_SMOKE_3NH_STATUS.FAILED,
    KIDLEARN_V3_PROD_SMOKE_3NH_KEYS.LAST_SMOKE_AT
  );

  console.log(JSON.stringify(smoke, null, 2));

  if (!smoke.success) {
    throw new Error(
      '3N-H PROD runtime smoke test failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return smoke;
}


/**
 * Mark 3N-H ready.
 */
function kidlearnV3_markProdRuntimeSmokeTest3NHReadyV3() {
  var status =
    kidlearnV3_getProdRuntimeSmokeTest3NHStatusV3();

  var errors = [];

  if (
    status.status !== KIDLEARN_V3_PROD_SMOKE_3NH_STATUS.SMOKE_PASSED &&
    status.status !== KIDLEARN_V3_PROD_SMOKE_3NH_STATUS.READY_FOR_3N_I
  ) {
    errors.push(
      '3N-H chưa SMOKE_PASSED. Status=' +
      status.status
    );
  }

  if (
    !status.lastSmoke ||
    status.lastSmoke.success !== true
  ) {
    errors.push(
      'Last smoke chưa success=true.'
    );
  }

  var prodInfo =
    kidlearnV3_3nhGetProdInfo_();

  var prodFileCheck =
    kidlearnV3_3nhCheckProdFileAccessible_(
      prodInfo.prodFileId
    );

  if (!prodFileCheck.success) {
    errors.push(
      'PROD file không còn accessible: ' +
      prodFileCheck.message
    );
  }

  var safeModes =
    kidlearnV3_3nhCheckSafeModes_();

  errors = errors.concat(safeModes.errors);

  if (errors.length > 0) {
    throw new Error(
      'Không thể mark 3N-H ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_PROD_RUNTIME_SMOKE_TEST_3NH_READY_V3',
    bundle: '3N-H',
    phase: KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.PHASE,
    status:
      KIDLEARN_V3_PROD_SMOKE_3NH_STATUS.READY_FOR_3N_I,
    prodFileId: prodInfo.prodFileId,
    prodFileUrl: prodInfo.prodFileUrl,
    nextBundle:
      KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.NEXT_STAGE,
    message:
      '3N-H ready. PROD runtime smoke test đã pass. Bước tiếp theo là 3N-I release handover package.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3nhSaveResult_(
    result,
    KIDLEARN_V3_PROD_SMOKE_3NH_STATUS.READY_FOR_3N_I,
    KIDLEARN_V3_PROD_SMOKE_3NH_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Get 3N-H status.
 */
function kidlearnV3_getProdRuntimeSmokeTest3NHStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PROD_RUNTIME_SMOKE_TEST_3NH_STATUS_V3',
    bundle: '3N-H',
    phase: KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PROD_SMOKE_3NH_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PROD_SMOKE_3NH_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_SMOKE_3NH_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastSmokeAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_SMOKE_3NH_KEYS.LAST_SMOKE_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PROD_SMOKE_3NH_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3nhReadJsonProperty_(
        KIDLEARN_V3_PROD_SMOKE_3NH_KEYS.LAST_RESULT_JSON
      ),
    lastSmoke:
      kidlearnV3_3nhReadJsonProperty_(
        KIDLEARN_V3_PROD_SMOKE_3NH_KEYS.LAST_SMOKE_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Assert 3N-H ready.
 */
function kidlearnV3_assertProdRuntimeSmokeTest3NHReadyV3() {
  var status =
    kidlearnV3_getProdRuntimeSmokeTest3NHStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PROD_SMOKE_3NH_STATUS.READY_FOR_3N_I
  ) {
    errors.push(
      '3N-H chưa READY_FOR_3N_I. Status=' +
      status.status
    );
  }

  var prodInfo =
    kidlearnV3_3nhGetProdInfo_();

  if (!prodInfo.prodFileId) {
    errors.push('Thiếu prodFileId.');
  }

  if (!prodInfo.prodFileUrl) {
    errors.push('Thiếu prodFileUrl.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PROD_RUNTIME_SMOKE_TEST_3NH_READY_V3',
    bundle: '3N-H',
    phase: KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.PHASE,
    status: status.status,
    prodFileId: prodInfo.prodFileId || '',
    prodFileUrl: prodInfo.prodFileUrl || '',
    nextBundle:
      KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.NEXT_BUNDLE,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '3N-H chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3N-H.
 */
function kidlearnV3_getQaBatchSteps3NHV3() {
  return [
    {
      label: 'Assert 3N-G ready',
      functionName: 'kidlearnV3_assertProdPostDeployValidation3NGReadyV3'
    },
    {
      label: 'Preview PROD Runtime Smoke 3N-H',
      functionName: 'kidlearnV3_previewProdRuntimeSmokeTest3NHV3'
    },
    {
      label: 'Run PROD Runtime Smoke 3N-H',
      functionName: 'kidlearnV3_runProdRuntimeSmokeTest3NHV3'
    },
    {
      label: 'Mark PROD Runtime Smoke 3N-H Ready',
      functionName: 'kidlearnV3_markProdRuntimeSmokeTest3NHReadyV3'
    },
    {
      label: 'Assert PROD Runtime Smoke 3N-H Ready',
      functionName: 'kidlearnV3_assertProdRuntimeSmokeTest3NHReadyV3'
    }
  ];
}


/**
 * QA batch 3N-H.
 */
function kidlearnV3_runQaBatch3NHV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3N_H_PROD_RUNTIME_SMOKE_TEST',
    kidlearnV3_getQaBatchSteps3NHV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Smoke runtime connection.
 */
function kidlearnV3_3nhSmokeRuntimeConnection_(spreadsheet) {
  var errors = [];
  var warnings = [];

  var requiredSheets = [
    'SYS_Config',
    'DATA_Users',
    'DATA_Children',
    'DATA_UserChildAccess',
    'MST_Subjects',
    'MST_Lessons',
    'MST_LessonBlocks',
    'MST_Activities'
  ];

  var items = [];

  for (var i = 0; i < requiredSheets.length; i++) {
    var sheet =
      kidlearnV3_3nhGetSheet_(
        spreadsheet,
        requiredSheets[i]
      );

    var exists =
      sheet ? true : false;

    items.push({
      sheetName: requiredSheets[i],
      exists: exists,
      lastRow: sheet ? sheet.getLastRow() : 0,
      lastColumn: sheet ? sheet.getLastColumn() : 0
    });

    if (!exists) {
      errors.push(
        'Runtime connection thiếu sheet: ' +
        requiredSheets[i]
      );
    }
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    items: items,
    summary: {
      checkedSheetCount: requiredSheets.length,
      foundSheetCount:
        items.filter(function(item) {
          return item.exists;
        }).length,
      missingSheetCount:
        items.filter(function(item) {
          return !item.exists;
        }).length
    }
  };
}


/**
 * Smoke bootstrap data.
 */
function kidlearnV3_3nhSmokeBootstrapData_(spreadsheet) {
  var errors = [];
  var warnings = [];

  var config =
    kidlearnV3_3nhReadSheetObjects_(
      spreadsheet,
      'SYS_Config',
      KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.MAX_READ_ROWS
    );

  var subjects =
    kidlearnV3_3nhReadSheetObjects_(
      spreadsheet,
      'MST_Subjects',
      KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.MAX_READ_ROWS
    );

  var users =
    kidlearnV3_3nhReadSheetObjects_(
      spreadsheet,
      'DATA_Users',
      KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.MAX_READ_ROWS
    );

  var children =
    kidlearnV3_3nhReadSheetObjects_(
      spreadsheet,
      'DATA_Children',
      KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.MAX_READ_ROWS
    );

  var access =
    kidlearnV3_3nhReadSheetObjects_(
      spreadsheet,
      'DATA_UserChildAccess',
      KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.MAX_READ_ROWS
    );

  if (!config.success) errors = errors.concat(config.errors);
  if (!subjects.success) errors = errors.concat(subjects.errors);
  if (!users.success) errors = errors.concat(users.errors);
  if (!children.success) errors = errors.concat(children.errors);
  if (!access.success) errors = errors.concat(access.errors);

  if (subjects.records.length < 1) {
    warnings.push(
      'PROD MST_Subjects chưa có data row. Runtime vẫn có thể chạy empty state.'
    );
  }

  if (children.records.length < 1) {
    warnings.push(
      'PROD DATA_Children chưa có child data. Runtime sẽ dùng empty state.'
    );
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    summary: {
      configRowCount: config.records.length,
      subjectRowCount: subjects.records.length,
      userRowCount: users.records.length,
      childRowCount: children.records.length,
      accessRowCount: access.records.length
    }
  };
}


/**
 * Smoke role guard.
 */
function kidlearnV3_3nhSmokeRoleGuard_() {
  var errors = [];
  var warnings = [];
  var tests = [];

  if (typeof kidlearnV3_roleGuard3MCV3 !== 'function') {
    warnings.push(
      'Không tìm thấy kidlearnV3_roleGuard3MCV3. Bỏ qua role guard runtime smoke.'
    );

    return {
      success: true,
      errorCount: 0,
      warningCount: warnings.length,
      errors: [],
      warnings: warnings,
      summary: {
        skipped: true,
        reason: 'Missing kidlearnV3_roleGuard3MCV3'
      }
    };
  }

  var cases = [
    {
      name: 'CHILD view learning',
      request: {
        role: 'CHILD',
        screenId: 'LEARNING_HOME_V3',
        actionCode: 'VIEW_LEARNING'
      },
      expected: true
    },
    {
      name: 'CHILD blocked settings',
      request: {
        role: 'CHILD',
        screenId: 'SETTINGS_HOME',
        actionCode: 'VIEW_SETTINGS'
      },
      expected: false
    },
    {
      name: 'FAMILY_ADMIN view settings',
      request: {
        role: 'FAMILY_ADMIN',
        screenId: 'SETTINGS_HOME',
        actionCode: 'VIEW_SETTINGS'
      },
      expected: true
    }
  ];

  for (var i = 0; i < cases.length; i++) {
    var output =
      kidlearnV3_roleGuard3MCV3(
        cases[i].request
      );

    var passed =
      output.success === cases[i].expected;

    tests.push({
      name: cases[i].name,
      expected: cases[i].expected,
      actual: output.success,
      passed: passed
    });

    if (!passed) {
      errors.push(
        'Role guard smoke failed: ' +
        cases[i].name +
        '. Expected=' +
        cases[i].expected +
        ', Actual=' +
        output.success
      );
    }
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    tests: tests,
    summary: {
      skipped: false,
      testCount: tests.length,
      passedCount:
        tests.filter(function(item) {
          return item.passed;
        }).length,
      failedCount:
        tests.filter(function(item) {
          return !item.passed;
        }).length
    }
  };
}


/**
 * Smoke learning payload from PROD.
 */
function kidlearnV3_3nhSmokeLearningPayload_(spreadsheet) {
  var errors = [];
  var warnings = [];

  var subjects =
    kidlearnV3_3nhReadSheetObjects_(
      spreadsheet,
      'MST_Subjects',
      KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.MAX_READ_ROWS
    );

  var topics =
    kidlearnV3_3nhReadSheetObjects_(
      spreadsheet,
      'MST_Topics',
      KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.MAX_READ_ROWS
    );

  var lessons =
    kidlearnV3_3nhReadSheetObjects_(
      spreadsheet,
      'MST_Lessons',
      KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.MAX_READ_ROWS
    );

  if (!subjects.success) errors = errors.concat(subjects.errors);
  if (!topics.success) errors = errors.concat(topics.errors);
  if (!lessons.success) errors = errors.concat(lessons.errors);

  var payload = {
    role: 'CHILD',
    screenId: 'LEARNING_HOME_V3',
    readOnly: true,
    writeEnabled: false,
    subjectCards:
      subjects.records.slice(0, KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.SAMPLE_RECORD_LIMIT),
    topicCount: topics.records.length,
    lessonCount: lessons.records.length
  };

  if (subjects.records.length < 1) {
    warnings.push(
      'Learning payload không có subject data row. PROD sẽ hiển thị empty state.'
    );
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    payloadSummary: payload,
    summary: {
      subjectCount: subjects.records.length,
      topicCount: topics.records.length,
      lessonCount: lessons.records.length,
      readOnly: true,
      writeEnabled: false
    }
  };
}


/**
 * Smoke lesson content payload from PROD.
 */
function kidlearnV3_3nhSmokeLessonContentPayload_(spreadsheet) {
  var errors = [];
  var warnings = [];

  var lessons =
    kidlearnV3_3nhReadSheetObjects_(
      spreadsheet,
      'MST_Lessons',
      KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.MAX_READ_ROWS
    );

  var blocks =
    kidlearnV3_3nhReadSheetObjects_(
      spreadsheet,
      'MST_LessonBlocks',
      KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.MAX_READ_ROWS
    );

  var activities =
    kidlearnV3_3nhReadSheetObjects_(
      spreadsheet,
      'MST_Activities',
      KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.MAX_READ_ROWS
    );

  var media =
    kidlearnV3_3nhReadSheetObjects_(
      spreadsheet,
      'MST_MediaAssets',
      KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.MAX_READ_ROWS
    );

  if (!lessons.success) errors = errors.concat(lessons.errors);
  if (!blocks.success) errors = errors.concat(blocks.errors);
  if (!activities.success) errors = errors.concat(activities.errors);
  if (!media.success) errors = errors.concat(media.errors);

  var selectedLesson =
    lessons.records.length > 0
      ? lessons.records[0]
      : null;

  var lessonId =
    selectedLesson
      ? String(selectedLesson.lessonId || '').trim()
      : '';

  var lessonBlocks =
    lessonId
      ? blocks.records.filter(function(item) {
          return String(item.lessonId || '').trim() === lessonId;
        })
      : [];

  var blockIds = {};

  for (var i = 0; i < lessonBlocks.length; i++) {
    if (lessonBlocks[i].blockId) {
      blockIds[String(lessonBlocks[i].blockId)] = true;
    }
  }

  var lessonActivities =
    activities.records.filter(function(item) {
      return blockIds[String(item.blockId || '')] === true;
    });

  if (!selectedLesson) {
    warnings.push(
      'Không có lesson data row để smoke lesson content chi tiết. PROD sẽ hiển thị empty lesson state.'
    );
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    summary: {
      hasSelectedLesson: selectedLesson ? true : false,
      selectedLessonId: lessonId,
      totalLessonCount: lessons.records.length,
      selectedLessonBlockCount: lessonBlocks.length,
      selectedLessonActivityCount: lessonActivities.length,
      mediaAssetSampleCount: media.records.length,
      readOnly: true,
      writeEnabled: false
    }
  };
}


/**
 * Read sheet objects from row 2 keys.
 */
function kidlearnV3_3nhReadSheetObjects_(
  spreadsheet,
  sheetName,
  maxRows
) {
  var errors = [];
  var warnings = [];
  var records = [];

  var sheet =
    kidlearnV3_3nhGetSheet_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return {
      success: false,
      sheetName: sheetName,
      errorCount: 1,
      warningCount: 0,
      errors: [
        'Thiếu sheet: ' + sheetName
      ],
      warnings: [],
      records: []
    };
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (lastRow < 2 || lastColumn < 1) {
    warnings.push(
      sheetName +
      ' chưa có đủ header/key rows.'
    );

    return {
      success: true,
      sheetName: sheetName,
      errorCount: 0,
      warningCount: warnings.length,
      errors: [],
      warnings: warnings,
      records: []
    };
  }

  var keys =
    sheet
      .getRange(2, 1, 1, lastColumn)
      .getDisplayValues()[0];

  var dataRowCount =
    Math.max(
      0,
      Math.min(
        lastRow - 2,
        maxRows || KIDLEARN_V3_PROD_SMOKE_3NH_CONFIG.MAX_READ_ROWS
      )
    );

  if (dataRowCount < 1) {
    return {
      success: true,
      sheetName: sheetName,
      errorCount: 0,
      warningCount: warnings.length,
      errors: [],
      warnings: warnings,
      records: []
    };
  }

  var values =
    sheet
      .getRange(3, 1, dataRowCount, lastColumn)
      .getDisplayValues();

  for (var r = 0; r < values.length; r++) {
    var obj = {};
    var hasValue = false;

    for (var c = 0; c < lastColumn; c++) {
      var key =
        String(keys[c] || '').trim();

      if (!key) {
        continue;
      }

      var value =
        values[r][c];

      if (String(value || '').trim()) {
        hasValue = true;
      }

      obj[key] = value;
    }

    if (hasValue) {
      records.push(obj);
    }
  }

  return {
    success: errors.length === 0,
    sheetName: sheetName,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    records: records
  };
}


/**
 * Snapshot row counts.
 */
function kidlearnV3_3nhSnapshotRowCounts_(
  spreadsheet,
  sheetNames
) {
  var items = [];

  for (var i = 0; i < sheetNames.length; i++) {
    var sheetName =
      sheetNames[i];

    var sheet =
      kidlearnV3_3nhGetSheet_(
        spreadsheet,
        sheetName
      );

    items.push({
      sheetName: sheetName,
      exists: sheet ? true : false,
      lastRow: sheet ? sheet.getLastRow() : 0,
      lastColumn: sheet ? sheet.getLastColumn() : 0
    });
  }

  return {
    capturedAt:
      new Date().toISOString(),
    items: items
  };
}


/**
 * Compare row count snapshots.
 */
function kidlearnV3_3nhCompareRowCountSnapshots_(
  beforeSnapshot,
  afterSnapshot
) {
  var errors = [];
  var warnings = [];

  var beforeMap =
    kidlearnV3_3nhMapSnapshots_(
      beforeSnapshot.items || []
    );

  var afterMap =
    kidlearnV3_3nhMapSnapshots_(
      afterSnapshot.items || []
    );

  var compared = [];

  for (var sheetName in beforeMap) {
    if (!beforeMap.hasOwnProperty(sheetName)) {
      continue;
    }

    var before =
      beforeMap[sheetName];

    var after =
      afterMap[sheetName] || {
        exists: false,
        lastRow: 0,
        lastColumn: 0
      };

    var changed =
      before.lastRow !== after.lastRow ||
      before.lastColumn !== after.lastColumn ||
      before.exists !== after.exists;

    compared.push({
      sheetName: sheetName,
      beforeLastRow: before.lastRow,
      afterLastRow: after.lastRow,
      beforeLastColumn: before.lastColumn,
      afterLastColumn: after.lastColumn,
      changed: changed
    });

    if (changed) {
      errors.push(
        'PROD sheet thay đổi trong runtime smoke: ' +
        sheetName +
        '. beforeRow=' +
        before.lastRow +
        ', afterRow=' +
        after.lastRow +
        ', beforeCol=' +
        before.lastColumn +
        ', afterCol=' +
        after.lastColumn
      );
    }
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    compared: compared,
    summary: {
      checkedSheetCount: compared.length,
      changedSheetCount:
        compared.filter(function(item) {
          return item.changed;
        }).length,
      readOnlyConfirmed: errors.length === 0
    }
  };
}


/**
 * Map snapshots.
 */
function kidlearnV3_3nhMapSnapshots_(items) {
  var map = {};

  for (var i = 0; i < items.length; i++) {
    map[items[i].sheetName] = items[i];
  }

  return map;
}


/**
 * PROD info từ 3N-F.
 */
function kidlearnV3_3nhGetProdInfo_() {
  var status =
    kidlearnV3_getControlledProdDeployment3NFStatusV3();

  return {
    status: status.status || '',
    deploymentId: status.deploymentId || '',
    prodFileId: status.prodFileId || '',
    prodFileUrl: status.prodFileUrl || '',
    prodFileName: status.prodFileName || ''
  };
}


/**
 * Check PROD file accessible.
 */
function kidlearnV3_3nhCheckProdFileAccessible_(prodFileId) {
  try {
    if (!prodFileId) {
      return {
        success: false,
        message: 'Thiếu prodFileId.'
      };
    }

    var file =
      DriveApp.getFileById(prodFileId);

    return {
      success: true,
      prodFileId: prodFileId,
      prodFileName: file.getName(),
      prodFileUrl: file.getUrl(),
      message: 'PROD file accessible.'
    };

  } catch (error) {
    return {
      success: false,
      prodFileId: prodFileId || '',
      message:
        String(error.message || error)
    };
  }
}


/**
 * Check safe modes in DEV script.
 */
function kidlearnV3_3nhCheckSafeModes_() {
  var errors = [];
  var warnings = [];

  var safeWrite =
    kidlearnV3_3nhSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Safe Write trong DEV script phải DRY_RUN/enabled=false khi smoke PROD. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var controlledWrite =
    kidlearnV3_3nhControlledWriteStatus_();

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    errors.push(
      'Controlled Write đang ENABLED.'
    );
  }

  if (controlledWrite.available === false) {
    warnings.push(
      'Không tìm thấy Controlled Write status function. Bỏ qua check này trong DEV.'
    );
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    summary: {
      safeWriteMode: safeWrite.mode || '',
      safeWriteEnabled: safeWrite.enabled,
      controlledWriteAvailable: controlledWrite.available,
      controlledWriteStatus: controlledWrite.status || ''
    }
  };
}


/**
 * Expected sheets.
 */
function kidlearnV3_3nhGetExpectedSheets_() {
  try {
    if (
      typeof KIDLEARN_V3_SHEET_ORDER !== 'undefined' &&
      KIDLEARN_V3_SHEET_ORDER &&
      KIDLEARN_V3_SHEET_ORDER.length
    ) {
      return KIDLEARN_V3_SHEET_ORDER.slice();
    }
  } catch (error) {}

  if (
    typeof kidlearnV3_3ngGetExpectedSheets_ === 'function'
  ) {
    return kidlearnV3_3ngGetExpectedSheets_();
  }

  throw new Error(
    'Không tìm thấy KIDLEARN_V3_SHEET_ORDER hoặc helper expected sheets.'
  );
}


/**
 * Get exact sheet.
 */
function kidlearnV3_3nhGetSheet_(spreadsheet, sheetName) {
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
 * Safe assert.
 */
function kidlearnV3_3nhSafeAssert_(functionName, label) {
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
        label: label,
        message:
          'Thiếu function ' +
          functionName
      };
    }

    var fn =
      eval(functionName);

    var output =
      fn();

    return {
      success:
        output &&
        output.success === true,
      label: label,
      message:
        output && output.success === true
          ? ''
          : JSON.stringify(output)
    };

  } catch (error) {
    return {
      success: false,
      label: label,
      message:
        String(error.message || error)
    };
  }
}


/**
 * Safe Write status.
 */
function kidlearnV3_3nhSafeWriteStatus_() {
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
 * Controlled Write status.
 */
function kidlearnV3_3nhControlledWriteStatus_() {
  try {
    if (
      typeof kidlearnV3_getControlledWriteDevStatusV3 === 'function'
    ) {
      var result =
        kidlearnV3_getControlledWriteDevStatusV3();

      result.available = true;

      return result;
    }

    return {
      available: false,
      success: false,
      status: '',
      error:
        'Missing kidlearnV3_getControlledWriteDevStatusV3'
    };

  } catch (error) {
    return {
      available: false,
      success: false,
      status: '',
      error:
        String(error.message || error)
    };
  }
}


/**
 * Check functions.
 */
function kidlearnV3_3nhCheckFunctions_(names) {
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
 * Save smoke.
 */
function kidlearnV3_3nhSaveSmoke_(smoke) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PROD_SMOKE_3NH_KEYS.LAST_SMOKE_JSON,
      JSON.stringify(smoke)
    );
}


/**
 * Save result.
 */
function kidlearnV3_3nhSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PROD_SMOKE_3NH_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_PROD_SMOKE_3NH_STATUS.READY_FOR_3N_I &&
    (
      status === KIDLEARN_V3_PROD_SMOKE_3NH_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PROD_SMOKE_3NH_STATUS.SMOKE_PASSED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PROD_SMOKE_3NH_STATUS.READY_FOR_3N_I;
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_SMOKE_3NH_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PROD_SMOKE_3NH_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      prodDeployNow: false,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      errors: result.errors || [],
      warnings: result.warnings || [],
      at: new Date().toISOString()
    })
  );
}


/**
 * Read JSON property.
 */
function kidlearnV3_3nhReadJsonProperty_(key) {
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