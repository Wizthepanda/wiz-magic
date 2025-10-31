import React from 'react';
import { VideoCardRedesign, VideoCardData } from './VideoCardRedesign';

/**
 * VideoCardRedesign - Example Showcase
 *
 * This file demonstrates various use cases and configurations
 * of the VideoCardRedesign component.
 */

// Example 1: Standard video with verified creator
export const standardVideo: VideoCardData = {
  id: 'video-001',
  title: 'How to Build a Startup in 2025: Complete Guide',
  thumbnail: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800',
  thumbnailBlurred: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=50&blur=10',
  duration: '12:34',
  creator: {
    id: 'creator-001',
    name: 'Alex Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
    role: 'Tech Entrepreneur',
    verified: true
  },
  views: '1.2M',
  daysAgo: 5,
  zapsReward: 3
};

// Example 2: High reward video
export const highRewardVideo: VideoCardData = {
  id: 'video-002',
  title: 'Master React in 30 Days - Complete Bootcamp',
  thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
  duration: '45:20',
  creator: {
    id: 'creator-002',
    name: 'Sarah Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    role: 'Senior Developer',
    verified: true
  },
  views: '850K',
  daysAgo: 2,
  zapsReward: 10
};

// Example 3: New creator (unverified)
export const newCreatorVideo: VideoCardData = {
  id: 'video-003',
  title: 'My First Tutorial: JavaScript Basics for Beginners',
  thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800',
  duration: '8:15',
  creator: {
    id: 'creator-003',
    name: 'Mike Rodriguez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    verified: false
  },
  views: '12K',
  daysAgo: 1,
  zapsReward: 2
};

// Example 4: Popular video without role
export const popularVideo: VideoCardData = {
  id: 'video-004',
  title: 'The Future of AI: What You Need to Know',
  thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
  duration: '18:42',
  creator: {
    id: 'creator-004',
    name: 'Dr. Emily Watson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
    verified: true
  },
  views: '2.3M',
  daysAgo: 7,
  zapsReward: 5
};

// Example 5: Recent video
export const recentVideo: VideoCardData = {
  id: 'video-005',
  title: 'Breaking News: Tech Industry Updates Today',
  thumbnail: 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800',
  duration: '5:30',
  creator: {
    id: 'creator-005',
    name: 'Tech News Daily',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tech',
    role: 'News Channel',
    verified: true
  },
  views: '45K',
  daysAgo: 0,
  zapsReward: 1
};

// Example 6: Long-form content
export const longFormVideo: VideoCardData = {
  id: 'video-006',
  title: 'Complete Web Development Course 2025 - Beginner to Advanced',
  thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
  duration: '2:15:30',
  creator: {
    id: 'creator-006',
    name: 'Code Academy Pro',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=academy',
    role: 'Education Platform',
    verified: true
  },
  views: '500K',
  daysAgo: 14,
  zapsReward: 15
};

/**
 * Component Showcase
 */
export const VideoCardShowcase: React.FC = () => {
  const handleCreatorClick = (creatorId: string) => {
    console.log('Navigate to creator:', creatorId);
  };

  const handleVideoClick = (videoId: string) => {
    console.log('Play video:', videoId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-gray-900">
            VideoCardRedesign Showcase
          </h1>
          <p className="text-lg text-gray-600">
            World-class video card component with purple theme and premium interactions
          </p>
        </div>

        {/* Grid Layout */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Standard Grid (4 columns)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <VideoCardRedesign
              video={{ ...standardVideo, onClick: () => handleVideoClick(standardVideo.id) }}
              onCreatorClick={handleCreatorClick}
            />
            <VideoCardRedesign
              video={{ ...highRewardVideo, onClick: () => handleVideoClick(highRewardVideo.id) }}
              onCreatorClick={handleCreatorClick}
            />
            <VideoCardRedesign
              video={{ ...newCreatorVideo, onClick: () => handleVideoClick(newCreatorVideo.id) }}
              onCreatorClick={handleCreatorClick}
            />
            <VideoCardRedesign
              video={{ ...popularVideo, onClick: () => handleVideoClick(popularVideo.id) }}
              onCreatorClick={handleCreatorClick}
            />
          </div>
        </div>

        {/* Wide Layout */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Wide Layout (3 columns)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <VideoCardRedesign
              video={{ ...recentVideo, onClick: () => handleVideoClick(recentVideo.id) }}
              onCreatorClick={handleCreatorClick}
            />
            <VideoCardRedesign
              video={{ ...longFormVideo, onClick: () => handleVideoClick(longFormVideo.id) }}
              onCreatorClick={handleCreatorClick}
            />
            <VideoCardRedesign
              video={{ ...standardVideo, onClick: () => handleVideoClick(standardVideo.id) }}
              onCreatorClick={handleCreatorClick}
            />
          </div>
        </div>

        {/* Single Column (Mobile Preview) */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Mobile View (Single Column)
          </h2>
          <div className="max-w-md mx-auto space-y-6">
            <VideoCardRedesign
              video={{ ...highRewardVideo, onClick: () => handleVideoClick(highRewardVideo.id) }}
              onCreatorClick={handleCreatorClick}
            />
            <VideoCardRedesign
              video={{ ...popularVideo, onClick: () => handleVideoClick(popularVideo.id) }}
              onCreatorClick={handleCreatorClick}
            />
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-lg border border-purple-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            ✨ Key Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 text-xl">👤</span>
              </div>
              <h3 className="font-semibold text-gray-900">Purple Glow Profile</h3>
              <p className="text-sm text-gray-600">
                Profile icons feature a subtle purple glow ring (#A259FF) that intensifies on hover
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 text-xl">👁️</span>
              </div>
              <h3 className="font-semibold text-gray-900">Minimalist Icons</h3>
              <p className="text-sm text-gray-600">
                Clean Lucide icons (Eye, Clock) with perfect alignment and elegant dot separator
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 text-xl">⚡</span>
              </div>
              <h3 className="font-semibold text-gray-900">ZAP Reward Badge</h3>
              <p className="text-sm text-gray-600">
                Premium capsule badge with continuous pulse animation and hover effects
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 text-xl">📱</span>
              </div>
              <h3 className="font-semibold text-gray-900">Fully Responsive</h3>
              <p className="text-sm text-gray-600">
                3-column flex layout with smart wrapping for mobile devices
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 text-xl">✨</span>
              </div>
              <h3 className="font-semibold text-gray-900">Smooth Animations</h3>
              <p className="text-sm text-gray-600">
                Hardware-accelerated Framer Motion animations for premium feel
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-purple-600 text-xl">🎨</span>
              </div>
              <h3 className="font-semibold text-gray-900">WIZUP Theme</h3>
              <p className="text-sm text-gray-600">
                Consistent purple branding matching the platform's futuristic aesthetic
              </p>
            </div>
          </div>
        </div>

        {/* Usage Stats */}
        <div className="grid md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold">6</div>
            <div className="text-sm text-purple-100">Example Variations</div>
          </div>
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold">3</div>
            <div className="text-sm text-blue-100">Layout Options</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold">100%</div>
            <div className="text-sm text-green-100">Responsive</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="text-3xl font-bold">A11Y</div>
            <div className="text-sm text-orange-100">Accessible</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoCardShowcase;
