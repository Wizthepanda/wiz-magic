/**
 * Firebase Cloud Functions - WIZ Platform
 * Production XP System with YouTube API Integration
 */

import { initializeApp, getApps } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
if (getApps().length === 0) {
  initializeApp();
}

// Export existing XP system functions
export { awardXP, awardShareXP, awardReferralXP, dailyReset } from './xp-system';

// Export new YouTube integration functions  
export { 
  syncYouTubeHistory, 
  dailyYouTubeSync, 
  dailyYouTubeProfileSync,
  initializeYouTubeTracking 
} from './youtube-xp-functions';

// Export new WIZ XP system functions (milder progression curve)
export {
  awardWizXP,
  awardWatchXP,
  awardWizShareXP,
  awardWizReferralXP,
  getWizXPData,
  wizDailyReset,
  getWizLeaderboard
} from './wiz-xp-functions';