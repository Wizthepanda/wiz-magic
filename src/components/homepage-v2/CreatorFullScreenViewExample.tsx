import React, { useState } from 'react';
import { CreatorFullScreenView } from './CreatorFullScreenView';
import type { Creator } from '@/types/creator';
import { Zap } from 'lucide-react';

/**
 * Example/Demo component showing how to use CreatorFullScreenView
 * 
 * This demonstrates:
 * - Basic usage with state management
 * - Multiple creators
 * - Unlock and preview handlers
 * - Integration with your existing auth/payment system
 */

// Sample creator data
const sampleCreators: Creator[] = [
  {
    id: 'amara-wellness',
    name: 'Amara Wellness Coach',
    tagline: 'Transform your life with mindful practices and holistic wellness guidance',
    avatarUrl: '/Amara Wellness Coach.png',
    bannerUrl: '/banners/amara-banner.jpg',
    zapCost: 500,
    features: [
      'Private Group Chat',
      'Weekly Live Meditation Sessions',
      'Premium Wellness Content Library',
      'Early Access to New Programs',
    ],
    previewVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  },
  {
    id: 'kai-rivers',
    name: 'Kai Rivers Music',
    tagline: 'Learn music production from a Grammy-nominated producer',
    avatarUrl: '/Kai Rivers Music.png',
    bannerUrl: '/banners/kai-banner.jpg',
    zapCost: 750,
    features: [
      'Exclusive Production Tutorials',
      'Monthly Live Q&A Sessions',
      'Sample Pack Library',
      'One-on-One Feedback Sessions',
    ],
  },
  {
    id: 'milo-edge',
    name: 'Milo Edge Fitness',
    tagline: 'Build strength and confidence with personalized training programs',
    avatarUrl: '/Milo Edge Fitness.jpg',
    bannerUrl: '/banners/milo-banner.jpg',
    zapCost: 600,
    features: [
      'Custom Workout Plans',
      'Weekly Live Training Sessions',
      'Nutrition Guidance',
      'Progress Tracking Tools',
    ],
  },
  {
    id: 'lina-sol',
    name: 'Lina Sol Art',
    tagline: 'Discover your creative voice through digital art and illustration',
    avatarUrl: '/Lina Sol Art .jpg',
    bannerUrl: '/banners/lina-banner.jpg',
    zapCost: 450,
    features: [
      'Step-by-Step Art Tutorials',
      'Monthly Live Drawing Sessions',
      'Exclusive Brush & Asset Packs',
      'Portfolio Review Sessions',
    ],
  },
];

export const CreatorFullScreenViewExample: React.FC = () => {
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [userZapBalance, setUserZapBalance] = useState(2500);

  // Handler for unlocking a creator
  const handleUnlock = async (creatorId: string) => {
    console.log('Unlocking creator:', creatorId);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Find the creator to get the cost
    const creator = sampleCreators.find((c) => c.id === creatorId);
    if (creator) {
      // Deduct ZAPs
      setUserZapBalance((prev) => prev - (creator.zapCost ?? 0));

      // Here you would:
      // 1. Call your Cloud Function or API endpoint
      // 2. Update Firestore with the unlock
      // 3. Handle any errors
      
      // Example:
      // const functions = getFunctions();
      // const unlockCreator = httpsCallable(functions, 'unlockCreator');
      // await unlockCreator({ creatorId });
    }

    // Success! The component will show confetti and toast
  };

  // Handler for previewing a creator
  const handlePreview = (creatorId: string) => {
    console.log('Previewing creator:', creatorId);
    
    // Here you would:
    // 1. Navigate to a preview page
    // 2. Show a preview modal
    // 3. Play a preview video
    
    // Example with React Router:
    // navigate(`/creator/${creatorId}/preview`);
  };

  // Open the full-screen view for a specific creator
  const openCreator = (creator: Creator) => {
    setSelectedCreator(creator);
    setIsOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f6f4ff] via-white to-[#fff7fb] py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-[#0f1724] mb-4">
            Featured Creators
          </h1>
          <p className="text-lg text-[#6b7280] max-w-2xl mx-auto">
            Unlock exclusive content from top creators. Click any card to view details.
          </p>

          {/* ZAP Balance Display */}
          <div className="mt-6 inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-lg border border-[#A259FF]/10">
            <Zap size={20} className="text-[#A259FF]" fill="#A259FF" />
            <span className="text-sm text-[#6b7280]">Your Balance:</span>
            <span className="text-lg font-semibold text-[#A259FF]">
              {userZapBalance.toLocaleString()} ZAPs
            </span>
          </div>
        </div>

        {/* Creator Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {sampleCreators.map((creator) => (
            <div
              key={creator.id}
              onClick={() => openCreator(creator)}
              className="group cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Avatar */}
              <div className="relative aspect-square bg-gradient-to-br from-[#8A63FF] to-[#FF86C1] p-4">
                {creator.avatarUrl ? (
                  <img
                    src={creator.avatarUrl}
                    alt={creator.name}
                    className="w-full h-full object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-full rounded-xl bg-white/20 flex items-center justify-center text-white text-6xl font-bold">
                    {creator.name.charAt(0)}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <h3 className="text-lg font-semibold text-[#0f1724] mb-2 group-hover:text-[#A259FF] transition-colors">
                  {creator.name}
                </h3>
                <p className="text-sm text-[#6b7280] mb-4 line-clamp-2">
                  {creator.tagline}
                </p>

                {/* ZAP Cost */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap size={16} className="text-[#A259FF]" fill="#A259FF" />
                    <span className="text-sm font-semibold text-[#A259FF]">
                      {creator.zapCost?.toLocaleString()} ZAPs
                    </span>
                  </div>
                  <button className="text-sm font-medium text-[#A259FF] hover:text-[#8A63FF] transition-colors">
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Instructions */}
        <div className="mt-16 max-w-3xl mx-auto bg-white rounded-2xl p-8 shadow-lg border border-[#A259FF]/10">
          <h2 className="text-2xl font-semibold text-[#0f1724] mb-4">
            How to Use This Component
          </h2>
          <div className="space-y-3 text-sm text-[#6b7280]">
            <p>
              <strong className="text-[#0f1724]">1. Click any creator card</strong> to open the full-screen immersive view
            </p>
            <p>
              <strong className="text-[#0f1724]">2. Review the features</strong> and preview content to see what you'll get
            </p>
            <p>
              <strong className="text-[#0f1724]">3. Click "Unlock"</strong> to access exclusive content (costs ZAPs)
            </p>
            <p>
              <strong className="text-[#0f1724]">4. Press ESC or click the X</strong> to close the view
            </p>
          </div>

          <div className="mt-6 p-4 bg-gradient-to-r from-[#f6f4ff] to-[#fff7fb] rounded-xl border border-[#A259FF]/10">
            <p className="text-xs text-[#6b7280]">
              <strong className="text-[#0f1724]">Developer Note:</strong> This is a demo component.
              In production, wire the <code className="px-1.5 py-0.5 bg-white rounded text-[#A259FF]">onUnlock</code> handler
              to your Cloud Function and integrate with your authentication system.
              See <code className="px-1.5 py-0.5 bg-white rounded text-[#A259FF]">CREATOR_FULLSCREEN_VIEW_README.md</code> for
              full integration instructions.
            </p>
          </div>
        </div>
      </div>

      {/* The Full-Screen Creator View */}
      {selectedCreator && (
        <CreatorFullScreenView
          open={isOpen}
          setOpen={setIsOpen}
          creator={selectedCreator}
          onUnlock={handleUnlock}
          onPreview={handlePreview}
          userZapBalance={userZapBalance}
        />
      )}
    </div>
  );
};

