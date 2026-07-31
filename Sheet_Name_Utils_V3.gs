/**
 * ================================================================
 * KIDLEARN V3 - SHEET NAME UTILITIES
 * ================================================================
 *
 * Tìm Sheet theo tên chính xác tuyệt đối.
 * Tránh nhầm Data_Users với DATA_Users.
 */


/**
 * Tìm Sheet theo tên chính xác tuyệt đối.
 */
function kidlearnV3_getSheetByExactName_(
  spreadsheet,
  exactName
) {
  var sheets = spreadsheet.getSheets();

  for (
    var i = 0;
    i < sheets.length;
    i++
  ) {
    if (
      sheets[i].getName() === exactName
    ) {
      return sheets[i];
    }
  }

  return null;
}


/**
 * Kiểm tra Sheet có tồn tại theo tên chính xác tuyệt đối.
 */
function kidlearnV3_hasExactSheetName_(
  spreadsheet,
  exactName
) {
  return (
    kidlearnV3_getSheetByExactName_(
      spreadsheet,
      exactName
    ) !== null
  );
}