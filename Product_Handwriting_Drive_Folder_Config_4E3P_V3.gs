/**
 * KIDLEARN V3 - 4E-3P
 * Manual Drive Folder ID Config for Handwriting Storage
 *
 * Purpose:
 * - Register manually created Google Drive folders.
 * - Prevent auto-creating root project folders outside project flow.
 */


var KIDLEARN_V3_HANDWRITING_DRIVE_CONFIG_4E3P_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4E3P_FOLDER_CONFIG_STATUS',
  ROOT_FOLDER_ID: 'KIDLEARN_V3_HANDWRITING_ROOT_FOLDER_ID',
  HANDWRITING_FOLDER_ID: 'KIDLEARN_V3_HANDWRITING_FOLDER_ID',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4E3P_FOLDER_CONFIG_LAST_RESULT_JSON'
};


var KIDLEARN_V3_HANDWRITING_DRIVE_CONFIG_4E3P_STATUS = {
  NOT_RUN: 'NOT_RUN',
  READY: 'READY',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_HANDWRITING_DRIVE_CONFIG_4E3P_CONFIRM =
  'REGISTER_HANDWRITING_DRIVE_FOLDER_IDS_4E3P';


function kidlearnV3_registerHandwritingDriveFolderIds4E3PV3(options) {
  options = options || {};

  var confirmText =
    String(options.confirm || '').trim().toUpperCase();

  if (
    confirmText !==
    KIDLEARN_V3_HANDWRITING_DRIVE_CONFIG_4E3P_CONFIRM
  ) {
    throw new Error(
      'Thiếu confirm. Cần confirm=' +
      KIDLEARN_V3_HANDWRITING_DRIVE_CONFIG_4E3P_CONFIRM
    );
  }

  var rootFolderId =
    String(options.rootFolderId || '').trim();

  var handwritingFolderId =
    String(options.handwritingFolderId || '').trim();

  if (!rootFolderId) {
    throw new Error('Thiếu rootFolderId.');
  }

  if (!handwritingFolderId) {
    throw new Error('Thiếu handwritingFolderId.');
  }

  if (rootFolderId === handwritingFolderId) {
    throw new Error(
      'rootFolderId và handwritingFolderId không được giống nhau.'
    );
  }

  var dev =
    kidlearnV3_4e3pCheckDevSafety_();

  if (!dev.success) {
    throw new Error(
      'DEV safety failed: ' +
      dev.errors.join(' | ')
    );
  }

  var rootFolder =
    DriveApp.getFolderById(rootFolderId);

  var handwritingFolder =
    DriveApp.getFolderById(handwritingFolderId);

  var isChild =
    kidlearnV3_4e3pFolderHasParent_(
      handwritingFolder,
      rootFolderId
    );

  if (!isChild) {
    throw new Error(
      'Folder handwritingFolderId không nằm trực tiếp trong rootFolderId. ' +
      'Vui lòng tạo HANDWRITING_RESPONSES bên trong folder dự án rồi lấy đúng ID.'
    );
  }

  var result = {
    success: true,
    action: 'REGISTER_HANDWRITING_DRIVE_FOLDER_IDS_4E3P_V3',
    phase: '4E-3P',
    status:
      KIDLEARN_V3_HANDWRITING_DRIVE_CONFIG_4E3P_STATUS.READY,
    rootFolderId: rootFolderId,
    rootFolderName: rootFolder.getName(),
    rootFolderUrl: rootFolder.getUrl(),
    handwritingFolderId: handwritingFolderId,
    handwritingFolderName: handwritingFolder.getName(),
    handwritingFolderUrl: handwritingFolder.getUrl(),
    prodWriteAllowed: false,
    actualDriveWritePerformed: false,
    actualSheetWritePerformed: false,
    note:
      'Manual Drive folder IDs registered. 4E-3 will use these folders.',
    registeredAt:
      new Date().toISOString()
  };

  PropertiesService
    .getScriptProperties()
    .setProperties({
      [KIDLEARN_V3_HANDWRITING_DRIVE_CONFIG_4E3P_KEYS.STATUS]:
        KIDLEARN_V3_HANDWRITING_DRIVE_CONFIG_4E3P_STATUS.READY,
      [KIDLEARN_V3_HANDWRITING_DRIVE_CONFIG_4E3P_KEYS.ROOT_FOLDER_ID]:
        rootFolderId,
      [KIDLEARN_V3_HANDWRITING_DRIVE_CONFIG_4E3P_KEYS.HANDWRITING_FOLDER_ID]:
        handwritingFolderId,
      [KIDLEARN_V3_HANDWRITING_DRIVE_CONFIG_4E3P_KEYS.LAST_RESULT_JSON]:
        JSON.stringify(result)
    }, false);

  console.log(JSON.stringify(result, null, 2));
  return result;
}


function kidlearnV3_getHandwritingDriveFolderConfig4E3PV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var rootFolderId =
    properties.getProperty(
      KIDLEARN_V3_HANDWRITING_DRIVE_CONFIG_4E3P_KEYS.ROOT_FOLDER_ID
    ) || '';

  var handwritingFolderId =
    properties.getProperty(
      KIDLEARN_V3_HANDWRITING_DRIVE_CONFIG_4E3P_KEYS.HANDWRITING_FOLDER_ID
    ) || '';

  var errors = [];

  if (!rootFolderId) {
    errors.push('Thiếu rootFolderId trong ScriptProperties.');
  }

  if (!handwritingFolderId) {
    errors.push('Thiếu handwritingFolderId trong ScriptProperties.');
  }

  var rootFolder = null;
  var handwritingFolder = null;

  if (errors.length === 0) {
    try {
      rootFolder =
        DriveApp.getFolderById(rootFolderId);

      handwritingFolder =
        DriveApp.getFolderById(handwritingFolderId);
    } catch (error) {
      errors.push(
        'Không đọc được folder từ Drive ID: ' +
        String(error.message || error)
      );
    }
  }

  var result = {
    success: errors.length === 0,
    action: 'GET_HANDWRITING_DRIVE_FOLDER_CONFIG_4E3P_V3',
    phase: '4E-3P',
    status:
      errors.length === 0
        ? KIDLEARN_V3_HANDWRITING_DRIVE_CONFIG_4E3P_STATUS.READY
        : KIDLEARN_V3_HANDWRITING_DRIVE_CONFIG_4E3P_STATUS.FAILED,
    rootFolderId: rootFolderId,
    rootFolderName: rootFolder ? rootFolder.getName() : '',
    rootFolderUrl: rootFolder ? rootFolder.getUrl() : '',
    handwritingFolderId: handwritingFolderId,
    handwritingFolderName: handwritingFolder ? handwritingFolder.getName() : '',
    handwritingFolderUrl: handwritingFolder ? handwritingFolder.getUrl() : '',
    prodWriteAllowed: false,
    errorCount: errors.length,
    errors: errors
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


function kidlearnV3_assertHandwritingDriveFolderConfig4E3PReadyV3() {
  var config =
    kidlearnV3_getHandwritingDriveFolderConfig4E3PV3();

  if (!config.success) {
    throw new Error(
      '4E-3P folder config chưa ready: ' +
      config.errors.join(' | ')
    );
  }

  return config;
}


function kidlearnV3_4e3pFolderHasParent_(folder, parentId) {
  var parents =
    folder.getParents();

  while (parents.hasNext()) {
    var parent =
      parents.next();

    if (parent.getId() === parentId) {
      return true;
    }
  }

  return false;
}


function kidlearnV3_4e3pCheckDevSafety_() {
  var errors = [];

  var environment = '';

  try {
    if (
      typeof KIDLEARN_V3 !== 'undefined' &&
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

  if (String(environment || '').toUpperCase() !== 'DEV') {
    errors.push(
      'Environment không phải DEV. Current=' +
      (environment || 'UNKNOWN')
    );
  }

  return {
    success: errors.length === 0,
    environment: environment || 'UNKNOWN',
    errors: errors
  };
}

function kidlearnV3_registerMyHandwritingFolders4E3POnce() {
  return kidlearnV3_registerHandwritingDriveFolderIds4E3PV3({
    confirm: 'REGISTER_HANDWRITING_DRIVE_FOLDER_IDS_4E3P',
    rootFolderId: '1MLIY8UjLIuKw-WGaQGlekdZuAw7GXfCz',
    handwritingFolderId: '1BMDZ16E7g4dPX7pzruk933M2R_6o3_P5'
  });
}