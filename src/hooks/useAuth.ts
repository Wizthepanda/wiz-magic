import { useState, useEffect } from 'react';
import { 
  User, 
  signInWithRedirect,
  getRedirectResult, 
  signOut as firebaseSignOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, googleProvider, googleProviderWithYouTube } from '@/lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { YouTubeService } from '@/lib/youtube';
import { LocalXPService } from '@/lib/local-xp-service';
import { isYouTubeAPIEnabled, logFeatureFlag } from '@/lib/feature-flags';

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
    console.log('🔧 Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('🔄 Auth state changed:', firebaseUser ? `${firebaseUser.email} (uid: ${firebaseUser.uid})` : 'No user');
      
      if (firebaseUser) {
        // Get user data from Firestore
        console.log('📥 Fetching user data from Firestore...');
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.data();
        console.log('📄 User data from Firestore:', userData);
        
        const wizUser: WizUser = {
          ...firebaseUser,
          level: userData?.level || 1,
          totalXP: userData?.totalXP || 0,
          youtubeConnected: userData?.youtubeConnected || false,
          createdAt: userData?.createdAt?.toDate() || new Date(),
        };
        
        console.log('✅ Setting user state:', { email: wizUser.email, level: wizUser.level, totalXP: wizUser.totalXP });
        setUser(wizUser);
      } else {
        console.log('❌ No Firebase user, setting user state to null');
        setUser(null);
      }
      setLoading(false);
    });

    // Handle redirect result on app initialization
    const handleRedirectResult = async () => {
      try {
        console.log('🔄 Checking for redirect result...');
        
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('getRedirectResult timeout')), 10000);
        });
        
        const result = await Promise.race([
          getRedirectResult(auth),
          timeoutPromise
        ]) as any;
        
        if (result) {
          console.log('✅ Redirect auth successful:', result.user.email);
          const user = result.user;
          
          // Initialize user with appropriate service
          const userData = {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            level: 1,
            totalXP: 0,
            youtubeConnected: false,
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
          };
          
          console.log('💾 Saving user data...', userData);
          if (isYouTubeAPIEnabled()) {
            await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
            console.log('✅ User data saved to Firestore');
          } else {
            await LocalXPService.initializeLocalUser(user.uid, userData);
            console.log('✅ User data saved locally');
          }
        } else {
          console.log('ℹ️ No redirect result found');
        }
      } catch (error) {
        console.error('❌ Error handling redirect result:', error);
        // Don't let redirect result errors block the auth state listener
      }
    };

    handleRedirectResult();
    return unsubscribe;
  }, []);

  const signInWithGoogle = async (withYouTube: boolean = false) => {
    try {
      // Always use basic Google provider when YouTube API is disabled
      const shouldUseYouTube = withYouTube && isYouTubeAPIEnabled();
      const provider = shouldUseYouTube ? googleProviderWithYouTube : googleProvider;
      
      if (withYouTube && !isYouTubeAPIEnabled()) {
        logFeatureFlag('YouTube OAuth Scope', false, 'using basic Google Auth instead');
      }
      
      console.log('Starting Google sign-in with redirect, provider:', shouldUseYouTube ? 'YouTube' : 'basic');
      
      await signInWithRedirect(auth, provider);
      // Note: This function doesn't return as the page will redirect
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    }
  };

  const connectYouTube = async () => {
    if (!isYouTubeAPIEnabled()) {
      logFeatureFlag('YouTube Connection', false, 'feature temporarily disabled');
      return false;
    }
    
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
