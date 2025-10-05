"use strict";
/**
 * Cloud Function: Purchase Community Access with ZAPs
 * Secure backend transaction to avoid Firestore permission issues
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.purchaseCommunityAccess = void 0;
const functions = require("firebase-functions");
const firestore_1 = require("firebase-admin/firestore");
exports.purchaseCommunityAccess = functions.https.onCall(async (data, context) => {
    var _a;
    const uid = (_a = context.auth) === null || _a === void 0 ? void 0 : _a.uid;
    const { communityId, zapCost, communityTitle } = data;
    if (!uid) {
        throw new functions.https.HttpsError('unauthenticated', 'User not logged in.');
    }
    if (!communityId || typeof zapCost !== 'number' || !communityTitle) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing or invalid parameters.');
    }
    const db = (0, firestore_1.getFirestore)();
    const userRef = db.doc(`userZAPs/${uid}`);
    const communityRef = db.doc(`communities/${communityId}`);
    const transactionRef = db.collection('transactions').doc();
    try {
        await db.runTransaction(async (tx) => {
            var _a, _b, _c, _d;
            const userSnap = await tx.get(userRef);
            const communitySnap = await tx.get(communityRef);
            if (!userSnap.exists) {
                throw new functions.https.HttpsError('not-found', 'User ZAP account not found.');
            }
            if (!communitySnap.exists) {
                throw new functions.https.HttpsError('not-found', 'Community not found.');
            }
            const userZAPs = (_b = (_a = userSnap.data()) === null || _a === void 0 ? void 0 : _a.totalZAPs) !== null && _b !== void 0 ? _b : 0;
            const currentMembers = (_d = (_c = communitySnap.data()) === null || _c === void 0 ? void 0 : _c.members) !== null && _d !== void 0 ? _d : [];
            // Check if user already has access
            if (currentMembers.includes(uid)) {
                throw new functions.https.HttpsError('already-exists', 'You already have access to this community.');
            }
            // Check if user has enough ZAPs
            if (userZAPs < zapCost) {
                throw new functions.https.HttpsError('failed-precondition', `Insufficient ZAPs. You have ${userZAPs}, need ${zapCost}.`);
            }
            // Deduct ZAPs from user
            tx.update(userRef, {
                totalZAPs: userZAPs - zapCost,
                lastZAPUpdate: firestore_1.FieldValue.serverTimestamp(),
            });
            // Add user to community
            tx.update(communityRef, {
                members: firestore_1.FieldValue.arrayUnion(uid),
                memberCount: firestore_1.FieldValue.increment(1),
                lastUpdated: firestore_1.FieldValue.serverTimestamp(),
            });
            // Create transaction record
            tx.set(transactionRef, {
                userId: uid,
                communityId,
                communityTitle,
                zapAmount: zapCost,
                type: 'community_purchase',
                status: 'completed',
                timestamp: firestore_1.FieldValue.serverTimestamp(),
            });
        });
        return {
            success: true,
            message: `Successfully joined ${communityTitle}!`,
            zapCost
        };
    }
    catch (error) {
        console.error('Error purchasing community access:', error);
        // Re-throw HttpsErrors
        if (error instanceof functions.https.HttpsError) {
            throw error;
        }
        // Wrap other errors
        throw new functions.https.HttpsError('internal', error.message || 'Failed to purchase community access.');
    }
});
//# sourceMappingURL=purchaseCommunityAccess.js.map