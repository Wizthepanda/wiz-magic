import { useState, useEffect } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider, googleProviderWithYouTube } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { YouTubeService } from '@/lib/youtube';

export interface WizUser extends User {
  level: number;
  totalXP: number;
  youtubeConnected: boolean;
  createdAt: Date;
}

export const useAuth = () => {
  const [user, setUser] = useState<WizUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();
        
        const wizUser: WizUser = {
          ...firebaseUser,
          level: userData?.level || 1,
          totalXP: userData?.totalXP || 0,
          youtubeConnected: userData?.youtubeConnected || false,
          createdAt: userData?.createdAt?.toDate() || new Date(),
        };
        
        setUser(wizUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInWithGoogle = async (withYouTube: boolean = false) => {
    try {
      // Use the appropriate provider based on whether YouTube access is needed
      const provider = withYouTube ? googleProviderWithYouTube : googleProvider;
      
      console.log('Starting Google sign-in with provider:', withYouTube ? 'YouTube' : 'basic');
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful:', result.user.email);
      const user = result.user;
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        level: 1,
        totalXP: 0,
        youtubeConnected: withYouTube,
        createdAt: new Date(),
        lastLogin: new Date(),
        stats: {
          videosWatched: 0,
          totalWatchTime: 0,
        },
        engagement: {
          watchCount: 0,
          likeCount: 0,
          commentCount: 0,
        }
      }, { merge: true });
      
      return user;
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const connectYouTube = async () => {
    try {
      const success = await YouTubeService.authenticateWithYouTube();
      if (success && user) {
        // Update local user state
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        const updatedUser: WizUser = {
          ...user,
          youtubeConnected: true,
          level: userData?.level || 1,
          totalXP: userData?.totalXP || 0,
          createdAt: userData?.createdAt?.toDate() || new Date(),
        };
        
        setUser(updatedUser);
      }
      return success;
    } catch (error) {
      console.error('Error connecting YouTube:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const refreshUserData = async () => {
    if (user) {
      try {
        console.log('🔄 Starting user data refresh...');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        
        const updatedUser: WizUser = {
          ...user,
          level: userData?.level || 1,
          totalXP: userData?.totalXP || 0,
          youtubeConnected: userData?.youtubeConnected || false,
          createdAt: userData?.createdAt?.toDate() || new Date(),
        };
        
        console.log('🔄 Updating user state:', { 
          oldXP: user.totalXP, 
          newXP: updatedUser.totalXP, 
          level: updatedUser.level 
        });
        
        setUser(updatedUser);
        
        // Force a re-render by updating the state again after a short delay
        setTimeout(async () => {
          const recheckDoc = await getDoc(doc(db, 'users', user.uid));
          const recheckData = recheckDoc.data();
          if (recheckData?.totalXP !== user.totalXP) {
            const finalUser: WizUser = {
              ...user,
              level: recheckData?.level || 1,
              totalXP: recheckData?.totalXP || 0,
              youtubeConnected: recheckData?.youtubeConnected || false,
              createdAt: recheckData?.createdAt?.toDate() || new Date(),
            };
            setUser(finalUser);
            console.log('🔄 Final user data update:', { totalXP: finalUser.totalXP });
          }
        }, 1000);
        
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  const addXP = (amount: number) => {
    console.log('🎯 addXP called with amount:', amount, 'current user:', user?.uid);
    
    if (user) {
      const newTotalXP = user.totalXP + amount;
      const newLevel = Math.floor(newTotalXP / 1000) + 1;
      
      const updatedUser: WizUser = {
        ...user,
        totalXP: newTotalXP,
        level: newLevel,
        // Add a timestamp to force React to detect the change
        lastUpdate: new Date(),
      } as WizUser;
      
      console.log('⚡ Instant XP update:', { 
        oldXP: user.totalXP, 
        newXP: newTotalXP, 
        oldLevel: user.level, 
        newLevel: newLevel 
      });
      
      // Force immediate state update
      setUser(updatedUser);
      console.log('✅ User state updated with new XP immediately');
      
      // Force React to re-render by triggering multiple state changes
      setTimeout(() => {
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            totalXP: newTotalXP,
            level: newLevel,
            lastUpdate: new Date(),
          } as WizUser;
        });
        console.log('🔄 Secondary state update for React re-render');
      }, 10);
      
      // Third update to ensure all components re-render
      setTimeout(() => {
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            totalXP: newTotalXP,
            level: newLevel,
            lastUpdate: new Date(),
          } as WizUser;
        });
        console.log('🔄 Final state update to ensure UI consistency');
      }, 50);
    } else {
      console.log('❌ No user found for addXP');
    }
  };

  return {
    user,
    loading,
    signInWithGoogle,
    connectYouTube,
    signOut,
    refreshUserData,
    addXP,
  };
};
