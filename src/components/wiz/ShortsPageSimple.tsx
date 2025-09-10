import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Heart, Share2, MessageCircle, Star, ArrowUp, ArrowDown } from "lucide-react";
import { LocalVideoPlayer } from "@/components/ui/local-video-player";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Short {
  id: string;
  videoId: string;
  title: string;
  creator: {
    name: string;
    avatar?: string;
  };
  xpReward: number;
}

interface ShortsPageSimpleProps {
  onClose?: () => void;
}

export function ShortsPageSimple({ onClose }: ShortsPageSimpleProps) {
  const [shorts, setShorts] = useState<Short[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('📱 Loading shorts...');
    const shortsQuery = query(
      collection(db, 'creatorVideos'),
      orderBy('addedToWiz', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(shortsQuery, (snapshot) => {
      const shortsData: Short[] = [];
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        // Only include actual shorts
        if (data.contentType === 'short' && data.status === 'active' && data.videoId) {
          shortsData.push({
            id: doc.id,
            videoId: data.videoId,
            title: data.title || 'Untitled Short',
            creator: {
              name: data.creatorName || 'Unknown Creator',
              avatar: data.creatorAvatar || '/Profile Pics/default.jpg'
            },
            xpReward: Math.floor(Math.random() * 10) + 5
          });
        }
      });

      console.log('📱 Loaded shorts:', shortsData.length);
      setShorts(shortsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const currentShort = shorts[currentIndex];

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-white">Loading shorts...</div>
      </div>
    );
  }

  if (!currentShort) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
        <div className="text-center text-white">
          <h2 className="text-xl mb-4">No shorts available</h2>
          {onClose && (
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-purple-600 rounded"
            >
              Go Back
            </button>
          )}
        </div>
      </div>
    );
  }

  const goNext = () => {
    if (currentIndex < shorts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'linear-gradient(180deg, #0A0F1C 0%, #141A2E 100%)'
      }}
    >
      {/* Close Button */}
      {onClose && (
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 z-10 p-2 text-white bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 transition-all"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {/* Main Shorts Container - Vertical Aspect Ratio */}
      <div 
        className="relative bg-black overflow-hidden"
        style={{
          width: 'min(100vw, 480px)',
          height: '100vh',
          maxHeight: '100vh',
          aspectRatio: '9/16'
        }}
      >
        {/* Video Player */}
        <LocalVideoPlayer
          url={`https://www.youtube.com/watch?v=${currentShort.videoId}`}
          onProgress={() => {}}
          onXpEarned={() => {}}
          className="w-full h-full object-cover"
          key={currentShort.id}
        />

        {/* Floating Action Buttons - Right Side */}
        <div className="absolute right-4 bottom-32 flex flex-col space-y-4 z-10">
          {/* Like Button */}
          <motion.button
            className="w-12 h-12 rounded-full bg-white bg-opacity-20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-opacity-30 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Heart className="w-6 h-6" />
          </motion.button>

          {/* Share Button */}
          <motion.button
            className="w-12 h-12 rounded-full bg-white bg-opacity-20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-opacity-30 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Share2 className="w-6 h-6" />
          </motion.button>

          {/* XP Badge */}
          <motion.div
            className="w-12 h-12 rounded-full bg-purple-600 bg-opacity-90 backdrop-blur-md border border-purple-400/30 flex items-center justify-center text-white font-bold text-xs"
            whileHover={{ scale: 1.1 }}
            style={{
              background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(59, 130, 246, 0.9) 100%)',
              boxShadow: '0 4px 16px rgba(147, 51, 234, 0.3)'
            }}
          >
            +{currentShort.xpReward}
          </motion.div>

          {/* Star Button */}
          <motion.button
            className="w-12 h-12 rounded-full bg-white bg-opacity-20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white hover:bg-opacity-30 transition-all"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Star className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Navigation Arrows - Right Side Bottom */}
        <div className="absolute right-4 bottom-16 flex flex-col space-y-3 z-10">
          <motion.button 
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="w-12 h-12 rounded-full bg-white bg-opacity-20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-30 transition-all"
            whileHover={{ scale: currentIndex > 0 ? 1.1 : 1 }}
            whileTap={{ scale: currentIndex > 0 ? 0.9 : 1 }}
          >
            <ArrowUp className="w-6 h-6" />
          </motion.button>
          <motion.button 
            onClick={goNext}
            disabled={currentIndex === shorts.length - 1}
            className="w-12 h-12 rounded-full bg-white bg-opacity-20 backdrop-blur-md border border-white/20 flex items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-30 transition-all"
            whileHover={{ scale: currentIndex < shorts.length - 1 ? 1.1 : 1 }}
            whileTap={{ scale: currentIndex < shorts.length - 1 ? 0.9 : 1 }}
          >
            <ArrowDown className="w-6 h-6" />
          </motion.button>
        </div>

        {/* Creator Info Overlay - Bottom Left */}
        <div className="absolute bottom-6 left-4 right-20 text-white z-10">
          <h3 className="text-lg font-bold mb-1 line-clamp-2">{currentShort.title}</h3>
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white text-sm font-bold">
              {currentShort.creator.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium">{currentShort.creator.name}</span>
          </div>
        </div>

        {/* Progress Indicator - Bottom Left */}
        <div className="absolute bottom-2 left-4 text-white text-xs opacity-70 z-10">
          {currentIndex + 1} of {shorts.length}
        </div>
      </div>
    </div>
  );
}