import { useState } from 'react';
import { Play, Eye, Heart, Share2, CheckCircle, Zap } from 'lucide-react';
import { WizVideoPlayer } from './wiz-video-player';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const categories = [
  { id: 'all', label: 'All', color: 'bg-wiz-primary' },
  { id: 'ai', label: 'AI', color: 'bg-wiz-secondary' },
  { id: 'tech', label: 'Tech', color: 'bg-wiz-accent' },
  { id: 'music', label: 'Music', color: 'bg-wiz-magic' },
  { id: 'money', label: 'Money', color: 'bg-emerald-500' },
  { id: 'health', label: 'Health', color: 'bg-rose-500' },
];

const videos = [
  {
    id: 1,
    title: 'Master AI Prompting in 2024',
    creator: 'AIGuru42',
    avatar: '',
    thumbnail: '',
    duration: '12:45',
    xpReward: 150,
    category: 'ai',
    views: '45K',
    watched: false,
    progress: 0,
    videoId: 'dQw4w9WgXcQ' // Demo video ID
  },
  {
    id: 2,
    title: 'Building Wealth Through Tech Investments',
    creator: 'MoneyWizard',
    avatar: '',
    thumbnail: '',
    duration: '18:30',
    xpReward: 220,
    category: 'money',
    views: '78K',
    watched: false,
    progress: 65,
    videoId: 'jNQXAC9IVRw' // Demo video ID
  },
  {
    id: 3,
    title: 'React 19 Features You Need to Know',
    creator: 'CodeMaster',
    avatar: '',
    thumbnail: '',
    duration: '15:20',
    xpReward: 180,
    category: 'tech',
    views: '32K',
    watched: true,
    progress: 100,
    videoId: 'ScMzIvxBSi4' // Demo video ID
  },
  {
    id: 4,
    title: 'Music Production Secrets Revealed',
    creator: 'BeatCreator',
    avatar: '',
    thumbnail: '',
    duration: '22:15',
    xpReward: 280,
    category: 'music',
    views: '56K',
    watched: false,
    progress: 0,
    videoId: 'ZbZSe6N_BXs' // Demo video ID
  }
];

export const WizDiscoverSection = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [watchedVideos, setWatchedVideos] = useState<number[]>([3]);
  const [selectedVideo, setSelectedVideo] = useState<typeof videos[0] | null>(null);
  const { user } = useAuth();

  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  const handleWatchVideo = (videoId: number) => {
    const video = videos.find(v => v.id === videoId);
    if (video) {
      setSelectedVideo(video);
    }
  };

  const closeVideoPlayer = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Category Bubbles */}
      <div className="flex flex-wrap gap-3">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className={`
              relative overflow-hidden transition-all duration-300
              ${selectedCategory === category.id 
                ? 'neon-glow bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white' 
                : 'hover:bg-wiz-primary/10 hover:border-wiz-primary/30'
              }
            `}
          >
            <div className={`w-2 h-2 rounded-full ${category.color} mr-2`} />
            {category.label}
            {selectedCategory === category.id && (
              <div className="absolute inset-0 bg-gradient-to-r from-wiz-accent/20 to-transparent" />
            )}
          </Button>
        ))}
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredVideos.map((video) => {
          const isWatched = watchedVideos.includes(video.id);
          const hasProgress = video.progress > 0 && video.progress < 100;
          
          return (
            <Card 
              key={video.id} 
              className="video-card glass-card border-card-border group overflow-hidden"
            >
              <CardContent className="p-0">
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Button
                      size="lg"
                      onClick={() => handleWatchVideo(video.id)}
                      className="wiz-play-button h-16 w-16 rounded-full p-0"
                    >
                      {isWatched ? (
                        <CheckCircle className="w-6 h-6 text-wiz-complete" fill="currentColor" />
                      ) : (
                        <Play className="w-6 h-6 text-white" fill="currentColor" />
                      )}
                    </Button>
                  </div>
                  
                  {/* Duration */}
                  <div className="absolute bottom-2 right-2 z-20 px-2 py-1 bg-black/70 rounded text-xs text-white">
                    {video.duration}
                  </div>
                  
                  {/* XP Reward */}
                  <div className="absolute top-2 right-2 z-20 flex items-center space-x-1 px-2 py-1 bg-wiz-primary/80 backdrop-blur-sm rounded-full">
                    <Zap className="w-3 h-3 text-wiz-accent" />
                    <span className="text-xs font-bold text-white">{video.xpReward}</span>
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-2 left-2 z-20">
                    <Badge variant="secondary" className="text-xs">
                      {video.category.toUpperCase()}
                    </Badge>
                  </div>
                  
                  {/* Progress Bar */}
                  {hasProgress && (
                    <div className="absolute bottom-0 left-0 right-0 z-20">
                      <Progress value={video.progress} className="h-1 bg-transparent" />
                    </div>
                  )}
                </div>
                
                {/* Content */}
                <div className="p-4 space-y-3">
                  <h3 className="font-semibold text-sm line-clamp-2 group-hover:text-wiz-primary transition-colors">
                    {video.title}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={video.avatar} />
                        <AvatarFallback className="text-xs bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white">
                          {video.creator.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-muted-foreground truncate">{video.creator}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{video.views}</span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      size="sm"
                      variant={isWatched ? "secondary" : "default"}
                      onClick={() => handleWatchVideo(video.id)}
                      className="flex-1 mr-2"
                    >
                      {isWatched ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Watched
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-1" />
                          Watch
                        </>
                      )}
                    </Button>
                    
                    <div className="flex space-x-1">
                      <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                        <Heart className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                        <Share2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* XP Progress for watched content */}
                  {isWatched && (
                    <div className="pt-2 border-t border-border/50">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-muted-foreground">XP Earned</span>
                        <span className="font-bold text-wiz-primary">+{video.xpReward} XP</span>
                      </div>
                      <div className="xp-progress h-2 bg-wiz-primary/20 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-wiz-primary to-wiz-secondary rounded-full w-full animate-pulse" />
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Load More */}
      <div className="text-center pt-6">
        <Button variant="outline" className="hover:bg-wiz-primary/10 hover:border-wiz-primary/30">
          Load More Content
        </Button>
      </div>

      {/* Video Player Modal */}
      <Dialog open={!!selectedVideo} onOpenChange={() => closeVideoPlayer()}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle>{selectedVideo?.title}</DialogTitle>
          </DialogHeader>
          {selectedVideo && (
            <div className="p-6 pt-0 h-full overflow-auto">
              <WizVideoPlayer
                videoId={selectedVideo.videoId}
                title={selectedVideo.title}
                description={`Created by ${selectedVideo.creator}`}
                xpReward={selectedVideo.xpReward}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};