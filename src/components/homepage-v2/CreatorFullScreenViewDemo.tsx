import { useState } from 'react';
import { CreatorFullScreenView, Creator } from './CreatorFullScreenView';

/**
 * Demo Component showing how to use CreatorFullScreenView
 *
 * Usage Example:
 * <CreatorFullScreenViewDemo />
 */

export function CreatorFullScreenViewDemo() {
  const [isOpen, setIsOpen] = useState(false);

  // Example creator data
  const exampleCreator: Creator = {
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
    banner: "https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&h=400&fit=crop",
    tagline: "Transforming lives through mindful wellness and holistic healing practices",
    zapCost: 800,
    userZapBalance: 2500,
    features: [
      "Private community chat with like-minded wellness seekers",
      "Weekly live coaching sessions and Q&A with Sarah",
      "Downloadable learning resources and guided meditations",
      "Progress mentorship track with personalized feedback",
      "Exclusive workshops and masterclasses",
      "Access to premium wellness toolkit and templates"
    ],
    previewVideo: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=450&fit=crop",
    galleryImages: [
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=400&fit=crop"
    ]
  };

  const handleUnlock = () => {
    console.log('🎉 Unlocking creator experience!');
    // TODO: Implement actual unlock logic
    // - Deduct ZAPs from user balance
    // - Grant access to creator content
    // - Navigate to creator dashboard
  };

  const handlePreview = () => {
    console.log('👀 Opening preview mode');
    // TODO: Implement preview logic
    // - Show sample content
    // - Display limited features
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-violet-900 flex items-center justify-center p-8">
      <div className="text-center space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-4">
            Creator Full Screen View Demo
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Experience the immersive, luxury full-screen creator profile.
            Click below to see the premium unlock experience.
          </p>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="px-8 py-4 bg-gradient-to-tr from-purple-500 to-pink-500 text-white font-semibold text-lg rounded-2xl hover:scale-105 active:scale-95 transition-transform duration-200 shadow-[0_0_40px_-8px_rgba(236,72,153,0.8)]"
        >
          Open Creator Experience
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto mt-12">
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <h3 className="text-white font-semibold mb-2">Full Screen</h3>
            <p className="text-white/60 text-sm">Immersive takeover experience</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <h3 className="text-white font-semibold mb-2">Luxury Design</h3>
            <p className="text-white/60 text-sm">Apple Music × Patreon × Vogue</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
            <h3 className="text-white font-semibold mb-2">Smooth Animations</h3>
            <p className="text-white/60 text-sm">Calm, confident transitions</p>
          </div>
        </div>
      </div>

      {/* Creator Full Screen View */}
      <CreatorFullScreenView
        open={isOpen}
        setOpen={setIsOpen}
        creator={exampleCreator}
        onUnlock={handleUnlock}
        onPreview={handlePreview}
      />
    </div>
  );
}
