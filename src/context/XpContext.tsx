import React, { createContext, useContext, useEffect, useState } from "react";
import { useXPSystem } from '../hooks/useXPSystem';

interface XpContextType {
  xp: number; // XP within current level
  totalXp: number; // Total XP earned
  addXp: (amount: number) => void;
  level: number;
  xpToNextLevel: number;
  progressPercent: number;
  dailyXp: number;
  dailyXpCap: number;
  currentStreak: number;
  longestStreak: number;
  dailyVideosWatched: number;
  isLoading: boolean;
  xpData: any;
  // New methods from XP system
  awardWatchXP: (videoId: string, watchTime: number, completed: boolean, sessionId: string) => Promise<any>;
  awardShareXP: (videoId: string) => Promise<any>;
  canEarnMoreXP: boolean;
  dailyProgress: number;
}

const XpContext = createContext<XpContextType | undefined>(undefined);

export const XpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the new XP system hook
  const xpSystem = useXPSystem();
  const [forceRefresh, setForceRefresh] = useState(0);
  
  // Listen for force refresh events to immediately update context
  useEffect(() => {
    const handleForceRefresh = (event: CustomEvent) => {
      console.log('🔄 XpContext received forceXPRefresh event:', event.detail);
      setForceRefresh(prev => prev + 1); // Force re-render
    };

    window.addEventListener('forceXPRefresh', handleForceRefresh as EventListener);
    return () => {
      window.removeEventListener('forceXPRefresh', handleForceRefresh as EventListener);
    };
  }, []);

  // Legacy addXp method for backwards compatibility
  const addXp = (amount: number) => {
    console.log(`📈 Legacy addXp called with: ${amount}. Use awardWatchXP instead.`);
    // This method is now deprecated - XP should be awarded through Firebase Functions
  };

  // Debug logs disabled for production
  // console.log('🔄 XpContext rendering with data:', JSON.stringify({
  //   totalXP: xpSystem.totalXP,
  //   level: xpSystem.level,
  //   progressPercent: xpSystem.progressPercent,
  //   xpInCurrentLevel: xpSystem.xpInCurrentLevel,
  //   xpToNextLevel: xpSystem.xpToNextLevel,
  //   dailyXP: xpSystem.dailyXP,
  //   loading: xpSystem.loading,
  //   forceRefresh
  // }, null, 2));

  return (
    <XpContext.Provider value={{ 
      xp: xpSystem.xpInCurrentLevel,
      totalXp: xpSystem.totalXP, 
      addXp, // Legacy method
      level: xpSystem.level, 
      xpToNextLevel: xpSystem.xpToNextLevel, 
      progressPercent: xpSystem.progressPercent,
      dailyXp: xpSystem.dailyXP,
      dailyXpCap: xpSystem.dailyXPCap,
      currentStreak: xpSystem.streakCount,
      longestStreak: xpSystem.streakCount, // TODO: Add longestStreak to XP system
      dailyVideosWatched: 0, // TODO: Add to XP system
      isLoading: xpSystem.loading,
      xpData: xpSystem.xpData,
      // New methods
      awardWatchXP: xpSystem.awardWatchXP,
      awardShareXP: xpSystem.awardShareXP,
      canEarnMoreXP: xpSystem.canEarnMoreXP,
      dailyProgress: xpSystem.dailyProgress
    }}>
      {children}
    </XpContext.Provider>
  );
};

export const useXp = (): XpContextType => {
  const context = useContext(XpContext);
  if (!context) throw new Error("useXp must be used within XpProvider");
  return context;
};