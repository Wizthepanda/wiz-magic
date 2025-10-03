/**
 * Migration Script: Fix Blob URLs in Communities
 *
 * This script removes blob URLs from community coverMedia and replaces them
 * with placeholders. After running this, you can re-upload proper images.
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { readFileSync } from 'fs';

// Load environment variables from .env file
const envFile = readFileSync('.env', 'utf-8');
const envVars = {};
envFile.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const firebaseConfig = {
  apiKey: envVars.VITE_FIREBASE_API_KEY,
  authDomain: envVars.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: envVars.VITE_FIREBASE_PROJECT_ID,
  storageBucket: envVars.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: envVars.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: envVars.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixBlobUrls() {
  console.log('🔍 Scanning communities for blob URLs...\n');

  const communitiesRef = collection(db, 'communities');
  const snapshot = await getDocs(communitiesRef);

  let fixed = 0;
  let total = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    total++;

    if (!data.coverMedia || !Array.isArray(data.coverMedia)) {
      continue;
    }

    // Check if any media has blob URLs
    const hasBlobUrls = data.coverMedia.some(
      media => media.url?.startsWith('blob:') || media.thumbnail?.startsWith('blob:')
    );

    if (hasBlobUrls) {
      console.log(`📝 Fixing: ${data.title || 'Untitled'} (${docSnap.id})`);
      console.log(`   Found ${data.coverMedia.length} media items with blob URLs`);

      // Remove all coverMedia to allow re-upload
      await updateDoc(doc(db, 'communities', docSnap.id), {
        coverMedia: []
      });

      console.log(`   ✅ Cleared coverMedia - ready for re-upload\n`);
      fixed++;
    }
  }

  console.log('\n📊 Summary:');
  console.log(`   Total communities: ${total}`);
  console.log(`   Fixed communities: ${fixed}`);
  console.log(`   No changes needed: ${total - fixed}`);

  if (fixed > 0) {
    console.log('\n✅ Migration complete! You can now:');
    console.log('   1. Go to Create → Your Published Creations');
    console.log('   2. Edit each community');
    console.log('   3. Re-upload images (they will be saved with proper Firebase Storage URLs)');
  }
}

fixBlobUrls()
  .then(() => process.exit(0))
  .catch(error => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
