/**
 * Cloud Function: Purchase Community Access with ZAPs
 * Secure backend transaction to avoid Firestore permission issues
 */

import * as functions from 'firebase-functions';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

export const purchaseCommunityAccess = functions.https.onCall(async (data, context) => {
  const uid = context.auth?.uid;
  const { communityId, zapCost, communityTitle } = data;

  if (!uid) {
    throw new functions.https.HttpsError('unauthenticated', 'User not logged in.');
  }

  if (!communityId || typeof zapCost !== 'number' || !communityTitle) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing or invalid parameters.');
  }

  const db = getFirestore();
  const userRef = db.doc(`userZAPs/${uid}`);
  const communityRef = db.doc(`communities/${communityId}`);
  const transactionRef = db.collection('transactions').doc();

  try {
    await db.runTransaction(async (tx) => {
      const userSnap = await tx.get(userRef);
      const communitySnap = await tx.get(communityRef);

      if (!userSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'User ZAP account not found.');
      }

      if (!communitySnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Community not found.');
      }

      const userZAPs = userSnap.data()?.totalZAPs ?? 0;
      const currentMembers = communitySnap.data()?.members ?? [];

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
        lastZAPUpdate: FieldValue.serverTimestamp(),
      });

      // Add user to community
      tx.update(communityRef, {
        members: FieldValue.arrayUnion(uid),
        memberCount: FieldValue.increment(1),
        lastUpdated: FieldValue.serverTimestamp(),
      });

      // Create transaction record
      tx.set(transactionRef, {
        userId: uid,
        communityId,
        communityTitle,
        zapAmount: zapCost,
        type: 'community_purchase',
        status: 'completed',
        timestamp: FieldValue.serverTimestamp(),
      });
    });

    return {
      success: true,
      message: `Successfully joined ${communityTitle}!`,
      zapCost
    };
  } catch (error: any) {
    console.error('Error purchasing community access:', error);

    // Re-throw HttpsErrors
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    // Wrap other errors
    throw new functions.https.HttpsError('internal', error.message || 'Failed to purchase community access.');
  }
});
