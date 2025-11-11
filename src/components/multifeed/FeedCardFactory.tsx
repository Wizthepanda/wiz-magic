import { FeedItem } from '@/lib/feed-utils';
import { VideoCard } from './VideoCard';
import { PostCard } from './PostCard';
import { RewardCard } from './RewardCard';

interface FeedCardFactoryProps {
  item: FeedItem;
  onVideoPlay?: (video: any) => void;
  onLike?: (itemId: string) => void;
  onClaim?: (rewardId: string) => void;
}

export function FeedCardFactory({
  item,
  onVideoPlay,
  onLike,
  onClaim,
}: FeedCardFactoryProps) {
  switch (item.type) {
    case 'video':
      return <VideoCard video={item} onPlay={onVideoPlay} onLike={onLike} />;
    case 'post':
      return <PostCard post={item} onLike={onLike} />;
    case 'reward':
      return <RewardCard reward={item} onClaim={onClaim} />;
    default:
      return null;
  }
}
