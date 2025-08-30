import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { LogOut, Settings, User, Youtube, Crown, Zap, Flame, Link2, Copy } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export const WizUserProfile = () => {
  const { user, signOut, signInWithGoogle, loading } = useAuth();
  const isMobile = useIsMobile();
  const { 
    xp, 
    totalXp, 
    level, 
    progressPercent, 
    xpToNextLevel,
    dailyXp,
    dailyXpCap,
    currentStreak,
    canEarnMoreXP
  } = useXp();
  
  const [copiedReferral, setCopiedReferral] = useState(false);
  const [animateXP, setAnimateXP] = useState(false);

  // Listen for XP updates to trigger animations
  useEffect(() => {
    const handleXpUpdated = (event: CustomEvent) => {
      console.log('🎯 UserProfile received XP update:', event.detail);
      setAnimateXP(true);
      setTimeout(() => setAnimateXP(false), 2000);
    };

    const handleLevelUp = (event: CustomEvent) => {
      console.log('🆙 UserProfile received level up:', event.detail);
      // Could add level up animation here
    };

    const handleForceRefresh = (event: CustomEvent) => {
      console.log('🔄 UserProfile received forceXPRefresh:', event.detail);
      setAnimateXP(true);
      setTimeout(() => setAnimateXP(false), 2000);
      // Force a re-render by triggering animation
    };

    window.addEventListener('xpUpdated', handleXpUpdated as EventListener);
    window.addEventListener('levelUp', handleLevelUp as EventListener);
    window.addEventListener('forceXPRefresh', handleForceRefresh as EventListener);
    
    return () => {
      window.removeEventListener('xpUpdated', handleXpUpdated as EventListener);
      window.removeEventListener('levelUp', handleLevelUp as EventListener);
      window.removeEventListener('forceXPRefresh', handleForceRefresh as EventListener);
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCopyReferral = async () => {
    const referralLink = `${window.location.origin}?ref=${user?.uid || 'demo'}`;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedReferral(true);
      setTimeout(() => setCopiedReferral(false), 2000);
    } catch (error) {
      console.error('Failed to copy referral link:', error);
    }
  };

  // Get level badge color based on level
  const getLevelBadgeStyle = (level: number) => {
    if (level < 5) {
      // Purple tier (Levels 1-4)
      return {
        background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(168, 85, 247, 0.8) 100%)',
        border: '1px solid rgba(147, 51, 234, 0.6)',
        boxShadow: '0 0 15px rgba(147, 51, 234, 0.3)'
      };
    } else if (level < 10) {
      // Blue tier (Levels 5-9)
      return {
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.9) 0%, rgba(99, 102, 241, 0.8) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.6)',
        boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)'
      };
    } else {
      // Gold tier (Level 10+)
      return {
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.9) 0%, rgba(251, 191, 36, 0.8) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.6)',
        boxShadow: '0 0 15px rgba(245, 158, 11, 0.3)'
      };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center space-x-3">
        <div className="h-8 w-32 bg-muted/20 animate-pulse rounded-lg backdrop-blur-sm" />
        <div className="h-10 w-10 bg-muted/20 animate-pulse rounded-full backdrop-blur-sm" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-3">
        <Badge 
          variant="outline" 
          className="text-wiz-primary border-wiz-primary/30 bg-wiz-primary/10 backdrop-blur-sm"
        >
          Demo Mode
        </Badge>
        <Button 
          onClick={() => signInWithGoogle().catch(() => console.log('Auth not configured'))} 
          className="bg-gradient-to-r from-wiz-primary to-wiz-secondary hover:from-wiz-primary/90 hover:to-wiz-secondary/90 backdrop-blur-sm"
        >
          <Youtube className="w-4 h-4 mr-2" />
          Sign in with Google
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="h-auto p-2 hover:bg-white/5 transition-all duration-200 backdrop-blur-sm"
          style={{
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px'
          }}
        >
          <div className="flex items-center space-x-3">
            {/* User Info + Level Badge */}
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-sm font-medium text-gray-400">
                  {user.displayName}
                </span>
                <Badge 
                  className="text-xs font-bold text-white border-0 px-2 py-0.5"
                  style={getLevelBadgeStyle(level)}
                >
                  Lv. {level}
                </Badge>
              </div>
              
              {/* Minimal XP Progress Bar */}
              <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #8B5CF6 0%, #A855F7 50%, #6366F1 100%)',
                    boxShadow: animateXP ? '0 0 15px rgba(139, 92, 246, 0.8)' : '0 0 10px rgba(139, 92, 246, 0.5)'
                  }}
                  initial={{ width: 0 }}
                  animate={{ 
                    width: `${progressPercent}%`,
                    scale: animateXP ? [1, 1.05, 1] : 1
                  }}
                  transition={{ duration: animateXP ? 0.5 : 1, ease: "easeOut" }}
                />
              </div>
              
              <div 
                className="text-xs font-semibold"
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #6366F1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  filter: 'drop-shadow(0 1px 2px rgba(139, 92, 246, 0.3))'
                }}
              >
                {xp} / {xpToNextLevel} XP
              </div>
            </div>
            
            {/* Avatar */}
            <Avatar className="h-10 w-10 border-2 border-white/20">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
              <AvatarFallback className="bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white font-bold">
                {user.displayName?.charAt(0) || 'W'}
              </AvatarFallback>
            </Avatar>
          </div>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className={cn(
          "p-0 border-0 shadow-2xl",
          isMobile ? "w-80 max-h-[80vh] overflow-y-auto" : "w-96"
        )}
        align="end"
        style={{
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.9) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          ...(isMobile && {
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(139, 92, 246, 0.5) transparent'
          })
        }}
      >
        <div className="p-6 space-y-6">
          {/* Profile Header */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 border-2 border-white/20">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
              <AvatarFallback className="bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white font-bold text-lg">
                {user.displayName?.charAt(0) || 'W'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold text-lg text-gray-400">
                {user.displayName}
              </div>
              <div className="text-gray-400 text-sm">{user.email}</div>
              <Badge 
                className="mt-1 text-xs font-bold text-white border-0"
                style={getLevelBadgeStyle(level)}
              >
                Level {level}
              </Badge>
            </div>
          </div>
          
          {/* XP Progress Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Progress to Level {level + 1}</span>
              <span className="text-gray-300 text-sm">{Math.round(progressPercent)}%</span>
            </div>
            
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full relative"
                style={{
                  background: `linear-gradient(90deg, 
                    rgba(147, 51, 234, 0.9) 0%, 
                    rgba(168, 85, 247, 0.9) 25%,
                    rgba(219, 39, 119, 0.9) 50%,
                    rgba(59, 130, 246, 0.9) 100%
                  )`,
                  boxShadow: animateXP ? '0 0 20px rgba(147, 51, 234, 0.8)' : '0 0 15px rgba(147, 51, 234, 0.5)'
                }}
                initial={{ width: 0 }}
                animate={{ 
                  width: `${progressPercent}%`,
                  scale: animateXP ? [1, 1.02, 1] : 1
                }}
                transition={{ duration: animateXP ? 0.5 : 1.5, ease: "easeOut" }}
              >
                <div 
                  className="absolute inset-0 opacity-50"
                  style={{
                    background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.3) 50%, transparent 100%)'
                  }}
                />
              </motion.div>
            </div>
            
            <div className="flex justify-between text-xs font-semibold">
              <span 
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #6366F1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {xp} XP
              </span>
              <span 
                style={{
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #A855F7 50%, #6366F1 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                {xpToNextLevel} XP
              </span>
            </div>
          </div>
          
          {/* Daily Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="text-white font-semibold">{dailyXp}</div>
              <div className="text-xs text-gray-400">Daily XP</div>
              <div className="text-xs text-gray-500">/ {dailyXpCap}</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/5 border border-white/10">
              <div className="flex items-center justify-center space-x-1">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-white font-semibold">{currentStreak}</span>
              </div>
              <div className="text-xs text-gray-400">Day Streak</div>
            </div>
          </div>
          
          {/* Status Message */}
          <div className="text-center">
            {canEarnMoreXP ? (
              <div className="text-sm text-green-400">
                🎬 Watch 3 more videos today to max your XP!
              </div>
            ) : (
              <div className="text-sm text-orange-400">
                🚀 Daily XP cap reached! Come back tomorrow.
              </div>
            )}
          </div>
          
          {/* Invite Friends */}
          <div className="space-y-2">
            <div className="text-white font-medium text-sm">Invite Friends</div>
            <Button
              variant="outline"
              className="w-full justify-between text-sm bg-white/5 border-white/20 hover:bg-white/10"
              onClick={handleCopyReferral}
            >
              <span className="text-gray-300">Share your referral link</span>
              {copiedReferral ? (
                <span className="text-green-400 text-xs">Copied!</span>
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </Button>
          </div>
          
          {/* YouTube Status */}
          <div className="flex items-center justify-between">
            <span className="text-white text-sm">YouTube Connected</span>
            <Badge variant={user.youtubeConnected ? "default" : "destructive"}>
              <Youtube className="w-3 h-3 mr-1" />
              {user.youtubeConnected ? "Connected" : "Not Connected"}
            </Badge>
          </div>
          
          <DropdownMenuSeparator className="bg-white/10" />
          
          {/* Menu Items */}
          <div className="space-y-1">
            <DropdownMenuItem className="cursor-pointer text-gray-300 hover:text-white hover:bg-white/5 rounded-lg">
              <User className="w-4 h-4 mr-3" />
              Profile Settings
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer text-gray-300 hover:text-white hover:bg-white/5 rounded-lg">
              <Settings className="w-4 h-4 mr-3" />
              Preferences
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Sign Out
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};