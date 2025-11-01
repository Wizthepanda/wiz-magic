/**
 * Seed ZAP Reward Tiers to Firebase
 * Run with: npm run seed:zap-tiers
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDocs } from 'firebase/firestore';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const firebaseConfig = {
  apiKey: 'AIzaSyCD6kuuaobXR1fCEbPwrwIy6FDwZtRmeV8',
  authDomain: 'wiz-magic-platform.firebaseapp.com',
  projectId: 'wiz-magic-platform',
  storageBucket: 'wiz-magic-platform.firebasestorage.app',
  messagingSenderId: '485151111726',
  appId: '1:485151111726:web:9d65ec8a6accfa69e23dbf',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const zapRewardTiers = [
  {
    id: 'bronze-tier',
    tier: 'Bronze',
    icon: '⚡',
    zapsRequired: 9,
    currentZAPs: 0,
    rewards: [
      { id: 'b1', name: 'Module 3', completed: false },
      { id: 'b2', name: 'Complete Module 2 Building', completed: false },
    ],
  },
  {
    id: 'silver-tier',
    tier: 'Silver',
    icon: '🔥',
    zapsRequired: 25,
    currentZAPs: 0,
    rewards: [
      { id: 's1', name: 'Welcome Bonus', description: '50 ZAPs for joining', completed: false },
      { id: 's2', name: 'VIP Discord Badge', description: 'Exclusive role in server', completed: false },
    ],
  },
  {
    id: 'gold-tier',
    tier: 'Gold',
    icon: '👑',
    zapsRequired: 50,
    currentZAPs: 0,
    rewards: [
      { id: 'g1', name: 'Premium Content Access', description: 'Unlock exclusive courses', completed: false },
      { id: 'g2', name: 'Monthly Bonus ZAPs', description: '100 ZAPs every month', completed: false },
      { id: 'g3', name: 'Creator Spotlight', description: 'Featured in newsletter', completed: false },
    ],
  },
  {
    id: 'diamond-tier',
    tier: 'Diamond',
    icon: '💎',
    zapsRequired: 100,
    currentZAPs: 0,
    rewards: [
      { id: 'd1', name: '1-on-1 Mentorship', description: 'Private session with creator', completed: false },
      { id: 'd2', name: 'Custom Profile Badge', description: 'Unique diamond status', completed: false },
      { id: 'd3', name: 'Early Access Features', description: 'Beta test new releases', completed: false },
    ],
  },
  {
    id: 'platinum-tier',
    tier: 'Platinum',
    icon: '🌟',
    zapsRequired: 250,
    currentZAPs: 0,
    rewards: [
      { id: 'p1', name: 'Lifetime Premium', description: 'Forever access to all content', completed: false },
      { id: 'p2', name: 'Co-Creation Rights', description: 'Help shape future content', completed: false },
      { id: 'p3', name: 'Revenue Share', description: '5% of community earnings', completed: false },
      { id: 'p4', name: 'Hall of Fame Entry', description: 'Permanent recognition', completed: false },
    ],
  },
];

async function seedZapRewardTiers() {
  try {
    console.log('🌱 Starting ZAP Reward Tiers seeding...\n');

    // Get all communities
    const communitiesSnapshot = await getDocs(collection(db, 'communities'));

    if (communitiesSnapshot.empty) {
      console.log('❌ No communities found in database');
      return;
    }

    console.log(`📦 Found ${communitiesSnapshot.size} communities\n`);

    for (const communityDoc of communitiesSnapshot.docs) {
      const communityId = communityDoc.id;
      const communityData = communityDoc.data();

      console.log(`\n🏛️  Seeding tiers for: ${communityData.title || communityId}`);

      // Create zapRewardTiers subcollection for each community
      for (const tier of zapRewardTiers) {
        const tierRef = doc(db, 'communities', communityId, 'zapRewardTiers', tier.id);
        await setDoc(tierRef, tier);
        console.log(`   ✅ Added ${tier.tier} Tier (${tier.zapsRequired} ZAPs required)`);
      }
    }

    console.log('\n\n✨ ZAP Reward Tiers seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Communities seeded: ${communitiesSnapshot.size}`);
    console.log(`   - Tiers per community: ${zapRewardTiers.length}`);
    console.log(`   - Total tiers created: ${communitiesSnapshot.size * zapRewardTiers.length}`);

  } catch (error) {
    console.error('❌ Error seeding ZAP reward tiers:', error);
    throw error;
  }
}

// Run the seeding function
seedZapRewardTiers()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
