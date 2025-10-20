/**
 * Script to completely delete user accounts and all associated data
 * Usage: node scripts/delete-user-accounts.js
 */

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

// Accounts to delete
const emailsToDelete = [
  'beacontags@gmail.com',
  'wiztym@gmail.com',
  'wizsparkles@gmail.com'
];

/**
 * Get user ID from email
 */
async function getUserIdFromEmail(email) {
  try {
    const userRecord = await auth.getUserByEmail(email);
    return userRecord.uid;
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      console.log(`❌ User not found in Auth: ${email}`);
      return null;
    }
    throw error;
  }
}

/**
 * Delete all documents in a collection for a user
 */
async function deleteUserFromCollection(collectionName, uid) {
  const snapshot = await db.collection(collectionName).doc(uid).get();

  if (snapshot.exists) {
    await snapshot.ref.delete();
    console.log(`  ✅ Deleted from ${collectionName}`);
    return true;
  } else {
    console.log(`  ⏭️  No data in ${collectionName}`);
    return false;
  }
}

/**
 * Delete all documents in a subcollection
 */
async function deleteSubcollection(parentPath, subcollectionName) {
  const snapshot = await db.collection(parentPath).doc(subcollectionName).collection(subcollectionName).get();

  if (snapshot.empty) {
    return 0;
  }

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  return snapshot.size;
}

/**
 * Delete user from communities (remove from members arrays)
 */
async function removeUserFromCommunities(uid) {
  const communitiesSnapshot = await db.collection('communities')
    .where('members', 'array-contains', uid)
    .get();

  if (communitiesSnapshot.empty) {
    console.log(`  ⏭️  User not in any communities`);
    return 0;
  }

  const batch = db.batch();
  communitiesSnapshot.docs.forEach(doc => {
    batch.update(doc.ref, {
      members: admin.firestore.FieldValue.arrayRemove(uid),
      memberCount: admin.firestore.FieldValue.increment(-1)
    });
  });

  await batch.commit();
  console.log(`  ✅ Removed from ${communitiesSnapshot.size} communities`);
  return communitiesSnapshot.size;
}

/**
 * Delete watch history
 */
async function deleteWatchHistory(uid) {
  const watchHistoryRef = db.collection('users').doc(uid).collection('watchHistory');
  const snapshot = await watchHistoryRef.get();

  if (snapshot.empty) {
    console.log(`  ⏭️  No watch history found`);
    return 0;
  }

  const batch = db.batch();
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`  ✅ Deleted ${snapshot.size} watch history entries`);
  return snapshot.size;
}

/**
 * Delete all videos created by user
 */
async function deleteUserVideos(uid) {
  // Delete from videos collection
  const videosSnapshot = await db.collection('videos')
    .where('createdBy', '==', uid)
    .get();

  // Delete from creatorVideos collection
  const creatorVideosSnapshot = await db.collection('creatorVideos')
    .where('createdBy', '==', uid)
    .get();

  const totalVideos = videosSnapshot.size + creatorVideosSnapshot.size;

  if (totalVideos === 0) {
    console.log(`  ⏭️  No videos created by user`);
    return 0;
  }

  const batch = db.batch();

  videosSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  creatorVideosSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`  ✅ Deleted ${totalVideos} videos`);
  return totalVideos;
}

/**
 * Delete user communities created by user
 */
async function deleteUserCommunities(uid) {
  const communitiesSnapshot = await db.collection('communities')
    .where('createdBy', '==', uid)
    .get();

  const coursesSnapshot = await db.collection('courses_community')
    .where('createdBy', '==', uid)
    .get();

  const totalItems = communitiesSnapshot.size + coursesSnapshot.size;

  if (totalItems === 0) {
    console.log(`  ⏭️  No communities/courses created by user`);
    return 0;
  }

  const batch = db.batch();

  communitiesSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  coursesSnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
  console.log(`  ✅ Deleted ${totalItems} communities/courses`);
  return totalItems;
}

/**
 * Delete all user data from Firestore
 */
async function deleteUserData(uid, email) {
  console.log(`\n🗑️  Deleting all data for: ${email} (${uid})`);

  // Delete from main user collections
  await deleteUserFromCollection('users', uid);
  await deleteUserFromCollection('userXP', uid);
  await deleteUserFromCollection('userZAPs', uid);
  await deleteUserFromCollection('userProfiles', uid);
  await deleteUserFromCollection('userSettings', uid);

  // Delete watch history
  await deleteWatchHistory(uid);

  // Remove from communities
  await removeUserFromCommunities(uid);

  // Delete created content
  await deleteUserVideos(uid);
  await deleteUserCommunities(uid);

  // Delete transactions
  const transactionsSnapshot = await db.collection('transactions')
    .where('userId', '==', uid)
    .get();

  if (!transactionsSnapshot.empty) {
    const batch = db.batch();
    transactionsSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`  ✅ Deleted ${transactionsSnapshot.size} transactions`);
  } else {
    console.log(`  ⏭️  No transactions found`);
  }

  console.log(`✅ Firestore data deleted for ${email}`);
}

/**
 * Delete Firebase Auth account
 */
async function deleteAuthAccount(uid, email) {
  try {
    await auth.deleteUser(uid);
    console.log(`✅ Firebase Auth account deleted for ${email}\n`);
  } catch (error) {
    console.error(`❌ Error deleting auth account for ${email}:`, error.message);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('🚀 Starting account deletion process...\n');
  console.log('📧 Accounts to delete:');
  emailsToDelete.forEach(email => console.log(`   - ${email}`));
  console.log('\n⚠️  WARNING: This will permanently delete all data!\n');

  // Wait 5 seconds to allow user to cancel
  console.log('Starting in 5 seconds... (Press Ctrl+C to cancel)');
  await new Promise(resolve => setTimeout(resolve, 5000));

  for (const email of emailsToDelete) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Processing: ${email}`);
    console.log('='.repeat(60));

    try {
      // Get user ID
      const uid = await getUserIdFromEmail(email);

      if (!uid) {
        console.log(`⚠️  Skipping ${email} - not found in Firebase Auth\n`);
        continue;
      }

      console.log(`📌 User ID: ${uid}`);

      // Delete all Firestore data
      await deleteUserData(uid, email);

      // Delete Firebase Auth account
      await deleteAuthAccount(uid, email);

      console.log(`✅ COMPLETE: ${email} has been fully deleted`);

    } catch (error) {
      console.error(`❌ Error processing ${email}:`, error);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Account deletion process completed!');
  console.log('='.repeat(60));
  console.log('\nThese accounts can now sign up fresh with:');
  console.log('  ✓ New user IDs');
  console.log('  ✓ Zero XP/ZAPs');
  console.log('  ✓ No watch history');
  console.log('  ✓ No community memberships');
  console.log('  ✓ Clean slate\n');

  process.exit(0);
}

// Run the script
main().catch(error => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
