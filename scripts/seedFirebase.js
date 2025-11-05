/**
 * Firebase Seed Script - Populate WIZUP Platform with Sample Data
 *
 * Run this script to populate your Firebase database with sample:
 * - Featured Creators
 * - Videos
 * - Communities
 * - Reward Tiers
 *
 * Usage: node scripts/seedFirebase.js
 */

import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  doc,
  Timestamp
} from 'firebase/firestore';

// Firebase config (uses same config as main app)
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyCD6kuuaobXR1fCEbPwrwIy6FDwZtRmeV8",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "wiz-magic-platform.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "wiz-magic-platform",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "wiz-magic-platform.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "485151111726",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:485151111726:web:914f4e974eae0f49e23dbf",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Sample Creators
const sampleCreators = [
  {
    uid: 'creator-1',
    displayName: 'TechMaster Alex',
    email: 'alex@example.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    creatorProfile: true,
    bio: 'Teaching web development and coding best practices',
    category: 'Technology',
    subscriberCount: 50000,
    createdAt: Timestamp.now(),
  },
  {
    uid: 'creator-2',
    displayName: 'Design Guru Sarah',
    email: 'sarah@example.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    creatorProfile: true,
    bio: 'UI/UX design principles and modern design trends',
    category: 'Design',
    subscriberCount: 35000,
    createdAt: Timestamp.now(),
  },
  {
    uid: 'creator-3',
    displayName: 'Science Pro Mike',
    email: 'mike@example.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    creatorProfile: true,
    bio: 'Making science fun and accessible for everyone',
    category: 'Science',
    subscriberCount: 45000,
    createdAt: Timestamp.now(),
  },
  {
    uid: 'creator-4',
    displayName: 'Business Insights Emma',
    email: 'emma@example.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    creatorProfile: true,
    bio: 'Entrepreneurship and business strategy for startups',
    category: 'Business',
    subscriberCount: 40000,
    createdAt: Timestamp.now(),
  },
  {
    uid: 'creator-5',
    displayName: 'Math Wizard David',
    email: 'david@example.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    creatorProfile: true,
    bio: 'Advanced mathematics made simple and engaging',
    category: 'Mathematics',
    subscriberCount: 30000,
    createdAt: Timestamp.now(),
  },
  {
    uid: 'creator-6',
    displayName: 'Language Learner Lisa',
    email: 'lisa@example.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    creatorProfile: true,
    bio: 'Polyglot sharing language learning techniques',
    category: 'Languages',
    subscriberCount: 25000,
    createdAt: Timestamp.now(),
  },
  {
    uid: 'creator-7',
    displayName: 'AI Expert James',
    email: 'james@example.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    creatorProfile: true,
    bio: 'Artificial Intelligence and Machine Learning tutorials',
    category: 'AI & ML',
    subscriberCount: 60000,
    createdAt: Timestamp.now(),
  },
  {
    uid: 'creator-8',
    displayName: 'Creative Writer Sophia',
    email: 'sophia@example.com',
    photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    creatorProfile: true,
    bio: 'Creative writing and storytelling masterclasses',
    category: 'Writing',
    subscriberCount: 20000,
    createdAt: Timestamp.now(),
  },
];

// Sample Videos
const sampleVideos = [
  {
    title: 'React 18 Complete Guide: Build Modern Web Apps',
    thumbnail: 'https://picsum.photos/seed/react18/640/360',
    userId: 'creator-1',
    creatorName: 'TechMaster Alex',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    category: 'Technology',
    subcategory: 'Web Development',
    status: 'published',
    views: 15000,
    duration: 3600,
    xpReward: 100,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)),
  },
  {
    title: 'Figma to Code: Professional UI Design Workflow',
    thumbnail: 'https://picsum.photos/seed/figma/640/360',
    userId: 'creator-2',
    creatorName: 'Design Guru Sarah',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    category: 'Design',
    subcategory: 'UI/UX',
    status: 'published',
    views: 12000,
    duration: 2400,
    xpReward: 80,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)),
  },
  {
    title: 'Quantum Physics Explained Simply',
    thumbnail: 'https://picsum.photos/seed/quantum/640/360',
    userId: 'creator-3',
    creatorName: 'Science Pro Mike',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    category: 'Science',
    subcategory: 'Physics',
    status: 'published',
    views: 18000,
    duration: 3000,
    xpReward: 120,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 3 * 60 * 60 * 1000)),
  },
  {
    title: 'Startup Growth Strategies That Actually Work',
    thumbnail: 'https://picsum.photos/seed/startup/640/360',
    userId: 'creator-4',
    creatorName: 'Business Insights Emma',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    category: 'Business',
    subcategory: 'Entrepreneurship',
    status: 'published',
    views: 10000,
    duration: 2700,
    xpReward: 90,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 12 * 60 * 60 * 1000)),
  },
  {
    title: 'Advanced Calculus: Integration Techniques',
    thumbnail: 'https://picsum.photos/seed/calculus/640/360',
    userId: 'creator-5',
    creatorName: 'Math Wizard David',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    category: 'Mathematics',
    subcategory: 'Calculus',
    status: 'published',
    views: 8000,
    duration: 3300,
    xpReward: 110,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 6 * 60 * 60 * 1000)),
  },
  {
    title: 'Spanish Conversation Practice for Beginners',
    thumbnail: 'https://picsum.photos/seed/spanish/640/360',
    userId: 'creator-6',
    creatorName: 'Language Learner Lisa',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    category: 'Languages',
    subcategory: 'Spanish',
    status: 'published',
    views: 9500,
    duration: 1800,
    xpReward: 70,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 18 * 60 * 60 * 1000)),
  },
  {
    title: 'Machine Learning Fundamentals with Python',
    thumbnail: 'https://picsum.photos/seed/ml/640/360',
    userId: 'creator-7',
    creatorName: 'AI Expert James',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    category: 'AI & ML',
    subcategory: 'Machine Learning',
    status: 'published',
    views: 20000,
    duration: 4200,
    xpReward: 150,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 1 * 60 * 60 * 1000)),
  },
  {
    title: 'Creative Writing: Crafting Compelling Characters',
    thumbnail: 'https://picsum.photos/seed/writing/640/360',
    userId: 'creator-8',
    creatorName: 'Creative Writer Sophia',
    creatorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophia',
    category: 'Writing',
    subcategory: 'Fiction',
    status: 'published',
    views: 7000,
    duration: 2100,
    xpReward: 75,
    createdAt: Timestamp.fromDate(new Date(Date.now() - 4 * 60 * 60 * 1000)),
  },
];

// Sample Communities
const sampleCommunities = [
  {
    name: 'Tech Innovators Hub',
    banner: 'https://picsum.photos/seed/techcom/1200/300',
    category: 'Technology',
    memberCount: 15420,
    description: 'A thriving community of developers, engineers, and tech enthusiasts sharing knowledge and building the future.',
    createdAt: Timestamp.now(),
    isActive: true,
  },
  {
    name: 'Creative Designers United',
    banner: 'https://picsum.photos/seed/designcom/1200/300',
    category: 'Design',
    memberCount: 12890,
    description: 'Connect with designers worldwide to share portfolios, get feedback, and stay inspired.',
    createdAt: Timestamp.now(),
    isActive: true,
  },
  {
    name: 'Science Explorers League',
    banner: 'https://picsum.photos/seed/sciencecom/1200/300',
    category: 'Science',
    memberCount: 11230,
    description: 'Discover the wonders of science through discussions, experiments, and collaborative learning.',
    createdAt: Timestamp.now(),
    isActive: true,
  },
  {
    name: 'Startup Founders Circle',
    banner: 'https://picsum.photos/seed/bizcom/1200/300',
    category: 'Business',
    memberCount: 8765,
    description: 'Network with fellow entrepreneurs and learn strategies to grow your startup.',
    createdAt: Timestamp.now(),
    isActive: true,
  },
  {
    name: 'Math Masters Community',
    banner: 'https://picsum.photos/seed/mathcom/1200/300',
    category: 'Mathematics',
    memberCount: 6543,
    description: 'From algebra to advanced calculus, solve problems together and master mathematics.',
    createdAt: Timestamp.now(),
    isActive: true,
  },
];

// Sample Rewards
const sampleRewards = [
  {
    tierName: 'Bronze Wizard',
    requiredXP: 1000,
    icon: 'star',
    description: 'Start your journey with exclusive beginner benefits',
    benefits: [
      'Access to community forums',
      'Basic badge on profile',
      'Weekly learning tips',
      '5% bonus XP on all videos',
    ],
    color: '#CD7F32',
    createdAt: Timestamp.now(),
  },
  {
    tierName: 'Silver Sage',
    requiredXP: 5000,
    icon: 'zap',
    description: 'Level up with premium features and enhanced rewards',
    benefits: [
      'All Bronze benefits',
      'Access to exclusive creator Q&As',
      'Silver badge and profile frame',
      '10% bonus XP on all videos',
      'Priority support',
      'Monthly featured creator spotlight',
    ],
    color: '#C0C0C0',
    createdAt: Timestamp.now(),
  },
  {
    tierName: 'Gold Master',
    requiredXP: 15000,
    icon: 'trophy',
    description: 'Master tier with premium perks and recognition',
    benefits: [
      'All Silver benefits',
      'Early access to new features',
      'Gold badge and animated profile frame',
      '20% bonus XP on all videos',
      'Direct messaging with creators',
      'Exclusive masterclass access',
      'Monthly cash rewards ($50)',
      'VIP community events',
    ],
    color: '#FFD700',
    createdAt: Timestamp.now(),
  },
];

async function seedDatabase() {
  console.log('🌱 Starting Firebase seed process...\n');

  try {
    // Seed Creators
    console.log('👥 Seeding creators...');
    for (const creator of sampleCreators) {
      await setDoc(doc(db, 'users', creator.uid), creator);
      console.log(`   ✓ Created: ${creator.displayName}`);
    }
    console.log(`✅ ${sampleCreators.length} creators seeded\n`);

    // Seed Videos
    console.log('🎥 Seeding videos...');
    for (const video of sampleVideos) {
      await addDoc(collection(db, 'videos'), video);
      console.log(`   ✓ Created: ${video.title}`);
    }
    console.log(`✅ ${sampleVideos.length} videos seeded\n`);

    // Seed Communities
    console.log('🏘️ Seeding communities...');
    for (const community of sampleCommunities) {
      await addDoc(collection(db, 'communities'), community);
      console.log(`   ✓ Created: ${community.name}`);
    }
    console.log(`✅ ${sampleCommunities.length} communities seeded\n`);

    // Seed Rewards
    console.log('🏆 Seeding reward tiers...');
    for (const reward of sampleRewards) {
      await addDoc(collection(db, 'rewards'), reward);
      console.log(`   ✓ Created: ${reward.tierName}`);
    }
    console.log(`✅ ${sampleRewards.length} reward tiers seeded\n`);

    console.log('🎉 Firebase seed completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - ${sampleCreators.length} creators`);
    console.log(`   - ${sampleVideos.length} videos`);
    console.log(`   - ${sampleCommunities.length} communities`);
    console.log(`   - ${sampleRewards.length} reward tiers`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run the seed
seedDatabase()
  .then(() => {
    console.log('\n✨ All done! Your WIZUP platform is ready with sample data.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed failed:', error);
    process.exit(1);
  });
