import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type UserType = 'viewer' | 'creator';

interface UserTypeInfo {
  userType: UserType;
  isCreator: boolean;
  isViewer: boolean;
  hasCreatedContent: boolean;
  loading: boolean;
  refreshUserType: () => void;
}

export const useUserType = (): UserTypeInfo => {
  const { user } = useAuth();
  const [userType, setUserType] = useState<UserType>('viewer');
  const [hasCreatedContent, setHasCreatedContent] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to manually refresh user type
  const refreshUserType = () => {
    console.log('🔄 Manually refreshing user type...');
    setRefreshTrigger(prev => prev + 1);
  };

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    setLoading(true);
    
    // 🚀 REAL-TIME LISTENER: Listen for changes to user document
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (userDoc) => {
        try {
          if (userDoc.exists()) {
            const userData = userDoc.data();
            
            // 🔑 CONDITIONAL LOGIC FOR SIDE PANEL PROFILE SWITCHING
            // IF user.role == "creator" AND user.hasEnrolledOnCreatePage == true:
            //     SidePanel.ProfilePage = CreatorDashboardProfile
            // ELSE:
            //     SidePanel.ProfilePage = ViewerPrivateProfile
            
            // User is a creator if they have:
            // 1. Connected YouTube through Create Page AND
            // 2. Actually uploaded/created content OR explicitly set as creator role
            // 
            // STRICT CRITERIA:
            // - Must have connected YouTube via Create Page (youtubeConnected = true)
            // - Must have actually created content (hasCreatedContent = true) OR
            // - Must have uploaded videos (videosUploaded > 0) OR
            // - Must have created courses (coursesCreated > 0) OR
            // - Must be explicitly set as creator role
            
            const hasYouTubeAuth = userData.youtubeConnected === true;
            const hasActuallyCreatedContent = userData.hasCreatedContent === true || 
                                             (userData.coursesCreated && userData.coursesCreated > 0) || 
                                             (userData.videosUploaded && userData.videosUploaded > 0);
            const isExplicitCreator = userData.role === 'creator';
            
            // ENHANCED LOGIC: User is creator if they meet ANY of these conditions:
            // 1. YouTube connected AND content created (strict criteria)
            // 2. Explicitly set as creator role (override)
            // 3. Has been promoted to creator before (fallback for data consistency)
            const isCreatorUser = hasYouTubeAuth && (hasActuallyCreatedContent || isExplicitCreator) ||
                                  isExplicitCreator || 
                                  userData.creatorPromotedAt; // Additional safety check
            
            setUserType(isCreatorUser ? 'creator' : 'viewer');
            setHasCreatedContent(hasActuallyCreatedContent || isExplicitCreator);
            
            console.log(`👤 User type detected (REAL-TIME): ${isCreatorUser ? 'CREATOR' : 'VIEWER'}`, {
              hasYouTubeAuth,
              hasActuallyCreatedContent,
              isExplicitCreator,
              isCreatorUser,
              hasBeenPromoted: !!userData.creatorPromotedAt,
              criteria: {
                strictCriteria: hasYouTubeAuth && (hasActuallyCreatedContent || isExplicitCreator),
                explicitCreator: isExplicitCreator,
                previouslyPromoted: !!userData.creatorPromotedAt
              },
              userData: { 
                role: userData.role,
                youtubeConnected: userData.youtubeConnected,
                coursesCreated: userData.coursesCreated,
                videosUploaded: userData.videosUploaded,
                hasCreatedContent: userData.hasCreatedContent,
                creatorPromotedAt: userData.creatorPromotedAt
              }
            });
          } else {
            // New user defaults to viewer
            setUserType('viewer');
            setHasCreatedContent(false);
            console.log('👤 New user - defaulting to VIEWER (REAL-TIME)');
          }
        } catch (error) {
          console.error('Error processing user type update:', error);
          // Don't change state on error to prevent flickering
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error in user type listener:', error);
        // Default to viewer on listener error
        setUserType('viewer');
        setHasCreatedContent(false);
        setLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, [user?.uid, refreshTrigger]);

  return {
    userType,
    isCreator: userType === 'creator',
    isViewer: userType === 'viewer',
    hasCreatedContent,
    loading,
    refreshUserType
  };
};

// Helper function to promote user to creator
export const promoteToCreator = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Update user document to mark as creator with full creator data
      await userDoc.ref.update({
        // Creator role and enrollment flags
        hasCreatedContent: true,
        role: 'creator',
        
        // YouTube connection data
        youtubeConnected: true,
        youtubeProfile: {
          channelId: 'UCexample123',
          channelName: 'WIZ Creator Channel',
          profilePicture: 'https://yt3.ggpht.com/example.jpg',
          subscriberCount: '10.5K',
          videoCount: 42
        },
        
        // Enrollment timestamps
        creatorPromotedAt: new Date().toISOString(),
        youtubeConnectedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        
        // Initialize creator metrics
        coursesCreated: 0,
        videosUploaded: 0,
        totalEarnings: 0
      });
      
      console.log('✅ User promoted to creator with full data:', userId);
    } else {
      console.error('❌ User document not found:', userId);
      throw new Error('User document not found');
    }
  } catch (error) {
    console.error('❌ Error promoting user to creator:', error);
    throw error;
  }
};