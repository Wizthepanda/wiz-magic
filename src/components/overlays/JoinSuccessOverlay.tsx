import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface JoinSuccessOverlayProps {
  selectedCommunity: { id: string; slug?: string; name: string };
  onClose: () => void;
}

export const JoinSuccessOverlay = ({
  selectedCommunity,
  onClose,
}: JoinSuccessOverlayProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleEnterCommunity = async () => {
    setLoading(true);
    await new Promise(res => setTimeout(res, 400));
    navigate(`/community/${selectedCommunity.slug || selectedCommunity.id}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 shadow-2xl w-[320px] text-center">
        <h2 className="text-lg font-semibold mb-2">
          Welcome to {selectedCommunity.name}!
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          You’ve successfully joined this community. Ready to explore?
        </p>
        <Button
          onClick={handleEnterCommunity}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Loading...' : 'Enter Community'}
        </Button>
      </div>
    </div>
  );
};
