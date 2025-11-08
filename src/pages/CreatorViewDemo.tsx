import React from 'react';
import { CreatorFullScreenViewExample } from '@/components/homepage-v2/CreatorFullScreenViewExample';

/**
 * Demo page for CreatorFullScreenView component
 * 
 * Add this route to your router to test the component:
 * <Route path="/demo/creator-view" element={<CreatorViewDemo />} />
 */

export const CreatorViewDemo: React.FC = () => {
  return (
    <div className="min-h-screen">
      <CreatorFullScreenViewExample />
    </div>
  );
};

export default CreatorViewDemo;

