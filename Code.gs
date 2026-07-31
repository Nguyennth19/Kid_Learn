/**
 * ================================================================
 * Code.gs
 * KIDLEARN V3 - WEB APP GATEWAY
 * Phase: 4A-1A
 * Version: 3.1.0
 * ================================================================
 *
 * Mục tiêu:
 * - Giữ duy nhất 1 function doGet(e) trong project.
 * - Route mặc định sang KIDLEARN V3 Product Web App.
 * - Giữ fallback V2 / UniLMS bằng query: ?app=v2
 *
 * URL mặc định:
 *   /exec
 *   /exec?app=v3
 *   /exec?app=kidlearn
 *
 * URL legacy:
 *   /exec?app=v2
 *   /exec?app=legacy
 *   /exec?app=unilms
 *
 * Safety:
 * - Không ghi PROD.
 * - Không ghi Google Sheet.
 * - Không gọi Safe Write.
 * - Không deploy/copy/delete.
 */


/**
 * WEB APP ENTRY POINT DUY NHẤT.
 *
 * Không tạo thêm function doGet khác trong project.
 *
 * @param {Object} e Apps Script event object
 * @return {HtmlOutput}
 */
function doGet(e) {
  return kidlearnV3_webAppGateway4A(e);
}


/**
 * KIDLEARN V3 Web App Gateway.
 *
 * Default route: V3 Product App.
 * Legacy route: V2 UniLMS if app=v2/legacy/unilms.
 *
 * @param {Object} e Apps Script event object
 * @return {HtmlOutput}
 */
function kidlearnV3_webAppGateway4A(e) {
  try {
    var request =
      kidlearnV3_normalizeWebRequest4A_(e);

    if (kidlearnV3_isLegacyV2Route4A_(request)) {
      return kidlearnLegacyV2_doGet_(e);
    }

    return kidlearnV3_productDoGetGateway4A_(e, request);

  } catch (error) {
    return kidlearnV3_renderGatewayError4A_(
      'KIDLEARN V3 Web App Gateway Error',
      error
    );
  }
}


/**
 * Route sang V3 Product App.
 *
 * Ở 4A-1A, nếu file Product Shell chưa được cài ở 4A-1B,
 * gateway sẽ hiển thị trang chờ an toàn thay vì crash.
 *
 * @param {Object} e Apps Script event object
 * @param {Object} request normalized request
 * @return {HtmlOutput}
 */
function kidlearnV3_productDoGetGateway4A_(e, request) {
  try {
    if (typeof kidlearnV3_productDoGet4A === 'function') {
      return kidlearnV3_productDoGet4A(e);
    }

    return kidlearnV3_renderProductShellPending4A_(request);

  } catch (error) {
    return kidlearnV3_renderGatewayError4A_(
      'KIDLEARN V3 Product App Error',
      error
    );
  }
}


/**
 * Legacy V2 doGet preserved from old Code.gs.
 *
 * Original behavior:
 * - Load HTML file: Index
 * - Title: UniLMS - Student Portal
 *
 * Chỉ dùng khi URL có ?app=v2 / ?app=legacy / ?app=unilms
 *
 * @param {Object} e Apps Script event object
 * @return {HtmlOutput}
 */
function kidlearnLegacyV2_doGet_(e) {
  try {
    var template =
      HtmlService.createTemplateFromFile('Index');

    template.appVersion = '2.0.0';
    template.serverTime =
      kidlearnV3_safeFormatDate4A_(new Date());

    return template
      .evaluate()
      .setTitle('UniLMS - Student Portal')
      .addMetaTag(
        'viewport',
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no'
      )
      .setXFrameOptionsMode(
        HtmlService.XFrameOptionsMode.ALLOWALL
      );

  } catch (error) {
    Logger.log(
      '[Legacy V2 doGet Error] ' +
      String(error && error.stack ? error.stack : error)
    );

    return HtmlService.createHtmlOutput(
      '<div style="font-family: Arial, sans-serif; padding: 24px; text-align: center;">' +
        '<h2>Hệ thống UniLMS legacy đang bảo trì</h2>' +
        '<p>Vui lòng thử lại sau hoặc liên hệ Quản trị viên.</p>' +
        '<small style="color:#666;">Chi tiết: ' +
          kidlearnV3_safeSanitizeHtml4A_(String(error && error.message ? error.message : error)) +
        '</small>' +
      '</div>'
    )
    .setTitle('UniLMS Legacy Error')
    .addMetaTag(
      'viewport',
      'width=device-width, initial-scale=1'
    );
  }
}


/**
 * Include helper giữ lại cho V2 Index và có thể dùng cho V3 HTML.
 *
 * @param {string} filename Tên file HTML không có đuôi .html
 * @return {string}
 */
function include(filename) {
  try {
    return HtmlService
      .createHtmlOutputFromFile(filename)
      .getContent();
  } catch (error) {
    Logger.log(
      '[Include Error] Không thể tải file: ' +
      filename +
      ' | ' +
      String(error)
    );
    return '';
  }
}


/**
 * Include helper riêng cho KIDLEARN V3.
 *
 * @param {string} filename Tên file HTML không có đuôi .html
 * @return {string}
 */
function kidlearnV3_include4A(filename) {
  return include(filename);
}


/**
 * Smoke test gateway 4A-1A.
 *
 * Chạy trong Apps Script editor để xác nhận gateway đã cài.
 * Không ghi sheet.
 *
 * @return {Object}
 */
function kidlearnV3_smokeTestWebAppGateway4A() {
  var errors = [];
  var warnings = [];

  if (typeof doGet !== 'function') {
    errors.push('Thiếu doGet.');
  }

  if (typeof kidlearnV3_webAppGateway4A !== 'function') {
    errors.push('Thiếu kidlearnV3_webAppGateway4A.');
  }

  if (typeof kidlearnLegacyV2_doGet_ !== 'function') {
    errors.push('Thiếu kidlearnLegacyV2_doGet_.');
  }

  if (typeof include !== 'function') {
    errors.push('Thiếu include.');
  }

  if (typeof kidlearnV3_productDoGet4A !== 'function') {
    warnings.push(
      'kidlearnV3_productDoGet4A chưa có. Đây là bình thường ở 4A-1A. 4A-1B sẽ tạo Product Shell.'
    );
  }

  var defaultRequest =
    kidlearnV3_normalizeWebRequest4A_({
      parameter: {}
    });

  var v2Request =
    kidlearnV3_normalizeWebRequest4A_({
      parameter: {
        app: 'v2'
      }
    });

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_WEB_APP_GATEWAY_4A_1A',
    phase: '4A-1A',
    gatewayInstalled: true,
    defaultRoute: 'v3',
    legacyV2RouteSupported: true,
    defaultRequest: defaultRequest,
    v2Request: v2Request,
    v2RouteDetected:
      kidlearnV3_isLegacyV2Route4A_(v2Request),
    productShellInstalled:
      typeof kidlearnV3_productDoGet4A === 'function',
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    note:
      '4A-1A chỉ thay gateway. Product Shell thật sẽ được tạo ở 4A-1B.'
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4A-1A gateway smoke test failed. Errors=' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Preview route decision.
 *
 * @return {Object}
 */
function kidlearnV3_previewWebAppRoutes4A() {
  var samples = [
    {
      label: 'Default /exec',
      e: {
        parameter: {}
      }
    },
    {
      label: '/exec?app=v3',
      e: {
        parameter: {
          app: 'v3'
        }
      }
    },
    {
      label: '/exec?app=kidlearn',
      e: {
        parameter: {
          app: 'kidlearn'
        }
      }
    },
    {
      label: '/exec?app=v2',
      e: {
        parameter: {
          app: 'v2'
        }
      }
    },
    {
      label: '/exec?app=legacy',
      e: {
        parameter: {
          app: 'legacy'
        }
      }
    },
    {
      label: '/exec?app=unilms',
      e: {
        parameter: {
          app: 'unilms'
        }
      }
    }
  ];

  var routes = [];

  for (var i = 0; i < samples.length; i++) {
    var request =
      kidlearnV3_normalizeWebRequest4A_(samples[i].e);

    routes.push({
      label: samples[i].label,
      app: request.app,
      route:
        kidlearnV3_isLegacyV2Route4A_(request)
          ? 'V2_LEGACY_UNILMS'
          : 'V3_KIDLEARN_PRODUCT',
      isDefault:
        samples[i].label === 'Default /exec'
    });
  }

  var result = {
    success: true,
    action: 'PREVIEW_WEB_APP_ROUTES_4A',
    phase: '4A-1A',
    routes: routes,
    defaultRoute: 'V3_KIDLEARN_PRODUCT',
    legacyRoute:
      'V2_LEGACY_UNILMS via ?app=v2 / ?app=legacy / ?app=unilms',
    productShellInstalled:
      typeof kidlearnV3_productDoGet4A === 'function'
  };

  console.log(JSON.stringify(result, null, 2));

  return result;
}


/**
 * Normalize web request.
 *
 * @param {Object} e Apps Script event object
 * @return {Object}
 */
function kidlearnV3_normalizeWebRequest4A_(e) {
  var parameter =
    e && e.parameter
      ? e.parameter
      : {};

  var app =
    String(
      parameter.app ||
      parameter.kidlearn_app ||
      parameter.mode ||
      ''
    )
    .trim()
    .toLowerCase();

  if (!app) {
    app = 'v3';
  }

  var role =
    String(
      parameter.role ||
      parameter.userRole ||
      ''
    )
    .trim()
    .toUpperCase();

  var page =
    String(
      parameter.page ||
      parameter.screen ||
      ''
    )
    .trim()
    .toLowerCase();

  return {
    app: app,
    role: role,
    page: page,
    rawParameter: parameter
  };
}


/**
 * Detect legacy V2 route.
 *
 * @param {Object} request normalized request
 * @return {boolean}
 */
function kidlearnV3_isLegacyV2Route4A_(request) {
  var app =
    String(request && request.app ? request.app : '')
      .toLowerCase();

  return (
    app === 'v2' ||
    app === 'legacy' ||
    app === 'unilms'
  );
}


/**
 * Safe waiting page for 4A-1A.
 *
 * Hiển thị khi gateway đã cài nhưng Product Shell 4A-1B chưa có.
 *
 * @param {Object} request normalized request
 * @return {HtmlOutput}
 */
function kidlearnV3_renderProductShellPending4A_(request) {
  var html =
    '<!DOCTYPE html>' +
    '<html lang="vi">' +
    '<head>' +
      '<meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>KID LEARN - Phase 4A</title>' +
      '<style>' +
        'body{' +
          'margin:0;' +
          'font-family:Arial,Helvetica,sans-serif;' +
          'background:linear-gradient(135deg,#eef5ff,#f8f2ff);' +
          'color:#111827;' +
        '}' +
        '.wrap{' +
          'min-height:100vh;' +
          'display:flex;' +
          'align-items:center;' +
          'justify-content:center;' +
          'padding:24px;' +
          'box-sizing:border-box;' +
        '}' +
        '.card{' +
          'width:100%;' +
          'max-width:720px;' +
          'background:#ffffff;' +
          'border:1px solid #e5e7eb;' +
          'border-radius:28px;' +
          'box-shadow:0 24px 70px rgba(79,70,229,.14);' +
          'padding:36px;' +
          'box-sizing:border-box;' +
          'text-align:center;' +
        '}' +
        '.logo{' +
          'font-size:34px;' +
          'font-weight:900;' +
          'letter-spacing:.5px;' +
          'margin-bottom:8px;' +
        '}' +
        '.logo span:nth-child(1){color:#ef4444;}' +
        '.logo span:nth-child(2){color:#2563eb;}' +
        '.logo span:nth-child(3){color:#22c55e;}' +
        '.logo span:nth-child(4){color:#f97316;}' +
        '.subtitle{' +
          'font-size:16px;' +
          'color:#4b5563;' +
          'margin-bottom:26px;' +
        '}' +
        '.badge{' +
          'display:inline-block;' +
          'padding:8px 14px;' +
          'border-radius:999px;' +
          'background:#eef2ff;' +
          'color:#4f46e5;' +
          'font-weight:700;' +
          'font-size:13px;' +
          'margin-bottom:18px;' +
        '}' +
        'h1{' +
          'font-size:26px;' +
          'margin:0 0 12px;' +
          'color:#111827;' +
        '}' +
        'p{' +
          'font-size:15px;' +
          'line-height:1.7;' +
          'color:#4b5563;' +
          'margin:8px 0;' +
        '}' +
        '.info{' +
          'margin-top:24px;' +
          'padding:18px;' +
          'background:#f9fafb;' +
          'border-radius:18px;' +
          'text-align:left;' +
          'font-size:14px;' +
          'color:#374151;' +
        '}' +
        '.info div{' +
          'margin:8px 0;' +
        '}' +
        '.btnrow{' +
          'margin-top:24px;' +
          'display:flex;' +
          'gap:12px;' +
          'justify-content:center;' +
          'flex-wrap:wrap;' +
        '}' +
        '.btn{' +
          'display:inline-block;' +
          'text-decoration:none;' +
          'padding:12px 18px;' +
          'border-radius:14px;' +
          'font-weight:700;' +
          'font-size:14px;' +
        '}' +
        '.primary{' +
          'background:#6d5dfc;' +
          'color:#fff;' +
        '}' +
        '.secondary{' +
          'background:#eef2ff;' +
          'color:#4f46e5;' +
        '}' +
      '</style>' +
    '</head>' +
    '<body>' +
      '<div class="wrap">' +
        '<div class="card">' +
          '<div class="logo">' +
            '<span>KID</span> <span>LE</span><span>AR</span><span>N</span>' +
          '</div>' +
          '<div class="subtitle">Học vui - Tiến bộ mỗi ngày</div>' +
          '<div class="badge">Phase 4A-1A Gateway Installed</div>' +
          '<h1>Web App Gateway đã sẵn sàng</h1>' +
          '<p>Gateway đã chuyển mặc định sang KIDLEARN V3.</p>' +
          '<p>Product Shell chính thức sẽ được cài ở bước 4A-1B.</p>' +
          '<div class="info">' +
            '<div><b>Default route:</b> V3 KIDLEARN Product App</div>' +
            '<div><b>Legacy route:</b> thêm <code>?app=v2</code> để mở V2 UniLMS</div>' +
            '<div><b>Demo child:</b> Lịch Khê - Lớp 2</div>' +
            '<div><b>Current app param:</b> ' +
              kidlearnV3_safeSanitizeHtml4A_(String(request.app || 'v3')) +
            '</div>' +
          '</div>' +
          '<div class="btnrow">' +
            '<a class="btn primary" href="?app=v3">Mở KIDLEARN V3</a>' +
            '<a class="btn secondary" href="?app=v2">Mở V2 Legacy</a>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</body>' +
    '</html>';

  return HtmlService
    .createHtmlOutput(html)
    .setTitle('KID LEARN - Phase 4A')
    .addMetaTag(
      'viewport',
      'width=device-width, initial-scale=1'
    )
    .setXFrameOptionsMode(
      HtmlService.XFrameOptionsMode.ALLOWALL
    );
}


/**
 * Render gateway error safely.
 *
 * @param {string} title Error title
 * @param {*} error Error object/string
 * @return {HtmlOutput}
 */
function kidlearnV3_renderGatewayError4A_(title, error) {
  var message =
    String(error && error.message ? error.message : error);

  var stack =
    String(error && error.stack ? error.stack : '');

  Logger.log(
    '[KIDLEARN V3 Gateway Error] ' +
    message +
    '\n' +
    stack
  );

  var html =
    '<!DOCTYPE html>' +
    '<html lang="vi">' +
    '<head>' +
      '<meta charset="UTF-8">' +
      '<meta name="viewport" content="width=device-width, initial-scale=1">' +
      '<title>' + kidlearnV3_safeSanitizeHtml4A_(title) + '</title>' +
    '</head>' +
    '<body style="font-family:Arial,sans-serif;padding:24px;background:#f9fafb;color:#111827;">' +
      '<div style="max-width:720px;margin:40px auto;background:#fff;border:1px solid #e5e7eb;border-radius:20px;padding:28px;box-shadow:0 16px 48px rgba(15,23,42,.08);">' +
        '<h2 style="margin-top:0;color:#dc2626;">' +
          kidlearnV3_safeSanitizeHtml4A_(title) +
        '</h2>' +
        '<p>Hệ thống đang gặp lỗi ở Web App Gateway.</p>' +
        '<p style="color:#6b7280;">Chi tiết: ' +
          kidlearnV3_safeSanitizeHtml4A_(message) +
        '</p>' +
        '<p style="font-size:13px;color:#9ca3af;">Phase: 4A-1A</p>' +
      '</div>' +
    '</body>' +
    '</html>';

  return HtmlService
    .createHtmlOutput(html)
    .setTitle(title)
    .addMetaTag(
      'viewport',
      'width=device-width, initial-scale=1'
    );
}


/**
 * Safe date format.
 *
 * Ưu tiên Utils_System.formatDate nếu V2 helper còn hoạt động.
 * Nếu không, fallback về ISO string.
 *
 * @param {Date} dateValue Date
 * @return {string}
 */
function kidlearnV3_safeFormatDate4A_(dateValue) {
  try {
    if (
      typeof Utils_System !== 'undefined' &&
      Utils_System &&
      typeof Utils_System.formatDate === 'function'
    ) {
      return Utils_System.formatDate(dateValue);
    }
  } catch (error) {
    // fallback below
  }

  try {
    return Utilities.formatDate(
      dateValue,
      Session.getScriptTimeZone(),
      'yyyy-MM-dd HH:mm:ss'
    );
  } catch (error2) {
    return new Date(dateValue).toISOString();
  }
}


/**
 * Safe sanitize HTML.
 *
 * Không phụ thuộc Utils_System.
 *
 * @param {string} value raw text
 * @return {string}
 */
function kidlearnV3_safeSanitizeHtml4A_(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}