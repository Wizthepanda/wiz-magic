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
      return saved ? parseInt(saved, 10) : 0;
    }
    return 0;
  });


  // Calculate level and progress based on 1000 XP per level
  const level = Math.floor(totalXp / 1000) + 1;
  const xpInCurrentLevel = totalXp % 1000;
  const xpToNextLevel = 1000;
  const progressPercent = (xpInCurrentLevel / xpToNextLevel) * 100;

  const addXp = (amount: number) => {
    setTotalXp((prev) => {
      const newTotalXp = prev + amount;
      // Save to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('wizXp', newTotalXp.toString());
      }
      
      // Show XP notification
      console.log(`🎉 +${amount} XP earned! Total: ${newTotalXp}`);
      
      return newTotalXp;
    });
  };

  // Listen for XP updates from Firebase (dispatched by useAuth)
  useEffect(() => {
    const handleXpUpdate = (event: CustomEvent) => {
      const { totalXP } = event.detail;
      console.log(`🔄 XP Context received Firebase update: ${totalXP}, current: ${totalXp}`);
      setTotalXp(totalXP);
      console.log(`📊 XP Context updated to: ${totalXP}`);
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('xpUpdated', handleXpUpdate as EventListener);
      return () => window.removeEventListener('xpUpdated', handleXpUpdate as EventListener);
    }
  }, []);

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