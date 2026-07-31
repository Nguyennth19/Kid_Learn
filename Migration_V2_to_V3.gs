/**
 * ================================================================
 * KIDLEARN V3 - PREPARE LEGACY V2 SHEETS
 * Step: 3H.4
 * Version: 3.1.0
 * ================================================================
 *
 * Chức năng:
 * - Xem trước kế hoạch đổi tên Sheet V2.
 * - Cho phép Data_Scores không tồn tại.
 * - Kiểm tra backup.
 * - Đổi tên Sheet V2 sang LEGACY_V2_*.
 *
 * KHÔNG xóa Sheet.
 * KHÔNG tạo Sheet V3.
 * KHÔNG migration dữ liệu.
 */


/**
 * Data_Scores là Sheet tùy chọn.
 *
 * Một số bản V2 không có Sheet này.
 */
function kidlearnV3_isOptionalLegacySheet_(
  sourceName
) {
  var optionalSheets = [
    'Data_Scores'
  ];

  return (
    optionalSheets.indexOf(sourceName) !== -1
  );
}


/**
 * Xem trước trạng thái các Sheet V2.
 *
 * Hàm chỉ đọc dữ liệu.
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
 * Quy trình an toàn:
 *
 * 1. Kiểm tra Sheet V2.
 * 2. Tạo backup.
 * 3. Đổi tên các Sheet hiện có.
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

      action:
        'NO_CHANGE',

      message:
        'Các Sheet V2 hiện có đã được đổi tên. ' +
        'Sheet Legacy tùy chọn không tồn tại.',

      backup:
        preview.backup,

      renamePreview:
        preview
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
 * Đổi tên các Sheet V2 đang tồn tại.
 *
 * Data_Scores không tồn tại sẽ được bỏ qua.
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
      'Có thể một tiến trình khác đang chạy.'
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
        spreadsheet.getSheetByName(
          sourceName
        );

      var targetSheet =
        spreadsheet.getSheetByName(
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
      JSON.stringify(
        result,
        null,
        2
      )
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
      spreadsheet.getSheetByName(
        sourceName
      );

    var targetSheet =
      spreadsheet.getSheetByName(
        targetName
      );

    var targetCaseConflict =
      kidlearnV3_findSheetIgnoreCase_(
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

    if (targetCaseConflict) {
      item.status =
        'CASE_CONFLICT';

      item.message =
        'Có Sheet gần giống tên Legacy: ' +
        targetCaseConflict.getName();

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
      'DỪNG THỰC THI: Có Sheet V2 bắt buộc bị thiếu. ' +
      'Xem kết quả preview.'
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
      spreadsheet.getSheetByName(
        sourceName
      );

    var targetSheet =
      spreadsheet.getSheetByName(
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