import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSafeNavigate } from '@/hooks/useSafeNavigate';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  Compass,
  Users,
  Plus,
  Trophy,
  Gift,
  User,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  Sparkles,
  Minimize2,
  Crown,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

interface WizSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

// Sidebar variant type
type SidebarVariant = 'glassmorphic' | 'minimal';

export const WizSidebar = ({ activeSection, onSectionChange }: WizSidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [sidebarVariant, setSidebarVariant] = useState<SidebarVariant>('glassmorphic');
  const { signOut, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useSafeNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.reload();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Core navigation with Apple-like simplicity
  const navigation = [
    { id: 'discover', label: 'Discover', icon: Compass },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'claim', label: 'ZAP Rewards', icon: Gift, route: '/claim' },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'premiere', label: 'WIZ Premiere', icon: Crown },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Separate Create section
  const createNavigation = [
    { id: 'create', label: 'Create', icon: Plus },
  ];

  const handleNavigation = (item: any) => {
    if (item.route) {
      navigate(item.route);
    } else {
      if (location.pathname === '/claim') {
        navigate(`/?section=${item.id}`);
      } else {
        onSectionChange(item.id);
      }
    }
  };

  // Seamless styling - no backgrounds
  const getVariantStyles = () => {
    return {
      background: 'transparent',
      border: 'none',
      boxShadow: 'none'
    };
  };

  const getItemStyles = (isActive: boolean) => {
    return {
      base: cn(
        "transition-all duration-300 rounded-2xl relative",
        isActive
          ? "text-indigo-600 bg-white/8 backdrop-blur-lg border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.06)] ring-1 ring-indigo-500/15"
          : "text-gray-700 hover:text-indigo-600 hover:bg-white/5 hover:backdrop-blur-lg hover:ring-1 hover:ring-indigo-500/10"
      ),
      glow: isActive
    };
  };

  return (
    <>
      {/* Mobile Toggle */}
      <motion.div
        className="fixed top-4 left-4 z-50 lg:hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "h-11 w-11 p-0 rounded-xl transition-all duration-300",
            sidebarVariant === 'glassmorphic' && "backdrop-blur-md",
            theme === 'dark'
              ? "bg-gray-900/80 border-gray-700/50 shadow-black/20"
              : "bg-white/12 border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.04)]"
          )}
        >
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {isExpanded ? (
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            )}
          </motion.div>
        </Button>
      </motion.div>

      {/* WIZUP V4.0 Premium Dual-Variant Sidebar */}
      <motion.aside
        className={cn(
          "flex flex-col h-screen transition-all duration-300 ease-out relative",
          isExpanded ? "w-64" : "w-20",
          "lg:block lg:sticky lg:top-0",
          isExpanded ? "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:w-64 max-lg:z-40" : "max-lg:hidden"
        )}
        style={{
          ...getVariantStyles(),
          background: 'transparent'
        }}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {/* Glassmorphic Background Effects */}
        {sidebarVariant === 'glassmorphic' && (
          <div className="absolute inset-0 overflow-hidden">
            {/* Animated gradient orbs */}
            <motion.div
              className="absolute w-32 h-32 rounded-full opacity-20"
              style={{
                background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                filter: 'blur(40px)'
              }}
              animate={{
                x: [0, 50, 0],
                y: [0, -30, 0],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute bottom-0 right-0 w-24 h-24 rounded-full opacity-15"
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #8b5cf6)',
                filter: 'blur(30px)'
              }}
              animate={{
                x: [0, -40, 0],
                y: [0, 40, 0],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
          </div>
        )}

        {/* Profile Section at Top */}
        <div className="relative z-10 flex-shrink-0 p-6">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            {/* Enhanced Avatar */}
            <motion.div
              className={cn(
                "rounded-2xl flex items-center justify-center relative overflow-hidden",
                isExpanded ? "w-12 h-12 mr-4" : "w-14 h-14 mx-auto"
              )}
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                boxShadow: sidebarVariant === 'glassmorphic'
                  ? theme === 'dark'
                    ? `0 8px 32px rgba(99, 102, 241, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)`
                    : `0 8px 32px rgba(79, 70, 229, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.5)`
                  : theme === 'dark'
                    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                    : '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
              whileHover={{
                scale: isExpanded ? 1.05 : 1.08,
                boxShadow: sidebarVariant === 'glassmorphic'
                  ? theme === 'dark'
                    ? '0 12px 40px rgba(99, 102, 241, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                    : '0 12px 40px rgba(79, 70, 229, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.6)'
                  : theme === 'dark'
                    ? '0 6px 16px rgba(0, 0, 0, 0.4)'
                    : '0 6px 16px rgba(0, 0, 0, 0.15)'
              }}
              transition={{ duration: 0.2 }}
            >
              <motion.span
                className="text-white font-bold relative z-10"
                animate={{
                  fontSize: isExpanded ? '1.125rem' : '1.25rem'
                }}
                transition={{ duration: 0.3 }}
              >
                {user?.displayName?.[0] || user?.email?.[0] || 'W'}
              </motion.span>

              {/* Glassmorphic shimmer effect */}
              {sidebarVariant === 'glassmorphic' && !isExpanded && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 5,
                    ease: "easeInOut"
                  }}
                />
              )}
            </motion.div>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <h2 className={cn(
                    "text-xl font-semibold",
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  )}>
                    {user?.displayName || user?.email?.split('@')[0] || 'WIZUP'}
                  </h2>
                  <p className={cn(
                    "text-sm",
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  )}>
                    Profile
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>


        {/* Navigation Section */}
        <nav className="relative z-10 flex-1 px-6 py-8 overflow-y-auto">
          <div className="space-y-3">
            {navigation.map((item, index) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;
              const itemStyles = getItemStyles(isActive);


              // Regular navigation items
              return (
                <Tooltip.Provider key={item.id} delayDuration={400}>
                  <Tooltip.Root>
                    <Tooltip.Trigger asChild>
                      <motion.button
                        onClick={() => handleNavigation(item)}
                        className={cn(
                          "w-full flex items-center group",
                          isExpanded ? "px-4 py-4" : "px-3 py-4 justify-center",
                          itemStyles.base
                        )}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          duration: 0.4,
                          delay: index * 0.08,
                          ease: "easeOut"
                        }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Glassmorphic glow effect */}
                        {itemStyles.glow && (
                          <motion.div
                            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/30 to-cyan-400/30"
                            style={{ filter: 'blur(8px)' }}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}

                        {/* Active indicator for minimal variant */}
                        {isActive && sidebarVariant === 'minimal' && (
                          <motion.div
                            className="absolute left-0 top-1/2 w-1 bg-violet-500 rounded-r-full"
                            style={{ height: '60%', transform: 'translateY(-50%)' }}
                            initial={{ scaleY: 0 }}
                            animate={{ scaleY: 1 }}
                            transition={{ duration: 0.3 }}
                          />
                        )}

                        <motion.div
                          className="relative z-10 flex items-center"
                          whileHover={{ x: 2, scale: 1.05 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon
                            className={cn(
                              "w-6 h-6 transition-all duration-200",
                              isExpanded ? "mr-4" : "mx-auto",
                              isActive && sidebarVariant === 'minimal' && "text-violet-600 dark:text-violet-400",
                              "hover:text-indigo-500 hover:drop-shadow-lg"
                            )}
                            strokeWidth={1.5}
                          />

                          <AnimatePresence>
                            {isExpanded && (
                              <motion.span
                                className={cn(
                                  "font-medium text-base",
                                  isActive && sidebarVariant === 'minimal' && "text-violet-600 dark:text-violet-400"
                                )}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                              >
                                {item.label}
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      </motion.button>
                    </Tooltip.Trigger>

                    {/* Clean tooltips for collapsed state */}
                    {!isExpanded && (
                      <Tooltip.Portal>
                        <Tooltip.Content
                          side="right"
                          sideOffset={16}
                          className="z-50 overflow-hidden rounded-xl border-0 px-4 py-2"
                          style={{
                            background: sidebarVariant === 'glassmorphic'
                              ? theme === 'dark'
                                ? 'rgba(17, 24, 39, 0.95)'
                                : 'rgba(255, 255, 255, 0.95)'
                              : theme === 'dark'
                                ? '#1f2937'
                                : '#ffffff',
                            backdropFilter: sidebarVariant === 'glassmorphic' ? 'blur(16px)' : 'none',
                            border: theme === 'dark'
                              ? '1px solid rgba(75, 85, 99, 0.3)'
                              : '1px solid rgba(229, 231, 235, 0.8)',
                            boxShadow: theme === 'dark'
                              ? '0 10px 25px rgba(0, 0, 0, 0.3)'
                              : '0 10px 25px rgba(0, 0, 0, 0.1)'
                          }}
                        >
                          <motion.span
                            className={cn(
                              "font-medium text-sm",
                              theme === 'dark' ? 'text-white' : 'text-gray-900'
                            )}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.15 }}
                          >
                            {item.label}
                          </motion.span>
                        </Tooltip.Content>
                      </Tooltip.Portal>
                    )}
                  </Tooltip.Root>
                </Tooltip.Provider>
              );
            })}
          </div>

        </nav>

        {/* Bottom Section */}
        <div className="relative z-10 flex-shrink-0 px-6 py-6 space-y-4">
          {/* Create Button */}
          {createNavigation.map((item, index) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;

            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavigation(item)}
                className={cn(
                  "w-full flex items-center transition-all duration-300 rounded-2xl group",
                  isExpanded ? "px-4 py-3" : "px-3 py-3 justify-center",
                  "text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200",
                  sidebarVariant === 'glassmorphic'
                    ? "hover:bg-white/10 dark:hover:bg-white/5"
                    : "hover:bg-gray-100 dark:hover:bg-gray-800"
                )}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Icon className={cn("w-5 h-5", isExpanded ? "mr-3" : "mx-auto")} strokeWidth={1.5} />

                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      className="font-medium text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}

          {/* Logout Button */}
          <motion.button
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center transition-all duration-300 rounded-2xl group",
              isExpanded ? "px-4 py-3" : "px-3 py-3 justify-center",
              "text-red-500 hover:text-red-600",
              sidebarVariant === 'glassmorphic'
                ? "hover:bg-red-500/10"
                : "hover:bg-red-50 dark:hover:bg-red-900/20"
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className={cn("w-5 h-5", isExpanded ? "mr-3" : "mx-auto")} strokeWidth={1.5} />

            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  className="font-medium text-sm"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  Logout
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Collapse/Expand Button */}
          <div className="flex justify-center pt-4">
            <motion.button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                "flex items-center justify-center rounded-full transition-all duration-300",
                isExpanded ? "w-10 h-10" : "w-12 h-12",
                sidebarVariant === 'glassmorphic'
                  ? theme === 'dark'
                    ? "bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white"
                    : "bg-white/50 hover:bg-white/70 text-gray-600 hover:text-gray-900"
                  : theme === 'dark'
                    ? "bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-gray-200"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900"
              )}
              style={{
                backdropFilter: sidebarVariant === 'glassmorphic' ? 'blur(16px)' : 'none',
                boxShadow: sidebarVariant === 'glassmorphic'
                  ? theme === 'dark'
                    ? '0 4px 16px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                  : theme === 'dark'
                    ? '0 4px 12px rgba(0, 0, 0, 0.3)'
                    : '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}
              whileHover={{
                scale: 1.1,
                boxShadow: sidebarVariant === 'glassmorphic'
                  ? theme === 'dark'
                    ? '0 6px 20px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                    : '0 6px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                  : theme === 'dark'
                    ? '0 6px 16px rgba(0, 0, 0, 0.4)'
                    : '0 6px 16px rgba(0, 0, 0, 0.15)'
              }}
              whileTap={{ scale: 0.9 }}
            >
              <motion.div
                animate={{ rotate: isExpanded ? 0 : 180 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {isExpanded ? (
                  <ChevronLeft className="w-5 h-5" strokeWidth={1.5} />
                ) : (
                  <ChevronRight className="w-5 h-5" strokeWidth={1.5} />
                )}
              </motion.div>
            </motion.button>
          </div>
        </div>
      </motion.aside>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="fixed inset-0 bg-black/40 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setIsExpanded(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </AnimatePresence>
    </>
  );
};