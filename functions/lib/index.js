"use strict";
/**
 * Firebase Cloud Functions - WIZ Platform
 * Production XP System with YouTube API Integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWizLeaderboard = exports.wizDailyReset = exports.getWizXPData = exports.awardWizReferralXP = exports.awardWizShareXP = exports.awardWatchXP = exports.awardWizXP = exports.initializeYouTubeTracking = exports.dailyYouTubeProfileSync = exports.dailyYouTubeSync = exports.syncYouTubeHistory = exports.dailyReset = exports.awardReferralXP = exports.awardShareXP = exports.awardXP = void 0;
const app_1 = require("firebase-admin/app");
// Initialize Firebase Admin SDK
if ((0, app_1.getApps)().length === 0) {
    (0, app_1.initializeApp)();
}
// Export existing XP system functions
var xp_system_1 = require("./xp-system");
Object.defineProperty(exports, "awardXP", { enumerable: true, get: function () { return xp_system_1.awardXP; } });
Object.defineProperty(exports, "awardShareXP", { enumerable: true, get: function () { return xp_system_1.awardShareXP; } });
Object.defineProperty(exports, "awardReferralXP", { enumerable: true, get: function () { return xp_system_1.awardReferralXP; } });
Object.defineProperty(exports, "dailyReset", { enumerable: true, get: function () { return xp_system_1.dailyReset; } });
// Export new YouTube integration functions  
var youtube_xp_functions_1 = require("./youtube-xp-functions");
Object.defineProperty(exports, "syncYouTubeHistory", { enumerable: true, get: function () { return youtube_xp_functions_1.syncYouTubeHistory; } });
Object.defineProperty(exports, "dailyYouTubeSync", { enumerable: true, get: function () { return youtube_xp_functions_1.dailyYouTubeSync; } });
Object.defineProperty(exports, "dailyYouTubeProfileSync", { enumerable: true, get: function () { return youtube_xp_functions_1.dailyYouTubeProfileSync; } });
Object.defineProperty(exports, "initializeYouTubeTracking", { enumerable: true, get: function () { return youtube_xp_functions_1.initializeYouTubeTracking; } });
// Export new WIZ XP system functions (milder progression curve)
var wiz_xp_functions_1 = require("./wiz-xp-functions");
Object.defineProperty(exports, "awardWizXP", { enumerable: true, get: function () { return wiz_xp_functions_1.awardWizXP; } });
Object.defineProperty(exports, "awardWatchXP", { enumerable: true, get: function () { return wiz_xp_functions_1.awardWatchXP; } });
Object.defineProperty(exports, "awardWizShareXP", { enumerable: true, get: function () { return wiz_xp_functions_1.awardWizShareXP; } });
Object.defineProperty(exports, "awardWizReferralXP", { enumerable: true, get: function () { return wiz_xp_functions_1.awardWizReferralXP; } });
Object.defineProperty(exports, "getWizXPData", { enumerable: true, get: function () { return wiz_xp_functions_1.getWizXPData; } });
Object.defineProperty(exports, "wizDailyReset", { enumerable: true, get: function () { return wiz_xp_functions_1.wizDailyReset; } });
Object.defineProperty(exports, "getWizLeaderboard", { enumerable: true, get: function () { return wiz_xp_functions_1.getWizLeaderboard; } });
//# sourceMappingURL=index.js.map