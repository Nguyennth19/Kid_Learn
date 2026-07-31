/**
 * ================================================================
 * KIDLEARN V3 - UI LEARNING WRITE DEV
 * Step: 3J.4
 * Version: 3.1.0
 * ================================================================
 *
 * File này gắn Write Router V3 vào UI học tập DEV.
 *
 * 3J.4 chỉ DRY_RUN.
 *
 * KHÔNG sửa PROD.
 * KHÔNG bật ghi thật.
 * KHÔNG ghi dữ liệu học tập thật.
 */


/**
 * Preview UI Learning Write DEV.
 */
function kidlearnV3_previewLearningWriteDryRunUiV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions = [
    'kidlearnV3_previewWriteRouterV3',
    'kidlearnV3_writeRouterGetStatusV3',
    'kidlearnV3_writeRouterGetSampleContextV3',
    'kidlearnV3_writeRouterDispatchV3',
    'kidlearnV3_writeRouterStudyStartV3',
    'kidlearnV3_writeRouterStudyFinishV3',
    'kidlearnV3_writeRouterLessonProgressSaveV3',
    'kidlearnV3_writeRouterDailyGoalSaveV3',
    'kidlearnV3_writeRouterAuditEventV3'
  ];

  var requiredHtmlFiles = [
    'UI_Write_Router_Client_V3',
    'UI_Learning_Write_Client_V3',
    'UI_Dev_Learning_DryRun_V3'
  ];

  var functionChecks =
    kidlearnV3_learningWriteCheckFunctions_(
      requiredFunctions
    );

  var htmlChecks =
    kidlearnV3_learningWriteCheckHtmlFiles_(
      requiredHtmlFiles
    );

  errors =
    errors.concat(
      functionChecks.errors
    );

  errors =
    errors.concat(
      htmlChecks.errors
    );

  var routerPreview = {
    success: false,
    skipped: true
  };

  if (errors.length === 0) {
    try {
      routerPreview =
        kidlearnV3_previewWriteRouterV3();

      if (!routerPreview.success) {
        errors.push(
          'Write Router preview chưa đạt. Errors: ' +
          routerPreview.errorCount
        );
      }

      if (
        routerPreview.dryRunOnly !== true
      ) {
        warnings.push(
          'Write Router không ở dryRunOnly=true.'
        );
      }

    } catch (error) {
      errors.push(
        'Không chạy được kidlearnV3_previewWriteRouterV3: ' +
        String(error.message || error)
      );
    }
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_LEARNING_WRITE_DRY_RUN_UI_V3',
    phase: '3J.4',
    dryRunOnly: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    routerPreview: {
      success: routerPreview.success === true,
      skipped: routerPreview.skipped === true
    },
    functionChecks: functionChecks.items,
    htmlChecks: htmlChecks.items
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Smoke test server-side cho UI Learning Write DEV.
 *
 * Chỉ DRY_RUN.
 */
function kidlearnV3_smokeTestLearningWriteDryRunUiV3() {
  var status =
    kidlearnV3_writeRouterGetStatusV3({});

  var sample =
    kidlearnV3_writeRouterGetSampleContextV3({});

  var context =
    sample.success && sample.data
      ? sample.data.sampleContext || {}
      : {};

  var childId =
    context.childId || 'DRY_RUN_CHILD_ID';

  var subjectId =
    context.subjectId || '';

  var lessonId =
    context.lessonId || 'DRY_RUN_LESSON_ID';

  var studySessionId =
    'DRY_RUN_SESSION_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMddHHmmss'
    );

  var tests = [];

  tests.push(
    kidlearnV3_writeRouterAuditEventV3({
      payload: {
        eventType: 'LEARNING_UI_SMOKE_TEST',
        message: 'Dry-run audit from Learning Write UI 3J.4',
        entityType: 'PHASE',
        entityId: '3J.4',
        childId: childId
      },
      dryRun: true
    })
  );

  tests.push(
    kidlearnV3_writeRouterStudyStartV3({
      payload: {
        studySessionId: studySessionId,
        childId: childId,
        subjectId: subjectId,
        lessonId: lessonId
      },
      dryRun: true
    })
  );

  tests.push(
    kidlearnV3_writeRouterLessonProgressSaveV3({
      payload: {
        childId: childId,
        subjectId: subjectId,
        lessonId: lessonId,
        progressPercent: 25
      },
      dryRun: true
    })
  );

  tests.push(
    kidlearnV3_writeRouterDailyGoalSaveV3({
      payload: {
        childId: childId,
        goalDate: kidlearnV3_learningWriteToday_(),
        targetMinutes: 20,
        completedMinutes: 5
      },
      dryRun: true
    })
  );

  tests.push(
    kidlearnV3_writeRouterStudyFinishV3({
      payload: {
        studySessionId: studySessionId,
        durationSeconds: 300
      },
      dryRun: true
    })
  );

  var errors = [];
  var warnings = [];

  if (!status.success) {
    errors.push(
      'Write Router status thất bại.'
    );
  }

  if (!sample.success) {
    errors.push(
      'Write Router sample context thất bại.'
    );
  }

  for (var i = 0; i < tests.length; i++) {
    if (tests[i].success !== true) {
      errors.push(
        'Learning write dry-run test #' +
        (i + 1) +
        ' failed: ' +
        kidlearnV3_learningWriteGetErrorMessage_(
          tests[i]
        )
      );
    }
  }

  if (!context.assignmentId) {
    warnings.push(
      'Không có assignmentId mẫu nên UI học tập chỉ test learning core actions.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_LEARNING_WRITE_DRY_RUN_UI_V3',
    phase: '3J.4',
    dryRunOnly: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    sampleContext: context,
    studySessionId: studySessionId,
    testCount: tests.length,
    tests: tests
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test Learning Write UI V3 chưa đạt. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Mở UI Learning Write DEV.
 *
 * Chỉ mở qua Google Sheet menu.
 */
function kidlearnV3_showLearningWriteDryRunUiV3() {
  var preview =
    kidlearnV3_previewLearningWriteDryRunUiV3();

  if (!preview.success) {
    throw new Error(
      'Learning Write Dry Run UI chưa sẵn sàng. Errors: ' +
      preview.errorCount +
      '. Xem Execution log.'
    );
  }

  var html =
    HtmlService
      .createTemplateFromFile(
        'UI_Dev_Learning_DryRun_V3'
      )
      .evaluate()
      .setTitle(
        'KIDLEARN V3 - Learning Write DRY RUN'
      )
      .setWidth(1200)
      .setHeight(850);

  SpreadsheetApp
    .getUi()
    .showModalDialog(
      html,
      'KIDLEARN V3 - Learning Write DRY RUN'
    );
}


/**
 * Check functions.
 */
function kidlearnV3_learningWriteCheckFunctions_(
  functionNames
) {
  var errors = [];
  var items = [];

  for (var i = 0; i < functionNames.length; i++) {
    var exists = false;

    try {
      exists =
        eval(
          'typeof ' +
          functionNames[i] +
          ' === "function"'
        );
    } catch (error) {
      exists = false;
    }

    items.push({
      name: functionNames[i],
      exists: exists
    });

    if (!exists) {
      errors.push(
        'Thiếu function: ' +
        functionNames[i]
      );
    }
  }

  return {
    errorCount: errors.length,
    errors: errors,
    items: items
  };
}


/**
 * Check HTML files.
 */
function kidlearnV3_learningWriteCheckHtmlFiles_(
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
    errorCount: errors.length,
    errors: errors,
    items: items
  };
}


/**
 * Error message helper.
 */
function kidlearnV3_learningWriteGetErrorMessage_(
  response
) {
  if (
    response &&
    response.error &&
    response.error.message
  ) {
    return response.error.message;
  }

  if (
    response &&
    response.details &&
    response.details.writeResponse &&
    response.details.writeResponse.error &&
    response.details.writeResponse.error.message
  ) {
    return response.details.writeResponse.error.message;
  }

  return 'Không rõ lỗi.';
}


/**
 * Today yyyy-MM-dd.
 */
function kidlearnV3_learningWriteToday_() {
  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );
}