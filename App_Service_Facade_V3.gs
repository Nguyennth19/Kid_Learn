/**
 * ================================================================
 * KIDLEARN V3 - APP SERVICE FACADE
 * Step: 3I.3
 * Version: 3.1.0
 * ================================================================
 *
 * File này tạo lớp service trung gian cho UI DEV.
 *
 * UI DEV chỉ nên gọi các hàm service trong file này.
 *
 * KHÔNG sửa PROD.
 * KHÔNG ghi dữ liệu học tập.
 * KHÔNG xóa dữ liệu.
 * KHÔNG migration dữ liệu.
 */


var KIDLEARN_V3_SERVICE_CONFIG = {
  VERSION: '3I.3',
  RESPONSE_VERSION: '1.0',
  DEFAULT_LIMIT: 500,
  MAX_LIMIT: 5000
};


/**
 * Preview Service Facade V3.
 */
function kidlearnV3_previewAppServiceFacadeV3() {
  var result =
    kidlearnV3_serviceInvoke_(
      'PREVIEW_APP_SERVICE_FACADE_V3',
      function() {
        return {
          serviceVersion:
            KIDLEARN_V3_SERVICE_CONFIG.VERSION,

          responseVersion:
            KIDLEARN_V3_SERVICE_CONFIG.RESPONSE_VERSION,

          databaseMode:
            kidlearnV3_serviceGetProperty_(
              'KIDLEARN_APP_DATABASE_MODE'
            ),

          connectionStatus:
            kidlearnV3_serviceGetProperty_(
              'KIDLEARN_APP_CONNECTION_STATUS'
            ),

          schemaVersion:
            kidlearnV3_serviceGetProperty_(
              'KIDLEARN_APP_SCHEMA_VERSION'
            ),

          availableUiFunctions: [
            'kidlearnV3_servicePingV3',
            'kidlearnV3_serviceGetBootstrapV3',
            'kidlearnV3_serviceGetDashboardV3',
            'kidlearnV3_serviceGetSubjectsV3',
            'kidlearnV3_serviceGetChildrenV3',
            'kidlearnV3_serviceGetAssignmentsV3',
            'kidlearnV3_serviceGetFamilyContextV3',
            'kidlearnV3_serviceGetConfigV3',
            'kidlearnV3_serviceReadCoreV3'
          ]
        };
      },
      {}
    );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Smoke test Service Facade V3.
 */
function kidlearnV3_smokeTestAppServiceFacadeV3() {
  var ping =
    kidlearnV3_servicePingV3();

  var bootstrap =
    kidlearnV3_serviceGetBootstrapV3({});

  var dashboard =
    kidlearnV3_serviceGetDashboardV3({});

  var subjects =
    kidlearnV3_serviceGetSubjectsV3({});

  var children =
    kidlearnV3_serviceGetChildrenV3({});

  var errors = [];
  var warnings = [];

  if (!ping.success) {
    errors.push(
      'Ping service thất bại.'
    );
  }

  if (!bootstrap.success) {
    errors.push(
      'Bootstrap service thất bại.'
    );
  }

  if (!dashboard.success) {
    errors.push(
      'Dashboard service thất bại.'
    );
  }

  if (!subjects.success) {
    errors.push(
      'Subjects service thất bại.'
    );
  }

  if (!children.success) {
    errors.push(
      'Children service thất bại.'
    );
  }

  if (
    subjects.success &&
    subjects.data.count < 4
  ) {
    errors.push(
      'Subjects service phải đọc được ít nhất 4 môn học.'
    );
  }

  if (
    children.success &&
    children.data.count < 1
  ) {
    errors.push(
      'Children service chưa đọc được dữ liệu trẻ em.'
    );
  }

  if (
    bootstrap.success &&
    bootstrap.data.counts.assignments < 1
  ) {
    warnings.push(
      'Bootstrap chưa có assignments hoặc dữ liệu assignments đang trống.'
    );
  }

  var result = {
    success:
      errors.length === 0,

    action:
      'SMOKE_TEST_APP_SERVICE_FACADE_V3',

    errorCount:
      errors.length,

    warningCount:
      warnings.length,

    errors:
      errors,

    warnings:
      warnings,

    checks: {
      ping:
        ping.success,
      bootstrap:
        bootstrap.success,
      dashboard:
        dashboard.success,
      subjects:
        subjects.success,
      children:
        children.success
    },

    counts: {
      subjects:
        subjects.success
          ? subjects.data.count
          : 0,
      children:
        children.success
          ? children.data.count
          : 0,
      bootstrapAssignments:
        bootstrap.success
          ? bootstrap.data.counts.assignments
          : 0
    }
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test App Service Facade V3 chưa đạt. Errors: ' +
      errors.length
    );
  }

  return result;
}


/**
 * UI gọi để kiểm tra service còn sống.
 */
function kidlearnV3_servicePingV3(request) {
  return kidlearnV3_serviceInvoke_(
    'PING_V3',
    function() {
      return {
        ok: true,
        serviceVersion:
          KIDLEARN_V3_SERVICE_CONFIG.VERSION,
        databaseMode:
          kidlearnV3_serviceGetProperty_(
            'KIDLEARN_APP_DATABASE_MODE'
          ),
        connectionStatus:
          kidlearnV3_serviceGetProperty_(
            'KIDLEARN_APP_CONNECTION_STATUS'
          ),
        schemaVersion:
          KIDLEARN_V3.SCHEMA_VERSION,
        appVersion:
          KIDLEARN_V3.APP_VERSION
      };
    },
    request
  );
}


/**
 * UI gọi để lấy toàn bộ dữ liệu khởi tạo app.
 */
function kidlearnV3_serviceGetBootstrapV3(request) {
  return kidlearnV3_serviceInvoke_(
    'GET_BOOTSTRAP_V3',
    function(req) {
      var payload =
        kidlearnV3_adapterGetBootstrapPayloadV3();

      if (req.userId) {
        payload.familyContext =
          kidlearnV3_adapterGetFamilyContextV3(
            req.userId
          );
      }

      return payload;
    },
    request
  );
}


/**
 * UI gọi để lấy dashboard theo childId.
 */
function kidlearnV3_serviceGetDashboardV3(request) {
  return kidlearnV3_serviceInvoke_(
    'GET_DASHBOARD_V3',
    function(req) {
      return kidlearnV3_adapterGetDashboardPayloadV3(
        req.childId || ''
      );
    },
    request
  );
}


/**
 * UI gọi để lấy danh sách môn học.
 */
function kidlearnV3_serviceGetSubjectsV3(request) {
  return kidlearnV3_serviceInvoke_(
    'GET_SUBJECTS_V3',
    function() {
      var rows =
        kidlearnV3_adapterGetSubjectsV3();

      return {
        count: rows.length,
        rows: rows
      };
    },
    request
  );
}


/**
 * UI gọi để lấy danh sách trẻ em.
 */
function kidlearnV3_serviceGetChildrenV3(request) {
  return kidlearnV3_serviceInvoke_(
    'GET_CHILDREN_V3',
    function(req) {
      var rows = [];

      if (req.userId) {
        var context =
          kidlearnV3_adapterGetFamilyContextV3(
            req.userId
          );

        rows =
          context.children || [];
      } else {
        rows =
          kidlearnV3_adapterGetChildrenV3();
      }

      return {
        count: rows.length,
        rows: rows
      };
    },
    request
  );
}


/**
 * UI gọi để lấy assignments.
 */
function kidlearnV3_serviceGetAssignmentsV3(request) {
  return kidlearnV3_serviceInvoke_(
    'GET_ASSIGNMENTS_V3',
    function(req) {
      var childId =
        String(req.childId || '').trim();

      var rows =
        kidlearnV3_adapterGetAssignmentsForChildV3(
          childId
        );

      var limit =
        kidlearnV3_serviceLimit_(
          req.limit
        );

      rows =
        kidlearnV3_serviceTake_(
          rows,
          limit
        );

      return {
        childId: childId,
        count: rows.length,
        rows: rows
      };
    },
    request
  );
}


/**
 * UI gọi để lấy family context.
 */
function kidlearnV3_serviceGetFamilyContextV3(request) {
  return kidlearnV3_serviceInvoke_(
    'GET_FAMILY_CONTEXT_V3',
    function(req) {
      return kidlearnV3_adapterGetFamilyContextV3(
        req.userId || ''
      );
    },
    request
  );
}


/**
 * UI gọi để lấy config map.
 */
function kidlearnV3_serviceGetConfigV3(request) {
  return kidlearnV3_serviceInvoke_(
    'GET_CONFIG_V3',
    function() {
      var config =
        kidlearnV3_adapterGetConfigMapV3();

      return {
        count:
          Object.keys(config).length,
        config:
          config
      };
    },
    request
  );
}


/**
 * UI gọi đọc các core sheet an toàn.
 * Không expose raw credential.
 */
function kidlearnV3_serviceReadCoreV3(request) {
  return kidlearnV3_serviceInvoke_(
    'READ_CORE_V3',
    function(req) {
      var sheetName =
        String(req.sheetName || '').trim();

      if (sheetName === 'MST_Subjects') {
        var subjects =
          kidlearnV3_adapterGetSubjectsV3();

        return {
          sheetName: sheetName,
          count: subjects.length,
          rows: subjects
        };
      }

      if (sheetName === 'DATA_Users') {
        var users =
          kidlearnV3_adapterGetUsersV3();

        return {
          sheetName: sheetName,
          count: users.length,
          rows: users
        };
      }

      if (sheetName === 'DATA_Children') {
        var children =
          kidlearnV3_adapterGetChildrenV3();

        return {
          sheetName: sheetName,
          count: children.length,
          rows: children
        };
      }

      if (sheetName === 'DATA_UserChildAccess') {
        var access =
          kidlearnV3_adapterGetUserChildAccessV3();

        return {
          sheetName: sheetName,
          count: access.length,
          rows: access
        };
      }

      if (sheetName === 'DATA_Assignments') {
        var assignments =
          kidlearnV3_adapterGetAssignmentsForChildV3(
            req.childId || ''
          );

        return {
          sheetName: sheetName,
          count: assignments.length,
          rows:
            kidlearnV3_serviceTake_(
              assignments,
              kidlearnV3_serviceLimit_(req.limit)
            )
        };
      }

      if (sheetName === 'SYS_Config') {
        var config =
          kidlearnV3_adapterGetConfigMapV3();

        return {
          sheetName: sheetName,
          count:
            Object.keys(config).length,
          config: config
        };
      }

      throw new Error(
        'Sheet không được phép đọc qua serviceReadCoreV3: ' +
        sheetName
      );
    },
    request
  );
}


/**
 * Core wrapper cho tất cả service public.
 */
function kidlearnV3_serviceInvoke_(
  serviceName,
  handler,
  request
) {
  var startedAt =
    new Date();

  var requestId =
    kidlearnV3_serviceRequestId_(
      serviceName,
      startedAt
    );

  var safeRequest =
    kidlearnV3_serviceNormalizeRequest_(
      request
    );

  try {
    kidlearnV3_serviceAssertReady_();

    var data =
      handler(safeRequest);

    var result =
      kidlearnV3_serviceSuccess_(
        serviceName,
        requestId,
        startedAt,
        data
      );

    return result;

  } catch (error) {
    return kidlearnV3_serviceFailure_(
      serviceName,
      requestId,
      startedAt,
      error
    );
  }
}


/**
 * Kiểm tra các thành phần bắt buộc trước khi service chạy.
 */
function kidlearnV3_serviceAssertReady_() {
  if (
    typeof kidlearnV3_adapterGetBootstrapPayloadV3 !== 'function'
  ) {
    throw new Error(
      'Thiếu 3I.2: kidlearnV3_adapterGetBootstrapPayloadV3 chưa tồn tại.'
    );
  }

  if (
    typeof kidlearnV3_appGetActiveDatabaseV3_ !== 'function'
  ) {
    throw new Error(
      'Thiếu 3I.1: kidlearnV3_appGetActiveDatabaseV3_ chưa tồn tại.'
    );
  }

  var mode =
    kidlearnV3_serviceGetProperty_(
      'KIDLEARN_APP_DATABASE_MODE'
    );

  var status =
    kidlearnV3_serviceGetProperty_(
      'KIDLEARN_APP_CONNECTION_STATUS'
    );

  if (mode !== 'V3') {
    throw new Error(
      'App DEV chưa bật databaseMode V3. Hiện tại: ' +
      mode
    );
  }

  if (status !== 'CONNECTED') {
    throw new Error(
      'App DEV chưa CONNECTED với Database V3. Hiện tại: ' +
      status
    );
  }
}


/**
 * Build response success.
 */
function kidlearnV3_serviceSuccess_(
  serviceName,
  requestId,
  startedAt,
  data
) {
  var finishedAt =
    new Date();

  return {
    success: true,
    serviceName: serviceName,
    requestId: requestId,
    responseVersion:
      KIDLEARN_V3_SERVICE_CONFIG.RESPONSE_VERSION,
    schemaVersion:
      KIDLEARN_V3.SCHEMA_VERSION,
    appVersion:
      KIDLEARN_V3.APP_VERSION,
    startedAt:
      startedAt.toISOString(),
    finishedAt:
      finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    data:
      kidlearnV3_serviceCloneSafe_(
        data
      )
  };
}


/**
 * Build response failure.
 */
function kidlearnV3_serviceFailure_(
  serviceName,
  requestId,
  startedAt,
  error
) {
  var finishedAt =
    new Date();

  var message =
    String(
      error &&
      error.message
        ? error.message
        : error
    );

  var result = {
    success: false,
    serviceName: serviceName,
    requestId: requestId,
    responseVersion:
      KIDLEARN_V3_SERVICE_CONFIG.RESPONSE_VERSION,
    schemaVersion:
      KIDLEARN_V3.SCHEMA_VERSION,
    appVersion:
      KIDLEARN_V3.APP_VERSION,
    startedAt:
      startedAt.toISOString(),
    finishedAt:
      finishedAt.toISOString(),
    durationMs:
      finishedAt.getTime() -
      startedAt.getTime(),
    error: {
      code:
        'SERVICE_ERROR',
      message:
        message
    }
  };

  console.error(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Normalize request từ UI.
 */
function kidlearnV3_serviceNormalizeRequest_(
  request
) {
  if (!request) {
    return {};
  }

  if (
    typeof request !== 'object'
  ) {
    return {
      value: request
    };
  }

  return request;
}


/**
 * Clone dữ liệu an toàn để trả cho UI.
 */
function kidlearnV3_serviceCloneSafe_(
  value
) {
  if (
    value === undefined ||
    value === null
  ) {
    return null;
  }

  try {
    return JSON.parse(
      JSON.stringify(value)
    );
  } catch (error) {
    return {
      value:
        String(value)
    };
  }
}


/**
 * Sinh requestId.
 */
function kidlearnV3_serviceRequestId_(
  serviceName,
  dateValue
) {
  var text =
    Utilities.formatDate(
      dateValue,
      Session.getScriptTimeZone(),
      'yyyyMMdd_HHmmss'
    );

  var random =
    Math.floor(
      Math.random() * 100000
    );

  return (
    'REQ_' +
    serviceName +
    '_' +
    text +
    '_' +
    random
  );
}


/**
 * Lấy ScriptProperty.
 */
function kidlearnV3_serviceGetProperty_(
  key
) {
  return (
    PropertiesService
      .getScriptProperties()
      .getProperty(key) ||
    ''
  );
}


/**
 * Chuẩn hóa limit.
 */
function kidlearnV3_serviceLimit_(
  value
) {
  var limit =
    Number(value || KIDLEARN_V3_SERVICE_CONFIG.DEFAULT_LIMIT);

  if (
    isNaN(limit) ||
    limit < 1
  ) {
    limit =
      KIDLEARN_V3_SERVICE_CONFIG.DEFAULT_LIMIT;
  }

  if (
    limit > KIDLEARN_V3_SERVICE_CONFIG.MAX_LIMIT
  ) {
    limit =
      KIDLEARN_V3_SERVICE_CONFIG.MAX_LIMIT;
  }

  return limit;
}


/**
 * Take N items.
 */
function kidlearnV3_serviceTake_(
  rows,
  limit
) {
  var result = [];

  var max =
    Math.min(
      rows.length,
      limit
    );

  for (
    var i = 0;
    i < max;
    i++
  ) {
    result.push(
      rows[i]
    );
  }

  return result;
}