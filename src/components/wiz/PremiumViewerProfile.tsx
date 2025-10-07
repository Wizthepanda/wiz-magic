import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Zap, 
  Flame, 
  Sparkles,
  Settings,
  LogOut,
  History,
  Youtube,
  User,
  Wallet as WalletIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/hooks/useAuth';
import { useZAPSystem } from '@/hooks/useZAPSystem';
import { useJoinedCommunities } from '@/hooks/useJoinedCommunities';
import { cn } from '@/lib/utils';
import { OverviewTab } from './profile/OverviewTab';
import { ViewHistoryTab } from './profile/ViewHistoryTab';
import { ManageYouTubeTab } from './profile/ManageYouTubeTab';
import { EditProfileTab } from './profile/EditProfileTab';
import { ManageWalletTab } from './profile/ManageWalletTab';

interface PremiumViewerProfileProps {
  className?: string;
}

export const PremiumViewerProfile: React.FC<PremiumViewerProfileProps> = ({ className }) => {
  const { user, signOut } = useAuth();
  const { zapData, zapProgress } = useZAPSystem();
  const { data: joinedCommunities = [] } = useJoinedCommunities();
  
  const [zapAnimation, setZapAnimation] = useState(false);
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Trigger ZAP animation on updates
  useEffect(() => {
    const handleZapUpdate = () => {
      setZapAnimation(true);
      setTimeout(() => setZapAnimation(false), 2000);
    };

    window.addEventListener('zapUpdated', handleZapUpdate);
    return () => window.removeEventListener('zapUpdated', handleZapUpdate);
  }, []);

  // Check YouTube connection
  useEffect(() => {
    const checkYouTubeAuth = () => {
      const ytToken = localStorage.getItem('youtube_access_token');
      setYoutubeConnected(!!ytToken);
    };
    checkYouTubeAuth();
  }, []);

  const totalZAPs = zapData?.totalZAPs || 0;
  const currentLevel = zapProgress?.level || 1;
  const progressPercent = zapProgress?.progressPercent || 0;
  const currentStreak = zapData?.currentStreak || 0;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Sparkles },
    { id: 'history', label: 'View History', icon: History },
    { id: 'youtube', label: 'Manage YouTube', icon: Youtube },
    { id: 'edit', label: 'Edit Profile', icon: User },
    { id: 'wallet', label: 'Manage Wallet', icon: WalletIcon },
  ];

  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-[#F9FAFB] via-white to-[#EEF2FF] relative overflow-hidden p-6", className)}>
      {/* Subtle background glow effects */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#6366F1]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8B5CF6]/5 rounded-full blur-3xl" />
      
      <div className="relative max-w-7xl mx-auto space-y-6">
        {/* Header - ZAP Balance Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl bg-gradient-to-br from-[#6366F1] via-[#8B5CF6] to-[#06B6D4] p-8 overflow-hidden"
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-20">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>

          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              {/* User Info */}
              <div className="flex items-center gap-4 mb-6">
                <Avatar className="w-20 h-20 border-4 border-white/30 shadow-2xl">
                  <AvatarImage src={user?.photoURL || undefined} />
                  <AvatarFallback className="bg-white/20 text-white text-2xl font-bold">
                    {user?.displayName?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {user?.displayName || 'User'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      Level {currentLevel}
                    </Badge>
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm flex items-center gap-1">
                      <Flame className="w-3 h-3" />
                      {currentStreak} Day Streak
                    </Badge>
                  </div>
                </div>
              </div>

              {/* ZAP Balance */}
              <div>
                <div className="text-white/80 text-sm mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Your ZAP Power
                </div>
                <motion.div 
                  className="flex items-baseline gap-3"
                  animate={zapAnimation ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 0.3 }}
                >
                  <span className="text-6xl font-bold text-white">
                    {totalZAPs.toLocaleString()}
                  </span>
                  <Zap className="w-10 h-10 text-yellow-300 fill-yellow-300" />
                </motion.div>
                <p className="text-white/70 text-sm mt-2">
                  Earn more ZAPs by watching, engaging, and completing courses.
                </p>
              </div>
            </div>

            {/* Top Up Button */}
            <Button
              variant="outline"
              className="bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm"
              onClick={() => setActiveTab('wallet')}
            >
              Top Up / Convert
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-white/80 text-sm mb-2">
              <span>Level {currentLevel} Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-300 to-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* Tab Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl rounded-2xl p-2 shadow-lg border border-white/40"
        >
          <div className="flex items-center gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "relative px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap flex items-center gap-2",
                    isActive
                      ? "text-white"
                      : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                  )}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabBg"
                      className="absolute inset-0 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon className="w-4 h-4 relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                  {isActive && (
                    <motion.div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-full"
                      layoutId="activeTabIndicator"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <OverviewTab
              key="overview"
              totalZAPs={totalZAPs}
              videosWatched={zapData?.videosCompleted || 0}
              watchTime={zapData?.totalWatchTime || '0h'}
              streak={currentStreak}
              joinedCommunities={joinedCommunities}
            />
          )}

          {activeTab === 'history' && (
            <ViewHistoryTab key="history" />
          )}

          {activeTab === 'youtube' && (
            <ManageYouTubeTab key="youtube" isConnected={youtubeConnected} />
          )}

          {activeTab === 'edit' && (
            <EditProfileTab key="edit" />
          )}

          {activeTab === 'wallet' && (
            <ManageWalletTab key="wallet" />
          )}
        </AnimatePresence>

        {/* Quick Actions Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex items-center justify-between pt-6 border-t border-slate-200"
        >
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-300 hover:bg-slate-50"
              onClick={() => setActiveTab('edit')}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="border-red-300 text-red-600 hover:bg-red-50"
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

