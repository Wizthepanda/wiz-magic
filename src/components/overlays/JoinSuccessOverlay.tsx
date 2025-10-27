import { useNavigate } from 'react-router-dom';
import { CommunityJoinModal, AccessType } from '@/components/ui/CommunityJoinModal';

interface JoinSuccessOverlayProps {
  selectedCommunity: {
    id: string;
    slug?: string;
    name: string;
    avatar?: string;
    coverImage?: string;
    accessType?: AccessType;
    zapsRequired?: number;
    usdAmount?: number;
    xpEarned?: number;
    transactionId?: string;
  };
  onClose: () => void;
}

export const JoinSuccessOverlay = ({
  selectedCommunity,
  onClose,
}: JoinSuccessOverlayProps) => {
  const navigate = useNavigate();

  const handleEnterCommunity = () => {
    navigate(`/community/${selectedCommunity.slug || selectedCommunity.id}`);
    onClose();
  };

  const handleSecondaryAction = () => {
    navigate('/dashboard');
    onClose();
  };

  // Determine access type based on community data
  const accessType: AccessType = selectedCommunity.accessType || 'free';

  // Build reward info dynamically
  const rewardInfo = {
    zapsEarned: accessType === 'free' ? 50 : undefined,
    zapsSpent: selectedCommunity.zapsRequired,
    usdAmount: selectedCommunity.usdAmount,
    xpEarned: selectedCommunity.xpEarned || 25,
  };

  // Generate avatar fallback URL if not provided
  const communityAvatar = selectedCommunity.avatar
    || selectedCommunity.coverImage
    || `https://api.dicebear.com/7.x/shapes/svg?seed=${selectedCommunity.name}`;

  return (
    <CommunityJoinModal
      open={true}
      onOpenChange={onClose}
      accessType={accessType}
      communityName={selectedCommunity.name}
      communityAvatar={communityAvatar}
      rewardInfo={rewardInfo}
      transactionId={selectedCommunity.transactionId}
      onEnterCommunity={handleEnterCommunity}
      onSecondaryAction={handleSecondaryAction}
    />
  );
};
