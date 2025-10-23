import React from 'react';
import { CommunityProfilePageV4 } from '@/components/wiz/community/CommunityProfilePageV4';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const CommunityProfileDemoPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      {/* Demo Navigation Bar */}
      <div className="fixed top-4 left-4 z-50">
        <Button
          onClick={() => navigate(-1)}
          variant="ghost"
          className="bg-white/80 backdrop-blur-xl shadow-lg hover:bg-white rounded-xl"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      {/* Demo Watermark */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl shadow-lg backdrop-blur-xl">
          <span className="text-sm font-bold">V4 Design Preview</span>
        </div>
      </div>

      {/* Render the new community page */}
      <CommunityProfilePageV4 communityId="demo" />
    </div>
  );
};

export default CommunityProfileDemoPage;
