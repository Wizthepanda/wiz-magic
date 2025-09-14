"use strict";
/**
 * Anti-Cheat System for WizXP Watch-to-Earn Platform
 * Implements multi-layered fraud prevention and validation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeWatchSession = exports.sendWatchEvents = exports.startWatchSession = void 0;
const https_1 = require("firebase-functions/v2/https");
const firestore_1 = require("firebase-admin/firestore");
const crypto = require("crypto");
const db = (0, firestore_1.getFirestore)();
// Configuration
const ANTI_CHEAT_CONFIG = {
    // Session settings
    SESSION_TOKEN_TTL: 15 * 60 * 1000,
    HEARTBEAT_INTERVAL: 10000,
    MAX_SESSION_DURATION: 4 * 60 * 60 * 1000,
    // XP settings
    XP_PER_30_SECONDS: 1,
    COMPLETION_BONUS_THRESHOLD: 0.75,
    COMPLETION_BONUS_XP: 0.1,
    // Fraud thresholds
    MAX_FORWARD_SEEKS: 2,
    MAX_SEEK_PERCENTAGE: 30,
    MAX_PLAYBACK_RATE: 1.25,
    MAX_HIDDEN_TIME_PERCENTAGE: 30,
    // Scoring thresholds
    SUSPICIOUS_SCORE: 5,
    FRAUD_SCORE: 12,
    // Rate limits
    MAX_XP_PER_VIDEO_PER_DAY: 100,
    MAX_DAILY_XP: 360,
    MAX_SESSIONS_PER_HOUR: 50
};
/**
 * Generate HMAC signed session token
 */
function generateSessionToken(sessionId, userId) {
    const secret = process.env.SESSION_SECRET || 'default-secret-change-in-production';
    const timestamp = Date.now();
    const payload = `${sessionId}:${userId}:${timestamp}`;
    const signature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return `${payload}:${signature}`;
}
/**
 * Verify session token
 */
function verifySessionToken(token, sessionId, userId) {
    try {
        const parts = token.split(':');
        if (parts.length !== 4)
            return false;
        const [tokenSessionId, tokenUserId, timestamp, signature] = parts;
        // Check session and user match
        if (tokenSessionId !== sessionId || tokenUserId !== userId)
            return false;
        // Check token not expired
        const tokenAge = Date.now() - parseInt(timestamp);
        if (tokenAge > ANTI_CHEAT_CONFIG.SESSION_TOKEN_TTL)
            return false;
        // Verify signature
        const secret = process.env.SESSION_SECRET || 'default-secret-change-in-production';
        const payload = `${tokenSessionId}:${tokenUserId}:${timestamp}`;
        const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
        return signature === expectedSignature;
    }
    catch (error) {
        console.error('Token verification error:', error);
        return false;
    }
}
/**
 * Calculate fraud score based on behavioral signals
 */
function calculateFraudScore(events, videoDuration) {
    var _a, _b;
    let score = 0;
    let largeSeeks = 0;
    let hiddenTime = 0;
    let maxPlaybackRate = 1;
    // Analyze events
    for (const event of events) {
        switch (event.type) {
            case 'seekStart':
                const { fromTime, toTime, seekPercentage } = event.data || {};
                if (toTime > fromTime && seekPercentage > ANTI_CHEAT_CONFIG.MAX_SEEK_PERCENTAGE) {
                    largeSeeks++;
                }
                break;
            case 'playbackRateChange':
                const rate = ((_a = event.data) === null || _a === void 0 ? void 0 : _a.rate) || 1;
                maxPlaybackRate = Math.max(maxPlaybackRate, rate);
                break;
            case 'visibilityChange':
                if ((_b = event.data) === null || _b === void 0 ? void 0 : _b.hiddenTime) {
                    hiddenTime = event.data.hiddenTime;
                }
                break;
        }
    }
    // Calculate session duration
    const sessionDuration = events.length > 0 ?
        Math.max(...events.map(e => e.timestamp)) - Math.min(...events.map(e => e.timestamp)) : 0;
    // Scoring rules
    if (largeSeeks > ANTI_CHEAT_CONFIG.MAX_FORWARD_SEEKS) {
        score += largeSeeks * 3;
    }
    if (maxPlaybackRate > ANTI_CHEAT_CONFIG.MAX_PLAYBACK_RATE) {
        score += Math.floor(maxPlaybackRate * 4);
    }
    const hiddenPercentage = sessionDuration > 0 ? (hiddenTime / sessionDuration) * 100 : 0;
    if (hiddenPercentage > ANTI_CHEAT_CONFIG.MAX_HIDDEN_TIME_PERCENTAGE) {
        score += Math.floor(hiddenPercentage / 10);
    }
    // Rapid identical patterns (basic check)
    const timeUpdates = events.filter(e => e.type === 'timeupdate');
    if (timeUpdates.length > 10) {
        const intervals = timeUpdates.slice(1).map((e, i) => e.timestamp - timeUpdates[i].timestamp);
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        // Very low variance suggests automated/scripted behavior
        if (variance < 100) {
            score += 6;
        }
    }
    return score;
}
/**
 * Calculate validated watch time from events
 */
function calculateValidatedWatchTime(events, videoDuration) {
    var _a;
    // Extract play/pause intervals
    const playIntervals = [];
    let currentPlay = null;
    let isPlaying = false;
    for (const event of events.sort((a, b) => a.timestamp - b.timestamp)) {
        switch (event.type) {
            case 'play':
                if (!isPlaying && event.currentTime !== undefined) {
                    currentPlay = { start: event.currentTime, end: event.currentTime };
                    isPlaying = true;
                }
                break;
            case 'pause':
            case 'ended':
                if (isPlaying && currentPlay && event.currentTime !== undefined) {
                    currentPlay.end = event.currentTime;
                    playIntervals.push(currentPlay);
                    currentPlay = null;
                    isPlaying = false;
                }
                break;
            case 'timeupdate':
            case 'heartbeat':
                if (isPlaying && currentPlay && event.currentTime !== undefined) {
                    currentPlay.end = Math.max(currentPlay.end, event.currentTime);
                }
                break;
            case 'seekStart':
                // Reset current interval on seek
                if (currentPlay && ((_a = event.data) === null || _a === void 0 ? void 0 : _a.toTime) !== undefined) {
                    playIntervals.push(currentPlay);
                    currentPlay = { start: event.data.toTime, end: event.data.toTime };
                }
                break;
        }
    }
    // Add final interval if still playing
    if (currentPlay) {
        playIntervals.push(currentPlay);
    }
    // Merge overlapping intervals and calculate total
    playIntervals.sort((a, b) => a.start - b.start);
    let totalWatched = 0;
    let lastEnd = -1;
    for (const interval of playIntervals) {
        const start = Math.max(interval.start, lastEnd);
        const end = Math.min(interval.end, videoDuration);
        if (end > start) {
            totalWatched += end - start;
            lastEnd = end;
        }
    }
    return Math.max(0, totalWatched);
}
/**
 * Start watch session
 */
exports.startWatchSession = (0, https_1.onCall)({
    cors: true,
    region: 'us-central1'
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { sessionId, videoId, videoDuration, deviceFingerprint } = request.data;
    const userId = request.auth.uid;
    if (!sessionId || !videoId || !videoDuration) {
        throw new https_1.HttpsError('invalid-argument', 'Missing required session data');
    }
    try {
        // Check rate limits
        const now = Date.now();
        const hourAgo = now - (60 * 60 * 1000);
        const recentSessions = await db.collection('watchSessions')
            .where('userId', '==', userId)
            .where('startTimestamp', '>', hourAgo)
            .get();
        if (recentSessions.size >= ANTI_CHEAT_CONFIG.MAX_SESSIONS_PER_HOUR) {
            throw new https_1.HttpsError('resource-exhausted', 'Too many sessions in the last hour');
        }
        // Generate signed session token
        const sessionToken = generateSessionToken(sessionId, userId);
        // Create session document
        const sessionData = {
            sessionId,
            userId,
            videoId,
            videoDuration,
            startTimestamp: now,
            events: [],
            deviceFingerprint,
            sessionToken,
            fraudScore: 0,
            validatedSeconds: 0,
            xpAwarded: 0,
            status: 'active'
        };
        await db.collection('watchSessions').doc(sessionId).set(sessionData);
        console.log(`✅ Watch session started: ${sessionId} for user ${userId}`);
        return {
            success: true,
            sessionToken,
            sessionId
        };
    }
    catch (error) {
        console.error('Error starting watch session:', error);
        throw new https_1.HttpsError('internal', 'Failed to start session');
    }
});
/**
 * Receive and validate watch events
 */
exports.sendWatchEvents = (0, https_1.onCall)({
    cors: true,
    region: 'us-central1'
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { sessionId, sessionToken, events } = request.data;
    const userId = request.auth.uid;
    if (!sessionId || !sessionToken || !events || !Array.isArray(events)) {
        throw new https_1.HttpsError('invalid-argument', 'Invalid event data');
    }
    try {
        // Verify session token
        if (!verifySessionToken(sessionToken, sessionId, userId)) {
            throw new https_1.HttpsError('permission-denied', 'Invalid session token');
        }
        // Get session
        const sessionDoc = await db.collection('watchSessions').doc(sessionId).get();
        if (!sessionDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Session not found');
        }
        // Validate events are recent and properly ordered
        const now = Date.now();
        const validEvents = events.filter((event) => {
            // Must be recent (within 5 minutes)
            const age = now - event.timestamp;
            if (age > 5 * 60 * 1000)
                return false;
            // Must have valid structure
            if (!event.type || typeof event.timestamp !== 'number')
                return false;
            return true;
        });
        // Update session with new events
        await db.collection('watchSessions').doc(sessionId).update({
            events: firestore_1.FieldValue.arrayUnion(...validEvents),
            lastEventTimestamp: now
        });
        console.log(`📨 Received ${validEvents.length} events for session ${sessionId}`);
        return { success: true, eventsProcessed: validEvents.length };
    }
    catch (error) {
        console.error('Error processing watch events:', error);
        throw new https_1.HttpsError('internal', 'Failed to process events');
    }
});
/**
 * Close session and calculate XP
 */
exports.closeWatchSession = (0, https_1.onCall)({
    cors: true,
    region: 'us-central1'
}, async (request) => {
    if (!request.auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { sessionId, sessionToken, endTimestamp, finalStats } = request.data;
    const userId = request.auth.uid;
    if (!sessionId || !sessionToken) {
        throw new https_1.HttpsError('invalid-argument', 'Missing session data');
    }
    try {
        // Verify session token
        if (!verifySessionToken(sessionToken, sessionId, userId)) {
            throw new https_1.HttpsError('permission-denied', 'Invalid session token');
        }
        // Get session
        const sessionDoc = await db.collection('watchSessions').doc(sessionId).get();
        if (!sessionDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Session not found');
        }
        const sessionData = sessionDoc.data();
        // Calculate fraud score
        const fraudScore = calculateFraudScore(sessionData.events, sessionData.videoDuration);
        // Calculate validated watch time
        const validatedSeconds = calculateValidatedWatchTime(sessionData.events, sessionData.videoDuration);
        // Determine if session is suspicious
        let status = 'completed';
        let xpAwarded = 0;
        if (fraudScore >= ANTI_CHEAT_CONFIG.FRAUD_SCORE) {
            status = 'flagged';
            console.warn(`🚨 Session ${sessionId} flagged with fraud score: ${fraudScore}`);
        }
        else if (fraudScore >= ANTI_CHEAT_CONFIG.SUSPICIOUS_SCORE) {
            status = 'completed';
            // Reduce XP for suspicious sessions
            xpAwarded = Math.floor(validatedSeconds / 30) * ANTI_CHEAT_CONFIG.XP_PER_30_SECONDS * 0.5;
        }
        else {
            // Normal XP calculation
            xpAwarded = Math.floor(validatedSeconds / 30) * ANTI_CHEAT_CONFIG.XP_PER_30_SECONDS;
            // Completion bonus if watched enough
            const watchPercentage = validatedSeconds / sessionData.videoDuration;
            if (watchPercentage >= ANTI_CHEAT_CONFIG.COMPLETION_BONUS_THRESHOLD) {
                xpAwarded = Math.floor(xpAwarded * (1 + ANTI_CHEAT_CONFIG.COMPLETION_BONUS_XP));
            }
        }
        // Check daily limits
        const today = new Date().toISOString().split('T')[0];
        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        const userData = userDoc.data() || {};
        const dailyXP = userData.dailyXP || 0;
        const videoXPToday = userData[`videoXP_${sessionData.videoId}_${today}`] || 0;
        // Apply rate limits
        if (dailyXP >= ANTI_CHEAT_CONFIG.MAX_DAILY_XP) {
            xpAwarded = 0;
            console.log(`⚠️ Daily XP limit reached for user ${userId}`);
        }
        else if (videoXPToday >= ANTI_CHEAT_CONFIG.MAX_XP_PER_VIDEO_PER_DAY) {
            xpAwarded = 0;
            console.log(`⚠️ Video XP limit reached for ${sessionData.videoId}`);
        }
        else {
            // Cap to remaining daily limit
            xpAwarded = Math.min(xpAwarded, ANTI_CHEAT_CONFIG.MAX_DAILY_XP - dailyXP);
            xpAwarded = Math.min(xpAwarded, ANTI_CHEAT_CONFIG.MAX_XP_PER_VIDEO_PER_DAY - videoXPToday);
        }
        // Update session
        await db.collection('watchSessions').doc(sessionId).update({
            endTimestamp: endTimestamp || Date.now(),
            fraudScore,
            validatedSeconds,
            xpAwarded,
            status,
            finalStats
        });
        // Award XP if valid
        if (xpAwarded > 0 && status !== 'flagged') {
            await userRef.update({
                currentXP: firestore_1.FieldValue.increment(xpAwarded),
                totalXP: firestore_1.FieldValue.increment(xpAwarded),
                dailyXP: firestore_1.FieldValue.increment(xpAwarded),
                [`videoXP_${sessionData.videoId}_${today}`]: firestore_1.FieldValue.increment(xpAwarded),
                lastActivity: new Date()
            });
            console.log(`🎯 Awarded ${xpAwarded} XP to user ${userId} for session ${sessionId}`);
        }
        return {
            success: true,
            xpAwarded,
            validatedSeconds,
            fraudScore,
            status
        };
    }
    catch (error) {
        console.error('Error closing watch session:', error);
        throw new https_1.HttpsError('internal', 'Failed to close session');
    }
});
//# sourceMappingURL=anti-cheat-system.js.map