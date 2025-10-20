import { useParams } from 'react-router-dom';
import { CommunityDashboardV2 } from '@/components/wiz/community/CommunityDashboardV2';

export default function CommunityDashboardPageV2() {
  const { id } = useParams();

  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Community not found</p>
      </div>
    );
  }

  return <CommunityDashboardV2 communityId={id} />;
}
