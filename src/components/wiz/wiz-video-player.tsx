import { useState, useRef } from 'react';
import ReactPlayer from 'react-player/youtube';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, MessageCircle, Share2, Clock, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { FirestoreService } from '@/lib/firestore';
import { YouTubeService } from '@/lib/youtube';
import { motion } from 'framer-motion';

interface WizVideoPlayerProps {
  videoId: string;
  title: string;
  description?: string;
  xpReward?: number;
}

export const WizVideoPlayer = ({ videoId, title, description, xpReward = 25 }: WizVideoPlayerProps) => {
  const { user } = useAuth();
  const playerRef = useRef<ReactPlayer>(null);
  const [watchTime, setWatchTime] = useState(0);
  const [liked, setLiked] = useState(false);
  const [commented, setCommented] = useState(false);
  const [xpEarned, setXpEarned] = useState(0);
  const [showXpAnimation, setShowXpAnimation] = useState(false);

  const handleProgress = ({ playedSeconds }: { playedSeconds: number }) => {
    setWatchTime(playedSeconds);
    
    // Award XP for watching milestones
    if (user && playedSeconds > 30 && xpEarned === 0) {
      awardXP(10, 'Started watching');
    }
  };

  const handleEnded = async () => {
    if (user) {
      await FirestoreService.recordVideoEngagement({
        videoId,
        userId: user.uid,
        watchTime,
        liked,
        commented,
        completed: true,
        xpEarned: xpReward,
        timestamp: new Date(),
      });
      
      awardXP(xpReward, 'Completed video');
    }
  };

  const handleLike = async () => {
    if (!user || liked) return;
    
    setLiked(true);
    await YouTubeService.trackVideoEngagement(videoId, 'like');
    awardXP(5, 'Liked video');
  };

  const handleComment = async () => {
    if (!user || commented) return;
    
    setCommented(true);
    await YouTubeService.trackVideoEngagement(videoId, 'comment');
    awardXP(15, 'Commented on video');
  };

  const awardXP = (amount: number, reason: string) => {
    setXpEarned(prev => prev + amount);
    setShowXpAnimation(true);
    
    setTimeout(() => setShowXpAnimation(false), 2000);
    
    if (user) {
      FirestoreService.updateUserXP(user.uid, amount, 'video_watch', {
        videoId,
        reason,
      });
    }
  };

  const watchProgress = Math.min((watchTime / 60) * 100, 100); // Assume 1 min videos for demo

  return (
    <Card className="glass-card border-card-border overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          {/* Video Player */}
          <div className="aspect-video">
            <ReactPlayer
              ref={playerRef}
              url={`https://www.youtube.com/watch?v=${videoId}`}
              width="100%"
              height="100%"
              controls
              onProgress={handleProgress}
              onEnded={handleEnded}
              config={{
                youtube: {
                  playerVars: {
                    modestbranding: 1,
                    rel: 0,
                  },
                },
              }}
            />
          </div>

          {/* XP Animation Overlay */}
          {showXpAnimation && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.8 }}
              className="absolute top-4 right-4 bg-wiz-primary/90 text-white px-3 py-2 rounded-full flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span className="font-bold">+{xpEarned} XP</span>
            </motion.div>
          )}

          {/* Watch Progress */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-4">
            <div className="flex items-center space-x-2 text-white text-sm">
              <Clock className="w-4 h-4" />
              <span>Watch Progress</span>
              <Progress value={watchProgress} className="flex-1 h-2" />
              <span>{Math.round(watchProgress)}%</span>
            </div>
          </div>
        </div>

        {/* Video Info */}
        <div className="p-4 space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{title}</h3>
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </div>

          {/* Engagement Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant={liked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                disabled={!user || liked}
                className={liked ? "bg-red-500 hover:bg-red-600" : ""}
              >
                <Heart className={`w-4 h-4 mr-2 ${liked ? 'fill-current' : ''}`} />
                {liked ? 'Liked' : 'Like'} (+5 XP)
              </Button>

              <Button
                variant={commented ? "default" : "outline"}
                size="sm"
                onClick={handleComment}
                disabled={!user || commented}
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                {commented ? 'Commented' : 'Comment'} (+15 XP)
              </Button>

              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            <Badge variant="secondary" className="bg-wiz-primary/20 text-wiz-primary">
              <Zap className="w-3 h-3 mr-1" />
              {xpReward} XP Reward
            </Badge>
          </div>

          {/* XP Earned Summary */}
          {xpEarned > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-wiz-primary/10 border border-wiz-primary/20 rounded-lg p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">XP Earned This Session</span>
                <div className="flex items-center space-x-1 text-wiz-primary font-bold">
                  <Zap className="w-4 h-4" />
                  <span>{xpEarned} XP</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
