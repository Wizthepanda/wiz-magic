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

interface WizSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const WizSidebar = ({ activeSection, onSectionChange }: WizSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

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

      {/* Enhanced Sidebar with Gradients */}
      <aside 
        className={cn(
          "fixed left-0 top-0 h-full bg-gradient-to-b from-purple-900/95 via-slate-900/90 to-purple-800/95 backdrop-blur-xl border-r border-purple-400/30 transition-all duration-300 z-40 shadow-2xl",
          isCollapsed ? "w-0 md:w-16" : "w-72",
          "md:relative md:translate-x-0",
          isCollapsed ? "-translate-x-full md:translate-x-0" : "translate-x-0"
        )}
        style={{
          background: 'linear-gradient(180deg, rgba(76, 29, 149, 0.95) 0%, rgba(15, 23, 42, 0.90) 50%, rgba(88, 28, 135, 0.95) 100%)',
          backdropFilter: 'blur(20px)',
          borderRight: '1px solid rgba(168, 85, 247, 0.3)',
          boxShadow: '0 0 50px rgba(139, 92, 246, 0.2)'
        }}
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

          {/* Enhanced Navigation */}
          <nav className="flex-1 p-6 space-y-3">
            {navigation.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                size={isCollapsed ? "sm" : "lg"}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full justify-start relative group transition-all duration-300 rounded-xl",
                  activeSection === item.id 
                    ? item.id === 'premiere'
                      ? "bg-gradient-to-r from-purple-600/40 to-violet-600/40 text-white border border-purple-400/50 shadow-lg shadow-purple-500/25"
                      : "bg-gradient-to-r from-wiz-primary/30 to-wiz-secondary/20 text-white border border-wiz-primary/50"
                    : item.id === 'premiere'
                      ? "text-purple-200 hover:text-white hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-violet-600/20 hover:border-purple-400/30"
                      : "text-gray-300 hover:text-white hover:bg-wiz-primary/10",
                  isCollapsed && "justify-center px-2"
                )}
                style={{
                  boxShadow: activeSection === item.id && item.id === 'premiere'
                    ? '0 0 20px rgba(139, 92, 246, 0.4), inset 0 0 20px rgba(139, 92, 246, 0.1)'
                    : activeSection === item.id
                    ? '0 0 15px rgba(168, 85, 247, 0.3)'
                    : 'none'
                }}
              >
                <div className="relative">
                  <item.icon 
                    className={cn(
                      "w-6 h-6 transition-all duration-300", 
                      !isCollapsed && "mr-4",
                      activeSection === item.id && item.id === 'premiere' && "text-yellow-300",
                      activeSection === item.id && item.id !== 'premiere' && "text-wiz-accent"
                    )}
                    style={{
                      filter: activeSection === item.id 
                        ? item.id === 'premiere'
                          ? 'drop-shadow(0 0 8px rgba(252, 211, 77, 0.8))'
                          : 'drop-shadow(0 0 8px rgba(0, 216, 255, 0.8))'
                        : 'none'
                    }}
                  />
                  {/* Special glow for WIZ Premiere */}
                  {item.id === 'premiere' && (
                    <div 
                      className="absolute inset-0 rounded-full opacity-50"
                      style={{
                        background: activeSection === item.id 
                          ? 'radial-gradient(circle, rgba(252, 211, 77, 0.3) 0%, transparent 70%)'
                          : 'radial-gradient(circle, rgba(139, 92, 246, 0.2) 0%, transparent 70%)',
                        animation: activeSection === item.id ? 'pulse 2s infinite' : 'none'
                      }}
                    />
                  )}
                </div>
                
                {!isCollapsed && (
                  <>
                    <span className="flex-1 text-left font-medium">{item.label}</span>
                    {item.level && (
                      <span 
                        className="px-3 py-1 text-xs bg-gradient-to-r from-yellow-400 to-orange-500 text-yellow-900 rounded-full font-bold shadow-sm"
                        style={{
                          boxShadow: '0 0 10px rgba(251, 191, 36, 0.6)'
                        }}
                      >
                        Lv{item.level}+
                      </span>
                    )}
                  </>
                )}
                
                {/* Enhanced hover glow effect */}
                <div 
                  className={cn(
                    "absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl",
                    item.id === 'premiere' 
                      ? "bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-violet-500/0"
                      : "bg-gradient-to-r from-wiz-primary/0 via-wiz-primary/10 to-wiz-secondary/0"
                  )}
                  style={{
                    boxShadow: item.id === 'premiere' 
                      ? '0 0 15px rgba(139, 92, 246, 0.3)'
                      : '0 0 15px rgba(168, 85, 247, 0.3)'
                  }}
                />
              </Button>
            ))}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-wiz-primary/20">
            <Button
              variant="ghost"
              size={isCollapsed ? "sm" : "default"}
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
          <div className="hidden md:block p-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-full"
            >
              {isCollapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </Button>
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