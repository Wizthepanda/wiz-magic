import { useState, useEffect } from 'react';
import { 
  User, 
  signInWithRedirect,
  signInWithPopup,
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
import { isAdmin, getUserPermissions, TEST_USER_DEMO_DATA } from '@/config/admin-config';
import { YouTubeXPService } from '@/lib/youtube-xp-service';
import { youTubeAPI } from '@/lib/youtube-api';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
// Note: We'll import useXp dynamically to avoid circular dependency

export interface WizUser extends User {
  level: number;
  totalXP: number;
  youtubeConnected: boolean;
  createdAt: Date;
  isAdmin?: boolean;
  permissions?: string[];
  testUserData?: any;
  youtubeProfile?: {
    channelId: string;
    channelTitle: string;
    description: string;
    thumbnailUrl: string;
    subscriberCount: string;
    customUrl?: string;
    bannerImageUrl?: string;
    lastSynced?: Date;
  };
}

// Helper function to get user data
const getUserData = async (firebaseUser: User): Promise<WizUser> => {
  try {
    // Initialize XP data in background (don't await to speed up loading)
    const initializeXP = async () => {
      try {
        const { initializeUserXP } = await import('@/lib/wiz-xp-core');
        await initializeUserXP(
          firebaseUser.uid, 
          firebaseUser.displayName || undefined, 
          firebaseUser.email || undefined
        );
        console.log('✅ XP data initialized in background');
      } catch (error) {
        console.warn('⚠️ XP initialization failed (non-blocking):', error);
      }
    };
    
    // Start XP initialization but don't wait for it
    initializeXP();
    
    let userData;
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      userData = userDoc.data();
    } catch (firestoreError) {
      console.warn('⚠️ Firestore connection failed, using fallback data:', firestoreError);
      userData = null; // Will use default values below
    }
    
    // Check if user is admin and get permissions
    const userPermissions = getUserPermissions(firebaseUser.email || '');
    
    const wizUser: WizUser = {
      ...firebaseUser,
      level: userData?.level || 1,
      totalXP: userData?.totalXP || userData?.currentXP || 0,
      youtubeConnected: userData?.youtubeConnected || false,
      createdAt: userData?.createdAt?.toDate() || new Date(),
      isAdmin: userPermissions.isAdmin,
      permissions: userPermissions.permissions,
      testUserData: null, // Remove demo data
      youtubeProfile: userData?.youtubeProfile ? {
        ...userData.youtubeProfile,
        lastSynced: userData.youtubeProfile.lastSynced?.toDate()
      } : undefined,
    };
    
    return wizUser;
  } catch (error) {
    console.error('Error getting user data:', error);
    // Return basic user data if Firestore fails
    const userPermissions = getUserPermissions(firebaseUser.email || '');
    return {
      ...firebaseUser,
      level: 1,
      totalXP: 0,
      youtubeConnected: false,
      createdAt: new Date(),
      isAdmin: userPermissions.isAdmin,
      permissions: userPermissions.permissions,
      testUserData: null,
      youtubeProfile: undefined,
    };
  }
};

// Create a global auth state manager
let globalUser: WizUser | null = null;
let globalLoading = true;
let authListenerInitialized = false;
let authUnsubscribe: (() => void) | null = null;
const authStateListeners = new Set<(user: WizUser | null, loading: boolean) => void>();

const updateGlobalAuthState = (user: WizUser | null, loading: boolean) => {
  globalUser = user;
  globalLoading = loading;
  authStateListeners.forEach(listener => listener(user, loading));
};

export const useAuth = () => {
  const [user, setUser] = useState<WizUser | null>(globalUser);
  const [loading, setLoading] = useState(globalLoading);

  useEffect(() => {
    // Register this component as a listener for global auth state changes
    const listener = (newUser: WizUser | null, newLoading: boolean) => {
      setUser(newUser);
      setLoading(newLoading);
    };
    authStateListeners.add(listener);

    // Only setup the Firebase listener once across all instances
    if (authListenerInitialized) {
      return () => {
        authStateListeners.delete(listener);
      };
    }
    
    console.log('🔧 Setting up singleton auth state listener...');
    authListenerInitialized = true;
    let hasLoggedState = false;
    
    authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      // Only log once to reduce noise
      if (!hasLoggedState) {
        console.log('🔄 Auth state changed:', firebaseUser ? `${firebaseUser.email} (uid: ${firebaseUser.uid})` : 'No user');
        hasLoggedState = true;
      }

      try {
        if (firebaseUser) {
          console.log('📥 Getting user data from Firestore...');
          const wizUser = await getUserData(firebaseUser);
          console.log('✅ User authenticated:', { email: wizUser.email, level: wizUser.level, totalXP: wizUser.totalXP });
          updateGlobalAuthState(wizUser, false);
        } else {
          console.log('❌ No Firebase user');
          updateGlobalAuthState(null, false);
        }
      } catch (error) {
        console.error('❌ Error in auth state change:', error);
        updateGlobalAuthState(null, false);
      }
    });

    // Handle redirect result on app initialization (only once)
    const handleRedirectResult = async () => {
      
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('getRedirectResult timeout')), 5000);
        });
        
        console.log('🔍 Calling getRedirectResult...');
        const result = await Promise.race([
          getRedirectResult(auth),
          timeoutPromise
        ]) as any;
        console.log('🔍 getRedirectResult completed:', result ? 'got result' : 'null result');
        
        if (result) {
          console.log('✅ Redirect auth successful:', result.user.email);
          const user = result.user;

          // Check if this was a YouTube authentication and redirect back to the Create page
          const redirectUrl = localStorage.getItem('wizxp_redirect_url');
          const wasYouTubeConnect = localStorage.getItem('wizxp_youtube_connect');
          const wasYouTubeReauth = localStorage.getItem('wizxp_youtube_reauth');

          // Store navigation info but don't navigate yet if this is YouTube auth
          let pendingNavigation = null;

          if (wasYouTubeConnect && redirectUrl && redirectUrl !== '/') {
            console.log('🎯 Detected YouTube auth redirect, will navigate to:', redirectUrl, 'after save');
            localStorage.removeItem('wizxp_redirect_url');
            pendingNavigation = redirectUrl;
          } else if (wasYouTubeConnect) {
            console.log('🎯 YouTube auth detected, will navigate to Create page after save');
            localStorage.removeItem('wizxp_redirect_url');
            pendingNavigation = '/?section=create';
          } else if (wasYouTubeReauth) {
            console.log('🎯 YouTube re-auth detected, will stay on Create page');
            pendingNavigation = '/?section=create';
          }
          
          // Check if this was a YouTube OAuth
          let isYouTubeAuth = false;
          if (wasYouTubeConnect || wasYouTubeReauth) {
            console.log('🔍 Detected YouTube OAuth attempt, checking credential...');
            console.log('🔍 Result credential:', result?.credential ? 'present' : 'null');
            console.log('🔍 Result user:', result?.user ? 'present' : 'null');
            console.log('🔍 Result object keys:', result ? Object.keys(result) : 'null result');
            console.log('🔍 wasYouTubeConnect:', wasYouTubeConnect);
            console.log('🔍 wasYouTubeReauth:', wasYouTubeReauth);

            // Try to get access token from credential first, then fallback to URL params
            let accessToken = null;

            if (result?.credential && isYouTubeAPIEnabled()) {
              try {
                accessToken = (result.credential as any).accessToken;
                console.log('🔍 Access token from credential:', accessToken ? 'present' : 'null');
              } catch (error) {
                console.log('⚠️ Error extracting access token from credential:', error);
              }
            }

            // If no access token from credential, try getting it from Firebase user
            if (!accessToken && isYouTubeAPIEnabled() && result?.user) {
              try {
                console.log('🔍 No access token in credential, trying to get fresh token...');

                // Try to get a fresh access token using Firebase Auth
                const authUser = result.user as any;
                if (authUser.accessToken) {
                  console.log('✅ Found access token in Firebase user object');
                  accessToken = authUser.accessToken;
                } else if (authUser.stsTokenManager?.accessToken) {
                  console.log('✅ Found access token in Firebase token manager');
                  accessToken = authUser.stsTokenManager.accessToken;
                } else {
                  console.log('🔍 Trying to get access token via getIdToken...');
                  const idToken = await authUser.getIdToken(true);
                  if (idToken) {
                    console.log('✅ Got ID token, but we need access token for YouTube API');
                    // For now, we'll mark as connected but without API access
                    console.log('⚠️ Will mark as connected but user will need to re-authorize for API access');
                  }
                }
              } catch (error) {
                console.error('❌ Error getting access token from Firebase user:', error);
              }
            }

            if (accessToken) {
              try {
                console.log('📺 Got access token, storing and fetching channel info...');

                // Store access token for later use
                localStorage.setItem('youtube_access_token', accessToken);
                console.log('💾 Access token stored for API calls');

                // Fetch YouTube channel information to confirm connection
                const channelInfo = await youTubeAPI.getChannelInfo(accessToken);
                if (channelInfo) {
                  console.log('✅ Successfully fetched YouTube channel:', channelInfo.name);
                  isYouTubeAuth = true;

                  // Store YouTube profile data
                  const youtubeProfile = {
                    channelId: channelInfo.id,
                    channelTitle: channelInfo.name,
                    description: channelInfo.description || '',
                    thumbnailUrl: channelInfo.avatar || '',
                    subscriberCount: channelInfo.subscriberCount || '0',
                    customUrl: channelInfo.customUrl || '',
                    bannerImageUrl: channelInfo.bannerImageUrl || '',
                    lastSynced: new Date(),
                  };

                  // Save YouTube profile data with access token
                  await setDoc(doc(db, 'users', user.uid), {
                    youtubeConnected: true,
                    youtubeProfile: youtubeProfile,
                    youtubeAccessToken: accessToken, // Store in database too
                    displayName: user.displayName || channelInfo.name,
                    photoURL: user.photoURL || channelInfo.avatar,
                  }, { merge: true });

                  console.log('✅ YouTube connection, profile, and access token saved');
                } else {
                  console.warn('⚠️ No channel info returned from YouTube API');
                }
              } catch (error) {
                console.warn('⚠️ Failed to fetch YouTube profile data:', error);
              }
            }

            // If we have YouTube connect or reauth flag, mark as connected regardless
            // (The OAuth completed successfully if we got here)
            if (wasYouTubeConnect || wasYouTubeReauth) {
              isYouTubeAuth = true;
              console.log('📝 Marking YouTube as connected due to OAuth completion...');
              console.log('🔍 isYouTubeAPIEnabled():', isYouTubeAPIEnabled());
              console.log('🔍 VITE_USE_YOUTUBE_API env var:', import.meta.env.VITE_USE_YOUTUBE_API);

              // Always save to Firestore regardless of feature flag - OAuth completed successfully
              console.log('💾 Attempting to save YouTube connection to Firestore...');
              console.log('🔍 User UID:', user.uid);
              console.log('🔍 Database instance:', db ? 'available' : 'null');

              try {
                const userDocRef = doc(db, 'users', user.uid);
                console.log('📄 Document reference created:', userDocRef.path);

                await setDoc(userDocRef, {
                  youtubeConnected: true,
                  lastYouTubeAuth: new Date(),
                }, { merge: true });

                console.log('✅ YouTube connection marked as successful (OAuth completed)');

                // Verify the save worked
                const savedDoc = await getDoc(userDocRef);
                const savedData = savedDoc.data();
                console.log('🔍 Verification - youtubeConnected in DB:', savedData?.youtubeConnected);

                // Now safe to navigate after successful save
                if (pendingNavigation) {
                  console.log('🚀 Navigating to:', pendingNavigation, 'after successful save');
                  setTimeout(() => {
                    const currentUrl = window.location.pathname + window.location.search;
                    if (currentUrl !== pendingNavigation) {
                      window.location.href = pendingNavigation;
                    }
                  }, 100);
                }

              } catch (error) {
                console.error('❌ Failed to save YouTube connection status:', error);
                console.error('❌ Error details:', error.message);
                console.error('❌ Error code:', error.code);

                // Still navigate even if save failed (OAuth completed successfully)
                if (pendingNavigation) {
                  console.log('🚀 Navigating to:', pendingNavigation, 'despite save error');
                  setTimeout(() => {
                    const currentUrl = window.location.pathname + window.location.search;
                    if (currentUrl !== pendingNavigation) {
                      window.location.href = pendingNavigation;
                    }
                  }, 100);
                }
              }
            }
          }

          // If we had pending navigation but no YouTube OAuth processing, navigate now
          if (pendingNavigation && !wasYouTubeConnect) {
            console.log('🚀 Navigating to:', pendingNavigation, '(non-YouTube auth)');
            setTimeout(() => {
              const currentUrl = window.location.pathname + window.location.search;
              if (currentUrl !== pendingNavigation) {
                window.location.href = pendingNavigation;
              }
            }, 100);
          }

          // Initialize user with appropriate service
          const userData = {
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            level: 1,
            totalXP: 0,
            youtubeConnected: isYouTubeAuth,
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
            
            // Initialize YouTube XP tracking in background (non-blocking)
            YouTubeXPService.initializeUserTracking(user.uid)
              .then(() => console.log('✅ YouTube XP tracking initialized'))
              .catch(error => console.warn('⚠️ Failed to initialize YouTube XP tracking:', error));
          } else {
            await LocalXPService.initializeLocalUser(user.uid, userData);
            console.log('✅ User data saved locally');
          }
        }
      } catch (error) {
        console.error('❌ Error handling redirect result:', error);
        // Don't let redirect result errors block the auth state listener
      }
    };

    handleRedirectResult();

    return () => {
      // Don't unsubscribe the global listener, just mark unmounted
      authStateListeners.delete(listener);
      console.log('🔄 Auth hook unmounted');
    };
  }, []);

  const setupUserData = async (user: User) => {
    try {
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
        try {
          await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
          console.log('✅ User data saved to Firestore');
        } catch (firestoreError) {
          console.warn('⚠️ Failed to save user data to Firestore, continuing anyway:', firestoreError);
          // Don't throw - allow auth to continue even if Firestore fails
        }
      } else {
        console.log('⚠️ YouTube API disabled, skipping Firestore user data');
      }
    } catch (error) {
      console.error('❌ Error setting up user data:', error);
    }
  };

  const signInWithGoogle = async (withYouTube: boolean = false) => {
    try {
      // Always use basic Google provider when YouTube API is disabled
      const shouldUseYouTube = withYouTube && isYouTubeAPIEnabled();
      const provider = shouldUseYouTube ? googleProviderWithYouTube : googleProvider;
      
      if (withYouTube && !isYouTubeAPIEnabled()) {
        logFeatureFlag('YouTube OAuth Scope', false, 'using basic Google Auth instead');
      }
      
      // 🔍 FIREBASE AUTH DEBUG: Verify client_id configuration
      console.group('🔍 FIREBASE AUTH DEBUG');
      console.log('Auth Domain from config:', auth.config?.authDomain || 'undefined');
      console.log('Current origin:', window.location.origin);
      console.log('Expected redirect URI:', `${window.location.origin}/__/auth/handler`);
      console.log('Firebase App ID:', auth.app?.options?.appId || 'undefined');
      console.log('🔑 Explicit Client ID (from env):', import.meta.env.VITE_GOOGLE_CLIENT_ID);
      console.log('🎯 Expected Client ID (from Google Cloud Console): 543256047502-4fdauu19uj3t63kf5saclcg597niecsh.apps.googleusercontent.com');
      console.log('✅ Client ID Match:', import.meta.env.VITE_GOOGLE_CLIENT_ID === '543256047502-4fdauu19uj3t63kf5saclcg597niecsh.apps.googleusercontent.com' ? '✅ YES' : '❌ NO - MISMATCH DETECTED!');
      console.log('Provider custom params:', provider.customParameters || 'none');
      console.log('Firebase auth app name:', auth.app?.name);
      console.groupEnd();
      
      // Use redirect authentication - this is more reliable
      console.log('🚀 Using redirect sign-in for better compatibility');
      await signInWithRedirect(auth, provider);
      // Note: This function doesn't return as the page will redirect
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      // Enhanced error messages for common issues
      if (error.code === 'auth/network-request-failed' || 
          error.message?.includes('ERR_BLOCKED_BY_CLIENT')) {
        throw new Error('🚫 Google services are blocked by your ad blocker or network.\n\n' +
          '✅ Quick fix:\n' +
          '1. Disable ad blocker for wizxp.com\n' +
          '2. Add *.googleapis.com to whitelist\n' +
          '3. Try incognito mode\n' +
          '4. Clear browser cache');
      } else if (error.code === 'auth/popup-blocked') {
        throw new Error('Popup was blocked. Please allow popups for this site or try refreshing the page.');
      } else if (error.code === 'auth/unauthorized-domain') {
        throw new Error('This domain is not authorized for authentication. Please contact support.');
      } else if (error.code === 'auth/internal-error' || error.message?.includes('internal-error')) {
        console.error('🔧 AUTH DEBUG: Internal authentication error - likely ad blocker interference');
        throw new Error('🚫 Authentication blocked by ad blocker.\n\n' +
          '✅ Please disable ad blockers for wizxp.com and reload the page.');
      }
      
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
        try {
          // Initialize YouTube API with OAuth token from redirect result
          const authResult = await getRedirectResult(auth);
          if (authResult?.credential) {
            // Get OAuth access token
            const accessToken = (authResult.credential as any).accessToken;
            if (accessToken) {
              youTubeAPI.setAccessToken(accessToken);
              
              // Fetch channel information
              console.log('📺 Fetching YouTube channel information...');
              const channelInfo = await youTubeAPI.getChannelInfo();
              
              // Prepare YouTube profile data
              const youtubeProfile = {
                channelId: channelInfo.id,
                channelTitle: channelInfo.name,
                description: channelInfo.description || '',
                thumbnailUrl: channelInfo.avatar,
                subscriberCount: channelInfo.subscriberCount,
                customUrl: channelInfo.customUrl,
                bannerImageUrl: channelInfo.bannerImageUrl,
                lastSynced: new Date(),
              };
              
              // Update user document in Firestore
              await setDoc(doc(db, 'users', user.uid), {
                youtubeConnected: true,
                youtubeProfile: youtubeProfile,
                displayName: user.displayName || channelInfo.name, // Auto-populate display name
                photoURL: user.photoURL || channelInfo.avatar, // Auto-populate profile picture
              }, { merge: true });
              
              console.log('✅ YouTube profile data saved:', youtubeProfile);
              
              // Update local user state
              const userDoc = await getDoc(doc(db, 'users', user.uid));
              const userData = userDoc.data();
              
              const updatedUser: WizUser = {
                ...user,
                youtubeConnected: true,
                level: userData?.level || 1,
                totalXP: userData?.totalXP || 0,
                createdAt: userData?.createdAt?.toDate() || new Date(),
                youtubeProfile: youtubeProfile,
                displayName: user.displayName || channelInfo.name,
                photoURL: user.photoURL || channelInfo.avatar,
              };
              
              updateGlobalAuthState(updatedUser, false);
            }
          }
        } catch (profileError) {
          console.warn('⚠️ Failed to fetch YouTube profile data (non-blocking):', profileError);
          // Still mark as connected even if profile fetch fails
          await setDoc(doc(db, 'users', user.uid), {
            youtubeConnected: true,
          }, { merge: true });
          
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
    if (globalUser) {
      try {
        console.log('🔄 Starting user data refresh...');
        const userDoc = await getDoc(doc(db, 'users', globalUser.uid));
        const userData = userDoc.data();

        const updatedUser: WizUser = {
          ...globalUser,
          level: userData?.level || 1,
          totalXP: userData?.totalXP || 0,
          youtubeConnected: userData?.youtubeConnected || false,
          createdAt: userData?.createdAt?.toDate() || new Date(),
        };

        console.log('🔄 Updating user state:', {
          oldXP: globalUser.totalXP,
          newXP: updatedUser.totalXP,
          level: updatedUser.level
        });

        updateGlobalAuthState(updatedUser, false);

        // Dispatch event to sync XP context
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('xpUpdated', {
            detail: { totalXP: updatedUser.totalXP }
          }));
          console.log('🔄 Dispatched xpUpdated event from refreshUserData with totalXP:', updatedUser.totalXP);
        }

      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
    }
  };

  const addXP = (amount: number) => {
    console.log('🎯 addXP called with amount:', amount, 'current user:', globalUser?.uid);

    if (globalUser) {
      const newTotalXP = globalUser.totalXP + amount;
      const newLevel = Math.floor(newTotalXP / 1000) + 1;

      const updatedUser: WizUser = {
        ...globalUser,
        totalXP: newTotalXP,
        level: newLevel,
      };

      console.log('⚡ XP update:', {
        oldXP: globalUser.totalXP,
        newXP: newTotalXP,
        oldLevel: globalUser.level,
        newLevel: newLevel
      });

      // Single global state update
      updateGlobalAuthState(updatedUser, false);

      // Dispatch custom event to sync XP context
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('xpUpdated', {
          detail: { totalXP: newTotalXP }
        }));
      }

      console.log('✅ Global auth state updated with new XP');
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
