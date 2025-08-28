import React, { useState, useEffect } from 'react';
import { Star, Zap, Trophy, Target, Calendar, Badge as BadgeIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { WizXPSystem, WIZ_BADGES, BADGE_LEVELS } from '@/lib/wiz-xp-system';

interface WizXPProgressBarProps {
  userId?: string;
  currentXP?: number;
  level?: number;
  dailyXP?: number;
  className?: string;
  showBadges?: boolean;
  showDailyProgress?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'compact' | 'detailed';
}

export const WizXPProgressBar: React.FC<WizXPProgressBarProps> = ({
  userId,
  currentXP = 0,
  level = 1,
  dailyXP = 0,
  className = '',
  showBadges = true,
  showDailyProgress = true,
  size = 'md',
  variant = 'default'
}) => {
  const [progressData, setProgressData] = useState(() => 
    WizXPSystem.calculateLevel(currentXP)
  );
  const [userBadges, setUserBadges] = useState<Array<{ id: string; badge: any }>>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Update progress when XP changes
  useEffect(() => {
    const newProgress = WizXPSystem.calculateLevel(currentXP);
    
    // Animate if level changed
    if (newProgress.currentLevel > progressData.currentLevel) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 2000);
    }
    
    setProgressData(newProgress);
  }, [currentXP]);

  // Listen for XP update events
  useEffect(() => {
    const handleXpUpdated = (event: CustomEvent) => {
      console.log('🎯 WizXPProgressBar(wiz) received XP update:', event.detail);
      const { totalXp } = event.detail;
      if (totalXp && totalXp !== currentXP) {
        const newProgress = WizXPSystem.calculateLevel(totalXp);
        
        // Animate if level changed
        if (newProgress.currentLevel > progressData.currentLevel) {
          setIsAnimating(true);
          setTimeout(() => setIsAnimating(false), 2000);
        }
        
        setProgressData(newProgress);
      }
    };

    const handleLevelUp = (event: CustomEvent) => {
      console.log('🆙 WizXPProgressBar(wiz) received level up:', event.detail);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 3000);
    };

    window.addEventListener('xpUpdated', handleXpUpdated as EventListener);
    window.addEventListener('levelUp', handleLevelUp as EventListener);
    
    return () => {
      window.removeEventListener('xpUpdated', handleXpUpdated as EventListener);
      window.removeEventListener('levelUp', handleLevelUp as EventListener);
    };
  }, [currentXP, progressData.currentLevel]);

  // Load user badges
  useEffect(() => {
    if (userId) {
      WizXPSystem.getUserBadges(userId).then(setUserBadges);
    }
  }, [userId, level]); // Reload when level changes (new badge might be earned)

  // Size configurations
  const sizeConfig = {
    sm: {
      height: 'h-2',
      text: 'text-xs',
      icon: 'w-3 h-3',
      badge: 'w-4 h-4',
      spacing: 'space-y-1'
    },
    md: {
      height: 'h-3',
      text: 'text-sm',
      icon: 'w-4 h-4',
      badge: 'w-5 h-5',
      spacing: 'space-y-2'
    },
    lg: {
      height: 'h-4',
      text: 'text-base',
      icon: 'w-5 h-5',
      badge: 'w-6 h-6',
      spacing: 'space-y-3'
    }
  };

  const config = sizeConfig[size];

  // Daily progress
  const dailyProgressPercent = (dailyXP / 360) * 100;
  const dailyRemaining = Math.max(0, 360 - dailyXP);

  // Next badge info
  const nextBadgeLevel = BADGE_LEVELS.find(badgeLevel => badgeLevel > level);
  const hasNextBadge = nextBadgeLevel !== undefined;

  // Compact variant
  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-1">
          <Trophy className={`${config.icon} text-yellow-500`} />
          <span className={`${config.text} font-bold`}>L{level}</span>
        </div>
        <div className="flex-1 min-w-0">
          <Progress 
            value={progressData.progressPercent} 
            className={`${config.height} bg-gray-200`}
            indicatorClassName={`bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300 ${isAnimating ? 'animate-pulse' : ''}`}
          />
        </div>
        <span className={`${config.text} text-gray-500 whitespace-nowrap`}>
          {progressData.xpNeededForNext > 0 ? `${progressData.xpNeededForNext} XP` : 'MAX'}
        </span>
      </div>
    );
  }

  // Detailed variant
  if (variant === 'detailed') {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className={config.spacing}>
            {/* Level Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 ${isAnimating ? 'animate-pulse' : ''}`}>
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">Level {level}</h3>
                  <p className="text-sm text-gray-500">{currentXP.toLocaleString()} Total XP</p>
                </div>
              </div>
              
              {/* Badges */}
              {showBadges && userBadges.length > 0 && (
                <div className="flex items-center space-x-2">
                  {userBadges.slice(-3).map(({ id, badge }) => (
                    <div
                      key={id}
                      className="flex items-center justify-center w-8 h-8 rounded-full text-lg"
                      style={{ backgroundColor: badge.color + '20', color: badge.color }}
                      title={`${badge.name}: ${badge.description}`}
                    >
                      {badge.icon}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Level {level + 1}</span>
                <span>{Math.round(progressData.progressPercent)}%</span>
              </div>
              
              <Progress 
                value={progressData.progressPercent} 
                className="h-4 bg-gray-200"
                indicatorClassName={`bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ${isAnimating ? 'animate-pulse' : ''}`}
              />
              
              <div className="flex justify-between text-xs text-gray-500">
                <span>{progressData.xpInCurrentLevel.toLocaleString()} XP</span>
                <span>{progressData.nextLevelXP.toLocaleString()} XP needed</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Daily Progress */}
              {showDailyProgress && (
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-blue-500" />
                    <span className="text-xs font-medium">Daily XP</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-bold">{dailyXP}</span>
                    <span className="text-gray-500"> / 360</span>
                  </div>
                  <Progress value={dailyProgressPercent} className="h-1" />
                </div>
              )}

              {/* Next Badge */}
              {hasNextBadge && (
                <div className="space-y-1">
                  <div className="flex items-center space-x-1">
                    <BadgeIcon className="w-3 h-3 text-purple-500" />
                    <span className="text-xs font-medium">Next Badge</span>
                  </div>
                  <div className="text-sm">
                    <span className="font-bold">Level {nextBadgeLevel}</span>
                    <div className="text-xs text-gray-500">
                      {WIZ_BADGES[nextBadgeLevel]?.name}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Level Up Animation */}
            {isAnimating && (
              <div className="text-center p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-white">
                <div className="flex items-center justify-center space-x-2">
                  <Star className="w-5 h-5 animate-spin" />
                  <span className="font-bold">LEVEL UP!</span>
                  <Star className="w-5 h-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default variant
  return (
    <div className={`${config.spacing} ${className}`}>
      {/* Level and XP Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Trophy className={`${config.icon} text-yellow-500 ${isAnimating ? 'animate-bounce' : ''}`} />
          <span className={`${config.text} font-bold`}>Level {level}</span>
          {showBadges && userBadges.length > 0 && (
            <div className="flex items-center space-x-1">
              {userBadges.slice(-2).map(({ id, badge }) => (
                <div
                  key={id}
                  className={`${config.badge} flex items-center justify-center rounded-full text-xs`}
                  style={{ backgroundColor: badge.color + '20', color: badge.color }}
                  title={badge.name}
                >
                  {badge.icon}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="text-right">
          <div className={`${config.text} font-bold`}>
            {currentXP.toLocaleString()} XP
          </div>
          {progressData.xpNeededForNext > 0 && (
            <div className="text-xs text-gray-500">
              {progressData.xpNeededForNext.toLocaleString()} to next
            </div>
          )}
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="space-y-1">
        <Progress 
          value={progressData.progressPercent} 
          className={`${config.height} bg-gray-200`}
          indicatorClassName={`bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ${isAnimating ? 'animate-pulse' : ''}`}
        />
        
        <div className="flex justify-between text-xs text-gray-500">
          <span>{progressData.xpInCurrentLevel.toLocaleString()}</span>
          <span>{Math.round(progressData.progressPercent)}%</span>
          <span>{progressData.nextLevelXP.toLocaleString()}</span>
        </div>
      </div>

      {/* Daily Progress (if enabled) */}
      {showDailyProgress && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Zap className={`${config.icon} text-blue-500`} />
            <span className={`${config.text} font-medium`}>Daily: {dailyXP}/360</span>
          </div>
          
          <div className="flex items-center space-x-2">
            {dailyRemaining > 0 && (
              <Badge variant="outline" className={config.text}>
                {dailyRemaining} XP left
              </Badge>
            )}
            {dailyRemaining === 0 && (
              <Badge className={`${config.text} bg-green-500`}>
                Daily Complete!
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Level Up Animation */}
      {isAnimating && (
        <div className="flex items-center justify-center space-x-2 p-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg text-white animate-pulse">
          <Star className="w-4 h-4" />
          <span className="font-bold text-sm">LEVEL UP TO {level}!</span>
          <Star className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};