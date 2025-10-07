// Node.js compatible seed script for Firestore
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../../.env.local') });
dotenv.config({ path: resolve(__dirname, '../../.env') });

// Initialize Firebase Admin SDK
const app = initializeApp({
  credential: cert({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  }),
});

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
  try {
    console.log('🌱 Starting to seed communities...');
    
    for (const community of communities) {
      await db.collection('communities').doc(community.id).set(community);
      console.log(`✅ Seeded: ${community.name}`);
    }
    
    console.log('✅ Successfully seeded all communities to Firestore');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding communities:', error);
    process.exit(1);
  }
}

seedCommunities();

