import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type UserType = 'viewer' | 'creator';

interface UserTypeInfo {
  userType: UserType;
  isCreator: boolean;
  isViewer: boolean;
  hasCreatedContent: boolean;
  loading: boolean;
}

export const useUserType = (): UserTypeInfo => {
  const { user } = useAuth();
  const [userType, setUserType] = useState<UserType>('viewer');
  const [hasCreatedContent, setHasCreatedContent] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserType = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Check if user has creator data in Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // 🔑 CONDITIONAL LOGIC FOR SIDE PANEL PROFILE SWITCHING
          // IF user.role == "creator" AND user.hasEnrolledOnCreatePage == true:
          //     SidePanel.ProfilePage = CreatorDashboardProfile
          // ELSE:
          //     SidePanel.ProfilePage = ViewerPrivateProfile
          
          // User is a creator if they have:
          // 1. YouTube Auth (YouTube connection) AND
          // 2. Have enrolled via Create Page (content creation or explicit role)
          const hasYouTubeAuth = userData.youtubeConnected || userData.youtubeProfile;
          const hasEnrolledOnCreatePage = userData.hasCreatedContent || 
                                        userData.coursesCreated > 0 || 
                                        userData.videosUploaded > 0 ||
                                        userData.role === 'creator';
          
          const isCreatorUser = hasYouTubeAuth && hasEnrolledOnCreatePage;
          
          setUserType(isCreatorUser ? 'creator' : 'viewer');
          setHasCreatedContent(hasEnrolledOnCreatePage);
          
          console.log(`👤 User type detected: ${isCreatorUser ? 'CREATOR' : 'VIEWER'}`, {
            hasYouTubeAuth,
            hasEnrolledOnCreatePage,
            userData: { 
              role: userData.role,
              coursesCreated: userData.coursesCreated,
              videosUploaded: userData.videosUploaded,
              hasCreatedContent: userData.hasCreatedContent
            }
          });
        } else {
          // New user defaults to viewer
          setUserType('viewer');
          setHasCreatedContent(false);
          console.log('👤 New user - defaulting to VIEWER');
        }
      } catch (error) {
        console.error('Error checking user type:', error);
        // Default to viewer on error
        setUserType('viewer');
        setHasCreatedContent(false);
      } finally {
        setLoading(false);
      }
    };

    checkUserType();
  }, [user?.uid]);

  return {
    userType,
    isCreator: userType === 'creator',
    isViewer: userType === 'viewer',
    hasCreatedContent,
    loading
  };
};

// Helper function to promote user to creator
export const promoteToCreator = async (userId: string): Promise<void> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      // Update user document to mark as creator
      await userDoc.ref.update({
        hasCreatedContent: true,
        role: 'creator',
        creatorPromotedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      console.log('✅ User promoted to creator:', userId);
    }
  } catch (error) {
    console.error('❌ Error promoting user to creator:', error);
    throw error;
  }
};