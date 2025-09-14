import { useState, useRef } from 'react';
import { Crown, Star, Play, Sparkles, ChevronLeft, ChevronRight, Award, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSafeNavigate } from '@/hooks/useSafeNavigate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Creator profile data for WIZ Premiere
interface PremiereCreator {
  id: string;
  name: string;
  username: string;
  specialty: string;
  avatar: string;
  posterArt: string;
  premiereProject: {
    title: string;
    category: string;
    duration: string;
    rating: number;
    views: string;
  };
  social?: {
    twitter?: string;
    instagram?: string;
  };
}

const premiereCreators: PremiereCreator[] = [
  {
    id: 'fera',
    name: 'FERA',
    username: '@imagineFERA',
    specialty: 'AI Animator',
    avatar: '/Profile Pics/FERA.jpg',
    posterArt: '/assets/premiere/fera-poster.jpg',
    premiereProject: {
      title: 'Digital Dreams',
      category: 'AI Animation',
      duration: '12:34',
      rating: 4.9,
      views: '2.1M'
    },
    social: {
      twitter: 'https://x.com/imagineFERA'
    }
  },
  {
    id: 'captain-hahaa',
    name: 'Captain HaHaa',
    username: '@CaptainHaHaa',
    specialty: 'AI Animator',
    avatar: '/Profile Pics/Captain Hahaa.jpg',
    posterArt: '/assets/premiere/captain-poster.jpg',
    premiereProject: {
      title: 'Cosmic Adventures',
      category: 'Gaming Animation',
      duration: '15:22',
      rating: 4.8,
      views: '1.8M'
    },
    social: {
      twitter: 'https://x.com/CaptainHaHaa'
    }
  },
  {
    id: 'royal-kongz',
    name: 'RoyalKongz',
    username: '@RoyalKongz',
    specialty: 'AI Animator',
    avatar: '/Profile Pics/RoyalKongz.jpg',
    posterArt: '/assets/premiere/royal-poster.jpg',
    premiereProject: {
      title: 'Urban Legends',
      category: 'Digital Art',
      duration: '18:45',
      rating: 4.9,
      views: '3.2M'
    },
    social: {
      twitter: 'https://x.com/RoyalKongz'
    }
  },
  {
    id: 'alexandria',
    name: 'Alexandria',
    username: '@AleRVG',
    specialty: 'AI Animator',
    avatar: '/Profile Pics/Ale.jpg',
    posterArt: '/assets/premiere/ale-poster.jpg',
    premiereProject: {
      title: 'Tech Prophecies',
      category: 'Tech Innovation',
      duration: '14:17',
      rating: 4.7,
      views: '1.5M'
    },
    social: {
      twitter: 'https://x.com/AleRVG'
    }
  },
  {
    id: 'bogdan',
    name: 'Bogdan',
    username: '@SMKP_Films',
    specialty: 'AI Animator',
    avatar: '/Profile Pics/Bogdan.jpg',
    posterArt: '/assets/premiere/bogdan-poster.jpg',
    premiereProject: {
      title: 'Cinematic Visions',
      category: 'Film & Photography',
      duration: '20:03',
      rating: 4.8,
      views: '2.7M'
    },
    social: {
      twitter: 'https://x.com/SMKP_Films'
    }
  },
  {
    id: 'madpencil',
    name: 'MadPencil',
    username: '@madpencil_',
    specialty: 'AI Animator',
    avatar: '/Profile Pics/MadPencil.jpg',
    posterArt: '/assets/premiere/madpencil-poster.jpg',
    premiereProject: {
      title: 'Abstract Realities',
      category: 'Art & Design',
      duration: '16:28',
      rating: 4.9,
      views: '1.9M'
    },
    social: {
      twitter: 'https://x.com/madpencil_'
    }
  }
];

// Floating particles component for cinematic effect
const FloatingParticles = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-gradient-to-r from-purple-400 to-violet-600 rounded-full opacity-30"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          transition={{
            duration: 8 + Math.random() * 4,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  );
};

export const WizPremiere = () => {
  const navigate = useSafeNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCreator, setSelectedCreator] = useState<PremiereCreator | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleCreatorClick = (creator: PremiereCreator) => {
    setSelectedCreator(creator);
    // Navigate to premiere content or open spotlight
    // For now, just console log
    console.log('🎬 Opening creator spotlight for:', creator.name);
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -320, behavior: 'smooth' });
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 320, behavior: 'smooth' });
      setCurrentIndex(Math.min(premiereCreators.length - 1, currentIndex + 1));
    }
  };

  return (
    <div className="relative mb-8 sm:mb-12">
      {/* Floating particles for cinematic effect */}
      <FloatingParticles />
      
      {/* Section Header */}
      <div className="text-center mb-6 sm:mb-8 px-4 sm:px-0">
        <div className="relative">
          {/* Glowing background effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-violet-600/30 to-purple-500/20 blur-3xl rounded-full scale-150"></div>
          
          {/* Main title */}
          <div className="relative">
            <h2 
              className="text-2xl sm:text-4xl lg:text-5xl font-bold mb-2"
              style={{
                background: 'linear-gradient(135deg, #a855f7 0%, #8b5cf6 30%, #7c3aed 70%, #c4b5fd 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 4px 16px rgba(168, 85, 247, 0.4))'
              }}
            >
              WIZ Premiere
            </h2>
            
            {/* Subtitle */}
            <p className="text-sm sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Hollywood-level AI animations by visionary creators
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Controls - Desktop */}
      <div className="hidden sm:flex justify-end space-x-2 mb-4 px-4 sm:px-0">
        <Button
          variant="outline"
          size="sm"
          onClick={scrollLeft}
          className="h-10 w-10 p-0 hover:bg-purple-100 rounded-full border-purple-200/50"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={scrollRight}
          className="h-10 w-10 p-0 hover:bg-purple-100 rounded-full border-purple-200/50"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Desktop: Horizontal scrolling cards */}
      <div
        ref={carouselRef}
        className="hidden sm:flex space-x-4 sm:space-x-6 overflow-x-auto scrollbar-hide pb-4 scroll-smooth px-4 sm:px-0"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {premiereCreators.map((creator, index) => (
          <motion.div
            key={creator.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.6 }}
            className="flex-shrink-0 relative group cursor-pointer"
            style={{
              width: '280px',
              marginTop: index % 2 === 0 ? '0' : '20px', // Staggered effect for desktop
            }}
            onClick={() => handleCreatorClick(creator)}
          >
            {/* Card with layered depth */}
            <div 
              className="relative h-96 sm:h-[420px] rounded-3xl overflow-hidden transition-all duration-700 group-hover:scale-105 group-hover:-translate-y-2"
              style={{
                background: `
                  linear-gradient(135deg, 
                    rgba(255, 255, 255, 0.95) 0%, 
                    rgba(248, 250, 252, 0.9) 50%,
                    rgba(240, 242, 247, 0.95) 100%
                  )
                `,
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(168, 85, 247, 0.2)',
                boxShadow: `
                  0 8px 32px rgba(168, 85, 247, 0.15),
                  0 2px 8px rgba(0, 0, 0, 0.05),
                  inset 0 1px 0 rgba(255, 255, 255, 0.8)
                `,
                transform: 'translateZ(0)', // Hardware acceleration
              }}
            >
              {/* Premiere Badge */}
              <div className="absolute top-4 right-4 z-20">
                <Badge 
                  className="px-3 py-1 text-xs font-bold text-black"
                  style={{
                    background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                    boxShadow: '0 4px 12px rgba(251, 191, 36, 0.4)',
                    borderRadius: '12px'
                  }}
                >
                  <Crown className="w-3 h-3 mr-1" />
                  PREMIERE
                </Badge>
              </div>

              {/* Main poster/artwork area */}
              <div className="relative h-64 overflow-hidden"
                   style={{ borderRadius: '24px 24px 0 0' }}>
                
                {/* Fallback gradient background */}
                <div 
                  className="w-full h-full"
                  style={{
                    background: `linear-gradient(135deg, 
                      rgba(168, 85, 247, 0.8) 0%, 
                      rgba(139, 92, 246, 0.9) 50%,
                      rgba(124, 58, 237, 0.8) 100%
                    )`
                  }}
                />
                
                {/* Creator avatar - floating in the design */}
                <div className="absolute top-6 left-6 z-10">
                  <div 
                    className="w-16 h-16 rounded-full overflow-hidden"
                    style={{
                      border: '3px solid rgba(255, 255, 255, 0.8)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <img 
                      src={creator.avatar} 
                      alt={creator.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Play overlay - appears on hover */}
                <div className="absolute inset-0 flex items-center justify-center z-15 opacity-0 group-hover:opacity-100 transition-all duration-500">
                  <div 
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{
                      background: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
                    }}
                  >
                    <Play className="w-8 h-8 text-purple-600 fill-current ml-1" />
                  </div>
                </div>

                {/* Abstract floating elements */}
                <div className="absolute inset-0 pointer-events-none">
                  <div 
                    className="absolute top-20 right-8 w-12 h-12 rounded-full opacity-30"
                    style={{
                      background: 'radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%)',
                      filter: 'blur(4px)'
                    }}
                  />
                  <div 
                    className="absolute bottom-16 left-20 w-8 h-8 rounded-full opacity-20"
                    style={{
                      background: 'radial-gradient(circle, rgba(251, 191, 36, 0.8) 0%, transparent 70%)',
                      filter: 'blur(2px)'
                    }}
                  />
                </div>
              </div>

              {/* Content area with overlay gradient for text readability */}
              <div 
                className="relative p-6 h-32"
                style={{
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.8) 100%)'
                }}
              >
                {/* Creator info */}
                <div className="text-white">
                  <h3 className="text-lg font-bold mb-1">{creator.name}</h3>
                  <p className="text-purple-200 text-sm mb-2">{creator.specialty}</p>
                  
                  {/* Project details */}
                  <div className="flex items-center justify-between text-xs text-gray-300">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        <span>{creator.premiereProject.rating}</span>
                      </div>
                      <span>{creator.premiereProject.views} views</span>
                    </div>
                    <span>{creator.premiereProject.duration}</span>
                  </div>
                </div>

                {/* Sparkles animation on hover */}
                <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      style={{
                        left: `${20 + i * 30}%`,
                        top: `${10 + i * 20}%`
                      }}
                      animate={{
                        scale: [0, 1, 0],
                        rotate: [0, 180, 360],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: i * 0.3
                      }}
                    >
                      <Sparkles className="w-4 h-4 text-yellow-400" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Subtle glow effect on hover */}
            <div 
              className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                filter: 'blur(20px)',
                transform: 'scale(1.1)',
                zIndex: -1
              }}
            />
          </motion.div>
        ))}
      </div>


      {/* Mobile Creator Profile Cards - Clean Vertical List */}
      <div className="px-4 sm:hidden">
        <div className="mt-6 flex flex-col space-y-4 mb-6">
          {premiereCreators.map((creator) => (
            <motion.a
              key={creator.id}
              href={creator.social?.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-white/5 rounded-xl shadow-sm hover:bg-white/10 transition-colors duration-200"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Avatar className="size-12">
                <AvatarImage src={creator.avatar} alt={creator.name} />
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-violet-600 text-white font-semibold">
                  {creator.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-base font-semibold text-purple-600 truncate">
                  {creator.name}
                </p>
                <p className="text-sm text-gray-600">
                  {creator.specialty}
                </p>
              </div>
            </motion.a>
          ))}
        </div>
      </div>

      {/* Watch Trailer Button - Mobile Only */}
      <div className="flex justify-center mt-0 sm:mt-12 sm:hidden">
        <motion.button
          className="px-8 py-3 text-white font-semibold rounded-2xl flex items-center space-x-2"
          style={{
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            boxShadow: '0 8px 24px rgba(124, 58, 237, 0.3)',
          }}
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 12px 32px rgba(124, 58, 237, 0.4)'
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            console.log('🎬 Opening WIZ Premiere trailer');
            // Add trailer functionality here
          }}
        >
          <Play className="w-5 h-5" />
          <span>Watch Trailer</span>
        </motion.button>
      </div>

      {/* Mobile scroll indicator - hidden for vertical layout */}
      <div className="hidden">
        <div className="flex space-x-1">
          {premiereCreators.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-purple-500 w-6' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Creator Spotlight Modal - Full screen on mobile */}
      <AnimatePresence>
        {selectedCreator && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedCreator(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Spotlight content */}
              <div className="p-6">
                <div className="text-center mb-6">
                  <img 
                    src={selectedCreator.avatar} 
                    alt={selectedCreator.name}
                    className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-purple-200"
                  />
                  <h3 className="text-2xl font-bold text-gray-900">{selectedCreator.name}</h3>
                  <p className="text-purple-600 font-medium">{selectedCreator.specialty}</p>
                </div>
                
                {/* Project details */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-800">{selectedCreator.premiereProject.title}</h4>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{selectedCreator.premiereProject.category}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span>{selectedCreator.premiereProject.rating}</span>
                    </div>
                  </div>
                  
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white font-semibold py-3 rounded-xl"
                    onClick={() => {
                      console.log('🎬 Playing premiere content for:', selectedCreator.name);
                      setSelectedCreator(null);
                    }}
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Watch Premiere
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};