import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Share2, Heart, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Sparkles, Zap, Crown, Users, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useXp } from '@/context/XpContext';
import { useAuth } from '@/hooks/useAuth';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface VideoData {
  id: string;
  title: string;
  creator: string;
  avatar: string;
  videoId: string;
  xpReward: number;
  duration: string;
  views: string;
  description?: string;
}

interface CinematicVideoPlayerProps {
  video: VideoData;
  isOpen: boolean;
  onClose: () => void;
  onVideoComplete: (video: VideoData) => void;
  onContinueWatching: () => void;
}

const relatedVideos = [
  {
    id: 2,
    title: 'Advanced AI Techniques',
    creator: 'AI Master',
    thumbnail: 'https://img.youtube.com/vi/jNQXAC9IVRw/mqdefault.jpg',
    xpReward: 95,
    duration: '12:30'
  },
  {
    id: 3,
    title: 'Future of Technology',
    creator: 'Tech Visionary',
    thumbnail: 'https://img.youtube.com/vi/ScMzIvxBSi4/mqdefault.jpg',
    xpReward: 110,
    duration: '8:45'
  },
  {
    id: 4,
    title: 'Machine Learning Basics',
    creator: 'Code Genius',
    thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    xpReward: 75,
    duration: '15:20'
  }
];

const comments = [
  {
    id: 1,
    user: 'TechLover',
    avatar: 'https://ui-avatars.com/api/?name=TechLover&background=8B5CF6&color=ffffff&size=64',
    comment: 'Amazing explanation! This really helped me understand AI better.',
    likes: 24,
    time: '2h ago'
  },
  {
    id: 2,
    user: 'StudentDev',
    avatar: 'https://ui-avatars.com/api/?name=StudentDev&background=10B981&color=ffffff&size=64',
    comment: 'Can you make more videos like this? The XP rewards are great!',
    likes: 18,
    time: '4h ago'
  },
  {
    id: 3,
    user: 'AIEnthusiast',
    avatar: 'https://ui-avatars.com/api/?name=AIEnthusiast&background=F59E0B&color=ffffff&size=64',
    comment: 'The future is definitely bright for AI development.',
    likes: 31,
    time: '6h ago'
  }
];

export const CinematicVideoPlayer = ({
  video,
  isOpen,
  onClose,
  onVideoComplete,
  onContinueWatching
}: CinematicVideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(100);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showXPReward, setShowXPReward] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [xpMilestones, setXpMilestones] = useState([25, 50, 75, 100]);
  const [reachedMilestones, setReachedMilestones] = useState<number[]>([]);
  const [showControls, setShowControls] = useState(true);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userLevel, setUserLevel] = useState(7);
  const [userXP, setUserXP] = useState(2450);
  const [nextLevelXP] = useState(3000);

  const videoRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isMobile = useIsMobile();
  const { addXp } = useXp();
  const { user } = useAuth();

  const progressPercent = (currentTime / duration) * 100;
  const levelProgressPercent = (userXP / nextLevelXP) * 100;

  // Simulate video progress
  useEffect(() => {
    if (isPlaying && isOpen && !isVideoCompleted) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;

          // Check for milestone rewards
          const currentPercent = (newTime / duration) * 100;
          xpMilestones.forEach(milestone => {
            if (currentPercent >= milestone && !reachedMilestones.includes(milestone)) {
              setReachedMilestones(prev => [...prev, milestone]);
              const milestoneXP = Math.floor(video.xpReward * 0.2); // 20% of total per milestone
              setEarnedXP(prev => prev + milestoneXP);
              setUserXP(prev => prev + milestoneXP);
              addXp(milestoneXP);

              // Show milestone reward
              setShowXPReward(true);
              setTimeout(() => setShowXPReward(false), 2000);
            }
          });

          // Video completion
          if (newTime >= duration) {
            setIsVideoCompleted(true);
            setIsPlaying(false);
            const finalXP = video.xpReward - earnedXP;
            setEarnedXP(prev => prev + finalXP);
            setUserXP(prev => prev + finalXP);
            addXp(finalXP);
            onVideoComplete(video);
            return duration;
          }

          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, isOpen, isVideoCompleted, earnedXP, video, xpMilestones, reachedMilestones, duration, addXp, onVideoComplete]);

  // Hide controls after inactivity
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setShowControls(true);
    timeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPlaying, currentTime]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (newTime: number) => {
    setCurrentTime(newTime);
  };

  const handleReplay = () => {
    setCurrentTime(0);
    setIsVideoCompleted(false);
    setEarnedXP(0);
    setReachedMilestones([]);
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const [exitAnimationComplete, setExitAnimationComplete] = useState(false);

  const handleContinueWatching = () => {
    // Trigger XP glow exit animation before closing
    setExitAnimationComplete(true);

    // Delay the actual close to allow exit animation
    setTimeout(() => {
      onContinueWatching();
      onClose();
    }, 800);
  };

  const handleClose = () => {
    // Trigger XP glow exit animation before closing
    setExitAnimationComplete(true);

    // Delay the actual close to allow exit animation
    setTimeout(() => {
      onClose();
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && handleClose()}
      >
        {/* Premium Glassmorphic Background with Particle Effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-purple-900/60 to-slate-900/80 backdrop-blur-2xl">
          {/* Floating XP Particles */}
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full opacity-60"
              animate={{
                y: [-20, -60, -20],
                x: [0, Math.sin(i) * 30, 0],
                opacity: [0.3, 0.8, 0.3],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 3
              }}
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${20 + Math.random() * 60}%`
              }}
            />
          ))}

          {/* Pulsing XP Aura Effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-radial from-purple-500/10 via-transparent to-transparent"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>

        {/* Floating XP Counter - Enhanced with Exit Animation */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, y: -30 }}
          animate={ exitAnimationComplete ? {
            scale: 0.3,
            opacity: 0,
            x: -200,
            y: -50,
            transition: {
              duration: 0.8,
              ease: "easeInOut"
            }
          } : { scale: 1, opacity: 1, y: 0 }}
          className="absolute top-6 right-6 z-20"
        >
          {/* XP Glow Trail Effect */}
          <AnimatePresence>
            {exitAnimationComplete && (
              <motion.div
                initial={{ scale: 1, opacity: 0.8 }}
                animate={{
                  scale: [1, 2, 4],
                  opacity: [0.8, 0.3, 0],
                  x: [-200, -400, -600],
                  y: [-50, -100, -150]
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0 bg-gradient-to-r from-green-400/60 via-emerald-500/40 to-transparent rounded-2xl blur-md"
              />
            )}
          </AnimatePresence>
          <div className="bg-gradient-to-r from-slate-800/90 via-purple-800/90 to-slate-800/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl px-6 py-4 shadow-2xl">
            <div className="text-center space-y-2">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  textShadow: ['0 0 10px rgba(34, 197, 94, 0.5)', '0 0 20px rgba(34, 197, 94, 0.8)', '0 0 10px rgba(34, 197, 94, 0.5)']
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-2xl font-black bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent"
              >
                +{earnedXP} XP
              </motion.div>
              <div className="text-xs text-slate-300 font-medium">
                {video.xpReward - earnedXP > 0 ? `${video.xpReward - earnedXP} XP Pending` : 'Complete!'}
              </div>

              {/* Mini Level Progress */}
              <div className="flex items-center gap-2">
                <Crown size={12} className="text-amber-400" />
                <div className="w-20 bg-slate-700 rounded-full h-1.5">
                  <motion.div
                    className="bg-gradient-to-r from-amber-400 to-orange-500 h-1.5 rounded-full"
                    animate={{ width: `${levelProgressPercent}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <span className="text-amber-400 text-xs font-bold">{userLevel}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Container */}
        <div className="relative w-full max-w-7xl mx-auto flex gap-6 h-full max-h-[90vh]">

          {/* Main Video Section */}
          <div className="flex-1 flex flex-col">

            {/* Top Bar */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className={cn(
                "flex items-center justify-between mb-4 transition-opacity duration-300",
                showControls ? "opacity-100" : "opacity-0"
              )}
            >
              <Button
                variant="ghost"
                onClick={handleClose}
                className="text-white hover:bg-white/20 rounded-full px-4"
              >
                <ArrowLeft size={18} className="mr-2" />
                Back to Feed
              </Button>

              <h2 className="text-white font-semibold text-lg truncate mx-4 flex-1 text-center">
                {video.title}
              </h2>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={cn(
                    "text-white hover:bg-white/20 rounded-full",
                    isBookmarked && "text-red-400"
                  )}
                >
                  <Heart size={18} fill={isBookmarked ? "currentColor" : "none"} />
                </Button>
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <Share2 size={18} />
                </Button>
              </div>
            </motion.div>

            {/* Immersive Video Player with XP Aura */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotateX: 10 }}
              animate={{ scale: 1, opacity: 1, rotateX: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
              className="relative flex-1 rounded-3xl overflow-hidden shadow-2xl bg-black"
              onMouseMove={() => setShowControls(true)}
              style={{
                boxShadow: `
                  0 0 60px rgba(168, 85, 247, 0.4),
                  0 0 120px rgba(59, 130, 246, 0.2),
                  inset 0 0 0 2px rgba(168, 85, 247, 0.3)
                `
              }}
            >
              {/* XP Aura Glow Effect */}
              <motion.div
                className="absolute -inset-4 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 rounded-3xl blur-xl"
                animate={{
                  opacity: [0.3, 0.7, 0.3],
                  scale: [1, 1.05, 1]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              />
              {/* Video Element */}
              <iframe
                ref={videoRef}
                className="w-full h-full"
                src={`https://www.youtube.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1&showinfo=0&controls=0&enablejsapi=1`}
                title={video.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />

              {/* XP Timer Overlay */}
              <AnimatePresence>
                {!isVideoCompleted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full px-3 py-2 flex items-center gap-2 text-black font-semibold text-sm shadow-lg"
                  >
                    <Zap size={14} />
                    <span>+{video.xpReward - earnedXP} XP in {formatTime(duration - currentTime)}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enhanced XP Milestone Celebration */}
              <AnimatePresence>
                {showXPReward && (
                  <motion.div
                    initial={{ scale: 0.3, opacity: 0, rotateY: -90 }}
                    animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                    exit={{ scale: 0.3, opacity: 0, rotateY: 90 }}
                    className="absolute inset-0 flex items-center justify-center z-10"
                  >
                    {/* Particle Burst Effect */}
                    <div className="absolute inset-0">
                      {[...Array(12)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-3 h-3 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                          initial={{ scale: 0, x: 0, y: 0 }}
                          animate={{
                            scale: [0, 1.5, 0],
                            x: Math.cos((i * Math.PI * 2) / 12) * 100,
                            y: Math.sin((i * Math.PI * 2) / 12) * 100
                          }}
                          transition={{ duration: 1.5, delay: 0.2 }}
                          style={{
                            left: '50%',
                            top: '50%'
                          }}
                        />
                      ))}
                    </div>

                    {/* Main Reward Card */}
                    <motion.div
                      animate={{
                        boxShadow: [
                          '0 0 30px rgba(16, 185, 129, 0.8)',
                          '0 0 60px rgba(6, 182, 212, 1)',
                          '0 0 30px rgba(16, 185, 129, 0.8)'
                        ]
                      }}
                      transition={{ duration: 1, repeat: 2 }}
                      className="bg-gradient-to-br from-emerald-500 via-cyan-500 to-purple-500 rounded-3xl px-12 py-8 flex items-center gap-4 text-white shadow-2xl border border-white/20"
                    >
                      <motion.div
                        animate={{
                          rotate: [0, 360, 720],
                          scale: [1, 1.3, 1.1, 1.3, 1]
                        }}
                        transition={{ duration: 1.5, type: "spring" }}
                        className="relative"
                      >
                        <Zap size={40} className="text-yellow-300" />
                        <motion.div
                          className="absolute inset-0"
                          animate={{ rotate: -360 }}
                          transition={{ duration: 1, ease: "linear" }}
                        >
                          <Sparkles size={40} className="text-white opacity-50" />
                        </motion.div>
                      </motion.div>

                      <div className="text-center">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: [0, 1.2, 1] }}
                          className="text-3xl font-black mb-2"
                        >
                          +{Math.floor(video.xpReward * 0.2)} XP
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="text-lg font-semibold text-emerald-100"
                        >
                          Milestone Unlocked! 🚀
                        </motion.div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Video Controls */}
              <AnimatePresence>
                {showControls && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6"
                  >
                    {/* XP Progress Bar (Scrub Bar = XP Bar) */}
                    <div className="mb-4">
                      <div className="relative">
                        <div
                          className="w-full bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-full h-3 cursor-pointer border border-purple-500/30 shadow-lg"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const percentage = x / rect.width;
                            handleSeek(percentage * duration);
                          }}
                        >
                          <motion.div
                            className="bg-gradient-to-r from-emerald-400 via-cyan-500 to-purple-500 h-3 rounded-full relative overflow-hidden"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                          >
                            {/* Shimmer effect on progress bar */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12"
                              animate={{ x: ["-100%", "200%"] }}
                              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            />
                          </motion.div>
                        </div>

                        {/* Enhanced XP Milestone Markers */}
                        {xpMilestones.map((milestone) => (
                          <motion.div
                            key={milestone}
                            className="absolute top-0 transform -translate-y-1"
                            style={{ left: `${milestone}%` }}
                          >
                            <motion.div
                              className={cn(
                                "relative w-4 h-4 rounded-full border-2 flex items-center justify-center",
                                reachedMilestones.includes(milestone)
                                  ? "bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-300 shadow-lg"
                                  : "bg-slate-600/80 border-slate-500/80"
                              )}
                              animate={reachedMilestones.includes(milestone) ? {
                                scale: [1, 1.4, 1.2],
                                boxShadow: [
                                  '0 0 0px rgba(245, 158, 11, 0.5)',
                                  '0 0 30px rgba(245, 158, 11, 1)',
                                  '0 0 15px rgba(245, 158, 11, 0.7)'
                                ],
                                rotate: [0, 180, 360]
                              } : {}}
                              transition={{ duration: 0.8, type: "spring" }}
                            >
                              {reachedMilestones.includes(milestone) ? (
                                <motion.div
                                  animate={{ rotate: 360 }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                  <Sparkles size={10} className="text-white" />
                                </motion.div>
                              ) : (
                                <div className="w-1.5 h-1.5 bg-slate-400 rounded-full" />
                              )}
                            </motion.div>

                            {/* Milestone Label */}
                            <motion.div
                              className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap"
                              initial={{ opacity: 0, y: 5 }}
                              animate={{ opacity: reachedMilestones.includes(milestone) ? 1 : 0, y: reachedMilestones.includes(milestone) ? 0 : 5 }}
                            >
                              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                                +{Math.floor(video.xpReward * 0.2)} XP
                              </div>
                            </motion.div>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          onClick={handlePlayPause}
                          className="text-white hover:bg-white/20 rounded-full p-3"
                        >
                          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                        </Button>

                        <div className="flex items-center gap-2 text-white text-sm">
                          <span>{formatTime(currentTime)}</span>
                          <span>/</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            onClick={() => setIsMuted(!isMuted)}
                            className="text-white hover:bg-white/20 rounded-full p-2"
                          >
                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                          </Button>
                          <div className="w-20 bg-white/20 rounded-full h-1">
                            <div
                              className="bg-white h-1 rounded-full"
                              style={{ width: `${isMuted ? 0 : volume}%` }}
                            />
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          onClick={() => setIsFullscreen(!isFullscreen)}
                          className="text-white hover:bg-white/20 rounded-full p-2"
                        >
                          <Maximize size={18} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Premium End-of-Video Reward Ceremony */}
              <AnimatePresence>
                {isVideoCompleted && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-gradient-to-br from-black/80 via-slate-900/90 to-black/80 backdrop-blur-xl flex items-center justify-center"
                  >
                    {/* Celebration Background Effects */}
                    <div className="absolute inset-0">
                      {/* Radial Glow */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-radial from-emerald-500/20 via-cyan-500/10 to-transparent"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.5, 0.8, 0.5]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />

                      {/* Floating Celebration Particles */}
                      {[...Array(20)].map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-1 h-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full"
                          initial={{ scale: 0, x: 0, y: 0 }}
                          animate={{
                            scale: [0, 1, 0],
                            x: (Math.random() - 0.5) * 400,
                            y: [0, -100, -200],
                            rotate: Math.random() * 360
                          }}
                          transition={{
                            duration: 3,
                            delay: Math.random() * 2,
                            repeat: Infinity
                          }}
                          style={{
                            left: `${20 + Math.random() * 60}%`,
                            top: '80%'
                          }}
                        />
                      ))}
                    </div>

                    <div className="text-center space-y-8 z-10">
                      {/* 3D Reward Card */}
                      <motion.div
                        initial={{ scale: 0.5, opacity: 0, rotateY: -180, z: -100 }}
                        animate={{ scale: 1, opacity: 1, rotateY: 0, z: 0 }}
                        transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
                        className="relative"
                        style={{
                          perspective: '1000px',
                          transformStyle: 'preserve-3d'
                        }}
                      >
                        <motion.div
                          animate={{
                            rotateY: [0, 5, -5, 0],
                            boxShadow: [
                              '0 20px 60px rgba(16, 185, 129, 0.3)',
                              '0 30px 80px rgba(6, 182, 212, 0.5)',
                              '0 20px 60px rgba(16, 185, 129, 0.3)'
                            ]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="bg-gradient-to-br from-emerald-400 via-cyan-500 to-purple-600 rounded-3xl px-12 py-10 border border-white/20 backdrop-blur-xl"
                        >
                          {/* Crown Icon */}
                          <motion.div
                            className="mx-auto mb-6"
                            animate={{
                              rotate: [0, 10, -10, 0],
                              scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Crown size={48} className="text-yellow-300" />
                          </motion.div>

                          {/* Main XP Display */}
                          <div className="mb-4">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: [0, 1.3, 1] }}
                              transition={{ duration: 0.8, delay: 0.3 }}
                              className="text-5xl font-black text-white mb-2"
                            >
                              +{video.xpReward} XP
                            </motion.div>
                            <motion.div
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.6 }}
                              className="text-xl font-semibold text-white/90"
                            >
                              🎉 Video Mastered!
                            </motion.div>
                          </div>

                          {/* Level Up Check */}
                          {userXP + video.xpReward >= nextLevelXP && (
                            <motion.div
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 1, type: "spring" }}
                              className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl px-6 py-3 text-black font-bold text-lg mb-4"
                            >
                              🔥 LEVEL UP! You're now Level {userLevel + 1}!
                            </motion.div>
                          )}

                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-emerald-100 text-lg"
                          >
                            Knowledge absorbed. Keep the momentum!
                          </motion.p>
                        </motion.div>

                        {/* Floating Achievement Icons */}
                        <motion.div
                          className="absolute -top-6 -left-6"
                          animate={{
                            rotate: 360,
                            scale: [1, 1.2, 1]
                          }}
                          transition={{ duration: 4, repeat: Infinity }}
                        >
                          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-3">
                            <Zap size={20} className="text-white" />
                          </div>
                        </motion.div>

                        <motion.div
                          className="absolute -top-6 -right-6"
                          animate={{
                            rotate: -360,
                            scale: [1, 1.1, 1]
                          }}
                          transition={{ duration: 3, repeat: Infinity }}
                        >
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full p-3">
                            <Sparkles size={20} className="text-white" />
                          </div>
                        </motion.div>
                      </motion.div>

                      {/* Action Buttons with Enhanced Styling */}
                      <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2 }}
                        className="flex items-center justify-center gap-4 flex-wrap"
                      >
                        <motion.div
                          whileHover={{ scale: 1.05, y: -2 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            onClick={handleContinueWatching}
                            size="lg"
                            className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white rounded-2xl px-8 py-4 font-bold text-lg shadow-lg border-0 relative overflow-hidden"
                          >
                            {/* Button shine effect */}
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                              animate={{ x: ["-100%", "100%"] }}
                              transition={{ duration: 2, repeat: Infinity }}
                            />
                            <Sparkles size={20} className="mr-3" />
                            Continue Journey
                          </Button>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="ghost"
                            onClick={handleReplay}
                            className="text-white hover:bg-white/20 rounded-2xl px-6 py-4 border border-white/20 backdrop-blur-sm"
                          >
                            <RotateCcw size={18} className="mr-2" />
                            Replay
                          </Button>
                        </motion.div>

                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Button
                            variant="ghost"
                            className="text-white hover:bg-white/20 rounded-2xl px-6 py-4 border border-white/20 backdrop-blur-sm"
                          >
                            <Share2 size={18} className="mr-2" />
                            Share
                          </Button>
                        </motion.div>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Right Side Panel */}
          {!isMobile && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: showSidePanel ? 0 : 300, opacity: showSidePanel ? 1 : 0 }}
              className="w-80 space-y-6"
            >
              {/* Toggle Button */}
              <Button
                variant="ghost"
                onClick={() => setShowSidePanel(!showSidePanel)}
                className="text-white hover:bg-white/20 rounded-full mb-4"
              >
                {showSidePanel ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </Button>

              {/* Creator Info */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Avatar className="w-12 h-12 border-2 border-white/20">
                      <AvatarImage src={video.avatar} />
                      <AvatarFallback>{video.creator[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{video.creator}</h3>
                      <p className="text-gray-300 text-sm">Content Creator</p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-full"
                    >
                      Follow
                    </Button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-300">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>1.2M followers</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Zap size={14} className="text-yellow-400" />
                      <span>{video.views} views</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Related Videos */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <Play size={16} />
                    Up Next
                  </h3>

                  <div className="space-y-3">
                    {relatedVideos.map((relatedVideo, index) => (
                      <motion.div
                        key={relatedVideo.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex gap-3 p-2 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                      >
                        <img
                          src={relatedVideo.thumbnail}
                          alt={relatedVideo.title}
                          className="w-20 h-14 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-white text-sm font-medium line-clamp-2 mb-1">
                            {relatedVideo.title}
                          </h4>
                          <p className="text-gray-400 text-xs">{relatedVideo.creator}</p>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-gray-400 text-xs">{relatedVideo.duration}</span>
                            <div className="flex items-center gap-1 text-yellow-400 text-xs">
                              <Zap size={10} />
                              <span>+{relatedVideo.xpReward}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Comments */}
              <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                <CardContent className="p-6">
                  <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                    <MessageCircle size={16} />
                    Comments ({comments.length})
                  </h3>

                  <div className="space-y-4">
                    {comments.slice(0, 3).map((comment, index) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="w-6 h-6">
                            <AvatarImage src={comment.avatar} />
                            <AvatarFallback className="text-xs">{comment.user[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-white text-sm font-medium">{comment.user}</span>
                          <span className="text-gray-400 text-xs">{comment.time}</span>
                        </div>
                        <p className="text-gray-300 text-sm pl-8">{comment.comment}</p>
                        <div className="flex items-center gap-2 pl-8">
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-6 px-2">
                            <Heart size={12} className="mr-1" />
                            {comment.likes}
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};