/**
 * UpNextRail - Side panel showing upcoming videos in queue
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Zap } from 'lucide-react';
import { usePlayer } from '@/contexts/PlayerContext';
import { cn } from '@/lib/utils';

interface UpNextRailProps {
  isVisible: boolean;
}

export const UpNextRail: React.FC<UpNextRailProps> = ({ isVisible }) => {
  const { queue, play } = usePlayer();

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute top-0 right-0 bottom-0 w-96 bg-black/95 backdrop-blur-xl border-l border-white/10 overflow-y-auto"
        >
          <div className="p-6">
            <h3 className="text-lg font-bold text-white mb-4">
              Up Next ({queue.length})
            </h3>

            {queue.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400">No more videos in queue</p>
              </div>
            ) : (
              <div className="space-y-3">
                {queue.map((video, index) => (
                  <motion.div
                    key={video.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => play(video)}
                    className="group cursor-pointer p-3 rounded-xl hover:bg-white/5 transition-all"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video rounded-lg overflow-hidden mb-2 bg-gray-800">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />

                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                          <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" />
                        </div>
                      </div>

                      {/* Duration */}
                      <div className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 bg-black/80 rounded text-xs font-semibold text-white">
                        {video.duration}
                      </div>

                      {/* Queue Number */}
                      <div className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{index + 1}</span>
                      </div>

                      {/* XP Badge */}
                      <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 text-white" fill="currentColor" />
                        <span className="text-xs font-semibold text-white">+{video.xpReward}</span>
                      </div>
                    </div>

                    {/* Video Info */}
                    <h4 className="text-sm font-semibold text-white line-clamp-2 mb-1 group-hover:text-purple-400 transition-colors">
                      {video.title}
                    </h4>
                    <p className="text-xs text-gray-400">{video.creator.name}</p>
                    <p className="text-xs text-gray-500">{video.views}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
