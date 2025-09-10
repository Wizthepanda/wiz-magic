import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { Share2, Star, Coins, X, ArrowUp, ArrowDown } from "lucide-react";
import { useXp } from "@/context/XpContext";
import { useAuth } from "@/hooks/useAuth";
import { 
  doc, 
  updateDoc, 
  getDoc, 
  arrayUnion, 
  arrayRemove, 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from "firebase/firestore";
import { LocalVideoPlayer } from "@/components/ui/local-video-player";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TipModal } from "./creator/components/TipModal";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { db } from "@/lib/firebase";

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
  duration: number;
  isWatched: boolean;
}

interface WizXPShortsScreenNewProps {
  initialShortId?: string;
  onClose?: () => void;
}

// Floating Action Button Component
function FloatingActionButton({ 
  icon, 
  onClick, 
  glowColor, 
  hoverGlow, 
  tooltip, 
  badge, 
  className = "" 
}: {
  icon: React.ReactNode;
  onClick: () => void;
  glowColor: string;
  hoverGlow: string;
  tooltip?: string;
  badge?: string;
  className?: string;
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      {/* Tooltip - Desktop Only */}
      {tooltip && showTooltip && (
        <motion.div
          className="absolute right-14 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg text-sm font-medium text-white z-50 whitespace-nowrap"
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
        className={cn(
          "relative w-12 h-12 rounded-full border border-white/20 flex items-center justify-center",
          className
        )}
        style={{
          background: 'linear-gradient(135deg, #1A1F2E 0%, #242A3E 100%)',
          boxShadow: `0 0 20px ${glowColor}`
        }}
        whileHover={{ 
          scale: 1.05,
          boxShadow: `0 0 30px ${hoverGlow}`
        }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 20 }}
      >
        <div className="w-6 h-6 text-white flex items-center justify-center">
          {icon}
        </div>

        {/* Badge Overlay */}
        {badge && (
          <motion.div
            className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-xs font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
              boxShadow: '0 0 10px rgba(147,51,234,0.5)'
            }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            {badge}
          </motion.div>
        )}
      </motion.button>
    </div>
  );
}

// XP Progress Bar Component with Scrubbing
function XPProgressBar({ 
  progress, 
  onSeek, 
  className = "" 
}: { 
  progress: number; 
  onSeek?: (percentage: number) => void;
  className?: string;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const progressRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!onSeek) return;
    setIsDragging(true);
    handleSeek(e);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !onSeek) return;
    handleSeek(e as any);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleSeek = (e: React.MouseEvent | MouseEvent) => {
    if (!progressRef.current || !onSeek) return;
    
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100));
    onSeek(percentage);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div 
      ref={progressRef}
      className={`w-full h-1 bg-white/10 rounded-full overflow-hidden cursor-pointer relative ${className}`}
      onMouseDown={handleMouseDown}
    >
      <motion.div
        className="h-full rounded-full"
        style={{
          background: 'linear-gradient(90deg, #9333ea 0%, #3b82f6 100%)',
          boxShadow: '0 0 10px rgba(147,51,234,0.6)'
        }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: isDragging ? 0 : 0.3, ease: "easeOut" }}
      />
      
      {/* Scrubber handle */}
      {onSeek && (
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 hover:opacity-100 transition-opacity"
          style={{ left: `${progress}%`, marginLeft: '-6px' }}
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        />
      )}
    </div>
  );
}

// Creator Overlay Component
function CreatorOverlay({ 
  creator, 
  title, 
  hashtags, 
  onFollow, 
  isFollowLoading 
}: {
  creator: WizXPShort['creator'];
  title: string;
  hashtags: string[];
  onFollow: () => void;
  isFollowLoading: boolean;
}) {
  return (
    <div className="space-y-3">
      {/* Creator Row - Enhanced */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Avatar 
              className="w-10 h-10 ring-2 ring-white/20" 
              style={{ boxShadow: '0 0 12px rgba(147,51,234,0.3)' }}
            >
              <AvatarImage src={creator.avatar} alt={creator.name} />
              <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white font-bold">
                {creator.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          
          <div className="flex items-center space-x-2">
            <motion.span 
              className="text-white font-bold text-base cursor-pointer hover:text-purple-300 transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              {creator.name}
            </motion.span>
            <Badge 
              className="text-xs px-2 py-1 rounded-full font-semibold"
              style={{
                background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
                color: 'white',
                border: 'none',
                boxShadow: '0 2px 8px rgba(147,51,234,0.3)'
              }}
            >
              Lv. {creator.level}
            </Badge>
          </div>
        </div>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            size="sm"
            onClick={onFollow}
            disabled={isFollowLoading}
            className="px-4 py-2 rounded-full text-xs font-semibold text-white border-0 shadow-lg relative"
            style={{
              background: creator.isFollowed 
                ? 'linear-gradient(135deg, rgba(147,51,234,0.4) 0%, rgba(59,130,246,0.4) 100%)'
                : 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
              boxShadow: creator.isFollowed 
                ? '0 4px 12px rgba(147,51,234,0.2)'
                : '0 4px 12px rgba(147,51,234,0.4)',
              opacity: isFollowLoading ? 0.7 : 1
            }}
          >
            {isFollowLoading ? (
              <motion.div
                className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            ) : (
              creator.isFollowed ? 'Following' : 'Follow'
            )}
          </Button>
        </motion.div>
      </div>

      {/* Video Caption - Enhanced */}
      <div className="space-y-2">
        <h3 className="text-white font-bold text-base leading-tight line-clamp-2">
          {title}
        </h3>
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {hashtags.slice(0, 4).map((tag, index) => (
              <motion.span 
                key={index} 
                className="text-blue-400 text-xs font-medium hover:text-blue-300 cursor-pointer transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                #{tag}
              </motion.span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Related Shorts Strip Component
function RelatedShortsStrip({ 
  shorts, 
  currentIndex, 
  onSelectShort 
}: {
  shorts: WizXPShort[];
  currentIndex: number;
  onSelectShort: (index: number) => void;
}) {
  const nextShorts = shorts.slice(currentIndex + 1, currentIndex + 4);

  if (nextShorts.length === 0) return null;

  return (
    <div className="absolute right-6 top-1/2 -translate-y-1/2 space-y-3">
      {nextShorts.map((short, index) => (
        <motion.div
          key={short.id}
          className="relative cursor-pointer group w-16 aspect-[9/16] rounded-lg overflow-hidden"
          onClick={() => onSelectShort(currentIndex + 1 + index)}
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 4px 20px rgba(147,51,234,0.3)'
          }}
          whileTap={{ scale: 0.95 }}
        >
          <img
            src={short.thumbnail}
            alt={short.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          
          {/* XP Badge */}
          <div 
            className="absolute top-1 right-1 px-1.5 py-0.5 rounded-full text-xs font-bold text-white"
            style={{
              background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
              boxShadow: '0 0 8px rgba(147,51,234,0.4)'
            }}
          >
            +{short.xpReward}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// Error boundary wrapper
function WizXPShortsErrorBoundary({ children }: { children: React.ReactNode }) {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error('WizXP Shorts Error:', error);
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900">
        <div className="text-center text-white">
          <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
          <p className="text-gray-400">Please refresh the page</p>
        </div>
      </div>
    );
  }
}

// Main Component Implementation
function WizXPShortsScreenNewImpl({
  initialShortId,
  onClose
}: WizXPShortsScreenNewProps) {
  const { addXp } = useXp();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // State
  const [shorts, setShorts] = useState<WizXPShort[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [xpProgress, setXpProgress] = useState(0);
  const [videoProgress, setVideoProgress] = useState(0);
  const [showTipModal, setShowTipModal] = useState(false);
  const [watchedShorts, setWatchedShorts] = useState<Set<string>>(new Set());
  const [followedCreators, setFollowedCreators] = useState<Set<string>>(new Set());
  const [followLoading, setFollowLoading] = useState<Set<string>>(new Set());

  // Load shorts from Firestore
  useEffect(() => {
    setLoading(true);
    
    const shortsQuery = query(
      collection(db, 'creatorVideos'),
      orderBy('addedToWiz', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(shortsQuery, (snapshot) => {
      console.log('📱 Shorts Query - Total docs:', snapshot.docs.length);
      
      const shortsFromFirebase: WizXPShort[] = snapshot.docs
        .map(doc => {
          const data = doc.data();
          console.log('📱 Processing video:', {
            id: doc.id,
            title: data.title,
            duration: data.duration,
            contentType: data.contentType,
            status: data.status
          });
          return { doc, data };
        })
        .filter(({ data }) => {
          // More flexible filtering - include explicit shorts OR short duration videos
          const isExplicitShort = data.contentType === 'short';
          const isDurationBasedShort = data.duration && (typeof data.duration === 'number' ? data.duration < 120 : false);
          const isActive = data.status === 'active' || !data.status;
          const hasVideoId = data.videoId || data.youtubeId;
          
          const shouldInclude = (isExplicitShort || isDurationBasedShort) && isActive && hasVideoId;
          
          console.log('📱 Filter check:', {
            title: data.title,
            isExplicitShort,
            isDurationBasedShort,
            isActive,
            hasVideoId,
            shouldInclude
          });
          
          return shouldInclude;
        })
        .map(({ doc, data }) => ({
          id: doc.id,
          videoId: data.videoId || data.youtubeId || '',
          title: data.title || 'Untitled Short',
          subtitle: data.description?.substring(0, 100) || '',
          hashtags: data.hashtags || data.tags || [],
          creator: {
            name: data.creatorName || 'Unknown Creator',
            avatar: data.creatorAvatar || `/Profile Pics/${data.creatorName || 'default'}.jpg`,
            level: data.creatorLevel || 1,
            id: data.creatorId || 'unknown',
            isFollowed: false
          },
          xpReward: Math.min(15, Math.max(5, Math.floor((data.duration || 60) / 4))),
          thumbnail: data.thumbnail || `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`,
          duration: typeof data.duration === 'number' ? data.duration : 45,
          isWatched: false
        }))
        .slice(0, 20);

      console.log('📱 Final shorts array:', shortsFromFirebase.length, 'shorts');
      
      // If no shorts found, fallback to any videos (for testing)
      if (shortsFromFirebase.length === 0) {
        console.log('📱 No shorts found, falling back to regular videos...');
        const fallbackVideos = snapshot.docs
          .map(doc => {
            const data = doc.data();
            return { doc, data };
          })
          .filter(({ data }) => data.videoId || data.youtubeId)
          .map(({ doc, data }) => ({
            id: doc.id,
            videoId: data.videoId || data.youtubeId || '',
            title: data.title || 'Untitled Video',
            subtitle: data.description?.substring(0, 100) || '',
            hashtags: data.hashtags || data.tags || [],
            creator: {
              name: data.creatorName || data.creator || 'Unknown Creator',
              avatar: data.creatorAvatar || data.thumbnail || `https://img.youtube.com/vi/${data.videoId || data.youtubeId}/maxresdefault.jpg`,
              level: data.creatorLevel || 1,
              id: data.creatorId || data.channelId || doc.id,
              isFollowed: false
            },
            xpReward: Math.min(15, Math.max(5, Math.floor((typeof data.duration === 'number' ? data.duration : 60) / 4))),
            thumbnail: data.thumbnail || `https://img.youtube.com/vi/${data.videoId || data.youtubeId}/maxresdefault.jpg`,
            duration: typeof data.duration === 'number' ? data.duration : 45,
            isWatched: false
          }))
          .slice(0, 10);
        
        console.log('📱 Fallback videos:', fallbackVideos.length);
        setShorts(fallbackVideos);
      } else {
        setShorts(shortsFromFirebase);
      }
      
      setLoading(false);

      if (initialShortId) {
        const foundIndex = shortsFromFirebase.findIndex(short => short.id === initialShortId);
        if (foundIndex !== -1) {
          setCurrentIndex(foundIndex);
        }
      }
    });

    return () => unsubscribe();
  }, [initialShortId]);

  // Load user's followed creators
  useEffect(() => {
    if (!user?.uid) return;
    
    const loadFollowedCreators = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const followed = new Set(userData.followedCreators || []);
          setFollowedCreators(followed);
          
          // Update shorts with follow status
          setShorts(prevShorts => 
            prevShorts.map(short => ({
              ...short,
              creator: {
                ...short.creator,
                isFollowed: followed.has(short.creator.id)
              }
            }))
          );
        }
      } catch (error) {
        console.error('Error loading followed creators:', error);
      }
    };
    
    loadFollowedCreators();
  }, [user?.uid, shorts.length]);

  // Auto-advance to next video when progress reaches 100%
  useEffect(() => {
    if (videoProgress >= 100) {
      const timer = setTimeout(() => {
        goToNext();
      }, 1000); // Wait 1 second before auto-advancing
      
      return () => clearTimeout(timer);
    }
  }, [videoProgress, goToNext]);

  // Follow/Unfollow functionality
  const handleFollowToggle = async (creatorId: string) => {
    if (!user?.uid || followLoading.has(creatorId)) return;
    
    setFollowLoading(prev => new Set([...prev, creatorId]));
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const isCurrentlyFollowed = followedCreators.has(creatorId);
      
      if (isCurrentlyFollowed) {
        // Unfollow
        await updateDoc(userDocRef, {
          followedCreators: arrayRemove(creatorId)
        });
        setFollowedCreators(prev => {
          const newSet = new Set(prev);
          newSet.delete(creatorId);
          return newSet;
        });
      } else {
        // Follow
        await updateDoc(userDocRef, {
          followedCreators: arrayUnion(creatorId)
        });
        setFollowedCreators(prev => new Set([...prev, creatorId]));
      }
      
      // Update the current shorts array
      setShorts(prevShorts => 
        prevShorts.map(short => ({
          ...short,
          creator: {
            ...short.creator,
            isFollowed: short.creator.id === creatorId ? !isCurrentlyFollowed : short.creator.isFollowed
          }
        }))
      );
      
    } catch (error) {
      console.error('Error toggling follow:', error);
    } finally {
      setFollowLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(creatorId);
        return newSet;
      });
    }
  };

  // Navigation
  const goToNext = useCallback(() => {
    if (shorts && shorts.length > 0 && currentIndex < shorts.length - 1) {
      setCurrentIndex(prev => Math.min(prev + 1, shorts.length - 1));
      setXpProgress(0);
      setVideoProgress(0);
    }
  }, [currentIndex, shorts]);

  const goToPrev = useCallback(() => {
    if (shorts && shorts.length > 0 && currentIndex > 0) {
      setCurrentIndex(prev => Math.max(prev - 1, 0));
      setXpProgress(0);
      setVideoProgress(0);
    }
  }, [currentIndex, shorts]);

  // Video seeking
  const handleVideoSeek = useCallback((percentage: number) => {
    setVideoProgress(percentage);
    // Here you would typically call a method on the video player to seek
    const videoElement = document.querySelector('video');
    const current = shorts[currentIndex];
    if (videoElement && current) {
      const targetTime = (percentage / 100) * current.duration;
      videoElement.currentTime = targetTime;
    }
  }, [shorts, currentIndex]);

  // Swipe handling
  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    
    if (info.offset.y > threshold) {
      goToPrev();
    } else if (info.offset.y < -threshold) {
      goToNext();
    }
  };

  // Mouse wheel handling for desktop
  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();
    const threshold = 100;
    
    if (event.deltaY > threshold) {
      goToNext();
    } else if (event.deltaY < -threshold) {
      goToPrev();
    }
  }, [goToNext, goToPrev]);

  // Add wheel event listener
  useEffect(() => {
    if (!isMobile) {
      const element = document.getElementById('shorts-container');
      if (element) {
        element.addEventListener('wheel', handleWheel, { passive: false });
        return () => element.removeEventListener('wheel', handleWheel);
      }
    }
  }, [handleWheel, isMobile]);

  // Share functionality
  const handleShare = async () => {
    const current = shorts[currentIndex];
    if (!current) return;
    
    const shareUrl = `${window.location.origin}/shorts/${current.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: current.title,
          text: `Check out this short by ${current.creator.name} on WizXP!`,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
    }
  };

  const currentShort = useMemo(() => {
    if (!shorts || shorts.length === 0 || currentIndex < 0 || currentIndex >= shorts.length) {
      return null;
    }
    return shorts[currentIndex];
  }, [shorts, currentIndex]);

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
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading WizXP Shorts...</p>
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
        className="fixed top-6 left-6 z-60 p-3 rounded-full bg-black/50 backdrop-blur-lg border border-white/20"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <X className="w-5 h-5 text-white" />
      </motion.button>

      {/* Navigation Arrows (Desktop) */}
      {!isMobile && (
        <>
          <motion.button
            onClick={goToPrev}
            disabled={currentIndex === 0}
            className="fixed top-1/2 left-8 -translate-y-1/2 z-50 p-2 rounded-full bg-black/50 backdrop-blur-lg border border-white/20 disabled:opacity-30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowUp className="w-5 h-5 text-white" />
          </motion.button>
          
          <motion.button
            onClick={goToNext}
            disabled={currentIndex === shorts.length - 1}
            className="fixed bottom-32 left-8 z-50 p-2 rounded-full bg-black/50 backdrop-blur-lg border border-white/20 disabled:opacity-30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowDown className="w-5 h-5 text-white" />
          </motion.button>
        </>
      )}

      {/* Main Content */}
      <div id="shorts-container" className="h-full flex items-center justify-center">
        
        {/* Video Container */}
        <motion.div
          className={cn(
            "relative overflow-hidden rounded-xl",
            isMobile ? "w-full h-full" : "w-96 h-[85vh]"
          )}
          drag={isMobile ? "y" : false}
          dragConstraints={{ top: 0, bottom: 0 }}
          onDragEnd={handleDragEnd}
          dragElastic={0.1}
          style={{
            boxShadow: isMobile ? 'none' : '0 25px 50px rgba(0, 0, 0, 0.5)'
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentShort.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="relative w-full h-full bg-black aspect-[9/16]"
            >
              {/* Video Player */}
              <div className="absolute inset-0">
                {currentShort.videoId ? (
                  <LocalVideoPlayer
                    url={`https://www.youtube.com/watch?v=${currentShort.videoId}`}
                    onProgress={(progress) => {
                      console.log('📹 Video progress:', progress, '%');
                      setVideoProgress(progress);
                      // Also update XP progress based on video progress
                      const xpProgressPercent = Math.min(100, progress);
                      setXpProgress(xpProgressPercent);
                      
                      // Award XP at 95% completion
                      if (xpProgressPercent >= 95 && !watchedShorts.has(currentShort.id)) {
                        addXp(currentShort.xpReward);
                        setWatchedShorts(prev => new Set([...prev, currentShort.id]));
                      }
                    }}
                    onXpEarned={() => {}} // Required prop
                    className="w-full h-full object-cover"
                    key={`${currentShort.id}-${currentShort.videoId}`} // Force re-render on video change
                  />
                ) : (
                  // Fallback for videos without videoId
                  <div className="w-full h-full bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-4">🎬</div>
                      <p className="text-lg font-medium">Video Loading...</p>
                      <p className="text-sm text-gray-400 mt-2">{currentShort.title}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating Action Icons - Right Edge Stack */}
              <div className="absolute right-4 flex flex-col space-y-5 z-40" style={{ top: '40%' }}>
                
                {/* Share Button */}
                <FloatingActionButton
                  icon={<Share2 className="w-6 h-6" />}
                  onClick={handleShare}
                  glowColor="rgba(255,255,255,0.1)"
                  hoverGlow="rgba(59,130,246,0.3)"
                  tooltip="Share"
                />

                {/* XP Earn Button */}
                <FloatingActionButton
                  icon={<Star className={cn(
                    "w-6 h-6",
                    watchedShorts.has(currentShort.id) ? "fill-current" : ""
                  )} />}
                  onClick={() => {}}
                  glowColor="rgba(147,51,234,0.2)"
                  hoverGlow="rgba(147,51,234,0.4)"
                  tooltip="Earn XP"
                  badge={watchedShorts.has(currentShort.id) ? undefined : (currentShort.xpReward && !isNaN(currentShort.xpReward) ? `+${currentShort.xpReward}` : undefined)}
                  className={watchedShorts.has(currentShort.id) ? "text-purple-400" : ""}
                />

                {/* Tip Crypto Button */}
                <FloatingActionButton
                  icon={<Coins className="w-6 h-6" />}
                  onClick={() => setShowTipModal(true)}
                  glowColor="rgba(251,146,60,0.2)"
                  hoverGlow="rgba(251,146,60,0.4)"
                  tooltip="Tip Creator"
                />
              </div>

              {/* Bottom Content Overlay */}
              <div className="absolute bottom-0 left-0 right-0 z-30">
                {/* Video Progress Bar with Scrubbing */}
                <div className="px-4 pb-3">
                  <XPProgressBar 
                    progress={videoProgress} 
                    onSeek={handleVideoSeek}
                    className="hover:h-2 transition-all duration-200"
                  />
                </div>

                {/* Creator Overlay */}
                <div 
                  className="px-4 pb-6"
                  style={{
                    background: 'linear-gradient(to top, rgba(0, 0, 0, 0.8) 0%, transparent 100%)'
                  }}
                >
                  <CreatorOverlay
                    creator={currentShort.creator}
                    title={currentShort.title}
                    hashtags={currentShort.hashtags}
                    onFollow={() => handleFollowToggle(currentShort.creator.id)}
                    isFollowLoading={followLoading.has(currentShort.creator.id)}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Related Shorts Strip - Desktop Only */}
        {!isMobile && shorts.length > 1 && (
          <RelatedShortsStrip
            shorts={shorts}
            currentIndex={currentIndex}
            onSelectShort={setCurrentIndex}
          />
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
}

// Main Export with Error Boundary
export function WizXPShortsScreenNew(props: WizXPShortsScreenNewProps) {
  return (
    <WizXPShortsErrorBoundary>
      <WizXPShortsScreenNewImpl {...props} />
    </WizXPShortsErrorBoundary>
  );
}