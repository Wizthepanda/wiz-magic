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
    var _a, _b, _c;
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
            var _a, _b, _c, _d, _e;
            const userSnap = await tx.get(userRef);
            const communitySnap = await tx.get(communityRef);
            if (!communitySnap.exists) {
                throw new functions.https.HttpsError('not-found', 'Community not found.');
            }
            const communityData = communitySnap.data();
            const currentMembers = (_a = communityData === null || communityData === void 0 ? void 0 : communityData.members) !== null && _a !== void 0 ? _a : [];
            const offerZapsToNewMembers = (_b = communityData === null || communityData === void 0 ? void 0 : communityData.offerZAPsToNewMembers) !== null && _b !== void 0 ? _b : false;
            const zapReward = (_c = communityData === null || communityData === void 0 ? void 0 : communityData.newMemberZAPsReward) !== null && _c !== void 0 ? _c : 0;
            // Check if user already has access
            if (currentMembers.includes(uid)) {
                throw new functions.https.HttpsError('already-exists', 'You already have access to this community.');
            }
            let userZAPs = 0;
            let zapChange = -zapCost; // Default: deduct zapCost
            // If user ZAP account doesn't exist, create it (for new users)
            if (!userSnap.exists) {
                // For free communities, create account with 0 ZAPs
                // For free-zaps communities, create account with reward
                const initialZAPs = (zapCost === 0 && offerZapsToNewMembers && zapReward > 0) ? zapReward : 0;
                tx.set(userRef, {
                    totalZAPs: initialZAPs,
                    level: 1,
                    lastZAPUpdate: firestore_1.FieldValue.serverTimestamp(),
                });
                userZAPs = initialZAPs;
                zapChange = initialZAPs; // Set change to initial amount
            }
            else {
                userZAPs = (_e = (_d = userSnap.data()) === null || _d === void 0 ? void 0 : _d.totalZAPs) !== null && _e !== void 0 ? _e : 0;
                // Check if user has enough ZAPs for paid communities
                if (zapCost > 0 && userZAPs < zapCost) {
                    throw new functions.https.HttpsError('failed-precondition', `Insufficient ZAPs. You have ${userZAPs}, need ${zapCost}.`);
                }
                // Determine ZAP change based on community type
                if (zapCost === 0 && offerZapsToNewMembers && zapReward > 0) {
                    // Free-ZAPs community: ADD reward to user
                    zapChange = zapReward;
                }
                else if (zapCost > 0) {
                    // Paid community: DEDUCT cost from user
                    zapChange = -zapCost;
                }
                else {
                    // Free community: no change
                    zapChange = 0;
                }
                // Update user ZAPs if there's a change
                if (zapChange !== 0) {
                    tx.update(userRef, {
                        totalZAPs: userZAPs + zapChange,
                        lastZAPUpdate: firestore_1.FieldValue.serverTimestamp(),
                    });
                }
            }
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
                zapAmount: zapChange,
                zapCost: zapCost,
                zapReward: (offerZapsToNewMembers && zapReward > 0) ? zapReward : 0,
                type: zapCost > 0 ? 'community_purchase' : (offerZapsToNewMembers ? 'community_join_reward' : 'community_join_free'),
                status: 'completed',
                timestamp: firestore_1.FieldValue.serverTimestamp(),
            });
        });
        const communitySnap = await db.doc(`communities/${communityId}`).get();
        const communityData = communitySnap.data();
        const offerZapsToNewMembers = (_b = communityData === null || communityData === void 0 ? void 0 : communityData.offerZAPsToNewMembers) !== null && _b !== void 0 ? _b : false;
        const zapReward = (_c = communityData === null || communityData === void 0 ? void 0 : communityData.newMemberZAPsReward) !== null && _c !== void 0 ? _c : 0;
        let message = `Successfully joined ${communityTitle}!`;
        if (zapCost === 0 && offerZapsToNewMembers && zapReward > 0) {
            message = `Successfully joined ${communityTitle} and earned ${zapReward} ZAPs!`;
        }
        else if (zapCost > 0) {
            message = `Successfully joined ${communityTitle} for ${zapCost} ZAPs!`;
        }
        return {
            success: true,
            message,
            zapCost,
            zapReward: (offerZapsToNewMembers && zapReward > 0) ? zapReward : 0
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