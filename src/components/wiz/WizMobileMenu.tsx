import { useState } from 'react';
import { 
  Menu, 
  X, 
  Compass, 
  Crown, 
  Trophy, 
  User, 
  Settings, 
  Plus,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface WizMobileMenuProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const WizMobileMenu = ({ activeSection, onSectionChange }: WizMobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const navigation = [
    { 
      id: 'discover', 
      label: 'Discover', 
      icon: Compass,
      gradient: 'from-blue-500 to-purple-600',
      description: 'Explore trending videos'
    },
    { 
      id: 'create', 
      label: 'Create', 
      icon: Plus,
      gradient: 'from-green-500 to-teal-600',
      description: 'Upload your content'
    },
    { 
      id: 'premiere', 
      label: 'WIZ Premiere', 
      icon: Crown,
      gradient: 'from-yellow-500 to-orange-600',
      description: 'Premium creator content',
      level: 5,
      isNew: true
    },
    { 
      id: 'leaderboard', 
      label: 'Leaderboard', 
      icon: Trophy,
      gradient: 'from-purple-500 to-pink-600',
      description: 'Top creators and earners'
    },
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: User,
      gradient: 'from-indigo-500 to-blue-600',
      description: 'Your account settings'
    },
    { 
      id: 'settings', 
      label: 'Settings', 
      icon: Settings,
      gradient: 'from-gray-500 to-slate-600',
      description: 'App preferences'
    },
  ];

  const handleSectionSelect = (sectionId: string) => {
    onSectionChange(sectionId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Hamburger Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="p-2 hover:bg-white/10 transition-all duration-200 active:scale-95 touch-manipulation"
        style={{
          minWidth: '44px',
          minHeight: '44px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </Button>

      {/* Full-Screen Overlay Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ 
                type: 'tween', 
                duration: 0.25, 
                ease: [0.23, 1, 0.32, 1] 
              }}
              className="fixed inset-y-0 left-0 w-80 max-w-[85vw] z-50 overflow-y-auto overflow-x-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.95) 100%)',
                backdropFilter: 'blur(20px)',
                borderRight: '1px solid rgba(0, 0, 0, 0.1)',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)'
              }}
            >
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-800">WIZ</h2>
                      <p className="text-sm text-gray-500">Magic Platform</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-gray-100 transition-colors rounded-lg"
                    style={{
                      minWidth: '36px',
                      minHeight: '36px'
                    }}
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </Button>
                </div>
              </div>

              {/* Navigation Items */}
              <div className="p-4 space-y-2">
                {navigation.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Button
                        variant="ghost"
                        onClick={() => handleSectionSelect(item.id)}
                        className={cn(
                          "w-full justify-start p-4 h-auto transition-all duration-200 rounded-xl touch-manipulation",
                          "hover:bg-gray-100 active:scale-98",
                          isActive && "bg-purple-50 border-l-4 border-purple-500 shadow-sm"
                        )}
                      >
                        <div className="flex items-center space-x-4 w-full">
                          {/* Icon with gradient background */}
                          <div 
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200",
                              isActive ? "scale-110" : "scale-100"
                            )}
                            style={{
                              background: isActive 
                                ? `linear-gradient(135deg, ${item.gradient.split(' ').join(', ')})` 
                                : 'rgba(0, 0, 0, 0.03)'
                            }}
                          >
                            <Icon className={cn(
                              "w-5 h-5 transition-colors duration-200",
                              isActive ? "text-white" : "text-gray-600"
                            )} />
                          </div>

                          {/* Label and Description */}
                          <div className="flex-1 text-left">
                            <div className="flex items-center space-x-2">
                              <span className={cn(
                                "font-semibold transition-colors duration-200",
                                isActive ? "text-purple-700" : "text-gray-700"
                              )}>
                                {item.label}
                              </span>
                              {item.level && (
                                <Badge 
                                  variant="outline"
                                  className="text-xs border-yellow-500/50 text-yellow-400 bg-yellow-500/10"
                                >
                                  Lv. {item.level}+
                                </Badge>
                              )}
                              {item.isNew && (
                                <Badge 
                                  variant="outline"
                                  className="text-xs border-green-500/50 text-green-400 bg-green-500/10"
                                >
                                  New
                                </Badge>
                              )}
                            </div>
                            <p className={cn(
                              "text-xs mt-1 transition-colors duration-200",
                              isActive ? "text-purple-600" : "text-gray-500"
                            )}>
                              {item.description}
                            </p>
                          </div>

                          {/* Active indicator */}
                          {isActive && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-2 h-2 rounded-full bg-purple-500"
                            />
                          )}
                        </div>
                      </Button>
                    </motion.div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white/90">
                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start p-4 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl touch-manipulation"
                >
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mr-4">
                    <User className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Sign Out</div>
                    <div className="text-xs text-gray-500">Return to homepage</div>
                  </div>
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};