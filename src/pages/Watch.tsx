import { useParams, useSearchParams, Navigate } from "react-router-dom";
import { WatchPage } from "@/components/wiz/WatchPage";
import { useXp } from "@/context/XpContext";

const Watch = () => {
  const { videoId } = useParams();
  const [searchParams] = useSearchParams();
  const { addXp } = useXp();
  
  // Get parameters from URL
  const title = searchParams.get('title') || 'Video Title';
  const creator = searchParams.get('creator') || 'Creator Name';
  const xpReward = parseInt(searchParams.get('xp') || '100');
  const views = searchParams.get('views') || '27 views';
  const creatorAvatar = searchParams.get('avatar');
  const channelId = searchParams.get('channelId');
  const creatorId = searchParams.get('creatorId');
  const subscriberCount = searchParams.get('subscribers') || '0 subscribers';
  const creatorLevel = parseInt(searchParams.get('level') || '1');

  // Redirect to home if no videoId
  if (!videoId) {
    return <Navigate to="/" replace />;
  }

  const handleReward = (xp: number) => {
    addXp(xp);
  };

  return (
    <WatchPage
      videoId={videoId}
      title={title}
      creator={creator}
      xpReward={xpReward}
      onReward={handleReward}
      creatorAvatar={creatorAvatar || undefined}
      creatorId={creatorId || undefined}
      channelId={channelId || undefined}
      subscriberCount={subscriberCount}
      creatorLevel={creatorLevel}
      views={views}
    />
  );
};

export default Watch;