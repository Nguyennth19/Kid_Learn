/**
 * ================================================================
 * KIDLEARN DEV V3 - RUN3 GOLDEN QUESTION RUNTIME BRIDGE
 * Scope: B01-B05 ONLY
 * Mode: DEV / READ_ONLY / DRY_RUN
 * Version: V1
 * ================================================================
 *
 * Purpose
 * - Read STG_Questions for Golden Vietnamese lessons B01-B05.
 * - Build question render models for:
 *   SPEAKING / FREE_RESPONSE / SHORT_ANSWER.
 * - Simulate child interaction in memory only.
 * - Verify no Google Sheet row count changes.
 *
 * Hard guards
 * - NO writes to STG/MST/DATA/LOG.
 * - NO publish.
 * - NO approval mutation.
 * - NO pronunciation scoring or recording for SPEAKING.
 * - NO exact-score for open responses.
 */

var KIDLEARN_RUN3_GOLDEN_BRIDGE_V1 = {
  VERSION: 'RUN3_GOLDEN_QUESTION_RUNTIME_BRIDGE_B01_B05_V1',
  LESSON_CODES: ['B01', 'B02', 'B03', 'B04', 'B05'],
  ALLOWED_QUESTION_TYPES: {
    SPEAKING: true,
    FREE_RESPONSE: true,
    SHORT_ANSWER: true
  },
  EXPECTED_ITEMS_PER_LESSON: 30,
  EXPECTED_TOTAL_ITEMS: 150,
  READ_ONLY: true,
  DRY_RUN_ONLY: true,
  REAL_WRITE_ALLOWED: false
};


/**
 * Main Golden smoke entry point.
 *
 * PASS requires:
 * - 150 staging rows total
 * - 30 rows for each B01-B05
 * - valid renderer model for every item
 * - valid in-memory interaction simulation for every item
 * - no row count changes in any sheet
 */
function kidlearnV3_runRun3GoldenQuestionRuntimeBridgeSmokeB01B05V1() {
  var db = kidlearnV3_run3BridgeGetDatabase_();

  var before = kidlearnV3_run3BridgeSnapshotAllSheetRowCounts_(db);

  var rows = kidlearnV3_run3BridgeReadStagingQuestions_(db);
  var golden = kidlearnV3_run3BridgeSelectGoldenRows_(rows);

  var errors = [];
  var warnings = [];
  var models = [];
  var simulations = [];
  var byLesson = {};

  for (var i = 0; i < golden.length; i++) {
    var row = golden[i];
    var lessonCode = kidlearnV3_run3BridgeLessonCodeFromLessonId_(row.lessonId);

    byLesson[lessonCode] = (byLesson[lessonCode] || 0) + 1;

    var validation = kidlearnV3_run3BridgeValidateStagingRow_(row);
    if (!validation.success) {
      errors = errors.concat(validation.errors);
      continue;
    }

    var model = kidlearnV3_run3BridgeBuildRenderModelV1_(row);
    models.push(model);

    var simulation = kidlearnV3_run3BridgeSimulateInteractionV1_(model);
    simulations.push(simulation);

    if (!simulation.success) {
      errors = errors.concat(simulation.errors || []);
    }
  }

  for (var j = 0; j < KIDLEARN_RUN3_GOLDEN_BRIDGE_V1.LESSON_CODES.length; j++) {
    var code = KIDLEARN_RUN3_GOLDEN_BRIDGE_V1.LESSON_CODES[j];
    var count = Number(byLesson[code] || 0);

    if (count !== KIDLEARN_RUN3_GOLDEN_BRIDGE_V1.EXPECTED_ITEMS_PER_LESSON) {
      errors.push(
        code + ' expected 30 staging questions, found ' + count + '.'
      );
    }
  }

  if (golden.length !== KIDLEARN_RUN3_GOLDEN_BRIDGE_V1.EXPECTED_TOTAL_ITEMS) {
    errors.push(
      'Golden total expected 150, found ' + golden.length + '.'
    );
  }

  SpreadsheetApp.flush();

  var after = kidlearnV3_run3BridgeSnapshotAllSheetRowCounts_(db);
  var noWrite = kidlearnV3_run3BridgeCompareRowCountSnapshots_(before, after);

  if (!noWrite.success) {
    errors = errors.concat(noWrite.errors);
  }

  var result = {
    success: errors.length === 0,
    status: errors.length === 0
      ? 'PASS_GOLDEN_RUNTIME_BRIDGE_DRY_RUN'
      : 'FAIL_GOLDEN_RUNTIME_BRIDGE_DRY_RUN',
    version: KIDLEARN_RUN3_GOLDEN_BRIDGE_V1.VERSION,
    scope: 'B01-B05',
    readOnly: true,
    dryRunOnly: true,
    realWriteAllowed: false,
    goldenRowCount: golden.length,
    renderModelCount: models.length,
    simulationCount: simulations.length,
    byLesson: byLesson,
    questionTypeDistribution:
      kidlearnV3_run3BridgeCountBy_(models, 'questionType'),
    rendererModeDistribution:
      kidlearnV3_run3BridgeCountBy_(models, 'interactionMode'),
    noWriteCheck: noWrite,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors,
    warnings: warnings,
    guards: {
      stagingReadOnly: true,
      productionTouched: false,
      approvalChanged: false,
      publishAttempted: false,
      pronunciationScoringUsed: false,
      exactScoringUsed: false
    }
  };

  console.log(JSON.stringify(result, null, 2));

  if (!result.success) {
    throw new Error(
      'Run3 Golden Runtime Bridge smoke failed. Errors=' +
      errors.length +
      '. ' +
      errors.join(' | ')
    );
  }

  return result;
}


/**
 * Build one read-only renderer model from a STG_Questions row.
 */
function kidlearnV3_run3BridgeBuildRenderModelV1_(row) {
  var type = String(row.questionType || '').trim().toUpperCase();
  var rubric = kidlearnV3_run3BridgeParseJson_(row.draftRubricJson, {});
  var riskFlags = kidlearnV3_run3BridgeParseJson_(row.riskFlagsJson, []);

  var model = {
    stagingQuestionId: String(row.stagingQuestionId || ''),
    lessonId: String(row.lessonId || ''),
    primarySkillId: String(row.primarySkillId || ''),
    questionType: type,
    questionText: String(row.questionText || ''),
    instructions: String(row.instructions || ''),
    difficultyLevel: String(row.difficultyLevel || ''),
    estimatedSeconds: Number(row.estimatedSeconds || 0),
    sourceType: String(row.sourceType || ''),
    sourceReference: String(row.sourceReference || ''),
    provenance: String(rubric.provenance || ''),
    mechanismId: String(rubric.mechanismId || ''),
    subintentId: String(rubric.subintentId || ''),
    semanticClusterId: String(rubric.semanticClusterId || ''),
    familyId: String(rubric.familyId || ''),
    assessmentMode: String(rubric.assessmentMode || ''),
    gradingPolicy: String(rubric.gradingPolicy || ''),
    canonicalTruthEligible: rubric.canonicalTruthEligible === true,
    riskFlags: riskFlags,
    readOnlySource: true,
    stagingOnly: true
  };

  if (type === 'SPEAKING') {
    model.renderer = 'RUN3_SPEAKING_SELF_COMPLETE_V1';
    model.interactionMode = 'SELF_COMPLETE';
    model.responseControl = 'COMPLETE_BUTTON';
    model.recordingEnabled = false;
    model.pronunciationScoringEnabled = false;
    model.autoScoringEnabled = false;
    model.expectedSubmitPayload = {
      completed: true,
      responseText: ''
    };
    return model;
  }

  if (type === 'FREE_RESPONSE') {
    model.renderer = 'RUN3_FREE_RESPONSE_TEXTAREA_V1';
    model.interactionMode = 'TEXTAREA_SELF_COMPLETE';
    model.responseControl = 'TEXTAREA_PLUS_COMPLETE';
    model.autoScoringEnabled = false;
    model.exactScoringEnabled = false;
    model.expectedSubmitPayload = {
      completed: true,
      responseText: 'DEV_DRY_RUN_RESPONSE'
    };
    return model;
  }

  if (type === 'SHORT_ANSWER') {
    model.renderer = 'RUN3_SHORT_ANSWER_INPUT_V1';
    model.interactionMode = 'TEXT_INPUT_GUIDED';
    model.responseControl = 'TEXT_INPUT_PLUS_COMPLETE';
    model.autoScoringEnabled = false;
    model.exactScoringEnabled = false;
    model.expectedSubmitPayload = {
      completed: true,
      responseText: 'DEV_DRY_RUN_RESPONSE'
    };
    return model;
  }

  throw new Error(
    'Unsupported Run3 Golden questionType=' + type +
    ' for stagingQuestionId=' + row.stagingQuestionId
  );
}


/**
 * In-memory interaction simulation only.
 * No service calls, no DB writes.
 */
function kidlearnV3_run3BridgeSimulateInteractionV1_(model) {
  var errors = [];

  if (!model.stagingQuestionId) {
    errors.push('Missing stagingQuestionId.');
  }

  if (!model.lessonId) {
    errors.push(model.stagingQuestionId + ': missing lessonId.');
  }

  if (!model.primarySkillId) {
    errors.push(model.stagingQuestionId + ': missing primarySkillId.');
  }

  if (!model.questionText) {
    errors.push(model.stagingQuestionId + ': missing questionText.');
  }

  if (model.questionType === 'SPEAKING') {
    if (model.recordingEnabled !== false) {
      errors.push(model.stagingQuestionId + ': SPEAKING recording must stay disabled.');
    }

    if (model.pronunciationScoringEnabled !== false) {
      errors.push(model.stagingQuestionId + ': pronunciation scoring must stay disabled.');
    }

    if (model.autoScoringEnabled !== false) {
      errors.push(model.stagingQuestionId + ': SPEAKING auto scoring must stay disabled.');
    }
  }

  if (
    model.questionType === 'FREE_RESPONSE' ||
    model.questionType === 'SHORT_ANSWER'
  ) {
    if (model.exactScoringEnabled !== false) {
      errors.push(model.stagingQuestionId + ': exact scoring must stay disabled.');
    }
  }

  if (model.gradingPolicy !== 'NO_EXACT_SCORE_FOR_OPEN_RESPONSE') {
    errors.push(
      model.stagingQuestionId +
      ': invalid grading policy=' +
      model.gradingPolicy
    );
  }

  var states = [
    'READY',
    'ACTIVE',
    'RESPONSE_CAPTURED_IN_MEMORY',
    'SELF_COMPLETE_READY',
    'COMPLETE_DRY_RUN'
  ];

  return {
    success: errors.length === 0,
    stagingQuestionId: model.stagingQuestionId,
    questionType: model.questionType,
    renderer: model.renderer,
    interactionMode: model.interactionMode,
    stateTransitions: states,
    persisted: false,
    scored: false,
    errors: errors
  };
}


function kidlearnV3_run3BridgeValidateStagingRow_(row) {
  var errors = [];
  var id = String(row.stagingQuestionId || '');

  if (!id) {
    errors.push('Missing stagingQuestionId.');
  }

  if (String(row.subjectId || '') !== 'SUB_TV') {
    errors.push(id + ': subjectId must be SUB_TV.');
  }

  if (String(row.curriculumId || '') !== 'CUR_GRADE2_CORE_2026') {
    errors.push(id + ': curriculumId mismatch.');
  }

  if (!/^LES_TV2_B0[1-5]$/.test(String(row.lessonId || ''))) {
    errors.push(id + ': lessonId outside Golden B01-B05.');
  }

  if (!/^SKL_TV2_S\d{2}$/.test(String(row.primarySkillId || ''))) {
    errors.push(id + ': invalid primarySkillId.');
  }

  var qType = String(row.questionType || '').toUpperCase();
  if (!KIDLEARN_RUN3_GOLDEN_BRIDGE_V1.ALLOWED_QUESTION_TYPES[qType]) {
    errors.push(id + ': unsupported questionType=' + qType);
  }

  if (String(row.sourceType || '') !== 'AI_GENERATED') {
    errors.push(id + ': sourceType must be AI_GENERATED.');
  }

  if (
    String(row.sourceReference || '')
      .indexOf('PROJECT_ORIGINAL_ENRICHMENT') < 0
  ) {
    errors.push(id + ': missing PROJECT_ORIGINAL_ENRICHMENT provenance.');
  }

  if (String(row.validationStatus || '') !== 'NOT_CHECKED') {
    errors.push(id + ': validationStatus changed before Golden runtime smoke.');
  }

  if (String(row.approvalStatus || '') !== 'DRAFT') {
    errors.push(id + ': approvalStatus must remain DRAFT.');
  }

  if (String(row.publishedQuestionId || '')) {
    errors.push(id + ': publishedQuestionId must be blank.');
  }

  var rubric = kidlearnV3_run3BridgeParseJson_(row.draftRubricJson, null);
  if (!rubric) {
    errors.push(id + ': invalid draftRubricJson.');
  } else {
    if (rubric.provenance !== 'PROJECT_ORIGINAL_ENRICHMENT') {
      errors.push(id + ': rubric provenance mismatch.');
    }

    if (rubric.canonicalTruthEligible === true) {
      errors.push(id + ': Run3 must not be canonicalTruthEligible.');
    }

    if (rubric.gradingPolicy !== 'NO_EXACT_SCORE_FOR_OPEN_RESPONSE') {
      errors.push(id + ': open response grading policy mismatch.');
    }
  }

  return {
    success: errors.length === 0,
    errors: errors
  };
}


function kidlearnV3_run3BridgeSelectGoldenRows_(rows) {
  var allowed = {};
  for (var i = 0; i < KIDLEARN_RUN3_GOLDEN_BRIDGE_V1.LESSON_CODES.length; i++) {
    allowed[KIDLEARN_RUN3_GOLDEN_BRIDGE_V1.LESSON_CODES[i]] = true;
  }

  return rows.filter(function(row) {
    var code = kidlearnV3_run3BridgeLessonCodeFromLessonId_(row.lessonId);
    return allowed[code] === true;
  });
}


function kidlearnV3_run3BridgeReadStagingQuestions_(db) {
  var sheet = db.getSheetByName('STG_Questions');

  if (!sheet) {
    throw new Error('Missing STG_Questions sheet.');
  }

  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();

  if (lastRow < 3) {
    return [];
  }

  var keys = sheet
    .getRange(2, 1, 1, lastColumn)
    .getDisplayValues()[0];

  var values = sheet
    .getRange(3, 1, lastRow - 2, lastColumn)
    .getDisplayValues();

  var rows = [];

  for (var r = 0; r < values.length; r++) {
    var row = {};
    var hasValue = false;

    for (var c = 0; c < keys.length; c++) {
      var key = String(keys[c] || '').trim();
      if (!key) continue;

      row[key] = values[r][c];

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


function kidlearnV3_run3BridgeGetDatabase_() {
  if (typeof kidlearnV3_appGetActiveDatabaseV3_ !== 'function') {
    throw new Error('kidlearnV3_appGetActiveDatabaseV3_ is unavailable.');
  }

  var db = kidlearnV3_appGetActiveDatabaseV3_();

  if (!db) {
    throw new Error('DEV V3 active database is unavailable.');
  }

  return db;
}


function kidlearnV3_run3BridgeSnapshotAllSheetRowCounts_(db) {
  var sheets = db.getSheets();
  var snapshot = {};

  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    snapshot[sheet.getName()] = sheet.getLastRow();
  }

  return snapshot;
}


function kidlearnV3_run3BridgeCompareRowCountSnapshots_(before, after) {
  var errors = [];
  var names = {};

  Object.keys(before || {}).forEach(function(name) {
    names[name] = true;
  });

  Object.keys(after || {}).forEach(function(name) {
    names[name] = true;
  });

  Object.keys(names).sort().forEach(function(name) {
    var b = Number((before || {})[name] || 0);
    var a = Number((after || {})[name] || 0);

    if (a !== b) {
      errors.push(
        'Unexpected row-count change in ' +
        name +
        ': before=' + b +
        ', after=' + a
      );
    }
  });

  return {
    success: errors.length === 0,
    before: before,
    after: after,
    errors: errors
  };
}


function kidlearnV3_run3BridgeLessonCodeFromLessonId_(lessonId) {
  var match = String(lessonId || '').match(/LES_TV2_(B\d{2})/);
  return match ? match[1] : '';
}


function kidlearnV3_run3BridgeParseJson_(text, fallbackValue) {
  try {
    return JSON.parse(String(text || ''));
  } catch (error) {
    return fallbackValue;
  }
}


function kidlearnV3_run3BridgeCountBy_(items, key) {
  var out = {};

  for (var i = 0; i < items.length; i++) {
    var value = String(items[i][key] || '');
    out[value] = (out[value] || 0) + 1;
  }

  return out;
}
