import { useState, useEffect } from 'react';
import { Youtube, CheckCircle, Video, Users, Gift, Zap, Play, Eye, ToggleLeft, ToggleRight, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

export const WizActivatePage = () => {
  const { user, connectYouTube, loading } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [featuredVideos, setFeaturedVideos] = useState(new Set());
  const [xpCounter, setXpCounter] = useState(0);

  // Mock YouTube channel data
  const mockChannelData = {
    name: 'WIZ Creator',
    avatar: user?.photoURL || '',
    subscribers: '125K',
    videos: [
      {
        id: '1',
        title: 'Advanced React Patterns for 2025',
        thumbnail: '⚛️',
        duration: '18:45',
        views: '32K'
      },
      {
        id: '2', 
        title: 'Building AI-Powered Applications',
        thumbnail: '🤖',
        duration: '25:30',
        views: '45K'
      },
      {
        id: '3',
        title: 'Crypto Trading Fundamentals',
        thumbnail: '💎',
        duration: '22:15',
        views: '28K'
      },
      {
        id: '4',
        title: 'UI/UX Design Principles',
        thumbnail: '🎨',
        duration: '15:20',
        views: '19K'
      }
    ]
  };

  // Floating XP counter animation
  useEffect(() => {
    const interval = setInterval(() => {
      setXpCounter(prev => (prev + 1) % 1000);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleConnectYouTube = async () => {
    setIsConnecting(true);
    try {
      await connectYouTube();
    } catch (error) {
      console.error('Failed to connect YouTube:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const toggleVideoFeature = (videoId: string) => {
    setFeaturedVideos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const features = [
    {
      icon: Video,
      title: 'Feature Your Content',
      description: 'Showcase your YouTube videos directly inside WIZ\'s Discover and Most Viewed feeds, where die-hard fans can watch and earn XP.'
    },
    {
      icon: Users,
      title: 'Engage Your Fans',
      description: 'Build a deeper connection with your most loyal audience as they level up by watching your videos and tracking their XP progress.'
    },
    {
      icon: Gift,
      title: 'Unlock Exclusive Perks',
      description: 'Turn watch-time engagement into rewards. Give back to your most dedicated fans with exclusive perks, premium content access, and creator-only benefits.'
    }
  ];

  return (
    <div className="relative min-h-full overflow-hidden">
      {/* Minimal gradient background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `
            radial-gradient(circle at 50% 20%, rgba(230, 230, 250, 0.3) 0%, transparent 50%),
            linear-gradient(180deg, rgba(246, 240, 255, 0.4) 0%, rgba(255, 255, 255, 0.95) 100%)
          `
        }}
      />
      
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
        {/* Hero Section */}
        <motion.div 
          className="text-center space-y-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="space-y-6">
            <h1 
              className="text-5xl md:text-6xl font-bold leading-tight"
              style={{
                background: 'linear-gradient(135deg, #C29FFF 0%, #5A2D82 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Activate Your Creator Profile
            </h1>
            
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Connect your YouTube channel and share your content with your most dedicated fans. 
              They'll earn XP for every minute they watch, while unlocking exclusive rewards, 
              free learning opportunities, and access to premium content.
            </p>
          </div>

          {/* Center CTA Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              size="lg"
              onClick={handleConnectYouTube}
              disabled={isConnecting || loading || user?.youtubeConnected}
              className="h-16 px-12 text-lg font-semibold relative overflow-hidden group"
              style={{
                background: user?.youtubeConnected 
                  ? 'linear-gradient(135deg, #22C55E 0%, #16A34A 100%)'
                  : 'linear-gradient(135deg, #FF0000 0%, #CC0000 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '20px',
                boxShadow: '0 8px 32px rgba(255, 0, 0, 0.2)',
                color: 'white'
              }}
            >
              <Youtube className="w-6 h-6 mr-3" />
              {user?.youtubeConnected ? '✅ Connected' : 
               isConnecting ? 'Connecting...' : '🔴 Connect YouTube'}
              
              {/* Hover glow effect */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-20px"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%)',
                  boxShadow: '0 0 40px rgba(194, 159, 255, 0.4)'
                }}
              />
            </Button>
          </motion.div>
        </motion.div>

        {/* Connection Status (Dynamic) */}
        {user?.youtubeConnected && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card 
              className="border-0 shadow-2xl max-w-md mx-auto"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
                backdropFilter: 'blur(20px)',
                borderRadius: '24px',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <CardContent className="p-8">
                <div className="flex items-center space-x-4">
                  <Avatar className="w-16 h-16 border-2 border-white shadow-lg">
                    <AvatarImage src={mockChannelData.avatar} alt={mockChannelData.name} />
                    <AvatarFallback className="bg-gradient-to-r from-purple-400 to-pink-400 text-white font-bold text-xl">
                      {mockChannelData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{mockChannelData.name}</h3>
                    <p className="text-gray-600">{mockChannelData.subscribers} subscribers</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/50 hover:bg-white/70 border-green-200"
                  >
                    <CheckCircle className="w-4 h-4 mr-2 text-green-600" />
                    Connected
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Features & Benefits Section */}
        <motion.div 
          className="space-y-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -8 }}
              >
                <Card 
                  className="border-0 shadow-xl h-full transition-all duration-500 group-hover:shadow-2xl"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(248, 250, 252, 0.6) 100%)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '24px',
                    border: '1px solid rgba(255, 255, 255, 0.3)'
                  }}
                >
                  <CardContent className="p-8 text-center space-y-6">
                    {/* Gradient icon */}
                    <motion.div 
                      className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300"
                      style={{
                        background: `linear-gradient(135deg, 
                          ${index === 0 ? '#C29FFF, #5A2D82' : 
                            index === 1 ? '#3B82F6, #1E40AF' : 
                            '#EC4899, #BE185D'})`
                      }}
                      whileHover={{ scale: 1.1 }}
                      animate={{ 
                        rotate: [0, 2, -2, 0],
                        scale: [1, 1.02, 1]
                      }}
                      transition={{ 
                        duration: 4, 
                        repeat: Infinity,
                        delay: index * 0.5
                      }}
                    >
                      <feature.icon className="w-8 h-8 text-white" />
                    </motion.div>
                    
                    <h3 className="text-xl font-bold text-gray-800">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Video Management Section */}
        {user?.youtubeConnected && (
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <h2 className="text-3xl font-bold text-center text-gray-800">
              Manage Your Featured Videos
            </h2>
            
            <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide">
              {mockChannelData.videos.map((video, index) => (
                <motion.div
                  key={video.id}
                  className="flex-shrink-0 w-80 group"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.1 }}
                >
                  <Card 
                    className="border-0 shadow-xl transition-all duration-300 group-hover:shadow-2xl group-hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
                      backdropFilter: 'blur(20px)',
                      borderRadius: '20px',
                      border: '1px solid rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <CardContent className="p-0">
                      {/* Thumbnail */}
                      <div className="relative h-48 bg-gradient-to-br from-slate-200 to-slate-300 rounded-t-20px flex items-center justify-center text-6xl">
                        {video.thumbnail}
                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded-lg text-xs text-white font-semibold">
                          {video.duration}
                        </div>
                      </div>
                      
                      {/* Content */}
                      <div className="p-6 space-y-4">
                        <h4 className="font-bold text-lg text-gray-800 line-clamp-2 leading-tight">
                          {video.title}
                        </h4>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{video.views} views</span>
                          </div>
                        </div>
                        
                        {/* Feature Toggle */}
                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                          <span className="text-sm font-medium text-gray-700">Feature on WIZ</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleVideoFeature(video.id)}
                            className="p-2 hover:bg-transparent"
                          >
                            {featuredVideos.has(video.id) ? (
                              <ToggleRight className="w-8 h-8 text-green-500" />
                            ) : (
                              <ToggleLeft className="w-8 h-8 text-gray-400" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* XP Transparency Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <Card 
            className="border-0 shadow-xl max-w-2xl mx-auto relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
              backdropFilter: 'blur(20px)',
              borderRadius: '24px',
              border: '1px solid rgba(139, 92, 246, 0.2)'
            }}
          >
            <CardContent className="p-8 text-center space-y-6">
              <div className="flex items-center justify-center space-x-4">
                <motion.div 
                  className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center"
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 3, 
                    repeat: Infinity 
                  }}
                >
                  <Zap className="w-6 h-6 text-white" />
                </motion.div>
                
                <motion.div 
                  className="text-2xl font-bold text-purple-600"
                  key={xpCounter}
                  initial={{ scale: 1.2, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  +{xpCounter} XP
                </motion.div>
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">XP Transparency</h3>
                <p className="text-gray-600">
                  Fans earn XP as they watch your videos — the longer they stay, the more XP they collect. 
                  Rewards are tied only to verified watch-time.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Footer Disclaimer */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <Shield className="w-4 h-4" />
            <span>We only request read-only access to your YouTube content. WIZ never posts, deletes, or modifies your videos.</span>
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-sm">
            <a 
              href="/privacypolicy.html" 
              target="_blank"
              className="text-purple-600 hover:text-purple-700 underline hover:no-underline transition-colors"
            >
              Privacy Policy
            </a>
            <span className="text-gray-400">•</span>
            <a 
              href="/terms.html" 
              target="_blank"
              className="text-purple-600 hover:text-purple-700 underline hover:no-underline transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
};