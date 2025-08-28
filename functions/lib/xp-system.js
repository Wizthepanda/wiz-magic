"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dailyReset = exports.awardReferralXP = exports.awardShareXP = exports.awardXP = void 0;
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
// XP Configuration
const XP_CONFIG = {
    WATCH_XP_RATE: 0.1,
    DAILY_XP_CAP: 360,
    COMPLETION_BONUS: 0.1,
    COMPLETION_THRESHOLD: 0.9,
    BOOSTED_MULTIPLIER: 1.5,
    SHARE_XP: 20,
    REFERRAL_XP: 100,
    MAX_DAILY_SHARES: 5
};
// Level progression formula: exponential growth
function calculateLevel(totalXP) {
    // Level thresholds: 100, 250, 500, 1000, 2000, 4000, 8000, etc.
    let level = 1;
    let currentLevelXP = 0;
    let nextLevelXP = 100;
    while (totalXP >= nextLevelXP) {
        currentLevelXP = nextLevelXP;
        level++;
        nextLevelXP = Math.floor(100 * Math.pow(2.5, level - 1));
    }
    const xpInCurrentLevel = totalXP - currentLevelXP;
    const xpNeededForLevel = nextLevelXP - currentLevelXP;
    const progressToNext = xpNeededForLevel > 0 ? xpInCurrentLevel / xpNeededForLevel : 1;
    return {
        level,
        progressToNext,
        currentLevelXP,
        nextLevelXP
    };
}
exports.awardXP = (0, https_1.onCall)({
    cors: true,
    region: 'us-central1'
}, async (request) => {
    // Verify authentication
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { videoId, watchTime, completed, sessionId } = request.data;
    const userId = request.auth.uid;
    if (!videoId || typeof watchTime !== 'number' || watchTime <= 0) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid video data');
    }
    try {
        return await db.runTransaction(async (transaction) => {
            var _a;
            // Get current date for daily tracking
            const today = new Date().toISOString().split('T')[0];
            // Refs
            const userRef = db.collection('users').doc(userId);
            const videoRef = db.collection('videos').doc(videoId);
            const historyRef = db.collection('userVideoHistory').doc(`${userId}_${videoId}`);
            // Get documents
            const [userDoc, videoDoc, historyDoc] = await Promise.all([
                transaction.get(userRef),
                transaction.get(videoRef),
                transaction.get(historyRef)
            ]);
            if (!userDoc.exists) {
                throw new https_1.HttpsError('not-found', 'User not found');
            }
            if (!videoDoc.exists) {
                throw new https_1.HttpsError('not-found', 'Video not found');
            }
            const userData = userDoc.data();
            const videoData = videoDoc.data();
            const historyData = historyDoc.exists ? historyDoc.data() : null;
            // Initialize user XP data if missing
            const xpData = (userData === null || userData === void 0 ? void 0 : userData.xpData) || {
                totalXP: 0,
                currentLevel: 1,
                progressToNext: 0,
                dailyXP: 0,
                dailyCap: XP_CONFIG.DAILY_XP_CAP,
                streakCount: 0,
                lastActiveDate: '',
                sharesToday: 0,
                referralsCount: 0,
                boostedXP: 0
            };
            // Reset daily counters if new day
            if (xpData.lastActiveDate !== today) {
                // Check streak
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                if (xpData.lastActiveDate === yesterdayStr) {
                    xpData.streakCount += 1;
                }
                else if (xpData.lastActiveDate !== today) {
                    xpData.streakCount = 1; // Start new streak
                }
                xpData.dailyXP = 0;
                xpData.sharesToday = 0;
                xpData.lastActiveDate = today;
            }
            // Check daily cap
            if (xpData.dailyXP >= XP_CONFIG.DAILY_XP_CAP) {
                return {
                    success: true,
                    xpAwarded: 0,
                    reason: 'Daily XP cap reached',
                    xpData
                };
            }
            // Prevent double-counting same session
            if (historyData && historyData.sessionId === sessionId) {
                return {
                    success: true,
                    xpAwarded: 0,
                    reason: 'Session already processed',
                    xpData
                };
            }
            // Calculate base XP
            let baseXP = Math.floor(watchTime * XP_CONFIG.WATCH_XP_RATE);
            // Apply completion bonus
            if (completed) {
                baseXP += Math.floor(baseXP * XP_CONFIG.COMPLETION_BONUS);
            }
            // Apply boosted multiplier
            if (videoData === null || videoData === void 0 ? void 0 : videoData.boosted) {
                baseXP = Math.floor(baseXP * XP_CONFIG.BOOSTED_MULTIPLIER);
                xpData.boostedXP += baseXP - Math.floor(baseXP / XP_CONFIG.BOOSTED_MULTIPLIER);
            }
            // Apply daily cap
            const remainingCap = XP_CONFIG.DAILY_XP_CAP - xpData.dailyXP;
            const xpAwarded = Math.min(baseXP, remainingCap);
            if (xpAwarded <= 0) {
                return {
                    success: true,
                    xpAwarded: 0,
                    reason: 'No XP to award',
                    xpData
                };
            }
            // Update XP data
            xpData.totalXP += xpAwarded;
            xpData.dailyXP += xpAwarded;
            // Recalculate level and progress
            const levelData = calculateLevel(xpData.totalXP);
            xpData.currentLevel = levelData.level;
            xpData.progressToNext = levelData.progressToNext;
            // Update user document
            transaction.update(userRef, {
                xpData,
                updatedAt: firestore_1.FieldValue.serverTimestamp()
            });
            // Record watch history
            transaction.set(historyRef, {
                userId,
                videoId,
                watchTime: ((historyData === null || historyData === void 0 ? void 0 : historyData.watchTime) || 0) + watchTime,
                completed: completed || ((historyData === null || historyData === void 0 ? void 0 : historyData.completed) || false),
                xpAwarded: ((historyData === null || historyData === void 0 ? void 0 : historyData.xpAwarded) || 0) + xpAwarded,
                watchedAt: firestore_1.FieldValue.serverTimestamp(),
                sessionId
            });
            return {
                success: true,
                xpAwarded,
                totalXP: xpData.totalXP,
                level: xpData.currentLevel,
                progressToNext: xpData.progressToNext,
                dailyXP: xpData.dailyXP,
                streakCount: xpData.streakCount,
                leveledUp: levelData.level > (((_a = userData === null || userData === void 0 ? void 0 : userData.xpData) === null || _a === void 0 ? void 0 : _a.currentLevel) || 1)
            };
        });
    }
    catch (error) {
        console.error('Error awarding XP:', error);
        throw new https_1.HttpsError('internal', 'Failed to award XP');
    }
});
// Award XP for shares
exports.awardShareXP = (0, https_1.onCall)({ cors: true, region: 'us-central1' }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    // const videoId = request.data?.videoId; // Unused in this function
    const userId = request.auth.uid;
    const today = new Date().toISOString().split('T')[0];
    try {
        return await db.runTransaction(async (transaction) => {
            const userRef = db.collection('users').doc(userId);
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new https_1.HttpsError('not-found', 'User not found');
            }
            const userData = userDoc.data();
            const xpData = (userData === null || userData === void 0 ? void 0 : userData.xpData) || {};
            // Reset daily counter if new day
            if (xpData.lastActiveDate !== today) {
                xpData.sharesToday = 0;
                xpData.dailyXP = 0;
                xpData.lastActiveDate = today;
            }
            // Check daily share limit
            if (xpData.sharesToday >= XP_CONFIG.MAX_DAILY_SHARES) {
                return {
                    success: false,
                    reason: 'Daily share limit reached',
                    xpAwarded: 0
                };
            }
            // Check daily XP cap
            const remainingCap = XP_CONFIG.DAILY_XP_CAP - (xpData.dailyXP || 0);
            const xpAwarded = Math.min(XP_CONFIG.SHARE_XP, remainingCap);
            if (xpAwarded <= 0) {
                return {
                    success: false,
                    reason: 'Daily XP cap reached',
                    xpAwarded: 0
                };
            }
            // Update XP
            xpData.totalXP = (xpData.totalXP || 0) + xpAwarded;
            xpData.dailyXP = (xpData.dailyXP || 0) + xpAwarded;
            xpData.sharesToday = (xpData.sharesToday || 0) + 1;
            // Recalculate level
            const levelData = calculateLevel(xpData.totalXP);
            xpData.currentLevel = levelData.level;
            xpData.progressToNext = levelData.progressToNext;
            transaction.update(userRef, {
                xpData,
                updatedAt: firestore_1.FieldValue.serverTimestamp()
            });
            return {
                success: true,
                xpAwarded,
                totalXP: xpData.totalXP,
                level: xpData.currentLevel,
                dailyXP: xpData.dailyXP,
                sharesToday: xpData.sharesToday
            };
        });
    }
    catch (error) {
        console.error('Error awarding share XP:', error);
        throw new https_1.HttpsError('internal', 'Failed to award share XP');
    }
});
// Award referral XP
exports.awardReferralXP = (0, https_1.onCall)({ cors: true, region: 'us-central1' }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { referralCode, newUserId } = request.data;
    try {
        return await db.runTransaction(async (transaction) => {
            var _a, _b;
            // Find user with referral code
            const usersQuery = db.collection('users')
                .where('referralData.referralCode', '==', referralCode)
                .limit(1);
            const querySnapshot = await transaction.get(usersQuery);
            if (querySnapshot.empty) {
                throw new https_1.HttpsError('not-found', 'Invalid referral code');
            }
            const referrerDoc = querySnapshot.docs[0];
            const referrerData = referrerDoc.data();
            const xpData = referrerData.xpData || {};
            // Check if referral already exists
            if ((_b = (_a = referrerData.referralData) === null || _a === void 0 ? void 0 : _a.referredUsers) === null || _b === void 0 ? void 0 : _b.includes(newUserId)) {
                return {
                    success: false,
                    reason: 'User already referred',
                    xpAwarded: 0
                };
            }
            // Award XP
            xpData.totalXP = (xpData.totalXP || 0) + XP_CONFIG.REFERRAL_XP;
            xpData.referralsCount = (xpData.referralsCount || 0) + 1;
            // Recalculate level
            const levelData = calculateLevel(xpData.totalXP);
            xpData.currentLevel = levelData.level;
            xpData.progressToNext = levelData.progressToNext;
            // Update referral data
            const referralData = referrerData.referralData || {};
            referralData.referredUsers = referralData.referredUsers || [];
            referralData.referredUsers.push(newUserId);
            transaction.update(referrerDoc.ref, {
                xpData,
                referralData,
                updatedAt: firestore_1.FieldValue.serverTimestamp()
            });
            return {
                success: true,
                xpAwarded: XP_CONFIG.REFERRAL_XP,
                totalXP: xpData.totalXP,
                level: xpData.currentLevel,
                referralsCount: xpData.referralsCount
            };
        });
    }
    catch (error) {
        console.error('Error awarding referral XP:', error);
        throw new https_1.HttpsError('internal', 'Failed to award referral XP');
    }
});
// Daily reset function (runs at midnight UTC)
exports.dailyReset = (0, scheduler_1.onSchedule)({ schedule: '0 0 * * *', timeZone: 'UTC' }, async () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const batch = db.batch();
        // Get users who need daily reset
        const usersSnapshot = await db.collection('users')
            .where('xpData.lastActiveDate', '<', today)
            .limit(500) // Process in batches
            .get();
        usersSnapshot.forEach(doc => {
            const userData = doc.data();
            const xpData = userData.xpData || {};
            // Reset daily counters
            xpData.dailyXP = 0;
            xpData.sharesToday = 0;
            // Update streak logic is handled in awardXP function
            batch.update(doc.ref, {
                xpData,
                updatedAt: firestore_1.FieldValue.serverTimestamp()
            });
        });
        await batch.commit();
        console.log(`Daily reset completed for ${usersSnapshot.size} users`);
    }
    catch (error) {
        console.error('Error in daily reset:', error);
    }
});
//# sourceMappingURL=xp-system.js.map