import React from 'react';
import { motion } from 'framer-motion';
import { Pin, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Post } from './Placeholders';

interface PinnedPostBarProps {
  pinnedPosts: Post[];
  onPostClick: (postId: string) => void;
}

/**
 * Pinned Post Bar Component
 * - Shows pinned posts at top of feed
 * - Carousel-style display if multiple pinned posts
 * - Click to scroll to pinned post in feed
 */
export const PinnedPostBar: React.FC<PinnedPostBarProps> = ({
  pinnedPosts,
  onPostClick,
}) => {
  if (pinnedPosts.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-500 shadow-md">
            <Pin className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">
              Pinned Posts
              <span className="ml-2 text-sm text-gray-600">
                ({pinnedPosts.length})
              </span>
            </h3>
            <p className="text-xs text-gray-600">
              Important announcements from the community
            </p>
          </div>
        </div>

        {/* Pinned Posts List */}
        <div className="space-y-2">
          {pinnedPosts.map((post, index) => (
            <motion.button
              key={post.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onPostClick(post.id)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl transition-all',
                'bg-white hover:bg-amber-50 border border-amber-200 hover:border-amber-300',
                'text-left group'
              )}
            >
              {/* Author Avatar */}
              <img
                src={post.authorAvatar}
                alt={post.authorName}
                className="w-10 h-10 rounded-lg"
              />

              {/* Post Preview */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-900">
                    {post.authorName}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-gray-700 line-clamp-1">
                  {post.content}
                </p>
              </div>

              {/* Arrow Icon */}
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
