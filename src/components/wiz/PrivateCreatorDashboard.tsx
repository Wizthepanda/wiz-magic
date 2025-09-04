import { useAuth } from '@/hooks/useAuth';
import { CreatorPrivateProfile } from './creator/CreatorPrivateProfile';

interface PrivateCreatorDashboardProps {
  className?: string;
}

export const PrivateCreatorDashboard: React.FC<PrivateCreatorDashboardProps> = ({ className }) => {
  const { user } = useAuth();

  if (!user) return null;

  // Use the new Creator Private Profile system
  return <CreatorPrivateProfile className={className} />;
};