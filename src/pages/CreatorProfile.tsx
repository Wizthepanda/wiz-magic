import { useParams } from 'react-router-dom';
import { useSafeNavigate } from '@/hooks/useSafeNavigate';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { YouTubeCreatorProfile } from '@/components/wiz/YouTubeCreatorProfile';
import { useAuth } from '@/hooks/useAuth';

const CreatorProfile = () => {
  const { channelId, handle } = useParams<{ channelId?: string; handle?: string }>();
  const navigate = useSafeNavigate();
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  // Use either channelId or handle as identifier
  const creatorId = channelId || handle;

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (!creatorId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Invalid Creator Profile</h1>
            <p className="text-gray-600 mb-8">No channel ID provided in the URL.</p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h1>
            <p className="text-gray-600 mb-8">Please sign in to view creator profiles.</p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button onClick={handleBack} variant="outline" className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Discover
          </Button>
        </div>
        
        {/* Creator Profile Component */}
        <YouTubeCreatorProfile 
          channelId={creatorId}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default CreatorProfile;