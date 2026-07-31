/**
 * API_SystemConfig.gs
 * XỬ LÝ CẤU HÌNH HỆ THỐNG VÀ DANH MỤC ĐỘNG (THIET_LAP & DANH_MUC)
 * Tuân thủ Master GAS OS V8.1 Playbooks [FILE 1 - Mục 5.1 & FILE 4 - Service 07]
 */

/**
 * Lấy cấu hình hệ thống từ Sheet Thiet_Lap (Sử dụng CacheManager)
 * Cache dữ liệu trong 6 giờ để tăng tốc độ tải ứng dụng
 */
function api_getSystemSettings() {
  try {
    var cacheKey = "SYSTEM_SETTINGS_CACHE";
    var cachedSettings = CacheManager.get(cacheKey);

    if (cachedSettings) {
      return ApiResponse.success(cachedSettings, "Tải cấu hình từ Cache thành công.");
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Thiet_Lap");
    if (!sheet) {
      return ApiResponse.error("Sheet Thiet_Lap chưa tồn tại.", "", "ERR_NOT_FOUND");
    }

    var rawData = sheet.getDataRange().getValues();
    var configObjects = Utils_System.sheetValuesToObjects(rawData);
    rawData = null;

    var configMap = {};
    for (var i = 0; i < configObjects.length; i++) {
      var item = configObjects[i];
      if (item.key) {
        configMap[item.key] = item.value;
      }
    }

    // Lưu vào bộ nhớ đệm
    CacheManager.set(cacheKey, configMap, 21600);

    return ApiResponse.success(configMap, "Tải cấu hình hệ thống thành công.");
  } catch (e) {
    return ApiResponse.error("Lỗi khi tải cấu hình hệ thống.", e.toString(), "ERR_SYSTEM");
  }
}

/**
 * Lấy danh sách Dropdown danh mục động cho Frontend từ Sheet Danh_Muc
 * @param {Object} payload - { categoryType: "Môn học" } (Tùy chọn)
 */
function api_getCategories(payload) {
  try {
    var categoryType = payload && payload.categoryType ? payload.categoryType : null;
    var cacheKey = "CATEGORIES_CACHE_" + (categoryType || "ALL");
    
    var cachedData = CacheManager.get(cacheKey);
    if (cachedData) {
      return ApiResponse.success(cachedData, "Tải danh mục từ Cache.");
    }

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Danh_Muc");
    if (!sheet) {
      return ApiResponse.error("Sheet Danh_Muc không tồn tại.", "", "ERR_NOT_FOUND");
    }

    var rawData = sheet.getDataRange().getValues();
    var allCategories = Utils_System.sheetValuesToObjects(rawData);
    rawData = null;

    var filteredList = [];
    for (var i = 0; i < allCategories.length; i++) {
      var cat = allCategories[i];
      if (cat.isActive === true || cat.isActive === "TRUE" || cat.isActive === "Active") {
        if (!categoryType || cat.categoryType === categoryType) {
          filteredList.push(cat);
        }
      }
    }

    // Cache kết quả trong 6 giờ
    CacheManager.set(cacheKey, filteredList, 21600);

    return ApiResponse.success(filteredList, "Tải danh sách danh mục thành công.");
  } catch (e) {
    return ApiResponse.error("Lỗi khi truy xuất danh mục.", e.toString(), "ERR_SYSTEM");
  }
}

/**
 * Làm mới (Clear) Cache của Cấu hình và Danh mục khi Admin cập nhật dữ liệu gốc
 * @param {Object} payload - { token: "..." }
 */
function api_refreshSystemCache(payload) {
  try {
    var authCheck = internal_verifyToken(payload ? payload.token : null, "Admin");
    if (!authCheck.isValid) {
      return ApiResponse.error(authCheck.message, "", "ERR_UNAUTHORIZED");
    }

    CacheManager.invalidate("SYSTEM_SETTINGS_CACHE");
    CacheManager.invalidate("CATEGORIES_CACHE_ALL");

    AuditLogger.log(authCheck.user.email, "REFRESH_CACHE", "SYSTEM", { status: "Cache Invalidated" });

    return ApiResponse.success(null, "Đã làm mới bộ nhớ đệm hệ thống thành công!");
  } catch (e) {
    return ApiResponse.error("Lỗi khi xóa Cache.", e.toString(), "ERR_SYSTEM");
  }
}