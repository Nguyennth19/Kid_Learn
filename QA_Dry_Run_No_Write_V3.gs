/**
 * ================================================================
 * KIDLEARN V3 - DRY RUN NO-WRITE CHECKLIST
 * Step: 3J.5
 * Version: 3.1.0
 * ================================================================
 *
 * File này xác nhận DRY_RUN không làm thay đổi Database V3.
 *
 * KHÔNG sửa PROD.
 * KHÔNG bật ghi thật.
 * KHÔNG ghi dữ liệu học tập thật.
 */


var KIDLEARN_V3_DRY_RUN_CHECK_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3J5_STATUS',
  LAST_RUN_AT: 'KIDLEARN_V3_PHASE_3J5_LAST_RUN_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3J5_READY_AT',
  LAST_ERROR_COUNT: 'KIDLEARN_V3_PHASE_3J5_LAST_ERROR_COUNT',
  LAST_WARNING_COUNT: 'KIDLEARN_V3_PHASE_3J5_LAST_WARNING_COUNT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3J5_LAST_RESULT_JSON'
};

var KIDLEARN_V3_DRY_RUN_CHECK_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  READY_FOR_WRITE_REVIEW: 'READY_FOR_WRITE_REVIEW'
};

var KIDLEARN_V3_DRY_RUN_TARGET_SHEETS = [
  'LOG_Audit',
  'DATA_StudySessions',
  'DATA_LessonProgress',
  'DATA_Assignments',
  'DATA_DailyGoals'
];


/**
 * Preview checklist 3J.5.
 */
function kidlearnV3_previewDryRunNoWriteChecklistV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions = [
    'kidlearnV3_previewLearningWriteDryRunUiV3',
    'kidlearnV3_smokeTestLearningWriteDryRunUiV3',
    'kidlearnV3_previewWriteRouterV3',
    'kidlearnV3_writeRouterGetStatusV3',
    'kidlearnV3_writeRouterGetSampleContextV3',
    'kidlearnV3_writeRouterAuditEventV3',
    'kidlearnV3_writeRouterStudyStartV3',
    'kidlearnV3_writeRouterStudyFinishV3',
    'kidlearnV3_writeRouterLessonProgressSaveV3',
    'kidlearnV3_writeRouterDailyGoalSaveV3',
    'kidlearnV3_getSafeWriteLayerStatusV3',
    'kidlearnV3_assertPhase3IClosedFor3JV3',
    'kidlearnV3_appGetActiveDatabaseV3_'
  ];

  var functionChecks =
    kidlearnV3_dryRunCheckFunctions_(
      requiredFunctions
    );

  errors =
    errors.concat(
      functionChecks.errors
    );

  var htmlChecks =
    kidlearnV3_dryRunCheckHtmlFiles_([
      'UI_Write_Router_Client_V3',
      'UI_Learning_Write_Client_V3',
      'UI_Dev_Learning_DryRun_V3'
    ]);

  errors =
    errors.concat(
      htmlChecks.errors
    );

  var phase3I =
    kidlearnV3_dryRunSafePhase3IAssert_();

  if (!phase3I.success) {
    errors.push(
      'Phase 3I chưa CLOSED_LOCKED cho 3J: ' +
      phase3I.message
    );
  }

  var safeWriteStatus =
    kidlearnV3_dryRunSafeWriteStatus_();

  if (safeWriteStatus.mode !== 'DRY_RUN') {
    errors.push(
      'Safe Write Layer phải ở DRY_RUN trước khi kiểm tra no-write. Mode hiện tại: ' +
      safeWriteStatus.mode
    );
  }

  if (safeWriteStatus.enabled !== false) {
    errors.push(
      'Safe Write Layer enabled phải là false trước khi kiểm tra no-write.'
    );
  }

  var routerStatus =
    kidlearnV3_dryRunSafeRouterStatus_();

  var routerDryRunOnly =
    routerStatus.success &&
    routerStatus.data
      ? routerStatus.data.dryRunOnly
      : null;

  if (routerDryRunOnly !== true) {
    errors.push(
      'Write Router phải ở DRY_RUN_ONLY=true.'
    );
  }

  var targetCheck =
    kidlearnV3_dryRunCheckTargetSheets_();

  errors =
    errors.concat(
      targetCheck.errors
    );

  warnings =
    warnings.concat(
      targetCheck.warnings
    );

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_DRY_RUN_NO_WRITE_CHECKLIST_V3',
    phase: '3J.5',
    dryRunOnly: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3I: phase3I,
    safeWriteStatus: safeWriteStatus,
    routerStatus: {
      success: routerStatus.success === true,
      dryRunOnly: routerDryRunOnly
    },
    targetSheets: targetCheck.items,
    functionChecks: functionChecks.items,
    htmlChecks: htmlChecks.items
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Chạy checklist xác nhận DRY_RUN không đổi Database V3.
 */
function kidlearnV3_runDryRunNoWriteChecklistV3() {
  var startedAt =
    new Date();

  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewDryRunNoWriteChecklistV3();

  if (!preview.success) {
    throw new Error(
      'Không thể chạy 3J.5 vì preview chưa đạt. Errors: ' +
      preview.errorCount
    );
  }

  var targetSheets =
    KIDLEARN_V3_DRY_RUN_TARGET_SHEETS.slice();

  var beforeSnapshot =
    kidlearnV3_dryRunSnapshotSheets_(
      targetSheets
    );

  var scenario =
    kidlearnV3_dryRunExecuteScenario_();

  if (!scenario.success) {
    errors.push(
      'Dry-run scenario có lỗi. Errors: ' +
      scenario.errorCount
    );
  }

  warnings =
    warnings.concat(
      scenario.warnings
    );

  SpreadsheetApp.flush();
  Utilities.sleep(500);

  var afterSnapshot =
    kidlearnV3_dryRunSnapshotSheets_(
      targetSheets
    );

  var diff =
    kidlearnV3_dryRunCompareSnapshots_(
      beforeSnapshot,
      afterSnapshot
    );

  errors =
    errors.concat(
      diff.errors
    );

  warnings =
    warnings.concat(
      diff.warnings
    );

  var finishedAt =
    new Date();

  var result = {
    success: errors.length === 0,
    action: 'RUN_DRY_RUN_NO_WRITE_CHECKLIST_V3',
    phase: '3J.5',
    dryRunOnly: true,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    targetSheets: targetSheets,
    beforeSnapshot: beforeSnapshot.summary,
    afterSnapshot: afterSnapshot.summary,
    diff: diff,
    scenario: scenario,
    checklist:
      kidlearnV3_dryRunBuildChecklist_(
        errors,
        warnings,
        diff,
        scenario
      )
  };

  kidlearnV3_dryRunSaveResult_(
    result
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'DRY_RUN đã làm thay đổi Database V3 hoặc scenario có lỗi. Errors: ' +
      result.errorCount
    );
  }

  return result;
}


/**
 * Đánh dấu 3J.5 sẵn sàng review trước khi cân nhắc bật ghi thật.
 */
function kidlearnV3_markDryRunNoWriteReadyForReviewV3() {
  var result =
    kidlearnV3_runDryRunNoWriteChecklistV3();

  if (!result.success) {
    throw new Error(
      'Không thể mark READY_FOR_WRITE_REVIEW vì 3J.5 chưa pass.'
    );
  }

  var now =
    new Date();

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_DRY_RUN_CHECK_KEYS.STATUS,
    KIDLEARN_V3_DRY_RUN_CHECK_STATUS.READY_FOR_WRITE_REVIEW
  );

  properties.setProperty(
    KIDLEARN_V3_DRY_RUN_CHECK_KEYS.LAST_READY_AT,
    now.toISOString()
  );

  var finalResult = {
    success: true,
    action: 'MARK_DRY_RUN_NO_WRITE_READY_FOR_REVIEW_V3',
    phase: '3J.5',
    status: 'READY_FOR_WRITE_REVIEW',
    dryRunOnly: true,
    message:
      '3J.5 đã pass. DRY_RUN không làm thay đổi Database V3. Có thể chuyển sang bước review trước khi bật ghi thật.',
    lastResult: {
      errorCount: result.errorCount,
      warningCount: result.warningCount,
      durationMs: result.durationMs
    }
  };

  console.log(
    JSON.stringify(finalResult, null, 2)
  );

  return finalResult;
}


/**
 * Xem trạng thái 3J.5.
 */
function kidlearnV3_getDryRunNoWriteChecklistStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_DRY_RUN_NO_WRITE_CHECKLIST_STATUS_V3',
    phase: '3J.5',
    status:
      properties.getProperty(
        KIDLEARN_V3_DRY_RUN_CHECK_KEYS.STATUS
      ) ||
      KIDLEARN_V3_DRY_RUN_CHECK_STATUS.NOT_RUN,
    lastRunAt:
      properties.getProperty(
        KIDLEARN_V3_DRY_RUN_CHECK_KEYS.LAST_RUN_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_DRY_RUN_CHECK_KEYS.LAST_READY_AT
      ) ||
      '',
    lastErrorCount:
      Number(
        properties.getProperty(
          KIDLEARN_V3_DRY_RUN_CHECK_KEYS.LAST_ERROR_COUNT
        ) ||
        0
      ),
    lastWarningCount:
      Number(
        properties.getProperty(
          KIDLEARN_V3_DRY_RUN_CHECK_KEYS.LAST_WARNING_COUNT
        ) ||
        0
      ),
    lastResult:
      kidlearnV3_dryRunReadLastResult_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert dùng trước bước bật ghi thật.
 */
function kidlearnV3_assertDryRunNoDatabaseChangesV3() {
  var status =
    kidlearnV3_getDryRunNoWriteChecklistStatusV3();

  var errors = [];

  if (
    status.status !== 'READY_FOR_WRITE_REVIEW' &&
    status.status !== 'PASSED'
  ) {
    errors.push(
      '3J.5 chưa PASSED/READY_FOR_WRITE_REVIEW. Status hiện tại: ' +
      status.status
    );
  }

  if (status.lastErrorCount !== 0) {
    errors.push(
      '3J.5 lastErrorCount phải bằng 0. Hiện tại: ' +
      status.lastErrorCount
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_DRY_RUN_NO_DATABASE_CHANGES_V3',
    phase: '3J.5',
    errorCount: errors.length,
    errors: errors,
    status: status.status,
    lastRunAt: status.lastRunAt,
    lastReadyAt: status.lastReadyAt
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Chưa đủ điều kiện cân nhắc bật ghi thật. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Chạy dry-run scenario đầy đủ qua Write Router.
 */
function kidlearnV3_dryRunExecuteScenario_() {
  var warnings = [];
  var steps = [];

  var sample =
    kidlearnV3_writeRouterGetSampleContextV3({});

  var context =
    sample.success && sample.data
      ? sample.data.sampleContext || {}
      : {};

  if (!sample.success) {
    steps.push({
      name: 'SAMPLE_CONTEXT',
      success: false,
      error:
        kidlearnV3_dryRunGetErrorMessage_(
          sample
        )
    });
  }

  var childId =
    context.childId || 'DRY_RUN_CHILD_ID';

  var subjectId =
    context.subjectId || '';

  var lessonId =
    context.lessonId || 'DRY_RUN_LESSON_ID';

  var studySessionId =
    'DRY_RUN_NOWRITE_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMddHHmmss'
    );

  kidlearnV3_dryRunScenarioStep_(
    steps,
    'AUDIT_EVENT',
    function() {
      return kidlearnV3_writeRouterAuditEventV3({
        payload: {
          eventType: 'DRY_RUN_NO_WRITE_CHECK',
          message: 'Dry-run no-write check from 3J.5',
          entityType: 'PHASE',
          entityId: '3J.5',
          childId: childId
        },
        dryRun: true
      });
    }
  );

  kidlearnV3_dryRunScenarioStep_(
    steps,
    'STUDY_START',
    function() {
      return kidlearnV3_writeRouterStudyStartV3({
        payload: {
          studySessionId: studySessionId,
          childId: childId,
          subjectId: subjectId,
          lessonId: lessonId
        },
        dryRun: true
      });
    }
  );

  kidlearnV3_dryRunScenarioStep_(
    steps,
    'LESSON_PROGRESS_SAVE',
    function() {
      return kidlearnV3_writeRouterLessonProgressSaveV3({
        payload: {
          childId: childId,
          subjectId: subjectId,
          lessonId: lessonId,
          progressPercent: 40
        },
        dryRun: true
      });
    }
  );

  kidlearnV3_dryRunScenarioStep_(
    steps,
    'DAILY_GOAL_SAVE',
    function() {
      return kidlearnV3_writeRouterDailyGoalSaveV3({
        payload: {
          childId: childId,
          goalDate: kidlearnV3_dryRunToday_(),
          targetMinutes: 20,
          completedMinutes: 8
        },
        dryRun: true
      });
    }
  );

  kidlearnV3_dryRunScenarioStep_(
    steps,
    'STUDY_FINISH',
    function() {
      return kidlearnV3_writeRouterStudyFinishV3({
        payload: {
          studySessionId: studySessionId,
          durationSeconds: 300
        },
        dryRun: true
      });
    }
  );

  if (context.assignmentId) {
    kidlearnV3_dryRunScenarioStep_(
      steps,
      'ASSIGNMENT_START',
      function() {
        return kidlearnV3_writeRouterAssignmentStartV3({
          payload: {
            assignmentId: context.assignmentId
          },
          dryRun: true
        });
      }
    );

    kidlearnV3_dryRunScenarioStep_(
      steps,
      'ASSIGNMENT_PROGRESS',
      function() {
        return kidlearnV3_writeRouterAssignmentProgressV3({
          payload: {
            assignmentId: context.assignmentId,
            progressPercent: 60
          },
          dryRun: true
        });
      }
    );

    kidlearnV3_dryRunScenarioStep_(
      steps,
      'ASSIGNMENT_COMPLETE',
      function() {
        return kidlearnV3_writeRouterAssignmentCompleteV3({
          payload: {
            assignmentId: context.assignmentId
          },
          dryRun: true
        });
      }
    );

  } else {
    warnings.push(
      'Không có assignmentId mẫu nên bỏ qua assignment dry-run scenario.'
    );
  }

  var errors = [];

  for (var i = 0; i < steps.length; i++) {
    if (steps[i].success !== true) {
      errors.push(
        steps[i].name + ': ' + steps[i].error
      );
    }
  }

  return {
    success: errors.length === 0,
    action: 'DRY_RUN_SCENARIO_V3',
    dryRunOnly: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    sampleContext: context,
    studySessionId: studySessionId,
    steps: steps
  };
}


/**
 * Scenario step wrapper.
 */
function kidlearnV3_dryRunScenarioStep_(
  steps,
  name,
  handler
) {
  var startedAt =
    new Date();

  try {
    var response =
      handler();

    var success =
      response &&
      response.success === true;

    steps.push({
      name: name,
      success: success,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      dryRun:
        kidlearnV3_dryRunExtractDryRunFlag_(
          response
        ),
      executed:
        kidlearnV3_dryRunExtractExecutedFlag_(
          response
        ),
      serviceName:
        response && response.serviceName
          ? response.serviceName
          : '',
      error:
        success
          ? ''
          : kidlearnV3_dryRunGetErrorMessage_(
              response
            )
    });

    return response;

  } catch (error) {
    steps.push({
      name: name,
      success: false,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date().toISOString(),
      dryRun: true,
      executed: false,
      error:
        String(
          error &&
          error.message
            ? error.message
            : error
        )
    });

    return null;
  }
}


/**
 * Snapshot nhiều sheet.
 */
function kidlearnV3_dryRunSnapshotSheets_(
  sheetNames
) {
  var spreadsheet =
    kidlearnV3_dryRunGetDatabaseSpreadsheet_();

  var items = [];
  var summary = [];

  for (var i = 0; i < sheetNames.length; i++) {
    var item =
      kidlearnV3_dryRunSnapshotSheet_(
        spreadsheet,
        sheetNames[i]
      );

    items.push(item);

    summary.push({
      sheetName: item.sheetName,
      exists: item.exists,
      lastRow: item.lastRow,
      lastColumn: item.lastColumn,
      dataRowCount: item.dataRowCount,
      checksum: item.checksum
    });
  }

  return {
    spreadsheetId:
      spreadsheet.getId(),
    spreadsheetName:
      spreadsheet.getName(),
    capturedAt:
      new Date().toISOString(),
    items:
      items,
    summary:
      summary
  };
}


/**
 * Snapshot một sheet.
 */
function kidlearnV3_dryRunSnapshotSheet_(
  spreadsheet,
  sheetName
) {
  var sheet =
    kidlearnV3_dryRunGetSheet_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return {
      sheetName: sheetName,
      exists: false,
      lastRow: 0,
      lastColumn: 0,
      dataRowCount: 0,
      checksum: ''
    };
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  var values = [];

  if (
    lastRow > 0 &&
    lastColumn > 0
  ) {
    values =
      sheet
        .getRange(
          1,
          1,
          lastRow,
          lastColumn
        )
        .getDisplayValues();
  }

  var text =
    JSON.stringify({
      sheetName: sheetName,
      lastRow: lastRow,
      lastColumn: lastColumn,
      values: values
    });

  return {
    sheetName: sheetName,
    exists: true,
    lastRow: lastRow,
    lastColumn: lastColumn,
    dataRowCount:
      Math.max(0, lastRow - 2),
    checksum:
      kidlearnV3_dryRunMd5_(
        text
      )
  };
}


/**
 * So sánh snapshot before/after.
 */
function kidlearnV3_dryRunCompareSnapshots_(
  beforeSnapshot,
  afterSnapshot
) {
  var errors = [];
  var warnings = [];

  var beforeMap =
    kidlearnV3_dryRunMapSnapshots_(
      beforeSnapshot.items
    );

  var afterMap =
    kidlearnV3_dryRunMapSnapshots_(
      afterSnapshot.items
    );

  var sheetNames =
    Object.keys(beforeMap);

  var changedSheets = [];

  for (var i = 0; i < sheetNames.length; i++) {
    var name =
      sheetNames[i];

    var before =
      beforeMap[name];

    var after =
      afterMap[name];

    if (!after) {
      errors.push(
        'Sheet biến mất sau dry-run: ' +
        name
      );

      changedSheets.push(name);

      continue;
    }

    var changed = false;
    var changes = [];

    if (before.exists !== after.exists) {
      changed = true;
      changes.push(
        'exists ' +
        before.exists +
        ' -> ' +
        after.exists
      );
    }

    if (before.lastRow !== after.lastRow) {
      changed = true;
      changes.push(
        'lastRow ' +
        before.lastRow +
        ' -> ' +
        after.lastRow
      );
    }

    if (before.lastColumn !== after.lastColumn) {
      changed = true;
      changes.push(
        'lastColumn ' +
        before.lastColumn +
        ' -> ' +
        after.lastColumn
      );
    }

    if (before.dataRowCount !== after.dataRowCount) {
      changed = true;
      changes.push(
        'dataRowCount ' +
        before.dataRowCount +
        ' -> ' +
        after.dataRowCount
      );
    }

    if (before.checksum !== after.checksum) {
      changed = true;
      changes.push(
        'checksum changed'
      );
    }

    if (changed) {
      changedSheets.push(name);

      errors.push(
        'DRY_RUN làm thay đổi sheet ' +
        name +
        ': ' +
        changes.join(', ')
      );
    }
  }

  return {
    success: errors.length === 0,
    checkedSheetCount: sheetNames.length,
    changedSheetCount: changedSheets.length,
    changedSheets: changedSheets,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Build checklist summary.
 */
function kidlearnV3_dryRunBuildChecklist_(
  errors,
  warnings,
  diff,
  scenario
) {
  return [
    {
      item: 'Safe Write Layer giữ DRY_RUN',
      status:
        kidlearnV3_dryRunSafeWriteStatus_().mode === 'DRY_RUN'
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'Write Router giữ DRY_RUN_ONLY',
      status:
        kidlearnV3_dryRunRouterDryRunOnly_()
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'Dry-run scenario chạy qua Write Router',
      status:
        scenario.success
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'Target sheets không đổi row count',
      status:
        diff.changedSheetCount === 0
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'Target sheets không đổi checksum',
      status:
        diff.changedSheetCount === 0
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'Kết luận 3J.5',
      status:
        errors.length === 0
          ? 'PASSED'
          : 'FAILED',
      warningCount:
        warnings.length
    }
  ];
}


/**
 * Check target sheets.
 */
function kidlearnV3_dryRunCheckTargetSheets_() {
  var errors = [];
  var warnings = [];
  var items = [];

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_dryRunGetDatabaseSpreadsheet_();
  } catch (error) {
    errors.push(
      'Không mở được Database V3: ' +
      String(error.message || error)
    );

    return {
      errors: errors,
      warnings: warnings,
      items: items
    };
  }

  for (
    var i = 0;
    i < KIDLEARN_V3_DRY_RUN_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_DRY_RUN_TARGET_SHEETS[i];

    var sheet =
      kidlearnV3_dryRunGetSheet_(
        spreadsheet,
        sheetName
      );

    if (!sheet) {
      errors.push(
        'Thiếu target sheet: ' +
        sheetName
      );

      items.push({
        sheetName: sheetName,
        exists: false
      });

      continue;
    }

    items.push({
      sheetName: sheetName,
      exists: true,
      lastRow: sheet.getLastRow(),
      lastColumn: sheet.getLastColumn()
    });
  }

  return {
    errors: errors,
    warnings: warnings,
    items: items
  };
}


/**
 * Save result gọn vào ScriptProperties.
 */
function kidlearnV3_dryRunSaveResult_(
  result
) {
  var status =
    result.success
      ? KIDLEARN_V3_DRY_RUN_CHECK_STATUS.PASSED
      : KIDLEARN_V3_DRY_RUN_CHECK_STATUS.FAILED;

  var compact = {
    success: result.success,
    action: result.action,
    phase: result.phase,
    dryRunOnly: result.dryRunOnly,
    finishedAt: result.finishedAt,
    durationMs: result.durationMs,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    changedSheetCount:
      result.diff
        ? result.diff.changedSheetCount
        : null,
    changedSheets:
      result.diff
        ? result.diff.changedSheets
        : [],
    checklist: result.checklist
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_DRY_RUN_CHECK_KEYS.STATUS,
    status
  );

  properties.setProperty(
    KIDLEARN_V3_DRY_RUN_CHECK_KEYS.LAST_RUN_AT,
    new Date().toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_DRY_RUN_CHECK_KEYS.LAST_ERROR_COUNT,
    String(result.errorCount)
  );

  properties.setProperty(
    KIDLEARN_V3_DRY_RUN_CHECK_KEYS.LAST_WARNING_COUNT,
    String(result.warningCount)
  );

  properties.setProperty(
    KIDLEARN_V3_DRY_RUN_CHECK_KEYS.LAST_RESULT_JSON,
    JSON.stringify(compact)
  );
}


/**
 * Read last result.
 */
function kidlearnV3_dryRunReadLastResult_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_DRY_RUN_CHECK_KEYS.LAST_RESULT_JSON
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
 * Map snapshot.
 */
function kidlearnV3_dryRunMapSnapshots_(
  items
) {
  var map = {};

  for (var i = 0; i < items.length; i++) {
    map[items[i].sheetName] =
      items[i];
  }

  return map;
}


/**
 * Get database spreadsheet.
 */
function kidlearnV3_dryRunGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_dryRunResolveSpreadsheet_(
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
 * Resolve database wrapper thành Spreadsheet object.
 */
function kidlearnV3_dryRunResolveSpreadsheet_(
  value
) {
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
 * Get sheet exact name.
 */
function kidlearnV3_dryRunGetSheet_(
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
function kidlearnV3_dryRunCheckFunctions_(
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
function kidlearnV3_dryRunCheckHtmlFiles_(
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
 * Safe Phase 3I assert.
 */
function kidlearnV3_dryRunSafePhase3IAssert_() {
  try {
    var result =
      kidlearnV3_assertPhase3IClosedFor3JV3();

    return {
      success: result.success === true,
      message: ''
    };

  } catch (error) {
    return {
      success: false,
      message:
        String(
          error &&
          error.message
            ? error.message
            : error
        )
    };
  }
}


/**
 * Safe SafeWrite status.
 */
function kidlearnV3_dryRunSafeWriteStatus_() {
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
 * Safe router status.
 */
function kidlearnV3_dryRunSafeRouterStatus_() {
  try {
    return kidlearnV3_writeRouterGetStatusV3({});
  } catch (error) {
    return {
      success: false,
      error: {
        message:
          String(error.message || error)
      }
    };
  }
}


/**
 * Router dry-run only flag.
 */
function kidlearnV3_dryRunRouterDryRunOnly_() {
  var status =
    kidlearnV3_dryRunSafeRouterStatus_();

  return (
    status.success &&
    status.data &&
    status.data.dryRunOnly === true
  );
}


/**
 * Extract dryRun flag.
 */
function kidlearnV3_dryRunExtractDryRunFlag_(
  response
) {
  try {
    return (
      response.data &&
      response.data.writeService &&
      response.data.writeService.data &&
      response.data.writeService.data.dryRun === true
    );
  } catch (error) {
    return true;
  }
}


/**
 * Extract executed flag.
 */
function kidlearnV3_dryRunExtractExecutedFlag_(
  response
) {
  try {
    return (
      response.data &&
      response.data.writeService &&
      response.data.writeService.data &&
      response.data.writeService.data.executed === true
    );
  } catch (error) {
    return false;
  }
}


/**
 * Error message helper.
 */
function kidlearnV3_dryRunGetErrorMessage_(
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
 * MD5 checksum.
 */
function kidlearnV3_dryRunMd5_(
  text
) {
  var digest =
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.MD5,
      text,
      Utilities.Charset.UTF_8
    );

  var result = '';

  for (var i = 0; i < digest.length; i++) {
    var value =
      digest[i];

    if (value < 0) {
      value += 256;
    }

    result +=
      ('0' + value.toString(16)).slice(-2);
  }

  return result;
}


/**
 * Today yyyy-MM-dd.
 */
function kidlearnV3_dryRunToday_() {
  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );
}