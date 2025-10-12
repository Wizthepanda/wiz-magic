import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Play, BookOpen, Users, Info, Zap } from 'lucide-react';
import { VideoGrid } from './VideoGrid';
import type { CreatorVideo, CreatorProfileV2Data } from '../CreatorPublicProfileV2';

interface CreatorTabsProps {
  videos: CreatorVideo[];
  creator: CreatorProfileV2Data;
  onVideoClick: (video: CreatorVideo) => void;
}

/**
 * CreatorTabs Component
 *
 * Tabbed navigation with:
 * - Videos (default) - 3-column grid with infinite scroll
 * - Courses - placeholder for future courses
 * - Community - info about creator community
 * - About - creator bio and social links
 */
export const CreatorTabs = ({ videos, creator, onVideoClick }: CreatorTabsProps) => {
  const [activeTab, setActiveTab] = useState('videos');

  return (
    <Tabs defaultValue="videos" value={activeTab} onValueChange={setActiveTab} className="w-full">
      {/* Tabs List - Sticky on scroll */}
      <div className="sticky top-16 z-20 bg-gradient-to-br from-slate-50/95 via-white/95 to-purple-50/30 backdrop-blur-md pb-2 -mx-2 px-2">
        <TabsList className="w-full h-auto p-1.5 bg-white/70 backdrop-blur-sm shadow-sm rounded-xl border border-gray-100">
          <TabsTrigger
            value="videos"
            className="flex-1 h-11 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            aria-label="Videos tab"
          >
            <Play className="w-4 h-4 mr-2" />
            Videos
          </TabsTrigger>
          <TabsTrigger
            value="courses"
            className="flex-1 h-11 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            aria-label="Courses tab"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Courses
          </TabsTrigger>
          <TabsTrigger
            value="community"
            className="flex-1 h-11 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            aria-label="Community tab"
          >
            <Users className="w-4 h-4 mr-2" />
            Community
          </TabsTrigger>
          <TabsTrigger
            value="about"
            className="flex-1 h-11 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-violet-500 data-[state=active]:text-white data-[state=active]:shadow-md transition-all"
            aria-label="About tab"
          >
            <Info className="w-4 h-4 mr-2" />
            About
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Tab Content with Animations */}
      <div className="mt-6">
        {/* Videos Tab */}
        <TabsContent value="videos" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <VideoGrid videos={videos} onVideoClick={onVideoClick} />
          </motion.div>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-100"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center"
            >
              <BookOpen className="w-10 h-10 text-indigo-500" />
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Courses Available Yet</h3>
            <p className="text-gray-600">
              {creator.name} hasn't created any courses yet. Check back soon!
            </p>
          </motion.div>
        </TabsContent>

        {/* Community Tab */}
        <TabsContent value="community" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-100"
          >
            <div className="flex items-start gap-4 mb-6">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0"
              >
                <Users className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Join {creator.name}'s Community
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Connect with like-minded creators, get exclusive content, and be part of something special.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  Community Benefits
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-0.5">✓</span>
                    <span>Exclusive behind-the-scenes content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-0.5">✓</span>
                    <span>Direct access to {creator.name}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-0.5">✓</span>
                    <span>Early access to new content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-600 mt-0.5">✓</span>
                    <span>Connect with fellow community members</span>
                  </li>
                </ul>
              </div>

              <p className="text-sm text-gray-600 text-center">
                Community features coming soon. Stay tuned!
              </p>
            </div>
          </motion.div>
        </TabsContent>

        {/* About Tab */}
        <TabsContent value="about" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-100"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Info className="w-6 h-6 text-indigo-500" />
              About {creator.name}
            </h3>

            <div className="space-y-6">
              {/* Bio */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Bio</h4>
                <p className="text-gray-700 leading-relaxed">{creator.bio}</p>
              </div>

              {/* Category */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Category</h4>
                <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-700">
                  {creator.category}
                </span>
              </div>

              {/* Social Links (if available) */}
              {creator.socials && Object.keys(creator.socials).length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Connect</h4>
                  <div className="space-y-2">
                    {creator.socials.website && (
                      <a
                        href={creator.socials.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        <span className="text-sm">🌐 Website</span>
                      </a>
                    )}
                    {creator.socials.twitter && (
                      <a
                        href={`https://twitter.com/${creator.socials.twitter}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        <span className="text-sm">𝕏 Twitter</span>
                      </a>
                    )}
                    {creator.socials.youtube && (
                      <a
                        href={`https://youtube.com/${creator.socials.youtube}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        <span className="text-sm">📺 YouTube</span>
                      </a>
                    )}
                    {creator.socials.instagram && (
                      <a
                        href={`https://instagram.com/${creator.socials.instagram}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 transition-colors"
                      >
                        <span className="text-sm">📷 Instagram</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Stats */}
              <div className="pt-6 border-t border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">
                      {creator.stats.followers.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">Followers</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl">
                    <div className="text-2xl font-bold text-gray-900">Lv.{creator.level}</div>
                    <div className="text-sm text-gray-600 mt-1">Creator Level</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </div>
    </Tabs>
  );
};
