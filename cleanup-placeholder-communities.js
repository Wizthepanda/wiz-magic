import { initializeApp } from 'firebase/app';
import { getFirestore, doc, deleteDoc, getDoc } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load Firebase config from environment
dotenv.config();

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Placeholder community IDs to remove
const placeholderIds = [
  'fitness-lounge',
  'ai-creators',
  'music-haven'
];

async function cleanupPlaceholderCommunities() {
  console.log('🧹 Starting cleanup of placeholder communities...\n');

  try {
    for (const id of placeholderIds) {
      const docRef = doc(db, 'communities', id);

      // Check if document exists
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log(`🗑️  Deleting: ${data.title || data.name || id}`);
        await deleteDoc(docRef);
        console.log(`   ✅ Deleted successfully`);
      } else {
        console.log(`⏭️  Skipping: ${id} (not found)`);
      }
    }

    console.log('\n✅ Successfully cleaned up all placeholder communities from Firestore!');
    console.log('💡 Your Community tab will now only show actual published courses.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error cleaning up communities:', error);
    process.exit(1);
  }
}

cleanupPlaceholderCommunities();
