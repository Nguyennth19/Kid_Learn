/**
 * ================================================================
 * KIDLEARN V3 - ASSET FOLDER & REGISTRY PLAN
 * Step: 4B-2R-5
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Define long-term asset folder and registry plan.
 * - Validate MST_MediaAssets readiness.
 * - Record 4B-2R-5 plan readiness before moving forward.
 *
 * Safety:
 * - Không ghi Google Sheet dữ liệu học.
 * - Không tạo folder Drive tự động.
 * - Không set public permission tự động.
 * - Không ghi PROD.
 * - Chỉ ghi ScriptProperties trạng thái plan.
 */


var KIDLEARN_V3_ASSET_PLAN_4B2R5_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4B2R5_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4B2R5_LAST_PREVIEW_AT',
  LAST_REGISTRY_CHECK_AT: 'KIDLEARN_V3_PHASE_4B2R5_LAST_REGISTRY_CHECK_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4B2R5_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4B2R5_LAST_RESULT_JSON'
};


var KIDLEARN_V3_ASSET_PLAN_4B2R5_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  REGISTRY_CHECKED: 'REGISTRY_CHECKED',
  READY_FOR_4B_2R_6: 'READY_FOR_4B_2R_6',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_ASSET_PLAN_4B2R5_CONFIG = {
  PHASE: '4B-2R-5',
  PARENT_PHASE: '4B-2R',
  PREVIOUS_BUNDLE: '4B-2R-4',
  NEXT_BUNDLE: '4B-2R-6',
  NEXT_STAGE: 'UI_POLISH_REVIEW',
  PLAN: 'ASSET_FOLDER_AND_REGISTRY_PLAN',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false
};


/**
 * Get official asset folder plan.
 */
function kidlearnV3_getAssetFolderRegistryPlan4B2R5V3() {
  var result = {
    success: true,
    action: 'GET_ASSET_FOLDER_REGISTRY_PLAN_4B_2R_5_V3',
    phase: KIDLEARN_V3_ASSET_PLAN_4B2R5_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_ASSET_PLAN_4B2R5_CONFIG.PARENT_PHASE,
    rootFolderName: 'KIDLEARN_ASSETS_DEV',
    folderStructure: [
      '01_logo',
      '02_mascot',
      '03_subjects',
      '04_lessons',
      '05_badges',
      '06_ui_icons',
      '07_heroes',
      '08_sources_license',
      '09_exports_public'
    ],
    namingRules: {
      general: [
        'lowercase only',
        'no Vietnamese accents',
        'no spaces',
        'use underscore _',
        'prefix by asset group'
      ],
      subjectExamples: [
        'subject_math.svg',
        'subject_vietnamese.svg',
        'subject_english.svg',
        'subject_science.svg'
      ],
      heroExamples: [
        'hero_login_blue.webp',
        'hero_child_home_blue.webp',
        'hero_courses_dashboard.webp',
        'hero_parent_dashboard.webp'
      ],
      badgeExamples: [
        'badge_star.svg',
        'badge_streak_fire.svg',
        'badge_completed.svg',
        'badge_level_up.svg'
      ],
      mascotExamples: [
        'mascot_main.png',
        'mascot_reading.png',
        'mascot_math.png',
        'mascot_reward.png'
      ]
    },
    registrySheet: 'MST_MediaAssets',
    recommendedRegistryFields: kidlearnV3_4b2r5GetRecommendedFields_(),
    assetPriorityRule: [
      '1. Approved asset in MST_MediaAssets',
      '2. Auto matched asset by entityCode/tags',
      '3. Built-in SVG fallback',
      '4. Emoji fallback only if SVG/asset unavailable'
    ],
    sourcePolicy: {
      hotlinkExternalWeb: false,
      useGoogleDriveApprovedAssets: true,
      requireSourceTracking: true,
      requireLicenseTracking: true,
      requireAttributionTracking: true,
      importantAssetsNeedManualApproval: true
    },
    prodWriteAllowed: false,
    realWriteAllowed: false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Preview 4B-2R-5.
 */
function kidlearnV3_previewAssetFolderRegistryPlan4B2R5V3() {
  var errors = [];
  var warnings = [];

  var previous =
    kidlearnV3_4b2r5SafeCall_(
      'kidlearnV3_assertSubjectSvgIcons4B2R4ReadyV3'
    );

  if (!previous.success) {
    errors.push(
      '4B-2R-4 chưa READY_FOR_4B_2R_5: ' +
      previous.message
    );
  }

  var colorPatch =
    kidlearnV3_4b2r5SafeCall_(
      'kidlearnV3_assertColorContrastPatch4B2R3PReadyV3'
    );

  if (!colorPatch.success) {
    warnings.push(
      'Color contrast patch 4B-2R-3P chưa ready hoặc thiếu assert. Nếu chị đã review visual pass 85%, có thể tiếp tục nhưng nên kiểm tra lại. Chi tiết: ' +
      colorPatch.message
    );
  }

  var plan =
    kidlearnV3_getAssetFolderRegistryPlan4B2R5V3();

  var registry =
    kidlearnV3_checkMstMediaAssetsRegistry4B2R5V3();

  if (!registry.success) {
    errors.push(
      'MST_MediaAssets registry check không pass: ' +
      registry.errors.join(' | ')
    );
  }

  warnings = warnings.concat(registry.warnings || []);

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_ASSET_FOLDER_REGISTRY_PLAN_4B_2R_5_V3',
    phase: KIDLEARN_V3_ASSET_PLAN_4B2R5_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_ASSET_PLAN_4B2R5_CONFIG.PARENT_PHASE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_ASSET_PLAN_4B2R5_STATUS.PREVIEWED
        : KIDLEARN_V3_ASSET_PLAN_4B2R5_STATUS.FAILED,
    nextBundle: KIDLEARN_V3_ASSET_PLAN_4B2R5_CONFIG.NEXT_BUNDLE,
    planSummary: {
      rootFolderName: plan.rootFolderName,
      folderCount: plan.folderStructure.length,
      registrySheet: plan.registrySheet,
      recommendedFieldCount: plan.recommendedRegistryFields.length
    },
    registryCheck: registry,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4b2r5SaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_ASSET_PLAN_4B2R5_STATUS.PREVIEWED
      : KIDLEARN_V3_ASSET_PLAN_4B2R5_STATUS.FAILED,
    KIDLEARN_V3_ASSET_PLAN_4B2R5_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4B-2R-5 preview failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Check MST_MediaAssets sheet.
 * This is read-only.
 */
function kidlearnV3_checkMstMediaAssetsRegistry4B2R5V3() {
  var errors = [];
  var warnings = [];

  var spreadsheet = null;

  try {
    spreadsheet = kidlearnV3_4b2r5OpenSpreadsheet_();
  } catch (error) {
    errors.push(
      'Không mở được spreadsheet: ' +
      String(error.message || error)
    );
  }

  var sheet = null;

  if (spreadsheet) {
    sheet =
      kidlearnV3_4b2r5GetSheetByExactName_(
        spreadsheet,
        'MST_MediaAssets'
      );

    if (!sheet) {
      errors.push('Không tìm thấy sheet MST_MediaAssets.');
    }
  }

  var headerInfo = {
    row1: [],
    row2: [],
    normalizedKeys: []
  };

  if (sheet) {
    var lastColumn = sheet.getLastColumn();

    if (lastColumn < 1) {
      errors.push('MST_MediaAssets không có cột.');
    } else {
      headerInfo.row1 =
        sheet.getRange(1, 1, 1, lastColumn).getValues()[0];

      if (sheet.getLastRow() >= 2) {
        headerInfo.row2 =
          sheet.getRange(2, 1, 1, lastColumn).getValues()[0];
      }

      headerInfo.normalizedKeys =
        kidlearnV3_4b2r5NormalizeHeaderKeys_(
          headerInfo.row1,
          headerInfo.row2
        );
    }
  }

  var recommended =
    kidlearnV3_4b2r5GetRecommendedFields_();

  var found = [];
  var missing = [];

  for (var i = 0; i < recommended.length; i++) {
    var key =
      recommended[i];

    if (
      kidlearnV3_4b2r5HeaderContains_(
        headerInfo.normalizedKeys,
        key
      )
    ) {
      found.push(key);
    } else {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    warnings.push(
      'MST_MediaAssets chưa có đủ recommended fields: ' +
      missing.join(', ') +
      '. Đây là warning vì hiện tại 4B-2R-5 mới chốt plan, chưa bắt app đọc asset thật.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'CHECK_MST_MEDIA_ASSETS_REGISTRY_4B_2R_5_V3',
    phase: KIDLEARN_V3_ASSET_PLAN_4B2R5_CONFIG.PHASE,
    registrySheet: 'MST_MediaAssets',
    spreadsheetId:
      spreadsheet ? spreadsheet.getId() : '',
    spreadsheetName:
      spreadsheet ? spreadsheet.getName() : '',
    sheetExists:
      sheet !== null,
    rowCount:
      sheet ? Math.max(0, sheet.getLastRow() - 2) : 0,
    columnCount:
      sheet ? sheet.getLastColumn() : 0,
    foundRecommendedFields: found,
    missingRecommendedFields: missing,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  kidlearnV3_4b2r5SaveStatus_(
    result,
    result.success
      ? KIDLEARN_V3_ASSET_PLAN_4B2R5_STATUS.REGISTRY_CHECKED
      : KIDLEARN_V3_ASSET_PLAN_4B2R5_STATUS.FAILED,
    KIDLEARN_V3_ASSET_PLAN_4B2R5_KEYS.LAST_REGISTRY_CHECK_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      'MST_MediaAssets registry check failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 4B-2R-5 ready.
 * Public wrapper dùng để chạy trực tiếp trong Apps Script.
 */
function kidlearnV3_markAssetFolderRegistryPlan4B2R5ReadyConfirmV3() {
  return kidlearnV3_markAssetFolderRegistryPlan4B2R5ReadyV3({
    confirm: 'CONFIRM_ASSET_FOLDER_REGISTRY_PLAN_4B2R5',
    source: 'PUBLIC_WRAPPER'
  });
}


/**
 * Mark 4B-2R-5 ready.
 * Robust version:
 * - Accepts {confirm: '...'}
 * - Accepts direct string 'CONFIRM_ASSET_FOLDER_REGISTRY_PLAN_4B2R5'
 * - Used by public wrapper above
 */
function kidlearnV3_markAssetFolderRegistryPlan4B2R5ReadyV3(options) {
  var confirmText = '';

  if (typeof options === 'string') {
    confirmText = options;
  } else if (options && options.confirm) {
    confirmText = options.confirm;
  }

  confirmText =
    String(confirmText || '')
      .trim()
      .toUpperCase();

  if (
    confirmText !==
    'CONFIRM_ASSET_FOLDER_REGISTRY_PLAN_4B2R5'
  ) {
    throw new Error(
      'Thiếu confirm. Cần confirm=CONFIRM_ASSET_FOLDER_REGISTRY_PLAN_4B2R5. Received=' +
      confirmText
    );
  }

  var preview =
    kidlearnV3_previewAssetFolderRegistryPlan4B2R5V3();

  if (!preview.success) {
    throw new Error('Preview 4B-2R-5 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_ASSET_FOLDER_REGISTRY_PLAN_4B_2R_5_READY_V3',
    phase: KIDLEARN_V3_ASSET_PLAN_4B2R5_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_ASSET_PLAN_4B2R5_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_ASSET_PLAN_4B2R5_STATUS.READY_FOR_4B_2R_6,
    nextBundle:
      KIDLEARN_V3_ASSET_PLAN_4B2R5_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_ASSET_PLAN_4B2R5_CONFIG.NEXT_STAGE,
    confirmSource:
      options && options.source
        ? options.source
        : 'DIRECT_OR_WRAPPER',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    message:
      'Asset Folder & Registry Plan ready. Có thể qua 4B-2R-6 UI Polish Review.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4b2r5SaveStatus_(
    result,
    KIDLEARN_V3_ASSET_PLAN_4B2R5_STATUS.READY_FOR_4B_2R_6,
    KIDLEARN_V3_ASSET_PLAN_4B2R5_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getAssetFolderRegistryPlan4B2R5StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_ASSET_FOLDER_REGISTRY_PLAN_4B_2R_5_STATUS_V3',
    phase: KIDLEARN_V3_ASSET_PLAN_4B2R5_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_ASSET_PLAN_4B2R5_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_ASSET_PLAN_4B2R5_KEYS.STATUS
      ) ||
      KIDLEARN_V3_ASSET_PLAN_4B2R5_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_ASSET_PLAN_4B2R5_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastRegistryCheckAt:
      properties.getProperty(
        KIDLEARN_V3_ASSET_PLAN_4B2R5_KEYS.LAST_REGISTRY_CHECK_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_ASSET_PLAN_4B2R5_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4b2r5ReadJsonProperty_(
        KIDLEARN_V3_ASSET_PLAN_4B2R5_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertAssetFolderRegistryPlan4B2R5ReadyV3() {
  var status =
    kidlearnV3_getAssetFolderRegistryPlan4B2R5StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_ASSET_PLAN_4B2R5_STATUS.READY_FOR_4B_2R_6
  ) {
    errors.push(
      '4B-2R-5 chưa READY_FOR_4B_2R_6. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_ASSET_FOLDER_REGISTRY_PLAN_4B_2R_5_READY_V3',
    phase: KIDLEARN_V3_ASSET_PLAN_4B2R5_CONFIG.PHASE,
    parentPhase: KIDLEARN_V3_ASSET_PLAN_4B2R5_CONFIG.PARENT_PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_ASSET_PLAN_4B2R5_CONFIG.NEXT_BUNDLE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
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
 * QA batch 4B-2R-5.
 */
function kidlearnV3_runQaBatch4B2R5V3() {
  var preview =
    kidlearnV3_previewAssetFolderRegistryPlan4B2R5V3();

  var registry =
    kidlearnV3_checkMstMediaAssetsRegistry4B2R5V3();

  var result = {
    success:
      preview.success === true &&
      registry.success === true,
    suiteName:
      'PHASE_4B_2R_5_ASSET_FOLDER_AND_REGISTRY_PLAN',
    phase: KIDLEARN_V3_ASSET_PLAN_4B2R5_CONFIG.PHASE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    results: {
      preview: preview.success,
      registry: registry.success
    },
    warningCount:
      (preview.warningCount || 0) +
      (registry.warningCount || 0),
    warnings:
      []
        .concat(preview.warnings || [])
        .concat(registry.warnings || [])
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4B-2R-5 QA failed.');
  }

  return result;
}


/**
 * Helpers.
 */
function kidlearnV3_4b2r5GetRecommendedFields_() {
  return [
    'assetId',
    'assetName',
    'assetType',
    'entityType',
    'entityCode',
    'fileName',
    'driveFileId',
    'driveFolderId',
    'publicUrl',
    'sourceName',
    'sourceUrl',
    'licenseType',
    'attributionText',
    'tags',
    'status',
    'isApproved',
    'approvedBy',
    'approvedAt',
    'notes'
  ];
}


function kidlearnV3_4b2r5OpenSpreadsheet_() {
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


function kidlearnV3_4b2r5GetSheetByExactName_(spreadsheet, sheetName) {
  var sheets =
    spreadsheet.getSheets();

  for (var i = 0; i < sheets.length; i++) {
    if (sheets[i].getName() === sheetName) {
      return sheets[i];
    }
  }

  return null;
}


function kidlearnV3_4b2r5NormalizeHeaderKeys_(row1, row2) {
  var max =
    Math.max(
      row1 ? row1.length : 0,
      row2 ? row2.length : 0
    );

  var keys = [];

  for (var i = 0; i < max; i++) {
    var raw =
      row2 && row2[i]
        ? row2[i]
        : row1 && row1[i]
          ? row1[i]
          : '';

    keys.push(
      kidlearnV3_4b2r5NormalizeKey_(raw)
    );
  }

  return keys;
}


function kidlearnV3_4b2r5HeaderContains_(normalizedKeys, key) {
  var target =
    kidlearnV3_4b2r5NormalizeKey_(key);

  for (var i = 0; i < normalizedKeys.length; i++) {
    if (normalizedKeys[i] === target) {
      return true;
    }
  }

  return false;
}


function kidlearnV3_4b2r5NormalizeKey_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .replace(/-/g, '');
}


function kidlearnV3_4b2r5SafeCall_(functionName) {
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


function kidlearnV3_4b2r5SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_ASSET_PLAN_4B2R5_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_ASSET_PLAN_4B2R5_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase: result.phase,
      parentPhase: result.parentPhase || '4B-2R',
      status: status,
      nextBundle:
        KIDLEARN_V3_ASSET_PLAN_4B2R5_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_ASSET_PLAN_4B2R5_CONFIG.NEXT_STAGE,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      errors: result.errors || [],
      warnings: result.warnings || [],
      at:
        new Date().toISOString()
    })
  );
}


function kidlearnV3_4b2r5ReadJsonProperty_(key) {
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