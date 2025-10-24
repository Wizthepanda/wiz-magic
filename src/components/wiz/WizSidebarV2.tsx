import { useState, useEffect } from 'react';
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
  ArrowRight,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { useConversations } from '@/hooks/useMessages';
import { useJoinedCommunities } from '@/hooks/useJoinedCommunities';
import { useCommunityNotifications } from '@/hooks/useCommunityNotifications';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { NotificationBadge } from './NotificationBadge';
import { useLayout } from '@/contexts/LayoutContext';

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
    route: '/discover',
    tooltip: 'Explore trending content'
  },
  {
    id: 'communities',
    label: 'Communities',
    icon: Users,
    route: '/community',
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
    route: '/leaderboard',
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
    route: '/premiere',
    tooltip: 'Discover top-tier creators and trending launches'
  },
  {
    id: 'create',
    label: 'Create',
    icon: PlusCircle,
    route: '/creator-studio',
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
  const { isSidebarExpanded, setSidebarExpanded } = useLayout();
  const [showCommunitiesExpanded, setShowCommunitiesExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { totalUnreadCount } = useConversations();
  const { data: joinedCommunities = [], isLoading: communitiesLoading } = useJoinedCommunities();
  const { getUnreadCount, getTotalUnreadCount, clearCommunityNotifications } = useCommunityNotifications();
  const isMobile = useIsMobile();

  // Update messages badge dynamically
  const primaryNavWithBadges = primaryNav.map((item) => {
    if (item.id === 'messages') {
      return { ...item, badge: totalUnreadCount > 0 ? totalUnreadCount : undefined };
    }
    if (item.id === 'communities') {
      const totalCommunityNotifications = getTotalUnreadCount();
      return { ...item, badge: totalCommunityNotifications > 0 ? totalCommunityNotifications : undefined };
    }
    return item;
  });

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
    try {
      // Show logging out toast
      toast.loading('Logging out...', { id: 'logout' });

      // Clear any local storage/session data
      localStorage.removeItem('youtube_access_token');
      localStorage.removeItem('wizxp_redirect_url');
      localStorage.removeItem('wizxp_youtube_connect');
      localStorage.removeItem('wizxp_youtube_reauth');

      // Sign out from Firebase
      await signOut();

      // Success toast
      toast.success('Logged out successfully', { id: 'logout' });

      // Navigate to home
      navigate('/', { replace: true });
    } catch (error) {
      console.error('❌ Logout error:', error);
      toast.error('Failed to logout. Please try again.', { id: 'logout' });
    }
  };

  // Mobile bottom nav bar
  if (isMobile) {
    return <MobileBottomNav onNavigate={onNavigate} />;
  }

  return (
    <motion.div
      animate={{ width: isSidebarExpanded ? 280 : 80 }}
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
            {isSidebarExpanded ? (
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
            onClick={() => setSidebarExpanded(!isSidebarExpanded)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {isSidebarExpanded ? (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>

        {/* Primary Navigation */}
        <nav className="flex-1 space-y-2">
          {primaryNavWithBadges.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              isActive={isActive(item)}
              isExpanded={isSidebarExpanded}
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
              isExpanded={isSidebarExpanded}
              onClick={() => handleNavClick({ id: 'profile', label: 'Profile', icon: User, route: '/?section=profile' })}
            />

            {/* Logout Button (embedded in Profile) */}
            <AnimatePresence>
              {isSidebarExpanded && (
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
              isExpanded={isSidebarExpanded}
              communities={joinedCommunities}
              isLoading={communitiesLoading}
              showExpanded={showCommunitiesExpanded}
              onToggleExpanded={() => setShowCommunitiesExpanded(!showCommunitiesExpanded)}
              onNavigate={navigate}
              getUnreadCount={getUnreadCount}
              clearCommunityNotifications={clearCommunityNotifications}
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
              isExpanded={isSidebarExpanded}
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
// YOUR COMMUNITIES SECTION - LIVE DATA
// ========================================
interface YourCommunitiesSectionProps {
  isExpanded: boolean;
  communities: any[];
  isLoading: boolean;
  showExpanded: boolean;
  onToggleExpanded: () => void;
  onNavigate: (path: string) => void;
  getUnreadCount: (communityId: string) => number;
  clearCommunityNotifications: (communityId: string) => Promise<void>;
}

const YourCommunitiesSection = ({
  isExpanded,
  communities,
  isLoading,
  showExpanded,
  onToggleExpanded,
  onNavigate,
  getUnreadCount,
  clearCommunityNotifications
}: YourCommunitiesSectionProps) => {
  const MAX_VISIBLE = 5;

  const handleCommunityClick = async (communityId: string) => {
    // Clear notifications for this community
    await clearCommunityNotifications(communityId);

    // Navigate to community page
    onNavigate(`/community/${communityId}`);
  };

  const handleViewAll = () => {
    onNavigate('/community');
  };

  // Helper function to get community name from various possible fields
  const getCommunityName = (community: any): string => {
    return community.name || community.title || community.communityName || 'Unnamed Community';
  };

  // Helper function to get community avatar from various possible fields
  // Priority: profileIcon (uploaded icon) > iconUrl > avatarUrl > banner > coverMedia thumbnail
  const getCommunityAvatar = (community: any): string | undefined => {
    return (
      community.profileIcon ||
      community.iconUrl ||
      community.avatarUrl ||
      community.icon ||
      community.avatar ||
      community.banner ||
      community.coverMedia?.[0]?.thumbnail ||
      community.coverMedia?.[0]?.url ||
      community.thumbnail ||
      community.image ||
      community.profileImage
    );
  };

  // Helper function to get member count
  const getMemberCount = (community: any): number => {
    return community.members?.length || community.memberCount || 0;
  };

  // Debug log to see community data structure (only in development)
  if (communities.length > 0 && import.meta.env.DEV) {
    console.log('🏘️ Communities data sample:', communities[0]);
  }

  // Show first 5 communities by default, all when expanded
  const visibleCommunities = showExpanded ? communities : communities.slice(0, MAX_VISIBLE);
  const hasMore = communities.length > MAX_VISIBLE;

  // Collapsed sidebar view
  if (!isExpanded) {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-100 animate-pulse" />
          <div className="w-8 h-8 rounded-full bg-purple-100 animate-pulse" />
        </div>
      );
    }

    if (communities.length === 0) {
      return (
        <div className="flex items-center justify-center">
          <button
            onClick={() => onNavigate('/community')}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center hover:scale-110 transition-transform"
          >
            <Users className="w-4 h-4 text-purple-600" />
          </button>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center gap-2">
        {communities.slice(0, 3).map((community) => {
          const unreadCount = getUnreadCount(community.id);
          return (
            <div key={community.id} className="relative">
              <Avatar className="w-8 h-8 rounded-xl border-2 border-white/20 cursor-pointer hover:scale-110 transition-transform" onClick={() => handleCommunityClick(community.id)}>
                <AvatarImage src={getCommunityAvatar(community)} className="object-cover" />
                <AvatarFallback className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold uppercase">
                  {getCommunityName(community)[0]?.toUpperCase() || 'C'}
                </AvatarFallback>
              </Avatar>
              <NotificationBadge count={unreadCount} />
            </div>
          );
        })}
        {communities.length > 3 && (
          <Badge className="w-8 h-8 rounded-full bg-purple-500 text-white text-xs flex items-center justify-center cursor-pointer hover:scale-110 transition-transform" onClick={handleViewAll}>
            +{communities.length - 3}
          </Badge>
        )}
      </div>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Communities</span>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full flex items-center gap-3 px-3 py-2">
              <div className="w-7 h-7 rounded-lg bg-purple-100 animate-pulse" />
              <div className="flex-1 h-4 bg-purple-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Empty state
  if (communities.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Communities</span>
        </div>
        <div className="px-3 py-6 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-xs text-gray-600">You haven't joined any communities yet.</p>
          <button onClick={handleViewAll} className="text-xs font-medium text-purple-600 hover:text-purple-700 flex items-center justify-center gap-1 mx-auto group">
            Explore and join one
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </motion.div>
    );
  }

  // Communities list
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Communities</span>
        <span className="text-xs text-gray-400">{communities.length}</span>
      </div>

      {/* Communities List */}
      <AnimatePresence mode="sync">
        <motion.div
          key={showExpanded ? 'expanded' : 'collapsed'}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className={cn("space-y-2 overflow-hidden", showExpanded ? "max-h-[350px] overflow-y-auto scrollbar-hide" : "")}
        >
          {visibleCommunities.map((community, index) => {
            const memberCount = getMemberCount(community);
            const unreadCount = getUnreadCount(community.id);
            return (
              <motion.button
                key={community.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                whileHover={{ scale: 1.02, x: 4 }}
                onClick={() => handleCommunityClick(community.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 group"
              >
                <div className="relative">
                  <Avatar className="w-8 h-8 rounded-xl border border-white/20">
                    <AvatarImage src={getCommunityAvatar(community)} className="object-cover" />
                    <AvatarFallback className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs font-bold uppercase">
                      {getCommunityName(community)[0]?.toUpperCase() || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  <NotificationBadge count={unreadCount} className="scale-90" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <span className="block text-sm text-gray-700 truncate group-hover:text-gray-900 font-medium">
                    {getCommunityName(community)}
                  </span>
                  {memberCount > 0 && (
                    <span className="block text-xs text-gray-500">
                      {memberCount} {memberCount === 1 ? 'member' : 'members'}
                    </span>
                  )}
                </div>
                <ArrowRight className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      <div className="space-y-2">
        {hasMore && (
          <button onClick={onToggleExpanded} className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50/30 rounded-lg transition-all">
            {showExpanded ? (
              <>
                <span>Show Less</span>
                <ChevronUp className="w-3 h-3" />
              </>
            ) : (
              <>
                <span>Show All ({communities.length})</span>
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>
        )}
        {showExpanded && communities.length > MAX_VISIBLE && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleViewAll} className="w-full px-3 py-2 text-xs font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition-all flex items-center justify-center gap-2 group">
            All Communities
            <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </motion.button>
        )}
      </div>
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
    { id: 'discover', icon: Compass, route: '/discover' },
    { id: 'communities', icon: Users, route: '/community' },
    { id: 'create', icon: PlusCircle, route: '/creator-studio' },
    { id: 'profile', icon: User, route: '/profile' }
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
        onClick={() => navigate('/creator-studio')}
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
