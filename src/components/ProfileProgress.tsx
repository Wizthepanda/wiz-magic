import React from "react";
import { useXp } from "@/context/XpContext";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export const ProfileProgress: React.FC = () => {
  const { xp, level, xpToNextLevel, progressPercent, totalXp } = useXp();
  const { user } = useAuth();
  
  // Use auth user data as fallback if XP Context has no data
  const effectiveTotalXp = totalXp > 0 ? totalXp : (user?.totalXP || 0);
  const effectiveLevel = level > 1 ? level : (user?.level || 1);
  const effectiveXp = totalXp > 0 ? xp : ((user?.totalXP || 0) % 1000);
  const effectiveProgressPercent = totalXp > 0 ? progressPercent : (((user?.totalXP || 0) % 1000) / 1000) * 100;
  
  // Debug logging to see what ProfileProgress is receiving
  console.log('🎯 ProfileProgress render:', { 
    xpContext_totalXp: totalXp, 
    xpContext_xp: xp, 
    xpContext_level: level, 
    xpContext_progressPercent: Math.round(progressPercent), 
    xpToNextLevel,
    localStorage: typeof window !== 'undefined' ? localStorage.getItem('wizXp') : 'N/A',
    authUser_totalXP: user?.totalXP || 0,
    authUser_level: user?.level || 1,
    effective_totalXp: effectiveTotalXp,
    effective_level: effectiveLevel,
    effective_xp: effectiveXp,
    effective_progressPercent: Math.round(effectiveProgressPercent)
  });

  return (
    <div className="w-full space-y-2">
      {/* Level and XP Display */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <motion.div 
            className="px-2 py-1 rounded-full text-xs font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
              boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
            }}
            key={effectiveLevel} // Re-animate when level changes
            initial={{ scale: 1 }}
            animate={{ 
              scale: [1, 1.1, 1],
              boxShadow: [
                '0 2px 8px rgba(255, 215, 0, 0.3)',
                '0 4px 16px rgba(255, 215, 0, 0.6)',
                '0 2px 8px rgba(255, 215, 0, 0.3)'
              ]
            }}
            transition={{ 
              duration: 0.6,
              ease: "easeInOut"
            }}
          >
            Level {effectiveLevel}
          </motion.div>
          <span className="text-gray-600">•</span>
          <div className="flex items-center space-x-1 text-gray-600">
            <motion.div
              animate={{ 
                rotate: [0, 15, -15, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 0.5,
                ease: "easeInOut"
              }}
              key={effectiveTotalXp} // Re-animate when XP changes
            >
              <Zap className="w-3 h-3 text-yellow-500" />
            </motion.div>
            <motion.span 
              className="font-medium"
              key={`${effectiveXp}-${xpToNextLevel}`}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.3 }}
            >
              {effectiveXp}/{xpToNextLevel} XP
            </motion.span>
          </div>
        </div>
        <motion.span 
          className="text-xs text-gray-500"
          key={effectiveProgressPercent}
          initial={{ opacity: 0.7 }}
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 0.5 }}
        >
          {Math.round(effectiveProgressPercent)}% to next level
        </motion.span>
      </div>

      {/* Progress Bar */}
      <div 
        className="relative w-full h-3 rounded-full overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(230, 230, 250, 0.05) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
      >
        <motion.div
          className="h-full rounded-full"
          style={{
            background: `
              linear-gradient(90deg, 
                rgba(230, 230, 250, 0.8) 0%, 
                rgba(147, 51, 234, 0.9) 50%, 
                rgba(75, 0, 130, 1) 100%
              )
            `,
            boxShadow: '0 0 20px rgba(147, 51, 234, 0.6)'
          }}
          initial={{ width: 0 }}
          animate={{ 
            width: `${effectiveProgressPercent}%`,
            boxShadow: [
              '0 0 20px rgba(147, 51, 234, 0.6)',
              '0 0 30px rgba(147, 51, 234, 0.8)',
              '0 0 25px rgba(147, 51, 234, 0.9)',
              '0 0 20px rgba(147, 51, 234, 0.6)'
            ]
          }}
          transition={{ 
            width: {
              type: "spring", 
              stiffness: 120, 
              damping: 20,
              duration: 1.2
            },
            boxShadow: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          key={Math.floor(effectiveProgressPercent / 10)} // Re-animate every 10% progress
        />
        
        {/* Shimmer Effect */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              linear-gradient(45deg, 
                transparent 30%, 
                rgba(255, 255, 255, 0.2) 50%, 
                transparent 70%
              )
            `
          }}
          animate={{
            x: ['-100%', '100%']
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
            ease: "easeInOut"
          }}
        />
      </div>
    </div>
  );
};