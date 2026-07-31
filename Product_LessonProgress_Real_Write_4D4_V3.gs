/**
 * ================================================================
 * KIDLEARN V3 - CONTROLLED DEV REAL WRITE: DATA_LESSON_PROGRESS
 * Step: 4D-4
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Controlled DEV real write into DATA_LessonProgress.
 * - Append audit row into LOG_Audit.
 * - Verify written rows.
 *
 * Safety:
 * - Chỉ ghi DEV.
 * - Không ghi PROD.
 * - Cần confirm text rõ ràng.
 * - Ghi 01 lesson progress test row + 01 audit row.
 * - Không ghi DATA_Responses.
 * - Không ghi DATA_StudySessions.
 */


var KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4D4_STATUS',
  LAST_PREFLIGHT_AT: 'KIDLEARN_V3_PHASE_4D4_LAST_PREFLIGHT_AT',
  LAST_WRITE_AT: 'KIDLEARN_V3_PHASE_4D4_LAST_WRITE_AT',
  LAST_VERIFY_AT: 'KIDLEARN_V3_PHASE_4D4_LAST_VERIFY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4D4_LAST_RESULT_JSON',
  LAST_WRITE_JSON: 'KIDLEARN_V3_PHASE_4D4_LAST_WRITE_JSON'
};


var KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREFLIGHT_PASSED: 'PREFLIGHT_PASSED',
  READY_FOR_4D_5: 'READY_FOR_4D_5',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG = {
  PHASE: '4D-4',
  PARENT_PHASE: '4D',
  PREVIOUS_BUNDLE: '4D-3',
  NEXT_BUNDLE: '4D-5',
  NEXT_STAGE: 'CONTROLLED_DEV_REAL_WRITE_DATA_STUDY_SESSIONS',
  WRITE_NAME: 'CONTROLLED_DEV_REAL_WRITE_DATA_LESSON_PROGRESS',
  CONFIRM_TEXT: 'CONFIRM_REAL_WRITE_DATA_LESSON_PROGRESS_4D4',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: true
};


/**
 * Preview real write row.
 * Không ghi sheet.
 */
function kidlearnV3_previewLessonProgressRealWrite4D4V3(payload) {
  payload =
    payload ||
    kidlearnV3_4d4BuildSamplePayload_();

  var plan =
    kidlearnV3_4d4BuildRealWritePlan_(payload);

  plan.action =
    'PREVIEW_LESSON_PROGRESS_REAL_WRITE_4D_4_V3';

  kidlearnV3_4d4SaveStatus_(
    plan,
    plan.success
      ? KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_STATUS.PREFLIGHT_PASSED
      : KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_STATUS.FAILED,
    KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_KEYS.LAST_PREFLIGHT_AT
  );

  console.log(JSON.stringify({
    success: plan.success,
    action: plan.action,
    phase: plan.phase,
    willWriteNow: false,
    targetSheet: 'DATA_LessonProgress',
    auditSheet: 'LOG_Audit',
    operationMode:
      plan.progressPlan ? plan.progressPlan.operationMode : '',
    progressTargetRow:
      plan.progressPlan ? plan.progressPlan.targetRowNumber : '',
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
      '4D-4 preview failed. Errors=' +
      plan.errors.join(' | ')
    );
  }

  return plan;
}


/**
 * Preflight only.
 * Không ghi sheet.
 */
function kidlearnV3_runLessonProgressRealWritePreflight4D4V3() {
  var result =
    kidlearnV3_previewLessonProgressRealWrite4D4V3(
      kidlearnV3_4d4BuildSamplePayload_()
    );

  result.action =
    'RUN_LESSON_PROGRESS_REAL_WRITE_PREFLIGHT_4D_4_V3';

  kidlearnV3_4d4SaveStatus_(
    result,
    KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_STATUS.PREFLIGHT_PASSED,
    KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_KEYS.LAST_PREFLIGHT_AT
  );

  console.log(JSON.stringify({
    success: result.success,
    action: result.action,
    phase: result.phase,
    status:
      KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_STATUS.PREFLIGHT_PASSED,
    nextAction:
      'Run kidlearnV3_realWriteDataLessonProgress4D4ConfirmV3 to append one DEV test lesson progress row.',
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
function kidlearnV3_realWriteDataLessonProgress4D4ConfirmV3() {
  return kidlearnV3_realWriteDataLessonProgress4D4V3({
    confirm:
      KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.CONFIRM_TEXT,
    payload:
      kidlearnV3_4d4BuildSamplePayload_(),
    reviewerNote:
      'Controlled DEV real write for DATA_LessonProgress. One test progress row and one audit row.'
  });
}


/**
 * Controlled DEV real write.
 */
function kidlearnV3_realWriteDataLessonProgress4D4V3(options) {
  options = options || {};

  var confirmText =
    String(options.confirm || '')
      .trim()
      .toUpperCase();

  if (
    confirmText !==
    KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm. Cần confirm=' +
      KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.CONFIRM_TEXT
    );
  }

  var payload =
    options.payload ||
    kidlearnV3_4d4BuildSamplePayload_();

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
      kidlearnV3_4d4BuildRealWritePlan_(payload);

    if (!plan.success) {
      throw new Error(
        'Preflight 4D-4 chưa pass. Errors=' +
        plan.errors.join(' | ')
      );
    }

    var spreadsheet =
      kidlearnV3_4d4OpenSpreadsheet_();

    var progressSheet =
      kidlearnV3_4d4GetSheetByExactName_(
        spreadsheet,
        'DATA_LessonProgress'
      );

    var auditSheet =
      kidlearnV3_4d4GetSheetByExactName_(
        spreadsheet,
        'LOG_Audit'
      );

    if (!progressSheet) {
      throw new Error('Không tìm thấy DATA_LessonProgress.');
    }

    if (!auditSheet) {
      throw new Error('Không tìm thấy LOG_Audit.');
    }

    var before = {
      dataLessonProgressLastRow:
        progressSheet.getLastRow(),
      logAuditLastRow:
        auditSheet.getLastRow()
    };

    var progressRowNumber = 0;

    if (plan.progressPlan.operationMode === 'UPDATE_EXISTING') {
      progressRowNumber =
        plan.progressPlan.targetRowNumber;

      progressSheet
        .getRange(
          progressRowNumber,
          1,
          1,
          plan.progressPlan.rowValues.length
        )
        .setValues([
          plan.progressPlan.rowValues
        ]);
    } else {
      progressSheet.appendRow(
        plan.progressPlan.rowValues
      );

      SpreadsheetApp.flush();

      progressRowNumber =
        progressSheet.getLastRow();
    }

    SpreadsheetApp.flush();

    var auditHeaderInfo =
      kidlearnV3_4d4InspectSheetHeaders_(
        spreadsheet,
        'LOG_Audit',
        []
      );

    var auditPlan =
      kidlearnV3_4d4BuildAuditRowPlan_(
        auditHeaderInfo,
        plan.normalizedPayload,
        plan.progressPlan.progressId,
        progressRowNumber,
        plan.progressPlan.operationMode
      );

    if (!auditPlan.success) {
      throw new Error(
        'Không build được audit row 4D-4. Errors=' +
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
      dataLessonProgressLastRow:
        progressSheet.getLastRow(),
      logAuditLastRow:
        auditSheet.getLastRow()
    };

    var writeRecord = {
      success: true,
      action: 'REAL_WRITE_DATA_LESSON_PROGRESS_4D_4_V3',
      phase:
        KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.PHASE,
      parentPhase:
        KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.PARENT_PHASE,
      status:
        KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_STATUS.READY_FOR_4D_5,
      writeName:
        KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.WRITE_NAME,
      environment: 'DEV',
      confirmUsed: confirmText,
      reviewerNote:
        String(options.reviewerNote || ''),
      targetSheet: 'DATA_LessonProgress',
      auditSheet: 'LOG_Audit',
      operationMode:
        plan.progressPlan.operationMode,
      progressId:
        plan.progressPlan.progressId,
      auditId:
        auditPlan.auditId,
      progressRowNumber:
        progressRowNumber,
      auditRowNumber:
        auditRowNumber,
      progressIdColumnIndex:
        plan.progressPlan.progressIdColumnIndex,
      auditIdColumnIndex:
        auditPlan.auditIdColumnIndex,
      before: before,
      after: after,
      rowDelta: {
        DATA_LessonProgress:
          after.dataLessonProgressLastRow -
          before.dataLessonProgressLastRow,
        LOG_Audit:
          after.logAuditLastRow -
          before.logAuditLastRow
      },
      prodWriteAllowed: false,
      realWriteAllowed: true,
      actualSheetWritePerformed: true,
      lessonProgressWritePerformed: true,
      auditWritePerformed: true,
      dataResponsesWritePerformed: false,
      studySessionWritePerformed: false,
      nextBundle:
        KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.NEXT_STAGE,
      writtenAt:
        new Date().toISOString(),
      warnings:
        plan.warnings || []
    };

    kidlearnV3_4d4SaveWriteRecord_(
      writeRecord
    );

    kidlearnV3_4d4SaveStatus_(
      writeRecord,
      KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_STATUS.READY_FOR_4D_5,
      KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_KEYS.LAST_WRITE_AT
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
function kidlearnV3_verifyLastLessonProgressRealWrite4D4V3() {
  var properties =
    PropertiesService.getScriptProperties();

  var text =
    properties.getProperty(
      KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_KEYS.LAST_WRITE_JSON
    );

  if (!text) {
    throw new Error(
      'Không tìm thấy LAST_WRITE_JSON của 4D-4.'
    );
  }

  var lastWrite =
    JSON.parse(text);

  var errors = [];
  var warnings = [];

  var spreadsheet =
    kidlearnV3_4d4OpenSpreadsheet_();

  var progressSheet =
    kidlearnV3_4d4GetSheetByExactName_(
      spreadsheet,
      'DATA_LessonProgress'
    );

  var auditSheet =
    kidlearnV3_4d4GetSheetByExactName_(
      spreadsheet,
      'LOG_Audit'
    );

  if (!progressSheet) {
    errors.push('Không tìm thấy DATA_LessonProgress.');
  }

  if (!auditSheet) {
    errors.push('Không tìm thấy LOG_Audit.');
  }

  var progressCheck = null;
  var auditCheck = null;

  if (progressSheet) {
    progressCheck =
      kidlearnV3_4d4VerifyRowContainsId_(
        progressSheet,
        lastWrite.progressRowNumber,
        lastWrite.progressIdColumnIndex,
        lastWrite.progressId,
        'DATA_LessonProgress'
      );

    if (!progressCheck.success) {
      errors =
        errors.concat(progressCheck.errors || []);
    }
  }

  if (auditSheet) {
    auditCheck =
      kidlearnV3_4d4VerifyRowContainsId_(
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
    action: 'VERIFY_LAST_LESSON_PROGRESS_REAL_WRITE_4D_4_V3',
    phase:
      KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_STATUS.READY_FOR_4D_5
        : KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_STATUS.FAILED,
    progressCheck: progressCheck,
    auditCheck: auditCheck,
    lastWriteSummary: {
      progressId:
        lastWrite.progressId,
      auditId:
        lastWrite.auditId,
      progressRowNumber:
        lastWrite.progressRowNumber,
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

  kidlearnV3_4d4SaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_KEYS.LAST_VERIFY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      'Verify 4D-4 failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getLessonProgressRealWrite4D4StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_LESSON_PROGRESS_REAL_WRITE_4D_4_STATUS_V3',
    phase:
      KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_KEYS.STATUS
      ) ||
      KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_STATUS.NOT_RUN,
    lastPreflightAt:
      properties.getProperty(
        KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_KEYS.LAST_PREFLIGHT_AT
      ) || '',
    lastWriteAt:
      properties.getProperty(
        KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_KEYS.LAST_WRITE_AT
      ) || '',
    lastVerifyAt:
      properties.getProperty(
        KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_KEYS.LAST_VERIFY_AT
      ) || '',
    lastResult:
      kidlearnV3_4d4ReadJsonProperty_(
        KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_KEYS.LAST_RESULT_JSON
      ),
    lastWrite:
      kidlearnV3_4d4ReadJsonProperty_(
        KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_KEYS.LAST_WRITE_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready for 4D-5.
 */
function kidlearnV3_assertLessonProgressRealWrite4D4ReadyV3() {
  var status =
    kidlearnV3_getLessonProgressRealWrite4D4StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_STATUS.READY_FOR_4D_5
  ) {
    errors.push(
      '4D-4 chưa READY_FOR_4D_5. Status=' +
      status.status
    );
  }

  if (
    !status.lastWrite ||
    status.lastWrite.actualSheetWritePerformed !== true
  ) {
    errors.push(
      'Chưa có bằng chứng actualSheetWritePerformed=true cho 4D-4.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_LESSON_PROGRESS_REAL_WRITE_4D_4_READY_V3',
    phase:
      KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.PARENT_PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.NEXT_BUNDLE,
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
function kidlearnV3_4d4BuildRealWritePlan_(payload) {
  var errors = [];
  var warnings = [];

  var d3 =
    kidlearnV3_4d4SafeCall_(
      'kidlearnV3_assertResponseRealWrite4D3ReadyV3'
    );

  if (!d3.success) {
    errors.push(
      '4D-3 chưa READY_FOR_4D_4: ' +
      d3.message
    );
  }

  var dev =
    kidlearnV3_4d4CheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  warnings =
    warnings.concat(dev.warnings || []);

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4d4OpenSpreadsheet_();
  } catch (error) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(error.message || error)
    );
  }

  var normalized =
    kidlearnV3_4d4NormalizeProgressPayload_(payload);

  var progressPlan = null;
  var auditPlan = null;

  if (spreadsheet) {
    var progressSheet =
      kidlearnV3_4d4GetSheetByExactName_(
        spreadsheet,
        'DATA_LessonProgress'
      );

    var progressHeaderInfo =
      kidlearnV3_4d4InspectSheetHeaders_(
        spreadsheet,
        'DATA_LessonProgress',
        warnings
      );

    var auditHeaderInfo =
      kidlearnV3_4d4InspectSheetHeaders_(
        spreadsheet,
        'LOG_Audit',
        warnings
      );

    if (!progressHeaderInfo.exists || !progressSheet) {
      errors.push('Không tìm thấy DATA_LessonProgress.');
    } else {
      progressPlan =
        kidlearnV3_4d4BuildProgressRowPlan_(
          progressHeaderInfo,
          progressSheet,
          normalized
        );

      if (!progressPlan.success) {
        errors =
          errors.concat(progressPlan.errors || []);
      }

      warnings =
        warnings.concat(progressPlan.warnings || []);
    }

    if (!auditHeaderInfo.exists) {
      errors.push('Không tìm thấy LOG_Audit.');
    } else {
      auditPlan =
        kidlearnV3_4d4BuildAuditRowPlan_(
          auditHeaderInfo,
          normalized,
          progressPlan ? progressPlan.progressId : '',
          progressPlan ? progressPlan.targetRowNumber : '',
          progressPlan ? progressPlan.operationMode : ''
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
    action: 'BUILD_LESSON_PROGRESS_REAL_WRITE_PLAN_4D_4_V3',
    phase:
      KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.PARENT_PHASE,
    writeName:
      KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.WRITE_NAME,
    nextBundle:
      KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: true,
    actualSheetWritePerformed: false,
    normalizedPayload: normalized,
    devSafety: dev,
    progressPlan: progressPlan,
    auditPlan: auditPlan,
    errorCount: errors.length,
    warningCount:
      kidlearnV3_4d4UniqueArray_(warnings).length,
    errors: errors,
    warnings:
      kidlearnV3_4d4UniqueArray_(warnings)
  };
}


/**
 * Build DATA_LessonProgress row.
 */
function kidlearnV3_4d4BuildProgressRowPlan_(
  headerInfo,
  sheet,
  payload
) {
  var errors = [];
  var warnings = [];

  var now =
    new Date().toISOString();

  var progressId =
    payload.progressId ||
    'PROG_4D4_DEV_' + new Date().getTime();

  var canonicalData = {
    progressId: progressId,
    childId: payload.childId,
    lessonId: payload.lessonId,
    subjectCode: payload.subjectCode,
    status: payload.status,
    progressPercent: payload.progressPercent,
    currentStepIndex: payload.currentStepIndex,
    startedAt: payload.startedAt,
    completedAt: payload.completedAt,
    updatedAt: now
  };

  var aliasMap =
    kidlearnV3_4d4GetProgressFieldAliasMap_();

  var rowValues =
    kidlearnV3_4d4BuildBlankRow_(headerInfo.lastColumn);

  var matched = [];
  var unmapped = [];

  var progressIdColumnIndex = 0;
  var childIdColumnIndex = 0;
  var lessonIdColumnIndex = 0;

  for (var key in canonicalData) {
    if (!canonicalData.hasOwnProperty(key)) continue;

    var match =
      kidlearnV3_4d4FindHeaderMatch_(
        headerInfo.headers,
        aliasMap[key] || [key]
      );

    if (match) {
      rowValues[match.columnIndex - 1] =
        canonicalData[key];

      if (key === 'progressId') {
        progressIdColumnIndex =
          match.columnIndex;
      }

      if (key === 'childId') {
        childIdColumnIndex =
          match.columnIndex;
      }

      if (key === 'lessonId') {
        lessonIdColumnIndex =
          match.columnIndex;
      }

      matched.push({
        canonical: key,
        matchedHeader: match.raw,
        columnIndex: match.columnIndex,
        valuePreview:
          kidlearnV3_4d4PreviewValue_(canonicalData[key])
      });
    } else {
      unmapped.push({
        canonical: key,
        valuePreview:
          kidlearnV3_4d4PreviewValue_(canonicalData[key])
      });
    }
  }

  var required = [
    'progressId',
    'childId',
    'lessonId',
    'status',
    'progressPercent'
  ];

  for (var i = 0; i < required.length; i++) {
    if (
      kidlearnV3_4d4IsUnmapped_(
        unmapped,
        required[i]
      )
    ) {
      errors.push(
        'DATA_LessonProgress không map được required field: ' +
        required[i]
      );
    }
  }

  var existingRowNumber = 0;

  if (
    childIdColumnIndex > 0 &&
    lessonIdColumnIndex > 0
  ) {
    existingRowNumber =
      kidlearnV3_4d4FindExistingProgressRow_(
        sheet,
        headerInfo,
        childIdColumnIndex,
        lessonIdColumnIndex,
        payload.childId,
        payload.lessonId
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
    targetSheet: 'DATA_LessonProgress',
    operation: 'CONTROLLED_DEV_UPSERT',
    operationMode: operationMode,
    willWriteNow: false,
    actualSheetWritePerformed: false,
    headerRowIndex: headerInfo.headerRowIndex,
    targetRowNumber: targetRowNumber,
    rowLength: rowValues.length,
    rowValues: rowValues,
    rowObjectByHeader:
      kidlearnV3_4d4BuildRowObjectByHeader_(
        headerInfo,
        rowValues
      ),
    progressId: progressId,
    progressIdColumnIndex: progressIdColumnIndex,
    childIdColumnIndex: childIdColumnIndex,
    lessonIdColumnIndex: lessonIdColumnIndex,
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
function kidlearnV3_4d4BuildAuditRowPlan_(
  headerInfo,
  payload,
  progressId,
  progressRowNumber,
  operationMode
) {
  var errors = [];
  var warnings = [];

  var now =
    new Date().toISOString();

  var auditId =
    'AUD_4D4_DEV_' + new Date().getTime();

  var details = {
    phase: '4D-4',
    controlledDevRealWrite: true,
    targetSheet: 'DATA_LessonProgress',
    progressId: progressId,
    progressRowNumber: progressRowNumber,
    operationMode: operationMode,
    childId: payload.childId,
    lessonId: payload.lessonId,
    subjectCode: payload.subjectCode,
    status: payload.status,
    progressPercent: payload.progressPercent,
    currentStepIndex: payload.currentStepIndex,
    actualSheetWritePerformed: true,
    prodWriteAllowed: false,
    note:
      'Controlled DEV real write audit for DATA_LessonProgress.'
  };

  var canonicalData = {
    auditId: auditId,
    action: 'REAL_WRITE_DATA_LESSON_PROGRESS_4D4',
    entityType: 'DATA_LessonProgress',
    entityId: progressId,
    detailsJson: JSON.stringify(details),
    createdAt: now,
    actorId: payload.childId,
    source: '4D-4',
    environment: 'DEV'
  };

  var aliasMap =
    kidlearnV3_4d4GetAuditFieldAliasMap_();

  var rowValues =
    kidlearnV3_4d4BuildBlankRow_(headerInfo.lastColumn);

  var matched = [];
  var unmapped = [];
  var auditIdColumnIndex = 0;

  for (var key in canonicalData) {
    if (!canonicalData.hasOwnProperty(key)) continue;

    var match =
      kidlearnV3_4d4FindHeaderMatch_(
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
          kidlearnV3_4d4PreviewValue_(canonicalData[key])
      });
    } else {
      unmapped.push({
        canonical: key,
        valuePreview:
          kidlearnV3_4d4PreviewValue_(canonicalData[key])
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
      kidlearnV3_4d4IsUnmapped_(
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
      kidlearnV3_4d4BuildRowObjectByHeader_(
        headerInfo,
        rowValues
      ),
    auditId: auditId,
    auditIdColumnIndex: auditIdColumnIndex,
    entityId: progressId,
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
 * Dùng lessonId test riêng để tránh đè tiến độ học thật.
 */
function kidlearnV3_4d4BuildSamplePayload_() {
  var now =
    new Date().toISOString();

  return {
    progressId: '',
    childId: 'CHD_V2_CHILD_DEFAULT',
    lessonId: 'MATH_L1_4D4_DEV_TEST_' + new Date().getTime(),
    subjectCode: 'MATH',
    status: 'IN_PROGRESS',
    progressPercent: 50,
    currentStepIndex: 2,
    startedAt: now,
    completedAt: '',
    updatedAt: now
  };
}


/**
 * Normalize payload.
 */
function kidlearnV3_4d4NormalizeProgressPayload_(payload) {
  payload = payload || {};

  var progressPercent =
    Number(payload.progressPercent || 0);

  if (isNaN(progressPercent)) {
    progressPercent = 0;
  }

  if (progressPercent < 0) progressPercent = 0;
  if (progressPercent > 100) progressPercent = 100;

  var currentStepIndex =
    Number(payload.currentStepIndex || 0);

  if (isNaN(currentStepIndex)) {
    currentStepIndex = 0;
  }

  return {
    progressId:
      String(payload.progressId || '').trim(),
    childId:
      String(payload.childId || 'CHD_V2_CHILD_DEFAULT').trim(),
    lessonId:
      String(payload.lessonId || '').trim(),
    subjectCode:
      String(payload.subjectCode || payload.subjectKey || '').trim(),
    status:
      String(payload.status || 'IN_PROGRESS').trim().toUpperCase(),
    progressPercent:
      progressPercent,
    currentStepIndex:
      currentStepIndex,
    startedAt:
      String(payload.startedAt || new Date().toISOString()).trim(),
    completedAt:
      String(payload.completedAt || '').trim(),
    updatedAt:
      String(payload.updatedAt || new Date().toISOString()).trim()
  };
}


/**
 * Find existing progress row by childId + lessonId.
 */
function kidlearnV3_4d4FindExistingProgressRow_(
  sheet,
  headerInfo,
  childIdColumnIndex,
  lessonIdColumnIndex,
  childId,
  lessonId
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

  var childValues =
    sheet
      .getRange(startRow, childIdColumnIndex, rowCount, 1)
      .getValues();

  var lessonValues =
    sheet
      .getRange(startRow, lessonIdColumnIndex, rowCount, 1)
      .getValues();

  for (var i = 0; i < rowCount; i++) {
    if (
      String(childValues[i][0]) === String(childId) &&
      String(lessonValues[i][0]) === String(lessonId)
    ) {
      return startRow + i;
    }
  }

  return 0;
}


/**
 * DEV safety.
 */
function kidlearnV3_4d4CheckDevSafety_() {
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
function kidlearnV3_4d4VerifyRowContainsId_(
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
function kidlearnV3_4d4InspectSheetHeaders_(spreadsheet, sheetName, warnings) {
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
    kidlearnV3_4d4GetSheetByExactName_(
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
    kidlearnV3_4d4HeaderScore_(values[1]) >=
      kidlearnV3_4d4HeaderScore_(values[0]) &&
    kidlearnV3_4d4HeaderScore_(values[1]) >= 3
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
        kidlearnV3_4d4NormalizeLookupKey_(raw)
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


function kidlearnV3_4d4HeaderScore_(row) {
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


function kidlearnV3_4d4FindHeaderMatch_(headers, aliases) {
  var map = {};

  for (var i = 0; i < aliases.length; i++) {
    map[
      kidlearnV3_4d4NormalizeLookupKey_(aliases[i])
    ] = true;
  }

  for (var j = 0; j < headers.length; j++) {
    if (map[headers[j].normalized]) {
      return headers[j];
    }
  }

  return null;
}


function kidlearnV3_4d4BuildBlankRow_(length) {
  var row = [];

  for (var i = 0; i < length; i++) {
    row.push('');
  }

  return row;
}


function kidlearnV3_4d4BuildRowObjectByHeader_(headerInfo, rowValues) {
  var obj = {};
  var headers = headerInfo.headers || [];

  for (var i = 0; i < headers.length; i++) {
    obj[headers[i].raw] =
      rowValues[headers[i].columnIndex - 1] || '';
  }

  return obj;
}


function kidlearnV3_4d4IsUnmapped_(unmapped, canonical) {
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
function kidlearnV3_4d4GetProgressFieldAliasMap_() {
  return {
    progressId: [
      'progressId',
      'progressid',
      'id',
      'lessonProgressId',
      'lessonprogressid'
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
      'progressStatus',
      'progressstatus',
      'trangThai',
      'trangthai'
    ],
    progressPercent: [
      'progressPercent',
      'progresspercent',
      'percent',
      'completionPercent',
      'completionpercent',
      'tiendo'
    ],
    currentStepIndex: [
      'currentStepIndex',
      'currentstepindex',
      'stepIndex',
      'stepindex',
      'currentStep',
      'currentstep'
    ],
    startedAt: [
      'startedAt',
      'startedat',
      'startTime',
      'starttime'
    ],
    completedAt: [
      'completedAt',
      'completedat',
      'finishedAt',
      'finishedat'
    ],
    updatedAt: [
      'updatedAt',
      'updatedat',
      'modifiedAt',
      'modifiedat'
    ]
  };
}


function kidlearnV3_4d4GetAuditFieldAliasMap_() {
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
function kidlearnV3_4d4OpenSpreadsheet_() {
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


function kidlearnV3_4d4GetSheetByExactName_(spreadsheet, sheetName) {
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
function kidlearnV3_4d4NormalizeLookupKey_(value) {
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


function kidlearnV3_4d4PreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 120) {
    return text.substring(0, 120) + '...';
  }

  return text;
}


function kidlearnV3_4d4UniqueArray_(items) {
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


function kidlearnV3_4d4SafeCall_(functionName) {
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


function kidlearnV3_4d4SaveWriteRecord_(writeRecord) {
  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_KEYS.LAST_WRITE_JSON,
      JSON.stringify(writeRecord)
    );
}


function kidlearnV3_4d4SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.PARENT_PHASE,
      status: status,
      writeName:
        KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.WRITE_NAME,
      nextBundle:
        KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_LESSON_PROGRESS_REAL_WRITE_4D4_CONFIG.NEXT_STAGE,
      prodWriteAllowed: false,
      realWriteAllowed: true,
      actualSheetWritePerformed:
        result.actualSheetWritePerformed === true,
      targetSheet:
        result.targetSheet || 'DATA_LessonProgress',
      auditSheet:
        result.auditSheet || 'LOG_Audit',
      progressId:
        result.progressId || '',
      auditId:
        result.auditId || '',
      progressRowNumber:
        result.progressRowNumber || '',
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


function kidlearnV3_4d4ReadJsonProperty_(key) {
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