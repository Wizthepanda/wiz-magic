import { useState } from 'react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCreatorProfile } from '../hooks/useCreatorProfile';
import { SyncButton } from './SyncButton';
import { EditProfileDialog } from './EditProfileDialog';
import { TipButton } from './TipButton';
import { WizUser, getUserDisplayName, getUserAvatar } from '@/hooks/useAuth';
import { 
  Edit3, 
  ExternalLink, 
  Crown,
  Flame,
  Calendar,
  Youtube
} from 'lucide-react';

interface CreatorHeaderProps {
  user: WizUser;
  totalXP: number;
  level: number;
  progressPercent: number;
}

export const CreatorHeader: React.FC<CreatorHeaderProps> = ({
  user,
  totalXP,
  level,
  progressPercent
}) => {
  const isMobile = useIsMobile();
  const { data: creatorProfile, isLoading } = useCreatorProfile(user.uid);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const getXPAuraColor = (level: number): string => {
    if (level >= 20) return "from-purple-500 via-pink-500 to-purple-500";
    if (level >= 15) return "from-blue-500 via-purple-500 to-blue-500";
    if (level >= 10) return "from-green-500 via-blue-500 to-green-500";
    if (level >= 5) return "from-yellow-500 via-orange-500 to-yellow-500";
    return "from-gray-500 via-gray-400 to-gray-500";
  };

  const handleViewPublicProfile = () => {
    // Use YouTube channel ID if available, otherwise fallback to user ID
    const channelId = creatorProfile?.youtubeData?.channelId ||
                     creatorProfile?.youtubeData?.handle ||
                     user.uid;
    console.log('🔗 Opening public profile for:', { channelId, creatorProfile: creatorProfile?.youtubeData });
    window.open(`/c/${channelId}`, '_blank');
  };

  // Mock data for followers/following (replace with real data)
  const followers = creatorProfile?.followers || 0;
  const following = creatorProfile?.following || 0;
  const lastActive = "2h ago"; // Replace with real last active data

  return (
    <div className="relative overflow-hidden">
      {/* Animated Motion Gradient Background */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-purple-200/30 via-blue-200/20 to-purple-100/30"
        animate={{
          background: [
            'linear-gradient(to bottom right, rgba(216, 180, 254, 0.3), rgba(191, 219, 254, 0.2), rgba(216, 180, 254, 0.3))',
            'linear-gradient(to bottom right, rgba(191, 219, 254, 0.3), rgba(216, 180, 254, 0.2), rgba(191, 219, 254, 0.3))',
            'linear-gradient(to bottom right, rgba(216, 180, 254, 0.3), rgba(191, 219, 254, 0.2), rgba(216, 180, 254, 0.3))'
          ]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Subtle Sparkles */}
      <div className="absolute top-4 right-8 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full"
            style={{
              left: `${Math.random() * 100}px`,
              top: `${Math.random() * 60}px`,
            }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0, 1.5, 0],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* YouTube Banner Background */}
      {creatorProfile?.youtubeData?.bannerUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-5"
          style={{ backgroundImage: `url(${creatorProfile.youtubeData.bannerUrl})` }}
        />
      )}
      
      {/* Header Content */}
      <div className="relative container mx-auto px-4 py-6">
        <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
          {/* Left Side - Avatar + Info */}
          <div className={`flex ${isMobile ? 'flex-col items-center space-y-4' : 'items-center space-x-6'}`}>
            {/* Avatar with Enhanced XP Ring & Halo Glow */}
            <div className="relative group">
              {/* XP Progress Ring */}
              <div className="relative">
                {/* Halo Glow Effect on Hover */}
                <motion.div
                  className={`absolute -inset-6 rounded-full bg-gradient-to-r ${getXPAuraColor(level)} opacity-0 group-hover:opacity-40 blur-2xl transition-opacity duration-500`}
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />

                <motion.div
                  className={`absolute -inset-3 rounded-full bg-gradient-to-r opacity-75 ${getXPAuraColor(level)}`}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className={`absolute -inset-2 rounded-full bg-gradient-to-r opacity-50 ${getXPAuraColor(level)}`}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                />

                {/* Parallax Light Sheen on Hover */}
                <motion.div
                  className="absolute -inset-4 rounded-full bg-gradient-to-tr from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 pointer-events-none"
                  animate={{
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                />
                
                {/* Progress Ring */}
                <svg className="absolute -inset-4 w-24 h-24" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="2"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="url(#xpGradient)"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(progressPercent / 100) * 283} 283`}
                    transform="rotate(-90 50 50)"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="xpGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="50%" stopColor="#EC4899" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Avatar */}
                <Avatar className="relative w-16 h-16 border-4 border-white shadow-xl">
                  <AvatarImage src={getUserAvatar(user)} alt={getUserDisplayName(user)} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl">
                    {getUserDisplayName(user).charAt(0)}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Creator Info */}
            <div className={`${isMobile ? 'text-center' : ''}`}>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">
                  {getUserDisplayName(user)}
                </h1>
                {/* Creator Tier Badge */}
                <Badge className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white border-0 px-2 py-0.5">
                  Level {level} Creator ✦ Wizard Rank
                </Badge>
              </div>

              {creatorProfile?.youtubeData?.handle && (
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-slate-600 flex items-center space-x-1">
                    <Youtube className="w-4 h-4" />
                    <span>@{creatorProfile.youtubeData.handle}</span>
                  </p>
                  {/* Followers & Following */}
                  <div className="flex items-center gap-3 text-sm">
                    <span className="text-slate-700 font-semibold">
                      {followers.toLocaleString()} <span className="text-slate-500 font-normal">Followers</span>
                    </span>
                    <span className="text-slate-400">·</span>
                    <span className="text-slate-700 font-semibold">
                      {following.toLocaleString()} <span className="text-slate-500 font-normal">Following</span>
                    </span>
                  </div>
                </div>
              )}

              {/* Badges */}
              <div className={`flex ${isMobile ? 'justify-center' : ''} items-center gap-2 flex-wrap`}>
                {creatorProfile?.streakDays && (
                  <Badge variant="outline" className="border-orange-300 text-orange-700 bg-orange-50/50">
                    <Flame className="w-3 h-3 mr-1" />
                    {creatorProfile.streakDays} day streak
                  </Badge>
                )}

                {creatorProfile?.joinedAt && (
                  <Badge variant="outline" className="border-slate-300 text-slate-600 bg-slate-50/50">
                    <Calendar className="w-3 h-3 mr-1" />
                    Joined {new Date(creatorProfile.joinedAt).getFullYear()}
                  </Badge>
                )}

                {/* Last Active Status */}
                <Badge variant="outline" className="border-green-300 text-green-700 bg-green-50/50">
                  <motion.div
                    className="w-2 h-2 bg-green-500 rounded-full mr-1"
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  Active {lastActive}
                </Badge>

                {creatorProfile?.youtubeData?.lastSyncedAt && (
                  <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs bg-blue-50/50">
                    Last sync {new Date(creatorProfile.youtubeData.lastSyncedAt).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - VisionOS-Style Segmented Control */}
          <div className={`flex ${isMobile ? 'justify-center flex-wrap' : ''} items-center gap-3`}>
            {/* Tip Button - Prominent placement */}
            <TipButton
              creatorId={user.uid}
              creatorName={user.displayName || 'Creator'}
              creatorAvatar={user.photoURL || undefined}
              size={isMobile ? 'md' : 'md'}
              variant="default"
            />

            {/* Segmented Control Group */}
            <div className="flex items-center bg-white/80 backdrop-blur-md rounded-2xl p-1.5 shadow-lg border border-slate-200/50 gap-1">
              {/* Sync YouTube Button */}
              <SyncButton userId={user.uid} />

              {/* Edit Profile Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowEditDialog(true)}
                  className="hover:bg-slate-100/80 rounded-xl transition-all duration-200 px-4 py-2"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </motion.div>

              {/* View Public Profile Button */}
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleViewPublicProfile}
                  className="hover:bg-blue-50/80 text-blue-700 rounded-xl transition-all duration-200 px-4 py-2"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Public Profile
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Dialog */}
      <EditProfileDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        userId={user.uid}
        currentProfile={creatorProfile}
      />
    </div>
  );
};