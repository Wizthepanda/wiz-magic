/**
 * Utility to fix blob URLs in communities
 * Run this from the browser console while logged in
 */

import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function fixBlobUrlsInCommunities(creatorId: string) {
  console.log('🔍 Scanning your communities for blob URLs...\n');

  const communitiesRef = collection(db, 'communities');
  const snapshot = await getDocs(communitiesRef);

  let fixed = 0;
  let total = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();

    // Only fix communities created by this user
    if (data.creatorId !== creatorId) {
      continue;
    }

    total++;

    if (!data.coverMedia || !Array.isArray(data.coverMedia)) {
      continue;
    }

    // Check if any media has blob URLs
    const hasBlobUrls = data.coverMedia.some(
      (media: any) => media.url?.startsWith('blob:') || media.thumbnail?.startsWith('blob:')
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
  console.log(`   Your communities: ${total}`);
  console.log(`   Fixed communities: ${fixed}`);
  console.log(`   No changes needed: ${total - fixed}`);

  if (fixed > 0) {
    console.log('\n✅ Migration complete! You can now:');
    console.log('   1. Go to Create → Your Published Creations');
    console.log('   2. Edit each community');
    console.log('   3. Re-upload images (they will be saved with proper Firebase Storage URLs)');
  }

  return { total, fixed };
}

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (window as any).fixBlobUrls = fixBlobUrlsInCommunities;
}
