import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Share2, Star, Coins, X, Play, Pause, Volume2, VolumeX, ChevronUp, ChevronDown } from "lucide-react";
import { LocalVideoPlayer } from "@/components/ui/local-video-player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useXp } from "@/context/XpContext";
import { useIsMobile } from "@/hooks/use-mobile";

interface WizXPShort {
  id: string;
  videoId: string;
  title: string;
  creator: {
    name: string;
    avatar?: string;
    level: number;
    id: string;
  };
  xpReward: number;
  hashtags: string[];
}

interface WizXPShortsDesktopProps {
  onClose?: () => void;
}

// Video Controls Component
function VideoControls({ 
  isPlaying, 
  onPlayPause, 
  isMuted, 
  onMuteToggle 
}: {
  isPlaying: boolean;
  onPlayPause: () => void;
  isMuted: boolean;
  onMuteToggle: () => void;
}) {
  return (
    <div className="absolute bottom-4 right-4 flex flex-col space-y-2 z-20">
      {/* Volume/Mute Button */}
      <motion.button
        onClick={onMuteToggle}
        className="w-11 h-11 rounded-full bg-black bg-opacity-50 border border-white/20 flex items-center justify-center text-white hover:bg-opacity-70 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </motion.button>

      {/* Play/Pause Button */}
      <motion.button
        onClick={onPlayPause}
        className="w-11 h-11 rounded-full bg-black bg-opacity-50 border border-white/20 flex items-center justify-center text-white hover:bg-opacity-70 transition-all"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
      </motion.button>
    </div>
  );
}

// Floating Action Button
function FloatingActionButton({ 
  icon, 
  onClick, 
  tooltip, 
  glowColor = "white",
  badge,
  isWatched = false 
}: {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip?: string;
  glowColor?: string;
  badge?: string;
  isWatched?: boolean;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getGlowStyle = (isHovered = false) => {
    const intensity = isHovered ? 0.5 : 0.3;
    const shadowIntensity = isHovered ? 24 : 16;
    
    switch (glowColor) {
      case "purple":
        return {
          boxShadow: `0 4px ${shadowIntensity}px rgba(147, 51, 234, ${intensity})`,
          background: `linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%), rgba(26, 31, 46, 0.9)`
        };
      case "orange":
        return {
          boxShadow: `0 4px ${shadowIntensity}px rgba(251, 146, 60, ${intensity})`,
          background: `linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(252, 211, 77, 0.2) 100%), rgba(26, 31, 46, 0.9)`
        };
      default:
        return {
          boxShadow: `0 4px ${shadowIntensity}px rgba(59, 130, 246, ${intensity})`,
          background: 'rgba(26, 31, 46, 0.9)'
        };
    }
  };

  return (
    <div className="relative">
      {/* Desktop Tooltip */}
      {tooltip && showTooltip && (
        <motion.div
          className="absolute right-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-medium text-white z-50 whitespace-nowrap hidden lg:block"
          style={{
            background: 'linear-gradient(135deg, rgba(26,31,46,0.95) 0%, rgba(36,42,62,0.95) 100%)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          initial={{ opacity: 0, x: 10, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 10, scale: 0.9 }}
          transition={{ duration: 0.2 }}
        >
          {tooltip}
        </motion.div>
      )}

      {/* Action Button */}
      <motion.button
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white"
        style={getGlowStyle()}
        whileHover={{ 
          scale: 1.05,
          ...getGlowStyle(true)
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        disabled={isWatched && glowColor === "purple"}
      >
        {/* Icon */}
        <div className="w-6 h-6 flex items-center justify-center">
          {icon}
        </div>

        {/* Badge Overlay */}
        {badge && !isWatched && (
          <motion.div
            className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full text-xs font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%)',
              fontSize: '10px',
              minWidth: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {badge}
          </motion.div>
        )}

        {/* Pulse Animation for XP */}
        {glowColor === "purple" && !isWatched && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-purple-500/50"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}
      </motion.button>
    </div>
  );
}

// Watched Pill Component
function WatchedPill() {
  return (
    <motion.div
      className="px-4 py-2 rounded-full text-white text-sm font-semibold"
      style={{
        background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%)',
        boxShadow: '0 4px 12px rgba(147, 51, 234, 0.3)'
      }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      ✅ Watched – XP earned
    </motion.div>
  );
}

// Creator Info Component
function CreatorInfo({ 
  creator, 
  title, 
  hashtags, 
  onSubscribe, 
  isSubscribed 
}: {
  creator: WizXPShort['creator'];
  title: string;
  hashtags: string[];
  onSubscribe: () => void;
  isSubscribed: boolean;
}) {
  return (
    <div>
      {/* Creator Row - Horizontal Layout */}
      <div className="flex items-center justify-between">
        {/* Left Side: Avatar + Name + Level */}
        <div className="flex items-center space-x-3">
          <Avatar className="w-9 h-9 ring-2 ring-white/20">
            <AvatarImage src={creator.avatar} alt={creator.name} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold">
              {creator.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex flex-col">
            <span className="font-semibold text-white text-sm">{creator.name}</span>
            <span className="text-xs text-gray-400">Lv. {creator.level}</span>
          </div>
        </div>

        {/* Right Side: Subscribe Button */}
        <Button
          onClick={onSubscribe}
          className={`rounded-full px-4 py-2 text-sm font-semibold transition-all border-none ${
            isSubscribed ? 'bg-white/20 text-white' : 'text-white'
          }`}
          style={{
            background: isSubscribed 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%)'
          }}
        >
          {isSubscribed ? 'Subscribed' : 'Subscribe'}
        </Button>
      </div>

      {/* Video Caption - Below Creator Row */}
      <div className="mt-3">
        <h3 className="font-bold text-white text-sm mb-2">{title}</h3>
        
        {/* Hashtags */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {hashtags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs text-gray-400">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Main Component
export function WizXPShortsDesktop({ onClose }: WizXPShortsDesktopProps) {
  const [shorts, setShorts] = useState<WizXPShort[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [watchedShorts, setWatchedShorts] = useState<{ [id: string]: boolean }>({});
  const [subscribedCreators, setSubscribedCreators] = useState<Set<string>>(new Set());
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { addXp } = useXp();
  const isMobile = useIsMobile();

  // Load shorts data
  useEffect(() => {
    console.log('📱 Loading WizXP Desktop Shorts...');
    const shortsQuery = query(
      collection(db, 'creatorVideos'),
      orderBy('addedToWiz', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(shortsQuery, (snapshot) => {
      const shortsData: WizXPShort[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.contentType === 'short' && data.status === 'active' && data.videoId) {
          shortsData.push({
            id: doc.id,
            videoId: data.videoId,
            title: data.title || 'Untitled Short',
            creator: {
              name: data.creatorName || 'Unknown Creator',
              avatar: data.creatorAvatar,
              level: data.creatorLevel || Math.floor(Math.random() * 5) + 1,
              id: data.creatorId || 'unknown'
            },
            xpReward: Math.floor((data.duration || 30) / 10) + 3,
            hashtags: data.hashtags || data.tags || []
          });
        }
      });

      console.log('📱 Loaded WizXP Desktop Shorts:', shortsData.length);
      setShorts(shortsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const currentShort = shorts[currentIndex];

  // Navigation
  const goToNext = () => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        goToPrev();
      } else if (event.key === 'ArrowDown') {
        event.preventDefault();
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, shorts.length]);

  // Mouse wheel navigation (desktop)
  useEffect(() => {
    if (!isMobile && containerRef.current) {
      const handleWheel = (event: WheelEvent) => {
        event.preventDefault();
        
        if (event.deltaY > 0) {
          goToNext();
        } else if (event.deltaY < 0) {
          goToPrev();
        }
      };

      const container = containerRef.current;
      container.addEventListener('wheel', handleWheel, { passive: false });
      
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [currentIndex, shorts.length, isMobile]);

  // Touch swipe navigation (mobile)
  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    
    if (info.offset.y > threshold && currentIndex > 0) {
      goToPrev();
    } else if (info.offset.y < -threshold && currentIndex < shorts.length - 1) {
      goToNext();
    }
  };

  // Handle video watched - Award XP once only
  const handleWatched = () => {
    if (currentShort && user && !watchedShorts[currentShort.id]) {
      // Mark as watched
      setWatchedShorts(prev => ({ ...prev, [currentShort.id]: true }));
      
      // Award XP via addXp (this syncs with profile progress bar)
      addXp(currentShort.xpReward);
      
      console.log(`🎯 Earned ${currentShort.xpReward} XP for watching short: ${currentShort.title}`);
    } else if (watchedShorts[currentShort.id]) {
      console.log(`⚠️ Short already watched - no XP awarded`);
    }
  };

  // Share functionality
  const handleShare = async () => {
    if (!currentShort) return;
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
    }
  };

  // Subscribe toggle
  const handleSubscribe = () => {
    if (!currentShort) return;
    
    const creatorId = currentShort.creator.id;
    const newSubscribed = new Set(subscribedCreators);
    
    if (newSubscribed.has(creatorId)) {
      newSubscribed.delete(creatorId);
    } else {
      newSubscribed.add(creatorId);
    }
    
    setSubscribedCreators(newSubscribed);
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
        <div className="text-white text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Loading Shorts...</p>
        </div>
      </div>
    );
  }

  // No shorts state
  if (!currentShort) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, #0A0F1C 0%, #141A2E 100%)'
        }}
      >
        <div className="text-center text-white">
          <h2 className="text-xl font-bold mb-4">No Shorts Available</h2>
          <p className="text-gray-400 mb-6">Check back later for new content</p>
          {onClose && (
            <Button onClick={onClose} className="bg-purple-600 hover:bg-purple-700">
              Go Back
            </Button>
          )}
        </div>
      </div>
    );
  }

  const isWatched = watchedShorts[currentShort.id] || false;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, #0A0F1C 0%, #141A2E 100%)'
      }}
    >
      {/* Close Button - Top Right */}
      {onClose && (
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 z-30 text-white hover:bg-white/10 rounded-full p-2"
        >
          <X className="w-5 h-5" />
        </Button>
      )}

      {/* Progress Indicator */}
      <div className="absolute top-4 left-4 text-white text-sm opacity-70 z-20">
        {currentIndex + 1} / {shorts.length}
      </div>

      {/* Main Centered Layout */}
      <div className="relative flex flex-col items-center">
        
        {/* Video Container with Floating Actions */}
        <div className="relative">
          <motion.div
            className="relative bg-black rounded-xl overflow-hidden shadow-lg"
            style={{
              width: isMobile ? 'min(100vw, 360px)' : '360px',
              height: isMobile ? '100vh' : '640px',
              aspectRatio: '9/16'
            }}
            drag={isMobile ? "y" : false}
            dragConstraints={{ top: 0, bottom: 0 }}
            onDragEnd={isMobile ? handleDragEnd : undefined}
            key={currentShort.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Video Player */}
            <LocalVideoPlayer
              url={`https://www.youtube.com/watch?v=${currentShort.videoId}`}
              onProgress={() => {}}
              onXpEarned={handleWatched}
              className="w-full h-full object-cover"
            />

            {/* Video Controls - Bottom Right Inside Video */}
            <VideoControls
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              isMuted={isMuted}
              onMuteToggle={() => setIsMuted(!isMuted)}
            />
          </motion.div>

          {/* Desktop Navigation Arrows - Left Edge of Video Container */}
          <div className="absolute top-1/2 -left-16 -translate-y-1/2 hidden lg:flex flex-col space-y-3 z-20">
            {/* Previous Short */}
            <motion.button
              onClick={goToPrev}
              disabled={currentIndex === 0}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              style={{
                background: 'rgba(26, 31, 46, 0.9)',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.2)'
              }}
              whileHover={{ 
                scale: currentIndex > 0 ? 1.05 : 1,
                boxShadow: currentIndex > 0 ? '0 6px 20px rgba(59, 130, 246, 0.3)' : '0 4px 16px rgba(59, 130, 246, 0.2)'
              }}
              whileTap={{ scale: currentIndex > 0 ? 0.95 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronUp className="w-6 h-6" />
            </motion.button>

            {/* Next Short */}
            <motion.button
              onClick={goToNext}
              disabled={currentIndex === shorts.length - 1}
              className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              style={{
                background: 'rgba(26, 31, 46, 0.9)',
                boxShadow: '0 4px 16px rgba(59, 130, 246, 0.2)'
              }}
              whileHover={{ 
                scale: currentIndex < shorts.length - 1 ? 1.05 : 1,
                boxShadow: currentIndex < shorts.length - 1 ? '0 6px 20px rgba(59, 130, 246, 0.3)' : '0 4px 16px rgba(59, 130, 246, 0.2)'
              }}
              whileTap={{ scale: currentIndex < shorts.length - 1 ? 0.95 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Floating Action Icons Stack - Right Edge of Video Container */}
          <div className="absolute top-1/2 -right-16 -translate-y-1/2 hidden lg:flex flex-col space-y-4 z-20">
            {/* Share */}
            <FloatingActionButton
              icon={<Share2 className="w-6 h-6" />}
              onClick={handleShare}
              tooltip="Share"
              glowColor="default"
            />

            {/* Earn XP / XP Earned */}
            <FloatingActionButton
              icon={<Star className="w-6 h-6" />}
              onClick={handleWatched}
              tooltip={isWatched ? "XP Already Earned" : "Earn XP"}
              glowColor="purple"
              badge={isWatched ? undefined : `+${currentShort.xpReward}`}
              isWatched={isWatched}
            />

            {/* Tip Crypto */}
            <FloatingActionButton
              icon={<Coins className="w-6 h-6" />}
              onClick={() => console.log('Tip crypto')}
              tooltip="Tip Crypto"
              glowColor="orange"
            />
          </div>

          {/* Watched Pill - Bottom Right Outside Video Container */}
          {isWatched && (
            <div className="absolute -bottom-4 -right-16 hidden lg:block z-20">
              <WatchedPill />
            </div>
          )}

          {/* Mobile Floating Actions - Right Edge of Screen */}
          <div className="lg:hidden absolute right-4 top-1/2 -translate-y-1/2 flex flex-col space-y-4 z-20">
            <FloatingActionButton
              icon={<Share2 className="w-6 h-6" />}
              onClick={handleShare}
              glowColor="default"
            />

            <FloatingActionButton
              icon={<Star className="w-6 h-6" />}
              onClick={handleWatched}
              glowColor="purple"
              badge={isWatched ? undefined : `+${currentShort.xpReward}`}
              isWatched={isWatched}
            />

            <FloatingActionButton
              icon={<Coins className="w-6 h-6" />}
              onClick={() => console.log('Tip crypto')}
              glowColor="orange"
            />
          </div>

          {/* Mobile Watched Pill - Bottom Right */}
          {isWatched && (
            <div className="lg:hidden absolute bottom-20 right-4 z-20">
              <WatchedPill />
            </div>
          )}
        </div>

        {/* Creator Info - Directly Under Video Container */}
        <div 
          className="mt-4 w-full max-w-[360px] px-4 lg:px-0"
          style={{ width: isMobile ? 'min(100vw, 360px)' : '360px' }}
        >
          <CreatorInfo
            creator={currentShort.creator}
            title={currentShort.title}
            hashtags={currentShort.hashtags}
            onSubscribe={handleSubscribe}
            isSubscribed={subscribedCreators.has(currentShort.creator.id)}
          />
        </div>
      </div>
    </div>
  );
}