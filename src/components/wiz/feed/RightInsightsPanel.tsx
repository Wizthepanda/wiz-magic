import React from 'react';
import { motion } from 'framer-motion';
import { Users, Sparkles, Crown, Medal, Award, Zap } from 'lucide-react';

const cardStyle = 'bg-white/90 backdrop-blur-xl rounded-3xl shadow-lg border border-gray-100/50 px-6 py-6';

export default function RightInsightsPanel() {
  const trendingCommunities = [
    {
      id: 1,
      name: 'Tech Wizards',
      members: 15420,
      growth: 72,
      avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=tech'
    },
    {
      id: 2,
      name: 'Crypto Kings',
      members: 28950,
      growth: 54,
      avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=crypto'
    },
    {
      id: 3,
      name: 'Design Wizards',
      members: 8750,
      growth: 41,
      avatar: 'https://api.dicebear.com/7.x/shapes/svg?seed=design'
    },
  ];

  const topContributors = [
    {
      id: 1,
      name: 'Alex Rivera',
      zaps: 12500,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      rank: 1
    },
    {
      id: 2,
      name: 'Sarah Chen',
      zaps: 11200,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      rank: 2
    },
    {
      id: 3,
      name: 'Luna Park',
      zaps: 8900,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna',
      rank: 3
    },
  ];

  const creatorSpotlight = {
    name: 'Faceless Avatars',
    handle: '@facelessavatars',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=faceless',
    followers: '2.1M',
    description: 'Creating stunning digital art that pushes the boundaries of imagination'
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRankGlow = (rank: number) => {
    switch (rank) {
      case 1:
        return 'shadow-yellow-500/20 border-yellow-200';
      case 2:
        return 'shadow-gray-400/20 border-gray-200';
      case 3:
        return 'shadow-amber-600/20 border-amber-200';
      default:
        return 'border-gray-100';
    }
  };

  return (
    <aside className="px-6 py-6 space-y-6">
      {/* Trending Communities */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className={cardStyle}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-red-500">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">🔥 Trending Communities</h3>
        </div>
        <div className="space-y-4">
          {trendingCommunities.map((community, index) => (
            <motion.div
              key={community.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50/50 transition-colors cursor-pointer"
            >
              <div className="relative flex-shrink-0">
                <img
                  src={community.avatar}
                  alt={community.name}
                  className="w-12 h-12 rounded-2xl object-cover"
                />
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center"
                >
                  <Sparkles className="w-2 h-2 text-white" />
                </motion.div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-base truncate">{community.name}</h4>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Users className="w-3 h-3" />
                  <span>{community.members.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                >
                  Join
                </motion.button>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${community.growth}%` }}
                      transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                    />
                  </div>
                  <span className="text-xs font-medium text-purple-600">+{community.growth}%</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Top Contributors */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className={cardStyle}
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">⚡ Top Contributors</h3>
        </div>
        <div className="space-y-3">
          {topContributors.map((contributor, index) => (
            <motion.div
              key={contributor.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${getRankGlow(contributor.rank)}`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={contributor.avatar}
                  alt={contributor.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-white shadow-md"
                />
                {contributor.rank <= 3 && (
                  <div className="absolute -top-1 -right-1 bg-white rounded-full p-0.5 shadow-md">
                    {getRankIcon(contributor.rank)}
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-base truncate">{contributor.name}</p>
                <p className="text-xs text-gray-500">Rank #{contributor.rank}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500">
                  {contributor.zaps.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">ZAPs</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Creator Spotlight */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        className={`${cardStyle} relative overflow-hidden`}
      >
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-orange-500/5 rounded-3xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Creator Spotlight</h3>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="rounded-2xl p-5 bg-gradient-to-br from-purple-500 to-pink-500 text-white relative overflow-hidden"
          >
            {/* Animated background pattern */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-10 translate-x-10" />
              <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/10 rounded-full translate-y-8 -translate-x-8" />
            </div>

            <div className="relative flex items-center gap-4 mb-4">
              <div className="relative flex-shrink-0">
                <img
                  src={creatorSpotlight.avatar}
                  alt={creatorSpotlight.name}
                  className="w-16 h-16 rounded-2xl object-cover ring-3 ring-white/30"
                />
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
                >
                  <Crown className="w-3 h-3 text-white" />
                </motion.div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg">{creatorSpotlight.name}</h4>
                <p className="text-white/80 text-sm">{creatorSpotlight.handle}</p>
                <p className="text-white/60 text-xs">{creatorSpotlight.followers} followers</p>
              </div>
            </div>

            <p className="text-white/90 text-sm mb-4 leading-relaxed">
              {creatorSpotlight.description}
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full py-3 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white font-semibold hover:bg-white/30 transition-all"
            >
              View Profile
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </aside>
  );
}
