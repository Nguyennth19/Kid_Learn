/**
 * ================================================================
 * KIDLEARN V3 - SAFE WRITE LAYER FOR UI DEV
 * Step: 3J.1
 * Version: 3.1.0
 * ================================================================
 *
 * File này tạo lớp ghi dữ liệu V3 an toàn cho UI DEV.
 *
 * Mặc định chỉ chạy DRY_RUN.
 *
 * KHÔNG sửa PROD.
 * KHÔNG ghi nếu write mode chưa ENABLED.
 * KHÔNG cho ghi vào sheet ngoài allowlist.
 * Có audit plan.
 */


var KIDLEARN_V3_SAFE_WRITE_KEYS = {
  MODE: 'KIDLEARN_V3_SAFE_WRITE_MODE',
  ENABLED: 'KIDLEARN_V3_SAFE_WRITE_ENABLED',
  INITIALIZED_AT: 'KIDLEARN_V3_SAFE_WRITE_INITIALIZED_AT',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_SAFE_WRITE_LAST_PREVIEW_AT',
  LAST_DRY_RUN_AT: 'KIDLEARN_V3_SAFE_WRITE_LAST_DRY_RUN_AT',
  LAST_WRITE_AT: 'KIDLEARN_V3_SAFE_WRITE_LAST_WRITE_AT',
  LAST_DISABLED_AT: 'KIDLEARN_V3_SAFE_WRITE_LAST_DISABLED_AT',
  LAST_STATUS_JSON: 'KIDLEARN_V3_SAFE_WRITE_LAST_STATUS_JSON'
};

var KIDLEARN_V3_SAFE_WRITE_MODES = {
  DISABLED: 'DISABLED',
  DRY_RUN: 'DRY_RUN',
  ENABLED: 'ENABLED'
};

var KIDLEARN_V3_SAFE_WRITE_OPERATIONS = {
  AUDIT_LOG: {
    code: 'AUDIT_LOG',
    sheetName: 'LOG_Audit',
    writeType: 'APPEND',
    keyField: 'auditId',
    requiredPayload: ['eventType']
  },

  START_STUDY_SESSION: {
    code: 'START_STUDY_SESSION',
    sheetName: 'DATA_StudySessions',
    writeType: 'APPEND',
    keyField: 'studySessionId',
    requiredPayload: ['childId']
  },

  FINISH_STUDY_SESSION: {
    code: 'FINISH_STUDY_SESSION',
    sheetName: 'DATA_StudySessions',
    writeType: 'UPDATE',
    keyField: 'studySessionId',
    requiredPayload: ['studySessionId']
  },

  UPSERT_LESSON_PROGRESS: {
    code: 'UPSERT_LESSON_PROGRESS',
    sheetName: 'DATA_LessonProgress',
    writeType: 'UPSERT',
    keyField: 'lessonProgressId',
    requiredPayload: ['childId', 'lessonId']
  },

  UPDATE_ASSIGNMENT_STATUS: {
    code: 'UPDATE_ASSIGNMENT_STATUS',
    sheetName: 'DATA_Assignments',
    writeType: 'UPDATE',
    keyField: 'assignmentId',
    requiredPayload: ['assignmentId']
  },

  UPSERT_DAILY_GOAL: {
    code: 'UPSERT_DAILY_GOAL',
    sheetName: 'DATA_DailyGoals',
    writeType: 'UPSERT',
    keyField: 'dailyGoalId',
    requiredPayload: ['childId']
  }
};


/**
 * Preview Safe Write Layer V3.
 */
function kidlearnV3_previewSafeWriteLayerV3() {
  var errors = [];
  var warnings = [];

  kidlearnV3_writeRequireFunction_(
    'kidlearnV3_assertPhase3IClosedFor3JV3',
    errors
  );

  kidlearnV3_writeRequireFunction_(
    'kidlearnV3_getAppDevConnectionV3Status',
    errors
  );

  kidlearnV3_writeRequireFunction_(
    'kidlearnV3_appGetActiveDatabaseV3_',
    errors
  );

  kidlearnV3_writeRequireFunction_(
    'kidlearnV3_serviceGetBootstrapV3',
    errors
  );

  var phase3I =
    kidlearnV3_writeSafePhase3IAssert_();

  if (!phase3I.success) {
    errors.push(
      'Phase 3I chưa đóng đúng điều kiện cho 3J: ' +
      phase3I.message
    );
  }

  var connection =
    kidlearnV3_writeSafeConnection_();

  if (
    connection.databaseMode !== 'V3' ||
    connection.connectionStatus !== 'CONNECTED'
  ) {
    errors.push(
      'App DEV chưa CONNECTED với Database V3.'
    );
  }

  var sheetChecks =
    kidlearnV3_writeCheckTargetSheets_();

  errors =
    errors.concat(
      sheetChecks.errors
    );

  warnings =
    warnings.concat(
      sheetChecks.warnings
    );

  var status =
    kidlearnV3_getSafeWriteLayerStatusV3();

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_SAFE_WRITE_LAYER_V3',
    phase: '3J.1',
    mode: status.mode,
    enabled: status.enabled,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    connection: connection,
    phase3I: phase3I,
    targetSheets: sheetChecks.items,
    allowedOperations:
      kidlearnV3_writeGetAllowedOperationCodes_()
  };

  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_SAFE_WRITE_KEYS.LAST_PREVIEW_AT,
      new Date().toISOString()
    );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Khởi tạo Safe Write Layer ở chế độ DRY_RUN.
 *
 * Chạy hàm này ở 3J.1.
 */
function kidlearnV3_initializeSafeWriteLayerV3() {
  var preview =
    kidlearnV3_previewSafeWriteLayerV3();

  if (!preview.success) {
    throw new Error(
      'Không thể initialize Safe Write Layer. Preview chưa đạt. Errors: ' +
      preview.errorCount
    );
  }

  var now =
    new Date();

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_SAFE_WRITE_KEYS.MODE,
    KIDLEARN_V3_SAFE_WRITE_MODES.DRY_RUN
  );

  properties.setProperty(
    KIDLEARN_V3_SAFE_WRITE_KEYS.ENABLED,
    'FALSE'
  );

  properties.setProperty(
    KIDLEARN_V3_SAFE_WRITE_KEYS.INITIALIZED_AT,
    now.toISOString()
  );

  var result = {
    success: true,
    action: 'INITIALIZE_SAFE_WRITE_LAYER_V3',
    phase: '3J.1',
    mode: KIDLEARN_V3_SAFE_WRITE_MODES.DRY_RUN,
    enabled: false,
    message:
      'Safe Write Layer đã khởi tạo ở chế độ DRY_RUN. Chưa ghi thật vào Database V3.'
  };

  kidlearnV3_writeSaveStatus_(
    result
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Xem trạng thái Safe Write Layer.
 */
function kidlearnV3_getSafeWriteLayerStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var mode =
    properties.getProperty(
      KIDLEARN_V3_SAFE_WRITE_KEYS.MODE
    ) ||
    KIDLEARN_V3_SAFE_WRITE_MODES.DISABLED;

  var enabled =
    properties.getProperty(
      KIDLEARN_V3_SAFE_WRITE_KEYS.ENABLED
    ) === 'TRUE';

  var result = {
    success: true,
    action: 'GET_SAFE_WRITE_LAYER_STATUS_V3',
    phase: '3J.1',
    mode: mode,
    enabled: enabled,
    initializedAt:
      properties.getProperty(
        KIDLEARN_V3_SAFE_WRITE_KEYS.INITIALIZED_AT
      ) ||
      '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_SAFE_WRITE_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastDryRunAt:
      properties.getProperty(
        KIDLEARN_V3_SAFE_WRITE_KEYS.LAST_DRY_RUN_AT
      ) ||
      '',
    lastWriteAt:
      properties.getProperty(
        KIDLEARN_V3_SAFE_WRITE_KEYS.LAST_WRITE_AT
      ) ||
      '',
    lastDisabledAt:
      properties.getProperty(
        KIDLEARN_V3_SAFE_WRITE_KEYS.LAST_DISABLED_AT
      ) ||
      '',
    allowedOperations:
      kidlearnV3_writeGetAllowedOperationCodes_()
  };

  return result;
}


/**
 * Disable write layer.
 */
function kidlearnV3_disableSafeWriteLayerV3() {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_SAFE_WRITE_KEYS.MODE,
    KIDLEARN_V3_SAFE_WRITE_MODES.DISABLED
  );

  properties.setProperty(
    KIDLEARN_V3_SAFE_WRITE_KEYS.ENABLED,
    'FALSE'
  );

  properties.setProperty(
    KIDLEARN_V3_SAFE_WRITE_KEYS.LAST_DISABLED_AT,
    new Date().toISOString()
  );

  var result = {
    success: true,
    action: 'DISABLE_SAFE_WRITE_LAYER_V3',
    mode: KIDLEARN_V3_SAFE_WRITE_MODES.DISABLED,
    enabled: false
  };

  kidlearnV3_writeSaveStatus_(
    result
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * DRY RUN public helper.
 *
 * Chạy kiểm tra write request nhưng chưa ghi thật.
 */
function kidlearnV3_safeWriteDryRunV3(request) {
  var safeRequest =
    kidlearnV3_writeNormalizeRequest_(
      request
    );

  safeRequest.dryRun =
    true;

  return kidlearnV3_safeWriteV3(
    safeRequest
  );
}


/**
 * Central Safe Write API.
 *
 * UI DEV về sau chỉ nên gọi qua service/router, nhưng core ghi an toàn nằm ở đây.
 */
function kidlearnV3_safeWriteV3(request) {
  var startedAt =
    new Date();

  var lock =
    LockService.getScriptLock();

  var locked =
    false;

  try {
    lock.waitLock(30000);
    locked = true;

    var safeRequest =
      kidlearnV3_writeNormalizeRequest_(
        request
      );

    var dryRun =
      safeRequest.dryRun !== false;

    var plan =
      kidlearnV3_writeBuildPlan_(
        safeRequest,
        dryRun
      );

    if (!plan.success) {
      return kidlearnV3_writeResponse_(
        false,
        'SAFE_WRITE_PLAN_FAILED',
        startedAt,
        {
          dryRun: dryRun,
          plan: plan
        },
        plan.errors.join(' | ')
      );
    }

    if (dryRun) {
      PropertiesService
        .getScriptProperties()
        .setProperty(
          KIDLEARN_V3_SAFE_WRITE_KEYS.LAST_DRY_RUN_AT,
          new Date().toISOString()
        );

      return kidlearnV3_writeResponse_(
        true,
        'SAFE_WRITE_DRY_RUN_V3',
        startedAt,
        {
          dryRun: true,
          executed: false,
          plan: plan
        },
        ''
      );
    }

    var writeStatus =
      kidlearnV3_getSafeWriteLayerStatusV3();

    if (
      writeStatus.mode !== KIDLEARN_V3_SAFE_WRITE_MODES.ENABLED ||
      writeStatus.enabled !== true
    ) {
      return kidlearnV3_writeResponse_(
        false,
        'SAFE_WRITE_BLOCKED',
        startedAt,
        {
          dryRun: false,
          executed: false,
          mode: writeStatus.mode,
          enabled: writeStatus.enabled,
          plan: plan
        },
        'Safe Write Layer chưa ENABLED. Không ghi thật.'
      );
    }

    var execution =
      kidlearnV3_writeExecutePlan_(
        plan
      );

    PropertiesService
      .getScriptProperties()
      .setProperty(
        KIDLEARN_V3_SAFE_WRITE_KEYS.LAST_WRITE_AT,
        new Date().toISOString()
      );

    return kidlearnV3_writeResponse_(
      execution.success,
      'SAFE_WRITE_EXECUTE_V3',
      startedAt,
      {
        dryRun: false,
        executed: execution.success,
        plan: plan,
        execution: execution
      },
      execution.success
        ? ''
        : execution.message
    );

  } catch (error) {
    return kidlearnV3_writeResponse_(
      false,
      'SAFE_WRITE_EXCEPTION_V3',
      startedAt,
      {
        dryRun: true,
        executed: false
      },
      String(
        error &&
        error.message
          ? error.message
          : error
      )
    );

  } finally {
    if (locked) {
      lock.releaseLock();
    }
  }
}


/**
 * Smoke test Safe Write Layer.
 *
 * Chỉ DRY_RUN, không ghi thật.
 */
function kidlearnV3_smokeTestSafeWriteLayerV3() {
  var context =
    kidlearnV3_writeGetSampleContext_();

  var childId =
    context.childId || 'TEST_CHILD_ID';

  var lessonId =
    context.lessonId || 'TEST_LESSON_ID';

  var assignmentId =
    context.assignmentId || '';

  var tests = [];

  tests.push(
    kidlearnV3_safeWriteDryRunV3({
      operation: 'AUDIT_LOG',
      payload: {
        eventType: 'SAFE_WRITE_SMOKE_TEST',
        message: 'Dry-run audit log for 3J.1',
        entityType: 'PHASE',
        entityId: '3J.1'
      }
    })
  );

  tests.push(
    kidlearnV3_safeWriteDryRunV3({
      operation: 'START_STUDY_SESSION',
      payload: {
        childId: childId,
        lessonId: lessonId,
        subjectId: context.subjectId || ''
      }
    })
  );

  tests.push(
    kidlearnV3_safeWriteDryRunV3({
      operation: 'UPSERT_LESSON_PROGRESS',
      payload: {
        childId: childId,
        lessonId: lessonId,
        subjectId: context.subjectId || '',
        status: 'IN_PROGRESS',
        progressPercent: 10
      }
    })
  );

  tests.push(
    kidlearnV3_safeWriteDryRunV3({
      operation: 'UPSERT_DAILY_GOAL',
      payload: {
        childId: childId,
        goalDate: kidlearnV3_writeToday_(),
        targetMinutes: 20,
        status: 'ACTIVE'
      }
    })
  );

  if (assignmentId) {
    tests.push(
      kidlearnV3_safeWriteDryRunV3({
        operation: 'UPDATE_ASSIGNMENT_STATUS',
        payload: {
          assignmentId: assignmentId,
          status: 'IN_PROGRESS',
          progressPercent: 5
        }
      })
    );
  }

  var errors = [];
  var warnings = [];

  for (var i = 0; i < tests.length; i++) {
    if (tests[i].success !== true) {
      errors.push(
        'Dry-run test #' +
        (i + 1) +
        ' failed: ' +
        (
          tests[i].error &&
          tests[i].error.message
            ? tests[i].error.message
            : 'Không rõ lỗi.'
        )
      );
    }
  }

  if (!assignmentId) {
    warnings.push(
      'Không có assignmentId mẫu nên bỏ qua dry-run UPDATE_ASSIGNMENT_STATUS.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_SAFE_WRITE_LAYER_V3',
    phase: '3J.1',
    mode:
      kidlearnV3_getSafeWriteLayerStatusV3().mode,
    dryRunOnly: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    sampleContext: context,
    testCount: tests.length,
    tests: tests
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test Safe Write Layer V3 chưa đạt. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Build write plan.
 */
function kidlearnV3_writeBuildPlan_(
  request,
  dryRun
) {
  var errors = [];
  var warnings = [];

  var operationCode =
    String(request.operation || '')
      .trim()
      .toUpperCase();

  var operation =
    KIDLEARN_V3_SAFE_WRITE_OPERATIONS[
      operationCode
    ];

  if (!operation) {
    errors.push(
      'Operation không được hỗ trợ: ' +
      operationCode
    );

    return kidlearnV3_writePlanResult_(
      false,
      operationCode,
      null,
      null,
      {},
      dryRun,
      errors,
      warnings
    );
  }

  var phase3I =
    kidlearnV3_writeSafePhase3IAssert_();

  if (!phase3I.success) {
    errors.push(
      'Phase 3I chưa CLOSED_LOCKED: ' +
      phase3I.message
    );
  }

  var connection =
    kidlearnV3_writeSafeConnection_();

  if (
    connection.databaseMode !== 'V3' ||
    connection.connectionStatus !== 'CONNECTED'
  ) {
    errors.push(
      'App DEV chưa CONNECTED với Database V3.'
    );
  }

  var payload =
    request.payload || {};

  kidlearnV3_writeValidateRequiredPayload_(
    operation,
    payload,
    errors
  );

  var db =
    null;

  var sheet =
    null;

  var header =
    null;

  if (errors.length === 0) {
    db =
      kidlearnV3_appGetActiveDatabaseV3_();

    sheet =
      kidlearnV3_writeGetSheet_(
        db,
        operation.sheetName
      );

    if (!sheet) {
      errors.push(
        'Không tìm thấy target sheet: ' +
        operation.sheetName
      );
    }
  }

  if (errors.length === 0) {
    header =
      kidlearnV3_writeGetHeader_(
        sheet
      );

    if (!header.primaryKey) {
      errors.push(
        'Target sheet thiếu technical key ở row 2: ' +
        operation.sheetName
      );
    }

    if (
      operation.writeType !== 'APPEND' &&
      kidlearnV3_writeGetColumnIndex_(
        header.keys,
        operation.keyField
      ) < 0
    ) {
      errors.push(
        'Target sheet thiếu keyField cho ' +
        operation.writeType +
        ': ' +
        operation.keyField
      );
    }
  }

  var object =
    {};

  if (errors.length === 0) {
    object =
      kidlearnV3_writeBuildObjectForOperation_(
        operation,
        payload,
        header
      );

    kidlearnV3_writeValidateObjectForHeader_(
      operation,
      object,
      header,
      errors,
      warnings
    );
  }

  return kidlearnV3_writePlanResult_(
    errors.length === 0,
    operationCode,
    operation,
    header,
    object,
    dryRun,
    errors,
    warnings
  );
}


/**
 * Execute write plan.
 */
function kidlearnV3_writeExecutePlan_(
  plan
) {
  try {
    var db =
      kidlearnV3_appGetActiveDatabaseV3_();

    var sheet =
      kidlearnV3_writeGetSheet_(
        db,
        plan.targetSheet
      );

    if (!sheet) {
      return {
        success: false,
        message:
          'Không tìm thấy sheet khi execute: ' +
          plan.targetSheet
      };
    }

    var result =
      null;

    if (plan.writeType === 'APPEND') {
      result =
        kidlearnV3_writeAppendObject_(
          sheet,
          plan.object
        );
    }

    if (plan.writeType === 'UPDATE') {
      result =
        kidlearnV3_writeUpdateObject_(
          sheet,
          plan.keyField,
          plan.object
        );
    }

    if (plan.writeType === 'UPSERT') {
      result =
        kidlearnV3_writeUpsertObject_(
          sheet,
          plan.keyField,
          plan.object
        );
    }

    if (!result) {
      return {
        success: false,
        message:
          'writeType không được hỗ trợ khi execute: ' +
          plan.writeType
      };
    }

    var audit =
      kidlearnV3_writeTryAppendAudit_(
        db,
        plan,
        result
      );

    return {
      success: result.success,
      message:
        result.message || '',
      result: result,
      audit: audit
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
 * Append object vào sheet.
 */
function kidlearnV3_writeAppendObject_(
  sheet,
  object
) {
  var header =
    kidlearnV3_writeGetHeader_(
      sheet
    );

  var row =
    kidlearnV3_writeBuildRowValues_(
      header.keys,
      object
    );

  var nextRow =
    sheet.getLastRow() + 1;

  if (nextRow < 3) {
    nextRow = 3;
  }

  sheet
    .getRange(
      nextRow,
      1,
      1,
      row.length
    )
    .setValues([
      row
    ]);

  return {
    success: true,
    action: 'APPEND',
    sheetName: sheet.getName(),
    rowNumber: nextRow,
    keyField: header.primaryKey,
    keyValue:
      object[header.primaryKey] || ''
  };
}


/**
 * Update object theo key.
 */
function kidlearnV3_writeUpdateObject_(
  sheet,
  keyField,
  object
) {
  var header =
    kidlearnV3_writeGetHeader_(
      sheet
    );

  var keyValue =
    String(object[keyField] || '').trim();

  if (!keyValue) {
    return {
      success: false,
      message:
        'Thiếu keyValue cho update: ' +
        keyField
    };
  }

  var rowNumber =
    kidlearnV3_writeFindRowByKey_(
      sheet,
      header,
      keyField,
      keyValue
    );

  if (rowNumber < 0) {
    return {
      success: false,
      message:
        'Không tìm thấy row để update. ' +
        keyField +
        '=' +
        keyValue
    };
  }

  var currentValues =
    sheet
      .getRange(
        rowNumber,
        1,
        1,
        header.keys.length
      )
      .getValues()[0];

  for (var i = 0; i < header.keys.length; i++) {
    var key =
      header.keys[i];

    if (
      object[key] !== undefined &&
      object[key] !== null
    ) {
      currentValues[i] =
        object[key];
    }
  }

  sheet
    .getRange(
      rowNumber,
      1,
      1,
      header.keys.length
    )
    .setValues([
      currentValues
    ]);

  return {
    success: true,
    action: 'UPDATE',
    sheetName: sheet.getName(),
    rowNumber: rowNumber,
    keyField: keyField,
    keyValue: keyValue
  };
}


/**
 * Upsert object theo key.
 */
function kidlearnV3_writeUpsertObject_(
  sheet,
  keyField,
  object
) {
  var header =
    kidlearnV3_writeGetHeader_(
      sheet
    );

  var keyValue =
    String(object[keyField] || '').trim();

  if (!keyValue) {
    return {
      success: false,
      message:
        'Thiếu keyValue cho upsert: ' +
        keyField
    };
  }

  var rowNumber =
    kidlearnV3_writeFindRowByKey_(
      sheet,
      header,
      keyField,
      keyValue
    );

  if (rowNumber < 0) {
    return kidlearnV3_writeAppendObject_(
      sheet,
      object
    );
  }

  return kidlearnV3_writeUpdateObject_(
    sheet,
    keyField,
    object
  );
}


/**
 * Build object theo operation.
 */
function kidlearnV3_writeBuildObjectForOperation_(
  operation,
  payload,
  header
) {
  var now =
    new Date().toISOString();

  var userEmail =
    kidlearnV3_writeGetUserEmail_();

  if (operation.code === 'AUDIT_LOG') {
    return kidlearnV3_writeWithPrimary_(
      header,
      {
        auditId:
          payload.auditId ||
          kidlearnV3_writeMakeUniqueId_('AUD'),
        eventId:
          payload.eventId ||
          kidlearnV3_writeMakeUniqueId_('EVT'),
        eventType:
          payload.eventType || '',
        action:
          payload.action || payload.eventType || '',
        actorUserId:
          payload.actorUserId || '',
        actorEmail:
          userEmail,
        childId:
          payload.childId || '',
        entityType:
          payload.entityType || '',
        entityId:
          payload.entityId || '',
        message:
          payload.message || '',
        detailsJson:
          kidlearnV3_writeJson_(
            payload.details || payload.detailsJson || {}
          ),
        status:
          payload.status || 'INFO',
        createdAt:
          now,
        createdBy:
          userEmail
      },
      'AUD'
    );
  }

  if (operation.code === 'START_STUDY_SESSION') {
    return kidlearnV3_writeWithPrimary_(
      header,
      {
        studySessionId:
          payload.studySessionId ||
          kidlearnV3_writeMakeUniqueId_('SS'),
        sessionId:
          payload.sessionId ||
          payload.studySessionId ||
          kidlearnV3_writeMakeUniqueId_('SSN'),
        childId:
          payload.childId || '',
        subjectId:
          payload.subjectId || '',
        lessonId:
          payload.lessonId || '',
        activityId:
          payload.activityId || '',
        startedAt:
          payload.startedAt || now,
        endedAt:
          '',
        durationSeconds:
          Number(payload.durationSeconds || 0),
        status:
          payload.status || 'IN_PROGRESS',
        source:
          'UI_DEV',
        createdAt:
          now,
        createdBy:
          userEmail,
        updatedAt:
          now,
        updatedBy:
          userEmail
      },
      'SS'
    );
  }

  if (operation.code === 'FINISH_STUDY_SESSION') {
    return {
      studySessionId:
        payload.studySessionId || '',
      endedAt:
        payload.endedAt || now,
      durationSeconds:
        Number(payload.durationSeconds || 0),
      status:
        payload.status || 'COMPLETED',
      updatedAt:
        now,
      updatedBy:
        userEmail
    };
  }

  if (operation.code === 'UPSERT_LESSON_PROGRESS') {
    var lessonProgressId =
      payload.lessonProgressId ||
      kidlearnV3_writeMakeStableId_(
        'LP',
        [
          payload.childId,
          payload.lessonId
        ]
      );

    return kidlearnV3_writeWithPrimary_(
      header,
      {
        lessonProgressId:
          lessonProgressId,
        childId:
          payload.childId || '',
        subjectId:
          payload.subjectId || '',
        lessonId:
          payload.lessonId || '',
        status:
          payload.status || 'IN_PROGRESS',
        progressPercent:
          Number(payload.progressPercent || 0),
        startedAt:
          payload.startedAt || now,
        completedAt:
          payload.completedAt || '',
        lastAccessedAt:
          now,
        createdAt:
          payload.createdAt || now,
        createdBy:
          userEmail,
        updatedAt:
          now,
        updatedBy:
          userEmail
      },
      'LP'
    );
  }

  if (operation.code === 'UPDATE_ASSIGNMENT_STATUS') {
    return {
      assignmentId:
        payload.assignmentId || '',
      status:
        payload.status || 'IN_PROGRESS',
      progressPercent:
        Number(payload.progressPercent || 0),
      completedAt:
        payload.completedAt || '',
      updatedAt:
        now,
      updatedBy:
        userEmail
    };
  }

  if (operation.code === 'UPSERT_DAILY_GOAL') {
    var goalDate =
      payload.goalDate ||
      payload.date ||
      kidlearnV3_writeToday_();

    var dailyGoalId =
      payload.dailyGoalId ||
      kidlearnV3_writeMakeStableId_(
        'DG',
        [
          payload.childId,
          goalDate
        ]
      );

    return kidlearnV3_writeWithPrimary_(
      header,
      {
        dailyGoalId:
          dailyGoalId,
        childId:
          payload.childId || '',
        goalDate:
          goalDate,
        date:
          goalDate,
        targetMinutes:
          Number(payload.targetMinutes || 20),
        completedMinutes:
          Number(payload.completedMinutes || 0),
        status:
          payload.status || 'ACTIVE',
        createdAt:
          payload.createdAt || now,
        createdBy:
          userEmail,
        updatedAt:
          now,
        updatedBy:
          userEmail
      },
      'DG'
    );
  }

  return {};
}


/**
 * Set primary key nếu schema dùng tên khác ở cột đầu.
 */
function kidlearnV3_writeWithPrimary_(
  header,
  object,
  prefix
) {
  if (
    header.primaryKey &&
    !object[header.primaryKey]
  ) {
    object[header.primaryKey] =
      kidlearnV3_writeMakeUniqueId_(
        prefix || 'ROW'
      );
  }

  return object;
}


/**
 * Try append audit sau write thật.
 */
function kidlearnV3_writeTryAppendAudit_(
  db,
  plan,
  execution
) {
  if (plan.operation === 'AUDIT_LOG') {
    return {
      skipped: true,
      reason: 'Operation itself is AUDIT_LOG.'
    };
  }

  try {
    var sheet =
      kidlearnV3_writeGetSheet_(
        db,
        'LOG_Audit'
      );

    if (!sheet) {
      return {
        success: false,
        message: 'LOG_Audit không tồn tại.'
      };
    }

    var header =
      kidlearnV3_writeGetHeader_(
        sheet
      );

    var object =
      kidlearnV3_writeBuildObjectForOperation_(
        KIDLEARN_V3_SAFE_WRITE_OPERATIONS.AUDIT_LOG,
        {
          eventType: 'SAFE_WRITE_EXECUTED',
          action: plan.operation,
          entityType: plan.targetSheet,
          entityId: plan.keyValue || '',
          message:
            'Safe write executed: ' +
            plan.operation,
          details: {
            plan: kidlearnV3_writeCompactPlan_(plan),
            execution: execution
          },
          status: execution.success ? 'INFO' : 'ERROR'
        },
        header
      );

    return kidlearnV3_writeAppendObject_(
      sheet,
      object
    );

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
 * Validate required payload.
 */
function kidlearnV3_writeValidateRequiredPayload_(
  operation,
  payload,
  errors
) {
  var required =
    operation.requiredPayload || [];

  for (var i = 0; i < required.length; i++) {
    var key =
      required[i];

    if (
      payload[key] === undefined ||
      payload[key] === null ||
      String(payload[key]).trim() === ''
    ) {
      errors.push(
        operation.code +
        ' thiếu payload.' +
        key
      );
    }
  }
}


/**
 * Validate object với header.
 */
function kidlearnV3_writeValidateObjectForHeader_(
  operation,
  object,
  header,
  errors,
  warnings
) {
  if (!header || !header.keys || header.keys.length === 0) {
    errors.push(
      'Header technical keys trống.'
    );

    return;
  }

  var keyField =
    operation.keyField;

  if (
    operation.writeType !== 'APPEND' &&
    String(object[keyField] || '').trim() === ''
  ) {
    errors.push(
      operation.code +
      ' thiếu object keyField: ' +
      keyField
    );
  }

  var objectKeys =
    Object.keys(object);

  var mappedCount = 0;

  for (var i = 0; i < objectKeys.length; i++) {
    if (
      kidlearnV3_writeGetColumnIndex_(
        header.keys,
        objectKeys[i]
      ) >= 0
    ) {
      mappedCount++;
    }
  }

  if (mappedCount === 0) {
    errors.push(
      'Không có field nào của object map được vào sheet: ' +
      operation.sheetName
    );
  }

  if (
    operation.writeType !== 'APPEND' &&
    kidlearnV3_writeGetColumnIndex_(
      header.keys,
      keyField
    ) < 0
  ) {
    errors.push(
      'Header thiếu keyField: ' +
      keyField
    );
  }

  for (var k = 0; k < objectKeys.length; k++) {
    if (
      kidlearnV3_writeGetColumnIndex_(
        header.keys,
        objectKeys[k]
      ) < 0
    ) {
      warnings.push(
        'Field không có trong sheet và sẽ bị bỏ qua: ' +
        objectKeys[k]
      );
    }
  }
}


/**
 * Plan result.
 */
function kidlearnV3_writePlanResult_(
  success,
  operationCode,
  operation,
  header,
  object,
  dryRun,
  errors,
  warnings
) {
  var keyField =
    operation
      ? operation.keyField
      : '';

  var keyValue =
    keyField && object
      ? object[keyField] || ''
      : '';

  return {
    success: success,
    operation: operationCode,
    dryRun: dryRun,
    targetSheet:
      operation
        ? operation.sheetName
        : '',
    writeType:
      operation
        ? operation.writeType
        : '',
    keyField:
      keyField,
    keyValue:
      keyValue,
    object:
      object || {},
    mappedFields:
      header
        ? kidlearnV3_writeGetMappedFields_(
            header.keys,
            object || {}
          )
        : [],
    header:
      header
        ? {
            primaryKey: header.primaryKey,
            keyCount: header.keys.length
          }
        : null,
    errorCount:
      errors.length,
    warningCount:
      warnings.length,
    errors:
      errors,
    warnings:
      warnings
  };
}


/**
 * Response helper.
 */
function kidlearnV3_writeResponse_(
  success,
  action,
  startedAt,
  data,
  errorMessage
) {
  var finishedAt =
    new Date();

  var result = {
    success: success,
    action: action,
    phase: '3J.1',
    schemaVersion:
      KIDLEARN_V3.SCHEMA_VERSION,
    appVersion:
      KIDLEARN_V3.APP_VERSION,
    startedAt:
      startedAt.toISOString(),
    finishedAt:
      finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    data:
      data || {}
  };

  if (!success) {
    result.error = {
      code: action,
      message: errorMessage || 'Safe write failed.'
    };
  }

  kidlearnV3_writeSaveStatus_(
    result
  );

  return result;
}


/**
 * Check target sheets.
 */
function kidlearnV3_writeCheckTargetSheets_() {
  var errors = [];
  var warnings = [];
  var items = [];

  var db = null;

  try {
    db =
      kidlearnV3_appGetActiveDatabaseV3_();
  } catch (error) {
    errors.push(
      'Không mở được Database V3: ' +
      String(error.message || error)
    );

    return {
      errorCount: errors.length,
      warningCount: warnings.length,
      errors: errors,
      warnings: warnings,
      items: items
    };
  }

  var codes =
    kidlearnV3_writeGetAllowedOperationCodes_();

  var seen = {};

  for (var i = 0; i < codes.length; i++) {
    var operation =
      KIDLEARN_V3_SAFE_WRITE_OPERATIONS[
        codes[i]
      ];

    if (seen[operation.sheetName]) {
      continue;
    }

    seen[operation.sheetName] =
      true;

    var sheet =
      kidlearnV3_writeGetSheet_(
        db,
        operation.sheetName
      );

    if (!sheet) {
      errors.push(
        'Thiếu target sheet: ' +
        operation.sheetName
      );

      items.push({
        sheetName: operation.sheetName,
        exists: false
      });

      continue;
    }

    var header =
      kidlearnV3_writeGetHeader_(
        sheet
      );

    items.push({
      sheetName:
        operation.sheetName,
      exists:
        true,
      primaryKey:
        header.primaryKey,
      keyCount:
        header.keys.length
    });

    if (!header.primaryKey) {
      errors.push(
        'Sheet thiếu technical key row 2: ' +
        operation.sheetName
      );
    }
  }

  return {
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    items: items
  };
}


/**
 * Get active sheet by exact name.
 *
 * Hàm này nhận được cả:
 * - Spreadsheet object trực tiếp
 * - wrapper object từ kidlearnV3_appGetActiveDatabaseV3_
 * - object có spreadsheetId
 */
function kidlearnV3_writeGetSheet_(
  databaseOrSpreadsheet,
  sheetName
) {
  var spreadsheet =
    kidlearnV3_writeResolveSpreadsheet_(
      databaseOrSpreadsheet
    );

  if (!spreadsheet) {
    throw new Error(
      'Không resolve được Spreadsheet object khi tìm sheet: ' +
      sheetName
    );
  }

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
 * Resolve database wrapper thành Spreadsheet object thật.
 */
function kidlearnV3_writeResolveSpreadsheet_(
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

  if (
    value.spreadsheetId
  ) {
    return SpreadsheetApp.openById(
      value.spreadsheetId
    );
  }

  if (
    value.databaseSpreadsheetId
  ) {
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
 * Get header technical keys.
 */
function kidlearnV3_writeGetHeader_(
  sheet
) {
  var lastColumn =
    sheet.getLastColumn();

  if (lastColumn < 1) {
    return {
      keys: [],
      primaryKey: ''
    };
  }

  var values =
    sheet
      .getRange(
        2,
        1,
        1,
        lastColumn
      )
      .getDisplayValues()[0];

  var keys = [];

  for (var i = 0; i < values.length; i++) {
    keys.push(
      String(values[i] || '').trim()
    );
  }

  return {
    keys: keys,
    primaryKey:
      kidlearnV3_writeFirstNonBlank_(
        keys
      )
  };
}


/**
 * Build row values.
 */
function kidlearnV3_writeBuildRowValues_(
  keys,
  object
) {
  var row = [];

  for (var i = 0; i < keys.length; i++) {
    var key =
      keys[i];

    row.push(
      key && object[key] !== undefined
        ? object[key]
        : ''
    );
  }

  return row;
}


/**
 * Find row by key.
 */
function kidlearnV3_writeFindRowByKey_(
  sheet,
  header,
  keyField,
  keyValue
) {
  var columnIndex =
    kidlearnV3_writeGetColumnIndex_(
      header.keys,
      keyField
    );

  if (columnIndex < 0) {
    return -1;
  }

  var lastRow =
    sheet.getLastRow();

  if (lastRow < 3) {
    return -1;
  }

  var values =
    sheet
      .getRange(
        3,
        columnIndex + 1,
        lastRow - 2,
        1
      )
      .getDisplayValues();

  for (var i = 0; i < values.length; i++) {
    if (
      String(values[i][0] || '').trim() ===
      String(keyValue || '').trim()
    ) {
      return i + 3;
    }
  }

  return -1;
}


/**
 * Get column index.
 */
function kidlearnV3_writeGetColumnIndex_(
  keys,
  key
) {
  for (var i = 0; i < keys.length; i++) {
    if (keys[i] === key) {
      return i;
    }
  }

  return -1;
}


/**
 * Get mapped fields.
 */
function kidlearnV3_writeGetMappedFields_(
  keys,
  object
) {
  var result = [];
  var objectKeys =
    Object.keys(object || {});

  for (var i = 0; i < objectKeys.length; i++) {
    if (
      kidlearnV3_writeGetColumnIndex_(
        keys,
        objectKeys[i]
      ) >= 0
    ) {
      result.push(
        objectKeys[i]
      );
    }
  }

  return result;
}


/**
 * Sample context for smoke dry-run.
 */
function kidlearnV3_writeGetSampleContext_() {
  var context = {
    childId: '',
    subjectId: '',
    lessonId: '',
    assignmentId: ''
  };

  try {
    var bootstrap =
      kidlearnV3_serviceGetBootstrapV3({});

    if (
      bootstrap.success &&
      bootstrap.data
    ) {
      var child =
        bootstrap.data.selectedChild ||
        (
          bootstrap.data.children &&
          bootstrap.data.children.length
            ? bootstrap.data.children[0]
            : null
        );

      if (child) {
        context.childId =
          child.childId || '';
      }

      var subject =
        bootstrap.data.subjects &&
        bootstrap.data.subjects.length
          ? bootstrap.data.subjects[0]
          : null;

      if (subject) {
        context.subjectId =
          subject.subjectId || '';
      }

      var assignment =
        bootstrap.data.assignments &&
        bootstrap.data.assignments.length
          ? bootstrap.data.assignments[0]
          : null;

      if (assignment) {
        context.assignmentId =
          assignment.assignmentId || '';
      }
    }
  } catch (error) {
    context.error =
      String(error.message || error);
  }

  context.lessonId =
    context.lessonId ||
    'DRY_RUN_LESSON_ID';

  return context;
}


/**
 * Require function helper.
 */
function kidlearnV3_writeRequireFunction_(
  functionName,
  errors
) {
  var exists = false;

  try {
    exists =
      eval(
        'typeof ' +
        functionName +
        ' === "function"'
      );
  } catch (error) {
    exists = false;
  }

  if (!exists) {
    errors.push(
      'Thiếu function: ' +
      functionName
    );
  }
}


/**
 * Safe Phase 3I assert.
 */
function kidlearnV3_writeSafePhase3IAssert_() {
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
 * Safe connection.
 */
function kidlearnV3_writeSafeConnection_() {
  try {
    return kidlearnV3_getAppDevConnectionV3Status();
  } catch (error) {
    return {
      success: false,
      databaseMode: '',
      connectionStatus: '',
      spreadsheetId: '',
      spreadsheetName: '',
      error:
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
 * Normalize write request.
 */
function kidlearnV3_writeNormalizeRequest_(
  request
) {
  if (!request) {
    return {
      operation: '',
      payload: {},
      dryRun: true
    };
  }

  if (
    typeof request !== 'object'
  ) {
    return {
      operation:
        String(request || ''),
      payload: {},
      dryRun: true
    };
  }

  return {
    operation:
      request.operation || '',
    payload:
      request.payload || {},
    dryRun:
      request.dryRun !== false
  };
}


/**
 * Allowed operation codes.
 */
function kidlearnV3_writeGetAllowedOperationCodes_() {
  return Object.keys(
    KIDLEARN_V3_SAFE_WRITE_OPERATIONS
  );
}


/**
 * Save compact status.
 */
function kidlearnV3_writeSaveStatus_(
  result
) {
  try {
    PropertiesService
      .getScriptProperties()
      .setProperty(
        KIDLEARN_V3_SAFE_WRITE_KEYS.LAST_STATUS_JSON,
        JSON.stringify({
          success: result.success,
          action: result.action,
          phase: result.phase || '3J.1',
          at: new Date().toISOString()
        })
      );
  } catch (error) {
    console.warn(
      'Không lưu được Safe Write status: ' +
      String(error.message || error)
    );
  }
}


/**
 * First non blank.
 */
function kidlearnV3_writeFirstNonBlank_(
  values
) {
  for (var i = 0; i < values.length; i++) {
    if (String(values[i] || '').trim()) {
      return String(values[i]).trim();
    }
  }

  return '';
}


/**
 * Compact plan for audit.
 */
function kidlearnV3_writeCompactPlan_(
  plan
) {
  return {
    operation:
      plan.operation,
    targetSheet:
      plan.targetSheet,
    writeType:
      plan.writeType,
    keyField:
      plan.keyField,
    keyValue:
      plan.keyValue,
    mappedFields:
      plan.mappedFields
  };
}


/**
 * JSON stringify safe.
 */
function kidlearnV3_writeJson_(
  value
) {
  if (
    value === undefined ||
    value === null ||
    value === ''
  ) {
    return '{}';
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch (error) {
    return JSON.stringify({
      value: String(value)
    });
  }
}


/**
 * Unique ID.
 */
function kidlearnV3_writeMakeUniqueId_(
  prefix
) {
  var time =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMddHHmmssSSS'
    );

  var random =
    Math.floor(
      Math.random() * 100000
    );

  return (
    String(prefix || 'ID') +
    '_' +
    time +
    '_' +
    random
  );
}


/**
 * Stable ID.
 */
function kidlearnV3_writeMakeStableId_(
  prefix,
  parts
) {
  var text =
    [];

  for (var i = 0; i < parts.length; i++) {
    text.push(
      String(parts[i] || '')
        .trim()
        .replace(/[^a-zA-Z0-9]/g, '_')
    );
  }

  return (
    String(prefix || 'ID') +
    '_' +
    text.join('_')
  ).substring(0, 120);
}


/**
 * Today yyyy-MM-dd.
 */
function kidlearnV3_writeToday_() {
  return Utilities.formatDate(
    new Date(),
    Session.getScriptTimeZone(),
    'yyyy-MM-dd'
  );
}


/**
 * Current user email.
 */
function kidlearnV3_writeGetUserEmail_() {
  try {
    return Session.getActiveUser().getEmail() || '';
  } catch (error) {
    return '';
  }
}


/**
 * Debug database object dùng cho Safe Write Layer.
 */
function kidlearnV3_debugSafeWriteDatabaseObjectV3() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_writeResolveSpreadsheet_(
      database
    );

  var result = {
    success:
      !!spreadsheet,
    action:
      'DEBUG_SAFE_WRITE_DATABASE_OBJECT_V3',
    databaseType:
      typeof database,
    databaseKeys:
      database && typeof database === 'object'
        ? Object.keys(database)
        : [],
    resolvedSpreadsheet:
      spreadsheet
        ? {
            id: spreadsheet.getId(),
            name: spreadsheet.getName(),
            sheetCount: spreadsheet.getSheets().length
          }
        : null
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}