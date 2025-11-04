/**
 * YouTube Categorize - Step 3
 *
 * Dedicated step for assigning categories and subcategories to selected videos.
 * Clean, Apple Music-inspired UI with delightful animations.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, Circle, Tag, Sparkles, Play, Eye, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { YouTubeVideo } from '@/lib/youtube-api';
import { CATEGORIES } from '@/lib/categories';
import { cn } from '@/lib/utils';

export interface VideoWithCategory extends YouTubeVideo {
  category?: string;
  subcategory?: string;
}

interface YoutubeCategorizeProps {
  videos: VideoWithCategory[];
  onNext: (categorizedVideos: VideoWithCategory[]) => void;
  onBack: () => void;
}

export const YoutubeCategorize: React.FC<YoutubeCategorizeProps> = ({
  videos,
  onNext,
  onBack,
}) => {
  // Track which videos are selected (all selected by default)
  const [selectedVideoIds, setSelectedVideoIds] = useState<Set<string>>(
    () => new Set(videos.map(v => v.id))
  );

  const [videoCategories, setVideoCategories] = useState<Record<string, { category: string; subcategory: string }>>(() => {
    // Initialize with existing categories if any
    const initial: Record<string, { category: string; subcategory: string }> = {};
    videos.forEach(video => {
      if (video.category && video.subcategory) {
        initial[video.id] = {
          category: video.category,
          subcategory: video.subcategory,
        };
      }
    });
    return initial;
  });

  const [bulkCategory, setBulkCategory] = useState('');
  const [bulkSubcategory, setBulkSubcategory] = useState('');
  const [showBulkPopover, setShowBulkPopover] = useState(false);

  // Toggle video selection
  const toggleVideoSelection = (videoId: string) => {
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

  // Handle category change for individual video
  const handleCategoryChange = (videoId: string, category: string) => {
    setVideoCategories(prev => ({
      ...prev,
      [videoId]: {
        category,
        subcategory: '', // Reset subcategory when category changes
      },
    }));
  };

  // Handle subcategory change for individual video
  const handleSubcategoryChange = (videoId: string, subcategory: string) => {
    setVideoCategories(prev => ({
      ...prev,
      [videoId]: {
        ...prev[videoId],
        subcategory,
      },
    }));
  };

  // Apply bulk category and subcategory to SELECTED videos only
  const handleApplyToAll = () => {
    if (!bulkCategory || !bulkSubcategory) return;

    const updates: Record<string, { category: string; subcategory: string }> = { ...videoCategories };
    videos.forEach(video => {
      // Only apply to SELECTED videos
      if (selectedVideoIds.has(video.id)) {
        updates[video.id] = {
          category: bulkCategory,
          subcategory: bulkSubcategory,
        };
      }
    });

    setVideoCategories(updates);
    setShowBulkPopover(false);
    setBulkCategory('');
    setBulkSubcategory('');
  };

  // Get only SELECTED videos
  const selectedVideos = videos.filter(v => selectedVideoIds.has(v.id));

  // Check if all SELECTED videos have both category and subcategory
  const allCategorized = selectedVideos.every(video => {
    const cat = videoCategories[video.id];
    return cat?.category && cat?.subcategory;
  });

  const categorizedCount = selectedVideos.filter(video => {
    const cat = videoCategories[video.id];
    return cat?.category && cat?.subcategory;
  }).length;

  // Proceed to next step with ONLY selected and categorized videos
  const handleNext = () => {
    const categorized = selectedVideos
      .filter(video => {
        const cat = videoCategories[video.id];
        return cat?.category && cat?.subcategory;
      })
      .map(video => ({
        ...video,
        category: videoCategories[video.id]?.category,
        subcategory: videoCategories[video.id]?.subcategory,
      }));
    onNext(categorized);
  };

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

  const bulkCategoryData = CATEGORIES.find(cat => cat.value === bulkCategory);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="rounded-2xl bg-gradient-to-r from-purple-50 via-pink-50 to-violet-50 border border-purple-100 p-8"
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="w-6 h-6 text-purple-600" />
              <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Select Videos & Categories
              </h2>
            </div>
            <p className="text-gray-700 text-lg">
              Choose which videos to publish and organize them for better discovery.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">
              Step 2 of 3
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span className="font-medium">
              {selectedVideoIds.size} of {videos.length} videos selected
            </span>
            <span className="font-semibold text-purple-600">
              {categorizedCount} of {selectedVideoIds.size} categorized
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: selectedVideoIds.size > 0 ? `${(categorizedCount / selectedVideoIds.size) * 100}%` : '0%' }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Apply to All - Floating Action */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-end"
      >
        <Popover open={showBulkPopover} onOpenChange={setShowBulkPopover}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="rounded-full px-6 py-2 bg-white/80 backdrop-blur-sm border-2 border-purple-300 hover:border-purple-400 hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-4 h-4 mr-2 text-purple-600" />
              <span className="font-semibold text-purple-700">Apply to All Videos</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-6 rounded-2xl border-purple-200 shadow-2xl">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Quick Assign</h4>
                <p className="text-sm text-gray-600">
                  Apply the same category to all {videos.length} videos
                </p>
              </div>

              <div className="space-y-3">
                {/* Bulk Category */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Category
                  </label>
                  <Select value={bulkCategory} onValueChange={setBulkCategory}>
                    <SelectTrigger className="w-full rounded-xl border-purple-200 focus:ring-purple-400">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Bulk Subcategory */}
                {bulkCategory && bulkCategoryData && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                      Subcategory
                    </label>
                    <Select value={bulkSubcategory} onValueChange={setBulkSubcategory}>
                      <SelectTrigger className="w-full rounded-xl border-pink-200 focus:ring-pink-400">
                        <SelectValue placeholder="Select Subcategory" />
                      </SelectTrigger>
                      <SelectContent>
                        {bulkCategoryData.subcategories.map(sub => (
                          <SelectItem key={sub} value={sub}>
                            {sub}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </motion.div>
                )}
              </div>

              <Button
                onClick={handleApplyToAll}
                disabled={!bulkCategory || !bulkSubcategory || selectedVideoIds.size === 0}
                className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg disabled:opacity-50"
              >
                Apply to {selectedVideoIds.size} Selected Video{selectedVideoIds.size !== 1 ? 's' : ''}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </motion.div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => {
          const videoCat = videoCategories[video.id];
          const isSelected = selectedVideoIds.has(video.id);
          const isComplete = videoCat?.category && videoCat?.subcategory;
          const categoryData = CATEGORIES.find(cat => cat.value === videoCat?.category);

          return (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                'relative rounded-2xl overflow-hidden transition-all duration-300',
                'bg-white shadow-md hover:shadow-2xl',
                isSelected && isComplete && 'ring-2 ring-green-400 shadow-green-100',
                isSelected && !isComplete && 'ring-2 ring-purple-400 shadow-purple-100',
                !isSelected && 'opacity-60 grayscale'
              )}
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

                {/* Selection Checkbox - Top Left */}
                <div className="absolute top-2 left-2">
                  <button
                    onClick={() => toggleVideoSelection(video.id)}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-all duration-200',
                      isSelected
                        ? 'bg-purple-500 hover:bg-purple-600'
                        : 'bg-white/80 backdrop-blur-sm hover:bg-white'
                    )}
                  >
                    {isSelected ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-600" />
                    )}
                  </button>
                </div>

                {/* Completion Checkmark - Top Right */}
                {isSelected && isComplete && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Video Info & Category Selection */}
              <div className="p-4 space-y-4">
                {/* Title */}
                <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm leading-snug">
                  {video.title}
                </h3>

                {/* Stats */}
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

                {/* Divider */}
                <div className="border-t border-gray-200" />

                {/* Category Selection */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-gray-700">
                    <Tag className="w-3.5 h-3.5 text-purple-600" />
                    <span className="font-medium">Category Assignment</span>
                    <span className="text-red-500">*</span>
                  </div>

                  {/* Category Dropdown */}
                  <Select
                    value={videoCat?.category || ''}
                    onValueChange={(value) => handleCategoryChange(video.id, value)}
                  >
                    <SelectTrigger
                      className={cn(
                        'w-full rounded-xl transition-all duration-200',
                        videoCat?.category
                          ? 'border-purple-300 bg-purple-50/50 text-purple-700 font-medium'
                          : 'border-gray-200 hover:border-purple-200'
                      )}
                    >
                      <SelectValue placeholder="Select Category..." />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Subcategory Dropdown (shows when category selected) */}
                  <AnimatePresence mode="wait">
                    {videoCat?.category && categoryData && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Select
                          value={videoCat?.subcategory || ''}
                          onValueChange={(value) => handleSubcategoryChange(video.id, value)}
                        >
                          <SelectTrigger
                            className={cn(
                              'w-full rounded-xl transition-all duration-200',
                              videoCat?.subcategory
                                ? 'border-pink-300 bg-pink-50/50 text-pink-700 font-medium'
                                : 'border-gray-200 hover:border-pink-200'
                            )}
                          >
                            <SelectValue placeholder="Select Subcategory..." />
                          </SelectTrigger>
                          <SelectContent>
                            {categoryData.subcategories.map(sub => (
                              <SelectItem key={sub} value={sub}>
                                {sub}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Category Pills Preview */}
                  {videoCat?.category && videoCat?.subcategory && (
                    <motion.div
                      initial={{ opacity: 0, y: -5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-2 flex-wrap"
                    >
                      <Badge className="bg-gradient-to-r from-purple-100 to-purple-50 text-purple-700 border-purple-200">
                        {categoryData?.label}
                      </Badge>
                      <Badge className="bg-gradient-to-r from-pink-100 to-pink-50 text-pink-700 border-pink-200">
                        {videoCat.subcategory}
                      </Badge>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Help Text */}
      {selectedVideoIds.size === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-orange-50 border border-orange-200 p-4"
        >
          <p className="text-sm text-orange-800">
            ⚠️ <span className="font-semibold">No videos selected!</span> Click the checkboxes on videos to select them for publishing.
          </p>
        </motion.div>
      ) : !allCategorized ? (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-blue-50 border border-blue-200 p-4"
        >
          <p className="text-sm text-blue-800">
            💡 <span className="font-semibold">Tip:</span> Use "Apply to {selectedVideoIds.size} Selected Videos" if they belong to the same category, or assign individually for more precise discovery.
          </p>
        </motion.div>
      ) : null}

      {/* Footer Actions */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="flex items-center justify-between gap-4 pt-6 pb-4"
      >
        <Button
          onClick={onBack}
          variant="ghost"
          className="px-6 py-3 rounded-full text-gray-700 hover:bg-gray-100"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-4">
          {/* Progress Text */}
          {selectedVideoIds.size > 0 && (
            <div className="text-sm text-gray-600">
              <span className="font-semibold text-purple-600">{selectedVideoIds.size} video{selectedVideoIds.size !== 1 ? 's' : ''}</span> selected
            </div>
          )}

          {/* Next Button */}
          <Button
            onClick={handleNext}
            disabled={!allCategorized || selectedVideoIds.size === 0}
            className={cn(
              'px-8 py-3 rounded-full font-semibold transition-all shadow-xl',
              'bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500',
              'hover:from-purple-600 hover:via-pink-600 hover:to-violet-600',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              allCategorized && 'hover:scale-105'
            )}
          >
            {allCategorized ? (
              <>
                Next: Publish {selectedVideoIds.size} Video{selectedVideoIds.size !== 1 ? 's' : ''}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            ) : (
              <>
                Categorize Remaining ({selectedVideoIds.size - categorizedCount} left)
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default YoutubeCategorize;

