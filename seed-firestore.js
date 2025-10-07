import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
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

const communities = [
  {
    id: 'fitness-lounge',
    name: 'Fitness Lounge',
    title: 'Fitness Lounge',
    slug: 'fitness-lounge',
    description: 'A community for strength, wellness, and gym enthusiasts.',
    shortDescription: 'A community for strength, wellness, and gym enthusiasts.',
    category: 'Fitness',
    privacy: 'public',
    status: 'published',
    members: [],
    zapsRequired: 0,
    usdCoPay: 0,
    createdAt: new Date(),
    creatorId: 'system',
    creatorName: 'WIZ Team',
  },
  {
    id: 'ai-creators',
    name: 'AI Creators',
    title: 'AI Creators',
    slug: 'ai-creators',
    description: 'For innovators building the future with AI tools.',
    shortDescription: 'For innovators building the future with AI tools.',
    category: 'Technology',
    privacy: 'public',
    status: 'published',
    members: [],
    zapsRequired: 0,
    usdCoPay: 0,
    createdAt: new Date(),
    creatorId: 'system',
    creatorName: 'WIZ Team',
  },
  {
    id: 'music-haven',
    name: 'Music Haven',
    title: 'Music Haven',
    slug: 'music-haven',
    description: 'A creative space for DJs, producers, and artists.',
    shortDescription: 'A creative space for DJs, producers, and artists.',
    category: 'Music',
    privacy: 'public',
    status: 'published',
    members: [],
    zapsRequired: 0,
    usdCoPay: 0,
    createdAt: new Date(),
    creatorId: 'system',
    creatorName: 'WIZ Team',
  },
];

async function seedCommunities() {
  console.log('🌱 Starting to seed communities...\n');
  
  try {
    for (const community of communities) {
      const docRef = doc(db, 'communities', community.id);
      await setDoc(docRef, community);
      console.log(`✅ Seeded: ${community.name}`);
    }
    
    console.log('\n✅ Successfully seeded all communities to Firestore!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding communities:', error);
    process.exit(1);
  }
}

seedCommunities();

