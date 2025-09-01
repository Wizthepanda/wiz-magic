import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  Flame, 
  Star, 
  Trophy, 
  BookOpen, 
  Heart, 
  Share2,
  Copy,
  Check,
  Gift,
  Target,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { cn } from '@/lib/utils';

interface PrivateViewerProfileProps {
  className?: string;
}

export const PrivateViewerProfile: React.FC<PrivateViewerProfileProps> = ({ className }) => {
  const { user } = useAuth();
  const { 
    totalXP, 
    level, 
    progressPercent, 
    xpInCurrentLevel,
    xpToNextLevel,
    dailyXP 
  } = useXp();
  
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [sparkAnimation, setSparkAnimation] = useState(false);

  // Trigger spark animation when XP updates
  useEffect(() => {
    const handleXpUpdate = () => {
      setSparkAnimation(true);
      setTimeout(() => setSparkAnimation(false), 2000);
    };

    window.addEventListener('xpUpdated', handleXpUpdate);
    return () => window.removeEventListener('xpUpdated', handleXpUpdate);
  }, []);

  const handleCopyReferral = async () => {
    const referralLink = `${window.location.origin}?ref=${user?.uid || 'demo'}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
    } catch (error) {
      console.error('Failed to copy referral link:', error);
    }
  };

  // Mock viewer data
  const viewerStats = {
    savedMemes: 23,
    questsCompleted: 7,
    streakDays: Math.floor(Math.random() * 15) + 1,
    favoriteCreators: 12,
    watchedToday: Math.floor(Math.random() * 5) + 1
  };

  const recentQuests = [
    { id: 1, title: 'Watch 3 AI videos', progress: 2, total: 3, reward: 150 },
    { id: 2, title: 'Share a funny meme', progress: 1, total: 1, reward: 75 },
    { id: 3, title: 'Follow 2 creators', progress: 0, total: 2, reward: 100 }
  ];

  const savedMemes = [
    { id: 1, title: 'AI be like...', creator: 'TechHumor', likes: 234 },
    { id: 2, title: 'When you debug at 3AM', creator: 'CodeMemes', likes: 567 },
    { id: 3, title: 'React hooks explained', creator: 'DevJokes', likes: 123 }
  ];

  if (!user) return null;

  return (
    <div className={cn("space-y-6", className)}>
      {/* Profile Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50">
        <CardContent className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="relative">
              <Avatar className="w-16 h-16 border-2 border-purple-200">
                <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                <AvatarFallback className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg">
                  {user.displayName?.charAt(0) || 'W'}
                </AvatarFallback>
              </Avatar>
              
              {/* Spark animation overlay */}
              <AnimatePresence>
                {sparkAnimation && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                        style={{
                          left: '50%',
                          top: '50%',
                        }}
                        animate={{
                          x: [0, (Math.random() - 0.5) * 60],
                          y: [0, (Math.random() - 0.5) * 60],
                          scale: [0, 1, 0],
                          opacity: [0, 1, 0],
                        }}
                        transition={{
                          duration: 1.5,
                          delay: i * 0.1,
                        }}
                      />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-lg">{user.displayName}</h3>
              <p className="text-sm text-gray-600">{user.email}</p>
              <Badge className="mt-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                <Star className="w-3 h-3 mr-1" />
                Wizard Level {level}
              </Badge>
            </div>
          </div>

          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">Level Progress</span>
              <span className="text-gray-600">{Math.round(progressPercent)}%</span>
            </div>
            <Progress 
              value={progressPercent} 
              className="h-3"
              style={{
                background: 'linear-gradient(to right, #f3e8ff, #fce7f3)'
              }}
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>{xpInCurrentLevel} XP</span>
              <span>{xpToNextLevel} XP to next</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Pills - Mobile Scrollable */}
      <div className="overflow-x-auto pb-2">
        <div className="flex space-x-3 min-w-max">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-3 rounded-full border border-yellow-200 min-w-max">
            <Zap className="w-5 h-5 text-yellow-600" />
            <div className="text-center">
              <div className="font-bold text-lg text-yellow-700">{totalXP}</div>
              <div className="text-xs text-yellow-600">Total XP</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-50 to-red-50 px-4 py-3 rounded-full border border-orange-200 min-w-max">
            <Flame className="w-5 h-5 text-orange-600" />
            <div className="text-center">
              <div className="font-bold text-lg text-orange-700">{viewerStats.streakDays}</div>
              <div className="text-xs text-orange-600">Day Streak</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-gradient-to-r from-red-50 to-pink-50 px-4 py-3 rounded-full border border-red-200 min-w-max">
            <Heart className="w-5 h-5 text-red-600" />
            <div className="text-center">
              <div className="font-bold text-lg text-red-700">{viewerStats.savedMemes}</div>
              <div className="text-xs text-red-600">Saved Memes</div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-3 rounded-full border border-blue-200 min-w-max">
            <Target className="w-5 h-5 text-blue-600" />
            <div className="text-center">
              <div className="font-bold text-lg text-blue-700">{viewerStats.questsCompleted}</div>
              <div className="text-xs text-blue-600">Quests Done</div>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Quests */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold flex items-center">
              <Trophy className="w-4 h-4 mr-2 text-yellow-500" />
              Daily Quests
            </h4>
            <Badge variant="outline" className="text-xs">
              {recentQuests.filter(q => q.progress >= q.total).length}/3 Complete
            </Badge>
          </div>
          
          <div className="space-y-3">
            {recentQuests.map((quest) => (
              <div key={quest.id} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className={cn(
                    quest.progress >= quest.total ? "text-green-600 line-through" : "text-gray-700"
                  )}>
                    {quest.title}
                  </span>
                  <span className="text-xs text-purple-600 font-medium">
                    +{quest.reward} XP
                  </span>
                </div>
                <Progress value={(quest.progress / quest.total) * 100} className="h-2" />
                <div className="text-xs text-gray-500">
                  {quest.progress}/{quest.total} completed
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Saved Memes */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold flex items-center mb-3">
            <Heart className="w-4 h-4 mr-2 text-red-500" />
            Recent Saves
          </h4>
          
          <div className="space-y-3">
            {savedMemes.map((meme) => (
              <div key={meme.id} className="flex items-center justify-between text-sm">
                <div>
                  <div className="font-medium">{meme.title}</div>
                  <div className="text-xs text-gray-600">by {meme.creator}</div>
                </div>
                <div className="flex items-center space-x-1 text-gray-500">
                  <Heart className="w-3 h-3" />
                  <span className="text-xs">{meme.likes}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invite Friends */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold flex items-center mb-3">
            <Gift className="w-4 h-4 mr-2 text-green-500" />
            Invite Friends
          </h4>
          <p className="text-sm text-gray-600 mb-3">
            Get 50 XP for each friend who joins!
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleCopyReferral}
          >
            {copiedReferral ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Link Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copy Referral Link
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Today's Activity */}
      <Card>
        <CardContent className="p-4">
          <h4 className="font-semibold flex items-center mb-3">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" />
            Today's Activity
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Videos Watched</span>
              <span className="font-medium">{viewerStats.watchedToday}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">XP Earned</span>
              <span className="font-medium text-purple-600">+{dailyXP}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Creators Followed</span>
              <span className="font-medium">{viewerStats.favoriteCreators}</span>
            </div>
          </div>
          
          <div className="mt-3 p-2 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <p className="text-xs text-center text-gray-700">
              🎯 Watch 2 more videos to complete your daily goal!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};