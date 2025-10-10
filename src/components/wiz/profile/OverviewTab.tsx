import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Zap, Eye, Clock, Flame, Trophy, ArrowUpRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ConnectYouTubeButton } from '@/components/wiz/ConnectYouTubeButton';

interface OverviewTabProps {
  totalZAPs: number;
  videosWatched: number;
  watchTime: string;
  streak: number;
  joinedCommunities: any[];
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  totalZAPs,
  videosWatched,
  watchTime,
  streak,
  joinedCommunities = [],
}) => {
  const navigate = useNavigate();

  const stats = [
    {
      id: 'zaps',
      title: 'Total ZAPs',
      value: totalZAPs.toLocaleString(),
      icon: Zap,
      gradient: 'from-[#6366F1] via-[#8B5CF6] to-[#06B6D4]',
      glow: 'rgba(99, 102, 241, 0.25)',
    },
    {
      id: 'videos',
      title: 'Videos Watched',
      value: videosWatched,
      icon: Eye,
      gradient: 'from-blue-500 to-cyan-500',
      glow: 'rgba(59, 130, 246, 0.25)',
    },
    {
      id: 'time',
      title: 'Watch Time',
      value: watchTime,
      icon: Clock,
      gradient: 'from-emerald-500 to-teal-500',
      glow: 'rgba(16, 185, 129, 0.25)',
    },
    {
      id: 'streak',
      title: 'Day Streak',
      value: streak,
      icon: Flame,
      gradient: 'from-orange-500 to-red-500',
      glow: 'rgba(249, 115, 22, 0.25)',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Core Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, y: -4 }}
          >
            <Card className="border-0 bg-white/60 backdrop-blur-xl shadow-md hover:shadow-xl transition-shadow relative overflow-hidden">
              {/* Glow effect */}
              <div 
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity blur-xl"
                style={{ background: stat.glow }}
              />
              
              <CardContent className="p-5 relative">
                <div className={cn(
                  "w-10 h-10 rounded-lg bg-gradient-to-br mb-3 flex items-center justify-center",
                  stat.gradient
                )}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-3xl font-bold">
                  <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", stat.gradient)}>
                    {stat.value}
                  </span>
                </div>
                <div className="text-sm text-slate-600 mt-1">{stat.title}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Communities Section */}
      {joinedCommunities.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Your Communities
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/?section=community')}
              className="text-[#8B5CF6] hover:text-[#6366F1]"
            >
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {joinedCommunities.slice(0, 3).map((community: any, index) => (
              <motion.div
                key={community.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Card 
                  className="border-0 bg-white/60 backdrop-blur-xl shadow-md hover:shadow-xl transition-all cursor-pointer group"
                  onClick={() => navigate(`/community/${community.id}`)}
                >
                  <CardContent className="p-0">
                    <div className="relative h-32 overflow-hidden rounded-t-xl">
                      <img
                        src={community.bannerUrl || community.coverMedia?.[0]?.url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400'}
                        alt={community.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400';
                        }}
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-green-500/90 text-white border-0">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Joined
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-semibold text-slate-900 mb-1 line-clamp-1">{community.title}</h4>
                      <p className="text-sm text-slate-500">{community.accessType}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* YouTube Connection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <ConnectYouTubeButton variant="card" showChannelInfo={true} />
      </motion.div>

      {/* Leaderboard Rank */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="border-0 bg-gradient-to-br from-white/80 to-white/60 backdrop-blur-xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] flex items-center justify-center relative">
                  <Trophy className="w-8 h-8 text-white" />
                  <div className="absolute inset-0 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] blur-xl opacity-50 -z-10" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Leaderboard Rank</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl font-bold bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent">
                      #14
                    </span>
                    <span className="text-slate-600">Wizard of ZAPs 🪄</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm text-slate-500 mb-1">Next Rank</div>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full"
                      style={{ width: `92%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600">92%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

