/**
 * Per-User Draft Storage Helper
 * Ensures community creation drafts are isolated by userId
 * and never leak across accounts
 */

export const draftKeyFor = (userId: string) => `communityDraft_${userId}`;

/**
 * Save draft to localStorage for a specific user
 */
export function saveDraftToLocal(userId: string, data: unknown): void {
  if (!userId) {
    console.warn('⚠️ Cannot save draft: No userId provided');
    return;
  }
  
  try {
    const key = draftKeyFor(userId);
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`💾 Draft saved for user: ${userId}`);
  } catch (error) {
    console.error('❌ Error saving draft to localStorage:', error);
  }
}

/**
 * Load draft from localStorage for a specific user
 */
export function loadDraftFromLocal(userId: string): unknown | null {
  if (!userId) {
    console.warn('⚠️ Cannot load draft: No userId provided');
    return null;
  }
  
  try {
    const key = draftKeyFor(userId);
    const raw = localStorage.getItem(key);
    
    if (!raw) {
      console.log(`📭 No draft found for user: ${userId}`);
      return null;
    }
    
    const parsed = JSON.parse(raw);
    console.log(`📂 Draft loaded for user: ${userId}`);
    return parsed;
  } catch (error) {
    console.error('❌ Error loading draft from localStorage:', error);
    return null;
  }
}

/**
 * Remove draft from localStorage for a specific user
 */
export function removeDraftFromLocal(userId: string): void {
  if (!userId) {
    console.warn('⚠️ Cannot remove draft: No userId provided');
    return;
  }
  
  try {
    const key = draftKeyFor(userId);
    localStorage.removeItem(key);
    console.log(`🗑️ Draft removed for user: ${userId}`);
  } catch (error) {
    console.error('❌ Error removing draft from localStorage:', error);
  }
}

/**
 * Migrate old global draft (if exists) to user-specific draft
 * This helps transition from the old storage pattern
 */
export function migrateGlobalDraftToUser(userId: string): boolean {
  if (!userId) return false;
  
  try {
    const oldKey = 'community-create-storage';
    const oldData = localStorage.getItem(oldKey);
    
    if (!oldData) {
      console.log('📭 No old global draft to migrate');
      return false;
    }
    
    // Parse and extract the state
    const parsed = JSON.parse(oldData);
    const state = parsed?.state;
    
    if (!state) {
      console.warn('⚠️ Old draft has invalid structure');
      return false;
    }
    
    // Save to user-specific key
    saveDraftToLocal(userId, state);
    
    // Remove old global key
    localStorage.removeItem(oldKey);
    
    console.log(`✅ Migrated global draft to user: ${userId}`);
    return true;
  } catch (error) {
    console.error('❌ Error migrating draft:', error);
    return false;
  }
}

/**
 * List all user draft keys (for debugging)
 */
export function listAllUserDrafts(): string[] {
  const drafts: string[] = [];
  
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('communityDraft_')) {
        drafts.push(key);
      }
    }
  } catch (error) {
    console.error('❌ Error listing drafts:', error);
  }
  
  return drafts;
}

/**
 * Clear ALL user drafts (for admin/debugging purposes)
 * USE WITH CAUTION
 */
export function clearAllUserDrafts(): void {
  try {
    const draftKeys = listAllUserDrafts();
    draftKeys.forEach(key => localStorage.removeItem(key));
    console.log(`🗑️ Cleared ${draftKeys.length} user draft(s)`);
  } catch (error) {
    console.error('❌ Error clearing drafts:', error);
  }
}

