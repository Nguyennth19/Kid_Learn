/**
 * ================================================================
 * KIDLEARN V3 - PREPARE LEGACY V2 SHEETS
 * Step: 3H.4
 * Version: 3.1.0
 * ================================================================
 *
 * Bản này dùng exact sheet name.
 * Không nhầm Data_Users với DATA_Users.
 */


/**
 * Data_Scores là Sheet tùy chọn.
 */
function kidlearnV3_isOptionalLegacySheet_(
  sourceName
) {
  return sourceName === 'Data_Scores';
}


/**
 * Xem trước trạng thái đổi tên Sheet V2.
 */
function kidlearnV3_previewLegacyRename() {
  var context =
    kidlearnV3_assertDevEnvironment_();

  var spreadsheet =
    context.spreadsheet;

  var plan =
    kidlearnV3_buildLegacyRenamePlan_(
      spreadsheet
    );

  var result = {
    success: true,

    environment:
      context.environment,

    spreadsheetName:
      context.spreadsheetName,

    totalCount:
      plan.length,

    readyCount:
      kidlearnV3_countLegacyPlanStatus_(
        plan,
        'READY'
      ),

    alreadyRenamedCount:
      kidlearnV3_countLegacyPlanStatus_(
        plan,
        'ALREADY_RENAMED'
      ),

    optionalMissingCount:
      kidlearnV3_countLegacyPlanStatus_(
        plan,
        'OPTIONAL_MISSING'
      ),

    missingCount:
      kidlearnV3_countLegacyPlanStatus_(
        plan,
        'MISSING'
      ),

    conflictCount:
      kidlearnV3_countLegacyPlanStatus_(
        plan,
        'CONFLICT'
      ),

    caseConflictCount:
      kidlearnV3_countLegacyPlanStatus_(
        plan,
        'CASE_CONFLICT'
      ),

    backup:
      kidlearnV3_getStoredBackupInfo_(),

    plan:
      plan
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Backup và đổi tên các Sheet V2 hiện có.
 */
function kidlearnV3_backupAndRenameLegacySheets() {
  var preview =
    kidlearnV3_previewLegacyRename();

  kidlearnV3_assertLegacyPreviewReady_(
    preview
  );

  var completedCount =
    preview.alreadyRenamedCount +
    preview.optionalMissingCount;

  if (
    preview.readyCount === 0 &&
    completedCount === preview.totalCount
  ) {
    var noChangeResult = {
      success: true,
      action: 'NO_CHANGE',
      message:
        'Các Sheet V2 hiện có đã được đổi tên. ' +
        'Sheet tùy chọn không tồn tại.',
      backup: preview.backup,
      renamePreview: preview
    };

    console.log(
      JSON.stringify(
        noChangeResult,
        null,
        2
      )
    );

    return noChangeResult;
  }

  var backupResult =
    kidlearnV3_backupDatabaseV3();

  var renameResult =
    kidlearnV3_renameLegacySheets();

  var result = {
    success: true,
    action:
      'BACKUP_AND_RENAME_COMPLETED',
    backup:
      backupResult,
    rename:
      renameResult
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Chỉ đổi tên Sheet V2.
 * Bắt buộc đã có backup hợp lệ.
 */
function kidlearnV3_renameLegacySheets() {
  var context =
    kidlearnV3_assertDevEnvironment_();

  var backupInfo =
    kidlearnV3_assertValidBackup_();

  var spreadsheet =
    context.spreadsheet;

  var preview =
    kidlearnV3_previewLegacyRename();

  kidlearnV3_assertLegacyPreviewReady_(
    preview
  );

  var lock =
    LockService.getDocumentLock();

  var locked =
    lock.tryLock(
      KIDLEARN_V3.LOCK_TIMEOUT_MS
    );

  if (!locked) {
    throw new Error(
      'Không lấy được document lock. ' +
      'Có thể tiến trình khác đang chạy.'
    );
  }

  try {
    var map =
      KIDLEARN_V2_LEGACY_SHEET_MAP;

    var sourceNames =
      Object.keys(map);

    var report = [];

    for (
      var i = 0;
      i < sourceNames.length;
      i++
    ) {
      var sourceName =
        sourceNames[i];

      var targetName =
        map[sourceName];

      var sourceSheet =
        kidlearnV3_getSheetByExactName_(
          spreadsheet,
          sourceName
        );

      var targetSheet =
        kidlearnV3_getSheetByExactName_(
          spreadsheet,
          targetName
        );

      if (
        sourceSheet &&
        targetSheet
      ) {
        throw new Error(
          'Xung đột: đồng thời tồn tại ' +
          sourceName +
          ' và ' +
          targetName +
          '.'
        );
      }

      if (
        !sourceSheet &&
        targetSheet
      ) {
        report.push({
          sourceName:
            sourceName,
          targetName:
            targetName,
          action:
            'ALREADY_RENAMED'
        });

        continue;
      }

      if (
        !sourceSheet &&
        !targetSheet
      ) {
        if (
          kidlearnV3_isOptionalLegacySheet_(
            sourceName
          )
        ) {
          report.push({
            sourceName:
              sourceName,
            targetName:
              targetName,
            action:
              'OPTIONAL_MISSING'
          });

          continue;
        }

        throw new Error(
          'Không tìm thấy Sheet nguồn hoặc Legacy: ' +
          sourceName
        );
      }

      sourceSheet.setName(
        targetName
      );

      report.push({
        sourceName:
          sourceName,
        targetName:
          targetName,
        action:
          'RENAMED'
      });
    }

    SpreadsheetApp.flush();

    kidlearnV3_verifyLegacyRename_(
      spreadsheet
    );

    kidlearnV3_setSetupStatus_(
      KIDLEARN_V3
        .SETUP_STATUS
        .LEGACY_RENAMED
    );

    var result = {
      success: true,

      setupStatus:
        KIDLEARN_V3
          .SETUP_STATUS
          .LEGACY_RENAMED,

      backupFileId:
        backupInfo.backupFileId,

      backupName:
        backupInfo.backupName,

      renamedCount:
        kidlearnV3_countLegacyReportAction_(
          report,
          'RENAMED'
        ),

      alreadyRenamedCount:
        kidlearnV3_countLegacyReportAction_(
          report,
          'ALREADY_RENAMED'
        ),

      optionalMissingCount:
        kidlearnV3_countLegacyReportAction_(
          report,
          'OPTIONAL_MISSING'
        ),

      totalProcessed:
        report.length,

      sheets:
        report
    };

    console.log(
      JSON.stringify(result, null, 2)
    );

    return result;

  } catch (error) {
    kidlearnV3_setSetupStatus_(
      KIDLEARN_V3
        .SETUP_STATUS
        .FAILED
    );

    throw error;

  } finally {
    lock.releaseLock();
  }
}


/**
 * Xây dựng kế hoạch đổi tên Sheet V2.
 */
function kidlearnV3_buildLegacyRenamePlan_(
  spreadsheet
) {
  var map =
    KIDLEARN_V2_LEGACY_SHEET_MAP;

  var sourceNames =
    Object.keys(map);

  var plan = [];

  for (
    var i = 0;
    i < sourceNames.length;
    i++
  ) {
    var sourceName =
      sourceNames[i];

    var targetName =
      map[sourceName];

    var sourceSheet =
      kidlearnV3_getSheetByExactName_(
        spreadsheet,
        sourceName
      );

    var targetSheet =
      kidlearnV3_getSheetByExactName_(
        spreadsheet,
        targetName
      );

    var caseConflict =
      kidlearnV3_findLegacyCaseConflict_(
        spreadsheet,
        targetName
      );

    var item = {
      order:
        i + 1,

      sourceName:
        sourceName,

      targetName:
        targetName,

      sourceExists:
        sourceSheet !== null,

      targetExists:
        targetSheet !== null,

      optional:
        kidlearnV3_isOptionalLegacySheet_(
          sourceName
        ),

      status:
        '',

      message:
        ''
    };

    if (caseConflict) {
      item.status =
        'CASE_CONFLICT';

      item.message =
        'Có Sheet gần giống tên Legacy: ' +
        caseConflict.getName();

      plan.push(item);
      continue;
    }

    if (
      sourceSheet &&
      targetSheet
    ) {
      item.status =
        'CONFLICT';

      item.message =
        'Đồng thời tồn tại Sheet nguồn và Sheet Legacy.';

      plan.push(item);
      continue;
    }

    if (
      sourceSheet &&
      !targetSheet
    ) {
      item.status =
        'READY';

      item.message =
        'Sẵn sàng đổi tên.';

      plan.push(item);
      continue;
    }

    if (
      !sourceSheet &&
      targetSheet
    ) {
      item.status =
        'ALREADY_RENAMED';

      item.message =
        'Sheet đã được đổi tên trước đó.';

      plan.push(item);
      continue;
    }

    if (
      kidlearnV3_isOptionalLegacySheet_(
        sourceName
      )
    ) {
      item.status =
        'OPTIONAL_MISSING';

      item.message =
        'Sheet tùy chọn không tồn tại. ' +
        'Có thể tiếp tục quy trình.';

      plan.push(item);
      continue;
    }

    item.status =
      'MISSING';

    item.message =
      'Không tìm thấy Sheet nguồn hoặc Legacy.';

    plan.push(item);
  }

  return plan;
}


/**
 * Tìm xung đột tên Legacy nếu chỉ khác chữ hoa/thường.
 */
function kidlearnV3_findLegacyCaseConflict_(
  spreadsheet,
  targetName
) {
  var sheets =
    spreadsheet.getSheets();

  var lowerTarget =
    String(targetName).toLowerCase();

  for (
    var i = 0;
    i < sheets.length;
    i++
  ) {
    var actualName =
      sheets[i].getName();

    if (
      actualName !== targetName &&
      actualName.toLowerCase() === lowerTarget
    ) {
      return sheets[i];
    }
  }

  return null;
}


/**
 * Dừng nếu preview có lỗi nghiêm trọng.
 */
function kidlearnV3_assertLegacyPreviewReady_(
  preview
) {
  if (
    preview.conflictCount > 0
  ) {
    throw new Error(
      'DỪNG THỰC THI: Có Sheet nguồn và ' +
      'Sheet Legacy cùng tồn tại.'
    );
  }

  if (
    preview.caseConflictCount > 0
  ) {
    throw new Error(
      'DỪNG THỰC THI: Có xung đột tên Sheet ' +
      'không phân biệt chữ hoa thường.'
    );
  }

  if (
    preview.missingCount > 0
  ) {
    throw new Error(
      'DỪNG THỰC THI: Có Sheet V2 bắt buộc bị thiếu.'
    );
  }

  return true;
}


/**
 * Xác nhận các Sheet V2 hiện có đã được đổi tên.
 */
function kidlearnV3_verifyLegacyRename_(
  spreadsheet
) {
  var map =
    KIDLEARN_V2_LEGACY_SHEET_MAP;

  var sourceNames =
    Object.keys(map);

  var errors = [];

  for (
    var i = 0;
    i < sourceNames.length;
    i++
  ) {
    var sourceName =
      sourceNames[i];

    var targetName =
      map[sourceName];

    var sourceSheet =
      kidlearnV3_getSheetByExactName_(
        spreadsheet,
        sourceName
      );

    var targetSheet =
      kidlearnV3_getSheetByExactName_(
        spreadsheet,
        targetName
      );

    if (sourceSheet) {
      errors.push(
        'Sheet nguồn vẫn còn: ' +
        sourceName
      );

      continue;
    }

    if (targetSheet) {
      continue;
    }

    if (
      kidlearnV3_isOptionalLegacySheet_(
        sourceName
      )
    ) {
      continue;
    }

    errors.push(
      'Thiếu Sheet Legacy bắt buộc: ' +
      targetName
    );
  }

  if (errors.length > 0) {
    throw new Error(
      'Kiểm tra Legacy thất bại: ' +
      errors.join(' | ')
    );
  }

  return true;
}


/**
 * Đếm trạng thái trong kế hoạch.
 */
function kidlearnV3_countLegacyPlanStatus_(
  plan,
  status
) {
  var count = 0;

  for (
    var i = 0;
    i < plan.length;
    i++
  ) {
    if (
      plan[i].status === status
    ) {
      count++;
    }
  }

  return count;
}


/**
 * Đếm hành động trong báo cáo.
 */
function kidlearnV3_countLegacyReportAction_(
  report,
  action
) {
  var count = 0;

  for (
    var i = 0;
    i < report.length;
    i++
  ) {
    if (
      report[i].action === action
    ) {
      count++;
    }
  }

  return count;
}