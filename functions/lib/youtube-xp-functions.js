"use strict";
/**
 * Firebase Cloud Functions for YouTube XP Integration
 * Handles daily YouTube watch history sync and XP processing
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeYouTubeTracking = exports.dailyYouTubeProfileSync = exports.dailyYouTubeSync = exports.syncYouTubeHistory = void 0;
const https_1 = require("firebase-functions/v2/https");
const scheduler_1 = require("firebase-functions/v2/scheduler");
const firestore_1 = require("firebase-admin/firestore");
const db = (0, firestore_1.getFirestore)();
// YouTube API Configuration
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';
// XP Configuration (matches client-side config)
const XP_CONFIG = {
    WATCH_TIME_XP_RATE: 0.1,
    COMPLETION_BONUS_RATE: 0.1,
    DAILY_XP_CAP: 360,
    SHARE_XP: 20,
    REFERRAL_XP: 50,
};
/**
 * Parse YouTube duration format (PT4M13S) to seconds
 */
function parseYouTubeDuration(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match)
        return 0;
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return hours * 3600 + minutes * 60 + seconds;
}
/**
 * Get creator video mappings from Firestore
 */
async function getCreatorVideoMappings() {
    try {
        const creatorsSnapshot = await db.collection('creators').get();
        const videoToCreatorMap = new Map();
        for (const creatorDoc of creatorsSnapshot.docs) {
            const creatorId = creatorDoc.id;
            const videosSnapshot = await db.collection('creatorVideos')
                .where('creatorId', '==', creatorId)
                .get();
            videosSnapshot.forEach(videoDoc => {
                const videoData = videoDoc.data();
                videoToCreatorMap.set(videoData.videoId, creatorId);
            });
        }
        console.log(`Loaded ${videoToCreatorMap.size} creator video mappings`);
        return videoToCreatorMap;
    }
    catch (error) {
        console.error('Error getting creator video mappings:', error);
        return new Map();
    }
}
/**
 * Fetch user's YouTube watch history via API
 */
async function fetchUserYouTubeHistory(userId, accessToken, maxResults = 50) {
    var _a, _b, _c, _d, _e, _f;
    try {
        if (!YOUTUBE_API_KEY) {
            throw new Error('YouTube API key not configured');
        }
        // Get user's tracking start date
        const trackingDoc = await db.collection('userTrackingData').doc(userId).get();
        if (!trackingDoc.exists) {
            throw new Error('User tracking data not found');
        }
        const trackingData = trackingDoc.data();
        const startTrackingDate = trackingData.startTrackingDate.toDate();
        // Fetch watch history from YouTube API
        const historyResponse = await fetch(`${YOUTUBE_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=HL&maxResults=${maxResults}&key=${YOUTUBE_API_KEY}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        if (!historyResponse.ok) {
            const errorText = await historyResponse.text();
            console.error('YouTube API error:', errorText);
            throw new Error(`YouTube API error: ${historyResponse.status}`);
        }
        const historyData = await historyResponse.json();
        const creatorVideoMap = await getCreatorVideoMappings();
        const watchEntries = [];
        for (const item of historyData.items || []) {
            const videoId = (_b = (_a = item.snippet) === null || _a === void 0 ? void 0 : _a.resourceId) === null || _b === void 0 ? void 0 : _b.videoId;
            if (!videoId)
                continue;
            const publishedAt = new Date((_c = item.snippet) === null || _c === void 0 ? void 0 : _c.publishedAt);
            // Only include videos watched after startTrackingDate
            if (publishedAt < startTrackingDate)
                continue;
            // Only include videos from tracked creators
            const creatorId = creatorVideoMap.get(videoId);
            if (!creatorId)
                continue;
            // Get video details for duration
            try {
                const videoResponse = await fetch(`${YOUTUBE_API_BASE}/videos?part=contentDetails&id=${videoId}&key=${YOUTUBE_API_KEY}`);
                if (videoResponse.ok) {
                    const videoDetails = await videoResponse.json();
                    const duration = parseYouTubeDuration(((_f = (_e = (_d = videoDetails.items) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.contentDetails) === null || _f === void 0 ? void 0 : _f.duration) || 'PT0S');
                    if (duration > 0) {
                        // Estimate watch time (assume 70% completion on average for API data)
                        const estimatedWatchTime = Math.floor(duration * 0.7);
                        watchEntries.push({
                            userId,
                            videoId,
                            watchedAt: publishedAt,
                            duration,
                            estimatedWatchTime,
                            completionRate: 0.7,
                            creatorId,
                        });
                    }
                }
            }
            catch (videoError) {
                console.warn(`Failed to get video details for ${videoId}:`, videoError);
            }
        }
        console.log(`Fetched ${watchEntries.length} YouTube entries for user ${userId}`);
        return watchEntries;
    }
    catch (error) {
        console.error('Error fetching YouTube history:', error);
        throw error;
    }
}
/**
 * Check if entry already exists to prevent duplicates
 */
async function isDuplicateEntry(userId, videoId, watchedAt) {
    try {
        const entryId = `${userId}_${videoId}_${watchedAt.getTime()}`;
        const existingDoc = await db.collection('youtubeWatchHistory').doc(entryId).get();
        return existingDoc.exists;
    }
    catch (error) {
        console.error('Error checking duplicate:', error);
        return false;
    }
}
/**
 * Process and award XP for YouTube watch entries
 */
async function processYouTubeEntries(entries) {
    const batch = db.batch();
    let totalXPAwarded = 0;
    for (const entry of entries) {
        const entryId = `${entry.userId}_${entry.videoId}_${entry.watchedAt.getTime()}`;
        // Skip duplicates
        if (await isDuplicateEntry(entry.userId, entry.videoId, entry.watchedAt)) {
            continue;
        }
        // Calculate XP
        const baseXP = Math.floor(entry.estimatedWatchTime * XP_CONFIG.WATCH_TIME_XP_RATE);
        let videoXP = baseXP;
        // Apply completion bonus
        if (entry.completionRate >= 0.9) {
            videoXP += Math.floor(baseXP * XP_CONFIG.COMPLETION_BONUS_RATE);
        }
        totalXPAwarded += videoXP;
        // Save watch history entry
        const historyRef = db.collection('youtubeWatchHistory').doc(entryId);
        batch.set(historyRef, {
            id: entryId,
            userId: entry.userId,
            videoId: entry.videoId,
            watchedAt: entry.watchedAt,
            duration: entry.duration,
            estimatedWatchTime: entry.estimatedWatchTime,
            completionRate: entry.completionRate,
            source: 'youtube_api',
            xpAwarded: videoXP,
            creatorId: entry.creatorId,
            processedAt: firestore_1.FieldValue.serverTimestamp(),
        });
        // Create XP log
        const xpLogRef = db.collection('xpLogs').doc(`${entryId}_xp`);
        batch.set(xpLogRef, {
            id: `${entryId}_xp`,
            userId: entry.userId,
            source: 'youtube_api',
            xpAmount: videoXP,
            videoId: entry.videoId,
            creatorId: entry.creatorId,
            timestamp: entry.watchedAt,
            details: {
                watchTime: entry.estimatedWatchTime,
                completionRate: entry.completionRate,
            },
        });
    }
    await batch.commit();
    return totalXPAwarded;
}
/**
 * Award XP to user while respecting daily caps
 */
async function awardXPToUser(userId, xpAmount) {
    await db.runTransaction(async (transaction) => {
        const userRef = db.collection('users').doc(userId);
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
            throw new Error('User not found');
        }
        const userData = userDoc.data();
        const xpData = userData.xpData || {
            totalXP: 0,
            currentLevel: 1,
            dailyXP: 0,
            dailyCap: XP_CONFIG.DAILY_XP_CAP,
        };
        // Reset daily counters if new day
        const today = new Date().toISOString().split('T')[0];
        if (xpData.lastActiveDate !== today) {
            xpData.dailyXP = 0;
            xpData.lastActiveDate = today;
        }
        // Apply daily cap
        const remainingCap = XP_CONFIG.DAILY_XP_CAP - xpData.dailyXP;
        const xpToAward = Math.min(xpAmount, remainingCap);
        if (xpToAward > 0) {
            xpData.totalXP += xpToAward;
            xpData.dailyXP += xpToAward;
            // Recalculate level (using same formula as client)
            let level = 1;
            let totalRequired = 100;
            while (xpData.totalXP >= totalRequired && level < 100) {
                level++;
                totalRequired = Math.floor(100 * Math.pow(2.5, level - 1));
            }
            xpData.currentLevel = level;
            transaction.update(userRef, {
                xpData,
                updatedAt: firestore_1.FieldValue.serverTimestamp(),
            });
            console.log(`Awarded ${xpToAward} XP to ${userId} (${xpAmount - xpToAward} capped)`);
        }
    });
}
/**
 * Callable function to manually sync user's YouTube history
 */
exports.syncYouTubeHistory = (0, https_1.onCall)({
    cors: true,
    region: 'us-central1',
    memory: '1GiB',
    timeoutSeconds: 300,
}, async (request) => {
    var _a;
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const userId = request.auth.uid;
    try {
        // Get user's YouTube tokens
        const trackingDoc = await db.collection('userTrackingData').doc(userId).get();
        if (!trackingDoc.exists) {
            throw new https_1.HttpsError('not-found', 'User tracking data not found');
        }
        const trackingData = trackingDoc.data();
        if (!((_a = trackingData.youtubeTokens) === null || _a === void 0 ? void 0 : _a.accessToken)) {
            throw new https_1.HttpsError('failed-precondition', 'No YouTube access token found');
        }
        // Check if token is expired
        if (trackingData.youtubeTokens.expiresAt.toDate() < new Date()) {
            throw new https_1.HttpsError('failed-precondition', 'YouTube token expired');
        }
        // Fetch and process YouTube history
        const watchEntries = await fetchUserYouTubeHistory(userId, trackingData.youtubeTokens.accessToken);
        const totalXP = await processYouTubeEntries(watchEntries);
        if (totalXP > 0) {
            await awardXPToUser(userId, totalXP);
        }
        // Update last sync date
        await db.collection('userTrackingData').doc(userId).update({
            lastYouTubeSyncDate: firestore_1.FieldValue.serverTimestamp(),
        });
        return {
            success: true,
            entriesProcessed: watchEntries.length,
            xpAwarded: totalXP,
        };
    }
    catch (error) {
        console.error('Error in syncYouTubeHistory:', error);
        throw new https_1.HttpsError('internal', 'Failed to sync YouTube history');
    }
});
/**
 * Scheduled function to sync YouTube history for all active users daily
 */
exports.dailyYouTubeSync = (0, scheduler_1.onSchedule)({
    schedule: '0 2 * * *',
    timeZone: 'UTC',
    memory: '2GiB',
    timeoutSeconds: 540,
}, async () => {
    try {
        console.log('Starting daily YouTube sync...');
        // Get all users with YouTube connected and recent activity
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - 7); // Active in last 7 days
        const usersSnapshot = await db.collection('userTrackingData')
            .where('youtubeConnected', '==', true)
            .where('preferences.trackOffPlatform', '==', true)
            .get();
        console.log(`Found ${usersSnapshot.size} users to sync`);
        const results = {
            processed: 0,
            successful: 0,
            failed: 0,
            totalXPAwarded: 0,
        };
        // Process users in batches to avoid memory issues
        const BATCH_SIZE = 10;
        for (let i = 0; i < usersSnapshot.docs.length; i += BATCH_SIZE) {
            const batch = usersSnapshot.docs.slice(i, i + BATCH_SIZE);
            await Promise.all(batch.map(async (userDoc) => {
                var _a, _b;
                const userId = userDoc.id;
                const userData = userDoc.data();
                try {
                    results.processed++;
                    // Check if token is still valid
                    if (!((_a = userData.youtubeTokens) === null || _a === void 0 ? void 0 : _a.accessToken)) {
                        console.log(`Skipping ${userId}: No access token`);
                        return;
                    }
                    if (userData.youtubeTokens.expiresAt.toDate() < new Date()) {
                        console.log(`Skipping ${userId}: Token expired`);
                        return;
                    }
                    // Skip if synced recently (within last 20 hours)
                    const lastSync = (_b = userData.lastYouTubeSyncDate) === null || _b === void 0 ? void 0 : _b.toDate();
                    if (lastSync && (new Date().getTime() - lastSync.getTime()) < 20 * 60 * 60 * 1000) {
                        console.log(`Skipping ${userId}: Recently synced`);
                        return;
                    }
                    // Fetch and process YouTube history
                    const watchEntries = await fetchUserYouTubeHistory(userId, userData.youtubeTokens.accessToken, 25 // Smaller batch for scheduled function
                    );
                    if (watchEntries.length > 0) {
                        const totalXP = await processYouTubeEntries(watchEntries);
                        if (totalXP > 0) {
                            await awardXPToUser(userId, totalXP);
                            results.totalXPAwarded += totalXP;
                        }
                        console.log(`Synced ${userId}: ${watchEntries.length} entries, ${totalXP} XP`);
                    }
                    // Update sync date
                    await db.collection('userTrackingData').doc(userId).update({
                        lastYouTubeSyncDate: firestore_1.FieldValue.serverTimestamp(),
                    });
                    results.successful++;
                }
                catch (error) {
                    console.error(`Error syncing ${userId}:`, error);
                    results.failed++;
                }
            }));
            // Small delay between batches
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        console.log('Daily YouTube sync completed:', results);
    }
    catch (error) {
        console.error('Error in daily YouTube sync:', error);
    }
});
/**
 * Sync YouTube profile data for a user
 */
async function syncUserYouTubeProfile(userId, accessToken) {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        // Fetch channel information
        const channelResponse = await fetch(`${YOUTUBE_API_BASE}/channels?part=snippet,statistics,contentDetails,brandingSettings&mine=true&key=${YOUTUBE_API_KEY}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        });
        if (!channelResponse.ok) {
            throw new Error(`YouTube API error: ${channelResponse.status}`);
        }
        const channelData = await channelResponse.json();
        if (!channelData.items || channelData.items.length === 0) {
            throw new Error('No YouTube channel found');
        }
        const channel = channelData.items[0];
        const snippet = channel.snippet;
        const statistics = channel.statistics;
        const brandingSettings = channel.brandingSettings;
        // Get user document
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            throw new Error('User document not found');
        }
        const userData = userDoc.data();
        const existingProfile = userData.youtubeProfile;
        const updatedFields = [];
        const newProfile = {
            channelId: channel.id,
            channelTitle: snippet.title,
            description: snippet.description || '',
            thumbnailUrl: ((_b = (_a = snippet.thumbnails) === null || _a === void 0 ? void 0 : _a.high) === null || _b === void 0 ? void 0 : _b.url) || ((_d = (_c = snippet.thumbnails) === null || _c === void 0 ? void 0 : _c.medium) === null || _d === void 0 ? void 0 : _d.url) || ((_f = (_e = snippet.thumbnails) === null || _e === void 0 ? void 0 : _e.default) === null || _f === void 0 ? void 0 : _f.url) || '',
            subscriberCount: formatSubscriberCount(statistics.subscriberCount || '0'),
            customUrl: snippet.customUrl,
            bannerImageUrl: ((_g = brandingSettings === null || brandingSettings === void 0 ? void 0 : brandingSettings.image) === null || _g === void 0 ? void 0 : _g.bannerExternalUrl) || '',
            lastSynced: firestore_1.FieldValue.serverTimestamp(),
        };
        // Track what changed
        if (!existingProfile || existingProfile.channelTitle !== newProfile.channelTitle) {
            updatedFields.push('channelTitle');
        }
        if (!existingProfile || existingProfile.description !== newProfile.description) {
            updatedFields.push('description');
        }
        if (!existingProfile || existingProfile.thumbnailUrl !== newProfile.thumbnailUrl) {
            updatedFields.push('thumbnailUrl');
        }
        if (!existingProfile || existingProfile.subscriberCount !== newProfile.subscriberCount) {
            updatedFields.push('subscriberCount');
        }
        // Prepare update data
        const updateData = {
            youtubeProfile: newProfile,
        };
        // Only update display name and photo if they match the old YouTube data (not manually changed)
        if (userData.displayName === (existingProfile === null || existingProfile === void 0 ? void 0 : existingProfile.channelTitle) || !userData.displayName) {
            updateData.displayName = newProfile.channelTitle;
            updatedFields.push('displayName');
        }
        if (userData.photoURL === (existingProfile === null || existingProfile === void 0 ? void 0 : existingProfile.thumbnailUrl) || !userData.photoURL) {
            updateData.photoURL = newProfile.thumbnailUrl;
            updatedFields.push('photoURL');
        }
        // Update user document
        await userRef.update(updateData);
        console.log(`✅ YouTube profile synced for ${userId}:`, updatedFields);
        return { success: true, updatedFields };
    }
    catch (error) {
        console.error(`❌ Failed to sync YouTube profile for ${userId}:`, error);
        return { success: false, updatedFields: [] };
    }
}
/**
 * Format subscriber count for display
 */
function formatSubscriberCount(count) {
    const num = parseInt(count);
    if (num >= 1000000) {
        return `${(num / 1000000).toFixed(1)}M`;
    }
    else if (num >= 1000) {
        return `${(num / 1000).toFixed(1)}K`;
    }
    return count;
}
/**
 * Scheduled function to sync YouTube profiles for all connected users daily
 */
exports.dailyYouTubeProfileSync = (0, scheduler_1.onSchedule)({
    schedule: '0 3 * * *',
    timeZone: 'UTC',
    memory: '1GiB',
    timeoutSeconds: 300,
}, async () => {
    var _a, _b, _c, _d;
    try {
        console.log('Starting daily YouTube profile sync...');
        // Get all users with YouTube connected
        const usersSnapshot = await db.collection('users')
            .where('youtubeConnected', '==', true)
            .get();
        console.log(`Found ${usersSnapshot.size} YouTube-connected users to sync`);
        const results = {
            total: usersSnapshot.size,
            successful: 0,
            failed: 0,
            skipped: 0,
        };
        // Process users with rate limiting to avoid API quota issues
        for (const userDoc of usersSnapshot.docs) {
            const userId = userDoc.id;
            const userData = userDoc.data();
            try {
                // Check if sync is needed (only once per day)
                const lastSynced = (_c = (_b = (_a = userData.youtubeProfile) === null || _a === void 0 ? void 0 : _a.lastSynced) === null || _b === void 0 ? void 0 : _b.toDate) === null || _c === void 0 ? void 0 : _c.call(_b);
                if (lastSynced) {
                    const daysSinceSync = Math.floor((new Date().getTime() - lastSynced.getTime()) / (1000 * 60 * 60 * 24));
                    if (daysSinceSync < 1) {
                        results.skipped++;
                        continue;
                    }
                }
                // Get access token from tracking data
                const trackingDoc = await db.collection('userTrackingData').doc(userId).get();
                if (!trackingDoc.exists) {
                    console.log(`Skipping ${userId}: No tracking data`);
                    results.skipped++;
                    continue;
                }
                const trackingData = trackingDoc.data();
                if (!((_d = trackingData.youtubeTokens) === null || _d === void 0 ? void 0 : _d.accessToken)) {
                    console.log(`Skipping ${userId}: No access token`);
                    results.skipped++;
                    continue;
                }
                if (trackingData.youtubeTokens.expiresAt.toDate() < new Date()) {
                    console.log(`Skipping ${userId}: Token expired`);
                    results.skipped++;
                    continue;
                }
                // Sync profile
                const syncResult = await syncUserYouTubeProfile(userId, trackingData.youtubeTokens.accessToken);
                if (syncResult.success) {
                    results.successful++;
                    if (syncResult.updatedFields.length > 0) {
                        console.log(`✅ Synced ${userId}: ${syncResult.updatedFields.join(', ')}`);
                    }
                }
                else {
                    results.failed++;
                }
                // Rate limiting: wait 200ms between requests
                await new Promise(resolve => setTimeout(resolve, 200));
            }
            catch (error) {
                console.error(`❌ Error syncing profile for ${userId}:`, error);
                results.failed++;
            }
        }
        console.log('Daily YouTube profile sync completed:', results);
    }
    catch (error) {
        console.error('❌ Error in daily YouTube profile sync:', error);
    }
});
/**
 * Initialize user tracking when they first connect YouTube
 */
exports.initializeYouTubeTracking = (0, https_1.onCall)({
    cors: true,
    region: 'us-central1',
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { accessToken, refreshToken, expiresIn } = request.data;
    const userId = request.auth.uid;
    try {
        const expiresAt = new Date(Date.now() + (expiresIn * 1000));
        await db.collection('userTrackingData').doc(userId).set({
            userId,
            startTrackingDate: firestore_1.FieldValue.serverTimestamp(),
            youtubeConnected: true,
            youtubeTokens: {
                accessToken,
                refreshToken: refreshToken || null,
                expiresAt,
            },
            preferences: {
                trackYouTubeHistory: true,
                trackOffPlatform: true,
            },
        }, { merge: true });
        console.log(`Initialized YouTube tracking for ${userId}`);
        return { success: true };
    }
    catch (error) {
        console.error('Error initializing YouTube tracking:', error);
        throw new https_1.HttpsError('internal', 'Failed to initialize tracking');
    }
});
//# sourceMappingURL=youtube-xp-functions.js.map