/**
 * ================================================================
 * KIDLEARN V3 - DEV MENU
 * Step: 3I.4 Fix
 * Version: 3.1.0
 * ================================================================
 *
 * Dùng menu trong Google Sheet để mở UI DEV Shell.
 *
 * Không chạy kidlearnV3_showUiDevShellV3 trực tiếp từ Apps Script editor.
 */


/**
 * Cài installable onOpen trigger để tự thêm menu DEV khi mở Google Sheet.
 *
 * Hàm này có thể chạy từ Apps Script editor.
 */
function kidlearnV3_installUiDevMenuTriggerV3() {
  var spreadsheetId =
    kidlearnV3_appResolveDatabaseId_();

  var spreadsheet =
    SpreadsheetApp.openById(
      spreadsheetId
    );

  var triggers =
    ScriptApp.getProjectTriggers();

  for (
    var i = 0;
    i < triggers.length;
    i++
  ) {
    if (
      triggers[i].getHandlerFunction() ===
      'kidlearnV3_addDevMenuV3'
    ) {
      ScriptApp.deleteTrigger(
        triggers[i]
      );
    }
  }

  ScriptApp
    .newTrigger(
      'kidlearnV3_addDevMenuV3'
    )
    .forSpreadsheet(
      spreadsheet
    )
    .onOpen()
    .create();

  var result = {
    success: true,
    action: 'INSTALL_UI_DEV_MENU_TRIGGER_V3',
    spreadsheetId: spreadsheetId,
    spreadsheetName: spreadsheet.getName(),
    triggerHandler: 'kidlearnV3_addDevMenuV3',
    message:
      'Đã cài trigger. Hãy reload Google Sheet để thấy menu KIDLEARN V3 DEV.'
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Thêm menu DEV vào Google Sheet.
 *
 * Hàm này được gọi bởi onOpen trigger.
 * Không chạy trực tiếp từ Apps Script editor.
 */


/**
 * Thêm menu DEV vào Google Sheet.
 */
function kidlearnV3_addDevMenuV3() {
  var ui =
    SpreadsheetApp.getUi();

  ui
    .createMenu(
      'KIDLEARN V3 DEV'
    )
    .addItem(
      'Open DEV Shell V3',
      'kidlearnV3_showUiDevShellV3'
    )
    .addItem(
      'Open DEV App Router V3',
      'kidlearnV3_showDevAppRouterV3'
    )
    .addSeparator()
    .addItem(
      'Open UI Real Write Gate DEV',
      'kidlearnV3_showUiRealWriteGateDevV3'
    )
    .addItem(
      'Open UI Real Write Trial 3J-B',
      'kidlearnV3_showUiRealWriteTrial3JBV3'
    )
    .addSeparator()
    .addItem(
      'Assert UI Gate DRY RUN Ready',
      'kidlearnV3_assertUiRealWriteGateDryRunReadyV3'
    )
    .addItem(
      'Preview UI Real Write Trial 3J-B',
      'kidlearnV3_previewUiRealWriteTrial3JBV3'
    )
    .addItem(
      'Get UI Real Write Trial 3J-B Status',
      'kidlearnV3_getUiRealWriteTrial3JBStatusV3'
    )
    .addSeparator()
    .addItem(
      'Reset Controlled Write to DRY RUN',
      'kidlearnV3_resetControlledWriteDevToDryRunV3'
    )
    .addItem(
      'Reset After UI Trial 3J-B',
      'kidlearnV3_resetAfterUiRealWriteTrial3JBV3'
    )
    .addItem(
      'Run Post-UI Review 3J-B',
      'kidlearnV3_runPostUiRealWriteReview3JBV3'
    )
    .addItem(
      'Mark Post-UI Review 3J-B Ready',
      'kidlearnV3_markPostUiRealWriteReview3JBReadyV3'
    )
    .addItem(
      'Assert Post-UI Review 3J-B Passed',
      'kidlearnV3_assertPostUiRealWriteReview3JBPassedV3'
    )
    .addSeparator()
    .addItem(
      'Close Phase 3J',
      'kidlearnV3_closePhase3JV3'
    )
    .addItem(
      'Get Phase 3J Close Status',
      'kidlearnV3_getPhase3JCloseStatusV3'
    )
    .addItem(
      'Assert Phase 3J Closed',
      'kidlearnV3_assertPhase3JClosedV3'
    )
    .addSeparator()
    .addItem(
      'Get Safe Write Status',
      'kidlearnV3_getSafeWriteLayerStatusV3'
    )
    .addItem(
      'Get Controlled Write Status',
      'kidlearnV3_getControlledWriteDevStatusV3'
    )
    .addItem(
      'Ping Service V3',
      'kidlearnV3_servicePingV3'
    )
    .addSeparator()
    .addItem(
      'Preview Learning UI Core 3K-A',
      'kidlearnV3_previewLearningUiCore3KAV3'
    )
    .addItem(
      'Build Learning UI State 3K-A',
      'kidlearnV3_buildLearningUiState3KAV3'
    )
    .addItem(
      'Build Learning Screen Payload 3K-A',
      'kidlearnV3_buildLearningScreenPayload3KAV3'
    )
    .addItem(
      'Smoke Test Learning UI Core 3K-A',
      'kidlearnV3_smokeTestLearningUiCore3KAV3'
    )
    .addItem(
      'Mark Learning UI Core 3K-A Ready',
      'kidlearnV3_markLearningUiCore3KAReadyV3'
    )
    .addItem(
      'Get Learning UI Core 3K-A Status',
      'kidlearnV3_getLearningUiCore3KAStatusV3'
    )
    .addItem(
      'Assert Learning UI Core 3K-A Ready',
      'kidlearnV3_assertLearningUiCore3KAReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview Learning UI 3K-B',
      'kidlearnV3_previewLearningUi3KBV3'
    )
    .addItem(
      'Open Learning DEV 3K-B',
      'kidlearnV3_showLearningDev3KBV3'
    )
    .addItem(
      'Build Learning Screen 3K-B',
      'kidlearnV3_buildLearningScreen3KBV3'
    )
    .addItem(
      'Smoke Test Learning UI 3K-B',
      'kidlearnV3_smokeTestLearningUi3KBV3'
    )
    .addItem(
      'Mark Learning UI 3K-B Ready',
      'kidlearnV3_markLearningUi3KBReadyV3'
    )
    .addItem(
      'Get Learning UI 3K-B Status',
      'kidlearnV3_getLearningUi3KBStatusV3'
    )
    .addItem(
      'Assert Learning UI 3K-B Ready',
      'kidlearnV3_assertLearningUi3KBReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview App Shell 3L-A',
      'kidlearnV3_previewAppShell3LAV3'
    )
    .addItem(
      'Open App Shell 3L-A',
      'kidlearnV3_showAppShell3LAV3'
    )
    .addItem(
      'QA Batch 3L-A',
      'kidlearnV3_runQaBatch3LAV3'
    )
    .addItem(
      'Status App Shell 3L-A',
      'kidlearnV3_getAppShell3LAStatusV3'
    )
    .addItem(
      'Assert App Shell 3L-A Ready',
      'kidlearnV3_assertAppShell3LAReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview Lesson Content 3L-B',
      'kidlearnV3_previewLessonContent3LBV3'
    )
    .addItem(
      'Open Lesson Content 3L-B',
      'kidlearnV3_showLessonContent3LBV3'
    )
    .addItem(
      'QA Batch 3L-B',
      'kidlearnV3_runQaBatch3LBV3'
    )
    .addItem(
      'Status Lesson Content 3L-B',
      'kidlearnV3_getLessonContent3LBStatusV3'
    )
    .addItem(
      'Assert Lesson Content 3L-B Ready',
      'kidlearnV3_assertLessonContent3LBReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview Learning Interaction 3L-C',
      'kidlearnV3_previewLearningInteraction3LCV3'
    )
    .addItem(
      'Open Learning Interaction 3L-C',
      'kidlearnV3_showLearningInteraction3LCV3'
    )
    .addItem(
      'QA Batch 3L-C',
      'kidlearnV3_runQaBatch3LCV3'
    )
    .addItem(
      'Status Learning Interaction 3L-C',
      'kidlearnV3_getLearningInteraction3LCStatusV3'
    )
    .addItem(
      'Assert Learning Interaction 3L-C Ready',
      'kidlearnV3_assertLearningInteraction3LCReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview Phase 3L Close 3L-D',
      'kidlearnV3_previewPhase3LClose3LDV3'
    )
    .addItem(
      'QA Batch 3L-D',
      'kidlearnV3_runQaBatch3LDV3'
    )
    .addItem(
      'Status 3L-D',
      'kidlearnV3_getPhase3LDStatusV3'
    )
    .addItem(
      'Assert 3L Ready To Close',
      'kidlearnV3_assertPhase3LReadyToClose3LDV3'
    )
    .addItem(
      'Close Phase 3L',
      'kidlearnV3_closePhase3LV3'
    )
    .addItem(
      'Assert Phase 3L Closed',
      'kidlearnV3_assertPhase3LClosedV3'
    )
    .addSeparator()
    .addItem(
      'Preview QA Async 3M-A',
      'kidlearnV3_previewQaAsync3MAV3'
    )
    .addItem(
      'Start QA Async Current Safe 3M-A',
      'kidlearnV3_startQaAsyncCurrentSafe3MAV3'
    )
    .addItem(
      'Start QA Async 3L Regression',
      'kidlearnV3_startQaAsyncPhase3LRegression3MAV3'
    )
    .addItem(
      'QA Async Status 3M-A',
      'kidlearnV3_getQaAsyncStatus3MAV3'
    )
    .addItem(
      'Run QA Async Next Chunk Now',
      'kidlearnV3_runQaAsyncNextChunkNow3MAV3'
    )
    .addItem(
      'Pause QA Async 3M-A',
      'kidlearnV3_pauseQaAsync3MAV3'
    )
    .addItem(
      'Resume QA Async 3M-A',
      'kidlearnV3_resumeQaAsync3MAV3'
    )
    .addItem(
      'Cancel QA Async 3M-A',
      'kidlearnV3_cancelQaAsync3MAV3'
    )
    .addItem(
      'Mark QA Async 3M-A Ready',
      'kidlearnV3_markQaAsync3MAReadyV3'
    )
    .addItem(
      'Assert QA Async 3M-A Ready',
      'kidlearnV3_assertQaAsync3MAReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview Performance 3M-B',
      'kidlearnV3_previewPerformanceBaseline3MBV3'
    )
    .addItem(
      'Run Performance Baseline 3M-B',
      'kidlearnV3_runPerformanceBaseline3MBV3'
    )
    .addItem(
      'Clear Performance Caches 3M-B',
      'kidlearnV3_clearPerformanceCaches3MBV3'
    )
    .addItem(
      'Status Performance 3M-B',
      'kidlearnV3_getPerformanceBaseline3MBStatusV3'
    )
    .addItem(
      'QA Batch 3M-B',
      'kidlearnV3_runQaBatch3MBV3'
    )
    .addItem(
      'Assert Performance 3M-B Ready',
      'kidlearnV3_assertPerformanceBaseline3MBReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Candidate 3M-D',
      'kidlearnV3_previewProdCandidateChecklist3MDV3'
    )
    .addItem(
      'Run PROD Candidate Checklist 3M-D',
      'kidlearnV3_runProdCandidateChecklist3MDV3'
    )
    .addItem(
      'QA Batch 3M-D',
      'kidlearnV3_runQaBatch3MDV3'
    )
    .addItem(
      'Status PROD Candidate 3M-D',
      'kidlearnV3_getProdCandidateChecklist3MDStatusV3'
    )
    .addItem(
      'Assert PROD Candidate 3M-D Ready',
      'kidlearnV3_assertProdCandidateChecklist3MDReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Candidate Review 3N-A',
      'kidlearnV3_previewProdCandidateReview3NAV3'
    )
    .addItem(
      'Generate PROD Candidate Manifest 3N-A',
      'kidlearnV3_generateProdCandidateManifest3NAV3'
    )
    .addItem(
      'QA Batch 3N-A',
      'kidlearnV3_runQaBatch3NAV3'
    )
    .addItem(
      'Status PROD Candidate Review 3N-A',
      'kidlearnV3_getProdCandidateReview3NAStatusV3'
    )
    .addItem(
      'Assert PROD Candidate Review 3N-A Ready',
      'kidlearnV3_assertProdCandidateReview3NAReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview Backup Plan 3N-B',
      'kidlearnV3_previewDevBackupDeploymentPlan3NBV3'
    )
    .addItem(
      'Generate PROD Deployment Plan 3N-B',
      'kidlearnV3_generateProdDeploymentPlan3NBV3'
    )
    .addItem(
      'Create DEV Candidate Backup 3N-B',
      'kidlearnV3_createDevCandidateBackup3NBV3'
    )
    .addItem(
      'QA Batch 3N-B Plan Only',
      'kidlearnV3_runQaBatch3NBV3'
    )
    .addItem(
      'Status Backup Plan 3N-B',
      'kidlearnV3_getDevBackupDeploymentPlan3NBStatusV3'
    )
    .addItem(
      'Mark Backup Plan 3N-B Ready',
      'kidlearnV3_markDevBackupDeploymentPlan3NBReadyV3'
    )
    .addItem(
      'Assert Backup Plan 3N-B Ready',
      'kidlearnV3_assertDevBackupDeploymentPlan3NBReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Dry-run 3N-C',
      'kidlearnV3_previewProdDryRunRehearsal3NCV3'
    )
    .addItem(
      'Run PROD Dry-run Rehearsal 3N-C',
      'kidlearnV3_runProdDryRunRehearsal3NCV3'
    )
    .addItem(
      'QA Batch 3N-C',
      'kidlearnV3_runQaBatch3NCV3'
    )
    .addItem(
      'Status PROD Dry-run 3N-C',
      'kidlearnV3_getProdDryRunRehearsal3NCStatusV3'
    )
    .addItem(
      'Assert PROD Dry-run 3N-C Ready',
      'kidlearnV3_assertProdDryRunRehearsal3NCReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Approval Gate 3N-D',
      'kidlearnV3_previewProdDeploymentApprovalGate3NDV3'
    )
    .addItem(
      'Generate PROD Approval Package 3N-D',
      'kidlearnV3_generateProdDeploymentApprovalPackage3NDV3'
    )
    .addItem(
      'QA Batch 3N-D Package Only',
      'kidlearnV3_runQaBatch3NDV3'
    )
    .addItem(
      'Record PROD Approval Gate 3N-D',
      'kidlearnV3_recordProdDeploymentApprovalGate3NDManualConfirmV3'
    )
    .addItem(
      'Status PROD Approval Gate 3N-D',
      'kidlearnV3_getProdDeploymentApprovalGate3NDStatusV3'
    )
    .addItem(
      'Mark PROD Approval Gate 3N-D Ready',
      'kidlearnV3_markProdDeploymentApprovalGate3NDReadyV3'
    )
    .addItem(
      'Assert PROD Approval Gate 3N-D Ready',
      'kidlearnV3_assertProdDeploymentApprovalGate3NDReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Execution Gate 3N-E',
      'kidlearnV3_previewProdDeploymentExecutionGate3NEV3'
    )
    .addItem(
      'Generate PROD Execution Package 3N-E',
      'kidlearnV3_generateProdDeploymentExecutionPackage3NEV3'
    )
    .addItem(
      'QA Batch 3N-E Package Only',
      'kidlearnV3_runQaBatch3NEV3'
    )
    .addItem(
      'Arm PROD Execution Gate 3N-E',
      'kidlearnV3_armProdDeploymentExecutionGate3NEManualConfirmV3'
    )
    .addItem(
      'Status PROD Execution Gate 3N-E',
      'kidlearnV3_getProdDeploymentExecutionGate3NEStatusV3'
    )
    .addItem(
      'Mark PROD Execution Gate 3N-E Ready',
      'kidlearnV3_markProdDeploymentExecutionGate3NEReadyV3'
    )
    .addItem(
      'Assert PROD Execution Gate 3N-E Ready',
      'kidlearnV3_assertProdDeploymentExecutionGate3NEReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview Controlled PROD 3N-F',
      'kidlearnV3_previewControlledProdDeployment3NFV3'
    )
    .addItem(
      'Generate Controlled PROD Package 3N-F',
      'kidlearnV3_generateControlledProdDeploymentPackage3NFV3'
    )
    .addItem(
      'QA Batch 3N-F Package Only',
      'kidlearnV3_runQaBatch3NFV3'
    )
    .addItem(
      'EXECUTE Controlled PROD Deployment 3N-F',
      'kidlearnV3_executeControlledProdDeployment3NFManualConfirmV3'
    )
    .addItem(
      'Status Controlled PROD 3N-F',
      'kidlearnV3_getControlledProdDeployment3NFStatusV3'
    )
    .addItem(
      'Mark Controlled PROD 3N-F Ready',
      'kidlearnV3_markControlledProdDeployment3NFReadyV3'
    )
    .addItem(
      'Assert Controlled PROD 3N-F Ready',
      'kidlearnV3_assertControlledProdDeployment3NFReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Post-deploy 3N-G',
      'kidlearnV3_previewProdPostDeployValidation3NGV3'
    )
    .addItem(
      'Run PROD Post-deploy Validation 3N-G',
      'kidlearnV3_runProdPostDeployValidation3NGV3'
    )
    .addItem(
      'QA Batch 3N-G',
      'kidlearnV3_runQaBatch3NGV3'
    )
    .addItem(
      'Status PROD Post-deploy 3N-G',
      'kidlearnV3_getProdPostDeployValidation3NGStatusV3'
    )
    .addItem(
      'Assert PROD Post-deploy 3N-G Ready',
      'kidlearnV3_assertProdPostDeployValidation3NGReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Runtime Smoke 3N-H',
      'kidlearnV3_previewProdRuntimeSmokeTest3NHV3'
    )
    .addItem(
      'Run PROD Runtime Smoke 3N-H',
      'kidlearnV3_runProdRuntimeSmokeTest3NHV3'
    )
    .addItem(
      'QA Batch 3N-H',
      'kidlearnV3_runQaBatch3NHV3'
    )
    .addItem(
      'Status PROD Runtime Smoke 3N-H',
      'kidlearnV3_getProdRuntimeSmokeTest3NHStatusV3'
    )
    .addItem(
      'Assert PROD Runtime Smoke 3N-H Ready',
      'kidlearnV3_assertProdRuntimeSmokeTest3NHReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Handover 3N-I',
      'kidlearnV3_previewProdReleaseHandover3NIV3'
    )
    .addItem(
      'Generate PROD Handover Package 3N-I',
      'kidlearnV3_generateProdReleaseHandoverPackage3NIV3'
    )
    .addItem(
      'QA Batch 3N-I',
      'kidlearnV3_runQaBatch3NIV3'
    )
    .addItem(
      'Status PROD Handover 3N-I',
      'kidlearnV3_getProdReleaseHandover3NIStatusV3'
    )
    .addItem(
      'Assert PROD Handover 3N-I Ready',
      'kidlearnV3_assertProdReleaseHandover3NIReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Final Lock 3N-J',
      'kidlearnV3_previewProdReleaseFinalLock3NJV3'
    )
    .addItem(
      'Generate PROD Final Lock Package 3N-J',
      'kidlearnV3_generateProdReleaseFinalLockPackage3NJV3'
    )
    .addItem(
      'QA Batch 3N-J Package Only',
      'kidlearnV3_runQaBatch3NJV3'
    )
    .addItem(
      'Record PROD Final Lock 3N-J',
      'kidlearnV3_recordProdReleaseFinalLock3NJManualConfirmV3'
    )
    .addItem(
      'Status PROD Final Lock 3N-J',
      'kidlearnV3_getProdReleaseFinalLock3NJStatusV3'
    )
    .addItem(
      'Mark PROD Final Lock 3N-J Ready',
      'kidlearnV3_markProdReleaseFinalLock3NJReadyV3'
    )
    .addItem(
      'Assert PROD Final Lock 3N-J Ready',
      'kidlearnV3_assertProdReleaseFinalLock3NJReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Monitoring 3O-A',
      'kidlearnV3_previewProdReadonlyMonitoringOnboarding3OAV3'
    )
    .addItem(
      'Run PROD Read-only Monitoring 3O-A',
      'kidlearnV3_runProdReadonlyMonitoring3OAV3'
    )
    .addItem(
      'Generate Family Onboarding 3O-A',
      'kidlearnV3_generateFamilyOnboardingPackage3OAV3'
    )
    .addItem(
      'QA Batch 3O-A',
      'kidlearnV3_runQaBatch3OAV3'
    )
    .addItem(
      'Status PROD Monitoring 3O-A',
      'kidlearnV3_getProdReadonlyMonitoringOnboarding3OAStatusV3'
    )
    .addItem(
      'Assert PROD Monitoring 3O-A Ready',
      'kidlearnV3_assertProdReadonlyMonitoringOnboarding3OAReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Support Gate 3O-B',
      'kidlearnV3_previewProdReadonlySupportChangeGate3OBV3'
    )
    .addItem(
      'Run PROD Support Review 3O-B',
      'kidlearnV3_runProdReadonlySupportReview3OBV3'
    )
    .addItem(
      'Generate PROD Support Package 3O-B',
      'kidlearnV3_generateProdReadonlySupportPackage3OBV3'
    )
    .addItem(
      'Initialize Change Gate 3O-B',
      'kidlearnV3_initializeProdChangeRequestGate3OBV3'
    )
    .addItem(
      'QA Batch 3O-B',
      'kidlearnV3_runQaBatch3OBV3'
    )
    .addItem(
      'Status PROD Support Gate 3O-B',
      'kidlearnV3_getProdReadonlySupportChangeGate3OBStatusV3'
    )
    .addItem(
      'Assert PROD Support Gate 3O-B Ready',
      'kidlearnV3_assertProdReadonlySupportChangeGate3OBReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD CR Workflow 3O-C',
      'kidlearnV3_previewProdChangeRequestWorkflow3OCV3'
    )
    .addItem(
      'Generate PROD CR Workflow 3O-C',
      'kidlearnV3_generateProdChangeRequestWorkflow3OCV3'
    )
    .addItem(
      'Run PROD CR Workflow Simulation 3O-C',
      'kidlearnV3_runProdChangeRequestWorkflowSimulation3OCV3'
    )
    .addItem(
      'QA Batch 3O-C',
      'kidlearnV3_runQaBatch3OCV3'
    )
    .addItem(
      'Status PROD CR Workflow 3O-C',
      'kidlearnV3_getProdChangeRequestWorkflow3OCStatusV3'
    )
    .addItem(
      'Assert PROD CR Workflow 3O-C Ready',
      'kidlearnV3_assertProdChangeRequestWorkflow3OCReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD CR Approval Gate 3O-D',
      'kidlearnV3_previewProdChangeRequestApprovalGate3ODV3'
    )
    .addItem(
      'Generate PROD CR Approval Package 3O-D',
      'kidlearnV3_generateProdChangeRequestApprovalGatePackage3ODV3'
    )
    .addItem(
      'QA Batch 3O-D Package Only',
      'kidlearnV3_runQaBatch3ODV3'
    )
    .addItem(
      'Record PROD CR Approval Gate 3O-D',
      'kidlearnV3_recordProdChangeRequestApprovalGate3ODManualConfirmV3'
    )
    .addItem(
      'Status PROD CR Approval Gate 3O-D',
      'kidlearnV3_getProdChangeRequestApprovalGate3ODStatusV3'
    )
    .addItem(
      'Assert PROD CR Approval Gate 3O-D Ready',
      'kidlearnV3_assertProdChangeRequestApprovalGate3ODReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD CR Planning 3O-E',
      'kidlearnV3_previewProdChangeRequestImplementationPlanning3OEV3'
    )
    .addItem(
      'Generate PROD CR Plan 3O-E',
      'kidlearnV3_generateProdChangeRequestImplementationPlan3OEV3'
    )
    .addItem(
      'Run PROD CR Planning Simulation 3O-E',
      'kidlearnV3_runProdChangeRequestImplementationPlanningSimulation3OEV3'
    )
    .addItem(
      'QA Batch 3O-E',
      'kidlearnV3_runQaBatch3OEV3'
    )
    .addItem(
      'Status PROD CR Planning 3O-E',
      'kidlearnV3_getProdChangeRequestImplementationPlanning3OEStatusV3'
    )
    .addItem(
      'Assert PROD CR Planning 3O-E Ready',
      'kidlearnV3_assertProdChangeRequestImplementationPlanning3OEReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD CR Execution Gate 3O-F',
      'kidlearnV3_previewProdChangeRequestControlledExecutionGate3OFV3'
    )
    .addItem(
      'Generate PROD CR Execution Gate Package 3O-F',
      'kidlearnV3_generateProdChangeRequestControlledExecutionGatePackage3OFV3'
    )
    .addItem(
      'QA Batch 3O-F Package Only',
      'kidlearnV3_runQaBatch3OFV3'
    )
    .addItem(
      'Record PROD CR Execution Gate 3O-F',
      'kidlearnV3_recordProdChangeRequestControlledExecutionGate3OFManualConfirmV3'
    )
    .addItem(
      'Status PROD CR Execution Gate 3O-F',
      'kidlearnV3_getProdChangeRequestControlledExecutionGate3OFStatusV3'
    )
    .addItem(
      'Assert PROD CR Execution Gate 3O-F Ready',
      'kidlearnV3_assertProdChangeRequestControlledExecutionGate3OFReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD CR Dry-run 3O-G',
      'kidlearnV3_previewProdChangeRequestExecutionDryRun3OGV3'
    )
    .addItem(
      'Generate PROD CR Dry-run Package 3O-G',
      'kidlearnV3_generateProdChangeRequestExecutionDryRunPackage3OGV3'
    )
    .addItem(
      'Run PROD CR Dry-run Rehearsal 3O-G',
      'kidlearnV3_runProdChangeRequestExecutionDryRunRehearsal3OGV3'
    )
    .addItem(
      'QA Batch 3O-G',
      'kidlearnV3_runQaBatch3OGV3'
    )
    .addItem(
      'Status PROD CR Dry-run 3O-G',
      'kidlearnV3_getProdChangeRequestExecutionDryRun3OGStatusV3'
    )
    .addItem(
      'Assert PROD CR Dry-run 3O-G Ready',
      'kidlearnV3_assertProdChangeRequestExecutionDryRun3OGReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD CR Decision Gate 3O-H',
      'kidlearnV3_previewProdChangeRequestExecutionDecisionGate3OHV3'
    )
    .addItem(
      'Generate PROD CR Decision Package 3O-H',
      'kidlearnV3_generateProdChangeRequestExecutionDecisionGatePackage3OHV3'
    )
    .addItem(
      'QA Batch 3O-H Package Only',
      'kidlearnV3_runQaBatch3OHV3'
    )
    .addItem(
      'Record PROD CR Decision Gate 3O-H',
      'kidlearnV3_recordProdChangeRequestExecutionDecisionGate3OHManualConfirmV3'
    )
    .addItem(
      'Status PROD CR Decision Gate 3O-H',
      'kidlearnV3_getProdChangeRequestExecutionDecisionGate3OHStatusV3'
    )
    .addItem(
      'Assert PROD CR Decision Gate 3O-H Ready',
      'kidlearnV3_assertProdChangeRequestExecutionDecisionGate3OHReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Selected CR Package 3O-I',
      'kidlearnV3_previewProdSelectedChangeRequestExecutionPackage3OIV3'
    )
    .addItem(
      'Generate PROD Selected CR Package 3O-I',
      'kidlearnV3_generateProdSelectedChangeRequestExecutionPackage3OIV3'
    )
    .addItem(
      'Validate PROD Selected CR Package 3O-I',
      'kidlearnV3_validateProdSelectedChangeRequestExecutionPackage3OIV3'
    )
    .addItem(
      'QA Batch 3O-I',
      'kidlearnV3_runQaBatch3OIV3'
    )
    .addItem(
      'Status PROD Selected CR Package 3O-I',
      'kidlearnV3_getProdSelectedChangeRequestExecutionPackage3OIStatusV3'
    )
    .addItem(
      'Assert PROD Selected CR Package 3O-I Ready',
      'kidlearnV3_assertProdSelectedChangeRequestExecutionPackage3OIReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Selected CR Final Approval 3O-J',
      'kidlearnV3_previewProdSelectedCRFinalExecutionApprovalGate3OJV3'
    )
    .addItem(
      'Generate PROD Selected CR Final Approval Package 3O-J',
      'kidlearnV3_generateProdSelectedCRFinalExecutionApprovalPackage3OJV3'
    )
    .addItem(
      'QA Batch 3O-J Package Only',
      'kidlearnV3_runQaBatch3OJV3'
    )
    .addItem(
      'Record PROD Selected CR Final Approval 3O-J',
      'kidlearnV3_recordProdSelectedCRFinalExecutionApproval3OJManualConfirmV3'
    )
    .addItem(
      'Status PROD Selected CR Final Approval 3O-J',
      'kidlearnV3_getProdSelectedCRFinalExecutionApproval3OJStatusV3'
    )
    .addItem(
      'Assert PROD Selected CR Final Approval 3O-J Ready',
      'kidlearnV3_assertProdSelectedCRFinalExecutionApproval3OJReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Selected CR Trial 3O-K',
      'kidlearnV3_previewProdSelectedCRControlledExecutionTrial3OKV3'
    )
    .addItem(
      'Generate PROD Selected CR Trial Package 3O-K',
      'kidlearnV3_generateProdSelectedCRControlledExecutionTrialPackage3OKV3'
    )
    .addItem(
      'QA Batch 3O-K Package Only',
      'kidlearnV3_runQaBatch3OKV3'
    )
    .addItem(
      'EXECUTE PROD Audit Trial 3O-K',
      'kidlearnV3_executeProdSelectedCRControlledAuditTrial3OKManualConfirmV3'
    )
    .addItem(
      'Validate PROD Audit Trial 3O-K',
      'kidlearnV3_validateProdSelectedCRControlledExecutionTrial3OKV3'
    )
    .addItem(
      'Status PROD Selected CR Trial 3O-K',
      'kidlearnV3_getProdSelectedCRControlledExecutionTrial3OKStatusV3'
    )
    .addItem(
      'Assert PROD Selected CR Trial 3O-K Ready',
      'kidlearnV3_assertProdSelectedCRControlledExecutionTrial3OKReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Selected CR Post-trial 3O-L',
      'kidlearnV3_previewProdSelectedCRPostTrialValidation3OLV3'
    )
    .addItem(
      'Run PROD Selected CR Post-trial Review 3O-L',
      'kidlearnV3_runProdSelectedCRPostTrialValidationReview3OLV3'
    )
    .addItem(
      'Generate PROD Selected CR Release Decision 3O-L',
      'kidlearnV3_generateProdSelectedCRReleaseDecision3OLV3'
    )
    .addItem(
      'QA Batch 3O-L',
      'kidlearnV3_runQaBatch3OLV3'
    )
    .addItem(
      'Status PROD Selected CR Post-trial 3O-L',
      'kidlearnV3_getProdSelectedCRPostTrialValidation3OLStatusV3'
    )
    .addItem(
      'Assert PROD Selected CR Post-trial 3O-L Ready',
      'kidlearnV3_assertProdSelectedCRPostTrialValidation3OLReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD CR Close Lock 3O-M',
      'kidlearnV3_previewProdChangeRequestCloseOperationalLock3OMV3'
    )
    .addItem(
      'Run PROD CR Close Review 3O-M',
      'kidlearnV3_runProdChangeRequestCloseReview3OMV3'
    )
    .addItem(
      'Generate PROD CR Operational Lock Package 3O-M',
      'kidlearnV3_generateProdChangeRequestOperationalLockPackage3OMV3'
    )
    .addItem(
      'QA Batch 3O-M Package Only',
      'kidlearnV3_runQaBatch3OMV3'
    )
    .addItem(
      'Record PROD CR Operational Lock 3O-M',
      'kidlearnV3_recordProdChangeRequestOperationalLock3OMManualConfirmV3'
    )
    .addItem(
      'Close PROD CR Chain 3O-M',
      'kidlearnV3_closeProdChangeRequestChain3OMV3'
    )
    .addItem(
      'Status PROD CR Close Lock 3O-M',
      'kidlearnV3_getProdChangeRequestCloseOperationalLock3OMStatusV3'
    )
    .addItem(
      'Assert PROD CR Close Lock 3O-M Closed',
      'kidlearnV3_assertProdChangeRequestCloseOperationalLock3OMClosedV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Readonly Monitoring 3P-A',
      'kidlearnV3_previewProdReadonlyOperationalMonitoring3PAV3'
    )
    .addItem(
      'Capture PROD Monitoring Baseline 3P-A',
      'kidlearnV3_captureProdReadonlyMonitoringBaseline3PAV3'
    )
    .addItem(
      'Run PROD Monitoring Smoke 3P-A',
      'kidlearnV3_runProdReadonlyMonitoringSmoke3PAV3'
    )
    .addItem(
      'QA Batch 3P-A',
      'kidlearnV3_runQaBatch3PAV3'
    )
    .addItem(
      'Status PROD Monitoring 3P-A',
      'kidlearnV3_getProdReadonlyOperationalMonitoring3PAStatusV3'
    )
    .addItem(
      'Assert PROD Monitoring 3P-A Ready',
      'kidlearnV3_assertProdReadonlyOperationalMonitoring3PAReadyV3'
    ).addSeparator()
    .addItem(
      'Preview PROD Daily Health 3P-B',
      'kidlearnV3_previewProdMonitoringDailyHealthCheck3PBV3'
    )
    .addItem(
      'Run PROD Daily Health Check 3P-B',
      'kidlearnV3_runProdMonitoringDailyHealthCheck3PBV3'
    )
    .addItem(
      'Generate PROD Daily Health Report 3P-B',
      'kidlearnV3_generateProdMonitoringDailyHealthReport3PBV3'
    )
    .addItem(
      'QA Batch 3P-B',
      'kidlearnV3_runQaBatch3PBV3'
    )
    .addItem(
      'Status PROD Daily Health 3P-B',
      'kidlearnV3_getProdMonitoringDailyHealthCheck3PBStatusV3'
    )
    .addItem(
      'Assert PROD Daily Health 3P-B Ready',
      'kidlearnV3_assertProdMonitoringDailyHealthCheck3PBReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Alert Incident 3P-C',
      'kidlearnV3_previewProdMonitoringAlertIncidentIntakeGate3PCV3'
    )
    .addItem(
      'Generate PROD Alert Incident Package 3P-C',
      'kidlearnV3_generateProdMonitoringAlertIncidentIntakePackage3PCV3'
    )
    .addItem(
      'QA Batch 3P-C Package Only',
      'kidlearnV3_runQaBatch3PCV3'
    )
    .addItem(
      'Record PROD Alert Incident Intake 3P-C',
      'kidlearnV3_recordProdMonitoringAlertIncidentIntakeGate3PCManualConfirmV3'
    )
    .addItem(
      'Status PROD Alert Incident 3P-C',
      'kidlearnV3_getProdMonitoringAlertIncidentIntakeGate3PCStatusV3'
    )
    .addItem(
      'Assert PROD Alert Incident 3P-C Ready',
      'kidlearnV3_assertProdMonitoringAlertIncidentIntakeGate3PCReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Incident Triage 3P-D',
      'kidlearnV3_previewProdMonitoringIncidentTriageResponsePlan3PDV3'
    )
    .addItem(
      'Generate PROD Incident Triage Plan 3P-D',
      'kidlearnV3_generateProdMonitoringIncidentTriageResponsePlan3PDV3'
    )
    .addItem(
      'QA Batch 3P-D Package Only',
      'kidlearnV3_runQaBatch3PDV3'
    )
    .addItem(
      'Record PROD Incident Triage Plan 3P-D',
      'kidlearnV3_recordProdMonitoringIncidentTriageResponsePlan3PDManualConfirmV3'
    )
    .addItem(
      'Status PROD Incident Triage 3P-D',
      'kidlearnV3_getProdMonitoringIncidentTriageResponsePlan3PDStatusV3'
    )
    .addItem(
      'Assert PROD Incident Triage 3P-D Ready',
      'kidlearnV3_assertProdMonitoringIncidentTriageResponsePlan3PDReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Response 3P-EF',
      'kidlearnV3_previewProdMonitoringResponseApprovalDryRun3PEFV3'
    )
    .addItem(
      'Generate PROD Response Package 3P-EF',
      'kidlearnV3_generateProdMonitoringResponseApprovalPackage3PEFV3'
    )
    .addItem(
      'QA Batch 3P-EF Package Only',
      'kidlearnV3_runQaBatch3PEFV3'
    )
    .addItem(
      'Record PROD Response Approval 3P-EF',
      'kidlearnV3_recordProdMonitoringResponseApproval3PEFManualConfirmV3'
    )
    .addItem(
      'Run PROD Response Dry-run 3P-EF',
      'kidlearnV3_runProdMonitoringResponseDryRunRehearsal3PEFV3'
    )
    .addItem(
      'Status PROD Response 3P-EF',
      'kidlearnV3_getProdMonitoringResponseApprovalDryRun3PEFStatusV3'
    )
    .addItem(
      'Assert PROD Response 3P-EF Ready',
      'kidlearnV3_assertProdMonitoringResponseApprovalDryRun3PEFReadyV3'
    )
    .addSeparator()
    .addItem(
      'Preview PROD Decision Close 3P-GH',
      'kidlearnV3_previewProdMonitoringResponseDecisionClose3PGHV3'
    )
    .addItem(
      'Generate PROD Decision Package 3P-GH',
      'kidlearnV3_generateProdMonitoringResponseDecisionPackage3PGHV3'
    )
    .addItem(
      'QA Batch 3P-GH Package Only',
      'kidlearnV3_runQaBatch3PGHV3'
    )
    .addItem(
      'Record PROD Response Decision 3P-GH',
      'kidlearnV3_recordProdMonitoringResponseDecision3PGHManualConfirmV3'
    )
    .addItem(
      'Close PROD Incident Cycle 3P-GH',
      'kidlearnV3_closeProdMonitoringIncidentCycle3PGHV3'
    )
    .addItem(
      'Status PROD Decision Close 3P-GH',
      'kidlearnV3_getProdMonitoringResponseDecisionClose3PGHStatusV3'
    )
    .addItem(
      'Assert PROD Decision Close 3P-GH Closed',
      'kidlearnV3_assertProdMonitoringResponseDecisionClose3PGHClosedV3'
    )
    .addSeparator()
    .addItem(
      'Open Product Web App Preview 4A',
      'kidlearnV3_openProductWebAppPreview4AV3'
    )
    .addItem(
      'Preview Product MVP Foundation 4A',
      'kidlearnV3_previewProductMvpFoundation4AV3'
    )
    .addItem(
      'QA Batch 4A-1D Package Only',
      'kidlearnV3_runQaBatch4A1DV3'
    )
    .addItem(
      'Record Product MVP Foundation 4A Lock',
      'kidlearnV3_recordProductMvpFoundation4ALockConfirmV3'
    )
    .addItem(
      'Close Product MVP Foundation 4A',
      'kidlearnV3_closeProductMvpFoundation4AV3'
    )
    .addItem(
      'Status Product MVP Foundation 4A',
      'kidlearnV3_getProductMvpFoundation4AStatusV3'
    )
    .addItem(
      'Assert Product MVP Foundation 4A Closed',
      'kidlearnV3_assertProductMvpFoundation4AClosedV3'
    )
    .addToUi();
}


/**
 * Xem danh sách trigger UI DEV menu.
 */
function kidlearnV3_previewUiDevMenuTriggersV3() {
  var triggers =
    ScriptApp.getProjectTriggers();

  var items = [];

  for (
    var i = 0;
    i < triggers.length;
    i++
  ) {
    if (
      triggers[i].getHandlerFunction() ===
      'kidlearnV3_addDevMenuV3'
    ) {
      items.push({
        handlerFunction:
          triggers[i].getHandlerFunction(),
        eventType:
          String(triggers[i].getEventType()),
        triggerSource:
          String(triggers[i].getTriggerSource())
      });
    }
  }

  var result = {
    success: true,
    triggerCount: items.length,
    triggers: items
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}


/**
 * Gỡ trigger menu DEV nếu cần.
 */
function kidlearnV3_uninstallUiDevMenuTriggerV3() {
  var triggers =
    ScriptApp.getProjectTriggers();

  var deletedCount = 0;

  for (
    var i = 0;
    i < triggers.length;
    i++
  ) {
    if (
      triggers[i].getHandlerFunction() ===
      'kidlearnV3_addDevMenuV3'
    ) {
      ScriptApp.deleteTrigger(
        triggers[i]
      );

      deletedCount++;
    }
  }

  var result = {
    success: true,
    deletedCount: deletedCount
  };

  console.log(
    JSON.stringify(result, null, 2)
  );

  return result;
}