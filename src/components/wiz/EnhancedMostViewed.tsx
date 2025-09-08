import { useState, useEffect } from 'react';
import { Play, Crown, Zap, ChevronLeft, ChevronRight, X, Heart, Share2, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoPanel } from './VideoPanel';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

// Type definition for most viewed video
interface MostViewedVideo {
  id: string;
  title: string;
  creator: string;
  thumbnail: string;
  views: string | number;
  duration: string;
  xpReward: number;
  category: string;
  ranking: number;
  videoId: string;
  avatar?: string;
  channelId?: string;
  channelName?: string;
  channelAvatar?: string;
  originalUrl?: string;
}

const getCategoryColor = (category: string) => {
  const colors = {
    'AI': { from: '#a855f7', to: '#4f46e5', shadow: 'rgba(168, 85, 247, 0.3)' },
    'Money': { from: '#10b981', to: '#059669', shadow: 'rgba(16, 185, 129, 0.3)' },
    'Tech': { from: '#3b82f6', to: '#0891b2', shadow: 'rgba(59, 130, 246, 0.3)' },
    'Music': { from: '#ec4899', to: '#be185d', shadow: 'rgba(236, 72, 153, 0.3)' },
    'Health': { from: '#f97316', to: '#dc2626', shadow: 'rgba(249, 115, 22, 0.3)' }
  };
  const defaultColor = { from: '#6b7280', to: '#4b5563', shadow: 'rgba(107, 114, 128, 0.3)' };
  return colors[category as keyof typeof colors] || defaultColor;
};

const getRankingColor = (ranking: number) => {
  if (ranking === 1) return { bg: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)', shadow: 'rgba(255, 215, 0, 0.4)' };
  if (ranking === 2) return { bg: 'linear-gradient(135deg, #C0C0C0 0%, #A0A0A0 100%)', shadow: 'rgba(192, 192, 192, 0.4)' };
  if (ranking === 3) return { bg: 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)', shadow: 'rgba(205, 127, 50, 0.4)' };
  return { bg: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)', shadow: 'rgba(107, 114, 128, 0.4)' };
};

export const EnhancedMostViewed = () => {
  const { user, addXP } = useAuth();
  const { level, addXp } = useXp();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedVideo, setSelectedVideo] = useState<null | MostViewedVideo>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mostViewedVideos, setMostViewedVideos] = useState<MostViewedVideo[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to parse and sort by views
  const parseViews = (views: string | number): number => {
    if (typeof views === 'number') return views;
    if (typeof views === 'string') {
      const str = views.toLowerCase();
      let num = parseFloat(str);
      if (str.includes('k')) num *= 1000;
      else if (str.includes('m')) num *= 1000000;
      else if (str.includes('b')) num *= 1000000000;
      return num;
    }
    return 0;
  };

  // Load most viewed videos from Firestore
  useEffect(() => {
    const loadMostViewedVideos = async () => {
      try {
        console.log('🔥 Loading Most Viewed videos from Firestore...');
        
        // Fetch from both collections and combine
        const [videosSnapshot, creatorVideosSnapshot] = await Promise.all([
          getDocs(query(collection(db, 'videos'), limit(20))).catch(err => {
            console.warn('🔥 Videos collection query failed:', err);
            return { docs: [] };
          }),
          getDocs(query(collection(db, 'creatorVideos'), limit(20))).catch(err => {
            console.warn('🔥 CreatorVideos collection query failed:', err);
            return { docs: [] };
          })
        ]);

        const allVideos = [];
        const processedVideoIds = new Set();

        // Process videos collection
        videosSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (!processedVideoIds.has(data.videoId || doc.id)) {
            processedVideoIds.add(data.videoId || doc.id);
            allVideos.push({
              id: data.videoId || doc.id,
              title: data.title || 'Untitled',
              creator: data.channelName || data.creator || 'Unknown Creator',
              thumbnail: data.thumbnail || `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`,
              views: data.views || 0,
              duration: data.duration || '0:00',
              xpReward: Math.floor(Math.random() * 200) + 100, // Random XP between 100-300
              category: data.category || 'tech',
              ranking: 0, // Will be set after sorting
              videoId: data.videoId || doc.id,
              avatar: data.channelAvatar,
              channelId: data.channelId,
              channelName: data.channelName,
              channelAvatar: data.channelAvatar,
              originalUrl: data.originalUrl
            });
          }
        });

        // Process creatorVideos collection
        creatorVideosSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          if (!processedVideoIds.has(data.videoId || doc.id)) {
            processedVideoIds.add(data.videoId || doc.id);
            allVideos.push({
              id: data.videoId || doc.id,
              title: data.title || 'Untitled',
              creator: data.channelName || data.creator || 'Unknown Creator',
              thumbnail: data.thumbnail || `https://img.youtube.com/vi/${data.videoId}/maxresdefault.jpg`,
              views: data.views || 0,
              duration: data.duration || '0:00',
              xpReward: Math.floor(Math.random() * 200) + 100,
              category: data.category || data.categoryTags?.[0] || 'tech',
              ranking: 0,
              videoId: data.videoId || doc.id,
              avatar: data.channelAvatar,
              channelId: data.channelId,
              channelName: data.channelName,
              channelAvatar: data.channelAvatar,
              originalUrl: data.originalUrl
            });
          }
        });

        // Sort by views (descending) and assign rankings
        const sortedVideos = allVideos
          .sort((a, b) => parseViews(b.views) - parseViews(a.views))
          .slice(0, 10) // Top 10 most viewed
          .map((video, index) => ({
            ...video,
            ranking: index + 1
          }));

        console.log('🔥 Loaded and sorted most viewed videos:', sortedVideos.length);
        setMostViewedVideos(sortedVideos);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error loading most viewed videos:', error);
        setLoading(false);
      }
    };

    loadMostViewedVideos();
  }, []);

  const handleVideoClick = (video: MostViewedVideo) => {
    setSelectedVideo(video);
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

  const scrollContainer = () => {
    const container = document.getElementById('enhanced-most-viewed-container');
    return container;
  };

  const scrollLeft = () => {
    const container = scrollContainer();
    if (container) {
      container.scrollBy({ left: -400, behavior: 'smooth' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const scrollRight = () => {
    const container = scrollContainer();
    if (container) {
      container.scrollBy({ left: 400, behavior: 'smooth' });
      setCurrentIndex(Math.min(mostViewedVideos.length - 1, currentIndex + 1));
    }
  };

  return (
    <>
      {/* Enhanced Most Viewed Section - Match Latest Videos */}
      <div className="relative mb-8 sm:mb-12">
          {/* Section Title - Match Latest Videos Style */}
          <div className="flex items-center justify-between mb-4 sm:mb-6 px-2 sm:px-0">
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
              Most Viewed
            </h3>
            
            {/* Navigation Controls - Match Latest Videos */}
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

          {/* Enhanced Cards - Match Latest Videos Style */}
          <div
            id="enhanced-most-viewed-container"
            className="flex space-x-3 sm:space-x-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth px-2 sm:px-0"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="flex-shrink-0 w-80 sm:w-96">
                  <div className="h-96 sm:h-[28rem] bg-gray-200 animate-pulse rounded-2xl"></div>
                </div>
              ))
            ) : mostViewedVideos.length === 0 ? (
              // No videos message
              <div className="flex-shrink-0 w-full text-center py-20">
                <p className="text-gray-500 text-lg">No videos available</p>
              </div>
            ) : (
              mostViewedVideos.map((video, index) => {
              const categoryColor = getCategoryColor(video.category);
              const rankingColor = getRankingColor(video.ranking);

              return (
                <div key={video.id} className="flex-shrink-0 w-80 sm:w-96 group">
                  <div 
                    className="h-96 sm:h-[28rem] overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 cursor-pointer rounded-2xl"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)',
                      backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)'
                    }}
                    onClick={() => handleVideoClick(video)}
                  >
                    <div className="p-0 h-full flex flex-col">
                      {/* Thumbnail Section - Landscape format */}
                      <div className="relative h-60 bg-gradient-to-br from-slate-200 to-slate-300 overflow-hidden"
                           style={{ borderRadius: '20px 20px 0 0' }}>
                        
                        {/* Background Image */}
                        <div 
                          className="w-full h-full bg-cover bg-center"
                          style={{ 
                            backgroundImage: `url(${video.thumbnail})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                          }}
                        />
                        
                        {/* Ranking Badge - Top Left */}
                        <div className="absolute top-3 left-3 z-20">
                          <div 
                            className="flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-bold shadow-lg"
                            style={{
                              background: rankingColor.bg,
                              color: video.ranking <= 3 ? '#000' : '#fff',
                              boxShadow: `0 4px 16px ${rankingColor.shadow}`
                            }}
                          >
                            <Crown className="w-3 h-3" />
                            <span>#{video.ranking}</span>
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
                            <span>{video.xpReward}</span>
                          </div>
                        </div>

                        {/* Duration - Bottom Right */}
                        <div className="absolute bottom-3 right-3 z-20 px-2 py-1 bg-black/70 rounded-lg text-xs text-white font-semibold">
                          {video.duration}
                        </div>


                        {/* Play Button Overlay */}
                        <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <Button
                            size="lg"
                            className="w-20 h-20 rounded-full p-0 shadow-2xl"
                            style={{
                              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)',
                              backdropFilter: 'blur(10px)',
                              border: '2px solid rgba(255, 255, 255, 0.3)'
                            }}
                          >
                            <Play className="w-8 h-8 text-white fill-current ml-1" />
                          </Button>
                        </div>
                      </div>

                      {/* Content Section - Below thumbnail for cleaner layout */}
                      <div className="p-5 flex-1">
                        <h4 className="text-base font-bold text-slate-800 mb-3 line-clamp-2 leading-tight">
                          {video.title}
                        </h4>
                        
                        {/* Creator Profile - Below title */}
                        {(video.avatar || video.channelAvatar) && (
                          <div className="flex items-center space-x-2 mb-3 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleCreatorClick(video.channelId, video.creator);
                               }}>
                            <div className="w-6 h-6 rounded-full overflow-hidden border border-slate-200/50 hover:border-slate-300 hover:scale-105 transition-all duration-200">
                              <img 
                                src={video.avatar || video.channelAvatar} 
                                alt={`${video.creator}'s profile`}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-sm text-slate-600 font-medium hover:text-slate-800 transition-colors duration-200">
                              {video.creator}
                            </span>
                          </div>
                        )}
                        
                        {/* Category Badge & Views - Keep original position */}
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wide"
                                 style={{
                                   background: `linear-gradient(135deg, ${categoryColor.from} 0%, ${categoryColor.to} 100%)`,
                                   borderRadius: '12px',
                                   boxShadow: `0 4px 12px ${categoryColor.shadow}`
                                 }}>
                            {video.category}
                          </Badge>
                          <span className="text-sm text-slate-500 font-medium">
                            {typeof video.views === 'number' 
                              ? video.views.toLocaleString() 
                              : video.views} views
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }))}
          </div>
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
          console.log(`🎯 EnhancedMostViewed: Earned ${xp} XP for watching ${selectedVideo?.title}`);
          
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