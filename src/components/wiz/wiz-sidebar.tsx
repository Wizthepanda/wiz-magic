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
  ChevronRight,
  Sparkles,
  Wand2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

interface WizSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export const WizSidebar = ({ activeSection, onSectionChange }: WizSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed on mobile
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
      {/* Mobile Toggle with Liquid Glass Styling */}
      <motion.div
        className="fixed top-4 left-4 z-50 lg:hidden"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-10 w-10 p-0 rounded-full transition-all duration-300"
          style={{
            background: `
              linear-gradient(135deg, rgba(230, 230, 250, 0.9) 0%, rgba(147, 51, 234, 0.8) 100%),
              rgba(255, 255, 255, 0.9)
            `,
            backdropFilter: 'blur(25px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 4px 16px rgba(147, 51, 234, 0.2)'
          }}
        >
          <motion.div
            animate={{ rotate: isCollapsed ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            {isCollapsed ? <Menu className="w-4 h-4 text-indigo-700" /> : <X className="w-4 h-4 text-indigo-700" />}
          </motion.div>
        </Button>
      </motion.div>

      {/* Liquid Glassmorphic Sidebar */}
      <motion.aside 
        className={cn(
          "h-screen transition-all duration-500 z-40 overflow-hidden",
          // Desktop: always visible, collapsible width
          "hidden lg:block lg:sticky lg:top-0 lg:left-0",
          isCollapsed ? "lg:w-20" : "lg:w-72",
          // Mobile: full overlay when open, hidden when closed
          "lg:translate-x-0",
          isCollapsed ? "max-lg:hidden" : "max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:w-72 max-lg:translate-x-0"
        )}
        style={{
          background: `
            linear-gradient(135deg, rgba(230, 230, 250, 0.15) 0%, rgba(25, 25, 112, 0.05) 100%),
            rgba(255, 255, 255, 0.08)
          `,
          backdropFilter: 'blur(40px)',
          borderRight: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 20px 60px rgba(147, 51, 234, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Liquid Glass Background Pattern */}
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
              radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)
            `
          }}
          animate={{
            background: [
              `radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
               radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)`,
              `radial-gradient(circle at 30% 80%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 70% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
               radial-gradient(circle at 40% 60%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)`,
              `radial-gradient(circle at 20% 30%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
               radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.08) 0%, transparent 50%),
               radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.06) 0%, transparent 50%)`
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <div className="relative flex flex-col h-full z-10">
          {/* Liquid Glass Logo Section */}
          <motion.div 
            className={cn("p-6 relative", isCollapsed && "px-4")}
            style={{
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className={cn("flex items-center", isCollapsed ? "justify-center" : "space-x-3")}>
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ duration: 0.3 }}
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center shadow-2xl border border-white/20"
                  style={{
                    background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%)',
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 32px rgba(147, 51, 234, 0.3)'
                  }}
                >
                  <Wand2 className="w-5 h-5 text-white" />
                </div>
                
                {/* Sparkle Effect */}
                <motion.div
                  className="absolute -top-1 -right-1"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 180, 360]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Sparkles className="w-3 h-3 text-yellow-400" />
                </motion.div>
              </motion.div>
              
              <AnimatePresence>
                {!isCollapsed && (
                  <motion.span 
                    className="text-2xl font-bold text-gray-800"
                    style={{
                      background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.9) 0%, rgba(99, 102, 241, 0.8) 50%, rgba(139, 92, 246, 0.9) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    WIZ
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Liquid Glass Navigation */}
          <nav className={cn("flex-1 space-y-3", isCollapsed ? "p-3" : "p-6")}>
            {navigation.map((item, index) => (
              <motion.div 
                key={item.id} 
                className="relative group"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
              >
                <motion.button
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "w-full relative transition-all duration-500 overflow-hidden",
                    isCollapsed ? "h-14 px-0 rounded-xl" : "h-12 px-4 rounded-2xl"
                  )}
                  style={{
                    background: activeSection === item.id 
                      ? `
                          linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(99, 102, 241, 0.15) 100%),
                          rgba(255, 255, 255, 0.1)
                        `
                      : `
                          linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)
                        `,
                    backdropFilter: 'blur(20px)',
                    border: activeSection === item.id 
                      ? '1px solid rgba(147, 51, 234, 0.3)' 
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: activeSection === item.id 
                      ? '0 8px 32px rgba(147, 51, 234, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                      : '0 4px 16px rgba(0, 0, 0, 0.05)'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -2,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.background = `
                        linear-gradient(135deg, rgba(147, 51, 234, 0.1) 0%, rgba(99, 102, 241, 0.08) 100%),
                        rgba(255, 255, 255, 0.08)
                      `;
                      e.currentTarget.style.border = '1px solid rgba(147, 51, 234, 0.2)';
                      e.currentTarget.style.boxShadow = '0 8px 32px rgba(147, 51, 234, 0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeSection !== item.id) {
                      e.currentTarget.style.background = `
                        linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)
                      `;
                      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.05)';
                    }
                  }}
                >
                  {/* Active Background Shimmer */}
                  {activeSection === item.id && (
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: `
                          linear-gradient(45deg, 
                            transparent 30%, 
                            rgba(255, 255, 255, 0.1) 50%, 
                            transparent 70%
                          )
                        `
                      }}
                      animate={{
                        x: ['-100%', '100%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 3,
                        ease: "easeInOut"
                      }}
                    />
                  )}

                  <div className={cn(
                    "flex items-center relative z-10",
                    isCollapsed ? "justify-center" : "justify-start space-x-3"
                  )}>
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <item.icon 
                        className={cn(
                          "w-5 h-5 transition-colors duration-300",
                          activeSection === item.id 
                            ? "text-indigo-600" 
                            : "text-gray-600 group-hover:text-indigo-500"
                        )} 
                      />
                    </motion.div>
                    
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.div 
                          className="flex-1 flex items-center justify-between"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          <span className={cn(
                            "font-medium transition-colors duration-300",
                            activeSection === item.id 
                              ? "text-gray-800" 
                              : "text-gray-600 group-hover:text-gray-800"
                          )}>
                            {item.label}
                          </span>
                          {item.level && (
                            <motion.span 
                              className="px-2 py-1 text-xs font-bold text-white rounded-full"
                              style={{
                                background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(255, 193, 7, 0.9) 100%)',
                                boxShadow: '0 2px 8px rgba(255, 215, 0, 0.3)'
                              }}
                              whileHover={{ scale: 1.05 }}
                            >
                              Lv{item.level}+
                            </motion.span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
                
                {/* Enhanced Tooltip for collapsed state */}
                <AnimatePresence>
                  {isCollapsed && (
                    <motion.div 
                      className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 text-sm rounded-xl pointer-events-none whitespace-nowrap z-50 opacity-0 group-hover:opacity-100"
                      style={{
                        background: `
                          linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(50, 50, 50, 0.9) 100%)
                        `,
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                      }}
                      initial={{ opacity: 0, x: -10, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -10, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-gray-200 font-medium">{item.label}</span>
                      {item.level && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                          Lv{item.level}+
                        </span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </nav>

          {/* Liquid Glass Bottom Section */}
          <motion.div 
            className="relative"
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            {/* Logout Button */}
            <div className={cn(isCollapsed ? "p-3" : "p-6 pb-3")}>
              <motion.div className="relative group">
                <motion.button
                  onClick={handleLogout}
                  className={cn(
                    "w-full relative transition-all duration-500 overflow-hidden",
                    isCollapsed ? "h-14 px-0 rounded-xl" : "h-12 px-4 rounded-2xl"
                  )}
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
                  }}
                  whileHover={{ 
                    scale: 1.02,
                    y: -2,
                    transition: { duration: 0.3 }
                  }}
                  whileTap={{ scale: 0.98 }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `
                      linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.08) 100%),
                      rgba(255, 255, 255, 0.08)
                    `;
                    e.currentTarget.style.border = '1px solid rgba(239, 68, 68, 0.2)';
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(239, 68, 68, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `
                      linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)
                    `;
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.05)';
                  }}
                >
                  <div className={cn(
                    "flex items-center relative z-10",
                    isCollapsed ? "justify-center" : "justify-start space-x-3"
                  )}>
                    <motion.div
                      className="relative"
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ duration: 0.2 }}
                    >
                      <LogOut className="w-5 h-5 text-gray-600 group-hover:text-red-500 transition-colors duration-300" />
                    </motion.div>
                    
                    <AnimatePresence>
                      {!isCollapsed && (
                        <motion.span 
                          className="font-medium text-gray-600 group-hover:text-red-500 transition-colors duration-300"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          Logout
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
                
                {/* Enhanced Logout Tooltip */}
                <AnimatePresence>
                  {isCollapsed && (
                    <motion.div 
                      className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 text-sm rounded-xl pointer-events-none whitespace-nowrap z-50 opacity-0 group-hover:opacity-100"
                      style={{
                        background: `
                          linear-gradient(135deg, rgba(30, 30, 30, 0.95) 0%, rgba(50, 50, 50, 0.9) 100%)
                        `,
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)'
                      }}
                      initial={{ opacity: 0, x: -10, scale: 0.9 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -10, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="text-red-400 font-medium">Logout</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>

            {/* Collapse Toggle (Desktop) */}
            <div className={cn("hidden md:block", isCollapsed ? "p-3 pt-0" : "p-6 pt-3")}>
              <motion.button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="w-full h-10 relative transition-all duration-500 overflow-hidden rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.05)'
                }}
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: '0 8px 32px rgba(147, 51, 234, 0.1)',
                  transition: { duration: 0.3 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className="flex items-center justify-center text-gray-500 hover:text-indigo-500 transition-colors duration-300"
                  animate={{ 
                    rotate: isCollapsed ? 0 : 180,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ 
                    rotate: { duration: 0.3 },
                    scale: { duration: 2, repeat: Infinity }
                  }}
                >
                  <ChevronRight className="w-4 h-4" />
                </motion.div>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.aside>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div 
            className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setIsCollapsed(true)}
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