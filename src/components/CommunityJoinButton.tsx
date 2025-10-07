import { JoinSuccessOverlay } from '@/components/overlays/JoinSuccessOverlay';
import { useState } from 'react';
import { doc, setDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';

interface CommunityJoinButtonProps {
  community: {
    id: string;
    name?: string;
    title?: string;
    slug?: string;
  };
}

export const CommunityJoinButton = ({ community }: CommunityJoinButtonProps) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const handleJoin = async () => {
    if (!user) {
      alert('You must be signed in to join.');
      return;
    }

    setIsJoining(true);
    try {
      // Add user to the community's members subcollection
      await setDoc(doc(db, 'communities', community.id, 'members', user.uid), {
        joinedAt: new Date(),
        role: 'member',
      });

      // Also add user to the members array in the community doc
      await updateDoc(doc(db, 'communities', community.id), {
        members: arrayUnion(user.uid),
      });

      // Invalidate queries to refresh joined communities
      queryClient.invalidateQueries({ queryKey: ['joinedCommunities'] });
      queryClient.invalidateQueries({ queryKey: ['community', community.id] });

      setShowOverlay(true);
    } catch (error) {
      console.error('Error joining community:', error);
      alert('Failed to join community. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <>
      <Button onClick={handleJoin} disabled={isJoining} className="w-full">
        {isJoining ? 'Joining...' : 'Join Community'}
      </Button>
      {showOverlay && (
        <JoinSuccessOverlay
          selectedCommunity={{
            id: community.id,
            name: community.name || community.title || 'Community',
            slug: community.slug,
          }}
          onClose={() => setShowOverlay(false)}
        />
      )}
    </>
  );
};

