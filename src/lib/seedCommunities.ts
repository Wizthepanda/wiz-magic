import { db } from '@/lib/firebase';
import { collection, doc, setDoc } from 'firebase/firestore';

const communities = [
  {
    id: 'fitness-lounge',
    name: 'Fitness Lounge',
    slug: 'fitness-lounge',
    description: 'A community for strength, wellness, and gym enthusiasts.',
    members: [],
  },
  {
    id: 'ai-creators',
    name: 'AI Creators',
    slug: 'ai-creators',
    description: 'For innovators building the future with AI tools.',
    members: [],
  },
  {
    id: 'music-haven',
    name: 'Music Haven',
    slug: 'music-haven',
    description: 'A creative space for DJs, producers, and artists.',
    members: [],
  },
];

export const seedCommunities = async () => {
  const ref = collection(db, 'communities');
  for (const community of communities) {
    await setDoc(doc(ref, community.id), community);
  }
  console.log('✅ Seeded communities to Firestore');
};
