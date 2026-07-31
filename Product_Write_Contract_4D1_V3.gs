/**
 * ================================================================
 * KIDLEARN V3 - WRITE CONTRACT + SCHEMA READINESS CHECK
 * Step: 4D-1
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Check schema readiness before controlled DEV real writes.
 * - Validate write contracts for:
 *   1. DATA_Responses
 *   2. DATA_LessonProgress
 *   3. DATA_StudySessions
 *   4. LOG_Audit
 *
 * Safety:
 * - Không ghi Google Sheet dữ liệu học.
 * - Không append/update/delete bất kỳ row nào.
 * - Không ghi PROD.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4D-1.
 */


var KIDLEARN_V3_WRITE_CONTRACT_4D1_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4D1_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4D1_LAST_PREVIEW_AT',
  LAST_CHECK_AT: 'KIDLEARN_V3_PHASE_4D1_LAST_CHECK_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4D1_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4D1_LAST_RESULT_JSON'
};


var KIDLEARN_V3_WRITE_CONTRACT_4D1_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  CHECK_PASSED: 'CHECK_PASSED',
  READY_FOR_4D_2: 'READY_FOR_4D_2',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG = {
  PHASE: '4D-1',
  PARENT_PHASE: '4D',
  PREVIOUS_PHASE: '4C',
  NEXT_BUNDLE: '4D-2',
  NEXT_STAGE: 'RESPONSE_WRITE_DRY_RUN_ROW_PREVIEW',
  CONTRACT_NAME: 'CONTROLLED_LESSON_PROGRESS_AND_RESPONSE_WRITES',
  PROD_WRITE_ALLOWED: false,
  REAL_WRITE_ALLOWED: false
};


/**
 * Preview write contract.
 * Không ghi sheet.
 */
function kidlearnV3_previewWriteContract4D1V3() {
  var result =
    kidlearnV3_4d1BuildWriteContractReadiness_();

  var statusBefore =
    kidlearnV3_4d1GetCurrentStatus_();

  var statusAfter =
    kidlearnV3_4d1ResolveStatusAfterCheck_(
      statusBefore,
      result.success
        ? KIDLEARN_V3_WRITE_CONTRACT_4D1_STATUS.PREVIEWED
        : KIDLEARN_V3_WRITE_CONTRACT_4D1_STATUS.FAILED
    );

  result.action =
    'PREVIEW_WRITE_CONTRACT_4D_1_V3';

  result.statusBefore =
    statusBefore;

  result.statusAfter =
    statusAfter;

  kidlearnV3_4d1SaveStatus_(
    result,
    statusAfter,
    KIDLEARN_V3_WRITE_CONTRACT_4D1_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4D-1 preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Check write contract.
 * Không ghi sheet.
 */
function kidlearnV3_checkWriteContract4D1V3() {
  var result =
    kidlearnV3_4d1BuildWriteContractReadiness_();

  var statusBefore =
    kidlearnV3_4d1GetCurrentStatus_();

  var statusAfter =
    kidlearnV3_4d1ResolveStatusAfterCheck_(
      statusBefore,
      result.success
        ? KIDLEARN_V3_WRITE_CONTRACT_4D1_STATUS.CHECK_PASSED
        : KIDLEARN_V3_WRITE_CONTRACT_4D1_STATUS.FAILED
    );

  result.action =
    'CHECK_WRITE_CONTRACT_4D_1_V3';

  result.statusBefore =
    statusBefore;

  result.statusAfter =
    statusAfter;

  kidlearnV3_4d1SaveStatus_(
    result,
    statusAfter,
    KIDLEARN_V3_WRITE_CONTRACT_4D1_KEYS.LAST_CHECK_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4D-1 write contract check failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready for 4D-2.
 */
function kidlearnV3_markWriteContract4D1ReadyV3() {
  var check =
    kidlearnV3_checkWriteContract4D1V3();

  if (!check.success) {
    throw new Error('Check 4D-1 chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_WRITE_CONTRACT_4D_1_READY_V3',
    phase:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_STATUS.READY_FOR_4D_2,
    contractName:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.CONTRACT_NAME,
    nextBundle:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    message:
      'Write Contract 4D-1 ready. Có thể qua 4D-2 Response Write Dry-run Row Preview.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4d1SaveStatus_(
    result,
    KIDLEARN_V3_WRITE_CONTRACT_4D1_STATUS.READY_FOR_4D_2,
    KIDLEARN_V3_WRITE_CONTRACT_4D1_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get 4D-1 status.
 */
function kidlearnV3_getWriteContract4D1StatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_WRITE_CONTRACT_4D_1_STATUS_V3',
    phase:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_WRITE_CONTRACT_4D1_KEYS.STATUS
      ) ||
      KIDLEARN_V3_WRITE_CONTRACT_4D1_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_WRITE_CONTRACT_4D1_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastCheckAt:
      properties.getProperty(
        KIDLEARN_V3_WRITE_CONTRACT_4D1_KEYS.LAST_CHECK_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_WRITE_CONTRACT_4D1_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4d1ReadJsonProperty_(
        KIDLEARN_V3_WRITE_CONTRACT_4D1_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertWriteContract4D1ReadyV3() {
  var status =
    kidlearnV3_getWriteContract4D1StatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_WRITE_CONTRACT_4D1_STATUS.READY_FOR_4D_2
  ) {
    errors.push(
      '4D-1 chưa READY_FOR_4D_2. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_WRITE_CONTRACT_4D_1_READY_V3',
    phase:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.PARENT_PHASE,
    status: status.status,
    nextBundle:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.NEXT_BUNDLE,
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
 * QA batch 4D-1.
 */
function kidlearnV3_runQaBatch4D1V3() {
  var preview =
    kidlearnV3_previewWriteContract4D1V3();

  var check =
    kidlearnV3_checkWriteContract4D1V3();

  var ready =
    kidlearnV3_markWriteContract4D1ReadyV3();

  var assertReady =
    kidlearnV3_assertWriteContract4D1ReadyV3();

  var result = {
    success:
      preview.success === true &&
      check.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4D_1_WRITE_CONTRACT_SCHEMA_READINESS_CHECK',
    phase:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.PHASE,
    nextBundle:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    results: {
      preview: preview.success,
      check: check.success,
      ready: ready.success,
      assertReady: assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4D-1 QA batch failed.');
  }

  return result;
}


/**
 * Optional debug: chỉ đọc headers.
 */
function kidlearnV3_debugWriteContractHeaders4D1V3() {
  var errors = [];
  var warnings = [];

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4d1OpenSpreadsheet_();
  } catch (error) {
    errors.push(
      'Không mở được spreadsheet: ' +
      String(error.message || error)
    );
  }

  var sheetNames = [
    'DATA_Responses',
    'DATA_LessonProgress',
    'DATA_StudySessions',
    'LOG_Audit'
  ];

  var sheets = [];

  if (spreadsheet) {
    for (var i = 0; i < sheetNames.length; i++) {
      sheets.push(
        kidlearnV3_4d1InspectSheetHeaders_(
          spreadsheet,
          sheetNames[i],
          warnings
        )
      );
    }
  }

  var result = {
    success: errors.length === 0,
    action: 'DEBUG_WRITE_CONTRACT_HEADERS_4D_1_V3',
    phase:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.PHASE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    sheets: sheets,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(errors.join(' | '));
  }

  return result;
}


/**
 * Core readiness builder.
 */
function kidlearnV3_4d1BuildWriteContractReadiness_() {
  var errors = [];
  var warnings = [];

  var phase4C =
    kidlearnV3_4d1SafeCall_(
      'kidlearnV3_assertPhase4CClosedLockedV3'
    );

  if (!phase4C.success) {
    errors.push(
      'Phase 4C chưa closed locked: ' +
      phase4C.message
    );
  }

  var devSafety =
    kidlearnV3_4d1CheckDevSafety_();

  if (!devSafety.success) {
    errors =
      errors.concat(devSafety.errors || []);
  }

  warnings =
    warnings.concat(devSafety.warnings || []);

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4d1OpenSpreadsheet_();
  } catch (error) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(error.message || error)
    );
  }

  var contracts =
    kidlearnV3_4d1GetWriteContracts_();

  var sheetResults = [];

  if (spreadsheet) {
    for (var i = 0; i < contracts.length; i++) {
      var sheetResult =
        kidlearnV3_4d1EvaluateSheetContract_(
          spreadsheet,
          contracts[i]
        );

      sheetResults.push(sheetResult);

      if (!sheetResult.success) {
        errors =
          errors.concat(sheetResult.errors || []);
      }

      warnings =
        warnings.concat(sheetResult.warnings || []);
    }
  }

  var readinessSummary =
    kidlearnV3_4d1BuildReadinessSummary_(
      sheetResults
    );

  var result = {
    success: errors.length === 0,
    action: 'BUILD_WRITE_CONTRACT_READINESS_4D_1_V3',
    phase:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.PARENT_PHASE,
    contractName:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.CONTRACT_NAME,
    nextBundle:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realWriteAllowed: false,
    actualSheetWritePerformed: false,
    targetSheets: [
      'DATA_Responses',
      'DATA_LessonProgress',
      'DATA_StudySessions',
      'LOG_Audit'
    ],
    writePlan: {
      phase4D2: 'Dry-run row preview only',
      phase4D3: 'Controlled DEV real write DATA_Responses',
      phase4D4: 'Controlled DEV real write DATA_LessonProgress',
      phase4D5: 'Controlled DEV real write DATA_StudySessions',
      auditRequired: true,
      prodWriteAllowed: false,
      realWriteAllowedNow: false
    },
    devSafety: devSafety,
    readinessSummary: readinessSummary,
    sheetResults: sheetResults,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: kidlearnV3_4d1UniqueArray_(warnings)
  };

  return result;
}


/**
 * Write contracts.
 *
 * Revised 4D-1P:
 * - DATA_Responses hiện tại có thể đang theo schema assessment/question response.
 * - Vì vậy childId, lessonId, activityId, answerMode không bắt buộc là cột riêng.
 * - Nếu thiếu cột riêng, các field này sẽ được đưa vào answerMetaJson/detailsJson ở 4D-2/4D-3.
 */
function kidlearnV3_4d1GetWriteContracts_() {
  return [
    {
      sheetName: 'DATA_Responses',
      contractType: 'APPEND_RESPONSE_FLEXIBLE_SCHEMA',
      operationPlanned: 'APPEND_OR_UPSERT_CONTROLLED_DEV',
      uniqueKey: ['responseId'],
      requiredFields: [
        {
          canonical: 'responseId',
          aliases: [
            'responseId',
            'responseid',
            'id',
            'responseKey',
            'maPhanHoi',
            'maphanhoi',
            'Mãphảnhồi',
            'maTraLoi',
            'matraloi',
            'Mãtrảlời'
          ]
        },
        {
          canonical: 'answerText',
          aliases: [
            'answerText',
            'answertext',
            'responseText',
            'responsetext',
            'selectedAnswer',
            'selectedanswer',
            'answer',
            'value',
            'textAnswer',
            'textanswer',
            'noiDungTraLoi',
            'noidungtraloi',
            'Nộidungtrảlời'
          ]
        },
        {
          canonical: 'status',
          aliases: [
            'status',
            'responseStatus',
            'responsestatus',
            'trangThai',
            'trangthai',
            'Trạngthái'
          ]
        }
      ],
      optionalFields: [
        {
          canonical: 'childId',
          aliases: [
            'childId',
            'childid',
            'child',
            'studentId',
            'studentid',
            'learnerId',
            'learnerid',
            'userId',
            'userid',
            'maChild',
            'machild',
            'maBe',
            'mabe',
            'maHocSinh',
            'mahocsinh',
            'Mãhọcsinh'
          ]
        },
        {
          canonical: 'lessonId',
          aliases: [
            'lessonId',
            'lessonid',
            'lesson',
            'maBaiHoc',
            'mabaihoc',
            'Mãbàihọc'
          ]
        },
        {
          canonical: 'activityId',
          aliases: [
            'activityId',
            'activityid',
            'activity',
            'questionId',
            'questionid',
            'itemId',
            'itemid',
            'maHoatDong',
            'mahoatdong',
            'maCauHoi',
            'macauhoi',
            'Mãcâuhỏi'
          ]
        },
        {
          canonical: 'answerMode',
          aliases: [
            'answerMode',
            'answermode',
            'inputMode',
            'inputmode',
            'responseMode',
            'responsemode',
            'activityType',
            'activitytype',
            'questionType',
            'questiontype',
            'loaiCauTraLoi',
            'loaicautraloi',
            'Loạicâutrảlời'
          ]
        },
        {
          canonical: 'answerMetaJson',
          aliases: [
            'answerMetaJson',
            'answermetajson',
            'metaJson',
            'metajson',
            'metadataJson',
            'metadatajson',
            'detailsJson',
            'detailsjson',
            'payloadJson',
            'payloadjson',
            'description',
            'ghiChu',
            'ghichu',
            'Ghi chú'
          ]
        },
        {
          canonical: 'selectedOptionId',
          aliases: [
            'selectedOptionId',
            'selectedoptionid',
            'optionId',
            'optionid',
            'choiceId',
            'choiceid'
          ]
        },
        {
          canonical: 'selectedOptionLabel',
          aliases: [
            'selectedOptionLabel',
            'selectedoptionlabel',
            'optionLabel',
            'optionlabel',
            'label',
            'choiceText',
            'choicetext'
          ]
        },
        {
          canonical: 'expectedAnswer',
          aliases: [
            'expectedAnswer',
            'expectedanswer',
            'correctAnswer',
            'correctanswer',
            'expected',
            'dapan',
            'Đápán'
          ]
        },
        {
          canonical: 'isCorrect',
          aliases: [
            'isCorrect',
            'iscorrect',
            'correct',
            'isright',
            'dung',
            'đúng'
          ]
        },
        {
          canonical: 'score',
          aliases: [
            'score',
            'point',
            'points',
            'diem',
            'điểm'
          ]
        },
        {
          canonical: 'submittedAt',
          aliases: [
            'submittedAt',
            'submittedat',
            'createdAt',
            'createdat',
            'time',
            'timestamp'
          ]
        },
        {
          canonical: 'createdAt',
          aliases: [
            'createdAt',
            'createdat',
            'timestamp',
            'time'
          ]
        },
        {
          canonical: 'updatedAt',
          aliases: [
            'updatedAt',
            'updatedat',
            'modifiedAt',
            'modifiedat'
          ]
        },
        {
          canonical: 'attemptId',
          aliases: [
            'attemptId',
            'attemptid',
            'submissionId',
            'submissionid',
            'maLuotLam',
            'maluotlam'
          ]
        }
      ]
    },
    {
      sheetName: 'DATA_LessonProgress',
      contractType: 'UPSERT_LESSON_PROGRESS',
      operationPlanned: 'UPSERT_CONTROLLED_DEV',
      uniqueKey: ['childId', 'lessonId'],
      requiredFields: [
        {
          canonical: 'progressId',
          aliases: ['progressId', 'progressid', 'id', 'lessonProgressId']
        },
        {
          canonical: 'childId',
          aliases: ['childId', 'childid', 'child', 'maChild', 'machild', 'studentId', 'studentid', 'learnerId', 'learnerid']
        },
        {
          canonical: 'lessonId',
          aliases: ['lessonId', 'lessonid', 'lesson', 'maBaiHoc', 'mabaihoc']
        },
        {
          canonical: 'status',
          aliases: ['status', 'progressStatus', 'trangThai', 'trangthai']
        },
        {
          canonical: 'progressPercent',
          aliases: ['progressPercent', 'progresspercent', 'percent', 'completionPercent', 'tiendo']
        }
      ],
      optionalFields: [
        {
          canonical: 'currentStepIndex',
          aliases: ['currentStepIndex', 'currentstepindex', 'stepIndex', 'currentStep']
        },
        {
          canonical: 'startedAt',
          aliases: ['startedAt', 'startedat', 'startTime']
        },
        {
          canonical: 'completedAt',
          aliases: ['completedAt', 'completedat', 'finishedAt']
        },
        {
          canonical: 'updatedAt',
          aliases: ['updatedAt', 'updatedat', 'modifiedAt']
        }
      ]
    },
    {
      sheetName: 'DATA_StudySessions',
      contractType: 'APPEND_OR_UPDATE_STUDY_SESSION',
      operationPlanned: 'APPEND_AND_UPDATE_CONTROLLED_DEV',
      uniqueKey: ['sessionId'],
      requiredFields: [
        {
          canonical: 'sessionId',
          aliases: ['sessionId', 'sessionid', 'studySessionId', 'id']
        },
        {
          canonical: 'childId',
          aliases: ['childId', 'childid', 'child', 'maChild', 'machild', 'studentId', 'studentid', 'learnerId', 'learnerid']
        },
        {
          canonical: 'lessonId',
          aliases: ['lessonId', 'lessonid', 'lesson', 'maBaiHoc', 'mabaihoc']
        },
        {
          canonical: 'status',
          aliases: ['status', 'sessionStatus', 'trangThai', 'trangthai']
        },
        {
          canonical: 'startedAt',
          aliases: ['startedAt', 'startedat', 'startTime', 'createdAt']
        }
      ],
      optionalFields: [
        {
          canonical: 'subjectCode',
          aliases: ['subjectCode', 'subjectcode', 'subjectId', 'subjectid', 'maMonHoc', 'mamonhoc']
        },
        {
          canonical: 'endedAt',
          aliases: ['endedAt', 'endedat', 'endTime', 'completedAt']
        },
        {
          canonical: 'durationSeconds',
          aliases: ['durationSeconds', 'duration', 'durationSec', 'seconds']
        },
        {
          canonical: 'updatedAt',
          aliases: ['updatedAt', 'updatedat', 'modifiedAt']
        }
      ]
    },
    {
      sheetName: 'LOG_Audit',
      contractType: 'APPEND_AUDIT_LOG',
      operationPlanned: 'APPEND_AUDIT_CONTROLLED_DEV',
      uniqueKey: ['auditId'],
      requiredFields: [
        {
          canonical: 'auditId',
          aliases: ['auditId', 'auditid', 'logId', 'logid', 'id']
        },
        {
          canonical: 'action',
          aliases: ['action', 'actionType', 'event', 'operation']
        },
        {
          canonical: 'entityType',
          aliases: ['entityType', 'entitytype', 'targetSheet', 'sheetName', 'objectType']
        },
        {
          canonical: 'entityId',
          aliases: ['entityId', 'entityid', 'targetId', 'objectId', 'recordId']
        },
        {
          canonical: 'detailsJson',
          aliases: ['detailsJson', 'detailsjson', 'payloadJson', 'metaJson', 'description']
        },
        {
          canonical: 'createdAt',
          aliases: ['createdAt', 'createdat', 'timestamp', 'time', 'loggedAt']
        }
      ],
      optionalFields: [
        {
          canonical: 'actorId',
          aliases: ['actorId', 'actorid', 'userId', 'userid']
        },
        {
          canonical: 'source',
          aliases: ['source', 'module', 'phase']
        },
        {
          canonical: 'environment',
          aliases: ['environment', 'env']
        }
      ]
    }
  ];
}


/**
 * Evaluate one sheet contract.
 */
function kidlearnV3_4d1EvaluateSheetContract_(spreadsheet, contract) {
  var errors = [];
  var warnings = [];

  var headerInfo =
    kidlearnV3_4d1InspectSheetHeaders_(
      spreadsheet,
      contract.sheetName,
      warnings
    );

  if (!headerInfo.exists) {
    errors.push(
      contract.sheetName + ': Không tìm thấy sheet.'
    );

    return {
      success: false,
      sheetName: contract.sheetName,
      contractType: contract.contractType,
      operationPlanned: contract.operationPlanned,
      exists: false,
      errorCount: errors.length,
      warningCount: warnings.length,
      errors: errors,
      warnings: warnings
    };
  }

  if (headerInfo.headerCount === 0) {
    errors.push(
      contract.sheetName + ': Không đọc được header.'
    );
  }

  var required =
    kidlearnV3_4d1MatchFields_(
      headerInfo,
      contract.requiredFields || []
    );

  var optional =
    kidlearnV3_4d1MatchFields_(
      headerInfo,
      contract.optionalFields || []
    );

  for (var i = 0; i < required.missing.length; i++) {
    errors.push(
      contract.sheetName +
      ': Thiếu required field ' +
      required.missing[i].canonical
    );
  }

  if (optional.missing.length > 0) {
    warnings.push(
      contract.sheetName +
      ': Có ' +
      optional.missing.length +
      ' optional field chưa match. Có thể bổ sung sau nếu cần.'
    );
  }

  var result = {
    success: errors.length === 0,
    sheetName: contract.sheetName,
    contractType: contract.contractType,
    operationPlanned: contract.operationPlanned,
    uniqueKey: contract.uniqueKey,
    exists: headerInfo.exists,
    headerRowIndex: headerInfo.headerRowIndex,
    dataStartRowIndex: headerInfo.dataStartRowIndex,
    headerCount: headerInfo.headerCount,
    lastRow: headerInfo.lastRow,
    lastColumn: headerInfo.lastColumn,
    headers: headerInfo.headers,
    duplicateHeaders: headerInfo.duplicateHeaders,
    required: required,
    optional: optional,
    writeSafety: {
      willWriteNow: false,
      actualSheetWritePerformed: false,
      prodWriteAllowed: false,
      realWriteAllowedNow: false
    },
    readyForDryRunPreview:
      errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: kidlearnV3_4d1UniqueArray_(warnings)
  };

  return result;
}


/**
 * Inspect sheet headers.
 */
function kidlearnV3_4d1InspectSheetHeaders_(spreadsheet, sheetName, warnings) {
  warnings = warnings || [];

  var sheet =
    kidlearnV3_4d1GetSheetByExactName_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return {
      exists: false,
      sheetName: sheetName,
      headerRowIndex: 0,
      dataStartRowIndex: 0,
      headerCount: 0,
      lastRow: 0,
      lastColumn: 0,
      headers: [],
      duplicateHeaders: []
    };
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (lastRow < 1 || lastColumn < 1) {
    warnings.push(
      sheetName + ': Sheet trống.'
    );

    return {
      exists: true,
      sheetName: sheetName,
      headerRowIndex: 0,
      dataStartRowIndex: 0,
      headerCount: 0,
      lastRow: lastRow,
      lastColumn: lastColumn,
      headers: [],
      duplicateHeaders: []
    };
  }

  var inspectRows =
    Math.min(2, lastRow);

  var values =
    sheet
      .getRange(1, 1, inspectRows, lastColumn)
      .getValues();

  var headerDecision =
    kidlearnV3_4d1ChooseHeaderRow_(values);

  var headerRow =
    values[headerDecision.headerRowIndex - 1] || [];

  var headers = [];
  var normalizedMap = {};
  var duplicateHeaders = [];

  for (var i = 0; i < headerRow.length; i++) {
    var raw =
      String(headerRow[i] || '').trim();

    var normalized =
      kidlearnV3_4d1NormalizeLookupKey_(raw);

    if (!raw) {
      continue;
    }

    if (normalizedMap[normalized]) {
      duplicateHeaders.push({
        normalized: normalized,
        firstColumnIndex:
          normalizedMap[normalized].columnIndex,
        duplicateColumnIndex:
          i + 1,
        raw: raw
      });
    } else {
      normalizedMap[normalized] = {
        columnIndex: i + 1,
        raw: raw
      };
    }

    headers.push({
      columnIndex: i + 1,
      raw: raw,
      normalized: normalized
    });
  }

  if (duplicateHeaders.length > 0) {
    warnings.push(
      sheetName +
      ': Có duplicate normalized headers=' +
      duplicateHeaders.length
    );
  }

  return {
    exists: true,
    sheetName: sheetName,
    headerRowIndex: headerDecision.headerRowIndex,
    dataStartRowIndex: headerDecision.headerRowIndex + 1,
    headerCount: headers.length,
    lastRow: lastRow,
    lastColumn: lastColumn,
    headers: headers,
    duplicateHeaders: duplicateHeaders
  };
}


function kidlearnV3_4d1ChooseHeaderRow_(values) {
  var row1 = values[0] || [];
  var row2 = values.length > 1 ? values[1] || [] : [];

  var row1Score =
    kidlearnV3_4d1HeaderKeyScore_(row1);

  var row2Score =
    kidlearnV3_4d1HeaderKeyScore_(row2);

  if (row2Score >= 3 && row2Score >= row1Score) {
    return {
      headerRowIndex: 2,
      reason: 'ROW_2_LOOKS_LIKE_FIELD_KEYS'
    };
  }

  return {
    headerRowIndex: 1,
    reason: 'ROW_1_USED_AS_HEADER'
  };
}


function kidlearnV3_4d1HeaderKeyScore_(row) {
  var score = 0;

  for (var i = 0; i < row.length; i++) {
    var value =
      String(row[i] || '').trim();

    if (!value) continue;

    if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
      score++;
      continue;
    }

    if (
      value.indexOf('Id') >= 0 ||
      value.indexOf('Code') >= 0 ||
      value.indexOf('Name') >= 0 ||
      value.indexOf('At') >= 0 ||
      value.indexOf('Json') >= 0
    ) {
      score++;
    }
  }

  return score;
}


/**
 * Field matching.
 */
function kidlearnV3_4d1MatchFields_(headerInfo, fields) {
  var matched = [];
  var missing = [];

  for (var i = 0; i < fields.length; i++) {
    var field =
      fields[i];

    var match =
      kidlearnV3_4d1FindHeaderMatch_(
        headerInfo.headers || [],
        field.aliases || []
      );

    if (match) {
      matched.push({
        canonical: field.canonical,
        matchedHeader: match.raw,
        columnIndex: match.columnIndex,
        normalized: match.normalized
      });
    } else {
      missing.push({
        canonical: field.canonical,
        aliases: field.aliases || []
      });
    }
  }

  return {
    matchedCount: matched.length,
    missingCount: missing.length,
    matched: matched,
    missing: missing
  };
}


function kidlearnV3_4d1FindHeaderMatch_(headers, aliases) {
  var aliasMap = {};

  for (var i = 0; i < aliases.length; i++) {
    aliasMap[
      kidlearnV3_4d1NormalizeLookupKey_(aliases[i])
    ] = true;
  }

  for (var j = 0; j < headers.length; j++) {
    if (aliasMap[headers[j].normalized]) {
      return headers[j];
    }
  }

  return null;
}


/**
 * Summary.
 */
function kidlearnV3_4d1BuildReadinessSummary_(sheetResults) {
  var totalSheets =
    sheetResults.length;

  var readySheets = 0;
  var missingRequiredTotal = 0;
  var matchedRequiredTotal = 0;
  var matchedOptionalTotal = 0;

  for (var i = 0; i < sheetResults.length; i++) {
    var item =
      sheetResults[i];

    if (item.success) readySheets++;

    if (item.required) {
      missingRequiredTotal +=
        item.required.missingCount || 0;

      matchedRequiredTotal +=
        item.required.matchedCount || 0;
    }

    if (item.optional) {
      matchedOptionalTotal +=
        item.optional.matchedCount || 0;
    }
  }

  return {
    totalSheets: totalSheets,
    readySheets: readySheets,
    allTargetSheetsReady:
      totalSheets > 0 && readySheets === totalSheets,
    matchedRequiredTotal: matchedRequiredTotal,
    missingRequiredTotal: missingRequiredTotal,
    matchedOptionalTotal: matchedOptionalTotal,
    readyFor4D2DryRunRowPreview:
      totalSheets > 0 &&
      readySheets === totalSheets &&
      missingRequiredTotal === 0
  };
}


/**
 * DEV safety.
 */
function kidlearnV3_4d1CheckDevSafety_() {
  var errors = [];
  var warnings = [];

  var properties =
    PropertiesService.getScriptProperties();

  var environment = '';

  try {
    if (
      typeof KIDLEARN_V3 !== 'undefined' &&
      KIDLEARN_V3 &&
      KIDLEARN_V3.SCRIPT_PROPERTIES &&
      KIDLEARN_V3.SCRIPT_PROPERTIES.ENVIRONMENT
    ) {
      environment =
        properties.getProperty(
          KIDLEARN_V3.SCRIPT_PROPERTIES.ENVIRONMENT
        ) || '';
    }
  } catch (error) {
    // ignore
  }

  if (!environment) {
    environment =
      properties.getProperty('KIDLEARN_V3_ENVIRONMENT') ||
      properties.getProperty('ENVIRONMENT') ||
      '';
  }

  if (environment) {
    if (
      String(environment).toUpperCase() !== 'DEV'
    ) {
      errors.push(
        'Environment không phải DEV. Current=' +
        environment
      );
    }
  } else {
    warnings.push(
      'Không tìm thấy ScriptProperty environment. Tiếp tục nhưng chỉ cho phép read-only check.'
    );
  }

  return {
    success: errors.length === 0,
    action: 'CHECK_DEV_SAFETY_4D_1_V3',
    environment:
      environment || 'UNKNOWN',
    prodWriteAllowed: false,
    realWriteAllowed: false,
    actualSheetWritePerformed: false,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings
  };
}


/**
 * Spreadsheet helpers.
 */
function kidlearnV3_4d1OpenSpreadsheet_() {
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


function kidlearnV3_4d1GetSheetByExactName_(spreadsheet, sheetName) {
  if (
    typeof kidlearnV3_getSheetByExactName_ === 'function'
  ) {
    return kidlearnV3_getSheetByExactName_(
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
 * Generic helpers.
 */
function kidlearnV3_4d1NormalizeLookupKey_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .replace(/-/g, '')
    .replace(/[^\w]/g, '');
}


function kidlearnV3_4d1UniqueArray_(items) {
  var map = {};
  var result = [];

  for (var i = 0; i < items.length; i++) {
    var value =
      String(items[i] || '');

    if (!value) continue;

    if (!map[value]) {
      map[value] = true;
      result.push(value);
    }
  }

  return result;
}


function kidlearnV3_4d1SafeCall_(functionName) {
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


function kidlearnV3_4d1GetCurrentStatus_() {
  return (
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_WRITE_CONTRACT_4D1_KEYS.STATUS
      ) ||
    KIDLEARN_V3_WRITE_CONTRACT_4D1_STATUS.NOT_RUN
  );
}


function kidlearnV3_4d1ResolveStatusAfterCheck_(statusBefore, proposedStatus) {
  if (
    statusBefore ===
      KIDLEARN_V3_WRITE_CONTRACT_4D1_STATUS.READY_FOR_4D_2 &&
    proposedStatus !==
      KIDLEARN_V3_WRITE_CONTRACT_4D1_STATUS.FAILED
  ) {
    return KIDLEARN_V3_WRITE_CONTRACT_4D1_STATUS.READY_FOR_4D_2;
  }

  return proposedStatus;
}


function kidlearnV3_4d1SaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_WRITE_CONTRACT_4D1_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_WRITE_CONTRACT_4D1_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success: result.success,
      action: result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.PARENT_PHASE,
      status: status,
      contractName:
        KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.CONTRACT_NAME,
      nextBundle:
        KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_WRITE_CONTRACT_4D1_CONFIG.NEXT_STAGE,
      prodWriteAllowed: false,
      realWriteAllowed: false,
      actualSheetWritePerformed: false,
      readinessSummary:
        result.readinessSummary || null,
      errorCount:
        result.errorCount || 0,
      warningCount:
        result.warningCount || 0,
      errors:
        result.errors || [],
      warnings:
        result.warnings || [],
      at:
        new Date().toISOString()
    })
  );
}


function kidlearnV3_4d1ReadJsonProperty_(key) {
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