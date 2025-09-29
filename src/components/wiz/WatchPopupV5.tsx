import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Share2, Bookmark, Zap } from "lucide-react"
import { useState, useEffect } from "react"
import { TipModal } from './creator/components/TipModal'
import { useWatchTimeZAPs } from '@/hooks/useWatchTimeZAPs'
import { useZAPSystem } from '@/hooks/useZAPSystem'
import { motion, AnimatePresence } from "framer-motion"

// YouTube Player API type declarations
declare global {
  interface Window {
    YT: {
      Player: any;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        ENDED: number;
      };
    };
  }
}

interface WatchPopupProps {
  open: boolean
  onClose: () => void
  video?: {
    id: string
    videoId: string
    title: string
    description: string
    creator: {
      name: string
      avatar: string
      subscribers: string
      level?: number
    }
    views: string
    duration: string
    xpReward: number
  }
}

export function WatchPopupV5({ open, onClose, video }: WatchPopupProps) {
  const [showTipModal, setShowTipModal] = useState(false)
  const [showZAPsEarned, setShowZAPsEarned] = useState(false)
  const [zapsEarnedAmount, setZapsEarnedAmount] = useState(0)
  const [currentVideoTime, setCurrentVideoTime] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [isCommunityDialogOpen, setCommunityDialogOpen] = useState(false)

  // Default video data if none provided
  const defaultVideo = {
    id: "1",
    videoId: "dQw4w9WgXcQ",
    title: "Faceless Hunter",
    description: "Learn the exact playbook I used to build multiple 8-figure companies from scratch. This comprehensive guide covers everything from initial product development to scaling systems.",
    creator: {
      name: "Faceless Avatars",
      avatar: "/creator-avatar.png",
      subscribers: "1k subscribers",
      level: 7
    },
    views: "487K views",
    duration: "6:29",
    xpReward: 250
  }

  const currentVideo = video || defaultVideo
  const { zapData, awardShareZAPs } = useZAPSystem()

  // Community settings (can be extended to come from creator profile)
  const communityBannerUrl = "/community-banner.png" // Default banner
  const communityType = "zaps" // Options: "paid", "free", "lifetime", "waitlist", "zaps"
  const communityPrice = "$9.99/mo"
  const rewardZAPs = 50
  const communityDescription = "Exclusive access to behind-the-scenes, drops & live courses. Connect with like-minded creators and unlock premium rewards."

  // Helper function to parse duration string to seconds
  const parseDuration = (duration: string): number => {
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1]; // MM:SS
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2]; // H:MM:SS
    }
    return 0;
  };

  const [estimatedVideoTime, setEstimatedVideoTime] = useState(0);
  const videoDurationSeconds = parseDuration(currentVideo.duration);

  // Initialize ZAP tracking for this video with real video sync
  const {
    isTracking,
    watchTime,
    completionRate,
    totalZAPsEarned,
    isVideoCompleted,
    hasBeenCompleted,
    progressBarReady,
    estimatedZAPsForCompletion,
    startTracking,
    stopTracking,
    updateVideoTime
  } = useWatchTimeZAPs({
    videoId: currentVideo.videoId,
    videoDuration: videoDurationSeconds,
    isBoosted: false,
    actualVideoTime: currentVideoTime,
    isVideoPlaying: isVideoPlaying,
    onZAPsAwarded: (zaps) => {
      setZapsEarnedAmount(zaps);
      setShowZAPsEarned(true);
      setTimeout(() => setShowZAPsEarned(false), 3000);
    },
    onVideoCompleted: () => {
      console.log('🎉 Video completed in popup!');
    }
  });

  // Remove artificial progress estimation - let ZAPs system handle its own timing

  // YouTube Player API integration for real progress tracking
  useEffect(() => {
    if (!open) return;

    // Reset states when opening
    setCurrentVideoTime(0);
    setIsVideoPlaying(false);
    setEstimatedVideoTime(0);

    console.log(`🎬 WatchPopup opened for video: ${currentVideo.videoId}`);

    // Load YouTube IFrame API if not already loaded
    if (!window.YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(script);
    }

    const initializePlayer = () => {
      const playerElement = document.getElementById(`youtube-player-${currentVideo.videoId}`);
      if (!playerElement || !window.YT?.Player) return;

      try {
        const player = new window.YT.Player(`youtube-player-${currentVideo.videoId}`, {
          events: {
            onReady: () => {
              console.log('YouTube player ready');
              // Start ZAP tracking after player is ready
              setTimeout(() => {
                console.log(`🎯 Starting ZAP tracking from YouTube onReady for ${currentVideo.videoId}`);
                startTracking();
              }, 1000);
            },
            onStateChange: (event: any) => {
              const isPlaying = event.data === window.YT.PlayerState.PLAYING;
              setIsVideoPlaying(isPlaying);
              console.log(`Video ${isPlaying ? 'playing' : 'paused'}`);
            }
          }
        });

        // Track video progress every second
        const progressInterval = setInterval(() => {
          if (player && typeof player.getCurrentTime === 'function') {
            try {
              const currentTime = player.getCurrentTime();
              if (currentTime > 0) {
                setCurrentVideoTime(currentTime);
                // Update ZAP tracking with actual YouTube time
                updateVideoTime(currentTime, true);
                console.log(`📹 YouTube API time: ${currentTime.toFixed(1)}s`);
              }
            } catch (error) {
              // Player might not be ready yet, ignore
              console.log('YouTube player not ready:', error);
            }
          }
        }, 1000);

        return () => {
          clearInterval(progressInterval);
        };
      } catch (error) {
        console.log('YouTube player initialization error:', error);
        // Fallback: start tracking anyway with simulated progress
        setTimeout(() => {
          console.log(`🎯 Starting ZAP tracking from fallback #1 for ${currentVideo.videoId}`);
          startTracking();

          // Start a fallback timer to simulate video progress
          const fallbackInterval = setInterval(() => {
            setCurrentVideoTime(prev => {
              const newTime = prev + 1;
              // Update ZAP tracking with fallback time
              updateVideoTime(newTime, true);
              console.log(`⏰ Fallback timer: ${newTime}s`);
              return newTime;
            });
            setIsVideoPlaying(true);
          }, 1000);

          return () => {
            clearInterval(fallbackInterval);
          };
        }, 2000);
      }
    };

    // Wait for YouTube API to load, then initialize (with timeout)
    let retryCount = 0;
    const maxRetries = 10; // 5 seconds total

    const checkYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initializePlayer();
      } else if (retryCount < maxRetries) {
        retryCount++;
        setTimeout(checkYouTubeAPI, 500);
      } else {
        console.log('YouTube API failed to load, using fallback tracking');
        // Start tracking with fallback mechanism
        setTimeout(() => {
          console.log(`🎯 Starting ZAP tracking from fallback #2 for ${currentVideo.videoId}`);
          startTracking();
          // Simple timer to simulate video progress for ZAPs
          const fallbackInterval = setInterval(() => {
            setCurrentVideoTime(prev => {
              const newTime = prev + 1;
              const clampedTime = Math.min(newTime, videoDurationSeconds); // Don't exceed video duration
              // Update ZAP tracking with fallback time
              updateVideoTime(clampedTime, true);
              return clampedTime;
            });
            setIsVideoPlaying(true);
          }, 1000);

          // Store interval for cleanup
          return () => {
            clearInterval(fallbackInterval);
          };
        }, 1000);
      }
    };

    const timer = setTimeout(checkYouTubeAPI, 1000);

    return () => {
      clearTimeout(timer);
      if (isTracking) {
        console.log(`🧹 WatchPopup cleanup: stopping ZAP tracking for ${currentVideo.videoId}`);
        stopTracking();
      }
      setCurrentVideoTime(0);
      setIsVideoPlaying(false);
      setEstimatedVideoTime(0);
    };
  }, [open, currentVideo.videoId]);

  // Handle share with ZAP reward
  const handleShare = async () => {
    try {
      const zapsEarned = await awardShareZAPs(currentVideo.videoId);
      if (zapsEarned > 0) {
        setZapsEarnedAmount(zapsEarned);
        setShowZAPsEarned(true);
        setTimeout(() => setShowZAPsEarned(false), 3000);
      }
    } catch (error) {
      console.error('Error awarding share ZAPs:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl w-full h-[90vh] overflow-y-auto bg-gradient-to-br from-white via-[#f7f9fc] to-[#eef1f7] rounded-2xl p-6 shadow-2xl backdrop-blur-xl border-0">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left: Main Video Section */}
          <div className="flex-1 flex flex-col gap-4">
            {/* Video */}
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-xl">
              <iframe
                src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1&origin=${window.location.origin}`}
                title={currentVideo.title}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                id={`youtube-player-${currentVideo.videoId}`}
              />
            </div>

            {/* Watch Progress Bar */}
            <div className="w-full relative">
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  initial={{ width: 0 }}
                  animate={{ width: progressBarReady ? `${completionRate * 100}%` : '0%' }}
                  transition={{ duration: 0.5 }}
                ></motion.div>
              </div>

              {/* Progress + ZAPs */}
              <div className="flex justify-between text-sm text-neutral-600">
                <div className="flex items-center space-x-2">
                  <span>Watching progress</span>
                  {isTracking && !hasBeenCompleted && (
                    <motion.span
                      className="px-2 py-0.5 bg-green-100 text-green-600 rounded-full text-xs font-medium"
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      Earning ZAPs
                    </motion.span>
                  )}
                  {hasBeenCompleted && (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded-full text-xs font-medium">
                      🔄 Rewatching
                    </span>
                  )}
                  {isVideoCompleted && !hasBeenCompleted && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs font-medium">
                      🎉 Just Completed!
                    </span>
                  )}
                </div>
                <span className="font-medium">
                  +{totalZAPsEarned} / {estimatedZAPsForCompletion} ⚡ ZAPs
                  {hasBeenCompleted && (
                    <span className="text-xs text-amber-600 ml-1">(10% rate)</span>
                  )}
                </span>
              </div>

              {/* Additional ZAP Info */}
              <div className="flex justify-between text-xs text-neutral-500 mt-1">
                <span>Watch time: {Math.floor(watchTime)}s</span>
                <span>Progress: {Math.floor(completionRate * 100)}%</span>
              </div>
            </div>

            {/* Creator Info + Action Row */}
            <div className="flex items-center justify-between mt-2">
              {/* Creator Info */}
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 shadow-sm">
                  <AvatarImage src={currentVideo.creator.avatar} alt={currentVideo.creator.name} />
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-blue-400 text-white text-sm font-medium">
                    {currentVideo.creator.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">{currentVideo.creator.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 text-white text-xs font-medium">
                      Lv.{currentVideo.creator.level || 7}
                    </span>
                  </div>
                  <span className="text-sm text-neutral-500">{currentVideo.creator.subscribers}</span>
                </div>
              </div>

              {/* Action Row */}
              <div className="flex items-center gap-3">
                <Button className="h-11 px-5 rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 text-white font-medium hover:from-indigo-600 hover:to-blue-500 transition-all">
                  Subscribe
                </Button>
                <Button
                  onClick={() => setShowTipModal(true)}
                  className="h-11 px-5 rounded-full bg-gradient-to-r from-green-500 to-emerald-400 text-white font-medium hover:from-green-600 hover:to-emerald-500 transition-all"
                >
                  Tip
                </Button>
                <Button
                  onClick={handleShare}
                  variant="ghost"
                  className="h-11 w-11 rounded-full border bg-white/60 backdrop-blur-sm flex items-center justify-center hover:bg-white/80 transition-all"
                  title="Share video (+20 ZAPs)"
                >
                  <Share2 className="w-5 h-5 text-neutral-700" />
                </Button>
                <Button
                  variant="ghost"
                  className="h-11 w-11 rounded-full border bg-white/60 backdrop-blur-sm flex items-center justify-center hover:bg-white/80 transition-all"
                >
                  <Bookmark className="w-5 h-5 text-neutral-700" />
                </Button>
              </div>
            </div>

            {/* Video Title + Description */}
            <div className="flex flex-col gap-2 mt-4">
              <h2 className="text-lg font-semibold text-neutral-900">
                {currentVideo.title}
              </h2>
              <div className="flex items-center gap-2 text-sm text-neutral-500">
                <span>{currentVideo.views}</span> •
                <span>{currentVideo.duration}</span> •
                <span className="px-2 py-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full text-xs font-medium">
                  +{estimatedZAPsForCompletion} ⚡ ZAPs potential
                </span>
              </div>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {currentVideo.description}
              </p>
            </div>
          </div>

          {/* Right: Split Panel */}
          <aside className="w-full md:w-72 flex flex-col h-full">
            {/* Top Half: Up Next */}
            <div className="flex-1 overflow-y-auto border-b border-neutral-200/40 pb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-neutral-800">Up Next</h3>
                <span className="text-xs text-neutral-500">7 videos</span>
              </div>
              <div className="flex flex-col gap-3 pr-2">
                {/* Related Video Cards */}
                {[
                  {
                    id: "2",
                    title: "Advanced React Patterns",
                    creator: "TechMaster Pro",
                    views: "124K views",
                    duration: "15:42",
                    zaps: 150,
                    thumbnail: "/thumb1.png"
                  },
                  {
                    id: "3",
                    title: "Building Wealth: 10 Proven Steps",
                    creator: "WealthBuilder",
                    views: "89K views",
                    duration: "22:15",
                    zaps: 200,
                    thumbnail: "/thumb2.png"
                  },
                  {
                    id: "4",
                    title: "Marketing Psychology Secrets",
                    creator: "MarketingGuru",
                    views: "156K views",
                    duration: "18:30",
                    zaps: 175,
                    thumbnail: "/thumb3.png"
                  },
                  {
                    id: "5",
                    title: "AI and Machine Learning Basics",
                    creator: "AI Expert",
                    views: "78K views",
                    duration: "12:45",
                    zaps: 120,
                    thumbnail: "/thumb4.png"
                  }
                ].map((relatedVideo) => (
                  <div
                    key={relatedVideo.id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/60 backdrop-blur-sm shadow hover:shadow-md transition-all duration-200 cursor-pointer hover:bg-white/70"
                  >
                    <div className="relative w-20 h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-md overflow-hidden flex-shrink-0">
                      <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <span className="text-xs text-neutral-500">Video</span>
                      </div>
                      <div className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-1 py-0.5 rounded text-[10px]">
                        {relatedVideo.duration}
                      </div>
                    </div>
                    <div className="flex flex-col flex-1">
                      <span className="text-sm font-medium text-neutral-900 line-clamp-2 mb-1">
                        {relatedVideo.title}
                      </span>
                      <span className="text-xs text-neutral-500 mb-1">{relatedVideo.creator}</span>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-neutral-500">{relatedVideo.views}</span>
                        <span className="text-xs font-medium text-indigo-600">+{relatedVideo.zaps} ⚡</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Half: Creator Community */}
            <div className="p-4 border-t border-neutral-200/40">
              {/* Banner Image */}
              <div className="w-full rounded-xl overflow-hidden mb-3">
                <img
                  src={communityBannerUrl || "/default-banner.png"}
                  alt={`${currentVideo.creator.name} community banner`}
                  className="w-full h-auto object-cover aspect-[3/1]"
                  onError={(e) => {
                    // Fallback to gradient if image fails to load
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                    e.currentTarget.parentElement!.style.minHeight = '80px';
                  }}
                />
              </div>

              {/* Community Details */}
              <h3 className="text-lg font-semibold mb-2">Join {currentVideo.creator.name}'s Community</h3>
              <p className="text-sm text-neutral-600 line-clamp-3 mb-3">
                {communityDescription}
              </p>

              {/* Join Button */}
              <Button
                className="w-full h-11 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-medium hover:from-indigo-600 hover:to-blue-600 transition-all"
                onClick={() => setCommunityDialogOpen(true)}
              >
                {communityType === "paid" && `Join – ${communityPrice}`}
                {communityType === "free" && "Join Free"}
                {communityType === "lifetime" && "Lifetime Access"}
                {communityType === "waitlist" && "Join Waitlist"}
                {communityType === "zaps" && `Join – +${rewardZAPs}⚡ ZAPs`}
              </Button>
            </div>
          </aside>
        </div>

        {/* ZAPs Earned Animation */}
        <AnimatePresence>
          {showZAPsEarned && (
            <motion.div
              className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none z-50"
              initial={{ opacity: 0, scale: 0.5, y: 0 }}
              animate={{ opacity: 1, scale: 1, y: -50 }}
              exit={{ opacity: 0, scale: 0.5, y: -100 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500/90 to-pink-500/90 rounded-full border border-white/20 backdrop-blur-lg">
                <Zap className="w-4 h-4 text-white" fill="currentColor" />
                <span className="text-white font-bold">+{zapsEarnedAmount} ZAPs</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>

      {/* Tip Modal */}
      <TipModal
        isOpen={showTipModal}
        onClose={() => setShowTipModal(false)}
        creatorId={currentVideo.creator.name.toLowerCase().replace(/\s+/g, '')}
        creatorName={currentVideo.creator.name}
        creatorAvatar={currentVideo.creator.avatar}
      />

      {/* Community Join Dialog */}
      <Dialog open={isCommunityDialogOpen} onOpenChange={setCommunityDialogOpen}>
        <DialogContent className="max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Join {currentVideo.creator.name}'s Community
            </DialogTitle>
            <DialogDescription className="text-sm text-neutral-600 mt-2">
              {communityDescription}
            </DialogDescription>
          </DialogHeader>

          {/* Community Banner in Dialog */}
          <div className="w-full rounded-xl overflow-hidden my-4">
            <img
              src={communityBannerUrl || "/default-banner.png"}
              alt={`${currentVideo.creator.name} community banner`}
              className="w-full h-auto object-cover aspect-[3/1]"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement!.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                e.currentTarget.parentElement!.style.minHeight = '120px';
              }}
            />
          </div>

          {/* Community Type Specific Content */}
          <div className="space-y-4">
            {communityType === "paid" && (
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-neutral-700">Membership</span>
                    <span className="text-lg font-bold text-indigo-600">{communityPrice}</span>
                  </div>
                  <ul className="text-xs text-neutral-600 space-y-1">
                    <li>✓ Exclusive content & courses</li>
                    <li>✓ Behind-the-scenes access</li>
                    <li>✓ Direct creator interaction</li>
                    <li>✓ Community perks & rewards</li>
                  </ul>
                </div>
                <Button
                  className="w-full h-11 rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 text-white font-medium"
                  onClick={() => {
                    // Handle payment checkout
                    console.log('Proceeding to payment checkout');
                    setCommunityDialogOpen(false);
                  }}
                >
                  Proceed to Payment
                </Button>
              </div>
            )}

            {communityType === "free" && (
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg">
                  <p className="text-sm text-neutral-700 mb-2">Join for free and get instant access to:</p>
                  <ul className="text-xs text-neutral-600 space-y-1">
                    <li>✓ Community discussions</li>
                    <li>✓ Updates & announcements</li>
                    <li>✓ Basic resources</li>
                  </ul>
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-11 px-4 rounded-full border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button
                  className="w-full h-11 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium"
                  onClick={() => {
                    // Handle free signup
                    console.log('Joining free community');
                    setCommunityDialogOpen(false);
                  }}
                >
                  Join Free Community
                </Button>
              </div>
            )}

            {communityType === "waitlist" && (
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg">
                  <p className="text-sm text-neutral-700 mb-2">This community is currently at capacity.</p>
                  <p className="text-xs text-neutral-600">Join the waitlist to be notified when spots open up!</p>
                </div>
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="w-full h-11 px-4 rounded-full border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <Button
                  className="w-full h-11 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium"
                  onClick={() => {
                    // Handle waitlist signup
                    console.log('Joining waitlist');
                    setCommunityDialogOpen(false);
                  }}
                >
                  Join Waitlist
                </Button>
              </div>
            )}

            {communityType === "lifetime" && (
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-neutral-700">Lifetime Access</span>
                    <span className="text-lg font-bold text-purple-600">$299</span>
                  </div>
                  <ul className="text-xs text-neutral-600 space-y-1">
                    <li>✓ All current & future content</li>
                    <li>✓ Priority support & access</li>
                    <li>✓ Exclusive lifetime perks</li>
                    <li>✓ One-time payment, forever access</li>
                  </ul>
                </div>
                <Button
                  className="w-full h-11 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium"
                  onClick={() => {
                    // Handle lifetime purchase
                    console.log('Proceeding to lifetime purchase');
                    setCommunityDialogOpen(false);
                  }}
                >
                  Get Lifetime Access
                </Button>
              </div>
            )}

            {communityType === "zaps" && (
              <div className="space-y-3">
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-lg">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-neutral-700">Reward for Joining</span>
                    <span className="text-2xl font-bold text-indigo-600">+{rewardZAPs}⚡</span>
                  </div>
                  <p className="text-xs text-neutral-600 mb-2">
                    Earn {rewardZAPs} ZAPs instantly when you join this community!
                  </p>
                  <ul className="text-xs text-neutral-600 space-y-1">
                    <li>✓ Exclusive community access</li>
                    <li>✓ Instant ZAP reward</li>
                    <li>✓ Behind-the-scenes content</li>
                    <li>✓ Connect with creators</li>
                  </ul>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-neutral-600">Your current ZAPs:</span>
                  <span className="text-lg font-bold text-neutral-900">{zapData.balance}⚡</span>
                </div>
                <Button
                  className="w-full h-11 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-medium"
                  onClick={() => {
                    // Handle ZAP community join
                    console.log('Joining with ZAP reward');
                    // Award ZAPs to user
                    setZapsEarnedAmount(rewardZAPs);
                    setShowZAPsEarned(true);
                    setTimeout(() => setShowZAPsEarned(false), 3000);
                    setCommunityDialogOpen(false);
                  }}
                >
                  Join & Earn {rewardZAPs} ZAPs ⚡
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  )
}