import React, { createContext, useContext, useState, useEffect } from "react";

interface XpContextType {
  xp: number; // XP within current level
  totalXp: number; // Total XP earned
  addXp: (amount: number) => void;
  level: number;
  xpToNextLevel: number;
  progressPercent: number;
}

const XpContext = createContext<XpContextType | undefined>(undefined);

export const XpProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [totalXp, setTotalXp] = useState(() => {
    // Load from localStorage on initialization
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('wizXp');
      const initialXp = saved ? parseInt(saved, 10) : 0;
      console.log('🎯 XpContext: Initial XP from localStorage:', initialXp);
      
      // Also listen for any pending xpUpdated events immediately
      setTimeout(() => {
        console.log('🔄 XpContext: Initialized, ready to receive xpUpdated events');
      }, 0);
      
      return initialXp;
    }
    return 0;
  });


  // Calculate level and progress based on 1000 XP per level
  const level = Math.floor(totalXp / 1000) + 1;
  const xpInCurrentLevel = totalXp % 1000;
  const xpToNextLevel = 1000;
  const progressPercent = (xpInCurrentLevel / xpToNextLevel) * 100;

  const addXp = (amount: number) => {
    console.log(`📈 XpContext.addXp called with: ${amount}, current total: ${totalXp}`);
    setTotalXp((prev) => {
      const newTotalXp = prev + amount;
      console.log(`📈 XpContext: ${prev} + ${amount} = ${newTotalXp}`);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('wizXp', newTotalXp.toString());
        console.log(`💾 XpContext: Saved ${newTotalXp} to localStorage`);
      }
      
      return newTotalXp;
    });
    
    // Force re-render all components consuming this context after XP update
    setTimeout(() => {
      setTotalXp((prev) => {
        console.log(`🔄 XpContext: Forced refresh with totalXp: ${prev}`);
        return prev; // Don't change value, just trigger re-render
      });
    }, 10);
  };

  // Listen for XP updates from Firebase (dispatched by useAuth)
  useEffect(() => {
    const handleXpUpdate = (event: CustomEvent) => {
      const { totalXP } = event.detail;
      console.log(`🔄 XP Context received Firebase update: ${totalXP}, current: ${totalXp}`);
      
      // Always sync from Firebase if it's different (trust Firebase as source of truth)
      if (totalXP !== totalXp) {
        console.log(`📊 XP Context syncing with Firebase: ${totalXp} → ${totalXP}`);
        setTotalXp(totalXP);
        
        // Update localStorage to match Firebase
        if (typeof window !== 'undefined') {
          localStorage.setItem('wizXp', totalXP.toString());
          console.log(`💾 XP Context: Synced localStorage to ${totalXP}`);
        }
        
        // Force additional re-render to ensure UI updates
        setTimeout(() => {
          setTotalXp(totalXP);
          console.log(`🔄 XP Context: Additional sync confirmation with ${totalXP}`);
        }, 50);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('xpUpdated', handleXpUpdate as EventListener);
      return () => window.removeEventListener('xpUpdated', handleXpUpdate as EventListener);
    }
  }, [totalXp]);

  // Save XP to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wizXp', totalXp.toString());
    }
  }, [totalXp]);

  return (
    <XpContext.Provider value={{ 
      xp: xpInCurrentLevel, // XP within current level
      totalXp, // Total XP earned
      addXp, 
      level, 
      xpToNextLevel, 
      progressPercent 
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