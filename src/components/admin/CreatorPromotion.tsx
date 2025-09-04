import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { promoteToCreator } from '@/hooks/useUserType';
import { useAuth } from '@/hooks/useAuth';

export const CreatorPromotion = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userId, setUserId] = useState('');
  const [isPromoting, setIsPromoting] = useState(false);

  const handlePromoteCurrentUser = async () => {
    if (!user?.uid) {
      toast({
        title: "Error",
        description: "You must be logged in to promote yourself to creator",
        duration: 3000,
      });
      return;
    }

    setIsPromoting(true);
    try {
      await promoteToCreator(user.uid);
      toast({
        title: "Success! 🎉",
        description: "You have been promoted to creator! Refresh the page to see your creator dashboard.",
        duration: 5000,
      });
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: "Error",
        description: "Failed to promote to creator. Check console for details.",
        duration: 3000,
      });
    } finally {
      setIsPromoting(false);
    }
  };

  const handlePromoteCustomUser = async () => {
    if (!userId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a user ID",
        duration: 3000,
      });
      return;
    }

    setIsPromoting(true);
    try {
      await promoteToCreator(userId.trim());
      toast({
        title: "Success! 🎉",
        description: `User ${userId} has been promoted to creator!`,
        duration: 5000,
      });
      setUserId('');
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: "Error",
        description: "Failed to promote user. Check console for details.",
        duration: 3000,
      });
    } finally {
      setIsPromoting(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-lg">🔧 Creator Promotion (Admin)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Button 
            onClick={handlePromoteCurrentUser}
            disabled={isPromoting}
            className="w-full"
            variant="default"
          >
            {isPromoting ? "Promoting..." : "Promote Current User to Creator"}
          </Button>
          {user && (
            <p className="text-xs text-gray-600 mt-1">
              Current user: {user.displayName} ({user.uid})
            </p>
          )}
        </div>

        <div className="border-t pt-4">
          <Label htmlFor="userId">Or promote specific user ID:</Label>
          <div className="flex space-x-2 mt-2">
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID..."
              disabled={isPromoting}
            />
            <Button 
              onClick={handlePromoteCustomUser}
              disabled={isPromoting || !userId.trim()}
              variant="outline"
            >
              Promote
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};