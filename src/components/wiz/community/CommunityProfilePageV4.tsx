import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  BookOpen,
  Trophy,
  Info,
  Gift,
  MessageCircle,
  Heart,
  Share2,
  MessageSquare,
  Image as ImageIcon,
  Send,
  X,
  Crown,
  Award,
  Zap,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ZapRewardTiersDisplay, ZAPTier, ZAPReward } from './ZapRewardTiersDisplay';

interface CommunityProfilePageV4Props {
  communityId: string;
}

type TabType = 'community' | 'courses' | 'leaderboard' | 'about' | 'reward';

interface Member {
  id: string;
  name: string;
  avatar: string;
  role: 'Creator' | 'Moderator' | 'Member';
  level: number;
  xp: number;
  isOnline: boolean;
}

interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    level: number;
  };
  content: string;
  image?: string;
  likes: number;
  comments: number;
  shares: number;
  timestamp: string;
}

interface Course {
  id: string;
  title: string;
  thumbnail: string;
  progress: number;
  xpEarned: number;
  totalXp: number;
}

interface LeaderboardEntry {
  rank: number;
  id: string;
  name: string;
  avatar: string;
  xp: number;
  level: number;
}

export const CommunityProfilePageV4: React.FC<CommunityProfilePageV4Props> = ({ communityId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('community');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Mock data
  const communityData = {
    name: 'WIZ Community',
    lastUpdated: 'Dec 18, 2024',
    progress: 0,
    creator: {
      id: '1',
      name: 'Alex Rivera',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
      bio: 'Creative entrepreneur & AI enthusiast. Building the future of online communities.',
      level: 42
    }
  };

  const members: Member[] = [
    { id: '1', name: 'Alex Rivera', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', role: 'Creator', level: 42, xp: 12500, isOnline: true },
    { id: '2', name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', role: 'Moderator', level: 38, xp: 11200, isOnline: true },
    { id: '3', name: 'Marcus Stone', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus', role: 'Member', level: 24, xp: 6800, isOnline: false },
    { id: '4', name: 'Luna Park', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna', role: 'Member', level: 31, xp: 8900, isOnline: true },
    { id: '5', name: 'Jordan Lee', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan', role: 'Member', level: 19, xp: 5200, isOnline: false },
    { id: '6', name: 'Emma Davis', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', role: 'Member', level: 27, xp: 7400, isOnline: true },
  ];

  const posts: Post[] = [
    {
      id: '1',
      author: { name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', level: 38 },
      content: 'Just finished the AI Fundamentals course! The content was incredible and I learned so much about neural networks. Can\'t wait to apply this to my projects! 🚀',
      likes: 24,
      comments: 8,
      shares: 3,
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      author: { name: 'Marcus Stone', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus', level: 24 },
      content: 'Who else is working on the community challenge this week? Would love to collaborate and share ideas!',
      likes: 15,
      comments: 12,
      shares: 2,
      timestamp: '5 hours ago'
    },
    {
      id: '3',
      author: { name: 'Luna Park', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna', level: 31 },
      content: 'Pro tip: The advanced modules in the Creator Toolkit are absolute gold. Don\'t skip them!',
      image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500&h=300&fit=crop',
      likes: 42,
      comments: 18,
      shares: 7,
      timestamp: '1 day ago'
    }
  ];

  const courses: Course[] = [
    { id: '1', title: 'AI Fundamentals', thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=250&fit=crop', progress: 75, xpEarned: 450, totalXp: 600 },
    { id: '2', title: 'Creator Toolkit Mastery', thumbnail: 'https://images.unsplash.com/photo-1634942537034-2531766767d1?w=400&h=250&fit=crop', progress: 40, xpEarned: 280, totalXp: 700 },
    { id: '3', title: 'Community Building 101', thumbnail: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=250&fit=crop', progress: 20, xpEarned: 120, totalXp: 600 },
  ];

  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, id: '1', name: 'Alex Rivera', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex', xp: 12500, level: 42 },
    { rank: 2, id: '2', name: 'Sarah Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah', xp: 11200, level: 38 },
    { rank: 3, id: '4', name: 'Luna Park', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=luna', xp: 8900, level: 31 },
    { rank: 4, id: '6', name: 'Emma Davis', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma', xp: 7400, level: 27 },
    { rank: 5, id: '3', name: 'Marcus Stone', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marcus', xp: 6800, level: 24 },
    { rank: 6, id: '5', name: 'Jordan Lee', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jordan', xp: 5200, level: 19 },
  ];

  const zapTiers: ZAPTier[] = [
    {
      id: '1',
      tier: 'Bronze',
      icon: '⚡',
      zapsRequired: 9,
      currentZAPs: 7,
      userName: 'Alex Rivera',
      rewards: [
        { id: 'b1', name: 'Module 3', completed: false },
        { id: 'b2', name: 'Complete Module 2 Building', completed: false },
      ],
    },
    {
      id: '2',
      tier: 'Silver',
      icon: '🔥',
      zapsRequired: 25,
      currentZAPs: 0,
      rewards: [
        { id: 's1', name: 'Welcome Bonus', description: '50 ZAPs for joining', completed: false },
        { id: 's2', name: 'VIP Discord Badge', description: 'Exclusive role in server', completed: false },
      ],
    },
    {
      id: '3',
      tier: 'Gold',
      icon: '👑',
      zapsRequired: 50,
      currentZAPs: 0,
      rewards: [
        { id: 'g1', name: 'Premium Content Access', description: 'Unlock exclusive courses', completed: false },
        { id: 'g2', name: 'Monthly Bonus ZAPs', description: '100 ZAPs every month', completed: false },
        { id: 'g3', name: 'Creator Spotlight', description: 'Featured in newsletter', completed: false },
      ],
    },
    {
      id: '4',
      tier: 'Diamond',
      icon: '💎',
      zapsRequired: 100,
      currentZAPs: 0,
      rewards: [
        { id: 'd1', name: '1-on-1 Mentorship', description: 'Private session with creator', completed: false },
        { id: 'd2', name: 'Custom Profile Badge', description: 'Unique diamond status', completed: false },
        { id: 'd3', name: 'Early Access Features', description: 'Beta test new releases', completed: false },
      ],
    },
    {
      id: '5',
      tier: 'Platinum',
      icon: '🌟',
      zapsRequired: 250,
      currentZAPs: 0,
      rewards: [
        { id: 'p1', name: 'Lifetime Premium', description: 'Forever access to all content', completed: false },
        { id: 'p2', name: 'Co-Creation Rights', description: 'Help shape future content', completed: false },
        { id: 'p3', name: 'Revenue Share', description: '5% of community earnings', completed: false },
        { id: 'p4', name: 'Hall of Fame Entry', description: 'Permanent recognition', completed: false },
      ],
    },
  ];

  const tabs = [
    { id: 'community' as TabType, label: 'Community', icon: Users },
    { id: 'courses' as TabType, label: 'Courses', icon: BookOpen },
    { id: 'leaderboard' as TabType, label: 'Leaderboard', icon: Trophy },
    { id: 'about' as TabType, label: 'About', icon: Info },
    { id: 'reward' as TabType, label: 'Reward', icon: Gift },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-white to-indigo-50 -z-20" />
      <div className="fixed top-0 left-1/4 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-indigo-300/20 rounded-full blur-3xl -z-10 animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {/* Header Bar */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-1">
                {communityData.name}
              </h1>
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-1">
                  <Calendar className="w-4 h-4 text-purple-600" />
                  Last updated {communityData.lastUpdated}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Progress {communityData.progress}%
              </span>
            </div>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex items-center justify-center gap-2 p-2 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20 shadow-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'relative flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300',
                    isActive
                      ? 'text-purple-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  )}
                >
                  <Icon className={cn('w-5 h-5', isActive && 'text-purple-600')} />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-lg shadow-purple-500/50"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[320px,1fr] gap-6">
          {/* Left Sidebar */}
          <div className="space-y-6">
            {/* Community Creator Card */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-4">
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-500 p-1">
                        <Avatar className="w-full h-full rounded-xl">
                          <AvatarImage src={communityData.creator.avatar} />
                          <AvatarFallback className="rounded-xl bg-gradient-to-br from-purple-400 to-indigo-400 text-white text-xl font-bold">
                            {communityData.creator.name[0]}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full p-1.5 shadow-lg">
                        <Crown className="w-4 h-4 text-white" />
                      </div>
                    </div>
                    <Badge className="mb-2 bg-gradient-to-r from-purple-500/20 to-indigo-500/20 text-purple-700 border-purple-200">
                      Community Creator
                    </Badge>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">
                      {communityData.creator.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {communityData.creator.bio}
                    </p>
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-lg shadow-purple-500/30">
                      <Users className="w-4 h-4 mr-2" />
                      Invite People
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Member List */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-lg text-gray-900">Members</h3>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                      {members.length}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    {members.map((member) => (
                      <motion.div
                        key={member.id}
                        whileHover={{ scale: 1.02, x: 4 }}
                        className="group relative"
                      >
                        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/50 transition-all cursor-pointer">
                          <div className="relative">
                            <Avatar className="w-10 h-10 rounded-xl border-2 border-white">
                              <AvatarImage src={member.avatar} />
                              <AvatarFallback className="rounded-xl bg-gradient-to-br from-purple-400 to-indigo-400 text-white font-bold">
                                {member.name[0]}
                              </AvatarFallback>
                            </Avatar>
                            {member.isOnline && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white shadow-lg" />
                            )}
                            <svg className="absolute -inset-1 -z-10" width="48" height="48">
                              <circle
                                cx="24"
                                cy="24"
                                r="22"
                                fill="none"
                                stroke="url(#gradient)"
                                strokeWidth="2"
                                strokeDasharray={`${(member.level / 50) * 138.23} 138.23`}
                                transform="rotate(-90 24 24)"
                                className="opacity-70"
                              />
                              <defs>
                                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                  <stop offset="0%" stopColor="#a855f7" />
                                  <stop offset="100%" stopColor="#6366f1" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900 truncate">
                                {member.name}
                              </span>
                              {member.role === 'Creator' && (
                                <Crown className="w-3.5 h-3.5 text-amber-500" />
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs px-1.5 py-0 border-purple-200 text-purple-700">
                                {member.role}
                              </Badge>
                              <span className="text-xs text-gray-500">Lvl {member.level}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => setSelectedMember(member)}
                            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg transition-opacity"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Main Content Area */}
          <div>
            <AnimatePresence mode="wait">
              {activeTab === 'community' && (
                <CommunityTab key="community" posts={posts} />
              )}
              {activeTab === 'courses' && (
                <CoursesTab key="courses" courses={courses} />
              )}
              {activeTab === 'leaderboard' && (
                <LeaderboardTab key="leaderboard" leaderboard={leaderboard} />
              )}
              {activeTab === 'about' && (
                <AboutTab key="about" communityData={communityData} members={members} />
              )}
              {activeTab === 'reward' && (
                <RewardTab key="reward" zapTiers={zapTiers} />
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Message Pop-In Modal */}
      <AnimatePresence>
        {selectedMember && (
          <MessagePopInModal
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Community Tab Component
const CommunityTab: React.FC<{ posts: Post[] }> = ({ posts }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      {/* New Post Box */}
      <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <Avatar className="w-12 h-12 rounded-xl">
              <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=user" />
              <AvatarFallback className="rounded-xl bg-gradient-to-br from-purple-400 to-indigo-400 text-white font-bold">
                You
              </AvatarFallback>
            </Avatar>
            <Input
              placeholder="What's new, Wizard?"
              className="flex-1 bg-white/50 border-white/30 rounded-xl focus:ring-2 focus:ring-purple-500"
            />
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Posts Feed */}
      {posts.map((post, index) => (
        <motion.div
          key={post.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <Avatar className="w-12 h-12 rounded-xl">
                  <AvatarImage src={post.author.avatar} />
                  <AvatarFallback className="rounded-xl bg-gradient-to-br from-purple-400 to-indigo-400 text-white font-bold">
                    {post.author.name[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{post.author.name}</span>
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
                      Lvl {post.author.level}
                    </Badge>
                    <span className="text-sm text-gray-500">{post.timestamp}</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{post.content}</p>
                </div>
              </div>

              {post.image && (
                <div className="mb-4 rounded-xl overflow-hidden">
                  <img src={post.image} alt="Post content" className="w-full h-64 object-cover" />
                </div>
              )}

              <div className="flex items-center gap-6 pt-3 border-t border-gray-200">
                <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors group">
                  <Heart className="w-5 h-5 group-hover:fill-purple-600" />
                  <span className="text-sm font-medium">{post.likes}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.comments}</span>
                </button>
                <button className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-medium">{post.shares}</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Courses Tab Component
const CoursesTab: React.FC<{ courses: Course[] }> = ({ courses }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
    >
      {courses.map((course, index) => (
        <motion.div
          key={course.id}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl overflow-hidden hover:shadow-2xl hover:scale-105 transition-all cursor-pointer group">
            <div className="relative h-48 overflow-hidden">
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <h3 className="text-white font-bold text-lg mb-2">{course.title}</h3>
              </div>
            </div>
            <CardContent className="p-6">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-purple-600">{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2 bg-gray-200">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </Progress>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  <Zap className="w-4 h-4" />
                  <span className="text-sm font-bold">{course.xpEarned} XP</span>
                </div>
                <span className="text-xs text-gray-500">/ {course.totalXp} XP</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
};

// Leaderboard Tab Component
const LeaderboardTab: React.FC<{ leaderboard: LeaderboardEntry[] }> = ({ leaderboard }) => {
  const getRankBadge = (rank: number) => {
    if (rank === 1) return { color: 'from-amber-400 to-yellow-500', icon: '🥇' };
    if (rank === 2) return { color: 'from-gray-300 to-gray-400', icon: '🥈' };
    if (rank === 3) return { color: 'from-amber-600 to-amber-700', icon: '🥉' };
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-6">
          <div className="space-y-3">
            {leaderboard.map((entry, index) => {
              const rankBadge = getRankBadge(entry.rank);
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl transition-all hover:scale-102',
                    rankBadge
                      ? `bg-gradient-to-r ${rankBadge.color} bg-opacity-10 border-2 border-opacity-30`
                      : 'bg-white/50 hover:bg-white/70'
                  )}
                >
                  <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/80 font-bold text-gray-900">
                    {rankBadge ? rankBadge.icon : `#${entry.rank}`}
                  </div>
                  <Avatar className="w-12 h-12 rounded-xl border-2 border-white shadow-lg">
                    <AvatarImage src={entry.avatar} />
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-purple-400 to-indigo-400 text-white font-bold">
                      {entry.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">{entry.name}</div>
                    <div className="text-sm text-gray-600">Level {entry.level}</div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Zap className="w-5 h-5" />
                      <span>{entry.xp.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-500">XP</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// About Tab Component
const AboutTab: React.FC<{ communityData: any; members: Member[] }> = ({ communityData, members }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6"
    >
      <Card className="bg-white/60 backdrop-blur-xl border-white/20 shadow-xl rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Community Mission</h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            Welcome to {communityData.name} – a vibrant community of creators, learners, and innovators.
            We're building the future together through collaborative learning, knowledge sharing, and
            meaningful connections. Join us on this journey of growth and discovery.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-500 text-white">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-900">Founded</span>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Jan 2024
              </p>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-indigo-500 text-white">
                  <Users className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-900">Active Members</span>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {members.length}
              </p>
            </div>
            <div className="p-6 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-lg bg-purple-500 text-white">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <span className="font-bold text-gray-900">Growth</span>
              </div>
              <p className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                +24% ↑
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Reward Tab Component
const RewardTab: React.FC<{ zapTiers: ZAPTier[] }> = ({ zapTiers }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
    >
      <ZapRewardTiersDisplay tiers={zapTiers} showEmptyState={true} />
    </motion.div>
  );
};

// Message Pop-In Modal Component
const MessagePopInModal: React.FC<{ member: Member; onClose: () => void }> = ({ member, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10 rounded-xl border-2 border-white">
              <AvatarImage src={member.avatar} />
              <AvatarFallback className="rounded-xl bg-white text-purple-700 font-bold">
                {member.name[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-bold text-white">{member.name}</div>
              <div className="text-xs text-white/80">Level {member.level}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Messages Area */}
        <div className="p-4 h-64 overflow-y-auto bg-gradient-to-b from-gray-50 to-white">
          <div className="text-center text-sm text-gray-500 mb-4">
            Start a conversation with {member.name}
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type a message..."
              className="flex-1 rounded-xl border-gray-300 focus:ring-2 focus:ring-purple-500"
            />
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CommunityProfilePageV4;
