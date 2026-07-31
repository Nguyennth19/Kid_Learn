/**
 * ================================================================
 * KIDLEARN V3 - CONTROLLED DEV REAL WRITE: DATA_RESPONSES
 * Step: 4D-3
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Controlled DEV real write into DATA_Responses.
 * - Append audit row into LOG_Audit.
 * - Verify the written rows.
 *
 * Safety:
 * - Chỉ ghi DEV.
 * - Không ghi PROD.
 * - Cần confirm text rõ ràng.
 * - Ghi 01 response test row + 01 audit row.
 * - Không ghi DATA_LessonProgress.
 * - Không ghi DATA_StudySessions.
 */


var KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4D3_STATUS',
  LAST_PREFLIGHT_AT: 'KIDLEARN_V3_PHASE_4D3_LAST_PREFLIGHT_AT',
  LAST_WRITE_AT: 'KIDLEARN_V3_PHASE_4D3_LAST_WRITE_AT',
  LAST_VERIFY_AT: 'KIDLEARN_V3_PHASE_4D3_LAST_VERIFY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4D3_LAST_RESULT_JSON',
  LAST_WRITE_JSON: 'KIDLEARN_V3_PHASE_4D3_LAST_WRITE_JSON'
};


var KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREFLIGHT_PASSED: 'PREFLIGHT_PASSED',
  READY_FOR_4D_4: 'READY_FOR_4D_4',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG = {
  PHASE: '4D-3',
  PARENT_PHASE: '4D',
  PREVIOUS_BUNDLE: '4D-2',
  NEXT_BUNDLE: '4D-4',
  NEXT_STAGE: 'CONTROLLED_DEV_REAL_WRITE_DATA_LESSON_PROGRESS',
  WRITE_NAME: 'CONTROLLED_DEV_REAL_WRITE_DATA_RESPONSES',
  CONFIRM_TEXT: 'CONFIRM_REAL_WRITE_DATA_RESPONSES_4D3',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: true
};


/**
 * Preview real write row.
 * Không ghi sheet.
 */
function kidlearnV3_previewResponseRealWrite4D3V3(payload) {
  payload =
    payload ||
    kidlearnV3_4d3BuildSamplePayload_();

  var preflight =
    kidlearnV3_4d3BuildRealWritePlan_(payload);

  preflight.action =
    'PREVIEW_RESPONSE_REAL_WRITE_4D_3_V3';

  kidlearnV3_4d3SaveStatus_(
    preflight,
    preflight.success
      ? KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_STATUS.PREFLIGHT_PASSED
      : KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_STATUS.FAILED,
    KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_KEYS.LAST_PREFLIGHT_AT
  );

  console.log(JSON.stringify({
    success: preflight.success,
    action: preflight.action,
    phase: preflight.phase,
    willWriteNow: false,
    targetSheet: 'DATA_Responses',
    auditSheet: 'LOG_Audit',
    responseTargetNextRow:
      preflight.responsePlan
        ? preflight.responsePlan.targetNextRow
        : '',
    auditTargetNextRow:
      preflight.auditPlan
        ? preflight.auditPlan.targetNextRow
        : '',
    prodWriteAllowed: false,
    realWriteAllowed: true,
    actualSheetWritePerformed: false,
    errorCount: preflight.errorCount,
    warningCount: preflight.warningCount,
    errors: preflight.errors,
    warnings: preflight.warnings
  }, null, 2));

  if (!preflight.success) {
    throw new Error(
      '4D-3 preview failed. Errors=' +
      preflight.errors.join(' | ')
    );
  }

  return preflight;
}


/**
 * Preflight only.
 * Không ghi sheet.
 */
function kidlearnV3_runResponseRealWritePreflight4D3V3() {
  var result =
    kidlearnV3_previewResponseRealWrite4D3V3(
      kidlearnV3_4d3BuildSamplePayload_()
    );

  result.action =
    'RUN_RESPONSE_REAL_WRITE_PREFLIGHT_4D_3_V3';

  kidlearnV3_4d3SaveStatus_(
    result,
    KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_STATUS.PREFLIGHT_PASSED,
    KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_KEYS.LAST_PREFLIGHT_AT
  );

  console.log(JSON.stringify({
    success: result.success,
    action: result.action,
    phase: result.phase,
    status:
      KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_STATUS.PREFLIGHT_PASSED,
    nextAction:
      'Run kidlearnV3_realWriteDataResponses4D3ConfirmV3 to append one DEV test response row.',
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
 * Ghi thật 01 dòng DATA_Responses + 01 dòng LOG_Audit trên DEV.
 */
function kidlearnV3_realWriteDataResponses4D3ConfirmV3() {
  return kidlearnV3_realWriteDataResponses4D3V3({
    confirm:
      KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.CONFIRM_TEXT,
    payload:
      kidlearnV3_4d3BuildSamplePayload_(),
    reviewerNote:
      'Controlled DEV real write for DATA_Responses. One test response row and one audit row.'
  });
}


/**
 * Controlled DEV real write.
 */
function kidlearnV3_realWriteDataResponses4D3V3(options) {
  options = options || {};

  var confirmText =
    String(options.confirm || '')
      .trim()
      .toUpperCase();

  if (
    confirmText !==
    KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm. Cần confirm=' +
      KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.CONFIRM_TEXT
    );
  }

  var payload =
    options.payload ||
    kidlearnV3_4d3BuildSamplePayload_();

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
      kidlearnV3_4d3BuildRealWritePlan_(payload);

    if (!plan.success) {
      throw new Error(
        'Preflight 4D-3 chưa pass. Errors=' +
        plan.errors.join(' | ')
      );
    }

    var spreadsheet =
      kidlearnV3_4d3OpenSpreadsheet_();

    var responseSheet =
      kidlearnV3_4d3GetSheetByExactName_(
        spreadsheet,
        'DATA_Responses'
      );

    var auditSheet =
      kidlearnV3_4d3GetSheetByExactName_(
        spreadsheet,
        'LOG_Audit'
      );

    if (!responseSheet) {
      throw new Error('Không tìm thấy DATA_Responses.');
    }

    if (!auditSheet) {
      throw new Error('Không tìm thấy LOG_Audit.');
    }

    var before = {
      dataResponsesLastRow:
        responseSheet.getLastRow(),
      logAuditLastRow:
        auditSheet.getLastRow()
    };

    /**
     * Append DATA_Responses row.
     */
    responseSheet.appendRow(
      plan.responsePlan.rowValues
    );

    SpreadsheetApp.flush();

    var responseRowNumber =
      responseSheet.getLastRow();

    /**
     * Build audit row after response append,
     * so detailsJson can include the actual response row number.
     */
    var auditHeaderInfo =
      kidlearnV3_4d3InspectSheetHeaders_(
        spreadsheet,
        'LOG_Audit',
        []
      );

    var auditPlan =
      kidlearnV3_4d3BuildAuditRowPlan_(
        auditHeaderInfo,
        plan.normalizedPayload,
        plan.responsePlan.responseId,
        responseRowNumber
      );

    if (!auditPlan.success) {
      throw new Error(
        'Không build được audit row. Errors=' +
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
      dataResponsesLastRow:
        responseSheet.getLastRow(),
      logAuditLastRow:
        auditSheet.getLastRow()
    };

    var writeRecord = {
      success: true,
      action: 'REAL_WRITE_DATA_RESPONSES_4D_3_V3',
      phase:
        KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.PHASE,
      parentPhase:
        KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.PARENT_PHASE,
      status:
        KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_STATUS.READY_FOR_4D_4,
      writeName:
        KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.WRITE_NAME,
      environment: 'DEV',
      confirmUsed: confirmText,
      reviewerNote:
        String(options.reviewerNote || ''),
      targetSheet: 'DATA_Responses',
      auditSheet: 'LOG_Audit',
      responseId:
        plan.responsePlan.responseId,
      auditId:
        auditPlan.auditId,
      responseRowNumber:
        responseRowNumber,
      auditRowNumber:
        auditRowNumber,
      responseIdColumnIndex:
        plan.responsePlan.responseIdColumnIndex,
      auditIdColumnIndex:
        auditPlan.auditIdColumnIndex,
      before: before,
      after: after,
      rowDelta: {
        DATA_Responses:
          after.dataResponsesLastRow -
          before.dataResponsesLastRow,
        LOG_Audit:
          after.logAuditLastRow -
          before.logAuditLastRow
      },
      prodWriteAllowed: false,
      realWriteAllowed: true,
      actualSheetWritePerformed: true,
      dataResponsesWritePerformed: true,
      auditWritePerformed: true,
      lessonProgressWritePerformed: false,
      studySessionWritePerformed: false,
      nextBundle:
        KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.NEXT_STAGE,
      writtenAt:
        new Date().toISOString(),
      warnings:
        plan.warnings || []
    };

    kidlearnV3_4d3SaveWriteRecord_(
      writeRecord
    );

    kidlearnV3_4d3SaveStatus_(
      writeRecord,
      KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_STATUS.READY_FOR_4D_4,
      KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_KEYS.LAST_WRITE_AT
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
function kidlearnV3_verifyLastResponseRealWrite4D3V3() {
  var properties =
    PropertiesService.getScriptProperties();

  var text =
    properties.getProperty(
      KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_KEYS.LAST_WRITE_JSON
    );

  if (!text) {
    throw new Error(
      'Không tìm thấy LAST_WRITE_JSON của 4D-3.'
    );
  }

  var lastWrite =
    JSON.parse(text);

  var errors = [];
  var warnings = [];

  var spreadsheet =
    kidlearnV3_4d3OpenSpreadsheet_();

  var responseSheet =
    kidlearnV3_4d3GetSheetByExactName_(
      spreadsheet,
      'DATA_Responses'
    );

  var auditSheet =
    kidlearnV3_4d3GetSheetByExactName_(
      spreadsheet,
      'LOG_Audit'
    );

  if (!responseSheet) {
    errors.push('Không tìm thấy DATA_Responses.');
  }

  if (!auditSheet) {
    errors.push('Không tìm thấy LOG_Audit.');
  }

  var responseCheck = null;
  var auditCheck = null;

  if (responseSheet) {
    responseCheck =
      kidlearnV3_4d3VerifyRowContainsId_(
        responseSheet,
        lastWrite.responseRowNumber,
        lastWrite.responseIdColumnIndex,
        lastWrite.responseId,
        'DATA_Responses'
      );

    if (!responseCheck.success) {
      errors =
        errors.concat(responseCheck.errors || []);
    }
  }

  if (auditSheet) {
    auditCheck =
      kidlearnV3_4d3VerifyRowContainsId_(
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
    action: 'VERIFY_LAST_RESPONSE_REAL_WRITE_4D_3_V3',
    phase:
      KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_STATUS.READY_FOR_4D_4
        : KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_STATUS.FAILED,
    responseCheck: responseCheck,
    auditCheck: auditCheck,
    lastWriteSummary: {
      responseId:
        lastWrite.responseId,
      auditId:
        lastWrite.auditId,
      responseRowNumber:
        lastWrite.responseRowNumber,
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

  kidlearnV3_4d3SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_KEYS.LAST_VERIFY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      'Verify 4D-3 failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getResponseRealWrite4D3StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_RESPONSE_REAL_WRITE_4D_3_STATUS_V3',
    phase:
      KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_KEYS.STATUS
      ) ||
      KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_STATUS.NOT_RUN,
    lastPreflightAt:
      properties.getProperty(
        KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_KEYS.LAST_PREFLIGHT_AT
      ) || '',
    lastWriteAt:
      properties.getProperty(
        KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_KEYS.LAST_WRITE_AT
      ) || '',
    lastVerifyAt:
      properties.getProperty(
        KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_KEYS.LAST_VERIFY_AT
      ) || '',
    lastResult:
      kidlearnV3_4d3ReadJsonProperty_(
        KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_KEYS.LAST_RESULT_JSON
      ),
    lastWrite:
      kidlearnV3_4d3ReadJsonProperty_(
        KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_KEYS.LAST_WRITE_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready for 4D-4.
 */
function kidlearnV3_assertResponseRealWrite4D3ReadyV3() {
  var status =
    kidlearnV3_getResponseRealWrite4D3StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_STATUS.READY_FOR_4D_4
  ) {
    errors.push(
      '4D-3 chưa READY_FOR_4D_4. Status=' +
      status.status
    );
  }

  if (
    !status.lastWrite ||
    status.lastWrite.actualSheetWritePerformed !== true
  ) {
    errors.push(
      'Chưa có bằng chứng actualSheetWritePerformed=true cho 4D-3.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_RESPONSE_REAL_WRITE_4D_3_READY_V3',
    phase:
      KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.PARENT_PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.NEXT_BUNDLE,
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
function kidlearnV3_4d3BuildRealWritePlan_(payload) {
  var errors = [];
  var warnings = [];

  var d2 =
    kidlearnV3_4d3SafeCall_(
      'kidlearnV3_assertResponseWriteDryRun4D2ReadyV3'
    );

  if (!d2.success) {
    errors.push(
      '4D-2 chưa READY_FOR_4D_3: ' +
      d2.message
    );
  }

  var dev =
    kidlearnV3_4d3CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  warnings =
    warnings.concat(dev.warnings || []);

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4d3OpenSpreadsheet_();
  } catch (error) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(error.message || error)
    );
  }

  var normalized =
    kidlearnV3_4d3NormalizeResponsePayload_(payload);

  var responsePlan = null;
  var auditPlan = null;

  if (spreadsheet) {
    var responseHeaderInfo =
      kidlearnV3_4d3InspectSheetHeaders_(
        spreadsheet,
        'DATA_Responses',
        warnings
      );

    var auditHeaderInfo =
      kidlearnV3_4d3InspectSheetHeaders_(
        spreadsheet,
        'LOG_Audit',
        warnings
      );

    if (!responseHeaderInfo.exists) {
      errors.push('Không tìm thấy DATA_Responses.');
    } else {
      responsePlan =
        kidlearnV3_4d3BuildResponseRowPlan_(
          responseHeaderInfo,
          normalized
        );

      if (!responsePlan.success) {
        errors =
          errors.concat(responsePlan.errors || []);
      }

      warnings =
        warnings.concat(responsePlan.warnings || []);
    }

    if (!auditHeaderInfo.exists) {
      errors.push('Không tìm thấy LOG_Audit.');
    } else {
      auditPlan =
        kidlearnV3_4d3BuildAuditRowPlan_(
          auditHeaderInfo,
          normalized,
          responsePlan ? responsePlan.responseId : '',
          responseHeaderInfo ? responseHeaderInfo.lastRow + 1 : ''
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
    action: 'BUILD_RESPONSE_REAL_WRITE_PLAN_4D_3_V3',
    phase:
      KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.PARENT_PHASE,
    writeName:
      KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.WRITE_NAME,
    nextBundle:
      KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: true,
    actualSheetWritePerformed: false,
    normalizedPayload: normalized,
    devSafety: dev,
    responsePlan: responsePlan,
    auditPlan: auditPlan,
    errorCount: errors.length,
    warningCount: kidlearnV3_4d3UniqueArray_(warnings).length,
    errors: errors,
    warnings: kidlearnV3_4d3UniqueArray_(warnings)
  };
}


/**
 * Build DATA_Responses row.
 */
function kidlearnV3_4d3BuildResponseRowPlan_(headerInfo, payload) {
  var errors = [];
  var warnings = [];

  var now =
    new Date().toISOString();

  var responseId =
    payload.responseId ||
    'RESP_4D3_DEV_' + new Date().getTime();

  var canonicalData = {
    responseId: responseId,
    childId: payload.childId,
    lessonId: payload.lessonId,
    activityId: payload.activityId,
    answerMode: payload.answerMode,
    answerText: payload.answerText,
    selectedOptionId: payload.selectedOptionId,
    selectedOptionLabel: payload.selectedOptionLabel,
    expectedAnswer: payload.expectedAnswer,
    isCorrect: payload.isCorrect,
    score: payload.score,
    status: 'SUBMITTED_DEV_TEST_4D3',
    submittedAt: now,
    createdAt: now,
    updatedAt: now,
    attemptId: payload.attemptId || 'ATT_4D3_DEV_TEST',
    answerMetaJson: JSON.stringify({
      phase: '4D-3',
      controlledDevRealWrite: true,
      childId: payload.childId,
      lessonId: payload.lessonId,
      activityId: payload.activityId,
      subjectCode: payload.subjectCode,
      answerMode: payload.answerMode,
      selectedOptionId: payload.selectedOptionId,
      selectedOptionLabel: payload.selectedOptionLabel,
      expectedAnswer: payload.expectedAnswer,
      isCorrect: payload.isCorrect,
      score: payload.score,
      canvasHasInk: payload.canvasHasInk,
      canvasDataUrlLength: payload.canvasDataUrlLength,
      source: 'CONTROLLED_DEV_REAL_WRITE_DATA_RESPONSES',
      note:
        'This is a controlled DEV test response row from Phase 4D-3.'
    })
  };

  var aliasMap =
    kidlearnV3_4d3GetResponseFieldAliasMap_();

  var rowValues =
    kidlearnV3_4d3BuildBlankRow_(headerInfo.lastColumn);

  var matched = [];
  var unmapped = [];

  var responseIdColumnIndex = 0;

  for (var key in canonicalData) {
    if (!canonicalData.hasOwnProperty(key)) continue;

    var match =
      kidlearnV3_4d3FindHeaderMatch_(
        headerInfo.headers,
        aliasMap[key] || [key]
      );

    if (match) {
      rowValues[match.columnIndex - 1] =
        canonicalData[key];

      if (key === 'responseId') {
        responseIdColumnIndex =
          match.columnIndex;
      }

      matched.push({
        canonical: key,
        matchedHeader: match.raw,
        columnIndex: match.columnIndex,
        valuePreview:
          kidlearnV3_4d3PreviewValue_(canonicalData[key])
      });
    } else {
      unmapped.push({
        canonical: key,
        valuePreview:
          kidlearnV3_4d3PreviewValue_(canonicalData[key])
      });
    }
  }

  var requiredForRealWrite = [
    'responseId',
    'answerText',
    'status'
  ];

  for (var i = 0; i < requiredForRealWrite.length; i++) {
    if (
      kidlearnV3_4d3IsUnmapped_(
        unmapped,
        requiredForRealWrite[i]
      )
    ) {
      errors.push(
        'DATA_Responses không map được required field cho real write: ' +
        requiredForRealWrite[i]
      );
    }
  }

  var criticalFields = [
    'childId',
    'lessonId',
    'activityId',
    'answerMode'
  ];

  var criticalUnmapped = [];

  for (var c = 0; c < criticalFields.length; c++) {
    if (
      kidlearnV3_4d3IsUnmapped_(
        unmapped,
        criticalFields[c]
      )
    ) {
      criticalUnmapped.push(criticalFields[c]);
    }
  }

  var metaColumn =
    kidlearnV3_4d3FindHeaderMatch_(
      headerInfo.headers,
      aliasMap.answerMetaJson
    );

  if (criticalUnmapped.length > 0 && !metaColumn) {
    errors.push(
      'DATA_Responses thiếu cột riêng cho ' +
      criticalUnmapped.join(', ') +
      ' và không có answerMetaJson/detailsJson. Dừng real write để tránh mất traceability.'
    );
  }

  if (criticalUnmapped.length > 0 && metaColumn) {
    warnings.push(
      'DATA_Responses thiếu cột riêng cho ' +
      criticalUnmapped.join(', ') +
      '. Các field này sẽ được lưu trong metadata column: ' +
      metaColumn.raw
    );
  }

  return {
    success: errors.length === 0,
    targetSheet: 'DATA_Responses',
    operation: 'CONTROLLED_DEV_APPEND',
    willWriteNow: false,
    actualSheetWritePerformed: false,
    headerRowIndex: headerInfo.headerRowIndex,
    targetNextRow: headerInfo.lastRow + 1,
    rowLength: rowValues.length,
    rowValues: rowValues,
    rowObjectByHeader:
      kidlearnV3_4d3BuildRowObjectByHeader_(
        headerInfo,
        rowValues
      ),
    responseId: responseId,
    responseIdColumnIndex: responseIdColumnIndex,
    matchedFieldCount: matched.length,
    unmappedFieldCount: unmapped.length,
    matchedFields: matched,
    unmappedFields: unmapped,
    criticalUnmappedFields: criticalUnmapped,
    metadataColumnDetected: metaColumn
      ? {
          header: metaColumn.raw,
          columnIndex: metaColumn.columnIndex
        }
      : null,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Build LOG_Audit row.
 */
function kidlearnV3_4d3BuildAuditRowPlan_(
  headerInfo,
  payload,
  responseId,
  responseRowNumber
) {
  var errors = [];
  var warnings = [];

  var now =
    new Date().toISOString();

  var auditId =
    'AUD_4D3_DEV_' + new Date().getTime();

  var details = {
    phase: '4D-3',
    controlledDevRealWrite: true,
    targetSheet: 'DATA_Responses',
    responseId: responseId,
    responseRowNumber: responseRowNumber,
    childId: payload.childId,
    lessonId: payload.lessonId,
    activityId: payload.activityId,
    answerMode: payload.answerMode,
    actualSheetWritePerformed: true,
    prodWriteAllowed: false,
    note:
      'Controlled DEV real write audit for DATA_Responses.'
  };

  var canonicalData = {
    auditId: auditId,
    action: 'REAL_WRITE_DATA_RESPONSES_4D3',
    entityType: 'DATA_Responses',
    entityId: responseId,
    detailsJson: JSON.stringify(details),
    createdAt: now,
    actorId: payload.childId,
    source: '4D-3',
    environment: 'DEV'
  };

  var aliasMap =
    kidlearnV3_4d3GetAuditFieldAliasMap_();

  var rowValues =
    kidlearnV3_4d3BuildBlankRow_(headerInfo.lastColumn);

  var matched = [];
  var unmapped = [];
  var auditIdColumnIndex = 0;

  for (var key in canonicalData) {
    if (!canonicalData.hasOwnProperty(key)) continue;

    var match =
      kidlearnV3_4d3FindHeaderMatch_(
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
          kidlearnV3_4d3PreviewValue_(canonicalData[key])
      });
    } else {
      unmapped.push({
        canonical: key,
        valuePreview:
          kidlearnV3_4d3PreviewValue_(canonicalData[key])
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
      kidlearnV3_4d3IsUnmapped_(
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
      kidlearnV3_4d3BuildRowObjectByHeader_(
        headerInfo,
        rowValues
      ),
    auditId: auditId,
    auditIdColumnIndex: auditIdColumnIndex,
    entityId: responseId,
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
 * Sample payload for one controlled DEV write.
 */
function kidlearnV3_4d3BuildSamplePayload_() {
  return {
    childId: 'CHD_V2_CHILD_DEFAULT',
    lessonId: 'MATH_L1',
    activityId: 'MATH_L1_ACT_1',
    subjectCode: 'MATH',
    answerMode: 'BUTTON_INPUT',
    answerText: '13',
    selectedOptionId: '',
    selectedOptionLabel: '',
    expectedAnswer: '13',
    isCorrect: true,
    score: 1,
    canvasHasInk: false,
    canvasDataUrlLength: 0
  };
}


/**
 * Normalize payload.
 */
function kidlearnV3_4d3NormalizeResponsePayload_(payload) {
  if (
    typeof kidlearnV3_4d2NormalizeResponsePayload_ === 'function'
  ) {
    return kidlearnV3_4d2NormalizeResponsePayload_(
      payload || {}
    );
  }

  payload = payload || {};

  var answerText =
    String(payload.answerText || '').trim();

  var expectedAnswer =
    String(payload.expectedAnswer || '').trim();

  var isCorrect =
    payload.isCorrect;

  if (
    isCorrect === null ||
    isCorrect === undefined ||
    String(isCorrect) === ''
  ) {
    if (answerText && expectedAnswer) {
      isCorrect =
        kidlearnV3_4d3NormalizeAnswerText_(answerText) ===
        kidlearnV3_4d3NormalizeAnswerText_(expectedAnswer);
    } else {
      isCorrect = '';
    }
  }

  return {
    responseId:
      String(payload.responseId || '').trim(),
    childId:
      String(payload.childId || 'CHD_V2_CHILD_DEFAULT').trim(),
    lessonId:
      String(payload.lessonId || '').trim(),
    activityId:
      String(payload.activityId || '').trim(),
    subjectCode:
      String(payload.subjectCode || payload.subjectKey || '').trim(),
    answerMode:
      String(payload.answerMode || 'UNKNOWN').trim().toUpperCase(),
    answerText: answerText,
    selectedOptionId:
      String(payload.selectedOptionId || '').trim(),
    selectedOptionLabel:
      String(payload.selectedOptionLabel || '').trim(),
    expectedAnswer: expectedAnswer,
    isCorrect: isCorrect,
    score:
      payload.score === null ||
      payload.score === undefined
        ? ''
        : payload.score,
    canvasHasInk:
      payload.canvasHasInk === true,
    canvasDataUrlLength:
      Number(payload.canvasDataUrlLength || 0),
    attemptId:
      String(payload.attemptId || '').trim()
  };
}


/**
 * DEV safety.
 */
function kidlearnV3_4d3CheckDevSafety_() {
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
function kidlearnV3_4d3VerifyRowContainsId_(
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
function kidlearnV3_4d3InspectSheetHeaders_(spreadsheet, sheetName, warnings) {
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

  if (
    typeof kidlearnV3_4d2InspectSheetHeaders_ === 'function'
  ) {
    return kidlearnV3_4d2InspectSheetHeaders_(
      spreadsheet,
      sheetName,
      warnings
    );
  }

  var sheet =
    kidlearnV3_4d3GetSheetByExactName_(
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

  var values =
    sheet
      .getRange(1, 1, Math.min(2, lastRow), lastColumn)
      .getValues();

  var headerRowIndex = 1;

  if (
    values.length > 1 &&
    kidlearnV3_4d3HeaderScore_(values[1]) >=
      kidlearnV3_4d3HeaderScore_(values[0])
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
        kidlearnV3_4d3NormalizeLookupKey_(raw)
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


function kidlearnV3_4d3HeaderScore_(row) {
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


function kidlearnV3_4d3FindHeaderMatch_(headers, aliases) {
  var map = {};

  for (var i = 0; i < aliases.length; i++) {
    map[
      kidlearnV3_4d3NormalizeLookupKey_(aliases[i])
    ] = true;
  }

  for (var j = 0; j < headers.length; j++) {
    if (map[headers[j].normalized]) {
      return headers[j];
    }
  }

  return null;
}


function kidlearnV3_4d3BuildBlankRow_(length) {
  var row = [];

  for (var i = 0; i < length; i++) {
    row.push('');
  }

  return row;
}


function kidlearnV3_4d3BuildRowObjectByHeader_(headerInfo, rowValues) {
  var obj = {};
  var headers = headerInfo.headers || [];

  for (var i = 0; i < headers.length; i++) {
    obj[headers[i].raw] =
      rowValues[headers[i].columnIndex - 1] || '';
  }

  return obj;
}


function kidlearnV3_4d3IsUnmapped_(unmapped, canonical) {
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
function kidlearnV3_4d3GetResponseFieldAliasMap_() {
  if (
    typeof kidlearnV3_4d2GetResponseFieldAliasMap_ === 'function'
  ) {
    return kidlearnV3_4d2GetResponseFieldAliasMap_();
  }

  return {
    responseId: ['responseId', 'responseid', 'id'],
    childId: ['childId', 'childid', 'studentId', 'learnerId', 'userId'],
    lessonId: ['lessonId', 'lessonid', 'lesson'],
    activityId: ['activityId', 'activityid', 'questionId', 'itemId'],
    answerMode: ['answerMode', 'answermode', 'inputMode', 'questionType'],
    answerText: ['answerText', 'answertext', 'responseText', 'answer', 'value'],
    selectedOptionId: ['selectedOptionId', 'optionId'],
    selectedOptionLabel: ['selectedOptionLabel', 'optionLabel', 'label'],
    expectedAnswer: ['expectedAnswer', 'correctAnswer', 'expected'],
    isCorrect: ['isCorrect', 'correct'],
    score: ['score', 'point', 'points'],
    status: ['status', 'responseStatus'],
    submittedAt: ['submittedAt', 'createdAt', 'timestamp'],
    createdAt: ['createdAt', 'timestamp'],
    updatedAt: ['updatedAt', 'modifiedAt'],
    attemptId: ['attemptId', 'submissionId'],
    answerMetaJson: ['answerMetaJson', 'metaJson', 'detailsJson', 'payloadJson']
  };
}


function kidlearnV3_4d3GetAuditFieldAliasMap_() {
  if (
    typeof kidlearnV3_4d2GetAuditFieldAliasMap_ === 'function'
  ) {
    return kidlearnV3_4d2GetAuditFieldAliasMap_();
  }

  return {
    auditId: ['auditId', 'logId', 'id'],
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
function kidlearnV3_4d3OpenSpreadsheet_() {
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


function kidlearnV3_4d3GetSheetByExactName_(spreadsheet, sheetName) {
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
function kidlearnV3_4d3NormalizeLookupKey_(value) {
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


function kidlearnV3_4d3NormalizeAnswerText_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}


function kidlearnV3_4d3PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 120) {
    return text.substring(0, 120) + '...';
  }

  return text;
}


function kidlearnV3_4d3UniqueArray_(items) {
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


function kidlearnV3_4d3SafeCall_(functionName) {
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


function kidlearnV3_4d3SaveWriteRecord_(writeRecord) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_KEYS.LAST_WRITE_JSON,
      JSON.stringify(writeRecord)
    );
}


function kidlearnV3_4d3SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.PARENT_PHASE,
      status: status,
      writeName:
        KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.WRITE_NAME,
      nextBundle:
        KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_RESPONSE_REAL_WRITE_4D3_CONFIG.NEXT_STAGE,
      prodWriteAllowed: false,
      realWriteAllowed: true,
      actualSheetWritePerformed:
        result.actualSheetWritePerformed === true,
      targetSheet:
        result.targetSheet || 'DATA_Responses',
      auditSheet:
        result.auditSheet || 'LOG_Audit',
      responseId:
        result.responseId || '',
      auditId:
        result.auditId || '',
      responseRowNumber:
        result.responseRowNumber || '',
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


function kidlearnV3_4d3ReadJsonProperty_(key) {
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