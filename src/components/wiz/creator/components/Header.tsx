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
import { 
  Edit3, 
  ExternalLink, 
  Crown,
  Flame,
  Calendar,
  Youtube
} from 'lucide-react';

interface User {
  uid: string;
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}

interface CreatorHeaderProps {
  user: User;
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

  return (
    <div className="relative">
      {/* YouTube Banner Background */}
      {creatorProfile?.youtubeData?.bannerUrl && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{ backgroundImage: `url(${creatorProfile.youtubeData.bannerUrl})` }}
        />
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-100/90 via-white/80 to-slate-100/90" />
      
      {/* Header Content */}
      <div className="relative container mx-auto px-4 py-6">
        <div className={`flex ${isMobile ? 'flex-col space-y-4' : 'items-center justify-between'}`}>
          {/* Left Side - Avatar + Info */}
          <div className={`flex ${isMobile ? 'flex-col items-center space-y-4' : 'items-center space-x-6'}`}>
            {/* Avatar with XP Ring */}
            <div className="relative">
              {/* XP Progress Ring */}
              <div className="relative">
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
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
                  <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold text-xl">
                    {user.displayName?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>

            {/* Creator Info */}
            <div className={`${isMobile ? 'text-center' : ''}`}>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">
                {creatorProfile?.wizName || user.displayName || 'Creator'}
              </h1>
              
              {creatorProfile?.youtubeData?.handle && (
                <p className="text-slate-600 mb-3 flex items-center justify-center space-x-1">
                  <Youtube className="w-4 h-4" />
                  <span>@{creatorProfile.youtubeData.handle}</span>
                </p>
              )}

              {/* Badges */}
              <div className={`flex ${isMobile ? 'justify-center' : ''} items-center gap-2 flex-wrap`}>
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Level {level}
                </Badge>
                
                {creatorProfile?.streakDays && (
                  <Badge variant="outline" className="border-orange-300 text-orange-700">
                    <Flame className="w-3 h-3 mr-1" />
                    {creatorProfile.streakDays} day streak
                  </Badge>
                )}
                
                {creatorProfile?.joinedAt && (
                  <Badge variant="outline" className="border-slate-300 text-slate-600">
                    <Calendar className="w-3 h-3 mr-1" />
                    Joined {new Date(creatorProfile.joinedAt).getFullYear()}
                  </Badge>
                )}
                
                {creatorProfile?.youtubeData?.lastSyncedAt && (
                  <Badge variant="outline" className="border-blue-300 text-blue-700 text-xs">
                    Last sync {new Date(creatorProfile.youtubeData.lastSyncedAt).toLocaleDateString()}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Actions */}
          <div className={`flex ${isMobile ? 'justify-center flex-wrap' : ''} items-center gap-3`}>
            <SyncButton userId={user.uid} />
            
            {/* Tip Button - Prominent placement next to XP ring */}
            <TipButton
              creatorId={user.uid}
              creatorName={user.displayName || 'Creator'}
              creatorAvatar={user.photoURL || undefined}
              size={isMobile ? 'md' : 'md'}
              variant="default"
            />
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEditDialog(true)}
              className="border-slate-300 hover:bg-slate-50"
            >
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>

            <Button
              variant="outline" 
              size="sm"
              onClick={handleViewPublicProfile}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View Public Profile
            </Button>
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