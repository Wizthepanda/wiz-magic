import { useState } from 'react';
import { 
  Compass, 
  Link2, 
  Crown, 
  Trophy, 
  User, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface WizSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const WizSidebar = ({ activeSection, onSectionChange }: WizSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // Force page reload to return to homepage
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigation = [
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'activate', label: 'Activate', icon: Link2 },
    { id: 'premiere', label: 'WIZ Premiere', icon: Crown, level: 5 },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
      </Button>

      {/* Sticky Professional Sidebar */}
      <aside 
        className={cn(
          "sticky top-0 left-0 h-screen bg-gradient-to-b from-slate-900/95 via-slate-800/90 to-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 transition-all duration-300 z-40 shadow-2xl",
          isCollapsed ? "w-16" : "w-64",
          "md:translate-x-0",
          "max-md:fixed max-md:left-0 max-md:top-0",
          isCollapsed ? "max-md:-translate-x-full" : "max-md:translate-x-0"
        )}
        style={{
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(148, 163, 184, 0.3)',
          boxShadow: '0 0 50px rgba(0, 0, 0, 0.3)'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className={cn("p-6 border-b border-slate-700/50", isCollapsed && "px-3")}>
            <div className={cn("flex items-center", isCollapsed ? "justify-center" : "space-x-3")}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-wiz-primary to-wiz-secondary flex items-center justify-center shadow-lg">
                <Crown className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold text-white">
                  WIZ
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className={cn("flex-1 space-y-2", isCollapsed ? "p-2" : "p-4")}>
            {navigation.map((item) => (
              <div key={item.id} className="relative group">
                <Button
                  variant="ghost"
                  size={isCollapsed ? "sm" : "default"}
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "w-full relative transition-all duration-300",
                    activeSection === item.id 
                      ? "bg-wiz-primary/20 text-wiz-primary border border-wiz-primary/30 shadow-lg" 
                      : "text-gray-300 hover:text-white hover:bg-slate-700/50",
                    isCollapsed ? "justify-center px-2 h-12" : "justify-start"
                  )}
                >
                  <item.icon className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.level && (
                        <span className="px-2 py-1 text-xs bg-wiz-accent/20 text-wiz-accent rounded-full">
                          Lv{item.level}+
                        </span>
                      )}
                    </>
                  )}
                </Button>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.label}
                    {item.level && <span className="ml-1 text-wiz-accent">Lv{item.level}+</span>}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Bottom Section - Logout and Collapse */}
          <div className="border-t border-slate-700/50">
            {/* Logout */}
            <div className={cn(isCollapsed ? "p-2" : "p-4")}>
              <div className="relative group">
                <Button
                  variant="ghost"
                  size={isCollapsed ? "sm" : "default"}
                  onClick={handleLogout}
                  className={cn(
                    "w-full text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300",
                    isCollapsed ? "justify-center px-2 h-12" : "justify-start"
                  )}
                >
                  <LogOut className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
                  {!isCollapsed && <span>Logout</span>}
                </Button>
                
                {/* Tooltip for collapsed logout */}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-slate-800 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    Logout
                  </div>
                )}
              </div>
            </div>

            {/* Collapse Toggle (Desktop) */}
            <div className={cn("hidden md:block", isCollapsed ? "p-2 pt-0" : "p-4 pt-0")}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full text-gray-500 hover:text-gray-300 transition-all duration-300"
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {!isCollapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsCollapsed(true)}
        />
      )}
    </>
  );
};