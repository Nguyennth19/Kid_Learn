/**
 * ================================================================
 * KIDLEARN V3 - CHILD RETRY CONTEXT READ-ONLY
 * Step: 4F-4A
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Read DATA_Responses.answerMetaJson.
 * - Find handwriting responses with review status = REVIEWED_RETRY.
 * - Build retry context for Child Home UI.
 *
 * Safety:
 * - Không ghi DATA_Responses.
 * - Không ghi LOG_Audit.
 * - Không ghi Google Drive.
 * - Không tạo DATA_Assignments.
 * - Không reset DATA_LessonProgress.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4F-4A.
 */


var KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4F4A_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4F4A_LAST_PREVIEW_AT',
  LAST_CHECK_AT: 'KIDLEARN_V3_PHASE_4F4A_LAST_CHECK_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4F4A_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4F4A_LAST_RESULT_JSON'
};


var KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  CHECK_PASSED: 'CHECK_PASSED',
  READY_FOR_4F_4B: 'READY_FOR_4F_4B',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG = {
  PHASE: '4F-4A',
  PARENT_PHASE: '4F',
  PREVIOUS_BUNDLE: '4F-3',
  NEXT_BUNDLE: '4F-4B',
  NEXT_STAGE: 'CHILD_HOME_RETRY_CARD_UI_READ_ONLY',
  CONTEXT_NAME: 'CHILD_RETRY_CONTEXT_READ_ONLY',
  DEFAULT_CHILD_ID: 'CHD_V2_CHILD_DEFAULT',
  TARGET_REVIEW_STATUS: 'REVIEWED_RETRY',
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Main context function for UI.
 *
 * options:
 * {
 *   childId: 'CHD_V2_CHILD_DEFAULT',
 *   limit: 20
 * }
 */
function kidlearnV3_getChildRetryContext4F4AV3(options) {
  var result =
    kidlearnV3_4f4aBuildChildRetryContext_(options || {});

  result.action =
    'GET_CHILD_RETRY_CONTEXT_4F_4A_V3';

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4F-4A child retry context failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Preview 4F-4A.
 */
function kidlearnV3_previewChildRetryContext4F4AV3() {
  var result =
    kidlearnV3_4f4aBuildChildRetryContext_({});

  result.action =
    'PREVIEW_CHILD_RETRY_CONTEXT_4F_4A_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_STATUS.PREVIEWED
      : KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_STATUS.FAILED;

  kidlearnV3_4f4aSaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4F-4A preview failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Check 4F-4A.
 */
function kidlearnV3_checkChildRetryContext4F4AV3() {
  var result =
    kidlearnV3_4f4aBuildChildRetryContext_({});

  result.action =
    'CHECK_CHILD_RETRY_CONTEXT_4F_4A_V3';

  result.status =
    result.success
      ? KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_STATUS.CHECK_PASSED
      : KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_STATUS.FAILED;

  kidlearnV3_4f4aSaveStatus_(
    result,
    result.status,
    KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_KEYS.LAST_CHECK_AT
  );

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      '4F-4A check failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready for 4F-4B.
 */
function kidlearnV3_markChildRetryContext4F4AReadyV3() {
  var check =
    kidlearnV3_checkChildRetryContext4F4AV3();

  if (!check.success) {
    throw new Error('4F-4A check chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_CHILD_RETRY_CONTEXT_4F_4A_READY_V3',
    phase:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_STATUS.READY_FOR_4F_4B,
    contextName:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.CONTEXT_NAME,
    targetReviewStatus:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.TARGET_REVIEW_STATUS,
    retryCount:
      check.retryQueue ? check.retryQueue.retryCount : 0,
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    message:
      '4F-4A ready. Có thể qua 4F-4B để hiển thị card Bài cần làm lại trên Child Home.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4f4aSaveStatus_(
    result,
    KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_STATUS.READY_FOR_4F_4B,
    KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get status.
 */
function kidlearnV3_getChildRetryContext4F4AStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_CHILD_RETRY_CONTEXT_4F_4A_STATUS_V3',
    phase:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_KEYS.STATUS
      ) ||
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastCheckAt:
      properties.getProperty(
        KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_KEYS.LAST_CHECK_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4f4aReadJsonProperty_(
        KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_KEYS.LAST_RESULT_JSON
      ),
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready.
 */
function kidlearnV3_assertChildRetryContext4F4AReadyV3() {
  var status =
    kidlearnV3_getChildRetryContext4F4AStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_STATUS.READY_FOR_4F_4B
  ) {
    errors.push(
      '4F-4A chưa READY_FOR_4F_4B. Status=' +
      status.status
    );
  }

  var result = {
    success:
      errors.length === 0,
    action:
      'ASSERT_CHILD_RETRY_CONTEXT_4F_4A_READY_V3',
    phase:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.PHASE,
    status:
      status.status,
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    errorCount:
      errors.length,
    errors:
      errors
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(errors.join(' | '));
  }

  return result;
}


/**
 * QA batch.
 */
function kidlearnV3_runQaBatch4F4AV3() {
  var preview =
    kidlearnV3_previewChildRetryContext4F4AV3();

  var check =
    kidlearnV3_checkChildRetryContext4F4AV3();

  var ready =
    kidlearnV3_markChildRetryContext4F4AReadyV3();

  var assertReady =
    kidlearnV3_assertChildRetryContext4F4AReadyV3();

  var result = {
    success:
      preview.success === true &&
      check.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4F_4A_CHILD_RETRY_CONTEXT_READ_ONLY',
    phase:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.PHASE,
    status:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_STATUS.READY_FOR_4F_4B,
    retryCount:
      check.retryQueue ? check.retryQueue.retryCount : 0,
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    results: {
      preview: preview.success,
      check: check.success,
      ready: ready.success,
      assertReady: assertReady.success
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error('4F-4A QA batch failed.');
  }

  return result;
}


/**
 * Build child retry context.
 */
function kidlearnV3_4f4aBuildChildRetryContext_(options) {
  options = options || {};

  var errors = [];
  var warnings = [];

  var childId =
    String(
      options.childId ||
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.DEFAULT_CHILD_ID
    ).trim();

  var limit =
    Number(options.limit || 20);

  if (isNaN(limit) || limit <= 0) {
    limit = 20;
  }

  var dev =
    kidlearnV3_4f4aCheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var f3 =
    kidlearnV3_4f4aSafeCall_(
      'kidlearnV3_assertParentReviewUiWriteGate4F3ReadyV3'
    );

  if (!f3.success) {
    errors.push(
      '4F-3 chưa READY_FOR_4F_4: ' +
      f3.message
    );
  }

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4f4aOpenSpreadsheet_();
  } catch (errorOpen) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(errorOpen.message || errorOpen)
    );
  }

  var responseReadiness = null;
  var retryItems = [];
  var childMap = {};
  var subjectMap = {};
  var lessonMap = {};

  if (spreadsheet) {
    responseReadiness =
      kidlearnV3_4f4aInspectDataResponses_(spreadsheet);

    if (!responseReadiness.success) {
      errors =
        errors.concat(responseReadiness.errors || []);
    }

    childMap =
      kidlearnV3_4f4aBuildChildMap_(spreadsheet);

    subjectMap =
      kidlearnV3_4f4aBuildSubjectMap_(spreadsheet);

    lessonMap =
      kidlearnV3_4f4aBuildLessonMap_(spreadsheet);

    if (responseReadiness.success) {
      retryItems =
        kidlearnV3_4f4aCollectRetryItems_({
          sheet:
            responseReadiness.sheet,
          headers:
            responseReadiness.headers,
          columnMap:
            responseReadiness.columnMap,
          metadataColumnIndex:
            responseReadiness.metadataColumnIndex,
          childId:
            childId,
          limit:
            limit,
          childMap:
            childMap,
          subjectMap:
            subjectMap,
          lessonMap:
            lessonMap
        });

      warnings =
        warnings.concat(retryItems.warnings || []);

      retryItems =
        retryItems.items || [];
    }
  }

  var childInfo =
    kidlearnV3_4f4aResolveChildInfo_(
      childId,
      childMap
    );

  var retryQueue =
    kidlearnV3_4f4aBuildRetryQueue_(
      childId,
      retryItems
    );

  var result = {
    success:
      errors.length === 0,
    action:
      'BUILD_CHILD_RETRY_CONTEXT_4F_4A_V3',
    phase:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.PARENT_PHASE,
    contextName:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.CONTEXT_NAME,
    child:
      childInfo,
    targetReviewStatus:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.TARGET_REVIEW_STATUS,
    rolePolicy: {
      childCanSeeRetryQueue:
        true,
      familyAdminCanSeeRetryQueue:
        true,
      childCanOpenLesson:
        true,
      childCanOpenDriveLink:
        false,
      parentCanOpenDriveLink:
        true
    },
    retryFlowPolicy: {
      readOnlyNow:
        true,
      createsDataAssignmentsNow:
        false,
      resetsLessonProgressNow:
        false,
      createsNewLessonAttemptNow:
        false,
      openOldLessonOnly:
        true,
      writePhase:
        'NONE_IN_4F_4A',
      routingPhase:
        '4F-4C'
    },
    uiPolicy: {
      showRetryCardOnChildHome:
        retryQueue.retryCount > 0,
      showEmptyState:
        retryQueue.retryCount === 0,
      cardTitle:
        'Bài cần làm lại',
      primaryButtonLabel:
        'Làm lại bài này',
      nextUiStep:
        '4F-4B'
    },
    retryQueue:
      retryQueue,
    sourceInfo: {
      responseSheet:
        'DATA_Responses',
      metadataColumn:
        responseReadiness && responseReadiness.metadataColumnName
          ? responseReadiness.metadataColumnName
          : '',
      rowsScanned:
        responseReadiness ? responseReadiness.rowsScanned : 0,
      currentLogic:
        'Filter answerMetaJson.handwritingReview.status == REVIEWED_RETRY'
    },
    nextBundle:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.NEXT_STAGE,
    prodWriteAllowed:
      false,
    realSheetWriteAllowedNow:
      false,
    realDriveWriteAllowedNow:
      false,
    actualSheetWritePerformed:
      false,
    actualDriveWritePerformed:
      false,
    errorCount:
      errors.length,
    warningCount:
      kidlearnV3_4f4aUniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4f4aUniqueArray_(warnings)
  };

  return result;
}


/**
 * DATA_Responses readiness.
 * 4F-4A-P1:
 * More flexible metadata column detection.
 */
function kidlearnV3_4f4aInspectDataResponses_(spreadsheet) {
  var errors = [];
  var warnings = [];

  var sheet =
    kidlearnV3_4f4aGetSheetByExactName_(
      spreadsheet,
      'DATA_Responses'
    );

  if (!sheet) {
    return {
      success: false,
      errors: [
        'Không tìm thấy sheet DATA_Responses.'
      ]
    };
  }

  var lastColumn =
    sheet.getLastColumn();

  var lastRow =
    sheet.getLastRow();

  if (lastColumn < 1) {
    return {
      success: false,
      sheet:
        sheet,
      errors: [
        'DATA_Responses không có header.'
      ]
    };
  }

  var headers =
    sheet
      .getRange(1, 1, 1, lastColumn)
      .getValues()[0];

  var columnMap =
    kidlearnV3_4f4aBuildColumnMap_(headers);

  var metadataResult =
    kidlearnV3_4f4aResolveMetadataColumnIndex4F4AP1_(
      sheet,
      headers
    );

  if (!metadataResult.success) {
    errors.push(
      'DATA_Responses thiếu metadata column. ' +
      'Không tìm được bằng alias, 4E-4 lastLink, hoặc scan JSON.'
    );
  } else {
    warnings =
      warnings.concat(metadataResult.warnings || []);
  }

  return {
    success:
      errors.length === 0,
    sheet:
      sheet,
    headers:
      headers,
    columnMap:
      columnMap,
    metadataColumnIndex:
      metadataResult.metadataColumnIndex,
    metadataColumnName:
      metadataResult.metadataColumnName,
    metadataColumnSource:
      metadataResult.source,
    rowsScanned:
      Math.max(0, lastRow - 1),
    errorCount:
      errors.length,
    warningCount:
      warnings.length,
    errors:
      errors,
    warnings:
      warnings
  };
}


/**
 * Collect retry items.
 */
function kidlearnV3_4f4aCollectRetryItems_(params) {
  var sheet =
    params.sheet;

  var headers =
    params.headers || [];

  var columnMap =
    params.columnMap || {};

  var childId =
    params.childId || '';

  var limit =
    params.limit || 20;

  var childMap =
    params.childMap || {};

  var subjectMap =
    params.subjectMap || {};

  var lessonMap =
    params.lessonMap || {};

  var warnings = [];
  var items = [];

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (lastRow < 2) {
    return {
      items: [],
      warnings: warnings
    };
  }

  var values =
    sheet
      .getRange(2, 1, lastRow - 1, lastColumn)
      .getValues();

    var metaIndex =
    typeof params.metadataColumnIndex === 'number'
      ? params.metadataColumnIndex
      : -1;

  if (metaIndex < 0) {
    metaIndex =
      kidlearnV3_4f4aFindColumnIndexByAliases_(
        headers,
        [
          'answerMetaJson',
          'answerMetaJSON',
          'answerMetadataJson',
          'responseMetaJson',
          'responseMetadataJson',
          'detailsJson',
          'metaJson',
          'payloadJson',
          'metadataJson',
          'metadata',
          'answerMeta',
          'details',
          'payload'
        ]
      );
  }

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var rowNumber =
      i + 2;

    var metaText =
      metaIndex >= 0
        ? String(row[metaIndex] || '')
        : '';

    var parsed =
      kidlearnV3_4f4aSafeJsonParse_(metaText);

    if (!parsed.success) {
      if (metaText) {
        warnings.push(
          'Row ' + rowNumber + ' answerMetaJson không phải JSON hợp lệ.'
        );
      }

      continue;
    }

    var meta =
      parsed.value || {};

    var review =
      meta.handwritingReview || {};

    var asset =
      meta.handwritingAsset || {};

    var currentReviewStatus =
      String(
        review.status ||
        asset.reviewStatus ||
        ''
      )
        .trim()
        .toUpperCase();

    if (
      currentReviewStatus !==
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.TARGET_REVIEW_STATUS
    ) {
      continue;
    }

    var itemChildId =
      kidlearnV3_4f4aReadValueByAliases_(
        row,
        headers,
        [
          'childId',
          'studentId',
          'learnerId'
        ]
      ) ||
      meta.childId ||
      asset.childId ||
      '';

    itemChildId =
      String(itemChildId || '').trim();

    if (
      childId &&
      itemChildId &&
      itemChildId !== childId
    ) {
      continue;
    }

    var responseId =
      kidlearnV3_4f4aReadValueByAliases_(
        row,
        headers,
        [
          'responseId',
          'id'
        ]
      ) ||
      meta.responseId ||
      asset.responseId ||
      '';

    var lessonId =
      kidlearnV3_4f4aReadValueByAliases_(
        row,
        headers,
        [
          'lessonId'
        ]
      ) ||
      meta.lessonId ||
      asset.lessonId ||
      '';

    var activityId =
      kidlearnV3_4f4aReadValueByAliases_(
        row,
        headers,
        [
          'activityId'
        ]
      ) ||
      meta.activityId ||
      asset.activityId ||
      '';

    var subjectCode =
      kidlearnV3_4f4aReadValueByAliases_(
        row,
        headers,
        [
          'subjectCode',
          'subjectId'
        ]
      ) ||
      meta.subjectCode ||
      asset.subjectCode ||
      '';

    var answerMode =
      kidlearnV3_4f4aReadValueByAliases_(
        row,
        headers,
        [
          'answerMode'
        ]
      ) ||
      meta.answerMode ||
      asset.answerMode ||
      'HANDWRITE_INPUT';

    var lessonInfo =
      kidlearnV3_4f4aResolveLessonInfo_(
        lessonId,
        lessonMap
      );

    var subjectInfo =
      kidlearnV3_4f4aResolveSubjectInfo_(
        subjectCode || lessonInfo.subjectCode,
        subjectMap
      );

    var resolvedChild =
      kidlearnV3_4f4aResolveChildInfo_(
        itemChildId || childId,
        childMap
      );

    var item = {
      retryId:
        'RETRY_' +
        String(responseId || rowNumber),
      responseId:
        String(responseId || ''),
      responseRowNumber:
        rowNumber,
      childId:
        itemChildId || childId,
      childName:
        resolvedChild.name,
      subjectCode:
        subjectInfo.subjectCode,
      subjectName:
        subjectInfo.subjectName,
      lessonId:
        String(lessonId || ''),
      lessonTitle:
        lessonInfo.lessonTitle || 'Bài học cần làm lại',
      activityId:
        String(activityId || ''),
      answerMode:
        String(answerMode || 'HANDWRITE_INPUT'),
      reviewStatus:
        currentReviewStatus,
      reviewerNote:
        String(review.reviewerNote || ''),
      reviewedAt:
        String(review.reviewedAt || ''),
      reviewedBy:
        String(review.reviewedBy || ''),
      handwritingAsset: {
        fileId:
          String(asset.fileId || ''),
        fileUrl:
          String(asset.fileUrl || ''),
        fileName:
          String(asset.fileName || ''),
        mimeType:
          String(asset.mimeType || 'image/png')
      },
      uiText: {
        title:
          'Bài cần làm lại',
        subtitle:
          subjectInfo.subjectName
            ? subjectInfo.subjectName + ' • ' + (lessonInfo.lessonTitle || lessonId)
            : (lessonInfo.lessonTitle || lessonId || 'Bài viết tay'),
        reason:
          review.reviewerNote ||
          'Phụ huynh yêu cầu bé làm lại bài viết tay này.',
        buttonLabel:
          'Làm lại bài này'
      },
      uiActions: {
        openLessonEnabled:
          String(lessonId || '') !== '',
        openLessonAction:
          'OPEN_RETRY_LESSON_4F4C',
        openDriveLinkForChild:
          false,
        openDriveLinkForParent:
          String(asset.fileUrl || '') !== ''
      },
      sourceMeta: {
        responseSheet:
          'DATA_Responses',
        metadataColumnIndex:
          metaIndex + 1,
        sourcePhase:
          '4F-4A'
      }
    };

    items.push(item);

    if (items.length >= limit) {
      break;
    }
  }

  return {
    items:
      items,
    warnings:
      warnings
  };
}


/**
 * Build retry queue object.
 */
function kidlearnV3_4f4aBuildRetryQueue_(childId, items) {
  items = items || [];

  return {
    title:
      'Bài cần làm lại',
    targetReviewStatus:
      KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.TARGET_REVIEW_STATUS,
    childId:
      childId,
    retryCount:
      items.length,
    itemCount:
      items.length,
    items:
      items,
    emptyState: {
      show:
        items.length === 0,
      title:
        'Chưa có bài cần làm lại',
      message:
        'Khi phụ huynh yêu cầu làm lại bài viết tay, bài đó sẽ xuất hiện ở đây.'
    }
  };
}


/**
 * Child / Subject / Lesson maps.
 */
function kidlearnV3_4f4aBuildChildMap_(spreadsheet) {
  var map = {};

  var sheet =
    kidlearnV3_4f4aGetSheetByExactName_(
      spreadsheet,
      'DATA_Children'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    return map;
  }

  var headers =
    sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var id =
      kidlearnV3_4f4aReadValueByAliases_(
        row,
        headers,
        [
          'childId',
          'id'
        ]
      );

    var name =
      kidlearnV3_4f4aReadValueByAliases_(
        row,
        headers,
        [
          'childName',
          'fullName',
          'name',
          'displayName'
        ]
      );

    id =
      String(id || '').trim();

    if (id) {
      map[id] = {
        childId:
          id,
        name:
          String(name || 'Bé').trim() || 'Bé'
      };
    }
  }

  return map;
}


function kidlearnV3_4f4aBuildSubjectMap_(spreadsheet) {
  var map = {};

  var sheet =
    kidlearnV3_4f4aGetSheetByExactName_(
      spreadsheet,
      'MST_Subjects'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    return map;
  }

  var headers =
    sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var code =
      kidlearnV3_4f4aReadValueByAliases_(
        row,
        headers,
        [
          'subjectCode',
          'subjectId',
          'code',
          'id'
        ]
      );

    var name =
      kidlearnV3_4f4aReadValueByAliases_(
        row,
        headers,
        [
          'subjectName',
          'name',
          'title'
        ]
      );

    code =
      String(code || '').trim();

    if (code) {
      map[code] = {
        subjectCode:
          code,
        subjectName:
          String(name || code).trim()
      };
    }
  }

  return map;
}


function kidlearnV3_4f4aBuildLessonMap_(spreadsheet) {
  var map = {};

  var sheet =
    kidlearnV3_4f4aGetSheetByExactName_(
      spreadsheet,
      'MST_Lessons'
    );

  if (!sheet || sheet.getLastRow() < 2) {
    return map;
  }

  var headers =
    sheet
      .getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0];

  var values =
    sheet
      .getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var lessonId =
      kidlearnV3_4f4aReadValueByAliases_(
        row,
        headers,
        [
          'lessonId',
          'id'
        ]
      );

    var title =
      kidlearnV3_4f4aReadValueByAliases_(
        row,
        headers,
        [
          'lessonTitle',
          'title',
          'name'
        ]
      );

    var subjectCode =
      kidlearnV3_4f4aReadValueByAliases_(
        row,
        headers,
        [
          'subjectCode',
          'subjectId'
        ]
      );

    lessonId =
      String(lessonId || '').trim();

    if (lessonId) {
      map[lessonId] = {
        lessonId:
          lessonId,
        lessonTitle:
          String(title || lessonId).trim(),
        subjectCode:
          String(subjectCode || '').trim()
      };
    }
  }

  return map;
}


function kidlearnV3_4f4aResolveChildInfo_(childId, childMap) {
  childMap =
    childMap || {};

  var info =
    childMap[childId] || {};

  return {
    childId:
      childId,
    name:
      info.name || 'Bé',
    displayName:
      info.name || 'Bé'
  };
}


function kidlearnV3_4f4aResolveSubjectInfo_(subjectCode, subjectMap) {
  subjectMap =
    subjectMap || {};

  subjectCode =
    String(subjectCode || '').trim();

  var info =
    subjectMap[subjectCode] || {};

  return {
    subjectCode:
      subjectCode,
    subjectName:
      info.subjectName || subjectCode || 'Bài học'
  };
}


function kidlearnV3_4f4aResolveLessonInfo_(lessonId, lessonMap) {
  lessonMap =
    lessonMap || {};

  lessonId =
    String(lessonId || '').trim();

  var info =
    lessonMap[lessonId] || {};

  return {
    lessonId:
      lessonId,
    lessonTitle:
      info.lessonTitle || lessonId || 'Bài học cần làm lại',
    subjectCode:
      info.subjectCode || ''
  };
}


/**
 * Spreadsheet helpers.
 */
function kidlearnV3_4f4aOpenSpreadsheet_() {
  var active =
    SpreadsheetApp.getActiveSpreadsheet();

  if (active) {
    return active;
  }

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

  throw new Error('Không tìm thấy DEV spreadsheet id.');
}


function kidlearnV3_4f4aGetSheetByExactName_(spreadsheet, sheetName) {
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
 * Header helpers.
 */
function kidlearnV3_4f4aBuildColumnMap_(headers) {
  var map = {};

  for (var i = 0; i < headers.length; i++) {
    var key =
      kidlearnV3_4f4aNormalizeHeader_(headers[i]);

    if (key && map[key] === undefined) {
      map[key] = i;
    }
  }

  return map;
}


function kidlearnV3_4f4aFindColumnIndexByAliases_(headers, aliases) {
  headers =
    headers || [];

  aliases =
    aliases || [];

  var normalizedAliases = {};

  for (var i = 0; i < aliases.length; i++) {
    normalizedAliases[
      kidlearnV3_4f4aNormalizeHeader_(aliases[i])
    ] = true;
  }

  for (var j = 0; j < headers.length; j++) {
    var normalized =
      kidlearnV3_4f4aNormalizeHeader_(headers[j]);

    if (normalizedAliases[normalized]) {
      return j;
    }
  }

  return -1;
}


function kidlearnV3_4f4aReadValueByAliases_(row, headers, aliases) {
  var index =
    kidlearnV3_4f4aFindColumnIndexByAliases_(
      headers,
      aliases
    );

  if (index < 0) return '';

  return row[index];
}


function kidlearnV3_4f4aNormalizeHeader_(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '')
    .replace(/_/g, '')
    .replace(/-/g, '');
}


/**
 * DEV safety.
 */
function kidlearnV3_4f4aCheckDevSafety_() {
  var errors = [];

  var environment = '';

  try {
    if (
      typeof KIDLEARN_V3 !== 'undefined' &&
      KIDLEARN_V3 &&
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

  if (
    String(environment || '').toUpperCase() !== 'DEV'
  ) {
    errors.push(
      'Environment không phải DEV. Current=' +
      (environment || 'UNKNOWN')
    );
  }

  return {
    success:
      errors.length === 0,
    environment:
      environment || 'UNKNOWN',
    prodWriteAllowed:
      false,
    errors:
      errors
  };
}


/**
 * Generic helpers.
 */
function kidlearnV3_4f4aSafeCall_(functionName) {
  try {
    var exists =
      eval(
        'typeof ' + functionName + ' === "function"'
      );

    if (!exists) {
      return {
        success: false,
        functionName:
          functionName,
        message:
          'Thiếu function ' + functionName,
        output: null
      };
    }

    var output =
      eval(functionName)();

    return {
      success:
        output && output.success === true,
      functionName:
        functionName,
      phase:
        output && output.phase ? output.phase : '',
      status:
        output && output.status ? output.status : '',
      nextBundle:
        output && output.nextBundle ? output.nextBundle : '',
      message:
        output && output.success === true
          ? 'OK'
          : kidlearnV3_4f4aPreviewValue_(JSON.stringify(output || {})),
      output:
        output
    };

  } catch (error) {
    return {
      success: false,
      functionName:
        functionName,
      message:
        String(error.message || error),
      output:
        null
    };
  }
}


function kidlearnV3_4f4aSafeJsonParse_(text) {
  text =
    String(text || '').trim();

  if (!text) {
    return {
      success: true,
      value: {},
      raw: ''
    };
  }

  try {
    return {
      success: true,
      value: JSON.parse(text),
      raw: text
    };
  } catch (error) {
    return {
      success: false,
      value: {},
      raw: text,
      error:
        String(error.message || error)
    };
  }
}


function kidlearnV3_4f4aPreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 350) {
    return text.substring(0, 350) + '...';
  }

  return text;
}


function kidlearnV3_4f4aUniqueArray_(items) {
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


function kidlearnV3_4f4aSaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.PARENT_PHASE,
      status:
        status,
      contextName:
        KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.CONTEXT_NAME,
      targetReviewStatus:
        KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.TARGET_REVIEW_STATUS,
      retryCount:
        result.retryQueue ? result.retryQueue.retryCount : result.retryCount || 0,
      nextBundle:
        KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_CHILD_RETRY_CONTEXT_4F4A_CONFIG.NEXT_STAGE,
      prodWriteAllowed:
        false,
      realSheetWriteAllowedNow:
        false,
      realDriveWriteAllowedNow:
        false,
      actualSheetWritePerformed:
        false,
      actualDriveWritePerformed:
        false,
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


function kidlearnV3_4f4aReadJsonProperty_(key) {
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

/**
 * 4F-4A-P1
 * Resolve metadata column flexibly.
 */
function kidlearnV3_4f4aResolveMetadataColumnIndex4F4AP1_(sheet, headers) {
  var warnings = [];

  var directIndex =
    kidlearnV3_4f4aFindColumnIndexByAliases_(
      headers,
      [
        'answerMetaJson',
        'answerMetaJSON',
        'answerMetadataJson',
        'responseMetaJson',
        'responseMetadataJson',
        'detailsJson',
        'metaJson',
        'payloadJson',
        'metadataJson',
        'metadata',
        'answerMeta',
        'details',
        'payload'
      ]
    );

  if (directIndex >= 0) {
    return {
      success: true,
      metadataColumnIndex: directIndex,
      metadataColumnName: String(headers[directIndex] || ''),
      source: 'HEADER_ALIAS',
      warnings: warnings
    };
  }

  var from4E4 =
    kidlearnV3_4f4aResolveMetadataColumnFrom4E4LastLink4F4AP1_(
      headers
    );

  if (from4E4.success) {
    warnings.push(
      'Metadata column được lấy từ 4E-4 lastLink, không phải từ tên header.'
    );

    return {
      success: true,
      metadataColumnIndex: from4E4.metadataColumnIndex,
      metadataColumnName: String(headers[from4E4.metadataColumnIndex] || ''),
      source: '4E_4_LAST_LINK',
      warnings: warnings
    };
  }

  var fromScan =
    kidlearnV3_4f4aScanMetadataColumnByJson4F4AP1_(
      sheet,
      headers
    );

  if (fromScan.success) {
    warnings.push(
      'Metadata column được nhận diện bằng cách scan JSON trong DATA_Responses.'
    );

    return {
      success: true,
      metadataColumnIndex: fromScan.metadataColumnIndex,
      metadataColumnName: String(headers[fromScan.metadataColumnIndex] || ''),
      source: 'SCAN_JSON_HANDWRITING_META',
      warnings: warnings
    };
  }

  return {
    success: false,
    metadataColumnIndex: -1,
    metadataColumnName: '',
    source: 'NOT_FOUND',
    warnings: warnings
  };
}


/**
 * Try to reuse metadataColumnIndex stored by 4E-4 lastLink.
 */
function kidlearnV3_4f4aResolveMetadataColumnFrom4E4LastLink4F4AP1_(headers) {
  try {
    if (
      typeof kidlearnV3_getHandwritingAssetLink4E4StatusV3 !== 'function'
    ) {
      return {
        success: false
      };
    }

    var status =
      kidlearnV3_getHandwritingAssetLink4E4StatusV3();

    var lastLink =
      status && status.lastLink
        ? status.lastLink
        : null;

    if (
      !lastLink &&
      status &&
      status.lastResult &&
      status.lastResult.lastLink
    ) {
      lastLink =
        status.lastResult.lastLink;
    }

    if (!lastLink) {
      return {
        success: false
      };
    }

    var oneBasedIndex =
      Number(lastLink.metadataColumnIndex || 0);

    if (
      isNaN(oneBasedIndex) ||
      oneBasedIndex <= 0
    ) {
      return {
        success: false
      };
    }

    var zeroBasedIndex =
      oneBasedIndex - 1;

    if (
      zeroBasedIndex < 0 ||
      zeroBasedIndex >= headers.length
    ) {
      return {
        success: false
      };
    }

    return {
      success: true,
      metadataColumnIndex: zeroBasedIndex,
      metadataColumnName: String(headers[zeroBasedIndex] || ''),
      source: '4E_4_LAST_LINK'
    };

  } catch (error) {
    return {
      success: false,
      error:
        String(error.message || error)
    };
  }
}


/**
 * Fallback: scan DATA_Responses cells to find JSON containing
 * handwritingReview or handwritingAsset.
 */
function kidlearnV3_4f4aScanMetadataColumnByJson4F4AP1_(sheet, headers) {
  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (lastRow < 2 || lastColumn < 1) {
    return {
      success: false
    };
  }

  var rowCount =
    Math.min(lastRow - 1, 80);

  var values =
    sheet
      .getRange(2, 1, rowCount, lastColumn)
      .getValues();

  var columnScores = [];

  for (var c = 0; c < lastColumn; c++) {
    columnScores[c] = 0;
  }

  for (var r = 0; r < values.length; r++) {
    for (var col = 0; col < lastColumn; col++) {
      var text =
        String(values[r][col] || '').trim();

      if (!text) continue;

      if (
        text.indexOf('{') !== 0 &&
        text.indexOf('[') !== 0
      ) {
        continue;
      }

      var parsed =
        kidlearnV3_4f4aSafeJsonParse_(text);

      if (!parsed.success) continue;

      var meta =
        parsed.value || {};

      if (
        meta.handwritingReview ||
        meta.handwritingAsset ||
        meta.answerMode ||
        meta.updatedAt
      ) {
        columnScores[col] =
          columnScores[col] + 1;
      }
    }
  }

  var bestIndex = -1;
  var bestScore = 0;

  for (var i = 0; i < columnScores.length; i++) {
    if (columnScores[i] > bestScore) {
      bestScore = columnScores[i];
      bestIndex = i;
    }
  }

  if (bestIndex >= 0 && bestScore > 0) {
    return {
      success: true,
      metadataColumnIndex: bestIndex,
      metadataColumnName: String(headers[bestIndex] || ''),
      score: bestScore,
      source: 'SCAN_JSON_HANDWRITING_META'
    };
  }

  return {
    success: false
  };
}