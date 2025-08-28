import React, { useState, useEffect } from 'react';
import { Trophy, Crown, Medal, Star, Users, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { WizXPSystem, WIZ_BADGES } from '@/lib/wiz-xp-system';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  photoURL?: string;
  currentXP: number;
  level: number;
  badges: string[];
}

interface WizLeaderboardProps {
  className?: string;
  limit?: number;
  showCurrentUser?: boolean;
}

export const WizLeaderboard: React.FC<WizLeaderboardProps> = ({
  className = '',
  limit = 50,
  showCurrentUser = true
}) => {
  const { user } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardEntry | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'all' | 'monthly' | 'weekly'>('all');

  const getLeaderboardFn = httpsCallable(functions, 'getWizLeaderboard');

  // Load leaderboard data
  const loadLeaderboard = async (period: 'all' | 'monthly' | 'weekly' = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getLeaderboardFn({ limit, period });
      const data = result.data as any;
      
      setLeaderboard(data.leaderboard || []);
      
      // Find current user's rank
      if (user && showCurrentUser) {
        const userEntry = data.leaderboard?.find((entry: LeaderboardEntry) => 
          entry.userId === user.uid
        );
        setCurrentUserRank(userEntry || null);
      }
      
    } catch (error) {
      console.error('❌ Error loading leaderboard:', error);
      setError(error instanceof Error ? error.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaderboard(selectedPeriod);
  }, [selectedPeriod, limit, user?.uid]);

  // Get rank icon/styling
  const getRankDisplay = (rank: number) => {
    switch (rank) {
      case 1:
        return { icon: Crown, color: 'text-yellow-500', bgColor: 'bg-yellow-50' };
      case 2:
        return { icon: Trophy, color: 'text-gray-400', bgColor: 'bg-gray-50' };
      case 3:
        return { icon: Medal, color: 'text-amber-600', bgColor: 'bg-amber-50' };
      default:
        return { icon: Users, color: 'text-blue-500', bgColor: 'bg-blue-50' };
    }
  };

  // Format XP display
  const formatXP = (xp: number) => {
    if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
    if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
    return xp.toString();
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="w-5 h-5" />
            <span>WIZ Leaderboard</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div className="w-10 h-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => loadLeaderboard(selectedPeriod)} variant="outline">
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <span>WIZ Leaderboard</span>
          </div>
          <Badge variant="outline" className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{leaderboard.length}</span>
          </Badge>
        </CardTitle>
        <CardDescription>
          Top wizards ranked by experience points
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="monthly">This Month</TabsTrigger>
            <TabsTrigger value="weekly">This Week</TabsTrigger>
          </TabsList>

          <TabsContent value={selectedPeriod}>
            <div className="space-y-4">
              {/* Current User Rank (if not in top list) */}
              {showCurrentUser && currentUserRank && currentUserRank.rank > limit && (
                <div className="border-2 border-blue-200 rounded-lg p-4 bg-blue-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-500 text-white rounded-full text-sm font-bold">
                      {currentUserRank.rank}
                    </div>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={currentUserRank.photoURL} />
                      <AvatarFallback>
                        {currentUserRank.displayName?.charAt(0) || 'W'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">{currentUserRank.displayName} (You)</span>
                        <Badge variant="outline">Level {currentUserRank.level}</Badge>
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>{formatXP(currentUserRank.currentXP)} XP</span>
                        </span>
                        {currentUserRank.badges.length > 0 && (
                          <div className="flex items-center space-x-1">
                            {currentUserRank.badges.slice(0, 3).map((badgeId) => {
                              const badgeLevel = badgeId.replace('level_', '');
                              const badge = WIZ_BADGES[badgeLevel as keyof typeof WIZ_BADGES];
                              return badge ? (
                                <span key={badgeId} className="text-xs">{badge.icon}</span>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Top 3 Special Display */}
              {leaderboard.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {leaderboard.slice(0, 3).map((entry) => {
                    const rankDisplay = getRankDisplay(entry.rank);
                    const RankIcon = rankDisplay.icon;
                    
                    return (
                      <Card key={entry.userId} className={`${rankDisplay.bgColor} border-2`}>
                        <CardContent className="p-4 text-center">
                          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${rankDisplay.color}`}>
                            <RankIcon className="w-6 h-6" />
                          </div>
                          
                          <Avatar className="w-16 h-16 mx-auto mb-3">
                            <AvatarImage src={entry.photoURL} />
                            <AvatarFallback className="text-lg font-bold">
                              {entry.displayName?.charAt(0) || 'W'}
                            </AvatarFallback>
                          </Avatar>
                          
                          <h3 className="font-bold text-lg mb-1">#{entry.rank}</h3>
                          <p className="font-semibold text-gray-900 mb-2">
                            {entry.displayName || 'Anonymous Wizard'}
                            {entry.userId === user?.uid && (
                              <span className="text-blue-600"> (You)</span>
                            )}
                          </p>
                          
                          <Badge className="mb-2">Level {entry.level}</Badge>
                          
                          <div className="text-sm text-gray-600 mb-2">
                            <span className="font-bold">{formatXP(entry.currentXP)}</span> XP
                          </div>
                          
                          {entry.badges.length > 0 && (
                            <div className="flex justify-center space-x-1">
                              {entry.badges.slice(0, 4).map((badgeId) => {
                                const badgeLevel = badgeId.replace('level_', '');
                                const badge = WIZ_BADGES[badgeLevel as keyof typeof WIZ_BADGES];
                                return badge ? (
                                  <span
                                    key={badgeId}
                                    className="inline-flex items-center justify-center w-6 h-6 rounded-full text-xs"
                                    style={{ backgroundColor: badge.color + '20', color: badge.color }}
                                    title={badge.name}
                                  >
                                    {badge.icon}
                                  </span>
                                ) : null;
                              })}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Rest of leaderboard */}
              {leaderboard.slice(3).map((entry) => {
                const isCurrentUser = entry.userId === user?.uid;
                
                return (
                  <div
                    key={entry.userId}
                    className={`flex items-center space-x-4 p-3 rounded-lg transition-colors ${
                      isCurrentUser 
                        ? 'bg-blue-50 border-2 border-blue-200' 
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {/* Rank */}
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-200 text-gray-700 rounded-full text-sm font-bold">
                      {entry.rank}
                    </div>
                    
                    {/* Avatar */}
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={entry.photoURL} />
                      <AvatarFallback>
                        {entry.displayName?.charAt(0) || 'W'}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold truncate">
                          {entry.displayName || 'Anonymous Wizard'}
                          {isCurrentUser && (
                            <span className="text-blue-600 ml-1">(You)</span>
                          )}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          L{entry.level}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        <span className="flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>{formatXP(entry.currentXP)} XP</span>
                        </span>
                        
                        {entry.badges.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <span className="text-xs text-gray-500">{entry.badges.length} badges</span>
                            {entry.badges.slice(0, 3).map((badgeId) => {
                              const badgeLevel = badgeId.replace('level_', '');
                              const badge = WIZ_BADGES[badgeLevel as keyof typeof WIZ_BADGES];
                              return badge ? (
                                <span key={badgeId} className="text-xs">{badge.icon}</span>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              {leaderboard.length === 0 && (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No wizards found for this period.</p>
                  <p className="text-sm text-gray-400">Start earning XP to appear on the leaderboard!</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};