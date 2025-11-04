/**
 * YouTube Publish - Step 3
 *
 * Review selected videos and publish to WIZUP Discover.
 * Shows preview + confirmation before publishing.
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Loader2, Upload, AlertCircle, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useQueryClient } from '@tanstack/react-query';
import { CreatePublishedVideoPayload } from '@/types/discover';
import { VideoWithCategory } from './YoutubeCategorize';
import { CATEGORIES } from '@/lib/categories';

interface YoutubePublishProps {
  selectedVideos: VideoWithCategory[];
  channelId: string;
  channelTitle: string;
  channelHandle: string | null; // YouTube channel handle (e.g., @facelessavatars7049)
  onSuccess: (publishedIds: string[]) => void;
  onBack: () => void;
}

export const YoutubePublish: React.FC<YoutubePublishProps> = ({
  selectedVideos,
  channelId,
  channelTitle,
  channelHandle,
  onSuccess,
  onBack,
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validation: all videos must have both category & subcategory
  const allHaveCategories = selectedVideos.every(
    video => video.category && video.subcategory
  );
  const canPublish = allHaveCategories;

  const handlePublish = async () => {
    if (!user) {
      setError('User not authenticated');
      return;
    }

    if (!canPublish) {
      setError('All videos must have both category and subcategory assigned');
      return;
    }

    setIsPublishing(true);
    setError(null);

    try {
      const publishedIds: string[] = [];

      // Publish each selected video to /discover collection with its own category
      for (const video of selectedVideos) {
        const payload: CreatePublishedVideoPayload = {
          // Creator info
          creatorId: user.uid,
          creatorName: channelHandle || channelTitle, // Use YouTube channel handle as username
          creatorAvatar: user.photoURL || '',

          // YouTube channel info
          youtubeChannelId: channelId,
          youtubeChannelTitle: channelTitle,

          // Video info
          videoId: video.id,
          title: video.title,
          description: video.description,
          thumbnail: video.thumbnail,
          duration: video.duration,
          videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
          videoPublishedAt: video.publishedAt,
          videoViews: video.views,
          videoTags: video.tags || [],

          // Category & Subcategory (REQUIRED) - Per Video
          category: video.category!,
          subcategory: video.subcategory!,
          tags: [video.subcategory!, video.category!], // Auto-generated tags

          // Metadata
          type: 'youtube_video',
          status: 'published',
          visibility: 'public',

          // Engagement tracking
          totalViews: 0,
          totalZAPsEarned: 0,
          totalLikes: 0,
          totalShares: 0,
        };

        const docRef = await addDoc(collection(db, 'discover'), {
          ...payload,
          publishedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        });

        publishedIds.push(docRef.id);
        console.log(`✅ Published video ${video.id} to Discover with category: ${video.category}, subcategory: ${video.subcategory}`);
      }

      // Invalidate React Query caches to refresh Discover feed and filters
      await queryClient.invalidateQueries({ queryKey: ['discover', 'feed'] });
      await queryClient.invalidateQueries({ queryKey: ['filters'] });
      await queryClient.invalidateQueries({ queryKey: ['discover'] });

      // Success! Move to next step
      onSuccess(publishedIds);
    } catch (err: any) {
      console.error('Publish error:', err);
      setError(err.message || 'Failed to publish videos. Please try again.');
      setIsPublishing(false);
    }
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
          Ready to Publish
        </h2>
        <p className="text-gray-700">
          Publishing <span className="font-semibold text-purple-600">{selectedVideos.length}</span> video{selectedVideos.length !== 1 ? 's' : ''} to WIZUP Discover
        </p>
        <p className="text-sm text-gray-600 mt-2">
          Each video has been assigned its own category and subcategory for accurate discovery filtering.
        </p>
      </motion.div>

      {/* Selected Videos Preview with Category Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedVideos.map((video, index) => {
          const categoryData = CATEGORIES.find(cat => cat.value === video.category);

          return (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="relative rounded-xl overflow-hidden bg-white/50 backdrop-blur-xl border border-gray-200 shadow-lg"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video bg-gray-900">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                {/* Category Badges Overlay */}
                {video.category && video.subcategory && (
                  <div className="absolute top-2 right-2 flex flex-col gap-1">
                    <span className="px-2 py-1 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-bold shadow-lg backdrop-blur-sm">
                      {categoryData?.label || video.category}
                    </span>
                    <span className="px-2 py-1 rounded-lg bg-gradient-to-r from-pink-500 to-pink-600 text-white text-xs font-bold shadow-lg backdrop-blur-sm">
                      {video.subcategory}
                    </span>
                  </div>
                )}
              </div>

              {/* Title & Category Pills */}
              <div className="p-3 space-y-2">
                <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm">
                  {video.title}
                </h3>

                {/* Category Pills */}
                {video.category && video.subcategory && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Tag className="w-3 h-3 text-gray-500" />
                    <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-700 text-xs font-medium">
                      {categoryData?.label}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-pink-100 text-pink-700 text-xs font-medium">
                      {video.subcategory}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100 p-6"
      >
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Upload className="w-5 h-5 text-purple-600" />
          What happens after publishing?
        </h3>
        <div className="space-y-2 text-sm text-gray-700">
          <p>✓ Your videos will appear on the WIZUP Discover page</p>
          <p>✓ Users can watch and earn ZAPs for engagement</p>
          <p>✓ You'll earn ZAPs when users complete your quests</p>
          <p>✓ Track analytics in your Creator Studio dashboard</p>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-red-50 border border-red-200 text-red-700"
        >
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </motion.div>
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
          disabled={isPublishing}
          variant="outline"
          className="px-6 py-3 rounded-full text-gray-700 border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button
          onClick={handlePublish}
          disabled={isPublishing || !canPublish}
          className="px-8 py-3 rounded-full bg-gradient-to-r from-[#ff416c] to-[#ff4b2b] text-white font-semibold hover:scale-105 transition-transform shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Publishing {selectedVideos.length} video{selectedVideos.length !== 1 ? 's' : ''}...
            </>
          ) : !canPublish ? (
            <>
              Missing Categories
              <ArrowRight className="w-4 h-4 ml-2 opacity-50" />
            </>
          ) : (
            <>
              Publish {selectedVideos.length} to Discover
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};

export default YoutubePublish;
