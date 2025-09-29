import React from "react";
import { useZAPSystem } from "@/hooks/useZAPSystem";
import { useAuth } from "@/hooks/useAuth";
import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export const ProfileProgress: React.FC = () => {
  const { zapData, zapProgress, loading } = useZAPSystem();
  const { user } = useAuth();

  // Use ZAP system data with fallbacks
  const effectiveTotalZAPs = zapData?.totalZAPs || 0;
  const effectiveLevel = zapProgress?.level || 1;
  const currentLevelZAPs = zapProgress?.currentLevelZAPs || 0;
  const nextLevelZAPs = zapProgress?.nextLevelZAPs || 100;
  const effectiveProgressPercent = zapProgress?.progressPercent || 0;

  // Debug logging to see what ProfileProgress is receiving
  console.log('🎯 ProfileProgress render (ZAP System):', {
    zapData_totalZAPs: zapData?.totalZAPs || 0,
    zapData_level: zapData?.level || 1,
    zapData_dailyZAPs: zapData?.dailyZAPs || 0,
    zapProgress_level: zapProgress?.level || 1,
    zapProgress_progressPercent: Math.round(zapProgress?.progressPercent || 0),
    zapProgress_currentLevelZAPs: zapProgress?.currentLevelZAPs || 0,
    zapProgress_nextLevelZAPs: zapProgress?.nextLevelZAPs || 100,
    effectiveTotalZAPs,
    effectiveLevel,
    currentLevelZAPs,
    nextLevelZAPs,
    effectiveProgressPercent: Math.round(effectiveProgressPercent),
    loading
  });

  if (loading) {
    return (
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    );
  }

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
              key={effectiveTotalZAPs} // Re-animate when ZAPs change
            >
              <Zap className="w-3 h-3 text-yellow-500" />
            </motion.div>
            <motion.span
              className="font-medium"
              key={`${currentLevelZAPs}-${nextLevelZAPs}`}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.3 }}
            >
              {currentLevelZAPs}/{nextLevelZAPs} ZAPs
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