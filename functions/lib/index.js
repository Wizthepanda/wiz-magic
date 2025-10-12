"use strict";
/**
 * Firebase Cloud Functions - WIZ Platform
 * Production XP System with YouTube API Integration
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseCommunityAccess = exports.closeWatchSession = exports.sendWatchEvents = exports.startWatchSession = exports.nowPaymentsTipWebhook = exports.getNowPaymentsStatus = exports.createNowPaymentsPayment = exports.getNowPaymentsEstimate = exports.getNowPaymentsMinAmount = exports.getNowPaymentsCurrencies = exports.getWizLeaderboard = exports.wizDailyReset = exports.getWizXPData = exports.awardWizSubscriptionXP = exports.awardWizReferralXP = exports.awardWizShareXP = exports.awardWatchXP = exports.awardWizXP = exports.checkYouTubeStatus = exports.fetchYouTubeVideos = exports.exchangeYouTubeCode = exports.initializeYouTubeOAuth = exports.exchangeYouTubeToken = exports.initializeYouTubeTracking = exports.dailyYouTubeProfileSync = exports.dailyYouTubeSync = exports.syncYouTubeHistory = exports.dailyReset = exports.awardReferralXP = exports.awardShareXP = exports.awardXP = void 0;
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
// Export YouTube token exchange function
var youtube_token_exchange_1 = require("./youtube-token-exchange");
Object.defineProperty(exports, "exchangeYouTubeToken", { enumerable: true, get: function () { return youtube_token_exchange_1.exchangeYouTubeToken; } });
// Export new YouTube OAuth popup flow functions
var youtube_oauth_popup_1 = require("./youtube-oauth-popup");
Object.defineProperty(exports, "initializeYouTubeOAuth", { enumerable: true, get: function () { return youtube_oauth_popup_1.initializeYouTubeOAuth; } });
Object.defineProperty(exports, "exchangeYouTubeCode", { enumerable: true, get: function () { return youtube_oauth_popup_1.exchangeYouTubeCode; } });
Object.defineProperty(exports, "fetchYouTubeVideos", { enumerable: true, get: function () { return youtube_oauth_popup_1.fetchYouTubeVideos; } });
Object.defineProperty(exports, "checkYouTubeStatus", { enumerable: true, get: function () { return youtube_oauth_popup_1.checkYouTubeStatus; } });
// Export new WIZ XP system functions (milder progression curve)
var wiz_xp_functions_1 = require("./wiz-xp-functions");
Object.defineProperty(exports, "awardWizXP", { enumerable: true, get: function () { return wiz_xp_functions_1.awardWizXP; } });
Object.defineProperty(exports, "awardWatchXP", { enumerable: true, get: function () { return wiz_xp_functions_1.awardWatchXP; } });
Object.defineProperty(exports, "awardWizShareXP", { enumerable: true, get: function () { return wiz_xp_functions_1.awardWizShareXP; } });
Object.defineProperty(exports, "awardWizReferralXP", { enumerable: true, get: function () { return wiz_xp_functions_1.awardWizReferralXP; } });
Object.defineProperty(exports, "awardWizSubscriptionXP", { enumerable: true, get: function () { return wiz_xp_functions_1.awardWizSubscriptionXP; } });
Object.defineProperty(exports, "getWizXPData", { enumerable: true, get: function () { return wiz_xp_functions_1.getWizXPData; } });
Object.defineProperty(exports, "wizDailyReset", { enumerable: true, get: function () { return wiz_xp_functions_1.wizDailyReset; } });
Object.defineProperty(exports, "getWizLeaderboard", { enumerable: true, get: function () { return wiz_xp_functions_1.getWizLeaderboard; } });
// Export NowPayments tipping functions
var nowpayments_functions_1 = require("./nowpayments-functions");
Object.defineProperty(exports, "getNowPaymentsCurrencies", { enumerable: true, get: function () { return nowpayments_functions_1.getNowPaymentsCurrencies; } });
Object.defineProperty(exports, "getNowPaymentsMinAmount", { enumerable: true, get: function () { return nowpayments_functions_1.getNowPaymentsMinAmount; } });
Object.defineProperty(exports, "getNowPaymentsEstimate", { enumerable: true, get: function () { return nowpayments_functions_1.getNowPaymentsEstimate; } });
Object.defineProperty(exports, "createNowPaymentsPayment", { enumerable: true, get: function () { return nowpayments_functions_1.createNowPaymentsPayment; } });
Object.defineProperty(exports, "getNowPaymentsStatus", { enumerable: true, get: function () { return nowpayments_functions_1.getNowPaymentsStatus; } });
Object.defineProperty(exports, "nowPaymentsTipWebhook", { enumerable: true, get: function () { return nowpayments_functions_1.nowPaymentsTipWebhook; } });
// Export Anti-Cheat System functions
var anti_cheat_system_1 = require("./anti-cheat-system");
Object.defineProperty(exports, "startWatchSession", { enumerable: true, get: function () { return anti_cheat_system_1.startWatchSession; } });
Object.defineProperty(exports, "sendWatchEvents", { enumerable: true, get: function () { return anti_cheat_system_1.sendWatchEvents; } });
Object.defineProperty(exports, "closeWatchSession", { enumerable: true, get: function () { return anti_cheat_system_1.closeWatchSession; } });
// Export Community Purchase function
var purchaseCommunityAccess_1 = require("./purchaseCommunityAccess");
Object.defineProperty(exports, "purchaseCommunityAccess", { enumerable: true, get: function () { return purchaseCommunityAccess_1.purchaseCommunityAccess; } });
//# sourceMappingURL=index.js.map