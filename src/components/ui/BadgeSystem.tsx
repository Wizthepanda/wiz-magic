import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Award, Crown, Trophy } from 'lucide-react';
import { doc, onSnapshot, updateDoc, serverTimestamp, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

interface Badge {
  id: string;
  level: number;
  type: 'level_milestone';
  name: string;
  description: string;
  earnedAt: Date;
  icon: 'star' | 'award' | 'crown' | 'trophy';
  color: string;
}

interface BadgeSystemProps {
  className?: string;
  showNotifications?: boolean;
}

// Badge definitions for auto-awards at levels 3, 5, 7, and 10
const BADGE_DEFINITIONS = {
  3: {
    name: 'Rising Wizard',
    description: 'Reached Level 3! You\'re getting the hang of this magic.',
    icon: 'star' as const,
    color: 'from-blue-500 to-purple-500'
  },
  5: {
    name: 'Skilled Mage',
    description: 'Reached Level 5! Your magical abilities are growing strong.',
    icon: 'award' as const,
    color: 'from-purple-500 to-pink-500'
  },
  7: {
    name: 'Elite Sorcerer',
    description: 'Reached Level 7! You wield magic with exceptional skill.',
    icon: 'crown' as const,
    color: 'from-yellow-500 to-orange-500'
  },
  10: {
    name: 'Archmage Supreme',
    description: 'Reached MAX Level! You are a master of all magical arts.',
    icon: 'trophy' as const,
    color: 'from-yellow-400 to-yellow-600'
  }
};

export const BadgeSystem: React.FC<BadgeSystemProps> = ({
  className = '',
  showNotifications = true
}) => {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [loading, setLoading] = useState(true);

  // Listen for badges collection
  useEffect(() => {
    if (!user?.uid) {
      setBadges([]);
      setLoading(false);
      return;
    }

    console.log('🏆 Setting up badges listener for user:', user.uid);

    // Listen to the entire badges subcollection
    const badgesRef = collection(db, `users/${user.uid}/badges`);
    const unsubscribe = onSnapshot(
      badgesRef,
      (snapshot) => {
        const badgeList: Badge[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          badgeList.push({
            id: doc.id,
            level: data.level,
            type: data.type,
            name: data.name,
            description: data.description,
            earnedAt: data.earnedAt?.toDate() || new Date(),
            icon: data.icon || 'star',
            color: data.color || 'from-gray-500 to-gray-600'
          });
        });

        // Sort by level earned
        badgeList.sort((a, b) => a.level - b.level);
        
        // Check for new badges
        const previousBadgeIds = badges.map(b => b.id);
        const newBadges = badgeList.filter(badge => !previousBadgeIds.includes(badge.id));
        
        if (newBadges.length > 0 && badges.length > 0) {
          // Show notification for newest badge
          setNewBadge(newBadges[newBadges.length - 1]);
          setTimeout(() => setNewBadge(null), 5000);
        }

        setBadges(badgeList);
        setLoading(false);
      },
      (error) => {
        console.error('❌ Error listening to badges:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Auto-award badges based on level ups
  const awardBadgeForLevel = async (level: number) => {
    if (!user?.uid || !BADGE_DEFINITIONS[level as keyof typeof BADGE_DEFINITIONS]) return;

    const badgeData = BADGE_DEFINITIONS[level as keyof typeof BADGE_DEFINITIONS];
    const badgeRef = doc(db, `users/${user.uid}/badges`, `level_${level}_badge`);

    try {
      await updateDoc(badgeRef, {
        level,
        type: 'level_milestone',
        name: badgeData.name,
        description: badgeData.description,
        icon: badgeData.icon,
        color: badgeData.color,
        earnedAt: serverTimestamp()
      }, { merge: true });

      console.log(`🏆 Badge awarded for level ${level}: ${badgeData.name}`);
    } catch (error) {
      console.error('Error awarding badge:', error);
    }
  };

  // Listen for level up events to auto-award badges
  useEffect(() => {
    const handleLevelUp = (event: CustomEvent) => {
      const { newLevel } = event.detail;
      if ([3, 5, 7, 10].includes(newLevel)) {
        awardBadgeForLevel(newLevel);
      }
    };

    window.addEventListener('levelUp', handleLevelUp as EventListener);
    return () => window.removeEventListener('levelUp', handleLevelUp as EventListener);
  }, [user?.uid]);

  const getBadgeIcon = (iconType: Badge['icon']) => {
    switch (iconType) {
      case 'star': return <Star className="w-6 h-6" />;
      case 'award': return <Award className="w-6 h-6" />;
      case 'crown': return <Crown className="w-6 h-6" />;
      case 'trophy': return <Trophy className="w-6 h-6" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  if (loading) {
    return (
      <div className={`badge-system loading ${className}`}>
        <div className="flex space-x-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`badge-system ${className}`}>
      {/* Badge Collection Display */}
      <div className="badges-display">
        <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center space-x-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          <span>Badges Earned ({badges.length})</span>
        </h3>

        {badges.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>No badges earned yet.</p>
            <p className="text-sm">Reach level 3 to earn your first badge!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {badges.map((badge) => (
              <motion.div
                key={badge.id}
                className="badge-card relative group cursor-pointer"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 500, 
                  damping: 30,
                  delay: badges.indexOf(badge) * 0.1
                }}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${badge.color} p-4 shadow-lg`}>
                  <div className="flex flex-col items-center justify-center h-full text-white">
                    {getBadgeIcon(badge.icon)}
                    <span className="text-xs font-semibold mt-2 text-center">
                      Level {badge.level}
                    </span>
                  </div>
                </div>

                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                    <div className="font-semibold">{badge.name}</div>
                    <div className="text-gray-300">{badge.description}</div>
                    <div className="text-gray-400 text-xs mt-1">
                      {badge.earnedAt.toLocaleDateString()}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Upcoming Badges Preview */}
        <div className="mt-8">
          <h4 className="text-md font-medium text-gray-300 mb-3">Upcoming Badges</h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Object.entries(BADGE_DEFINITIONS).map(([level, badgeData]) => {
              const levelNum = parseInt(level);
              const earned = badges.some(b => b.level === levelNum);
              
              if (earned) return null;
              
              return (
                <div key={level} className="badge-preview opacity-50">
                  <div className={`w-full aspect-square rounded-xl bg-gradient-to-br ${badgeData.color} p-4 shadow-lg border-2 border-dashed border-gray-600`}>
                    <div className="flex flex-col items-center justify-center h-full text-white">
                      {getBadgeIcon(badgeData.icon)}
                      <span className="text-xs font-semibold mt-2">
                        Level {level}
                      </span>
                    </div>
                  </div>
                  <div className="text-center mt-2 text-xs text-gray-400">
                    {badgeData.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* New Badge Notification */}
      <AnimatePresence>
        {showNotifications && newBadge && (
          <motion.div
            className="fixed top-4 right-4 z-50 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-4 rounded-xl shadow-xl max-w-sm"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getBadgeIcon(newBadge.icon)}
              </div>
              <div className="flex-1">
                <h4 className="font-bold text-lg">🎉 New Badge Earned!</h4>
                <p className="font-semibold">{newBadge.name}</p>
                <p className="text-sm opacity-90">{newBadge.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};