import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Menu, 
  Compass, 
  Crown, 
  Trophy, 
  User, 
  Settings, 
  Plus,
  LogOut,
  Zap,
  GraduationCap,
  Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useXp } from '@/context/XpContext';

interface WizMobileMenuProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const WizMobileMenu = ({ activeSection, onSectionChange }: WizMobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { level, xp, xpToNextLevel } = useXp();
  const location = useLocation();

  // Mobile-only check for handlers
  const isMobile = () => window.innerWidth <= 768;

  // Handle section selection - mobile only
  const handleSectionSelect = (item: any) => {
    if (isMobile()) {
      if (item.route) {
        // External route navigation
        window.location.href = item.route;
      } else if (item.internalNav) {
        // Check if we're currently on the Claim page
        if (location.pathname === '/claim') {
          // Navigate to dashboard with the selected section
          window.location.href = `/?section=${item.id}`;
        } else {
          // Internal dashboard navigation
          onSectionChange(item.id);
        }
      }
      setIsOpen(false);
    }
  };


  // Match desktop sidebar navigation exactly
  const navigation = [
    { 
      id: 'discover', 
      label: 'Discover', 
      icon: Compass,
      gradient: 'from-blue-500 to-purple-600',
      internalNav: true
    },
    { 
      id: 'create', 
      label: 'Create', 
      icon: Plus,
      gradient: 'from-green-500 to-teal-600',
      internalNav: true
    },
    { 
      id: 'learn', 
      label: 'Learn', 
      icon: GraduationCap,
      gradient: 'from-amber-500 to-orange-600',
      internalNav: true
    },
    { 
      id: 'claim', 
      label: 'Claim', 
      icon: Gift,
      gradient: 'from-emerald-500 to-green-600',
      badge: 'New',
      route: '/claim'
    },
    { 
      id: 'premiere', 
      label: 'WIZ Premiere', 
      icon: Crown,
      gradient: 'from-yellow-500 to-orange-600',
      level: 5,
      internalNav: true
    },
    { 
      id: 'leaderboard', 
      label: 'Leaderboard', 
      icon: Trophy,
      gradient: 'from-purple-500 to-pink-600',
      internalNav: true
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User,
      gradient: 'from-indigo-500 to-blue-600',
      internalNav: true
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      gradient: 'from-gray-500 to-slate-600',
      internalNav: true
    },
  ];

  // Handle logout - mobile only
  const handleLogout = async () => {
    if (isMobile()) {
      try {
        await signOut();
        window.location.reload();
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  };

  return (
    <div className="block md:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="p-2 hover:bg-white/10 transition-all duration-200 active:scale-95 touch-manipulation"
            style={{
              minWidth: '44px',
              minHeight: '44px',
            }}
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </Button>
        </SheetTrigger>

        <SheetContent 
          side="left" 
          className="w-80 max-w-[80vw] p-0 border-0 bg-gradient-to-b from-white/95 to-gray-50/95 backdrop-blur-xl"
          style={{
            borderTopRightRadius: '16px',
            borderBottomRightRadius: '16px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          }}
        >
          <div className="flex flex-col h-full">
            {/* Header with User Profile */}
            <SheetHeader className="p-6 pb-4">
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12 ring-2 ring-white/40 shadow-md">
                  <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
                  <AvatarFallback 
                    className="text-lg font-bold text-white bg-gradient-to-r from-purple-500 to-violet-600"
                  >
                    {user?.displayName?.charAt(0) || 'W'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <SheetTitle className="text-lg font-bold text-gray-900">
                    {user?.displayName || 'WIZ User'}
                  </SheetTitle>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge 
                      className="text-xs font-semibold px-2 py-0.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white border-0"
                    >
                      Lv {level}
                    </Badge>
                    <div className="text-xs text-gray-500 flex items-center">
                      <Zap className="w-3 h-3 text-yellow-500 mr-1" />
                      {xp} XP
                    </div>
                  </div>
                </div>
              </div>
            </SheetHeader>

            {/* Navigation Items */}
            <nav className="flex-1 px-6 py-2 space-y-2 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                
                return (
                  <Button
                    key={item.id}
                    variant="ghost"
                    onClick={() => handleSectionSelect(item)}
                    className={cn(
                      "w-full justify-start p-3 h-auto rounded-lg hover:bg-gray-100 transition-all duration-200",
                      isActive && "bg-gray-100"
                    )}
                  >
                    <div className="flex items-center space-x-3 w-full">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center",
                        isActive 
                          ? `bg-gradient-to-r ${item.gradient}` 
                          : "bg-gray-100"
                      )}>
                        <Icon className={cn(
                          "w-4 h-4",
                          isActive ? "text-white" : "text-gray-600"
                        )} />
                      </div>
                      <div className="flex items-center space-x-2 flex-1">
                        <span className={cn(
                          "font-medium text-sm",
                          isActive ? "text-gray-900" : "text-gray-700"
                        )}>
                          {item.label}
                        </span>
                        {item.level && (
                          <Badge className="text-xs px-1.5 py-0.5 bg-orange-500 text-white border-0">
                            Lv{item.level}+
                          </Badge>
                        )}
                        {item.badge && (
                          <Badge className="text-xs px-1.5 py-0.5 bg-emerald-500 text-white border-0">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Button>
                );
              })}
            </nav>

            {/* Logout Section */}
            <div className="p-6 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center mr-3">
                  <LogOut className="w-4 h-4 text-red-600" />
                </div>
                <span className="font-medium text-sm">Sign Out</span>
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};