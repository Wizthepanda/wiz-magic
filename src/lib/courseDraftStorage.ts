/**
 * Per-User Course Draft Storage Helper
 * Ensures course creation drafts are isolated by userId
 * Mirrors the pattern used for community drafts
 */

export const courseDraftKeyFor = (userId: string) => `courseDraft_${userId}`;

/**
 * Save course draft to localStorage for a specific user
 */
export function saveCourseDraftToLocal(userId: string, data: unknown): void {
  if (!userId) {
    console.warn('⚠️ Cannot save course draft: No userId provided');
    return;
  }
  
  try {
    const key = courseDraftKeyFor(userId);
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`💾 Course draft saved for user: ${userId}`);
  } catch (error) {
    console.error('❌ Error saving course draft to localStorage:', error);
  }
}

/**
 * Load course draft from localStorage for a specific user
 */
export function loadCourseDraftFromLocal(userId: string): unknown | null {
  if (!userId) {
    console.warn('⚠️ Cannot load course draft: No userId provided');
    return null;
  }
  
  try {
    const key = courseDraftKeyFor(userId);
    const raw = localStorage.getItem(key);
    
    if (!raw) {
      console.log(`📭 No course draft found for user: ${userId}`);
      return null;
    }
    
    const parsed = JSON.parse(raw);
    console.log(`📂 Course draft loaded for user: ${userId}`);
    return parsed;
  } catch (error) {
    console.error('❌ Error loading course draft from localStorage:', error);
    return null;
  }
}

/**
 * Remove course draft from localStorage for a specific user
 */
export function removeCourseDraftFromLocal(userId: string): void {
  if (!userId) {
    console.warn('⚠️ Cannot remove course draft: No userId provided');
    return;
  }
  
  try {
    const key = courseDraftKeyFor(userId);
    localStorage.removeItem(key);
    console.log(`🗑️ Course draft removed for user: ${userId}`);
  } catch (error) {
    console.error('❌ Error removing course draft from localStorage:', error);
  }
}

/**
 * List all user course draft keys (for debugging)
 */
export function listAllUserCourseDrafts(): string[] {
  const drafts: string[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('courseDraft_')) {
        drafts.push(key);
      }
    }
  } catch (error) {
    console.error('❌ Error listing course drafts:', error);
  }
  
  return drafts;
}

/**
 * Clear ALL user course drafts (for admin/debugging purposes)
 * USE WITH CAUTION
 */
export function clearAllUserCourseDrafts(): void {
  try {
    const draftKeys = listAllUserCourseDrafts();
    draftKeys.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ Cleared ${draftKeys.length} user course draft(s)`);
  } catch (error) {
    console.error('❌ Error clearing course drafts:', error);
  }
}

