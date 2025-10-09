import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
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
      {/* Performance Overview with Animated Progress Rings */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {overviewCards.map((card, index) => {
          const trend = getTrendIcon(card.change);
          const IconComponent = card.icon;
          const TrendIcon = trend.icon;
          const progressPercent = Math.min((card.change > 0 ? 75 : 45), 100);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              whileHover={{ y: -4, scale: 1.02 }}
            >
              <Card className="relative overflow-hidden border-0 bg-white/70 backdrop-blur-sm shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-5`} />

                <CardContent className="relative p-6">
                  <div className="flex items-center justify-between mb-4">
                    {/* Icon with Animated Progress Ring */}
                    <div className="relative">
                      <svg className="absolute -inset-2 w-14 h-14 transform -rotate-90">
                        <circle
                          cx="28"
                          cy="28"
                          r="24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="text-slate-200"
                        />
                        <motion.circle
                          cx="28"
                          cy="28"
                          r="24"
                          fill="none"
                          stroke="url(#gradient)"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 24}`}
                          initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 24 * (1 - progressPercent / 100) }}
                          transition={{ duration: 1.5, delay: index * 0.1 }}
                        />
                        <defs>
                          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#8B5CF6" />
                            <stop offset="100%" stopColor="#EC4899" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shadow-lg relative z-10`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Trend Indicator with Spark Line */}
                    {card.change !== 0 && (
                      <div className="flex flex-col items-end">
                        <div className={`flex items-center gap-1 ${trend.color} mb-1`}>
                          <TrendIcon className="w-4 h-4" />
                          <span className="text-sm font-medium">
                            {card.change > 0 ? '+' : ''}{formatTrendValue(card.change)}
                          </span>
                        </div>
                        {/* Mini Spark Chart */}
                        <svg width="50" height="20" className="opacity-50">
                          {[...Array(7)].map((_, i) => {
                            const height = card.change > 0
                              ? Math.random() * 15 + 5
                              : Math.random() * 10 + 2;
                            return (
                              <motion.rect
                                key={i}
                                x={i * 7}
                                y={20 - height}
                                width="5"
                                height={height}
                                className={card.change > 0 ? 'fill-green-500' : 'fill-red-500'}
                                initial={{ scaleY: 0 }}
                                animate={{ scaleY: 1 }}
                                transition={{ delay: index * 0.1 + i * 0.05, duration: 0.3 }}
                                style={{ transformOrigin: 'bottom' }}
                              />
                            );
                          })}
                        </svg>
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
            </motion.div>
          );
        })}
      </div>

      {/* Engagement Breakdown with Dynamic Charts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
      >
        <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
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
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -2 }}
                  >
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-white shadow-sm border border-slate-100 hover:shadow-md transition-all">
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-white to-slate-50 shadow-md`}>
                          <IconComponent className={`w-5 h-5 ${card.color}`} />
                        </div>
                        {/* Micro pulse effect */}
                        <motion.div
                          className={`absolute inset-0 rounded-lg ${card.color} opacity-20`}
                          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0, 0.2] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-slate-900">{card.value}</div>
                        <div className="text-xs text-slate-600">{card.title}</div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Top Performing Content with Thumbnails */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4 }}
      >
        <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-slate-900">Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.engagement.topPerformingContent && stats.engagement.topPerformingContent.length > 0 ? (
              <div className={cn("grid gap-4", isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3")}>
                {stats.engagement.topPerformingContent.map((content, index) => (
                  <motion.div
                    key={content.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + index * 0.1 }}
                    whileHover={{ y: -6, scale: 1.02 }}
                  >
                    <div className="group relative rounded-2xl overflow-hidden bg-gradient-to-br from-white to-slate-50 shadow-md hover:shadow-2xl transition-all duration-300 border border-slate-100">
                      {/* Thumbnail */}
                      <div className="relative aspect-video bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Play className="w-12 h-12 text-white opacity-70 group-hover:scale-125 transition-transform" />
                        </div>
                        {/* Rank Badge */}
                        <div className="absolute top-2 left-2 w-8 h-8 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                          {index + 1}
                        </div>
                        {/* Hover Glow */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>

                      {/* Content Info */}
                      <div className="p-4">
                        <h4 className="font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors">
                          {content.title}
                        </h4>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-1 text-slate-600">
                            <Eye className="w-3 h-3" />
                            <span>{content.views.toLocaleString()} views</span>
                          </div>
                          <div className="flex items-center gap-1 text-green-600 font-medium">
                            <TrendingUp className="w-3 h-3" />
                            <span>{content.engagementRate.toFixed(1)}%</span>
                          </div>
                        </div>
                        {/* Stats Bar */}
                        <div className="mt-3 h-1 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-gradient-to-r from-purple-600 to-pink-600 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${content.engagementRate}%` }}
                            transition={{ delay: 0.9 + index * 0.1, duration: 0.8 }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-600">
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Play className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                </motion.div>
                <p className="font-medium text-slate-700 mb-1">No content data available yet</p>
                <p className="text-sm text-slate-500">Start creating content to see performance metrics</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

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