/**
 * WIZ Progress UI System - Polished Implementation
 * Handles instant progress bar sync, level detection, and animations
 */

import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { calculateLevel, getLevelThresholds } from './wiz-xp-core';

// Level thresholds for easy access
const thresholds: Record<number, number> = {
  1: 100, 2: 300, 3: 800, 4: 1600,
  5: 3000, 6: 6000, 7: 12000,
  8: 24000, 9: 50000, 10: 100000
};

let currentXP = 0;

/**
 * Calculate progress percentage for current level
 */
export function calculateProgress(xp: number, level: number): number {
  const currReq = thresholds[level] || 0;
  const nextReq = thresholds[level + 1] || currReq * 2; // fallback for max level
  const base = level === 1 ? 0 : thresholds[level - 1] || 0;
  
  if (level >= 10) return 100; // Max level
  
  return Math.min(100, Math.max(0, ((xp - base) / (nextReq - base)) * 100));
}

/**
 * Update progress UI with optional animation
 */
export function updateProgressUI(xp: number, animate: boolean = false): void {
  const level = calculateLevel(xp);
  const progressPercent = calculateProgress(xp, level);

  // Update progress bar
  const bar = document.querySelector('#progress-bar-fill') as HTMLElement;
  if (bar) {
    if (animate) {
      bar.style.transition = 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    }
    bar.style.width = `${progressPercent}%`;
  }

  // Update level badge
  const levelBadge = document.querySelector('#level-badge') as HTMLElement;
  if (levelBadge) {
    levelBadge.textContent = `Lv. ${level}`;
  }

  // Update XP text
  const xpText = document.querySelector('#xp-text') as HTMLElement;
  if (xpText) {
    xpText.textContent = `${xp} XP`;
  }

  // Update level progress text
  const levelProgressText = document.querySelector('#level-progress') as HTMLElement;
  if (levelProgressText) {
    const currentLevelBase = level === 1 ? 0 : thresholds[level - 1] || 0;
    const nextLevelReq = thresholds[level] || thresholds[10];
    const xpInLevel = xp - currentLevelBase;
    const xpNeeded = nextLevelReq - currentLevelBase;
    
    if (level >= 10) {
      levelProgressText.textContent = 'MAX LEVEL';
    } else {
      levelProgressText.textContent = `${xpInLevel} / ${xpNeeded} XP`;
    }
  }

  currentXP = xp;
}

/**
 * Detect level-up and trigger animations
 */
export function detectLevelUp(prevXP: number, newXP: number): void {
  const oldLevel = calculateLevel(prevXP);
  const newLevel = calculateLevel(newXP);

  if (newLevel > oldLevel) {
    console.log(`🎉 Level Up! ${oldLevel} → ${newLevel}`);

    // Fire event → animate badge glow, confetti, etc.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent("levelUp", {
        detail: { oldLevel, newLevel }
      }));
    }
  }
}

/**
 * Initialize progress UI with Firestore sync and instant XP events
 */
export function initProgressUI(userId: string): () => void {
  console.log('🎨 Initializing progress UI for user:', userId);

  // Firestore sync - truth source
  const unsubscribeFirestore = onSnapshot(doc(db, "users", userId), (doc) => {
    if (doc.exists()) {
      const xp = doc.data().currentXP || 0;
      updateProgressUI(xp);
      console.log('📊 Progress UI synced with Firestore:', xp);
    }
  });

  // Local instant XP event handler
  const handleXPUpdate = (e: CustomEvent) => {
    const { prevXP, totalXp, leveledUp } = e.detail;
    console.log('⚡ Instant XP update:', e.detail);
    
    // Recalculate level and progress using calculateLevel(currentXP)
    const newLevel = calculateLevel(totalXp);
    const progressPercent = calculateProgress(totalXp, newLevel);
    
    console.log(`📊 Progress recalculated: Level ${newLevel}, Progress ${progressPercent.toFixed(1)}%`);
    
    if (leveledUp) {
      detectLevelUp(prevXP, totalXp);
    }
    updateProgressUI(totalXp, true); // animate with recalculated values
  };

  // Level-up animation handler
  const handleLevelUp = (e: CustomEvent) => {
    const { oldLevel, newLevel } = e.detail;
    console.log('🎉 Level up animation triggered:', { oldLevel, newLevel });
    
    const badge = document.querySelector("#level-badge") as HTMLElement;
    if (badge) {
      badge.classList.add("glow", "level-up");
      setTimeout(() => {
        badge.classList.remove("glow", "level-up");
      }, 2000);
    }

    // Add confetti or other effects here
    triggerLevelUpEffects(newLevel);
  };

  // Add event listeners
  if (typeof window !== 'undefined') {
    window.addEventListener("xpUpdated", handleXPUpdate as EventListener);
    window.addEventListener("levelUp", handleLevelUp as EventListener);
  }

  // Return cleanup function
  return () => {
    unsubscribeFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener("xpUpdated", handleXPUpdate as EventListener);
      window.removeEventListener("levelUp", handleLevelUp as EventListener);
    }
  };
}

/**
 * Trigger level-up visual effects
 */
function triggerLevelUpEffects(newLevel: number): void {
  // Badge glow effect
  const badge = document.querySelector("#level-badge") as HTMLElement;
  if (badge) {
    badge.style.animation = 'pulse 0.6s ease-in-out';
    setTimeout(() => {
      badge.style.animation = '';
    }, 600);
  }

  // Progress bar celebration
  const progressBar = document.querySelector('#progress-bar-fill') as HTMLElement;
  if (progressBar) {
    progressBar.style.animation = 'shimmer 1s ease-in-out';
    setTimeout(() => {
      progressBar.style.animation = '';
    }, 1000);
  }

  // Milestone badges (levels 3, 5, 7, 10)
  if ([3, 5, 7, 10].includes(newLevel)) {
    console.log(`🏆 Milestone level reached: ${newLevel}!`);
    
    // Trigger special milestone effects
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent("milestoneUnlocked", {
        detail: { level: newLevel, badgeName: getBadgeName(newLevel) }
      }));
    }
  }
}

/**
 * Get badge name for milestone levels
 */
function getBadgeName(level: number): string {
  const badgeNames: Record<number, string> = {
    3: 'Rising Wizard',
    5: 'Skilled Mage', 
    7: 'Elite Sorcerer',
    10: 'Archmage Supreme'
  };
  return badgeNames[level] || `Level ${level} Badge`;
}

/**
 * Get current XP value
 */
export function getCurrentXP(): number {
  return currentXP;
}

/**
 * Get level thresholds for external use
 */
export function getThresholds(): Record<number, number> {
  return thresholds;
}