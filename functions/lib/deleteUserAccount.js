"use strict";
/**
 * Cloud Function: Delete User Account and All Associated Data
 * This function completely removes a user account and all their data
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUserAccount = void 0;
const functions = require("firebase-functions");
const auth_1 = require("firebase-admin/auth");
const firestore_1 = require("firebase-admin/firestore");
exports.deleteUserAccount = functions.https.onCall(async (data, context) => {
    const { email, adminSecret } = data;
    // Check admin secret FIRST - this allows admin access without authentication
    const expectedSecret = 'DELETE_USERS_SECRET_2024';
    if (!adminSecret || adminSecret !== expectedSecret) {
        throw new functions.https.HttpsError('permission-denied', 'Invalid or missing admin secret');
    }
    if (!email) {
        throw new functions.https.HttpsError('invalid-argument', 'Email is required');
    }
    const auth = (0, auth_1.getAuth)();
    const db = (0, firestore_1.getFirestore)();
    try {
        console.log(`🗑️  Starting deletion process for: ${email}`);
        // Get user by email
        let userRecord;
        try {
            userRecord = await auth.getUserByEmail(email);
        }
        catch (error) {
            if (error.code === 'auth/user-not-found') {
                return {
                    success: true,
                    message: `User ${email} not found in Firebase Auth - may already be deleted`,
                    details: {
                        authDeleted: false,
                        firestoreDeleted: false
                    }
                };
            }
            throw error;
        }
        const targetUid = userRecord.uid;
        console.log(`📌 Found user: ${email} with UID: ${targetUid}`);
        const deletionStats = {
            authDeleted: false,
            firestoreCollections: {},
            communitiesLeft: 0,
            videosDeleted: 0,
            transactionsDeleted: 0,
            watchHistoryDeleted: 0
        };
        // 1. Delete from main user collections
        const mainCollections = ['users', 'userXP', 'userZAPs', 'userProfiles', 'userSettings'];
        for (const collectionName of mainCollections) {
            const docRef = db.collection(collectionName).doc(targetUid);
            const docSnap = await docRef.get();
            if (docSnap.exists) {
                await docRef.delete();
                deletionStats.firestoreCollections[collectionName] = 1;
                console.log(`  ✅ Deleted from ${collectionName}`);
            }
        }
        // 2. Delete watch history subcollections
        // Delete from users/{uid}/watchHistory (if exists)
        const watchHistoryRef = db.collection('users').doc(targetUid).collection('watchHistory');
        const watchHistorySnap = await watchHistoryRef.get();
        // Delete from users/{uid}/videos (completed videos tracking)
        const videosRef = db.collection('users').doc(targetUid).collection('videos');
        const videosSnap = await videosRef.get();
        const totalWatchHistory = watchHistorySnap.size + videosSnap.size;
        if (totalWatchHistory > 0) {
            const batch = db.batch();
            watchHistorySnap.docs.forEach(doc => batch.delete(doc.ref));
            videosSnap.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            deletionStats.watchHistoryDeleted = totalWatchHistory;
            console.log(`  ✅ Deleted ${totalWatchHistory} watch history entries (${watchHistorySnap.size} watchHistory + ${videosSnap.size} videos)`);
        }
        // 3. Remove user from communities (members array)
        const communitiesSnapshot = await db.collection('communities')
            .where('members', 'array-contains', targetUid)
            .get();
        if (!communitiesSnapshot.empty) {
            const batch = db.batch();
            communitiesSnapshot.docs.forEach(doc => {
                batch.update(doc.ref, {
                    members: firestore_1.FieldValue.arrayRemove(targetUid),
                    memberCount: firestore_1.FieldValue.increment(-1)
                });
            });
            await batch.commit();
            deletionStats.communitiesLeft = communitiesSnapshot.size;
            console.log(`  ✅ Removed from ${communitiesSnapshot.size} communities`);
        }
        // 4. Delete user's videos
        const videosSnapshot = await db.collection('videos')
            .where('createdBy', '==', targetUid)
            .get();
        const creatorVideosSnapshot = await db.collection('creatorVideos')
            .where('createdBy', '==', targetUid)
            .get();
        const totalVideos = videosSnapshot.size + creatorVideosSnapshot.size;
        if (totalVideos > 0) {
            const batch = db.batch();
            videosSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            creatorVideosSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            deletionStats.videosDeleted = totalVideos;
            console.log(`  ✅ Deleted ${totalVideos} videos`);
        }
        // 5. Delete user's communities/courses
        const userCommunitiesSnapshot = await db.collection('communities')
            .where('createdBy', '==', targetUid)
            .get();
        const userCoursesSnapshot = await db.collection('courses_community')
            .where('createdBy', '==', targetUid)
            .get();
        const totalCreations = userCommunitiesSnapshot.size + userCoursesSnapshot.size;
        if (totalCreations > 0) {
            const batch = db.batch();
            userCommunitiesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            userCoursesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            console.log(`  ✅ Deleted ${totalCreations} communities/courses`);
        }
        // 6. Delete transactions
        const transactionsSnapshot = await db.collection('transactions')
            .where('userId', '==', targetUid)
            .get();
        if (!transactionsSnapshot.empty) {
            const batch = db.batch();
            transactionsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
            await batch.commit();
            deletionStats.transactionsDeleted = transactionsSnapshot.size;
            console.log(`  ✅ Deleted ${transactionsSnapshot.size} transactions`);
        }
        // 7. Delete Firebase Auth account (do this last)
        await auth.deleteUser(targetUid);
        deletionStats.authDeleted = true;
        console.log(`  ✅ Deleted Firebase Auth account`);
        console.log(`✅ Successfully deleted user: ${email}`);
        return {
            success: true,
            message: `User ${email} has been completely deleted`,
            details: deletionStats
        };
    }
    catch (error) {
        console.error(`❌ Error deleting user ${email}:`, error);
        throw new functions.https.HttpsError('internal', error.message || 'Failed to delete user');
    }
});
//# sourceMappingURL=deleteUserAccount.js.map