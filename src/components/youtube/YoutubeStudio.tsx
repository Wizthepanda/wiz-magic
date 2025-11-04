/**
 * YouTube Studio - Main Component
 *
 * Simplified 3-step flow for connecting YouTube and publishing to WIZUP Discover.
 *
 * Steps:
 * 1. Connect YouTube Channel
 * 2. Select & Categorize Videos (all videos auto-selected)
 * 3. Review & Publish
 * 4. Success Confirmation
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { YouTubeVideo } from '@/lib/youtube-api';
import { YoutubeConnect } from './YoutubeConnect';
import { YoutubeCategorize, VideoWithCategory } from './YoutubeCategorize';
import { YoutubePublish } from './YoutubePublish';
import { YoutubeSuccess } from './YoutubeSuccess';

export type YouTubeStudioStep = 1 | 2 | 3 | 4;

export interface YouTubeStudioState {
  currentStep: YouTubeStudioStep;
  channelId: string | null;
  channelTitle: string | null;
  channelHandle: string | null; // YouTube channel handle (e.g., @facelessavatars7049)
  channelThumbnail: string | null;
  accessToken: string | null;
  availableVideos: YouTubeVideo[];
  categorizedVideos: VideoWithCategory[];
  publishedVideoIds: string[];
}

export const YoutubeStudio: React.FC = () => {
  const [state, setState] = useState<YouTubeStudioState>({
    currentStep: 1,
    channelId: null,
    channelTitle: null,
    channelHandle: null,
    channelThumbnail: null,
    accessToken: null,
    availableVideos: [],
    categorizedVideos: [],
    publishedVideoIds: [],
  });

  // Step 1: Handle YouTube connection success
  // Auto-select ALL videos and go directly to categorization
  const handleConnectSuccess = (channelInfo: {
    channelId: string;
    channelTitle: string;
    channelHandle?: string; // YouTube channel handle
    channelThumbnail: string;
    accessToken: string;
    videos: YouTubeVideo[];
  }) => {
    setState(prev => ({
      ...prev,
      currentStep: 2, // Go directly to categorization (renamed "Select")
      channelId: channelInfo.channelId,
      channelTitle: channelInfo.channelTitle,
      channelHandle: channelInfo.channelHandle || null,
      channelThumbnail: channelInfo.channelThumbnail,
      accessToken: channelInfo.accessToken,
      availableVideos: channelInfo.videos, // All videos auto-selected
    }));
  };

  // Step 2: Go back to connect
  const handleBackToConnect = () => {
    setState(prev => ({
      ...prev,
      currentStep: 1,
    }));
  };

  // Step 2: Handle categorization complete
  const handleCategorizeComplete = (categorizedVideos: VideoWithCategory[]) => {
    setState(prev => ({
      ...prev,
      currentStep: 3,
      categorizedVideos,
    }));
  };

  // Step 3: Handle publish success
  const handlePublishSuccess = (publishedIds: string[]) => {
    setState(prev => ({
      ...prev,
      currentStep: 4,
      publishedVideoIds: publishedIds,
    }));
  };

  // Step 3: Go back to categorization
  const handleBackToCategorization = () => {
    setState(prev => ({
      ...prev,
      currentStep: 2,
    }));
  };

  // Step 4: Reset flow
  const handleReset = () => {
    setState({
      currentStep: 1,
      channelId: null,
      channelTitle: null,
      channelHandle: null,
      channelThumbnail: null,
      accessToken: null,
      availableVideos: [],
      categorizedVideos: [],
      publishedVideoIds: [],
    });
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-gray-200/50 backdrop-blur-xl rounded-full overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 rounded-full"
          initial={{ width: 0 }}
          animate={{
            width: `${(state.currentStep / 4) * 100}%`,
          }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      {/* Step Indicator with Labels */}
      <div className="flex items-center justify-center gap-2">
        {[
          { num: 1, label: 'Connect' },
          { num: 2, label: 'Select' },
          { num: 3, label: 'Publish' },
          { num: 4, label: 'Success' },
        ].map((step, idx) => (
          <React.Fragment key={step.num}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0.5 }}
              animate={{
                scale: state.currentStep === step.num ? 1.1 : 0.95,
                opacity: state.currentStep >= step.num ? 1 : 0.3,
              }}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                  ${state.currentStep >= step.num
                    ? 'bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 text-white shadow-lg'
                    : 'bg-gray-200 text-gray-400'
                  }
                `}
              >
                {step.num}
              </div>
              <span className={`text-xs font-medium ${state.currentStep === step.num ? 'text-purple-600' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </motion.div>
            {idx < 3 && (
              <div className={`w-8 h-0.5 rounded-full ${state.currentStep > step.num ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content with Animations */}
      <AnimatePresence mode="wait">
        {state.currentStep === 1 && (
          <motion.div
            key="step-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <YoutubeConnect onSuccess={handleConnectSuccess} />
          </motion.div>
        )}

        {state.currentStep === 2 && (
          <motion.div
            key="step-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <YoutubeCategorize
              videos={state.availableVideos}
              onNext={handleCategorizeComplete}
              onBack={handleBackToConnect}
            />
          </motion.div>
        )}

        {state.currentStep === 3 && (
          <motion.div
            key="step-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <YoutubePublish
              selectedVideos={state.categorizedVideos}
              channelId={state.channelId!}
              channelTitle={state.channelTitle!}
              channelHandle={state.channelHandle}
              onSuccess={handlePublishSuccess}
              onBack={handleBackToCategorization}
            />
          </motion.div>
        )}

        {state.currentStep === 4 && (
          <motion.div
            key="step-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <YoutubeSuccess
              publishedCount={state.publishedVideoIds.length}
              onReset={handleReset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default YoutubeStudio;
