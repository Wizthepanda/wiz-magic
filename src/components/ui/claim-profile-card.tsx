import React from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { Sparkles, Zap } from 'lucide-react';

export const ClaimProfileCard: React.FC = () => {
  const { user } = useAuth();
  const { level, xp, xpToNextLevel } = useXp();

  const progressPercentage = xpToNextLevel > 0 
    ? ((xp % 1000) / 1000) * 100  // Assuming 1000 XP per level
    : 100;

  return (
    <motion.div
      className="fixed top-6 right-6 z-20"
      initial={{ opacity: 0, scale: 0.8, y: -20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Glassmorphic Profile Card */}
      <div
        className="relative overflow-hidden rounded-2xl p-4 min-w-[280px]"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(255, 255, 255, 0.7) 0%, 
              rgba(255, 255, 255, 0.5) 50%,
              rgba(248, 250, 252, 0.6) 100%
            )
          `,
          backdropFilter: 'blur(40px) saturate(180%)',
          border: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: `
            0 8px 32px rgba(0, 0, 0, 0.1),
            0 4px 16px rgba(0, 0, 0, 0.05),
            inset 0 1px 0 rgba(255, 255, 255, 0.4)
          `
        }}
      >
        {/* Subtle Inner Glass Reflection */}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `
              linear-gradient(135deg, 
                rgba(255, 255, 255, 0.1) 0%, 
                transparent 50%, 
                rgba(255, 255, 255, 0.05) 100%
              )
            `
          }}
        />

        {/* Content */}
        <div className="relative z-10">
          {/* User Info Row */}
          <div className="flex items-center space-x-3 mb-3">
            <Avatar className="h-10 w-10 ring-2 ring-white/40 shadow-lg">
              <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
              <AvatarFallback 
                className="text-sm font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.8) 0%, rgba(99, 102, 241, 0.8) 100%)'
                }}
              >
                {user?.displayName?.charAt(0) || 'W'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate text-sm">
                {user?.displayName || 'WIZ User'}
              </h3>
              <div className="flex items-center space-x-2">
                <Badge 
                  className="text-xs font-bold px-2 py-0.5 border-0"
                  style={{
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(147, 51, 234, 0.3)'
                  }}
                >
                  Lv {level}
                </Badge>
              </div>
            </div>
          </div>

          {/* XP Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <motion.div
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Zap className="w-4 h-4 text-yellow-500" />
                </motion.div>
                <span className="text-sm font-medium text-gray-700">
                  {(xp || 0).toLocaleString()} XP
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {xpToNextLevel > 0 ? `${xpToNextLevel} to next level` : 'Max Level'}
              </span>
            </div>

            {/* Glassmorphic Progress Bar */}
            <div className="relative">
              <div
                className="h-2 rounded-full overflow-hidden"
                style={{
                  background: 'rgba(255, 255, 255, 0.3)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)'
                }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, rgba(147, 51, 234, 0.8) 0%, rgba(99, 102, 241, 0.8) 100%)',
                    width: `${progressPercentage}%`,
                    boxShadow: '0 0 8px rgba(147, 51, 234, 0.3)'
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                />
              </div>
            </div>
          </div>

          {/* XP Balance for Claims */}
          <motion.div 
            className="mt-3 pt-3 border-t border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-4 h-4 text-purple-500" />
                </motion.div>
                <span className="text-xs font-medium text-gray-600">
                  Available for Claims
                </span>
              </div>
              <motion.div
                className="px-2 py-1 rounded-md text-xs font-bold text-white"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.8) 0%, rgba(22, 163, 74, 0.8) 100%)',
                  boxShadow: '0 2px 8px rgba(34, 197, 94, 0.2)'
                }}
                whileHover={{ scale: 1.05 }}
              >
                💎 {(xp || 0).toLocaleString()} XP
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Floating Glass Orbs Animation */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full"
            style={{
              background: 'rgba(147, 51, 234, 0.3)',
              left: `${20 + i * 30}%`,
              top: `${20 + i * 20}%`
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              delay: i * 0.8,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};