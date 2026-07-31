/**
 * ================================================================
 * KIDLEARN V3 - DATABASE BACKUP
 * Step: 3H.4
 * Version: 3.1.0
 * ================================================================
 *
 * Tạo bản sao toàn bộ Spreadsheet DEV trước khi đổi tên Sheet V2.
 *
 * KHÔNG sửa dữ liệu nguồn.
 * KHÔNG xóa Sheet.
 * KHÔNG đổi tên Sheet.
 */


/**
 * Xem trạng thái backup hiện tại.
 *
 * Hàm chỉ đọc dữ liệu.
 */
function kidlearnV3_previewDatabaseBackup() {
  var context = kidlearnV3_assertDevEnvironment_();
  var storedBackup = kidlearnV3_getStoredBackupInfo_();

  var result = {
    success: true,
    environment: context.environment,
    spreadsheetName: context.spreadsheetName,
    spreadsheetId: context.spreadsheetId,
    setupStatus: context.setupStatus,
    storedBackup: storedBackup
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Tạo một bản sao mới của toàn bộ Spreadsheet DEV.
 *
 * Mỗi lần chạy sẽ tạo một backup mới.
 */
function kidlearnV3_backupDatabaseV3() {
  var context = kidlearnV3_assertDevEnvironment_();

  var lock = LockService.getScriptLock();

  var locked = lock.tryLock(
    KIDLEARN_V3.LOCK_TIMEOUT_MS
  );

  if (!locked) {
    throw new Error(
      'Không lấy được script lock. ' +
      'Có thể một tiến trình khác đang chạy.'
    );
  }

  try {
    var spreadsheet = context.spreadsheet;

    var originalFile = DriveApp.getFileById(
      spreadsheet.getId()
    );

    var backupName =
      kidlearnV3_buildBackupName_(spreadsheet);

    var backupFile =
      kidlearnV3_createBackupCopy_(
        originalFile,
        backupName
      );

    var createdAt = new Date();

    backupFile.setDescription(
      'KIDLEARN V3 backup trước khi đổi tên Sheet V2. ' +
      'Nguồn: ' +
      spreadsheet.getName() +
      '. Schema: ' +
      KIDLEARN_V3.SCHEMA_VERSION +
      '. Tạo lúc: ' +
      createdAt.toISOString()
    );

    var properties =
      PropertiesService.getScriptProperties();

    properties.setProperty(
      KIDLEARN_V3
        .SCRIPT_PROPERTIES
        .LAST_BACKUP_FILE_ID,
      backupFile.getId()
    );

    properties.setProperty(
      'KIDLEARN_LAST_BACKUP_NAME',
      backupFile.getName()
    );

    properties.setProperty(
      'KIDLEARN_LAST_BACKUP_CREATED_AT',
      createdAt.toISOString()
    );

    kidlearnV3_setSetupStatus_(
      KIDLEARN_V3.SETUP_STATUS.BACKUP_COMPLETED
    );

    var result = {
      success: true,
      action: 'BACKUP_CREATED',
      backupFileId: backupFile.getId(),
      backupName: backupFile.getName(),
      backupUrl: backupFile.getUrl(),
      sourceSpreadsheetId: spreadsheet.getId(),
      sourceSpreadsheetName: spreadsheet.getName(),
      createdAt: createdAt.toISOString(),
      setupStatus:
        KIDLEARN_V3.SETUP_STATUS.BACKUP_COMPLETED
    };

    console.log(
      JSON.stringify(result, null, 2)
    );

    return result;

  } finally {
    lock.releaseLock();
  }
}


/**
 * Tạo tên backup có timestamp.
 */
function kidlearnV3_buildBackupName_(
  spreadsheet
) {
  var timeZone =
    spreadsheet.getSpreadsheetTimeZone();

  if (!timeZone) {
    timeZone = Session.getScriptTimeZone();
  }

  if (!timeZone) {
    timeZone = 'Asia/Ho_Chi_Minh';
  }

  var timestamp = Utilities.formatDate(
    new Date(),
    timeZone,
    'yyyyMMdd_HHmmss'
  );

  return (
    'BACKUP_' +
    spreadsheet.getName() +
    '_PRE_V3_' +
    timestamp
  );
}


/**
 * Tạo bản sao trong cùng thư mục với file nguồn.
 *
 * Nếu không xác định được thư mục, backup được tạo
 * trong My Drive.
 */
function kidlearnV3_createBackupCopy_(
  originalFile,
  backupName
) {
  var parents = originalFile.getParents();

  if (parents.hasNext()) {
    var parentFolder = parents.next();

    return originalFile.makeCopy(
      backupName,
      parentFolder
    );
  }

  return originalFile.makeCopy(
    backupName
  );
}


/**
 * Đọc thông tin backup gần nhất từ Script Properties.
 */
function kidlearnV3_getStoredBackupInfo_() {
  var properties =
    PropertiesService.getScriptProperties();

  var backupFileId = properties.getProperty(
    KIDLEARN_V3
      .SCRIPT_PROPERTIES
      .LAST_BACKUP_FILE_ID
  );

  var backupName = properties.getProperty(
    'KIDLEARN_LAST_BACKUP_NAME'
  );

  var createdAt = properties.getProperty(
    'KIDLEARN_LAST_BACKUP_CREATED_AT'
  );

  if (!backupFileId) {
    return {
      exists: false,
      valid: false,
      message: 'Chưa có backup được ghi nhận.'
    };
  }

  try {
    var backupFile =
      DriveApp.getFileById(backupFileId);

    if (backupFile.isTrashed()) {
      return {
        exists: true,
        valid: false,
        backupFileId: backupFileId,
        backupName: backupName,
        createdAt: createdAt,
        message: 'File backup đang nằm trong thùng rác.'
      };
    }

    return {
      exists: true,
      valid: true,
      backupFileId: backupFile.getId(),
      backupName: backupFile.getName(),
      backupUrl: backupFile.getUrl(),
      createdAt: createdAt,
      message: 'Backup hợp lệ.'
    };

  } catch (error) {
    return {
      exists: true,
      valid: false,
      backupFileId: backupFileId,
      backupName: backupName,
      createdAt: createdAt,
      message:
        'Không truy cập được file backup: ' +
        String(error.message || error)
    };
  }
}


/**
 * Bắt buộc phải có backup hợp lệ trước khi đổi tên Legacy.
 */
function kidlearnV3_assertValidBackup_() {
  var backupInfo =
    kidlearnV3_getStoredBackupInfo_();

  if (!backupInfo.valid) {
    throw new Error(
      'DỪNG THỰC THI: Chưa có backup hợp lệ. ' +
      backupInfo.message
    );
  }

  return backupInfo;
}