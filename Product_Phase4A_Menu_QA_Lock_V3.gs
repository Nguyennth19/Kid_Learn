/**
 * ================================================================
 * KIDLEARN V3 - PRODUCT PHASE 4A DEV MENU + QA + LOCK
 * Phase: 4A-1D
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Review and lock Product MVP Foundation 4A.
 * - Add DEV helper functions for opening Product Web App.
 * - Validate font standard: Be Vietnam Pro + Nunito Sans.
 *
 * Safety:
 * - Không ghi PROD.
 * - Không ghi dữ liệu học.
 * - Không gọi Safe Write.
 * - Không deploy/copy/delete.
 * - Chỉ ghi ScriptProperties để lưu trạng thái 4A.
 */


var KIDLEARN_V3_PRODUCT_4A_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4A_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4A_LAST_PREVIEW_AT',
  LAST_REVIEW_AT: 'KIDLEARN_V3_PHASE_4A_LAST_REVIEW_AT',
  LAST_LOCK_AT: 'KIDLEARN_V3_PHASE_4A_LAST_LOCK_AT',
  LAST_CLOSE_AT: 'KIDLEARN_V3_PHASE_4A_LAST_CLOSE_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4A_LAST_RESULT_JSON',
  LAST_REVIEW_JSON: 'KIDLEARN_V3_PHASE_4A_LAST_REVIEW_JSON',
  LAST_LOCK_JSON: 'KIDLEARN_V3_PHASE_4A_LAST_LOCK_JSON',
  FOUNDATION_LOCK_ID: 'KIDLEARN_V3_PHASE_4A_FOUNDATION_LOCK_ID'
};


var KIDLEARN_V3_PRODUCT_4A_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  REVIEW_PASSED: 'REVIEW_PASSED',
  LOCK_CONFIRMED: 'LOCK_CONFIRMED',
  CLOSED_LOCKED: 'CLOSED_LOCKED',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PRODUCT_4A_CONFIG = {
  PHASE: '4A',
  BUNDLE: '4A-1D',
  NEXT_BUNDLE: '4B',
  NEXT_STAGE: 'CHILD_HOME_AND_COURSE_DASHBOARD',
  CONFIRM_TEXT: 'LOCK_PRODUCT_MVP_FOUNDATION_4A',
  PRODUCT_APP_NAME: 'KID LEARN',
  PRODUCT_SLOGAN: 'Học vui - Tiến bộ mỗi ngày',
  FONT_HEADING: 'Be Vietnam Pro',
  FONT_BODY: 'Nunito Sans',
  UI_MODE: 'PRODUCT_WEB_APP_FOUNDATION',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false
};


/**
 * Preview Phase 4A foundation.
 */
function kidlearnV3_previewProductMvpFoundation4AV3() {
  var review =
    kidlearnV3_4aReviewFoundation_({
      action: 'PREVIEW_PRODUCT_MVP_FOUNDATION_4A_V3',
      strict: false
    });

  kidlearnV3_4aSaveResult_(
    review,
    KIDLEARN_V3_PRODUCT_4A_STATUS.PREVIEWED,
    KIDLEARN_V3_PRODUCT_4A_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(review, null, 2));
  return review;
}


/**
 * Run foundation review.
 */
function kidlearnV3_runProductMvpFoundationReview4AV3() {
  var review =
    kidlearnV3_4aReviewFoundation_({
      action: 'RUN_PRODUCT_MVP_FOUNDATION_REVIEW_4A_V3',
      strict: true
    });

  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_PRODUCT_4A_KEYS.LAST_REVIEW_JSON,
      JSON.stringify(review)
    );

  kidlearnV3_4aSaveResult_(
    review,
    review.success
      ? KIDLEARN_V3_PRODUCT_4A_STATUS.REVIEW_PASSED
      : KIDLEARN_V3_PRODUCT_4A_STATUS.FAILED,
    KIDLEARN_V3_PRODUCT_4A_KEYS.LAST_REVIEW_AT
  );

  console.log(JSON.stringify(review, null, 2));

  if (!review.success) {
    throw new Error(
      '4A foundation review failed. Errors=' +
      review.errorCount +
      '. ' +
      review.errors.join(' | ')
    );
  }

  return review;
}


/**
 * Manual lock confirm wrapper.
 */
function kidlearnV3_recordProductMvpFoundation4ALockConfirmV3() {
  return kidlearnV3_recordProductMvpFoundation4ALockV3({
    confirmText:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.CONFIRM_TEXT,
    lockedBy: 'DEV_PRODUCT_FOUNDATION_APPROVER_4A',
    lockNote:
      'Phase 4A Product MVP Foundation reviewed and locked. Proceed to 4B Child Home + Course Dashboard.'
  });
}


/**
 * Record 4A lock confirmation.
 */
function kidlearnV3_recordProductMvpFoundation4ALockV3(options) {
  var req =
    kidlearnV3_4aNormalizeOptions_(options);

  var errors = [];
  var warnings = [];

  if (
    String(req.confirmText || '') !==
    KIDLEARN_V3_PRODUCT_4A_CONFIG.CONFIRM_TEXT
  ) {
    errors.push(
      'Confirm text không đúng. Cần đúng: ' +
      KIDLEARN_V3_PRODUCT_4A_CONFIG.CONFIRM_TEXT
    );
  }

  var status =
    kidlearnV3_getProductMvpFoundation4AStatusV3();

  if (
    status.status !== KIDLEARN_V3_PRODUCT_4A_STATUS.REVIEW_PASSED &&
    status.status !== KIDLEARN_V3_PRODUCT_4A_STATUS.LOCK_CONFIRMED &&
    status.status !== KIDLEARN_V3_PRODUCT_4A_STATUS.CLOSED_LOCKED
  ) {
    errors.push(
      '4A cần REVIEW_PASSED trước khi lock. Status hiện tại=' +
      status.status
    );
  }

  if (
    (
      status.status === KIDLEARN_V3_PRODUCT_4A_STATUS.LOCK_CONFIRMED ||
      status.status === KIDLEARN_V3_PRODUCT_4A_STATUS.CLOSED_LOCKED
    ) &&
    req.allowRepeatLock !== true
  ) {
    errors.push(
      '4A lock đã được ghi nhận rồi. Không record lại. Có thể chạy close/assert tiếp.'
    );
  }

  var review =
    status.lastReview || {};

  if (review.success !== true) {
    errors.push('Last review chưa success=true.');
  }

  if (errors.length > 0) {
    throw new Error(
      'Không thể record 4A lock. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var lockId =
    status.foundationLockId ||
    kidlearnV3_4aMakeLockId_();

  var lock = {
    success: true,
    action: 'RECORD_PRODUCT_MVP_FOUNDATION_4A_LOCK_V3',
    phase: KIDLEARN_V3_PRODUCT_4A_CONFIG.PHASE,
    bundle: KIDLEARN_V3_PRODUCT_4A_CONFIG.BUNDLE,
    status: KIDLEARN_V3_PRODUCT_4A_STATUS.LOCK_CONFIRMED,
    foundationLockId: lockId,
    confirmText:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.CONFIRM_TEXT,
    lockedBy:
      req.lockedBy || 'DEV_PRODUCT_FOUNDATION_APPROVER_4A',
    lockNote:
      req.lockNote || '',
    productAppName:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.PRODUCT_APP_NAME,
    productSlogan:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.PRODUCT_SLOGAN,
    fontHeading:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.FONT_HEADING,
    fontBody:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.FONT_BODY,
    nextBundle:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    recordedAt:
      new Date().toISOString(),
    warningCount: warnings.length,
    warnings: warnings
  };

  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PRODUCT_4A_KEYS.FOUNDATION_LOCK_ID,
    lockId
  );

  properties.setProperty(
    KIDLEARN_V3_PRODUCT_4A_KEYS.LAST_LOCK_JSON,
    JSON.stringify(lock)
  );

  kidlearnV3_4aSaveResult_(
    lock,
    KIDLEARN_V3_PRODUCT_4A_STATUS.LOCK_CONFIRMED,
    KIDLEARN_V3_PRODUCT_4A_KEYS.LAST_LOCK_AT
  );

  console.log(JSON.stringify(lock, null, 2));
  return lock;
}


/**
 * Close and lock Phase 4A.
 */
function kidlearnV3_closeProductMvpFoundation4AV3() {
  var errors = [];

  var status =
    kidlearnV3_getProductMvpFoundation4AStatusV3();

  if (
    status.status !== KIDLEARN_V3_PRODUCT_4A_STATUS.LOCK_CONFIRMED &&
    status.status !== KIDLEARN_V3_PRODUCT_4A_STATUS.CLOSED_LOCKED
  ) {
    errors.push(
      '4A cần LOCK_CONFIRMED trước khi close. Status=' +
      status.status
    );
  }

  if (!status.foundationLockId) {
    errors.push('Thiếu foundationLockId.');
  }

  var review =
    kidlearnV3_runProductMvpFoundationReview4AV3();

  if (!review.success) {
    errors.push('Review lại 4A không pass.');
  }

  if (errors.length > 0) {
    throw new Error(
      'Không thể close 4A. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var closeResult = {
    success: true,
    action: 'CLOSE_PRODUCT_MVP_FOUNDATION_4A_V3',
    phase: KIDLEARN_V3_PRODUCT_4A_CONFIG.PHASE,
    bundle: KIDLEARN_V3_PRODUCT_4A_CONFIG.BUNDLE,
    status: KIDLEARN_V3_PRODUCT_4A_STATUS.CLOSED_LOCKED,
    foundationLockId: status.foundationLockId,
    productAppName:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.PRODUCT_APP_NAME,
    productSlogan:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.PRODUCT_SLOGAN,
    uiMode:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.UI_MODE,
    fontHeading:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.FONT_HEADING,
    fontBody:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.FONT_BODY,
    nextBundle:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    message:
      'Phase 4A closed and locked. Ready for 4B Child Home + Course Dashboard.',
    closedAt:
      new Date().toISOString()
  };

  kidlearnV3_4aSaveResult_(
    closeResult,
    KIDLEARN_V3_PRODUCT_4A_STATUS.CLOSED_LOCKED,
    KIDLEARN_V3_PRODUCT_4A_KEYS.LAST_CLOSE_AT
  );

  console.log(JSON.stringify(closeResult, null, 2));
  return closeResult;
}


/**
 * Get Phase 4A status.
 */
function kidlearnV3_getProductMvpFoundation4AStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PRODUCT_MVP_FOUNDATION_4A_STATUS_V3',
    phase: KIDLEARN_V3_PRODUCT_4A_CONFIG.PHASE,
    bundle: KIDLEARN_V3_PRODUCT_4A_CONFIG.BUNDLE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PRODUCT_4A_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PRODUCT_4A_STATUS.NOT_RUN,
    foundationLockId:
      properties.getProperty(
        KIDLEARN_V3_PRODUCT_4A_KEYS.FOUNDATION_LOCK_ID
      ) || '',
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PRODUCT_4A_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastReviewAt:
      properties.getProperty(
        KIDLEARN_V3_PRODUCT_4A_KEYS.LAST_REVIEW_AT
      ) || '',
    lastLockAt:
      properties.getProperty(
        KIDLEARN_V3_PRODUCT_4A_KEYS.LAST_LOCK_AT
      ) || '',
    lastCloseAt:
      properties.getProperty(
        KIDLEARN_V3_PRODUCT_4A_KEYS.LAST_CLOSE_AT
      ) || '',
    lastResult:
      kidlearnV3_4aReadJsonProperty_(
        KIDLEARN_V3_PRODUCT_4A_KEYS.LAST_RESULT_JSON
      ),
    lastReview:
      kidlearnV3_4aReadJsonProperty_(
        KIDLEARN_V3_PRODUCT_4A_KEYS.LAST_REVIEW_JSON
      ),
    lastLock:
      kidlearnV3_4aReadJsonProperty_(
        KIDLEARN_V3_PRODUCT_4A_KEYS.LAST_LOCK_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert Phase 4A closed.
 */
function kidlearnV3_assertProductMvpFoundation4AClosedV3() {
  var status =
    kidlearnV3_getProductMvpFoundation4AStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PRODUCT_4A_STATUS.CLOSED_LOCKED
  ) {
    errors.push(
      '4A chưa CLOSED_LOCKED. Status=' +
      status.status
    );
  }

  if (!status.foundationLockId) {
    errors.push('Thiếu foundationLockId.');
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PRODUCT_MVP_FOUNDATION_4A_CLOSED_V3',
    phase: KIDLEARN_V3_PRODUCT_4A_CONFIG.PHASE,
    bundle: KIDLEARN_V3_PRODUCT_4A_CONFIG.BUNDLE,
    status: status.status,
    foundationLockId: status.foundationLockId || '',
    nextBundle:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.NEXT_STAGE,
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
 * Alias for future phases.
 */
function kidlearnV3_assertPhase4AClosedV3() {
  return kidlearnV3_assertProductMvpFoundation4AClosedV3();
}


/**
 * QA package-only steps for 4A-1D.
 *
 * Không lock.
 * Không close.
 */
function kidlearnV3_getQaBatchSteps4A1DV3() {
  return [
    {
      label: 'Assert 3P-GH closed',
      functionName: 'kidlearnV3_assertProdMonitoringResponseDecisionClose3PGHClosedV3'
    },
    {
      label: 'Smoke Web App Gateway 4A',
      functionName: 'kidlearnV3_smokeTestWebAppGateway4A'
    },
    {
      label: 'Preview Web App Routes 4A',
      functionName: 'kidlearnV3_previewWebAppRoutes4A'
    },
    {
      label: 'Smoke Product Shell 4A',
      functionName: 'kidlearnV3_smokeTestProductShell4A1BV3'
    },
    {
      label: 'Assert Product Auth Context 4A-1C Ready',
      functionName: 'kidlearnV3_assertProductAuthContext4A1CReadyV3'
    },
    {
      label: 'Run Product MVP Foundation Review 4A',
      functionName: 'kidlearnV3_runProductMvpFoundationReview4AV3'
    }
  ];
}


/**
 * QA batch 4A-1D package-only.
 */
function kidlearnV3_runQaBatch4A1DV3() {
  var steps =
    kidlearnV3_getQaBatchSteps4A1DV3();

  if (typeof kidlearnV3_runQaBatchProvidedStepsV3 === 'function') {
    return kidlearnV3_runQaBatchProvidedStepsV3(
      'PHASE_4A_1D_PRODUCT_MVP_FOUNDATION_MENU_QA_LOCK_PACKAGE_ONLY',
      steps,
      {
        stopOnFailure: true
      }
    );
  }

  return kidlearnV3_4aRunLocalBatch_(
    'PHASE_4A_1D_PRODUCT_MVP_FOUNDATION_MENU_QA_LOCK_PACKAGE_ONLY',
    steps
  );
}


/**
 * DEV helper: show Product Web App URL.
 */
function kidlearnV3_openProductWebAppPreview4AV3() {
  var info =
    kidlearnV3_getProductWebAppInfo4AV3();

  var webUrl =
    info.webAppUrl || '';

  var html =
    '<div style="font-family:Arial,sans-serif;padding:20px;">' +
      '<h2 style="margin-top:0;">KID LEARN Product Web App 4A</h2>' +
      '<p>Phase 4A Product Shell đã sẵn sàng để preview.</p>' +
      '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:14px;padding:14px;margin:14px 0;">' +
        '<div><b>App:</b> KID LEARN</div>' +
        '<div><b>Font heading:</b> Be Vietnam Pro</div>' +
        '<div><b>Font body:</b> Nunito Sans</div>' +
        '<div><b>Next:</b> 4B Child Home + Course Dashboard</div>' +
      '</div>';

  if (webUrl) {
    html +=
      '<p><a href="' + webUrl + '" target="_blank" style="display:inline-block;background:#6d5dfc;color:white;text-decoration:none;padding:12px 16px;border-radius:12px;font-weight:bold;">Mở KID LEARN V3</a></p>' +
      '<p><a href="' + webUrl + '?app=v2" target="_blank">Mở V2 legacy</a></p>';
  } else {
    html +=
      '<p style="color:#b45309;">Chưa lấy được Web App URL. Có thể project chưa deploy Web App hoặc đang chạy từ editor.</p>';
  }

  html +=
      '<pre style="white-space:pre-wrap;background:#111827;color:#fff;border-radius:12px;padding:12px;font-size:12px;">' +
        kidlearnV3_4aSafeHtml_(JSON.stringify(info, null, 2)) +
      '</pre>' +
    '</div>';

  try {
    SpreadsheetApp
      .getUi()
      .showModalDialog(
        HtmlService
          .createHtmlOutput(html)
          .setWidth(720)
          .setHeight(560),
        'KID LEARN Product Web App 4A'
      );
  } catch (error) {
    console.log(html);
  }

  return info;
}


/**
 * Get Web App info.
 */
function kidlearnV3_getProductWebAppInfo4AV3() {
  var url = '';
  var message = '';

  try {
    url =
      ScriptApp
        .getService()
        .getUrl() || '';
  } catch (error) {
    message =
      String(error.message || error);
  }

  var result = {
    success: true,
    action: 'GET_PRODUCT_WEB_APP_INFO_4A_V3',
    phase: '4A',
    webAppUrl: url,
    defaultV3Url: url,
    legacyV2Url:
      url ? url + '?app=v2' : '',
    productAppName:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.PRODUCT_APP_NAME,
    fontHeading:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.FONT_HEADING,
    fontBody:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.FONT_BODY,
    message: message,
    note:
      url
        ? 'Web App URL available.'
        : 'Web App URL empty. Deploy Web App or open from deployment URL.'
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Internal review.
 */
function kidlearnV3_4aReviewFoundation_(options) {
  var errors = [];
  var warnings = [];

  var phase3P =
    kidlearnV3_4aSafeCall_(
      'kidlearnV3_assertProdMonitoringResponseDecisionClose3PGHClosedV3'
    );

  if (!phase3P.success) {
    errors.push(
      '3P-GH chưa closed: ' +
      phase3P.message
    );
  }

  var gateway =
    kidlearnV3_4aSafeCall_(
      'kidlearnV3_smokeTestWebAppGateway4A'
    );

  if (!gateway.success) {
    errors.push(
      'Web App Gateway 4A chưa pass: ' +
      gateway.message
    );
  }

  var routes =
    kidlearnV3_4aSafeCall_(
      'kidlearnV3_previewWebAppRoutes4A'
    );

  if (!routes.success) {
    errors.push(
      'Preview routes 4A chưa pass: ' +
      routes.message
    );
  } else if (
    routes.output &&
    routes.output.defaultRoute !== 'V3_KIDLEARN_PRODUCT'
  ) {
    errors.push(
      'Default route chưa phải V3_KIDLEARN_PRODUCT.'
    );
  }

  var shell =
    kidlearnV3_4aSafeCall_(
      'kidlearnV3_smokeTestProductShell4A1BV3'
    );

  if (!shell.success) {
    errors.push(
      'Product Shell 4A chưa pass: ' +
      shell.message
    );
  }

  var auth =
    kidlearnV3_4aSafeCall_(
      'kidlearnV3_assertProductAuthContext4A1CReadyV3'
    );

  if (!auth.success) {
    errors.push(
      'Product Auth Context 4A-1C chưa ready: ' +
      auth.message
    );
  }

  var font =
    kidlearnV3_4aCheckFontStandards_();

  errors = errors.concat(font.errors);
  warnings = warnings.concat(font.warnings);

  var webInfo =
    kidlearnV3_getProductWebAppInfo4AV3();

  if (!webInfo.webAppUrl) {
    warnings.push(
      'Web App URL hiện chưa lấy được từ ScriptApp.getService().getUrl(). Nếu chưa deploy Web App thì warning này bình thường.'
    );
  }

  return {
    success: errors.length === 0,
    action:
      options && options.action
        ? options.action
        : 'REVIEW_PRODUCT_MVP_FOUNDATION_4A_V3',
    phase: KIDLEARN_V3_PRODUCT_4A_CONFIG.PHASE,
    bundle: KIDLEARN_V3_PRODUCT_4A_CONFIG.BUNDLE,
    status:
      errors.length === 0
        ? KIDLEARN_V3_PRODUCT_4A_STATUS.REVIEW_PASSED
        : KIDLEARN_V3_PRODUCT_4A_STATUS.FAILED,
    productAppName:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.PRODUCT_APP_NAME,
    productSlogan:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.PRODUCT_SLOGAN,
    uiMode:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.UI_MODE,
    fontHeading:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.FONT_HEADING,
    fontBody:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.FONT_BODY,
    nextBundle:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    checks: {
      phase3PClosed: phase3P.success,
      gateway: gateway.success,
      routes: routes.success,
      shell: shell.success,
      authContext: auth.success,
      fontStandard: font.success,
      webAppUrlAvailable: webInfo.webAppUrl ? true : false
    },
    fontCheck: font,
    webInfo: webInfo,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    reviewedAt:
      new Date().toISOString()
  };
}


/**
 * Check font standard in CSS file.
 */
function kidlearnV3_4aCheckFontStandards_() {
  var errors = [];
  var warnings = [];
  var css = '';

  try {
    css =
      HtmlService
        .createHtmlOutputFromFile('UI_Product_Styles_4A')
        .getContent();
  } catch (error) {
    errors.push(
      'Không đọc được UI_Product_Styles_4A: ' +
      String(error.message || error)
    );
  }

  var hasBeVietnam =
    css.indexOf('Be Vietnam Pro') >= 0;

  var hasNunito =
    css.indexOf('Nunito Sans') >= 0;

  var hasDisplaySwap =
    css.indexOf('display=swap') >= 0;

  var hasHeadingVar =
    css.indexOf('--kl-font-heading') >= 0;

  var hasBodyVar =
    css.indexOf('--kl-font-body') >= 0;

  if (!hasBeVietnam) {
    errors.push('CSS chưa có font Be Vietnam Pro.');
  }

  if (!hasNunito) {
    errors.push('CSS chưa có font Nunito Sans.');
  }

  if (!hasHeadingVar) {
    errors.push('CSS chưa có biến --kl-font-heading.');
  }

  if (!hasBodyVar) {
    errors.push('CSS chưa có biến --kl-font-body.');
  }

  if (!hasDisplaySwap) {
    warnings.push(
      'Google Fonts URL chưa có display=swap. Nên dùng display=swap để tránh chữ bị ẩn khi font tải.'
    );
  }

  return {
    success: errors.length === 0,
    headingFont:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.FONT_HEADING,
    bodyFont:
      KIDLEARN_V3_PRODUCT_4A_CONFIG.FONT_BODY,
    hasBeVietnam: hasBeVietnam,
    hasNunito: hasNunito,
    hasDisplaySwap: hasDisplaySwap,
    hasHeadingVar: hasHeadingVar,
    hasBodyVar: hasBodyVar,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Safe call.
 */
function kidlearnV3_4aSafeCall_(functionName) {
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


/**
 * Save result.
 */
function kidlearnV3_4aSaveResult_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_PRODUCT_4A_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus === KIDLEARN_V3_PRODUCT_4A_STATUS.CLOSED_LOCKED &&
    (
      status === KIDLEARN_V3_PRODUCT_4A_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_PRODUCT_4A_STATUS.REVIEW_PASSED ||
      status === KIDLEARN_V3_PRODUCT_4A_STATUS.LOCK_CONFIRMED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_PRODUCT_4A_STATUS.CLOSED_LOCKED;
  }

  properties.setProperty(
    KIDLEARN_V3_PRODUCT_4A_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PRODUCT_4A_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase: result.phase,
      bundle: result.bundle,
      status: finalStatus,
      originalRequestedStatus: status,
      foundationLockId: result.foundationLockId || '',
      nextBundle:
        KIDLEARN_V3_PRODUCT_4A_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_PRODUCT_4A_CONFIG.NEXT_STAGE,
      fontHeading:
        KIDLEARN_V3_PRODUCT_4A_CONFIG.FONT_HEADING,
      fontBody:
        KIDLEARN_V3_PRODUCT_4A_CONFIG.FONT_BODY,
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


/**
 * Local batch fallback.
 */
function kidlearnV3_4aRunLocalBatch_(suiteName, steps) {
  var results = [];
  var failed = 0;

  for (var i = 0; i < steps.length; i++) {
    var step =
      steps[i];

    try {
      var fn =
        eval(step.functionName);

      var output =
        fn();

      var ok =
        output && output.success === true;

      if (!ok) failed++;

      results.push({
        label: step.label,
        functionName: step.functionName,
        success: ok,
        output: output
      });

      if (!ok) break;

    } catch (error) {
      failed++;

      results.push({
        label: step.label,
        functionName: step.functionName,
        success: false,
        error:
          String(error.message || error)
      });

      break;
    }
  }

  var result = {
    success: failed === 0,
    suiteName: suiteName,
    phase: '4A-1D',
    stepCount: steps.length,
    failedStepCount: failed,
    results: results
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      suiteName +
      ' failed. failedStepCount=' +
      failed
    );
  }

  return result;
}


function kidlearnV3_4aMakeLockId_() {
  return (
    'PRODUCT_MVP_FOUNDATION_4A_LOCK_' +
    Utilities.formatDate(
      new Date(),
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    )
  );
}


function kidlearnV3_4aNormalizeOptions_(options) {
  if (!options) return {};
  if (typeof options !== 'object') {
    return {
      value: options
    };
  }
  return options;
}


function kidlearnV3_4aReadJsonProperty_(key) {
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


function kidlearnV3_4aSafeHtml_(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}