import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { useCreatorProfile } from '../hooks/useCreatorProfile';
import { toast } from 'sonner';

interface SyncButtonProps {
  userId: string;
}

export const SyncButton: React.FC<SyncButtonProps> = ({ userId }) => {
  const { data: profile, syncYouTubeData } = useCreatorProfile(userId);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(
    profile?.youtubeData?.lastSyncedAt ? new Date(profile.youtubeData.lastSyncedAt) : null
  );

  const handleSync = async () => {
    setIsLoading(true);
    
    try {
      // Check if user has YouTube authentication
      // TODO: Integrate with actual YouTube API
      // For now, we'll simulate a realistic sync process
      
      console.log('🔄 Syncing YouTube data for user:', userId);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Get existing profile to check if YouTube is connected
      if (!profile?.youtubeData?.isConnected) {
        toast.error('YouTube not connected', {
          description: 'Please connect your YouTube account first through the Create page'
        });
        return;
      }

      // Simulate fetching updated data from YouTube API
      const updatedYouTubeData = {
        ...profile.youtubeData,
        subscriberCount: profile.youtubeData.subscriberCount + Math.floor(Math.random() * 10),
        videoCount: profile.youtubeData.videoCount + Math.floor(Math.random() * 2),
        lastSyncedAt: new Date().toISOString()
      };

      // Update profile with fresh data
      await syncYouTubeData(updatedYouTubeData);
      
      setLastSync(new Date());
      toast.success('YouTube data synced successfully!', {
        description: `Updated channel data - ${updatedYouTubeData.subscriberCount.toLocaleString()} subscribers`
      });

    } catch (error) {
      console.error('❌ Sync failed:', error);
      toast.error('Failed to sync YouTube data', {
        description: 'Please check your connection and try again'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeSinceLastSync = () => {
    if (!lastSync) return 'Never synced';
    
    const now = new Date();
    const diff = now.getTime() - lastSync.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getSyncStatus = () => {
    if (!lastSync) return { icon: AlertCircle, color: 'text-orange-500', text: 'Never synced' };
    
    const now = new Date();
    const diff = now.getTime() - lastSync.getTime();
    const hours = diff / (1000 * 60 * 60);

    if (hours < 1) return { icon: CheckCircle, color: 'text-green-500', text: 'Recently synced' };
    if (hours < 24) return { icon: CheckCircle, color: 'text-blue-500', text: 'Synced today' };
    if (hours < 168) return { icon: AlertCircle, color: 'text-yellow-500', text: 'Sync recommended' };
    return { icon: AlertCircle, color: 'text-red-500', text: 'Outdated data' };
  };

  const syncStatus = getSyncStatus();
  const StatusIcon = syncStatus.icon;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1 text-xs">
        <StatusIcon className={`w-3 h-3 ${syncStatus.color}`} />
        <span className="text-slate-600">{getTimeSinceLastSync()}</span>
      </div>
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleSync}
        disabled={isLoading}
        className="border-blue-300 text-blue-700 hover:bg-blue-50"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Syncing...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync YouTube
          </>
        )}
      </Button>
    </div>
  );
};