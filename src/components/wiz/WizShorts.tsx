import { useState, useRef, useEffect } from 'react';
import { Play, ChevronLeft, ChevronRight, X, Heart, Share2, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

// Types
interface ShortVideo {
  id: number;
  title: string;
  creator: string;
  thumbnail: string;
  views: string;
  timeAgo: string;
  category: string;
  xpReward: number;
  duration: string;
  videoId: string;
}

// Flattened shorts data for unified carousel
const allShortsData: ShortVideo[] = [
  // AI Shorts
  {
    id: 1,
    title: 'Quick AI Tip',
    creator: 'TechGuru',
    thumbnail: 'https://img.youtube.com/vi/2M4asXviuoo/maxresdefault.jpg',
    views: '45K',
    timeAgo: '12h',
    category: 'AI',
    xpReward: 15,
    duration: '0:15',
    videoId: '2M4asXviuoo'
  },
  {
    id: 2,
    title: 'ML in 30 Seconds',
    creator: 'AIWizard',
    thumbnail: 'https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
    views: '89K',
    timeAgo: '8h',
    category: 'AI',
    xpReward: 18,
    duration: '0:30',
    videoId: 'ScMzIvxBSi4'
  },
  {
    id: 7,
    title: 'React Quick Tip',
    creator: 'CodeMaster',
    thumbnail: 'https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
    views: '92K',
    timeAgo: '8h',
    category: 'Tech',
    xpReward: 18,
    duration: '0:45',
    videoId: 'ScMzIvxBSi4'
  },
  {
    id: 19,
    title: 'Money Hack #1',
    creator: 'WealthWiz',
    thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
    views: '128K',
    timeAgo: '1d',
    category: 'Money',
    xpReward: 20,
    duration: '0:30',
    videoId: 'jNQXAC9IVRw'
  },
  {
    id: 13,
    title: 'Beat Making 101',
    creator: 'MusicPro',
    thumbnail: 'https://img.youtube.com/vi/ZbZSe6N_BXs/maxresdefault.jpg',
    views: '67K',
    timeAgo: '6h',
    category: 'Music',
    xpReward: 22,
    duration: '0:20',
    videoId: 'ZbZSe6N_BXs'
  },
  {
    id: 3,
    title: 'Neural Networks Explained',
    creator: 'DeepMind',
    thumbnail: 'https://img.youtube.com/vi/2M4asXviuoo/maxresdefault.jpg',
    views: '156K',
    timeAgo: '1d',
    category: 'AI',
    xpReward: 22,
    duration: '0:45',
    videoId: '2M4asXviuoo'
  },
  {
    id: 25,
    title: 'Health Hack',
    creator: 'FitWiz',
    thumbnail: 'https://img.youtube.com/vi/2M4asXviuoo/maxresdefault.jpg',
    views: '34K',
    timeAgo: '4h',
    category: 'Health',
    xpReward: 16,
    duration: '0:25',
    videoId: '2M4asXviuoo'
  },
  {
    id: 8,
    title: 'CSS Grid Magic',
    creator: 'WebDev',
    thumbnail: 'https://img.youtube.com/vi/2M4asXviuoo/maxresdefault.jpg',
    views: '78K',
    timeAgo: '6h',
    category: 'Tech',
    xpReward: 16,
    duration: '0:30',
    videoId: '2M4asXviuoo'
  },
  {
    id: 20,
    title: 'Crypto Update',
    creator: 'CryptoKing',
    thumbnail: 'https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
    views: '156K',
    timeAgo: '2h',
    category: 'Money',
    xpReward: 25,
    duration: '0:35',
    videoId: 'ScMzIvxBSi4'
  },
  {
    id: 14,
    title: 'Guitar Riff Tutorial',
    creator: 'StringMaster',
    thumbnail: 'https://img.youtube.com/vi/2M4asXviuoo/maxresdefault.jpg',
    views: '123K',
    timeAgo: '1d',
    category: 'Music',
    xpReward: 24,
    duration: '0:35',
    videoId: '2M4asXviuoo'
  },
  {
    id: 4,
    title: 'ChatGPT Hack',
    creator: 'PromptPro',
    thumbnail: 'https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
    views: '203K',
    timeAgo: '2d',
    category: 'AI',
    xpReward: 25,
    duration: '0:20',
    videoId: 'ScMzIvxBSi4'
  },
  {
    id: 26,
    title: 'Productivity Hack',
    creator: 'LifeHacker',
    thumbnail: 'https://img.youtube.com/vi/ZbZSe6N_BXs/maxresdefault.jpg',
    views: '203K',
    timeAgo: '1h',
    category: 'Health',
    xpReward: 24,
    duration: '0:50',
    videoId: 'ZbZSe6N_BXs'
  },
  {
    id: 9,
    title: 'JavaScript Tricks',
    creator: 'JSNinja',
    thumbnail: 'https://img.youtube.com/vi/ScMzIvxBSi4/maxresdefault.jpg',
    views: '134K',
    timeAgo: '12h',
    category: 'Tech',
    xpReward: 21,
    duration: '0:40',
    videoId: 'ScMzIvxBSi4'
  },
  {
    id: 21,
    title: 'Investment Strategy',
    creator: 'FinanceGuru',
    thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/maxresdefault.jpg',
    views: '89K',
    timeAgo: '6h',
    category: 'Money',
    xpReward: 22,
    duration: '0:50',
    videoId: 'jNQXAC9IVRw'
  },
  {
    id: 15,
    title: 'Mix & Master Tips',
    creator: 'AudioEngineer',
    thumbnail: 'https://img.youtube.com/vi/ZbZSe6N_BXs/maxresdefault.jpg',
    views: '89K',
    timeAgo: '8h',
    category: 'Music',
    xpReward: 20,
    duration: '0:45',
    videoId: 'ZbZSe6N_BXs'
  },
  {
    id: 5,
    title: 'AI Art Generator',
    creator: 'CreativeAI',
    thumbnail: 'https://img.youtube.com/vi/2M4asXviuoo/maxresdefault.jpg',
    views: '67K',
    timeAgo: '3h',
    category: 'AI',
    xpReward: 16,
    duration: '0:35',
    videoId: '2M4asXviuoo'
  }
];

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
  const [selectedVideo, setSelectedVideo] = useState<ShortVideo | null>(null);
  const [startX, setStartX] = useState(0);
  const [isDown, setIsDown] = useState(false);
  const [cardWidth, setCardWidth] = useState('220px');
  const scrollRef = useRef<HTMLDivElement>(null);

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
    setSelectedVideo(video);
  };

  const closeModal = () => {
    setSelectedVideo(null);
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

          {/* Unified Horizontal Carousel - Match Latest Videos */}
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
                        <p className="text-xs text-slate-600 mb-2">
                          {short.creator}
                        </p>
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
        </div>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{
              background: 'rgba(0, 0, 0, 0.8)',
              backdropFilter: 'blur(20px)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className="relative w-full max-w-md mx-4"
              style={{
                aspectRatio: '9/16',
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(25px)',
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
                className="absolute top-4 right-4 z-10 p-2 rounded-full text-white"
                style={{
                  background: 'rgba(0, 0, 0, 0.5)',
                  backdropFilter: 'blur(10px)'
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
                      className="w-20 h-20 rounded-full flex items-center justify-center text-white cursor-pointer"
                      style={{
                        background: 'linear-gradient(135deg, #a855f7 0%, #06b6d4 100%)',
                        boxShadow: '0 8px 32px rgba(168, 85, 247, 0.5)'
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Play className="w-10 h-10 fill-current ml-1" />
                    </motion.div>
                  </div>

                  {/* Bottom Info */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div
                      className="rounded-2xl p-4 text-white"
                      style={{
                        background: 'rgba(0, 0, 0, 0.6)',
                        backdropFilter: 'blur(15px)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }}
                    >
                      <h3 className="text-lg font-bold mb-2">{selectedVideo.title}</h3>
                      <div className="flex items-center justify-between text-sm text-gray-300 mb-3">
                        <span>{selectedVideo.creator}</span>
                        <span>+{selectedVideo.xpReward} XP</span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-center space-x-4">
                        <Button
                          size="sm"
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        >
                          <Heart className="w-4 h-4 mr-2" />
                          Like
                        </Button>
                        <Button
                          size="sm"
                          className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                        >
                          <Share2 className="w-4 h-4 mr-2" />
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