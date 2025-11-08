/**
 * Player Context - Single source of truth for video playback across the app
 * Prevents multiple video players from opening simultaneously
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface VideoData {
  id: string;
  videoId: string;
  title: string;
  description?: string;
  thumbnail: string;
  duration: string;
  views?: string;
  xpReward: number;
  creator: {
    id: string;
    name: string;
    avatar: string;
    subscribers?: string;
    isVerified?: boolean;
    level?: number;
  };
  tags?: string[];
  category?: string;
  subcategory?: string;
}

interface PlayerContextType {
  currentVideo: VideoData | null;
  queue: VideoData[];
  isPlaying: boolean;
  play: (video: VideoData) => void;
  setQueue: (videos: VideoData[]) => void;
  playNext: () => void;
  close: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider = ({ children }: { children: ReactNode }) => {
  const [currentVideo, setCurrentVideo] = useState<VideoData | null>(null);
  const [queue, setQueue] = useState<VideoData[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const play = (video: VideoData) => {
    console.log('🎬 PlayerContext: Playing video:', video.title);
    setCurrentVideo(video);
    setIsPlaying(true);
  };

  const setQueueVideos = (videos: VideoData[]) => {
    console.log('📋 PlayerContext: Setting queue with', videos.length, 'videos');
    setQueue(videos);
  };

  const playNext = () => {
    if (queue.length > 0) {
      const nextVideo = queue[0];
      const remainingQueue = queue.slice(1);
      console.log('⏭️ PlayerContext: Playing next video:', nextVideo.title);
      setCurrentVideo(nextVideo);
      setQueue(remainingQueue);
    } else {
      console.log('⏭️ PlayerContext: No more videos in queue');
      close();
    }
  };

  const close = () => {
    console.log('❌ PlayerContext: Closing player');
    setCurrentVideo(null);
    setIsPlaying(false);
  };

  return (
    <PlayerContext.Provider
      value={{
        currentVideo,
        queue,
        isPlaying,
        play,
        setQueue: setQueueVideos,
        playNext,
        close,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};
