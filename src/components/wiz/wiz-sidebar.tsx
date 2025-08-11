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
  X
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

      {/* Professional Sidebar */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700 transition-all duration-300 z-40",
          isCollapsed ? "w-0 md:w-16" : "w-64",
          "md:relative md:translate-x-0",
          isCollapsed ? "-translate-x-full md:translate-x-0" : "translate-x-0"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-wiz-primary/20">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-wiz-primary to-wiz-secondary flex items-center justify-center neon-glow">
                <Crown className="w-5 h-5 text-white" />
              </div>
              {!isCollapsed && (
                <span className="text-xl font-bold bg-gradient-to-r from-wiz-primary to-wiz-secondary bg-clip-text text-transparent">
                  WIZ
                </span>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size={isCollapsed ? "sm" : "default"}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full justify-start relative group transition-all duration-200",
                  activeSection === item.id 
                    ? "bg-wiz-primary/20 text-wiz-primary border border-wiz-primary/30" 
                    : "text-gray-300 hover:text-white hover:bg-wiz-primary/10",
                  isCollapsed && "justify-center px-2"
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
            ))}
          </nav>

          {/* Bottom Section - Logout and Collapse */}
          <div className="border-t border-slate-700">
            {/* Logout */}
            <div className="p-4">
              <Button
                variant="ghost"
                size={isCollapsed ? "sm" : "default"}
                onClick={signOut}
                className={cn(
                  "w-full justify-start text-gray-400 hover:text-red-400 hover:bg-red-500/10",
                  isCollapsed && "justify-center px-2"
                )}
              >
                <LogOut className={cn("w-5 h-5", !isCollapsed && "mr-3")} />
                {!isCollapsed && <span>Logout</span>}
              </Button>
            </div>

            {/* Collapse Toggle (Desktop) */}
            <div className="hidden md:block p-4 pt-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full text-gray-500 hover:text-gray-300"
              >
                {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
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