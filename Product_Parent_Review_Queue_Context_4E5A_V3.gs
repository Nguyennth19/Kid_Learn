/**
 * ================================================================
 * KIDLEARN V3 - PARENT REVIEW QUEUE CONTEXT READ-ONLY
 * Step: 4E-5A
 * Version: 3.1.0
 * ================================================================
 *
 * Purpose:
 * - Read DATA_Responses.answerMetaJson.
 * - Find handwriting responses with reviewStatus = NEEDS_REVIEW.
 * - Build read-only context for Parent Review Queue UI.
 *
 * Safety:
 * - Không ghi DATA_Responses.
 * - Không ghi LOG_Audit.
 * - Không ghi Google Drive.
 * - Không đổi reviewStatus.
 * - Chỉ ghi ScriptProperties trạng thái kỹ thuật 4E-5A.
 */


var KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_KEYS = {
  STATUS: 'KIDLEARN_V3_PHASE_4E5A_STATUS',
  LAST_PREVIEW_AT: 'KIDLEARN_V3_PHASE_4E5A_LAST_PREVIEW_AT',
  LAST_CHECK_AT: 'KIDLEARN_V3_PHASE_4E5A_LAST_CHECK_AT',
  LAST_READY_AT: 'KIDLEARN_V3_PHASE_4E5A_LAST_READY_AT',
  LAST_RESULT_JSON: 'KIDLEARN_V3_PHASE_4E5A_LAST_RESULT_JSON'
};


var KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_STATUS = {
  NOT_RUN: 'NOT_RUN',
  PREVIEWED: 'PREVIEWED',
  CHECK_PASSED: 'CHECK_PASSED',
  READY_FOR_4E_5B: 'READY_FOR_4E_5B',
  FAILED: 'FAILED'
};


var KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG = {
  PHASE: '4E-5A',
  PARENT_PHASE: '4E',
  PREVIOUS_BUNDLE: '4E-4',
  NEXT_BUNDLE: '4E-5B',
  NEXT_STAGE: 'PARENT_REVIEW_QUEUE_UI_READ_ONLY',
  CONTEXT_NAME: 'PARENT_REVIEW_QUEUE_CONTEXT_READ_ONLY',
  DEFAULT_PENDING_STATUS: 'NEEDS_REVIEW',
  PENDING_STATUSES: [
    'NEEDS_REVIEW',
    'HANDWRITING_CAPTURED'
  ],
  MAX_ITEMS: 50,
  PROD_WRITE_ALLOWED: false,
  REAL_SHEET_WRITE_ALLOWED_NOW: false,
  REAL_DRIVE_WRITE_ALLOWED_NOW: false
};


/**
 * Main context function for UI.
 * Read-only.
 */
function kidlearnV3_getParentReviewQueueContext4E5AV3(options) {
  options = options || {};

  var result =
    kidlearnV3_4e5aBuildContext_(
      options
    );

  console.log(JSON.stringify({
    success: result.success,
    action: result.action,
    phase: result.phase,
    itemCount: result.reviewQueue ? result.reviewQueue.itemCount : 0,
    pendingCount: result.reviewQueue ? result.reviewQueue.pendingCount : 0,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    errors: result.errors,
    warnings: result.warnings
  }, null, 2));

  if (!result.success) {
    throw new Error(
      '4E-5A context failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Preview context.
 * Read-only.
 */
function kidlearnV3_previewParentReviewQueueContext4E5AV3() {
  var result =
    kidlearnV3_getParentReviewQueueContext4E5AV3({
      limit:
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.MAX_ITEMS
    });

  result.action =
    'PREVIEW_PARENT_REVIEW_QUEUE_CONTEXT_4E_5A_V3';

  var statusBefore =
    kidlearnV3_4e5aGetCurrentStatus_();

  var statusAfter =
    kidlearnV3_4e5aResolveStatusAfterCheck_(
      statusBefore,
      result.success
        ? KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_STATUS.PREVIEWED
        : KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_STATUS.FAILED
    );

  result.statusBefore =
    statusBefore;

  result.statusAfter =
    statusAfter;

  kidlearnV3_4e5aSaveStatus_(
    result,
    statusAfter,
    KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_KEYS.LAST_PREVIEW_AT
  );

  console.log(JSON.stringify({
    success: result.success,
    action: result.action,
    phase: result.phase,
    statusAfter: statusAfter,
    itemCount: result.reviewQueue.itemCount,
    pendingCount: result.reviewQueue.pendingCount,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.NEXT_BUNDLE,
    warningCount: result.warningCount,
    warnings: result.warnings
  }, null, 2));

  return result;
}


/**
 * Check context.
 * Read-only.
 */
function kidlearnV3_checkParentReviewQueueContext4E5AV3() {
  var result =
    kidlearnV3_getParentReviewQueueContext4E5AV3({
      limit:
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.MAX_ITEMS
    });

  result.action =
    'CHECK_PARENT_REVIEW_QUEUE_CONTEXT_4E_5A_V3';

  var statusBefore =
    kidlearnV3_4e5aGetCurrentStatus_();

  var statusAfter =
    kidlearnV3_4e5aResolveStatusAfterCheck_(
      statusBefore,
      result.success
        ? KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_STATUS.CHECK_PASSED
        : KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_STATUS.FAILED
    );

  result.statusBefore =
    statusBefore;

  result.statusAfter =
    statusAfter;

  kidlearnV3_4e5aSaveStatus_(
    result,
    statusAfter,
    KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_KEYS.LAST_CHECK_AT
  );

  console.log(JSON.stringify({
    success: result.success,
    action: result.action,
    phase: result.phase,
    statusAfter: statusAfter,
    itemCount: result.reviewQueue.itemCount,
    pendingCount: result.reviewQueue.pendingCount,
    errorCount: result.errorCount,
    warningCount: result.warningCount,
    warnings: result.warnings
  }, null, 2));

  if (!result.success) {
    throw new Error(
      '4E-5A check failed. Errors=' +
      result.errors.join(' | ')
    );
  }

  return result;
}


/**
 * Mark ready for 4E-5B.
 */
function kidlearnV3_markParentReviewQueueContext4E5AReadyV3() {
  var check =
    kidlearnV3_checkParentReviewQueueContext4E5AV3();

  if (!check.success) {
    throw new Error('Check 4E-5A chưa pass.');
  }

  var result = {
    success: true,
    action: 'MARK_PARENT_REVIEW_QUEUE_CONTEXT_4E_5A_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.PARENT_PHASE,
    status:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_STATUS.READY_FOR_4E_5B,
    contextName:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.CONTEXT_NAME,
    itemCount:
      check.reviewQueue.itemCount,
    pendingCount:
      check.reviewQueue.pendingCount,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    message:
      '4E-5A ready. Có thể qua 4E-5B Parent Review Queue UI Read-only.',
    markedAt:
      new Date().toISOString()
  };

  kidlearnV3_4e5aSaveStatus_(
    result,
    KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_STATUS.READY_FOR_4E_5B,
    KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_KEYS.LAST_READY_AT
  );

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Get 4E-5A status.
 */
function kidlearnV3_getParentReviewQueueContext4E5AStatusV3() {
  var properties =
    PropertiesService.getScriptProperties();

  var result = {
    success: true,
    action: 'GET_PARENT_REVIEW_QUEUE_CONTEXT_4E_5A_STATUS_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.PARENT_PHASE,
    status:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_KEYS.STATUS
      ) ||
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_STATUS.NOT_RUN,
    lastPreviewAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_KEYS.LAST_PREVIEW_AT
      ) || '',
    lastCheckAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_KEYS.LAST_CHECK_AT
      ) || '',
    lastReadyAt:
      properties.getProperty(
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_KEYS.LAST_READY_AT
      ) || '',
    lastResult:
      kidlearnV3_4e5aReadJsonProperty_(
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_KEYS.LAST_RESULT_JSON
      )
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}


/**
 * Assert ready for 4E-5B.
 */
function kidlearnV3_assertParentReviewQueueContext4E5AReadyV3() {
  var status =
    kidlearnV3_getParentReviewQueueContext4E5AStatusV3();

  var errors = [];

  if (
    status.status !==
    KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_STATUS.READY_FOR_4E_5B
  ) {
    errors.push(
      '4E-5A chưa READY_FOR_4E_5B. Status=' +
      status.status
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'ASSERT_PARENT_REVIEW_QUEUE_CONTEXT_4E_5A_READY_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.PHASE,
    status:
      status.status,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
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
 * QA batch 4E-5A.
 */
function kidlearnV3_runQaBatch4E5AV3() {
  var preview =
    kidlearnV3_previewParentReviewQueueContext4E5AV3();

  var check =
    kidlearnV3_checkParentReviewQueueContext4E5AV3();

  var ready =
    kidlearnV3_markParentReviewQueueContext4E5AReadyV3();

  var assertReady =
    kidlearnV3_assertParentReviewQueueContext4E5AReadyV3();

  var result = {
    success:
      preview.success === true &&
      check.success === true &&
      ready.success === true &&
      assertReady.success === true,
    suiteName:
      'PHASE_4E_5A_PARENT_REVIEW_QUEUE_CONTEXT_READ_ONLY',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.PHASE,
    itemCount:
      check.reviewQueue.itemCount,
    pendingCount:
      check.reviewQueue.pendingCount,
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.NEXT_STAGE,
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
    throw new Error('4E-5A QA batch failed.');
  }

  return result;
}


/**
 * Build parent review queue context.
 */
function kidlearnV3_4e5aBuildContext_(options) {
  options = options || {};

  var errors = [];
  var warnings = [];

    /**
   * IMPORTANT 4E-5A-P1:
   * Không dùng strict 4E-4 READY_FOR_4E_5 nữa,
   * vì sau 4E-5C trạng thái có thể đã đổi từ NEEDS_REVIEW
   * sang REVIEWED_ACCEPTED hoặc REVIEWED_RETRY.
   *
   * Parent Review Queue context phải vẫn đọc được và hiển thị empty state.
   */
  var prerequisite =
    kidlearnV3_4e5aCheckReviewQueuePrerequisite4E5AP1_();

  if (!prerequisite.success) {
    warnings.push(
      '4E-5A prerequisite warning: ' +
      prerequisite.message +
      '. Vẫn tiếp tục đọc DATA_Responses để hiển thị queue.'
    );
  }

  var dev =
    kidlearnV3_4e5aCheckDevSafety_();

  if (!dev.success) {
    errors =
      errors.concat(dev.errors || []);
  }

  var spreadsheet = null;

  try {
    spreadsheet =
      kidlearnV3_4e5aOpenSpreadsheet_();
  } catch (error) {
    errors.push(
      'Không mở được DEV spreadsheet: ' +
      String(error.message || error)
    );
  }

  var childMap = {};

  if (spreadsheet) {
    childMap =
      kidlearnV3_4e5aBuildChildMap_(
        spreadsheet,
        warnings
      );
  }

  var responseRead = null;

  if (spreadsheet) {
    responseRead =
      kidlearnV3_4e5aReadHandwritingReviewItems_(
        spreadsheet,
        childMap,
        options,
        warnings
      );

    if (!responseRead.success) {
      errors =
        errors.concat(responseRead.errors || []);
    }

    warnings =
      warnings.concat(responseRead.warnings || []);
  }

  var items =
    responseRead && responseRead.items
      ? responseRead.items
      : [];

  var stats =
    kidlearnV3_4e5aBuildStats_(items);

  if (items.length === 0) {
    warnings.push(
      'Không tìm thấy bài viết tay NEEDS_REVIEW. UI 4E-5B sẽ hiển thị trạng thái trống.'
    );
  }

  var result = {
    success: errors.length === 0,
    action: 'GET_PARENT_REVIEW_QUEUE_CONTEXT_4E_5A_V3',
    phase:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.PHASE,
    parentPhase:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.PARENT_PHASE,
    contextName:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.CONTEXT_NAME,
    generatedAt:
      new Date().toISOString(),
    rolePolicy: {
      childCanSeeReviewQueue: false,
      familyAdminCanSeeReviewQueue: true,
      familyAdminCanOpenDriveLink: true,
      reviewActionWriteEnabledNow: false,
      reviewActionWritePhase: '4E-5C'
    },
    uiPolicy: {
      readOnlyNow: true,
      imageEmbedEnabledNow: false,
      openDriveLinkOnlyNow: true,
      showAcceptRetryButtonsNow: false,
      nextUiStep:
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.NEXT_BUNDLE
    },
    reviewQueue: {
      title: 'Bài viết tay chờ duyệt',
      description:
        'Danh sách bài viết tay cần phụ huynh/admin xem lại.',
      pendingStatuses:
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.PENDING_STATUSES,
      itemCount:
        items.length,
      pendingCount:
        stats.pendingCount,
      statsByStatus:
        stats.statsByStatus,
      items:
        items,
      emptyState: {
        visible:
          items.length === 0,
        title:
          'Chưa có bài viết tay cần duyệt',
        message:
          'Khi bé nộp bài viết tay và hệ thống lưu ảnh, danh sách sẽ hiển thị tại đây.'
      }
    },
    sourceInfo: {
      dataSource:
        'DATA_Responses.answerMetaJson',
      childSource:
        'DATA_Children',
      responseRead:
        responseRead,
      childMapCount:
        kidlearnV3_4e5aObjectKeyCount_(childMap)
    },
    nextBundle:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.NEXT_BUNDLE,
    nextStage:
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.NEXT_STAGE,
    prodWriteAllowed: false,
    realSheetWriteAllowedNow: false,
    realDriveWriteAllowedNow: false,
    actualSheetWritePerformed: false,
    actualDriveWritePerformed: false,
    errorCount:
      errors.length,
    warningCount:
      kidlearnV3_4e5aUniqueArray_(warnings).length,
    errors:
      errors,
    warnings:
      kidlearnV3_4e5aUniqueArray_(warnings)
  };

  return result;
}


/**
 * Read DATA_Responses and build review queue items.
 */
function kidlearnV3_4e5aReadHandwritingReviewItems_(
  spreadsheet,
  childMap,
  options,
  warnings
) {
  options = options || {};
  warnings = warnings || [];

  var errors = [];
  var localWarnings = [];

  var sheet =
    kidlearnV3_4e5aGetSheetByExactName_(
      spreadsheet,
      'DATA_Responses'
    );

  if (!sheet) {
    return {
      success: false,
      sheetName: 'DATA_Responses',
      items: [],
      errors: ['Không tìm thấy DATA_Responses.'],
      warnings: []
    };
  }

  var headerInfo =
    kidlearnV3_4e5aInspectSheetHeaders_(
      spreadsheet,
      'DATA_Responses',
      localWarnings
    );

  var metadataColumn =
    kidlearnV3_4e5aFindHeaderMatch_(
      headerInfo.headers || [],
      [
        'answerMetaJson',
        'detailsJson',
        'metaJson',
        'payloadJson',
        'metadataJson'
      ]
    );

  var responseIdColumn =
    kidlearnV3_4e5aFindHeaderMatch_(
      headerInfo.headers || [],
      [
        'responseId',
        'responseid',
        'id',
        'responseKey',
        'maPhanHoi',
        'maTraLoi'
      ]
    );

  if (!metadataColumn) {
    errors.push(
      'DATA_Responses thiếu answerMetaJson/detailsJson/metaJson.'
    );
  }

  if (!responseIdColumn) {
    errors.push(
      'DATA_Responses không map được responseId/id.'
    );
  }

  if (errors.length > 0) {
    return {
      success: false,
      sheetName: 'DATA_Responses',
      headerInfo: headerInfo,
      metadataColumn: metadataColumn,
      responseIdColumn: responseIdColumn,
      items: [],
      errorCount: errors.length,
      warningCount: localWarnings.length,
      errors: errors,
      warnings: localWarnings
    };
  }

  var startRow =
    headerInfo.dataStartRowIndex || headerInfo.headerRowIndex + 1;

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (lastRow < startRow) {
    return {
      success: true,
      sheetName: 'DATA_Responses',
      headerInfo: headerInfo,
      metadataColumn: metadataColumn,
      responseIdColumn: responseIdColumn,
      items: [],
      scannedRowCount: 0,
      errorCount: 0,
      warningCount: localWarnings.length,
      errors: [],
      warnings: localWarnings
    };
  }

  var rowCount =
    lastRow - startRow + 1;

  var values =
    sheet
      .getRange(startRow, 1, rowCount, lastColumn)
      .getValues();

  var limit =
    Number(options.limit || KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.MAX_ITEMS);

  if (isNaN(limit) || limit < 1) {
    limit =
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.MAX_ITEMS;
  }

  var items = [];

  for (var i = 0; i < values.length; i++) {
    var rowValues =
      values[i];

    var rowNumber =
      startRow + i;

    var rowObject =
      kidlearnV3_4e5aBuildRowObjectByHeader_(
        headerInfo,
        rowValues
      );

    var metaText =
      String(
        rowValues[metadataColumn.columnIndex - 1] || ''
      ).trim();

    if (!metaText) continue;

    var parsed =
      kidlearnV3_4e5aSafeJsonParse_(
        metaText
      );

    if (!parsed.success) {
      localWarnings.push(
        'Row ' + rowNumber + ': answerMetaJson không phải JSON hợp lệ.'
      );
      continue;
    }

    var meta =
      parsed.value || {};

    var asset =
      meta.handwritingAsset || {};

    var review =
      meta.handwritingReview || {};

    var reviewStatus =
      String(
        review.status ||
        asset.reviewStatus ||
        ''
      ).trim().toUpperCase();

    if (
      !kidlearnV3_4e5aIsPendingReviewStatus_(
        reviewStatus
      )
    ) {
      continue;
    }

    if (!asset.fileId && !asset.fileUrl) {
      localWarnings.push(
        'Row ' + rowNumber + ': có reviewStatus pending nhưng thiếu fileId/fileUrl.'
      );
      continue;
    }

    var responseId =
      String(
        rowValues[responseIdColumn.columnIndex - 1] ||
        kidlearnV3_4e5aDeepFindValue_(
          meta,
          ['responseId', 'responseid']
        ) ||
        ''
      ).trim();

    var childId =
      kidlearnV3_4e5aResolveField_(
        rowObject,
        meta,
        [
          'childId',
          'childid',
          'studentId',
          'studentid'
        ]
      ) || '';

    var lessonId =
      kidlearnV3_4e5aResolveField_(
        rowObject,
        meta,
        [
          'lessonId',
          'lessonid',
          'lessonKey'
        ]
      ) ||
      kidlearnV3_4e5aGuessLessonIdFromDrivePath_(
        asset.drivePath
      );

    var activityId =
      kidlearnV3_4e5aResolveField_(
        rowObject,
        meta,
        [
          'activityId',
          'activityid',
          'questionId',
          'questionid'
        ]
      ) || '';

    var subjectCode =
      kidlearnV3_4e5aResolveField_(
        rowObject,
        meta,
        [
          'subjectCode',
          'subjectKey',
          'subjectId',
          'subject'
        ]
      ) ||
      kidlearnV3_4e5aGuessSubjectFromLessonId_(
        lessonId
      );

    var childInfo =
      childMap[childId] || {};

    var item = {
      queueItemId:
        'HW_REVIEW_' + responseId,
      responseId:
        responseId,
      responseRowNumber:
        rowNumber,
      childId:
        childId,
      childName:
        childInfo.childName ||
        childInfo.displayName ||
        childId ||
        'Bé',
      lessonId:
        lessonId,
      activityId:
        activityId,
      subjectCode:
        subjectCode,
      subjectLabel:
        kidlearnV3_4e5aSubjectLabel_(
          subjectCode
        ),
      answerMode:
        meta.answerMode || 'HANDWRITE_INPUT',
      reviewStatus:
        reviewStatus ||
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.DEFAULT_PENDING_STATUS,
      handwritingAsset: {
        assetId:
          asset.assetId || '',
        fileId:
          asset.fileId || '',
        fileUrl:
          asset.fileUrl || '',
        fileName:
          asset.fileName || '',
        mimeType:
          asset.mimeType || 'image/png',
        drivePath:
          asset.drivePath || '',
        fileSizeBytes:
          asset.fileSizeBytes || '',
        createdAt:
          asset.createdAt || ''
      },
      handwritingReview: {
        status:
          review.status || asset.reviewStatus || '',
        parentReviewRequired:
          review.parentReviewRequired !== false,
        autoOcrEnabled:
          review.autoOcrEnabled === true,
        aiAutoGradingEnabled:
          review.aiAutoGradingEnabled === true,
        reviewedAt:
          review.reviewedAt || '',
        reviewedBy:
          review.reviewedBy || '',
        reviewerNote:
          review.reviewerNote || ''
      },
      uiActions: {
        canOpenDriveLink: true,
        canPreviewImageInlineNow: false,
        canAcceptNow: false,
        canRequestRetryNow: false,
        reviewWritePhase: '4E-5C'
      },
      metadata: {
        metadataColumn:
          metadataColumn.raw,
        metadataColumnIndex:
          metadataColumn.columnIndex,
        answerMetaPreview:
          kidlearnV3_4e5aPreviewValue_(
            metaText
          )
      },
      sortKey:
        asset.createdAt ||
        meta.updatedAt ||
        ''
    };

    items.push(item);

    if (items.length >= limit) {
      localWarnings.push(
        'Đã đạt giới hạn ' + limit + ' items. Có thể còn dữ liệu chưa hiển thị.'
      );
      break;
    }
  }

  items.sort(function (a, b) {
    return String(b.sortKey || '').localeCompare(
      String(a.sortKey || '')
    );
  });

  return {
    success: true,
    sheetName: 'DATA_Responses',
    headerInfo: {
      headerRowIndex:
        headerInfo.headerRowIndex,
      dataStartRowIndex:
        headerInfo.dataStartRowIndex,
      lastRow:
        headerInfo.lastRow,
      lastColumn:
        headerInfo.lastColumn
    },
    metadataColumn:
      metadataColumn,
    responseIdColumn:
      responseIdColumn,
    scannedRowCount:
      values.length,
    itemCount:
      items.length,
    items:
      items,
    errorCount:
      0,
    warningCount:
      kidlearnV3_4e5aUniqueArray_(localWarnings).length,
    errors:
      [],
    warnings:
      kidlearnV3_4e5aUniqueArray_(localWarnings)
  };
}


/**
 * Build child map from DATA_Children.
 */
function kidlearnV3_4e5aBuildChildMap_(spreadsheet, warnings) {
  warnings = warnings || [];

  var map = {};

  var sheet =
    kidlearnV3_4e5aGetSheetByExactName_(
      spreadsheet,
      'DATA_Children'
    );

  if (!sheet) {
    warnings.push(
      'Không tìm thấy DATA_Children. Review Queue sẽ dùng childId thay tên bé.'
    );
    return map;
  }

  var headerInfo =
    kidlearnV3_4e5aInspectSheetHeaders_(
      spreadsheet,
      'DATA_Children',
      warnings
    );

  if (!headerInfo.exists || headerInfo.headers.length === 0) {
    warnings.push(
      'DATA_Children chưa có header hợp lệ.'
    );
    return map;
  }

  var childIdColumn =
    kidlearnV3_4e5aFindHeaderMatch_(
      headerInfo.headers || [],
      [
        'childId',
        'childid',
        'id',
        'studentId',
        'learnerId'
      ]
    );

  var childNameColumn =
    kidlearnV3_4e5aFindHeaderMatch_(
      headerInfo.headers || [],
      [
        'childName',
        'displayName',
        'fullName',
        'name',
        'nickname',
        'tenBe',
        'hoTen'
      ]
    );

  if (!childIdColumn) {
    warnings.push(
      'DATA_Children không map được childId.'
    );
    return map;
  }

  var startRow =
    headerInfo.dataStartRowIndex || headerInfo.headerRowIndex + 1;

  var lastRow =
    sheet.getLastRow();

  if (lastRow < startRow) {
    return map;
  }

  var values =
    sheet
      .getRange(
        startRow,
        1,
        lastRow - startRow + 1,
        sheet.getLastColumn()
      )
      .getValues();

  for (var i = 0; i < values.length; i++) {
    var row =
      values[i];

    var childId =
      String(row[childIdColumn.columnIndex - 1] || '').trim();

    if (!childId) continue;

    var childName =
      childNameColumn
        ? String(row[childNameColumn.columnIndex - 1] || '').trim()
        : childId;

    map[childId] = {
      childId:
        childId,
      childName:
        childName,
      displayName:
        childName
    };
  }

  return map;
}


/**
 * Stats.
 */
function kidlearnV3_4e5aBuildStats_(items) {
  var statsByStatus = {};
  var pendingCount = 0;

  for (var i = 0; i < items.length; i++) {
    var status =
      String(items[i].reviewStatus || 'UNKNOWN').toUpperCase();

    if (!statsByStatus[status]) {
      statsByStatus[status] = 0;
    }

    statsByStatus[status]++;

    if (
      kidlearnV3_4e5aIsPendingReviewStatus_(status)
    ) {
      pendingCount++;
    }
  }

  return {
    pendingCount:
      pendingCount,
    statsByStatus:
      statsByStatus
  };
}


/**
 * Status helpers.
 */
function kidlearnV3_4e5aIsPendingReviewStatus_(status) {
  status =
    String(status || '').trim().toUpperCase();

  var allowed =
    KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.PENDING_STATUSES;

  for (var i = 0; i < allowed.length; i++) {
    if (status === String(allowed[i]).toUpperCase()) {
      return true;
    }
  }

  return false;
}


/**
 * Field resolve helpers.
 */
function kidlearnV3_4e5aResolveField_(rowObject, meta, aliases) {
  rowObject = rowObject || {};
  meta = meta || {};

  for (var i = 0; i < aliases.length; i++) {
    var key =
      kidlearnV3_4e5aNormalizeLookupKey_(aliases[i]);

    for (var rawKey in rowObject) {
      if (!rowObject.hasOwnProperty(rawKey)) continue;

      if (
        kidlearnV3_4e5aNormalizeLookupKey_(rawKey) === key &&
        rowObject[rawKey]
      ) {
        return String(rowObject[rawKey]).trim();
      }
    }
  }

  return kidlearnV3_4e5aDeepFindValue_(
    meta,
    aliases
  );
}


function kidlearnV3_4e5aDeepFindValue_(obj, aliases) {
  var aliasMap = {};

  for (var i = 0; i < aliases.length; i++) {
    aliasMap[
      kidlearnV3_4e5aNormalizeLookupKey_(aliases[i])
    ] = true;
  }

  return kidlearnV3_4e5aDeepFindValueInternal_(
    obj,
    aliasMap,
    0
  );
}


function kidlearnV3_4e5aDeepFindValueInternal_(obj, aliasMap, depth) {
  if (!obj || typeof obj !== 'object') return '';

  if (depth > 5) return '';

  for (var key in obj) {
    if (!obj.hasOwnProperty(key)) continue;

    if (
      aliasMap[
        kidlearnV3_4e5aNormalizeLookupKey_(key)
      ] &&
      obj[key] !== null &&
      obj[key] !== undefined &&
      typeof obj[key] !== 'object'
    ) {
      return String(obj[key]).trim();
    }
  }

  for (var key2 in obj) {
    if (!obj.hasOwnProperty(key2)) continue;

    if (obj[key2] && typeof obj[key2] === 'object') {
      var found =
        kidlearnV3_4e5aDeepFindValueInternal_(
          obj[key2],
          aliasMap,
          depth + 1
        );

      if (found) return found;
    }
  }

  return '';
}


function kidlearnV3_4e5aGuessLessonIdFromDrivePath_(drivePath) {
  var text =
    String(drivePath || '');

  var parts =
    text.split('/');

  if (parts.length >= 2) {
    return parts[parts.length - 2] || '';
  }

  return '';
}


function kidlearnV3_4e5aGuessSubjectFromLessonId_(lessonId) {
  var text =
    String(lessonId || '').toUpperCase();

  if (text.indexOf('MATH') >= 0) return 'MATH';
  if (text.indexOf('TV') >= 0 || text.indexOf('VIET') >= 0) return 'VIETNAMESE';
  if (text.indexOf('ENG') >= 0) return 'ENGLISH';
  if (text.indexOf('SCI') >= 0) return 'SCIENCE';

  return '';
}


function kidlearnV3_4e5aSubjectLabel_(subjectCode) {
  var key =
    String(subjectCode || '').toUpperCase();

  if (key === 'MATH') return 'Toán học';
  if (key === 'VIETNAMESE' || key === 'TV') return 'Tiếng Việt';
  if (key === 'ENGLISH' || key === 'ENG') return 'Tiếng Anh';
  if (key === 'SCIENCE' || key === 'SCI') return 'Khoa học';

  return subjectCode || '';
}


/**
 * Header helpers.
 */
function kidlearnV3_4e5aInspectSheetHeaders_(spreadsheet, sheetName, warnings) {
  warnings = warnings || [];

  if (
    typeof kidlearnV3_4e4InspectSheetHeaders_ === 'function'
  ) {
    return kidlearnV3_4e4InspectSheetHeaders_(
      spreadsheet,
      sheetName,
      warnings
    );
  }

  if (
    typeof kidlearnV3_4e3InspectSheetHeaders_ === 'function'
  ) {
    return kidlearnV3_4e3InspectSheetHeaders_(
      spreadsheet,
      sheetName,
      warnings
    );
  }

  var sheet =
    kidlearnV3_4e5aGetSheetByExactName_(
      spreadsheet,
      sheetName
    );

  if (!sheet) {
    return {
      exists: false,
      sheetName: sheetName,
      headerRowIndex: 0,
      dataStartRowIndex: 0,
      lastRow: 0,
      lastColumn: 0,
      headers: []
    };
  }

  var lastRow =
    sheet.getLastRow();

  var lastColumn =
    sheet.getLastColumn();

  if (lastRow < 1 || lastColumn < 1) {
    return {
      exists: true,
      sheetName: sheetName,
      headerRowIndex: 1,
      dataStartRowIndex: 2,
      lastRow: lastRow,
      lastColumn: lastColumn,
      headers: []
    };
  }

  var values =
    sheet
      .getRange(1, 1, Math.min(2, lastRow), lastColumn)
      .getValues();

  var headerRowIndex = 1;

  if (
    values.length > 1 &&
    kidlearnV3_4e5aHeaderScore_(values[1]) >=
      kidlearnV3_4e5aHeaderScore_(values[0]) &&
    kidlearnV3_4e5aHeaderScore_(values[1]) >= 3
  ) {
    headerRowIndex = 2;
  }

  var row =
    values[headerRowIndex - 1] || [];

  var headers = [];

  for (var i = 0; i < row.length; i++) {
    var raw =
      String(row[i] || '').trim();

    if (!raw) continue;

    headers.push({
      columnIndex:
        i + 1,
      raw:
        raw,
      normalized:
        kidlearnV3_4e5aNormalizeLookupKey_(raw)
    });
  }

  return {
    exists: true,
    sheetName:
      sheetName,
    headerRowIndex:
      headerRowIndex,
    dataStartRowIndex:
      headerRowIndex + 1,
    lastRow:
      lastRow,
    lastColumn:
      lastColumn,
    headers:
      headers
  };
}


function kidlearnV3_4e5aHeaderScore_(row) {
  var score = 0;

  for (var i = 0; i < row.length; i++) {
    var value =
      String(row[i] || '').trim();

    if (/^[a-zA-Z][a-zA-Z0-9_]*$/.test(value)) {
      score++;
    }
  }

  return score;
}


function kidlearnV3_4e5aFindHeaderMatch_(headers, aliases) {
  var map = {};

  for (var i = 0; i < aliases.length; i++) {
    map[
      kidlearnV3_4e5aNormalizeLookupKey_(aliases[i])
    ] = true;
  }

  for (var j = 0; j < headers.length; j++) {
    if (map[headers[j].normalized]) {
      return headers[j];
    }
  }

  return null;
}


function kidlearnV3_4e5aBuildRowObjectByHeader_(headerInfo, rowValues) {
  var obj = {};
  var headers =
    headerInfo.headers || [];

  for (var i = 0; i < headers.length; i++) {
    obj[headers[i].raw] =
      rowValues[headers[i].columnIndex - 1] || '';
  }

  return obj;
}


/**
 * Spreadsheet helpers.
 */
function kidlearnV3_4e5aOpenSpreadsheet_() {
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


function kidlearnV3_4e5aGetSheetByExactName_(spreadsheet, sheetName) {
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
 * DEV safety.
 */
function kidlearnV3_4e5aCheckDevSafety_() {
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
function kidlearnV3_4e5aNormalizeLookupKey_(value) {
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


function kidlearnV3_4e5aPreviewValue_(value) {
  var text =
    String(value === null || value === undefined ? '' : value);

  if (text.length > 220) {
    return text.substring(0, 220) + '...';
  }

  return text;
}


function kidlearnV3_4e5aSafeJsonParse_(text) {
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


function kidlearnV3_4e5aUniqueArray_(items) {
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


function kidlearnV3_4e5aObjectKeyCount_(obj) {
  var count = 0;

  obj = obj || {};

  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      count++;
    }
  }

  return count;
}


function kidlearnV3_4e5aSafeCall_(functionName) {
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

    var output =
      eval(functionName)();

    return {
      success:
        output && output.success === true,
      functionName:
        functionName,
      message:
        output && output.success === true
          ? ''
          : JSON.stringify(output),
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


function kidlearnV3_4e5aGetCurrentStatus_() {
  return (
    PropertiesService
      .getScriptProperties()
      .getProperty(
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_KEYS.STATUS
      ) ||
    KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_STATUS.NOT_RUN
  );
}


function kidlearnV3_4e5aResolveStatusAfterCheck_(statusBefore, proposedStatus) {
  if (
    statusBefore ===
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_STATUS.READY_FOR_4E_5B &&
    proposedStatus !==
      KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_STATUS.FAILED
  ) {
    return KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_STATUS.READY_FOR_4E_5B;
  }

  return proposedStatus;
}


function kidlearnV3_4e5aSaveStatus_(result, status, dateKey) {
  var properties =
    PropertiesService.getScriptProperties();

  properties.setProperty(
    KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_KEYS.STATUS,
    status
  );

  if (dateKey) {
    properties.setProperty(
      dateKey,
      new Date().toISOString()
    );
  }

  properties.setProperty(
    KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_KEYS.LAST_RESULT_JSON,
    JSON.stringify({
      success:
        result.success,
      action:
        result.action,
      phase:
        result.phase ||
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.PHASE,
      parentPhase:
        result.parentPhase ||
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.PARENT_PHASE,
      status:
        status,
      contextName:
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.CONTEXT_NAME,
      nextBundle:
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.NEXT_BUNDLE,
      nextStage:
        KIDLEARN_V3_PARENT_REVIEW_QUEUE_4E5A_CONFIG.NEXT_STAGE,
      itemCount:
        result.reviewQueue ? result.reviewQueue.itemCount : result.itemCount || 0,
      pendingCount:
        result.reviewQueue ? result.reviewQueue.pendingCount : result.pendingCount || 0,
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


function kidlearnV3_4e5aReadJsonProperty_(key) {
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
 * 4E-5A-P1
 * Flexible prerequisite check for Parent Review Queue.
 *
 * Valid cases:
 * - Phase 4E already locked.
 * - 4E-4 current state is valid after review.
 * - 4E-5C review action is ready.
 * - Old 4E-4 NEEDS_REVIEW state is still valid.
 */
function kidlearnV3_4e5aCheckReviewQueuePrerequisite4E5AP1_() {
  var checks = [
    {
      name: 'kidlearnV3_assertPhase4EClosedLockedV3',
      label: 'Phase 4E closed locked'
    },
    {
      name: 'kidlearnV3_assertHandwritingAssetLinkCurrentState4E6P2V3',
      label: '4E-4 current state after review'
    },
    {
      name: 'kidlearnV3_assertHandwritingReviewAction4E5CReadyV3',
      label: '4E-5C review action ready'
    },
    {
      name: 'kidlearnV3_assertHandwritingAssetLink4E4ReadyV3',
      label: '4E-4 original NEEDS_REVIEW ready'
    }
  ];

  var attempts = [];

  for (var i = 0; i < checks.length; i++) {
    var call =
      kidlearnV3_4e5aSafeCall_(
        checks[i].name
      );

    attempts.push({
      functionName:
        checks[i].name,
      label:
        checks[i].label,
      success:
        call.success === true,
      message:
        call.message || ''
    });

    if (call.success === true) {
      return {
        success: true,
        action: 'CHECK_REVIEW_QUEUE_PREREQUISITE_4E_5A_P1',
        phase: '4E-5A',
        method:
          checks[i].name,
        label:
          checks[i].label,
        message:
          'OK',
        attempts:
          attempts
      };
    }
  }

  return {
    success: false,
    action: 'CHECK_REVIEW_QUEUE_PREREQUISITE_4E_5A_P1',
    phase: '4E-5A',
    method: '',
    label: '',
    message:
      'Không có prerequisite nào pass. Có thể 4E chưa hoàn tất hoặc helper current state chưa được dán.',
    attempts:
      attempts
  };
}