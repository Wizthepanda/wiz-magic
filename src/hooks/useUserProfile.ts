import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { userProfileService, UserProfile } from '@/lib/user-profile-service';

/**
 * Custom hook for accessing cached user profile data
 * Ensures UI components always display the latest profile picture
 */
export const useUserProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Fetch user profile with caching
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const userProfile = await userProfileService.getUserProfile(user.uid, {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });
        setProfile(userProfile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to auth data
        setProfile({
          uid: user.uid,
          displayName: user.displayName || 'Anonymous',
          email: user.email,
          photoURL: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
          level: 1,
          totalXP: 0,
          youtubeConnected: false,
          createdAt: new Date(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    // Set up listener for profile updates
    const handleProfileUpdate = () => {
      fetchProfile();
    };

    // Listen for custom profile update events
    window.addEventListener('userProfileUpdated', handleProfileUpdate);

    return () => {
      window.removeEventListener('userProfileUpdated', handleProfileUpdate);
    };
  }, [user]);

  return { profile, loading };
};
