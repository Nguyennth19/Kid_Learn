/**
 * API_Core.gs
 * BỘ LÕI BACKEND HỆ THỐNG (CORE SERVICES)
 * Tuân thủ Master GAS OS V8.1 Playbooks [FILE 1 & FILE 4]
 */

/**
 * 1. LockWrapper - Trình bọc khóa đồng thời (Atomic Lock Pattern)
 * Ngăn chặn tuyệt đối tình trạng ghi đè dữ liệu khi nhiều người dùng cùng thao tác.
 * Tuân thủ [FILE 4 - Service 08] & [FILE 1 - Mục 2.1]
 */
var LockWrapper = {
  execute: function(taskName, callback) {
    var lock = LockService.getScriptLock();
    try {
      // FIX LỖI: Đổi waitLock thành tryLock để nhận về kết quả boolean (true/false)
      var acquired = lock.tryLock(30000);
      if (!acquired) {
        throw new Error('Hệ thống đang bận xử lý tác vụ khác. Vui lòng thử lại sau giây lát.');
      }
      var result = callback();
      return result;
    } catch (e) {
      Logger.log('[LockWrapper Error] ' + taskName + ': ' + e.toString());
      throw e;
    } finally {
      SpreadsheetApp.flush();
      lock.releaseLock();
    }
  }
};

/**
 * 2. CacheManager - Trình quản lý Bộ nhớ đệm (Cache-as-a-Database Pattern)
 * Giảm thiểu truy vấn trực tiếp vào Google Sheets đối với dữ liệu cấu hình/danh mục.
 * Tuân thủ [FILE 4 - Service 07] & [FILE 1 - Mục 5.1]
 */
var CacheManager = {
  DEFAULT_TTL: 21600, // Time-to-live mặc định: 6 giờ (tính bằng giây)

  get: function(key) {
    try {
      var cache = CacheService.getScriptCache();
      var cachedData = cache.get(key);
      if (!cachedData) return null;
      return JSON.parse(cachedData);
    } catch (e) {
      Logger.log('[CacheManager.get Error] Key: ' + key + ' | ' + e.toString());
      return null;
    }
  },

  set: function(key, data, ttlInSeconds) {
    try {
      var cache = CacheService.getScriptCache();
      var ttl = ttlInSeconds || this.DEFAULT_TTL;
      var serialized = JSON.stringify(data);
      
      // Kiểm tra an toàn ngưỡng dung lượng 100KB của CacheService
      if (serialized.length > 90000) {
        Logger.log('[CacheManager.set Warning] Dữ liệu quá lớn (>90KB) không thể lưu Cache cho key: ' + key);
        return false;
      }
      cache.put(key, serialized, ttl);
      return true;
    } catch (e) {
      Logger.log('[CacheManager.set Error] Key: ' + key + ' | ' + e.toString());
      return false;
    }
  },

  invalidate: function(key) {
    try {
      var cache = CacheService.getScriptCache();
      cache.remove(key);
      return true;
    } catch (e) {
      Logger.log('[CacheManager.invalidate Error] Key: ' + key + ' | ' + e.toString());
      return false;
    }
  }
};

/**
 * 3. ApiResponse - Chuẩn hóa định dạng phản hồi JSON gửi về Client
 * Tuân thủ [FILE 1 - Mục 9.1]
 */
var ApiResponse = {
  success: function(data, message) {
    return {
      success: true,
      data: data !== undefined ? data : null,
      message: message || 'Thao tác thành công.',
      devLog: '',
      errorCode: ''
    };
  },

  error: function(message, devLog, errorCode) {
    return {
      success: false,
      data: null,
      message: message || 'Có lỗi xảy ra trong quá trình xử lý.',
      devLog: devLog || '',
      errorCode: errorCode || 'ERR_SYSTEM'
    };
  }
};

/**
 * 4. AuditLogger - Nhật ký kiểm toán hệ thống
 * Ghi vết toàn bộ hành động GHI / SỬA / XÓA vào Sheet Log_HeThong.
 * Tuân thủ [FILE 1 - Mục 8.1 & 8.2]
 */
var AuditLogger = {
  log: function(userEmail, action, moduleName, details) {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var logSheet = ss.getSheetByName("Log_HeThong");
      
      if (!logSheet) {
        logSheet = ss.insertSheet("Log_HeThong");
        logSheet.appendRow(["Thời Gian", "Email Người Dùng", "Hành Động", "Module", "Chi Tiết (JSON)"]);
        logSheet.appendRow(["timestamp", "userEmail", "action", "module", "details"]);
      }
      
      var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
      var email = userEmail || Session.getActiveUser().getEmail() || "Anonymous/System";
      var detailsJson = typeof details === "object" ? JSON.stringify(details) : String(details || "");
      
      logSheet.appendRow([timestamp, email, action, moduleName, detailsJson]);
    } catch (e) {
      Logger.log('[AuditLogger Error] Không thể ghi Log hệ thống: ' + e.toString());
    }
  }
};