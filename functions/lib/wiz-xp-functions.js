"use strict";
/**
 * WIZ XP System Cloud Functions - Production Implementation
 * Implements milder progression curve with secure server-side processing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWizLeaderboard = exports.wizDailyReset = exports.getWizXPData = exports.awardWizReferralXP = exports.awardWizShareXP = exports.awardWatchXP = exports.awardWizXP = void 0;
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
// WIZ XP Configuration (matches client-side)
const WIZ_XP_CONFIG = {
    WATCH_TIME_XP_RATE: 0.1,
    COMPLETION_BONUS_RATE: 0.1,
    SHARE_XP: 20,
    REFERRAL_XP: 50,
    DAILY_XP_CAP: 360,
    MAX_DAILY_SHARES: 5,
    MIN_WATCH_TIME: 5,
    COMPLETION_THRESHOLD: 0.9,
};
// New Milder Level Thresholds
const WIZ_LEVEL_THRESHOLDS = [
    { level: 1, totalXP: 0 },
    { level: 2, totalXP: 100 },
    { level: 3, totalXP: 300 },
    { level: 4, totalXP: 800 },
    { level: 5, totalXP: 1600 },
    { level: 6, totalXP: 3000 },
    { level: 7, totalXP: 6000 },
    { level: 8, totalXP: 12000 },
    { level: 9, totalXP: 24000 },
    { level: 10, totalXP: 50000 },
    { level: 11, totalXP: 100000 },
];
// Badge Levels
const BADGE_LEVELS = [3, 5, 7, 10];
/**
 * Helper function to award XP within a transaction
 */
async function awardXPTransaction(transaction, userId, xpAmount, source, metadata) {
    const today = new Date().toISOString().split('T')[0];
    const userRef = db.collection('users').doc(userId);
    const userDoc = await transaction.get(userRef);
    if (!userDoc.exists) {
        throw new Error('User not found');
    }
    const userData = userDoc.data();
    // Initialize XP data if missing
    const currentXP = userData.currentXP || userData.totalXP || 0;
    const level = userData.level || 1;
    let dailyXpEarned = userData.dailyXpEarned || userData.dailyXP || 0;
    let dailyShares = userData.dailyShares || 0;
    const badges = userData.badges || [];
    const lastActiveDate = userData.lastActiveDate || '';
    // Reset daily counters if new day
    if (lastActiveDate !== today) {
        dailyXpEarned = 0;
        dailyShares = 0;
    }
    // Check daily XP cap
    if (dailyXpEarned >= WIZ_XP_CONFIG.DAILY_XP_CAP) {
        return {
            success: true,
            xpAwarded: 0,
            reason: 'Daily XP cap reached',
            currentXP,
            level,
            dailyXpEarned
        };
    }
    // Apply daily cap
    const remainingCap = WIZ_XP_CONFIG.DAILY_XP_CAP - dailyXpEarned;
    const actualXP = Math.min(xpAmount, remainingCap);
    if (actualXP <= 0) {
        return {
            success: true,
            xpAwarded: 0,
            reason: 'No XP to award',
            currentXP,
            level
        };
    }
    // Calculate new totals
    const newCurrentXP = currentXP + actualXP;
    const oldLevel = calculateLevel(currentXP).level;
    const newLevelData = calculateLevel(newCurrentXP);
    const leveledUp = newLevelData.level > oldLevel;
    // Update user document
    const updateData = {
        currentXP: newCurrentXP,
        level: newLevelData.level,
        dailyXpEarned: dailyXpEarned + actualXP,
        lastActiveDate: today,
        lastXPUpdate: firestore_1.FieldValue.serverTimestamp(),
    };
    // Update daily counters
    if (source === 'share') {
        updateData.dailyShares = dailyShares + 1;
    }
    // Update lifetime stats
    if (source === 'watch' && metadata.watchTime) {
        updateData['lifetimeStats.totalWatchTime'] = firestore_1.FieldValue.increment(metadata.watchTime);
        updateData['lifetimeStats.totalVideosWatched'] = firestore_1.FieldValue.increment(1);
    }
    else if (source === 'completion') {
        updateData['lifetimeStats.totalVideosCompleted'] = firestore_1.FieldValue.increment(1);
    }
    else if (source === 'share') {
        updateData['lifetimeStats.totalShares'] = firestore_1.FieldValue.increment(1);
    }
    else if (source === 'referral') {
        updateData['lifetimeStats.totalReferrals'] = firestore_1.FieldValue.increment(1);
    }
    let badgeEarned = null;
    // Handle level up
    if (leveledUp) {
        // Check for badge
        if (BADGE_LEVELS.includes(newLevelData.level) &&
            !badges.includes(`level_${newLevelData.level}`)) {
            badgeEarned = `level_${newLevelData.level}`;
            updateData.badges = [...badges, badgeEarned];
        }
        // Create level up log
        const levelUpRef = db.collection('levelUps').doc();
        transaction.set(levelUpRef, {
            userId,
            fromLevel: oldLevel,
            toLevel: newLevelData.level,
            totalXP: newCurrentXP,
            xpGained: actualXP,
            source,
            videoId: metadata.videoId || null,
            watchTime: metadata.watchTime || null,
            completionRate: metadata.completionRate || null,
            badgeEarned,
            timestamp: firestore_1.FieldValue.serverTimestamp(),
        });
    }
    transaction.update(userRef, updateData);
    return {
        success: true,
        xpAwarded: actualXP,
        currentXP: newCurrentXP,
        level: newLevelData.level,
        progressToNext: newLevelData.progressToNext,
        dailyXpEarned: dailyXpEarned + actualXP,
        leveledUp,
        badgeEarned,
        oldLevel: leveledUp ? oldLevel : undefined,
    };
}
/**
 * Calculate level from current XP
 */
function calculateLevel(currentXP) {
    let level = 1;
    for (let i = WIZ_LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
        if (currentXP >= WIZ_LEVEL_THRESHOLDS[i].totalXP) {
            level = WIZ_LEVEL_THRESHOLDS[i].level;
            break;
        }
    }
    const nextLevelData = WIZ_LEVEL_THRESHOLDS.find(l => l.level === level + 1);
    const currentLevelData = WIZ_LEVEL_THRESHOLDS.find(l => l.level === level);
    let progressToNext = 1;
    if (nextLevelData && currentLevelData) {
        const xpInCurrentLevel = currentXP - currentLevelData.totalXP;
        const xpNeededForLevel = nextLevelData.totalXP - currentLevelData.totalXP;
        progressToNext = xpNeededForLevel > 0 ? xpInCurrentLevel / xpNeededForLevel : 1;
    }
    return { level, progressToNext };
}
/**
 * Award WIZ XP with all rules and caps
 */
exports.awardWizXP = (0, https_1.onCall)({
    cors: true,
    region: 'us-central1',
    memory: '512MiB',
    timeoutSeconds: 60,
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { xpAmount, source, videoId, watchTime, completionRate } = request.data;
    const userId = request.auth.uid;
    if (!xpAmount || typeof xpAmount !== 'number' || xpAmount < 0) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid XP amount');
    }
    if (!['watch', 'completion', 'share', 'referral'].includes(source)) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid XP source');
    }
    try {
        return await db.runTransaction(async (transaction) => {
            const today = new Date().toISOString().split('T')[0];
            const userRef = db.collection('users').doc(userId);
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) {
                throw new https_1.HttpsError('not-found', 'User not found');
            }
            const userData = userDoc.data();
            // Initialize XP data if missing
            const currentXP = userData.currentXP || userData.totalXP || 0;
            const level = userData.level || 1;
            let dailyXpEarned = userData.dailyXpEarned || userData.dailyXP || 0;
            let dailyShares = userData.dailyShares || 0;
            const badges = userData.badges || [];
            const lastActiveDate = userData.lastActiveDate || '';
            // Reset daily counters if new day
            if (lastActiveDate !== today) {
                dailyXpEarned = 0;
                dailyShares = 0;
            }
            // Check daily XP cap
            if (dailyXpEarned >= WIZ_XP_CONFIG.DAILY_XP_CAP) {
                return {
                    success: true,
                    xpAwarded: 0,
                    reason: 'Daily XP cap reached',
                    currentXP,
                    level,
                    dailyXpEarned
                };
            }
            // Check share limits
            if (source === 'share' && dailyShares >= WIZ_XP_CONFIG.MAX_DAILY_SHARES) {
                return {
                    success: true,
                    xpAwarded: 0,
                    reason: 'Daily share limit reached',
                    currentXP,
                    level,
                    dailyShares
                };
            }
            // Apply daily cap
            const remainingCap = WIZ_XP_CONFIG.DAILY_XP_CAP - dailyXpEarned;
            const actualXP = Math.min(xpAmount, remainingCap);
            if (actualXP <= 0) {
                return {
                    success: true,
                    xpAwarded: 0,
                    reason: 'No XP to award',
                    currentXP,
                    level
                };
            }
            // Calculate new totals
            const newCurrentXP = currentXP + actualXP;
            const oldLevel = calculateLevel(currentXP).level;
            const newLevelData = calculateLevel(newCurrentXP);
            const leveledUp = newLevelData.level > oldLevel;
            // Update user document
            const updateData = {
                currentXP: newCurrentXP,
                level: newLevelData.level,
                dailyXpEarned: dailyXpEarned + actualXP,
                lastActiveDate: today,
                lastXPUpdate: firestore_1.FieldValue.serverTimestamp(),
            };
            // Update daily counters
            if (source === 'share') {
                updateData.dailyShares = dailyShares + 1;
            }
            // Update lifetime stats
            if (source === 'watch' && watchTime) {
                updateData['lifetimeStats.totalWatchTime'] = firestore_1.FieldValue.increment(watchTime);
                updateData['lifetimeStats.totalVideosWatched'] = firestore_1.FieldValue.increment(1);
            }
            else if (source === 'completion') {
                updateData['lifetimeStats.totalVideosCompleted'] = firestore_1.FieldValue.increment(1);
            }
            else if (source === 'share') {
                updateData['lifetimeStats.totalShares'] = firestore_1.FieldValue.increment(1);
            }
            else if (source === 'referral') {
                updateData['lifetimeStats.totalReferrals'] = firestore_1.FieldValue.increment(1);
            }
            let badgeEarned = null;
            // Handle level up
            if (leveledUp) {
                // Check for badge
                if (BADGE_LEVELS.includes(newLevelData.level) &&
                    !badges.includes(`level_${newLevelData.level}`)) {
                    badgeEarned = `level_${newLevelData.level}`;
                    updateData.badges = [...badges, badgeEarned];
                }
                // Create level up log
                const levelUpRef = db.collection('levelUps').doc();
                transaction.set(levelUpRef, {
                    userId,
                    fromLevel: oldLevel,
                    toLevel: newLevelData.level,
                    totalXP: newCurrentXP,
                    xpGained: actualXP,
                    source,
                    videoId: videoId || null,
                    watchTime: watchTime || null,
                    completionRate: completionRate || null,
                    badgeEarned,
                    timestamp: firestore_1.FieldValue.serverTimestamp(),
                });
                console.log(`🎉 Level up! ${userId}: ${oldLevel} → ${newLevelData.level}`);
            }
            transaction.update(userRef, updateData);
            return {
                success: true,
                xpAwarded: actualXP,
                currentXP: newCurrentXP,
                level: newLevelData.level,
                progressToNext: newLevelData.progressToNext,
                dailyXpEarned: dailyXpEarned + actualXP,
                leveledUp,
                badgeEarned,
                oldLevel: leveledUp ? oldLevel : undefined,
            };
        });
    }
    catch (error) {
        console.error('Error awarding WIZ XP:', error);
        throw new https_1.HttpsError('internal', 'Failed to award XP');
    }
});
/**
 * Award watch time XP with completion bonus
 */
exports.awardWatchXP = (0, https_1.onCall)({
    cors: true,
    region: 'us-central1',
    memory: '512MiB',
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { videoId, watchTime, completionRate, sessionId } = request.data;
    if (!videoId || typeof watchTime !== 'number' || watchTime < WIZ_XP_CONFIG.MIN_WATCH_TIME) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid watch data');
    }
    try {
        // Calculate base XP
        const baseXP = Math.floor(watchTime * WIZ_XP_CONFIG.WATCH_TIME_XP_RATE);
        // Award watch XP directly (avoid handler call)
        const userId = request.auth.uid;
        const watchResult = await db.runTransaction(async (transaction) => {
            // Direct implementation to avoid handler issues
            return await awardXPTransaction(transaction, userId, baseXP, 'watch', {
                videoId,
                watchTime,
                completionRate,
            });
        });
        let totalXpAwarded = watchResult.xpAwarded || 0;
        let finalResult = watchResult;
        // Award completion bonus if applicable
        if (completionRate >= WIZ_XP_CONFIG.COMPLETION_THRESHOLD && totalXpAwarded > 0) {
            const bonusXP = Math.floor(baseXP * WIZ_XP_CONFIG.COMPLETION_BONUS_RATE);
            const bonusResult = await db.runTransaction(async (transaction) => {
                return await awardXPTransaction(transaction, userId, bonusXP, 'completion', {
                    videoId,
                    watchTime,
                });
            });
            totalXpAwarded += bonusResult.xpAwarded || 0;
            // Use the latest result (in case of level up from bonus)
            if (bonusResult.leveledUp) {
                finalResult = bonusResult;
            }
            finalResult.totalXpAwarded = totalXpAwarded;
            finalResult.completionBonus = bonusResult.xpAwarded || 0;
        }
        return Object.assign(Object.assign({}, finalResult), { totalXpAwarded,
            baseXP,
            sessionId });
    }
    catch (error) {
        console.error('Error awarding watch XP:', error);
        throw new https_1.HttpsError('internal', 'Failed to award watch XP');
    }
});
/**
 * Award share XP
 */
exports.awardWizShareXP = (0, https_1.onCall)({ cors: true, region: 'us-central1' }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { videoId } = request.data;
    const userId = request.auth.uid;
    return await db.runTransaction(async (transaction) => {
        return await awardXPTransaction(transaction, userId, WIZ_XP_CONFIG.SHARE_XP, 'share', {
            videoId,
        });
    });
});
/**
 * Award referral XP
 */
exports.awardWizReferralXP = (0, https_1.onCall)({ cors: true, region: 'us-central1' }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { referredUserId, referralCode } = request.data;
    const userId = request.auth.uid;
    return await db.runTransaction(async (transaction) => {
        return await awardXPTransaction(transaction, userId, WIZ_XP_CONFIG.REFERRAL_XP, 'referral', {
            referredUserId,
            referralCode,
        });
    });
});
/**
 * Get user XP data
 */
exports.getWizXPData = (0, https_1.onCall)({ cors: true, region: 'us-central1' }, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = request.auth.uid;
    try {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            // Initialize user with default XP data
            const initialData = {
                currentXP: 0,
                level: 1,
                dailyXpEarned: 0,
                dailyShares: 0,
                badges: [],
                lastActiveDate: new Date().toISOString().split('T')[0],
                lifetimeStats: {
                    totalWatchTime: 0,
                    totalVideosWatched: 0,
                    totalShares: 0,
                    totalReferrals: 0,
                    totalVideosCompleted: 0,
                }
            };
            await userRef.set(initialData, { merge: true });
            const levelData = calculateLevel(0);
            return Object.assign(Object.assign(Object.assign({}, initialData), levelData), { dailyXpRemaining: WIZ_XP_CONFIG.DAILY_XP_CAP, canEarnXP: true });
        }
        const userData = userDoc.data();
        const currentXP = userData.currentXP || userData.totalXP || 0;
        const dailyXpEarned = userData.dailyXpEarned || userData.dailyXP || 0;
        const levelData = calculateLevel(currentXP);
        return {
            currentXP,
            level: levelData.level,
            progressToNext: levelData.progressToNext,
            dailyXpEarned,
            dailyXpRemaining: Math.max(0, WIZ_XP_CONFIG.DAILY_XP_CAP - dailyXpEarned),
            dailyShares: userData.dailyShares || 0,
            badges: userData.badges || [],
            canEarnXP: dailyXpEarned < WIZ_XP_CONFIG.DAILY_XP_CAP,
            lifetimeStats: userData.lifetimeStats || {},
            lastActiveDate: userData.lastActiveDate || '',
        };
    }
    catch (error) {
        console.error('Error getting XP data:', error);
        throw new https_1.HttpsError('internal', 'Failed to get XP data');
    }
});
/**
 * Daily reset function - runs at midnight UTC
 */
exports.wizDailyReset = (0, scheduler_1.onSchedule)({
    schedule: '0 0 * * *',
    timeZone: 'UTC',
    memory: '1GiB',
    timeoutSeconds: 540,
}, async () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        console.log(`Starting WIZ daily reset for ${today}`);
        // Process users in batches
        const BATCH_SIZE = 500;
        let processedCount = 0;
        let lastDoc = null;
        do {
            let query = db.collection('users')
                .where('dailyXpEarned', '>', 0)
                .limit(BATCH_SIZE);
            if (lastDoc) {
                query = query.startAfter(lastDoc);
            }
            const snapshot = await query.get();
            if (snapshot.empty)
                break;
            const batch = db.batch();
            snapshot.forEach(doc => {
                const userData = doc.data();
                const wasActiveYesterday = userData.lastActiveDate === yesterdayStr && userData.dailyXpEarned > 0;
                let currentStreak = userData.currentStreak || 0;
                if (wasActiveYesterday) {
                    currentStreak += 1;
                }
                else if (userData.dailyXpEarned > 0) {
                    currentStreak = 1; // Start new streak
                }
                else {
                    currentStreak = 0; // Break streak
                }
                batch.update(doc.ref, {
                    dailyXpEarned: 0,
                    dailyShares: 0,
                    currentStreak,
                    longestStreak: Math.max(userData.longestStreak || 0, currentStreak),
                    lastResetDate: today,
                });
            });
            await batch.commit();
            processedCount += snapshot.size;
            lastDoc = snapshot.docs[snapshot.docs.length - 1];
            console.log(`Processed ${processedCount} users in daily reset`);
        } while (lastDoc);
        console.log(`WIZ daily reset completed. Total users processed: ${processedCount}`);
    }
    catch (error) {
        console.error('Error in WIZ daily reset:', error);
    }
});
/**
 * Get leaderboard
 */
exports.getWizLeaderboard = (0, https_1.onCall)({ cors: true, region: 'us-central1' }, async (request) => {
    const { limit = 50, period = 'all' } = request.data || {};
    try {
        // For now, simple implementation
        // In production, consider a dedicated leaderboard collection
        const query = db.collection('users')
            .where('currentXP', '>', 0)
            .orderBy('currentXP', 'desc')
            .limit(Math.min(limit, 100));
        const snapshot = await query.get();
        const leaderboard = [];
        snapshot.docs.forEach((doc, index) => {
            const data = doc.data();
            leaderboard.push({
                rank: index + 1,
                userId: doc.id,
                displayName: data.displayName || 'Anonymous Wizard',
                photoURL: data.photoURL || null,
                currentXP: data.currentXP || 0,
                level: data.level || 1,
                badges: data.badges || [],
            });
        });
        return { leaderboard, period, generatedAt: new Date().toISOString() };
    }
    catch (error) {
        console.error('Error getting leaderboard:', error);
        throw new https_1.HttpsError('internal', 'Failed to get leaderboard');
    }
});
//# sourceMappingURL=wiz-xp-functions.js.map