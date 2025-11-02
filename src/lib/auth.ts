import { auth, googleProvider, db } from '@/lib/firebase';
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { NavigateFunction } from 'react-router-dom';
import { toast } from 'sonner';

/**
 * Sign in with Google using popup and redirect to /discover
 * This provides a seamless, no-page-reload authentication experience
 *
 * @param navigate - React Router navigate function
 * @param usePopup - Whether to use popup (default: true) or redirect fallback
 * @returns Promise<void>
 */
export async function signInWithGoogleAndRedirect(
  navigate: NavigateFunction,
  usePopup: boolean = true
): Promise<void> {
  try {
    console.log('🚀 Starting Google Sign In with', usePopup ? 'popup' : 'redirect');

    let result;

    if (usePopup) {
      // Preferred: Popup flow (instant, no page reload)
      result = await signInWithPopup(auth, googleProvider);
    } else {
      // Fallback: Redirect flow (if popup blocked)
      await signInWithRedirect(auth, googleProvider);
      return; // Redirect will complete auth on return
    }

    const user = result.user;
    console.log('✅ Authentication successful:', user.email);

    // Create/update user document in Firestore
    const userData = {
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      level: 1,
      totalZaps: 0,
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

    console.log('💾 Saving user data to Firestore...');
    await setDoc(doc(db, 'users', user.uid), userData, { merge: true });
    console.log('✅ User data saved successfully');

    // Show success toast
    toast.success(`Welcome back, ${user.displayName || 'Wizard'}!`);

    // Navigate to discover page (replace: true prevents back button to login)
    console.log('🚀 Navigating to /discover...');
    navigate('/discover', { replace: true });

  } catch (err: any) {
    console.error('❌ Authentication error:', err);

    // Handle specific error cases
    if (err.code === 'auth/popup-blocked') {
      console.log('⚠️ Popup blocked, falling back to redirect');
      toast.info('Popup blocked. Redirecting to Google Sign In...');
      return signInWithGoogleAndRedirect(navigate, false);
    } else if (err.code === 'auth/popup-closed-by-user') {
      toast.error('Sign in cancelled. Please try again.');
    } else if (err.code === 'auth/network-request-failed') {
      toast.error('Network error. Please check your connection and try again.');
    } else if (err.code === 'auth/unauthorized-domain') {
      toast.error('This domain is not authorized. Please contact support.');
    } else {
      toast.error('Sign in failed. Please try again.');
    }

    throw err;
  }
}

/**
 * Wrapper for create community action
 * Ensures user is authenticated before navigating to /create
 *
 * @param navigate - React Router navigate function
 * @param isAuthenticated - Whether user is already authenticated
 */
export async function handleCreateCommunity(
  navigate: NavigateFunction,
  isAuthenticated: boolean
): Promise<void> {
  if (isAuthenticated) {
    navigate('/create');
  } else {
    // Sign in first, then redirect to create
    try {
      await signInWithGoogleAndRedirect(navigate);
      // After successful auth, navigate to create instead of discover
      navigate('/create', { replace: true });
    } catch (err) {
      console.error('Failed to authenticate for community creation:', err);
    }
  }
}
