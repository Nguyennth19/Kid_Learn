/**
 * ================================================================
 * KIDLEARN V3 - RESPONSE METADATA COLUMN PATCH
 * Step: 4D-3P
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Add answerMetaJson column to DATA_Responses if missing.
 * - This protects traceability for childId, lessonId, activityId, answerMode.
 *
 * Safety:
 * - Chỉ sửa schema DEV.
 * - Không ghi DATA_Responses data row.
 * - Có ghi 01 audit row vào LOG_Audit nếu thêm cột thật.
 * - Không ghi PROD.
 * - Cần confirm text rõ ràng.
 */


var KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4D3P_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4D3P_LAST_PREVIEW_AT',
  LAST_PATCH_AT: 'KIDLEARN_V3_PHASE_4D3P_LAST_PATCH_AT',
  LAST_VERIFY_AT: 'KIDLEARN_V3_PHASE_4D3P_LAST_VERIFY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4D3P_LAST_RESULT_JSON'
};


var KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  READY_FOR_4D3_PREFLIGHT: 'READY_FOR_4D3_PREFLIGHT',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG = {
  PHASE: '4D-3P',
  PARENT_PHASE: '4D',
  TARGET_SHEET: 'DATA_Responses',
  AUDIT_SHEET: 'LOG_Audit',
  TARGET_COLUMN_KEY: 'answerMetaJson',
  TARGET_COLUMN_LABEL: 'Metadata câu trả lời',
  CONFIRM_TEXT: 'CONFIRM_ADD_RESPONSE_METADATA_COLUMN_4D3P',
  NEXT_ACTION: 'Rerun kidlearnV3_previewResponseRealWrite4D3V3',
  PROD_WRITE_ALLOWED: false,
  REAL_SCHEMA_WRITE_ALLOWED: true
};


/**
 * Preview patch.
 * Không ghi sheet.
 */
function kidlearnV3_previewResponseMetadataColumnPatch4D3PV3() {
  var plan =
    kidlearnV3_4d3pBuildPatchPlan_();

  plan.action =
    'PREVIEW_RESPONSE_METADATA_COLUMN_PATCH_4D_3P_V3';

  kidlearnV3_4d3pSaveStatus_(
    plan,
    plan.success
      ? KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_STATUS.PREVIEWED
      : KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_STATUS.FAILED,
    KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(plan, null, 2));

  if (!plan.success) {
    throw new Error(
      '4D-3P preview failed. Errors=' +
      plan.errors.join(' | ')
    );
  }

  return plan;
}


/**
 * Public confirm wrapper.
 * Có thể ghi schema DEV nếu thiếu answerMetaJson.
 */
function kidlearnV3_addResponseMetadataColumn4D3PConfirmV3() {
  return kidlearnV3_addResponseMetadataColumn4D3PV3({
    confirm:
      KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.CONFIRM_TEXT,
    reviewerNote:
      'Add answerMetaJson column to DATA_Responses for traceability before 4D-3 real write.'
  });
}


/**
 * Controlled schema patch.
 */
function kidlearnV3_addResponseMetadataColumn4D3PV3(options) {
  options = options || {};

  var confirmText =
    String(options.confirm || '')
      .trim()
      .toUpperCase();

  if (
    confirmText !==
    KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.CONFIRM_TEXT
  ) {
    throw new Error(
      'Thiếu confirm. Cần confirm=' +
      KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.CONFIRM_TEXT
    );
  }

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
      kidlearnV3_4d3pBuildPatchPlan_();

    if (!plan.success) {
      throw new Error(
        '4D-3P plan chưa pass. Errors=' +
        plan.errors.join(' | ')
      );
    }

    /**
     * Nếu cột đã tồn tại thì không ghi gì thêm.
     */
    if (plan.metadataColumnDetected) {
      var alreadyResult = {
        success: true,
        action: 'ADD_RESPONSE_METADATA_COLUMN_4D_3P_ALREADY_EXISTS_V3',
        phase:
          KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.PHASE,
        status:
          KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_STATUS.READY_FOR_4D3_PREFLIGHT,
        targetSheet:
          KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.TARGET_SHEET,
        metadataColumnDetected:
          plan.metadataColumnDetected,
        schemaWritePerformed: false,
        auditWritePerformed: false,
        actualSheetWritePerformed: false,
        prodWriteAllowed: false,
        realSchemaWriteAllowed: true,
        nextAction:
          KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.NEXT_ACTION,
        message:
          'answerMetaJson/detailsJson đã tồn tại. Không cần thêm cột.'
      };

      kidlearnV3_4d3pSaveStatus_(
        alreadyResult,
        KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_STATUS.READY_FOR_4D3_PREFLIGHT,
        KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_KEYS.LAST_PATCH_AT
      );

      console.log(JSON.stringify(alreadyResult, null, 2));
      return alreadyResult;
    }

    var spreadsheet =
      kidlearnV3_4d3pOpenSpreadsheet_();

    var responseSheet =
      kidlearnV3_4d3pGetSheetByExactName_(
        spreadsheet,
        KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.TARGET_SHEET
      );

    var auditSheet =
      kidlearnV3_4d3pGetSheetByExactName_(
        spreadsheet,
        KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.AUDIT_SHEET
      );

    if (!responseSheet) {
      throw new Error('Không tìm thấy DATA_Responses.');
    }

    if (!auditSheet) {
      throw new Error('Không tìm thấy LOG_Audit.');
    }

    var before = {
      dataResponsesLastColumn:
        responseSheet.getLastColumn(),
      dataResponsesLastRow:
        responseSheet.getLastRow(),
      logAuditLastRow:
        auditSheet.getLastRow()
    };

    var targetColumn =
      before.dataResponsesLastColumn + 1;

    /**
     * Nếu sheet có 2 dòng header:
     * - Row 1: label tiếng Việt
     * - Row 2: field key
     *
     * Nếu sheet có 1 dòng header:
     * - Ghi trực tiếp answerMetaJson vào header row.
     */
    if (plan.responseHeaderInfo.headerRowIndex === 2) {
      responseSheet
        .getRange(1, targetColumn)
        .setValue(
          KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.TARGET_COLUMN_LABEL
        );

      responseSheet
        .getRange(2, targetColumn)
        .setValue(
          KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.TARGET_COLUMN_KEY
        );
    } else {
      responseSheet
        .getRange(
          plan.responseHeaderInfo.headerRowIndex || 1,
          targetColumn
        )
        .setValue(
          KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.TARGET_COLUMN_KEY
        );
    }

    SpreadsheetApp.flush();

    var afterSchema = {
      dataResponsesLastColumn:
        responseSheet.getLastColumn(),
      dataResponsesLastRow:
        responseSheet.getLastRow()
    };

    var auditHeaderInfo =
      kidlearnV3_4d3pInspectSheetHeaders_(
        spreadsheet,
        KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.AUDIT_SHEET,
        []
      );

    var auditPlan =
      kidlearnV3_4d3pBuildAuditRowPlan_(
        auditHeaderInfo,
        {
          targetColumn: targetColumn,
          headerRowIndex:
            plan.responseHeaderInfo.headerRowIndex,
          before: before,
          afterSchema: afterSchema,
          reviewerNote:
            String(options.reviewerNote || '')
        }
      );

    if (!auditPlan.success) {
      throw new Error(
        'Không build được audit row 4D-3P. Errors=' +
        auditPlan.errors.join(' | ')
      );
    }

    auditSheet.appendRow(
      auditPlan.rowValues
    );

    SpreadsheetApp.flush();

    var after = {
      dataResponsesLastColumn:
        responseSheet.getLastColumn(),
      dataResponsesLastRow:
        responseSheet.getLastRow(),
      logAuditLastRow:
        auditSheet.getLastRow()
    };

    var result = {
      success: true,
      action: 'ADD_RESPONSE_METADATA_COLUMN_4D_3P_V3',
      phase:
        KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.PHASE,
      parentPhase:
        KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.PARENT_PHASE,
      status:
        KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_STATUS.READY_FOR_4D3_PREFLIGHT,
      targetSheet:
        KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.TARGET_SHEET,
      addedColumnKey:
        KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.TARGET_COLUMN_KEY,
      addedColumnLabel:
        KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.TARGET_COLUMN_LABEL,
      addedColumnIndex:
        targetColumn,
      headerRowIndex:
        plan.responseHeaderInfo.headerRowIndex,
      auditSheet:
        KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.AUDIT_SHEET,
      auditId:
        auditPlan.auditId,
      before: before,
      after: after,
      columnDelta:
        after.dataResponsesLastColumn -
        before.dataResponsesLastColumn,
      rowDelta: {
        DATA_Responses:
          after.dataResponsesLastRow -
          before.dataResponsesLastRow,
        LOG_Audit:
          after.logAuditLastRow -
          before.logAuditLastRow
      },
      schemaWritePerformed: true,
      auditWritePerformed: true,
      actualSheetWritePerformed: true,
      learningDataWritePerformed: false,
      prodWriteAllowed: false,
      realSchemaWriteAllowed: true,
      nextAction:
        KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.NEXT_ACTION,
      patchedAt:
        new Date().toISOString()
    };

    kidlearnV3_4d3pSaveStatus_(
      result,
      KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_STATUS.READY_FOR_4D3_PREFLIGHT,
      KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_KEYS.LAST_PATCH_AT
    );

    console.log(JSON.stringify(result, null, 2));
    return result;

  } finally {
    lock.releaseLock();
  }
}


/**
 * Verify metadata column exists.
 */
function kidlearnV3_verifyResponseMetadataColumn4D3PV3() {
  var errors = [];
  var warnings = [];

  var spreadsheet =
    kidlearnV3_4d3pOpenSpreadsheet_();

  var responseHeaderInfo =
    kidlearnV3_4d3pInspectSheetHeaders_(
      spreadsheet,
      KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.TARGET_SHEET,
      warnings
    );

  var metadataColumn =
    kidlearnV3_4d3pDetectMetadataColumn_(
      responseHeaderInfo
    );

  if (!metadataColumn) {
    errors.push(
      'DATA_Responses vẫn chưa có answerMetaJson/detailsJson/metaJson/payloadJson.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'VERIFY_RESPONSE_METADATA_COLUMN_4D_3P_V3',
    phase:
      KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_STATUS.READY_FOR_4D3_PREFLIGHT
        : KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_STATUS.FAILED,
    targetSheet:
      KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.TARGET_SHEET,
    metadataColumnDetected:
      metadataColumn,
    prodWriteAllowed: false,
    realSchemaWriteAllowed: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4d3pSaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_KEYS.LAST_VERIFY_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      'Verify 4D-3P failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Assert patch ready.
 */
function kidlearnV3_assertResponseMetadataColumn4D3PReadyV3() {
  var verify =
    kidlearnV3_verifyResponseMetadataColumn4D3PV3();

  var result = {
    success: verify.success === true,
    action: 'ASSERT_RESPONSE_METADATA_COLUMN_4D_3P_READY_V3',
    phase:
      KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.PHASE,
    status:
      verify.status,
    nextAction:
      KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.NEXT_ACTION,
    prodWriteAllowed: false,
    realSchemaWriteAllowed: true,
    metadataColumnDetected:
      verify.metadataColumnDetected,
    errorCount:
      verify.errorCount || 0,
    errors:
      verify.errors || []
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(result.errors.join(' | '));
  }

  return result;
}


/**
 * Build patch plan.
 */
function kidlearnV3_4d3pBuildPatchPlan_() {
  var errors = [];
  var warnings = [];

  var d2 =
    kidlearnV3_4d3pSafeCall_(
      'kidlearnV3_assertResponseWriteDryRun4D2ReadyV3'
    );

  if (!d2.success) {
    errors.push(
      '4D-2 chưa READY_FOR_4D_3: ' +
      d2.message
    );
  }

  var dev =
    kidlearnV3_4d3pCheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  warnings =
    warnings.concat(dev.warnings || []);

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4d3pOpenSpreadsheet_();
  } catch (error) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(error.message || error)
    );
  }

  var responseHeaderInfo = null;
  var auditHeaderInfo = null;
  var metadataColumn = null;
  var auditPlan = null;

  if (spreadsheet) {
    responseHeaderInfo =
      kidlearnV3_4d3pInspectSheetHeaders_(
        spreadsheet,
        KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.TARGET_SHEET,
        warnings
      );

    auditHeaderInfo =
      kidlearnV3_4d3pInspectSheetHeaders_(
        spreadsheet,
        KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.AUDIT_SHEET,
        warnings
      );

    if (!responseHeaderInfo.exists) {
      errors.push('Không tìm thấy DATA_Responses.');
    } else {
      metadataColumn =
        kidlearnV3_4d3pDetectMetadataColumn_(
          responseHeaderInfo
        );
    }

    if (!auditHeaderInfo.exists) {
      errors.push('Không tìm thấy LOG_Audit.');
    } else if (!metadataColumn) {
      auditPlan =
        kidlearnV3_4d3pBuildAuditRowPlan_(
          auditHeaderInfo,
          {
            targetColumn:
              responseHeaderInfo
                ? responseHeaderInfo.lastColumn + 1
                : '',
            headerRowIndex:
              responseHeaderInfo
                ? responseHeaderInfo.headerRowIndex
                : '',
            before: null,
            afterSchema: null,
            reviewerNote:
              'Preview audit row for adding answerMetaJson column.'
          }
        );

      if (!auditPlan.success) {
        errors =
          errors.concat(auditPlan.errors || []);
      }
    }
  }

  return {
    success: errors.length === 0,
    action: 'BUILD_RESPONSE_METADATA_COLUMN_PATCH_PLAN_4D_3P_V3',
    phase:
      KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.PARENT_PHASE,
    targetSheet:
      KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.TARGET_SHEET,
    targetColumnKey:
      KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.TARGET_COLUMN_KEY,
    auditSheet:
      KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.AUDIT_SHEET,
    metadataColumnDetected:
      metadataColumn,
    patchNeeded:
      metadataColumn ? false : true,
    responseHeaderInfo:
      responseHeaderInfo,
    auditHeaderInfo:
      auditHeaderInfo,
    auditPlan:
      auditPlan,
    willWriteNow: false,
    actualSheetWritePerformed: false,
    prodWriteAllowed: false,
    realSchemaWriteAllowed: true,
    errorCount: errors.length,
    warningCount:
      kidlearnV3_4d3pUniqueArray_(warnings).length,
    errors: errors,
    warnings:
      kidlearnV3_4d3pUniqueArray_(warnings)
  };
}


/**
 * Build LOG_Audit row.
 */
function kidlearnV3_4d3pBuildAuditRowPlan_(headerInfo, detailsInput) {
  var errors = [];
  var now =
    new Date().toISOString();

  var auditId =
    'AUD_4D3P_SCHEMA_' + new Date().getTime();

  var details = {
    phase: '4D-3P',
    action: 'ADD_RESPONSE_METADATA_COLUMN',
    targetSheet:
      KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.TARGET_SHEET,
    addedColumnKey:
      KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.TARGET_COLUMN_KEY,
    addedColumnLabel:
      KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.TARGET_COLUMN_LABEL,
    targetColumn:
      detailsInput.targetColumn,
    headerRowIndex:
      detailsInput.headerRowIndex,
    before:
      detailsInput.before,
    afterSchema:
      detailsInput.afterSchema,
    reviewerNote:
      detailsInput.reviewerNote || '',
    learningDataWritePerformed: false,
    prodWriteAllowed: false,
    schemaPatch: true
  };

  var canonicalData = {
    auditId: auditId,
    action: 'ADD_RESPONSE_METADATA_COLUMN_4D3P',
    entityType: 'DATA_Responses',
    entityId: 'answerMetaJson',
    detailsJson:
      JSON.stringify(details),
    createdAt: now,
    actorId: 'SYSTEM_4D3P',
    source: '4D-3P',
    environment: 'DEV'
  };

  var aliasMap =
    kidlearnV3_4d3pGetAuditFieldAliasMap_();

  var rowValues =
    kidlearnV3_4d3pBuildBlankRow_(
      headerInfo.lastColumn
    );

  var matched = [];
  var unmapped = [];
  var auditIdColumnIndex = 0;

  for (var key in canonicalData) {
    if (!canonicalData.hasOwnProperty(key)) continue;

    var match =
      kidlearnV3_4d3pFindHeaderMatch_(
        headerInfo.headers || [],
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
        columnIndex: match.columnIndex
      });
    } else {
      unmapped.push({
        canonical: key
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
      kidlearnV3_4d3pIsUnmapped_(
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
    operation: 'APPEND_SCHEMA_PATCH_AUDIT',
    rowValues: rowValues,
    auditId: auditId,
    auditIdColumnIndex: auditIdColumnIndex,
    matchedFields: matched,
    unmappedFields: unmapped,
    errorCount: errors.length,
    errors: errors
  };
}


/**
 * Detect metadata column.
 */
function kidlearnV3_4d3pDetectMetadataColumn_(headerInfo) {
  if (!headerInfo || !headerInfo.headers) return null;

  var aliases = [
    'answerMetaJson',
    'answermetajson',
    'detailsJson',
    'detailsjson',
    'metaJson',
    'metajson',
    'payloadJson',
    'payloadjson',
    'metadataJson',
    'metadatajson'
  ];

  return kidlearnV3_4d3pFindHeaderMatch_(
    headerInfo.headers,
    aliases
  );
}


/**
 * Header helpers.
 */
function kidlearnV3_4d3pInspectSheetHeaders_(spreadsheet, sheetName, warnings) {
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
    kidlearnV3_4d3pGetSheetByExactName_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return {
      exists: false,
      sheetName: sheetName,
      headerRowIndex: 0,
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

  var row1Score =
    kidlearnV3_4d3pHeaderScore_(values[0] || []);

  var row2Score =
    values.length > 1
      ? kidlearnV3_4d3pHeaderScore_(values[1] || [])
      : 0;

  var headerRowIndex =
    row2Score >= 3 && row2Score >= row1Score
      ? 2
      : 1;

  var headerRow =
    values[headerRowIndex - 1] || [];

  var headers = [];

  for (var i = 0; i < headerRow.length; i++) {
    var raw =
      String(headerRow[i] || '').trim();

    if (!raw) continue;

    headers.push({
      columnIndex: i + 1,
      raw: raw,
      normalized:
        kidlearnV3_4d3pNormalizeLookupKey_(raw)
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


function kidlearnV3_4d3pHeaderScore_(row) {
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


function kidlearnV3_4d3pFindHeaderMatch_(headers, aliases) {
  var map = {};

  for (var i = 0; i < aliases.length; i++) {
    map[
      kidlearnV3_4d3pNormalizeLookupKey_(aliases[i])
    ] = true;
  }

  for (var j = 0; j < headers.length; j++) {
    if (map[headers[j].normalized]) {
      return headers[j];
    }
  }

  return null;
}


function kidlearnV3_4d3pIsUnmapped_(unmapped, canonical) {
  for (var i = 0; i < unmapped.length; i++) {
    if (unmapped[i].canonical === canonical) {
      return true;
    }
  }

  return false;
}


function kidlearnV3_4d3pBuildBlankRow_(length) {
  var row = [];

  for (var i = 0; i < length; i++) {
    row.push('');
  }

  return row;
}


function kidlearnV3_4d3pGetAuditFieldAliasMap_() {
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
 * DEV safety.
 */
function kidlearnV3_4d3pCheckDevSafety_() {
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
    realSchemaWriteAllowed: true,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Spreadsheet helpers.
 */
function kidlearnV3_4d3pOpenSpreadsheet_() {
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


function kidlearnV3_4d3pGetSheetByExactName_(spreadsheet, sheetName) {
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
function kidlearnV3_4d3pNormalizeLookupKey_(value) {
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


function kidlearnV3_4d3pUniqueArray_(items) {
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


function kidlearnV3_4d3pSafeCall_(functionName) {
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


function kidlearnV3_4d3pSaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.PHASE,
      status: status,
      targetSheet:
        KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.TARGET_SHEET,
      targetColumnKey:
        KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.TARGET_COLUMN_KEY,
      metadataColumnDetected:
        result.metadataColumnDetected || null,
      schemaWritePerformed:
        result.schemaWritePerformed === true,
      auditWritePerformed:
        result.auditWritePerformed === true,
      actualSheetWritePerformed:
        result.actualSheetWritePerformed === true,
      learningDataWritePerformed:
        result.learningDataWritePerformed === true,
      prodWriteAllowed: false,
      realSchemaWriteAllowed: true,
      nextAction:
        KIDLEARN_V3_RESPONSE_META_PATCH_4D3P_CONFIG.NEXT_ACTION,
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