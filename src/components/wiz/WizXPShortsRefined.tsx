import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Share2, Star, Coins, X } from "lucide-react";
import { LocalVideoPlayer } from "@/components/ui/local-video-player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { useXp } from "@/context/XpContext";

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

interface WizXPShortsRefinedProps {
  onClose?: () => void;
}

// Floating Action Button Component
function FloatingActionButton({ 
  icon, 
  onClick, 
  tooltip, 
  glowColor = "white",
  badge,
  className = "" 
}: {
  icon: React.ReactNode;
  onClick: () => void;
  tooltip?: string;
  glowColor?: string;
  badge?: string;
  className?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const getGlowStyle = () => {
    switch (glowColor) {
      case "purple":
        return {
          boxShadow: '0 4px 16px rgba(147, 51, 234, 0.3)',
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(59, 130, 246, 0.2) 100%), rgba(26, 31, 46, 0.9)'
        };
      case "orange":
        return {
          boxShadow: '0 4px 16px rgba(251, 146, 60, 0.3)',
          background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.2) 0%, rgba(252, 211, 77, 0.2) 100%), rgba(26, 31, 46, 0.9)'
        };
      default:
        return {
          boxShadow: '0 4px 16px rgba(255, 255, 255, 0.1)',
          background: 'rgba(26, 31, 46, 0.9)'
        };
    }
  };

  const getHoverGlowStyle = () => {
    switch (glowColor) {
      case "purple":
        return {
          boxShadow: '0 6px 24px rgba(147, 51, 234, 0.5)',
          background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%), rgba(26, 31, 46, 0.9)'
        };
      case "orange":
        return {
          boxShadow: '0 6px 24px rgba(251, 146, 60, 0.5)',
          background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.3) 0%, rgba(252, 211, 77, 0.3) 100%), rgba(26, 31, 46, 0.9)'
        };
      default:
        return {
          boxShadow: '0 6px 24px rgba(59, 130, 246, 0.3)',
          background: 'rgba(26, 31, 46, 0.9)'
        };
    }
  };

  return (
    <div className="relative">
      {/* Desktop Tooltip */}
      {tooltip && showTooltip && (
        <motion.div
          className="absolute right-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-medium text-white z-50 whitespace-nowrap hidden md:block"
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
        className={`relative w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white ${className}`}
        style={getGlowStyle()}
        whileHover={{ 
          scale: 1.05,
          ...getHoverGlowStyle()
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {/* Icon */}
        <div className="w-6 h-6 flex items-center justify-center">
          {icon}
        </div>

        {/* Badge Overlay */}
        {badge && (
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
        {glowColor === "purple" && (
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

// XP Progress Bar Component
function XPProgressBar({ progress }: { progress: number }) {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
      <motion.div
        className="h-full"
        style={{
          background: 'linear-gradient(90deg, rgba(147, 51, 234, 1) 0%, rgba(59, 130, 246, 1) 100%)',
          boxShadow: '0 0 8px rgba(147, 51, 234, 0.5)'
        }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.3 }}
      />
    </div>
  );
}

// Creator Overlay Component
function CreatorOverlay({ 
  creator, 
  title, 
  hashtags, 
  onFollow, 
  isFollowing 
}: {
  creator: WizXPShort['creator'];
  title: string;
  hashtags: string[];
  onFollow: () => void;
  isFollowing: boolean;
}) {
  return (
    <div className="absolute bottom-20 left-4 right-20 text-white z-10">
      {/* Creator Row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8 ring-2 ring-white/20">
            <AvatarImage src={creator.avatar} alt={creator.name} />
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold text-sm">
              {creator.name.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex items-center space-x-2">
            <span className="font-bold text-sm">{creator.name}</span>
            <Badge 
              className="text-xs px-2 py-1 rounded-full"
              style={{
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%)',
                border: 'none'
              }}
            >
              Lv. {creator.level}
            </Badge>
          </div>
        </div>

        <Button
          onClick={onFollow}
          size="sm"
          className={`rounded-full px-4 py-1 text-xs font-semibold transition-all ${
            isFollowing
              ? 'bg-white/20 text-white border border-white/30'
              : 'text-white border-none'
          }`}
          style={{
            background: isFollowing 
              ? 'rgba(255, 255, 255, 0.1)' 
              : 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%)'
          }}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </Button>
      </div>

      {/* Video Caption */}
      <h3 className="font-bold text-base mb-2 line-clamp-2">{title}</h3>
      
      {/* Hashtags */}
      {hashtags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {hashtags.slice(0, 3).map((tag, index) => (
            <span key={index} className="text-sm text-gray-300">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// Main Component
export function WizXPShortsRefined({ onClose }: WizXPShortsRefinedProps) {
  const [shorts, setShorts] = useState<WizXPShort[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [xpProgress, setXpProgress] = useState(0);
  const [followedCreators, setFollowedCreators] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { addXp } = useXp();

  // Load shorts data
  useEffect(() => {
    console.log('📱 Loading WizXP Shorts...');
    const shortsQuery = query(
      collection(db, 'creatorVideos'),
      orderBy('addedToWiz', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(shortsQuery, (snapshot) => {
      const shortsData: WizXPShort[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        // Only include shorts
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
            xpReward: Math.floor((data.duration || 30) / 10) + 3, // 3-8 XP based on duration
            hashtags: data.hashtags || data.tags || []
          });
        }
      });

      console.log('📱 Loaded WizXP Shorts:', shortsData.length);
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
      setXpProgress(0);
    }
  };

  const goToPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setXpProgress(0);
    }
  };

  // Swipe handling
  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    
    if (info.offset.y > threshold && currentIndex > 0) {
      goToPrev();
    } else if (info.offset.y < -threshold && currentIndex < shorts.length - 1) {
      goToNext();
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

  // XP earning
  const handleEarnXP = () => {
    if (currentShort && user) {
      addXp(currentShort.xpReward);
      console.log(`🎯 Earned ${currentShort.xpReward} XP for watching short`);
    }
  };

  // Follow toggle
  const handleFollow = () => {
    if (!currentShort) return;
    
    const creatorId = currentShort.creator.id;
    const newFollowed = new Set(followedCreators);
    
    if (newFollowed.has(creatorId)) {
      newFollowed.delete(creatorId);
    } else {
      newFollowed.add(creatorId);
    }
    
    setFollowedCreators(newFollowed);
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

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, #0A0F1C 0%, #141A2E 100%)'
      }}
    >
      {/* Close Button */}
      {onClose && (
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 z-20 text-white hover:bg-white/10 rounded-full p-2"
        >
          <X className="w-5 h-5" />
        </Button>
      )}

      {/* Main Shorts Container */}
      <motion.div
        className="relative bg-black rounded-xl overflow-hidden shadow-2xl"
        style={{
          width: 'min(100vw, 480px)',
          height: '100vh',
          maxHeight: '100vh',
          aspectRatio: '9/16'
        }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        onDragEnd={handleDragEnd}
        key={currentShort.id}
      >
        {/* Video Player */}
        <LocalVideoPlayer
          url={`https://www.youtube.com/watch?v=${currentShort.videoId}`}
          onProgress={(progress) => setXpProgress(progress)}
          onXpEarned={handleEarnXP}
          className="w-full h-full object-cover"
        />

        {/* XP Progress Bar */}
        <XPProgressBar progress={xpProgress} />

        {/* Floating Action Icons - Right Edge */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col space-y-5 z-10">
          {/* Share */}
          <FloatingActionButton
            icon={<Share2 className="w-6 h-6" />}
            onClick={handleShare}
            tooltip="Share"
            glowColor="default"
          />

          {/* Earn XP */}
          <FloatingActionButton
            icon={<Star className="w-6 h-6" />}
            onClick={handleEarnXP}
            tooltip="Earn XP"
            glowColor="purple"
            badge={`+${currentShort.xpReward}`}
          />

          {/* Tip Crypto */}
          <FloatingActionButton
            icon={<Coins className="w-6 h-6" />}
            onClick={() => console.log('Tip crypto')}
            tooltip="Tip Crypto"
            glowColor="orange"
          />
        </div>

        {/* Creator Overlay */}
        <CreatorOverlay
          creator={currentShort.creator}
          title={currentShort.title}
          hashtags={currentShort.hashtags}
          onFollow={handleFollow}
          isFollowing={followedCreators.has(currentShort.creator.id)}
        />

        {/* Progress Indicator */}
        <div className="absolute top-4 left-4 text-white text-sm opacity-70 z-10">
          {currentIndex + 1} / {shorts.length}
        </div>
      </motion.div>
    </div>
  );
}