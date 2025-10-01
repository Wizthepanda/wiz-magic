import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';

interface DraftInfo {
  id: string;
  title: string;
  updatedAt: any;
  createdAt: any;
}

/**
 * Clean up duplicate drafts for a user
 * Keeps the most recently updated draft for each title
 */
export async function cleanupDuplicateDrafts(userId: string) {
  console.log(`🧹 Starting duplicate cleanup for user: ${userId}`);

  const draftsQuery = query(
    collection(db, 'communities'),
    where('creatorId', '==', userId),
    where('status', '==', 'draft'),
    orderBy('updatedAt', 'desc')
  );

  const snapshot = await getDocs(draftsQuery);
  console.log(`📊 Found ${snapshot.size} total drafts`);

  // Group drafts by title
  const draftsByTitle: Record<string, DraftInfo[]> = {};

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const title = data.title || 'Untitled';

    if (!draftsByTitle[title]) {
      draftsByTitle[title] = [];
    }

    draftsByTitle[title].push({
      id: docSnap.id,
      title: data.title,
      updatedAt: data.updatedAt,
      createdAt: data.createdAt
    });
  });

  // For each group with duplicates, keep most recent, delete rest
  let deletedCount = 0;
  const deletePromises: Promise<void>[] = [];

  for (const [title, drafts] of Object.entries(draftsByTitle)) {
    if (drafts.length > 1) {
      console.log(`🔍 Found ${drafts.length} duplicates for "${title}"`);

      // Sort by updatedAt (most recent first)
      drafts.sort((a, b) => {
        const aTime = a.updatedAt?.toMillis?.() || a.updatedAt?.seconds * 1000 || 0;
        const bTime = b.updatedAt?.toMillis?.() || b.updatedAt?.seconds * 1000 || 0;
        return bTime - aTime;
      });

      // Keep first (most recent), delete rest
      const toDelete = drafts.slice(1);
      console.log(`🗑️  Keeping draft ${drafts[0].id}, deleting ${toDelete.length} duplicates`);

      for (const draft of toDelete) {
        deletePromises.push(deleteDoc(doc(db, 'communities', draft.id)));
        deletedCount++;
      }
    }
  }

  await Promise.all(deletePromises);

  console.log(`✅ Cleanup complete: Deleted ${deletedCount} duplicates`);

  return {
    totalBefore: snapshot.size,
    deleted: deletedCount,
    remaining: snapshot.size - deletedCount
  };
}
