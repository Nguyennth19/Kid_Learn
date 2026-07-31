/**
 * ================================================================
 * KIDLEARN V3 - REAL WRITE SMALL TRANSACTION DEV
 * Step: 3J.7
 * Version: 3.1.0
 * ================================================================
 *
 * File này chạy một giao dịch ghi thật nhỏ trong DEV.
 *
 * Giao dịch test:
 * - Append 01 row vào LOG_Audit
 *
 * Có snapshot before/after.
 * Có rollback thủ công nếu cần.
 *
 * KHÔNG sửa PROD.
 * CHỈ chạy khi Controlled Write DEV đã ENABLED.
 */


var KIDLEARN_V3_REAL_WRITE_TEST_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3J7_STATUS',
  LAST_RUN_AT: 'KIDLEARN_V3_PHASE_3J7_LAST_RUN_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3J7_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3J7_LAST_RESULT_JSON',
  LAST_TRANSACTION_ID: 'KIDLEARN_V3_PHASE_3J7_LAST_TRANSACTION_ID',
  LAST_ROLLBACK_AT: 'KIDLEARN_V3_PHASE_3J7_LAST_ROLLBACK_AT',
  LAST_ROLLBACK_JSON: 'KIDLEARN_V3_PHASE_3J7_LAST_ROLLBACK_JSON'
};

var KIDLEARN_V3_REAL_WRITE_TEST_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PASSED: 'PASSED',
  FAILED: 'FAILED',
  ROLLED_BACK: 'ROLLED_BACK',
  READY_FOR_NEXT: 'READY_FOR_NEXT'
};

var KIDLEARN_V3_REAL_WRITE_TEST_CONFIG = {
  VERSION: '3J.7',
  TARGET_SHEET: 'LOG_Audit',
  CONFIRM_WRITE_TOKEN: 'CONFIRM_WRITE_V3',
  CONFIRM_ROLLBACK_TOKEN: 'CONFIRM_ROLLBACK_3J7',
  NEXT_PHASE: '3J.8'
};

var KIDLEARN_V3_REAL_WRITE_TARGET_SHEETS = [
  'LOG_Audit',
  'DATA_StudySessions',
  'DATA_LessonProgress',
  'DATA_Assignments',
  'DATA_DailyGoals'
];


/**
 * Preview trước khi chạy real write nhỏ.
 */
function kidlearnV3_previewRealWriteSmallTransactionDevV3() {
  var errors = [];
  var warnings = [];

  var requiredFunctions = [
    'kidlearnV3_assertControlledWriteDevEnabledV3',
    'kidlearnV3_getControlledWriteDevStatusV3',
    'kidlearnV3_getSafeWriteLayerStatusV3',
    'kidlearnV3_writeServiceSubmitV3',
    'kidlearnV3_assertDryRunNoDatabaseChangesV3',
    'kidlearnV3_appGetActiveDatabaseV3_'
  ];

  var functionChecks =
    kidlearnV3_realWriteCheckFunctions_(
      requiredFunctions
    );

  errors =
    errors.concat(
      functionChecks.errors
    );

  var controlledWrite =
    kidlearnV3_realWriteSafeControlledWriteStatus_();

  if (
    controlledWrite.status !== 'ENABLED' ||
    controlledWrite.safeWriteMode !== 'ENABLED' ||
    controlledWrite.safeWriteEnabled !== true
  ) {
    errors.push(
      'Controlled Write DEV chưa ENABLED. Hãy chạy 3J.6 trước.'
    );
  }

  var safeWrite =
    kidlearnV3_realWriteSafeWriteStatus_();

  if (
    safeWrite.mode !== 'ENABLED' ||
    safeWrite.enabled !== true
  ) {
    errors.push(
      'Safe Write Layer chưa ENABLED.'
    );
  }

  var dryRunCheck =
    kidlearnV3_realWriteSafe3J5Assert_();

  if (!dryRunCheck.success) {
    errors.push(
      '3J.5 chưa xác nhận DRY_RUN no-write: ' +
      dryRunCheck.message
    );
  }

  var targetCheck =
    kidlearnV3_realWriteCheckTargetSheets_();

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
    action: 'PREVIEW_REAL_WRITE_SMALL_TRANSACTION_DEV_V3',
    phase: '3J.7',
    targetSheet:
      KIDLEARN_V3_REAL_WRITE_TEST_CONFIG.TARGET_SHEET,
    writeOperation: 'AUDIT_LOG',
    canRunRealWrite: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    controlledWriteStatus: controlledWrite,
    safeWriteStatus: safeWrite,
    dryRunCheck3J5: dryRunCheck,
    targetSheets: targetCheck.items,
    functionChecks: functionChecks.items
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Chạy giao dịch ghi thật nhỏ trong DEV.
 *
 * Chỉ append 01 row vào LOG_Audit.
 */
function kidlearnV3_runRealWriteSmallTransactionDevV3() {
  var startedAt =
    new Date();

  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewRealWriteSmallTransactionDevV3();

  if (!preview.success) {
    throw new Error(
      'Không thể chạy real write 3J.7. Preview chưa đạt. Errors: ' +
      preview.errorCount
    );
  }

  var transactionId =
    kidlearnV3_realWriteMakeTransactionId_();

  var beforeSnapshot =
    kidlearnV3_realWriteSnapshotSheets_(
      KIDLEARN_V3_REAL_WRITE_TARGET_SHEETS
    );

  var writeResponse =
    kidlearnV3_writeServiceSubmitV3({
      operation: 'AUDIT_LOG',
      dryRun: false,
      confirmWrite:
        KIDLEARN_V3_REAL_WRITE_TEST_CONFIG.CONFIRM_WRITE_TOKEN,
      payload: {
        eventType: 'REAL_WRITE_SMALL_TRANSACTION_3J7',
        action: 'REAL_WRITE_TEST',
        message:
          '3J.7 real write small transaction test in DEV.',
        entityType: 'PHASE',
        entityId: transactionId,
        status: 'INFO',
        details: {
          phase: '3J.7',
          transactionId: transactionId,
          targetSheet:
            KIDLEARN_V3_REAL_WRITE_TEST_CONFIG.TARGET_SHEET,
          purpose:
            'Verify one controlled real write in DEV.'
        }
      }
    });

  if (!writeResponse.success) {
    errors.push(
      'Write Service submit thất bại: ' +
      kidlearnV3_realWriteGetErrorMessage_(
        writeResponse
      )
    );
  }

  var writeInfo =
    kidlearnV3_realWriteExtractWriteInfo_(
      writeResponse
    );

  if (
    writeResponse.success &&
    writeInfo.executed !== true
  ) {
    errors.push(
      'Write response success nhưng executed không phải true.'
    );
  }

  SpreadsheetApp.flush();
  Utilities.sleep(500);

  var afterSnapshot =
    kidlearnV3_realWriteSnapshotSheets_(
      KIDLEARN_V3_REAL_WRITE_TARGET_SHEETS
    );

  var diff =
    kidlearnV3_realWriteCompareExpectedChange_(
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

  var rollbackPlan =
    kidlearnV3_realWriteBuildRollbackPlan_(
      transactionId,
      writeInfo
    );

  var finishedAt =
    new Date();

  var result = {
    success: errors.length === 0,
    action: 'RUN_REAL_WRITE_SMALL_TRANSACTION_DEV_V3',
    phase: '3J.7',
    transactionId: transactionId,
    targetSheet:
      KIDLEARN_V3_REAL_WRITE_TEST_CONFIG.TARGET_SHEET,
    writeOperation: 'AUDIT_LOG',
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    writeInfo: writeInfo,
    beforeSnapshot: beforeSnapshot.summary,
    afterSnapshot: afterSnapshot.summary,
    diff: diff,
    rollbackPlan: rollbackPlan,
    checklist:
      kidlearnV3_realWriteBuildChecklist_(
        errors,
        warnings,
        diff,
        writeInfo
      )
  };

  kidlearnV3_realWriteSaveResult_(
    result
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3J.7 real write transaction chưa đạt. Errors: ' +
      result.errorCount
    );
  }

  return result;
}


/**
 * Xem trạng thái 3J.7.
 */
function kidlearnV3_getRealWriteSmallTransactionStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_REAL_WRITE_SMALL_TRANSACTION_STATUS_V3',
    phase: '3J.7',
    status:
      properties.getProperty(
        KIDLEARN_V3_REAL_WRITE_TEST_KEYS.STATUS
      ) ||
      KIDLEARN_V3_REAL_WRITE_TEST_STATUS.NOT_RUN,
    lastRunAt:
      properties.getProperty(
        KIDLEARN_V3_REAL_WRITE_TEST_KEYS.LAST_RUN_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_REAL_WRITE_TEST_KEYS.LAST_READY_AT
      ) ||
      '',
    lastTransactionId:
      properties.getProperty(
        KIDLEARN_V3_REAL_WRITE_TEST_KEYS.LAST_TRANSACTION_ID
      ) ||
      '',
    lastRollbackAt:
      properties.getProperty(
        KIDLEARN_V3_REAL_WRITE_TEST_KEYS.LAST_ROLLBACK_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_realWriteReadLastResult_(),
    lastRollback:
      kidlearnV3_realWriteReadLastRollback_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Tạo rollback plan thủ công cho dòng test 3J.7 vừa ghi.
 */
function kidlearnV3_prepareManualRollbackPlan3J7V3() {
  var status =
    kidlearnV3_getRealWriteSmallTransactionStatusV3();

  var last =
    status.lastResult || {};

  var rollbackPlan =
    last.rollbackPlan || null;

  var result = {
    success: !!rollbackPlan,
    action: 'PREPARE_MANUAL_ROLLBACK_PLAN_3J7_V3',
    phase: '3J.7',
    rollbackPlan: rollbackPlan,
    manualSteps: [
      'Mở sheet LOG_Audit.',
      'Tìm dòng có transactionId/entityId đúng như rollbackPlan.transactionId.',
      'Kiểm tra eventType = REAL_WRITE_SMALL_TRANSACTION_3J7.',
      'Nếu cần rollback, xóa đúng dòng test này.',
      'Không xóa các dòng audit khác.'
    ],
    optionalScriptRollback:
      'Có thể chạy kidlearnV3_rollbackLastRealWriteSmallTransactionDevV3({confirmRollback:"CONFIRM_ROLLBACK_3J7"}) nếu muốn rollback bằng script.'
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Rollback bằng script cho transaction test cuối cùng.
 *
 * Chỉ xóa dòng test nếu tìm thấy transactionId trong LOG_Audit.
 * Cần confirmRollback token.
 */
function kidlearnV3_rollbackLastRealWriteSmallTransactionDevV3(request) {
  var safeRequest =
    kidlearnV3_realWriteNormalizeRequest_(
      request
    );

  if (
    String(safeRequest.confirmRollback || '') !==
    KIDLEARN_V3_REAL_WRITE_TEST_CONFIG.CONFIRM_ROLLBACK_TOKEN
  ) {
    throw new Error(
      'Thiếu confirmRollback=CONFIRM_ROLLBACK_3J7. Không rollback.'
    );
  }

  var status =
    kidlearnV3_getRealWriteSmallTransactionStatusV3();

  var last =
    status.lastResult || {};

  var transactionId =
    last.transactionId || status.lastTransactionId || '';

  if (!transactionId) {
    throw new Error(
      'Không tìm thấy transactionId của 3J.7 để rollback.'
    );
  }

  var spreadsheet =
    kidlearnV3_realWriteGetDatabaseSpreadsheet_();

  var sheet =
    kidlearnV3_realWriteGetSheet_(
      spreadsheet,
      KIDLEARN_V3_REAL_WRITE_TEST_CONFIG.TARGET_SHEET
    );

  if (!sheet) {
    throw new Error(
      'Không tìm thấy sheet LOG_Audit để rollback.'
    );
  }

  var beforeSnapshot =
    kidlearnV3_realWriteSnapshotSheets_([
      KIDLEARN_V3_REAL_WRITE_TEST_CONFIG.TARGET_SHEET
    ]);

  var rowNumber =
    kidlearnV3_realWriteFindRowContainingText_(
      sheet,
      transactionId
    );

  if (rowNumber < 3) {
    throw new Error(
      'Không tìm thấy row chứa transactionId để rollback: ' +
      transactionId
    );
  }

  var rowValues =
    sheet
      .getRange(
        rowNumber,
        1,
        1,
        sheet.getLastColumn()
      )
      .getDisplayValues()[0];

  var rowText =
    rowValues.join(' | ');

  if (
    rowText.indexOf('REAL_WRITE_SMALL_TRANSACTION_3J7') === -1 &&
    rowText.indexOf(transactionId) === -1
  ) {
    throw new Error(
      'Row tìm thấy không giống row test 3J.7. Dừng rollback.'
    );
  }

  sheet.deleteRow(rowNumber);

  SpreadsheetApp.flush();
  Utilities.sleep(500);

  var afterSnapshot =
    kidlearnV3_realWriteSnapshotSheets_([
      KIDLEARN_V3_REAL_WRITE_TEST_CONFIG.TARGET_SHEET
    ]);

  var result = {
    success: true,
    action: 'ROLLBACK_LAST_REAL_WRITE_SMALL_TRANSACTION_DEV_V3',
    phase: '3J.7',
    transactionId: transactionId,
    targetSheet:
      KIDLEARN_V3_REAL_WRITE_TEST_CONFIG.TARGET_SHEET,
    deletedRowNumber: rowNumber,
    rolledBackAt: new Date().toISOString(),
    beforeSnapshot: beforeSnapshot.summary,
    afterSnapshot: afterSnapshot.summary,
    message:
      'Đã rollback bằng cách xóa row test 3J.7 trong LOG_Audit.'
  };

  kidlearnV3_realWriteSaveRollback_(
    result
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Mark 3J.7 ready cho bước kế tiếp.
 */
function kidlearnV3_markRealWriteSmallTransactionReadyV3() {
  var status =
    kidlearnV3_getRealWriteSmallTransactionStatusV3();

  var allowed =
    status.status === 'PASSED' ||
    status.status === 'ROLLED_BACK';

  if (!allowed) {
    throw new Error(
      'Không thể mark READY_FOR_NEXT. 3J.7 status hiện tại: ' +
      status.status
    );
  }

  var now =
    new Date();

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_REAL_WRITE_TEST_KEYS.STATUS,
    KIDLEARN_V3_REAL_WRITE_TEST_STATUS.READY_FOR_NEXT
  );

  properties.setProperty(
    KIDLEARN_V3_REAL_WRITE_TEST_KEYS.LAST_READY_AT,
    now.toISOString()
  );

  var result = {
    success: true,
    action: 'MARK_REAL_WRITE_SMALL_TRANSACTION_READY_V3',
    phase: '3J.7',
    status: 'READY_FOR_NEXT',
    nextPhase:
      KIDLEARN_V3_REAL_WRITE_TEST_CONFIG.NEXT_PHASE,
    message:
      '3J.7 đã sẵn sàng chuyển sang bước kế tiếp.'
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3J.7 đã pass.
 */
function kidlearnV3_assertRealWriteSmallTransactionDevPassedV3() {
  var status =
    kidlearnV3_getRealWriteSmallTransactionStatusV3();

  var errors = [];

  if (
    status.status !== 'PASSED' &&
    status.status !== 'ROLLED_BACK' &&
    status.status !== 'READY_FOR_NEXT'
  ) {
    errors.push(
      '3J.7 chưa PASSED/ROLLED_BACK/READY_FOR_NEXT. Status hiện tại: ' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_REAL_WRITE_SMALL_TRANSACTION_DEV_PASSED_V3',
    phase: '3J.7',
    errorCount: errors.length,
    errors: errors,
    status: status.status,
    transactionId: status.lastTransactionId
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3J.7 chưa đủ điều kiện. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * Compare expected change:
 * - LOG_Audit được phép tăng 1 row và checksum đổi.
 * - Các sheet khác không được đổi.
 */
function kidlearnV3_realWriteCompareExpectedChange_(
  beforeSnapshot,
  afterSnapshot
) {
  var errors = [];
  var warnings = [];

  var beforeMap =
    kidlearnV3_realWriteMapSnapshots_(
      beforeSnapshot.items
    );

  var afterMap =
    kidlearnV3_realWriteMapSnapshots_(
      afterSnapshot.items
    );

  var sheetNames =
    Object.keys(beforeMap);

  var changedSheets = [];
  var expectedChangedSheets = [];

  for (var i = 0; i < sheetNames.length; i++) {
    var name =
      sheetNames[i];

    var before =
      beforeMap[name];

    var after =
      afterMap[name];

    if (!after) {
      errors.push(
        'Sheet biến mất sau real write: ' +
        name
      );

      continue;
    }

    var isTarget =
      name === KIDLEARN_V3_REAL_WRITE_TEST_CONFIG.TARGET_SHEET;

    if (isTarget) {
      if (after.lastRow !== before.lastRow + 1) {
        errors.push(
          'LOG_Audit phải tăng đúng 1 row. Before=' +
          before.lastRow +
          ', After=' +
          after.lastRow
        );
      }

      if (after.dataRowCount !== before.dataRowCount + 1) {
        errors.push(
          'LOG_Audit dataRowCount phải tăng đúng 1.'
        );
      }

      if (after.checksum === before.checksum) {
        errors.push(
          'LOG_Audit checksum phải thay đổi sau real write.'
        );
      }

      expectedChangedSheets.push(name);
      changedSheets.push(name);

      continue;
    }

    var changed =
      before.lastRow !== after.lastRow ||
      before.lastColumn !== after.lastColumn ||
      before.dataRowCount !== after.dataRowCount ||
      before.checksum !== after.checksum;

    if (changed) {
      changedSheets.push(name);

      errors.push(
        'Sheet không được phép đổi nhưng đã đổi: ' +
        name
      );
    }
  }

  return {
    success: errors.length === 0,
    checkedSheetCount: sheetNames.length,
    changedSheetCount: changedSheets.length,
    changedSheets: changedSheets,
    expectedChangedSheets: expectedChangedSheets,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Build checklist.
 */
function kidlearnV3_realWriteBuildChecklist_(
  errors,
  warnings,
  diff,
  writeInfo
) {
  return [
    {
      item: 'Controlled Write DEV ENABLED',
      status:
        kidlearnV3_realWriteSafeControlledWriteStatus_().status === 'ENABLED'
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'Write Service executed real write',
      status:
        writeInfo.executed === true
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'Only LOG_Audit changed',
      status:
        diff.changedSheets.length === 1 &&
        diff.changedSheets[0] === 'LOG_Audit'
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'LOG_Audit increased by 1 row',
      status:
        diff.success
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: 'Rollback plan generated',
      status:
        writeInfo.transactionId !== ''
          ? 'PASSED'
          : 'FAILED'
    },
    {
      item: '3J.7 result',
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
 * Extract write info từ Write Service response.
 */
function kidlearnV3_realWriteExtractWriteInfo_(
  response
) {
  var info = {
    success:
      response && response.success === true,
    executed: false,
    dryRun: true,
    targetSheet: '',
    writeType: '',
    keyField: '',
    keyValue: '',
    rowNumber: '',
    transactionId: ''
  };

  try {
    var data =
      response.data || {};

    var safeWrite =
      data.safeWrite || {};

    var safeData =
      safeWrite.data || {};

    var plan =
      data.plan ||
      safeData.plan ||
      {};

    var execution =
      safeData.execution || {};

    var executionResult =
      execution.result || {};

    info.executed =
      data.executed === true;

    info.dryRun =
      data.dryRun === true;

    info.targetSheet =
      plan.targetSheet || '';

    info.writeType =
      plan.writeType || '';

    info.keyField =
      plan.keyField || '';

    info.keyValue =
      plan.keyValue || '';

    info.rowNumber =
      executionResult.rowNumber || '';

    info.transactionId =
      plan.object &&
      plan.object.entityId
        ? plan.object.entityId
        : '';

  } catch (error) {
    info.extractError =
      String(error.message || error);
  }

  return info;
}


/**
 * Build rollback plan.
 */
function kidlearnV3_realWriteBuildRollbackPlan_(
  transactionId,
  writeInfo
) {
  return {
    rollbackType: 'DELETE_TEST_AUDIT_ROW',
    targetSheet:
      KIDLEARN_V3_REAL_WRITE_TEST_CONFIG.TARGET_SHEET,
    transactionId: transactionId,
    keyField:
      writeInfo.keyField || '',
    keyValue:
      writeInfo.keyValue || '',
    rowNumber:
      writeInfo.rowNumber || '',
    verifyBeforeDelete: [
      'entityId phải bằng transactionId',
      'eventType phải bằng REAL_WRITE_SMALL_TRANSACTION_3J7',
      'Không xóa nếu row không khớp'
    ],
    scriptRollbackFunction:
      'kidlearnV3_rollbackLastRealWriteSmallTransactionDevV3',
    requiredConfirmRollback:
      KIDLEARN_V3_REAL_WRITE_TEST_CONFIG.CONFIRM_ROLLBACK_TOKEN
  };
}


/**
 * Snapshot nhiều sheet.
 */
function kidlearnV3_realWriteSnapshotSheets_(
  sheetNames
) {
  var spreadsheet =
    kidlearnV3_realWriteGetDatabaseSpreadsheet_();

  var items = [];
  var summary = [];

  for (var i = 0; i < sheetNames.length; i++) {
    var item =
      kidlearnV3_realWriteSnapshotSheet_(
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
function kidlearnV3_realWriteSnapshotSheet_(
  spreadsheet,
  sheetName
) {
  var sheet =
    kidlearnV3_realWriteGetSheet_(
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
      kidlearnV3_realWriteMd5_(
        text
      )
  };
}


/**
 * Check target sheets.
 */
function kidlearnV3_realWriteCheckTargetSheets_() {
  var errors = [];
  var warnings = [];
  var items = [];

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_realWriteGetDatabaseSpreadsheet_();

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
    i < KIDLEARN_V3_REAL_WRITE_TARGET_SHEETS.length;
    i++
  ) {
    var sheetName =
      KIDLEARN_V3_REAL_WRITE_TARGET_SHEETS[i];

    var sheet =
      kidlearnV3_realWriteGetSheet_(
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
 * Get database spreadsheet.
 */
function kidlearnV3_realWriteGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_realWriteResolveSpreadsheet_(
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
function kidlearnV3_realWriteResolveSpreadsheet_(
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
function kidlearnV3_realWriteGetSheet_(
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
 * Find row containing text.
 */
function kidlearnV3_realWriteFindRowContainingText_(
  sheet,
  text
) {
  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (
    lastRow < 3 ||
    lastColumn < 1
  ) {
    return -1;
  }

  var values =
    sheet
      .getRange(
        3,
        1,
        lastRow - 2,
        lastColumn
      )
      .getDisplayValues();

  for (var i = values.length - 1; i >= 0; i--) {
    var rowText =
      values[i].join(' | ');

    if (rowText.indexOf(text) >= 0) {
      return i + 3;
    }
  }

  return -1;
}


/**
 * Save result.
 */
function kidlearnV3_realWriteSaveResult_(
  result
) {
  var status =
    result.success
      ? KIDLEARN_V3_REAL_WRITE_TEST_STATUS.PASSED
      : KIDLEARN_V3_REAL_WRITE_TEST_STATUS.FAILED;

  var compact = {
    success: result.success,
    action: result.action,
    phase: result.phase,
    transactionId: result.transactionId,
    targetSheet: result.targetSheet,
    writeOperation: result.writeOperation,
    finishedAt: result.finishedAt,
    durationMs: result.durationMs,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    writeInfo: result.writeInfo,
    diff: result.diff,
    rollbackPlan: result.rollbackPlan,
    checklist: result.checklist
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_REAL_WRITE_TEST_KEYS.STATUS,
    status
  );

  properties.setProperty(
    KIDLEARN_V3_REAL_WRITE_TEST_KEYS.LAST_RUN_AT,
    new Date().toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_REAL_WRITE_TEST_KEYS.LAST_TRANSACTION_ID,
    result.transactionId || ''
  );

  properties.setProperty(
    KIDLEARN_V3_REAL_WRITE_TEST_KEYS.LAST_RESULT_JSON,
    JSON.stringify(compact)
  );
}


/**
 * Save rollback.
 */
function kidlearnV3_realWriteSaveRollback_(
  result
) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_REAL_WRITE_TEST_KEYS.STATUS,
    KIDLEARN_V3_REAL_WRITE_TEST_STATUS.ROLLED_BACK
  );

  properties.setProperty(
    KIDLEARN_V3_REAL_WRITE_TEST_KEYS.LAST_ROLLBACK_AT,
    new Date().toISOString()
  );

  properties.setProperty(
    KIDLEARN_V3_REAL_WRITE_TEST_KEYS.LAST_ROLLBACK_JSON,
    JSON.stringify(result)
  );
}


/**
 * Read last result.
 */
function kidlearnV3_realWriteReadLastResult_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_REAL_WRITE_TEST_KEYS.LAST_RESULT_JSON
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
 * Read last rollback.
 */
function kidlearnV3_realWriteReadLastRollback_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_REAL_WRITE_TEST_KEYS.LAST_ROLLBACK_JSON
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
 * Map snapshots.
 */
function kidlearnV3_realWriteMapSnapshots_(
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
 * Check functions.
 */
function kidlearnV3_realWriteCheckFunctions_(
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
 * Safe controlled write status.
 */
function kidlearnV3_realWriteSafeControlledWriteStatus_() {
  try {
    return kidlearnV3_getControlledWriteDevStatusV3();
  } catch (error) {
    return {
      success: false,
      status: '',
      safeWriteMode: '',
      safeWriteEnabled: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Safe SafeWrite status.
 */
function kidlearnV3_realWriteSafeWriteStatus_() {
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
 * Safe 3J.5 assert.
 */
function kidlearnV3_realWriteSafe3J5Assert_() {
  try {
    var result =
      kidlearnV3_assertDryRunNoDatabaseChangesV3();

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
 * Error message helper.
 */
function kidlearnV3_realWriteGetErrorMessage_(
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
    response.details.safeWriteResponse &&
    response.details.safeWriteResponse.error &&
    response.details.safeWriteResponse.error.message
  ) {
    return response.details.safeWriteResponse.error.message;
  }

  return 'Không rõ lỗi.';
}


/**
 * Normalize request.
 */
function kidlearnV3_realWriteNormalizeRequest_(
  request
) {
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


/**
 * Make transaction ID.
 */
function kidlearnV3_realWriteMakeTransactionId_() {
  var text =
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss_SSS'
    );

  var random =
    Math.floor(
      Math.random() * 100000
    );

  return (
    'TX_3J7_' +
    text +
    '_' +
    random
  );
}


/**
 * MD5 checksum.
 */
function kidlearnV3_realWriteMd5_(
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


function kidlearnV3_testRollback3J7V3() {
  return kidlearnV3_rollbackLastRealWriteSmallTransactionDevV3({
    confirmRollback: 'CONFIRM_ROLLBACK_3J7'
  });
}