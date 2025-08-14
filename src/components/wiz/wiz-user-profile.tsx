import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LogOut, Settings, User, Youtube, Crown, Zap } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export const WizUserProfile = () => {
  const { user, signOut, signInWithGoogle, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Force page reload to return to homepage
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Debug user state changes
  console.log('👤 UserProfile render:', { 
    userId: user?.uid, 
    totalXP: user?.totalXP, 
    level: user?.level 
  });

  if (loading) {
    return (
      <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2">
        <Badge variant="outline" className="text-wiz-primary border-wiz-primary/30">
          Demo Mode
        </Badge>
        <Button 
          onClick={() => signInWithGoogle().catch(() => console.log('Auth not configured'))} 
          className="bg-gradient-to-r from-wiz-primary to-wiz-secondary hover:from-wiz-primary/90 hover:to-wiz-secondary/90"
        >
          <Youtube className="w-4 h-4 mr-2" />
          Sign in with Google
        </Button>
      </div>
    );
  }

  const xpForNextLevel = user.level * 1000;
  const currentLevelXP = user.totalXP % 1000;
  const progressPercentage = (currentLevelXP / 1000) * 100;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-2 space-x-3 hover:bg-muted/50">
          <div className="text-right">
            <div className="text-sm font-medium">{user.displayName}</div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-wiz-primary/20 text-wiz-primary">
                <Crown className="w-3 h-3 mr-1" />
                Level {user.level}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {user.totalXP.toLocaleString()} XP
              </span>
            </div>
          </div>
          <Avatar className="h-10 w-10 border-2 border-wiz-primary/30">
            <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
            <AvatarFallback className="bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white font-bold">
              {user.displayName?.charAt(0) || 'W'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12 border-2 border-wiz-primary/30">
              <AvatarImage src={user.photoURL || ''} alt={user.displayName || ''} />
              <AvatarFallback className="bg-gradient-to-r from-wiz-primary to-wiz-secondary text-white font-bold">
                {user.displayName?.charAt(0) || 'W'}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{user.displayName}</div>
              <div className="text-sm text-muted-foreground">{user.email}</div>
            </div>
          </div>
          
          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <div className="flex items-center space-x-1">
                <Zap className="w-4 h-4 text-wiz-accent" />
                <span>Level {user.level}</span>
              </div>
              <span>{currentLevelXP}/{xpForNextLevel} XP</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
          
          {/* YouTube Connection Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm">YouTube Connected</span>
            <Badge variant={user.youtubeConnected ? "default" : "destructive"}>
              <Youtube className="w-3 h-3 mr-1" />
              {user.youtubeConnected ? "Connected" : "Not Connected"}
            </Badge>
          </div>
          
          {/* Menu Items */}
          <div className="pt-2 border-t">
            <DropdownMenuItem className="cursor-pointer">
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer text-red-600 focus:text-red-600"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};