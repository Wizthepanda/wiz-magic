import React, { useState } from 'react';
import { Calendar, Youtube, Zap, Trophy, Target, Clock, Share2, Users, Smartphone, Monitor } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useXp } from '@/context/XpContext';
import { useYouTubeXP } from '@/hooks/useYouTubeXP';
import { useAuth } from '@/hooks/useAuth';

export const XPDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    totalXp, 
    level, 
    xpToNextLevel, 
    progressPercent, 
    dailyXp, 
    dailyXpCap, 
    currentStreak,
    canEarnMoreXP,
    dailyProgress
  } = useXp();

  const {
    youtubeXPData,
    xpLogs,
    syncInProgress,
    initializeTracking,
    syncYouTubeHistory,
    getXPBreakdown,
    getTimeSinceLastSync,
    getRecentActivity,
    canSyncNow,
    needsTokenRefresh,
  } = useYouTubeXP();

  const [showSyncResult, setShowSyncResult] = useState<{
    show: boolean;
    result?: {
      success: boolean;
      entriesProcessed: number;
      xpAwarded: number;
      error?: string;
    };
  }>({ show: false });

  const handleManualSync = async () => {
    const result = await syncYouTubeHistory();
    setShowSyncResult({ show: true, result });
    
    setTimeout(() => setShowSyncResult({ show: false }), 5000);
  };

  const xpBreakdown = getXPBreakdown();
  const timeSinceLastSync = getTimeSinceLastSync();
  const recentActivity = getRecentActivity(7);

  // Calculate level progress
  const currentLevelXP = totalXp - (level - 1) * 100; // Simplified calculation
  const levelProgressPercent = (currentLevelXP / 100) * 100;

  // XP sources data
  const xpSources = [
    {
      name: 'Watch Time',
      xp: xpBreakdown.watchTime,
      icon: <Monitor className="w-4 h-4" />,
      color: 'bg-blue-500',
    },
    {
      name: 'YouTube API',
      xp: xpBreakdown.youtubeAPI,
      icon: <Youtube className="w-4 h-4" />,
      color: 'bg-red-500',
    },
    {
      name: 'Completion Bonus',
      xp: xpBreakdown.completionBonus,
      icon: <Target className="w-4 h-4" />,
      color: 'bg-green-500',
    },
    {
      name: 'Shares',
      xp: xpBreakdown.shares,
      icon: <Share2 className="w-4 h-4" />,
      color: 'bg-purple-500',
    },
    {
      name: 'Referrals',
      xp: xpBreakdown.referrals,
      icon: <Users className="w-4 h-4" />,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">XP Dashboard</h1>
          <p className="text-gray-600">Track your progress across all platforms</p>
        </div>
        <Badge variant={canEarnMoreXP ? "default" : "secondary"} className="px-3 py-1">
          {canEarnMoreXP ? `${dailyXp}/${dailyXpCap} Daily XP` : 'Daily Cap Reached'}
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Level</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{level}</div>
            <p className="text-xs text-muted-foreground">
              {xpToNextLevel} XP to next level
            </p>
            <Progress value={levelProgressPercent} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total XP</CardTitle>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalXp.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All-time experience points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Progress</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyXp}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(dailyProgress)}% of daily cap
            </p>
            <Progress value={dailyProgress} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Streak</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentStreak}</div>
            <p className="text-xs text-muted-foreground">
              {currentStreak === 1 ? 'Day' : 'Days'} active
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="youtube">YouTube Integration</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* XP Sources Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>XP Sources</CardTitle>
                <CardDescription>Breakdown of your experience points by source</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {xpSources.map((source) => (
                    <div key={source.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${source.color}`} />
                        {source.icon}
                        <span className="text-sm font-medium">{source.name}</span>
                      </div>
                      <span className="font-bold">{source.xp.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Level Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Level Progress</CardTitle>
                <CardDescription>Your journey to the next level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">Level {level}</span>
                    <span className="text-sm text-gray-500">Level {level + 1}</span>
                  </div>
                  <Progress value={progressPercent} className="h-3" />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{currentLevelXP} XP</span>
                    <span>{xpToNextLevel} XP needed</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="youtube" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Youtube className="w-5 h-5 text-red-500" />
                YouTube Integration
              </CardTitle>
              <CardDescription>
                Track XP from videos you watch directly on YouTube
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Connection Status */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      youtubeXPData.isConnected ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                    <div>
                      <p className="font-medium">
                        {youtubeXPData.isConnected ? 'Connected' : 'Not Connected'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {youtubeXPData.isConnected 
                          ? 'YouTube watch history tracking is active'
                          : 'Connect to track off-platform viewing'
                        }
                      </p>
                    </div>
                  </div>
                  {needsTokenRefresh && (
                    <Badge variant="destructive">Token Expired</Badge>
                  )}
                </div>

                {/* Sync Status */}
                {youtubeXPData.isConnected && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {youtubeXPData.totalOffPlatformXP}
                      </div>
                      <div className="text-sm text-gray-600">Off-Platform XP</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {youtubeXPData.youtubeEntriesCount}
                      </div>
                      <div className="text-sm text-gray-600">YouTube Videos</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {timeSinceLastSync ? `${timeSinceLastSync.hours}h` : 'Never'}
                      </div>
                      <div className="text-sm text-gray-600">Last Sync</div>
                    </div>
                  </div>
                )}

                {/* Manual Sync */}
                {youtubeXPData.isConnected && (
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div>
                      <p className="font-medium">Manual Sync</p>
                      <p className="text-sm text-gray-500">
                        Sync your recent YouTube watch history now
                      </p>
                    </div>
                    <Button 
                      onClick={handleManualSync}
                      disabled={!canSyncNow}
                      className="flex items-center gap-2"
                    >
                      {syncInProgress && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      )}
                      {syncInProgress ? 'Syncing...' : 'Sync Now'}
                    </Button>
                  </div>
                )}

                {/* Sync Result */}
                {showSyncResult.show && showSyncResult.result && (
                  <div className={`p-4 rounded-lg ${
                    showSyncResult.result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}>
                    <p className={`font-medium ${
                      showSyncResult.result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {showSyncResult.result.success ? 'Sync Successful!' : 'Sync Failed'}
                    </p>
                    {showSyncResult.result.success && (
                      <p className="text-sm text-green-600">
                        Processed {showSyncResult.result.entriesProcessed} videos, awarded {showSyncResult.result.xpAwarded} XP
                      </p>
                    )}
                    {showSyncResult.result.error && (
                      <p className="text-sm text-red-600">
                        {showSyncResult.result.error}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Daily XP Tracking */}
            <Card>
              <CardHeader>
                <CardTitle>Daily XP Tracking</CardTitle>
                <CardDescription>Your daily progress and limits</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Daily XP</span>
                    <span className="text-sm">{dailyXp} / {dailyXpCap}</span>
                  </div>
                  <Progress value={dailyProgress} className="h-2" />
                  <div className="text-sm text-gray-500">
                    {canEarnMoreXP ? 
                      `${dailyXpCap - dailyXp} XP remaining today` :
                      'Daily limit reached - resets at midnight UTC'
                    }
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* XP Rate Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>XP Rate Analysis</CardTitle>
                <CardDescription>Your earning efficiency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">Embed Tracking</span>
                    <span className="text-sm font-medium">1 XP / 10s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">YouTube API</span>
                    <span className="text-sm font-medium">Estimated</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Completion Bonus</span>
                    <span className="text-sm font-medium">+10%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Share Bonus</span>
                    <span className="text-sm font-medium">+20 XP</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity (Last 7 Days)</CardTitle>
              <CardDescription>Your latest XP-earning activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length > 0 ? (
                  recentActivity.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          {log.source === 'youtube_api' ? (
                            <Youtube className="w-4 h-4 text-red-500" />
                          ) : log.source === 'share' ? (
                            <Share2 className="w-4 h-4 text-purple-500" />
                          ) : log.source === 'referral' ? (
                            <Users className="w-4 h-4 text-orange-500" />
                          ) : (
                            <Smartphone className="w-4 h-4 text-blue-500" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium capitalize">
                            {log.source.replace('_', ' ')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {log.timestamp.toLocaleDateString()} {log.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-green-600">+{log.xpAmount} XP</p>
                        {log.videoId && (
                          <p className="text-xs text-gray-500">Video ID: {log.videoId.slice(0, 8)}...</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="w-8 h-8 mx-auto mb-2" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};