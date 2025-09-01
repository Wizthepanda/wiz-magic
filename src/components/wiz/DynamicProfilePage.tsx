import { useUserType } from '@/hooks/useUserType';
import { PrivateViewerProfile } from './PrivateViewerProfile';
import { PrivateCreatorDashboard } from './PrivateCreatorDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface DynamicProfilePageProps {
  className?: string;
}

export const DynamicProfilePage: React.FC<DynamicProfilePageProps> = ({ className }) => {
  const { user } = useAuth();
  const { userType, isCreator, isViewer, loading } = useUserType();
  
  // 🚀 DEBUG MODE: Force creator view for demo (remove in production)
  // Check if user is Irfan Dean (for demo purposes)
  const isDebugCreator = user?.displayName === 'Irfan Dean' || user?.email === 'irfandeandesigns@gmail.com';
  const forceCreatorView = isDebugCreator; // Set to true for demo

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-12 h-12 mx-auto animate-spin text-purple-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Loading Profile...</h3>
            <p className="text-sm text-gray-600">
              Determining your profile experience
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return (
      <div className="flex items-center justify-center py-12">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <User className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">Sign In Required</h3>
            <p className="text-gray-600">Please sign in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Debug logging
  console.log(`🔄 DynamicProfilePage: Rendering ${userType.toUpperCase()} profile for user ${user.displayName}`, {
    userType,
    isCreator,
    isViewer,
    forceCreatorView,
    userId: user.uid
  });

  // 🔑 CONDITIONAL PROFILE SWITCHING LOGIC (SIDE PANEL ONLY)
  // This component handles the PRIVATE profile switching in the side panel ONLY
  // 
  // SEPARATION RULES:
  // 1. Side Panel Profile = Private (Viewer OR Creator dashboard depending on role)
  // 2. Public Creator Profile Page = Separate component (unchanged by this logic)
  // 3. NO DUPLICATION - Only ONE profile page exists in side panel at any time
  //
  // IF user.role == "creator" AND user.hasEnrolledOnCreatePage == true:
  //     SidePanel.ProfilePage = CreatorDashboardProfile (PrivateCreatorDashboard)
  // ELSE:
  //     SidePanel.ProfilePage = ViewerPrivateProfile (PrivateViewerProfile)
  
  if (isCreator || forceCreatorView) {
    // Load Creator Private Dashboard Profile for enrolled creators (or debug mode)
    console.log(`✅ Loading Creator Dashboard for ${user.displayName} ${forceCreatorView ? '(DEBUG MODE)' : '(CREATOR)'}`);
    return (
      <div className={className}>
        <PrivateCreatorDashboard />
      </div>
    );
  } else {
    // Load Viewer Private Profile for wizards
    console.log(`👤 Loading Viewer Profile for ${user.displayName} (VIEWER)`);
    return (
      <div className={className}>
        <PrivateViewerProfile />
      </div>
    );
  }
};