import { useState, useRef, useEffect } from 'react';
import { Play, ChevronLeft, ChevronRight, X, Heart, Share2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSafeNavigate } from '@/hooks/useSafeNavigate';
import { Button } from '@/components/ui/button';
import { VideoPanel } from './VideoPanel';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot } from 'firebase/firestore';

// Helper function to check if duration indicates a short video
const isShortDuration = (duration: string): boolean => {
  // Handle both YouTube format (PT1M30S) and simple format (1:30)
  if (duration.startsWith('PT')) {
    // YouTube duration format (PT1M30S = 1 minute 30 seconds)
    const match = duration.match(/PT(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return false;
    
    const minutes = parseInt(match[1] || '0', 10);
    const seconds = parseInt(match[2] || '0', 10);
    const totalSeconds = minutes * 60 + seconds;
    
    return totalSeconds < 60; // Less than 60 seconds = short
  } else {
    // Simple format (1:30 or 0:45)
    const parts = duration.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10);
      const seconds = parseInt(parts[1], 10);
      const totalSeconds = minutes * 60 + seconds;
      
      return totalSeconds < 60; // Less than 60 seconds = short
    }
    return false;
  }
};

// Types
interface ShortVideo {
  id: string;
  videoId: string;
  title: string;
  creator: string;
  thumbnail: string;
  views: string;
  timeAgo: string;
  category: string;
  xpReward: number;
  duration: string;
  avatar?: string;
  channelId?: string;
  contentType?: 'short' | 'video';
  creatorName?: string;
  creatorAvatar?: string;
}

// Helper function to format time ago from date
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours}h`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  return `${diffInWeeks}w`;
};

// Helper function to calculate XP reward based on duration
const calculateXPReward = (duration: string): number => {
  // Parse duration (e.g., "0:30" = 30 seconds)
  const parts = duration.split(':');
  const minutes = parseInt(parts[0] || '0');
  const seconds = parseInt(parts[1] || '0');
  const totalSeconds = minutes * 60 + seconds;
  
  // Base XP for shorts: 15-25 XP based on length
  return Math.min(25, Math.max(15, Math.floor(totalSeconds / 2.5)));
};

const getCategoryColor = (category: string) => {
  const colors = {
    'AI': { from: '#a855f7', to: '#4f46e5' },
    'Money': { from: '#10b981', to: '#059669' },
    'Tech': { from: '#3b82f6', to: '#0891b2' },
    'Music': { from: '#ec4899', to: '#be185d' },
    'Health': { from: '#f97316', to: '#dc2626' }
  };
  const defaultColor = { from: '#6b7280', to: '#4b5563' };
  return colors[category as keyof typeof colors] || defaultColor;
};

export const WizShorts = () => {
  const { user, addXP } = useAuth();
  const { level, addXp } = useXp();
  const { toast } = useToast();
  const navigate = useSafeNavigate();
  const isMobile = useIsMobile();
  const [selectedVideo, setSelectedVideo] = useState<ShortVideo | null>(null);
  const [startX, setStartX] = useState(0);
  const [isDown, setIsDown] = useState(false);
  const [cardWidth, setCardWidth] = useState('220px');
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Real shorts data from Firestore
  const [allShortsData, setAllShortsData] = useState<ShortVideo[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch real shorts from Firestore
  useEffect(() => {
    console.log('🎬 WizShorts: Setting up Firestore listener for shorts');
    setLoading(true);
    
    // Query for all videos first, then filter for shorts in code to avoid index issues
    const shortsQuery = query(
      collection(db, 'creatorVideos'),
      orderBy('addedToWiz', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(shortsQuery, (snapshot) => {
      console.log('🎬 WizShorts: Firestore listener triggered, docs:', snapshot.docs.length);
      
      const shortsData: ShortVideo[] = snapshot.docs
        .map(doc => {
          const data = doc.data();
          console.log('🎬 WizShorts: Processing doc:', doc.id, 'contentType:', data.contentType, 'status:', data.status);
          return { doc, data };
        })
        .filter(({ data }) => {
          // Filter for shorts: either explicitly marked as 'short' OR duration < 60 seconds
          const isExplicitShort = data.contentType === 'short';
          const isDurationBasedShort = data.duration && isShortDuration(data.duration);
          const isActive = data.status === 'active' || !data.status; // Include if status is undefined for backwards compatibility
          
          console.log(`🎬 WizShorts: Checking ${data.title} - contentType: ${data.contentType}, duration: ${data.duration}, isExplicitShort: ${isExplicitShort}, isDurationBasedShort: ${isDurationBasedShort}, isActive: ${isActive}`);
          
          return (isExplicitShort || isDurationBasedShort) && isActive;
        })
        .map(({ doc, data }) => {
          const publishedDate = data.addedToWiz?.toDate() || new Date();
          
          return {
            id: doc.id,
            videoId: data.videoId || doc.id,
            title: data.title || 'Untitled Short',
            creator: data.creatorName || data.channelName || 'Unknown Creator',
            thumbnail: data.thumbnail || `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`,
            views: data.views || '0',
            timeAgo: formatTimeAgo(publishedDate),
            category: data.categoryTags?.[0] || 'Other',
            xpReward: calculateXPReward(data.duration || '0:30'),
            duration: data.duration || '0:30',
            avatar: data.creatorAvatar || data.channelAvatar,
            channelId: data.channelId || data.creatorId,
            contentType: data.contentType,
            creatorName: data.creatorName,
            creatorAvatar: data.creatorAvatar
          };
        })
        .slice(0, 20); // Limit to 20 shorts

      console.log('🎬 WizShorts: Processed shorts data:', shortsData);
      setAllShortsData(shortsData);
      setLoading(false);
    }, (error) => {
      console.error('🎬 WizShorts: Error loading shorts:', error);
      setLoading(false);
    });

    return () => {
      console.log('🎬 WizShorts: Cleaning up Firestore listener');
      unsubscribe();
    };
  }, []);

  // Update card width based on screen size
  useEffect(() => {
    const updateCardWidth = () => {
      const screenWidth = window.innerWidth;
      
      if (screenWidth >= 1280) {
        // Desktop XL: 5 cards
        setCardWidth(`${Math.min(280, (screenWidth - 200) / 5)}px`);
      } else if (screenWidth >= 1024) {
        // Desktop: 5 cards
        setCardWidth(`${Math.min(240, (screenWidth - 180) / 5)}px`);
      } else if (screenWidth >= 768) {
        // Tablet: 3 cards
        setCardWidth(`${Math.min(260, (screenWidth - 140) / 3)}px`);
      } else {
        // Mobile: 2 cards
        setCardWidth(`${Math.min(220, (screenWidth - 100) / 2)}px`);
      }
    };

    updateCardWidth();
    window.addEventListener('resize', updateCardWidth);
    return () => window.removeEventListener('resize', updateCardWidth);
  }, []);

  const handleVideoClick = (video: ShortVideo) => {
    // Navigate to the shorts page with the specific short ID
    navigate(`/shorts/${video.id}`);
  };

  const closeModal = () => {
    setSelectedVideo(null);
  };

  const handleCreatorClick = (channelId: string | undefined, creatorName: string) => {
    if (channelId) {
      navigate(`/creator/${channelId}`);
    } else {
      console.warn('No channelId provided for creator:', creatorName);
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -400, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 400, behavior: 'smooth' });
    }
  };

  // Mobile grid navigation
  const nextPage = () => {
    const maxPages = Math.ceil(allShortsData.length / 4) - 1;
    setCurrentPage(prev => (prev < maxPages ? prev + 1 : prev));
  };

  const prevPage = () => {
    setCurrentPage(prev => (prev > 0 ? prev - 1 : prev));
  };

  // Get current shorts for mobile grid
  const getCurrentPageShorts = () => {
    const startIndex = currentPage * 4;
    return allShortsData.slice(startIndex, startIndex + 4);
  };

  // Touch/Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setStartX(e.touches[0].pageX);
    setIsDown(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDown) return;
    e.preventDefault();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!isDown) return;
    setIsDown(false);
    const endX = e.changedTouches[0].pageX;
    const diff = startX - endX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        scrollRight();
      } else {
        scrollLeft();
      }
    }
  };

  // Don't render anything if no shorts available and not loading
  if (!loading && allShortsData.length === 0) {
    return null;
  }

  return (
    <>
      {/* Shorts Section - Match Latest Videos */}
      <div className="relative mb-8 sm:mb-12">
          {/* Section Header - Match Latest Videos Style */}
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 
              className="text-lg sm:text-2xl font-bold"
              style={{
                background: 'linear-gradient(135deg, #e879f9 0%, #a855f7 30%, #6366f1 70%, #c4b5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 4px 12px rgba(168, 85, 247, 0.4))'
              }}
            >
              Shorts
            </h3>
            
            {/* Navigation Controls - Match Latest Videos Style */}
            <div className="hidden sm:flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={scrollLeft}
                className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-wiz-primary/10 rounded-full"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={scrollRight}
                className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-wiz-primary/10 rounded-full"
              >
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-wiz-primary"></div>
            </div>
          ) : (
          <>
          {/* Mobile: 4-Panel Grid */}
          {isMobile ? (
            <div className="px-3">
              <div className="grid grid-cols-2 gap-3 mb-4">
                {getCurrentPageShorts().map((short) => {
                  const categoryColor = getCategoryColor(short.category);
                  return (
                    <div key={short.id} className="group">
                      <div 
                        className="aspect-[9/16] overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer rounded-2xl"
                        style={{
                          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                          backdropFilter: 'blur(8px)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
                        }}
                        onClick={() => handleVideoClick(short)}
                      >
                        <div className="relative h-full">
                          {/* Background Image */}
                          <div 
                            className="w-full h-full bg-cover bg-center"
                            style={{ 
                              backgroundImage: `url(${short.thumbnail})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center'
                            }}
                          />
                          
                          {/* Gradient Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                          
                          {/* Category Badge - Top Left */}
                          <div className="absolute top-2 left-2 z-20">
                            <div className="px-2 py-1 text-xs font-bold text-white uppercase tracking-wide rounded-lg"
                                 style={{
                                   background: `linear-gradient(135deg, ${categoryColor.from} 0%, ${categoryColor.to} 100%)`,
                                   boxShadow: `0 2px 8px ${categoryColor.from}40`
                                 }}>
                              {short.category}
                            </div>
                          </div>

                          {/* XP Badge - Top Right */}
                          <div className="absolute top-2 right-2 z-20">
                            <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold"
                                 style={{
                                   background: 'radial-gradient(circle, rgba(255, 215, 0, 0.9) 0%, rgba(255, 165, 0, 0.8) 100%)',
                                   color: '#1F2937',
                                   boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
                                 }}>
                              <Zap className="w-3 h-3" />
                              <span>{short.xpReward}</span>
                            </div>
                          </div>

                          {/* Duration - Bottom Right */}
                          <div className="absolute bottom-2 right-2 z-20 px-2 py-1 bg-black/70 rounded-md text-xs text-white font-semibold">
                            {short.duration}
                          </div>

                          {/* Play Button Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <Button
                              size="sm"
                              className="w-12 h-12 rounded-full p-0 shadow-xl"
                              style={{
                                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)',
                                backdropFilter: 'blur(10px)',
                                border: '2px solid rgba(255, 255, 255, 0.3)'
                              }}
                            >
                              <Play className="w-4 h-4 text-white fill-current ml-0.5" />
                            </Button>
                          </div>

                          {/* Content at Bottom */}
                          <div className="absolute bottom-0 left-0 right-0 p-3 text-white z-10">
                            <h4 className="text-sm font-bold mb-1 line-clamp-2 leading-tight">
                              {short.title}
                            </h4>
                            
                            {/* Creator Profile - Below title */}
                            {short.avatar && (
                              <div className="flex items-center space-x-1.5 mb-1 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                                   onClick={(e) => {
                                     e.stopPropagation();
                                     handleCreatorClick(short.channelId, short.creator);
                                   }}>
                                <div className="w-5 h-5 rounded-full overflow-hidden border border-white/30 hover:border-white/50 hover:scale-105 transition-all duration-200">
                                  <img 
                                    src={short.avatar} 
                                    alt={`${short.creator}'s profile`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="font-medium text-xs truncate hover:text-gray-200 transition-colors duration-200">
                                  {short.creator}
                                </span>
                              </div>
                            )}
                            
                            {/* Views - Keep original position */}
                            <div className="text-xs opacity-90">{short.views} views</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Navigation */}
              <div className="flex items-center justify-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prevPage}
                  disabled={currentPage === 0}
                  className="h-8 w-8 p-0 rounded-full disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <span className="text-sm text-gray-600">
                  {currentPage + 1} / {Math.ceil(allShortsData.length / 4)}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextPage}
                  disabled={currentPage >= Math.ceil(allShortsData.length / 4) - 1}
                  className="h-8 w-8 p-0 rounded-full disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            /* Desktop: Horizontal Carousel */
            <div
              ref={scrollRef}
              className="flex space-x-3 sm:space-x-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth px-2 sm:px-0"
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none'
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              {allShortsData.map((short, index) => {
                const categoryColor = getCategoryColor(short.category);

                return (
                  <div key={short.id} className="flex-shrink-0 w-48 sm:w-56 group">
                  <div 
                    className="h-80 sm:h-96 overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
                    }}
                    onClick={() => handleVideoClick(short)}
                  >
                    <div className="p-0 h-full flex flex-col">
                      {/* Thumbnail Section - Portrait aspect ratio */}
                      <div className="relative h-64 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden"
                           style={{ borderRadius: '20px 20px 0 0' }}>
                        
                        {/* Background Image */}
                        <div 
                          className="w-full h-full bg-cover bg-center"
                          style={{ 
                            backgroundImage: `url(${short.thumbnail})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        />
                        
                        {/* Category Badge - Top Left */}
                        <div className="absolute top-3 left-3 z-20">
                          <div className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wide rounded-xl"
                               style={{
                                 background: `linear-gradient(135deg, ${categoryColor.from} 0%, ${categoryColor.to} 100%)`,
                                 boxShadow: `0 4px 12px ${categoryColor.from}40`
                               }}>
                            {short.category}
                          </div>
                        </div>

                        {/* XP Badge - Top Right */}
                        <div className="absolute top-3 right-3 z-20">
                          <div className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold"
                               style={{
                                 background: 'radial-gradient(circle, rgba(255, 215, 0, 0.9) 0%, rgba(255, 165, 0, 0.8) 100%)',
                                 color: '#1F2937',
                                 boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
                               }}>
                            <Zap className="w-3 h-3" />
                            <span>{short.xpReward}</span>
                          </div>
                        </div>

                        {/* Duration - Bottom Right */}
                        <div className="absolute bottom-3 right-3 z-20 px-2 py-1 bg-black/70 rounded-lg text-xs text-white font-semibold">
                          {short.duration}
                        </div>

                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Button
                            size="lg"
                            className="w-16 h-16 rounded-full p-0 shadow-2xl"
                            style={{
                              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)',
                              backdropFilter: 'blur(10px)',
                              border: '2px solid rgba(255, 255, 255, 0.3)'
                            }}
                          >
                            <Play className="w-6 h-6 text-white fill-current ml-1" />
                          </Button>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div className="p-4 flex-1">
                        <h4 className="text-sm font-bold text-slate-800 mb-2 line-clamp-2 leading-tight">
                          {short.title}
                        </h4>
                        
                        {/* Creator Profile - Below title */}
                        {short.avatar && (
                          <div className="flex items-center space-x-2 mb-2 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleCreatorClick(short.channelId, short.creator);
                               }}>
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200/50 hover:border-slate-300 hover:scale-105 transition-all duration-200">
                              <img 
                                src={short.avatar} 
                                alt={`${short.creator}'s profile`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-sm text-slate-600 font-medium hover:text-slate-800 transition-colors duration-200">
                              {short.creator}
                            </span>
                          </div>
                        )}
                        
                        {/* Views & Time - Keep original position */}
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{short.views} views</span>
                          <span>{short.timeAgo}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}
          </>
          )}
        </div>

        {/* Video Player Panel */}
      <VideoPanel
        videoId={selectedVideo?.videoId || ''}
        title={selectedVideo?.title || ''}
        creator={selectedVideo?.creator || ''}
        xpReward={selectedVideo?.xpReward || 0}
        isOpen={!!selectedVideo}
        onClose={closeModal}
        onReward={(xp: number) => {
          console.log(`🎯 WizShorts: Earned ${xp} XP for watching ${selectedVideo?.title}`);
          
          // Update both XP systems to ensure progress bar updates immediately
          addXp(xp); // Update XP context immediately for instant UI feedback
          addXP(xp); // Update auth context for persistence
          
          // Show success toast notification
          toast({
            title: "🎉 XP Earned!",
            description: `You earned +${xp} XP! Your current level: Level ${level}`,
            duration: 4000,
          });
        }}
      />
    </>
  );
};