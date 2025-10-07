import { useParams } from 'react-router-dom';
import { CommunityDashboard } from '@/components/wiz/community/CommunityDashboard';

export default function CommunityDashboardPage() {
  const { id } = useParams();
  
  if (!id) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Community not found</p>
      </div>
    );
  }
  
  return <CommunityDashboard communityId={id} />;
}

