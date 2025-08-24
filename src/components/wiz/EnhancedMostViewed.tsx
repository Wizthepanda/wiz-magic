import { useState } from 'react';
import { Play, Crown, Zap, ChevronLeft, ChevronRight, X, Heart, Share2, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Enhanced Most Viewed data with landscape format
const mostViewedVideos = [
  {
    id: 1,
    title: 'The Future of AI: Complete Guide',
    creator: 'TechVision',
    thumbnail: 'https://img.youtube.com/vi/2M4asXviuoo/maxresdefault.jpg',
    views: '2.3M',
    duration: '18:45',
    xpReward: 250,
    category: 'AI',
    ranking: 1,
    videoId: '2M4asXviuoo'
  },
  {
    id: 2,
    title: 'Master React in 2024: Advanced Patterns',
    creator: 'CodeGenius',
    thumbnail: 'https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
    views: '1.8M',
    duration: '25:30',
    xpReward: 320,
    category: 'Tech',
    ranking: 2,
    videoId: 'ScMzIvxBSi4'
  },
  {
    id: 3,
    title: 'Millionaire Mindset: Wealth Building Secrets',
    creator: 'WealthMaster',
    thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
    views: '1.5M',
    duration: '22:15',
    xpReward: 280,
    category: 'Money',
    ranking: 3,
    videoId: 'jNQXAC9IVRw'
  },
  {
    id: 4,
    title: 'Music Production Masterclass',
    creator: 'BeatKing',
    thumbnail: 'https://img.youtube.com/vi/ZbZSe6N_BXs/maxresdefault.jpg',
    views: '1.2M',
    duration: '32:20',
    xpReward: 400,
    category: 'Music',
    ranking: 4,
    videoId: 'ZbZSe6N_BXs'
  },
  {
    id: 5,
    title: 'Transform Your Health in 30 Days',
    creator: 'FitnessGuru',
    thumbnail: 'https://img.youtube.com/vi/2M4asXviuoo/maxresdefault.jpg',
    views: '980K',
    duration: '28:40',
    xpReward: 360,
    category: 'Health',
    ranking: 5,
    videoId: '2M4asXviuoo'
  },
  {
    id: 6,
    title: 'Blockchain Revolution: DeFi Explained',
    creator: 'CryptoExpert',
    thumbnail: 'https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
    views: '875K',
    duration: '19:55',
    xpReward: 240,
    category: 'Money',
    ranking: 6,
    videoId: 'ScMzIvxBSi4'
  }
];

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
  const [selectedVideo, setSelectedVideo] = useState<null | typeof mostViewedVideos[0]>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleVideoClick = (video: typeof mostViewedVideos[0]) => {
    setSelectedVideo(video);
  };

  const closeModal = () => {
    setSelectedVideo(null);
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
            {mostViewedVideos.map((video, index) => {
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
                        <p className="text-sm text-slate-600 mb-3 font-medium">
                          {video.creator}
                        </p>
                        <div className="flex items-center justify-between mb-3">
                          <Badge className="px-3 py-1 text-xs font-bold text-white uppercase tracking-wide"
                                 style={{
                                   background: `linear-gradient(135deg, ${categoryColor.from} 0%, ${categoryColor.to} 100%)`,
                                   borderRadius: '12px',
                                   boxShadow: `0 4px 12px ${categoryColor.shadow}`
                                 }}>
                            {video.category}
                          </Badge>
                          <span className="text-sm text-slate-500 font-medium">{video.views} views</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      {/* Enhanced Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              background: 'rgba(0, 0, 0, 0.85)',
              backdropFilter: 'blur(25px)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="relative w-full max-w-4xl mx-4"
              style={{
                aspectRatio: '16/9',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(30px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.5)'
              }}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={closeModal}
                className="absolute top-6 right-6 z-10 p-3 rounded-full text-white"
                style={{
                  background: 'rgba(0, 0, 0, 0.6)',
                  backdropFilter: 'blur(15px)'
                }}
              >
                <X className="w-6 h-6" />
              </button>

              {/* Video Content */}
              <div className="w-full h-full rounded-3xl overflow-hidden">
                <div 
                  className="w-full h-full bg-cover bg-center relative"
                  style={{ 
                    backgroundImage: `url(${selectedVideo.thumbnail})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  {/* Play Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                      className="w-32 h-32 rounded-full flex items-center justify-center text-white cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
                        boxShadow: '0 16px 64px rgba(168, 85, 247, 0.5)'
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-16 h-16 fill-current ml-2" />
                    </motion.div>
                  </div>

                  {/* Bottom Info Panel */}
                  <div className="absolute bottom-0 left-0 right-0 p-8">
                    <div
                      className="rounded-2xl p-6 text-white"
                      style={{
                        background: 'rgba(0, 0, 0, 0.7)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-2">{selectedVideo.title}</h3>
                          <div className="flex items-center justify-between text-lg text-gray-300 mb-4">
                            <span>{selectedVideo.creator}</span>
                            <span className="text-yellow-400 font-semibold">+{selectedVideo.xpReward} XP</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-center space-x-6">
                        <Button
                          size="lg"
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-8 py-3"
                        >
                          <Heart className="w-5 h-5 mr-3" />
                          Like
                        </Button>
                        <Button
                          size="lg"
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-8 py-3"
                        >
                          <Share2 className="w-5 h-5 mr-3" />
                          Share
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};