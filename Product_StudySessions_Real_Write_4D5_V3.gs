/**
 * ================================================================
 * KIDLEARN V3 - CONTROLLED DEV REAL WRITE: DATA_STUDY_SESSIONS
 * Step: 4D-5
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Controlled DEV real write into DATA_StudySessions.
 * - Append audit row into LOG_Audit.
 * - Verify written rows.
 *
 * Safety:
 * - Chỉ ghi DEV.
 * - Không ghi PROD.
 * - Cần confirm text rõ ràng.
 * - Ghi 01 study session test row + 01 audit row.
 * - Không ghi DATA_Responses.
 * - Không ghi DATA_LessonProgress.
 */


var KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4D5_STATUS',
  LAST_PREFLIGHT_AT: 'KIDLEARN_V3_PHASE_4D5_LAST_PREFLIGHT_AT',
  LAST_WRITE_AT: 'KIDLEARN_V3_PHASE_4D5_LAST_WRITE_AT',
  LAST_VERIFY_AT: 'KIDLEARN_V3_PHASE_4D5_LAST_VERIFY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4D5_LAST_RESULT_JSON',
  LAST_WRITE_JSON: 'KIDLEARN_V3_PHASE_4D5_LAST_WRITE_JSON'
};


var KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREFLIGHT_PASSED: 'PREFLIGHT_PASSED',
  READY_FOR_4D_6: 'READY_FOR_4D_6',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG = {
  PHASE: '4D-5',
  PARENT_PHASE: '4D',
  PREVIOUS_BUNDLE: '4D-4',
  NEXT_BUNDLE: '4D-6',
  NEXT_STAGE: 'UI_CONTROLLED_WRITE_GATE',
  WRITE_NAME: 'CONTROLLED_DEV_REAL_WRITE_DATA_STUDY_SESSIONS',
  CONFIRM_TEXT: 'CONFIRM_REAL_WRITE_DATA_STUDY_SESSIONS_4D5',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: true
};


/**
 * Preview real write row.
 * Không ghi sheet.
 */
function kidlearnV3_previewStudySessionRealWrite4D5V3(payload) {
  payload =
    payload ||
    kidlearnV3_4d5BuildSamplePayload_();

  var plan =
    kidlearnV3_4d5BuildRealWritePlan_(payload);

  plan.action =
    'PREVIEW_STUDY_SESSION_REAL_WRITE_4D_5_V3';

  kidlearnV3_4d5SaveStatus_(
    plan,
    plan.success
      ? KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_STATUS.PREFLIGHT_PASSED
      : KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_STATUS.FAILED,
    KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_KEYS.LAST_PREFLIGHT_AT
  );

  console.log(JSON.stringify({
    success: plan.success,
    action: plan.action,
    phase: plan.phase,
    willWriteNow: false,
    targetSheet: 'DATA_StudySessions',
    auditSheet: 'LOG_Audit',
    operationMode:
      plan.sessionPlan ? plan.sessionPlan.operationMode : '',
    sessionTargetRow:
      plan.sessionPlan ? plan.sessionPlan.targetRowNumber : '',
    auditTargetNextRow:
      plan.auditPlan ? plan.auditPlan.targetNextRow : '',
    prodWriteAllowed: false,
    realWriteAllowed: true,
    actualSheetWritePerformed: false,
    errorCount: plan.errorCount,
    warningCount: plan.warningCount,
    errors: plan.errors,
    warnings: plan.warnings
  }, null, 2));

  if (!plan.success) {
    throw new Error(
      '4D-5 preview failed. Errors=' +
      plan.errors.join(' | ')
    );
  }

  return plan;
}


/**
 * Preflight only.
 * Không ghi sheet.
 */
function kidlearnV3_runStudySessionRealWritePreflight4D5V3() {
  var result =
    kidlearnV3_previewStudySessionRealWrite4D5V3(
      kidlearnV3_4d5BuildSamplePayload_()
    );

  result.action =
    'RUN_STUDY_SESSION_REAL_WRITE_PREFLIGHT_4D_5_V3';

  kidlearnV3_4d5SaveStatus_(
    result,
    KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_STATUS.PREFLIGHT_PASSED,
    KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_KEYS.LAST_PREFLIGHT_AT
  );

  console.log(JSON.stringify({
    success: result.success,
    action: result.action,
    phase: result.phase,
    status:
      KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_STATUS.PREFLIGHT_PASSED,
    nextAction:
      'Run kidlearnV3_realWriteDataStudySessions4D5ConfirmV3 to append one DEV test study session row.',
    prodWriteAllowed: false,
    realWriteAllowed: true,
    actualSheetWritePerformed: false,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    warnings: result.warnings
  }, null, 2));

  return result;
}


/**
 * Public confirm wrapper.
 */
function kidlearnV3_realWriteDataStudySessions4D5ConfirmV3() {
  return kidlearnV3_realWriteDataStudySessions4D5V3({
    confirm:
      KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.CONFIRM_TEXT,
    payload:
      kidlearnV3_4d5BuildSamplePayload_(),
    reviewerNote:
      'Controlled DEV real write for DATA_StudySessions. One test session row and one audit row.'
  });
}


/**
 * Controlled DEV real write.
 */
function kidlearnV3_realWriteDataStudySessions4D5V3(options) {
  options = options || {};

  var confirmText =
    String(options.confirm || '')
      .trim()
      .toUpperCase();

  if (
    confirmText !==
    KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm. Cần confirm=' +
      KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.CONFIRM_TEXT
    );
  }

  var payload =
    options.payload ||
    kidlearnV3_4d5BuildSamplePayload_();

  var lock =
    LockService.getScriptLock();

  var locked =
    lock.tryLock(30000);

  if (!locked) {
    throw new Error(
      'Không lấy được script lock sau 30 giây. Vui lòng chạy lại.'
    );
  }

  try {
    var plan =
      kidlearnV3_4d5BuildRealWritePlan_(payload);

    if (!plan.success) {
      throw new Error(
        'Preflight 4D-5 chưa pass. Errors=' +
        plan.errors.join(' | ')
      );
    }

    var spreadsheet =
      kidlearnV3_4d5OpenSpreadsheet_();

    var sessionSheet =
      kidlearnV3_4d5GetSheetByExactName_(
        spreadsheet,
        'DATA_StudySessions'
      );

    var auditSheet =
      kidlearnV3_4d5GetSheetByExactName_(
        spreadsheet,
        'LOG_Audit'
      );

    if (!sessionSheet) {
      throw new Error('Không tìm thấy DATA_StudySessions.');
    }

    if (!auditSheet) {
      throw new Error('Không tìm thấy LOG_Audit.');
    }

    var before = {
      dataStudySessionsLastRow:
        sessionSheet.getLastRow(),
      logAuditLastRow:
        auditSheet.getLastRow()
    };

    var sessionRowNumber = 0;

    if (plan.sessionPlan.operationMode === 'UPDATE_EXISTING') {
      sessionRowNumber =
        plan.sessionPlan.targetRowNumber;

      sessionSheet
        .getRange(
          sessionRowNumber,
          1,
          1,
          plan.sessionPlan.rowValues.length
        )
        .setValues([
          plan.sessionPlan.rowValues
        ]);
    } else {
      sessionSheet.appendRow(
        plan.sessionPlan.rowValues
      );

      SpreadsheetApp.flush();

      sessionRowNumber =
        sessionSheet.getLastRow();
    }

    SpreadsheetApp.flush();

    var auditHeaderInfo =
      kidlearnV3_4d5InspectSheetHeaders_(
        spreadsheet,
        'LOG_Audit',
        []
      );

    var auditPlan =
      kidlearnV3_4d5BuildAuditRowPlan_(
        auditHeaderInfo,
        plan.normalizedPayload,
        plan.sessionPlan.sessionId,
        sessionRowNumber,
        plan.sessionPlan.operationMode
      );

    if (!auditPlan.success) {
      throw new Error(
        'Không build được audit row 4D-5. Errors=' +
        auditPlan.errors.join(' | ')
      );
    }

    auditSheet.appendRow(
      auditPlan.rowValues
    );

    SpreadsheetApp.flush();

    var auditRowNumber =
      auditSheet.getLastRow();

    var after = {
      dataStudySessionsLastRow:
        sessionSheet.getLastRow(),
      logAuditLastRow:
        auditSheet.getLastRow()
    };

    var writeRecord = {
      success: true,
      action: 'REAL_WRITE_DATA_STUDY_SESSIONS_4D_5_V3',
      phase:
        KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.PHASE,
      parentPhase:
        KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.PARENT_PHASE,
      status:
        KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_STATUS.READY_FOR_4D_6,
      writeName:
        KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.WRITE_NAME,
      environment: 'DEV',
      confirmUsed: confirmText,
      reviewerNote:
        String(options.reviewerNote || ''),
      targetSheet: 'DATA_StudySessions',
      auditSheet: 'LOG_Audit',
      operationMode:
        plan.sessionPlan.operationMode,
      sessionId:
        plan.sessionPlan.sessionId,
      auditId:
        auditPlan.auditId,
      sessionRowNumber:
        sessionRowNumber,
      auditRowNumber:
        auditRowNumber,
      sessionIdColumnIndex:
        plan.sessionPlan.sessionIdColumnIndex,
      auditIdColumnIndex:
        auditPlan.auditIdColumnIndex,
      before: before,
      after: after,
      rowDelta: {
        DATA_StudySessions:
          after.dataStudySessionsLastRow -
          before.dataStudySessionsLastRow,
        LOG_Audit:
          after.logAuditLastRow -
          before.logAuditLastRow
      },
      prodWriteAllowed: false,
      realWriteAllowed: true,
      actualSheetWritePerformed: true,
      studySessionWritePerformed: true,
      auditWritePerformed: true,
      dataResponsesWritePerformed: false,
      lessonProgressWritePerformed: false,
      nextBundle:
        KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.NEXT_STAGE,
      writtenAt:
        new Date().toISOString(),
      warnings:
        plan.warnings || []
    };

    kidlearnV3_4d5SaveWriteRecord_(
      writeRecord
    );

    kidlearnV3_4d5SaveStatus_(
      writeRecord,
      KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_STATUS.READY_FOR_4D_6,
      KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_KEYS.LAST_WRITE_AT
    );

    console.log(JSON.stringify(writeRecord, null, 2));

    return writeRecord;

  } finally {
    lock.releaseLock();
  }
}


/**
 * Verify last real write.
 */
function kidlearnV3_verifyLastStudySessionRealWrite4D5V3() {
  var properties =
    PropertiesService.getScriptProperties();

  var text =
    properties.getProperty(
      KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_KEYS.LAST_WRITE_JSON
    );

  if (!text) {
    throw new Error(
      'Không tìm thấy LAST_WRITE_JSON của 4D-5.'
    );
  }

  var lastWrite =
    JSON.parse(text);

  var errors = [];
  var warnings = [];

  var spreadsheet =
    kidlearnV3_4d5OpenSpreadsheet_();

  var sessionSheet =
    kidlearnV3_4d5GetSheetByExactName_(
      spreadsheet,
      'DATA_StudySessions'
    );

  var auditSheet =
    kidlearnV3_4d5GetSheetByExactName_(
      spreadsheet,
      'LOG_Audit'
    );

  if (!sessionSheet) {
    errors.push('Không tìm thấy DATA_StudySessions.');
  }

  if (!auditSheet) {
    errors.push('Không tìm thấy LOG_Audit.');
  }

  var sessionCheck = null;
  var auditCheck = null;

  if (sessionSheet) {
    sessionCheck =
      kidlearnV3_4d5VerifyRowContainsId_(
        sessionSheet,
        lastWrite.sessionRowNumber,
        lastWrite.sessionIdColumnIndex,
        lastWrite.sessionId,
        'DATA_StudySessions'
      );

    if (!sessionCheck.success) {
      errors =
        errors.concat(sessionCheck.errors || []);
    }
  }

  if (auditSheet) {
    auditCheck =
      kidlearnV3_4d5VerifyRowContainsId_(
        auditSheet,
        lastWrite.auditRowNumber,
        lastWrite.auditIdColumnIndex,
        lastWrite.auditId,
        'LOG_Audit'
      );

    if (!auditCheck.success) {
      errors =
        errors.concat(auditCheck.errors || []);
    }
  }

  var result = {
    success: errors.length === 0,
    action: 'VERIFY_LAST_STUDY_SESSION_REAL_WRITE_4D_5_V3',
    phase:
      KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_STATUS.READY_FOR_4D_6
        : KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_STATUS.FAILED,
    sessionCheck: sessionCheck,
    auditCheck: auditCheck,
    lastWriteSummary: {
      sessionId:
        lastWrite.sessionId,
      auditId:
        lastWrite.auditId,
      sessionRowNumber:
        lastWrite.sessionRowNumber,
      auditRowNumber:
        lastWrite.auditRowNumber,
      actualSheetWritePerformed:
        lastWrite.actualSheetWritePerformed
    },
    prodWriteAllowed: false,
    realWriteAllowed: true,
    actualSheetWritePerformed:
      lastWrite.actualSheetWritePerformed === true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4d5SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_KEYS.LAST_VERIFY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      'Verify 4D-5 failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getStudySessionRealWrite4D5StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_STUDY_SESSION_REAL_WRITE_4D_5_STATUS_V3',
    phase:
      KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_KEYS.STATUS
      ) ||
      KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_STATUS.NOT_RUN,
    lastPreflightAt:
      properties.getProperty(
        KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_KEYS.LAST_PREFLIGHT_AT
      ) || '',
    lastWriteAt:
      properties.getProperty(
        KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_KEYS.LAST_WRITE_AT
      ) || '',
    lastVerifyAt:
      properties.getProperty(
        KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_KEYS.LAST_VERIFY_AT
      ) || '',
    lastResult:
      kidlearnV3_4d5ReadJsonProperty_(
        KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_KEYS.LAST_RESULT_JSON
      ),
    lastWrite:
      kidlearnV3_4d5ReadJsonProperty_(
        KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_KEYS.LAST_WRITE_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready for 4D-6.
 */
function kidlearnV3_assertStudySessionRealWrite4D5ReadyV3() {
  var status =
    kidlearnV3_getStudySessionRealWrite4D5StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_STATUS.READY_FOR_4D_6
  ) {
    errors.push(
      '4D-5 chưa READY_FOR_4D_6. Status=' +
      status.status
    );
  }

  if (
    !status.lastWrite ||
    status.lastWrite.actualSheetWritePerformed !== true
  ) {
    errors.push(
      'Chưa có bằng chứng actualSheetWritePerformed=true cho 4D-5.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_STUDY_SESSION_REAL_WRITE_4D_5_READY_V3',
    phase:
      KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.PARENT_PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: true,
    actualSheetWritePerformed:
      status.lastWrite &&
      status.lastWrite.actualSheetWritePerformed === true,
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
 * Build full write plan.
 * Không ghi sheet.
 */
function kidlearnV3_4d5BuildRealWritePlan_(payload) {
  var errors = [];
  var warnings = [];

  var d4 =
    kidlearnV3_4d5SafeCall_(
      'kidlearnV3_assertLessonProgressRealWrite4D4ReadyV3'
    );

  if (!d4.success) {
    errors.push(
      '4D-4 chưa READY_FOR_4D_5: ' +
      d4.message
    );
  }

  var dev =
    kidlearnV3_4d5CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  warnings =
    warnings.concat(dev.warnings || []);

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4d5OpenSpreadsheet_();
  } catch (error) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(error.message || error)
    );
  }

  var normalized =
    kidlearnV3_4d5NormalizeSessionPayload_(payload);

  var sessionPlan = null;
  var auditPlan = null;

  if (spreadsheet) {
    var sessionSheet =
      kidlearnV3_4d5GetSheetByExactName_(
        spreadsheet,
        'DATA_StudySessions'
      );

    var sessionHeaderInfo =
      kidlearnV3_4d5InspectSheetHeaders_(
        spreadsheet,
        'DATA_StudySessions',
        warnings
      );

    var auditHeaderInfo =
      kidlearnV3_4d5InspectSheetHeaders_(
        spreadsheet,
        'LOG_Audit',
        warnings
      );

    if (!sessionHeaderInfo.exists || !sessionSheet) {
      errors.push('Không tìm thấy DATA_StudySessions.');
    } else {
      sessionPlan =
        kidlearnV3_4d5BuildSessionRowPlan_(
          sessionHeaderInfo,
          sessionSheet,
          normalized
        );

      if (!sessionPlan.success) {
        errors =
          errors.concat(sessionPlan.errors || []);
      }

      warnings =
        warnings.concat(sessionPlan.warnings || []);
    }

    if (!auditHeaderInfo.exists) {
      errors.push('Không tìm thấy LOG_Audit.');
    } else {
      auditPlan =
        kidlearnV3_4d5BuildAuditRowPlan_(
          auditHeaderInfo,
          normalized,
          sessionPlan ? sessionPlan.sessionId : '',
          sessionPlan ? sessionPlan.targetRowNumber : '',
          sessionPlan ? sessionPlan.operationMode : ''
        );

      if (!auditPlan.success) {
        errors =
          errors.concat(auditPlan.errors || []);
      }

      warnings =
        warnings.concat(auditPlan.warnings || []);
    }
  }

  return {
    success: errors.length === 0,
    action: 'BUILD_STUDY_SESSION_REAL_WRITE_PLAN_4D_5_V3',
    phase:
      KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.PARENT_PHASE,
    writeName:
      KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.WRITE_NAME,
    nextBundle:
      KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: true,
    actualSheetWritePerformed: false,
    normalizedPayload: normalized,
    devSafety: dev,
    sessionPlan: sessionPlan,
    auditPlan: auditPlan,
    errorCount: errors.length,
    warningCount:
      kidlearnV3_4d5UniqueArray_(warnings).length,
    errors: errors,
    warnings:
      kidlearnV3_4d5UniqueArray_(warnings)
  };
}


/**
 * Build DATA_StudySessions row.
 */
function kidlearnV3_4d5BuildSessionRowPlan_(
  headerInfo,
  sheet,
  payload
) {
  var errors = [];
  var warnings = [];

  var now =
    new Date().toISOString();

  var sessionId =
    payload.sessionId ||
    'SESS_4D5_DEV_' + new Date().getTime();

  var canonicalData = {
    sessionId: sessionId,
    childId: payload.childId,
    lessonId: payload.lessonId,
    subjectCode: payload.subjectCode,
    status: payload.status,
    startedAt: payload.startedAt,
    endedAt: payload.endedAt,
    durationSeconds: payload.durationSeconds,
    updatedAt: now
  };

  var aliasMap =
    kidlearnV3_4d5GetSessionFieldAliasMap_();

  var rowValues =
    kidlearnV3_4d5BuildBlankRow_(headerInfo.lastColumn);

  var matched = [];
  var unmapped = [];

  var sessionIdColumnIndex = 0;

  for (var key in canonicalData) {
    if (!canonicalData.hasOwnProperty(key)) continue;

    var match =
      kidlearnV3_4d5FindHeaderMatch_(
        headerInfo.headers,
        aliasMap[key] || [key]
      );

    if (match) {
      rowValues[match.columnIndex - 1] =
        canonicalData[key];

      if (key === 'sessionId') {
        sessionIdColumnIndex =
          match.columnIndex;
      }

      matched.push({
        canonical: key,
        matchedHeader: match.raw,
        columnIndex: match.columnIndex,
        valuePreview:
          kidlearnV3_4d5PreviewValue_(canonicalData[key])
      });
    } else {
      unmapped.push({
        canonical: key,
        valuePreview:
          kidlearnV3_4d5PreviewValue_(canonicalData[key])
      });
    }
  }

  var required = [
    'sessionId',
    'childId',
    'lessonId',
    'status',
    'startedAt'
  ];

  for (var i = 0; i < required.length; i++) {
    if (
      kidlearnV3_4d5IsUnmapped_(
        unmapped,
        required[i]
      )
    ) {
      errors.push(
        'DATA_StudySessions không map được required field: ' +
        required[i]
      );
    }
  }

  var existingRowNumber = 0;

  if (sessionIdColumnIndex > 0) {
    existingRowNumber =
      kidlearnV3_4d5FindExistingSessionRow_(
        sheet,
        headerInfo,
        sessionIdColumnIndex,
        sessionId
      );
  }

  var operationMode =
    existingRowNumber > 0
      ? 'UPDATE_EXISTING'
      : 'APPEND_NEW';

  var targetRowNumber =
    existingRowNumber > 0
      ? existingRowNumber
      : headerInfo.lastRow + 1;

  return {
    success: errors.length === 0,
    targetSheet: 'DATA_StudySessions',
    operation: 'CONTROLLED_DEV_APPEND_OR_UPDATE',
    operationMode: operationMode,
    willWriteNow: false,
    actualSheetWritePerformed: false,
    headerRowIndex: headerInfo.headerRowIndex,
    targetRowNumber: targetRowNumber,
    rowLength: rowValues.length,
    rowValues: rowValues,
    rowObjectByHeader:
      kidlearnV3_4d5BuildRowObjectByHeader_(
        headerInfo,
        rowValues
      ),
    sessionId: sessionId,
    sessionIdColumnIndex: sessionIdColumnIndex,
    matchedFieldCount: matched.length,
    unmappedFieldCount: unmapped.length,
    matchedFields: matched,
    unmappedFields: unmapped,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Build LOG_Audit row.
 */
function kidlearnV3_4d5BuildAuditRowPlan_(
  headerInfo,
  payload,
  sessionId,
  sessionRowNumber,
  operationMode
) {
  var errors = [];
  var warnings = [];

  var now =
    new Date().toISOString();

  var auditId =
    'AUD_4D5_DEV_' + new Date().getTime();

  var details = {
    phase: '4D-5',
    controlledDevRealWrite: true,
    targetSheet: 'DATA_StudySessions',
    sessionId: sessionId,
    sessionRowNumber: sessionRowNumber,
    operationMode: operationMode,
    childId: payload.childId,
    lessonId: payload.lessonId,
    subjectCode: payload.subjectCode,
    status: payload.status,
    startedAt: payload.startedAt,
    endedAt: payload.endedAt,
    durationSeconds: payload.durationSeconds,
    actualSheetWritePerformed: true,
    prodWriteAllowed: false,
    note:
      'Controlled DEV real write audit for DATA_StudySessions.'
  };

  var canonicalData = {
    auditId: auditId,
    action: 'REAL_WRITE_DATA_STUDY_SESSIONS_4D5',
    entityType: 'DATA_StudySessions',
    entityId: sessionId,
    detailsJson: JSON.stringify(details),
    createdAt: now,
    actorId: payload.childId,
    source: '4D-5',
    environment: 'DEV'
  };

  var aliasMap =
    kidlearnV3_4d5GetAuditFieldAliasMap_();

  var rowValues =
    kidlearnV3_4d5BuildBlankRow_(headerInfo.lastColumn);

  var matched = [];
  var unmapped = [];
  var auditIdColumnIndex = 0;

  for (var key in canonicalData) {
    if (!canonicalData.hasOwnProperty(key)) continue;

    var match =
      kidlearnV3_4d5FindHeaderMatch_(
        headerInfo.headers,
        aliasMap[key] || [key]
      );

    if (match) {
      rowValues[match.columnIndex - 1] =
        canonicalData[key];

      if (key === 'auditId') {
        auditIdColumnIndex =
          match.columnIndex;
      }

      matched.push({
        canonical: key,
        matchedHeader: match.raw,
        columnIndex: match.columnIndex,
        valuePreview:
          kidlearnV3_4d5PreviewValue_(canonicalData[key])
      });
    } else {
      unmapped.push({
        canonical: key,
        valuePreview:
          kidlearnV3_4d5PreviewValue_(canonicalData[key])
      });
    }
  }

  var required = [
    'auditId',
    'action',
    'entityType',
    'entityId',
    'detailsJson',
    'createdAt'
  ];

  for (var i = 0; i < required.length; i++) {
    if (
      kidlearnV3_4d5IsUnmapped_(
        unmapped,
        required[i]
      )
    ) {
      errors.push(
        'LOG_Audit không map được required field: ' +
        required[i]
      );
    }
  }

  return {
    success: errors.length === 0,
    targetSheet: 'LOG_Audit',
    operation: 'CONTROLLED_DEV_AUDIT_APPEND',
    willWriteNow: false,
    actualSheetWritePerformed: false,
    headerRowIndex: headerInfo.headerRowIndex,
    targetNextRow: headerInfo.lastRow + 1,
    rowLength: rowValues.length,
    rowValues: rowValues,
    rowObjectByHeader:
      kidlearnV3_4d5BuildRowObjectByHeader_(
        headerInfo,
        rowValues
      ),
    auditId: auditId,
    auditIdColumnIndex: auditIdColumnIndex,
    entityId: sessionId,
    matchedFieldCount: matched.length,
    unmappedFieldCount: unmapped.length,
    matchedFields: matched,
    unmappedFields: unmapped,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Sample payload.
 * Dùng sessionId test riêng để tránh đè phiên học thật.
 */
function kidlearnV3_4d5BuildSamplePayload_() {
  var now =
    new Date();

  var startedAt =
    new Date(now.getTime() - 6 * 60 * 1000).toISOString();

  var endedAt =
    now.toISOString();

  return {
    sessionId: '',
    childId: 'CHD_V2_CHILD_DEFAULT',
    lessonId: 'MATH_L1_4D5_DEV_TEST_' + now.getTime(),
    subjectCode: 'MATH',
    status: 'COMPLETED',
    startedAt: startedAt,
    endedAt: endedAt,
    durationSeconds: 360,
    updatedAt: endedAt
  };
}


/**
 * Normalize payload.
 */
function kidlearnV3_4d5NormalizeSessionPayload_(payload) {
  payload = payload || {};

  var durationSeconds =
    Number(payload.durationSeconds || 0);

  if (isNaN(durationSeconds)) {
    durationSeconds = 0;
  }

  if (durationSeconds < 0) {
    durationSeconds = 0;
  }

  return {
    sessionId:
      String(payload.sessionId || '').trim(),
    childId:
      String(payload.childId || 'CHD_V2_CHILD_DEFAULT').trim(),
    lessonId:
      String(payload.lessonId || '').trim(),
    subjectCode:
      String(payload.subjectCode || payload.subjectKey || '').trim(),
    status:
      String(payload.status || 'COMPLETED').trim().toUpperCase(),
    startedAt:
      String(payload.startedAt || new Date().toISOString()).trim(),
    endedAt:
      String(payload.endedAt || '').trim(),
    durationSeconds:
      durationSeconds,
    updatedAt:
      String(payload.updatedAt || new Date().toISOString()).trim()
  };
}


/**
 * Find existing session row by sessionId.
 */
function kidlearnV3_4d5FindExistingSessionRow_(
  sheet,
  headerInfo,
  sessionIdColumnIndex,
  sessionId
) {
  var startRow =
    headerInfo.dataStartRowIndex || headerInfo.headerRowIndex + 1;

  var lastRow =
    sheet.getLastRow();

  if (lastRow < startRow) {
    return 0;
  }

  var rowCount =
    lastRow - startRow + 1;

  var values =
    sheet
      .getRange(startRow, sessionIdColumnIndex, rowCount, 1)
      .getValues();

  for (var i = 0; i < rowCount; i++) {
    if (
      String(values[i][0]) === String(sessionId)
    ) {
      return startRow + i;
    }
  }

  return 0;
}


/**
 * DEV safety.
 */
function kidlearnV3_4d5CheckDevSafety_() {
  var errors = [];
  var warnings = [];

  var environment = '';

  try {
    if (
      typeof KIDLEARN_V3 !== 'undefined' &&
      KIDLEARN_V3 &&
      KIDLEARN_V3.SCRIPT_PROPERTIES &&
      KIDLEARN_V3.SCRIPT_PROPERTIES.ENVIRONMENT
    ) {
      environment =
        PropertiesService
          .getScriptProperties()
          .getProperty(
            KIDLEARN_V3.SCRIPT_PROPERTIES.ENVIRONMENT
          ) || '';
    }
  } catch (error) {
    // ignore
  }

  if (!environment) {
    environment =
      PropertiesService
        .getScriptProperties()
        .getProperty('KIDLEARN_V3_ENVIRONMENT') ||
      PropertiesService
        .getScriptProperties()
        .getProperty('ENVIRONMENT') ||
      '';
  }

  if (
    String(environment || '').toUpperCase() !== 'DEV'
  ) {
    errors.push(
      'Environment không phải DEV. Current=' +
      (environment || 'UNKNOWN')
    );
  }

  return {
    success: errors.length === 0,
    environment: environment || 'UNKNOWN',
    prodWriteAllowed: false,
    realWriteAllowed: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Verify helper.
 */
function kidlearnV3_4d5VerifyRowContainsId_(
  sheet,
  rowNumber,
  idColumnIndex,
  expectedId,
  label
) {
  var errors = [];

  if (!rowNumber || rowNumber < 1) {
    errors.push(label + ': rowNumber không hợp lệ.');
  }

  if (!idColumnIndex || idColumnIndex < 1) {
    errors.push(label + ': idColumnIndex không hợp lệ.');
  }

  if (!expectedId) {
    errors.push(label + ': expectedId trống.');
  }

  if (errors.length > 0) {
    return {
      success: false,
      label: label,
      errors: errors
    };
  }

  var value =
    sheet
      .getRange(rowNumber, idColumnIndex)
      .getValue();

  if (String(value) !== String(expectedId)) {
    errors.push(
      label +
      ': ID không khớp. Expected=' +
      expectedId +
      ', Actual=' +
      value
    );
  }

  return {
    success: errors.length === 0,
    label: label,
    rowNumber: rowNumber,
    idColumnIndex: idColumnIndex,
    expectedId: expectedId,
    actualValue: value,
    errors: errors
  };
}


/**
 * Header helpers.
 */
function kidlearnV3_4d5InspectSheetHeaders_(spreadsheet, sheetName, warnings) {
  warnings = warnings || [];

  if (
    typeof kidlearnV3_4d1InspectSheetHeaders_ === 'function'
  ) {
    return kidlearnV3_4d1InspectSheetHeaders_(
      spreadsheet,
      sheetName,
      warnings
    );
  }

  var sheet =
    kidlearnV3_4d5GetSheetByExactName_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return {
      exists: false,
      sheetName: sheetName,
      headerRowIndex: 0,
      dataStartRowIndex: 0,
      headerCount: 0,
      lastRow: 0,
      lastColumn: 0,
      headers: []
    };
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (lastRow < 1 || lastColumn < 1) {
    return {
      exists: true,
      sheetName: sheetName,
      headerRowIndex: 1,
      dataStartRowIndex: 2,
      headerCount: 0,
      lastRow: lastRow,
      lastColumn: lastColumn,
      headers: []
    };
  }

  var values =
    sheet
      .getRange(1, 1, Math.min(2, lastRow), lastColumn)
      .getValues();

  var headerRowIndex = 1;

  if (
    values.length > 1 &&
    kidlearnV3_4d5HeaderScore_(values[1]) >=
      kidlearnV3_4d5HeaderScore_(values[0]) &&
    kidlearnV3_4d5HeaderScore_(values[1]) >= 3
  ) {
    headerRowIndex = 2;
  }

  var row =
    values[headerRowIndex - 1] || [];

  var headers = [];

  for (var i = 0; i < row.length; i++) {
    var raw =
      String(row[i] || '').trim();

    if (!raw) continue;

    headers.push({
      columnIndex: i + 1,
      raw: raw,
      normalized:
        kidlearnV3_4d5NormalizeLookupKey_(raw)
    });
  }

  return {
    exists: true,
    sheetName: sheetName,
    headerRowIndex: headerRowIndex,
    dataStartRowIndex: headerRowIndex + 1,
    headerCount: headers.length,
    lastRow: lastRow,
    lastColumn: lastColumn,
    headers: headers
  };
}


function kidlearnV3_4d5HeaderScore_(row) {
  var score = 0;

  for (var i = 0; i < row.length; i++) {
    var value =
      String(row[i] || '').trim();

    if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
      score++;
    }
  }

  return score;
}


function kidlearnV3_4d5FindHeaderMatch_(headers, aliases) {
  var map = {};

  for (var i = 0; i < aliases.length; i++) {
    map[
      kidlearnV3_4d5NormalizeLookupKey_(aliases[i])
    ] = true;
  }

  for (var j = 0; j < headers.length; j++) {
    if (map[headers[j].normalized]) {
      return headers[j];
    }
  }

  return null;
}


function kidlearnV3_4d5BuildBlankRow_(length) {
  var row = [];

  for (var i = 0; i < length; i++) {
    row.push('');
  }

  return row;
}


function kidlearnV3_4d5BuildRowObjectByHeader_(headerInfo, rowValues) {
  var obj = {};
  var headers = headerInfo.headers || [];

  for (var i = 0; i < headers.length; i++) {
    obj[headers[i].raw] =
      rowValues[headers[i].columnIndex - 1] || '';
  }

  return obj;
}


function kidlearnV3_4d5IsUnmapped_(unmapped, canonical) {
  for (var i = 0; i < unmapped.length; i++) {
    if (unmapped[i].canonical === canonical) {
      return true;
    }
  }

  return false;
}


/**
 * Alias maps.
 */
function kidlearnV3_4d5GetSessionFieldAliasMap_() {
  return {
    sessionId: [
      'sessionId',
      'sessionid',
      'studySessionId',
      'studysessionid',
      'id',
      'maPhienHoc',
      'maphienhoc'
    ],
    childId: [
      'childId',
      'childid',
      'child',
      'studentId',
      'studentid',
      'learnerId',
      'learnerid',
      'maChild',
      'machild'
    ],
    lessonId: [
      'lessonId',
      'lessonid',
      'lesson',
      'maBaiHoc',
      'mabaihoc'
    ],
    subjectCode: [
      'subjectCode',
      'subjectcode',
      'subjectId',
      'subjectid',
      'maMonHoc',
      'mamonhoc'
    ],
    status: [
      'status',
      'sessionStatus',
      'sessionstatus',
      'trangThai',
      'trangthai'
    ],
    startedAt: [
      'startedAt',
      'startedat',
      'startTime',
      'starttime',
      'createdAt',
      'createdat'
    ],
    endedAt: [
      'endedAt',
      'endedat',
      'endTime',
      'endtime',
      'completedAt',
      'completedat'
    ],
    durationSeconds: [
      'durationSeconds',
      'durationseconds',
      'duration',
      'durationSec',
      'durationsec',
      'seconds'
    ],
    updatedAt: [
      'updatedAt',
      'updatedat',
      'modifiedAt',
      'modifiedat'
    ]
  };
}


function kidlearnV3_4d5GetAuditFieldAliasMap_() {
  if (
    typeof kidlearnV3_4d4GetAuditFieldAliasMap_ === 'function'
  ) {
    return kidlearnV3_4d4GetAuditFieldAliasMap_();
  }

  if (
    typeof kidlearnV3_4d3GetAuditFieldAliasMap_ === 'function'
  ) {
    return kidlearnV3_4d3GetAuditFieldAliasMap_();
  }

  if (
    typeof kidlearnV3_4d2GetAuditFieldAliasMap_ === 'function'
  ) {
    return kidlearnV3_4d2GetAuditFieldAliasMap_();
  }

  return {
    auditId: ['auditId', 'auditid', 'logId', 'logid', 'id'],
    action: ['action', 'actionType', 'event', 'operation'],
    entityType: ['entityType', 'targetSheet', 'sheetName', 'objectType'],
    entityId: ['entityId', 'targetId', 'objectId', 'recordId'],
    detailsJson: ['detailsJson', 'payloadJson', 'metaJson', 'description'],
    createdAt: ['createdAt', 'timestamp', 'time', 'loggedAt'],
    actorId: ['actorId', 'userId'],
    source: ['source', 'module', 'phase'],
    environment: ['environment', 'env']
  };
}


/**
 * Spreadsheet helpers.
 */
function kidlearnV3_4d5OpenSpreadsheet_() {
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


function kidlearnV3_4d5GetSheetByExactName_(spreadsheet, sheetName) {
  if (
    typeof kidlearnV3_getSheetByExactName_ === 'function'
  ) {
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


/**
 * Generic helpers.
 */
function kidlearnV3_4d5NormalizeLookupKey_(value) {
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


function kidlearnV3_4d5PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 120) {
    return text.substring(0, 120) + '...';
  }

  return text;
}


function kidlearnV3_4d5UniqueArray_(items) {
  var map = {};
  var result = [];

  for (var i = 0; i < items.length; i++) {
    var value =
      String(items[i] || '');

    if (!value) continue;

    if (!map[value]) {
      map[value] = true;
      result.push(value);
    }
  }

  return result;
}


function kidlearnV3_4d5SafeCall_(functionName) {
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


function kidlearnV3_4d5SaveWriteRecord_(writeRecord) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_KEYS.LAST_WRITE_JSON,
      JSON.stringify(writeRecord)
    );
}


function kidlearnV3_4d5SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.PARENT_PHASE,
      status: status,
      writeName:
        KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.WRITE_NAME,
      nextBundle:
        KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_STUDY_SESSION_REAL_WRITE_4D5_CONFIG.NEXT_STAGE,
      prodWriteAllowed: false,
      realWriteAllowed: true,
      actualSheetWritePerformed:
        result.actualSheetWritePerformed === true,
      targetSheet:
        result.targetSheet || 'DATA_StudySessions',
      auditSheet:
        result.auditSheet || 'LOG_Audit',
      sessionId:
        result.sessionId || '',
      auditId:
        result.auditId || '',
      sessionRowNumber:
        result.sessionRowNumber || '',
      auditRowNumber:
        result.auditRowNumber || '',
      rowDelta:
        result.rowDelta || null,
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


function kidlearnV3_4d5ReadJsonProperty_(key) {
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