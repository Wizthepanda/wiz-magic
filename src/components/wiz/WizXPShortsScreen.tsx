import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Share2, Star, Coins, X, ArrowUp, ArrowDown, Play, Pause, Volume2, VolumeX, Sparkles } from "lucide-react";
import { useXp } from "@/context/XpContext";
import { useAuth } from "@/hooks/useAuth";
import { LocalVideoPlayer } from "@/components/ui/local-video-player";
import { VideoCompletionService } from "@/lib/video-completion-service";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TipModal } from "./creator/components/TipModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";

// Types
interface WizXPShort {
  id: string;
  videoId: string;
  title: string;
  subtitle?: string;
  hashtags: string[];
  creator: {
    name: string;
    avatar?: string;
    level: number;
    id: string;
    isFollowed: boolean;
  };
  xpReward: number;
  thumbnail: string;
  duration: number; // in seconds
  isWatched: boolean;
}

interface WizXPShortsScreenProps {
  initialShortId?: string;
  onClose?: () => void;
}

// Helper function to detect short duration
const isShortDuration = (duration: string | number): boolean => {
  if (typeof duration === 'number') {
    return duration < 60;
  }
  
  if (duration.startsWith('PT')) {
    const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return false;
    
    const minutes = parseInt(match[1] || '0', 10);
    const seconds = parseInt(match[2] || '0', 10);
    const totalSeconds = minutes * 60 + seconds;
    
    return totalSeconds < 60;
  } else {
    const parts = duration.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      const totalSeconds = minutes * 60 + seconds;
      
      return totalSeconds < 60;
    }
    return false;
  }
};

export const WizXPShortsScreen: React.FC<WizXPShortsScreenProps> = ({
  initialShortId,
  onClose
}) => {
  const { addXp } = useXp();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // State
  const [shorts, setShorts] = useState<WizXPShort[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [xpProgress, setXpProgress] = useState(0);
  const [showXpEarned, setShowXpEarned] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [watchedShorts, setWatchedShorts] = useState<Set<string>>(new Set());
  const [showWatchedTag, setShowWatchedTag] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);

  const currentShort = shorts[currentIndex];

  // Load shorts from Firestore
  useEffect(() => {
    console.log('🎬 WizXPShortsScreen: Loading shorts from Firestore');
    setLoading(true);
    
    const shortsQuery = query(
      collection(db, 'creatorVideos'),
      orderBy('addedToWiz', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(shortsQuery, (snapshot) => {
      console.log('🎬 WizXPShortsScreen: Firestore listener triggered, docs:', snapshot.docs.length);
      
      const shortsFromFirebase: WizXPShort[] = snapshot.docs
        .map(doc => {
          const data = doc.data();
          return { doc, data };
        })
        .filter(({ data }) => {
          const isExplicitShort = data.contentType === 'short';
          const isDurationBasedShort = data.duration && isShortDuration(data.duration);
          const isActive = data.status === 'active' || !data.status;
          
          return (isExplicitShort || isDurationBasedShort) && isActive;
        })
        .map(({ doc, data }) => ({
          id: doc.id,
          videoId: data.videoId || data.youtubeId || '',
          title: data.title || 'Untitled Short',
          subtitle: data.description?.substring(0, 100) || '',
          hashtags: data.hashtags || data.tags || [],
          creator: {
            name: data.creatorName || data.creator || 'Unknown Creator',
            avatar: data.creatorAvatar || `/Profile Pics/${data.creatorName || 'default'}.jpg`,
            level: data.creatorLevel || 1,
            id: data.creatorId || data.channelId || 'unknown',
            isFollowed: false
          },
          xpReward: Math.min(50, Math.max(15, Math.floor((data.duration || 60) / 4))),
          thumbnail: data.thumbnail || `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`,
          duration: typeof data.duration === 'number' ? data.duration : 45,
          isWatched: false
        }))
        .slice(0, 20);

      console.log('🎬 WizXPShortsScreen: Processed shorts data:', shortsFromFirebase);
      setShorts(shortsFromFirebase);
      setLoading(false);

      // Find initial index if shortId provided
      if (initialShortId) {
        const foundIndex = shortsFromFirebase.findIndex(short => short.id === initialShortId);
        if (foundIndex !== -1) {
          setCurrentIndex(foundIndex);
        }
      }
    }, (error) => {
      console.error('🎬 WizXPShortsScreen: Error loading shorts:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [initialShortId]);

  // XP Progress tracking
  useEffect(() => {
    if (!currentShort || watchedShorts.has(currentShort.id)) return;

    const interval = setInterval(() => {
      setXpProgress(prev => {
        const newProgress = prev + (100 / (currentShort.duration || 15));
        
        // Award XP at 95% completion
        if (newProgress >= 95 && prev < 95) {
          handleXpEarned(currentShort.xpReward);
          setWatchedShorts(prev => new Set([...prev, currentShort.id]));
          // Trigger sparkle animation and watched tag
          setShowSparkle(true);
          setTimeout(() => setShowSparkle(false), 800);
          setTimeout(() => {
            setShowWatchedTag(true);
            setTimeout(() => setShowWatchedTag(false), 2000);
          }, 500);
        }
        
        return Math.min(100, newProgress);
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, currentShort]);

  // Handle XP reward
  const handleXpEarned = (xp: number) => {
    setEarnedXp(xp);
    setShowXpEarned(true);
    addXp(xp);
    
    setTimeout(() => setShowXpEarned(false), 3000);
  };

  // Navigation
  const goToNext = useCallback(() => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setXpProgress(0);
    }
  }, [currentIndex, shorts.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setXpProgress(0);
    }
  }, [currentIndex]);

  // Swipe handling
  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 100;
    
    if (info.offset.y > threshold) {
      goToPrev();
    } else if (info.offset.y < -threshold) {
      goToNext();
    }
  };

  // Share functionality
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/shorts/${currentShort.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: currentShort.title,
          text: `Check out this short by ${currentShort.creator.name} on WizXP!`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      // Could add toast notification here
    }
  };

  // Loading state
  if (loading) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, #0A0F1C 0%, #141A2E 100%)'
        }}
      >
        <motion.div
          className="text-center text-white"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium mb-2">Loading WizXP Shorts...</p>
          <p className="text-sm text-gray-400">Preparing your vertical experience</p>
        </motion.div>
      </div>
    );
  }

  if (!currentShort) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, #0A0F1C 0%, #141A2E 100%)'
        }}
      >
        <div className="text-center text-white">
          <p className="text-lg font-medium">No shorts available</p>
          <Button onClick={() => onClose?.()} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0A0F1C 0%, #141A2E 100%)'
      }}
    >
      {/* Close Button */}
      <motion.button
        onClick={() => onClose?.() || navigate('/')}
        className="fixed top-6 left-6 z-60 p-3 rounded-full"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <X className="w-5 h-5 text-white" />
      </motion.button>

      {/* Navigation Hints (Desktop) */}
      {!isMobile && (
        <>
          <motion.button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="fixed top-1/2 left-8 -translate-y-1/2 z-50 p-2 rounded-full disabled:opacity-30"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp className="w-5 h-5 text-white" />
          </motion.button>
          
          <motion.button
            onClick={goToNext}
            disabled={currentIndex === shorts.length - 1}
            className="fixed bottom-32 left-8 z-50 p-2 rounded-full disabled:opacity-30"
            style={{
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowDown className="w-5 h-5 text-white" />
          </motion.button>
        </>
      )}

      {/* Main Content */}
      <div className="h-full flex items-center justify-center">
        
        {/* Video Container */}
        <motion.div
          className={cn(
            "relative overflow-hidden rounded-xl",
            isMobile ? "w-full h-full" : "w-96 h-[85vh] shadow-2xl"
          )}
          drag={isMobile ? "y" : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragEnd={handleDragEnd}
          dragElastic={0.1}
          style={{
            boxShadow: isMobile ? 'none' : '0 25px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(147, 51, 234, 0.3)'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentShort.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3 }}
              className="relative w-full h-full bg-black"
            >
              {/* Video Player */}
              <div className="absolute inset-0">
                <LocalVideoPlayer
                  videoId={currentShort.videoId}
                  isYouTube={true}
                  autoPlay={true}
                  muted={isMuted}
                  onProgress={() => {}}
                  onVideoEnd={goToNext}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating Action Buttons - Premium Glassmorphic Design */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col space-y-3 z-40">
                
                {/* Share Button - Clean Diagonal Arrow */}
                <motion.button
                  onClick={handleShare}
                  className="relative p-2.5 rounded-full backdrop-blur-xl border-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)',
                    borderImage: 'linear-gradient(135deg, rgba(255,255,255,0.2), rgba(255,255,255,0.05)) 1'
                  }}
                  whileHover={{ 
                    scale: 1.08,
                    y: -2,
                    boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <motion.div
                    whileHover={{ y: -1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <Share2 className="w-3.5 h-3.5 text-white/90 stroke-2" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.3))' }} />
                  </motion.div>
                </motion.button>

                {/* Star/XP Button - Redesigned with Sparkle */}
                <motion.div className="relative">
                  {/* Sparkle Effect */}
                  {showSparkle && (
                    <motion.div
                      className="absolute -inset-2 z-10"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 180, 360] }}
                      transition={{ duration: 0.8 }}
                    >
                      <Sparkles className="w-8 h-8 text-purple-300" style={{ filter: 'drop-shadow(0 0 8px rgba(147,51,234,0.6))' }} />
                    </motion.div>
                  )}

                  {/* Watched Tag Float */}
                  {showWatchedTag && (
                    <motion.div
                      className="absolute -top-8 -left-2 z-20 px-2 py-1 rounded-full text-xs font-medium text-white"
                      style={{
                        background: 'linear-gradient(135deg, rgba(147,51,234,0.9) 0%, rgba(59,130,246,0.9) 100%)',
                        backdropFilter: 'blur(10px)'
                      }}
                      initial={{ opacity: 0, y: 10, scale: 0.8 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.8 }}
                    >
                      Watched
                    </motion.div>
                  )}

                  <motion.button
                    className="relative p-2.5 rounded-full backdrop-blur-xl border-2"
                    style={{
                      background: watchedShorts.has(currentShort.id) 
                        ? 'linear-gradient(135deg, rgba(147,51,234,0.15) 0%, rgba(59,130,246,0.15) 100%)'
                        : 'linear-gradient(135deg, rgba(147,51,234,0.05) 0%, rgba(147,51,234,0.02) 100%)',
                      borderImage: watchedShorts.has(currentShort.id)
                        ? 'linear-gradient(135deg, rgba(147,51,234,0.4), rgba(59,130,246,0.4)) 1'
                        : 'linear-gradient(135deg, rgba(147,51,234,0.2), rgba(147,51,234,0.05)) 1'
                    }}
                    whileHover={{ 
                      scale: 1.08,
                      boxShadow: watchedShorts.has(currentShort.id) 
                        ? '0 0 20px rgba(147,51,234,0.4)'
                        : '0 0 20px rgba(147,51,234,0.2)'
                    }}
                    whileTap={{ scale: 0.95 }}
                    animate={{
                      boxShadow: watchedShorts.has(currentShort.id)
                        ? ['0 0 8px rgba(147,51,234,0.3)', '0 0 15px rgba(147,51,234,0.5)', '0 0 8px rgba(147,51,234,0.3)']
                        : undefined
                    }}
                    transition={{
                      boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                  >
                    {showXpEarned ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center"
                      >
                        <Star className="w-4 h-4 text-white mx-auto mb-0.5" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.5))' }} />
                        <div className="text-xs text-white font-bold">+{earnedXp}</div>
                      </motion.div>
                    ) : watchedShorts.has(currentShort.id) ? (
                      <Star 
                        className="w-4 h-4 text-purple-300 fill-current" 
                        style={{ 
                          filter: 'drop-shadow(0 0 6px rgba(147,51,234,0.6))',
                          background: 'linear-gradient(135deg, #9333ea, #3b82f6)',
                          WebkitBackgroundClip: 'text'
                        }} 
                      />
                    ) : (
                      <div className="text-center">
                        <Star 
                          className="w-4 h-4 text-purple-300 mx-auto mb-0.5 stroke-2" 
                          style={{ filter: 'drop-shadow(0 0 4px rgba(147,51,234,0.4))' }} 
                        />
                        <div className="text-xs text-purple-300 font-medium">{currentShort.xpReward}</div>
                      </div>
                    )}
                  </motion.button>
                </motion.div>

                {/* Tip Button - Orange/Pink Gradient with Soft Pulse */}
                <motion.button
                  onClick={() => setShowTipModal(true)}
                  className="relative p-2.5 rounded-full backdrop-blur-xl border-2"
                  style={{
                    background: 'linear-gradient(135deg, rgba(251,146,60,0.9) 0%, rgba(236,72,153,0.9) 100%)',
                    borderImage: 'linear-gradient(135deg, rgba(251,146,60,0.6), rgba(236,72,153,0.6)) 1'
                  }}
                  whileHover={{ 
                    scale: 1.08,
                    boxShadow: ['0 0 15px rgba(251,146,60,0.4)', '0 0 25px rgba(236,72,153,0.4)']
                  }}
                  whileTap={{ scale: 0.95 }}
                  animate={{
                    boxShadow: ['0 0 10px rgba(251,146,60,0.3)', '0 0 20px rgba(236,72,153,0.4)', '0 0 10px rgba(251,146,60,0.3)']
                  }}
                  transition={{
                    boxShadow: { duration: 8, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  <Coins className="w-4 h-4 text-white" style={{ filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.3))' }} />
                </motion.button>

                {/* Play/Pause Control - Minimal Wave Design */}
                <motion.button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="relative p-2 rounded-full backdrop-blur-xl border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)',
                    borderColor: 'rgba(255,255,255,0.1)'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isPlaying ? (
                    <Pause className="w-3 h-3 text-white/80 stroke-2" />
                  ) : (
                    <Play className="w-3 h-3 text-white/80 stroke-2" />
                  )}
                </motion.button>

                {/* Mute/Unmute - Wave Ripple Effect */}
                <motion.button
                  onClick={() => setIsMuted(!isMuted)}
                  className="relative p-2 rounded-full backdrop-blur-xl border"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 100%)',
                    borderColor: 'rgba(255,255,255,0.1)'
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={isMuted ? {} : {
                    boxShadow: ['0 0 0 0 rgba(255,255,255,0.1)', '0 0 0 8px rgba(255,255,255,0)', '0 0 0 0 rgba(255,255,255,0)']
                  }}
                  transition={{
                    boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                  }}
                >
                  {isMuted ? (
                    <VolumeX className="w-3 h-3 text-white/80 stroke-2" />
                  ) : (
                    <Volume2 className="w-3 h-3 text-white/80 stroke-2" />
                  )}
                </motion.button>
              </div>

              {/* Bottom Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 z-30">
                {/* XP Progress Bar - Thinner & Sharper */}
                <div className="px-4 pb-2 relative">
                  <div className="w-full h-0.5 bg-white/15 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      style={{ 
                        width: `${xpProgress}%`,
                        background: 'linear-gradient(90deg, #9333ea 0%, #3b82f6 50%, #06b6d4 100%)',
                        boxShadow: '0 0 8px rgba(147,51,234,0.4)'
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  
                  {/* Tiny star for watched shorts - More Minimalist */}
                  {watchedShorts.has(currentShort.id) && (
                    <motion.div
                      className="absolute -top-1.5 right-1"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        boxShadow: ['0 0 4px rgba(147,51,234,0.4)', '0 0 8px rgba(147,51,234,0.6)', '0 0 4px rgba(147,51,234,0.4)']
                      }}
                      transition={{ 
                        delay: 0.5, 
                        duration: 0.3,
                        boxShadow: { duration: 1.5, repeat: 2, ease: "easeInOut" }
                      }}
                    >
                      <Star className="w-2 h-2 text-purple-300 fill-purple-300" style={{ filter: 'drop-shadow(0 0 3px rgba(147,51,234,0.6))' }} />
                    </motion.div>
                  )}
                </div>

                {/* Content Info - Slimmer & Tighter */}
                <div 
                  className="px-4 pb-3 pt-4"
                  style={{
                    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.3) 70%, transparent 100%)'
                  }}
                >
                  {/* Creator Row - More Compact */}
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center space-x-2.5">
                      <Avatar className="w-8 h-8 ring-1 ring-white/20">
                        <AvatarImage src={currentShort.creator.avatar} />
                        <AvatarFallback>{currentShort.creator.name[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex items-center space-x-1.5">
                        <span className="text-white font-semibold text-sm">
                          {currentShort.creator.name}
                        </span>
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-purple-500/10 text-purple-300 border-purple-500/15 px-1.5 py-0.5"
                        >
                          Lv{currentShort.creator.level}
                        </Badge>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 px-2.5 py-1 text-xs font-medium rounded-full"
                    >
                      {currentShort.creator.isFollowed ? 'Following' : 'Follow'}
                    </Button>
                  </div>

                  {/* Video Info - Minimal Typography */}
                  <div className="space-y-1.5">
                    <h3 className="text-white font-bold text-sm leading-tight line-clamp-1">
                      {currentShort.title}
                    </h3>
                    {currentShort.subtitle && (
                      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
                        {currentShort.subtitle}
                      </p>
                    )}
                    {currentShort.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {currentShort.hashtags.slice(0, 3).map((tag, index) => (
                          <span key={index} className="text-blue-400 text-xs font-medium">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Next Up Strip - With Watched Indicators */}
        {!isMobile && shorts.length > 1 && (
          <div className="absolute right-6 top-1/2 -translate-y-1/2 w-14">
            <div className="space-y-2">
              {shorts.slice(currentIndex + 1, currentIndex + 4).map((short, index) => (
                <motion.div
                  key={short.id}
                  className="relative cursor-pointer group aspect-[9/16] w-12 rounded-lg overflow-hidden"
                  onClick={() => setCurrentIndex(currentIndex + 1 + index)}
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: watchedShorts.has(short.id) 
                      ? '0 4px 15px rgba(147, 51, 234, 0.3)'
                      : '0 4px 15px rgba(255, 255, 255, 0.1)'
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  <img
                    src={short.thumbnail}
                    alt={short.title}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Watched Overlay */}
                  {watchedShorts.has(short.id) && (
                    <div className="absolute inset-0 bg-purple-500/20 backdrop-blur-[1px]" />
                  )}
                  
                  <div className={`absolute inset-0 transition-colors ${
                    watchedShorts.has(short.id) 
                      ? 'bg-purple-900/10 group-hover:bg-purple-900/5' 
                      : 'bg-black/10 group-hover:bg-black/5'
                  }`} />

                  {/* Watched Star Badge - Top Right Corner */}
                  {watchedShorts.has(short.id) && (
                    <motion.div
                      className="absolute top-0.5 right-0.5 p-0.5 rounded-full"
                      style={{
                        background: 'linear-gradient(135deg, rgba(147,51,234,0.9) 0%, rgba(59,130,246,0.9) 100%)',
                        backdropFilter: 'blur(4px)'
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1,
                        boxShadow: ['0 0 3px rgba(147,51,234,0.4)', '0 0 6px rgba(147,51,234,0.6)', '0 0 3px rgba(147,51,234,0.4)']
                      }}
                      transition={{
                        boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                      }}
                    >
                      <Star className="w-2.5 h-2.5 text-white fill-current" />
                    </motion.div>
                  )}
                  
                  {/* Hover overlay - "Next" or "Watched" */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="bg-white/15 backdrop-blur-sm rounded-full px-1.5 py-0.5">
                      <span className="text-white text-xs font-medium">
                        {watchedShorts.has(short.id) ? 'Watched' : 'Next'}
                      </span>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tip Modal */}
      {showTipModal && currentShort && (
        <TipModal
          isOpen={showTipModal}
          onClose={() => setShowTipModal(false)}
          creatorName={currentShort.creator.name}
          creatorId={currentShort.creator.id}
          videoTitle={currentShort.title}
        />
      )}
    </div>
  );
};