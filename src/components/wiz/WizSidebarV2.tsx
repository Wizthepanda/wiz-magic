import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Users,
  MessageCircle,
  Trophy,
  Sparkles,
  User,
  Crown,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  LogOut,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavItem {
  id: string;
  label: string;
  icon: any;
  route?: string;
  badge?: number;
  tooltip?: string;
  comingSoon?: boolean;
}

const primaryNav: NavItem[] = [
  {
    id: 'discover',
    label: 'Discover',
    icon: Compass,
    route: '/?section=discover',
    tooltip: 'Explore trending content'
  },
  {
    id: 'communities',
    label: 'Communities',
    icon: Users,
    route: '/?section=community',
    badge: 3,
    tooltip: 'Your communities and groups'
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageCircle,
    route: '/messages',
    badge: 2,
    tooltip: 'Chat & Collab with your members'
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    icon: Trophy,
    route: '/?section=leaderboard',
    tooltip: 'Top creators and earners'
  },
  {
    id: 'influencers',
    label: 'Influencers',
    icon: Sparkles,
    route: '/influencers',
    tooltip: 'Partner with creators, boost your reach',
    comingSoon: true
  }
];

const bottomNav: NavItem[] = [
  {
    id: 'premiere',
    label: 'WIZ Premiere',
    icon: Crown,
    route: '/?section=premiere',
    tooltip: 'Discover top-tier creators and trending launches'
  },
  {
    id: 'create',
    label: 'Create',
    icon: PlusCircle,
    route: '/create',
    tooltip: 'Create communities, courses, and products'
  }
];

// Mock joined communities - replace with real data
const mockCommunities = [
  {
    id: '1',
    name: 'Faceless Avatars',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=faceless',
    color: 'from-purple-500 to-pink-500',
    online: true
  },
  {
    id: '2',
    name: 'AI Creators',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ai',
    color: 'from-blue-500 to-cyan-500',
    online: true
  },
  {
    id: '3',
    name: 'Design School',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=design',
    color: 'from-green-500 to-emerald-500',
    online: false
  },
  {
    id: '4',
    name: 'WIZ XP Labs',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wiz',
    color: 'from-amber-500 to-orange-500',
    online: true
  },
  {
    id: '5',
    name: 'Chill Builders',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chill',
    color: 'from-red-500 to-pink-500',
    online: false
  }
];

interface WizSidebarV2Props {
  onNavigate?: (section: string) => void;
}

export const WizSidebarV2 = ({ onNavigate }: WizSidebarV2Props) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCommunitiesExpanded, setShowCommunitiesExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const isMobile = useIsMobile();

  const handleNavClick = (item: NavItem) => {
    if (item.comingSoon) return;

    if (item.route) {
      navigate(item.route);
    }
    if (onNavigate) {
      onNavigate(item.id);
    }
  };

  const isActive = (item: NavItem) => {
    if (item.route) {
      return location.pathname === item.route || location.search.includes(item.id);
    }
    return false;
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Mobile bottom nav bar
  if (isMobile) {
    return <MobileBottomNav onNavigate={onNavigate} />;
  }

  return (
    <motion.div
      animate={{ width: isExpanded ? 280 : 80 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className={cn(
        "fixed left-0 top-0 h-screen",
        "backdrop-blur-xl bg-white/10 border-r border-white/10",
        "shadow-[0_0_30px_rgba(0,0,0,0.1)]",
        "z-50 overflow-y-auto scrollbar-hide"
      )}
    >
      <div className="flex flex-col h-full p-4">
        {/* Logo & Toggle */}
        <div className="flex items-center justify-between mb-8">
          <AnimatePresence mode="wait">
            {isExpanded ? (
              <motion.div
                key="logo"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-bold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  WIZUP
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="icon"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center mx-auto"
              >
                <Sparkles className="w-5 h-5 text-white" />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isExpanded ? (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 space-y-2">
          {primaryNav.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={isActive(item)}
              isExpanded={isExpanded}
              onClick={() => handleNavClick(item)}
            />
          ))}

          {/* Profile Section */}
          <div className="py-2">
            <NavButton
              item={{
                id: 'profile',
                label: 'Profile',
                icon: User,
                route: '/?section=profile',
                tooltip: 'Your profile and settings'
              }}
              isActive={isActive({ id: 'profile', label: 'Profile', icon: User, route: '/?section=profile' })}
              isExpanded={isExpanded}
              onClick={() => handleNavClick({ id: 'profile', label: 'Profile', icon: User, route: '/?section=profile' })}
            />

            {/* Logout Button (embedded in Profile) */}
            <AnimatePresence>
              {isExpanded && (
                <motion.button
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onClick={handleLogout}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2 rounded-lg",
                    "text-sm text-gray-500 hover:text-red-500",
                    "hover:bg-red-50/50 transition-all duration-200",
                    "mt-1"
                  )}
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Your Communities Section */}
          <div className="py-4">
            <YourCommunitiesSection
              isExpanded={isExpanded}
              communities={mockCommunities}
              showExpanded={showCommunitiesExpanded}
              onToggleExpanded={() => setShowCommunitiesExpanded(!showCommunitiesExpanded)}
            />
          </div>
        </nav>

        {/* Bottom Navigation */}
        <div className="space-y-2 pt-4 border-t border-white/10">
          {bottomNav.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={isActive(item)}
              isExpanded={isExpanded}
              onClick={() => handleNavClick(item)}
              isAccent
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ========================================
// NAV BUTTON COMPONENT
// ========================================
interface NavButtonProps {
  item: NavItem;
  isActive: boolean;
  isExpanded: boolean;
  onClick: () => void;
  isAccent?: boolean;
}

const NavButton = ({ item, isActive, isExpanded, onClick, isAccent }: NavButtonProps) => {
  const Icon = item.icon;

  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={item.comingSoon}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl",
        "transition-all duration-200 relative group",
        isActive
          ? isAccent
            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/50"
            : "bg-white/10 text-gray-900 shadow-[inset_0_0_15px_rgba(155,93,229,0.3)]"
          : "text-gray-600 hover:bg-white/5 hover:text-gray-900",
        item.comingSoon && "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Active Glow */}
      {isActive && !isAccent && (
        <motion.div
          layoutId="activeGlow"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-sm"
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}

      {/* Icon with pulse animation for Create */}
      <div className="relative z-10">
        <Icon className={cn(
          "w-5 h-5",
          isActive && isAccent && "animate-pulse"
        )} />
        {item.badge && (
          <Badge className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 text-[10px] bg-red-500 text-white border-0">
            {item.badge}
          </Badge>
        )}
      </div>

      {/* Label */}
      <AnimatePresence mode="wait">
        {isExpanded && (
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="relative z-10 font-medium text-sm"
          >
            {item.label}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Coming Soon Badge */}
      {item.comingSoon && isExpanded && (
        <Badge className="ml-auto bg-amber-500/20 text-amber-600 text-xs">
          Soon
        </Badge>
      )}

      {/* Tooltip for collapsed state */}
      {!isExpanded && (
        <div className="absolute left-full ml-4 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
          {item.label}
          {item.comingSoon && ' (Coming Soon)'}
        </div>
      )}
    </motion.button>
  );
};

// ========================================
// YOUR COMMUNITIES SECTION
// ========================================
interface YourCommunitiesSectionProps {
  isExpanded: boolean;
  communities: typeof mockCommunities;
  showExpanded: boolean;
  onToggleExpanded: () => void;
}

const YourCommunitiesSection = ({
  isExpanded,
  communities,
  showExpanded,
  onToggleExpanded
}: YourCommunitiesSectionProps) => {
  const navigate = useNavigate();
  const visibleCommunities = showExpanded ? communities : communities.slice(0, 4);

  if (!isExpanded) {
    // Compact view: 3 avatars + "+2" badge
    return (
      <div className="flex flex-col items-center gap-2">
        {communities.slice(0, 3).map((community) => (
          <div key={community.id} className="relative">
            <Avatar className="w-8 h-8 border-2 border-white/20">
              <AvatarImage src={community.avatar} />
              <AvatarFallback className={cn("bg-gradient-to-br", community.color)}>
                {community.name[0]}
              </AvatarFallback>
            </Avatar>
            {community.online && (
              <div className="absolute bottom-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white" />
            )}
          </div>
        ))}
        {communities.length > 3 && (
          <Badge className="w-8 h-8 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center">
            +{communities.length - 3}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Your Communities
        </span>
      </div>

      {/* Communities List */}
      <div className="space-y-2 max-h-[240px] overflow-y-auto scrollbar-hide">
        {visibleCommunities.map((community, index) => (
          <motion.button
            key={community.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.02, x: 4 }}
            onClick={() => navigate(`/community/${community.id}`)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg",
              "hover:bg-white/5 transition-all duration-200 group"
            )}
          >
            <div className="relative">
              <Avatar className="w-7 h-7 border border-white/20">
                <AvatarImage src={community.avatar} />
                <AvatarFallback className={cn("bg-gradient-to-br text-white text-xs", community.color)}>
                  {community.name[0]}
                </AvatarFallback>
              </Avatar>
              {community.online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white" />
              )}
            </div>
            <span className="text-sm text-gray-700 truncate group-hover:text-gray-900">
              {community.name}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Show All / Show Less */}
      <button
        onClick={onToggleExpanded}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
      >
        {showExpanded ? (
          <>
            <span>Show Less</span>
            <ChevronLeft className="w-4 h-4" />
          </>
        ) : (
          <>
            <span>Show All</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </motion.div>
  );
};

// ========================================
// MOBILE BOTTOM NAV
// ========================================
interface MobileBottomNavProps {
  onNavigate?: (section: string) => void;
}

const MobileBottomNav = ({ onNavigate }: MobileBottomNavProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const mobileNavItems = [
    { id: 'discover', icon: Compass, route: '/?section=discover' },
    { id: 'communities', icon: Users, route: '/?section=community' },
    { id: 'create', icon: PlusCircle, route: '/create' },
    { id: 'profile', icon: User, route: '/?section=profile' }
  ];

  const handleNavClick = (item: any) => {
    navigate(item.route);
    if (onNavigate) {
      onNavigate(item.id);
    }
  };

  const isActive = (item: any) => {
    return location.pathname === item.route || location.search.includes(item.id);
  };

  return (
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "backdrop-blur-xl bg-white/80 border-t border-white/20",
        "shadow-[0_-4px_20px_rgba(0,0,0,0.1)]",
        "px-4 pb-safe"
      )}
    >
      <div className="flex items-center justify-around py-3">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item)}
              className="relative flex flex-col items-center gap-1"
            >
              <div className={cn(
                "relative p-3 rounded-2xl transition-all duration-200",
                active
                  ? item.id === 'create'
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/50 scale-110"
                    : "bg-white/20 text-gray-900"
                  : "text-gray-500"
              )}>
                <Icon className={cn(
                  "w-5 h-5",
                  active && item.id === 'create' && "text-white animate-pulse"
                )} />
              </div>
              {active && item.id !== 'create' && (
                <motion.div
                  layoutId="mobileActiveIndicator"
                  className="absolute bottom-0 w-1 h-1 rounded-full bg-gradient-to-r from-purple-600 to-pink-600"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Floating Create Button for Mobile */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/create')}
        className={cn(
          "absolute -top-8 left-1/2 -translate-x-1/2",
          "w-16 h-16 rounded-full",
          "bg-gradient-to-r from-purple-600 to-pink-600",
          "shadow-2xl shadow-purple-500/50",
          "flex items-center justify-center",
          "border-4 border-white"
        )}
      >
        <PlusCircle className="w-7 h-7 text-white" />
      </motion.button>
    </motion.div>
  );
};

export default WizSidebarV2;
