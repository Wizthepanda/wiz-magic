import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';

/**
 * CreatorProfileSkeleton
 *
 * Premium loading skeleton with fade-in shimmer effect
 * Matches the layout of CreatorPublicProfileV2
 */
export const CreatorProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50/30">
      {/* Back to Discover Button Skeleton */}
      <div className="fixed top-6 left-6 z-50">
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/80 backdrop-blur-md border border-gray-200/50 shadow-lg">
          <ArrowLeft className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-semibold text-gray-400">Back to Discover</span>
        </div>
      </div>

      <div>
        {/* Hero Section Skeleton */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="relative w-full"
        >
        {/* Banner Skeleton */}
        <div className="relative h-[280px] bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />

        {/* Profile Info Skeleton */}
        <div className="max-w-[1200px] mx-auto px-6 lg:px-8">
          <div className="relative -mt-20 pb-6 flex flex-col md:flex-row items-center md:items-end gap-6">
            {/* Avatar Skeleton */}
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-2xl bg-gray-300 animate-pulse" />
            </div>

            {/* Info Skeleton */}
            <div className="flex-1 text-center md:text-left space-y-3 pb-2">
              {/* Name */}
              <div className="h-8 w-48 bg-gray-300 rounded-lg animate-pulse mx-auto md:mx-0" />

              {/* Handle */}
              <div className="h-5 w-32 bg-gray-200 rounded-md animate-pulse mx-auto md:mx-0" />

              {/* Stats */}
              <div className="flex items-center justify-center md:justify-start gap-6 mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex flex-col items-center md:items-start">
                    <div className="h-6 w-16 bg-gray-300 rounded animate-pulse mb-1" />
                    <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>

            {/* Buttons Skeleton */}
            <div className="flex gap-3">
              <div className="h-11 w-32 bg-gray-300 rounded-full animate-pulse" />
              <div className="h-11 w-32 bg-gray-200 rounded-full animate-pulse" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content Grid Skeleton */}
      <div className="max-w-[1200px] mx-auto px-6 lg:px-8 mt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
          {/* Left Column Skeleton */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Tabs Skeleton */}
            <div className="flex gap-4 border-b border-gray-200 pb-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-10 w-24 bg-gray-300 rounded animate-pulse"
                />
              ))}
            </div>

            {/* Video Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="bg-white/60 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gray-300 animate-pulse" />

                  {/* Video Info */}
                  <div className="p-4 space-y-3">
                    <div className="h-5 w-full bg-gray-300 rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
                    <div className="flex items-center justify-between">
                      <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right Column Skeleton */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="space-y-6"
          >
            {/* About Section Skeleton */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="h-6 w-32 bg-gray-300 rounded animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Social Links Skeleton */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="h-6 w-28 bg-gray-300 rounded animate-pulse" />
              <div className="flex gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"
                  />
                ))}
              </div>
            </div>

            {/* Up Next Skeleton */}
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="h-6 w-24 bg-gray-300 rounded animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-32 h-20 bg-gray-300 rounded animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-full bg-gray-300 rounded animate-pulse" />
                      <div className="h-3 w-3/4 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  );
};
