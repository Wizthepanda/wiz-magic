import React from 'react';
import { motion } from 'framer-motion';
import { Gem, TrendingUp, Star, Zap } from 'lucide-react';

interface XPBalanceCardProps {
  xpBalance: number;
  usdEquivalent: number;
  nextLevelXP?: number;
  currentLevelProgress?: number;
  className?: string;
}

export const XPBalanceCard: React.FC<XPBalanceCardProps> = ({
  xpBalance = 250,
  usdEquivalent = 250,
  nextLevelXP = 500,
  currentLevelProgress = 50,
  className = ""
}) => {
  const progressPercentage = (xpBalance / nextLevelXP) * 100;
  
  return (
    <motion.div
      className={`relative overflow-hidden ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Glass Card Container */}
      <div 
        className="p-6 rounded-3xl border-0 relative"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(255, 255, 255, 0.25) 0%, 
              rgba(255, 255, 255, 0.10) 50%,
              rgba(168, 85, 247, 0.05) 70%,
              rgba(255, 255, 255, 0.15) 100%
            )
          `,
          backdropFilter: 'blur(40px) saturate(180%)',
          border: '2px solid rgba(168, 85, 247, 0.3)',
          boxShadow: `
            0 20px 40px rgba(168, 85, 247, 0.15),
            0 8px 20px rgba(0, 0, 0, 0.08),
            inset 0 2px 0 rgba(255, 255, 255, 0.4),
            inset 0 -1px 0 rgba(0, 0, 0, 0.1)
          `
        }}
      >
        {/* Animated Glow Border */}
        <motion.div
          className="absolute inset-0 rounded-3xl opacity-50"
          style={{
            background: 'linear-gradient(45deg, rgba(168, 85, 247, 0.3), rgba(99, 102, 241, 0.3), rgba(139, 92, 246, 0.3), rgba(168, 85, 247, 0.3))',
            backgroundSize: '300% 300%'
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <motion.div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(99, 102, 241, 0.8) 100%)',
                  boxShadow: '0 8px 20px rgba(168, 85, 247, 0.4)'
                }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <Gem className="w-5 h-5 text-white" />
              </motion.div>
              <div>
                <p className="text-sm font-semibold text-gray-800">XP Balance</p>
                <p className="text-xs text-gray-500">Digital Currency</p>
              </div>
            </div>
            
            <motion.div
              className="text-right"
              whileHover={{ scale: 1.05 }}
            >
              <p className="text-2xl font-bold text-gray-900">{xpBalance.toLocaleString()}</p>
              <p className="text-xs text-gray-600">≈ ${usdEquivalent} value</p>
            </motion.div>
          </div>

          {/* Progress Ring for Next Level */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="font-semibold text-gray-700">Next Level Progress</span>
              <span className="font-bold text-purple-600">{Math.round(progressPercentage)}%</span>
            </div>
            
            {/* Animated Progress Bar */}
            <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, rgba(168, 85, 247, 0.8) 0%, rgba(99, 102, 241, 0.9) 50%, rgba(139, 92, 246, 0.8) 100%)',
                  boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)'
                }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
              
              {/* Shimmer Effect */}
              <motion.div
                className="absolute inset-0 h-full"
                style={{
                  background: 'linear-gradient(45deg, transparent 30%, rgba(255, 255, 255, 0.4) 50%, transparent 70%)',
                  width: `${progressPercentage}%`
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
            
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{xpBalance} XP</span>
              <span>{nextLevelXP} XP</span>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{
                background: 'rgba(34, 197, 94, 0.15)',
                color: '#16a34a',
                border: '1px solid rgba(34, 197, 94, 0.3)'
              }}
              whileHover={{ scale: 1.05 }}
            >
              <TrendingUp className="w-3 h-3" />
              <span>Claimable</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-bold"
              style={{
                background: 'rgba(251, 191, 36, 0.15)',
                color: '#d97706',
                border: '1px solid rgba(251, 191, 36, 0.3)'
              }}
              whileHover={{ scale: 1.05 }}
            >
              <Star className="w-3 h-3" />
              <span>Level {Math.floor(xpBalance / 100)}</span>
            </motion.div>
          </div>
        </div>
        
        {/* Floating Sparkles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute"
              style={{
                left: `${20 + i * 20}%`,
                top: `${15 + i * 15}%`
              }}
              animate={{
                y: [0, -10, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 3 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.7,
                ease: "easeInOut"
              }}
            >
              <Zap className="w-3 h-3 text-yellow-400" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};