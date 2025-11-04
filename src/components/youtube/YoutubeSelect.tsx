/**
 * YouTube Select - Step 2
 *
 * Display grid of fetched videos with checkbox selection.
 * Premium liquid-glass cards with hover effects.
 * Categorization happens in the next step (YoutubeCategorize).
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, Circle, Play, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { YouTubeVideo } from '@/lib/youtube-api';

interface YoutubeSelectProps {
  videos: YouTubeVideo[];
  onNext: (selectedVideos: YouTubeVideo[]) => void;
  onBack: () => void;
}

export const YoutubeSelect: React.FC<YoutubeSelectProps> = ({ videos, onNext, onBack }) => {
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(new Set());

  const toggleVideo = (videoId: string) => {
    setSelectedVideoIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(videoId)) {
        newSet.delete(videoId);
      } else {
        newSet.add(videoId);
      }
      return newSet;
    });
  };

  const handleNext = () => {
    const selected = videos.filter(v => selectedVideoIds.has(v.id));
    onNext(selected);
  };

  const canProceed = selectedVideoIds.size > 0;

  const formatDuration = (duration: string): string => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return duration;

    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    if (hours) return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    if (minutes) return `${minutes}:${seconds.padStart(2, '0')}`;
    return `0:${seconds.padStart(2, '0')}`;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 p-6"
      >
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
          Select Videos to Publish
        </h2>
        <p className="text-gray-700">
          Choose which videos to feature on WIZUP Discover. Selected: <span className="font-semibold text-purple-600">{selectedVideoIds.size}</span>
        </p>
        <p className="text-sm text-gray-600 mt-2">
          You'll assign categories to each video in the next step.
        </p>
      </motion.div>

      {/* Video Grid */}
      {videos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-2xl bg-white/50 backdrop-blur-xl border border-gray-200 p-12 text-center"
        >
          <p className="text-gray-600 text-lg">No videos found on your channel</p>
          <Button onClick={onBack} variant="outline" className="mt-4">
            Go Back
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {videos.map((video, index) => {
            const isSelected = selectedVideoIds.has(video.id);

            return (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -8, scale: 1.02 }}
                onClick={() => toggleVideo(video.id)}
                className={`
                  relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300
                  ${isSelected
                    ? 'ring-4 ring-purple-500 shadow-2xl'
                    : 'ring-1 ring-gray-200 hover:ring-purple-300 shadow-lg'
                  }
                `}
              >
                {/* Thumbnail */}
                <div className="relative aspect-video bg-gray-900">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                  {/* Duration Badge */}
                  <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/80 backdrop-blur-sm text-white text-xs font-semibold">
                    {formatDuration(video.duration)}
                  </div>
                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Play className="w-12 h-12 text-white drop-shadow-lg" fill="white" />
                  </div>
                  {/* Selection Indicator */}
                  <div className="absolute top-2 left-2">
                    {isSelected ? (
                      <CheckCircle2 className="w-8 h-8 text-purple-500 drop-shadow-lg" fill="white" />
                    ) : (
                      <Circle className="w-8 h-8 text-white drop-shadow-lg" />
                    )}
                  </div>
                </div>

                {/* Video Info */}
                <div className="p-4 bg-white/80 backdrop-blur-xl space-y-3">
                  <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-snug">
                    {video.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {parseInt(video.views).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(video.publishedAt)}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between gap-4 pt-4"
      >
        <Button
          onClick={onBack}
          variant="outline"
          className="px-6 py-3 rounded-full text-gray-700 border-2 border-gray-300 hover:border-gray-400"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={handleNext}
          disabled={!canProceed}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 text-white font-semibold hover:scale-105 transition-transform shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {selectedVideoIds.size === 0 ? (
            <>Select Videos</>
          ) : (
            <>
              Next: Categorize ({selectedVideoIds.size})
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default YoutubeSelect;
