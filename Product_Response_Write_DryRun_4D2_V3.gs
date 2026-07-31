/**
 * ================================================================
 * KIDLEARN V3 - RESPONSE WRITE DRY-RUN ROW PREVIEW
 * Step: 4D-2
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Build dry-run row preview for DATA_Responses.
 * - Build dry-run audit row preview for LOG_Audit.
 * - Adapt to flexible DATA_Responses schema.
 *
 * Safety:
 * - Không ghi DATA_Responses.
 * - Không ghi LOG_Audit.
 * - Không ghi DATA_LessonProgress.
 * - Không ghi DATA_StudySessions.
 * - Không ghi PROD.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4D-2.
 */


var KIDLEARN_V3_RESPONSE_DRYRUN_4D2_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4D2_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4D2_LAST_PREVIEW_AT',
  LAST_CHECK_AT: 'KIDLEARN_V3_PHASE_4D2_LAST_CHECK_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4D2_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4D2_LAST_RESULT_JSON'
};


var KIDLEARN_V3_RESPONSE_DRYRUN_4D2_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  CHECK_PASSED: 'CHECK_PASSED',
  READY_FOR_4D_3: 'READY_FOR_4D_3',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG = {
  PHASE: '4D-2',
  PARENT_PHASE: '4D',
  PREVIOUS_BUNDLE: '4D-1',
  NEXT_BUNDLE: '4D-3',
  NEXT_STAGE: 'CONTROLLED_DEV_REAL_WRITE_DATA_RESPONSES',
  DRY_RUN_NAME: 'RESPONSE_WRITE_DRY_RUN_ROW_PREVIEW',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false
};


/**
 * Main dry-run preview builder.
 * Không ghi sheet.
 */
function kidlearnV3_buildResponseWriteDryRunPreview4D2V3(payload) {
  payload = payload || {};

  var errors = [];
  var warnings = [];

  var d1 =
    kidlearnV3_4d2SafeCall_(
      'kidlearnV3_assertWriteContract4D1ReadyV3'
    );

  if (!d1.success) {
    errors.push(
      '4D-1 chưa READY_FOR_4D_2: ' +
      d1.message
    );
  }

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4d2OpenSpreadsheet_();
  } catch (error) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(error.message || error)
    );
  }

  var responseHeaderInfo = null;
  var auditHeaderInfo = null;

  if (spreadsheet) {
    responseHeaderInfo =
      kidlearnV3_4d2InspectSheetHeaders_(
        spreadsheet,
        'DATA_Responses',
        warnings
      );

    auditHeaderInfo =
      kidlearnV3_4d2InspectSheetHeaders_(
        spreadsheet,
        'LOG_Audit',
        warnings
      );
  }

  if (!responseHeaderInfo || !responseHeaderInfo.exists) {
    errors.push('Không tìm thấy DATA_Responses.');
  }

  if (!auditHeaderInfo || !auditHeaderInfo.exists) {
    errors.push('Không tìm thấy LOG_Audit.');
  }

  var normalized =
    kidlearnV3_4d2NormalizeResponsePayload_(payload);

  var responseMapping = null;
  var auditMapping = null;

  if (responseHeaderInfo && responseHeaderInfo.exists) {
    responseMapping =
      kidlearnV3_4d2BuildResponseRowPreview_(
        responseHeaderInfo,
        normalized,
        warnings
      );

    if (!responseMapping.success) {
      errors =
        errors.concat(responseMapping.errors || []);
    }

    warnings =
      warnings.concat(responseMapping.warnings || []);
  }

  if (auditHeaderInfo && auditHeaderInfo.exists) {
    auditMapping =
      kidlearnV3_4d2BuildAuditRowPreview_(
        auditHeaderInfo,
        normalized,
        responseMapping,
        warnings
      );

    if (!auditMapping.success) {
      errors =
        errors.concat(auditMapping.errors || []);
    }

    warnings =
      warnings.concat(auditMapping.warnings || []);
  }

  var result = {
    success: errors.length === 0,
    action: 'BUILD_RESPONSE_WRITE_DRY_RUN_PREVIEW_4D_2_V3',
    phase:
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.PARENT_PHASE,
    dryRunName:
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.DRY_RUN_NAME,
    nextBundle:
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    actualSheetWritePerformed: false,
    normalizedPayload: normalized,
    responsePreview: responseMapping,
    auditPreview: auditMapping,
    writePlanFor4D3: {
      targetSheet: 'DATA_Responses',
      operation: 'CONTROLLED_DEV_APPEND',
      auditSheet: 'LOG_Audit',
      requiresConfirmText:
        'CONFIRM_REAL_WRITE_DATA_RESPONSES_4D3',
      prodWriteAllowed: false,
      realWriteAllowedNow: false,
      willWriteInThisStep: false
    },
    errorCount: errors.length,
    warningCount: kidlearnV3_4d2UniqueArray_(warnings).length,
    errors: errors,
    warnings: kidlearnV3_4d2UniqueArray_(warnings)
  };

  console.log(JSON.stringify({
    success: result.success,
    action: result.action,
    phase: result.phase,
    dryRunName: result.dryRunName,
    responseMatchedCount:
      responseMapping ? responseMapping.matchedFieldCount : 0,
    responseUnmappedCount:
      responseMapping ? responseMapping.unmappedFieldCount : 0,
    responseRowLength:
      responseMapping ? responseMapping.rowValues.length : 0,
    auditRowLength:
      auditMapping ? auditMapping.rowValues.length : 0,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    actualSheetWritePerformed: false,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    errors: result.errors,
    warnings: result.warnings
  }, null, 2));

  if (!result.success) {
    throw new Error(
      '4D-2 response dry-run preview failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Preview with default sample.
 */
function kidlearnV3_previewResponseWriteDryRun4D2V3() {
  var result =
    kidlearnV3_buildResponseWriteDryRunPreview4D2V3(
      kidlearnV3_4d2BuildSamplePayload_()
    );

  var statusBefore =
    kidlearnV3_4d2GetCurrentStatus_();

  var statusAfter =
    kidlearnV3_4d2ResolveStatusAfterCheck_(
      statusBefore,
      result.success
        ? KIDLEARN_V3_RESPONSE_DRYRUN_4D2_STATUS.PREVIEWED
        : KIDLEARN_V3_RESPONSE_DRYRUN_4D2_STATUS.FAILED
    );

  result.action =
    'PREVIEW_RESPONSE_WRITE_DRY_RUN_4D_2_V3';

  result.statusBefore =
    statusBefore;

  result.statusAfter =
    statusAfter;

  kidlearnV3_4d2SaveStatus_(
    result,
    statusAfter,
    KIDLEARN_V3_RESPONSE_DRYRUN_4D2_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify({
    success: result.success,
    action: result.action,
    phase: result.phase,
    statusAfter: statusAfter,
    nextBundle: result.nextBundle,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    actualSheetWritePerformed: false,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    warnings: result.warnings
  }, null, 2));

  return result;
}


/**
 * Check dry-run preview.
 */
function kidlearnV3_checkResponseWriteDryRun4D2V3() {
  var result =
    kidlearnV3_buildResponseWriteDryRunPreview4D2V3(
      kidlearnV3_4d2BuildSamplePayload_()
    );

  var statusBefore =
    kidlearnV3_4d2GetCurrentStatus_();

  var statusAfter =
    kidlearnV3_4d2ResolveStatusAfterCheck_(
      statusBefore,
      result.success
        ? KIDLEARN_V3_RESPONSE_DRYRUN_4D2_STATUS.CHECK_PASSED
        : KIDLEARN_V3_RESPONSE_DRYRUN_4D2_STATUS.FAILED
    );

  result.action =
    'CHECK_RESPONSE_WRITE_DRY_RUN_4D_2_V3';

  result.statusBefore =
    statusBefore;

  result.statusAfter =
    statusAfter;

  kidlearnV3_4d2SaveStatus_(
    result,
    statusAfter,
    KIDLEARN_V3_RESPONSE_DRYRUN_4D2_KEYS.LAST_CHECK_AT
  );

  console.log(JSON.stringify({
    success: result.success,
    action: result.action,
    phase: result.phase,
    statusAfter: statusAfter,
    nextBundle: result.nextBundle,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    actualSheetWritePerformed: false,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    warnings: result.warnings
  }, null, 2));

  if (!result.success) {
    throw new Error(
      '4D-2 check failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready for 4D-3.
 */
function kidlearnV3_markResponseWriteDryRun4D2ReadyV3() {
  var check =
    kidlearnV3_checkResponseWriteDryRun4D2V3();

  if (!check.success) {
    throw new Error('Check 4D-2 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_RESPONSE_WRITE_DRY_RUN_4D_2_READY_V3',
    phase:
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_STATUS.READY_FOR_4D_3,
    dryRunName:
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.DRY_RUN_NAME,
    nextBundle:
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    actualSheetWritePerformed: false,
    message:
      'Response Write Dry-run Row Preview ready. Có thể qua 4D-3 Controlled DEV Real Write DATA_Responses.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4d2SaveStatus_(
    result,
    KIDLEARN_V3_RESPONSE_DRYRUN_4D2_STATUS.READY_FOR_4D_3,
    KIDLEARN_V3_RESPONSE_DRYRUN_4D2_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getResponseWriteDryRun4D2StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_RESPONSE_WRITE_DRY_RUN_4D_2_STATUS_V3',
    phase:
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_RESPONSE_DRYRUN_4D2_KEYS.STATUS
      ) ||
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_RESPONSE_DRYRUN_4D2_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastCheckAt:
      properties.getProperty(
        KIDLEARN_V3_RESPONSE_DRYRUN_4D2_KEYS.LAST_CHECK_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_RESPONSE_DRYRUN_4D2_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4d2ReadJsonProperty_(
        KIDLEARN_V3_RESPONSE_DRYRUN_4D2_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertResponseWriteDryRun4D2ReadyV3() {
  var status =
    kidlearnV3_getResponseWriteDryRun4D2StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_RESPONSE_DRYRUN_4D2_STATUS.READY_FOR_4D_3
  ) {
    errors.push(
      '4D-2 chưa READY_FOR_4D_3. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_RESPONSE_WRITE_DRY_RUN_4D_2_READY_V3',
    phase:
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.PARENT_PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    actualSheetWritePerformed: false,
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
function kidlearnV3_runQaBatch4D2V3() {
  var preview =
    kidlearnV3_previewResponseWriteDryRun4D2V3();

  var check =
    kidlearnV3_checkResponseWriteDryRun4D2V3();

  var ready =
    kidlearnV3_markResponseWriteDryRun4D2ReadyV3();

  var assertReady =
    kidlearnV3_assertResponseWriteDryRun4D2ReadyV3();

  var result = {
    success:
      preview.success === true &&
      check.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4D_2_RESPONSE_WRITE_DRY_RUN_ROW_PREVIEW',
    phase:
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.PHASE,
    nextBundle:
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    actualSheetWritePerformed: false,
    results: {
      preview: preview.success,
      check: check.success,
      ready: ready.success,
      assertReady: assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4D-2 QA batch failed.');
  }

  return result;
}


/**
 * Build response row preview.
 */
function kidlearnV3_4d2BuildResponseRowPreview_(headerInfo, payload, warnings) {
  var errors = [];
  var localWarnings = [];

  var now =
    new Date().toISOString();

  var responseId =
    payload.responseId ||
    'RESP_4D2_DRY_' + new Date().getTime();

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
    status: 'SUBMITTED_DRY_RUN_PREVIEW',
    submittedAt: now,
    createdAt: now,
    updatedAt: now,
    attemptId: payload.attemptId || 'ATT_4D2_DRY',
    answerMetaJson: JSON.stringify({
      phase: '4D-2',
      dryRunOnly: true,
      childId: payload.childId,
      lessonId: payload.lessonId,
      activityId: payload.activityId,
      answerMode: payload.answerMode,
      selectedOptionId: payload.selectedOptionId,
      selectedOptionLabel: payload.selectedOptionLabel,
      canvasHasInk: payload.canvasHasInk,
      canvasDataUrlLength: payload.canvasDataUrlLength,
      source: 'RESPONSE_WRITE_DRY_RUN_ROW_PREVIEW',
      note:
        'This preview is not written to DATA_Responses.'
    })
  };

  var aliasMap =
    kidlearnV3_4d2GetResponseFieldAliasMap_();

  var rowValues =
    kidlearnV3_4d2BuildBlankRow_(headerInfo.lastColumn);

  var matched = [];
  var unmapped = [];

  var metaColumn =
    kidlearnV3_4d2FindHeaderMatch_(
      headerInfo.headers,
      aliasMap.answerMetaJson
    );

  for (var key in canonicalData) {
    if (!canonicalData.hasOwnProperty(key)) continue;

    var match =
      kidlearnV3_4d2FindHeaderMatch_(
        headerInfo.headers,
        aliasMap[key] || [key]
      );

    if (match) {
      rowValues[match.columnIndex - 1] =
        canonicalData[key];

      matched.push({
        canonical: key,
        matchedHeader: match.raw,
        columnIndex: match.columnIndex,
        valuePreview:
          kidlearnV3_4d2PreviewValue_(canonicalData[key])
      });
    } else {
      unmapped.push({
        canonical: key,
        valuePreview:
          kidlearnV3_4d2PreviewValue_(canonicalData[key])
      });
    }
  }

  var criticalFields = [
    'childId',
    'lessonId',
    'activityId',
    'answerMode'
  ];

  var criticalUnmapped = [];

  for (var i = 0; i < criticalFields.length; i++) {
    if (
      kidlearnV3_4d2IsUnmapped_(
        unmapped,
        criticalFields[i]
      )
    ) {
      criticalUnmapped.push(criticalFields[i]);
    }
  }

  if (criticalUnmapped.length > 0) {
    if (metaColumn) {
      localWarnings.push(
        'DATA_Responses thiếu cột riêng cho ' +
        criticalUnmapped.join(', ') +
        '. Các field này đã nằm trong answerMetaJson/detailsJson.'
      );
    } else {
      localWarnings.push(
        'DATA_Responses thiếu cột riêng cho ' +
        criticalUnmapped.join(', ') +
        ' và chưa thấy metadata column. 4D-3 vẫn có thể ghi field cơ bản, nhưng nên bổ sung metadata column trước khi dùng lâu dài.'
      );
    }
  }

  var requiredForAppend = [
    'responseId',
    'answerText',
    'status'
  ];

  for (var r = 0; r < requiredForAppend.length; r++) {
    var requiredKey =
      requiredForAppend[r];

    if (
      kidlearnV3_4d2IsUnmapped_(
        unmapped,
        requiredKey
      )
    ) {
      errors.push(
        'DATA_Responses không map được required field cho append: ' +
        requiredKey
      );
    }
  }

  return {
    success: errors.length === 0,
    targetSheet: 'DATA_Responses',
    operation: 'DRY_RUN_APPEND_PREVIEW',
    willWriteNow: false,
    actualSheetWritePerformed: false,
    headerRowIndex: headerInfo.headerRowIndex,
    targetNextRow: headerInfo.lastRow + 1,
    rowLength: rowValues.length,
    rowValues: rowValues,
    rowObjectByHeader:
      kidlearnV3_4d2BuildRowObjectByHeader_(
        headerInfo,
        rowValues
      ),
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
    responseId: responseId,
    errorCount: errors.length,
    warningCount: localWarnings.length,
    errors: errors,
    warnings: localWarnings
  };
}


/**
 * Build audit row preview.
 */
function kidlearnV3_4d2BuildAuditRowPreview_(
  headerInfo,
  payload,
  responsePreview,
  warnings
) {
  var errors = [];
  var localWarnings = [];

  var now =
    new Date().toISOString();

  var auditId =
    'AUD_4D2_DRY_' + new Date().getTime();

  var entityId =
    responsePreview && responsePreview.responseId
      ? responsePreview.responseId
      : 'RESP_4D2_DRY';

  var details = {
    phase: '4D-2',
    dryRunOnly: true,
    targetSheet: 'DATA_Responses',
    responseId: entityId,
    childId: payload.childId,
    lessonId: payload.lessonId,
    activityId: payload.activityId,
    answerMode: payload.answerMode,
    actualSheetWritePerformed: false,
    note:
      'Audit row preview only. This row is not written in 4D-2.'
  };

  var canonicalData = {
    auditId: auditId,
    action: 'PREVIEW_RESPONSE_WRITE_4D2',
    entityType: 'DATA_Responses',
    entityId: entityId,
    detailsJson: JSON.stringify(details),
    createdAt: now,
    actorId: payload.childId,
    source: '4D-2',
    environment: 'DEV'
  };

  var aliasMap =
    kidlearnV3_4d2GetAuditFieldAliasMap_();

  var rowValues =
    kidlearnV3_4d2BuildBlankRow_(headerInfo.lastColumn);

  var matched = [];
  var unmapped = [];

  for (var key in canonicalData) {
    if (!canonicalData.hasOwnProperty(key)) continue;

    var match =
      kidlearnV3_4d2FindHeaderMatch_(
        headerInfo.headers,
        aliasMap[key] || [key]
      );

    if (match) {
      rowValues[match.columnIndex - 1] =
        canonicalData[key];

      matched.push({
        canonical: key,
        matchedHeader: match.raw,
        columnIndex: match.columnIndex,
        valuePreview:
          kidlearnV3_4d2PreviewValue_(canonicalData[key])
      });
    } else {
      unmapped.push({
        canonical: key,
        valuePreview:
          kidlearnV3_4d2PreviewValue_(canonicalData[key])
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
      kidlearnV3_4d2IsUnmapped_(
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
    operation: 'DRY_RUN_AUDIT_APPEND_PREVIEW',
    willWriteNow: false,
    actualSheetWritePerformed: false,
    headerRowIndex: headerInfo.headerRowIndex,
    targetNextRow: headerInfo.lastRow + 1,
    rowLength: rowValues.length,
    rowValues: rowValues,
    rowObjectByHeader:
      kidlearnV3_4d2BuildRowObjectByHeader_(
        headerInfo,
        rowValues
      ),
    matchedFieldCount: matched.length,
    unmappedFieldCount: unmapped.length,
    matchedFields: matched,
    unmappedFields: unmapped,
    auditId: auditId,
    entityId: entityId,
    errorCount: errors.length,
    warningCount: localWarnings.length,
    errors: errors,
    warnings: localWarnings
  };
}


/**
 * Sample payload.
 */
function kidlearnV3_4d2BuildSamplePayload_() {
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


function kidlearnV3_4d2NormalizeResponsePayload_(payload) {
  payload = payload || {};

  var answerMode =
    String(payload.answerMode || 'UNKNOWN')
      .trim()
      .toUpperCase();

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
    if (expectedAnswer && answerText) {
      isCorrect =
        kidlearnV3_4d2NormalizeAnswerText_(answerText) ===
        kidlearnV3_4d2NormalizeAnswerText_(expectedAnswer);
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
    answerMode: answerMode,
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
 * Header helpers.
 */
function kidlearnV3_4d2InspectSheetHeaders_(spreadsheet, sheetName, warnings) {
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
    kidlearnV3_4d2GetSheetByExactName_(
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
      headers: [],
      duplicateHeaders: []
    };
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (lastRow < 1 || lastColumn < 1) {
    warnings.push(sheetName + ': Sheet trống.');

    return {
      exists: true,
      sheetName: sheetName,
      headerRowIndex: 0,
      dataStartRowIndex: 0,
      headerCount: 0,
      lastRow: lastRow,
      lastColumn: lastColumn,
      headers: [],
      duplicateHeaders: []
    };
  }

  var values =
    sheet
      .getRange(1, 1, Math.min(2, lastRow), lastColumn)
      .getValues();

  var headerRowIndex =
    kidlearnV3_4d2ChooseHeaderRow_(values);

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
        kidlearnV3_4d2NormalizeLookupKey_(raw)
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
    headers: headers,
    duplicateHeaders: []
  };
}


function kidlearnV3_4d2ChooseHeaderRow_(values) {
  var row1 = values[0] || [];
  var row2 = values.length > 1 ? values[1] || [] : [];

  var row1Score =
    kidlearnV3_4d2HeaderScore_(row1);

  var row2Score =
    kidlearnV3_4d2HeaderScore_(row2);

  if (row2Score >= 3 && row2Score >= row1Score) {
    return 2;
  }

  return 1;
}


function kidlearnV3_4d2HeaderScore_(row) {
  var score = 0;

  for (var i = 0; i < row.length; i++) {
    var value =
      String(row[i] || '').trim();

    if (!value) continue;

    if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
      score++;
    }
  }

  return score;
}


function kidlearnV3_4d2FindHeaderMatch_(headers, aliases) {
  var map = {};

  for (var i = 0; i < aliases.length; i++) {
    map[
      kidlearnV3_4d2NormalizeLookupKey_(aliases[i])
    ] = true;
  }

  for (var j = 0; j < headers.length; j++) {
    if (map[headers[j].normalized]) {
      return headers[j];
    }
  }

  return null;
}


function kidlearnV3_4d2BuildBlankRow_(length) {
  var row = [];

  for (var i = 0; i < length; i++) {
    row.push('');
  }

  return row;
}


function kidlearnV3_4d2BuildRowObjectByHeader_(headerInfo, rowValues) {
  var obj = {};

  var headers =
    headerInfo.headers || [];

  for (var i = 0; i < headers.length; i++) {
    obj[headers[i].raw] =
      rowValues[headers[i].columnIndex - 1] || '';
  }

  return obj;
}


function kidlearnV3_4d2IsUnmapped_(unmapped, canonical) {
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
function kidlearnV3_4d2GetResponseFieldAliasMap_() {
  return {
    responseId: [
      'responseId',
      'responseid',
      'id',
      'responseKey',
      'maPhanHoi',
      'maphanhoi',
      'maTraLoi',
      'matraloi'
    ],
    childId: [
      'childId',
      'childid',
      'studentId',
      'studentid',
      'learnerId',
      'learnerid',
      'userId',
      'userid',
      'maChild',
      'machild',
      'maBe',
      'mabe'
    ],
    lessonId: [
      'lessonId',
      'lessonid',
      'lesson',
      'maBaiHoc',
      'mabaihoc'
    ],
    activityId: [
      'activityId',
      'activityid',
      'questionId',
      'questionid',
      'itemId',
      'itemid',
      'maHoatDong',
      'mahoatdong',
      'maCauHoi',
      'macauhoi'
    ],
    answerMode: [
      'answerMode',
      'answermode',
      'inputMode',
      'inputmode',
      'responseMode',
      'responsemode',
      'activityType',
      'activitytype',
      'questionType',
      'questiontype'
    ],
    answerText: [
      'answerText',
      'answertext',
      'responseText',
      'responsetext',
      'selectedAnswer',
      'selectedanswer',
      'answer',
      'value',
      'textAnswer',
      'textanswer'
    ],
    selectedOptionId: [
      'selectedOptionId',
      'selectedoptionid',
      'optionId',
      'optionid',
      'choiceId',
      'choiceid'
    ],
    selectedOptionLabel: [
      'selectedOptionLabel',
      'selectedoptionlabel',
      'optionLabel',
      'optionlabel',
      'label',
      'choiceText',
      'choicetext'
    ],
    expectedAnswer: [
      'expectedAnswer',
      'expectedanswer',
      'correctAnswer',
      'correctanswer',
      'expected',
      'dapan'
    ],
    isCorrect: [
      'isCorrect',
      'iscorrect',
      'correct',
      'isright',
      'dung'
    ],
    score: [
      'score',
      'point',
      'points',
      'diem'
    ],
    status: [
      'status',
      'responseStatus',
      'responsestatus',
      'trangThai',
      'trangthai'
    ],
    submittedAt: [
      'submittedAt',
      'submittedat',
      'createdAt',
      'createdat',
      'time',
      'timestamp'
    ],
    createdAt: [
      'createdAt',
      'createdat',
      'timestamp',
      'time'
    ],
    updatedAt: [
      'updatedAt',
      'updatedat',
      'modifiedAt',
      'modifiedat'
    ],
    attemptId: [
      'attemptId',
      'attemptid',
      'submissionId',
      'submissionid'
    ],
    answerMetaJson: [
      'answerMetaJson',
      'answermetajson',
      'metaJson',
      'metajson',
      'metadataJson',
      'metadatajson',
      'detailsJson',
      'detailsjson',
      'payloadJson',
      'payloadjson',
      'description',
      'ghiChu',
      'ghichu'
    ]
  };
}


function kidlearnV3_4d2GetAuditFieldAliasMap_() {
  return {
    auditId: [
      'auditId',
      'auditid',
      'logId',
      'logid',
      'id'
    ],
    action: [
      'action',
      'actionType',
      'actiontype',
      'event',
      'operation'
    ],
    entityType: [
      'entityType',
      'entitytype',
      'targetSheet',
      'targetsheet',
      'sheetName',
      'sheetname',
      'objectType'
    ],
    entityId: [
      'entityId',
      'entityid',
      'targetId',
      'targetid',
      'objectId',
      'objectid',
      'recordId',
      'recordid'
    ],
    detailsJson: [
      'detailsJson',
      'detailsjson',
      'payloadJson',
      'payloadjson',
      'metaJson',
      'metajson',
      'description'
    ],
    createdAt: [
      'createdAt',
      'createdat',
      'timestamp',
      'time',
      'loggedAt',
      'loggedat'
    ],
    actorId: [
      'actorId',
      'actorid',
      'userId',
      'userid'
    ],
    source: [
      'source',
      'module',
      'phase'
    ],
    environment: [
      'environment',
      'env'
    ]
  };
}


/**
 * Spreadsheet helpers.
 */
function kidlearnV3_4d2OpenSpreadsheet_() {
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


function kidlearnV3_4d2GetSheetByExactName_(spreadsheet, sheetName) {
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
function kidlearnV3_4d2NormalizeLookupKey_(value) {
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


function kidlearnV3_4d2NormalizeAnswerText_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ');
}


function kidlearnV3_4d2PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 120) {
    return text.substring(0, 120) + '...';
  }

  return text;
}


function kidlearnV3_4d2UniqueArray_(items) {
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


function kidlearnV3_4d2SafeCall_(functionName) {
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


function kidlearnV3_4d2GetCurrentStatus_() {
  return (
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_RESPONSE_DRYRUN_4D2_KEYS.STATUS
      ) ||
    KIDLEARN_V3_RESPONSE_DRYRUN_4D2_STATUS.NOT_RUN
  );
}


function kidlearnV3_4d2ResolveStatusAfterCheck_(statusBefore, proposedStatus) {
  if (
    statusBefore ===
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_STATUS.READY_FOR_4D_3 &&
    proposedStatus !==
      KIDLEARN_V3_RESPONSE_DRYRUN_4D2_STATUS.FAILED
  ) {
    return KIDLEARN_V3_RESPONSE_DRYRUN_4D2_STATUS.READY_FOR_4D_3;
  }

  return proposedStatus;
}


function kidlearnV3_4d2SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_RESPONSE_DRYRUN_4D2_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_RESPONSE_DRYRUN_4D2_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.PARENT_PHASE,
      status: status,
      dryRunName:
        KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.DRY_RUN_NAME,
      nextBundle:
        KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_RESPONSE_DRYRUN_4D2_CONFIG.NEXT_STAGE,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      actualSheetWritePerformed: false,
      responsePreviewSummary:
        result.responsePreview
          ? {
              targetSheet: result.responsePreview.targetSheet,
              targetNextRow: result.responsePreview.targetNextRow,
              matchedFieldCount: result.responsePreview.matchedFieldCount,
              unmappedFieldCount: result.responsePreview.unmappedFieldCount,
              criticalUnmappedFields: result.responsePreview.criticalUnmappedFields,
              metadataColumnDetected: result.responsePreview.metadataColumnDetected
            }
          : null,
      auditPreviewSummary:
        result.auditPreview
          ? {
              targetSheet: result.auditPreview.targetSheet,
              targetNextRow: result.auditPreview.targetNextRow,
              matchedFieldCount: result.auditPreview.matchedFieldCount,
              unmappedFieldCount: result.auditPreview.unmappedFieldCount
            }
          : null,
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


function kidlearnV3_4d2ReadJsonProperty_(key) {
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