import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Share2, Heart, Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Sparkles, Zap, Crown, Users, MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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

interface MinimalisticVideoPlayerProps {
  video: VideoData;
  isOpen: boolean;
  onClose: () => void;
  onVideoComplete: (video: VideoData) => void;
  onContinueWatching: () => void;
  isDarkMode?: boolean;
}

export const MinimalisticVideoPlayer = ({
  video,
  isOpen,
  onClose,
  onVideoComplete,
  onContinueWatching,
  isDarkMode = false
}: MinimalisticVideoPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(100);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [showSidePanel, setShowSidePanel] = useState(false);

  const videoRef = useRef<HTMLIFrameElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const isMobile = useIsMobile();
  const { addXp } = useXp();
  const { user } = useAuth();

  const progressPercent = (currentTime / duration) * 100;
  const xpProgress = (earnedXP / video.xpReward) * 100;

  // Simulate video progress
  useEffect(() => {
    if (isPlaying && isOpen && !isVideoCompleted) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          const newTime = prev + 1;

          // XP milestones at 25%, 50%, 75%, 100%
          const currentPercent = (newTime / duration) * 100;
          if (currentPercent >= 25 && earnedXP < video.xpReward * 0.25) {
            setEarnedXP(Math.floor(video.xpReward * 0.25));
          } else if (currentPercent >= 50 && earnedXP < video.xpReward * 0.5) {
            setEarnedXP(Math.floor(video.xpReward * 0.5));
          } else if (currentPercent >= 75 && earnedXP < video.xpReward * 0.75) {
            setEarnedXP(Math.floor(video.xpReward * 0.75));
          }

          // Video completion
          if (newTime >= duration) {
            setIsVideoCompleted(true);
            setIsPlaying(false);
            setEarnedXP(video.xpReward);
            addXp(video.xpReward);
            onVideoComplete(video);
            return duration;
          }

          return newTime;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isPlaying, isOpen, isVideoCompleted, earnedXP, video, duration, addXp, onVideoComplete]);

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
    setIsPlaying(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleContinueWatching = () => {
    onContinueWatching();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "fixed inset-0 z-50 flex items-center justify-center",
          isDarkMode
            ? "bg-slate-900/90 backdrop-blur-2xl"
            : "bg-white/90 backdrop-blur-2xl"
        )}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Main Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={cn(
            "relative w-full max-w-6xl mx-4 rounded-3xl overflow-hidden shadow-2xl border",
            isDarkMode
              ? "bg-slate-800/95 border-slate-700/50"
              : "bg-white/95 border-slate-200/50"
          )}
        >
          {/* Top Bar */}
          <div className={cn(
            "flex items-center justify-between p-6 border-b",
            isDarkMode ? "border-slate-700/50" : "border-slate-200/50"
          )}>
            <Button
              variant="ghost"
              onClick={onClose}
              className={cn(
                "rounded-full",
                isDarkMode ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100"
              )}
            >
              <ArrowLeft size={18} className="mr-2" />
              Back
            </Button>

            <h2 className={cn(
              "font-semibold text-lg text-center flex-1 mx-4",
              isDarkMode ? "text-white" : "text-slate-900"
            )}>
              {video.title}
            </h2>

            {/* XP Badge */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
              <Zap size={14} className="text-white" />
              <span className="text-white font-bold text-sm">+{earnedXP} XP</span>
            </div>
          </div>

          <div className="flex">
            {/* Video Section */}
            <div className="flex-1">
              {/* Video Player */}
              <div
                className="relative aspect-video bg-black"
                onMouseMove={() => setShowControls(true)}
              >
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

                {/* XP Progress Overlay */}
                <div className="absolute top-4 right-4">
                  <div className={cn(
                    "rounded-2xl p-3 backdrop-blur-xl border",
                    isDarkMode
                      ? "bg-slate-800/90 border-slate-700/50"
                      : "bg-white/90 border-slate-200/50"
                  )}>
                    <div className="text-center space-y-1">
                      <div className={cn(
                        "text-sm font-bold",
                        isDarkMode ? "text-white" : "text-slate-900"
                      )}>
                        +{earnedXP} / {video.xpReward} XP
                      </div>
                      <div className={cn(
                        "w-20 h-1 rounded-full",
                        isDarkMode ? "bg-slate-700" : "bg-slate-200"
                      )}>
                        <motion.div
                          className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${xpProgress}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Controls */}
                <AnimatePresence>
                  {showControls && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6"
                    >
                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div
                          className="w-full bg-white/20 rounded-full h-2 cursor-pointer"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const x = e.clientX - rect.left;
                            const percentage = x / rect.width;
                            handleSeek(percentage * duration);
                          }}
                        >
                          <motion.div
                            className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Controls */}
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
                            className="text-white hover:bg-white/20 rounded-full p-2"
                          >
                            <Maximize size={18} />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Video Completion */}
                <AnimatePresence>
                  {isVideoCompleted && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={cn(
                        "absolute inset-0 flex items-center justify-center backdrop-blur-xl",
                        isDarkMode ? "bg-slate-900/90" : "bg-white/90"
                      )}
                    >
                      <div className="text-center space-y-6">
                        {/* Reward Card */}
                        <motion.div
                          initial={{ scale: 0.8, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: 0.2, type: "spring" }}
                          className={cn(
                            "rounded-3xl p-8 border shadow-xl",
                            isDarkMode
                              ? "bg-slate-800/95 border-slate-700"
                              : "bg-white/95 border-slate-200"
                          )}
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                          >
                            <Crown size={32} className="text-white" />
                          </motion.div>

                          <h3 className={cn(
                            "text-3xl font-bold mb-2",
                            isDarkMode ? "text-white" : "text-slate-900"
                          )}>
                            +{video.xpReward} XP Earned!
                          </h3>
                          <p className={cn(
                            "text-lg mb-6",
                            isDarkMode ? "text-slate-300" : "text-slate-600"
                          )}>
                            🎉 Great job completing this video!
                          </p>

                          <div className="flex items-center justify-center gap-4">
                            <Button
                              onClick={handleContinueWatching}
                              size="lg"
                              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-2xl px-8 py-3 font-semibold border-0"
                            >
                              <Sparkles size={18} className="mr-2" />
                              Continue Journey
                            </Button>

                            <Button
                              variant="ghost"
                              onClick={handleReplay}
                              className={cn(
                                "rounded-2xl px-6 py-3",
                                isDarkMode ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100"
                              )}
                            >
                              <RotateCcw size={18} className="mr-2" />
                              Replay
                            </Button>
                          </div>
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Creator Info */}
              <div className={cn(
                "p-6 border-t",
                isDarkMode ? "border-slate-700/50" : "border-slate-200/50"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={video.avatar} />
                      <AvatarFallback>{video.creator[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className={cn(
                        "font-semibold",
                        isDarkMode ? "text-white" : "text-slate-900"
                      )}>{video.creator}</h4>
                      <p className={cn(
                        "text-sm",
                        isDarkMode ? "text-slate-400" : "text-slate-600"
                      )}>{video.views} views</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "rounded-full",
                        isDarkMode ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      <Heart size={18} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "rounded-full",
                        isDarkMode ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100"
                      )}
                    >
                      <Share2 size={18} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};