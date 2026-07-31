/**
 * ================================================================
 * KIDLEARN V3 - SECURITY REVIEW / ROLE GUARD
 * Bundle: 3M-C
 * Version: 3.1.0
 * ================================================================
 *
 * 3M-C:
 * - Không ghi dữ liệu học tập thật
 * - Không real write
 * - Không rollback
 * - Không migration
 * - Không create/delete sheet
 * - Chỉ ghi ScriptProperties để lưu status/review result
 */


var KIDLEARN_V3_SECURITY_3MC_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3MC_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3MC_LAST_PREVIEW_AT',
  LAST_REVIEW_AT: 'KIDLEARN_V3_PHASE_3MC_LAST_REVIEW_AT',
  LAST_SMOKE_TEST_AT: 'KIDLEARN_V3_PHASE_3MC_LAST_SMOKE_TEST_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3MC_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3MC_LAST_RESULT_JSON',
  LAST_REVIEW_JSON: 'KIDLEARN_V3_PHASE_3MC_LAST_REVIEW_JSON'
};


var KIDLEARN_V3_SECURITY_3MC_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  REVIEW_PASSED: 'REVIEW_PASSED',
  GUARD_TESTED: 'GUARD_TESTED',
  READY_FOR_3M_D: 'READY_FOR_3M_D',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_SECURITY_3MC_CONFIG = {
  VERSION: '3M-C',
  PHASE: '3M-C',
  NEXT_BUNDLE: '3M-D',
  WRITE_MODE: 'NO_DB_WRITE',
  REAL_WRITE_ALLOWED: false,
  MAX_ROWS_PER_SHEET: 250,
  ALLOWED_ROLES: ['CHILD', 'FAMILY_ADMIN'],
  DEFAULT_DEV_ROLE: 'FAMILY_ADMIN'
};


var KIDLEARN_V3_SECURITY_3MC_ROLE_POLICY = {
  CHILD: {
    role: 'CHILD',
    canSwitchChild: false,
    canManageChildren: false,
    canViewProgress: true,
    canViewAssignments: false,
    canViewSettings: false,
    canUseLearningInteractionDryRun: true,
    allowedScreens: {
      CHILD_HOME: true,
      LEARNING_HOME_V3: true,
      LESSON_CONTENT_3LB: true,
      LEARNING_INTERACTION_3LC: true,
      LIBRARY_HOME: true,
      ACHIEVEMENTS_HOME: true,
      PROGRESS_HOME: true
    },
    allowedActions: {
      VIEW_HOME: true,
      VIEW_LEARNING: true,
      VIEW_LESSON_CONTENT: true,
      START_LESSON_DRY_RUN: true,
      COMPLETE_BLOCK_DRY_RUN: true,
      SUBMIT_ANSWER_DRY_RUN: true,
      FINISH_LESSON_DRY_RUN: true
    }
  },

  FAMILY_ADMIN: {
    role: 'FAMILY_ADMIN',
    canSwitchChild: true,
    canManageChildren: true,
    canViewProgress: true,
    canViewAssignments: true,
    canViewSettings: true,
    canUseLearningInteractionDryRun: true,
    allowedScreens: {
      FAMILY_HOME: true,
      CHILDREN_HOME: true,
      LEARNING_HOME_V3: true,
      LESSON_CONTENT_3LB: true,
      LEARNING_INTERACTION_3LC: true,
      ASSIGNMENTS_HOME: true,
      PROGRESS_HOME: true,
      SETTINGS_HOME: true,
      LIBRARY_HOME: true,
      ACHIEVEMENTS_HOME: true
    },
    allowedActions: {
      VIEW_HOME: true,
      VIEW_CHILDREN: true,
      VIEW_LEARNING: true,
      VIEW_LESSON_CONTENT: true,
      VIEW_ASSIGNMENTS: true,
      VIEW_PROGRESS: true,
      VIEW_SETTINGS: true,
      START_LESSON_DRY_RUN: true,
      COMPLETE_BLOCK_DRY_RUN: true,
      SUBMIT_ANSWER_DRY_RUN: true,
      FINISH_LESSON_DRY_RUN: true
    }
  }
};


/**
 * Preview 3M-C.
 */
function kidlearnV3_previewSecurityRoleGuard3MCV3() {
  var errors = [];
  var warnings = [];

  var functionChecks =
    kidlearnV3_3mcCheckFunctions_([
      'kidlearnV3_assertPerformanceBaseline3MBReadyV3',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_appGetActiveDatabaseV3_',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors =
    errors.concat(
      functionChecks.errors
    );

  var phase3MB =
    kidlearnV3_3mcSafeAssert_(
      'kidlearnV3_assertPerformanceBaseline3MBReadyV3',
      '3M-B'
    );

  if (!phase3MB.success) {
    errors.push(
      '3M-B chưa READY_FOR_3M_C: ' +
      phase3MB.message
    );
  }

  var safeWrite =
    kidlearnV3_3mcSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      '3M-C yêu cầu Safe Write DRY_RUN/enabled=false. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var controlledWrite =
    kidlearnV3_3mcControlledWriteStatus_();

  if (
    controlledWrite.available === true &&
    controlledWrite.status === 'ENABLED'
  ) {
    errors.push(
      'Controlled Write đang ENABLED. Không được chạy security review.'
    );
  }

  var dataSummary = null;

  try {
    dataSummary =
      kidlearnV3_3mcGetSecurityDataSummary_();

    if (dataSummary.usersCount < 1) {
      warnings.push(
        'DATA_Users chưa có user. Role guard sẽ dùng DEV fallback khi test.'
      );
    }

    if (dataSummary.childrenCount < 1) {
      warnings.push(
        'DATA_Children chưa có child. Child access guard sẽ dùng DEV fallback khi test.'
      );
    }

    if (dataSummary.accessCount < 1) {
      warnings.push(
        'DATA_UserChildAccess chưa có access row. FAMILY_ADMIN/CHILD access sẽ dùng DEV fallback trong test.'
      );
    }

  } catch (error) {
    errors.push(
      'Không đọc được security data summary: ' +
      String(error.message || error)
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_SECURITY_ROLE_GUARD_3MC_V3',
    bundle: '3M-C',
    phase: KIDLEARN_V3_SECURITY_3MC_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_SECURITY_3MC_CONFIG.NEXT_BUNDLE,
    writeMode: KIDLEARN_V3_SECURITY_3MC_CONFIG.WRITE_MODE,
    realWriteAllowed: false,
    allowedRoles: KIDLEARN_V3_SECURITY_3MC_CONFIG.ALLOWED_ROLES,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3MB: phase3MB,
    safeWriteStatus: safeWrite,
    controlledWriteStatus: controlledWrite,
    functionChecks: functionChecks.items,
    dataSummary: dataSummary
  };

  kidlearnV3_3mcSaveResult_(
    result,
    KIDLEARN_V3_SECURITY_3MC_STATUS.PREVIEWED,
    KIDLEARN_V3_SECURITY_3MC_KEYS.LAST_PREVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Run security review.
 */
function kidlearnV3_runSecurityReview3MCV3() {
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewSecurityRoleGuard3MCV3();

  if (!preview.success) {
    throw new Error(
      'Không thể chạy 3M-C security review vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var data =
    kidlearnV3_3mcReadSecurityData_();

  var roleAudit =
    kidlearnV3_3mcAuditUserRoles_(
      data.users
    );

  errors =
    errors.concat(
      roleAudit.errors || []
    );

  warnings =
    warnings.concat(
      roleAudit.warnings || []
    );

  var accessAudit =
    kidlearnV3_3mcAuditUserChildAccess_(
      data.users,
      data.children,
      data.access
    );

  errors =
    errors.concat(
      accessAudit.errors || []
    );

  warnings =
    warnings.concat(
      accessAudit.warnings || []
    );

  var policyAudit =
    kidlearnV3_3mcAuditRolePolicies_();

  errors =
    errors.concat(
      policyAudit.errors || []
    );

  warnings =
    warnings.concat(
      policyAudit.warnings || []
    );

  var guardSmoke =
    kidlearnV3_smokeTestRoleGuard3MCV3();

  if (!guardSmoke.success) {
    errors =
      errors.concat(
        guardSmoke.errors || []
      );
  }

  warnings =
    warnings.concat(
      guardSmoke.warnings || []
    );

  var result = {
    success: errors.length === 0,
    action: 'RUN_SECURITY_REVIEW_3MC_V3',
    bundle: '3M-C',
    phase: KIDLEARN_V3_SECURITY_3MC_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_SECURITY_3MC_CONFIG.NEXT_BUNDLE,
    writeMode: KIDLEARN_V3_SECURITY_3MC_CONFIG.WRITE_MODE,
    realWriteAllowed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    dataSummary: {
      usersCount: data.users.length,
      childrenCount: data.children.length,
      accessCount: data.access.length
    },
    roleAudit: roleAudit,
    accessAudit: accessAudit,
    policyAudit: policyAudit,
    guardSmoke: {
      success: guardSmoke.success,
      testCount: guardSmoke.testCount,
      errorCount: guardSmoke.errorCount
    },
    reviewedAt:
      new Date().toISOString()
  };

  kidlearnV3_3mcSaveReview_(
    result
  );

  kidlearnV3_3mcSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_SECURITY_3MC_STATUS.REVIEW_PASSED
      : KIDLEARN_V3_SECURITY_3MC_STATUS.FAILED,
    KIDLEARN_V3_SECURITY_3MC_KEYS.LAST_REVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3M-C security review failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Public role guard.
 *
 * Request example:
 * {
 *   role: 'CHILD',
 *   userId: '...',
 *   childId: '...',
 *   screenId: 'LEARNING_HOME_V3',
 *   actionCode: 'VIEW_LEARNING'
 * }
 */
function kidlearnV3_roleGuard3MCV3(request) {
  var req =
    kidlearnV3_3mcNormalizeRequest_(
      request
    );

  var errors = [];
  var warnings = [];

  var data =
    kidlearnV3_3mcReadSecurityData_();

  var role =
    kidlearnV3_3mcNormalizeRole_(
      req.role
    );

  if (!role) {
    errors.push(
      'Role không hợp lệ hoặc không được phép: ' +
      String(req.role || '')
    );
  }

  var activeUser =
    kidlearnV3_3mcResolveUser_(
      req,
      data,
      role
    );

  var activeChild =
    kidlearnV3_3mcResolveChild_(
      req,
      data
    );

  var policy =
    role
      ? KIDLEARN_V3_SECURITY_3MC_ROLE_POLICY[role]
      : null;

  if (!policy) {
    errors.push(
      'Không tìm thấy role policy cho role=' +
      role
    );
  }

  var screenCheck =
    kidlearnV3_3mcCheckScreenAccess_(
      policy,
      req.screenId
    );

  if (!screenCheck.success) {
    errors.push(
      screenCheck.message
    );
  }

  var actionCheck =
    kidlearnV3_3mcCheckActionAccess_(
      policy,
      req.actionCode
    );

  if (!actionCheck.success) {
    errors.push(
      actionCheck.message
    );
  }

  var childAccessCheck =
    kidlearnV3_3mcCheckChildAccess_(
      role,
      activeUser,
      activeChild,
      data.access
    );

  if (!childAccessCheck.success) {
    errors.push(
      childAccessCheck.message
    );
  }

  warnings =
    warnings.concat(
      childAccessCheck.warnings || []
    );

  var result = {
    success: errors.length === 0,
    action: 'ROLE_GUARD_3MC_V3',
    bundle: '3M-C',
    role: role,
    requestedRole: req.role || '',
    screenId: req.screenId || '',
    actionCode: req.actionCode || '',
    userId:
      activeUser.userId || '',
    childId:
      activeChild.childId || '',
    canAccess: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    policySummary:
      policy
        ? {
            role: policy.role,
            canSwitchChild: policy.canSwitchChild,
            canManageChildren: policy.canManageChildren,
            canViewSettings: policy.canViewSettings,
            canUseLearningInteractionDryRun:
              policy.canUseLearningInteractionDryRun
          }
        : null,
    childAccessCheck: childAccessCheck,
    evaluatedAt:
      new Date().toISOString()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert role access.
 */
function kidlearnV3_assertRoleAccess3MCV3(request) {
  var result =
    kidlearnV3_roleGuard3MCV3(
      request || {}
    );

  if (!result.success) {
    throw new Error(
      'Role guard denied. Errors=' +
      result.errorCount +
      '. ' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Get policy for UI.
 */
function kidlearnV3_getRolePolicy3MCV3(request) {
  var req =
    kidlearnV3_3mcNormalizeRequest_(
      request
    );

  var role =
    kidlearnV3_3mcNormalizeRole_(
      req.role
    );

  if (!role) {
    return {
      success: false,
      action: 'GET_ROLE_POLICY_3MC_V3',
      error:
        'Role không hợp lệ: ' +
        String(req.role || '')
    };
  }

  return {
    success: true,
    action: 'GET_ROLE_POLICY_3MC_V3',
    bundle: '3M-C',
    role: role,
    policy:
      KIDLEARN_V3_SECURITY_3MC_ROLE_POLICY[role]
  };
}


/**
 * Smoke test role guard.
 */
function kidlearnV3_smokeTestRoleGuard3MCV3() {
  var errors = [];
  var warnings = [];
  var tests = [];

  var cases = [
    {
      name: 'FAMILY_ADMIN can view settings',
      request: {
        role: 'FAMILY_ADMIN',
        screenId: 'SETTINGS_HOME',
        actionCode: 'VIEW_SETTINGS'
      },
      expectSuccess: true
    },
    {
      name: 'CHILD can view learning',
      request: {
        role: 'CHILD',
        screenId: 'LEARNING_HOME_V3',
        actionCode: 'VIEW_LEARNING'
      },
      expectSuccess: true
    },
    {
      name: 'CHILD cannot view settings',
      request: {
        role: 'CHILD',
        screenId: 'SETTINGS_HOME',
        actionCode: 'VIEW_SETTINGS'
      },
      expectSuccess: false
    },
    {
      name: 'FAMILY_ADMIN can use dry-run interaction',
      request: {
        role: 'FAMILY_ADMIN',
        screenId: 'LEARNING_INTERACTION_3LC',
        actionCode: 'START_LESSON_DRY_RUN'
      },
      expectSuccess: true
    },
    {
      name: 'CHILD can submit dry-run answer',
      request: {
        role: 'CHILD',
        screenId: 'LEARNING_INTERACTION_3LC',
        actionCode: 'SUBMIT_ANSWER_DRY_RUN'
      },
      expectSuccess: true
    },
    {
      name: 'ADMIN role is blocked',
      request: {
        role: 'ADMIN',
        screenId: 'SETTINGS_HOME',
        actionCode: 'VIEW_SETTINGS'
      },
      expectSuccess: false
    },
    {
      name: 'TEACHER role is blocked',
      request: {
        role: 'TEACHER',
        screenId: 'LEARNING_HOME_V3',
        actionCode: 'VIEW_LEARNING'
      },
      expectSuccess: false
    }
  ];

  for (var i = 0; i < cases.length; i++) {
    var testCase =
      cases[i];

    var result =
      kidlearnV3_roleGuard3MCV3(
        testCase.request
      );

    var passed =
      result.success === testCase.expectSuccess;

    tests.push({
      name: testCase.name,
      expectSuccess: testCase.expectSuccess,
      actualSuccess: result.success,
      passed: passed,
      errors: result.errors || [],
      warnings: result.warnings || []
    });

    if (!passed) {
      errors.push(
        testCase.name +
        ' failed. Expected=' +
        testCase.expectSuccess +
        ', actual=' +
        result.success
      );
    }

    if (
      result.warnings &&
      result.warnings.length
    ) {
      warnings =
        warnings.concat(
          result.warnings
        );
    }
  }

  var resultFinal = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_ROLE_GUARD_3MC_V3',
    bundle: '3M-C',
    phase: KIDLEARN_V3_SECURITY_3MC_CONFIG.PHASE,
    testCount: cases.length,
    passedTestCount:
      tests.filter(function(item) {
        return item.passed;
      }).length,
    failedTestCount:
      tests.filter(function(item) {
        return !item.passed;
      }).length,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    tests: tests
  };

  kidlearnV3_3mcSaveResult_(
    resultFinal,
    resultFinal.success
      ? KIDLEARN_V3_SECURITY_3MC_STATUS.GUARD_TESTED
      : KIDLEARN_V3_SECURITY_3MC_STATUS.FAILED,
    KIDLEARN_V3_SECURITY_3MC_KEYS.LAST_SMOKE_TEST_AT
  );

  console.log(
    JSON.stringify(resultFinal, null, 2)
  );

  return resultFinal;
}


/**
 * Mark 3M-C ready.
 */
function kidlearnV3_markSecurityRoleGuard3MCReadyV3() {
  var status =
    kidlearnV3_getSecurityRoleGuard3MCStatusV3();

  var errors = [];

  var allowed = {
    REVIEW_PASSED: true,
    GUARD_TESTED: true,
    READY_FOR_3M_D: true
  };

  if (!allowed[status.status]) {
    errors.push(
      '3M-C chưa có security review/guard test hợp lệ. Status=' +
      status.status
    );
  }

  var lastReview =
    status.lastReview || {};

  if (
    !lastReview ||
    lastReview.success !== true
  ) {
    errors.push(
      'Last security review chưa success=true.'
    );
  }

  var safeWrite =
    kidlearnV3_3mcSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      'Khi mark 3M-C ready, Safe Write phải DRY_RUN/enabled=false.'
    );
  }

  if (errors.length > 0) {
    var failed = {
      success: false,
      action: 'MARK_SECURITY_ROLE_GUARD_3MC_READY_V3',
      bundle: '3M-C',
      status: status.status,
      errorCount: errors.length,
      errors: errors
    };

    console.log(
      JSON.stringify(failed, null, 2)
    );

    throw new Error(
      'Không thể mark 3M-C ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  var result = {
    success: true,
    action: 'MARK_SECURITY_ROLE_GUARD_3MC_READY_V3',
    bundle: '3M-C',
    phase: KIDLEARN_V3_SECURITY_3MC_CONFIG.PHASE,
    status:
      KIDLEARN_V3_SECURITY_3MC_STATUS.READY_FOR_3M_D,
    nextBundle:
      KIDLEARN_V3_SECURITY_3MC_CONFIG.NEXT_BUNDLE,
    message:
      '3M-C ready. Có thể chuyển sang 3M-D PROD candidate checklist.',
    safeWriteStatus: safeWrite,
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_3mcSaveResult_(
    result,
    KIDLEARN_V3_SECURITY_3MC_STATUS.READY_FOR_3M_D,
    KIDLEARN_V3_SECURITY_3MC_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Get 3M-C status.
 */
function kidlearnV3_getSecurityRoleGuard3MCStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_SECURITY_ROLE_GUARD_3MC_STATUS_V3',
    bundle: '3M-C',
    phase: KIDLEARN_V3_SECURITY_3MC_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_SECURITY_3MC_KEYS.STATUS
      ) ||
      KIDLEARN_V3_SECURITY_3MC_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_SECURITY_3MC_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastReviewAt:
      properties.getProperty(
        KIDLEARN_V3_SECURITY_3MC_KEYS.LAST_REVIEW_AT
      ) ||
      '',
    lastSmokeTestAt:
      properties.getProperty(
        KIDLEARN_V3_SECURITY_3MC_KEYS.LAST_SMOKE_TEST_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_SECURITY_3MC_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3mcReadJsonProperty_(
        KIDLEARN_V3_SECURITY_3MC_KEYS.LAST_RESULT_JSON
      ),
    lastReview:
      kidlearnV3_3mcReadJsonProperty_(
        KIDLEARN_V3_SECURITY_3MC_KEYS.LAST_REVIEW_JSON
      )
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3M-C ready.
 */
function kidlearnV3_assertSecurityRoleGuard3MCReadyV3() {
  var status =
    kidlearnV3_getSecurityRoleGuard3MCStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_SECURITY_3MC_STATUS.READY_FOR_3M_D
  ) {
    errors.push(
      '3M-C chưa READY_FOR_3M_D. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_SECURITY_ROLE_GUARD_3MC_READY_V3',
    bundle: '3M-C',
    phase: KIDLEARN_V3_SECURITY_3MC_CONFIG.PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_SECURITY_3MC_CONFIG.NEXT_BUNDLE,
    errorCount: errors.length,
    errors: errors
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3M-C chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3M-C.
 */
function kidlearnV3_getQaBatchSteps3MCV3() {
  return [
    {
      label: 'Assert 3M-B ready',
      functionName: 'kidlearnV3_assertPerformanceBaseline3MBReadyV3'
    },
    {
      label: 'Preview Security Role Guard 3M-C',
      functionName: 'kidlearnV3_previewSecurityRoleGuard3MCV3'
    },
    {
      label: 'Run Security Review 3M-C',
      functionName: 'kidlearnV3_runSecurityReview3MCV3'
    },
    {
      label: 'Smoke Test Role Guard 3M-C',
      functionName: 'kidlearnV3_smokeTestRoleGuard3MCV3'
    },
    {
      label: 'Mark Security Role Guard 3M-C Ready',
      functionName: 'kidlearnV3_markSecurityRoleGuard3MCReadyV3'
    },
    {
      label: 'Assert Security Role Guard 3M-C Ready',
      functionName: 'kidlearnV3_assertSecurityRoleGuard3MCReadyV3'
    }
  ];
}


/**
 * QA batch 3M-C.
 */
function kidlearnV3_runQaBatch3MCV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3M_C_SECURITY_ROLE_GUARD',
    kidlearnV3_getQaBatchSteps3MCV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * Audit user roles.
 */
function kidlearnV3_3mcAuditUserRoles_(users) {
  var errors = [];
  var warnings = [];
  var items = [];

  for (var i = 0; i < users.length; i++) {
    var rawRole =
      users[i].role || users[i].userRole || '';

    var normalized =
      kidlearnV3_3mcNormalizeRole_(
        rawRole
      );

    var userId =
      users[i].userId || '';

    var ok =
      normalized ? true : false;

    items.push({
      userId: userId,
      rawRole: rawRole,
      normalizedRole: normalized || '',
      allowed: ok
    });

    if (!ok) {
      errors.push(
        'DATA_Users có role không được phép. userId=' +
        userId +
        ', role=' +
        rawRole +
        '. Chỉ cho phép CHILD hoặc FAMILY_ADMIN.'
      );
    }
  }

  if (users.length < 1) {
    warnings.push(
      'Không có DATA_Users để audit role.'
    );
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    items: items
  };
}


/**
 * Audit user-child access.
 *
 * Patch 3M-C:
 * - Bỏ qua dòng access rỗng cả userId và childId.
 * - Dòng placeholder không làm fail DEV.
 * - Chỉ fail nếu dòng có một trong hai ID nhưng thiếu ID còn lại.
 * - Giới hạn số error message để tránh spam 500 lỗi.
 */
function kidlearnV3_3mcAuditUserChildAccess_(
  users,
  children,
  access
) {
  var errors = [];
  var warnings = [];
  var items = [];

  var skippedEmptyRows = 0;
  var maxErrorsToShow = 20;

  var userMap =
    kidlearnV3_3mcMapByKey_(
      users,
      'userId'
    );

  var childMap =
    kidlearnV3_3mcMapByKey_(
      children,
      'childId'
    );

  for (var i = 0; i < access.length; i++) {
    var row =
      access[i] || {};

    var userId =
      String(row.userId || '').trim();

    var childId =
      String(row.childId || '').trim();

    /**
     * Quan trọng:
     * Nếu cả userId và childId đều trống thì coi là dòng rỗng / placeholder.
     * Không tính là lỗi.
     */
    if (!userId && !childId) {
      skippedEmptyRows++;

      continue;
    }

    var item = {
      rowIndexInReadRange: i + 3,
      userId: userId,
      childId: childId,
      userExists: userId && userMap[userId] ? true : false,
      childExists: childId && childMap[childId] ? true : false
    };

    items.push(item);

    if (!userId && childId) {
      if (errors.length < maxErrorsToShow) {
        errors.push(
          'DATA_UserChildAccess có dòng thiếu userId nhưng có childId=' +
          childId +
          '. Row=' +
          item.rowIndexInReadRange
        );
      }

      continue;
    }

    if (userId && !childId) {
      if (errors.length < maxErrorsToShow) {
        errors.push(
          'DATA_UserChildAccess có dòng thiếu childId nhưng có userId=' +
          userId +
          '. Row=' +
          item.rowIndexInReadRange
        );
      }

      continue;
    }

    if (userId && !userMap[userId]) {
      if (errors.length < maxErrorsToShow) {
        errors.push(
          'DATA_UserChildAccess tham chiếu userId không tồn tại: ' +
          userId +
          '. Row=' +
          item.rowIndexInReadRange
        );
      }
    }

    if (childId && !childMap[childId]) {
      if (errors.length < maxErrorsToShow) {
        errors.push(
          'DATA_UserChildAccess tham chiếu childId không tồn tại: ' +
          childId +
          '. Row=' +
          item.rowIndexInReadRange
        );
      }
    }
  }

  if (skippedEmptyRows > 0) {
    warnings.push(
      'DATA_UserChildAccess có ' +
      skippedEmptyRows +
      ' dòng rỗng/placeholder đã được bỏ qua trong DEV security review.'
    );
  }

  if (children.length > 0 && items.length < 1) {
    warnings.push(
      'Có child nhưng chưa có DATA_UserChildAccess hợp lệ. DEV vẫn test được bằng fallback, nhưng PROD cần access rõ ràng.'
    );
  }

  if (
    errors.length >= maxErrorsToShow &&
    access.length > maxErrorsToShow
  ) {
    warnings.push(
      'Access audit chỉ hiển thị tối đa ' +
      maxErrorsToShow +
      ' lỗi đầu tiên để tránh log quá dài.'
    );
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    skippedEmptyRows: skippedEmptyRows,
    validAccessRowCount: items.length,
    items: items
  };
}


/**
 * Audit role policies.
 */
function kidlearnV3_3mcAuditRolePolicies_() {
  var errors = [];
  var warnings = [];
  var roles =
    KIDLEARN_V3_SECURITY_3MC_CONFIG.ALLOWED_ROLES;

  for (var i = 0; i < roles.length; i++) {
    var role =
      roles[i];

    var policy =
      KIDLEARN_V3_SECURITY_3MC_ROLE_POLICY[role];

    if (!policy) {
      errors.push(
        'Thiếu policy cho role=' +
        role
      );

      continue;
    }

    if (
      !policy.allowedScreens ||
      Object.keys(policy.allowedScreens).length < 1
    ) {
      errors.push(
        'Policy role=' +
        role +
        ' thiếu allowedScreens.'
      );
    }

    if (
      !policy.allowedActions ||
      Object.keys(policy.allowedActions).length < 1
    ) {
      errors.push(
        'Policy role=' +
        role +
        ' thiếu allowedActions.'
      );
    }
  }

  if (
    KIDLEARN_V3_SECURITY_3MC_ROLE_POLICY.CHILD &&
    KIDLEARN_V3_SECURITY_3MC_ROLE_POLICY.CHILD.allowedScreens.SETTINGS_HOME
  ) {
    errors.push(
      'CHILD không được phép vào SETTINGS_HOME.'
    );
  }

  if (
    KIDLEARN_V3_SECURITY_3MC_ROLE_POLICY.CHILD &&
    KIDLEARN_V3_SECURITY_3MC_ROLE_POLICY.CHILD.allowedActions.VIEW_SETTINGS
  ) {
    errors.push(
      'CHILD không được phép VIEW_SETTINGS.'
    );
  }

  return {
    success: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Normalize role.
 */
function kidlearnV3_3mcNormalizeRole_(role) {
  var value =
    String(role || '')
      .trim()
      .toUpperCase();

  if (value === 'CHILD') {
    return 'CHILD';
  }

  if (
    value === 'FAMILY_ADMIN' ||
    value === 'FAMILY ADMIN' ||
    value === 'PARENT' ||
    value === 'GUARDIAN'
  ) {
    return 'FAMILY_ADMIN';
  }

  return '';
}


/**
 * Check screen access.
 */
function kidlearnV3_3mcCheckScreenAccess_(
  policy,
  screenId
) {
  var screen =
    String(screenId || '').trim();

  if (!screen) {
    return {
      success: true,
      message: ''
    };
  }

  if (
    policy &&
    policy.allowedScreens &&
    policy.allowedScreens[screen]
  ) {
    return {
      success: true,
      message: ''
    };
  }

  return {
    success: false,
    message:
      'Role ' +
      (policy ? policy.role : '') +
      ' không được phép mở screen=' +
      screen
  };
}


/**
 * Check action access.
 */
function kidlearnV3_3mcCheckActionAccess_(
  policy,
  actionCode
) {
  var action =
    String(actionCode || '').trim();

  if (!action) {
    return {
      success: true,
      message: ''
    };
  }

  if (
    policy &&
    policy.allowedActions &&
    policy.allowedActions[action]
  ) {
    return {
      success: true,
      message: ''
    };
  }

  return {
    success: false,
    message:
      'Role ' +
      (policy ? policy.role : '') +
      ' không được phép chạy action=' +
      action
  };
}


/**
 * Check child access.
 */
function kidlearnV3_3mcCheckChildAccess_(
  role,
  user,
  child,
  accessRows
) {
  var warnings = [];

  var userId =
    String(user.userId || '').trim();

  var childId =
    String(child.childId || '').trim();

  if (!childId) {
    return {
      success: true,
      mode: 'NO_CHILD_SELECTED',
      warnings: [
        'Không có childId để check access. DEV fallback.'
      ],
      message: ''
    };
  }

  if (!userId) {
    return {
      success: true,
      mode: 'NO_USER_SELECTED',
      warnings: [
        'Không có userId để check access. DEV fallback.'
      ],
      message: ''
    };
  }

  var userAccessRows = [];

  for (var i = 0; i < accessRows.length; i++) {
    if (
      String(accessRows[i].userId || '').trim() === userId
    ) {
      userAccessRows.push(
        accessRows[i]
      );
    }
  }

  if (userAccessRows.length < 1) {
    warnings.push(
      'User chưa có dòng DATA_UserChildAccess. DEV fallback allow. PROD cần access rõ ràng.'
    );

    return {
      success: true,
      mode: 'DEV_FALLBACK_NO_ACCESS_ROWS',
      warnings: warnings,
      message: ''
    };
  }

  for (var j = 0; j < userAccessRows.length; j++) {
    if (
      String(userAccessRows[j].childId || '').trim() === childId
    ) {
      return {
        success: true,
        mode: 'MATCHED_ACCESS_ROW',
        warnings: warnings,
        message: ''
      };
    }
  }

  return {
    success: false,
    mode: 'ACCESS_DENIED',
    warnings: warnings,
    message:
      'User ' +
      userId +
      ' không có quyền truy cập child ' +
      childId
  };
}


/**
 * Resolve user.
 */
function kidlearnV3_3mcResolveUser_(
  request,
  data,
  role
) {
  var userId =
    String(request.userId || '').trim();

  for (var i = 0; i < data.users.length; i++) {
    if (
      userId &&
      String(data.users[i].userId || '') === userId
    ) {
      return data.users[i];
    }
  }

  for (var j = 0; j < data.users.length; j++) {
    var rowRole =
      kidlearnV3_3mcNormalizeRole_(
        data.users[j].role || data.users[j].userRole || ''
      );

    if (role && rowRole === role) {
      return data.users[j];
    }
  }

  return data.users[0] || {
    userId: '',
    fullName: 'DEV User 3M-C',
    role:
      role ||
      KIDLEARN_V3_SECURITY_3MC_CONFIG.DEFAULT_DEV_ROLE
  };
}


/**
 * Resolve child.
 */
function kidlearnV3_3mcResolveChild_(
  request,
  data
) {
  var childId =
    String(request.childId || '').trim();

  for (var i = 0; i < data.children.length; i++) {
    if (
      childId &&
      String(data.children[i].childId || '') === childId
    ) {
      return data.children[i];
    }
  }

  return data.children[0] || {
    childId: '',
    childName: 'DEV Child 3M-C',
    gradeLevel: '2'
  };
}


/**
 * Get security data summary.
 */
function kidlearnV3_3mcGetSecurityDataSummary_() {
  var data =
    kidlearnV3_3mcReadSecurityData_();

  return {
    usersCount: data.users.length,
    childrenCount: data.children.length,
    accessCount: data.access.length,
    maxRowsPerSheet:
      KIDLEARN_V3_SECURITY_3MC_CONFIG.MAX_ROWS_PER_SHEET
  };
}


/**
 * Read security data.
 */
function kidlearnV3_3mcReadSecurityData_() {
  var spreadsheet =
    kidlearnV3_3mcGetDatabaseSpreadsheet_();

  return {
    users:
      kidlearnV3_3mcReadRowsLimited_(
        spreadsheet,
        'DATA_Users',
        KIDLEARN_V3_SECURITY_3MC_CONFIG.MAX_ROWS_PER_SHEET
      ),
    children:
      kidlearnV3_3mcReadRowsLimited_(
        spreadsheet,
        'DATA_Children',
        KIDLEARN_V3_SECURITY_3MC_CONFIG.MAX_ROWS_PER_SHEET
      ),
    access:
      kidlearnV3_3mcReadRowsLimited_(
        spreadsheet,
        'DATA_UserChildAccess',
        KIDLEARN_V3_SECURITY_3MC_CONFIG.MAX_ROWS_PER_SHEET
      )
  };
}


/**
 * Read rows limited using row 2 as keys.
 */
function kidlearnV3_3mcReadRowsLimited_(
  spreadsheet,
  sheetName,
  maxRows
) {
  var sheet =
    kidlearnV3_3mcGetSheet_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return [];
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (
    lastRow < 3 ||
    lastColumn < 1
  ) {
    return [];
  }

  var limit =
    Math.min(
      Number(maxRows || 100),
      lastRow - 2
    );

  var keys =
    sheet
      .getRange(
        2,
        1,
        1,
        lastColumn
      )
      .getDisplayValues()[0];

  var values =
    sheet
      .getRange(
        3,
        1,
        limit,
        lastColumn
      )
      .getDisplayValues();

  var rows = [];

  for (var r = 0; r < values.length; r++) {
    var row = {};
    var hasValue = false;

    for (var c = 0; c < keys.length; c++) {
      var key =
        String(keys[c] || '').trim();

      if (!key) {
        continue;
      }

      row[key] =
        values[r][c];

      if (values[r][c] !== '') {
        hasValue = true;
      }
    }

    if (hasValue) {
      rows.push(row);
    }
  }

  return rows;
}


/**
 * Database spreadsheet.
 */
function kidlearnV3_3mcGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3mcResolveSpreadsheet_(
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
 * Resolve Spreadsheet.
 */
function kidlearnV3_3mcResolveSpreadsheet_(value) {
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
 * Get exact sheet.
 */
function kidlearnV3_3mcGetSheet_(
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
 * Map by key.
 */
function kidlearnV3_3mcMapByKey_(
  rows,
  key
) {
  var map = {};

  for (var i = 0; i < rows.length; i++) {
    var value =
      String(rows[i][key] || '').trim();

    if (value) {
      map[value] =
        rows[i];
    }
  }

  return map;
}


/**
 * Safe assert helper.
 */
function kidlearnV3_3mcSafeAssert_(
  functionName,
  label
) {
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
        label: label,
        message:
          'Thiếu function ' + functionName
      };
    }

    var fn =
      eval(functionName);

    var result =
      fn();

    return {
      success:
        result && result.success === true,
      label: label,
      message:
        result && result.success === true
          ? ''
          : JSON.stringify(result)
    };

  } catch (error) {
    return {
      success: false,
      label: label,
      message:
        String(error.message || error)
    };
  }
}


/**
 * Safe Write status.
 */
function kidlearnV3_3mcSafeWriteStatus_() {
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
 * Controlled Write status.
 */
function kidlearnV3_3mcControlledWriteStatus_() {
  try {
    if (
      typeof kidlearnV3_getControlledWriteDevStatusV3 === 'function'
    ) {
      var result =
        kidlearnV3_getControlledWriteDevStatusV3();

      result.available = true;

      return result;
    }

    return {
      available: false,
      success: false,
      status: '',
      safeWriteMode: '',
      safeWriteEnabled: false,
      error:
        'Missing kidlearnV3_getControlledWriteDevStatusV3'
    };

  } catch (error) {
    return {
      available: false,
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
 * Check functions.
 */
function kidlearnV3_3mcCheckFunctions_(
  names
) {
  var errors = [];
  var items = [];

  for (var i = 0; i < names.length; i++) {
    var exists = false;

    try {
      exists =
        eval(
          'typeof ' +
          names[i] +
          ' === "function"'
        );
    } catch (error) {
      exists = false;
    }

    items.push({
      name: names[i],
      exists: exists
    });

    if (!exists) {
      errors.push(
        'Thiếu function: ' +
        names[i]
      );
    }
  }

  return {
    errors: errors,
    items: items
  };
}


/**
 * Save review compact.
 */
function kidlearnV3_3mcSaveReview_(
  review
) {
  var compact = {
    success: review.success,
    action: review.action,
    bundle: review.bundle,
    phase: review.phase,
    reviewedAt: review.reviewedAt,
    errorCount: review.errorCount,
    warningCount: review.warningCount,
    errors: review.errors,
    warnings: review.warnings,
    dataSummary: review.dataSummary,
    roleAudit: {
      success: review.roleAudit.success,
      errorCount: review.roleAudit.errorCount,
      warningCount: review.roleAudit.warningCount,
      items: review.roleAudit.items
    },
    accessAudit: {
      success: review.accessAudit.success,
      errorCount: review.accessAudit.errorCount,
      warningCount: review.accessAudit.warningCount,
      items: review.accessAudit.items
    },
    policyAudit: review.policyAudit,
    guardSmoke: review.guardSmoke
  };

  PropertiesService
    .getScriptProperties()
    .setProperty(
      KIDLEARN_V3_SECURITY_3MC_KEYS.LAST_REVIEW_JSON,
      JSON.stringify(compact)
    );
}


/**
 * Save result.
 */
function kidlearnV3_3mcSaveResult_(
  result,
  status,
  dateKey
) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_SECURITY_3MC_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus === KIDLEARN_V3_SECURITY_3MC_STATUS.READY_FOR_3M_D &&
    (
      status === KIDLEARN_V3_SECURITY_3MC_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_SECURITY_3MC_STATUS.REVIEW_PASSED ||
      status === KIDLEARN_V3_SECURITY_3MC_STATUS.GUARD_TESTED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_SECURITY_3MC_STATUS.READY_FOR_3M_D;
  }

  properties.setProperty(
    KIDLEARN_V3_SECURITY_3MC_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_SECURITY_3MC_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      bundle: result.bundle,
      phase: result.phase,
      status: finalStatus,
      originalRequestedStatus: status,
      errorCount: result.errorCount || 0,
      warningCount: result.warningCount || 0,
      errors: result.errors || [],
      warnings: result.warnings || [],
      at: new Date().toISOString()
    })
  );
}


/**
 * Read JSON property.
 */
function kidlearnV3_3mcReadJsonProperty_(
  key
) {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(key);

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
 * Normalize request.
 */
function kidlearnV3_3mcNormalizeRequest_(request) {
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