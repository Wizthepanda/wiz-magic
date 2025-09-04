import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreatorStats } from '../hooks/useCreatorStats';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Eye,
  Users,
  Heart,
  MessageSquare,
  Share2,
  Play,
  DollarSign
} from 'lucide-react';

interface OverviewProps {
  userId: string;
}

export const CreatorOverview: React.FC<OverviewProps> = ({ userId }) => {
  const { data: stats, isLoading } = useCreatorStats(userId);
  const isMobile = useIsMobile();

  const getTrendIcon = (value: number) => {
    if (value > 0) return { icon: TrendingUp, color: 'text-green-500' };
    if (value < 0) return { icon: TrendingDown, color: 'text-red-500' };
    return { icon: Minus, color: 'text-slate-400' };
  };

  const formatTrendValue = (value: number): string => {
    const abs = Math.abs(value);
    if (abs >= 1000000) return `${(abs / 1000000).toFixed(1)}M`;
    if (abs >= 1000) return `${(abs / 1000).toFixed(1)}K`;
    return abs.toString();
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, j) => (
              <Card key={j} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                  <div className="h-8 bg-slate-200 rounded w-1/2 mb-1" />
                  <div className="h-3 bg-slate-200 rounded w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ))}
      </div>
    );
  }

  const overviewCards = [
    // Performance Metrics
    {
      title: "Views This Month",
      value: stats?.monthlyViews.toLocaleString() || '0',
      change: stats?.trends.viewsGrowth || 0,
      icon: Eye,
      gradient: "from-blue-500 to-purple-600"
    },
    {
      title: "New Followers",
      value: stats?.audience.newFollowersThisMonth.toLocaleString() || '0',
      change: stats?.trends.subscribersGrowth || 0,
      icon: Users,
      gradient: "from-green-500 to-emerald-600"
    },
    {
      title: "Total Engagement",
      value: (stats?.engagement.totalLikes + stats?.engagement.totalComments + stats?.engagement.totalShares).toLocaleString() || '0',
      change: stats?.trends.engagementGrowth || 0,
      icon: Heart,
      gradient: "from-red-500 to-pink-600"
    },
    {
      title: "Revenue This Month",
      value: `$${stats?.earnings.thisMonth.toFixed(2) || '0.00'}`,
      change: stats?.trends.revenueGrowth || 0,
      icon: DollarSign,
      gradient: "from-yellow-500 to-orange-600"
    }
  ];

  const engagementCards = [
    {
      title: "Total Likes",
      value: stats?.engagement.totalLikes.toLocaleString() || '0',
      icon: Heart,
      color: "text-red-500"
    },
    {
      title: "Comments",
      value: stats?.engagement.totalComments.toLocaleString() || '0',
      icon: MessageSquare,
      color: "text-blue-500"
    },
    {
      title: "Shares",
      value: stats?.engagement.totalShares.toLocaleString() || '0',
      icon: Share2,
      color: "text-purple-500"
    },
    {
      title: "Avg Watch Time",
      value: `${Math.floor((stats?.avgWatchTime || 0) / 60)}:${String((stats?.avgWatchTime || 0) % 60).padStart(2, '0')}`,
      icon: Play,
      color: "text-green-500"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Performance Overview */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card, index) => {
          const trend = getTrendIcon(card.change);
          const IconComponent = card.icon;
          const TrendIcon = trend.icon;

          return (
            <Card key={index} className="relative overflow-hidden border-0 bg-white/60 backdrop-blur-sm shadow-lg">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5`} />
              
              <CardContent className="relative p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  
                  {card.change !== 0 && (
                    <div className={`flex items-center gap-1 ${trend.color}`}>
                      <TrendIcon className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {card.change > 0 ? '+' : ''}{formatTrendValue(card.change)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-1">
                  <div className="text-2xl font-bold text-slate-900">
                    {card.value}
                  </div>
                  <div className="text-sm font-medium text-slate-600">
                    {card.title}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Engagement Breakdown */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900">Engagement Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-2" : "grid-cols-4"
          )}>
            {engagementCards.map((card, index) => {
              const IconComponent = card.icon;
              
              return (
                <div key={index} className="flex items-center gap-3 p-4 rounded-lg bg-slate-50/50">
                  <IconComponent className={`w-5 h-5 ${card.color}`} />
                  <div>
                    <div className="text-lg font-bold text-slate-900">{card.value}</div>
                    <div className="text-sm text-slate-600">{card.title}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Content */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900">Top Performing Content</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.engagement.topPerformingContent && stats.engagement.topPerformingContent.length > 0 ? (
            <div className="space-y-3">
              {stats.engagement.topPerformingContent.map((content, index) => (
                <div key={content.id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-slate-900">{content.title}</div>
                      <div className="text-sm text-slate-600">
                        {content.views.toLocaleString()} views • {content.engagementRate.toFixed(1)}% engagement
                      </div>
                    </div>
                  </div>
                  <Eye className="w-4 h-4 text-slate-400" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-600">
              <Play className="w-12 h-12 mx-auto mb-3 text-slate-400" />
              <p>No content data available yet</p>
              <p className="text-sm">Start creating content to see performance metrics</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "grid gap-3",
            isMobile ? "grid-cols-1" : "grid-cols-3"
          )}>
            <button className="p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-400 hover:bg-blue-50/50 transition-colors text-left">
              <div className="font-medium text-slate-900 mb-1">Upload New Content</div>
              <div className="text-sm text-slate-600">Share your latest video or short</div>
            </button>
            
            <button className="p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-green-400 hover:bg-green-50/50 transition-colors text-left">
              <div className="font-medium text-slate-900 mb-1">Create Course</div>
              <div className="text-sm text-slate-600">Design a new learning experience</div>
            </button>
            
            <button className="p-4 rounded-lg border-2 border-dashed border-slate-300 hover:border-purple-400 hover:bg-purple-50/50 transition-colors text-left">
              <div className="font-medium text-slate-900 mb-1">View Analytics</div>
              <div className="text-sm text-slate-600">Dive deep into your metrics</div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};