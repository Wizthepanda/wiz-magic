/**
 * Script to add creatorId field to existing videos
 *
 * This script updates all videos in the 'videos' and 'creatorVideos' collections
 * to include a creatorId field, which is required for creator profile navigation.
 *
 * Usage:
 * 1. Set your Firebase UID in the CREATOR_UID constant below
 * 2. Run: npx ts-node scripts/add-creator-id-to-videos.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';

// Firebase configuration (use your actual config)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// YOUR FIREBASE USER ID - Replace with your actual UID
const CREATOR_UID = 'QrThECi8GPbXnKnhLp40BiQdVzm1';

async function updateVideosCollection() {
  console.log('🔄 Updating videos collection...');

  try {
    const videosRef = collection(db, 'videos');
    const snapshot = await getDocs(videosRef);

    console.log(`📊 Found ${snapshot.docs.length} videos in 'videos' collection`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const videoDoc of snapshot.docs) {
      const data = videoDoc.data();

      // Skip if creatorId already exists
      if (data.creatorId) {
        console.log(`⏭️  Skipping ${videoDoc.id} - already has creatorId: ${data.creatorId}`);
        skipped++;
        continue;
      }

      try {
        // Update the document with creatorId
        await updateDoc(doc(db, 'videos', videoDoc.id), {
          creatorId: CREATOR_UID,
          updatedAt: new Date().toISOString()
        });

        console.log(`✅ Updated video: ${videoDoc.id} (${data.title || 'Untitled'})`);
        updated++;
      } catch (error) {
        console.error(`❌ Error updating ${videoDoc.id}:`, error);
        errors++;
      }
    }

    console.log(`\n📊 Videos Collection Summary:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);

  } catch (error) {
    console.error('❌ Error accessing videos collection:', error);
  }
}

async function updateCreatorVideosCollection() {
  console.log('\n🔄 Updating creatorVideos collection...');

  try {
    const creatorVideosRef = collection(db, 'creatorVideos');
    const snapshot = await getDocs(creatorVideosRef);

    console.log(`📊 Found ${snapshot.docs.length} videos in 'creatorVideos' collection`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const videoDoc of snapshot.docs) {
      const data = videoDoc.data();

      // Skip if creatorId already exists
      if (data.creatorId) {
        console.log(`⏭️  Skipping ${videoDoc.id} - already has creatorId: ${data.creatorId}`);
        skipped++;
        continue;
      }

      try {
        // Update the document with creatorId
        await updateDoc(doc(db, 'creatorVideos', videoDoc.id), {
          creatorId: CREATOR_UID,
          updatedAt: new Date().toISOString()
        });

        console.log(`✅ Updated creator video: ${videoDoc.id} (${data.title || 'Untitled'})`);
        updated++;
      } catch (error) {
        console.error(`❌ Error updating ${videoDoc.id}:`, error);
        errors++;
      }
    }

    console.log(`\n📊 Creator Videos Collection Summary:`);
    console.log(`   ✅ Updated: ${updated}`);
    console.log(`   ⏭️  Skipped: ${skipped}`);
    console.log(`   ❌ Errors: ${errors}`);

  } catch (error) {
    console.error('❌ Error accessing creatorVideos collection:', error);
  }
}

async function main() {
  console.log('🚀 Starting video update script...');
  console.log(`📝 Creator UID: ${CREATOR_UID}\n`);

  // Confirm before proceeding
  console.log('⚠️  This will update ALL videos without a creatorId field');
  console.log('⚠️  Press Ctrl+C to cancel, or wait 3 seconds to continue...\n');

  await new Promise(resolve => setTimeout(resolve, 3000));

  // Update both collections
  await updateVideosCollection();
  await updateCreatorVideosCollection();

  console.log('\n✅ Script completed!');
  process.exit(0);
}

// Run the script
main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
