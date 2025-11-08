import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Compass, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { signInWithGoogleAndRedirect } from '@/lib/auth';
import { useDiscoverVideosQuery } from '@/hooks/useDiscoverVideosQuery';
import { DiscoverCard } from './DiscoverCard';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Discover Preview Section - PUBLIC VIDEOS ONLY
 * 
 * Data Source: /videos collection (visibility === 'public')
 * Enriched with creator metadata from /creators
 * Real-time sync via TanStack Query + Firestore listeners
 * World-class liquid glass UI
 */
export function DiscoverPreview() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  // Fetch public discover videos (limit 6 for homepage preview)
  const { data: videos = [], isLoading, error } = useDiscoverVideosQuery();
  
  // Take first 6 for preview
  const previewVideos = videos.slice(0, 6);

  const handleVideoClick = async (videoId: string) => {
    if (!user) {
      setIsAuthenticating(true);
      try {
        await signInWithGoogleAndRedirect(navigate);
      } catch (err) {
        console.error('Sign in failed:', err);
      } finally {
        setIsAuthenticating(false);
      }
    } else {
      navigate(`/watch/${videoId}`);
    }
  };

  const handleExploreAll = async () => {
    if (!user) {
      setIsAuthenticating(true);
      try {
        await signInWithGoogleAndRedirect(navigate);
      } catch (err) {
        console.error('Sign in failed:', err);
      } finally {
        setIsAuthenticating(false);
      }
    } else {
      navigate('/discover');
    }
  };

  // Error state
  if (error) {
    console.error('❌ Error loading discover videos:', error);
  }

  return (
    <section 
      id="discover" 
      className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-white via-[#f7f9fc] to-[#eef1f7]" />

      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/70 backdrop-blur-lg border border-violet-200 shadow-lg mb-6">
            <Compass className="w-4 h-4 text-violet-600" />
            <span className="text-sm font-semibold text-gray-700">
              Discover Content
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Explore Amazing Content
            </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Watch, learn, and earn ZAPs from thousands of creator videos
          </p>
        </motion.div>

        {/* Video Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-video rounded-xl" />
            ))}
          </div>
        ) : previewVideos.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto p-8 rounded-2xl bg-white/70 backdrop-blur-xl border border-gray-200 shadow-lg">
              <Compass className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Content Yet
              </h3>
              <p className="text-gray-600">
                Check back soon for amazing creator content!
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {previewVideos.map((video, index) => (
              <DiscoverCard
                key={video.id}
                video={video}
                index={index}
                onVideoClick={() => handleVideoClick(video.id)}
              />
            ))}
          </div>
        )}

        {/* Bottom CTA */}
        {previewVideos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-12"
          >
            <Button
              onClick={handleExploreAll}
              disabled={isAuthenticating}
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-purple-500 text-white rounded-full px-8 py-6 text-lg font-semibold shadow-xl hover:scale-105 transition-transform"
            >
              {isAuthenticating ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : user ? (
                <>
                  Explore All Content
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              ) : (
                <>
                  Sign In to Explore
                  <ChevronRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
