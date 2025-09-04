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
  
  // Production mode - use real role detection only
  const forceCreatorView = false;

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

  // Profile switching debug logging
  console.log(`🔄 Profile: ${userType.toUpperCase()} for ${user.displayName}`, {
    userType,
    isCreator,
    userId: user.uid?.slice(0, 8)
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
  
  if (isCreator) {
    // Load Creator Private Dashboard for users who have connected YouTube and created content
    console.log(`✅ Creator Dashboard: ${user.displayName} (has connected YouTube + created content)`);
    return (
      <div className={className}>
        <PrivateCreatorDashboard />
      </div>
    );
  } else {
    // Load Viewer Profile for users who haven't completed creator requirements
    console.log(`👤 Viewer Profile: ${user.displayName} (no YouTube connection or content creation)`);
    return (
      <div className={className}>
        <PrivateViewerProfile />
      </div>
    );
  }
};