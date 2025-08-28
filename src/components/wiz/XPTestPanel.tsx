import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Share2, Users, Sparkles } from 'lucide-react';
import { useSimpleXP } from '@/hooks/useSimpleXP';

export const XPTestPanel: React.FC = () => {
  const { 
    xpData, 
    loading, 
    error, 
    awardWatchXP, 
    awardShareXP, 
    awardReferralXP, 
    canEarnMoreXP 
  } = useSimpleXP();
  
  const [isAwarding, setIsAwarding] = useState(false);
  const [lastAction, setLastAction] = useState('');

  const handleAwardWatchXP = async () => {
    if (isAwarding || !canEarnMoreXP) return;
    
    setIsAwarding(true);
    setLastAction('watch');
    
    // Award XP for 60 seconds of watch time (6 XP)
    const success = await awardWatchXP(60, false);
    
    if (success) {
      console.log('✅ Awarded 6 XP for 60 seconds watch time');
    } else {
      console.log('❌ Failed to award watch XP');
    }
    
    setTimeout(() => {
      setIsAwarding(false);
      setLastAction('');
    }, 2000);
  };

  const handleAwardCompletionXP = async () => {
    if (isAwarding || !canEarnMoreXP) return;
    
    setIsAwarding(true);
    setLastAction('completion');
    
    // Award XP for completing a 100-second video (10 XP + 1 XP bonus = 11 XP)
    const success = await awardWatchXP(100, true);
    
    if (success) {
      console.log('✅ Awarded 11 XP for video completion (10 + 10% bonus)');
    } else {
      console.log('❌ Failed to award completion XP');
    }
    
    setTimeout(() => {
      setIsAwarding(false);
      setLastAction('');
    }, 2000);
  };

  const handleAwardShareXP = async () => {
    if (isAwarding) return;
    
    setIsAwarding(true);
    setLastAction('share');
    
    // Award XP for sharing (20 XP)
    const success = await awardShareXP('test_video');
    
    if (success) {
      console.log('✅ Awarded 20 XP for sharing');
    } else {
      console.log('❌ Failed to award share XP');
    }
    
    setTimeout(() => {
      setIsAwarding(false);
      setLastAction('');
    }, 2000);
  };

  const handleAwardReferralXP = async () => {
    if (isAwarding) return;
    
    setIsAwarding(true);
    setLastAction('referral');
    
    // Award XP for referral (50 XP)
    const success = await awardReferralXP('test_referred_user');
    
    if (success) {
      console.log('✅ Awarded 50 XP for referral');
    } else {
      console.log('❌ Failed to award referral XP');
    }
    
    setTimeout(() => {
      setIsAwarding(false);
      setLastAction('');
    }, 2000);
  };

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-600 rounded w-1/3 mb-4"></div>
          <div className="h-8 bg-gray-600 rounded mb-4"></div>
          <div className="h-4 bg-gray-600 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6">
        <h3 className="text-lg font-bold text-red-400 mb-2">XP System Error</h3>
        <p className="text-red-300">{error}</p>
      </div>
    );
  }

  if (!xpData) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-400 mb-2">No XP Data</h3>
        <p className="text-gray-500">Please sign in to test XP system.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center space-x-2">
          <Sparkles className="w-6 h-6 text-yellow-500" />
          <span>XP System Test Panel</span>
        </h2>
        {!canEarnMoreXP && (
          <div className="bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full text-sm">
            Daily Cap Reached
          </div>
        )}
      </div>

      {/* Current XP Status */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-400">{Math.floor(xpData.currentXP)}</div>
          <div className="text-sm text-gray-400">Total XP</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-purple-400">{xpData.level}</div>
          <div className="text-sm text-gray-400">Level</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{Math.floor(xpData.dailyXpEarned)}</div>
          <div className="text-sm text-gray-400">Daily XP</div>
        </div>
        
        <div className="bg-gray-700 rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{Math.floor(xpData.dailyXpRemaining)}</div>
          <div className="text-sm text-gray-400">XP Remaining</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-white">Level {xpData.level} Progress</span>
          <span className="text-sm text-gray-400">
            {Math.round(xpData.progressPercent)}% complete
          </span>
        </div>
        <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${xpData.progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>{Math.floor(xpData.xpInCurrentLevel)} XP</span>
          <span>{Math.floor(xpData.xpNeededForNextLevel)} XP to next level</span>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <motion.button
          onClick={handleAwardWatchXP}
          disabled={isAwarding || !canEarnMoreXP}
          className={`flex flex-col items-center space-y-2 p-4 rounded-lg border-2 border-dashed transition-all duration-200 ${
            canEarnMoreXP 
              ? 'border-blue-500 hover:bg-blue-500/10 text-blue-400 hover:text-blue-300' 
              : 'border-gray-600 text-gray-600 cursor-not-allowed'
          } ${lastAction === 'watch' ? 'bg-blue-500/20' : ''}`}
          whileTap={{ scale: 0.95 }}
        >
          <Play className="w-6 h-6" />
          <div className="text-center">
            <div className="text-sm font-medium">Watch 60s</div>
            <div className="text-xs opacity-75">+6 XP</div>
          </div>
        </motion.button>

        <motion.button
          onClick={handleAwardCompletionXP}
          disabled={isAwarding || !canEarnMoreXP}
          className={`flex flex-col items-center space-y-2 p-4 rounded-lg border-2 border-dashed transition-all duration-200 ${
            canEarnMoreXP 
              ? 'border-green-500 hover:bg-green-500/10 text-green-400 hover:text-green-300' 
              : 'border-gray-600 text-gray-600 cursor-not-allowed'
          } ${lastAction === 'completion' ? 'bg-green-500/20' : ''}`}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-6 h-6" />
          <div className="text-center">
            <div className="text-sm font-medium">Complete Video</div>
            <div className="text-xs opacity-75">+11 XP (10 + bonus)</div>
          </div>
        </motion.button>

        <motion.button
          onClick={handleAwardShareXP}
          disabled={isAwarding}
          className={`flex flex-col items-center space-y-2 p-4 rounded-lg border-2 border-dashed border-purple-500 hover:bg-purple-500/10 text-purple-400 hover:text-purple-300 transition-all duration-200 ${
            lastAction === 'share' ? 'bg-purple-500/20' : ''
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <Share2 className="w-6 h-6" />
          <div className="text-center">
            <div className="text-sm font-medium">Share Video</div>
            <div className="text-xs opacity-75">+20 XP</div>
          </div>
        </motion.button>

        <motion.button
          onClick={handleAwardReferralXP}
          disabled={isAwarding}
          className={`flex flex-col items-center space-y-2 p-4 rounded-lg border-2 border-dashed border-yellow-500 hover:bg-yellow-500/10 text-yellow-400 hover:text-yellow-300 transition-all duration-200 ${
            lastAction === 'referral' ? 'bg-yellow-500/20' : ''
          }`}
          whileTap={{ scale: 0.95 }}
        >
          <Users className="w-6 h-6" />
          <div className="text-center">
            <div className="text-sm font-medium">Referral Signup</div>
            <div className="text-xs opacity-75">+50 XP</div>
          </div>
        </motion.button>
      </div>

      {/* Status Message */}
      {isAwarding && (
        <motion.div
          className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-3 text-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-blue-400 font-medium">
            Awarding XP... Check console for details
          </div>
        </motion.div>
      )}

      <div className="text-xs text-gray-500 text-center">
        This panel tests the XP system. XP will be added to your profile in real-time.
      </div>
    </div>
  );
};