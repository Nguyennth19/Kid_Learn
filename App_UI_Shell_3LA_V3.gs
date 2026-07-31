/**
 * ================================================================
 * KIDLEARN V3 - APP UI SHELL
 * Bundle: 3L-A
 * Step:
 * - 3L-A: Optimized UI Shell for CHILD / FAMILY_ADMIN
 * Version: 3.1.0
 * ================================================================
 *
 * 3L-A:
 * - READ ONLY
 * - Không ghi DB
 * - Không real write
 * - Không rollback
 * - Không migration
 * - Không close phase
 */


var KIDLEARN_V3_UI_SHELL_3LA_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_3LA_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_3LA_LAST_PREVIEW_AT',
  LAST_BUILD_AT: 'KIDLEARN_V3_PHASE_3LA_LAST_BUILD_AT',
  LAST_SMOKE_TEST_AT: 'KIDLEARN_V3_PHASE_3LA_LAST_SMOKE_TEST_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_3LA_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_3LA_LAST_RESULT_JSON'
};


var KIDLEARN_V3_UI_SHELL_3LA_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  SHELL_BUILT: 'SHELL_BUILT',
  SMOKE_TESTED: 'SMOKE_TESTED',
  READY_FOR_3L_B: 'READY_FOR_3L_B',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_UI_SHELL_3LA_CONFIG = {
  VERSION: '3L-A',
  PHASE: '3L-A',
  NEXT_BUNDLE: '3L-B',
  SCREEN_ID: 'APP_SHELL_3LA',
  READ_ONLY: true,
  WRITE_ENABLED: false,
  ALLOWED_ROLES: ['CHILD', 'FAMILY_ADMIN']
};


var KIDLEARN_V3_UI_SHELL_3LA_NAV = {
  CHILD: [
    {
      navId: 'child_home',
      label: 'Trang học',
      icon: '🏠',
      screenId: 'CHILD_HOME',
      enabled: true
    },
    {
      navId: 'learning',
      label: 'Bài học',
      icon: '📘',
      screenId: 'LEARNING_HOME_V3',
      enabled: true
    },
    {
      navId: 'library',
      label: 'Thư viện',
      icon: '📚',
      screenId: 'LIBRARY_HOME',
      enabled: true
    },
    {
      navId: 'achievements',
      label: 'Thành tích',
      icon: '⭐',
      screenId: 'ACHIEVEMENTS_HOME',
      enabled: true
    }
  ],

  FAMILY_ADMIN: [
    {
      navId: 'family_home',
      label: 'Tổng quan',
      icon: '🏠',
      screenId: 'FAMILY_HOME',
      enabled: true
    },
    {
      navId: 'children',
      label: 'Hồ sơ con',
      icon: '👧',
      screenId: 'CHILDREN_HOME',
      enabled: true
    },
    {
      navId: 'learning',
      label: 'Bài học',
      icon: '📘',
      screenId: 'LEARNING_HOME_V3',
      enabled: true
    },
    {
      navId: 'assignments',
      label: 'Nhiệm vụ',
      icon: '📝',
      screenId: 'ASSIGNMENTS_HOME',
      enabled: true
    },
    {
      navId: 'progress',
      label: 'Tiến độ',
      icon: '📊',
      screenId: 'PROGRESS_HOME',
      enabled: true
    },
    {
      navId: 'settings',
      label: 'Thiết lập',
      icon: '⚙️',
      screenId: 'SETTINGS_HOME',
      enabled: true
    }
  ]
};


/**
 * Preview 3L-A.
 */
function kidlearnV3_previewAppShell3LAV3() {
  var errors = [];
  var warnings = [];

  var functionChecks =
    kidlearnV3_3laCheckFunctions_([
      'kidlearnV3_assertPhase3KClosedV3',
      'kidlearnV3_appGetActiveDatabaseV3_',
      'kidlearnV3_getSafeWriteLayerStatusV3',
      'kidlearnV3_buildLearningScreen3KBV3',
      'kidlearnV3_uiInclude_',
      'kidlearnV3_runQaBatchProvidedStepsV3'
    ]);

  errors =
    errors.concat(
      functionChecks.errors
    );

  var htmlChecks =
    kidlearnV3_3laCheckHtmlFiles_([
      'UI_App_Shell_3LA_Client_V3',
      'UI_App_Shell_3LA'
    ]);

  errors =
    errors.concat(
      htmlChecks.errors
    );

  var phase3K =
    kidlearnV3_3laSafeAssertPhase3KClosed_();

  if (!phase3K.success) {
    errors.push(
      'Phase 3K chưa CLOSED_LOCKED: ' +
      phase3K.message
    );
  }

  var safeWrite =
    kidlearnV3_3laSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      '3L-A yêu cầu Safe Write DRY_RUN/enabled=false. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var dataSummary = null;

  try {
    if (errors.length === 0) {
      dataSummary =
        kidlearnV3_3laGetDataSummary_();

      if (dataSummary.childrenCount < 1) {
        errors.push(
          'DATA_Children chưa có child.'
        );
      }

      if (dataSummary.usersCount < 1) {
        warnings.push(
          'DATA_Users chưa có user. 3L-A sẽ dùng DEV role fallback.'
        );
      }
    }
  } catch (error) {
    errors.push(
      'Không đọc được data summary 3L-A: ' +
      String(error.message || error)
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'PREVIEW_APP_SHELL_3LA_V3',
    bundle: '3L-A',
    phase: KIDLEARN_V3_UI_SHELL_3LA_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_UI_SHELL_3LA_CONFIG.NEXT_BUNDLE,
    readOnly: true,
    writeEnabled: false,
    allowedRoles:
      KIDLEARN_V3_UI_SHELL_3LA_CONFIG.ALLOWED_ROLES,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    phase3K: phase3K,
    safeWriteStatus: safeWrite,
    functionChecks: functionChecks.items,
    htmlChecks: htmlChecks.items,
    dataSummary: dataSummary
  };

  kidlearnV3_3laSaveResult_(
    result,
    KIDLEARN_V3_UI_SHELL_3LA_STATUS.PREVIEWED,
    KIDLEARN_V3_UI_SHELL_3LA_KEYS.LAST_PREVIEW_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Build App Shell context.
 */
function kidlearnV3_buildAppShellContext3LAV3(request) {
  var req =
    kidlearnV3_3laNormalizeRequest_(
      request
    );

  var preview =
    kidlearnV3_previewAppShell3LAV3();

  if (!preview.success) {
    throw new Error(
      'Không thể build App Shell 3L-A vì preview chưa đạt. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var data =
    kidlearnV3_3laReadBaseData_();

  var role =
    kidlearnV3_3laResolveRole_(
      req,
      data
    );

  var activeUser =
    kidlearnV3_3laResolveUser_(
      req,
      data,
      role
    );

  var activeChild =
    kidlearnV3_3laResolveChild_(
      req,
      data,
      activeUser
    );

  var navigation =
    KIDLEARN_V3_UI_SHELL_3LA_NAV[role] || [];

  var learningSummary =
    kidlearnV3_3laBuildLearningSummary_(
      activeChild,
      req
    );

  var shell = {
    success: true,
    action: 'BUILD_APP_SHELL_CONTEXT_3LA_V3',
    bundle: '3L-A',
    phase: KIDLEARN_V3_UI_SHELL_3LA_CONFIG.PHASE,
    screenId:
      KIDLEARN_V3_UI_SHELL_3LA_CONFIG.SCREEN_ID,
    generatedAt:
      new Date().toISOString(),
    readOnly: true,
    writeEnabled: false,
    role: role,
    session: {
      role: role,
      userId:
        activeUser.userId || '',
      userName:
        activeUser.fullName ||
        activeUser.userName ||
        activeUser.displayName ||
        'DEV User',
      childId:
        activeChild.childId || '',
      childName:
        activeChild.childName ||
        activeChild.fullName ||
        'Kid Learner',
      gradeLevel:
        activeChild.gradeLevel ||
        activeChild.grade ||
        '2',
      locale: 'vi-VN'
    },
    roleConfig:
      kidlearnV3_3laBuildRoleConfig_(
        role
      ),
    navigation: navigation,
    header:
      kidlearnV3_3laBuildHeader_(
        role,
        activeUser,
        activeChild
      ),
    homeCards:
      kidlearnV3_3laBuildHomeCards_(
        role,
        learningSummary
      ),
    quickActions:
      kidlearnV3_3laBuildQuickActions_(
        role
      ),
    learningSummary: learningSummary,
    guards: {
      phase3KClosed: true,
      readOnly: true,
      writeEnabled: false,
      safeWriteExpectedMode: 'DRY_RUN',
      realWriteAllowed: false,
      prodTouched: false
    },
    diagnostics: {
      usersCount: data.users.length,
      childrenCount: data.children.length,
      accessCount: data.access.length,
      role: role,
      navCount: navigation.length,
      homeCardCount:
        kidlearnV3_3laBuildHomeCards_(
          role,
          learningSummary
        ).length
    }
  };

  kidlearnV3_3laSaveResult_(
    {
      success: true,
      action: shell.action,
      bundle: shell.bundle,
      phase: shell.phase,
      errorCount: 0,
      warningCount: 0,
      diagnostics: shell.diagnostics
    },
    KIDLEARN_V3_UI_SHELL_3LA_STATUS.SHELL_BUILT,
    KIDLEARN_V3_UI_SHELL_3LA_KEYS.LAST_BUILD_AT
  );

  console.log(
    JSON.stringify(shell, null, 2)
  );

  return shell;
}


/**
 * Open App Shell UI 3L-A.
 */
function kidlearnV3_showAppShell3LAV3() {
  var preview =
    kidlearnV3_previewAppShell3LAV3();

  if (!preview.success) {
    throw new Error(
      'App Shell 3L-A chưa sẵn sàng. Errors=' +
      preview.errorCount +
      '. ' +
      preview.errors.join(' | ')
    );
  }

  var html =
    HtmlService
      .createTemplateFromFile(
        'UI_App_Shell_3LA'
      )
      .evaluate()
      .setTitle(
        'KIDLEARN V3 - App Shell 3L-A'
      )
      .setWidth(1320)
      .setHeight(900);

  SpreadsheetApp
    .getUi()
    .showModalDialog(
      html,
      'KIDLEARN V3 - App Shell 3L-A'
    );
}


/**
 * UI get shell.
 */
function kidlearnV3_uiAppShell3LAGetContextV3(request) {
  return kidlearnV3_buildAppShellContext3LAV3(
    request || {}
  );
}


/**
 * UI get screen payload.
 */
function kidlearnV3_uiAppShell3LAGetScreenPayloadV3(request) {
  var req =
    kidlearnV3_3laNormalizeRequest_(
      request
    );

  var shell =
    kidlearnV3_buildAppShellContext3LAV3(
      req
    );

  var screenId =
    String(req.screenId || 'HOME').trim();

  var payload = {
    success: true,
    action: 'GET_APP_SHELL_SCREEN_PAYLOAD_3LA_V3',
    bundle: '3L-A',
    phase: KIDLEARN_V3_UI_SHELL_3LA_CONFIG.PHASE,
    screenId: screenId,
    readOnly: true,
    writeEnabled: false,
    role: shell.role,
    generatedAt:
      new Date().toISOString(),
    shellSession:
      shell.session,
    content:
      kidlearnV3_3laBuildScreenContent_(
        screenId,
        shell
      ),
    guards: shell.guards
  };

  console.log(
    JSON.stringify(payload, null, 2)
  );

  return payload;
}


/**
 * Smoke test App Shell 3L-A.
 */
function kidlearnV3_smokeTestAppShell3LAV3() {
  var errors = [];
  var warnings = [];

  var preview =
    kidlearnV3_previewAppShell3LAV3();

  if (!preview.success) {
    throw new Error(
      'Không thể smoke test 3L-A vì preview chưa đạt. Errors=' +
      preview.errorCount
    );
  }

  var familyShell =
    kidlearnV3_buildAppShellContext3LAV3({
      role: 'FAMILY_ADMIN'
    });

  var childShell =
    kidlearnV3_buildAppShellContext3LAV3({
      role: 'CHILD'
    });

  if (!familyShell.success) {
    errors.push(
      'Build FAMILY_ADMIN shell không success.'
    );
  }

  if (!childShell.success) {
    errors.push(
      'Build CHILD shell không success.'
    );
  }

  if (familyShell.role !== 'FAMILY_ADMIN') {
    errors.push(
      'FAMILY_ADMIN shell role sai: ' +
      familyShell.role
    );
  }

  if (childShell.role !== 'CHILD') {
    errors.push(
      'CHILD shell role sai: ' +
      childShell.role
    );
  }

  if (
    !familyShell.navigation ||
    familyShell.navigation.length < 1
  ) {
    errors.push(
      'FAMILY_ADMIN shell thiếu navigation.'
    );
  }

  if (
    !childShell.navigation ||
    childShell.navigation.length < 1
  ) {
    errors.push(
      'CHILD shell thiếu navigation.'
    );
  }

  if (familyShell.writeEnabled !== false) {
    errors.push(
      '3L-A FAMILY_ADMIN shell phải writeEnabled=false.'
    );
  }

  if (childShell.writeEnabled !== false) {
    errors.push(
      '3L-A CHILD shell phải writeEnabled=false.'
    );
  }

  var learningPayload =
    kidlearnV3_uiAppShell3LAGetScreenPayloadV3({
      role: 'CHILD',
      screenId: 'LEARNING_HOME_V3'
    });

  if (!learningPayload.success) {
    errors.push(
      'Không build được LEARNING_HOME_V3 payload.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_APP_SHELL_3LA_V3',
    bundle: '3L-A',
    phase: KIDLEARN_V3_UI_SHELL_3LA_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_UI_SHELL_3LA_CONFIG.NEXT_BUNDLE,
    readOnly: true,
    writeEnabled: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    diagnostics: {
      familyNavCount:
        familyShell.navigation
          ? familyShell.navigation.length
          : 0,
      childNavCount:
        childShell.navigation
          ? childShell.navigation.length
          : 0,
      familyCardsCount:
        familyShell.homeCards
          ? familyShell.homeCards.length
          : 0,
      childCardsCount:
        childShell.homeCards
          ? childShell.homeCards.length
          : 0
    }
  };

  kidlearnV3_3laSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_UI_SHELL_3LA_STATUS.SMOKE_TESTED
      : KIDLEARN_V3_UI_SHELL_3LA_STATUS.FAILED,
    KIDLEARN_V3_UI_SHELL_3LA_KEYS.LAST_SMOKE_TEST_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      'Smoke test 3L-A failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark 3L-A ready.
 */
function kidlearnV3_markAppShell3LAReadyV3() {
  var smoke =
    kidlearnV3_smokeTestAppShell3LAV3();

  if (!smoke.success) {
    throw new Error(
      'Không thể mark 3L-A ready vì smoke test chưa pass.'
    );
  }

  var result = {
    success: true,
    action: 'MARK_APP_SHELL_3LA_READY_V3',
    bundle: '3L-A',
    phase: KIDLEARN_V3_UI_SHELL_3LA_CONFIG.PHASE,
    status:
      KIDLEARN_V3_UI_SHELL_3LA_STATUS.READY_FOR_3L_B,
    nextBundle:
      KIDLEARN_V3_UI_SHELL_3LA_CONFIG.NEXT_BUNDLE,
    message:
      '3L-A ready. Có thể chuyển sang 3L-B để tối ưu lesson content rendering.'
  };

  kidlearnV3_3laSaveResult_(
    result,
    KIDLEARN_V3_UI_SHELL_3LA_STATUS.READY_FOR_3L_B,
    KIDLEARN_V3_UI_SHELL_3LA_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Get 3L-A status.
 */
function kidlearnV3_getAppShell3LAStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_APP_SHELL_3LA_STATUS_V3',
    bundle: '3L-A',
    phase: KIDLEARN_V3_UI_SHELL_3LA_CONFIG.PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_UI_SHELL_3LA_KEYS.STATUS
      ) ||
      KIDLEARN_V3_UI_SHELL_3LA_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_UI_SHELL_3LA_KEYS.LAST_PREVIEW_AT
      ) ||
      '',
    lastBuildAt:
      properties.getProperty(
        KIDLEARN_V3_UI_SHELL_3LA_KEYS.LAST_BUILD_AT
      ) ||
      '',
    lastSmokeTestAt:
      properties.getProperty(
        KIDLEARN_V3_UI_SHELL_3LA_KEYS.LAST_SMOKE_TEST_AT
      ) ||
      '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_UI_SHELL_3LA_KEYS.LAST_READY_AT
      ) ||
      '',
    lastResult:
      kidlearnV3_3laReadLastResult_()
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Assert 3L-A ready.
 */
function kidlearnV3_assertAppShell3LAReadyV3() {
  var status =
    kidlearnV3_getAppShell3LAStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_UI_SHELL_3LA_STATUS.READY_FOR_3L_B
  ) {
    errors.push(
      '3L-A chưa READY_FOR_3L_B. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_APP_SHELL_3LA_READY_V3',
    bundle: '3L-A',
    phase: KIDLEARN_V3_UI_SHELL_3LA_CONFIG.PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_UI_SHELL_3LA_CONFIG.NEXT_BUNDLE,
    errorCount: errors.length,
    errors: errors
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3L-A chưa ready. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * QA steps 3L-A.
 */
function kidlearnV3_getQaBatchSteps3LAV3() {
  return [
    {
      label: 'Assert Phase 3K closed',
      functionName: 'kidlearnV3_assertPhase3KClosedV3'
    },
    {
      label: 'Preview App Shell 3L-A',
      functionName: 'kidlearnV3_previewAppShell3LAV3'
    },
    {
      label: 'Build App Shell FAMILY_ADMIN',
      functionName: 'kidlearnV3_buildAppShellFamilyAdmin3LAV3'
    },
    {
      label: 'Build App Shell CHILD',
      functionName: 'kidlearnV3_buildAppShellChild3LAV3'
    },
    {
      label: 'Smoke Test App Shell 3L-A',
      functionName: 'kidlearnV3_smokeTestAppShell3LAV3'
    },
    {
      label: 'Mark App Shell 3L-A Ready',
      functionName: 'kidlearnV3_markAppShell3LAReadyV3'
    },
    {
      label: 'Assert App Shell 3L-A Ready',
      functionName: 'kidlearnV3_assertAppShell3LAReadyV3'
    }
  ];
}


/**
 * QA batch 3L-A.
 */
function kidlearnV3_runQaBatch3LAV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3L_A_LITE',
    kidlearnV3_getQaBatchSteps3LAV3(),
    {
      stopOnFailure: true
    }
  );
}


/**
 * QA helper: build FAMILY_ADMIN shell.
 */
function kidlearnV3_buildAppShellFamilyAdmin3LAV3() {
  return kidlearnV3_buildAppShellContext3LAV3({
    role: 'FAMILY_ADMIN'
  });
}


/**
 * QA helper: build CHILD shell.
 */
function kidlearnV3_buildAppShellChild3LAV3() {
  return kidlearnV3_buildAppShellContext3LAV3({
    role: 'CHILD'
  });
}


/**
 * Build role config.
 */
function kidlearnV3_3laBuildRoleConfig_(role) {
  if (role === 'CHILD') {
    return {
      role: 'CHILD',
      homeTitle: 'Con học hôm nay',
      showChildSelector: false,
      showAdminPanels: false,
      showLearningActions: true,
      theme: 'child',
      defaultScreenId: 'CHILD_HOME'
    };
  }

  return {
    role: 'FAMILY_ADMIN',
    homeTitle: 'Gia đình quản lý học tập',
    showChildSelector: true,
    showAdminPanels: true,
    showLearningActions: false,
    theme: 'family',
    defaultScreenId: 'FAMILY_HOME'
  };
}


/**
 * Build header.
 */
function kidlearnV3_3laBuildHeader_(
  role,
  user,
  child
) {
  return {
    appName: 'KIDLEARN V3',
    role: role,
    title:
      role === 'CHILD'
        ? 'Xin chào ' +
          (
            child.childName ||
            child.fullName ||
            'con'
          )
        : 'Quản lý học tập gia đình',
    subtitle:
      role === 'CHILD'
        ? 'Hôm nay mình cùng học vui nhé.'
        : 'Theo dõi bài học, nhiệm vụ và tiến độ của con.',
    userName:
      user.fullName ||
      user.userName ||
      user.displayName ||
      'DEV User',
    childName:
      child.childName ||
      child.fullName ||
      'Kid Learner',
    gradeLevel:
      child.gradeLevel ||
      child.grade ||
      '2'
  };
}


/**
 * Build home cards.
 */
function kidlearnV3_3laBuildHomeCards_(
  role,
  learningSummary
) {
  if (role === 'CHILD') {
    return [
      {
        cardId: 'continue_learning',
        title: 'Học tiếp',
        value:
          learningSummary.selectedLessonTitle ||
          'Chọn bài học',
        description: 'Mở bài học gần nhất hoặc bài đầu tiên.',
        screenId: 'LEARNING_HOME_V3',
        emphasis: true
      },
      {
        cardId: 'today_goal',
        title: 'Mục tiêu hôm nay',
        value:
          String(
            learningSummary.dailyGoalMinutes || 20
          ) + ' phút',
        description: 'Cố gắng hoàn thành mục tiêu học hôm nay.',
        screenId: 'PROGRESS_HOME',
        emphasis: false
      },
      {
        cardId: 'achievement',
        title: 'Thành tích',
        value: '⭐',
        description: 'Xem huy hiệu và phần thưởng.',
        screenId: 'ACHIEVEMENTS_HOME',
        emphasis: false
      }
    ];
  }

  return [
    {
      cardId: 'child_progress',
      title: 'Tiến độ học',
      value:
        String(
          learningSummary.progressPercent || 0
        ) + '%',
      description: 'Xem nhanh tiến độ bài học của con.',
      screenId: 'PROGRESS_HOME',
      emphasis: true
    },
    {
      cardId: 'assignments',
      title: 'Nhiệm vụ',
      value:
        String(
          learningSummary.assignmentsCount || 0
        ),
      description: 'Theo dõi nhiệm vụ đang giao.',
      screenId: 'ASSIGNMENTS_HOME',
      emphasis: false
    },
    {
      cardId: 'subjects',
      title: 'Môn học',
      value:
        String(
          learningSummary.subjectsCount || 0
        ),
      description: 'Xem các môn học đang có.',
      screenId: 'LEARNING_HOME_V3',
      emphasis: false
    }
  ];
}


/**
 * Build quick actions.
 */
function kidlearnV3_3laBuildQuickActions_(role) {
  if (role === 'CHILD') {
    return [
      {
        actionId: 'open_learning',
        label: 'Vào học',
        screenId: 'LEARNING_HOME_V3',
        enabled: true,
        writeMode: 'READ_ONLY_3LA'
      },
      {
        actionId: 'open_library',
        label: 'Mở thư viện',
        screenId: 'LIBRARY_HOME',
        enabled: true,
        writeMode: 'READ_ONLY_3LA'
      }
    ];
  }

  return [
    {
      actionId: 'view_progress',
      label: 'Xem tiến độ',
      screenId: 'PROGRESS_HOME',
      enabled: true,
      writeMode: 'READ_ONLY_3LA'
    },
    {
      actionId: 'view_assignments',
      label: 'Xem nhiệm vụ',
      screenId: 'ASSIGNMENTS_HOME',
      enabled: true,
      writeMode: 'READ_ONLY_3LA'
    }
  ];
}


/**
 * Build screen content.
 */
function kidlearnV3_3laBuildScreenContent_(
  screenId,
  shell
) {
  if (
    screenId === 'LEARNING_HOME_V3' &&
    typeof kidlearnV3_buildLearningScreen3KBV3 === 'function'
  ) {
    try {
      return {
        contentType: 'LEARNING_SCREEN_PAYLOAD',
        payload:
          kidlearnV3_buildLearningScreen3KBV3({
            childId: shell.session.childId
          })
      };
    } catch (error) {
      return {
        contentType: 'ERROR_PLACEHOLDER',
        title: 'Không mở được Learning screen',
        message:
          String(error.message || error)
      };
    }
  }

  if (
    screenId === 'FAMILY_HOME' ||
    screenId === 'CHILD_HOME' ||
    screenId === 'HOME'
  ) {
    return {
      contentType: 'HOME',
      title: shell.roleConfig.homeTitle,
      cards: shell.homeCards,
      quickActions: shell.quickActions
    };
  }

  return {
    contentType: 'PLACEHOLDER',
    title:
      kidlearnV3_3laFindNavLabel_(
        shell.navigation,
        screenId
      ),
    message:
      'Screen shell đã sẵn sàng. Nội dung chi tiết sẽ được nối ở các bundle sau.',
    screenId: screenId
  };
}


/**
 * Find nav label.
 */
function kidlearnV3_3laFindNavLabel_(
  navigation,
  screenId
) {
  for (var i = 0; i < navigation.length; i++) {
    if (navigation[i].screenId === screenId) {
      return navigation[i].label;
    }
  }

  return screenId || 'Screen';
}


/**
 * Build learning summary.
 */
function kidlearnV3_3laBuildLearningSummary_(
  activeChild,
  request
) {
  var summary = {
    subjectsCount: 0,
    lessonsCount: 0,
    assignmentsCount: 0,
    progressPercent: 0,
    selectedLessonTitle: '',
    dailyGoalMinutes: 20
  };

  try {
    if (
      typeof kidlearnV3_buildLearningScreen3KBV3 === 'function'
    ) {
      var screen =
        kidlearnV3_buildLearningScreen3KBV3({
          childId:
            activeChild.childId || '',
          role:
            request.role || ''
        });

      summary.subjectsCount =
        screen.diagnostics
          ? Number(screen.diagnostics.subjectsCount || 0)
          : 0;

      summary.lessonsCount =
        screen.diagnostics
          ? Number(screen.diagnostics.lessonsCount || 0)
          : 0;

      summary.assignmentsCount =
        screen.diagnostics
          ? Number(screen.diagnostics.assignmentsCount || 0)
          : 0;

      summary.progressPercent =
        screen.lessonPlayer &&
        screen.lessonPlayer.lesson
          ? Number(screen.lessonPlayer.lesson.progressPercent || 0)
          : 0;

      summary.selectedLessonTitle =
        screen.lessonPlayer &&
        screen.lessonPlayer.lesson
          ? String(screen.lessonPlayer.lesson.lessonTitle || '')
          : '';
    }
  } catch (error) {
    summary.warning =
      String(error.message || error);
  }

  return summary;
}


/**
 * Resolve role.
 */
function kidlearnV3_3laResolveRole_(
  request,
  data
) {
  var role =
    String(request.role || '').trim().toUpperCase();

  if (
    role === 'CHILD' ||
    role === 'FAMILY_ADMIN'
  ) {
    return role;
  }

  if (
    data.users.length > 0 &&
    data.users[0].role
  ) {
    var userRole =
      String(data.users[0].role || '').trim().toUpperCase();

    if (
      userRole === 'CHILD' ||
      userRole === 'FAMILY_ADMIN'
    ) {
      return userRole;
    }
  }

  return 'FAMILY_ADMIN';
}


/**
 * Resolve user.
 */
function kidlearnV3_3laResolveUser_(
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
      String(data.users[j].role || '').trim().toUpperCase();

    if (rowRole === role) {
      return data.users[j];
    }
  }

  return data.users[0] || {
    userId: 'DEV_USER_3LA',
    fullName: 'DEV User',
    role: role
  };
}


/**
 * Resolve child.
 */
function kidlearnV3_3laResolveChild_(
  request,
  data,
  activeUser
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

  var userId =
    String(activeUser.userId || '').trim();

  if (userId) {
    for (var a = 0; a < data.access.length; a++) {
      if (
        String(data.access[a].userId || '') === userId &&
        data.access[a].childId
      ) {
        var accessChildId =
          String(data.access[a].childId || '');

        for (var c = 0; c < data.children.length; c++) {
          if (
            String(data.children[c].childId || '') === accessChildId
          ) {
            return data.children[c];
          }
        }
      }
    }
  }

  return data.children[0] || {
    childId: 'DEV_CHILD_3LA',
    childName: 'Kid Learner',
    gradeLevel: '2'
  };
}


/**
 * Get data summary.
 */
function kidlearnV3_3laGetDataSummary_() {
  var data =
    kidlearnV3_3laReadBaseData_();

  return {
    usersCount: data.users.length,
    childrenCount: data.children.length,
    accessCount: data.access.length
  };
}


/**
 * Read base data.
 */
function kidlearnV3_3laReadBaseData_() {
  var spreadsheet =
    kidlearnV3_3laGetDatabaseSpreadsheet_();

  return {
    users:
      kidlearnV3_3laReadRows_(
        spreadsheet,
        'DATA_Users'
      ),
    children:
      kidlearnV3_3laReadRows_(
        spreadsheet,
        'DATA_Children'
      ),
    access:
      kidlearnV3_3laReadRows_(
        spreadsheet,
        'DATA_UserChildAccess'
      )
  };
}


/**
 * Read rows using row 2 as keys.
 */
function kidlearnV3_3laReadRows_(
  spreadsheet,
  sheetName
) {
  var sheet =
    kidlearnV3_3laGetSheet_(
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
        lastRow - 2,
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
function kidlearnV3_3laGetDatabaseSpreadsheet_() {
  var database =
    kidlearnV3_appGetActiveDatabaseV3_();

  var spreadsheet =
    kidlearnV3_3laResolveSpreadsheet_(
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
function kidlearnV3_3laResolveSpreadsheet_(value) {
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
function kidlearnV3_3laGetSheet_(
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
 * Check functions.
 */
function kidlearnV3_3laCheckFunctions_(
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
 * Check HTML files.
 */
function kidlearnV3_3laCheckHtmlFiles_(
  filenames
) {
  var errors = [];
  var items = [];

  for (var i = 0; i < filenames.length; i++) {
    try {
      var content =
        HtmlService
          .createHtmlOutputFromFile(
            filenames[i]
          )
          .getContent();

      items.push({
        name: filenames[i],
        exists: true,
        length: content.length
      });

    } catch (error) {
      errors.push(
        'Thiếu HTML file: ' +
        filenames[i]
      );

      items.push({
        name: filenames[i],
        exists: false,
        error:
          String(error.message || error)
      });
    }
  }

  return {
    errors: errors,
    items: items
  };
}


/**
 * Safe assert Phase 3K closed.
 */
function kidlearnV3_3laSafeAssertPhase3KClosed_() {
  try {
    var result =
      kidlearnV3_assertPhase3KClosedV3();

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
 * Safe Write status.
 */
function kidlearnV3_3laSafeWriteStatus_() {
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
 * Save result.
 */
function kidlearnV3_3laSaveResult_(
  result,
  status,
  dateKey
) {
  var properties =
    PropertiesService.getScriptProperties();

  var currentStatus =
    properties.getProperty(
      KIDLEARN_V3_UI_SHELL_3LA_KEYS.STATUS
    ) || '';

  var finalStatus =
    status;

  if (
    currentStatus ===
      KIDLEARN_V3_UI_SHELL_3LA_STATUS.READY_FOR_3L_B &&
    (
      status === KIDLEARN_V3_UI_SHELL_3LA_STATUS.PREVIEWED ||
      status === KIDLEARN_V3_UI_SHELL_3LA_STATUS.SHELL_BUILT ||
      status === KIDLEARN_V3_UI_SHELL_3LA_STATUS.SMOKE_TESTED
    )
  ) {
    finalStatus =
      KIDLEARN_V3_UI_SHELL_3LA_STATUS.READY_FOR_3L_B;
  }

  properties.setProperty(
    KIDLEARN_V3_UI_SHELL_3LA_KEYS.STATUS,
    finalStatus
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_UI_SHELL_3LA_KEYS.LAST_RESULT_JSON,
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
      diagnostics: result.diagnostics || null,
      at: new Date().toISOString()
    })
  );
}


/**
 * Read last result.
 */
function kidlearnV3_3laReadLastResult_() {
  var text =
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_UI_SHELL_3LA_KEYS.LAST_RESULT_JSON
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
 * Normalize request.
 */
function kidlearnV3_3laNormalizeRequest_(request) {
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
 * ================================================================
 * 3L-A ULTRA LITE QA / MARK READY
 * Purpose:
 * - Tránh chạy smoke test nặng.
 * - Chỉ kiểm tra các điều kiện cốt lõi.
 * - Không ghi DB.
 * ================================================================
 */


/**
 * Smoke test 3L-A ultra lite.
 */
function kidlearnV3_smokeTestAppShell3LAUltraLiteV3() {
  var errors = [];
  var warnings = [];

  var phase3K =
    kidlearnV3_3laSafeAssertPhase3KClosed_();

  if (!phase3K.success) {
    errors.push(
      'Phase 3K chưa CLOSED_LOCKED: ' +
      phase3K.message
    );
  }

  var safeWrite =
    kidlearnV3_3laSafeWriteStatus_();

  if (
    safeWrite.mode !== 'DRY_RUN' ||
    safeWrite.enabled !== false
  ) {
    errors.push(
      '3L-A yêu cầu Safe Write DRY_RUN/enabled=false. mode=' +
      safeWrite.mode +
      ', enabled=' +
      safeWrite.enabled
    );
  }

  var htmlChecks =
    kidlearnV3_3laCheckHtmlFiles_([
      'UI_App_Shell_3LA_Client_V3',
      'UI_App_Shell_3LA'
    ]);

  errors =
    errors.concat(
      htmlChecks.errors
    );

  var dataSummary = null;

  try {
    dataSummary =
      kidlearnV3_3laGetDataSummary_();

    if (dataSummary.childrenCount < 1) {
      errors.push(
        'DATA_Children chưa có child.'
      );
    }

    if (dataSummary.usersCount < 1) {
      warnings.push(
        'DATA_Users chưa có user. 3L-A dùng DEV fallback.'
      );
    }

  } catch (error) {
    errors.push(
      'Không đọc được data summary 3L-A: ' +
      String(error.message || error)
    );
  }

  var familyShell = null;
  var childShell = null;

  try {
    familyShell =
      kidlearnV3_buildAppShellContext3LAUltraLiteV3({
        role: 'FAMILY_ADMIN'
      });

    childShell =
      kidlearnV3_buildAppShellContext3LAUltraLiteV3({
        role: 'CHILD'
      });

    if (familyShell.role !== 'FAMILY_ADMIN') {
      errors.push(
        'FAMILY_ADMIN shell role sai: ' +
        familyShell.role
      );
    }

    if (childShell.role !== 'CHILD') {
      errors.push(
        'CHILD shell role sai: ' +
        childShell.role
      );
    }

    if (
      !familyShell.navigation ||
      familyShell.navigation.length < 1
    ) {
      errors.push(
        'FAMILY_ADMIN shell thiếu navigation.'
      );
    }

    if (
      !childShell.navigation ||
      childShell.navigation.length < 1
    ) {
      errors.push(
        'CHILD shell thiếu navigation.'
      );
    }

    if (
      familyShell.writeEnabled !== false ||
      childShell.writeEnabled !== false
    ) {
      errors.push(
        '3L-A shell phải writeEnabled=false.'
      );
    }

  } catch (shellError) {
    errors.push(
      'Không build được App Shell ultra lite: ' +
      String(shellError.message || shellError)
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'SMOKE_TEST_APP_SHELL_3LA_ULTRA_LITE_V3',
    bundle: '3L-A',
    phase: KIDLEARN_V3_UI_SHELL_3LA_CONFIG.PHASE,
    nextBundle: KIDLEARN_V3_UI_SHELL_3LA_CONFIG.NEXT_BUNDLE,
    readOnly: true,
    writeEnabled: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    dataSummary: dataSummary,
    diagnostics: {
      familyNavCount:
        familyShell && familyShell.navigation
          ? familyShell.navigation.length
          : 0,
      childNavCount:
        childShell && childShell.navigation
          ? childShell.navigation.length
          : 0
    }
  };

  kidlearnV3_3laSaveResult_(
    result,
    result.success
      ? KIDLEARN_V3_UI_SHELL_3LA_STATUS.SMOKE_TESTED
      : KIDLEARN_V3_UI_SHELL_3LA_STATUS.FAILED,
    KIDLEARN_V3_UI_SHELL_3LA_KEYS.LAST_SMOKE_TEST_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  if (!result.success) {
    throw new Error(
      '3L-A Ultra Lite smoke failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Build App Shell context ultra lite.
 *
 * Không gọi previewAppShell3LAV3 để tránh lặp nặng.
 */
function kidlearnV3_buildAppShellContext3LAUltraLiteV3(request) {
  var req =
    kidlearnV3_3laNormalizeRequest_(
      request
    );

  var data =
    kidlearnV3_3laReadBaseData_();

  var role =
    kidlearnV3_3laResolveRole_(
      req,
      data
    );

  var activeUser =
    kidlearnV3_3laResolveUser_(
      req,
      data,
      role
    );

  var activeChild =
    kidlearnV3_3laResolveChild_(
      req,
      data,
      activeUser
    );

  var navigation =
    KIDLEARN_V3_UI_SHELL_3LA_NAV[role] || [];

  var learningSummary = {
    subjectsCount: 0,
    lessonsCount: 0,
    assignmentsCount: 0,
    progressPercent: 0,
    selectedLessonTitle: '',
    dailyGoalMinutes: 20,
    mode: 'ULTRA_LITE'
  };

  var shell = {
    success: true,
    action: 'BUILD_APP_SHELL_CONTEXT_3LA_ULTRA_LITE_V3',
    bundle: '3L-A',
    phase: KIDLEARN_V3_UI_SHELL_3LA_CONFIG.PHASE,
    screenId:
      KIDLEARN_V3_UI_SHELL_3LA_CONFIG.SCREEN_ID,
    generatedAt:
      new Date().toISOString(),
    readOnly: true,
    writeEnabled: false,
    role: role,
    session: {
      role: role,
      userId:
        activeUser.userId || '',
      userName:
        activeUser.fullName ||
        activeUser.userName ||
        activeUser.displayName ||
        'DEV User',
      childId:
        activeChild.childId || '',
      childName:
        activeChild.childName ||
        activeChild.fullName ||
        'Kid Learner',
      gradeLevel:
        activeChild.gradeLevel ||
        activeChild.grade ||
        '2',
      locale: 'vi-VN'
    },
    roleConfig:
      kidlearnV3_3laBuildRoleConfig_(
        role
      ),
    navigation: navigation,
    header:
      kidlearnV3_3laBuildHeader_(
        role,
        activeUser,
        activeChild
      ),
    homeCards:
      kidlearnV3_3laBuildHomeCards_(
        role,
        learningSummary
      ),
    quickActions:
      kidlearnV3_3laBuildQuickActions_(
        role
      ),
    learningSummary: learningSummary,
    guards: {
      phase3KClosed: true,
      readOnly: true,
      writeEnabled: false,
      safeWriteExpectedMode: 'DRY_RUN',
      realWriteAllowed: false,
      prodTouched: false
    },
    diagnostics: {
      usersCount: data.users.length,
      childrenCount: data.children.length,
      accessCount: data.access.length,
      role: role,
      navCount: navigation.length
    }
  };

  console.log(
    JSON.stringify(shell, null, 2)
  );

  return shell;
}


/**
 * Mark 3L-A ready ultra lite.
 */
function kidlearnV3_markAppShell3LAReadyUltraLiteV3() {
  var smoke =
    kidlearnV3_smokeTestAppShell3LAUltraLiteV3();

  if (!smoke.success) {
    throw new Error(
      'Không thể mark 3L-A ready vì Ultra Lite smoke chưa pass.'
    );
  }

  var result = {
    success: true,
    action: 'MARK_APP_SHELL_3LA_READY_ULTRA_LITE_V3',
    bundle: '3L-A',
    phase: KIDLEARN_V3_UI_SHELL_3LA_CONFIG.PHASE,
    status:
      KIDLEARN_V3_UI_SHELL_3LA_STATUS.READY_FOR_3L_B,
    nextBundle:
      KIDLEARN_V3_UI_SHELL_3LA_CONFIG.NEXT_BUNDLE,
    message:
      '3L-A ready bằng Ultra Lite QA. Có thể chuyển sang 3L-B.'
  };

  kidlearnV3_3laSaveResult_(
    result,
    KIDLEARN_V3_UI_SHELL_3LA_STATUS.READY_FOR_3L_B,
    KIDLEARN_V3_UI_SHELL_3LA_KEYS.LAST_READY_AT
  );

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * QA steps 3L-A Ultra Lite.
 */
function kidlearnV3_getQaBatchSteps3LAUltraLiteV3() {
  return [
    {
      label: 'Assert Phase 3K closed',
      functionName: 'kidlearnV3_assertPhase3KClosedV3'
    },
    {
      label: 'Preview App Shell 3L-A',
      functionName: 'kidlearnV3_previewAppShell3LAV3'
    },
    {
      label: 'Smoke Test App Shell 3L-A Ultra Lite',
      functionName: 'kidlearnV3_smokeTestAppShell3LAUltraLiteV3'
    },
    {
      label: 'Mark App Shell 3L-A Ready Ultra Lite',
      functionName: 'kidlearnV3_markAppShell3LAReadyUltraLiteV3'
    },
    {
      label: 'Assert App Shell 3L-A Ready',
      functionName: 'kidlearnV3_assertAppShell3LAReadyV3'
    }
  ];
}


/**
 * QA batch 3L-A Ultra Lite.
 */
function kidlearnV3_runQaBatch3LAUltraLiteV3() {
  return kidlearnV3_runQaBatchProvidedStepsV3(
    'PHASE_3L_A_ULTRA_LITE',
    kidlearnV3_getQaBatchSteps3LAUltraLiteV3(),
    {
      stopOnFailure: true
    }
  );
}